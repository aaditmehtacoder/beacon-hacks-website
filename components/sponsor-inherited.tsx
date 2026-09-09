"use client";

import { useState } from "react";

/**
 * "Also includes N from below." A button rather than <details>, so a mouse
 * click does not leave a focus ring behind, and a grid-rows transition so
 * the list opens in place without measuring anything.
 */
export function Inherited({ id, items }: { id: string; items: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 border-t border-line-soft pt-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="label flex w-full items-center justify-between gap-3 py-1 text-left text-ink-3 transition-colors hover:text-ink"
      >
        Also includes {items.length} from below
        <span
          aria-hidden="true"
          className={`relative size-3 shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
        >
          <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
          <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current" />
        </span>
      </button>

      <div
        id={id}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "[grid-template-rows:1fr]" : "[grid-template-rows:0fr]"
        }`}
      >
        <ul className="min-h-0 overflow-hidden">
          {items.map((perk, i) => (
            <li
              key={perk}
              className={`flex items-start gap-3 py-2 text-sm leading-snug text-ink-3 ${i === 0 ? "mt-1" : ""}`}
            >
              <span
                aria-hidden="true"
                className="mt-[0.4rem] size-1.5 shrink-0 rounded-full border border-line-hard"
              />
              {perk}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
