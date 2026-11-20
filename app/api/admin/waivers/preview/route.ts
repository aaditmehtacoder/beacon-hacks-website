import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin-auth";
import { getWaiver } from "@/lib/waiver-store";
import { approvedEmail, guardianSignEmail, previewHtml, teamReviewEmail } from "@/lib/waiver-mail";

/**
 * An email as it would be sent, as a page: ?id=<waiver>&kind=approved|team|guardian.
 * For the previews in /admin; it sends nothing.
 */
export async function GET(request: NextRequest) {
  if (!isAdmin(request.cookies.get(ADMIN_COOKIE)?.value)) return new Response("Sign in first.", { status: 401 });
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const kind = request.nextUrl.searchParams.get("kind");
  const waiver = id ? await getWaiver(id) : null;
  if (!waiver) return new Response("Not found.", { status: 404 });
  const mail =
    kind === "team"
      ? teamReviewEmail(waiver)
      : kind === "guardian"
        ? guardianSignEmail(waiver, "#preview-link")
        : approvedEmail(waiver);
  return new Response(previewHtml(mail), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      /* Shown only inside our own admin pages, and never runs a script. */
      "content-security-policy": "default-src 'none'; img-src data:; style-src 'unsafe-inline'; frame-ancestors 'self'",
    },
  });
}
