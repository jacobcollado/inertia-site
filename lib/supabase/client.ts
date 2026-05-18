import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (url, options) => {
          const proxyUrl = url
            .toString()
            .replace(process.env.NEXT_PUBLIC_SUPABASE_URL!, "/api/auth");
          return fetch(proxyUrl, options);
        },
      },
    }
  );
}
