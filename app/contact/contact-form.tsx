"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";

type Status = "idle" | "submitting" | "sent" | "error";

interface Category {
  id: string;
  label: string;
  heading: string;
  placeholder: string;
  fields: ("company" | "url" | "budget")[];
}

const CATEGORIES: Category[] = [
  {
    id: "shopify",
    label: "Shopify store",
    heading: "Tell us about your store",
    placeholder: "What are you selling, what's the goal, and where are you now?",
    fields: ["url", "budget"],
  },
  {
    id: "aether",
    label: "Aether support",
    heading: "What do you need help with?",
    placeholder: "Describe the issue or what you're trying to do.",
    fields: ["url"],
  },
  {
    id: "enterprise",
    label: "Enterprise",
    heading: "Let's talk about your project",
    placeholder: "Give us an overview — team size, scope, and what you're trying to achieve.",
    fields: ["company", "url", "budget"],
  },
  {
    id: "general",
    label: "General",
    heading: "What's on your mind?",
    placeholder: "Anything at all.",
    fields: [],
  },
];

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const lineInput = "w-full bg-transparent border-b py-3 text-[15px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none transition-colors duration-200 border-[rgb(var(--line))]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.45 }}>{label}</span>
      {children}
    </div>
  );
}

export function ContactForm() {
  const searchParams = useSearchParams();
  const requestedType = searchParams.get("type");
  const initialCategory = CATEGORIES.some((c) => c.id === requestedType) ? requestedType! : "shopify";
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [url, setUrl] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const category = CATEGORIES.find((c) => c.id === categoryId)!;
  const has = (f: "company" | "url" | "budget") => category.fields.includes(f);
  const canSubmit = name.trim() && email.trim() && message.trim();
  const isSubmitting = status === "submitting";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;
    setStatus("submitting");
    setError("");
    try {
      const parts = [
        `Type: ${category.label}`,
        company && `Company: ${company}`,
        url && `URL: ${url}`,
        budget && `Budget: ${budget}`,
        `\n${message}`,
      ].filter(Boolean).join("\n");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message: parts }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong");
      }
      setStatus("sent");
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ["#0e0e0e", "#6b6b6b", "#b4b4b4", "#e0e0e0"] });
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col gap-4" style={{ animation: "rise-in 400ms cubic-bezier(0.22,1,0.36,1) both" }}>
        <p className="text-[1.8rem] font-normal tracking-tight text-[rgb(var(--fg))] leading-tight">
          {name ? `Thanks, ${name}.` : "Message received."}
        </p>
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.6 }}>
          {email ? `We'll follow up at ${email} within one business day.` : "We'll be in touch shortly."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-8" noValidate>

      {/* heading */}
      <div>
        <h1 className="text-[2rem] font-normal tracking-tight text-[rgb(var(--fg))] leading-tight mb-1">
          {category.heading}
        </h1>
        <p className="text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.45 }}>
          We'll get back to you within one business day.
        </p>
      </div>

      {/* category pill tabs */}
      <div className="inline-flex items-center rounded-full p-1 gap-0.5 self-start flex-wrap" style={{ background: "rgb(var(--fg) / 0.06)" }}>
        {CATEGORIES.map((c) => {
          const active = c.id === categoryId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(c.id)}
              className="rounded-full px-3.5 py-1.5 text-[12px] tracking-tight transition-all duration-200 [-webkit-tap-highlight-color:transparent]"
              style={{
                background: active ? "var(--btn-bg)" : "transparent",
                color: active ? "var(--btn-fg)" : "rgb(var(--muted))",
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* fields */}
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-5">
          <Field label="Name">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className={lineInput}
              onFocus={(e) => { e.target.style.borderColor = "rgb(var(--fg))"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgb(var(--line))"; }}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={lineInput}
              onFocus={(e) => { e.target.style.borderColor = "rgb(var(--fg))"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgb(var(--line))"; }}
            />
          </Field>
        </div>

        {has("company") && (
          <Field label="Company">
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Your company"
              className={lineInput}
              onFocus={(e) => { e.target.style.borderColor = "rgb(var(--fg))"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgb(var(--line))"; }}
            />
          </Field>
        )}

        {has("url") && (
          <Field label="Store or site URL">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              className={lineInput}
              onFocus={(e) => { e.target.style.borderColor = "rgb(var(--fg))"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgb(var(--line))"; }}
            />
          </Field>
        )}

        {has("budget") && (
          <Field label="Rough budget">
            <div className="flex flex-wrap gap-2 pt-1">
              {["Under $2k", "$2k – $5k", "$5k – $15k", "$15k+", "Not decided"].map((opt) => {
                const active = budget === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setBudget(active ? "" : opt)}
                    className="rounded-full px-3.5 py-1.5 text-[12px] tracking-tight transition-all duration-150 [-webkit-tap-highlight-color:transparent]"
                    style={{
                      border: `1.5px solid ${active ? "rgb(var(--fg))" : "rgb(var(--line))"}`,
                      background: active ? "rgb(var(--fg))" : "transparent",
                      color: active ? "rgb(var(--bg))" : "rgb(var(--muted))",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </Field>
        )}

        <Field label="Message">
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={category.placeholder}
            className={`${lineInput} resize-none`}
            onFocus={(e) => { e.target.style.borderColor = "rgb(var(--fg))"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgb(var(--line))"; }}
          />
        </Field>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[13px] font-medium tracking-tight transition-opacity hover:opacity-80 disabled:opacity-25 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
          style={{ background: "var(--btn-bg)", color: "var(--btn-fg)" }}
        >
          {isSubmitting && <Spinner />}
          Send message
        </button>
        {status === "error" && (
          <span className="text-[13px] tracking-tight text-red-500">{error}</span>
        )}
      </div>

    </form>
  );
}
