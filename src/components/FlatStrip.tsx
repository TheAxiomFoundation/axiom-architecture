// The flat chart: the whole pipeline as five equal stations on one
// strip — intake → corpus → encoding loop → rulespec → graph — then
// the compile seal and the surfaces it powers. Station headers sit
// OUTSIDE the boxes on one eyebrow line; every box is the same size.
// One example — § 2017, "30 per centum", snap_allotment — runs the
// whole way.

import { useCallback, useRef } from "react";

const INK = "var(--color-ink)";
const WAX = "var(--color-accent)";
const OK = "var(--color-success)";
const PAPER_EL = "var(--color-paper-elevated)";

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// the five stations, one geometry
const BOX = { y: 140, w: 200, h: 300 };
const XS = { intake: 34, corpus: 267, loop: 500, spec: 733, graph: 966 };
const MID = BOX.y + BOX.h / 2; // 290 — every inter-station duct rides this line
const EYEBROW_Y = 126;
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

// one uniform station: header OUTSIDE above the box, wax (or green)
// crown bar, same footprint for every stage
function Station({ x, title, bar = WAX, children }: { x: number; title: string; bar?: string; children: React.ReactNode }) {
  return (
    <g>
      <text className="fp-eyebrow" x={x} y={EYEBROW_Y}>{title}</text>
      <g filter="url(#fs-shadow)">
        <rect x={x} y={BOX.y} width={BOX.w} height={BOX.h} rx="8" fill={PAPER_EL} stroke={INK} strokeWidth="1" />
      </g>
      <rect x={x} y={BOX.y} width={BOX.w} height="3" rx="1.5" fill={bar} />
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
  const N = {
    tfp: [XS.graph + 55, 195], inc: [XS.graph + 105, 195], fpl: [XS.graph + 155, 195],
    allot: [XS.graph + 72, 262], elig: [XS.graph + 140, 262], out: [XS.graph + 105, 330],
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
        <Station x={IN} title="the intake">
          <text className="fp-shelflabel" x={IN + 16} y={BOX.y + 22}>{"scraping pipelines"}</text>
          {["eCFR", "USLM", "state codes ×51", "laws-lois"].map((src, i) => (
            <g key={src}>
              <rect className="fp-chip" x={IN + 25} y={BOX.y + 32 + i * 30} width="150" height="24" rx="12" />
              <text className="fp-mono fp-mono--sm" x={IN + 100} y={BOX.y + 47.5 + i * 30} textAnchor="middle">{src}</text>
            </g>
          ))}
          <VDuct x={IN + 100} y0={BOX.y + 152} y1={BOX.y + 174} />
          <text className="fp-shelflabel" x={IN + 16} y={BOX.y + 192}>{"database"}</text>
          {[2, 1, 0].map((i) => (
            <rect key={i} className="fp-card" x={IN + 44 + i * 6} y={BOX.y + 200 + i * 7} width="106" height="32" rx="3" />
          ))}
          <line x1={IN + 64} y1={BOX.y + 226} x2={IN + 134} y2={BOX.y + 226} stroke={INK} strokeWidth="0.6" opacity="0.35" />
          <line x1={IN + 64} y1={BOX.y + 233} x2={IN + 120} y2={BOX.y + 233} stroke={INK} strokeWidth="0.6" opacity="0.35" />
          <text className="fp-cap" x={IN + 16} y={BOX.y + 284}>nothing ever leaves</text>
        </Station>

        {/* ── THE CORPUS ── */}
        <Duct x0={IN + BOX.w + 3} x1={CO - 4} />
        <Station x={CO} title="the corpus">
          <text className="fp-capq" x={CO + 16} y={BOX.y + 22}>the whole law, word for word</text>
          {[0, 1].map((r) =>
            [0, 1, 2, 3, 4, 5].map((c) => (
              <g key={`a${r}${c}`}>
                <rect x={CO + 21 + c * 27} y={BOX.y + 30 + r * 24} width="18" height="19" rx="1.5" fill={PAPER_EL} stroke={INK} strokeWidth="0.55" opacity="0.6" />
                <line x1={CO + 24 + c * 27} y1={BOX.y + 38 + r * 24} x2={CO + 36 + c * 27} y2={BOX.y + 38 + r * 24} stroke={INK} strokeWidth="0.45" opacity="0.35" />
              </g>
            )),
          )}
          <g filter="url(#fs-shadow)">
            <rect x={CO + 8} y={BOX.y + 88} width={BOX.w - 16} height="104" rx="4" fill={PAPER_EL} stroke={WAX} strokeWidth="1.1" />
          </g>
          <text className="fp-mono fp-mono--sm" x={CO + 18} y={BOX.y + 108}>us:statutes/7/2017/a</text>
          <text className="fp-serifsm" x={CO + 18} y={BOX.y + 132}>§ 2017 · Value of allotment</text>
          <text className="fp-serifq" x={CO + 18} y={BOX.y + 158}>
            “…<tspan fill={WAX}>30 per centum</tspan>…”
          </text>
          <line x1={CO + 18} y1={BOX.y + 172} x2={CO + BOX.w - 26} y2={BOX.y + 172} stroke={INK} strokeWidth="0.6" opacity="0.3" />
          {[0, 1].map((r) =>
            [0, 1, 2, 3, 4, 5].map((c) => (
              <g key={`b${r}${c}`}>
                <rect x={CO + 21 + c * 27} y={BOX.y + 202 + r * 24} width="18" height="19" rx="1.5" fill={PAPER_EL} stroke={INK} strokeWidth="0.55" opacity="0.6" />
                <line x1={CO + 24 + c * 27} y1={BOX.y + 210 + r * 24} x2={CO + 36 + c * 27} y2={BOX.y + 210 + r * 24} stroke={INK} strokeWidth="0.45" opacity="0.35" />
              </g>
            )),
          )}
          <text className="fp-mono fp-mono--node" x={CO + BOX.w / 2} y={BOX.y + 262} textAnchor="middle" opacity="0.55">us · states · uk · ca ⋯</text>
          <line x1={CO + 14} y1={BOX.y + 272} x2={CO + BOX.w - 14} y2={BOX.y + 272} stroke={INK} strokeWidth="0.6" opacity="0.25" />
          <text className="fp-mono" x={CO + 16} y={BOX.y + 290}>1,742,391 provisions</text>
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
        <Station x={EN} title="the encoding loop">
          {[2, 1, 0].map((i) => (
            <rect key={i} className="fp-card" x={EN + 25 - i * 5} y={BOX.y + 24 + i * 6} width="150" height="84" rx="6" />
          ))}
          <rect x={EN + 25} y={BOX.y + 24} width="150" height="3" rx="1.5" fill={WAX} />
          <text className="fp-station" x={EN + 100} y={BOX.y + 48} textAnchor="middle">encoders</text>
          <text className="fp-serifq" x={EN + 100} y={BOX.y + 74} textAnchor="middle">“30 per centum”</text>
          <text className="fp-mono" x={EN + 100} y={BOX.y + 96} textAnchor="middle" fill={WAX}>→ 0.30</text>
          {REDUCED ? (
            <text className="fp-mono fp-mono--tiny" x={EN + 167} y={BOX.y + 102} textAnchor="end" fill={WAX}>rev 42</text>
          ) : (
            [42, 43, 44, 45].map((rev, k) => {
              const a = 0.235 + k * 0.25;
              const times =
                k === 0
                  ? "0;0.234;0.236;0.984;0.986;1"
                  : `0;${(a - 0.25).toFixed(3)};${(a - 0.248).toFixed(3)};${(a - 0.001).toFixed(3)};${(a + 0.001).toFixed(3)};1`;
              const vals = k === 0 ? "1;1;0;0;1;1" : "0;0;1;1;0;0";
              return (
                <text key={rev} className="fp-mono fp-mono--tiny" x={EN + 167} y={BOX.y + 102} textAnchor="end" fill={WAX} opacity={k === 0 ? 1 : 0}>
                  <animate attributeName="opacity" dur="28s" repeatCount="indefinite" values={vals} keyTimes={times} />
                  {`rev ${rev}`}
                </text>
              );
            })
          )}
          <VDuct x={EN + 100} y0={BOX.y + 114} y1={BOX.y + 134} />
          <text className="fp-level" x={EN + 100} y={BOX.y + 152} textAnchor="middle">validators</text>
          {gates.map((g, i) => {
            const y = BOX.y + 160 + i * 32;
            return (
              <g key={g}>
                <rect className="fp-gatechip" x={EN + 40} y={y} width="120" height="25" rx="12.5" />
                <text className="fp-gatetext" x={EN + 56} y={y + 16.5}>
                  {"✓ "}
                  <tspan className="fp-gatename">{g}</tspan>
                </text>
              </g>
            );
          })}
          <text className="fp-mono fp-mono--node" x={EN + 100} y={BOX.y + 268} textAnchor="middle" opacity="0.65">50+ checks · 7.7M runs</text>
          {/* caught drafts ride back up the left margin */}
          <path
            d={`M ${EN + 32} ${BOX.y + 240} C ${EN + 12} ${BOX.y + 210}, ${EN + 12} ${BOX.y + 120}, ${EN + 38} ${BOX.y + 84}`}
            fill="none" stroke={WAX} strokeWidth="1.1" strokeDasharray="4 4"
          >
            {!REDUCED && <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.3s" repeatCount="indefinite" />}
          </path>
          <path d={`M ${EN + 33} ${BOX.y + 91} L ${EN + 40} ${BOX.y + 82} L ${EN + 43.5} ${BOX.y + 92.5}`} fill="none" stroke={WAX} strokeWidth="1.1" />
          <text className="fp-mono fp-mono--wax" x={EN + 100} y={BOX.y + 288} textAnchor="middle">✗ caught → redrafted</text>
        </Station>
        <text className="fp-capq" x={EN + 100} y={BOX.y + BOX.h + 18} textAnchor="middle">every catch teaches the encoder</text>

        {/* ── RULESPEC ── */}
        <Duct x0={EN + BOX.w + 3} x1={SP - 4} />
        <Station x={SP} title="rulespec" bar={OK}>
          <text className="fp-mono fp-mono--sm" x={SP + 18} y={BOX.y + 28}>
            <tspan fill={WAX}>¶</tspan> rulespec-us
          </text>
          <text className="fp-specname" x={SP + 18} y={BOX.y + 52}>snap_allotment</text>
          <line x1={SP + 18} y1={BOX.y + 64} x2={SP + BOX.w - 18} y2={BOX.y + 64} stroke={INK} strokeWidth="0.6" opacity="0.25" />
          <text className="fp-mono fp-mono--sm" x={SP + 18} y={BOX.y + 86}><tspan className="fp-key">imports:</tspan></text>
          <text className="fp-mono fp-mono--sm" x={SP + 30} y={BOX.y + 102}>us:statutes/7/2017/a</text>
          <text className="fp-mono fp-mono--sm" x={SP + 18} y={BOX.y + 124}><tspan className="fp-key">entity:</tspan> Household · Month</text>
          <text className="fp-mono fp-mono--sm" x={SP + 18} y={BOX.y + 158}>max(0, tfp −</text>
          <text className="fp-mono fp-mono--sm" x={SP + 30} y={BOX.y + 174}><tspan fill={WAX}>0.30</tspan> × net)</text>
          <text className="fp-mono fp-mono--tiny" x={SP + 18} y={BOX.y + 198}>0.30 ← “30 per centum”</text>
          <line x1={SP + 14} y1={BOX.y + 272} x2={SP + BOX.w - 14} y2={BOX.y + 272} stroke={INK} strokeWidth="0.6" opacity="0.25" />
          <text className="fp-mono" x={SP + 16} y={BOX.y + 290} opacity="0.75">3,323 rules</text>
        </Station>

        {/* ── GRAPH ── */}
        <Duct x0={SP + BOX.w + 3} x1={XS.graph - 4} />
        <Station x={XS.graph} title="the graph">
          <text className="fp-capq" x={XS.graph + 16} y={BOX.y + 22}>the spec becomes a node</text>
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
          <text className="fp-mono fp-mono--node" x={XS.graph + BOX.w / 2} y={BOX.y + 250} textAnchor="middle" opacity="0.55">typed · cited · executable</text>
        </Station>

        {/* ── COMPILE ── */}
        <Duct x0={XS.graph + BOX.w + 3} x1={SEAL.x - 27} />
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
