import { promises as fs } from "node:fs";
import path from "node:path";
import { upstash } from "@/lib/store";
import { mailbox } from "./gmail";
import type { Ledger } from "./types";

/**
 * Where the ledger lives: one JSON document, in Upstash Redis when it is
 * configured (the same database as the signups), otherwise a file under
 * .data/ in development and /tmp on Vercel, which is ephemeral.
 */
const KEY = "beacon:outreach";

const FILE = process.env.VERCEL
  ? "/tmp/beacon-outreach.json"
  : path.join(process.cwd(), ".data", "outreach.json");

export function emptyLedger(): Ledger {
  return { mailbox: mailbox(), syncedAt: null, companies: [], lastSync: null };
}

export async function loadLedger(): Promise<Ledger> {
  const redis = upstash();
  if (redis) {
    const row = await redis.get<Ledger | string>(KEY);
    if (!row) return emptyLedger();
    return typeof row === "string" ? (JSON.parse(row) as Ledger) : row;
  }
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Ledger;
  } catch {
    return emptyLedger();
  }
}

export async function saveLedger(ledger: Ledger): Promise<void> {
  const redis = upstash();
  if (redis) {
    await redis.set(KEY, ledger);
    return;
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(ledger, null, 2));
  await fs.rename(tmp, FILE);
}
