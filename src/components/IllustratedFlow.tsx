// The illustrated launch story: one continuously evolving film, read left
// to right. Three sources publish documents; they cross-reference each
// other and the siblings are filed into the corpus. The hero document is
// then encoded SECTION BY SECTION — each section producing its own
// rulespec file. The three files travel right through the four gates
// (one fails at compare and is redrafted in place), stack into the sealed
// rulebook, and copies fly out to the browser, the API, and the AI agent.
// One SMIL clock drives everything; the loop is seamless.

const CYCLE = 28;

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CXC = 710; // caption center
const DOC = { x: 450, y: 245 }; // hero document center stage
const BOOK = { x: 1120, y: 245 };

// phase windows (fractions of the cycle)
const P = {
  pub: [0.005, 0.115],
  cap: [0.115, 0.24],
  enc: [0.24, 0.42],
  gates: [0.42, 0.66],
  seal: [0.66, 0.78],
  every: [0.78, 0.95],
} as const;

const CAPTIONS = [
  { w: P.pub, name: "Laws are published", sub: "statutes · regulations · guidance — hundreds of official sites" },
  { w: P.cap, name: "Captured & filed", sub: "cross-referenced, fingerprinted, stored in the corpus · 1.7M+ provisions" },
  { w: P.enc, name: "Encoded, section by section", sub: "every section becomes its own rulespec file" },
  { w: P.gates, name: "The four gates", sub: "run · checks · compare · review — failures are redrafted" },
  { w: P.seal, name: "Sealed into the rulebook", sub: "3,000+ rules · signed & citable" },
  { w: P.every, name: "Everywhere", sub: "web · API · AI agents" },
];

// paper halo so small labels stay legible over linework
const HALO: React.CSSProperties = {
  paintOrder: "stroke",
  stroke: "var(--color-paper)",
  strokeWidth: 5,
  strokeLinejoin: "round",
};

