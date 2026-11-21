"use client";

import { Linkify } from "./linkify";
import { useRef, useState, type ChangeEvent, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { EVENT } from "@/lib/event";
import {
  ADULT_AGE,
  DEPARTURES,
  DIETS,
  GUARDIAN_LINK_DAYS,
  GRADES,
  MAX_TEAMMATES,
  TEAM_STATUSES,
  SHIRT_SIZES,
  WAIVER_VERSION,
  ageOnEventDay,
  waiverSchema,
  type Departure,
  type Diet,
  type GuardianMethod,
  type TeamStatus,
  type Waiver,
  type WaiverField,
} from "@/lib/waiver";
import { CLAUSES, ESIGN, guardianConsent } from "@/lib/waiver-text";
import { formatPhone } from "@/lib/phone";
import { suggestEmail } from "@/lib/email-typos";
import { Button } from "@/components/ui/button";
import { Field, FieldError, describedBy, fieldClass } from "@/components/ui/field";
import { SignaturePad } from "./signature-pad";
import { WaiverRecord } from "./waiver-record";

type Form = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  grade: string;
  school: string;
  shirtSize: string;
  teamStatus: "" | TeamStatus;
  teamName: string;
  teammates: string[];
  guardianName: string;
  guardianRelationship: string;
  guardianEmail: string;
  guardianPhone: string;
  departure: "" | Departure;
  pickupName: string;
  pickupPhone: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  allergies: string;
  medications: string;
  conditions: string;
  emergencyInstructions: string;
  diet: Diet[];
  dietNotes: string;
  agreeRelease: boolean;
  agreeMedical: boolean;
  agreeConduct: boolean;
  agreePrivacy: boolean;
  mediaConsent: "" | "yes" | "no";
  participantSignature: string;
  participantSignatureImage: string;
  guardianAuthority: boolean;
  guardianSignature: string;
  guardianSignatureImage: string;
  guardianMethod: GuardianMethod;
};

export type Mode = "draw" | "type";
type Modes = { participant: Mode; guardian: Mode };

const EMPTY: Form = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  grade: "",
  school: "",
  shirtSize: "",
  teamStatus: "",
  teamName: "",
  teammates: [""],
  guardianName: "",
  guardianRelationship: "",
  guardianEmail: "",
  guardianPhone: "",
  departure: "",
  pickupName: "",
  pickupPhone: "",
  emergencyName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  allergies: "",
  medications: "",
  conditions: "",
  emergencyInstructions: "",
  diet: [],
  dietNotes: "",
  agreeRelease: false,
  agreeMedical: false,
  agreeConduct: false,
  agreePrivacy: false,
  mediaConsent: "",
  participantSignature: "",
  participantSignatureImage: "",
  guardianAuthority: false,
  guardianSignature: "",
  guardianSignatureImage: "",
  guardianMethod: "here",
};

/* The order fields appear in, so the first problem gets focus. */
const ORDER = Object.keys(EMPTY) as WaiverField[];

const AGREE: Record<string, keyof Form> = {
  release: "agreeRelease",
  medical: "agreeMedical",
  conduct: "agreeConduct",
  privacy: "agreePrivacy",
};

type Errors = Partial<Record<WaiverField, string>>;

/* What is sent: each signer's drawing or typed name, whichever they chose. */
function payload(form: Form, modes: Modes): Form {
  return {
    ...form,
    participantSignature: modes.participant === "type" ? form.participantSignature : "",
    participantSignatureImage: modes.participant === "draw" ? form.participantSignatureImage : "",
    guardianAuthority: form.guardianMethod === "here" && form.guardianAuthority,
    guardianSignature: form.guardianMethod === "here" && modes.guardian === "type" ? form.guardianSignature : "",
    guardianSignatureImage: form.guardianMethod === "here" && modes.guardian === "draw" ? form.guardianSignatureImage : "",
  };
}

function check(form: Form): Errors {
  const result = waiverSchema.safeParse(form);
  if (result.success) return {};
  const errors: Errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as WaiverField;
    errors[key] ??= issue.message;
  }
  return errors;
}

/**
 * The participant waiver, one column of plain questions like a paper form:
 * about you, your team, a parent or guardian (only under 18 on the day), an emergency
 * contact, health and food, the agreement, then signatures, drawn or typed.
 * Nothing is checked until the first submit; after that, problems clear as
 * they are fixed.
 */
