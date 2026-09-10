/**
 * One-time: authorise read-only Gmail access for the outreach dashboard and
 * store the refresh token in .env.local.
 *
 *   node scripts/gmail-auth.mjs
 *   node scripts/gmail-auth.mjs "<callback URL or code>"   # if the listener missed it
 *
 * The second form is for when the browser could not reach localhost (this
 * machine's localhost answers HTTP 431 to browsers carrying oversized
 * cookies, see the README): paste the URL the browser was sent to and the
 * code in it is exchanged directly. Codes are single-use and expire in
 * minutes.
 *
 * Needs GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI in
 * .env.local (a Google Cloud OAuth client whose redirect URI matches). Listens
 * on the redirect port, prints the consent URL, catches the callback, swaps
 * the code for a refresh token and checks WHICH mailbox authorised: a token
 * for any account other than OUTREACH_MAILBOX is revoked, never stored.
 *
 * Scope is gmail.readonly. This can never send, delete or modify mail.
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const ENV = ".env.local";

if (existsSync(ENV)) {
  for (const line of readFileSync(ENV, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
  }
}

const need = (name) => {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is missing from ${ENV}`);
  return v;
};

const SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const mailbox = (process.env.OUTREACH_MAILBOX ?? "team.beaconhacks@gmail.com").toLowerCase();
const redirect = process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/api/auth/gmail/callback";
const { port, pathname } = new URL(redirect);

const consent =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: need("GOOGLE_CLIENT_ID"),
    redirect_uri: redirect,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "select_account consent",
    login_hint: mailbox,
  });

function store(token) {
  const body = existsSync(ENV) ? readFileSync(ENV, "utf8") : "";
  const next = body.includes("GOOGLE_REFRESH_TOKEN=")
    ? body.replace(/GOOGLE_REFRESH_TOKEN=.*/, `GOOGLE_REFRESH_TOKEN=${token}`)
    : `${body.trimEnd()}\nGOOGLE_REFRESH_TOKEN=${token}\n`;
  writeFileSync(ENV, next, { mode: 0o600 });
}

const page = (text) =>
  `<body style="font:16px system-ui;padding:40px;line-height:1.6">${text}</body>`;

/** Swap the code for tokens, check the mailbox, store the refresh token. Throws with a plain message. */
async function exchange(code) {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: need("GOOGLE_CLIENT_ID"),
      client_secret: need("GOOGLE_CLIENT_SECRET"),
      redirect_uri: redirect,
      grant_type: "authorization_code",
    }),
  });
  const j = await r.json();
  if (!r.ok || !j.refresh_token) {
    throw new Error(`token exchange failed: ${j.error_description ?? j.error ?? "no refresh_token returned"}`);
  }
  const prof = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: { authorization: `Bearer ${j.access_token}` },
  }).then((x) => x.json());
  const got = (prof.emailAddress ?? "").toLowerCase();
  if (got !== mailbox) {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${j.refresh_token}`, { method: "POST" });
    throw new Error(
      `wrong account: you authorised ${got || "an unknown account"}, but the outreach dashboard ` +
        `reads ${mailbox}. Nothing was saved and that grant has been revoked.`,
    );
  }
  store(j.refresh_token);
  return got;
}

const pasted = process.argv[2];
if (pasted) {
  const code = pasted.includes("code=") ? new URL(pasted).searchParams.get("code") : pasted;
  try {
    const got = await exchange(code);
    console.log(`\n  connected as ${got}; GOOGLE_REFRESH_TOKEN stored in ${ENV}.`);
  } catch (e) {
    console.error(`\n  ${e.message}`);
    process.exitCode = 1;
  }
  process.exit();
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);
    if (url.pathname !== pathname) {
      res.writeHead(404).end("not the callback path");
      return;
    }
    const code = url.searchParams.get("code");
    const err = url.searchParams.get("error");
    if (err || !code) {
      res.writeHead(400).end(`Authorisation failed: ${err ?? "no code returned"}`);
      console.error(`\n  failed: ${err ?? "no code returned"}`);
      server.close();
      process.exitCode = 1;
      return;
    }

    const got = await exchange(code);
    res.writeHead(200, { "content-type": "text/html" }).end(
      page(`Connected as ${got}. You can close this tab.`),
    );
    console.log(`\n  connected as ${got}; GOOGLE_REFRESH_TOKEN stored in ${ENV}.`);
    server.close();
  } catch (e) {
    res.writeHead(400, { "content-type": "text/html" }).end(page(`Auth failed: ${e.message}`));
    console.error(`\n  auth failed: ${e.message}`);
    server.close();
    process.exitCode = 1;
  }
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error(
      `\n  Port ${port} is in use, and Google will only redirect to ${redirect}.\n` +
        `  Stop whatever is on it (lsof -nP -iTCP:${port} -sTCP:LISTEN) and run this again.\n`,
    );
    process.exitCode = 1;
  } else throw e;
});

server.listen(port, () => {
  console.log(`\n  Open this as ${mailbox} to authorise read-only Gmail access:\n\n  ${consent}\n`);
});
