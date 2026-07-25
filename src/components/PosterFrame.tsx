// "The document is the interface" — the full pipeline in the poster's
// typographic language. Four columns on a strict grid, one SMIL clock:
//
//   I    the law: a real statute, visibly segmented into provisions
//   II   the corpus: a ledger the provisions are filed into — where other
//        sources (amendments, regulations) cross-reference the same lines
//   III  the rulespecs: each provision encoded node by node, and each
//        encoding validated before the next (one fails compare and is
//        redrafted in place)
//   IV   the composed module, sealed — then quoted downstream on the
//        web, the API, and by AI agents
//
// Everything is type, hairline rules, and leader lines. Two typefaces,
// one amber accent, green only for verdicts. Finished acts recede to
// ghost opacity; the film ends as one complete, quiet broadsheet.

import { useRef, useState } from "react";

const CYCLE = 32;
const END = 0.955;
const CLEAR = 0.982;

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const STATIC = REDUCED_MOTION;

const INK = "var(--color-ink)";
const MUTED = "var(--color-ink-muted)";
const WAX = "var(--color-accent)";
const OK = "var(--color-success)";

const SERIF: React.CSSProperties = { fontFamily: "var(--f-serif)", fontSize: "15.5px", fill: INK };
const MONO = (size: number, fill: string = INK): React.CSSProperties => ({
  fontFamily: "var(--f-mono)",
  fontSize: `${size}px`,
  fill,
});

// ── the score ─────────────────────────────────────────────────────────
const T = {
  law: 0.012,
  seg: [0.055, 0.075, 0.095],
  corpusHead: 0.13,
  corpusCtx: 0.145,
  filed: [0.165, 0.185, 0.205],
  xref: [0.235, 0.26],
  enc: [
    { lead: 0.315, text: 0.335, checks: [0.375, 0.39, 0.405, 0.42] },
    { lead: 0.455, text: 0.475, checks: [0.515, 0.53, 0.618, 0.638] },
    { lead: 0.66, text: 0.675, checks: [0.705, 0.72, 0.735, 0.75] },
  ],
  redraft: { flag: 0.545, strike: 0.56, gone: 0.588, fixed: 0.596 },
  mod: { head: 0.775, lines: [0.795, 0.81, 0.825], seal: 0.845 },
  down: { head: 0.87, rows: [0.885, 0.905, 0.925] },
  ghostCorpus: 0.34,
  ghostLaw: 0.76,
  ghostStubs: 0.86,
};

const PHASES = [
  { at: 0.012, name: "The law, in sections", sub: "a statute is broken into provisions" },
  { at: 0.13, name: "Filed in the corpus", sub: "fingerprinted · cross-referenced by other sources · 1.7M+ provisions" },
  { at: 0.315, name: "Encoded, node by node", sub: "statute · regulation · guidance — many sources, one rulespec" },
  { at: 0.505, name: "Validated, encoding by encoding", sub: "run · checks · compare · review — failures redrafted" },
  { at: 0.775, name: "Composed & sealed", sub: "the rules assemble into a signed module — joining 3,323 others" },
  { at: 0.87, name: "Used downstream", sub: "web · API · AI agents — the same rule, cited" },
];

// ── SMIL helpers (static-aware) ───────────────────────────────────────

// appear at `a`, optionally recede to ghost at `dim`, hold to END
function In({ a, dim, rest = 0.45, max = 1 }: { a: number; dim?: number; rest?: number; max?: number }) {
  if (STATIC) return null;
  if (dim !== undefined) {
    const g = max * rest;
    return (
      <animate
        attributeName="opacity"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        calcMode="spline"
        keySplines="0 0 1 1;0.3 0 0.2 1;0 0 1 1;0.3 0 0.2 1;0 0 1 1;0.3 0 0.2 1;0 0 1 1"
        values={`0;0;${max};${max};${g};${g};0;0`}
        keyTimes={`0;${a};${Math.min(a + 0.014, dim)};${dim};${Math.min(dim + 0.03, END)};${END};${CLEAR};1`}
      />
    );
  }
  return (
    <animate
      attributeName="opacity"
      dur={`${CYCLE}s`}
      repeatCount="indefinite"
      calcMode="spline"
      keySplines="0 0 1 1;0.3 0 0.2 1;0 0 1 1;0.3 0 0.2 1;0 0 1 1"
      values={`0;0;${max};${max};0;0`}
      keyTimes={`0;${a};${Math.min(a + 0.014, END)};${END};${CLEAR};1`}
    />
  );
}

