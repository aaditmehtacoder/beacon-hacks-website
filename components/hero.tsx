import { EVENT } from "@/lib/event";
import { PARTNERS, VENUE_SPONSOR } from "@/lib/content";
import { Arrow, LinkButton } from "./ui/button";
import { ApplyButton } from "./apply/apply-button";
import { CapIcon, PinIcon, SparkIcon, TicketIcon } from "./ui/icons";
import { PartnerLogo } from "./ui/partner-logo";
import { Countdown } from "./countdown";
import { Shore, Sky } from "./night-scene";

const CHIPS = [
  { Icon: PinIcon, text: EVENT.venue.place ? `${EVENT.venue.place}, ${EVENT.venue.city}` : "Belmont, CA" },
  { Icon: CapIcon, text: "Grades 9–12" },
  { Icon: SparkIcon, text: "No experience needed" },
  { Icon: TicketIcon, text: "Free to attend" },
];

/* The venue sponsor first, then the partners. A sponsor still being
   finalized says so under its logo. */
const SPONSORED_BY = [
  ...(VENUE_SPONSOR
    ? [
        {
          name: VENUE_SPONSOR.name,
          website: VENUE_SPONSOR.website,
          logo: VENUE_SPONSOR.logoOnNight,
          scale: 1,
          caption: VENUE_SPONSOR.status === "pending" ? "Venue · being finalized" : "Venue",
        },
      ]
    : []),
  ...PARTNERS.map((p) => ({
    name: p.name,
    website: p.website,
    logo: p.logoOnNight,
    scale: p.logoScale ?? 1,
    caption: p.short,
  })),
];

/**
 * The opening screen: the night over the bay, the name, what it is and
 * the two actions, with the lighthouse turning its light behind them. A
 * strip along the bottom holds the sponsors and the countdown.
 */
export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="night relative isolate flex flex-col overflow-hidden lg:min-h-[calc(100svh-4rem)]"
    >
      <Sky />

      <div className="relative flex-1">
        <Shore id="hero" className="inset-x-0 bottom-0 h-[16rem] sm:h-[20rem] lg:h-[54%]" />

        <div className="wrap relative pt-12 pb-[16rem] sm:pt-20 sm:pb-[21rem] lg:pt-[clamp(4rem,11vh,7.5rem)] lg:pb-20">
          <h1
            id="hero-title"
            className="rise max-w-[11ch] text-[clamp(3.75rem,11vw,9.25rem)] leading-[0.86] font-extrabold font-stretch-125% tracking-[-0.045em] text-moon lg:max-w-none"
          >
            Beacon Hacks
          </h1>

          <p className="rise rise-2 mt-8 max-w-[34rem] text-xl leading-relaxed text-moon-2 sm:mt-10 sm:text-[1.375rem]">
            A free, one-day hackathon for Bay Area high school students. Build
            anything from scratch, with a team or on your own.
          </p>

          <div className="rise rise-3 mt-8 flex flex-wrap items-center gap-3">
            <ApplyButton size="lg" className="group">
              Apply
              <Arrow />
            </ApplyButton>
            <LinkButton href="#sponsors" variant="outline-night" size="lg">
              Sponsor us
            </LinkButton>
          </div>

          <ul className="fade mt-8 flex flex-wrap gap-x-5 gap-y-3 text-[0.9375rem] text-moon-2">
            {CHIPS.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon className="size-[1.125rem] text-lamp" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-moon/10 bg-night">
        <div className="wrap flex flex-col gap-9 py-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="fade">
            <p className="text-[0.75rem] font-semibold font-stretch-[112.5%] tracking-[0.16em] text-moon-3 uppercase">
              Sponsored by
            </p>
            <ul className="mt-4 flex flex-wrap items-start gap-x-11 gap-y-6">
              {SPONSORED_BY.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-2 rounded-md opacity-90 transition-opacity duration-200 hover:opacity-100"
                  >
                    <span className="flex h-8 items-center">
                      <PartnerLogo logo={s.logo} scale={s.scale} area={3600} eager />
                    </span>
                    <span className="text-[0.8125rem] text-moon-3 transition-colors group-hover:text-moon-2">{s.caption}</span>
                    <span className="sr-only">{s.name} (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="fade">
            <Countdown />
          </div>
        </div>
      </div>
    </section>
  );
}
