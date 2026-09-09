import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminPassword, isAdmin } from "@/lib/admin-auth";
import { describeBackend, listEntries } from "@/lib/store";
import { BeaconMark } from "@/components/ui/beacon-mark";
import { LoginForm } from "@/components/admin/login-form";
import { Dashboard } from "@/components/admin/dashboard";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Admin() {
  const jar = await cookies();
  const signedIn = isAdmin(jar.get(ADMIN_COOKIE)?.value);

  return (
    <>
      <header className="border-b border-line bg-paper/85 backdrop-blur-xl">
        <div className="wrap flex h-16 items-center gap-5">
          <Link href="/" className="flex items-center gap-2.5">
            <BeaconMark className="size-6 text-beacon drop-shadow-[0_0_6px_rgba(255,178,40,0.55)]" />
            <span className="font-display text-[0.9375rem] font-bold tracking-tight">
              BEACON HACKS
            </span>
          </Link>
          <span className="label hidden border-l border-line pl-5 text-ink-3 sm:inline">
            Admin
          </span>
          <Link href="/" className="ml-auto text-[0.9375rem] text-ink-3 hover:text-ink">
            Back to the site
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="wrap py-12 sm:py-16">
          {signedIn ? (
            <Dashboard entries={await listEntries()} backend={describeBackend()} />
          ) : (
            <LoginForm configured={!!adminPassword()} />
          )}
        </div>
      </main>
    </>
  );
}
