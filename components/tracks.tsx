import { TRACKS } from "@/lib/content";
import { Section } from "./ui/section";

/** A small drawing for each track, in the language of the scene. */
const GLYPHS = [
  /* Signal: a light and the rings it sends out */
  <svg key="signal" viewBox="0 0 48 48" fill="none" className="size-14">
    <circle cx="24" cy="24" r="4.5" className="fill-lamp" />
    <path d="M15.5 15.5a12 12 0 0 0 0 17M32.5 15.5a12 12 0 0 1 0 17M10 10a19.8 19.8 0 0 0 0 28M38 10a19.8 19.8 0 0 1 0 28" className="stroke-ink" strokeWidth="2" strokeLinecap="round" />
  </svg>,
  /* Landfall: a coast coming up over the water */
  <svg key="landfall" viewBox="0 0 48 48" fill="none" className="size-14">
    <path d="M6 30c5-1 7-8 13-9 5-1 7 4 11 3 4-1 6-7 12-7v13H6Z" className="fill-lamp" />
    <path d="M4 34h40M8 39h10M24 39h16" className="stroke-ink" strokeWidth="2" strokeLinecap="round" />
  </svg>,
  /* First Light: the sun just over the horizon */
  <svg key="first-light" viewBox="0 0 48 48" fill="none" className="size-14">
    <path d="M14 32a10 10 0 0 1 20 0Z" className="fill-lamp" />
    <path d="M4 32h40M24 12v5M10.5 18.5l3.5 3.5M37.5 18.5 34 22M10 38h28" className="stroke-ink" strokeWidth="2" strokeLinecap="round" />
  </svg>,
];

/** The three tracks, as rows. */
export function Tracks() {
  return (
    <Section
      id="tracks"
      title="Three tracks"
      lede="Choose one at kickoff. A project can be judged in more than one."
    >
      <ol className="border-t border-line">
        {TRACKS.map((track, i) => (
          <li
            key={track.name}
            className="group grid gap-x-10 gap-y-5 border-b border-line py-10 sm:py-12 lg:grid-cols-12 lg:items-start"
          >
            <div className="flex items-center gap-5 lg:col-span-5">
              <span aria-hidden="true" className="shrink-0">
                {GLYPHS[i]}
              </span>
              <h3 className="text-[2rem] leading-none font-bold font-stretch-125% tracking-[-0.035em] sm:text-[2.5rem]">
                {track.name}
              </h3>
            </div>
            <div className="lg:col-span-7 lg:pt-1">
              <p className="max-w-2xl text-lg leading-relaxed text-ink-2">{track.body}</p>
              <p className="mt-4 max-w-2xl leading-relaxed text-ink-3">
                <span className="font-semibold text-lamp-deep">Good fit if </span>
                {track.fit}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
