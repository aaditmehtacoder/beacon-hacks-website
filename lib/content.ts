/**
 * Page content. Same rule as lib/event.ts: if it is not secured, it says
 * so in its own data (`status: "pending"`, a "Planned" tag, a note) and
 * the page shows that rather than stating it as fact.
 */
import { EVENT } from "./event";

export type Track = {
  name: string;
  body: string;
  /** Finishes the sentence "Good fit if ..." */
  fit: string;
};

/** Track names and briefs are ours to define. */
export const TRACKS: Track[] = [
  {
    name: "Signal",
    body: "Cut through noise. Search, summarize, sort, surface: anything that helps a person find the thing that matters to them.",
    fit: "you have a folder, feed or inbox you wish would sort itself.",
  },
  {
    name: "Landfall",
    body: "Build for Belmont and the Peninsula. Civic data, schools, transit, small business: anything that makes the place around you work better.",
    fit: "you already have a complaint about how something in your town works.",
  },
  {
    name: "First Light",
    body: "Beginners only. Judged on what you learned and what you finished, not on how clean the code is.",
    fit: "this is your first hackathon and you are not sure you belong. You do.",
  },
];

/* ------------------------------------------------------------ schedule */

export type Slot = {
  time: string;
  title: string;
  note: string;
  /** Not arranged yet: the title says so ("Workshop (TBD)"). */
  planned?: boolean;
};
export type Phase = { label: string; window: string; slots: Slot[] };

/**
 * The draft schedule. The day runs 8:30 AM to 11 PM and hacking runs 10 AM
 * to 9 PM (eleven hours); EVENT.hours repeats those two spans, so change
 * them together. Times move if the venue's hours differ.
 */
export const SCHEDULE: Phase[] = [
  {
    label: "Morning",
    window: "8:30 AM to noon",
    slots: [
      { time: "8:30 AM", title: "Doors open", note: "Check in with your school ID, have breakfast, and find a seat with power." },
      { time: "9:30 AM", title: "Opening ceremony", note: "Rules of the day, the tracks, and introductions from partners." },
      { time: "10:00 AM", title: "Hacking begins", note: "Team matching runs for anyone still looking for a team." },
      { time: "11:30 AM", title: "Workshop (TBD)", note: "Optional, about 30 minutes.", planned: true },
    ],
  },
  {
    label: "Afternoon",
    window: "Noon to 6 PM",
    slots: [
      { time: "1:00 PM", title: "Lunch", note: "Take a break, then back to building." },
      { time: "4:00 PM", title: "Workshop (TBD)", note: "Optional.", planned: true },
    ],
  },
  {
    label: "Evening",
    window: "6 PM to 11 PM",
    slots: [
      { time: "6:00 PM", title: "Dinner", note: "Three hours of hacking left." },
      { time: "9:00 PM", title: "Hacking ends, demos begin", note: "Submissions close. Judges walk the room, science fair style." },
      { time: "10:30 PM", title: "Awards and closing", note: "Prizes and thank-yous. Everyone heads home by 11 PM." },
    ],
  },
];

/* ------------------------------------------------------------ partners */

export type Logo = { src: string; width: number; height: number };

export type Partner = {
  id: string;
  name: string;
  /** Where the logo links. YRI asked for its referral link everywhere. */
  website: string;
  /** Under public/sponsors, on a transparent ground, with its real size. */
  logo: Logo;
  /** The light version, for the "Sponsored by" row on the night. */
  logoOnNight: Logo;
  /** Optical size correction on top of the computed logo size. */
  logoScale?: number;
  /** What they give, in a few words. */
  gives: string;
  /** The same in a word or two, under the logo in the hero. */
  short: string;
};

export type VenueSponsor = {
  name: string;
  website: string;
  logo: Logo;
  /** The light version, for the "Sponsored by" row on the night. */
  logoOnNight: Logo;
  /** "pending" shows the logo with a "Being finalized" tag; "confirmed"
      adds the line and the address. */
  status: "pending" | "confirmed";
  /** One line under the label, e.g. "Hosting Beacon Hacks at ..." */
  line?: string;
  address?: string;
};

/**
 * The venue sponsor, shown first in the sponsors section. RingCentral is
 * being finalized: the logo shows with a "Being finalized" tag, and the
 * venue stays unnamed elsewhere (EVENT.venue in lib/event.ts) until the
 * written approval. Logo from the header of ringcentral.com.
 */
export const VENUE_SPONSOR: VenueSponsor | null = {
  name: "RingCentral",
  website: "https://www.ringcentral.com",
  logo: { src: "/sponsors/ringcentral.svg", width: 961, height: 146 },
  logoOnNight: { src: "/sponsors/ringcentral-white.svg", width: 961, height: 146 },
  status: "pending",
};

