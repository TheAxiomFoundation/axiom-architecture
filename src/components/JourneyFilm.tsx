// The Journey: one continuous shot, five scenes, one SMIL clock.
//
//   I    THE LAW, WHOLE     the wall of 1.7M provision-cells — vastness
//   II   ONE PROVISION      camera dives into a single cell: the statute
//                           is segmented, each section encoded, and each
//                           encoding walked through the four gates
//   III  THE GRAPH          validated rules join the axiom graph — every
//                           rule a node, typed and cited, linked to the
//                           concepts it draws on
//   IV   THE GRAPH, WHOLE   no cut, no new format: the same camera keeps
//                           pulling back and the same cards keep coming —
//                           co-snap's own rules, then every compiled
//                           program in the live registry (real IDs, real
//                           counts), then the ghost cards of everything
//                           not yet encoded.
//
// Transitions carry the zoom story: scene I exits by scaling INTO the
// target cell; scene III/IV is one long pull-back. Everything else is
// crossfade. Reduced motion gets scene II as a composed still.

import { useEffect, useRef } from "react";
import { CLUSTERS, CO_SNAP_RING, OUTPUTS } from "./registry-snapshot";

const CYCLE = 56;

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const STATIC = REDUCED_MOTION;

const INK = "var(--color-ink)";
const WAX = "var(--color-accent)";
const OK = "var(--color-success)";

// scene windows (fractions of the cycle)
const W = {
  s1: [0.012, 0.175],
  s2: [0.183, 0.48],
  s3: [0.48, 0.87],
} as const;

const CAPTIONS = [
  { w: W.s1, name: "The law, whole", sub: "1,742,391 provisions · green = encoded & verified — the grey ones are next" },
  { w: W.s2, name: "One provision, encoded", sub: "segmented — each section encoded, each encoding through the four gates" },
  { w: [0.48, 0.583] as const, name: "The graph", sub: "every rule is a node — typed, cited, connected to the concepts it draws on" },
  { w: [0.59, 0.648] as const, name: "One rule, many programs", sub: "the state programs import the federal core — the dependencies are real" },
  { w: [0.655, 0.87] as const, name: "The graph, whole", sub: "same cards, farther back — the live runtime registry, every count real" },
];

// ── SMIL helpers ──────────────────────────────────────────────────────

function Vis({ a, b, r = 0.016, max = 1 }: { a: number; b: number; r?: number; max?: number }) {
  if (STATIC) return null;
  // clamp: a must precede b, and the ramps must not cross the window
  // midpoint — otherwise the keyTimes go non-monotonic and SMIL rejects
  // the whole animation
  const a2 = Math.min(a, b - 0.002);
  const m = (a2 + b) / 2;
  return (
    <animate
      attributeName="opacity"
      dur={`${CYCLE}s`}
      repeatCount="indefinite"
      values={`0;0;${max};${max};0;0`}
      keyTimes={`0;${a2};${Math.min(a2 + r, m)};${Math.max(b - r, m)};${Math.min(b, 0.999)};1`}
    />
  );
}

// a scene layer: crossfades over its window, with an optional scale cue
// around a focus point (zoom-in exit / zoom-out entry)
function Scene({
  w,
  cue,
  focus = [710, 310],
  zoomTo,
  children,
  staticVisible = false,
}: {
  w: readonly [number, number];
  cue?: "zoomInExit" | "zoomInEnter" | "zoomOutEnter";
  focus?: readonly [number, number];
  // deep zoom: scale factor + the screen point the focus should land on,
  // so the focused cell literally grows into the next scene's subject
  zoomTo?: { s: number; to: readonly [number, number] };
  children: React.ReactNode;
  staticVisible?: boolean;
}) {
  const [a, b] = w;
  if (STATIC) {
    return staticVisible ? <g>{children}</g> : null;
  }
  const [fx, fy] = focus;
  let scaleAnim: React.ReactNode = null;
  if (cue === "zoomInExit") {
    const s = zoomTo?.s ?? 2.6;
    const [gx, gy] = zoomTo?.to ?? [fx, fy];
    const tx = gx - s * fx;
    const ty = gy - s * fy;
    scaleAnim = (
      <>
        <animateTransform
          attributeName="transform"
          type="translate"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0 0 1 1;0 0 1 1;0.6 0 0.9 0.5;0 0 1 1"
          values={`0 0;0 0;0 0;${tx} ${ty};${tx} ${ty}`}
          keyTimes={`0;${a};${b - 0.05};${b + 0.008};1`}
        />
        <animateTransform
          attributeName="transform"
          type="scale"
          additive="sum"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0 0 1 1;0 0 1 1;0.6 0 0.9 0.5;0 0 1 1"
          values={`1;1;1;${s};${s}`}
          keyTimes={`0;${a};${b - 0.05};${b + 0.008};1`}
        />
      </>
    );
  } else if (cue === "zoomInEnter") {
    const s = 0.8;
    scaleAnim = (
      <>
        <animateTransform
          attributeName="transform"
          type="translate"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0 0 1 1;0.2 0.6 0.35 1;0 0 1 1;0 0 1 1"
          values={`${fx * (1 - s)} ${fy * (1 - s)};${fx * (1 - s)} ${fy * (1 - s)};0 0;0 0;0 0`}
          keyTimes={`0;${a - 0.005};${a + 0.05};${b};1`}
        />
        <animateTransform
          attributeName="transform"
          type="scale"
          additive="sum"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0 0 1 1;0.2 0.6 0.35 1;0 0 1 1;0 0 1 1"
          values={`${s};${s};1;1;1`}
          keyTimes={`0;${a - 0.005};${a + 0.05};${b};1`}
        />
      </>
    );
  } else if (cue === "zoomOutEnter") {
    const s = 1.18;
    scaleAnim = (
      <>
        <animateTransform
          attributeName="transform"
          type="translate"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0 0 1 1;0.2 0.6 0.35 1;0 0 1 1;0 0 1 1"
          values={`${fx * (1 - s)} ${fy * (1 - s)};${fx * (1 - s)} ${fy * (1 - s)};0 0;0 0;0 0`}
          keyTimes={`0;${a - 0.005};${a + 0.045};${b};1`}
        />
        <animateTransform
          attributeName="transform"
          type="scale"
          additive="sum"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0 0 1 1;0.2 0.6 0.35 1;0 0 1 1;0 0 1 1"
          values={`${s};${s};1;1;1`}
          keyTimes={`0;${a - 0.005};${a + 0.045};${b};1`}
        />
      </>
    );
  }
  return (
    <g opacity="0">
      <Vis a={a} b={b} />
      {scaleAnim}
      {children}
    </g>
  );
}

// ── scene I: the wall ─────────────────────────────────────────────────

