"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Check, Copy, ChevronDown, Terminal } from "lucide-react";
import { Button as BaseUiButton } from "@/components/ui/button-base";
import { Button as RadixButton } from "@/components/ui/button-radix";

export type PrimitiveLib = "base-ui" | "radix";

export function usePrimitiveLibToggle(initial: PrimitiveLib = "base-ui") {
  const [lib, setLib] = useState<PrimitiveLib>(initial);
  const Button = lib === "radix" ? RadixButton : BaseUiButton;
  return { lib, setLib, Button };
}

export function PrimitiveLibToggle({ lib, setLib }: { lib: PrimitiveLib; setLib: (lib: PrimitiveLib) => void }) {
  return (
    <div className="inline-flex items-center gap-1 self-start rounded-full border border-[rgb(var(--line))] p-1 mb-4">
      {(["base-ui", "radix"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLib(option)}
          className="rounded-full px-3 py-1 text-[12px] tracking-tight transition-colors outline-none border-none appearance-none"
          style={{
            background: lib === option ? "rgb(var(--fg) / 0.08)" : "transparent",
            color: lib === option ? "rgb(var(--fg))" : "rgb(var(--muted))",
          }}
        >
          {option === "base-ui" ? "Base UI" : "Radix UI"}
        </button>
      ))}
    </div>
  );
}

