import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "./theme-provider";
import { RouteFade } from "./route-fade";
import { LenisProvider } from "./lenis-provider";
import { ViewModeProvider } from "./view-mode-context";
import { SiteShell } from "./site-shell";
import { CookieBanner } from "./cookie-banner";
import { ScrollReveal } from "./scroll-reveal";
import { cn } from "@/lib/utils";
import { PostHogProvider } from "./posthog-provider";

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
  keywords: ["Shopify theme", "Aether Shopify theme", "Shopify store design", "custom Shopify storefront", "Inertia studio", "Shopify agency", "Shopify development", "ecommerce design"],
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
  alternates: {
    canonical: BASE_URL,
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(satoshi.variable, "font-sans", "dark")} suppressHydrationWarning>
      <head>
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
            "potentialAction": {
              "@type": "SearchAction",
              "target": { "@type": "EntryPoint", "urlTemplate": "https://byinertia.com/blog?q={search_term_string}" },
              "query-input": "required name=search_term_string",
            },
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
              "url": "https://byinertia.com/logo.png",
              "width": 200,
              "height": 200,
            },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Aether Shopify Theme",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Shopify",
            "url": "https://byinertia.com/aether",
            "description": "A premium Shopify theme built for conversion and brand presence. 41 sections, dark mode, sticky cart, mega menu.",
            "offers": {
              "@type": "Offer",
              "price": "85",
              "priceCurrency": "USD",
              "url": "https://byinertia.com/aether/buy",
            },
            "provider": {
              "@type": "Organization",
              "name": "Inertia",
              "url": "https://byinertia.com",
            },
          })}}
        />
      </head>
      <body className="font-sans antialiased">
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
