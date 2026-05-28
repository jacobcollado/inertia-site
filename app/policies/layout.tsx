import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Policies", template: "%s - Policies - Inertia" },
};

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
