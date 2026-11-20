import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin-auth";
import { listWaivers, removeWaiver, setCheckedIn } from "@/lib/waiver-store";
import { DIETS, type Waiver } from "@/lib/waiver";

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
  ["Grade", (w) => w.grade],
  ["School", (w) => w.school],
  ["Shirt size", (w) => w.shirtSize],
  ["Guardian name", (w) => w.guardianName],
  ["Guardian relationship", (w) => w.guardianRelationship],
  ["Guardian email", (w) => w.guardianEmail],
  ["Guardian phone", (w) => w.guardianPhone],
  ["Emergency contact", (w) => w.emergencyName],
  ["Emergency relationship", (w) => w.emergencyRelationship],
  ["Emergency phone", (w) => w.emergencyPhone],
  ["Allergies", (w) => w.allergies],
  ["Medications", (w) => w.medications],
  ["Medical conditions", (w) => w.conditions],
  ["Diet", (w) => w.diet.map((d) => DIET_LABEL[d] ?? d).join("; ")],
  ["Diet notes", (w) => w.dietNotes],
  ["Photo consent", (w) => w.mediaConsent],
  ["Participant signature", (w) => w.participantSignature],
  ["Participant signed by", (w) => (w.participantSignatureImage ? "drawing" : "typing")],
  ["Guardian signature", (w) => w.guardianSignature],
  ["Guardian signed by", (w) => (w.minor ? (w.guardianSignatureImage ? "drawing" : "typing") : "")],
  ["Waiver version", (w) => w.version],
  ["Revision", (w) => w.revision],
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

/** Check in, or undo it: { id, checkedIn }. */
export async function PATCH(request: NextRequest) {
  if (!isAdmin(request.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();
  const body = (await request.json().catch(() => ({}))) as { id?: unknown; checkedIn?: unknown };
  if (typeof body.id !== "string" || typeof body.checkedIn !== "boolean") {
    return NextResponse.json({ ok: false, error: "Send an id and checkedIn." }, { status: 400 });
  }
  const row = await setCheckedIn(body.id, body.checkedIn);
  return row ? NextResponse.json({ ok: true, waiver: row }) : NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ ok: false, error: "Which one?" }, { status: 400 });
  const removed = await removeWaiver(id);
  return NextResponse.json({ ok: removed }, { status: removed ? 200 : 404 });
}
