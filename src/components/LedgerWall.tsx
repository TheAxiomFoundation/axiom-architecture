// The Illuminated Ledger: the pipeline as ACCUMULATION, not flow.
//
// A Sankey narrows, and narrowing reads as loss. This view is built on the
// opposite grammar: nothing here ever leaves. Three registers:
//
//   THE WALL     the corpus — a mosaic of cells, one column per
//                jurisdiction, fed from above by hundreds of feeds. An
//                amber scanline sweeps the wall every cycle: WE ENCODE
//                EVERYTHING — the grey cells aren't waste, they're the
//                queue, and the watermark across them says so.
//   THE GATES    four named stations a provision-copy falls through, each
//                with its own meaning — run (it executes), checks (50+
//                automated), compare (±$0.01 vs independent calculators),
//                review (independent sign-off). A failure bounces back up
//                (the redraft), then passes. Each gate flashes green as
//                the copy clears it.
//   THE APPS     the rulebook shelf feeds three real surfaces — a browser,
//                a terminal, an AI chat — each quoting the same answer.
//
// Text is one caption per register plus the gates' own meanings; the
// counts are real.

const CYCLE = 16;

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const STATIC = REDUCED_MOTION;

const INK = "var(--color-ink)";
const WAX = "var(--color-accent)";
const OK = "var(--color-success)";

// ── geometry ──────────────────────────────────────────────────────────

const PITCH = 13;
const WALL = { x: 72, y: 58, cols: 98, rows: 22 };
const WALL_W = WALL.cols * PITCH; // 1274
const WALL_H = WALL.rows * PITCH; // 286
const WALL_B = WALL.y + WALL_H; // 344

const COLS = [
  { label: "eCFR", feeds: 5, cells: 9 },
  { label: "US Code", feeds: 7, cells: 8 },
  { label: "Guidance", feeds: 14, cells: 7 },
  { label: "State codes", feeds: 51, cells: 43 },
  { label: "UK", feeds: 5, cells: 13 },
  { label: "Canada", feeds: 4, cells: 11 },
  { label: "Belgium", feeds: 3, cells: 7 },
];
let cum = 0;
const COL_X = COLS.map((c) => {
  const x0 = WALL.x + cum * PITCH;
  cum += c.cells;
  return { ...c, x0, x1: WALL.x + cum * PITCH, cx: x0 + (c.cells * PITCH) / 2 };
});

// cells already encoded & verified (cell coords)
const FLECKS: ReadonlyArray<readonly [number, number]> = [
  [2, 19], [4, 21], [6, 18], [3, 15], [7, 20],
  [10, 20], [12, 18], [14, 21], [11, 16], [15, 19], [13, 14],
  [18, 19], [20, 21], [22, 17],
  [26, 20], [29, 18], [33, 21], [37, 19], [41, 20], [45, 17], [49, 21],
  [53, 19], [57, 20], [61, 18], [64, 21], [31, 15], [43, 14], [55, 16],
  [27, 12], [59, 13],
  [69, 20], [73, 18], [77, 21],
  [82, 19], [86, 20],
  [93, 20],
];

// cells the scan lights up THIS cycle, as it passes them
const IGNITE: ReadonlyArray<readonly [number, number]> = [
  [21, 13], [49, 20], [84, 16],
];

// the scan sweeps the wall over the first phase of the cycle
const SCAN_END = 0.44;
const scanAt = (col: number) => ((col + 0.5) / WALL.cols) * SCAN_END;

// new law arriving from the feeds
const ARRIVALS = [
  { cell: 36, at: 0.05 },
  { cell: 4, at: 0.3 },
  { cell: 74, at: 0.55 },
];

// the gates: each one NAMED, with its own meaning
const CH_X = 710; // drop channel x
const GATES = [
  { label: "run", detail: "it executes", y: 374 },
  { label: "checks", detail: "50+ automated checks", y: 398 },
  { label: "compare", detail: "±$0.01 vs independent calculators", y: 422 },
  { label: "review", detail: "independent sign-off", y: 446 },
];
const RAIL_X0 = 560;
const RAIL_X1 = 880;