const PITCH = 13;
const WALL = { x: 72, y: 84, cols: 98, rows: 26 };
const WALL_W = WALL.cols * PITCH;
const WALL_H = WALL.rows * PITCH; // 338
const COLS = [
  { label: "eCFR", cells: 9 },
  { label: "US Code", cells: 8 },
  { label: "Guidance", cells: 7 },
  { label: "State codes", cells: 43 },
  { label: "UK", cells: 13 },
  { label: "Canada", cells: 11 },
  { label: "Belgium", cells: 7 },
];
let cum = 0;
const COL_X = COLS.map((c) => {
  const x0 = WALL.x + cum * PITCH;
  cum += c.cells;
  return { ...c, x0, x1: WALL.x + cum * PITCH, cx: x0 + (c.cells * PITCH) / 2 };
});
// the few provisions NOT yet encoded — grey holdouts in a green field;
// the dive targets one of them
const S1_GREY: ReadonlyArray<readonly [number, number]> = [
  [7, 5], [23, 20], [36, 9], [61, 22], [72, 4], [88, 15], [94, 24], [15, 14],
];
const TARGET_CELL: [number, number] = [49, 17];
const TC = {
  x: WALL.x + TARGET_CELL[0] * PITCH + PITCH / 2,
  y: WALL.y + TARGET_CELL[1] * PITCH + PITCH / 2,
};

function SceneWall() {
  // the dive: the cell grows 26× until it lands exactly where scene II's
  // statute page sits — the cell IS the document
  return (
    <Scene w={W.s1} cue="zoomInExit" focus={[TC.x, TC.y]} zoomTo={{ s: 26, to: [400, 305] }}>
      {COL_X.map((c) => (
        <text key={c.label} className="jw-collabel" x={c.cx} y="66" textAnchor="middle">
          {c.label}
        </text>
      ))}
      <rect x={WALL.x} y={WALL.y} width={WALL_W} height={WALL_H} fill="url(#jw-cell)" />
      {COL_X.slice(1).map((c) => (
        <line key={c.label} x1={c.x0} y1={WALL.y - 2} x2={c.x0} y2={WALL.y + WALL_H + 2} stroke="var(--color-paper)" strokeWidth="3" />
      ))}
      <rect x={WALL.x - 3} y={WALL.y - 3} width={WALL_W + 6} height={WALL_H + 6} fill="none" stroke={INK} strokeWidth="1" opacity="0.5" />
      {[...S1_GREY, TARGET_CELL].map(([col, row]) => (
        <rect
          key={`${col}-${row}`}
          x={WALL.x + col * PITCH + 1.5}
          y={WALL.y + row * PITCH + 1.5}
          width={PITCH - 3}
          height={PITCH - 3}
          rx="1"
          fill="var(--color-paper)"
          stroke="rgba(28,25,23,0.35)"
          strokeWidth="0.7"
        />
      ))}
      {/* the dive target gets its ring; the CellToPage bridge carries the
          cell itself across the transition */}
      <rect
        x={TC.x - PITCH / 2 - 2}
        y={TC.y - PITCH / 2 - 2}
        width={PITCH + 4}
        height={PITCH + 4}
        rx="2"
        fill="none"
        stroke={WAX}
        strokeWidth="1.4"
        opacity="0"
      >
        <Vis a={W.s1[1] - 0.075} b={W.s1[1] - 0.045} r={0.01} />
      </rect>
    </Scene>
  );
}

// the same element, transforming: a bridge rect starts glued to the
// growing cell (same window + easing as the wall's zoom), survives scene
// I's fade, and reshapes into scene II's page. Its interior swaps from
// micro text-lines to the real title as it arrives.
function CellToPage() {
  if (STATIC) return null;
  const t0 = W.s1[1] - 0.05; // zoom start — matches SceneWall's exit cue
  const t1 = W.s1[1] + 0.008; // zoom end — matches too
  const cell = { x: TC.x - PITCH / 2 + 1, y: TC.y - PITCH / 2 + 1, w: PITCH - 2, h: PITCH - 2 };
  const page = { x: 250, y: 130, w: 300, h: 350 };
  const SPL = "0 0 1 1;0.6 0 0.9 0.5;0 0 1 1";
  const attrs: Array<[string, number, number]> = [
    ["x", cell.x, page.x],
    ["y", cell.y, page.y],
    ["width", cell.w, page.w],
    ["height", cell.h, page.h],
  ];
  return (
    <g opacity="0">
      <Vis a={W.s1[1] - 0.075} b={0.206} r={0.004} />
      <rect rx="4" fill="var(--color-paper-elevated)" stroke={WAX} strokeWidth="1.1">
        {!STATIC && (
          <animate
            attributeName="stroke"
            dur={`${CYCLE}s`}
            repeatCount="indefinite"
            calcMode="linear"
            values="#92400e;#92400e;#1c1917;#1c1917"
            keyTimes={`0;${t1 - 0.014};${t1};1`}
          />
        )}
        {attrs.map(([name, f, t]) => (
          <animate
            key={name}
            attributeName={name}
            dur={`${CYCLE}s`}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines={SPL}
            values={`${f};${f};${t};${t}`}
            keyTimes={`0;${t0};${t1};1`}
          />
        ))}
      </rect>
      {/* the cell carries the ACTUAL page — the full typeset content at
          microprint scale, riding the zoom from illegible to legible and
          arriving at exactly the final layout */}
      <g opacity="0">
        <Vis a={W.s1[1] - 0.075} b={0.204} r={0.004} />
        {!STATIC && (
          <>
            <animateTransform
              attributeName="transform"
              type="translate"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines={SPL}
              values={`${cell.x - (cell.w / page.w) * page.x} ${cell.y - (cell.h / page.h) * page.y};${cell.x - (cell.w / page.w) * page.x} ${cell.y - (cell.h / page.h) * page.y};0 0;0 0`}
              keyTimes={`0;${t0};${t1};1`}
            />
            <animateTransform
              attributeName="transform"
              type="scale"
              additive="sum"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines={SPL}
              values={`${cell.w / page.w} ${cell.h / page.h};${cell.w / page.w} ${cell.h / page.h};1 1;1 1`}
              keyTimes={`0;${t0};${t1};1`}
            />
          </>
        )}
        <rect
          x={page.x + 8}
          y={page.y + 8}
          width={page.w - 16}
          height={page.h - 16}
          fill="none"
          stroke={INK}
          strokeWidth="0.5"
          opacity="0.4"
          vectorEffect="non-scaling-stroke"
        />
        <text className="jw-doceyebrow" x={page.x + page.w / 2} y={page.y + 32} textAnchor="middle">
          united states code · title 7 · chapter 51
        </text>
        <text className="jw-docserif" x={page.x + page.w / 2} y={page.y + 60} textAnchor="middle">
          {"§ 2017 · Value of allotment"}
        </text>
        <line x1={page.x + 24} y1={page.y + 74} x2={page.x + page.w - 24} y2={page.y + 74} stroke={INK} strokeWidth="1.3" opacity="0.8" />
        <line x1={page.x + 24} y1={page.y + 77.5} x2={page.x + page.w - 24} y2={page.y + 77.5} stroke={INK} strokeWidth="0.5" opacity="0.5" />
        {SECTIONS.map(({ key, label, y }) => (
          <g key={key}>
            <text className="jw-seckey" x={page.x + 26} y={y}>{`(${key})`}</text>
            <text className="jw-seclabel" x={page.x + 52} y={y}>{label}</text>
            {[
              [26, page.w - 50],
              [26, page.w - 50],
              [26, (page.w - 50) * 0.62],
            ].map(([x0, len], r) => (
              <line
                key={r}
                x1={page.x + x0}
                y1={y + 13 + r * 10}
                x2={page.x + x0 + len}
                y2={y + 13 + r * 10}
                stroke={INK}
                strokeWidth="1.1"
                opacity="0.28"
              />
            ))}
          </g>
        ))}
      </g>
    </g>
  );
}

