"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Report = { threads: number; companies: number; classified: number; reused: number; errors: string[] };

/** Pull the mailbox again. The page re-renders from the stored ledger. */
export function SyncButton({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function sync() {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/outreach/sync", { method: "POST" });
      const payload = (await res.json().catch(() => null)) as { report?: Report; error?: string } | null;
      if (!res.ok || !payload?.report) {
        setNote(payload?.error ?? "The sync did not finish.");
        return;
      }
      const r = payload.report;
      setNote(
        `${r.threads} threads read, ${r.classified} newly summarised` +
          (r.errors.length ? `, ${r.errors.length} ${r.errors.length === 1 ? "error" : "errors"}` : ""),
      );
      router.refresh();
    } catch {
      setNote("Network trouble. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <Button type="button" variant="quiet" size="sm" onClick={sync} disabled={busy || disabled}>
        {busy ? "Reading the mailbox…" : "Sync now"}
      </Button>
      {note ? <span className="text-xs text-ink-3">{note}</span> : null}
    </span>
  );
}

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }
  return (
    <Button type="button" variant="ghost" size="sm" onClick={signOut}>
      Sign out
    </Button>
  );
}
