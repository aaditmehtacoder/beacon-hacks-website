import type { Metadata } from "next";
import { EVENT } from "@/lib/event";
import { ApplyForm } from "@/components/apply-form";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CalendarIcon, CapIcon, PinIcon, TicketIcon } from "@/components/ui/icons";

const HOSTED = EVENT.venue.name ? `, hosted by ${EVENT.venue.name}` : "";
const DESCRIPTION = `Apply to Beacon Hacks, a free one-day hackathon for Bay Area high school students in grades 9 to 12${HOSTED} in Belmont. Spots are confirmed once ${EVENT.applications.until}.`;

export const metadata: Metadata = {
  title: "Apply",
  description: DESCRIPTION,
  alternates: { canonical: "/apply" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/apply",
    siteName: "Beacon Hacks",
    title: "Apply · Beacon Hacks",
    description: DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Beacon Hacks. A free hackathon for Bay Area high school builders." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apply · Beacon Hacks",
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

const FACTS = [
  { Icon: CalendarIcon, k: "Date", v: EVENT.date.label, note: EVENT.date.confirmed ? "Doors open at 8:30 AM" : "Target date" },
  {
    Icon: PinIcon,
    k: "Where",
    v: EVENT.venue.place ? `${EVENT.venue.place}, ${EVENT.venue.city}` : EVENT.venue.label,
    note: EVENT.venue.address ?? EVENT.venue.note,
  },
  { Icon: CapIcon, k: "Who", v: "Grades 9 to 12", note: "From anywhere in the Bay Area" },
  { Icon: TicketIcon, k: "Cost", v: "Free", note: "No fee to apply or attend" },
];

const NEXT = [
  "We save your application and you see a confirmation right away.",
  `When ${EVENT.applications.until}, we email everyone who applied to confirm spots.`,
  EVENT.venue.address
    ? "Confirmed students then get the final schedule and what to bring."
    : "Confirmed students then get the address and the final schedule.",
];

export default function Apply() {
  return (
    <>
      <SiteHeader home={false} showApply={false} />

      <main id="main" tabIndex={-1} className="flex-1 bg-fog focus:outline-none">
        <div className="wrap grid gap-14 py-14 sm:py-20 lg:grid-cols-12 lg:gap-16 lg:py-24">
          <div className="lg:col-span-5">
            <h1 className="heading">Apply</h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-3">
              Applications open before the {EVENT.venue.confirmed ? "date is" : "date and venue are"}{" "}
              final, so you can get in line now. It takes about two minutes.
            </p>

            <dl className="mt-10 border-t border-line">
              {FACTS.map(({ Icon, k, v, note }) => (
                <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-x-4 border-b border-line py-4">
                  <dt className="flex items-start gap-2.5 pt-0.5 text-[0.9375rem] text-ink-3">
                    <Icon className="mt-0.5 size-[1.125rem] text-lamp-deep" />
                    {k}
                  </dt>
                  <dd className="flex flex-col gap-0.5">
                    <span className="font-semibold">{v}</span>
                    <span className="text-[0.875rem] text-ink-3">{note}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <h2 className="mt-12 text-[1.5rem] leading-none font-bold tracking-[-0.03em]">What happens next</h2>
            <ol className="mt-6 flex flex-col gap-4">
              {NEXT.map((step, i) => (
                <li key={step} className="grid grid-cols-[2.25rem_1fr] items-start leading-relaxed text-ink-2">
                  <span className="grid size-7 place-items-center rounded-full bg-lamp text-[0.8125rem] font-bold text-ink tabular-nums">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-7 xl:col-span-6 xl:col-start-7">
            <div className="rounded-[1.75rem] border border-line bg-card p-6 shadow-[0_40px_80px_-50px_rgb(15_24_40/0.45)] sm:p-10">
              <ApplyForm />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
