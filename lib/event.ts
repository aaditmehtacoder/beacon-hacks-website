/**
 * Every fact about the event that appears in more than one place.
 *
 * RULE FOR THIS FILE: nothing in here may state something we have not
 * actually secured. Anything still being arranged carries `confirmed:
 * false` and a note saying what confirms it, and the site renders that
 * note next to the fact instead of asserting it.
 */
export const EVENT = {
  name: "Beacon Hacks",
  tagline: "A free hackathon for Bay Area high school builders.",

  /** The target date. It is confirmed together with the venue. */
  date: {
    iso: "2027-01-30",
    label: "Saturday, January 30, 2027",
    short: "Sat, Jan 30, 2027",
    confirmed: false,
    note: "Target date, confirmed with the venue",
  },

  /**
   * The shape of the day, from the draft schedule in lib/content.ts.
   * The day runs 8:30 AM to 11 PM; building runs 10 AM to 9 PM.
   */
  hours: {
    label: "8:30 AM to 11 PM",
    hacking: "10 AM to 9 PM",
    hackingHours: 11,
  },

  /**
   * The venue is in approval and the host has asked us not to use their
   * name publicly yet, so nothing here identifies them. Fill in `name`
   * and `address` and set `confirmed: true` only after written approval.
   */
  venue: {
    confirmed: false,
    city: "Belmont",
    region: "CA",
    label: "Belmont, California",
    note: "Venue announced after the host’s written approval",
  },

  eligibility: {
    label: "High school students",
    detail: "Grades 9 to 12, no experience needed",
  },

  teamSize: "1 to 4",

  /** Planned capacity, not a count of signups. */
  capacityLabel: "75 to 100",

  /** Cash only. In-kind support never moves `raisedUsd`. */
  budget: {
    targetUsd: 10_500,
    raisedUsd: 0,
  },

  /**
   * Early applications are open: anyone can apply now. Spots are
   * confirmed once the venue and the budget are set.
   */
  applications: {
    open: true,
    early: true,
    label: "Open early",
    note: "Spots confirmed once the venue and budget are set",
  },

  /**
   * One inbox. Split sponsors off to its own address if one is set up;
   * every link on the site reads from here.
   */
  email: {
    team: "team@beaconhacks.com",
    sponsors: "team@beaconhacks.com",
  },

  /**
   * Community links. An empty string hides the link everywhere it
   * appears, so there is never a dead button; paste the invite URL
   * (https://discord.gg/...) to show the Discord logo in the header,
   * the FAQ and the footer.
   */
  social: {
    discord: "",
  },

  /** The primary host. The apex redirects here, so canonicals point here. */
  url: "https://www.beaconhacks.com",
} as const;

export const NAV = [
  { href: "#about", label: "About" },
  { href: "#schedule", label: "Schedule" },
  { href: "#judges", label: "Judges" },
  { href: "#sponsors", label: "Sponsors" },
  { href: "#faq", label: "FAQ" },
] as const;

/** A mailto link with the subject (and optional body) filled in. */
export function mailto(subject: string, body?: string, to: string = EVENT.email.team) {
  const params = new URLSearchParams({ subject, ...(body ? { body } : {}) });
  /* URLSearchParams encodes spaces as "+", which mail clients show
     literally; mailto wants %20. */
  return `mailto:${to}?${params.toString().replace(/\+/g, "%20")}`;
}
