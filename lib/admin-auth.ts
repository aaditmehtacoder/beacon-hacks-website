import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Admin access is one shared password. The cookie holds an HMAC of a fixed
 * string keyed by that password, so changing the password logs everyone out
 * and the password itself is never stored in a cookie.
 *
 * In production ADMIN_PASSWORD must be set; the development default exists
 * so the dashboard works out of the box without putting a password in git.
 */

export const ADMIN_COOKIE = "beacon_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function adminPassword(): string | null {
  const configured = process.env.ADMIN_PASSWORD?.trim();
  if (configured) return configured;
  return process.env.NODE_ENV === "production" ? null : "cwb";
}

function tokenFor(password: string) {
  return createHmac("sha256", password).update("beacon-admin-v1").digest("hex");
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(candidate: string): boolean {
  const password = adminPassword();
  return !!password && same(password, candidate);
}

export function sessionToken(): string | null {
  const password = adminPassword();
  return password ? tokenFor(password) : null;
}

export function isAdmin(token: string | undefined | null): boolean {
  const expected = sessionToken();
  return !!expected && !!token && same(expected, token);
}
