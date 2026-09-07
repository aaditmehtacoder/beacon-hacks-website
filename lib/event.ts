/**
 * Every fact about the event that appears in more than one place.
 *
 * RULE FOR THIS FILE: nothing in here is allowed to state something we have
 * not actually secured. Anything still being arranged carries `confirmed:
 * false` and renders through the <Locked> treatment, so a sponsor reading the
 * site sees exactly what is real and what is still a plan.
 */
export const EVENT = {
  name: "Beacon Hacks",
  tagline: "Build what lights the way.",

  /** Target date. Not locked until the venue signs off (Gate 1). */
  targetDate: "2027-01-30T08:30:00-08:00",
  targetDateLabel: "Jan 30, 2027",
  targetDayLabel: "Saturday, January 30, 2027",
  dateConfirmed: false,

  hoursLabel: "8:30 AM to 11 PM",

  /**
   * Venue is in approval and the host has asked us not to use their name
   * publicly yet, so nothing here identifies them. Fill this in only after
   * written approval.
   */
  venue: {
    confirmed: false,
    city: "Belmont",
    region: "CA",
    label: "Belmont, CA",
    note: "Venue in approval. Named here once the space signs off in writing.",
  },

  /** Planned capacity, not a claim about signups. */
  capacityLabel: "75 to 100",

  budget: {
    targetUsd: 10_500,
    raisedUsd: 0,
  },

  applications: {
    open: false,
    note: "Applications open once the venue and the budget are locked.",
  },

  email: {
    team: "team@beaconhacks.org",
    sponsors: "sponsors@beaconhacks.org",
  },

  url: "https://beaconhacks.org",
} as const;

export const TARGET_DATE_MS = new Date(EVENT.targetDate).getTime();

export const NAV = [
  { href: "#day", label: "The day" },
  { href: "#tracks", label: "Tracks" },
  { href: "#status", label: "Status" },
  { href: "#sponsors", label: "Sponsor" },
  { href: "#faq", label: "FAQ" },
] as const;
