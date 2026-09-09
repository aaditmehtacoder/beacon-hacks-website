import { EVENT } from "@/lib/event";
import { Section } from "./ui/section";
import { Reveal } from "./ui/reveal";
import { LinkButton } from "./ui/button";
import { SponsorTiers } from "./sponsor-tiers";

export function Sponsors() {
  return (
    <Section
      id="sponsors"
      eyebrow="Sponsors"
      title="Back Beacon."
      lede="Nothing has been raised yet and no company has agreed to back it. Every tier is open, and each includes the ones below it."
    >
      <SponsorTiers />

      <Reveal delay={80}>
        <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-ink-3">
            Cash goes to food, space and prizes for high schoolers. Nothing
            carrying your name goes out until you have signed off on it.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <LinkButton
              href={`mailto:${EVENT.email.sponsors}?subject=Sponsoring%20Beacon%20Hacks`}
              size="md"
            >
              Talk to us about sponsoring
            </LinkButton>
            <a
              href={`mailto:${EVENT.email.sponsors}`}
              className="text-[0.9375rem] text-ink-2 hover:text-beacon-deep"
            >
              {EVENT.email.sponsors}
            </a>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
