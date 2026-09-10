import { Reveal } from "@/components/ui/reveal";
import type { Backend } from "@/lib/store";
import type { Company, Contact, Ledger } from "@/lib/outreach/types";
import { SignOutButton, SyncButton } from "./sync-button";

/**
 * The ledger page: the campaign in one headline, one row of ticks and five
 * numbers, then every organisation grouped by outcome. Everything on it is
 * derived from the companies themselves, so a status change can never leave
 * the summary disagreeing with the cards below it.
 */

const TAG: Record<Company["status"], string> = {
  active: "In the works",
  rejected: "Rejection",
  waiting: "Waiting",
};

const KIND: Record<Company["kind"], string> = {
  company: "Company",
  fund: "Fund",
  organiser: "Organiser",
  school: "University",
  programme: "Programme",
  community: "Community",
};

const DELIVERY: Record<Contact["delivery"], { label: string; className: string }> = {
  replied: { label: "Replied", className: "border-beacon/60 bg-beacon-wash text-beacon-deep" },
  auto: { label: "Auto-reply", className: "border-line text-ink-3" },
  bounced: { label: "Bounced", className: "border-danger-line bg-danger-wash text-danger" },
  sent: { label: "Sent", className: "border-line text-ink-3" },
};

const pad = (n: number) => String(n).padStart(2, "0");
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  });
const stamp = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
  }) + " PT";

const bouncesOf = (c: Company) => c.contacts.filter((x) => x.delivery === "bounced").length;
const answered = (c: Company) => c.contacts.some((x) => x.delivery === "replied");

function gmailUrl(mailbox: string, thread: string) {
  return `https://mail.google.com/mail/u/?authuser=${encodeURIComponent(mailbox)}#all/${thread}`;
}

/* ------------------------------------------------------------ pieces */

function Tag({ company }: { company: Company }) {
  const label = company.converted ? "Working together" : TAG[company.status];
  const tone = company.converted
    ? "border-beacon bg-beacon text-beacon-ink"
    : company.status === "active"
      ? "border-beacon/70 bg-beacon-wash text-beacon-deep"
      : company.status === "rejected"
        ? "border-danger-line bg-danger-wash text-danger"
        : "border-line text-ink-3";
  return <span className={`label inline-block shrink-0 rounded-full border px-2.5 py-1 ${tone}`}>{label}</span>;
}

function ContactRow({ contact }: { contact: Contact }) {
  const d = DELIVERY[contact.delivery];
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        {contact.name ? <p className="truncate text-sm font-medium text-ink">{contact.name}</p> : null}
        <a href={`mailto:${contact.email}`} className="block truncate text-sm text-ink-3 hover:text-beacon-deep">
          {contact.email}
        </a>
      </div>
      <span className={`label shrink-0 rounded-full border px-2 py-0.5 ${d.className}`}>{d.label}</span>
    </div>
  );
}

