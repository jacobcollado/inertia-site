import Link from "next/link";

export function PolicyDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={`text-[12px] sm:text-[13px] tracking-tight text-[rgb(var(--muted))] ${className ?? ""}`}
      style={{ opacity: 0.75 }}
    >
      {/* The guarantee leads: a cold visitor deciding whether to pay needs
          to know they're covered if it doesn't work. Change of mind still
          isn't covered, since the theme is delivered the moment it's paid. */}
      {"If we can't get Aether working on your store within 14 days, you get a full refund. "}
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
