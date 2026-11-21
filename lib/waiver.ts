import { z } from "zod";
import { EVENT } from "./event";
import { formatPhone } from "./phone";

/**
 * The participant waiver at /waiver: what a student (and, under 18, a
 * parent or guardian) fills in and signs, checked the same way in the
 * browser and on the server.
 *
 * WAIVER_VERSION is stored with every signature. Change it whenever the
 * agreement text in lib/waiver-text.ts changes, so each record says which
 * words were agreed to.
 */
export const WAIVER_VERSION = "2027.5";

/** Age of majority in California. */
export const ADULT_AGE = 18;

/** Age on the day of the event, from a YYYY-MM-DD date of birth. */
export function ageOnEventDay(dob: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const [ey, em, ed] = EVENT.date.iso.split("-").map(Number);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  let age = ey - y;
  if (em < mo || (em === mo && ed < d)) age -= 1;
  return age;
}

export const GRADES = ["9", "10", "11", "12"] as const;
export const GUARDIAN_METHODS = ["here", "email", "paper"] as const;
export type GuardianMethod = (typeof GUARDIAN_METHODS)[number];
export const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export const TEAM_STATUSES = [
  { value: "team", label: "I have a team" },
  { value: "looking", label: "Find me a team" },
  { value: "solo", label: "Working solo" },
] as const;
export type TeamStatus = (typeof TEAM_STATUSES)[number]["value"];
/**
 * How a participant under 18 leaves: their parent or guardian's choice,
 * checked by staff at the door.
 */
export const DEPARTURES = [
  { value: "guardian", label: "My parent or guardian picks me up", summary: "Picked up by a parent or guardian" },
  { value: "adult", label: "Another adult picks me up", summary: "Picked up by another adult" },
  { value: "self", label: "I may leave on my own", summary: "May leave on their own" },
] as const;
export type Departure = (typeof DEPARTURES)[number]["value"];

/** How long an emailed signing link works. Organizers can send a new one from /admin. */
export const GUARDIAN_LINK_DAYS = 14;

/** Teams are up to four, so up to three others. */
export const MAX_TEAMMATES = 3;

export const DIETS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-free" },
  { value: "dairy-free", label: "Dairy-free" },
  { value: "nut-free", label: "Nut allergy" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
] as const;
export type Diet = (typeof DIETS)[number]["value"];

/* ------------------------------------------------------------ fields */

const text = (label: string, max = 120) =>
  z.string().trim().min(1, `Add ${label}.`).max(max, `Keep ${label} under ${max} characters.`);
const note = (max = 600) => z.string().trim().max(max, `Keep this under ${max} characters.`).default("");

const email = (label = "an email") =>
  z
    .string()
    .trim()
    .toLowerCase()
    .min(1, `Add ${label}.`)
    .max(200)
    .pipe(z.email("That email does not look right."));

/* Ten to fifteen digits, however they are punctuated. */
const phone = (label = "a phone number") =>
  z
    .string()
    .trim()
    .min(1, `Add ${label}.`)
    .max(40)
    .refine((v) => {
      const digits = v.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }, "Use a full phone number, with area code.")
    .transform(formatPhone);

const yes = (message: string) => z.literal(true, { error: message });

/** A drawn signature: a PNG from the signature pad, as a data URL. */
const drawn = z
  .string()
  .max(300_000, "That signature is too large. Clear it and sign again.")
  .regex(/^(data:image\/png;base64,[A-Za-z0-9+/]+=*)?$/, "Sign again.")
  .default("");

/** A typed signature counts if it is the signer's name, give or take case and spaces. */
const squash = (s: string) => s.toLowerCase().replace(/[^a-zÀ-ɏ]+/g, "");

