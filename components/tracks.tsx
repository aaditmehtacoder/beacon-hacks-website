import { Section } from "./ui/section";

/**
 * The tracks stay sealed until the opening ceremony, so nobody builds ahead.
 * Their names and briefs are deliberately not in this repo, which is public:
 * add them here at the ceremony, not before.
 */
const SEALED = [
  { name: "w-44 sm:w-52", lines: ["w-full", "w-[72%]"] },
  { name: "w-52 sm:w-64", lines: ["w-[94%]", "w-[58%]"] },
  { name: "w-40 sm:w-48", lines: ["w-[88%]", "w-[66%]"] },
];

/** A lamp not yet lit: the light comes on at the opening ceremony. */
function UnlitLamp() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="size-14">
      <circle cx="24" cy="24" r="4.5" className="stroke-ink-3" strokeWidth="2" />
      <path
        d="M15.5 15.5a12 12 0 0 0 0 17M32.5 15.5a12 12 0 0 1 0 17M10 10a19.8 19.8 0 0 0 0 28M38 10a19.8 19.8 0 0 1 0 28"
        className="stroke-line-2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 5"
      />
    </svg>
  );
}

/** The three tracks, sealed until the day. */
export function Tracks() {
  return (
    <Section
      id="tracks"
      title="Three tracks"
      lede="Revealed at the opening ceremony, so nobody starts early. Pick one at kickoff."
    >
      <ol className="border-t border-line">
        {SEALED.map((bars, i) => (
          <li
            key={i}
            className="grid gap-x-10 gap-y-5 border-b border-line py-10 sm:py-12 lg:grid-cols-12 lg:items-center"
          >
            <span className="sr-only">Track {i + 1}: revealed at the opening ceremony.</span>
            <div aria-hidden="true" className="flex items-center gap-5 lg:col-span-5">
              <span className="shrink-0">
                <UnlitLamp />
              </span>
              <span className={`block h-8 rounded-full bg-ink/[0.07] sm:h-10 ${bars.name}`} />
            </div>
            <div aria-hidden="true" className="flex max-w-2xl flex-col gap-3 lg:col-span-7">
              {bars.lines.map((w) => (
                <span key={w} className={`block h-3.5 rounded-full bg-ink/[0.05] ${w}`} />
              ))}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
