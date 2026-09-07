import { GATES, STATE_LABEL, type GateState } from "@/lib/status";
import { EVENT } from "@/lib/event";
import { Reveal } from "./ui/reveal";
import { LockIcon } from "./ui/locked";

const DOT: Record<GateState, string> = {
  done: "bg-beacon border-beacon",
  active: "bg-beacon/25 border-beacon",
  blocked: "bg-paper-deep border-line-hard",
};

const CHIP: Record<GateState, string> = {
  done: "border-beacon bg-beacon-wash text-beacon-deep",
  active: "border-beacon bg-beacon-wash text-beacon-deep",
  blocked: "border-line bg-card text-ink-3",
};

/**
 * The honest status of the event, stated before anything else on the page
 * makes a claim. Every "locked" thing elsewhere points back here.
 */
export function StatusBoard() {
  const raised = EVENT.budget.raisedUsd;
  const target = EVENT.budget.targetUsd;

  return (
    <section
      id="status"
      className="scroll-mt-24 border-b border-line bg-paper-warm py-20 sm:py-24"
    >
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
          <div>
            <Reveal>
              <p className="eyebrow">Where Beacon is right now</p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="mt-4 text-4xl leading-[1.05] sm:text-5xl">
                Nothing here is pretending.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={110}>
            <p className="text-lg leading-relaxed text-ink-2">
              Beacon Hacks is being built in the open. Three things have to be
              true before it is a real event, and none of them are done.
              Anything on this site that depends on them is marked locked rather
              than stated as fact.
            </p>
          </Reveal>
        </div>

        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {GATES.map((gate, i) => (
            <Reveal key={gate.id} delay={i * 80}>
              <li className="flex h-full flex-col rounded-2xl border border-line bg-card p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={`size-2.5 rounded-full border ${DOT[gate.state]}`}
                    />
                    <span className="label text-ink-3">{gate.order}</span>
                  </span>
                  <span
                    className={`label inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${CHIP[gate.state]}`}
                  >
                    {gate.state === "blocked" ? <LockIcon /> : null}
                    {STATE_LABEL[gate.state]}
                  </span>
                </div>

                <h3 className="mt-5 text-xl">{gate.title}</h3>
                <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-2">
                  {gate.detail}
                </p>
                <p className="label mt-5 border-t border-line-soft pt-4 text-ink-4">
                  {gate.unlocks}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={120}>
          <div className="mt-6 rounded-2xl border border-line bg-card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <span className="label text-ink-3">Raised toward the day</span>
              <span className="font-display text-lg font-semibold tabular-nums">
                ${raised.toLocaleString()}{" "}
                <span className="font-normal text-ink-3">
                  of ${target.toLocaleString()}
                </span>
              </span>
            </div>
            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-paper-deep"
              role="img"
              aria-label={`$${raised.toLocaleString()} raised of a $${target.toLocaleString()} target`}
            >
              <div
                className="h-full rounded-full bg-beacon"
                style={{ width: `${Math.max(1.5, (raised / target) * 100)}%` }}
              />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              Sponsor outreach has not started. That number updates on this page
              as money is actually committed, not pledged.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
