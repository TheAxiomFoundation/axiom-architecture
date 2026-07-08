import { useEffect, useMemo, useState } from "react";

// External process graphic as a real chart: a hand-drawn Sankey flow.
// Ribbon widths carry the story — hundreds of official sources merge into
// the corpus (1.7M+ provisions), a narrower stream is drafted, forced
// through the four gates, and emerges as 3,000+ verified rules. The
// "any failure — redrafted" return flow is drawn as an actual loop, and
// slow particles ride every ribbon. Widths are illustrative, counts are
// labeled.

const RIBBON_MID = (x0: number, x1: number) => (x0 + x1) / 2;

// Filled sankey link: two bezier edges between vertical slots.
function link(
  x0: number,
  t0: number,
  b0: number,
  x1: number,
  t1: number,
  b1: number,
) {
  const m = RIBBON_MID(x0, x1);
  return (
    `M ${x0} ${t0} C ${m} ${t0}, ${m} ${t1}, ${x1} ${t1} ` +
    `L ${x1} ${b1} C ${m} ${b1}, ${m} ${b0}, ${x0} ${b0} Z`
  );
}

// Centerline of a link, for particles.
function center(x0: number, y0: number, x1: number, y1: number) {
  const m = RIBBON_MID(x0, x1);
  return `M ${x0} ${y0} C ${m} ${y0}, ${m} ${y1}, ${x1} ${y1}`;
}

const SOURCES = [
  { label: "eCFR", sub: "federal regulations", c: 88, h: 40 },
  { label: "US Code", sub: "54 titles", c: 158, h: 46 },
  { label: "Agency guidance", sub: "IRS · policy manuals", c: 228, h: 40 },
  { label: "State codes", sub: "50 states + DC", c: 312, h: 92 },
  { label: "UK", sub: "legislation.gov.uk", c: 396, h: 36 },
  { label: "Canada", sub: "laws-lois", c: 458, h: 36 },
  { label: "Belgium", sub: "ELI · federal acts", c: 514, h: 30 },
];

// The application layer: where verified rules are used.
const SURFACES = [
  { label: "Web", sub: "browse & trace", c: 210 },
  { label: "API + SDKs", sub: "calculate at scale", c: 290 },
  { label: "AI agents", sub: "cited answers", c: 370 },
];
const RULES_X = 1132;
const SURFACE_X = 1300;
const RULES_TOP = 255;

// One wave per cycle; dots move at constant velocity within it.
const CYCLE = 13;

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Spotlight: a section holds full opacity while the cohort is passing
// through it (windows derived from the constant-speed timings); the rest
// of the time it rests slightly dimmed. Reduced motion: fully lit, still.
const DIM = 0.55;

const WIN = {
  sources: [0.01, 0.16],
  draft: [0.15, 0.28],
  encoded: [0.27, 0.4],
  loop: [0.39, 0.61],
  verified: [0.37, 0.51],
  surfaces: [0.49, 0.62],
} as const;

function Pulse({ w }: { w: readonly [number, number] }) {
  if (REDUCED_MOTION) return null;
  const r = 0.015;
  const [a, b] = w;
  return (
    <animate
      attributeName="opacity"
      dur={`${CYCLE}s`}
      repeatCount="indefinite"
      values={`${DIM};${DIM};1;1;${DIM};${DIM}`}
      keyTimes={`0;${a};${a + r};${b - r};${b};1`}
    />
  );
}

// One cohort per cycle: a random batch of "provisions" that enters together,
// travels every stage in its own lanes, sometimes loses one to the redraft
// loop, and redistributes across the application branches at the end.
type WaveDot = {
  src: number;
  lane: number; // -1..1 across the ribbon's thickness
  jit: number; // small per-dot start offset within each slot
  surface: number;
};

function makeWave(): { dots: WaveDot[]; loopIdx: number } {
  const n = 5 + Math.floor(Math.random() * 4);
  const totalH = SOURCES.reduce((sum, s) => sum + s.h, 0);
  const dots: WaveDot[] = Array.from({ length: n }, (_, i) => {
    // weight source choice by stream size so State codes carries more
    let pick = Math.random() * totalH;
    let src = 0;
    for (let j = 0; j < SOURCES.length; j++) {
      pick -= SOURCES[j].h;
      if (pick <= 0) {
        src = j;
        break;
      }
    }
    return {
      src,
      lane: (i / Math.max(n - 1, 1) - 0.5) * 1.6 + (Math.random() - 0.5) * 0.3,
      jit: Math.random() * 0.03,
      surface: Math.floor(Math.random() * 3),
    };
  });
  return { dots, loopIdx: Math.random() < 0.6 ? Math.floor(Math.random() * n) : -1 };
}

