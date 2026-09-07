import Image from "next/image";
import { STEPS } from "@/lib/content";
import { Section } from "./ui/section";
import { Reveal } from "./ui/reveal";

export function Day() {
  return (
    <Section
      id="day"
      eyebrow="How it goes"
      title="Show up alone. Leave with something you built."
      lede="Three moves, in order. Nothing about the day assumes you have done this before."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <Reveal key={step.num} delay={i * 90}>
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-line-hard hover:shadow-[0_20px_50px_-24px_rgba(22,21,15,0.4)]">
              <div className="relative aspect-3/2 overflow-hidden bg-paper-warm">
                <Image
                  src={step.photo}
                  alt={step.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute top-4 left-4 grid size-9 place-items-center rounded-full bg-paper/90 label text-[0.6875rem] font-semibold backdrop-blur">
                  {step.num}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl">{step.title}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-ink-2">
                  {step.body}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {step.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink-2"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
