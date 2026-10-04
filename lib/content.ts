/**
 * Page content. Same rule as lib/event.ts: if it is not secured, it says
 * so in its own data (`status: "pending"`, a "Planned" tag, a note) and
 * the page shows that rather than stating it as fact.
 */

/* ------------------------------------------------------------ the day */

export type Step = { title: string; body: string };

/** How the day goes, in order. */
export const STEPS: Step[] = [
  {
    title: "Check in",
    body: "Doors open at 8:30 AM. Find a seat, meet people, and join team matching if you came on your own.",
  },
  {
    title: "Build",
    body: "Hacking runs from 10 AM to 9 PM. Make an app, a game, a website or a hardware hack. If you can demo it, it counts.",
  },
  {
    title: "Learn",
    body: "Short optional workshops are planned through the day, and we are recruiting mentors from the local tech community.",
  },
  {
    title: "Demo",
    body: "At 9 PM the judges walk the room. Show them what you made and how it works. No slides, no stage.",
  },
];

export type Fact = { label: string; value: string; note: string };

/** The strip under the tracks. Capacity is the plan, not a signup count. */
export const AT_A_GLANCE: Fact[] = [
  { label: "Who", value: "Grades 9–12", note: "High school students from across the Bay Area" },
  { label: "Experience", value: "None needed", note: "First Light is for first-timers" },
  { label: "Team size", value: "1–4", note: "Bring friends or find a team at kickoff" },
  { label: "Capacity", value: "75–100", note: "Planned capacity, not a signup count" },
];

export type Track = { tag: string; name: string; body: string; fit: string };

/** Track names and briefs are ours to define. */
export const TRACKS: Track[] = [
  {
    tag: "Track 01",
    name: "Signal",
    body: "Cut through noise. Search, summarize, sort, surface: anything that helps a person find the thing that matters to them.",
    fit: "You have a folder, feed or inbox you wish would sort itself.",
  },
  {
    tag: "Track 02",
    name: "Landfall",
    body: "Build for Belmont and the Peninsula. Civic data, schools, transit, small business: anything that makes the place around you work better.",
    fit: "You already have a complaint about how something in your town works.",
  },
  {
    tag: "Track 03",
    name: "First Light",
    body: "Beginners only. Judged on what you learned and what you finished, not on how clean the code is.",
    fit: "This is your first hackathon and you are not sure you belong. You do.",
  },
];

/* ------------------------------------------------------------ schedule */

