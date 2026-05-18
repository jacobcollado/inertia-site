"use server";

import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const supabasePath = path.join("/");
  const url = new URL(req.url);
  const target = `${SUPABASE_URL}/${supabasePath}${url.search}`;

  const headers = new Headers(req.headers);
  headers.set("host", new URL(SUPABASE_URL).host);

  const res = await fetch(target, {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : null,
    duplex: "half",
  } as RequestInit);

  const resHeaders = new Headers(res.headers);
  resHeaders.delete("content-encoding");

  return new NextResponse(res.body, {
    status: res.status,
    headers: resHeaders,
  });
}

export const GET     = handler;
export const POST    = handler;
export const PUT     = handler;
export const PATCH   = handler;
export const DELETE  = handler;
export const OPTIONS = handler;
