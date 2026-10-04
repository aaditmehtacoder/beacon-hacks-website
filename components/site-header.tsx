"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EVENT, NAV } from "@/lib/event";
import { LinkButton } from "./ui/button";
import { BeaconMark, DiscordIcon } from "./ui/beacon-mark";

/** Sections that light up a nav item while they fill the middle of the screen. */
const SECTION_TO_NAV: Record<string, string> = {
  about: "#about",
  schedule: "#schedule",
  judges: "#judges",
  sponsors: "#sponsors",
  sponsorship: "#sponsors",
  faq: "#faq",
};

type Props = {
  /** On the home page links are in-page anchors; elsewhere they go home first. */
  home?: boolean;
  /** Hide the Apply button where it would point at the page itself. */
  showApply?: boolean;
};

/**
 * The sticky header. The phone menu is a native <details> disclosure, so it
 * opens and closes even before (or without) JavaScript; script only adds
 * the niceties: Escape, a click outside, or following a link closes it.
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
      className={`on-dark sticky top-0 z-50 border-b bg-band text-band-ink transition-[border-color] duration-200 ${
        scrolled || open ? "border-band-line" : "border-transparent"
      }`}
    >
      <div className="wrap flex h-[4.5rem] items-center gap-6">
        <Link
          href={home ? "#top" : "/"}
          className="-mx-1 flex shrink-0 items-center gap-2.5 rounded-full px-1 py-1"
          aria-label="Beacon Hacks, home"
        >
          <BeaconMark className="size-8 text-beacon" />
          <span className="font-display text-[1.25rem] leading-none font-extrabold tracking-[-0.035em]">
            Beacon Hacks
          </span>
        </Link>

        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const current = home && active === item.href;
            return (
              <a
                key={item.href}
                href={href(item.href)}
                aria-current={current ? "true" : undefined}
                className={`relative rounded-full px-3 py-2 font-display text-[0.9375rem] font-bold transition-colors ${
                  current ? "text-beacon" : "text-band-ink hover:text-beacon"
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-3 bottom-0.5 h-0.5 rounded-full bg-beacon transition-opacity duration-200 ${
                    current ? "opacity-100" : "opacity-0"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          {discord ? (
            <a
              href={discord}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden size-10 place-items-center rounded-full text-band-ink transition-colors hover:bg-band-ink/10 hover:text-beacon sm:grid"
            >
              <DiscordIcon className="size-5" />
              <span className="sr-only">Beacon Hacks on Discord (opens in a new tab)</span>
            </a>
          ) : null}

          {showApply ? (
            <LinkButton href="/apply" variant="lamp-flat" size="sm">
              Apply early
            </LinkButton>
          ) : null}

          <details
            ref={menu}
            className="group lg:hidden"
            onToggle={(e) => setOpen(e.currentTarget.open)}
          >
            <summary className="grid size-10 cursor-pointer place-items-center rounded-full border-2 border-band-ink/40 text-band-ink transition-colors hover:border-band-ink">
              <span className="sr-only">Menu</span>
              <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="none">
                <path
                  className="group-open:hidden"
                  d="M2 4.5h12M2 8h12M2 11.5h12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  className="hidden group-open:block"
                  d="M3.5 3.5l9 9M12.5 3.5l-9 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </summary>

            <div className="absolute inset-x-0 top-full border-b-2 border-beacon bg-band">
              <nav aria-label="Main" className="wrap flex flex-col py-3">
                {NAV.map((item) => (
                  <a
                    key={item.href}
                    href={href(item.href)}
                    onClick={() => closeMenu(false)}
                    className="flex items-center justify-between border-b border-band-line py-4 font-display text-2xl font-extrabold tracking-[-0.03em] text-band-ink last:border-b-0 hover:text-beacon"
                  >
                    {item.label}
                    <span aria-hidden="true" className="text-beacon">↗</span>
                  </a>
                ))}
                {discord ? (
                  <a
                    href={discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => closeMenu(false)}
                    className="flex items-center gap-3 py-4 font-display text-2xl font-extrabold tracking-[-0.03em] text-band-ink hover:text-beacon"
                  >
                    <DiscordIcon className="size-6 text-beacon" />
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
