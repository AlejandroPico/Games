import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { games } from "../src/games/registry";
import {
  inventory,
  inventoryColumns,
  snapshot,
} from "../src/internal/inventory";
import {
  inventoryCsv,
  inventoryJson,
  gameList,
  fullMarkdown,
  promptExport,
} from "../src/internal/exports";

// Parse the saved format independently, including quoted multi-line cells.
function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === '"') {
      if (quoted && source[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && ch === ";") {
      row.push(cell);
      cell = "";
    } else if (!quoted && ch === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  expect(quoted).toBe(false);
  return rows;
}
describe("Internal context and portable inventory", () => {
  it("exports every effective catalogue entry exactly once, including pending ideas", () => {
    const json = JSON.parse(inventoryJson());
    expect(json.games.map((g: { id: string }) => g.id)).toEqual(
      games.map((g) => g.id),
    );
    expect(new Set(json.games.map((g: { id: string }) => g.id)).size).toBe(
      games.length,
    );
    expect(json.games.filter((g: { ready: boolean }) => !g.ready)).toHaveLength(
      games.filter((g) => !g.ready).length,
    );
    expect(json.sourceRevision).toBe(snapshot.sourceRevision);
    expect(json.dateMeaning).toContain(
      "No son fechas verificadas de publicación",
    );
    for (const g of inventory.filter((g) => g.ready)) {
      expect(g.files).toContain(g.component);
      expect(g.folder).toBeTruthy();
      expect(g.manual.length).toBeGreaterThan(0);
      expect(g.sourceBytes).toBeGreaterThan(0);
    }
  });
  it("round-trips Unicode, quotes, semicolons and the full multi-line manuals into a rectangular CSV", () => {
    const entries = [
      inventory[0],
      { ...inventory[1], name: 'Práctica; "táctica"\nSegunda línea' },
    ];
    const rows = parseCsv(inventoryCsv(entries));
    expect(rows.length).toBe(3);
    expect(rows.every((row) => row.length === inventoryColumns.length)).toBe(
      true,
    );
    expect(rows[2][rows[0].indexOf("Juego")]).toBe(entries[1].name);
    expect(
      rows[1][rows[0].indexOf("Manual de la variante y límites")],
    ).toContain("\n\n");
    const complete = parseCsv(inventoryCsv());
    expect(complete.slice(1).map((row) => row[1])).toEqual(
      games.map((g) => g.id),
    );
  });
  it("neutralises spreadsheet formula cells without changing the source JSON", () => {
    const formulaName = '=HYPERLINK("https://example.invalid";"x")';
    const result = parseCsv(
      inventoryCsv([{ ...inventory[0], name: formulaName }]),
    );
    expect(result[1][2]).toBe("'" + formulaName);
    expect(JSON.parse(inventoryJson()).games[0].name).toBe(games[0].name);
  });
  it("lists implemented and reserved concepts with identities, aliases and descriptions", () => {
    for (const g of inventory) {
      expect(gameList(false)).toContain(`ID: ${g.id}`);
      expect(gameList(false)).toContain(`Estado: ${g.status}`);
      expect(gameList()).toContain(g.id);
    }
    expect(fullMarkdown()).toContain("Manual de la variante y límites");
    expect(gameList()).toContain(
      "omite tanto los juegos implementados como los pendientes",
    );
    expect(gameList(false)).toContain("inspirado en CATAN");
    expect(gameList()).toContain("Variante actual");
  });
  it("keeps the substantial context above the requested minimum and exports its provenance", () => {
    const body = readFileSync("docs/SUPER_PROMPT.md", "utf8");
    expect(body.match(/\S+/gu)!.length).toBeGreaterThanOrEqual(6000);
    expect(snapshot.wordCount).toBe(body.match(/\S+/gu)!.length);
    expect(body).toContain("## 42. Protocolo de continuidad");
    const exported = promptExport(body);
    expect(exported).toContain(body.trimEnd());
    expect(exported).toContain("El inventario debe descargarse por separado");
    expect(exported).toContain(
      snapshot.sourceRevision || "Sin historial Git disponible",
    );
  });
});
