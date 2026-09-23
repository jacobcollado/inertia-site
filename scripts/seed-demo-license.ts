// Gives the demo account an active Aether license that's one release behind,
// so the "update available" flow shows on the overview, the licenses list and
// the license page. Downloading the theme from the demo clears it (the
// download records the latest version); re-run this to put it back.
//
// Run with: npx tsx scripts/seed-demo-license.ts [version]
// The version it's "on" defaults to the release before the latest.
//
// Touches only the demo license, unlike seed-demo-client.ts which wipes and
// re-seeds every demo row.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { AETHER_CHANGELOG } from "../lib/aether-changelog";

for (const line of readFileSync(path.join(process.cwd(), ".env.local"), "utf-8").split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] ??= match[2].trim();
}

const DEMO_EMAIL = "demo@byinertia.com";
const DEMO_KEY = "AETHER-DEMO-CORE-1A2B3C";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const { error: columnError } = await supabase.from("licenses").select("downloaded_version").limit(1);
  if (columnError) {
    throw new Error(`licenses.downloaded_version is missing. Run supabase/migrations/016_theme_version_and_attachments.sql first. (${columnError.message})`);
  }

  // Borrow the real theme zip path so the demo's Download button works.
  const { data: withZip } = await supabase
    .from("licenses")
    .select("theme_file_path")
    .not("theme_file_path", "is", null)
    .limit(1)
    .maybeSingle();

  const previous = process.argv[2] ?? AETHER_CHANGELOG[1]?.version ?? AETHER_CHANGELOG[0].version;
  const row = {
    email: DEMO_EMAIL,
    tier: "standard",
    status: "active",
    domain: "rivera-goods.myshopify.com",
    theme_file_path: withZip?.theme_file_path ?? null,
    downloaded_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    downloaded_version: previous,
  };

  const { data: existing } = await supabase.from("licenses").select("id").eq("key", DEMO_KEY).maybeSingle();
  const { error } = existing
    ? await supabase.from("licenses").update(row).eq("id", existing.id)
    : await supabase.from("licenses").insert({ ...row, key: DEMO_KEY });
  if (error) throw error;

  console.log(`${existing ? "Updated" : "Created"} ${DEMO_KEY} for ${DEMO_EMAIL}, on v${previous} (latest is v${AETHER_CHANGELOG[0].version}).`);
  if (!row.theme_file_path) console.log("No theme zip found on any license, so the Download button won't show.");
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
