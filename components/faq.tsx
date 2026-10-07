import Link from "next/link";
import { FAQS } from "@/lib/content";
import { EVENT, mailto } from "@/lib/event";
import { DiscordIcon } from "./ui/beacon-mark";

/** Native disclosures: keyboard and screen reader support for free, and
    they open and close without JavaScript. */
export function Faq() {
  const discord = EVENT.social.discord;

  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-line bg-fog">
      <div className="wrap grid gap-12 py-24 sm:py-32 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 id="faq-title" className="heading">
              Questions
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-3">
              The short version for students, parents and sponsors.
            </p>
            <p className="mt-6 leading-relaxed text-ink-3">
              Still wondering? Write to{" "}
              <a href={mailto("A question about Beacon Hacks")} className="link text-ink">
                {EVENT.email.team}
              </a>
            </p>
            {discord ? (
              <a
                href={discord}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-fit items-center gap-2.5 rounded-full border border-line-2 bg-card px-4 py-2 text-[0.9375rem] font-semibold transition-colors hover:border-ink"
              >
                <DiscordIcon className="size-5" />
                Join the Discord
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : null}
          </div>
        </div>

        <div className="border-t border-line lg:col-span-8">
          {FAQS.map((item) => (
            <details key={item.q} className="group border-b border-line">
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-6 text-[1.125rem] leading-snug font-semibold font-stretch-[112.5%] tracking-[-0.01em] transition-colors hover:text-ink-2 sm:text-[1.25rem]">
                {item.q}
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full border border-line-2 text-ink-2 transition-[transform,background-color,border-color] duration-300 ease-out-quart group-open:rotate-45 group-open:border-lamp group-open:bg-lamp group-open:text-ink"
                >
                  <svg viewBox="0 0 12 12" className="size-3" fill="none">
                    <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <div className="max-w-2xl pb-7">
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
      </div>
    </section>
  );
}
