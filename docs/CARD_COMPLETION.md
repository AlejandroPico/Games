# Mesas de cartas y estabilidad visual

Esta entrega activa todas las fichas que quedaban pendientes. Cada mesa tiene su carpeta, motor independiente, Worker, ayuda específica e ilustración propia. Todas ofrecen humano–IA, humanos locales, amigos online y observación Solo IA; las mesas de más participantes admiten puestos mixtos.

## poker-texas-hold-em

Texas Hold’em No-Limit de una mano. Dos a seis puestos comienzan con cien fichas virtuales; J1 es botón, ciegas uno y dos. En heads-up el botón es ciega pequeña. Cada persona recibe dos cartas privadas y comparte hasta cinco comunitarias. Gana el mejor saldo tras repartir los botes; no hay dinero real ni torneo continuado.

Preflop comienza después de la ciega grande. Puedes retirarte, pasar cuando no debes fichas, igualar o subir. El selector ofrece importes legales y all-in; una subida completa debe aumentar al menos la subida anterior. Las subidas all-in inferiores no reabren el derecho a subir de quien ya actuó. Flop expone tres cartas, turn una y river otra, con carta quemada entre calles. Desde flop sale el primer puesto activo tras el botón.

La mejor mano usa exactamente cinco cartas entre tus dos y las cinco de mesa, incluso solo las comunitarias. Orden: escalera de color, póquer, full, color, escalera, trío, doble pareja, pareja y carta alta. As sirve arriba o como bajo en A–2–3–4–5. Los all-in generan botes secundarios: solo puede disputar un tramo quien lo aportó. Si no queda más de una persona con fichas tras cerrar apuestas, se completa el tablero automáticamente.

Dos personas con la misma combinación dividen su bote. Los restos enteros se entregan por orden de puesto entre los ganadores, una convención propia de esta mesa. Retirarse pierde elegibilidad, aunque su aportación siga en el bote. Ejemplo: aportaciones 10,30,30 generan un bote principal de 30 para tres y otro de 40 para dos. La IA usa únicamente su mano y las comunitarias; sus decisiones son heurísticas, sin fuerza de torneo.

## chinchon

Chinchón individual de dos a cuatro, baraja española de cuarenta sin comodín. Se reparten siete cartas y se inicia descarte con una del mazo. Agrupa tres o cuatro cartas del mismo número o al menos tres consecutivas del mismo palo; los valores siguen 1,2,3,4,5,6,7,sota,caballo,rey. Esta variante considera consecutivos siete y sota.

Roba del mazo cerrado o toma la última carta del descarte. Después descarta una y cede turno, o elige Cerrar si la mano restante tiene como máximo cinco puntos sin combinar. La interfaz muestra todas las opciones legales de cierre. Ninguna carta puede participar en dos grupos: el motor busca la partición con menor valor sobrante.

La mano termina al cerrar. Cada persona recibe como penalización la suma mínima de cartas sin grupo: as uno, números su valor y figuras diez. Gana la menor penalización. Esta mesa no añade cartas a grupos del jugador que cierra ni lleva eliminación por puntuación acumulada. Una escalera natural de siete se identifica como Chinchón y recibe una penalización de menos veinticinco.

Ejemplo: tres cuatros y 2–3–4 de copas dejan un as suelto, penalización uno; puedes cerrar tras descartar la octava carta. Si el mazo se agota se recicla el descarte conservando su carta superior. Al llegar a 250 turnos se compara la penalización de las manos actuales para detener ciclos. La IA intenta minimizar sobrantes; no conoce el mazo futuro.

## tute

Tute de cuatro por parejas J1–J3 y J2–J4. Se reparten las cuarenta cartas españolas, diez por puesto; un palo visible se elige como triunfo. No hay mazo de robo. Fuerza descendente: as, tres, rey, caballo, sota, siete, seis, cinco, cuatro, dos. Los puntos son once, diez, cuatro, tres, dos y cero respectivamente.

