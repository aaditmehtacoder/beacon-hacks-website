import { EVENT } from "@/lib/event";
import { PARTNERS, VENUE_SPONSOR } from "@/lib/content";
import { Arrow, LinkButton } from "./ui/button";
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
 * The opening screen: the night over the bay, the name, what it is, the
 * two actions and the countdown, with the sponsors along the water. The
 * lighthouse keeps its light turning behind it all.
 */
export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="night relative isolate overflow-hidden lg:min-h-[calc(100svh-4rem)]"
    >
      <Sky />
      <Shore id="hero" className="inset-x-0 bottom-0 h-[17rem] sm:h-[21rem] lg:h-[46%]" />

      <div className="wrap relative flex flex-col pt-12 pb-[17rem] sm:pt-20 sm:pb-[22rem] lg:min-h-[calc(100svh-4rem)] lg:pt-[clamp(4rem,10vh,7rem)] lg:pb-12">
        <h1
          id="hero-title"
          className="rise max-w-[11ch] text-[clamp(3.75rem,11vw,9.25rem)] leading-[0.86] font-extrabold font-stretch-125% tracking-[-0.045em] text-moon lg:max-w-none"
        >
          Beacon Hacks
        </h1>

        <div className="mt-8 grid gap-12 sm:mt-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="rise rise-2 max-w-[34rem] text-xl leading-relaxed text-moon-2 sm:text-[1.375rem]">
              A free, one-day hackathon for Bay Area high school students.
              Build anything from scratch, with a team or on your own.
            </p>

            <div className="rise rise-3 mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href="/apply" size="lg" className="group">
                Apply early
                <Arrow />
              </LinkButton>
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

          <div className="fade lg:col-span-5 lg:col-start-8 lg:pt-1">
            <Countdown />
          </div>
        </div>

        <div className="fade mt-14 lg:mt-auto lg:pt-14">
          <p className="text-[0.75rem] font-semibold font-stretch-[112.5%] tracking-[0.16em] text-moon-3 uppercase">
            Sponsored by
          </p>
          <ul className="mt-5 flex flex-wrap items-start gap-x-12 gap-y-7">
            {SPONSORED_BY.map((s) => (
              <li key={s.name}>
                <a
                  href={s.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-2.5 rounded-md opacity-90 transition-opacity duration-200 hover:opacity-100"
                >
                  <span className="flex h-8 items-center">
                    <PartnerLogo logo={s.logo} scale={s.scale} area={3600} />
                  </span>
                  <span className="text-[0.8125rem] text-moon-3 transition-colors group-hover:text-moon-2">{s.caption}</span>
                  <span className="sr-only">{s.name} (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