// opacity window helper: fade in over [a, a+r], out over [b, b+r]
function Vis({ a, b, r = 0.012, max = 1 }: { a: number; b: number; r?: number; max?: number }) {
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

// repeated-flash helper: opacity pulses at each time in `ts`
function Flash({ ts, hold = 0.022 }: { ts: number[]; hold?: number }) {
  const vals: number[] = [0];
  const times: number[] = [0];
  for (const t of ts) {
    vals.push(0, 1, 1, 0);
    times.push(t, t + 0.006, t + hold, t + hold + 0.01);
  }
  vals.push(0);
  times.push(1);
  return (
    <animate
      attributeName="opacity"
      dur={`${CYCLE}s`}
      repeatCount="indefinite"
      values={vals.join(";")}
      keyTimes={times.join(";")}
    />
  );
}

// keyframed translate+scale rider
function Ride({
  stops,
  scales,
  times,
}: {
  stops: ReadonlyArray<readonly [number, number]>;
  scales: number[];
  times: number[];
}) {
  return (
    <>
      <animateTransform
        attributeName="transform"
        type="translate"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        calcMode="linear"
        values={stops.map(([x, y]) => `${x} ${y}`).join(";")}
        keyTimes={times.join(";")}
      />
      <animateTransform
        attributeName="transform"
        type="scale"
        additive="sum"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        calcMode="linear"
        values={scales.join(";")}
        keyTimes={times.join(";")}
      />
    </>
  );
}

// ── act one: the sources ──────────────────────────────────────────────

function Sources() {
  return (
    <g opacity="0">
      <Vis a={0.004} b={0.15} r={0.02} />
      {/* the legislature: portico with steps */}
      <g transform="translate(78, 52)">
        <polygon className="ill-line" points="8,44 62,10 116,44" />
        <polygon className="ill-line" points="20,40 62,17 104,40" fill="none" strokeWidth="1.2" opacity="0.6" />
        <line className="ill-line" x1="14" y1="44" x2="110" y2="44" />
        {[28, 45, 62, 79].map((x) => (
          <rect key={x} className="ill-line" x={x} y="50" width="10" height="56" />
        ))}
        <rect className="ill-line" x="14" y="106" width="96" height="7" />
        <rect className="ill-line" x="8" y="113" width="108" height="7" />
        <text className="ill-caption" x="62" y="138" textAnchor="middle">legislature</text>
      </g>
      {/* the agency: office block with a flag */}
      <g transform="translate(94, 212)">
        <line className="ill-line" x1="24" y1="10" x2="24" y2="-12" strokeWidth="1.6" />
        <polygon className="ill-accent-fill" points="24,-12 42,-8 24,-3" opacity="0.85" />
        <rect className="ill-line" x="8" y="10" width="80" height="72" rx="2" />
        <line className="ill-line" x1="2" y1="10" x2="94" y2="10" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <rect key={`${r}${c}`} className="ill-ink" x={20 + c * 23} y={20 + r * 16} width="11" height="8" strokeWidth="0" opacity="0.5" />
          ))
        )}
        <rect className="ill-line" x="40" y="68" width="16" height="14" />
        <text className="ill-caption" x="48" y="104" textAnchor="middle">agency</text>
      </g>
      {/* the register: an open gazette with a masthead */}
      <g transform="translate(86, 356)">
        <path className="ill-paper" d="M 6 12 C 22 6, 40 6, 50 12 C 60 6, 78 6, 94 12 V 68 C 78 62, 60 62, 50 68 C 40 62, 22 62, 6 68 Z" />
        <line className="ill-line" x1="50" y1="12" x2="50" y2="68" strokeWidth="1.4" />
        <line className="ill-ink" strokeWidth="2.8" x1="14" y1="22" x2="42" y2="22" />
        {[32, 40, 48, 56].map((y) => (
          <line key={y} className="ill-ink" x1="14" y1={y} x2="42" y2={y} strokeWidth="1.1" />
        ))}
        {[22, 32, 40, 48, 56].map((y) => (
          <line key={y} className="ill-ink" x1="58" y1={y} x2="86" y2={y} strokeWidth="1.1" />
        ))}
        <text className="ill-caption" x="50" y="92" textAnchor="middle">register</text>
      </g>
    </g>
  );
}

// ── act two: the corpus and the sibling documents ─────────────────────

// four-drawer archive, second drawer open with hanging file tabs
function Corpus() {
  return (
    <g opacity="0" transform="translate(222, 190)">
      <Vis a={0.108} b={0.255} r={0.018} />
      <rect className="ill-line" x="0" y="0" width="86" height="120" rx="3" />
      {[30, 62, 92].map((y) => (
        <line key={y} className="ill-line" x1="6" y1={y} x2="80" y2={y} />
      ))}
      {[15, 106].map((y) => (
        <line key={y} className="ill-ink" x1="34" y1={y} x2="52" y2={y} strokeWidth="2" />
      ))}
      {/* the open drawer, hanging files inside */}
      <rect className="ill-paper" x="-13" y="34" width="112" height="26" rx="2" />
      {[10, 40, 70].map((x) => (
        <path key={x} className="ill-ink" d={`M ${x} 42 h 16`} strokeWidth="1.6" />
      ))}
      <line className="ill-ink" x1="34" y1="52" x2="52" y2="52" strokeWidth="2" />
      <text className="ill-caption" x="43" y="140" textAnchor="middle">the corpus</text>
    </g>
  );
}

const SIBLINGS = [
  {
    origin: [142, 258] as const, // agency
    flank: [330, 150] as const,
    label: "cites § 42",
    labelPos: [330, 114] as const,
    appear: 0.028,
    arrive: 0.098,
    leave: 0.19,
    filed: 0.226,
  },
  {
    origin: [136, 396] as const, // register
    flank: [335, 340] as const,
    label: "amends § 42",
    labelPos: [335, 382] as const,
    appear: 0.04,
    arrive: 0.11,
    leave: 0.202,
    filed: 0.238,
  },
];
const DRAWER: [number, number] = [266, 237];

