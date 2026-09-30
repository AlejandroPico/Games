# Juegos y variantes

Los juegos disponibles tienen un menú integrado en la mesa, instrucciones, diseño adaptable y temas día, tarde, noche y automático. Las ideas pendientes se conservan en [ROADMAP.md](ROADMAP.md), con fichas deshabilitadas en el catálogo.

| Juego         | Categoría                  | Modos y ayudas                                  | Variante                                                      |
| ------------- | -------------------------- | ----------------------------------------------- | ------------------------------------------------------------- |
| Ajedrez       | Estrategia                 | Stockfish, local, salas privadas, 3D/2D         | Reglas y límites descritos en README                          |
| Conecta 4     | Clásicos                   | IA en Worker, tres dificultades, local          | Tablero 7×6                                                   |
| Tres en raya  | Clásicos / Familia         | IA clásica óptima, IA continua en Worker, local | Tablero 3×3; clásico o continuo con tres marcas por jugador   |
| Reversi       | Estrategia                 | IA en Worker, local                             | 8×8, pasos automáticos                                        |
| Damas         | Estrategia                 | IA en Worker, local                             | Inglesas, capturas obligatorias y múltiples                   |
| Mancala       | Tradicionales              | IA en Worker, local                             | Kalah, seis cuencos, cuatro semillas                          |
| Batalla naval | Deducción                  | IA que solo usa disparos conocidos              | Cinco barcos, colocación aleatoria                            |
| Solitario     | Cartas                     | Pistas y deshacer                               | Klondike, robo de una o tres, reciclado ilimitado             |
| Buscaminas    | Lógica                     | Pistas deductivas, tres tamaños                 | Primer clic y entorno seguros, banderas, apertura por números |
| Sudoku        | Lógica                     | Pistas, notas y deshacer                        | Solución única, tres densidades                               |
| 2048          | Puzles                     | Sugerencias, deshacer, teclado, gestos          | Fusiones únicas por jugada, continuar tras 2048               |
| Parejas       | Memoria / Familia          | Solo, IA con memoria visible, local             | Ocho parejas, repetir al acertar                              |
| Go            | Estrategia / Tradicionales | IA en Worker, local                             | 9×9, 13×13 o 19×19; área y komi 7.5                           |
| Parchís       | Familia / Tradicionales    | 2–4 jugadores, mezcla de humanos e IA           | Individual, un dado, cuatro fichas por color                  |

## Interacción y nuevas partidas

El menú inicial y el botón de ajustes muestran la misma configuración completa, con «Empezar partida» al final. «Nueva partida», en la esquina inferior derecha, reinicia con las opciones actuales sin volver a ese menú. En ajedrez por Internet solicita una revancha al rival; ambos aceptan antes de reiniciar.

Ajedrez 2D y 3D, damas y solitario permiten arrastrar además de seleccionar con clic. En solitario se desplaza toda la secuencia de cartas elegida. Reversi permite arrastrar una ficha desde la reserva; las fichas ya colocadas permanecen en el tablero. Las reglas siguen validando todos los destinos.

Tres en raya continuo conserva un máximo de tres marcas por jugador. La cuarta elimina la primera de ese mismo jugador antes de comprobar la victoria. Se señala la marca que desaparecerá; las repeticiones no terminan la partida en empate. La IA continua usa búsqueda limitada y no se presenta como una solución óptima de esta variante.

## Go

Grupos y libertades, capturas simultáneas, prohibición de suicidio y superko posicional (no repetir ninguna posición anterior). Dos pasos consecutivos abren el recuento: se marcan grupos muertos, ambos jugadores locales confirman el resultado o se reanuda el juego para resolver desacuerdos. En modo IA el jugador revisa y confirma el recuento. Se cuentan piedras vivas y espacios vacíos rodeados exclusivamente por un color, con komi 7.5 para blancas.

Es una variante explícita con recuento de área y superko posicional, no una implementación literal de todas las federaciones. La IA usa búsqueda Monte Carlo limitada para iniciación; no tiene la fuerza de KataGo ni arbitra vida y muerte. [Comparación de reglas de la British Go Association](https://www.britgo.org/rules/compare.html).

## Parchís

Todas las fichas comienzan en casa. Salida obligatoria con cinco cuando es legal; con seis se repite y se avanzan siete si no quedan fichas en casa. Barreras de dos fichas del mismo color, casillas seguras, captura con premio de veinte, llegada exacta con premio de diez y penalización al tercer seis consecutivo (salvo pasillo final). Un seis obliga a abrir una barrera propia si existe una jugada legal que lo permita. Las bonificaciones se realizan con otra ficha legal y pueden encadenarse. En la salida llena se captura una ficha rival; entre dos rivales se captura la última que llegó.

Dos jugadores usan colores opuestos. Se puede jugar localmente con todos los colores humanos o combinar humanos y rivales automáticos. La IA valora capturas, llegada, salidas y seguridad; no se presenta como motor competitivo. Variante individual inspirada en las [reglas de Ludoteka](https://www.ludoteka.com/juegos/parchis/reglas), con inicio de todas las fichas en casa.

## Organización y persistencia

Reglas, componente y Worker (cuando se necesita) pertenecen a cada carpeta de juego. `GameLayout`, `Overlay` y `useAI` comparten presentación y gestión, no reglas ni partidas. El catálogo se amplía en `registry.ts` y las importaciones en `App.tsx`.

Salvo ajedrez, las partidas duran mientras está abierta su vista, sin guardado de progreso ni salas en línea. El ajedrez conserva su guardado y sus salas privadas. La PWA guarda recursos para jugar sin conexión, no el progreso de todos los juegos.

## Comprobaciones

- Pruebas de reglas, IA, iluminación automática, encuadre 3D, eliminación ordenada de marcas en tres en raya continuo e integridad del catálogo.
- Los juegos disponibles iniciados en 320×568 y 390×844, sin desplazamiento de página ni tableros recortados; revisión adicional de vista horizontal. Reinicio directo comprobado en vista móvil.
- Arrastre real de piezas en ajedrez 2D/3D, damas y reversi; arrastre de cartas individuales y secuencias en solitario.
- Jugadas y respuesta de IA de Go verificadas en el navegador.
- El ajedrez conserva la validación anterior de Stockfish. Sincronización de jugadas y revancha verificada entre dos pestañas mediante PeerJS.
- Prueba del Service Worker compilado: precarga, limpieza de versiones, navegación y recursos sin conexión, incluido el motor de ajedrez.
