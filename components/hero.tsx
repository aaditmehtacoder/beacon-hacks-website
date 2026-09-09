import { Reveal } from "./ui/reveal";
import { TextReveal } from "./ui/text-reveal";
import { Magnetic } from "./ui/magnetic";
import { Parallax } from "./ui/parallax";
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

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <Parallax speed={0.18} className="absolute inset-0">
          <div className="grid-paper absolute inset-0 opacity-60 [mask-image:radial-gradient(115%_75%_at_45%_0%,black,transparent_72%)]" />
        </Parallax>
        {/* The lamp's light, cast onto the page. The scene writes
            --beam-facing every frame: 1 when a beam points straight at you. */}
        <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_74%_42%,var(--glow-sweep),transparent_70%)] [opacity:var(--beam-facing,0)]" />
      </div>

      <div className="wrap grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-card/70 py-1.5 pr-4 pl-3 text-ink-2 backdrop-blur">
              <LockIcon className="size-3 text-ink-3" />
              <span className="label">Applications not open yet</span>
            </p>
          </Reveal>

          <h1 className="mt-7 text-[clamp(3.5rem,12vw,8.5rem)] leading-[0.86] font-bold tracking-[-0.045em]">
            <TextReveal delay={120}>Beacon</TextReveal>
            <TextReveal delay={240} className="text-beacon-deep">
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
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-2">
              A free one day hackathon being built for Bay Area high schoolers,
              targeting January 2027 in Belmont. It is not funded yet and the
              room is not signed yet. This page says exactly where it stands.
            </p>
          </Reveal>

          <Reveal delay={620}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Magnetic>
                <NotifyButton size="lg">Get notified →</NotifyButton>
              </Magnetic>
              <Magnetic>
                <LinkButton href="#sponsors" variant="ghost" size="lg">
                  Sponsor Beacon
                </LinkButton>
              </Magnetic>
            </div>
          </Reveal>

          <Reveal delay={720}>
            <p className="mt-5 text-sm text-ink-3">
              <a
                href="#status"
                className="text-beacon-deep underline underline-offset-4 hover:text-ink"
              >
                See exactly what is locked and what is not
              </a>
            </p>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <Parallax speed={-0.08}>
          <figure className="relative">
            <Beacon className="aspect-square sm:aspect-4/5" />

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-line bg-card/80 p-5 backdrop-blur sm:grid-cols-3 lg:grid-cols-2">
              {FACTS.map(([k, v, note]) => (
                <div key={k} className="flex flex-col gap-1">
                  <dt className="label text-ink-4">{k}</dt>
                  <dd className="text-[0.9375rem] font-medium">{v}</dd>
                  <dd className="text-xs text-ink-3">{note}</dd>
                </div>
              ))}
            </dl>
          </figure>
          </Parallax>
        </Reveal>
      </div>
    </section>
  );
}