function SiblingDoc({ s }: { s: (typeof SIBLINGS)[number] }) {
  const [ox, oy] = s.origin;
  const [fx, fy] = s.flank;
  return (
    <g opacity="0">
      <Vis a={s.appear} b={s.filed - 0.004} r={0.014} />
      <Ride
        stops={[[ox, oy], [ox, oy], [fx, fy], [fx, fy], DRAWER, DRAWER]}
        scales={[0.3, 0.3, 0.62, 0.62, 0.18, 0.18]}
        times={[0, s.appear, s.arrive, s.leave, s.filed, 1]}
      />
      <rect className="ill-paper" x="-32" y="-42" width="64" height="84" rx="3" />
      <path className="ill-line" d="M 16 -42 V -28 H 32" fill="none" strokeWidth="1.4" opacity="0.6" />
      <line className="ill-ink" strokeWidth="2.2" x1="-22" y1="-28" x2="6" y2="-28" />
      {[-12, 2, 16, 30].map((y) => (
        <line key={y} className="ill-ink" x1="-22" y1={y} x2={y === 30 ? 8 : 22} y2={y} strokeWidth="1.4" />
      ))}
    </g>
  );
}

// the interaction beat: the documents cite and amend one another
function CrossRefs() {
  const on = 0.128;
  const off = 0.186;
  return (
    <g opacity="0">
      <animate
        attributeName="opacity"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        values="0;0;1;1;0;0"
        keyTimes={`0;${on};${on + 0.014};${off};${off + 0.012};1`}
      />
      <path className="ill-loop" d="M 353 162 C 372 172, 366 182, 362 194" markerEnd="url(#ill-ref-arr)" />
      <path className="ill-loop" d="M 358 326 C 374 318, 368 308, 363 297" markerEnd="url(#ill-ref-arr)" />
      {SIBLINGS.map((s) => (
        <text key={s.label} className="ill-caption ill-caption--loop" style={HALO} x={s.labelPos[0]} y={s.labelPos[1]} textAnchor="middle">
          {s.label}
        </text>
      ))}
    </g>
  );
}

// ── act three: the hero document, encoded section by section ──────────

const SECTIONS = [
  { key: "a", top: -66, scanAt: 0.293 },
  { key: "b", top: -16, scanAt: 0.333 },
  { key: "c", top: 34, scanAt: 0.373 },
];

function TheDocument() {
  return (
    <g opacity="0">
      <Ride
        stops={[[142, 116], [142, 116], [DOC.x, DOC.y], [DOC.x, DOC.y]]}
        scales={[0.18, 0.18, 1, 1]}
        times={[0, 0.015, 0.105, 1]}
      />
      <Vis a={0.006} b={0.44} r={0.015} />

      <rect className="ill-paper" x="-85" y="-105" width="170" height="210" rx="4" />
      <path className="ill-line" d="M 61 -105 V -81 H 85" fill="none" strokeWidth="1.4" opacity="0.6" />
      {/* title */}
      <line className="ill-ink" strokeWidth="2.6" x1="-65" y1="-88" x2="0" y2="-88" />
      <text className="ill-code" style={{ fontSize: "11px" }} x="30" y="-84">{"§ 42"}</text>

      {SECTIONS.map(({ key, top, scanAt }) => (
        <g key={key}>
          {/* the amber glow as the scan reaches this section */}
          <rect x="-72" y={top - 6} width="144" height="40" rx="4" fill="rgba(146,64,14,0.13)" opacity="0">
            <Flash ts={[scanAt - 0.008]} hold={0.03} />
          </rect>
          <text className="ill-code" style={{ fontSize: "9.5px" }} x="-65" y={top + 4}>{`§ 42(${key})`}</text>
          <line className="ill-ink" x1="-65" y1={top + 14} x2="62" y2={top + 14} strokeWidth="1.5" />
          <line className="ill-ink" x1="-65" y1={top + 26} x2="34" y2={top + 26} strokeWidth="1.5" />
        </g>
      ))}

      {/* fingerprint stamped at capture */}
      <g opacity="0">
        <Vis a={0.14} b={0.435} r={0.015} />
        {[4, 8, 12].map((r) => (
          <circle key={r} className="ill-accent-line" cx="58" cy="82" r={r} fill="none" />
        ))}
      </g>

      {/* the encoding scan: amber line + magnifier sweeping down the page */}
      <g opacity="0">
        <Vis a={0.258} b={0.402} r={0.01} max={0.95} />
        <animateTransform
          attributeName="transform"
          type="translate"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          calcMode="linear"
          values="0 -76;0 -76;0 80;0 80"
          keyTimes="0;0.26;0.40;1"
        />
        <line className="ill-accent-line" strokeWidth="2" x1="-78" y1="0" x2="78" y2="0" />
        <circle className="ill-line" cx="92" cy="0" r="17" fill="rgba(146,64,14,0.05)" />
        <line className="ill-line" x1="104" y1="12" x2="116" y2="25" strokeWidth="4" />
      </g>
    </g>
  );
}

