"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, describedBy, fieldClass } from "@/components/ui/field";

/** One shared password (ADMIN_PASSWORD); the cookie lasts thirty days. */
export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent) {
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
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm rounded-[1.75rem] border border-line bg-card p-7 shadow-[0_40px_80px_-50px_rgb(15_24_40/0.45)] sm:p-9"
    >
      <h1 className="text-[1.75rem] leading-none font-extrabold tracking-[-0.03em]">Organizers only</h1>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-3">Applications and the updates list.</p>

      {!configured ? (
        <p role="alert" className="mt-5 rounded-xl bg-danger-wash px-4 py-3 text-[0.875rem] leading-snug text-danger">
          ADMIN_PASSWORD is not set on this deployment. Add it in Vercel and redeploy.
        </p>
      ) : null}

      <div className="mt-7">
        <Field id="admin-password" label="Password" error={error}>
          <input
            id="admin-password"
            className={fieldClass}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy("admin-password", false, !!error)}
            autoFocus
            required
          />
        </Field>
      </div>

      <Button type="submit" size="lg" className="mt-7 w-full" loading={sending} disabled={!configured}>
        Sign in
      </Button>
    </form>
  );
}
