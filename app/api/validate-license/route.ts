import { NextResponse } from "next/server";
import { apiError, SERVER_ERROR } from "@/lib/api-error";
import { createClient } from "@supabase/supabase-js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

function getIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

async function log(supabase: ReturnType<typeof supabaseAdmin>, fields: {
  status: number; key?: string; domain?: string; ip?: string; error?: string;
}) {
  await supabase.from("api_logs").insert({
    route: "/api/validate-license",
    method: "POST",
    ...fields,
  }).then(() => {});
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  const supabase = supabaseAdmin();
  const ip = getIp(req);

  try {
    const { key, domain } = await req.json();
    if (!key || !domain) {
      await log(supabase, { status: 400, ip, error: "Missing key or domain" });
      return apiError(400, "missing_fields", "Missing key or domain", 'Send a JSON body with "key" (your license key) and "domain" (the store domain).', { headers: CORS, extra: { valid: false } });
    }

    const { data, error } = await supabase
      .from("licenses")
      .select("key, domain, status")
      .eq("key", key.trim().toUpperCase())
      .single();

    if (error || !data) {
      await log(supabase, { status: 200, key, domain, ip, error: "not_found" });
      return NextResponse.json({ valid: false, status: "not_found" }, { headers: CORS });
    }

    if (data.status !== "active") {
      await log(supabase, { status: 200, key, domain, ip, error: data.status });
      return NextResponse.json({ valid: false, status: data.status }, { headers: CORS });
    }

    if (data.domain && data.domain !== domain.trim()) {
      await log(supabase, { status: 200, key, domain, ip, error: "domain_mismatch" });
      return NextResponse.json({ valid: false, status: "domain_mismatch" }, { headers: CORS });
    }

    await log(supabase, { status: 200, key, domain, ip });
    return NextResponse.json({ valid: true, status: data.status }, { headers: CORS });
  } catch (err) {
    console.error("[validate-license]", err);
    await log(supabase, { status: 500, ip, error: "Server error" });
    return apiError(500, ...SERVER_ERROR, { headers: CORS, extra: { valid: false } });
  }
}
