# Eurogames, roles y lógica

Esta ampliación activa las entradas pendientes de estas categorías. La ayuda de cada mesa describe exactamente su edición; los nombres genéricos del inventario no se presentan como implementaciones completas de productos comerciales. Las mecánicas y cartas originales se identifican como tales.

## Mesas de estrategia

| Juego                      | Mecánica principal                                | Cierre                    |
| -------------------------- | ------------------------------------------------- | ------------------------- |
| Tierras de Losetas         | Paisajes, adyacencia y regiones propias           | Reserva de losetas        |
| El Mercado de Joyas        | Gemas limitadas, reservas, comodines y descuentos | Prestigio y fin de ronda  |
| La Villa Agrícola          | Colocación de trabajadores y alimentación         | Seis cosechas             |
| Isla de Monstruos          | Dados, energía, ocupación y supervivencia         | Prestigio o eliminación   |
| El Gran Bazar              | Pujas selladas y conjuntos                        | Doce lotes                |
| Diseño de Mosaicos         | Patrones, pared y penalizaciones                  | Cinco rondas              |
| Observatorio de Aves       | Hábitats y motor de recursos                      | Doce rondas               |
| Terraformación Planetaria  | Proyectos, producción y mapa común                | Parámetros o límite       |
| Líneas de Producción       | Cadenas de transformación y pedidos               | Dieciocho rondas          |
| Expedición Arqueológica    | Provisiones, conocimiento y excavación            | Ruinas o límite           |
| El Laberinto Mágico        | Empujes y recorrido de corredores                 | Cinco tesoros o límite    |
| Subasta de Propiedades     | Compras y ventas con elecciones secretas          | Cinco rondas de cada fase |
| El Fabricante de Alfombras | Movimiento, regiones, pagos y coberturas          | Doce rondas               |
| Viaje en el Tiempo         | Rutas, energía, conjuntos y paradojas             | Reliquias o límite        |
| Invasión de Clanes         | Refuerzos y ataques a territorios                 | Dominio o límite          |

## Roles y cartas

| Juego                       | Mecánica y variante                                                  |
| --------------------------- | -------------------------------------------------------------------- |
| Descarte Explosivo          | Robos obligados, desactivación, visores y reinserción                |
| Mineros Saboteadores        | Oficios secretos y túneles giratorios                                |
| Lobo / Aldea                | Variante con dos lobos, vidente y sanador, de seis a ocho puestos    |
| La Resistencia / Avalón     | Base de cinco o seis: Merlín, Asesino, esbirro y leales; sin módulos |
| Guerra de Cartas de Energía | Duelo con fase de respuesta y escudos                                |
| Combates del Espacio        | Naves públicas, órdenes privadas y supervivencia                     |
| Dominio de Reino            | Construcción de mazo y compra única por turno                        |
| Cartas Suicidas             | Riesgo ficticio acumulado y cartas de reducción                      |
| El Estafador de Cartas      | Declaraciones, desafíos y victoria después de responder              |
| Duelo de Cartas en la Corte | Rango conservado, protección e información personal                  |
| Comercio de Alubias         | Mano ordenada, campos y ventas consentidas de precio fijo            |
| El Ladrón de Guante Blanco  | Identidad secreta, alarmas, botín y registros                        |
| Cartas del Purgatorio       | Bazas de premio y castigo con obligación de seguir símbolo           |
| Señores de la Guerra        | Órdenes, influencia, diplomacia y control                            |

La categoría conserva los nombres y etiquetas del inventario; algunas de sus mesas son juegos de cartas con manos privadas, sin reparto de roles. Sus ayudas distinguen ambas situaciones. Las referencias de Avalón y Werewolf proceden de sus editores. Ninguna IA accede a identidades o manos que su papel no autorice conocer. La conversación humana se realiza fuera de los formularios de turno: no se simula diálogo mediante un servicio lingüístico.

## Puzles individuales

| Puzle               | Opciones y límites                                                  |
| ------------------- | ------------------------------------------------------------------- |
| Nonogramas          | 5×5, 8×8, 10×10; generación con unicidad verificada                 |
| Crucigramas         | Tres diseños artesanales, marcos 9×9 y 11×11                        |
| Bloques Deslizantes | Ocho o quince bloques, búsqueda IDA\* con presupuesto               |
| Tuberías            | 4×4, 6×6, 8×8; rotación, ausencia de fugas y conectividad           |
| Kakuro              | Paneles de entrenamiento 2×2 en marcos 7×7 y 10×10                  |
| Lights Out          | 3×3, 5×5, 7×7; mezcla resoluble y eliminación binaria               |
| Hashiwokakero       | Retículas de islas 3×3 y 5×5; se aceptan redes alternativas válidas |
| Laberintos          | 9×9, 15×15, 21×21; corredores siempre conectados                    |

Los puzles conservan Jugar y Solo IA, sin competición añadida. Los tableros no guardan una respuesta secreta de generación; las búsquedas usan las pistas públicas. El crucigrama usa el vocabulario de sus propias definiciones. Las búsquedas de bloques y tuberías tienen límites explícitos: que el motor se detenga no significa que una posición manual sea imposible.

## Arquitectura y verificación

Cada carpeta tiene `Game.tsx`, `rules.ts` y `worker.ts`. `StrategyTable` comparte solo presentación, privacidad y ciclo de turno; `LogicTable` comparte herramientas y tablero. Las reglas permanecen independientes. `tableUtils` proporciona copia, barajado, elección aleatoria y comparación de puntuaciones, sin mecánicas específicas.

`collectionIds` registra la tanda y dirige sus fichas a escenas propias ya presentes en `IdeaArt`. `collectionGuides` contiene los reglamentos y referencias. El inventario descubre componentes, Workers, guías y pruebas desde archivos e historial reales.

Los juegos adversariales usan salas de amigos y puestos humanos o IA, incluidos turnos intermedios de voto, defensa y aceptación. El transporte admite hasta ocho puestos con un límite compartido en validación y PeerJS. Clientes antiguos deben actualizarse antes de entrar en una mesa ampliada. La privacidad es de interfaz entre amigos: el estado transmitido continúa sin protección frente a inspección de un cliente modificado.

Las pruebas cubren partidas automáticas completas con cada número de participantes, serialización sin pérdida, acciones inválidas, inmutabilidad, fases críticas y partidas completas a través de `TableStore` con puestos locales, remotos e IA. También prueban generaciones y solucionadores en cada tamaño, criterios de victoria independientes y la diversidad estructural de las ilustraciones. La verificación visual y la prueba de conexión real complementan, pero no sustituyen, estas comprobaciones.