// ── scene II: one provision — segment, encode, validate ──────────────

const SECTIONS = [
  { key: "a", label: "Value of allotment", y: 240 },
  { key: "b", label: "Eligibility", y: 330 },
  { key: "c", label: "Rounding", y: 420 },
];
// the three nodes broken out of the document — born in the SAME card
// design the graph uses, so scene III is a homecoming, not a costume change
const NCOL = { x: 620, ys: [170, 285, 400] };
const RULES = ["snap/allotment", "snap/eligibility", "snap/rounding"];
const SEG_T = [0.202, 0.216, 0.23]; // bracket flash → node pop
// the hero pass: ONE node opens into a workbench and walks the whole
// ritual — quote the words, encode them, face the four gates, get caught,
// redraft, pass, seal — then folds back into a plain node
const WB = { x: 880, y: 168, w: 390, h: 290 };
const HERO = {
  fly: 0.25,
  open: 0.264,
  quote: 0.274,
  code: 0.296, // the spec writes itself, line by line — readable pace
  formula: 0.336,
  run: 0.35,
  checks: 0.364,
  flag: 0.378, // compare ✗ — the draft disagrees with independent calcs
  strike: 0.39,
  fixed: 0.4,
  repass: 0.412,
  review: 0.422,
  close: 0.455, // hold the finished spec + stamped gates before folding
  closed: 0.463,
  others: [0.457, 0.464], // the other two get their stamps in fast-forward
};
const GATE_NAMES = ["run", "checks", "compare", "review"];

