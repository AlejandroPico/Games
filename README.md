# Games
Una colección de juegos de mesa para jugar en el navegador. React + TypeScript + Three.js. Sitio estático compatible con GitHub Pages, sin claves ni servidor propio.

## Primera entrega
- Catálogo con búsqueda, categorías, filtro de disponibilidad y temas día/noche.
- Ajedrez con tablero 3D real y alternativa 2D accesible.
- Stockfish 19 Lite Single: cuatro dificultades, cálculo en un Web Worker.
- Dos jugadores locales y salas privadas con códigos a través de PeerJS.
- Relojes 3+2, 5+3, 10+5 y 15+10; práctica sin reloj con deshacer.
- Guardado de partidas locales, reanudación, importación y exportación PGN.
- Conecta 4 con IA en un Worker, tres dificultades y juego local.

## Desarrollo
Requiere Node 24 y pnpm 11.25.0.

```sh
pnpm install
node scripts/prepare-engine.mjs
pnpm dev
pnpm test
pnpm build
pnpm preview
```

La primera preparación copia únicamente el motor de un hilo y su licencia a public/engine. El motor pesa aproximadamente 1.8 MB; no necesita encabezados de aislamiento, que Pages no permite configurar. Las rutas usan fragmentos para que las visitas directas funcionen bajo /Games/.

## Estructura y colaboración
Cada juego vive en src/games/<id>/. Sus reglas, IA, componentes y pruebas deben permanecer independientes. El catálogo está en src/games/registry.ts y la navegación general en src/App.tsx. La apariencia compartida está en src/styles.css.

Para añadir un juego: crear su carpeta, registrar sus metadatos, añadir una ruta con importación diferida y cubrir sus reglas con pruebas. No marcar ready: true hasta que sea jugable. Si un juego necesita persistencia, usar una clave con nombre y versión propios; no compartir estado con otros juegos. IndexedDB sería la opción para bases locales grandes. SQLite requiere WASM o un servicio externo; no aporta nada al estado pequeño de esta entrega.

## Ajedrez: reglas y límites
chess.js valida movimientos, jaque, mate, ahogado, enroques, captura al paso, promociones y material insuficiente habitual. Nuestra capa distingue las reclamaciones por triple repetición y 50 movimientos de los finales automáticos por cinco repeticiones y 75 movimientos. Se puede reclamar con una jugada prevista sin efectuarla. El mate tiene prioridad sobre la regla de 75 movimientos.

No se presenta como arbitraje completo de un torneo presencial: no hay árbitro, sanciones de conducta, pieza tocada ni reclamaciones ilegales. Las posiciones muertas excepcionales debidas a bloqueos se resuelven por acuerdo; no se demuestra exhaustivamente la imposibilidad de mate en todas las posiciones legales. La comprobación de material en caída de bandera cubre los casos habituales, no toda posición excepcional. Fuente: https://handbook.fide.com/chapter/e012023

Las partidas locales se pausan al cerrar la vista; no se trata de un reloj de torneo resistente a manipulación. Deshacer solo está permitido en práctica sin reloj.

## Multijugador
Las salas son privadas, sin listado público. PeerJS Cloud proporciona señalización y WebRTC comunica a los dos navegadores. El anfitrión es blancas; solo entra un rival. Ambos validan las jugadas y el estado previo. Una desconexión detiene el juego; no hay reconexión persistente, cuentas ni sincronización de relojes. No es un sistema competitivo contra trampas.

Algunas redes necesitan un servidor TURN para conectar; el servicio gratuito no garantiza disponibilidad. Un listado persistente de salas, partidas recuperables y relojes de torneo necesita un backend externo: GitHub Pages solo sirve archivos estáticos. Referencias: https://peerjs.com/docs/ y https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

## Publicación
.github/workflows/pages.yml instala dependencias con el lockfile, ejecuta las pruebas, compila y despliega dist al hacer push a main. Configurar Settings → Pages → Source: GitHub Actions. No hay secretos en el cliente.

## Licencias
El proyecto se distribuye bajo GPL-3.0. Stockfish 19/Stockfish.js es GPLv3; se incluye COPYING con el motor. Fuente y compilación: https://github.com/nmrugg/stockfish.js (versión del paquete stockfish: 19.0.0).
chess.js: BSD-2-Clause. React, Three.js, PeerJS y Lucide: MIT. Las fuentes Google Fonts son externas; existen alternativas locales. La aplicación funciona sin ellas.

## Próxima ampliación autorizada
Diez juegos: tres en raya, reversi, damas, mancala, batalla naval, solitario, buscaminas, sudoku, 2048 y parejas de memoria. Go y Parchís quedan en la hoja de ruta.

