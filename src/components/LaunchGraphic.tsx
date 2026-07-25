import { useEffect, useMemo, useRef, useState } from "react";
import { JourneyDemo } from "./JourneyDemo";
import { FlatStrip } from "./FlatStrip";
import { AxiomGlyph } from "./AxiomGlyph";

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

// `strands` is the multiplicity made visible: each ribbon is drawn as a
// bundle of that many hairline feeds (one per state, per title group, per
// manual…), so "hundreds of official sites" is texture you can see, not
// just a caption.
const SOURCES = [
  { label: "eCFR", sub: "federal regulations", c: 88, h: 40, strands: 5 },
  { label: "US Code", sub: "54 titles", c: 158, h: 46, strands: 7 },
  { label: "Agency guidance", sub: "IRS · policy manuals", c: 228, h: 40, strands: 14 },
  { label: "State codes", sub: "50 states + DC", c: 312, h: 92, strands: 51 },
  { label: "UK", sub: "legislation.gov.uk", c: 396, h: 36, strands: 5 },
  { label: "Canada", sub: "laws-lois", c: 458, h: 36, strands: 4 },
  { label: "Belgium", sub: "ELI · federal acts", c: 514, h: 30, strands: 3 },
];

// The application layer: where verified rules are used. `dock` is where
// the green (executable) branch lands; Web's stub is taller because it
// ALSO receives the pale "whole corpus, browsable" band above its dock.
const SURFACES = [
  { label: "Web", sub: "browse & trace", c: 250, dock: 268, stubTop: 208, stubH: 70 },
  { label: "API + SDKs", sub: "calculate at scale", c: 330, dock: 330, stubTop: 320, stubH: 20 },
  { label: "AI agents", sub: "cited answers", c: 410, dock: 410, stubTop: 400, stubH: 20 },
];

// The whole corpus flows to the web TODAY — browsable and citable even
// before a provision is encoded. This band is what kills the "1.7M
// provisions drop out of the pipeline" misreading.
const BROWSE_BAND = link(412, 152, 196, 1300, 210, 246);
const RULES_X = 1132;
const SURFACE_X = 1300;
const RULES_TOP = 295;

// One wave per cycle; dots move at constant velocity within it.
// SPEED × CYCLE is held ≈ constant vs earlier tunings so all derived
// keyTime fractions (spotlight windows, color flips) stay valid.
const CYCLE = 17;

// ── Under the hood: click a pathway, zoom in, see the machinery ──────
// The overview viewBox glides into the region while a panel explains
// what actually happens there. The live animation keeps running — you
// watch the same dots up close.
const OVERVIEW: Box = [0, 0, 1420, 620];

// Frame a region's CONTENT box so it sits fully inside the panel-free part
// of the viewport. The svg's aspect is fixed by the viewBox (width: 100%,
// height: auto), so the math is exact — no hand-tuned zoom targets.
function computeView(r: Region): Box {
  const A = 1420 / 620; // viewport aspect
  const PANEL = 0.38; // fraction covered by the docked panel (incl. margin)
  const PAD = 16;
  const [bx, by, bw0, bh0] = r.box;
  const cw = bw0 + PAD * 2;
  const ch = bh0 + PAD * 2;
  const ccx = bx + bw0 / 2;
  const ccy = by + bh0 / 2;
  const free = 1 - PANEL;
  const H = Math.max(ch, cw / (A * free));
  const W = A * H;
  const x0 =
    r.side === "left" ? ccx - W * (PANEL + free / 2) : ccx - W * (free / 2);
  return [x0, ccy - H / 2, W, H];
}

type Box = [number, number, number, number];

type Region = {
  id: string;
  box: Box; // CONTENT box — everything that must remain visible when zoomed
  hit: Box; // clickable overlay area
  side: "left" | "right"; // where the panel docks
  kicker: string;
  title: string;
  steps: Array<{ name: string; detail: string }>;
  foot: string;
};

