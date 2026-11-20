import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin-auth";
import { getWaiver } from "@/lib/waiver-store";
import { EVENT } from "@/lib/event";
import { AdminHeader } from "@/components/admin/admin-header";
import { WaiverActions } from "@/components/admin/waiver-actions";
import { WaiverRecord } from "@/components/waiver/waiver-record";

export const metadata: Metadata = {
  title: "Waiver",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** One signed waiver in full, with its audit trail; prints as the record. */
export default async function WaiverDetail({ params }: PageProps<"/admin/waivers/[id]">) {
  const jar = await cookies();
  if (!isAdmin(jar.get(ADMIN_COOKIE)?.value)) redirect("/admin");
  const waiver = await getWaiver((await params).id);
  if (!waiver) notFound();

  return (
    <>
      <div className="print:hidden">
        <AdminHeader />
      </div>
      <main id="main" tabIndex={-1} className="flex-1 bg-fog focus:outline-none print:bg-transparent">
        <div className="wrap max-w-[calc(52rem+2*var(--gut))] py-10 sm:py-14 print:py-0">
          <Link href="/admin" className="link text-[0.9375rem] print:hidden">
            All waivers
          </Link>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:mt-0">
            <div>
              <p className="kicker text-lamp-deep">{EVENT.name} participant waiver</p>
              <h1 className="mt-3 text-[clamp(2rem,4vw,2.75rem)] leading-none font-extrabold font-stretch-125% tracking-[-0.035em]">
                {waiver.firstName} {waiver.lastName}
              </h1>
              <p className="mt-2 text-[0.9375rem] text-ink-3">
                {waiver.checkedInAt ? "Checked in" : "Not checked in yet"}
              </p>
            </div>
            <WaiverActions id={waiver.id} name={`${waiver.firstName} ${waiver.lastName}`} />
          </div>
          <div className="mt-8 rounded-2xl border border-line bg-card p-6 sm:p-8 print:border-0 print:p-0">
            <WaiverRecord waiver={waiver} showAudit />
          </div>
        </div>
      </main>
    </>
  );
}
