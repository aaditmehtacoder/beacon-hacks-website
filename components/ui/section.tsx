import type { ReactNode } from "react";

type Props = {
  id: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Sits beside the lede on wide screens: a link or a small action. */
  aside?: ReactNode;
  /** The fog page, or the slightly recessed band. */
  tone?: "fog" | "band";
  className?: string;
  children: ReactNode;
};

/**
 * A day section: the heading, a short lede under it, then the content.
 * Sections on the same ground are parted by a hairline.
 */
export function Section({ id, title, lede, aside, tone = "fog", className = "", children }: Props) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`border-t border-line ${tone === "band" ? "bg-fog-2/60" : "bg-fog"} ${className}`}
    >
      <div className="wrap py-24 sm:py-32">
        <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-3xl">
            <h2 id={`${id}-title`} className="heading">
              {title}
            </h2>
            {lede ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-3">{lede}</p> : null}
          </div>
          {aside ? <div className="shrink-0 lg:pb-1.5">{aside}</div> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

/** A small status pill: confirmed, being finalized, planned. */
export function Tag({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "lamp" | "pending" | "night";
  children: ReactNode;
}) {
  const style =
    tone === "lamp"
      ? "border-lamp/70 bg-lamp-wash text-lamp-deep"
      : tone === "pending"
        ? "border-dashed border-ink-3/60 text-ink-2"
        : tone === "night"
          ? "border-moon/25 text-moon-2"
          : "border-transparent bg-fog-2 text-ink-2";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.75rem] leading-5 font-semibold font-stretch-[112.5%] tracking-[0.02em] whitespace-nowrap ${style}`}
    >
      {children}
    </span>
  );
}
