"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { logAiUsage } from "@/lib/ai-usage";

/* ── Auth guard ───────────────────────────────────────────────────── */

/* Every action below drives a service-role Supabase client, which bypasses RLS
   entirely — so the database offers no backstop and each action must check the
   caller itself.

   The `/admin` middleware check is NOT sufficient: server actions POST to the
   route of the page that imported them, and these are imported by "use client"
   components, so their action IDs ship in the public bundle. A crafted POST
   invokes them without ever loading an /admin page. Without this guard, any
   unauthenticated visitor could delete accounts, reset passwords, or mint a
   magic link for any email.

   Mirrors the role check in proxy.ts: a valid session, then profiles.role
   === "admin". Uses the cookie-scoped anon client (not the admin client) so
   the identity comes from the caller's own session rather than being assumed.
   getUser() revalidates against the auth server rather than trusting the
   cookie's contents. */
async function requireAdmin() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");

  return user;
}

/* ── Clients ──────────────────────────────────────────────────────── */

export async function inviteClient(formData: FormData) {
  await requireAdmin();
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const company = formData.get("company") as string;

  const admin = createAdminClient();

  const { data: authData, error: authError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://byinertia.com"}/auth/callback?type=invite`,
  });
  if (authError) return { error: authError.message };

  const userId = authData.user.id;

  await admin.from("clients").insert({ id: userId, email, name: name || null, company: company || null });
  await admin.from("profiles").insert({ id: userId, role: "client" });

  revalidatePath("/admin");
  return { success: true };
}

export async function updateClient(clientId: string, email: string, formData: FormData) {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("projects").delete().eq("id", projectId);
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function addProjectUpdate(projectId: string, clientId: string, status: string, note: string | null) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("project_updates").insert({
    project_id: projectId,
    client_id: clientId,
    status,
    note: note || null,
  });
  if (error) return { error: error.message };
  const { data: project } = await admin.from("projects").select("title").eq("id", projectId).single();
  await admin.from("projects").update({ status }).eq("id", projectId);
  revalidatePath(`/admin/clients/${clientId}`);
  await notifyClient(
    clientId,
    "project_update",
    `Update on ${project?.title ?? "your project"}`,
    `Status changed to "${status.replace("_", " ")}".${note ? `\n\n${note}` : ""}`
  );
  return { success: true };
}

export async function getProjectUpdates(projectId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("project_updates")
    .select("id, status, note, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

/* ── Invoices ─────────────────────────────────────────────────────── */

export async function createInvoice(clientId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const amountRaw = formData.get("amount") as string;
  const label = formData.get("label") as string;
  const dueDate = formData.get("due_date") as string || null;

  await ensureClientRow(clientId);

  const { error } = await admin.from("invoices").insert({
    client_id: clientId,
    label,
    amount: Math.round(parseFloat(amountRaw) * 100),
    status: formData.get("status") as string || "pending",
    due_date: dueDate,
    payment_url: formData.get("payment_url") as string || null,
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/clients/${clientId}`);
  const amountDisplay = (parseFloat(amountRaw) || 0).toFixed(2);
  await notifyClient(
    clientId,
    "invoice_due",
    "New invoice from Inertia",
    `A new invoice "${label}" for $${amountDisplay} has been added to your account.${dueDate ? ` Due ${dueDate}.` : ""}`
  );
  return { success: true };
}

export async function updateInvoiceStatus(invoiceId: string, clientId: string, status: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const update: Record<string, unknown> = { status };
  if (status === "paid") update.paid_at = new Date().toISOString();
  else update.paid_at = null;
  await admin.from("invoices").update(update).eq("id", invoiceId);
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function deleteInvoice(invoiceId: string, clientId: string) {
  await requireAdmin();
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

/* ── Notifications ────────────────────────────────────────────────── */

type NotificationKind = "new_message" | "invoice_due" | "project_update";

/* Looks up the client's email + notification_prefs and sends only if that
   kind is enabled (defaults to on if the client predates the prefs column).
   Never throws — a failed notification shouldn't roll back or block the
   action that triggered it. */
async function notifyClient(clientId: string, kind: NotificationKind, subject: string, text: string) {
  try {
    const admin = createAdminClient();
    const { data: client } = await admin
      .from("clients")
      .select("email, notification_prefs")
      .eq("id", clientId)
      .single();
    if (!client?.email) return;
    const prefs = (client.notification_prefs as Record<string, boolean> | null) ?? {};
    if (prefs[kind] === false) return;
    await sendEmail({ to: client.email, subject, text });
  } catch (err) {
    console.error("[notifyClient] failed:", err);
  }
}

/* ── Account management ───────────────────────────────────────────── */

export async function suspendAccount(clientId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(clientId, { ban_duration: "876600h" });
  if (error) return { error: error.message };
  await logAction(clientId, "suspend");
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin");
  return { success: true };
}

export async function unsuspendAccount(clientId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(clientId, { ban_duration: "none" });
  if (error) return { error: error.message };
  await logAction(clientId, "unsuspend");
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteAccount(clientId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(clientId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function updateAccountEmail(clientId: string, email: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(clientId, { email });
  if (error) return { error: error.message };
  await admin.from("clients").update({ email }).eq("id", clientId);
  await logAction(clientId, "email_change", email);
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function updateAccountPassword(clientId: string, password: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(clientId, { password });
  if (error) return { error: error.message };
  await logAction(clientId, "password_change");
  return { success: true };
}

export async function resendInvite(clientId: string, email: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://byinertia.com"}/auth/callback?type=invite`,
  });
  if (error) return { error: error.message };
  await logAction(clientId, "invite_sent", email);
  return { success: true };
}

export async function forceSignOut(clientId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.signOut(clientId, "others");
  if (error) return { error: error.message };
  await logAction(clientId, "force_signout");
  return { success: true };
}

export async function generateMagicLink(clientId: string, email: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://byinertia.com"}/dashboard` },
  });
  if (error) return { error: error.message };
  return { url: data.properties?.action_link ?? null };
}