Debes asistir al palo de salida si lo tienes y montar sobre la carta ganadora de ese palo cuando sea posible. Si no tienes el palo, debes fallar con triunfo y superar el triunfo mayor cuando puedas; de lo contrario juega un triunfo menor o cualquier carta si no tienes triunfos. Quien gana la baza sale en la siguiente.

Después de ganar una baza, puedes cantar una pareja de rey y caballo que permanezca en tu mano: cuarenta en triunfo o veinte en otro palo, una vez por palo y persona. El selector contiene el canto; no consume carta ni pasa turno. Cuatro reyes o cuatro caballos conservados después de ganar una baza permiten cantar Tute y ganar inmediatamente el reparto. La última baza añade diez. Las capturas y cantos se suman por pareja; vence el mayor total.

Ejemplo: rey y caballo de oros con oros de triunfo permiten cantar cuarenta; tras jugar uno de ellos ya no puedes anunciar esa pareja. Las ayudas y el registro explican la variante de obligación estricta de montar: no se libera por ir ganando el compañero. Se juega un reparto con recuento automático, sin apuestas ni señas externas.

## truco-argentino-uruguayo

La ficha abre Truco argentino para dos, sin flor, a quince tantos. No aplica las piezas ni muestra del Truco uruguayo. Tres cartas por mano de baraja española de cuarenta; se decide la mano en hasta tres bazas y se renueva el reparto hasta que alguien alcanza quince.

No hay obligación de asistir. Jerarquía: as de espadas, as de bastos, siete de espadas, siete de oros, treses, doses, otros ases, reyes, caballos, sotas, otros sietes, seis, cinco y cuatro. Truco aumenta el valor de la mano de uno a dos; Retruco a tres; Vale cuatro a cuatro. El rival responde Quiero o No quiero en su propio turno; rechazar paga el valor previamente aceptado.

Envido simple vale dos y solo puede proponerse antes de la primera carta de la mano. Se suman las dos mejores cartas de un palo más veinte; figuras valen cero. Sin dos del mismo palo vale la mejor carta numérica. Empate lo gana mano. Rechazar envido da uno al proponente. Esta edición no incluye Real Envido, Falta Envido ni flor.

En bazas pardas la primera ganada tiene preferencia; si la primera es parda decide la segunda ganada; tres pardas favorecen mano. Irse al mazo concede al rival el valor aceptado. Ejemplo: siete y seis de copas forman treinta y tres de envido. La IA evalúa su mano; el código compartido entre amigos no es un servicio de arbitraje contra trampas.

## rummy-continental

La ficha Rummy / Continental abre aquí Rummy clásico de una mano, dos a cuatro puestos, sin comodines. Cada mano tiene diez cartas de una baraja de cincuenta y dos. No se han implementado los contratos crecientes de Continental: esta distinción es parte de la edición y del inventario.

Roba una carta cerrada o el descarte superior; descarta una para terminar turno. Construye en mano tríos/cuatro iguales y escaleras naturales del mismo palo. El as es bajo; no se permite K–A–2. Las combinaciones se reconocen automáticamente, sin bajar cartas al tapete ni añadirlas a grupos rivales.

Solo se puede cerrar cuando todas las diez cartas restantes pertenecen a combinaciones válidas: cero sobrantes. Gana la menor penalización tras ese cierre, normalmente quien ha cerrado. Números valen su valor, figuras diez y as uno. En un cierre por límite de mesa se comparan las penalizaciones sin inventar un ganador por agotamiento de la IA.

Ejemplo: 3–4–5 de corazones, 7–7–7 y J–Q–K–A no sirve porque el as solo es bajo. En cambio cuatro reyes más dos escaleras de tres completan diez cartas. Se conserva la carta superior al reciclar descarte. La IA elige descartes mediante búsqueda de combinaciones no solapadas; este repertorio amplía con Rummy, no declara implementado un reglamento de Continental.

## bridge

Bridge de cuatro puestos por parejas J1–J3 y J2–J4, un reparto no vulnerable. Trece cartas por mano. La subasta anuncia cuántas bazas por encima de seis promete la pareja y con qué triunfo; los cinco tipos crecen tréboles, diamantes, corazones, picas, sin triunfo.

