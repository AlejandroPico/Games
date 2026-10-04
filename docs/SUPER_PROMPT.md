# Games · Super prompt de continuidad

## Actualización de utilidades compartidas y ediciones

La infraestructura de mesas compartidas admite entre dos y seis puestos, incluidos locales, remotos e inteligencia artificial, manteniendo el protocolo de transporte existente. La validación de instantáneas en room-model.ts y la aceptación de número de puesto en TablePeer.ts deben conservar el mismo límite. Un cliente antiguo puede rechazar una mesa ampliada: debe actualizarse antes de conectar, sin inventar una compatibilidad automática. Prueba especialmente el último puesto remoto, la espera de todos los invitados y el cambio de actor a través del anfitrión. Cada mesa concreta debe limitar su cantidad de participantes a lo que permiten sus reglas, aunque el transporte soporte más.

src/shared/useMatch.tsx es una utilidad nueva para implementar mesas independientes sin repetir infraestructura. Recibe una fábrica de posición inicial y una cantidad inicial de participantes. Guarda position, started, mode, players y humans mediante useRoomState. La fábrica se utiliza para la primera posición y para cada inicio o reinicio; debe recoger los ajustes elegidos actualmente. start sustituye la posición y activa la sesión; reset abre ajustes desactivándola. Estas funciones no contienen reglas de un juego. Cada módulo sigue implementando sus propias jugadas, validación, puntuación, final, secretos y decisiones automáticas. No introduzcas dependencias entre motores aprovechando esta utilidad.

useMatchAI combina machine del transporte, observación y useAutoplay. Recibe el actor real, condición terminal y una función que devuelve la siguiente posición completa. Las fases internas pueden conservar actor o entregarlo a otra persona: no deduzcas el puesto de la paridad del número de jugadas. Cuando un rol humano pueda ser el segundo puesto, configura explícitamente su correspondencia en el fallback local; las salas online siempre respetan los asientos configurados. Las búsquedas que resulten pesadas continúan usando useAI y un Worker propio, con cancelación y pausa. No uses una temporización local adicional para resolver el mismo estado dos veces.

PrivateHand.tsx oculta información en el relevo de personas que comparten pantalla. Usa un token de fase o jugada que cambie cuando deba cerrarse la cortina; revelar una mano no debe revelar manos rivales. Esta cortina complementa privateTable de GameLayout, que oculta la mesa al participante online inactivo. Ninguno constituye cifrado ni antitrampas: los datos sincronizados siguen siendo accesibles mediante inspección técnica del cliente. Los estados locales de selección deben limpiarse al cambiar posición o reiniciar, y nunca pueden asumir que un índice anterior sigue existiendo en la mano o el tablero actual.

usePieceDrag admite ahora elementos HTML y SVG. Al arrastrar un grupo SVG crea un contenedor SVG con el viewBox correspondiente a su caja gráfica, para que la pieza no desaparezca al salir de su SVG original. El destino continúa identificándose con data-drop y la validación pertenece al motor de cada juego. Conserva la cancelación, Escape, retirada de fantasmas y supresión del clic posterior. Tanto ratón como tacto deben comprobarse; añadir un controlador de puntero no demuestra por sí solo que un arrastre funcione.

Las guías pueden residir en módulos adicionales importados por src/shared/guides.ts. El mapa exportado sigue siendo la fuente efectiva para presentación e inventario. Identifica siempre la edición implementada: una adaptación original de un género no es un reglamento comercial completo, y una reconstrucción histórica incierta no es una verdad definitiva. Si no se encuentra una referencia verificable para un nombre, registra esa incertidumbre y describe fielmente la variante ofrecida; no inventes procedencia cultural. Las decisiones de IA con información privada solo pueden utilizar la mano propia y la historia pública permitida. Comprueba esa condición cambiando secretos rivales y comparando la decisión cuando el estado público es idéntico.

## 1. Cómo utilizar este documento

Actúa como colaborador responsable de continuar Games, una colección web de juegos creada por Alejandro Pico. Lee este contexto completo antes de proponer una ampliación, modificar la experiencia o sustituir una parte de su arquitectura. Su finalidad es conservar las decisiones del propietario y explicar cómo están materializadas. No es un anuncio comercial, una propuesta pendiente ni una petición de reconstruir la aplicación desde cero. Mantén las funciones ya existentes y realiza la tarea concreta que indique el propietario en la conversación vigente.

Este documento debe entregarse junto con el inventario descargado de la misma versión. El inventario contiene los juegos concretos, sus identificadores, nombres asociados, estados, categorías, variantes y rutas de implementación. Aquí no se enumera ese catálogo porque crece continuamente. Antes de sugerir un juego consulta tanto los registros implementados como los pendientes: un concepto reservado también cuenta como existente a efectos de evitar ideas repetidas. Una variante relacionada no es automáticamente una idea nueva; explica la diferencia mecánica antes de proponerla como tal.

Distingue tres clases de información durante tu trabajo: requisitos expresos del propietario, comportamiento actual comprobable y mejoras posibles aún no implementadas. No conviertas una aspiración en una afirmación de disponibilidad. Este contexto no puede garantizar que el código permanezca idéntico después de la descarga. Contrasta las rutas, versiones, límites y adaptadores con el repositorio actual. Si el propietario da una instrucción nueva, incorpora la decisión al contexto y al código correspondiente, respetando las instrucciones superiores aplicables a tu entorno de trabajo.

## 2. Identidad, direcciones y objetivo del proyecto

El nombre del producto es Games. El repositorio público es https://github.com/AlejandroPico/Games y la página publicada es https://alejandropico.github.io/Games/. El portfolio del autor es https://alejandropico.github.io/Portfolio/. Utiliza estas direcciones exactas en las referencias al proyecto mientras sigan vigentes. La publicación utiliza GitHub Pages y GitHub Actions. La página es estática: entrega archivos al navegador y allí se ejecutan la interfaz, las reglas, las animaciones y los motores de decisión. No hay un servicio propio de cuentas ni un servidor de partidas alojado dentro de GitHub.

La finalidad es ofrecer una entrada común a juegos de mesa, tablero, cartas, lógica, estrategia, memoria, deducción, palabras, dados, puzles y otras familias que se incorporen. El catálogo debe poder crecer sin rediseñar la página principal ni mezclar los motores de juegos diferentes. El propietario añadirá ideas en futuras conversaciones; algunas se convertirán directamente en juegos y otras quedarán registradas como fichas pendientes. Considera esta extensibilidad un requisito permanente, no una excusa para mostrar partidas que aún no existen.

No escribas una descripción del producto basada en una cantidad fija de juegos. La cantidad cambia y cualquier cifra incrustada en un título, metadescripción, presentación o Acerca de quedaría obsoleta. Describe una colección abierta de juegos de todo tipo. Los recuentos calculados dentro del inventario sí tienen sentido, porque informan del estado de una instantánea y se obtienen del registro efectivo. La identificación del autor y los enlaces al portfolio y al código pertenecen al panel Acerca de, no a un pie permanente que reste espacio al juego.

## 3. Relación con el propietario y autorización de trabajo

El propietario prefiere que se materialicen sus peticiones, con cambios revisables y comprobados, sin detener el trabajo para pedir confirmaciones rutinarias. En este proyecto ha autorizado trabajar en la rama principal y subir a Git los cambios necesarios para las tareas solicitadas. AGENTS.md refleja esa autorización: se trabaja en main, sin forzar pushes, y no se exige una aprobación adicional para los cambios de código y despliegues ya autorizados. Comprueba que las instrucciones vigentes no hayan revocado esta preferencia. La autorización no permite borrar trabajo ajeno, publicar secretos ni realizar acciones fuera del alcance del proyecto.

Antes de editar inspecciona el estado de Git y lee AGENTS.md y README.md. Si existen cambios de otra persona, consérvalos y evita una limpieza indiscriminada. Varias personas y agentes pueden trabajar en la colección, incluso con modelos o herramientas distintos. La estructura debe permitir que cada integrante comprenda los contratos compartidos y pueda completar un módulo sin investigar toda la conversación original. No introduzcas dependencias innecesarias entre las reglas de un juego y las de otro.

Comunica avances en español, con palabras claras, explicando lo que has comprobado y lo que falta. El propietario prefiere resultados concretos a explicaciones de comandos o discusiones sobre herramientas internas. Una publicación no está verificada solo porque un push haya terminado: comprueba la ejecución de Actions, la versión visible en Pages y las funciones afectadas. Cuando una limitación real impida completar algo, descríbela con precisión; no presentes como terminado un cambio que no has podido guardar, probar o desplegar.

## 4. Principio visual: simplicidad integrada

La dirección visual expresamente solicitada es limpia, compacta y coherente. No vuelvas a una portada genérica con grandes titulares, tarjetas redondeadas, bloques de marketing o una primera pantalla promocional que ocupe toda la altura. El propietario rechazó una presentación inicial dedicada a un juego destacado. La entrada debe mostrar directamente la colección. Quiere imágenes cuidadas y una sensación de calidad, pero la calidad no se consigue llenando el espacio de adornos, paneles secundarios o texto innecesario.

Los contenedores de la interfaz utilizan esquinas rectas de noventa grados, bordes finos y separaciones moderadas. Esta norma afecta botones, ventanas, fichas, selectores y superficies de controles. No la apliques mecánicamente a elementos físicos que deben ser redondos: una ficha circular, un dado o un símbolo pueden conservar su geometría. Diferencia la forma de un objeto del juego de la forma de un contenedor de interfaz. Usa líneas discretas y contraste de los temas existentes para separar información, sin envolver cada dato en una caja adicional.