// One dot = one circle riding ONE continuous path for its whole journey —
// never hidden mid-flight. It slides along each bar as it transits it, and
// its fill flips grey → amber → green as the material transforms. Failing
// dots detour through the redraft loop and catch up while the rest of the
// cohort continues through verification.
type Anchor = { x: number; y: number; mode?: "C" | "L" | "loop" };

// Constant velocity: every dot covers path-distance at the same shared
// speed (SVG units per second). keyTimes are derived from cumulative
// distance, so time ∝ distance for every segment of every dot — a
// redrafted dot's longer journey honestly takes longer.
const SPEED = 175;

function buildJourney(anchors: Anchor[], jit: number) {
  let path = `M ${anchors[0].x} ${anchors[0].y}`;
  const dists = [0];
  for (let i = 1; i < anchors.length; i++) {
    const p = anchors[i - 1];
    const q = anchors[i];
    if (q.mode === "loop") {
      path += ` C 884 402, 656 402, ${q.x} ${q.y}`;
      dists.push(420);
    } else if (q.mode === "C") {
      const m = (p.x + q.x) / 2;
      path += ` C ${m} ${p.y}, ${m} ${q.y}, ${q.x} ${q.y}`;
      dists.push(Math.hypot(q.x - p.x, q.y - p.y) * 1.05);
    } else {
      path += ` L ${q.x} ${q.y}`;
      dists.push(Math.hypot(q.x - p.x, q.y - p.y));
    }
  }
  const total = dists.reduce((a, b) => a + b, 0);
  const start = 0.01 + jit;
  let cum = 0;
  const fractions: number[] = [];
  const times: number[] = [];
  for (const d of dists) {
    cum += d;
    fractions.push(cum / total);
    times.push(Math.min(start + cum / SPEED / CYCLE, 0.99));
  }
  return {
    path,
    keyTimes: [0, ...times, 1].join(";"),
    keyPoints: [0, ...fractions, 1].join(";"),
    times,
  };
}

function JourneyDot({ d, loops }: { d: WaveDot; loops: boolean }) {
  if (REDUCED_MOTION) return null;
  const s = SOURCE_LINKS[d.src];
  const srcOff = d.lane * (s.h / 2 - 7);
  const surf = SURFACE_LINKS[d.surface];
  const surfMid = RULES_TOP + (70 / 3) * (d.surface + 0.5);

  const anchors: Anchor[] = [
    { x: SRC_X, y: s.c + srcOff },
    { x: CORPUS_X, y: s.segC + srcOff, mode: "C" },
    { x: 412, y: 302 + d.lane * 30, mode: "L" },
    { x: 650, y: 290 + d.lane * 38, mode: "C" },
    { x: 662, y: 290 + d.lane * 40, mode: "L" },
    { x: 880, y: 290 + d.lane * 36, mode: "C" },
    ...(loops
      ? ([
          { x: 884, y: 338, mode: "L" },
          { x: 656, y: 348, mode: "loop" },
          { x: 664, y: 290 + d.lane * 40, mode: "L" },
          { x: 880, y: 290 + d.lane * 36, mode: "C" },
        ] as Anchor[])
      : []),
    { x: 892, y: 285 + d.lane * 28, mode: "L" },
    { x: 1120, y: 290 + d.lane * 28, mode: "C" },
    { x: 1132, y: surfMid + d.lane * 8, mode: "L" },
    { x: SURFACE_X, y: surf.c + d.lane * 6, mode: "C" },
  ];

  const { path, keyTimes, keyPoints, times } = buildJourney(anchors, d.jit);

  // grey while raw text, amber once past the encode bar, green once past
  // the gates — for loop dots, past the SECOND gates crossing.
  const amberAt = times[4];
  const greenAt = times[loops ? 10 : 6];

  return (
    <circle className="lsk-dot" r="3" fill="#78716c" opacity="0">
      <animateMotion
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        path={path}
        calcMode="linear"
        keyPoints={keyPoints}
        keyTimes={keyTimes}
      />
      <animate
        attributeName="opacity"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        values="0;0;1;1;0;0"
        keyTimes={`0;${0.01 + d.jit};${0.025 + d.jit};${0.955 + d.jit};${Math.min(0.97 + d.jit, 0.995)};1`}
      />
      <animate
        attributeName="fill"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        calcMode="discrete"
        values="#78716c;#92400e;#166534"
        keyTimes={`0;${amberAt};${greenAt}`}
      />
    </circle>
  );
}
const SURFACE_LINKS = SURFACES.map((s, i) => {
  const t0 = RULES_TOP + (70 / 3) * i;
  const b0 = RULES_TOP + (70 / 3) * (i + 1);
  return {
    ...s,
    d: link(RULES_X, t0, b0, SURFACE_X, s.c - 10, s.c + 10),
    cd: center(RULES_X, (t0 + b0) / 2, SURFACE_X, s.c),
  };
});

