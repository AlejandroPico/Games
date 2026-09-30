export type Level = 'beginner' | 'club' | 'expert' | 'master';
const settings = { beginner: {skill:0,time:180}, club:{skill:6,time:600}, expert:{skill:14,time:1200}, master:{skill:20,time:2200} };
export class ChessEngine {
  private worker: Worker | null = null;
  private pending: { resolve: (move: string) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> } | null = null;
  private ready: Promise<void>;
  private readyReject!: (e: Error) => void;
  private readyTimer: ReturnType<typeof setTimeout>;
  constructor() {
    this.ready = new Promise((resolve, reject) => {
      this.readyReject = reject;
      try {
        this.worker = new Worker(import.meta.env.BASE_URL + 'engine/stockfish-19-lite-single.js');
        this.worker.onmessage = event => {
          const line = String(event.data);
          if (line === 'uciok') this.worker?.postMessage('isready');
          if (line === 'readyok') { clearTimeout(this.readyTimer); resolve(); }
          if (line.startsWith('bestmove ') && this.pending) {
            const p = this.pending; this.pending = null; clearTimeout(p.timer);
            p.resolve(line.split(' ')[1]);
          }
        };
        this.worker.onerror = () => { reject(new Error('No se ha podido cargar Stockfish.')); this.cancel(); };
        this.worker.postMessage('uci');
      } catch { reject(new Error('Este navegador no admite el motor de IA.')); }
    });
    this.readyTimer = setTimeout(() => this.readyReject(new Error('Stockfish tarda demasiado en cargar.')), 20000);
    void this.ready.catch(() => {});
  }
  async move(fen: string, level: Level, history: string[] = []): Promise<string> {
    await this.ready;
    if (!this.worker) throw new Error('Motor detenido');
    if (this.pending) throw new Error('Ya hay una búsqueda en curso');
    const config = settings[level];
    this.worker.postMessage('setoption name Skill Level value ' + config.skill);
    // Pass the entire game, preserving repetition context in engine search.
    this.worker.postMessage(history.length ? 'position startpos moves ' + history.join(' ') : 'position fen ' + fen);
    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject, timer: setTimeout(() => { this.cancel(); reject(new Error('La IA no ha respondido. Puedes reintentar.')); }, 15000) };
      this.worker!.postMessage('go movetime ' + config.time);
    });
  }
  cancel() {
    if (this.pending) { clearTimeout(this.pending.timer); this.pending.reject(new Error('Búsqueda cancelada')); this.pending = null; }
    this.worker?.postMessage('stop');
  }
  destroy() { this.cancel(); clearTimeout(this.readyTimer); this.readyReject(new Error('Motor detenido')); this.worker?.terminate(); this.worker = null; }
}

