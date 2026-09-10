/**
 * Read-only Gmail, the way the outreach dashboard sees it.
 *
 * A Google Cloud OAuth client (gmail.readonly, nothing more) authorised once
 * against the team mailbox; scripts/gmail-auth.mjs does that and stores the
 * refresh token. Here the refresh token becomes short-lived access tokens,
 * and threads come back flattened to what the classifier needs.
 */

const API = "https://gmail.googleapis.com/gmail/v1/users/me";

export type Message = {
  id: string;
  from: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  date: string;
  labels: string[];
  snippet: string;
  body: string;
};

export type Thread = {
  id: string;
  lastMessageId: string;
  messages: Message[];
};

type GmailPayload = {
  mimeType?: string;
  headers?: { name: string; value: string }[];
  body?: { data?: string };
  parts?: GmailPayload[];
};

type GmailMessage = {
  id: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: GmailPayload;
};

export function gmailConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  );
}

export function mailbox(): string {
  return (process.env.OUTREACH_MAILBOX ?? "team.beaconhacks@gmail.com").toLowerCase();
}

/** Which threads count as outreach. Threads we started are filtered in sync. */
export function outreachQuery(): string {
  return process.env.OUTREACH_QUERY?.trim() || "in:sent";
}

let cached: { token: string; expires: number } | null = null;

async function accessToken(): Promise<string> {
  if (cached && cached.expires > Date.now() + 30_000) return cached.token;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN ?? "",
      grant_type: "refresh_token",
    }),
  });
  const j = (await r.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };
  if (!r.ok || !j.access_token) {
    throw new Error(`Gmail token refresh failed: ${j.error_description ?? j.error ?? r.status}`);
  }
  cached = { token: j.access_token, expires: Date.now() + (j.expires_in ?? 3600) * 1000 };
  return cached.token;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Gmail meters a per-minute quota; a burst of thread fetches can trip a 403.
 *  Back off and retry rather than failing the whole sync. */
async function api<T>(path: string, attempt = 0): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    headers: { authorization: `Bearer ${await accessToken()}` },
    cache: "no-store",
  });
  if (r.ok) return (await r.json()) as T;
  const text = await r.text();
  const throttled =
    r.status === 429 ||
    r.status >= 500 ||
    (r.status === 403 && /rateLimitExceeded|Quota exceeded/i.test(text));
  if (throttled && attempt < 5) {
    await sleep(Math.min(20_000, 1500 * 2 ** attempt));
    return api<T>(path, attempt + 1);
  }
  throw new Error(`Gmail ${path} -> ${r.status} ${text.slice(0, 160)}`);
}

export async function profile(): Promise<{ emailAddress: string; threadsTotal: number }> {
  return api("/profile");
}

/** Every thread matching the query, all pages. */
export async function listThreads(query = outreachQuery()): Promise<string[]> {
  const ids: string[] = [];
  let pageToken = "";
  do {
    const q = new URLSearchParams({ q: query, maxResults: "100" });
    if (pageToken) q.set("pageToken", pageToken);
    const page = await api<{ threads?: { id: string }[]; nextPageToken?: string }>(`/threads?${q}`);
    ids.push(...(page.threads ?? []).map((t) => t.id));
    const next = page.nextPageToken ?? "";
    if (!next || next === pageToken) break;
    pageToken = next;
  } while (pageToken);
  return ids;
}

const header = (m: GmailMessage, name: string) =>
  m.payload?.headers?.find((h) => h.name.toLowerCase() === name)?.value ?? "";

/** The plain-text body, preferring text/plain parts and falling back to
 *  whatever text the first part carries. HTML is stripped to text. */
function decodeBody(part: GmailPayload | undefined): string {
  if (!part) return "";
  const own = part.body?.data
    ? Buffer.from(part.body.data, "base64url").toString("utf8")
    : "";
  if (own && part.mimeType !== "text/html") return own;
  for (const child of part.parts ?? []) {
    if (child.mimeType === "text/plain") {
      const t = decodeBody(child);
      if (t) return t;
    }
  }
  for (const child of part.parts ?? []) {
    const t = decodeBody(child);
    if (t) return t;
  }
  return own ? stripHtml(own) : "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>|<\/p>|<\/div>|<\/tr>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function getThread(id: string): Promise<Thread> {
  const t = await api<{ id: string; messages?: GmailMessage[] }>(`/threads/${id}?format=full`);
  const messages: Message[] = (t.messages ?? []).map((m) => ({
    id: m.id,
    from: header(m, "from"),
    to: header(m, "to"),
    cc: header(m, "cc"),
    bcc: header(m, "bcc"),
    subject: header(m, "subject"),
    date: m.internalDate
      ? new Date(Number(m.internalDate)).toISOString()
      : new Date(header(m, "date")).toISOString(),
    labels: m.labelIds ?? [],
    snippet: (m.snippet ?? "").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&"),
    body: decodeBody(m.payload).replace(/\r/g, "").trim(),
  }));
  return { id: t.id, lastMessageId: messages.at(-1)?.id ?? "", messages };
}

/** Run `fn` over `items` with at most `limit` in flight. Order is kept. */
export async function pooled<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}
