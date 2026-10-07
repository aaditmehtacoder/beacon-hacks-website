import Image from "next/image";
import type { Logo } from "@/lib/content";

/**
 * A partner logo at a size set by area rather than height, so a long
 * wordmark and a compact lockup carry about the same visual weight. The
 * width is capped by its container and the height follows the aspect
 * ratio, so a narrow cell scales the whole logo down evenly. The name is
 * always in the text nearby, so the image itself is decorative.
 */
export function PartnerLogo({
  logo,
  scale = 1,
  area = 6400,
  eager = false,
  className = "",
}: {
  logo: Logo;
  scale?: number;
  area?: number;
  /** Load at once: for logos in the first screen. */
  eager?: boolean;
  className?: string;
}) {
  const ratio = logo.width / logo.height;
  const height = Math.round(Math.sqrt(area / ratio) * scale);
  const width = Math.round(height * ratio);
  return (
    <Image
      src={logo.src}
      alt=""
      width={width}
      height={height}
      unoptimized={logo.src.endsWith(".svg")}
      loading={eager ? "eager" : undefined}
      className={`object-contain object-left ${className}`}
      style={{ width, maxWidth: "100%", height: "auto" }}
    />
  );
}
