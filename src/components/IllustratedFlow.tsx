import { useRef, useState } from "react";

// The illustrated launch story: one continuously evolving film, read left
// to right. Three sources publish documents; they cross-reference each
// other and the siblings are filed into the corpus. The hero document is
// then encoded SECTION BY SECTION — each section producing its own
// rulespec file. The three files travel right through the four gates
// (one fails at compare and is redrafted in place), stack into the sealed
// rulebook, and copies fly out to the browser, the API, and the AI agent.
// One SMIL clock drives everything; the loop is seamless.
//
// Each structural step fades in at its cue and then HOLDS — it does not
// disappear when the camera moves on. So the story accumulates: by the end
// of the cycle every stage is on screen at once as a single end-to-end
// graph, held briefly, then cleared together for a clean loop restart.
//
// VISUAL LANGUAGE — security printing. The film plays inside a ruled
// certificate frame; every actor is an engraved vignette in the manner of
// banknote intaglio: hairline outlines, parallel-line and crosshatch
// shading, stippled grounds, rosettes. Two inks only, like a real
// certificate: black engraving ink and ONE amber chancery accent that
// carries the story (flag → stamp → scan → tab → ribbon → wax seal →
// arrival marks). Trust is the aesthetic: this is what documents look
// like when they are meant to be believed.

const CYCLE = 28;

// Everything holds until END, then clears by CLEAR so the loop restarts
// from an empty stage.
const END = 0.955;
const CLEAR = 0.982;

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CXC = 710; // caption center
const DOC = { x: 450, y: 245 }; // hero document center stage
const BOOK = { x: 1120, y: 245 };

// the two inks
const INK = "#241f1a";
const WAX = "#a35b14";

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

// ── engraver's toolkit ────────────────────────────────────────────────
// hatches are userSpaceOnUse patterns; fills of these ARE the shading.

const H = {
  fine: "url(#e-hatch-fine)", // light diagonal — gentle tone
  cross: "url(#e-hatch-cross)", // crosshatch — deep shade
  vert: "url(#e-hatch-vert)", // vertical — column shading
  horiz: "url(#e-hatch-horiz)", // horizontal — ground / water lines
};

// engraved ground shadow: a hatched ellipse, the way stamps sit on hatching
function Ground({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry ?? rx * 0.22} fill={H.horiz} opacity="0.35" />;
}

// an engraved rosette — the guilloché medallion of the piece
function Rosette({ r = 12, accent = false }: { r?: number; accent?: boolean }) {
  const stroke = accent ? WAX : INK;
  const ticks = Array.from({ length: 24 }, (_, i) => (i * Math.PI) / 12);
  const petals = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);
  return (
    <g stroke={stroke} fill="none" strokeWidth={r * 0.05}>
      <circle r={r} />
      <circle r={r * 0.82} strokeWidth={r * 0.035} />
      {ticks.map((a, i) => (
        <line
          key={i}
          x1={Math.cos(a) * r * 0.84}
          y1={Math.sin(a) * r * 0.84}
          x2={Math.cos(a) * r * 0.98}
          y2={Math.sin(a) * r * 0.98}
          strokeWidth={r * 0.04}
        />
      ))}
      {petals.map((a, i) => (
        <ellipse
          key={i}
          rx={r * 0.38}
          ry={r * 0.14}
          transform={`rotate(${(a * 180) / Math.PI})`}
          cx={r * 0.4}
          strokeWidth={r * 0.035}
        />
      ))}
      <circle r={r * 0.16} fill={stroke} stroke="none" />
    </g>
  );
}

