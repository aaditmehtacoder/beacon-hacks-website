import type { ReactNode } from "react";
import { Reveal } from "./reveal";

type Props = {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Section shell: eyebrow, title, optional lede, then the body. */
export function Section({
  id,
  eyebrow,
  title,
  lede,
  aside,
  children,
  className = "",
}: Props) {
  return (
    <section
      id={id}
      className={`wrap scroll-mt-24 py-20 sm:py-28 ${className}`}
    >
      <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">{eyebrow}</p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-4 text-4xl leading-[1.05] sm:text-5xl lg:text-[3.5rem]">
              {title}
            </h2>
          </Reveal>
          {lede ? (
            <Reveal delay={110}>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
                {lede}
              </p>
            </Reveal>
          ) : null}
        </div>
        {aside ? <Reveal delay={140}>{aside}</Reveal> : null}
      </div>
      {children}
    </section>
  );
}
