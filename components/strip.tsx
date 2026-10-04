import { EVENT } from "@/lib/event";
import { Spark } from "./ui/button";

const WORDS = ["Build", "Learn", "Ship", "Demo"];

/**
 * The yellow band under the hero. It holds still on purpose: a scrolling
 * ticker would need a pause control (WCAG 2.2.2), and it is decoration,
 * so screen readers skip it.
 */
export function Ticker() {
  return (
    <div aria-hidden="true" className="overflow-hidden border-y-2 border-ink bg-beacon text-ink">
      <div className="flex w-max items-center gap-6 px-6 py-3 font-display text-[0.9375rem] font-extrabold tracking-[0.12em] uppercase sm:gap-8">
        {Array.from({ length: 6 }).flatMap((_, round) =>
          WORDS.map((word) => (
            <span key={`${round}-${word}`} className="flex items-center gap-6 sm:gap-8">
              {word}
              <Spark className="size-3" />
            </span>
          )),
        )}
      </div>
    </div>
  );
}

const FACTS = [
  { key: "When", value: EVENT.date.short, note: "Target date, confirmed with the venue" },
  { key: "Where", value: `${EVENT.venue.city}, ${EVENT.venue.region}`, note: "Venue announced after written approval" },
  { key: "Who", value: "Grades 9–12", note: "No experience needed" },
  { key: "Applications", value: EVENT.applications.label, note: EVENT.applications.note },
] as const;

/** The four facts a student or parent needs, right under the hero. */
export function Facts() {
  return (
    <section aria-label="Event facts" className="dots border-b border-line bg-paper-warm">
      <dl className="wrap grid grid-cols-2 lg:grid-cols-4">
        {FACTS.map((fact, i) => (
          <div
            key={fact.key}
            className={`flex flex-col gap-1.5 border-line py-6 sm:py-8 ${
              i % 2 === 0 ? "border-r pr-4 sm:pr-7" : "pl-4 sm:pl-7"
            } ${i < 2 ? "border-b lg:border-b-0" : ""} ${i === 1 ? "lg:border-r lg:pr-7" : ""} ${
              i === 2 ? "lg:pl-7" : ""
            } ${i === 0 ? "lg:border-l lg:pl-7" : ""} ${i === 3 ? "lg:border-r lg:pr-7" : ""}`}
          >
            <dt className="meta text-beacon-deep">{fact.key}</dt>
            <dd className="font-display text-[1.25rem] leading-tight font-extrabold tracking-[-0.025em] sm:text-[1.375rem]">
              {fact.value}
            </dd>
            <dd className="text-[0.875rem] leading-snug text-ink-3">{fact.note}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
