# Games

Colección de juegos de todo tipo: mesa, tablero, cartas, lógica, estrategia, memoria y puzles. Reúne clásicos, juegos tradicionales de distintas culturas e ideas nuevas, y está preparada para crecer con más modalidades y experiencias. Se juega en el navegador, con inteligencia artificial o en compañía según el juego.

Desarrollada con React, TypeScript y Three.js. Sitio estático para GitHub Pages, sin claves ni servidor propio.

## Interfaz

- Catálogo de fichas cuadradas con arte alineado, nombre sobre la imagen, jugadores y categoría integrados sin recuadros. Las ideas pendientes tienen fichas deshabilitadas en gris. El ajedrez utiliza un tablero 3D real.
- Barra superior fija con búsqueda, filtros de categorías combinables, iluminación y acerca de. Portfolio y repositorio dentro de acerca de.
- Temas día, tarde, noche y automático. El automático solicita ubicación mediante el permiso del navegador y calcula amanecer y anochecer. Guarda coordenadas aproximadas solo en este navegador. Si no hay permiso, usa el reloj local y una estimación estacional para el hemisferio norte. No mide luz ambiental ni meteorología.
- Partidas ocupando el espacio bajo la barra, sin desplazamiento de página. Ajustes e instrucciones se abren sobre la mesa; los paneles largos pueden desplazarse internamente.
- Ayudas detalladas con objetivo, preparación, turnos, ejemplos, final y referencias donde existen. El interrogante abre Cómo jugar; información abre Acerca de.
- Todos los juegos incluyen Solo inteligencia artificial: observación de todos los participantes o resolución automática en solitarios, con pausa y velocidad.
- Nueva partida en la esquina inferior derecha: reinicia directamente con las opciones seleccionadas. El botón de ajustes abre el mismo menú completo de entrada.
- Arrastre además de clic en ajedrez 2D/3D, damas americanas e internacionales, Shogi, Xiangqi y Backgammon, y los solitarios, incluyendo secuencias de cartas; en reversi se puede arrastrar la ficha de reserva a una casilla legal.
- Navegación mediante fragmentos: volver desde un juego regresa a la colección; desde la colección se conserva el comportamiento del navegador o del sistema.
- Aplicación PWA instalable y preparada para jugar sin conexión tras completar la primera descarga. Las salas con amigos requieren Internet.
- `favicon.svg` en la raíz es la fuente del icono; la compilación lo copia a `public/favicon.svg`. Incluye iconos PNG de instalación y versión maskable.

## Juegos

Ajedrez, Conecta 4, tres en raya, reversi, damas americanas e internacionales, mancala, batalla naval, solitario Klondike, Spider, Carta Blanca, buscaminas, sudoku, 2048, parejas, Go, Parchís, Shogi, Xiangqi, blackjack, mus, brisca, mahjong solitario, Yahtzee, Mastermind y Quarto; Ahorcado, CruzaPalabras, Basta / Tutti Frutti, Adivina la Palabra, Cajas / Timbiriche, Gomoku, Palabras Encadenadas, Conecta 5 / Pente, El Diccionario, Hex, Brotes, Colonizadores y Backgammon. Las fichas grises reservan las ideas de [docs/ROADMAP.md](docs/ROADMAP.md) y no abren partidas. Tres en raya incluye una variante continua: cada jugador conserva sus tres últimas marcas; al colocar la cuarta desaparece la más antigua. Variantes y modos: [docs/GAMES.md](docs/GAMES.md) y [docs/REPERTOIRE.md](docs/REPERTOIRE.md).

Ajedrez ofrece tablero 3D y 2D, Stockfish 19 Lite Single con cuatro dificultades, dos jugadores locales y salas privadas mediante PeerJS. Incluye práctica sin reloj, relojes 3+2, 5+3, 10+5 y 15+10, guardado local, reanudación e importación/exportación PGN.

Los juegos añadidos, sus variantes, las fuentes de reglas y los límites de las IA se describen en [docs/EXPANSION.md](docs/EXPANSION.md). Los motores de los tableros nuevos usan búsqueda limitada en Workers, para práctica; Xiangqi es una edición casual con revisión de repeticiones y sin arbitraje automático completo de persecuciones WXF. Los juegos de cartas no usan dinero.

## Desarrollo

Requiere Node 24 y pnpm 11.25.0.

```sh
pnpm install
node scripts/prepare-engine.mjs
pnpm dev
pnpm test
pnpm build
pnpm check:pwa
pnpm preview
```

