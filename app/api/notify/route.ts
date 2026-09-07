import { NextResponse } from "next/server";
import { notifySchema } from "@/lib/notify-schema";

/**
 * Where a notify signup goes. Set NOTIFY_WEBHOOK_URL to a Formspree endpoint,
 * a Worker, a sheet proxy, whatever you use. With it unset the route still
 * validates and logs, so the form is testable before the destination exists.
 */
const WEBHOOK = process.env.NOTIFY_WEBHOOK_URL;

/** Crude per-instance rate limit: enough to stop a bored visitor hammering it. */
const seen = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (seen.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  seen.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many signups from here. Try again in a minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Send JSON." }, { status: 400 });
  }

  const parsed = notifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." },
      { status: 422 },
    );
  }

  const signup = { ...parsed.data, receivedAt: new Date().toISOString() };

  if (WEBHOOK) {
    try {
      const upstream = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(signup),
      });
      if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    } catch (error) {
      console.error("[notify] forwarding failed", error);
      return NextResponse.json(
        { ok: false, error: "We could not save that. Try again, or email us." },
        { status: 502 },
      );
    }
  } else {
    console.log("[notify] no NOTIFY_WEBHOOK_URL set, signup accepted locally:", signup);
  }

  return NextResponse.json({ ok: true });
}