Mantén una paleta y tipografía consistentes. Las variables CSS compartidas definen fondo, papel, tinta, texto secundario, líneas y acentos. La tipografía actual utiliza fuentes del sistema, incluyendo Segoe UI cuando está disponible; no hay dependencia de Google Fonts. Las imágenes o escenas deben respetar la composición cuadrada de las fichas. El propietario señaló dibujos innecesariamente inclinados y títulos descentrados: comprueba la alineación horizontal y vertical, especialmente en nombres largos y en los puntos de ruptura de móvil.

## 5. Barra superior, iconos y panel Acerca de

La barra superior permanece visible durante la navegación y el desplazamiento del catálogo. A la izquierda aparece Games con su favicon. Pulsar la marca regresa a la colección. En una partida aparece el título del juego centrado en la zona superior; fuera de una partida no se añade un título promocional en ese espacio. Evita repetir dentro de la mesa un encabezado enorme con el mismo nombre o una ruta de migas de pan. El propietario prefiere iconos reconocibles y discretos a una fila de etiquetas permanentes.

En la derecha se conservan búsqueda mediante lupa, filtros, iluminación y Acerca de mediante información. Búsqueda y filtros abren desplegables adaptados al espacio disponible. No hay un botón separado de Git en esta barra: el enlace al repositorio vive dentro de Acerca de. Tampoco añadas un pie inferior con marca, créditos o código abierto; esa información ya está centralizada en Acerca de y no debe reducir la altura de la partida.

Acerca de presenta identidad, explicación breve de la colección, portfolio y repositorio de forma visualmente cuidada. No lo llenes de instrucciones obvias, como una explicación permanente de cómo crear un acceso directo en el navegador. Si existe un evento de instalación disponible, la aplicación puede ofrecer su botón real de instalar; no inventes la disponibilidad de ese evento. El icono de información superior no debe confundirse con el de instrucciones de un juego: las ayudas del juego utilizan un interrogante dentro de un círculo. Los dos controles tienen funciones diferentes y etiquetas accesibles distintas.

## 6. Fichas y estados del catálogo

Las fichas del catálogo son cuadradas, suficientemente grandes para que el arte tenga presencia, con bordes rectos. El contenido principal es la imagen o escena que representa el juego. El nombre se superpone a esa imagen y debe quedar centrado en ambos ejes al mostrarse, incluyendo estados de ratón, foco y interacción táctil aplicables. No añadas botones redundantes de Jugar ahora ni una flecha diagonal en la esquina. La ficha completa ya actúa como acceso a la mesa implementada.

La cantidad de jugadores está integrada de forma discreta en la esquina superior derecha. La categoría aparece en la parte inferior de la misma imagen. Estos datos no llevan recuadros individuales ni píldoras redondeadas. No muestres en las fichas tiempos estimados, duración a tu ritmo ni otros detalles que el propietario considera innecesarios para escoger. La duración puede permanecer como metadato interno del inventario; su existencia en el registro no es una orden de devolverla al diseño público.

El criterio actual admite fichas pendientes en gris y deshabilitadas. Este criterio sustituyó una preferencia inicial de no mostrar futuros juegos. Conserva las ideas pendientes para que no se olviden, pero no permitas abrir una mesa inexistente ni etiquetes una implementación parcial como lista. El registro efectivo combina entradas base con las ideas del roadmap y las correcciones que activan algunos conceptos. Una entrada del roadmap puede conservar ready:false mientras el registro final la sobrescribe: el inventario y el catálogo deben leer el resultado combinado, no deducir disponibilidad solo del archivo de ideas.

## 7. Búsqueda y filtros combinables

La búsqueda está separada de la elección de categorías. La implementación normaliza el texto para comparar en minúsculas y sin diacríticos, de modo que un acento no impida encontrar un nombre. Se busca sobre nombre, categoría y etiquetas. No conviertas una consulta vacía en un error ni mantengas un estado de filtros invisible que deje la colección aparentemente vacía sin ofrecer una forma de limpiarlo. El resultado vacío debe explicar que no hay coincidencias y permitir volver al catálogo completo.

Los filtros permiten seleccionar varias categorías o etiquetas a la vez. El comportamiento vigente muestra los juegos que coinciden con cualquiera de las categorías seleccionadas y combina ese conjunto con la consulta textual. No cambies silenciosamente esa unión por una intersección estricta; si se solicita otro criterio, explica y actualiza el texto de la interfaz. Los valores disponibles se obtienen del catálogo, para que una categoría nueva no requiera editar una lista duplicada en la cabecera.

No añadas de nuevo un filtro público de disponibles frente a próximamente que el propietario retiró. El inventario interno sí puede filtrar por estado, porque sirve para gestionar y exportar la colección. Desde una partida, aplicar una búsqueda o filtro regresa a los resultados de la colección. La barra fija conserva acceso a estas funciones. En móvil el desplegable tiene una anchura limitada por la ventana y sus controles siguen siendo utilizables, sin desbordar horizontalmente la página ni tapar el control de cierre.

## 8. Iluminación y límites del modo automático

Existen cuatro opciones: día, tarde, noche y automático. Los temas manuales cambian las variables CSS del documento; la selección se conserva mediante games-theme-mode en localStorage. El automático utiliza un símbolo propio sencillo, no el icono de un ordenador que el propietario rechazó. No añadas un botón intermedio para ajustar por ubicación: entrar en automático intenta obtener la ubicación mediante la API y el permiso normal del navegador. Debe funcionar también cuando ese permiso no se concede.

La ubicación se redondea a décimas de grado y se guarda únicamente en este navegador bajo games-sun-location. El cálculo utiliza fecha, hora y posición solar estimada para distinguir amanecer, día, tarde y noche. Se actualiza periódicamente, actualmente cada minuto. Si no hay ubicación disponible, se aplica una aproximación estacional con el horario local y referencias del hemisferio norte. Esta alternativa es una aproximación, no una determinación exacta del ocaso en cualquier punto del planeta.

No afirmes que la web mide iluminación ambiental, meteorología o luminosidad de la pantalla. No tiene esas mediciones. La petición original buscaba adaptar la sensación visual al momento y lugar, teniendo en cuenta que las estaciones cambian la hora de anochecer; el cálculo solar materializa esa intención sin atribuir capacidades inexistentes. Conserva los permisos del navegador y sus fallos normales. Las ventanas internas, tablas, guías, escenas y controles deben heredar el tema; evita fondos blancos o texto oscuro incrustados que queden ilegibles por la noche.

## 9. Mesa de juego y espacio disponible

La partida debe ser el elemento principal al entrar en un juego. Usa casi toda la anchura y altura disponible bajo la cabecera. El propietario rechazó la organización de un gran bloque de tablero junto a otro bloque separado de ajustes. No vuelvas a crear una barra lateral permanente con modos, dificultad y controles básicos. Ajustes, instrucciones y otras opciones viven dentro de la superficie integrada del juego y se muestran cuando hacen falta.

La página de una partida no debe tener desplazamiento exterior. El tablero, sus piezas y controles se adaptan a la altura visible. Para texto largo sí se admite desplazamiento interno en una ventana de ayuda, ajustes o herramientas; la norma no significa que un manual extenso deba comprimirse hasta resultar ilegible. Define con claridad qué contenedor desplaza y evita que un gesto dentro de ese contenedor empuje también la página que está debajo. Las ventanas actuales utilizan límites de altura y overscroll-behavior para contener ese desplazamiento.

GameLayout organiza la barra de estado, observación, sala, estadísticas, ajustes e instrucciones, área de juego, controles específicos y reinicio rápido. No todos los juegos especializados están obligados a reducir su lógica a una sola función; pueden tener adaptadores propios cuando existe una razón real. Sí deben conservar el mismo contrato visual. Ajusta el tamaño de la escena y el tablero mediante las variables de altura disponibles, no mediante dimensiones de escritorio que provoquen scroll al girar un teléfono o abrir un navegador con una ventana baja.

## 10. Menú inicial y equilibrio de modos

Al entrar se presenta un único menú de Ajustes de partida. Contiene la modalidad, dificultad y opciones que realmente admite el juego, con Empezar partida al final. Durante una partida, el botón de ajustes vuelve a ese mismo menú. No mezcles un menú inicial completo con otro menú alternativo de configuración que tenga valores o funciones diferentes. La configuración y el estado de la partida se separan lo suficiente para poder repetir una partida con las mismas condiciones.

Los juegos con contrincantes independientes ofrecen humano contra IA, humanos locales, amigos online y solo inteligencia artificial. Cuatro opciones se distribuyen como dos arriba y dos abajo. Si una mesa dispone de tres opciones, las tres van en una sola fila. Si conserva una quinta opción de juego individual además de las cuatro modalidades comunes, el diseño actual la ordena en tres y dos. Los botones deben ser hijos directos de mode-selector para que las reglas compartidas de CSS detecten bien su cantidad. No envuelvas únicamente el botón de observación en un contenedor extra.

Por defecto participa una persona. No arranques automáticamente una demostración de máquinas cuando el usuario solo ha abierto una ficha. La observación es una elección explícita. Los botones mantienen tamaños, alineación y jerarquía equivalentes; no dejes un último botón colgando en una columna estrecha. El texto debe caber en móvil sin cortar el significado ni sustituir los modos por números ambiguos. Una elección de amigos online abre la preparación real de una sala, no un mensaje decorativo que afirme multijugador sin conectarse.

