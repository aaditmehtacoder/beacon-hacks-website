/**
 * Page content. Same rule as lib/event.ts: if it is not secured, it says
 * so in its own data (`status: "pending"`, a "Planned" tag, a note) and
 * the page shows that rather than stating it as fact.
 */
import { EVENT, mailto } from "./event";

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
 * to 6:30 PM, when judging starts; EVENT.hours repeats those two spans, so change
 * them together. Times move if the venue's hours differ.
 */
export const SCHEDULE: Phase[] = [
  {
    label: "Morning",
    window: "8:30 AM to noon",
    slots: [
      { time: "8:30 AM", title: "Doors open", note: "Check in with your school ID, have breakfast, and find a seat with power." },
      { time: "9:30 AM", title: "Opening ceremony", note: "Rules of the day, the track reveal, and introductions from partners." },
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
      { time: "6:00 PM", title: "Dinner", note: "Dinner, then dessert from Simple Delights: brownies, lemon bars, ube mochi bars, cookies and cake. Half an hour of hacking left." },
      { time: "6:30 PM", title: "Hacking ends, judging begins", note: "Submissions close. Judges walk the room, science fair style." },
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
  /** Under public/sponsors, on a transparent ground, with its real size.
      Without one, the card sets the name in type instead. */
  logo?: Logo;
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
 * The venue sponsor, shown first in the sponsors section: Cupertino Odd
 * Fellows Lodge #70 hosts the day at its hall (named Nov 10, 2026, the
 * user's word). Logo: their three-link FLT emblem, redrawn as vectors in
 * their colours from the 150px header PNG on cupertinooddfellows.org, with
 * the lodge's name in Arial Bold, the face their site sets it in.
 */
export const VENUE_SPONSOR: VenueSponsor | null = {
  name: "Cupertino Odd Fellows Lodge #70",
  website: "https://www.cupertinooddfellows.org",
  logo: { src: "/sponsors/cupertino-odd-fellows.svg", width: 728.1, height: 73.3 },
  status: "confirmed",
  line: "Hosting Beacon Hacks at Odd Fellows Hall in Cupertino.",
  address: "20589 W. Homestead Rd, Cupertino, CA 95014",
};

/**
 * The fiscal sponsor, shown under the venue sponsor: Hack Club, a 501(c)(3)
 * nonprofit, holds Beacon's money through HCB. The card links the public
 * ledger and the donation page (EVENT.hcb). Logo: Hack Club's flag from
 * assets.hackclub.com (flag-standalone.svg).
 */
export const FISCAL_SPONSOR = {
  name: "Hack Club",
  website: "https://hackclub.com",
  logo: { src: "/sponsors/hack-club.svg", width: 526, height: 184 } satisfies Logo,
  line: "A 501(c)(3) nonprofit. Beacon Hacks runs on HCB, so every transaction is public.",
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
 *    the header of algoverse.us. On Oct 27 they also committed $100 in cash
 *    (HCB invoice sent Oct 30, paid Nov 3); the user put them in the
 *    Supporter row.
 *  - n8n: 100 one-month n8n Cloud Pro licenses for participants (Oct 30,
 *    2026, via their event sponsorship form). The redemption link goes to
 *    participants before the day, not on the site. Logo is n8n's own
 *    lockup from guidelines.n8n.design (n8n-logo-black-accent.svg),
 *    swapped in Nov 14, 2026 at the user's word.
 *  - San Carlos Elms: Supporter tier, $250 (agreed Oct 30, 2026; HCB
 *    invoice paid Nov 2). An assisted living and memory care community in
 *    San Carlos. Logo is the colour one from the header of
 *    sancarloselms.com, with the tagline cropped off so the name stays
 *    legible at Supporter size.
 *  - Simple Delights: dessert for the day (bakery in San Mateo). Their
 *    pastry chef sent the round logo by email on Oct 30, 2026; the same
 *    file, "Simple Delights Logo Round Transparent", is on
 *    simple-delights.com, which is where this copy comes from.
 *  - OpenRubric: judging partner, in kind (Nov 8, 2026), the user's word.
 *    Logo is the four-square mark from the header of openrubric.vercel.app with the
 *    wordmark traced from Geist SemiBold, as their header sets it.
 *  - ElevenLabs: in kind (Zia Espiritu, ElevenLabs hackathons team, by
 *    email Nov 10, 2026). A free month of the Creator tier for every
 *    participant (claimed through their Discord bot; they need the
 *    participant email CSV 72 hours before the event), 3 months of Pro
 *    for each member of the overall winning team, and 3 months of Scale
 *    for each member of the best project built with ElevenLabs. They ask
 *    for their logo per elevenlabs.io/brand: this is their black wordmark
 *    SVG from that page, unaltered.
 *  - Century Graphics (T-shirts at a sponsor price, Nov 10) was listed
 *    Nov 12 and taken off Nov 14, 2026, at the user's word.
 *  - PCBWay: in kind, at the user's word (Nov 14, 2026); what they give
 *    is not recorded here. Logo is the wordmark from the header sprite on
 *    pcbway.com (they publish no larger file), at its native 141 x 39.
 *  - In-kind cards show the logo only, no caption (user, Nov 14, 2026).
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
    id: "n8n",
    name: "n8n",
    website: "https://n8n.io",
    logo: { src: "/sponsors/n8n.svg", width: 480, height: 96 },
    role: "Cloud Pro licenses",
  },
  {
    id: "simple-delights",
    name: "Simple Delights",
    website: "https://www.simple-delights.com",
    logo: { src: "/sponsors/simple-delights.png", width: 480, height: 493 },
    /* Round, so it overflows the 40px logo slot a little; the card's gap
       takes it without touching the caption. */
    logoScale: 0.85,
    role: "Dessert",
  },
  {
    id: "openrubric",
    name: "OpenRubric",
    website: "https://openrubric.vercel.app",
    logo: { src: "/sponsors/openrubric.svg", width: 1298.09, height: 181.19 },
    role: "Judging partner",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    website: "https://elevenlabs.io",
    logo: { src: "/sponsors/elevenlabs.svg", width: 694, height: 90 },
    role: "Credits and prizes",
  },
  {
    id: "pcbway",
    name: "PCBWay",
    website: "https://www.pcbway.com",
    logo: { src: "/sponsors/pcbway.png", width: 141, height: 39 },
    role: "In kind",
  },
  {
    id: "algoverse",
    name: "Algoverse",
    website: "https://algoverse.us",
    logo: { src: "/sponsors/algoverse.png", width: 709, height: 120 },
    role: "Supporter, and discounts",
    tier: "supporter",
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
  {
    id: "san-carlos-elms",
    name: "San Carlos Elms",
    website: "https://sancarloselms.com",
    logo: { src: "/sponsors/san-carlos-elms.png", width: 440, height: 186 },
    logoScale: 1.15,
    role: "Supporter",
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
  { from: "ElevenLabs", partner: "elevenlabs", kind: "prize", status: "confirmed" },
  { from: "Browserbase", partner: "browserbase", kind: "perk", status: "confirmed" },
  { from: "Tavus", partner: "tavus", kind: "perk", status: "confirmed" },
  { from: ".xyz", partner: "xyz", kind: "perk", status: "confirmed" },
  { from: "Rosebud AI", partner: "rosebud", kind: "perk", status: "confirmed" },
  { from: "SunFounder", partner: "sunfounder", kind: "perk", status: "confirmed" },
  { from: "Algoverse", partner: "algoverse", kind: "perk", status: "confirmed" },
  { from: "n8n", partner: "n8n", kind: "perk", status: "confirmed" },
  { from: "ElevenLabs", partner: "elevenlabs", kind: "perk", status: "confirmed" },
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
 * to be swapped for what they send us. Dan Shalev was added the same day
 * from the LinkedIn the user gave: current photo and bio from his public
 * profile. The user chose the org: first Garry's List, then wilcoxwbe.com
 * (Wilcox Business Experience, the business club that runs DECA at Wilcox).
 * Their logo is a bare mark, so public/logos/wilcox-wbe.png is a lockup:
 * that mark plus "WBE" in Mona Sans, ink. Role from his LinkedIn.
 * On Nov 22, 2026 the organizers cut the list to these five.
 * Luca Hadife and Mohamed Hosny (Kebra, YC S26) wrote in on Nov 23, 2026
 * and sent their own bios and headshots. The logo is the nav lockup from
 * kebra.com; the LinkedIn links are the ones on Kebra's YC company page.
 * Ayush Garg was added the same day from the bio he texted the user, and
 * sits next to Dan; the two students close the list, after the Kebra pair.
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
    name: "Luca Hadife",
    role: "Co-founder and CEO",
    org: "Kebra",
    orgLogo: { src: "/logos/kebra.png", width: 339, height: 96 },
    bio: "Co-founded Kebra (YC S26). Previously worked on multimodal databases at Microsoft and was an early team member at Amata. UC Berkeley graduate in Data Science and Sustainable Design.",
    linkedin: "https://www.linkedin.com/in/luca-hadife/",
    photo: "/photos/judges/luca-hadife.jpg",
    focus: "50% 30%",
  },
  {
    name: "Mohamed Hosny",
    role: "Co-founder and CTO",
    org: "Kebra",
    orgLogo: { src: "/logos/kebra.png", width: 339, height: 96 },
    bio: "Co-founded Kebra (YC S26). Previously taught Computer Architecture at UC Berkeley EECS and worked on data center networking infrastructure at Arista Networks. UC Berkeley graduate in Electrical Engineering and Computer Science.",
    linkedin: "https://www.linkedin.com/in/mohamed-hosny-hussein/",
    photo: "/photos/judges/mohamed-hosny.jpg",
    focus: "50% 30%",
  },
  {
    name: "Dan Shalev",
    role: "DECA Chapter President",
    org: "Wilcox Business Experience",
    orgLogo: { src: "/logos/wilcox-wbe.png", width: 415, height: 120 },
    bio: "Leads the DECA chapter at Wilcox Business Experience, a student-run business club in Santa Clara. Built four campaign websites for a congressional run and interned on internal tools at Zeal.",
    linkedin: "https://www.linkedin.com/in/danshalev1/",
    photo: "/photos/judges/dan-shalev.jpg",
    focus: "50% 50%",
  },
  {
    name: "Ayush Garg",
    role: "Founder",
    org: "Green Silicon Valley",
    bio: "Founded Green Silicon Valley, a student-run nonprofit bringing hands-on environmental STEM lessons to K-12 classrooms. Led Team AeroForge to second place nationally in NASA’s DWU challenge and built internal tooling at International Battery Company. Senior at Adrian Wilcox High School.",
    linkedin: "https://www.linkedin.com/in/ayush-garg-3554962b1/",
    photo: "/photos/judges/ayush-garg.jpg",
    focus: "50% 40%",
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
    a: "No. Beginners are welcome, and one track is just for first-time hackers. It is judged on what you learned and finished, not on polish.",
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
      ? `At ${EVENT.venue.place}, ${EVENT.venue.address}. Parking on site is free.`
      : `In ${EVENT.venue.label}. The venue is being finalized; we will publish the address once it is confirmed, and applicants will hear first.`,
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
