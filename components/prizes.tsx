import { PARTNERS, PRIZES, PRIZE_CATEGORIES } from "@/lib/content";
import { Section, Tag } from "./ui/section";
import { PartnerLogo } from "./ui/partner-logo";
import { CheckIcon, HourglassIcon, MedalIcon } from "./ui/icons";

/**
 * One card per prize: who gives it, the headline, a few facts. A prize
 * still being finalized says so on its card. Nothing is added up into a
 * prize pool: memberships, scholarships and credits are not cash and do
 * not sum.
 */
export function Prizes() {
  return (
    <Section id="prizes" title="Prizes" lede="Committed by our partners so far. More are announced as sponsors confirm.">
      <ul className="grid gap-4 md:grid-cols-3">
        {PRIZES.map((prize) => {
          const partner = PARTNERS.find((p) => p.id === prize.partner);
          const pending = prize.status === "pending";
          return (
            <li
              key={prize.title}
              className={`reveal flex flex-col rounded-3xl p-7 sm:p-8 ${
                pending ? "border border-dashed border-ink-3/40" : "border border-line bg-card shadow-[0_24px_50px_-40px_rgb(15_24_40/0.4)]"
              }`}
            >
              <div className="flex h-8 items-center justify-between gap-3">
                {partner ? (
                  <span className="flex items-center">
                    <PartnerLogo logo={partner.logo} scale={(partner.logoScale ?? 1) * 0.86} area={3400} />
                    <span className="sr-only">{prize.from}</span>
                  </span>
                ) : (
                  <span className="text-[1.0625rem] font-bold font-stretch-[112.5%]">{prize.from}</span>
                )}
                {pending ? (
                  <Tag tone="pending">
                    <HourglassIcon className="size-3.5" />
                    Being finalized
                  </Tag>
                ) : (
                  <Tag tone="lamp">Confirmed</Tag>
                )}
              </div>

              <p className="mt-9 text-[0.9375rem] font-medium text-ink-3">{prize.title}</p>
              <p className="mt-1.5 text-[2.125rem] leading-none font-bold font-stretch-125% tracking-[-0.035em] sm:text-[2.375rem]">
                {prize.figure}
              </p>

              <ul className="mt-7 flex flex-col gap-3 border-t border-line pt-6">
                {prize.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-[0.9375rem] leading-snug text-ink-2">
                    <CheckIcon className="mt-0.5 size-4 text-lamp-deep" />
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <p className="flex shrink-0 items-center gap-2.5 font-semibold">
          <MedalIcon className="size-5 text-lamp-deep" />
          Judging categories
        </p>
        <ul className="flex flex-wrap gap-2">
          {PRIZE_CATEGORIES.map((category) => (
            <li key={category} className="rounded-full border border-line-2 bg-card px-3.5 py-1.5 text-[0.875rem] font-medium text-ink-2">
              {category}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
