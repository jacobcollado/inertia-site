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

export async function sendClientMessage(body: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase.from("messages").insert({ client_id: user.id, sender: "client", body });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { success: true };
}

/* Marks the caller's own admin messages as read. The clientId argument is
   ignored in favour of the session user: it arrives from the client, so
   trusting it would let anyone mark another account's messages read by passing
   a different id. */
export async function markAdminMessagesRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  await supabase.from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("client_id", user.id)
    .eq("sender", "admin")
    .is("read_at", null);
  return { success: true };
}

export async function updateClientProfile(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase.from("clients").update({ name }).eq("id", user.id);
  if (error) return { error: error.message };
  await supabase.auth.updateUser({ data: { name } });
  revalidatePath("/dashboard");
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
