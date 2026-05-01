import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Client portal — Inertia",
};

type Search = { tab?: string };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { tab } = await searchParams;
  const initialTab = tab === "signup" ? "signup" : "signin";

  return (
    <main className="min-h-screen flex items-stretch">
      <LoginForm initialTab={initialTab} />
    </main>
  );
}