// the certificate frame: double rule, corner rosettes, serial number.
// It is the stage — present from the first frame, it never animates.
function Frame() {
  const x = 14, y = 8, w = 1392, h = 524;
  const corners: Array<[number, number]> = [
    [x + 16, y + 16],
    [x + w - 16, y + 16],
    [x + 16, y + h - 16],
    [x + w - 16, y + h - 16],
  ];
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={INK} strokeWidth="1.5" opacity="0.75" />
      <rect x={x + 7} y={y + 7} width={w - 14} height={h - 14} fill="none" stroke={INK} strokeWidth="0.5" opacity="0.6" />
      {corners.map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx}, ${cy})`} opacity="0.8">
          <Rosette r={7} />
        </g>
      ))}
      <text className="ill-code" style={{ fontSize: "8.5px", letterSpacing: "0.12em" }} x={x + w - 30} y={y + h - 26} textAnchor="end" opacity="0.65">
        {"Nº 003 241"}
      </text>
      <text className="ill-code" style={{ fontSize: "8.5px", letterSpacing: "0.12em" }} x={x + 30} y={y + h - 26} opacity="0.65">
        {"SERIES 2026 · A"}
      </text>
    </g>
  );
}

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

// hold-to-end visibility: fade in over [a, a+r], then stay until the global
// END, then clear by CLEAR. Use this for anything that should remain visible
// as the story builds up into one end-to-end graph.
//
// `dim` marks the moment this actor's act ends: it recedes to `rest` opacity
// so the stage accumulates as a ghosted history while the current act keeps
// the full ink. This is the clutter valve.
function VisHold({
  a,
  r = 0.014,
  max = 1,
  dim,
  rest = 0.35,
}: {
  a: number;
  r?: number;
  max?: number;
  dim?: number;
  rest?: number;
}) {
  if (dim !== undefined) {
    const restV = max * rest;
    return (
      <animate
        attributeName="opacity"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        values={`0;0;${max};${max};${restV};${restV};0;0`}
        keyTimes={`0;${a};${Math.min(a + r, dim)};${dim};${Math.min(dim + 0.03, END)};${END};${CLEAR};1`}
      />
    );
  }
  return (
    <animate
      attributeName="opacity"
      dur={`${CYCLE}s`}
      repeatCount="indefinite"
      values={`0;0;${max};${max};0;0`}
      keyTimes={`0;${a};${Math.min(a + r, END)};${END};${CLEAR};1`}
    />
  );
}

// repeated-flash helper: opacity pulses at each time in `ts`. Overlapping
// pulses are merged into one window — keyTimes must be monotonic or SMIL
// rejects the whole animation.
function Flash({ ts, hold = 0.022 }: { ts: number[]; hold?: number }) {
  const sorted = [...ts].sort((a, b) => a - b);
  const windows: Array<[number, number]> = [];
  for (const t of sorted) {
    const end = t + hold;
    const last = windows[windows.length - 1];
    if (last && t <= last[1] + 0.012) last[1] = Math.max(last[1], end);
    else windows.push([t, end]);
  }
  const vals: number[] = [0];
  const times: number[] = [0];
  for (const [a, b] of windows) {
    if (b + 0.01 >= 0.999) break;
    vals.push(0, 1, 1, 0);
    times.push(a, a + 0.006, b, b + 0.01);
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

// an engraved sheet: paper with a hairline rule border and hatched
// under-shadow; children draw the face.
function Sheet({
  x,
  y,
  w,
  h,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  children?: React.ReactNode;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="1.1" />
      <rect x={x + 3.5} y={y + 3.5} width={w - 7} height={h - 7} fill="none" stroke={INK} strokeWidth="0.45" opacity="0.55" />
      {children}
    </g>
  );
}

// ── act one: the sources ──────────────────────────────────────────────
// three engraved vignettes, the way buildings appear on banknotes.

function Legislature() {
  const cols = [-40, -19, 2, 23];
  return (
    <g transform="translate(112, 128)">
      <Ground cx={2} cy={30} rx={66} />
      {/* steps */}
      <rect x={-58} y={14} width={116} height={7} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="0.9" />
      <rect x={-50} y={7} width={100} height={7} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="0.9" />
      {/* colonnade: outlined columns, vertical hatch for the shade side */}
      {cols.map((cx) => (
        <g key={cx}>
          <rect x={cx} y={-36} width={15} height={43} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="0.9" />
          <rect x={cx + 8} y={-36} width={7} height={43} fill={H.vert} opacity="0.5" />
          <line x1={cx - 2} y1={-36} x2={cx + 17} y2={-36} stroke={INK} strokeWidth="1.1" />
          <line x1={cx - 2} y1={7} x2={cx + 17} y2={7} stroke={INK} strokeWidth="1.1" />
        </g>
      ))}
      {/* interior shade behind the columns */}
      <rect x={-38} y={-33} width={76} height={38} fill={H.cross} opacity="0.18" />
      {/* entablature + pediment with crosshatch shadow under the raking cornice */}
      <rect x={-52} y={-47} width={104} height={11} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="0.9" />
      <path d="M -58 -47 L 0 -79 L 58 -47 Z" fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M -46 -50 L 0 -75 L 46 -50 Z" fill="none" stroke={INK} strokeWidth="0.5" opacity="0.7" />
      <path d="M -46 -50 L 0 -75 L 46 -50 Z" fill={H.fine} opacity="0.3" />
      <text className="ill-caption" x="2" y="44" textAnchor="middle">legislature</text>
    </g>
  );
}

function Agency() {
  return (
    <g transform="translate(112, 262)">
      <Ground cx={2} cy={26} rx={56} />
      {/* block with a shaded right flank */}
      <rect x={-40} y={-72} width={80} height={92} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="1.1" />
      <rect x={22} y={-72} width={18} height={92} fill={H.vert} opacity="0.45" />
      {/* cornice */}
      <line x1={-45} y1={-72} x2={45} y2={-72} stroke={INK} strokeWidth="1.4" />
      {/* windows: hatched panes in ruled rows */}
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <g key={`${r}${c}`}>
            <rect x={-30 + c * 22} y={-58 + r * 20} width={13} height={10} fill={H.fine} stroke={INK} strokeWidth="0.55" opacity="0.8" />
          </g>
        ))
      )}
      {/* door with crosshatched reveal */}
      <rect x={-9} y={4} width={18} height={16} fill={H.cross} stroke={INK} strokeWidth="0.8" opacity="0.9" />
      {/* flag — the first drop of chancery amber */}
      <line x1={0} y1={-72} x2={0} y2={-92} stroke={INK} strokeWidth="1.1" />
      <path d="M 0 -92 L 17 -88 L 0 -83 Z" fill={WAX} />
      <text className="ill-caption" x="2" y="40" textAnchor="middle">agency</text>
    </g>
  );
}

function Register() {
  // the day's gazette: an engraved open spread on a rule
  return (
    <g transform="translate(112, 392)">
      <Ground cx={0} cy={22} rx={58} />
      <path d="M -52 8 C -34 1, -16 1, -1 8 C 14 1, 32 1, 50 8 L 50 26 C 32 19, 14 19, -1 26 C -16 19, -34 19, -52 26 Z"
        fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
      {/* spine shade */}
      <path d="M -5 7 C -3 6.4, -1 6.2, -1 8 L -1 26 C -1 24, -3 24.4, -5 25 Z" fill={H.vert} opacity="0.8" />
      {/* masthead + columns of engraved text */}
      <line x1={-44} y1={12} x2={-12} y2={9} stroke={INK} strokeWidth="1.7" />
      {[0, 1, 2].map((i) => (
        <line key={`l${i}`} x1={-44} y1={16 + i * 3.6} x2={-10} y2={13 + i * 3.6} stroke={INK} strokeWidth="0.55" opacity="0.7" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line key={`r${i}`} x1={8} y1={12 + i * 3.6} x2={42} y2={15 + i * 3.6} stroke={INK} strokeWidth="0.55" opacity="0.7" />
      ))}
      <text className="ill-caption" x="0" y="44" textAnchor="middle">register</text>
    </g>
  );
}

function Sources() {
  return (
    <g opacity="0">
      <VisHold a={0.004} r={0.02} dim={0.13} />
      <Legislature />
      <Agency />
      <Register />
    </g>
  );
}

// ── act two: the corpus and the sibling documents ─────────────────────

// the corpus: an engraved archive chest — banded strongbox with one
// drawer drawn open, files ruled inside.
function Corpus() {
  return (
    <g opacity="0" transform="translate(265, 252)">
      <VisHold a={0.108} r={0.018} dim={0.29} rest={0.4} />
      <Ground cx={0} cy={68} rx={62} />
      {/* chest */}
      <rect x={-46} y={-58} width={92} height={118} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="1.2" />
      <rect x={30} y={-58} width={16} height={118} fill={H.vert} opacity="0.4" />
      {/* drawer rules + pulls */}
      {[-30, 2, 34].map((y) => (
        <g key={y}>
          <line x1={-46} y1={y} x2={46} y2={y} stroke={INK} strokeWidth="0.8" />
          <rect x={-9} y={y + 12} width={18} height={3} rx="1.5" fill="none" stroke={INK} strokeWidth="0.7" />
        </g>
      ))}
      {/* the open drawer: pulled tray with ruled hanging files */}
      <rect x={-54} y={-22} width={108} height={26} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="1.1" />
      <rect x={-54} y={-22} width={108} height={5} fill={H.fine} opacity="0.4" />
      {[-40, -12, 16, 40].map((x) => (
        <line key={x} x1={x} y1={-14} x2={x + 12} y2={-14} stroke={INK} strokeWidth="1.2" />
      ))}
      {/* a file peeking */}
      <rect x={-4} y={-19} width={16} height={14} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="0.8" />
      {[-15, -11.5, -8].map((y) => (
        <line key={y} x1={-1} y1={y} x2={9} y2={y} stroke={INK} strokeWidth="0.5" opacity="0.65" />
      ))}
      {/* each sibling doc, once swallowed, stands as a new file in the tray
          (timed to the moment its sheet finishes sinking) */}
      {[
        { x: -34, at: SIBLINGS[0].filed },
        { x: 22, at: SIBLINGS[1].filed },
      ].map(({ x, at }) => (
        <g key={x} opacity="0">
          <VisHold a={at} r={0.012} />
          <rect x={x} y={-17} width={14} height={12} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="0.8" />
          {[-13.5, -10.5].map((y) => (
            <line key={y} x1={x + 2.5} y1={y} x2={x + 11} y2={y} stroke={INK} strokeWidth="0.5" opacity="0.65" />
          ))}
        </g>
      ))}
      <text className="ill-caption" x="0" y="82" textAnchor="middle">the corpus</text>
    </g>
  );
}

// faint intake channels: the three sources funnel into the corpus. Dashed
// guide lines converging on the drawer make the "many sources → one corpus"
// structure explicit and give the docs a rail to travel along.
function Intake() {
  const paths = [
    "M 168 120 C 198 150, 206 204, 220 236", // legislature
    "M 160 246 C 186 244, 202 242, 220 240", // agency
    "M 158 380 C 188 348, 202 292, 220 246", // register
  ];
  return (
    <g opacity="0">
      <VisHold a={0.02} r={0.02} max={0.45} dim={0.25} rest={0.4} />
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={INK}
          strokeWidth="0.9"
          strokeDasharray="1.5 4.5"
          markerEnd="url(#ill-intake-arr)"
        />
      ))}
    </g>
  );
}

const SIBLINGS = [
  {
    origin: [150, 248] as const, // agency (middle source)
    flank: [186, 236] as const, // pause in the gap LEFT of the corpus — cross-ref beat
    label: "cites § 42",
    labelPos: [186, 210] as const,
    appear: 0.028,
    arrive: 0.098,
    leave: 0.19,
    filed: 0.226,
  },
  {
    origin: [150, 372] as const, // register (bottom source)
    flank: [184, 300] as const,
    label: "amends § 42",
    labelPos: [184, 330] as const,
    appear: 0.04,
    arrive: 0.11,
    leave: 0.202,
    filed: 0.238,
  },
];
const DRAWER: [number, number] = [258, 244];

function SiblingDoc({ s }: { s: (typeof SIBLINGS)[number] }) {
  const [ox, oy] = s.origin;
  const [fx, fy] = s.flank;
  // the doc rides to the drawer MOUTH, then sinks INTO the tray — fading
  // exactly during the sink so it reads as swallowed, not vanished. A file
  // tab pops up in the drawer at the same beat (see Corpus).
  const mouth: [number, number] = [DRAWER[0], DRAWER[1] - 14];
  const sunk: [number, number] = [DRAWER[0], DRAWER[1] + 4];
  return (
    <g opacity="0">
      <Vis a={s.appear} b={s.filed + 0.002} r={0.014} />
      <Ride
        stops={[[ox, oy], [ox, oy], [fx, fy], [fx, fy], mouth, sunk, sunk]}
        scales={[0.3, 0.3, 0.5, 0.5, 0.24, 0.13, 0.13]}
        times={[0, s.appear, s.arrive, s.leave, s.filed - 0.012, s.filed + 0.006, 1]}
      />
      <Sheet x={-32} y={-42} w={64} h={84}>
        <path d="M 14 -42 L 32 -42 L 32 -26 Z" fill={H.fine} stroke={INK} strokeWidth="0.6" />
        <line x1={-22} y1={-28} x2={4} y2={-28} stroke={INK} strokeWidth="2" opacity="0.85" />
        {[-12, 2, 16, 30].map((y) => (
          <line key={y} x1={-22} y1={y} x2={y === 30 ? 8 : 22} y2={y} stroke={INK} strokeWidth="0.8" opacity="0.55" />
        ))}
      </Sheet>
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
      {/* the two docs, mid-intake, reference each other */}
      <path className="ill-loop" d="M 196 254 C 206 264, 206 272, 196 282" markerEnd="url(#ill-ref-arr)" />
      <path className="ill-loop" d="M 178 282 C 168 272, 168 264, 178 254" markerEnd="url(#ill-ref-arr)" />
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
      {/* the hero is PULLED FROM the corpus — only once the sibling docs
          have finished filing (they settle ~0.226 / 0.238). It emerges from
          the drawer, grows, and slides to center stage to be encoded. */}
      <Ride
        stops={[DRAWER, DRAWER, [DOC.x, DOC.y], [DOC.x, DOC.y]]}
        scales={[0.16, 0.16, 1, 1]}
        times={[0, 0.24, 0.275, 1]}
      />
      <VisHold a={0.24} r={0.014} dim={0.45} rest={0.4} />

      <Ground cx={4} cy={116} rx={98} ry={16} />
      {/* the certificate page: double-ruled like the frame it lives in */}
      <rect x={-85} y={-105} width={170} height={210} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="1.3" />
      <rect x={-79} y={-99} width={158} height={198} fill="none" stroke={INK} strokeWidth="0.5" opacity="0.6" />
      {/* title */}
      <line x1={-65} y1={-88} x2={0} y2={-88} stroke={INK} strokeWidth="2.4" opacity="0.9" />
      <text className="ill-code" style={{ fontSize: "11px" }} x="30" y="-84">{"§ 42"}</text>

      {SECTIONS.map(({ key, top, scanAt }) => (
        <g key={key}>
          {/* the amber glow as the scan reaches this section */}
          <rect x="-72" y={top - 6} width="144" height="40" fill="rgba(163,91,20,0.14)" opacity="0">
            <Flash ts={[scanAt - 0.008]} hold={0.03} />
          </rect>
          <text className="ill-code" style={{ fontSize: "9.5px" }} x="-65" y={top + 4}>{`§ 42(${key})`}</text>
          <line className="ill-ink" x1="-65" y1={top + 14} x2="62" y2={top + 14} strokeWidth="1.2" />
          <line className="ill-ink" x1="-65" y1={top + 26} x2="34" y2={top + 26} strokeWidth="1.2" />
        </g>
      ))}

      {/* the registrar's stamp, applied at capture: an amber rosette */}
      <g opacity="0" transform="translate(56, 80)">
        <VisHold a={0.14} r={0.015} />
        <Rosette r={13} accent />
      </g>

      {/* the encoding scan: amber line + engraved magnifier sweeping down */}
      <g opacity="0">
        <Vis a={0.278} b={0.402} r={0.01} max={0.95} />
        <animateTransform
          attributeName="transform"
          type="translate"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          calcMode="linear"
          values="0 -76;0 -76;0 80;0 80"
          keyTimes="0;0.278;0.40;1"
        />
        <line stroke={WAX} strokeWidth="1.8" x1="-78" y1="0" x2="78" y2="0" />
        <circle cx="92" cy="0" r="17" fill="rgba(163,91,20,0.06)" stroke={INK} strokeWidth="1.6" />
        <circle cx="92" cy="0" r="13.5" fill="none" stroke={INK} strokeWidth="0.5" opacity="0.6" />
        <line x1="104" y1="12" x2="117" y2="26" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
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
  const lane: [number, number] = [712, 274];
  const exit: [number, number] = [1012, 274];
  const stops: ReadonlyArray<readonly [number, number]> = f.flawed
    ? [origin, origin, f.slot, f.slot, lane, [ARCHES[2], 274], [ARCHES[2], 274], exit, f.bookSlot, f.bookSlot]
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
      {/* the card: a small bordered certificate with a name tab */}
      <rect x={-46} y={-24} width={92} height={48} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="1" />
      <rect x={-43} y={-21} width={86} height={42} fill="none" stroke={INK} strokeWidth="0.45" opacity="0.55" />
      <rect x={-46} y={-36} width={64} height={12} fill={H.fine} stroke={INK} strokeWidth="0.8" />
      <text className="ill-code" style={{ fontSize: "8px" }} x="-41" y="-27">{f.name}</text>
      <line x1={-46} y1={-24} x2={-46} y2={24} stroke={WAX} strokeWidth="2.5" />
      <line x1="-34" y1="-8" x2="26" y2="-8" stroke={INK} strokeWidth="0.7" opacity="0.4" />
      {f.flawed ? (
        <>
          <text className="ill-code" style={{ fontSize: "10.5px" }} x="-34" y="12" opacity="1">
            {f.code}
            <animate
              attributeName="opacity"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              values="1;1;0;0;1"
              keyTimes={`0;${REDRAFT.gone};${REDRAFT.gone + 0.006};0.995;1`}
            />
          </text>
          <line stroke={WAX} strokeWidth="2.2" x1="-37" y1="8" x2="34" y2="8" opacity="0">
            <animate
              attributeName="opacity"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              values="0;0;1;1;0;0"
              keyTimes={`0;${REDRAFT.strike};${REDRAFT.strike + 0.008};${REDRAFT.gone};${REDRAFT.gone + 0.006};1`}
            />
          </line>
          <text className="ill-code" style={{ fontSize: "10.5px" }} x="-34" y="12" opacity="0">
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
        <text className="ill-code" style={{ fontSize: "10.5px" }} x="-34" y="12">{f.code}</text>
      )}
    </g>
  );
}

// an engraved triumphal arch — the intaglio portals of the gauntlet.
// Hatched intrados gives each opening depth; a keystone crowns it.
function Gate({ cx }: { cx: number }) {
  return (
    <g>
      <Ground cx={cx} cy={303} rx={36} ry={6} />
      {/* piers */}
      <rect x={cx - 27} y={252} width={13} height={46} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="1" />
      <rect x={cx + 14} y={252} width={13} height={46} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="1" />
      <rect x={cx - 21} y={252} width={7} height={46} fill={H.vert} opacity="0.4" />
      <rect x={cx + 20} y={252} width={7} height={46} fill={H.vert} opacity="0.4" />
      {/* arch */}
      <path
        d={`M ${cx - 27} 252 A 27 26 0 0 1 ${cx + 27} 252`}
        fill="var(--color-paper-elevated)"
        stroke={INK}
        strokeWidth="1"
      />
      <path
        d={`M ${cx - 14} 252 A 14 14 0 0 1 ${cx + 14} 252 L ${cx + 14} 298 L ${cx - 14} 298 Z`}
        fill={H.cross}
        stroke={INK}
        strokeWidth="0.8"
        opacity="0.5"
      />
      {/* voussoir hairlines + keystone */}
      <path d={`M ${cx - 21} 247 A 21 20 0 0 1 ${cx + 21} 247`} fill="none" stroke={INK} strokeWidth="0.5" opacity="0.7" />
      <rect x={cx - 4} y={224} width={8} height={11} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="0.9" />
      {/* cornice */}
      <line x1={cx - 31} y1={236} x2={cx + 31} y2={236} stroke={INK} strokeWidth="1.3" />
      <line x1={cx - 29} y1={239} x2={cx + 29} y2={239} stroke={INK} strokeWidth="0.5" opacity="0.6" />
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
      <VisHold a={0.415} r={0.016} dim={0.672} rest={0.45} />
      {ARCHES.map((cx, i) => (
        <g key={cx}>
          <Gate cx={cx} />
          <text className="ill-caption" x={cx} y="322" textAnchor="middle">{labels[i]}</text>
          <text className="ill-check" style={{ fontSize: "15px" }} x={cx} y="212" textAnchor="middle" opacity="0">
            ✓
            <Flash ts={flashes[i]} />
          </text>
          {i === 2 && (
            <text className="ill-check" style={{ fontSize: "15px", fill: WAX }} x={cx} y="212" textAnchor="middle" opacity="0">
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
      <VisHold a={0.672} r={0.018} />
      <Ground cx={4} cy={76} rx={64} />
      {/* the bound volume: cover, hatched spine, ruled page block */}
      <rect x={-52} y={-68} width={104} height={136} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="1.3" />
      <rect x={-52} y={-68} width={13} height={136} fill={H.cross} stroke={INK} strokeWidth="0.8" opacity="0.6" />
      {/* page block on the fore-edge */}
      {[44, 46.5, 49].map((x) => (
        <line key={x} x1={x} y1={-64} x2={x} y2={64} stroke={INK} strokeWidth="0.5" opacity="0.6" />
      ))}
      {/* cover: double rule + engraved title */}
      <rect x={-32} y={-58} width={68} height={116} fill="none" stroke={INK} strokeWidth="0.9" />
      <rect x={-28.5} y={-54.5} width={61} height={109} fill="none" stroke={INK} strokeWidth="0.45" opacity="0.6" />
      <line x1={-18} y1={-28} x2={24} y2={-28} stroke={INK} strokeWidth="2.2" opacity="0.9" />
      <text className="ill-code" style={{ fontSize: "11.5px" }} x="-18" y="-4">{"§ 42 ✓"}</text>
      {/* ribbon bookmark */}
      <path d="M 26 -68 h 9 v 28 l -4.5 -6 l -4.5 6 Z" fill={WAX} />
      {/* the wax seal pops on: amber wax bearing the rosette die */}
      <g opacity="0" transform="translate(2, 30)">
        <animate
          attributeName="opacity"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          values="0;0;1;1;0;0"
          keyTimes={`0;0.72;0.732;${END};${CLEAR};1`}
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
        <polygon fill={WAX} opacity="0.85" points="2,2 11,26 6,22 2,28 -2,22 -7,26" />
        <circle fill={WAX} r="13.5" />
        <g opacity="0.9" transform="scale(0.92)">
          <Rosette r={11} />
        </g>
      </g>
    </g>
  );
}

// ── act six: everywhere ───────────────────────────────────────────────

const DEVICES: Array<{ tx: number; ty: number; anchor: [number, number]; badge: [number, number]; fly: number }> = [
  { tx: 1226, ty: 78, anchor: [1272, 112], badge: [1314, 138], fly: 0.795 }, // browser
  { tx: 1312, ty: 230, anchor: [1358, 256], badge: [1400, 278], fly: 0.815 }, // terminal
  { tx: 1222, ty: 362, anchor: [1256, 392], badge: [1284, 404], fly: 0.835 }, // agent
];

function Devices() {
  return (
    <g>
      {/* browser */}
      <g opacity="0" transform={`translate(${DEVICES[0].tx}, ${DEVICES[0].ty})`}>
        <VisHold a={0.775} r={0.015} />
        <Ground cx={46} cy={70} rx={50} ry={9} />
        <rect x={0} y={0} width={92} height={64} rx={3} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="1.1" />
        <path d="M 0 16 L 92 16" stroke={INK} strokeWidth="0.8" />
        <rect x={0} y={0} width={92} height={16} rx={3} fill={H.fine} opacity="0.4" />
        <circle cx="9" cy="8" r="1.8" fill="none" stroke={INK} strokeWidth="0.6" />
        <circle cx="16" cy="8" r="1.8" fill="none" stroke={INK} strokeWidth="0.6" />
        <rect x="26" y="5" width="58" height="6" rx="3" fill="none" stroke={INK} strokeWidth="0.5" opacity="0.6" />
        {[30, 42].map((y) => (
          <line key={y} x1="10" y1={y} x2="66" y2={y} stroke={INK} strokeWidth="0.9" opacity="0.5" />
        ))}
        <line x1="10" y1="54" x2="42" y2="54" stroke={WAX} strokeWidth="2.2" />
      </g>
      {/* API terminal: an aquatint plate — dense crosshatch ground */}
      <g opacity="0" transform={`translate(${DEVICES[1].tx}, ${DEVICES[1].ty})`}>
        <VisHold a={0.795} r={0.015} />
        <Ground cx={46} cy={58} rx={50} ry={9} />
        <rect x={0} y={0} width={92} height={52} rx={3} fill={INK} stroke={INK} strokeWidth="1" />
        <rect x={2} y={2} width={88} height={48} rx={2} fill="none" stroke="var(--color-paper-elevated)" strokeWidth="0.5" opacity="0.4" />
        <text className="ill-code" style={{ fontSize: "10px", fill: "#efece2" }} x="9" y="20">{"> snap(42)"}</text>
        <text className="ill-code" style={{ fontSize: "10px", fill: "#d99a4e" }} x="9" y="38">{"$291 ▌"}</text>
      </g>
      {/* AI agent: an engraved speech plate */}
      <g opacity="0" transform={`translate(${DEVICES[2].tx}, ${DEVICES[2].ty})`}>
        <VisHold a={0.815} r={0.015} />
        <Ground cx={33} cy={58} rx={40} ry={8} />
        <path
          d="M 6 14 h 52 a6 6 0 0 1 6 6 v 22 a6 6 0 0 1 -6 6 h -26 l -11 11 v -11 h -15 a6 6 0 0 1 -6 -6 v -22 a6 6 0 0 1 6 -6 Z"
          fill="var(--color-paper-elevated)"
          stroke={INK}
          strokeWidth="1.1"
        />
        <path
          d="M 8.5 16.5 h 47 a4 4 0 0 1 4 4 v 17 a4 4 0 0 1 -4 4 h -47 a4 4 0 0 1 -4 -4 v -17 a4 4 0 0 1 4 -4 Z"
          fill="none"
          stroke={INK}
          strokeWidth="0.45"
          opacity="0.55"
        />
        <text className="ill-code" style={{ fontSize: "10px" }} x="12" y="33">{"§ cited"}</text>
        <line x1="32" y1="14" x2="32" y2="6" stroke={INK} strokeWidth="1" />
        <circle cx="32" cy="4" r="3" fill={WAX} />
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
            <rect x="-9" y="-12" width="18" height="24" fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="1" />
            <line x1="-5" y1="-5" x2="5" y2="-5" stroke={WAX} strokeWidth="1.3" />
            <line x1="-5" y1="1" x2="3" y2="1" stroke={INK} strokeWidth="0.8" opacity="0.55" />
          </g>
        );
      })}

      {/* arrival marks: a tiny amber rosette stamps each surface */}
      {DEVICES.map(({ badge: [bx, by], fly }, i) => (
        <g key={i} opacity="0" transform={`translate(${bx}, ${by})`}>
          <animate
            attributeName="opacity"
            dur={`${CYCLE}s`}
            repeatCount="indefinite"
            values="0;0;1;1;0;0"
            keyTimes={`0;${fly + 0.053};${fly + 0.061};${END};${CLEAR};1`}
          />
          <circle r="4.5" fill="var(--color-paper)" />
          <Rosette r={4.5} accent />
        </g>
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
    </g>
  );
}

// the chapter rail: the six progress dots double as controls. Click (or
// Enter) jumps the film's clock to that act; the stamp beside them pauses
// and resumes. The SMIL timeline stays the single source of truth — these
// only steer its clock.
function Chapters({
  onJump,
  paused,
  onToggle,
}: {
  onJump: (i: number) => void;
  paused: boolean;
  onToggle: () => void;
}) {
  const px = CXC + 92;
  return (
    <g>
      {CAPTIONS.map(({ w, name }, i) => {
        const x = CXC - 60 + i * 24;
        return (
          <g
            key={i}
            role="button"
            tabIndex={0}
            aria-label={`Jump to “${name}”`}
            style={{ cursor: "pointer", outline: "none" }}
            onClick={() => onJump(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onJump(i);
            }}
          >
            <title>{name}</title>
            <circle cx={x} cy={514} r={9} fill="transparent" />
            <circle stroke={INK} strokeWidth="0.9" cx={x} cy="514" r="3.2" fill="none" opacity="0.5" />
            <circle cx={x} cy="514" r="3.2" fill={WAX} opacity="0">
              <VisHold a={w[0]} r={0.01} />
            </circle>
          </g>
        );
      })}
      <g
        role="button"
        tabIndex={0}
        aria-label={paused ? "Play the film" : "Pause the film"}
        style={{ cursor: "pointer", outline: "none" }}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle();
        }}
      >
        <title>{paused ? "Play" : "Pause"}</title>
        <circle cx={px} cy={514} r={8.5} fill="var(--color-paper)" stroke={INK} strokeWidth="0.7" opacity="0.75" />
        {paused ? (
          <path d={`M ${px - 2.4} 510.4 L ${px - 2.4} 517.6 L ${px + 3.6} 514 Z`} fill={INK} opacity="0.8" />
        ) : (
          <>
            <rect x={px - 3.2} y={510.6} width="2.3" height="6.8" fill={INK} opacity="0.8" />
            <rect x={px + 1} y={510.6} width="2.3" height="6.8" fill={INK} opacity="0.8" />
          </>
        )}
      </g>
    </g>
  );
}

// engraver's plate: hatch patterns and markers
function EngraveDefs() {
  return (
    <defs>
      <pattern id="e-hatch-fine" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="3.2" stroke={INK} strokeWidth="0.55" opacity="0.26" />
      </pattern>
      <pattern id="e-hatch-cross" width="3" height="3" patternUnits="userSpaceOnUse">
        <path d="M 0 3 L 3 0 M 0 0 L 3 3" stroke={INK} strokeWidth="0.5" opacity="0.3" />
      </pattern>
      <pattern id="e-hatch-vert" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
        <line x1="1.4" y1="0" x2="1.4" y2="2.8" stroke={INK} strokeWidth="0.55" opacity="0.28" />
      </pattern>
      <pattern id="e-hatch-horiz" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
        <line x1="0" y1="1.4" x2="2.8" y2="1.4" stroke={INK} strokeWidth="0.5" opacity="0.24" />
      </pattern>
      <marker id="ill-ref-arr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5.5" markerHeight="5.5" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill="rgba(163,91,20,0.75)" />
      </marker>
      <marker id="ill-intake-arr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill={INK} opacity="0.55" />
      </marker>
    </defs>
  );
}

// ── reduced-motion fallback: the story as one composed still ──────────

function StaticStory() {
  return (
    <svg className="ill" viewBox="0 0 1420 540" role="img" aria-label="The life of a rule: laws from many sources are captured into the corpus; each section of a document is encoded into its own rulespec file; the files pass four gates, are sealed into the rulebook, and delivered to the web, the API, and AI agents.">
      <EngraveDefs />
      <Frame />
      <Sources />
      <Corpus />
      <g transform={`translate(${DOC.x}, ${DOC.y})`}>
        <Ground cx={4} cy={116} rx={98} ry={16} />
        <rect x={-85} y={-105} width={170} height={210} fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="1.3" />
        <rect x={-79} y={-99} width={158} height={198} fill="none" stroke={INK} strokeWidth="0.5" opacity="0.6" />
        <line x1={-65} y1={-88} x2={0} y2={-88} stroke={INK} strokeWidth="2.4" opacity="0.9" />
        <text className="ill-code" style={{ fontSize: "11px" }} x="30" y="-84">{"§ 42"}</text>
        {SECTIONS.map(({ key, top }) => (
          <g key={key}>
            <text className="ill-code" style={{ fontSize: "9.5px" }} x="-65" y={top + 4}>{`§ 42(${key})`}</text>
            <line className="ill-ink" x1="-65" y1={top + 14} x2="62" y2={top + 14} strokeWidth="1.2" />
            <line className="ill-ink" x1="-65" y1={top + 26} x2="34" y2={top + 26} strokeWidth="1.2" />
          </g>
        ))}
        <g transform="translate(56, 80)">
          <Rosette r={13} accent />
        </g>
      </g>
      <g>
        {ARCHES.map((cx, i) => (
          <g key={cx}>
            <Gate cx={cx} />
            <text className="ill-check" style={{ fontSize: "15px" }} x={cx} y="212" textAnchor="middle">✓</text>
            <text className="ill-caption" x={cx} y="322" textAnchor="middle">{["run", "checks", "compare", "review"][i]}</text>
          </g>
        ))}
      </g>
      <SealedBook />
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
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [paused, setPaused] = useState(false);

  // steer the SMIL clock: jump lands just inside the act so its caption
  // and actors are already on stage; pause freezes the whole film.
  const jump = (i: number) => {
    svgRef.current?.setCurrentTime((CAPTIONS[i].w[0] + 0.018) * CYCLE);
  };
  const toggle = () => {
    const svg = svgRef.current;
    if (!svg) return;
    if (paused) svg.unpauseAnimations();
    else svg.pauseAnimations();
    setPaused(!paused);
  };

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
        ref={svgRef}
        className="ill"
        viewBox="0 0 1420 540"
        role="img"
        aria-label="The life of a rule, as a looping film: documents from the legislature, an agency, and the register cross-reference each other and are filed into the corpus; the hero document is encoded section by section, each section producing its own rulespec file; the files pass through four gates — one failure is redrafted in place — then stack into the sealed rulebook, and copies fly out to the web, the API, and AI agents."
      >
        <EngraveDefs />
        <Frame />
        <Sources />
        <Intake />
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
        <Chapters onJump={jump} paused={paused} onToggle={toggle} />
      </svg>
    </div>
  );
}
