import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, message, subject, kind } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (typeof message !== "string" || message.length > 5000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
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
        return NextResponse.json({ error: "Send failed" }, { status: 502 });
      }
    } else if (webhook) {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, subject, kind }),
      });
      if (!res.ok) {
        return NextResponse.json({ error: "Send failed" }, { status: 502 });
      }
    } else {
      console.log("[contact]", { name, email, message, subject, kind });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