La preparación copia el motor de un hilo y su licencia a `public/engine`, además del favicon. El motor pesa aproximadamente 1.8 MB y no necesita encabezados de aislamiento. Las rutas por fragmentos admiten visitas directas bajo `/Games/`. Los comandos de desarrollo, pruebas y compilación ejecutan también `scripts/prepare-internal.mjs`: genera metadatos del catálogo e historial en `.generated/inventory.json` y comprueba el mínimo de contexto en `docs/SUPER_PROMPT.md`. La salida generada está ignorada y no se edita a mano. Sin Git las fechas quedan sin registrar; con historial superficial se identifican como evidencia incompleta. Actions obtiene el historial completo.

La compilación genera un Service Worker con una versión basada en el contenido y precarga recursos propios, incluidos todos los juegos y el motor. Requiere completar la descarga inicial y disponer de almacenamiento del navegador. Las actualizaciones esperan al cierre de las pestañas existentes para evitar sustituir recursos durante una partida. `check:pwa` sirve la compilación bajo `/Games/`, ejecuta el Service Worker generado y verifica instalación, limpieza de versiones antiguas y navegación/recursos sin conexión. Android puede instalarla desde el navegador; no se ha comprobado la instalación en un teléfono físico.

## Estructura y colaboración

La ampliación de estrategia, roles y puzles se describe en [docs/EURO_ROLES_LOGIC.md](docs/EURO_ROLES_LOGIC.md). `StrategyTable` y `LogicTable` comparten únicamente presentación; cada motor tiene sus decisiones y Worker propios. Se identifican las ediciones originales, las variantes y los límites de generación y búsqueda.

Las nuevas mesas tradicionales y sus ilustraciones se describen en [docs/TRADITIONAL_COMPLETION.md](docs/TRADITIONAL_COMPLETION.md). Cada ayuda identifica su edición jugable, incluidas reconstrucciones históricas y recorridos originales. `IdentityArt` da a las fichas afectadas composiciones propias; `AbstractTable` admite tableros de conexiones, curvas y cuadrículas con clic, teclado y arrastre.

La ampliación de deducción, dados y abstractos se describe en [docs/CATEGORY_COMPLETION.md](docs/CATEGORY_COMPLETION.md), con ediciones, variantes, fuentes y límites. Las mesas de casino usan puntos ficticios. `DiceTable`, `DeductionTable` y `AbstractTable` comparten presentación; cada juego mantiene su motor propio.

La ampliación de mesas tradicionales, cartas, eurogames, deducción y puzles se documenta en [docs/REPERTOIRE_EXPANSION.md](docs/REPERTOIRE_EXPANSION.md), con las ediciones jugables, las adaptaciones originales y sus limitaciones. Las salas compartidas admiten hasta ocho puestos. Las ayudas diferencian las reglas de esta mesa de las referencias externas.

Cada juego vive en `src/games/<id>/`, con reglas, IA y componentes independientes. Registro: `src/games/registry.ts`; navegación: `src/App.tsx`; presentación compartida: `src/shared/GameLayout.tsx` y `src/shared/Overlay.tsx`; estilos: `src/styles.css`, `src/redesign.css` y `src/new-games.css` y `src/expansion.css` (mesas de los juegos añadidos).

Para añadir un juego: respetar los modos y tamaños configurables indicados en AGENTS.md, crear su carpeta, registrar metadatos, añadir importación diferida, guía específica en `src/shared/guides.ts`, modo de observación y comprobar sus reglas. La observación se comparte mediante `ObservationProvider`, `useAutoplay` y `useAI`; las decisiones siguen en cada juego. Los juegos con contrincantes usan `TableRoomProvider`, `useRoomState` para los valores compartidos y `room.machine` para determinar los puestos de IA. `GameLayout` recibe `roomTurn` (actor real desde cero, incluidas fases de recuento o descarte), `roomPlayers` y `privateTable` en fases con información privada. La IA y la resolución temporizada se ejecutan solo en el anfitrión. Documentar y probar fases especiales, reconexión, reinicio y móvil; el ajedrez conserva su protocolo de validación propio. No marcar `ready: true` hasta que sea jugable. Si necesita persistencia, usar claves propias con versión; no compartir partidas entre juegos. IndexedDB permite bases locales grandes. SQLite requeriría WASM o un servicio externo y no es necesario para esta entrega.

Formato común: `pnpm exec prettier --write src tests scripts`.

El contexto de continuidad está en [docs/SUPER_PROMPT.md](docs/SUPER_PROMPT.md), sin listado de juegos concretos. El inventario exportable combina registro efectivo, fechas observadas en Git, archivos y guías de variantes; incluye ideas pendientes. CSV es UTF-8 con separador de punto y coma, compatible con importación en Excel; JSON conserva los datos originales y Markdown proporciona fichas completas o un listado separado. La inspección de fuentes no equivale a una auditoría de reglas ni de cobertura. Las fechas de alta y activación no se presentan como fechas verificadas de despliegue.

