import { EVENT } from "./event";
import { BACKERS, countInWords } from "./content";

export type GateState = "done" | "active" | "blocked";

export type Gate = {
  id: string;
  order: string;
  title: string;
  state: GateState;
  detail: string;
  /** What has to be true before this can be marked done. */
  unlocks: string;
};

/**
 * The public build status. This is the honest answer to "is this real yet?",
 * which is the first question any sponsor, parent or student has. Move a gate
 * to "done" only when the thing has actually happened in writing.
 */
export const GATES: Gate[] = [
  {
    id: "venue",
    order: "Gate 1",
    title: "Venue signed off",
    state: "active",
    detail:
      "A host in Belmont has offered the space and we are waiting on written approval from their facilities team. Until that lands we are not publishing their name.",
    unlocks: "Locks the date, the address, and the room count",
  },
  {
    id: "funding",
    order: "Gate 2",
    title: "Day funded",
    state: "active",
    detail: `$${EVENT.budget.raisedUsd.toLocaleString()} of $${EVENT.budget.targetUsd.toLocaleString()} raised. ${countInWords(BACKERS.length)} ${BACKERS.length === 1 ? "company has" : "companies have"} committed support in kind, in writing; no cash is committed yet. Food, space and prizes all come out of this.`,
    unlocks: "Unlocks prizes and keeps the day free to attend",
  },
  {
    id: "applications",
    order: "Gate 3",
    title: "Applications open",
    state: "active",
    detail:
      "Early applications are open now. Nobody is confirmed until the room and the money are both real, and everyone who applied hears the same day that changes.",
    unlocks: "Confirms spots and starts the countdown",
  },
];

export const STATE_LABEL: Record<GateState, string> = {
  done: "Done",
  active: "In progress",
  blocked: "Locked",
};
