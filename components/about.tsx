import { EVENT } from "@/lib/event";

/** What the day is and who it is for, in one screen. */
export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="bg-fog">
      <div className="wrap py-20 sm:py-24">
        <h2 id="about-title" className="heading">
          Build what lights the way
        </h2>
        <div className="mt-8 grid gap-5 text-lg leading-relaxed text-ink-2 lg:grid-cols-2 lg:gap-16">
          <p>
            One Saturday in {EVENT.venue.city} for high school students from
            across the Bay Area. Come with a team, or find one on the day.
          </p>
          <p>
            Never written code? You are welcome here. Build an app, a game, a
            website or a hardware hack, then show it to the judges.
          </p>
        </div>
      </div>
    </section>
  );
}
