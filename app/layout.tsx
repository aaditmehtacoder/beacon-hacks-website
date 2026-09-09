import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { EVENT } from "@/lib/event";
import { NotifyProvider } from "@/components/notify/notify-provider";
import { NotifyModal } from "@/components/notify/notify-modal";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { THEME_BG, THEME_BOOT_SCRIPT } from "@/components/theme/theme-script";
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
    default: `Beacon Hacks · ${EVENT.tagline}`,
    template: "%s · Beacon Hacks",
  },
  description: DESCRIPTION,
  applicationName: "Beacon Hacks",
  keywords: ["hackathon", "high school", "Bay Area", "Belmont", "students"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: EVENT.url,
    siteName: "Beacon Hacks",
    title: `Beacon Hacks · ${EVENT.tagline}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `Beacon Hacks · ${EVENT.tagline}`,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_BG.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_BG.dark },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Sets data-theme before the first paint. Without this, a visitor
            on a dark machine gets a frame of white. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />

        {/* <Reveal> ships its start state as an inline opacity:0, which the
            animation clears on the way in. With no JavaScript there is
            nothing to clear it, so the page would render blank. */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-100 focus:rounded-br-lg focus:bg-beacon focus:px-5 focus:py-3 focus:font-medium focus:text-beacon-ink"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <NotifyProvider>
            {children}
            <NotifyModal />
          </NotifyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
