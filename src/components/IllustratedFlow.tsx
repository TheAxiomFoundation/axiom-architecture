// Illustrated variant of the launch flow, with the CHART'S narrative beats
// kept intact: pages slide out of the publisher's portico and BREAK — their
// lines highlight amber and detach as dots (provisions) — then the dots
// travel the ground line, turn amber at the encoding lens, get checked at
// the four gates (one fails and rides the loop back), and at the sealed
// rulebook each dot splits into three, one per surface.

const CYCLE = 16;

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const GROUND_Y = 178;
const GROUND = `M 30 ${GROUND_Y} H 1390`;
const CX = [110, 340, 570, 800, 1030, 1280];

const STAGES = [
  { name: "A law is published", caption: "hundreds of official sites" },
  { name: "Captured & filed", caption: "1.7M+ provisions · fingerprinted" },
  { name: "Encoded", caption: "text becomes executable rules" },
  { name: "The four gates", caption: "run · checks · compare · review" },
  { name: "The rulebook", caption: "3,000+ rules · signed & citable" },
  { name: "Everywhere", caption: "web · API · AI agents" },
];

// ── the deterministic wave ───────────────────────────────────────────
// Two pages per cycle; each breaks into three dots. Constant speed:
// keyTimes derive from cumulative distance.
const PER_UNIT = 1 / 2300; // cycle-fraction per SVG unit of travel

const DOCS = [{ delay: 0.02 }, { delay: 0.34 }];
const LINE_STEP = 0.028;
const departAt = (doc: number, line: number) =>
  DOCS[doc].delay + 0.06 + line * LINE_STEP;

// break spot: where the page lands and dissolves (global coords)
const BREAK_X = 158;
const PAGE_W = 32;
const PAGE_H = 40;
const PAGE_TOP = GROUND_Y - PAGE_H - 6;
const lineY = (line: number) => PAGE_TOP + 10 + line * 9;

// surface targets for the broadcast (global coords)
const TARGETS: Array<[number, number]> = [
  [1250, 84], // browser
  [1250, 131], // terminal
  [1318, 98], // chat bubble
];

const BOOK_X = 1035;
const LENS_X = 570;
const PAST_GATES_X = 832;
const LOOP_FROM = 790;
const LOOP_TO = 580;
const LOOP_D = `M ${LOOP_FROM} ${GROUND_Y + 2} C ${LOOP_FROM - 20} ${GROUND_Y + 56}, ${LOOP_TO + 30} ${GROUND_Y + 56}, ${LOOP_TO} ${GROUND_Y + 4}`;

type Seg = { x: number; y: number; mode?: "C" | "loop" };

function journey(doc: number, line: number, loops: boolean) {
  const start = departAt(doc, line);
  const segs: Seg[] = [
    { x: BREAK_X + PAGE_W / 2 + 2, y: lineY(line) },
    { x: 190, y: GROUND_Y, mode: "C" },
    { x: LENS_X, y: GROUND_Y },
    ...(loops
      ? ([
          { x: LOOP_FROM, y: GROUND_Y },
          { x: LOOP_TO, y: GROUND_Y, mode: "loop" },
          { x: PAST_GATES_X, y: GROUND_Y },
        ] as Seg[])
      : ([{ x: PAST_GATES_X, y: GROUND_Y }] as Seg[])),
    { x: BOOK_X, y: GROUND_Y },
  ];
  let path = `M ${segs[0].x} ${segs[0].y}`;
  const dists = [0];
  for (let i = 1; i < segs.length; i++) {
    const p = segs[i - 1];
    const q = segs[i];
    if (q.mode === "loop") {
      path += ` C ${LOOP_FROM - 20} ${GROUND_Y + 56}, ${LOOP_TO + 30} ${GROUND_Y + 56}, ${q.x} ${q.y}`;
      dists.push(300);
    } else if (q.mode === "C") {
      const m = (p.x + q.x) / 2;
      path += ` C ${m} ${p.y}, ${m} ${q.y}, ${q.x} ${q.y}`;
      dists.push(Math.hypot(q.x - p.x, q.y - p.y) * 1.1);
    } else {
      path += ` L ${q.x} ${q.y}`;
      dists.push(Math.abs(q.x - p.x) + Math.abs(q.y - p.y));
    }
  }
  let cum = 0;
  const total = dists.reduce((a, b) => a + b, 0);
  const fractions: number[] = [];
  const times: number[] = [];
  for (const d of dists) {
    cum += d;
    fractions.push(cum / total);
    times.push(Math.min(start + cum * PER_UNIT, 0.99));
  }
  // times index of interest: lens = seg index 2; past gates = second-to-last
  const amberAt = times[2];
  const greenAt = times[times.length - 2];
  const arrival = times[times.length - 1];
  return {
    path,
    keyTimes: [0, ...times, 1].join(";"),
    keyPoints: [0, ...fractions, 1].join(";"),
    start,
    amberAt,
    greenAt,
    arrival,
    gatesAt: loops ? [times[2] + (LOOP_FROM - LENS_X) * PER_UNIT, times[5]] : [times[2] + (PAST_GATES_X - LENS_X) * PER_UNIT],
  };
}

