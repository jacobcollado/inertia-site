"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "sent" | "error";

const inputClass =
  "w-full bg-transparent border-0 border-b border-[rgb(var(--line))] py-3 text-[15px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-50 focus:outline-none focus:border-[rgb(var(--fg))] transition-colors duration-200";

export function ContactForm() {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus]   = useState<Status>("idle");
  const [error, setError]     = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong");
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-0" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="your name"
          className={inputClass}
          autoComplete="name"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your email"
          className={inputClass}
          autoComplete="email"
        />
      </div>
      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="what's on your mind"
        rows={5}
        className={`${inputClass} resize-none mt-0`}
      />

      <div className="flex items-center justify-between gap-4 pt-6">
        <span
          className="text-[13px] tracking-tight transition-opacity duration-300"
          style={{
            opacity: status === "sent" || status === "error" ? 1 : 0,
            color: status === "error" ? "rgb(220 38 38)" : "rgb(var(--muted))",
          }}
          aria-live="polite"
        >
          {status === "sent" && "thanks — I'll get back to you soon."}
          {status === "error" && (error || "something went wrong.")}
        </span>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-[rgb(var(--fg))] bg-[rgb(var(--fg))] text-[rgb(var(--bg))] pl-5 pr-4 py-2 text-[13px] tracking-tight hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--fg))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200 [-webkit-tap-highlight-color:transparent]"
        >
          {status === "submitting" ? "sending" : status === "sent" ? "sent" : "send note"}
          {status === "sent" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
