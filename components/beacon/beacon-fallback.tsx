/**
 * The lamp in two dimensions. Shown while the WebGL scene loads, kept
 * forever where WebGL is missing, and the thing a no-JavaScript visitor
 * sees. It is the same object drawn simply: a glow, three rings, a beam.
 */
export function BeaconFallback({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`bg-[radial-gradient(70%_60%_at_50%_46%,#1c1409,#07070b_72%)] ${className}`}
    >
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative aspect-square w-[64%]">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--glow-lamp),transparent_58%)]" />
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,var(--glow-sweep)_20deg,transparent_50deg)] motion-safe:animate-sweep" />
          <div className="absolute inset-0 rounded-full border border-band-ink/10" />
          <div className="absolute inset-[16%] rounded-full border border-band-ink/10" />
          <div className="absolute inset-[32%] rounded-full border border-band-ink/10" />
          <div className="absolute top-1/2 left-1/2 size-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-beacon shadow-lamp-lg" />
        </div>
      </div>
    </div>
  );
}
