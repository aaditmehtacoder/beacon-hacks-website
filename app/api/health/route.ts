import { NextResponse } from "next/server";
import { describeBackend } from "@/lib/store";

/**
 * Which storage backend this deployment is using, and nothing else. Lets
 * anyone confirm the database is connected without signing in to /admin.
 */
export function GET() {
  const backend = describeBackend();
  return NextResponse.json(
    { ok: backend.kind !== "ephemeral", storage: backend.kind },
    { headers: { "cache-control": "no-store" } },
  );
}
