import { STEPS } from "@/lib/content";
import { BeaconMark } from "./ui/beacon-mark";

/** What the day is and who it is for, then the four steps of the day. */
export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative overflow-hidden bg-paper">
      <BeaconMark className="pointer-events-none absolute -right-16 -bottom-20 size-[26rem] text-beacon opacity-25" />

      <div className="wrap relative py-20 sm:py-28 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <h2 id="about-title" className="display-xl lg:col-span-6">
            Build what lights the way.
          </h2>
          <div className="flex flex-col gap-5 text-lg leading-relaxed text-ink-3 lg:col-span-5 lg:col-start-8 lg:pt-3">
            <p>
              Beacon Hacks is a free, one-day hackathon for high school students
              across the Bay Area. Come with a team of up to four, or find one
              on the day.
            </p>
            <p>
              Never written code before? You are welcome here. Spend the day
              making an app, a game, a website or a hardware hack with people
              who want to build too, then show it to the judges.
            </p>
          </div>
        </div>

        <ol className="mt-16 grid gap-5 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="brut brut-hover flex flex-col p-6">
              <span className="meta text-beacon-deep">Step {String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-[1.75rem] leading-none tracking-[-0.035em]">{step.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-3">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
