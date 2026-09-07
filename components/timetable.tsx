"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { SCHEDULE } from "@/lib/content";
import { EVENT } from "@/lib/event";
import { Reveal } from "./ui/reveal";

export function Timetable() {
  const railRef = useRef<HTMLDivElement>(null);

  /* The rail fills as the timetable passes through the viewport. */
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 70%", "end 60%"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const height = useTransform(fill, (v) => `${v * 100}%`);

  return (
    <section id="timetable" className="wrap scroll-mt-24 py-20 sm:py-28">
      <Reveal>
        <p className="eyebrow">Timetable</p>
      </Reveal>
      <Reveal delay={60}>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-4xl leading-[1.05] sm:text-5xl">
            One day, nine moments.
          </h2>
          <span className="label text-ink-3">{EVENT.hoursLabel}</span>
        </div>
      </Reveal>

      <div ref={railRef} className="relative mt-14 pl-8 sm:pl-0">
        {/* the rail */}
        <div
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[4px] w-px bg-line sm:left-[calc(8rem+4px)]"
        >
          <motion.div
            style={{ height }}
            className="w-px origin-top bg-beacon"
          />
        </div>

        <div className="flex flex-col gap-12">
          {SCHEDULE.map((phase) => (
            <div key={phase.label}>
              <Reveal className="mb-5 flex items-baseline gap-3 sm:pl-[9.5rem]">
                <span className="label text-ink">{phase.label}</span>
                <span className="label text-ink-4">{phase.window}</span>
              </Reveal>

              <ol className="flex flex-col">
                {phase.slots.map((slot, i) => (
                  <Reveal key={slot.title} delay={i * 60}>
                    <li className="group relative grid grid-cols-1 items-baseline gap-x-6 gap-y-1 py-4 sm:grid-cols-[6.5rem_1.5rem_1fr]">
                      <span className="label order-2 text-ink-3 sm:order-1 sm:text-right">
                        {slot.time}
                      </span>

                      <span
                        aria-hidden="true"
                        className="absolute left-0 order-1 sm:static sm:order-2"
                      >
                        <span className="mt-1 block size-[9px] rounded-full border border-line-hard bg-paper transition-colors duration-300 group-hover:border-beacon group-hover:bg-beacon" />
                      </span>

                      <div className="order-3">
                        <h3 className="text-lg leading-snug">{slot.title}</h3>
                        <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-3">
                          {slot.note}
                        </p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