## Ajedrez: reglas y límites

chess.js valida movimientos, jaque, mate, ahogado, enroques, captura al paso, promociones y material insuficiente habitual. Nuestra capa distingue las reclamaciones por triple repetición y 50 movimientos de los finales automáticos por cinco repeticiones y 75 movimientos. Se puede reclamar con una jugada prevista sin efectuarla. El mate tiene prioridad sobre la regla de 75 movimientos.

No se presenta como arbitraje completo de un torneo presencial: no hay árbitro, sanciones de conducta, pieza tocada ni reclamaciones ilegales. Las posiciones muertas excepcionales debidas a bloqueos se resuelven por acuerdo; no se demuestra exhaustivamente la imposibilidad de mate en todas las posiciones legales. La comprobación de material en caída de bandera cubre los casos habituales, no toda posición excepcional. [Reglas FIDE](https://handbook.fide.com/chapter/e012023).

Las partidas locales se pausan al cerrar la vista; no se trata de un reloj de torneo resistente a manipulación. Deshacer solo está permitido en práctica sin reloj.

## Multijugador

Todos los juegos con contrincantes ofrecen humano–IA, humanos locales, amigos online y solo IA. En Parchís, Mus, El Diccionario y Colonizadores se pueden combinar varios humanos e IA, eligiendo quién ocupa cada puesto incluso en local. Los ajustes de sala permiten asignar cada puesto a este dispositivo, un amigo online o una IA; el anfitrión ocupa el primero. Los invitados entran con un código o enlace, juegan por turno y esperan a que el anfitrión inicie.

Las mesas compartidas, además del ajedrez, usan PeerJS/WebRTC para sincronizar su estado. El anfitrión mantiene la versión canónica, resuelve las IA y los temporizadores, acepta acciones del puesto activo y distribuye cada cambio en una transacción. Las manos y los formularios se ocultan en la interfaz de quienes no tienen turno. Son salas entre amigos: el estado compartido incluye los secretos y no ofrece protección contra inspección o clientes modificados; no hay servidor de árbitro ni protección competitiva contra trampas.

Nueva partida conserva la sala y sus opciones; el invitado solicita el reinicio y el anfitrión lo ejecuta. Si falta un amigo se detienen las acciones y la IA. Puede volver a entrar en un puesto remoto libre mientras siga abierto el anfitrión; sin cuentas, identidad persistente ni recuperación después de cerrar el anfitrión.

Los puzles individuales (solitarios, sudoku, buscaminas, 2048, mahjong solitario, ahorcado y adivinar la palabra) conservan Jugar y Solo IA, sin competiciones añadidas. Blackjack se conserva como una mesa individual contra una banca que aplica reglas fijas. Mastermind sí permite creador humano y descifrador humano, locales u online. Parejas y Yahtzee conservan también su opción en solitario. Parejas admite 16, 24, 36, 48 y 64 fichas, con símbolos diferentes para cada pareja y tamaño conservado al reiniciar.

Las salas de ajedrez son privadas, sin listado público. PeerJS Cloud proporciona señalización y WebRTC comunica a los navegadores. El anfitrión es blancas y solo entra un rival. Ambos validan jugadas y estado previo. El botón de nueva partida propone una revancha que el rival debe aceptar, sin abandonar la sala. Una desconexión detiene el juego; no hay reconexión persistente, cuentas ni sincronización de relojes. No es un sistema competitivo contra trampas.

Algunas redes necesitan TURN para conectar; el servicio gratuito no garantiza disponibilidad. Salas persistentes, partidas recuperables y relojes de torneo requieren un backend externo: Pages sirve archivos estáticos. [PeerJS](https://peerjs.com/docs/) y [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## Publicación y licencias

`.github/workflows/pages.yml` instala con el lockfile, ejecuta pruebas, compila, comprueba la PWA y despliega `dist` al subir a `main`. Pages debe usar GitHub Actions. No hay secretos en el cliente.

Proyecto GPL-3.0. Stockfish/Stockfish.js: GPLv3 con licencia y fuente correspondiente indicadas en [THIRD_PARTY.md](THIRD_PARTY.md). chess.js: BSD-2-Clause; React, Three.js y PeerJS: MIT; Lucide: ISC. Se utilizan fuentes del sistema, sin solicitudes a Google Fonts.

Web pública: https://alejandropico.github.io/Games/
