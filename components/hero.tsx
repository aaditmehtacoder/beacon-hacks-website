import { Reveal } from "./ui/reveal";
import { TextReveal } from "./ui/text-reveal";
import { Magnetic } from "./ui/magnetic";
import { LinkButton } from "./ui/button";
import { NotifyButton } from "./notify/notify-button";
import { LockIcon } from "./ui/locked";
import { Beacon } from "./beacon/beacon";
import { EVENT } from "@/lib/event";

const FACTS = [
  ["Target date", EVENT.targetDateLabel, "Not locked yet"],
  ["Place", EVENT.venue.label, "Venue in approval"],
  ["Build time", "14 hours", "One day, no overnight"],
  ["Team size", "1 to 4", "Come alone, that is fine"],
  ["Cost", "Free", "If sponsorship lands"],
] as const;

/**
 * The stage. A full-viewport night that pins while the visitor scrolls one
 * screen's worth: the lens turns with the scroll, the camera rises and
 * pushes in, the facts rise into place, then the page lets go into the
 * marquee. The section is twice the viewport tall; the inside is sticky.
 * Under reduced motion it is one screen, unpinned, with the facts shown.
 *
 * The section pulls up under the sticky header (its 4rem plus the 1px
 * border) so the night is behind the header at the top of the page; the
 * header is light on dark there and needs something dark to sit on.
 */
export function Hero() {
  return (
    <section id="top" className="relative -mt-[calc(4rem+1px)] motion-safe:h-[200svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-band text-band-ink">
        <Beacon frame={false} className="absolute inset-0" />

        {/* keeps the copy readable when a beam sweeps behind it */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(5,5,8,0.88),rgba(5,5,8,0.4)_42%,transparent_68%)] lg:bg-[linear-gradient(to_right,rgba(5,5,8,0.82),rgba(5,5,8,0.42)_36%,transparent_60%)]"
        />

        <div className="wrap relative z-10 flex h-full flex-col justify-center pt-16 pb-28 sm:pb-24">
          <div className="max-w-2xl">
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-band-ink/15 bg-band-ink/10 py-1.5 pr-4 pl-3 text-band-ink/85 backdrop-blur">
                <LockIcon className="size-3 text-band-ink/60" />
                <span className="label">Applications not open yet</span>
              </p>
            </Reveal>

            <h1 className="mt-7 text-[clamp(3.5rem,12vw,8.5rem)] leading-[0.86] font-bold tracking-[-0.045em]">
              <TextReveal delay={120}>Beacon</TextReveal>
              <TextReveal delay={240} className="text-beacon">
                Hacks
              </TextReveal>
            </h1>

            <Reveal delay={420}>
              <p className="mt-7 flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="h-px w-12 shrink-0 bg-beacon"
                />
                <span className="font-display text-xl font-medium tracking-tight sm:text-2xl">
                  {EVENT.tagline}
                </span>
              </p>
            </Reveal>

            <Reveal delay={520}>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-band-ink/75">
                A free one day hackathon being built for Bay Area high
                schoolers, targeting January 2027 in Belmont. It is not funded
                yet and the room is not signed yet. This page says exactly
                where it stands.
              </p>
            </Reveal>

            <Reveal delay={620}>
              <div className="mt-9 flex flex-wrap gap-3">
                <Magnetic>
                  <NotifyButton size="lg" variant="beacon">
                    Get notified →
                  </NotifyButton>
                </Magnetic>
                <Magnetic>
                  <LinkButton href="#sponsors" variant="ghost" size="lg">
                    Sponsor Beacon
                  </LinkButton>
                </Magnetic>
              </div>
            </Reveal>

            <Reveal delay={720}>
              <p className="mt-5 text-sm text-band-ink/55">
                <a
                  href="#status"
                  className="text-beacon underline underline-offset-4 hover:text-band-ink"
                >
                  See exactly what is locked and what is not
                </a>
              </p>
            </Reveal>
          </div>
        </div>

        {/* the facts rise into place as the visitor scrolls the stage */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="wrap flex items-end justify-between gap-6 pb-5 sm:pb-7">
            <div
              aria-hidden="true"
              className="stage-cue hidden shrink-0 flex-col items-center gap-2 pb-1 text-band-ink/50 sm:flex"
            >
              <span className="label">Scroll</span>
              <span className="block h-8 w-px overflow-hidden bg-band-ink/15">
                <span className="block size-full bg-beacon motion-safe:animate-cue" />
              </span>
            </div>

            <dl className="stage-facts pointer-events-auto grid w-full grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-band-ink/12 bg-band/60 p-5 backdrop-blur-md sm:grid-cols-5 lg:ml-auto lg:w-auto lg:max-w-3xl">
              {FACTS.map(([k, v, note]) => (
                <div key={k} className="flex flex-col gap-1">
                  <dt className="label text-band-ink/50">{k}</dt>
                  <dd className="text-[0.9375rem] font-medium">{v}</dd>
                  <dd className="text-xs text-band-ink/55">{note}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
