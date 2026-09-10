/**
 * Gmail -> ledger.
 *
 * Lists every thread the team mailbox started, groups them by organisation,
 * lets the rules establish the facts, asks the model about threads a person
 * answered (only when something changed since last time), reapplies the
 * roster and any human override, and stores the result.
 */
import { getThread, listThreads, mailbox, outreachQuery, pooled, type Thread } from "./gmail";
import {
  addressesIn,
  deliveryFacts,
  displayName,
  extractAsk,
  firstAddress,
  greetingName,
  isOurs,
  modelConfigured,
  modelName,
  modelVerdict,
  rulesVerdict,
  threadText,
} from "./classify";
import { ROSTER, nameFromKey, rosterKey } from "./roster";
import { loadLedger, saveLedger } from "./store";
import type { Company, Contact, Ledger, SyncReport, Verdict } from "./types";

function firstSent(thread: Thread, me: string) {
  return thread.messages.find((m) => isOurs(m, me)) ?? thread.messages[0];
}

/** Everything we wrote to in these threads, in the order we wrote to it. */
function recipientsOf(threads: Thread[], me: string): string[] {
  const seen = new Set<string>();
  for (const t of threads) {
    for (const m of t.messages) {
      if (!isOurs(m, me)) continue;
      for (const a of addressesIn(`${m.to} ${m.cc} ${m.bcc}`)) if (a !== me) seen.add(a);
    }
  }
  return [...seen];
}

