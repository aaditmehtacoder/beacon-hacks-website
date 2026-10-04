import type { ReactNode } from "react";

export type Tone = "paper" | "warm" | "yellow" | "dark";

const TONE: Record<Tone, string> = {
  paper: "bg-paper text-ink",
  warm: "bg-paper-warm dots text-ink border-y border-line",
  yellow: "bg-beacon dots-ink text-ink border-y-2 border-ink",
  dark: "on-dark bg-band dots-dark text-band-ink",
};

const LEDE: Record<Tone, string> = {
  paper: "text-ink-3",
  warm: "text-ink-3",
  yellow: "text-ink-2",
  dark: "text-band-muted",
};

type Props = {
  id: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Sits under the lede: a link or a small action. */
  aside?: ReactNode;
  tone?: Tone;
  /** A huge outlined word behind the heading, for texture. */
  word?: string;
  children: ReactNode;
};

/**
 * Section shell: a huge heading on the left and the lede on the right on
 * wide screens, stacked on phones. The tone sets the band: cream, dotted
 * cream, dotted yellow or the dark night.
 */
export function Section({ id, title, lede, aside, tone = "paper", word, children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`relative overflow-hidden ${TONE[tone]}`}>
      {word ? (
        <span
          aria-hidden="true"
          className={`outline-word absolute -top-3 -right-4 text-[min(19vw,13.5rem)] sm:-top-6 ${
            tone === "dark" ? "[--word-stroke:rgba(251,246,236,0.09)]" : "[--word-stroke:rgba(27,23,18,0.11)]"
          }`}
        >
          {word}
        </span>
      ) : null}
      <div className="wrap relative py-20 sm:py-28 lg:py-32">
        <div className="mb-12 grid gap-7 sm:mb-16 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id={`${id}-title`} className="display-xl lg:col-span-7">
            {title}
          </h2>
          {lede || aside ? (
            <div className="flex flex-col gap-5 lg:col-span-5 lg:pb-2">
              {lede ? <p className={`max-w-xl text-lg leading-relaxed ${LEDE[tone]}`}>{lede}</p> : null}
              {aside}
            </div>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

/** A small status pill: confirmed, pending, planned, in kind. */
export function Tag({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "accent" | "pending" | "dark";
  children: ReactNode;
}) {
  const style =
    tone === "accent"
      ? "border-ink bg-beacon text-ink"
      : tone === "pending"
        ? "border-dashed border-ink-3 bg-transparent text-ink-2"
        : tone === "dark"
          ? "border-band-line bg-transparent text-band-ink"
          : "border-ink bg-card text-ink";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-2.5 py-0.5 font-display text-[0.75rem] leading-5 font-extrabold tracking-[0.08em] whitespace-nowrap uppercase ${style}`}
    >
      {children}
    </span>
  );
}
