import { CONFIRMED_PRIZES, PARTICIPANT_PERKS, PENDING_OFFERS, PRIZE_CATEGORIES, type Offer } from "@/lib/content";
import { Section, Tag } from "./ui/section";
import { Spark } from "./ui/button";

/**
 * Three kinds of thing, kept apart on purpose: prizes partners have
 * committed in writing, offers still being finalised, and the categories we
 * plan to judge. Nothing is added up into a prize pool: memberships,
 * scholarships and credits are not cash and do not sum.
 */
export function Prizes() {
  return (
    <Section
      id="prizes"
      title="Prizes and perks."
      lede="What partners have committed in writing, kept separate from offers we are still finalizing. More prizes are announced as sponsors confirm."
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-7">
        <div className="lg:col-span-7">
          <article className="brut p-6 sm:p-8">
            <CardHead title="For the winners" tag={<Tag tone="accent">Confirmed</Tag>} />
            <ul className="mt-2">
              {CONFIRMED_PRIZES.map((offer) => (
                <OfferRow key={offer.title} offer={offer} />
              ))}
            </ul>
          </article>
          <div className="mt-10">
            <div className="flex flex-col gap-1.5 border-b-2 border-ink pb-3">
              <h3 className="text-[1.625rem] leading-none tracking-[-0.035em]">Judging categories</h3>
              <p className="text-[0.9375rem] text-ink-3">Planned. Prizes for each are announced as sponsors confirm.</p>
            </div>
            <ol className="grid sm:grid-cols-2">
              {PRIZE_CATEGORIES.map((category) => (
                <li
                  key={category}
                  className="flex items-center gap-3 border-b border-line py-3.5 pr-4 font-display text-[1.0625rem] font-bold tracking-[-0.01em]"
                >
                  <Spark className="size-3 text-beacon-deep" />
                  {category}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:col-span-5">
          <article className="brut p-6 sm:p-8">
            <CardHead title="For every participant" tag={<Tag tone="accent">Confirmed</Tag>} />
            <ul className="mt-2">
              {PARTICIPANT_PERKS.map((offer) => (
                <OfferRow key={offer.title} offer={offer} compact />
              ))}
            </ul>
          </article>

          <article className="border-2 border-dashed border-ink-3 p-6 sm:p-8">
            <CardHead title="Being finalized" tag={<Tag tone="pending">Pending</Tag>} />
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-3">
              Offered in writing. These become confirmed once the redemption
              details are settled.
            </p>
            <ul className="mt-1">
              {PENDING_OFFERS.map((offer) => (
                <OfferRow key={offer.title} offer={offer} compact />
              ))}
            </ul>
          </article>
        </div>
      </div>

    </Section>
  );
}

function CardHead({ title, tag }: { title: string; tag: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-4">
      <h3 className="text-[1.625rem] leading-none tracking-[-0.035em]">{title}</h3>
      {tag}
    </div>
  );
}

function OfferRow({ offer, compact = false }: { offer: Offer; compact?: boolean }) {
  return (
    <li className={`border-b border-line last:border-b-0 ${compact ? "py-5" : "py-6"} last:pb-0`}>
      <p className="meta text-beacon-deep">
        {offer.from} <span aria-hidden="true">·</span> {offer.who}
      </p>
      <p
        className={`mt-2 font-display leading-tight font-extrabold tracking-[-0.03em] text-ink ${
          compact ? "text-[1.3125rem]" : "text-[1.75rem]"
        }`}
      >
        {offer.title}
      </p>
      <p className="mt-2 leading-relaxed text-ink-3">{offer.detail}</p>
      {offer.conditions ? (
        <p className="mt-2 text-[0.9375rem] leading-relaxed font-medium text-ink-2">{offer.conditions}</p>
      ) : null}
    </li>
  );
}
