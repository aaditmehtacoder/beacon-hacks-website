import Link from "next/link";
import type { ReactNode } from "react";
import { BeaconMark } from "@/components/ui/beacon-mark";

/** The slim header on the organizers' page, on the night like the site's. */
export function AdminHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="night border-b border-moon/10">
      <div className="wrap flex h-16 items-center gap-4">
        <Link href="/" className="-mx-1.5 flex shrink-0 items-center gap-2.5 rounded-full px-1.5 py-1">
          <BeaconMark className="size-7 text-lamp" />
          <span className="text-[1.0625rem] leading-none font-bold font-stretch-125% tracking-[-0.02em]">Beacon Hacks</span>
        </Link>
        <span className="border-l border-moon/15 pl-4 text-[0.9375rem] text-moon-3">Admin</span>
        <div className="ml-auto flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}
