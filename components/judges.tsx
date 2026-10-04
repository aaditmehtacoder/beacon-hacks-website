import Image from "next/image";
import { JUDGES } from "@/lib/content";
import { mailto } from "@/lib/event";
import { Section } from "./ui/section";
import { Arrow } from "./ui/button";

/**
 * Only people who have agreed in writing, with the bio and photo they sent
 * us. Portraits share one 4:5 crop; each judge's `focus` keeps the face in
 * frame. Nothing sits on top of a photo and nothing hides behind hover.
 */
export function Judges() {
  return (
    <Section
      id="judges"
      tone="warm"
      title="The judges."
      lede="Industry professionals who will walk the room at demo time and talk with every team. More judges are announced as they confirm."
      aside={
        <p className="text-ink-3">
          Want to judge or mentor?{" "}
          <a href={mailto("Judging or mentoring at Beacon Hacks")} className="link">
            Email the team
          </a>
        </p>
      }
    >
      <ul className="grid gap-8 lg:grid-cols-2">
        {JUDGES.map((judge) => (
          <li
            key={judge.name}
            className="brut grid grid-cols-[7.5rem_minmax(0,1fr)] content-start items-end gap-x-5 gap-y-6 p-5 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:gap-x-7 sm:p-7"
          >
            <div className="relative aspect-[4/5] overflow-hidden border-2 border-ink bg-paper-deep shadow-[5px_5px_0_var(--color-beacon)]">
              <Image
                src={judge.photo}
                alt={`Portrait of ${judge.name}`}
                fill
                sizes="(min-width: 640px) 168px, 120px"
                quality={85}
                className="object-cover"
                style={{ objectPosition: judge.focus }}
              />
            </div>

            <div className="flex flex-col pb-1">
              <h3 className="text-[1.625rem] leading-[1.02] tracking-[-0.04em] sm:text-[2rem]">{judge.name}</h3>
              <p className="mt-3 leading-snug text-ink-3">{judge.role}</p>
              <p className="meta mt-1.5 text-ink">{judge.org}</p>
            </div>

            <div className="col-span-2 border-t-2 border-ink pt-5">
              <p className="leading-relaxed text-ink-3">{judge.bio}</p>
              <a
                href={judge.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-4 inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3.5 py-1.5 font-display text-[0.875rem] font-extrabold transition-colors hover:bg-ink hover:text-paper"
              >
                LinkedIn profile
                <span className="sr-only">of {judge.name} (opens in a new tab)</span>
                <Arrow className="size-3.5" />
              </a>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-10 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-3">
        Employers are listed to identify each judge. Judges take part as
        individuals, and their companies are not sponsors of Beacon Hacks.
      </p>
    </Section>
  );
}
