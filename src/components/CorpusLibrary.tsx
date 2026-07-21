import { useEffect } from "react";
import previewApp from "../assets/preview-app.png";
import previewFinbot from "../assets/preview-finbot.png";
import previewGraph from "../assets/preview-graph.png";
import previewOracles from "../assets/preview-oracles.png";

// THE READING ROOM — the corpus as a law library.
//
//   THE STACKS   a wall of five bays — state codes, the U.S. Code, the
//                UK, Canada, Belgium — a few hundred cloth spines under
//                lamplight. The camera drifts, then pushes into the
//                titles shelf; TITLE 7 · AGRICULTURE (the one amber
//                spine) tips out and pulls off the shelf, opens, riffles
//                to chapter 51, and settles on § 2017 — which detaches
//                and glides to the exact spot where the film's statute
//                page lives. The film crossfades in over it.
//   THE FILM     (JourneyFilm, unchanged) picks up at the statute page.
//   THE DIGITAL  the program returns as a digital edition of the same
//   LIBRARY      volume and slides home into its slot; from that spine,
//                light spreads across the night shelves — every volume
//                a sliver of green, T7 amber — feeding the four live
//                surfaces below.
//
// One 11-second SMIL clock, fill=freeze — remounting restarts the act.

const DUR = 11;

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const INK = "var(--color-ink)";
const WAX = "var(--color-accent)";
const PAPER = "var(--color-paper)";
const PAPER_EL = "var(--color-paper-elevated)";

// night tokens (the launch night ramp, hard values — the finale is
// always night regardless of theme)
const NIGHT = { paper: "#16130f", rule: "#37322b", ink: "#948b7e", green: "#7cc294", amber: "#d98a3d", dim: "#241f19" };

const PREVIEWS = [
  { src: previewApp, t: "axiom app", s: "every rule, executable" },
  { src: previewFinbot, t: "finbot", s: "$994/mo — computed, cited" },
  { src: previewGraph, t: "rule graph", s: "Colorado SNAP · 210 rules" },
  { src: previewOracles, t: "oracles", s: "99.43% of 7.7M checks" },
];

// ── the wall ─────────────────────────────────────────────────────────

const BAYS = [
  { x: 30, w: 230, name: "state codes" },
  { x: 270, w: 560, name: "united states code" },
  { x: 840, w: 250, name: "united kingdom" },
  { x: 1100, w: 150, name: "canada" },
  { x: 1260, w: 130, name: "belgium" },
];
const SHELVES = [170, 300, 430, 560];

// muted buckram cloth — tans, greiges, sage, oxblood, slate
const TONES = ["#cdc3ae", "#d6cdba", "#b9ae97", "#a89e8d", "#8e9483", "#7a5148", "#5c6470", "#66705f"];
const TITLE_TONES = [5, 6, 7, 3, 4]; // the titles shelf keeps to the dignified end

// the titles shelf — bay 1, row 1. 26 × 16 = 416 wide, centred in the bay.
const TITLES: Array<[string, string]> = [
  ["T1", "GENERAL"], ["T2", "CONGRESS"], ["T5", "GOVT ORG"], ["T7", "AGRICULTURE"],
  ["T8", "ALIENS"], ["T10", "ARMED FORCES"], ["T11", "BANKRUPTCY"], ["T12", "BANKING"],
  ["T15", "COMMERCE"], ["T16", "CONSERVATION"], ["T18", "CRIMES"], ["T19", "CUSTOMS"],
  ["T20", "EDUCATION"], ["T21", "FOOD & DRUGS"], ["T22", "FOREIGN REL."], ["T26", "INT. REVENUE"],
  ["T28", "JUDICIARY"], ["T29", "LABOR"], ["T31", "MONEY"], ["T35", "PATENTS"],
  ["T38", "VETERANS"], ["T42", "PUB. HEALTH"], ["T43", "PUB. LANDS"], ["T47", "TELECOM"],
  ["T49", "TRANSPORT"], ["T52", "ELECTIONS"],
];
const TITLES_X = BAYS[1].x + (BAYS[1].w - TITLES.length * 16) / 2; // 342
const T7 = 3; // index of Agriculture
const T7X = TITLES_X + T7 * 16; // 390

// the camera lands here: T7 centred-left of frame at 2.5×
const CAM = { s: 2.5, tx: 640 - 2.5 * (T7X + 8), ty: 300 - 2.5 * 250 }; // (-355, -325)
// where the T7 sliver sits on screen once the camera has settled
const SLIVER = { x: CAM.s * T7X + CAM.tx, y: CAM.s * 200 + CAM.ty, w: CAM.s * 16, h: CAM.s * 100 };
// the open spread: two 285 × 332 pages about a gutter at x=710
const GUT = 710;
const PAGE = { w: 285, h: 332, y: 150 };
// the film's statute page — the glide's destination (JourneyFilm scene II)
const FILM_PAGE = { x: 250, y: 130, w: 300, h: 350 };

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Piece =
  | { kind: "book"; x: number; w: number; h: number; tone: number; gilt: boolean; patch: boolean; lean: number }
  | { kind: "stack"; x: number; w: number; n: number; tone: number };

function genShelf(seed: number, width: number): Piece[] {
  const rng = mulberry32(seed);
  const out: Piece[] = [];
  let x = 8;
  while (x < width - 16) {
    const r = rng();
    if (r < 0.06) {
      x += 10 + rng() * 14; // breathing room
      continue;
    }
    if (r < 0.14) {
      const w = 34 + rng() * 24;
      if (x + w > width - 10) break;
      out.push({ kind: "stack", x, w, n: 2 + (rng() < 0.45 ? 1 : 0), tone: (rng() * TONES.length) | 0 });
      x += w + 4;
      continue;
    }
    const w = 7 + rng() * 9;
    const lean = r > 0.9 ? -(4 + rng() * 4) : 0;
    out.push({
      kind: "book", x, w, h: 72 + rng() * 30,
      tone: (rng() * TONES.length) | 0,
      gilt: rng() < 0.3, patch: rng() < 0.2, lean,
    });
    x += w + (lean ? 6 : 1.3);
  }
  return out;
}