export async function updateClientNotes(clientId: string, notes: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("clients").update({ notes: notes || null }).eq("id", clientId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function getAdminLog(clientId: string) {
  await requireAdmin();
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

export async function sendAdminMessage(clientId: string, body: string, caseId: string | null) {
  await requireAdmin();
  const admin = createAdminClient();
  await ensureClientRow(clientId);
  const { error } = await admin.from("messages").insert({ client_id: clientId, case_id: caseId, sender: "admin", body });
  if (error) return { error: error.message };
  revalidatePath(`/admin/clients/${clientId}`);
  await notifyClient(clientId, "new_message", "New message from Inertia support", body);
  return { success: true };
}

/* Suggests one short reply for the admin to send, based on the case's recent
   message history — a much cheaper/faster model than the client-facing
   auto-reply (Haiku vs Sonnet) since this is just a starting-point
   suggestion the admin can edit or discard, not a reply sent unprompted.
   Returns null (no suggestion) rather than throwing when the key is
   missing, the thread is empty, or the call fails — the composer already
   has static quick-reply chips as a fallback. */
export async function suggestAdminReply(history: { sender: string; body: string }[]): Promise<{ suggestion: string } | { suggestion: null }> {
  await requireAdmin();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || history.length === 0) return { suggestion: null };

  const MODEL = "claude-haiku-4-5-20251001";
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 120,
      system:
        "You are drafting a short reply for a human support agent at a design/dev studio (Inertia) to send to a client, " +
        "based on the conversation so far. Write ONE short, natural reply (1-3 sentences) in the agent's voice, " +
        "as if you were them replying directly. Do not add a greeting or sign-off. Do not explain your reasoning. " +
        "Output only the reply text itself, nothing else.",
      messages: history.map(m => ({
        role: m.sender === "admin" ? "assistant" as const : "user" as const,
        content: m.body,
      })),
    });
    logAiUsage({
      model: MODEL,
      feature: "admin-quick-reply",
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });
    const raw = response.content.find(b => b.type === "text")?.text?.trim();
    return raw ? { suggestion: raw } : { suggestion: null };
  } catch (err) {
    console.error("suggestAdminReply failed:", err instanceof Error ? err.message : err);
    return { suggestion: null };
  }
}

export async function markMessagesRead(clientId: string, caseId: string | null) {
  await requireAdmin();
  const admin = createAdminClient();
  let query = admin.from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("client_id", clientId)
    .eq("sender", "client")
    .is("read_at", null);
  if (caseId) query = query.eq("case_id", caseId);
  await query;
  return { success: true };
}

/* ── Cases ────────────────────────────────────────────────────────── */

export async function updateCaseSeverity(caseId: string, clientId: string, severity: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("cases").update({ severity, updated_at: new Date().toISOString() }).eq("id", caseId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function updateCaseStatus(caseId: string, clientId: string, status: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("cases").update({ status, updated_at: new Date().toISOString() }).eq("id", caseId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

/* ── Files ────────────────────────────────────────────────────────── */

export async function addFile(clientId: string, formData: FormData) {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("files").delete().eq("id", fileId);
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