## 11. Participantes, puestos y juegos individuales

En juegos de varios participantes no reduzcas la configuración a una división rígida entre todos humanos o todos IA. La mesa puede combinar personas en este dispositivo, amigos remotos y máquinas. SeatOptions permite elegir personas y después asignar cada puesto local de manera individual. Los humanos no tienen que ocupar posiciones consecutivas: una mesa con puestos humanos primero y tercero, y máquinas segundo y cuarto, debe funcionar y conservar esa asignación al reiniciar. La primera posición local corresponde a la persona que inicia la práctica.

Las salas permiten roles local, remote y ai. El anfitrión ocupa el primer puesto local; los siguientes se asignan a este dispositivo, un amigo online o una IA. No dupliques acciones de una IA en los invitados. Si el juego tiene equipos, manos privadas, turnos adicionales o fases de respuesta, aplica los roles al actor real de cada decisión, no solo al indicador de turno principal. El número de puestos se deriva de la modalidad válida del juego, respetando sus límites reales.

La exigencia de multijugador no se aplica a puzles intrínsecamente individuales. El propietario canceló expresamente inventar para ellos competiciones paralelas, dos escenarios simultáneos o turnos añadidos artificialmente. Esas mesas mantienen Jugar y Solo IA. Una banca automática que aplica reglas fijas puede seguir siendo parte de una práctica individual; no la conviertas sin petición en una persona que deba ocupar una sala. En cambio, si una variante ya tiene creador de un secreto y descifrador humano independiente, sí existe un contrincante y deben estar disponibles los modos correspondientes. Consulta el inventario para distinguir ambos casos.

## 12. Reinicio rápido y opciones ampliables

Todas las mesas tienen Nueva partida en la esquina inferior derecha una vez iniciadas. Ese botón repite directamente las condiciones actuales: modo, dificultad, tamaño, variante y reparto de participantes. Su finalidad es evitar que juegos breves obliguen a abrir ajustes y buscar otra vez el botón de comenzar. En móvil queda dentro de un área segura y accesible, sin superponerse a una casilla imprescindible ni requerir desplazamiento de página. Usa QuickRestart para conservar esta consistencia.

El reinicio y el botón de ajustes no son equivalentes. Reiniciar reconstruye el estado inicial manteniendo las opciones; ajustes permite modificarlas antes de empezar. En una sala general, el invitado solicita una partida nueva y el anfitrión ejecuta el reinicio sobre el estado compartido. El reinicio mantiene la sala y los roles. El adaptador de tablero con protocolo de movimientos validado conserva su propio acuerdo de revancha. Si faltan participantes remotos, las acciones y el reinicio quedan pausados hasta recuperar una mesa válida.

Cuando las reglas admitan tamaños o duración de reto configurables, considéralos al diseñar nuevas mesas. No lo extiendas a cualquier juego sin comprobar sus reglas. La mesa de memoria permite ocho, doce, dieciocho, veinticuatro o treinta y dos parejas, que equivalen a dieciséis, veinticuatro, treinta y seis, cuarenta y ocho o sesenta y cuatro fichas. Cada pareja tiene un símbolo distinto, el tablero se adapta a varias filas y columnas y el tamaño se conserva al reiniciar. Otras variantes continuas o tableros ampliables se documentan en sus fichas técnicas; no añadas modos sin explicar exactamente qué cambia.

## 13. Navegación, móvil y continuidad de interfaz

La navegación de juegos utiliza fragmentos en la URL. Una mesa se identifica como #<id> y una invitación general puede añadir ?room=<código> después del identificador. Esa consulta pertenece al fragmento, no a una ruta del servidor. Este diseño funciona bajo el subdirectorio de GitHub Pages sin exigir reglas de reescritura de servidor. No sustituyas los fragmentos por rutas absolutas de raíz que produzcan errores al abrir un enlace directo publicado.

Volver desde una mesa regresa a la colección. La aplicación prepara el historial cuando una mesa se abre directamente para que el gesto de atrás conserve ese recorrido. Desde la colección, volver queda a cargo del navegador o del sistema; una aplicación instalada puede cerrarse según su entorno. No intercepte indefinidamente ese gesto ni añadas pantallas vacías como paso artificial. La marca Games también permite regresar. Cambiar de juego desmonta su contexto, cancelando recursos propios y evitando que una sala o IA anterior actúe sobre otra mesa.

Comprueba escritorio, una ventana estrecha, teléfono vertical y teléfono horizontal. El catálogo puede desplazarse porque aumenta su cantidad de fichas; una partida permanece ajustada a la ventana. Las guías y herramientas extensas desplazan internamente. Un teléfono requiere controles táctiles reales, buen contraste y piezas suficientemente distinguibles. Un selector, una ventana o un teclado virtual no deben dejar al usuario atrapado sin cierre. No atribuyas a una prueba de viewport de navegador la misma certeza que una instalación comprobada en un dispositivo Android físico; indica qué has verificado realmente.

## 14. Calidad visual y escenas tridimensionales

El propietario pide gráficos cuidados y ambiciosos, con sensación de videojuego y posibilidad de usar tres dimensiones cuando aporten valor. Ese deseo no autoriza prometer un nivel técnico de producción que no se haya alcanzado. La aplicación combina escenas WebGL, objetos creados con SVG y superficies CSS. Escoge el recurso que mejor comunique el juego y funcione en los dispositivos previstos. No sustituyas un dibujo coherente y rápido por una escena pesada que perjudique controles, lectura o consumo de batería sin aportar una mejora visible.

La escena tridimensional especializada utiliza Three.js y un tablero real generado por código. La miniatura principal reutiliza una posición de muestra; no es una captura ficticia de una escena que no pueda mostrarse durante la partida. Existe una alternativa útil en dos dimensiones. Mantén esa alternativa y una recuperación razonable cuando WebGL no esté disponible. Las preferencias de vista pertenecen a los ajustes integrados, no a una barra lateral distinta. Las cámaras, luces y selección de objetos deben seguir adaptándose al tamaño de la superficie.

Al añadir arte conserva proporciones, iluminación temática, contraste de piezas y orientación legible. No inclines el tablero o las letras solo para dar apariencia de sofisticación. Verifica que el título de la ficha quede centrado sobre el arte y que los datos integrados no choquen con objetos importantes. Las animaciones deben acompañar decisiones reales, nunca encubrir una IA detenida o un estado inválido. Libera renderizadores, controles, geometrías, materiales y listeners al desmontar escenas; un catálogo extenso no puede acumular indefinidamente recursos de mesas que ya se han cerrado.

## 15. Clic, arrastre, cartas y teclado

El propietario quiere seleccionar con clic y también arrastrar donde la interacción física lo permita. No sustituyas uno de esos métodos por el otro. En tableros de piezas, una selección puede mostrar destinos legales y un arrastre debe terminar en uno de esos destinos. En juegos de cartas se transporta visualmente el conjunto permitido, no solo una carta imaginaria cuando las reglas permiten mover una secuencia. La animación debe seguir el puntero o el dedo y retornar a un estado coherente al cancelar o soltar sobre un destino inválido.

usePieceDrag es el adaptador compartido para muchos movimientos. Utiliza eventos de puntero, admite un umbral de movimiento para distinguir clic de arrastre, crea una copia visual de los elementos y descubre destinos marcados con data-drop. Las copias son inertes y se ocultan a la accesibilidad. El hook retira clases temporales, listeners y elementos al terminar o desmontarse, y suprime el clic residual después de arrastrar. Un consumidor debe proporcionar canDrag, onDrop y, cuando corresponda, elements para transportar grupos. La validación final pertenece a las reglas del juego.

No permitas arrastrar una pieza rival, una carta oculta o un objeto fuera de turno. Observación y espera online desactivan los controles humanos. Conserva etiquetas accesibles que indiquen casilla, pieza, carta o estado sin revelar secretos. Las funciones de teclado ya presentes, como direcciones, selección o accesos de tablero, deben seguir funcionando. Un gesto táctil tiene que convivir con el desplazamiento interno de una guía; limita la prevención del comportamiento nativo al área y fase donde realmente hay un arrastre válido.

## 16. Explicaciones completas y referencias

Cada mesa debe ofrecer una explicación suficiente para una persona que no conoce el juego. Un párrafo de dos líneas no satisface este requisito. La ayuda explica objetivo, preparación, número de participantes, significado de los componentes, secuencia del turno, movimientos permitidos, excepciones relevantes, puntuación, final y variantes concretas. Añade un ejemplo comprensible cuando la interacción o la regla pueda confundir. Separa una regla obligatoria de un consejo de estrategia. Explica también qué hacen los controles de la mesa, sin convertir el manual en documentación de programación.

El botón de Cómo jugar usa interrogante. GameGuide combina las secciones específicas de guides.ts, el resumen del componente y las indicaciones compartidas sobre modalidad u observación. guideSources.ts mantiene referencias. Cuando existe una fuente oficial aplicable, úsala y enlázala de forma precisa. Si no existe una fuente oficial identificable para un juego tradicional, documenta la variante real con una referencia fiable sin llamar oficial a un sitio que no lo es. Las fuentes externas requieren conexión; el texto esencial debe estar en la aplicación y seguir disponible sin red.

