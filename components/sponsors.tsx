import { PACKAGES, PARTNERS, VENUE_SPONSOR } from "@/lib/content";
import { EVENT, mailto } from "@/lib/event";
import { AnchorButton, Arrow, OutArrow } from "./ui/button";
import { Section, Tag } from "./ui/section";
import { PartnerLogo } from "./ui/partner-logo";
import { HourglassIcon } from "./ui/icons";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/**
 * Who backs the day, and how to join them. The venue sponsor first, then
 * the in-kind partners, then four cash packages, each listing only what is
 * new at that level. Every inquiry opens an email with the package in the
 * subject: there is no payment flow, and every sponsorship starts as a
 * conversation.
 */
export function Sponsors() {
  return (
    <Section
      id="sponsors"
      tone="band"
      title="Sponsors"
      lede="Beacon Hacks is free for every student because companies back it. Thank you to the partners making the day happen."
    >
      {VENUE_SPONSOR ? (
        <div>
          <p className="kicker text-lamp-deep">Venue sponsor</p>
          {VENUE_SPONSOR.line ? <p className="mt-2 text-ink-2">{VENUE_SPONSOR.line}</p> : null}
          <a
            href={VENUE_SPONSOR.website}
            target="_blank"
            rel="noopener noreferrer"
            className={`group mt-5 flex flex-col gap-6 rounded-3xl border border-line bg-card p-8 transition-[border-color,box-shadow] duration-300 hover:border-line-2 hover:shadow-[0_24px_50px_-30px_rgb(15_24_40/0.35)] sm:flex-row sm:justify-between sm:p-10 ${
              VENUE_SPONSOR.address ? "sm:items-end" : "sm:items-center"
            }`}
          >
            <span className="flex flex-col gap-4">
              <PartnerLogo logo={VENUE_SPONSOR.logo} area={22000} />
              {VENUE_SPONSOR.address ? (
                <span className="text-[0.9375rem] font-medium text-ink-3">{VENUE_SPONSOR.address}</span>
              ) : null}
            </span>
            <span className="flex items-center gap-4">
              {VENUE_SPONSOR.status === "pending" ? (
                <Tag tone="pending">
                  <HourglassIcon className="size-3.5" />
                  Being finalized
                </Tag>
              ) : null}
              <span className="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink-2 group-hover:text-ink">
                {VENUE_SPONSOR.name}
                <OutArrow />
              </span>
            </span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      ) : null}

      <div className="mt-14">
        <p className="kicker text-ink-3">In-kind partners</p>
        <ul className="mt-5 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
          {PARTNERS.map((partner) => (
            <li key={partner.id} className="bg-card">
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col gap-8 p-8 transition-colors duration-300 hover:bg-fog/60"
              >
                <span className="flex h-12 items-center">
                  <PartnerLogo logo={partner.logo} scale={partner.logoScale} area={5600} />
                </span>
                <span className="mt-auto flex items-end justify-between gap-4">
                  <span className="flex flex-col gap-1">
                    <span className="font-semibold text-ink">{partner.name}</span>
                    <span className="text-[0.9375rem] leading-snug text-ink-3">{partner.gives}</span>
                  </span>
                  <OutArrow className="mb-1 text-ink-3 group-hover:text-ink" />
                  <span className="sr-only">(opens in a new tab)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div id="packages" className="mt-24 scroll-mt-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-2xl">
            <h3 className="text-[2rem] leading-none font-bold font-stretch-125% tracking-[-0.035em] sm:text-[2.5rem]">
              Become a sponsor
            </h3>
            <p className="mt-5 text-lg leading-relaxed text-ink-3">
              Cash sponsorship pays for meals, prizes and supplies, and keeps
              the day free for every student. Packages carry no exclusivity,
              and we never share participant contact information.
            </p>
          </div>
          <AnchorButton
            href={mailto("Sponsoring Beacon Hacks", undefined, EVENT.email.sponsors)}
            variant="ink"
            size="lg"
            className="group shrink-0 self-start lg:self-auto"
          >
            Email the team
            <Arrow />
          </AnchorButton>
        </div>

        <ol className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
          {PACKAGES.map((pkg, i) => {
            const previous = PACKAGES[i - 1];
            const subject = `Beacon Hacks sponsorship: ${pkg.name} (${usd(pkg.priceUsd)})`;
            const body = `Hi Beacon Hacks team,\n\nWe are interested in the ${pkg.name} package (${usd(pkg.priceUsd)}).\n\nCompany:\nContact name:\n`;
            return (
              <li key={pkg.id} className="flex flex-col bg-card p-7 sm:p-8">
                <h4 className="text-[1rem] font-semibold text-ink-2">{pkg.name}</h4>
                <p className="mt-2 text-[2.75rem] leading-none font-bold font-stretch-125% tracking-[-0.04em] tabular-nums">
                  {usd(pkg.priceUsd)}
                </p>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-3">{pkg.pitch}</p>

                <div className="mt-6 flex-1 border-t border-line pt-5">
                  <p className="text-[0.8125rem] font-semibold text-ink-3">
                    {previous ? `Everything in ${previous.name}, plus` : "Includes"}
                  </p>
                  <ul className="mt-3 flex flex-col gap-2.5">
                    {pkg.benefits.map((benefit) => (
                      <li key={benefit} className="flex gap-2.5 text-[0.9375rem] leading-snug text-ink">
                        <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-0.5 size-4 shrink-0" fill="none">
                          <path d="M3.5 8.5l3 3 6-7" className="stroke-lamp-deep" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={mailto(subject, body, EVENT.email.sponsors)}
                  className="group mt-7 inline-flex w-fit items-center gap-1.5 font-semibold text-ink underline decoration-lamp decoration-2 underline-offset-[0.22em] hover:decoration-[0.3em]"
                >
                  Inquire about {pkg.name}
                  <Arrow />
                </a>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 max-w-3xl leading-relaxed text-ink-3">
          <span className="font-semibold text-ink">In kind works too.</span> Food,
          equipment, prizes, software and services are welcome at any size, and
          we agree on recognition together.{" "}
          <a href={mailto("Beacon Hacks in-kind support", undefined, EVENT.email.sponsors)} className="link text-ink">
            Offer in-kind support
          </a>
        </p>
      </div>
    </Section>
  );
}
