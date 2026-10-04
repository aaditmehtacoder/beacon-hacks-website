"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FieldError, fieldClass } from "@/components/ui/field";
import { useNotify } from "./notify-provider";
import { ROLES, loadNotifySchema, useNotifySignup, type Role } from "./use-notify-signup";

/**
 * The updates dialog. Mounted only while open, so every open starts from a
 * clean slate. Escape closes it, Tab stays inside it, the page behind does
 * not scroll, and focus goes back to whatever opened it.
 */
export default function NotifyDialog() {
  const { closeNotify, seedEmail } = useNotify();
  const { sending, done, emailError, error, setEmailError, submit } = useNotifySignup();
  const headingId = useId();
  const descId = useId();
  const emailId = useId();
  const schoolId = useId();

  const [email, setEmail] = useState(seedEmail);
  const [school, setSchool] = useState("");
  const [role, setRole] = useState<Role>("parent");

  const card = useRef<HTMLDivElement>(null);
  const emailField = useRef<HTMLInputElement>(null);
  const doneHeading = useRef<HTMLHeadingElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    emailField.current?.focus();
    void loadNotifySchema();
  }, []);

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      restoreFocusTo.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    if (done) doneHeading.current?.focus();
  }, [done]);

  useEffect(() => {
    if (emailError) emailField.current?.focus();
  }, [emailError]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeNotify();
        return;
      }
      if (e.key !== "Tab" || !card.current) return;
      const focusable = card.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])',
      );
      /* Radio groups take one tab stop: only the checked radio counts. */
      const stops = [...focusable].filter(
        (el) => !(el instanceof HTMLInputElement && el.type === "radio" && !el.checked),
      );
      if (!stops.length) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
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
    await submit({ email, school, role });
  }

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="fade-in absolute inset-0 cursor-default bg-scrim"
        onClick={closeNotify}
      />

      <div
        ref={card}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descId}
        className="rise-in relative max-h-[92dvh] w-full max-w-lg overflow-y-auto border-2 border-ink bg-card sm:shadow-[10px_10px_0_var(--color-beacon)]"
      >
        <span aria-hidden="true" className="block h-2.5 border-b-2 border-ink bg-beacon" />
        <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-7">
          {done ? (
            <h2
              id={headingId}
              ref={doneHeading}
              tabIndex={-1}
              className="text-[2rem] leading-none tracking-[-0.04em] focus:outline-none"
            >
              You are on the list.
            </h2>
          ) : (
            <h2 id={headingId} className="text-[2rem] leading-none tracking-[-0.04em]">
              Get updates.
            </h2>
          )}
          <button
            type="button"
            onClick={closeNotify}
            className="-mt-1 -mr-2 grid size-10 shrink-0 place-items-center rounded-full border-2 border-transparent text-ink transition-colors hover:border-ink"
          >
            <span className="sr-only">Close</span>
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="none">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {done ? (
          <div className="px-6 pt-4 pb-7 sm:px-8 sm:pb-8">
            <p id={descId} className="leading-relaxed text-ink-3">
              We have <span className="font-semibold text-ink">{email.trim().toLowerCase()}</span>.
              We will write when the date and venue are confirmed, and when there
              is real news after that. No newsletter.
            </p>
            <Button type="button" variant="ghost" className="mt-6" onClick={closeNotify}>
              Back to the site
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="px-6 pt-4 pb-7 sm:px-8 sm:pb-8">
            <p id={descId} className="leading-relaxed text-ink-3">
              For parents, mentors, judges and sponsors. We will write when the
              date and venue are confirmed.{" "}
              <Link href="/apply" onClick={closeNotify} className="link">
                A student? Apply instead.
              </Link>
            </p>

            <div className="mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor={emailId} className="font-display text-[0.9375rem] font-extrabold text-ink">
                  Email
                </label>
                <input
                  id={emailId}
                  ref={emailField}
                  className={fieldClass}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={emailError ? `${emailId}-error` : undefined}
                  required
                />
                {emailError ? <FieldError id={`${emailId}-error`}>{emailError}</FieldError> : null}
              </div>

              <fieldset>
                <legend className="mb-2 font-display text-[0.9375rem] font-extrabold text-ink">I am a</legend>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2.5 border-2 border-ink bg-card px-3 py-2.5 text-[0.9375rem] font-medium text-ink-2 transition-[background-color,box-shadow] hover:bg-paper has-checked:bg-beacon has-checked:text-ink has-checked:shadow-[3px_3px_0_var(--color-ink)] has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
                    >
                      <input
                        type="radio"
                        name="role"
                        value={opt.value}
                        checked={role === opt.value}
                        onChange={() => setRole(opt.value)}
                        className="size-4 shrink-0 accent-ink focus:outline-none"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={schoolId}
                  className="flex items-baseline justify-between gap-3 font-display text-[0.9375rem] font-extrabold text-ink"
                >
                  School or company
                  <span className="font-sans text-[0.8125rem] font-normal text-ink-3">Optional</span>
                </label>
                <input
                  id={schoolId}
                  className={fieldClass}
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  autoComplete="organization"
                />
              </div>
            </div>

            {error ? (
              <p role="alert" className="mt-5 border-2 border-danger bg-danger-wash px-3.5 py-2.5 text-[0.9375rem] text-danger">
                {error}
              </p>
            ) : null}

            <Button type="submit" variant="beacon" size="md" loading={sending} className="mt-7 w-full">
              {sending ? "Saving…" : "Send me updates"}
            </Button>
            <p className="mt-3 text-center text-[0.8125rem] text-ink-3">
              We only use your email for Beacon Hacks news.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
