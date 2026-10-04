# Deducción, dados y abstractos

Las fichas de estas categorías disponen de una mesa jugable. Las ayudas describen preparación, acciones, ejemplos, puntuación, final y límites de la IA. Las ideas con nombres genéricos tienen reglas originales de Games; no se presentan como reproducciones completas de productos comerciales.

## Dados

| Ficha                     | Edición jugable                                                                                                  | Puestos |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------- |
| Perudo                    | Cinco dados, unos comodines, conversiones, Dudo, palifico una vez; sin calza opcional                            | 2–6     |
| Farkle                    | Unos/cincos, tríos y duplicación por adicionales, escalera y tres parejas; entrada 500 y vuelta final igual      | 2–4     |
| Dados Zombie              | Bolsa verde/amarilla/roja, huellas, disparos, reciclado y vuelta final                                           | 2–4     |
| Liar’s Dice Estilo Casino | Variante original de categorías de póker sobre manos individuales; cinco vidas y sin relanzamiento durante ronda | 2–6     |
| Craps                     | Núcleo Pass Line, salida y punto; sin otras apuestas de casino                                                   | 2–4     |
| Sichuan Dice              | Variante original de cierre de números 1–9; no se identificó reglamento verificable para ese nombre              | 2–4     |
| Crown and Anchor          | Tres símbolos y ganancia neta de créditos ficticios                                                              | 2–4     |
| Pig                       | Acumulado, pérdida con uno y victoria inmediata al conservar el objetivo                                         | 2–4     |
| Bunco                     | Una mesa, dos equipos fijos y seis rondas; sin evento social de tres mesas                                       | 4       |
| Cee-lo                    | Torneo sin banca, hasta tres intentos; empates de ronda no puntúan                                               | 2–4     |
| Hazard                    | Main 5–9, resultados iniciales y chance; sin apuestas secundarias                                                | 2–4     |

Todos los puntos y créditos son ficticios. No hay compras, depósitos, pagos, premios monetarios o conversión económica. `Math.random` genera las tiradas, sin garantías de azar regulado. La IA no controla sus resultados.

## Deducción

| Ficha                    | Edición jugable                                                                                | Puestos |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ------- |
| El Asesino de la Mansión | Caso original con reparto, refutación privada y acusación; sin desplazamiento por habitaciones | 3–6     |
| Código de Redes          | Palabras y relaciones propias, capitanes e intérpretes, mapa, neutral y peligro                | 4       |
| Pistas Abstractas        | Ilustraciones propias, narrador, aportaciones ocultas, mezcla y votación                       | 3–6     |
| Deducción Alquímica      | Seis ingredientes y tres signos, experimentos públicos y demostraciones                        | 2–4     |
| Adivina Quién            | Veinticuatro retratos propios, preguntas veraces y descarte; identificar mal pierde            | 2       |
| Línea de Tiempo          | Mazo propio de aviación, espacio y Web, con años contrastados                                  | 2–6     |
| El Intruso               | Ocho lugares originales, preguntas binarias, respuestas y votos privados                       | 3–6     |

La IA de información incompleta decide con su mano y pistas públicas. El motor accede a la solución para arbitrar, pero esa facultad no se usa para elegir preguntas. Un capitán conoce su mapa y un narrador su carta, como corresponde a su papel; el intérprete no utiliza el mapa oculto. La IA semántica es una heurística acotada, puede equivocarse y no comprende todas las metáforas. La IA cronológica conoce los años públicos del conjunto, como una persona que recuerda esos acontecimientos.

Las salas son entre amigos: su estado incluye los secretos aunque la interfaz los oculta a quien no tiene turno. No se protege frente a inspección del cliente. Las cortinas locales evitan mostrar la mano siguiente sin una entrega de pantalla.

## Abstractos

| Ficha                   | Edición jugable                                                                                                                | Puestos |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------- |
| Construcción de Colchas | Adaptación original con retales de polióminos, mercado, precio, tiempo e ingresos; sin retales comerciales, cuero o premio 7×7 | 2       |
| La Colmena              | Cinco insectos base, reina antes del cuarto turno, una colmena, puertas, alturas y movimientos específicos; sin expansiones    | 2       |
| Ventanas de Catedral    | Adaptación original de draft serpentino, patrón propio y objetivos públicos; sin herramientas o favores                        | 2–4     |
| Bloques Geométricos     | Adaptación original con 21 polióminos libres, giros/reflejos y contacto por esquinas; cobertura sin bonificaciones comerciales | 2–4     |
| Quoridor                | Dos participantes, 9×9, diez vallas, saltos, diagonales y caminos siempre abiertos                                             | 2       |
| Onitama                 | Dieciséis patrones, intercambio, maestro y templo; J1 siempre empieza                                                          | 2       |
| YINSH                   | 85 intersecciones, cinco anillos, 51 marcadores, inversión, filas y retirada de tres anillos                                   | 2       |
| DVONN                   | 49 casillas, tres núcleos y 23 fichas por color; altura exacta, bloqueo y purga por desconexión                                | 2       |

Las mesas de movimiento permiten clic y arrastre; las de colocación ofrecen pieza, orientación, previsualización cuando corresponde y destinos legales. Los tableros personales muestran la mesa del actor; los marcadores proporcionan contexto público del rival. Las ayudas identifican límites recreativos y repeticiones para evitar sesiones interminables. La IA es heurística, puede repetir patrones o perder y no promete fuerza profesional. Sus cálculos y los del laboratorio de deducción se realizan en Workers cancelables.

## Arquitectura y comprobación

Cada ficha conserva `src/games/<id>/rules.ts` y `Game.tsx`, con reglas independientes. `DiceTable`, `DeductionTable` y `AbstractTable` comparten presentación y ciclo de vida, sin puntuaciones ni decisiones de reglas. `useMatch` conserva modos, puestos y ritmo. Las salas reciben el actor real durante refutaciones, respuestas, votaciones y retiradas de filas. Reiniciar conserva la configuración.

`categoryCompletion.ts` activa fichas y corrige metadatos del catálogo efectivo. `categoryGuides.ts` se integra en ayuda e inventario. El arte y los retratos son SVG propios, sin imágenes de productos. Las pruebas cubren reglas concretas, fases, deducción sin usar la solución, finales automáticos, registro y sincronización del actor. Deben pasar también las suites previas, compilación y PWA antes de publicar. Esto no equivale a auditar todas las posiciones posibles ni a arbitraje de torneo.
