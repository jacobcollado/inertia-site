"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function sendClientMessage(body: string, caseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase.from("messages").insert({ client_id: user.id, case_id: caseId, sender: "client", body });
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/messages/${caseId}`);
  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
  return { success: true };
}

/* Marks the caller's own admin messages as read. The clientId argument is
   ignored in favour of the session user: it arrives from the client, so
   trusting it would let anyone mark another account's messages read by passing
   a different id. */
export async function markAdminMessagesRead(caseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  await supabase.from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("client_id", user.id)
    .eq("case_id", caseId)
    .eq("sender", "admin")
    .is("read_at", null);
  return { success: true };
}

export async function createCase(title: string, body: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  if (!title.trim()) return { error: "Title is required" };

  const { data: caseNumber } = await supabase.rpc("generate_case_number");

  const { data: newCase, error: caseError } = await supabase
    .from("cases")
    .insert({ client_id: user.id, title: title.trim(), case_number: caseNumber ?? "00000000" })
    .select("id")
    .single();
  if (caseError || !newCase) return { error: caseError?.message ?? "Could not create case" };

  if (body.trim()) {
    const { error: msgError } = await supabase
      .from("messages")
      .insert({ client_id: user.id, case_id: newCase.id, sender: "client", body: body.trim() });
    if (msgError) return { error: msgError.message };
  }

  revalidatePath("/dashboard/messages");
  return { success: true, caseId: newCase.id as string };
}

/* "Create follow-up" on a closed case opens a new case rather than reopening
   the old one: clients have no UPDATE policy on cases (status changes are
   admin-only, set after triage), and a fresh case gives support a clean
   thread instead of resurrecting a closed one. */
export async function createFollowUpCase(fromCaseId: string, fromCaseTitle: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: caseNumber } = await supabase.rpc("generate_case_number");

  const { data: newCase, error: caseError } = await supabase
    .from("cases")
    .insert({ client_id: user.id, title: `Follow-up: ${fromCaseTitle}`, case_number: caseNumber ?? "00000000" })
    .select("id")
    .single();
  if (caseError || !newCase) return { error: caseError?.message ?? "Could not create case" };

  revalidatePath("/dashboard/messages");
  return { success: true, caseId: newCase.id as string };
}

export async function updateClientProfile(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase.from("clients").update({ name }).eq("id", user.id);
  if (error) return { error: error.message };
  await supabase.auth.updateUser({ data: { name } });
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateNotificationPrefs(prefs: { new_message: boolean; invoice_due: boolean; project_update: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase.from("clients").update({ notification_prefs: prefs }).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { success: true };
}

/* Self-service account deletion. Uses the admin client (service role) only
   to perform the actual auth.users delete, which requires it — but the
   target id always comes from the caller's own verified session, never from
   an argument, so this can only ever delete the caller's own account. */
export async function deleteOwnAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  return { success: true };
}

/* Mints a short-lived signed URL for a private client file. Uses the service
   role client (which bypasses RLS), so it must verify the caller itself — and
   must confirm the path belongs to them, since storage keys are
   `${clientId}/...` and an arbitrary path would otherwise expose any client's
   files to any signed-in user. */
export async function getSignedFileUrl(storagePath: string) {
  const isStoragePath = !storagePath.startsWith("http");
  if (!isStoragePath) return { url: storagePath };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Admins may read any client's files; everyone else only their own prefix.
  if (profile?.role !== "admin" && !storagePath.startsWith(`${user.id}/`)) {
    return { error: "Not authorized" };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("client-files")
    .createSignedUrl(storagePath, 60 * 60);
  if (error) return { error: error.message };
  return { url: data.signedUrl };
}