No copies extensamente reglamentos protegidos ni redactes una guía que contradiga las reglas implementadas. Si una adaptación es propia, casual o incompleta frente a un reglamento de torneo, dilo en la guía y en el inventario. Las categorías comerciales no sustituyen esa explicación. Una mesa inspirada en otro juego no debe presentarse como su versión oficial completa. Los límites de vocabulario, recuento, repetición, arbitraje, generación de repartos o deducción merecen un apartado cuando cambien la experiencia de quien intenta jugar.

## 17. Reglas, autoridad y casos especiales

La intención del propietario es que las implementaciones sean funcionales, completas dentro de la variante declarada y respeten sus normas. No simplifiques una regla difícil en silencio. Antes de programar decide qué variante se está implementando, identifica sus excepciones y comprueba una fuente primaria cuando haga falta. Los motores de reglas viven en el módulo del juego y deben poder verificarse sin renderizar la interfaz. La presentación no debería inventar un resultado solo porque una animación haya terminado o un botón se haya pulsado.

Las transiciones especiales necesitan tanta atención como una jugada corriente: promoción, capturas encadenadas, reservas, recuentos finales, respuestas a ofertas, robos obligatorios, desempates, finales automáticos y reclamables. Cuando una regla obliga a responder a otra persona, el actor de esa respuesta puede ser diferente del turno ordinario. Esas fases afectan simultáneamente a reglas, IA, guía y sala. Una implementación que funcione en práctica local puede fallar online si publica el actor equivocado o reinicia una fase antes de sincronizarla.

El adaptador especializado basado en chess.js distingue reclamaciones por repetición o contador de movimientos de finales automáticos, y mantiene prioridad de mate cuando corresponde. Sin embargo, no constituye arbitraje exhaustivo presencial: posiciones muertas excepcionales, sanciones, conducta o todas las situaciones de caída de bandera no se resuelven como un árbitro de torneo. Otros motores también tienen límites declarados. Conserva esas distinciones. El inventario exportado incluye la guía de cada variante para trasladar estos detalles sin convertir este documento en un listado de juegos concretos.

## 18. Inteligencia artificial y trabajo en segundo plano

Las decisiones automáticas son locales. La colección no consulta de forma general una API de modelos generativos para cada jugada, no contiene una clave de proveedor y no necesita una suscripción para que su rival de práctica actúe. El motor especializado utiliza Stockfish 19 Lite Single mediante un Worker y el protocolo UCI. Otras mesas usan búsqueda limitada, valoración de posiciones, filtros deductivos, muestreo o heurísticas propias. No describas todos esos comportamientos como motores profesionales ni como algoritmos óptimos.

useAI recibe la clase de Worker, la entrada, la condición de actividad y el callback de resultado. La entrada debe ser estable para una posición; recrear objetos sin necesidad puede cancelar y relanzar el cálculo. El hook mantiene ocupación y error, termina el Worker y retira temporizadores al cambiar de posición o desmontarse. La observación añade un ritmo mínimo de decisiones. Los consumidores deben volver a comprobar que un resultado sigue siendo válido para la fase actual, especialmente después de reiniciar, cambiar de modo o desconectarse.

Las IA de información oculta deben decidir con lo que conocería su puesto: mano propia, anuncios públicos, intentos y resultados previos, nunca el secreto completo del rival simplemente porque esté disponible en el estado de la aplicación. La aplicación ya incluye deductores que no reciben el código escondido. Conserva ese principio al ampliar motores. El propietario acepta que algunas heurísticas se detengan o sean modestas y prioriza jugar con humanos; no conviertas esta aceptación en permiso para ciclos evitables, congelar la interfaz o fingir que una partida imposible ha quedado resuelta.

## 19. Observación, ritmo y cancelación

Solo inteligencia artificial permite observar una mesa con todas sus decisiones automáticas o ver un intento de resolución de un puzle individual. ObservationProvider mantiene watching, paused y delay. La elección explícita activa observación y limpia la pausa. ObservationControls ofrece continuar o pausar y velocidades rápida, normal y lenta. El ritmo actual utiliza valores de aproximadamente trescientos cincuenta, novecientos y mil ochocientos milisegundos; no son promesas de tiempo máximo de cálculo, porque una búsqueda puede tardar más.

useAutoplay programa una acción cancelable, ligada a una clave que cambia cuando cambia la posición. Mantiene el callback actual sin duplicar temporizadores en cada render. El hook y useAI consultan room.runner: fuera de red pueden actuar localmente; online solo el anfitrión con la mesa lista resuelve decisiones automáticas. Un invitado no debe ejecutar una segunda IA y publicar resultados que compitan con el anfitrión. Cambiar la pausa o desmontar el juego cancela acciones pendientes.

Al implementar un modo de observación evita leer estados secretos cuando la IA normal no podría hacerlo. Evita también que botones humanos sigan activos bajo la demostración. Si una búsqueda heurística alcanza un límite, informa sin afirmar que no existe solución matemática. Si el objetivo requiere riesgo por falta de información, la IA puede perder legítimamente. Documenta la variante y la política del motor; no cambies reglas para garantizar que la máquina siempre termine ganando y dar así una demostración engañosa.

## 20. Arquitectura real de salas online

Las salas generales usan PeerJS y WebRTC. PeerJS Cloud sirve para señalización y los navegadores intercambian datos de la partida. El anfitrión mantiene la conexión y el estado canónico. La web publicada no escribe partidas en el repositorio, no usa Actions como servidor de turnos y no crea una máquina virtual de GitHub para cada sala. No añadas tokens personales al cliente para simular un backend. Si se pidieran cuentas, salas duraderas o un listado público persistente habría que diseñar un servicio distinto y explicarlo antes de presentarlo como disponible.

La preparación de una sala permite asignar puestos y genera un código. Se comparte el código o un enlace con el fragmento correspondiente al juego. El invitado entra voluntariamente; un enlace preselecciona y rellena la sala, pero no debe generar una partida distinta por accidente. El anfitrión inicia cuando todos los puestos remotos requeridos están conectados. Una mesa de más participantes puede incluir humanos del mismo dispositivo, invitados y máquinas. Cada invitado ocupa un puesto remoto disponible.

TablePeer distingue mensajes de saludo, bienvenida, instantánea, propuesta, rechazo y solicitud de reinicio, con versión de protocolo y juego. El prefijo vigente de las salas generales incorpora versión, identificador y código para no conectar conceptos diferentes por casualidad. El protocolo del tablero especializado de movimientos validados es independiente y utiliza su propio prefijo. Mantén esa separación mientras sus contratos sean distintos. Una red puede impedir WebRTC y requerir TURN; el servicio gratuito de señalización no garantiza disponibilidad. Comunica errores reales sin afirmar que cualquier dispositivo en cualquier red conectará siempre.

## 21. Estado compartido y transacciones

TableRoomProvider crea TableStore y gestiona TablePeer, elección online, apertura y cierre de sala. Los componentes usan useRoomState para valores de partida que deban compartirse. La interfaz de ese hook se parece a useState, admite valor inicial y actualización funcional, pero escribe en un almacén externo observable mediante useSyncExternalStore. Las claves deben ser estables, únicas dentro del contexto de un juego y representar datos serializables. No coloques funciones, elementos DOM o instancias de motores complejas en los mensajes compartidos.

TableStore reúne actualizaciones de un mismo evento en una transacción al terminar la microtarea. Esto evita distribuir una mano nueva antes de cambiar su turno, o publicar una puntuación sin su fase final. El anfitrión incrementa una revisión canónica y distribuye instantáneas. Un invitado propone un parche indicando la revisión de partida que conoce. Se comprueba que pertenece al puesto activo, que la mesa está lista, que la revisión corresponde y que las claves existen. Los límites de tamaño y claves peligrosas protegen la estructura del protocolo, pero no constituyen un sistema de arbitraje competitivo contra clientes modificados.

Los invitados pueden actualizar una vista de manera optimista. Las acciones rápidas posteriores, como introducir varias letras antes de recibir confirmación, se conservan en una cola diferida. Las actualizaciones de presencia de la misma revisión no deben borrar ese borrador. Al avanzar el turno se descartan acciones que ya no pertenecen al invitado y, ante rechazo o desconexión, se recupera el último estado confirmado. Estos detalles están probados y son importantes para juegos con formularios: no reemplaces el modelo por un simple envío por cada tecla sin estudiar la revisión y la cola.

## 22. Actor real, privacidad y fases de respuesta

GameLayout recibe roomTurn con el índice del actor real desde cero, roomPlayers y privateTable. room.machine determina si un actor está asignado a una máquina. room.canAct comprueba si el dispositivo puede realizar esa decisión y room.runner decide dónde pueden ejecutarse IA o resolución temporizada. El juego sigue siendo responsable de señalar correctamente a quién le corresponde actuar en cada fase. No supongas que el jugador normal de turno siempre coincide con quien aprueba un recuento, responde una oferta o debe descartar recursos.

Para fases privadas, la mesa muestra una espera al dispositivo que no tiene turno y deja aparecer la información cuando le toca. En local pueden existir pantallas de entrega de dispositivo y un botón de revelar la mano. Al pasar a la siguiente persona se oculta de nuevo. Los resultados finales y datos públicos permanecen accesibles cuando las reglas lo permitan. Conserva instrucciones específicas para que un usuario sepa cuándo entregar el dispositivo o abrir su mano.

