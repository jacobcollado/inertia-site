import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Mirrors app/api/contact/route.ts: same in-memory rate limit shape and the
// same Resend forwarding, but this endpoint also persists the submission to
// public.project_inquiries. The table has RLS on with no anon policies, so the
// insert runs through the service-role key here on the server.
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

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  referral_source: "Heard about us",
  role: "Role",
  company_stage: "Stage",
  website: "Current site",
  goals: "What they want to achieve",
  readiness: "Readiness",
  descriptor: "Describes them",
};

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (!checkRate(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const {
      name,
      email,
      referral_source,
      role,
      company_stage,
      website,
      goals,
      readiness,
      descriptor,
      quiz_answers,
    } = body ?? {};

    if (!name || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    // Cheap abuse guard: no single free-text answer should run long.
    for (const v of [goals, website, referral_source, role]) {
      if (typeof v === "string" && v.length > 2000) {
        return NextResponse.json({ error: "Answer too long" }, { status: 400 });
      }
    }

    const record = {
      name: String(name).slice(0, 200),
      email: String(email).slice(0, 200),
      referral_source: referral_source ? String(referral_source).slice(0, 500) : null,
      role: role ? String(role).slice(0, 200) : null,
      company_stage: company_stage ? String(company_stage).slice(0, 200) : null,
      website: website ? String(website).slice(0, 500) : null,
      goals: goals ? String(goals).slice(0, 2000) : null,
      readiness: readiness ? String(readiness).slice(0, 200) : null,
      descriptor: descriptor ? String(descriptor).slice(0, 200) : null,
      quiz_answers: quiz_answers ?? {},
    };

    // Persist first: an email that sends but isn't stored loses the lead, so
    // the write is the operation we care most about succeeding.
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && serviceKey) {
      const supabase = createClient(url, serviceKey, {
        auth: { persistSession: false },
      });
      const { error } = await supabase.from("project_inquiries").insert(record);
      if (error) console.error("[inquiry] insert failed:", error.message);
    }

    // Forward to the inbox. A send failure is logged but doesn't fail the
    // request, since the submission is already stored.
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const lines = Object.entries(FIELD_LABELS)
        .map(([key, label]) => {
          const value = record[key as keyof typeof record];
          return value ? `${label}: ${value}` : null;
        })
        .filter(Boolean)
        .join("\n");

      const quizLines = Object.entries(
        (record.quiz_answers ?? {}) as Record<string, string>
      )
        .map(([q, a]) => `  ${q}: ${a}`)
        .join("\n");

      // NB: on Resend's test tier the only permitted recipient is the account
      // owner's own address, and `from` must stay on resend.dev until a domain
      // is verified. Set INQUIRY_NOTIFY_EMAIL (and a verified `from`) once
      // a domain is added at resend.com/domains.
      const notify = process.env.INQUIRY_NOTIFY_EMAIL || "sitebykayz@gmail.com";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Inertia Inquiry <onboarding@resend.dev>",
          to: [notify],
          reply_to: record.email,
          subject: `New inquiry from ${record.name}`,
          text: `${lines}\n\nQuiz answers:\n${quizLines || "  (none)"}`,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("[inquiry] Resend error:", res.status, text);
      }
    }

    if (!process.env.RESEND_API_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log("[inquiry]", record);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
