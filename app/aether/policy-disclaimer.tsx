import Link from "next/link";

export function PolicyDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={`text-[12px] sm:text-[13px] tracking-tight text-[rgb(var(--muted))] ${className ?? ""}`}
      style={{ opacity: 0.75 }}
    >
      <Link href="/policies/terms-of-service" className="text-blue-500 hover:text-blue-400 transition-colors">
        Terms
      </Link>
      {" and "}
      <Link href="/policies/privacy-policy" className="text-blue-500 hover:text-blue-400 transition-colors">
        Privacy policy
      </Link>
      {" apply."}
    </p>
  );
}
