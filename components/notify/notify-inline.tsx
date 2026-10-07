"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, fieldNightClass } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { EVENT } from "@/lib/event";
import { ROLES, loadNotifySchema, useNotifySignup, type Role } from "./use-notify-signup";

/**
 * The updates list, for everyone who is not applying: parents, mentors,
 * judges, sponsors. One required field, on the night at the end of the
 * page. The schema loads when the email field is first focused.
 */
export function NotifyInline() {
  const { sending, done, emailError, error, setEmailError, submit } = useNotifySignup();
  const emailId = useId();
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
      <div>
        <p ref={status} tabIndex={-1} className="text-[1.5rem] leading-tight font-bold font-stretch-[118%] tracking-[-0.025em] focus:outline-none">
          You are on the list.
        </p>
        <p className="mt-3 leading-relaxed text-moon-2">
          We have <span className="font-semibold text-moon">{email.trim().toLowerCase()}</span>. One
          email when the {EVENT.venue.confirmed ? "date is" : "date and venue are"} confirmed, then
          only real news.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-labelledby={`${emailId}-title`}>
      <p id={`${emailId}-title`} className="text-[1.25rem] leading-tight font-bold font-stretch-[118%] tracking-[-0.02em]">
        Not a student? Get updates.
      </p>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-moon-3">
        For parents, mentors, judges and sponsors.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_13.5rem_auto] sm:items-start">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={emailId} className="sr-only">
            Email
          </label>
          <input
            id={emailId}
            ref={emailField}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={fieldNightClass}
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
            <FieldError id={`${emailId}-error`} onNight>
              {emailError}
            </FieldError>
          ) : null}
        </div>

        <Select label="I am a" value={role} onChange={setRole} options={ROLES} />

        <Button type="submit" size="lg" loading={sending} className="h-[3.125rem]">
          {sending ? "Saving…" : "Send me updates"}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-xl border border-danger-night/50 px-4 py-3 text-[0.9375rem] text-danger-night">
          {error}
        </p>
      ) : null}
    </form>
  );
}
