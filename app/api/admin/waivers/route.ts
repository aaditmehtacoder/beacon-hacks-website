import { NextResponse, after, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin-auth";
import { getWaiver, listWaivers, removeWaiver, setCheckedIn, setGuardianToken, updateWaiver } from "@/lib/waiver-store";
import { approvedEmail, guardianSignEmail, mailConfigured, sendMail, teamReviewEmail } from "@/lib/waiver-mail";
import { guardianLink, newGuardianToken } from "@/lib/guardian-token";
import { DIETS, departureSummary, genderLabel, guardianSigned, teamSummary, type Waiver } from "@/lib/waiver";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });
}

const DIET_LABEL = Object.fromEntries(DIETS.map((d) => [d.value, d.label]));

/* Every field, in the order a spreadsheet wants it. */
const COLUMNS: [string, (w: Waiver) => unknown][] = [
  ["Signed at", (w) => w.signedAt],
  ["First name", (w) => w.firstName],
  ["Last name", (w) => w.lastName],
  ["Email", (w) => w.email],
  ["Phone", (w) => w.phone],
  ["Date of birth", (w) => w.dateOfBirth],
  ["Age on event day", (w) => w.age],
  ["Gender", (w) => genderLabel(w)],
  ["Grade", (w) => w.grade],
  ["School", (w) => w.school],
  ["Shirt size", (w) => w.shirtSize],
  ["Team", (w) => (w.teamStatus === "team" ? "Has a team" : teamSummary(w))],
  ["Team name", (w) => w.teamName],
  ["Teammates", (w) => (w.teammates ?? []).join("; ")],
  ["Guardian name", (w) => w.guardianName],
  ["Guardian relationship", (w) => w.guardianRelationship],
  ["Guardian email", (w) => w.guardianEmail],
  ["Guardian phone", (w) => w.guardianPhone],
  ["Going home", (w) => departureSummary(w).split(":")[0]],
  ["Pickup adult", (w) => w.pickupName],
  ["Pickup phone", (w) => w.pickupPhone],
  ["Emergency contact", (w) => w.emergencyName],
  ["Emergency relationship", (w) => w.emergencyRelationship],
  ["Emergency phone", (w) => w.emergencyPhone],
  ["Allergies", (w) => w.allergies],
  ["Medications", (w) => w.medications],
  ["Medical conditions", (w) => w.conditions],
  ["Emergency instructions", (w) => w.emergencyInstructions],
  ["Diet", (w) => w.diet.map((d) => DIET_LABEL[d] ?? d).join("; ")],
  ["Diet notes", (w) => w.dietNotes],
  ["Photo consent", (w) => w.mediaConsent],
  ["Participant signature", (w) => w.participantSignature],
  ["Participant signed by", (w) => (w.participantSignatureImage ? "drawing" : "typing")],
  ["Guardian signature", (w) => w.guardianSignature],
  ["Guardian signed by", (w) => (!w.minor ? "" : !guardianSigned(w) ? `not yet (${w.guardianMethod ?? "here"})` : w.guardianMethod === "paper" ? "paper" : w.guardianSignatureImage ? "drawing" : "typing")],
  ["Guardian confirmed authority", (w) => (w.minor ? (w.guardianAuthority ? "yes" : "") : "")],
  ["Guardian signed at", (w) => w.guardianSignedAt ?? (w.minor && guardianSigned(w) ? w.signedAt : "")],
  ["Waiver version", (w) => w.version],
  ["Revision", (w) => w.revision],
  ["Approved at", (w) => w.approvedAt],
  ["Approval emailed at", (w) => w.approvalEmailedAt],
  ["Checked in at", (w) => w.checkedInAt],
  ["IP", (w) => w.ip],
  ["Browser", (w) => w.userAgent],
  ["ID", (w) => w.id],
];

