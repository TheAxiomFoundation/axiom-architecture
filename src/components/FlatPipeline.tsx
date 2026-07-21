// The flat chart: the whole Axiom pipeline on one screen, in three rows.
//
//   ROW 1   THE INTAKE → THE CORPUS — pull it, keep every version,
//           store the whole law word for word.
//     ↓     one provision at a time
//   ROW 2   THE ENCODING LOOP ← RULESPEC — the machine drafts and
//           checks; the spec is what leaves it. (Row two reads right
//           to left; the arrows carry the direction.)
//     ↓     the spec plugs into the graph
//   ROW 3   THE GRAPH → COMPILE → the products it powers.
//
// One example — 7 U.S.C. § 2017, "30 per centum", snap_allotment,
// SNAP · US · 2026 — runs through every station.

import { useCallback, useRef } from "react";
import previewFinbot from "../assets/preview-finbot.png";
import previewDashboard from "../assets/preview-dashboard.png";
import previewTerminal from "../assets/preview-terminal.png";

const INK = "var(--color-ink)";
const WAX = "var(--color-accent)";
const OK = "var(--color-success)";
const PAPER_EL = "var(--color-paper-elevated)";

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Duct({ x0, x1, y, rtl = false }: { x0: number; x1: number; y: number; rtl?: boolean }) {
  const xa = Math.min(x0, x1);
  const xb = Math.max(x0, x1);
  return (
    <g>
      <line x1={xa} y1={y} x2={xb} y2={y} stroke={INK} strokeWidth="1" opacity="0.45" />
      {rtl ? (
        <path d={`M ${xa + 5} ${y - 3.5} L ${xa} ${y} L ${xa + 5} ${y + 3.5}`} fill="none" stroke={INK} strokeWidth="1" opacity="0.45" />
      ) : (
        <path d={`M ${xb - 5} ${y - 3.5} L ${xb} ${y} L ${xb - 5} ${y + 3.5}`} fill="none" stroke={INK} strokeWidth="1" opacity="0.45" />
      )}
      {!REDUCED && (
        <line x1={xa} y1={y} x2={xb} y2={y} stroke={WAX} strokeWidth="1.2" strokeDasharray="2 9" opacity="0.8">
          <animate attributeName="stroke-dashoffset" from="0" to={rtl ? "11" : "-11"} dur="1.6s" repeatCount="indefinite" />
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

export function FlatPipeline() {
  const IN = { x: 80, y: 40, w: 440, h: 196 };
  const CO = { x: 600, y: 40, w: 640, h: 196 };
  const SC = { x: 950, y: 76, w: 260, h: 130 }; // § 2017, pulled forward
  const DROP1 = 1080;
  const M = { x: 560, y: 292, w: 680, h: 196 }; // the machine's plate
  const FX = 1050; // fleet base
  const RAIL = { x: 820, y: 308, w: 120, h: 160 };
  const SPEC = { x: 200, y: 316, w: 186, h: 150 };
  const G = { x: 240, y: 530, w: 300, h: 172 };
  const SEAL = { x: 620, y: 616 };
  const gates = ["deterministic", "oracles", "AI judge"];
  const N = {
    tfp: [300, 562], inc: [296, 614], fpl: [300, 666],
    allot: [420, 590], elig: [418, 644], out: [502, 616],
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
        viewBox="0 0 1420 716"
        role="img"
        aria-label="The Axiom pipeline in three rows. Row one — the intake: scraping pipelines (eCFR, USLM, state codes, laws-lois) fill the database, every version kept, nothing ever leaves; it flows into the corpus: shelves of pages across US, states, UK, and Canada, 1,742,391 provisions, the whole law word for word, with § 2017 pulled forward. One provision at a time drops into row two — the encoding loop: encoders draft the rule (30 per centum becomes 0.30) and the validator rail — deterministic checks, oracles, AI judge — checks every draft; caught drafts loop back, every catch teaches the encoder, and the encoder's revision number ticks up. Out comes the RuleSpec, snap_allotment, 3,323 rules. It plugs into row three as the snap_allotment node of the rules graph — tfp and income feed it, benefit flows out — which compiles into the sealed program SNAP US 2026, certified and signed, powering FinBot for AI labs, Dashboard for government, and APIs for builders."
      >
        {/* ═══ ROW 1 · THE INTAKE ═══ */}
        <g filter="url(#fp-shadow)">
          <rect x={IN.x} y={IN.y} width={IN.w} height={IN.h} rx="8" fill={PAPER_EL} stroke={INK} strokeWidth="1" />
        </g>
        <rect x={IN.x} y={IN.y} width={IN.w} height="3" rx="1.5" fill={WAX} />
        <text className="fp-grouphead" x={IN.x + 14} y={IN.y + 26}>the intake</text>
        <text className="fp-shelflabel" x={IN.x + 14} y={IN.y + 52}>{"scraping pipelines"}</text>
        {["eCFR", "USLM", "state codes ×51", "laws-lois"].map((src, i) => {
          const px = IN.x + 14 + (i % 2) * 138;
          const py = IN.y + 62 + Math.floor(i / 2) * 32;
          return (
            <g key={src}>
              <rect className="fp-chip" x={px} y={py} width="126" height="26" rx="13" />
              <text className="fp-mono fp-mono--sm" x={px + 63} y={py + 16.5} textAnchor="middle">{src}</text>
            </g>
          );
        })}
        <Duct x0={IN.x + 284} x1={IN.x + 304} y={IN.y + 80} />
        <text className="fp-shelflabel" x={IN.x + 308} y={IN.y + 52}>{"database"}</text>
        {[2, 1, 0].map((i) => (
          <rect key={i} className="fp-card" x={IN.x + 308 + i * 5} y={IN.y + 60 + i * 6} width="100" height="38" rx="3" />
        ))}
        <line x1={IN.x + 326} y1={IN.y + 78} x2={IN.x + 392} y2={IN.y + 78} stroke={INK} strokeWidth="0.6" opacity="0.35" />
        <line x1={IN.x + 326} y1={IN.y + 86} x2={IN.x + 380} y2={IN.y + 86} stroke={INK} strokeWidth="0.6" opacity="0.35" />
        <text className="fp-cap" x={IN.x + 308} y={IN.y + 130}>nothing ever leaves</text>

        {/* ═══ ROW 1 · THE CORPUS ═══ */}
        <Duct x0={IN.x + IN.w + 4} x1={CO.x - 4} y={138} />
        <g filter="url(#fp-shadow)">
          <rect x={CO.x} y={CO.y} width={CO.w} height={CO.h} rx="8" fill="var(--color-paper)" stroke={INK} strokeWidth="1.2" />
        </g>
        <rect x={CO.x} y={CO.y} width={CO.w} height="3" rx="1.5" fill={WAX} />
        <text className="fp-grouphead" x={CO.x + 14} y={CO.y + 26}>the corpus</text>
        <text className="fp-capq" x={CO.x + 14} y={CO.y + 46}>the whole law, word for word</text>
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
            <g key={`s${r}${c}`}>
              <rect x={CO.x + 14 + c * 30} y={CO.y + 60 + r * 32} width="20" height="24" rx="1.5" fill={PAPER_EL} stroke={INK} strokeWidth="0.55" opacity="0.6" />
              <line x1={CO.x + 17 + c * 30} y1={CO.y + 70 + r * 32} x2={CO.x + 31 + c * 30} y2={CO.y + 70 + r * 32} stroke={INK} strokeWidth="0.45" opacity="0.35" />
            </g>
          )),
        )}
        <text className="fp-mono fp-mono--node" x={CO.x + 148} y={CO.y + 170} textAnchor="middle" opacity="0.55">us · states · uk · ca ⋯</text>
        <text className="fp-mono" x={CO.x + 14} y={CO.y + 188}>1,742,391 provisions</text>
        {/* § 2017 — pulled forward */}
        <g filter="url(#fp-shadow)">
          <rect x={SC.x} y={SC.y} width={SC.w} height={SC.h} rx="4" fill={PAPER_EL} stroke={WAX} strokeWidth="1.1" />
        </g>
        <text className="fp-mono fp-mono--sm" x={SC.x + 14} y={SC.y + 24}>us:statutes/7/2017/a</text>
        <text className="fp-mono fp-mono--node" x={SC.x + SC.w - 14} y={SC.y + 24} textAnchor="end" fill={WAX}>the raw text itself</text>
        <text className="fp-serifsm" x={SC.x + 14} y={SC.y + 50}>§ 2017 · Value of allotment</text>
        <line x1={SC.x + 14} y1={SC.y + 62} x2={SC.x + SC.w - 60} y2={SC.y + 62} stroke={INK} strokeWidth="0.6" opacity="0.3" />
        <text className="fp-serifq" x={SC.x + 14} y={SC.y + 86}>
          “…reduced by <tspan fill={WAX}>30 per centum</tspan> of income…”
        </text>
        <line x1={SC.x + 14} y1={SC.y + 100} x2={SC.x + SC.w - 100} y2={SC.y + 100} stroke={INK} strokeWidth="0.6" opacity="0.3" />
        <text className="fp-mono fp-mono--node" x={SC.x + 14} y={SC.y + 118} opacity="0.6">stored verbatim, every word</text>

        {/* ↓ one provision at a time */}
        <line x1={DROP1} y1={SC.y + SC.h} x2={DROP1} y2={CO.y + CO.h} stroke={INK} strokeWidth="1" opacity="0.45" />
        <VDuct x={DROP1} y0={CO.y + CO.h} y1={324} />
        <g filter="url(#fp-shadow)">
          <rect x={DROP1 - 11} y={252} width="22" height="28" rx="2" fill="var(--color-paper)" stroke={INK} strokeWidth="0.8" />
        </g>
        <text className="fp-mono fp-mono--node" x={DROP1} y={269} textAnchor="middle" fill={WAX}>§</text>
        <text className="fp-mono fp-mono--sm" x={DROP1 + 20} y={270} opacity="0.65">one provision at a time</text>

        {/* ═══ ROW 2 · THE ENCODING LOOP (reads right → left) ═══ */}
        <rect x={M.x} y={M.y} width={M.w} height={M.h} rx="12" fill="rgba(28,25,23,0.018)" stroke={INK} strokeWidth="0.6" opacity="0.5" />
        <text className="fp-grouphead" x={M.x + 14} y={M.y + 26}>the encoding loop</text>
        {/* the fleet */}
        {[2, 1, 0].map((i) => (
          <rect key={i} className="fp-card" x={FX + 8 - i * 5} y={328 + i * 6} width="130" height="118" rx="6" />
        ))}
        <rect x={FX + 8} y={328} width="130" height="3" rx="1.5" fill={WAX} />
        {REDUCED ? (
          <text className="fp-mono fp-mono--sm" x={FX + 128} y={346} textAnchor="end" fill={WAX}>rev 42</text>
        ) : (
          [42, 43, 44, 45].map((rev, k) => {
            const a = 0.235 + k * 0.25;
            const times =
              k === 0
                ? "0;0.234;0.236;0.984;0.986;1"
                : `0;${(a - 0.25).toFixed(3)};${(a - 0.248).toFixed(3)};${(a - 0.001).toFixed(3)};${(a + 0.001).toFixed(3)};1`;
            const vals = k === 0 ? "1;1;0;0;1;1" : "0;0;1;1;0;0";
            return (
              <text key={rev} className="fp-mono fp-mono--sm" x={FX + 128} y={346} textAnchor="end" fill={WAX} opacity={k === 0 ? 1 : 0}>
                <animate attributeName="opacity" dur="28s" repeatCount="indefinite" values={vals} keyTimes={times} />
                {`rev ${rev}`}
              </text>
            );
          })
        )}
        <text className="fp-station" x={FX + 73} y={368} textAnchor="middle">encoders</text>
        <text className="fp-serifq" x={FX + 73} y={394} textAnchor="middle">“30 per centum”</text>
        <path d={`M ${FX + 73} ${402} L ${FX + 73} ${414} M ${FX + 69.5} ${410} L ${FX + 73} ${415} L ${FX + 76.5} ${410}`} fill="none" stroke={INK} strokeWidth="0.9" opacity="0.5" />
        <text className="fp-mono" x={FX + 73} y={432} textAnchor="middle" fill={WAX}>0.30</text>
        {!REDUCED && (
          <>
            <rect x={FX + 8} y={328} width="130" height="3" rx="1.5" fill={WAX} opacity="0">
              <animate attributeName="opacity" dur="7s" repeatCount="indefinite" values="0;0;1;0;0" keyTimes="0;0.94;0.96;0.995;1" />
            </rect>
            <g opacity="0">
              <animate attributeName="opacity" dur="7s" repeatCount="indefinite" values="0;0;1;1;0" keyTimes="0;0.94;0.955;0.99;1" />
              <rect x={FX + 35} y={300} width="76" height="20" rx="10" fill={PAPER_EL} stroke={WAX} strokeWidth="1" />
              <text className="fp-mono fp-mono--sm" x={FX + 73} y={313.5} textAnchor="middle" fill={WAX}>↑ improved</text>
            </g>
          </>
        )}
        {/* the validator rail */}
        <rect x={RAIL.x} y={RAIL.y} width={RAIL.w} height={RAIL.h} rx="10" fill="rgba(28,25,23,0.028)" stroke={INK} strokeWidth="0.7" opacity="0.9" />
        <text className="fp-level" x={RAIL.x + 60} y={RAIL.y + 20} textAnchor="middle">validators</text>
        {gates.map((g, i) => {
          const y = RAIL.y + 28 + i * 38;
          return (
            <g key={g}>
              <rect className="fp-gatechip" x={RAIL.x + 10} y={y} width="100" height="26" rx="13" />
              <text className="fp-gatetext" x={RAIL.x + 21} y={y + 17}>
                {"✓ "}
                <tspan className="fp-gatename">{g}</tspan>
              </text>
            </g>
          );
        })}
        <text className="fp-mono fp-mono--node" x={RAIL.x + 60} y={RAIL.y + 148} textAnchor="middle" opacity="0.65">50+ checks · 7.7M runs</text>
        <Duct x0={RAIL.x + RAIL.w + 4} x1={FX + 4} y={388} rtl />
        {/* the loop: caught drafts return — and teach */}
        <path
          d={`M ${RAIL.x + 60} ${RAIL.y + RAIL.h + 2} C ${RAIL.x + 60} ${484}, ${FX + 73} ${486}, ${FX + 73} ${452}`}
          fill="none" stroke={WAX} strokeWidth="1.1" strokeDasharray="4 4"
        >
          {!REDUCED && <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.3s" repeatCount="indefinite" />}
        </path>
        <path d={`M ${FX + 68.5} ${458} L ${FX + 73} ${449} L ${FX + 77.5} ${457.5}`} fill="none" stroke={WAX} strokeWidth="1.1" />
        <text className="fp-mono fp-mono--wax" x={M.x + 130} y={434} textAnchor="middle">✗ caught → redrafted</text>
        <text className="fp-capq" x={M.x + 130} y={456} textAnchor="middle">every catch teaches the encoder</text>
        {/* out: the spec leaves the machine */}
        <Duct x0={SPEC.x + SPEC.w + 6} x1={RAIL.x - 4} y={380} rtl />

        {/* ═══ ROW 2 · RULESPEC ═══ */}
        <g filter="url(#fp-shadow)">
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

        {/* ↓ the spec plugs into the graph */}
        <path
          d={`M ${SPEC.x + 140} ${SPEC.y + SPEC.h + 2} C ${SPEC.x + 140} ${520}, ${N.allot[0]} ${520}, ${N.allot[0]} ${576}`}
          fill="none" stroke={INK} strokeWidth="1" opacity="0.45"
        />
        <path d={`M ${N.allot[0] - 3.5} ${571} L ${N.allot[0]} ${578} L ${N.allot[0] + 3.5} ${571}`} fill="none" stroke={INK} strokeWidth="1" opacity="0.45" />
        {!REDUCED && (
          <path
            d={`M ${SPEC.x + 140} ${SPEC.y + SPEC.h + 2} C ${SPEC.x + 140} ${520}, ${N.allot[0]} ${520}, ${N.allot[0]} ${576}`}
            fill="none" stroke={WAX} strokeWidth="1.2" strokeDasharray="2 9" opacity="0.8"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="-11" dur="1.6s" repeatCount="indefinite" />
          </path>
        )}

        {/* ═══ ROW 3 · THE GRAPH ═══ */}
        <rect x={G.x} y={G.y} width={G.w} height={G.h} rx="12" fill="rgba(28,25,23,0.018)" stroke={INK} strokeWidth="0.6" opacity="0.5" />
        <text className="fp-level" x={G.x + G.w - 14} y={G.y + 22} textAnchor="end">the graph</text>
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

        {/* ═══ ROW 3 · COMPILE ═══ */}
        <Duct x0={N.out[0] + 24} x1={SEAL.x - 27} y={SEAL.y} />
        <text className="fp-shelflabel" x={SEAL.x} y={586} textAnchor="middle">{"compile"}</text>
        <circle cx={SEAL.x} cy={SEAL.y} r="21" fill="rgba(146,64,14,0.12)" stroke={WAX} strokeWidth="1.5" />
        <circle cx={SEAL.x} cy={SEAL.y} r="15.5" fill="none" stroke={WAX} strokeWidth="0.7" />
        <text className="fp-sealtick" x={SEAL.x} y={SEAL.y + 5} textAnchor="middle">✓</text>
        <text className="fp-mono fp-mono--sm" x={SEAL.x} y={SEAL.y + 44} textAnchor="middle">SNAP · US · 2026</text>
        <text className="fp-mono fp-mono--tiny" x={SEAL.x} y={SEAL.y + 60} textAnchor="middle" opacity="0.6">certified · signed</text>

        {/* ═══ ROW 3 · WHO IT POWERS — plugged into the sealed program ═══ */}
        <path
          d={`M ${SEAL.x + 21} ${SEAL.y} C ${SEAL.x + 44} ${SEAL.y}, ${SEAL.x + 56} ${640}, ${SEAL.x + 56} ${682}`}
          fill="none" stroke={INK} strokeWidth="1" opacity="0.45"
        />
        <line x1={SEAL.x + 56} y1={682} x2={1276} y2={682} stroke={INK} strokeWidth="1" opacity="0.45" />
        {!REDUCED && (
          <line x1={SEAL.x + 56} y1={682} x2={1276} y2={682} stroke={WAX} strokeWidth="1.2" strokeDasharray="2 9" opacity="0.8">
            <animate attributeName="stroke-dashoffset" from="0" to="-11" dur="1.6s" repeatCount="indefinite" />
          </line>
        )}
        {[
          { img: previewFinbot, t: "FinBot", c: "AI labs" },
          { img: previewDashboard, t: "Dashboard", c: "government" },
          { img: previewTerminal, t: "API", c: "builders" },
        ].map(({ img, t, c }, i) => {
          const x = 720 + i * 227;
          const cx = x + 102;
          return (
            <g key={t}>
              <line x1={cx} y1={682} x2={cx} y2={664} stroke={INK} strokeWidth="1" opacity="0.45" />
              <path d={`M ${cx - 3.5} ${669} L ${cx} ${662} L ${cx + 3.5} ${669}`} fill="none" stroke={INK} strokeWidth="1" opacity="0.45" />
              <g filter="url(#fp-shadow)">
                <rect x={x} y={528} width="205" height="130" rx="4" fill={PAPER_EL} stroke={INK} strokeWidth="0.8" opacity="0.95" />
              </g>
              <rect x={x} y={528} width="205" height="3" rx="1.5" fill={WAX} />
              <text className="fp-mono" x={x + 10} y={547}>{t}</text>
              <text className="fp-mono fp-mono--tiny" x={x + 195} y={547} textAnchor="end" opacity="0.6">— {c}</text>
              <clipPath id={`fp-pc${i}`}>
                <rect x={x + 8} y={554} width="189" height="96" rx="3" />
              </clipPath>
              <image
                href={img} x={x + 8} y={554} width="189" height="96"
                preserveAspectRatio="xMidYMid slice" clipPath={`url(#fp-pc${i})`}
              />
              <rect x={x + 8} y={554} width="189" height="96" rx="3" fill="none" stroke={INK} strokeWidth="0.7" opacity="0.25" />
            </g>
          );
        })}

        <defs>
          <filter id="fp-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1c1917" floodOpacity="0.13" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