function SceneProvision() {
  const DOC = { x: 250, y: 130, w: 300, h: 350 };
  const heroGateAt = [HERO.run, HERO.checks, HERO.repass, HERO.review];
  return (
    <Scene w={W.s2} staticVisible>
      {/* the statute page — typeset like a page of the Code, not a wireframe */}
      <g filter="url(#jw-shadow)">
        <rect x={DOC.x} y={DOC.y} width={DOC.w} height={DOC.h} rx="4" fill="var(--color-paper-elevated)" stroke={INK} strokeWidth="1.1" />
      </g>
      <rect x={DOC.x + 8} y={DOC.y + 8} width={DOC.w - 16} height={DOC.h - 16} fill="none" stroke={INK} strokeWidth="0.5" opacity="0.4" />
      {/* masthead — arrives only after the box has settled */}
      <g opacity={O2()}>
        {!STATIC && <Vis a={0.19} b={W.s2[1] - 0.004} r={0.012} />}
        <text className="jw-doceyebrow" x={DOC.x + DOC.w / 2} y={DOC.y + 32} textAnchor="middle">
          united states code · title 7 · chapter 51
        </text>
        <text className="jw-docserif" x={DOC.x + DOC.w / 2} y={DOC.y + 60} textAnchor="middle">
          {"§ 2017 · Value of allotment"}
        </text>
        <line x1={DOC.x + 24} y1={DOC.y + 74} x2={DOC.x + DOC.w - 24} y2={DOC.y + 74} stroke={INK} strokeWidth="1.3" opacity="0.8" />
        <line x1={DOC.x + 24} y1={DOC.y + 77.5} x2={DOC.x + DOC.w - 24} y2={DOC.y + 77.5} stroke={INK} strokeWidth="0.5" opacity="0.5" />
      </g>
      {SECTIONS.map(({ key, label, y }, i) => (
        <g key={key}>
          <g opacity={O2()}>
            {!STATIC && <Vis a={0.196 + i * 0.004} b={W.s2[1] - 0.004} r={0.012} />}
            <text className="jw-seckey" x={DOC.x + 26} y={y}>{`(${key})`}</text>
            <text className="jw-seclabel" x={DOC.x + 52} y={y}>{label}</text>
            {/* the body: a justified paragraph in miniature */}
            {[
              [26, DOC.w - 50],
              [26, DOC.w - 50],
              [26, (DOC.w - 50) * 0.62],
            ].map(([x0, len], r) => (
              <line
                key={r}
                x1={DOC.x + x0}
                y1={y + 13 + r * 10}
                x2={DOC.x + x0 + len}
                y2={y + 13 + r * 10}
                stroke={INK}
                strokeWidth="1.1"
                opacity="0.28"
              />
            ))}
          </g>
          {/* the segmentation bracket hugs its block */}
          <path
            d={`M ${DOC.x + 16} ${y - 11} h -5 v 47 h 5`}
            fill="none"
            stroke={WAX}
            strokeWidth="1.6"
            opacity={O2()}
          >
            <Vis a={SEG_T[i]} b={W.s2[1] - 0.01} r={0.008} />
          </path>
          {/* the leader lives only while its node is actually home: it
              lets go when the hero leaves for the workbench, returns with
              the sealed node, and releases again when the card departs
              for the graph */}
          <path
            className="jw-leader"
            d={`M ${DOC.x + DOC.w} ${y + 8} C ${DOC.x + DOC.w + 50} ${y + 8}, ${NCOL.x - 40} ${NCOL.ys[i] + 25}, ${NCOL.x - 4} ${NCOL.ys[i] + 25}`}
            opacity={O2()}
          >
            {!STATIC &&
              (i === 0 ? (
                <animate
                  attributeName="opacity"
                  dur={`${CYCLE}s`}
                  repeatCount="indefinite"
                  values="0;0;1;1;0;0"
                  keyTimes={`0;${SEG_T[0] + 0.01};${SEG_T[0] + 0.022};${HERO.fly};${HERO.fly + 0.008};1`}
                />
              ) : (
                <Vis a={SEG_T[i] + 0.01} b={0.404 + i * 0.006} r={0.01} />
              ))}
          </path>
        </g>
      ))}

      {/* nodes two and three: broken out, waiting their turn — then
          stamped in fast-forward once the hero has shown the ritual */}
      {[1, 2].map((i) => {
        const y = NCOL.ys[i];
        const done = HERO.others[i - 1];
        return (
          <g key={i} opacity={O2()}>
            <Vis a={SEG_T[i] + 0.012} b={W.s2[1] - 0.004} r={0.012} />
            <g filter="url(#jw-shadow)">
              <rect x={NCOL.x} y={y} width={NODE_W} height={NODE_H} rx="4" fill="var(--color-paper-elevated)" stroke="var(--color-rule)" strokeWidth="1" />
            </g>
            <rect x={NCOL.x} y={y} width={NODE_W} height="3" rx="1.5" fill="var(--color-rule-strong)" />
            <rect x={NCOL.x} y={y} width={NODE_W} height="3" rx="1.5" fill={OK} opacity={O2()}>
              <Vis a={done} b={W.s2[1] - 0.004} r={0.008} />
            </rect>
            <text className="jw-nodeeyebrow" x={NCOL.x + 12} y={y + 19}>
              <tspan fill={WAX}>¶</tspan>
              {"  rulespec-us"}
            </text>
            <text className="jw-nodetitle" x={NCOL.x + 12} y={y + 38}>{RULES[i]}</text>
            {/* the stamp, in shorthand — the ritual the hero played in full */}
            <text className="jw-gatetick" x={NCOL.x + NODE_W + 14} y={y + 32} opacity="0">
              <Vis a={done} b={done + 0.024} r={0.006} />
              ✓✓✓✓
            </text>
            <text className="jw-nodecheck" x={NCOL.x + NODE_W - 14} y={y + 38} textAnchor="end" opacity={O2()}>
              ✓
              <Vis a={done + 0.014} b={W.s2[1] - 0.004} r={0.008} />
            </text>
          </g>
        );
      })}

      {/* the hero node: the same card, opening into a workbench — one
          element throughout, just as the cell became the page */}
      <g opacity={O2()}>
        <Vis a={SEG_T[0] + 0.012} b={W.s2[1] - 0.004} r={0.012} />
        <g filter="url(#jw-shadow)">
          <rect
            rx="4"
            fill="var(--color-paper-elevated)"
            stroke="var(--color-rule)"
            strokeWidth="1"
            x={STATIC ? WB.x : NCOL.x}
            y={STATIC ? WB.y : NCOL.ys[0]}
            width={STATIC ? WB.w : NODE_W}
            height={STATIC ? WB.h : NODE_H}
          >
            {!STATIC &&
              (
                [
                  ["x", NCOL.x, WB.x],
                  ["y", NCOL.ys[0], WB.y],
                  ["width", NODE_W, WB.w],
                  ["height", NODE_H, WB.h],
                ] as Array<[string, number, number]>
              ).map(([name, from, to]) => (
                <animate
                  key={name}
                  attributeName={name}
                  dur={`${CYCLE}s`}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0 0 1 1;0.3 0 0.25 1;0 0 1 1;0.3 0 0.25 1;0 0 1 1"
                  values={`${from};${from};${to};${to};${from};${from}`}
                  keyTimes={`0;${HERO.fly};${HERO.open};${HERO.close};${HERO.closed};1`}
                />
              ))}
          </rect>
        </g>
        {/* closed, before the ritual */}
        {!STATIC && (
          <g opacity="0">
            <Vis a={SEG_T[0] + 0.012} b={HERO.fly + 0.004} r={0.012} />
            <rect x={NCOL.x} y={NCOL.ys[0]} width={NODE_W} height="3" rx="1.5" fill="var(--color-rule-strong)" />
            <text className="jw-nodeeyebrow" x={NCOL.x + 12} y={NCOL.ys[0] + 19}>
              <tspan fill={WAX}>¶</tspan>
              {"  rulespec-us"}
            </text>
            <text className="jw-nodetitle" x={NCOL.x + 12} y={NCOL.ys[0] + 38}>{RULES[0]}</text>
          </g>
        )}
        {/* open: the workbench */}
        <g opacity={O2()}>
          {!STATIC && <Vis a={HERO.open - 0.002} b={HERO.close} r={0.008} />}
          <rect x={WB.x} y={WB.y} width={WB.w} height="3" rx="1.5" fill={WAX} />
          <text className="jw-nodeeyebrow" x={WB.x + 18} y={WB.y + 26}>
            <tspan fill={WAX}>¶</tspan>
            {"  rulespec-us"}
          </text>
          <text className="jw-nodetitle" x={WB.x + 18} y={WB.y + 46}>{RULES[0]}</text>
          <line x1={WB.x + 18} y1={WB.y + 58} x2={WB.x + WB.w - 18} y2={WB.y + 58} stroke={INK} strokeWidth="0.6" opacity="0.35" />
          {/* the words */}
          <g opacity={O2()}>
            {!STATIC && <Vis a={HERO.quote} b={HERO.close} r={0.01} />}
            <text className="jw-wbserif" x={WB.x + 18} y={WB.y + 86}>…reduced by an amount equal to</text>
            <text className="jw-wbserif" x={WB.x + 18} y={WB.y + 104}>
              <tspan fill={WAX}>30 per centum</tspan>
              {" of the household’s income…"}
            </text>
          </g>
          {/* the encoding — an actual RuleSpec, written line by line;
              the first draft's coefficient is wrong by 100× */}
          <g opacity={O2()}>
            {!STATIC && <Vis a={HERO.code} b={HERO.close} r={0.01} />}
            {[
              ["format:", " rulespec/v1"],
              ["imports:", " us:statutes/7/2017/a"],
              ["name:", " snap_allotment · kind: derived"],
              ["entity:", " Household · dtype: Money · period: Month"],
            ].map(([k, v], i) => (
              <text key={k} className="jw-wbyaml" x={WB.x + 18} y={WB.y + 124 + i * 15} opacity={O2()}>
                {!STATIC && <Vis a={HERO.code + i * 0.008} b={HERO.close} r={0.006} />}
                <tspan className="jw-wbkey">{k}</tspan>
                {v}
              </text>
            ))}
          </g>
          <g opacity={O2()}>
            {!STATIC && <Vis a={HERO.formula} b={HERO.close} r={0.008} />}
            <text className="jw-wbcode" x={WB.x + 18} y={WB.y + 196} opacity={STATIC ? 0 : 1}>
              {"formula: max(0, tfp − "}
              <tspan fill={WAX}>0.03</tspan>
              {" × net_income)"}
              {!STATIC && (
                <animate
                  attributeName="opacity"
                  dur={`${CYCLE}s`}
                  repeatCount="indefinite"
                  values="1;1;0;0;1"
                  keyTimes={`0;${HERO.fixed};${HERO.fixed + 0.004};0.995;1`}
                />
              )}
            </text>
            <line x1={WB.x + 190} y1={WB.y + 192} x2={WB.x + 222} y2={WB.y + 192} stroke={WAX} strokeWidth="1.8" opacity="0">
              {!STATIC && <Vis a={HERO.strike} b={HERO.fixed} r={0.005} />}
            </line>
            <text className="jw-wbcode" x={WB.x + 18} y={WB.y + 196} opacity={O2()}>
              {"formula: max(0, tfp − "}
              <tspan fill={WAX}>0.30</tspan>
              {" × net_income)"}
              {!STATIC && <Vis a={HERO.fixed} b={HERO.close} r={0.006} />}
            </text>
            <text className="jw-wbproof" x={WB.x + 18} y={WB.y + 216} opacity={O2()}>
              {"proof: 0.30 ← “30 per centum” · tfp ← “thrifty food plan”"}
              {!STATIC && <Vis a={HERO.fixed + 0.006} b={HERO.close} r={0.006} />}
            </text>
          </g>
          {/* the four gates — named chips, waiting, then stamped one at a time */}
          <line x1={WB.x + 18} y1={WB.y + 232} x2={WB.x + WB.w - 18} y2={WB.y + 232} stroke={INK} strokeWidth="0.6" opacity="0.35" />
          {GATE_NAMES.map((g, j) => {
            const gx = WB.x + 16 + j * 92;
            const gy = WB.y + 240;
            return (
              <g key={g}>
                {!STATIC && (
                  <g opacity="0">
                    <Vis a={HERO.open + 0.004} b={j === 2 ? HERO.flag : heroGateAt[j]} r={0.006} />
                    <rect className="jw-gatechip jw-gatechip--pending" x={gx} y={gy} width="84" height="24" rx="12" />
                    <text className="jw-gatetick jw-gatetick--pending" x={gx + 12} y={gy + 16}>
                      {"· "}
                      <tspan className="jw-gatetick-name">{g}</tspan>
                    </text>
                  </g>
                )}
                <g opacity={O2()}>
                  {!STATIC && <Vis a={heroGateAt[j]} b={HERO.close} r={0.008} />}
                  <rect className="jw-gatechip" x={gx} y={gy} width="84" height="24" rx="12" />
                  <text className="jw-gatetick" x={gx + 12} y={gy + 16}>
                    {"✓ "}
                    <tspan className="jw-gatetick-name">{g}</tspan>
                  </text>
                </g>
                {j === 2 && !STATIC && (
                  <g opacity="0">
                    <Vis a={HERO.flag} b={HERO.repass - 0.004} r={0.006} />
                    <rect className="jw-gatechip jw-gatechip--fail" x={gx} y={gy} width="84" height="24" rx="12" />
                    <text className="jw-gatetick jw-gatetick--fail" x={gx + 12} y={gy + 16}>
                      {"✗ "}
                      <tspan className="jw-gatetick-name">{g}</tspan>
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          <text className="jw-redraft" x={WB.x + WB.w - 18} y={WB.y + 229} textAnchor="end" opacity="0">
            ✗ disagrees with independent calculators — redrafted
            {!STATIC && <Vis a={HERO.flag} b={HERO.repass} r={0.006} />}
          </text>
        </g>
        {/* closed again — a plain node, now sealed */}
        {!STATIC && (
          <g opacity="0">
            <Vis a={HERO.closed} b={W.s2[1] - 0.004} r={0.008} />
            <rect x={NCOL.x} y={NCOL.ys[0]} width={NODE_W} height="3" rx="1.5" fill={OK} />
            <text className="jw-nodeeyebrow" x={NCOL.x + 12} y={NCOL.ys[0] + 19}>
              <tspan fill={WAX}>¶</tspan>
              {"  rulespec-us"}
            </text>
            <text className="jw-nodetitle" x={NCOL.x + 12} y={NCOL.ys[0] + 38}>{RULES[0]}</text>
            <text className="jw-nodecheck" x={NCOL.x + NODE_W - 14} y={NCOL.ys[0] + 38} textAnchor="end">✓</text>
          </g>
        )}
      </g>
    </Scene>
  );
}

// helper: initial opacity for elements that animate in (visible in static)
function O2() {
  return STATIC ? 1 : 0;
}

// ── scene III: the graph ──────────────────────────────────────────────

type GNode = {
  id: string;
  x: number;
  y: number;
  glyph: string;
  repo: string;
  title: string;
  fresh?: boolean; // one of the three just-validated rules
  at: number;
  outType?: string; // output nodes: the declared type…
  value?: string; // …and the value that computes once wired
  vAt?: number;
};
// the three fresh rules appear when their card ARRIVES from scene II
const ARRIVE = [0.504, 0.514, 0.525];
const NODES: GNode[] = [
  { id: "tfp", x: 180, y: 130, glyph: "¶", repo: "rulespec-us", title: "tfp/amount", at: 0.485 },
  { id: "inc", x: 150, y: 270, glyph: "¶", repo: "rulespec-us", title: "income/net", at: 0.49 },
  { id: "fpl", x: 180, y: 410, glyph: "¶", repo: "rulespec-us", title: "fpl/threshold", at: 0.495 },
  { id: "allot", x: 560, y: 150, glyph: "¶", repo: "rulespec-us", title: "snap/allotment", fresh: true, at: ARRIVE[0] },
  { id: "elig", x: 530, y: 300, glyph: "¶", repo: "rulespec-us", title: "snap/eligibility", fresh: true, at: ARRIVE[1] },
  { id: "round", x: 850, y: 420, glyph: "¶", repo: "rulespec-us", title: "snap/rounding", fresh: true, at: ARRIVE[2] },
  { id: "benefit", x: 1150, y: 190, glyph: "◇", repo: "axiom-compose", title: "snap/benefit", at: 0.5, outType: "money/month", value: "$478", vAt: 0.546 },
  { id: "eligible", x: 1150, y: 360, glyph: "◇", repo: "axiom-compose", title: "snap/eligible", at: 0.503, outType: "boolean", value: "yes", vAt: 0.553 },
];
const NODE_W = 190;
const NODE_H = 50;
const EDGES: Array<{ from: string; to: string; at: number }> = [
  { from: "tfp", to: "allot", at: 0.505 },
  { from: "inc", to: "allot", at: 0.511 },
  { from: "inc", to: "elig", at: 0.516 },
  { from: "fpl", to: "elig", at: 0.522 },
  { from: "allot", to: "round", at: 0.527 },
  { from: "elig", to: "eligible", at: 0.532 },
  { from: "round", to: "benefit", at: 0.538 },
];
const nodeById = (id: string) => NODES.find((n) => n.id === id)!;



function GraphNode({ n }: { n: GNode }) {
  return (
    <g opacity={O2()}>
      <Vis a={n.at} b={W.s3[1] - 0.005} r={0.012} />
      <g filter="url(#jw-shadow)">
        <rect x={n.x} y={n.y} width={NODE_W} height={NODE_H} rx="4" fill="var(--color-paper-elevated)" stroke="var(--color-rule)" strokeWidth="1" />
      </g>
      <rect x={n.x} y={n.y} width={NODE_W} height="3" rx="1.5" fill={n.fresh ? OK : "var(--color-rule-strong)"} />
      <text className="jw-nodeeyebrow" x={n.x + 12} y={n.y + 19}>
        <tspan fill={WAX}>{n.glyph}</tspan>
        {`  ${n.repo}`}
        {n.outType ? <tspan fill="var(--color-ink-muted)">{` · ${n.outType}`}</tspan> : null}
      </text>
      <text className="jw-nodetitle" x={n.x + 12} y={n.y + 38}>{n.title}</text>
      {n.fresh && (
        <text className="jw-nodecheck" x={n.x + NODE_W - 16} y={n.y + 38} textAnchor="end">✓</text>
      )}
      {n.value && (
        <text className="jw-nodevalue" x={n.x + NODE_W - 14} y={n.y + 38} textAnchor="end" opacity={O2()}>
          {n.value}
          {!STATIC && <Vis a={n.vAt ?? n.at} b={W.s3[1] - 0.003} r={0.01} />}
        </text>
      )}
    </g>
  );
}

function SceneGraph() {
  const cx = 710;
  const cy = 300;
  // one continuous pull-back: hero graph → co-snap's rules → the whole
  // registry → the far field. Same cards at every distance.
  const CAMT = [0, W.s3[0], 0.515, 0.558, 0.588, 0.618, 0.638, 0.79, 1];
  const CAMS = [1.06, 1.06, 1.0, 0.55, 0.55, 0.4, 0.4, 0.026, 0.026];
  const CAMSPL = "0 0 1 1;0.3 0 0.4 1;0.5 0 0.3 1;0 0 1 1;0.45 0 0.25 1;0 0 1 1;0.4 0 0.1 1;0 0 1 1";
  return (
    <Scene w={W.s3}>
      <g>
        {!STATIC && (
          <>
            <animateTransform
              attributeName="transform"
              type="translate"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines={CAMSPL}
              values={CAMS.map((sc) => `${cx * (1 - sc)} ${cy * (1 - sc)}`).join(";")}
              keyTimes={CAMT.join(";")}
            />
            <animateTransform
              attributeName="transform"
              type="scale"
              additive="sum"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines={CAMSPL}
              values={CAMS.join(";")}
              keyTimes={CAMT.join(";")}
            />
          </>
        )}
        {EDGES.map(({ from, to, at }) => {
          const f = nodeById(from);
          const t = nodeById(to);
          const x0 = f.x + NODE_W;
          const y0 = f.y + NODE_H / 2;
          const x1 = t.x;
          const y1 = t.y + NODE_H / 2;
          const m = (x0 + x1) / 2;
          return (
            <path
              key={`${from}-${to}`}
              className="jw-edge"
              d={`M ${x0} ${y0} C ${m} ${y0}, ${m} ${y1}, ${x1 - 6} ${y1}`}
              markerEnd="url(#jw-earr)"
              opacity={O2()}
            >
              <Vis a={at} b={W.s3[1] - 0.005} r={0.012} />
            </path>
          );
        })}
        <text className="jw-gatehead" x="1245" y="172" textAnchor="middle" opacity={O2()}>
          {!STATIC && <Vis a={0.5} b={W.s3[1] - 0.003} r={0.012} />}
          outputs · typed & executable
        </text>
        {NODES.map((n) => (
          <GraphNode key={n.id} n={n} />
        ))}
        {/* co-snap's own rules join around the hero — real names */}
        {CO_SNAP_RING.map((t, i) => {
          const [rx, ry] = RING_POS[i];
          const hub = nearestNode(rx + NODE_W / 2, ry + NODE_H / 2);
          const at = 0.588 + i * 0.0025;
          const c1 = [rx + NODE_W / 2, ry + NODE_H / 2] as const;
          const c2 = [hub.x + NODE_W / 2, hub.y + NODE_H / 2] as const;
          const p1 = toEdge(c2[0], c2[1], c1[0], c1[1]);
          const p2 = toEdge(c1[0], c1[1], c2[0], c2[1]);
          return (
            <g key={t}>
              <line
                x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]}
                stroke="rgba(87,83,78,0.3)" strokeWidth="0.9" vectorEffect="non-scaling-stroke" opacity={O2()}
              >
                <Vis a={at} b={W.s3[1] - 0.004} r={0.012} max={0.8} />
              </line>
              <WideCard x={rx} y={ry} title={t} at={at} />
            </g>
          );
        })}
        {/* the dependents draw amber threads into the federal core */}
        {STATE_SNAPS.map((id, i) => {
          const [wx, wy] = WORLD_POS[id];
          const hub = nearestNode(wx, wy);
          const hc = [hub.x + NODE_W / 2, hub.y + NODE_H / 2] as const;
          const p1 = toEdge(hc[0], hc[1], wx, wy);
          const p2 = toEdge(wx, wy, hc[0], hc[1]);
          return (
            <line
              key={`dep-${id}`}
              x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]}
              stroke="rgba(146,64,14,0.4)" strokeWidth="1.3" vectorEffect="non-scaling-stroke" markerEnd="url(#jw-earr)" opacity={O2()}
            >
              {/* a dependents-stage device: the screen-sized arrowheads
                  must not ride into the deep zoom */}
              <Vis a={0.602 + i * 0.002} b={0.7} r={0.012} max={0.85} />
            </line>
          );
        })}
        <text className="jw-worldlabel" x={710} y={880} textAnchor="middle" opacity={O2()}>
          <Vis a={0.634} b={W.s3[1] - 0.004} r={0.014} max={0.85} />
          co-snap · 168 rules
        </text>
        {/* …then every compiled program in the registry, as more of the
            same cards */}
        {CLUSTERS.filter((c) => c.id !== "co-snap").map((c, i) => (
          <ProgramGroup key={c.id} id={c.id} count={c.count} i={i} />
        ))}
        {/* the fabric between the real groups */}
        {REAL_WEB.map(([a, b], k) => {
          const p1 = toEdge(b[0], b[1], a[0], a[1]);
          const p2 = toEdge(a[0], a[1], b[0], b[1]);
          return (
            <line key={`w${k}`} x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke="rgba(87,83,78,0.2)" strokeWidth="1.1" vectorEffect="non-scaling-stroke" opacity={O2()}>
              <Vis a={0.648} b={W.s3[1] - 0.004} r={0.016} max={0.8} />
            </line>
          );
        })}
        {/* …and at full distance, the sea of programs still to come */}
        {SEA.map((g, k) => (
          <SeaProgram key={k} g={g} />
        ))}
      </g>
    </Scene>
  );
}

// the bridge: the three validated cards from scene II don't die with the
// crossfade — they FLOAT into their places in the graph
function Travelers() {
  if (STATIC) return null;
  return (
    <g>
      {RULES.map((name, i) => {
        const target = [nodeById("allot"), nodeById("elig"), nodeById("round")][i];
        const dep = 0.466 + i * 0.005;
        const arr = ARRIVE[i];
        const tx = target.x - NCOL.x;
        const ty = target.y - NCOL.ys[i];
        const y = NCOL.ys[i];
        return (
          <g key={name} opacity="0">
            <Vis a={dep} b={arr + 0.006} r={0.006} />
            <animateTransform
              attributeName="transform"
              type="translate"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0 0 1 1;0.3 0 0.25 1;0 0 1 1"
              values={`0 0;0 0;${tx} ${ty};${tx} ${ty}`}
              keyTimes={`0;${dep};${arr};1`}
            />
            <g filter="url(#jw-shadow)">
              <rect x={NCOL.x} y={y} width={NODE_W} height={NODE_H} rx="4" fill="var(--color-paper-elevated)" stroke="var(--color-rule)" strokeWidth="1" />
            </g>
            <rect x={NCOL.x} y={y} width={NODE_W} height="3" rx="1.5" fill={OK} />
            <text className="jw-nodeeyebrow" x={NCOL.x + 12} y={y + 19}>
              <tspan fill={WAX}>¶</tspan>
              {"  rulespec-us"}
            </text>
            <text className="jw-nodetitle" x={NCOL.x + 12} y={y + 38}>{name}</text>
            <text className="jw-nodecheck" x={NCOL.x + NODE_W - 14} y={y + 38} textAnchor="end">✓</text>
          </g>
        );
      })}
    </g>
  );
}

// ── the wider graph: same cards, farther back ─────────────────────────
//
// The pull-back never changes the material. First co-snap's own rules
// join around the hero (real names from the package's 168 outputs),
// then every compiled program in the live registry arrives as its own
// group of the SAME cards — real IDs, real counts — and finally the
// ghost cards of everything not yet encoded. Data: registry-snapshot.ts.

function rng32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// point on the border of the NODE_W × NODE_H card centred at (tx,ty),
// along the segment toward (fx,fy) — lines and arrowheads land on card
// edges, never under faces
const toEdge = (fx: number, fy: number, tx: number, ty: number) => {
  const dx = fx - tx;
  const dy = fy - ty;
  const t = Math.min(
    NODE_W / 2 / Math.max(Math.abs(dx), 1e-9),
    NODE_H / 2 / Math.max(Math.abs(dy), 1e-9),
  );
  return [tx + dx * Math.min(t, 1), ty + dy * Math.min(t, 1)] as const;
};

const nearestNode = (x: number, y: number) => {
  let best = NODES[0];
  let bd = Infinity;
  for (const n of NODES) {
    const d = Math.hypot(n.x + NODE_W / 2 - x, n.y + NODE_H / 2 - y);
    if (d < bd) {
      bd = d;
      best = n;
    }
  }
  return best;
};

// hand-placed around the hero graph, clear of its nodes
const RING_POS: ReadonlyArray<readonly [number, number]> = [
  [-150, -150], [350, -280], [900, -320], [1400, -200], [1760, 60], [1810, 400],
  [1500, 640], [950, 710], [400, 730], [-140, 570], [-350, 230], [1150, -330],
];

// world positions. The state SNAPs sit close — they are the hero's
// dependents, revealed by the first step back; everything else lies
// farther out, met on the long glide to the sea.
const WORLD_POS: Record<string, readonly [number, number]> = {
  "us-sc-snap": [2280, -170],
  "us-nc-snap": [-840, 780],
  "us-tn-snap": [2260, 700],
  "us-al-snap": [-890, -250],
  "us-ca-snap": [640, 960],
  "us-ny-snap": [1870, -390],
  "us-az-snap": [-380, 970],
  "uk-universal-credit": [-2950, -420],
  "us-co-tanf": [-1650, 1480],
  "us-ny-tanf": [2950, 1250],
  "us-ak-atap": [-2650, 1080],
  "us-ks-tanf": [3450, 320],
  "us-il-scretd": [-3150, 680],
  "us-tx-tanf": [1250, -1350],
  "us-oasdi-wage-tax": [-950, -1520],
};

// the dependents: these programs import the federal core
const STATE_SNAPS = ["us-al-snap", "us-ca-snap", "us-nc-snap", "us-ny-snap", "us-sc-snap", "us-tn-snap", "us-az-snap"];

// the SAME card the hero graph uses — no format change at any distance
function WideCard({ x, y, title, repo = "rulespec-us", at }: { x: number; y: number; title: string; repo?: string; at: number }) {
  const est = title.length * 7.2;
  const avail = NODE_W - 24;
  return (
    <g opacity={O2()}>
      <Vis a={at} b={W.s3[1] - 0.004} r={0.012} />
      <rect x={x} y={y} width={NODE_W} height={NODE_H} rx="4" fill="var(--color-paper-elevated)" stroke="var(--color-rule)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <rect x={x} y={y} width={NODE_W} height="3" rx="1.5" fill="var(--color-rule-strong)" />
      <text className="jw-nodeeyebrow" x={x + 12} y={y + 19}>
        <tspan fill={WAX}>¶</tspan>
        {`  ${repo}`}
      </text>
      <text
        className="jw-nodetitle" x={x + 12} y={y + 38}
        {...(est > avail ? { textLength: avail, lengthAdjust: "spacingAndGlyphs" as const } : {})}
      >
        {title}
      </text>
    </g>
  );
}

// too far to read — the card again, text as hairlines
function GhostCard({ x, y, at, max = 0.55 }: { x: number; y: number; at: number; max?: number }) {
  return (
    <g opacity={O2()}>
      <Vis a={at} b={W.s3[1] - 0.004} r={0.012} max={max} />
      <rect x={x} y={y} width={NODE_W} height={NODE_H} rx="4" fill="var(--color-paper-elevated)" stroke="var(--color-rule)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <rect x={x} y={y} width={NODE_W} height="3" rx="1.5" fill="var(--color-rule-strong)" opacity="0.6" />
      <line x1={x + 12} y1={y + 17} x2={x + 74} y2={y + 17} stroke="rgba(120,113,108,0.5)" strokeWidth="2" />
      <line x1={x + 12} y1={y + 34} x2={x + 118} y2={y + 34} stroke="rgba(87,83,78,0.45)" strokeWidth="3" />
    </g>
  );
}

// one compiled program: a group of the same cards — its default outputs
// named, the rest ghosts — under a real id · count label
function ProgramGroup({ id, count, i }: { id: string; count: number; i: number }) {
  const [wx, wy] = WORLD_POS[id];
  const outs = OUTPUTS[id] ?? [];
  const rng = rng32(900 + i * 31);
  const K = Math.min(12, 3 + Math.round(count / 90));
  const at = STATE_SNAPS.includes(id) ? 0.594 + i * 0.003 : 0.655 + i * 0.004;
  const spots = Array.from({ length: Math.max(0, K - 1) }, () => {
    const u = rng() * Math.PI * 2;
    const rad = 200 + rng() * 320;
    return [wx + Math.cos(u) * rad * 1.3 - NODE_W / 2, wy + Math.sin(u) * rad * 0.75 - NODE_H / 2] as const;
  });
  return (
    <g>
      {spots.map(([sx, sy], k) => {
        const mc = [sx + NODE_W / 2, sy + NODE_H / 2] as const;
        const p1 = toEdge(mc[0], mc[1], wx, wy);
        const p2 = toEdge(wx, wy, mc[0], mc[1]);
        return (
          <line
            key={`e${k}`}
            x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]}
            stroke="rgba(87,83,78,0.28)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" opacity={O2()}
          >
            <Vis a={at} b={W.s3[1] - 0.004} r={0.012} max={0.8} />
          </line>
        );
      })}
      {spots.map(([sx, sy], k) =>
        k < outs.length - 1 ? (
          <WideCard key={`n${k}`} x={sx} y={sy} title={outs[k + 1]} repo={id.startsWith("uk") ? "rulespec-uk" : "rulespec-us"} at={at + 0.004} />
        ) : (
          <GhostCard key={`g${k}`} x={sx} y={sy} at={at + 0.006} max={0.6} />
        ),
      )}
      <WideCard x={wx - NODE_W / 2} y={wy - NODE_H / 2} title={outs[0] ?? id} repo={id.startsWith("uk") ? "rulespec-uk" : "rulespec-us"} at={at} />
      {/* low-sitting groups label above themselves — the caption zone
          at the bottom of the frame stays clear */}
      <text className="jw-worldlabel" x={wx} y={wy > 1300 ? wy - 440 : wy + 470} textAnchor="middle" opacity={O2()}>
        <Vis a={at + 0.008} b={W.s3[1] - 0.004} r={0.014} max={0.85} />
        {`${id} · ${count.toLocaleString()} rules`}
      </text>
    </g>
  );
}

