import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type { Waiver } from "./waiver";

/**
 * Where signed waivers live. Upstash Redis when its env vars are set (the
 * same database as the updates list, under its own keys); in development, a
 * JSON file at .data/waivers.json (git-ignored).
 *
 * In production with no database, nothing is stored and the form says so:
 * a waiver written to a serverless /tmp file would vanish on the next
 * deploy, and a signature we cannot produce later is worse than none.
 *
 * One waiver per participant email: signing again replaces it, and its
 * `revision` counts up.
 */

const WAIVERS = "beacon:waivers";
const BY_EMAIL = "beacon:waiver-emails";
const FILE = path.join(process.cwd(), ".data", "waivers.json");

function redis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

export type WaiverBackend = "redis" | "file" | "none";

export function waiverBackend(): WaiverBackend {
  if (redis()) return "redis";
  return process.env.VERCEL ? "none" : "file";
}

async function readFile(): Promise<Record<string, Waiver>> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Record<string, Waiver>;
  } catch {
    return {};
  }
}

async function writeFile(data: Record<string, Waiver>) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, FILE);
}

/** Saves a waiver, replacing an earlier one with the same email. Returns it as stored. */
export async function saveWaiver(waiver: Omit<Waiver, "revision">): Promise<Waiver> {
  const db = redis();
  if (db) {
    const previousId = await db.hget<string>(BY_EMAIL, waiver.email);
    const previous = previousId ? await db.hget<Waiver>(WAIVERS, previousId) : null;
    const row: Waiver = { ...waiver, revision: (previous?.revision ?? 0) + 1, checkedInAt: previous?.checkedInAt };
    if (previousId && previousId !== row.id) await db.hdel(WAIVERS, previousId);
    await db.hset(WAIVERS, { [row.id]: row });
    await db.hset(BY_EMAIL, { [row.email]: row.id });
    return row;
  }
  if (waiverBackend() === "none") throw new Error("No waiver storage configured");
  const data = await readFile();
  const previous = Object.values(data).find((w) => w.email === waiver.email);
  if (previous) delete data[previous.id];
  const row: Waiver = { ...waiver, revision: (previous?.revision ?? 0) + 1, checkedInAt: previous?.checkedInAt };
  data[row.id] = row;
  await writeFile(data);
  return row;
}

/** Every waiver, newest signature first. */
export async function listWaivers(): Promise<Waiver[]> {
  const db = redis();
  const rows = db ? Object.values((await db.hgetall<Record<string, Waiver>>(WAIVERS)) ?? {}) : Object.values(await readFile());
  return rows.sort((a, b) => b.signedAt.localeCompare(a.signedAt));
}

export async function getWaiver(id: string): Promise<Waiver | null> {
  const db = redis();
  if (db) return (await db.hget<Waiver>(WAIVERS, id)) ?? null;
  return (await readFile())[id] ?? null;
}

export async function removeWaiver(id: string): Promise<boolean> {
  const db = redis();
  if (db) {
    const row = await db.hget<Waiver>(WAIVERS, id);
    if (!row) return false;
    await db.hdel(WAIVERS, id);
    await db.hdel(BY_EMAIL, row.email);
    return true;
  }
  const data = await readFile();
  if (!data[id]) return false;
  delete data[id];
  await writeFile(data);
  return true;
}

/** Marks someone checked in (or undoes it). Returns the new time, or null. */
export async function setCheckedIn(id: string, checkedIn: boolean): Promise<Waiver | null> {
  const db = redis();
  const at = checkedIn ? new Date().toISOString() : undefined;
  if (db) {
    const row = await db.hget<Waiver>(WAIVERS, id);
    if (!row) return null;
    const next = { ...row, checkedInAt: at };
    await db.hset(WAIVERS, { [id]: next });
    return next;
  }
  const data = await readFile();
  if (!data[id]) return null;
  data[id] = { ...data[id], checkedInAt: at };
  await writeFile(data);
  return data[id];
}