const REGIONS: Region[] = [
  {
    id: "capture",
    box: [15, 25, 600, 530],
    hit: [15, 30, 580, 525],
    side: "right",
    kicker: "01 · capture",
    title: "From publisher to permanent record",
    steps: [
      {
        name: "Fetch",
        detail:
          "Rate-limited downloads from each official site — raw bytes, untouched.",
      },
      {
        name: "Parse",
        detail:
          "Every publisher's format — XML, HTML, PDF — becomes typed structure.",
      },
      {
        name: "Address",
        detail:
          "Each provision gets a canonical citation path, like us/statute/7/2017/a.",
      },
      {
        name: "Fingerprint & file",
        detail:
          "sha256 checksums; originals mirrored to cold storage; provisions loaded to the live corpus.",
      },
    ],
    foot: "A coverage report compares what we expected against what we extracted — incomplete ingests fail loudly.",
  },
  {
    id: "corpus",
    box: [330, 85, 330, 400],
    hit: [335, 90, 240, 400],
    side: "right",
    kicker: "02 · the corpus",
    title: "One table of the law",
    steps: [
      {
        name: "1.7M+ provisions",
        detail: "One row per provision — body text plus 20+ metadata columns.",
      },
      {
        name: "Deterministic identity",
        detail:
          "Row ids derive from the citation path, so re-ingesting the same law is a no-op, never a duplicate.",
      },
      {
        name: "The document survives",
        detail:
          "Whole snapshots preserve the original bytes; parent links keep each document's tree navigable.",
      },
      {
        name: "Derived indexes",
        detail:
          "Navigation, counts, and cross-references all rebuild from provisions in minutes.",
      },
    ],
    foot: "corpus.provisions is the single source of truth — everything downstream is rebuildable.",
  },
  {
    id: "drafting",
    box: [385, 225, 310, 245],
    hit: [420, 220, 250, 190],
    side: "right",
    kicker: "03 · encoding",
    title: "AI drafts, the source decides",
    steps: [
      {
        name: "Workspace",
        detail:
          "The provision plus its context: sibling sections, cross-references, definitions.",
      },
      {
        name: "Draft",
        detail:
          "An AI drafts the executable rule in RuleSpec — an open YAML format.",
      },
      {
        name: "Proof atoms",
        detail:
          "Every number and condition must cite its exact source words: 0.30 ← “30 per centum”.",
      },
      {
        name: "Approved names",
        detail:
          "A concept registry locks each legal concept to one canonical variable name.",
      },
    ],
    foot: "No citation, no rule — ungrounded values are rejected before validation even starts.",
  },
  {
    id: "gates",
    box: [655, 220, 340, 270],
    hit: [680, 220, 240, 300],
    side: "left",
    kicker: "04 · validation",
    title: "The gauntlet, gate by gate",
    steps: [
      {
        name: "1 · It runs",
        detail: "The Rust rules engine must compile and execute the draft.",
      },
      {
        name: "2 · 50+ checks",
        detail:
          "Automated: no unsourced numbers, full subsection coverage, tests pass.",
      },
      {
        name: "3 · It agrees",
        detail:
          "Outputs must match independent calculators within tolerance before landing.",
      },
      {
        name: "4 · It’s reviewed",
        detail:
          "Independent reviewers sign off — separate from the drafting AI.",
      },
    ],
    foot: "Any failure loops back for redrafting — deterministic repair commands fix the common cases automatically.",
  },
  {
    id: "rulebook",
    box: [875, 235, 340, 245],
    hit: [900, 240, 250, 220],
    side: "left",
    kicker: "05 · the rulebook",
    title: "Signed, versioned, citable",
    steps: [
      {
        name: "Signed manifest",
        detail:
          "Every accepted rule ships with a cryptographically signed record of how it was made.",
      },
      {
        name: "Versioned provenance",
        detail:
          "The encoder version is pinned into the manifest — every rule is reproducible.",
      },
      {
        name: "Durable ids",
        detail:
          "us:statutes/7/2017/a#snap_allotment — stable forever, safe to cite.",
      },
      {
        name: "Open",
        detail: "Anyone can read, run, or challenge any rule in the book.",
      },
    ],
    foot: "3,000+ rules and counting — one per provision, each bundled with its tests.",
  },
  {
    id: "delivery",
    box: [1095, 170, 325, 320],
    hit: [1150, 170, 265, 300],
    side: "left",
    kicker: "06 · delivery",
    title: "From rulebook to answers",
    steps: [
      {
        name: "Compose",
        detail:
          "Atomic rules assemble into runnable programs — SNAP for a state, income tax for a year.",
      },
      {
        name: "Execute",
        detail:
          "The Rust engine computes answers in milliseconds, at population scale.",
      },
      {
        name: "Serve",
        detail:
          "Web, API + SDKs, and AI agents — every answer cites its provisions.",
      },
      {
        name: "Stay current",
        detail:
          "Re-verified weekly against independent calculators; every legislature watched hourly.",
      },
    ],
    foot: "✓ 99.9% agreement with PolicyEngine · TAXSIM · EUROMOD across 299,993 checks.",
  },
];

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Spotlight: a section holds full opacity while the cohort is passing
// through it (windows derived from the constant-speed timings); the rest
// of the time it rests slightly dimmed. Reduced motion: fully lit, still.
// Softer dim now that two staggered page-cohorts overlap the windows.
const DIM = 0.7;