// ── act four: the rulespec files and the four gates ───────────────────

const ARCHES = [770, 840, 910, 980]; // gate centers; compare = index 2

// each file: spawn from its section → column slot → through the gates →
// stack at the rulebook. File c carries the flaw caught at compare.
const FILES = [
  {
    name: "42a.rulespec",
    code: "snap = tfp",
    slot: [645, 150] as const,
    spawn: 0.293,
    depart: 0.44,
    // through-gate crossings, then the book slot
    gateTs: [0.476, 0.492, 0.507, 0.523],
    bookAt: 0.55,
    bookSlot: [BOOK.x - 16, BOOK.y - 20] as const,
    flawed: false,
  },
  {
    name: "42b.rulespec",
    code: "if inc > cap",
    slot: [645, 245] as const,
    spawn: 0.333,
    depart: 0.48,
    gateTs: [0.503, 0.518, 0.534, 0.549],
    bookAt: 0.578,
    bookSlot: [BOOK.x, BOOK.y] as const,
    flawed: false,
  },
  {
    name: "42c.rulespec",
    code: "- 0.03 * inc",
    slot: [645, 340] as const,
    spawn: 0.373,
    depart: 0.52,
    gateTs: [0.546, 0.561], // reaches compare and stops
    bookAt: 0.655,
    bookSlot: [BOOK.x + 16, BOOK.y + 20] as const,
    flawed: true,
  },
];
const REDRAFT = { flag: 0.578, strike: 0.586, gone: 0.606, fixed: 0.612, resume: 0.618, pass: 0.625, review: 0.64 };
const FIXED_CODE = "- 0.30 * inc";

function sectionOrigin(i: number): [number, number] {
  return [DOC.x, DOC.y + SECTIONS[i].top + 12];
}