// the shelf: one cell = 10 rules → 332 ≈ 3,323
const SHELF = { x: 72, y: 470, pitch: 6, rows: 4, cells: 332 };
const SHELF_COLS = Math.ceil(SHELF.cells / SHELF.rows);
const SHELF_FILL_W = SHELF_COLS * SHELF.pitch; // 498
const SHELF_H = SHELF.rows * SHELF.pitch; // 24
const EDGE_X = SHELF.x + SHELF_FILL_W;

// the drop: triggered as the scan crosses its column (col 49 → ~0.22)
const T = {
  ring: 0.2,
  depart: 0.24,
  rail: [0.3, 0.36, 0.42], // run ✓, checks ✓, compare ✗
  bounceTop: 0.47,
  rail2: [0.54, 0.6], // compare ✓, review ✓
  land: 0.66,
  apps: [0.7, 0.74, 0.78],
  clear: 0.94,
};
const SRC_CELL: [number, number] = [49, 20];

// the applications — real surfaces, not chips
const DEV = { y: 512, h: 76, w: 230 };
const DEVICES = [
  { label: "web", x: 250 },
  { label: "api", x: 645 },
  { label: "ai agents", x: 1040 },
];

// ── SMIL helpers ──────────────────────────────────────────────────────

function Vis({ a, b, r = 0.012, max = 1 }: { a: number; b: number; r?: number; max?: number }) {
  if (STATIC) return null;
  return (
    <animate
      attributeName="opacity"
      dur={`${CYCLE}s`}
      repeatCount="indefinite"
      values={`0;0;${max};${max};0;0`}
      keyTimes={`0;${a};${Math.min(a + r, b)};${b};${Math.min(b + r, 0.999)};1`}
    />
  );
}

const O = (visibleWhenStatic = true) => (STATIC ? (visibleWhenStatic ? 1 : 0) : 0);

function cellRect(col: number, row: number, inset = 1.5) {
  return {
    x: WALL.x + col * PITCH + inset,
    y: WALL.y + row * PITCH + inset,
    w: PITCH - inset * 2,
    h: PITCH - inset * 2,
  };
}

// ── the wall ──────────────────────────────────────────────────────────

function Feeds() {
  return (
    <g>
      {COL_X.map((c) => (
        <g key={c.label}>
          <text className="lw-collabel" x={c.cx} y="34" textAnchor="middle">
            {c.label}
          </text>
          {Array.from({ length: c.feeds }, (_, i) => {
            const pad = 8;
            const span = c.x1 - c.x0 - pad * 2;
            const x = c.feeds === 1 ? c.cx : c.x0 + pad + (i * span) / (c.feeds - 1);
            return <line key={i} className="lw-feed" x1={x} y1={42} x2={x} y2={50} />;
          })}
        </g>
      ))}
    </g>
  );
}

