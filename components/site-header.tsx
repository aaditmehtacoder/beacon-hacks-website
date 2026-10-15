"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EVENT, NAV } from "@/lib/event";
import { ApplyButton } from "./apply/apply-button";
import { BeaconMark, DiscordIcon } from "./ui/beacon-mark";
import { OutArrow } from "./ui/button";

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
  /** For a page that opens on the night: it runs up under the header, and
      the glass starts out clearer so the sky shows through. Elsewhere the
      header keeps its own place above the page. */
  overlay?: boolean;
};

/**
 * The sticky header: a bar of night glass floating at the top of the page,
 * with Donate, the Discord invite and Apply at its right. The phone menu is a
 * native <details> disclosure, so it opens and closes even before (or
 * without) JavaScript; script only adds the niceties: Escape, a click
 * outside, or following a link closes it.
 */
export function SiteHeader({ home = true, showApply = true, overlay = false }: Props) {
  const menu = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const discord = EVENT.social.discord;
  const href = (anchor: string) => (home ? anchor : `/${anchor}`);
  /* At the top of a night page only the sky is behind the glass. */
  const clear = overlay && !scrolled && !open;

  const closeMenu = useCallback((returnFocus: boolean) => {
    const details = menu.current;
    if (!details?.open) return;
    details.open = false;
    if (returnFocus) details.querySelector("summary")?.focus();
  }, []);

  /* Once the page moves, the glass smokes over: content passes beneath. */
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
      className={`pointer-events-none sticky top-0 z-50 pt-2 sm:pt-3 ${overlay ? "-mb-[var(--header-h)]" : ""}`}
    >
      <div className="wrap">
        {/* The gap above plus this bar's h-14 make --header-h. */}
        <div
          className={`glass pointer-events-auto relative -mx-3 flex h-14 items-center gap-3 rounded-full pr-2 pl-3 sm:-mx-4 sm:gap-6 sm:pl-4 ${
            clear ? "[--glass-tint:42%]" : ""
          }`}
        >
          {/* The lamp catching the rim of the glass. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 -bottom-px h-px bg-linear-to-r from-transparent via-lamp/35 to-transparent"
          />

          <Link
            href={home ? "#top" : "/"}
            className="-mx-1.5 flex shrink-0 items-center gap-2.5 rounded-full px-1.5 py-1"
            aria-label="Beacon Hacks, home"
          >
            <BeaconMark className="size-7 text-lamp" />
            <span className="text-[1.0625rem] leading-none font-bold font-stretch-125% tracking-[-0.02em]">Beacon Hacks</span>
          </Link>

          <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {NAV.map((item) => {
              const current = home && active === item.href;
              return (
                <a
                  key={item.href}
                  href={href(item.href)}
                  aria-current={current ? "true" : undefined}
                  className={`rounded-full px-3.5 py-2 text-[0.9375rem] font-medium transition-colors duration-200 ${
                    current ? "bg-moon/8 text-lamp" : "text-moon-2 hover:bg-moon/6 hover:text-moon"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <a
              href={EVENT.hcb.donate}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 items-center rounded-full border border-moon/20 px-3.5 text-[0.875rem] font-semibold font-stretch-[112.5%] tracking-[-0.005em] whitespace-nowrap text-moon transition-[border-color,color,transform] duration-200 ease-out-quart hover:-translate-y-px hover:border-lamp/70 hover:text-lamp active:translate-y-0 sm:inline-flex"
            >
              Donate
              <span className="sr-only"> (opens in a new tab)</span>
            </a>

            {discord ? (
              <a
                href={discord}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden h-9 items-center gap-2 rounded-full border border-moon/20 px-3.5 text-[0.875rem] font-semibold font-stretch-[112.5%] tracking-[-0.005em] whitespace-nowrap text-moon transition-[background-color,border-color,transform] duration-200 ease-out-quart hover:-translate-y-px hover:border-[#5865f2] hover:bg-[#5865f2] active:translate-y-0 sm:inline-flex"
              >
                <DiscordIcon className="size-[1.125rem]" />
                <span aria-hidden="true">Discord</span>
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

              <div className="glass pop absolute inset-x-0 top-full mt-2 rounded-[1.75rem] p-2 [--glass-tint:90%]">
                <nav aria-label="Main" className="flex flex-col">
                  {NAV.map((item) => (
                    <a
                      key={item.href}
                      href={href(item.href)}
                      onClick={() => closeMenu(false)}
                      className="rounded-[1.25rem] px-4 py-3 text-[1.375rem] font-bold font-stretch-125% tracking-[-0.02em] text-moon transition-colors hover:bg-moon/6 hover:text-lamp"
                    >
                      {item.label}
                    </a>
                  ))}
                  <a
                    href={EVENT.hcb.donate}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => closeMenu(false)}
                    className="group mt-2 flex items-center justify-between rounded-[1.25rem] border border-moon/20 px-4 py-3.5 text-[1.0625rem] font-semibold font-stretch-[112.5%] text-moon transition-colors hover:border-lamp/70 hover:text-lamp"
                  >
                    Donate
                    <OutArrow />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                  {discord ? (
                    <a
                      href={discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => closeMenu(false)}
                      className="mt-2 flex items-center gap-3 rounded-[1.25rem] bg-[#5865f2] px-4 py-3.5 text-[1.0625rem] font-semibold font-stretch-[112.5%] text-white transition-colors hover:bg-[#4752c4]"
                    >
                      <DiscordIcon className="size-6" />
                      Join the Discord
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  ) : null}
                </nav>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
