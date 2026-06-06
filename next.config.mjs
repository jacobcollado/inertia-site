import path from "node:path";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://cdn.fontshare.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://api.stripe.com https://*.myshopify.com https://us.posthog.com",
      "script-src-elem 'self' 'unsafe-inline' https://js.stripe.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/((?!ingest).*)", headers: securityHeaders }];
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  async redirects() {
    return [
      { source: "/legal", destination: "/policies/terms-of-service", permanent: true },
      { source: "/privacy", destination: "/policies/privacy-policy", permanent: true },
    ];
  },
  skipTrailingSlashRedirect: true,
  turbopack: {
    root: path.resolve("."),
  },
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js", "@supabase/ssr"],
  },
};
export default nextConfig;