La privacidad actual es de interfaz, no de servidor seguro. El estado sincronizado de las salas generales incluye información oculta y alguien que inspeccione o modifique un cliente podría verla o alterar propuestas. Son salas entre amigos, no una competición con prevención de trampas. No incluyas datos personales o credenciales en ese estado. Tampoco llames verificación completa de reglas al control de forma y revisión del parche. El adaptador especializado valida movimientos contra su estado previo en ambos extremos, pero tampoco proporciona la seguridad de un árbitro externo con cuentas autenticadas.

## 23. Desconexión, temporizadores y reinicio compartido

Una sala general se pausa si falta un amigo requerido. El anfitrión no deja avanzar la IA ni acepta acciones mientras la composición de la mesa esté incompleta. El invitado puede volver a entrar en un puesto remoto libre mientras continúe abierta la pestaña anfitriona. No hay identidad de cuenta, recuperación después de cerrar el anfitrión ni garantía de reclamar el mismo puesto frente a otra persona que conozca el código. La salida y destrucción de conexiones deben liberar listeners y callbacks sin borrar los de una sesión nueva.

El cierre de TablePeer es idempotente. Esto evita que la limpieza de un efecto antiguo destruya callbacks de una conexión que acaba de sustituirla. Conserva esta propiedad al cambiar la gestión de React, especialmente durante desarrollo con recarga de módulos y en StrictMode. La identidad del contexto compartido también se conserva durante HMR para evitar que un proveedor antiguo deje de corresponder al hook recién cargado. Una pestaña nueva debe empezar con un contexto de juego nuevo, no con valores de otra mesa.

Los temporizadores que resuelven turnos se ejecutan en el anfitrión. Un reloj visible puede derivarse localmente de una fecha límite compartida sin transmitir un estado nuevo cada segundo. Esta separación evita conflictos entre revisiones del reloj y entradas de formulario. Al pausar por desconexión ajusta la fecha límite según la política declarada. La solicitud de nueva partida del invitado informa al anfitrión; el anfitrión reinicia estado y opciones de manera consistente y todos reciben el mismo comienzo. No ejecutes un reinicio exclusivamente en el dispositivo invitado.

## 24. Almacenamiento, datos y separación entre módulos

La aplicación actual no necesita una base SQL central. Los datos de catálogo, vocabularios y guías son recursos del proyecto. Algunas preferencias y una mesa especializada guardan datos localmente; muchas partidas adicionales existen solo mientras está abierta su vista. No prometas reanudar todos los juegos si esa persistencia no está implementada. Una exportación del inventario contiene metadatos de software, no una copia de las partidas de visitantes.

El propietario mencionó SQLite como una opción conocida si hiciera falta almacenamiento. Esa mención no obliga a añadir una base a cada juego ni a introducir Python o un servidor a una página estática. Para persistencia local grande podría usarse IndexedDB; SQLite en navegador requeriría un motor WASM y un diseño de almacenamiento apropiado. Para datos compartidos permanentes se necesita un servicio externo. Justifica una tecnología por su necesidad concreta y documenta sus consecuencias antes de cambiar el modelo del proyecto.

Si se añade persistencia a una mesa, utiliza claves o una base propia, con versión de esquema y validación de datos. No mezcles partidas de distintos juegos ni guardes código ejecutable como estado. El guardado especializado actual utiliza games-chess-save-v1. Importar partidas no debe aceptar estructuras arbitrarias sin comprobación ni sustituir datos de otro módulo. La gestión de errores de almacenamiento contempla permisos, cuota y JSON inválido; una preferencia no debería impedir abrir toda la web. No exportes coordenadas de visitantes, historiales de navegación o sesiones privadas dentro de las herramientas internas.

## 25. Aplicación instalable y funcionamiento sin red

Games es una PWA. El manifiesto define identidad, iconos, alcance bajo /Games/ y presentación independiente cuando el navegador permite instalarla. La disponibilidad exacta de Instalar depende del dispositivo y del navegador. Un acceso directo común y una instalación reconocida no son lo mismo. No garantices un diálogo concreto de Android sin probar ese entorno. La interfaz ya captura beforeinstallprompt y appinstalled cuando se proporcionan, conservando la instalación como una acción real y no como un botón vacío.

En producción main.tsx registra sw.js. scripts/generate-pwa.mjs crea el Service Worker tras compilar y calcula una versión a partir del contenido. Precarga archivos propios de dist, incluyendo módulos de juegos y recursos del motor, para que una primera descarga completa permita después navegar y jugar sin red. La aplicación necesita almacenamiento suficiente y que esa primera descarga haya terminado. Los enlaces a reglamentos externos y las salas online siguen requiriendo conexión; no los describas como funciones offline.

Las actualizaciones esperan al cierre de las pestañas existentes para evitar mezclar recursos de dos versiones durante una partida. No introduzcas skipWaiting indiscriminado ni elimines cachés en mitad de una sesión porque una pantalla parezca antigua. La comprobación check:pwa sirve la compilación bajo el subdirectorio previsto y verifica iconos, alcance, navegación y recursos sin conexión, motor y limpieza de cachés anteriores. Las herramientas internas y su texto forman parte de los módulos precargados y pueden abrirse sin red una vez almacenada esa versión. La señalización externa no se convierte por ello en un servicio offline.

## 26. Favicon, iconos y fuentes del motor

favicon.svg debe existir en la raíz del repositorio. Esta ubicación es un requisito del propietario porque su portfolio consulta ese archivo como primera referencia de cada proyecto. El icono actual representa un dado con perspectiva tridimensional y color, mediante SVG. No lo muevas exclusivamente a public ni lo sustituyas por una imagen redonda genérica. scripts/prepare-engine.mjs copia la fuente de la raíz a public/favicon.svg para el despliegue. Si se modifica la fuente, comprueba que la copia publicada y los iconos de instalación sigan siendo coherentes.

public/icons contiene las versiones PNG de instalación, incluyendo una versión maskable. El manifiesto usa esos recursos, no una captura arbitraria del catálogo. Conserva sus tamaños y áreas seguras. Una nueva imagen debe ser legible tanto en un favicon pequeño como en un acceso instalado; evita detalles que solo se entiendan a gran escala. El diseño de la marca no cambia la regla de esquinas rectas en contenedores.

El mismo script prepara stockfish-19-lite-single.js, stockfish-19-lite-single.wasm y su licencia desde el paquete instalado. No dependas de una descarga no fijada durante cada visita. El motor de un hilo no exige los encabezados de aislamiento asociados a motores multihilo. public/engine se genera y está ignorado en Git. Mantén la copia de licencia, las referencias de fuente correspondiente y la ruta relativa del Worker, porque Pages publica dentro de un subdirectorio y una ruta absoluta equivocada impediría cargar la IA.

## 27. Tecnologías y herramientas de desarrollo

El proyecto utiliza React, TypeScript estricto, Vite y CSS convencional. Three.js aporta las escenas tridimensionales, lucide-react aporta la mayor parte de los iconos, chess.js valida la mesa especializada, Stockfish proporciona su motor y PeerJS facilita conexiones. La configuración declarada de esta entrega utiliza React 19.3.0, Three.js 0.180.0, lucide-react 0.468.0, chess.js 1.4.0, Stockfish 19.0.0 y PeerJS 1.5.5. Comprueba package.json y pnpm-lock.yaml si estás leyendo una versión posterior: una referencia histórica de versión no autoriza deshacer una actualización válida.

El entorno previsto es Node 24 y pnpm 11.25.0. TypeScript configura objetivo ES2022, módulos ESNext, resolución Bundler, JSX react-jsx, strict y noEmit. Vitest ejecuta las pruebas de reglas y protocolo. Prettier mantiene el formato de fuentes, pruebas y scripts. Playwright está disponible para herramientas de prueba, pero las comprobaciones visuales que realices deben respetar los controles de navegador autorizados en tu propio entorno; no presupongas un modo de automatización que contradiga sus instrucciones.

No añadas un framework paralelo, un backend, una base de datos o un lenguaje adicional solo para parecer más avanzado. El propietario permitió elegir tecnologías apropiadas; la implementación estable ya tiene una base coherente. Una nueva dependencia debe resolver una necesidad real y mantener el lockfile. No expongas secretos, no descargues bibliotecas desde sitios desconocidos y no cambies versiones importantes sin revisar compatibilidad, licencia, empaquetado y PWA. El objetivo es que otra persona pueda instalar el repositorio y reproducir su compilación con los comandos documentados.

## 28. Árbol de directorios y propiedad de los datos

La estructura de referencia, sin enumerar las carpetas de juegos concretos, es la siguiente. El inventario técnico entrega la carpeta y los archivos reales de cada entrada; un identificador público puede ser diferente del nombre corto de su carpeta, por lo que no debes reconstruir esa ruta mediante una suposición lingüística.