// visible only inside [a, b]
function Between({ a, b }: { a: number; b: number }) {
  if (STATIC) return null;
  return (
    <animate
      attributeName="opacity"
      dur={`${CYCLE}s`}
      repeatCount="indefinite"
      calcMode="spline"
      keySplines="0 0 1 1;0.3 0 0.2 1;0 0 1 1;0.3 0 0.2 1;0 0 1 1"
      values="0;0;1;1;0;0"
      keyTimes={`0;${a};${a + 0.01};${b};${b + 0.01};1`}
    />
  );
}

const O = (visibleWhenStatic = true) => (STATIC ? (visibleWhenStatic ? 1 : 0) : 0);

// faint from the opening beat, full ink when the act arrives
function Fore({ at, ghost = 0.16 }: { at: number; ghost?: number }) {
  if (STATIC) return null;
  return (
    <animate
      attributeName="opacity"
      dur={`${CYCLE}s`}
      repeatCount="indefinite"
      calcMode="spline"
      keySplines="0 0 1 1;0.3 0 0.2 1;0 0 1 1;0.3 0 0.2 1;0 0 1 1;0.3 0 0.2 1;0 0 1 1"
      values={`0;0;${ghost};${ghost};1;1;0;0`}
      keyTimes={`0;0.028;0.05;${at};${Math.min(at + 0.016, END)};${END};${CLEAR};1`}
    />
  );
}

function ColumnHead({ x, w, label, at }: { x: number; w: number; label: string; at: number }) {
  return (
    <g opacity={O()}>
      <Fore at={at} />
      <text style={MONO(11, MUTED)} x={x} y="108" letterSpacing="0.08em">
        {label}
      </text>
      <line x1={x} y1="118" x2={x + w} y2="118" stroke={INK} strokeWidth="0.75" opacity="0.5" />
    </g>
  );
}

// a leader line that draws itself at `at`
function Leader({ d, at, dim }: { d: string; at: number; dim?: number }) {
  return (
    <g opacity={O()}>
      <In a={at} dim={dim} />
      <path d={d} fill="none" stroke={INK} strokeWidth="0.75" opacity="0.45" pathLength={1}
        strokeDasharray="1" strokeDashoffset={STATIC ? 0 : 1}>
        {!STATIC && (
          <animate
            attributeName="stroke-dashoffset"
            dur={`${CYCLE}s`}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0 0 1 1;0.25 0 0.15 1;0 0 1 1"
            values="1;1;0;0"
            keyTimes={`0;${at};${at + 0.03};1`}
          />
        )}
      </path>
    </g>
  );
}

// ── column I: the law ─────────────────────────────────────────────────

const L_X = 70;
const L_W = 470;

type Span = { t: string; rubric?: boolean };
const SEGMENTS: Array<{ id: string; lines: Array<{ y: number; spans: Span[]; justify: boolean }>; sepY?: number; chipY: number }> = [
  {
    id: "(a)",
    chipY: 146,
    sepY: 224,
    lines: [
      { y: 146, justify: true, spans: [{ t: "(a) The value of the allotment shall be equal to the cost" }] },
      { y: 174, justify: true, spans: [{ t: "of the " }, { t: "thrifty food plan", rubric: true }, { t: " reduced by an amount equal to" }] },
      { y: 202, justify: false, spans: [{ t: "30 per centum of the household’s income", rubric: true }, { t: " …" }] },
    ],
  },
  {
    id: "(b)",
    chipY: 250,
    sepY: 300,
    lines: [
      { y: 250, justify: true, spans: [{ t: "(b) Allotments shall be issued to any household that is" }] },
      { y: 278, justify: false, spans: [{ t: "certified as eligible", rubric: true }, { t: " under section 2014 of this title …" }] },
    ],
  },
  {
    id: "(c)",
    chipY: 326,
    lines: [
      { y: 326, justify: false, spans: [{ t: "(c) … " }, { t: "rounded to the nearest lower whole-dollar increment", rubric: true }, { t: "." }] },
    ],
  },
];

