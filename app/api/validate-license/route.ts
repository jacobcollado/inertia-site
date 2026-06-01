import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function POST(req: Request) {
  try {
    const { key, domain } = await req.json();
    if (!key || !domain) {
      return NextResponse.json({ valid: false, error: "Missing key or domain" }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("licenses")
      .select("key, domain, status")
      .eq("key", key.trim().toUpperCase())
      .single();

    if (error || !data) {
      return NextResponse.json({ valid: false, status: "not_found" });
    }

    if (data.status !== "active") {
      return NextResponse.json({ valid: false, status: data.status });
    }

    if (data.domain && data.domain !== domain.trim()) {
      return NextResponse.json({ valid: false, status: "domain_mismatch" });
    }

    return NextResponse.json({ valid: true, status: data.status });
  } catch (err) {
    console.error("[validate-license]", err);
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
  }
}