const TOKEN_PATTERN =
  /(\/\/.*$|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(<\/?[A-Za-z][\w.-]*|\/?>|>)|(#[0-9a-fA-F]{3,8}\b)|(\.[a-zA-Z-][\w-]*(?=\s*\{)|[a-zA-Z-]+(?=\s*:))|(\b-?\d+(?:\.\d+)?(?:px|rem|em|vw|vh|%|s|ms)?\b)/gm;

function highlight(code: string) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  TOKEN_PATTERN.lastIndex = 0;
  while ((match = TOKEN_PATTERN.exec(code))) {
    if (match.index > lastIndex) nodes.push(code.slice(lastIndex, match.index));
    const [full, comment, string, tag, hex, attr, num] = match;
    if (comment) nodes.push(<span key={key++} style={{ color: "rgb(var(--muted))", opacity: 0.5 }}>{comment}</span>);
    else if (string) nodes.push(<span key={key++} style={{ color: "#9ECE6A" }}>{string}</span>);
    else if (tag) nodes.push(<span key={key++} style={{ color: "#E06C75" }}>{tag}</span>);
    else if (hex) nodes.push(<span key={key++} style={{ color: "#56B6C2" }}>{hex}</span>);
    else if (attr) nodes.push(<span key={key++} style={{ color: "#D19A66" }}>{attr}</span>);
    else if (num) nodes.push(<span key={key++} style={{ color: "#C678DD" }}>{num}</span>);
    else nodes.push(full);
    lastIndex = match.index + full.length;
  }
  if (lastIndex < code.length) nodes.push(code.slice(lastIndex));
  return nodes;
}

const PEEK_LINES = 3;

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const lines = code.split("\n");
  const visibleLines = expanded ? lines : lines.slice(0, PEEK_LINES);

  return (
    <div className="relative mt-8 -mx-8 -mb-8 sm:-mx-10 sm:-mb-10 w-[calc(100%+4rem)] sm:w-[calc(100%+5rem)] rounded-b-2xl border-t border-[rgb(var(--line))] overflow-hidden" style={{ background: "rgb(var(--fg) / 0.06)" }}>
      {expanded && (
        <button
          type="button"
          aria-label="Copy code"
          className="absolute top-3 right-3 inline-flex items-center justify-center size-7 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors outline-none border-none bg-transparent shadow-none appearance-none z-10"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      )}
      <div className="relative">
        <pre
          data-lenis-prevent={expanded || undefined}
          className={`w-full overflow-x-auto px-8 py-6 sm:px-10 ${expanded ? "max-h-72 overflow-y-auto no-scrollbar" : ""}`}
        >
          <code className="block w-full font-mono text-[13.5px] leading-relaxed tracking-tight text-[rgb(var(--fg))]" style={{ opacity: 0.85 }}>
            {visibleLines.map((line, i) => (
              <div key={i} className="grid grid-cols-[2ch_1fr] gap-4 w-full">
                <span className="select-none text-right text-[rgb(var(--muted))]" style={{ opacity: 0.4 }}>{i + 1}</span>
                <span className="whitespace-pre min-w-0">{highlight(line)}</span>
              </div>
            ))}
          </code>
        </pre>
        {!expanded && (
          <div
            className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center pb-5"
            style={{ background: "linear-gradient(to bottom, transparent 0%, rgb(var(--bg) / 0.9) 80%)" }}
          >
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] tracking-tight text-[rgb(var(--fg))] outline-none border border-[rgb(var(--line))] hover:border-[rgb(var(--fg)/0.3)] transition-colors"
              style={{ background: "rgb(var(--surface))" }}
            >
              View code
              <ChevronDown className="size-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const PACKAGE_MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const;
type PackageManager = (typeof PACKAGE_MANAGERS)[number];

function runnerCommand(pm: PackageManager, args: string) {
  switch (pm) {
    case "pnpm":
      return `pnpm dlx ${args}`;
    case "npm":
      return `npx ${args}`;
    case "yarn":
      return `yarn dlx ${args}`;
    case "bun":
      return `bunx --bun ${args}`;
  }
}

export function InstallCommand({ args }: { args: string }) {
  const [copied, setCopied] = useState(false);
  const [pm, setPm] = useState<PackageManager>("pnpm");
  const command = runnerCommand(pm, args);

  return (
    <div className="rounded-lg border border-[rgb(var(--line))] overflow-hidden" style={{ background: "rgb(var(--fg) / 0.03)" }}>
      <div className="flex items-center gap-4 px-4 pt-2.5 border-b border-[rgb(var(--line))]">
        {PACKAGE_MANAGERS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPm(option)}
            className="relative pb-2.5 text-[13px] tracking-tight transition-colors outline-none border-none bg-transparent appearance-none"
            style={{ color: pm === option ? "rgb(var(--fg))" : "rgb(var(--muted))", opacity: pm === option ? 1 : 0.6 }}
          >
            {option}
            {pm === option && (
              <span className="absolute inset-x-0 -bottom-px h-px" style={{ background: "rgb(var(--fg))" }} />
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Terminal className="size-4 shrink-0 text-[rgb(var(--muted))]" style={{ opacity: 0.6 }} />
          <code className="font-mono text-[15px] tracking-tight text-[rgb(var(--fg))] overflow-x-auto" style={{ opacity: 0.8 }}>
            {command}
          </code>
        </div>
        <button
          type="button"
          aria-label="Copy install command"
          className="inline-flex shrink-0 items-center justify-center size-6 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors outline-none border-none bg-transparent shadow-none appearance-none"
          onClick={async () => {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}

export function FileCodeBlock({ filename, code }: { filename?: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const lines = code.split("\n");
  const visibleLines = expanded ? lines : lines.slice(0, PEEK_LINES);

  return (
    <div className="relative rounded-xl border border-[rgb(var(--line))] overflow-hidden" style={{ background: "rgb(var(--fg) / 0.03)" }}>
      {filename && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[rgb(var(--line))]">
          <span className="font-mono text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.7 }}>{filename}</span>
          <button
            type="button"
            aria-label="Copy code"
            className="inline-flex items-center justify-center size-6 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors outline-none border-none bg-transparent shadow-none appearance-none"
            onClick={async () => {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      )}
      <div className="relative">
        <pre
          data-lenis-prevent={expanded || undefined}
          className={`w-full overflow-x-auto px-5 py-4 ${expanded ? "max-h-72 overflow-y-auto no-scrollbar" : ""}`}
        >
          <code className="block w-full font-mono text-[14px] leading-relaxed tracking-tight text-[rgb(var(--fg))]" style={{ opacity: 0.85 }}>
            {visibleLines.map((line, i) => (
              <div key={i} className="grid grid-cols-[2ch_1fr] gap-4 w-full">
                <span className="select-none text-right text-[rgb(var(--muted))]" style={{ opacity: 0.4 }}>{i + 1}</span>
                <span className="whitespace-pre min-w-0">{highlight(line)}</span>
              </div>
            ))}
          </code>
        </pre>
        {!filename && !expanded && (
          <button
            type="button"
            aria-label="Copy code"
            className="absolute top-2.5 right-2.5 inline-flex items-center justify-center size-6 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors outline-none border-none bg-transparent shadow-none appearance-none"
            onClick={async () => {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </button>
        )}
        {lines.length > PEEK_LINES && (
          <div
            className={expanded ? "flex justify-center px-5 py-2 border-t border-[rgb(var(--line))]" : "absolute inset-x-0 bottom-0 top-0 flex items-end justify-center pb-4"}
            style={expanded ? undefined : { background: "linear-gradient(to bottom, transparent 0%, rgb(var(--bg) / 0.92) 80%)" }}
          >
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] tracking-tight text-[rgb(var(--fg))] outline-none border border-[rgb(var(--line))] hover:border-[rgb(var(--fg)/0.3)] transition-colors"
              style={{ background: "rgb(var(--surface))" }}
            >
              {expanded ? "Collapse" : "Expand"}
              <ChevronDown className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export type Example = { title: string; desc?: string; code: string; demo: React.ReactNode };

export function ExamplesSection({ examples }: { examples: Example[] }) {
  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full mt-12">
      <p className="text-left text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">Examples</p>
      <div className="flex flex-col gap-10">
        {examples.map((ex, i) => (
          <div key={i} className="flex flex-col gap-3 text-left">
            <div className="flex flex-col gap-1">
              <p className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]" style={{ opacity: 0.9 }}>{ex.title}</p>
              {ex.desc && (
                <p className="text-[13.5px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.6 }}>{ex.desc}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[rgb(var(--line))] p-6" style={{ background: "rgb(var(--bg) / 0.4)" }}>
              {ex.demo}
            </div>
            <FileCodeBlock code={ex.code} />
          </div>
        ))}
      </div>
    </div>
  );
}

export type ManualStep = { title: string; filename?: string; code: string };

export function InfoSection({
  install,
  manualSteps,
  usage,
  deps,
}: {
  install: string;
  manualSteps: ManualStep[];
  usage: string[];
  deps?: { name: string; href: string }[];
}) {
  const installArgs = install.replace(/^npx\s+/, "");
  const [tab, setTab] = useState<"cli" | "manual">("cli");

  return (
    <div className="flex flex-col gap-10 max-w-2xl mx-auto w-full mt-12">
      <div className="flex flex-col gap-5 text-left">
        <div className="flex items-center justify-between">
          <p className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">Installation</p>
          <div className="inline-flex items-center gap-1 rounded-full border border-[rgb(var(--line))] p-1">
            {(["cli", "manual"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTab(option)}
                className="rounded-full px-3 py-1 text-[13px] tracking-tight transition-colors outline-none border-none appearance-none"
                style={{
                  background: tab === option ? "rgb(var(--fg) / 0.08)" : "transparent",
                  color: tab === option ? "rgb(var(--fg))" : "rgb(var(--muted))",
                }}
              >
                {option === "cli" ? "Command" : "Manual"}
              </button>
            ))}
          </div>
        </div>
        {tab === "cli" ? (
          <InstallCommand args={installArgs} />
        ) : (
          <div className="flex flex-col">
            {manualSteps.map((step, i) => (
              <div key={i} className="relative flex gap-4 pb-7 last:pb-0">
                {i < manualSteps.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-px" style={{ background: "rgb(var(--line))" }} />
                )}
                <span
                  className="relative shrink-0 flex items-center justify-center size-6 rounded-full text-[12px] font-medium text-[rgb(var(--fg))]"
                  style={{ background: "rgb(var(--fg) / 0.08)" }}
                >
                  {i + 1}
                </span>
                <div className="flex flex-col gap-3 min-w-0 flex-1 pt-0.5">
                  <p className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]" style={{ opacity: 0.9 }}>
                    {step.title}
                  </p>
                  <FileCodeBlock filename={step.filename} code={step.code} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {deps && deps.length > 0 && (
        <div className="flex flex-col gap-3 text-left">
          <p className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">Dependencies</p>
          <div className="flex flex-wrap gap-3">
            {deps.map((dep) => (
              <a
                key={dep.name}
                href={dep.href}
                target="_blank"
                rel="noreferrer"
                className="text-[15px] tracking-tight text-[rgb(var(--muted))] underline underline-offset-4 transition-colors hover:text-[rgb(var(--fg))]"
                style={{ opacity: 0.65 }}
              >
                {dep.name}
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-3 text-left">
        <p className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">Usage</p>
        <div className="flex flex-col gap-3">
          {usage.map((para, i) => (
            <p key={i} className="text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.65 }}>
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SectionHeading({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="flex flex-col gap-2 mb-10 max-w-2xl mx-auto w-full text-left">
      <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">{title}</p>
      {desc && <p className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-xs" style={{ opacity: 0.6 }}>{desc}</p>}
    </div>
  );
}

export function Swatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="w-full rounded-xl border border-[rgb(var(--line))]" style={{ aspectRatio: "2/1", background: `rgb(var(${varName}))` }} />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[13px] font-medium tracking-tight text-[rgb(var(--fg))]">{name}</span>
        <span className="text-[12px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>{varName}</span>
      </div>
    </div>
  );
}

export const TOC_ITEMS = [
  { href: "/components/buttons", label: "Buttons" },
  { href: "/components/pills", label: "Pills" },
  { href: "/components/cards", label: "Cards" },
  { href: "/components/charts", label: "Charts" },
];

export function Hero({ title, desc }: { title: string; desc: string }) {
  const pathname = usePathname();
  const currentIndex = TOC_ITEMS.findIndex((item) => item.href === pathname);
  const prev = currentIndex > 0 ? TOC_ITEMS[currentIndex - 1] : null;
  const next = currentIndex < TOC_ITEMS.length - 1 ? TOC_ITEMS[currentIndex + 1] : null;

  return (
    <section className="flex flex-col items-start justify-center gap-4 px-1 text-left max-w-2xl mx-auto w-full pt-10 pb-10">
      <div className="flex items-center gap-3 w-full">
        <h1 className="text-[clamp(1.8rem,4vw,2.6rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] flex-1">
          {title}
        </h1>
        <div className="flex items-center gap-1 shrink-0">
          {prev ? (
            <Link
              href={prev.href}
              aria-label={`Previous: ${prev.label}`}
              className="inline-flex items-center justify-center size-8 rounded-full border border-[rgb(var(--line))] transition-colors hover:border-[rgb(var(--fg)/0.3)]"
              style={{ color: "rgb(var(--muted))" }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                <polyline points="10 4 6 8 10 12" />
              </svg>
            </Link>
          ) : (
            <span className="inline-flex items-center justify-center size-8 rounded-full border border-[rgb(var(--line))]" style={{ color: "rgb(var(--muted))", opacity: 0.25 }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                <polyline points="10 4 6 8 10 12" />
              </svg>
            </span>
          )}
          {next ? (
            <Link
              href={next.href}
              aria-label={`Next: ${next.label}`}
              className="inline-flex items-center justify-center size-8 rounded-full border border-[rgb(var(--line))] transition-colors hover:border-[rgb(var(--fg)/0.3)]"
              style={{ color: "rgb(var(--muted))" }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                <polyline points="6 4 10 8 6 12" />
              </svg>
            </Link>
          ) : (
            <span className="inline-flex items-center justify-center size-8 rounded-full border border-[rgb(var(--line))]" style={{ color: "rgb(var(--muted))", opacity: 0.25 }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                <polyline points="6 4 10 8 6 12" />
              </svg>
            </span>
          )}
        </div>
      </div>
      <p className="text-[clamp(1rem,1.8vw,1.1rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-sm sm:max-w-md">
        {desc}
      </p>
    </section>
  );
}

export function TableOfContents() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Table of contents"
      className="hidden lg:flex flex-col gap-3 fixed top-[120px] z-10"
      style={{ left: "max(0.75rem, calc((100vw - 96rem) / 2 + 0.75rem))" }}
    >
      <Link href="/components" className="text-[15px] tracking-tight text-[rgb(var(--fg))] transition-opacity hover:opacity-70" style={{ opacity: 0.9 }}>
        Components
      </Link>
      {TOC_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="text-[15px] tracking-tight transition-colors"
            style={{
              color: active ? "rgb(var(--fg))" : "rgb(var(--muted))",
              opacity: active ? 1 : 0.6,
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
