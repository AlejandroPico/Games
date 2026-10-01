import {
  inventory,
  inventoryColumns,
  projectUrl,
  repositoryUrl,
  snapshot,
  type InventoryEntry,
} from "./inventory";

/** UTF-8 with BOM and semicolon delimiter for Excel in Spanish locales. All cells are quoted. */
export function inventoryCsv(entries: InventoryEntry[] = inventory) {
  const cell = (value: string | number) => {
    const text = String(value);
    const safe = /^[\s]*[=+@-]/u.test(text) ? "'" + text : text;
    return '"' + safe.replaceAll('"', '""') + '"';
  };
  return (
    "\uFEFF" +
    [
      inventoryColumns.map(([name]) => name),
      ...entries.map((g) => inventoryColumns.map(([, value]) => value(g))),
    ]
      .map((row) => row.map(cell).join(";"))
      .join("\r\n") +
    "\r\n"
  );
}
export function inventoryJson() {
  return (
    JSON.stringify(
      {
        schemaVersion: snapshot.schemaVersion,
        project: "Games",
        site: projectUrl,
        repository: repositoryUrl,
        generatedAt: snapshot.generatedAt,
        sourceRevision: snapshot.sourceRevision,
        localChanges: snapshot.localChanges,
        historyComplete: snapshot.historyComplete,
        dateMeaning:
          "Alta = primera presencia en el catálogo observada en Git. Activación = primer ready:true observado. No son fechas verificadas de publicación; no equivalen a creación física de archivos.",
        scope:
          "Incluye implementados y pendientes. Los detectores de archivos, arrastre y almacenamiento describen fuentes; no certifican cumplimiento de reglas ni cobertura de pruebas.",
        games: inventory,
      },
      null,
      2,
    ) + "\n"
  );
}
const md = (s: string) => s.replaceAll("|", "\\|").replaceAll("\n", " ");
const variantSummary = (g: InventoryEntry) =>
  g.manual[0]?.[1] ||
  "Concepto reservado; todavía no hay una variante implementada.";
export function gameList(markdown = true) {
  const lead = [
    "Games · Listado de juegos y conceptos reservados",
    `Web: ${projectUrl}`,
    `Repositorio: ${repositoryUrl}`,
    `Revisión fuente: ${snapshot.sourceRevision || "Sin Git"}${snapshot.localChanges ? " (con cambios locales)" : ""}`,
    `Instantánea: ${snapshot.generatedAt}`,
    "",
    "Para proponer ideas: omite tanto los juegos implementados como los pendientes de este listado. Los nombres asociados son alias o referencias del concepto, no implementaciones adicionales. Variantes de un mismo juego no deben confundirse con conceptos nuevos. Una propuesta solo es nueva si su mecánica difiere de lo ya registrado.",
    "",
  ];
  if (!markdown)
    return (
      lead.join("\n") +
      inventory
        .map(
          (g) =>
            `${g.order}. ${g.name}\nID: ${g.id}\nEstado: ${g.status}\nNombres asociados: ${g.aliases.join("; ")}\nCategoría: ${g.category}. Etiquetas: ${(g.tags || []).join(", ") || "Sin adicionales"}\nConcepto registrado: ${g.subtitle}\nVariante actual: ${variantSummary(g)}\nJugadores: ${g.players}\n`,
        )
        .join("\n")
    );
  return (
    "# " +
    lead.join("\n") +
    "| Orden | Juego | ID | Estado | Nombres asociados | Categoría y etiquetas | Concepto registrado | Variante actual |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n" +
    inventory
      .map(
        (g) =>
          `| ${g.order} | ${md(g.name)} | ${g.id} | ${g.status} | ${md(g.aliases.join("; "))} | ${md([g.category, ...(g.tags || [])].join("; "))} | ${md(g.subtitle)} | ${md(variantSummary(g))} |`,
      )
      .join("\n") +
    "\n"
  );
}
export function fullMarkdown() {
  return (
    gameList() +
    "\n## Fichas técnicas completas\n\n" +
    inventory
      .map(
        (g) =>
          `### ${g.order}. ${g.name}\n\n` +
          inventoryColumns
            .map(
              ([label, value]) =>
                `- **${label}:** ${String(value(g)).replaceAll("\n", "\n  ")}`,
            )
            .join("\n") +
          "\n",
      )
      .join("\n")
  );
}
export function promptExport(body: string) {
  return (
    body.trimEnd() +
    `\n\n---\n\n## Procedencia de esta descarga\n\nWeb: ${projectUrl}\n\nRepositorio: ${repositoryUrl}\n\nRevisión fuente de la compilación: ${snapshot.sourceRevision || "Sin historial Git disponible"}${snapshot.localChanges ? " (incluye cambios locales sin registrar)" : ""}.\n\nInstantánea de metadatos: ${snapshot.generatedAt}. Historial ${snapshot.historyComplete ? "completo" : "incompleto o no disponible"}. El inventario debe descargarse por separado de esta misma versión.\n`
  );
}
export function downloadText(
  filename: string,
  text: string,
  mime = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