export const waiverSchema = z
  .object({
    firstName: text("your first name", 60),
    lastName: text("your last name", 60),
    email: email("the email you registered with on Luma"),
    phone: phone("your phone number"),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Add your date of birth."),
    grade: z.enum(GRADES, { error: "Pick your grade." }),
    school: text("your school", 160),
    shirtSize: z.enum(SHIRT_SIZES, { error: "Pick a shirt size." }),

    /* Who they are building with, so organizers can see teams and match
       anyone still looking at kickoff. */
    teamStatus: z.enum(TEAM_STATUSES.map((t) => t.value) as [TeamStatus, ...TeamStatus[]], { error: "Pick one." }),
    teamName: z.string().trim().max(60, "Keep the team name under 60 characters.").default(""),
    teammates: z
      .array(z.string().trim().max(80, "Keep each name under 80 characters."))
      .max(MAX_TEAMMATES, `Teams are up to four, so up to ${MAX_TEAMMATES} teammates.`)
      .default([])
      .transform((names) => names.filter(Boolean)),

    guardianName: z.string().trim().max(120).default(""),
    guardianRelationship: z.string().trim().max(60).default(""),
    guardianEmail: z.string().trim().toLowerCase().max(200).default(""),
    guardianPhone: z.string().trim().max(40).default(""),
    /* Under 18: how they get home, and who collects them if not a parent. */
    departure: z
      .union([z.enum(DEPARTURES.map((d) => d.value) as [Departure, ...Departure[]]), z.literal("")])
      .default(""),
    pickupName: z.string().trim().max(120).default(""),
    pickupPhone: z.string().trim().max(40).default(""),

    emergencyName: text("an emergency contact", 120),
    emergencyRelationship: text("how they are related to you", 60),
    emergencyPhone: phone("their phone number"),

    allergies: note(),
    medications: note(),
    conditions: note(),
    emergencyInstructions: note(300),
    diet: z.array(z.enum(DIETS.map((d) => d.value) as [Diet, ...Diet[]])).max(DIETS.length).default([]),
    dietNotes: note(300),

    agreeRelease: yes("Agree to the release to continue."),
    agreeMedical: yes("Agree to the medical authorization to continue."),
    agreeConduct: yes("Agree to the code of conduct to continue."),
    agreePrivacy: yes("Agree to how we use this information to continue."),
    mediaConsent: z.enum(["yes", "no"], { error: "Choose yes or no for photos." }),

    /* Each signer types their name or draws a signature. With a drawing,
       the typed field holds their printed name. */
    participantSignature: z.string().trim().max(120).default(""),
    participantSignatureImage: drawn,
    /* The parent or guardian confirms they are one, with authority to consent. */
    guardianAuthority: z.boolean().default(false),
    guardianSignature: z.string().trim().max(120).default(""),
    guardianSignatureImage: drawn,
    /* Under 18: the parent or guardian signs here now, by a link we email
       them, or on a printed copy. */
    guardianMethod: z.enum(GUARDIAN_METHODS).default("here"),
  })
  /* Runs even when other fields have problems (`when`), so every problem
     shows at once. The value may be unparsed then: read it defensively. */
  .superRefine(
    (raw, ctx) => {
      const str = (x: unknown) => (typeof x === "string" ? x.trim() : "");
      const r = raw as Record<string, unknown>;
      const v = {
        firstName: str(r.firstName),
        lastName: str(r.lastName),
        email: str(r.email).toLowerCase(),
        dateOfBirth: str(r.dateOfBirth),
        guardianName: str(r.guardianName),
        guardianRelationship: str(r.guardianRelationship),
        guardianEmail: str(r.guardianEmail).toLowerCase(),
        guardianPhone: str(r.guardianPhone),
        participantSignature: str(r.participantSignature),
        guardianSignature: str(r.guardianSignature),
        guardianMethod: str(r.guardianMethod) || "here",
        participantDrew: str(r.participantSignatureImage).length > 0,
        guardianDrew: str(r.guardianSignatureImage).length > 0,
      };
      /* With a team: at least one teammate's name. */
      const mates = Array.isArray(r.teammates) ? r.teammates.filter((x) => typeof x === "string" && x.trim()) : [];
      if (str(r.teamStatus) === "team" && mates.length === 0) {
        ctx.addIssue({ code: "custom", path: ["teammates"], message: "Add a teammate's name, or pick another option." });
      }

      const age = ageOnEventDay(v.dateOfBirth);
      if (age === null || age < 12 || age > 20) {
        ctx.addIssue({ code: "custom", path: ["dateOfBirth"], message: "Check your date of birth." });
        return;
      }

      if (v.participantDrew) {
        /* drawn: nothing to match */
      } else if (!v.participantSignature) {
        ctx.addIssue({ code: "custom", path: ["participantSignature"], message: "Sign here: draw your signature or type your name." });
      } else if (squash(v.participantSignature) !== squash(`${v.firstName}${v.lastName}`)) {
        ctx.addIssue({ code: "custom", path: ["participantSignature"], message: "Type your full name exactly as above." });
      }

      if (age >= ADULT_AGE) return;

      /* Under 18 on the day: a parent or guardian signs too. */
      const need = (path: string, ok: boolean, message: string) => {
        if (!ok) ctx.addIssue({ code: "custom", path: [path], message });
      };
      need("guardianName", v.guardianName.length > 0, "Add your parent or guardian's name.");
      need("guardianRelationship", v.guardianRelationship.length > 0, "Add how they are related to you.");
      need("guardianEmail", z.email().safeParse(v.guardianEmail).success, "Add their email.");
      const digits = v.guardianPhone.replace(/\D/g, "").length;
      need("guardianPhone", digits >= 10 && digits <= 15, "Add their full phone number, with area code.");
      const departure = str(r.departure);
      need("departure", DEPARTURES.some((d) => d.value === departure), "Pick how you will get home.");
      if (departure === "adult") {
        need("pickupName", str(r.pickupName).length > 0, "Add the name of the adult picking you up.");
        const pickup = str(r.pickupPhone).replace(/\D/g, "").length;
        need("pickupPhone", pickup >= 10 && pickup <= 15, "Add their full phone number, with area code.");
      }
      if (v.guardianEmail && v.guardianEmail === v.email) {
        ctx.addIssue({ code: "custom", path: ["guardianEmail"], message: "Use your parent or guardian's own email." });
      }
      /* Signing later, by link or on paper: nothing to sign now. */
      if (v.guardianMethod !== "here") return;
      need("guardianAuthority", r.guardianAuthority === true, "Your parent or guardian ticks this to confirm.");
      if (v.guardianDrew) {
        /* drawn: nothing to match */
      } else if (!v.guardianSignature) {
        ctx.addIssue({ code: "custom", path: ["guardianSignature"], message: "Your parent or guardian signs here." });
      } else if (v.guardianName && squash(v.guardianSignature) !== squash(v.guardianName)) {
        ctx.addIssue({ code: "custom", path: ["guardianSignature"], message: "Type their full name exactly as above." });
      }
    },
    { when: () => true },
  );