function Card({ company, index, mailbox, feature }: { company: Company; index: number; mailbox: string; feature: boolean }) {
  const bounces = bouncesOf(company);
  const tone =
    company.signalTone === "positive" ? "border-l-beacon" : company.signalTone === "rejected" ? "border-l-danger" : "border-l-line-hard";
  const favicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(company.domain)}&sz=64`;

  return (
    <article
      className={`relative flex flex-col gap-4 rounded-2xl border border-line p-6 transition-colors hover:border-line-hard ${
        feature ? "bg-card" : "bg-paper-warm"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="pt-1.5 text-xs text-ink-4 tabular-nums">{pad(index + 1)}</span>
        <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-paper-deep">
          {/* Google's favicon service, the same trick the YC ledger uses; not worth the image pipeline. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={favicon} alt="" width={20} height={20} loading="lazy" className="size-5 object-contain" />
        </span>
        <span className="min-w-0 flex-1">
          <h3 className="text-[1.3125rem] leading-tight font-semibold tracking-tight">{company.name}</h3>
          {company.website ? (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 inline-block text-xs text-ink-4 hover:text-beacon-deep"
            >
              {company.domain}
            </a>
          ) : (
            <span className="mt-0.5 inline-block text-xs text-ink-4">{company.domain}</span>
          )}
        </span>
        <Tag company={company} />
      </div>

      {company.description ? <p className="text-sm leading-relaxed text-ink-2">{company.description}</p> : null}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
        <span className="label text-ink-4">{KIND[company.kind]}</span>
        <span>Sent {day(company.contactedOn)}</span>
        {company.messages > 1 ? <span>{plural(company.messages, "message", "messages")}</span> : null}
        {bounces ? <span className="text-danger">{plural(bounces, "bounce", "bounces")}</span> : null}
      </div>

      {company.ask ? (
        <p className="text-sm leading-relaxed text-ink-3">
          <span className="label mr-2 text-ink-4">Asked</span>
          {company.ask}
        </p>
      ) : null}

      {company.signal ? (
        <div className={`border-l-2 pl-4 ${tone}`}>
          {company.replyFrom ? (
            <p className="label mb-1.5 text-beacon-deep">{company.replyFrom} replied</p>
          ) : null}
          <p className="text-sm leading-relaxed text-ink-2">{company.signal}</p>
        </div>
      ) : null}

      {company.nextStep ? (
        <div className="rounded-xl bg-paper-deep/60 px-4 py-3">
          <p className="label mb-1 text-ink-4">Next</p>
          <p className="text-sm leading-relaxed text-ink-2">{company.nextStep}</p>
        </div>
      ) : null}

      {company.overrideReason ? (
        <p className="text-xs text-ink-4">Set by hand: {company.overrideReason}</p>
      ) : null}

      <details className="group" open={feature}>
        <summary className="label cursor-pointer text-ink-3 hover:text-ink">
          {plural(company.contacts.length, "address", "addresses")}
          <span className="ml-1 text-ink-4 group-open:hidden">+</span>
          <span className="ml-1 hidden text-ink-4 group-open:inline">–</span>
        </summary>
        <div className="mt-1 divide-y divide-line-soft">
          {company.contacts.map((c) => (
            <ContactRow key={c.email} contact={c} />
          ))}
        </div>
      </details>

      <div className="mt-auto flex flex-wrap gap-4 border-t border-line-soft pt-4 text-sm">
        <a
          href={gmailUrl(mailbox, company.gmailThread)}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-ink hover:text-beacon-deep"
        >
          Open in Gmail ↗
        </a>
        {company.website ? (
          <a href={company.website} target="_blank" rel="noreferrer" className="text-ink-3 hover:text-ink">
            Website ↗
          </a>
        ) : null}
      </div>
    </article>
  );
}

function Block({
  n,
  heading,
  companies,
  mailbox,
  feature = false,
}: {
  n: number;
  heading: string;
  companies: Company[];
  mailbox: string;
  feature?: boolean;
}) {
  if (!companies.length) return null;
  return (
    <section className="pt-16 sm:pt-20">
      <Reveal>
        <div className="flex items-baseline gap-4 pb-6">
          <span className="text-sm text-beacon-deep tabular-nums">{pad(n)}</span>
          <h2 className="text-3xl leading-none tracking-tight sm:text-4xl">{heading}</h2>
          <span className="ml-auto text-sm whitespace-nowrap text-ink-4">
            {plural(companies.length, "organisation", "organisations")}
          </span>
        </div>
      </Reveal>
      <div
        className={`grid gap-3 ${
          feature ? "grid-cols-[repeat(auto-fill,minmax(min(100%,26rem),1fr))]" : "grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))]"
        }`}
      >
        {companies.map((c, i) => (
          <Card key={c.id} company={c} index={i} mailbox={mailbox} feature={feature} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ the page */

export function OutreachLedger({
  ledger,
  gmail,
  model,
  backend,
}: {
  ledger: Ledger;
  gmail: boolean;
  model: boolean;
  backend: Backend;
}) {
  const cos = ledger.companies;
  const replied = cos.filter(answered).length;
  const rate = cos.length ? Math.round((replied / cos.length) * 100) : 0;
  const byStatus = (s: Company["status"]) => cos.filter((c) => c.status === s);
  const working = cos.filter((c) => c.converted);
  const active = byStatus("active").filter((c) => !c.converted);
  const rejected = byStatus("rejected");
  const waiting = byStatus("waiting");
  const addresses = cos.reduce((n, c) => n + c.contacts.length, 0);
  const bounced = cos.reduce((n, c) => n + bouncesOf(c), 0);
  const withBounces = cos.filter((c) => bouncesOf(c) > 0).length;
  const kinds = new Set(cos.map((c) => c.kind)).size;
  const names = (list: Company[]) => list.map((c) => c.name).join(", ");

  const metrics = [
    { label: "Organisations written to", value: cos.length, note: `Across ${plural(kinds, "kind", "kinds")} of organisation`, tone: "text-ink" },
    {
      label: "Active relationships",
      value: byStatus("active").length,
      note: working.length ? `${names(working)} working · ${names(active)} in the works` : names(active) || "Nobody yet",
      tone: "text-beacon",
    },
    { label: "Rejections", value: rejected.length, note: names(rejected) || "None so far", tone: "text-danger" },
    { label: "Waiting", value: waiting.length, note: "No human reply in the thread", tone: "text-ink" },
    {
      label: "Bounced addresses",
      value: bounced,
      note: `Across ${plural(withBounces, "organisation", "organisations")} · ${addresses} addresses tracked`,
      tone: "text-ink-2",
    },
  ];

  // One tick per organisation, tallest for the ones that answered. In the
  // waiting tier the height tracks how many addresses were tried.
  const maxReach = Math.max(1, ...cos.map((c) => c.contacts.length));
  const ticks = cos.map((c) => {
    const bounce = c.status === "waiting" && bouncesOf(c) > 0;
    const height =
      c.status === "active" ? 100 : c.status === "rejected" ? 52 : 22 + Math.round((c.contacts.length / maxReach) * 24);
    const color =
      c.status === "active"
        ? "bg-beacon"
        : c.status === "rejected"
          ? "bg-danger/80"
          : bounce
            ? "bg-beacon-deep/45"
            : "bg-ink/25";
    return { id: c.id, height, color, title: `${c.name} · ${c.converted ? "Working together" : TAG[c.status]} · ${plural(c.contacts.length, "address", "addresses")}` };
  });

  const legend = [
    ["bg-beacon", "Active relationship"],
    ["bg-danger/80", "Rejection"],
    ["bg-ink/25", "Waiting on a reply"],
    ["bg-beacon-deep/45", "Waiting, with a bounced address"],
  ] as const;

  return (
    <div className="flex flex-col">
      {/* headline */}
      <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">Sponsor outreach · Gmail record</p>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="mt-6 text-[clamp(2.75rem,7.5vw,6.25rem)] leading-[0.95] tracking-[-0.03em]">
              {cos.length} letters.
              <br />
              <span className="text-beacon">{replied}</span>{" "}
              <span className="text-ink-4">came back.</span>
            </h1>
          </Reveal>
          <Reveal delay={110}>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-ink-2">
              The real Gmail record for {ledger.mailbox}: every organisation the team has written to,
              every human answer, and every address that bounced.
            </p>
          </Reveal>
        </div>
        <Reveal delay={140}>
          <div className="flex flex-col items-start gap-5 lg:items-end lg:text-right">
            <div>
              <p className="font-display text-[clamp(4rem,9vw,8rem)] leading-[0.85] font-semibold tracking-[-0.05em] tabular-nums">
                {rate}
                <span className="text-[0.35em] text-beacon">%</span>
              </p>
              <p className="mt-4 border-t border-line-hard pt-3 text-sm text-ink-3">
                reply rate · {replied} of {cos.length}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <span className="inline-flex items-center gap-2 text-xs text-ink-3">
                <span
                  className={`size-1.5 rounded-full ${ledger.syncedAt ? "animate-pulse-dot bg-beacon" : "bg-ink-4"}`}
                  aria-hidden
                />
                {ledger.syncedAt ? `Synced ${stamp(ledger.syncedAt)}` : "Not synced yet"}
              </span>
              <SyncButton disabled={!gmail} />
              <SignOutButton />
            </div>
          </div>
        </Reveal>
      </div>

      {/* what is and is not wired up */}
      {!gmail ? (
        <p role="alert" className="mt-8 rounded-xl border border-danger-line bg-danger-wash px-4 py-3 text-sm leading-relaxed text-danger">
          Gmail is not connected on this deployment. Run <code>node scripts/gmail-auth.mjs</code> once and set
          GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN, then redeploy.
        </p>
      ) : null}
      {gmail && !model ? (
        <p className="mt-8 rounded-xl border border-line bg-card px-4 py-3 text-sm leading-relaxed text-ink-3">
          No OPENAI_API_KEY is set, so answered threads are listed but not summarised. Open them in Gmail.
        </p>
      ) : null}
      {backend.warning ? (
        <p role="alert" className="mt-4 rounded-xl border border-danger-line bg-danger-wash px-4 py-3 text-sm leading-relaxed text-danger">
          {backend.warning}
        </p>
      ) : null}
      {ledger.lastSync?.errors.length ? (
        <p className="mt-4 rounded-xl border border-line bg-card px-4 py-3 text-sm leading-relaxed text-ink-3">
          The last sync hit {plural(ledger.lastSync.errors.length, "problem", "problems")}: {ledger.lastSync.errors.join(" · ")}
        </p>
      ) : null}

      {cos.length === 0 ? (
        <div className="mt-14 rounded-2xl border border-line bg-card px-6 py-14 text-center">
          <p className="text-lg text-ink">Nothing here yet.</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-3">
            {gmail
              ? "Press Sync now to read the mailbox. It lists every thread the team started, who answered, and what bounced."
              : "Connect Gmail and the first sync fills this in."}
          </p>
        </div>
      ) : (
        <>
          {/* the campaign, one tick per organisation */}
          <section aria-label="Every organisation, by outcome" className="mt-14">
            <div className="flex h-16 items-end gap-[3px] border-b border-line-hard pb-0.5">
              {ticks.map((t) => (
                <i
                  key={t.id}
                  title={t.title}
                  className={`min-w-0.5 flex-1 rounded-t-[2px] transition-transform hover:scale-y-110 ${t.color}`}
                  style={{ height: `${t.height}%`, transformOrigin: "bottom" }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-7 gap-y-2 pt-4 text-xs text-ink-4">
              {legend.map(([color, label]) => (
                <span key={label} className="inline-flex items-center gap-2">
                  <i className={`size-2.5 rounded-[2px] ${color}`} aria-hidden />
                  {label}
                </span>
              ))}
            </div>
          </section>

          {/* the five numbers */}
          <section aria-label="Summary" className="mt-10 grid grid-cols-2 border-y border-line-hard sm:grid-cols-3 lg:grid-cols-5">
            {metrics.map((m, i) => (
              <div
                key={m.label}
                className={`py-6 pr-6 ${i > 0 ? "lg:border-l lg:border-line lg:pl-6" : ""} ${i % 2 === 1 ? "border-l border-line pl-6 lg:border-l" : ""}`}
              >
                <p className="text-sm font-medium text-ink-3">{m.label}</p>
                <p className={`mt-2 font-display text-5xl leading-none font-semibold tracking-tight tabular-nums ${m.tone}`}>{m.value}</p>
                <p className="mt-2 text-xs leading-relaxed text-ink-4">{m.note}</p>
              </div>
            ))}
          </section>
          <p className="max-w-3xl pt-5 text-xs leading-relaxed text-ink-4">
            “Sent” means Gmail recorded the message and no bounce came back in that thread. It does not prove anyone read
            it. The reply rate counts genuine human answers, not autoresponders, ticket receipts or calendar invitations.
            Nothing here reaches the public site: a sponsor is only ever named there once an agreement is signed.
          </p>

          <Block n={1} heading="Working together" companies={working} mailbox={ledger.mailbox} feature />
          <Block n={2} heading="In the works" companies={active} mailbox={ledger.mailbox} feature />
          <Block n={3} heading="Rejections" companies={rejected} mailbox={ledger.mailbox} />
          <Block n={4} heading="Waiting for a human reply" companies={waiting} mailbox={ledger.mailbox} />

          <footer className="mt-16 flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-line pt-6 text-xs text-ink-4">
            <span>{ledger.mailbox}</span>
            <span>
              {plural(cos.length, "organisation", "organisations")} · {plural(addresses, "address", "addresses")} tracked
            </span>
            <span>Stored in {backend.label}{ledger.syncedAt ? ` · synced ${stamp(ledger.syncedAt)}` : ""}</span>
          </footer>
        </>
      )}
    </div>
  );
}
