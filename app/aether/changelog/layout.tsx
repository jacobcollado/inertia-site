import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aether Changelog",
  description: "Release notes and updates for the Aether Shopify theme.",
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
