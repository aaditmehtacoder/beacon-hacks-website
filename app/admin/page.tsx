import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminPassword, isAdmin } from "@/lib/admin-auth";
import { listWaivers, waiverBackend } from "@/lib/waiver-store";
import { AdminHeader } from "@/components/admin/admin-header";
import { LoginForm } from "@/components/admin/login-form";
import { WaiverDashboard, SignOut } from "@/components/admin/waiver-dashboard";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Organizers only: every signed waiver, and check-in on the day. */
export default async function Admin() {
  const jar = await cookies();
  const signedIn = isAdmin(jar.get(ADMIN_COOKIE)?.value);

  return (
    <>
      <div className="print:hidden">
        <AdminHeader>{signedIn ? <SignOut /> : null}</AdminHeader>
      </div>

      <main id="main" tabIndex={-1} className="flex flex-1 flex-col bg-fog focus:outline-none print:bg-transparent">
        {signedIn ? (
          <div className="wrap py-10 sm:py-14 print:py-0">
            <WaiverDashboard waivers={await listWaivers()} backend={waiverBackend()} />
          </div>
        ) : (
          <div className="wrap flex flex-1 items-center justify-center py-16">
            <LoginForm configured={!!adminPassword()} />
          </div>
        )}
      </main>
    </>
  );
}
