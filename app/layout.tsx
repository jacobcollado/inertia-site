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
    default: "Inertia — Your digital presence, done right.",
    template: "%s — Inertia",
  },
  description: "Inertia builds Shopify storefronts, apps, and digital products for brands that treat the web seriously. One team, no handoffs.",
  keywords: ["Shopify", "Shopify theme", "custom storefront", "web development", "Inertia", "Aether theme"],
  authors: [{ name: "Inertia" }],
  creator: "Inertia",
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Inertia",
    title: "Inertia — Your digital presence, done right.",
    description: "Shopify storefronts, apps, and digital products. One team, no handoffs.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Inertia" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@inertia_dev",
    creator: "@inertia_dev",
    title: "Inertia — Your digital presence, done right.",
    description: "Shopify storefronts, apps, and digital products. One team, no handoffs.",
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