Puedes pasar o anunciar un contrato superior al vigente. La pareja contraria puede doblar; la pareja del contrato puede redoblar. Tres pasos posteriores a un contrato cierran la subasta, cuatro pasos iniciales anulan el reparto. Declarante es el primer jugador de la pareja ganadora que anunció el palo final. Sale quien está a su izquierda.

Tras la salida se muestra el muerto, compañero del declarante. Sus cartas las elige el declarante: el turno online se atribuye a la persona que realmente decide, no al puesto del muerto. Debes asistir si tienes el palo; sin él puedes cortar o descartar. La mayor carta del palo de salida gana salvo triunfo. Quien gana sale; la pareja del declarante debe reunir seis más el nivel contratado.

Puntuación duplicate no vulnerable: menores veinte por baza, mayores treinta, sin triunfo cuarenta la primera y treinta siguientes; se aplican doblos, prima parcial/manche, slam, sobrebazas y caídas. Ejemplo: 3ST exactos dan cuatrocientos. Es una mesa de práctica de una mano: sin alertas, convenciones acordadas, director de torneo ni comparación de resultados entre mesas. La IA de subasta es básica y no ofrece un sistema completo de convenciones.

## cribbage

Cribbage de dos a ciento veintiún puntos. Se reparten seis cartas; cada persona entrega dos al crib del repartidor y conserva cuatro. El starter se muestra después de ambos descartes. Si es sota, el repartidor anota dos por heels. Se alterna el reparto de manos siguientes.

En pegging juega una carta sin pasar de treinta y uno. Se suman sus valores, figuras diez y as uno. Quince y treinta y uno dan dos puntos; pareja dos, tres iguales consecutivos seis y cuatro doce. Una carrera al final de la secuencia da su longitud, aunque las cartas no se hayan jugado ordenadas. Si no puedes jugar dices Go; la última carta da uno salvo alcanzar treinta y uno.

Al acabar pegging cuenta primero no repartidor, luego repartidor y después crib. Las quincenas dan dos por combinación; parejas dos; carreras admiten multiplicidad. Un flush de cuatro en mano da cuatro o cinco con starter; en crib solo puntúa si coinciden las cinco. Nobs da uno por sota en la mano del palo del starter. Alcanzar ciento veintiuno termina inmediatamente, incluso durante pegging.

Ejemplo: cuatro cincos y sota de palo del starter forman la célebre mano de veintinueve. Pegging 3–1–2 puntúa tres por carrera. No se exige reclamación manual ni se aplica muggins: el recuento es automático y exacto para estas reglas. La IA favorece combinaciones al descartar y puntos inmediatos al jugar; no emplea estadísticas profesionales del crib.

## hearts-corazones

Corazones de cuatro, baraja de cincuenta y dos, trece por mano. Antes de jugar, selecciona tres cartas y confirma el pase a la izquierda; las recibidas entran una vez que las cuatro personas hayan elegido. Este reparto usa siempre ese sentido de pase y se juega una única mano, no una liga a cien puntos.

El dos de tréboles abre la primera baza. Debes asistir al palo si puedes. En la primera baza no puedes descartar corazones ni dama de picas mientras tengas alternativa sin penalización. Los corazones no pueden abrir una baza hasta haber sido rotos mediante descarte, salvo que solo tengas corazones. No hay triunfo.

Cada corazón capturado añade un punto de penalización y la dama de picas trece. Gana la menor penalización al terminar trece bazas. Capturar los veintiséis puntos hace disparar a la luna: tú recibes cero y los demás veintiséis. El registro indica bazas y resultado, manteniendo ocultas las manos ajenas durante la partida.

Ejemplo: as y rey de picas pueden obligarte a capturar la dama si no puedes descartarlos a tiempo. Seleccionar una carta ya marcada la quita del pase; solo exactamente tres habilitan confirmar. La IA descarta cartas altas peligrosas y cumple todas las restricciones; no usa cartas ocultas de los rivales.

## spades-picas

Picas de cuatro por parejas J1–J3 y J2–J4, trece cartas por mano, una mano por partida. Picas siempre es triunfo. Cada persona anuncia entre cero y trece bazas antes de jugar. Cero significa Nil: prometer no ganar ninguna baza.

