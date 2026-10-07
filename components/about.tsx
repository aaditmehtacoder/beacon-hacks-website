import { EVENT } from "@/lib/event";
import { BulbIcon, ClockIcon, TrophyIcon, UsersIcon } from "./ui/icons";

const HIGHLIGHTS = [
  { Icon: UsersIcon, title: "Teams of up to four", body: "Bring friends, or find a team at kickoff." },
  { Icon: ClockIcon, title: `${EVENT.hours.hackingHours} hours to build`, body: `Hacking runs ${EVENT.hours.hacking}.` },
  { Icon: BulbIcon, title: "Workshops and mentors", body: "Short workshops are planned, and mentors are being recruited." },
  { Icon: TrophyIcon, title: "Judges and prizes", body: "Demo what you made to industry judges." },
];

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
            Beacon Hacks is a free, one-day hackathon for high school students
            from across the Bay Area. We are planning for {EVENT.capacityLabel}{" "}
            students in {EVENT.venue.city}. Come with a team of up to four, or
            find one on the day.
          </p>
          <p>
            Never written code before? You are welcome here. Spend the day
            making an app, a game, a website or a hardware hack with people who
            want to build too, then show it to the judges.
          </p>
        </div>

        <ul className="mt-12 grid gap-x-10 gap-y-8 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map(({ Icon, title, body }) => (
            <li key={title} className="reveal">
              <span className="grid size-11 place-items-center rounded-full bg-lamp-wash text-lamp-deep ring-1 ring-lamp/50">
                <Icon className="size-[1.375rem]" />
              </span>
              <p className="mt-4 text-[1.0625rem] font-semibold">{title}</p>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-3">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
