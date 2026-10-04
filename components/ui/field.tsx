import type { ReactNode } from "react";

/**
 * The one text-field style, shared by the apply form, the updates dialog
 * and the organiser pages: square, ink-bordered, 16px text so phones do
 * not zoom on focus. Focus drops a hard ink shadow under the field (16:1
 * on cream); an input with aria-invalid="true" turns red.
 */
export const fieldClass =
  "w-full rounded-none border-2 border-ink bg-card px-3.5 py-2.5 text-base text-ink " +
  "placeholder:text-ink-4 transition-[box-shadow,background-color] " +
  "focus:bg-paper focus:shadow-[4px_4px_0_var(--color-ink)] focus:outline-none " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:shadow-[4px_4px_0_var(--color-danger)]";

/** The same field on a dark band: cream text, a yellow shadow on focus. */
export const fieldDarkClass =
  "w-full rounded-none border-2 border-band-line bg-transparent px-3.5 py-3 text-base text-band-ink " +
  "placeholder:text-band-muted/70 transition-[box-shadow,border-color] " +
  "focus:border-band-ink focus:shadow-[4px_4px_0_var(--color-beacon)] focus:outline-none " +
  "aria-[invalid=true]:border-[#ff8a7a]";

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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 font-display text-[0.9375rem] font-extrabold text-ink">
        {label}
        {optional ? <span className="font-sans text-[0.8125rem] font-normal text-ink-3">Optional</span> : null}
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

export function FieldError({ id, children, onDark = false }: { id: string; children: ReactNode; onDark?: boolean }) {
  return (
    <p id={id} className={`flex items-start gap-1.5 text-[0.875rem] leading-snug font-medium ${onDark ? "text-[#ffb4a8]" : "text-danger"}`}>
      <svg viewBox="0 0 16 16" className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.75v3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.9" fill="currentColor" />
      </svg>
      {children}
    </p>
  );
}
