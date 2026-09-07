"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { notifySchema } from "@/lib/notify-schema";
import { useNotify } from "./notify-provider";

type Role = "student" | "mentor" | "sponsor" | "other";

const ROLES: { value: Role; label: string }[] = [
  { value: "student", label: "I want to hack" },
  { value: "mentor", label: "I could mentor or judge" },
  { value: "sponsor", label: "I might sponsor" },
];

const fieldClass =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 text-[0.9375rem] text-ink " +
  "placeholder:text-ink-4 transition-colors focus:border-beacon focus:bg-card focus:outline-none " +
  "focus:ring-4 focus:ring-beacon/20";

/**
 * One step, one required field. Applications are not open, so this collects
 * only what is needed to tell someone when they are.
 */
export function NotifyModal() {
  const { open } = useNotify();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-100 flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={reduce ? undefined : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Dialog />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * Mounted only while the dialog is open, so every open starts from a clean
 * slate without resetting state from inside an effect.
 */
function Dialog() {
  const { closeNotify, seedEmail } = useNotify();
  const reduce = useReducedMotion();
  const headingId = useId();

  const [email, setEmail] = useState(seedEmail);
  const [school, setSchool] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => firstFieldRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      restoreFocusTo.current?.focus?.();
    };
  }, []);

  /* Escape closes; Tab stays inside the card. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeNotify();
        return;
      }
      if (e.key !== "Tab" || !cardRef.current) return;
      const focusable = cardRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeNotify]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = notifySchema.safeParse({ email, school, role });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(
          payload?.error ?? "We could not save that. Try again in a moment.",
        );
        return;
      }
      setDone(true);
    } catch {
      setError("Network trouble. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default bg-ink/35 backdrop-blur-[3px]"
        onClick={closeNotify}
      />

      <motion.div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="relative w-full max-w-lg overflow-hidden rounded-t-3xl border border-line bg-card shadow-[0_24px_80px_rgba(22,21,15,0.22)] sm:rounded-3xl"
        initial={reduce ? undefined : { y: 24, scale: 0.985, opacity: 0 }}
        animate={reduce ? undefined : { y: 0, scale: 1, opacity: 1 }}
        exit={reduce ? undefined : { y: 16, scale: 0.99, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 0.7, 0.25, 1] }}
      >
        <div className="flex items-center justify-between border-b border-line-soft px-6 py-4 sm:px-8">
          <span className="label text-ink-3">
            {done ? "You are on the list" : "Notify list"}
          </span>
          <button
            type="button"
            onClick={closeNotify}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full text-ink-3 transition-colors hover:bg-paper-warm hover:text-ink"
          >
            <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
              <path
                d="M1 1l14 14M15 1L1 15"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="px-6 pt-6 pb-7 sm:px-8 sm:pb-8"
        >
          {done ? (
            <div className="py-2 text-center">
              <span
                aria-hidden="true"
                className="mx-auto mb-6 block size-14 rounded-full bg-beacon shadow-[0_0_0_10px_rgba(242,161,0,0.16),0_0_40px_rgba(242,161,0,0.5)]"
              />
              <h2 id={headingId} className="text-2xl">
                Light is on.
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-ink-2">
                We have <span className="font-medium text-ink">{email}</span>.
                You will hear from us when applications actually open, and not
                before — no newsletter, no countdown emails.
              </p>
              <Button
                type="button"
                variant="ghost"
                className="mt-6"
                onClick={closeNotify}
              >
                Back to the site
              </Button>
            </div>
          ) : (
            <>
              <h2 id={headingId} className="text-2xl">
                Hear it first.
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">
                Applications are not open. Leave an email and we will tell you
                the day they are. One message, when there is actually news.
              </p>

              <div className="mt-6 flex flex-col gap-4">
                <label className="flex flex-col gap-2">
                  <span className="label text-ink-3">Email</span>
                  <input
                    ref={firstFieldRef}
                    className={fieldClass}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.edu"
                    autoComplete="email"
                  />
                </label>

                <fieldset className="flex flex-col gap-2">
                  <legend className="label mb-2 text-ink-3">You are</legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {ROLES.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        aria-pressed={role === opt.value}
                        onClick={() => setRole(opt.value)}
                        className={`rounded-xl border px-3 py-3 text-sm transition-all ${
                          role === opt.value
                            ? "border-beacon bg-beacon-wash font-medium text-ink shadow-[0_0_0_3px_rgba(242,161,0,0.16)]"
                            : "border-line bg-paper text-ink-2 hover:border-line-hard hover:text-ink"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="flex flex-col gap-2">
                  <span className="label text-ink-3">
                    School or company (optional)
                  </span>
                  <input
                    className={fieldClass}
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Carlmont High, 11th"
                  />
                </label>
              </div>

              {error ? (
                <p
                  role="alert"
                  className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
                >
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                size="md"
                className="mt-6 w-full"
                disabled={sending}
              >
                {sending ? "Sending…" : "Put me on the list"}
              </Button>
            </>
          )}
        </form>
      </motion.div>
    </>
  );
}
