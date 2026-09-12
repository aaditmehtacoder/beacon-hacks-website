import Image from "next/image";
import { BACKERS } from "@/lib/content";
import { Reveal } from "./ui/reveal";

/**
 * Companies that have committed something in writing. Everything here is in
 * kind until money actually lands, and the status board says so.
 */
export function Backers() {
  if (!BACKERS.length) return null;

  return (
    <div className="mb-12 sm:mb-16">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="label text-beacon-deep">Backing the day so far</p>
        <p className="label text-ink-4">
          All in kind, committed in writing. No cash yet.
        </p>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {BACKERS.map((backer, i) => (
          <Reveal key={backer.name} delay={i * 80} variant="tilt">
            <article className="flex h-full flex-col gap-5 rounded-2xl border border-line bg-card p-5 sm:flex-row">
              <a
                href={backer.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${backer.name} website`}
                className="grid h-16 w-32 shrink-0 place-items-center rounded-xl border border-line-soft bg-paper-warm px-3"
              >
                <span className="relative block h-9 w-full">
                  <Image
                    src={backer.logo}
                    alt={`${backer.name} logo`}
                    fill
                    sizes="128px"
                    className="object-contain"
                  />
                </span>
              </a>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-lg">{backer.name}</h4>
                  <span className="label rounded-full border border-line bg-paper px-2 py-0.5 text-ink-3">
                    {backer.form}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">
                  {backer.gives}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
