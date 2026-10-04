import { useId, type ReactNode } from "react";
import {
  categoryCompletionIds,
  traditionalIds,
} from "../games/categoryCompletion";
export const identityIds = [
  ...categoryCompletionIds,
  ...traditionalIds,
  "draft-de-maravillas",
  "construccion-de-castillos",
  "santorini",
  "escoba",
  "cinquillo",
  "belote",
  "solitaire",
  "solitario-spider",
  "solitario-carta-blanca-freecell",
  "blackjack-21",
  "mus",
  "brisca",
];
const ink = "#38575b",
  cream = "#f4e8d0",
  red = "#b9685b",
  gold = "#b99859",
  sage = "#5c9082";
const Pips = ({
  x,
  y,
  n = 3,
  color = ink,
}: {
  x: number;
  y: number;
  n?: number;
  color?: string;
}) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <circle
        key={i}
        cx={x + (n === 1 ? 0 : i % 2 ? 10 : -10)}
        cy={y + (Math.floor(i / 2) - (n > 4 ? 1 : n > 2 ? 0.5 : 0)) * 16}
        r="4"
        fill={color}
      />
    ))}
  </>
);
const Die = ({
  x,
  y,
  n = 3,
  color = cream,
  symbol,
}: {
  x: number;
  y: number;
  n?: number;
  color?: string;
  symbol?: string;
}) => (
  <g>
    <path d={`M${x - 24} ${y - 24}l12-9h48l-12 9Z`} fill="#fffae9" />
    <path d={`M${x + 24} ${y - 24}l12-9v48l-12 9Z`} fill={gold} />
    <rect
      x={x - 24}
      y={y - 24}
      width="48"
      height="48"
      fill={color}
      stroke="#8f7957"
    />
    {symbol ? (
      <text x={x} y={y + 9} textAnchor="middle" fontSize="26" fill={ink}>
        {symbol}
      </text>
    ) : (
      <Pips x={x} y={y} n={n} />
    )}
  </g>
);
const Stone = ({
  x,
  y,
  p = 0,
  r = 12,
}: {
  x: number;
  y: number;
  p?: number;
  r?: number;
}) => (
  <g>
    <ellipse cx={x + 2} cy={y + 5} rx={r} ry={r * 0.7} fill="#213c402b" />
    <circle
      cx={x}
      cy={y}
      r={r}
      fill={p ? cream : ink}
      stroke={p ? gold : "#1b3d40"}
    />
    <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.28} fill="#ffffff50" />
  </g>
);
const Card = ({
  x,
  y,
  v = "A",
  s = "♥",
  w = 58,
  h = 91,
}: {
  x: number;
  y: number;
  v?: string;
  s?: string;
  w?: number;
  h?: number;
}) => (
  <g>
    <rect x={x + 3} y={y + 5} width={w} height={h} fill="#213c4020" />
    <rect x={x} y={y} width={w} height={h} fill={cream} stroke="#c2ac86" />
    <text
      x={x + 7}
      y={y + 20}
      fill={s === "♥" || s === "♦" ? red : ink}
      fontSize="17"
    >
      {v}
    </text>
    <text
      x={x + w / 2}
      y={y + h * 0.67}
      fill={s === "♥" || s === "♦" ? red : gold}
      fontSize="30"
      textAnchor="middle"
    >
      {s}
    </text>
  </g>
);
const Board = ({ children }: { children: ReactNode }) => (
  <g>
    <rect
      x="43"
      y="34"
      width="314"
      height="232"
      fill="#dbc299"
      stroke="#a58960"
    />
    <rect x="52" y="43" width="296" height="214" fill="#ead7b4" />
    {children}
  </g>
);
const Lines = ({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) => (
  <>
    {Array.from({ length: cols }, (_, i) => (
      <line
        key={"c" + i}
        x1={75 + (i * 250) / (cols - 1)}
        y1="58"
        x2={75 + (i * 250) / (cols - 1)}
        y2="242"
        stroke="#9e8360"
      />
    ))}
    {Array.from({ length: rows }, (_, i) => (
      <line
        key={"r" + i}
        x1="75"
        y1={58 + (i * 184) / (rows - 1)}
        x2="325"
        y2={58 + (i * 184) / (rows - 1)}
        stroke="#9e8360"
      />
    ))}
  </>
);
function scene(id: string): ReactNode {
  switch (id) {
    case "el-asesino-de-la-mansion":
      return (
        <>
          <path d="M70 142 200 42l130 100v110H70Z" fill="#77897c" />
          <path
            d="M54 146 200 31l146 115"
            fill="none"
            stroke={ink}
            strokeWidth="13"
          />
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={101 + i * 75}
              y="139"
              width="31"
              height="50"
              fill={cream}
            />
          ))}
          <path d="M173 252v-65q27-30 54 0v65" fill={ink} />
          <path d="M105 236 303 89" stroke={red} strokeWidth="3" />
          <circle cx="302" cy="87" r="12" fill={red} />
          <path d="M116 227q20-4 22-28l9 10-11 28-14 5Z" fill={gold} />
        </>
      );
    case "codigo-de-redes":
      return (
        <>
          <path
            d="M77 71 204 51 316 90 283 214 113 239 77 71M204 51 113 239M77 71 283 214M316 90 113 239"
            fill="none"
            stroke={sage}
            strokeWidth="4"
          />
          {[
            [77, 71, "SOL"],
            [204, 51, "RED"],
            [316, 90, "LUZ"],
            [283, 214, "MAR"],
            [113, 239, "RÍO"],
          ].map(([x, y, t], i) => (
            <g key={i}>
              <rect
                x={Number(x) - 35}
                y={Number(y) - 23}
                width="70"
                height="46"
                fill={cream}
                stroke={gold}
              />
              <text
                x={x}
                y={Number(y) + 5}
                textAnchor="middle"
                fill={ink}
                fontSize="15"
              >
                {t}
              </text>
            </g>
          ))}
        </>
      );
    case "pistas-abstractas":
      return (
        <>
          <Card x={65} y={61} v="" s="☼" w={85} h={172} />
          <Card x={157} y={42} v="" s="◈" w={85} h={172} />
          <Card x={249} y={76} v="" s="≋" w={85} h={172} />
          <path
            d="M82 203 120 128l22 75M178 150l24-56 25 56Z"
            fill="none"
            stroke={sage}
            strokeWidth="5"
          />
          <circle cx="291" cy="177" r="21" fill={red} opacity=".45" />
        </>
      );
    case "deduccion-alquimica":
      return (
        <>
          <path
            d="M99 62h44m-35 0v80l-47 75q-9 19 13 19h95q22 0 11-19l-47-75V62"
            fill={cream}
            stroke={ink}
            strokeWidth="4"
          />
          <path d="M76 202h91l13 22q5 10-8 10H71q-10 0-5-10Z" fill={sage} />
          <path
            d="M239 45h42m-34 0v66q-61 27-51 102 6 47 64 47t64-47q9-75-52-102V45"
            fill={cream}
            stroke={ink}
            strokeWidth="4"
          />
          <path d="M200 190h122q3 66-62 66t-60-66" fill={red} />
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              cx={235 + i * 20}
              cy={177 - i * 19}
              r={6 + i * 2}
              fill={gold}
            />
          ))}
        </>
      );
    case "adivina-quien":
      return (
        <>
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i}>
              <rect
                x={72 + (i % 3) * 88}
                y={42 + Math.floor(i / 3) * 73}
                width="78"
                height="67"
                fill={i === 5 ? "#ceaba0" : cream}
                stroke={gold}
              />
              <circle
                cx={111 + (i % 3) * 88}
                cy={65 + Math.floor(i / 3) * 73}
                r="13"
                fill={i % 2 ? gold : sage}
              />
              <path
                d={`M${90 + (i % 3) * 88} ${101 + Math.floor(i / 3) * 73}q21-37 42 0`}
                fill={i % 3 ? ink : red}
              />
              {i % 2 === 0 && (
                <path
                  d={`M${101 + (i % 3) * 88} ${64 + Math.floor(i / 3) * 73}h20`}
                  stroke={ink}
                  strokeWidth="4"
                />
              )}
            </g>
          ))}
        </>
      );
    case "linea-de-tiempo":
      return (
        <>
          <path
            d="M48 154h300l-13-10m13 10-13 10"
            stroke={ink}
            strokeWidth="4"
          />
          {["1450", "1903", "1969", "1991"].map((v, i) => (
            <g key={v}>
              <path
                d={`M${78 + i * 82} 154v${i % 2 ? -40 : 40}`}
                stroke={gold}
                strokeWidth="3"
              />
              <rect
                x={50 + i * 82}
                y={i % 2 ? 47 : 195}
                width="65"
                height="49"
                fill={cream}
                stroke={gold}
              />
              <text
                x={82 + i * 82}
                y={i % 2 ? 78 : 226}
                fill={ink}
                textAnchor="middle"
                fontSize="18"
              >
                {v}
              </text>
              <Stone x={78 + i * 82} y={154} r={7} p={i % 2} />
            </g>
          ))}
        </>
      );
    case "el-intruso":
      return (
        <>
          <path d="M68 119q132-97 264 0l-16 84q-116 53-232 0Z" fill={ink} />
          <path
            d="M92 126q43-31 79 7-25 48-66 21Zm216 0q-43-31-79 7 25 48 66 21Z"
            fill={cream}
          />
          <path
            d="M200 139v49l-18 8m-18 26q36-23 72 0"
            stroke={gold}
            fill="none"
            strokeWidth="4"
          />
          <Card x={160} y={224} v="?" s="◇" w={81} h={54} />
        </>
      );
    case "dados-mentirosos-perudo":
      return (
        <>
          <path
            d="M71 44h115l-14 119H86Z"
            fill={red}
            stroke="#844f45"
            strokeWidth="3"
          />
          <ellipse cx="129" cy="44" rx="58" ry="16" fill="#d08775" />
          <ellipse cx="129" cy="164" rx="43" ry="11" fill="#794c40" />
          {[
            [235, 104, 2],
            [292, 157, 5],
            [208, 217, 6],
            [114, 227, 3],
            [304, 230, 1],
          ].map(([x, y, n], i) => (
            <Die key={i} x={x} y={y} n={n} />
          ))}
        </>
      );
    case "liar-s-dice-estilo-casino":
      return (
        <>
          <rect x="60" y="51" width="282" height="193" fill={sage} />
          <path
            d="M75 116h248M75 182h248M163 66v160M244 66v160"
            stroke={cream}
            strokeWidth="2"
          />
          <Die x={111} y={86} n={4} />
          <Die x={205} y={153} n={4} />
          <Die x={283} y={219} n={4} />
          <text x="275" y="86" fontSize="32" fill={cream}>
            ¿4?
          </text>
          <Stone x={106} y={221} p={1} r={17} />
        </>
      );
    case "farkle-diez-mil":
      return (
        <>
          <rect
            x="241"
            y="37"
            width="103"
            height="224"
            fill={cream}
            stroke={gold}
          />
          <text x="292" y="74" textAnchor="middle" fontSize="21" fill={ink}>
            10 000
          </text>
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M257 ${104 + i * 29}h70`} stroke={gold} />
          ))}
          {[
            [87, 78, 1],
            [159, 96, 1],
            [108, 159, 1],
            [177, 203, 5],
            [68, 237, 2],
            [207, 47, 6],
          ].map(([x, y, n], i) => (
            <Die key={i} x={x} y={y} n={n} />
          ))}
        </>
      );
    case "dados-zombie":
      return (
        <>
          <path
            d="M48 257q23-105 65-88l4-88 14-9 11 18 4 68 15-61 17 2 1 19-11 87 41-41 15 9-4 18-58 75Z"
            fill={sage}
            stroke={ink}
            strokeWidth="3"
          />
          <Die x={260} y={85} symbol="☠" color="#d9d99b" />
          <Die x={286} y={181} symbol="↟" color="#d49c85" />
          <Die x={200} y={231} symbol="◎" color="#93b8a1" />
        </>
      );
    case "craps-dados-de-casino":
      return (
        <>
          <rect x="44" y="52" width="312" height="201" fill="#446a5b" />
          <path
            d="M58 179h284M58 230h284M58 179v51m95-51v51m95-51v51m96-51v51"
            stroke={cream}
            strokeWidth="2"
          />
          <text x="198" y="216" textAnchor="middle" fill={cream} fontSize="20">
            PASS LINE
          </text>
          <text x="292" y="95" fontSize="29" fill={cream}>
            7
          </text>
          <Die x={125} y={119} n={3} />
          <Die x={201} y={145} n={4} />
          <Stone x={300} y={146} r={16} p={1} />
        </>
      );
    case "sichuan-dice":
      return (
        <>
          <Board>
            {Array.from({ length: 9 }, (_, i) => (
              <g key={i}>
                <rect
                  x={63 + (i % 3) * 91}
                  y={54 + Math.floor(i / 3) * 61}
                  width="84"
                  height="55"
                  fill={i % 3 === 1 ? sage : cream}
                  stroke={gold}
                />
                <text
                  x={105 + (i % 3) * 91}
                  y={90 + Math.floor(i / 3) * 61}
                  fontSize="24"
                  fill={i % 3 === 1 ? cream : ink}
                  textAnchor="middle"
                >
                  {i + 1}
                </text>
              </g>
            ))}
          </Board>
          <Die x={158} y={212} n={4} />
          <Die x={237} y={240} n={5} />
        </>
      );
    case "crown-and-anchor":
      return (
        <>
          <rect
            x="42"
            y="53"
            width="316"
            height="195"
            fill={cream}
            stroke={gold}
          />
          {["♛", "⚓", "♥", "♠", "♦", "♣"].map((s, i) => (
            <g key={s}>
              <rect
                x={54 + (i % 3) * 101}
                y={65 + Math.floor(i / 3) * 84}
                width="91"
                height="76"
                fill={i % 2 ? "#e2c49a" : "#a7c0b2"}
              />
              <text
                x={100 + (i % 3) * 101}
                y={119 + Math.floor(i / 3) * 84}
                textAnchor="middle"
                fontSize="42"
                fill={ink}
              >
                {s}
              </text>
            </g>
          ))}
          <Die x={159} y={233} symbol="⚓" />
          <Die x={239} y={255} symbol="♛" />
        </>
      );
    case "pig-el-cerdo":
      return (
        <>
          <ellipse cx="182" cy="158" rx="91" ry="66" fill="#c98979" />
          <circle cx="270" cy="151" r="43" fill="#d6a08b" />
          <path
            d="m244 117 9-49 36 46M126 197v42h25v-29m63-6v35h25v-37"
            fill="#b7786a"
          />
          <ellipse cx="292" cy="161" rx="27" ry="20" fill="#e2b29c" />
          <circle cx="286" cy="160" r="4" fill={ink} />
          <circle cx="300" cy="160" r="4" fill={ink} />
          <circle cx="273" cy="138" r="4" fill={ink} />
          <path
            d="M98 138q-46-36-36-6t31 5"
            fill="none"
            stroke={red}
            strokeWidth="6"
          />
          <Die x={78} y={230} n={1} />
          <text x="171" y="161" textAnchor="middle" fill={cream} fontSize="27">
            100
          </text>
        </>
      );
    case "bunco":
      return (
        <>
          <path
            d="M75 206h241m-106-89v92m-43-1q8-38 43-38t43 38Z"
            stroke={gold}
            fill="none"
            strokeWidth="9"
          />
          <path d="M173 116v-43q37-46 74 0v43Z" fill={gold} />
          <circle cx="210" cy="45" r="9" fill={ink} />
          <Die x={90} y={133} n={3} />
          <Die x={309} y={133} n={3} />
          <Die x={211} y={240} n={3} />
        </>
      );
    case "cee-lo":
      return (
        <>
          <path d="M44 180q156 137 312 0v-65q-156 64-312 0Z" fill={sage} />
          <ellipse
            cx="200"
            cy="114"
            rx="156"
            ry="61"
            fill={cream}
            stroke={gold}
          />
          <Die x={115} y={111} n={4} />
          <Die x={195} y={94} n={5} />
          <Die x={277} y={126} n={6} />
          <text x="200" y="249" fill={cream} fontSize="24" textAnchor="middle">
            4 · 5 · 6
          </text>
        </>
      );
    case "hazard":
      return (
        <>
          <path d="M47 227h306V69H47Z" fill="#d0b181" />
          <path d="M60 199h280M60 69v130" stroke={ink} />
          <text x="200" y="95" fontSize="25" fill={ink} textAnchor="middle">
            MAIN · CHANCE
          </text>
          <Die x={132} y={149} n={5} />
          <Die x={234} y={153} n={2} />
          <circle cx="89" cy="241" r="15" fill={gold} />
          <circle cx="306" cy="219" r="21" fill={gold} />
          <circle cx="304" cy="215" r="17" fill="none" stroke={cream} />
        </>
      );
    case "construccion-de-colchas":
      return (
        <>
          <Board>
            {Array.from({ length: 36 }, (_, i) => (
              <g key={i}>
                <rect
                  x={71 + (i % 6) * 44}
                  y={47 + Math.floor(i / 6) * 34}
                  width="43"
                  height="33"
                  fill={[sage, red, gold, "#7999b1"][Math.floor(i / 3) % 4]}
                />
                <path
                  d={`M${74 + (i % 6) * 44} ${50 + Math.floor(i / 6) * 34}h37v27h-37Z`}
                  fill="none"
                  stroke={cream}
                  strokeDasharray="3 3"
                />
              </g>
            ))}
          </Board>
          <path
            d="M286 231 335 272m-11-43-32 43"
            stroke={ink}
            strokeWidth="4"
          />
          <circle
            cx="280"
            cy="224"
            r="10"
            fill="none"
            stroke={ink}
            strokeWidth="4"
          />
          <circle
            cx="329"
            cy="223"
            r="10"
            fill="none"
            stroke={ink}
            strokeWidth="4"
          />
        </>
      );
    case "la-colmena":
      return (
        <>
          {Array.from({ length: 9 }, (_, i) => {
            const x = 127 + (i % 3) * 70 + (Math.floor(i / 3) % 2) * 35,
              y = 78 + Math.floor(i / 3) * 62;
            return (
              <g key={i}>
                <path
                  d={`M${x - 33} ${y}l16-29h34l16 29-16 29h-34Z`}
                  fill={i % 2 ? cream : ink}
                  stroke={gold}
                  strokeWidth="3"
                />
                <text
                  x={x}
                  y={y + 10}
                  fontSize="30"
                  textAnchor="middle"
                  fill={i % 2 ? ink : cream}
                >
                  {["♛", "♜", "✥", "❋", "↟"][i % 5]}
                </text>
              </g>
            );
          })}
        </>
      );
    case "ventanas-de-catedral":
      return (
        <>
          <path d="M87 264V136q0-112 113-112t113 112v128Z" fill={ink} />
          <path d="M102 250V137q0-97 98-97t98 97v113Z" fill={gold} />
          {Array.from({ length: 20 }, (_, i) => (
            <rect
              key={i}
              x={114 + (i % 5) * 36}
              y={101 + Math.floor(i / 5) * 36}
              width="32"
              height="32"
              fill={[sage, red, "#648aa3", gold, "#9a7ca0"][i % 5]}
            />
          ))}
          <path d="M120 94q80-97 160 0Z" fill="#9b748b" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={166 + i * 34} cy={69} r="8" fill={cream} />
          ))}
        </>
      );
    case "bloques-geometricos":
      return (
        <>
          <Board>
            {Array.from({ length: 64 }, (_, i) => (
              <rect
                key={i}
                x={64 + (i % 8) * 34}
                y={46 + Math.floor(i / 8) * 26}
                width="33"
                height="25"
                fill="#e5d4b2"
                stroke="#c1ab85"
              />
            ))}
            {[
              [0, 0],
              [0, 1],
              [1, 1],
              [2, 1],
              [2, 2],
            ].map(([x, y], i) => (
              <rect
                key={i}
                x={65 + x * 34}
                y={47 + y * 26}
                width="32"
                height="24"
                fill={sage}
              />
            ))}
            {[
              [3, 3],
              [4, 3],
              [4, 4],
              [4, 5],
              [5, 5],
            ].map(([x, y], i) => (
              <rect
                key={i}
                x={65 + x * 34}
                y={47 + y * 26}
                width="32"
                height="24"
                fill={red}
              />
            ))}
            {[
              [6, 6],
              [7, 6],
              [7, 7],
            ].map(([x, y], i) => (
              <rect
                key={i}
                x={65 + x * 34}
                y={47 + y * 26}
                width="32"
                height="24"
                fill="#718daf"
              />
            ))}
          </Board>
        </>
      );
    case "quoridor":
      return (
        <>
          <Board>
            <Lines rows={9} cols={9} />
            {[
              [106, 69],
              [169, 115],
              [232, 207],
              [106, 207],
            ].map(([x, y], i) => (
              <rect
                key={i}
                x={x}
                y={y}
                width={i % 2 ? 5 : 60}
                height={i % 2 ? 43 : 5}
                fill={ink}
              />
            ))}
            <path d="M178 71h42l-8 39h-26Z" fill={red} />
            <circle cx="200" cy="60" r="13" fill={red} />
            <path d="M225 223h42l-8-39h-26Z" fill={sage} />
            <circle cx="246" cy="178" r="13" fill={sage} />
          </Board>
        </>
      );
    case "onitama":
      return (
        <>
          <Board>
            <Lines rows={5} cols={5} />
            {[0, 1, 2, 3, 4].map((i) => (
              <Stone
                key={i}
                x={75 + i * 62.5}
                y={58}
                p={0}
                r={i === 2 ? 17 : 11}
              />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <Stone
                key={i}
                x={75 + i * 62.5}
                y={242}
                p={1}
                r={i === 2 ? 17 : 11}
              />
            ))}
          </Board>
          <Card x={149} y={106} v="虎" s="↟" w={98} h={78} />
          <path
            d="M198 144v-23m0 23-22 17m22-17 22 17"
            stroke={red}
            fill="none"
            strokeWidth="3"
          />
        </>
      );
    case "yinsh":
      return (
        <>
          <Board>
            <Lines rows={9} cols={9} />
            {[0, 1, 2, 3, 4].map((i) => (
              <circle
                key={i}
                cx={102 + i * 48}
                cy={79 + (i % 3) * 61}
                r="18"
                fill="none"
                stroke={i % 2 ? cream : ink}
                strokeWidth="7"
              />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <Stone key={i} x={107 + i * 43} y={219} p={i % 2} r={8} />
            ))}
          </Board>
        </>
      );
    case "dvonn":
      return (
        <>
          {Array.from({ length: 27 }, (_, i) => {
            const x = 61 + (i % 9) * 34 + (Math.floor(i / 9) % 2) * 17,
              y = 91 + Math.floor(i / 9) * 58,
              stack = i % 7 === 0 ? 3 : 1;
            return (
              <g key={i}>
                {Array.from({ length: stack }, (_, k) => (
                  <g key={k}>
                    <ellipse
                      cx={x}
                      cy={y - k * 7 + 4}
                      rx="16"
                      ry="11"
                      fill={i % 8 === 0 ? red : i % 2 ? ink : gold}
                    />
                    <ellipse
                      cx={x}
                      cy={y - k * 7}
                      rx="16"
                      ry="11"
                      fill={i % 8 === 0 ? red : i % 2 ? ink : cream}
                      stroke={gold}
                    />
                    <ellipse
                      cx={x}
                      cy={y - k * 7}
                      rx="5"
                      ry="3"
                      fill="#776346"
                    />
                  </g>
                ))}
              </g>
            );
          })}
        </>
      );
    case "draft-de-maravillas":
      return (
        <>
          <path d="M65 226 147 69l84 157Z" fill="#c7a262" />
          <path d="m147 69 23 157h61Z" fill="#a78751" />
          <path
            d="M203 239V121h127v118M195 121l71-43 73 43Z"
            fill={cream}
            stroke={gold}
            strokeWidth="4"
          />
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={216 + i * 29}
              y="124"
              width="12"
              height="111"
              fill="#c6b99a"
            />
          ))}
          <Card x={41} y={164} v="III" s="☼" w={62} h={90} />
        </>
      );
    case "construccion-de-castillos":
      return (
        <>
          <path
            d="M58 243h283V113l-22 16-22-16v86H102v-86l-22 16-22-16Z"
            fill="#9a9c91"
            stroke={ink}
            strokeWidth="3"
          />
          <path d="M126 202v-91h150v91" fill="#b4b4a1" />
          <path d="m113 111 89-64 88 64Z" fill={red} />
          <path d="M177 242v-46q23-33 46 0v46" fill={ink} />
          <path
            d="M78 108V70m0 0h45l-12 13 12 13H78"
            stroke={ink}
            fill={sage}
          />
          <rect x="146" y="144" width="17" height="28" fill={cream} />
          <rect x="240" y="144" width="17" height="28" fill={cream} />
        </>
      );
    case "santorini":
      return (
        <>
          <ellipse cx="200" cy="252" rx="151" ry="22" fill="#69a4bb" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect
                x={72 + i * 91}
                y={169 - i * 31}
                width="69"
                height={80 + i * 31}
                fill={cream}
              />
              <rect
                x={83 + i * 91}
                y={143 - i * 31}
                width="47"
                height="27"
                fill="#fff9e8"
              />
              {i !== 0 ? (
                <path
                  d={`M${82 + i * 91} ${145 - i * 31}q25-46 50 0Z`}
                  fill="#648dbb"
                />
              ) : (
                <Stone x={105} y={139} r={13} />
              )}
              <rect
                x={99 + i * 91}
                y={205 - i * 19}
                width="15"
                height="24"
                fill={ink}
              />
            </g>
          ))}
        </>
      );
    case "molino-nine-men-s-morris":
      return (
        <Board>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={79 + i * 40}
              y={53 + i * 30}
              width={242 - i * 80}
              height={194 - i * 60}
              fill="none"
              stroke={ink}
              strokeWidth="3"
            />
          ))}
          <path
            d="M200 53v60m0 74v60M79 150h80m82 0h80"
            stroke={ink}
            strokeWidth="3"
          />
          {[79, 200, 321].map((x, i) => (
            <Stone key={i} x={x} y={53} p={0} />
          ))}
          {[
            [119, 150],
            [241, 187],
            [200, 247],
          ].map(([x, y], i) => (
            <Stone key={i} x={x} y={y} p={1} />
          ))}
        </Board>
      );
    case "shax":
      return (
        <>
          <path d="M55 50h290v210H55Z" fill="#cabb98" />
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={70 + i * 40}
              y={62 + i * 29}
              width={260 - i * 80}
              height={187 - i * 58}
              fill="none"
              stroke="#6e654b"
              strokeWidth="3"
            />
          ))}
          <path
            d="M200 62v58m0 71v58M70 156h80m100 0h80"
            stroke="#6e654b"
            strokeWidth="3"
          />
          {Array.from({ length: 12 }, (_, i) => (
            <Stone
              key={i}
              x={70 + (i % 4) * 85}
              y={62 + Math.floor(i / 4) * 93}
              p={i % 2}
              r={10}
            />
          ))}
        </>
      );
    case "senet":
      return (
        <>
          <rect x="39" y="90" width="322" height="120" fill="#a98a59" />
          {Array.from({ length: 30 }, (_, i) => (
            <g key={i}>
              <rect
                x={45 + (i % 10) * 31}
                y={95 + Math.floor(i / 10) * 35}
                width="30"
                height="34"
                fill={i % 2 ? cream : "#d2bb8e"}
                stroke={gold}
              />
              {i < 10 && (
                <Stone x={60 + (i % 10) * 31} y={113} p={i % 2} r={7} />
              )}
            </g>
          ))}
          <path
            d="M90 66h110m-88-8v16m34-16v16m34-16v16M256 244h68m-34-20v40"
            stroke={ink}
            strokeWidth="5"
          />
          <text x="310" y="187" textAnchor="middle" fill={ink} fontSize="22">
            ☥
          </text>
        </>
      );
    case "ur-juego-real-de-ur":
      return (
        <>
          {Array.from({ length: 24 }, (_, i) =>
            [4, 5, 20, 21].includes(i) ? null : (
              <g key={i}>
                <rect
                  x={42 + (i % 8) * 40}
                  y={90 + Math.floor(i / 8) * 40}
                  width="39"
                  height="39"
                  fill={cream}
                  stroke={gold}
                />
                <text
                  x={61 + (i % 8) * 40}
                  y={116 + Math.floor(i / 8) * 40}
                  fontSize="25"
                  fill={sage}
                  textAnchor="middle"
                >
                  {[0, 16, 11, 6, 22].includes(i) ? "✥" : "·"}
                </text>
              </g>
            ),
          )}
          <Stone x={101} y={150} p={0} />
          <Stone x={220} y={150} p={1} />
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M${120 + i * 46} 259l18-34 18 34Z`}
              fill={i % 2 ? cream : ink}
              stroke={gold}
            />
          ))}
        </>
      );
    case "tafl-hnefatafl":
      return (
        <>
          <Board>
            <Lines rows={11} cols={11} />
            {[0, 1, 2, 3, 4].map((i) => (
              <Stone key={i} x={150 + i * 25} y={58} r={8} />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <Stone key={i} x={150 + i * 25} y={242} r={8} />
            ))}
            {[
              [175, 132],
              [225, 132],
              [175, 169],
              [225, 169],
            ].map(([x, y], i) => (
              <Stone key={i} x={x} y={y} p={1} r={10} />
            ))}
            <text x="200" y="162" textAnchor="middle" fill={red} fontSize="39">
              ♔
            </text>
            {[
              [75, 58],
              [325, 58],
              [75, 242],
              [325, 242],
            ].map(([x, y], i) => (
              <text
                key={i}
                x={x}
                y={y + 5}
                textAnchor="middle"
                fill={red}
                fontSize="20"
              >
                ✧
              </text>
            ))}
          </Board>
        </>
      );
    case "juego-de-la-oca":
      return (
        <>
          <path
            d="M309 227H93q-49 0-49-77T93 73h215q47 0 47 77t-47 40H121q-30 0-30-40t30-40h133q35 0 35 40t-35 40h-61"
            fill="none"
            stroke={gold}
            strokeWidth="25"
            strokeDasharray="21 4"
          />
          <path
            d="M172 174q-39-15-25-36 8-15 27-4l4-47q11-34 32-21 18 15-2 24l-1 48q25 8 14 31Z"
            fill={cream}
            stroke={ink}
            strokeWidth="3"
          />
          <path d="m214 73 21 6-21 8" fill={red} />
          <Die x={83} y={236} n={3} />
          <Die x={317} y={252} n={6} />
        </>
      );
    case "pachisi":
      return (
        <>
          <path
            d="M165 29h70v91h113v60H235v91h-70v-91H52v-60h113Z"
            fill={red}
            stroke={gold}
            strokeWidth="4"
          />
          {[0, 1, 2, 3].map((p) => (
            <g key={p} transform={`rotate(${p * 90} 200 150)`}>
              {Array.from({ length: 21 }, (_, i) => (
                <rect
                  key={i}
                  x={169 + (i % 3) * 21}
                  y={33 + Math.floor(i / 3) * 16}
                  width="20"
                  height="15"
                  fill={i % 3 === 1 ? cream : "#d9b385"}
                  stroke={ink}
                  strokeWidth=".5"
                />
              ))}
              <Stone x={180} y={111} p={p % 2} r={7} />
            </g>
          ))}
          <text x="200" y="159" textAnchor="middle" fontSize="31" fill={cream}>
            ☸
          </text>
          {[0, 1, 2].map((i) => (
            <ellipse
              key={i}
              cx={298 + i * 19}
              cy={234 + i * 12}
              rx="12"
              ry="7"
              fill={cream}
              stroke={gold}
            />
          ))}
        </>
      );
    case "fanorona":
      return (
        <Board>
          <Lines rows={5} cols={9} />
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M${75 + i * 62.5} 58l62.5 92-62.5 92M${137.5 + i * 62.5} 58l-62.5 92 62.5 92`}
              fill="none"
              stroke={gold}
            />
          ))}
          {Array.from({ length: 18 }, (_, i) => (
            <Stone
              key={i}
              x={75 + (i % 9) * 31.25}
              y={58 + Math.floor(i / 9) * 46}
              p={0}
              r={8}
            />
          ))}
          {Array.from({ length: 18 }, (_, i) => (
            <Stone
              key={i}
              x={75 + (i % 9) * 31.25}
              y={196 + Math.floor(i / 9) * 46}
              p={1}
              r={8}
            />
          ))}
        </Board>
      );
    case "surakarta":
      return (
        <>
          <g>
            {[27, 48].map((r) => (
              <g key={r}>
                {[
                  [103, 66],
                  [298, 66],
                  [103, 235],
                  [298, 235],
                ].map(([x, y], i) => (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={r}
                    fill="none"
                    stroke={sage}
                    strokeWidth="3"
                  />
                ))}
              </g>
            ))}
            <rect x="101" y="65" width="197" height="171" fill={cream} />
            <path
              d="M103 66h195v169H103Z"
              fill="none"
              stroke={ink}
              strokeWidth="2"
            />
            {[1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${103 + i * 39} 66v169M103 ${66 + i * 33.8}h195`}
                stroke={ink}
              />
            ))}
          </g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Stone key={i} x={103 + i * 39} y={66} r={9} />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Stone key={i} x={103 + i * 39} y={235} p={1} r={9} />
          ))}
        </>
      );
    case "bagh-chal-movimiento-de-tigres":
      return (
        <>
          <Board>
            <Lines />
            <path
              d="M75 58 325 242M325 58 75 242M200 58 75 150 200 242 325 150Z"
              fill="none"
              stroke={gold}
              strokeWidth="2"
            />
            {[
              [75, 58],
              [325, 58],
              [75, 242],
              [325, 242],
            ].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="18" fill={gold} />
                <text
                  x={x}
                  y={y + 6}
                  textAnchor="middle"
                  fill={ink}
                  fontSize="21"
                >
                  虎
                </text>
              </g>
            ))}
            {[
              [200, 104],
              [137, 150],
              [263, 150],
              [200, 196],
            ].map(([x, y], i) => (
              <Stone key={i} x={x} y={y} p={1} />
            ))}
          </Board>
        </>
      );
    case "mu-torere":
      return (
        <>
          <circle
            cx="200"
            cy="150"
            r="113"
            fill="#dbc69f"
            stroke={ink}
            strokeWidth="3"
          />
          {Array.from({ length: 8 }, (_, i) => {
            const x = 200 + 113 * Math.sin((i * Math.PI) / 4),
              y = 150 - 113 * Math.cos((i * Math.PI) / 4);
            return (
              <g key={i}>
                <line
                  x1="200"
                  y1="150"
                  x2={x}
                  y2={y}
                  stroke={gold}
                  strokeWidth="2"
                />
                <Stone x={x} y={y} p={i < 4 ? 0 : 1} r={17} />
              </g>
            );
          })}
          <circle cx="200" cy="150" r="19" fill={cream} stroke={gold} />
        </>
      );
    case "halma":
      return (
        <Board>
          {Array.from({ length: 100 }, (_, i) => (
            <rect
              key={i}
              x={64 + (i % 10) * 27}
              y={50 + Math.floor(i / 10) * 20}
              width="26"
              height="19"
              fill={((i % 10) + Math.floor(i / 10)) % 2 ? "#bea57d" : cream}
            />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <Stone
              key={i}
              x={77 + (i % 4) * 27}
              y={60 + Math.floor(i / 4) * 20}
              r={7}
            />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <Stone
              key={i}
              x={320 - (i % 4) * 27}
              y={239 - Math.floor(i / 4) * 20}
              p={1}
              r={7}
            />
          ))}
        </Board>
      );
    case "yut-nori":
      return (
        <>
          <path
            d="M92 48h214v204H92ZM92 48 306 252M306 48 92 252"
            fill="none"
            stroke={gold}
            strokeWidth="3"
          />
          {Array.from({ length: 20 }, (_, i) => {
            const [x, y] =
              i < 5
                ? [92 + i * 42.8, 48]
                : i < 10
                  ? [306, 48 + (i - 5) * 40.8]
                  : i < 15
                    ? [306 - (i - 10) * 42.8, 252]
                    : [92, 252 - (i - 15) * 40.8];
            return (
              <circle key={i} cx={x} cy={y} r="7" fill={cream} stroke={ink} />
            );
          })}
          <Stone x={199} y={150} p={0} r={15} />
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M${75 + i * 65} 269l43-17 4 12-43 17Z`}
              fill={i % 2 ? cream : gold}
              stroke={ink}
            />
          ))}
        </>
      );
    case "nyout":
      return (
        <>
          <circle
            cx="200"
            cy="148"
            r="111"
            fill="none"
            stroke={gold}
            strokeWidth="3"
          />
          <path d="M89 148h222M200 37v222" stroke={gold} strokeWidth="3" />
          {Array.from({ length: 20 }, (_, i) => (
            <circle
              key={i}
              cx={200 + 111 * Math.sin((i * Math.PI) / 10)}
              cy={148 - 111 * Math.cos((i * Math.PI) / 10)}
              r="7"
              fill={cream}
              stroke={ink}
            />
          ))}
          <text x="200" y="169" fill={ink} fontSize="50" textAnchor="middle">
            馬
          </text>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={154 + i * 23}
              y="271"
              width="17"
              height="7"
              fill={i % 2 ? ink : cream}
              stroke={gold}
            />
          ))}
        </>
      );
    case "tsoro-yematatu":
      return (
        <>
          <path
            d="M200 35 70 252h260ZM135 143h130M200 35v217"
            fill="#dbc69f"
            stroke={ink}
            strokeWidth="3"
          />
          {[
            [200, 35],
            [135, 143],
            [200, 143],
            [265, 143],
            [70, 252],
            [200, 252],
            [330, 252],
          ].map(([x, y], i) =>
            i === 2 ? (
              <circle key={i} cx={x} cy={y} r="16" fill={cream} stroke={gold} />
            ) : (
              <Stone key={i} x={x} y={y} p={i % 2} r={16} />
            ),
          )}
        </>
      );
    case "awale":
      return (
        <>
          <path
            d="M55  70q145-55 290 0v160q-145 55-290 0Z"
            fill="#ac8252"
            stroke="#805d37"
            strokeWidth="4"
          />
          {Array.from({ length: 12 }, (_, i) => (
            <g key={i}>
              <ellipse
                cx={84 + (i % 6) * 46}
                cy={115 + Math.floor(i / 6) * 80}
                rx="20"
                ry="29"
                fill="#665238"
              />
              {[0, 1, 2, 3].map((k) => (
                <ellipse
                  key={k}
                  cx={78 + (i % 6) * 46 + (k % 2) * 12}
                  cy={105 + Math.floor(i / 6) * 80 + Math.floor(k / 2) * 16}
                  rx="5"
                  ry="7"
                  fill={cream}
                />
              ))}
            </g>
          ))}
        </>
      );
    case "sugoroku":
      return (
        <>
          <path
            d="M45 237q58-72 121-35t72-74 117-81"
            fill="none"
            stroke={red}
            strokeWidth="14"
            strokeDasharray="17 4"
          />
          <path d="m85 150 71-104 79 104Z" fill="#799b9b" />
          <path d="m130 83 26-37 27 37-23-11Z" fill={cream} />
          <path
            d="M269 159h76m-65-8v99m53-99v99M266 174h83"
            stroke={ink}
            strokeWidth="8"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={52 + i * 48}
              cy={238 - i * 7}
              r="13"
              fill={cream}
              stroke={gold}
            />
          ))}
          <Die x={77} y={79} n={4} />
        </>
      );
    case "escoba":
      return (
        <>
          <Card x={49} y={70} v="7" s="◉" />
          <Card x={116} y={70} v="5" s="♜" />
          <Card x={183} y={70} v="3" s="⚔" />
          <path
            d="M279 48v174m-23 31 23-43 31 43Z"
            stroke={gold}
            strokeWidth="7"
            fill="#c2a164"
          />
          <text x="149" y="239" textAnchor="middle" fill={ink} fontSize="28">
            7 + 5 + 3 = 15
          </text>
        </>
      );
    case "cinquillo":
      return (
        <>
          {["◉", "♜", "⚔", "♣"].map((s, row) =>
            [4, 5, 6, 7].map((v, c) => (
              <Card
                key={s + v}
                x={62 + c * 70}
                y={34 + row * 60}
                v={String(v)}
                s={s}
                w={61}
                h={55}
              />
            )),
          )}
        </>
      );
    case "belote":
      return (
        <>
          <path d="M74 57h252v187H74Z" fill={sage} />
          <Card x={171} y={43} v="J" s="♥" />
          <Card x={48} y={119} v="9" s="♥" />
          <Card x={288} y={124} v="A" s="♠" />
          <Card x={170} y={170} v="K" s="♣" />
          <path d="M129 150h30m81 0h30" stroke={cream} strokeWidth="3" />
        </>
      );
    case "solitaire":
      return (
        <>
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i}>
              <Card
                x={37 + i * 47}
                y={86 + i * 7}
                v={String(i + 2)}
                s={i % 2 ? "♥" : "♠"}
                w={43}
                h={76}
              />
              {i > 0 && (
                <Card
                  x={37 + i * 47}
                  y={127 + i * 7}
                  v={String(i + 1)}
                  s={i % 2 ? "♠" : "♦"}
                  w={43}
                  h={76}
                />
              )}
            </g>
          ))}
          {[0, 1, 2, 3].map((i) => (
            <Card
              key={i}
              x={173 + i * 47}
              y={25}
              v="A"
              s={["♠", "♥", "♦", "♣"][i]}
              w={43}
              h={50}
            />
          ))}
        </>
      );
    case "solitario-spider":
      return (
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i}>
              {[0, 1, 2].map((k) => (
                <Card
                  key={k}
                  x={30 + i * 34}
                  y={103 + k * 28 + (i % 3) * 14}
                  v={String(10 - k)}
                  s="♠"
                  w={32}
                  h={65}
                />
              ))}
            </g>
          ))}
          <path
            d="M167 59l-33-29m33 36-40-1m106-6 33-29m-33 36 40-1"
            stroke={ink}
            strokeWidth="3"
          />
          <ellipse cx="200" cy="60" rx="32" ry="20" fill={ink} />
        </>
      );
    case "solitario-carta-blanca-freecell":
      return (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i}>
              <rect
                x={29 + i * 43}
                y="38"
                width="38"
                height="60"
                fill={i < 4 ? "#b9c7b4" : cream}
                stroke={gold}
                strokeDasharray={i < 4 ? "5 4" : undefined}
              />
              <Card
                x={29 + i * 43}
                y={140 + (i % 3) * 16}
                v={["K", "Q", "J", "10", "9", "8", "7", "6"][i]}
                s={i % 2 ? "♥" : "♠"}
                w={38}
                h={77}
              />
            </g>
          ))}
        </>
      );
    case "blackjack-21":
      return (
        <>
          <path d="M45 191q155-130 310 0v62H45Z" fill={sage} />
          <Card x={91} y={66} v="A" s="♠" w={90} h={140} />
          <Card x={196} y={80} v="K" s="♥" w={90} h={140} />
          <text x="200" y="254" textAnchor="middle" fill={cream} fontSize="25">
            21
          </text>
          <Stone x={320} y={241} p={1} r={17} />
        </>
      );
    case "mus":
      return (
        <>
          <Card x={41} y={52} v="R" s="◉" w={68} h={132} />
          <Card x={119} y={78} v="R" s="♜" w={68} h={132} />
          <Card x={197} y={52} v="R" s="⚔" w={68} h={132} />
          <Card x={275} y={78} v="R" s="♣" w={68} h={132} />
          {Array.from({ length: 12 }, (_, i) => (
            <ellipse
              key={i}
              cx={105 + (i % 6) * 30}
              cy={238 + Math.floor(i / 6) * 19}
              rx="6"
              ry="4"
              fill={gold}
            />
          ))}
        </>
      );
    case "brisca":
      return (
        <>
          <rect x="45" y="42" width="310" height="216" fill="#7d9b82" />
          <Card x={66} y={70} v="A" s="◉" w={70} h={127} />
          <Card x={164} y={95} v="3" s="◉" w={70} h={127} />
          <Card x={264} y={50} v="R" s="♜" w={70} h={127} />
          <path d="M256 209h84m-42-10v20" stroke={cream} strokeWidth="3" />
        </>
      );
    default:
      return null;
  }
}
export default function IdentityArt({ id }: { id: string }) {
  const uid = useId().replaceAll(":", "");
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true" data-artwork={id}>
      <defs>
        <filter
          id={uid + "shadow"}
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
        >
          <feDropShadow
            dx="2"
            dy="6"
            stdDeviation="4"
            floodColor="#263d39"
            floodOpacity=".18"
          />
        </filter>
      </defs>
      <g filter={`url(#${uid}shadow)`}>{scene(id)}</g>
    </svg>
  );
}
