import type { ReactNode } from "react";

/*
 * One family of line icons: a 24 unit grid, a 1.75 stroke, round ends.
 * Colour comes from currentColor, so `text-lamp` on the icon lights it.
 * All decorative: the text beside each one says what it means.
 */

function Icon({ className = "size-5", children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

type P = { className?: string };

export const MailIcon = ({ className }: P) => (
  <Icon className={className}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
    <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
  </Icon>
);

export const CheckIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);

export const ChevronIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
  </Icon>
);

export const CloseIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  </Icon>
);

/** LinkedIn's mark (Simple Icons, CC0), filled. */
export const LinkedInIcon = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} aria-hidden="true" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