Debes asistir al palo si lo tienes. Sin él puedes jugar cualquier carta; un triunfo vence al palo de salida. No puedes salir de picas hasta que alguien corte con una, salvo que solo tengas picas. Gana el triunfo mayor o, sin triunfos, la carta mayor del palo de salida; as alto. Quien gana inicia la siguiente baza.

La pareja suma los contratos no Nil. Cumplir da diez por baza prometida y uno por sobrebaza, llamado bolsa; fallar resta diez por baza prometida. Nil aporta cien si se cumple o resta cien si se toma una baza. Las bazas de Nil fallido no ayudan al contrato normal en esta edición. No se arrastran bolsas ni se aplica penalización de diez bolsas entre manos.

Ejemplo: contratos cuatro y tres, ocho bazas válidas, dan setenta y uno; seis dan menos setenta. El contrato Nil se puntúa de forma independiente. Al terminar se muestra el saldo por pareja. La IA estima contrato con triunfos y cartas altas de su propia mano, y no ve las manos rivales.

## durak

Podkidnoy Durak de dos, treinta y seis cartas de seis a as, seis por mano. La carta inferior del mazo determina triunfo y se roba al final. Comienza quien tiene el triunfo más bajo; sin triunfos comienza J1. El objetivo es quedarse sin cartas al agotar el mazo; quien conserva cartas al final es el Durak.

Ataca con una carta. El defensor debe cubrirla con una superior del mismo palo o un triunfo si la atacada no era triunfo. Después el atacante puede añadir cartas de un valor ya presente en el asalto, incluidas las defensas. Cada carta exige respuesta del defensor en su propio turno. Máximo seis ataques o el tamaño de la mano del defensor al empezar el asalto.

Terminar un ataque completamente defendido retira esas cartas y da la siguiente salida al defensor. Recoger toma todo y pierde la salida: vuelve a atacar el mismo rival. Se repone primero atacante y luego defensor hasta seis. Esta mesa cierra la recogida inmediatamente, sin permitir añadir cartas después de declararla; no hay transferencias de ataques.

Ejemplo: ocho de copas puede cubrirse con nueve de copas o cualquier triunfo si copas no triunfa. Una vez hay ocho y nueve, solo se añaden valores ocho o nueve. Tras agotar stock, salir ambos a la vez es empate. Un límite de asaltos detiene ciclos con empate; no declara victoria ficticia. La IA conserva triunfos y busca defensas baratas.

## euchre

Euchre de cuatro por parejas, veinticuatro cartas: nueve a as. Cinco en mano y una carta visible para elegir triunfo. La primera ronda puede ordenar ese palo al repartidor; quien ordena compromete a su pareja a ganar al menos tres de cinco bazas.

Al ordenar, el repartidor recoge la carta visible y descarta una. Si todos pasan hay segunda ronda para escoger cualquiera de los otros tres palos; si todos vuelven a pasar el reparto se anula. No hay obligación de escoger para el dealer ni modalidad de jugar solo. Sale J1 tras cerrar la elección.

La sota del triunfo es right bower y la sota del mismo color es left bower: ambas pertenecen al triunfo, por encima del as. Para asistir se usa ese palo efectivo, también si la sota tenía otro símbolo impreso. Debes asistir si puedes; si no, descarta o corta. Gana la mayor carta del palo de salida o el mayor triunfo.

Tres o cuatro bazas dan un punto a la pareja que eligió; cinco dan dos. Si no llega a tres, los contrarios hacen euchre y reciben dos. Ejemplo: con corazones de triunfo la sota de diamantes debe asistir como corazón, no como diamante. Se juega una mano y se puede repetir rápidamente con la misma configuración.

## canasta

Canasta individual de dos, ciento ocho cartas: dos barajas y cuatro jokers. Quince cartas por mano. Dos y jokers son comodines; los treses rojos se exponen y reemplazan al robar. Se juega una mano con entrada fija de cincuenta puntos, independiente de partidas anteriores.

