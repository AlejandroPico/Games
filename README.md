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
- Aplicación PWA instalable y preparada para jugar sin conexión tras completar la primera descarga. Salas de ajedrez requieren Internet.
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

La preparación copia el motor de un hilo y su licencia a `public/engine`, además del favicon. El motor pesa aproximadamente 1.8 MB y no necesita encabezados de aislamiento. Las rutas por fragmentos admiten visitas directas bajo `/Games/`.

La compilación genera un Service Worker con una versión basada en el contenido y precarga recursos propios, incluidos todos los juegos y el motor. Requiere completar la descarga inicial y disponer de almacenamiento del navegador. Las actualizaciones esperan al cierre de las pestañas existentes para evitar sustituir recursos durante una partida. `check:pwa` sirve la compilación bajo `/Games/`, ejecuta el Service Worker generado y verifica instalación, limpieza de versiones antiguas y navegación/recursos sin conexión. Android puede instalarla desde el navegador; no se ha comprobado la instalación en un teléfono físico.

## Estructura y colaboración

Cada juego vive en `src/games/<id>/`, con reglas, IA y componentes independientes. Registro: `src/games/registry.ts`; navegación: `src/App.tsx`; presentación compartida: `src/shared/GameLayout.tsx` y `src/shared/Overlay.tsx`; estilos: `src/styles.css`, `src/redesign.css` y `src/new-games.css` y `src/expansion.css` (mesas de los juegos añadidos).

Para añadir un juego: crear su carpeta, registrar metadatos, añadir importación diferida, guía específica en `src/shared/guides.ts`, modo de observación y comprobar sus reglas. La observación se comparte mediante `ObservationProvider`, `useAutoplay` y `useAI`; las decisiones siguen en cada juego. No marcar `ready: true` hasta que sea jugable. Si necesita persistencia, usar claves propias con versión; no compartir partidas entre juegos. IndexedDB permite bases locales grandes. SQLite requeriría WASM o un servicio externo y no es necesario para esta entrega.

Formato común: `pnpm exec prettier --write src tests scripts`.

## Ajedrez: reglas y límites

chess.js valida movimientos, jaque, mate, ahogado, enroques, captura al paso, promociones y material insuficiente habitual. Nuestra capa distingue las reclamaciones por triple repetición y 50 movimientos de los finales automáticos por cinco repeticiones y 75 movimientos. Se puede reclamar con una jugada prevista sin efectuarla. El mate tiene prioridad sobre la regla de 75 movimientos.

No se presenta como arbitraje completo de un torneo presencial: no hay árbitro, sanciones de conducta, pieza tocada ni reclamaciones ilegales. Las posiciones muertas excepcionales debidas a bloqueos se resuelven por acuerdo; no se demuestra exhaustivamente la imposibilidad de mate en todas las posiciones legales. La comprobación de material en caída de bandera cubre los casos habituales, no toda posición excepcional. [Reglas FIDE](https://handbook.fide.com/chapter/e012023).

Las partidas locales se pausan al cerrar la vista; no se trata de un reloj de torneo resistente a manipulación. Deshacer solo está permitido en práctica sin reloj.

## Multijugador

Las salas de ajedrez son privadas, sin listado público. PeerJS Cloud proporciona señalización y WebRTC comunica a los navegadores. El anfitrión es blancas y solo entra un rival. Ambos validan jugadas y estado previo. El botón de nueva partida propone una revancha que el rival debe aceptar, sin abandonar la sala. Una desconexión detiene el juego; no hay reconexión persistente, cuentas ni sincronización de relojes. No es un sistema competitivo contra trampas.

Algunas redes necesitan TURN para conectar; el servicio gratuito no garantiza disponibilidad. Salas persistentes, partidas recuperables y relojes de torneo requieren un backend externo: Pages sirve archivos estáticos. [PeerJS](https://peerjs.com/docs/) y [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## Publicación y licencias

`.github/workflows/pages.yml` instala con el lockfile, ejecuta pruebas, compila, comprueba la PWA y despliega `dist` al subir a `main`. Pages debe usar GitHub Actions. No hay secretos en el cliente.

Proyecto GPL-3.0. Stockfish/Stockfish.js: GPLv3 con licencia y fuente correspondiente indicadas en [THIRD_PARTY.md](THIRD_PARTY.md). chess.js: BSD-2-Clause; React, Three.js y PeerJS: MIT; Lucide: ISC. Se utilizan fuentes del sistema, sin solicitudes a Google Fonts.

Web pública: https://alejandropico.github.io/Games/
