import nodemailer from "nodemailer";
import { EVENT } from "./event";
import { DIETS, GUARDIAN_LINK_DAYS, departureSummary, teamSummary, type Waiver } from "./waiver";
import { CLAUSES, ESIGN, WAIVER_FOOTER, guardianConsent } from "./waiver-text";

/**
 * The two waiver emails, and sending them.
 *
 *  1. teamReviewEmail: when someone signs, a copy to the team inbox with a
 *     button to review and approve it in /admin.
 *  2. approvedEmail: when an organizer approves it, "you're in" to the
 *     participant, with the parent or guardian copied under 18, and a full
 *     copy of the signed waiver underneath.
 *  3. guardianSignEmail: under 18, when the participant chose to have their
 *     parent or guardian sign by link, the link.
 *
 * Both are previewed in /admin/emails, and the approval email is shown in
 * full before an organizer sends it.
 *
 * Sent through Gmail with an app password for the team account:
 *   GMAIL_USER          team.beaconhacks@gmail.com
 *   GMAIL_APP_PASSWORD  from myaccount.google.com/apppasswords
 *   WAIVER_NOTIFY_TO    optional; where review emails go (GMAIL_USER)
 * Without them, nothing is sent; waivers are still saved and approvable.
 */

export type Mail = {
  fromName: string;
  to: string;
  cc?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  attachments: { filename: string; content: Buffer; contentType: string; cid: string }[];
};

const DIET_LABEL: Record<string, string> = Object.fromEntries(DIETS.map((d) => [d.value, d.label]));

export function mailConfigured() {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

const teamInbox = () => process.env.WAIVER_NOTIFY_TO || process.env.GMAIL_USER || "team.beaconhacks@gmail.com";

/* Everything from the form is escaped before it goes in the HTML. */
const esc = (s: string | number | undefined) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/* Header values: one line, no control characters. */
const line = (s: string) => s.replace(/[\r\n\t]+/g, " ").trim();

const WHEN = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" });
const confirmation = (w: Waiver) => w.id.slice(0, 8).toUpperCase();

/* ------------------------------------------------------------ layout */

const INK = "#151d2e";
const MUTED = "#5b6474";
const RULE = "#e3e7ee";

function frame(kicker: string, title: string, sub: string, body: string) {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="light"></head>
<body style="margin:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};-webkit-font-smoothing:antialiased">
<div style="max-width:600px;margin:0 auto;padding:24px 16px">
<div style="background:#060d1b;color:#f7f3ea;border-radius:16px;padding:26px 26px 24px">
<div style="color:#ffc72c;font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700">${kicker}</div>
<div style="font-size:28px;line-height:1.1;font-weight:800;letter-spacing:-.02em;margin-top:8px">${title}</div>
${sub ? `<div style="color:#c3cad8;margin-top:8px;font-size:15px;line-height:1.5">${sub}</div>` : ""}
</div>
${body}
<p style="color:${MUTED};font-size:12px;line-height:1.5;margin:24px 4px 0">${esc(EVENT.name)} · ${esc(EVENT.venue.place ?? EVENT.venue.label)}, ${esc(EVENT.venue.city)} · <a href="${EVENT.url}" style="color:${MUTED}">${esc(EVENT.url.replace(/^https?:\/\/(www\.)?/, ""))}</a></p>
</div></body></html>`;
}

function table(rows: [string, string][]) {
  return `<table role="presentation" style="width:100%;border-collapse:collapse;margin-top:16px;font-size:15px;background:#fff;border-radius:12px">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:9px 16px;color:${MUTED};border-bottom:1px solid ${RULE};vertical-align:top;width:36%">${esc(k)}</td><td style="padding:9px 16px;border-bottom:1px solid ${RULE};line-height:1.45">${v}</td></tr>`,
  )
  .join("\n")}