function RulespecFile({ f, i }: { f: (typeof FILES)[number]; i: number }) {
  const origin = sectionOrigin(i);
  const lane: [number, number] = [712, 245];
  const exit: [number, number] = [1012, 245];
  const stops: ReadonlyArray<readonly [number, number]> = f.flawed
    ? [origin, origin, f.slot, f.slot, lane, [ARCHES[2], 245], [ARCHES[2], 245], exit, f.bookSlot, f.bookSlot]
    : [origin, origin, f.slot, f.slot, lane, exit, f.bookSlot, f.bookSlot];
  const times = f.flawed
    ? [0, f.spawn, f.spawn + 0.022, f.depart, f.depart + 0.015, 0.577, REDRAFT.resume, REDRAFT.review, f.bookAt, 1]
    : [0, f.spawn, f.spawn + 0.022, f.depart, f.depart + 0.015, f.depart + 0.08, f.bookAt, 1];
  const scales = f.flawed
    ? [0.35, 0.35, 0.78, 0.78, 0.62, 0.62, 0.62, 0.62, 0.52, 0.52]
    : [0.35, 0.35, 0.78, 0.78, 0.62, 0.62, 0.52, 0.52];
  const gone = 0.672 + i * 0.004;
  return (
    <g opacity="0">
      <Vis a={f.spawn} b={gone} r={0.012} />
      <Ride stops={stops} scales={scales} times={times} />
      {/* the card */}
      <rect className="ill-paper" x="-46" y="-24" width="92" height="48" rx="3" />
      <rect className="ill-paper" x="-46" y="-36" width="64" height="12" rx="2" />
      <text className="ill-code" style={{ fontSize: "8px" }} x="-41" y="-27">{f.name}</text>
      <line className="ill-accent-line" strokeWidth="2.5" x1="-46" y1="-22" x2="-46" y2="22" />
      <line className="ill-ink" x1="-36" y1="-8" x2="24" y2="-8" strokeWidth="1.2" opacity="0.45" />
      {f.flawed ? (
        <>
          <text className="ill-code" style={{ fontSize: "10.5px" }} x="-36" y="12" opacity="1">
            {f.code}
            <animate
              attributeName="opacity"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              values="1;1;0;0;1"
              keyTimes={`0;${REDRAFT.gone};${REDRAFT.gone + 0.006};0.995;1`}
            />
          </text>
          <line className="ill-accent-line" strokeWidth="2.5" x1="-39" y1="8" x2="34" y2="8" opacity="0">
            <animate
              attributeName="opacity"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              values="0;0;1;1;0;0"
              keyTimes={`0;${REDRAFT.strike};${REDRAFT.strike + 0.008};${REDRAFT.gone};${REDRAFT.gone + 0.006};1`}
            />
          </line>
          <text className="ill-code" style={{ fontSize: "10.5px" }} x="-36" y="12" opacity="0">
            {FIXED_CODE}
            <animate
              attributeName="opacity"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              values="0;0;1;1;0;0"
              keyTimes={`0;${REDRAFT.fixed};${REDRAFT.fixed + 0.01};0.99;0.995;1`}
            />
          </text>
        </>
      ) : (
        <text className="ill-code" style={{ fontSize: "10.5px" }} x="-36" y="12">{f.code}</text>
      )}
    </g>
  );
}

function Gates() {
  // per-arch flash schedules from the files' crossing times
  const flashes: number[][] = ARCHES.map((_, a) => {
    const ts: number[] = [];
    for (const f of FILES) if (f.gateTs[a] !== undefined) ts.push(f.gateTs[a]);
    return ts;
  });
  flashes[2].push(REDRAFT.pass);
  flashes[3].push(REDRAFT.review);
  const labels = ["run", "checks", "compare", "review"];
  return (
    <g opacity="0">
      <Vis a={0.415} b={0.665} r={0.016} />
      {ARCHES.map((cx, i) => (
        <g key={cx}>
          <path className="ill-line" d={`M ${cx - 30} 292 V 230 A 30 30 0 0 1 ${cx + 30} 230 V 292`} fill="none" />
          <rect className="ill-line" x={cx - 36} y="292" width="13" height="9" strokeWidth="1.6" />
          <rect className="ill-line" x={cx + 23} y="292" width="13" height="9" strokeWidth="1.6" />
          <text className="ill-caption" x={cx} y="318" textAnchor="middle">{labels[i]}</text>
          <text className="ill-check" style={{ fontSize: "15px" }} x={cx} y="196" textAnchor="middle" opacity="0">
            ✓
            <Flash ts={flashes[i]} />
          </text>
          {i === 2 && (
            <text className="ill-check" style={{ fontSize: "15px", fill: "var(--color-accent)" }} x={cx} y="196" textAnchor="middle" opacity="0">
              ✗
              <animate
                attributeName="opacity"
                dur={`${CYCLE}s`}
                repeatCount="indefinite"
                values="0;0;1;1;0;0"
                keyTimes={`0;${REDRAFT.flag};${REDRAFT.flag + 0.008};${REDRAFT.gone};${REDRAFT.gone + 0.008};1`}
              />
            </text>
          )}
        </g>
      ))}
    </g>
  );
}

