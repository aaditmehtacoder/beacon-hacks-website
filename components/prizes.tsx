import { PARTNERS, PRIZES_AND_PERKS, type Perk } from "@/lib/content";
import { Section } from "./ui/section";
import { PartnerLogo } from "./ui/partner-logo";

const GROUPS = [
  { kind: "prize", title: "For the winners" },
  { kind: "perk", title: "For every builder" },
] as const;

/**
 * Who gives, and no more: each sponsor's logo, for the winners or for every
 * builder. What each one gives goes to participants before the day.
 */
export function Prizes() {
  return (
    <Section
      id="prizes"
      title="Prizes and perks"
      lede="Prizes for the winners and perks for every builder. Participants get the details before the day."
    >
      <div className="flex flex-col gap-12">
        {GROUPS.map((group) => (
          <div key={group.kind}>
            <h3 className="border-b border-ink pb-4 text-[1.25rem] leading-tight font-bold font-stretch-[118%] tracking-[-0.02em]">
              {group.title}
            </h3>
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-6 pt-8 sm:gap-x-12">
              {PRIZES_AND_PERKS.filter((p) => p.kind === group.kind).map((perk) => (
                <Giver key={perk.from} perk={perk} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Giver({ perk }: { perk: Perk }) {
  const partner = PARTNERS.find((p) => p.id === perk.partner);
  return (
    <li className="reveal flex flex-col gap-1">
      <span className="flex h-10 items-center">
        {partner ? (
          <>
            <PartnerLogo logo={partner.logo} scale={partner.logoScale} area={3400} />
            <span className="sr-only">{perk.from}</span>
          </>
        ) : (
          <span className="text-[1.125rem] font-bold font-stretch-[112.5%] tracking-[-0.01em]">{perk.from}</span>
        )}
      </span>
      {perk.status === "pending" ? <span className="text-[0.8125rem] text-ink-3">Being finalized</span> : null}
    </li>
  );
}