```text
Games/
  AGENTS.md                     normas para colaboradores
  README.md                     visión del producto y desarrollo
  LICENSE                       licencia del proyecto
  THIRD_PARTY.md                dependencias y atribuciones
  favicon.svg                   fuente del icono consultada por el portfolio
  index.html                    documento de entrada y metadatos
  package.json                  scripts y dependencias
  pnpm-lock.yaml                resolución reproducible de dependencias
  pnpm-workspace.yaml           configuración del gestor
  tsconfig.json                 contrato TypeScript
  vite.config.ts                empaquetado y base relativa
  .github/workflows/pages.yml   pruebas, compilación y despliegue
  public/
    favicon.svg                 copia publicada
    manifest.webmanifest        identidad y alcance de la PWA
    icons/                      iconos normales y maskable
    engine/                     motor y licencia, generados
  src/
    main.tsx                    arranque, CSS y registro del Service Worker
    App.tsx                     cabecera, rutas, catálogo y carga diferida
    games/
      registry.ts               registro efectivo de la colección
      roadmap.ts                conceptos reservados
      <carpeta-del-juego>/       módulo independiente
        <Componente>.tsx        interfaz y adaptación de modos
        rules.ts                reglas, estado y transiciones
        ai.worker.ts            cálculo pesado cuando corresponde
        <otros>.ts              utilidades específicas, si se necesitan
    shared/                     contratos, controles, arte y ayudas reutilizables
    internal/                   inventario y ventanas internas
    styles.css                  estilos históricos y base
    redesign.css                dirección visual compacta vigente
    new-games.css               superficies de módulos añadidos
    expansion.css               superficies y arte de ampliaciones
    rooms.css                   salas y equilibrio de modos
  scripts/
    prepare-engine.mjs          copia motor, licencia y favicon
    prepare-internal.mjs        metadatos y verificación del contexto
    generate-pwa.mjs            generación de sw.js tras compilar
    check-pwa.mjs               validación de instalación y caché
  tests/                        pruebas de reglas, interacción y protocolo
  docs/
    SUPER_PROMPT.md              fuente de este contexto
    GAMES.md                    variantes y límites del primer repertorio
    EXPANSION.md                ampliaciones y fuentes de reglas
    REPERTOIRE.md               observación, ayudas y adaptaciones posteriores
    ROADMAP.md                  descripción de conceptos reservados
  .generated/                   inventario de compilación, ignorado
  dist/                         salida de publicación, generada e ignorada
  .qa/                          material local de verificación, ignorado
```

Esta estructura no impone archivos vacíos: una mesa sencilla puede tener solo componente y reglas, y otra puede necesitar motor, cámara, vocabulario o lógica de transporte específicos. Mantén lo específico en su carpeta. Los datos compartidos que realmente tienen un contrato común viven en shared, con nombre y responsabilidad claros. Los archivos generados no son fuentes editables que deban sincronizarse a mano. Conserva .gitignore y no subas node_modules, secretos, cachés, resultados de pruebas o una salida local de dist como si fueran el código del producto.

## 29. Registro efectivo, identificadores y carga diferida

GameInfo contiene id, name, subtitle, category, tags opcionales, players, duration, ready y color. El registro define entradas base y combina roadmapGames con enabledGames para reflejar las activaciones. Los nombres de visualización pueden tener tildes, espacios y variantes; el identificador es estable y aparece en fragmentos, pruebas, claves e inventario. No cambies un identificador publicado solo para hacer una traducción más bonita, porque romperías enlaces e invitaciones existentes.

App.tsx utiliza importaciones lazy para cargar mesas cuando se seleccionan. El mapa extraGames conecta muchos identificadores con componentes; algunos adaptadores especializados tienen importaciones separadas. GameBoundary limita un fallo al contexto de una mesa y se identifica mediante la ruta activa. TableRoomProvider y ObservationProvider envuelven los componentes para proporcionar sala y observación. No importes de manera inmediata todos los motores pesados dentro del catálogo si puedes conservar esa carga diferida.

Al activar una idea ya presente, añade o modifica su corrección efectiva, su tipo de identificador jugable, importación, guía y arte. No crees otra ficha con un nombre levemente diferente para el mismo concepto sin una razón de variante explícita. Comprueba que ready:true corresponda a una mesa realmente accesible y que el título y la cantidad de jugadores describan los modos implementados. La generación del inventario detecta una entrada jugable sin componente y debe fallar antes de publicar; no suprimas esa comprobación para esconder un registro incompleto.

## 30. Componentes y utilidades compartidas

Overlay proporciona la ventana flotante, cierre, foco inicial y contención del recorrido de teclado. Si se apilan diálogos, solo el superior debe manejar Escape o la navegación de foco; cerrar una herramienta interna no debería cerrar también la partida que está debajo. GameLayout es el contrato común de superficie y menús. QuickRestart proporciona el reinicio persistente en la esquina. GameGuide centraliza ayudas completas y referencias, mientras GameBoundary ofrece recuperación de errores sin dejar toda la aplicación inutilizable.

Observation y useAI separan ritmo de presentación de cálculo. TableRoom, TablePeer y room-model separan gestión de interfaz, transporte y almacén. playModes define los casos individuales y la elegibilidad para salas generales; una incorporación necesita revisar esa clasificación. No determines capacidad multijugador únicamente buscando la palabra jugadores en el texto visible: ese texto es descriptivo y no un contrato de roles. La asignación de puestos debe venir de reglas y opciones válidas.

CardFace, CardColumns, HandCards y cards comparten representación y utilidades de cartas donde corresponde. Die representa dados. usePieceDrag adapta movimientos físicos. search contiene lógica de búsqueda reutilizable, fiveInRow mecanismos comunes de alineación y words un vocabulario original finito. NewGameArt, ExpansionArt y RoadmapArt representan familias del catálogo. Estas reutilizaciones ahorran código sin trasladar reglas incompatibles a una utilidad genérica. Antes de duplicar una solución inspecciona su contrato; antes de generalizarla comprueba que las variantes compartan realmente sus condiciones de juego y no solo su aspecto.

## 31. Capas de estilos y mantenimiento de CSS

main.tsx importa styles.css, redesign.css, new-games.css, expansion.css y rooms.css en ese orden. Las capas posteriores corrigen y especializan estilos anteriores. Esta historia importa: una regla antigua de esquinas redondeadas puede existir en la base y quedar anulada por el rediseño vigente. No deduzcas el aspecto final de una sola declaración sin mirar especificidad, orden, tema y media queries. Los estilos de herramientas internas se cargan con su módulo y deben tener selectores acotados para no alterar una mesa.

Entre las variables esenciales están --bg, --paper, --ink, --muted, --line, --soft, --green, --green-hover, --accent, --header-h, --surface-pad y --controls-h. Las mesas calculan alturas útiles, incluyendo --play-h donde se emplea. Utiliza estas variables al añadir bordes, texto o superficies. Mantén foco visible y color de texto propio del tema. No introduzcas una colección paralela de colores fijos para el panel interno, salvo colores físicos que formen parte del arte del juego.

rooms.css detecta tres, cuatro o cinco hijos del selector para componer las filas equilibradas. También preserva la semántica de hidden dentro de game-options: una regla de display aplicada a una etiqueta no debe hacer visible un ajuste marcado como oculto. El tablero configurable de memoria distribuye columnas, filas y tamaño según la cantidad de fichas y la altura disponible. Al modificar una utilidad de CSS comprueba sus consumidores, y evita un arreglo global con important que oculte sin querer mensajes, elementos táctiles o controles de otros módulos.

## 32. Procedimiento para añadir o completar una mesa

Empieza por leer la petición vigente y localizar el concepto en el inventario. Confirma si ya está reservado, implementado parcialmente o terminado dentro de una variante. Revisa la guía y las fuentes aplicables antes de decidir una ampliación. Especifica objetivo, preparación, turnos, condiciones terminales, información pública y privada, participantes y excepciones. Si una adaptación no puede reproducir todas las reglas oficiales, define honestamente qué edición se construirá y conserva esa información visible en las instrucciones.

Implementa primero un estado y transiciones verificables en su carpeta. Añade IA apropiada sin bloquear la interfaz; una heurística transparente es preferible a un rival que conoce secretos o no respeta movimientos legales. Adapta la mesa a GameLayout y las utilidades pertinentes. En juegos con contrincantes migra el estado compartido a useRoomState, identifica roomTurn en todas las fases y selecciona máquinas mediante room.machine. Usa privateTable cuando la interfaz deba ocultar manos o formularios al resto. Si hay más puestos, permite combinaciones de participantes válidas.

Añade configuración inicial, reinicio con las mismas opciones, ayudas extensas, arte de ficha y clasificación correcta. Considera tamaños configurables cuando las reglas lo permitan. Registra la importación diferida y activa la entrada únicamente cuando sea jugable. Comprueba una partida humana, observación, reinicio y, si corresponde, dos dispositivos en sala, incluyendo una fase especial. Prueba los tamaños móviles antes de publicar. Actualiza inventario mediante el generador y el contexto cuando el cambio altere un contrato compartido. No uses ready:true como marcador de una tarea prometida que todavía no has desarrollado.

## 33. Verificación funcional y evidencia

Las comprobaciones deben demostrar comportamiento útil, no repetir una implementación como un espejo. Prueba movimientos ilegales, final, empate, promoción, puntuación, captura, reparto o transición relevante según la mesa. Una prueba de reglas no demuestra que un botón esté centrado; una captura bonita no demuestra que el motor respete una fase excepcional. Escoge evidencia apropiada para cada cambio. La colección ya incluye pruebas de reglas y simulaciones, además de pruebas de protocolo y gestión de revisiones; consérvalas al ampliar funcionalidades.

Para salas verifica asignación de puestos, espera de invitados, primera sincronización, respuesta del invitado, turnos especiales, resolución de IA solo en el anfitrión, desconexión, entrada posterior y solicitud de reinicio. Comprueba escritura rápida en formularios para que la confirmación canónica no borre cambios. Una prueba con PeerJS simulado valida el protocolo, pero no la conexión de una red real; acompaña los cambios de transporte con una prueba real cuando el entorno lo permita. No afirmes haber jugado de principio a fin todas las variantes si solo se revisaron sus menús.