// [bay][row] — deterministic, shared by the day and night walls so the
// finale is recognisably the same library
const WALL: Piece[][][] = BAYS.map((b, bi) =>
  SHELVES.map((_, ri) => (bi === 1 && ri === 1 ? [] : genShelf(1000 + bi * 37 + ri * 101, b.w)))
);
const TITLE_H = (() => {
  const rng = mulberry32(77);
  return TITLES.map((_, i) => (i === T7 ? 100 : 78 + rng() * 16));
})();
const TITLE_TONE = (() => {
  const rng = mulberry32(78);
  return TITLES.map(() => TITLE_TONES[(rng() * TITLE_TONES.length) | 0]);
})();

// ── SMIL shorthand ───────────────────────────────────────────────────

const kt = (ts: number[]) =>
  ts.map((x, i) => (i === 0 ? "0" : i === ts.length - 1 ? "1" : (x / DUR).toFixed(4))).join(";");

function F({ a, v, t, s }: { a: string; v: Array<string | number>; t: number[]; s?: string }) {
  if (REDUCED) return null;
  return (
    <animate
      attributeName={a} dur={`${DUR}s`} repeatCount="1" fill="freeze"
      values={v.join(";")} keyTimes={kt(t)}
      {...(s ? { calcMode: "spline" as const, keySplines: s } : {})}
    />
  );
}

function TF({ type, v, t, s, add }: { type: string; v: string[]; t: number[]; s?: string; add?: boolean }) {
  if (REDUCED) return null;
  return (
    <animateTransform
      attributeName="transform" type={type} dur={`${DUR}s`} repeatCount="1" fill="freeze"
      values={v.join(";")} keyTimes={kt(t)}
      {...(s ? { calcMode: "spline" as const, keySplines: s } : {})}
      {...(add ? { additive: "sum" as const } : {})}
    />
  );
}

const FadeIn = ({ at, r = 0.3, to = 1 }: { at: number; r?: number; to?: number }) => (
  <F a="opacity" v={[0, 0, to, to]} t={[0, at, at + r, DUR]} />
);
const FadeOut = ({ at, r = 0.3 }: { at: number; r?: number }) => (
  <F a="opacity" v={[1, 1, 0, 0]} t={[0, at, at + r, DUR]} />
);
const Window = ({ a, b, r = 0.25 }: { a: number; b: number; r?: number }) => (
  <F a="opacity" v={[0, 0, 1, 1, 0, 0]} t={[0, a, a + r, b, b + r, DUR]} />
);

// ── pieces of the wall ───────────────────────────────────────────────

function Spine({ p, shelfY, dark, lit }: { p: Piece; shelfY: number; dark?: boolean; lit?: boolean }) {
  if (p.kind === "stack") {
    const slab = 9;
    return (
      <g>
        {Array.from({ length: p.n }, (_, i) => (
          <rect
            key={i}
            x={p.x + (i % 2) * 3} y={shelfY - slab * (i + 1) - i} width={p.w - (i % 2) * 5} height={slab} rx="1"
            fill={dark ? (lit ? NIGHT.green : NIGHT.dim) : TONES[(p.tone + i) % TONES.length]}
            stroke={dark ? (lit ? "none" : NIGHT.rule) : "rgba(28,25,23,0.35)"} strokeWidth="0.5"
            opacity={dark && lit ? 0.85 : 1}
          />
        ))}
      </g>
    );
  }
  const top = shelfY - p.h;
  const body = (
    <rect
      x={p.x} y={top} width={p.w} height={p.h} rx="1"
      fill={dark ? (lit ? NIGHT.green : NIGHT.dim) : TONES[p.tone]}
      stroke={dark ? (lit ? "none" : NIGHT.rule) : "rgba(28,25,23,0.3)"} strokeWidth="0.5"
      opacity={dark && lit ? 0.85 : 1}
    />
  );
  const detail = !dark && (
    <>
      {p.gilt && (
        <>
          <line x1={p.x + 1.5} y1={top + p.h * 0.12} x2={p.x + p.w - 1.5} y2={top + p.h * 0.12} stroke="#b08d57" strokeWidth="0.8" opacity="0.6" />
          <line x1={p.x + 1.5} y1={top + p.h * 0.19} x2={p.x + p.w - 1.5} y2={top + p.h * 0.19} stroke="#b08d57" strokeWidth="0.6" opacity="0.45" />
        </>
      )}
      {p.patch && (
        <rect x={p.x + 1.5} y={top + p.h * 0.32} width={p.w - 3} height={p.h * 0.14} rx="0.8" fill="rgba(250,249,246,0.4)" />
      )}
    </>
  );
  if (p.lean) {
    return (
      <g transform={`rotate(${p.lean} ${p.x} ${shelfY})`}>
        {body}
        {detail}
      </g>
    );
  }
  return (
    <g>
      {body}
      {detail}
    </g>
  );
}

