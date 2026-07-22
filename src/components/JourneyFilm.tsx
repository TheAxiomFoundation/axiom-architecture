// The Journey: one continuous shot, five scenes, one SMIL clock.
//
//   I    THE LAW, WHOLE     the wall of 1.7M provision-cells — vastness
//   II   ONE PROVISION      camera dives into a single cell: the statute
//                           is segmented, each section encoded, and each
//                           encoding walked through the four gates
//   III  THE GRAPH          validated rules join the axiom graph — every
//                           rule a node, typed and cited, linked to the
//                           concepts it draws on
//   IV   THE CONSTELLATION  the camera backs out — really far. The hero
//                           graph becomes one cluster among sixteen: the
//                           live runtime registry, real IDs, real counts,
//                           a bright island in the dim not-yet-encoded
//                           field.
//
// Transitions carry the zoom story: scene I exits by scaling INTO the
// target cell; scene IV is one long pull-back. Everything else is
// crossfade. Reduced motion gets scene II as a composed still.

import { useEffect, useRef } from "react";
import {
  CLUSTERS,
  CO_SNAP_DOCS,
  CO_SNAP_XLINKS,
  PROGRAM_COUNT,
  SNAPSHOT_DATE,
  type Cluster,
  type DocNode,
} from "./registry-snapshot";

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
  s3: [0.48, 0.585],
  s4: [0.585, 0.8],
} as const;

