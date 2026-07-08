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

const SOURCES = [
  { label: "eCFR", sub: "federal regulations", c: 100, h: 48 },
  { label: "US Code", sub: "54 titles", c: 185, h: 56 },
  { label: "State codes", sub: "50 states + DC", c: 290, h: 104 },
  { label: "UK", sub: "legislation.gov.uk", c: 395, h: 44 },
  { label: "Canada", sub: "laws-lois", c: 470, h: 44 },
];

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
  };
});
const CORPUS_BOTTOM = acc; // 448

export function LaunchGraphic() {
  return (
    <div className="launch">
      <div className="launch__poster">
        <header className="launch__header">
          <div className="launch__eyebrow">The Axiom Foundation</div>
          <h1 className="launch__headline">
            From published law to a rule you can <em>trust.</em>
          </h1>
          <p className="launch__sub">
            The whole process in one flow: what we capture, what we encode,
            what survives the gates. Widths are illustrative — the counts are
            real.
          </p>
        </header>

        <div className="lsk__wrap">
          <svg
            className="lsk"
            viewBox="0 0 1200 540"
            role="img"
            aria-label="Flow chart: hundreds of official legal sources merge into a corpus of 1.7M+ provisions; a narrower stream is drafted into rules, passes four verification gates (failures loop back for redrafting), and emerges as 3,000+ verified, signed rules, re-tested weekly."
          >
            {/* ── stage: sources ─────────────────────────────── */}
            <g className="lsk__stage lsk__stage--1">
              <text className="lsk-eyebrow" x="30" y="52">
                hundreds of official sites
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
                />
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
              <text className="lsk-name" x="406" y="124" textAnchor="middle">
                The corpus
              </text>
              <text className="lsk-eyebrow" x="406" y="141" textAnchor="middle">
                1.7M+ provisions · fingerprinted · addressed
              </text>
            </g>

            {/* corpus → encoding (the working slice) */}
            <g className="lsk__stage lsk__stage--3">
              <path
                className="lsk-ribbon lsk-ribbon--draft"
                d={link(412, 262, 342, 650, 240, 340)}
              />
              <rect className="lsk-bar lsk-bar--encode" x="650" y="240" width="12" height="100" rx="3" />
              <text className="lsk-name" x="656" y="207" textAnchor="middle">
                Encoding
              </text>
              <text className="lsk-eyebrow" x="656" y="224" textAnchor="middle">
                pinned to source words
              </text>
            </g>

            {/* encoding → gates */}
            <g className="lsk__stage lsk__stage--4">
              <path
                className="lsk-ribbon lsk-ribbon--encoded"
                d={link(662, 240, 340, 880, 245, 335)}
              />
              <rect className="lsk-bar lsk-bar--gates" x="880" y="245" width="12" height="90" rx="3" />
              <text className="lsk-name" x="870" y="207" textAnchor="middle">
                Four gates
              </text>
              <text className="lsk-eyebrow" x="870" y="224" textAnchor="middle">
                compile · checks · oracles · review
              </text>

              {/* the redraft loop — failures flow back */}
              <path
                className="lsk-loop"
                d="M 884 335 C 884 452, 660 452, 658 342"
              />
              <text className="lsk-loop-label" x="771" y="466" textAnchor="middle">
                ↺ any failure — redrafted
              </text>
            </g>

            {/* gates → rulebook */}
            <g className="lsk__stage lsk__stage--5">
              <path
                className="lsk-ribbon lsk-ribbon--verified"
                d={link(892, 250, 320, 1120, 255, 325)}
              />
              <rect className="lsk-bar lsk-bar--rules" x="1120" y="255" width="12" height="70" rx="3" />
              <text className="lsk-name" x="1072" y="359" textAnchor="middle">
                The rulebook
              </text>
              <text className="lsk-eyebrow" x="1072" y="376" textAnchor="middle">
                3,000+ rules · signed &amp; citable
              </text>
              <text className="lsk-agree" x="1030" y="242" textAnchor="middle">
                ✓ 99.9% oracle agreement
              </text>
              <text className="lsk-retest" x="1072" y="393" textAnchor="middle">
                re-tested weekly · watched hourly
              </text>
            </g>

            {/* ── particles: the pipeline is alive ───────────── */}
            <g className="lsk__stage lsk__stage--5">
              {[1, 2].map((i) => (
                <circle key={i} className="lsk-dot lsk-dot--raw" r="3">
                  <animateMotion
                    dur="6s"
                    begin={`${-i * 2.4}s`}
                    repeatCount="indefinite"
                    path={SOURCE_LINKS[i === 1 ? 1 : 2].cd}
                  />
                </circle>
              ))}
              <circle className="lsk-dot lsk-dot--raw" r="3">
                <animateMotion
                  dur="5s"
                  begin="-1s"
                  repeatCount="indefinite"
                  path={center(412, 302, 650, 290)}
                />
              </circle>
              <circle className="lsk-dot lsk-dot--amber" r="3.5">
                <animateMotion
                  dur="4.5s"
                  repeatCount="indefinite"
                  path={center(662, 290, 880, 290)}
                />
              </circle>
              <circle className="lsk-dot lsk-dot--green" r="3.5">
                <animateMotion
                  dur="5s"
                  begin="-2s"
                  repeatCount="indefinite"
                  path={center(892, 285, 1120, 290)}
                />
              </circle>
              <circle className="lsk-dot lsk-dot--amber" r="2.5">
                <animateMotion
                  dur="6s"
                  begin="-3s"
                  repeatCount="indefinite"
                  path="M 884 335 C 884 452, 660 452, 658 342"
                />
              </circle>
            </g>
          </svg>
        </div>

        <footer className="launch__footline">
          <span>
            4 countries · 50 states + DC · 1.7M+ provisions · 3,000+ encoded
            rules
          </span>
          <span className="launch__footbrand">
            <span className="glyph-axiom">∀</span> axiom-foundation.org
          </span>
        </footer>
      </div>
    </div>
  );
}
