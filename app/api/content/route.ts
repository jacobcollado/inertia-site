import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";
import { getAllWork } from "@/lib/work";

export const revalidate = 3600;

export function GET() {
  return NextResponse.json(
    { posts: getAllPosts(), work: getAllWork() },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" } }
  );
}
