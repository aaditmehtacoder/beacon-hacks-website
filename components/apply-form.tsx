"use client";

import { useEffect, useRef, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, FieldError, describedBy, fieldClass } from "@/components/ui/field";
import { applySchema } from "@/lib/notify-schema";
import { EVENT, mailto } from "@/lib/event";

const GRADES = ["9", "10", "11", "12"] as const;
const IDEA_MAX = 280;

type FieldName = "name" | "email" | "school" | "grade" | "firstHackathon" | "idea";
type Errors = Partial<Record<FieldName, string>>;

/** Messages a student reads, keyed by field. The schema's own messages are
    used where they already read well. */
const FALLBACK: Record<FieldName, string> = {
  name: "Tell us your name.",
  email: "That email does not look right.",
  school: "Which school do you go to?",
  grade: "Pick your grade.",
  firstHackathon: "Is this your first hackathon? Either answer is a good one.",
  idea: `Keep it under ${IDEA_MAX} characters.`,
};

/**
 * The early application. Six fields, one optional. Errors show beside the
 * field they belong to, focus moves to the first one, and the success
 * state says you are in the queue, not that you have a seat.
 */
export function ApplyForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState<(typeof GRADES)[number] | "">("");
  const [firstHackathon, setFirstHackathon] = useState<boolean | null>(null);
  const [idea, setIdea] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const form = useRef<HTMLFormElement>(null);
  const doneHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (done) doneHeading.current?.focus();
  }, [done]);

  const clear = (field: FieldName) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  function focusFirstInvalid(found: Errors) {
    const order: FieldName[] = ["name", "email", "school", "grade", "firstHackathon", "idea"];
    const first = order.find((f) => found[f]);
    if (!first) return;
    const el = form.current?.querySelector<HTMLElement>(`[data-field="${first}"]`);
    el?.focus();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = applySchema.safeParse({ name, email, school, grade, firstHackathon, idea });
    if (!parsed.success) {
      const found: Errors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as FieldName;
        if (!found[field]) {
          found[field] = field === "firstHackathon" || field === "grade" ? FALLBACK[field] : issue.message || FALLBACK[field];
        }
      }
      setErrors(found);
      focusFirstInvalid(found);
      return;
    }
    setErrors({});

    setSending(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setFormError(payload?.error ?? "We could not save that. Try again in a moment.");
        return;
      }
      setDone(true);
    } catch {
      setFormError("Network trouble. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="py-2 sm:py-4">
        <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-lamp text-ink shadow-[0_10px_30px_-12px_rgb(255_199_44/0.8)]">
          <svg viewBox="0 0 16 16" className="size-5" fill="none">
            <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h2
          ref={doneHeading}
          tabIndex={-1}
          className="mt-6 text-[2.25rem] leading-none font-bold tracking-[-0.035em] focus:outline-none"
        >
          You are in the queue.
        </h2>
        <p className="mt-5 max-w-md leading-relaxed text-ink-3">
          We have your application under{" "}
          <span className="font-semibold text-ink">{email.trim().toLowerCase()}</span>. Spots are
          confirmed once {EVENT.applications.until}, and we will email you the
          day that happens. One email, when there is real news.
        </p>
        <LinkButton href="/" variant="outline" className="mt-8">
          Back to the site
        </LinkButton>
      </div>
    );
  }

  const choice =
    "relative flex cursor-pointer items-center justify-center rounded-xl border border-line-2 bg-card px-3 py-3 text-[0.9375rem] font-semibold text-ink-2 transition-[background-color,border-color,color,box-shadow] duration-200 " +
    "hover:border-ink-3/60 has-checked:border-lamp has-checked:bg-lamp has-checked:text-ink has-checked:shadow-[0_8px_24px_-12px_rgb(255_199_44/0.9)] " +
    "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";

  return (
    <form ref={form} onSubmit={onSubmit} noValidate className="flex flex-col gap-6" aria-describedby="apply-note">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="apply-name" label="Your name" error={errors.name}>
          <input
            id="apply-name"
            data-field="name"
            className={fieldClass}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clear("name");
            }}
            autoComplete="name"
            placeholder="First and last"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("apply-name", false, !!errors.name)}
            required
          />
        </Field>
        <Field id="apply-email" label="Email" error={errors.email}>
          <input
            id="apply-email"
            data-field="email"
            className={fieldClass}
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clear("email");
            }}
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("apply-email", false, !!errors.email)}
            required
          />
        </Field>
      </div>

      <Field id="apply-school" label="School" error={errors.school}>
        <input
          id="apply-school"
          data-field="school"
          className={fieldClass}
          value={school}
          onChange={(e) => {
            setSchool(e.target.value);
            clear("school");
          }}
          autoComplete="organization"
          placeholder="Your high school"
          aria-invalid={errors.school ? true : undefined}
          aria-describedby={describedBy("apply-school", false, !!errors.school)}
          required
        />
      </Field>

      <fieldset
        role="radiogroup"
        aria-required="true"
        aria-invalid={errors.grade ? true : undefined}
        aria-describedby={errors.grade ? "apply-grade-error" : undefined}
      >
        <legend className="mb-2 text-[0.9375rem] font-semibold text-ink">Grade</legend>
        <div className="grid grid-cols-4 gap-2">
          {GRADES.map((g, i) => (
            <label key={g} className={`${choice} tabular-nums`}>
              <input
                type="radio"
                name="grade"
                value={g}
                checked={grade === g}
                data-field={i === 0 ? "grade" : undefined}
                onChange={() => {
                  setGrade(g);
                  clear("grade");
                }}
                className="sr-only"
              />
              {g}
              <span className="sr-only">th grade</span>
            </label>
          ))}
        </div>
        {errors.grade ? <div className="mt-2"><FieldError id="apply-grade-error">{errors.grade}</FieldError></div> : null}
      </fieldset>

      <fieldset
        role="radiogroup"
        aria-required="true"
        aria-invalid={errors.firstHackathon ? true : undefined}
        aria-describedby={errors.firstHackathon ? "apply-first-error" : undefined}
      >
        <legend className="mb-2 text-[0.9375rem] font-semibold text-ink">Is this your first hackathon?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { value: true, label: "Yes, my first one" },
            { value: false, label: "No, I have been to one" },
          ].map((opt, i) => (
            <label key={opt.label} className={choice}>
              <input
                type="radio"
                name="firstHackathon"
                checked={firstHackathon === opt.value}
                data-field={i === 0 ? "firstHackathon" : undefined}
                onChange={() => {
                  setFirstHackathon(opt.value);
                  clear("firstHackathon");
                }}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {errors.firstHackathon ? (
          <div className="mt-2"><FieldError id="apply-first-error">{errors.firstHackathon}</FieldError></div>
        ) : null}
      </fieldset>

      <Field
        id="apply-idea"
        label="What would you build?"
        optional
        hint={`${IDEA_MAX - idea.length} characters left`}
        error={errors.idea}
      >
        <textarea
          id="apply-idea"
          data-field="idea"
          className={`${fieldClass} min-h-28 resize-y`}
          value={idea}
          maxLength={IDEA_MAX}
          onChange={(e) => {
            setIdea(e.target.value.slice(0, IDEA_MAX));
            clear("idea");
          }}
          placeholder="A sentence is plenty. Plenty of good projects start as a complaint."
          aria-invalid={errors.idea ? true : undefined}
          aria-describedby={describedBy("apply-idea", true, !!errors.idea)}
        />
      </Field>

      {formError ? (
        <p role="alert" className="rounded-xl border border-danger/40 bg-danger-wash px-4 py-3 text-[0.9375rem] text-danger">
          {formError}{" "}
          <a href={mailto("Beacon Hacks application")} className="font-medium underline underline-offset-2">
            Email us
          </a>{" "}
          if it keeps happening.
        </p>
      ) : null}

      <div className="flex flex-col gap-5 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p id="apply-note" className="text-[0.875rem] leading-relaxed text-ink-3 sm:max-w-xs">
          For grades 9 to 12. We use this only to tell you about Beacon Hacks.
          Questions: <a href={mailto("A question about applying")} className="link">{EVENT.email.team}</a>
        </p>
        <Button type="submit" size="lg" loading={sending} className="sm:shrink-0">
          {sending ? "Sending…" : "Send application"}
        </Button>
      </div>
    </form>
  );
}
