import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { EVENT } from "@/lib/event";
import { NotifyProvider } from "@/components/notify/notify-provider";
import { NotifyModal } from "@/components/notify/notify-modal";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

/* Display type: heavy grotesque headings, buttons and labels. The optical
   size axis gives the huge headings their tighter display forms. */
const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

/* Running text and form fields. */
const sans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const TITLE = "Beacon Hacks · Free hackathon for Bay Area high school students";
const DESCRIPTION =
  "A free one-day hackathon for Bay Area high school builders in Belmont, California. Target date Saturday, January 30, 2027. Grades 9 to 12, no experience needed. Early applications are open.";

export const metadata: Metadata = {
  metadataBase: new URL(EVENT.url),
  title: {
    default: TITLE,
    template: "%s · Beacon Hacks",
  },
  description: DESCRIPTION,
  applicationName: "Beacon Hacks",
  creator: "Beacon Hacks",
  keywords: ["hackathon", "high school hackathon", "Bay Area", "Belmont", "students", "coding"],
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
  themeColor: "#1b1712",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded-full focus:border-2 focus:border-ink focus:bg-beacon focus:px-4 focus:py-2.5 focus:font-bold focus:text-beacon-ink"
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
