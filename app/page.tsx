import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Tracks } from "@/components/tracks";
import { Prizes } from "@/components/prizes";
import { Schedule } from "@/components/schedule";
import { Judges } from "@/components/judges";
import { Sponsors } from "@/components/sponsors";
import { Faq } from "@/components/faq";
import { SiteFooter } from "@/components/site-footer";
import { EVENT } from "@/lib/event";
import { FAQS } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* Who publishes the site, and what the site is. Deliberately not an Event:
   schema.org has no "tentative" status, and an Event with a start date
   would put a target date into search results and calendars as if it were
   scheduled. Add one when the date and venue are confirmed (see README). */
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${EVENT.url}/#organization`,
      name: EVENT.name,
      url: EVENT.url,
      logo: `${EVENT.url}/brand/mark-512.png`,
      email: EVENT.email.team,
      description: EVENT.tagline,
      areaServed: "San Francisco Bay Area",
      ...(EVENT.social.discord ? { sameAs: [EVENT.social.discord] } : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${EVENT.url}/#website`,
      url: EVENT.url,
      name: EVENT.name,
      publisher: { "@id": `${EVENT.url}/#organization` },
    },
    /* The FAQ as questions and answers, so search and AI assistants can
       quote it as written. */
    {
      "@type": "FAQPage",
      "@id": `${EVENT.url}/#faq`,
      isPartOf: { "@id": `${EVENT.url}/#website` },
      mainEntity: FAQS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <SiteHeader overlay />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Hero />
        <About />
        <Tracks />
        <Prizes />
        <Schedule />
        <Judges />
        <Sponsors />
        <Faq />
      </main>
      <SiteFooter closing home />
    </>
  );
}