export type Slot = {
  time: string;
  title: string;
  note: string;
  /** Not arranged yet: the slot shows a "Planned" tag. */
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
      { time: "11:30 AM", title: "Workshop: your first API call", note: "Optional, 30 minutes, nothing to install.", planned: true },
    ],
  },
  {
    label: "Afternoon",
    window: "Noon to 6 PM",
    slots: [
      { time: "1:00 PM", title: "Lunch", note: "Take a break, then back to building." },
      { time: "4:00 PM", title: "Workshop: shipping it live", note: "Put your project on a real URL before dinner.", planned: true },
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

export type Partner = {
  id: string;
  name: string;
  /** Where the logo links. YRI asked for its referral link everywhere. */
  website: string;
  /** Under public/sponsors, on a transparent ground, with its real size. */
  logo: { src: string; width: number; height: number };
  /** The light version of the same logo, for the dark hero. */
  logoOnDark: { src: string; width: number; height: number };
  /** Optical size correction on top of the computed logo size. */
  logoScale?: number;
  /** What they give, in a few words. */
  gives: string;
  /** Everything so far is in kind; cash sponsors get "Cash". */
  form: "In kind" | "Cash";
};

/**
 * Companies that have committed in writing. None of it is cash, so
 * EVENT.budget.raisedUsd does not move for them. Add a company only once
 * they have said yes in writing; offers still being finalised live in
 * PENDING_OFFERS below and have no logo here.
 *
 *  - CodeCrafters: prizes offered and accepted by email, Sept 28, 2026.
 *    Logo from the kit they sent; they asked for a link to codecrafters.io.
 *  - Perfect Corp: API units offered Sept 9, accepted the same day.
 *  - YRI Fellowship: partnership agreed by email, Sept 11, 2026. Logos
 *    (dark text for cream, white text for the dark hero) from
 *    yriscience.com/marketing-kit; the link is their referral link.
 */
export const PARTNERS: Partner[] = [
  {
    id: "codecrafters",
    name: "CodeCrafters",
    website: "https://codecrafters.io",
    logo: { src: "/sponsors/codecrafters.svg", width: 1280, height: 164 },
    logoOnDark: { src: "/sponsors/codecrafters-white.svg", width: 1280, height: 164 },
    gives: "VIP memberships for the top three teams",
    form: "In kind",
  },
  {
    id: "perfect-corp",
    name: "Perfect Corp",
    website: "https://www.perfectcorp.com",
    logo: { src: "/sponsors/perfect-corp.svg", width: 150, height: 29 },
    logoOnDark: { src: "/sponsors/perfect-corp.svg", width: 150, height: 29 },
    logoScale: 0.8,
    gives: "YouCam AI and AR API units for participants",
    form: "In kind",
  },
  {
    id: "yri",
    name: "YRI Fellowship",
    website: "https://yriscience.com?ref=BEACONHACKS",
    logo: { src: "/sponsors/yri-fellowship.png", width: 1200, height: 241 },
    logoOnDark: { src: "/sponsors/yri-fellowship-white.png", width: 1200, height: 205 },
    logoScale: 1.18,
    gives: "Research scholarships and a mentorship prize",
    form: "In kind",
  },
];

/* ------------------------------------------------------------ prizes */

export type Offer = {
  from: string;
  title: string;
  detail: string;
  /** Who it is for, in a few words. */
  who: string;
  /** Conditions the giver set, shown as written. */
  conditions?: string;
};

/** Committed in writing, by partners in PARTNERS. */
export const CONFIRMED_PRIZES: Offer[] = [
  {
    from: "CodeCrafters",
    title: "VIP memberships",
    who: "Top three teams",
    detail: "Every member of the top three teams gets a CodeCrafters VIP membership: two years for first place, one year for second and six months for third.",
  },
  {
    from: "YRI Fellowship",
    title: "Research scholarships and mentorship",
    who: "Winning teams",
    detail: "Winning team members receive scholarships of up to $1,500 toward YRI’s research mentorship program, and all winners get guaranteed application review with priority admission consideration. The overall winning team also receives a featured mentorship prize.",
  },
];

/** For everyone who takes part, committed in writing. */
export const PARTICIPANT_PERKS: Offer[] = [
  {
    from: "Perfect Corp",
    title: "YouCam AI and AR APIs",
    who: "Every participant",
    detail: "Free API units to build with during the event. Access details are shared before the day.",
  },
];

/**
 * Offered in writing but not final: the redemption details have not
 * arrived. Nothing here is a confirmed benefit until they do.
 *
 *  - Render (Hazal Mestci, hazal@render.com): offered Sept 29, 2026,
 *    accepted Oct 3. Still owed: the event credit link, eligibility and
 *    redemption requirements, and the logo. Render is for people 16+.
 */
export const PENDING_OFFERS: Offer[] = [
  {
    from: "Render",
    title: "Building credits",
    who: "Participants aged 16+",
    detail: "$50 in Render building credits for each eligible participant.",
    conditions: "Render accounts are for people aged 16 and older.",
  },
  {
    from: "Render",
    title: "Credits for the top three",
    who: "Top three projects on Render Workflows",
    detail: "$500, $300 and $100 in Render credits for first, second and third place.",
    conditions: "Winning projects must use Render Workflows; ages 16+.",
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
    bio: "Works on the supply chain and logistics architecture behind Google’s flagship retail stores. Previously at Walmart Technology. MS in Supply Chain Management.",
    linkedin: "https://www.linkedin.com/in/swostipanda/",
    photo: "/photos/judges/swosti-panda.jpg",
    focus: "50% 30%",
  },
  {
    name: "Vasuki Uday Kiran Vudathala",
    role: "Staff Performance Engineer, AI/ML",
    org: "ServiceNow",
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

/** Not cash, and not priced against a cash package by retail value. */
export const IN_KIND = {
  summary: "Food, equipment, prizes, software and services.",
  body: "Tell us what you would like to offer and we will agree on recognition together. In-kind support is welcome at any size and is not matched to a cash package by its retail value.",
};

export const SPONSOR_VALUE = [
  {
    title: "Keep it free",
    body: "Sponsorship pays for food, the venue and prizes, so every student attends at no cost.",
  },
  {
    title: "Meet new builders",
    body: "Put your name in front of Bay Area high school students who are learning to build.",
  },
  {
    title: "Put your tools to work",
    body: "Offer credits, an API or a workshop that teams can use on the day.",
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
    a: "Yes. Early applications are open and take about two minutes. Applying does not guarantee a spot: we confirm spots once the venue and budget are set, and we will email everyone who applied.",
    link: { href: "/apply", label: "Apply early" },
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
    a: "In Belmont, California. We will publish the venue name and address once our host approves in writing, and applicants will hear first.",
  },
  {
    q: "How can my company sponsor?",
    a: "Pick a package above or write to us. We also welcome in-kind support: food, equipment, prizes, software and services.",
    link: { href: "mailto", label: "Email the team" },
  },
  {
    q: "Is there a code of conduct?",
    a: "Yes. Everyone at Beacon Hacks agrees to it: students, mentors, judges, sponsors and organizers.",
    link: { href: "/code-of-conduct", label: "Read the code of conduct" },
  },
];
