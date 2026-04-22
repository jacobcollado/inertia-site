import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const WORK_DIR = path.join(process.cwd(), "content", "work");

export type WorkMeta = {
  slug: string;
  client: string;
  role?: string;
  service?: string;
  year?: string;
  summary?: string;
  order?: number;
  cover?: string;
  preview?: string;
  palette?: string[];
  instagram?: string;
  url?: string;
  images?: string[];
};

export type WorkPiece = WorkMeta & { content: string };

export function getAllWork(): WorkMeta[] {
  if (!fs.existsSync(WORK_DIR)) return [];
  const files = fs.readdirSync(WORK_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  const pieces = files.map((file) => {
    const slug = file.replace(/\.(md|mdx)$/, "");
    const raw = fs.readFileSync(path.join(WORK_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const images = extractImages(content);
    return {
      slug,
      client: data.client ?? slug,
      role: data.role,
      service: data.service,
      year: data.year,
      summary: data.summary,
      order: typeof data.order === "number" ? data.order : 999,
      cover: data.cover,
      preview: data.preview,
      palette: Array.isArray(data.palette) ? data.palette : undefined,
      instagram: data.instagram,
      url: data.url,
      images,
    } as WorkMeta;
  });
  return pieces.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

function extractImages(md: string): string[] {
  const re = /!\[.*?\]\((.*?)\)/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) out.push(m[1]);
  return out;
}

export function getWork(slug: string): WorkPiece | null {
  const candidates = [`${slug}.mdx`, `${slug}.md`];
  for (const name of candidates) {
    const full = path.join(WORK_DIR, name);
    if (fs.existsSync(full)) {
      const raw = fs.readFileSync(full, "utf8");
      const { data, content } = matter(raw);
      return {
        slug,
        client: data.client ?? slug,
        role: data.role,
        service: data.service,
        year: data.year,
        summary: data.summary,
        order: typeof data.order === "number" ? data.order : 999,
        cover: data.cover,
        preview: data.preview,
        palette: Array.isArray(data.palette) ? data.palette : undefined,
        instagram: data.instagram,
        url: data.url,
        images: extractImages(content),
        content,
      };
    }
  }
  return null;
}

export async function renderWorkMarkdown(md: string): Promise<string> {
  const processed = await remark().use(html).process(md);
  return processed.toString();
}
