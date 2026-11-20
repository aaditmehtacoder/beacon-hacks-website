import { promises as dns } from "node:dns";

/**
 * Whether an email's domain can receive mail at all: it has mail servers
 * (MX), or at least an address to fall back to. A made-up or misspelled
 * domain has neither. This cannot tell whether the mailbox exists; only
 * an email can do that. If DNS itself is slow or failing, the answer is
 * yes: a signer is never turned away for our network trouble.
 */
const cache = new Map<string, { ok: boolean; at: number }>();
const DAY = 24 * 60 * 60 * 1000;

const timeout = <T>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(Object.assign(new Error("timeout"), { code: "ETIMEOUT" })), ms))]);

/* The domain does not exist, or has no records of that kind. Anything else
   (a timeout, a server failure) is our trouble, not the signer's. */
const notFound = (e: unknown) => ["ENOTFOUND", "ENODATA"].includes((e as { code?: string })?.code ?? "");

async function hasAddress(domain: string) {
  try {
    await timeout(dns.resolve4(domain), 3000);
    return true;
  } catch (e) {
    return !notFound(e);
  }
}

export async function domainReceivesMail(email: string): Promise<boolean> {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  const hit = cache.get(domain);
  if (hit && Date.now() - hit.at < DAY) return hit.ok;

  let ok: boolean;
  try {
    const mx = await timeout(dns.resolveMx(domain), 3000);
    /* A "null MX" (exchange ".") says the domain takes no mail. */
    ok = mx.length ? mx.some((r) => r.exchange && r.exchange !== ".") : await hasAddress(domain);
  } catch (e) {
    ok = notFound(e) ? await hasAddress(domain) : true;
  }
  cache.set(domain, { ok, at: Date.now() });
  return ok;
}
