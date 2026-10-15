/**
 * Every fact about the event that appears in more than one place.
 *
 * RULE FOR THIS FILE: nothing in here may state something we have not
 * actually secured. Anything still being arranged carries `confirmed:
 * false` and a note saying what confirms it, and the site renders that
 * note next to the fact instead of asserting it.
 */
type Venue = {
  /** True once the host has approved in writing; names it everywhere. */
  confirmed: boolean;
  city: string;
  label: string;
  /** Shown where the venue would be named, until it is. */
  note: string;
  /** The host, its building and address: set together with `confirmed`. */
  name?: string;
  place?: string;
  address?: string;
  /** A map link for the address. */
  map?: string;
};

/**
 * The venue is being finalized. The venue sponsor's logo shows in the
 * sponsors section (VENUE_SPONSOR in lib/content.ts), but the venue is not
 * named or addressed anywhere else until the host approves in writing.
 * Then fill in `name`, `place`, `address` and `map`, set `confirmed: true`,
 * and set VENUE_SPONSOR's status to "confirmed" with its line and address.
 * The hero, schedule, FAQ, apply page, footer and share card follow.
 */
const VENUE: Venue = {
  confirmed: false,
  city: "Belmont",
  label: "Belmont, California",
  note: "Venue being finalized",
};

export const EVENT = {
  name: "Beacon Hacks",
  tagline: "A free hackathon for Bay Area high school builders.",

  /** The target date. Set `confirmed: true` once it is final; every
      "target date" note on the site keys off this flag. */
  date: {
    iso: "2027-01-30",
    /** When doors open, Pacific time: what the countdown counts to. */
    starts: "2027-01-30T08:30:00-08:00",
    label: "Saturday, January 30, 2027",
    short: "Sat, Jan 30, 2027",
    confirmed: false,
    note: "Target date",
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

  venue: VENUE,

  /** Planned capacity, not a count of signups. */
  capacityLabel: "75 to 100",

  /**
   * Applications are open: anyone can apply now. `until` finishes
   * the sentence "Spots are confirmed once ...".
   */
  applications: {
    until: VENUE.confirmed ? "the date and budget are final" : "the venue and budget are set",
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
    discord: "https://discord.gg/WUV8FtUkmB",
  },

  /** The fiscal sponsor: HCB, run by Hack Club, holds the money, shows
      every transaction on `page` and takes donations at `donate`. The
      footer links both; the header and the hero link `donate`. */
  hcb: {
    page: "https://hcb.hackclub.com/beacon-hacks",
    donate: "https://hcb.hackclub.com/donations/start/beacon-hacks",
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
