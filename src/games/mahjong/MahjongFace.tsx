export default function MahjongFace({ face }: { face: number }) {
  const glyphs = [
    "東",
    "南",
    "西",
    "北",
    "中",
    "發",
    "□",
    "梅",
    "蘭",
    "竹",
    "菊",
    "春",
    "夏",
    "秋",
    "冬",
  ];
  return (
    <svg viewBox="0 0 58 76" aria-hidden="true">
      {face < 9 ? (
        <>
          <text x="29" y="31" textAnchor="middle" fontSize="24" fill="#273d35">
            {["一", "二", "三", "四", "五", "六", "七", "八", "九"][face]}
          </text>
          <text x="29" y="59" textAnchor="middle" fontSize="22" fill="#a8493a">
            萬
          </text>
        </>
      ) : face < 18 ? (
        Array.from({ length: face - 8 }, (_, i) => (
          <circle
            key={i}
            cx={18 + (i % 3) * 11}
            cy={19 + Math.floor(i / 3) * 18}
            r="4"
            fill={i % 3 === 0 ? "#b35848" : i % 3 === 1 ? "#4b7d77" : "#486878"}
            stroke="#27473e"
            strokeWidth="1"
          />
        ))
      ) : face < 27 ? (
        Array.from({ length: face - 17 }, (_, i) => (
          <path
            key={i}
            d={
              "M" +
              (18 + (i % 3) * 11) +
              " " +
              (14 + Math.floor(i / 3) * 18) +
              "v12m-3-9h6m-6 6h6"
            }
            stroke={i === 0 ? "#ab5041" : "#4f7a62"}
            strokeWidth="3"
          />
        ))
      ) : (
        <text
          x="29"
          y="49"
          textAnchor="middle"
          fontSize="32"
          fill={face === 31 ? "#a8493a" : face >= 34 ? "#a17b9e" : "#3b6c59"}
        >
          {glyphs[face - 27]}
        </text>
      )}
    </svg>
  );
}
