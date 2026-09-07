import Image from "next/image";
import { Reveal } from "./ui/reveal";
import { LinkButton } from "./ui/button";
import { NotifyButton } from "./notify/notify-button";
import { LockIcon } from "./ui/locked";
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
      {/* The beacon: rings and a slow sweep, clipped to a circle so it reads
          as a lighthouse lamp rather than a stray wedge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="grid-paper absolute inset-0 opacity-60 [mask-image:radial-gradient(115%_75%_at_45%_0%,black,transparent_72%)]" />

        <div className="absolute -top-40 -right-40 size-[38rem] overflow-hidden rounded-full sm:-top-52 sm:-right-52 sm:size-[48rem]">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(242,161,0,0.20),transparent_60%)]" />
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(242,161,0,0.30)_22deg,transparent_52deg)] motion-safe:animate-sweep" />
          <div className="absolute inset-0 rounded-full border border-line-soft" />
          <div className="absolute inset-[14%] rounded-full border border-line-soft" />
          <div className="absolute inset-[30%] rounded-full border border-line-soft" />
        </div>
      </div>

      <div className="wrap grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-card/70 py-1.5 pr-4 pl-3 text-ink-2 backdrop-blur">
              <LockIcon className="size-3 text-ink-3" />
              <span className="label">Applications not open yet</span>
            </p>
          </Reveal>

          <Reveal delay={70}>
            <h1 className="mt-7 text-[clamp(3.5rem,12vw,8.5rem)] leading-[0.86] font-bold tracking-[-0.045em]">
              Beacon
              <br />
              <span className="text-beacon-deep">Hacks</span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
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

          <Reveal delay={160}>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-2">
              A free one day hackathon being built for Bay Area high schoolers,
              targeting January 2027 in Belmont. It is not funded yet and the
              room is not signed yet — this page says exactly where it stands.
            </p>
          </Reveal>

          <Reveal delay={210}>
            <div className="mt-9 flex flex-wrap gap-3">
              <NotifyButton size="lg">Get notified →</NotifyButton>
              <LinkButton href="#sponsors" variant="ghost" size="lg">
                Sponsor Beacon
              </LinkButton>
            </div>
          </Reveal>

          <Reveal delay={250}>
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

        <Reveal delay={180}>
          <figure className="relative">
            <div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-line bg-paper-warm shadow-[0_18px_50px_-20px_rgba(22,21,15,0.35)]">
              <Image
                src="/photos/hero.jpg"
                alt="A mentor leaning over a laptop with three students, all of them laughing"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              <figcaption className="label absolute right-3 bottom-3 rounded-full bg-ink/70 px-3 py-1.5 text-paper backdrop-blur">
                Stock photo, not our venue
              </figcaption>
            </div>

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
        </Reveal>
      </div>
    </section>
  );
}