Roba dos cartas o recoge todo el descarte si tienes dos naturales que igualen su carta superior. Debes bajar esas dos y la superior como grupo; la entrada debe cumplir cincuenta si aún no has bajado nada. Esta variante exige siempre la pareja natural, incluso con pila no congelada. No puedes recoger si arriba hay comodín o cualquier tres. Selecciona después grupos o añadidos y termina con descarte.

Una combinación necesita al menos dos naturales y tres cartas totales; máximo tres comodines. No se bajan grupos de treses ni solo de comodines. Siete o más forman canasta: pura quinientos, mezclada trescientos. Solo se puede salir con una canasta. Cartas bajadas dan su valor; cartas restantes lo restan. Jokers cincuenta; ases y doses veinte; ocho a rey diez; demás cinco.

Los treses rojos añaden cien cada uno si tienes grupos, o los restan si no; los cuatro dan ochocientos en total. Salir añade cien. Ejemplo: dos reyes y joker pueden abrir, valor setenta; ir agregando hasta siete crea canasta mezclada. La pila congelada se señala. No hay permiso de compañero, porque son dos individuales, ni contratos acumulados. El registro enumera el contenido de los grupos ya públicos.

## gin-rummy

Gin Rummy de dos, cincuenta y dos cartas, diez por mano. Forma grupos de tres o cuatro iguales o escaleras de tres o más del mismo palo. El as es bajo y no conecta rey con dos. Solo se juega una mano; Nueva partida conserva tus modos y crea otro reparto.

Cada turno roba del mazo o del descarte y termina descartando. Puedes cerrar con knock si los diez naipes restantes suman diez puntos o menos sin combinar. El motor calcula la mejor partición de la mano sin reutilizar naipes. Gin es cerrar sin ningún sobrante; no basta con tener diez puntos bajos.

Sin gin, quien cierra recibe la diferencia positiva de penalizaciones. Si la otra persona tiene igual o menos, hace undercut y recibe veinticinco más la diferencia. Gin da veinticinco más los sobrantes del rival. Figuras valen diez y as uno. Después de knock el rival puede colocar sobrantes sobre los grupos del cierre: el motor minimiza automáticamente su penalización mediante layoff. Contra gin no se admite layoff.

Ejemplo: knock con cuatro contra once da siete; contra tres pierde y el rival recibe veintiséis. Gin contra once da treinta y seis. El descarte se recicla si es necesario conservando su carta superior. Al límite de turnos sin cierre la mano termina sin puntos. La IA minimiza sobrantes y usa solo información propia y carta superior visible.

## mau-mau

Mau-Mau de dos a cuatro, baraja de treinta y dos con as, siete, ocho, nueve, diez, sota, dama y rey. Cinco cartas por mano y una carta inicial en descarte. Gana quien se queda sin cartas; los rivales conservan sus manos privadas.

Juega una carta del mismo palo o valor que la superior. La sota es comodín y permite elegir cualquier palo desde el selector. Si no juegas, roba una: puedes jugarla si sirve o pasar. La carta superior inicial establece valor y palo, sin ejecutar su efecto especial durante el reparto.

Siete obliga al siguiente a robar dos y perder turno; no se apilan penalizaciones. Ocho salta al siguiente puesto; con dos vuelve a quien lo jugó. Sota cambia el palo. Esta variante no cambia sentido con rey, no penaliza por anunciar Mau y permite sota sobre otra sota. El descarte se recicla conservando su carta superior.

Ejemplo: sobre nueve de corazones puedes poner nueve de picas, cualquier corazón o una sota. Para una sota debes elegir el palo deseado; los botones de mano ejecutan la primera opción y el selector permite las cuatro. Si una partida entra en un ciclo prolongado se cierra por menor cantidad de cartas, límite identificado en el resultado. La IA usa efectos y valores altos para vaciar mano.

## briscola-chiamata

Briscola Chiamata de cinco, baraja española de cuarenta usada como equivalente de las cartas italianas. Ocho cartas por persona. Se subastan puntos de sesenta y uno a ciento veinte; quien ofrece más elige una carta que no tiene. Su palo determina triunfo y su poseedor es compañero secreto.

