import Image from "next/image";
import type { Partner } from "@/lib/content";

/**
 * A partner logo at a size set by area rather than height, so a long
 * wordmark and a compact lockup carry about the same visual weight. The
 * width is capped by its container and the height follows the aspect
 * ratio, so a narrow cell scales the whole logo down evenly.
 */
export function PartnerLogo({
  logo,
  scale = 1,
  area = 6400,
  className = "",
}: {
  logo: Partner["logo"];
  scale?: number;
  area?: number;
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
      className={`object-contain object-left ${className}`}
      style={{ width, maxWidth: "100%", height: "auto" }}
    />
  );
}
