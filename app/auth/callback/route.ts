import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      // Sync Google name into clients table on first sign-in
      const googleName = data.user.user_metadata?.full_name as string | undefined;
      if (googleName) {
        await supabase
          .from("clients")
          .update({ name: googleName })
          .eq("id", data.user.id)
          .is("name", null);
      }

      const dest = profile?.role === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
