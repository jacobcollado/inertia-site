import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOC } from "./toc";
import { ReadingProgress } from "./progress";
import { Highlighter } from "./highlighter";
import { CopyURL } from "./copy-url";
import {
  getAllPosts,
  getPost,
  formatDate,
  renderMarkdown,
  extractHeadings,
  readingStats,
} from "@/lib/posts";

function SketchAI() {
  return (
    <svg viewBox="0 0 560 280" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {[70, 128, 187].map(y => (
        <line key={y} x1="50" y1={y} x2="526" y2={y} stroke="rgb(var(--muted))" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.2" />
      ))}
      <line x1="50" y1="233" x2="526" y2="233" stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.3" />
      <line x1="50" y1="28"  x2="50"  y2="233" stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.3" />
      <path d="M 50 229 C 112 226 168 213 224 196 C 266 180 302 157 336 129" stroke="rgb(var(--blue))" strokeWidth="2.2" opacity="0.8" />
      <path d="M 336 129 C 373 101 415 70 462 42" stroke="rgb(var(--blue))" strokeWidth="1.6" strokeDasharray="5 4" opacity="0.55" />
      <path d="M 336 129 C 373 87 418 50 476 28" stroke="rgb(var(--blue))" strokeWidth="0.9" strokeDasharray="3 4" opacity="0.3" />
      <path d="M 336 129 C 373 120 415 96 462 75" stroke="rgb(var(--blue))" strokeWidth="0.9" strokeDasharray="3 4" opacity="0.3" />
      <line x1="336" y1="23" x2="336" y2="233" stroke="rgb(var(--muted))" strokeWidth="0.6" strokeDasharray="4 4" opacity="0.25" />
      <line x1="336" y1="233" x2="336" y2="247" stroke="rgb(var(--muted))" strokeWidth="1" opacity="0.4" />
      <circle cx="140" cy="222" r="3.5" fill="rgb(var(--blue))" opacity="0.5" />
      <circle cx="224" cy="196" r="3.5" fill="rgb(var(--blue))" opacity="0.65" />
      <circle cx="336" cy="129" r="5"   fill="rgb(var(--blue))" opacity="0.85" />
      <circle cx="336" cy="129" r="9"   stroke="rgb(var(--blue))" strokeWidth="1" opacity="0.25" />
      <polyline points="446,35 462,42 446,49" stroke="rgb(var(--blue))" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

function SketchTerminal() {
  return (
    <svg viewBox="0 0 560 320" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Page chrome */}
      <rect x="40" y="20" width="480" height="280" rx="4" stroke="rgb(var(--muted))" strokeWidth="1.2" opacity="0.28" />
      {/* Nav bar */}
      <line x1="40" y1="58" x2="520" y2="58" stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.2" />
      {/* Logo text */}
      <line x1="64" y1="40" x2="130" y2="40" stroke="rgb(var(--fg))" strokeWidth="1.8" opacity="0.55" />
      {/* Nav links */}
      <line x1="170" y1="40" x2="220" y2="40" stroke="rgb(var(--muted))" strokeWidth="1.0" opacity="0.25" />
      <line x1="234" y1="40" x2="284" y2="40" stroke="rgb(var(--muted))" strokeWidth="1.0" opacity="0.25" />
      <line x1="298" y1="40" x2="348" y2="40" stroke="rgb(var(--muted))" strokeWidth="1.0" opacity="0.25" />
      {/* URL bar */}
      <rect x="176" y="28" width="208" height="22" rx="4" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.2" />
      <circle cx="192" cy="39" r="4" fill="rgb(var(--green))" opacity="0.6" />
      <line x1="204" y1="39" x2="368" y2="39" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.22" />
      {/* Big heading lines */}
      <line x1="64" y1="100" x2="400" y2="100" stroke="rgb(var(--fg))" strokeWidth="4.5" opacity="0.7" strokeLinecap="round" />
      <line x1="64" y1="124" x2="296" y2="124" stroke="rgb(var(--fg))" strokeWidth="4.5" opacity="0.7" strokeLinecap="round" />
      {/* Body text lines */}
      <line x1="64" y1="160" x2="456" y2="160" stroke="rgb(var(--muted))" strokeWidth="1.2" opacity="0.3" />
      <line x1="64" y1="178" x2="420" y2="178" stroke="rgb(var(--muted))" strokeWidth="1.2" opacity="0.3" />
      <line x1="64" y1="196" x2="440" y2="196" stroke="rgb(var(--muted))" strokeWidth="1.2" opacity="0.3" />
      <line x1="64" y1="214" x2="340" y2="214" stroke="rgb(var(--muted))" strokeWidth="1.2" opacity="0.3" />
      {/* Section divider */}
      <line x1="64" y1="240" x2="496" y2="240" stroke="rgb(var(--line))" strokeWidth="0.8" opacity="0.4" />
      {/* More body lines */}
      <line x1="64" y1="258" x2="460" y2="258" stroke="rgb(var(--muted))" strokeWidth="1.0" opacity="0.22" />
      <line x1="64" y1="274" x2="390" y2="274" stroke="rgb(var(--muted))" strokeWidth="1.0" opacity="0.22" />
      {/* Cursor */}
      <rect x="394" y="267" width="10" height="14" rx="1" fill="rgb(var(--fg))" opacity="0.55" />
    </svg>
  );
}

function SketchWave() {
  return (
    <svg viewBox="0 0 560 280" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <line x1="20" y1="140" x2="540" y2="140" stroke="rgb(var(--muted))" strokeWidth="0.8" strokeDasharray="3 5" opacity="0.4" />
      <path d="M 20 140 C 60 35 100 35 140 140 C 180 245 220 245 260 140 C 300 35 340 35 380 140 C 420 245 460 245 500 140 C 520 70 530 52 540 140" stroke="rgb(var(--amber))" strokeWidth="2" />
      <path d="M 20 140 C 50 87 90 87 120 140 C 150 193 190 193 220 140 C 250 87 290 87 320 140 C 350 193 390 193 420 140 C 450 87 490 87 520 140" stroke="rgb(var(--muted))" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
      <line x1="140" y1="35"  x2="140" y2="140" stroke="rgb(var(--amber))" strokeWidth="1.2" />
      <line x1="134" y1="35"  x2="146" y2="35"  stroke="rgb(var(--amber))" strokeWidth="1.4" />
      <line x1="134" y1="140" x2="146" y2="140" stroke="rgb(var(--amber))" strokeWidth="1.4" />
      <line x1="260" y1="140" x2="260" y2="245" stroke="rgb(var(--amber))" strokeWidth="1.2" />
      <line x1="254" y1="245" x2="266" y2="245" stroke="rgb(var(--amber))" strokeWidth="1.4" />
      <line x1="20"  y1="266" x2="260" y2="266" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.35" />
      <line x1="20"  y1="259" x2="20"  y2="273" stroke="rgb(var(--muted))" strokeWidth="1" opacity="0.35" />
      <line x1="260" y1="259" x2="260" y2="273" stroke="rgb(var(--muted))" strokeWidth="1" opacity="0.35" />
    </svg>
  );
}

function SketchGrowth() {
  return (
    <svg viewBox="0 0 560 280" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {[70, 128, 187].map(y => (
        <line key={y} x1="50" y1={y} x2="526" y2={y} stroke="rgb(var(--muted))" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.2" />
      ))}
      <line x1="50" y1="233" x2="526" y2="233" stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.3" />
      <line x1="50" y1="28"  x2="50"  y2="233" stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.3" />
      <path d="M 50 229 C 140 226 202 217 252 200 C 308 171 364 120 420 79 C 454 56 482 38 526 28"
        stroke="rgb(var(--green))" strokeWidth="2.4" opacity="0.85" />
      <circle cx="154" cy="226" r="3.5" fill="rgb(var(--green))" opacity="0.5" />
      <circle cx="252" cy="200" r="3.5" fill="rgb(var(--green))" opacity="0.65" />
      <circle cx="364" cy="120" r="4"   fill="rgb(var(--green))" opacity="0.8" />
      <circle cx="476" cy="42"  r="5"   fill="rgb(var(--green))" opacity="0.95" />
      <line x1="154" y1="226" x2="154" y2="233" stroke="rgb(var(--green))" strokeWidth="0.9" opacity="0.4" />
      <line x1="252" y1="200" x2="252" y2="233" stroke="rgb(var(--green))" strokeWidth="0.9" strokeDasharray="3 3" opacity="0.35" />
      <line x1="364" y1="120" x2="364" y2="233" stroke="rgb(var(--green))" strokeWidth="0.9" strokeDasharray="3 3" opacity="0.35" />
      <line x1="476" y1="42"  x2="476" y2="233" stroke="rgb(var(--green))" strokeWidth="0.9" strokeDasharray="3 3" opacity="0.3" />
      {[154, 252, 364, 476].map(x => (
        <line key={x} x1={x} y1="233" x2={x} y2="247" stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.35" />
      ))}
      <polyline points="510,21 526,28 510,35" stroke="rgb(var(--green))" strokeWidth="1.6" opacity="0.75" />
    </svg>
  );
}

const SLUG_SKETCHES: Record<string, () => React.ReactElement> = {
  "ai-capability-forecast": SketchAI,
  "hello-world": SketchTerminal,
  "four-years": SketchGrowth,
};

function PostSketch({ slug }: { slug: string }) {
  const Sketch = SLUG_SKETCHES[slug] ?? SketchWave;
  return <Sketch />;
}

// Mid-article sketches keyed by heading slug.
// Injected AFTER the first <p> that follows the heading, so they sit
// below the intro sentence rather than floating above empty space.
const SECTION_SKETCHES: Record<string, React.ReactElement> = {
  // four-years — "COVID and the shift…": inflection moment, digital compression
  "covid-and-the-shift-we-do-not-talk-about-enough": (
    <svg viewBox="0 0 480 96" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <line x1="24" y1="72" x2="456" y2="72" stroke="rgb(var(--muted))" strokeWidth="0.7" strokeDasharray="3 5" opacity="0.3" />
      {/* Flat pre-COVID line */}
      <path d="M 24 70 L 190 69 L 210 68" stroke="rgb(var(--muted))" strokeWidth="1.6" opacity="0.35" />
      {/* Sharp inflection upward — blue */}
      <path d="M 210 68 C 250 52 300 28 370 16 L 456 10" stroke="rgb(var(--blue))" strokeWidth="2.2" opacity="0.85" />
      {/* Inflection point */}
      <circle cx="210" cy="68" r="4.5" fill="rgb(var(--blue))" opacity="0.9" />
      <line x1="210" y1="68" x2="210" y2="80" stroke="rgb(var(--blue))" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
      {/* Labels */}
      <text x="30" y="86" fontSize="9.5" fill="rgb(var(--muted))" opacity="0.45" fontFamily="monospace">2019</text>
      <text x="196" y="86" fontSize="9.5" fill="rgb(var(--blue))" opacity="0.6" fontFamily="monospace">2020</text>
      <text x="370" y="86" fontSize="9.5" fill="rgb(var(--muted))" opacity="0.35" fontFamily="monospace">now</text>
      {/* Arrow tip */}
      <polyline points="449,5 456,10 449,15" stroke="rgb(var(--blue))" strokeWidth="1.6" opacity="0.75" />
    </svg>
  ),

  // four-years — "What actually kept me going": EQ bars with one tall spike
  "what-actually-kept-me-going": (
    <svg viewBox="0 0 480 96" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <line x1="24" y1="76" x2="456" y2="76" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.28" />
      {[52, 96, 148, 200, 252, 304, 356, 408].map((x, i) => {
        const heights = [12, 20, 15, 72, 22, 16, 11, 18];
        const h = heights[i];
        const accent = i === 3;
        return (
          <g key={x}>
            <rect x={x - 8} y={76 - h} width={16} height={h} rx="2"
              fill={accent ? "rgb(var(--green))" : "rgb(var(--muted))"}
              opacity={accent ? 0.85 : 0.28} />
            {accent && (
              <>
                <line x1={x} y1={76 - h - 4} x2={x} y2={76 - h - 10} stroke="rgb(var(--green))" strokeWidth="1.4" opacity="0.7" />
                <polyline points={`${x - 4},${76 - h - 8} ${x},${76 - h - 14} ${x + 4},${76 - h - 8}`} stroke="rgb(var(--green))" strokeWidth="1.4" opacity="0.7" />
              </>
            )}
          </g>
        );
      })}
    </svg>
  ),

  // four-years — "Where I am now": location pin on a horizon
  "where-i-am-now": (
    <svg viewBox="0 0 480 80" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Horizon */}
      <line x1="24" y1="54" x2="456" y2="54" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.3" />
      {/* Subtle ground texture */}
      {[80, 160, 240, 320, 400].map(x => (
        <line key={x} x1={x - 12} y1="58" x2={x + 12} y2="58" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.14" />
      ))}
      {/* Pin body */}
      <path d="M 240 18 C 240 18 226 30 226 40 C 226 48 232.7 54 240 54 C 247.3 54 254 48 254 40 C 254 30 240 18 240 18 Z"
        fill="rgb(var(--green))" fillOpacity="0.18" stroke="rgb(var(--green))" strokeWidth="1.6" opacity="0.9" />
      {/* Pin inner dot */}
      <circle cx="240" cy="40" r="3.5" fill="rgb(var(--green))" opacity="0.85" />
      {/* Shadow ellipse */}
      <ellipse cx="240" cy="56" rx="10" ry="2.5" fill="rgb(var(--green))" opacity="0.15" />
    </svg>
  ),

  // ai-capability-forecast — "The current plateau is misleading"
  "the-current-plateau-is-misleading": (
    <svg viewBox="0 0 480 96" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <line x1="24" y1="72" x2="456" y2="72" stroke="rgb(var(--muted))" strokeWidth="0.6" strokeDasharray="3 5" opacity="0.22" />
      {/* Visible: nearly flat */}
      <path d="M 24 60 C 120 59 240 57 456 54" stroke="rgb(var(--muted))" strokeWidth="2" opacity="0.4" />
      {/* Interior: rising steadily — dashed blue */}
      <path d="M 24 68 C 100 60 200 42 320 26 C 380 18 430 13 456 10"
        stroke="rgb(var(--blue))" strokeWidth="2" strokeDasharray="5 3" opacity="0.8" />
      {/* Labels */}
      <text x="30" y="50" fontSize="9.5" fill="rgb(var(--muted))" opacity="0.5" fontFamily="monospace">visible</text>
      <text x="30" y="86" fontSize="9.5" fill="rgb(var(--blue))" opacity="0.7" fontFamily="monospace">interior</text>
      <polyline points="449,5 456,10 449,15" stroke="rgb(var(--blue))" strokeWidth="1.6" opacity="0.75" />
    </svg>
  ),

  // ai-capability-forecast — "Three trajectories I'd bet on"
  "three-trajectories-id-bet-on": (
    <svg viewBox="0 0 480 96" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <line x1="24" y1="72" x2="456" y2="72" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.2" />
      {/* Three diverging lines from a common origin */}
      <path d="M 60 68 C 180 60 300 28 448 10" stroke="rgb(var(--blue))" strokeWidth="2.2" opacity="0.85" />
      <path d="M 60 68 C 180 65 300 52 448 40" stroke="rgb(var(--green))" strokeWidth="2.2" opacity="0.8" />
      <path d="M 60 68 C 180 68 300 67 448 64" stroke="rgb(var(--amber))" strokeWidth="2.2" opacity="0.75" />
      {/* Origin dot */}
      <circle cx="60" cy="68" r="4" fill="rgb(var(--muted))" opacity="0.4" />
      {/* Endpoint dots */}
      <circle cx="448" cy="10" r="3.5" fill="rgb(var(--blue))" opacity="0.85" />
      <circle cx="448" cy="40" r="3.5" fill="rgb(var(--green))" opacity="0.8" />
      <circle cx="448" cy="64" r="3.5" fill="rgb(var(--amber))" opacity="0.75" />
    </svg>
  ),
};

