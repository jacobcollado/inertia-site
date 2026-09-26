import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/portal", "/api", "/auth", "/login", "/reset-password", "/accept-invite", "/aether/buy/", "/og-lab"],
      },
    ],
    sitemap: "https://byinertia.com/sitemap.xml",
  };
}
