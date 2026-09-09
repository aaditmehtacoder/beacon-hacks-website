import type { ReactNode } from "react";

/** The one text-field style, shared by the apply form, the modal and admin. */
export const fieldClass =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 text-[0.9375rem] text-ink " +
  "placeholder:text-ink-4 transition-colors focus:border-beacon focus:bg-card focus:outline-none " +
  "focus:ring-4 focus:ring-beacon/20";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-baseline justify-between gap-3">
        <span className="label text-ink-3">{label}</span>
        {hint ? <span className="text-xs text-ink-4">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}
