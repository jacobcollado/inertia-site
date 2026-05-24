import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        params: { eventsPerSecond: 10 },
      },
      global: {
        fetch: (url, options) => {
          const urlStr = url.toString();
          // Only proxy auth endpoints — realtime and data requests go direct to Supabase
          if (urlStr.includes("/auth/v1/")) {
            const proxyUrl = urlStr.replace(process.env.NEXT_PUBLIC_SUPABASE_URL!, "/api/auth");
            return fetch(proxyUrl, options);
          }
          return fetch(url, options);
        },
      },
    }
  );
}
