import { useMemo } from "react";

// External launch graphic. Not a timeline: the actual shape of the system,
// drawn as one animated SVG — many official publishers converging into one
// corpus, transformed into executable rules (the single dark card), verified
// in a perpetual oracle loop, fanning out to web / API / agents.
//
// The particles ARE the story: muted dots (raw legal text) flow in, amber
// dots (executable rules) flow out, a green dot orbits the validation loop
// forever. One real provision — 7 U.S.C. § 2017(a), the SNAP allotment —
// appears at the corpus, the rule card, and the agent's cited answer.

const SOURCES = [
  { label: "eCFR", sub: "federal regulations", y: 83 },
  { label: "US Code", sub: "54 titles", y: 188, seed: true },
  { label: "State codes", sub: "50 states + DC", y: 293 },
  { label: "UK legislation", sub: "legislation.gov.uk", y: 398 },
  { label: "Canada", sub: "laws-lois · LIMS", y: 503 },
];

const SOURCE_TARGET_Y = [252, 281, 310, 339, 368];

const OUTPUTS = [
  {
    title: "Web",
    sub: "axiom-foundation.org",
    desc: "browse + trace the law",
    y: 128,
  },
  {
    title: "API + SDKs",
    sub: "TypeScript · Python",
    desc: "calculate programmatically",
    y: 310,
  },
  {
    title: "AI agents",
    sub: "MCP servers",
    desc: "cites § 2017(a)",
    cite: true,
    y: 492,
  },
];

const sourcePath = (sy: number, ty: number) =>
  `M 205 ${sy} C 285 ${sy}, 265 ${ty}, 348 ${ty}`;

const outputPath = (ty: number) =>
  `M 822 310 C 900 310, 905 ${ty}, 986 ${ty}`;

const LOOP_PATH =
  "M 722 397 C 638 397, 638 527, 722 527 C 806 527, 806 397, 722 397 Z";

function FlowDots({
  path,
  dur,
  fill,
  r = 2.5,
  begins,
}: {
  path: string;
  dur: number;
  fill: string;
  r?: number;
  begins: number[];
}) {
  return (
    <>
      {begins.map((b) => (
        <circle key={b} r={r} fill={fill}>
          <animateMotion
            dur={`${dur}s`}
            begin={`${b}s`}
            repeatCount="indefinite"
            path={path}
          />
        </circle>
      ))}
    </>
  );
}