export type WaiverInput = z.input<typeof waiverSchema>;
export type WaiverData = z.output<typeof waiverSchema>;
export type WaiverField = keyof WaiverInput;

/** One signed waiver, as stored. */
export type Waiver = WaiverData & {
  id: string;
  version: string;
  signedAt: string;
  /** Age on the event day, worked out at signing. */
  age: number;
  minor: boolean;
  /** Where the signature came from, for the record. */
  ip: string;
  userAgent: string;
  /** 1 on the first signature; signing again with the same email replaces it. */
  revision: number;
  checkedInAt?: string;
  /** When the parent or guardian signed, and from where, if not at the
      same time as the participant (by link, or on paper). */
  guardianSignedAt?: string;
  guardianIp?: string;
  guardianUserAgent?: string;
  /** SHA-256 of the one-time signing link emailed to the guardian. */
  guardianTokenHash?: string;
  guardianRequestedAt?: string;
  /** Set when an organizer approves it in /admin. Signing again clears it,
      so a changed waiver is reviewed again. */
  approvedAt?: string;
  /** When the "you're in" email went out, or why it did not. */
  approvalEmailedAt?: string;
  approvalEmailError?: string;
};

/** "Picked up by another adult: Sam Lee, (408) 555-0123", or "" for an adult participant. */
export function departureSummary(w: Pick<Waiver, "minor" | "departure" | "pickupName" | "pickupPhone">): string {
  if (!w.minor) return "";
  const d = DEPARTURES.find((x) => x.value === w.departure);
  if (!d) return "Not asked";
  return d.value === "adult" ? `${d.summary}: ${[w.pickupName, w.pickupPhone].filter(Boolean).join(", ")}` : d.summary;
}

/** Whether an emailed signing link is still inside its window. */
export function guardianLinkLive(w: Pick<Waiver, "guardianRequestedAt">, now = Date.now()): boolean {
  if (!w.guardianRequestedAt) return false;
  return now - new Date(w.guardianRequestedAt).getTime() < GUARDIAN_LINK_DAYS * 86_400_000;
}

export const isApproved = (w: Pick<Waiver, "approvedAt">) => !!w.approvedAt;

/** Whether the parent or guardian has signed (or does not need to). */
export const guardianSigned = (w: Pick<Waiver, "minor" | "guardianSignature" | "guardianSignatureImage">) =>
  !w.minor || !!(w.guardianSignature || w.guardianSignatureImage);

/** Where a waiver is: waiting on a parent, waiting on us, or done. */
export function waiverStage(w: Waiver): "guardian" | "review" | "approved" {
  if (!guardianSigned(w)) return "guardian";
  return w.approvedAt ? "approved" : "review";
}

/** A waiver's team in a few words, e.g. "Night Owls: Ana Ruiz, Ben Cho". */
export function teamSummary(w: Pick<Waiver, "teamStatus" | "teamName" | "teammates">): string {
  if (w.teamStatus === "looking") return "Looking for a team";
  if (w.teamStatus === "solo") return "Working solo";
  if (w.teamStatus !== "team") return "Not asked";
  const mates = (w.teammates ?? []).join(", ");
  return [w.teamName, mates ? `with ${mates}` : ""].filter(Boolean).join(", ") || "Has a team";
}
