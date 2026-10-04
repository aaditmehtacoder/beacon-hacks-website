import Link from "next/link";
import { BeaconSticker } from "@/components/ui/beacon-mark";

/** The slim header shared by the organiser-only pages. */
export function AdminHeader({ label }: { label: string }) {
  return (
    <header className="border-b border-line bg-paper">
      <div className="wrap flex h-16 items-center gap-5">
        <Link href="/" className="flex items-center gap-2.5">
          <BeaconSticker className="size-8" />
          <span className="font-display text-[1.3125rem] leading-none font-extrabold tracking-[-0.035em]">Beacon Hacks</span>
        </Link>
        <span className="label hidden border-l border-line pl-5 text-ink-3 sm:inline">{label}</span>
        <nav className="ml-auto flex items-center gap-5 text-[0.9375rem] text-ink-3">
          <Link href="/admin" className="hover:text-ink">
            Signups
          </Link>
          <Link href="/outreachdashboard" className="hover:text-ink">
            Outreach
          </Link>
          <Link href="/" className="hover:text-ink">
            Back to the site
          </Link>
        </nav>
      </div>
    </header>
  );
}
