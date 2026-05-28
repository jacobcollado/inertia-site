import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/legal", destination: "/policies/terms-of-service", permanent: true },
      { source: "/privacy", destination: "/policies/privacy-policy", permanent: true },
    ];
  },
  turbopack: {
    root: path.resolve("."),
  },
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js", "@supabase/ssr"],
  },
};
export default nextConfig;
