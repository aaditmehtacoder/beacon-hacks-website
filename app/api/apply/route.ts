import { NextResponse } from "next/server";
import { applySchema } from "@/lib/notify-schema";
import { addEntry } from "@/lib/store";
import { clientIp, rateLimited } from "@/lib/rate-limit";

/** An early application. Stored; forwarded to NOTIFY_WEBHOOK_URL if set. */
const WEBHOOK = process.env.NOTIFY_WEBHOOK_URL;

export async function POST(request: Request) {
  if (rateLimited(`apply:${clientIp(request)}`)) {
    return NextResponse.json(
      { ok: false, error: "Too many applications from here. Try again in a minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Send JSON." }, { status: 400 });
  }

  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." },
      { status: 422 },
    );
  }

  const entry = {
    id: crypto.randomUUID(),
    kind: "application" as const,
    ...parsed.data,
    idea: parsed.data.idea || undefined,
    receivedAt: new Date().toISOString(),
  };

  try {
    await addEntry(entry);
  } catch (error) {
    console.error("[apply] store failed", error);
    return NextResponse.json(
      { ok: false, error: "We could not save that. Try again, or email us." },
      { status: 500 },
    );
  }

  if (WEBHOOK) {
    try {
      const upstream = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(entry),
      });
      if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    } catch (error) {
      console.error("[apply] forwarding failed", error);
    }
  }

  return NextResponse.json({ ok: true });
}
