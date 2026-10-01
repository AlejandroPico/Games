import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  FileText,
  Download,
  Copy,
  Search,
} from "lucide-react";
import Overlay from "../shared/Overlay";
import prompt from "../../docs/SUPER_PROMPT.md?raw";
import {
  inventory,
  snapshot,
  normalize,
  dateLabel,
  type InventoryEntry,
} from "./inventory";
import {
  inventoryCsv,
  inventoryJson,
  gameList,
  fullMarkdown,
  promptExport,
  downloadText,
} from "./exports";
import "./internal.css";

type View = "menu" | "inventory" | "prompt";
export default function DeveloperPanel({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<View>("menu"),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("all"),
    [category, setCategory] = useState("all"),
    [sort, setSort] = useState("catalogue"),
    [note, setNote] = useState("");
  const context = useMemo(() => promptExport(prompt), []);
  const shown = useMemo(
    () =>
      inventory
        .filter(
          (g) =>
            (status === "all" || (status === "ready" ? g.ready : !g.ready)) &&
            (category === "all" ||
              g.category === category ||
              g.tags?.includes(category)) &&
            normalize(
              [
                g.name,
                g.id,
                ...g.aliases,
                g.category,
                ...(g.tags || []),
                g.subtitle,
              ].join(" "),
            ).includes(normalize(query)),
        )
        .sort((a, b) =>
          sort === "name"
            ? a.name.localeCompare(b.name, "es")
            : sort === "category"
              ? a.category.localeCompare(b.category, "es") || a.order - b.order
              : a.order - b.order,
        ),
    [query, status, category, sort],
  );
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNote("Copiado.");
    } catch {
      setNote(
        "El navegador no permite copiar automáticamente. Puedes seleccionar el texto o descargar el archivo.",
      );
    }
  };
  const save = (filename: string, text: string, mime?: string) => {
    downloadText(filename, text, mime);
    setNote("Descarga preparada.");
  };
  const ready = inventory.filter((g) => g.ready).length;
  const title =
    view === "menu"
      ? "Herramientas internas"
      : view === "inventory"
        ? "Panel de control · Inventario"
        : "Super prompt";
  return (
    <Overlay
      title={title}
      onClose={onClose}
      className={"site-overlay internal-overlay internal-" + view}
    >
      {view === "menu" ? (
        <>
          <p className="internal-intro">
            El estado de la colección y el contexto para continuar el proyecto.
          </p>
          <div className="internal-entry-grid">
            <button
              className="internal-entry"
              onClick={() => {
                setView("inventory");
                setNote("");
              }}
            >
              <ClipboardList size={30} />
              <strong>Panel de control</strong>
              <span>
                Inventario, fechas, variantes, archivos y exportaciones.
              </span>
            </button>
            <button
              className="internal-entry"
              onClick={() => {
                setView("prompt");
                setNote("");
              }}
            >
              <FileText size={30} />
              <strong>Super prompt</strong>
              <span>Requisitos, arquitectura y protocolo de continuidad.</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="internal-context-line">
            <button
              className="internal-back"
              onClick={() => {
                setView("menu");
                setNote("");
              }}
            >
              <ArrowLeft size={16} /> Menú interno
            </button>
            <span>
              Revisión {snapshot.sourceRevision?.slice(0, 7) || "sin Git"}
              {snapshot.localChanges ? " · cambios locales" : ""} ·{" "}
              {dateLabel(snapshot.generatedAt)}
            </span>
          </div>
          {view === "inventory" ? (
            <>
              <div className="inventory-overview">
                <div>
                  <strong>{inventory.length}</strong>
                  <span>Registrados</span>
                </div>
                <div>
                  <strong>{ready}</strong>
                  <span>Implementados</span>
                </div>
                <div>
                  <strong>{inventory.length - ready}</strong>
                  <span>Pendientes</span>
                </div>
                <div>
                  <strong>{shown.length}</strong>
                  <span>En esta vista</span>
                </div>
              </div>
              <div
                className="internal-downloads"
                aria-label="Descargar inventario completo"
              >
                <span>Inventario completo</span>
                <button
                  onClick={() =>
                    save(
                      "games-inventario.csv",
                      inventoryCsv(),
                      "text/csv;charset=utf-8",
                    )
                  }
                >
                  <Download size={15} /> CSV · Excel
                </button>
                <button
                  onClick={() =>
                    save(
                      "games-inventario.json",
                      inventoryJson(),
                      "application/json;charset=utf-8",
                    )
                  }
                >
                  <Download size={15} /> JSON
                </button>
                <button
                  onClick={() =>
                    save(
                      "games-inventario.md",
                      fullMarkdown(),
                      "text/markdown;charset=utf-8",
                    )
                  }
                >
                  <Download size={15} /> Markdown
                </button>
              </div>
              <div
                className="internal-downloads"
                aria-label="Descargar listado de juegos"
              >
                <span>Listado para compartir</span>
                <button
                  onClick={() =>
                    save(
                      "games-listado-juegos.md",
                      gameList(),
                      "text/markdown;charset=utf-8",
                    )
                  }
                >
                  <Download size={15} /> Markdown
                </button>
                <button
                  onClick={() =>
                    save("games-listado-juegos.txt", gameList(false))
                  }
                >
                  <Download size={15} /> Texto
                </button>
                <button onClick={() => void copy(gameList())}>
                  <Copy size={15} /> Copiar
                </button>
              </div>
              <p className="internal-note">
                Las descargas incluyen todos los registros, aunque filtres esta
                vista. Las duraciones son orientativas; las que no constan no se
                estiman. CSV: texto UTF-8, separado por punto y coma, compatible
                con Excel.
              </p>
              <div className="inventory-filters">
                <label className="inventory-search">
                  <Search size={16} />
                  <input
                    type="search"
                    aria-label="Buscar en el inventario"
                    placeholder="Buscar nombre, ID o concepto"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <select
                  aria-label="Estado del inventario"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="ready">Implementados</option>
                  <option value="pending">Pendientes</option>
                </select>
                <select
                  aria-label="Categoría del inventario"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">Todas las categorías</option>
                  {[
                    ...new Set(
                      inventory.flatMap((g) => [g.category, ...(g.tags || [])]),
                    ),
                  ]
                    .sort((a, b) => a.localeCompare(b, "es"))
                    .map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                </select>
                <select
                  aria-label="Orden del inventario"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="catalogue">Orden del catálogo</option>
                  <option value="name">Nombre</option>
                  <option value="category">Categoría</option>
                </select>
              </div>
              <div
                className="inventory-table-scroll"
                tabIndex={0}
                role="region"
                aria-label="Tabla del inventario"
              >
                <table className="inventory-table">
                  <caption>
                    Registro de juegos · {shown.length} coincidencias
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">N.º</th>
                      <th scope="col">Juego / ID</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Fechas registradas</th>
                      <th scope="col">Categorías</th>
                      <th scope="col">Jugadores / modos</th>
                      <th scope="col">Concepto / duración</th>
                      <th scope="col">Detalles internos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((g) => (
                      <InventoryRow key={g.id} game={g} />
                    ))}
                  </tbody>
                </table>
                {!shown.length && (
                  <p className="internal-empty">
                    No hay registros con estos filtros.
                  </p>
                )}
              </div>
              <details className="inventory-method">
                <summary>Procedencia y significado de los datos</summary>
                <p>
                  Alta: primera aparición del ID en el catálogo observado en
                  Git. Activación: primer estado ready:true registrado. Estas
                  fechas no certifican el día del despliegue ni cuándo se
                  escribió por primera vez un archivo. Los cambios de metadatos
                  y de fuentes se registran por separado. El historial de esta
                  compilación es{" "}
                  {snapshot.historyComplete
                    ? "completo"
                    : "incompleto o no está disponible; las fechas son primeras evidencias disponibles"}
                  .
                </p>
                <p>
                  Estado, categoría, etiquetas, jugadores y duración proceden
                  del catálogo efectivo, con sus correcciones sobre las ideas
                  originales. Las guías describen la variante real. Archivos,
                  bytes, Workers, literales de almacenamiento e importaciones de
                  pruebas se detectan en fuentes; no representan una auditoría
                  de las reglas ni un porcentaje de cobertura. Las fichas
                  pendientes no tienen reglas, IA ni sala implementadas.
                </p>
                <p>
                  Instantánea: {snapshot.generatedAt}. Revisión fuente:{" "}
                  {snapshot.sourceRevision || "No disponible"}. No contiene
                  partidas, claves ni datos de visitantes.
                </p>
              </details>
            </>
          ) : (
            <>
              <div className="prompt-overview">
                <p>
                  Contexto de continuidad del proyecto. El catálogo concreto se
                  entrega en el inventario separado.
                </p>
                <strong>
                  {snapshot.wordCount.toLocaleString("es-ES")} palabras
                </strong>
              </div>
              <div
                className="internal-downloads"
                aria-label="Descargar super prompt"
              >
                <button
                  onClick={() =>
                    save(
                      "games-super-prompt.md",
                      context,
                      "text/markdown;charset=utf-8",
                    )
                  }
                >
                  <Download size={15} /> Markdown
                </button>
                <button onClick={() => save("games-super-prompt.txt", context)}>
                  <Download size={15} /> Texto
                </button>
                <button onClick={() => void copy(context)}>
                  <Copy size={15} /> Copiar texto completo
                </button>
              </div>
              <pre
                className="super-prompt-copy"
                tabIndex={0}
                aria-label="Texto completo del super prompt"
              >
                {context}
              </pre>
            </>
          )}
          <p className="internal-feedback" role="status">
            {note}
          </p>
        </>
      )}
    </Overlay>
  );
}
function InventoryRow({ game: g }: { game: InventoryEntry }) {
  return (
    <tr>
      <td>{g.order}</td>
      <th scope="row">
        <strong>{g.name}</strong>
        <code>{g.id}</code>
      </th>
      <td>
        <span className={g.ready ? "inventory-ready" : "inventory-pending"}>
          {g.status}
        </span>
      </td>
      <td>
        <span>Alta: {dateLabel(g.registeredAt)}</span>
        <span>Activación: {dateLabel(g.implementedAt)}</span>
        <span>Fuentes: {dateLabel(g.sourceUpdatedAt)}</span>
      </td>
      <td>
        {[g.category, ...(g.tags || [])].map((t) => (
          <span key={t}>{t}</span>
        ))}
      </td>
      <td>
        <strong>{g.players}</strong>
        <span>{g.modes.join(" · ") || "Sin implementar"}</span>
      </td>
      <td>
        <p>{g.subtitle}</p>
        <span>{g.durationNote}</span>
      </td>
      <td>
        <details>
          <summary>Ficha técnica</summary>
          <dl>
            <dt>Nombres asociados</dt>
            <dd>{g.aliases.join("; ")}</dd>
            <dt>Carpeta</dt>
            <dd>{g.folder || "Sin implementar"}</dd>
            <dt>Entrada</dt>
            <dd>{g.component || "Sin implementar"}</dd>
            <dt>IA / red</dt>
            <dd>
              {g.ai}. {g.online}.
            </dd>
            <dt>Fuentes</dt>
            <dd>
              {g.files.length} archivos ·{" "}
              {g.sourceBytes.toLocaleString("es-ES")} bytes
              <ul>
                {g.files.map((f) => (
                  <li key={f}>
                    <code>{f}</code>
                  </li>
                ))}
              </ul>
            </dd>
            <dt>Interacciones detectadas</dt>
            <dd>
              Arrastre: {g.dragDetected ? "detectado" : "no detectado"}.
              Literales de almacenamiento:{" "}
              {g.storageLiterals.join(", ") || "ninguno detectado"}.
            </dd>
            <dt>Pruebas que importan la carpeta</dt>
            <dd>{g.tests.join(", ") || "Ninguna detectada"}</dd>
            <dt>Metadatos modificados</dt>
            <dd>{dateLabel(g.catalogUpdatedAt)}</dd>
            <dt>Commit de alta</dt>
            <dd>
              <code>{g.registeredCommit || "No registrado"}</code>
            </dd>
            <dt>Variante y límites</dt>
            <dd>
              {g.manual.length
                ? g.manual.map(([title, text]) => (
                    <p key={title}>
                      <strong>{title}.</strong> {text}
                    </p>
                  ))
                : "Idea reservada: todavía no hay manual implementado."}
            </dd>
          </dl>
        </details>
      </td>
    </tr>
  );
}
