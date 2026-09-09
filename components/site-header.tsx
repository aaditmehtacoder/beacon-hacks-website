"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { NAV } from "@/lib/event";
import { NotifyButton } from "./notify/notify-button";
import { LinkButton } from "./ui/button";
import { BeaconMark } from "./ui/beacon-mark";

export function SiteHeader() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });

  const [lifted, setLifted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  /* Solid-ish header once you leave the hero. */
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Underline the section you are actually looking at. */
  useEffect(() => {
    const ids = NAV.map((n) => n.href.slice(1));
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;

    /* Track which sections are in the middle band, and clear the highlight
       entirely once none of them are. Otherwise it sticks to whatever was
       last seen while you sit at the top of the page. */
    const inBand = new Set<string>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        const firstInBand = ids.find((id) => inBand.has(id));
        setActive(firstInBand ? `#${firstInBand}` : "");
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ${
        lifted
          ? "border-b border-line bg-paper/85 shadow-head backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <motion.div
        className="absolute inset-x-0 top-0 h-[2px] origin-left bg-beacon"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />

      <div className="wrap flex h-16 items-center gap-5">
        <a href="#top" className="flex shrink-0 items-center gap-2.5">
          <BeaconMark className="size-6 text-beacon drop-shadow-[0_0_6px_rgba(255,178,40,0.55)]" />
          <span className="font-display text-[0.9375rem] font-bold tracking-tight">
            BEACON HACKS
          </span>
        </a>

        <nav
          aria-label="Sections"
          className="ml-auto hidden items-center gap-1 lg:flex"
        >
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? "true" : undefined}
              className={`rounded-full px-3 py-1.5 text-[0.8125rem] transition-colors ${
                active === item.href
                  ? "bg-paper-warm text-ink"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {/* wrapped, because the button's own inline-flex outranks hidden */}
          <span className="hidden sm:inline-flex">
            <NotifyButton size="sm" variant="ghost">
              Get notified
            </NotifyButton>
          </span>
          <LinkButton href="/apply" size="sm">
            Apply
          </LinkButton>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Menu"
            className="grid size-9 place-items-center rounded-full border border-line text-ink transition-colors hover:border-line-hard lg:hidden"
          >
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
              {menuOpen ? (
                <path
                  d="M2 2l12 12M14 2L2 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              ) : (
                <path
                  d="M1 4h14M1 8h14M1 12h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          aria-label="Sections"
          className="wrap grid grid-cols-2 gap-1 border-t border-line-soft bg-paper/95 py-3 backdrop-blur-xl lg:hidden"
        >
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-[0.9375rem] text-ink-2 hover:bg-paper-warm hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
