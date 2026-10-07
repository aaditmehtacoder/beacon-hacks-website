import Link from "next/link";
import { EVENT, mailto } from "@/lib/event";
import { BeaconMark, DiscordIcon } from "./ui/beacon-mark";
import { MailIcon } from "./ui/icons";
import { Arrow } from "./ui/button";
import { ApplyButton } from "./apply/apply-button";
import { NotifyInline } from "./notify/notify-inline";
import { Shore, Sky } from "./night-scene";

/**
 * The end of every page. On the home page it opens with the closing call
 * back on the night: the application, and the updates list for everyone
 * who is not applying. The Discord button floats on every page once the
 * invite is set.
 */
export function SiteFooter({ closing = false, home = false }: { closing?: boolean; home?: boolean }) {
  const discord = EVENT.social.discord;
  const at = (anchor: string) => (home ? anchor : `/${anchor}`);

  const links: { label: string; href: string }[] = [
    { label: "About", href: at("#about") },
    { label: "Tracks", href: at("#tracks") },
    { label: "Prizes", href: at("#prizes") },
    { label: "Schedule", href: at("#schedule") },
    { label: "Judges", href: at("#judges") },
    { label: "Sponsors", href: at("#sponsors") },
    { label: "FAQ", href: at("#faq") },
    { label: "Apply", href: "/apply" },
    { label: "Code of conduct", href: "/code-of-conduct" },
  ];

  return (
    <>
      {closing ? (
        <section aria-labelledby="closing-title" className="night relative isolate overflow-hidden">
          <Sky />
          <Shore id="closing" className="inset-x-0 bottom-0 h-[15rem] sm:h-[19rem] lg:h-[24rem]" />

          <div className="wrap relative pt-24 pb-[17rem] sm:pt-32 sm:pb-[21rem] lg:pb-40">
            <h2
              id="closing-title"
              className="max-w-[12ch] text-[clamp(3rem,8vw,6.5rem)] leading-[0.9] font-extrabold font-stretch-125% tracking-[-0.045em]"
            >
              See you in Belmont
            </h2>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-moon-2">
              Applications are open and take about two minutes.{" "}
              Spots are confirmed once {EVENT.applications.until}, and everyone
              who applied hears first.
            </p>
            <ApplyButton size="lg" className="group mt-9">
              Apply
              <Arrow />
            </ApplyButton>

            <div id="updates" className="mt-16 max-w-2xl scroll-mt-28 border-t border-moon/12 pt-10">
              <NotifyInline />
            </div>
          </div>
        </section>
      ) : null}

      <footer className="night border-t border-moon/10">
        <div className="wrap flex flex-col gap-10 py-14 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-3">
            <Link href={home ? "#top" : "/"} className="inline-flex w-fit items-center gap-2.5 rounded-full">
              <BeaconMark className="size-7 text-lamp" />
              <span className="text-[1.125rem] leading-none font-bold font-stretch-125% tracking-[-0.02em]">Beacon Hacks</span>
            </Link>
            <p className="text-[0.9375rem] text-moon-3">
              {EVENT.date.label}
              {EVENT.date.confirmed ? "" : " (target date)"}
              <br />
              {EVENT.venue.place ? `${EVENT.venue.place}, ` : ""}
              {EVENT.venue.label}
            </p>
            <a
              href={mailto("A question about Beacon Hacks")}
              className="group inline-flex w-fit items-center gap-2 text-[0.9375rem] font-semibold text-moon transition-colors hover:text-lamp"
            >
              <MailIcon className="size-[1.125rem] text-lamp" />
              {EVENT.email.team}
            </a>
          </div>

          <nav aria-label="Footer" className="lg:max-w-md">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-3">
              {links.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/") && !link.href.startsWith("/#") ? (
                    <Link href={link.href} className="text-[0.9375rem] text-moon-2 transition-colors hover:text-moon">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-[0.9375rem] text-moon-2 transition-colors hover:text-moon">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
              {discord ? (
                <li>
                  <a
                    href={discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.9375rem] text-moon-2 transition-colors hover:text-moon"
                  >
                    Discord
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>
        </div>

        <div className="wrap flex flex-col gap-1.5 border-t border-moon/10 py-6 text-[0.875rem] text-moon-3 sm:flex-row sm:justify-between">
          <p>© 2026 Beacon Hacks</p>
          <p>Run by high school students, for high school students.</p>
        </div>
      </footer>

      {discord ? (
        <a
          href={discord}
          target="_blank"
          rel="noopener noreferrer"
          className="no-print fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-full bg-[#5865f2] text-white shadow-[0_12px_30px_-10px_rgb(88_101_242/0.7)] transition-transform duration-200 hover:-translate-y-0.5 sm:right-6 sm:bottom-6"
        >
          <DiscordIcon className="size-7" />
          <span className="sr-only">Join the Beacon Hacks Discord (opens in a new tab)</span>
        </a>
      ) : null}
    </>
  );
}
