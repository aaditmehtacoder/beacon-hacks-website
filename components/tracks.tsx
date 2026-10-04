import { AT_A_GLANCE, TRACKS } from "@/lib/content";
import { Section } from "./ui/section";
import { Spark } from "./ui/button";

/** The three tracks, on the yellow band, and who the day is for. */
export function Tracks() {
  return (
    <Section
      id="tracks"
      tone="yellow"
      word="TRACKS"
      title="Pick a track."
      lede="Three ways to point a light. Choose one at kickoff; a project can be judged in more than one."
    >
      <ul className="grid gap-5 lg:grid-cols-3">
        {TRACKS.map((track) => (
          <li key={track.name} className="brut brut-hover flex flex-col p-7">
            <span className="meta text-ink-2">{track.tag}</span>
            <h3 className="mt-4 text-[2.5rem] leading-[0.95] tracking-[-0.045em]">{track.name}</h3>
            <p className="mt-4 flex-1 leading-relaxed text-ink-3">{track.body}</p>
            <p className="mt-6 flex gap-2.5 border-t-2 border-ink pt-4 text-[0.9375rem] leading-relaxed font-medium text-ink">
              <Spark className="mt-1.5 size-3 text-ink" />
              {track.fit}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-10 grid border-2 border-ink bg-card sm:grid-cols-2 lg:grid-cols-4">
        {AT_A_GLANCE.map((fact, i) => (
          <div
            key={fact.label}
            className={`flex flex-col gap-1 border-ink px-5 py-5 ${i > 0 ? "border-t-2 sm:border-t-0" : ""} ${
              i % 2 === 1 ? "sm:border-l-2" : ""
            } ${i >= 2 ? "sm:border-t-2 lg:border-t-0" : ""} ${i === 2 ? "lg:border-l-2" : ""}`}
          >
            <dt className="meta text-ink-2">{fact.label}</dt>
            <dd className="font-display text-[1.5rem] leading-tight font-extrabold tracking-[-0.03em]">{fact.value}</dd>
            <dd className="text-[0.875rem] leading-snug text-ink-3">{fact.note}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
