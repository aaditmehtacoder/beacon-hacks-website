import Image from "next/image";
import { JUDGES, countInWords } from "@/lib/content";
import { EVENT } from "@/lib/event";
import { Section } from "./ui/section";
import { Reveal } from "./ui/reveal";

/**
 * Only people who have agreed in writing, shown with the bio and photo they
 * sent us. The panel grows here as judges say yes, and not before.
 */
export function Judges() {
  const count = JUDGES.length;
  const said = count === 1 ? "has said yes" : "have said yes";

  return (
    <Section
      id="judges"
      eyebrow="Judges"
      title="Who walks the room."
      lede={`No stage, no slides. At nine the judges come to your table and you talk them through what you made. ${countInWords(count)} ${said} so far, and the panel grows here as more do.`}
      aside={
        <a
          href={`mailto:${EVENT.email.team}?subject=Judging%20at%20Beacon%20Hacks`}
          className="label inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-ink-2 transition-colors hover:border-line-hard hover:text-ink"
        >
          Want to judge? Write to us
        </a>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        {JUDGES.map((judge, i) => (
          <Reveal key={judge.name} delay={i * 90} variant="tilt">
            <article className="flex h-full flex-col gap-6 rounded-2xl border border-line bg-card p-6 sm:flex-row sm:items-start sm:p-7">
              <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-paper-warm sm:size-32">
                <Image
                  src={judge.photo}
                  alt={`Portrait of ${judge.name}`}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-xl">{judge.name}</h3>
                <p className="mt-1 text-[0.9375rem] text-beacon-deep">
                  {judge.role}, {judge.org}
                </p>
                <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-2">
                  {judge.bio}
                </p>
                <a
                  href={judge.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label mt-5 inline-flex items-center gap-1.5 self-start text-ink-3 transition-colors hover:text-ink"
                >
                  LinkedIn
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
