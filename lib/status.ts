import { EVENT } from "./event";

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
    state: "blocked",
    detail: `$${EVENT.budget.raisedUsd.toLocaleString()} of $${EVENT.budget.targetUsd.toLocaleString()} raised. Sponsor outreach has not started. Food, space and prizes all come out of this.`,
    unlocks: "Unlocks prizes and keeps the day free to attend",
  },
  {
    id: "applications",
    order: "Gate 3",
    title: "Applications open",
    state: "blocked",
    detail:
      "Registration opens once the room and the money are both real. Everyone on the notify list hears first, on the same day.",
    unlocks: "Opens the application form and the countdown",
  },
];

export const STATE_LABEL: Record<GateState, string> = {
  done: "Done",
  active: "In progress",
  blocked: "Locked",
};
