# Repertorio, ayudas y observación

Todas las mesas jugables ofrecen **Solo inteligencia artificial** en el menú inicial. En tableros y cartas controla a todos los participantes; en solitarios mueve o resuelve sin intervención. Pausa cancela acciones pendientes y velocidad regula el intervalo entre decisiones. Los cálculos pesados se hacen en Workers. Nueva partida conserva la configuración y el modo; Ajustes permite volver a elegir. Cada guía explica la variante que realmente aplica esta mesa.

## Palabras y conexiones

- **Ahorcado**: palabras originales del vocabulario local, alfabeto con Ñ y seis u ocho fallos. La IA usa las letras reveladas y las descartadas.
- **Adivina la Palabra**: cinco letras, seis intentos y contabilización exacta de letras repetidas. El vocabulario admitido es consultable. La IA filtra candidatos solo con resultados de intentos previos.
- **Palabras Encadenadas**: coincidencia de la última sílaba con la primera, sin repetir palabras. El banco incluye separación silábica y sugerencias legales. No es un diccionario general del español.
- **Basta / Tutti Frutti**: dos participantes, cinco rondas, nombre, animal, país y color. Turnos individuales de sesenta segundos. Valida contra listas locales visibles; diez puntos por respuesta única y cinco por repetida. No arbitra vocabulario libre ni rondas simultáneas en red.
- **El Diccionario**: dos a cuatro participantes, cinco rondas, definiciones originales, autoría oculta durante la votación y puntuación por aciertos y engaños. Las definiciones idénticas se agrupan; nadie vota su propia definición falsa. La IA tiene conocimiento léxico limitado, no consulta un servicio generativo.
- **CruzaPalabras**: juego propio inspirado en colocación de letras, tablero de nueve por nueve, siete letras por mano, multiplicadores y validación de todas las palabras y cruces. Permite arrastrar letras. El vocabulario es pequeño y está disponible en la mesa; no es Scrabble oficial. Cuatro pases o cambios consecutivos terminan la partida; también termina al vaciar la bolsa y una mano. El reparto inicial garantiza una palabra corta construible.
- **Cajas / Timbiriche**: cierre de cuadrados, punto por caja y turno extra al completar una o dos cajas.
- **Gomoku**: quince por quince, cinco o más contiguas; apertura libre, sin reglas Renju ni Swap2.
- **Conecta 5 / Pente**: diecinueve por diecinueve, cinco o más contiguas o cinco parejas capturadas. Captura solo el patrón propia–rival–rival–propia cerrado por la colocación actual. Apertura libre sin restricciones de torneo.
- **Hex**: siete, nueve u once por lado, vecinos por seis lados y cambio de bandos tras la primera jugada. El cambio conserva la piedra y cambia quién controla cada color.
- **Brotes sobre cuadrícula**: variante digital de Sprouts con rutas ortogonales en una cuadrícula finita. Elige extremos, revisa la ruta y confirma. No hay cruces ni paso por puntos ajenos; grado máximo tres, cada ruta agrega un punto de grado dos. Los lazos consumen dos conexiones. Las restricciones geométricas son distintas del juego original de curvas continuas.

## Tradicional y eurogame

**Backgammon** incluye apertura por dados individuales, máximos dados utilizables, prioridad del mayor si solo puede jugarse uno, dobles, barra, golpes, retirada exacta y por exceso desde el punto más alejado, gammon, backgammon y cubo hasta sesenta y cuatro. Se juega una partida independiente, sin Crawford ni reglas de match. Clic o arrastre de ficha, con selección de dado cuando hay alternativas. La IA evalúa turnos legales completos.

**Colonizadores** es una variante inicial propia inspirada en CATAN para tres o cuatro participantes y victoria a ocho puntos. Incluye preparación en serpiente, recursos del segundo poblado, producción, banco limitado, descarte al sacar siete, ladrón y robo aleatorio, banco cuatro a uno, caminos, poblados, ciudades y ruta más larga con interrupciones rivales y empates. Recursos e inventarios públicos. Sin cartas de desarrollo, mayor ejército, puertos ni comercio privado entre jugadores. La distribución de números es aleatoria y no impide seis y ocho vecinos. No es una implementación oficial ni completa de CATAN.

## Alcance de las IA

El ajedrez usa Stockfish para ambos colores. El resto usa búsquedas limitadas o heurísticas propias. Las IA de palabras y deducción no reciben el secreto para decidir; los solitarios evitan ciclos con posiciones públicas y pueden detenerse sin resolver. Ese alto no demuestra que la partida sea imposible. Buscaminas puede arriesgar una casilla y perder cuando las pistas no bastan. En Go, la observación cierra el recuento conservando piedras presentes; no decide automáticamente disputas de vida y muerte. Los límites previos de Xiangqi, Shogi y arbitraje de ajedrez siguen documentados en las ayudas y en EXPANSION.md.

La aplicación funciona sin conexión después de completar su descarga inicial. Las referencias externas de las ayudas requieren Internet. No se añaden cuentas, partidas en GitHub ni multijugador en red a los juegos nuevos.
