"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

type Point = { x: number; y: number; w: number };

/* The exported image: at most twice the CSS size, so it stays small. */
const MAX_SCALE = 2;

/**
 * A pad to sign on with a finger, a mouse or a pen. Pen pressure thickens
 * the line. Each finished stroke hands a transparent PNG (a data URL) to
 * onChange; Clear hands back "". The page does not scroll while drawing
 * on it. Typing a name is the keyboard-friendly alternative beside it.
 */
export function SignaturePad({
  id,
  value,
  onChange,
  invalid = false,
  describedBy,
  label,
}: {
  id: string;
  value: string;
  onChange: (dataUrl: string) => void;
  invalid?: boolean;
  describedBy?: string;
  label: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Point[][]>([]);
  const drawing = useRef(false);
  /* A signature carried over from before this pad mounted (switching
     between Type and Draw), drawn under any new strokes. */
  const base = useRef<HTMLImageElement | null>(null);
  const [empty, setEmpty] = useState(!value);

  const paint = useCallback(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d")!;
    const scale = el.width / el.clientWidth || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, el.width, el.height);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    if (base.current) ctx.drawImage(base.current, 0, 0, el.clientWidth, el.clientHeight);
    ctx.strokeStyle = getComputedStyle(el).color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const stroke of strokes.current) {
      if (stroke.length === 1) {
        const p = stroke[0];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.w / 2, 0, Math.PI * 2);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
        continue;
      }
      /* Smooth: a curve through the midpoints, each segment as wide as its pressure. */
      for (let i = 1; i < stroke.length; i++) {
        const a = stroke[i - 1];
        const b = stroke[i];
        const prev = stroke[i - 2] ?? a;
        ctx.beginPath();
        ctx.lineWidth = (a.w + b.w) / 2;
        ctx.moveTo((prev.x + a.x) / 2, (prev.y + a.y) / 2);
        ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
        ctx.stroke();
      }
    }
  }, []);

  /* Size the backing store to the element, sharp on high-density screens. */
  const fit = useCallback(() => {
    const el = canvas.current;
    if (!el) return;
    const scale = Math.min(window.devicePixelRatio || 1, MAX_SCALE);
    el.width = Math.round(el.clientWidth * scale);
    el.height = Math.round(el.clientHeight * scale);
    paint();
  }, [paint]);

  useEffect(() => {
    if (value) {
      const img = new Image();
      img.onload = () => {
        base.current = img;
        paint();
      };
      img.src = value;
    }
    fit();
    const observer = new ResizeObserver(fit);
    if (canvas.current) observer.observe(canvas.current);
    return () => observer.disconnect();
    /* Only on mount: later values come from this pad itself. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function point(e: PointerEvent<HTMLCanvasElement>): Point {
    const rect = e.currentTarget.getBoundingClientRect();
    const pressure = e.pointerType === "pen" && e.pressure > 0 ? e.pressure : 0.5;
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, w: 1.4 + pressure * 3 };
  }

  function down(e: PointerEvent<HTMLCanvasElement>) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* a pointer the browser no longer tracks: draw without capture */
    }
    drawing.current = true;
    strokes.current.push([point(e)]);
    setEmpty(false);
    paint();
  }

  function move(e: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const stroke = strokes.current.at(-1)!;
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [];
    if (events.length) {
      const rect = e.currentTarget.getBoundingClientRect();
      for (const c of events) {
        const pressure = c.pointerType === "pen" && c.pressure > 0 ? c.pressure : 0.5;
        stroke.push({ x: c.clientX - rect.left, y: c.clientY - rect.top, w: 1.4 + pressure * 3 });
      }
    } else {
      stroke.push(point(e));
    }
    paint();
  }

  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(canvas.current!.toDataURL("image/png"));
  }

  function clear() {
    strokes.current = [];
    base.current = null;
    setEmpty(true);
    paint();
    onChange("");
  }

  return (
    <div>
      <div
        className={`relative overflow-hidden rounded-xl border-2 bg-card transition-colors ${
          invalid ? "border-danger" : "border-line-2 focus-within:border-ink"
        }`}
      >
        <canvas
          ref={canvas}
          id={id}
          tabIndex={0}
          role="img"
          aria-label={`${label}: ${empty ? "empty, draw with a finger, mouse or pen" : "signed"}`}
          aria-describedby={describedBy}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          className="block h-40 w-full cursor-crosshair touch-none text-ink outline-none sm:h-44"
        />
        {/* The line to sign on. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 bottom-9 flex items-end gap-2 border-b border-ink-3/40">
          <span className="-mb-1 text-[1.25rem] leading-none text-ink-3/60">×</span>
        </div>
        {empty ? (
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center pb-6 text-[0.9375rem] text-ink-3/70">
            Sign here with your finger, mouse or pen
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={clear}
          disabled={empty}
          className="text-[0.875rem] font-semibold text-ink-3 underline-offset-4 hover:text-ink hover:underline disabled:opacity-0"
        >
          Clear and sign again
        </button>
      </div>
    </div>
  );
}
