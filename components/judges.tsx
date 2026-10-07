import Image from "next/image";
import { JUDGES } from "@/lib/content";
import { mailto } from "@/lib/event";
import { Section } from "./ui/section";
import { LinkedInIcon } from "./ui/icons";

/**
 * Only people who have agreed in writing, with the bio and photo they sent
 * us. Portraits share one 4:5 crop; each judge's `focus` keeps the face in
 * frame.
 */
export function Judges() {
  return (
    <Section
      id="judges"
      title="Judges"
      lede="Industry professionals who will walk the room at demo time and talk with every team. More judges are announced as they confirm."
      aside={
        <p className="text-ink-3">
          Want to judge or mentor?{" "}
          <a href={mailto("Judging or mentoring at Beacon Hacks")} className="link text-ink">
            Email the team
          </a>
        </p>
      }
    >
      <ul className="grid gap-x-12 gap-y-14 lg:grid-cols-2">
        {JUDGES.map((judge) => (
          <li key={judge.name} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-6 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-x-8">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-fog-2">
              <Image
                src={judge.photo}
                alt={`Portrait of ${judge.name}`}
                fill
                sizes="(min-width: 640px) 160px, 120px"
                quality={85}
                className="object-cover"
                style={{ objectPosition: judge.focus }}
              />
            </div>

            <div className="flex flex-col">
              <h3 className="text-[1.5rem] leading-[1.08] font-bold font-stretch-[118%] tracking-[-0.03em] sm:text-[1.75rem]">
                {judge.name}
              </h3>
              <p className="mt-2 leading-snug text-ink-2">{judge.role}</p>
              <p className="mt-1 font-semibold text-ink">{judge.org}</p>
              <a
                href={judge.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex w-fit items-center gap-2 pt-4 text-[0.9375rem] font-semibold text-ink-2 transition-colors hover:text-[#0a66c2]"
              >
                <LinkedInIcon className="size-[1.125rem]" />
                LinkedIn
                <span className="sr-only">profile of {judge.name} (opens in a new tab)</span>
              </a>
            </div>

            <p className="col-span-2 mt-6 max-w-xl leading-relaxed text-ink-3">{judge.bio}</p>
          </li>
        ))}
      </ul>

      <p className="mt-14 max-w-2xl text-[0.875rem] leading-relaxed text-ink-3">
        Employers are listed to identify each judge. Judges take part as
        individuals, and their companies are not sponsors of Beacon Hacks.
      </p>
    </Section>
  );
}
