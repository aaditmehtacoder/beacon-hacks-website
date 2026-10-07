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

export const CalendarIcon = ({ className }: P) => (
  <Icon className={className}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" strokeWidth="2.25" />
  </Icon>
);

export const PinIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" />
    <circle cx="12" cy="10" r="2.4" />
  </Icon>
);

export const CapIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M2.5 9 12 4.5 21.5 9 12 13.5Z" />
    <path d="M6.5 11.2v4.3c0 1.6 2.5 3.2 5.5 3.2s5.5-1.6 5.5-3.2v-4.3M21.5 9v5" />
  </Icon>
);

export const TicketIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M3.5 8A1.5 1.5 0 0 1 5 6.5h14A1.5 1.5 0 0 1 20.5 8v1.8a2.2 2.2 0 0 0 0 4.4V16a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 16v-1.8a2.2 2.2 0 0 0 0-4.4Z" />
    <path d="M14.5 6.5v11" strokeDasharray="1.6 2.2" />
  </Icon>
);

export const SparkIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M10 4.5 11.6 9l4.4 1.6-4.4 1.6L10 16.7l-1.6-4.5L4 10.6 8.4 9Z" />
    <path d="M17.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z" />
  </Icon>
);

export const UsersIcon = ({ className }: P) => (
  <Icon className={className}>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3 19.5c.6-3.2 3-5.2 6-5.2s5.4 2 6 5.2" />
    <path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14.6c1.9.5 3.2 2.2 3.5 4.9" />
  </Icon>
);

export const ClockIcon = ({ className }: P) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);

export const CodeIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M8.5 8 4.5 12l4 4M15.5 8l4 4-4 4M13.4 5.5l-2.8 13" />
  </Icon>
);

export const DoorIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M13.5 4.5h5v15h-5M9.5 8l4 4-4 4M13.5 12h-9" />
  </Icon>
);

export const MoonIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1Z" />
  </Icon>
);

export const TrophyIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M7.5 4.5h9v4.2a4.5 4.5 0 0 1-9 0Z" />
    <path d="M7.5 6.2h-3v1.4a3 3 0 0 0 3 3M16.5 6.2h3v1.4a3 3 0 0 1-3 3M12 13.2v3.3M8.5 20.5h7M9.6 20.5l.6-4h3.6l.6 4" />
  </Icon>
);

export const HourglassIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M6.5 3.5h11M6.5 20.5h11M7.5 3.5c0 4.6 4.5 5.4 4.5 8.5s-4.5 3.9-4.5 8.5M16.5 3.5c0 4.6-4.5 5.4-4.5 8.5s4.5 3.9 4.5 8.5" />
  </Icon>
);

export const MedalIcon = ({ className }: P) => (
  <Icon className={className}>
    <circle cx="12" cy="15" r="5" />
    <path d="M8.5 11.4 5.5 3.5h4L12 9.8l2.5-6.3h4l-3 7.9M12 13v2.8" />
  </Icon>
);

export const MailIcon = ({ className }: P) => (
  <Icon className={className}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
    <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
  </Icon>
);

export const BulbIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M9 17.5h6M10 20.5h4M12 3.5a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1 2.1v1.1h5.2v-1.1c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3.5Z" />
  </Icon>
);

/** LinkedIn's mark (Simple Icons, CC0), filled. */
export const LinkedInIcon = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} aria-hidden="true" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
