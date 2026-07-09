// Illustrated variant of the launch flow: instead of sankey ribbons, each
// stage is a hand-drawn SVG vignette in the brand's line-art style — a
// publisher's portico, an archive cabinet filing pages, a lens translating
// text to code, four gates stamping checks, the sealed rulebook, and the
// three surfaces — sitting on one ground line that dots travel end to end
// (grey → amber → green), with the redraft loop drawn beneath the gates.

const CYCLE = 14;

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const GROUND_Y = 178;
const GROUND = `M 30 ${GROUND_Y} H 1390`;

// Stage centers along the ground line.
const CX = [110, 340, 570, 800, 1030, 1280];

const STAGES = [
  { name: "A law is published", caption: "hundreds of official sites" },
  { name: "Captured & filed", caption: "1.7M+ provisions · fingerprinted" },
  { name: "Encoded", caption: "text becomes executable rules" },
  { name: "The four gates", caption: "run · checks · compare · review" },
  { name: "The rulebook", caption: "3,000+ rules · signed & citable" },
  { name: "Everywhere", caption: "web · API · AI agents" },
];

// fraction of the ground line at a given x (for color flips)
const fx = (x: number) => (x - 30) / 1360;

function TravelDot({ begin }: { begin: number }) {
  return (
    <circle r="3.2" fill="#78716c">
      <animateMotion
        dur={`${CYCLE}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        path={GROUND}
      />
      <animate
        attributeName="fill"
        dur={`${CYCLE}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        calcMode="discrete"
        values="#78716c;#92400e;#166534"
        keyTimes={`0;${fx(CX[2])};${fx(CX[3] + 55)}`}
      />
      <animate
        attributeName="opacity"
        dur={`${CYCLE}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        values="0;1;1;0"
        keyTimes="0;0.02;0.97;1"
      />
    </circle>
  );
}

export function IllustratedFlow() {
  return (
    <div className="ill__wrap">
      <svg
        className="ill"
        viewBox="0 0 1420 300"
        role="img"
        aria-label="Illustrated flow: a law is published, captured and filed into the corpus, encoded into executable rules, checked at four gates (failures loop back), sealed into the rulebook, and served everywhere."
      >
        {/* ── ground line ─────────────────────────────────────── */}
        <path className="ill-ground" d={GROUND} />

        {/* redraft loop: gates back to the lens */}
        <path
          className="ill-loop"
          d={`M ${CX[3] - 10} ${GROUND_Y + 4} C ${CX[3] - 30} ${GROUND_Y + 58}, ${CX[2] + 30} ${GROUND_Y + 58}, ${CX[2] + 10} ${GROUND_Y + 8}`}
          markerEnd="url(#ill-arr)"
        />
        <text className="ill-caption ill-caption--loop" x={(CX[2] + CX[3]) / 2} y={GROUND_Y + 72} textAnchor="middle">
          ↺ any failure — redrafted
        </text>

        <defs>
          <marker id="ill-arr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="rgba(146,64,14,0.75)" />
          </marker>
        </defs>

        {/* ── 1 · the publisher's portico, page drifting out ──── */}
        <g className="ill-scene" transform={`translate(${CX[0] - 60}, 40)`}>
          <polygon className="ill-line" points="8,42 60,12 112,42" />
          <line className="ill-line" x1="14" y1="42" x2="106" y2="42" />
          {[30, 55, 80].map((x) => (
            <rect key={x} className="ill-line" x={x} y="48" width="11" height="60" />
          ))}
          <rect className="ill-line" x="10" y="108" width="100" height="9" />
          <g>
            <rect className="ill-paper" x="46" y="58" width="28" height="38" rx="2" />
            {[66, 73, 80].map((y) => (
              <line key={y} className="ill-ink" x1="51" y1={y} x2="69" y2={y} />
            ))}
            {!REDUCED_MOTION && (
              <animateTransform
                attributeName="transform"
                type="translate"
                dur={`${CYCLE}s`}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.6 1;0 0 1 1;0 0 1 1"
                values="0 0; 34 46; 34 46; 0 0"
                keyTimes="0;0.12;0.97;1"
              />
            )}
          </g>
        </g>

        {/* ── 2 · the archive cabinet, drawer open, filing ─────── */}
        <g className="ill-scene" transform={`translate(${CX[1] - 60}, 46)`}>
          <rect className="ill-line" x="28" y="14" width="64" height="98" rx="3" />
          {[38, 60, 96].map((y) => (
            <line key={y} className="ill-line" x1="34" y1={y} x2="86" y2={y} />
          ))}
          {[26, 48, 104].map((y) => (
            <line key={y} className="ill-ink" x1="54" y1={y} x2="66" y2={y} />
          ))}
          {/* the open drawer */}
          <rect className="ill-paper ill-line" x="18" y="66" width="84" height="20" rx="2" />
          <line className="ill-ink" x1="52" y1="76" x2="68" y2="76" />
          {/* a page sliding into the drawer, forever */}
          {!REDUCED_MOTION && (
            <g>
              <rect className="ill-paper" x="-26" y="64" width="20" height="24" rx="2" />
              <line className="ill-ink" x1="-22" y1="71" x2="-10" y2="71" />
              <line className="ill-ink" x1="-22" y1="78" x2="-12" y2="78" />
              <animateTransform
                attributeName="transform"
                type="translate"
                dur={`${CYCLE / 2}s`}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.3 0 0.4 1;0 0 1 1"
                values="0 0; 62 4; 62 4"
                keyTimes="0;0.45;1"
              />
              <animate
                attributeName="opacity"
                dur={`${CYCLE / 2}s`}
                repeatCount="indefinite"
                values="1;1;0;0"
                keyTimes="0;0.4;0.55;1"
              />
            </g>
          )}
          {/* fingerprint mark */}
          {[5, 9, 13].map((r) => (
            <circle key={r} className="ill-accent-line" cx="92" cy="104" r={r} fill="none" />
          ))}
        </g>

        {/* ── 3 · the lens: text becomes code ──────────────────── */}
        <g className="ill-scene" transform={`translate(${CX[2] - 60}, 46)`}>
          <rect className="ill-paper ill-line" x="18" y="18" width="84" height="94" rx="3" />
          {[32, 41, 50].map((y) => (
            <line key={y} className="ill-ink" x1="28" y1={y} x2={y === 50 ? 74 : 92} y2={y} />
          ))}
          <line className="ill-line" x1="24" y1="62" x2="96" y2="62" strokeDasharray="3 3" />
          <text className="ill-code" x="28" y="82">{"snap = tfp"}</text>
          <text className="ill-code" x="28" y="98">{"− 0.30 × inc"}</text>
          {/* magnifier */}
          <circle className="ill-line" cx="88" cy="40" r="17" fill="rgba(146,64,14,0.05)" />
          <line className="ill-line" x1="100" y1="53" x2="112" y2="66" strokeWidth="4" />
          {/* the amber scan line inside the lens */}
          {!REDUCED_MOTION && (
            <line className="ill-accent-line" x1="76" y1="41" x2="100" y2="41" strokeWidth="2.5">
              <animate attributeName="opacity" dur="3.5s" repeatCount="indefinite" values="0;1;0" keyTimes="0;0.5;1" />
            </line>
          )}
        </g>

        {/* ── 4 · the four gates, checks stamping ──────────────── */}
        <g className="ill-scene" transform={`translate(${CX[3] - 66}, 52)`}>
          {[0, 1, 2, 3].map((i) => {
            const x = 10 + i * 32;
            const t0 = 0.5 + i * 0.035; // roughly when dots pass through
            return (
              <g key={i}>
                <path
                  className="ill-line"
                  d={`M ${x} 106 V 62 A 13 13 0 0 1 ${x + 26} 62 V 106`}
                  fill="none"
                />
                <text className="ill-check" x={x + 13} y="52" textAnchor="middle" opacity={REDUCED_MOTION ? 1 : 0}>
                  ✓
                  {!REDUCED_MOTION && (
                    <animate
                      attributeName="opacity"
                      dur={`${CYCLE}s`}
                      repeatCount="indefinite"
                      values="0;0;1;1;0;0"
                      keyTimes={`0;${t0};${t0 + 0.02};${t0 + 0.12};${t0 + 0.16};1`}
                    />
                  )}
                </text>
              </g>
            );
          })}
        </g>

        {/* ── 5 · the rulebook, sealed ─────────────────────────── */}
        <g className="ill-scene" transform={`translate(${CX[4] - 60}, 52)`}>
          <path className="ill-paper ill-line" d="M 60 30 C 40 22, 18 24, 12 30 V 100 C 18 94, 40 92, 60 100 Z" />
          <path className="ill-paper ill-line" d="M 60 30 C 80 22, 102 24, 108 30 V 100 C 102 94, 80 92, 60 100 Z" />
          {[44, 54, 64].map((y) => (
            <line key={y} className="ill-ink" x1="22" y1={y} x2="50" y2={y} />
          ))}
          {[44, 54].map((y) => (
            <line key={`r${y}`} className="ill-ink" x1="70" y1={y} x2="98" y2={y} />
          ))}
          <text className="ill-code" x="70" y="80">{"§ ✓"}</text>
          {/* the wax seal */}
          <polygon className="ill-accent-fill" points="88,96 96,116 92,113 88,118 84,113 80,116" />
          <circle className="ill-accent-fill" cx="88" cy="96" r="10" />
          <circle className="ill-paper" cx="88" cy="96" r="4" />
        </g>

        {/* ── 6 · everywhere: browser, terminal, agent ─────────── */}
        <g className="ill-scene" transform={`translate(${CX[5] - 66}, 44)`}>
          <rect className="ill-paper ill-line" x="8" y="12" width="66" height="46" rx="4" />
          <line className="ill-line" x1="8" y1="24" x2="74" y2="24" />
          <circle className="ill-ink" cx="15" cy="18" r="1.6" />
          <circle className="ill-ink" cx="21" cy="18" r="1.6" />
          {[34, 42].map((y) => (
            <line key={y} className="ill-ink" x1="15" y1={y} x2="60" y2={y} />
          ))}
          <rect className="ill-dark" x="8" y="68" width="66" height="38" rx="4" />
          <text className="ill-code ill-code--onDark" x="15" y="90">{"> $291 ▌"}</text>
          <path
            className="ill-paper ill-line"
            d="M 88 40 h 40 a6 6 0 0 1 6 6 v 20 a6 6 0 0 1 -6 6 h -22 l -10 10 v -10 h -8 a6 6 0 0 1 -6 -6 v -20 a6 6 0 0 1 6 -6 Z"
          />
          <text className="ill-code" x="94" y="60">{"§ cited"}</text>
          <line className="ill-line" x1="108" y1="40" x2="108" y2="32" />
          <circle className="ill-accent-fill" cx="108" cy="30" r="3" />
        </g>

        {/* ── stage labels ─────────────────────────────────────── */}
        {STAGES.map((s, i) => (
          <g key={s.name}>
            <text className="ill-name" x={CX[i]} y="216" textAnchor="middle">
              {s.name}
            </text>
            <text className="ill-caption" x={CX[i]} y="234" textAnchor="middle">
              {s.caption}
            </text>
          </g>
        ))}

        {/* ── the travelers ────────────────────────────────────── */}
        {!REDUCED_MOTION && (
          <g>
            <TravelDot begin={0} />
            <TravelDot begin={-4.7} />
            <TravelDot begin={-9.4} />
            {/* one redrafted dot riding the loop */}
            <circle r="2.6" fill="#92400e" opacity="0">
              <animateMotion
                dur={`${CYCLE}s`}
                repeatCount="indefinite"
                path={`M ${CX[3] - 10} ${GROUND_Y + 4} C ${CX[3] - 30} ${GROUND_Y + 58}, ${CX[2] + 30} ${GROUND_Y + 58}, ${CX[2] + 10} ${GROUND_Y + 8}`}
                calcMode="linear"
                keyPoints="0;0;1;1"
                keyTimes="0;0.56;0.66;1"
              />
              <animate
                attributeName="opacity"
                dur={`${CYCLE}s`}
                repeatCount="indefinite"
                values="0;0;1;1;0;0"
                keyTimes="0;0.56;0.575;0.645;0.66;1"
              />
            </circle>
          </g>
        )}
      </svg>
    </div>
  );
}
