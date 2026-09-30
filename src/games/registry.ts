export type GameId = 'chess' | 'connect-four' | 'go' | 'ludo' | 'solitaire' | 'minesweeper';
export interface GameInfo { id: GameId; name: string; subtitle: string; category: string; players: string; duration: string; ready: boolean; color: string; }
export const games: GameInfo[] = [
  {id:'chess',name:'Ajedrez',subtitle:'Cada movimiento cuenta.',category:'Estrategia',players:'1–2 jugadores',duration:'A tu ritmo',ready:true,color:'sage'},
  {id:'connect-four',name:'Conecta 4',subtitle:'Una línea. Mil posibilidades.',category:'Clásicos',players:'1–2 jugadores',duration:'5–10 min',ready:true,color:'blue'},
  {id:'go',name:'Go',subtitle:'El arte de conquistar espacio.',category:'Estrategia',players:'1–2 jugadores',duration:'30–60 min',ready:false,color:'sand'},
  {id:'ludo',name:'Parchís',subtitle:'El clásico que nos reúne.',category:'Familia',players:'2–4 jugadores',duration:'20–40 min',ready:false,color:'rose'},
  {id:'solitaire',name:'Solitario',subtitle:'Un pequeño momento para ti.',category:'Cartas',players:'1 jugador',duration:'10–15 min',ready:false,color:'mint'},
  {id:'minesweeper',name:'Buscaminas',subtitle:'La lógica es tu mejor pista.',category:'Lógica',players:'1 jugador',duration:'5–15 min',ready:false,color:'lavender'},
];
