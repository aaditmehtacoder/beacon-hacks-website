import type { Metadata } from "next";
import { EVENT } from "@/lib/event";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WaiverForm } from "@/components/waiver/waiver-form";

export const metadata: Metadata = {
  title: "Participant waiver",
  description: `The waiver every ${EVENT.name} participant signs before the day, with a parent or guardian if under 18.`,
  alternates: { canonical: "/waiver" },
  /* Linked from registration emails, not from search. */
  robots: { index: false, follow: false },
};

/**
 * The participant waiver. ?email= fills in the email, so the link in a Luma
 * message can carry it.
 */
export default async function WaiverPage({ searchParams }: PageProps<"/waiver">) {
  const raw = (await searchParams).email;
  const email = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 200) ?? "";

  return (
    <>
      <SiteHeader home={false} showApply={false} />

      <main id="main" tabIndex={-1} data-print="waiver" className="flex-1 bg-fog focus:outline-none print:bg-transparent">
        <div className="wrap max-w-[calc(46rem+2*var(--gut))] py-12 sm:py-16 print:py-0">
          <header className="mb-8 print:hidden">
            <p className="kicker text-lamp-deep">
              {EVENT.name} · {EVENT.date.short}
            </p>
            <h1 className="mt-4 text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-extrabold font-stretch-125% tracking-[-0.04em]">
              Participant waiver
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-3">
              Every participant signs this before the day. It takes about five minutes. Under 18 on January 30? Have a
              parent or guardian nearby: they sign at the end.
            </p>
            <p className="mt-3 text-[0.9375rem] text-ink-3">
              Questions? Email{" "}
              <a href={`mailto:${EVENT.email.team}`} className="link text-ink">
                {EVENT.email.team}
              </a>
              .
            </p>
          </header>

          <WaiverForm initialEmail={email} />
        </div>
      </main>

      <div className="print:hidden">
        <SiteFooter />
      </div>
    </>
  );
}