</table>`;
}

/* Agreement text: ** marks bold. */
const rich = (s: string) => esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
const plain = (s: string) => s.replace(/\*\*/g, "");

/**
 * A signature as a table row. Drawn signatures travel as inline images
 * (Gmail blocks data: URLs), pushed onto `attachments`.
 */
function signatureRow(label: string, typed: string, image: string | undefined, cid: string, attachments: Mail["attachments"]): [string, string] {
  if (!image) return [label, `<span style="font-style:italic;font-weight:600;font-size:17px">${esc(typed)}</span> <span style="color:${MUTED};font-size:13px">typed</span>`];
  attachments.push({ filename: `${cid}.png`, content: Buffer.from(image.split(",")[1] ?? "", "base64"), contentType: "image/png", cid });
  return [label, `<img src="cid:${cid}" alt="Signature of ${esc(typed)}" height="64" style="display:block;height:64px"><span style="color:${MUTED};font-size:13px">${esc(typed)}, drawn</span>`];
}

function button(href: string, label: string) {
  return `<p style="margin:22px 0 0"><a href="${esc(href)}" style="display:inline-block;background:#ffc72c;color:${INK};font-weight:700;text-decoration:none;padding:13px 22px;border-radius:999px">${esc(label)}</a></p>`;
}

/* ------------------------------------------------------------ 1. to the team */

export function teamReviewEmail(w: Waiver): Mail {
  const name = `${w.firstName} ${w.lastName}`;
  const flags = [
    w.minor ? "under 18" : "18+",
    w.allergies || w.medications || w.conditions || w.emergencyInstructions ? "health notes" : "",
    w.mediaConsent === "no" ? "no photos" : "",
    w.revision > 1 ? `signed again (${w.revision})` : "",
  ].filter(Boolean);
  const diet = [w.diet.map((d) => DIET_LABEL[d] ?? d).join(", "), w.dietNotes].filter(Boolean).join(". ");

  const rows: [string, string][] = [
    ["Email", esc(w.email)],
    ["Phone", esc(w.phone)],
    ["Date of birth", esc(`${w.dateOfBirth} (${w.age} on the day)`)],
    ["School", esc(`${w.school}, grade ${w.grade}`)],
    ["T-shirt", esc(w.shirtSize)],
    ["Team", esc(teamSummary(w))],
    ...(w.minor
      ? ([
          ["Parent or guardian", esc(`${w.guardianName} (${w.guardianRelationship})`)],
          ["Their email", esc(w.guardianEmail)],
          ["Their phone", esc(w.guardianPhone)],
          ["Going home", esc(departureSummary(w))],
        ] as [string, string][])
      : []),
    ["Emergency contact", esc(`${w.emergencyName} (${w.emergencyRelationship}), ${w.emergencyPhone}`)],
    ["Allergies", esc(w.allergies || "None")],
    ["Medications", esc(w.medications || "None")],
    ["Conditions", esc(w.conditions || "None")],
    ["Emergency instructions", esc(w.emergencyInstructions || "None")],
    ["Food", esc(diet || "None")],
    ["Photos and video", w.mediaConsent === "yes" ? "Yes" : "No"],
    ["Signed", esc(`${WHEN.format(new Date(w.signedAt))} Pacific, version ${w.version}`)],
  ];

  const attachments: Mail["attachments"] = [];
  rows.push(signatureRow("Participant signature", w.participantSignature, w.participantSignatureImage, "participant-signature", attachments));
  if (w.minor) rows.push(signatureRow("Guardian signature", w.guardianSignature, w.guardianSignatureImage, "guardian-signature", attachments));

  const link = `${EVENT.url}/admin/waivers/${w.id}`;
  const html = frame(
    "Waiver to review",
    esc(name),
    esc(flags.join(" · ")),
    `${table(rows)}
