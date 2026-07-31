import type { Metadata } from "next";
import { AcceptInviteForm } from "./accept-invite-form";

export const metadata: Metadata = {
  title: "Accept invite",
};

export default function AcceptInvitePage() {
  return (
    <main className="min-h-screen flex items-stretch">
      <AcceptInviteForm />
    </main>
  );
}
