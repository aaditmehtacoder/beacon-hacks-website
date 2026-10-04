import type { Metadata } from "next";
import { EVENT } from "@/lib/event";
import { ApplyForm } from "@/components/apply-form";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const DESCRIPTION =
  "Apply early for Beacon Hacks, a free one-day hackathon for Bay Area high school students in grades 9 to 12. Spots are confirmed once the venue and the budget are set.";

export const metadata: Metadata = {
  title: "Apply early",
  description: DESCRIPTION,
  alternates: { canonical: "/apply" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/apply",
    siteName: "Beacon Hacks",
    title: "Apply early · Beacon Hacks",
    description: DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Beacon Hacks. A free hackathon for Bay Area high school builders." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apply early · Beacon Hacks",
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

const FACTS = [
  ["Date", EVENT.date.label, EVENT.date.note],
  ["Location", EVENT.venue.label, EVENT.venue.note],
  ["Who", "Grades 9 to 12", "From anywhere in the Bay Area"],
  ["Cost", "Free", "No fee to apply or attend"],
] as const;

const NEXT = [
  "We save your application and you see a confirmation right away.",
  "When the venue and budget are set, we email everyone who applied to confirm spots.",
  "Confirmed students then get the address and the final schedule.",
];

export default function Apply() {
  return (
    <>
      <SiteHeader home={false} showApply={false} />

      <main id="main" tabIndex={-1} className="dots flex-1 bg-paper-warm focus:outline-none">
        <div className="wrap grid gap-14 py-12 sm:py-16 lg:grid-cols-12 lg:gap-10 lg:py-24">
          <div className="lg:col-span-5">
            <p className="meta text-beacon-deep">Early application</p>
            <h1 className="display-xl mt-4">Apply early.</h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-3">
              Applications open before the date and venue are final, so you
              can get in line now. It takes about two minutes.
            </p>

            <dl className="mt-10 border-y-2 border-ink">
              {FACTS.map(([k, v, note], i) => (
                <div key={k} className={`grid grid-cols-[7rem_1fr] gap-x-4 py-4 ${i > 0 ? "border-t border-line" : ""}`}>
                  <dt className="meta pt-1 text-beacon-deep">{k}</dt>
                  <dd className="flex flex-col gap-0.5">
                    <span className="font-display text-[1.125rem] font-extrabold tracking-[-0.02em]">{v}</span>
                    <span className="text-[0.875rem] text-ink-3">{note}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <h2 className="mt-10 text-[1.75rem] leading-none tracking-[-0.035em]">What happens next</h2>
            <ol className="mt-5 flex flex-col gap-3.5">
              {NEXT.map((step, i) => (
                <li key={step} className="grid grid-cols-[2rem_1fr] gap-2 leading-relaxed text-ink-2">
                  <span className="grid size-6 place-items-center rounded-full border-2 border-ink bg-beacon font-display text-[0.75rem] font-extrabold">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-7 lg:col-start-6 xl:col-span-6 xl:col-start-7">
            <div className="relative border-[3px] border-ink bg-card shadow-[10px_10px_0_var(--color-ink)]">
              <span aria-hidden="true" className="block h-3 border-b-[3px] border-ink bg-beacon" />
              <div className="p-6 sm:p-9">
                <ApplyForm />
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
