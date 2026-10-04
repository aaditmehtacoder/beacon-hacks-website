import { SCHEDULE } from "@/lib/content";
import { EVENT } from "@/lib/event";
import { Tag } from "./ui/section";

/**
 * The draft schedule and the venue, on the dark band. The summary keeps
 * the two spans apart: the day runs 8:30 AM to 11 PM, building runs 10 AM
 * to 9 PM.
 */
export function Schedule() {
  return (
    <section
      id="schedule"
      aria-labelledby="schedule-title"
      className="on-dark relative overflow-hidden border-y-2 border-ink bg-band text-band-ink"
    >
      <span
        aria-hidden="true"
        className="outline-word absolute -bottom-10 -left-4 text-[min(17vw,12.5rem)] [--word-stroke:rgba(251,246,236,0.08)]"
      >
        8:30 → 11
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-52 -right-60 size-[30rem] rounded-full border-[3.25rem] border-beacon/[0.08]"
      />

      <div className="wrap relative grid gap-14 py-20 sm:py-28 lg:grid-cols-12 lg:gap-10 lg:py-32">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <h2 id="schedule-title" className="display-xl">
              Schedule.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-band-muted">
              A draft schedule for {EVENT.date.label}, our target date. Times may
              shift once the venue confirms its hours, and meals and workshops
              depend on sponsors.
            </p>

            <dl className="mt-9 border-t-2 border-band-line">
              {[
                ["The day", EVENT.hours.label],
                ["Hacking", `${EVENT.hours.hacking}, ${EVENT.hours.hackingHours} hours`],
                ["Overnight", "No. Everyone heads home by 11 PM."],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-band-line py-4">
                  <dt className="meta pt-1 text-beacon">{k}</dt>
                  <dd className="font-display text-[1.0625rem] font-bold">{v}</dd>
                </div>
              ))}
            </dl>

            <div id="venue" className="mt-10 scroll-mt-28 border-2 border-band-line p-6">
              <p className="meta text-beacon">Venue</p>
              <h3 className="mt-2 text-[1.75rem] leading-none tracking-[-0.035em]">{EVENT.venue.label}</h3>
              <p className="mt-3 leading-relaxed text-band-muted">
                A host on the Peninsula has offered their space. We will share the
                venue name and address once their facilities team approves in
                writing, and applicants hear first.
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-band-muted">
                The planned space: one floor for about 100 people, breakout rooms,
                parking, and a train station within walking distance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-12 lg:col-span-7">
          {SCHEDULE.map((phase) => (
            <section key={phase.label} aria-labelledby={`phase-${phase.label}`}>
              <h3
                id={`phase-${phase.label}`}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-band-line pb-3"
              >
                <span className="text-[1.75rem] leading-none tracking-[-0.035em]">{phase.label}</span>
                <span className="meta text-band-muted">{phase.window}</span>
              </h3>
              <ol>
                {phase.slots.map((slot) => (
                  <li
                    key={slot.title}
                    className="grid grid-cols-[5.75rem_1fr] items-baseline gap-x-4 border-b border-band-line py-5 transition-[background-color,padding] duration-200 hover:bg-band-ink/[0.03] sm:grid-cols-[7rem_1fr] sm:gap-x-6 sm:hover:pl-2"
                  >
                    <span className="font-display text-[0.875rem] font-extrabold tracking-[0.06em] text-beacon tabular-nums uppercase">
                      {slot.time}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-display text-[1.25rem] leading-tight font-extrabold tracking-[-0.025em] sm:text-[1.375rem]">
                        {slot.title}
                        {slot.planned ? <Tag tone="dark">Planned</Tag> : null}
                      </p>
                      <p className="text-[0.9375rem] leading-relaxed text-band-muted">{slot.note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
