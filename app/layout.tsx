import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Providers, AppToaster } from "@/components/providers"
import { TrackerProvider } from "@/components/tracker-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CursorGlow } from "@/components/cursor-glow"
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "subscription tracker",
    "subscription manager",
    "recurring expenses",
    "monthly spending calculator",
    "track subscriptions free",
    "bills tracker",
    "cloud sync",
    "private finance",
    "edge database",
  ],
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1214" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="min-h-dvh bg-[#0a1214] text-white antialiased selection:bg-emerald-400/20">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers>
          <TrackerProvider>
            <CursorGlow />
            <SiteHeader />
            <main id="main" className="relative">{children}</main>
            <SiteFooter />
            <AppToaster />
          </TrackerProvider>
        </Providers>
      </body>
    </html>
  )
}