function TitleSpine({ i, dark, lit, hideT7 }: { i: number; dark?: boolean; lit?: boolean; hideT7?: boolean }) {
  const [no, name] = TITLES[i];
  const x = TITLES_X + i * 16;
  const h = TITLE_H[i];
  const top = 300 - h;
  const isT7 = i === T7;
  if (isT7 && hideT7) return null;
  const fill = dark
    ? lit
      ? isT7
        ? NIGHT.amber
        : NIGHT.green
      : NIGHT.dim
    : isT7
      ? WAX
      : TONES[TITLE_TONE[i]];
  return (
    <g>
      <rect x={x} y={top} width="15" height={h} rx="1" fill={fill} stroke={dark ? (lit ? "none" : NIGHT.rule) : "rgba(28,25,23,0.35)"} strokeWidth="0.5" opacity={dark && lit ? (isT7 ? 1 : 0.85) : 1} />
      {!dark && (
        <>
          <line x1={x + 1.5} y1={top + 8} x2={x + 13.5} y2={top + 8} stroke={isT7 ? "#e6c893" : "#b08d57"} strokeWidth="0.8" opacity="0.65" />
          <line x1={x + 1.5} y1={top + 12} x2={x + 13.5} y2={top + 12} stroke={isT7 ? "#e6c893" : "#b08d57"} strokeWidth="0.6" opacity="0.5" />
          <text
            className="clib-spinelabel"
            transform={`rotate(90 ${x + 7.5} ${top + h / 2 + 8})`}
            x={x + 7.5} y={top + h / 2 + 8} textAnchor="middle"
            fill={isT7 ? "#f0d9b0" : undefined}
          >
            {`${no} · ${name}`}
          </text>
        </>
      )}
    </g>
  );
}

function Wall({ dark, lit, rows = SHELVES.length, hideT7 }: { dark?: boolean; lit?: boolean; rows?: number; hideT7?: boolean }) {
  return (
    <g>
      {/* cornice */}
      <line x1="30" y1="40" x2="1390" y2="40" stroke={dark ? NIGHT.rule : INK} strokeWidth="1" opacity={dark ? 1 : 0.5} />
      <line x1="30" y1="43.5" x2="1390" y2="43.5" stroke={dark ? NIGHT.rule : INK} strokeWidth="0.5" opacity={dark ? 0.7 : 0.25} />
      {BAYS.map((b, bi) => (
        <g key={b.name}>
          {/* backboards + shelves */}
          {SHELVES.slice(0, rows).map((sy, ri) => (
            <g key={ri}>
              <rect x={b.x} y={sy - 106} width={b.w} height="106" fill={dark ? "rgba(233,228,218,0.015)" : "rgba(28,25,23,0.025)"} />
              <line x1={b.x} y1={sy} x2={b.x + b.w} y2={sy} stroke={dark ? NIGHT.rule : INK} strokeWidth="1.4" opacity={dark ? 1 : 0.55} />
              <line x1={b.x} y1={sy + 3} x2={b.x + b.w} y2={sy + 3} stroke={dark ? NIGHT.rule : INK} strokeWidth="0.5" opacity={dark ? 0.6 : 0.25} />
            </g>
          ))}
          {/* pilasters */}
          {bi > 0 && (
            <>
              <line x1={b.x - 6} y1="40" x2={b.x - 6} y2={SHELVES[rows - 1] + 3} stroke={dark ? NIGHT.rule : INK} strokeWidth="0.9" opacity={dark ? 1 : 0.4} />
              <line x1={b.x - 3} y1="40" x2={b.x - 3} y2={SHELVES[rows - 1] + 3} stroke={dark ? NIGHT.rule : INK} strokeWidth="0.5" opacity={dark ? 0.6 : 0.2} />
            </>
          )}
          {/* the books */}
          {WALL[bi].slice(0, rows).map((pieces, ri) => (
            <g key={ri} transform={`translate(${b.x} 0)`}>
              {pieces.map((p, i) => (
                <Spine key={i} p={p} shelfY={SHELVES[ri]} dark={dark} lit={lit && !(dark && litHoldout(bi, ri, i))} />
              ))}
            </g>
          ))}
          {bi === 1 && rows > 1 && TITLES.map((_, i) => <TitleSpine key={i} i={i} dark={dark} lit={lit} hideT7={hideT7} />)}
        </g>
      ))}
    </g>
  );
}

// a few grey holdouts stay unlit in the finale — the grey ones are next
const HOLDOUT = mulberry32(9);
const holdouts = new Set<string>();
BAYS.forEach((_, bi) =>
  SHELVES.forEach((_2, ri) =>
    WALL[bi][ri].forEach((_3, i) => {
      if (HOLDOUT() < 0.07) holdouts.add(`${bi}:${ri}:${i}`);
    })
  )
);
const litHoldout = (bi: number, ri: number, i: number) => holdouts.has(`${bi}:${ri}:${i}`);

function Plaques({ dark }: { dark?: boolean }) {
  const label = (bi: number) =>
    !dark
      ? BAYS[bi].name
      : ["state codes · in progress", "united states code · 3,323 rules", "united kingdom · next", "canada · next", "belgium · pilot"][bi];
  return (
    <g>
      {BAYS.map((b, bi) => (
        <text
          key={b.name}
          className={dark ? "clib-plaque clib-plaque--light" : "clib-plaque"}
          x={b.x + b.w / 2} y="58" textAnchor="middle"
        >
          {label(bi)}
        </text>
      ))}
    </g>
  );
}

function Lamplight() {
  return (
    <g pointerEvents="none">
      <ellipse cx="400" cy="52" rx="430" ry="190" fill="url(#clib-lamp)" />
      <ellipse cx="1050" cy="52" rx="380" ry="170" fill="url(#clib-lamp)" />
    </g>
  );
}

// ── the pages ────────────────────────────────────────────────────────

