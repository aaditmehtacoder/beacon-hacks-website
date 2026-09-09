"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, fieldClass } from "@/components/ui/field";
import { applySchema } from "@/lib/notify-schema";
import { EVENT } from "@/lib/event";

const GRADES = ["9", "10", "11", "12"] as const;

/**
 * The early application. Six fields, one optional, and an honest success
 * state: it says you are in the queue, not that you have a seat.
 */
export function ApplyForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState<(typeof GRADES)[number] | "">("");
  const [firstHackathon, setFirstHackathon] = useState<boolean | null>(null);
  const [idea, setIdea] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (firstHackathon === null) {
      setError("Is this your first hackathon? Either answer is a good one.");
      return;
    }
    const parsed = applySchema.safeParse({ name, email, school, grade, firstHackathon, idea });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(payload?.error ?? "We could not save that. Try again in a moment.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network trouble. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center sm:p-10">
        <span
          aria-hidden="true"
          className="mx-auto mb-6 block size-14 rounded-full bg-beacon shadow-lamp-lg"
        />
        <h2 className="text-2xl">You are in the queue.</h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-2">
          We have your application under{" "}
          <span className="font-medium text-ink">{email.trim().toLowerCase()}</span>. Spots are
          confirmed once the venue and the budget are locked, and you will
          hear from us the day that happens. One email, when there is real
          news.
        </p>
        <LinkButton href="/" variant="ghost" className="mt-7">
          Back to the site
        </LinkButton>
      </div>
    );
  }

  const choice = (active: boolean) =>
    `rounded-xl border px-3 py-3 text-sm transition-all ${
      active
        ? "border-beacon bg-beacon-wash font-medium text-ink shadow-ring-lamp"
        : "border-line bg-paper text-ink-2 hover:border-line-hard hover:text-ink"
    }`;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name">
          <input
            className={fieldClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="First and last"
          />
        </Field>
        <Field label="Email">
          <input
            className={fieldClass}
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@school.edu"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
        <Field label="School">
          <input
            className={fieldClass}
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            autoComplete="organization"
            placeholder="Carlmont High"
          />
        </Field>
        <fieldset className="flex flex-col gap-2">
          <legend className="label mb-2 text-ink-3">Grade</legend>
          <div className="grid grid-cols-4 gap-2">
            {GRADES.map((g) => (
              <button
                key={g}
                type="button"
                aria-pressed={grade === g}
                onClick={() => setGrade(g)}
                className={`${choice(grade === g)} min-w-12 tabular-nums`}
              >
                {g}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="label mb-2 text-ink-3">Is this your first hackathon?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            aria-pressed={firstHackathon === true}
            onClick={() => setFirstHackathon(true)}
            className={choice(firstHackathon === true)}
          >
            Yes, first one
          </button>
          <button
            type="button"
            aria-pressed={firstHackathon === false}
            onClick={() => setFirstHackathon(false)}
            className={choice(firstHackathon === false)}
          >
            No, I have been to one
          </button>
        </div>
      </fieldset>

      <Field label="What would you build?" hint={`optional · ${280 - idea.length} left`}>
        <textarea
          className={`${fieldClass} min-h-28 resize-y`}
          value={idea}
          onChange={(e) => setIdea(e.target.value.slice(0, 280))}
          placeholder="A sentence is plenty. Half of the best projects started as a complaint."
        />
      </Field>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger-line bg-danger-wash px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-ink-4">
          Grades 9 to 12 only. We keep this to tell you about Beacon and nothing
          else. Questions:{" "}
          <Link href={`mailto:${EVENT.email.team}`} className="text-beacon-deep underline underline-offset-4">
            {EVENT.email.team}
          </Link>
        </p>
        <Button type="submit" size="lg" variant="beacon" disabled={sending} className="sm:shrink-0">
          {sending ? "Sending…" : "Send my application →"}
        </Button>
      </div>
    </form>
  );
}
