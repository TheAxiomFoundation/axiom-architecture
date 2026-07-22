// The flat chart: the whole pipeline as five equal stations on one
// strip — intake → corpus → encoding loop → rulespec → graph — then
// the compile seal and the surfaces it powers.
//
// The stations share one internal system: header OUTSIDE on a common
// eyebrow line, an italic sub-caption at the top of the box, content
// in the middle band, and a footer rule + one stat line at the same
// height in every box. One example — § 2017, "30 per centum",
// snap_allotment — runs the whole way.

import { useCallback, useRef } from "react";

const INK = "var(--color-ink)";
const WAX = "var(--color-accent)";
const OK = "var(--color-success)";
const PAPER_EL = "var(--color-paper-elevated)";

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// the five stations, one geometry and one internal rhythm
const BOX = { y: 140, w: 200, h: 300 };
const XS = { intake: 34, corpus: 267, loop: 500, spec: 733, graph: 966 };
const B = BOX.y;
const MID = BOX.y + BOX.h / 2; // 290 — every inter-station duct rides this line
const EYEBROW_Y = 126;
const SUB_Y = B + 22; // the italic sub-caption line
const FOOT_RULE_Y = B + 262; // the footer rule…
const FOOT_Y = B + 284; // …and the stat line under it
const SEAL = { x: 1216, y: MID };

function Duct({ x0, x1, y = MID }: { x0: number; x1: number; y?: number }) {
  return (
    <g>
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={INK} strokeWidth="1" opacity="0.45" />
      <path d={`M ${x1 - 5} ${y - 3.5} L ${x1} ${y} L ${x1 - 5} ${y + 3.5}`} fill="none" stroke={INK} strokeWidth="1" opacity="0.45" />
      {!REDUCED && (
        <line x1={x0} y1={y} x2={x1} y2={y} stroke={WAX} strokeWidth="1.2" strokeDasharray="2 9" opacity="0.8">
          <animate attributeName="stroke-dashoffset" from="0" to="-11" dur="1.6s" repeatCount="indefinite" />
        </line>
      )}
    </g>
  );
}

function VDuct({ x, y0, y1 }: { x: number; y0: number; y1: number }) {
  return (
    <g>
      <line x1={x} y1={y0} x2={x} y2={y1} stroke={INK} strokeWidth="1" opacity="0.45" />
      <path d={`M ${x - 3.5} ${y1 - 5} L ${x} ${y1} L ${x + 3.5} ${y1 - 5}`} fill="none" stroke={INK} strokeWidth="1" opacity="0.45" />
      {!REDUCED && (
        <line x1={x} y1={y0} x2={x} y2={y1} stroke={WAX} strokeWidth="1.2" strokeDasharray="2 9" opacity="0.8">
          <animate attributeName="stroke-dashoffset" from="0" to="-11" dur="1.6s" repeatCount="indefinite" />
        </line>
      )}
    </g>
  );
}

function Station({ x, title, sub, bar = WAX, children }: { x: number; title: string; sub: string; bar?: string; children: React.ReactNode }) {
  return (
    <g>
      <text className="fp-eyebrow" x={x} y={EYEBROW_Y}>{title}</text>
      <g filter="url(#fs-shadow)">
        <rect x={x} y={BOX.y} width={BOX.w} height={BOX.h} rx="8" fill={PAPER_EL} stroke={INK} strokeWidth="1" />
      </g>
      <rect x={x} y={BOX.y} width={BOX.w} height="3" rx="1.5" fill={bar} />
      <text className="fp-capq" x={x + 16} y={SUB_Y}>{sub}</text>
      {children}
    </g>
  );
}

// the shared footer: a hairline rule and one line of fact
function Foot({ x, children }: { x: number; children: React.ReactNode }) {
  return (
    <g>
      <line x1={x + 16} y1={FOOT_RULE_Y} x2={x + BOX.w - 16} y2={FOOT_RULE_Y} stroke={INK} strokeWidth="0.6" opacity="0.25" />
      {children}
    </g>
  );
}

