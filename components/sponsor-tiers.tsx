import { IN_KIND, SPONSOR_TIERS } from "@/lib/content";
import { Reveal } from "./ui/reveal";

/**
 * The offer. Four cash tiers, each showing what is new at that level with a
 * disclosure for everything inherited from below, and an in-kind card for
 * anyone who has something other than money.
 */
export function SponsorTiers() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SPONSOR_TIERS.map((tier, i) => {
          const below = SPONSOR_TIERS.slice(0, i);
          const inherited = below.flatMap((t) => t.perks);
          const previous = below[below.length - 1];
          const total = tier.perks.length + inherited.length;

          return (
            <Reveal key={tier.id} delay={i * 80} variant="tilt">
              <article className="flex h-full flex-col rounded-2xl border border-line bg-card p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="size-2.5 rounded-full"
                      style={{ background: tier.accent }}
                    />
                    <h4 className="text-xl">{tier.name}</h4>
                  </span>
                  <span className="label text-ink-4">
                    {total} {total === 1 ? "benefit" : "benefits"}
                  </span>
                </div>

                <p className="mt-4 font-display text-4xl font-semibold tracking-tight tabular-nums">
                  ${tier.priceUsd.toLocaleString()}
                </p>

                <p className="label mt-6 text-beacon-deep">
                  {previous ? `Everything in ${previous.name}, plus` : "What you get"}
                </p>
                <ul className="mt-2 divide-y divide-line-soft">
                  {tier.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-start gap-3 py-2.5 text-[0.9375rem] leading-snug text-ink-2"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-beacon"
                      />
                      {perk}
                    </li>
                  ))}
                </ul>

                {inherited.length ? (
                  <details className="group mt-auto border-t border-line-soft pt-4">
                    <summary className="label flex cursor-pointer items-center justify-between gap-3 text-ink-3 transition-colors hover:text-ink">
                      Also includes {inherited.length} from below
                      <span
                        aria-hidden="true"
                        className="relative size-3 shrink-0 transition-transform duration-300 group-open:rotate-45"
                      >
                        <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
                        <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current" />
                      </span>
                    </summary>
                    <ul className="mt-3 flex flex-col gap-2">
                      {inherited.map((perk) => (
                        <li
                          key={perk}
                          className="rounded-lg border border-dashed border-line px-3 py-2 text-sm leading-snug text-ink-3"
                        >
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </article>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={120} variant="tilt">
        <div className="mt-4 flex flex-col gap-5 rounded-2xl border border-dashed border-line-hard bg-card/60 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full"
              style={{ background: "#b39ddb" }}
            />
            <h4 className="text-xl">In kind</h4>
            <span className="label ml-2 text-ink-4">{IN_KIND.note}</span>
          </div>
          <ul className="flex flex-wrap gap-2">
            {IN_KIND.items.map((item) => (
              <li
                key={item}
                className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-ink-2"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </>
  );
}
