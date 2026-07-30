import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Password recovery links land here too (Supabase appends ?code= after
      // verifying the emailed token) — send those to the reset-password
      // screen instead of the dashboard, since the user hasn't set a new
      // password yet.
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      // Sync name into clients table. Google supplies given_name/family_name
      // separately, so prefer combining those directly over full_name/name in
      // case either is just a nickname.
      const meta = data.user.user_metadata ?? {};
      const googleName = [meta.given_name, meta.family_name].filter(Boolean).join(" ").trim();
      const providerName = (googleName || meta.full_name || meta.name) as string | undefined;
      // Google is authoritative once it's the sign-in method, so overwrite on
      // every login rather than only filling a blank — otherwise a stale or
      // wrong name set before Google was linked (or Google's own metadata
      // lagging right after consent on the very first login) sticks forever.
      // Email signups still only fill a blank, since that name is
      // self-reported and shouldn't be silently overwritten each login.
      const isGoogleSignIn = data.user.app_metadata?.provider === "google";
      if (providerName) {
        const query = supabase.from("clients").update({ name: providerName }).eq("id", data.user.id);
        await (isGoogleSignIn ? query : query.is("name", null));
      }

      // Same idea for the profile picture — Supabase maps Google's photo to
      // either avatar_url or picture depending on the provider response, so
      // check both.
      const providerAvatar = (meta.avatar_url || meta.picture) as string | undefined;
      if (providerAvatar) {
        const query = supabase.from("profiles").update({ avatar_url: providerAvatar }).eq("id", data.user.id);
        await (isGoogleSignIn ? query : query.is("avatar_url", null));
      }

      const isAdmin = profile?.role === "admin";
      const defaultDest = isAdmin ? "/admin" : "/dashboard";
      const dest = (!isAdmin && next.startsWith("/")) ? next : defaultDest;
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
