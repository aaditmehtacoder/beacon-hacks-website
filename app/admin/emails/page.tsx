import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin-auth";
import { listWaivers } from "@/lib/waiver-store";
import { approvedEmail, guardianSignEmail, mailConfigured, teamReviewEmail, type Mail } from "@/lib/waiver-mail";
import { AdminHeader } from "@/components/admin/admin-header";
import { EmailPreview } from "@/components/admin/email-preview";

export const metadata: Metadata = {
  title: "Email drafts",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Both waiver emails, filled in with a real waiver (the newest, or ?id=). Sends nothing. */
export default async function EmailDrafts({ searchParams }: PageProps<"/admin/emails">) {
  const jar = await cookies();
  if (!isAdmin(jar.get(ADMIN_COOKIE)?.value)) redirect("/admin");
  const waivers = await listWaivers();
  const wanted = (await searchParams).id;
  const waiver = waivers.find((w) => w.id === wanted) ?? waivers.find((w) => w.minor) ?? waivers[0];
  const from = process.env.GMAIL_USER || "team.beaconhacks@gmail.com";
  const meta = (m: Mail) => ({ fromName: m.fromName, from, to: m.to, cc: m.cc, replyTo: m.replyTo, subject: m.subject });

  return (
    <>
      <AdminHeader />
      <main id="main" tabIndex={-1} className="flex-1 bg-fog focus:outline-none">
        <div className="wrap py-10 sm:py-14">
          <Link href="/admin" className="link text-[0.9375rem]">
            All waivers
          </Link>
          <h1 className="mt-6 text-[clamp(2.25rem,4.4vw,3.25rem)] leading-none font-extrabold font-stretch-125% tracking-[-0.035em]">
            Email drafts
          </h1>
          <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-3">
            The emails the waiver sends, filled in with {waiver ? `${waiver.firstName} ${waiver.lastName}'s waiver` : "a waiver"}. Nothing
            here is sent.{mailConfigured() ? "" : " Email is not set up yet (GMAIL_USER, GMAIL_APP_PASSWORD)."}
          </p>

          {waiver ? (
            <>
              <form className="mt-5 flex flex-wrap items-center gap-2 text-[0.9375rem]">
                <label htmlFor="pick" className="text-ink-3">
                  Fill in with
                </label>
                <select id="pick" name="id" defaultValue={waiver.id} className="rounded-full border border-line-2 bg-card px-4 py-2">
                  {waivers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.firstName} {w.lastName}
                      {w.minor ? " (under 18)" : ""}
                    </option>
                  ))}
                </select>
                <button type="submit" className="rounded-full bg-ink px-4 py-2 font-semibold text-fog">
                  Show
                </button>
              </form>
              <div className="mt-8 grid gap-8 xl:grid-cols-2">
                {waiver.minor ? (
                  <section>
                    <h2 className="text-[1.25rem] font-bold font-stretch-[112.5%]">If the parent signs by link</h2>
                    <p className="mt-1 mb-4 text-[0.9375rem] text-ink-3">
                      To the parent or guardian, when the student picks &ldquo;Email them a link&rdquo;. The real link is one-time.
                    </p>
                    <EmailPreview meta={meta(guardianSignEmail(waiver, "#"))} src={`/api/admin/waivers/preview?id=${waiver.id}&kind=guardian`} height={760} />
                  </section>
                ) : null}
                <section>
                  <h2 className="text-[1.25rem] font-bold font-stretch-[112.5%]">When every signature is in</h2>
                  <p className="mt-1 mb-4 text-[0.9375rem] text-ink-3">To the team inbox, with a button to review and approve.</p>
                  <EmailPreview meta={meta(teamReviewEmail(waiver))} src={`/api/admin/waivers/preview?id=${waiver.id}&kind=team`} height={1180} />
                </section>
                <section>
                  <h2 className="text-[1.25rem] font-bold font-stretch-[112.5%]">When you approve</h2>
                  <p className="mt-1 mb-4 text-[0.9375rem] text-ink-3">
                    To the participant{waiver.minor ? ", with their parent or guardian copied" : ""}.
                  </p>
                  <EmailPreview meta={meta(approvedEmail(waiver))} src={`/api/admin/waivers/preview?id=${waiver.id}&kind=approved`} height={820} />
                </section>
              </div>
            </>
          ) : (
            <p className="mt-8 rounded-2xl border border-line bg-card px-6 py-14 text-center text-ink-3">
              Sign a waiver at /waiver first; the drafts are filled in from a real one.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