function csv(rows: Waiver[]) {
  const cell = (v: unknown) => {
    let s = v === undefined || v === null ? "" : String(v);
    /* A cell starting with = + - @ would run as a formula in a spreadsheet. */
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [COLUMNS.map(([h]) => h).join(","), ...rows.map((r) => COLUMNS.map(([, f]) => cell(f(r))).join(","))].join("\n");
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();
  const rows = await listWaivers();
  if (request.nextUrl.searchParams.get("format") === "csv") {
    return new NextResponse(csv(rows), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="beacon-waivers-${new Date().toISOString().slice(0, 10)}.csv"`,
        "cache-control": "no-store",
      },
    });
  }
  return NextResponse.json({ ok: true, waivers: rows }, { headers: { "cache-control": "no-store" } });
}

/**
 * Approve and email it, send the email again, or check in:
 *   { id, action: "approve" | "resend" | "checkin" | "uncheckin" | "remind-guardian" | "paper-received" }
 * Approving saves the approval first, then sends "you're in"; if the email
 * fails, the approval stands and the error is kept for a resend.
 */
export async function PATCH(request: NextRequest) {
  if (!isAdmin(request.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();
  const body = (await request.json().catch(() => ({}))) as { id?: unknown; action?: unknown };
  const id = typeof body.id === "string" ? body.id : "";
  const action = body.action;
  if (!id || !["approve", "resend", "checkin", "uncheckin", "remind-guardian", "paper-received"].includes(String(action))) {
    return NextResponse.json({ ok: false, error: "Send an id and an action." }, { status: 400 });
  }

  /* No one checks in without a complete waiver: under 18, signed by a parent or guardian. */
  if (action === "checkin") {
    const w = await getWaiver(id);
    if (!w) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    if (!guardianSigned(w)) return NextResponse.json({ ok: false, error: "Their parent or guardian has not signed yet." }, { status: 409 });
  }
  if (action === "checkin" || action === "uncheckin") {
    const row = await setCheckedIn(id, action === "checkin");
    return row ? NextResponse.json({ ok: true, waiver: row }) : NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  const current = await getWaiver(id);
  if (!current) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  if (action === "remind-guardian") {
    if (guardianSigned(current)) return NextResponse.json({ ok: false, error: "Their parent or guardian has already signed." }, { status: 409 });
    if (!mailConfigured()) return NextResponse.json({ ok: false, error: "Email is not set up." }, { status: 503 });
    const { token, hash } = newGuardianToken();
    const row = await setGuardianToken(id, hash);
    try {
      await sendMail(guardianSignEmail(row!, guardianLink(token, request)));
      if (row!.guardianMethod !== "email") await updateWaiver(id, { guardianMethod: "email" });
      return NextResponse.json({ ok: true, waiver: await getWaiver(id) });
    } catch (error) {
      return NextResponse.json({ ok: false, error: `The email did not send: ${error instanceof Error ? error.message : error}` }, { status: 502 });
    }
  }
  if (action === "paper-received") {
    if (guardianSigned(current)) return NextResponse.json({ ok: false, error: "Their parent or guardian has already signed." }, { status: 409 });
    const row = await updateWaiver(id, {
      guardianSignature: `${current.guardianName} (signed on paper)`,
      guardianSignatureImage: "",
      guardianMethod: "paper",
      /* The paper copy carries the same consent statement they signed. */
      guardianAuthority: true,
      guardianSignedAt: new Date().toISOString(),
      guardianIp: "",
      guardianUserAgent: "Paper copy, marked received in admin",
    });
    after(async () => {
      if (!row || !mailConfigured()) return;
      await sendMail(teamReviewEmail(row)).catch((e) => console.error("[waiver] review email failed", e));
    });
    return NextResponse.json({ ok: true, waiver: row });
  }
  if (!guardianSigned(current)) {
    return NextResponse.json({ ok: false, error: "Their parent or guardian has not signed yet." }, { status: 409 });
  }
  if (action === "resend" && !current.approvedAt) {
    return NextResponse.json({ ok: false, error: "Approve it first." }, { status: 409 });
  }
  if (action === "approve" && current.approvedAt && current.approvalEmailedAt) {
    return NextResponse.json({ ok: true, waiver: current, emailed: false, note: "Already approved and emailed." });
  }

  const approved = current.approvedAt ? current : (await updateWaiver(id, { approvedAt: new Date().toISOString() }))!;
  try {
    await sendMail(approvedEmail(approved));
    const row = await updateWaiver(id, { approvalEmailedAt: new Date().toISOString(), approvalEmailError: undefined });
    return NextResponse.json({ ok: true, waiver: row, emailed: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[waiver] approval email failed", error);
    const row = await updateWaiver(id, { approvalEmailError: message.slice(0, 300) });
    return NextResponse.json({ ok: true, waiver: row, emailed: false, error: `Approved, but the email did not send: ${message}` });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ ok: false, error: "Which one?" }, { status: 400 });
  const removed = await removeWaiver(id);
  return NextResponse.json({ ok: removed }, { status: removed ? 200 : 404 });
}