// left leaf: the title page (drawn left of the gutter, local origin at
// the gutter top)
function TitlePage() {
  const cx = -PAGE.w / 2;
  return (
    <g>
      <rect x={-PAGE.w} y="0" width={PAGE.w} height={PAGE.h} fill={PAPER_EL} stroke={INK} strokeWidth="0.5" opacity="0.98" />
      <rect x={-PAGE.w + 10} y="10" width={PAGE.w - 20} height={PAGE.h - 20} fill="none" stroke={INK} strokeWidth="0.4" opacity="0.25" />
      <text className="jw-doceyebrow" x={cx} y="72" textAnchor="middle">
        the code of laws of the united states
      </text>
      <text className="clib-titlepage" x={cx} y="118" textAnchor="middle">
        UNITED STATES CODE
      </text>
      <line x1={cx - 70} y1="134" x2={cx + 70} y2="134" stroke={INK} strokeWidth="1" opacity="0.7" />
      <line x1={cx - 70} y1="137" x2={cx + 70} y2="137" stroke={INK} strokeWidth="0.4" opacity="0.4" />
      <text className="jw-doceyebrow" x={cx} y="164" textAnchor="middle">
        title 7
      </text>
      <text className="clib-titlepage-italic" x={cx} y="198" textAnchor="middle">
        Agriculture
      </text>
      <text className="jw-doceyebrow" x={cx} y={PAGE.h - 34} textAnchor="middle">
        washington · u.s. government publishing office
      </text>
    </g>
  );
}

// right leaf: chapter 51's contents (local origin at the gutter top)
const CONTENTS: Array<[string, string]> = [
  ["2011", "Congressional declaration of policy"],
  ["2012", "Definitions"],
  ["2013", "Establishment of program"],
  ["2014", "Eligible households"],
  ["2015", "Eligibility disqualifications"],
  ["2016", "Issuance and use of benefits"],
  ["2017", "Value of allotment"],
  ["2018", "Approval of retail food stores"],
];
function ContentsPage() {
  const cx = PAGE.w / 2;
  return (
    <g>
      <rect x="0" y="0" width={PAGE.w} height={PAGE.h} fill={PAPER_EL} stroke={INK} strokeWidth="0.5" opacity="0.98" />
      <text className="jw-doceyebrow" x={cx} y="34" textAnchor="middle">
        title 7 · chapter 51
      </text>
      <text className="clib-chapter" x={cx} y="60" textAnchor="middle">
        Supplemental Nutrition Assistance
      </text>
      <line x1="26" y1="76" x2={PAGE.w - 26} y2="76" stroke={INK} strokeWidth="1" opacity="0.6" />
      <line x1="26" y1="79" x2={PAGE.w - 26} y2="79" stroke={INK} strokeWidth="0.4" opacity="0.35" />
      {CONTENTS.map(([no, label], i) => {
        const y = 106 + i * 24;
        const hot = no === "2017";
        return (
          <g key={no}>
            <text className="jw-seckey" x="28" y={y} fill={hot ? WAX : undefined}>{`§ ${no}`}</text>
            <text className="clib-toc" x="70" y={y} fill={hot ? WAX : undefined}>{label}</text>
            <line x1="70" y1={y + 6} x2={PAGE.w - 28} y2={y + 6} stroke={hot ? WAX : INK} strokeWidth="0.7" strokeDasharray="1 3" opacity={hot ? 0.5 : 0.22} />
          </g>
        );
      })}
      <text className="jw-doceyebrow" x={cx} y={PAGE.h - 18} textAnchor="middle">
        —  ⋯  —
      </text>
    </g>
  );
}

// the statute page — drawn in the FILM's coordinates (300 × 350 at 0,0)
// so the glide ends pixel-identical to JourneyFilm scene II
const SECTIONS = [
  { key: "a", label: "Value of allotment", y: 110 },
  { key: "b", label: "Eligibility", y: 200 },
  { key: "c", label: "Rounding", y: 290 },
];
function StatutePage() {
  const w = FILM_PAGE.w;
  return (
    <g>
      <rect x="0" y="0" width={w} height={FILM_PAGE.h} rx="4" fill={PAPER_EL} stroke={INK} strokeWidth="1.1" />
      <rect x="8" y="8" width={w - 16} height={FILM_PAGE.h - 16} fill="none" stroke={INK} strokeWidth="0.5" opacity="0.4" />
      <text className="jw-doceyebrow" x={w / 2} y="32" textAnchor="middle">
        united states code · title 7 · chapter 51
      </text>
      <text className="jw-docserif" x={w / 2} y="60" textAnchor="middle">
        {"§ 2017 · Value of allotment"}
      </text>
      <line x1="24" y1="74" x2={w - 24} y2="74" stroke={INK} strokeWidth="1.3" opacity="0.8" />
      <line x1="24" y1="77.5" x2={w - 24} y2="77.5" stroke={INK} strokeWidth="0.5" opacity="0.5" />
      {SECTIONS.map(({ key, label, y }) => (
        <g key={key}>
          <text className="jw-seckey" x="26" y={y}>{`(${key})`}</text>
          <text className="jw-seclabel" x="52" y={y}>{label}</text>
          {[
            [26, w - 50],
            [26, w - 50],
            [26, (w - 50) * 0.62],
          ].map(([x0, len], r) => (
            <line key={r} x1={x0} y1={y + 13 + r * 10} x2={x0 + len} y2={y + 13 + r * 10} stroke={INK} strokeWidth="1.1" opacity="0.28" />
          ))}
        </g>
      ))}
      <text className="jw-doceyebrow" x={w / 2} y={FILM_PAGE.h - 18} textAnchor="middle">
        as published · amended through 2026
      </text>
    </g>
  );
}

