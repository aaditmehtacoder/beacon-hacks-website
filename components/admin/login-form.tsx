"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/field";

export function LoginForm({
  configured,
  title = "Organizers only.",
  lede = "Applications and the notify list live behind this.",
}: {
  configured: boolean;
  title?: string;
  lede?: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(payload?.error ?? "That did not work.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network trouble. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-sm rounded-2xl border border-line bg-card p-6 sm:p-8">
      <h1 className="text-2xl">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-3">{lede}</p>
      {!configured ? (
        <p role="alert" className="mt-4 rounded-lg border border-danger-line bg-danger-wash px-3 py-2 text-sm text-danger">
          ADMIN_PASSWORD is not set on this deployment. Add it in Vercel and redeploy.
        </p>
      ) : null}
      <label className="mt-6 flex flex-col gap-2">
        <span className="label text-ink-3">Password</span>
        <input
          className={fieldClass}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          autoFocus
        />
      </label>
      {error ? (
        <p role="alert" className="mt-4 rounded-lg border border-danger-line bg-danger-wash px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="mt-6 w-full" disabled={sending || !configured}>
        {sending ? "Checking…" : "Sign in"}
      </Button>
    </form>
  );
}
