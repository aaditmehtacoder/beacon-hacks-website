"use client";

import { useTheme } from "./theme-provider";
import type { ThemePref } from "./theme-script";

const OPTIONS: { value: ThemePref; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

/**
 * The full choice, including handing the decision back to the operating
 * system. Lives in the footer because the header only needs the flip.
 *
 * Which pill looks selected is decided in CSS from `data-theme-pref` on
 * <html>; `aria-pressed` comes from React. Both agree, and the visual one
 * is correct before hydration.
 */
export function ThemeSelect() {
  const { pref, setPref } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme"
      className="inline-flex items-center gap-0.5 rounded-full border border-line bg-paper-deep/60 p-0.5"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          data-pref={option.value}
          aria-pressed={pref === option.value}
          onClick={() => setPref(option.value)}
          className="label rounded-full px-3 py-1.5 text-ink-3 transition-colors hover:text-ink"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
