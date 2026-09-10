import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminPassword, isAdmin } from "@/lib/admin-auth";
import { describeBackend, listEntries } from "@/lib/store";
import { AdminHeader } from "@/components/admin/admin-header";
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
      <AdminHeader label="Admin" />

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
