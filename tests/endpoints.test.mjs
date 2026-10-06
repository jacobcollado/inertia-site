// Checks the agent-facing endpoints against a running server.
// Run: BASE_URL=http://localhost:3000 npm test   (skipped without BASE_URL)
import { test } from "node:test";
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL;
const opts = { skip: !BASE && "set BASE_URL to run" };
const get = (path, accept, init = {}) =>
  fetch(BASE + path, { redirect: "manual", ...init, headers: { ...(accept && { Accept: accept }), ...init.headers } });

test("homepage serves Markdown to agents that ask for it", opts, async () => {
  const res = await get("/", "text/markdown");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /^text\/markdown/);
  assert.match(res.headers.get("vary") ?? "", /Accept/i);
  const body = await res.text();
  assert.match(body, /^# Inertia/);
  assert.ok(body.length > 500);
});

test("homepage still serves HTML to browsers", opts, async () => {
  const res = await get("/", "text/html,application/xhtml+xml,*/*;q=0.8");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /^text\/html/);
  assert.match(res.headers.get("vary") ?? "", /Accept/i);
  const html = await res.text();
  assert.match(html, /<h1[^>]*>[\s\S]*design[\s\S]*<\/h1>/);
  assert.doesNotMatch(html.match(/<h1[\s\S]*?<\/h1>/)[0], />You</);
});

test("404s answer in Markdown when asked, HTML otherwise", opts, async () => {
  const md = await get("/this-page-does-not-exist", "text/markdown");
  assert.equal(md.status, 404);
  assert.match(md.headers.get("content-type"), /^text\/markdown/);
  const body = await md.text();
  assert.ok(body.length >= 20);
  assert.match(body, /\/llms\.txt/);

  const html = await get("/this-page-does-not-exist", "text/html");
  assert.equal(html.status, 404);
  assert.match(html.headers.get("content-type"), /^text\/html/);
});

test("/openapi.json is a valid OpenAPI 3.1 document", opts, async () => {
  const res = await get("/openapi.json");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /application\/json/);
  const spec = await res.json();
  assert.equal(spec.openapi, "3.1.0");
  assert.ok(spec.paths["/api/contact"]);
  assert.deepEqual(spec.components.schemas.Error.required.sort(), ["code", "error", "message", "resolution"]);
});

test("API errors are JSON with code, message and resolution", opts, async () => {
  const unknown = await get("/api/does-not-exist", "application/json");
  assert.equal(unknown.status, 404);
  const a = await unknown.json();
  assert.equal(a.code, "not_found");
  assert.ok(a.message && a.resolution);

  const bad = await get("/api/contact", null, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": `203.0.113.${Math.floor(Math.random() * 250)}` },
    body: JSON.stringify({ name: "Test", email: "not-an-email", message: "hi" }),
  });
  assert.equal(bad.status, 400);
  const b = await bad.json();
  assert.equal(b.code, "invalid_email");
  assert.equal(b.error, b.message);
  assert.ok(b.resolution);
});