// the cover face of the pulled volume (drawn at the closed-book rect:
// gutter..gutter+285 × PAGE.y..PAGE.y+332)
function CoverFace({ stampAnim }: { stampAnim?: boolean }) {
  const cx = GUT + PAGE.w / 2;
  const y0 = PAGE.y;
  return (
    <g>
      <rect x={GUT} y={y0} width={PAGE.w} height={PAGE.h} rx="3" fill={WAX} />
      <rect x={GUT} y={y0} width="7" height={PAGE.h} fill="rgba(0,0,0,0.28)" />
      <rect x={GUT + 12} y={y0 + 12} width={PAGE.w - 24} height={PAGE.h - 24} fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1.2" />
      <rect x={GUT + 16} y={y0 + 16} width={PAGE.w - 32} height={PAGE.h - 32} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="0.7" />
      <g opacity={stampAnim && !REDUCED ? 0 : 1}>
        {stampAnim && <FadeIn at={6.1} r={0.5} />}
        <text className="clib-cover-eyebrow" x={cx} y={y0 + 96} textAnchor="middle">
          united states code
        </text>
        <text className="clib-cover-title" x={cx} y={y0 + 152} textAnchor="middle">
          TITLE 7
        </text>
        <line x1={cx - 52} y1={y0 + 172} x2={cx + 52} y2={y0 + 172} stroke="#e6c893" strokeWidth="0.9" opacity="0.75" />
        <text className="clib-cover-sub" x={cx} y={y0 + 202} textAnchor="middle">
          Agriculture
        </text>
        <text className="clib-cover-eyebrow" x={cx} y={y0 + PAGE.h - 42} textAnchor="middle">
          ch. 51 · supplemental nutrition
        </text>
      </g>
    </g>
  );
}

// the program, bound: the same volume in its encoded edition — dark
// boards, luminous edges, the certification on the cover
function DigitalVolume() {
  const x = 567.5;
  const y = 130;
  const w = 285;
  const h = 332;
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="none" stroke={NIGHT.amber} strokeWidth="2" filter="url(#clib-glow)" opacity="0.5">
        {!REDUCED && <animate attributeName="opacity" values="0.35;0.6;0.35" dur="2.6s" repeatCount="indefinite" />}
      </rect>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#1d1914" stroke={NIGHT.amber} strokeWidth="1.2" />
      <rect x={x} y={y} width="7" height={h} fill="rgba(0,0,0,0.5)" />
      <rect x={x + 12} y={y + 12} width={w - 24} height={h - 24} fill="none" stroke={NIGHT.amber} strokeWidth="0.5" opacity="0.4" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={i} x1={x + 14} y1={y + 26 + i * 40} x2={x + w - 14} y2={y + 26 + i * 40} stroke={NIGHT.green} strokeWidth="0.5" opacity="0.06" />
      ))}
      <text className="clib-cover-eyebrow" x={cx} y={y + 82} textAnchor="middle" style={{ fill: NIGHT.green }}>
        united states code · encoded edition
      </text>
      <text className="clib-cover-title" x={cx} y={y + 138} textAnchor="middle">
        TITLE 7
      </text>
      <line x1={cx - 52} y1={y + 158} x2={cx + 52} y2={y + 158} stroke={NIGHT.amber} strokeWidth="0.9" opacity="0.75" />
      <text className="clib-cover-sub" x={cx} y={y + 188} textAnchor="middle">
        Agriculture
      </text>
      <circle cx={cx} cy={y + 242} r="16" fill="none" stroke={NIGHT.green} strokeWidth="1.3" />
      <circle cx={cx} cy={y + 242} r="11.5" fill="none" stroke={NIGHT.green} strokeWidth="0.6" opacity="0.7" />
      <text x={cx} y={y + 247} textAnchor="middle" style={{ fill: NIGHT.green, fontSize: "12px" }}>
        ✓
      </text>
      <text className="clib-cover-eyebrow" x={cx} y={y + h - 42} textAnchor="middle" style={{ fill: NIGHT.green }}>
        3,323 rules · certified · signed
      </text>
    </g>
  );
}

// board rim + gutter shade behind the open spread
function SpreadBacking() {
  return (
    <g>
      <rect x={GUT - PAGE.w - 6} y={PAGE.y - 5} width={PAGE.w * 2 + 12} height={PAGE.h + 10} rx="3" fill={WAX} />
      <rect x={GUT - PAGE.w - 6} y={PAGE.y - 5} width={PAGE.w * 2 + 12} height={PAGE.h + 10} rx="3" fill="rgba(0,0,0,0.18)" />
      {/* page-block edges, right side */}
      {[0, 1, 2].map((i) => (
        <line key={i} x1={GUT + PAGE.w + 1.5 + i * 1.6} y1={PAGE.y + 6 + i * 2} x2={GUT + PAGE.w + 1.5 + i * 1.6} y2={PAGE.y + PAGE.h - 6 - i * 2} stroke={PAPER_EL} strokeWidth="0.9" opacity={0.8 - i * 0.2} />
      ))}
      <rect x={GUT - 18} y={PAGE.y} width="36" height={PAGE.h} fill="url(#clib-gutter)" opacity="0.55" />
    </g>
  );
}

// a blank leaf mid-riffle (drawn right of the gutter, local origin at
// the gutter top)
function Leaf() {
  return (
    <g>
      <rect x="2" y="2" width={PAGE.w - 5} height={PAGE.h - 4} fill={PAPER_EL} stroke={INK} strokeWidth="0.4" opacity="0.97" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="30" y1={70 + i * 44} x2={PAGE.w - 34} y2={70 + i * 44} stroke={INK} strokeWidth="0.8" opacity="0.14" />
      ))}
    </g>
  );
}

