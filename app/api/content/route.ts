import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";
import { getAllWork } from "@/lib/work";

export function GET() {
  return NextResponse.json({
    posts: getAllPosts(),
    work: getAllWork(),
  });
}
