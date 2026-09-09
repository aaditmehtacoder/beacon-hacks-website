export const THEME_KEY = "beacon-theme";

export type ThemePref = "system" | "light" | "dark";
export type Theme = "light" | "dark";

export const THEME_BG: Record<Theme, string> = {
  light: "#faf8f4",
  dark: "#0f0e0c",
};

/**
 * Runs synchronously in <head>, before the browser paints anything, and
 * writes both attributes the stylesheet reads:
 *
 *   data-theme       the resolved theme, light or dark
 *   data-theme-pref  what the visitor actually chose, system included
 *
 * Doing it here rather than in an effect is the whole reason there is no
 * white flash on a dark-mode machine. It is deliberately tiny and total:
 * private-mode localStorage throws, and the catch falls back to light.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var r=document.documentElement,p=localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)});if(p!=="light"&&p!=="dark")p="system";r.dataset.themePref=p;r.dataset.theme=p==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;}catch(e){var d=document.documentElement;d.dataset.themePref="system";d.dataset.theme="light";}})();`;
