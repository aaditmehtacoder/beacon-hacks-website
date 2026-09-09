import { EVENT } from "@/lib/event";
import { Reveal } from "./ui/reveal";
import { LockChip } from "./ui/locked";
import { TextReveal } from "./ui/text-reveal";

export function Venue() {
  return (
    <section
      id="venue"
      className="scroll-mt-24 border-y border-line bg-paper-warm py-20 sm:py-28"
    >
      <div className="wrap grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
        <div>
          <Reveal>
            <p className="eyebrow">Venue</p>
          </Reveal>
          <h2 className="mt-4 text-4xl leading-[1.05] sm:text-5xl">
            <TextReveal inView delay={60}>
              Belmont, California.
              <br />
              <span className="text-ink-3">Room to be named.</span>
            </TextReveal>
          </h2>
          <Reveal delay={110}>
            <p className="mt-5 text-lg leading-relaxed text-ink-2">
              A host on the Peninsula has offered their space and asked us not
              to use their name publicly until facilities signs off. That is a
              reasonable ask, so there is no name, no address and no photo of
              their building anywhere on this site.
            </p>
          </Reveal>
        </div>

        <Reveal delay={80} variant="tilt">
          <div className="rounded-2xl border border-dashed border-line-hard bg-card/60 p-6 sm:p-8">
            <LockChip>Unlocks at Gate 1, venue approval</LockChip>
            <dl className="mt-6 divide-y divide-line-soft">
              {[
                ["Name", "Announced after written approval"],
                ["Address", "Announced after written approval"],
                ["City", `${EVENT.venue.city}, ${EVENT.venue.region}`],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-4 py-3.5"
                >
                  <dt className="label text-ink-4">{k}</dt>
                  <dd className="text-right text-[0.9375rem] text-ink-2">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 border-t border-line-soft pt-5 text-sm leading-relaxed text-ink-3">
              What we can say: one floor big enough for around a hundred people,
              breakout rooms for workshops, parking, and a train station within
              walking distance.
            </p>
          </div>
        </Reveal>
      </div>

    </section>
  );
}
