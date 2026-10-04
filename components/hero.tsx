import { EVENT } from "@/lib/event";
import { PARTNERS } from "@/lib/content";
import { Lamp } from "./ui/lamp";
import { Arrow, LinkButton } from "./ui/button";
import { BeaconMark } from "./ui/beacon-mark";
import { PartnerLogo } from "./ui/partner-logo";
import { NotifyLink } from "./notify/notify-button";

/**
 * The opening screen, on the dark band: the name, what it is, the two
 * actions and the partners backing the day, with the date card beside it.
 * The full stop of the name is the lamp; its beam runs out to the right.
 */
export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="on-dark relative overflow-hidden bg-band text-band-ink dots-dark"
    >
      {/* a quiet ring of light in the corner, for depth */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-56 -right-56 size-[36rem] rounded-full border-[3.5rem] border-beacon/[0.07]"
      />

      <div className="wrap relative grid items-center gap-14 pt-10 pb-14 sm:pt-14 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,25rem)] lg:gap-14 lg:pt-14 lg:pb-16">
        <div className="min-w-0">
          <h1
            id="hero-title"
            className="text-[clamp(4.25rem,11.5vw,9.75rem)] leading-[0.88] font-extrabold tracking-[-0.055em]"
          >
            <span className="text-beacon">Beacon</span>
            <br />
            Hacks
            <Lamp onDark />
          </h1>

          <div className="rise-in">
            <p className="mt-7 max-w-xl text-xl leading-relaxed text-band-ink sm:text-[1.375rem]">
              {EVENT.tagline} One Saturday in Belmont to build something from
              scratch. No experience needed.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <LinkButton href="/apply" variant="lamp" size="lg" className="group">
                Apply early
                <Arrow />
              </LinkButton>
              <LinkButton href="#sponsors" variant="ghost-dark" size="lg">
                Sponsor Beacon
              </LinkButton>
            </div>

            <p className="mt-6 text-band-muted">
              Parent, mentor or judge? <NotifyLink>Get updates by email</NotifyLink>
            </p>

            <div className="mt-9">
              <p className="meta text-band-muted">Backed by</p>
              <ul className="mt-4 flex flex-wrap items-center gap-x-9 gap-y-5">
                {PARTNERS.map((p) => (
                  <li key={p.id}>
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-sm opacity-90 transition-[opacity,transform] duration-200 hover:-translate-y-0.5 hover:opacity-100"
                    >
                      <PartnerLogo logo={p.logoOnDark} scale={(p.logoScale ?? 1) * 0.92} area={4200} />
                      <span className="sr-only">{p.name} (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <DateCard />
      </div>
    </section>
  );
}

/**
 * The date, as a card rather than a countdown: it is a target until the
 * venue signs off, and a ticking clock would read as a promise.
 */
function DateCard() {
  return (
    <div className="relative mx-auto w-full max-w-[25rem] px-2 pt-6 pb-3 lg:mx-0 lg:justify-self-end">
      <div className="relative -rotate-[1.5deg] border-[3px] border-ink bg-card px-8 pt-12 pb-9 text-ink shadow-[12px_12px_0_var(--color-beacon)] sm:px-10">
        <span aria-hidden="true" className="pointer-events-none absolute inset-2.5 border border-dashed border-line" />

        <span className="absolute -top-5 left-1/2 -translate-x-1/2 rotate-[3deg] border-2 border-ink bg-beacon px-4 py-1.5 font-display text-[0.75rem] font-extrabold tracking-[0.14em] whitespace-nowrap text-ink uppercase">
          Target date
        </span>

        <span
          aria-hidden="true"
          className="absolute -top-4 -right-4 grid size-12 rotate-[8deg] place-items-center border-2 border-ink bg-beacon"
        >
          <BeaconMark className="size-7 text-ink" />
        </span>

        <p className="relative">
          <span className="sr-only">{EVENT.date.label}</span>
          <span aria-hidden="true" className="block font-display text-[clamp(4.75rem,9vw,6.5rem)] leading-[0.82] font-extrabold tracking-[-0.06em]">
            Jan 30
          </span>
          <span aria-hidden="true" className="mt-2 block font-display text-[2.5rem] leading-none font-extrabold tracking-[-0.04em] text-ink-3">
            2027
          </span>
        </p>
        <p className="meta relative mt-7 text-ink">Saturday · {EVENT.venue.city}, {EVENT.venue.region}</p>
        <p className="relative mt-2 text-[0.9375rem] leading-snug text-ink-3">
          Confirmed with the venue. Everyone who applied hears first.
        </p>
      </div>
    </div>
  );
}
