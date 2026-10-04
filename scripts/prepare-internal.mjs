import {
  readFileSync,
  readdirSync,
  statSync,
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import vm from "node:vm";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");
const git = (...args) => {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 12_000_000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
};
// Evaluate only the repository's data modules, with no filesystem/network access.
function dataModule(source, roadmap = [], completion = {}) {
  const module = { exports: {} };
  const context = {
    module,
    exports: module.exports,
    require: (id) => {
      if (id === "./roadmap") return { roadmapGames: roadmap };
      if (id === "./categoryCompletion") return completion;
      throw new Error(`Unexpected catalogue import: ${id}`);
    },
  };
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext(code, context, { timeout: 2000 });
  return module.exports;
}
function catalogue(registry, roadmap, completionSource = "") {
  const ideas = roadmap ? dataModule(roadmap).roadmapGames : [];
  const completion = completionSource ? dataModule(completionSource) : {};
  return dataModule(registry, ideas, completion).games;
}
const games = catalogue(
  read("src/games/registry.ts"),
  read("src/games/roadmap.ts"),
  read("src/games/categoryCompletion.ts"),
);
const history = {};
const commits = git(
  "log",
  "--reverse",
  "--format=%H%x09%cI",
  "--",
  "src/games/registry.ts",
  "src/games/roadmap.ts",
  "src/games/categoryCompletion.ts",
)
  .split("\n")
  .filter(Boolean);
for (const line of commits) {
  const [commit, date] = line.split("\t");
  const source = git("show", `${commit}:src/games/registry.ts`);
  if (!source) continue;
  const historical = catalogue(
    source,
    git("show", `${commit}:src/games/roadmap.ts`),
    git("show", `${commit}:src/games/categoryCompletion.ts`),
  );
  for (const game of historical) {
    const fingerprint = JSON.stringify(game);
    const h = (history[game.id] ??= {
      registeredAt: date,
      registeredCommit: commit,
      implementedAt: null,
      implementedCommit: null,
    });
    if (game.ready && !h.implementedAt) {
      h.implementedAt = date;
      h.implementedCommit = commit;
    }
    if (h.fingerprint !== fingerprint) {
      h.catalogUpdatedAt = date;
      h.catalogUpdatedCommit = commit;
      h.fingerprint = fingerprint;
    }
  }
}

const imports = {
  chess: "src/games/chess/ChessGame.tsx",
  "connect-four": "src/games/connect-four/ConnectFour.tsx",
};
const app = ts.createSourceFile(
  "App.tsx",
  read("src/App.tsx"),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
function findImport(node) {
  let path;
  const walk = (n) => {
    if (
      ts.isCallExpression(n) &&
      n.expression.kind === ts.SyntaxKind.ImportKeyword &&
      ts.isStringLiteral(n.arguments[0])
    )
      path = n.arguments[0].text;
    ts.forEachChild(n, walk);
  };
  walk(node);
  return path;
}
function visit(node) {
  if (ts.isPropertyAssignment(node)) {
    const path = findImport(node.initializer);
    if (path?.startsWith("./games/"))
      imports[node.name.text] = `src/${path.slice(2)}.tsx`;
  }
  ts.forEachChild(node, visit);
}
visit(app);
const walkFiles = (dir) =>
  readdirSync(join(root, dir)).flatMap((name) => {
    const path = join(dir, name);
    return statSync(join(root, path)).isDirectory()
      ? walkFiles(path)
      : [path.replaceAll("\\", "/")];
  });
const testSources = walkFiles("tests").map((path) => ({
  path,
  text: read(path),
}));
const records = {};
for (const game of games) {
  const component = imports[game.id] || null;
  if (game.ready && (!component || !existsSync(join(root, component))))
    throw new Error(`Playable game has no component: ${game.id}`);
  const folder = component ? dirname(component).replaceAll("\\", "/") : null;
  const files = folder ? walkFiles(folder) : [];
  const contents = files.map((path) => read(path)).join("\n");
  const h = history[game.id] || {};
  const sourceChange = folder
    ? git("log", "-1", "--format=%H%x09%cI", "--", folder).split("\t")
    : [];
  records[game.id] = {
    registeredAt: h.registeredAt || null,
    registeredCommit: h.registeredCommit || null,
    implementedAt: h.implementedAt || null,
    implementedCommit: h.implementedCommit || null,
    catalogUpdatedAt: h.catalogUpdatedAt || null,
    catalogUpdatedCommit: h.catalogUpdatedCommit || null,
    sourceUpdatedAt: sourceChange[1] || null,
    sourceUpdatedCommit: sourceChange[0] || null,
    component,
    folder,
    files,
    sourceBytes: Buffer.byteLength(contents, "utf8"),
    worker: files.some((path) => path.endsWith(".worker.ts")),
    dragDetected: /usePieceDrag|draggable|onPointerDown/.test(contents),
    storageLiterals: [
      ...new Set(
        [
          ...contents.matchAll(
            /localStorage\.(?:getItem|setItem)\(\s*["']([^"']+)/g,
          ),
        ].map((m) => m[1]),
      ),
    ],
    tests: folder
      ? testSources
          .filter((s) => s.text.includes(folder + "/"))
          .map((s) => s.path)
      : [],
  };
}
const prompt = read("docs/SUPER_PROMPT.md");
const wordCount = prompt.match(/\S+/gu)?.length || 0;
if (wordCount < 6000)
  throw new Error(
    `Super prompt needs at least 6000 words; found ${wordCount}.`,
  );
const paths = ["src", "scripts", "tests", "docs"]
  .flatMap(walkFiles)
  .filter((p) => !p.includes("/internal/generated"));
const snapshot = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  sourceRevision: git("rev-parse", "HEAD") || null,
  localChanges: !!git("status", "--porcelain", "--untracked-files=normal"),
  historyComplete:
    !!commits.length && git("rev-parse", "--is-shallow-repository") === "false",
  wordCount,
  records,
  sourceFiles: paths,
  technologies: JSON.parse(read("package.json")),
};
mkdirSync(join(root, ".generated"), { recursive: true });
writeFileSync(
  join(root, ".generated", "inventory.json"),
  JSON.stringify(snapshot, null, 2) + "\n",
);
console.log(
  `Internal context prepared: ${games.length} catalogue entries; ${wordCount} prompt words.`,
);