${button(link, "Review and approve")}
<p style="color:${MUTED};font-size:13px;line-height:1.5;margin:14px 4px 0">Approving sends ${esc(w.firstName)} the &ldquo;you&rsquo;re in&rdquo; email${w.minor ? `, with ${esc(w.guardianName)} copied` : ""}. Reply here to reach ${esc(w.minor ? w.guardianName : name)}. Confirmation ${confirmation(w)}.</p>`,
  );
  const text = [
    `Waiver to review: ${name} (${flags.join(", ")})`,
    "",
    ...rows.slice(0, -1 - (w.minor ? 1 : 0)).map(([k, v]) => `${k}: ${v.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&")}`),
    "",
    `Review and approve: ${link}`,
  ].join("\n");

  return {
    fromName: "Beacon Hacks waivers",
    to: teamInbox(),
    replyTo: w.minor ? w.guardianEmail : w.email,
    subject: line(`Waiver to review: ${name}, grade ${w.grade}, ${w.school}${flags.length > 1 ? ` [${flags.slice(1).join(", ")}]` : ""}`),
    html,
    text,
    attachments,
  };
}

/* ------------------------------------------------------------ 2. to the participant */

export function approvedEmail(w: Waiver): Mail {
  const v = EVENT.venue;
  const date = EVENT.date.confirmed ? EVENT.date.label : `${EVENT.date.label} (our target date; we will email you if it changes)`;
  const where = v.address ? `${v.place}, ${v.address}` : v.label;
  const health = !!(w.medications || w.allergies);

  const bring = [
    "Your laptop and charger",
    "Your school ID, for check-in",
    "A water bottle",
    ...(health ? ["Any medication you need, like the one you listed on your waiver"] : []),
  ];

  const rows: [string, string][] = [
    ["When", esc(date)],
    ["Times", esc(`Doors open 8:30 AM. Hacking ${EVENT.hours.hacking}. Done by 11 PM.`)],
    ["Where", v.map ? `<a href="${esc(v.map)}" style="color:${INK};font-weight:600">${esc(where)}</a>` : esc(where)],
    ["Confirmation", `<strong>${confirmation(w)}</strong>`],
  ];

  const links = [
    EVENT.social.discord ? `<a href="${esc(EVENT.social.discord)}" style="color:${INK};font-weight:600">Join the Discord</a> to meet other builders and hear updates first.` : "",
    `Read the <a href="${EVENT.url}/code-of-conduct" style="color:${INK};font-weight:600">code of conduct</a> before the day.`,
  ].filter(Boolean);

  const copy = signedCopy(w);
  const html = frame(
    "Waiver approved",
    `You&rsquo;re in, ${esc(w.firstName)}.`,
    `Your waiver for ${esc(EVENT.name)} is approved. See you in ${esc(v.city)}.`,
    `${table(rows)}
<div style="background:#fff;border-radius:12px;padding:16px 18px;margin-top:12px;font-size:15px;line-height:1.5">
<div style="font-weight:700;margin-bottom:6px">Bring</div>
${bring.map((b) => `<div style="padding:2px 0">&bull;&nbsp; ${esc(b)}</div>`).join("")}
</div>
<div style="font-size:15px;line-height:1.6;margin:18px 4px 0">
${links.map((l) => `<p style="margin:0 0 8px">${l}</p>`).join("")}
${w.minor ? `<p style="margin:12px 0 0;color:${MUTED}">${esc(w.guardianName)}, you are copied because you signed for ${esc(w.firstName)}. Going home: ${esc(departureSummary(w).toLowerCase())}, by 11 PM; there is no overnight stay. A copy of the signed waiver is below.</p>` : `<p style="margin:12px 0 0;color:${MUTED}">A copy of the waiver you signed is below.</p>`}
<p style="margin:12px 0 0;color:${MUTED}">Questions? Reply to this email.</p>
</div>
${copy.html}`,
  );

  const text = [
    `You're in, ${w.firstName}.`,
    "",
    `Your waiver for ${EVENT.name} is approved. See you in ${v.city}.`,
    "",
    `When: ${date}`,
    `Times: Doors open 8:30 AM. Hacking ${EVENT.hours.hacking}. Done by 11 PM.`,
    `Where: ${where}`,
    `Confirmation: ${confirmation(w)}`,
    "",
    "Bring:",
    ...bring.map((b) => `- ${b}`),
    "",
    ...(EVENT.social.discord ? [`Discord: ${EVENT.social.discord}`] : []),
    `Code of conduct: ${EVENT.url}/code-of-conduct`,
    ...(w.minor ? ["", `${w.guardianName}, you are copied because you signed for ${w.firstName}. Going home: ${departureSummary(w).toLowerCase()}, by 11 PM; there is no overnight stay.`] : []),
    "",
    "Questions? Reply to this email.",
    "",
    copy.text,
  ].join("\n");

  return {
    fromName: EVENT.name,
    to: w.email,
    cc: w.minor && w.guardianEmail ? w.guardianEmail : undefined,
    replyTo: EVENT.email.team,
    subject: line(`You're in: ${EVENT.name}, ${EVENT.date.short}`),
    html,
    text,
    attachments: copy.attachments,
  };
}

