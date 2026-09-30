import { Chess, type Square, type PieceSymbol, type Color } from 'chess.js';

export type Outcome = { result: '1-0' | '0-1' | '1/2-1/2'; reason: string };
export const positionKey = (fen: string) => fen.split(' ').slice(0, 4).join(' ');
export function repetitionCount(chess: Chess): number {
  const history = chess.history({ verbose: true });
  const key = positionKey(chess.fen());
  return history.filter(m => positionKey(m.before) === key).length + 1;
}
export function automaticOutcome(chess: Chess): Outcome | null {
  if (chess.isCheckmate()) return { result: chess.turn() === 'w' ? '0-1' : '1-0', reason: 'Jaque mate' };
  if (chess.isStalemate()) return { result: '1/2-1/2', reason: 'Rey ahogado' };
  if (chess.isInsufficientMaterial()) return { result: '1/2-1/2', reason: 'Material insuficiente' };
  if (repetitionCount(chess) >= 5) return { result: '1/2-1/2', reason: 'Quíntuple repetición' };
  if (Number(chess.fen().split(' ')[4]) >= 150) return { result: '1/2-1/2', reason: 'Regla de los 75 movimientos' };
  return null;
}
export function drawClaim(chess: Chess, intended?: { from: Square; to: Square; promotion?: PieceSymbol }): string | null {
  let moved = false;
  try {
    if (intended) { chess.move(intended); moved = true; }
    if (repetitionCount(chess) >= 3) return 'Triple repetición';
    if (Number(chess.fen().split(' ')[4]) >= 100) return 'Regla de los 50 movimientos';
    return null;
  } catch { return null; }
  finally { if (moved) chess.undo(); }
}
// A bare king cannot win. A single bishop/knight cannot mate a bare king.
// Two knights CAN mate with cooperation: never declare KNN vs K a dead position.
export function canPossiblyMate(chess: Chess, color: Color): boolean {
  const own = chess.board().flat().filter(p => p?.color === color);
  const enemy = chess.board().flat().filter(p => p && p.color !== color && p.type !== 'k');
  const pieces = own.filter(p => p?.type !== 'k');
  if (!pieces.length) return false;
  if (pieces.some(p => p && ['p','r','q'].includes(p.type))) return true;
  if (pieces.length === 1 && !enemy.length) return false;
  if (chess.isInsufficientMaterial()) return false;
  return true;
}
export function timeoutOutcome(chess: Chess, loser: Color): Outcome {
  const winner = loser === 'w' ? 'b' : 'w';
  return canPossiblyMate(chess, winner)
    ? { result: winner === 'w' ? '1-0' : '0-1', reason: 'Tiempo agotado' }
    : { result: '1/2-1/2', reason: 'Tiempo agotado; el rival no puede dar mate' };
}
export const pieceNames: Record<PieceSymbol, string> = { p:'peón', n:'caballo', b:'alfil', r:'torre', q:'dama', k:'rey' };