/**
 * Companies that have committed in writing, all in kind. Add a company
 * only once they have said yes in writing; offers still being finalised
 * live in PENDING_OFFERS below and have no logo here.
 *
 *  - CodeCrafters: prizes offered and accepted by email, Sept 28, 2026.
 *    Logo from the kit they sent; they asked for a link to codecrafters.io.
 *  - YRI Fellowship: partnership agreed by email, Sept 11, 2026. Logo
 *    from yriscience.com/marketing-kit; the link is their referral link.
 */
export const PARTNERS: Partner[] = [
  {
    id: "codecrafters",
    name: "CodeCrafters",
    website: "https://codecrafters.io",
    logo: { src: "/sponsors/codecrafters.svg", width: 1280, height: 164 },
    logoOnNight: { src: "/sponsors/codecrafters-white.svg", width: 1280, height: 164 },
    gives: "VIP memberships for the top three teams",
    short: "Prizes",
  },
  {
    id: "yri",
    name: "YRI Fellowship",
    website: "https://yriscience.com?ref=BEACONHACKS",
    logo: { src: "/sponsors/yri-fellowship.png", width: 1200, height: 241 },
    logoOnNight: { src: "/sponsors/yri-fellowship-white.png", width: 1200, height: 205 },
    logoScale: 1.18,
    gives: "Research scholarships and a mentorship prize",
    short: "Scholarships",
  },
];

/* ------------------------------------------------------------ prizes */

export type Prize = {
  from: string;
  /** A PARTNERS id, for the logo. Render has not sent one yet. */
  partner?: string;
  title: string;
  /** The headline: who gets it, or how much. */
  figure: string;
  /** Short facts under it, as written by the giver. */
  points: string[];
  /** "pending": offered in writing, redemption details not settled. */
  status: "confirmed" | "pending";
};

/**
 * Prizes and credits. Confirmed ones are committed in writing by partners
 * in PARTNERS. Pending ones are offered in writing but not final:
 *
 *  - Render (Hazal Mestci, hazal@render.com): offered Sept 29, 2026,
 *    accepted Oct 3. Still owed: the event credit link, eligibility and
 *    redemption requirements, and the logo. Render is for people 16+.
 *
 * Nothing is added up into a prize pool: memberships, scholarships and
 * credits are not cash and do not sum.
 */
export const PRIZES: Prize[] = [
  {
    from: "CodeCrafters",
    partner: "codecrafters",
    title: "VIP memberships",
    figure: "Up to 2 years",
    points: ["For every member of the top three teams", "2 years for 1st, 1 year for 2nd, 6 months for 3rd"],
    status: "confirmed",
  },
  {
    from: "YRI Fellowship",
    partner: "yri",
    title: "Research scholarships",
    figure: "Up to $1,500",
    points: [
      "For winning team members, toward YRI’s research mentorship program",
      "Guaranteed application review, with priority admission consideration",
      "A mentorship prize for the overall winner",
    ],
    status: "confirmed",
  },
  {
    from: "Render",
    title: "Building credits",
    figure: "$50 each",
    points: [
      "For every participant aged 16 or older",
      "$500, $300 and $100 for the top three projects on Render Workflows",
    ],
    status: "pending",
  },
];

/** Categories we intend to judge. Prize details follow sponsors. */
export const PRIZE_CATEGORIES = [
  "Best overall",
  "Runner-up",
  "Third place",
  "First Light: best beginner project",
  "Landfall: best project for the Peninsula",
  "Best design",
];

/* ------------------------------------------------------------ judges */

export type Judge = {
  name: string;
  role: string;
  org: string;
  /** The employer's logo, under public/logos, to identify them. */
  orgLogo: Logo;
  /** Their own words, lightly trimmed. */
  bio: string;
  linkedin: string;
  /** Under public/photos/judges. The headshot they sent us. */
  photo: string;
  /** object-position for the portrait crop, so the face stays in frame. */
  focus: string;
};

/**
 * Only people who have agreed in writing. Each judge sent their own bio
 * and headshot; nobody is listed on a verbal maybe.
 */
