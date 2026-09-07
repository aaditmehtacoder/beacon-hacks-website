import Link from "next/link";
import { EVENT } from "@/lib/event";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper-warm">
      <div className="wrap flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-beacon"
            />
            <span className="font-display text-sm font-bold tracking-tight">
              BEACON HACKS
            </span>
            <span className="label ml-3 text-ink-4">
              © 2026 · {EVENT.venue.label}
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-3">
            Every photograph on this site is stock photography of other
            people&rsquo;s events and workspaces. None of it shows the Beacon
            venue, and no company shown is a sponsor.
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-[0.9375rem] sm:text-right">
          <Link href="#status" className="text-ink-2 hover:text-beacon-deep">
            Build status
          </Link>
          <Link
            href="/code-of-conduct"
            className="text-ink-2 hover:text-beacon-deep"
          >
            Code of conduct
          </Link>
          <Link
            href={`mailto:${EVENT.email.team}`}
            className="text-ink-2 hover:text-beacon-deep"
          >
            {EVENT.email.team}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
