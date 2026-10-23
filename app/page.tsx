import type { Metadata } from "next";
import HomeIndex from "./home-index";

export const metadata: Metadata = {
  alternates: { canonical: "https://byinertia.com" },
};

// The previous homepage lives on in ./home-client.tsx.
export default function Page() {
  return <HomeIndex />;
}
