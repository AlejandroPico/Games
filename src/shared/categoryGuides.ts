/** Guides describe the exact implemented edition, not every commercial or regional variant. */
export const categoryGuides: Record<string, [string, string][]> = {
  "pig-el-cerdo": [
    [
      "Objetivo y preparación",
      "De dos a cuatro participantes empiezan con cero puntos. Elige una meta de 50, 100 o 200 puntos. Cada turno empieza con un acumulado provisional vacío. Hay un único dado de seis caras y todas las tiradas son aleatorias; nadie puede escoger su resultado.",
    ],
    [
      "Lanzar o plantarse",
      "Lanzar añade el valor del dado al acumulado provisional si sale del dos al seis. Puedes volver a lanzar o plantarte. Si sale uno, pierdes únicamente el acumulado de este turno y juega la siguiente persona. Plantarse transfiere el acumulado a tu marcador definitivo; esos puntos ya no se pierden. No puedes plantarte con el turno vacío.",
    ],
    [
      "Ejemplo",
      "Con 40 puntos seguros, sacar cinco y cuatro deja 9 provisionales. Plantarte te sitúa en 49. Si vuelves a tirar y sale uno, sigues con 40 y pasa el turno. Llegar provisionalmente a la meta no basta: debes conservar los puntos. El selector Acción ofrece solo las opciones legales del momento.",
    ],
    [
      "Final y modos",
      "Gana quien conserve una puntuación que alcance la meta; esta edición termina inmediatamente, sin una ronda adicional. La IA acostumbra a guardar alrededor de veinte puntos o cuando puede ganar. Puedes jugar con humanos e IA, en local o en sala, y observar una partida automática. Nueva partida conserva participantes, puestos y objetivo.",
    ],
  ],
  "farkle-diez-mil": [
    [
      "Preparación",
      "Cada participante empieza a cero. Escoge 2000, 5000 o 10000 como meta. Se lanzan seis dados y se apartan combinaciones puntuables de una misma tirada. Esta mesa utiliza una tabla tradicional explícita, que puede diferir de otras ediciones de Farkle.",
    ],
    [
      "Puntuación de esta mesa",
      "Un uno suelto vale 100 y un cinco 50. Tres unos valen 1000; tres de otra cara valen esa cara por 100. Cada dado adicional igual duplica el valor del grupo. Una escalera 1–6 y tres parejas, usando los seis dados, valen 1500. Los demás dados no puntúan sueltos. No puedes combinar dados de tiradas diferentes para formar un trío.",
    ],
    [
      "Apartar y relanzar",
      "Selecciona una de las combinaciones ofrecidas y confirma: todas incluyen solo dados puntuables. Debes apartar al menos uno después de cada tirada. Luego relanza únicamente los restantes o conserva el turno. Para anotar por primera vez necesitas al menos 500. Si apartas los seis, puedes relanzar los seis. Una tirada sin ninguna combinación es Farkle: pierdes el acumulado provisional y pasa el turno.",
    ],
    [
      "Final y ejemplo",
      "Apartar un uno y un cinco guarda 150 provisionales. Si el siguiente lanzamiento falla, se pierden esos 150, no los puntos previos del marcador. Al conservar la meta se concede exactamente un último turno a cada rival; gana el marcador más alto y los empates permanecen empatados. La IA compara combinaciones legales y suele conservar a partir de 600; no controla el azar.",
    ],
  ],
  "dados-zombie": [
    [
      "Bolsa y objetivo",
      "Hay trece dados: seis verdes, cuatro amarillos y tres rojos. Se busca conservar 8, 13 o 20 cerebros, según los ajustes. Esta mesa ofrece las reglas básicas, sin expansiones. Los resultados se representan por números y un texto: 1 cerebro, 2 huellas, 3 disparo; el color aparece debajo.",
    ],
    [
      "Lanzamiento",
      "Siempre se intentan lanzar tres dados. Los verdes tienen tres caras de cerebro, dos de huellas y una de disparo; los amarillos dos de cada; los rojos una de cerebro, dos de huellas y tres de disparo. Aparta cerebros y disparos; las huellas vuelven a lanzarse si continúas, completando hasta tres con dados de la bolsa.",
    ],
    [
      "Riesgo y conservación",
      "Tres disparos acumulados terminan el turno sin anotar sus cerebros. Antes puedes plantarte y conservarlos. Si la bolsa necesita dados se reciclan los dados que ya dieron cerebro, conservando la cuenta obtenida; los disparos no se reciclan durante ese turno. Por ejemplo, con cuatro cerebros y dos disparos, continuar puede aumentar el premio o perderlo todo.",
    ],
    [
      "Final y controles",
      "Cuando alguien conserva la meta, cada rival recibe un último turno. Gana quien tenga más cerebros, con empate compartido. Confirmar acción ejecuta Lanzar o Conservar. Los puestos admiten humanos, IA y amigos online. La IA considera cerebros y disparos visibles; Nueva partida conserva la meta y la configuración.",
    ],
  ],
  "dados-mentirosos-perudo": [
    [
      "Mesa e información",
      "De dos a seis participantes comienzan con cinco dados ocultos cada uno. Solo ves tus propios dados durante las propuestas. El marcador indica cuántos conserva cada persona. Una propuesta expresa una cantidad mínima de una cara en toda la mesa; puede cumplirse con más dados de los anunciados.",
    ],
    [
      "Elevar una propuesta",
      "Fuera de palifico, los unos cuentan como comodines para otra cara. Puedes aumentar la cantidad con cualquier cara, o mantenerla elevando la cara. Cambiar una propuesta ordinaria a unos requiere al menos la mitad redondeada hacia arriba; volver de unos a otra cara requiere el doble más uno. El menú muestra únicamente propuestas legales. No se permite proponer más dados que los existentes.",
    ],
    [
      "Dudo y palifico",
      "Dudo revela los dados y cuenta las coincidencias. Si la cantidad anunciada se cumple pierde un dado quien desafió; si no, pierde quien propuso. Quien pierde abre la siguiente ronda, salvo que quede eliminado. Cuando esa persona llega por primera vez a un dado, juega su ronda de palifico: no hay comodines y la cara queda fijada; un puesto que conserva un solo dado sí puede cambiarla.",
    ],
    [
      "Final y ejemplo",
      "Ante cinco cuatros, puedes anunciar tres unos; desde tres unos necesitas al menos siete dados de otra cara. El perdedor confirma Nueva ronda para ocultar otra tirada. No se incluye la regla opcional calza. Gana el último puesto con dados. La IA estima probabilidades con su propia mano y la cantidad pública; no cuenta los dados ocultos rivales antes de desafiar.",
    ],
  ],
  "liar-s-dice-estilo-casino": [
    [
      "Edición jugable",
      "Esta ficha contiene una variante original de póker mentiroso con dados individuales, sin dinero ni apuestas reales. No se presenta como el reglamento universal de un casino. Cada participante conserva cinco vidas y recibe cinco dados ocultos nuevos en cada ronda.",
    ],
    [
      "Categorías y propuestas",
      "De menor a mayor: nada, pareja, dos parejas, trío, escalera de cinco valores consecutivos, full de trío y pareja, póker de cuatro y cinco iguales. Anuncia que TU mano tiene al menos una categoría, no que la mesa reúne esa combinación. El siguiente jugador puede anunciar una categoría superior sobre su propia mano o desafiar a quien habló antes.",
    ],
    [
      "Resolver el desafío",
      "Desafiar revela únicamente la mano del último proponente. Si su categoría real alcanza la afirmada pierde una vida quien desafió; si queda por debajo pierde quien afirmó. El perdedor abre la siguiente ronda si tiene vidas. Cada participante vuelve a recibir cinco dados; no hay descartes ni relanzamientos dentro de una ronda. El menú limita las propuestas a categorías superiores.",
    ],
    [
      "Ejemplo y final",
      "Con 2–2–2–5–5 tienes full: tu afirmación de escalera se cumple porque full está por encima, aunque los dados no formen literalmente una escalera. Afirmar póker con esa mano es falso. Gana la última persona con vidas. La IA evalúa su propia mano y la propuesta pública; las manos rivales no se usan para decidir. La modalidad online utiliza salas privadas entre amigos.",
    ],
  ],
  "craps-dados-de-casino": [
    [
      "Modalidad",
      "Esta edición se concentra en la mecánica Pass Line: dos dados, lanzamiento de salida y búsqueda de un punto. No incluye el resto de apuestas de un casino. Cada participante empieza con diez créditos ficticios y juega el mismo número de rondas completas, cinco, diez o veinte según los ajustes.",
    ],
    [
      "Salida",
      "Una suma de siete u once gana inmediatamente un crédito. Dos, tres o doce pierde uno. Cualquier otra suma —cuatro, cinco, seis, ocho, nueve o diez— establece el punto del turno. Las tiradas restantes pertenecen al mismo participante hasta resolver ese punto.",
    ],
    [
      "Buscar el punto",
      "Después de establecerlo, repetir esa suma gana un crédito. Sacar siete pierde uno. Las demás sumas no alteran el punto ni pasan el turno. Por ejemplo, si la salida suma ocho, una tirada de once no gana; debes obtener ocho antes de siete. El mensaje indica el punto que persigues.",
    ],
    [
      "Final y controles",
      "Confirmar acción lanza ambos dados. Después de cada éxito o fallo pasa el turno, y al completar las rondas de todos gana quien tenga más créditos ficticios. Un empate se conserva. Los resultados son aleatorios; la IA solo lanza siguiendo las mismas reglas. No hay pagos, depósitos, compras ni posibilidad de convertir créditos en dinero.",
    ],
  ],
  hazard: [
    [
      "Preparación",
      "Hazard se juega aquí como un desafío de dos dados con créditos ficticios, sin dinero. Cada participante elige un main entre cinco y nueve antes de lanzar. Todos disputan cinco, diez o veinte rondas resueltas. El marcador inicial es diez.",
    ],
    [
      "Resolver la primera tirada",
      "Sacar el main gana. Con main siete también gana once; con main seis u ocho también gana doce. Dos o tres siempre pierde. Once pierde con cualquier main que no sea siete; doce pierde con cualquier main que no sea seis u ocho. Otro resultado válido se convierte en chance.",
    ],
    [
      "Chance y ejemplo",
      "Una vez establecida la chance debes repetirla antes de sacar el main. Chance gana y main pierde; las demás sumas obligan a continuar. Ejemplo: main siete y primera suma seis establecen chance seis. Ahora debes sacar seis antes de siete; once ya no da una victoria automática. Cada éxito añade un crédito y cada fallo resta uno.",
    ],
    [
      "Final y observación",
      "La acción de elegir main no consume una ronda; esta termina únicamente al ganar o perder. Tras completar el mismo número de rondas gana el marcador mayor, conservando empates. La IA elige main siete y usa tiradas aleatorias. No se implementan apuestas secundarias ni banca monetaria; esta es una mesa de práctica del núcleo tradicional.",
    ],
  ],
  "crown-and-anchor": [
    [
      "Símbolos y objetivo",
      "Tres dados representan Corona, Ancla, Picas, Corazones, Diamantes y Tréboles. En pantalla las caras numéricas corresponden a ese orden del uno al seis. Cada persona empieza con diez puntos ficticios y selecciona un símbolo antes de lanzar. Todos juegan el mismo número de turnos.",
    ],
    [
      "Resolver un turno",
      "Confirmar lanza los tres dados una sola vez. Si tu símbolo aparece una vez sumas uno, dos veces sumas dos y tres veces sumas tres. Si no aparece pierdes uno. Se trata de ganancia o pérdida neta de puntos; no se retira previamente otra cantidad del marcador.",
    ],
    [
      "Ejemplo",
      "Si escoges Corona y salen 1–4–1, obtienes dos coincidencias y pasas de diez a doce. Escoger Corazones en la misma tirada habría producido una coincidencia. La elección se hace antes de ver la tirada nueva: no puedes cambiarla retrospectivamente. El mensaje indica el símbolo elegido y su resultado.",
    ],
    [
      "Final y límites",
      "Tras cinco, diez o veinte turnos por persona gana el mayor marcador. La IA escoge símbolos sin conocer los dados siguientes; todos tienen la misma probabilidad en esta simulación. Puedes mezclar humanos e IA, jugar online u observar. Estos puntos no tienen valor económico; no existe banca real, cobro ni compra de créditos.",
    ],
  ],
  "cee-lo": [
    [
      "Edición de torneo",
      "Esta mesa ofrece una competición de tres dados sin banca monetaria, con tres, seis o doce rondas iguales para todos. Cada ronda concede un punto a la mejor mano. Un empate en la mejor mano no concede el punto. El objetivo es ganar el mayor número de rondas.",
    ],
    [
      "Valor de las manos",
      "4–5–6 es la mano mayor. Después vienen los triples, comparando su cara: triple de seis supera triple de cinco. Luego una pareja con un dado distinto; el valor es el dado distinto. Así, 2–2–5 vale cinco y supera 6–6–4. 1–2–3 queda por debajo de todas las manos válidas.",
    ],
    [
      "Tiradas sin combinación",
      "Otros tres valores distintos no forman mano. Puedes repetir hasta tres tiradas durante tu turno; si ninguna forma combinación se registra una mano todavía inferior a 1–2–3. Esa limitación es una regla elegida para esta mesa, porque Cee-lo tiene variantes de relanzamiento. Una combinación válida termina tu turno inmediatamente.",
    ],
    [
      "Ejemplo y final",
      "4–5–6 aparece como valor 200, un triple como 100 más su cara, y una pareja como el valor del dado libre. Son indicadores de comparación, no cantidades cobradas. El marcador superior cuenta rondas ganadas. Todos los modos mantienen la misma secuencia; la IA no decide resultados. Nueva partida conserva la longitud del torneo.",
    ],
  ],
  bunco: [
    [
      "Una sola mesa",
      "Bunco se adapta a cuatro puestos, en equipos J1+J3 y J2+J4. Se disputan seis rondas, buscando del uno al seis respectivamente. No se reproduce el evento social de doce personas con tres mesas y cambios entre mesas. El marcador individual repite las victorias de su equipo.",
    ],
    [
      "Anotar",
      "Lanza siempre tres dados. Cada dado del número de la ronda suma uno al equipo. Tres iguales de ese número son Bunco y valen veintiuno. Tres iguales de otro número valen cinco. Las demás tiradas solo cuentan las coincidencias individuales con el número de la ronda.",
    ],
    [
      "Continuar y terminar la ronda",
      "Si puntúas vuelves a tirar. Si no puntúas pasa al siguiente puesto. Cuando un equipo alcanza veintiuno se adjudica la ronda y se reinician sus puntos provisionales. Por ejemplo, en la ronda cuatro, 4–4–2 suma dos y permite continuar; 5–5–5 suma cinco; 4–4–4 termina la ronda con Bunco.",
    ],
    [
      "Final y modos",
      "Gana el equipo con más rondas; tres a tres es empate. La mesa cambia de ronda automáticamente y muestra el nuevo objetivo. Como salvaguarda recreativa una ronda de doscientas tiradas se resuelve por la puntuación actual. No hay premios ni apuestas. Los cuatro puestos pueden combinar humanos locales, amigos online e IA; Solo IA permite observar los dos equipos.",
    ],
  ],
  "sichuan-dice": [
    [
      "Variante original",
      "No se ha identificado un reglamento verificable con el nombre Sichuan Dice. Esta ficha ofrece una variante original de cierre de números de Games, sin atribuirla a una tradición china concreta. Cada participante tiene abiertos los números del uno al nueve y un par de dados.",
    ],
    [
      "Cerrar números",
      "Lanza los dos dados. Selecciona un subconjunto de tus números abiertos que sume exactamente la tirada. Puedes cerrar uno o varios, pero cada número solo se usa una vez durante ese recorrido. Si la suma es siete, puedes cerrar siete, uno más seis, dos más cinco u otra combinación que todavía esté disponible.",
    ],
    [
      "Turno y puntuación",
      "Tras cerrar una combinación vuelve a lanzar para intentar eliminar más números. Cuando la tirada no permite ningún subconjunto termina tu recorrido. Anotas la suma de los números que cerraste: la lista completa suma cuarenta y cinco. Cerrar todos también termina el turno y anota cuarenta y cinco. Los números se reinician al empezar el siguiente recorrido.",
    ],
    [
      "Final y opciones",
      "Se juegan uno, tres o cinco recorridos por participante; gana la suma más alta y los empates permanecen. La IA suele escoger la combinación que elimina más números; no garantiza la mejor estrategia. Puedes observar, jugar localmente, contra máquinas o en sala. El reinicio conserva longitud y puestos.",
    ],
  ],
  quoridor: [
    [
      "Objetivo y tablero",
      "Edición de dos participantes sobre nueve por nueve casillas. Cada peón empieza en el centro de un borde y quiere alcanzar cualquier casilla del borde opuesto. Cada bando recibe diez vallas. Ganar no exige capturar al rival ni llegar a una columna determinada.",
    ],
    [
      "Mover el peón",
      "Un turno mueve a una casilla ortogonal libre conectada. Si encuentras al rival junto a ti puedes saltarlo recto si hay paso detrás. Si ese salto está bloqueado por una valla o el borde, puedes rodearlo por un lado permitido. Selecciona Mover peón, pulsa o arrastra el peón y escoge un destino iluminado.",
    ],
    [
      "Colocar vallas",
      "En lugar de mover puedes colocar una valla horizontal o vertical de longitud dos. El destino iluminado es la casilla superior izquierda del tramo. Las vallas aparecen en sus bordes y no pueden cruzarse, superponerse ni cerrar por completo el camino de ninguna persona. El motor comprueba ambos caminos antes de ofrecer un destino.",
    ],
    [
      "Final y estrategia",
      "Gana al alcanzar el otro borde. Los contadores muestran vallas restantes. La IA compara distancias y bloqueos legales; no tiene fuerza de torneo. Esta edición no incluye la modalidad oficial de cuatro participantes y aplica tablas tras cuatrocientos turnos como salvaguarda recreativa. Configura humanos, IA u online antes de empezar; el reinicio conserva la sala.",
    ],
  ],
  onitama: [
    [
      "Preparación",
      "Dos bandos ocupan un tablero de cinco por cinco, cada uno con maestro y cuatro alumnos. Se barajan dieciséis cartas de movimiento; cada bando recibe dos y queda una central. Esta edición empieza siempre con J1, en lugar de determinar la salida por el sello de la carta central.",
    ],
    [
      "Mover y capturar",
      "Selecciona una carta del desplegable, luego una pieza propia y un destino iluminado. Sus desplazamientos se muestran como columna y fila; para J1, arriba significa fila negativa. Para J2 se giran ambos ejes. No se mueve a una pieza propia; una rival en destino se captura. Solo importan los destinos, no las casillas intermedias.",
    ],
    [
      "Intercambiar cartas",
      "Tras actuar entregas la carta usada al centro y recibes la antigua carta central. El rival mantiene sus dos cartas. Si ninguna de tus cartas permite un movimiento debes pasar, intercambiando una de ellas. No puedes pasar voluntariamente si hay alguna jugada. Los maestros no siguen las reglas de jaque del ajedrez.",
    ],
    [
      "Victoria y ejemplo",
      "Gana capturando al maestro rival o llevando tu maestro a su templo, la casilla central de su primera fila. Los alumnos no ganan por entrar en el templo. Las cartas cambian continuamente: una captura disponible ahora puede desaparecer en el próximo turno. La IA busca victorias, capturas y amenazas inmediatas. Tres posiciones repetidas o trescientas acciones producen tablas recreativas.",
    ],
  ],
  dvonn: [
    [
      "Preparación",
      "El tablero contiene cuarenta y nueve espacios. Se colocan primero tres núcleos rojos, alternando J1, J2 y J1; después veintitrés fichas de cada color. Todo empieza vacío. Tras la última colocación J1 vuelve a jugar e inicia los movimientos.",
    ],
    [
      "Mover pilas",
      "Controla una pila quien tiene su color arriba. Se desplaza completa, en línea recta por una de seis direcciones, exactamente tantas casillas como fichas contiene. Debe terminar sobre otra pila; puede atravesar espacios vacíos. Una pila rodeada por seis espacios ocupados está bloqueada. Un núcleo rojo solo no se mueve, pero puede quedar dentro de una pila móvil.",
    ],
    [
      "Mantener la conexión",
      "Después de cada movimiento desaparece inmediatamente cualquier pila que no esté conectada, mediante espacios ocupados vecinos, a algún núcleo rojo. Los núcleos enterrados siguen dando conexión. Pulsa o arrastra una pila propia hacia un destino iluminado: el motor cuenta su altura, verifica el bloqueo y retira los grupos aislados.",
    ],
    [
      "Final y ejemplo",
      "Una pila de altura tres se desplaza tres espacios, aunque cruce huecos. No puede elegir avanzar uno. Si no tienes movimientos legales el turno se omite automáticamente; el rival continúa. Cuando nadie puede mover gana quien controla más fichas totales, no quien tiene más pilas. El marcador cuenta fichas bajo control y el número sobre la pila indica su altura.",
    ],
  ],
  yinsh: [
    [
      "Preparación y meta",
      "Coloca alternadamente cinco anillos por color en ochenta y cinco intersecciones. Forma líneas de cinco marcadores propios para retirar anillos. Quien retira tres gana. Las fichas muestran ● y los anillos ◎. La colocación inicial queda a elección de cada participante.",
    ],
    [
      "Mover un anillo",
      "Al moverlo deja un marcador de tu color en su origen. Se mueve recto hacia un hueco, por una de seis direcciones. Puede cruzar huecos y luego un bloque continuo de marcadores; tras ese bloque debe detenerse en el primer hueco. Nunca atraviesa anillos. Los marcadores saltados cambian de color; el del origen permanece.",
    ],
    [
      "Resolver líneas",
      "Una línea requiere cinco marcadores contiguos propios; los anillos no cuentan. El desplegable permite elegir qué cinco retirar si hay varias posibilidades. Después selecciona un anillo propio para retirarlo. Se resuelven primero las líneas de quien movió y después las del rival, con el turno temporal asignado a la persona que debe decidir.",
    ],
    [
      "Final y manejo",
      "Gana con tres anillos retirados. Si se ocupan los cincuenta y un marcadores disponibles, se compara la puntuación. Esta mesa añade tablas por triple repetición o seiscientas acciones. Pulsa origen y destino o arrastra. La IA busca líneas y evita facilitar las del rival; sus cálculos se realizan fuera de la interfaz para mantener los controles fluidos.",
    ],
  ],
  "la-colmena": [
    [
      "Reserva y colocación",
      "Cada bando tiene reina, tres hormigas, tres saltamontes, dos escarabajos y dos arañas, sin expansiones. Coloca una pieza por turno. Después de las dos primeras, una nueva pieza debe tocar alguna propia y ninguna rival, considerando el color superior de las pilas. La reina debe entrar antes de terminar tu cuarto turno; no puedes mover piezas hasta colocarla.",
    ],
    [
      "Una única colmena",
      "Las piezas han de permanecer conectadas incluso mientras se levanta una pieza. Las puertas demasiado estrechas impiden deslizar. El motor comprueba esas restricciones antes de mostrar destinos. Una pieza cubierta por un escarabajo no puede moverse. El tablero se amplía alrededor de la colmena; los huecos iluminados son destinos legales, no una reserva fija de casillas.",
    ],
    [
      "Movimiento de insectos",
      "Reina: desliza un paso. Hormiga: cualquier distancia por el contorno libre. Araña: exactamente tres pasos sin repetir un hueco. Saltamontes: salta recto sobre una o varias piezas contiguas y aterriza en el primer hueco. Escarabajo: un paso, también subiendo sobre piezas; la altura de las pilas afecta las puertas. Selecciona el insecto para colocar o Mover pieza desplegada para trasladar.",
    ],
    [
      "Final y ejemplo",
      "Rodear los seis lados de la reina rival gana, aunque algunos vecinos sean de ese rival. Ambas reinas rodeadas producen tablas. Solo se pasa sin jugadas. Dos pases, triple repetición o trescientas acciones terminan esta edición recreativa en tablas. La IA considera presión y defensa local; no es un motor competitivo.",
    ],
  ],
  "bloques-geometricos": [
    [
      "Piezas y edición",
      "Cada participante dispone de los veintiún polióminos libres de uno a cinco cuadrados, calculados sin duplicar giros ni reflejos. Esta adaptación original permite tableros de catorce o veinte por veinte y de dos a cuatro puestos. No reproduce todas las variantes o bonificaciones de una edición comercial.",
    ],
    [
      "Primer contacto",
      "Tu primera pieza debe cubrir tu esquina inicial. Dos participantes usan esquinas opuestas; tres o cuatro siguen las esquinas en orden. Después cada pieza debe tocar al menos una pieza propia por un vértice y nunca por un lado. El contacto con piezas rivales puede ser por lados o esquinas, siempre sin superposición.",
    ],
    [
      "Elegir y colocar",
      "El desplegable ofrece una pieza, giro y posible reflejo; solo aparecen orientaciones con algún destino legal. La casilla iluminada ancla la esquina superior izquierda del rectángulo que contiene la pieza. Las formas se muestran junto a los controles. Confirma pulsando ese destino. No se pueden recortar piezas, reusar una ya colocada o mover las existentes.",
    ],
    [
      "Final y ejemplo",
      "Si una pieza azul ocupa 1,1, otra azul no puede tocar su lado en 1,2, pero sí su vértice en 2,2 si encaja entera. Sin colocaciones legales puedes pasar. Una vuelta completa sin colocaciones termina la partida; gana quien cubrió más cuadrados. La IA prioriza piezas grandes; los cálculos se hacen en un Worker. Nueva partida conserva tamaño y puestos.",
    ],
  ],
  "construccion-de-colchas": [
    [
      "Adaptación original",
      "Dos participantes cosen colchas de seis o nueve por nueve con retales propios derivados de polióminos. Cada uno empieza con cinco botones, tiempo cero e ingreso cero. La pista dura treinta y dos pasos para la colcha pequeña o cincuenta y tres para la grande. No es una reproducción de Patchwork: el conjunto de retales, ingresos y eventos es propio.",
    ],
    [
      "Comprar o avanzar",
      "En cada turno puedes comprar uno de los tres próximos retales del mercado circular que puedas pagar y colocar entero. El menú indica cuadrados, coste, tiempo, ingreso y orientación. Comprar descuenta botones y consume el tiempo del retal. Alternativamente avanzas hasta un paso más allá del rival, sin superar el final, y cobras un botón por cada paso avanzado.",
    ],
    [
      "Colocar e ingresar",
      "No hay obligación de tocar otros retales; sí de caber sin superponer. Los puntos iluminados anclan el rectángulo superior izquierdo. Cada frontera de ocho pasos cruzada paga el ingreso total de tus retales. Juega quien está más atrás; si empatan sigue quien acaba de moverse, salvo que ya esté en el final. No se alterna necesariamente después de cada acción.",
    ],
    [
      "Final y estrategia",
      "Cuando ambos llegan al final, se descuentan dos botones por cada hueco sin cubrir y gana la puntuación mayor. No hay bonificación siete por siete ni parches especiales de cuero en esta edición. Los marcadores muestran botones y el mensaje tiempo e ingresos. Antes de comprar, equilibra cobertura, precio y tiempo. La IA usa esa evaluación básica; el reinicio mantiene el tamaño elegido.",
    ],
  ],
  "ventanas-de-catedral": [
    [
      "Vidrieras originales",
      "De dos a cuatro puestos llenan su propia vidriera de cuatro filas por cinco columnas durante diez rondas. Esta adaptación original tiene patrón fijo de restricciones y objetivos propios, sin herramientas ni favores de una edición comercial. Al empezar una ronda se lanzan dos dados por participante más uno, con cinco colores posibles y valores del uno al seis.",
    ],
    [
      "Draft y entrada",
      "Se elige un dado del mercado y un hueco iluminado. Cada ronda recorre los puestos hacia delante y hacia atrás: el último elige dos veces seguidas. El primer dado debe quedar en un borde. Los siguientes deben tocar algún dado propio, aunque sea diagonalmente. Pasar consume una selección y no toma un dado.",
    ],
    [
      "Restricciones",
      "Una casilla coloreada exige ese color; una casilla numerada exige ese valor. Dos dados ortogonalmente vecinos no pueden compartir ni color ni número. Diagonalmente sí pueden repetir ambos. Por ejemplo, junto a un tres rojo no cabe otro rojo ni un tres, pero cualquiera puede quedar en diagonal si cumple su casilla.",
    ],
    [
      "Puntuación y final",
      "Tras diez rondas: cinco puntos por fila completa con cinco colores diferentes; cuatro por columna completa con cuatro valores distintos; suma de valores del color objetivo de cada puesto; menos uno por hueco vacío. El objetivo se muestra públicamente y es distinto por puesto. Gana el mayor total. La IA elige dados útiles y espacios legales; no mira tiradas futuras.",
    ],
  ],
  "adivina-quien": [
    [
      "Personajes y objetivo",
      "Esta versión original tiene veinticuatro personajes ilustrados de Games. Cada participante recibe uno secreto automáticamente. Tu objetivo es identificar el del rival, no adivinar tu propio retrato. Las cartas visibles forman el conjunto común; el mensaje privado recuerda tu personaje.",
    ],
    [
      "Preguntar y descartar",
      "En cada turno pregunta por un rasgo: color de pelo, gafas, sombrero o barba. El motor responde verazmente a partir del personaje secreto rival. Las cartas incompatibles se atenúan automáticamente en TU cuaderno. Preguntar consume el turno y pasa al rival; no se repite exactamente la misma pregunta por persona.",
    ],
    [
      "Identificar y ejemplo",
      "Puedes elegir Adivinar en el menú o pulsar directamente un retrato que siga entre tus candidatos. Ese clic es una identificación definitiva, no una simple selección. Si aciertas ganas; si fallas gana el rival. Por ejemplo, una respuesta afirmativa a pelo rojo elimina todos los demás colores, pero aún debes distinguir gafas y sombreros.",
    ],
    [
      "Modos y límites",
      "La IA elige preguntas que dividan sus candidatos y solo identifica cuando queda uno. No consulta el secreto contrario para decidir. En local se usa cortina de entrega de pantalla; online la mano aparece en tu turno. Son salas entre amigos, sin protección frente a inspección del cliente. Nueva partida reparte personajes y conserva puestos.",
    ],
  ],
  "deduccion-alquimica": [
    [
      "Laboratorio original",
      "Seis ingredientes reciben seis fórmulas distintas de las ocho combinaciones posibles de tres signos: rojo, verde y azul pueden ser positivos o negativos. Las fórmulas son secretas para TODOS. Dos a cuatro participantes comparten los resultados públicos, pero compiten por demostrar las fórmulas.",
    ],
    [
      "Mezclar",
      "Una mezcla compara los tres signos. Si ambos ingredientes tienen positivo en un componente, aparece +; si ambos tienen negativo, aparece −; si difieren, aparece 0. La mezcla no consume los ingredientes. Cada pareja se experimenta una sola vez y el resultado queda en el cuaderno público. Es una lógica original, no la tabla de componentes de un juego comercial.",
    ],
    [
      "Proponer fórmulas",
      "Cada turno permite mezclar o afirmar la fórmula de un ingrediente todavía sin resolver. Una afirmación correcta fija la fórmula y suma dos puntos. Una incorrecta resta uno y descarta públicamente esa posibilidad. Por ejemplo, +0− prueba que ambos comparten rojo positivo y azul negativo, mientras sus verdes son opuestos. Esa información sirve para cruzar mezclas.",
    ],
    [
      "Final y IA",
      "Termina al demostrar los seis ingredientes o tras veinticuatro turnos por puesto; gana la puntuación mayor y puede haber empate. La IA enumera asignaciones compatibles con experimentos, fórmulas publicadas y errores conocidos. No usa la asignación secreta para elegir. Ese cálculo se realiza en un Worker. Los cuatro modos mantienen el mismo cuaderno compartido.",
    ],
  ],
  "el-asesino-de-la-mansion": [
    [
      "Caso original",
      "Se elige en secreto un sospechoso, un objeto y una habitación entre seis de cada grupo. Las otras quince cartas se reparten entre tres a seis participantes. Esta edición original se centra en la deducción, sin movimiento por habitaciones ni tablero de desplazamiento. No es una edición completa de Cluedo.",
    ],
    [
      "Investigar y refutar",
      "En tu turno elige una combinación para investigar. Empezando por el siguiente puesto, la primera persona que tenga alguna carta de esa combinación debe mostrar una de ellas en privado. El turno pasa temporalmente a quien refuta y luego vuelve a quien preguntó. Los demás ven que hubo refutación, pero no qué carta. Quien pregunta incorpora la carta a su cuaderno.",
    ],
    [
      "Acusar",
      "Después de recibir información puedes terminar el turno o acusar. También puedes acusar directamente en tu turno de investigación. Una acusación correcta gana. Una falsa te impide volver a ganar, aunque sigues obligado a refutar si tienes una carta apropiada. Las opciones del menú omiten las cartas que tu cuaderno ya descarta. Nadie puede inventar cartas al refutar.",
    ],
    [
      "Ejemplo y final",
      "Si preguntaste por Ada, Cuerda y Biblioteca y recibes Cuerda, descartas ese objeto, no necesariamente Ada o Biblioteca. Si nadie refuta una combinación sin cartas tuyas, tienes una deducción concluyente. Si todos quedan eliminados o se alcanzan ciento ochenta acciones, el caso termina sin ganador. La IA usa su mano y su cuaderno; las salas comparten secretos internamente y no son resistentes a trampas.",
    ],
  ],
  "codigo-de-redes": [
    [
      "Equipos originales",
      "Cuatro puestos: J1 y J3 forman el equipo azul; J2 y J4 el rojo. J1 y J2 son capitanes y J3 y J4 intérpretes. Hay veinticinco palabras: nueve azules, ocho rojas, siete neutrales y una peligrosa. El azul empieza. Esta mesa original no reproduce todo el diccionario ni las convenciones de un juego comercial.",
    ],
    [
      "Dar pistas",
      "El capitán ve el mapa completo y escribe una sola palabra con letras, que no sea exactamente ninguna palabra del tablero. Elige que su pista apunte a una, dos o tres palabras. La pista y la cifra quedan en el registro público. Corresponde a los jugadores respetar el sentido de la pista; la aplicación no arbitra todos los parentescos lingüísticos.",
    ],
    [
      "Interpretar",
      "El intérprete puede señalar hasta la cifra más uno, de una en una. Debe intentar al menos una antes de pasar. Una palabra propia permite continuar; una neutral o rival termina el turno. Las cartas señaladas revelan su color y quedan fuera. Señalar la peligrosa hace perder inmediatamente al equipo. Si el rival recibe su última palabra, gana el rival.",
    ],
    [
      "Final y IA",
      "Gana al descubrir todas tus palabras. En la fase de interpretación solo se muestran los colores ya revelados, nunca el mapa del capitán. La IA usa un vocabulario semántico pequeño de categorías; como intérprete relaciona la pista con las palabras, sin consultar colores ocultos. Puede equivocarse y no entiende todas las pistas humanas. El resultado identifica al equipo y sus dos puestos.",
    ],
  ],
  "pistas-abstractas": [
    [
      "Galería original",
      "De tres a seis personas reciben cinco ilustraciones propias de Games, con animales, paisajes y ambientes. En cada ronda cambia el narrador. Se juegan dos rondas de narración por persona. No se utilizan ilustraciones ni el catálogo de cartas de una edición comercial.",
    ],
    [
      "Narrar y aportar",
      "El narrador escribe una pista de al menos dos caracteres y elige una carta de su mano. La carta queda oculta. Cada rival aporta una de sus cartas que pueda encajar con esa pista. Cuando todos han aportado, las cartas se mezclan y se muestran sin autor. Ningún participante puede cambiar su aportación una vez confirmada.",
    ],
    [
      "Votar y puntuar",
      "Todos salvo el narrador votan una carta ajena como la original. Si todos aciertan o nadie acierta, los demás reciben dos puntos y el narrador cero. Si solo algunos aciertan, narrador y acertantes reciben tres. Además cada carta rival gana un punto por cada voto que atrajo. No puedes votar tu propia aportación.",
    ],
    [
      "Ejemplo y límites",
      "Una pista como bosque misterioso puede encajar con varias ilustraciones: intenta que algunos encuentren tu intención sin que resulte evidente para todos. Tras la ronda se descarta lo usado y se roba si queda mazo. Gana el mayor marcador al completar las narraciones. La IA interpreta animales, paisajes y ambientes del conjunto, pero no toda metáfora libre; evita asumir que comprenderá un relato inventado.",
    ],
  ],
  "el-intruso": [
    [
      "Papeles y preparación",
      "Entre tres y seis puestos, uno es el intruso. Los demás conocen una localización común; el intruso no. Hay ocho lugares originales con características públicas. Durante tu turno una tarjeta privada muestra tu papel, sin descubrir papeles rivales. El objetivo del grupo es votar al intruso y el suyo pasar inadvertido o descubrir el lugar.",
    ],
    [
      "Preguntas y respuestas",
      "Esta edición usa cinco preguntas binarias sobre agua, silencio, aire libre, uniformes y entrada o reserva. Quien pregunta escoge una y responde el siguiente puesto. Responder sí o no es una decisión: puedes mentir, aunque eso vuelve sospechoso tu relato. El registro conserva respuestas y autores. El siguiente interrogador es quien acaba de responder.",
    ],
    [
      "Votar o arriesgar",
      "Tras dos vueltas completas todos votan en privado, sin poder votarse a sí mismos. Si una mayoría relativa única identifica al intruso gana el grupo; un empate o una persona equivocada da la victoria al intruso. Durante un turno de preguntas, el intruso puede revelarse y adivinar el lugar: acertar gana inmediatamente; fallar hace ganar al grupo.",
    ],
    [
      "Ejemplo y IA",
      "Una afirmación sobre agua puede encajar con playa o piscina y todavía no identificar el lugar. La IA ordinaria responde con sus rasgos conocidos; la IA intrusa estima lugares usando solo respuestas públicas. Las votaciones son heurísticas y pueden equivocarse. El final revela intruso, lugar y votos. No hay chat libre ni reconocimiento de conversaciones externas; la deducción se concentra en estas preguntas.",
    ],
  ],
  "linea-de-tiempo": [
    [
      "Colección de acontecimientos",
      "Esta versión original usa acontecimientos de aviación, exploración espacial y la Web con años contrastados mediante NASA, Smithsonian y CERN. Las cartas distinguen un lanzamiento de la llegada de una misión: no confundas ambas fechas. Cada participante recibe tres cartas sin año visible y queda un acontecimiento inicial fechado.",
    ],
    [
      "Colocar en la línea",
      "Elige una carta de tu mano y una posición: antes, entre dos acontecimientos o después de todos. Al confirmar se revela su año. La colocación es correcta si queda en orden no decreciente; dos hechos del mismo año pueden aparecer en cualquier orden relativo. Se compara el año, no el día exacto.",
    ],
    [
      "Aciertos y errores",
      "Una colocación correcta añade la carta a la línea común y suma un punto. Una incorrecta descarta la carta y obliga a robar una nueva si queda mazo. En ambos casos termina tu turno. Ejemplo: Sputnik 1, de 1957, debe quedar antes de Explorer 1, de 1958. El cuaderno muestra la línea fechada y el último resultado.",
    ],
    [
      "Final y modos",
      "Gana quien se quede sin cartas. El marcador cuenta aciertos, pero no sustituye esa condición de victoria. La IA utiliza el conocimiento histórico incluido en el conjunto para ordenar: no pretende desconocer años públicos. El reinicio baraja el mazo conservando participantes y puestos. Las fuentes de consulta aparecen enlazadas en la ayuda y cada evento tiene su procedencia identificada en el motor.",
    ],
  ],
};
