"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnchorButton, Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/field";
import { DIETS, SHIRT_SIZES, teamSummary, waiverStage, type Waiver } from "@/lib/waiver";
import type { WaiverBackend } from "@/lib/waiver-store";

type Filter = "all" | "looking" | "parent" | "review" | "waiting" | "in" | "health" | "nophoto" | "minor";

const DIET_LABEL: Record<string, string> = Object.fromEntries(DIETS.map((d) => [d.value, d.label]));

/* Pacific time, always, so the server's render and the browser's agree. */
const WHEN = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const when = (iso: string) => WHEN.format(new Date(iso));

const hasHealth = (w: Waiver) => !!(w.allergies || w.medications || w.conditions);
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

/**
 * Every signed waiver. Counts across the top (with shirt sizes and diets
 * for ordering), then a searchable list: tap Check in at the door, open a
 * name for the full signed waiver. The Luma panel compares the guest list
 * export with who has signed, in the browser; nothing from it is stored.
 */
export function WaiverDashboard({
  waivers: initial,
  backend,
  emailing,
}: {
  waivers: Waiver[];
  backend: WaiverBackend;
  /** Whether each new waiver is emailed to the team inbox. */
  emailing: boolean;
}) {
  const router = useRouter();
  const [waivers, setWaivers] = useState(initial);
  /* A refresh brings a new list from the server: take it. */
  const [from, setFrom] = useState(initial);
  if (from !== initial) {
    setFrom(initial);
    setWaivers(initial);
  }
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const stats = useMemo(() => {
    const shirts = Object.fromEntries(SHIRT_SIZES.map((s) => [s, 0])) as Record<string, number>;
    const diets: Record<string, number> = {};
    for (const w of waivers) {
      shirts[w.shirtSize] = (shirts[w.shirtSize] ?? 0) + 1;
      for (const d of w.diet) diets[d] = (diets[d] ?? 0) + 1;
    }
    return {
      total: waivers.length,
      minors: waivers.filter((w) => w.minor).length,
      checkedIn: waivers.filter((w) => w.checkedInAt).length,
      toReview: waivers.filter((w) => waiverStage(w) === "review").length,
      parent: waivers.filter((w) => waiverStage(w) === "guardian").length,
      looking: waivers.filter((w) => w.teamStatus === "looking").length,
      teams: new Set(waivers.filter((w) => w.teamStatus === "team" && w.teamName).map((w) => w.teamName.trim().toLowerCase())).size,
      solo: waivers.filter((w) => w.teamStatus === "solo").length,
      health: waivers.filter(hasHealth).length,
      noPhoto: waivers.filter((w) => w.mediaConsent === "no").length,
      shirts,
      diets,
    };
  }, [waivers]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return waivers.filter((w) => {
      const pass =
        filter === "all" ||
        (filter === "review" && waiverStage(w) === "review") ||
        (filter === "parent" && waiverStage(w) === "guardian") ||
        (filter === "looking" && w.teamStatus === "looking") ||
        (filter === "waiting" && !w.checkedInAt) ||
        (filter === "in" && !!w.checkedInAt) ||
        (filter === "health" && hasHealth(w)) ||
        (filter === "nophoto" && w.mediaConsent === "no") ||
        (filter === "minor" && w.minor);
      if (!pass) return false;
      if (!q) return true;
      return [w.firstName, w.lastName, `${w.firstName} ${w.lastName}`, w.email, w.school, w.guardianName, w.phone, w.teamName, ...(w.teammates ?? [])]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [waivers, filter, query]);

  async function checkIn(w: Waiver) {
    setBusy(w.id);
    const next = !w.checkedInAt;
    setWaivers((all) => all.map((x) => (x.id === w.id ? { ...x, checkedInAt: next ? new Date().toISOString() : undefined } : x)));
    try {
      const res = await fetch("/api/admin/waivers", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: w.id, action: next ? "checkin" : "uncheckin" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { waiver } = (await res.json()) as { waiver: Waiver };
      setWaivers((all) => all.map((x) => (x.id === w.id ? waiver : x)));
    } catch {
      setWaivers((all) => all.map((x) => (x.id === w.id ? w : x)));
    } finally {
      setBusy(null);
    }
  }

  async function copy(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* no clipboard on an insecure origin; the CSV has them too */
    }
  }

  const tab = (value: Filter, label: string, count: number) => (
    <button
      key={value}
      type="button"
      onClick={() => setFilter(value)}
      aria-pressed={filter === value}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.875rem] font-semibold whitespace-nowrap transition-colors duration-200 ${
        filter === value ? "bg-ink text-fog" : "text-ink-3 hover:bg-fog-2 hover:text-ink"
      }`}
    >
      {label} <span className="font-normal opacity-70">{count}</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[clamp(2.25rem,4.4vw,3.25rem)] leading-none font-extrabold font-stretch-125% tracking-[-0.035em]">
            Waivers
          </h1>
          <p className="mt-3 text-[0.9375rem] text-ink-3">
            Share <span className="font-semibold text-ink">beaconhacks.com/waiver</span> with registered students. Each
            waiver waits for your approval; approving emails them that they&rsquo;re in.{" "}
            <Link href="/admin/emails" className="link text-ink">
              See the email drafts
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:flex-nowrap">
          <Button type="button" variant="outline" size="sm" onClick={() => router.refresh()}>
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => copy("emails", rows.map((r) => r.email).join(", "))}
            disabled={!rows.length}
          >
            {copied === "emails" ? "Copied" : `Copy ${rows.length === waivers.length ? "all" : rows.length} emails`}
          </Button>
          <AnchorButton href="/api/admin/waivers?format=csv" variant="ink" size="sm">
            Download CSV
          </AnchorButton>
        </div>
      </div>

      {backend !== "redis" ? (
        <p role="status" className="rounded-xl bg-lamp-wash px-5 py-3.5 text-[0.9375rem] leading-relaxed text-ink-2">
          {backend === "file"
            ? "Development: waivers are saved in .data/waivers.json on this computer. In production they go to the Upstash database."
            : "No database is connected, so the waiver form is refusing signatures. Connect Upstash Redis in Vercel and redeploy."}
        </p>
      ) : null}

      {!emailing ? (
        <p role="status" className="rounded-xl bg-fog-2 px-5 py-3.5 text-[0.9375rem] leading-relaxed text-ink-2">
          Email is off: waivers still come in and can be approved, but no one is emailed. Set GMAIL_USER and
          GMAIL_APP_PASSWORD to turn it on.
        </p>
      ) : null}

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Signed" value={stats.total} />
        <Stat label="To approve" value={stats.toReview} />
        <Stat label="Checked in" value={`${stats.checkedIn}`} note={stats.total ? `of ${stats.total}` : undefined} />
        <Stat label="Under 18, guardian signed" value={stats.minors} />
        <Stat label="Health notes" value={stats.health} />
        <Stat label="No photos" value={stats.noPhoto} />
      </dl>

      <div className="grid gap-3 text-[0.9375rem] sm:grid-cols-3">
        <Tally
          title="T-shirts"
          items={SHIRT_SIZES.map((s) => [s, stats.shirts[s] ?? 0] as [string, number])}
        />
        <Tally
          title="Teams"
          items={[
            ["Named teams", stats.teams],
            ["Looking", stats.looking],
            ["Solo", stats.solo],
          ]}
        />
        <Tally
          title="Food"
          items={DIETS.map((d) => [d.label, stats.diets[d.value] ?? 0] as [string, number]).filter(([, n]) => n > 0)}
          empty="No dietary needs yet"
        />
      </div>

      <LumaCheck waivers={waivers} onCopy={copy} copied={copied} />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {tab("all", "All", stats.total)}
            {tab("review", "To approve", stats.toReview)}
            {tab("parent", "Waiting for parent", stats.parent)}
            {tab("looking", "Looking for a team", stats.looking)}
            {tab("waiting", "Not checked in", stats.total - stats.checkedIn)}
            {tab("in", "Checked in", stats.checkedIn)}
            {tab("health", "Health notes", stats.health)}
            {tab("nophoto", "No photos", stats.noPhoto)}
            {tab("minor", "Under 18", stats.minors)}
          </div>
          <label className="lg:w-80">
            <span className="sr-only">Search</span>
            <input
              type="search"
              className={`${fieldClass} py-2.5`}
              placeholder="Search name, email, school, team…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        {rows.length ? (
          <ul className="overflow-hidden rounded-2xl border border-line bg-card">
            {rows.map((w) => (
              <li
                key={w.id}
                className="flex flex-col gap-3 border-b border-line px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:gap-6"
              >
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/waivers/${w.id}`} className="font-semibold text-ink hover:underline hover:decoration-lamp hover:decoration-2 hover:underline-offset-4">
                    {w.firstName} {w.lastName}
                  </Link>
                  <p className="truncate text-[0.875rem] text-ink-3">
                    {w.email} · {w.school}, grade {w.grade}
                  </p>
                  <p className="mt-1.5 flex flex-wrap gap-1.5">
                    {waiverStage(w) === "guardian" ? (
                      <Tag>{w.guardianMethod === "paper" ? "Waiting for paper copy" : "Waiting for parent to sign"}</Tag>
                    ) : !w.approvedAt ? (
                      <Tag tone="warn">Waiting for approval</Tag>
                    ) : w.approvalEmailedAt ? (
                      <Tag tone="ok">Approved</Tag>
                    ) : (
                      <Tag tone="danger">Approved, email failed</Tag>
                    )}
                    {w.minor ? <Tag>Under 18 · {w.guardianName}</Tag> : <Tag>18+</Tag>}
                    {hasHealth(w) ? <Tag tone="danger">Health notes</Tag> : null}
                    {w.diet.length ? <Tag>{w.diet.map((d) => DIET_LABEL[d]).join(", ")}</Tag> : null}
                    {w.mediaConsent === "no" ? <Tag tone="warn">No photos</Tag> : null}
                    {w.teamStatus ? <Tag tone={w.teamStatus === "looking" ? "warn" : undefined}>{teamSummary(w)}</Tag> : null}
                    <Tag>Shirt {w.shirtSize}</Tag>
                  </p>
                </div>
                <p className="text-[0.8125rem] text-ink-3 sm:w-32 sm:text-right">Signed {when(w.signedAt)}</p>
                {!w.approvedAt ? (
                  <Link
                    href={`/admin/waivers/${w.id}`}
                    className="flex h-10 shrink-0 items-center justify-center rounded-full bg-ink px-5 text-[0.875rem] font-semibold text-fog transition-colors hover:bg-ink-2 sm:w-40"
                  >
                    Review
                    <span className="sr-only">
                      {" "}
                      {w.firstName} {w.lastName}
                    </span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => checkIn(w)}
                    disabled={busy === w.id}
                    aria-pressed={!!w.checkedInAt}
                    className={`h-10 shrink-0 rounded-full px-5 text-[0.875rem] font-semibold transition-colors sm:w-40 ${
                      w.checkedInAt
                        ? "bg-[oklch(0.93_0.07_150)] text-[oklch(0.36_0.09_150)] hover:bg-[oklch(0.9_0.08_150)]"
                        : "bg-lamp text-ink hover:bg-lamp-hi"
                    }`}
                  >
                    {w.checkedInAt ? `In · ${when(w.checkedInAt).split(", ")[1]}` : "Check in"}
                    <span className="sr-only">
                      {" "}
                      {w.firstName} {w.lastName}
                    </span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-line bg-card px-6 py-14 text-center text-ink-3">
            {query.trim() ? `No one matches “${query.trim()}”.` : waivers.length ? "No one in this view." : "No waivers signed yet."}
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <div className="flex flex-col gap-1 bg-card px-5 py-4">
      <dt className="text-[0.8125rem] text-ink-3">{label}</dt>
      <dd className="order-first text-[2rem] leading-none font-extrabold font-stretch-125% tracking-[-0.04em] tabular-nums">
        {value}
        {note ? <span className="ml-1.5 text-[0.8125rem] font-normal tracking-normal text-ink-3">{note}</span> : null}
      </dd>
    </div>
  );
}

function Tally({ title, items, empty }: { title: string; items: [string, number][]; empty?: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-2xl border border-line bg-card px-5 py-3.5">
      <span className="font-semibold">{title}</span>
      {items.length ? (
        items.map(([k, n]) => (
          <span key={k} className="text-ink-3">
            {k} <span className="font-semibold text-ink tabular-nums">{n}</span>
          </span>
        ))
      ) : (
        <span className="text-ink-3">{empty}</span>
      )}
    </div>
  );
}

function Tag({ children, tone }: { children: ReactNode; tone?: "danger" | "warn" | "ok" }) {
  const color =
    tone === "danger"
      ? "bg-danger-wash text-danger"
      : tone === "warn"
        ? "bg-lamp-wash text-lamp-deep"
        : tone === "ok"
          ? "bg-[oklch(0.93_0.07_150)] text-[oklch(0.36_0.09_150)]"
          : "bg-fog-2 text-ink-2";
  return <span className={`rounded-full px-2.5 py-0.5 text-[0.75rem] font-semibold ${color}`}>{children}</span>;
}

/* ------------------------------------------------------------ Luma */

/**
 * Paste or drop the guest list exported from Luma (Guests, then Export as
 * CSV). Any email addresses in it are compared with the signed waivers.
 */
function LumaCheck({
  waivers,
  onCopy,
  copied,
}: {
  waivers: Waiver[];
  onCopy: (label: string, text: string) => void;
  copied: string | null;
}) {
  const [raw, setRaw] = useState("");

  const result = useMemo(() => {
    const luma = new Set((raw.match(EMAIL) ?? []).map((e) => e.toLowerCase()));
    if (!luma.size) return null;
    const signed = new Set(waivers.map((w) => w.email));
    return {
      luma: luma.size,
      missing: [...luma].filter((e) => !signed.has(e)).sort(),
      extra: waivers.filter((w) => !luma.has(w.email)),
    };
  }, [raw, waivers]);

  async function onFile(file: File | undefined) {
    if (file) setRaw(await file.text());
  }

  return (
    <details className="group rounded-2xl border border-line bg-card">
      <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4">
        <span>
          <span className="font-semibold">Who still needs to sign?</span>
          <span className="ml-2 text-[0.9375rem] text-ink-3">Compare with your Luma guest list</span>
        </span>
        <span aria-hidden="true" className="text-ink-3 transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="flex flex-col gap-4 border-t border-line px-5 py-5">
        <p className="text-[0.9375rem] text-ink-3">
          In Luma, open the event, then Guests, then export the list as CSV. Drop the file here or paste it in. It stays
          in this browser.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-line-2 px-5 py-3 text-[0.9375rem] font-semibold hover:border-ink sm:w-56">
            Choose CSV file
            <input type="file" accept=".csv,text/csv,text/plain" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          <textarea
            className={`${fieldClass} min-h-12 flex-1 py-2.5 text-[0.875rem]`}
            placeholder="…or paste the CSV, or a list of emails"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={2}
            aria-label="Luma guest list"
          />
        </div>
        {result ? (
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl bg-danger-wash/60 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-semibold">
                  On Luma, no waiver yet: {result.missing.length} of {result.luma}
                </p>
                {result.missing.length ? (
                  <button type="button" className="text-[0.875rem] font-semibold underline underline-offset-4" onClick={() => onCopy("missing", result.missing.join(", "))}>
                    {copied === "missing" ? "Copied" : "Copy emails"}
                  </button>
                ) : null}
              </div>
              <ul className="mt-2 max-h-48 overflow-y-auto text-[0.875rem] text-ink-2">
                {result.missing.length ? result.missing.map((e) => <li key={e}>{e}</li>) : <li>Everyone on the list has signed.</li>}
              </ul>
            </div>
            <div className="rounded-xl bg-fog-2 p-4">
              <p className="font-semibold">Signed, but that email is not on Luma: {result.extra.length}</p>
              <p className="mt-1 text-[0.8125rem] text-ink-3">Usually a different email. Check them by name.</p>
              <ul className="mt-2 max-h-48 overflow-y-auto text-[0.875rem] text-ink-2">
                {result.extra.map((w) => (
                  <li key={w.id}>
                    {w.firstName} {w.lastName} · {w.email}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </details>
  );
}

export function SignOut() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        router.refresh();
      }}
      className="rounded-full border border-moon/20 px-3.5 py-1.5 text-[0.875rem] font-semibold text-moon transition-colors hover:border-lamp/70 hover:text-lamp"
    >
      Sign out
    </button>
  );
}
