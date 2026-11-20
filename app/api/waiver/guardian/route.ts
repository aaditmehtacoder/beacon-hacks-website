import { NextResponse, after } from "next/server";
import { z } from "zod";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { hashGuardianToken, looksLikeToken } from "@/lib/guardian-token";
import { clearGuardianToken, findByGuardianToken, updateWaiver } from "@/lib/waiver-store";
import { mailConfigured, sendMail, teamReviewEmail } from "@/lib/waiver-mail";

const squash = (s: string) => s.toLowerCase().replace(/[^a-zÀ-ɏ]+/g, "");

const body = z.object({
  token: z.string(),
  agree: z.literal(true, { error: "Agree to the waiver to sign it." }),
  guardianSignature: z.string().trim().max(120).default(""),
  guardianSignatureImage: z
    .string()
    .max(300_000)
    .regex(/^(data:image\/png;base64,[A-Za-z0-9+/]+=*)?$/)
    .default(""),
});

/**
 * A parent or guardian signing from the link in their email. The link
 * works once; after it, the waiver goes to the team to review.
 */
export async function POST(request: Request) {
  if (rateLimited(`guardian:${clientIp(request)}`, 8)) {
    return NextResponse.json({ ok: false, error: "Too many tries. Wait a minute and try again." }, { status: 429 });
  }
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: issue?.message ?? "Check the form.", field: String(issue?.path[0] ?? "") }, { status: 422 });
  }
  const { token, guardianSignature, guardianSignatureImage } = parsed.data;
  const waiver = looksLikeToken(token) ? await findByGuardianToken(hashGuardianToken(token)) : null;
  if (!waiver) {
    return NextResponse.json({ ok: false, error: "This link has already been used or has been replaced by a newer one." }, { status: 410 });
  }

  if (!guardianSignatureImage) {
    if (!guardianSignature) return NextResponse.json({ ok: false, error: "Sign here: draw your signature or type your name.", field: "guardianSignature" }, { status: 422 });
    if (squash(guardianSignature) !== squash(waiver.guardianName)) {
      return NextResponse.json({ ok: false, error: `Type your full name exactly: ${waiver.guardianName}`, field: "guardianSignature" }, { status: 422 });
    }
  }

  const signed = await updateWaiver(waiver.id, {
    guardianSignature: guardianSignatureImage ? waiver.guardianName : guardianSignature,
    guardianSignatureImage,
    guardianSignedAt: new Date().toISOString(),
    guardianIp: clientIp(request),
    guardianUserAgent: (request.headers.get("user-agent") ?? "").slice(0, 300),
  });
  const done = signed ? await clearGuardianToken(signed) : null;
  if (!done) return NextResponse.json({ ok: false, error: "We could not save that. Try again." }, { status: 500 });

  after(async () => {
    if (!mailConfigured()) return;
    try {
      await sendMail(teamReviewEmail(done));
    } catch (error) {
      console.error("[waiver] review email failed", error);
    }
  });
  return NextResponse.json({ ok: true, signedAt: done.guardianSignedAt });
}
