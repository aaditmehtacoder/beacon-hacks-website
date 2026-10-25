/**
 * Page content. Same rule as lib/event.ts: if it is not secured, it says
 * so in its own data (`status: "pending"`, a "Planned" tag, a note) and
 * the page shows that rather than stating it as fact.
 */
import { EVENT, mailto } from "./event";

export type Track = { name: string; body: string };

/** Track names and briefs are ours to define. */
export const TRACKS: Track[] = [
  {
    name: "Signal",
    body: "Cut through noise. Search, summarize, sort, surface: anything that helps a person find the thing that matters to them.",
  },
  {
    name: "Landfall",
    body: "Build for Belmont and the Peninsula. Civic data, schools, transit, small business: anything that makes the place around you work better.",
  },
  {
    name: "First Light",
    body: "Beginners only. Judged on what you learned and what you finished, not on how clean the code is.",
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
      { time: "1:00 PM", title: "Lunch", note: "Pizza. Take a break, then back to building." },
      { time: "4:00 PM", title: "Workshop (TBD)", note: "Optional.", planned: true },
    ],
  },
  {
    label: "Evening",
    window: "6 PM to 11 PM",
    slots: [
      { time: "6:00 PM", title: "Dinner", note: "Dinner, then dessert from Simple Delights: brownies, lemon bars, ube mochi bars, cookies and cake. Three hours of hacking left." },
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
  /** Optical size correction on top of the computed logo size. */
  logoScale?: number;
  /** What they give, in a word or two. The terms are theirs to announce. */
  role: string;
  /** A cash sponsor's package, which puts its logo in that row of the
      sponsor wall. In-kind partners have none. */
  tier?: Package["id"];
};

export type VenueSponsor = {
  name: string;
  website: string;
  logo: Logo;
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
  status: "pending",
};

/**
 * Companies that have committed in writing. In-kind partners have no
 * `tier`; a cash sponsor's `tier` puts its logo in that row of the sponsor
 * wall. Add a company only once they have said yes in writing.
 *
 *  - CodeCrafters: prizes offered and accepted by email, Sept 28, 2026.
 *    Logo from the kit they sent; they asked for a link to codecrafters.io.
 *  - YRI Fellowship: partnership agreed by email, Sept 11, 2026. Logo
 *    from yriscience.com/marketing-kit; the link is their referral link.
 *  - Browserbase: a perk for participants (Oct 6, 2026). Logo from the
 *    header of browserbase.com.
 *  - Origami Prep: Supporter tier (Oct 6, 2026). Logo rendered from the
 *    header of origamiprep.com (crane mark and wordmark).
 *  - Non-Trivial: Community tier (Oct 9, 2026). Logo from logo@2x.png,
 *    with its empty margin trimmed.
 *  - .xyz: a perk for participants (Oct 9, 2026). Logo from the header of
 *    gen.xyz, recoloured from white to black for the cards.
 *  - Scrimba: ten one-year Pro subscriptions (Oct 25, 2026). Lockup
 *    rendered from their app icon's glyph and the "SCRIMBA" wordmark on
 *    their social card (Mona Sans, bold, expanded).
 *  - Rosebud AI: credits for participants (Oct 25, 2026). Lockup rendered
 *    from the header of rosebud.ai (icon and "ROSEBUD AI" in Source Code
 *    Pro Bold).
 *  - SunFounder: 10% off for participants (Oct 25, 2026). Logo from their
 *    social card, on a transparent ground. The code itself goes to
 *    participants before the day, like every other perk.
 *  - Algoverse: 15% off for participants and 30% off for winners (Oct 25,
 *    2026). Lockup rendered from their app icon and the serif wordmark in
 *    the header of algoverse.us.
 *  - Cap (cap.so) is free to use but gave no sponsorship, so it is not
 *    listed.
 */
export const PARTNERS: Partner[] = [
  {
    id: "codecrafters",
    name: "CodeCrafters",
    website: "https://codecrafters.io",
    logo: { src: "/sponsors/codecrafters.svg", width: 1280, height: 164 },
    role: "Prizes",
  },
  {
    id: "yri",
    name: "YRI Fellowship",
    website: "https://yriscience.com?ref=BEACONHACKS",
    logo: { src: "/sponsors/yri-fellowship.png", width: 1200, height: 241 },
    logoScale: 1.18,
    role: "Scholarships",
  },
  {
    id: "aops",
    name: "Art of Problem Solving",
    website: "https://artofproblemsolving.com",
    logo: { src: "/sponsors/aops.png", width: 930, height: 320 },
    logoScale: 1.15,
    role: "Prizes",
  },
  {
    id: "browserbase",
    name: "Browserbase",
    website: "https://www.browserbase.com",
    logo: { src: "/sponsors/browserbase.svg", width: 255, height: 50 },
    logoScale: 1.12,
    role: "Tool perk",
  },
  {
    id: "tavus",
    name: "Tavus",
    website: "https://www.tavus.io",
    logo: { src: "/sponsors/tavus.svg", width: 2471, height: 489 },
    logoScale: 0.88,
    role: "Tool perk",
  },
  {
    id: "xyz",
    name: ".xyz",
    website: "https://gen.xyz",
    logo: { src: "/sponsors/xyz.svg", width: 85, height: 49.5 },
    logoScale: 0.78,
    role: "Free domains",
  },
  {
    id: "scrimba",
    name: "Scrimba",
    website: "https://scrimba.com",
    logo: { src: "/sponsors/scrimba.png", width: 1057, height: 100 },
    logoScale: 0.92,
    role: "Pro subscriptions",
  },
  {
    id: "rosebud",
    name: "Rosebud AI",
    website: "https://www.rosebud.ai",
    logo: { src: "/sponsors/rosebud.png", width: 732, height: 120 },
    role: "Credits",
  },
  {
    id: "sunfounder",
    name: "SunFounder",
    website: "https://www.sunfounder.com",
    logo: { src: "/sponsors/sunfounder.png", width: 351, height: 183 },
    logoScale: 0.8,
    role: "Hardware discount",
  },
  {
    id: "algoverse",
    name: "Algoverse",
    website: "https://algoverse.us",
    logo: { src: "/sponsors/algoverse.png", width: 709, height: 120 },
    role: "Program discounts",
  },
  {
    id: "non-trivial",
    name: "Non-Trivial",
    website: "https://www.non-trivial.org",
    logo: { src: "/sponsors/non-trivial.png", width: 1828, height: 296 },
    logoScale: 1.1,
    role: "Community sponsor",
    tier: "community",
  },
  {
    id: "origami-prep",
    name: "Origami Prep",
    website: "https://origamiprep.com",
    logo: { src: "/sponsors/origami-prep.png", width: 673, height: 103 },
    role: "Supporter, and a prize",
    tier: "supporter",
  },
];

/* ------------------------------------------------------------ prizes */

/** Who gives a prize or a perk. What each one gives is not published:
    participants get the details before the day. */
export type Perk = {
  from: string;
  /** A PARTNERS id, for the logo. */
  partner?: string;
  kind: "prize" | "perk";
  /** "pending": offered in writing, details not settled; the page says so. */
  status: "confirmed" | "pending";
};

/** Prizes for the winners and perks for every builder, committed in writing. */
export const PRIZES_AND_PERKS: Perk[] = [
  { from: "CodeCrafters", partner: "codecrafters", kind: "prize", status: "confirmed" },
  { from: "YRI Fellowship", partner: "yri", kind: "prize", status: "confirmed" },
  { from: "Origami Prep", partner: "origami-prep", kind: "prize", status: "confirmed" },
  { from: "Art of Problem Solving", partner: "aops", kind: "prize", status: "confirmed" },
  { from: "Scrimba", partner: "scrimba", kind: "prize", status: "confirmed" },
  { from: "Algoverse", partner: "algoverse", kind: "prize", status: "confirmed" },
  { from: "Browserbase", partner: "browserbase", kind: "perk", status: "confirmed" },
  { from: "Tavus", partner: "tavus", kind: "perk", status: "confirmed" },
  { from: ".xyz", partner: "xyz", kind: "perk", status: "confirmed" },
  { from: "Rosebud AI", partner: "rosebud", kind: "perk", status: "confirmed" },
  { from: "SunFounder", partner: "sunfounder", kind: "perk", status: "confirmed" },
  { from: "Algoverse", partner: "algoverse", kind: "perk", status: "confirmed" },
];

/* ------------------------------------------------------------ judges */

export type Judge = {
  name: string;
  role: string;
  org: string;
  /** The employer's logo, under public/logos, to identify them. Without
      one, the card names the organisation in text. */
  orgLogo?: Logo;
  /** Their own words, lightly trimmed. */
  bio?: string;
  linkedin?: string;
  /** Under public/photos/judges. Without one, the card shows initials. */
  photo?: string;
  /** object-position for the portrait crop, so the face stays in frame. */
  focus?: string;
};

/**
 * Only people who have agreed to judge. Swosti and Uday sent their own bio
 * and headshot. Anna Zhang and Tiger Wang (Nessie, YC F25) were added Oct
 * 25, 2026 with the bio and photo from their public YC founder profiles,
 * to be swapped for what they send us. Parth Maniar was added the same day
 * from the LinkedIn the user gave (role and employer from his public profile;
 * logo from altoneuroscience.com, recoloured to ink); bio written from the public profile's posts and education.
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
  {
    name: "Anna Zhang",
    role: "Co-founder and CEO",
    org: "Nessie",
    orgLogo: { src: "/logos/nessie.png", width: 463, height: 120 },
    bio: "Co-founded Nessie (YC F25), the shared context layer for recursive companies. Previously an engineer on Amazon’s recommendation service, where she shipped ML features and led an experiment with a $200M-a-year revenue impact. Yale BS ’24.",
    linkedin: "https://www.linkedin.com/in/anna-zhang-y/",
    photo: "/photos/judges/anna-zhang.jpg",
    focus: "50% 35%",
  },
  {
    name: "Tiger Wang",
    role: "Co-founder and CTO",
    org: "Nessie",
    orgLogo: { src: "/logos/nessie.png", width: 463, height: 120 },
    bio: "Co-founded Nessie (YC F25). Previously at Amazon on authentication systems handling 40 billion requests a day. Shipped an Android app with 70,000+ users at 13 and researched Linux kernel security at Yale. Yale BS ’24.",
    linkedin: "https://www.linkedin.com/in/tiger-wang-6a9b06189/",
    photo: "/photos/judges/tiger-wang.jpg",
    focus: "50% 35%",
  },
  {
    name: "Parth Maniar",
    role: "Senior Software Engineer",
    org: "Alto Neuroscience",
    orgLogo: { src: "/logos/alto-neuroscience.svg", width: 188.15, height: 65.8 },
    bio: "Senior Software Engineer at Alto Neuroscience, a precision psychiatry company in Mountain View. Writes about machine learning and AI agents, and built a credit card fraud detection app. Studied data science at the University at Buffalo.",
    linkedin: "https://www.linkedin.com/in/parthdmaniar",
    photo: "/photos/judges/parth-maniar.jpg",
    focus: "50% 30%",
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
  /** Open places drawn on the sponsor wall. Not a cap: no tier is exclusive. */
  slots: number;
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
    slots: 6,
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
    slots: 4,
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
    slots: 3,
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
    slots: 1,
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
    a: `Yes. Registration is on Luma and takes a minute. Registering does not guarantee a spot: we confirm spots once ${EVENT.applications.until}, and we will email everyone who registered.`,
    link: { href: EVENT.applications.url, label: "Register on Luma" },
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
    q: "Is there food?",
    a: "Yes, and it is free. Breakfast when doors open, pizza for lunch, dinner, and dessert from Simple Delights. Email us about allergies or dietary needs before the day.",
    link: { href: mailto("Allergies or dietary needs at Beacon Hacks"), label: "Email the team" },
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
