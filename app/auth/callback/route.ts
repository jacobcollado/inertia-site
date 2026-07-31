import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Password recovery and invite links land here too (Supabase appends
      // ?code= after verifying the emailed token) — send those to their own
      // password-setting screens instead of the dashboard, since the user
      // hasn't set a password yet.
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      if (type === "invite") {
        return NextResponse.redirect(`${origin}/accept-invite`);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      // Sign-ups are closed publicly, but the login page (and the Google
      // button on it) still has to stay reachable for existing clients — so
      // the gate has to happen here, not by hiding UI. profiles isn't a
      // useful signal on its own: a DB trigger (handle_new_user) auto-inserts
      // a profiles row for every brand-new auth user regardless of whether
      // they were invited. clients has no such trigger — it's only ever
      // populated explicitly by inviteClient, at the same id, before the
      // client ever completes OAuth. So an admin exists (profile.role ===
      // "admin", no clients row expected) or a genuine client has a matching
      // clients row; anyone with neither just had Google auto-create them a
      // fresh account with no invite behind it — delete it and bounce.
      const isAdmin = profile?.role === "admin";
      if (!isAdmin) {
        const { data: clientRow } = await supabase
          .from("clients")
          .select("id")
          .eq("id", data.user.id)
          .single();
        if (!clientRow) {
          const admin = createAdminClient();
          await admin.auth.admin.deleteUser(data.user.id);
          return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("This account hasn't been invited. Contact us if you think this is a mistake.")}`);
        }
      }

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

      const defaultDest = isAdmin ? "/admin" : "/dashboard";
      const dest = (!isAdmin && next.startsWith("/")) ? next : defaultDest;
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
