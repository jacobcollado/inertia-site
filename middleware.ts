import { type NextRequest, NextResponse } from "next/server";
import { proxy } from "./proxy";

const BLOCKED_EXTENSIONS = /\.(php|asp|aspx|jsp|cgi|pl|sh|bash|env|git|svn|htaccess|htpasswd|bak|sql|tar|gz|log|cfg|conf|pem|key|crt)$/i;
const BLOCKED_PATHS = /^\/(wp-|xmlrpc|phpmyadmin|cpanel|webmail)/i;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (BLOCKED_EXTENSIONS.test(pathname) || BLOCKED_PATHS.test(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  return proxy(req);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
