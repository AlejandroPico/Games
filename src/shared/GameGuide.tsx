import { guides } from "./guides";
import { guideSources } from "./guideSources";
import { supportsFriends } from "./playModes";
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
      {supportsFriends(id) && (
        <section>
          <h3>Jugar con amigos</h3>
          <p>
            Elige Con amigos online en los ajustes. Una persona crea una sala y
            comparte su código o enlace; las demás abren este mismo juego y
            entran en ella.{" "}
            {id === "chess"
              ? "El anfitrión juega con blancas y su amigo con negras."
              : "En las mesas de varios participantes, el anfitrión asigna cada puesto a este dispositivo, un amigo online o la IA. Espera a que estén todos y pulsa Empezar partida."}{" "}
            Cada persona juega solo cuando le toca. Mantén la pestaña abierta y
            la conexión activa: si alguien se desconecta, la partida se detiene.
          </p>
          <p>
            {id === "chess"
              ? "Nueva partida propone una revancha que el amigo debe aceptar."
              : "El anfitrión puede reiniciar con los mismos ajustes; el botón del invitado le solicita una nueva partida. Para cambiar los ajustes, el anfitrión abre el menú de la mesa. Un amigo puede volver a entrar con el código mientras haya un puesto online libre."}{" "}
            Las salas son privadas, sin cuentas ni guardado en un servidor.
            Están pensadas para jugar entre amigos; el servicio de conexión
            puede depender de la red.
          </p>
        </section>
      )}
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
