import Link from "next/link";
import { FAQS } from "@/lib/content";
import { EVENT, mailto } from "@/lib/event";
import { DiscordIcon } from "./ui/beacon-mark";

/** Native disclosures: keyboard and screen reader support for free, and
    they open and close without JavaScript. */
export function Faq() {
  const discord = EVENT.social.discord;

  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-line bg-paper">
      <div className="wrap py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl">
          <h2 id="faq-title" className="display-xl">
            FAQ
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-3">
            The short version for students, parents and sponsors.
          </p>

          <div className="mt-10 flex flex-col gap-3.5">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group border-2 border-ink bg-card shadow-[5px_5px_0_var(--color-ink)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[6px_7px_0_var(--color-ink)]"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-5 px-5 py-4.5 font-display text-[1.0625rem] font-extrabold tracking-[-0.015em] sm:px-6 sm:text-[1.125rem]">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-beacon transition-transform duration-200 group-open:rotate-45"
                  >
                    <svg viewBox="0 0 12 12" className="size-3" fill="none">
                      <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <div className="border-t-2 border-ink px-5 pt-4 pb-5 sm:px-6">
                  <p className="leading-relaxed text-ink-3">{item.a}</p>
                  {item.link ? (
                    <p className="mt-3">
                      {item.link.href === "mailto" ? (
                        <a href={mailto("Sponsoring Beacon Hacks", undefined, EVENT.email.sponsors)} className="link">
                          {item.link.label}
                        </a>
                      ) : (
                        <Link href={item.link.href} className="link">
                          {item.link.label}
                        </Link>
                      )}
                    </p>
                  ) : null}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t-2 border-ink pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="leading-relaxed text-ink-2">
              Still wondering? Write to{" "}
              <a href={mailto("A question about Beacon Hacks")} className="link">
                {EVENT.email.team}
              </a>
              .
            </p>
            {discord ? (
              <a
                href={discord}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2.5 rounded-full border-2 border-ink px-4 py-2 font-display text-[0.9375rem] font-extrabold transition-colors hover:bg-ink hover:text-paper"
              >
                <DiscordIcon className="size-5" />
                Join the Discord
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
