import { games, type GameInfo } from "../games/registry";
import { roadmapGames } from "../games/roadmap";
import { guides } from "../shared/guides";
import { individualGames, supportsFriends } from "../shared/playModes";
import rawSnapshot from "../../.generated/inventory.json?raw";

export type HistoryRecord = {
  registeredAt: string | null;
  registeredCommit: string | null;
  implementedAt: string | null;
  implementedCommit: string | null;
  catalogUpdatedAt: string | null;
  catalogUpdatedCommit: string | null;
  sourceUpdatedAt: string | null;
  sourceUpdatedCommit: string | null;
  component: string | null;
  folder: string | null;
  files: string[];
  sourceBytes: number;
  worker: boolean;
  dragDetected: boolean;
  storageLiterals: string[];
  tests: string[];
};
type Snapshot = {
  schemaVersion: number;
  generatedAt: string;
  sourceRevision: string | null;
  localChanges: boolean;
  historyComplete: boolean;
  wordCount: number;
  records: Record<string, HistoryRecord>;
  sourceFiles: string[];
  technologies: {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
    packageManager: string;
  };
};
export const snapshot = JSON.parse(rawSnapshot) as Snapshot;
export const projectUrl = "https://alejandropico.github.io/Games/";
export const repositoryUrl = "https://github.com/AlejandroPico/Games";
export type InventoryEntry = GameInfo &
  HistoryRecord & {
    order: number;
    aliases: string[];
    status: string;
    modes: string[];
    online: string;
    ai: string;
    manual: [string, string][];
    durationNote: string;
  };
export const inventory: InventoryEntry[] = games.map((game, index) => {
  const idea = roadmapGames.find((g) => g.id === game.id);
  const aliases = [
    ...new Set(
      [game.name, idea?.name, game.id.replaceAll("-", " ")].filter(
        (s): s is string => !!s,
      ),
    ),
  ];
  const individual = individualGames.has(game.id);
  const modes = !game.ready
    ? []
    : individual
      ? ["Jugar", "Solo IA"]
      : ["Humano–IA", "Humanos locales", "Amigos online", "Solo IA"];
  if (game.ready && (game.id === "memory" || game.id === "yahtzee-la-generala"))
    modes.push("En solitario");
  const data = snapshot.records[game.id];
  return {
    ...game,
    ...data,
    order: index + 1,
    aliases,
    status: game.ready ? "Implementado" : "Pendiente de implementar",
    modes,
    online: !game.ready
      ? "Sin implementar"
      : supportsFriends(game.id)
        ? game.id === "chess"
          ? "Sala privada · protocolo de ajedrez"
          : "Sala privada · TablePeer"
        : "No aplica: mesa individual",
    ai: !game.ready
      ? "Sin implementar"
      : game.id === "chess"
        ? "Stockfish 19 Lite Single"
        : data.worker
          ? "Worker propio; búsqueda/heurística según la variante"
          : "Lógica local; ver manual de la variante",
    manual: guides[game.id] || [],
    durationNote: game.duration || "No registrada",
  };
});
export function dateLabel(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
        timeZone: "Europe/Madrid",
      }).format(new Date(value))
    : "No registrada";
}
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
export const inventoryColumns: [
  string,
  (g: InventoryEntry) => string | number,
][] = [
  ["Orden", (g) => g.order],
  ["ID estable", (g) => g.id],
  ["Juego", (g) => g.name],
  ["Alias y nombres asociados", (g) => g.aliases.join(" | ")],
  ["Estado", (g) => g.status],
  ["Categoría", (g) => g.category],
  ["Etiquetas", (g) => (g.tags || []).join(" | ")],
  ["Descripción del catálogo", (g) => g.subtitle],
  ["Jugadores del catálogo", (g) => g.players],
  ["Duración orientativa del catálogo", (g) => g.durationNote],
  ["Alta en catálogo (ISO)", (g) => g.registeredAt || "No registrada"],
  ["Commit de alta", (g) => g.registeredCommit || ""],
  [
    "Primera activación registrada (ISO)",
    (g) => g.implementedAt || "No registrada",
  ],
  ["Commit de activación", (g) => g.implementedCommit || ""],
  [
    "Último cambio de metadatos (ISO)",
    (g) => g.catalogUpdatedAt || "No registrado",
  ],
  ["Commit de metadatos", (g) => g.catalogUpdatedCommit || ""],
  [
    "Último cambio de fuentes (ISO)",
    (g) => g.sourceUpdatedAt || "No registrado",
  ],
  ["Commit de fuentes", (g) => g.sourceUpdatedCommit || ""],
  ["Modos actuales", (g) => g.modes.join(" | ") || "Sin implementar"],
  ["Multijugador online", (g) => g.online],
  ["IA", (g) => g.ai],
  ["Carpeta", (g) => g.folder || "Sin carpeta implementada"],
  ["Componente de entrada", (g) => g.component || "Sin implementar"],
  ["Archivos de la carpeta", (g) => g.files.join(" | ")],
  ["Bytes de fuentes de la carpeta", (g) => g.sourceBytes],
  [
    "Arrastre detectado en fuentes (no auditoría)",
    (g) => (g.dragDetected ? "Sí" : "No"),
  ],
  [
    "Literales de almacenamiento detectados",
    (g) => g.storageLiterals.join(" | ") || "Ninguno detectado",
  ],
  [
    "Pruebas que importan la carpeta",
    (g) => g.tests.join(" | ") || "Ninguna detectada",
  ],
  [
    "Manual de la variante y límites",
    (g) =>
      g.manual.map(([title, text]) => title + ": " + text).join("\n\n") ||
      "Sin guía implementada",
  ],
  ["URL jugable", (g) => (g.ready ? projectUrl + "#" + g.id : "No jugable")],
];
