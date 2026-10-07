import type { ReactNode } from "react";
import { PACKAGES, PARTNERS, VENUE_SPONSOR, type Package, type Partner } from "@/lib/content";
import { EVENT, mailto } from "@/lib/event";
import { AnchorButton, Arrow } from "./ui/button";
import { Section } from "./ui/section";
import { PartnerLogo } from "./ui/partner-logo";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/* Wider tiers get fewer, larger places. */
const GRID: Record<Package["id"], string> = {
  presenting: "grid-cols-1",
  partner: "grid-cols-3",
  community: "grid-cols-2 sm:grid-cols-4",
  supporter: "grid-cols-3 sm:grid-cols-6",
};
const HEIGHT: Record<Package["id"], string> = {
  presenting: "h-28",
  partner: "h-24",
  community: "h-20",
  supporter: "h-20",
};

/**
 * The sponsor wall: the venue, then one row per cash tier from the top,
 * with open places drawn dashed (each one an email about that tier), then
 * the in-kind partners. A cash sponsor's logo fills the first open place of
 * its tier. No tier is exclusive, so the places are an invitation, not a cap.
 */
export function Sponsors() {
  const tiers = [...PACKAGES].reverse();

  return (
    <Section
      id="sponsors"
      tone="band"
      title="Sponsors"
      lede="Free for every student, because companies back it. Open places are dashed, and no tier is exclusive."
      aside={
        <AnchorButton
          href={mailto("Sponsoring Beacon Hacks", undefined, EVENT.email.sponsors)}
          variant="ink"
          size="lg"
          className="group"
        >
          Email the team
          <Arrow />
        </AnchorButton>
      }
    >
      <div className="flex flex-col gap-12">
        {VENUE_SPONSOR ? (
          <Tier label="Venue sponsor">
            <a
              href={VENUE_SPONSOR.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-5 rounded-3xl border border-line bg-card px-8 py-9 transition-[border-color,box-shadow] duration-300 hover:border-line-2 hover:shadow-[0_24px_50px_-34px_rgb(15_24_40/0.4)] sm:flex-row sm:items-center sm:justify-between sm:px-10"
            >
              <PartnerLogo logo={VENUE_SPONSOR.logo} area={20000} />
              <span className="text-[0.9375rem] text-ink-3">
                {VENUE_SPONSOR.status === "pending" ? "Being finalized" : VENUE_SPONSOR.address}
              </span>
              <span className="sr-only">{VENUE_SPONSOR.name} (opens in a new tab)</span>
            </a>
          </Tier>
        ) : null}

        {tiers.map((pkg) => {
          const sponsors = PARTNERS.filter((p) => p.tier === pkg.id);
          const places = Math.max(pkg.slots, sponsors.length);
          return (
            <Tier key={pkg.id} label={pkg.name} price={usd(pkg.priceUsd)} note={pkg.benefits.join(" · ")}>
              <ul className={`grid gap-3 ${GRID[pkg.id]}`}>
                {Array.from({ length: places }, (_, i) =>
                  sponsors[i] ? (
                    <li key={sponsors[i].id}>
                      <LogoCard partner={sponsors[i]} className={HEIGHT[pkg.id]} />
                    </li>
                  ) : (
                    <li key={`open-${i}`}>
                      <OpenPlace pkg={pkg} first={i === sponsors.length} className={HEIGHT[pkg.id]} />
                    </li>
                  ),
                )}
              </ul>
            </Tier>
          );
        })}

        <Tier label="In kind" note="Products, credits and services that make the day possible">
          <ul className="grid gap-3 sm:grid-cols-3">
            {PARTNERS.filter((p) => !p.tier).map((partner) => (
              <li key={partner.id}>
                <LogoCard partner={partner} className="h-36" caption />
              </li>
            ))}
          </ul>
        </Tier>
      </div>

      <p className="mt-12 max-w-3xl text-[0.9375rem] leading-relaxed text-ink-3">
        Each tier includes everything in the one below it. No exclusivity, and we
        never share participant contact information.
      </p>
    </Section>
  );
}

function Tier({ label, price, note, children }: { label: string; price?: string; note?: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-4 flex flex-col gap-1 lg:flex-row lg:items-baseline lg:justify-between lg:gap-10">
        <h3 className="text-[1rem] font-semibold">
          {label}
          {price ? <span className="font-normal text-ink-3"> · {price}</span> : null}
        </h3>
        {note ? <p className="text-[0.875rem] leading-snug text-ink-3 lg:text-right">{note}</p> : null}
      </div>
      {children}
    </div>
  );
}

function LogoCard({ partner, className, caption = false }: { partner: Partner; className: string; caption?: boolean }) {
  return (
    <a
      href={partner.website}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-card px-6 transition-[border-color,box-shadow] duration-300 hover:border-line-2 hover:shadow-[0_20px_40px_-30px_rgb(15_24_40/0.4)] ${className}`}
    >
      <span className="flex h-10 items-center transition-transform duration-300 ease-out-quart group-hover:scale-[1.03]">
        <PartnerLogo logo={partner.logo} scale={partner.logoScale} area={4400} />
      </span>
      {caption ? <span className="text-[0.875rem] text-ink-3">{partner.role}</span> : null}
      <span className="sr-only">{partner.name} (opens in a new tab)</span>
    </a>
  );
}

/* An open place. Only the first in a row is a tab stop and is read out;
   the rest are the same link again, for the pointer. */
function OpenPlace({ pkg, first, className }: { pkg: Package; first: boolean; className: string }) {
  const subject = `Beacon Hacks sponsorship: ${pkg.name} (${usd(pkg.priceUsd)})`;
  const body = `Hi Beacon Hacks team,\n\nWe are interested in the ${pkg.name} package (${usd(pkg.priceUsd)}).\n\nCompany:\nContact name:\n`;
  const big = pkg.id === "presenting" || pkg.id === "partner";
  return (
    <a
      href={mailto(subject, body, EVENT.email.sponsors)}
      tabIndex={first ? undefined : -1}
      aria-hidden={first ? undefined : true}
      className={`group flex items-center justify-center rounded-2xl border border-dashed border-ink-3/35 text-ink-3 transition-[border-color,background-color,color] duration-200 hover:border-ink hover:bg-card hover:text-ink ${className}`}
    >
      {big ? (
        <span className="text-[0.9375rem] font-semibold">
          {pkg.id === "presenting" ? "Become the presenting partner" : "Sponsor us"}
        </span>
      ) : (
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
      {first ? (
        <span className="sr-only">{big ? ` (${pkg.name} tier, ${usd(pkg.priceUsd)})` : `Sponsor at the ${pkg.name} tier, ${usd(pkg.priceUsd)}`}</span>
      ) : null}
    </a>
  );
}
