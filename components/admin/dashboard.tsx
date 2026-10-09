"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnchorButton, Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/field";
import type { Entry } from "@/lib/notify-schema";
import type { Backend } from "@/lib/store";

type Filter = "all" | "application" | "notify";

const ROLE: Record<string, string> = {
  student: "Student",
  parent: "Parent or guardian",
  mentor: "Mentor or judge",
  sponsor: "Sponsor",
  other: "Other",
};

const COLUMNS = ["Name", "School", "Grade", "First time", "Note", "When"];

/* Pacific time, always, so the server's render and the browser's agree. */
const WHEN = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const when = (iso: string) => WHEN.format(new Date(iso));
const first = (e: Entry) => (e.firstHackathon === undefined ? "" : e.firstHackathon ? "Yes" : "No");
const note = (e: Entry) => (e.kind === "notify" ? ROLE[e.role ?? "other"] : (e.idea ?? ""));

/**
 * Everyone who has applied or asked for updates, newest first. Filter,
 * search, copy the emails, download a CSV, remove a row. Nothing here
 * edits an entry; if something is wrong, remove it and let the person
 * apply again.
 */
export function Dashboard({ entries, backend }: { entries: Entry[]; backend: Backend }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [arming, setArming] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const applications = entries.filter((e) => e.kind === "application").length;
  const updates = entries.length - applications;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter(
      (e) =>
        (filter === "all" || e.kind === filter) &&
        (!q ||
          [e.name, e.email, e.school, e.idea, e.role, e.grade]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))),
    );
  }, [entries, filter, query]);

  async function remove(id: string) {
    await fetch(`/api/admin/entries?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setArming(null);
    router.refresh();
  }

  async function copyEmails() {
    try {
      await navigator.clipboard.writeText(rows.map((r) => r.email).join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* no clipboard (an insecure origin); the CSV has them too */
    }
  }

  const tab = (value: Filter, label: string, count: number) => (
    <button
      key={value}
      type="button"
      onClick={() => setFilter(value)}
      aria-pressed={filter === value}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[0.875rem] font-semibold transition-colors duration-200 ${
        filter === value ? "bg-ink text-fog" : "text-ink-3 hover:text-ink"
      }`}
    >
      {value === "all" ? null : <Dot kind={value} />}
      {label} <span className="font-normal opacity-70">{count}</span>
    </button>
  );

  const removeControl = (e: Entry) =>
    arming === e.id ? (
      <span className="inline-flex gap-3">
        <button type="button" onClick={() => remove(e.id)} className="font-semibold text-danger underline underline-offset-4">
          Delete
        </button>
        <button type="button" onClick={() => setArming(null)} className="text-ink-3 hover:text-ink">
          Keep
        </button>
      </span>
    ) : (
      <button type="button" onClick={() => setArming(e.id)} className="text-ink-3 transition-colors hover:text-danger">
        Remove<span className="sr-only"> {e.name ?? e.email}</span>
      </button>
    );

  const empty = (
    <p className="rounded-2xl border border-line bg-card px-6 py-14 text-center text-ink-3">
      {query.trim() ? `No one matches “${query.trim()}”.` : "Nothing here yet."}
    </p>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[clamp(2.25rem,4.4vw,3.25rem)] leading-none font-extrabold tracking-[-0.035em]">
            {applications} {applications === 1 ? "application" : "applications"}
          </h1>
          <p className="mt-4 text-ink-3">
            {updates} on the updates list.
            {backend.kind === "ephemeral" ? "" : ` Stored in ${backend.label}, one row per email.`}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={copyEmails} disabled={!rows.length}>
            {copied ? "Copied" : `Copy ${rows.length} ${rows.length === 1 ? "email" : "emails"}`}
          </Button>
          <AnchorButton href="/api/admin/entries?format=csv" variant="ink">
            Download CSV
          </AnchorButton>
        </div>
      </div>

      {backend.warning ? (
        <p role="alert" className="rounded-2xl bg-danger-wash px-5 py-4 leading-relaxed text-danger">
          {backend.warning}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Show" className="inline-flex w-fit gap-1 rounded-full border border-line bg-card p-1">
          {tab("all", "All", entries.length)}
          {tab("application", "Applications", applications)}
          {tab("notify", "Updates", updates)}
        </div>
        <input
          type="search"
          className={`${fieldClass} sm:max-w-xs`}
          placeholder="Search name, email or school"
          aria-label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {rows.length === 0 ? (
        empty
      ) : (
        <>
          {/* Up to laptop width: one block per person. */}
          <ul className="divide-y divide-line rounded-2xl border border-line bg-card xl:hidden">
            {rows.map((e) => (
              <li key={e.id} className="flex flex-col gap-1.5 px-5 py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="min-w-0 font-semibold [overflow-wrap:anywhere]">{e.name ?? e.email}</span>
                  <span className="shrink-0 text-[0.8125rem] text-ink-3">{when(e.receivedAt)}</span>
                </div>
                {e.name ? (
                  <a href={`mailto:${e.email}`} className="w-fit text-[0.9375rem] break-all text-ink-2 hover:text-ink">
                    {e.email}
                  </a>
                ) : null}
                <p className="text-[0.875rem] text-ink-3">
                  {[
                    e.school,
                    e.grade ? `Grade ${e.grade}` : "",
                    e.firstHackathon ? "First hackathon" : "",
                    e.kind === "notify" ? ROLE[e.role ?? "other"] : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {e.idea ? <p className="text-[0.9375rem] leading-relaxed text-ink-2">{e.idea}</p> : null}
                <div className="mt-1 flex items-center justify-between text-[0.875rem]">
                  <Kind kind={e.kind} />
                  {removeControl(e)}
                </div>
              </li>
            ))}
          </ul>

          {/* Wider: the table, once seven columns fit beside an email. */}
          <div className="hidden overflow-x-auto rounded-2xl border border-line bg-card xl:block">
            <table className="w-full min-w-[52rem] text-left text-[0.9375rem]">
              <thead>
                <tr className="border-b border-line text-[0.8125rem] text-ink-3">
                  {COLUMNS.map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap first:pl-5">
                      {h}
                    </th>
                  ))}
                  <th scope="col" className="py-3 pr-5 pl-4">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((e) => (
                  <tr key={e.id} className="align-top transition-colors duration-150 hover:bg-fog">
                    <td className="py-3.5 pr-4 pl-5">
                      <Person e={e} />
                    </td>
                    <td className="min-w-[9rem] px-4 py-3.5 text-ink-2">{e.school ?? ""}</td>
                    <td className="px-4 py-3.5 text-ink-2">{e.grade ?? ""}</td>
                    <td className="px-4 py-3.5 text-ink-2">{first(e)}</td>
                    <td className="min-w-[14rem] px-4 py-3.5 text-ink-3">{note(e)}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-ink-3">{when(e.receivedAt)}</td>
                    <td className="py-3.5 pr-5 pl-4 text-right whitespace-nowrap">{removeControl(e)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* An application gets the lamp; an updates signup a hollow ring. */
function Dot({ kind, className = "" }: { kind: Entry["kind"]; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`size-2 shrink-0 rounded-full ${kind === "application" ? "bg-lamp" : "border border-current opacity-60"} ${className}`}
    />
  );
}

function Kind({ kind }: { kind: Entry["kind"] }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-ink-2">
      <Dot kind={kind} />
      {kind === "application" ? "Applied" : "Updates"}
    </span>
  );
}

/* Who, and how to reach them: the name over the email, or for the updates
   list (no name) the email over where it came from. */
function Person({ e }: { e: Entry }) {
  const mail = (
    <a href={`mailto:${e.email}`} className="[overflow-wrap:anywhere] transition-colors hover:text-ink">
      {e.email}
    </a>
  );
  return (
    <div className="flex items-start gap-3">
      <Dot kind={e.kind} className="mt-[0.5625rem]" />
      <div className="flex min-w-[16rem] flex-col gap-0.5">
        {e.name ? (
          <>
            <span className="font-semibold whitespace-nowrap">
              <span className="sr-only">Applied: </span>
              {e.name}
            </span>
            <span className="text-[0.875rem] text-ink-3">{mail}</span>
          </>
        ) : (
          <>
            <span className="font-semibold">{mail}</span>
            <span className="text-[0.875rem] text-ink-3">Updates list</span>
          </>
        )}
      </div>
    </div>
  );
}

/** Lives in the header; clears the cookie and shows the sign-in again. */
export function SignOut() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function signOut() {
    setLeaving(true);
    await fetch("/api/admin/login", { method: "DELETE" }).catch(() => null);
    router.refresh();
  }

  return (
    <Button type="button" variant="outline-night" size="sm" loading={leaving} onClick={signOut}>
      Sign out
    </Button>
  );
}
