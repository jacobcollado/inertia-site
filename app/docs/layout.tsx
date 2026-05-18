import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs",
  description: "Documentation for Aether and Inertia services.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
