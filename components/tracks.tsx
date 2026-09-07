import { TRACKS } from "@/lib/content";
import { Section } from "./ui/section";
import { Reveal } from "./ui/reveal";

export function Tracks() {
  return (
    <Section
      id="tracks"
      eyebrow="Tracks"
      title="Three ways to point a light."
      lede="Pick one at kickoff or let the judging sort it out at the end. A project can be judged in more than one."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {TRACKS.map((track, i) => (
          <Reveal key={track.name} delay={i * 90}>
            <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card p-7 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-beacon hover:shadow-[0_20px_50px_-26px_rgba(242,161,0,0.55)]">
              {/* Wash that lifts on hover, so the card feels lit rather than moved. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(242,161,0,0.14),transparent_60%)] opacity-0 transition-opacity duration-400 group-hover:opacity-100"
              />

              <span className="label relative text-ink-4">{track.tag}</span>
              <h3 className="relative mt-5 font-display text-4xl tracking-tight">
                {track.name}
              </h3>
              <p className="relative mt-4 flex-1 leading-relaxed text-ink-2">
                {track.body}
              </p>

              <p className="relative mt-6 border-t border-line-soft pt-5 text-sm leading-relaxed text-ink-3 italic">
                {track.fit}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
