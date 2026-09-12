/**
 * Page content. Same rule as lib/event.ts: if it is not secured, it is marked
 * `confirmed: false` and rendered as locked rather than stated as fact.
 */

export type Step = {
  num: string;
  title: string;
  body: string;
  chips: string[];
  photo: string;
  alt: string;
};

export const STEPS: Step[] = [
  {
    num: "01",
    title: "Check in, find people",
    body: "Doors at 8:30 with breakfast. Team matching runs before the opening ceremony, so nobody spends the day building alone unless they want to.",
    chips: ["Grades 9 to 12", "Teams of 1 to 4"],
    photo: "/photos/day-checkin.jpg",
    alt: "A group of students gathered around a long table talking",
  },
  {
    num: "02",
    title: "Build for fourteen hours",
    body: "Mentors on the floor the whole time and short workshops running in parallel. App, game, website, hardware hack: anything you can demo by 9pm counts.",
    chips: ["Mentors all day", "Food included"],
    photo: "/photos/day-build.jpg",
    alt: "Five people building on laptops around a shared wooden table",
  },
  {
    num: "03",
    title: "Demo it, win things",
    body: "No stage, no slides. Judges walk the room and you talk them through what you made. Broken demos welcome, half of them are.",
    chips: ["Judged in the room", "Home by midnight"],
    photo: "/photos/day-demo.jpg",
    alt: "Someone explaining their project with their hands, laptop open beside them",
  },
];

export type Track = {
  tag: string;
  name: string;
  body: string;
  fit: string;
};

/** Track names and briefs are ours to define. No prize money is attached to
 *  them, because none is raised yet. */
export const TRACKS: Track[] = [
  {
    tag: "Track 01",
    name: "Signal",
    body: "Cut through noise. Search, summarize, sort, surface. Anything that helps a person find the thing that actually matters to them.",
    fit: "You have a folder, feed or inbox you wish would sort itself.",
  },
  {
    tag: "Track 02",
    name: "Landfall",
    body: "Build for Belmont and the Peninsula. Civic data, schools, transit, small business, anything that makes the place around you work better.",
    fit: "You already have a complaint about how something in your town works.",
  },
  {
    tag: "Track 03",
    name: "First Light",
    body: "Beginners only. Judged on what you learned and what you finished, not how clean the code is. Mentors assigned at kickoff.",
    fit: "This is your first hackathon and you are not sure you belong. You do.",
  },
];

/** Category names we intend to judge. Cash and perks appear only once funded. */
export const PLANNED_PRIZE_CATEGORIES = [
  "Best overall",
  "Runner up",
  "Third place",
  "First Light, best beginner hack",
  "Landfall, best use of the city",
  "Best design",
];

export type Slot = { time: string; title: string; note: string };
export type Phase = {
  label: string;
  window: string;
  /** Something about the phase that is not a moment, like what is still open. */
  note?: string;
  slots: Slot[];
};

/** The shape of the day. Times move if the venue's hours differ. */
export const SCHEDULE: Phase[] = [
  {
    label: "Morning",
    window: "8:30 to 12",
    slots: [
      {
        time: "8:30 AM",
        title: "Doors open",
        note: "Check in, breakfast, find a seat with power.",
      },
      {
        time: "9:30 AM",
        title: "Opening ceremony",
        note: "Rules of the day, track reveal, sponsor intros.",
      },
      {
        time: "10:00 AM",
        title: "Hacking begins",
        note: "Team matching runs in the corner for anyone still solo.",
      },
      {
        time: "11:30 AM",
        title: "Workshop: your first API call",
        note: "Optional, thirty minutes, nothing to install.",
      },
    ],
  },
  {
    label: "Afternoon",
    window: "1 to 6",
    slots: [
      {
        time: "1:00 PM",
        title: "Lunch and sponsor booths",
        note: "Eat, walk the tables, collect stickers.",
      },
      {
        time: "4:00 PM",
        title: "Workshop: shipping it live",
        note: "Get your thing on a real URL before dinner.",
      },
    ],
  },
  {
    label: "Night",
    window: "6 to 11",
    note: "Workshops TBD",
    slots: [
      {
        time: "6:00 PM",
        title: "Dinner, then final sprint",
        note: "Three hours left on the clock from here.",
      },
      {
        time: "9:00 PM",
        title: "Submissions close, demos start",
        note: "Judges walk the room, science fair style.",
      },
      {
        time: "10:30 PM",
        title: "Awards and closing",
        note: "Prizes, thank yous, everyone out by 11.",
      },
    ],
  },
];

export type SponsorTier = {
  id: "bronze" | "silver" | "gold" | "platinum";
  name: string;
  priceUsd: number;
  /** Dot colour. The rest of the card stays in the site palette. */
  accent: string;
  /** New at this tier. Every tier also includes everything below it. */
  perks: string[];
};