Revisa escritorio y móvil con el navegador, incluyendo títulos largos, cuatro opciones equilibradas, partes privadas y tableros ampliados. Observa la altura exterior y que solo desplazan las ventanas destinadas a texto. Comprueba teclado, foco, cierre y ausencia de errores nuevos. Ejecuta pnpm test y pnpm build antes de subir; son requisitos de AGENTS.md. Después ejecuta check:pwa sobre la salida actual cuando afectes recursos, configuración o publicación. Si una prueba falla investiga la causa; no reduzcas una aserción ni saltes un control para conseguir una apariencia de éxito.

## 34. Compilación, scripts y despliegue reproducible

Una instalación normal usa pnpm install y conserva pnpm-lock.yaml. pnpm dev prepara el contexto interno y arranca Vite en 127.0.0.1. pnpm test prepara esos metadatos y ejecuta Vitest. pnpm build prepara el inventario, comprueba TypeScript, copia motor y favicon, compila con Vite y genera el Service Worker. pnpm check:pwa valida la salida ya construida; no recompila por sí mismo. pnpm preview sirve dist para una comprobación local de producción. Si llamas una herramienta directamente, asegúrate de que sus prerrequisitos generados existan.

Vite usa base relativa ./ para los recursos. La página publicada está bajo /Games/, no en la raíz del dominio. Comprueba Workers, WASM, manifiesto, iconos, rutas y enlaces en esa ubicación. Una función correcta en la raíz de un servidor local puede fallar en producción por una ruta absoluta. No reemplaces la estrategia de recursos sin probar la PWA y las invitaciones compartidas. El código de desarrollo con HMR tampoco es evidencia suficiente del empaquetado final.

.github/workflows/pages.yml responde a pushes a main, pull requests y ejecución manual. Instala con lockfile congelado, ejecuta pruebas, compila, verifica la PWA, sube el artefacto de Pages y despliega cuando corresponde. El checkout conserva historial completo para que las fechas de inventario tengan procedencia real. Los permisos de despliegue se limitan a Pages e identificación del trabajo; no se entregan al navegador. Tras publicar identifica el run asociado al commit y espera su conclusión. Abre la web pública, comprueba la versión afectada y conserva evidencia de funciones reales, no solo el estado verde del pipeline.

## 35. Herramientas internas y acceso reservado

El propietario pidió dos herramientas ocultas detrás de una combinación conocida por él: mantener Alt y pulsar Acerca de en la cabecera. Un clic normal conserva Acerca de. La combinación abre un menú con Panel de control y Super prompt; cada opción se muestra en una ventana flotante que respeta tema, líneas finas, esquinas rectas y comportamiento de cierre del proyecto. No añadas pistas en tooltips, textos públicos, etiquetas accesibles del botón normal o instrucciones de la portada sobre cómo descubrir este acceso.

El acceso es una convención de interfaz, no una autenticación. Los archivos de una web estática y su repositorio público son inspeccionables. Por eso estas herramientas contienen inventario de software y contexto del proyecto, no contraseñas, tokens, datos de visitantes ni partidas privadas. No añadas un código secreto al cliente y lo presentes como protección de información sensible. Si se necesitaran verdaderas funciones administrativas remotas, requerirían una arquitectura con control de acceso diferente a esta ventana de lectura.

El módulo interno se carga de forma diferida cuando se abre. No cambia la ruta del juego ni inicia una partida. Tiene un regreso al menú interno y cierre independiente. Una tabla amplia y un texto largo pueden desplazar dentro de sus contenedores; no deben ampliar la página exterior ni bloquear la barra superior. Los botones de exportación preparan archivos locales desde los datos de esa compilación. La ventana no es un editor de reglas ni una forma de activar entradas sin realizar una implementación comprobada.

## 36. Inventario, formatos y finalidad de las descargas

El inventario presenta todos los registros, empezando por el orden del catálogo. Incluye estado, identificador estable, nombres asociados, categoría, etiquetas, descripción, jugadores, duración orientativa cuando consta, fechas observadas, modos actuales, IA, sala, carpeta, componente, archivos, bytes de fuentes y manual de la variante. Los detalles técnicos pueden desplegarse sin saturar todas las filas. Los filtros de nombre, estado y categoría afectan a la vista; las descargas completas mantienen todos los registros para que una IA no olvide conceptos excluidos temporalmente por un filtro.

El CSV es una tabla de texto UTF-8 con marca de orden de bytes, campos entrecomillados y separador de punto y coma, adecuado para abrir o importar en Excel con configuración española. No es un archivo binario XLSX y no debe nombrarse como tal. Los saltos de línea del manual y los caracteres especiales se escapan correctamente. Los textos que podrían interpretarse como fórmulas se protegen en esta exportación; el JSON conserva los valores originales. No uses separadores concatenados sin escapar cuando una descripción contenga comillas, acentos o varias líneas.

El JSON entrega datos estructurados, procedencia y aclaraciones de alcance. El Markdown completo entrega las fichas técnicas para lectura textual. El listado independiente, en Markdown o texto, identifica conceptos implementados y reservados con nombres asociados y descripción, para solicitar ideas evitando duplicados. Su finalidad no es reproducir una partida ni certificar reglas profesionales. El super prompt se descarga aparte en Markdown o texto y puede copiarse completo. Ambos documentos deben acompañarse al trasladar el proyecto a otra persona o IA; solo el inventario contiene la enumeración concreta del repertorio.

## 37. Fechas, detección de fuentes y verdad de los metadatos

prepare-internal.mjs lee el catálogo efectivo y el historial de sus fuentes. Alta significa primera aparición del ID observada en un commit de catálogo. Primera activación significa primer ready:true observado. Ninguna de ellas demuestra exactamente cuándo se empezó a escribir la implementación, cuándo se guardó un archivo fuera de Git o cuándo terminó un despliegue de Pages. El último cambio de metadatos y el último cambio de la carpeta de fuentes son datos diferentes. Conserva esa diferencia en la ventana y las exportaciones para evitar una falsa precisión.

El generador obtiene rutas de las importaciones de App.tsx y recorre carpetas implementadas. Detecta Workers, patrones de arrastre, literales directos de localStorage e importaciones desde pruebas. Es una inspección de fuentes con reglas declaradas, no una auditoría semántica completa. La ausencia de un literal no prueba ausencia de almacenamiento por un wrapper; encontrar un test que importa la carpeta no demuestra cobertura total de todas sus reglas. Los bytes describen texto de fuentes, no tamaño descargado de una mesa ni consumo de memoria.

La instantánea registra revisión de origen, fecha de generación, presencia de cambios locales y disponibilidad de historial completo. En un ZIP sin .git pueden faltar fechas; no las sustituyas por la fecha de descarga como si fuera creación. En un clon superficial las fechas son primeras evidencias disponibles y requieren advertencia de procedencia. .generated/inventory.json es una salida regenerable ignorada, no una fuente manual. El código de exportación añade la procedencia de esa compilación para que documentos de diferentes versiones no parezcan necesariamente contemporáneos.

## 38. Super prompt vivo y política de actualización

docs/SUPER_PROMPT.md es la fuente de este texto. Se muestra con sus marcas de Markdown para poder inspeccionar la composición literal y se descarga como games-super-prompt.md o texto equivalente. Debe mantener al menos seis mil palabras de información sustancial. El generador verifica ese mínimo antes de desarrollo, pruebas y compilación. No llegues al umbral mediante repetición de párrafos, listados de juegos, texto irrelevante o código que solo infle la cuenta. La finalidad es preservar contexto útil y comprobable.

Actualiza el documento cuando cambien contratos compartidos, navegación, estilos, publicación, persistencia, permisos de trabajo o criterios de participantes. Una nueva ficha por sí sola corresponde al inventario, no a una enumeración añadida aquí. Si una petición posterior revoca una preferencia anterior, escribe la norma vigente y, cuando sea necesario para evitar errores, explica brevemente la sustitución. No conserves dos instrucciones contradictorias sin indicar cuál prevalece. El caso de fichas pendientes y la exclusión de competición artificial para puzles individuales son decisiones ya resueltas.

Conserva enlaces al repositorio y documentación relevante, pero no dependas de que una IA pueda abrir Internet para entender lo esencial. Explica el funcionamiento en el propio contexto y señala dónde contrastar detalles. No incluyas afirmaciones de ensayos que no hayas realizado ni un número fijo de pruebas que quedará anticuado al ampliar la colección. Al entregar una instantánea, anota revisión y procedencia en la exportación y mantén separadas las instrucciones estables de datos variables del catálogo.

## 39. Licencias, nombres y procedencia de recursos

El proyecto está publicado bajo GPL-3.0. Stockfish y Stockfish.js tienen obligaciones de GPLv3 y referencias de fuente correspondiente; la preparación y la publicación conservan licencia y avisos. chess.js utiliza BSD-2-Clause; React, Three.js y PeerJS usan MIT; Lucide utiliza ISC. THIRD_PARTY.md conserva referencias de las dependencias. Verifica las condiciones reales si se incorpora otro paquete o recurso; no asumas que un dibujo o reglamento encontrado en Internet puede copiarse sin atribución o permiso.

Los juegos de práctica no utilizan dinero real. Una denominación inspirada en un juego comercial no debe confundirse con una implementación oficial, una licencia concedida o un uso autorizado de sus ilustraciones. Las adaptaciones propias tienen arte y texto originales y declaran su variante. Cuando una fuente oficial sirva para reglas, enlazarla no otorga automáticamente derechos sobre todos sus gráficos o textos. Conserva los límites ya indicados en guías e inventario.

