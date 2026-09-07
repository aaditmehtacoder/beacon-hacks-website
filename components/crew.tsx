import { ORGANIZERS, type Person } from "@/lib/content";
import { EVENT } from "@/lib/event";
import { Section } from "./ui/section";
import { Reveal } from "./ui/reveal";
import { LockChip } from "./ui/locked";
import { LinkButton } from "./ui/button";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

function Card({ person }: { person: Person }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-card p-5">
      <span
        aria-hidden="true"
        className="grid size-12 shrink-0 place-items-center rounded-full bg-beacon-wash font-display text-sm font-semibold text-beacon-deep"
      >
        {initials(person.name)}
      </span>
      <div>
        <div className="font-medium">{person.name}</div>
        <div className="label mt-1 text-ink-4">{person.role}</div>
      </div>
    </div>
  );
}

export function Crew() {
  return (
    <Section
      id="crew"
      eyebrow="Who is behind this"
      title="Two high schoolers, so far."
      lede="Beacon is being organized by the two of us. Nobody else has been recruited yet, and nobody who has not agreed to something appears on this page."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
        {ORGANIZERS.map((person, i) => (
          <Reveal key={person.name} delay={i * 70}>
            <Card person={person} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={140}>
        <div className="mt-8 rounded-2xl border border-dashed border-line-hard bg-paper-warm/50 p-6 sm:p-8">
          <LockChip>Judges not recruited</LockChip>
          <h3 className="mt-5 text-xl">
            No judges are announced, because none have agreed.
          </h3>
          <p className="mt-3 max-w-2xl leading-relaxed text-ink-2">
            Judging is a science fair walk: five or so people who have built
            things go table to table and ask what you made, what broke, and what
            you would do with another day. If that is your idea of a good
            Saturday, we would like to hear from you.
          </p>
          <LinkButton
            href={`mailto:${EVENT.email.team}?subject=Judging%20at%20Beacon%20Hacks`}
            variant="ghost"
            className="mt-6"
          >
            Offer to judge or mentor
          </LinkButton>
        </div>
      </Reveal>
    </Section>
  );
}