function Defs() {
  return (
    <defs>
      <radialGradient id="clib-lamp">
        <stop offset="0%" stopColor={WAX} stopOpacity="0.07" />
        <stop offset="100%" stopColor={WAX} stopOpacity="0" />
      </radialGradient>
      <linearGradient id="clib-gutter" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stopColor="#1c1917" stopOpacity="0" />
        <stop offset="50%" stopColor="#1c1917" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#1c1917" stopOpacity="0" />
      </linearGradient>
      <filter id="clib-softshadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="4" stdDeviation="7" floodColor="#1c1917" floodOpacity="0.22" />
      </filter>
      <filter id="clib-glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2.6" />
      </filter>
      {/* the finale's light spreads outward from the returned volume's
          shelf slot, not left-to-right */}
      <clipPath id="clib-sweepclip">
        <rect x={REDUCED ? -642 : T7X - 2} y="0" width={REDUCED ? 2064 : 0} height="620">
          {!REDUCED && (
            <>
              <animate attributeName="x" dur={`${DUR}s`} repeatCount="1" fill="freeze" values={`${T7X - 2};${T7X - 2};-642;-642`} keyTimes={kt([0, 4.2, 8.0, DUR])} calcMode="spline" keySplines="0 0 1 1;0.25 0 0.75 1;0 0 1 1" />
              <animate attributeName="width" dur={`${DUR}s`} repeatCount="1" fill="freeze" values="0;0;2064;2064" keyTimes={kt([0, 4.2, 8.0, DUR])} calcMode="spline" keySplines="0 0 1 1;0.25 0 0.75 1;0 0 1 1" />
            </>
          )}
        </rect>
      </clipPath>
    </defs>
  );
}

// ── the acts ─────────────────────────────────────────────────────────

