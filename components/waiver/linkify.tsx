import { Fragment } from "react";

/* **Bold**, a web address, or an email address, inside running text. */
const PATTERN = /(\*\*[^*]+\*\*|https?:\/\/[^\s)]*[^\s).,;:]|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

/**
 * Agreement text with its web and email addresses as blue links, and
 * **marked** words in bold. Web links open in a new tab, so a half-filled
 * form is never lost.
 */
export function Linkify({ text }: { text: string }) {
  const parts = text.split(PATTERN);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
        if (part.startsWith("**")) {
          return (
            <strong key={i} className="font-bold text-ink">
              {part.slice(2, -2)}
            </strong>
          );
        }
        const web = part.startsWith("http");
        return (
          <a
            key={i}
            href={web ? part : `mailto:${part}`}
            {...(web ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="font-medium break-words text-link-blue underline decoration-link-blue/40 underline-offset-2 transition-colors hover:decoration-link-blue"
          >
            {part}
            {web ? <span className="sr-only"> (opens in a new tab)</span> : null}
          </a>
        );
      })}
    </>
  );
}
