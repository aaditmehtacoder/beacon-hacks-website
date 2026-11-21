import { Linkify } from "./linkify";
import type { ReactNode } from "react";
import { CLAUSES, ESIGN, WAIVER_FOOTER, guardianConsent } from "@/lib/waiver-text";
import { DIETS, departureSummary, guardianSigned, teamSummary, type Waiver } from "@/lib/waiver";

const DIET_LABEL: Record<string, string> = Object.fromEntries(DIETS.map((d) => [d.value, d.label]));

/* Pacific time, always, so the server's render and the browser's agree. */
const WHEN = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  dateStyle: "long",
  timeStyle: "short",
});
export const signedWhen = (iso: string) => `${WHEN.format(new Date(iso))} Pacific`;

/**
 * A signed waiver in full: the answers, the agreement as it was signed and
 * the signatures. The signer's copy after submitting, and the organizers'
 * view in /admin; both print cleanly.
 */
export function WaiverRecord({ waiver, showAudit = false }: { waiver: Waiver; showAudit?: boolean }) {
  const none = <span className="text-ink-3">None given</span>;
  return (
    <div className="flex flex-col gap-8 text-[0.9375rem]">
      <Block title="Participant">
        <Row label="Name">{`${waiver.firstName} ${waiver.lastName}`}</Row>
        <Row label="Email">{waiver.email}</Row>
        <Row label="Phone">{waiver.phone}</Row>
        <Row label="Date of birth">{`${waiver.dateOfBirth} (${waiver.age} on the event day)`}</Row>
        <Row label="School and grade">{`${waiver.school}, grade ${waiver.grade}`}</Row>
        <Row label="Shirt size">{waiver.shirtSize}</Row>
      </Block>

      {waiver.teamStatus ? (
        <Block title="Team">
          <Row label="Team">
            {waiver.teamStatus === "team" ? waiver.teamName || "No name yet" : teamSummary(waiver)}
          </Row>
          {waiver.teamStatus === "team" ? <Row label="Teammates">{(waiver.teammates ?? []).join(", ")}</Row> : null}
        </Block>
      ) : null}

      {waiver.minor ? (
        <Block title="Parent or guardian">
          <Row label="Name">{`${waiver.guardianName} (${waiver.guardianRelationship})`}</Row>
          <Row label="Email">{waiver.guardianEmail}</Row>
          <Row label="Phone">{waiver.guardianPhone}</Row>
          <Row label="Going home">{departureSummary(waiver)}</Row>
        </Block>
      ) : null}

      <Block title="Emergency contact">
        <Row label="Name">{`${waiver.emergencyName} (${waiver.emergencyRelationship})`}</Row>
        <Row label="Phone">{waiver.emergencyPhone}</Row>
      </Block>

      <Block title="Health and food">
        <Row label="Allergies">{waiver.allergies || none}</Row>
        <Row label="Medications">{waiver.medications || none}</Row>
        <Row label="Medical conditions">{waiver.conditions || none}</Row>
        <Row label="Emergency instructions">{waiver.emergencyInstructions || none}</Row>
        <Row label="Diet">
          {waiver.diet.length || waiver.dietNotes
            ? [waiver.diet.map((d) => DIET_LABEL[d] ?? d).join(", "), waiver.dietNotes].filter(Boolean).join(". ")
            : none}
        </Row>
      </Block>

      <Block title="Agreement">
        {CLAUSES.map((clause) => (
          <div key={clause.id} className="break-inside-avoid border-b border-line py-3 last:border-0">
            <p className="font-semibold">{clause.title}</p>
            {clause.paragraphs.map((p, i) => (
              <p key={i} className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-2">
                <Linkify text={p} />
              </p>
            ))}
            <p className="mt-2 text-[0.875rem] font-semibold text-ink">
              {clause.id === "media" ? `Photos and video: ${waiver.mediaConsent === "yes" ? "Yes" : "No"}` : "Agreed"}
            </p>
          </div>
        ))}
      </Block>

      <Block title="Signatures">
        <p className="pb-3 text-[0.875rem] leading-relaxed text-ink-2">{ESIGN}</p>
        {waiver.minor ? (
          <div className="mb-3 break-inside-avoid rounded-xl border border-line p-4">
            <p className="text-[0.875rem] font-semibold">Parent or guardian consent</p>
            {guardianConsent(`${waiver.firstName} ${waiver.lastName}`).map((p, i) => (
              <p key={i} className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-2">
                {p}
              </p>
            ))}
            {waiver.guardianAuthority ? (
              <p className="mt-2 text-[0.875rem] font-semibold text-ink">Confirmed by {waiver.guardianName}</p>
            ) : null}
          </div>
        ) : null}
        <Row label="Participant">
          <Signature name={waiver.participantSignature} image={waiver.participantSignatureImage} />
        </Row>
        {waiver.minor ? (
          <Row label="Parent or guardian">
            {guardianSigned(waiver) ? (
              <Signature name={waiver.guardianSignature} image={waiver.guardianSignatureImage} />
            ) : waiver.guardianMethod === "paper" ? (
              <PaperLine name={waiver.guardianName} />
            ) : (
              <>
                <span className="text-ink-3 print:hidden">Waiting for {waiver.guardianName} to sign from the link we emailed</span>
                <span className="hidden print:block">
                  <PaperLine name={waiver.guardianName} />
                </span>
              </>
            )}
          </Row>
        ) : null}
        <Row label={waiver.minor && waiver.guardianSignedAt ? "Participant signed" : "Signed"}>{signedWhen(waiver.signedAt)}</Row>
        {waiver.minor && waiver.guardianSignedAt ? (
          <Row label="Guardian signed">
            {signedWhen(waiver.guardianSignedAt)}
            {waiver.guardianMethod === "paper" ? " (paper copy received)" : waiver.guardianMethod === "email" ? " (from the emailed link)" : ""}
          </Row>
        ) : null}
        <Row label="Confirmation">{waiver.id.slice(0, 8).toUpperCase()}</Row>
        {showAudit ? (
          <>
            <Row label="Version">{`${waiver.version}${waiver.revision > 1 ? `, signed ${waiver.revision} times (latest kept)` : ""}`}</Row>
            <Row label="IP">{waiver.ip}</Row>
            {waiver.guardianIp ? <Row label="Guardian IP">{waiver.guardianIp}</Row> : null}
            <Row label="Browser">
              <span className="break-all text-[0.8125rem] text-ink-3">{waiver.userAgent}</span>
            </Row>
          </>
        ) : null}
      </Block>

      <p className="text-[0.8125rem] text-ink-3">{WAIVER_FOOTER}</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="break-inside-avoid">
      <h3 className="kicker border-b border-ink pb-2 text-ink">{title}</h3>
      <dl className="mt-1">{children}</dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-line py-2.5 last:border-0 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-ink-3">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

/* Drawn: the ink, with the printed name under it. Typed: the name. */
function Signature({ name, image }: { name: string; image?: string }) {
  if (image) {
    return (
      <span className="inline-flex flex-col">
        {/* A data URL from the signature pad, checked to be a PNG on the way in. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={`Signature of ${name}`} className="h-20 w-auto max-w-full self-start object-contain sm:h-24" />
        <span className="border-t border-ink-3/40 pt-1 text-[0.8125rem] text-ink-3">{name}, signed by hand</span>
      </span>
    );
  }
  return <span className="text-[1.25rem] italic font-semibold tracking-[-0.01em]">{name}</span>;
}

/* For a parent signing on paper: lines to sign, print their name and date, under the consent above. */
function PaperLine({ name }: { name: string }) {
  return (
    <span className="flex flex-col gap-4">
      <span className="text-[0.875rem] leading-relaxed text-ink-2">
        By signing, I confirm the parent or guardian consent above and agree to this waiver for myself and on my
        child&rsquo;s behalf.
      </span>
      <span className="grid gap-6 sm:grid-cols-[1fr_1fr_9rem]">
        <span className="flex flex-col gap-1">
          <span className="h-12 border-b-2 border-ink" />
          <span className="text-[0.8125rem] text-ink-3">Signature of parent or legal guardian</span>
        </span>
        <span className="flex flex-col gap-1">
          <span className="flex h-12 items-end border-b-2 border-ink pb-1 text-ink-2">{name}</span>
          <span className="text-[0.8125rem] text-ink-3">Printed name</span>
        </span>
        <span className="flex flex-col gap-1">
          <span className="h-12 border-b-2 border-ink" />
          <span className="text-[0.8125rem] text-ink-3">Date</span>
        </span>
      </span>
    </span>
  );
}
