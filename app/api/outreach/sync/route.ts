import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin-auth";
import { gmailConfigured } from "@/lib/outreach/gmail";
import { syncOutreach } from "@/lib/outreach/sync";

/**
 * Pull the team mailbox into the outreach ledger.
 *
 * POST from the dashboard (admin cookie), or GET from the Vercel cron, which
 * signs its calls with CRON_SECRET. Reading a few dozen threads and asking
 * the model about the answered ones takes a while, hence maxDuration.
 */
export const maxDuration = 60;

function cronAuthorised(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || !given) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function run(force: boolean) {
  if (!gmailConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Gmail is not connected. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN." },
      { status: 503 },
    );
  }
  try {
    const { report } = await syncOutreach({ force });
    return NextResponse.json({ ok: true, report }, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request.cookies.get(ADMIN_COOKIE)?.value) && !cronAuthorised(request)) {
    return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });
  }
  return run(request.nextUrl.searchParams.get("force") === "1");
}

export async function GET(request: NextRequest) {
  if (!cronAuthorised(request)) {
    return NextResponse.json({ ok: false, error: "Cron only." }, { status: 401 });
  }
  return run(false);
}
