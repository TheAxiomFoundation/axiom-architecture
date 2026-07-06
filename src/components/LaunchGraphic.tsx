import { useState } from "react";

// External launch graphic, scoped to ONE claim: real law becomes verified,
// executable rules. The hero is the transformation itself — an actual
// statute sentence (7 U.S.C. § 2017(a)) above the actual rule compiled from
// it — and the two are LINKED: hover a phrase in the law or a token in the
// code and its counterpart lights up. Traceability, demonstrated.
//
// Everything else is one quiet line: proof (oracle agreement), scope
// (countries/provisions/rules), payoff (apps · APIs · agents).

type Concept = "allotment" | "tfp" | "minus" | "pct" | "income";

// The statute sentence, split so each operative phrase carries its concept.
const STATUTE: Array<{ text: string; concept?: Concept }> = [
  { text: "…the " },
  { text: "value of the allotment", concept: "allotment" },
  { text: " shall be equal to the " },
  { text: "cost of the thrifty food plan", concept: "tfp" },
  { text: ", " },
  { text: "reduced by", concept: "minus" },
  { text: " an amount equal to " },
  { text: "30 per centum", concept: "pct" },
  { text: " of the " },
  { text: "household’s income", concept: "income" },
  { text: "…" },
];

// The rule, one token per concept, laid out as it appears in RuleSpec.
const FORMULA: Array<Array<{ text: string; concept?: Concept }>> = [
  [{ text: "snap_allotment", concept: "allotment" }],
  [{ text: "  = " }, { text: "thrifty_food_plan", concept: "tfp" }],
  [
    { text: "  " },
    { text: "−", concept: "minus" },
    { text: " " },
    { text: "0.30 ×", concept: "pct" },
    { text: " " },
    { text: "net_income", concept: "income" },
  ],
];

export function LaunchGraphic() {
  const [active, setActive] = useState<Concept | null>(null);

  const conceptProps = (concept?: Concept) =>
    concept
      ? {
          "data-linked": true,
          "data-active": active === concept || undefined,
          onMouseEnter: () => setActive(concept),
          onMouseLeave: () => setActive(null),
        }
      : {};

  return (
    <div className="launch">
      <div className="launch__poster">
        <header className="launch__header">
          <div className="launch__eyebrow">The Axiom Foundation</div>
          <h1 className="launch__headline">
            The world’s rules, <em>encoded.</em>
          </h1>
          <p className="launch__sub">
            We turn public law into open, executable rules — verified, and
            traceable to the sentence they came from.
          </p>
        </header>

        <div className="launch-hero">
          {/* the law */}
          <figure className="launch-law">
            <figcaption className="launch-law__cite">
              7 U.S.C. § 2017(a) · Food and Nutrition Act
            </figcaption>
            <blockquote className="launch-law__text">
              {STATUTE.map((part, i) =>
                part.concept ? (
                  <mark
                    key={i}
                    className="launch-law__phrase"
                    {...conceptProps(part.concept)}
                  >
                    {part.text}
                  </mark>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
            </blockquote>
          </figure>

          {/* the transformation */}
          <div className="launch-hero__joint" aria-hidden="true">
            <span className="launch-hero__stem" />
            <span className="launch-hero__verb">becomes</span>
            <span className="launch-hero__stem" />
          </div>

          {/* the rule */}
          <div className="launch-rule">
            <div className="launch-rule__code">
              {FORMULA.map((line, li) => (
                <div className="launch-rule__line" key={li}>
                  {line.map((tok, ti) =>
                    tok.concept ? (
                      <span
                        key={ti}
                        className="launch-rule__token"
                        {...conceptProps(tok.concept)}
                      >
                        {tok.text}
                      </span>
                    ) : (
                      <span key={ti} className="launch-rule__plain">
                        {tok.text}
                      </span>
                    ),
                  )}
                </div>
              ))}
            </div>
            <div className="launch-rule__badge">
              ✓ verified · 99.9% agreement with PolicyEngine · TAXSIM · EUROMOD
            </div>
          </div>

          <p className="launch-hero__hint">
            the law and the rule are linked — hover either side
          </p>
        </div>

        <p className="launch__scope">
          4 countries · 50 states + DC · 1.7M+ provisions · 3,000+ executable
          rules
        </p>

        <p className="launch__payoff">
          Now powering apps, APIs, and AI agents — every answer cited back to
          the law.
        </p>

        <footer className="launch__footer">
          <span className="glyph-axiom">∀</span>
          <span>axiom-foundation.org</span>
        </footer>
      </div>
    </div>
  );
}
