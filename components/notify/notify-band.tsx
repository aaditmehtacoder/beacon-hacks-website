"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { LockChip } from "@/components/ui/locked";
import { useNotify } from "./notify-provider";

export function NotifyBand() {
  const { openNotify } = useNotify();
  const [email, setEmail] = useState("");

  return (
    <section id="notify" className="wrap scroll-mt-24 py-20 sm:py-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-line bg-card px-7 py-12 text-center sm:px-14 sm:py-16">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(242,161,0,0.16),transparent_62%)]"
          />

          <div className="relative">
            <LockChip>Applications open at Gate 3</LockChip>
            <h2 className="mx-auto mt-6 max-w-xl text-4xl leading-[1.05] sm:text-5xl">
              Be the first to know.
            </h2>
            <p className="mx-auto mt-5 max-w-lg leading-relaxed text-ink-2">
              There is no form to fill in yet and no deadline to miss. Leave an
              email and you will hear from us the day applications open.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                openNotify(email);
              }}
              className="mx-auto mt-9 flex max-w-lg flex-col gap-3 sm:flex-row"
              noValidate
            >
              <label htmlFor="lead-email" className="sr-only">
                Your email address
              </label>
              <input
                id="lead-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                autoComplete="email"
                className="flex-1 rounded-full border border-line bg-paper px-6 py-4 text-[0.9375rem] placeholder:text-ink-4 focus:border-beacon focus:bg-card focus:ring-4 focus:ring-beacon/20 focus:outline-none"
              />
              <Button type="submit" size="lg">
                Notify me →
              </Button>
            </form>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
