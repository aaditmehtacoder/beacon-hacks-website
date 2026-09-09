import { LinkButton } from "./ui/button";
import { Magnetic } from "./ui/magnetic";
import { Reveal } from "./ui/reveal";
import { EVENT } from "@/lib/event";

/**
 * The same lamp the hero shows up close, seen here from the water: a point
 * on the horizon and a beam sweeping the sky behind the words.
 */
export function Closing() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-band pt-28 pb-40 text-band-ink sm:pt-36 sm:pb-48">
      {/* Effects fade out before the bottom edge, so the glow ends in the
          band rather than being sliced off by the footer. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_78%,transparent_100%)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--band-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--band-grid)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(90%_70%_at_50%_50%,black,transparent_75%)]" />

        {/* horizon */}
        <div className="absolute inset-x-0 top-[86%] h-px bg-band-ink/10" />

        {/* the beam, clipped to the sky so it never sweeps the sea */}
        <div className="absolute top-[86%] left-1/2 size-[170vmax] -translate-x-1/2 -translate-y-1/2 [mask-image:linear-gradient(to_bottom,black_49.6%,transparent_50%)]">
          <div className="size-full rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,var(--glow-sweep)_12deg,transparent_30deg,transparent_180deg,var(--glow-sweep)_192deg,transparent_210deg)] opacity-80 motion-safe:animate-sweep" />
        </div>

        {/* warmth around the lamp */}
        <div className="absolute top-[86%] left-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--glow-closing),transparent_60%)] blur-2xl" />

        {/* the lamp */}
        <div className="absolute top-[86%] left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-beacon shadow-lamp-lg" />
      </div>

      <div className="wrap relative text-center">
        <Reveal>
          <h2 className="text-[clamp(2.75rem,8vw,6rem)] leading-[0.94] font-bold tracking-[-0.04em]">
            Build what
            <br />
            <span className="text-beacon">lights the way.</span>
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <p className="label mt-8 text-band-ink/60">
            Target {EVENT.targetDateLabel} · {EVENT.venue.label} · Early applications open
          </p>
        </Reveal>
        <Reveal delay={140}>
          <div className="mt-10 flex justify-center">
            <Magnetic>
              <LinkButton href="/apply" size="lg" variant="beacon">
                Apply early →
              </LinkButton>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
