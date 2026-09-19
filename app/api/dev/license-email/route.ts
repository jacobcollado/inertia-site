import { NextResponse } from "next/server";
import { renderLicenseEmail } from "@/lib/license-email";

/* Renders the license-key email in the browser so it can be reviewed without
 * sending mail. Development only: in production this 404s, so the route can't
 * be used to probe what a given session id belongs to. */

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const url = new URL(req.url);
  const key = url.searchParams.get("key") ?? "AETH-1A2B-3C4D-5E6F";
  const tier = url.searchParams.get("tier") ?? "lifetime";
  const sessionId = url.searchParams.get("session_id") ?? "cs_test_preview_session_id";
  const format = url.searchParams.get("format");

  const { subject, html, text } = renderLicenseEmail({ key, tier, sessionId });

  if (format === "text") {
    return new NextResponse(`Subject: ${subject}\n\n${text}`, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
