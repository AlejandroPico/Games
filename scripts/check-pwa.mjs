import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createServer } from "node:http";
import vm from "node:vm";
import path from "node:path";
const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".wasm": "application/wasm",
  ".webmanifest": "application/manifest+json",
};
const server = createServer(async (req, res) => {
  try {
    const relative =
      decodeURIComponent(new URL(req.url, "http://local").pathname).replace(
        /^\/Games\//,
        "",
      ) || "index.html";
    if (relative.includes("..")) throw Error("bad path");
    const body = await readFile(path.join("dist", relative));
    res.setHeader(
      "Content-Type",
      mime[path.extname(relative)] || "application/octet-stream",
    );
    res.end(body);
  } catch {
    res.statusCode = 404;
    res.end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
try {
  const base = "http://127.0.0.1:" + server.address().port + "/Games/";
  const manifest = JSON.parse(
    await readFile("dist/manifest.webmanifest", "utf8"),
  );
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.start_url, "./");
  for (const icon of manifest.icons.filter((i) => i.type === "image/png")) {
    const data = await readFile("dist/" + icon.src);
    assert.equal(data.subarray(1, 4).toString(), "PNG");
    const size = Number(icon.sizes.split("x")[0]);
    assert.equal(data.readUInt32BE(16), size);
    assert.equal(data.readUInt32BE(20), size);
  }
  assert.equal(
    await readFile("favicon.svg", "utf8"),
    await readFile("dist/favicon.svg", "utf8"),
  );
  const stores = new Map(),
    handlers = new Map();
  let online = true,
    claimed = false;
  const key = (request) =>
    typeof request === "string" ? request : request.url;
  const network = async (request) => {
    if (!online) throw Error("Offline");
    const response = await fetch(request);
    assert.equal(response.status, 200, key(request));
    return response;
  };
  const caches = {
    open: async (name) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        addAll: async (urls) => {
          for (const url of urls) store.set(url, await network(url));
        },
        match: async (request) => store.get(key(request))?.clone(),
      };
    },
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
  };
  const context = {
    URL,
    caches,
    fetch: network,
    self: {
      location: { href: base + "sw.js", origin: new URL(base).origin },
      clients: {
        claim: async () => {
          claimed = true;
        },
      },
      addEventListener: (name, handler) => handlers.set(name, handler),
    },
  };
  vm.runInNewContext(await readFile("dist/sw.js", "utf8"), context);
  async function lifecycle(name) {
    let task;
    handlers.get(name)({ waitUntil: (p) => (task = p) });
    await task;
  }
  await caches.open("games-offline-obsolete");
  await caches.open("other-app");
  await lifecycle("install");
  await lifecycle("activate");
  assert.equal(claimed, true);
  assert.equal(stores.has("games-offline-obsolete"), false);
  assert.equal(stores.has("other-app"), true);
  online = false;
  async function offline(url, mode) {
    let result;
    handlers.get("fetch")({
      request: { url, method: "GET", mode },
      respondWith: (p) => (result = p),
    });
    const response = await result;
    assert.ok(response, "Offline response for " + url);
    return response;
  }
  assert.match(await (await offline(base, "navigate")).text(), /id="root"/);
  const assets = await readdir("dist/assets");
  for (const file of assets) await offline(base + "assets/" + file, "cors");
  for (const file of [
    "engine/stockfish-19-lite-single.js",
    "engine/stockfish-19-lite-single.wasm",
    "manifest.webmanifest",
    "favicon.svg",
  ])
    await offline(base + file, "cors");
  console.log(
    "PWA verified: install icons, /Games/ scope, offline navigation, " +
      assets.length +
      " bundled assets, Stockfish and cache updates.",
  );
} finally {
  await new Promise((resolve) => server.close(resolve));
}
