import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { EVENT } from "@/lib/event";
import { NotifyProvider } from "@/components/notify/notify-provider";
import { NotifyModal } from "@/components/notify/notify-modal";
import { Analytics } from "@vercel/analytics/next";
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

const TITLE = "Beacon Hacks · Free hackathon for Bay Area high schoolers";
const DESCRIPTION =
  "A free one day hackathon for Bay Area high schoolers, targeting January 30, 2027 in Belmont, CA. Grades 9 to 12, no experience needed. Early applications are open.";

export const metadata: Metadata = {
  metadataBase: new URL(EVENT.url),
  title: {
    default: TITLE,
    template: "%s · Beacon Hacks",
  },
  description: DESCRIPTION,
  applicationName: "Beacon Hacks",
  creator: "Beacon Hacks",
  keywords: ["hackathon", "high school hackathon", "Bay Area", "Belmont", "students"],
  /* Canonical URLs are set per page; one here would be inherited by every
     page and point them all at the home page. */
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Beacon Hacks",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0f0e0c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <head>
        {/* <Reveal> ships its start state as an inline opacity:0, which the
            animation clears on the way in. With no JavaScript there is
            nothing to clear it, so the page would render blank. The stage
            facts wait on scroll progress the same way. */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}.stage-facts{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
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
        {/* Vercel Analytics. Silent in development, reports only on Vercel. */}
        <Analytics />
      </body>
    </html>
  );
}
