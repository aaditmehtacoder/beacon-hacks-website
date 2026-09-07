import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { EVENT } from "@/lib/event";
import { NotifyProvider } from "@/components/notify/notify-provider";
import { NotifyModal } from "@/components/notify/notify-modal";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const sans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const DESCRIPTION =
  "A free one day hackathon being built for Bay Area high schoolers, targeting January 2027 in Belmont, CA. Applications are not open yet, and the site says exactly what is confirmed and what is not.";

export const metadata: Metadata = {
  metadataBase: new URL(EVENT.url),
  title: {
    default: `Beacon Hacks — ${EVENT.tagline}`,
    template: "%s — Beacon Hacks",
  },
  description: DESCRIPTION,
  applicationName: "Beacon Hacks",
  keywords: ["hackathon", "high school", "Bay Area", "Belmont", "students"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: EVENT.url,
    siteName: "Beacon Hacks",
    title: `Beacon Hacks — ${EVENT.tagline}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `Beacon Hacks — ${EVENT.tagline}`,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#faf8f4",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-100 focus:rounded-br-lg focus:bg-beacon focus:px-5 focus:py-3 focus:font-medium focus:text-beacon-ink"
        >
          Skip to content
        </a>
        <NotifyProvider>
          {children}
          <NotifyModal />
        </NotifyProvider>
      </body>
    </html>
  );
}