// ── act five: the sealed rulebook ─────────────────────────────────────

function SealedBook() {
  return (
    <g opacity="0" transform={`translate(${BOOK.x}, ${BOOK.y})`}>
      <Vis a={0.672} b={0.955} r={0.018} />
      <rect className="ill-paper" x="-52" y="-68" width="104" height="136" rx="4" />
      <line className="ill-line" x1="-40" y1="-68" x2="-40" y2="68" />
      {[-52, -44].map((y) => (
        <line key={y} className="ill-line" x1="-40" y1={y} x2="52" y2={y} strokeWidth="1.2" opacity="0.55" />
      ))}
      <line className="ill-ink" x1="-20" y1="-24" x2="32" y2="-24" strokeWidth="2.4" />
      <text className="ill-code" style={{ fontSize: "11px" }} x="-20" y="2">{"§ 42 ✓"}</text>
      {[49, 52].map((x) => (
        <line key={x} className="ill-ink" x1={x} y1="-62" x2={x} y2="62" strokeWidth="1" opacity="0.5" />
      ))}
      {/* ribbon bookmark */}
      <path className="ill-accent-fill" d="M 34 -68 h 9 v 26 l -4.5 -6 l -4.5 6 Z" opacity="0.85" />
      {/* the wax seal pops on */}
      <g opacity="0">
        <animate
          attributeName="opacity"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          values="0;0;1;1;0;0"
          keyTimes="0;0.72;0.732;0.952;0.965;1"
        />
        <animateTransform
          attributeName="transform"
          type="scale"
          additive="sum"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          calcMode="linear"
          values="0.6;0.6;1.25;1;1"
          keyTimes="0;0.72;0.73;0.738;1"
        />
        <polygon className="ill-accent-fill" points="8,36 17,60 12,56 8,62 4,56 -1,60" />
        <circle className="ill-accent-fill" cx="8" cy="36" r="12" />
        <circle className="ill-paper" cx="8" cy="36" r="4.5" strokeWidth="0" />
      </g>
    </g>
  );
}

// ── act six: everywhere ───────────────────────────────────────────────

const DEVICES: Array<{ tx: number; ty: number; anchor: [number, number]; fly: number }> = [
  { tx: 1226, ty: 78, anchor: [1272, 112], fly: 0.795 }, // browser
  { tx: 1312, ty: 230, anchor: [1358, 256], fly: 0.815 }, // terminal
  { tx: 1222, ty: 362, anchor: [1256, 392], fly: 0.835 }, // agent
];

