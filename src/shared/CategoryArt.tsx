import { useId } from "react";
import { games } from "../games/registry";
export default function CategoryArt({ id }: { id: string }) {
  const uid = useId().replaceAll(":", ""),
    category = games.find((g) => g.id === id)?.category;
  const seed = [...id].reduce((a, c) => a + c.charCodeAt(0), 0),
    colors = ["#77a89d", "#93b4c6", "#be9aaf", "#d8bc83"];
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true">
      <defs>
        <linearGradient id={uid} x2=".4" y2="1">
          <stop stopColor="#f2e6cc" />
          <stop offset="1" stopColor="#be9e71" />
        </linearGradient>
        <filter id={uid + "s"}>
          <feDropShadow dx="3" dy="8" stdDeviation="6" floodOpacity=".24" />
        </filter>
      </defs>
      <rect
        x="12"
        y="12"
        width="376"
        height="276"
        fill={colors[seed % 4]}
        opacity=".15"
      />
      {category === "Dados" ? (
        <g filter={`url(#${uid}s)`}>
          {[0, 1, 2].map((v) => (
            <g
              key={v}
              transform={`translate(${65 + v * 95},${95 + (v % 2) * 30})`}
            >
              <path d="M0 0 64 0 82 -14 18 -14Z" fill="#fff9e9" />
              <path d="M64 0 82 -14 82 55 64 69Z" fill="#ac9472" />
              <rect
                width="64"
                height="69"
                fill={`url(#${uid})`}
                stroke="#8f795b"
              />
              {Array.from({ length: 3 + ((seed + v) % 4) }, (_, k) => (
                <circle
                  key={k}
                  cx={18 + (k % 2) * 28}
                  cy={15 + Math.floor(k / 2) * 18}
                  r="5"
                  fill="#304854"
                />
              ))}
            </g>
          ))}
        </g>
      ) : category === "Deducción" ? (
        <g filter={`url(#${uid}s)`}>
          <rect
            x="55"
            y="42"
            width="160"
            height="211"
            fill={`url(#${uid})`}
            stroke="#8e775d"
          />
          {[0, 1, 2, 3, 4].map((k) => (
            <g key={k}>
              <path d={`M80 ${80 + k * 30}h105`} stroke="#a7957c" />
              <circle
                cx="82"
                cy={76 + k * 30}
                r="4"
                fill={colors[(seed + k) % 4]}
              />
            </g>
          ))}
          <circle
            cx="252"
            cy="131"
            r="59"
            fill="#d0eeed88"
            stroke="#344f59"
            strokeWidth="12"
          />
          <path d="m291 175 48 54" stroke="#344f59" strokeWidth="20" />
          <text
            x="252"
            y="150"
            textAnchor="middle"
            fill="#344f59"
            fontSize="59"
          >
            ?
          </text>
        </g>
      ) : (
        <g filter={`url(#${uid}s)`}>
          <rect
            x="47"
            y="35"
            width="306"
            height="231"
            fill={`url(#${uid})`}
            stroke="#8e775d"
          />
          {Array.from({ length: 25 }, (_, i) => {
            const c = i % 5,
              r = Math.floor(i / 5),
              x = 88 + c * 55,
              y = 66 + r * 42;
            return (
              <g key={i}>
                <rect
                  x={x - 19}
                  y={y - 17}
                  width="39"
                  height="34"
                  fill={(c + r) % 2 ? "#b0966d" : "#efddbb"}
                />
                {(i + seed) % 4 === 0 && (
                  <>
                    <ellipse
                      cx={x + 3}
                      cy={y + 5}
                      rx="15"
                      ry="10"
                      fill="#334e5625"
                    />
                    {id === "yinsh" || id === "dvonn" ? (
                      <circle
                        cx={x}
                        cy={y}
                        r="12"
                        fill={id === "yinsh" ? "none" : colors[c % 4]}
                        stroke="#3b6165"
                        strokeWidth="6"
                      />
                    ) : (
                      <path
                        d={`M${x - 13} ${y + 9}L${x - 13} ${y - 9}L${x} ${y - 15}L${x + 13} ${y - 9}L${x + 13} ${y + 9}L${x} ${y + 15}Z`}
                        fill={colors[c % 4]}
                        stroke="#446569"
                      />
                    )}
                  </>
                )}
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
