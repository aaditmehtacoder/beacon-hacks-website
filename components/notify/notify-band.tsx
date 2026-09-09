import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { NotifyButton } from "./notify-button";

export function NotifyBand() {
  return (
    <section id="notify" className="wrap scroll-mt-24 py-20 sm:py-28">
      <Reveal variant="tilt">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-card px-7 py-12 text-center sm:px-14 sm:py-16">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--glow-soft),transparent_62%)]"
          />

          <div className="relative">
            <p className="label inline-flex items-center gap-2 rounded-full border border-line bg-paper px-2.5 py-1 text-ink-3">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-beacon" />
              Early applications open
            </p>
            <h2 className="mx-auto mt-6 max-w-xl text-4xl leading-[1.05] sm:text-5xl">
              Apply early.
            </h2>
            <p className="mx-auto mt-5 max-w-lg leading-relaxed text-ink-2">
              Two minutes, six questions. You go in the queue now and hear the
              day spots are confirmed. Mentors, judges and sponsors can leave an
              email instead.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LinkButton href="/apply" variant="beacon" size="lg">
                Apply now →
              </LinkButton>
              <NotifyButton size="lg" variant="ghost">
                Not a student? Get notified
              </NotifyButton>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