export function WaiverForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [form, setForm] = useState<Form>({ ...EMPTY, email: initialEmail });
  /* The latest form, for updates that land in the same tick (two
     signature pads, or a pad and a field) so none overwrites another. */
  const latest = useRef(form);
  const [errors, setErrors] = useState<Errors>({});
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [signed, setSigned] = useState<Waiver | null>(null);
  const [sameAsGuardian, setSameAsGuardian] = useState(false);
  const [modes, setModes] = useState<Modes>({ participant: "draw", guardian: "draw" });
  /* Emails the signer confirmed are right after we suggested a fix. */
  const [kept, setKept] = useState<string[]>([]);

  const age = ageOnEventDay(form.dateOfBirth);
  const minor = age === null || age < ADULT_AGE;
  const today = new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date());

  /* A likely typo in an email stops the form until the signer fixes it or says it's right. */
  function typoErrors(f: Form, keep = kept): Errors {
    const out: Errors = {};
    const a = ageOnEventDay(f.dateOfBirth);
    const keys: ("email" | "guardianEmail")[] = a === null || a < ADULT_AGE ? ["email", "guardianEmail"] : ["email"];
    for (const key of keys) {
      const fix = suggestEmail(f[key]);
      if (fix && !keep.includes(f[key].trim().toLowerCase())) out[key] = `${TYPO}${fix}`;
    }
    return out;
  }
  const validate = (f: Form, m: Modes = modes, keep = kept): Errors => ({ ...typoErrors(f, keep), ...check(payload(f, m)) });

  function keepEmail(key: "email" | "guardianEmail") {
    const next = [...kept, latest.current[key].trim().toLowerCase()];
    setKept(next);
    if (tried) setErrors(validate(latest.current, modes, next));
  }

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    let next = { ...latest.current, [key]: value };
    if (sameAsGuardian && key.startsWith("guardian")) next = copyGuardian(next);
    latest.current = next;
    setForm(next);
    if (tried) setErrors(validate(next));
  }

  function setMode(who: keyof Modes, mode: Mode) {
    const next = { ...modes, [who]: mode };
    setModes(next);
    if (tried) setErrors(validate(latest.current, next));
  }

  function copyGuardian(f: Form): Form {
    return { ...f, emergencyName: f.guardianName, emergencyRelationship: f.guardianRelationship, emergencyPhone: f.guardianPhone };
  }

  function toggleSame(on: boolean) {
    setSameAsGuardian(on);
    if (on) {
      const next = copyGuardian(latest.current);
      latest.current = next;
      setForm(next);
      if (tried) setErrors(validate(next));
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTried(true);
    setFailure(null);
    const body = payload(latest.current, modes);
    const found = { ...typoErrors(latest.current), ...check(body) };
    setErrors(found);
    const firstBad = ORDER.find((k) => found[k]);
    if (firstBad) {
      document.getElementById(`w-${firstBad}`)?.focus();
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/waiver", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await res.json().catch(() => null)) as
        | { ok: true; id: string; signedAt: string; revision: number }
        | { ok: false; error?: string; fields?: Errors }
        | null;
      if (!res.ok || !payload?.ok) {
        const fields = payload && !payload.ok ? payload.fields : undefined;
        if (fields) {
          setErrors(fields);
          const bad = ORDER.find((k) => fields[k]);
          if (bad) document.getElementById(`w-${bad}`)?.focus();
        }
        setFailure((payload && !payload.ok && payload.error) || "That did not go through. Try again.");
        return;
      }
      const data = waiverSchema.parse(body);
      setSigned({
        ...data,
        participantSignature: data.participantSignatureImage ? `${data.firstName} ${data.lastName}` : data.participantSignature,
        guardianSignature: data.guardianSignatureImage ? data.guardianName : data.guardianSignature,
        id: payload.id,
        signedAt: payload.signedAt,
        revision: payload.revision,
        version: WAIVER_VERSION,
        age: age ?? 0,
        minor: !!age && age < ADULT_AGE,
        ip: "",
        userAgent: "",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFailure("Network trouble. Check your connection and send it again.");
    } finally {
      setSending(false);
    }
  }

  if (signed) return <Signed waiver={signed} />;

  /* Phone fields format as you type; the caret stays after the same digit. */
  function onPhone(key: "phone" | "guardianPhone" | "pickupPhone" | "emergencyPhone", e: ChangeEvent<HTMLInputElement>) {
    const el = e.target;
    const caret = el.selectionStart ?? el.value.length;
    const digitsBefore = el.value.slice(0, caret).replace(/\D/g, "").length;
    const next = formatPhone(el.value);
    update(key, next);
    requestAnimationFrame(() => {
      if (document.activeElement !== el) return;
      let i = 0;
      for (let seen = 0; i < next.length && seen < digitsBefore; i++) if (/\d/.test(next[i])) seen++;
      el.setSelectionRange(i, i);
    });
  }

  /* Shorthand for a text input wired to the form. */
  const input = (key: keyof Form & WaiverField, props: ComponentProps<"input"> = {}, hint = false) => (
    <input
      id={`w-${key}`}
      className={fieldClass}
      value={form[key] as string}
      onChange={(e) => update(key, e.target.value as never)}
      aria-invalid={errors[key] ? true : undefined}
      aria-describedby={describedBy(`w-${key}`, hint, !!errors[key])}
      {...props}
    />
  );
  const area = (key: keyof Form & WaiverField, placeholder: string, hint = false) => (
    <textarea
      id={`w-${key}`}
      className={`${fieldClass} min-h-24 resize-y`}
      value={form[key] as string}
      onChange={(e) => update(key, e.target.value as never)}
      placeholder={placeholder}
      aria-invalid={errors[key] ? true : undefined}
      aria-describedby={describedBy(`w-${key}`, hint, !!errors[key])}
      rows={2}
    />
  );

  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Card n={1} title="About you">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="w-firstName" label="First name" error={errors.firstName}>
            {input("firstName", { autoComplete: "given-name" })}
          </Field>
          <Field id="w-lastName" label="Last name" error={errors.lastName}>
            {input("lastName", { autoComplete: "family-name" })}
          </Field>
        </div>
        <Field
          id="w-email"
          label="Email"
          hint="The same email you registered with on Luma, so we can match your waiver to your ticket."
          error={typo(errors.email) ? null : errors.email}
        >
          {input("email", { type: "email", autoComplete: "email", inputMode: "email" }, true)}
          <EmailSuggestion
            value={form.email}
            kept={kept}
            onUse={(fix) => update("email", fix)}
            onKeep={() => keepEmail("email")}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="w-phone" label="Your phone number" error={errors.phone}>
            {input("phone", { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "(408) 555-0123", onChange: (e) => onPhone("phone", e) })}
          </Field>
          <Field id="w-dateOfBirth" label="Date of birth" error={errors.dateOfBirth}>
            {input("dateOfBirth", { type: "date", autoComplete: "bday", max: EVENT.date.iso })}
          </Field>
        </div>
        <Field id="w-school" label="School" error={errors.school}>
          {input("school", { autoComplete: "organization" })}
        </Field>
        <Choices
          id="w-grade"
          label="Grade"
          options={GRADES.map((g) => ({ value: g, label: `${g}th` }))}
          value={form.grade}
          onChange={(v) => update("grade", v)}
          error={errors.grade}
        />
        <Choices
          id="w-shirtSize"
          label="T-shirt size"
          hint="Adult unisex sizes."
          options={SHIRT_SIZES.map((s) => ({ value: s, label: s }))}
          value={form.shirtSize}
          onChange={(v) => update("shirtSize", v)}
          error={errors.shirtSize}
        />
      </Card>

      <Card n={2} title="Your team" lede="Teams are up to four people. No team yet? We match people at kickoff.">
        <Choices
          id="w-teamStatus"
          label="Are you on a team?"
          options={TEAM_STATUSES.map((t) => ({ value: t.value, label: t.label }))}
          value={form.teamStatus}
          onChange={(v) => update("teamStatus", v as TeamStatus)}
          error={errors.teamStatus}
        />
        {form.teamStatus === "team" ? (
          <>
            <Field id="w-teamName" label="Team name" optional error={errors.teamName}>
              {input("teamName", { autoComplete: "off", placeholder: "If you have one" })}
            </Field>
            <fieldset className="flex flex-col gap-2" aria-describedby={describedBy("w-teammates", true, !!errors.teammates)}>
              <legend className="mb-2 text-[0.9375rem] font-semibold text-ink">Your teammates</legend>
              {form.teammates.map((name, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    id={i === 0 ? "w-teammates" : `w-teammates-${i}`}
                    className={fieldClass}
                    value={name}
                    onChange={(e) => update("teammates", latest.current.teammates.map((n, j) => (j === i ? e.target.value : n)))}
                    placeholder={`Teammate ${i + 1}, full name`}
                    aria-label={`Teammate ${i + 1}, full name`}
                    aria-invalid={i === 0 && errors.teammates ? true : undefined}
                    autoComplete="off"
                  />
                  {form.teammates.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => update("teammates", latest.current.teammates.filter((_, j) => j !== i))}
                      className="shrink-0 rounded-xl border border-line-2 bg-card px-3 text-[0.875rem] font-semibold text-ink-3 hover:border-ink hover:text-ink"
                    >
                      Remove<span className="sr-only"> teammate {i + 1}</span>
                    </button>
                  ) : null}
                </div>
              ))}
              {form.teammates.length < MAX_TEAMMATES ? (
                <button
                  type="button"
                  onClick={() => update("teammates", [...latest.current.teammates, ""])}
                  className="w-fit text-[0.9375rem] font-semibold text-ink underline decoration-lamp decoration-2 underline-offset-4 hover:decoration-[0.3em]"
                >
                  + Add another teammate
                </button>
              ) : null}
              <p id="w-teammates-hint" className="text-[0.8125rem] text-ink-3">
                Each teammate signs their own waiver.
              </p>
              {errors.teammates ? <FieldError id="w-teammates-error">{errors.teammates}</FieldError> : null}
            </fieldset>
          </>
        ) : null}
      </Card>

      {minor ? (
        <Card
          n={3}
          title="Parent or guardian"
          lede={
            age === null
              ? "Needed if you will be under 18 on January 30, 2027. They also sign at the end."
              : `You will be ${age} on the day, so a parent or guardian signs too: on this device, from a link we email them, or on paper.`
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="w-guardianName" label="Their full name" error={errors.guardianName}>
              {input("guardianName", { autoComplete: "off" })}
            </Field>
            <Field id="w-guardianRelationship" label="Relationship to you" error={errors.guardianRelationship}>
              {input("guardianRelationship", { placeholder: "Mother, father, guardian…" })}
            </Field>
            <Field id="w-guardianEmail" label="Their email" error={typo(errors.guardianEmail) ? null : errors.guardianEmail}>
              {input("guardianEmail", { type: "email", inputMode: "email", autoComplete: "off" })}
              <EmailSuggestion
                value={form.guardianEmail}
                kept={kept}
                onUse={(fix) => update("guardianEmail", fix)}
                onKeep={() => keepEmail("guardianEmail")}
              />
            </Field>
            <Field id="w-guardianPhone" label="Their phone number" error={errors.guardianPhone}>
              {input("guardianPhone", { type: "tel", inputMode: "tel", autoComplete: "off", placeholder: "(408) 555-0123", onChange: (e) => onPhone("guardianPhone", e) })}
            </Field>
          </div>
          <Choices
            id="w-departure"
            label="How will you get home?"
            hint="Pick what your parent or guardian has agreed to. They confirm it when they sign, and we check it when you leave."
            options={DEPARTURES.map((d) => ({ value: d.value, label: d.label }))}
            value={form.departure}
            onChange={(v) => update("departure", v as Departure)}
            error={errors.departure}
          />
          {form.departure === "adult" ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="w-pickupName" label="Adult picking you up" error={errors.pickupName}>
                {input("pickupName", { autoComplete: "off", placeholder: "Full name" })}
              </Field>
              <Field id="w-pickupPhone" label="Their phone number" error={errors.pickupPhone}>
                {input("pickupPhone", { type: "tel", inputMode: "tel", autoComplete: "off", placeholder: "(408) 555-0123", onChange: (e) => onPhone("pickupPhone", e) })}
              </Field>
            </div>
          ) : null}
        </Card>
      ) : (
        <Card n={3} title="Parent or guardian" lede={`You will be ${age} on the day, so you sign for yourself. Skip ahead.`} />
      )}

      <Card n={4} title="Emergency contact" lede="Someone we can reach during the event if anything happens.">
        {minor ? (
          <Check checked={sameAsGuardian} onChange={toggleSame}>
            Same as my parent or guardian
          </Check>
        ) : null}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="w-emergencyName" label="Their full name" error={errors.emergencyName}>
            {input("emergencyName", { autoComplete: "off", readOnly: sameAsGuardian })}
          </Field>
          <Field id="w-emergencyRelationship" label="Relationship to you" error={errors.emergencyRelationship}>
            {input("emergencyRelationship", { readOnly: sameAsGuardian })}
          </Field>
        </div>
        <Field id="w-emergencyPhone" label="Their phone number" error={errors.emergencyPhone}>
          {input("emergencyPhone", { type: "tel", inputMode: "tel", autoComplete: "off", readOnly: sameAsGuardian, placeholder: "(408) 555-0123", onChange: (e) => onPhone("emergencyPhone", e) })}
        </Field>
      </Card>

      <Card n={5} title="Health and food" lede="Only organizers who need it, and anyone treating you, will see this. Leave blank if none.">
        <Field
          id="w-allergies"
          label="Allergies"
          optional
          hint="Food comes from caterers and sponsors and may contain or have touched allergens, so we can't promise an allergen-free event."
          error={errors.allergies}
        >
          {area("allergies", "Food, medicine, insect stings…", true)}
        </Field>
        <Field id="w-medications" label="Medications" optional error={errors.medications}>
          {area("medications", "Anything you take, or carry like an inhaler or EpiPen")}
        </Field>
        <Field id="w-conditions" label="Medical conditions we should know about" optional error={errors.conditions}>
          {area("conditions", "Asthma, diabetes, seizures…")}
        </Field>
        <Field id="w-emergencyInstructions" label="Emergency instructions, or where your medication is" optional error={errors.emergencyInstructions}>
          {area("emergencyInstructions", "e.g. EpiPen in the front pocket of my backpack; call my mom first")}
        </Field>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 flex w-full items-baseline justify-between text-[0.9375rem] font-semibold text-ink">
            Food
            <span className="text-[0.8125rem] font-normal text-ink-3">Optional</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {DIETS.map((d) => {
              const on = form.diet.includes(d.value);
              return (
                <label
                  key={d.value}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-[0.9375rem] transition-colors has-focus-visible:outline-2 has-focus-visible:outline-ink ${
                    on ? "border-ink bg-ink text-fog" : "border-line-2 bg-card text-ink hover:border-ink-3"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={on}
                    onChange={() => update("diet", on ? form.diet.filter((x) => x !== d.value) : [...form.diet, d.value])}
                  />
                  {d.label}
                </label>
              );
            })}
          </div>
        </fieldset>
        <Field id="w-dietNotes" label="Anything else about food" optional error={errors.dietNotes}>
          {input("dietNotes", { placeholder: "e.g. no pork, or a severe sesame allergy" })}
        </Field>
      </Card>

      <Card n={6} title="The agreement" lede="Read each part, then tick to agree. Your parent or guardian reads it too when they sign.">
        {CLAUSES.map((clause) => {
          const key = AGREE[clause.id] as WaiverField | undefined;
          return (
            <div key={clause.id} className="rounded-xl border border-line">
              <div className="px-5 pt-4 pb-3">
                <h3 className="text-[1rem] font-bold font-stretch-[112.5%] tracking-[-0.01em]">{clause.title}</h3>
                {clause.paragraphs.map((p, i) => (
                  <p key={i} className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">
                    <Linkify text={p} />
                  </p>
                ))}
              </div>
              <div className="border-t border-line bg-fog-2/50 px-5 py-3.5">
                {key ? (
                  <>
                    <Check
                      id={`w-${key}`}
                      checked={form[key as keyof Form] as boolean}
                      onChange={(v) => update(key as keyof Form, v as never)}
                      invalid={!!errors[key]}
                    >
                      I have read and agree
                    </Check>
                    {errors[key] ? (
                      <div className="mt-2">
                        <FieldError id={`w-${key}-error`}>{errors[key]}</FieldError>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <Choices
                    id="w-mediaConsent"
                    label="May we use photos and video that include you?"
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ]}
                    value={form.mediaConsent}
                    onChange={(v) => update("mediaConsent", v as Form["mediaConsent"])}
                    error={errors.mediaConsent}
                  />
                )}
              </div>
            </div>
          );
        })}
      </Card>

      <Card n={7} title="Sign" lede={ESIGN}>
        <SignBlock
          id="w-participantSignature"
          label="Participant signature"
          printed={`${form.firstName} ${form.lastName}`.trim()}
          mode={modes.participant}
          onMode={(m) => setMode("participant", m)}
          image={form.participantSignatureImage}
          onImage={(v) => update("participantSignatureImage", v)}
          error={errors.participantSignature ?? errors.participantSignatureImage}
          typed={input("participantSignature", { autoComplete: "off", className: `${fieldClass} text-[1.25rem] italic font-semibold` }, true)}
        />
        {minor ? (
          <div className="rounded-xl bg-lamp-wash p-5">
            <Choices
              id="w-guardianMethod"
              label="How will your parent or guardian sign?"
              options={[
                { value: "here", label: "Here, now" },
                { value: "email", label: "Email them a link" },
                { value: "paper", label: "Print it" },
              ]}
              value={form.guardianMethod}
              onChange={(v) => update("guardianMethod", v as GuardianMethod)}
            />
            <div className="mt-5">
              {form.guardianMethod === "here" ? (
                <>
                  <p className="text-[0.9375rem] leading-relaxed text-ink-2">
                    <strong className="font-semibold text-ink">Hand the device to your parent or guardian.</strong> They
                    read the agreement above, then this:
                  </p>
                  <div className="mt-3 mb-4 flex flex-col gap-2 rounded-xl bg-card p-4 text-[0.9375rem] leading-relaxed text-ink-2">
                    {guardianConsent(`${form.firstName} ${form.lastName}`.trim() || undefined).map((p) => (
                      <p key={p.slice(0, 24)}>{p}</p>
                    ))}
                  </div>
                  <div className="mb-5">
                    <Check
                      id="w-guardianAuthority"
                      checked={form.guardianAuthority}
                      onChange={(v) => update("guardianAuthority", v)}
                      invalid={!!errors.guardianAuthority}
                    >
                      I am {form.guardianName || "their parent or legal guardian"}, and I agree to the statement above.
                    </Check>
                    {errors.guardianAuthority ? (
                      <div className="mt-2">
                        <FieldError id="w-guardianAuthority-error">{errors.guardianAuthority}</FieldError>
                      </div>
                    ) : null}
                  </div>
                  <SignBlock
                    id="w-guardianSignature"
                    label="Parent or guardian signature"
                    printed={form.guardianName}
                    mode={modes.guardian}
                    onMode={(m) => setMode("guardian", m)}
                    image={form.guardianSignatureImage}
                    onImage={(v) => update("guardianSignatureImage", v)}
                    error={errors.guardianSignature ?? errors.guardianSignatureImage}
                    typed={input("guardianSignature", { autoComplete: "off", className: `${fieldClass} text-[1.25rem] italic font-semibold` }, true)}
                  />
                </>
              ) : form.guardianMethod === "email" ? (
                <p className="text-[0.9375rem] leading-relaxed text-ink-2">
                  When you submit, we email{" "}
                  <strong className="font-semibold text-ink">{form.guardianEmail || "your parent or guardian"}</strong> a
                  private link. They check what you entered, read the agreement and sign from their own phone or
                  computer. The link works once and for {GUARDIAN_LINK_DAYS} days. Your waiver is complete once they sign,
                  and you can&rsquo;t check in until then.
                </p>
              ) : (
                <p className="text-[0.9375rem] leading-relaxed text-ink-2">
                  When you submit, you get a copy to <strong className="font-semibold text-ink">print or save as a PDF</strong>.
                  Your parent or guardian signs it by hand; then email a photo or scan to{" "}
                  <a href={`mailto:${EVENT.email.team}`} className="link text-ink">
                    {EVENT.email.team}
                  </a>{" "}
                  or bring it to check-in. You can&rsquo;t check in without it.
                </p>
              )}
            </div>
          </div>
        ) : null}
        <p className="text-[0.875rem] text-ink-3">Date: {today}</p>
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite" className="min-h-6">
          {failure ? (
            <FieldError id="w-failure">{failure}</FieldError>
          ) : tried && errorCount ? (
            <FieldError id="w-summary">
              {errorCount === 1 ? "One thing still needs fixing above." : `${errorCount} things still need fixing above.`}
            </FieldError>
          ) : null}
        </div>
        <Button type="submit" size="lg" loading={sending} className="sm:min-w-56">
          Sign and submit
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------ pieces */

/* A typo error is shown as the suggestion box, not as a red line. */
const TYPO = "Did you mean ";
const typo = (message?: string) => !!message?.startsWith(TYPO);

/**
 * Under an email field, while it looks like a typo: the likely address,
 * one tap to use it, or one to keep what was typed.
 */
function EmailSuggestion({
  value,
  kept,
  onUse,
  onKeep,
}: {
  value: string;
  kept: string[];
  onUse: (fix: string) => void;
  onKeep: () => void;
}) {
  const fix = suggestEmail(value);
  const show = fix && !kept.includes(value.trim().toLowerCase());
  return (
    <div aria-live="polite">
      {show ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-lamp-wash px-4 py-3 text-[0.9375rem] text-ink-2">
          <span>
            Did you mean <strong className="font-semibold text-ink">{fix}</strong>?
          </span>
          <span className="flex gap-2">
            <button type="button" onClick={() => onUse(fix)} className="rounded-full bg-ink px-3.5 py-1 text-[0.875rem] font-semibold text-fog hover:bg-ink-2">
              Use it
            </button>
            <button type="button" onClick={onKeep} className="rounded-full border border-line-2 bg-card px-3.5 py-1 text-[0.875rem] font-semibold text-ink hover:border-ink">
              Keep mine
            </button>
          </span>
        </div>
      ) : null}
    </div>
  );
}

function Card({ n, title, lede, children }: { n: number; title: string; lede?: string; children?: ReactNode }) {
  return (
    <section aria-labelledby={`w-card-${n}`} className="rounded-2xl border border-line bg-card p-6 sm:p-8">
      <div className="flex items-baseline gap-3">
        <span className="kicker text-lamp-deep">{String(n).padStart(2, "0")}</span>
        <h2 id={`w-card-${n}`} className="text-[1.375rem] leading-tight font-bold font-stretch-[112.5%] tracking-[-0.015em]">
          {title}
        </h2>
      </div>
      {lede ? <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-3">{lede}</p> : null}
      {children ? <div className="mt-6 flex flex-col gap-5">{children}</div> : null}
    </section>
  );
}

/** A row of pill buttons for one choice: a radio group underneath. */
function Choices({
  id,
  label,
  hint,
  options,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <fieldset aria-describedby={describedBy(id, !!hint, !!error)} aria-invalid={error ? true : undefined}>
      <legend className="mb-2 text-[0.9375rem] font-semibold text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => {
          const on = value === o.value;
          return (
            <label
              key={o.value}
              className={`flex min-w-14 cursor-pointer justify-center rounded-full border px-4 py-2 text-[0.9375rem] font-medium transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink ${
                on ? "border-ink bg-ink text-fog" : error ? "border-danger bg-card text-ink" : "border-line-2 bg-card text-ink hover:border-ink-3"
              }`}
            >
              <input
                id={i === 0 ? id : undefined}
                type="radio"
                name={id}
                value={o.value}
                className="sr-only"
                checked={on}
                onChange={() => onChange(o.value)}
              />
              {o.label}
            </label>
          );
        })}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="mt-2 text-[0.8125rem] text-ink-3">
          {hint}
        </p>
      ) : null}
      {error ? (
        <div className="mt-2">
          <FieldError id={`${id}-error`}>{error}</FieldError>
        </div>
      ) : null}
    </fieldset>
  );
}

