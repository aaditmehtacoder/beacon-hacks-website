import type { Kind, Status } from "./types";

/**
 * What we know about each organisation beyond what Gmail shows: who they
 * are, where they live on the web, and any human override.
 *
 * Keyed by the domain of the address we wrote to, or by the full address for
 * free-mail senders (give those a `website`, which is where the card's domain
 * and icon then come from). An organisation missing from here still gets a
 * card, named after its domain, so a new outreach email never goes unlisted.
 *
 * `override` is the human's last word. A reply that arrived by phone,
 * LinkedIn or a form is invisible to a Gmail sync, which would otherwise call
 * the thread "waiting" forever. It is reapplied after every sync, and must
 * carry a reason. `converted: true` is the only way a company reaches
 * "Working together": it means a signed agreement or money in the bank, and
 * the site's honesty rule applies here as everywhere else.
 */
export type RosterEntry = {
  name: string;
  website?: string;
  kind?: Kind;
  description?: string;
  override?: {
    status?: Status;
    converted?: boolean;
    signal?: string;
    nextStep?: string | null;
    reason: string;
  };
};

export const ROSTER: Record<string, RosterEntry> = {
  "getcrackd@gmail.com": {
    name: "Crackd",
    website: "https://getcrackd.com",
    kind: "company",
    description: "AI study tool for students; bought paid tiers at four high school hackathons in a year, including a custom landing page at Cove Hacks.",
  },
  "frontiertower.io": {
    name: "Frontier Tower",
    website: "https://frontiertower.io",
    kind: "community",
    description: "The San Francisco building that hosts more hackathons than anywhere else in the Bay Area; Partners tier at MakerHacks III.",
  },
  "ai.engineer": {
    name: "AI Engineer",
    website: "https://www.ai.engineer",
    kind: "organiser",
    description: "The AI Engineer conference series, one of the few sponsorship desks in this space that is actually staffed.",
  },
  "agihouse.org": {
    name: "AGI House",
    website: "https://agihouse.org",
    kind: "community",
    description: "Hacker house and event space that runs more hackathons than anyone in the Bay Area, with paid sponsors listed apart from tech partners.",
  },
  "postman.com": {
    name: "Postman",
    website: "https://www.postman.com",
    kind: "company",
    description: "API development platform; prize sponsor at Cal Hacks 12.0 in San Francisco.",
  },
  "atlassiancommunity.com": {
    name: "Atlassian",
    website: "https://www.atlassian.com",
    kind: "company",
    description: "Maker of Jira, Confluence and Trello; sponsored UHS Hacks in San Francisco, the closest event to our size.",
  },
  "hackberkeley.org": {
    name: "Hackathons at Berkeley",
    website: "https://hackberkeley.org",
    kind: "organiser",
    description: "The student organisation behind Cal Hacks, whose 12.0 edition landed sixty sponsors.",
  },
  "kilo.ai": {
    name: "Kilo",
    website: "https://kilo.ai",
    kind: "company",
    description: "AI coding agent; ran two cash-plus-credits challenges at DeveloperWeek 2026.",
  },
  "retool.com": {
    name: "Retool",
    website: "https://retool.com",
    kind: "company",
    description: "Low-code platform for internal tools; ran the Retool challenge at DeveloperWeek 2026.",
  },
  "cocreate.so": {
    name: "CoCreate",
    website: "https://cocreate.so",
    kind: "company",
    description: "Put up cash prizes for the CoCreate challenge at DeveloperWeek 2026.",
  },
  "foxitsoftware.com": {
    name: "Foxit",
    website: "https://www.foxit.com",
    kind: "company",
    description: "PDF software maker; gift-card challenge at DeveloperWeek 2026.",
  },
  "progress.com": {
    name: "Progress",
    website: "https://www.progress.com",
    kind: "company",
    description: "Maker of Telerik, Kendo UI and Sitefinity; Visa gift card challenge at DeveloperWeek 2026.",
  },
  "perfectcorp.com": {
    name: "Perfect Corp",
    website: "https://www.perfectcorp.com",
    kind: "company",
    description: "AI and AR beauty-tech company behind YouCam; the largest straight cash prize on the DeveloperWeek 2026 sponsor page.",
  },
  "you.com": {
    name: "You.com",
    website: "https://you.com",
    kind: "company",
    description: "AI search and agent platform; gift card plus API credits challenge at DeveloperWeek 2026.",
  },
  "cline.bot": {
    name: "Cline",
    website: "https://cline.bot",
    kind: "company",
    description: "Open-source AI coding agent; two cash-plus-credits challenges at DeveloperWeek 2026.",
  },
  "sanity.io": {
    name: "Sanity",
    website: "https://www.sanity.io",
    kind: "company",
    description: "Content platform; $500 cash plus $500 in credits and swag at DeveloperWeek 2026, one of very few that paid cash.",
  },
  "miro.com": {
    name: "Miro",
    website: "https://miro.com",
    kind: "company",
    description: "Visual collaboration whiteboard; a Bose headset and Lego kits for its DeveloperWeek 2026 challenges.",
  },
  "deepgram.com": {
    name: "Deepgram",
    website: "https://deepgram.com",
    kind: "company",
    description: "Speech-to-text and voice AI APIs; Keychron keyboards and a Sennheiser bundle at DeveloperWeek 2026.",
  },
  "mongodb.com": {
    name: "MongoDB",
    website: "https://www.mongodb.com",
    kind: "company",
    description: "Document database; prizes at SFHacks 2025, reached through the MongoDB for Academia programme.",
  },
  "makenotion.com": {
    name: "Notion",
    website: "https://www.notion.com",
    kind: "company",
    description: "Workspace and docs tool; Special tier at Stang Hacks in Danville.",
  },
  "sfbu.edu": {
    name: "SFBU",
    website: "https://www.sfbu.edu",
    kind: "school",
    description: "San Francisco Bay University in Fremont; Diamond at Viking Hacks, Gold at Warrior Hacks and Silver at Milpitas Hacks 3.",
  },
  "1517fund.com": {
    name: "1517 Fund",
    website: "https://www.1517fund.com",
    kind: "fund",
    description: "Venture fund that backs young founders and dropouts; Silver at Milpitas Hacks 3.",
  },
  "actionlayer.io": {
    name: "ActionLayer",
    website: "https://actionlayer.io",
    kind: "company",
    description: "Presented Synthesis Hacks in May 2026, the event Aadit won first overall with Beacon5.",
  },
  "nttvc.com": {
    name: "NTTVC",
    website: "https://www.nttvc.com",
    kind: "fund",
    description: "NTT's venture arm; title sponsor of Synthesis Hacks, the event Aadit won.",
  },
  "nordsec.com": {
    name: "Nord Security",
    website: "https://nordsecurity.com",
    kind: "company",
    description: "Maker of NordVPN and four sister brands; Diamond at Viking Hacks, all five brands in the partner row at Valley Hacks.",
  },
  "render.com": {
    name: "Render",
    website: "https://render.com",
    kind: "company",
    description: "Cloud hosting platform; gave $50 in credits to every registrant at Hack for Humanity, not just the winners.",
  },
  "modal.com": {
    name: "Modal",
    website: "https://modal.com",
    kind: "company",
    description: "Serverless compute and GPUs; $5,000 in credits per person at TreeHacks 2026.",
  },
  "yriscience.com": {
    name: "YRI",
    website: "https://www.yriscience.com",
    kind: "programme",
    description: "Youth Research Initiative fellowship, PhD-mentored research for high schoolers; has backed eight student hackathons, Platinum at The Vakathon.",
  },
  "codecrafters.io": {
    name: "CodeCrafters",
    website: "https://codecrafters.io",
    kind: "company",
    description: "Build-your-own-X programming courses; backed six student hackathons this year, Gold at The Vakathon.",
  },
  "pcbway.com": {
    name: "PCBWay",
    website: "https://www.pcbway.com",
    kind: "company",
    description: "PCB fabrication service with a student sponsorship programme; Bronze at Synthesis Hacks.",
  },
  "figma.com": {
    name: "Figma",
    website: "https://www.figma.com",
    kind: "company",
    description: "Design tool with an education programme; Bronze at Bay Valley Hacks and a swag pack at the DeveloperWeek 2026 hackathon.",
  },
  "supabase.com": {
    name: "Supabase",
    website: "https://supabase.com",
    kind: "company",
    description: "Open-source Postgres backend; keeps a dedicated inbox for hackathon sponsorship requests.",
  },
  "warp.dev": {
    name: "Warp",
    website: "https://www.warp.dev",
    kind: "company",
    description: "AI-native terminal; at Cal Hacks 12.0, Hack the North and HackMIT.",
  },
  "withaqua.com": {
    name: "Aqua Voice",
    website: "https://withaqua.com",
    kind: "company",
    description: "Voice dictation AI and the Avalon speech API.",
  },
  "usemosaic.ai": {
    name: "Mosaic",
    website: "https://usemosaic.ai",
    kind: "company",
    description: "AI video editing agent with an API; run by Adish and Kyle.",
  },
  "webhound.ai": {
    name: "Webhound",
    website: "https://webhound.ai",
    kind: "company",
    description: "AI agent that builds datasets from the open web, with an API.",
  },
  "overlap.ai": {
    name: "Overlap",
    website: "https://overlap.ai",
    kind: "company",
    description: "AI video search and clipping, with an API.",
  },
  "getdex.com": {
    name: "Dex",
    website: "https://getdex.com",
    kind: "company",
    description: "Personal CRM for keeping up with your network, with an API.",
  },
  "wavedash.com": {
    name: "Wavedash",
    website: "https://wavedash.com",
    kind: "company",
    description: "Platform for publishing and playing browser games.",
  },
  "rentahuman.ai": {
    name: "RentAHuman",
    website: "https://rentahuman.ai",
    kind: "company",
    description: "Marketplace where AI agents hire people for real-world tasks, with an API.",
  },
  "producthunt.com": {
    name: "Product Hunt",
    website: "https://www.producthunt.com",
    kind: "community",
    description: "Launch platform for new products; its API is for personal projects only.",
  },
  "snapcalorie.com": {
    name: "SnapCalorie",
    website: "https://snapcalorie.com",
    kind: "company",
    description: "Photo-based calorie tracking, with an API.",
  },
  "songkick.com": {
    name: "Songkick",
    website: "https://www.songkick.com",
    kind: "company",
    description: "Live music discovery and concert listings, with an API.",
  },
  "stipop.io": {
    name: "Stipop",
    website: "https://stipop.io",
    kind: "company",
    description: "Sticker API and SDK for chat apps.",
  },
  "mentraglass.com": {
    name: "Mentra",
    website: "https://mentraglass.com",
    kind: "company",
    description: "Maker of Mentra Live smart glasses and MentraOS, the open smart-glasses OS.",
  },
  "beeper.com": {
    name: "Beeper",
    website: "https://www.beeper.com",
    kind: "company",
    description: "Universal chat app that puts every messenger in one inbox, with an API.",
  },
  "heroiclabs.com": {
    name: "Heroic Labs",
    website: "https://heroiclabs.com",
    kind: "company",
    description: "Maker of Nakama, the open-source multiplayer game server, and Heroic Cloud.",
  },
  "magichour.ai": {
    name: "Magic Hour",
    website: "https://magichour.ai",
    kind: "company",
    description: "AI video generation and editing API; founded by Runbo and David.",
  },
  "newsblur.com": {
    name: "NewsBlur",
    website: "https://newsblur.com",
    kind: "company",
    description: "Open-source RSS news reader run by Samuel Clay, with an API.",
  },
  "pushbullet.com": {
    name: "Pushbullet",
    website: "https://www.pushbullet.com",
    kind: "company",
    description: "Cross-device notifications and messaging, with an API.",
  },
  "photoroom.com": {
    name: "Photoroom",
    website: "https://www.photoroom.com",
    kind: "company",
    description: "AI photo editing and background removal, with an API.",
  },
  "mintplexlabs.com": {
    name: "Mintplex Labs",
    website: "https://mintplexlabs.com",
    kind: "company",
    description: "Maker of AnythingLLM, the open-source all-in-one AI app.",
  },
  "duffel.com": {
    name: "Duffel",
    website: "https://duffel.com",
    kind: "company",
    description: "Flight and stays booking API.",
  },
  "genius.com": {
    name: "Genius",
    website: "https://genius.com",
    kind: "company",
    description: "Song lyrics and annotations, with an API.",
  },
};

const FREE_MAIL = /^(gmail|googlemail|yahoo|outlook|hotmail|live|icloud|me|proton|protonmail)\.(com|net|me)$/i;

/** The roster key for an address: its domain, or the address itself for free mail. */
export function rosterKey(address: string): string {
  const a = address.toLowerCase();
  const domain = a.split("@")[1] ?? a;
  return FREE_MAIL.test(domain) ? a : domain;
}

/** A readable fallback name for a domain nobody has described yet. */
export function nameFromKey(key: string): string {
  const host = key.includes("@") ? key.split("@")[0] : key;
  const stem = host.replace(/\.(com|ai|dev|io|co|org|net|so|edu|bot|app)$/i, "").split(".").at(-1) ?? host;
  return stem.charAt(0).toUpperCase() + stem.slice(1);
}
