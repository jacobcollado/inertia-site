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

export async function markAdminMessagesRead(clientId: string) {
  const supabase = await createClient();
  await supabase.from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("client_id", clientId)
    .eq("sender", "admin")
    .is("read_at", null);
  return { success: true };
}

export async function getSignedFileUrl(storagePath: string) {
  const isStoragePath = !storagePath.startsWith("http");
  if (!isStoragePath) return { url: storagePath };
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("client-files")
    .createSignedUrl(storagePath, 60 * 60);
  if (error) return { error: error.message };
  return { url: data.signedUrl };
}
