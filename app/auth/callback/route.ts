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

      // Sync name (from Google or email signup) into clients table on first sign-in.
      // Google supplies given_name/family_name separately, so prefer combining
      // those directly over full_name/name in case either is just a nickname.
      const meta = data.user.user_metadata ?? {};
      const googleName = [meta.given_name, meta.family_name].filter(Boolean).join(" ").trim();
      const providerName = (googleName || meta.full_name || meta.name) as string | undefined;
      if (providerName) {
        await supabase
          .from("clients")
          .update({ name: providerName })
          .eq("id", data.user.id)
          .is("name", null);
      }

      const isAdmin = profile?.role === "admin";
      const defaultDest = isAdmin ? "/admin" : "/dashboard";
      const dest = (!isAdmin && next.startsWith("/")) ? next : defaultDest;
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
