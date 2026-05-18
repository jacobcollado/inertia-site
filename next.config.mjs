import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve("."),
  },
  productionBrowserSourceMaps: false,
};
export default nextConfig;