function WaveDot({ doc, line, loops }: { doc: number; line: number; loops: boolean }) {
  const j = journey(doc, line, loops);
  return (
    <g>
      <circle r="3.2" fill="#78716c" opacity="0">
        <animateMotion
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          path={j.path}
          calcMode="linear"
          keyPoints={j.keyPoints}
          keyTimes={j.keyTimes}
        />
        <animate
          attributeName="opacity"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          values="0;0;1;1;0;0"
          keyTimes={`0;${j.start};${j.start + 0.012};${j.arrival};${j.arrival + 0.008};1`}
        />
        <animate
          attributeName="fill"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          calcMode="discrete"
          values="#78716c;#92400e;#166534"
          keyTimes={`0;${j.amberAt};${j.greenAt}`}
        />
      </circle>
      {/* the broadcast: the sealed rule reaches all three surfaces */}
      {TARGETS.map(([tx, ty], k) => {
        const m = (BOOK_X + tx) / 2;
        const bp = `M ${BOOK_X} ${GROUND_Y - 2} C ${m} ${GROUND_Y - 2}, ${m} ${ty}, ${tx} ${ty}`;
        const dur = (Math.hypot(tx - BOOK_X, ty - GROUND_Y) * 1.15) * PER_UNIT;
        const t1 = Math.min(j.arrival + dur, 0.995);
        return (
          <circle r="2.4" fill="#166534" opacity="0" key={k}>
            <animateMotion
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              path={bp}
              calcMode="linear"
              keyPoints="0;0;1;1"
              keyTimes={`0;${j.arrival};${t1};1`}
            />
            <animate
              attributeName="opacity"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              values="0;0;1;1;0;0"
              keyTimes={`0;${j.arrival};${Math.min(j.arrival + 0.006, t1)};${t1};${Math.min(t1 + 0.01, 0.998)};1`}
            />
          </circle>
        );
      })}
    </g>
  );
}

// a page that slides from the portico to the break spot, then dissolves —
// line by line, each highlighted line becoming one of the wave's dots
function BreakingPage({ doc }: { doc: number }) {
  const d = DOCS[doc].delay;
  const gone = departAt(doc, 2) + 0.035;
  const px = BREAK_X - PAGE_W / 2;
  const slide = `${-46} ${-34};${-46} ${-34};0 0;0 0`;
  const slideTimes = `0;${d};${d + 0.03};1`;
  const fadeTimes = `0;${d};${d + 0.015};${gone};${gone + 0.02};1`;
  return (
    <g>
      <animateTransform
        attributeName="transform"
        type="translate"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        calcMode="linear"
        values={slide}
        keyTimes={slideTimes}
      />
      {/* the sheet behind: this is a stack of pages, not a single leaf */}
      <rect className="ill-paper ill-line" x={px + 4} y={PAGE_TOP - 4} width={PAGE_W} height={PAGE_H} rx="2" strokeWidth="1.4">
        <animate attributeName="opacity" dur={`${CYCLE}s`} repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={fadeTimes} />
      </rect>
      <rect className="ill-paper ill-line" x={px} y={PAGE_TOP} width={PAGE_W} height={PAGE_H} rx="2" strokeWidth="1.4">
        <animate attributeName="opacity" dur={`${CYCLE}s`} repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={fadeTimes} />
      </rect>
      {[0, 1, 2].map((line) => {
        const dep = departAt(doc, line);
        return (
          <g key={line}>
            <line
              className="ill-ink"
              x1={px + 5}
              x2={px + PAGE_W - 5}
              y1={lineY(line)}
              y2={lineY(line)}
            >
              <animate
                attributeName="opacity"
                dur={`${CYCLE}s`}
                repeatCount="indefinite"
                values="0;0;1;1;0;0"
                keyTimes={`0;${d};${d + 0.015};${dep};${dep + 0.008};1`}
              />
            </line>
            {/* the amber highlight right before the line becomes a dot */}
            <line
              className="ill-accent-line"
              strokeWidth="4"
              strokeLinecap="round"
              x1={px + 5}
              x2={px + PAGE_W - 5}
              y1={lineY(line)}
              y2={lineY(line)}
            >
              <animate
                attributeName="opacity"
                dur={`${CYCLE}s`}
                repeatCount="indefinite"
                values="0;0;0.9;0.9;0;0"
                keyTimes={`0;${dep - 0.025};${dep - 0.01};${dep + 0.004};${dep + 0.014};1`}
              />
            </line>
          </g>
        );
      })}
    </g>
  );
}

