import { IN_KIND, SPONSOR_TIERS } from "@/lib/content";
import { Reveal } from "./ui/reveal";
import { Inherited } from "./sponsor-inherited";

/**
 * The offer. Four cash tiers, each showing what is new at that level with a
 * disclosure for everything inherited from below, and an in-kind card for
 * anyone who has something other than money. Cards hug their content: a
 * tier with one perk is a short card, not a tall one with a hole in it.
 */
export function SponsorTiers() {
  return (
    <>
      <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SPONSOR_TIERS.map((tier, i) => {
          const below = SPONSOR_TIERS.slice(0, i);
          const inherited = below.flatMap((t) => t.perks);
          const previous = below[below.length - 1];
          const total = tier.perks.length + inherited.length;

          return (
            <Reveal key={tier.id} delay={i * 80} variant="tilt">
              <article className="flex flex-col rounded-2xl border border-line bg-card p-6">
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
                  <Inherited id={`${tier.id}-inherited`} items={inherited} />
                ) : null}
              </article>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={120} variant="tilt">
        <div className="mt-4 flex flex-col gap-5 rounded-2xl border border-dashed border-line-hard bg-card/60 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full"
                style={{ background: "#b39ddb" }}
              />
              <h4 className="text-xl">In kind</h4>
            </span>
            <span className="label text-ink-4">{IN_KIND.note}</span>
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