La subasta pasa por puestos activos: pasar te retira; una oferta supera a la anterior. Al quedar un postor o alcanzar ciento veinte se llama carta. Esta es la variante de subasta numérica, no de subastar qué rango se llamará. J1 abre la primera baza. No existe obligación de asistir, fallar ni montar.

Fuerza: as, tres, rey, caballo, sota, siete, seis, cinco, cuatro, dos. Puntos: once, diez, cuatro, tres, dos y cero. Gana el triunfo mayor o, si nadie corta, la mayor del palo de salida. Quien gana sale. El socio se revela al jugar la carta llamada; la interfaz no revela su puesto antes de ese momento, aunque pueda inferirse de cómo juega.

Declarante y socio suman sus puntos: deben alcanzar la promesa. Cumplir da dos a cada atacante y menos uno a cada defensor; fallar invierte esos signos. Ejemplo: llamar as de copas fija copas como triunfo y asocia a su poseedor. Se juega un reparto con recuento total de ciento veinte; no hay señales secretas externas ni protección contra inspección del estado en salas entre amigos.

## tarot-frances

Tarot francés de cuatro con setenta y ocho cartas: catorce por palo, veintiún triunfos y Excusa. Se reparten dieciocho y se reservan seis para el perro. Un petit sin otro triunfo ni Excusa provoca nuevo reparto. Cada persona tiene una oportunidad de pasar o subir contrato: Toma, Guarda, Guarda sin perro y Guarda contra perro, factores uno,dos,cuatro,seis.

Toma y Guarda muestran públicamente las seis cartas del perro, lo añaden a la mano del declarante y obligan a descartar seis. No se descartan reyes, bouts ni Excusa; solo si no quedan cartas normales se permite descartar triunfos no bouts. Sin perro lo añade a las capturas del declarante sin mostrarlo; contra perro a la defensa. El declarante juega solo frente a las otras tres personas.

Debes asistir al palo de salida. Si no tienes, corta con triunfo; al cortar o asistir a triunfo debes superar el mayor ya jugado si puedes. Excusa puede jugarse siempre y no gana normalmente: antes de la última baza la conserva su bando y compensa medio punto a la captura rival. En la última cambia de bando, salvo el caso especial de chelem con salida de Excusa.

Bouts son triunfo uno, veintiuno y Excusa. Objetivo: cincuenta y seis, cincuenta y uno, cuarenta y uno o treinta y seis según cero a tres bouts. Valen cuatro y medio; rey cuatro y medio, dama tres y medio, caballo dos y medio, sota uno y medio, resto medio. Se aplica base veinticinco más diferencia, factor, petit au bout de diez y chelem no anunciado de doscientos. No hay poignée ni chelem anunciado. La mesa juega en sentido horario y una sola mano; estas diferencias constan aquí y en inventario.

## Tamaños estables

Las casillas de ajedrez 2D usan ocho filas y ocho columnas explícitas; las piezas no participan en el cálculo del tamaño. Klondike conserva una anchura común para mazo, bases y siete columnas, y el tamaño de cada carta depende solo del espacio disponible. Las secuencias largas desplazan internamente el tapete; no comprimen la tipografía ni alteran el escenario. Spider y Carta Blanca conservan igualmente el tamaño de las cartas y el paso entre ellas; la zona de columnas admite desplazamiento interno cuando hace falta. No se desplaza la página.

Las manos grandes de las nuevas mesas usan una tira horizontal de cartas de tamaño constante. El selector de acciones siempre permite acceder a todas las decisiones, incluso sin desplazar esa tira. El registro largo se abre en una ventana que admite desplazamiento.

## Límites compartidos

La IA es de práctica: decide a partir de su mano y mesa visible, con heurísticas o búsqueda de combinaciones. No se presenta como fuerza profesional. Salas entre amigos sincronizan el estado íntegro: las manos se ocultan en la interfaz, pero no frente a inspección técnica. Los importes son puntos o fichas virtuales. Las variantes se identifican en cada ayuda, particularmente Rummy sin contratos Continental, Truco argentino sin muestra uruguaya, Gin con layoff automático y Canasta individual con entrada fija.
