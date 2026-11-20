import { NextResponse, after } from "next/server";
import { ADULT_AGE, WAIVER_VERSION, ageOnEventDay, guardianSigned, waiverSchema } from "@/lib/waiver";
import { saveWaiver, setGuardianToken, waiverBackend } from "@/lib/waiver-store";
import { guardianSignEmail, mailConfigured, sendMail, teamReviewEmail } from "@/lib/waiver-mail";
import { guardianLink, newGuardianToken } from "@/lib/guardian-token";
import { clientIp, rateLimited } from "@/lib/rate-limit";

/**
 * A signed waiver. Checked with the same schema as the form, then stored
 * with the time, the version of the text, the signer's IP and browser:
 * the record that shows who agreed to what, and when. It waits for an
 * organizer to approve it; the team inbox gets it to review.
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
      /* With a drawing, the typed field records the signer's printed name. */
      ...(data.participantSignatureImage ? { participantSignature: `${data.firstName} ${data.lastName}` } : {}),
      ...(minor && data.guardianSignatureImage ? { guardianSignature: data.guardianName } : {}),
      /* Signing later: whatever is in the guardian signature fields now is not theirs. */
      ...(minor && data.guardianMethod !== "here" ? { guardianSignature: "", guardianSignatureImage: "" } : {}),
      /* An adult signs alone: drop anything left in the guardian fields. */
      ...(minor
        ? {}
        : {
            guardianName: "",
            guardianRelationship: "",
            guardianEmail: "",
            guardianPhone: "",
            guardianSignature: "",
            guardianSignatureImage: "",
            guardianMethod: "here" as const,
          }),
      id: crypto.randomUUID(),
      version: WAIVER_VERSION,
      signedAt: new Date().toISOString(),
      age,
      minor,
      ip: clientIp(request),
      userAgent: (request.headers.get("user-agent") ?? "").slice(0, 300),
    });
    /* By link: a one-time token for the parent or guardian. */
    let link: string | null = null;
    if (saved.minor && saved.guardianMethod === "email") {
      const { token, hash } = newGuardianToken();
      await setGuardianToken(saved.id, hash);
      link = guardianLink(token, request);
    }

    /* Emails go out once the signer has their answer; a failed email never
       loses the waiver, which is saved and waits in /admin either way.
       The team reviews it once every signature is in. */
    after(async () => {
      if (!mailConfigured()) return console.info("[waiver] email not configured; saved without emailing");
      try {
        if (link) await sendMail(guardianSignEmail(saved, link));
        else if (guardianSigned(saved)) await sendMail(teamReviewEmail(saved));
      } catch (error) {
        console.error("[waiver] email failed", error);
      }
    });
    return NextResponse.json({ ok: true, id: saved.id, signedAt: saved.signedAt, revision: saved.revision });
  } catch (error) {
    console.error("[waiver] store failed", error);
    return NextResponse.json({ ok: false, error: "We could not save your waiver. Try again, or email us." }, { status: 500 });
  }
}
