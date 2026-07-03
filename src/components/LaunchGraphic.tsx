// External launch one-pager. Unlike the internal graph (every repo, every
// table), this shows the five-stage story a first-time reader needs — and
// carries ONE real provision (7 U.S.C. § 2017(a), the SNAP allotment) through
// every stage, so "traceable back to the law" is shown, not claimed.
//
// Pure HTML/CSS poster: screenshot-ready at desktop width, stacks on mobile.

const STAGES = [
  {
    n: "01",
    title: "Source law",
    desc: "Statutes, regulations, and guidance, captured from the official publishers.",
    caption: "eCFR · US Code · 50 states · UK · Canada",
  },
  {
    n: "02",
    title: "One corpus",
    desc: "Every provision preserved and addressable, with full provenance.",
    caption: "Millions of provisions, snapshot by snapshot",
  },
  {
    n: "03",
    title: "Executable rules",
    desc: "Each provision becomes an open, machine-executable rule.",
    caption: "RuleSpec · 3,000+ encoded modules",
  },
  {
    n: "04",
    title: "Validated",
    desc: "Every program is checked against independent calculators.",
    caption: "PolicyEngine · TAXSIM · EUROMOD",
  },
  {
    n: "05",
    title: "Answered",
    desc: "Apps, APIs, and AI agents answer with citations back to the law.",
    caption: "Web · API · MCP agents",
  },
];

// Per-stage miniature artifact: the same provision, in that stage's material.
function Artifact({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <div className="launch-artifact launch-artifact--statute">
          <div className="launch-artifact__heading">
            <span className="launch-artifact__section">§ 2017(a)</span> Value of
            allotment
          </div>
          <p className="launch-artifact__excerpt">
            …the value of the allotment shall be equal to the cost of the
            thrifty food plan reduced by 30 per centum of the household’s
            income…
          </p>
        </div>
      );
    case 1:
      return (
        <div className="launch-artifact launch-artifact--corpus">
          <div className="launch-artifact__stack" aria-hidden="true" />
          <div className="launch-artifact__record">
            <span className="launch-artifact__path">us/statute/7/2017/a</span>
            <span className="launch-artifact__meta">sha256 ✓ · snapshot kept</span>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="launch-artifact launch-artifact--rule">
          <div className="launch-artifact__code">
            <span className="launch-artifact__key">snap_allotment</span>
            <span className="launch-artifact__line">= thrifty_food_plan</span>
            <span className="launch-artifact__line">− 0.3 × net_income</span>
          </div>
        </div>
      );
    case 3:
      return (
        <div className="launch-artifact launch-artifact--check">
          <div className="launch-artifact__row">
            <span>Axiom</span>
            <span className="launch-artifact__num">$291</span>
          </div>
          <div className="launch-artifact__row">
            <span>Independent oracle</span>
            <span className="launch-artifact__num">$291</span>
          </div>
          <div className="launch-artifact__agree">✓ 99.9% agreement</div>
        </div>
      );
    default:
      return (
        <div className="launch-artifact launch-artifact--answer">
          <p className="launch-artifact__reply">
            “This household qualifies for <strong>$291/month</strong>.”
          </p>
          <span className="launch-artifact__cite">7 U.S.C. § 2017(a)</span>
        </div>
      );
  }
}

export function LaunchGraphic() {
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

        <ol className="launch__flow">
          {STAGES.map((stage, i) => (
            <li
              className="launch-stage"
              key={stage.n}
              style={{ animationDelay: `${0.15 + i * 0.12}s` }}
            >
              <div className="launch-stage__marker">
                <span className="launch-stage__n">{stage.n}</span>
                <span className="launch-stage__dot" aria-hidden="true" />
              </div>
              <div className="launch-stage__card">
                <Artifact index={i} />
                <div className="launch-stage__title">{stage.title}</div>
                <p className="launch-stage__desc">{stage.desc}</p>
                <div className="launch-stage__caption">{stage.caption}</div>
              </div>
            </li>
          ))}
        </ol>

        <footer className="launch__footer">
          <span className="glyph-axiom">∀</span>
          <span>axiom-foundation.org</span>
        </footer>
      </div>
    </div>
  );
}
