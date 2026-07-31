import { redirect } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/lib/supabase/server";
import { ClientSidebarShell } from "./client-sidebar-shell";

// Applied synchronously before first paint so there's no white flash before
// ClientSidebarShell's effect runs — see .dashboard-dark in globals.css.
const SET_DASHBOARD_DARK_SCRIPT = `
(function () {
  try { document.documentElement.classList.add("dashboard-dark"); } catch (e) {}
})();
`;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ count }, { data: client }, { data: profile }, { data: openCases }] = await Promise.all([
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("client_id", user.id)
      .eq("sender", "admin")
      .is("read_at", null),
    supabase.from("clients").select("name, company").eq("id", user.id).single(),
    supabase.from("profiles").select("avatar_url").eq("id", user.id).single(),
    supabase
      .from("cases")
      .select("id, messages(sender, created_at)")
      .eq("client_id", user.id)
      .neq("status", "closed"),
  ]);

  // A case needs a client response when its most recent message came from
  // admin. Cheap enough to compute here (small per-client volume) rather
  // than adding a dedicated view/column just for this sidebar dot.
  const needsResponse = (openCases ?? []).some(c => {
    const msgs = (c.messages ?? []) as { sender: string; created_at: string }[];
    if (msgs.length === 0) return false;
    const latest = [...msgs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    return latest.sender === "admin";
  });

  return (
    <>
      <Script id="set-dashboard-dark" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: SET_DASHBOARD_DARK_SCRIPT }} />
      <ClientSidebarShell
        unreadMessages={count ?? 0}
        needsResponse={needsResponse}
        email={user.email ?? ""}
        displayName={client?.company ?? client?.name ?? user.email ?? "Client"}
        avatarUrl={(profile?.avatar_url as string | null) ?? null}
      >
        {children}
      </ClientSidebarShell>
    </>
  );
}
