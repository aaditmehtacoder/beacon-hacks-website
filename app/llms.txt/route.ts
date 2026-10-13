import { EVENT } from "@/lib/event";
import { FAQS, JUDGES, PACKAGES, PARTNERS, PRIZES_AND_PERKS, SCHEDULE, TRACKS, VENUE_SPONSOR, type Perk } from "@/lib/content";

/* Built once at build time from the same data as the page, so it never
   says something the site does not. */
export const dynamic = "force-static";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/* Who gives a prize or a perk, as "A, B and C". What each gives stays off
   the site, here as on the page. */
const givers = (kind: Perk["kind"]) =>
  PRIZES_AND_PERKS.filter((p) => p.kind === kind)
    .map((p) => `${p.from}${p.status === "pending" ? " (being finalized)" : ""}`)
    .join(", ")
    .replace(/, ([^,]*)$/, " and $1");

function llms() {
  const url = EVENT.url;
  const date = `${EVENT.date.label}${EVENT.date.confirmed ? "" : " (target date)"}`;
  const where = EVENT.venue.place
    ? `${EVENT.venue.place}, ${EVENT.venue.address}`
    : `${EVENT.venue.label} (venue being finalized)`;

  const lines = [
    `# ${EVENT.name}`,
    "",
    `> A free, one-day hackathon for Bay Area high school students (grades 9 to 12) in ${EVENT.venue.label}. ${date}. No experience needed; teams of up to four.`,
    "",
    `${EVENT.name} is run by high school students, for high school students. Applications are open at ${url}/apply and take about two minutes. Spots are confirmed once ${EVENT.applications.until}.`,
    "",
    "## Pages",
    "",
    `- [Home](${url}/): what the day is, tracks, prizes, schedule, judges, sponsors and FAQ`,
    `- [Apply](${url}/apply): the application form`,
    `- [Code of conduct](${url}/code-of-conduct): expectations, reporting and safety rules for an event of minors`,
    "",
    "## Key facts",
    "",
    `- Date: ${date}`,
    `- Hours: doors open 8:30 AM; hacking ${EVENT.hours.hacking} (${EVENT.hours.hackingHours} hours); everyone heads home by 11 PM, no overnight`,
    `- Location: ${where}`,
    "- Who: high school students in grades 9 to 12 from anywhere in the Bay Area; no coding experience needed",
    "- Teams: 1 to 4 people, with team matching at kickoff",
    `- Planned capacity: ${EVENT.capacityLabel} students`,
    "- Cost: free to apply and to attend",
    `- Fiscal sponsor: HCB by Hack Club, a 501(c)(3) nonprofit; finances are public at ${EVENT.hcb}`,
    `- Contact: ${EVENT.email.team}`,
    "",
    "## Tracks",
    "",
    ...TRACKS.map((t) => `- ${t.name}: ${t.body}`),
    "",
    "## Schedule (draft)",
    "",
    ...SCHEDULE.flatMap((phase) => phase.slots.map((slot) => `- ${slot.time}: ${slot.title}. ${slot.note}`)),
    "",
    "## Prizes and perks",
    "",
    `- For the winners: prizes from ${givers("prize")}.`,
    `- For every builder: perks from ${givers("perk")}.`,
    "- Participants get the details before the event.",
    "",
    "## Judges",
    "",
    ...JUDGES.map((j) => `- ${j.name}, ${j.role}, ${j.org}`),
    "",
    "Judges take part as individuals; their employers are not sponsors.",
    "",
    "## Sponsors",
    "",
    ...(VENUE_SPONSOR
      ? [`- Venue sponsor: ${VENUE_SPONSOR.name}${VENUE_SPONSOR.status === "pending" ? " (being finalized)" : ""}`]
      : []),
    ...PARTNERS.map((p) => `- ${p.name}: ${p.role.toLowerCase()}`),
    `- Sponsorship packages: ${PACKAGES.map((p) => `${p.name} ${usd(p.priceUsd)}`).join(", ")}. In-kind support is welcome. Write to ${EVENT.email.sponsors}.`,
    "",
    "## FAQ",
    "",
    ...FAQS.flatMap((f) => [`### ${f.q}`, "", f.a, ""]),
  ];
  return lines.join("\n");
}

export function GET() {
  return new Response(llms(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
