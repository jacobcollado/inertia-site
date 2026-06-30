import type { Metadata } from "next";
import ButtonsDemo from "./buttons-demo";

export const metadata: Metadata = {
  title: "Buttons",
  description: "The button styles Inertia builds with, primary, secondary, and disabled.",
};

export default function ButtonsPage() {
  return <ButtonsDemo />;
}
