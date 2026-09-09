/**
 * Crude per-instance rate limit: enough to stop a bored visitor hammering a
 * form. Not a defence against anything determined, and not shared between
 * serverless instances.
 */
const seen = new Map<string, number[]>();

export function rateLimited(key: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const hits = (seen.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  seen.set(key, hits);
  return hits.length > max;
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local"
  );
}
