/** Rules describe the implemented editions; references may use different variants. */
export const traditionalGuides: Record<string, [string, string][]> = {
  "molino-nine-men-s-morris": [
    [
      "Objetivo y preparación",
      "Dos bandos disponen de nueve fichas y 24 puntos conectados. Ganas reduciendo al rival a dos fichas o bloqueando todas sus salidas. Primero colocáis alternadamente en puntos libres. Un molino son tres fichas propias en una de las líneas dibujadas: no cuenta una diagonal imaginaria ni una línea que atraviese el hueco central.",
    ],
    [
      "Molinos y capturas",
      "Al completar un molino, el turno continúa para retirar una ficha rival. Debes escoger una que no pertenezca a un molino; si todas están en molinos puedes retirar cualquiera. Formar dos molinos con la misma colocación concede una retirada, no dos. La captura es una fase propia y los destinos iluminados representan fichas enemigas.",
    ],
    [
      "Movimiento y final",
      "Cuando tus reservas se agotan, mueve una ficha por una conexión a un punto vecino vacío. No se salta por encima de otra. Si te quedan exactamente tres fichas puedes volar a cualquier punto libre. Puedes romper un molino y reconstruirlo en un turno posterior. Esta mesa declara tablas por tercera repetición, incluyendo turno y reservas, o tras 600 acciones como límite de sesión.",
    ],
    [
      "Ejemplo y consejo",
      "Colocar en los tres puntos del lado superior del cuadrado exterior forma un molino. Un punto de la esquina exterior y otro de la esquina interior no son vecinos. Busca dos líneas que compartan un punto: así puedes alternar amenazas y obligar al contrario a defender. La IA combina material, molinos y amenazas; no es un solucionador perfecto.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
  shax: [
    [
      "Edición y objetivo",
      "Shax se presenta con doce fichas por bando en el tablero de 24 puntos. Se sigue la descripción de Rick Davies sobre el juego observado en Mogadiscio. Un jare es una línea de tres fichas. Gana quien deje al adversario con dos. Se mueve únicamente por conexiones; no existe vuelo con tres fichas.",
    ],
    [
      "Apertura",
      "Coloca alternadamente las doce fichas en puntos libres. Los jare formados durante la colocación no capturan inmediatamente. La mesa recuerda quién formó el primero. Tras llenar el tablero ese jugador retira una ficha enemiga, después el contrario retira otra y empieza a mover quien hizo el primer jare. Si nadie lo hizo, estas dos retiradas comienzan por J2, que también inicia el movimiento.",
    ],
    [
      "Jare y desbloqueo",
      "Mover a un punto vecino vacío y formar un nuevo jare permite retirar cualquier ficha rival, aunque esté en otro jare. Si dejas al contrario sin movimiento, debes abrirle una salida: el turno permanece contigo y solo se ofrecen movimientos que le permitan responder. Esa maniobra no concede captura aunque forme un jare. Después vuelve a jugar la persona desbloqueada.",
    ],
    [
      "Final y ejemplo",
      "La tercera repetición o 600 acciones cierran la sesión en tablas. Si no existe una maniobra legal de desbloqueo también se declara tablas. Durante la apertura puedes ver Retirar rival en lugar de Mover: completa ambas retiradas para liberar el tablero. El marcador inicial muestra las reservas; las pérdidas se actualizan al capturar.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
  "tsoro-yematatu": [
    [
      "Preparación y objetivo",
      "Dos participantes colocan tres fichas cada uno sobre los siete puntos del triángulo. Gana la primera línea de tres propias: los tres lados, la línea vertical desde el vértice al centro de la base o la fila horizontal del medio. Son las líneas completas dibujadas, no cualquier grupo de tres fichas.",
    ],
    [
      "Colocar y mover",
      "Se coloca una ficha por turno en un punto vacío. Tras agotar las reservas queda exactamente un hueco: en esta variante documentada por el Digital Ludeme Project puedes mover cualquiera de tus fichas a ese hueco, incluso si no son vecinos. No hay capturas ni salto sobre piezas. La alineación puede ganar también durante la colocación.",
    ],
    [
      "Final y ejemplo",
      "Si tienes las dos esquinas de la base, completar el centro de la base gana. Vigila también los dos extremos de la fila intermedia. La tercera repetición de tablero, turno y reservas produce tablas; la mesa añade un límite de 200 acciones. La IA busca victorias inmediatas y evita entregar una alineación inmediata al rival.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
  "mu-torere": [
    [
      "Variante y preparación",
      "Ocho puntos forman un aro y el noveno es el centro. Cada participante tiene cuatro fichas en cuatro puntos consecutivos del aro. El centro comienza vacío. Se utiliza First Move, variante recogida por el Digital Ludeme Project: la primera jugada debe permitir una respuesta al rival. No se aplica otra variante que restringe toda entrada al centro a fichas vecinas de un enemigo.",
    ],
    [
      "Mover y ganar",
      "Desplaza una ficha a un hueco conectado: desde el aro a su vecino o al centro, y desde el centro a cualquier punto libre del aro. No se captura ni se salta. Ganas dejando al rival sin movimientos. La restricción de la apertura termina después de la primera jugada.",
    ],
    [
      "Ejemplo y final",
      "Al principio no puedes ocupar el centro con una ficha cuya retirada no abra ninguna respuesta rival; ese destino no se ofrece. Más tarde ocupar el centro puede cortar una salida importante. Tercera repetición o 300 acciones producen tablas. El marcador conserva cuatro fichas por bando porque nunca se retiran piezas.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
  "bagh-chal-movimiento-de-tigres": [
    [
      "Bandos y objetivo",
      "J1 controla veinte cabras y empieza colocando una; J2 tiene cuatro tigres situados en las esquinas. Las cabras ganan bloqueando todos los movimientos de los tigres. Los tigres ganan al capturar cinco cabras. Los dos bandos tienen objetivos diferentes: no se juega como damas.",
    ],
    [
      "Colocación y movimientos",
      "Las cabras colocan una por turno mientras quede reserva. Solo después de colocar las veinte pueden mover una cabra por una conexión a un punto vacío. Los tigres ya pueden mover durante esa colocación. Las líneas diagonales solo existen en los puntos marcados por el tablero; no se puede inventar otra conexión.",
    ],
    [
      "Captura",
      "Un tigre puede saltar una cabra adyacente siguiendo una línea recta si el punto inmediatamente detrás está vacío. La cabra se retira y aumenta el contador de capturas. Capturar no es obligatorio y solo se permite un salto por turno, sin cadenas. Las cabras no capturan. La reserva disminuye al colocar, no al mover.",
    ],
    [
      "Consejo y tablas",
      "Una cabra aislada y un hueco a su espalda pueden facilitar la captura. Colocar grupos que se protejan limita las entradas de los tigres. La mesa añade tercera repetición y 500 acciones como cierre en tablas; si las cabras no tienen respuesta legal y los tigres aún se mueven, gana el bando de los tigres.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
  fanorona: [
    [
      "Preparación",
      "El tablero tiene nueve columnas y cinco filas de intersecciones. Cada bando comienza con 22 piedras, dejando vacío el centro. Se mueve una intersección por una conexión marcada: algunas admiten diagonales y otras no. Gana quien elimine todas las piedras rivales o las deje sin respuesta legal.",
    ],
    [
      "Dos maneras de capturar",
      "Aproximación: al moverte hacia el enemigo, retiras la fila contigua de piedras rivales que empieza inmediatamente después del destino. Retirada: al alejarte, retiras la fila contigua rival situada detrás del origen. Solo se sigue esa misma línea hasta el primer hueco, piedra propia o borde. Si ambas son posibles debes elegir una, nunca capturar las dos en una sola maniobra.",
    ],
    [
      "Obligación y cadenas",
      "Si existe cualquier captura, el primer movimiento del turno debe capturar. Después puedes continuar capturando con la misma piedra o terminar. No puedes volver a un punto visitado en la cadena ni repetir consecutivamente la misma dirección de movimiento. Selecciona Aproximación o Retirada antes de mover; Terminar secuencia cede el turno. Si no hay más capturas la cadena termina sola.",
    ],
    [
      "Ejemplo y cierre",
      "Si te mueves hacia dos rivales seguidos sin hueco entre ellos, Aproximación retira ambos. Si hay un hueco antes del segundo, solo retira el primero. Una cadena puede cambiar quién tiene la iniciativa aunque el turno todavía sea del mismo jugador. La mesa declara tablas por tercera repetición o 600 acciones.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
  surakarta: [
    [
      "Tablero y objetivo",
      "Dos bandos empiezan con doce fichas cada uno sobre una cuadrícula de seis por seis. Los ocho bucles externos son vías para capturar. Gana quien elimine las fichas rivales o las bloquee. Una jugada tranquila mueve a un punto vecino vacío, también en diagonal.",
    ],
    [
      "Capturar por los bucles",
      "Una captura sigue una vía horizontal o vertical, atraviesa al menos un bucle y acaba en la primera ficha encontrada, que debe ser enemiga. No puede atravesar ninguna ficha, propia ni rival. En una intersección debe seguir recto: solo el bucle cambia la dirección. Se permiten varios bucles en un mismo recorrido. No se captura simplemente entrando en una casilla vecina ocupada.",
    ],
    [
      "Interacción y consejo",
      "Selecciona tu ficha: las casillas verdes incluyen movimientos vecinos y capturas válidas por las vías. Arrastrar hasta un rival iluminado realiza la captura. Alejarte de una boca de bucle puede evitar ataques largos; ocupar una vía con una ficha también bloquea esa trayectoria. Los bucles son parte de las reglas, no decoración.",
    ],
    [
      "Tablas",
      "La mesa cierra en tablas con la tercera repetición, cien movimientos consecutivos sin captura o 600 acciones. El marcador indica fichas supervivientes. Estos límites son criterios de sesión de Games y se muestran aquí para evitar observaciones automáticas interminables.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
  "tafl-hnefatafl": [
    [
      "Edición Fetlar",
      "Se juega en once por once con 24 atacantes de J1 y doce defensores más el rey de J2. Empiezan los atacantes. Los defensores ganan llevando el rey a una esquina. Los atacantes ganan cercando al rey por sus cuatro lados, o tres si el cuarto es el trono, o encerrando al rey y todos los defensores en un anillo sin salida al borde.",
    ],
    [
      "Movimiento y refugios",
      "Todas las piezas recorren líneas ortogonales libres como torres. Solo el rey ocupa trono y esquinas. Las demás pueden atravesar el trono vacío. Una pieza normal cae entre dos enemigos o entre enemigo y refugio hostil cuando un movimiento cierra la pinza. El rey también ayuda a capturar. El trono es hostil a atacantes siempre; a defensores solo si está vacío. El borde no captura.",
    ],
    [
      "Rey y final",
      "El rey no cae por una pinza de dos piezas. En el borde no puede ser rodeado por cuatro lados; aun así puede perder si queda completamente bloqueado o todo su bando encerrado. No se incluyen escudo de borde ni fuertes de Copenhagen. Sin jugada legal se pierde. Tercera repetición o 600 acciones producen tablas en esta mesa.",
    ],
    [
      "Ejemplo y uso",
      "Selecciona una pieza o el rey y mueve hacia un destino iluminado. Un movimiento entre dos enemigos no provoca por sí solo tu captura: la pinza debe cerrarla después el atacante. Los refugios se marcan con estrellas y el rey con corona. La IA valora material, amenazas al rey y distancia a las esquinas; no es una IA de torneo.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
  halma: [
    [
      "Tablero y preparación",
      "Se juega en un tablero de dieciséis por dieciséis. Con dos participantes hay diecinueve fichas por bando; con cuatro, trece por participante. Los campamentos coloreados están en las esquinas. Cada persona debe ocupar íntegramente el campamento opuesto con sus fichas. El primero que lo consigue gana. No se capturan fichas.",
    ],
    [
      "Paso o salto",
      "Paso mueve a cualquiera de los ocho vecinos vacíos. Saltar atraviesa una ficha adyacente de cualquier color hasta el hueco inmediatamente detrás, también en diagonal. Puedes encadenar saltos con esa misma ficha y parar cuando quieras; no mezclas pasos y saltos en un turno. No se vuelve a visitar un punto en la cadena. Selecciona Terminar saltos para ceder el turno.",
    ],
    [
      "Campamento de destino",
      "Una ficha que entra en su campamento objetivo ya no puede salir de él, aunque sí moverse dentro. El contador muestra cuántas fichas tienes ya dentro. El campamento rival sigue siendo un espacio ocupado: no se permite aterrizar sobre otra pieza. No se añade una penalización arbitraria por conservar piezas en casa.",
    ],
    [
      "Ejemplo y final",
      "Una ficha a dos casillas de un hueco puede saltar si la casilla intermedia está ocupada; no importa quién sea el dueño. Construir puentes de fichas permite recorridos largos. Una tercera repetición, ausencia de movimiento o 1800 acciones cierran en tablas esta edición. El modo de cuatro participantes admite mezcla de puestos humanos e IA y salas privadas.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
  awale: [
    [
      "Preparación y objetivo",
      "Awalé se presenta como Oware Abapa: doce cuencos, seis propios por bando, con cuatro semillas en cada uno. No se siembra en depósitos laterales. J1 controla la fila inferior y J2 la superior. Gana quien capture más de 24 de las 48 semillas; una igualdad final es tablas.",
    ],
    [
      "Siembra y alimentación",
      "Elige un cuenco propio no vacío, recoge todas sus semillas y distribúyelas de una en una en sentido antihorario. Si completas una vuelta, saltas el cuenco de origen, que queda vacío. Si el rival no tiene semillas debes elegir una jugada que lo alimente, si existe. Los cuencos iluminados son los que cumplen ese requisito.",
    ],
    [
      "Capturas",
      "Si la última semilla cae en el campo rival y ese cuenco queda con dos o tres, se capturan esas semillas. Después se retrocede sobre cuencos rivales consecutivos de dos o tres, hasta encontrar otra cantidad o campo propio. En esta edición una gran cosecha que vaciaría todo el campo rival no captura nada: la siembra permanece válida.",
    ],
    [
      "Final y consejo",
      "Si no hay una jugada que alimente al rival vacío, se contabilizan las semillas restantes por campo y se comparan capturas. La tercera repetición o 800 acciones también contabilizan por campo para cerrar la sesión. Mantén opciones de alimentación y calcula dónde cae la última semilla antes de sembrar. El total de semillas capturadas y presentes siempre conserva 48.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
  "ur-juego-real-de-ur": [
    [
      "Reconstrucción Finkel",
      "Cada bando tiene siete fichas en reserva y un recorrido de catorce casillas hasta la salida. J1 empieza por comodidad de la interfaz. Se usan cuatro dados binarios: cada uno aporta cero o uno y el total es de cero a cuatro. Es una reconstrucción moderna jugable, no el reglamento astronómico completo de la tablilla antigua.",
    ],
    [
      "Mover y capturar",
      "Después de lanzar, debes mover una ficha legal el total exacto. El selector permite escoger una ficha en reserva o ya en el tablero. No puedes terminar sobre una propia. Los tramos privados no se comparten; en la fila central puedes capturar una rival, que vuelve a reserva. La roseta central es segura y no permite capturar ni ocupar la ficha que la tiene.",
    ],
    [
      "Rosetas y salida",
      "Terminar en una roseta permite volver a lanzar. Para salir necesitas el valor exacto: desde la última casilla solo sirve uno. Las fichas salidas no bloquean a las siguientes. Si sale cero o no hay movimiento legal aparece Pasar. Gana quien saque las siete fichas. El marcador cuenta fichas ya salidas.",
    ],
    [
      "Ejemplo y consejo",
      "Una ficha en reserva con un tres entra en la tercera casilla de su recorrido. Una ficha en la última roseta con dos no puede salir y debes mover otra o pasar. Una roseta puede valer más que avanzar lejos: concede iniciativa y seguridad. La IA combina progreso, capturas y repeticiones de turno.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
  senet: [
    [
      "Reconstrucción educativa",
      "Las reglas antiguas completas de Senet no se conservan. Esta mesa adapta el material educativo del Kelsey Museum con cinco fichas por bando, colocadas alternadamente en las diez primeras casas, y un dado de seis caras. J1 empieza. El recorrido de treinta casas sigue una S: primera fila hacia la derecha, segunda hacia la izquierda, tercera hacia la derecha.",
    ],
    [
      "Avanzar e intercambiar",
      "Lanza, elige ficha y mueve exactamente el resultado. No acabas sobre una propia. Si terminas sobre una rival, intercambiáis posiciones. No se implementa protección por parejas ni barreras de otras reconstrucciones. Si ninguna ficha puede moverse aparece Pasar. Debes pisar exactamente la casa 26 antes de pasar al tramo final.",
    ],
    [
      "Casas especiales",
      "La 15 es renacimiento. La 27 es agua: tu ficha abandona el recorrido y en un turno posterior puede volver a la 15 si está libre, consumiendo ese movimiento. Si está ocupada, puedes mover otra ficha. Desde la 28 solo sales con tres; desde la 29 con dos; desde la 30 con uno. Desde la 26 puedes continuar si no superas la salida, pero siempre respetando sus restricciones.",
    ],
    [
      "Final y ejemplo",
      "Gana quien saque las cinco fichas. El selector identifica las fichas pendientes de renacer; el marcador cuenta salidas. Desde la casa 25 con un dos no saltas directamente a la 27: primero debes alcanzar la 26. Esta reconstrucción no se presenta como única edición histórica ni como todas las variantes modernas.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
  pachisi: [
    [
      "Edición y equipos",
      "Cuatro puestos forman dos equipos: J1 con J3 y J2 con J4. Cada puesto controla cuatro fichas, inicialmente en el centro. El primer equipo que devuelve sus ocho fichas gana. Esta edición usa seis cauris, un único circuito por ficha y J1 como primer puesto; no incluye la vuelta voluntaria adicional ni la subasta de quién empieza.",
    ],
    [
      "Recorrido y cauris",
      "Cada ficha baja por las siete casas centrales de su brazo, recorre las 68 posiciones exteriores y vuelve por su carril al centro. Cuenta las caras abiertas de seis cauris: dos, tres, cuatro, cinco o seis valen lo mismo; uno vale diez; cero vale veinticinco. Seis, diez y veinticinco son gracia: puedes introducir una ficha de reserva y vuelves a tirar después de mover o pasar. La primera ficha puede entrar con cualquier resultado.",
    ],
    [
      "Capturas y castillos",
      "Puedes apilar piezas propias o de tu compañero. Un castillo ocupado por enemigos no admite aterrizaje. En otra casilla exterior, aterrizar sobre enemigos devuelve todas sus fichas al centro y concede otra tirada. Para reintroducir una ficha capturada necesitas gracia, aunque originalmente fuese la primera. Se permite pasar voluntariamente una tirada. No hay barreras ni premio de veinte del parchís español.",
    ],
    [
      "Llegada y uso",
      "El centro exige cuenta exacta. No existe tirada de uno: dejar una ficha a una casilla de meta la inmoviliza definitivamente. Puedes pasar para esperar una tirada mejor; la IA evita esa posición. Si todas las fichas pendientes quedan así, la mesa declara tablas. Tras completar las cuatro fichas de un puesto, se omiten sus turnos; su compañero sigue jugando. El resultado identifica el equipo J1/J3 o el J2/J4. Escoge ficha en el selector y mueve o arrastra al destino. Los castillos se marcan con estrellas; los carriles solo se usan al entrar y regresar.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
  "yut-nori": [
    [
      "Equipos y preparación",
      "Esta mesa ofrece dos bandos con cuatro fichas cada uno sobre el recorrido cuadrado de veinte puntos y sus diagonales. J1 empieza. Es la edición de cuatro palos sin back-do: una cara clara cuenta uno; cero claras vale cinco. Los resultados son uno, dos, tres, cuatro o cinco. Cuatro y cinco dan otra tirada antes de mover.",
    ],
    [
      "Tiradas y rutas",
      "Acumula todas las tiradas concedidas y después usa cada resultado completo sobre una ficha o grupo: no se divide. Puedes elegir el orden de los valores pendientes desde Acción. Solo cambias a un atajo si la ficha comienza su movimiento exactamente en la esquina de acceso o en el centro correspondiente; pasar sobre ese punto no permite girar. Exterior mantiene la vuelta larga.",
    ],
    [
      "Grupos y capturas",
      "Terminar sobre tus fichas las reúne y en movimientos posteriores viajan juntas. Terminar sobre un grupo enemigo devuelve todas sus fichas a reserva y concede una nueva tirada, conservando tus valores pendientes. La salida admite exceso: todas las fichas de un grupo que cruza la meta salen. Gana quien saque las cuatro.",
    ],
    [
      "Ejemplo y uso",
      "Sacar cuatro y después dos deja dos movimientos separados, no un seis único. Puedes usar el dos primero. El selector muestra valor, ficha y ruta. El número dentro de una piedra indica el tamaño del grupo. Nueva partida conserva modo y participantes. La IA busca salidas, atajos y capturas; no contempla todos los futuros posibles de los palos.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
  nyout: [
    [
      "Edición histórica",
      "Nyout usa la edición de Culin de dos participantes con cuatro caballos cada uno. El tablero tiene veinte puntos circulares y una cruz de nueve puntos. La entrada está a la izquierda del punto superior y se recorre el aro en sentido antihorario. Es pariente de Yut Nori, pero aquí las capturas no conceden una tirada adicional. J1 empieza.",
    ],
    [
      "Palos y atajos",
      "Se lanzan cuatro palos claros u oscuros: de una a cuatro caras claras producen ese valor; ninguna clara produce cinco. Cuatro y cinco conceden otra tirada y se mueve después de terminar de lanzar. Cada resultado se usa entero, en el orden elegido. Si acabas exactamente en un extremo de la cruz puedes elegir recorrerla al lado opuesto en tu movimiento siguiente; no se gira en el centro.",
    ],
    [
      "Caballos y final",
      "Tus caballos que coinciden se agrupan y se mueven juntos. Aterrizar en un rival devuelve su grupo a reserva. Al sobrepasar el último punto superior sales, sin necesitar cuenta exacta. Gana quien saque todos sus caballos. Se mantienen los valores pendientes tras una captura, pero no se añade ningún valor nuevo por ella.",
    ],
    [
      "Ejemplo e interfaz",
      "El número en cada ficha muestra cuántos caballos contiene. Selecciona un valor y el caballo antes de mover. Desde una casilla intermedia del aro no puedes usar un atajo aunque la tirada atraviese una entrada. Esta mesa no incluye las modalidades históricas de tres o cuatro participantes; se ofrece únicamente el duelo de cuatro caballos por bando.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
  "juego-de-la-oca": [
    [
      "Objetivo y dados",
      "De dos a seis participantes recorren la espiral de 63 casas con una ficha y dos dados. Gana quien llegue exactamente a 63. Si te pasas, cuentas hacia atrás desde la meta. J1 empieza. En la primera tirada de nueve, tres y seis llevan a 26; cuatro y cinco, a 53. Las demás tiradas suman ambos dados.",
    ],
    [
      "Ocas y puentes",
      "Las ocas están en 5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54 y 59. Caer en una repite el avance del resultado y concede otra tirada; si el rebote te lleva hacia atrás se conserva esa dirección durante la cadena. El puente conecta 6 con 12 y concede otra tirada. Las casillas se identifican con símbolos y números.",
    ],
    [
      "Trampas de esta edición",
      "Posada 19: espera dos turnos. Pozo 31: espera a que llegue otra ficha, que libera a la anterior y queda ocupando el pozo. Laberinto 42: vuelve a 30. Cárcel 52: espera tres turnos; otra llegada libera a la persona anterior. Calavera 58: vuelve a salida. Estas duraciones pertenecen a esta edición de Games; existen variantes regionales diferentes.",
    ],
    [
      "Uso y final",
      "Lanzar dos dados avanza automáticamente. Cumplir espera consume un turno pendiente; no evita la penalización ni arroja nuevos dados. Solo IA realiza las mismas tiradas aleatorias que un humano: no hay decisiones tácticas que pueda mejorar. Varias fichas pueden compartir una casa salvo los efectos de relevo descritos. La espiral conserva la numeración en pantallas pequeñas.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
  sugoroku: [
    [
      "E-sugoroku de Games",
      "Se ofrece un recorrido ilustrado original de treinta estaciones inspirado en los e-sugoroku japoneses, no el ban-sugoroku emparentado con backgammon. Participan de dos a cuatro personas con una ficha cada una y un dado de seis caras. J1 empieza. El primero que llega exactamente a la estación 30 gana.",
    ],
    [
      "Viaje y casillas",
      "Lanzar avanza tantas estaciones como indique el dado. Pasarse de treinta hace rebotar hacia atrás. Las rutas especiales son 3→10, 8→15, 12→5, 17→24, 22→14 y 27→20: se aplican únicamente al aterrizar, una vez. Estaciones 6 y 19 obligan a descansar el siguiente turno. Las flechas muestran a qué estación lleva cada ruta.",
    ],
    [
      "Ejemplo y modos",
      "Desde 28, sacar cinco te deja en 27 por rebote y su ruta te devuelve a 20. Descansar consume el turno y mantiene tu estación. Varias fichas pueden compartir estación y no hay capturas. Solo IA lanza y cumple descansos, como cualquier participante: el azar decide el progreso. No se atribuye este recorrido a una lámina histórica concreta.",
    ],
    [
      "Lectura del tablero",
      "La ruta se lee de izquierda a derecha en una fila y de derecha a izquierda en la siguiente. Los números son la referencia del recorrido. Abre la ayuda cuando quieras consultar una flecha o descanso; Nueva partida vuelve a salida conservando participantes, puestos y modalidad.",
    ],
    [
      "Controles, IA y salas",
      "Al entrar, configura los puestos y pulsa Empezar partida. Contra la IA incluye un humano; Dos jugadores/Local permite compartir dispositivo; Con amigos crea o une una sala mediante código; Solo IA observa sin humanos y permite pausar. Los puestos adicionales pueden combinar humanos e IA. En partidas de movimiento, elige acción, selecciona origen y pulsa o arrastra a un destino verde. Cuando una acción no requiere origen, pulsa directamente el destino. Las capturas y continuaciones conservan al actor real del turno. Los cálculos automáticos se ejecutan en un Worker y en salas solo los dirige el anfitrión. Nueva partida, abajo a la derecha, repite la configuración. Ajustes vuelve a abrirla. Las salas dependen de conexión entre navegadores y no se conservan como partidas en un servidor.",
    ],
  ],
};
export const traditionalSources: Record<
  string,
  { title: string; url: string }[]
> = {
  "molino-nine-men-s-morris": [
    {
      title: "Masters Traditional Games: reglas de Nine Mens Morris",
      url: "https://www.mastersofgames.com/rules/morris-rules.htm",
    },
  ],
  shax: [
    {
      title: "Rick Davies: observación del Shax en Mogadiscio",
      url: "https://mogadishuimages.wordpress.com/wp-content/uploads/2016/05/an-introduction-to-shax-a-somali-game2.pdf",
    },
  ],
  "tsoro-yematatu": [
    {
      title: "Digital Ludeme Project: Tsoro Yemutatu, triángulo",
      url: "https://ludii.games/details.php?keyword=Tsoro+Yemutatu+(Triangle)",
    },
  ],
  "mu-torere": [
    {
      title: "Digital Ludeme Project: variante First Move",
      url: "https://ludii.games/details.php?keyword=Mu+Torere",
    },
  ],
  "bagh-chal-movimiento-de-tigres": [
    {
      title: "Lemery Games: Bagh Chal y reglamento de su edición",
      url: "https://lemerygames.com/pages/bagh-chal",
    },
  ],
  fanorona: [
    {
      title: "Nestorgames: reglamento de Fanorona",
      url: "https://www.nestorgames.com/rulebooks/FANORONA_EN.pdf",
    },
  ],
  surakarta: [
    {
      title: "Masters Traditional Games: reglas de Surakarta",
      url: "https://www.mastersofgames.com/rules/surakarta-rules.htm",
    },
  ],
  "tafl-hnefatafl": [
    {
      title: "Aage Nielsen: reglas Fetlar; comparar criterios de tablas",
      url: "https://aagenielsen.dk/fetlar_rules_en.php",
    },
  ],
  halma: [
    {
      title: "Digital Ludeme Project: Halma, dos y cuatro participantes",
      url: "https://ludii.games/details.php?keyword=Halma",
    },
  ],
  awale: [
    {
      title:
        "Digital Ludeme Project: variantes de Oware; esta mesa omite captura de gran cosecha",
      url: "https://ludii.games/details.php?keyword=Oware",
    },
  ],
  "ur-juego-real-de-ur": [
    {
      title: "RoyalUr: reconstrucción moderna de Finkel",
      url: "https://royalur.net/rules",
    },
  ],
  senet: [
    {
      title: "Kelsey Museum: reconstrucción educativa de Senet",
      url: "https://lsa.umich.edu/content/dam/kelsey-assets/kelsey-images/education/educational-resources/games/Senet%20Instructions.pdf",
    },
  ],
  pachisi: [
    {
      title: "Masters Traditional Games: reglas y variantes de Pachisi",
      url: "https://www.mastersofgames.com/rules/pachisi-rules.htm",
    },
  ],
  "yut-nori": [
    {
      title: "Digital Ludeme Project: Yut Nori",
      url: "https://ludii.games/details.php?keyword=Yut+Nori",
    },
  ],
  nyout: [
    {
      title: "Digital Ludeme Project: Nyout, edición Culin",
      url: "https://ludii.games/details.php?keyword=Nyout",
    },
  ],
  "juego-de-la-oca": [
    {
      title:
        "Cayro: otra edición publicada de La Oca, comparar las casillas especiales",
      url: "https://cayro.es/wp-content/uploads/2025/01/530-ins-530-oca-aft.pdf",
    },
  ],
  sugoroku: [
    {
      title: "Biblioteca Nacional de Japón: e-sugoroku y ban-sugoroku",
      url: "https://www.ndl.go.jp/kaleido/e/entry/12/",
    },
  ],
};
