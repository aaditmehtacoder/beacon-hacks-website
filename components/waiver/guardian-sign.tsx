"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, describedBy, fieldClass } from "@/components/ui/field";
import { SignBlock, type Mode } from "./waiver-form";

/**
 * The parent or guardian's part: agree, then draw or type a signature.
 * Or print the page and sign on paper instead.
 */
export function GuardianSign({
  token,
  guardianName,
  childName,
  relationship,
}: {
  token: string;
  guardianName: string;
  childName: string;
  relationship: string;
}) {
  const [agree, setAgree] = useState(false);
  const [mode, setMode] = useState<Mode>("draw");
  const [typed, setTyped] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState<{ field: string; message: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agree) return setError({ field: "agree", message: "Tick to agree before you sign." });
    if (mode === "draw" && !image) return setError({ field: "guardianSignature", message: "Sign in the box, or switch to Type." });
    if (mode === "type" && !typed.trim()) return setError({ field: "guardianSignature", message: "Type your full name to sign." });
    setSending(true);
    try {
      const res = await fetch("/api/waiver/guardian", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token,
          agree: true,
          guardianSignature: mode === "type" ? typed : "",
          guardianSignatureImage: mode === "draw" ? image : "",
        }),
      });
      const payload = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; field?: string } | null;
      if (!res.ok || !payload?.ok) {
        setError({ field: payload?.field || "form", message: payload?.error ?? "That did not go through. Try again." });
        return;
      }
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError({ field: "form", message: "Network trouble. Check your connection and try again." });
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="night relative overflow-hidden rounded-2xl p-7 sm:p-9">
        <span aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-lamp/25 blur-3xl" />
        <p className="kicker relative text-lamp">Signed</p>
        <h2 className="relative mt-3 text-[clamp(1.875rem,4.5vw,2.75rem)] leading-none font-extrabold font-stretch-125% tracking-[-0.04em]">
          Thank you. That&rsquo;s everything.
        </h2>
        <p className="relative mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-moon-2">
          We&rsquo;ll review {childName}&rsquo;s waiver and email you both once it&rsquo;s approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 rounded-2xl border border-line bg-card p-6 sm:p-8">
      <h2 className="text-[1.375rem] leading-tight font-bold font-stretch-[112.5%] tracking-[-0.015em]">Your signature</h2>
      <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem] leading-relaxed text-ink">
        <input
          id="g-agree"
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          aria-invalid={error?.field === "agree" ? true : undefined}
          className="mt-1 size-5 shrink-0 cursor-pointer accent-ink"
        />
        <span>
          I am {guardianName}, {childName}&rsquo;s {relationship.toLowerCase() || "parent or guardian"}. I have read this waiver
          and agree to it for myself and for {childName}, and the information above is correct.
        </span>
      </label>
      {error?.field === "agree" ? <FieldError id="g-agree-error">{error.message}</FieldError> : null}

      <SignBlock
        id="g-signature"
        label="Parent or guardian signature"
        printed={guardianName}
        mode={mode}
        onMode={setMode}
        image={image}
        onImage={setImage}
        error={error?.field === "guardianSignature" ? error.message : undefined}
        typed={
          <input
            id="g-signature"
            className={`${fieldClass} text-[1.25rem] italic font-semibold`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            aria-invalid={error?.field === "guardianSignature" ? true : undefined}
            aria-describedby={describedBy("g-signature", true, error?.field === "guardianSignature")}
          />
        }
      />

      {error && !["agree", "guardianSignature"].includes(error.field) ? <FieldError id="g-form-error">{error.message}</FieldError> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => window.print()} className="text-[0.9375rem] font-semibold text-ink-3 underline underline-offset-4 hover:text-ink">
          Prefer paper? Print it or save a PDF
        </button>
        <Button type="submit" size="lg" loading={sending} className="sm:min-w-48">
          Sign waiver
        </Button>
      </div>
    </form>
  );
}
