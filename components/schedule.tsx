import type { CSSProperties } from "react";
import { SCHEDULE, type Phase } from "@/lib/content";
import { EVENT } from "@/lib/event";
import { OutArrow } from "./ui/button";
import { CodeIcon, DoorIcon, MoonIcon, PinIcon } from "./ui/icons";

/* Each part of the day gets its own sky: pale morning, warm afternoon,
   and the night the day ends in. */
const SKY = [
  {
    panel: "bg-morning text-ink",
    time: "text-lamp-deep",
    note: "text-ink-3",
    line: "border-ink/10",
    glyph: (
      <svg viewBox="0 0 56 40" fill="none" className="h-10 w-14">
        <path d="M12 30a10 10 0 0 1 20 0Z" className="fill-lamp" />
        <path d="M2 30h52M22 14v3M11 18l2 2M33 18l-2 2" className="stroke-ink/60" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    panel: "bg-afternoon text-ink",
    time: "text-lamp-deep",
    note: "text-ink-3",
    line: "border-ink/10",
    glyph: (
      <svg viewBox="0 0 56 40" fill="none" className="h-10 w-14">
        <circle cx="34" cy="14" r="7.5" className="fill-lamp" />
        <path d="M2 34h52M34 1.5v3M34 23.5v3M21.5 14h3M43.5 14h3M25 5l2 2M43 5l-2 2" className="stroke-ink/60" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    panel: "night text-moon",
    time: "text-lamp",
    note: "text-moon-3",
    line: "border-moon/12",
    glyph: (
      <svg viewBox="0 0 56 40" fill="none" className="h-10 w-14">
        <path d="M38 6a10 10 0 1 0 9 14 8 8 0 0 1-9-14Z" className="fill-lamp" />
        <circle cx="14" cy="10" r="1.4" className="fill-moon" />
        <circle cx="22" cy="22" r="1" className="fill-moon/70" />
        <circle cx="8" cy="24" r="1" className="fill-moon/60" />
        <path d="M2 34h52" className="stroke-moon/40" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

/**
 * The draft schedule, morning to night. The summary keeps the two spans
 * apart: the day runs 8:30 AM to 11 PM, building runs 10 AM to 9 PM.
 */
export function Schedule() {
  const target = EVENT.date.confirmed ? "" : ", our target date";

  return (
    <section id="schedule" aria-labelledby="schedule-title" className="border-t border-line bg-fog">
      <div className="wrap py-24 sm:py-32">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <h2 id="schedule-title" className="heading">
              The day
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-3">
              A draft schedule for {EVENT.date.label}
              {target}. Times may shift a little, and meals and workshops
              depend on sponsors.
            </p>
          </div>

          <dl className="grid grid-cols-[auto_1fr] items-start gap-x-6 gap-y-3.5 text-[0.9375rem] lg:col-span-5 lg:pb-1.5">
            <dt className="flex items-center gap-2.5 text-ink-3">
              <DoorIcon className="size-[1.125rem] text-lamp-deep" />
              Doors
            </dt>
            <dd className="font-semibold">8:30 AM</dd>
            <dt className="flex items-center gap-2.5 text-ink-3">
              <CodeIcon className="size-[1.125rem] text-lamp-deep" />
              Hacking
            </dt>
            <dd className="font-semibold">
              {EVENT.hours.hacking}, {EVENT.hours.hackingHours} hours
            </dd>
            <dt className="flex items-center gap-2.5 text-ink-3">
              <MoonIcon className="size-[1.125rem] text-lamp-deep" />
              Home by
            </dt>
            <dd className="font-semibold">11 PM, no overnight</dd>
            <dt className="flex items-center gap-2.5 text-ink-3">
              <PinIcon className="size-[1.125rem] text-lamp-deep" />
              Where
            </dt>
            <dd>
              {EVENT.venue.map && EVENT.venue.address ? (
                <a
                  href={EVENT.venue.map}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 font-semibold underline decoration-lamp decoration-2 underline-offset-[0.22em] hover:decoration-[0.3em]"
                >
                  {EVENT.venue.place}, {EVENT.venue.address.split(",")[0]}
                  <OutArrow />
                  <span className="sr-only">(map, opens in a new tab)</span>
                </a>
              ) : (
                <>
                  <span className="font-semibold">{EVENT.venue.label}</span>
                  <span className="block text-ink-3">{EVENT.venue.note}</span>
                </>
              )}
            </dd>
          </dl>
        </div>

        <div className="mt-14 grid gap-4 sm:mt-16 lg:grid-cols-3">
          {SCHEDULE.map((phase, i) => (
            <PhasePanel key={phase.label} phase={phase} sky={SKY[i]} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* Panels side by side arrive one after another: each starts its rise a
   little later in the scroll. */
const STAGGER = ["0%", "6%", "12%"];

function PhasePanel({ phase, sky, index }: { phase: Phase; sky: (typeof SKY)[number]; index: number }) {
  return (
    <section
      aria-labelledby={`phase-${phase.label}`}
      className={`reveal flex flex-col rounded-[1.75rem] p-7 sm:p-8 ${sky.panel}`}
      style={{ "--reveal-from": STAGGER[index], "--reveal-to": `${26 + index * 6}%` } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 id={`phase-${phase.label}`} className="text-[1.625rem] leading-none font-bold font-stretch-125% tracking-[-0.03em]">
            {phase.label}
          </h3>
          <p className={`mt-2 text-[0.875rem] font-medium ${sky.note}`}>{phase.window}</p>
        </div>
        <span aria-hidden="true" className="sun-up -mt-1">
          {sky.glyph}
        </span>
      </div>

      <ol className="mt-7">
        {phase.slots.map((slot) => (
          <li key={`${slot.time}-${slot.title}`} className={`reveal border-t py-4 last:pb-0 ${sky.line}`}>
            <p className={`text-[0.8125rem] font-semibold font-stretch-[112.5%] tracking-[0.04em] tabular-nums uppercase ${sky.time}`}>
              {slot.time}
            </p>
            <p className="mt-1 text-[1.0625rem] leading-snug font-semibold">{slot.title}</p>
            <p className={`mt-1 text-[0.9375rem] leading-relaxed ${sky.note}`}>{slot.note}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
