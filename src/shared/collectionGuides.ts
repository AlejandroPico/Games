/** These guides describe the actual implemented editions, including generator and AI limits. */
export const collectionGuides: Record<string, [string, string][]> = {
  "tierras-de-losetas": [
    [
      "Objetivo y preparación",
      "Cada participante construye regiones en un mapa compartido de seis por seis. Hay tres paisajes: bosque, ciudad y pradera. El mercado muestra tres losetas. Con dos puestos se colocan 18 losetas; con tres, 27; con cuatro, 36. El objetivo es reunir la puntuación más alta, combinando paisajes y regiones propias.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Un turno tiene dos decisiones. Primero toma una loseta del mercado: se repone inmediatamente con un paisaje al azar. Después colócala. La primera va en F3C3; las demás deben tocar ortogonalmente una ya puesta. No puedes ocupar una casilla llena ni colocar aislado. La selección conserva tu turno hasta completar la colocación.",
    ],
    [
      "Final y puntuación",
      "Cada colocación da un punto más uno por vecino del mismo paisaje, cualquiera que sea su propietario. Al agotar la reserva, cada bando añade dos puntos por loseta de su mayor región propia de un mismo paisaje. Las diagonales no conectan regiones. Si varias personas terminan con la máxima puntuación se declara empate.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: colocar un bosque junto a dos bosques concede tres puntos. Si al terminar tu mayor región propia tiene cuatro bosques, añade ocho puntos. Un bosque rival separa tus regiones a efectos de ese bonus, aunque sí haya ayudado a puntuar la colocación. La IA prioriza contactos y continuidad de su región.",
    ],
  ],
  "el-mercado-de-joyas": [
    [
      "Objetivo y preparación",
      "Empiezas sin gemas ni descuentos. Hay cinco colores de gemas y oro comodín; el suministro inicial por color es cuatro, cinco o siete para dos, tres o cuatro participantes, más cinco oros. Se exponen seis joyas de una baraja de 45. Cada compra concede un descuento permanente de su color y puede dar puntos de prestigio.",
    ],
    [
      "Cómo se desarrolla un turno",
      "En tu turno toma tres colores distintos, o dos del mismo color si había al menos cuatro en el suministro, compra una joya, o reserva una del mercado. Si quedan menos de tres colores disponibles puedes tomar todos los que queden. Reservar concede un oro si hay y admite hasta tres reservas. Puedes comprar también tus reservas. El oro paga cualquier déficit tras aplicar descuentos y gemas. Las joyas compradas o reservadas se reponen mientras quede mazo.",
    ],
    [
      "Final y puntuación",
      "No puedes conservar más de diez fichas: esta edición devuelve automáticamente fichas del color normal más abundante, resolviendo empates por el orden de colores. Alcanzar quince puntos anuncia la última ronda: se continúa hasta que todas las personas hayan jugado igual número de turnos. A las sesenta rondas se cierra igualmente por puntuación. El empate en prestigio es tablas.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: coste tres rubíes y dos zafiros, con descuento de un rubí, exige dos rubíes y dos zafiros. Si tienes un rubí, dos zafiros y un oro, puedes comprar. Las cartas de primer nivel no dan prestigio, pero sus descuentos facilitan las siguientes. La IA combina descuentos y compras; la edición no reproduce cartas de un editor comercial.",
    ],
  ],
  "la-villa-agricola": [
    [
      "Objetivo y preparación",
      "Cada granja comienza con dos familiares, cuatro comidas y sin recursos. Se juegan seis rondas. Ocho espacios permiten reunir madera, comida, semillas y ovejas; arar; ampliar familia; construir horno; o cosechar. Algunas reservas se acumulan entre rondas. El objetivo es desarrollar una granja productiva y alimentar a sus habitantes.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Coloca un trabajador en un espacio no ocupado esta ronda. El bosque entrega toda su madera; pesca toda su comida; semillas todo su grano; ovejas todo su rebaño. Arar añade un campo. Ampliar familia cuesta cuatro maderas, admite hasta cuatro familiares y aporta un trabajador desde la ronda siguiente. Horno cuesta tres maderas y solo se compra una vez. Cosechar concede dos comidas más campos por el máximo entre uno y tu grano. La ronda termina al agotar trabajadores o acciones útiles.",
    ],
    [
      "Final y puntuación",
      "En cada cosecha de fin de ronda, un campo produce una comida si tienes grano; con al menos dos ovejas nace otra. Un horno cocina todas las ovejas, dos comidas cada una. Alimenta con dos comidas por familiar: cada comida ausente resta tres puntos. Tras la sexta cosecha añade tres por familiar, dos por campo, uno por grano y oveja, uno por cada dos maderas y tres por horno. Mayor saldo gana; empates son tablas.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: tres familiares necesitan seis comidas. Si solo tienes cuatro tras cosechar, faltan dos y pierdes seis puntos. La familia nueva no realiza una acción adicional en la ronda de su compra, pero sí debe alimentarse al final. La IA valora alimentación y expansión; es una edición original de colocación de trabajadores.",
    ],
  ],
  "isla-de-monstruos": [
    [
      "Objetivo y preparación",
      "Dos a cuatro monstruos comienzan con diez vidas, cero energías y cero puntos. La isla está libre. En tu turno tira tres dados; sus caras son dos estrellas, dos energías, un corazón y un ataque. Después resuelve o paga dos energías ya almacenadas para repetir los tres dados. No puedes financiar una repetición con energías aún sin resolver.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Cada estrella da un punto y cada energía una energía. Un corazón cura una vida, hasta diez, si estás fuera de la isla. Ataques desde la isla golpean a todos los rivales vivos; desde fuera golpean solo a su ocupante. Por cuatro energías puedes añadir una descarga de dos daños a todos los rivales al resolver. Tras resolver, si la isla estaba libre o su ocupante murió, la ocupas. Su ocupante suma dos puntos en cada resolución de su propio turno.",
    ],
    [
      "Final y puntuación",
      "Un monstruo sin vidas queda eliminado y sus turnos se omiten. Gana inmediatamente quien alcance veinte puntos o sea el último vivo. Tras 150 turnos resueltos se compara prestigio entre supervivientes. Puedes repetir varias veces mientras pagues, pero la energía es limitada. No existe retirada voluntaria de la isla en esta edición.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: desde fuera, dos ataques dañan dos veces al ocupante; si muere, ocupas la isla y sumas dos puntos. Un corazón de esa tirada sí te cura porque aún estabas fuera. La IA resuelve normalmente y usa descargas para eliminar; no predice las próximas tiradas. Variante original de Games, sin poderes o cartas comerciales.",
    ],
  ],
  "el-gran-bazar": [
    [
      "Objetivo y preparación",
      "Empiezas con doce monedas. Se subastan doce lotes, uno cada ronda, de seda, especias, cerámica o perfume. Dan respectivamente dos, tres, cuatro y cinco puntos. El objetivo es equilibrar compras de valor, conjuntos completos y dinero conservado. La cantidad de mercancías adquiridas es pública; las pujas de la ronda se mantienen ocultas.",
    ],
    [
      "Cómo se desarrolla un turno",
      "En el orden del líder cada persona introduce una única puja entre cero y su saldo. No se modifica después ni se ve cuánto han pujado los demás. Al completar todas se revelan juntas. La máxima gana y solo quien gana paga. Un empate favorece a la primera persona en el orden cíclico desde el líder. El líder avanza un puesto, todas las bolsas reciben dos monedas y comienza la siguiente subasta.",
    ],
    [
      "Final y puntuación",
      "Después del lote doce, cada conjunto formado por una unidad de las cuatro mercancías distintas añade cinco puntos. Puedes puntuar varios conjuntos. Cada tres monedas conservadas añaden un punto. Gana la suma máxima, con empate declarado. Incluso una puja de cero puede ganar si nadie ofrece más.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: ofertas 3, 5 y 5, con J2 como líder, dan el lote a J2, que paga cinco; J3 no paga. Dos sedas, una especia, tres cerámicas y un perfume forman un conjunto. La IA estima el valor de su propio conjunto y saldo, sin leer pujas ajenas. Edición original de subasta sellada.",
    ],
  ],
  "diseno-de-mosaicos": [
    [
      "Objetivo y preparación",
      "Construye una pared de cinco por cinco a lo largo de cinco rondas. Cada participante tiene cinco filas de patrón con capacidades uno, dos, tres, cuatro y cinco. Los cinco colores tienen posiciones prefijadas en la pared: cada fila desplaza un lugar el orden. La oferta común se rellena cada ronda.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Toma todas las piezas de un color y asigna las que quepan a una fila de patrón compatible: vacía o de ese mismo color. No puedes elegir una fila cuya casilla de pared para ese color esté ocupada. Los sobrantes van al suelo, uno por pieza; puedes enviar toda la selección al suelo. Al vaciar la oferta se resuelven los patrones completos, una loseta a su pared, y se liberan sus piezas. Los patrones incompletos se conservan.",
    ],
    [
      "Final y puntuación",
      "Una casilla nueva aislada puntúa uno. Si está conectada horizontal o verticalmente, suma las longitudes de sus líneas continuas; solo se suma una línea si supera uno. El suelo resta un punto por pieza, sin bajar el saldo de cero. Al terminar la quinta ronda se añaden dos por fila completa, siete por columna completa y diez por cada color presente en las cinco filas. Gana la máxima puntuación.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: si una pieza extiende una fila continua de tres y una columna de dos, suma cinco. Para completar un patrón de capacidad cuatro que ya tiene dos piezas, solo caben dos del color elegido: el resto penaliza. Esta edición original usa una oferta de colores directa, sin fábricas ni piezas de un reglamento comercial.",
    ],
  ],
  "observatorio-de-aves": [
    [
      "Objetivo y preparación",
      "Cada reserva dispone de tres hábitats: bosque, pradera y humedal, con un máximo de cuatro aves en cada uno. Empiezas con tres alimentos y sin aves ni huevos. Se exponen cuatro aves. Sus cartas indican hábitat, coste de uno a tres alimentos, prestigio de dos a seis y capacidad de huevos de uno a tres.",
    ],
    [
      "Cómo se desarrolla un turno",
      "En tu turno atrae una ave pagando su alimento y ocupando su hábitat, o activa bosque, pradera o humedal. Bosque concede dos alimentos, más uno por ave de bosque. Pradera coloca dos huevos más uno por ave de pradera y sus poderes, hasta la capacidad total de tus aves. Humedal da un punto más uno por ave de humedal y renueva la primera carta si queda mazo. Cada ave solo tiene el poder de su hábitat; no hay textos ocultos en cartas.",
    ],
    [
      "Final y puntuación",
      "Se juegan doce turnos por participante. Las aves conceden sus puntos al comprarlas. Al cerrar la duodécima ronda, cada huevo vale un punto y cada hábitat con alguna ave añade tres. Los alimentos sobrantes no puntúan. Gana el saldo máximo; un empate se conserva.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: con dos aves de bosque, activar bosque da cuatro alimentos. Si tus aves admiten cinco huevos y ya tienes cuatro, una activación de pradera solo añade uno. La IA intenta construir una reserva y llenar huevos al final. Es una colección original de aves y acciones, sin cartas o poderes comerciales.",
    ],
  ],
  "terraformacion-planetaria": [
    [
      "Objetivo y preparación",
      "El planeta ofrece dieciséis sectores vacíos. Cada agencia empieza con doce créditos, producción dos, cero plantas y cero calor. Los objetivos comunes son ocho aumentos de oxígeno, ocho de temperatura y seis océanos. Cada proyecto otorga puntos a quien lo financia, aunque ayude al objetivo común.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Una acción: generar ingreso (producción más dos créditos, dos calores y dos plantas), fábrica (seis créditos, producción +2), calentar (cuatro créditos y temperatura +1), convertir cuatro calores en temperatura, crear océano (ocho créditos en sector libre), o crear bosque (cuatro plantas en sector libre, oxígeno +1). No puedes aumentar un parámetro completo. Los océanos y bosques ocupan permanentemente su sector.",
    ],
    [
      "Final y puntuación",
      "Calentar concede dos puntos, un océano tres y un bosque dos. Al completar los tres parámetros se cierra inmediatamente; si no, después de 28 generaciones completas. Añade un punto por bosque propio y uno por cada cinco créditos conservados. Gana la máxima suma. El mapa admite seis océanos y ocho bosques, quedando dos espacios.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: producir con producción seis concede ocho créditos y dos de cada recurso vegetal y térmico. Convertir calor no ocupa mapa; plantar sí. Construir fábricas pronto ayuda a financiar océanos. Esta edición es original y no reproduce una baraja, corporaciones o reglas oficiales de otro título.",
    ],
  ],
  "lineas-de-produccion": [
    [
      "Objetivo y preparación",
      "Tu fábrica empieza con cuatro minerales y una mina que produce tres. El mercado permanente ofrece máquinas de metal, circuito y robot. Sus costes son tres, cuatro y cinco minerales. El objetivo es construir una cadena y entregar pedidos repetibles.",
    ],
    [
      "Cómo se desarrolla un turno",
      "En tu turno compra una máquina (máximo ocho contando la inicial), produce o entrega. Al producir se activan las máquinas ordenadas de mineral a robot: la mina no necesita entrada; las demás consumen dos unidades de la etapa anterior para dar dos metales, dos circuitos o un robot. Cada máquina se activa una vez y solo si encuentra recursos. Puedes tener varias de un tipo. Los productos obtenidos están disponibles para máquinas posteriores en esa misma activación.",
    ],
    [
      "Final y puntuación",
      "Pedidos: cuatro metales dan cinco puntos; tres circuitos ocho; dos robots doce. Entregar consume esos recursos y un turno. Tras dieciocho rondas se suman un punto por máquina y dos por robot almacenado a las entregas acumuladas. Gana la mayor puntuación, conservando empates.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: una mina y una metalúrgica producen tres minerales y transforman dos en dos metales. Si además hay una máquina de circuitos, esos dos metales se convierten inmediatamente. La IA completa etapas antes de producir y entrega productos de valor; no busca todas las cadenas posibles. Edición original de motor económico.",
    ],
  ],
  "expedicion-arqueologica": [
    [
      "Objetivo y preparación",
      "Hay quince ruinas con coste, valor y peligro visibles. Cada expedición empieza con cinco provisiones y conocimiento cero. Puedes reponer tres provisiones, investigar para aumentar conocimiento uno o excavar una ruina sin reclamar pagando su coste, de dos a cinco provisiones.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Excavar tira un dado de seis. Un éxito requiere que dado más conocimiento supere estrictamente peligro más dos. El éxito reclama definitivamente la ruina, concede sus puntos de tres a ocho y aumenta conocimiento uno. Un fallo deja la ruina libre y devuelve una provisión, pero no todo el coste. Investigar y reponer no requieren dados.",
    ],
    [
      "Final y puntuación",
      "Se termina cuando todas las ruinas están reclamadas o tras quince turnos por participante. Añade un punto por conocimiento a las ruinas acumuladas. Las provisiones sobrantes no puntúan. La máxima suma gana; empates son tablas.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: peligro dos exige superar cuatro. Con conocimiento uno, un dado cuatro da cinco y vence; un tres da cuatro y falla. Invertir en conocimiento mejora toda excavación futura. La IA sopesa valor, coste y probabilidad sin conocer los dados que saldrán. Edición original de exploración y gestión.",
    ],
  ],
  "el-laberinto-magico": [
    [
      "Objetivo y preparación",
      "Un tablero móvil de cinco por cinco contiene corredores, una loseta extra y peones en las esquinas. Cada persona tiene un tesoro objetivo público. El objetivo es encontrar cinco. La pared de cada casilla permite o impide conexiones; solo se camina cuando ambas losetas abren sus lados de contacto.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Primero inserta la loseta extra empujando una fila o columna en uno de sus sentidos. La loseta expulsada será la próxima extra. Los peones en esa línea avanzan con ella y los expulsados reaparecen al otro extremo. No puedes invertir exactamente el último empuje. Después selecciona cualquier casilla alcanzable por corredores desde tu nueva posición; puedes quedarte quieto. Las casillas se recorren sin limitar pasos dentro del turno.",
    ],
    [
      "Final y puntuación",
      "Terminar en tu tesoro suma uno y genera un nuevo objetivo. Gana al alcanzar cinco; si se llega a 400 acciones se compara colección. Un tesoro puede salir en una posición ya ocupada, pero se cobra al terminar una fase de movimiento allí. No se gira la loseta extra en esta edición.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: un empuje puede abrir un paso antes bloqueado y transportar tu peón hasta una esquina. La IA compara los empujes y busca alcanzar su objetivo; no planifica muchos turnos de efectos rivales. Edición original de corredores móviles, con reglas propias y sin cartas comerciales.",
    ],
  ],
  "subasta-de-propiedades": [
    [
      "Objetivo y preparación",
      "Cada persona comienza con quince monedas. Primero hay cinco rondas de compra y luego cinco de venta. En cada ronda aparece un lote por participante, con valores distintos: propiedades de uno a treinta durante compras y cheques de uno a dieciséis durante ventas. Todas las elecciones de una ronda son secretas hasta resolverse.",
    ],
    [
      "Cómo se desarrolla un turno",
      "En compras puja una cantidad entre cero y tu saldo. Se ordenan las pujas de menor a mayor y se adjudican propiedades en ese orden. Todo participante paga su propia puja. En ventas elige una de tus propiedades; se retira de tu mano y, al revelar todas, sus valores determinan el reparto ascendente de cheques. En empates el orden cíclico desde el líder va antes para la adjudicación menor; el líder rota cada ronda.",
    ],
    [
      "Final y puntuación",
      "Tras las cinco ventas cada persona habrá vendido todas sus propiedades. Gana el total de cheques más monedas conservadas. Un empate en saldo total es tablas. El mercado se genera de nuevo cada ronda; pueden repetirse valores entre rondas, nunca dentro de una misma oferta.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: pujas 1, 4, 7 sobre propiedades 3, 15, 28 reciben respectivamente esas propiedades. Todas pagan, incluso quien obtiene la menor. Reserva propiedades fuertes para rondas con grandes diferencias entre cheques. Edición original de puja sellada: no usa subastas ascendentes ni atribuye un reglamento comercial.",
    ],
  ],
  "el-fabricante-de-alfombras": [
    [
      "Objetivo y preparación",
      "Un comerciante empieza en el centro del mapa de siete por siete mirando hacia arriba. Cada fabricante tiene veinte monedas y un color. Se juegan doce rondas. El objetivo es conservar dinero y controlar alfombras visibles, mientras la visita del comerciante genera pagos.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Primero gira noventa grados a izquierda o derecha, o sigue recto; no puedes dar media vuelta voluntaria. Tira un dado con caras 1,2,2,3,3,4 y mueve esa distancia. Al topar con borde, rebota cambiando 180 grados. Si termina en alfombra rival, paga la cantidad de casillas de la región ortogonal de ese color, hasta tu saldo. Después extiende dos casillas vecinas, al menos una junto al comerciante, sin cubrirlo. Pueden cubrir alfombras anteriores.",
    ],
    [
      "Final y puntuación",
      "Al terminar doce rondas, la puntuación es monedas más casillas propias visibles. Una región para pagos no cuenta diagonales. No hay deuda: solo transfieres monedas que tienes. Empates de puntuación son tablas.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: terminar en una región rival de cuatro casillas cuesta cuatro monedas; si solo tienes dos, pagas dos. Cubrir el cuello de una región puede dividirla y disminuir futuros pagos. La IA elige cubiertas por expansión; el paseo usa azar. Edición original con rebotes simples, sin reproducir trayectorias de otro reglamento.",
    ],
  ],
  "viaje-en-el-tiempo": [
    [
      "Objetivo y preparación",
      "Hay cuatro épocas y dieciséis reliquias visibles. Cada viajero empieza en la Antigüedad con cinco energías, sin paradojas ni reliquias. Las demás épocas son Renacimiento, era industrial y futuro. El objetivo es rescatar reliquias valiosas y conjuntos de las cuatro épocas sin acumular demasiadas paradojas.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Una acción: recargar tres energías, estabilizar para eliminar hasta dos paradojas, viajar a otra época por distancia temporal más uno de energía, o rescatar una reliquia libre de tu época pagando su coste. Viajar hacia atrás añade una paradoja. Rescatar también añade una, concede sus puntos y retira definitivamente la reliquia.",
    ],
    [
      "Final y puntuación",
      "Después de dieciocho turnos por participante o de rescatar todas, cada conjunto de cuatro reliquias de épocas distintas suma ocho puntos; cada paradoja resta dos. La mayor puntuación gana. Se pueden acumular varios conjuntos y la energía restante no puntúa.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: de futuro a Renacimiento hay dos intervalos: pagas tres energías y añades una paradoja. Si tienes una reliquia de cada época, sumarás ocho, pero cuatro paradojas cancelarían ese bonus. La IA busca reliquias y estabiliza al final. Edición original de rutas y costes temporales.",
    ],
  ],
  "invasion-de-clanes": [
    [
      "Objetivo y preparación",
      "Doce territorios se reparten cíclicamente entre los clanes, dos tropas por territorio. Cada casilla tiene valor uno, dos o tres. Un turno de campaña comienza recibiendo refuerzos: el máximo entre tres y la mitad entera de tus territorios.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Coloca todos tus refuerzos en un territorio propio. Después puedes realizar varios ataques o cerrar campaña. Solo se ataca a un vecino ortogonal rival desde un territorio con más de una tropa. Ataque es dado de seis más hasta tres tropas móviles; defensa es dado de seis más hasta tres defensores. Superar la defensa resta una tropa rival; fallar, incluido empate, resta una propia. Al quedar sin tropas el objetivo pasa al atacante y recibe todas las tropas del origen excepto una.",
    ],
    [
      "Final y puntuación",
      "Al cerrar campaña se recalcula el valor territorial y se omiten clanes sin territorios. Gana controlar todo el mapa; tras doce vueltas de campaña o 700 acciones gana la suma mayor de valores territoriales. Las tropas sobrantes no añaden puntos. Todos los datos del mapa son públicos.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: con cinco tropas atacas con dado más tres, pues una debe quedar de guarnición y el modificador se limita a tres. Conquistar desde allí trasladaría cuatro. No existe fortificación entre territorios en esta edición. La IA favorece ataques con superioridad y termina cuando dejan de ser favorables. Edición original.",
    ],
  ],
  "la-resistencia-avalon": [
    [
      "Objetivo y preparación",
      "Esta mesa implementa Avalón base para cinco o seis participantes, sin personajes opcionales: un Merlín, un Asesino, un esbirro y los demás leales. El Mal son Asesino y esbirro; conocen sus identidades. Merlín conoce al Mal, pero el Mal no sabe quién es Merlín. Los leales no conocen otros papeles. Es un juego de equipos, no de puntos individuales.",
    ],
    [
      "Cómo se desarrolla un turno",
      "El líder propone un equipo completo. Tamaños por misión: con cinco puestos, 2–3–2–3–3; con seis, 2–3–4–3–4. Todos votan sí/no en secreto y se revelan juntos. Hace falta mayoría estricta: un empate rechaza. Rechazar pasa liderazgo y acumula un rechazo; cinco propuestas rechazadas en la misma misión dan victoria al Mal. Aceptar inicia la misión: cada integrante entrega una carta, éxito obligatorio para el Bien, éxito o sabotaje para el Mal. Las cartas individuales permanecen ocultas; un sabotaje basta para fallar en ambas configuraciones.",
    ],
    [
      "Final y puntuación",
      "Tras cada misión se rota líder y se reinician rechazos. Tres fracasos dan victoria al Mal. Tres éxitos abren la fase final: el Asesino, con su propio turno, acusa a alguien de ser Merlín. Si acierta gana el Mal; si no gana el Bien. No hay Lady of the Lake, Percival, Morgana, Mordred u Oberon. No se automatiza el diálogo: las personas pueden debatir por el medio que prefieran.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: un equipo de tres recibe tres aprobaciones en mesa de seis: se rechaza, porque no supera la mitad. Una carta de sabotaje en la misión cuatro con seis jugadores sigue bastando para fracasar. La IA utiliza conocimiento permitido y resultados públicos; los leales ordinarios nunca inspeccionan la matriz de identidades, y el Asesino no consulta quién es Merlín. No se pretende simular razonamiento social humano.",
    ],
  ],
  "lobo-aldea": [
    [
      "Objetivo y preparación",
      "Variante de Games para seis, siete u ocho puestos: dos lobos, una vidente, un sanador y el resto aldeanos. Los lobos se conocen. Nadie más conoce los papeles, salvo las investigaciones personales de la vidente. Empieza la noche. Esta mesa no precisa moderador, pero las personas deben aportar su conversación y sus sospechas.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Los lobos vivos seleccionan víctima en secreto entre no lobos; la más votada gana, y un empate elige el puesto menor. El sanador vivo protege a una persona viva, incluida él mismo, distinta de la protegida la noche anterior. La vidente viva consulta si una persona es lobo. Al amanecer muere la víctima salvo protección. Después cada persona viva vota expulsar a otra viva. Se revela la votación al completarla; empate en máximo significa que nadie sale. Los papeles de eliminados son públicos.",
    ],
    [
      "Final y puntuación",
      "La aldea gana cuando no queda lobo vivo. Los lobos ganan cuando igualan o superan en número a los demás supervivientes. Se comprueba después de cada muerte o expulsión. Si tras doce días no hay vencedor se declara empate. La protección no se publica y los resultados de vidente solo aparecen en su propia información.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: cuatro supervivientes con dos lobos ya dan victoria al Mal. Un sanador no puede proteger a J2 dos noches seguidas. La IA de vidente recuerda sus investigaciones; los demás aldeanos votan sin acceso a identidades ocultas y no generan discusiones. Esta variante añade sanador y límites propios; la referencia externa presenta una edición diferente de Werewolf.",
    ],
  ],
  "descarte-explosivo": [
    [
      "Objetivo y preparación",
      "Cada participante recibe cuatro cartas y un desactivador. El mazo contiene cartas seguras, saltos, visores, mezclas, ataques y tantas explosiones como participantes menos uno. Debes sobrevivir a los robos obligados. Las manos y visiones son privadas, y el tamaño del mazo es público.",
    ],
    [
      "Cómo se desarrolla un turno",
      "En tu turno juega cartas de efecto o roba. Robar una carta normal la añade a la mano y consume un robo obligado. Una explosión consume tu desactivador disponible y abre un turno de reinserción: elige profundidad cero para la siguiente carta u otra hasta el fondo. Sin desactivador quedas eliminado. Salto evita un robo; Visor revela a su dueño las tres primeras; Mezcla baraja e invalida todos los visores; Ataque pasa al siguiente los robos pendientes más uno. Una explosión desactivada también consume un robo cuando se reinserta.",
    ],
    [
      "Final y puntuación",
      "Al completar robos pendientes se pasa a la siguiente persona viva. Gana la última superviviente. Si se agota el mazo sin explosión decisiva, gana la mayor mano superviviente y empata si coincide. Una carta segura no tiene efecto jugable; se conserva. Los desactivadores no se regeneran.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: bajo dos robos obligados, un Salto deja uno; un Ataque en ese momento encarga dos al siguiente. La IA decide según su mano y visor, sin mirar la próxima carta desconocida. Esta edición usa una baraja original y no reproduce cartas o ilustraciones de otros títulos.",
    ],
  ],
  "mineros-saboteadores": [
    [
      "Objetivo y preparación",
      "Tres a seis puestos reciben oficio secreto y cuatro túneles o derrumbes. Hay un saboteador para tres a cinco personas y dos para seis; el resto mineros. Entrada y oro están en los extremos de la fila central de un mapa cinco por cinco. Los mineros ganan si conectan el oro; saboteadores, si lo impiden hasta el final.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Juega una carta de túnel en una casilla vacía y elige su orientación entre las legales. Debe conectar con algún túnel alcanzable desde la entrada y coincidir con cada lado de cualquier vecino existente: no puede abrir hacia una pared ni cerrar una conexión vecina. No se abren salidas fuera del mapa. Un Derrumbe elimina un túnel colocado, excepto entrada y oro. Descartar cualquier carta permite renovar. Se roba tras usar o descartar mientras queda mazo.",
    ],
    [
      "Final y puntuación",
      "El primer camino continuo al oro cierra inmediatamente con victoria de todos los mineros. Ochenta acciones, o agotar mazo y manos, da victoria a saboteadores. Los turnos vacíos pasan. Oficios se mantienen ocultos hasta acabar; los saboteadores no reciben una lista de aliados en esta variante.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: una esquina girada puede servir de desvío, pero si el lado vecino está cerrado no es colocación válida. Un saboteador puede derrumbar un puente del camino principal. La IA decide por su oficio y el mapa público, sin consultar papeles ajenos. Baraja y mecánica originales de Games.",
    ],
  ],
  "guerra-de-cartas-de-energia": [
    [
      "Objetivo y preparación",
      "Duelo de dos puestos con veinte vidas, cuatro energías y cinco cartas. La energía se limita a doce. Hay seis tipos: Rayo (coste2, daño3), Escudo (coste1, bloquea3), Sobrecarga (coste4, daño6), Curación (coste3, cura4), Drenaje (coste3, daño2 y energía+2), Cristal (coste0, energía+2 y roba).",
    ],
    [
      "Cómo se desarrolla un turno",
      "En el turno normal juega una carta que puedas pagar o recarga tres energías y roba. Atacar cambia el actor al defensor: elige recibir daño o usar un único Escudo de su mano. Después empieza el turno normal de ese defensor, recibe una energía y roba. Curación y Cristal resuelven sin fase rival. Vida nunca supera veinte; cartas gastadas se barajan al agotar el mazo.",
    ],
    [
      "Final y puntuación",
      "Reducir la vida rival a cero gana inmediatamente. Tras 35 rondas completas gana la mayor vida; empates son tablas. Escudo solo se usa en respuesta a un ataque; no se juega preventivamente. Un ataque puede ser completamente bloqueado, pero no produce curación si sobrara protección.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: un Escudo contra Sobrecarga deja tres daños; contra Rayo deja cero. Las manos son privadas, las vidas y energías públicas. La IA no consulta escudos rivales antes de atacar. Edición original de combate con energía, sin sistema de cartas de un editor comercial.",
    ],
  ],
  "combates-del-espacio": [
    [
      "Objetivo y preparación",
      "Cada flota posee tres naves con cuatro cascos cada una y cinco órdenes privadas. El objetivo es quedar como última flota o conservar más cascos al límite de 25 rondas. El mapa muestra públicamente casco y escudo de cada nave; los rivales solo conocen el tamaño de tu mano.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Juega Láser a cualquier nave rival (dos daños), Torpedo (tres, ignora escudos), Escudo a una nave propia viva (+2, máximo4), Reparación propia (+2 casco, máximo4), o Despliegue para revivir una nave destruida con dos cascos. Un Láser consume escudo antes de casco. Tras jugar se roba una orden. Alternativamente roba dos, con máximo ocho cartas. El suministro de órdenes se repone barajado al agotarse.",
    ],
    [
      "Final y puntuación",
      "Una flota sin naves vivas se elimina; no recupera turno para revivir después de su eliminación. Los puestos eliminados se omiten. Si solo queda una flota vence. A las 25 rondas vence la suma mayor de cascos, sin bonus por escudos o cartas. Empates se conservan.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: Láser contra dos escudos consume ambos sin dañar casco. Torpedo contra esos mismos escudos resta tres cascos y los deja intactos. La IA elige objetivos por el tablero visible, no por órdenes ocultas. Edición original con ataques directos, sin posicionamiento o alcances adicionales.",
    ],
  ],
  "dominio-de-reino": [
    [
      "Objetivo y preparación",
      "Cada reino comienza con siete Cobres y tres Fincas, roba cinco cartas y dispone de una acción por turno. El suministro común contiene tesoros, territorios y acciones. Cobra automáticamente el valor de tesoros que tengas en la mano: Cobre1, Plata2, Oro3. El objetivo es adquirir puntos de territorio sin atascar el mazo.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Juega acciones mientras te queden: Molino roba tres; Aldea roba una y añade dos acciones tras consumir la que usó; Mina destruye un Cobre de la mano y, si queda, añade una Plata a esa mano. Las cartas de acción jugadas van al descarte. Puedes comprar una carta pagando el coste con el total automático de tesoros, o terminar sin comprar. Ambas opciones cierran el turno: descarta mano, roba cinco, barajando descarte si hace falta. Lo comprado entra en descarte, no en mano.",
    ],
    [
      "Final y puntuación",
      "Costes: Cobre0, Plata3, Oro6, Finca2, Ducado5, Provincia8, Molino4, Aldea3, Mina5. Finca, Ducado y Provincia valen 1,3,6 PV, estén en mano, mazo o descarte. Agotar Provincias, tres pilas del suministro o treinta rondas termina la partida por PV; empate es tablas. Las pilas propias no se inspeccionan desde otros puestos.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: tres Cobres y una Plata producen cinco monedas. Aldea seguida de Molino permite seguir jugando acciones si conservas una. Una compra gratuita de Cobre sigue consumiendo la compra y termina. Esta edición original usa un conjunto fijo reducido; no incorpora expansiones ni pretende reproducir un producto comercial entero.",
    ],
  ],
  "cartas-suicidas": [
    [
      "Objetivo y preparación",
      "La temática es riesgo ficticio de cartas. Cada persona empieza con cinco cartas y riesgo cero. Llegar a diez elimina. Se juega una carta o se roban dos, después el actor recibe siempre un riesgo por desgaste. Se mantiene una mano máxima de nueve y se repone el suministro cuando se agota.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Calma reduce dos riesgos propios; Blindaje tres; Salvavidas los pone a cero. Desvío transfiere hasta dos de tus riesgos a un rival. Doble riesgo suma tres al rival y uno propio antes del desgaste. Provocación suma dos al rival. Jugar repone una carta. Robar dos añade un riesgo adicional al desgaste. Todos los riesgos son visibles, todas las manos son privadas.",
    ],
    [
      "Final y puntuación",
      "Se comprueba eliminación después de cada acción y desgaste. Gana la última persona viva; si una acción eliminara a todas se declara empate. Tras veinte rondas gana quien conserve menor riesgo entre supervivientes. Las personas eliminadas no reciben turnos ni pueden salvarse después.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: con riesgo ocho, Calma lo reduce a seis y el desgaste lo deja en siete. Robar dos desde ocho eleva a nueve y luego a diez: te elimina. La IA decide por riesgos públicos y cartas propias. No hay dinero real ni efectos fuera de esta partida; es una edición original.",
    ],
  ],
  "el-estafador-de-cartas": [
    [
      "Objetivo y preparación",
      "Cada persona recibe siete cartas numeradas de uno a seis. Gana quien vacíe su mano y sobreviva al proceso de respuestas. En tu turno juega una carta boca abajo y declara un valor, que puede ser verdadero o falso. Las cartas descartadas forman un montón acumulado.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Los demás responden por turno, empezando por el siguiente: aceptar o desafiar. Aceptar no revela la carta. Si todos aceptan, el siguiente inicia una declaración. Un desafío revela la carta: si mentías recibes penalización; si decías verdad la recibe quien desafió. La penalización son tantas cartas nuevas del suministro como tamaño del montón, que después se vacía. No son las mismas cartas físicas previamente descartadas, particularidad de esta edición.",
    ],
    [
      "Final y puntuación",
      "Una mano vacía no gana antes de las respuestas. Al concluirlas, gana si permanece vacía; un desafío acertado podría haberla rellenado. Tras sesenta declaraciones resueltas gana la mano más pequeña, con empate. Las cartas jugadas solo se revelan por desafío y la IA no lee su valor antes de decidir.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: declarar cuatro jugando un dos es farol. Si el montón tenía cinco, un rival que acierte te hace robar cinco. Si jugaste cuatro, él roba cinco. La IA usa frecuencia de sus propias cartas y tamaño de manos, no conocimiento del farol real. Variante original de declaraciones y penalizaciones.",
    ],
  ],
  "duelo-de-cartas-en-la-corte": [
    [
      "Objetivo y preparación",
      "La baraja de esta edición tiene cinco Guardias(1), dos Espías(2), dos Barones(3), dos Doncellas(4), dos Príncipes(5), un Canciller(6), una Condesa(7), una Princesa(8). Se retira una carta sin verla, cada persona guarda una y quien juega roba otra. Debes jugar una y conservar la otra.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Guardia adivina un rango rival entre 2 y 8: acertar elimina. Espía examina una mano y guarda la observación solo para el actor. Barón compara la carta conservada con la rival y elimina la inferior; igualdad no elimina. Doncella protege contra objetivos hasta tu próximo turno. Príncipe puede elegirse a sí mismo: descarta la mano objetivo; Princesa descartada elimina, otra se reemplaza del mazo (o Guardia si está vacío). Canciller intercambia manos. Condesa es obligatoria si la acompañan Príncipe o Canciller. Jugar Princesa te elimina. No se puede apuntar a una persona protegida.",
    ],
    [
      "Final y puntuación",
      "Si un efecto no tiene objetivo legal se descarta sin efecto. Gana la última persona viva. Si se agota el mazo, se compara la única carta conservada por supervivientes: el mayor rango gana, igualdad es tablas. No hay puntos acumulados entre rondas. Las observaciones son históricas y pueden quedar obsoletas tras intercambios o descartes.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: Condesa y Príncipe obligan a descartar Condesa. Barón contra una carta igual no elimina a nadie. La IA conserva rangos altos y puede basarse en información que su Espía observó, sin inspeccionar manos desconocidas. Esta mesa usa reglas propias de una ronda y no atribuye una edición comercial completa.",
    ],
  ],
  "comercio-de-alubias": [
    [
      "Objetivo y preparación",
      "Cada persona recibe cinco alubias en orden fijo y dispone de dos campos. No puedes reordenar la mano. Cada turno empieza plantando su primera carta en un campo. Luego se exponen hasta dos cartas de mercado para plantar o vender a otra persona con campo compatible.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Plantar en un campo de otro color obliga a cosecharlo y reiniciarlo. Cada tres Azules o Rojas, cuatro Verdes o Blancas, o dos Cafés dan una moneda, redondeando por debajo. En mercado puedes plantar una de las expuestas en tu campo o proponer venta por una moneda a un rival con campo vacío o del mismo color. La persona destinataria acepta o rechaza en su propio turno; aceptar planta allí y transfiere una moneda, pudiendo quedar en deuda. Rechazar devuelve la decisión al vendedor y evita repetir la misma oferta mientras ese mercado no cambie.",
    ],
    [
      "Final y puntuación",
      "Al resolver todo el mercado, roba tres cartas al final de tu mano. El juego termina al agotar suministro o tras doce rondas. Se cosechan entonces ambos campos de todas las personas y se compara saldo. No se puntúan cartas sin plantar ni restos inferiores al umbral. Empates son tablas.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: cinco alubias Cafés producen dos monedas al cosechar; sobra una sin valor. Una nueva Azul cosecha primero ese campo. La IA busca continuidad en sus propios campos y solo acepta ventas con beneficio de cosecha; no consulta manos ajenas. Esta edición implementa precio fijo y consentimiento, sin negociación libre externa.",
    ],
  ],
  "el-ladron-de-guante-blanco": [
    [
      "Objetivo y preparación",
      "Tres cámaras contienen ocho, diez y doce botines. Uno de los dos a cuatro operadores es el ladrón secreto: solo él lo sabe y su botín final vale doble. Todos pueden robar, registrar y activar alarmas; los demás puntúan botín normal. Cada uno recibe cuatro cartas privadas.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Ganzúa intenta robar dos botines; Botín doble intenta tres. Un dado debe superar estrictamente la alarma de la cámara; fracasar resta un punto, lograrlo retira y suma botín. Tras cualquier intento la alarma sube uno, hasta cinco. Cámara sube alarma dos y concede un punto; Disfraz la baja dos, nunca bajo cero. Registro apunta a otro operador: confisca hasta tres botines y concede dos puntos si encontró alguno. Tras jugar se repone una carta.",
    ],
    [
      "Final y puntuación",
      "Final al vaciar las tres cámaras o después de doce rondas. Se suma botín restante, doble para el ladrón, a los puntos de operaciones. El botín y alarmas son públicos; identidad y manos privadas. La puntuación mayor gana y al acabar se revela el ladrón.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: alarma cuatro necesita dado cinco o seis. Registrar a alguien con dos botines elimina ambos y te da dos puntos, pero no transfiere esos botines a tu bolsa. La IA usa su identidad, mano y recursos públicos, sin adivinar el papel secreto de los rivales. Edición original.",
    ],
  ],
  "cartas-del-purgatorio": [
    [
      "Objetivo y preparación",
      "Una baraja original de 36 cartas tiene cuatro símbolos y rangos uno a nueve. Se reparte igual número de cartas entre los puestos; las sobrantes se excluyen. Un símbolo de triunfo se elige al azar. Cada baza produce premio o castigo, y gana el saldo final más alto.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Cada persona juega una carta. Debes seguir el símbolo de la primera si tienes alguno; si no, puedes jugar cualquier símbolo, incluido triunfo. Gana el mayor triunfo presente, o el mayor rango del símbolo inicial si no hubo triunfo. Quien ganó inicia la siguiente baza. No hay obligación de superar un rango anterior ni de fallar con triunfo si no puedes seguir.",
    ],
    [
      "Final y puntuación",
      "Si aparece alguna luna, el ganador pierde la suma de rangos de todas las lunas de esa baza. Si no aparece, gana cinco puntos. Al agotar todas las manos se compara el saldo; puede ser negativo y un empate se conserva. El triunfo no cambia durante la partida.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: en una baza con luna cuatro y luna siete, quien la gana pierde once, aunque ganó con un triunfo. En una baza sin lunas todos desean ganar sus cinco puntos. La IA decide según cartas propias y las jugadas de la baza, sin leer manos rivales. No es una transcripción de una baraja comercial.",
    ],
  ],
  "senores-de-la-guerra": [
    [
      "Objetivo y preparación",
      "Doce provincias incluyen una de cada bando al inicio y el resto neutrales. Cada bando tiene tres influencias y cinco órdenes privadas. Provincias iniciales defienden con dos y neutrales con uno. Tras cada ronda completa, cada provincia propia da un punto; conservar control pronto es fundamental.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Juega una orden o reúne dos influencias y roba una. Infantería ataca una provincia rival vecina de alguna propia con dado de seis; Caballería añade dos. Debes superar su defensa. Ganar cambia propietario y defensa a dos; fallar reduce defensa uno, hasta mínimo uno. Fortaleza aumenta dos la defensa propia, máximo seis. Diplomacia captura cualquier provincia ajena pagando defensa más dos influencias, dejándola con defensa uno. Espía reduce dos defensa rival, mínimo uno. Impuesto produce influencias tantas como provincias propias. Tras una orden roba otra; mano máxima diez.",
    ],
    [
      "Final y puntuación",
      "Después de doce rondas, suma un punto por cada tres influencias conservadas al saldo de control. Gana la puntuación máxima. Perder todas las provincias no elimina: puedes volver mediante Diplomacia o preparar recursos. Las cartas ajenas son privadas y las defensas públicas.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: contra defensa cuatro, Infantería necesita cinco o seis; Caballería necesita tres o más. Diplomacia cuesta seis influencias y no tira dados. La IA elige por control visible y órdenes propias. Edición original de mapa, influencia y cartas, sin poderes de un reglamento comercial.",
    ],
  ],
  "nonogramas-picross": [
    [
      "Objetivo y preparación",
      "Elige tablero 5×5, 8×8 o 10×10. Las pistas de cada fila y columna indican longitudes de grupos negros en su orden. Entre grupos debe existir al menos una casilla vacía; antes del primero y después del último puede haber cualquier cantidad de vacíos. Una pista cero significa que no hay casillas negras.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Usa Pintar para marcar negro, Vacío para cruzar una casilla y Borrar para devolverla a desconocida. El teclado 1, 0 y X cambia herramientas cuando el tablero tiene foco. Pulsa cada casilla para aplicar la herramienta. No hay pérdida por probar: puedes corregir tantas veces como necesites.",
    ],
    [
      "Final y puntuación",
      "Ganas cuando todos los grupos negros coinciden con todas las pistas; los espacios desconocidos cuentan como blancos a efectos de comprobar. El generador verifica solución única y usa un patrón alternativo si sus intentos aleatorios no la garantizan. No se compara con una imagen secreta almacenada. La IA deduce desde pistas por enumeración y búsqueda.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: pista 2–1 en una fila de cinco obliga a dos negros seguidos, un vacío y un negro, pero puede quedar otro vacío al principio o al final. La pista cinco fuerza toda la fila y ayuda a las columnas. Más tamaño aumenta dificultad y reduce el tamaño visual de casilla manteniendo el tablero en la pantalla.",
    ],
  ],
  "rutas-de-luces-lights-out": [
    [
      "Objetivo y preparación",
      "Tableros de 3×3, 5×5 o 7×7 contienen luces encendidas y apagadas. El objetivo es apagarlas todas. Cada posición inicial se obtiene de un tablero apagado mediante pulsaciones legales, por lo que tiene solución. No existe competición añadida ni rival humano.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Pulsar una casilla cambia su estado y el de sus cuatro vecinas ortogonales. En borde solo cambian las vecinas que existen. Las diagonales no cambian y los bordes opuestos no se conectan. Puedes pulsar una luz apagada. Repetir una misma pulsación dos veces deshace exactamente su efecto.",
    ],
    [
      "Final y puntuación",
      "La partida termina al quedar todas apagadas. El contador registra pulsaciones, sin exigir un mínimo. Solo IA aplica una solución calculada por álgebra binaria desde el estado visible; puede haber varias soluciones y no se promete la de menos pulsaciones. Nueva partida vuelve a mezclar conservando el tamaño.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: pulsar una esquina afecta tres luces; el centro de un tablero grande afecta cinco. El orden de las pulsaciones no altera el resultado final. Pausar la observación permite estudiar el siguiente movimiento sin perder el tablero.",
    ],
  ],
  "bloques-deslizantes": [
    [
      "Objetivo y preparación",
      "Esta edición presenta el puzle deslizante de ocho o quince bloques numerados, con tamaños 3×3 y 4×4. Solo hay un hueco. El objetivo es ordenar los números por filas, desde uno, dejando el hueco en la esquina inferior derecha. La mezcla usa exclusivamente deslizamientos legales.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Pulsa un bloque ortogonalmente vecino del hueco para intercambiarlos. No saltan bloques ni se desliza una fila entera con un clic. Los bloques no adyacentes aparecen inactivos. Puedes deshacer una jugada deslizando el bloque de vuelta, aunque el contador seguirá creciendo.",
    ],
    [
      "Final y puntuación",
      "Ganas al alcanzar el orden completo. Solo IA ejecuta búsqueda IDA* desde el estado visible en un Worker, usando distancia Manhattan y sin respuesta escondida. La generación limita el recorrido de mezcla; si haces una posición manual mucho más profunda el buscador puede alcanzar su presupuesto y detenerse. No se afirma que cualquier posición imaginable sea resoluble por el motor.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: si el hueco está en F2C2, puedes mover F1C2, F2C1, F2C3 o F3C2, siempre que existan. No puedes mover F1C1 diagonalmente. Nueva partida genera otra mezcla legal del tamaño elegido, manteniendo las opciones de observación.",
    ],
  ],
  "laberintos-generativos": [
    [
      "Objetivo y preparación",
      "Elige un mapa de nueve, quince o veintiuna casillas por lado. Empiezas cerca de la esquina superior izquierda y la salida está cerca de la inferior derecha, marcada con rombo. El generador crea corredores unidos mediante un árbol, por lo que siempre hay camino y nunca aparece una salida aislada.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Pulsa una casilla de corredor junto a tu posición actual: solo se admiten cuatro direcciones ortogonales. Las paredes no se pueden pulsar. El rastro coloreado conserva todas las casillas visitadas; puedes retroceder y explorar otra rama. No hay enemigos, vidas ni límite de movimientos.",
    ],
    [
      "Final y puntuación",
      "Llegar a la salida resuelve la partida. El contador muestra pasos. La IA encuentra una ruta por búsqueda en anchura desde el mapa público, luego la recorre paso a paso. Puede pausarse y cambiar su velocidad. Un tamaño mayor añade caminos y bifurcaciones, pero no cambia las reglas.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: un corredor que parece próximo a la salida puede terminar en callejón. Retroceder no borra el rastro; evita confundir camino visitado con una apertura nueva. Nueva partida conserva tamaño y crea una distribución distinta.",
    ],
  ],
  "puzle-de-tuberias": [
    [
      "Objetivo y preparación",
      "En tableros 4×4, 6×6 u 8×8, todas las piezas provienen de una red inicialmente conectada y después se giran. La fuente está arriba a la izquierda. El objetivo es reconstruir una red que conecte todas las piezas y no deje ninguna boca abierta hacia una pared o fuera del tablero.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Cada clic gira noventa grados en sentido horario una pieza. Los tramos rectos, codos, bifurcaciones y extremos mantienen su tipo. El color de agua indica piezas alcanzables desde la fuente, pero no significa que ya no existan fugas. Los lados deben coincidir: una salida derecha exige entrada izquierda en la vecina.",
    ],
    [
      "Final y puntuación",
      "Se gana cuando toda pieza recibe agua y todas las bocas encajan. No hace falta recuperar exactamente el árbol original: se acepta cualquier red válida. La IA resuelve orientaciones por restricciones y comprobación de conectividad, con presupuesto de búsqueda, sin usar una red secreta guardada. Una posición compleja puede detener ese buscador.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: una esquina que mira arriba y derecha en la esquina superior derecha produce dos fugas. Debe girarse hacia los lados interiores. Una red azul completamente conectada aún puede tener una boca apuntando a una pared: debe cerrarse por giro antes de ganar.",
    ],
  ],
  "cruces-numericos-kakuro": [
    [
      "Objetivo y preparación",
      "Edición de entrenamiento con paneles cruzados separados de dos por dos en mapas 7×7 o 10×10. Cada casilla blanca pertenece a un tramo horizontal y otro vertical. Las cifras de cabecera indican sumas; a la derecha se detallan también por coordenadas. Se usan cifras de uno a nueve.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Selecciona una cifra y pulsa una casilla blanca. Cero o Borrar limpia, no introduce un cero como solución. Cada tramo debe sumar su pista y no repetir ninguna cifra. Una cifra puede aparecer en otros tramos no compartidos. El teclado cambia la herramienta mientras el tablero tenga foco.",
    ],
    [
      "Final y puntuación",
      "Se resuelve cuando todas las casillas blancas tienen cifras, cumplen sus dos sumas y la restricción de no repetir. Las casillas oscuras no se rellenan. Los paneles varían por transformaciones de sistemas de sumas; no se promete una colección de diseños editoriales de gran tamaño. La IA obtiene cifras mediante restricciones de sumas y unicidad local.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: dos casillas que suman tres solo pueden contener uno y dos, en cualquier orden. Una columna que suma cuatro podría orientar esa pareja por sus otras intersecciones. 2+2 no es válido, aunque sume cuatro, porque repite cifra en el mismo tramo. Consulta Nikoli para las reglas generales; esta mesa limita los diseños a paneles de entrenamiento.",
    ],
  ],
  "puentes-fluviales-hashiwokakero": [
    [
      "Objetivo y preparación",
      "Islas dispuestas en redes regulares de 3×3 o 5×5 muestran cuántos puentes deben tocarlas. Entre islas vecinas alineadas pueden existir cero, uno o dos puentes. Ningún puente cruza otro, atraviesa una isla ni conecta diagonales. Además de satisfacer los números debes formar una única red conectada.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Pulsa un enlace tenue para cambiar sucesivamente 0 → 1 → 2 → 0. La misma acción funciona con Tab y Enter o Espacio. Dos líneas representan un puente doble. Puedes retirar enlaces incorrectos. Los números no disminuyen en pantalla: siempre muestran el objetivo original de cada isla.",
    ],
    [
      "Final y puntuación",
      "La comprobación exige todas las sumas exactas y conexión global. El generador parte de una red conectada y deriva sus pistas; algunas pueden admitir otras redes válidas, que también se aceptan. La IA busca enlaces por las pistas, no consulta la red de generación. No hay puntuación rival ni límite de intentos.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: una isla con número uno solo admite un puente sencillo total. Dos grupos de islas que cumplen individualmente sus números pero no se comunican no ganan. En esta edición los enlaces vecinos de una retícula no se cruzan; sigue vigente la prohibición general de cruzar si se amplía el generador.",
    ],
  ],
  "crucigramas-interactivos": [
    [
      "Objetivo y preparación",
      "Una selección aleatoria de tres crucigramas artesanales españoles coloca una palabra vertical central y cuatro horizontales cruzadas. Los tamaños nueve y once cambian el marco y la separación visual, no el número de definiciones. Las casillas oscuras no se escriben. Cada palabra tiene número de inicio y definición con longitud.",
    ],
    [
      "Cómo se desarrolla un turno",
      "Selecciona una letra del teclado de pantalla y pulsa la casilla blanca; el teclado físico también cambia la letra. Borrar vacía. Los cruces comparten la misma casilla y letra, por lo que corregirla cambia ambas palabras. Se escriben mayúsculas sin tildes, admitiendo Ñ. Las palabras solo se verifican al completar el conjunto, sin castigar errores.",
    ],
    [
      "Final y puntuación",
      "Se gana al resolver todas las definiciones con sus respuestas previstas. Las definiciones son cerradas y no se aceptan sinónimos de otra longitud o diferentes de la respuesta del diseño. Solo IA usa el vocabulario de estas pistas para rellenar; no es un modelo lingüístico conectado ni interpreta definiciones nuevas.",
    ],
    [
      "Ejemplo, IA y edición",
      "Ejemplo: una horizontal de cuatro letras que define el líquido que bebemos requiere AGUA. Su primera A puede pertenecer a la vertical y sirve de pista cruzada. Nueva partida escoge otra de la selección disponible; puede repetirse porque la colección es finita. No hay competición artificial añadida.",
    ],
  ],
};
export const collectionSources: Record<
  string,
  { title: string; url: string }[]
> = {
  "la-resistencia-avalon": [
    {
      title: "Indie Boards & Cards: Avalón y explicación oficial",
      url: "https://indieboardsandcards.com/our-games/the-resistance-avalon/",
    },
  ],
  "lobo-aldea": [
    {
      title:
        "Looney Labs: reglas de Werewolf; comparar la variante con sanador de Games",
      url: "https://www.looneylabs.com/lit/rules/are-you-werewolf-rules",
    },
  ],
  "cruces-numericos-kakuro": [
    {
      title: "Nikoli: reglas generales de Kakuro",
      url: "https://www.nikoli.co.jp/en/puzzles/kakuro/",
    },
  ],
  "puentes-fluviales-hashiwokakero": [
    {
      title: "Nikoli: reglas de Hashiwokakero",
      url: "https://www.nikoli.co.jp/en/puzzles/hashiwokakero/",
    },
  ],
};
