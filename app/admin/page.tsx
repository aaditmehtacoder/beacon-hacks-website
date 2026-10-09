import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminPassword, isAdmin } from "@/lib/admin-auth";
import { describeBackend, listEntries } from "@/lib/store";
import { AdminHeader } from "@/components/admin/admin-header";
import { LoginForm } from "@/components/admin/login-form";
import { Dashboard, SignOut } from "@/components/admin/dashboard";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Organizers only: everyone who applied or asked for updates. */
export default async function Admin() {
  const jar = await cookies();
  const signedIn = isAdmin(jar.get(ADMIN_COOKIE)?.value);

  return (
    <>
      <AdminHeader>{signedIn ? <SignOut /> : null}</AdminHeader>

      <main id="main" tabIndex={-1} className="flex flex-1 flex-col bg-fog focus:outline-none">
        {signedIn ? (
          <div className="wrap py-12 sm:py-16">
            <Dashboard entries={await listEntries()} backend={describeBackend()} />
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
