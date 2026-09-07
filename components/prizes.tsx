import { PLANNED_PRIZE_CATEGORIES } from "@/lib/content";
import { EVENT } from "@/lib/event";
import { Reveal } from "./ui/reveal";
import { LockChip } from "./ui/locked";
import { LinkButton } from "./ui/button";

/**
 * No cash figures, no hardware, no perks. Nothing is funded, so the section
 * shows the intended shape and says plainly that it is unfunded.
 */
export function Prizes() {
  return (
    <section id="prizes" className="wrap scroll-mt-24 py-20 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow">Prizes</p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-4 text-4xl leading-[1.05] sm:text-5xl">
              Not funded yet.
            </h2>
          </Reveal>
          <Reveal delay={110}>
            <p className="mt-5 leading-relaxed text-ink-2">
              We are not going to publish cash amounts or hardware that nobody
              has agreed to pay for. ${EVENT.budget.raisedUsd.toLocaleString()}{" "}
              has been raised so far. These are the categories we intend to
              judge; what sits behind each one appears here as sponsors sign,
              and not before.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <LinkButton href="#sponsors" variant="ghost" className="mt-7">
              Put something behind them
            </LinkButton>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <div className="rounded-2xl border border-dashed border-line-hard bg-paper-warm/50 p-6 sm:p-8">
            <LockChip>Unlocks at Gate 2, funding</LockChip>

            <ul className="mt-6 divide-y divide-line-soft">
              {PLANNED_PRIZE_CATEGORIES.map((category, i) => (
                <li
                  key={category}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <span className="flex items-baseline gap-4">
                    <span className="label w-6 text-ink-4">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[0.9375rem] font-medium text-ink-2">
                      {category}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-2 w-16 rounded-full bg-paper-deep sm:w-24"
                    title="Prize not set"
                  />
                </li>
              ))}
            </ul>

            <p className="mt-6 border-t border-line-soft pt-5 text-sm leading-relaxed text-ink-3">
              Six planned categories, so a first build is judged against other
              first builds rather than against a team that has done this before.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
