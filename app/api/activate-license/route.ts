import { NextResponse } from "next/server";
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
    route: "/api/activate-license",
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
      return NextResponse.json({ valid: false, error: "Missing key or domain" }, { status: 400, headers: CORS });
    }

    const normalKey    = key.trim().toUpperCase();
    const normalDomain = domain.trim().toLowerCase();

    const { data, error } = await supabase
      .from("licenses")
      .select("key, domain, status")
      .eq("key", normalKey)
      .single();

    if (error || !data) {
      await log(supabase, { status: 200, key: normalKey, domain: normalDomain, ip, error: "not_found" });
      return NextResponse.json({ valid: false, error: "License not found" }, { headers: CORS });
    }

    if (data.status !== "active") {
      await log(supabase, { status: 200, key: normalKey, domain: normalDomain, ip, error: `license_${data.status}` });
      return NextResponse.json({ valid: false, error: `License is ${data.status}` }, { headers: CORS });
    }

    if (data.domain && data.domain !== normalDomain) {
      await log(supabase, { status: 200, key: normalKey, domain: normalDomain, ip, error: "domain_mismatch" });
      return NextResponse.json({ valid: false, error: "License is already assigned to a different domain" }, { headers: CORS });
    }

    if (!data.domain) {
      const { error: updateError } = await supabase
        .from("licenses")
        .update({ domain: normalDomain })
        .eq("key", normalKey);

      if (updateError) {
        await log(supabase, { status: 500, key: normalKey, domain: normalDomain, ip, error: "db_update_failed" });
        return NextResponse.json({ valid: false, error: "Failed to assign domain" }, { status: 500, headers: CORS });
      }
    }

    await log(supabase, { status: 200, key: normalKey, domain: normalDomain, ip });
    return NextResponse.json({ valid: true }, { headers: CORS });
  } catch (err) {
    console.error("[activate-license]", err);
    await log(supabase, { status: 500, ip, error: "Server error" });
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500, headers: CORS });
  }
}
