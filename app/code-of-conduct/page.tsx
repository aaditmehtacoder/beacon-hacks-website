import type { Metadata } from "next";
import type { ReactNode } from "react";
import { EVENT, mailto } from "@/lib/event";
import { LinkButton } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const DESCRIPTION =
  "The rules of the room at Beacon Hacks: what we expect, what is not acceptable, how to report something, and what happens after.";

export const metadata: Metadata = {
  title: "Code of conduct",
  description: DESCRIPTION,
  alternates: { canonical: "/code-of-conduct" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/code-of-conduct",
    siteName: "Beacon Hacks",
    title: "Code of conduct · Beacon Hacks",
    description: DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Beacon Hacks. A free hackathon for Bay Area high school builders." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Code of conduct · Beacon Hacks",
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

export default function CodeOfConduct() {
  return (
    <>
      <SiteHeader home={false} />

      <main id="main" tabIndex={-1} className="flex-1 bg-fog focus:outline-none">
        <div className="wrap py-14 sm:py-20 lg:py-24">
          <article className="max-w-3xl">
            <p className="kicker text-lamp-deep">Code of conduct</p>
            <h1 className="heading mt-5">The rules of the room</h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-3">
              Beacon Hacks is a one-day event for high school students, many of
              whom are attending their first hackathon. Everyone in the building
              agrees to this before the doors open: attendees, mentors, judges,
              sponsors, volunteers and organizers.
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
              <div className="my-8 rounded-2xl border border-lamp/60 bg-lamp-wash px-6 py-5 sm:px-7 sm:py-6">
                <p>
                  <strong className="font-semibold text-ink">
                    If something happens, tell an organizer.
                  </strong>{" "}
                  We wear marked shirts and are on the floor all day. You can also
                  email{" "}
                  <a href={mailto("Code of conduct report")} className="link">
                    {EVENT.email.team}
                  </a>
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
                exists for. Tell an organizer.
              </p>

              <H>Who this binds</H>
              <p>
                Everyone, equally. A sponsor&rsquo;s representative and a
                first-time ninth grader are held to the same standard, and being
                important to the event buys nobody an exception.
              </p>
            </Prose>

            <p className="mt-12 text-[0.9375rem] leading-relaxed text-ink-3">
              Adapted from common hackathon and open source codes of conduct,
              including the Contributor Covenant and the conference
              anti-harassment policies they descend from.
            </p>

            <LinkButton href="/" variant="outline" className="mt-10">
              Back to the site
            </LinkButton>
          </article>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

function H({ children }: { children: ReactNode }) {
  return <h2 className="mt-14 mb-4 text-[1.75rem] leading-tight font-bold tracking-[-0.03em]">{children}</h2>;
}

function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 leading-relaxed text-ink-2 [&_li]:mb-2 [&_li]:pl-1 [&_li]:marker:text-lamp-deep [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6">
      {children}
    </div>
  );
}
