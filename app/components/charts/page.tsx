import type { Metadata } from "next";
import ChartsDemo from "./charts-demo";

export const metadata: Metadata = {
  title: "Charts",
  description: "The chart components Inertia builds with, a themed Recharts wrapper.",
};

export default function ChartsPage() {
  return <ChartsDemo />;
}