function TheLaw() {
  return (
    <g>
      <g opacity={O()}>
        <In a={T.law} dim={T.ghostLaw} />
        <text style={MONO(11, MUTED)} x={L_X} y="108" letterSpacing="0.08em">
          {"7 U.S.C. § 2017 — VALUE OF ALLOTMENT"}
        </text>
        <text style={MONO(9, MUTED)} x={L_X + L_W + 20} y="108" textAnchor="end" opacity="0.75">
          {"chapter 51 · one section of many"}
        </text>
        <line x1={L_X} y1="118" x2={L_X + L_W + 20} y2="118" stroke={INK} strokeWidth="0.75" opacity="0.5" />
        {SEGMENTS.flatMap((seg) =>
          seg.lines.map((ln, k) => (
            <text
              key={`${seg.id}${k}`}
              style={SERIF}
              x={L_X}
              y={ln.y}
              textLength={ln.justify ? L_W : undefined}
              lengthAdjust="spacing"
            >
              {ln.spans.map((s, j) => (
                <tspan key={j} fill={s.rubric ? WAX : INK}>
                  {s.t}
                </tspan>
              ))}
            </text>
          ))
        )}
        <text style={MONO(10.5, MUTED)} x={L_X} y="392">
          {"as published · 124 Stat. 3359 · amended through 2026"}
        </text>
      </g>
      {/* segmentation: separators + provision chips */}
      {SEGMENTS.map((seg, i) => (
        <g key={seg.id} opacity={O()}>
          <In a={T.seg[i]} dim={T.ghostLaw} />
          {seg.sepY && (
            <line x1={L_X} y1={seg.sepY} x2={L_X + L_W + 20} y2={seg.sepY} stroke={INK} strokeWidth="0.5" opacity="0.35" />
          )}
          <circle cx={L_X + L_W + 42} cy={seg.chipY - 5} r="2.2" fill={WAX} />
          <text style={MONO(10, WAX)} x={L_X + L_W + 50} y={seg.chipY}>
            {seg.id}
          </text>
        </g>
      ))}
    </g>
  );
}

// ── column II: the corpus ledger ──────────────────────────────────────

const C_X = 640;
const C_W = 200;
const FILED = [
  { y: 182, id: "§ 2017(a)", hash: "61e0…ac85" },
  { y: 206, id: "§ 2017(b)", hash: "118e…706a" },
  { y: 230, id: "§ 2017(c)", hash: "d4df…b72e" },
];
const CTX = [
  { y: 134, t: "§ 2016(g) · 22c8…9d10" },
  { y: 158, t: "§ 2016(h) · e01f…77b4" },
  { y: 254, t: "USDA · TFP 2026 · 4c19…d803" },
  { y: 278, t: "7 C.F.R. 273.10 · 88ac…f532" },
];

function TheCorpus() {
  return (
    <g opacity={O()}>
      <In a={T.corpusHead} dim={T.ghostCorpus} />
      {/* the ledger it joins: neighbours already filed */}
      <g opacity={STATIC ? 0.45 : 1}>
        {!STATIC && <In a={T.corpusCtx} max={0.45} />}
        {CTX.map(({ y, t }) => (
          <text key={y} style={MONO(10, MUTED)} x={C_X} y={y}>
            {t}
          </text>
        ))}
      </g>
      {/* the three provisions, filed and fingerprinted */}
      {FILED.map(({ y, id, hash }, i) => (
        <g key={id} opacity={O()}>
          <In a={T.filed[i]} />
          <text style={MONO(10.5)} x={C_X} y={y}>
            {id}
            <tspan fill={MUTED}>{"  ·  "}</tspan>
            <tspan fill={MUTED}>{hash}</tspan>
          </text>
        </g>
      ))}
      {/* other sources reach into the same ledger lines */}
      <g opacity={O()}>
        <In a={T.xref[0]} />
        <text style={MONO(9.5, WAX)} x={C_X} y="330">
          {"↳ amended by P.L. 117-2 § 1101"}
        </text>
        <path d={`M ${C_X - 10} 326 V ${FILED[0].y - 4} H ${C_X - 4}`} fill="none" stroke={WAX} strokeWidth="0.7" strokeDasharray="2 3" opacity="0.7" />
      </g>
      <g opacity={O()}>
        <In a={T.xref[1]} />
        <text style={MONO(9.5, WAX)} x={C_X} y="354">
          {"↳ interpreted by 7 C.F.R. § 273.10(e)"}
        </text>
        <path d={`M ${C_X - 16} 350 V ${FILED[1].y - 4} H ${C_X - 4}`} fill="none" stroke={WAX} strokeWidth="0.7" strokeDasharray="2 3" opacity="0.7" />
      </g>
    </g>
  );
}

