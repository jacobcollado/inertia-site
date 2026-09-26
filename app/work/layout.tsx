import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Work by Inertia, a design studio for founders" },
  description: "Selected work by Inertia, a design studio for founders. Storefronts, sites and product interfaces for brands like Allure New York, Mood Swings and Trippie Redd.",
  alternates: { canonical: "https://byinertia.com/work" },
  openGraph: {
    type: "website",
    url: "https://byinertia.com/work",
    title: "Work by Inertia, a design studio for founders",
    description: "Selected work by Inertia, a design studio for founders. Storefronts, sites and product interfaces for brands like Allure New York, Mood Swings and Trippie Redd.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Inertia Work" }],
  },
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
