# Código de terceros

Games se distribuye bajo GPL-3.0. Se conserva LICENSE en la raíz.

## Stockfish 19 / Stockfish.js

- Paquete exacto: stockfish 19.0.0.
- Autor de la adaptación: Nathan Rugg / Chess.com; motor original: equipo Stockfish.
- Licencia: GPLv3, copiada a public/engine/COPYING.txt durante la compilación.
- Revisión fuente del paquete npm: 54fde71d90c7c403964f6cacef48f7bbec495df1.
- Fuente completa correspondiente y herramientas de compilación: https://github.com/nmrugg/stockfish.js/tree/54fde71d90c7c403964f6cacef48f7bbec495df1
- Archivo fuente descargable: https://github.com/nmrugg/stockfish.js/archive/54fde71d90c7c403964f6cacef48f7bbec495df1.tar.gz
- Las instrucciones de compilación están en el README de esa revisión. El JavaScript y WebAssembly Lite Single se distribuyen sin modificaciones como Worker separado.

## Otras bibliotecas

- chess.js 1.4.0: BSD-2-Clause, https://github.com/jhlywa/chess.js
- React y React DOM: MIT, https://github.com/facebook/react
- Three.js: MIT, https://github.com/mrdoob/three.js
- PeerJS: MIT, https://github.com/peers/peerjs
- Lucide: ISC, https://github.com/lucide-icons/lucide
  La interfaz utiliza fuentes del sistema y no descarga fuentes externas.

Los textos completos de las dependencias están en sus paquetes bloqueados por pnpm-lock.yaml. No se modifican los motores de terceros.
