export const categoryCompletionIds = [
  "dados-mentirosos-perudo",
  "farkle-diez-mil",
  "dados-zombie",
  "liar-s-dice-estilo-casino",
  "craps-dados-de-casino",
  "sichuan-dice",
  "crown-and-anchor",
  "pig-el-cerdo",
  "bunco",
  "cee-lo",
  "hazard",
  "el-asesino-de-la-mansion",
  "codigo-de-redes",
  "pistas-abstractas",
  "deduccion-alquimica",
  "adivina-quien",
  "linea-de-tiempo",
  "el-intruso",
  "construccion-de-colchas",
  "la-colmena",
  "ventanas-de-catedral",
  "bloques-geometricos",
  "quoridor",
  "onitama",
  "yinsh",
  "dvonn",
];
export const categoryCompletionMetadata: Record<
  string,
  { ready: boolean; players: string; subtitle?: string }
> = {
  "dados-mentirosos-perudo": { ready: true, players: "2–6 jugadores" },
  "farkle-diez-mil": { ready: true, players: "2–4 jugadores" },
  "dados-zombie": { ready: true, players: "2–4 jugadores" },
  "liar-s-dice-estilo-casino": {
    ready: true,
    players: "2–6 jugadores",
    subtitle: "Edición original de Games; reglas de esta variante en la ayuda.",
  },
  "craps-dados-de-casino": { ready: true, players: "2–4 jugadores" },
  "sichuan-dice": {
    ready: true,
    players: "2–4 jugadores",
    subtitle:
      "Variante original de cierre de números; no se atribuye un reglamento histórico.",
  },
  "crown-and-anchor": { ready: true, players: "2–4 jugadores" },
  "pig-el-cerdo": { ready: true, players: "2–4 jugadores" },
  bunco: {
    ready: true,
    players: "4 jugadores",
    subtitle: "Bunco de una mesa: cuatro puestos, dos equipos, seis rondas.",
  },
  "cee-lo": { ready: true, players: "2–4 jugadores" },
  hazard: { ready: true, players: "2–4 jugadores" },
  "el-asesino-de-la-mansion": {
    ready: true,
    players: "3–6 jugadores",
    subtitle: "Edición original de Games; reglas de esta variante en la ayuda.",
  },
  "codigo-de-redes": {
    ready: true,
    players: "4 jugadores",
    subtitle: "Edición original de Games; reglas de esta variante en la ayuda.",
  },
  "pistas-abstractas": {
    ready: true,
    players: "3–6 jugadores",
    subtitle: "Edición original de Games; reglas de esta variante en la ayuda.",
  },
  "deduccion-alquimica": {
    ready: true,
    players: "2–4 jugadores",
    subtitle: "Edición original de Games; reglas de esta variante en la ayuda.",
  },
  "adivina-quien": {
    ready: true,
    players: "1–2 jugadores",
    subtitle: "Edición original de Games; reglas de esta variante en la ayuda.",
  },
  "linea-de-tiempo": { ready: true, players: "2–6 jugadores" },
  "el-intruso": {
    ready: true,
    players: "3–6 jugadores",
    subtitle: "Edición original de Games; reglas de esta variante en la ayuda.",
  },
  "construccion-de-colchas": {
    ready: true,
    players: "1–2 jugadores",
    subtitle: "Edición original de Games; reglas de esta variante en la ayuda.",
  },
  "la-colmena": { ready: true, players: "1–2 jugadores" },
  "ventanas-de-catedral": {
    ready: true,
    players: "2–4 jugadores",
    subtitle: "Edición original de Games; reglas de esta variante en la ayuda.",
  },
  "bloques-geometricos": {
    ready: true,
    players: "2–4 jugadores",
    subtitle: "Edición original de Games; reglas de esta variante en la ayuda.",
  },
  quoridor: { ready: true, players: "1–2 jugadores" },
  onitama: { ready: true, players: "1–2 jugadores" },
  yinsh: { ready: true, players: "1–2 jugadores" },
  dvonn: { ready: true, players: "1–2 jugadores" },
};

export const traditionalIds = [
  "molino-nine-men-s-morris",
  "senet",
  "tafl-hnefatafl",
  "juego-de-la-oca",
  "ur-juego-real-de-ur",
  "pachisi",
  "fanorona",
  "surakarta",
  "bagh-chal-movimiento-de-tigres",
  "mu-torere",
  "halma",
  "yut-nori",
  "nyout",
  "shax",
  "tsoro-yematatu",
  "awale",
  "sugoroku",
];
categoryCompletionMetadata["molino-nine-men-s-morris"] = {
  ready: true,
  players: "2 jugadores",
};
categoryCompletionMetadata["senet"] = {
  ready: true,
  players: "2 jugadores",
  subtitle:
    "Reconstrucción educativa de Games; cinco fichas y dado de seis caras.",
};
categoryCompletionMetadata["tafl-hnefatafl"] = {
  ready: true,
  players: "2 jugadores",
  subtitle: "Hnefatafl de 11 × 11, edición Fetlar.",
};
categoryCompletionMetadata["juego-de-la-oca"] = {
  ready: true,
  players: "2–6 jugadores",
};
categoryCompletionMetadata["ur-juego-real-de-ur"] = {
  ready: true,
  players: "2 jugadores",
};
categoryCompletionMetadata["pachisi"] = {
  ready: true,
  players: "4 jugadores · 2 equipos",
  subtitle: "Edición por equipos con seis cauris y un circuito por ficha.",
};
categoryCompletionMetadata["fanorona"] = {
  ready: true,
  players: "2 jugadores",
};
categoryCompletionMetadata["surakarta"] = {
  ready: true,
  players: "2 jugadores",
};
categoryCompletionMetadata["bagh-chal-movimiento-de-tigres"] = {
  ready: true,
  players: "2 jugadores",
};
categoryCompletionMetadata["mu-torere"] = {
  ready: true,
  players: "2 jugadores",
  subtitle:
    "Variante documentada First Move: la apertura debe permitir respuesta.",
};
categoryCompletionMetadata["halma"] = { ready: true, players: "2–4 jugadores" };
categoryCompletionMetadata["yut-nori"] = {
  ready: true,
  players: "2 jugadores",
};
categoryCompletionMetadata["nyout"] = { ready: true, players: "2 jugadores" };
categoryCompletionMetadata["shax"] = { ready: true, players: "2 jugadores" };
categoryCompletionMetadata["tsoro-yematatu"] = {
  ready: true,
  players: "2 jugadores",
};
categoryCompletionMetadata["awale"] = { ready: true, players: "2 jugadores" };
categoryCompletionMetadata["sugoroku"] = {
  ready: true,
  players: "2–4 jugadores",
  subtitle: "E-sugoroku: recorrido ilustrado original de Games.",
};