const CAPTIONS = [
  { w: W.s1, name: "The law, whole", sub: "1,742,391 provisions · green = encoded & verified — the grey ones are next" },
  { w: W.s2, name: "One provision, encoded", sub: "segmented — each section encoded, each encoding through the four gates" },
  { w: W.s3, name: "The graph", sub: "every rule is a node — typed, cited, connected to the concepts it draws on" },
  { w: W.s4, name: "The graph, whole", sub: "the live runtime registry — every cluster a compiled program, every count real" },
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
        <text className="jw-doceyebrow" x={page.x + page.w / 2} y={page.y + page.h - 18} textAnchor="middle">
          as published · amended through 2026
        </text>
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
        <text className="jw-doceyebrow" x={DOC.x + DOC.w / 2} y={DOC.y + DOC.h - 18} textAnchor="middle">
          as published · amended through 2026
        </text>
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
  const s0 = 1.06;
  const sMid = 1.0;
  const s1 = 0.55; // the big reveal: half scale by scene's end
  return (
    <Scene w={W.s3}>
      {/* slow pull-back while the graph grows — it outgrows the frame */}
      <g>
        {!STATIC && (
          <>
            <animateTransform
              attributeName="transform"
              type="translate"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0 0 1 1;0.3 0 0.4 1;0.5 0 0.3 1;0 0 1 1;0.55 0 0.8 0.6;0 0 1 1"
              values={`${cx * (1 - s0)} ${cy * (1 - s0)};${cx * (1 - s0)} ${cy * (1 - s0)};${cx * (1 - sMid)} ${cy * (1 - sMid)};${cx * (1 - s1)} ${cy * (1 - s1)};${cx * (1 - s1)} ${cy * (1 - s1)};${cx * 0.84} ${cy * 0.84};${cx * 0.84} ${cy * 0.84}`}
              keyTimes={`0;${W.s3[0]};0.515;0.558;0.566;${W.s3[1] + 0.005};1`}
            />
            <animateTransform
              attributeName="transform"
              type="scale"
              additive="sum"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0 0 1 1;0.3 0 0.4 1;0.5 0 0.3 1;0 0 1 1;0.55 0 0.8 0.6;0 0 1 1"
              values={`${s0};${s0};${sMid};${s1};${s1};0.16;0.16`}
              keyTimes={`0;${W.s3[0]};0.515;0.558;0.566;${W.s3[1] + 0.005};1`}
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

// ── scene IV: the constellation — the registry, backed all the way out ─
//
// The hero graph recedes and becomes one cluster among sixteen: the
// LIVE runtime registry, real package IDs, real rule counts (baked in
// registry-snapshot.ts). co-snap's interior is its actual document
// graph — the CDHS benefit-calculation hub and the source documents its
// 168 rules cite, edges from the dependency API. Then the camera backs
// out really far: the whole registry becomes a small bright island in
// the dim field of everything not yet encoded.

const CAM_T = [0, 0.585, 0.598, 0.652, 0.664, 0.748, 1];
const CAM_S = [8, 8, 8, 1.15, 1.15, 0.3, 0.3];
const CAM_SPL = "0 0 1 1;0 0 1 1;0.45 0 0.2 1;0 0 1 1;0.5 0 0.15 1;0 0 1 1";

function rot32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DOC_TINT: Record<DocNode["kind"], string> = {
  hub: "var(--color-ink)",
  "state-reg": OK,
  "fed-reg": "#3f7050",
  statute: WAX,
  policy: "#5c6470",
};

// the dim field: everything the registry hasn't reached yet — visible
// only once the camera is far enough out to see past the registry
const DIM_DOTS = (() => {
  const rng = rot32(41);
  const out: Array<[number, number, number]> = [];
  while (out.length < 130) {
    const x = -2600 + rng() * 6600;
    const y = -1250 + rng() * 3100;
    if (x > 60 && x < 1360 && y > 60 && y < 560) continue; // keep the registry's clearing
    out.push([x, y, 1.8 + rng() * 3.4]);
  }
  return out;
})();

function ClusterBlob({ c, i }: { c: Cluster; i: number }) {
  const at = c.id === "co-snap" ? W.s4[0] : 0.598 + i * 0.004;
  const label = `${c.id} · ${c.count.toLocaleString()}`;
  if (c.id === "co-snap") {
    // the real document graph, node size = rules citing that document
    return (
      <g opacity={O2()}>
        <Vis a={at} b={W.s4[1] - 0.004} r={0.01} />
        <circle cx={c.x} cy={c.y} r={c.r * 1.3} fill={OK} opacity="0.06" />
        {CO_SNAP_DOCS.map((d) =>
          d.kind === "hub" ? null : (
            <line
              key={`e-${d.id}`}
              x1={c.x} y1={c.y} x2={c.x + d.dx} y2={c.y + d.dy}
              stroke="rgba(22,101,52,0.3)" strokeWidth="0.4"
            />
          ),
        )}
        {CO_SNAP_XLINKS.map(([f, t]) => {
          const a = CO_SNAP_DOCS.find((d) => d.id === f)!;
          const b = CO_SNAP_DOCS.find((d) => d.id === t)!;
          return (
            <line
              key={`x-${f}-${t}`}
              x1={c.x + a.dx} y1={c.y + a.dy} x2={c.x + b.dx} y2={c.y + b.dy}
              stroke="rgba(146,64,14,0.4)" strokeWidth="0.4"
            />
          );
        })}
        {CO_SNAP_DOCS.map((d) => (
          <g key={d.id}>
            <circle
              cx={c.x + d.dx} cy={c.y + d.dy} r={1.2 + 0.75 * Math.sqrt(d.count)}
              fill={DOC_TINT[d.kind]} opacity={d.kind === "hub" ? 0.9 : 0.8}
            />
            <text className="jw-clusterdoc" x={c.x + d.dx} y={c.y + d.dy - (1.2 + 0.75 * Math.sqrt(d.count)) - 1.2} textAnchor="middle">
              {d.label}
            </text>
          </g>
        ))}
        <text className="jw-cluster" x={c.x} y={c.y + c.r + 12} textAnchor="middle">{label}</text>
      </g>
    );
  }
  const rng = rot32(500 + i * 17);
  const n = Math.round(Math.min(26, 7 + c.count / 30));
  const dots: Array<[number, number, number]> = Array.from({ length: n }, () => {
    const u = rng() * Math.PI * 2;
    const rad = c.r * (0.2 + 0.68 * Math.sqrt(rng()));
    return [c.x + Math.cos(u) * rad, c.y + Math.sin(u) * rad * 0.9, 1.3 + rng() * 1.4];
  });
  return (
    <g opacity={O2()}>
      <Vis a={at} b={W.s4[1] - 0.004} r={0.012} />
      <circle cx={c.x} cy={c.y} r={c.r * 1.25} fill={OK} opacity="0.06" />
      {dots.map(([x, y], k) =>
        k % 3 === 0 ? null : (
          <line key={`e${k}`} x1={c.x} y1={c.y} x2={x} y2={y} stroke="rgba(22,101,52,0.22)" strokeWidth="0.4" />
        ),
      )}
      {dots.map(([x, y, r], k) => (
        <circle key={k} cx={x} cy={y} r={r} fill={OK} opacity="0.75" />
      ))}
      <circle cx={c.x} cy={c.y} r="2.6" fill={OK} />
      <text className="jw-cluster" x={c.x} y={c.y + c.r * 1.25 + 9} textAnchor="middle">{label}</text>
    </g>
  );
}

function SceneConstellation() {
  return (
    <Scene w={W.s4}>
      {/* the camera: enters tight on co-snap (where the hero graph
          receded to), then backs out — twice */}
      <g>
        {!STATIC && (
          <>
            <animateTransform
              attributeName="transform"
              type="translate"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines={CAM_SPL}
              values={CAM_S.map((s) => `${710 * (1 - s)} ${300 * (1 - s)}`).join(";")}
              keyTimes={CAM_T.join(";")}
            />
            <animateTransform
              attributeName="transform"
              type="scale"
              additive="sum"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines={CAM_SPL}
              values={CAM_S.join(";")}
              keyTimes={CAM_T.join(";")}
            />
          </>
        )}
        {/* the not-yet-encoded dark matter, revealed by distance */}
        <g opacity={O2()}>
          <Vis a={0.68} b={W.s4[1] - 0.004} r={0.03} max={0.5} />
          {DIM_DOTS.map(([x, y, r], k) => (
            <circle key={k} cx={x} cy={y} r={r} fill={INK} opacity="0.35" />
          ))}
        </g>
        {CLUSTERS.map((c, i) => (
          <ClusterBlob key={c.id} c={c} i={i} />
        ))}
      </g>

      {/* the ledger line, in screen space: what you are looking at */}
      <g opacity={O2()}>
        <Vis a={0.754} b={W.s4[1] - 0.004} r={0.008} />
        <g filter="url(#jw-shadow)">
          <rect x="475" y="428" width="470" height="66" rx="6" fill="var(--color-paper-elevated)" stroke="var(--color-rule)" strokeWidth="1" />
        </g>
        <rect x="475" y="428" width="470" height="3" rx="1.5" fill={WAX} />
        <text className="jw-chip1" x="710" y="456" textAnchor="middle">
          {`the runtime registry · ${PROGRAM_COUNT} programs compiled`}
        </text>
        <text className="jw-chip2" x="710" y="478" textAnchor="middle">
          {`3,323 rules · certified & signed · registry snapshot ${SNAPSHOT_DATE}`}
        </text>
      </g>
    </Scene>
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
        aria-label="One continuous shot, five scenes. First, the whole law: a wall of 1,742,391 provision-cells across seven jurisdictions, almost all lit green — encoded and verified — with a few grey holdouts remaining. The camera dives into one cell: the statute is segmented into sections, each section encoded into a RuleSpec — id, citation, typed inputs and output, and the formula allotment equals tfp minus 0.30 times net income, every value citing its source words, and each encoding walked through the four gates — run, checks, compare, review; one cites the wrong section, is caught by compare, redrafted, and passes. The validated rules then join the axiom graph as nodes — typed, cited, connected to the concepts they draw on; on the graph's output layer, two composed nodes declare their types and compute live answers: snap/benefit, money per month, $478, and snap/eligible, boolean, yes. Then the camera backs out, far: the graph becomes the co-snap cluster — its real document graph, the CDHS benefit-calculation hub citing Colorado regulations, 7 CFR 273, 7 U.S.C. chapter 51, and USDA cost-of-living tables — and co-snap becomes one cluster among sixteen: the live runtime registry, from us-sc-snap at 1,327 rules to us-oasdi-wage-tax at 6, every ID and count real. Backing out further still, the whole registry is a small bright island in a dim field of everything not yet encoded, stamped: the runtime registry, 16 programs compiled, 3,323 rules certified and signed."
      >
        <Defs />
        <SceneWall />
        <SceneProvision />
        <CellToPage />
        <SceneGraph />
        <Travelers />
        <SceneConstellation />
        <Captions />
      </svg>
    </div>
  );
}
