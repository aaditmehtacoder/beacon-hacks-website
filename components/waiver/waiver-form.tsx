"use client";

import { useRef, useState, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { EVENT } from "@/lib/event";
import {
  ADULT_AGE,
  DIETS,
  GRADES,
  SHIRT_SIZES,
  WAIVER_VERSION,
  ageOnEventDay,
  waiverSchema,
  type Diet,
  type Waiver,
  type WaiverField,
} from "@/lib/waiver";
import { CLAUSES, ESIGN } from "@/lib/waiver-text";
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
  guardianName: string;
  guardianRelationship: string;
  guardianEmail: string;
  guardianPhone: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  allergies: string;
  medications: string;
  conditions: string;
  diet: Diet[];
  dietNotes: string;
  agreeRelease: boolean;
  agreeMedical: boolean;
  agreeConduct: boolean;
  agreePrivacy: boolean;
  mediaConsent: "" | "yes" | "no";
  participantSignature: string;
  participantSignatureImage: string;
  guardianSignature: string;
  guardianSignatureImage: string;
};

type Mode = "draw" | "type";
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
  guardianName: "",
  guardianRelationship: "",
  guardianEmail: "",
  guardianPhone: "",
  emergencyName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  allergies: "",
  medications: "",
  conditions: "",
  diet: [],
  dietNotes: "",
  agreeRelease: false,
  agreeMedical: false,
  agreeConduct: false,
  agreePrivacy: false,
  mediaConsent: "",
  participantSignature: "",
  participantSignatureImage: "",
  guardianSignature: "",
  guardianSignatureImage: "",
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
    guardianSignature: modes.guardian === "type" ? form.guardianSignature : "",
    guardianSignatureImage: modes.guardian === "draw" ? form.guardianSignatureImage : "",
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
 * about you, a parent or guardian (only under 18 on the day), an emergency
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

  const age = ageOnEventDay(form.dateOfBirth);
  const minor = age === null || age < ADULT_AGE;
  const today = new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date());

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    let next = { ...latest.current, [key]: value };
    if (sameAsGuardian && key.startsWith("guardian")) next = copyGuardian(next);
    latest.current = next;
    setForm(next);
    if (tried) setErrors(check(payload(next, modes)));
  }

  function setMode(who: keyof Modes, mode: Mode) {
    const next = { ...modes, [who]: mode };
    setModes(next);
    if (tried) setErrors(check(payload(latest.current, next)));
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
      if (tried) setErrors(check(payload(next, modes)));
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTried(true);
    setFailure(null);
    const body = payload(latest.current, modes);
    const found = check(body);
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
  const area = (key: keyof Form & WaiverField, placeholder: string) => (
    <textarea
      id={`w-${key}`}
      className={`${fieldClass} min-h-24 resize-y`}
      value={form[key] as string}
      onChange={(e) => update(key, e.target.value as never)}
      placeholder={placeholder}
      aria-invalid={errors[key] ? true : undefined}
      aria-describedby={describedBy(`w-${key}`, false, !!errors[key])}
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
          error={errors.email}
        >
          {input("email", { type: "email", autoComplete: "email", inputMode: "email" }, true)}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="w-phone" label="Your phone number" error={errors.phone}>
            {input("phone", { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "(408) 555-0123" })}
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

      {minor ? (
        <Card
          n={2}
          title="Parent or guardian"
          lede={
            age === null
              ? "Needed if you will be under 18 on January 30, 2027. They also sign at the end."
              : `You will be ${age} on the day, so a parent or guardian signs too. They can do it on this device at the end.`
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="w-guardianName" label="Their full name" error={errors.guardianName}>
              {input("guardianName", { autoComplete: "off" })}
            </Field>
            <Field id="w-guardianRelationship" label="Relationship to you" error={errors.guardianRelationship}>
              {input("guardianRelationship", { placeholder: "Mother, father, guardian…" })}
            </Field>
            <Field id="w-guardianEmail" label="Their email" error={errors.guardianEmail}>
              {input("guardianEmail", { type: "email", inputMode: "email", autoComplete: "off" })}
            </Field>
            <Field id="w-guardianPhone" label="Their phone number" error={errors.guardianPhone}>
              {input("guardianPhone", { type: "tel", inputMode: "tel", autoComplete: "off" })}
            </Field>
          </div>
        </Card>
      ) : (
        <Card n={2} title="Parent or guardian" lede={`You will be ${age} on the day, so you sign for yourself. Skip ahead.`} />
      )}

      <Card n={3} title="Emergency contact" lede="Someone we can reach during the event if anything happens.">
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
          {input("emergencyPhone", { type: "tel", inputMode: "tel", autoComplete: "off", readOnly: sameAsGuardian })}
        </Field>
      </Card>

      <Card n={4} title="Health and food" lede="Only organizers who need it, and anyone treating you, will see this. Leave blank if none.">
        <Field id="w-allergies" label="Allergies" optional error={errors.allergies}>
          {area("allergies", "Food, medicine, insect stings…")}
        </Field>
        <Field id="w-medications" label="Medications" optional error={errors.medications}>
          {area("medications", "Anything you take, or carry like an inhaler or EpiPen")}
        </Field>
        <Field id="w-conditions" label="Medical conditions we should know about" optional error={errors.conditions}>
          {area("conditions", "Asthma, diabetes, seizures…")}
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

      <Card n={5} title="The agreement" lede={`Read each part${minor ? " together with your parent or guardian" : ""}, then tick to agree.`}>
        {CLAUSES.map((clause) => {
          const key = AGREE[clause.id] as WaiverField | undefined;
          return (
            <div key={clause.id} className="rounded-xl border border-line">
              <div className="px-5 pt-4 pb-3">
                <h3 className="text-[1rem] font-bold font-stretch-[112.5%] tracking-[-0.01em]">{clause.title}</h3>
                {clause.paragraphs.map((p) => (
                  <p key={p.slice(0, 32)} className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">
                    {p}
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
                      I have read and agree{minor ? ", and so does my parent or guardian" : ""}
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

      <Card n={6} title="Sign" lede={ESIGN}>
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
            <p className="mb-4 text-[0.9375rem] leading-relaxed text-ink-2">
              <strong className="font-semibold text-ink">Parent or guardian:</strong> by signing, you agree to this
              waiver for yourself and for your child, and confirm the information above is correct.
            </p>
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
function SignBlock({
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
  return (
    <div className="flex flex-col gap-6">
      <div className="night relative overflow-hidden rounded-2xl p-7 sm:p-9 print:hidden">
        <span aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-lamp/25 blur-3xl" />
        <p className="kicker relative text-lamp">Waiver signed</p>
        <h2 className="relative mt-3 text-[clamp(2rem,5vw,3rem)] leading-none font-extrabold font-stretch-125% tracking-[-0.04em]">
          You&rsquo;re all set, {waiver.firstName}.
        </h2>
        <p className="relative mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-moon-2">
          Your confirmation number is{" "}
          <strong className="font-semibold text-moon">{waiver.id.slice(0, 8).toUpperCase()}</strong>. Keep a copy of
          what you signed: print it or save it as a PDF. Need to change something? Fill the form in again with the same
          email and the new one replaces this.
        </p>
        <Button type="button" variant="lamp" size="lg" className="relative mt-6" onClick={() => window.print()}>
          Print or save a copy
        </Button>
      </div>
      <div className="rounded-2xl border border-line bg-card p-6 sm:p-8 print:border-0 print:p-0">
        <h2 className="mb-6 text-[1.375rem] font-bold font-stretch-[112.5%]">
          {EVENT.name} participant waiver
        </h2>
        <WaiverRecord waiver={waiver} />
      </div>
    </div>
  );
}
