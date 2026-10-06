// Unit tests for the Markdown negotiation and API error shape.
// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { isKnownPath, KNOWN_SEGMENTS, markdownNotFound, prefersMarkdown } from "../lib/agent-negotiation.ts";
import { apiErrorBody } from "../lib/api-error.ts";

test("prefersMarkdown: only an explicit text/markdown wins", () => {
  assert.equal(prefersMarkdown("text/markdown"), true);
  assert.equal(prefersMarkdown("text/markdown, text/html;q=0.9"), true);
  assert.equal(prefersMarkdown("text/html, text/markdown"), true);
  assert.equal(prefersMarkdown("text/html"), false);
  assert.equal(prefersMarkdown("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"), false);
  assert.equal(prefersMarkdown("*/*"), false);
  assert.equal(prefersMarkdown("text/html, text/markdown;q=0.5"), false);
  assert.equal(prefersMarkdown("text/markdown;q=0"), false);
  assert.equal(prefersMarkdown(""), false);
  assert.equal(prefersMarkdown(null), false);
});

test("isKnownPath: unknown top-level pages are 404s, files and known sections pass", () => {
  assert.equal(isKnownPath("/"), true);
  assert.equal(isKnownPath("/aether"), true);
  assert.equal(isKnownPath("/blog/some-post"), true);
  assert.equal(isKnownPath("/llms.txt"), true);
  assert.equal(isKnownPath("/openapi.json"), true);
  assert.equal(isKnownPath("/robots.txt"), true);
  assert.equal(isKnownPath("/this-page-does-not-exist"), false);
  assert.equal(isKnownPath("/nope/deeper"), false);
});

// Folders whose routes Next serves at their own path segment.
function routeDirs(dir) {
  return readdirSync(dir).filter(
    (name) => statSync(join(dir, name)).isDirectory() && !/^[_(@[]/.test(name) && !name.includes("."),
  );
}

test("KNOWN_SEGMENTS covers every folder in app/ and public/", () => {
  for (const name of [...routeDirs("app"), ...routeDirs("public")]) {
    assert.ok(KNOWN_SEGMENTS.has(name), `add "${name}" to KNOWN_SEGMENTS in lib/agent-negotiation.ts`);
  }
});

test("markdownNotFound links onward", () => {
  const body = markdownNotFound("/missing");
  assert.ok(body.length >= 20);
  assert.match(body, /^# Page not found/);
  assert.match(body, /`\/missing`/);
  for (const link of ["/llms.txt", "/sitemap.xml", "/openapi.json"]) assert.ok(body.includes(link), link);
});

test("apiErrorBody has code, message, resolution and the legacy error", () => {
  assert.deepEqual(apiErrorBody("invalid_email", "Invalid email", "Send a valid email."), {
    error: "Invalid email",
    code: "invalid_email",
    message: "Invalid email",
    resolution: "Send a valid email.",
  });
});