function Devices() {
  return (
    <g>
      {/* browser */}
      <g opacity="0" transform={`translate(${DEVICES[0].tx}, ${DEVICES[0].ty})`}>
        <Vis a={0.775} b={0.95} r={0.015} />
        <rect className="ill-paper ill-line" x="0" y="0" width="92" height="64" rx="5" />
        <line className="ill-line" x1="0" y1="16" x2="92" y2="16" />
        <circle className="ill-ink" cx="9" cy="8" r="1.8" />
        <circle className="ill-ink" cx="16" cy="8" r="1.8" />
        <rect className="ill-ink" x="26" y="5" width="58" height="6" rx="3" strokeWidth="0" opacity="0.25" />
        {[30, 42].map((y) => (
          <line key={y} className="ill-ink" x1="10" y1={y} x2="66" y2={y} />
        ))}
        <line className="ill-accent-line" x1="10" y1="54" x2="42" y2="54" strokeWidth="2.2" />
      </g>
      {/* API terminal */}
      <g opacity="0" transform={`translate(${DEVICES[1].tx}, ${DEVICES[1].ty})`}>
        <Vis a={0.795} b={0.95} r={0.015} />
        <rect className="ill-dark" x="0" y="0" width="92" height="52" rx="5" />
        <text className="ill-code ill-code--onDark" style={{ fontSize: "10px" }} x="9" y="20">{"> snap(42)"}</text>
        <text className="ill-code ill-code--onDark" style={{ fontSize: "10px" }} x="9" y="38">{"$291 ▌"}</text>
      </g>
      {/* AI agent */}
      <g opacity="0" transform={`translate(${DEVICES[2].tx}, ${DEVICES[2].ty})`}>
        <Vis a={0.815} b={0.95} r={0.015} />
        <path
          className="ill-paper ill-line"
          d="M 6 14 h 52 a6 6 0 0 1 6 6 v 22 a6 6 0 0 1 -6 6 h -26 l -11 11 v -11 h -15 a6 6 0 0 1 -6 -6 v -22 a6 6 0 0 1 6 -6 Z"
        />
        <text className="ill-code" style={{ fontSize: "10px" }} x="13" y="33">{"§ cited"}</text>
        <line className="ill-line" x1="32" y1="14" x2="32" y2="6" />
        <circle className="ill-accent-fill" cx="32" cy="4" r="3" />
      </g>

      {/* three copies of the sealed rule fly out */}
      {DEVICES.map(({ anchor: [ax, ay], fly }, i) => {
        const t1 = fly + 0.055;
        const mx = (BOOK.x + ax) / 2;
        return (
          <g key={i} opacity="0">
            <animateMotion
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              path={`M ${BOOK.x + 40} ${BOOK.y - 20} C ${mx} ${BOOK.y - 80}, ${mx} ${ay - 30}, ${ax} ${ay}`}
              calcMode="linear"
              keyPoints="0;0;1;1"
              keyTimes={`0;${fly};${t1};1`}
            />
            <animate
              attributeName="opacity"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              values="0;0;1;1;0;0"
              keyTimes={`0;${fly};${fly + 0.008};${t1 - 0.004};${t1 + 0.008};1`}
            />
            <rect className="ill-paper" x="-9" y="-12" width="18" height="24" rx="2" strokeWidth="1.5" />
            <line className="ill-ink" x1="-5" y1="-5" x2="5" y2="-5" strokeWidth="1.2" />
            <line className="ill-ink" x1="-5" y1="1" x2="3" y2="1" strokeWidth="1.2" />
          </g>
        );
      })}

      {/* green arrival marks */}
      {DEVICES.map(({ anchor: [ax, ay], fly }, i) => (
        <circle key={i} cx={ax} cy={ay} r="3.4" fill="var(--color-success)" opacity="0">
          <animate
            attributeName="opacity"
            dur={`${CYCLE}s`}
            repeatCount="indefinite"
            values="0;0;1;1;0;0"
            keyTimes={`0;${fly + 0.053};${fly + 0.061};0.945;0.958;1`}
          />
        </circle>
      ))}
    </g>
  );
}

// ── captions & progress ───────────────────────────────────────────────

function Captions() {
  return (
    <g>
      {CAPTIONS.map(({ w, name, sub }) => (
        <g key={name} opacity="0">
          <Vis a={w[0]} b={w[1]} r={0.014} />
          <text className="ill-name" style={{ fontSize: "21px" }} x={CXC} y="468" textAnchor="middle">
            {name}
          </text>
          <text className="ill-caption" x={CXC} y="490" textAnchor="middle">
            {sub}
          </text>
        </g>
      ))}
      {CAPTIONS.map(({ w }, i) => {
        const x = CXC - 60 + i * 24;
        return (
          <g key={i}>
            <circle className="ill-line" strokeWidth="1.2" cx={x} cy="514" r="3.2" fill="none" opacity="0.55" />
            <circle cx={x} cy="514" r="3.2" fill="var(--color-accent)" opacity="0">
              <Vis a={w[0]} b={w[1]} r={0.01} />
            </circle>
          </g>
        );
      })}
    </g>
  );
}

// ── reduced-motion fallback: the story as one composed still ──────────

