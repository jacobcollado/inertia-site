import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aether changelog",
  description: "What's new in Aether. Every section, fix, and feature we've shipped, with lifetime updates included on every license.",
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
