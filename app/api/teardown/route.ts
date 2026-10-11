import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { apiError, INVALID_JSON, TOO_MANY_REQUESTS } from "@/lib/api-error";

// Free teardown requests from the homepage. Same shape as /api/inquiry: an
// in-memory rate limit, a stored record, then an email. The request is also
// added to the Inertia OS pipeline (public.leads) so it shows up on the board
// with the recording as its next step.
const hits = new Map<string, { count: number; reset: number }>();
const LIMIT = 3;
const WINDOW_MS = 60_000;

// What the visitor is promised in the form. Keep in sync with
// components/teardown-dialog.tsx.
const REPLY_BUSINESS_DAYS = 3;

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

function addBusinessDays(from: Date, days: number) {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) left--;
  }
  return d.toISOString().slice(0, 10);
}

function normaliseSite(raw: string) {
  const s = raw.trim();
  const withScheme = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withScheme);
    return u.hostname.includes(".") ? u.toString().replace(/\/$/, "") : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkRate(ip)) return apiError(429, ...TOO_MANY_REQUESTS);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return apiError(400, ...INVALID_JSON);
  }

  // Bots fill every field; people never see this one.
  if (body.company_url) return NextResponse.json({ ok: true });

  const name = String(body.name ?? "").trim().slice(0, 200);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const site = normaliseSite(String(body.website ?? "").slice(0, 500));
  const customers = String(body.customers ?? "").trim().slice(0, 1000) || null;

  if (!name || !email || !body.website) {
    return apiError(400, "missing_fields", "Missing fields", "Send name, email and website.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return apiError(400, "invalid_email", "Invalid email", "Send a valid email address, like name@example.com.");
  }
  if (!site) {
    return apiError(400, "invalid_website", "Invalid website", "Send the site's address, like example.com.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceKey) {
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
    const host = new URL(site).hostname.replace(/^www\./, "");

    const [inquiry, lead] = await Promise.all([
      supabase.from("project_inquiries").insert({
        name,
        email,
        website: site,
        goals: customers,
        descriptor: "Free teardown request",
        quiz_answers: {},
      }),
      supabase.from("leads").insert({
        name,
        company: host,
        email,
        website: site,
        stage: "target",
        source: "Website: teardown request",
        next_step: "Record and send the free teardown",
        next_step_date: addBusinessDays(new Date(), REPLY_BUSINESS_DAYS),
        notes: customers ? `Their customers, in their words: ${customers}` : null,
      }),
    ]);
    if (inquiry.error) console.error("[teardown] inquiry insert failed:", inquiry.error.message);
    if (lead.error) console.error("[teardown] lead insert failed:", lead.error.message);
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    // Same Resend setup as /api/inquiry; see the note there about the test tier.
    const notify = process.env.INQUIRY_NOTIFY_EMAIL || "sitebykayz@gmail.com";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Inertia Inquiry <onboarding@resend.dev>",
        to: [notify],
        reply_to: email,
        subject: `Teardown request: ${new URL(site).hostname}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Site: ${site}`,
          customers ? `Their customers: ${customers}` : null,
          "",
          `Promised: a recorded teardown within ${REPLY_BUSINESS_DAYS} business days.`,
        ]
          .filter((l) => l !== null)
          .join("\n"),
      }),
    });
    if (!res.ok) console.error("[teardown] Resend error:", res.status, await res.text().catch(() => ""));
  }

  if (!resendKey && !serviceKey) console.log("[teardown]", { name, email, site, customers });

  return NextResponse.json({ ok: true });
}
