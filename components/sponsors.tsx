import { IN_KIND, PACKAGES, PARTNERS, SPONSOR_VALUE, type Partner } from "@/lib/content";
import { EVENT, mailto } from "@/lib/event";
import { AnchorButton, Arrow, Spark } from "./ui/button";
import { Tag } from "./ui/section";
import { PartnerLogo } from "./ui/partner-logo";
import { NotifyLink } from "./notify/notify-button";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/**
 * Sponsorship and the partners backing the day. Four cash packages, each
 * listing only what is new at that level; an in-kind option for anything
 * that is not money; inquiry links that open an email with the package in
 * the subject. There is no payment flow on purpose: every sponsorship
 * starts as a conversation. Cash sponsors and in-kind partners are shown
 * apart, and nobody is shown at a paid tier they did not buy.
 */
export function Sponsors() {
  const { targetUsd, raisedUsd } = EVENT.budget;
  const cash = PARTNERS.filter((p) => p.form === "Cash");
  const inKind = PARTNERS.filter((p) => p.form === "In kind");

  return (
    <section id="sponsors" aria-labelledby="sponsors-title" className="relative overflow-hidden border-y border-line bg-paper-warm dots">
      <span
        aria-hidden="true"
        className="outline-word absolute -top-4 -right-6 text-[min(19vw,13.5rem)] [--word-stroke:rgba(27,23,18,0.08)] sm:-top-8"
      >
        BACK US
      </span>

      <div className="wrap relative py-20 sm:py-28 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <h2 id="sponsors-title" className="display-xl">
              Sponsor Beacon Hacks.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-3">
              Help keep a full day of building free for Bay Area high school
              students. The day’s budget is {usd(targetUsd)} for food, the venue
              and prizes.{" "}
              {raisedUsd > 0
                ? `${usd(raisedUsd)} in cash is committed so far.`
                : "No cash sponsors have joined yet, so early support goes a long way."}
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5 lg:pb-2">
            <CtaCard
              href={mailto("Sponsoring Beacon Hacks", undefined, EVENT.email.sponsors)}
              kicker="Interested in sponsoring?"
              title="Email the team"
              yellow
            />
            <CtaCard
              href={mailto("Beacon Hacks in-kind support", undefined, EVENT.email.sponsors)}
              kicker="Food, prizes, tools or services?"
              title="Support in kind"
            />
          </div>
        </div>

        <ul className="mt-16 grid gap-x-8 gap-y-6 sm:mt-20 sm:grid-cols-3">
          {SPONSOR_VALUE.map((point) => (
            <li key={point.title} className="flex gap-3">
              <Spark className="mt-1.5 size-3.5 text-beacon-deep" />
              <div>
                <h3 className="text-[1.25rem] leading-tight tracking-[-0.03em]">{point.title}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-3">{point.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div id="packages" className="relative isolate mt-16 scroll-mt-28 sm:mt-20">
          <span
            aria-hidden="true"
            className="absolute -inset-x-3 top-6 -bottom-4 -z-10 -rotate-[0.6deg] bg-beacon/30 sm:-right-4 sm:left-6"
          />
          <ol className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PACKAGES.map((pkg, i) => {
              const previous = PACKAGES[i - 1];
              const subject = `Beacon Hacks sponsorship: ${pkg.name} (${usd(pkg.priceUsd)})`;
              const body = `Hi Beacon Hacks team,\n\nWe are interested in the ${pkg.name} package (${usd(pkg.priceUsd)}).\n\nCompany:\nContact name:\n`;
              return (
                <li key={pkg.id} className="brut brut-hover relative flex flex-col overflow-hidden px-6 pt-9 pb-6">
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-2.5 border-b-2 border-ink bg-beacon" />
                  <h3 className="meta text-beacon-deep">{pkg.name}</h3>
                  <p className="mt-3 font-display text-[3.25rem] leading-[0.9] font-extrabold tracking-[-0.055em] tabular-nums">
                    {usd(pkg.priceUsd)}
                  </p>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-3">{pkg.pitch}</p>

                  <div className="mt-5 flex-1 border-t border-line pt-5">
                    <p className="meta text-ink-2">{previous ? `Everything in ${previous.name}, plus` : "Includes"}</p>
                    <ul className="mt-3 flex flex-col gap-2.5">
                      {pkg.benefits.map((benefit) => (
                        <li key={benefit} className="flex gap-2.5 text-[0.9375rem] leading-snug text-ink">
                          <Spark className="mt-1 size-3 text-beacon-deep" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <AnchorButton href={mailto(subject, body, EVENT.email.sponsors)} variant="ghost" className="mt-7 w-full">
                    Inquire about {pkg.name}
                  </AnchorButton>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="mt-10 max-w-3xl text-[0.9375rem] leading-relaxed text-ink-3">
          Packages carry no exclusivity, and we never share participant contact
          information with sponsors.
        </p>

        <div className="mt-16 sm:mt-20">
          <div className="flex flex-col gap-2 border-b-2 border-ink pb-4 sm:flex-row sm:items-end sm:justify-between">
            <h3 className="text-[2rem] leading-none tracking-[-0.04em]">Backing the day</h3>
            <p className="text-[0.9375rem] text-ink-3">Every partner so far gives in kind. Listed alphabetically.</p>
          </div>

          {cash.length ? <PartnerGrid partners={cash} /> : null}
          <PartnerGrid partners={inKind} />

          {cash.length ? null : (
            <div className="mt-6 flex flex-col gap-4 border-2 border-dashed border-ink-3 p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="leading-relaxed text-ink-2">
                <span className="font-display font-extrabold text-ink">Cash sponsors: open.</span>{" "}
                Packages start at {usd(PACKAGES[0].priceUsd)}.
              </p>
              <a href="#packages" className="link shrink-0">
                See the packages
              </a>
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-5 border-2 border-ink bg-card/80 p-6 shadow-[5px_5px_0_rgba(27,23,18,0.14)] sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="leading-relaxed text-ink-2">
              <span className="font-display font-extrabold text-ink">In kind works too.</span>{" "}
              {IN_KIND.summary} {IN_KIND.body}
            </p>
          </div>
          <AnchorButton
            href={mailto("Beacon Hacks in-kind support", undefined, EVENT.email.sponsors)}
            variant="beacon"
            className="shrink-0 self-start lg:self-auto"
          >
            Offer in-kind support
          </AnchorButton>
        </div>

        <p className="mt-10 leading-relaxed text-ink-3">
          Questions first? Write to{" "}
          <a href={mailto("Sponsoring Beacon Hacks", undefined, EVENT.email.sponsors)} className="link">
            {EVENT.email.sponsors}
          </a>
          . Not ready yet? <NotifyLink>Get updates by email</NotifyLink>.
        </p>
      </div>
    </section>
  );
}

function CtaCard({ href, kicker, title, yellow = false }: { href: string; kicker: string; title: string; yellow?: boolean }) {
  return (
    <a
      href={href}
      className={`group relative flex min-h-24 items-center justify-between gap-6 border-[3px] border-ink px-6 py-5 text-ink shadow-[8px_8px_0_var(--color-ink)] transition-[transform,box-shadow] duration-200 hover:-translate-x-0.5 hover:-translate-y-1 hover:rotate-0 hover:shadow-[11px_12px_0_var(--color-ink)] ${
        yellow ? "-rotate-1 bg-beacon" : "rotate-[0.6deg] bg-card"
      }`}
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.875rem] font-semibold text-ink-2">{kicker}</span>
        <span className="font-display text-[1.5rem] leading-tight font-extrabold tracking-[-0.03em]">{title}</span>
      </span>
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-paper transition-transform duration-200 group-hover:rotate-12">
        <Arrow className="size-5" />
      </span>
    </a>
  );
}

function PartnerGrid({ partners }: { partners: Partner[] }) {
  if (!partners.length) return null;
  return (
    <ul className="mt-6 grid gap-5 sm:grid-cols-3">
      {partners.map((partner) => (
        <li key={partner.id}>
          <a
            href={partner.website}
            target="_blank"
            rel="noopener noreferrer"
            className="brut brut-hover group flex h-full flex-col gap-5 p-6"
          >
            <span className="flex h-14 items-center">
              {/* The name is in the link text right below, so the logo
                  itself is decorative to a screen reader. */}
              <PartnerLogo logo={partner.logo} scale={partner.logoScale} />
            </span>
            <span className="mt-auto flex flex-col gap-2 border-t border-line pt-4">
              <span className="flex items-center justify-between gap-3 font-display text-[1.125rem] font-extrabold tracking-[-0.02em] text-ink">
                {partner.name}
                <Arrow className="size-4 text-ink-3" />
                <span className="sr-only">(opens in a new tab)</span>
              </span>
              <span className="text-[0.9375rem] leading-snug text-ink-3">{partner.gives}</span>
              <span className="mt-1">
                <Tag>{partner.form}</Tag>
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
