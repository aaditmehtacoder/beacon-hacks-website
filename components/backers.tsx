import Image from "next/image";
import { BACKERS } from "@/lib/content";
import { Reveal } from "./ui/reveal";

/**
 * A logo row for the companies that have committed something in writing.
 * Logos only: what each one gives lives in the data and on the prize board,
 * not here. Everything is in kind until money actually lands.
 */
export function Backers() {
  if (!BACKERS.length) return null;

  return (
    <div className="mb-12 sm:mb-16">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="label text-beacon-deep">Backing the day so far</p>
        <p className="label text-ink-4">In kind. No cash yet.</p>
      </div>
      <ul className="mt-5 flex flex-wrap gap-4">
        {BACKERS.map((backer, i) => (
          <Reveal
            key={backer.name}
            as="li"
            delay={i * 80}
            variant="tilt"
            className="w-full sm:w-72"
          >
            <a
              href={backer.website}
              target="_blank"
              rel="noopener noreferrer"
              title={backer.gives}
              aria-label={`${backer.name}, in-kind backer`}
              className="group flex h-28 items-center justify-center rounded-2xl border border-line bg-card px-9 transition-[border-color,box-shadow] duration-300 hover:border-line-hard hover:shadow-lift"
            >
              <span className="relative block h-11 w-full">
                <Image
                  src={backer.logo}
                  alt={`${backer.name} logo`}
                  fill
                  unoptimized
                  sizes="224px"
                  className="object-contain opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                />
              </span>
            </a>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
