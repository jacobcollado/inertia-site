import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "./theme-provider";
import { RouteFade } from "./route-fade";
import { LenisProvider } from "./lenis-provider";
import { ViewModeProvider } from "./view-mode-context";
import { SiteShell } from "./site-shell";
import { ScrollReveal } from "./scroll-reveal";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import Script from "next/script";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const BASE_URL = "https://byinertia.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Inertia — Shopify Themes & Web Studio",
    template: "%s — Inertia",
  },
  description: "Inertia builds Shopify storefronts and brand identities for independent brands. Try Aether, our conversion-focused Shopify theme, from $85.",
  keywords: ["Shopify theme", "Aether Shopify theme", "Shopify store design", "custom Shopify storefront", "Inertia studio", "Shopify agency"],
  authors: [{ name: "Inertia" }],
  creator: "Inertia",
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Inertia",
    title: "Inertia — Shopify Themes & Web Studio",
    description: "Inertia builds Shopify storefronts and brand identities for independent brands. Try Aether, our conversion-focused Shopify theme, from $85.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Inertia" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@inertia_dev",
    creator: "@inertia_dev",
    title: "Inertia — Shopify Themes & Web Studio",
    description: "Inertia builds Shopify storefronts and brand identities for independent brands. Try Aether, our conversion-focused Shopify theme, from $85.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

const themeInitScript = `(function(){try{var s=localStorage.getItem('theme');var t=s||'dark';if(t==='dark')document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&f[]=erode@300,400,500&display=swap"
        />
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Inertia",
            "alternateName": "Inertia Studio",
            "url": "https://byinertia.com",
          })}}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Inertia",
            "alternateName": "Inertia Studio",
            "url": "https://byinertia.com",
            "logo": "https://byinertia.com/og.png",
          })}}
        />
      </head>
      <body className="font-sans antialiased">
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
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