export function IllustratedFlow() {
  return (
    <div className="ill__wrap">
      <svg
        className="ill"
        viewBox="0 0 1420 300"
        role="img"
        aria-label="Illustrated flow: pages emerge from the publisher and break into provisions; the dots are filed into the corpus, encoded at the lens, checked at four gates (failures loop back), sealed into the rulebook, and broadcast to the web, the API, and AI agents."
      >
        <path className="ill-ground" d={GROUND} />

        <path className="ill-loop" d={LOOP_D} markerEnd="url(#ill-arr)" />
        <text className="ill-caption ill-caption--loop" x={(CX[2] + CX[3]) / 2} y={GROUND_Y + 70} textAnchor="middle">
          ↺ any failure — redrafted
        </text>

        <defs>
          <marker id="ill-arr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="rgba(146,64,14,0.75)" />
          </marker>
        </defs>

        {/* ── 1 · the publisher's portico ──────────────────────── */}
        <g className="ill-scene" transform={`translate(${CX[0] - 60}, 40)`}>
          <polygon className="ill-line" points="8,42 60,12 112,42" />
          <line className="ill-line" x1="14" y1="42" x2="106" y2="42" />
          {[30, 55, 80].map((x) => (
            <rect key={x} className="ill-line" x={x} y="48" width="11" height="60" />
          ))}
          <rect className="ill-line" x="10" y="108" width="100" height="9" />
        </g>
        {/* pages emerge and break into provisions */}
        {!REDUCED_MOTION && (
          <g>
            <BreakingPage doc={0} />
            <BreakingPage doc={1} />
          </g>
        )}

        {/* ── 2 · the archive cabinet ──────────────────────────── */}
        <g className="ill-scene" transform={`translate(${CX[1] - 60}, 46)`}>
          <rect className="ill-line" x="28" y="14" width="64" height="98" rx="3" />
          {[38, 60, 96].map((y) => (
            <line key={y} className="ill-line" x1="34" y1={y} x2="86" y2={y} />
          ))}
          {[26, 48, 104].map((y) => (
            <line key={y} className="ill-ink" x1="54" y1={y} x2="66" y2={y} />
          ))}
          <rect className="ill-paper ill-line" x="18" y="66" width="84" height="20" rx="2" />
          <line className="ill-ink" x1="52" y1="76" x2="68" y2="76" />
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
          <circle className="ill-line" cx="88" cy="40" r="17" fill="rgba(146,64,14,0.05)" />
          <line className="ill-line" x1="100" y1="53" x2="112" y2="66" strokeWidth="4" />
          {!REDUCED_MOTION && (
            <line className="ill-accent-line" x1="76" y1="41" x2="100" y2="41" strokeWidth="2.5">
              <animate attributeName="opacity" dur="3.5s" repeatCount="indefinite" values="0;1;0" keyTimes="0;0.5;1" />
            </line>
          )}
        </g>

        {/* ── 4 · the four gates ───────────────────────────────── */}
        <g className="ill-scene" transform={`translate(${CX[3] - 66}, 52)`}>
          {[0, 1, 2, 3].map((i) => {
            const x = 10 + i * 32;
            // two flash sequences per cycle: page-1 cohort + page-2 cohort
            const a = 0.30 + i * 0.02;
            const b = 0.62 + i * 0.02;
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
                      values="0;0;1;1;0;0;1;1;0;0"
                      keyTimes={`0;${a};${a + 0.015};${a + 0.1};${a + 0.13};${b};${b + 0.015};${b + 0.1};${b + 0.13};1`}
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

        {/* ── the wave: two pages, six provisions, one redraft ─── */}
        {!REDUCED_MOTION && (
          <g>
            <WaveDot doc={0} line={0} loops={false} />
            <WaveDot doc={0} line={1} loops={false} />
            <WaveDot doc={0} line={2} loops={true} />
            <WaveDot doc={1} line={0} loops={false} />
            <WaveDot doc={1} line={1} loops={false} />
            <WaveDot doc={1} line={2} loops={false} />
          </g>
        )}
      </svg>
    </div>
  );
}
