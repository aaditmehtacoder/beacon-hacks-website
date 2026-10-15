import { EVENT } from "@/lib/event";
import { AnchorButton, Arrow, LinkButton, OutArrow } from "./ui/button";
import { ApplyButton } from "./apply/apply-button";
import { Countdown } from "./countdown";
import { Shore, Sky } from "./night-scene";

const FACTS = [
  EVENT.venue.place ? `${EVENT.venue.place}, ${EVENT.venue.city}` : "Belmont, CA",
  "Grades 9–12",
  "Teams of up to four",
  "Free",
];

/**
 * The opening screen: the night over the bay, the name, what it is and
 * the actions, with the lighthouse turning its light behind them. A
 * strip along the bottom holds the facts and the countdown. The sky runs
 * up under the glass header, so the copy starts below --header-h.
 */
export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="night relative isolate flex flex-col overflow-hidden lg:min-h-svh"
    >
      <Sky />

      <div className="relative flex-1">
        <Shore id="hero" className="inset-x-0 bottom-0 h-[16rem] sm:h-[20rem] lg:h-[54%]" />

        <div className="wrap relative pt-[calc(var(--header-h)+3rem)] pb-[16rem] sm:pt-[calc(var(--header-h)+5rem)] sm:pb-[21rem] lg:pt-[calc(var(--header-h)+clamp(4rem,11vh,7.5rem))] lg:pb-20">
          <h1
            id="hero-title"
            className="rise max-w-[11ch] text-[clamp(3.75rem,11vw,9.25rem)] leading-[0.86] font-extrabold font-stretch-125% tracking-[-0.045em] text-moon lg:max-w-none"
          >
            Beacon Hacks
          </h1>

          <p className="rise rise-2 mt-8 max-w-[34rem] text-xl leading-relaxed text-moon-2 sm:mt-10 sm:text-[1.375rem]">
            A free, one-day hackathon for Bay Area high school students. No
            experience needed.
          </p>

          <div className="rise rise-3 mt-8 flex flex-wrap items-center gap-3">
            <ApplyButton size="lg" className="group">
              Apply
              <Arrow />
            </ApplyButton>
            <LinkButton href="#sponsors" variant="outline-night" size="lg">
              Sponsor us
            </LinkButton>
            <AnchorButton
              href={EVENT.hcb.donate}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline-night"
              size="lg"
              className="group"
            >
              Donate
              <OutArrow />
              <span className="sr-only">(opens in a new tab)</span>
            </AnchorButton>
          </div>
        </div>
      </div>

      <div className="relative border-t border-moon/10 bg-night">
        <div className="wrap flex flex-col gap-8 py-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <ul className="fade flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.9375rem] text-moon-2 lg:pb-1">
            {FACTS.map((fact) => (
              <li key={fact} className="flex items-center gap-2.5">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-lamp" />
                {fact}
              </li>
            ))}
          </ul>

          <div className="fade">
            <Countdown />
          </div>
        </div>
      </div>
    </section>
  );
}
