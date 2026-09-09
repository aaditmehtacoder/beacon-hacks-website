import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { StatusBoard } from "@/components/status-board";
import { Day } from "@/components/day";
import { Tracks } from "@/components/tracks";
import { Prizes } from "@/components/prizes";
import { Timetable } from "@/components/timetable";
import { Venue } from "@/components/venue";
import { Sponsors } from "@/components/sponsors";
import { Faq } from "@/components/faq";
import { Closing } from "@/components/closing";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";
import { EVENT } from "@/lib/event";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* Who publishes the site, and what the site is. Deliberately not an Event:
   that waits for a locked date and venue (see the README). */
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${EVENT.url}/#organization`,
      name: EVENT.name,
      url: EVENT.url,
      logo: `${EVENT.url}/brand/beacon-mark.png`,
      email: EVENT.email.team,
      areaServed: "San Francisco Bay Area",
    },
    {
      "@type": "WebSite",
      "@id": `${EVENT.url}/#website`,
      url: EVENT.url,
      name: EVENT.name,
      publisher: { "@id": `${EVENT.url}/#organization` },
    },
  ],
};

/**
 * No schema.org Event block until the date and venue are locked. Publishing
 * structured event data would put an unconfirmed event into search results
 * and calendar surfaces; restore it at Gate 1.
 */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <StatusBoard />
        <Day />
        <Tracks />
        <Prizes />
        <Timetable />
        <Venue />
        <Sponsors />
        <Faq />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
