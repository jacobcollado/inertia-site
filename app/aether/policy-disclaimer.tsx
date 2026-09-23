import Link from "next/link";

export function PolicyDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={`text-[12px] sm:text-[13px] tracking-tight text-[rgb(var(--muted))] ${className ?? ""}`}
      style={{ opacity: 0.75 }}
    >
      {/* Aether is delivered the moment it's paid for, so the no-refund
          terms are stated at the point of purchase, not only in the policy. */}
      {"Delivered instantly, so purchases aren't refundable as standard. "}
      <Link href="/policies/terms-of-service" className="text-blue-500 hover:text-blue-400 transition-colors">
        Terms
      </Link>
      {", "}
      <Link href="/policies/refund-policy" className="text-blue-500 hover:text-blue-400 transition-colors">
        Refund policy
      </Link>
      {" and "}
      <Link href="/policies/privacy-policy" className="text-blue-500 hover:text-blue-400 transition-colors">
        Privacy policy
      </Link>
      {" apply."}
    </p>
  );
}
