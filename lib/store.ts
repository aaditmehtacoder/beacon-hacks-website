import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type { Entry } from "./notify-schema";

/**
 * Where applications and the notify list live.
 *
 * Upstash Redis when its env vars are present (the Vercel Marketplace sets
 * them), a JSON file under .data/ in development, and a /tmp file on Vercel
 * without a database, which is honest about being ephemeral so the admin
 * page can say so.
 *
 * One row per email: a newer application replaces an older notify signup
 * from the same person, and applying twice keeps the latest.
 */

export type Backend = {
  kind: "upstash" | "file" | "ephemeral";
  label: string;
  warning?: string;
};

const ENTRIES = "beacon:entries";
const EMAILS = "beacon:emails";

function upstash(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

const FILE = process.env.VERCEL
  ? "/tmp/beacon-entries.json"
  : path.join(process.cwd(), ".data", "entries.json");

export function describeBackend(): Backend {
  if (upstash()) return { kind: "upstash", label: "Upstash Redis" };
  if (process.env.VERCEL) {
    return {
      kind: "ephemeral",
      label: "No database",
      warning:
        "Nothing is being saved. Entries live in this server instance's memory and will be lost. Add Upstash Redis from the Vercel Marketplace and redeploy.",
    };
  }
  return { kind: "file", label: "Local file (.data/entries.json)" };
}

async function readAll(): Promise<Record<string, Entry>> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Record<string, Entry>;
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, Entry>) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, FILE);
}

export async function addEntry(entry: Entry): Promise<void> {
  const redis = upstash();
  if (redis) {
    const previous = await redis.hget<string>(EMAILS, entry.email);
    if (previous && previous !== entry.id) await redis.hdel(ENTRIES, previous);
    await redis.hset(ENTRIES, { [entry.id]: entry });
    await redis.hset(EMAILS, { [entry.email]: entry.id });
    return;
  }
  const data = await readAll();
  for (const [id, row] of Object.entries(data)) {
    if (row.email === entry.email) delete data[id];
  }
  data[entry.id] = entry;
  await writeAll(data);
}

export async function listEntries(): Promise<Entry[]> {
  const redis = upstash();
  let rows: Entry[];
  if (redis) {
    const all = (await redis.hgetall<Record<string, Entry | string>>(ENTRIES)) ?? {};
    rows = Object.values(all).map((v) => (typeof v === "string" ? (JSON.parse(v) as Entry) : v));
  } else {
    rows = Object.values(await readAll());
  }
  return rows.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export async function removeEntry(id: string): Promise<boolean> {
  const redis = upstash();
  if (redis) {
    const row = await redis.hget<Entry | string>(ENTRIES, id);
    if (!row) return false;
    const entry = typeof row === "string" ? (JSON.parse(row) as Entry) : row;
    await redis.hdel(ENTRIES, id);
    const owner = await redis.hget<string>(EMAILS, entry.email);
    if (owner === id) await redis.hdel(EMAILS, entry.email);
    return true;
  }
  const data = await readAll();
  if (!data[id]) return false;
  delete data[id];
  await writeAll(data);
  return true;
}