const BODY_CLASSES = `mx-auto max-w-2xl px-8 pt-10 pb-8 rise
  text-[1.0625rem] leading-[1.85] tracking-tight text-[rgb(var(--fg))]
  space-y-6
  [&_p:first-of-type]:text-[1.125rem] [&_p:first-of-type]:leading-[1.8] [&_p:first-of-type]:text-[rgb(var(--fg))]
  [&_a]:text-blue-500 [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-blue-500/40 [&_a]:transition-colors hover:[&_a]:text-blue-400 hover:[&_a]:decoration-blue-400
  [&_strong]:font-medium [&_strong]:text-[rgb(var(--fg))]
  [&_em]:not-italic [&_em]:text-[rgb(var(--fg))] [&_em]:font-medium
  [&_mark]:bg-transparent [&_mark]:text-[rgb(var(--fg))] [&_mark]:font-medium [&_mark]:border-b [&_mark]:border-[rgb(var(--fg))/0.25] [&_mark]:pb-px
  [&_code]:font-mono [&_code]:text-[0.875em] [&_code]:bg-[rgb(var(--line))/0.6] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
  [&_pre]:bg-[rgb(var(--line))/0.4] [&_pre]:rounded-lg [&_pre]:p-5 [&_pre]:overflow-x-auto [&_pre]:text-[0.875em]
  [&_blockquote]:border-l-[3px] [&_blockquote]:border-[rgb(var(--fg))/0.15] [&_blockquote]:pl-6 [&_blockquote]:text-[rgb(var(--muted))] [&_blockquote]:italic [&_blockquote]:text-[1.0625rem]
  [&_ul]:list-none [&_ul]:space-y-2
  [&_ul_li]:relative [&_ul_li]:pl-4 [&_ul_li]:before:absolute [&_ul_li]:before:left-0 [&_ul_li]:before:top-[0.75em] [&_ul_li]:before:h-px [&_ul_li]:before:w-2.5 [&_ul_li]:before:bg-[rgb(var(--muted))] [&_ul_li]:before:opacity-30 [&_ul_li]:before:content-['']
  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2
  [&_h2]:text-[1.375rem] [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:mt-16 [&_h2]:mb-4 [&_h2]:scroll-mt-24 [&_h2]:text-[rgb(var(--fg))]
  [&_h3]:text-[1.0625rem] [&_h3]:font-medium [&_h3]:tracking-tight [&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:scroll-mt-24
  [&_hr]:border-none [&_hr]:h-px [&_hr]:bg-[rgb(var(--line))] [&_hr]:my-14
  [&_table]:w-full [&_table]:text-[0.9375rem] [&_th]:text-left [&_th]:pb-2 [&_th]:border-b [&_th]:border-[rgb(var(--line))] [&_th]:font-medium [&_td]:py-2 [&_td]:border-b [&_td]:border-[rgb(var(--line))/0.5]`;

