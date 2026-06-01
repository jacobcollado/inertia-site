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

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  try {
    const { key, domain } = await req.json();
    if (!key || !domain) {
      return NextResponse.json({ valid: false, error: "Missing key or domain" }, { status: 400, headers: CORS });
    }

    const normalKey    = key.trim().toUpperCase();
    const normalDomain = domain.trim().toLowerCase();

    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("licenses")
      .select("key, domain, status")
      .eq("key", normalKey)
      .single();

    if (error || !data) {
      return NextResponse.json({ valid: false, error: "License not found" }, { headers: CORS });
    }

    if (data.status !== "active") {
      return NextResponse.json({ valid: false, error: `License is ${data.status}` }, { headers: CORS });
    }

    if (data.domain && data.domain !== normalDomain) {
      return NextResponse.json({ valid: false, error: "License is already assigned to a different domain" }, { headers: CORS });
    }

    if (!data.domain) {
      const { error: updateError } = await supabase
        .from("licenses")
        .update({ domain: normalDomain })
        .eq("key", normalKey);

      if (updateError) {
        return NextResponse.json({ valid: false, error: "Failed to assign domain" }, { status: 500, headers: CORS });
      }
    }

    return NextResponse.json({ valid: true }, { headers: CORS });
  } catch (err) {
    console.error("[activate-license]", err);
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500, headers: CORS });
  }
}
