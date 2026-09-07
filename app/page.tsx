import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { StatusBoard } from "@/components/status-board";
import { Stats } from "@/components/stats";
import { Day } from "@/components/day";
import { Tracks } from "@/components/tracks";
import { Prizes } from "@/components/prizes";
import { Timetable } from "@/components/timetable";
import { Venue } from "@/components/venue";
import { Sponsors } from "@/components/sponsors";
import { Crew } from "@/components/crew";
import { NotifyBand } from "@/components/notify/notify-band";
import { Faq } from "@/components/faq";
import { Closing } from "@/components/closing";
import { SiteFooter } from "@/components/site-footer";

/**
 * No schema.org Event block until the date and venue are locked. Publishing
 * structured event data would put an unconfirmed event into search results
 * and calendar surfaces; restore it at Gate 1.
 */
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <StatusBoard />
        <Stats />
        <Day />
        <Tracks />
        <Prizes />
        <Timetable />
        <Venue />
        <Sponsors />
        <Crew />
        <NotifyBand />
        <Faq />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
