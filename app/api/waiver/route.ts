import { NextResponse } from "next/server";
import { ADULT_AGE, WAIVER_VERSION, ageOnEventDay, waiverSchema } from "@/lib/waiver";
import { saveWaiver, waiverBackend } from "@/lib/waiver-store";
import { clientIp, rateLimited } from "@/lib/rate-limit";

/**
 * A signed waiver. Checked with the same schema as the form, then stored
 * with the time, the version of the text, the signer's IP and browser:
 * the record that shows who agreed to what, and when.
 */
export async function POST(request: Request) {
  if (rateLimited(`waiver:${clientIp(request)}`, 6)) {
    return NextResponse.json({ ok: false, error: "Too many tries from here. Wait a minute and send it again." }, { status: 429 });
  }
  if (waiverBackend() === "none") {
    return NextResponse.json(
      { ok: false, error: "Waivers are not being saved on this server yet. Email us and we will sort it out." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Send JSON." }, { status: 400 });
  }

  const parsed = waiverSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fields[key] ??= issue.message;
    }
    return NextResponse.json({ ok: false, error: "Check the highlighted fields.", fields }, { status: 422 });
  }

  const data = parsed.data;
  const age = ageOnEventDay(data.dateOfBirth)!;
  const minor = age < ADULT_AGE;

  try {
    const saved = await saveWaiver({
      ...data,
      /* An adult signs alone: drop anything left in the guardian fields. */
      ...(minor ? {} : { guardianName: "", guardianRelationship: "", guardianEmail: "", guardianPhone: "", guardianSignature: "" }),
      id: crypto.randomUUID(),
      version: WAIVER_VERSION,
      signedAt: new Date().toISOString(),
      age,
      minor,
      ip: clientIp(request),
      userAgent: (request.headers.get("user-agent") ?? "").slice(0, 300),
    });
    return NextResponse.json({ ok: true, id: saved.id, signedAt: saved.signedAt, revision: saved.revision });
  } catch (error) {
    console.error("[waiver] store failed", error);
    return NextResponse.json({ ok: false, error: "We could not save your waiver. Try again, or email us." }, { status: 500 });
  }
}
