"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EVENT, NAV } from "@/lib/event";
import { ApplyButton } from "./apply/apply-button";
import { BeaconMark, DiscordIcon } from "./ui/beacon-mark";

/** Sections that light up a nav item while they fill the middle of the screen. */
const SECTION_TO_NAV: Record<string, string> = {
  about: "#about",
  tracks: "#about",
  schedule: "#schedule",
  judges: "#judges",
  sponsors: "#sponsors",
  faq: "#faq",
};

type Props = {
  /** On the home page links are in-page anchors; elsewhere they go home first. */
  home?: boolean;
  /** Hide the Apply button where it would point at the page itself. */
  showApply?: boolean;
};

/**
 * The sticky header, on the night. The phone menu is a native <details>
 * disclosure, so it opens and closes even before (or without) JavaScript;
 * script only adds the niceties: Escape, a click outside, or following a
 * link closes it.
 */
export function SiteHeader({ home = true, showApply = true }: Props) {
  const menu = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const discord = EVENT.social.discord;
  const href = (anchor: string) => (home ? anchor : `/${anchor}`);

  const closeMenu = useCallback((returnFocus: boolean) => {
    const details = menu.current;
    if (!details?.open) return;
    details.open = false;
    if (returnFocus) details.querySelector("summary")?.focus();
  }, []);

  /* A hairline under the header once the page has moved. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* While the menu is open: Escape, a click outside it, or growing to the
     desktop layout closes it. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu(true);
    };
    const onPointer = (e: PointerEvent) => {
      if (menu.current && !menu.current.contains(e.target as Node)) closeMenu(false);
    };
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = () => wide.matches && closeMenu(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      wide.removeEventListener("change", onWide);
    };
  }, [open, closeMenu]);

  /* Mark the nav item for the section filling the middle of the screen. */
  useEffect(() => {
    if (!home) return;
    const nodes = Object.keys(SECTION_TO_NAV)
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => n !== null);
    if (!nodes.length) return;

    const inBand = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        const first = nodes.find((n) => inBand.has(n.id));
        setActive(first ? SECTION_TO_NAV[first.id] : "");
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [home]);

  return (
    <header
      className={`night sticky top-0 z-50 border-b transition-[border-color] duration-300 ${
        scrolled || open ? "border-moon/10" : "border-transparent"
      }`}
    >
      <div className="wrap flex h-16 items-center gap-6">
        <Link
          href={home ? "#top" : "/"}
          className="-mx-1.5 flex shrink-0 items-center gap-2.5 rounded-full px-1.5 py-1"
          aria-label="Beacon Hacks, home"
        >
          <BeaconMark className="size-7 text-lamp" />
          <span className="text-[1.0625rem] leading-none font-bold font-stretch-125% tracking-[-0.02em]">Beacon Hacks</span>
        </Link>

        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const current = home && active === item.href;
            return (
              <a
                key={item.href}
                href={href(item.href)}
                aria-current={current ? "true" : undefined}
                className={`rounded-full px-3.5 py-2 text-[0.9375rem] font-medium transition-colors duration-200 ${
                  current ? "text-lamp" : "text-moon-2 hover:text-moon"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-3">
          {discord ? (
            <a
              href={discord}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden size-10 place-items-center rounded-full text-moon-2 transition-colors hover:bg-moon/10 hover:text-moon sm:grid"
            >
              <DiscordIcon className="size-5" />
              <span className="sr-only">Beacon Hacks on Discord (opens in a new tab)</span>
            </a>
          ) : null}

          {showApply ? <ApplyButton size="sm">Apply</ApplyButton> : null}

          <details ref={menu} className="group lg:hidden" onToggle={(e) => setOpen(e.currentTarget.open)}>
            <summary className="grid size-10 cursor-pointer place-items-center rounded-full text-moon transition-colors hover:bg-moon/10">
              <span className="sr-only">Menu</span>
              <svg viewBox="0 0 16 16" className="size-[1.125rem]" aria-hidden="true" fill="none">
                <path
                  className="group-open:hidden"
                  d="M2 5h12M2 11h12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  className="hidden group-open:block"
                  d="M3.5 3.5l9 9M12.5 3.5l-9 9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </summary>

            <div className="night absolute inset-x-0 top-full border-b border-moon/10">
              <nav aria-label="Main" className="wrap flex flex-col pt-2 pb-6">
                {NAV.map((item) => (
                  <a
                    key={item.href}
                    href={href(item.href)}
                    onClick={() => closeMenu(false)}
                    className="border-b border-moon/10 py-4 text-[1.375rem] font-bold font-stretch-125% tracking-[-0.02em] text-moon transition-colors hover:text-lamp"
                  >
                    {item.label}
                  </a>
                ))}
                {discord ? (
                  <a
                    href={discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => closeMenu(false)}
                    className="flex items-center gap-3 py-4 text-[1.375rem] font-bold font-stretch-125% tracking-[-0.02em] text-moon hover:text-lamp"
                  >
                    <DiscordIcon className="size-6 text-lamp" />
                    Join the Discord
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ) : null}
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
