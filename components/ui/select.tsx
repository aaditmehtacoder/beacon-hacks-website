"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { CheckIcon, ChevronIcon } from "./icons";

type Option<T extends string> = { value: T; label: string };

/**
 * A dropdown drawn to match the night, in place of the system menu. A
 * button opens a listbox; the arrow keys, Home and End move through it,
 * Enter or Space picks, Escape or Tab closes, and typing a letter jumps to
 * the option that starts with it. Focus returns to the button on close.
 */
export function Select<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  /** Read before the value, e.g. "I am a". */
  label: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const selected = Math.max(0, options.findIndex((o) => o.value === value));

  function show(at = selected) {
    setActive(at);
    setOpen(true);
  }

  function close(refocus = true) {
    setOpen(false);
    if (refocus) button.current?.focus();
  }

  function choose(i: number) {
    onChange(options[i].value);
    close();
  }

  /* The list takes focus when it opens, so the keys land there. */
  useEffect(() => {
    if (open) list.current?.focus();
  }, [open]);

  /* A click anywhere else closes it. */
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  });

  function onButtonKey(e: KeyboardEvent) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      show(e.key === "ArrowUp" ? Math.max(0, selected - 1) : selected);
    }
  }

  function onListKey(e: KeyboardEvent) {
    const last = options.length - 1;
    if (e.key === "ArrowDown") setActive((i) => Math.min(last, i + 1));
    else if (e.key === "ArrowUp") setActive((i) => Math.max(0, i - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(last);
    else if (e.key === "Enter" || e.key === " ") choose(active);
    else if (e.key === "Escape") close();
    else if (e.key === "Tab") return close(false);
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const from = options.slice(active + 1).concat(options.slice(0, active + 1));
      const hit = from.find((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (hit) setActive(options.indexOf(hit));
    } else return;
    e.preventDefault();
  }

  return (
    <div ref={root} className="relative">
      <span id={`${id}-label`} className="sr-only">
        {label}
      </span>
      <button
        ref={button}
        id={`${id}-button`}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-labelledby={`${id}-label ${id}-button`}
        onClick={() => (open ? close() : show())}
        onKeyDown={onButtonKey}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-moon/[0.04] px-4 py-3 text-left text-base text-moon transition-[border-color,box-shadow,background-color] duration-200 hover:border-moon/35 focus-visible:border-lamp focus-visible:shadow-[0_0_0_4px_rgb(255_199_44/0.18)] focus-visible:outline-none ${
          open ? "border-lamp bg-moon/[0.06] shadow-[0_0_0_4px_rgb(255_199_44/0.18)]" : "border-moon/20"
        }`}
      >
        <span className="truncate">{options[selected].label}</span>
        <ChevronIcon className={`size-4 text-moon-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-option-${active}`}
          onKeyDown={onListKey}
          className="pop absolute inset-x-0 top-full z-30 mt-2 min-w-max rounded-2xl border border-moon/12 bg-night-2 p-1.5 shadow-[0_28px_60px_-24px_rgb(0_0_0/0.75)] focus:outline-none"
        >
          {options.map((option, i) => {
            const isSelected = i === selected;
            return (
              <li
                key={option.value}
                id={`${id}-option-${i}`}
                role="option"
                aria-selected={isSelected}
                onPointerMove={() => setActive(i)}
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center justify-between gap-6 rounded-xl px-3.5 py-2.5 text-[0.9375rem] transition-colors duration-100 ${
                  i === active ? "bg-moon/10 text-moon" : "text-moon-2"
                }`}
              >
                {option.label}
                <CheckIcon className={`size-4 text-lamp ${isSelected ? "opacity-100" : "opacity-0"}`} />
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