// the fabric: each real group threads to its nearest neighbour
const REAL_CENTERS: Array<readonly [number, number]> = [
  [710, 300],
  ...Object.values(WORLD_POS),
];
const REAL_WEB: Array<[readonly [number, number], readonly [number, number]]> = (() => {
  const pairs: Array<[readonly [number, number], readonly [number, number]]> = [];
  const seen = new Set<string>();
  REAL_CENTERS.forEach((c, i) => {
    let bj = 0;
    let bd = Infinity;
    REAL_CENTERS.forEach((o, j) => {
      if (i === j) return;
      const d = Math.hypot(o[0] - c[0], o[1] - c[1]);
      if (d < bd) {
        bd = d;
        bj = j;
      }
    });
    const key = `${Math.min(i, bj)}-${Math.max(i, bj)}`;
    if (!seen.has(key)) {
      seen.add(key);
      pairs.push([c, REAL_CENTERS[bj]]);
    }
  });
  return pairs;
})();

// the sea: ghost programs to the horizon — the same hub-and-spoke shape
// as the real groups, text as hairlines, each threaded to a neighbour
type SeaGroup = {
  x: number;
  y: number;
  cards: Array<readonly [number, number]>;
  link?: readonly [number, number];
  far: boolean;
  at: number;
};
const SEA: SeaGroup[] = (() => {
  const rng = rng32(613);
  const centers: Array<[number, number]> = [];
  let guard = 0;
  while (centers.length < 130 && guard++ < 16000) {
    const x = 710 + (rng() - 0.5) * 50000;
    const y = 300 + (rng() - 0.5) * 23000;
    if (Math.abs(x - 710) < 3900 && Math.abs(y - 300) < 2200) continue; // the registry's clearing
    if (centers.some(([cx, cy]) => Math.hypot(cx - x, cy - y) < 1600)) continue;
    centers.push([x, y]);
  }
  return centers.map(([x, y], i) => {
    const r = rng32(1700 + i * 13);
    const n = 3 + Math.floor(r() * 4);
    const cards = Array.from({ length: n }, () => {
      const u = r() * Math.PI * 2;
      const rad = 280 + r() * 440;
      return [x + Math.cos(u) * rad * 1.3, y + Math.sin(u) * rad * 0.75] as const;
    });
    const pool: Array<readonly [number, number]> = [...centers.slice(0, i), ...REAL_CENTERS];
    let link: readonly [number, number] | undefined;
    let bd = Infinity;
    for (const c of pool) {
      const d = Math.hypot(c[0] - x, c[1] - y);
      if (d > 100 && d < bd && d < 8000) {
        bd = d;
        link = c;
      }
    }
    return { x, y, cards, link, far: Math.hypot(x - 710, y - 300) > 7000, at: 0 };
  });
})();
// rank by distance (with a little shuffle) and spread the arrivals
// evenly across the whole back half — something is ALWAYS appearing,
// through the glide and on into the held final frame
(() => {
  const rng = rng32(377);
  const order = SEA.map((g, i) => ({ i, k: Math.hypot(g.x - 710, g.y - 300) * (0.82 + rng() * 0.36) }))
    .sort((p, q) => p.k - q.k);
  order.forEach(({ i }, rank) => {
    SEA[i].at = 0.66 + (rank / (order.length - 1)) * 0.195;
  });
})();

