// Tells Bing (and the other IndexNow engines: Yandex, Seznam, Naver) to
// re-crawl every URL in the live sitemap now, instead of whenever they next
// get round to it. ChatGPT's web search runs on Bing's index, so this is the
// fastest way to get fresh pages and prices in front of it.
//
// Run after a deploy: `npm run indexnow`. The key is public by design; the
// protocol checks it against public/<key>.txt on the live site.

const HOST = "byinertia.com";
const KEY = "71b4e7bee59bd8aef3201aca5f4f5e89";

const sitemap = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urlList.length === 0) throw new Error("No URLs found in the live sitemap");

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});

// 200 and 202 both mean accepted.
console.log(`IndexNow: ${res.status} for ${urlList.length} URLs`, await res.text());
