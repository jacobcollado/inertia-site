import { getAllPosts } from "@/lib/posts";
import { BlogIndex } from "./blog-index";

// Rendered on the server so the post links are in the HTML itself. It used to
// fetch them in the browser, which left crawlers (search and AI alike) an
// empty page with nothing to follow. The layout and topic filter live in
// ./blog-index.tsx.
export default function BlogPage() {
  const posts = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    tag: p.tag,
    line: p.subtitle || p.summary || p.excerpt,
  }));
  return <BlogIndex posts={posts} />;
}
