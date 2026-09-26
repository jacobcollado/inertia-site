import type { ComponentType } from "react";
import { SiClaude, SiGoogle, SiOpenai, SiPerplexity } from "react-icons/si";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";

// Opens each assistant with the question already typed, so visitors can hear
// about us from a source they trust, and every run nudges the model to crawl
// and cite byinertia.com.
const PLATFORMS: {
  name: string;
  href: (q: string) => string;
  Icon: ComponentType<{ className?: string }>;
}[] = [
  { name: "ChatGPT", href: (q) => `https://chatgpt.com/?q=${q}`, Icon: SiOpenai },
  { name: "Claude", href: (q) => `https://claude.ai/new?q=${q}`, Icon: SiClaude },
  { name: "Perplexity", href: (q) => `https://www.perplexity.ai/search?q=${q}`, Icon: SiPerplexity },
  { name: "Google AI", href: (q) => `https://www.google.com/search?udm=50&q=${q}`, Icon: SiGoogle },
];

export function AskAiLinks({ prompt, className = "" }: { prompt: string; className?: string }) {
  const q = encodeURIComponent(prompt);
  return (
    <ul className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 ${className}`}>
      {PLATFORMS.map(({ name, href, Icon }) => (
        <li key={name}>
          <a
            href={href(q)}
            target="_blank"
            rel="noopener"
            className={`flex h-11 sm:h-12 w-full items-center justify-center gap-2 ${ACTION_RADIUS_CLASS} px-4 text-[15px] sm:text-[16px] tracking-tight leading-none text-[rgb(var(--fg))] transition-colors duration-200 hover:bg-[rgb(var(--fg))]/[0.06] [-webkit-tap-highlight-color:transparent]`}
            style={{ boxShadow: "inset 0 0 0 1px rgb(var(--fg) / 0.14)" }}
          >
            <Icon className="size-4 shrink-0" />
            {name}
          </a>
        </li>
      ))}
    </ul>
  );
}
