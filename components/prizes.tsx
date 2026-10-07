import type { ReactNode } from "react";
import { CONFIRMED_PRIZES, PARTNERS, PENDING_OFFERS, PRIZE_CATEGORIES, type Offer } from "@/lib/content";
import { Section, Tag } from "./ui/section";
import { PartnerLogo } from "./ui/partner-logo";
import { HourglassIcon, MedalIcon, TrophyIcon } from "./ui/icons";

/**
 * Kept apart on purpose: prizes partners have committed in writing, offers
 * still being finalised, and the categories we plan to judge. Nothing is
 * added up into a prize pool: memberships, scholarships and credits are
 * not cash and do not sum.
 */
export function Prizes() {
  return (
    <Section
      id="prizes"
      title="Prizes"
      lede="What partners have committed in writing so far. More prizes are announced as sponsors confirm."
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <GroupHead icon={<TrophyIcon />} title="For the winners" tag={<Tag tone="lamp">Confirmed</Tag>} />
          <ul>
            {CONFIRMED_PRIZES.map((offer) => {
              const partner = PARTNERS.find((p) => p.name === offer.from);
              return (
                <li key={offer.title} className="border-b border-line py-8 last:border-b-0">
                  {partner ? (
                    <p className="mb-5">
                      <PartnerLogo logo={partner.logo} scale={(partner.logoScale ?? 1) * 0.8} area={4200} />
                      <span className="sr-only">{offer.from}</span>
                    </p>
                  ) : (
                    <p className="mb-3 font-semibold">{offer.from}</p>
                  )}
                  <p className="text-[1.5rem] leading-tight font-bold font-stretch-[118%] tracking-[-0.025em]">{offer.title}</p>
                  <p className="mt-1 text-[0.9375rem] font-medium text-lamp-deep">{offer.who}</p>
                  <p className="mt-3 max-w-2xl leading-relaxed text-ink-3">{offer.detail}</p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-12 lg:col-span-5">
          <div className="rounded-3xl border border-dashed border-ink-3/40 p-7 sm:p-8">
            <GroupHead icon={<HourglassIcon />} title="Being finalized" tag={<Tag tone="pending">Pending</Tag>} bare />
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-3">
              Offered in writing. These are confirmed once the redemption details are settled.
            </p>
            <ul className="mt-2">
              {PENDING_OFFERS.map((offer) => (
                <PendingRow key={offer.title} offer={offer} />
              ))}
            </ul>
          </div>

          <div>
            <GroupHead icon={<MedalIcon />} title="Judging categories" />
            <p className="mt-4 text-[0.9375rem] text-ink-3">Planned. Prizes for each are announced as sponsors confirm.</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {PRIZE_CATEGORIES.map((category) => (
                <li
                  key={category}
                  className="rounded-full border border-line-2 bg-card px-3.5 py-1.5 text-[0.9375rem] font-medium text-ink-2"
                >
                  {category}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}

function GroupHead({ icon, title, tag, bare = false }: { icon: ReactNode; title: string; tag?: ReactNode; bare?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${bare ? "" : "border-b border-ink pb-4"}`}>
      <h3 className="flex items-center gap-3 text-[1.25rem] leading-tight font-bold font-stretch-[118%] tracking-[-0.02em]">
        <span className="grid size-9 place-items-center rounded-full bg-lamp-wash text-lamp-deep ring-1 ring-lamp/50 [&_svg]:size-5">
          {icon}
        </span>
        {title}
      </h3>
      {tag}
    </div>
  );
}

function PendingRow({ offer }: { offer: Offer }) {
  return (
    <li className="border-b border-line py-5 last:border-b-0 last:pb-0">
      <p className="text-[0.875rem] font-medium text-ink-3">
        {offer.from} <span aria-hidden="true">·</span> {offer.who}
      </p>
      <p className="mt-1 text-[1.125rem] leading-snug font-semibold text-ink">{offer.title}</p>
      <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-3">{offer.detail}</p>
      {offer.conditions ? <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-2">{offer.conditions}</p> : null}
    </li>
  );
}
