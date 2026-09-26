import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Inertia journal, essays on design and craft" },
  description: "Essays from Inertia on design, standards and judgment: why the details people feel matter, and how good work gets made.",
  alternates: { canonical: "https://byinertia.com/blog" },
  openGraph: {
    type: "website",
    url: "https://byinertia.com/blog",
    title: "Inertia journal, essays on design and craft",
    description: "Essays from Inertia on design, standards and judgment: why the details people feel matter, and how good work gets made.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Inertia Journal" }],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
