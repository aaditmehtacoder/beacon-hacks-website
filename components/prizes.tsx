import { PARTNERS, PRIZES_AND_PERKS, PRIZE_CATEGORIES, type Perk } from "@/lib/content";
import { Section } from "./ui/section";
import { PartnerLogo } from "./ui/partner-logo";

const GROUPS = [
  { kind: "prize", title: "For the winners" },
  { kind: "perk", title: "For every builder" },
] as const;

/**
 * Who gives what, in a few words. The amounts and terms are each
 * sponsor's to announce, so the page names the prize and leaves it there.
 */
export function Prizes() {
  return (
    <Section
      id="prizes"
      title="Prizes and perks"
      lede="More are announced as sponsors confirm."
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {GROUPS.map((group) => (
          <div key={group.kind}>
            <h3 className="border-b border-ink pb-4 text-[1.25rem] leading-tight font-bold font-stretch-[118%] tracking-[-0.02em]">
              {group.title}
            </h3>
            <ul>
              {PRIZES_AND_PERKS.filter((p) => p.kind === group.kind).map((perk) => (
                <Row key={perk.from} perk={perk} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-14 max-w-4xl leading-relaxed text-ink-3">
        <span className="font-semibold text-ink">Planned judging categories: </span>
        {PRIZE_CATEGORIES.join(", ").replace(/, ([^,]*)$/, " and $1")}.
      </p>
    </Section>
  );
}

function Row({ perk }: { perk: Perk }) {
  const partner = PARTNERS.find((p) => p.id === perk.partner);
  return (
    <li className="reveal grid grid-cols-[9.5rem_1fr] items-center gap-6 border-b border-line py-6 sm:grid-cols-[11rem_1fr]">
      <span className="flex h-8 items-center">
        {partner ? (
          <>
            <PartnerLogo logo={partner.logo} scale={(partner.logoScale ?? 1) * 0.86} area={3400} />
            <span className="sr-only">{perk.from}</span>
          </>
        ) : (
          <span className="text-[1.125rem] font-bold font-stretch-[112.5%] tracking-[-0.01em]">{perk.from}</span>
        )}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[1.0625rem] leading-snug font-semibold">{perk.label}</span>
        {perk.status === "pending" ? <span className="text-[0.875rem] text-ink-3">Being finalized</span> : null}
      </span>
    </li>
  );
}
