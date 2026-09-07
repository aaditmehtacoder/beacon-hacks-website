import { STATS } from "@/lib/content";
import { Reveal } from "./ui/reveal";

export function Stats() {
  return (
    <section aria-label="Where things stand" className="wrap py-16 sm:py-20">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <Reveal
            key={stat.label}
            delay={i * 70}
            className="bg-paper px-6 py-8 sm:px-7 sm:py-10"
          >
            <div className="font-display text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
              {stat.value}
            </div>
            <div className="label mt-3 text-ink-2">{stat.label}</div>
            <div className="mt-1.5 text-sm text-ink-3">{stat.note}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
