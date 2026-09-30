import { mkdir, copyFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const root = dirname(require.resolve("stockfish/package.json"));
const files = await readdir(join(root, "bin"));
await mkdir("public/engine", { recursive: true });
for (const name of [
  "stockfish-19-lite-single.js",
  "stockfish-19-lite-single.wasm",
]) {
  if (!files.includes(name)) throw new Error(`Missing engine: ${name}`);
  await copyFile(join(root, "bin", name), join("public/engine", name));
}
await copyFile(join(root, "Copying.txt"), "public/engine/COPYING.txt");