export const JUDGES: Judge[] = [
  {
    name: "Swosti Panda",
    role: "Lead PM/Analyst, Devices & Services",
    org: "Google",
    orgLogo: { src: "/logos/google.svg", width: 272, height: 92 },
    bio: "Works on the supply chain and logistics architecture behind Google’s flagship retail stores. Previously at Walmart Technology. MS in Supply Chain Management.",
    linkedin: "https://www.linkedin.com/in/swostipanda/",
    photo: "/photos/judges/swosti-panda.jpg",
    focus: "50% 30%",
  },
  {
    name: "Vasuki Uday Kiran Vudathala",
    role: "Staff Performance Engineer, AI/ML",
    org: "ServiceNow",
    orgLogo: { src: "/logos/servicenow.svg", width: 130.3, height: 19.25 },
    bio: "Specializes in GenAI performance, scalability and production reliability. Sixteen-plus years in industry, and a technical author, conference speaker, and hackathon judge and mentor.",
    linkedin: "https://www.linkedin.com/in/vasukiudaykiran/",
    photo: "/photos/judges/uday-vudathala.jpg",
    focus: "50% 32%",
  },
];

/* ------------------------------------------------------------ sponsorship */

export type Package = {
  id: "supporter" | "community" | "partner" | "presenting";
  name: string;
  priceUsd: number;
  /** One line on who the package suits. */
  pitch: string;
  /** New at this level. Each package also includes the one before it. */
  benefits: string[];
};

/**
 * Cash packages, ascending. Nothing here promises attendee contact data,
 * recruiting access, printed merchandise, judging seats or open-ended
 * stage time, and nothing is exclusive.
 */
export const PACKAGES: Package[] = [
  {
    id: "supporter",
    name: "Supporter",
    priceUsd: 250,
    pitch: "Put your name behind a free day of building.",
    benefits: [
      "Logo on the website",
      "Thanked at the opening and closing",
      "Group sponsor thank-you on social media",
    ],
  },
  {
    id: "community",
    name: "Community",
    priceUsd: 500,
    pitch: "More visibility, and a prize with your name on it.",
    benefits: [
      "Larger logo placement",
      "Support a named prize category, where available",
    ],
  },
  {
    id: "partner",
    name: "Partner",
    priceUsd: 1_000,
    pitch: "Get in the room with the students building.",
    benefits: [
      "Prominent logo placement",
      "Send mentors to help teams on the day",
      "Optional workshop, subject to scheduling",
    ],
  },
  {
    id: "presenting",
    name: "Presenting",
    priceUsd: 2_500,
    pitch: "Lead the day with us.",
    benefits: [
      "Largest logo placement",
      "“Presented by” billing",
      "A short speaking slot at the opening",
      "Optional table or workshop, subject to venue capacity",
    ],
  },
];

/* ------------------------------------------------------------ FAQ */

export type Faq = {
  q: string;
  a: string;
  /** An action that completes the answer. "mailto" opens the team inbox. */
  link?: { href: string; label: string };
};

export const FAQS: Faq[] = [
  {
    q: "What is a hackathon?",
    a: "A day of building something from scratch, usually with a small team, and showing it off at the end. It might be an app, a game, a website or a hardware hack. Winning is a bonus; finishing something with other people is the point.",
  },
  {
    q: "Who can apply?",
    a: "High school students in grades 9 to 12 from anywhere in the Bay Area. Bring a school ID to check in.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. Beginners are welcome, and the First Light track is just for first-time hackers. It is judged on what you learned and finished, not on polish.",
  },
  {
    q: "How do teams work?",
    a: "Teams have up to four people. Bring friends, or meet a team at team matching before the opening ceremony. Building on your own is fine too.",
  },
  {
    q: "Can I apply now?",
    a: `Yes. Applications are open and take about two minutes. Applying does not guarantee a spot: we confirm spots once ${EVENT.applications.until}, and we will email everyone who applied.`,
    link: { href: "/apply", label: "Apply" },
  },
  {
    q: "How much does it cost?",
    a: "Nothing. There is no fee to apply or to attend; sponsors cover the cost of the day.",
  },
  {
    q: "What should I bring?",
    a: "A laptop and charger, your school ID, and anything you need to be comfortable for a long day. If you do not have a laptop, email us before the event.",
  },
  {
    q: "Do I stay overnight?",
    a: "No. The draft schedule runs from 8:30 AM to 11 PM, and everyone goes home the same night.",
  },
  {
    q: "Where is it?",
    a: EVENT.venue.place
      ? `At ${EVENT.venue.place}, ${EVENT.venue.address}. There is parking, and Belmont Caltrain is within walking distance.`
      : "In Belmont, California. The venue is being finalized; we will publish the address once it is confirmed, and applicants will hear first.",
  },
  {
    q: "How can my company sponsor?",
    a: "Pick a package in the sponsors section or write to us. In-kind support is welcome too: food, equipment, prizes, software and services.",
    link: { href: "mailto", label: "Email the team" },
  },
  {
    q: "Is there a code of conduct?",
    a: "Yes. Everyone at Beacon Hacks agrees to it: students, mentors, judges, sponsors and organizers.",
    link: { href: "/code-of-conduct", label: "Read the code of conduct" },
  },
];