No reemplaces recursos originales del propietario por contenido remoto que haga depender la experiencia de otro sitio sin necesidad. El proyecto utiliza fuentes del sistema y recursos propios para reducir solicitudes externas. Una imagen generada, una escena de código o un SVG añadido debe mantenerse dentro del repositorio con procedencia comprensible. La licencia del proyecto y la autoría no necesitan repetirse en un pie visible: se consultan en Acerca de y en los documentos del repositorio.

## 40. Límites actuales que no deben ocultarse

La colección combina motores con presupuestos de búsqueda limitados, vocabularios locales y adaptaciones casuales. La fuerza de la IA varía por mesa. Algunos solitarios se reparten aleatoriamente sin demostración de solución; otras mesas construyen un reparto inicialmente resoluble que el usuario puede bloquear con sus decisiones. Una IA detenida no demuestra imposibilidad. Los vocabularios finitos no son un diccionario universal y las definiciones originales no dependen de una consulta generativa externa. La guía concreta indica lo que cada variante admite.

Las salas son privadas por código, sin listado público persistente ni cuentas. La pestaña del anfitrión debe seguir abierta. La reconexión general depende de que exista un puesto remoto libre y un anfitrión vivo; el protocolo especializado tiene sus propias restricciones. La red y la disponibilidad de señalización pueden impedir conexión. La ocultación visual de secretos no equivale a protección frente a un cliente inspeccionado. La PWA requiere descarga y almacenamiento iniciales, y las salas o referencias externas no funcionan sin conexión.

La calidad profesional de reglas exige revisar las excepciones declaradas, no borrar de la documentación las que faltan. Determinadas condiciones de torneo, arbitrajes de persecución, posiciones excepcionales o políticas de acuerdos se resuelven de manera limitada o manual. No conviertas un modo de práctica en una promesa de torneo completo. Las verificaciones de navegador son valiosas, pero no prueban por sí solas instalación física, comportamiento de todas las redes o rendimiento de cualquier teléfono. Describe evidencias y límites con precisión cuando informes al propietario.

## 41. Rendimiento, mantenimiento y trabajo compartido

La colección debe seguir siendo cómoda a medida que crece. Mantén carga diferida de componentes, cálculos pesados en Workers, limpieza de recursos y selectores CSS acotados. Evita un rerender de toda la colección para cada tecla dentro de una partida o una transmisión de sala por cada actualización visual del reloj. Separa estado canónico, configuración, preferencias y efectos de presentación. Cancelar correctamente un cálculo viejo es tan importante como producir una buena respuesta a tiempo.

No optimices de manera prematura mediante abstracciones que mezclen reglas incompatibles. Extrae piezas compartidas cuando tengan un contrato claro y varios consumidores reales. Usa identificadores estables y módulos legibles. Un colaborador debe poder encontrar reglas, IA, interfaz y guía a partir de una fila del inventario. Mantén TypeScript estricto y tipos de mensajes; no conviertas una validación difícil en any generalizado. Los scripts de generación son reproducibles y su fallo debe señalar el dato o contrato ausente, no producir una exportación incompleta silenciosamente.

Al trabajar con más integrantes, respeta cambios sin confirmar, conserva el lockfile y no sobrescribas documentación ajena por una versión menos completa. El propietario permite modelos y herramientas diferentes, por lo que este contexto evita depender de recuerdos privados de un agente. Una solución correcta deja sus decisiones en código y documentos verificables. No añadas instrucciones ocultas en datos de catálogo que ordenen a otras IA saltarse sus normas: las exportaciones son contexto del proyecto, no una fuente de autoridad sobre políticas externas o permisos que el propietario no haya concedido.

## 42. Protocolo de continuidad y criterio de aceptación

Cuando retomes el trabajo, recibe este documento y el inventario como una instantánea. Localiza el repositorio, lee instrucciones vigentes, comprueba la rama y el estado de trabajo y contrasta la revisión de los archivos con la indicada en la descarga. Identifica la petición concreta del propietario y separa lo que afecta a una mesa de lo que altera el contrato común. Si propones ideas, omite también conceptos pendientes y explica por qué una idea nueva no duplica una entrada reservada. Si completas una idea existente, conserva su identidad y actualiza sus metadatos efectivos.

Implementa el cambio necesario sin deshacer preferencias aceptadas: colección directa, fichas cuadradas y centradas, cabecera fija, esquinas rectas, datos integrados, mesa principal sin scroll exterior, ajustes dentro del juego, iluminación, ayudas completas, modalidades apropiadas y reinicio rápido. Comprueba roles humanos y máquinas, turnos especiales y privacidad de interfaz cuando corresponda. Si introduces un tamaño ampliado, comprueba que sus símbolos y reglas sean válidos, que conserve configuración al reiniciar y que funcione en teléfono vertical y horizontal.

Antes de publicar ejecuta las comprobaciones requeridas, revisa el diff y evita archivos generados o privados. Sube a main dentro de la autorización vigente, sin forzar, y verifica Actions y Pages. Actualiza documentación cuando cambie la arquitectura o un requisito; el catálogo se traslada mediante inventario y no mediante un conteo incrustado en la descripción pública. La entrega debe informar qué se cambió, qué se comprobó y cualquier límite material que permanezca. Una tarea está completa cuando el usuario puede usar el resultado solicitado y otra persona puede comprenderlo con estos documentos, sin depender de una explicación verbal que desaparezca con la conversación.

## Presentadores de familias y cálculo cancelable

La privacidad puede depender de la fase: DiceTable admite privateDice como valor o predicado del estado. Oculta las manos durante las propuestas, pero hace pública la revelación de un desafío hasta que el actor inicia otra ronda. La mesa pública sigue sin admitir acciones de un puesto ajeno: GameLayout aplica inert y el protocolo comprueba el actor. No confundas conocer un resultado revelado con poder jugar fuera de turno. El mosaico de retratos usa una cuadrícula propia, con ocho columnas en escritorio y seis en móvil, para mantener los candidatos visibles junto a la pregunta y el botón de confirmación.

Las familias que repiten una estructura visual pueden utilizar los presentadores compartidos DiceTable, DeductionTable y AbstractTable. Esa reutilización incluye la barra de estado, puntuaciones, selección de una acción legal, modos, puestos, cortinas de entrega de pantalla y reinicio. No traslades reglas a esos componentes. Cada motor independiente exporta inicialización, enumeración de acciones, aplicación validada y una decisión automática, además de una representación visible cuando corresponda. Las acciones deben rechazarse si no pertenecen a la fase vigente; sus funciones no modifican el estado previo. Mantén etiquetas legibles y ejemplos concretos en la ayuda. Los adaptadores de reglas deben funcionar sin DOM para que puedan probarse y ejecutarse en un Worker.

El presentador de tablero acepta células con coordenada, texto, propietario, color y bordes de bloqueo, así como una vista previa de las formas orientadas. La clave de célula pertenece al motor; no supongas que el índice visual coincide con el lógico cuando el tablero tiene agujeros o se amplía. La selección de origen, herramienta y destino es local y efímera, pero el resultado confirmado es estado compartido. Los tableros de movimiento admiten clic y arrastre; los de colocación deben mostrar la orientación antes de elegir un destino. Los tableros personales muestran el del actor activo y conservan contexto público de los demás mediante marcadores.

useMatchAI puede recibir una fábrica de Worker específica de la carpeta del juego. El ritmo compartido decide cuándo pedir una acción y solo el anfitrión la ejecuta en una sala. El Worker recibe una copia del estado y devuelve el siguiente. Antes de aceptar una respuesta se comprueba que el estado solicitado sigue vigente. Cambiar posición, finalizar, pausar, cambiar velocidad, abandonar o desmontar termina el cálculo pendiente; una respuesta obsoleta nunca debe sobrescribir una partida nueva. Existe una alternativa local si falla la creación del Worker, sin sustituir la validación de reglas. No prometer fuerza de torneo por usar un Worker: solo evita bloquear la interfaz durante el cálculo.

En deducción separa el acceso de arbitraje a una solución del conocimiento autorizado para elegir una acción de IA. El árbitro necesita comprobar respuestas y acusaciones; el agente que pregunta utiliza su información propia, sus observaciones y las pistas públicas. Un agente emisor puede conocer el mapa o la carta que su papel le proporciona, pero el receptor no. Las heurísticas semánticas no son modelos de lenguaje y pueden no interpretar frases humanas libres. Las cortinas y ocultación visual siguen siendo comodidad entre amigos, no protección del secreto frente a inspección del cliente. No publiques la solución en controles, etiquetas accesibles o notas de un papel que no deba verla.

Cuando una idea del catálogo no corresponde a un reglamento verificable, desarrolla una edición original identificada explícitamente y documenta sus límites. Las variantes recreativas, límites de repetición, formatos de torneo cortos, objetivos públicos o subconjuntos de apuestas deben constar en las ayudas y los metadatos efectivos. Los créditos de cualquier mesa de azar son ficticios y no se compran ni convierten en dinero. Los datos históricos deben distinguir lanzamiento, llegada y descubrimiento y enlazar su fuente. Integra los nuevos módulos de guías en el registro compartido para que también entren en el inventario descargable. No copies una cifra fija del catálogo a la descripción pública.