const WIN = {
  sources: [0.01, 0.44],
  draft: [0.12, 0.52],
  encoded: [0.24, 0.62],
  loop: [0.36, 0.62],
  verified: [0.34, 0.75],
  surfaces: [0.46, 0.85],
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
// Two pages per document per cycle: page 1's lines highlight slowly and
// become dots; mid-wave the document flips and page 2 emits while page 1
// is crossing the gates — the chart always has material in flight.
const EMIT_AT = 0.028; // first line highlight, as fraction of cycle
const LINE_STEP = 0.016; // between line highlights
const PAGE2_AT = 0.175; // page-two emission offset
const FLIP_AT = 0.16; // the page turn

type WaveDot = {
  src: number;
  lane: number; // -1..1 across the ribbon's thickness
  jit: number; // small per-dot start offset
  delay: number; // its document's arrival offset
  page: 0 | 1;
  line: number; // which text line of the page it came from
  surface: number;
  loops: boolean; // fails the gates and rides the redraft loop
};

type WaveDoc = { srcIdx: number; delay: number; pages: [number[], number[]] };

const dotStart = (d: Pick<WaveDot, "delay" | "page" | "line" | "jit">) =>
  EMIT_AT + d.delay + d.page * PAGE2_AT + d.line * LINE_STEP + d.jit;

function makeWave(): { dots: WaveDot[]; docs: WaveDoc[] } {
  // One document from EVERY publisher, arriving staggered. EVERY line of
  // every page becomes a node — the document fully converts into its
  // provisions, line by line.
  const docs: WaveDoc[] = SOURCES.map((_, srcIdx) => ({
    srcIdx,
    delay: Math.random() * 0.05,
    pages: [
      [0, 1, 2, 3],
      [0, 1, 2, 3],
    ] as [number[], number[]],
  }));

  const dots: WaveDot[] = [];
  for (const doc of docs) {
    doc.pages.forEach((lines, page) => {
      lines.forEach((line, i) => {
        dots.push({
          src: doc.srcIdx,
          lane:
            (i / Math.max(lines.length - 1, 1) - 0.5) * 1.4 +
            (Math.random() - 0.5) * 0.3,
          jit: Math.random() * 0.006,
          delay: doc.delay,
          page: page as 0 | 1,
          line,
          surface: Math.floor(Math.random() * 3),
          loops: false,
        });
      });
    });
  }
  // Every wave redrafts several provisions (2–4), drawn from the early
  // departers (skipping the very first) so every loop detour resolves
  // comfortably inside the cycle — the failures trail each other around
  // the loop instead of one straggler ending the wave.
  const fails = 2 + Math.floor(Math.random() * 3);
  const byDeparture = [...dots.keys()].sort(
    (a, b) => dotStart(dots[a]) - dotStart(dots[b]),
  );
  const earlyPool = byDeparture.slice(1, 11).sort(() => Math.random() - 0.5);
  for (const idx of earlyPool.slice(0, fails)) dots[idx].loops = true;
  return { dots, docs };
}

// The document that breaks apart: appears at the mouth of its source
// stream, its text lines dissolve as the wave's dots pop out of it.
// (Positions derive from SRC_X, declared below — computed inside the
// components so module evaluation order stays legal.)
const DOC_W = 34;
const DOC_H = 44;
const docX = () => SRC_X + 10; // sits at the stream's mouth
const docCenterX = () => docX() + DOC_W / 2;

function DocPage({
  doc,
  page,
  top,
}: {
  doc: WaveDoc;
  page: 0 | 1;
  top: number;
}) {
  const DOC_X = docX();
  const d = doc.delay;
  // page visibility window
  const pageIn = page === 0 ? 0.018 + d : FLIP_AT + d + 0.012;
  const pageOut = page === 0 ? FLIP_AT + d - 0.012 : 0.33 + d;
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const highlighted = doc.pages[page].includes(i);
        const depart = highlighted
          ? dotStart({ delay: d, page, line: i, jit: 0 })
          : null;
        const x1 = DOC_X + 6;
        const x2 = DOC_X + DOC_W - (i === 3 ? 13 : 6);
        const y = top + 10 + i * 8;
        // a highlighted line fades out as its dot departs; plain lines
        // live until the page turns / the shell fades
        const lineOut = depart !== null ? depart + 0.006 : pageOut;
        return (
          <g key={`${page}-${i}`}>
            <line className="lsk-docbreak__line" x1={x1} x2={x2} y1={y} y2={y}>
              <animate
                attributeName="opacity"
                dur={`${CYCLE}s`}
                repeatCount="indefinite"
                values="0;0;1;1;0;0"
                keyTimes={`0;${pageIn};${pageIn + 0.008};${lineOut};${lineOut + 0.012};1`}
              />
            </line>
            {highlighted && depart !== null && (
              <line
                className="lsk-docbreak__line lsk-docbreak__line--hot"
                x1={x1}
                x2={x2}
                y1={y}
                y2={y}
              >
                {/* the slow highlight: amber sweeps in well before the
                     line detaches as a dot */}
                <animate
                  attributeName="opacity"
                  dur={`${CYCLE}s`}
                  repeatCount="indefinite"
                  values="0;0;1;1;0;0"
                  keyTimes={`0;${depart - 0.018};${depart - 0.004};${depart + 0.004};${depart + 0.014};1`}
                />
              </line>
            )}
          </g>
        );
      })}
    </>
  );
}

