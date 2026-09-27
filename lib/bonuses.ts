import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { SupabaseClient } from "@supabase/supabase-js";
import { extractHeadings, renderMarkdown, type Heading } from "./posts";

/* The guides and lists that come with an Aether license, written as MDX in
 * content/bonuses and shown in the dashboard to license holders only.
 *
 * `worth` is repeated in app/aether/bonuses.tsx, which prices them on the
 * sales page. That file feeds a client component and can't read from disk,
 * so keep the two in step when a value changes. */

const BONUSES_DIR = path.join(process.cwd(), "content", "bonuses");

export type BonusMeta = {
  slug: string;
  title: string;
  kind: "guide" | "list";
  worth: number;
  summary: string;
  order: number;
};

export type Bonus = BonusMeta & { html: string; headings: Heading[] };

function readMeta(file: string): BonusMeta & { content: string } {
  const slug = file.replace(/\.(md|mdx)$/, "");
  const { data, content } = matter(fs.readFileSync(path.join(BONUSES_DIR, file), "utf8"));
  return {
    slug,
    title: data.title ?? slug,
    kind: data.kind === "list" ? "list" : "guide",
    worth: Number(data.worth) || 0,
    summary: data.summary ?? "",
    order: Number(data.order) || 99,
    content,
  };
}

export function getAllBonuses(): BonusMeta[] {
  if (!fs.existsSync(BONUSES_DIR)) return [];
  return fs
    .readdirSync(BONUSES_DIR)
    .filter((f) => /\.(md|mdx)$/.test(f))
    .map((f) => {
      const { content: _content, ...meta } = readMeta(f);
      return meta;
    })
    .sort((a, b) => a.order - b.order);
}

export async function getBonus(slug: string): Promise<Bonus | null> {
  // Slugs come from the URL, so only accept ones that name a real file.
  const file = [`${slug}.mdx`, `${slug}.md`].find(
    (name) => /^[a-z0-9-]+\.mdx?$/.test(name) && fs.existsSync(path.join(BONUSES_DIR, name)),
  );
  if (!file) return null;
  const { content, ...meta } = readMeta(file);
  // extractHeadings and renderMarkdown slug headings the same way, so the
  // table of contents links land on the rendered ids.
  return { ...meta, html: await renderMarkdown(content), headings: extractHeadings(content) };
}

/** Bonuses unlock with any active Aether license on the account's email. */
export async function hasActiveLicense(supabase: SupabaseClient, email: string | undefined) {
  if (!email) return false;
  const { data } = await supabase
    .from("licenses")
    .select("id")
    .eq("email", email)
    .eq("status", "active")
    .limit(1);
  return (data?.length ?? 0) > 0;
}