function Check({
  id,
  checked,
  onChange,
  invalid = false,
  children,
}: {
  id?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  invalid?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem] font-medium text-ink">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-invalid={invalid ? true : undefined}
        className={`mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-ink ${invalid ? "outline-2 outline-offset-2 outline-danger" : ""}`}
      />
      <span>{children}</span>
    </label>
  );
}

/**
 * One signer: draw (finger, mouse or pen) or type, switched by two pills
 * above. Under a drawing, their printed name; under typing, a hint with
 * the name to type.
 */
export function SignBlock({
  id,
  label,
  printed,
  mode,
  onMode,
  image,
  onImage,
  error,
  typed,
}: {
  id: string;
  label: string;
  printed: string;
  mode: Mode;
  onMode: (m: Mode) => void;
  image: string;
  onImage: (v: string) => void;
  error?: string;
  typed: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[0.9375rem] font-semibold text-ink">{label}</span>
        <div role="group" aria-label={`How to sign: ${label}`} className="inline-flex rounded-full bg-fog-2 p-1">
          {(["draw", "type"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => onMode(m)}
              className={`rounded-full px-3.5 py-1 text-[0.8125rem] font-semibold transition-colors ${
                mode === m ? "bg-card text-ink shadow-[0_1px_3px_rgb(15_24_40/0.12)]" : "text-ink-3 hover:text-ink"
              }`}
            >
              {m === "draw" ? "Draw" : "Type"}
            </button>
          ))}
        </div>
      </div>
      {mode === "draw" ? (
        <>
          <SignaturePad
            id={id}
            label={label}
            value={image}
            onChange={onImage}
            invalid={!!error}
            describedBy={describedBy(id, true, !!error)}
          />
          <p id={`${id}-hint`} className="-mt-7 text-[0.8125rem] text-ink-3">
            {printed ? `Signing as ${printed}` : "Sign with your finger, mouse or pen."}
          </p>
        </>
      ) : (
        <>
          {typed}
          <p id={`${id}-hint`} className="text-[0.8125rem] text-ink-3">
            {printed ? `Type your full name: ${printed}` : "Type your full name."}
          </p>
        </>
      )}
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </div>
  );
}