function BreakingDocument({ doc }: { doc: WaveDoc }) {
  if (REDUCED_MOTION) return null;
  const s = SOURCE_LINKS[doc.srcIdx];
  const top = s.c - DOC_H / 2;
  const DOC_X = docX();
  const d = doc.delay;
  const flip = FLIP_AT + d;
  return (
    <g className="lsk-docbreak" filter="url(#lsk-doc-shadow)">
      {/* the original sheet — page one lives on this */}
      <rect x={DOC_X} y={top} width={DOC_W} height={DOC_H} rx="3">
        <animate
          attributeName="opacity"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          values="0;0;1;1;0;0"
          keyTimes={`0;${0.005 + d};${0.018 + d};${0.34 + d};${0.375 + d};1`}
        />
      </rect>
      <DocPage doc={doc} page={0} top={top} />
      {/* the page turn: a NEW sheet arrives tilted from above the old
           one and slowly lays down onto the stack — two outlines and its
           own shadow while it hovers — then settles flat exactly on top.
           Page two lives on this sheet. */}
      <g filter="url(#lsk-doc-shadow)">
        <rect x={DOC_X} y={top} width={DOC_W} height={DOC_H} rx="3">
          <animate
            attributeName="opacity"
            dur={`${CYCLE}s`}
            repeatCount="indefinite"
            values="0;0;1;1;0;0"
            keyTimes={`0;${flip - 0.038};${flip - 0.03};${0.34 + d};${0.375 + d};1`}
          />
          <animateTransform
            attributeName="transform"
            type="translate"
            dur={`${CYCLE}s`}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0 0 1 1;0.25 0.7 0.3 1;0 0 1 1"
            values="7 -16;7 -16;0 0;0 0"
            keyTimes={`0;${flip - 0.036};${flip};1`}
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            additive="sum"
            dur={`${CYCLE}s`}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0 0 1 1;0.25 0.7 0.3 1;0 0 1 1"
            values={`-9 ${DOC_X} ${top + DOC_H};-9 ${DOC_X} ${top + DOC_H};0 ${DOC_X} ${top + DOC_H};0 ${DOC_X} ${top + DOC_H}`}
            keyTimes={`0;${flip - 0.036};${flip};1`}
          />
        </rect>
      </g>
      <DocPage doc={doc} page={1} top={top} />
    </g>
  );
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
// redrafted dot's longer journey honestly takes longer. 160 × 17s ≈ the
// previous 210 × 13s budget, so the worst-case journey (farthest source +
// widest lane + max doc delay + redraft loop) still finishes and fades
// with margin before the wave resets — just ~25% slower on screen.
const SPEED = 160;

function buildJourney(anchors: Anchor[], startAt: number) {
  let path = `M ${anchors[0].x} ${anchors[0].y}`;
  const dists = [0];
  for (let i = 1; i < anchors.length; i++) {
    const p = anchors[i - 1];
    const q = anchors[i];
    if (q.mode === "loop") {
      path += ` C 884 442, 656 442, ${q.x} ${q.y}`;
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
  // each dot departs the moment its highlighted line detaches
  const start = startAt;
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
    start,
  };
}

// Merge overlapping [a,b] windows so dense traffic reads as a held flash
// rather than flicker; isolated crossings (stragglers, redraft re-entries)
// get their own blips.
function mergeIntervals(iv: Array<[number, number]>): Array<[number, number]> {
  const sorted = [...iv].sort((p, q) => p[0] - q[0]);
  const out: Array<[number, number]> = [];
  for (const [a, b] of sorted) {
    const last = out[out.length - 1];
    if (last && a <= last[1] + 0.006) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
}

// Build a SMIL values/keyTimes pair that sits at `off`, switching to `on`
// during each interval.
function flashTrack(
  intervals: Array<[number, number]>,
  on: string,
  off: string,
) {
  const values: string[] = [off];
  const times: number[] = [0];
  let cursor = 0.001;
  for (const [a0, b0] of intervals) {
    const a = Math.max(a0, cursor + 0.001);
    const b = Math.min(Math.max(b0, a + 0.006), 0.985);
    if (b <= a) continue;
    times.push(a, Math.min(a + 0.005, b), b, Math.min(b + 0.005, 0.99));
    values.push(off, on, on, off);
    cursor = b + 0.005;
  }
  times.push(1);
  values.push(off);
  return { values: values.join(";"), keyTimes: times.join(";") };
}

type DotJourney = ReturnType<typeof buildDotJourney>;

function buildDotJourney(d: WaveDot) {
  const loops = d.loops;
  const s = SOURCE_LINKS[d.src];
  const srcOff = d.lane * (s.h / 2 - 7);

  const anchors: Anchor[] = [
    // born inside the dissolving document at the stream's mouth
    { x: docCenterX(), y: s.c + d.lane * 7 },
    { x: CORPUS_X, y: s.segC + srcOff, mode: "C" },
    { x: 412, y: 292 + d.lane * 18, mode: "L" },
    { x: 650, y: 330 + d.lane * 38, mode: "C" },
    { x: 662, y: 330 + d.lane * 40, mode: "L" },
    { x: 880, y: 330 + d.lane * 36, mode: "C" },
    ...(loops
      ? ([
          { x: 884, y: 378, mode: "L" },
          { x: 656, y: 388, mode: "loop" },
          { x: 664, y: 330 + d.lane * 40, mode: "L" },
          { x: 880, y: 330 + d.lane * 36, mode: "C" },
        ] as Anchor[])
      : []),
    { x: 892, y: 325 + d.lane * 28, mode: "L" },
    { x: 1120, y: 330 + d.lane * 28, mode: "C" },
    // the trunk ENDS at the rulebook bar — from here the rule broadcasts
    // to ALL THREE surfaces at once (three branch dots), not one of them
    { x: 1132, y: 330 + d.lane * 20, mode: "L" },
  ];

  const built = buildJourney(anchors, dotStart(d));
  const { times } = built;
  return {
    ...built,
    // grey while raw text, amber once past the encode bar, green once
    // past the gates — for loop dots, past the SECOND crossing.
    amberAt: times[4],
    greenAt: times[loops ? 10 : 6],
    arrival: times[times.length - 1],
    // when this dot hits the gates bar (loop dots hit it twice)
    gateCrossings: loops ? [times[5], times[9]] : [times[5]],
    // the broadcast: at the rulebook, one rule → all three surfaces
    branches: SURFACE_LINKS.map((surf) => {
      const y0 = 330 + d.lane * 20;
      const y1 = surf.dock + d.lane * 5;
      const dist = Math.hypot(SURFACE_X - RULES_X, y1 - y0) * 1.05;
      return {
        path: center(RULES_X, surf.branchMid + d.lane * 6, SURFACE_X, y1),
        dur: dist / SPEED / CYCLE,
      };
    }),
  };
}

function JourneyDot({ j }: { j: DotJourney }) {
  if (REDUCED_MOTION) return null;
  const { path, keyTimes, keyPoints, start, amberAt, greenAt, arrival, branches } = j;

  return (
    <g>
      {/* the trunk: source → corpus → gates → the rulebook bar */}
      <circle className="lsk-dot" r="2.6" fill="#78716c" opacity="0">
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
          keyTimes={`0;${start};${Math.min(start + 0.015, arrival)};${arrival + 0.002};${arrival + 0.008};1`}
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
      {/* the broadcast: at the rulebook, the rule fans to ALL surfaces */}
      {branches.map((b, k) => {
        const t0 = arrival;
        const t1 = Math.min(t0 + b.dur, 0.99);
        return (
          <circle className="lsk-dot lsk-dot--branch" r="2.2" key={k} opacity="0">
            <animateMotion
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              path={b.path}
              calcMode="linear"
              keyPoints="0;0;1;1"
              keyTimes={`0;${t0};${t1};1`}
            />
            <animate
              attributeName="opacity"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              values="0;0;1;1;0;0"
              keyTimes={`0;${t0};${Math.min(t0 + 0.006, t1)};${t1};${Math.min(t1 + 0.01, 0.995)};1`}
            />
          </circle>
        );
      })}
    </g>
  );
}
const SURFACE_LINKS = SURFACES.map((s, i) => {
  const t0 = RULES_TOP + (70 / 3) * i;
  const b0 = RULES_TOP + (70 / 3) * (i + 1);
  return {
    ...s,
    d: link(RULES_X, t0, b0, SURFACE_X, s.dock - 10, s.dock + 10),
    cd: center(RULES_X, (t0 + b0) / 2, SURFACE_X, s.dock),
    branchMid: (t0 + b0) / 2,
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
  const journeys = useMemo(() => plan.dots.map(buildDotJourney), [plan]);
  // The gates flash exactly when nodes cross them: gate i's window is each
  // crossing shifted by a small cascade offset, merged.
  const gateTracks = useMemo(() => {
    const crossings = journeys.flatMap((j) => j.gateCrossings);
    return [0, 1, 2, 3].map((i) => {
      const shift = i * 0.005;
      return mergeIntervals(
        crossings.map(
          (t) => [t + shift - 0.002, t + shift + 0.012] as [number, number],
        ),
      );
    });
  }, [journeys]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [view, setView] = useState<"journey" | "strip" | "chart">("journey");

  // ── zoom into a pathway ─────────────────────────────────────────
  const [zoom, setZoom] = useState<Region | null>(null);
  const viewBoxRef = useRef<Box>(OVERVIEW);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const target: Box = zoom ? computeView(zoom) : OVERVIEW;
    const from = viewBoxRef.current;
    if (REDUCED_MOTION) {
      svg.setAttribute("viewBox", target.join(" "));
      viewBoxRef.current = target;
      return;
    }
    const t0 = performance.now();
    const DUR = 550;
    let raf = 0;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const p = ease(Math.min((now - t0) / DUR, 1));
      const cur = from.map((v, i) => v + (target[i] - v) * p) as Box;
      svg.setAttribute("viewBox", cur.join(" "));
      viewBoxRef.current = cur;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [zoom]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Re-roll the cohort at each cycle boundary. CRITICAL: SMIL animations
  // run on the SVG's OWN clock (svg.getCurrentTime()), which is offset
  // from document.timeline by however long the page existed before this
  // tab mounted — scheduling against any other clock lands the swap
  // mid-cycle and kills late-flying loop dots in transit. Every swap is
  // re-scheduled from the SVG clock itself, so it always lands just after
  // phase zero, when no dot is airborne.
  useEffect(() => {
    if (REDUCED_MOTION) return;
    let timeout: number;
    const schedule = () => {
      const svgTime = svgRef.current?.getCurrentTime?.() ?? 0;
      const toBoundary = (CYCLE - (svgTime % CYCLE)) * 1000 + 80;
      timeout = window.setTimeout(() => {
        setWave((w) => w + 1);
        schedule();
      }, toBoundary);
    };
    schedule();
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div className="launch">
      <div className="launch__poster">
        <header className="launch__header">
          <div className="launch__eyebrow">The Axiom Foundation</div>
          <h1 className="launch__headline">
            From published law to a rule you can <em>trust.</em>
          </h1>
          {view === "journey" ? (
            <p className="launch__sub">
              The whole demo in one cycle: one volume comes off the shelf —
              7 U.S.C. § 2017 — the section is encoded and gated, and joins
              the graph. Then the camera backs out until the whole live
              registry is in frame — and the cycle begins again.
            </p>
          ) : view === "strip" ? (
            <p className="launch__sub">
              What Axiom is, on one screen: scraping pipelines fill the
              database, the database becomes the citable corpus, the encoder
              walks every provision through the validator gauntlet, and the
              rules graph compiles into what powers every surface. One amber
              thread follows § 2017 the whole way.
            </p>
          ) : (
            <p className="launch__sub">
              The whole process in one flow: what we capture, what we encode,
              what survives the gates — and where it goes. Widths are
              illustrative; the counts are real.
              {view === "chart" && (
                <strong className="launch__sub-hint">
                  {" "}Click any stage to look under the hood.
                </strong>
              )}
            </p>
          )}
          <div className="launch__viewtoggle" role="group" aria-label="View">
            {(["journey", "strip", "chart"] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={`launch__viewtoggle-btn ${view === v ? "launch__viewtoggle-btn--active" : ""}`}
                onClick={() => setView(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </header>

        {view === "journey" ? (
          <JourneyDemo />
        ) : view === "strip" ? (
          <FlatStrip />
                ) : (
        <div className="lsk__wrap">
          <svg
            ref={svgRef}
            className={`lsk ${zoom ? "lsk--zoomed" : ""}`}
            onClick={() => zoom && setZoom(null)}
            viewBox="0 0 1420 620"
            role="img"
            aria-label="Flow chart: hundreds of official legal sources — federal, state, agency guidance, UK, Canada, Belgium — merge into a corpus of 1.7M+ provisions. Each source band is a bundle of hairline feeds (the State codes band alone is 51), and the sources reference one another before capture: regulations implement statutes, guidance interprets regulations, state codes cite the federal text. The whole corpus flows to the web, browsable today. A growing stream is additionally encoded into rules (the goal: every provision, executable) — a magnifying lens shows the unit of work up close: the words “30 per centum” in one provision become the value 0.30 in one rule, with the citation preserved. The stream passes four verification gates (failures loop back for redrafting), and lands in the rulebook as 3,000+ verified signed rules — each broadcast to every surface at once: web, APIs, and AI agents."
          >
            <defs>
              <filter id="lsk-doc-shadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodColor="#1c1917"
                  floodOpacity="0.28"
                />
              </filter>
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
              <text className="lsk-retest" x="30" y="550">
                documents arrive, page after page, and break into their
                provisions
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

            {/* the feeds inside each ribbon: one hairline per site/title/
                 state — the State codes band is visibly a comb of 51 */}
            <g className="lsk__stage lsk__stage--1">
              {SOURCE_LINKS.map((s) => {
                const pad = 5;
                const span = s.h - pad * 2;
                return Array.from({ length: s.strands }, (_, i) => {
                  const off =
                    s.strands === 1
                      ? 0
                      : -span / 2 + (i * span) / (s.strands - 1);
                  return (
                    <path
                      key={`${s.label}${i}`}
                      className="lsk-strand"
                      d={center(SRC_X, s.c + off, CORPUS_X, s.segC + off)}
                    />
                  );
                });
              })}
            </g>

            {/* sources reference one another BEFORE we ever touch them:
                 regulations implement statutes, guidance interprets
                 regulations, state codes cite the federal text */}
            <g className="lsk__stage lsk__stage--1">
              {[
                { d: "M 242 132 C 254 146, 254 158, 244 170", label: "implements", lx: 260, ly: 152 },
                { d: "M 272 230 C 286 214, 286 202, 274 190", label: "interprets", lx: 290, ly: 212 },
                { d: "M 300 306 C 318 282, 318 264, 302 248", label: "cites", lx: 322, ly: 280 },
              ].map(({ d, label, lx, ly }) => (
                <g key={label}>
                  <path className="lsk-xref" d={d} markerEnd="url(#lsk-loop-arr)" />
                  <text className="lsk-xref-label" x={lx} y={ly}>{label}</text>
                </g>
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

            {/* corpus → web: EVERYTHING is browsable today, encoded or not.
                 This is the flow that would otherwise read as "dropped". */}
            <g className="lsk__stage lsk__stage--2">
              <path className="lsk-ribbon lsk-ribbon--browse" d={BROWSE_BAND} />
              <text className="lsk-band-label" x="820" y="200" textAnchor="middle">
                the whole corpus, browsable today
              </text>
              {!REDUCED_MOTION &&
                [0, 1].map((i) => (
                  <circle key={i} className="lsk-dot lsk-dot--raw" r="2.4" opacity="0.7">
                    <animateMotion
                      dur="9s"
                      begin={`${-4.5 * i - 1}s`}
                      repeatCount="indefinite"
                      path={center(412, 168 + i * 16, 1300, 222 + i * 12)}
                    />
                  </circle>
                ))}
            </g>

            {/* corpus → encoding (the executable frontier). The dashed
                 envelope is the GOAL: the entire corpus, executable — the
                 solid stream grows to fill it. Actual vs target, in chart
                 grammar. */}
            <g className="lsk__stage lsk__stage--3">
              <path
                className="lsk-goal"
                d={link(412, 200, 472, 650, 280, 380)}
              />
              <path
                className="lsk-ribbon lsk-ribbon--draft"
                d={link(412, 272, 312, 650, 280, 380)}
              >
                <Pulse w={WIN.draft} />
              </path>
              <text className="lsk-band-label lsk-band-label--frontier" x="520" y="274" textAnchor="middle">
                encoded so far · growing weekly
              </text>
              <text className="lsk-band-label lsk-band-label--goal" x="540" y="452" textAnchor="middle">
                the goal: every provision, executable
              </text>
              <rect className="lsk-bar lsk-bar--encode" x="650" y="280" width="12" height="100" rx="3" />
              <text className="lsk-name" x="656" y="247" textAnchor="middle">
                Encoding
              </text>
              <text className="lsk-eyebrow" x="656" y="264" textAnchor="middle">
                tied to the source text
              </text>
            </g>

            {/* ── the lens: the unit of work, up close ─────────────
                 The bands say "how much"; the lens says "how faithfully".
                 One provision magnified: its decisive words in amber, the
                 rule they become, and the proof atom tying them together. */}
            <g className="lsk__stage lsk__stage--3" pointerEvents="none">
              <text className="lsk-eyebrow" x="738" y="16" textAnchor="middle">
                one provision, up close
              </text>
              <path className="lsk-lens-tether" d="M 702 161 C 688 202, 670 240, 660 276" />
              <circle cx="658" cy="278" r="2.4" fill="var(--color-accent)" />
              <g filter="url(#lsk-doc-shadow)">
                <circle className="lsk-lens-ring" cx="738" cy="88" r="64" strokeWidth="1.6" />
              </g>
              <circle cx="738" cy="88" r="58.5" fill="none" stroke="var(--color-ink)" strokeWidth="0.5" opacity="0.45" />
              <text className="lsk-lens-text" x="738" y="64" textAnchor="middle">…reduced by an amount</text>
              <text className="lsk-lens-text" x="738" y="79" textAnchor="middle">
                {"equal to "}
                <tspan fill="var(--color-accent)">30 per centum</tspan>
                {" of"}
              </text>
              <text className="lsk-lens-text" x="738" y="94" textAnchor="middle">the household’s income…</text>
              <text className="lsk-lens-arrow" x="738" y="110" textAnchor="middle">↓</text>
              {/* the proof atom hangs off the ring like a specimen tag */}
              <g filter="url(#lsk-doc-shadow)">
                <rect className="lsk-lens-chip" x="680" y="144" width="116" height="17" rx="3" />
              </g>
              <text className="lsk-lens-code" x="738" y="155.5" textAnchor="middle">
                {"0.30 ← “30 per centum”"}
              </text>
            </g>

            {/* encoding → gates */}
            <g className="lsk__stage lsk__stage--4">
              <path
                className="lsk-ribbon lsk-ribbon--encoded"
                d={link(662, 280, 380, 880, 285, 375)}
              >
                <Pulse w={WIN.encoded} />
              </path>
              {/* the four gates, literally: four segments that flash ✓ in a
                   quick cascade EVERY time nodes cross the bar — windows are
                   computed from the dots' actual crossing times, so the
                   checks fire with the traffic (including redraft
                   re-entries) and never without it */}
              {[0, 1, 2, 3].map((i) => {
                const segH = (90 - 9) / 4;
                const y = 285 + i * (segH + 3);
                const fill = flashTrack(gateTracks[i], "#166534", "#1c1917");
                const check = flashTrack(gateTracks[i], "1", "0");
                return (
                  <g key={`${wave}-${i}`}>
                    <rect
                      className="lsk-bar lsk-bar--gates"
                      x="880"
                      y={y}
                      width="12"
                      height={segH}
                      rx="2"
                    >
                      {!REDUCED_MOTION && (
                        <animate
                          attributeName="fill"
                          dur={`${CYCLE}s`}
                          repeatCount="indefinite"
                          values={fill.values}
                          keyTimes={fill.keyTimes}
                        />
                      )}
                    </rect>
                    {!REDUCED_MOTION && (
                      <text
                        className="lsk-gate-check"
                        x="898"
                        y={y + segH / 2 + 3}
                        opacity="0"
                      >
                        ✓
                        <animate
                          attributeName="opacity"
                          dur={`${CYCLE}s`}
                          repeatCount="indefinite"
                          values={check.values}
                          keyTimes={check.keyTimes}
                        />
                      </text>
                    )}
                  </g>
                );
              })}
              <text className="lsk-name" x="870" y="247" textAnchor="middle">
                Four gates
              </text>
              <text className="lsk-eyebrow" x="870" y="264" textAnchor="middle">
                run · 50+ checks · compare · review
              </text>

              {/* the redraft loop — failures flow back into encoding */}
              <path
                className="lsk-loop"
                d="M 886 378 C 886 442, 656 442, 656 388"
                markerEnd="url(#lsk-loop-arr)"
              >
                <Pulse w={WIN.loop} />
              </path>
              <text className="lsk-loop-label" x="771" y="451" textAnchor="middle">
                ↺ any failure — redrafted
              </text>
            </g>

            {/* gates → rulebook */}
            <g className="lsk__stage lsk__stage--5">
              <path
                className="lsk-ribbon lsk-ribbon--verified"
                d={link(892, 290, 360, 1120, 295, 365)}
              >
                <Pulse w={WIN.verified} />
              </path>
              <rect className="lsk-bar lsk-bar--rules" x="1120" y="295" width="12" height="70" rx="3" />
              <text className="lsk-name" x="1072" y="399" textAnchor="middle">
                The rulebook
              </text>
              <text className="lsk-eyebrow" x="1072" y="416" textAnchor="middle">
                3,000+ rules · signed &amp; citable
              </text>
              <text className="lsk-agree" x="1072" y="433" textAnchor="middle">
                ✓ 99.9% agreement with independent calculators
              </text>
              <text className="lsk-retest" x="1072" y="450" textAnchor="middle">
                re-tested weekly · law watched hourly
              </text>
            </g>

            {/* ── stage: the application layer ───────────────── */}
            <g className="lsk__stage lsk__stage--6">
              <text className="lsk-eyebrow" x="1300" y="198">
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
                    y={s.stubTop}
                    width="8"
                    height={s.stubH}
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
              <text className="lsk-band-label" x="1180" y="472" textAnchor="middle">
                every rule, on every surface
              </text>
            </g>

            {/* ── the cohort: a random batch enters together, each dot
                 one continuous journey — never hidden mid-flight. One
                 may detour through the redraft loop while the others
                 continue; all redistribute across the application
                 branches at the end ─────────────────────────────── */}
            {/* NOTE: no lsk__stage class here — that CSS load-fade restarts
                 on every wave remount and would hide the first ~1.7s of
                 each cycle (exactly the document-break window). SMIL owns
                 all visibility in this layer. */}
            <g key={wave}>
              {plan.docs.map((doc) => (
                <BreakingDocument doc={doc} key={doc.srcIdx} />
              ))}
              {journeys.map((j, i) => (
                <JourneyDot j={j} key={i} />
              ))}
            </g>

            {/* ── focus scrim: when zoomed, dim everything outside the
                 region's content box so the section reads isolated even
                 when the frame is wide (tall regions like capture) ──── */}
            {zoom && (
              <path
                className="lsk-scrim"
                fillRule="evenodd"
                d={`M -1200 -1400 H 3200 V 2200 H -1200 Z M ${zoom.box[0] - 14} ${zoom.box[1] - 14} h ${zoom.box[2] + 28} v ${zoom.box[3] + 28} h ${-(zoom.box[2] + 28)} Z`}
              />
            )}

            {/* ── clickable pathways (only in overview) ────────── */}
            {!zoom &&
              REGIONS.map((r) => (
                <g
                  className="lsk-hit"
                  key={r.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoom(r);
                  }}
                >
                  <rect
                    x={r.hit[0]}
                    y={r.hit[1]}
                    width={r.hit[2]}
                    height={r.hit[3]}
                    rx="10"
                  />
                  {/* label rides ON the outline, with a paper halo so it
                       never fights the chart's own text */}
                  <text x={r.hit[0] + 12} y={r.hit[1] + 4}>
                    {r.kicker} ↗
                  </text>
                </g>
              ))}
          </svg>

          {/* ── the under-the-hood panel ─────────────────────────── */}
          {zoom && (
            <aside
              className={`lgx lgx--${zoom.side}`}
              role="dialog"
              aria-label={zoom.title}
            >
              <div className="lgx__kicker">{zoom.kicker}</div>
              <h2 className="lgx__title">{zoom.title}</h2>
              <ol className="lgx__steps">
                {zoom.steps.map((step, i) => (
                  <li className="lgx__step" key={step.name}>
                    <span className="lgx__step-n">{i + 1}</span>
                    <div>
                      <div className="lgx__step-name">{step.name}</div>
                      <div className="lgx__step-detail">{step.detail}</div>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="lgx__foot">{zoom.foot}</p>
              <button
                type="button"
                className="lgx__back"
                onClick={() => setZoom(null)}
              >
                ← back to the overview
              </button>
            </aside>
          )}
        </div>
        )}

        <footer className="launch__footline">
          <span>
            4 countries · 50 states + DC · 1.7M+ provisions · 3,000+ encoded
            rules
          </span>
          <span className="launch__footbrand">
            <AxiomGlyph className="glyph-axiom" /> axiom-foundation.org
          </span>
        </footer>
      </div>
    </div>
  );
}
