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

