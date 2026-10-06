import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isKnownPath, MARKDOWN_HEADERS, markdownNotFound, prefersMarkdown } from "@/lib/agent-negotiation";

const BLOCKED_EXTENSIONS = /\.(php|asp|aspx|jsp|cgi|pl|sh|bash|env|git|svn|htaccess|htpasswd|bak|sql|tar|gz|log|cfg|conf|pem|key|crt)$/i;
const BLOCKED_PATHS = /^\/(wp-|xmlrpc|phpmyadmin|cpanel|webmail)/i;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const wantsMarkdown = prefersMarkdown(request.headers.get("accept"));

  if (BLOCKED_EXTENSIONS.test(pathname) || BLOCKED_PATHS.test(pathname)) {
    return wantsMarkdown
      ? new NextResponse(markdownNotFound(pathname), { status: 404, headers: MARKDOWN_HEADERS })
      : new NextResponse(null, { status: 404 });
  }

  // Agents that ask for Markdown (Accept: text/markdown) get the homepage as
  // Markdown (app/index.md), and a Markdown 404 with links onward for paths
  // nothing on the site answers. Browsers never ask, so they're unaffected.
  if (wantsMarkdown) {
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/index.md", request.url), { headers: { Vary: "Accept" } });
    }
    if (!isKnownPath(pathname)) {
      return new NextResponse(markdownNotFound(pathname), { status: 404, headers: MARKDOWN_HEADERS });
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (user && pathname === "/login") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const dest = profile?.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
