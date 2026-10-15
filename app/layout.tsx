import type { Metadata, Viewport } from "next";
import { Mona_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { EVENT } from "@/lib/event";
import "./globals.css";

/* One family for everything: Mona Sans, a variable grotesque with a width
   axis. Headings run expanded and heavy; running text at normal width. */
const mona = Mona_Sans({
  variable: "--font-mona",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const TITLE = "Beacon Hacks · Free hackathon for Bay Area high school students";
const HOSTED = EVENT.venue.name ? `, hosted by ${EVENT.venue.name}` : "";
const DESCRIPTION = `A free one-day hackathon for Bay Area high school builders${HOSTED} in Belmont, California. Target date Saturday, January 30, 2027. Grades 9 to 12, no experience needed. Applications are open.`;

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
  /* Where the event is, at city level (never the venue): read by local and
     generative search. llms.txt carries the full facts for AI assistants. */
  other: {
    "geo.region": "US-CA",
    "geo.placename": "Belmont, California",
    "geo.position": "37.518;-122.292",
    ICBM: "37.518, -122.292",
  },
};

export const viewport: Viewport = {
  themeColor: "#060d1b",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  /* Anchor links glide (globals.css); data-scroll-behavior has Next jump,
     not glide, to the top of a new page. */
  return (
    <html lang="en" className={mona.variable} data-scroll-behavior="smooth">
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded-full focus:bg-lamp focus:px-4 focus:py-2.5 focus:font-semibold focus:text-ink"
        >
          Skip to content
        </a>
        {children}
        {/* Vercel Analytics. Silent in development, reports only on Vercel. */}
        <Analytics />
      </body>
    </html>
  );
}