// ── column III: the rulespecs, encoded and validated ──────────────────

const R_X = 890;
const STUBS = [
  {
    name: "snap/allotment.rulespec",
    top: 140,
    parts: [
      { t: "allotment = ", fill: INK },
      { t: "tfp", fill: WAX },
      { t: " − ", fill: INK },
      { t: "0.30 × net_inc", fill: WAX },
    ],
  },
  {
    name: "snap/eligibility.rulespec",
    top: 240,
    parts: [
      { t: "eligible = certified(", fill: INK },
      // token + ")" placed explicitly (the token is the redraft overlay)
    ],
  },
  {
    name: "snap/rounding.rulespec",
    top: 340,
    parts: [
      { t: "payment = ", fill: INK },
      { t: "floor(allotment, $1)", fill: WAX },
    ],
  },
];
const CHECK_NAMES = ["run", "checks", "compare", "review"];
// x of the flawed token: after "eligible = certified(" at 11.5px mono
const TOKEN_X = R_X + 21 * 6.92;

function CheckStrip({ stub, i }: { stub: (typeof STUBS)[number]; i: number }) {
  const y = stub.top + 46;
  const flawed = i === 1;
  return (
    <g>
      {CHECK_NAMES.map((name, j) => {
        const x = R_X + j * 64;
        const at = T.enc[i].checks[j];
        return (
          <g key={name} opacity={O()}>
            <In a={at} />
            <text style={MONO(9.5, OK)} x={x} y={y}>✓</text>
            <text style={MONO(9.5, MUTED)} x={x + 10} y={y}>{name}</text>
          </g>
        );
      })}
      {/* the compare failure, before its eventual ✓ */}
      {flawed && !STATIC && (
        <g opacity="0">
          <Between a={T.redraft.flag} b={T.redraft.gone} />
          <text style={MONO(9.5, WAX)} x={R_X + 2 * 64} y={y}>✗</text>
          <text style={MONO(9.5, WAX)} x={R_X + 2 * 64 + 10} y={y}>compare</text>
        </g>
      )}
    </g>
  );
}

function Rulespecs() {
  return (
    <g opacity={O()}>
      <In a={T.enc[0].lead} dim={T.ghostStubs} rest={0.5} />
      <g opacity={O()}>
        <In a={0.63} />
        <text style={MONO(9.5, MUTED)} x={R_X} y="428">
          {"compare gate: agrees with PolicyEngine to ±$0.01"}
        </text>
      </g>
      {STUBS.map((stub, i) => (
        <g key={stub.name} opacity={O()}>
          <In a={T.enc[i].text} />
          <circle cx={R_X - 14} cy={stub.top + 16} r="2.2" fill={WAX} />
          <text style={MONO(9.5, MUTED)} x={R_X} y={stub.top}>
            {stub.name}
          </text>
          <text style={MONO(11.5)} x={R_X} y={stub.top + 22}>
            {stub.parts.map((p, k) =>
              p.t ? (
                <tspan key={k} fill={p.fill}>
                  {p.t}
                </tspan>
              ) : null
            )}
          </text>
          {/* the flawed token: § 2015, caught, struck, redrafted to § 2014 */}
          {i === 1 && (
            <>
              <text style={MONO(11.5)} x={TOKEN_X + 43} y={stub.top + 22}>{")"}</text>
              {!STATIC && (
                <text style={MONO(11.5, WAX)} x={TOKEN_X} y={stub.top + 22} opacity="0">
                  {"§ 2015"}
                  <Between a={T.enc[1].text} b={T.redraft.gone} />
                </text>
              )}
              {!STATIC && (
                <line
                  x1={TOKEN_X - 2}
                  y1={stub.top + 18}
                  x2={TOKEN_X + 44}
                  y2={stub.top + 18}
                  stroke={WAX}
                  strokeWidth="1.8"
                  opacity="0"
                >
                  <Between a={T.redraft.strike} b={T.redraft.gone} />
                </line>
              )}
              <text style={MONO(11.5, WAX)} x={TOKEN_X} y={stub.top + 22} opacity={O()}>
                {"§ 2014"}
                <In a={T.redraft.fixed} />
              </text>
            </>
          )}
          <CheckStrip stub={stub} i={i} />
        </g>
      ))}
    </g>
  );
}

