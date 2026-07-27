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
import { CLUSTERS } from "./registry-snapshot";

export const CYCLE = 56;

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
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

// One voice throughout: the name is the story beat in plain language;
// the sub is one verifiable fact about the system — never a note about
// the film's own construction.
const CAPTIONS = [
  { w: W.s1, name: "The law, whole", sub: "1,742,391 provisions · green = encoded & verified" },
  { w: W.s2, name: "One provision, encoded", sub: "split into sections — each checked four ways: run, checks, compare, review" },
  { w: [0.48, 0.583] as const, name: "The graph", sub: "every rule is a node — typed, cited, connected" },
  { w: [0.59, 0.648] as const, name: "One rule, many programs", sub: "state programs build on the federal core — shared rules, one graph" },
  { w: [0.655, 0.87] as const, name: "The graph, whole", sub: "the live registry — 16 programs, 3,323 certified rules, and everything not yet encoded" },
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
          <text className="jw-redraft" x={WB.x + WB.w / 2} y={WB.y + 229} textAnchor="middle" opacity="0">
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
// the three fresh rules appear when their card ARRIVES from scene II.
// The flights are deliberately long (~1.7× the original timing) — in
// the scrolly the float across the stage was over in a flick and read
// as a jump, not a journey.
const ARRIVE = [0.525, 0.54, 0.555];
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
        <rect x={n.x} y={n.y} width={NODE_W} height={NODE_H} rx="4" fill="var(--color-paper-elevated)" stroke="var(--color-rule)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
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
  const CAMT = [0, W.s3[0], 0.515, 0.558, 0.588, 0.632, 0.668, 0.79, 1];
  // slightly wider stops from the registry reveal on — the richer
  // constellations need the extra room
  const CAMS = [1.06, 1.06, 1.0, 0.55, 0.55, 0.21, 0.16, 0.024, 0.024];
  const CAMSPL = "0 0 1 1;0.3 0 0.4 1;0.5 0 0.3 1;0 0 1 1;0.45 0 0.7 0.85;0.3 0.15 0.7 0.85;0.3 0.15 0.12 1;0 0 1 1";
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
        {/* every compiled program in the registry: the same structure,
            full size, under a real label */}
        {CLUSTERS.filter((c) => c.id !== "co-snap").map((c) => {
          const [wx, wy] = WORLD_POS[c.id];
          const idx = STATE_SNAPS.indexOf(c.id);
          const at = idx >= 0 ? 0.592 + idx * 0.0025 : 0.615 + (c.count % 7) * 0.003;
          return <GraphMotif key={c.id} cx={wx} cy={wy} at={at} spec={REG_SPECS[c.id]} />;
        })}
        {/* SNAP itself keeps growing: more of its rules join the core */}
        {HERO_RING.map((q, k) => {
          const [hx, hy] = q.hub;
          const ltr = hx <= q.x;
          const sx = (ltr ? hx : q.x) + NODE_W / 2;
          const sy = ltr ? hy : q.y;
          const tx = (ltr ? q.x : hx) - NODE_W / 2;
          const ty = ltr ? q.y : hy;
          const m = (sx + tx) / 2;
          return (
            <g key={`hr${k}`} opacity={O2()}>
              <Vis a={q.at} b={W.s3[1] - 0.004} r={0.014} max={0.95} />
              <path className="jw-edge" d={`M ${sx} ${sy} C ${m} ${sy}, ${m} ${ty}, ${tx - 6} ${ty}`} markerEnd="url(#jw-earr)" />
              <GhostMotifCard x={q.x - NODE_W / 2} y={q.y - NODE_H / 2} />
            </g>
          );
        })}
        {/* the wiring: the hero connects to each of its dependents… */}
        {STATE_SNAPS.map((id, i) => (
          <CrossEdge key={`hs-${id}`} a={HERO_C} b={WORLD_POS[id]} at={0.598 + i * 0.003} />
        ))}
        {/* …and other programs feed the hero in turn */}
        {HERO_FEEDS.map((id, i) => (
          <CrossEdge key={`hf-${id}`} a={WORLD_POS[id]} b={HERO_C} at={0.628 + i * 0.004} />
        ))}
        {/* the fabric between the real constellations */}
        {REAL_WEB.map(([a, b], k) => (
          <CrossEdge key={`w${k}`} a={a} b={b} at={0.632} />
        ))}
        {/* …and the same structure again, over and over, to the horizon */}
        {SEA.map((g, k) => (
          <g key={k}>
            {g.link && <CrossEdge a={[g.x, g.y]} b={g.link} at={g.at} />}
            <GraphMotif cx={g.x} cy={g.y} at={g.at} spec={g.spec} />
          </g>
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

// ── the wider graph: the same structure, over and over ───────────────
//
// Every constellation in the field is the SAME motif: the hero graph's
// exact card arrangement and curved, arrowed edges, repeated at full
// size. The real registry programs carry a label; the sea repeats the
// structure unnamed to the horizon. One geometry, one edge style, one
// size — identical at every distance.

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

// the hero graph's centre, and the family every constellation belongs
// to: same cards, same curved arrowed edges, same left-to-right
// anatomy (inputs → mids → outputs) — but each cluster gets its own
// seeded count, spacing, and wiring
const HERO_C = [745, 295] as const;
const MOTIF_R = 660; // minimum spacing for inter-constellation wires

type MotifSpec = {
  cards: Array<readonly [number, number]>;
  edges: Array<readonly [number, number]>; // card indices, source → target
};

function makeMotif(seed: number): MotifSpec {
  const r = rng32(seed);
  // real programs vary a lot: a few are small utilities, most sprawl —
  // more cards, denser wiring, and each cluster gets its own footprint
  const big = r() < 0.6;
  const nIn = 2 + Math.floor(r() * (big ? 5 : 2)); // 2–6 / 2–3
  const nMid = (big ? 2 : 1) + Math.floor(r() * 3); // 2–4 / 1–3
  const nOut = 1 + Math.floor(r() * (big ? 3 : 2)); // 1–3 / 1–2
  const sp = 0.85 + r() * 0.4; // silhouette size varies per program
  const col = (n: number, x: number, jx: number, gap: number) =>
    Array.from({ length: n }, (_, i) => [
      (x + (r() - 0.5) * jx) * sp,
      ((i - (n - 1) / 2) * gap + (r() - 0.5) * 50) * sp,
    ] as const);
  const ins = col(nIn, -500, 90, 170);
  const mids = col(nMid, -80, 130, 180);
  const outs = col(nOut, 480, 110, 190);
  const cards = [...ins, ...mids, ...outs];
  const mi0 = nIn;
  const oi0 = nIn + nMid;
  const edges: Array<readonly [number, number]> = [];
  const seen = new Set<string>();
  const push = (a: number, b: number) => {
    const k = `${a}-${b}`;
    if (!seen.has(k)) {
      seen.add(k);
      edges.push([a, b]);
    }
  };
  ins.forEach((_, i) => push(i, mi0 + Math.floor(r() * nMid)));
  for (let i = 0; i < nMid; i++) push(mi0 + i, oi0 + Math.floor(r() * nOut));
  // the interconnects: real programs are webs, not trees
  const extras = 1 + Math.floor(r() * (big ? 4 : 2));
  for (let k = 0; k < extras; k++) {
    if (r() < 0.7) push(Math.floor(r() * nIn), mi0 + Math.floor(r() * nMid));
    else push(mi0 + Math.floor(r() * nMid), oi0 + Math.floor(r() * nOut));
  }
  return { cards, edges };
}

// every cluster's spec, keyed by its world centre, so wires can leave
// from the cluster's ACTUAL outermost card
const SPECS = new Map<string, MotifSpec>();
const specKey = (c: readonly [number, number]) => `${c[0]},${c[1]}`;

function GhostMotifCard({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* strokeOpacity, not width: at full distance the card is ~4px wide
          and a solid 1px outline would render it as a dark speck */}
      <rect x={x} y={y} width={NODE_W} height={NODE_H} rx="4" fill="var(--color-paper-elevated)" stroke="var(--color-rule)" strokeOpacity="0.55" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
      <rect x={x} y={y} width={NODE_W} height="3" rx="1.5" fill="var(--color-rule-strong)" opacity="0.62" />
      <line x1={x + 12} y1={y + 17} x2={x + 74} y2={y + 17} stroke="rgba(120,113,108,0.55)" strokeWidth="2" />
      <line x1={x + 12} y1={y + 34} x2={x + 118} y2={y + 34} stroke="rgba(87,83,78,0.5)" strokeWidth="3" />
    </g>
  );
}

// one constellation of the family: its own count and silhouette, the
// same cards, the same curved arrowed edges
function GraphMotif({ cx, cy, at, spec, max = 0.9 }: { cx: number; cy: number; at: number; spec: MotifSpec; max?: number }) {
  return (
    <g opacity={O2()}>
      <Vis a={at} b={W.s3[1] - 0.004} r={0.018} max={max} />
      {spec.edges.map(([f, t], k) => {
        const [fx, fy] = spec.cards[f];
        const [tx, ty] = spec.cards[t];
        const x0 = cx + fx + NODE_W / 2;
        const y0 = cy + fy;
        const x1 = cx + tx - NODE_W / 2;
        const y1 = cy + ty;
        const m = (x0 + x1) / 2;
        return (
          <path
            key={k}
            className="jw-edge"
            d={`M ${x0} ${y0} C ${m} ${y0}, ${m} ${y1}, ${x1 - 6} ${y1}`}
            markerEnd="url(#jw-earr)"
          />
        );
      })}
      {spec.cards.map(([dx, dy], k) => (
        <GhostMotifCard key={k} x={cx + dx - NODE_W / 2} y={cy + dy - NODE_H / 2} />
      ))}
    </g>
  );
}

// every inter-constellation connection is the same curved wire,
// leaving one structure's port and entering the next's — quiet,
// non-scaling, no arrowhead (the arrows live inside the structures)
const port = (c: readonly [number, number], toward: readonly [number, number]) => {
  const right = toward[0] >= c[0];
  if (c[0] === HERO_C[0] && c[1] === HERO_C[1]) {
    // the hero graph's own ports: benefit's right edge / income's left
    return right ? ([1340, 240] as const) : ([150, 295] as const);
  }
  const spec = SPECS.get(specKey(c));
  if (!spec) {
    return right
      ? ([c[0] + 500 + NODE_W / 2, c[1] - 80] as const)
      : ([c[0] - 500 - NODE_W / 2, c[1]] as const);
  }
  const pick = spec.cards.reduce((best, q) => ((right ? q[0] > best[0] : q[0] < best[0]) ? q : best));
  return [c[0] + pick[0] + (right ? NODE_W / 2 : -NODE_W / 2), c[1] + pick[1]] as const;
};

function CrossEdge({ a, b, at }: { a: readonly [number, number]; b: readonly [number, number]; at: number }) {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (d < MOTIF_R * 1.6) return null;
  const p0 = port(a, b);
  const p1 = port(b, a);
  const h = (p1[0] - p0[0]) / 3;
  return (
    <path
      d={`M ${p0[0]} ${p0[1]} C ${p0[0] + h} ${p0[1]}, ${p1[0] - h} ${p1[1]}, ${p1[0]} ${p1[1]}`}
      fill="none" stroke="rgba(87,83,78,0.34)" strokeWidth="0.9" vectorEffect="non-scaling-stroke" opacity={O2()}
    >
      <Vis a={at} b={W.s3[1] - 0.004} r={0.018} max={0.7} />
    </path>
  );
}

// what feeds the hero from beyond its own cluster — real relationships:
// TANF receipt drives categorical eligibility; wage taxes sit under the
// income variables
const HERO_FEEDS = ["us-co-tanf", "us-ny-tanf", "us-oasdi-wage-tax"];

// world positions. The state SNAPs ring the hero — its dependents,
// revealed by the first step back; the rest lie farther out, met on
// the glide.
const WORLD_POS: Record<string, readonly [number, number]> = {
  "us-ny-snap": [2500, -1000],
  "us-sc-snap": [2650, 250],
  "us-tn-snap": [2100, 1100],
  "us-ca-snap": [-200, 1120],
  "us-nc-snap": [-2100, 1050],
  "us-al-snap": [-2650, -200],
  "us-az-snap": [-1600, -1080],
  "uk-universal-credit": [-4800, -900],
  "us-co-tanf": [-4300, 1900],
  "us-ny-tanf": [4600, 1600],
  "us-ak-atap": [-5300, 800],
  "us-ks-tanf": [5200, -300],
  "us-il-scretd": [-4600, -2100],
  "us-tx-tanf": [2200, -2200],
  "us-oasdi-wage-tax": [-800, -2500],
};

// the dependents: these programs import the federal core
const STATE_SNAPS = ["us-al-snap", "us-ca-snap", "us-nc-snap", "us-ny-snap", "us-sc-snap", "us-tn-snap", "us-az-snap"];

// the hero grows first: two dozen more of SNAP's own rules join the
// core as the pull begins — each wired to the nearest existing card,
// so the cluster reads as one organism getting bigger
const HERO_RING: Array<{ x: number; y: number; hub: readonly [number, number]; at: number }> = (() => {
  const r = rng32(97);
  const anchors: Array<readonly [number, number]> = [
    [275, 155], [245, 295], [275, 435], [845, 200], [815, 350], [1135, 470], [1340, 240], [1340, 410],
  ];
  const pts: Array<{ x: number; y: number; hub: readonly [number, number]; at: number }> = [];
  let guard = 0;
  while (pts.length < 24 && guard++ < 4000) {
    const u = r() * Math.PI * 2;
    const rad = 520 + r() * 630;
    const x = 745 + Math.cos(u) * rad * 1.25;
    const y = 295 + Math.sin(u) * rad * 0.72;
    if (x > 60 && x < 1430 && y > 40 && y < 550) continue; // the core's own block
    if (pts.some((q) => Math.hypot(q.x - x, q.y - y) < 250)) continue;
    if (STATE_SNAPS.some((id) => Math.hypot(WORLD_POS[id][0] - x, WORLD_POS[id][1] - y) < 950)) continue;
    let hub: readonly [number, number] = anchors[0];
    let bd = Infinity;
    for (const a of [...anchors, ...pts.map((q) => [q.x, q.y] as const)]) {
      const d = Math.hypot(a[0] - x, a[1] - y);
      if (d < bd) {
        bd = d;
        hub = a;
      }
    }
    pts.push({ x, y, hub, at: 0.583 + pts.length * 0.0016 });
  }
  return pts;
})();

// each registry program's own variant of the family
const idHash = (id: string) => [...id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
const REG_SPECS: Record<string, MotifSpec> = Object.fromEntries(
  Object.keys(WORLD_POS).map((id) => {
    const spec = makeMotif(idHash(id));
    SPECS.set(specKey(WORLD_POS[id]), spec);
    return [id, spec];
  }),
);

// the fabric: each real constellation threads to its nearest neighbour
const REAL_CENTERS: Array<readonly [number, number]> = [
  HERO_C,
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

// the sea: the same structure repeated to the horizon, each threaded
// to a neighbour, arriving continuously through the held final frame
type SeaGroup = { x: number; y: number; link?: readonly [number, number]; at: number; spec: MotifSpec };
const SEA: SeaGroup[] = (() => {
  const rng = rng32(613);
  const centers: Array<[number, number]> = [];
  let guard = 0;
  while (centers.length < 48 && guard++ < 16000) {
    const x = 710 + (rng() - 0.5) * 52000;
    const y = 300 + (rng() - 0.5) * 24000;
    if (Math.abs(x - 710) < 6500 && Math.abs(y - 300) < 3200) continue; // the registry's clearing
    if (centers.some(([cx, cy]) => Math.hypot(cx - x, cy - y) < 2600)) continue;
    centers.push([x, y]);
  }
  const groups: SeaGroup[] = centers.map(([x, y], i) => {
    const pool: Array<readonly [number, number]> = [...centers.slice(0, i), ...REAL_CENTERS];
    let link: readonly [number, number] | undefined;
    let bd = Infinity;
    for (const c of pool) {
      const d = Math.hypot(c[0] - x, c[1] - y);
      if (d > 100 && d < bd && d < 12000) {
        bd = d;
        link = c;
      }
    }
    const spec = makeMotif(4200 + i * 17);
    SPECS.set(specKey([x, y]), spec);
    return { x, y, link, at: 0, spec };
  });
  // rank by distance (with a little shuffle) and spread the arrivals
  // across the whole back half — something is ALWAYS appearing
  const jitter = rng32(377);
  groups
    .map((g, i) => ({ i, k: Math.hypot(g.x - 710, g.y - 300) * (0.82 + jitter() * 0.36) }))
    .sort((p, q) => p.k - q.k)
    .forEach(({ i }, rank) => {
      groups[i].at = 0.645 + (rank / (groups.length - 1)) * 0.21;
    });
  return groups;
})();

/* The caption strip lives in the clear band below the 620-unit
 * artwork — the scenes never draw past 620, so text and graph can't
 * overlap. */
function Captions() {
  if (STATIC) {
    return (
      <g>
        <text className="jw-name" x="710" y="655" textAnchor="middle">
          One provision, encoded
        </text>
        <text className="jw-sub" x="710" y="681" textAnchor="middle">
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
          <text className="jw-name" x="710" y="655" textAnchor="middle">{name}</text>
          <text className="jw-sub" x="710" y="681" textAnchor="middle">{sub}</text>
        </g>
      ))}
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
      {/* userSpaceOnUse: with non-scaling-stroke edges, strokeWidth-unit
          markers pin to SCREEN size and dwarf the cards at full distance —
          user-space sizing lets the arrowheads shrink with the zoom */}
      <marker id="jw-earr" viewBox="0 0 8 8" refX="6" refY="4" markerUnits="userSpaceOnUse" markerWidth="7.2" markerHeight="7.2" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill="rgba(87,83,78,0.65)" />
      </marker>
      <filter id="jw-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1c1917" floodOpacity="0.2" />
      </filter>
      {/* the stage clip: zoom transitions scale scene content far past
          the 620-unit artwork area — clip it so the caption band below
          stays clear at every moment */}
      <clipPath id="jw-stage">
        <rect x="0" y="0" width="1420" height="620" />
      </clipPath>
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
    // jsdom's SVGSVGElement has no SMIL clock — guard for tests.
    if (!svg || typeof svg.pauseAnimations !== "function") return;
    if (startOffset != null) svg.setCurrentTime(startOffset);
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
        viewBox="0 0 1420 700"
        role="img"
        aria-label="One continuous shot, five scenes. First, the whole law: a wall of 1,742,391 provision-cells across seven jurisdictions, almost all lit green — encoded and verified — with a few grey holdouts remaining. The camera dives into one cell: the statute is segmented into sections, each section encoded into a RuleSpec — id, citation, typed inputs and output, and the formula allotment equals tfp minus 0.30 times net income, every value citing its source words, and each encoding walked through the four gates — run, checks, compare, review; one cites the wrong section, is caught by compare, redrafted, and passes. The validated rules then join the axiom graph as nodes — typed, cited, connected to the concepts they draw on; on the graph's output layer, two composed nodes declare their types and compute live answers: snap/benefit, money per month, $478, and snap/eligible, boolean, yes. Then the camera backs out and the same cards keep coming: co-snap's own rules join around the hero graph — snap_maximum_allotment, the deductions, the eligibility tests, real names from its 168 outputs — then every compiled program in the live registry arrives as its own group of identical cards under a real label, from us-sc-snap at 1,327 rules to us-oasdi-wage-tax at 6. At full distance the encoded graph sits among the ghost cards of everything not yet encoded, stamped: the runtime registry, 16 programs compiled, 3,323 rules certified and signed."
      >
        <Defs />
        <g clipPath="url(#jw-stage)">
          {/* the film's own backdrop — covers the library beneath during
              the crossfade; the caption band stays transparent */}
          <rect x="0" y="0" width="1420" height="620" fill="var(--color-paper)" />
          <SceneWall />
          <SceneProvision />
          <CellToPage />
          <SceneGraph />
          <Travelers />
        </g>
        <Captions />
      </svg>
    </div>
  );
}
