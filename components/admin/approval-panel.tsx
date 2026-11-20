"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { waiverStage, type Waiver } from "@/lib/waiver";

const WHEN = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/**
 * Where a waiver stands, and the one action it needs: approve and send
 * "you're in" (the email is previewed just below), or send it again if it
 * did not go out.
 */
export function ApprovalPanel({ waiver, emailing, recipients }: { waiver: Waiver; emailing: boolean; recipients: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function act(action: "approve" | "resend" | "remind-guardian" | "paper-received") {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/waivers", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: waiver.id, action }),
      });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok || payload?.error) setMessage(payload?.error ?? "That did not work. Try again.");
      router.refresh();
    } catch {
      setMessage("Network trouble. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (waiverStage(waiver) === "guardian") {
    const paper = waiver.guardianMethod === "paper";
    return (
      <div className="flex flex-col gap-4 rounded-2xl bg-fog-2 p-6 sm:p-7 print:hidden">
        <div>
          <p className="kicker text-ink-2">Waiting for {waiver.guardianName} to sign</p>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">
            {paper
              ? `${waiver.firstName} chose to print it. Once the signed copy arrives (by email to the team, or at check-in), mark it received. Then you can approve.`
              : `We emailed ${waiver.guardianEmail} a link to sign${waiver.guardianRequestedAt ? ` on ${WHEN.format(new Date(waiver.guardianRequestedAt))}` : ""}. You can approve once they do.`}
          </p>
          {message ? <p className="mt-2 text-[0.875rem] font-semibold text-danger">{message}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ink" size="md" loading={busy} onClick={() => act("paper-received")}>
            Paper copy received
          </Button>
          <Button type="button" variant="outline" size="md" disabled={busy || !emailing} onClick={() => act("remind-guardian")}>
            {paper ? "Email them a link instead" : "Email the link again"}
          </Button>
        </div>
      </div>
    );
  }

  const approved = !!waiver.approvedAt;
  const emailed = !!waiver.approvalEmailedAt;

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7 print:hidden ${
        approved && emailed ? "bg-[oklch(0.95_0.05_150)]" : approved ? "bg-danger-wash" : "night"
      }`}
    >
      <div>
        <p className={`kicker ${approved ? "text-ink-2" : "text-lamp"}`}>
          {approved ? (emailed ? "Approved and emailed" : "Approved, email not sent") : "Waiting for approval"}
        </p>
        <p className={`mt-2 text-[0.9375rem] leading-relaxed ${approved ? "text-ink-2" : "text-moon-2"}`}>
          {approved && emailed
            ? `Approved ${WHEN.format(new Date(waiver.approvedAt!))}. "You're in" went to ${recipients} on ${WHEN.format(new Date(waiver.approvalEmailedAt!))}.`
            : approved
              ? `Approved ${WHEN.format(new Date(waiver.approvedAt!))}, but the email failed${waiver.approvalEmailError ? `: ${waiver.approvalEmailError}` : "."}`
              : `Approving sends the email below to ${recipients}.${emailing ? "" : " Email is not set up, so it would be approved without sending."}`}
        </p>
        {message ? <p className="mt-2 text-[0.875rem] font-semibold text-danger">{message}</p> : null}
      </div>
      {!approved ? (
        <Button type="button" size="lg" loading={busy} onClick={() => act("approve")} className="shrink-0">
          Approve and send
        </Button>
      ) : (
        <Button type="button" variant={emailed ? "outline" : "ink"} size="md" loading={busy} onClick={() => act("resend")} className="shrink-0">
          {emailed ? "Send the email again" : "Try sending again"}
        </Button>
      )}
    </div>
  );
}