// segment → rulespec leaders (drawn at each encode beat)
function EncodeLeaders() {
  const from = SEGMENTS.map((s) => [L_X + L_W + 42, s.chipY - 5] as const);
  const to = STUBS.map((s) => [R_X - 14, s.top + 16] as const);
  const mids = [612, 860, 868];
  return (
    <g>
      {SEGMENTS.map((_, i) => {
        const [ax, ay] = from[i];
        const [bx, by] = to[i];
        const d = i === 0
          ? `M ${ax + 6} ${ay} H ${mids[0]} V 70 H ${bx - 24} V ${by} H ${bx - 6}`
          : `M ${ax + 6} ${ay} H ${mids[i]} V ${by} H ${bx - 6}`;
        return <Leader key={i} d={d} at={T.enc[i].lead} dim={T.ghostStubs} />;
      })}
    </g>
  );
}

// sources interacting: the corpus lines a rule draws on light up and
// send their own leaders, converging with the provision's leader at the
// stub's node — statute + regulation + guidance, combined into one rule.
const SOURCE_FEEDS = [
  { from: [808, 250] as const, d: "M 808 250 H 852 V 156 H 864", enc: 0, text: "USDA · TFP 2026 · 4c19…d803", y: 254 },
  { from: [808, 274] as const, d: "M 808 274 H 860 V 256 H 864", enc: 1, text: "7 C.F.R. 273.10 · 88ac…f532", y: 278 },
];

function SourceFeeds() {
  return (
    <g>
      {SOURCE_FEEDS.map(({ from, d, enc, text, y }) => (
        <g key={d}>
          <Leader d={d} at={T.enc[enc].lead + 0.012} dim={T.ghostStubs} />
          <g opacity={O(false)}>
            {!STATIC && <Between a={T.enc[enc].lead + 0.012} b={T.enc[enc].checks[3] + 0.03} />}
            <text style={MONO(10, WAX)} x={C_X} y={y}>{text}</text>
          </g>
          <circle cx={from[0]} cy={from[1]} r="2" fill={INK} opacity={STATIC ? 0.55 : 0}>
            {!STATIC && <In a={T.enc[enc].lead + 0.012} dim={T.ghostStubs} max={0.55} />}
          </circle>
        </g>
      ))}
    </g>
  );
}

// ── column IV: the module, sealed — then downstream ───────────────────

const M_X = 1180;
const M_W = 176;

