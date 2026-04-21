import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type PostMeta = {
  slug: string;
  title: string;
  subtitle?: string;
  date: string;
  summary?: string;
  pinned?: boolean;
};

export type Post = PostMeta & { content: string };

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  const posts = files.map((file) => {
    const slug = file.replace(/\.(md|mdx)$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data } = matter(raw);
    return {
      slug,
      title: data.title ?? slug,
      subtitle: data.subtitle,
      date: data.date ?? "",
      summary: data.summary,
      pinned: data.pinned === true,
    } as PostMeta;
  });
  return posts.sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
    return a.date < b.date ? 1 : -1;
  });
}

export function getPost(slug: string): Post | null {
  const candidates = [`${slug}.mdx`, `${slug}.md`];
  for (const name of candidates) {
    const full = path.join(POSTS_DIR, name);
    if (fs.existsSync(full)) {
      const raw = fs.readFileSync(full, "utf8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: data.title ?? slug,
        subtitle: data.subtitle,
        date: data.date ?? "",
        summary: data.summary,
        content,
      };
    }
  }
  return null;
}

export type Heading = { id: string; text: string; level: number };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function extractHeadings(md: string): Heading[] {
  const out: Heading[] = [];
  const seen = new Map<string, number>();
  const lines = md.split(/\r?\n/);
  let inCodeBlock = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const m = /^(#{1,6})\s+(.*?)\s*#*$/.exec(line);
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].trim();
    if (level > 3) continue;
    const base = slugify(text);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    const id = n === 0 ? base : `${base}-${n}`;
    out.push({ id, text, level });
  }
  return out;
}

export async function renderMarkdown(md: string): Promise<string> {
  const seen = new Map<string, number>();
  const processed = await remark().use(html).process(md);
  let rendered = processed.toString();
  rendered = rendered.replace(
    /<(h[1-3])>([\s\S]*?)<\/\1>/g,
    (_match, tag: string, inner: string) => {
      const text = inner.replace(/<[^>]*>/g, "").trim();
      const base = slugify(text);
      const n = seen.get(base) ?? 0;
      seen.set(base, n + 1);
      const id = n === 0 ? base : `${base}-${n}`;
      return `<${tag} id="${id}">${inner}</${tag}>`;
    }
  );
  return rendered;
}

export function readingStats(md: string): { words: number; minutes: number } {
  const words = md.trim().split(/\s+/).filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.round(words / 200)) };
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
