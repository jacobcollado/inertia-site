import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects by Inertia.",
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
