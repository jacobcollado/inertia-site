import type { Metadata, Viewport } from "next";
import "./globals.css";
import localFont from "next/font/local";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { THEME_SCRIPT, ThemeProvider } from "./theme-provider";
import { RouteFade } from "./route-fade";
import { LenisProvider } from "./lenis-provider";
import { ViewModeProvider } from "./view-mode-context";
import { SiteShell } from "./site-shell";
import { CookieBanner } from "./cookie-banner";
import { ScrollReveal } from "./scroll-reveal";
import { cn } from "@/lib/utils";
import { PostHogProvider } from "./posthog-provider";
import { MetaPixel } from "./meta-pixel";

const satoshi = localFont({
  src: "../public/fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  display: "swap",
});

const BASE_URL = "https://byinertia.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Inertia | Design Studio for Founders",
    template: "%s - Inertia",
  },
  description: "Inertia is a design studio for founders and brands moving fast. Direction, design, and development, one focused team.",
  // Studio first, product second: this is the default for every page that
  // doesn't set its own, so it describes Inertia rather than Aether.
  keywords: ["Inertia", "Inertia studio", "design studio", "design studio for founders", "brand direction", "web design", "product design", "Shopify storefront design", "Aether Shopify theme"],
  authors: [{ name: "Inertia" }],
  creator: "Inertia",
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Inertia",
    title: "Inertia | Design Studio for Founders",
    description: "Inertia is a design studio for founders and brands moving fast. Direction, design, and development, one focused team.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Inertia - Design Studio" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@inertia_dev",
    creator: "@inertia_dev",
    title: "Inertia | Design Studio for Founders",
    description: "Inertia is a design studio for founders and brands moving fast. Direction, design, and development, one focused team.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

// viewport-fit=cover is required for the iOS 26 Safari toolbar tinting in
// globals.css (.home-dark-root) to have anything to work with: without it the
// page never goes edge-to-edge, so there are no obscured insets for Safari to
// sample the top/bottom toolbar colors from.
// See https://nasedk.in/blog/ios26-safari-toolbar-colors/
//
// themeColor is white to match the hero. iOS 26 ignores it (hence the
// scroll-driven background technique), but Android Chrome and older iOS
// Safari still honour it.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(satoshi.variable, "font-sans", "dark")} suppressHydrationWarning>
      <head>
        {/* Sets the theme before first paint (see theme-provider.tsx).
            next/script with beforeInteractive, since React won't run a
            bare <script> it renders. */}
        <Script id="theme-init" strategy="beforeInteractive">{THEME_SCRIPT}</Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://byinertia.com/#website",
            "name": "Inertia",
            "alternateName": "Inertia Studio",
            "url": "https://byinertia.com",
            "publisher": { "@id": "https://byinertia.com/#organization" },
          })}}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://byinertia.com/#organization",
            "name": "Inertia",
            "alternateName": "Inertia Studio",
            "url": "https://byinertia.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://byinertia.com/icon-512.png",
              "width": 512,
              "height": 512,
            },
            "description": "Inertia is a design studio for founders and brands moving fast. Direction, design, and development, one focused team. Makers of Aether, a Shopify theme.",
            "email": "hello@byinertia.com",
            "sameAs": [
              "https://www.instagram.com/by.inertia/",
              "https://x.com/inertia_dev",
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer support",
              "url": "https://cal.com/jacob-c-99otvp/15min",
            },
          })}}
        />
      </head>
      <body className="font-sans antialiased">
        <MetaPixel />
        <PostHogProvider>
        <ThemeProvider>
          <ViewModeProvider>
            <LenisProvider />
            <SiteShell>
              <ScrollReveal />
              <RouteFade>
                {children}
              </RouteFade>
            </SiteShell>
          </ViewModeProvider>
          <CookieBanner />
        </ThemeProvider>
        <Analytics />
        </PostHogProvider>
      </body>
    </html>
  );
}
