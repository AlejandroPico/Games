import { useId, type ReactNode } from "react";
const ink = "#36595d",
  gold = "#b4965f",
  red = "#b56a61",
  sage = "#6a9385",
  paper = "#f1e7d1";
type CardData = [number, number, string, string];
const cardScenes: Record<string, CardData[]> = {
  "poker-texas-hold-em": [
    [65, 87, "10", "♠"],
    [119, 87, "J", "♠"],
    [173, 87, "Q", "♠"],
    [227, 87, "K", "♠"],
    [281, 87, "A", "♠"],
    [148, 187, "A", "♥"],
    [205, 187, "K", "♦"],
  ],
  chinchon: Array.from({ length: 7 }, (_, i) => [
    61 + i * 40,
    85 + (i % 2) * 9,
    String(i + 3),
    "♦",
  ]),
  tute: [
    [77, 109, "A", "♣"],
    [143, 109, "3", "♣"],
    [209, 109, "K", "♣"],
    [275, 109, "Q", "♣"],
  ],
  "truco-argentino-uruguayo": [
    [114, 77, "1", "♠"],
    [174, 77, "7", "♦"],
    [234, 77, "3", "♣"],
  ],
  "rummy-continental": [
    [85, 55, "4", "♥"],
    [141, 55, "5", "♥"],
    [197, 55, "6", "♥"],
    [253, 55, "7", "♥"],
    [112, 161, "K", "♠"],
    [174, 161, "K", "♦"],
    [236, 161, "K", "♣"],
  ],
  bridge: [
    [175, 32, "N", "♠"],
    [89, 118, "W", "♥"],
    [257, 118, "E", "♦"],
    [175, 206, "S", "♣"],
  ],
  cribbage: [
    [111, 57, "5", "♠"],
    [176, 57, "J", "♥"],
    [241, 57, "5", "♦"],
  ],
  "hearts-corazones": [
    [75, 151, "Q", "♠"],
    [260, 62, "A", "♥"],
    [311, 149, "7", "♥"],
  ],
  "spades-picas": [
    [78, 65, "K", "♠"],
    [260, 147, "J", "♠"],
  ],
  durak: [
    [89, 71, "6", "♠"],
    [100, 105, "8", "♠"],
    [163, 71, "6", "♥"],
    [174, 105, "A", "♦"],
    [237, 71, "6", "♣"],
    [248, 105, "8", "♣"],
    [182, 214, "K", "♦"],
  ],
  euchre: [
    [90, 127, "J", "♥"],
    [149, 103, "J", "♦"],
    [210, 127, "A", "♥"],
  ],
  canasta: Array.from({ length: 7 }, (_, i) => [
    65 + i * 39,
    79 + (i % 2) * 22,
    "7",
    i % 2 ? "♥" : "♠",
  ]),
  "gin-rummy": [
    [69, 57, "5", "♥"],
    [123, 57, "6", "♥"],
    [177, 57, "7", "♥"],
    [173, 156, "9", "♣"],
    [227, 156, "9", "♦"],
    [281, 156, "9", "♠"],
  ],
  "mau-mau": [
    [97, 106, "7", "♦"],
    [176, 106, "J", "♣"],
    [255, 106, "8", "♠"],
  ],
  "briscola-chiamata": [
    [58, 103, "A", "♣"],
    [118, 103, "3", "♣"],
    [178, 103, "K", "♣"],
    [238, 103, "Q", "♣"],
    [298, 103, "J", "♣"],
  ],
  "tarot-frances": [
    [83, 61, "0", "✧"],
    [143, 84, "I", "✧"],
    [203, 61, "X", "✧"],
    [263, 84, "XXI", "✧"],
  ],
};
function Card({ data, tall = false }: { data: CardData; tall?: boolean }) {
  const [x, y, rank, suit] = data,
    color = suit === "♥" || suit === "♦" ? red : ink,
    h = tall ? 140 : 72;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="3" y="4" width="47" height={h} fill={ink} opacity=".12" />
      <rect width="47" height={h} fill="#faf4e6" stroke={gold} />
      <text x="6" y="16" fontSize="12" fill={color}>
        {rank}
      </text>
      <text x="24" y={h * 0.68} textAnchor="middle" fontSize="25" fill={color}>
        {suit}
      </text>
    </g>
  );
}
function House({
  x,
  y,
  h = 64,
  color = sage,
}: {
  x: number;
  y: number;
  h?: number;
  color?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width="55" height={h} fill={paper} stroke={gold} />
      <path d={`M${x - 6} ${y}l34-28 34 28Z`} fill={color} />
      <rect x={x + 21} y={y + h - 25} width="14" height="25" fill={ink} />
      <path
        d={`M${x + 9} ${y + 12}h10v10h-10Z M${x + 36} ${y + 12}h10v10h-10Z`}
        fill={gold}
      />
    </g>
  );
}
function Gem({ x, y, color = sage }: { x: number; y: number; color?: string }) {
  return (
    <g>
      <path
        d={`M${x} ${y - 25}l28 16v22l-28 22-28-22v-22Z`}
        fill={color}
        stroke={ink}
      />
      <path
        d={`M${x - 28} ${y - 9}h56l-28 44Z M${x} ${y - 25}l-12 16 12 44 12-44Z`}
        fill={paper}
        opacity=".3"
      />
    </g>
  );
}
function Chips({ x, y, n = 3 }: { x: number; y: number; n?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <ellipse cx={x} cy={y - i * 5 + 3} rx="19" ry="8" fill={ink} />
          <ellipse
            cx={x}
            cy={y - i * 5}
            rx="19"
            ry="8"
            fill={i % 2 ? sage : red}
          />
          <ellipse
            cx={x}
            cy={y - i * 5}
            rx="12"
            ry="4"
            fill="none"
            stroke={paper}
          />
        </g>
      ))}
    </g>
  );
}
function Leaves({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={ink} strokeWidth="2">
      <path d={`M${x} ${y + 55}v-65`} fill="none" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <path d={`M${x} ${y + i * 15}q-38-34-37-7q6 16 37 7Z`} fill={sage} />
          <path
            d={`M${x} ${y + i * 15 - 8}q38-34 37-7q-6 16-37 7Z`}
            fill={sage}
          />
        </g>
      ))}
    </g>
  );
}
function Mask({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 45} ${y - 25}q45-25 90 0v40q-45 32-90 0Z`} fill={ink} />
      <path
        d={`M${x - 30} ${y - 5}q10-16 22 0q-10 12-22 0 M${x + 8} ${y - 5}q10-16 22 0q-10 12-22 0`}
        fill={paper}
      />
    </g>
  );
}
function Ship({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x} ${y - 40}l42 72-42-13-42 13Z`} fill={sage} stroke={ink} />
      <path d={`M${x} ${y - 20}l10 39h-20Z`} fill={paper} />
      <path d={`M${x - 12} ${y + 35}l12 26 12-26`} fill={gold} />
    </g>
  );
}
function Grid({
  cols = 6,
  rows = 5,
  cell = 32,
  x = 104,
  y = 55,
  render,
}: {
  cols?: number;
  rows?: number;
  cell?: number;
  x?: number;
  y?: number;
  render: (i: number) => ReactNode;
}) {
  return (
    <g>
      {Array.from({ length: cols * rows }, (_, i) => (
        <g
          key={i}
          transform={`translate(${x + (i % cols) * cell} ${y + Math.floor(i / cols) * cell})`}
        >
          <rect width={cell} height={cell} fill={paper} stroke={gold} />
          {render(i)}
        </g>
      ))}
    </g>
  );
}
function Scene({ id }: { id: string }): ReactNode {
  if (cardScenes[id])
    return (
      <g>
        {id === "poker-texas-hold-em" && (
          <g>
            <ellipse cx="200" cy="156" rx="153" ry="91" fill={sage} />
            <Chips x={320} y={225} n={5} />
          </g>
        )}
        {id === "cribbage" && (
          <g>
            <rect
              x="71"
              y="149"
              width="257"
              height="69"
              fill={gold}
              stroke={ink}
            />
            {Array.from({ length: 26 }, (_, i) => (
              <g key={i}>
                <circle cx={86 + i * 9} cy="167" r="2.5" fill={ink} />
                <circle cx={86 + i * 9} cy="195" r="2.5" fill={ink} />
              </g>
            ))}
            <path d="M159 167v-16 M223 196v-15" stroke={red} strokeWidth="5" />
          </g>
        )}
        {id === "hearts-corazones" && (
          <path
            d="M201 228C67 149 106 55 163 96q37-47 73 0c72-42 102 61-35 132Z"
            fill={red}
          />
        )}
        {id === "spades-picas" && (
          <path
            d="M202 49C108 127 92 189 149 193q26 0 44-24l-13 68h45l-13-68q20 25 43 24c61-11 30-74-53-144Z"
            fill={ink}
          />
        )}
        {id === "bridge" && (
          <g>
            <rect x="158" y="131" width="70" height="41" fill={gold} />
            <text
              x="193"
              y="157"
              textAnchor="middle"
              fill={paper}
              fontSize="20"
            >
              3NT
            </text>
          </g>
        )}
        {id === "truco-argentino-uruguayo" && (
          <g>
            <path d="M98 190h205 M98 230h205" stroke={gold} strokeWidth="3" />
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${111 + i * 38} 184v18 M${111 + i * 38} 219v19`}
                stroke={ink}
                strokeWidth="4"
              />
            ))}
          </g>
        )}
        {id === "mau-mau" && (
          <path
            d="M92 78q89-54 183 0l-4-21 M309 215q-95 52-189-2l6 21"
            fill="none"
            stroke={sage}
            strokeWidth="7"
          />
        )}
        {id === "euchre" && (
          <path
            d="M283 75v142 M283 75h-64v35h64"
            fill={red}
            stroke={ink}
            strokeWidth="3"
          />
        )}
        {id === "tute" && (
          <path d="M147 57l10 20 13-25 13 25 12-20v33h-48Z" fill={gold} />
        )}
        {id === "chinchon" && (
          <path d="M69 187h263 M105 207h191" stroke={sage} strokeWidth="5" />
        )}
        {id === "canasta" && (
          <g>
            <rect x="83" y="214" width="242" height="18" fill={sage} />
            <path d="M118 246h170" stroke={gold} strokeWidth="4" />
          </g>
        )}
        {id === "gin-rummy" && (
          <g>
            <rect
              x="85"
              y="170"
              width="47"
              height="72"
              fill={sage}
              stroke={gold}
            />
            <path d="M108 188l13 18-13 18-13-18Z" fill={paper} />
          </g>
        )}
        {id === "briscola-chiamata" && (
          <path
            d="M105 216h188 M194 62v24 M181 74h26"
            stroke={gold}
            strokeWidth="5"
          />
        )}
        {cardScenes[id].map((data, i) => (
          <Card key={i} data={data} tall={id === "tarot-frances"} />
        ))}
      </g>
    );
  switch (id) {
    case "tierras-de-losetas":
      return (
        <g>
          {[
            [100, 60],
            [170, 60],
            [240, 60],
            [100, 130],
            [170, 130],
            [240, 130],
          ].map(([x, y], i) => (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width="65"
                height="65"
                fill={i % 2 ? sage : paper}
                stroke={gold}
              />
              <path
                d={`M${x + 32} ${y}v22h33 M${x} ${y + 32}h32v33`}
                fill="none"
                stroke={i % 2 ? paper : ink}
                strokeWidth="6"
              />
              {i === 4 && <House x={x + 12} y={y + 25} h={24} />}
            </g>
          ))}
        </g>
      );
    case "el-mercado-de-joyas":
      return (
        <g>
          <rect x="80" y="72" width="238" height="126" fill={ink} />
          <Gem x={126} y={121} />
          <Gem x={199} y={111} color={red} />
          <Gem x={268} y={131} color={gold} />
          <Chips x={113} y={225} />
          <Chips x={197} y={225} n={5} />
          <Chips x={281} y={225} n={2} />
        </g>
      );
    case "la-villa-agricola":
      return (
        <g>
          <House x={111} y={120} h={73} />
          <House x={212} y={100} h={93} color={red} />
          <path d="M68 235h264 M70 248h264" stroke={gold} strokeWidth="5" />
          <Leaves x={77} y={181} />
          <Leaves x={312} y={181} />
        </g>
      );
    case "isla-de-monstruos":
      return (
        <g>
          <ellipse cx="200" cy="219" rx="122" ry="34" fill={sage} />
          <path
            d="M103 219l10-75 18-16 19 16 12 75 M245 219v-80h28v80 M273 166h30v53"
            fill={paper}
            stroke={ink}
          />
          <path
            d="M177 218l-13-81 12-21 8-41 18 29 23-7 12 28-7 41 20 52Z"
            fill={ink}
          />
          <circle cx="206" cy="118" r="4" fill={gold} />
          <path
            d="M178 169l-30-10 M228 163l23-26"
            stroke={ink}
            strokeWidth="15"
          />
        </g>
      );
    case "el-gran-bazar":
      return (
        <g>
          <path d="M78 112l20-42h204l20 42Z" fill={red} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M${99 + i * 41} 70l-10 42h22l8-42Z`}
              fill={paper}
            />
          ))}
          <path d="M95 112v104h210V112" fill={paper} stroke={gold} />
          <Gem x={134} y={174} />
          <Chips x={207} y={202} />
          <path d="M258 137q-18 0-18 26v39h39v-39q0-26-21-26Z" fill={sage} />
        </g>
      );
    case "diseno-de-mosaicos":
      return (
        <Grid
          cols={5}
          rows={5}
          cell={38}
          x={105}
          y={55}
          render={(i) => (
            <path
              d={
                i % 3 === 0
                  ? "M0 0h38L0 38Z"
                  : i % 3 === 1
                    ? "M0 19q19-38 38 0q-19 38-38 0Z"
                    : "M19 0l19 19-19 19L0 19Z"
              }
              fill={i % 2 ? sage : red}
            />
          )}
        />
      );
    case "observatorio-de-aves":
      return (
        <g>
          <path
            d="M82 214h241 M100 214l32-84 M250 214l-23-89"
            stroke={ink}
            strokeWidth="5"
          />
          <path
            d="M123 145q12-59 63-46l15 29q-40 55-78 17 M225 155q-14-56 38-43l23 25q-27 47-61 18"
            fill={sage}
          />
          <path d="M200 118l20 8-19 7 M283 127l20 7-19 7" fill={gold} />
          <circle cx="178" cy="112" r="4" fill={ink} />
          <circle cx="264" cy="127" r="4" fill={ink} />
          <path
            d="M137 148l34-18 M238 153l26-15"
            stroke={paper}
            strokeWidth="4"
          />
        </g>
      );
    case "terraformacion-planetaria":
      return (
        <g>
          <circle cx="200" cy="145" r="96" fill={red} />
          <path
            d="M140 84q40-25 72-9l-2 43 34 10-15 44-49 7-26 53-45-41 13-30-19-27Z"
            fill={sage}
          />
          <path
            d="M177 245v-42h45v42 M259 200v-67h20v67"
            fill={paper}
            stroke={ink}
          />
          <path
            d="M75 231q115 69 242-37"
            fill="none"
            stroke={gold}
            strokeWidth="4"
          />
          <circle cx="293" cy="48" r="14" fill={gold} />
        </g>
      );
    case "lineas-de-produccion":
      return (
        <g>
          <path d="M76 208v-79l55 28v-28l55 28v51Z" fill={ink} />
          <path d="M82 130V78h19v65 M145 130V65h19v79" fill={red} />
          <path d="M185 206h144v26H185Z" fill={gold} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect
                x={200 + i * 39}
                y="181"
                width="30"
                height="26"
                fill={sage}
              />
              <circle cx={206 + i * 45} cy="237" r="7" fill={ink} />
            </g>
          ))}
          <path
            d="M105 54q-24-16-10-34 M160 43q-20-17-6-33"
            fill="none"
            stroke={sage}
            strokeWidth="7"
          />
        </g>
      );
    case "expedicion-arqueologica":
      return (
        <g>
          <path d="M75 228l85-163 83 163Z" fill={gold} />
          <path d="M176 228l55-108 95 108Z" fill={red} />
          <path d="M93 248h233" stroke={ink} strokeWidth="3" />
          <path d="M262 63l-88 161" stroke={ink} strokeWidth="7" />
          <path
            d="M254 59l13 7 10-24-11-7Z M171 221l-24 26 32-16Z"
            fill={sage}
          />
        </g>
      );
    case "el-laberinto-magico":
      return (
        <g>
          <Grid
            cols={6}
            rows={6}
            cell={32}
            x={104}
            y={48}
            render={(i) => (
              <path
                d={
                  i % 5 === 0
                    ? "M0 0h32v32"
                    : i % 3 === 0
                      ? "M0 32V0"
                      : "M0 32h32"
                }
                fill="none"
                stroke={ink}
                strokeWidth="5"
              />
            )}
          />
          <path
            d="M195 114l8 19 22 3-17 14 4 21-19-10-19 10 4-21-17-14 22-3Z"
            fill={gold}
          />
          <circle cx="120" cy="226" r="9" fill={red} />
        </g>
      );
    case "subasta-de-propiedades":
      return (
        <g>
          <House x={82} y={135} h={78} />
          <House x={162} y={112} h={101} color={red} />
          <House x={247} y={87} h={126} />
          <path
            d="M110 246h100 M250 201l50-66 M283 125l34 23-11 16-35-23Z"
            fill={gold}
            stroke={ink}
            strokeWidth="3"
          />
          <Chips x={174} y={239} />
        </g>
      );
    case "el-fabricante-de-alfombras":
      return (
        <g>
          <path
            d="M100 57h200v179H100Z"
            fill={red}
            stroke={gold}
            strokeWidth="9"
          />
          <path
            d="M135 90h130v113H135Z M163 120h74v53h-74Z"
            fill="none"
            stroke={paper}
            strokeWidth="8"
          />
          <path d="M200 103l45 44-45 43-45-43Z" fill={sage} />
          {Array.from({ length: 12 }, (_, i) => (
            <path
              key={i}
              d={`M${105 + i * 17} 244v15 M${105 + i * 17} 49V32`}
              stroke={gold}
              strokeWidth="3"
            />
          ))}
        </g>
      );
    case "viaje-en-el-tiempo":
      return (
        <g>
          <circle
            cx="154"
            cy="138"
            r="81"
            fill={paper}
            stroke={gold}
            strokeWidth="7"
          />
          <path d="M154 76v62l35 28" fill="none" stroke={ink} strokeWidth="6" />
          <path d="M235 58h74v175h-74Z" fill={sage} stroke={ink} />
          <path d="M244 87h55v93h-55Z" fill={ink} />
          <circle cx="290" cy="205" r="5" fill={gold} />
          <path
            d="M95 235q95 37 205 0 M115 251q78 23 157 0"
            fill="none"
            stroke={red}
            strokeWidth="4"
          />
        </g>
      );
    case "invasion-de-clanes":
      return (
        <g>
          <path d="M82 90h95v124l-48 32-47-32Z" fill={sage} stroke={ink} />
          <path d="M222 90h95v124l-48 32-47-32Z" fill={red} stroke={ink} />
          <path
            d="M129 116l23 37-23 38-23-38Z M269 122l-23 25 46 39"
            fill={paper}
          />
          <path
            d="M190 44l12 182 M182 83h37 M180 227h35"
            stroke={gold}
            strokeWidth="6"
          />
        </g>
      );
    case "descarte-explosivo":
      return (
        <g>
          <Card data={[98, 104, "!", "✧"]} />
          <path
            d="M204 70l10 40 39-22-17 41 51 8-46 21 25 36-47-7-8 45-19-40-34 27 12-44-43-14 44-11-21-39 41 15Z"
            fill={gold}
          />
          <circle cx="204" cy="146" r="28" fill={ink} />
          <path
            d="M215 124l18-31q18-12 13-32"
            fill="none"
            stroke={red}
            strokeWidth="5"
          />
        </g>
      );
    case "mineros-saboteadores":
      return (
        <g>
          <path d="M71 235V133q128-156 258 0v102" fill={gold} />
          <path d="M102 229v-85q99-120 198 0v85Z" fill={ink} />
          <path
            d="M163 238v-67 M204 238v-93 M244 238v-67 M152 183h100"
            stroke={paper}
            strokeWidth="5"
          />
          <Gem x={202} y={118} />
          <path
            d="M72 71l60 67 M66 90q30-58 80-36"
            stroke={red}
            strokeWidth="7"
            fill="none"
          />
        </g>
      );
    case "lobo-aldea":
      return (
        <g>
          <circle cx="259" cy="72" r="29" fill={gold} />
          <House x={88} y={186} h={48} />
          <House x={249} y={186} h={48} />
          <path
            d="M155 193l-9-80 17-60 29 34 28-1 28-31 8 77-24 60-31 17Z"
            fill={ink}
          />
          <path d="M170 132l16-6 M213 126l17 6" stroke={gold} strokeWidth="4" />
          <path
            d="M193 172l9 8 8-8"
            stroke={paper}
            strokeWidth="4"
            fill="none"
          />
        </g>
      );
    case "la-resistencia-avalon":
      return (
        <g>
          <path
            d="M97 61h208v122q-39 64-104 78-69-23-104-78Z"
            fill={sage}
            stroke={ink}
          />
          <path
            d="M201 87v126 M167 127h68 M182 220h39"
            stroke={paper}
            strokeWidth="8"
          />
          <Mask x={201} y={179} />
          <path
            d="M71 128l22-9 M71 160l22-1 M307 119l22 9"
            stroke={gold}
            strokeWidth="4"
          />
        </g>
      );
    case "guerra-de-cartas-de-energia":
      return (
        <g>
          <Card data={[81, 124, "5", "✧"]} />
          <Card data={[274, 72, "8", "✧"]} />
          <path
            d="M203 52l-52 109h40l-17 89 78-121h-42l20-77Z"
            fill={gold}
            stroke={ink}
          />
          <path d="M97 73l25 26 M283 217l-25-26" stroke={red} strokeWidth="6" />
        </g>
      );
    case "combates-del-espacio":
      return (
        <g>
          <Ship x={126} y={127} />
          <Ship x={281} y={170} />
          <path
            d="M140 184l19 43 M264 115l-19-43 M146 191l19 43"
            stroke={red}
            strokeWidth="4"
          />
          {[
            [64, 66],
            [209, 80],
            [320, 63],
            [208, 241],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" fill={gold} />
          ))}
        </g>
      );
    case "dominio-de-reino":
      return (
        <g>
          <path
            d="M82 222v-87h38v-39h34v126 M247 222V78h38v69h34v75 M148 145h98v77h-98Z"
            fill={paper}
            stroke={ink}
            strokeWidth="3"
          />
          <path d="M196 178v44" stroke={ink} strokeWidth="22" />
          <path d="M266 77V41h42v22h-42" fill={red} stroke={ink} />
          <Chips x={98} y={250} n={4} />
        </g>
      );
    case "cartas-suicidas":
      return (
        <g>
          <Card data={[87, 59, "−5", "♠"]} />
          <Card data={[155, 104, "−20", "♥"]} />
          <Card data={[225, 149, "−50", "♣"]} />
          <path
            d="M105 236q54-44 152 0 M89 246h191"
            fill="none"
            stroke={ink}
            strokeWidth="5"
          />
          <path d="M307 77v77 M293 110h28" stroke={red} strokeWidth="7" />
        </g>
      );
    case "el-estafador-de-cartas":
      return (
        <g>
          <Card data={[94, 153, "A", "♦"]} />
          <Card data={[250, 153, "K", "♠"]} />
          <Mask x={200} y={100} />
          <path
            d="M153 215q46-53 93 0l-19-2 M247 241q-46 34-93 0l19 1"
            fill="none"
            stroke={gold}
            strokeWidth="5"
          />
        </g>
      );
    case "duelo-de-cartas-en-la-corte":
      return (
        <g>
          <Card data={[99, 101, "Q", "♥"]} />
          <Card data={[246, 101, "K", "♠"]} />
          <path d="M173 55l14 17 13-25 12 25 15-17v35h-54Z" fill={gold} />
          <path
            d="M171 240l58-45 M229 240l-58-45"
            stroke={ink}
            strokeWidth="5"
          />
          <path d="M171 231l9 12 M220 242l9-12" stroke={red} strokeWidth="5" />
        </g>
      );
    case "comercio-de-alubias":
      return (
        <g>
          <path d="M76 226h248v18H76Z" fill={gold} />
          {[
            [123, 135],
            [206, 114],
            [286, 150],
          ].map(([x, y], i) => (
            <g key={i}>
              <path
                d={`M${x} ${y - 34}q-41-24-43 31q-2 48 26 39q-8-31 18-39q23-12-1-31Z`}
                fill={i === 1 ? red : sage}
                stroke={ink}
              />
              <path d={`M${x - 9} ${y + 24}v53`} stroke={ink} strokeWidth="3" />
            </g>
          ))}
        </g>
      );
    case "el-ladron-de-guante-blanco":
      return (
        <g>
          <Gem x={135} y={141} color={red} />
          <path
            d="M235 241l-28-72-4-72q3-20 14-5l8 43V67q8-16 17 0l3 53 7-71q10-13 16 4l-2 78 13-64q11-9 15 8l-13 74 14-34q15-9 16 6l-16 61-20 59Z"
            fill={paper}
            stroke={ink}
            strokeWidth="2"
          />
          <path d="M232 222h55" stroke={gold} strokeWidth="5" />
        </g>
      );
    case "cartas-del-purgatorio":
      return (
        <g>
          <path d="M92 242V125q10-87 106-87q95 0 108 87v117" fill={ink} />
          <path d="M120 242V130q9-64 78-64q70 0 81 64v112" fill={red} />
          <Card data={[144, 134, "X", "✧"]} />
          <Card data={[212, 103, "V", "♠"]} />
          <path d="M107 258h185" stroke={gold} strokeWidth="5" />
        </g>
      );
    case "senores-de-la-guerra":
      return (
        <g>
          <path
            d="M93 203V65h73v146 M237 208V65h73v143"
            stroke={ink}
            strokeWidth="3"
            fill={sage}
          />
          <path d="M237 65h73v143l-37 25-36-25Z" fill={red} />
          <path
            d="M116 91l7 13 8-20 9 20 7-13v28h-31 M258 92h30l-15 29Z"
            fill={paper}
          />
          <path
            d="M201 114v134 M180 162h41 M185 249h30"
            stroke={gold}
            strokeWidth="6"
          />
        </g>
      );
    case "nonogramas-picross":
      return (
        <g>
          <Grid
            cols={6}
            rows={5}
            cell={32}
            x={110}
            y={77}
            render={(i) =>
              [
                2, 3, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 20, 21, 26, 27,
              ].includes(i) ? (
                <rect x="3" y="3" width="26" height="26" fill={sage} />
              ) : null
            }
          />
          {[2, 4, 6, 2, 2].map((n, i) => (
            <text
              key={i}
              x="94"
              y={99 + i * 32}
              textAnchor="middle"
              fontSize="16"
              fill={ink}
            >
              {n}
            </text>
          ))}
          <text x="165" y="61" fontSize="16" fill={ink}>
            4 5 5 4
          </text>
        </g>
      );
    case "crucigramas-interactivos":
      return (
        <Grid
          cols={7}
          rows={6}
          cell={29}
          x={99}
          y={58}
          render={(i) =>
            [0, 1, 5, 6, 7, 13, 19, 21, 26, 28, 34, 35, 36, 40, 41].includes(
              i,
            ) ? (
              <rect width="29" height="29" fill={ink} />
            ) : (
              <text x="14" y="21" textAnchor="middle" fontSize="16" fill={sage}>
                {["J", "U", "E", "G", "O", "S"][i % 6]}
              </text>
            )
          }
        />
      );
    case "bloques-deslizantes":
      return (
        <g>
          <rect x="109" y="43" width="184" height="204" fill={ink} />
          <rect x="120" y="54" width="82" height="92" fill={red} />
          <rect x="208" y="54" width="73" height="42" fill={gold} />
          <rect x="208" y="103" width="73" height="92" fill={sage} />
          <rect x="120" y="153" width="36" height="82" fill={gold} />
          <rect x="163" y="153" width="39" height="39" fill={paper} />
          <rect x="163" y="200" width="39" height="35" fill={sage} />
          <path
            d="M216 216h42l-11-9 M258 216l-11 9"
            stroke={paper}
            strokeWidth="4"
            fill="none"
          />
        </g>
      );
    case "puzle-de-tuberias":
      return (
        <Grid
          cols={6}
          rows={5}
          cell={35}
          x={95}
          y={55}
          render={(i) => (
            <path
              d={
                i % 4 === 0
                  ? "M0 17h35"
                  : i % 4 === 1
                    ? "M17 0v17h18"
                    : i % 4 === 2
                      ? "M17 35V17H0"
                      : "M17 0v35 M17 17h18"
              }
              fill="none"
              stroke={i % 3 === 0 ? red : sage}
              strokeWidth="9"
            />
          )}
        />
      );
    case "cruces-numericos-kakuro":
      return (
        <Grid
          cols={6}
          rows={6}
          cell={32}
          x={104}
          y={50}
          render={(i) =>
            i % 6 === 0 || i < 6 || [15, 22, 29].includes(i) ? (
              <g>
                <rect width="32" height="32" fill={ink} />
                <path d="M0 0l32 32" stroke={paper} />
                <text x="22" y="12" fontSize="9" fill={paper}>
                  {(i % 7) + 7}
                </text>
                <text x="8" y="26" fontSize="9" fill={paper}>
                  {(i % 9) + 9}
                </text>
              </g>
            ) : (
              <text x="16" y="23" textAnchor="middle" fontSize="20" fill={sage}>
                {(i % 9) + 1}
              </text>
            )
          }
        />
      );
    case "rutas-de-luces-lights-out":
      return (
        <Grid
          cols={5}
          rows={5}
          cell={39}
          x={102}
          y={52}
          render={(i) => (
            <g>
              <rect x="2" y="2" width="35" height="35" fill={ink} />
              {[2, 6, 7, 8, 10, 11, 12, 13, 14, 16, 17, 18, 22].includes(i) && (
                <g>
                  <circle cx="19" cy="19" r="12" fill={gold} />
                  <circle cx="19" cy="19" r="5" fill={paper} />
                </g>
              )}
            </g>
          )}
        />
      );
    case "puentes-fluviales-hashiwokakero":
      return (
        <g>
          <path
            d="M91 87h217 M91 92h217 M91 90v132 M97 90v132 M91 221h217 M91 227h217 M308 90v133 M313 90v133 M200 90v133 M205 90v133 M93 154h218"
            fill="none"
            stroke={sage}
            strokeWidth="3"
          />
          {[
            [93, 89, 3],
            [202, 89, 5],
            [311, 89, 4],
            [93, 224, 4],
            [202, 224, 5],
            [311, 224, 3],
            [202, 154, 4],
          ].map(([x, y, n], i) => (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="18"
                fill={paper}
                stroke={ink}
                strokeWidth="2"
              />
              <text
                x={x}
                y={y + 6}
                textAnchor="middle"
                fontSize="20"
                fill={ink}
              >
                {n}
              </text>
            </g>
          ))}
        </g>
      );
    case "laberintos-generativos":
      return (
        <g>
          <rect
            x="82"
            y="42"
            width="236"
            height="210"
            fill={paper}
            stroke={gold}
          />
          <path
            d="M82 70h170v55h-85v56h85v71 M111 43v108h28v58H82 M281 42v168h37 M167 42v56h56 M281 181h-85v71 M139 209h-28v43"
            stroke={ink}
            strokeWidth="7"
            fill="none"
          />
          <path
            d="M95 55h31v70h28v98h26v17h124"
            stroke={red}
            strokeWidth="3"
            fill="none"
            strokeDasharray="5 4"
          />
        </g>
      );
    default:
      return null;
  }
}
export default function IdeaArt({ id }: { id: string; category: string }) {
  const uid = useId().replaceAll(":", "") + "idea";
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true">
      <defs>
        <filter id={uid} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="2" dy="6" stdDeviation="4" floodOpacity=".14" />
        </filter>
      </defs>
      <ellipse cx="200" cy="256" rx="119" ry="12" fill={ink} opacity=".09" />
      <g filter={`url(#${uid})`}>
        <Scene id={id} />
      </g>
    </svg>
  );
}
