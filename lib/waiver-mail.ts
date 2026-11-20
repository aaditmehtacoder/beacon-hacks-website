import nodemailer from "nodemailer";
import { EVENT } from "./event";
import { DIETS, type Waiver } from "./waiver";

/**
 * Every signed waiver is emailed to the team inbox, so a copy lands in
 * Gmail even before anyone opens /admin. Signers get no email (the user,
 * Nov 19, 2026); they print or save their copy on the page.
 *
 * Sent through Gmail with an app password for the team account:
 *   GMAIL_USER          team.beaconhacks@gmail.com
 *   GMAIL_APP_PASSWORD  16 characters, from myaccount.google.com/apppasswords
 *                       (needs 2-Step Verification on the account)
 *   WAIVER_NOTIFY_TO    optional; defaults to GMAIL_USER
 * Without them, nothing is sent and the waiver is still saved.
 */

const DIET_LABEL: Record<string, string> = Object.fromEntries(DIETS.map((d) => [d.value, d.label]));

export function mailConfigured() {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

/* Everything in the email came from a form: escape it. */
const esc = (s: string | number | undefined) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/* Header values: one line, no control characters. */
const line = (s: string) => s.replace(/[\r\n\t]+/g, " ").trim();

const WHEN = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" });

export async function sendWaiverEmail(w: Waiver): Promise<"sent" | "skipped"> {
  if (!mailConfigured()) return "skipped";
  const user = process.env.GMAIL_USER!;
  const to = process.env.WAIVER_NOTIFY_TO || user;
  const name = `${w.firstName} ${w.lastName}`;

  const flags = [
    w.minor ? "under 18" : "18+",
    w.allergies || w.medications || w.conditions ? "health notes" : "",
    w.mediaConsent === "no" ? "no photos" : "",
    w.revision > 1 ? `re-signed (${w.revision})` : "",
  ].filter(Boolean);

  const diet = [w.diet.map((d) => DIET_LABEL[d] ?? d).join(", "), w.dietNotes].filter(Boolean).join(". ");
  const rows: [string, string][] = [
    ["Email", w.email],
    ["Phone", w.phone],
    ["Date of birth", `${w.dateOfBirth} (${w.age} on the day)`],
    ["School", `${w.school}, grade ${w.grade}`],
    ["T-shirt", w.shirtSize],
    ...(w.minor
      ? ([
          ["Parent or guardian", `${w.guardianName} (${w.guardianRelationship})`],
          ["Their email", w.guardianEmail],
          ["Their phone", w.guardianPhone],
        ] as [string, string][])
      : []),
    ["Emergency contact", `${w.emergencyName} (${w.emergencyRelationship}), ${w.emergencyPhone}`],
    ["Allergies", w.allergies || "None"],
    ["Medications", w.medications || "None"],
    ["Conditions", w.conditions || "None"],
    ["Food", diet || "None"],
    ["Photos and video", w.mediaConsent === "yes" ? "Yes" : "No"],
    ["Signed", `${WHEN.format(new Date(w.signedAt))} Pacific, version ${w.version}`],
  ];

  /* Drawn signatures travel as inline images; Gmail blocks data: URLs. */
  const attachments: { filename: string; content: Buffer; contentType: string; cid: string }[] = [];
  const signature = (label: string, typed: string, image: string | undefined, cid: string) => {
    if (image) {
      attachments.push({
        filename: `${cid}.png`,
        content: Buffer.from(image.split(",")[1] ?? "", "base64"),
        contentType: "image/png",
        cid,
      });
      return `<tr><td style="padding:6px 16px;color:#5b6474;vertical-align:top;width:38%">${esc(label)}</td><td style="padding:6px 0"><img src="cid:${cid}" alt="Signature of ${esc(typed)}" height="70" style="display:block;height:70px"><span style="color:#5b6474;font-size:13px">${esc(typed)}, drawn</span></td></tr>`;
    }
    return `<tr><td style="padding:6px 16px;color:#5b6474;width:38%">${esc(label)}</td><td style="padding:6px 0;font-style:italic;font-weight:600;font-size:17px">${esc(typed)} <span style="font-style:normal;font-weight:400;color:#5b6474;font-size:13px">typed</span></td></tr>`;
  };

  const link = `${EVENT.url}/admin/waivers/${w.id}`;
  const html = `<!doctype html><html><body style="margin:0;background:#f4f6f9;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#151d2e">
<div style="max-width:600px;margin:0 auto;padding:24px">
<div style="background:#060d1b;color:#f7f3ea;border-radius:16px;padding:22px 24px">
<div style="color:#ffc72c;font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700">Waiver signed</div>
<div style="font-size:24px;font-weight:800;margin-top:6px">${esc(name)}</div>
<div style="color:#c3cad8;margin-top:4px">${esc(flags.join(" · "))}</div>
</div>
<table style="width:100%;border-collapse:collapse;margin-top:18px;font-size:15px;background:#fff;border-radius:12px">
${rows.map(([k, v]) => `<tr><td style="padding:8px 16px;color:#5b6474;border-bottom:1px solid #e3e7ee;vertical-align:top;width:38%">${esc(k)}</td><td style="padding:8px 16px;border-bottom:1px solid #e3e7ee">${esc(v)}</td></tr>`).join("\n")}
</table>
<table style="width:100%;border-collapse:collapse;margin-top:14px;font-size:15px">
${signature("Participant", w.participantSignature, w.participantSignatureImage, "participant-signature")}
${w.minor ? signature("Parent or guardian", w.guardianSignature, w.guardianSignatureImage, "guardian-signature") : ""}
</table>
<p style="margin-top:20px"><a href="${esc(link)}" style="color:#151d2e;font-weight:600">Open the full signed waiver in admin</a></p>
<p style="color:#5b6474;font-size:12px">Confirmation ${esc(w.id.slice(0, 8).toUpperCase())}. Reply to reach ${esc(w.minor ? w.guardianName : name)}.</p>
</div></body></html>`;

  const text = [
    `Waiver signed: ${name} (${flags.join(", ")})`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    `Participant signature: ${w.participantSignature}${w.participantSignatureImage ? " (drawn)" : " (typed)"}`,
    ...(w.minor ? [`Guardian signature: ${w.guardianSignature}${w.guardianSignatureImage ? " (drawn)" : " (typed)"}`] : []),
    "",
    `Full waiver: ${link}`,
  ].join("\n");

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass: process.env.GMAIL_APP_PASSWORD!.replace(/\s+/g, "") },
  });
  await transport.sendMail({
    from: { name: "Beacon Hacks waivers", address: user },
    to,
    replyTo: w.minor ? w.guardianEmail : w.email,
    subject: line(`Waiver signed: ${name}, grade ${w.grade}, ${w.school}${flags.length > 1 ? ` [${flags.slice(1).join(", ")}]` : ""}`),
    text,
    html,
    attachments,
  });
  return "sent";
}
