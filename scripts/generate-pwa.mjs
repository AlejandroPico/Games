import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
async function files(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await files(file)));
    else result.push(file);
  }
  return result;
}
const list = (await files("dist")).filter((p) => !p.endsWith("sw.js")).sort();
const hash = createHash("sha256");
for (const file of list) hash.update(await readFile(file));
const version = hash.digest("hex").slice(0, 16);
const assets = list.map((p) => "./" + p.replaceAll("\\", "/").slice(5));
await writeFile(
  "dist/sw.js",
  `
const CACHE="games-offline-${version}";
const ASSETS=${JSON.stringify(assets)};
const ROOT=new URL("./",self.location.href).href;
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(p=>new URL(p,ROOT).href)))));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("games-offline-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
const request=event.request,url=new URL(request.url);
if(request.method!=="GET"||url.origin!==self.location.origin||!url.href.startsWith(ROOT))return;
if(request.mode==="navigate"){event.respondWith(fetch(request).catch(()=>caches.open(CACHE).then(cache=>cache.match(new URL("index.html",ROOT).href))));return;}
event.respondWith(caches.open(CACHE).then(async cache=>{const hit=await cache.match(request);return hit||fetch(request);}));
});
`,
);
console.log("Offline cache generated:", assets.length, "files.", version);
