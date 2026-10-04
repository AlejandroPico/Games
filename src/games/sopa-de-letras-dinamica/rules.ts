export const themes: Record<string, string[]> = {
  Naturaleza: [
    "BOSQUE",
    "RIO",
    "LAGO",
    "FLOR",
    "LOBO",
    "ZORRO",
    "LUNA",
    "SOL",
    "HOJA",
    "ROCA",
    "NUBE",
    "MAR",
  ],
  Viajes: [
    "TREN",
    "BARCO",
    "MAPA",
    "RUTA",
    "AVION",
    "PLAYA",
    "ISLA",
    "PUERTO",
    "HOTEL",
    "VIAJE",
    "NORTE",
    "SUR",
  ],
  Ciencia: [
    "ATOMO",
    "CELULA",
    "LASER",
    "ORBITA",
    "ENERGIA",
    "ION",
    "MASA",
    "ONDA",
    "LUZ",
    "GEN",
    "ROBOT",
    "DATOS",
  ],
};
export const dirs = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];
export type State = {
  n: number;
  grid: string[];
  words: string[];
  found: { word: string; cells: number[] }[];
};
export function initial(n: number, theme: string): State {
  const grid = Array(n * n).fill(""),
    words: string[] = [];
  for (const word of [...themes[theme]].sort((a, b) => b.length - a.length)) {
    if (word.length > n) continue;
    for (let attempt = 0; attempt < 300; attempt++) {
      const r = Math.floor(Math.random() * n),
        c = Math.floor(Math.random() * n),
        [dr, dc] = dirs[Math.floor(Math.random() * 8)],
        cells = Array.from({ length: word.length }, (_, i) => [
          r + dr * i,
          c + dc * i,
        ]);
      if (
        cells.every(
          ([a, b], i) =>
            a >= 0 &&
            b >= 0 &&
            a < n &&
            b < n &&
            (!grid[a * n + b] || grid[a * n + b] === word[i]),
        )
      ) {
        cells.forEach(([a, b], i) => (grid[a * n + b] = word[i]));
        words.push(word);
        break;
      }
    }
  }
  return {
    n,
    words,
    grid: grid.map(
      (c) => c || "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)],
    ),
    found: [],
  };
}
export function trace(a: number, b: number, n: number): number[] {
  const r = Math.floor(a / n),
    c = a % n,
    rr = Math.floor(b / n),
    cc = b % n,
    dr = rr - r,
    dc = cc - c;
  if (dr && dc && Math.abs(dr) !== Math.abs(dc)) return [];
  return Array.from(
    { length: Math.max(Math.abs(dr), Math.abs(dc)) + 1 },
    (_, i) => (r + Math.sign(dr) * i) * n + c + Math.sign(dc) * i,
  );
}
export function find(s: State, a: number, b: number): State {
  const cells = trace(a, b, s.n),
    text = cells.map((i) => s.grid[i]).join(""),
    word = s.words.find(
      (w) => w === text || w === text.split("").reverse().join(""),
    );
  return word && !s.found.some((f) => f.word === word)
    ? { ...s, found: [...s.found, { word, cells }] }
    : s;
}
export function automatic(s: State): State {
  for (const word of s.words.filter((w) => !s.found.some((f) => f.word === w)))
    for (let a = 0; a < s.grid.length; a++)
      for (const [dr, dc] of dirs) {
        const r = Math.floor(a / s.n) + dr * (word.length - 1),
          c = (a % s.n) + dc * (word.length - 1);
        if (r >= 0 && c >= 0 && r < s.n && c < s.n) {
          const b = r * s.n + c,
            cells = trace(a, b, s.n);
          if (cells.map((i) => s.grid[i]).join("") === word)
            return find(s, a, b);
        }
      }
  return s;
}