function Wall() {
  return (
    <g>
      <rect x={WALL.x} y={WALL.y} width={WALL_W} height={WALL_H} fill="url(#lw-cell)" />
      {COL_X.slice(1).map((c) => (
        <line
          key={c.label}
          x1={c.x0}
          y1={WALL.y - 2}
          x2={c.x0}
          y2={WALL_B + 2}
          stroke="var(--color-paper)"
          strokeWidth="3"
        />
      ))}
      <rect
        x={WALL.x - 3}
        y={WALL.y - 3}
        width={WALL_W + 6}
        height={WALL_H + 6}
        fill="none"
        stroke={INK}
        strokeWidth="1"
        opacity="0.5"
      />
      {/* the promise, written across the queue itself */}
      <text className="lw-watermark" x={WALL.x + WALL_W / 2} y="242" textAnchor="middle">
        the goal: every cell, executable
      </text>
      {FLECKS.map(([col, row]) => {
        const r = cellRect(col, row, 3.5);
        return (
          <rect key={`${col}-${row}`} className="lw-fleck" x={r.x} y={r.y} width={r.w} height={r.h} rx="1" />
        );
      })}
      {IGNITE.map(([col, row]) => {
        const r = cellRect(col, row, 3.5);
        const at = scanAt(col);
        return (
          <rect key={`i${col}-${row}`} className="lw-fleck" x={r.x} y={r.y} width={r.w} height={r.h} rx="1" opacity={O(false)}>
            {!STATIC && (
              <animate
                attributeName="opacity"
                dur={`${CYCLE}s`}
                repeatCount="indefinite"
                values="0;0;1;1;0;0"
                keyTimes={`0;${at};${at + 0.015};${T.clear};0.985;1`}
              />
            )}
          </rect>
        );
      })}
      <text className="lw-caption" x={WALL.x} y="360">
        <tspan className="lw-caption--strong">THE CORPUS — 1,742,391 provisions</tspan>
        {"   ·   one cell ≈ 800   ·   nothing ever leaves"}
      </text>
      <g>
        <rect x={WALL.x + WALL_W - 76} y={352} width={6} height={6} rx="1" fill="rgba(22,101,52,0.8)" />
        <text className="lw-caption" x={WALL.x + WALL_W - 64} y="359">
          encoded
        </text>
      </g>
    </g>
  );
}

// the scanline: we encode EVERYTHING — the sweep never stops
function Scan() {
  if (STATIC) {
    return (
      <line x1={CH_X} y1={WALL.y - 4} x2={CH_X} y2={WALL_B + 4} stroke={WAX} strokeWidth="1.6" opacity="0.8" />
    );
  }
  return (
    <g>
      <rect x={-14} y={WALL.y - 4} width="14" height={WALL_H + 8} fill="url(#lw-scanwake)" opacity="0">
        <animateTransform
          attributeName="transform"
          type="translate"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          calcMode="linear"
          values={`${WALL.x} 0;${WALL.x} 0;${WALL.x + WALL_W + 14} 0;${WALL.x + WALL_W + 14} 0`}
          keyTimes={`0;0.002;${SCAN_END};1`}
        />
        <Vis a={0.004} b={SCAN_END - 0.004} r={0.008} max={1} />
      </rect>
      <line x1={0} y1={WALL.y - 4} x2={0} y2={WALL_B + 4} stroke={WAX} strokeWidth="1.6" opacity="0">
        <animateTransform
          attributeName="transform"
          type="translate"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          calcMode="linear"
          values={`${WALL.x} 0;${WALL.x} 0;${WALL.x + WALL_W} 0;${WALL.x + WALL_W} 0`}
          keyTimes={`0;0.002;${SCAN_END};1`}
        />
        <Vis a={0.004} b={SCAN_END - 0.004} r={0.008} max={0.9} />
      </line>
    </g>
  );
}

function Arrivals() {
  return (
    <g>
      {ARRIVALS.map(({ cell, at }) => {
        const r = cellRect(cell, 0);
        const dripX = r.x + r.w / 2;
        return (
          <g key={cell}>
            <line className="lw-drip" x1={dripX} y1={50} x2={dripX} y2={WALL.y} opacity={O(false)}>
              <Vis a={at - 0.012} b={at + 0.03} />
            </line>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="1" fill={WAX} opacity={O(false)}>
              {!STATIC && (
                <animate
                  attributeName="opacity"
                  dur={`${CYCLE}s`}
                  repeatCount="indefinite"
                  values="0;0;1;1;0.3;0.3;0;0"
                  keyTimes={`0;${at};${at + 0.012};${at + 0.05};${at + 0.09};${T.clear};0.985;1`}
                />
              )}
            </rect>
          </g>
        );
      })}
    </g>
  );
}

const XREFS = [
  "M 240 92 C 260 72, 300 72, 322 90",
  "M 338 116 C 356 100, 384 100, 402 114",
  "M 236 140 C 320 180, 480 180, 560 142",
];

function CrossRefs() {
  return (
    <g opacity={O()}>
      {!STATIC && <Vis a={0.08} b={T.clear} r={0.03} />}
      {XREFS.map((d) => (
        <path key={d} className="lw-xref" d={d} markerEnd="url(#lw-arr)" />
      ))}
      <text className="lw-xref-label" x="588" y="130">
        implements · interprets · cites
      </text>
    </g>
  );
}

