"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/field";
import type { Entry } from "@/lib/notify-schema";
import type { Backend } from "@/lib/store";

type Filter = "all" | "application" | "notify";

const ROLE: Record<string, string> = {
  student: "Student",
  mentor: "Mentor or judge",
  sponsor: "Sponsor",
  other: "Other",
};

function when(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Everyone who has applied or asked to be told, newest first. Filter, search,
 * copy the emails, download a CSV, remove a row. Nothing here edits an entry;
 * if something is wrong, delete it and let the person apply again.
 */
export function Dashboard({ entries, backend }: { entries: Entry[]; backend: Backend }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [arming, setArming] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const applications = entries.filter((e) => e.kind === "application").length;

  async function remove(id: string) {
    await fetch(`/api/admin/entries?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setArming(null);
    router.refresh();
  }

  async function copyEmails() {
    await navigator.clipboard.writeText(rows.map((r) => r.email).join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  const tab = (value: Filter, label: string, count: number) => (
    <button
      type="button"
      onClick={() => setFilter(value)}
      aria-pressed={filter === value}
      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
        filter === value ? "bg-ink text-paper" : "text-ink-3 hover:text-ink"
      }`}
    >
      {label} <span className="tabular-nums opacity-70">{count}</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 text-3xl sm:text-4xl">
            {applications} {applications === 1 ? "application" : "applications"},{" "}
            {entries.length - applications} on the notify list.
          </h1>
          <p className="mt-2 text-sm text-ink-3">
            Stored in {backend.label}. One row per email; the newest wins.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="quiet" size="sm" onClick={copyEmails}>
            {copied ? "Copied" : `Copy ${rows.length} emails`}
          </Button>
          <a
            href="/api/admin/entries?format=csv"
            className="inline-flex items-center justify-center rounded-full border border-line bg-card px-4 py-2 text-[0.8125rem] font-medium text-ink shadow-quiet transition-colors hover:border-line-hard"
          >
            Download CSV
          </a>
          <Button type="button" variant="ghost" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>

      {backend.warning ? (
        <p role="alert" className="rounded-xl border border-danger-line bg-danger-wash px-4 py-3 text-sm leading-relaxed text-danger">
          {backend.warning}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-full border border-line bg-paper-deep/60 p-1">
          {tab("all", "All", entries.length)}
          {tab("application", "Applications", applications)}
          {tab("notify", "Notify list", entries.length - applications)}
        </div>
        <input
          className={`${fieldClass} sm:max-w-xs`}
          placeholder="Search name, email, school…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead>
            <tr className="label border-b border-line text-ink-4">
              {["When", "Kind", "Name", "Email", "School", "Grade", "First", "Note", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-ink-3">
                  Nothing here yet.
                </td>
              </tr>
            ) : (
              rows.map((e) => (
                <tr key={e.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-ink-3 tabular-nums">{when(e.receivedAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`label inline-block rounded-full border px-2 py-0.5 ${
                        e.kind === "application"
                          ? "border-beacon bg-beacon-wash text-beacon-deep"
                          : "border-line text-ink-3"
                      }`}
                    >
                      {e.kind === "application" ? "Applied" : "Notify"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">{e.name ?? ""}</td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${e.email}`} className="text-ink-2 hover:text-beacon-deep">
                      {e.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-ink-2">{e.school ?? ""}</td>
                  <td className="px-4 py-3 text-ink-2 tabular-nums">{e.grade ?? ""}</td>
                  <td className="px-4 py-3 text-ink-2">
                    {e.firstHackathon === undefined ? "" : e.firstHackathon ? "Yes" : "No"}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-ink-3">
                    {e.kind === "notify" ? ROLE[e.role ?? "other"] : e.idea ?? ""}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {arming === e.id ? (
                      <span className="inline-flex gap-2">
                        <button type="button" onClick={() => remove(e.id)} className="text-danger underline underline-offset-4">
                          Delete
                        </button>
                        <button type="button" onClick={() => setArming(null)} className="text-ink-3 hover:text-ink">
                          Keep
                        </button>
                      </span>
                    ) : (
                      <button type="button" onClick={() => setArming(e.id)} className="text-ink-4 hover:text-danger">
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
