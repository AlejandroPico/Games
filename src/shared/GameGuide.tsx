import { guides } from "./guides";
import { guideSources } from "./guideSources";
export default function GameGuide({
  id,
  summary,
}: {
  id: string;
  summary?: string;
}) {
  const guide = guides[id];
  return (
    <article className="game-guide">
      {guide?.map(([heading, text]) => (
        <section key={heading}>
          <h3>{heading}</h3>
          <p>{text}</p>
        </section>
      ))}
      {summary && (
        <section>
          <h3>Opciones de esta mesa</h3>
          <p>{summary}</p>
        </section>
      )}
      <section>
        <h3>Controles y nueva partida</h3>
        <p>
          Selecciona las opciones en Ajustes de partida y pulsa Empezar partida.
          Puedes usar el ratón o tocar la mesa. Con teclado, Tab recorre los
          controles y Enter o Espacio los activa. El botón de nueva partida de
          la esquina inferior derecha conserva los ajustes; para cambiarlos,
          abre el botón de ajustes. Games en la barra superior y el gesto de
          volver te devuelven a la colección.
        </p>
      </section>
      {guideSources[id]?.length > 0 && (
        <section>
          <h3>Referencias para ampliar</h3>
          <p>
            Los enlaces externos describen su reglamento o edición. Las
            variantes implementadas aquí se indican arriba; las referencias no
            implican afiliación con sus editores.
          </p>
          <ul>
            {guideSources[id].map((source) => (
              <li key={source.url}>
                <a
                  className="text-button"
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.title} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h3>Observar a la inteligencia artificial</h3>
        <p>
          Solo inteligencia artificial permite ver jugar a todos los
          participantes, o al solucionador en los juegos individuales. Puedes
          pausar, continuar y cambiar la velocidad desde la barra de la mesa. La
          IA usa las reglas y la información que corresponde a cada jugador: no
          consulta cartas, palabras ni minas ocultas del rival. En puzles y
          solitarios puede quedarse sin una continuación útil; una partida
          perdida o detenida no garantiza que no exista una solución. Los
          rivales son motores de práctica locales; no representan un nivel de
          torneo.
        </p>
      </section>
    </article>
  );
}