/* ------------------------------------------------------------ done */

function Signed({ waiver }: { waiver: Waiver }) {
  const waitingOn = waiver.minor && waiver.guardianMethod !== "here" ? waiver.guardianMethod : null;
  const code = waiver.id.slice(0, 8).toUpperCase();
  return (
    <div className="flex flex-col gap-6">
      <div className="night relative overflow-hidden rounded-2xl p-7 sm:p-9 print:hidden">
        <span aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-lamp/25 blur-3xl" />
        <p className="kicker relative text-lamp">{waitingOn ? "Almost done" : "Waiver submitted"}</p>
        <h2 className="relative mt-3 text-[clamp(2rem,5vw,3rem)] leading-none font-extrabold font-stretch-125% tracking-[-0.04em]">
          {waitingOn === "email"
            ? `Now ${waiver.guardianName.split(" ")[0] || "your parent"} signs.`
            : waitingOn === "paper"
              ? "Print it for your parent to sign."
              : `Thanks, ${waiver.firstName}. It\u2019s in for review.`}
        </h2>
        <p className="relative mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-moon-2">
          {waitingOn === "email" ? (
            <>
              We emailed <strong className="font-semibold text-moon">{waiver.guardianEmail}</strong> a link to sign. Once they
              do, we review it and email you when you&rsquo;re in. Tell them to check spam if it doesn&rsquo;t arrive.{" "}
            </>
          ) : waitingOn === "paper" ? (
            <>
              Print this page or save it as a PDF. Your parent or guardian signs on the line at the end; then email a photo
              or scan to <strong className="font-semibold text-moon">{EVENT.email.team}</strong>, or bring it to check-in.
              Once we have it, we review it and email you when you&rsquo;re in.{" "}
            </>
          ) : (
            <>
              We&rsquo;ll email <strong className="font-semibold text-moon">{waiver.email}</strong>
              {waiver.minor ? <> and {waiver.guardianEmail}</> : null} once it&rsquo;s approved. Keep a copy of what you
              signed: print it or save it as a PDF.{" "}
            </>
          )}
          Your confirmation number is <strong className="font-semibold text-moon">{code}</strong>.
        </p>
        <Button type="button" variant="lamp" size="lg" className="relative mt-6" onClick={() => window.print()}>
          {waitingOn === "paper" ? "Print or save as PDF" : "Print or save a copy"}
        </Button>
      </div>
      <div className="rounded-2xl border border-line bg-card p-6 sm:p-8 print:border-0 print:p-0">
        <h2 className="mb-6 text-[1.375rem] font-bold font-stretch-[112.5%]">{EVENT.name} participant waiver</h2>
        <WaiverRecord waiver={waiver} />
      </div>
    </div>
  );
}
