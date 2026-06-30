import type { Metadata } from "next";
import { TableOfContents } from "./shared";

export const metadata: Metadata = {
  title: "Components",
  description: "The interface pieces Inertia builds with, buttons, pills, cards, and inputs, shown as they actually ship.",
};

export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative mx-3 sm:mx-auto w-auto sm:w-full max-w-[96rem] min-h-screen flex flex-col pb-16 sm:pb-20">
      <TableOfContents />
      <div className="flex flex-col">
        {children}
      </div>
    </main>
  );
}