/**
 * The signed waiver in full, for the signers' records: what was entered,
 * the agreement word for word, the consent and both signatures.
 */
function signedCopy(w: Waiver): { html: string; text: string; attachments: Mail["attachments"] } {
  const attachments: Mail["attachments"] = [];
  const when = (iso?: string) => (iso ? `${WHEN.format(new Date(iso))} Pacific` : "");
  const name = `${w.firstName} ${w.lastName}`;
  const rows: [string, string][] = [
    ["Participant", esc(`${name}, ${w.email}, ${w.phone}`)],
    ["Date of birth", esc(`${w.dateOfBirth} (${w.age} on the day)`)],
    ...(w.minor
      ? ([
          ["Parent or guardian", esc(`${w.guardianName} (${w.guardianRelationship}), ${w.guardianEmail}, ${w.guardianPhone}`)],
          ["Going home", esc(departureSummary(w))],
        ] as [string, string][])
      : []),
    ["Emergency contact", esc(`${w.emergencyName} (${w.emergencyRelationship}), ${w.emergencyPhone}`)],
    ["Photos and video", w.mediaConsent === "yes" ? "Yes" : "No"],
  ];
  rows.push(signatureRow("Participant signature", w.participantSignature, w.participantSignatureImage, "copy-participant-signature", attachments));
  rows.push(["Participant signed", esc(when(w.signedAt))]);
  if (w.minor) {
    rows.push(signatureRow("Parent or guardian signature", w.guardianSignature, w.guardianSignatureImage, "copy-guardian-signature", attachments));
    rows.push(["Parent or guardian signed", esc(when(w.guardianSignedAt ?? w.signedAt))]);
  }
  rows.push(["Confirmation", esc(`${confirmation(w)}, version ${w.version}`)]);

  const p = (t: string) => `<p style="margin:6px 0 0;color:#3a4352;font-size:13px;line-height:1.55">${t}</p>`;
  const agreement = CLAUSES.map(
    (c) => `<div style="padding:12px 0;border-bottom:1px solid ${RULE}"><div style="font-weight:700;font-size:14px">${esc(c.title)}</div>${c.paragraphs.map((x) => p(rich(x))).join("")}<div style="margin-top:6px;font-size:13px;font-weight:700">${c.id === "media" ? `Photos and video: ${w.mediaConsent === "yes" ? "Yes" : "No"}` : "Agreed"}</div></div>`,
  ).join("");
  const consent = w.minor
    ? `<div style="padding:12px 0;border-bottom:1px solid ${RULE}"><div style="font-weight:700;font-size:14px">Parent or guardian consent</div>${guardianConsent(name).map((x) => p(esc(x))).join("")}</div>`
    : "";

  const html = `<div style="margin-top:28px;border-top:2px solid ${INK};padding-top:14px">
<div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700">The signed waiver</div>
${table(rows)}
<div style="background:#fff;border-radius:12px;padding:4px 16px 12px;margin-top:12px">${agreement}${consent}${p(esc(ESIGN))}${p(esc(WAIVER_FOOTER))}</div>
</div>`;

  const text = [
    "THE SIGNED WAIVER",
    ...rows.map(([k, v]) => `${k}: ${v.replace(/<img[^>]*>/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'")}`),
    "",
    ...CLAUSES.flatMap((c) => [c.title.toUpperCase(), ...c.paragraphs.map(plain), c.id === "media" ? `Photos and video: ${w.mediaConsent === "yes" ? "Yes" : "No"}` : "Agreed", ""]),
    ...(w.minor ? ["PARENT OR GUARDIAN CONSENT", ...guardianConsent(name), ""] : []),
    ESIGN,
    WAIVER_FOOTER,
  ].join("\n");
  return { html, text, attachments };
}

