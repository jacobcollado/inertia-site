import type { Metadata } from "next";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset password | Inertia",
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-stretch">
      <ResetPasswordForm />
    </main>
  );
}
