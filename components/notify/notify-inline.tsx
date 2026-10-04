"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, fieldDarkClass } from "@/components/ui/field";
import { ROLES, loadNotifySchema, useNotifySignup, type Role } from "./use-notify-signup";

/**
 * The updates list as an inline form, for the dark closing band. Same
 * endpoint and states as the dialog; the schema loads when the email field
 * is first focused.
 */
export function NotifyInline() {
  const { sending, done, emailError, error, setEmailError, submit } = useNotifySignup();
  const emailId = useId();
  const roleId = useId();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("parent");
  const emailField = useRef<HTMLInputElement>(null);
  const status = useRef<HTMLParagraphElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit({ email, role });
    if (ok) requestAnimationFrame(() => status.current?.focus());
    else emailField.current?.focus();
  }

  if (done) {
    return (
      <div className="border-2 border-band-line p-6">
        <p ref={status} tabIndex={-1} className="font-display text-[1.75rem] leading-none font-extrabold tracking-[-0.035em] focus:outline-none">
          You are on the list.
        </p>
        <p className="mt-3 leading-relaxed text-band-muted">
          We have <span className="font-semibold text-band-ink">{email.trim().toLowerCase()}</span>. One
          email when the date and venue are confirmed, then only real news.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4" aria-labelledby={`${emailId}-title`}>
      <p id={`${emailId}-title`} className="meta text-beacon">
        Not a student? Get updates
      </p>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={emailId} className="font-display text-[0.9375rem] font-extrabold text-band-ink">
          Email
        </label>
        <input
          id={emailId}
          ref={emailField}
          type="email"
          inputMode="email"
          autoComplete="email"
          className={fieldDarkClass}
          value={email}
          onFocus={() => void loadNotifySchema()}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? `${emailId}-error` : undefined}
          required
        />
        {emailError ? (
          <FieldError id={`${emailId}-error`} onDark>
            {emailError}
          </FieldError>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={roleId} className="font-display text-[0.9375rem] font-extrabold text-band-ink">
          I am a
        </label>
        <div className="relative">
          <select
            id={roleId}
            className={`${fieldDarkClass} appearance-none pr-10`}
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {ROLES.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-band text-band-ink">
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            fill="none"
            className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-band-ink"
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {error ? (
        <p role="alert" className="border-2 border-[#ff8a7a] px-3.5 py-2.5 text-[0.9375rem] text-[#ffb4a8]">
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="lamp" size="lg" loading={sending} className="mt-1 w-full">
        {sending ? "Saving…" : "Send me updates"}
      </Button>
      <p className="text-[0.8125rem] text-band-muted">For parents, mentors, judges and sponsors. Beacon Hacks news only.</p>
    </form>
  );
}
