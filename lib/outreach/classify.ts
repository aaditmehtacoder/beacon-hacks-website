/**
 * What a thread proves, and what it means.
 *
 * The rules decide facts: which addresses bounced, which sent an automated
 * receipt, which were answered by a person. The model (OpenAI, when a key is
 * set) reads only threads a human answered, and decides whether that answer
 * left the door open, closed it, and what to do next. Threads nobody answered
 * get a plain verdict written by the rules, so a sync costs nothing for them.
 */
import type { Message, Thread } from "./gmail";
import type { Verdict } from "./types";

export const ADDRESS = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;

const BOUNCE_FROM = /mailer-daemon|postmaster|delivery status notification|undeliverable/i;
const BOUNCE_TEXT = /address not found|wasn'?t delivered|couldn'?t be delivered|undeliverable|delivery (has )?failed|550[- ]5\.1\.1|does not exist|user unknown/i;

const AUTO_FROM = /no-?reply|donotreply|do-not-reply|notifications?@|\+noreply/i;
const AUTO_TEXT =
  /this is an automated (response|bot|message|reply|email)|automated bot|auto-?reply|autoreply|automatic reply|out of (the )?office|we('ve| have) received your (request|message|email|enquiry|inquiry)|thank you for (your interest|contacting|reaching out to)[^.]*\. (a member of our team|our team|someone) will|a member of our team will review|do not reply to this (email|message)|ticket (has been|was) created|a ticket \(\d+\) has been created/i;

export const addressesIn = (s: string) =>
  [...s.matchAll(ADDRESS)].map((m) => m[0].toLowerCase());

export const firstAddress = (s: string) => addressesIn(s)[0] ?? "";

export function isOurs(m: Message, mailbox: string): boolean {
  return m.labels.includes("SENT") || firstAddress(m.from) === mailbox;
}

export function isBounce(m: Message): boolean {
  return BOUNCE_FROM.test(m.from) || (BOUNCE_TEXT.test(m.subject) && /delivery|mail/i.test(m.from));
}

/** An automated receipt: a ticket system or an autoresponder, not a person. */
export function isAuto(m: Message): boolean {
  if (AUTO_FROM.test(m.from)) return true;
  const head = `${m.subject}\n${m.body.slice(0, 900)}`;
  return AUTO_TEXT.test(head);
}

export function isHuman(m: Message, mailbox: string): boolean {
  return !isOurs(m, mailbox) && !isBounce(m) && !isAuto(m);
}

export type Facts = {
  bounced: Set<string>;
  auto: Set<string>;
  replied: Set<string>;
  /** Display name of the last person who replied, e.g. "Tony Tsai". */
  lastHuman: string | null;
  humanReplies: number;
};

/** Display name from a From header, without the address or quotes. */
export function displayName(from: string): string {
  const name = from.replace(ADDRESS, "").replace(/[<>"']/g, "").trim();
  return name.replace(/\s*\((support|sales|team)\)\s*$/i, "").trim();
}

export function deliveryFacts(thread: Thread, mailbox: string): Facts {
  const facts: Facts = { bounced: new Set(), auto: new Set(), replied: new Set(), lastHuman: null, humanReplies: 0 };
  for (const m of thread.messages) {
    if (isOurs(m, mailbox)) continue;
    if (isBounce(m)) {
      // A bounce names the address that failed in its text; our own address
      // appears there too and must not count.
      for (const a of addressesIn(`${m.subject}\n${m.body}\n${m.snippet}`)) {
        if (a !== mailbox && !BOUNCE_FROM.test(a)) facts.bounced.add(a);
      }
      continue;
    }
    const from = firstAddress(m.from);
    if (!from) continue;
    if (isAuto(m)) {
      facts.auto.add(from);
    } else {
      facts.replied.add(from);
      facts.lastHuman = displayName(m.from) || from;
      facts.humanReplies++;
    }
  }
  return facts;
}

/** The person the outreach greets: "Hi Tony," gives Tony. Team greetings give "". */
export function greetingName(body: string): string {
  const m = body.match(/^\s*(?:hi|hello|hey|dear)\s+([^,\n!]{1,60})[,!\n]/i);
  if (!m) return "";
  const name = m[1].trim();
  if (/^(there|all|everyone|team|folks)$/i.test(name)) return "";
  return name;
}

/** The ask, lifted from the email: the first "Would you …?" sentence, or
 *  failing that the first real question in the body. */
export function extractAsk(body: string): string {
  const flat = body.split(/\n>|^On .+wrote:$/m)[0].replace(/\s+/g, " ");
  const direct = flat.match(/\b((?:Would|Could|Can|Will) you [^?]{4,200}\?)/);
  if (direct) return direct[1].trim();
  const any = flat.match(/(?:^|[.!?]\s+)([A-Z][^.!?]{12,220}\?)/);
  return any ? any[1].trim() : "";
}

/** Everything the model needs, quoted text stripped, newest last, capped. */
export function threadText(threads: Thread[], limit = 7000): string {
  const parts: string[] = [];
  for (const t of threads) {
    for (const m of t.messages) {
      const body = m.body
        .split(/\n>|^On .+wrote:$|^From: .+$|^-{5,}\s*Original Message/m)[0]
        .trim();
      parts.push(
        [
          `From: ${m.from}`,
          m.to && `To: ${m.to}`,
          m.cc && `Cc: ${m.cc}`,
          `Date: ${m.date}`,
          `Subject: ${m.subject}`,
          "",
          body || m.snippet,
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
  }
  let text = parts.join("\n\n---\n\n");
  if (text.length > limit) text = text.slice(0, limit) + "\n\n[truncated]";
  return text;
}

const when = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  });

const list = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

/** The verdict for a thread nobody has answered. Facts only. */
export function rulesVerdict(bouncedSet: Set<string>, recipients: string[], contactedOn: string, autoFrom: string[]): Verdict {
  const bounced = recipients.filter((a) => bouncedSet.has(a));
  const alive = recipients.filter((a) => !bouncedSet.has(a));
  const sentence: string[] = [
    `No human reply yet. Sent to ${list(recipients)} on ${when(contactedOn)}.`,
  ];
  if (autoFrom.length) {
    sentence.push(
      `An automated receipt came back from ${list(autoFrom)}, so the message reached a queue that a person still has to read.`,
    );
  }
  if (bounced.length) {
    sentence.push(
      `${list(bounced)} bounced as address not found, so that copy was never delivered.`,
    );
  }
  let nextStep: string;
  if (!alive.length) {
    nextStep =
      "Every address bounced. Find a working route before trying again: a named person, a sponsorship form, or a LinkedIn message.";
  } else if (autoFrom.length) {
    nextStep = "The request is in their queue. Give it a week, then reply on the same thread to keep the ticket alive.";
  } else if (bounced.length) {
    nextStep = `Do not retry ${list(bounced)}. Wait a week on the rest, then send one polite follow-up.`;
  } else {
    nextStep = "Wait a week, then send one polite follow-up on the same thread.";
  }
  return { status: "waiting", signalTone: null, replyFrom: null, signal: sentence.join(" "), nextStep };
}

/* ------------------------------------------------------------ the model */

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["status", "signalTone", "replyFrom", "signal", "nextStep"],
  properties: {
    status: { type: "string", enum: ["active", "rejected", "waiting"] },
    signalTone: { type: ["string", "null"], enum: ["positive", "rejected", null] },
    replyFrom: { type: ["string", "null"] },
    signal: { type: "string" },
    nextStep: { type: ["string", "null"] },
  },
};

const SYSTEM = `You read one sponsorship outreach email thread and report what actually happened.

Beacon Hacks is a free one day hackathon for 75 to 100 Bay Area high schoolers in Belmont, California, targeting January 30, 2027. Aadit Mehta and Karsten Lee, both high schoolers, organise it. From the team mailbox they cold-email companies, funds, universities and event organisers asking for sponsorship: cash, credits, API access, prizes, swag, licences, or advice.

status:
  active   — a person replied and something is genuinely open: they offered anything (cash, credits, API access, prizes, swag, mentorship, an intro), forwarded the request to the right team, asked a question, or proposed a call. A "no" to cash that comes with another offer is active.
  rejected — a person replied and closed the door, including soft closes such as "no budget", "not at this time", or "we only sponsor university events", and offered nothing else.
  waiting  — no person replied. Automated receipts, ticket numbers, bounce notices and calendar invitations are NOT human replies.

signalTone: "positive" for active, "rejected" for rejected, null for waiting.
replyFrom: the person who replied, as a name ("Tony Tsai", "Sophia at YRI"), or null if nobody did.
signal: one factual paragraph on what the thread shows: what was asked, what they said, what they offered or declined, what they asked for in return, and whether the team has already answered. Note any address that bounced. Never guess at anything the thread does not say.
nextStep: one short paragraph on what the Beacon Hacks team should do next, concrete and specific to this thread, or null if nothing is needed.

Write plainly, in the third person ("the team", "Aadit"). No hype. No em dashes.`;

export type ModelResult =
  | { ok: true; verdict: Verdict; model: string }
  | { ok: false; error: string };

export function modelConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export function modelName(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
}

/** Ask the model for a verdict on a thread a person has answered. */
export async function modelVerdict(company: string, text: string, attempt = 0): Promise<ModelResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { ok: false, error: "OPENAI_API_KEY is not set" };
  const model = modelName();
  let r: Response;
  try {
    r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        max_completion_tokens: 500,
        temperature: 0,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Organisation: ${company}\n\nThread:\n${text}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "outreach_verdict", strict: true, schema: SCHEMA },
        },
      }),
    });
  } catch (e) {
    return { ok: false, error: `model request failed: ${(e as Error).message}` };
  }
  const j = (await r.json().catch(() => ({}))) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };
  if (r.status === 429 && attempt < 2 && !/per day/i.test(j.error?.message ?? "")) {
    await new Promise((res) => setTimeout(res, 4000 * (attempt + 1)));
    return modelVerdict(company, text, attempt + 1);
  }
  if (!r.ok) return { ok: false, error: `model ${r.status}: ${j.error?.message ?? "unknown"}` };
  try {
    const verdict = JSON.parse(j.choices?.[0]?.message?.content ?? "") as Verdict;
    if (!["active", "rejected", "waiting"].includes(verdict.status)) throw new Error("bad status");
    return { ok: true, verdict, model };
  } catch {
    return { ok: false, error: "model returned something that was not a verdict" };
  }
}
