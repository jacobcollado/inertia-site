import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs",
  description: "Everything you need to install, customize, and update the Aether Shopify theme, plus how working with the Inertia studio actually works.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
