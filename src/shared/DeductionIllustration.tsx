export default function DeductionIllustration({ value }: { value: string }) {
  const [type, ...data] = value.split(":");
  if (type === "person") {
    const [hair, glasses, hat, beard] = data.map(Number);
    return (
      <svg viewBox="0 0 100 110" aria-hidden="true">
        <path d="M12 110Q18 73 50 74T88 110" fill="#5b8b95" />
        <ellipse cx="50" cy="50" rx="28" ry="33" fill="#e4b892" />
        <path
          d="M22 47Q15 8 50 10Q87 9 78 46L69 26L46 32L30 24Z"
          fill={["#37353b", "#dec373", "#80604f", "#b56849"][hair]}
        />
        <circle cx="40" cy="49" r="2.5" />
        <circle cx="60" cy="49" r="2.5" />
        <path
          d="M43 65Q50 69 57 65"
          fill="none"
          stroke="#855956"
          strokeWidth="2"
        />
        {beard === 1 && (
          <path
            d="M29 61Q50 90 71 61Q71 80 50 85Q29 80 29 61"
            fill={["#37353b", "#dec373", "#80604f", "#b56849"][hair]}
          />
        )}{" "}
        {glasses === 1 && (
          <g fill="none" stroke="#354955" strokeWidth="3">
            <rect x="29" y="42" width="17" height="13" />
            <rect x="54" y="42" width="17" height="13" />
            <path d="M46 47h8" />
          </g>
        )}
        {hat > 0 && (
          <path
            d="M13 28H87V20H71V5H29V20H13Z"
            fill={hat === 1 ? "#5277aa" : "#628d63"}
          />
        )}
      </svg>
    );
  }
  if (type === "scene") {
    const id = +data[0],
      animal = id % 6,
      scene = Math.floor(id / 6) % 4,
      mood = Math.floor(id / 24) % 3;
    return (
      <svg viewBox="0 0 150 115" aria-hidden="true">
        <rect
          width="150"
          height="115"
          fill={["#b9c9d3", "#52647e", "#ead395"][mood]}
        />
        <circle
          cx="116"
          cy="23"
          r="13"
          fill={mood === 1 ? "#e6e3cb" : "#f9e9a7"}
        />
        {scene === 0 ? (
          <g fill="#3e6f5c">
            <path d="M0 92 24 30 49 92ZM43 90 67 22 96 90ZM84 93 115 42 150 93Z" />
          </g>
        ) : scene === 1 ? (
          <path d="M0 74Q22 60 43 75T88 75T150 75V115H0Z" fill="#528a9e" />
        ) : scene === 2 ? (
          <path d="M0 97 47 28 78 80 112 42 150 97Z" fill="#7d8a98" />
        ) : (
          <g fill="#758492">
            <path d="M0 90V37H24V90H37V18H68V90H80V44H105V90H116V26H145V90Z" />
          </g>
        )}
        <path d="M0 102Q70 77 150 103V115H0Z" fill="#77966c" />
        <ellipse cx="65" cy="91" rx="29" ry="10" fill="#233f4833" />
        {animal === 3 ? (
          <g fill="#db9861">
            <ellipse cx="68" cy="81" rx="25" ry="12" />
            <path d="M89 81 109 65V97Z" />
          </g>
        ) : animal === 1 ? (
          <g fill="#b58a66">
            <ellipse cx="66" cy="75" rx="19" ry="24" />
            <path d="M47 63V44L63 57 83 44V65Z" />
            <circle cx="59" cy="65" r="7" fill="#f4e1ac" />
            <circle cx="74" cy="65" r="7" fill="#f4e1ac" />
          </g>
        ) : (
          <g
            fill={
              [
                "#b66e47",
                "#b58a66",
                "#ab906a",
                "#db9861",
                "#68777c",
                "#d1b598",
              ][animal]
            }
          >
            <ellipse cx="68" cy="82" rx="24" ry="13" />
            <circle cx="49" cy="67" r="15" />
            <path d="M35 61 33 42 47 55 53 43 61 60Z" />
            <path
              d="M52 90V107M78 90V107"
              stroke="currentColor"
              strokeWidth="5"
            />
            {animal === 2 && (
              <path
                d="M38 53 30 36 19 31M30 36 34 24M54 52 67 34 81 28M67 34 64 22"
                fill="none"
                stroke="#785c45"
                strokeWidth="3"
              />
            )}
          </g>
        )}
        <circle cx="45" cy="67" r="2.5" fill="#293d44" />
      </svg>
    );
  }
  return <span>{value}</span>;
}
