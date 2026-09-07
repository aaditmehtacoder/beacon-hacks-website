import { FAQS } from "@/lib/content";
import { Section } from "./ui/section";
import { Reveal } from "./ui/reveal";

export function Faq() {
  return (
    <Section id="faq" eyebrow="FAQ" title="Questions, answered.">
      <div className="border-t border-line">
        {FAQS.map((item, i) => (
          <Reveal key={item.q} delay={i * 40}>
            <details className="group border-b border-line" open={i === 0}>
              <summary className="flex cursor-pointer items-start gap-4 py-6 pr-2 transition-colors hover:text-beacon-deep sm:gap-6">
                <span className="label mt-1.5 shrink-0 text-ink-4">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 font-display text-lg font-medium tracking-tight sm:text-xl">
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className="relative mt-2 size-3.5 shrink-0 text-ink-3 transition-transform duration-300 group-open:rotate-45 group-open:text-beacon-deep"
                >
                  <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
                  <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current" />
                </span>
              </summary>
              <div className="grid grid-rows-[1fr] pb-7 sm:pl-[3.5rem]">
                <p className="max-w-2xl leading-relaxed text-ink-2">{item.a}</p>
              </div>
            </details>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
