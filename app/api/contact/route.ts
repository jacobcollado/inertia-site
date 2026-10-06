import { NextResponse } from "next/server";
import { apiError, INVALID_JSON, TOO_MANY_REQUESTS } from "@/lib/api-error";

const hits = new Map<string, { count: number; reset: number }>();
const LIMIT = 5;
const WINDOW_MS = 60_000;

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  const ip =
    (req as Request & { headers: Headers }).headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (!checkRate(ip)) {
    return apiError(429, ...TOO_MANY_REQUESTS);
  }
  try {
    const { name, email, message, subject, kind } = await req.json();

    if (!name || !email || !message) {
      return apiError(400, "missing_fields", "Missing fields", "Send name, email and message.");
    }
    if (typeof message !== "string" || message.length > 5000) {
      return apiError(400, "message_too_long", "Message too long", "Send a message of 5000 characters or fewer.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return apiError(400, "invalid_email", "Invalid email", "Send a valid email address, like name@example.com.");
    }

    const webhook = process.env.CONTACT_WEBHOOK_URL;
    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Contact Form <onboarding@resend.dev>",
          to: ["jacob@aftertone.agency"],
          reply_to: email,
          subject: subject || `New contact from ${name}`,
          text: `From: ${name} <${email}>${kind ? `\nKind: ${kind}` : ""}\n\n${message}`,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Resend error:", res.status, text);
        return apiError(502, "send_failed", "Send failed", "Try again shortly, or email hello@byinertia.com directly.");
      }
    } else if (webhook) {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, subject, kind }),
      });
      if (!res.ok) {
        return apiError(502, "send_failed", "Send failed", "Try again shortly, or email hello@byinertia.com directly.");
      }
    } else {
      console.log("[contact]", { name, email, message, subject, kind });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return apiError(400, ...INVALID_JSON);
  }
}