function SeaProgram({ g }: { g: SeaGroup }) {
  return (
    <g opacity={O2()}>
      <Vis a={g.at} b={W.s3[1] - 0.004} r={0.02} max={0.6} />
      {g.link &&
        (() => {
          const p1 = toEdge(g.link[0], g.link[1], g.x, g.y);
          const p2 = toEdge(g.x, g.y, g.link[0], g.link[1]);
          return <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke="rgba(87,83,78,0.2)" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />;
        })()}
      {g.cards.map(([sx, sy], k) => {
        const p1 = toEdge(sx, sy, g.x, g.y);
        const p2 = toEdge(g.x, g.y, sx, sy);
        return <line key={`s${k}`} x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke="rgba(87,83,78,0.28)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />;
      })}
      {[[g.x, g.y] as const, ...g.cards].map(([sx, sy], k) => (
        <GhostCard key={k} x={sx - NODE_W / 2} y={sy - NODE_H / 2} at={g.at} max={1} />
      ))}
    </g>
  );
}

function Captions() {
  if (STATIC) {
    return (
      <g>
        <text className="jw-name" x="710" y="556" textAnchor="middle">
          One provision, encoded
        </text>
        <text className="jw-sub" x="710" y="580" textAnchor="middle">
          the whole law captured · segmented & encoded · graphed · certified · everywhere
        </text>
      </g>
    );
  }
  return (
    <g>
      {CAPTIONS.map(({ w, name, sub }) => (
        <g key={name} opacity="0">
          <Vis a={w[0]} b={w[1]} />
          <text className="jw-name" x="710" y="556" textAnchor="middle">{name}</text>
          <text className="jw-sub" x="710" y="580" textAnchor="middle">{sub}</text>
        </g>
      ))}
      {/* progress dots */}
      {CAPTIONS.map(({ w }, i) => {
        const x = 710 - 48 + i * 24;
        return (
          <g key={i}>
            <circle cx={x} cy={602} r="3" fill="none" stroke={INK} strokeWidth="0.9" opacity="0.4" />
            <circle cx={x} cy={602} r="3" fill={WAX} opacity="0">
              <Vis a={w[0]} b={w[1]} r={0.01} />
            </circle>
          </g>
        );
      })}
    </g>
  );
}

