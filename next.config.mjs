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
      "connect-src 'self' https://connect.facebook.net https://www.facebook.com https://*.supabase.co wss://*.supabase.co https://api.resend.com https://api.stripe.com https://*.myshopify.com https://us.posthog.com https://app.cal.com https://cal.com",
      "script-src-elem 'self' 'unsafe-inline' https://connect.facebook.net https://js.stripe.com https://app.cal.com",
      // www.facebook.com: the Meta Pixel injects a hidden iframe there to sync
      // cookies across the facebook.com origin. Without it the pixel still
      // reports, but every page logs a CSP violation and match quality drops.
      "frame-src https://js.stripe.com https://hooks.stripe.com https://app.cal.com https://cal.com https://www.facebook.com",
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
      // A second address for the Aether page, used by the Ask AI prompts.
      // Claude's and Perplexity's fetchers refuse /aether itself without ever
      // requesting it (a verdict held on their side), while every other page
      // fetches fine. Same HTML, and its canonical still points at /aether, so
      // search engines treat this as the same page.
      { source: "/aether/overview", destination: "/aether" },
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
      // The client support section moved from /messages to /support. Kept so
      // links already sent to clients, and anything bookmarked, still resolve.
      { source: "/dashboard/messages", destination: "/dashboard/support", permanent: true },
      { source: "/dashboard/messages/:path*", destination: "/dashboard/support/:path*", permanent: true },
      { source: "/legal", destination: "/policies/terms-of-service", permanent: true },
      { source: "/privacy", destination: "/policies/privacy-policy", permanent: true },
      // The standalone buy page was retired; checkout lives in the pricing
      // section on /aether. /aether/buy/success and /claim are still live.
      { source: "/aether/buy", destination: "/aether#pricing", permanent: true },
      // An older copy of /aether/commercial, the page the nav links to. One
      // URL keeps search engines from splitting the page in two.
      { source: "/aether/enterprise", destination: "/aether/commercial", permanent: true },
      // Blog posts renamed to match their retitled headlines.
      { source: "/blog/the-brief-is-the-product", destination: "/blog/most-projects-fail-before-figma", permanent: true },
      { source: "/blog/judgment-over-output", destination: "/blog/someone-still-has-to-pick", permanent: true },
      { source: "/blog/the-invisible-details", destination: "/blog/the-difference-you-feel", permanent: true },
    ];
  },
  skipTrailingSlashRedirect: true,
  images: {
    qualities: [70, 75, 78, 90, 100],
    // AVIF first: smaller than WebP at equivalent visual quality, which
    // offsets the quality-90 card images' larger size. Next tries each
    // format in order and falls back based on the browser's Accept header,
    // so this doesn't drop WebP support anywhere.
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    root: path.resolve("."),
  },
  // lib/bonuses.ts reads content/bonuses from disk at request time. These
  // routes render per request, so make sure the files ship with them: the
  // dashboard pages list them, and the webhook's license email totals them.
  outputFileTracingIncludes: {
    "/dashboard/bonuses": ["./content/bonuses/**/*"],
    "/dashboard/bonuses/[slug]": ["./content/bonuses/**/*"],
    "/api/stripe-webhook": ["./content/bonuses/**/*"],
    "/api/dev/license-email": ["./content/bonuses/**/*"],
  },
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js", "@supabase/ssr", "lucide-react", "react-icons"],
  },
};
export default nextConfig;