// ── the gates ─────────────────────────────────────────────────────────
// four NAMED stations. Each flashes green the moment the copy clears it.

function Gates() {
  return (
    <g>
      <text className="lw-gatetitle" x={(RAIL_X0 + RAIL_X1) / 2} y="364" textAnchor="middle">
        THE FOUR GATES
      </text>
      {GATES.map(({ label, detail, y }, i) => {
        const gap = 9;
        const passAt = i < 2 ? T.rail[i] : i === 2 ? T.rail2[0] : T.rail2[1];
        return (
          <g key={label}>
            {[
              { x: RAIL_X0, w: CH_X - gap - RAIL_X0 },
              { x: CH_X + gap, w: RAIL_X1 - CH_X - gap },
            ].map(({ x, w }) => (
              <rect key={x} className="lw-rail" x={x} y={y} width={w} height="7" rx="2.5">
                {!STATIC && (
                  <animate
                    attributeName="fill"
                    dur={`${CYCLE}s`}
                    repeatCount="indefinite"
                    calcMode="discrete"
                    values="#1c1917;#166534;#1c1917"
                    keyTimes={`0;${passAt};${Math.min(passAt + 0.035, 0.99)}`}
                  />
                )}
              </rect>
            ))}
            <text className="lw-gatelabel" x={RAIL_X0 - 12} y={y + 7} textAnchor="end">
              {label}
            </text>
            <text className="lw-gatedetail" x={RAIL_X1 + 14} y={y + 7}>
              {detail}
            </text>
            <text className="lw-check" x={CH_X + 22} y={y + 9} textAnchor="middle" opacity={O(false)}>
              ✓
              <Vis a={passAt} b={passAt + 0.05} />
            </text>
            {i === 2 && (
              <>
                <text className="lw-x" x={CH_X - 22} y={y + 9} textAnchor="middle" opacity={O(false)}>
                  ✗
                  <Vis a={T.rail[2]} b={T.rail[2] + 0.05} />
                </text>
                <text className="lw-redraft" x={CH_X - 34} y={y - 13} textAnchor="end" opacity={O(false)}>
                  redrafted
                  <Vis a={T.rail[2]} b={T.rail2[0]} />
                </text>
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}

function TheDrop() {
  const src = cellRect(SRC_CELL[0], SRC_CELL[1]);
  const sx = src.x + src.w / 2;
  const sy = src.y + src.h / 2;
  const landX = EDGE_X + SHELF.pitch / 2;
  const landY = SHELF.y + SHELF.pitch / 2;
  if (STATIC) {
    return (
      <g>
        <rect x={src.x - 2} y={src.y - 2} width={src.w + 4} height={src.h + 4} rx="2" fill="none" stroke={WAX} strokeWidth="1.4" />
        <circle cx={CH_X} cy={GATES[1].y - 8} r="4" fill={WAX} />
      </g>
    );
  }
  const path =
    `M ${sx} ${sy} L ${CH_X} ${GATES[0].y - 6} L ${CH_X} ${GATES[1].y - 6} ` +
    `L ${CH_X} ${GATES[2].y - 6} L ${CH_X} ${GATES[1].y + 12} ` +
    `L ${CH_X} ${GATES[2].y - 6} L ${CH_X} ${GATES[3].y - 6} L ${CH_X} ${GATES[3].y + 16} ` +
    `C ${CH_X - 60} ${SHELF.y + 4}, ${landX + 80} ${landY - 20}, ${landX} ${landY}`;
  const times = [
    0, T.depart,
    T.rail[0] - 0.004, T.rail[1] - 0.004, T.rail[2] - 0.004,
    T.bounceTop,
    T.rail2[0] - 0.004, T.rail2[1] - 0.004, T.rail2[1] + 0.02,
    T.land, 1,
  ];
  const pts = [0, 0, 0.14, 0.28, 0.42, 0.54, 0.66, 0.78, 0.84, 1, 1];
  return (
    <g>
      <rect x={src.x - 2} y={src.y - 2} width={src.w + 4} height={src.h + 4} rx="2" fill="none" stroke={WAX} strokeWidth="1.4" opacity="0">
        <Vis a={T.ring} b={T.depart + 0.06} />
      </rect>
      <circle r="4" fill={WAX} opacity="0">
        <animateMotion
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          path={path}
          calcMode="linear"
          keyPoints={pts.join(";")}
          keyTimes={times.join(";")}
        />
        <animate
          attributeName="opacity"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          values="0;0;1;1;0;0"
          keyTimes={`0;${T.depart};${T.depart + 0.01};${T.land};${T.land + 0.01};1`}
        />
        <animate
          attributeName="fill"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          calcMode="discrete"
          values="#92400e;#92400e;#166534"
          keyTimes={`0;${T.rail2[1]};${T.rail2[1] + 0.001}`}
        />
      </circle>
    </g>
  );
}

// ── the shelf ─────────────────────────────────────────────────────────

function Shelf() {
  return (
    <g>
      <text className="lw-caption" x={SHELF.x} y={SHELF.y - 8}>
        <tspan className="lw-caption--strong">THE RULEBOOK — 3,323 rules</tspan>
        {"   ·   one cell = 10   ·   growing weekly →"}
      </text>
      <rect
        x={SHELF.x - 3}
        y={SHELF.y - 3}
        width={WALL_W + 6}
        height={SHELF_H + 6}
        fill="none"
        stroke={INK}
        strokeWidth="1"
        opacity="0.35"
        strokeDasharray="4 3"
      />
      <rect x={SHELF.x} y={SHELF.y} width={SHELF_FILL_W} height={SHELF_H} fill="url(#lw-rulecell)" />
      <rect x={EDGE_X + 1} y={SHELF.y + 1} width={SHELF.pitch - 2} height={SHELF.pitch - 2} rx="1" fill={OK} opacity={O(false)}>
        <Vis a={T.land} b={T.clear} />
      </rect>
      <text className="lw-plus" x={EDGE_X + 14} y={SHELF.y + 14} opacity={O(false)}>
        +1
        <Vis a={T.land} b={T.land + 0.08} />
      </text>
    </g>
  );
}

// ── the applications ──────────────────────────────────────────────────

function Browser({ x }: { x: number }) {
  const y = DEV.y;
  return (
    <g filter="url(#lw-shadow)">
      <rect x={x} y={y} width={DEV.w} height={DEV.h} rx="5" fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="1" />
      <path d={`M ${x} ${y + 18} H ${x + DEV.w}`} stroke={INK} strokeWidth="0.7" opacity="0.5" />
      <circle cx={x + 11} cy={y + 9} r="2.2" fill="none" stroke={INK} strokeWidth="0.7" opacity="0.6" />
      <circle cx={x + 19} cy={y + 9} r="2.2" fill="none" stroke={INK} strokeWidth="0.7" opacity="0.6" />
      <rect x={x + 30} y={y + 5} width={DEV.w - 44} height="8" rx="4" fill="none" stroke={INK} strokeWidth="0.5" opacity="0.4" />
      <text className="lw-devserif" x={x + 16} y={y + 46}>“Your allotment: $478/mo.”</text>
      <line x1={x + 16} y1={y + 58} x2={x + 96} y2={y + 58} stroke={WAX} strokeWidth="2" />
    </g>
  );
}

function Terminal({ x }: { x: number }) {
  const y = DEV.y;
  return (
    <g filter="url(#lw-shadow)">
      <rect x={x} y={y} width={DEV.w} height={DEV.h} rx="5" fill={INK} />
      <text className="lw-term" x={x + 16} y={y + 30}>{"> snap(household)"}</text>
      <text className="lw-term lw-term--answer" x={x + 16} y={y + 52}>{"→ 478 ▌"}</text>
    </g>
  );
}

function AgentBubble({ x }: { x: number }) {
  const y = DEV.y;
  return (
    <g filter="url(#lw-shadow)">
      <path
        d={`M ${x + 8} ${y} h ${DEV.w - 16} a8 8 0 0 1 8 8 v ${DEV.h - 34} a8 8 0 0 1 -8 8 h -${DEV.w - 96} l -14 16 v -16 h -${DEV.w - 110} a8 8 0 0 1 -8 -8 v -${DEV.h - 34} a8 8 0 0 1 8 -8 Z`}
        fill="var(--color-paper-elevated)"
        stroke={INK}
        strokeWidth="1"
      />
      <text className="lw-devmono" x={x + 18} y={y + 28}>…your allotment is $478,</text>
      <text className="lw-devmono" x={x + 18} y={y + 44}>
        {"per 7 U.S.C. § 2017(a) "}
        <tspan fill={OK}>✓</tspan>
      </text>
    </g>
  );
}

function Apps() {
  return (
    <g>
      {DEVICES.map(({ label, x }, i) => {
        const at = T.apps[i];
        const devCx = x + DEV.w / 2;
        return (
          <g key={label}>
            <line
              className="lw-stem"
              x1={devCx}
              y1={SHELF.y + SHELF_H + 4}
              x2={devCx}
              y2={DEV.y - 2}
            />
            <circle cx={devCx} cy={DEV.y - 2} r="2.6" fill={OK} opacity={O(false)}>
              <Vis a={at} b={T.clear} />
            </circle>
          </g>
        );
      })}
      <Browser x={DEVICES[0].x} />
      <Terminal x={DEVICES[1].x} />
      <AgentBubble x={DEVICES[2].x} />
    </g>
  );
}

// ── defs & assembly ───────────────────────────────────────────────────

function Defs() {
  return (
    <defs>
      <pattern id="lw-cell" width={PITCH} height={PITCH} patternUnits="userSpaceOnUse">
        <rect x="1.5" y="1.5" width={PITCH - 3} height={PITCH - 3} rx="1" fill="rgba(28,25,23,0.09)" />
      </pattern>
      <pattern id="lw-rulecell" width={SHELF.pitch} height={SHELF.pitch} patternUnits="userSpaceOnUse">
        <rect x="1" y="1" width={SHELF.pitch - 2} height={SHELF.pitch - 2} rx="1" fill="rgba(22,101,52,0.55)" />
      </pattern>
      <linearGradient id="lw-scanwake" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="rgba(146,64,14,0)" />
        <stop offset="1" stopColor="rgba(146,64,14,0.18)" />
      </linearGradient>
      <marker id="lw-arr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5.5" markerHeight="5.5" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill="rgba(146,64,14,0.7)" />
      </marker>
      <filter id="lw-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1c1917" floodOpacity="0.22" />
      </filter>
    </defs>
  );
}

export function LedgerWall() {
  return (
    <div className="lsk__wrap">
      <svg
        className="lsk"
        viewBox="0 0 1420 620"
        role="img"
        aria-label="The illuminated ledger: the corpus drawn as a wall of cells — one column per jurisdiction, fed from above by hundreds of official feeds, cross-references arcing between columns. Nothing ever leaves the wall. An amber scanline sweeps the whole wall every cycle — the goal, written across the un-encoded cells, is every cell executable. As the scan crosses one cell, a provision-copy falls through the four named gates — run (it executes), checks (50+ automated), compare (agreement within one cent against independent calculators), review (independent sign-off); the failure at compare bounces back up, is redrafted, and passes, each gate flashing green as it clears — then lands on the rulebook shelf, which grows by one. Below, three real surfaces draw from the shelf and quote the same answer: a browser shows your allotment is $478 a month, a terminal returns 478 from snap(household), and an AI agent cites 7 U.S.C. § 2017(a)."
      >
        <Defs />
        <Feeds />
        <Wall />
        <Scan />
        <Arrivals />
        <CrossRefs />
        <Gates />
        <TheDrop />
        <Shelf />
        <Apps />
      </svg>
    </div>
  );
}