// Split rendered HTML at h2/h3 boundaries and inject section sketches
// after the first <p> inside each section so the sketch sits below the
// opening sentence rather than floating above empty space.
function ArticleBody({ html }: { html: string }) {
  const parts = html.split(/(?=<h[23] id=")/);

  const rendered: React.ReactNode[] = [];

  parts.forEach((chunk, i) => {
    const idMatch = chunk.match(/^<h[23] id="([^"]+)"/);
    const headingId = idMatch?.[1];
    const sketch = headingId ? SECTION_SKETCHES[headingId] : null;

    if (sketch) {
      // Find the end of the first </p> in this chunk and split there
      const firstPEnd = chunk.indexOf("</p>");
      if (firstPEnd !== -1) {
        const before = chunk.slice(0, firstPEnd + 4);
        const after = chunk.slice(firstPEnd + 4);
        rendered.push(
          <div key={`${i}a`} className={BODY_CLASSES} style={{ ["--rise-delay" as any]: "0ms" }} dangerouslySetInnerHTML={{ __html: before }} />,
          <div key={`${i}s`} className="mx-auto max-w-2xl px-8 py-6">{sketch}</div>,
          after.trim() && <div key={`${i}b`} className={BODY_CLASSES} style={{ ["--rise-delay" as any]: "0ms" }} dangerouslySetInnerHTML={{ __html: after }} />,
        );
        return;
      }
    }

    rendered.push(
      <div key={i} className={BODY_CLASSES} style={{ ["--rise-delay" as any]: "0ms" }} dangerouslySetInnerHTML={{ __html: chunk }} />
    );
  });

  return <>{rendered}</>;
}

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  const title = `${post.title} — Inertia`;
  const description = post.summary || post.subtitle || `Published ${formatDate(post.date)}.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary", title, description },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.content);
  const headings = extractHeadings(post.content);
  const stats = readingStats(post.content);

  return (
    <main className="page-container relative mx-auto w-full max-w-5xl">
      <ReadingProgress />

      {/* Back nav */}
      <div className="px-8 py-5 rise">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
          Perspectives
        </Link>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Page grid: TOC | Article */}
      <div className="grid grid-cols-1 lg:grid-cols-[14rem_1fr]">

        {/* TOC column */}
        <div className="lg:border-r lg:border-[rgb(var(--line))] self-stretch">
          <TOC headings={headings} />
        </div>

        {/* Article column */}
        <article>
          {/* Hero header */}
          <header className="px-8 pt-12 pb-8 border-b border-[rgb(var(--line))] rise" style={{ ["--rise-delay" as any]: "40ms" }}>
            <div className="flex items-center gap-2 mb-7">
              <div className="w-5 h-5 rounded-full bg-[rgb(var(--line))] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-[rgb(var(--muted))]" aria-hidden="true">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <span className="text-[12px] tracking-tight text-[rgb(var(--muted))]">Jacob Collado</span>
              <span className="text-[rgb(var(--line))] text-[10px]">·</span>
              <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-60">Founder, Inertia</span>
            </div>

            <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-medium tracking-[-0.04em] leading-[1.05] text-[rgb(var(--fg))] max-w-2xl">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="mt-5 text-[1.0625rem] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-xl">
                {post.subtitle}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 mt-7 pt-5 border-t border-[rgb(var(--line))]">
              <span className="flex items-center gap-1.5 text-[12px] tracking-tight text-[rgb(var(--muted))]">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 opacity-50" aria-hidden="true">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 5v3.5l2 1" />
                </svg>
                {stats.minutes} min read
              </span>
              <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] tabular-nums opacity-60">
                {formatDate(post.date)}
              </span>
              <CopyURL />
            </div>
          </header>

          {/* Sketch */}
          <div className="px-8 pt-10 pb-6 rise" style={{ ["--rise-delay" as any]: "80ms" }}>
            <PostSketch slug={post.slug} />
          </div>

          {/* Body */}
          <ArticleBody html={html} />

          <Highlighter slug={slug} />

          <div className="px-8 pt-6 pb-16 flex items-center justify-end border-t border-[rgb(var(--line))]">
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-[12px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
              Back to top
            </a>
          </div>
        </article>

      </div>
    </main>
  );
}