function StaticStory() {
  return (
    <svg className="ill" viewBox="0 0 1420 540" role="img" aria-label="The life of a rule: laws from many sources are captured into the corpus; each section of a document is encoded into its own rulespec file; the files pass four gates, are sealed into the rulebook, and delivered to the web, the API, and AI agents.">
      <g transform={`translate(${DOC.x}, ${DOC.y})`}>
        <rect className="ill-paper" x="-85" y="-105" width="170" height="210" rx="4" />
        <line className="ill-ink" strokeWidth="2.6" x1="-65" y1="-88" x2="0" y2="-88" />
        <text className="ill-code" style={{ fontSize: "11px" }} x="30" y="-84">{"§ 42"}</text>
        {SECTIONS.map(({ key, top }) => (
          <g key={key}>
            <text className="ill-code" style={{ fontSize: "9.5px" }} x="-65" y={top + 4}>{`§ 42(${key})`}</text>
            <line className="ill-ink" x1="-65" y1={top + 14} x2="62" y2={top + 14} strokeWidth="1.5" />
            <line className="ill-ink" x1="-65" y1={top + 26} x2="34" y2={top + 26} strokeWidth="1.5" />
          </g>
        ))}
      </g>
      {FILES.map((f, i) => (
        <g key={f.name} transform={`translate(${f.slot[0] + 46}, ${f.slot[1]}) scale(0.72)`}>
          <rect className="ill-paper" x="-46" y="-24" width="92" height="48" rx="3" />
          <rect className="ill-paper" x="-46" y="-36" width="64" height="12" rx="2" />
          <text className="ill-code" style={{ fontSize: "8px" }} x="-41" y="-27">{f.name}</text>
          <line className="ill-accent-line" strokeWidth="2.5" x1="-46" y1="-22" x2="-46" y2="22" />
          <text className="ill-code" style={{ fontSize: "10.5px" }} x="-36" y="12">{i === 2 ? FIXED_CODE : f.code}</text>
        </g>
      ))}
      <g>
        {ARCHES.map((cx, i) => (
          <g key={cx}>
            <path className="ill-line" d={`M ${cx - 30} 292 V 230 A 30 30 0 0 1 ${cx + 30} 230 V 292`} fill="none" />
            <text className="ill-check" style={{ fontSize: "15px" }} x={cx} y="216" textAnchor="middle">✓</text>
            <text className="ill-caption" x={cx} y="318" textAnchor="middle">{["run", "checks", "compare", "review"][i]}</text>
          </g>
        ))}
      </g>
      <text className="ill-name" style={{ fontSize: "21px" }} x={CXC} y="468" textAnchor="middle">
        From published law to a rule you can trust
      </text>
      <text className="ill-caption" x={CXC} y="490" textAnchor="middle">
        publish · capture · encode every section · check · seal · deliver — web · API · AI agents
      </text>
    </svg>
  );
}

export function IllustratedFlow() {
  if (REDUCED_MOTION) {
    return (
      <div className="ill__wrap">
        <StaticStory />
      </div>
    );
  }
  return (
    <div className="ill__wrap">
      <svg
        className="ill"
        viewBox="0 0 1420 540"
        role="img"
        aria-label="The life of a rule, as a looping film: documents from the legislature, an agency, and the register cross-reference each other and are filed into the corpus; the hero document is encoded section by section, each section producing its own rulespec file; the files pass through four gates — one failure is redrafted in place — then stack into the sealed rulebook, and copies fly out to the web, the API, and AI agents."
      >
        <defs>
          <marker id="ill-ref-arr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5.5" markerHeight="5.5" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="rgba(146,64,14,0.6)" />
          </marker>
        </defs>
        <Sources />
        <Corpus />
        {SIBLINGS.map((s, i) => (
          <SiblingDoc key={i} s={s} />
        ))}
        <CrossRefs />
        <TheDocument />
        <Gates />
        {FILES.map((f, i) => (
          <RulespecFile key={f.name} f={f} i={i} />
        ))}
        <SealedBook />
        <Devices />
        <Captions />
      </svg>
    </div>
  );
}
