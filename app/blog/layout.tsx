import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal - Shopify, Design & Building Digital Products",
  description: "Honest takes on Shopify development, ecommerce design, and building digital products. Written by the Inertia studio team.",
  alternates: { canonical: "https://byinertia.com/blog" },
  openGraph: {
    type: "website",
    url: "https://byinertia.com/blog",
    title: "Inertia Journal - Shopify, Design & Building Digital Products",
    description: "Honest takes on Shopify development, ecommerce design, and building digital products. Written by the Inertia studio team.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Inertia Journal" }],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
