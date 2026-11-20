/**
 * Catches the email typos people actually make (gmial.com, yahoo.con,
 * hotmial.com) and suggests the fix. Runs in the browser as you type; it
 * never blocks a real address, only asks once to confirm.
 */

/* Real providers, so a near miss of one is suggested and the real thing is not. */
const DOMAINS = [
  "gmail.com", "googlemail.com", "yahoo.com", "ymail.com", "hotmail.com", "outlook.com", "live.com", "msn.com",
  "icloud.com", "me.com", "mac.com", "aol.com", "comcast.net", "sbcglobal.net", "att.net", "verizon.net",
  "protonmail.com", "proton.me", "mail.com", "gmx.com", "zoho.com", "yahoo.co.in", "hotmail.co.uk", "qq.com", "163.com",
];

/* Endings that are almost always a slip. */
const TLD_FIXES: Record<string, string> = {
  con: "com", cmo: "com", ocm: "com", vom: "com", xom: "com", comm: "com", coom: "com", cpm: "com", cim: "com", "c0m": "com",
  ner: "net", nte: "net", ent: "net",
  ogr: "org", orh: "org", rog: "org",
  edi: "edu", eud: "edu", ude: "edu",
};

/* Edits between two strings, a swapped pair of letters counting as one
   (gmial is one slip from gmail, not two). */
function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** A corrected address if this one looks like a typo, else null. */
export function suggestEmail(email: string): string | null {
  const m = /^([^@\s]+)@([^@\s]+\.[^@\s]+)$/.exec(email.trim().toLowerCase());
  if (!m) return null;
  const [, local, original] = m;
  let domain = original;

  const dot = domain.lastIndexOf(".");
  const tld = domain.slice(dot + 1);
  if (TLD_FIXES[tld]) domain = `${domain.slice(0, dot)}.${TLD_FIXES[tld]}`;

  if (!DOMAINS.includes(domain)) {
    let best: string | null = null;
    let bestScore = Infinity;
    for (const known of DOMAINS) {
      const d = distance(domain, known);
      if (d < bestScore) {
        best = known;
        bestScore = d;
      }
    }
    /* Close enough to be a slip, not a different real domain. */
    if (best && bestScore > 0 && bestScore <= (domain.length > 9 ? 2 : 1)) domain = best;
  }

  return domain === original ? null : `${local}@${domain}`;
}
