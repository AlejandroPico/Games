/** These guides describe exactly the playable edition, including intentional adaptations. */
export const repertoireGuides: Record<string, [string, string][]> = {
  "damas-chinas": [
    [
      "Preparación y objetivo",
      "La estrella tiene 121 agujeros y cada participante empieza con diez canicas en un triángulo. Elige dos, tres, cuatro o seis puestos. Cada uno debe trasladar sus canicas al triángulo opuesto; las canicas nunca se capturan. Los colores identifican a los participantes, no a los equipos.",
    ],
    [
      "Pasos y saltos",
      "Selecciona o arrastra una canica propia. Puedes dar un paso a un agujero vecino vacío o saltar por encima de una canica de cualquier color a un agujero vacío inmediatamente detrás, siguiendo una de las seis direcciones. Un turno puede encadenar varios saltos cambiando de dirección. La mesa destaca todos los destinos alcanzables; elegir uno completa automáticamente la cadena, sin retirar ninguna canica. No se combina un paso con saltos.",
    ],
    [
      "Ejemplo y restricciones",
      "Si una canica vecina tiene detrás un hueco libre, puedes saltarla. Desde ese hueco puedes repetir el proceso con otra canica, aunque pertenezca a un rival. Puedes detenerte tras cualquier salto. En esta variante una canica que ya entró en su triángulo de destino no puede salir de él: evita retrocesos innecesarios. Un destino ocupado nunca es válido.",
    ],
    [
      "Final y bloqueo",
      "Para impedir que un rival bloquee tu llegada estacionándose en tu meta, esta edición reconoce la victoria cuando el triángulo de destino está lleno y contiene al menos una canica tuya; las piezas rivales que permanecen allí cuentan como espacios completados. Solo puedes pasar si no hay movimientos. Tres repeticiones de la misma posición y turno, o 600 turnos, producen tablas. La IA prioriza avanzar y evitar posiciones repetidas; no garantiza una estrategia óptima.",
    ],
  ],
  chaturanga: [
    [
      "Qué edición estás jugando",
      "Chaturanga reúne reconstrucciones históricas diferentes. Esta mesa ofrece una recreación para dos bandos con movimientos cercanos al ajedrez antiguo y al shatranj; no afirma resolver todas las variantes históricas. Se usa un tablero de ocho por ocho, con ocho soldados delante de dos carros, dos caballos, dos elefantes, consejero y rey. J1 empieza.",
    ],
    [
      "Movimiento de cada pieza",
      "Carro: cualquier distancia por filas o columnas, sin atravesar piezas. Caballo: salto en L como en el ajedrez moderno. Elefante: salta exactamente dos casillas en diagonal, incluso si la casilla intermedia está ocupada. Consejero: una casilla diagonal. Rey: una casilla en cualquier dirección. Soldado: un paso recto hacia delante si está libre; captura un paso diagonal hacia delante. No existe avance doble, captura al paso ni enroque. Al alcanzar la última fila un soldado se convierte en consejero.",
    ],
    [
      "Jaque y victoria",
      "No puedes dejar a tu rey atacado. La aplicación solo permite movimientos que mantengan a salvo al rey y no permite capturarlo. Si el rival está en jaque y no tiene respuesta legal, gana quien dio mate. Si no tiene movimiento pero tampoco está en jaque, hay tablas en esta recreación. Dos reyes solos, tres repeticiones o cien medias jugadas sin mover un soldado ni capturar también producen tablas; son medidas modernas para terminar la sesión, no atribuciones históricas.",
    ],
    [
      "Cómo empezar",
      "Selecciona o arrastra una pieza; los puntos muestran sus destinos legales. No confundas el símbolo del elefante con un alfil moderno: no recorre diagonales largas. Un consejero tampoco es una dama moderna. La IA compara capturas, seguridad y jaques con una heurística ligera; sirve para practicar esta variante y no tiene la fuerza del motor de ajedrez de Games.",
    ],
  ],
  patolli: [
    [
      "Reconstrucción recreativa",
      "Las reglas históricas conservadas del Patolli no forman un reglamento único. Games ofrece una reconstrucción recreativa explícita, sin apuestas ni monedas reales: de dos a cuatro participantes, seis piedras por persona, recorrido de 52 casillas alrededor de una cruz y cinco frijoles de dos caras. Todos recorren el circuito en el mismo sentido desde entradas separadas.",
    ],
    [
      "Lanzar y entrar",
      "Pulsa Lanzar frijoles. Cada cara marcada cuenta uno; cinco caras marcadas cuentan diez. Cero pierde el turno. Para entrar una piedra que todavía está fuera necesitas exactamente uno y una entrada libre de tus propias piedras. Entrar coloca la piedra en el inicio, sin avance adicional. Si la tirada no permite ninguna jugada, el turno pasa automáticamente.",
    ],
    [
      "Mover y capturar",
      "Escoge una piedra entre las opciones habilitadas. Avanza todo el valor de la tirada y no puedes caer sobre una piedra propia. Puedes pasar por encima de otras. Caer en una piedra rival la devuelve a su reserva, salvo en las cuatro entradas protegidas, donde los colores pueden compartir casilla. El panel muestra el progreso personal: 0 es la entrada, 52 la llegada. Cada piedra requiere una tirada exacta para terminar; si te pasas, debes elegir otra piedra o perder el turno si ninguna puede moverse.",
    ],
    [
      "Ejemplo y final",
      "Una piedra en 49 puede acabar con tres, pero no con cuatro. Una fuera solo entra con uno. Gana quien complete primero las seis piedras. Los frijoles son aleatorios para humanos e IA por igual; la IA elige entre movimientos legales y suele avanzar las piedras más adelantadas. Esta edición no añade apuestas, casillas de pago ni reglas de un pueblo concreto que no estén verificadas.",
    ],
  ],
  "rutas-de-vapor": [
    [
      "Mapa y objetivo",
      "Esta es una adaptación original de Games del género de rutas ferroviarias, con ciudades y contratos propios. No equivale a un reglamento comercial completo. Cada participante recibe 24 trenes, cuatro cartas y dos contratos privados. Los contratos indican dos ciudades y una recompensa; enlázalas usando exclusivamente tus propias vías.",
    ],
    [
      "Robar cartas",
      "En tu turno puedes tomar dos cartas, de una en una, a ciegas o del mercado visible. Una locomotora visible consume todo el turno y no puede tomarse como segunda carta; una locomotora robada a ciegas cuenta como una carta normal. La mesa conserva tu turno hasta completar el robo. Si el mazo se agota, se barajan los descartes. Si no queda carta, la acción termina sin robo adicional.",
    ],
    [
      "Reclamar una vía",
      "Como alternativa al robo, pulsa una ruta que puedas pagar. Entrega tantas cartas de su color como segmentos indica; locomotoras completan las que falten. Necesitas también ese número de trenes y la vía debe estar libre. No puedes reclamar después de haber robado una carta ese turno. Las rutas de dos, tres y cuatro segmentos dan dos, cuatro y siete puntos respectivamente. Las vías ajenas no sirven para conectar tus contratos.",
    ],
    [
      "Final y ejemplo",
      "Cuando alguien conserva dos trenes o menos, quedan tantos turnos adicionales como participantes. También termina si se ocupan todas las vías o se completan 150 turnos. Cada contrato cumplido suma su valor y cada contrato incumplido lo resta. Gana la puntuación mayor, compartiendo victoria si empatan. Por ejemplo, conectar Faro con Sur mediante varias vías tuyas cumple ese contrato sin necesitar una vía directa. La IA conoce sus contratos y las vías públicas, pero no las manos rivales.",
    ],
  ],
  "draft-de-maravillas": [
    [
      "Edición y preparación",
      "Variante original de draft para tres o cuatro ciudades; no reproduce todos los sistemas de un juego comercial. Cada ciudad empieza con seis monedas y una mano de siete cartas por era. Hay tres eras y seis elecciones en cada una: la carta restante se descarta. Los participantes eligen por turnos con su mano oculta; las elecciones solo se resuelven cuando todos han elegido.",
    ],
    [
      "Tres usos de una carta",
      "Construir incorpora la carta a tu ciudad. Vender la descarta y da tres monedas. Construir una etapa de maravilla consume la carta y cuesta cuatro monedas más el número de era; puedes construir tres etapas y cada una da cinco puntos finales. Una carta construida cuesta las monedas indicadas más dos si tu ciudad no produce el recurso señalado. Los recursos no se gastan: tener al menos una madera o piedra elimina ese recargo para las cartas que lo requieren. Este comercio se hace con una reserva común ilimitada, no con vecinos.",
    ],
    [
      "Desarrollo y paso de manos",
      "Cantera y aserradero añaden producción. Cultura suma puntos. Cuartel añade fuerza militar. Comercio da monedas. Ciencia aporta uno de tres símbolos. Después de resolver las elecciones, las manos restantes pasan a la siguiente ciudad; el sentido se invierte en la segunda era. Al acabar una era comparas ejército con cada vecino: vencer da uno, tres o cinco puntos según la era; perder resta uno y empatar no puntúa.",
    ],
    [
      "Puntuación final",
      "Suma cultura, cinco por etapa de maravilla, resultado militar y una moneda por cada grupo completo de tres monedas conservadas. La ciencia suma el cuadrado de la cantidad de cada símbolo más siete por cada conjunto de los tres símbolos. Dos símbolos iguales dan cuatro; uno de cada da diez. Gana el mayor total y se admiten empates. La IA decide con su mano y las ciudades públicas, sin consultar elecciones rivales aún ocultas.",
    ],
  ],
  "reserva-de-naturaleza": [
    [
      "Tu reserva",
      "Variante original de conservación y acciones que ganan fuerza; no es una edición completa de un producto comercial. Cada participante administra dieciséis parcelas, doce monedas y cinco acciones colocadas de izquierda a derecha. La posición de una acción determina su fuerza, de uno a cinco. Usarla la desplaza al primer puesto; las otras avanzan.",
    ],
    [
      "Financiar e investigar",
      "Fondos da tres monedas por punto de fuerza. Investigación da la mitad de la fuerza, redondeada hacia arriba, en fichas de investigación. Estas fichas se gastan en conservación. Los recursos de las reservas y el mercado son públicos; no hay cartas privadas. Puedes estudiar qué acción tendrá más fuerza en el próximo turno antes de decidir.",
    ],
    [
      "Hábitats y animales",
      "Elige bosque, pradera o agua y pulsa una parcela vacía: Hábitat construye una fila continua de hasta cuatro parcelas, tantas como su fuerza, pagando una moneda por parcela. Deben caber en una misma fila y todas estar vacías. Los animales del mercado requieren un terreno concreto, cierto número de parcelas conectadas y vacías, monedas y una fuerza mínima de la acción Animales. Pulsar un animal habilitado lo aloja automáticamente en un recinto compatible y suma su atractivo. Las parcelas ocupadas no se reutilizan.",
    ],
    [
      "Conservación y final",
      "Conservación exige fuerza tres o más, al menos dos animales, dos fichas de investigación y tres monedas. A fuerza cinco da dos puntos de conservación; a fuerza tres o cuatro da uno. Cuando una reserva alcanza atractivo más tres veces conservación igual o superior a 35, queda una vuelta final. También termina tras treinta turnos por participante. Puntúa atractivo, tres por conservación y uno por cada cinco monedas sobrantes. Gana el mayor total. Planifica los recintos antes de alojar especies grandes: construir solo recintos pequeños puede dejarte sin espacio útil.",
    ],
  ],
  "construccion-de-castillos": [
    [
      "Dados y dominio",
      "Variante original de losetas y dados para dos a cuatro participantes. Cada dominio tiene diecinueve hexágonos, con un castillo inicial en el centro. Las parcelas indican terreno y número. Empiezas con tres trabajadores, una reserva vacía y dos dados por turno. Cada dado permite una acción; no se vuelve a lanzar hasta gastar ambos.",
    ],
    [
      "Tres acciones",
      "Obtener: selecciona un dado y una loseta del depósito con ese número; la reserva admite tres losetas. Colocar: selecciona una loseta reservada y pulsa una parcela habilitada, del terreno correspondiente y adyacente a algo ya construido. El dado debe igualar el número de la parcela; cada punto de diferencia cuesta un trabajador, tanto para subir como para bajar, sin vuelta circular entre uno y seis. Obtener trabajadores: cambia un dado por dos trabajadores, una alternativa siempre disponible.",
    ],
    [
      "Efectos y regiones",
      "Castillo y villa dan cuatro puntos; pradera tres; mina y río dos; monasterio cinco. Una mina también da dos trabajadores y un punto al cerrar cada ronda. Un río suma además un punto por cada río de tu dominio, incluido el recién colocado. Completar todas las parcelas de un terreno da ocho puntos adicionales. Los tipos son propios de esta adaptación: no se deben extrapolar efectos de otras ediciones.",
    ],
    [
      "Final y ejemplo",
      "Después de que todos gasten sus dos dados termina una ronda: se reponen los seis depósitos y las minas dan ingresos. La partida termina tras diez rondas o cuando alguien llena su dominio. Se añaden los trabajadores sobrantes a la puntuación y vence el total mayor, con empates compartidos. Un dado cuatro puede colocar en una parcela seis pagando dos trabajadores. La IA obtiene losetas que tengan terreno disponible, busca colocaciones legales y cambia dados por trabajadores si no puede aprovecharlos.",
    ],
  ],
  escoba: [
    [
      "Baraja y objetivo",
      "Se juega individualmente con dos, tres o cuatro puestos y una baraja española de cuarenta cartas. Reparte tres cartas por persona y cuatro a la mesa. La meta configurable es once o veintiún puntos, al final de una mano. Los números del uno al siete valen su número; sota, caballo y rey valen ocho, nueve y diez, aunque sus cartas lleven los números diez, once y doce.",
    ],
    [
      "Captura de quince",
      "Selecciona una carta de tu mano y las cartas de la mesa que quieres recoger. La carta jugada y las seleccionadas deben sumar exactamente quince. Si la carta que eliges tiene alguna captura, debes realizar una de ellas, pero puedes escoger otra carta sin captura y dejarla en la mesa. El botón de captura válida propone una combinación, no necesariamente la mejor. Ejemplo: con un cuatro puedes recoger un siete y otro cuatro. Solo se recoge una combinación por turno.",
    ],
    [
      "Escobas y repartos",
      "Si una captura vacía la mesa, anotas una escoba. Si las cuatro cartas iniciales suman quince o treinta, el repartidor las recoge y recibe una o dos escobas. Cuando todos agotan sus tres cartas se reparten otras tres, sin añadir nuevas cartas a la mesa. Al acabar el mazo, las cartas que quedan en la mesa van al último capturador; recoger ese sobrante no da escoba.",
    ],
    [
      "Puntos de esta variante",
      "Una escoba vale un punto. También da un punto cada mayoría única: cartas, oros y sietes; los empates no puntúan. Tener el siete de oros da otro punto. Se usa la variante española simplificada de setenta por cantidad de sietes, sin comparar primiera. Si nadie alcanza la meta, se inicia otra mano conservando puntos y rotando el reparto. Para ganar hay que alcanzar la meta y tener más puntos que todos los demás; si empatan en cabeza se continúa. Las cartas rivales permanecen ocultas y la IA solo valora su mano y la mesa.",
    ],
  ],
  cinquillo: [
    [
      "Preparación",
      "Usa cuarenta cartas españolas, repartidas todas entre dos, tres o cuatro participantes; con tres, uno recibirá una carta más. El primer turno corresponde a quien tiene el cinco de oros y debe colocarlo. El objetivo es quedarse sin cartas antes que los demás. Esta es la modalidad de series continuas, sin saltos ni montón de robo.",
    ],
    [
      "Series de cada palo",
      "Cada palo se abre exclusivamente con su cinco. Desde ahí se extiende sin huecos: hacia abajo cuatro, tres, dos y as; hacia arriba seis, siete, sota, caballo y rey. La sota sigue al siete porque esta baraja no tiene ocho ni nueve. En tu turno coloca exactamente una carta habilitada de tu mano. Puedes abrir otro palo con un cinco después del cinco de oros inicial.",
    ],
    [
      "Pasar y terminar",
      "Solo puedes pasar cuando no tienes ninguna carta legal. Si hay varias, decides cuál jugar. Las cartas ya colocadas no se retiran ni se capturan. Quien coloca su última carta gana inmediatamente; el resto no completa la ronda. La mesa muestra el número de cartas que conserva cada participante, pero no su identidad. Para otra partida usa el acceso rápido; mantiene participantes y modalidad, y vuelve a repartir.",
    ],
    [
      "Ejemplo y estrategia",
      "Si en copas hay cinco y seis, el siete de copas es legal pero la sota todavía no. Si no hay ningún basto en la mesa, un cuatro de bastos no abre el palo: necesitas el cinco. Abre los palos donde acumules cartas y evita retener una conexión que necesites tú mismo. La IA sigue esa heurística usando su propia mano; no consulta las cartas rivales.",
    ],
  ],
  belote: [
    [
      "Mesa y contrato",
      "Cuatro puestos forman equipos J1/J3 y J2/J4. Se utiliza baraja francesa de treinta y dos cartas: siete, ocho, nueve, diez, J, Q, K y as. Esta modalidad juega en sentido horario, hasta 501 puntos y sin anuncios salvo belote-rebelote. Cada reparto empieza con cinco cartas por puesto y una carta vuelta. En la primera vuelta puedes tomar su palo como triunfo o pasar; en la segunda debes elegir otro palo. Si todos pasan dos veces, se reparte otra mano.",
    ],
    [
      "Completar manos y jugar bazas",
      "Quien toma recibe la carta vuelta. Después todos completan ocho cartas y empieza quien sigue al repartidor. Debes asistir al palo de salida. Si sale triunfo, también debes superarlo si puedes. Si no puedes asistir y está ganando un rival, debes cortar con triunfo; si ya hay triunfo, debes superarlo si puedes, o subcortar si no puedes subir. Cuando gana tu compañero y no puedes asistir, puedes descartar libremente. Quien gana una baza sale en la siguiente.",
    ],
    [
      "Orden y valor",
      "En triunfo el orden de mayor a menor es J, nueve, as, diez, rey, dama, ocho y siete; valen veinte, catorce, once, diez, cuatro, tres, cero y cero. Fuera del triunfo: as, diez, rey, dama, J, nueve, ocho y siete; valen once, diez, cuatro, tres, dos, cero, cero y cero. La última baza añade diez. Ganar las ocho bazas da noventa adicionales. El rey y la dama de triunfo en la misma mano añaden veinte al equipo cuando ambos se juegan; se registra automáticamente.",
    ],
    [
      "Liquidación y final",
      "El equipo que tomó debe sumar al menos tantos puntos de mano, incluida belote, como el contrario. Si falla, los puntos de bazas van al rival; cada equipo conserva su propia belote. Se suman los resultados y se reparte otra mano. Gana el equipo con mayor total cuando alcanza 501; un empate obliga a continuar. La edición baraja entre manos, no usa anuncios de secuencias ni cuadrados y no ofrece coinche. Las decisiones de IA usan solo su mano, contrato y cartas públicas.",
    ],
  ],
  "futbol-de-mesa-con-cartas": [
    [
      "Duelo original",
      "Juego original de Games para dos equipos, con cinco cartas por mano, mazos independientes y un dado de seis caras. Un equipo ataca y el otro debe responder; ambos toman decisiones. No es una simulación de fútbol en tiempo real. El balón comienza en la zona cero y hay cinco zonas, de cero a cuatro.",
    ],
    [
      "Atacar y responder",
      "Pase avanza una zona; regate, dos. Puedes disparar desde la zona dos; antes de llegar, una carta Disparo se recicla como un pase básico para evitar quedar sin jugada. Presión, corte y portero sirven principalmente para defender, pero se pueden usar como un pase básico en ataque. El atacante juega una carta y después el defensor elige una respuesta de su mano. Corte contrarresta pase, presión contrarresta regate y portero contrarresta disparo: la respuesta adecuada tiene fuerza cuatro. Otra carta defensiva tiene fuerza dos; una carta de ataque defendiendo tiene fuerza cero.",
    ],
    [
      "Resolver el dado",
      "La acción tiene éxito si dado más fuerza ofensiva supera fuerza defensiva más cuatro. Pase y regate tienen fuerza ofensiva dos; disparar usa la zona del balón como fuerza. Si avanzas mantienes la posesión para el siguiente ataque. Si te recuperan el balón, cambia el equipo y se reinicia en zona cero. Un disparo siempre cambia la posesión, haya gol o parada. Tras jugar se repone la mano a cinco; al agotarse un mazo se barajan sus descartes.",
    ],
    [
      "Ejemplo y final",
      "Un disparo desde zona tres frente a portero requiere seis en el dado: seis más tres supera cuatro más cuatro. Contra una defensa sin bonus bastan resultados más bajos. Se termina al alcanzar tres goles o tras veinte ataques resueltos. Gana quien tenga más goles; se admite empate. La IA ve la carta de ataque anunciada y su propia mano, pero no la mano rival. El relato muestra el resultado del dado para entender cada resolución.",
    ],
  ],
  "buscaminas-hexagonal": [
    [
      "Seis vecinos",
      "Cada hexágono interior toca seis casillas. Los bordes tienen menos; el campo tiene forma de rombo y no hay conexiones a través de sus extremos. Elige tamaño siete, nueve, doce o dieciséis y densidad suave, normal o experta. Los números indican cuántas minas hay en los seis vecinos, no en las ocho posiciones de un buscaminas cuadrado.",
    ],
    [
      "Primer clic y banderas",
      "La primera casilla y todos sus vecinos están libres de minas. La distribución se crea al descubrir por primera vez, no al marcar una bandera. Un cero abre automáticamente la zona vacía conectada y los números que la rodean. Usa clic derecho para alternar una bandera; en móvil activa el modo Marcar y toca. Las banderas impiden abrir esas casillas y pueden retirarse. No se limita su cantidad: una bandera no confirma que allí exista una mina.",
    ],
    [
      "Deducir y terminar",
      "Si un uno toca una bandera y cinco casillas desconocidas, esas cinco son seguras siempre que la bandera sea correcta. Si un dos tiene exactamente dos vecinos desconocidos y ninguna bandera, ambos son minas. Ganas al descubrir todas las casillas sin mina; no necesitas marcar las minas. Descubrir una mina pierde la partida y revela sus posiciones. La nueva partida conserva tamaño y densidad, pero crea otra distribución.",
    ],
    [
      "Ayuda e IA",
      "Paso de ayuda examina únicamente números descubiertos y banderas para abrir una casilla deducible o marcar una mina deducible. Si no existe deducción directa, elige una casilla al azar y puede perder: no accede al contenido oculto. Una bandera humana incorrecta puede llevar la ayuda a una deducción equivocada. No se promete que cada campo sea resoluble sin adivinar; la seguridad solo está garantizada en el primer clic y sus vecinos.",
    ],
  ],
  "torres-de-hanoi": [
    [
      "Objetivo",
      "Traslada todos los discos desde la primera torre a la tercera, manteniendo su orden de tamaño. Elige entre tres y diez discos. La torre intermedia es auxiliar. Empiezas con los discos apilados de mayor abajo a menor arriba. Cada traslado legal cuenta un movimiento.",
    ],
    [
      "Mover un disco",
      "Solo se mueve el disco superior de una torre y solo uno por movimiento. Puede ir a una torre vacía o sobre un disco mayor; nunca sobre uno menor. Pulsa la torre de origen y después la de destino, o arrastra el disco superior a otra torre. Las jugadas ilegales no cambian el tablero ni el contador. Una torre de origen vacía no puede aportar un disco.",
    ],
    [
      "Método recursivo",
      "Para mover tres discos al destino, primero mueve los dos pequeños a la torre auxiliar, traslada el grande al destino y después lleva los dos pequeños desde la auxiliar hasta encima del grande. El mismo procedimiento sirve para cualquier cantidad. Un único disco requiere un movimiento; cada disco adicional duplica el trabajo anterior y añade uno. El mínimo inicial es dos elevado al número de discos, menos uno: con tres, siete; con cinco, treinta y uno.",
    ],
    [
      "Ayuda y final",
      "Siguiente paso propone y ejecuta un movimiento hacia la solución desde tu posición actual, incluso si te apartaste del recorrido inicial. Solo IA repite esos pasos y permite pausar o cambiar velocidad. La cifra de mínimo corresponde a la posición inicial, no a tu situación actual después de rodeos. Al reunir todos los discos en la tercera torre se anuncia victoria. La nueva partida conserva la cantidad de discos y devuelve todos al origen.",
    ],
  ],
  "sopa-de-letras-dinamica": [
    [
      "Preparación",
      "Elige cuadrícula de ocho, diez, doce o dieciséis y un tema: naturaleza, viajes o ciencia. Las letras y posiciones se generan cada vez. La lista muestra exclusivamente palabras que el generador ha colocado realmente; cada una puede encontrarse en línea recta en alguna de las ocho direcciones. Se emplean mayúsculas sin tildes para evitar diferencias de teclado.",
    ],
    [
      "Seleccionar palabras",
      "Pulsa la primera y después la última letra de una palabra, o traza desde la primera hasta la última arrastrando. Las selecciones válidas son horizontales, verticales o diagonales a 45 grados. Se acepta leer en ambos sentidos, pero no girar dentro de la palabra. Las letras pueden pertenecer a varias palabras. Una selección errónea no penaliza y permite intentar de nuevo.",
    ],
    [
      "Ejemplo y victoria",
      "BOSQUE puede aparecer de izquierda a derecha, de derecha a izquierda o sobre una diagonal. Selecciona los seis caracteres, incluyendo el inicial y el final. Si seleccionas solo BOS o añades una letra extra, no se recoge. Una palabra encontrada queda marcada y tachada en la lista; encontrarla de nuevo no aumenta el contador. Ganas cuando la lista completa queda resuelta.",
    ],
    [
      "Dinámica y resolución",
      "Nueva partida conserva tamaño y tema, y genera una distribución distinta. Si el espacio no permite insertar una palabra tras los intentos del generador, no se exige encontrarla: se omite de la lista. Encontrar una palabra y Solo IA recorren las letras visibles en todas las direcciones; no dependen de coordenadas secretas de colocación. Es un puzle individual sin rivales ni competición inventada. En móvil la lista se distribuye bajo el tablero.",
    ],
  ],
  inu: [
    [
      "Identidad de esta edición",
      "El nombre solicitado es Inu. No se ha identificado un reglamento oficial verificable para el juego de posiciones ocultas descrito en el catálogo anterior. Para no inventar una tradición ni atribuir reglas incorrectas, esta ficha ofrece expresamente una variante original de Games. Si se aporta el reglamento del juego concreto, esta edición podrá ajustarse a él.",
    ],
    [
      "Ocultar y buscar",
      "J1 elige una posición secreta en un tablero de cuatro, seis u ocho casillas por lado. La elección queda fija. J2 debe localizarla dentro del número de acciones indicado: techo del logaritmo en base dos del número de casillas, más dos. En modo contra la IA, el puesto humano puede ocultar o buscar según el ajuste de papel. En local se aparta la vista al cambiar de puesto; online cada persona ve la fase que le corresponde.",
    ],
    [
      "Preguntas y deducción",
      "Puedes preguntar si la fila es menor o igual que un umbral, si la columna es menor o igual o si fila más columna tiene paridad par o impar. Cada pregunta consume una acción y elimina automáticamente posiciones incompatibles. Las respuestas son siempre verdaderas y se muestran en el historial. Pulsar una casilla candidata es un intento de adivinar y también consume una acción: acertar gana para J2; fallar descarta esa casilla.",
    ],
    [
      "Ejemplo y final",
      "En un tablero de seis, preguntar si la fila está hasta la tercera divide el espacio en dos mitades. Combina preguntas de filas y columnas para reducir candidatos. El buscador pierde al agotar acciones sin acertar y gana el creador del secreto. Al acabar se revela la posición. La IA buscadora elige divisiones equilibradas usando solamente candidatos y respuestas públicas; nunca consulta la posición secreta para escoger su pregunta o intento. No se trata de un juego oficial japonés verificado.",
    ],
  ],
  "mensajes-cruzados": [
    [
      "Dos equipos y claves",
      "Variante original de Games de comunicación mediante pistas, con cuatro puestos: J1/J3 contra J2/J4. Cada equipo tiene cuatro palabras secretas numeradas. El emisor recibe un código privado de tres números distintos entre uno y cuatro y debe comunicarlo a su compañero sin revelar las palabras. Las personas rivales intentan deducir el mismo código sin ver las claves.",
    ],
    [
      "Fase de emisión",
      "El emisor escribe tres pistas, una por cada número del código, respetando el orden. Cada pista puede tener hasta cuarenta caracteres y no puede contener literalmente ninguna palabra secreta propia. Usa asociaciones reconocibles por tu compañero. Para una clave MAR, una pista como salado puede servir. No escribas los números directamente ni describas su posición: la aplicación verifica palabras exactas, pero la honestidad de las pistas requiere acuerdo entre jugadores.",
    ],
    [
      "Respuesta e intercepción",
      "Primero el compañero propone tres números distintos viendo las palabras propias. Después el rival intenta interceptar viendo las pistas y el historial público, pero no las claves. Tras ambas respuestas se revela el código y se registra el mensaje. Fallar la respuesta propia añade un fallo al equipo emisor; acertar la intercepción añade una intercepción al equipo rival. Se alternan equipos y se rotan emisores y receptores.",
    ],
    [
      "Final e IA",
      "Dos intercepciones, dos fallos de un equipo o completar ocho mensajes terminan la partida. La puntuación de desempate es dos veces intercepciones menos fallos; gana la mayor y se comparte si empatan. La IA emisora usa asociaciones de un vocabulario propio; la receptora conoce legítimamente las claves de su equipo. La interceptora aprende asociaciones del historial público y adivina cuando faltan datos. El vocabulario está limitado y la IA no comprende libremente todas las pistas humanas; esto se debe considerar al mezclar personas y máquinas. No es un reglamento comercial completo.",
    ],
  ],
  santorini: [
    [
      "Reglas base",
      "Esta mesa implementa la modalidad base de dos jugadores sin poderes divinos. El tablero tiene cinco por cinco casillas, inicialmente a nivel cero. Cada participante coloca sus dos trabajadores en casillas libres; J1 coloca ambos y después J2. J1 empieza a mover. No hay cartas de dioses ni módulos de expansiones.",
    ],
    [
      "Mover y construir",
      "En cada turno elige un trabajador propio y muévelo a una de sus ocho casillas vecinas, incluida diagonal. El destino debe estar libre de trabajadores y cúpula. Puedes subir como máximo un nivel, bajar cualquier cantidad o permanecer a la misma altura. Después construyes en una casilla vecina del trabajador que acabas de mover. Debe estar libre; puedes construir en la casilla de la que saliste. Un movimiento que no permita completar la construcción no es legal, salvo que produzca victoria inmediata.",
    ],
    [
      "Alturas y victoria",
      "Construir añade un nivel: cero pasa a uno, uno a dos, dos a tres y sobre tres se coloca una cúpula, cerrando la casilla para siempre. Ganas inmediatamente al subir un trabajador desde nivel dos a nivel tres; no construyes después de esa subida ganadora. Si al empezar tu turno no hay ningún movimiento completo legal para ninguno de tus trabajadores, pierdes. No se gana por tener más edificios ni por alcanzar nivel dos.",
    ],
    [
      "Ejemplo y controles",
      "Desde altura uno puedes entrar a cero, uno o dos, pero no a tres. Desde dos puedes subir a tres y ganar si está libre. Selecciona o arrastra tu trabajador; los destinos legales se destacan. Tras mover, selecciona una casilla de construcción. Las piezas arquitectónicas muestran el nivel y las cúpulas azules. La IA busca ascensos, opciones de construcción y victorias inmediatas mediante heurística ligera, sin poderes ni promesa de juego perfecto. El enlace del editor permite comparar las reglas base y consultar modos que esta mesa no incluye.",
    ],
  ],
};
