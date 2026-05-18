"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/* ── Clients ──────────────────────────────────────────────────────── */

export async function inviteClient(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const company = formData.get("company") as string;

  const admin = createAdminClient();

  const { data: authData, error: authError } = await admin.auth.admin.inviteUserByEmail(email);
  if (authError) return { error: authError.message };

  const userId = authData.user.id;

  await admin.from("clients").insert({ id: userId, email, name: name || null, company: company || null });
  await admin.from("profiles").insert({ id: userId, role: "client" });

  revalidatePath("/admin");
  return { success: true };
}

export async function updateClient(clientId: string, email: string, formData: FormData) {
  const admin = createAdminClient();
  await admin.from("clients").upsert({
    id: clientId,
    email,
    name: formData.get("name") as string || null,
    company: formData.get("company") as string || null,
  }, { onConflict: "id" });
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

/* ── Projects ─────────────────────────────────────────────────────── */

async function ensureClientRow(clientId: string) {
  const admin = createAdminClient();
  const { data: authUser } = await admin.auth.admin.getUserById(clientId);
  if (authUser?.user) {
    const u = authUser.user;
    await admin.from("clients").upsert({
      id: clientId,
      email: u.email ?? "",
      name: u.user_metadata?.name ?? null,
    }, { onConflict: "id" });
  }
}

export async function createProject(clientId: string, formData: FormData) {
  const admin = createAdminClient();
  await ensureClientRow(clientId);
  const { error } = await admin.from("projects").insert({
    client_id: clientId,
    title: formData.get("title") as string,
    status: formData.get("status") as string || "active",
    phase: formData.get("phase") as string || null,
    last_update: formData.get("last_update") as string || null,
    notes: formData.get("notes") as string || null,
    start_date: formData.get("start_date") as string || null,
    target_date: formData.get("target_date") as string || null,
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function updateProject(projectId: string, clientId: string, formData: FormData) {
  const admin = createAdminClient();
  await admin.from("projects").update({
    title: formData.get("title") as string,
    status: formData.get("status") as string,
    phase: formData.get("phase") as string || null,
    last_update: formData.get("last_update") as string || null,
    notes: formData.get("notes") as string || null,
    start_date: formData.get("start_date") as string || null,
    target_date: formData.get("target_date") as string || null,
  }).eq("id", projectId);
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function deleteProject(projectId: string, clientId: string) {
  const admin = createAdminClient();
  await admin.from("projects").delete().eq("id", projectId);
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

/* ── Invoices ─────────────────────────────────────────────────────── */

export async function createInvoice(clientId: string, formData: FormData) {
  const admin = createAdminClient();
  const amountRaw = formData.get("amount") as string;

  await ensureClientRow(clientId);

  const { error } = await admin.from("invoices").insert({
    client_id: clientId,
    label: formData.get("label") as string,
    amount: Math.round(parseFloat(amountRaw) * 100),
    status: formData.get("status") as string || "pending",
    due_date: formData.get("due_date") as string || null,
    payment_url: formData.get("payment_url") as string || null,
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function updateInvoiceStatus(invoiceId: string, clientId: string, status: string) {
  const admin = createAdminClient();
  const update: Record<string, unknown> = { status };
  if (status === "paid") update.paid_at = new Date().toISOString();
  else update.paid_at = null;
  await admin.from("invoices").update(update).eq("id", invoiceId);
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function deleteInvoice(invoiceId: string, clientId: string) {
  const admin = createAdminClient();
  await admin.from("invoices").delete().eq("id", invoiceId);
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

/* ── Audit log ────────────────────────────────────────────────────── */

async function logAction(clientId: string, action: string, detail?: string) {
  const admin = createAdminClient();
  await admin.from("admin_log").insert({ client_id: clientId, action, detail: detail ?? null });
}

/* ── Account management ───────────────────────────────────────────── */

export async function suspendAccount(clientId: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(clientId, { ban_duration: "876600h" });
  if (error) return { error: error.message };
  await logAction(clientId, "suspend");
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin");
  return { success: true };
}

export async function unsuspendAccount(clientId: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(clientId, { ban_duration: "none" });
  if (error) return { error: error.message };
  await logAction(clientId, "unsuspend");
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteAccount(clientId: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(clientId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function updateAccountEmail(clientId: string, email: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(clientId, { email });
  if (error) return { error: error.message };
  await admin.from("clients").update({ email }).eq("id", clientId);
  await logAction(clientId, "email_change", email);
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function updateAccountPassword(clientId: string, password: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(clientId, { password });
  if (error) return { error: error.message };
  await logAction(clientId, "password_change");
  return { success: true };
}

export async function resendInvite(clientId: string, email: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(email);
  if (error) return { error: error.message };
  await logAction(clientId, "invite_sent", email);
  return { success: true };
}

export async function getAdminLog(clientId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_log")
    .select("id, action, detail, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

/* ── Messages ─────────────────────────────────────────────────────── */

export async function sendAdminMessage(clientId: string, body: string) {
  const admin = createAdminClient();
  await ensureClientRow(clientId);
  const { error } = await admin.from("messages").insert({ client_id: clientId, sender: "admin", body });
  if (error) return { error: error.message };
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function markMessagesRead(clientId: string) {
  const admin = createAdminClient();
  await admin.from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("client_id", clientId)
    .eq("sender", "client")
    .is("read_at", null);
  return { success: true };
}

/* ── Files ────────────────────────────────────────────────────────── */

export async function addFile(clientId: string, formData: FormData) {
  const admin = createAdminClient();
  await ensureClientRow(clientId);

  const file = formData.get("file") as File;
  const label = formData.get("label") as string || file.name;
  const ext = file.name.split(".").pop();
  const storagePath = `${clientId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from("client-files")
    .upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) return { error: uploadError.message };

  const { error } = await admin.from("files").insert({
    client_id: clientId,
    label,
    url: storagePath,
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function getSignedFileUrl(storagePath: string) {
  const admin = createAdminClient();
  const isStoragePath = !storagePath.startsWith("http");
  if (!isStoragePath) return { url: storagePath };
  const { data, error } = await admin.storage
    .from("client-files")
    .createSignedUrl(storagePath, 60 * 60);
  if (error) return { error: error.message };
  return { url: data.signedUrl };
}

export async function addFileFromUrl(clientId: string, formData: FormData) {
  const admin = createAdminClient();
  await ensureClientRow(clientId);
  const { error } = await admin.from("files").insert({
    client_id: clientId,
    label: formData.get("label") as string,
    url: formData.get("url") as string,
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function deleteFile(fileId: string, clientId: string) {
  const admin = createAdminClient();
  await admin.from("files").delete().eq("id", fileId);
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}