// Corpus bar segments stack in source order.
const CORPUS_TOP = 152;
const SRC_X = 118;
const CORPUS_X = 400;

let acc = CORPUS_TOP;
const SOURCE_LINKS = SOURCES.map((s) => {
  const t1 = acc;
  acc += s.h;
  return {
    ...s,
    d: link(SRC_X, s.c - s.h / 2, s.c + s.h / 2, CORPUS_X, t1, t1 + s.h),
    cd: center(SRC_X, s.c, CORPUS_X, t1 + s.h / 2),
    segC: t1 + s.h / 2,
  };
});
const CORPUS_BOTTOM = acc; // 472

export function LaunchGraphic() {
  const [wave, setWave] = useState(0);
  const plan = useMemo(makeWave, [wave]);

  // Re-roll the cohort at each cycle boundary. SMIL runs on the document
  // clock, so we align the swap to just after phase zero — the new batch
  // appears exactly as a fresh wave enters the sources.
  useEffect(() => {
    if (REDUCED_MOTION) return;
    let interval: number | undefined;
    const docTime = Number(document.timeline?.currentTime ?? 0);
    const toBoundary = CYCLE * 1000 - (docTime % (CYCLE * 1000)) + 80;
    const timeout = window.setTimeout(() => {
      setWave((w) => w + 1);
      interval = window.setInterval(() => setWave((w) => w + 1), CYCLE * 1000);
    }, toBoundary);
    return () => {
      window.clearTimeout(timeout);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="launch">
      <div className="launch__poster">
        <header className="launch__header">
          <div className="launch__eyebrow">The Axiom Foundation</div>
          <h1 className="launch__headline">
            From published law to a rule you can <em>trust.</em>
          </h1>
          <p className="launch__sub">
            The whole process in one flow: what we capture, what we encode,
            what survives the gates — and where it goes. Widths are
            illustrative; the counts are real.
          </p>
        </header>

        <div className="lsk__wrap">
          <svg
            className="lsk"
            viewBox="0 0 1420 560"
            role="img"
            aria-label="Flow chart: hundreds of official legal sources — federal, state, agency guidance, UK, Canada, Belgium — merge into a corpus of 1.7M+ provisions; a narrower stream is drafted into rules, passes four verification gates (failures loop back for redrafting), emerges as 3,000+ verified signed rules re-tested weekly, and fans out to the web, APIs, and AI agents."
          >
            <defs>
              <marker
                id="lsk-loop-arr"
                viewBox="0 0 8 8"
                refX="6"
                refY="4"
                markerWidth="6.5"
                markerHeight="6.5"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 z" fill="rgba(146, 64, 14, 0.75)" />
              </marker>
            </defs>
            {/* ── stage: sources ─────────────────────────────── */}
            <g className="lsk__stage lsk__stage--1">
              <text className="lsk-eyebrow" x="30" y="52">
                hundreds of official sites
              </text>
              {SOURCE_LINKS.map((s) => (
                <g key={s.label}>
                  <text className="lsk-srclabel" x="102" y={s.c - 1} textAnchor="end">
                    {s.label}
                  </text>
                  <text className="lsk-srcsub" x="102" y={s.c + 12} textAnchor="end">
                    {s.sub}
                  </text>
                  <rect
                    className="lsk-stub"
                    x={SRC_X - 8}
                    y={s.c - s.h / 2}
                    width="8"
                    height={s.h}
                    rx="2"
                  />
                </g>
              ))}
            </g>

            {/* source ribbons */}
            <g className="lsk__stage lsk__stage--1">
              {SOURCE_LINKS.map((s, i) => (
                <path
                  key={s.label}
                  className={`lsk-ribbon lsk-ribbon--raw lsk-ribbon--raw${i % 2}`}
                  d={s.d}
                >
                  <Pulse w={WIN.sources} />
                </path>
              ))}
            </g>

            {/* ── stage: corpus ──────────────────────────────── */}
            <g className="lsk__stage lsk__stage--2">
              <rect
                className="lsk-bar lsk-bar--corpus"
                x={CORPUS_X}
                y={CORPUS_TOP}
                width="12"
                height={CORPUS_BOTTOM - CORPUS_TOP}
                rx="3"
              />
              <text className="lsk-name" x="424" y="128">
                The corpus
              </text>
              <text className="lsk-eyebrow" x="424" y="145">
                1.7M+ provisions, preserved exactly
              </text>
            </g>

            {/* corpus → encoding (the working slice) */}
            <g className="lsk__stage lsk__stage--3">
              <path
                className="lsk-ribbon lsk-ribbon--draft"
                d={link(412, 262, 342, 650, 240, 340)}
              >
                <Pulse w={WIN.draft} />
              </path>
              <rect className="lsk-bar lsk-bar--encode" x="650" y="240" width="12" height="100" rx="3" />
              <text className="lsk-name" x="656" y="207" textAnchor="middle">
                Encoding
              </text>
              <text className="lsk-eyebrow" x="656" y="224" textAnchor="middle">
                tied to the source text
              </text>
            </g>

            {/* encoding → gates */}
            <g className="lsk__stage lsk__stage--4">
              <path
                className="lsk-ribbon lsk-ribbon--encoded"
                d={link(662, 240, 340, 880, 245, 335)}
              >
                <Pulse w={WIN.encoded} />
              </path>
              <rect className="lsk-bar lsk-bar--gates" x="880" y="245" width="12" height="90" rx="3" />
              <text className="lsk-name" x="870" y="207" textAnchor="middle">
                Four gates
              </text>
              <text className="lsk-eyebrow" x="870" y="224" textAnchor="middle">
                run · 50+ checks · compare · review
              </text>

              {/* the redraft loop — failures flow back into encoding */}
              <path
                className="lsk-loop"
                d="M 886 338 C 886 402, 656 402, 656 348"
                markerEnd="url(#lsk-loop-arr)"
              >
                <Pulse w={WIN.loop} />
              </path>
              <text className="lsk-loop-label" x="771" y="411" textAnchor="middle">
                ↺ any failure — redrafted
              </text>
            </g>

            {/* gates → rulebook */}
            <g className="lsk__stage lsk__stage--5">
              <path
                className="lsk-ribbon lsk-ribbon--verified"
                d={link(892, 250, 320, 1120, 255, 325)}
              >
                <Pulse w={WIN.verified} />
              </path>
              <rect className="lsk-bar lsk-bar--rules" x="1120" y="255" width="12" height="70" rx="3" />
              <text className="lsk-name" x="1072" y="359" textAnchor="middle">
                The rulebook
              </text>
              <text className="lsk-eyebrow" x="1072" y="376" textAnchor="middle">
                3,000+ rules · signed &amp; citable
              </text>
              <text className="lsk-agree" x="1072" y="393" textAnchor="middle">
                ✓ 99.9% agreement with independent calculators
              </text>
              <text className="lsk-retest" x="1072" y="410" textAnchor="middle">
                re-tested weekly · law watched hourly
              </text>
            </g>

            {/* ── stage: the application layer ───────────────── */}
            <g className="lsk__stage lsk__stage--6">
              <text className="lsk-eyebrow" x="1300" y="172">
                where it&apos;s used
              </text>
              {SURFACE_LINKS.map((s) => (
                <g key={s.label}>
                  <path className="lsk-ribbon lsk-ribbon--surface" d={s.d}>
                    <Pulse w={WIN.surfaces} />
                  </path>
                  <rect
                    className="lsk-stub"
                    x={SURFACE_X}
                    y={s.c - 10}
                    width="8"
                    height="20"
                    rx="2"
                  />
                  <text className="lsk-srclabel" x={SURFACE_X + 16} y={s.c - 1}>
                    {s.label}
                  </text>
                  <text className="lsk-srcsub" x={SURFACE_X + 16} y={s.c + 12}>
                    {s.sub}
                  </text>
                </g>
              ))}
            </g>

            {/* ── the cohort: a random batch enters together, each dot
                 one continuous journey — never hidden mid-flight. One
                 may detour through the redraft loop while the others
                 continue; all redistribute across the application
                 branches at the end ─────────────────────────────── */}
            <g className="lsk__stage lsk__stage--5" key={wave}>
              {plan.dots.map((d, i) => (
                <JourneyDot d={d} loops={plan.loopIdx === i} key={i} />
              ))}
            </g>
          </svg>
        </div>

        <footer className="launch__footline">
          <span>
            4 countries · 50 states + DC · 1.7M+ provisions · 3,000+ encoded
            rules
          </span>
          <span className="launch__footbrand">
            <span className="glyph-axiom">∀</span> axiom-foundation.org
          </span>
        </footer>
      </div>
    </div>
  );
}
