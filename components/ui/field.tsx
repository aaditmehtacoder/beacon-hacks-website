import type { ReactNode } from "react";

/**
 * The one text-field style, shared by the apply form and the updates form:
 * rounded, hairline-bordered, 16px text so phones do not zoom on focus.
 * Focus darkens the border and adds a soft lamp halo; an input with
 * aria-invalid="true" turns red.
 */
export const fieldClass =
  "w-full rounded-xl border border-line-2 bg-card px-4 py-3 text-base text-ink " +
  "placeholder:text-ink-3/70 transition-[border-color,box-shadow] duration-200 " +
  "hover:border-ink-3/60 focus:border-ink focus:shadow-[0_0_0_4px_rgb(255_199_44/0.35)] focus:outline-none " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:shadow-[0_0_0_4px_rgb(180_35_24/0.18)]";

/** The same field on the night: moon text, a lamp border on focus. */
export const fieldNightClass =
  "w-full rounded-xl border border-moon/20 bg-moon/[0.04] px-4 py-3 text-base text-moon " +
  "placeholder:text-moon-3/70 transition-[border-color,box-shadow,background-color] duration-200 " +
  "hover:border-moon/35 focus:border-lamp focus:bg-moon/[0.06] focus:shadow-[0_0_0_4px_rgb(255_199_44/0.18)] focus:outline-none " +
  "aria-[invalid=true]:border-danger-night";

/** Ids for the hint and error lines of a field, for aria-describedby. */
export const describedBy = (id: string, hint: boolean, error: boolean) =>
  [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;

export function Field({
  id,
  label,
  optional = false,
  hint,
  error,
  children,
}: {
  /** The id of the control inside; the label points at it. */
  id: string;
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[0.9375rem] font-semibold text-ink">
        {label}
        {optional ? <span className="text-[0.8125rem] font-normal text-ink-3">Optional</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-[0.8125rem] text-ink-3">
          {hint}
        </p>
      ) : null}
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </div>
  );
}

export function FieldError({ id, children, onNight = false }: { id: string; children: ReactNode; onNight?: boolean }) {
  return (
    <p id={id} className={`flex items-start gap-1.5 text-[0.875rem] leading-snug font-medium ${onNight ? "text-danger-night" : "text-danger"}`}>
      <svg viewBox="0 0 16 16" className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.75v3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.9" fill="currentColor" />
      </svg>
      {children}
    </p>
  );
}
