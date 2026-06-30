import type { Metadata } from "next";
import PillsDemo from "./pills-demo";

export const metadata: Metadata = {
  title: "Pills",
  description: "The pill and chip styles Inertia builds with, status, category, and quick picks.",
};

export default function PillsPage() {
  return <PillsDemo />;
}
