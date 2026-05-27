import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work - Shopify Storefronts & Brand Projects",
  description: "Selected client work by Inertia. Shopify storefronts, brand identities, and digital products built for independent brands.",
  alternates: { canonical: "https://byinertia.com/work" },
  openGraph: {
    type: "website",
    url: "https://byinertia.com/work",
    title: "Inertia Work - Shopify Storefronts & Brand Projects",
    description: "Selected client work by Inertia. Shopify storefronts, brand identities, and digital products built for independent brands.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Inertia Work" }],
  },
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
