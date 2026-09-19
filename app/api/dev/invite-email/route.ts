import { NextResponse } from "next/server";
import { renderInviteEmail } from "@/lib/invite-email";

/* Renders the account-setup email for review without sending. Dev only. */

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const url = new URL(req.url);
  const { subject, html, text } = renderInviteEmail({
    actionLink: url.searchParams.get("link") ?? "https://example.supabase.co/auth/v1/verify?token=preview",
  });

  if (url.searchParams.get("format") === "text") {
    return new NextResponse(`Subject: ${subject}\n\n${text}`, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
