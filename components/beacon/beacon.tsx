"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { BeaconFallback } from "./beacon-fallback";
import type { Pointer } from "./beacon-scene";

const BeaconScene = dynamic(
  () => import("./beacon-scene").then((m) => m.BeaconScene),
  { ssr: false },
);

type Stage = "idle" | "loading" | "live" | "unsupported";
type Tier = "low" | "high";

/**
 * The frame the beacon lives in. It decides whether to run WebGL at all,
 * when to start it, and when to stop it, and it hands the page the one
 * number it wants back: how squarely the beam is pointed at the visitor.
 *
 * The CSS lamp underneath is always rendered, so the panel is never empty:
 * not before hydration, not while three.js downloads, not without WebGL.
 */
export function Beacon({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const frame = useRef<HTMLDivElement>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0, active: false });
  const [stage, setStage] = useState<Stage>("idle");
  const [tier, setTier] = useState<Tier>("high");
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  /* Start the GPU work a beat after hydration, so fonts and the headline
     land first, and skip it where WebGL2 is missing. */
  useEffect(() => {
    const id = window.setTimeout(() => {
      const probe = document.createElement("canvas");
      if (!probe.getContext("webgl2")) {
        setStage("unsupported");
        return;
      }
      setTier(lowTier() ? "low" : "high");
      setStage("loading");
    }, 260);
    return () => window.clearTimeout(id);
  }, []);

  /* Render only while the panel is on screen and the tab is in front. */
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "160px" },
    );
    io.observe(el);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  /* The lamp turns toward the pointer anywhere on the page, not only over
     the panel. Mouse only: a finger on the glass is not a point of view. */
  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const p = pointer.current;
      p.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.y = 1 - (e.clientY / window.innerHeight) * 2;
      p.active = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce]);

  /* Written to <html> so the hero background can breathe with the beam. */
  const onFacing = useCallback((facing: number) => {
    document.documentElement.style.setProperty("--beam-facing", facing.toFixed(3));
  }, []);
  const onReady = useCallback(() => setStage("live"), []);

  const live = stage === "live";
  const mountScene = stage === "loading" || live;

  return (
    <div
      ref={frame}
      role="img"
      aria-label="A lighthouse lens turning slowly. Its beam sweeps past every few seconds."
      className={`relative overflow-hidden rounded-2xl border border-line bg-band shadow-figure ${className}`}
    >
      <BeaconFallback
        className={`absolute inset-0 transition-opacity duration-1000 ${live ? "opacity-0" : "opacity-100"}`}
      />
      {mountScene ? (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${live ? "opacity-100" : "opacity-0"}`}
        >
          <BeaconScene
            running={inView && tabVisible}
            reduced={!!reduce}
            tier={tier}
            pointer={pointer}
            onReady={onReady}
            onFacing={onFacing}
          />
        </div>
      ) : null}
    </div>
  );
}

/** Phones and small laptops get fewer motes and a lower pixel ratio. */
function lowTier() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (
    window.innerWidth < 640 ||
    (nav.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4
  );
}