function buildCompany(key: string, threads: Thread[], me: string, previous: Company | undefined): {
  company: Company;
  humanReplied: boolean;
  changed: boolean;
  autoFrom: string[];
  text: () => string;
} {
  threads.sort((a, b) => a.messages[0].date.localeCompare(b.messages[0].date));
  const opening = firstSent(threads[0], me);
  const recipients = recipientsOf(threads, me);
  const roster = ROSTER[key];

  const facts = {
    bounced: new Set<string>(),
    auto: new Set<string>(),
    replied: new Set<string>(),
    lastHuman: null as string | null,
    humanReplies: 0,
  };
  const autoFrom: string[] = [];
  for (const t of threads) {
    const f = deliveryFacts(t, me);
    for (const a of f.bounced) facts.bounced.add(a);
    for (const a of f.auto) facts.auto.add(a);
    for (const a of f.replied) facts.replied.add(a);
    if (f.lastHuman) facts.lastHuman = f.lastHuman;
    facts.humanReplies += f.humanReplies;
    for (const m of t.messages) {
      if (!isOurs(m, me) && f.auto.has(firstAddress(m.from))) {
        const who = displayName(m.from) || firstAddress(m.from);
        if (!autoFrom.includes(who)) autoFrom.push(who);
      }
    }
  }

  // Names: whoever replied signs their reply; otherwise the greeting in our
  // own email names the person we wrote to; otherwise the inbox itself.
  const replyNames = new Map<string, string>();
  for (const t of threads) {
    for (const m of t.messages) {
      if (isOurs(m, me)) continue;
      const a = firstAddress(m.from);
      const n = displayName(m.from);
      if (a && n && !/^(support|info|team|hello)$/i.test(n)) replyNames.set(a, n);
    }
  }
  const greeted = greetingName(opening.body);
  const contacts: Contact[] = recipients.map((email, i) => {
    const local = email.split("@")[0];
    const name =
      replyNames.get(email) ??
      (i === 0 && greeted ? greeted : local.replace(/[._+-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
    const delivery = facts.bounced.has(email)
      ? "bounced"
      : facts.replied.has(email)
        ? "replied"
        : facts.auto.has(email)
          ? "auto"
          : "sent";
    return { name, email, delivery };
  });
  // A person can answer from an address we never wrote to (a colleague, a
  // personal account). They belong on the card too.
  for (const a of facts.replied) {
    if (!contacts.some((c) => c.email === a)) {
      contacts.push({ name: replyNames.get(a) ?? a, email: a, delivery: "replied" });
    }
  }

  const all = threads.flatMap((t) => t.messages);
  const latest = threads.reduce((a, b) =>
    (a.messages.at(-1)?.date ?? "") >= (b.messages.at(-1)?.date ?? "") ? a : b,
  );
  const lastMessageId = threads.map((t) => t.lastMessageId).join("+");
  // A free-mail sender's domain says nothing about them; their roster
  // website does.
  const domain = roster?.website
    ? new URL(roster.website).hostname.replace(/^www\./, "")
    : key.includes("@")
      ? key.split("@")[1]
      : key;

  const company: Company = {
    id: key,
    name: roster?.name ?? nameFromKey(key),
    domain,
    website: roster?.website ?? (key.includes("@") ? null : `https://${domain}`),
    kind: roster?.kind ?? "company",
    description: roster?.description ?? "",
    ask: extractAsk(opening.body),
    subject: opening.subject,
    status: "waiting",
    converted: false,
    signalTone: null,
    replyFrom: null,
    signal: null,
    nextStep: null,
    contactedOn: opening.date,
    lastActivity: all.map((m) => m.date).sort().at(-1) ?? opening.date,
    gmailThread: latest.id,
    lastMessageId,
    verdictBy: "rules",
    messages: all.length,
    contacts,
  };

  return {
    company,
    humanReplied: facts.humanReplies > 0,
    changed: previous?.lastMessageId !== lastMessageId,
    autoFrom,
    text: () => threadText(threads),
  };
}

function applyVerdict(company: Company, verdict: Verdict, by: Company["verdictBy"]) {
  company.status = verdict.status;
  company.signalTone = verdict.signalTone;
  company.replyFrom = verdict.replyFrom;
  company.signal = verdict.signal;
  company.nextStep = verdict.nextStep;
  company.verdictBy = by;
}

function applyOverride(company: Company) {
  const o = ROSTER[company.id]?.override;
  if (!o) return;
  if (o.status) company.status = o.status;
  if (o.converted !== undefined) company.converted = o.converted;
  if (o.signal) company.signal = o.signal;
  if (o.nextStep !== undefined) company.nextStep = o.nextStep;
  company.signalTone = company.status === "active" ? "positive" : company.status === "rejected" ? "rejected" : null;
  company.verdictBy = "override";
  company.overrideReason = o.reason;
  if (company.converted) company.status = "active";
}

export async function syncOutreach(opts: { force?: boolean } = {}): Promise<{ ledger: Ledger; report: SyncReport }> {
  const startedAt = new Date().toISOString();
  const me = mailbox();
  const errors: string[] = [];
  const previous = await loadLedger();
  const before = new Map(previous.companies.map((c) => [c.id, c]));

  const ids = await listThreads(outreachQuery());
  const threads = (await pooled(ids, 4, async (id) => {
    try {
      return await getThread(id);
    } catch (e) {
      errors.push(`thread ${id}: ${(e as Error).message}`);
      return null;
    }
  })).filter((t): t is Thread => !!t && t.messages.length > 0);

  // Only threads we started are outreach. A reply we sent in someone else's
  // thread (a judge writing in, say) is not a letter we wrote.
  const ours = threads.filter((t) => isOurs(t.messages[0], me));

  const groups = new Map<string, Thread[]>();
  for (const t of ours) {
    const to = addressesIn(`${firstSent(t, me).to} ${firstSent(t, me).cc}`).find((a) => a !== me);
    if (!to) continue;
    const key = rosterKey(to);
    groups.set(key, [...(groups.get(key) ?? []), t]);
  }

  let classified = 0;
  let reused = 0;
  const useModel = modelConfigured();
  const companies: Company[] = [];

  for (const [key, group] of groups) {
    const prev = before.get(key);
    const built = buildCompany(key, group, me, prev);
    const { company } = built;
    if (!built.humanReplied) {
      const bounced = new Set(company.contacts.filter((c) => c.delivery === "bounced").map((c) => c.email));
      const recipients = company.contacts.map((c) => c.email);
      applyVerdict(company, rulesVerdict(bounced, recipients, company.contactedOn, built.autoFrom), "rules");
    } else if (prev && prev.signal && !built.changed && !opts.force && prev.verdictBy !== "rules") {
      applyVerdict(company, {
        status: prev.status, signalTone: prev.signalTone, replyFrom: prev.replyFrom,
        signal: prev.signal, nextStep: prev.nextStep,
      }, prev.verdictBy === "override" ? "model" : prev.verdictBy);
      reused++;
    } else if (useModel) {
      const out = await modelVerdict(company.name, built.text());
      if (out.ok) {
        applyVerdict(company, out.verdict, "model");
        classified++;
      } else {
        errors.push(`${company.name}: ${out.error}`);
        if (prev?.signal) {
          applyVerdict(company, { status: prev.status, signalTone: prev.signalTone, replyFrom: prev.replyFrom, signal: prev.signal, nextStep: prev.nextStep }, prev.verdictBy);
        } else {
          applyVerdict(company, humanFallback(company), "rules");
        }
      }
    } else {
      applyVerdict(company, humanFallback(company), "rules");
    }

    applyOverride(company);
    companies.push(company);
  }

  companies.sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));

  const finishedAt = new Date().toISOString();
  const report: SyncReport = {
    startedAt,
    finishedAt,
    threads: ours.length,
    companies: companies.length,
    classified,
    reused,
    model: useModel ? modelName() : null,
    errors,
  };
  const ledger: Ledger = { mailbox: me, syncedAt: finishedAt, companies, lastSync: report };
  await saveLedger(ledger);
  return { ledger, report };
}

/** A person answered but no model is configured (or it failed): say so
 *  honestly rather than guessing at the tone. */
function humanFallback(company: Company): Verdict {
  const who = company.contacts.find((c) => c.delivery === "replied");
  return {
    status: "active",
    signalTone: null,
    replyFrom: who?.name ?? null,
    signal: `${who?.name ?? "Someone"} replied on this thread. The reply has not been read by the model, so open the thread in Gmail to see what they said.`,
    nextStep: "Read the reply in Gmail and answer it. Set OPENAI_API_KEY to have replies summarised here.",
  };
}

