import type { Metadata } from "next";
import Link from "next/link";
import { EVENT } from "@/lib/event";
import { ApplyForm } from "@/components/apply-form";
import { BeaconMark } from "@/components/ui/beacon-mark";
import { SiteFooter } from "@/components/site-footer";

const DESCRIPTION =
  "Apply early for Beacon Hacks, a free one day hackathon for Bay Area high schoolers. Grades 9 to 12. Spots are confirmed once the venue and the budget are locked.";

export const metadata: Metadata = {
  title: "Apply",
  description: DESCRIPTION,
  alternates: { canonical: "/apply" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/apply",
    siteName: "Beacon Hacks",
    title: "Apply early · Beacon Hacks",
    description: DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Beacon Hacks. Build what lights the way." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apply early · Beacon Hacks",
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

export default function Apply() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-paper/85 shadow-head backdrop-blur-xl">
        <div className="wrap flex h-16 items-center gap-5">
          <Link href="/" className="flex items-center gap-2.5">
            <BeaconMark className="size-6 text-beacon drop-shadow-[0_0_6px_rgba(255,178,40,0.55)]" />
            <span className="font-display text-[0.9375rem] font-bold tracking-tight">
              BEACON HACKS
            </span>
          </Link>
          <span className="label hidden border-l border-line pl-5 text-ink-3 sm:inline">
            Early application
          </span>
          <Link href="/" className="ml-auto text-[0.9375rem] text-ink-3 hover:text-ink">
            Back to the site
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="wrap grid gap-12 py-14 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">Apply</p>
            <h1 className="mt-4 text-4xl leading-[1.05] sm:text-5xl">Apply early.</h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-2">
              Applications are open before the day is fully locked, so you can
              be first in line. Nobody is confirmed until the venue and the
              budget are both real; when they are, everyone who applied hears
              the same day.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-line bg-card p-5">
              {[
                ["Target date", EVENT.targetDateLabel, "Not locked yet"],
                ["Place", EVENT.venue.label, "Venue in approval"],
                ["Who", "Grades 9 to 12", "Anywhere in the Bay Area"],
                ["Cost", "Free", "If sponsorship lands"],
              ].map(([k, v, note]) => (
                <div key={k} className="flex flex-col gap-1">
                  <dt className="label text-ink-4">{k}</dt>
                  <dd className="text-[0.9375rem] font-medium">{v}</dd>
                  <dd className="text-xs text-ink-3">{note}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border border-line bg-card p-6 sm:p-8">
            <ApplyForm />
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
