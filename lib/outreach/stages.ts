import type { Company } from "./types";

/**
 * The escalation ladder.
 *
 * Outcome (active, rejected, waiting) says how a thread ended up. The stage
 * says what happens next and whose move it is, which is what the page is
 * sorted by: your court first, theirs second, settled last. It is worked out
 * at render time, because "a week of silence" moves as the days pass.
 */
export type Stage =
  | "your-move"
  | "follow-up"
  | "new-route"
  | "their-move"
  | "queue"
  | "quiet"
  | "working"
  | "closed";

export type Court = "yours" | "theirs" | "settled";

export const FOLLOW_UP_DAYS = 7;

export const STAGES: { key: Stage; heading: string; blurb: string; court: Court }[] = [
  {
    key: "your-move",
    heading: "Your move",
    blurb: "A person wrote last. The reply is owed by the team, longest owed first.",
    court: "yours",
  },
  {
    key: "follow-up",
    heading: "Follow-up due",
    blurb: `Quiet for ${FOLLOW_UP_DAYS} days or more since the team last wrote. One polite nudge on the same thread, most overdue first.`,
    court: "yours",
  },
  {
    key: "new-route",
    heading: "Needs a new route",
    blurb: "Every address bounced, so nothing was delivered. Find a person, a form or a LinkedIn message before writing again.",
    court: "yours",
  },
  {
    key: "their-move",
    heading: "Their move",
    blurb: "A person has engaged and the team answered last. Waiting on them, longest wait first.",
    court: "theirs",
  },
  {
    key: "queue",
    heading: "In their queue",
    blurb: "An automated receipt came back, so the message sits in a ticket system a person still has to read.",
    court: "theirs",
  },
  {
    key: "quiet",
    heading: "Sent, no answer yet",
    blurb: `Under ${FOLLOW_UP_DAYS} days old with nothing back. Leave these alone for now.`,
    court: "theirs",
  },
  {
    key: "working",
    heading: "Working together",
    blurb: "Signed, or money in the bank. Set by hand in the roster, never by the model.",
    court: "settled",
  },
  {
    key: "closed",
    heading: "Closed",
    blurb: "A person said no and offered nothing else. Nothing to do unless something changes on their side.",
    court: "settled",
  },
];

export const COURT: Record<Court, string> = {
  yours: "Ball in your court",
  theirs: "Ball in theirs",
  settled: "Settled",
};

const DAY = 86_400_000;

export const daysSince = (iso: string, now: Date) => Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / DAY));

const replied = (c: Company) => c.contacts.some((x) => x.delivery === "replied") || !!c.replyFrom;
const allBounced = (c: Company) =>
  c.contacts.length > 0 && c.contacts.every((x) => x.delivery === "bounced");
const queued = (c: Company) => !!c.autoReceipt || c.contacts.some((x) => x.delivery === "auto");

export function stageOf(c: Company, now: Date): Stage {
  if (c.converted) return "working";
  if (c.status === "rejected") return "closed";
  const quietFor = daysSince(c.teamLastAt ?? c.lastActivity, now);
  if (replied(c)) {
    if ((c.lastMessageFrom ?? "team") === "person") return "your-move";
    return quietFor >= FOLLOW_UP_DAYS ? "follow-up" : "their-move";
  }
  if (allBounced(c)) return "new-route";
  if (quietFor >= FOLLOW_UP_DAYS) return "follow-up";
  return queued(c) ? "queue" : "quiet";
}

/** Sort key inside a group: how long the ball has sat where it is. Settled
 *  groups read newest first instead. */
export function sortForStage(stage: Stage) {
  const settled = stage === "working" || stage === "closed";
  return (a: Company, b: Company) =>
    settled ? b.lastActivity.localeCompare(a.lastActivity) : a.lastActivity.localeCompare(b.lastActivity);
}

/** The next step for a thread the rules described (the model writes its own). */
export function adviceFor(stage: Stage, c: Company, now: Date): string | null {
  const quietFor = daysSince(c.teamLastAt ?? c.lastActivity, now);
  const bounced = c.contacts.filter((x) => x.delivery === "bounced").map((x) => x.email);
  switch (stage) {
    case "your-move":
      return "Answer the reply in Gmail. A person is waiting on the team.";
    case "follow-up":
      return `It has been ${quietFor} days. Reply on the same thread, two lines, no new ask.`;
    case "new-route":
      return "Every address bounced. Find a named person, a sponsorship form or a LinkedIn message before writing again.";
    case "their-move":
      return `The team wrote last. Give it until day ${FOLLOW_UP_DAYS}, then nudge.`;
    case "queue":
      return `The request is in their ticket queue. Give it until day ${FOLLOW_UP_DAYS}, then reply on the same thread to keep the ticket alive.`;
    case "quiet":
      return bounced.length
        ? `Do not retry ${bounced.join(", ")}. Give the rest until day ${FOLLOW_UP_DAYS}, then send one polite follow-up.`
        : `Give it until day ${FOLLOW_UP_DAYS}, then send one polite follow-up on the same thread.`;
    case "working":
      return null;
    case "closed":
      return null;
  }
}