function TheModule() {
  return (
    <g>
      {["allotment", "eligibility", "rounding"].map((name, i) => (
        <g key={name} opacity={O()}>
          <In a={T.mod.lines[i]} />
          <text style={MONO(10.5)} x={M_X} y={148 + i * 24}>
            <tspan fill={MUTED}>{"· "}</tspan>
            {name}
            <tspan fill={OK}>{"  ✓"}</tspan>
          </text>
        </g>
      ))}
      <g opacity={O()}>
        <In a={T.mod.seal} />
        <line x1={M_X} y1="234" x2={M_X + M_W} y2="234" stroke={INK} strokeWidth="0.75" opacity="0.5" />
        <text style={MONO(9.5, MUTED)} x={M_X} y="256">
          {"sealed · 0c86…8c89"}
        </text>
        <text style={MONO(9.5, MUTED)} x={M_X} y="274">
          {"3 rules · signed · citable"}
        </text>
      </g>

      <g opacity={O()}>
        <In a={T.down.head} />
        <text style={MONO(11, MUTED)} x={M_X} y="330" letterSpacing="0.08em">
          {"DOWNSTREAM"}
        </text>
        <line x1={M_X} y1="340" x2={M_X + M_W} y2="340" stroke={INK} strokeWidth="0.75" opacity="0.5" />
      </g>
      {[
        { pre: "web", body: "“Your allotment: $478/mo.”", serif: true },
        { pre: "api", body: "> snap(hh) → 478", serif: false },
        { pre: "agent", body: "…per 7 U.S.C. § 2017(a) ✓", serif: false },
      ].map(({ pre, body, serif }, i) => (
        <g key={pre} opacity={O()}>
          <In a={T.down.rows[i]} />
          <text style={MONO(9, MUTED)} x={M_X} y={368 + i * 26}>
            {pre}
          </text>
          <text
            style={serif ? { fontFamily: "var(--f-serif)", fontSize: "12.5px", fill: INK } : MONO(10.5)}
            x={M_X + 42}
            y={368 + i * 26}
          >
            {body}
          </text>
          <circle cx={M_X + 34} cy={364 + i * 26} r="1.8" fill={OK} />
        </g>
      ))}
    </g>
  );
}

// the rulebook, as an index row: the sealed module takes its place in a
// shelf of modules that continues past both edges. snap flashes amber as
// it registers, then holds in full ink among its muted neighbours.
const SHELF_AT = 0.858;

const SHELF_ITEMS = [
  "· · ·", "uk 156", "nz 36", "be 90", "us-ca 367", "us-co 362",
  "snap 3 ✓", "us-nc 491", "us-ma 224", "us-fl 123", "us-al 108", "· · ·",
];
const SHELF_Y = 470;
const SHELF_XS = (() => {
  const xs: number[] = [];
  let x = 70;
  for (const t of SHELF_ITEMS) {
    xs.push(x);
    x += t.length * 5.72 + 18;
  }
  return xs;
})();

function RulebookIndex() {
  return (
    <g opacity={O()}>
      <In a={SHELF_AT} />
      {SHELF_ITEMS.map((t, i) => {
        const snap = t.startsWith("snap");
        return (
          <g key={i}>
            <text
              style={MONO(9.5, snap ? INK : MUTED)}
              x={SHELF_XS[i]}
              y={SHELF_Y}
              opacity={snap ? 1 : 0.8}
            >
              {snap ? (
                <>
                  {"snap 3"}
                  <tspan fill={OK}>{" ✓"}</tspan>
                </>
              ) : (
                t
              )}
            </text>
            {snap && !STATIC && (
              <text style={MONO(9.5, WAX)} x={SHELF_XS[i]} y={SHELF_Y} opacity="0">
                {"snap 3 ✓"}
                <Between a={SHELF_AT} b={SHELF_AT + 0.045} />
              </text>
            )}
          </g>
        );
      })}
      <text style={MONO(9.5)} x="1360" y={SHELF_Y} textAnchor="end">
        {"3,323 rules · 59 programs · growing weekly"}
      </text>
    </g>
  );
}

// ── captions & chapter rail ───────────────────────────────────────────

// paper halo so the callout stays legible over the caption underneath
const HALO: React.CSSProperties = {
  paintOrder: "stroke",
  stroke: "var(--color-paper)",
  strokeWidth: 5,
  strokeLinejoin: "round",
};

function RedraftCallout() {
  if (STATIC) return null;
  return (
    <g opacity="0">
      <Between a={0.548} b={0.652} />
      <text style={{ ...MONO(9.5, WAX), ...HALO }} x="710" y="524" textAnchor="middle">
        {"✗ eligibility cites § 2015 — caught by compare · redrafted · re-checked"}
      </text>
    </g>
  );
}

