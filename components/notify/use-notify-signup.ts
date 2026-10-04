"use client";

import { useState } from "react";

export type Role = "parent" | "mentor" | "sponsor" | "other";

export const ROLES: { value: Role; label: string }[] = [
  { value: "parent", label: "Parent or guardian" },
  { value: "mentor", label: "Mentor or judge" },
  { value: "sponsor", label: "Sponsor" },
  { value: "other", label: "Something else" },
];

/* The schema (zod) is the same one the API checks against, loaded on
   first use rather than with the page. */
let schema: Promise<typeof import("@/lib/notify-schema")> | null = null;
export const loadNotifySchema = () => (schema ??= import("@/lib/notify-schema"));

/**
 * Submits to the updates list (/api/notify). Validation, the request, and
 * honest loading, error and success states, shared by the dialog and the
 * inline form at the bottom of the page.
 */
export function useNotifySignup() {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(values: { email: string; school?: string; role: Role }): Promise<boolean> {
    setError(null);
    setSending(true);
    try {
      const { notifySchema } = await loadNotifySchema();
      const parsed = notifySchema.safeParse(values);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        if (issue?.path[0] === "email") {
          setEmailError(values.email.trim() ? "That email does not look right." : "Enter your email address.");
        } else {
          setError(issue?.message ?? "Check the form and try again.");
        }
        return false;
      }
      setEmailError(null);

      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(payload?.error ?? "We could not save that. Try again in a moment.");
        return false;
      }
      setDone(true);
      return true;
    } catch {
      setError("Network trouble. Check your connection and try again.");
      return false;
    } finally {
      setSending(false);
    }
  }

  return { sending, done, emailError, error, setEmailError, submit };
}
