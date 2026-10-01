export const guides: Record<string, [string, string][]> = {
  "2048": [
    [
      "Objetivo y preparación",
      "El tablero de cuatro por cuatro empieza con dos fichas. Consigue una ficha de valor 2048 uniendo iguales: dos doses producen cuatro, dos cuatros ocho y así sucesivamente. Después puedes seguir buscando valores mayores.",
    ],
    [
      "Un movimiento",
      "Una dirección desplaza todas las fichas hasta el borde o hasta otra ficha. Dos iguales que se encuentran se fusionan una vez por jugada; una ficha recién formada no vuelve a fusionarse en esa misma jugada. Solo aparece una nueva ficha, de dos o cuatro, si el tablero cambió.",
    ],
    [
      "Ejemplo",
      "La fila 2–2–2–2, movida a la izquierda, queda 4–4–vacío–vacío, no ocho. Al volver a la izquierda esos dos cuatros sí se pueden unir. Puedes usar flechas, WASD, los botones o un gesto sobre el tablero. La puntuación suma los valores producidos por fusiones.",
    ],
    [
      "Final y estrategia",
      "La partida acaba cuando no quedan huecos ni fusiones posibles. Mantener el número mayor en una esquina y ordenar los valores ayuda a conservar espacio. Pista propone una dirección y deshacer permite practicar. La IA observadora valora espacios, orden y fusiones; no controla dónde aparece la ficha nueva ni garantiza alcanzar 2048.",
    ],
  ],
  chess: [
    [
      "Objetivo y preparación",
      "El ajedrez enfrenta a blancas y negras en 64 casillas. Cada bando comienza con rey, dama, dos torres, dos alfiles, dos caballos y ocho peones. Blancas juega primero. El objetivo es dar jaque mate: atacar al rey y dejarlo sin ninguna respuesta legal. El rey no se captura. En esta mesa las posiciones iniciales y las jugadas legales se comprueban automáticamente.",
    ],
    [
      "Cómo se mueven las piezas",
      "El rey avanza una casilla en cualquier dirección. La dama recorre filas, columnas o diagonales; la torre, filas y columnas; el alfil, diagonales. Estas piezas no atraviesan otras. El caballo salta en L: dos casillas en una dirección y una perpendicular. El peón avanza una casilla hacia el campo rival, o dos desde su posición inicial si ambas están libres; captura una casilla en diagonal hacia delante. Ninguna pieza puede terminar encima de otra propia.",
    ],
    [
      "Jaque y movimientos legales",
      "Una pieza que ataca al rey produce jaque. Debes responder moviendo el rey a una casilla segura, capturando al atacante o interponiendo una pieza cuando sea posible. No puedes hacer una jugada que deje a tu rey atacado, aunque ganes una dama. Un caballo que da jaque no permite interposición. Selecciona o arrastra una pieza: las casillas señaladas muestran únicamente destinos legales.",
    ],
    [
      "Enroque, captura al paso y promoción",
      "El enroque mueve el rey dos casillas hacia una torre y coloca esta al otro lado del rey. Ambos deben conservar el derecho a enrocar; el camino está vacío, el rey no está en jaque ni atraviesa ni termina en una casilla atacada. La captura al paso solo puede realizarse inmediatamente después del avance doble de un peón rival que termina al lado de tu peón. Cuando un peón alcanza la última fila, elige dama, torre, alfil o caballo: no depende de piezas capturadas previamente.",
    ],
    [
      "Cómo acaba una partida",
      "El mate, el abandono o la pérdida por tiempo deciden la partida. Si el bando que debe mover no tiene jugadas legales y no está en jaque, es ahogado: tablas. También hay tablas por material insuficiente habitual y por acuerdo. Cinco repeticiones de la misma posición o 75 movimientos por jugador sin captura ni movimiento de peón producen tablas automáticas; el mate tiene prioridad. Las posiciones muertas excepcionales por bloqueos se resuelven por acuerdo, sin un árbitro automático exhaustivo.",
    ],
    [
      "Reclamaciones y reloj",
      "Tres repeticiones y 50 movimientos permiten reclamar tablas; no obligan a terminarlas automáticamente. En Acciones puedes reclamar con la posición actual o indicar la jugada que completaría la condición. Una posición repetida debe conservar turno, piezas y posibilidades legales, incluyendo enroque y captura al paso. Los ritmos añaden el incremento después de jugar. Sin reloj puedes deshacer; el guardado y la reanudación son locales a este navegador.",
    ],
    [
      "Ejemplo y primeros pasos",
      "Prueba avanzar el peón de e2 a e4 y desarrollar un caballo. Busca controlar el centro, sacar piezas y proteger al rey antes de perseguir capturas. Una dama atacada puede moverse; un rey atacado debe responder al jaque. Si no entiendes un destino, selecciona otra pieza o abre las instrucciones: las casillas iluminadas sirven de guía.",
    ],
    [
      "IA y salas privadas",
      "Stockfish calcula jugadas en las cuatro dificultades. En Solo IA mueve ambos bandos y se puede pausar; la observación se inicia sin reloj para que su velocidad no influya en el resultado. Para jugar por Internet, crea una sala privada y comparte el código. El anfitrión es blancas; ambos navegadores necesitan conexión. No hay listado público, reconexión persistente ni reloj de torneo en salas.",
    ],
  ],
  "connect-four": [
    [
      "Objetivo y preparación",
      "Dos jugadores usan discos de distinto color en una rejilla de siete columnas y seis filas. El tablero empieza vacío. El objetivo es formar cuatro discos propios consecutivos en una fila, columna o diagonal; una línea más larga también incluye cuatro y gana.",
    ],
    [
      "Tu turno",
      "Elige una columna que tenga espacio. El disco cae hasta la casilla libre más baja; no puedes colocarlo en mitad de una columna ni mover uno ya jugado. Tras una caída válida cambia el turno. Una columna llena queda deshabilitada y no consume turno.",
    ],
    [
      "Ejemplo y defensa",
      "Tres discos propios en una fila con una casilla libre accesible pueden convertirse en victoria con la siguiente caída. Comprueba también diagonales: una amenaza puede necesitar primero un disco de apoyo debajo. Antes de atacar, evita que el rival complete una línea inmediata. El centro conecta más direcciones.",
    ],
    [
      "Final y opciones",
      "La primera alineación de cuatro se resalta y termina la partida. Si todas las casillas se llenan sin una alineación, hay empate. La dificultad controla la búsqueda de la IA. Deshacer sirve para practicar; Nueva partida conserva la dificultad y el modo seleccionado.",
    ],
  ],
  "tic-tac-toe": [
    [
      "Objetivo y preparación",
      "X y O alternan marcas en nueve casillas dispuestas en tres filas. X comienza. Ganas con tres marcas propias consecutivas en horizontal, vertical o cualquiera de las dos diagonales. Cada casilla admite una sola marca.",
    ],
    [
      "Un turno clásico",
      "Pulsa una casilla vacía. La marca se coloca y pasa el turno. No puedes mover, borrar ni sobrescribir marcas. Si alguien completa una línea, se detiene inmediatamente; si se llenan las nueve casillas sin ganador, se declara empate.",
    ],
    [
      "Variante continua",
      "Cada bando conserva como máximo tres marcas, con un orden de antigüedad. Al colocar su cuarta en una casilla vacía, desaparece la más antigua antes de comprobar si ha ganado. La marca que caducará se muestra atenuada. No puedes escoger directamente la casilla que aún ocupa esa marca: el destino debe estar libre antes de jugar. No hay empate automático por repetición.",
    ],
    [
      "Ejemplo y consejo",
      "Si X colocó primero arriba a la izquierda y ya tiene tres marcas, su siguiente colocación retirará esa esquina. Una línea que parecía casi formada puede desaparecer: vigila el orden, no solo las posiciones. En clásico, el centro y las esquinas suelen ofrecer más posibilidades. La IA clásica calcula los finales; en continuo busca una profundidad limitada.",
    ],
  ],
  reversi: [
    [
      "Objetivo y preparación",
      "Hay un tablero de ocho por ocho con cuatro discos centrales. Negras comienza. El objetivo es acabar con más discos de tu color, no eliminar al rival lo antes posible. Cada disco tiene dos caras y puede cambiar de propietario muchas veces.",
    ],
    [
      "Una jugada legal",
      "Coloca un disco vacío que encierre una o más cadenas rivales entre él y otro disco tuyo. Las cadenas deben ser rectas, contiguas y sin huecos, en cualquiera de ocho direcciones. Todas las cadenas encerradas por esa colocación se voltean; no eliges cuáles. Debe voltearse al menos un disco.",
    ],
    [
      "Ejemplo y pasos",
      "En una fila con una blanca seguida por negras, poner una blanca al otro extremo convierte las negras intermedias en blancas. No basta con estar cerca: hace falta cerrar la cadena. Las casillas legales están señaladas; puedes pulsarlas o arrastrar el disco de reserva.",
    ],
    [
      "Final y estrategia",
      "Si un jugador no puede colocar, pasa automáticamente; si ninguno puede, termina aunque queden huecos. Gana quien tenga más discos y puede haber empate. Las esquinas son estables y muy valiosas. Evita entregar una esquina por ganar muchos discos temporalmente.",
    ],
  ],
  checkers: [
    [
      "Objetivo y preparación",
      "Damas americanas o inglesas: doce fichas por color en las casillas oscuras de un tablero de ocho por ocho. Solo se usan esas diagonales. Se gana cuando el rival no conserva ninguna jugada legal, por falta de piezas o bloqueo.",
    ],
    [
      "Mover y capturar",
      "Una ficha normal avanza una casilla en diagonal hacia delante. Para capturar salta por encima de una rival adyacente y aterriza en la casilla vacía inmediatamente posterior, también hacia delante. Si hay alguna captura, mover sin capturar está prohibido. Cuando existen varias cadenas puedes elegir cualquiera, pero debes completarla.",
    ],
    [
      "Coronación y ejemplo",
      "Al llegar a la última fila, la ficha se convierte en dama y acaba el turno, incluso si podría seguir capturando como dama. La dama se mueve y captura a corta distancia hacia delante o atrás: no es una dama voladora. Para una cadena, arrastra salto a salto o selecciona origen y cada destino señalado.",
    ],
    [
      "Final y diferencias",
      "Esta edición contempla empate por triple repetición o cuarenta movimientos de cada jugador sin captura ni movimiento de ficha normal. No confundas sus reglas con damas internacionales: aquí las fichas normales no capturan hacia atrás, no se exige tomar el máximo de piezas y las damas no recorren diagonales enteras.",
    ],
  ],
  "damas-internacionales": [
    [
      "Objetivo y preparación",
      "Veinte fichas por bando en las casillas oscuras de un tablero de diez por diez. Blancas comienza. El objetivo es dejar al rival sin movimientos legales. Las piezas normales avanzan una casilla diagonal hacia delante; las capturas y las damas tienen reglas diferentes.",
    ],
    [
      "Capturas obligatorias y toma máxima",
      "Un peón puede saltar sobre una rival en diagonal hacia delante o atrás y aterrizar justo detrás si está vacío. Si puedes capturar, debes hacerlo; entre cadenas se exige la que toma el mayor número de piezas, sin prioridad de damas. El tablero solo ofrece recorridos compatibles con esa cantidad máxima. Completa todos los saltos del recorrido elegido.",
    ],
    [
      "Damas voladoras y coronación",
      "La dama recorre diagonales libres a cualquier distancia. Para capturar atraviesa una rival y puede aterrizar en distintas casillas vacías posteriores. Las víctimas no se retiran físicamente hasta acabar la cadena y bloquean su recorrido: no puedes atravesar una ya capturada. Un peón corona solo si su destino final está en la última fila. Pasar por ella y salir durante una cadena no corona.",
    ],
    [
      "Ejemplo y finales",
      "Una cadena de tres peones capturados se impone a otra de dos, aunque una de las dos sea dama. Pulsa o arrastra cada salto marcado. Repetición y límites especiales de finales pueden producir tablas; la mesa aplica los contadores indicados en Opciones de esta mesa. Mantener damas lejos de bloqueos y prever aterrizajes importa más que tomar la primera pieza visible.",
    ],
  ],
  mancala: [
    [
      "Objetivo y preparación",
      "Esta mesa usa Kalah: seis hoyos y un almacén por participante, con semillas repartidas al empezar. Tus hoyos están en tu lado. El objetivo es terminar con más semillas en el almacén propio; las semillas de los hoyos son recursos para repartir.",
    ],
    [
      "Sembrar",
      "Elige un hoyo propio que tenga semillas. Se recogen todas y se colocan de una en una por el recorrido circular, incluyendo tu almacén y saltando el almacén rival. No puedes elegir un hoyo vacío ni uno del adversario. El número de semillas determina dónde caerá la última.",
    ],
    [
      "Turno extra y captura",
      "Si la última semilla cae en tu almacén, juegas de nuevo. Si cae en un hoyo propio que estaba vacío y el opuesto contiene semillas rivales, capturas esas semillas y la recién colocada para tu almacén. No hay captura en un hoyo rival. Cuenta el recorrido antes de elegir.",
    ],
    [
      "Final y ejemplo",
      "Cuando un lado queda sin semillas, termina: las restantes del otro lado pasan a su almacén. Se comparan los dos almacenes, con empate posible. Un hoyo que termina exactamente en tu almacén puede abrir una secuencia de turnos extra; no obstante, vaciar todo tu lado demasiado pronto puede entregar muchas semillas al rival.",
    ],
  ],
  battleship: [
    [
      "Dos personas",
      "Puedes jugar con otro humano en este dispositivo o en una sala online. Cada flota se coloca automáticamente y cada jugador dispara una vez por turno. En local, entrega el dispositivo y pulsa Mostrar mesa del jugador antes de ver su flota; la mesa del anterior se oculta tras el disparo. Online cada persona solo ve la mesa activa cuando le toca. La flota enemiga permanece oculta hasta que sus barcos son alcanzados.",
    ],
    [
      "Objetivo y preparación",
      "Cada flota ocupa una cuadrícula de diez por diez con cinco barcos, de longitudes cinco, cuatro, tres, tres y dos. Se colocan automáticamente sin solaparse y puedes reorganizar tu flota antes de empezar. El rival no conoce las posiciones de tus barcos.",
    ],
    [
      "Disparar y leer las marcas",
      "Elige una casilla del mar rival que no haya sido probada. Agua significa que no hay barco; tocado, que has acertado una parte; hundido, que has acertado todas las partes de ese barco. Después dispara el contrario. En esta variante acertar no concede un disparo adicional.",
    ],
    [
      "Ejemplo de búsqueda",
      "Después de tocar una casilla, prueba vecinas para descubrir la dirección del barco. Si aciertas varias alineadas, sigue sus extremos. Un hundido elimina esa longitud de los barcos que falta encontrar; no implica que las casillas vecinas deban ser agua en esta variante.",
    ],
    [
      "Victoria e IA",
      "Gana quien hunda primero los cinco barcos. La IA dirige sus disparos usando resultados anteriores y longitudes pendientes: la función que decide el objetivo no recibe la flota oculta. En observación se alternan dos buscadores con esa misma información pública. No puedes disparar dos veces a la misma casilla.",
    ],
  ],
  solitaire: [
    [
      "Objetivo y preparación",
      "Klondike individual con 52 cartas, siete columnas y cuatro bases, una por palo. En las columnas solo están descubiertas las cartas superiores iniciales. El resto forma el mazo; las cartas robadas se muestran en el descarte. Ganas al completar cada base del as al rey.",
    ],
    [
      "Construir columnas y bases",
      "En una columna se coloca una carta un rango menor y de color contrario: por ejemplo, un seis rojo sobre un siete negro. Puedes trasladar una secuencia descubierta ya ordenada respetando esa alternancia. Un hueco admite únicamente un rey o una secuencia que empiece por rey. Las bases crecen por palo desde el as, luego dos, tres y así hasta rey.",
    ],
    [
      "Robar y destapar",
      "Pulsa el mazo para robar una o tres cartas, según la opción; solo la superior del descarte está disponible. Cuando el mazo se agota puedes reciclar el descarte. Al liberar una carta tapada en una columna se descubre automáticamente. Selecciona origen y destino o arrastra el grupo completo. Doble clic intenta enviarlo a su base.",
    ],
    [
      "Práctica y ejemplo",
      "Un seis de corazones puede ir sobre un siete de tréboles, pero no sobre uno de diamantes. Antes de mover a una base, piensa si necesitarás esa carta para destapar una columna. Pistas y deshacer ayudan; una partida puede quedar bloqueada sin que exista solución. La observación usa una heurística sobre cartas visibles y evita repetir posiciones conocidas; puede detenerse sin demostrar que la partida sea imposible.",
    ],
  ],
  "solitario-spider": [
    [
      "Objetivo y preparación",
      "Spider usa 104 cartas, diez columnas y cinco repartos de diez desde el mazo. Elige uno, dos o cuatro palos antes de iniciar. Ganas retirando ocho secuencias completas del rey al as, cada una del mismo palo. Las cartas tapadas permanecen desconocidas hasta quedar expuestas.",
    ],
    [
      "Mover secuencias",
      "Puedes colocar una carta sobre otra de rango inmediatamente superior aunque sus palos sean distintos. Para trasladar varias juntas deben estar descubiertas, en orden descendente y todas del mismo palo. Una columna vacía admite cualquier carta o grupo válido. Al destapar el extremo de una columna, la carta siguiente se descubre sola.",
    ],
    [
      "Repartir y retirar",
      "Cuando necesitas nuevas cartas, reparte una a cada columna. No puedes repartir mientras exista una columna vacía: ocupa los huecos antes. Una cadena completa rey–as del mismo palo se retira automáticamente y deja espacio. Arrastra desde la primera carta del grupo o selecciona origen y destino.",
    ],
    [
      "Ejemplo y consejo",
      "Nueve de picas sobre diez de corazones es legal, pero ese grupo de dos no se arrastra junto hasta reunir el mismo palo. Un hueco permite separar y reorganizar grupos. Procura descubrir cartas antes de consumir otro reparto; deshacer puede rescatar decisiones. La IA de observación busca progreso visible, no garantiza resolver el reparto.",
    ],
  ],
  "solitario-carta-blanca-freecell": [
    [
      "Objetivo y preparación",
      "Carta Blanca reparte 52 cartas visibles entre ocho columnas. Hay cuatro celdas auxiliares, cada una para una carta, y cuatro bases por palo. El objetivo es ordenar todas las cartas en las bases, desde as hasta rey. No hay mazo de robo.",
    ],
    [
      "Columnas y espacios auxiliares",
      "Las columnas se construyen descendiendo de rango y alternando rojo y negro. Cualquier carta puede ocupar una columna vacía. Una celda libre sirve de almacén temporal para una única carta; liberar celdas aumenta tu movilidad. Las bases requieren su palo y el rango siguiente.",
    ],
    [
      "Transportar grupos",
      "La animación mueve grupos, pero se comprueba que podrían trasladarse usando movimientos individuales. La capacidad es (celdas libres + 1) × 2 elevado al número de columnas auxiliares vacías. Si el destino está vacío, ese hueco no cuenta como auxiliar. Tener una cadena ordenada no basta si faltan espacios para transportarla.",
    ],
    [
      "Ejemplo y estrategia",
      "Con dos celdas libres y ninguna columna auxiliar puedes mover hasta tres cartas. Una columna auxiliar vacía eleva ese límite a seis. Evita llenar todas las celdas por comodidad; puede bloquear las cadenas largas. Puedes arrastrar, seleccionar, enviar a base con doble clic, pedir pista y deshacer. La IA heurística puede pararse en un reparto que sí tenga solución.",
    ],
  ],
  minesweeper: [
    [
      "Objetivo y preparación",
      "El campo oculta minas y casillas seguras. Elige tamaño y dificultad antes de empezar. El objetivo es descubrir todas las casillas que no contienen mina; no necesitas marcar todas las minas para ganar. La generación espera a tu primera apertura para hacerla segura.",
    ],
    [
      "Leer números y poner banderas",
      "Un número indica cuántas minas hay en las ocho casillas vecinas, incluyendo diagonales. Una casilla vacía abre una zona sin minas. Usa clic secundario o el modo bandera para marcar una sospecha; una bandera no comprueba que realmente haya mina. Quitarla permite abrir la casilla.",
    ],
    [
      "Deducción y apertura de vecinas",
      "Si un uno solo tiene una vecina cerrada, esa vecina debe contener una mina. Si has marcado todas las minas que rodean a un número, sus otras vecinas son seguras. Pulsar el número puede abrirlas de una vez cuando coincide la cantidad de banderas: banderas incorrectas pueden provocar una explosión.",
    ],
    [
      "Final, pistas y azar",
      "Abrir una mina pierde la partida; descubrir todas las seguras gana. Las pistas usan relaciones locales y suponen correctas las banderas ya puestas. Hay situaciones que exigen suponer o arriesgar. La IA observadora deduce cuando puede y, sin deducción segura, escoge una casilla desconocida sin consultar las minas ocultas; puede perder.",
    ],
  ],
  sudoku: [
    [
      "Objetivo y preparación",
      "Completa nueve filas y nueve columnas divididas en nueve regiones de tres por tres. Cada fila, columna y región debe contener los números uno a nueve exactamente una vez. Las pistas iniciales son fijas y no se borran. El generador comprueba que el problema tenga una única solución.",
    ],
    [
      "Introducir números y notas",
      "Selecciona una casilla libre y pulsa un número de la mesa o del teclado. Borrar retira una entrada propia. El modo lápiz anota candidatos sin fijar el valor: puedes marcar varios y quitarlos. Los conflictos muestran que un valor se repite en alguna unidad; una entrada sin conflicto aún puede ser incorrecta para la solución.",
    ],
    [
      "Ejemplo de deducción",
      "Si una fila contiene todos los números salvo el cuatro y solo queda un hueco, ese hueco es cuatro. Si el siete solo puede ocupar una casilla dentro de una región, también queda decidido aunque esa casilla tenga otros candidatos. Revisa las tres unidades de una casilla antes de fijar el número.",
    ],
    [
      "Ayuda y victoria",
      "La pista revela una casilla de la solución y avisa si hay entradas incompatibles; deshacer recupera el estado anterior. Ganas al completar toda la cuadrícula respetando las unidades. La dificultad cambia cuántas pistas se retiran, sin prometer una categoría de torneo. En observación el solucionador calcula desde los números visibles mediante restricciones y búsqueda, sin recibir la solución guardada.",
    ],
  ],
  memory: [
    [
      "Objetivo y preparación",
      "Todas las cartas comienzan boca abajo y cada dibujo tiene una pareja. En solitario intenta descubrirlas con pocas rondas. Contra otra persona o la IA gana quien recoja más parejas. Puedes elegir 16, 24, 36, 48 o 64 fichas (hasta 32 parejas). El reparto se baraja al iniciar una nueva partida y el reinicio conserva el tamaño elegido.",
    ],
    [
      "Tu turno",
      "Descubre una carta y luego otra distinta que no esté ya emparejada. Si coinciden, permanecen descubiertas y sumas una pareja; puedes repetir. Si son diferentes, se muestran brevemente y vuelven a ocultarse. En una partida con rival cambia entonces el turno.",
    ],
    [
      "Ejemplo y memoria compartida",
      "Al ver un sol en la tercera casilla y más tarde otro en la décima, recuerda ambas posiciones. No necesitas abrir cartas desconocidas cuando ya conoces una pareja. La IA conserva únicamente dibujos que se han revelado públicamente y elige cartas cerradas sin leerlas.",
    ],
    [
      "Final y observación",
      "La partida termina al recoger todas las parejas. Puede haber empate entre participantes. La observación enfrenta dos jugadores automáticos con la misma memoria pública; se ven los descubrimientos antes de resolver cada ronda. La pausa también detiene el cierre de las cartas, para que puedas analizar la decisión.",
    ],
  ],
  go: [
    [
      "Objetivo y preparación",
      "Negras y blancas colocan piedras en las intersecciones. Negras empieza. El objetivo es controlar área: piedras vivas y espacios vacíos rodeados por un único color. Las blancas reciben el komi indicado para compensar la primera jugada. Puedes escoger el tamaño de tablero antes de iniciar.",
    ],
    [
      "Grupos, libertades y captura",
      "Las piedras del mismo color unidas por lados forman un grupo; diagonales no conectan. Una libertad es una intersección vacía vecina por lado. Si tras colocar una piedra un grupo enemigo se queda sin libertades, se retira. No puedes suicidar tu propio grupo ni repetir un tablero prohibido por superko.",
    ],
    [
      "Pasar y contar",
      "Puedes pasar en lugar de colocar. Dos pases consecutivos abren el recuento: marca grupos muertos y confirma el resultado. Si hay desacuerdo, reanuda y juega la posición. Las regiones vacías que tocan ambos colores no cuentan para ninguno. La puntuación de área de esta edición no es puntuación japonesa de territorio y prisioneros.",
    ],
    [
      "Ejemplo y observación",
      "Una piedra aislada en el centro tiene cuatro libertades; en un borde, tres; en una esquina, dos. Rodearla sin dejar ninguna la captura. Protege grupos débiles antes de atacar. La IA es táctica y limitada. En observación, tras ambos pases se realiza el recuento conservador considerando vivas las piedras restantes, sin arbitraje de vida y muerte avanzado.",
    ],
  ],
  ludo: [
    [
      "Objetivo y preparación",
      "Parchís de un dado con dos a cuatro colores y cuatro fichas por color. Las fichas salen de casa, recorren el circuito y entran en su pasillo hacia la meta. Gana el primer color que lleve las cuatro a meta. Elige cuántos colores serán humanos; los restantes los juega la IA.",
    ],
    [
      "Lanzar y elegir ficha",
      "Lanza el dado y mueve una ficha legal el número correspondiente. Un cinco obliga a sacar ficha de casa si se puede. Se necesita una cantidad exacta para entrar en meta. Los destinos posibles están señalados; si no existe movimiento válido el turno pasa automáticamente.",
    ],
    [
      "Seguros, barreras y premios",
      "Los seguros protegen de capturas ordinarias. Dos fichas del mismo color crean una barrera que nadie atraviesa. Capturar concede un avance de veinte con otra ficha; llegar a meta, uno de diez. Un seis permite repetir y obliga a abrir una barrera propia si es posible. Las excepciones de salidas y seis están detalladas en las opciones de esta mesa.",
    ],
    [
      "Ejemplo y precaución",
      "No puedes avanzar ocho si la meta está a siete. A veces mover una ficha menos adelantada es útil para mantener a salvo otra. Tres seises seguidos penalizan la ficha que movió en el segundo, con las excepciones de pasillo y meta. En observación todos los colores toman sus decisiones automáticamente.",
    ],
  ],
  "shogi-ajedrez-japones": [
    [
      "Objetivo y preparación",
      "Shogi enfrenta a Sente y Gote en nueve por nueve. Cada pieza apunta hacia el rival, por lo que la orientación indica su propietario. Sente empieza. Da mate al rey contrario. Las piezas capturadas pasan, sin promoción, a tu reserva y se pueden volver a introducir bajo tu control.",
    ],
    [
      "Movimiento de las piezas",
      "Rey: una casilla en cualquier dirección. Torre: rectas; alfil: diagonales. Lanza: hacia delante a distancia. Caballo: salto de dos hacia delante y uno a un lado, nunca hacia atrás. Peón: una hacia delante, también al capturar. Plata: delante, diagonales delanteras y diagonales traseras. Oro: delante y sus diagonales, lados y atrás recto. Ninguna pieza salvo el caballo atraviesa otras.",
    ],
    [
      "Promociones y lanzamientos",
      "Al mover desde o hacia las tres filas finales puedes promocionar las piezas elegibles. Peón, lanza, caballo y plata promovidos mueven como oro; torre y alfil ganan pasos de rey adicionales. Promociona obligatoriamente si la pieza no podría moverse de nuevo desde su destino. Para lanzar, elige una pieza de la reserva y una casilla vacía. No puede quedar sin movimientos futuros; un peón no se lanza en columna con otro peón propio sin promover, ni dando mate inmediato mediante ese lanzamiento.",
    ],
    [
      "Ejemplo y finales",
      "Capturar una plata promovida te entrega una plata normal utilizable desde la reserva. Un lanzamiento puede bloquear un jaque, pero no dejar atacado tu rey. Cuatro repeticiones se detectan; el jaque perpetuo unilateral pierde. El impasse de 24 puntos se consulta y acepta por acuerdo; no se automatiza una declaración de rey entrante de torneo. Selecciona o arrastra piezas y reservas.",
    ],
  ],
  "xiangqi-ajedrez-chino": [
    [
      "Objetivo y preparación",
      "Ajedrez chino en nueve columnas y diez líneas: las fichas se colocan en intersecciones. Rojas comienza. El río separa los campos y cada rey o general tiene un palacio de tres por tres. Ganas dando mate o dejando al rival sin movimientos: estar bloqueado aquí no produce ahogado en tablas.",
    ],
    [
      "General, consejeros, elefantes y caballos",
      "El general avanza una intersección ortogonal dentro del palacio. Los consejeros avanzan una diagonal dentro del palacio. Un elefante avanza dos diagonales, no cruza el río y se bloquea si el punto intermedio está ocupado. El caballo hace un salto de dos y uno, pero su paso ortogonal inicial, llamado pata, debe estar libre.",
    ],
    [
      "Carros, cañones y soldados",
      "El carro recorre filas o columnas libres. El cañón se desplaza igual sin capturar; para capturar debe saltar exactamente una pieza intermedia, de cualquier color. El soldado avanza una intersección; al cruzar el río también puede ir a los lados, nunca hacia atrás. No hay promoción ni enroque. Los generales no pueden quedar frente a frente en una columna despejada.",
    ],
    [
      "Ejemplo y repeticiones",
      "Una pieza entre un cañón y un enemigo puede servir de pantalla; dos piezas impiden la captura. Puedes arrastrar o seleccionar origen y destino. La mesa detecta jaque perpetuo unilateral y un límite sin capturas; otras repeticiones se revisan por acuerdo. Es una edición casual, no un árbitro completo de persecuciones WXF. En observación la revisión por repetición se resuelve en tablas acordadas.",
    ],
  ],
  "blackjack-21": [
    [
      "Objetivo y preparación",
      "Juegas contra el crupier con fichas virtuales, sin dinero. Intenta acercarte a veintiuno sin pasarte y superar el total del crupier. Del dos al diez valen su número; jota, reina y rey valen diez. El as cuenta once si no te hace pasar, o uno si es necesario.",
    ],
    [
      "Decidir con tus cartas",
      "Pedir añade una carta; plantarse conserva el total y termina tu mano. Con las dos primeras puedes doblar la apuesta y recibir una sola carta. Si son del mismo rango, separar crea manos independientes y exige otra apuesta. Rendirse antes de pedir devuelve media apuesta cuando el crupier ya ha comprobado que no tiene blackjack.",
    ],
    [
      "Crupier y pagos",
      "El crupier revela su carta y sigue la regla de diecisiete configurada. Si te pasas pierdes aunque luego él se pase. Un veintiuno inicial con dos cartas, sin separación, es blackjack y paga tres por dos; ganar normalmente paga uno por uno; empate devuelve la apuesta. El seguro es una apuesta distinta frente al as mostrado y no protege de todas las derrotas.",
    ],
    [
      "Ejemplo y práctica",
      "As más seis es diecisiete blando: puede contar siete si llega una carta alta. Diez más siete es diecisiete duro. Siguiente mano mantiene tu saldo; Nueva partida inicia una práctica nueva. La IA observadora usa sus cartas y la carta visible del crupier para una estrategia básica simplificada; no lee la carta tapada ni el orden del mazo.",
    ],
  ],
  brisca: [
    [
      "Objetivo y preparación",
      "Baraja española de cuarenta cartas, tres en la mano de cada participante y un triunfo visible bajo el mazo. Se juega una mano entre dos personas. El objetivo es reunir más tantos de los ciento veinte disponibles; ganar muchas bazas sin cartas valiosas puede dar pocos puntos.",
    ],
    [
      "Cómo se gana una baza",
      "Quien sale juega cualquier carta y el otro responde con cualquiera: no hay obligación de seguir palo ni montar. Gana el triunfo más alto; si ninguno juega triunfo, la carta más alta del palo de salida. As y tres son las más fuertes, por encima de rey, caballo y sota. El vencedor recoge ambas, roba primero y sale en la siguiente baza.",
    ],
    [
      "Valor y ejemplo",
      "As vale once, tres diez, rey cuatro, caballo tres y sota dos; el resto vale cero. Si oros es triunfo, un dos de oros gana a un as de copas, aunque el as aporte más tantos. Un tres fuera del palo de salida no gana por ser alto. El triunfo visible se roba al final del mazo.",
    ],
    [
      "Final y variantes",
      "Tras jugar todas las cartas se suman tantos: más de sesenta gana y sesenta a sesenta empata. El intercambio opcional de siete o dos por el triunfo solo aparece en el momento permitido antes de robar tras ganar. En local revela la mano al tomar tu turno; la IA decide con su mano, salida y triunfo, sin cartas ajenas.",
    ],
  ],
  mus: [
    [
      "Objetivo y preparación",
      "Cuatro jugadores forman dos parejas, sentados alternadamente: uno y tres contra dos y cuatro. Cada uno recibe cuatro cartas. Elige cuatro u ocho reyes y el objetivo de treinta o cuarenta tantos. La mano sirve para desempatar y cambia entre repartos. No se usa dinero.",
    ],
    [
      "Mus y descartes",
      "Pedir mus propone cambiar cartas; todos deben consentir. Si alguien corta, las manos se conservan y comienzan los lances. Con mus aceptado selecciona las cartas que quieres cambiar y confirma el descarte. La primera mano usa mus corrido para fijar la mano; no es una eliminación ni un turno de apostar.",
    ],
    [
      "Grande, Chica, Pares y Juego",
      "Grande compara cartas altas; Chica, bajas. Pares compara parejas, medias —tres iguales— y duples —dos parejas o cuatro iguales—. Solo participan quienes anuncian pares. Juego exige sumar al menos treinta y uno con los valores del mus; treinta y uno tiene prioridad, luego treinta y dos y el resto según jerarquía. Si nadie tiene juego se disputa Punto, buscando el mayor total menor de treinta y uno.",
    ],
    [
      "Envites, órdago y recuento",
      "Pasar evita subir; envidar propone tantos; aceptar mantiene la apuesta y subir exige respuesta. Rechazar entrega el envite anterior a la otra pareja. Un órdago aceptado decide todo el juego por ese lance; no equivale a una apuesta normal de pocos tantos. Tras los lances se revelan manos y se suman apuestas y premios en orden, deteniéndose al alcanzar el objetivo. Esta mesa no incorpora señas, deje ni partidas de varias vacas. Revisa la ayuda de opciones para las equivalencias de ocho reyes.",
    ],
  ],
  "mahjong-solitario": [
    [
      "Objetivo y preparación",
      "Retira todas las fichas de una tortuga de varias capas. Es mahjong solitario, no el juego de cuatro jugadores con manos y descartes. El reparto inicial se construye con una secuencia de retirada válida; puedes bloquearlo al elegir otras parejas.",
    ],
    [
      "Qué significa libre",
      "Una ficha debe estar completamente descubierta por arriba y tener al menos uno de sus dos lados horizontales libre. No basta con ver una parte de la cara; una ficha que la cubre impide retirarla. Tampoco puedes sacar una encajada entre vecinas a izquierda y derecha. Las casillas y las capas determinan los bloqueos.",
    ],
    [
      "Elegir parejas",
      "Pulsa dos fichas iguales y libres. Las de números y honores deben coincidir exactamente. Las flores pueden emparejarse con cualquier flor, y las estaciones con cualquier estación. Retirar la pareja puede liberar fichas inferiores y laterales. Si la selección no forma pareja legal, no se retira.",
    ],
    [
      "Ejemplo y herramientas",
      "Dos fichas iguales visibles no son necesariamente libres. Una pareja que abre una capa profunda suele ser más útil que otra que no libera nada. Pista señala una pareja, deshacer recupera el estado anterior y reordenar cambia las caras restantes si la forma permite hacerlo. Ganas al dejar la mesa vacía; si no hay parejas, busca deshacer o reiniciar. La IA solo retira parejas legales.",
    ],
  ],
  "yahtzee-la-generala": [
    [
      "Objetivo y preparación",
      "Cinco dados y una hoja con trece categorías. En solitario busca una puntuación alta; contra rival gana el total mayor. Esta ficha usa puntuación Yahtzee, no las reglas alternativas de Generala. Cada categoría solo se anota una vez.",
    ],
    [
      "Tres tiradas y conservación",
      "En tu turno puedes lanzar hasta tres veces. Después de cada tirada toca los dados que quieres conservar; los demás se vuelven a lanzar. Puedes liberar uno conservado si cambias de plan. No hace falta consumir las tres tiradas: cuando quieras, anota una categoría libre y termina el turno.",
    ],
    [
      "Puntuación y ejemplo",
      "Arriba se suman solo dados de la cara elegida; alcanzar sesenta y tres concede treinta y cinco extra. Trío y póker suman todos los dados si cumples su requisito. Full puntúa veinticinco; escalera de cuatro, treinta; de cinco, cuarenta; cinco iguales, cincuenta. Azar suma cualquier combinación. Con 3–3–3–5–5 puedes anotar full o sumar nueve en treses, según tu estrategia.",
    ],
    [
      "Joker, ceros y final",
      "Si no te sirve nada, debes tachar una casilla libre con cero; no puedes saltarte el turno. Los cinco iguales adicionales pueden dar bonificación y activar las obligaciones joker descritas en las opciones de esta mesa. El orden forzoso importa: no todas las casillas están disponibles. Al llenar las hojas se comparan totales, incluyendo bonus. La IA elige conservación y categoría con una heurística.",
    ],
  ],
  mastermind: [
    [
      "Creador y descifrador humanos",
      "En Jugadores locales o Con amigos online, el jugador 1 prepara el código en la mesa: elige cuatro colores y pulsa Ocultar código y comenzar. El jugador 2 lo deduce con un máximo de diez intentos y las pistas se calculan automáticamente. En local, entrega el dispositivo después de ocultar el código. Online el invitado espera mientras el anfitrión crea el secreto; después recibe su turno con el código tapado. Al acertar o agotar los intentos se revela el resultado a ambos.",
    ],
    [
      "Objetivo y preparación",
      "Descubre un código de cuatro posiciones elegido entre seis colores. Antes de empezar selecciona si se permiten repeticiones. Dispones de diez intentos. También puedes crear un código y observar cómo lo resuelve la IA; en Solo IA se genera uno nuevo y el deductor recibe únicamente las pistas.",
    ],
    [
      "Enviar un intento",
      "Elige un color para cada posición y confirma las cuatro. Una pista exacta indica un color situado correctamente; una pista desplazada, un color presente en otro lugar. El recuento no te dice a qué posición pertenece cada pista. Si se prohíben repetidos, cada color del intento debe ser distinto.",
    ],
    [
      "Duplicados y ejemplo",
      "Cada copia del código solo puede dar una pista. Frente a rojo–rojo–azul–verde, un intento rojo–amarillo–rojo–violeta tiene un exacto y un desplazado: las dos copias de rojo cuentan por separado. No se puede obtener más pistas de un color que copias tenga el código.",
    ],
    [
      "Deducción y final",
      "Cuatro exactos ganan; agotar diez intentos pierde y revela el secreto. Reúne posibilidades que expliquen todas las respuestas anteriores, no solo la última. Sugerencia usa ese mismo proceso. La IA elimina candidatos y divide posibilidades con una búsqueda limitada; no se anuncia como una garantía matemática de cinco intentos.",
    ],
  ],
  quarto: [
    [
      "Objetivo y preparación",
      "Dieciséis piezas únicas combinan cuatro atributos: clara u oscura, alta o baja, redonda o cuadrada, hueca o maciza. El tablero tiene cuatro por cuatro. Se gana con una fila, columna o diagonal de cuatro piezas que compartan al menos un atributo. No hay piezas propias y ajenas.",
    ],
    [
      "Entregar y colocar",
      "Primero elige una pieza disponible para el rival. Él debe colocar precisamente esa pieza en una casilla vacía; después elige la siguiente para ti. Dar una pieza es una decisión tan importante como colocarla: evita regalar un atributo que complete una línea inmediata.",
    ],
    [
      "Ejemplo de línea",
      "Cuatro piezas oscuras forman Quarto aunque tengan diferentes alturas y formas. Cuatro redondas también ganan aunque sus colores difieran. Una colección de cuatro piezas sin atributo común no gana. En esta edición no cuentan cuadrados de dos por dos, solo filas, columnas y diagonales completas.",
    ],
    [
      "Canto y final",
      "En automático la victoria se reconoce al colocar. En manual debes pulsar Quarto; el rival puede reclamar una línea que olvidaste antes de colocar su pieza. Si ambos la omiten deja de ser reclamable según esta variante. En la última casilla ambos pueden pasar el canto y terminar en empate. La IA aprovecha victorias visibles y procura no regalar la siguiente.",
    ],
  ],
  "el-ahorcado": [
    [
      "Objetivo y preparación",
      "Descubre una palabra oculta letra a letra. La mesa te indica su categoría y su longitud. Antes de jugar elige seis errores para clásico u ocho para una práctica más relajada. El vocabulario local permite jugar sin Internet.",
    ],
    [
      "Un intento",
      "Pulsa una letra del teclado de la mesa. Si aparece en la palabra, se revelan todas sus posiciones; si no, se añade un fallo y una parte al dibujo. Una letra usada no puede repetirse y no consume otro intento. Las vocales con tilde se simplifican; Ñ conserva su identidad.",
    ],
    [
      "Ejemplo",
      "Si la palabra es GATO, elegir A muestra _ A _ _, y elegir Z suma un fallo. Si hay dos aes, una sola elección revela ambas. Utiliza la categoría para pensar en palabras, en vez de recorrer letras al azar.",
    ],
    [
      "Victoria y observación",
      "Ganas al descubrir todas las letras antes de alcanzar el límite; si lo alcanzas, se revela la palabra y termina. La IA observadora filtra su vocabulario por categoría, máscara visible y letras ya probadas, y busca la letra más frecuente. No recibe la palabra secreta.",
    ],
  ],
  "adivina-la-palabra": [
    [
      "Objetivo y preparación",
      "Hay una palabra secreta de cinco letras y seis oportunidades. Cada intento debe formar una palabra admitida por el vocabulario local, que puedes consultar en la mesa. El objetivo es deducir la palabra completa combinando todas las pistas.",
    ],
    [
      "Leer los colores",
      "Verde significa letra correcta en posición correcta. Ocre significa que esa letra está en la palabra, pero debe colocarse en otro lugar. Gris indica que no queda una copia disponible de esa letra para ese intento. Primero se resuelven los verdes y luego las letras desplazadas.",
    ],
    [
      "Ejemplo con letras repetidas",
      "Si el secreto tiene una sola A y propones dos, como máximo una recibe verde u ocre. La otra puede ser gris sin que eso signifique que A no exista. Una respuesta admitida pero incorrecta consume intento; un texto no admitido no lo consume.",
    ],
    [
      "Final y estrategia",
      "La palabra exacta gana. Tras seis intentos fallidos se muestra la solución. Empieza con letras distintas y evita contradicciones con filas previas. La IA calcula candidatos que producen exactamente las respuestas vistas y escoge una con buena separación de posibilidades: nunca recibe el secreto.",
    ],
  ],
  "palabras-encadenadas": [
    [
      "Objetivo y preparación",
      "Dos participantes alternan palabras sin repetir. La primera puede ser cualquiera del vocabulario local silabeado. Después la primera sílaba de la nueva palabra debe coincidir con la última de la anterior. No usamos la variante de última letra.",
    ],
    [
      "Un turno",
      "Escribe una palabra y pulsa Encadenar. Puedes consultar palabras disponibles y su separación silábica o elegir una sugerencia del campo. El sistema rechaza palabras repetidas, fuera del vocabulario o cuya primera sílaba no coincida; ese rechazo no pasa el turno.",
    ],
    [
      "Ejemplo",
      "GATO termina en TO: TOMATE empieza en TO. TOMATE termina en TE, por lo que TELA sirve; después LANA empieza en LA. Una palabra que empieza por las mismas letras pero las reparte en una sílaba distinta no sirve. El vocabulario y su silabeo determinan esta edición.",
    ],
    [
      "Final e IA",
      "Pierde quien se rinda o deba jugar sin ninguna palabra admitida disponible. La IA busca una palabra que deje pocas respuestas al rival; puede aprovechar una que cierre inmediatamente la cadena. La partida no exige escribir a contrarreloj y toda la cadena queda visible para comprobar repeticiones.",
    ],
  ],
  "basta-tutti-frutti": [
    [
      "Objetivo y preparación",
      "Basta, Tutti Frutti y Stop son nombres habituales de esta familia. Aquí se juegan cinco rondas entre dos participantes con Nombre, Animal, País y Color. Cada ronda propone una letra distinta y cada participante dispone de sesenta segundos para rellenar su formulario.",
    ],
    [
      "Escribir y cerrar",
      "Escribe una respuesta por categoría que comience con la letra dada y pulsa Basta; el contador también puede cerrar el formulario. En local se juega por turnos y no se muestran respuestas previas hasta el resultado. Se normalizan mayúsculas y tildes, conservando Ñ.",
    ],
    [
      "Ejemplo de puntuación",
      "Con A, ANA, ÁGUILA, ARGENTINA y AZUL son respuestas admitidas. Una respuesta válida única vale diez, una repetida por el otro participante vale cinco y una vacía o fuera del vocabulario vale cero. No importa que dos participantes escriban el mismo término en distintas categorías: se compara dentro de cada categoría.",
    ],
    [
      "Vocabulario y final",
      "La lista de respuestas admitidas se puede consultar en la mesa. Es una edición de validación automática con un vocabulario compacto, no un validador de todos los nombres y lugares del mundo. Tras la quinta ronda se suman los puntos, con empate posible. La IA escribe desde su propio repertorio sin leer el formulario contrario.",
    ],
  ],
  "el-diccionario": [
    [
      "Objetivo y preparación",
      "De dos a cuatro participantes compiten inventando significados convincentes para palabras poco conocidas. Esta edición contiene definiciones y engaños redactados para Games, sin copiar un diccionario comercial. Todos participan en la invención; el sistema actúa como moderador de la respuesta verdadera.",
    ],
    [
      "Inventar y votar",
      "Escribe una definición falsa de entre diez y doscientos cuarenta caracteres y guárdala. Las de los demás quedan ocultas durante la escritura. Cuando todos han escrito, se mezclan con la verdadera y cada participante vota una. No puedes votar tu propia definición falsa; textos exactamente iguales se fusionan en una opción.",
    ],
    [
      "Ejemplo y puntuación",
      "Si acertaste la definición verdadera sumas dos puntos. Si otra persona votó tu engaño, sumas uno por cada voto recibido. Si dos autores escribieron el mismo engaño, ambos reciben su crédito. La respuesta verdadera y los autores se revelan al terminar la votación, no antes.",
    ],
    [
      "Final y rival",
      "Tras cinco palabras se comparan las puntuaciones acumuladas. En local pasa el dispositivo sin enseñar borradores. La IA tiene conocimiento léxico de parte del repertorio y usa una heurística para el resto; al decidir recibe textos, palabra y opciones que no puede votar, pero no la marca de verdadera. No es un modelo de lenguaje conectado.",
    ],
  ],
  cruzapalabras: [
    [
      "Objetivo y preparación",
      "Juego original de palabras cruzadas en nueve por nueve. Dos participantes reciben siete letras puntuadas; quedan letras en un mazo común. El objetivo es conseguir más puntos formando palabras conectadas. Los atriles iniciales se preparan con una palabra posible y después se mezclan. Usa el vocabulario local visible en la mesa.",
    ],
    [
      "Colocar y confirmar",
      "Selecciona una letra del atril y un hueco, o arrástrala. Pon todas las letras nuevas en una misma fila o columna y confirma. La palabra inicial debe pasar por el centro. Más adelante una letra nueva debe conectar con el tablero anterior. No puede haber huecos entre las letras de la jugada: los espacios pueden estar ocupados por letras previas.",
    ],
    [
      "Cruces y multiplicadores",
      "Cada palabra horizontal y vertical creada debe estar admitida, incluso un cruce corto. La puntuación suma letras de cada palabra formada. 2L y 3L multiplican esa letra; 2P multiplica la palabra. Solo se activan con letras recién puestas, aunque las antiguas vuelven a sumar su valor normal. Usar siete letras de una vez añade cincuenta puntos.",
    ],
    [
      "Ejemplo, pases y final",
      "Una A puede completar MAR en una fila y LA en una columna: se puntúan ambas si están admitidas. Retirar letras cancela el borrador. Pasar o cambiar el atril cede turno; solo puedes cambiar con siete letras en el mazo. Cuatro pases o cambios seguidos terminan. También acaba cuando se agotan mazo y un atril; se restan letras restantes y el que vació recibe las del rival. No es Scrabble oficial: cambian tablero, vocabulario, reparto y algunas opciones.",
    ],
  ],
  "cajas-timbiriche-dots-and-boxes": [
    [
      "Objetivo y preparación",
      "Cajas, Timbiriche o Dots and Boxes empieza con una cuadrícula de puntos sin líneas. Elige el número de cuadrados por lado. Dos participantes compiten por apropiarse de más cajas; no hay fichas que mover ni diagonales válidas.",
    ],
    [
      "Trazar un lado",
      "Pulsa un segmento libre entre dos puntos vecinos. Si no cierras ninguna caja, pasa el turno. Si completas el cuarto lado, esa caja se marca con tu número, sumas un punto y vuelves a jugar. Una misma línea puede ser el último lado de dos cajas y dar ambos puntos.",
    ],
    [
      "Ejemplo de cadenas",
      "Si una caja ya tiene tres lados, el siguiente jugador puede completarla y seguir, capturando otras encadenadas. Por eso dibujar el tercer lado puede entregar varios puntos al rival. A veces sacrificar una caja corta evita conceder una cadena larga; contar solo cajas inmediatas no basta.",
    ],
    [
      "Final y observación",
      "Se termina cuando todas las cajas tienen propietario. Gana la puntuación mayor, con empate posible. La IA prioriza cierres y trata de evitar terceras aristas peligrosas; no garantiza una solución óptima de todas las cadenas. En observación los turnos extra se conservan igual que en juego humano.",
    ],
  ],
  gomoku: [
    [
      "Objetivo y preparación",
      "Dos colores colocan piedras en un tablero de quince por quince. Negras empieza. La versión elegida es Gomoku libre: gana una línea de cinco o más piedras propias contiguas en horizontal, vertical o diagonal. No es Renju ni una apertura de torneo Swap2.",
    ],
    [
      "Colocar",
      "Pulsa una intersección vacía. Cada turno añade una piedra y las ya colocadas permanecen fijas. No hay capturas, desplazamientos ni prohibiciones especiales para negras. Las piedras se colocan sobre los cruces, no dentro de los cuadrados.",
    ],
    [
      "Ejemplo y amenazas",
      "Cuatro piedras con ambos extremos libres amenazan ganar en cualquiera de ellos. Una diagonal cuenta igual que una fila. Si una línea tiene un hueco, aún no es contigua: completar ese hueco puede conectar dos fragmentos. Bloquear una victoria inmediata suele ser más urgente que crear un par propio.",
    ],
    [
      "Final y diferencias",
      "Se destaca la línea ganadora y se detiene la partida. Un tablero completo sin victoria empata. Aquí una línea de seis sí gana; en otros reglamentos de Gomoku exacto puede no hacerlo. La IA detecta victorias, bloqueos y patrones abiertos con una evaluación táctica limitada.",
    ],
  ],
  "conecta-5-pente": [
    [
      "Objetivo y preparación",
      "Pente combina cinco en línea con capturas. Tablero de diecinueve por diecinueve, dos colores y turnos alternos. En esta edición libre negras empieza y no se aplican restricciones de apertura de torneo.",
    ],
    [
      "Alinear o capturar",
      "Ganas formando cinco o más piedras contiguas en horizontal, vertical o diagonal, o capturando cinco parejas rivales. Una captura ocurre al colocar una piedra que completa propia–rival–rival–propia en línea recta. Se retiran inmediatamente las dos rivales. Una jugada puede capturar varias parejas en direcciones distintas.",
    ],
    [
      "Ejemplo y excepciones",
      "Si hay negra–blanca–blanca y añades negra al otro extremo, desaparecen ambas blancas y aumenta tu contador de parejas. No se capturan cadenas de tres con esa regla. Si tú colocas una piedra formando un par dentro de un encierro que ya existía, no desaparece automáticamente: captura solo la nueva colocación del rival que cierre el patrón.",
    ],
    [
      "Final y estrategia",
      "La victoria por línea o por cinco parejas se comprueba después de las capturas de la jugada. Por eso una captura puede romper una amenaza de cinco. Vigila también el contador: cuatro parejas capturadas convierten cualquier captura siguiente en victoria. La IA examina alineaciones, amenazas y capturas sin prometer nivel de competición.",
    ],
  ],
  hex: [
    [
      "Objetivo y preparación",
      "Elige un tablero romboidal de siete, nueve u once hexágonos por lado. Coral debe conectar sus bordes superior e inferior; azul, los laterales. La conexión usa celdas propias vecinas por cualquiera de sus seis lados. No se cuentan simples contactos por esquinas.",
    ],
    [
      "Colocar e intercambiar",
      "Cada turno ocupa una celda vacía con tu color. Las piedras no se mueven ni se capturan. Justo después de la primera colocación, el segundo participante puede intercambiar bandos: se queda con el color de la primera piedra y el primero vuelve a jugar con el otro. La piedra permanece en su sitio.",
    ],
    [
      "Ejemplo",
      "No necesitas una línea recta. Una cadena que rodea piezas enemigas y alcanza ambos bordes propios gana igual. El intercambio permite que el segundo jugador tome una apertura demasiado fuerte, así que el primero debe pensar en una posición equilibrada. Los colores asignados a cada jugador se actualizan en la barra.",
    ],
    [
      "Final y decisiones",
      "La conexión se comprueba después de cada colocación. Hex no admite empate por tablero completo: alguno de los colores habrá conectado. La IA compara rutas con los huecos necesarios y considera el intercambio al abrir. No usa una solución perfecta del tablero completo.",
    ],
  ],
  "sprouts-brotes": [
    [
      "Objetivo y preparación",
      "Sprouts original es un juego de curvas planas. Esta mesa ofrece Brotes sobre cuadrícula: una variante digital finita con recorridos ortogonales y puntos iniciales seleccionables. Gana quien realiza la última conexión legal. La cuadrícula y sus límites forman parte de las reglas de esta versión.",
    ],
    [
      "Elegir extremos y trazado",
      "Selecciona dos puntos con capacidad disponible, o el mismo dos veces para un lazo. El sistema propone una ruta por celdas libres y muestra una vista previa. Cambiar trazado modifica el orden de búsqueda para explorar otra ruta; Confirmar línea ejecuta el movimiento. Cancelar borra la selección sin consumir turno.",
    ],
    [
      "Límites y punto nuevo",
      "Una línea no puede cruzar ni tocar otra salvo en los extremos elegidos, ni atravesar puntos ajenos. Cada punto admite como máximo tres conexiones. Un lazo consume dos en su punto de salida. Toda jugada añade un punto en medio del trazado, que empieza con dos conexiones y conserva una disponible. La cifra dentro de un punto muestra su capacidad restante.",
    ],
    [
      "Ejemplo y final",
      "Un punto con una conexión puede admitir un lazo; uno con dos, no. Dos puntos con dos conexiones aún pueden conectarse y quedar agotados. La búsqueda comprueba todas las parejas y la existencia de rutas en esta cuadrícula para detectar el final. No pretende arbitrar todas las curvas continuas del Sprouts original; la geometría digital puede cambiar qué jugadas son posibles.",
    ],
  ],
  backgammon: [
    [
      "Objetivo y preparación",
      "Cada bando tiene quince fichas en veinticuatro puntos triangulares. Claras avanza de veinticuatro a uno; oscuras al contrario. La casa de claras son uno a seis y la de oscuras diecinueve a veinticuatro. Gana quien retire primero todas sus fichas. La tirada inicial compara un dado por bando; empates se repiten y el mayor empieza con ambos valores.",
    ],
    [
      "Dados y puntos legales",
      "Un dado permite avanzar una ficha esa distancia; puedes usar los dados en cualquier orden y sobre la misma ficha o diferentes. Debes usar el máximo de valores posible. Si solo puede usarse uno de dos distintos, debe ser el mayor cuando sea jugable. Dobles permiten cuatro avances. Un punto con dos o más rivales está cerrado; con una sola, la golpeas y la mandas a la barra.",
    ],
    [
      "Barra y retirada",
      "Una ficha en la barra debe entrar en la casa rival antes de mover otras. El dado determina el punto de entrada y siguen aplicándose bloqueos. Solo puedes retirar cuando todas tus fichas estén en tu casa y ninguna en la barra. Un dado exacto retira la ficha de su punto; un exceso solo retira desde el punto más alejado que aún ocupes. Puedes mover con dos clics o arrastrando una ficha, también desde la barra. Selecciona un dado si hay varias maneras de jugar el mismo destino.",
    ],
    [
      "Ejemplo, cubo y resultado",
      "Con cinco y tres puedes avanzar ocho con una ficha si son legales ambas etapas, no saltar un punto bloqueado intermedio. Antes de lanzar puedes ofrecer doblaje si posees el cubo o está centrado: aceptar dobla el valor y entrega el cubo al rival; rechazar pierde por el valor anterior. Retirar con el rival sin ninguna retirada produce gammon, doble; si además tiene ficha en la barra o tu casa, backgammon, triple. Es una partida independiente con cubo hasta sesenta y cuatro, sin Crawford ni reglas de match.",
    ],
  ],
  colonizadores: [
    [
      "Objetivo y alcance",
      "Colonizadores es nuestra variante inicial de un eurogame de recursos y construcción inspirado en CATAN. No es una edición oficial. Compiten tres o cuatro participantes para alcanzar ocho puntos: poblado uno, ciudad dos y ruta más larga dos. No incluye cartas de desarrollo, puertos, mayor ejército ni comercio privado entre jugadores.",
    ],
    [
      "Preparación y producción",
      "La isla tiene regiones de madera, arcilla, lana, trigo, mineral y desierto. Coloca poblado y camino en orden de ida y vuelta, para que quien empieza elija el último segundo poblado. Ese segundo poblado recibe recursos vecinos. Al comenzar un turno lanza dos dados: cada región con la suma produce una carta por poblado vecino y dos por ciudad. La región del ladrón no produce; si el banco no cubre toda la demanda de un recurso, no entrega ese recurso.",
    ],
    [
      "Construir y comerciar",
      "Camino cuesta madera y arcilla. Poblado cuesta una de madera, arcilla, lana y trigo. Ciudad sustituye un poblado por dos trigo y tres mineral. Tus caminos deben conectar con tu red y no atravesar poblados enemigos; un poblado nuevo requiere camino propio y distancia de al menos dos aristas a cualquier otro poblado. Selecciona la construcción y pulsa un lugar marcado. Puedes entregar cuatro recursos iguales al banco por uno diferente disponible. Límites: quince caminos, cinco poblados y cuatro ciudades por persona.",
    ],
    [
      "Siete, ladrón y ruta",
      "Con siete, quien tenga más de siete cartas descarta la mitad redondeada hacia abajo, eligiendo los recursos. Luego el jugador del turno mueve el ladrón a otra región y roba una carta aleatoria a un rival vecino con cartas. La ruta más larga debe medir al menos cinco caminos distintos conectados; no reutiliza una arista ni atraviesa una construcción enemiga. En empate conserva el premio su titular si sigue empatado; si nadie lo conserva, queda sin adjudicar.",
    ],
    [
      "Ejemplo y final",
      "Un poblado junto a bosque con seis recibe madera cuando sale seis, salvo bloqueo del ladrón. Convertirlo en ciudad duplica su producción y aumenta un punto neto. Puedes comerciar y construir varias veces antes de Terminar turno. Ganas cuando alcanzas ocho durante tu turno; los inventarios son públicos en esta variante. La IA usa producción, costes y caminos hacia futuros poblados; no es un rival de torneo ni una implementación del CATAN completo.",
    ],
  ],
};
