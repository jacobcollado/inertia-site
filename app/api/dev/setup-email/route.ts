import { NextResponse } from "next/server";
import { renderSetupEmail } from "@/lib/setup-email";

/* Renders the install request email for review without sending. Dev only. */

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const { subject, html, text } = renderSetupEmail();

  if (new URL(req.url).searchParams.get("format") === "text") {
    return new NextResponse(`Subject: ${subject}\n\n${text}`, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