/* ------------------------------------------------------------ 3. to the parent */

/**
 * When a participant under 18 chose to have their parent or guardian sign
 * by link: the link, and what they are signing. The link is one-time and
 * only in this email.
 */
export function guardianSignEmail(w: Waiver, link: string): Mail {
  const child = `${w.firstName} ${w.lastName}`;
  const html = frame(
    "Signature needed",
    `Please sign ${esc(w.firstName)}&rsquo;s waiver`,
    `${esc(child)} filled in the waiver for ${esc(EVENT.name)} and listed you as their ${esc(w.guardianRelationship.toLowerCase() || "parent or guardian")}.`,
    `<div style="background:#fff;border-radius:12px;padding:18px 20px;margin-top:16px;font-size:15px;line-height:1.6">
<p style="margin:0">${esc(EVENT.name)} is a free, one-day hackathon for high school students on ${esc(EVENT.date.label)}${EVENT.date.confirmed ? "" : " (target date)"} at ${esc(EVENT.venue.place ?? EVENT.venue.label)}, ${esc(EVENT.venue.city)}, from ${esc(EVENT.hours.label)}.</p>
<p style="margin:12px 0 0">Because ${esc(w.firstName)} is under 18, a parent or guardian signs too. It takes about two minutes: check what ${esc(w.firstName)} entered, read the agreement and sign with your finger, mouse or by typing your name.</p>
</div>
${button(link, "Review and sign")}
<p style="color:${MUTED};font-size:13px;line-height:1.5;margin:14px 4px 0">This link is just for you, ${esc(w.guardianName)}; please don&rsquo;t forward it. It works once, for ${GUARDIAN_LINK_DAYS} days. Prefer paper? Open the link and print the waiver instead. Not expecting this? You can ignore it, or reply and tell us.</p>`,
  );
  const text = [
    `Please sign ${w.firstName}'s waiver for ${EVENT.name}`,
    "",
    `${child} filled in the waiver for ${EVENT.name} (${EVENT.date.label}, ${EVENT.venue.place ?? EVENT.venue.label}, ${EVENT.venue.city}) and listed you as their parent or guardian. Because ${w.firstName} is under 18, you sign too. It takes about two minutes.`,
    "",
    `Review and sign: ${link}`,
    "",
    `This link is just for you; please don't forward it. It works once, for ${GUARDIAN_LINK_DAYS} days. Not expecting this? Ignore it, or reply and tell us.`,
  ].join("\n");
  return {
    fromName: EVENT.name,
    to: w.guardianEmail,
    replyTo: EVENT.email.team,
    subject: line(`Please sign ${w.firstName}'s ${EVENT.name} waiver`),
    html,
    text,
    attachments: [],
  };
}

/* ------------------------------------------------------------ send, preview */

export async function sendMail(m: Mail): Promise<void> {
  if (!mailConfigured()) throw new Error("Email is not set up: GMAIL_USER and GMAIL_APP_PASSWORD are missing.");
  const user = process.env.GMAIL_USER!;
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass: process.env.GMAIL_APP_PASSWORD!.replace(/\s+/g, "") },
  });
  await transport.sendMail({
    from: { name: m.fromName, address: user },
    to: m.to,
    cc: m.cc,
    replyTo: m.replyTo,
    subject: m.subject,
    text: m.text,
    html: m.html,
    attachments: m.attachments,
  });
}

/** The HTML as a browser can show it: inline images swapped for data URLs. */
export function previewHtml(m: Mail): string {
  return m.attachments.reduce(
    (html, a) => html.replaceAll(`cid:${a.cid}`, `data:${a.contentType};base64,${a.content.toString("base64")}`),
    m.html,
  );
}
