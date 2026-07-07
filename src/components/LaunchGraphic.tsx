import { useState, type ReactNode } from "react";

// External launch graphic: the journey of one provision, compressed into a
// single viewport — one modern diagram, no scrolling. Three columns read
// left to right: THE SOURCE (published mess → addressed record), THE
// TRANSFORMATION (statute ↔ executable rule, linked on hover), THE PROOF &
// THE PRODUCT (oracle agreement → cited surfaces). Numbered chips 01–05
// carry the sequence; arrows carry the flow.

type Concept = "allotment" | "tfp" | "minus" | "pct" | "income";

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

function CardHead({
  n,
  title,
  machinery,
}: {
  n: string;
  title: string;
  machinery: string;
}) {
  return (
    <div className="lgc__head">
      <span className="lgc__n">{n}</span>
      <span className="lgc__title">{title}</span>
      <span className="lgc__machinery">{machinery}</span>
    </div>
  );
}

function DownArrow() {
  return (
    <div className="ldiag__down" aria-hidden="true">
      ↓
    </div>
  );
}

function Card({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <div className={`lgc ${dark ? "lgc--dark" : ""}`}>{children}</div>;
}

export function LaunchGraphic() {
  const [active, setActive] = useState<Concept | null>(null);

  const conceptProps = (concept?: Concept) =>
    concept
      ? {
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
            How public law becomes a clear and accurate digital representation
            — one provision, the whole way through.
          </p>
        </header>

        <div className="ldiag">
          {/* ── column 1: the source ─────────────────────────── */}
          <div className="ldiag__col">
            <div className="ldiag__colhead">the source</div>
            <Card>
              <CardHead n="01" title="Published" machinery="everywhere" />
              <div className="frag-mini frag-mini--xml">
                <div className="frag-mini__tag">uscode.house.gov · XML</div>
                <code>
                  {'<subsection identifier='}
                  <br />
                  {'"/us/usc/t7/s2017/a">…30'}
                  <br />
                  {"per centum…"}
                </code>
              </div>
              <div className="frag-mini frag-mini--pdf">
                <div className="frag-mini__tag">state agency · PDF, p. 214</div>
                <p>…value of the allotment shall be equal to the cost of…</p>
              </div>
              <div className="lgc__caption">
                eCFR · US Code · 50 states · UK · Canada
              </div>
            </Card>
            <DownArrow />
            <Card>
              <CardHead n="02" title="Captured" machinery="the corpus" />
              <div className="record-mini">
                <div className="record-mini__path">us/statute/7/2017/a</div>
                <div className="record-mini__meta">
                  § 2017(a) · sha256 ✓ · snapshot kept
                </div>
              </div>
              <div className="lgc__caption">
                one address for each of 1.7M+ provisions —{" "}
                <strong>clear</strong> begins here
              </div>
            </Card>
          </div>

          <div className="ldiag__arrow" aria-hidden="true">
            →
          </div>

          {/* ── column 2: the transformation ─────────────────── */}
          <div className="ldiag__col ldiag__col--center">
            <div className="ldiag__colhead">the transformation</div>
            <Card>
              <CardHead
                n="03"
                title="Encoded, word by word"
                machinery="RuleSpec"
              />
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

              <div className="launch-hero__joint" aria-hidden="true">
                <span className="launch-hero__stem" />
                <span className="launch-hero__verb">becomes</span>
                <span className="launch-hero__stem" />
              </div>

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
              </div>
              <div className="lgc__caption">
                every token pinned to its source words —{" "}
                <strong>hover either side</strong>
              </div>
            </Card>
          </div>

          <div className="ldiag__arrow" aria-hidden="true">
            →
          </div>

          {/* ── column 3: the proof, the product ─────────────── */}
          <div className="ldiag__col">
            <div className="ldiag__colhead">the proof · the product</div>
            <Card>
              <CardHead n="04" title="Verified" machinery="the oracles" />
              <div className="check-mini">
                <div className="check-mini__row">
                  <span>Family of 3 · $1,240/mo</span>
                  <span className="check-mini__num">$291 = $291</span>
                  <span className="check-mini__ok">✓</span>
                </div>
                <div className="check-mini__row">
                  <span>Couple over the limit</span>
                  <span className="check-mini__num">ineligible, both</span>
                  <span className="check-mini__ok">✓</span>
                </div>
                <div className="check-mini__sum">
                  ✓ 99.9% agreement · 299,993 checks
                </div>
              </div>
              <div className="lgc__caption">
                PolicyEngine · TAXSIM · EUROMOD — <strong>accurate</strong>,
                independently
              </div>
            </Card>
            <DownArrow />
            <Card>
              <CardHead n="05" title="Delivered" machinery="web · API · agents" />
              <div className="surface-mini surface-mini--dark">
                <code>
                  {'"snap_allotment": 291, "cites": "§ 2017(a)"'}
                </code>
              </div>
              <div className="surface-mini">
                “This household qualifies for <strong>$291/month</strong>.”
                <span className="surface-mini__cite">7 U.S.C. § 2017(a)</span>
              </div>
              <div className="lgc__caption">
                every answer cited · bills tracked hourly
              </div>
            </Card>
          </div>
        </div>

        <footer className="launch__footline">
          <span>
            4 countries · 50 states + DC · 1.7M+ provisions · 3,000+
            executable rules
          </span>
          <span className="launch__footbrand">
            <span className="glyph-axiom">∀</span> axiom-foundation.org
          </span>
        </footer>
      </div>
    </div>
  );
}
