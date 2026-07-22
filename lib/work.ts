import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import sharp from "sharp";

const WORK_DIR = path.join(process.cwd(), "content", "work");
const PUBLIC_DIR = path.join(process.cwd(), "public");

export type WorkMeta = {
  slug: string;
  client: string;
  role?: string;
  service?: string;
  year?: string;
  summary?: string;
  blurb?: string;
  order?: number;
  cover?: string;
  preview?: string;
  // When set, the client carousel on page.tsx uses this photo instead of
  // its default generated gradient+logo card.
  card?: string;
  palette?: string[];
  instagram?: string;
  url?: string;
  images?: string[];
  featured?: boolean;
  logo?: string;
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
      blurb: data.blurb,
      order: typeof data.order === "number" ? data.order : 999,
      cover: data.cover,
      preview: data.preview,
      card: data.card,
      palette: Array.isArray(data.palette) ? data.palette : undefined,
      instagram: data.instagram,
      url: data.url,
      images,
      featured: data.featured === true,
      logo: data.logo,
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

export type SizedImage = { src: string; width: number; height: number };

// Reading each image's real dimensions server-side lets the gallery reserve
// the right amount of space before the <img> tag ever loads, instead of
// collapsing to 0 height and shifting everything below it into place as
// images finish fetching. That shift was the root cause behind the /work
// scroll-to-project links (from the homepage carousel) consistently landing
// short on projects with several unsized images above their section.
async function sizeImage(src: string): Promise<SizedImage> {
  try {
    const buf = fs.readFileSync(path.join(PUBLIC_DIR, src));
    const meta = await sharp(buf).metadata();
    return { src, width: meta.width ?? 1, height: meta.height ?? 1 };
  } catch {
    return { src, width: 1, height: 1 };
  }
}

export async function getWorkGalleryImages(w: WorkMeta): Promise<SizedImage[]> {
  const paths = [
    ...(w.cover ? [w.cover] : []),
    ...(w.preview ? [w.preview] : []),
    ...(w.images ?? []),
  ];
  return Promise.all(paths.map(sizeImage));
}
