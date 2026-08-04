import { redirect } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/lib/supabase/server";
import { ClientSidebarShell } from "./client-sidebar-shell";
import { countCasesNeedingResponse } from "./support-cases";

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

  const [{ data: messages }, { data: client }, { data: profile }, { data: openCases }] = await Promise.all([
    supabase
      .from("messages")
      .select("case_id, sender, created_at")
      .eq("client_id", user.id)
      .order("created_at", { ascending: true }),
    supabase.from("clients").select("name, company").eq("id", user.id).single(),
    supabase.from("profiles").select("avatar_url").eq("id", user.id).single(),
    supabase
      .from("cases")
      .select("id, status")
      .eq("client_id", user.id)
      .neq("status", "closed"),
  ]);

  const casesNeedingResponse = countCasesNeedingResponse(openCases ?? [], messages ?? []);

  return (
    <>
      <Script id="set-dashboard-dark" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: SET_DASHBOARD_DARK_SCRIPT }} />
      <ClientSidebarShell
        casesNeedingResponse={casesNeedingResponse}
        email={user.email ?? ""}
        displayName={client?.company ?? client?.name ?? user.email ?? "Client"}
        avatarUrl={(profile?.avatar_url as string | null) ?? null}
      >
        {children}
      </ClientSidebarShell>
    </>
  );
}