function ActStacks({ auto }: { auto: boolean }) {
  return (
    <svg
      className="clib-svg"
      viewBox="0 0 1420 620"
      role="img"
      aria-label="A law library: five bays of shelves — state codes, the United States Code, the United Kingdom, Canada, Belgium — holding 1,742,391 provisions. The camera pushes into the titles shelf; the amber volume, Title 7 · Agriculture, pulls off the shelf, opens to chapter 51, and settles on § 2017 — Value of allotment, the page the encoding begins from."
    >
      <Defs />
      <rect x="0" y="0" width="1420" height="620" fill={PAPER} />
      {/* the camera */}
      <g>
        {auto && (
          <>
            <TF type="translate" v={["0 0", "-35.5 -15.5", `${CAM.tx} ${CAM.ty}`, `${CAM.tx} ${CAM.ty}`]} t={[0, 2.4, 4.0, DUR]} s="0.33 0 0.67 1;0.45 0 0.16 1;0 0 1 1" />
            <TF type="scale" add v={["1", "1.05", `${CAM.s}`, `${CAM.s}`]} t={[0, 2.4, 4.0, DUR]} s="0.33 0 0.67 1;0.45 0 0.16 1;0 0 1 1" />
          </>
        )}
        <Wall hideT7={auto && !REDUCED} />
        {/* the slot the volume leaves behind */}
        {auto && !REDUCED && (
          <g>
            <rect x={T7X + 0.5} y="202" width="14" height="97" fill="rgba(28,25,23,0.28)" opacity="0">
              <FadeIn at={4.95} r={0.15} />
            </rect>
            {/* the wall's own T7 fades as the screen-space volume takes over */}
            <g>
              <FadeOut at={4.95} r={0.12} />
              <TitleSpine i={T7} />
            </g>
          </g>
        )}
        <Plaques />
      </g>
      <Lamplight />

      {auto && !REDUCED && (
        <>
          {/* scrim: the room softens while the book is in hand */}
          <rect x="0" y="0" width="1420" height="620" fill={PAPER} opacity="0">
            <FadeIn at={5.9} r={0.9} to={0.9} />
          </rect>

          {/* the volume, in screen space: starts as the sliver on the
              shelf, grows to the closed book (width expansion = the turn
              toward camera), tips as it leaves */}
          <ellipse cx={GUT + PAGE.w / 2} cy={PAGE.y + PAGE.h + 12} rx="170" ry="10" fill={INK} opacity="0">
            <F a="opacity" v={[0, 0, 0.13, 0.13, 0]} t={[0, 6.3, 6.9, 9.6, 10.4]} />
            <F a="rx" v={[170, 170, 170, 310, 310]} t={[0, 6.9, 7.05, 8.0, DUR]} />
            <F a="cx" v={[GUT + PAGE.w / 2, GUT + PAGE.w / 2, GUT + PAGE.w / 2, GUT, GUT]} t={[0, 6.9, 7.05, 8.0, DUR]} />
          </ellipse>
          <g>
            <TF
              type="translate"
              v={[`${SLIVER.x - (SLIVER.w / PAGE.w) * GUT} ${SLIVER.y - (SLIVER.h / PAGE.h) * PAGE.y}`, `${SLIVER.x - (SLIVER.w / PAGE.w) * GUT} ${SLIVER.y - (SLIVER.h / PAGE.h) * PAGE.y}`, "0 0", "0 0"]}
              t={[0, 5.5, 6.8, DUR]}
              s="0 0 1 1;0.3 0 0.16 1;0 0 1 1"
            />
            <TF
              type="scale" add
              v={[`${(SLIVER.w / PAGE.w).toFixed(4)} ${(SLIVER.h / PAGE.h).toFixed(4)}`, `${(SLIVER.w / PAGE.w).toFixed(4)} ${(SLIVER.h / PAGE.h).toFixed(4)}`, "1 1", "1 1"]}
              t={[0, 5.5, 6.8, DUR]}
              s="0 0 1 1;0.3 0 0.16 1;0 0 1 1"
            />
            <TF type="rotate" add v={["0 852 482", "0 852 482", "7 852 482", "0 852 482", "0 852 482"]} t={[0, 5.05, 5.5, 6.45, DUR]} s="0.3 0 0.3 1;0.3 0 0.3 1;0.3 0 0.3 1;0 0 1 1" />
            <g opacity="0">
              {/* one window — competing fill-freeze opacity animations
                  would override each other */}
              <F a="opacity" v={[0, 0, 1, 1, 0, 0]} t={[0, 4.9, 5.02, 9.6, 10.3, DUR]} />

              {/* backing + right page appear the moment the cover opens */}
              <g opacity="0">
                <FadeIn at={7.45} r={0.2} />
                <SpreadBacking />
              </g>
              <g opacity="0">
                <FadeIn at={7.15} r={0.1} />
                <g transform={`translate(${GUT} ${PAGE.y})`}>
                  {/* a fresh blank page stays beneath — the riffle must
                      never expose the bare board */}
                  <rect x="0" y="0" width={PAGE.w} height={PAGE.h} fill={PAPER_EL} stroke={INK} strokeWidth="0.5" opacity="0.98" />
                  {/* the § page waits at the bottom of the stack */}
                  <g transform="scale(0.95)">
                    <StatutePage />
                  </g>
                  {/* leaf B: a blank sheet — the riffle's second turn.
                      Each leaf turns fully over the gutter (scaleX through
                      0 to −1) and lands beneath the left page; the face
                      swaps to its blank back at the crossover, where the
                      sheet is edge-on and the swap is invisible */}
                  <g>
                    <TF type="scale" v={["1 1", "1 1", "-0.98 1", "-0.98 1"]} t={[0, 8.5, 9.15, DUR]} s="0 0 1 1;0.45 0 0.55 1;0 0 1 1" />
                    <Leaf />
                  </g>
                  {/* leaf A: the contents page itself is the first turn */}
                  <g>
                    <TF type="scale" v={["1 1", "1 1", "-0.98 1", "-0.98 1"]} t={[0, 8.15, 8.8, DUR]} s="0 0 1 1;0.45 0 0.55 1;0 0 1 1" />
                    <g>
                      <F a="opacity" v={[1, 1, 0, 0]} t={[0, 8.46, 8.5, DUR]} />
                      <ContentsPage />
                    </g>
                    <g opacity="0">
                      <F a="opacity" v={[0, 0, 1, 1]} t={[0, 8.46, 8.5, DUR]} />
                      <Leaf />
                    </g>
                  </g>
                </g>
              </g>

              {/* the title page swings open (the back of the cover) */}
              <g transform={`translate(${GUT} ${PAGE.y})`}>
                <g opacity="0">
                  <FadeIn at={7.55} r={0.05} />
                  <g>
                    <TF type="scale" v={["0.02 1", "0.02 1", "1 1", "1 1"]} t={[0, 7.55, 8.2, DUR]} s="0 0 1 1;0.2 0 0.25 1;0 0 1 1" />
                    <TitlePage />
                  </g>
                </g>
              </g>

              {/* the front cover — closed until 7.0, then swings away in
                  one continuous motion that the title page completes */}
              <g>
                <F a="opacity" v={[1, 1, 0, 0]} t={[0, 7.53, 7.57, DUR]} />
                <g transform={`translate(${GUT} ${PAGE.y})`}>
                  <g>
                    <TF type="scale" v={["1 1", "1 1", "0.02 1", "0.02 1"]} t={[0, 7.0, 7.55, DUR]} s="0 0 1 1;0.5 0 0.75 1;0 0 1 1" />
                    <g transform={`translate(${-GUT} ${-PAGE.y})`}>
                      <CoverFace stampAnim />
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>

          {/* everything settles to paper while the page glides to the
              film's opening position */}
          <rect x="0" y="0" width="1420" height="620" fill={PAPER} opacity="0">
            <FadeIn at={9.6} r={0.9} />
          </rect>
          {/* the glide copy appears over its identical twin in the
              spread, travels, and is at rest BEFORE the film fades in —
              the crossfade then blends two matching stills */}
          <g opacity="0" filter="url(#clib-softshadow)">
            <FadeIn at={9.35} r={0.15} />
            <TF type="translate" v={[`${GUT} ${PAGE.y}`, `${GUT} ${PAGE.y}`, `${FILM_PAGE.x} ${FILM_PAGE.y}`, `${FILM_PAGE.x} ${FILM_PAGE.y}`]} t={[0, 9.55, 10.55, DUR]} s="0 0 1 1;0.45 0 0.18 1;0 0 1 1" />
            <TF type="scale" add v={["0.95", "0.95", "1", "1"]} t={[0, 9.55, 10.55, DUR]} s="0 0 1 1;0.45 0 0.18 1;0 0 1 1" />
            <StatutePage />
          </g>

          {/* captions */}
          <g>
            <text className="clib-cap" x="36" y="604" opacity="0">
              <Window a={0.3} b={4.2} />
              the stacks · 1,742,391 provisions, on paper
            </text>
            <text className="clib-cap" x="36" y="604" opacity="0">
              <Window a={4.45} b={7.55} />
              one volume · title 7 — agriculture
            </text>
            <text className="clib-cap" x="36" y="604" opacity="0">
              <Window a={7.8} b={10.4} />
              one section · § 2017 — value of allotment
            </text>
          </g>
        </>
      )}

      {auto && REDUCED && (
        // reduced motion: the settled spread, no travel
        <StillSpread />
      )}

      {!auto && (
        <text className="clib-cap" x="36" y="604">
          the stacks · 1,742,391 provisions, on paper
        </text>
      )}
    </svg>
  );
}

