import { NotifyButton } from "./notify/notify-button";
import { Reveal } from "./ui/reveal";
import { EVENT } from "@/lib/event";

export function Closing() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-ink py-28 text-paper sm:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(250,248,244,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,248,244,0.05)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(90%_70%_at_50%_50%,black,transparent_75%)]" />
        <div className="absolute top-1/2 left-1/2 size-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(242,161,0,0.22),transparent_62%)] blur-xl" />
      </div>

      <div className="wrap relative text-center">
        <Reveal>
          <h2 className="text-[clamp(2.75rem,8vw,6rem)] leading-[0.94] font-bold tracking-[-0.04em]">
            Build what
            <br />
            <span className="text-beacon">lights the way.</span>
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <p className="label mt-8 text-paper/60">
            Target {EVENT.targetDateLabel} · {EVENT.venue.label} · Not open yet
          </p>
        </Reveal>
        <Reveal delay={140}>
          <div className="mt-10 flex justify-center">
            <NotifyButton
              size="lg"
              className="border-beacon bg-beacon text-beacon-ink hover:bg-beacon-hi hover:border-beacon-hi hover:text-beacon-ink"
            >
              Get notified →
            </NotifyButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
