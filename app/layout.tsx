import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";
import { RouteFade } from "./route-fade";
import { LenisProvider } from "./lenis-provider";
import { ViewModeProvider } from "./view-mode-context";
import { VisualNotch } from "./visual-notch";

export const metadata: Metadata = {
  title: "Jacob Collado",
  description: "Personal site of Jacob. Building things on the internet.",
};

const themeInitScript = `(function(){try{var s=localStorage.getItem('theme');var t=s||'dark';if(t==='dark')document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} suppressHydrationWarning />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ViewModeProvider>
            <LenisProvider />
            <VisualNotch />
            <RouteFade>{children}</RouteFade>
          </ViewModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
