import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin-auth";
import { listEntries, removeEntry } from "@/lib/store";
import type { Entry } from "@/lib/notify-schema";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });
}

const COLUMNS: (keyof Entry)[] = [
  "receivedAt",
  "kind",
  "name",
  "email",
  "school",
  "grade",
  "firstHackathon",
  "role",
  "idea",
];

function csv(rows: Entry[]) {
  const cell = (v: unknown) => {
    const s = v === undefined || v === null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(","))].join("\n");
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();
  const entries = await listEntries();
  if (request.nextUrl.searchParams.get("format") === "csv") {
    return new NextResponse(csv(entries), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="beacon-signups-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }
  return NextResponse.json({ ok: true, entries });
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ ok: false, error: "Which one?" }, { status: 400 });
  const removed = await removeEntry(id);
  return NextResponse.json({ ok: removed }, { status: removed ? 200 : 404 });
}
