"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  THEME_BG,
  THEME_KEY,
  type Theme,
  type ThemePref,
} from "./theme-script";

type ThemeContext = {
  /** What the visitor picked. "system" until they pick something. */
  pref: ThemePref;
  /** What that resolves to right now. */
  theme: Theme;
  setPref: (pref: ThemePref) => void;
  /** Flip to the opposite of whatever is on screen. */
  toggle: () => void;
};

const Ctx = createContext<ThemeContext | null>(null);

const DARK_QUERY = "(prefers-color-scheme: dark)";

/* ---------------------------------------------------------------- the store

   The two attributes on <html> are the source of truth, not React state. The
   boot script writes them before the first paint and CSS reads them, so React
   subscribes to them the same way it would to any browser API. That also means
   there is nothing to "catch up" after hydration.                            */

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-theme-pref"],
  });
  return () => observer.disconnect();
}

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function readPref(): ThemePref {
  const pref = document.documentElement.dataset.themePref;
  return pref === "light" || pref === "dark" ? pref : "system";
}

/* On the server there is no preference to read, so both snapshots describe an
   unstyled visitor. The client swaps to the real value on the first render. */
const serverTheme = (): Theme => "light";
const serverPref = (): ThemePref => "system";

function systemTheme(): Theme {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);
  const pref = useSyncExternalStore(subscribe, readPref, serverPref);
  const switchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apply = useCallback((next: ThemePref) => {
    const root = document.documentElement;
    const resolved: Theme = next === "system" ? systemTheme() : next;
    root.dataset.themePref = next;

    if (root.dataset.theme === resolved) return;

    /* Opt the page into a colour cross-fade for the length of the swap only.
       Transitioning colour permanently would make every hover feel laggy. */
    root.setAttribute("data-theme-switching", "");
    if (switchTimer.current) clearTimeout(switchTimer.current);
    switchTimer.current = setTimeout(
      () => root.removeAttribute("data-theme-switching"),
      280,
    );

    root.dataset.theme = resolved;

    /* Keep the mobile browser chrome on the same page as the site. */
    for (const meta of document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]',
    )) {
      meta.removeAttribute("media");
      meta.content = THEME_BG[resolved];
    }
  }, []);

  const setPref = useCallback(
    (next: ThemePref) => {
      try {
        if (next === "system") localStorage.removeItem(THEME_KEY);
        else localStorage.setItem(THEME_KEY, next);
      } catch {
        /* Private mode. The choice still holds for this page view. */
      }
      apply(next);
    },
    [apply],
  );

  const toggle = useCallback(() => {
    setPref(readTheme() === "dark" ? "light" : "dark");
  }, [setPref]);

  /* Follow the OS while the visitor has not overridden it. */
  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia(DARK_QUERY);
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref, apply]);

  useEffect(
    () => () => {
      if (switchTimer.current) clearTimeout(switchTimer.current);
    },
    [],
  );

  const value = useMemo(
    () => ({ pref, theme, setPref, toggle }),
    [pref, theme, setPref, toggle],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
