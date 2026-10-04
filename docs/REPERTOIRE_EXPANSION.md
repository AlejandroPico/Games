# Ampliación del repertorio

Cada nueva ficha tiene una mesa jugable, reglas independientes, ayuda específica y reinicio con los mismos ajustes. Las mesas con contrincantes ofrecen humanos locales, humano–IA, observación y salas con amigos; los puzles individuales mantienen su naturaleza individual. Las decisiones automáticas online se ejecutan únicamente en el anfitrión.

| Mesa                      | Edición implementada                                                                                                   | Configuración                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Damas Chinas              | Estrella de 121 agujeros, diez canicas, cadenas de saltos, regla contra bloqueo y tablas documentadas                  | 2, 3, 4 o 6 puestos                           |
| Chaturanga                | Recreación para dos bandos: elefante de salto doble diagonal, consejero corto, jaque/mate y tablas modernas explícitas | 2 puestos; heurística en Worker               |
| Patolli                   | Reconstrucción propia, cruz de 52 pasos, seis piedras, cinco frijoles, captura y llegada exacta; sin apuestas          | 2–4 puestos                                   |
| Rutas de Vapor            | Adaptación original de cartas de colores, vías, trenes y contratos privados, con mapa propio                           | 2–4 puestos                                   |
| Draft de Maravillas       | Adaptación original de tres eras, selección privada, paso de manos, producción, ciencia y conflictos vecinos           | 3–4 puestos                                   |
| Reserva de Naturaleza     | Adaptación original con fila de acciones de fuerza variable, hábitats, animales e investigación/conservación           | 2–4 puestos                                   |
| Construcción de Castillos | Adaptación original de dominio hexagonal, depósitos, dados, reserva y trabajadores                                     | 2–4 puestos; diez rondas                      |
| Escoba                    | Baraja española, quince, escobas iniciales, último capturador y setenta simplificada por sietes; puestos individuales  | 2–4 puestos; objetivo 11 o 21                 |
| Cinquillo                 | Baraja española completa, cinco de oros inicial, series sin huecos y paso solo sin jugada                              | 2–4 puestos                                   |
| Belote                    | Parejas, contrato en dos vueltas, asistencia/corte/subida, capot y belote-rebelote; sin otros anuncios                 | 4 puestos; 501 puntos; giro horario           |
| Fútbol de mesa con cartas | Duelo original de ataque y respuesta defensiva, dado, avance y posesión                                                | 2 puestos; tres goles o veinte ataques        |
| Buscaminas Hexagonal      | Seis vecinos, primer clic y vecinos seguros, banderas, inundación y deducción visible                                  | Individual; 7/9/12/16; tres densidades        |
| Torres de Hanói           | Tres torres, movimiento del disco superior y solucionador desde cualquier posición legal                               | Individual; 3–10 discos                       |
| Sopa de Letras Dinámica   | Generación temática, ocho direcciones, extremos o trazado; lista limitada a palabras insertadas                        | Individual; 8/10/12/16                        |
| Inu                       | Deducción de posiciones: variante original mientras no se identifique un reglamento verificable                        | 2 puestos; 4/6/8; humano busca u oculta       |
| Mensajes Cruzados         | Variante original de pistas, códigos, respuesta e intercepción; vocabulario automático limitado                        | 4 puestos; equipos; ocho mensajes como máximo |
| Santorini                 | Modalidad base de dos, trabajadores, subida máxima de uno, construcción, cúpulas y victoria en el tercero              | 2 puestos; sin poderes                        |

Los nombres descriptivos de eurogames se conservan, pero su ayuda identifica las adaptaciones originales. No son copias completas de reglamentos comerciales. Las reconstrucciones históricas tampoco se presentan como una edición única y definitiva. Inu queda identificado como variante propia hasta disponer del reglamento concreto.

## Arquitectura y comprobación

Cada mesa tiene `src/games/<id>/rules.ts` y `Game.tsx`. `src/shared/useMatch.tsx` comparte ciclo de vida, asientos y temporización, sin reglas entre juegos. `PrivateHand.tsx` aporta una cortina para relevo local; `GameLayout.privateTable` oculta la mesa a participantes online inactivos. Las ilustraciones SVG propias están en `RepertoireArt.tsx`, la distribución en `repertoire.css` y las ayudas en `repertoireGuides.ts`, incorporadas al mapa de guías e inventario.

El transporte admite hasta seis puestos. Las versiones anteriores a esta ampliación deben actualizarse para entrar en una sala de seis. Los clientes deben usar la misma versión de la web.

`tests/repertoire-expansion.test.ts` cubre reglas especiales, conservación, finales automáticos, generación, deducción sin acceso a secretos y sincronización de actores/fases. `tests/table-peer.test.ts` comprueba cinco invitados en una sala de seis, además de las pruebas previas de reconexión y reinicio. Se conservan todas las pruebas anteriores.

Las IA son heurísticas o solucionadores específicos. El buscaminas puede exigir adivinación; el generador no garantiza solución sin riesgo. La IA de mensajes reconoce su vocabulario propio y asociaciones del historial, pero no todas las pistas libres humanas. Las canicas pueden alcanzar tablas por repetición o límite.

La privacidad se aplica en la interfaz. El estado completo se sincroniza entre navegadores amistosos y no es protección antitrampas frente a inspección técnica del cliente. La conectividad depende de PeerJS/WebRTC y las restricciones de red existentes; no se añade un servidor de partidas ni almacenamiento en GitHub.