export function FlatStrip() {
  const gates = ["deterministic", "oracles", "AI judge"];
  const cats: Array<[string, string]> = [
    ["AI labs", "FinBot"],
    ["government", "Dashboard"],
    ["builders", "API · ⋯"],
  ];
  // the graph station: a small vertical DAG — inputs, rules, output
  const G = XS.graph;
  const N = {
    tfp: [G + 55, B + 64], inc: [G + 105, B + 64], fpl: [G + 155, B + 64],
    allot: [G + 72, B + 128], elig: [G + 140, B + 128], out: [G + 105, B + 192],
  } as const;
  const NL = { tfp: "tfp", inc: "income", fpl: "fpl", allot: "snap_allotment", elig: "elig", out: "benefit" } as const;
  const HW = { tfp: 20, inc: 22, fpl: 20, allot: 40, elig: 20, out: 24 } as const;
  const lit = new Set(["tfp", "inc", "allot", "out"]);
  const edges: Array<[keyof typeof N, keyof typeof N]> = [
    ["tfp", "allot"], ["inc", "allot"], ["inc", "elig"], ["fpl", "elig"],
    ["allot", "out"], ["elig", "out"],
  ];

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const fullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void wrapRef.current?.requestFullscreen();
  }, []);

  const IN = XS.intake;
  const CO = XS.corpus;
  const EN = XS.loop;
  const SP = XS.spec;

  return (
    <div className="lsk__wrap fpwrap" ref={wrapRef}>
      <button type="button" className="fpwrap__fs" onClick={fullscreen} aria-label="full screen">
        ⛶
      </button>
      <svg
        className="lsk"
        viewBox="0 96 1420 368"
        role="img"
        aria-label="The Axiom pipeline as five equal stations. The intake: scraping pipelines (eCFR, USLM, state codes, laws-lois) fill the database — nothing ever leaves. The corpus: the whole law word for word, 1,742,391 provisions, § 2017 pulled forward. One provision at a time feeds the encoding loop, where encoders draft (30 per centum becomes 0.30) and validators — deterministic checks, oracles, AI judge — catch and teach across 7.7M runs. The RuleSpec snap_allotment plugs into the rules graph — tfp and income feed it, benefit flows out — which compiles into the sealed SNAP US 2026 program, powering FinBot, Dashboard, and APIs."
      >
        {/* ── THE INTAKE ── */}
        <Station x={IN} title="the intake" sub="hundreds of official sources">
          <text className="fp-shelflabel" x={IN + 16} y={B + 46}>{"scraping pipelines"}</text>
          {["eCFR", "USLM", "state codes ×51", "laws-lois"].map((src, i) => (
            <g key={src}>
              <rect className="fp-chip" x={IN + 24} y={B + 56 + i * 29} width="152" height="23" rx="11.5" />
              <text className="fp-mono fp-mono--sm" x={IN + 100} y={B + 71.5 + i * 29} textAnchor="middle">{src}</text>
            </g>
          ))}
          <VDuct x={IN + 100} y0={B + 172} y1={B + 190} />
          <text className="fp-shelflabel" x={IN + 16} y={B + 204}>{"database"}</text>
          {[2, 1, 0].map((i) => (
            <rect key={i} className="fp-card" x={IN + 42 + i * 6} y={B + 210 + i * 6} width="106" height="30" rx="3" />
          ))}
          <line x1={IN + 62} y1={B + 234} x2={IN + 132} y2={B + 234} stroke={INK} strokeWidth="0.6" opacity="0.35" />
          <line x1={IN + 62} y1={B + 241} x2={IN + 118} y2={B + 241} stroke={INK} strokeWidth="0.6" opacity="0.35" />
          <Foot x={IN}>
            <text className="fp-cap" x={IN + 16} y={FOOT_Y}>nothing ever leaves</text>
          </Foot>
        </Station>

        {/* ── THE CORPUS ── */}
        <Duct x0={IN + BOX.w + 3} x1={CO - 4} />
        <Station x={CO} title="the corpus" sub="the whole law, word for word">
          {[0, 1].map((r) =>
            [0, 1, 2, 3, 4, 5].map((c) => (
              <g key={`a${r}${c}`}>
                <rect x={CO + 21 + c * 27} y={B + 36 + r * 24} width="18" height="19" rx="1.5" fill={PAPER_EL} stroke={INK} strokeWidth="0.55" opacity="0.6" />
                <line x1={CO + 24 + c * 27} y1={B + 44 + r * 24} x2={CO + 36 + c * 27} y2={B + 44 + r * 24} stroke={INK} strokeWidth="0.45" opacity="0.35" />
              </g>
            )),
          )}
          <g filter="url(#fs-shadow)">
            <rect x={CO + 16} y={B + 92} width={BOX.w - 32} height="100" rx="4" fill={PAPER_EL} stroke={WAX} strokeWidth="1.1" />
          </g>
          <text className="fp-mono fp-mono--tiny" x={CO + 26} y={B + 110}>us:statutes/7/2017/a</text>
          <text className="fp-serifsm" x={CO + 26} y={B + 134}>§ 2017 · Value of allotment</text>
          <line x1={CO + 26} y1={B + 146} x2={CO + BOX.w - 42} y2={B + 146} stroke={INK} strokeWidth="0.6" opacity="0.3" />
          <text className="fp-serifq" x={CO + 26} y={B + 170}>
            “…<tspan fill={WAX}>30 per centum</tspan>…”
          </text>
          {[0, 1].map((r) =>
            [0, 1, 2, 3, 4, 5].map((c) => (
              <g key={`b${r}${c}`}>
                <rect x={CO + 21 + c * 27} y={B + 204 + r * 24} width="18" height="19" rx="1.5" fill={PAPER_EL} stroke={INK} strokeWidth="0.55" opacity="0.6" />
                <line x1={CO + 24 + c * 27} y1={B + 212 + r * 24} x2={CO + 36 + c * 27} y2={B + 212 + r * 24} stroke={INK} strokeWidth="0.45" opacity="0.35" />
              </g>
            )),
          )}
          <Foot x={CO}>
            <text className="fp-mono" x={CO + 16} y={FOOT_Y}>1,742,391 provisions</text>
          </Foot>
        </Station>

        {/* the feed: one provision leaves the § entry */}
        <Duct x0={CO + BOX.w} x1={EN - 4} />
        <g filter="url(#fs-shadow)">
          <rect x={(CO + BOX.w + EN) / 2 - 10} y={MID - 13} width="19" height="25" rx="2" fill="var(--color-paper)" stroke={INK} strokeWidth="0.8" />
        </g>
        <text className="fp-mono fp-mono--node" x={(CO + BOX.w + EN) / 2 - 0.5} y={MID + 1} textAnchor="middle" fill={WAX}>§</text>
        <text
          className="fp-mono fp-mono--tiny"
          transform={`rotate(-90 ${(CO + BOX.w + EN) / 2 - 0.5} 380)`}
          x={(CO + BOX.w + EN) / 2 - 0.5} y={380} textAnchor="middle" opacity="0.6"
        >
          one provision at a time
        </text>

        {/* ── THE ENCODING LOOP ── */}
        <Station x={EN} title="the encoding loop" sub="drafted, checked, redrafted">
          {[2, 1, 0].map((i) => (
            <rect key={i} className="fp-card" x={EN + 24 + i * 5} y={B + 36 + i * 5} width="152" height="76" rx="6" />
          ))}
          <rect x={EN + 24} y={B + 36} width="152" height="3" rx="1.5" fill={WAX} />
          <text className="fp-station" x={EN + 100} y={B + 58} textAnchor="middle">encoders</text>
          <text className="fp-serifq" x={EN + 100} y={B + 82} textAnchor="middle">“30 per centum”</text>
          <text className="fp-mono" x={EN + 100} y={B + 103} textAnchor="middle" fill={WAX}>→ 0.30</text>
          {REDUCED ? (
            <text className="fp-mono fp-mono--tiny" x={EN + 168} y={B + 103} textAnchor="end" fill={WAX}>rev 42</text>
          ) : (
            [42, 43, 44, 45].map((rev, k) => {
              const a = 0.235 + k * 0.25;
              const times =
                k === 0
                  ? "0;0.234;0.236;0.984;0.986;1"
                  : `0;${(a - 0.25).toFixed(3)};${(a - 0.248).toFixed(3)};${(a - 0.001).toFixed(3)};${(a + 0.001).toFixed(3)};1`;
              const vals = k === 0 ? "1;1;0;0;1;1" : "0;0;1;1;0;0";
              return (
                <text key={rev} className="fp-mono fp-mono--tiny" x={EN + 168} y={B + 103} textAnchor="end" fill={WAX} opacity={k === 0 ? 1 : 0}>
                  <animate attributeName="opacity" dur="28s" repeatCount="indefinite" values={vals} keyTimes={times} />
                  {`rev ${rev}`}
                </text>
              );
            })
          )}
          <VDuct x={EN + 100} y0={B + 122} y1={B + 140} />
          <text className="fp-level" x={EN + 100} y={B + 156} textAnchor="middle">validators</text>
          {gates.map((g, i) => {
            const y = B + 164 + i * 31;
            return (
              <g key={g}>
                <rect className="fp-gatechip" x={EN + 38} y={y} width="124" height="24" rx="12" />
                <text className="fp-gatetext" x={EN + 54} y={y + 16}>
                  {"✓ "}
                  <tspan className="fp-gatename">{g}</tspan>
                </text>
              </g>
            );
          })}
          {/* caught drafts ride back up the left margin */}
          <path
            d={`M ${EN + 34} ${B + 240} C ${EN + 12} ${B + 205}, ${EN + 12} ${B + 130}, ${EN + 36} ${B + 94}`}
            fill="none" stroke={WAX} strokeWidth="1.1" strokeDasharray="4 4"
          >
            {!REDUCED && <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.3s" repeatCount="indefinite" />}
          </path>
          <path d={`M ${EN + 29.5} ${B + 101} L ${EN + 37} ${B + 92} L ${EN + 41} ${B + 102.5}`} fill="none" stroke={WAX} strokeWidth="1.1" />
          <Foot x={EN}>
            <text className="fp-mono" x={EN + 16} y={FOOT_Y}>7.7M runs</text>
            <text className="fp-mono fp-mono--tiny" x={EN + BOX.w - 16} y={FOOT_Y} textAnchor="end" opacity="0.5">50+ checks</text>
          </Foot>
        </Station>
        <text x={EN + 100} y={BOX.y + BOX.h + 18} textAnchor="middle">
          <tspan className="fp-mono fp-mono--wax">✗ caught → redrafted</tspan>
          <tspan className="fp-capq" dx="8">every catch teaches the encoder</tspan>
        </text>

        {/* ── RULESPEC ── */}
        <Duct x0={EN + BOX.w + 3} x1={SP - 4} />
        <Station x={SP} title="rulespec" sub="one rule, fully cited" bar={OK}>
          <text className="fp-mono fp-mono--sm" x={SP + 16} y={B + 46}>
            <tspan fill={WAX}>¶</tspan> rulespec-us
          </text>
          <text className="fp-specname" x={SP + 16} y={B + 70}>snap_allotment</text>
          {/* the spec itself, as a code panel */}
          <rect x={SP + 14} y={B + 84} width={BOX.w - 28} height="124" rx="4" fill="rgba(28,25,23,0.03)" />
          <text className="fp-mono fp-mono--sm" x={SP + 24} y={B + 104}><tspan className="fp-key">imports:</tspan></text>
          <text className="fp-mono fp-mono--sm" x={SP + 36} y={B + 120}>us:statutes/7/2017/a</text>
          <text className="fp-mono fp-mono--sm" x={SP + 24} y={B + 142}><tspan className="fp-key">entity:</tspan> Household</text>
          <text className="fp-mono fp-mono--sm" x={SP + 24} y={B + 164}><tspan className="fp-key">formula:</tspan></text>
          <text className="fp-mono fp-mono--sm" x={SP + 36} y={B + 180}>max(0, tfp − <tspan fill={WAX}>0.30</tspan> × net)</text>
          <text className="fp-mono fp-mono--tiny" x={SP + 24} y={B + 198} opacity="0.75">
            <tspan fill={WAX}>0.30</tspan> ← “30 per centum”
          </text>
          <Foot x={SP}>
            <text className="fp-mono" x={SP + 16} y={FOOT_Y}>3,323 rules</text>
            <text className="fp-mono fp-mono--tiny" x={SP + BOX.w - 16} y={FOOT_Y} textAnchor="end" opacity="0.5">open format</text>
          </Foot>
        </Station>

        {/* ── THE GRAPH ── */}
        <Duct x0={SP + BOX.w + 3} x1={G - 4} />
        <Station x={G} title="the graph" sub="the spec becomes a node">
          {edges.map(([f, t]) => (
            <line
              key={`${f}${t}`}
              x1={N[f][0]} y1={N[f][1] + 10} x2={N[t][0]} y2={N[t][1] - 10}
              stroke={lit.has(f) && lit.has(t) ? WAX : INK}
              strokeWidth={lit.has(f) && lit.has(t) ? 1.6 : 0.8}
              opacity={lit.has(f) && lit.has(t) ? 0.9 : 0.4}
            >
              {!REDUCED && lit.has(f) && lit.has(t) && (
                <animate attributeName="opacity" values="0.45;0.95;0.45" dur="3s" repeatCount="indefinite" />
              )}
            </line>
          ))}
          {(Object.keys(N) as Array<keyof typeof N>).map((k) => (
            <g key={k}>
              <rect
                x={N[k][0] - HW[k]} y={N[k][1] - 10} width={HW[k] * 2} height="20" rx="3"
                fill={PAPER_EL} stroke={lit.has(k) ? WAX : INK}
                strokeWidth={lit.has(k) ? 1.3 : 0.8} opacity={lit.has(k) ? 1 : 0.75}
              />
              <rect x={N[k][0] - HW[k]} y={N[k][1] - 10} width={HW[k] * 2} height="2" fill={lit.has(k) ? WAX : "var(--color-rule-strong)"} opacity="0.9" />
              <text className="fp-mono fp-mono--node" x={N[k][0]} y={N[k][1] + 6} textAnchor="middle" opacity={lit.has(k) ? 1 : 0.6}>
                {NL[k]}
              </text>
            </g>
          ))}
          <text className="fp-mono fp-mono--tiny" x={G + 100} y={B + 232} textAnchor="middle" opacity="0.55">
            snap_allotment · one node of 3,323
          </text>
          <Foot x={G}>
            <text className="fp-mono" x={G + 16} y={FOOT_Y}>typed · cited</text>
            <text className="fp-mono fp-mono--tiny" x={G + BOX.w - 16} y={FOOT_Y} textAnchor="end" opacity="0.5">executable</text>
          </Foot>
        </Station>

        {/* ── COMPILE ── */}
        <Duct x0={G + BOX.w + 3} x1={SEAL.x - 27} />
        <text className="fp-eyebrow" x={SEAL.x - 34} y={EYEBROW_Y}>compile</text>
        <circle cx={SEAL.x} cy={SEAL.y} r="21" fill="rgba(146,64,14,0.12)" stroke={WAX} strokeWidth="1.5" />
        <circle cx={SEAL.x} cy={SEAL.y} r="15.5" fill="none" stroke={WAX} strokeWidth="0.7" />
        <text className="fp-sealtick" x={SEAL.x} y={SEAL.y + 5} textAnchor="middle">✓</text>
        <text className="fp-mono fp-mono--sm" x={SEAL.x} y={SEAL.y + 42} textAnchor="middle">SNAP · US · 2026</text>
        <text className="fp-mono fp-mono--tiny" x={SEAL.x} y={SEAL.y + 58} textAnchor="middle" opacity="0.6">certified · signed</text>

        {/* ── THE SURFACES ── */}
        <text className="fp-eyebrow" x="1290" y={EYEBROW_Y}>surfaces</text>
        {cats.map(([cat, product], i) => {
          const y = 196 + i * 62;
          return (
            <g key={cat}>
              <path
                d={`M ${SEAL.x + 21} ${MID} C ${SEAL.x + 46} ${MID}, ${SEAL.x + 40} ${y + 23}, ${1286} ${y + 23}`}
                fill="none" stroke={INK} strokeWidth="0.8" opacity="0.45"
              />
              <g filter="url(#fs-shadow)">
                <rect x="1290" y={y} width="100" height="46" rx="4" fill={PAPER_EL} stroke={INK} strokeWidth="0.8" opacity="0.95" />
              </g>
              <rect x="1290" y={y} width="100" height="2.5" rx="1" fill={WAX} />
              <text className="fp-mono" x="1300" y={y + 21}>{product}</text>
              <text className="fp-mono fp-mono--tiny" x="1300" y={y + 36} opacity="0.6">— {cat}</text>
            </g>
          );
        })}

        <defs>
          <filter id="fs-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1c1917" floodOpacity="0.13" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
