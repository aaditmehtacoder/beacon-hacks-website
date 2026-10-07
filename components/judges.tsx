import Image from "next/image";
import { JUDGES } from "@/lib/content";
import { mailto } from "@/lib/event";
import { Section } from "./ui/section";
import { LinkedInIcon } from "./ui/icons";
import { PartnerLogo } from "./ui/partner-logo";

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
      lede="They walk the room at demo time and talk with every team. More are announced as they confirm."
      aside={
        <p className="text-ink-3">
          Want to judge or mentor?{" "}
          <a href={mailto("Judging or mentoring at Beacon Hacks")} className="link text-ink">
            Email the team
          </a>
        </p>
      }
    >
      <ul className="grid gap-5 lg:grid-cols-2">
        {JUDGES.map((judge) => (
          <li
            key={judge.name}
            className="reveal group flex flex-col rounded-3xl border border-line bg-card p-6 transition-[box-shadow,transform] duration-300 ease-out-quart hover:-translate-y-1 hover:shadow-[0_30px_60px_-36px_rgb(15_24_40/0.45)] sm:p-8"
          >
            <div className="flex gap-5 sm:gap-7">
              <div className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-2xl bg-fog-2 sm:w-36">
                <Image
                  src={judge.photo}
                  alt={`Portrait of ${judge.name}`}
                  fill
                  sizes="(min-width: 640px) 144px, 112px"
                  quality={85}
                  className="object-cover transition-transform duration-500 ease-out-quart group-hover:scale-[1.03]"
                  style={{ objectPosition: judge.focus }}
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-8 items-center">
                    <PartnerLogo logo={judge.orgLogo} area={2400} />
                  </span>
                  <a
                    href={judge.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="-mt-1 -mr-1 grid size-10 shrink-0 place-items-center rounded-full text-ink-3 transition-colors hover:bg-[#0a66c2]/10 hover:text-[#0a66c2]"
                  >
                    <LinkedInIcon className="size-[1.125rem]" />
                    <span className="sr-only">{judge.name} on LinkedIn (opens in a new tab)</span>
                  </a>
                </div>
                <h3 className="mt-auto pt-5 text-[1.5rem] leading-[1.08] font-bold font-stretch-[118%] tracking-[-0.03em] sm:text-[1.75rem]">
                  {judge.name}
                </h3>
                <p className="mt-2 leading-snug text-ink-3">
                  {judge.role}
                  <span className="sr-only">, {judge.org}</span>
                </p>
              </div>
            </div>

            <p className="mt-6 border-t border-line pt-5 leading-relaxed text-ink-3">{judge.bio}</p>
          </li>
        ))}
      </ul>

      <p className="mt-14 max-w-2xl text-[0.875rem] leading-relaxed text-ink-3">
        Judges take part as individuals; their employers are not sponsors.
      </p>
    </Section>
  );
}