/** Ascending. The site computes what each tier inherits from the ones below. */
export const SPONSOR_TIERS: SponsorTier[] = [
  {
    id: "bronze",
    name: "Bronze",
    priceUsd: 500,
    accent: "#c8894a",
    perks: [
      "Logo on the website",
      "Thanked by name at closing",
      "Logo on the prize slides",
      "Logo on the opening slides",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    priceUsd: 1_000,
    accent: "#b9bcc4",
    perks: ["A thirty minute workshop slot"],
  },
  {
    id: "gold",
    name: "Gold",
    priceUsd: 2_000,
    accent: "#ffb228",
    perks: [
      "Up to two mentors on the floor",
      "Your name on a track prize",
      "Named on the Gold sponsor slide",
      "Larger logo on the website",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    priceUsd: 4_000,
    accent: "#ece8dc",
    perks: [
      "Up to four mentors on the floor",
      "A \u201cPresented by\u201d lockup",
      "Largest logo on the website",
      "Three minutes at the opening",
      "Hand out an award at closing",
      "Name a prize category",
      "A judge on the panel",
      "Your own slide at opening and closing",
    ],
  },
];

/** Not cash. Credited at whichever cash tier the value matches. */
export const IN_KIND = {
  note: "Credited at the matching cash tier",
  items: ["API credits or licences", "Mentors only, no cash"],
};

export type Backer = {
  name: string;
  website: string;
  /** Under public/sponsors: the company's own wordmark on a transparent ground. */
  logo: string;
  /** What they have committed, in plain words, close to their own. */
  gives: string;
  /** How it was committed. Everything is in kind until money lands. */
  form: "In kind";
};

/**
 * Companies that have committed something in writing. None of this is cash,
 * so EVENT.budget.raisedUsd does not move for it; it moves only for money in
 * the bank. Add a company here only once they have said yes in writing.
 */
export const BACKERS: Backer[] = [
  {
    name: "YRI Fellowship",
    website: "https://www.yriscience.com",
    logo: "/sponsors/yri.png",
    gives:
      "Fellowship scholarships for winning team members, priority admission review for winners, and a mentorship prize for the overall winning team.",
    form: "In kind",
  },
  {
    name: "Perfect Corp",
    website: "https://www.perfectcorp.com",
    logo: "/sponsors/perfect-corp.svg",
    gives:
      "YouCam AI and AR API units, free of charge, for every participant to build with on the day.",
    form: "In kind",
  },
];

/** In-kind prizes committed in writing that are not yet placed against a
 *  category. They move into PLANNED_PRIZE_CATEGORIES once the paperwork is
 *  signed, and not before. */
export const COMMITTED_PRIZES: { by: string; what: string }[] = [
  {
    by: "YRI Fellowship",
    what: "Fellowship scholarships for winning team members and a mentorship prize for the overall winning team. Placed against categories once the partnership agreement is signed.",
  },
];

export type Judge = {
  name: string;
  role: string;
  org: string;
  /** Their own words, lightly trimmed. */
  bio: string;
  linkedin: string;
  /** Under public/photos/judges. The headshot they sent us. */
  photo: string;
};

/**
 * Only people who have agreed in writing. Each judge sent their own bio and
 * headshot; nobody is listed on a verbal maybe.
 */
export const JUDGES: Judge[] = [
  {
    name: "Swosti Panda",
    role: "Lead PM/Analyst, Devices & Services",
    org: "Google",
    bio: "Works on the supply chain and logistics architecture behind Google\u2019s flagship retail stores. Previously at Walmart Technology. MS in Supply Chain Management.",
    linkedin: "https://www.linkedin.com/in/swostipanda/",
    photo: "/photos/judges/swosti-panda.jpg",
  },
  {
    name: "Vasuki Uday Kiran Vudathala",
    role: "Staff Performance Engineer, AI/ML",
    org: "ServiceNow",
    bio: "Specializes in GenAI performance, scalability and production reliability. Sixteen-plus years in industry, and a technical author, conference speaker, and hackathon judge and mentor.",
    linkedin: "https://www.linkedin.com/in/vasukiudaykiran/",
    photo: "/photos/judges/uday-vudathala.jpg",
  },
];

const COUNT_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

/** Small counts read as words in copy: "Two companies", not "2 companies". */
export const countInWords = (n: number) => COUNT_WORDS[n] ?? String(n);

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "What even is a hackathon?",
    a: "A room full of people building something small and finishing it in a day: an app, a game, a website, a hardware hack. Winning is beside the point. Shipping something with a few other people is the point.",
  },
  {
    q: "Can I apply yet?",
    a: "Yes, early. The application takes two minutes and puts you in the queue. Nobody is confirmed until the venue is signed and the budget is covered, and you will hear the day that happens. If it falls through, you will hear that too.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. Plenty of attendees write their first real code at an event like this. Mentors are on the floor all day and the First Light track judges effort and learning, not polish.",
  },
  {
    q: "What grades can apply?",
    a: "High school, grades 9 through 12, anywhere in the Bay Area. Bring a school ID for check in.",
  },
  {
    q: "Is it actually free?",
    a: "That is the plan, and it depends entirely on sponsorship. No cash has been raised yet; what has been committed so far is in kind. If the money does not come together we will say so here rather than quietly charge for it.",
  },
  {
    q: "Do I have to stay overnight?",
    a: "Never. Doors at 8:30am, awards done by 11pm, everyone sleeps in their own bed.",
  },
];
