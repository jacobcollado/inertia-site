// One-off seed script: creates a demo client account with realistic sample
// data across every dashboard section (projects, invoices, files, messages,
// licenses), so the client dashboard can be reviewed/tested end to end
// without needing a real client's data.
//
// Run with: npx tsx scripts/seed-demo-client.ts
//
// Safe to re-run: looks up the demo user by email first and reuses it rather
// than creating duplicates, and re-seeding replaces (not appends) demo rows.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";

// Load .env.local manually (no dotenv dependency in this project) — this
// script runs outside Next.js, which normally handles env loading itself.
for (const line of readFileSync(path.join(process.cwd(), ".env.local"), "utf-8").split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] ??= match[2].trim();
}

const DEMO_EMAIL = "demo@byinertia.com";
// Set DEMO_CLIENT_PASSWORD in .env.local before running this script — kept
// out of source so the seed script can be committed safely.
const DEMO_PASSWORD = process.env.DEMO_CLIENT_PASSWORD;
if (!DEMO_PASSWORD) {
  console.error("Missing DEMO_CLIENT_PASSWORD in .env.local");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function findOrCreateDemoUser() {
  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("email", DEMO_EMAIL)
    .maybeSingle();

  if (existing) {
    console.log(`Reusing existing demo client ${existing.id}`);
    return existing.id as string;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error("createUser returned no user");

  const userId = data.user.id;

  await supabase.from("clients").insert({
    id: userId,
    email: DEMO_EMAIL,
    name: "Alex Rivera",
    company: "Rivera Goods Co.",
  });
  await supabase.from("profiles").upsert({ id: userId, role: "client" });

  console.log(`Created demo client ${userId}`);
  return userId;
}

async function seed(clientId: string) {
  // Clear out any previous demo rows for a clean re-seed.
  await Promise.all([
    supabase.from("project_updates").delete().eq("client_id", clientId),
    supabase.from("projects").delete().eq("client_id", clientId),
    supabase.from("invoices").delete().eq("client_id", clientId),
    supabase.from("files").delete().eq("client_id", clientId),
    supabase.from("messages").delete().eq("client_id", clientId),
    supabase.from("licenses").delete().eq("email", DEMO_EMAIL),
  ]);

  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString();
  const daysFromNow = (n: number) => new Date(now + n * 86400000).toISOString().slice(0, 10);

  // ── Projects ─────────────────────────────────────────────────────────
  const { data: projects } = await supabase.from("projects").insert([
    {
      client_id: clientId,
      title: "Storefront redesign",
      status: "active",
      phase: "Build",
      notes: "Full theme rebuild on Aether, migrating from the old Dawn-based store.",
      start_date: daysAgo(21).slice(0, 10),
      target_date: daysFromNow(14),
    },
    {
      client_id: clientId,
      title: "Email flow automation",
      status: "paused",
      phase: "Waiting on copy",
      notes: "Klaviyo flows blocked on final welcome-series copy from the client.",
      start_date: daysAgo(10).slice(0, 10),
      target_date: daysFromNow(30),
    },
    {
      client_id: clientId,
      title: "Brand photography site refresh",
      status: "completed",
      phase: "Shipped",
      notes: "Homepage and lookbook pages updated with new campaign photography.",
      start_date: daysAgo(60).slice(0, 10),
      target_date: daysAgo(35).slice(0, 10),
    },
  ]).select("id, title");

  if (projects) {
    const byTitle = Object.fromEntries(projects.map(p => [p.title, p.id]));
    await supabase.from("project_updates").insert([
      { client_id: clientId, project_id: byTitle["Storefront redesign"], status: "active", note: "Homepage and PDP templates are in review, collection pages next.", created_at: daysAgo(2) },
      { client_id: clientId, project_id: byTitle["Storefront redesign"], status: "active", note: "Kicked off build in the Aether theme editor.", created_at: daysAgo(18) },
      { client_id: clientId, project_id: byTitle["Email flow automation"], status: "paused", note: "Paused pending welcome-series copy from your team.", created_at: daysAgo(4) },
      { client_id: clientId, project_id: byTitle["Brand photography site refresh"], status: "completed", note: "Launched — homepage and lookbook are live.", created_at: daysAgo(35) },
    ]);
  }

  // ── Invoices ─────────────────────────────────────────────────────────
  await supabase.from("invoices").insert([
    { client_id: clientId, label: "Storefront redesign — deposit", amount: 250000, status: "paid", due_date: daysAgo(20).slice(0, 10), paid_at: daysAgo(19) },
    { client_id: clientId, label: "Brand photography refresh", amount: 180000, status: "paid", due_date: daysAgo(40).slice(0, 10), paid_at: daysAgo(38) },
    { client_id: clientId, label: "Storefront redesign — milestone 2", amount: 250000, status: "pending", due_date: daysFromNow(7), payment_url: "https://buy.stripe.com/demo-milestone-2" },
    { client_id: clientId, label: "Email flow automation", amount: 90000, status: "overdue", due_date: daysAgo(3).slice(0, 10), payment_url: "https://buy.stripe.com/demo-email-flows" },
  ]);

  // ── Files ────────────────────────────────────────────────────────────
  await supabase.from("files").insert([
    { client_id: clientId, label: "Storefront-redesign-brief.pdf", url: `${clientId}/storefront-redesign-brief.pdf`, uploaded_at: daysAgo(20) },
    { client_id: clientId, label: "homepage-mockup-v2.png", url: `${clientId}/homepage-mockup-v2.png`, uploaded_at: daysAgo(9) },
    { client_id: clientId, label: "brand-guidelines.pdf", url: `${clientId}/brand-guidelines.pdf`, uploaded_at: daysAgo(55) },
    { client_id: clientId, label: "product-photos.zip", url: `${clientId}/product-photos.zip`, uploaded_at: daysAgo(3) },
  ]);

  // ── Messages ─────────────────────────────────────────────────────────
  await supabase.from("messages").insert([
    { client_id: clientId, sender: "client", body: "Hey! Just checking in on the homepage progress.", created_at: daysAgo(3), read_at: daysAgo(3) },
    { client_id: clientId, sender: "admin", body: "Looking great — we'll have a preview link for you by Friday.", created_at: daysAgo(2.9), read_at: daysAgo(2.8) },
    { client_id: clientId, sender: "admin", body: "Homepage and PDP templates are ready for review, sent the link in email too.", created_at: daysAgo(2), read_at: null },
  ]);

  // ── Licenses ─────────────────────────────────────────────────────────
  await supabase.from("licenses").insert([
    { key: "AETHER-DEMO-CORE-1A2B3C", email: DEMO_EMAIL, domain: "rivera-goods.myshopify.com", tier: "standard", status: "active", created_at: daysAgo(21) },
  ]);

  console.log("Seeded demo data for", DEMO_EMAIL);
}

async function main() {
  const clientId = await findOrCreateDemoUser();
  await seed(clientId);
  console.log("Done.");
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
