import { createHash, randomBytes } from "node:crypto";
import { EVENT } from "./event";

/**
 * The one-time link a parent or guardian signs from. The token goes only
 * in the email; the store keeps its SHA-256, so a leaked database cannot
 * be turned back into working links.
 */
export function newGuardianToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashGuardianToken(token) };
}

export function hashGuardianToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** A token is 43 URL-safe characters; anything else is not one of ours. */
export const looksLikeToken = (t: unknown): t is string => typeof t === "string" && /^[A-Za-z0-9_-]{43}$/.test(t);

/**
 * The signing link. In production always on the real site, never on a host
 * taken from the request; in development, wherever the dev server is.
 */
export function guardianLink(token: string, request: Request) {
  const origin = process.env.NODE_ENV === "production" ? EVENT.url : new URL(request.url).origin;
  return `${origin}/waiver/guardian?token=${token}`;
}
