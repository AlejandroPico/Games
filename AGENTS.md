# Colaboración en Games

- Trabajar en main cuando el usuario lo autorice; no forzar pushes.
- Leer README.md y mantener las limitaciones documentadas.
- Cada juego se implementa en src/games/<id>; no introducir dependencias entre sus reglas.
- TypeScript estricto; IA pesada en Workers para no bloquear la interfaz.
- Mantener modo día/noche, teclado, móvil y vista útil sin WebGL cuando corresponda.
- No marcar como disponible un juego incompleto.
- pnpm test y pnpm build son requisitos antes de subir cambios.
- GitHub Pages es estático. No guardar secretos, simular backend ni escribir partidas en GitHub.
- Mantener pnpm-lock.yaml. Copiar el motor con scripts/prepare-engine.mjs.
- El usuario autoriza pushes a main para este proyecto. No se requiere aprobación adicional para cambios de código y despliegues solicitados.
- Todo juego con contrincantes debe ofrecer humano–IA, humanos locales, amigos online y solo IA. En mesas de más de dos participantes permitir mezclar puestos locales, remotos e IA. Excluir los juegos individuales, cuya competencia no debe inventarse.
- Equilibrar los botones de modos: cuatro en 2×2, tres en una fila; cinco en 3+2. Empezar por defecto con una persona implicada.
- Las salas compartidas usan TableRoomProvider, useRoomState para el estado, room.machine para decidir la IA y GameLayout con roomTurn (actor real desde cero), roomPlayers y privateTable cuando haya secretos. IA y temporizadores de resolución solo en el anfitrión; los turnos y las fases especiales deben probarse online.
- Contemplar tamaños configurables en juegos que admitan ampliar o reducir el tablero, manteniendo las reglas, móvil sin scroll de página y el tamaño elegido al reiniciar. Parejas permite hasta 64 fichas con 32 símbolos distintos.