function StillSpread() {
  return (
    <g>
      <rect x="0" y="0" width="1420" height="620" fill={PAPER} opacity="0.9" />
      <g filter="url(#clib-softshadow)">
        <SpreadBacking />
        <g transform={`translate(${GUT} ${PAGE.y})`}>
          <TitlePage />
        </g>
        <g transform={`translate(${GUT} ${PAGE.y}) scale(0.95)`}>
          <StatutePage />
        </g>
      </g>
      <text className="clib-cap" x="36" y="604">
        one section · § 2017 — value of allotment
      </text>
    </g>
  );
}

function ActLanded() {
  return (
    <svg
      className="clib-svg"
      viewBox="0 0 1420 620"
      role="img"
      aria-label="The pulled volume — United States Code, Title 7, Agriculture — lies open: the title page on the left, and on the right § 2017, Value of allotment, the page the encoding begins from."
    >
      <Defs />
      <rect x="0" y="0" width="1420" height="620" fill={PAPER} />
      <g opacity="0.35">
        <Wall />
        <Plaques />
      </g>
      <Lamplight />
      <StillSpread />
    </svg>
  );
}

function ActFinale() {
  return (
    <svg
      className="clib-svg"
      viewBox="0 0 1420 620"
      role="img"
      aria-label="The program returns as a digital edition of the same volume — dark boards, luminous edges, 3,323 rules certified — and slides back into its slot on the night shelves. From that spine, light spreads across the whole library: every volume a sliver of green light, Title 7 amber, a few grey holdouts next in line. The shelves feed four live surfaces: the Axiom app, FinBot, the rule graph, and the oracles."
    >
      <Defs />
      <rect x="0" y="0" width="1420" height="620" fill={NIGHT.paper} />
      <Wall dark rows={3} />
      <g clipPath="url(#clib-sweepclip)">
        <g filter="url(#clib-glow)" opacity="0.5">
          <Wall dark lit rows={3} />
        </g>
        <Wall dark lit rows={3} />
      </g>
      <Plaques dark />

      {/* the program, bound — it holds a beat, then slides home into the
          T7 slot; the moment it lands, the light starts spreading */}
      {!REDUCED && (
        <g opacity="0">
          <F a="opacity" v={[0, 0, 1, 1, 0, 0]} t={[0, 0.4, 1.0, 4.12, 4.32, DUR]} />
          <TF type="translate" v={["0 0", "0 0", "360.13 160.84", "360.13 160.84"]} t={[0, 3.0, 4.2, DUR]} s="0 0 1 1;0.5 0 0.22 1;0 0 1 1" />
          <TF type="scale" add v={["1 1", "1 1", "0.0526 0.3012", "0.0526 0.3012"]} t={[0, 3.0, 4.2, DUR]} s="0 0 1 1;0.5 0 0.22 1;0 0 1 1" />
          <DigitalVolume />
        </g>
      )}

      {/* the shelves feed the surfaces */}
      {PREVIEWS.map(({ src, t, s }, i) => {
        const w = 260;
        const x = 136 + i * (w + 36);
        const cx = x + w / 2;
        const at = 6.6 + i * 0.3;
        return (
          <g key={t} opacity={REDUCED ? 1 : 0}>
            {!REDUCED && <FadeIn at={at} r={0.55} />}
            <line x1={cx} y1="434" x2={cx} y2="466" stroke={NIGHT.green} strokeWidth="1" strokeDasharray="3 3" opacity="0.55">
              {!REDUCED && <animate attributeName="stroke-dashoffset" from="12" to="0" dur="1.2s" repeatCount="indefinite" />}
            </line>
            <rect x={x} y="468" width={w} height="118" rx="4" fill="#1d1914" stroke={NIGHT.rule} strokeWidth="1" />
            <rect x={x} y="468" width={w} height="2.5" rx="1" fill={NIGHT.amber} />
            <clipPath id={`clib-pv${i}`}>
              <rect x={x + 7} y="475" width={w - 14} height="82" rx="3" />
            </clipPath>
            <image href={src} x={x + 7} y="475" width={w - 14} height="82" preserveAspectRatio="xMidYMid slice" clipPath={`url(#clib-pv${i})`} opacity="0.92" />
            <text className="clib-toollabel" x={x + 10} y="574">{t}</text>
            <text className="clib-toolsub" x={x + w - 10} y="574" textAnchor="end">{s}</text>
          </g>
        );
      })}

      {!REDUCED && (
        <text className="clib-cap clib-cap--light" x="36" y="612" opacity="0">
          <Window a={0.7} b={3.9} r={0.4} />
          the volume returns · encoded, certified, signed
        </text>
      )}
      <text className="clib-cap clib-cap--light" x="36" y="612" opacity={REDUCED ? 1 : 0}>
        {!REDUCED && <FadeIn at={4.6} r={0.6} />}
        the digital library · every volume executable · 3,323 rules certified
      </text>
    </svg>
  );
}

// ── the component ────────────────────────────────────────────────────

export function CorpusLibrary({
  autopilot = false,
  finale = false,
  pose = "stacks",
  onArrived,
}: {
  autopilot?: boolean;
  finale?: boolean;
  pose?: "stacks" | "landed";
  onArrived?: () => void;
}) {
  useEffect(() => {
    if (!onArrived) return;
    const ms = finale ? (REDUCED ? 9000 : 10500) : autopilot ? (REDUCED ? 2600 : 10300) : 0;
    if (!ms) return;
    const t = window.setTimeout(() => onArrived(), ms);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (finale) return <ActFinale />;
  if (pose === "landed") return <ActLanded />;
  return <ActStacks auto={autopilot} />;
}
