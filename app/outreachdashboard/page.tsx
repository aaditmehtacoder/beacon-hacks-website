import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminPassword, isAdmin } from "@/lib/admin-auth";
import { gmailConfigured } from "@/lib/outreach/gmail";
import { modelConfigured } from "@/lib/outreach/classify";
import { loadLedger } from "@/lib/outreach/store";
import { describeBackend } from "@/lib/store";
import { AdminHeader } from "@/components/admin/admin-header";
import { LoginForm } from "@/components/admin/login-form";
import { OutreachLedger } from "@/components/outreach/ledger";

export const metadata: Metadata = {
  title: "Outreach",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The sponsor outreach ledger: every organisation the team mailbox has
 * written to, read straight out of Gmail. Behind the same password as /admin.
 */
export default async function OutreachDashboard() {
  const jar = await cookies();
  const signedIn = isAdmin(jar.get(ADMIN_COOKIE)?.value);

  return (
    <>
      <AdminHeader label="Outreach" />
      <main className="flex-1">
        <div className="wrap py-12 sm:py-16">
          {signedIn ? (
            <OutreachLedger
              ledger={await loadLedger()}
              gmail={gmailConfigured()}
              model={modelConfigured()}
              backend={describeBackend()}
            />
          ) : (
            <LoginForm
              configured={!!adminPassword()}
              title="Organizers only."
              lede="The sponsor outreach ledger lives behind this. Same password as the signups page."
            />
          )}
        </div>
      </main>
    </>
  );
}
