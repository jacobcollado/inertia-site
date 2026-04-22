"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "sent" | "error";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

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
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="name"
          label="Your name"
          type="text"
          value={name}
          onChange={setName}
          autoComplete="name"
          required
        />
        <Field
          id="email"
          label="Your email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
      </div>

      <Field
        id="message"
        label="What's on your mind"
        value={message}
        onChange={setMessage}
        textarea
        required
      />

      <div className="flex items-center justify-between gap-4 pt-3">
        <span
          className="text-sm tracking-tight transition-opacity duration-300"
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
          className="send-btn group inline-flex items-center gap-2 rounded-full border border-[rgb(var(--fg))] bg-[rgb(var(--fg))] text-[rgb(var(--bg))] pl-5 pr-4 py-2.5 text-sm tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--fg))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] disabled:opacity-50 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
        >
          <span className="send-btn__label">
            {status === "submitting" ? "sending" : status === "sent" ? "sent" : "send note"}
          </span>
          <span className="send-btn__arrow inline-flex">
            {status === "sent" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
  required = false,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  required?: boolean;
  autoComplete?: string;
}) {
  const filled = value.length > 0;
  const base =
    "peer w-full bg-transparent border border-[rgb(var(--line))] rounded-xl px-4 pt-5 pb-2 text-base tracking-tight text-[rgb(var(--fg))] placeholder-transparent focus:outline-none focus:border-[rgb(var(--fg))] transition-colors duration-300";
  return (
    <label htmlFor={id} className="relative block">
      {textarea ? (
        <textarea
          id={id}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={label}
          rows={5}
          className={`${base} resize-none min-h-[140px]`}
        />
      ) : (
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={label}
          autoComplete={autoComplete}
          className={base}
        />
      )}
      <span
        className="pointer-events-none absolute left-4 text-[rgb(var(--muted))] tracking-tight transition-all duration-300 ease-fluid"
        style={{
          top: filled ? "0.55rem" : "1rem",
          fontSize: filled ? "0.72rem" : "1rem",
          opacity: filled ? 0.8 : 0.75,
        }}
      >
        {label}
      </span>
      <style jsx>{`
        label :global(.peer:focus) ~ span {
          top: 0.55rem;
          font-size: 0.72rem;
          color: rgb(var(--fg));
          opacity: 1;
        }
      `}</style>
    </label>
  );
}
