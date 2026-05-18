import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal",
  description: "Thoughts on Shopify, design, and building digital products.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
