import { SPONSOR_NOTES } from "@/lib/content";
import { EVENT } from "@/lib/event";
import { Reveal } from "./ui/reveal";
import { LinkButton } from "./ui/button";

/** Tiers are open slots until real sponsors sign; we say so rather than faking logos. */
const TIERS = [
  { label: "Title", slots: 2, size: "h-28 text-base" },
  { label: "Gold", slots: 3, size: "h-20 text-[0.9375rem]" },
  { label: "Bronze", slots: 6, size: "h-16 text-sm" },
] as const;

export function Sponsors() {
  return (
    <section id="sponsors" className="wrap scroll-mt-24 py-20 sm:py-28">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
        <div>
          <Reveal>
            <p className="eyebrow">Sponsors</p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-4 text-4xl leading-[1.05] sm:text-5xl">
              The companies backing Beacon.
            </h2>
          </Reveal>
        </div>
        <Reveal delay={110}>
          <p className="text-lg leading-relaxed text-ink-2">
            Every slot below is open, because nothing has been raised yet. These
            are empty placeholders, not logos we are hiding — no company has
            agreed to back Beacon.
          </p>
        </Reveal>
      </div>

      <div className="mt-14 flex flex-col gap-10">
        {TIERS.map((tier, t) => (
          <div key={tier.label}>
            <Reveal>
              <p className="label mb-4 flex items-center gap-3 text-ink-4">
                {tier.label}
                <span aria-hidden="true" className="h-px flex-1 bg-line" />
              </p>
            </Reveal>
            <div
              className={`grid gap-3 ${
                tier.slots === 2
                  ? "sm:grid-cols-2"
                  : tier.slots === 3
                    ? "grid-cols-2 sm:grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
              }`}
            >
              {Array.from({ length: tier.slots }, (_, i) => (
                <Reveal key={i} delay={t * 40 + i * 40}>
                  <div
                    className={`grid ${tier.size} place-items-center rounded-xl border border-dashed border-line-hard bg-card/60 px-4 text-center label text-ink-4 transition-colors hover:border-beacon hover:bg-beacon-wash hover:text-beacon-deep`}
                  >
                    Your logo here
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-8 border-t border-line pt-10 sm:grid-cols-3">
        {SPONSOR_NOTES.map((note) => (
          <Reveal key={note.k}>
            <h3 className="label text-beacon-deep">{note.k}</h3>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-2">
              {note.p}
            </p>
          </Reveal>
        ))}
      </div>

      <Reveal delay={80}>
        <div className="mt-10 flex flex-wrap gap-3">
          <LinkButton
            href={`mailto:${EVENT.email.sponsors}?subject=Sponsoring%20Beacon%20Hacks`}
            size="md"
          >
            Talk to us about sponsoring
          </LinkButton>
          <LinkButton
            href={`mailto:${EVENT.email.sponsors}`}
            variant="ghost"
            size="md"
          >
            {EVENT.email.sponsors}
          </LinkButton>
        </div>
      </Reveal>
    </section>
  );
}