function Captions() {
  if (STATIC) {
    return (
      <g>
        <text className="ill-name" style={{ fontSize: "18px" }} x="710" y="504" textAnchor="middle">
          From published law to a rule you can trust
        </text>
        <text style={MONO(9.5, MUTED)} x="710" y="524" textAnchor="middle">
          {"segment · file · encode node by node · validate each encoding · compose · deliver"}
        </text>
      </g>
    );
  }
  return (
    <g>
      {PHASES.map(({ at, name, sub }, i) => {
        const until = (i < PHASES.length - 1 ? PHASES[i + 1].at : END) - 0.014;
        return (
          <g key={name} opacity="0">
            <Between a={at} b={until} />
            <text className="ill-name" style={{ fontSize: "18px" }} x="710" y="504" textAnchor="middle">
              {name}
            </text>
            <text style={MONO(9.5, MUTED)} x="710" y="524" textAnchor="middle">
              {sub}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Chapters({ onJump, paused, onToggle }: { onJump: (i: number) => void; paused: boolean; onToggle: () => void }) {
  const px = 710 + 92;
  return (
    <g>
      {PHASES.map(({ at, name }, i) => {
        const x = 710 - 60 + i * 24;
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
            <circle cx={x} cy={538} r={9} fill="transparent" />
            <circle stroke={INK} strokeWidth="0.9" cx={x} cy="538" r="3" fill="none" opacity="0.5" />
            <circle cx={x} cy="538" r="3" fill={WAX} opacity="0">
              <In a={at} />
            </circle>
          </g>
        );
      })}
      <g
        role="button"
        tabIndex={0}
        aria-label={paused ? "Play" : "Pause"}
        style={{ cursor: "pointer", outline: "none" }}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle();
        }}
      >
        <title>{paused ? "Play" : "Pause"}</title>
        <circle cx={px} cy={538} r={8} fill="var(--color-paper)" stroke={INK} strokeWidth="0.7" opacity="0.75" />
        {paused ? (
          <path d={`M ${px - 2.2} 534.8 L ${px - 2.2} 541.2 L ${px + 3.4} 538 Z`} fill={INK} opacity="0.8" />
        ) : (
          <>
            <rect x={px - 3} y={534.9} width="2.2" height="6.2" fill={INK} opacity="0.8" />
            <rect x={px + 1} y={534.9} width="2.2" height="6.2" fill={INK} opacity="0.8" />
          </>
        )}
      </g>
    </g>
  );
}

// ── assembly ──────────────────────────────────────────────────────────

export function PosterFrame() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [paused, setPaused] = useState(false);

  const jump = (i: number) => {
    svgRef.current?.setCurrentTime((PHASES[i].at + 0.02) * CYCLE);
  };
  const toggle = () => {
    const svg = svgRef.current;
    if (!svg) return;
    if (paused) svg.unpauseAnimations();
    else svg.pauseAnimations();
    setPaused(!paused);
  };

  return (
    <div className="ill__wrap">
      <svg
        ref={svgRef}
        className="ill"
        viewBox="0 0 1420 568"
        role="img"
        aria-label="From published law to a rule you can trust: the text of 7 U.S.C. § 2017 is segmented into provisions (a), (b), (c); each is filed and fingerprinted in the corpus ledger, where other sources — an amending public law and an interpreting regulation — cross-reference the same lines. Each provision is then encoded into its own rulespec and validated by four gates; one encoding cites the wrong section, is caught by compare, and is redrafted. The three rules compose into a sealed, signed module, quoted downstream on the web, via the API, and by AI agents with citations."
      >
        <text style={{ ...MONO(9.5, MUTED), letterSpacing: "0.28em" }} x="710" y="56" textAnchor="middle" opacity={STATIC ? 1 : 0.9}>
          ONE LAW, ENCODED END TO END
        </text>
        <TheLaw />
        <ColumnHead x={C_X} w={C_W} label={"THE CORPUS — 1,742,391"} at={T.corpusHead} />
        <ColumnHead x={R_X} w={240} label={"RULESPECS — ONE PER PROVISION"} at={T.enc[0].lead} />
        <ColumnHead x={M_X} w={M_W} label={"SNAP — MODULE"} at={T.mod.head} />
        <TheCorpus />
        <EncodeLeaders />
        <SourceFeeds />
        <Rulespecs />
        <TheModule />
        <RulebookIndex />
        <Captions />
        <RedraftCallout />
        {!STATIC && <Chapters onJump={jump} paused={paused} onToggle={toggle} />}
      </svg>
    </div>
  );
}