// ── defs & assembly ───────────────────────────────────────────────────

function Defs() {
  return (
    <defs>
      <pattern id="jw-cell" width={PITCH} height={PITCH} patternUnits="userSpaceOnUse">
        <rect x="1.5" y="1.5" width={PITCH - 3} height={PITCH - 3} rx="1" fill="rgba(22,101,52,0.38)" />
      </pattern>
      <marker id="jw-earr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill="rgba(87,83,78,0.8)" />
      </marker>
      <filter id="jw-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1c1917" floodOpacity="0.2" />
      </filter>
    </defs>
  );
}

export function JourneyFilm({
  startOffset,
  paused = false,
  endAt,
  onCycleEnd,
}: {
  startOffset?: number; // seconds into the cycle to begin at
  paused?: boolean; // hold the frame at startOffset (step-through mode)
  endAt?: number; // seconds: fire onCycleEnd here instead of at the wrap
  onCycleEnd?: () => void; // fired when the film ends (endAt or the wrap)
} = {}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (startOffset) svg.setCurrentTime(startOffset);
    if (paused) svg.pauseAnimations();
    if (!onCycleEnd || paused) return;
    let prev = svg.getCurrentTime() % CYCLE;
    const iv = window.setInterval(() => {
      const t = svg.getCurrentTime() % CYCLE;
      if (t < prev - 1 || (endAt !== undefined && t >= endAt)) {
        window.clearInterval(iv);
        onCycleEnd();
        return;
      }
      prev = t;
    }, 250);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="lsk__wrap">
      <svg
        ref={svgRef}
        className="lsk"
        viewBox="0 0 1420 620"
        role="img"
        aria-label="One continuous shot, five scenes. First, the whole law: a wall of 1,742,391 provision-cells across seven jurisdictions, almost all lit green — encoded and verified — with a few grey holdouts remaining. The camera dives into one cell: the statute is segmented into sections, each section encoded into a RuleSpec — id, citation, typed inputs and output, and the formula allotment equals tfp minus 0.30 times net income, every value citing its source words, and each encoding walked through the four gates — run, checks, compare, review; one cites the wrong section, is caught by compare, redrafted, and passes. The validated rules then join the axiom graph as nodes — typed, cited, connected to the concepts they draw on; on the graph's output layer, two composed nodes declare their types and compute live answers: snap/benefit, money per month, $478, and snap/eligible, boolean, yes. Then the camera backs out and the same cards keep coming: co-snap's own rules join around the hero graph — snap_maximum_allotment, the deductions, the eligibility tests, real names from its 168 outputs — then every compiled program in the live registry arrives as its own group of identical cards under a real label, from us-sc-snap at 1,327 rules to us-oasdi-wage-tax at 6. At full distance the encoded graph sits among the ghost cards of everything not yet encoded, stamped: the runtime registry, 16 programs compiled, 3,323 rules certified and signed."
      >
        <Defs />
        <SceneWall />
        <SceneProvision />
        <CellToPage />
        <SceneGraph />
        <Travelers />
        <Captions />
      </svg>
    </div>
  );
}
