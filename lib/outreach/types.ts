/**
 * The outreach ledger: every organisation the team mailbox has written to,
 * what came back, and what to do next. Built from Gmail by lib/outreach/sync.ts
 * and stored whole (lib/outreach/store.ts).
 */

/** What Gmail proves about one address. */
export type Delivery = "sent" | "replied" | "auto" | "bounced";

/** Where the conversation stands. `converted` on the company is the human's
 *  "we are actually working together", set by hand and never by the model. */
export type Status = "active" | "rejected" | "waiting";

export type Contact = {
  name: string;
  email: string;
  delivery: Delivery;
};

export type Kind = "company" | "fund" | "organiser" | "school" | "programme" | "community";

export type Verdict = {
  status: Status;
  signalTone: "positive" | "rejected" | null;
  replyFrom: string | null;
  signal: string;
  nextStep: string | null;
};

export type Company = {
  /** Stable key: the domain, or the address for free-mail senders. */
  id: string;
  name: string;
  domain: string;
  website: string | null;
  kind: Kind;
  /** One line on who they are. Hand-written in roster.ts; empty if unknown. */
  description: string;
  /** What the outreach asked for, lifted from the email itself. */
  ask: string;
  /** The subject line of the first email, which carries the hook. */
  subject: string;
  status: Status;
  converted: boolean;
  signalTone: "positive" | "rejected" | null;
  replyFrom: string | null;
  signal: string | null;
  nextStep: string | null;
  /** ISO timestamps of the first message we sent and the latest in the thread. */
  contactedOn: string;
  lastActivity: string;
  /** ISO time of the last message the team sent. */
  teamLastAt: string;
  /** Who wrote the latest message in the thread. Decides whose move it is. */
  lastMessageFrom: "team" | "person" | "auto" | "bounce";
  /** An automated receipt came back from somewhere, so the mail is in a queue. */
  autoReceipt: boolean;
  gmailThread: string;
  /** Gmail id of the last message seen when this verdict was written. */
  lastMessageId: string;
  /** Who wrote the verdict: the model, the rules, or a human override. */
  verdictBy: "model" | "rules" | "override";
  messages: number;
  contacts: Contact[];
  overrideReason?: string;
};

export type Ledger = {
  mailbox: string;
  /** ISO time of the last completed sync, or null before the first one. */
  syncedAt: string | null;
  companies: Company[];
  lastSync: SyncReport | null;
};

export type SyncReport = {
  startedAt: string;
  finishedAt: string;
  threads: number;
  companies: number;
  classified: number;
  reused: number;
  model: string | null;
  /** The deployment that ran the sync, for telling builds apart. */
  build: string | null;
  errors: string[];
};
