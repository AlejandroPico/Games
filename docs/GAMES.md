# Los diez juegos añadidos

Todos están disponibles, con menú propio, instrucciones, interfaz adaptable y temas día/noche.

| Idea aplicada | Categoría          | Modos y ayudas                                  | Variante                                                       |
| ------------- | ------------------ | ----------------------------------------------- | -------------------------------------------------------------- |
| Tres en raya  | Clásicos / Familia | IA sin derrotas con juego óptimo, dos jugadores | Tablero 3×3                                                    |
| Reversi       | Estrategia         | IA en Worker, dos jugadores                     | 8×8, pasos automáticos                                         |
| Damas         | Estrategia         | IA en Worker, dos jugadores                     | Inglesas, capturas obligatorias y múltiples                    |
| Mancala       | Tradicionales      | IA en Worker, dos jugadores                     | Kalah de seis cuencos, cuatro semillas                         |
| Batalla naval | Deducción          | Rival IA que solo usa disparos conocidos        | Cinco barcos; colocación aleatoria                             |
| Solitario     | Cartas             | Pistas y deshacer                               | Klondike, robo de una o tres, reciclado ilimitado              |
| Buscaminas    | Lógica             | Pistas deductivas y tres tamaños                | Primer clic y entorno seguros, banderas y apertura por números |
| Sudoku        | Lógica             | Pistas, notas y deshacer                        | Tableros generados con solución única, tres densidades         |
| 2048          | Puzles             | Sugerencias, deshacer, teclado y gestos         | Fusiones únicas por jugada, continuar después de 2048          |
| Parejas       | Memoria / Familia  | Solo, IA con memoria visible, dos jugadores     | Ocho parejas; repetir al acertar                               |

El ajedrez y Conecta 4 se mantienen. Total: **12 juegos disponibles**. Go y Parchís siguen marcados como próximos.

Las partidas de los diez juegos nuevos duran mientras está abierta su vista. No tienen guardado de progreso ni salas en línea; esos servicios se pueden añadir por juego. El ajedrez conserva su guardado y sus salas privadas.

## Organización

Cada juego conserva sus reglas, su componente y su Worker (si lo necesita) en su propia carpeta. GameLayout y useAI solo comparten presentación y gestión de Workers, no reglas ni datos entre juegos. El catálogo se amplía en registry.ts y las importaciones diferidas en App.tsx.

## Comprobaciones de esta entrega

- Pruebas de los doce motores de reglas, incluyendo todas las respuestas humanas frente a la IA de tres en raya.
- Inicio de los diez juegos nuevos y jugadas reales verificadas en el navegador.
- Respuestas de IA comprobadas en Reversi, Damas, Mancala y Batalla naval.
- Los doce menús comprobados en móvil de 390×844, modo noche, sin desbordamiento horizontal.
- Ajedrez: Stockfish respondió y una sala real sincronizó e4/e5 entre dos pestañas con el servicio PeerJS.
- La primera entrega se desplegó correctamente con GitHub Actions; la ampliación utiliza el mismo flujo.
