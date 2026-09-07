import type { Metadata } from "next";
import Link from "next/link";
import { EVENT } from "@/lib/event";
import { LinkButton } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Code of conduct",
  description:
    "The rules of the room at Beacon Hacks: what we expect, what is not acceptable, how to report something, and what happens after.",
};

export default function CodeOfConduct() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-xl">
        <div className="wrap flex h-16 items-center gap-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full bg-beacon shadow-[0_0_0_4px_rgba(242,161,0,0.16)]"
            />
            <span className="font-display text-[0.9375rem] font-bold tracking-tight">
              BEACON HACKS
            </span>
          </Link>
          <span className="label hidden border-l border-line pl-5 text-ink-3 sm:inline">
            Code of conduct
          </span>
          <Link
            href="/"
            className="ml-auto text-[0.9375rem] text-ink-3 hover:text-ink"
          >
            Back to the site
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <article className="wrap max-w-3xl py-16 sm:py-24">
          <p className="eyebrow">Code of conduct</p>
          <h1 className="mt-4 text-4xl leading-[1.05] sm:text-5xl">
            The rules of the room.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-2">
            Beacon Hacks is a fourteen hour event for high schoolers, many of
            whom are attending their first hackathon. Everyone in the building —
            attendees, mentors, judges, sponsors, volunteers and organizers —
            agrees to this before the doors open.
          </p>

          <Prose>
            <H>What we expect</H>
            <ul>
              <li>
                Treat everyone in the room as someone who belongs there,
                whatever their experience level.
              </li>
              <li>
                Assume good faith. Beginners ask basic questions; that is the
                point of the event.
              </li>
              <li>
                Share the space: the tables, the outlets, the mentors&rsquo;
                time and the sponsors&rsquo; attention.
              </li>
              <li>
                Ask before photographing or filming anyone, and stop if asked.
              </li>
              <li>
                Build your own project during the event. Bringing prior work and
                passing it off as new is not in the spirit of it.
              </li>
              <li>
                Follow instructions from organizers and venue staff, especially
                about which areas are off limits.
              </li>
            </ul>

            <H>What is not acceptable</H>
            <p>Harassment of any kind, including:</p>
            <ul>
              <li>
                Comments or jokes that demean someone for their race, ethnicity,
                national origin, religion, gender, gender identity or
                expression, sexual orientation, disability, age, body size or
                appearance.
              </li>
              <li>
                Sexual language, imagery or attention. This is an event for
                minors and there is no version of this that is acceptable here.
              </li>
              <li>
                Intimidation, stalking, following, or unwanted physical contact.
              </li>
              <li>
                Sustained disruption of talks, workshops, judging or another
                team&rsquo;s work.
              </li>
              <li>
                Photographing or recording someone who has asked you not to.
              </li>
              <li>
                Alcohol, drugs, weapons, or anything else prohibited by the
                venue or by law.
              </li>
              <li>Encouraging any of the above in others.</li>
            </ul>
            <p>
              This applies to the venue and to any other Beacon Hacks space,
              online or off, before, during and after the event.
            </p>

            <H>Reporting</H>
            <div className="my-8 rounded-2xl border border-beacon/40 bg-beacon-wash px-6 py-5">
              <p>
                <strong className="font-semibold text-ink">
                  If something happens, tell an organizer.
                </strong>{" "}
                We wear marked shirts and are on the floor all day. You can also
                email{" "}
                <Link
                  href={`mailto:${EVENT.email.team}`}
                  className="text-beacon-deep underline underline-offset-4"
                >
                  {EVENT.email.team}
                </Link>
                , which reaches the organizing team directly.
              </p>
              <p className="mt-3">
                If you or anyone else is in immediate danger, call{" "}
                <strong className="font-semibold text-ink">911</strong> first,
                then find an organizer.
              </p>
            </div>
            <p>
              You do not need to be certain, and you do not need proof. If
              something felt wrong, tell us and let us look into it. Reporting
              in good faith will never count against you, and we will not ask
              you to confront the other person yourself.
            </p>

            <H>What happens after a report</H>
            <p>
              An organizer will find somewhere private to talk, listen to what
              happened, and write it down. We will tell you what we plan to do
              before we do it, and we will not share your name with the person
              reported unless you say we can.
            </p>
            <p>
              Depending on what happened, the response may be a warning, removal
              from part of the event, disqualification from judging, or being
              asked to leave the venue with no refund of anything. For attendees
              under 18, we will contact a parent or guardian when someone is
              asked to leave, and when the safety of a minor is involved.
            </p>

            <H>Under 18</H>
            <p>
              Every attendee is a high school student, and most are minors.
              Organizers and mentors are never alone one to one with an attendee
              in a closed room. Nobody leaves the venue with an adult who is not
              their own parent or guardian. If a mentor, judge or sponsor makes
              you uncomfortable in any way, that is exactly the thing this page
              exists for — tell an organizer.
            </p>

            <H>Who this binds</H>
            <p>
              Everyone, equally. A sponsor&rsquo;s representative and a
              first-time ninth grader are held to the same standard, and being
              important to the event buys nobody an exception.
            </p>
          </Prose>

          <p className="mt-12 text-sm leading-relaxed text-ink-4">
            Adapted from common hackathon and open source codes of conduct,
            including the Contributor Covenant and the conference
            anti-harassment policies they descend from.
          </p>

          <LinkButton href="/" variant="ghost" className="mt-10">
            ← Back to the site
          </LinkButton>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 mb-4 text-2xl">{children}</h2>;
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 leading-relaxed text-ink-2 [&_li]:mb-2 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6">
      {children}
    </div>
  );
}
