import Link from "next/link";
import { EVENT, mailto } from "@/lib/event";
import { BeaconSticker, DiscordIcon } from "./ui/beacon-mark";
import { Lamp } from "./ui/lamp";
import { Arrow, LinkButton } from "./ui/button";
import { NotifyInline } from "./notify/notify-inline";

/**
 * The end of every page. On the home page it opens with the closing call
 * on the dark band: the lamp again, the application, and the updates list.
 * The Discord button floats on every page once the invite is set.
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
    { label: "Apply early", href: "/apply" },
    { label: "Code of conduct", href: "/code-of-conduct" },
  ];

  return (
    <>
      {closing ? (
        <section
          aria-labelledby="closing-title"
          className="on-dark relative overflow-hidden border-t-2 border-ink bg-band text-band-ink dots-dark"
        >
          <span
            aria-hidden="true"
            className="outline-word absolute -right-6 -bottom-8 text-[min(22vw,15rem)] [--word-stroke:rgba(251,246,236,0.09)]"
          >
            APPLY
          </span>
          <div className="wrap relative grid gap-14 py-20 sm:py-28 lg:grid-cols-12 lg:items-end lg:gap-10 lg:py-32">
            <div className="lg:col-span-7">
              <p className="meta text-beacon">{EVENT.date.label} · target date</p>
              <h2
                id="closing-title"
                className="mt-5 text-[clamp(3.25rem,8vw,6.5rem)] leading-[0.9] font-extrabold tracking-[-0.05em]"
              >
                See you in Belmont
                <Lamp id="closing" onDark length={2.6} />
              </h2>
              <p className="mt-7 max-w-lg text-lg leading-relaxed text-band-muted">
                Early applications are open. We will confirm the date and the
                venue as soon as our host signs off, and applicants hear first.
              </p>
              <LinkButton href="/apply" variant="lamp" size="lg" className="group mt-9">
                Apply early
                <Arrow />
              </LinkButton>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <NotifyInline />
            </div>
          </div>
        </section>
      ) : null}

      <footer className="border-t-2 border-ink bg-paper text-ink">
        <div className="wrap flex flex-col gap-12 py-14 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <Link href={home ? "#top" : "/"} className="inline-flex w-fit items-center gap-2.5 rounded-full">
              <BeaconSticker className="size-9 -rotate-6" />
              <span className="font-display text-[1.5rem] leading-none font-extrabold tracking-[-0.04em]">
                Beacon Hacks
              </span>
            </Link>
            <p className="text-[0.9375rem] text-ink-3">
              {EVENT.date.label} · target date · {EVENT.venue.label}
            </p>
          </div>

          <nav aria-label="Footer" className="lg:max-w-md">
            <ul className="flex flex-wrap gap-x-5 gap-y-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/") && !link.href.startsWith("/#") ? (
                    <Link href={link.href} className="font-display text-[0.9375rem] font-bold text-ink-2 hover:text-ink hover:underline hover:decoration-beacon hover:decoration-[0.18em] hover:underline-offset-4">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="font-display text-[0.9375rem] font-bold text-ink-2 hover:text-ink hover:underline hover:decoration-beacon hover:decoration-[0.18em] hover:underline-offset-4">
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
                    className="font-display text-[0.9375rem] font-bold text-ink-2 hover:text-ink hover:underline hover:decoration-beacon hover:decoration-[0.18em] hover:underline-offset-4"
                  >
                    Discord
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>

          <a
            href={mailto("A question about Beacon Hacks")}
            className="group flex w-fit shrink-0 -rotate-[1.5deg] items-center gap-5 border-[3px] border-ink bg-beacon px-5 py-3.5 shadow-[6px_6px_0_var(--color-ink)] transition-[transform,box-shadow] duration-200 hover:rotate-0 hover:shadow-[8px_9px_0_var(--color-ink)]"
          >
            <span className="flex flex-col">
              <span className="meta text-ink-2">Questions?</span>
              <span className="font-display text-[1.0625rem] font-extrabold tracking-[-0.02em]">{EVENT.email.team}</span>
            </span>
            <Arrow className="size-5" />
          </a>
        </div>

        <div className="wrap flex flex-col gap-1.5 border-t border-line py-6 text-[0.875rem] text-ink-3 sm:flex-row sm:justify-between">
          <p>© 2026 Beacon Hacks · {EVENT.venue.label}</p>
          <p>Run by high school students, for high school students.</p>
        </div>
      </footer>

      {discord ? (
        <a
          href={discord}
          target="_blank"
          rel="noopener noreferrer"
          className="no-print fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-full border-2 border-ink bg-[#5865f2] text-white shadow-[4px_4px_0_var(--color-ink)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-ink)] sm:right-6 sm:bottom-6"
        >
          <DiscordIcon className="size-7" />
          <span className="sr-only">Join the Beacon Hacks Discord (opens in a new tab)</span>
        </a>
      ) : null}
    </>
  );
}
