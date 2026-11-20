import type { Metadata } from "next";
import { EVENT } from "@/lib/event";
import { hashGuardianToken, looksLikeToken } from "@/lib/guardian-token";
import { findByGuardianToken } from "@/lib/waiver-store";
import { SiteHeader } from "@/components/site-header";
import { WaiverRecord } from "@/components/waiver/waiver-record";
import { GuardianSign } from "@/components/waiver/guardian-sign";

export const metadata: Metadata = {
  title: "Sign a waiver",
  robots: { index: false, follow: false },
  /* The link carries a token: never pass it on in a Referer header. */
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

/**
 * Where a parent or guardian lands from the email: what their child
 * entered, the agreement, and a place to sign (or print it instead).
 */
export default async function GuardianPage({ searchParams }: PageProps<"/waiver/guardian">) {
  const raw = (await searchParams).token;
  const token = Array.isArray(raw) ? raw[0] : raw;
  const waiver = looksLikeToken(token) ? await findByGuardianToken(hashGuardianToken(token)) : null;

  return (
    <>
      <div className="print:hidden">
        <SiteHeader home={false} showApply={false} />
      </div>
      <main id="main" tabIndex={-1} className="flex-1 bg-fog focus:outline-none print:bg-transparent">
        <div className="wrap max-w-[calc(46rem+2*var(--gut))] py-12 sm:py-16 print:py-0">
          {waiver ? (
            <>
              <header className="mb-8 print:hidden">
                <p className="kicker text-lamp-deep">
                  {EVENT.name} · {EVENT.date.short}
                </p>
                <h1 className="mt-4 text-[clamp(2.25rem,5.5vw,3.25rem)] leading-[0.95] font-extrabold font-stretch-125% tracking-[-0.04em]">
                  Sign {waiver.firstName}&rsquo;s waiver
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-ink-3">
                  Hi {waiver.guardianName.split(" ")[0]}. {waiver.firstName} {waiver.lastName} filled this in and listed you
                  as their {waiver.guardianRelationship.toLowerCase() || "parent or guardian"}. Check what they entered, read
                  the agreement, then sign at the bottom. If something is wrong, ask {waiver.firstName} to fill it in again,
                  or email{" "}
                  <a href={`mailto:${EVENT.email.team}`} className="link text-ink">
                    {EVENT.email.team}
                  </a>
                  .
                </p>
              </header>
              <div className="rounded-2xl border border-line bg-card p-6 sm:p-8 print:border-0 print:p-0">
                <h2 className="mb-6 text-[1.375rem] font-bold font-stretch-[112.5%]">{EVENT.name} participant waiver</h2>
                <WaiverRecord waiver={waiver} />
              </div>
              <div className="mt-6 print:hidden">
                <GuardianSign token={token!} guardianName={waiver.guardianName} childName={waiver.firstName} relationship={waiver.guardianRelationship} />
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-line bg-card p-8 text-center sm:p-12">
              <h1 className="text-[1.75rem] leading-tight font-extrabold font-stretch-125% tracking-[-0.03em]">This link has been used</h1>
              <p className="mx-auto mt-4 max-w-md text-[1.0625rem] leading-relaxed text-ink-3">
                It may already be signed, or a newer link was sent. Check for a later email, or write to{" "}
                <a href={`mailto:${EVENT.email.team}`} className="link text-ink">
                  {EVENT.email.team}
                </a>{" "}
                and we will sort it out.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
