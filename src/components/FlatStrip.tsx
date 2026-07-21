// The flat chart, one-row variant: the whole pipeline on a single strip.
// Kept alongside the three-row variant for comparison.
//
//   THE INTAKE → THE CORPUS → THE ENCODING LOOP → RULESPEC → GRAPH →
//   COMPILE → the products. One example — § 2017, "30 per centum",
//   snap_allotment, SNAP · US · 2026 — runs the whole way.

import { useCallback, useRef } from "react";

const INK = "var(--color-ink)";
const WAX = "var(--color-accent)";
const OK = "var(--color-success)";
const PAPER_EL = "var(--color-paper-elevated)";

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const MID = 290;

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

function Eyebrow({ x, t, y = 178 }: { x: number; t: string; y?: number }) {
  return (
    <text className="fp-eyebrow" x={x} y={y}>
      {t}
    </text>
  );
}

export function FlatStrip() {
  const IN = { x: 34, y: 128, w: 168, h: 306 };
  const CO = { x: 235, y: 104, w: 182, h: 338 };
  const EN = { fleet: 464, rail: 606 };
  const SPEC = { x: 771, y: 212, w: 186, h: 150 };
  const SEAL = { x: 1246, y: MID };
  const gates = ["deterministic", "oracles", "AI judge"];
  const cats: Array<[string, string]> = [
    ["AI labs", "FinBot"],
    ["government", "Dashboard"],
    ["builders", "API · ⋯"],
  ];
  const N = {
    tfp: [1026, 238], inc: [1022, 290], fpl: [1026, 342],
    allot: [1088, 262], elig: [1086, 318], out: [1160, 290],
  } as const;
  const NL = { tfp: "tfp", inc: "income", fpl: "fpl", allot: "snap_allotment", elig: "elig", out: "benefit" } as const;
  const HW = { tfp: 20, inc: 20, fpl: 20, allot: 40, elig: 20, out: 20 } as const;
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

  return (
    <div className="lsk__wrap fpwrap" ref={wrapRef}>
      <button type="button" className="fpwrap__fs" onClick={fullscreen} aria-label="full screen">
        ⛶
      </button>
      <svg
        className="lsk"
        viewBox="0 100 1420 404"
        role="img"
        aria-label="The Axiom pipeline on one strip: the intake fills the database and the corpus — the whole law, word for word, § 2017 pulled forward — and single provisions feed the encoding loop, whose validators catch and teach the encoders. The RuleSpec snap_allotment plugs into the rules graph, compiles into the sealed SNAP US 2026 program, and powers FinBot, Dashboard, and APIs."
      >
        {/* THE INTAKE */}
        <g filter="url(#fs-shadow)">
          <rect x={IN.x} y={IN.y} width={IN.w} height={IN.h} rx="8" fill={PAPER_EL} stroke={INK} strokeWidth="1" />
        </g>
        <rect x={IN.x} y={IN.y} width={IN.w} height="3" rx="1.5" fill={WAX} />
        <text className="fp-grouphead" x={IN.x + 14} y={IN.y + 26}>the intake</text>
        <text className="fp-shelflabel" x={IN.x + 14} y={IN.y + 50}>{"scraping pipelines"}</text>
        {["eCFR", "USLM", "state codes ×51", "laws-lois"].map((src, i) => (
          <g key={src}>
            <rect className="fp-chip" x={IN.x + 14} y={IN.y + 60 + i * 30} width="140" height="24" rx="12" />
            <text className="fp-mono fp-mono--sm" x={IN.x + 84} y={IN.y + 75.5 + i * 30} textAnchor="middle">{src}</text>
          </g>
        ))}
        <VDuct x={IN.x + 46} y0={IN.y + 186} y1={IN.y + 210} />
        <text className="fp-shelflabel" x={IN.x + 14} y={IN.y + 228}>{"database"}</text>
        {[2, 1, 0].map((i) => (
          <rect key={i} className="fp-card" x={IN.x + 16 + i * 6} y={IN.y + 238 + i * 7} width="106" height="32" rx="3" />
        ))}
        <line x1={IN.x + 36} y1={IN.y + 264} x2={IN.x + 106} y2={IN.y + 264} stroke={INK} strokeWidth="0.6" opacity="0.35" />
        <line x1={IN.x + 36} y1={IN.y + 271} x2={IN.x + 92} y2={IN.y + 271} stroke={INK} strokeWidth="0.6" opacity="0.35" />
        <text className="fp-cap" x={IN.x + 14} y={IN.y + 296}>nothing ever leaves</text>

        {/* THE CORPUS */}
        <Duct x0={IN.x + IN.w + 2} x1={CO.x - 4} y={262} />
        <g filter="url(#fs-shadow)">
          <rect x={CO.x} y={CO.y} width={CO.w} height={CO.h} rx="8" fill="var(--color-paper)" stroke={INK} strokeWidth="1.2" />
        </g>
        <rect x={CO.x} y={CO.y} width={CO.w} height="3" rx="1.5" fill={WAX} />
        <text className="fp-grouphead" x={CO.x + 14} y={CO.y + 26}>the corpus</text>
        <text className="fp-capq" x={CO.x + 14} y={CO.y + 44}>the whole law, word for word</text>
        {[0, 1].map((r) =>
          [0, 1, 2, 3, 4, 5].map((c) => (
            <g key={`a${r}${c}`}>
              <rect x={CO.x + 16 + c * 26} y={CO.y + 58 + r * 26} width="17" height="20" rx="1.5" fill={PAPER_EL} stroke={INK} strokeWidth="0.55" opacity="0.6" />
              <line x1={CO.x + 19 + c * 26} y1={CO.y + 66 + r * 26} x2={CO.x + 30 + c * 26} y2={CO.y + 66 + r * 26} stroke={INK} strokeWidth="0.45" opacity="0.35" />
            </g>
          )),
        )}
        <g filter="url(#fs-shadow)">
          <rect x={CO.x + 8} y={CO.y + 112} width={CO.w - 16} height="92" rx="4" fill={PAPER_EL} stroke={WAX} strokeWidth="1.1" />
        </g>
        <text className="fp-mono fp-mono--sm" x={CO.x + 18} y={CO.y + 132}>us:statutes/7/2017/a</text>
        <text className="fp-serifsm" x={CO.x + 18} y={CO.y + 154}>§ 2017 · Value of allotment</text>
        <text className="fp-serifq" x={CO.x + 18} y={CO.y + 178}>
          “…<tspan fill={WAX}>30 per centum</tspan>…”
        </text>
        <line x1={CO.x + 18} y1={CO.y + 190} x2={CO.x + CO.w - 26} y2={CO.y + 190} stroke={INK} strokeWidth="0.6" opacity="0.3" />
        {[0, 1].map((r) =>
          [0, 1, 2, 3, 4, 5].map((c) => (
            <g key={`b${r}${c}`}>
              <rect x={CO.x + 16 + c * 26} y={CO.y + 216 + r * 26} width="17" height="20" rx="1.5" fill={PAPER_EL} stroke={INK} strokeWidth="0.55" opacity="0.6" />
              <line x1={CO.x + 19 + c * 26} y1={CO.y + 224 + r * 26} x2={CO.x + 30 + c * 26} y2={CO.y + 224 + r * 26} stroke={INK} strokeWidth="0.45" opacity="0.35" />
            </g>
          )),
        )}
        <text className="fp-mono fp-mono--node" x={CO.x + CO.w / 2} y={CO.y + 282} textAnchor="middle" opacity="0.55">us · states · uk · ca ⋯</text>
        <line x1={CO.x + 14} y1={CO.y + 296} x2={CO.x + CO.w - 14} y2={CO.y + 296} stroke={INK} strokeWidth="0.6" opacity="0.25" />
        <text className="fp-mono" x={CO.x + 14} y={CO.y + 320}>1,742,391 provisions</text>

        {/* the feed: one provision leaves the § entry */}
        <line x1={CO.x + CO.w - 8} y1={250} x2={CO.x + CO.w} y2={250} stroke={INK} strokeWidth="1" opacity="0.45" />
        <Duct x0={CO.x + CO.w} x1={EN.fleet - 8} y={250} />
        <g filter="url(#fs-shadow)">
          <rect x={(CO.x + CO.w + EN.fleet) / 2 - 13} y={238} width="19" height="25" rx="2" fill="var(--color-paper)" stroke={INK} strokeWidth="0.8" />
        </g>
        <text className="fp-mono fp-mono--node" x={(CO.x + CO.w + EN.fleet) / 2 - 3.5} y={252} textAnchor="middle" fill={WAX}>§</text>
        <text
          className="fp-mono fp-mono--tiny"
          transform="rotate(-90 434 360)"
          x={434} y={360} textAnchor="middle" opacity="0.6"
        >
          one provision at a time
        </text>

        {/* THE ENCODING LOOP */}
        <Eyebrow x={EN.fleet - 12} t="the encoding loop" y={158} />
        <rect x={EN.fleet - 14} y={168} width={EN.rail + 132 - (EN.fleet - 14)} height={298} rx="12" fill="rgba(28,25,23,0.018)" stroke={INK} strokeWidth="0.6" opacity="0.5" />
        {[2, 1, 0].map((i) => (
          <rect key={i} className="fp-card" x={EN.fleet + 8 - i * 5} y={218 + i * 6} width="112" height="112" rx="6" />
        ))}
        <rect x={EN.fleet + 8} y={218} width="112" height="3" rx="1.5" fill={WAX} />
        {REDUCED ? (
          <text className="fp-mono fp-mono--sm" x={EN.fleet + 108} y={237} textAnchor="end" fill={WAX}>rev 42</text>
        ) : (
          [42, 43, 44, 45].map((rev, k) => {
            const a = 0.235 + k * 0.25;
            const times =
              k === 0
                ? "0;0.234;0.236;0.984;0.986;1"
                : `0;${(a - 0.25).toFixed(3)};${(a - 0.248).toFixed(3)};${(a - 0.001).toFixed(3)};${(a + 0.001).toFixed(3)};1`;
            const vals = k === 0 ? "1;1;0;0;1;1" : "0;0;1;1;0;0";
            return (
              <text key={rev} className="fp-mono fp-mono--sm" x={EN.fleet + 108} y={237} textAnchor="end" fill={WAX} opacity={k === 0 ? 1 : 0}>
                <animate attributeName="opacity" dur="28s" repeatCount="indefinite" values={vals} keyTimes={times} />
                {`rev ${rev}`}
              </text>
            );
          })
        )}
        <text className="fp-station" x={EN.fleet + 64} y={258} textAnchor="middle">encoders</text>
        <text className="fp-serifq" x={EN.fleet + 64} y={284} textAnchor="middle">“30 per centum”</text>
        <path d={`M ${EN.fleet + 64} ${292} L ${EN.fleet + 64} ${304} M ${EN.fleet + 60.5} ${300} L ${EN.fleet + 64} ${305} L ${EN.fleet + 67.5} ${300}`} fill="none" stroke={INK} strokeWidth="0.9" opacity="0.5" />
        <text className="fp-mono" x={EN.fleet + 64} y={322} textAnchor="middle" fill={WAX}>0.30</text>
        {!REDUCED && (
          <>
            <rect x={EN.fleet + 8} y={218} width="112" height="3" rx="1.5" fill={WAX} opacity="0">
              <animate attributeName="opacity" dur="7s" repeatCount="indefinite" values="0;0;1;0;0" keyTimes="0;0.94;0.96;0.995;1" />
            </rect>
            <g opacity="0">
              <animate attributeName="opacity" dur="7s" repeatCount="indefinite" values="0;0;1;1;0" keyTimes="0;0.94;0.955;0.99;1" />
              <rect x={EN.fleet + 26} y={192} width="76" height="20" rx="10" fill={PAPER_EL} stroke={WAX} strokeWidth="1" />
              <text className="fp-mono fp-mono--sm" x={EN.fleet + 64} y={205.5} textAnchor="middle" fill={WAX}>↑ improved</text>
            </g>
          </>
        )}
        <rect x={EN.rail} y={178} width="118" height="216" rx="10" fill="rgba(28,25,23,0.028)" stroke={INK} strokeWidth="0.7" opacity="0.9" />
        <text className="fp-level" x={EN.rail + 59} y={198} textAnchor="middle">validators</text>
        {gates.map((g, i) => {
          const y = 210 + i * 56;
          return (
            <g key={g}>
              <rect className="fp-gatechip" x={EN.rail + 10} y={y} width="98" height="28" rx="14" />
              <text className="fp-gatetext" x={EN.rail + 22} y={y + 18}>
                {"✓ "}
                <tspan className="fp-gatename">{g}</tspan>
              </text>
              {i < gates.length - 1 && (
                <line x1={EN.rail + 59} y1={y + 28} x2={EN.rail + 59} y2={y + 56} stroke={INK} strokeWidth="0.8" opacity="0.4" />
              )}
            </g>
          );
        })}
        <text className="fp-mono fp-mono--node" x={EN.rail + 59} y={374} textAnchor="middle" opacity="0.65">50+ checks · 7.7M runs</text>
        <Duct x0={EN.fleet + 124} x1={EN.rail - 2} />
        <path
          id="fs-loop"
          d={`M ${EN.rail + 59} ${396} C ${EN.rail + 59} ${434}, ${EN.fleet + 68} ${434}, ${EN.fleet + 64} ${338}`}
          fill="none" stroke={WAX} strokeWidth="1.1" strokeDasharray="4 4"
        >
          {!REDUCED && <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.3s" repeatCount="indefinite" />}
        </path>
        <path d={`M ${EN.fleet + 59.5} ${346} L ${EN.fleet + 64} ${336} L ${EN.fleet + 69} ${345}`} fill="none" stroke={WAX} strokeWidth="1.1" />
        <text className="fp-mono fp-mono--wax" x={(EN.fleet + EN.rail + 118) / 2} y={442} textAnchor="middle">✗ caught → redrafted</text>
        <text className="fp-capq" x={(EN.fleet + EN.rail + 118) / 2} y={458} textAnchor="middle">every catch teaches the encoder</text>

        {/* RULESPEC */}
        <Duct x0={EN.rail + 120} x1={SPEC.x - 8} />
        <Eyebrow x={SPEC.x} t="rulespec" />
        <g filter="url(#fs-shadow)">
          <rect x={SPEC.x} y={SPEC.y} width={SPEC.w} height={SPEC.h} rx="4" fill={PAPER_EL} stroke={INK} strokeWidth="1" />
        </g>
        <rect x={SPEC.x} y={SPEC.y} width={SPEC.w} height="3" rx="1.5" fill={OK} />
        <text className="fp-mono fp-mono--sm" x={SPEC.x + 12} y={SPEC.y + 22}>
          <tspan fill={WAX}>¶</tspan> rulespec-us
        </text>
        <text className="fp-specname" x={SPEC.x + 12} y={SPEC.y + 42}>snap_allotment</text>
        <text className="fp-mono fp-mono--sm" x={SPEC.x + 12} y={SPEC.y + 62}><tspan className="fp-key">imports:</tspan> us:statutes/7/2017/a</text>
        <text className="fp-mono fp-mono--sm" x={SPEC.x + 12} y={SPEC.y + 78}><tspan className="fp-key">entity:</tspan> Household · Month</text>
        <text className="fp-mono fp-mono--sm" x={SPEC.x + 12} y={SPEC.y + 102}>
          max(0, tfp − <tspan fill={WAX}>0.30</tspan> × net)
        </text>
        <text className="fp-mono fp-mono--tiny" x={SPEC.x + 12} y={SPEC.y + 120}>0.30 ← “30 per centum”</text>
        <text className="fp-mono fp-mono--tiny" x={SPEC.x + 12} y={SPEC.y + 138} opacity="0.6">3,323 rules</text>

        {/* GRAPH */}
        <Eyebrow x={1002} t="graph" />
        <rect x={990} y={204} width={202} height={164} rx="12" fill="rgba(28,25,23,0.018)" stroke={INK} strokeWidth="0.6" opacity="0.5" />
        <path
          d={`M ${SPEC.x + SPEC.w + 4} ${240} C ${SPEC.x + SPEC.w + 40} ${210}, ${1076} ${204}, ${1088} ${246}`}
          fill="none" stroke={INK} strokeWidth="1" opacity="0.45"
        />
        <path d={`M ${1084} ${241.5} L ${1088} ${248} L ${1092} ${241}`} fill="none" stroke={INK} strokeWidth="1" opacity="0.45" />
        {!REDUCED && (
          <path
            d={`M ${SPEC.x + SPEC.w + 4} ${240} C ${SPEC.x + SPEC.w + 40} ${210}, ${1076} ${204}, ${1088} ${246}`}
            fill="none" stroke={WAX} strokeWidth="1.2" strokeDasharray="2 9" opacity="0.8"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="-11" dur="1.6s" repeatCount="indefinite" />
          </path>
        )}
        {edges.map(([f, t]) => (
          <line
            key={`${f}${t}`}
            x1={N[f][0] + HW[f]} y1={N[f][1]} x2={N[t][0] - HW[t]} y2={N[t][1]}
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

        {/* COMPILE */}
        <Duct x0={N.out[0] + 24} x1={SEAL.x - 27} />
        <Eyebrow x={SEAL.x - 40} t="compile" />
        <circle cx={SEAL.x} cy={SEAL.y} r="21" fill="rgba(146,64,14,0.12)" stroke={WAX} strokeWidth="1.5" />
        <circle cx={SEAL.x} cy={SEAL.y} r="15.5" fill="none" stroke={WAX} strokeWidth="0.7" />
        <text className="fp-sealtick" x={SEAL.x} y={SEAL.y + 5} textAnchor="middle">✓</text>
        <text className="fp-mono fp-mono--sm" x={SEAL.x} y={SEAL.y + 42} textAnchor="middle">SNAP · US · 2026</text>
        <text className="fp-mono fp-mono--tiny" x={SEAL.x} y={SEAL.y + 58} textAnchor="middle" opacity="0.6">certified · signed</text>

        {/* WHO IT POWERS */}
        {cats.map(([cat, product], i) => {
          const y = 200 + i * 60;
          return (
            <g key={cat}>
              <path
                d={`M ${SEAL.x + 21} ${MID} C ${SEAL.x + 46} ${MID}, ${SEAL.x + 40} ${y + 22}, ${1298} ${y + 22}`}
                fill="none" stroke={INK} strokeWidth="0.8" opacity="0.45"
              />
              <g filter="url(#fs-shadow)">
                <rect x={1302} y={y} width="88" height="44" rx="4" fill={PAPER_EL} stroke={INK} strokeWidth="0.8" opacity="0.95" />
              </g>
              <rect x={1302} y={y} width="88" height="2.5" rx="1" fill={WAX} />
              <text className="fp-mono" x={1312} y={y + 20}>{product}</text>
              <text className="fp-mono fp-mono--tiny" x={1312} y={y + 34} opacity="0.6">— {cat}</text>
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
