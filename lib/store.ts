import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type { Entry } from "./notify-schema";

/**
 * Where the updates list lives (and the applications taken before
 * registration moved to Luma on Oct 25, 2026).
 *
 * Upstash Redis when its env vars are present (the Vercel Marketplace sets
 * them): every entry is a field of the `beacon:entries` hash, readable in
 * the Upstash data browser, which is the only view of it now that /admin is
 * gone. In development, a JSON file under .data/; on Vercel without a
 * database, a /tmp file that does not survive a redeploy.
 *
 * One row per email: signing up twice keeps the latest.
 */

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