export function LaunchGraphic() {
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  return (
    <div className="launch">
      <div className="launch__poster">
        <header className="launch__header">
          <div className="launch__eyebrow">The Axiom Foundation</div>
          <h1 className="launch__headline">
            The world’s rules, <em>encoded.</em>
          </h1>
          <p className="launch__sub">
            Public law, transformed into open executable rules — every answer
            traceable back to its source.
          </p>
        </header>

        <div className="launch__diagram">
          <svg
            className="launch-svg"
            viewBox="0 0 1180 620"
            role="img"
            aria-label="Flow of the Axiom system: official publishers converge into one corpus, provisions are encoded as executable rules, validated against independent calculators, and served to the web, APIs, and AI agents."
          >
            <defs>
              <marker
                id="lg-arr"
                viewBox="0 0 8 8"
                refX="7"
                refY="4"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 z" fill="#d6d3d1" />
              </marker>
            </defs>

            {/* ── column labels ─────────────────────────────── */}
            <text className="lg-col-label" x="30" y="42">
              official publishers
            </text>
            <text className="lg-col-label" x="986" y="66">
              surfaces
            </text>

            {/* ── edges ─────────────────────────────────────── */}
            {SOURCES.map((s, i) => (
              <path
                key={s.label}
                className="lg-edge"
                d={sourcePath(s.y, SOURCE_TARGET_Y[i])}
              />
            ))}
            <path
              className="lg-edge lg-edge--main"
              d="M 547 310 L 620 310"
              markerEnd="url(#lg-arr)"
            />
            {OUTPUTS.map((o) => (
              <path
                key={o.title}
                className="lg-edge"
                d={outputPath(o.y)}
                markerEnd="url(#lg-arr)"
              />
            ))}
            <path className="lg-loop" d={LOOP_PATH} />

            {/* ── edge verbs ────────────────────────────────── */}
            <text className="lg-verb" x="245" y="290">
              snapshot + parse
            </text>
            <text className="lg-verb" x="583" y="299" textAnchor="middle">
              encode
            </text>
            <text className="lg-verb" x="890" y="299" textAnchor="middle">
              execute
            </text>

            {/* ── sources ───────────────────────────────────── */}
            {SOURCES.map((s) => (
              <g key={s.label} className="lg-source">
                <title>{`${s.label} — ${s.sub}`}</title>
                {/* document glyph */}
                <rect
                  className="lg-doc"
                  x="30"
                  y={s.y - 16}
                  width="22"
                  height="30"
                  rx="2"
                />
                <line className="lg-doc-line" x1="35" x2="47" y1={s.y - 8} y2={s.y - 8} />
                <line
                  className={s.seed ? "lg-doc-line lg-doc-line--seed" : "lg-doc-line"}
                  x1="35"
                  x2="47"
                  y1={s.y - 2}
                  y2={s.y - 2}
                />
                <line className="lg-doc-line" x1="35" x2="43" y1={s.y + 4} y2={s.y + 4} />
                <text className="lg-source-title" x="64" y={s.y - 1}>
                  {s.label}
                </text>
                <text className="lg-source-sub" x="64" y={s.y + 14}>
                  {s.sub}
                </text>
              </g>
            ))}

            {/* ── corpus node ───────────────────────────────── */}
            <g className="lg-node">
              <title>
                One corpus — every provision preserved and addressable, with
                full provenance.
              </title>
              <rect className="lg-card" x="350" y="225" width="197" height="170" rx="6" />
              <text className="lg-title" x="370" y="262">
                One corpus
              </text>
              <text className="lg-body" x="370" y="288">
                Every provision preserved,
              </text>
              <text className="lg-body" x="370" y="304">
                addressable, with provenance.
              </text>
              <text className="lg-path" x="370" y="336">
                us/statute/7/2017/a
              </text>
              <text className="lg-meta" x="370" y="360">
                millions of provisions, verified
              </text>
            </g>

            {/* ── rule node (the one dark element) ──────────── */}
            <g className="lg-node">
              <title>
                Executable rules — each provision becomes an open,
                machine-executable rule.
              </title>
              <rect className="lg-card lg-card--dark" x="625" y="225" width="197" height="170" rx="6" />
              <text className="lg-title lg-title--onDark" x="645" y="262">
                Executable rules
              </text>
              <text className="lg-code lg-code--key" x="645" y="294">
                snap_allotment
              </text>
              <text className="lg-code" x="657" y="312">
                = thrifty_food_plan
              </text>
              <text className="lg-code" x="657" y="330">
                − 0.3 × net_income
              </text>
              <text className="lg-meta lg-meta--onDark" x="645" y="364">
                RuleSpec · 3,000+ modules · open
              </text>
            </g>

            {/* ── validation ────────────────────────────────── */}
            <text className="lg-agree" x="722" y="560" textAnchor="middle">
              ✓ validated · 99.9% agreement
            </text>
            <text className="lg-oracles" x="722" y="578" textAnchor="middle">
              PolicyEngine · TAXSIM · EUROMOD
            </text>

            {/* ── outputs ───────────────────────────────────── */}
            {OUTPUTS.map((o) => (
              <g key={o.title} className="lg-node">
                <title>{`${o.title} — ${o.sub}`}</title>
                <rect
                  className="lg-card"
                  x="986"
                  y={o.y - 42}
                  width="164"
                  height="84"
                  rx="6"
                />
                <text className="lg-title lg-title--sm" x="1004" y={o.y - 12}>
                  {o.title}
                </text>
                <text className="lg-meta" x="1004" y={o.y + 6}>
                  {o.sub}
                </text>
                <text
                  className={o.cite ? "lg-path lg-path--sm" : "lg-body lg-body--sm"}
                  x="1004"
                  y={o.y + 26}
                >
                  {o.desc}
                </text>
              </g>
            ))}

            {/* ── the living pipeline ───────────────────────── */}
            {!reducedMotion && (
              <g>
                {SOURCES.map((s, i) => (
                  <FlowDots
                    key={s.label}
                    path={sourcePath(s.y, SOURCE_TARGET_Y[i])}
                    dur={6}
                    fill="#78716c"
                    begins={[-i * 1.2]}
                  />
                ))}
                <FlowDots
                  path="M 547 310 L 620 310"
                  dur={2.6}
                  fill="#57534e"
                  begins={[0]}
                />
                {OUTPUTS.map((o, i) => (
                  <FlowDots
                    key={o.title}
                    path={outputPath(o.y)}
                    dur={4}
                    fill="#92400e"
                    r={3}
                    begins={[-i * 1.3]}
                  />
                ))}
                <FlowDots
                  path={LOOP_PATH}
                  dur={4}
                  fill="#166534"
                  r={3}
                  begins={[0]}
                />
              </g>
            )}
          </svg>
        </div>

        <footer className="launch__footer">
          <span className="glyph-axiom">∀</span>
          <span>axiom-foundation.org</span>
        </footer>
      </div>
    </div>
  );
}
