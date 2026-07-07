import { useEffect, useRef, useState, type ReactNode } from "react";

// External launch narrative. One real provision — 7 U.S.C. § 2017(a), the
// SNAP allotment — travels top to bottom through five beats: published →
// captured → encoded → verified → delivered. Each beat shows the SAME law
// as that stage's real material, so the architecture reads as the machinery
// of a journey rather than a box diagram. "Clear" is earned in beats 1–2,
// "accurate" in beats 3–4; beat 5 is the payoff.

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

const LEDGER = [
  { household: "Family of 3 · $1,240/mo earnings", axiom: "$291", oracle: "$291" },
  { household: "Single adult · $980/mo earnings", axiom: "$176", oracle: "$176" },
  { household: "Couple · income above the limit", axiom: "not eligible", oracle: "not eligible" },
];

// Scroll-reveal: adds .beat--in when the band enters the viewport.
function Beat({
  n,
  title,
  machinery,
  lede,
  children,
}: {
  n: string;
  title: string;
  machinery: string;
  lede: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("beat--in");
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("beat--in");
            obs.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="beat" ref={ref}>
      <div className="beat__rail" aria-hidden="true">
        <span className="beat__node">{n}</span>
        <span className="beat__line" />
      </div>
      <div className="beat__body">
        <div className="beat__titlerow">
          <h2 className="beat__title">{title}</h2>
          <span className="beat__machinery">{machinery}</span>
        </div>
        <p className="beat__lede">{lede}</p>
        <div className="beat__artifact">{children}</div>
      </div>
    </section>
  );
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
            — follow one sentence of the U.S. Code the whole way down.
          </p>
        </header>

        <div className="launch__beats">
          <Beat
            n="01"
            title="The law as published"
            machinery="official publishers"
            lede="Statutes, regulations, and guidance are scattered across hundreds of sources — every publisher with its own format."
          >
            <div className="frag-pile">
              <div className="frag frag--xml">
                <div className="frag__tag">uscode.house.gov · XML</div>
                <code>
                  {'<subsection identifier="/us/usc/t7/s2017/a">'}
                  <br />
                  {"  …cost of the thrifty food plan, reduced"}
                  <br />
                  {"  by an amount equal to 30 per centum…"}
                </code>
              </div>
              <div className="frag frag--pdf">
                <div className="frag__tag">state agency · PDF</div>
                <p>
                  …the value of the allotment shall be equal to the cost of
                  the thrifty food plan reduced by…
                </p>
                <div className="frag__page">— p. 214 —</div>
              </div>
              <div className="frag frag--html">
                <div className="frag__tag">ecfr.gov · HTML</div>
                <code>
                  {'<p class="statute">…30 per centum of'}
                  <br />
                  {"the household’s income…</p>"}
                </code>
              </div>
            </div>
            <div className="beat__caption">
              eCFR · US Code · 50 state codes · UK · Canada
            </div>
          </Beat>

          <Beat
            n="02"
            title="Captured, one address each"
            machinery="the corpus"
            lede={
              <>
                We snapshot every source and give every provision a permanent,
                citable address. This is where <strong>clear</strong> begins.
              </>
            }
          >
            <div className="record">
              <div className="record__path">us/statute/7/2017/a</div>
              <div className="record__title">§ 2017(a) · Value of allotment</div>
              <p className="record__text">
                …the value of the allotment shall be equal to the cost of the
                thrifty food plan, reduced by an amount equal to 30 per centum
                of the household’s income…
              </p>
              <div className="record__meta">
                sha256 ✓ · snapshot kept · source: uscode.house.gov
              </div>
            </div>
            <div className="beat__caption">
              one of 1.7M+ provisions, each with a stable address
            </div>
          </Beat>

          <Beat
            n="03"
            title="Encoded, word by word"
            machinery="the encoder · RuleSpec"
            lede={
              <>
                Each provision becomes an executable rule, and every number and
                condition is pinned to the exact words it came from —{" "}
                <strong>hover either side</strong>.
              </>
            }
          >
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
            <div className="beat__caption">
              open RuleSpec format · 3,000+ encoded modules
            </div>
          </Beat>

          <Beat
            n="04"
            title="Verified independently"
            machinery="the oracles"
            lede={
              <>
                We run every rule against independent calculators across
                hundreds of thousands of test households. Disagreements are
                investigated, not ignored. This is where{" "}
                <strong>accurate</strong> is earned.
              </>
            }
          >
            <div className="ledger">
              <div className="ledger__head">
                <span>test household</span>
                <span>Axiom</span>
                <span>independent oracle</span>
                <span />
              </div>
              {LEDGER.map((row) => (
                <div className="ledger__row" key={row.household}>
                  <span>{row.household}</span>
                  <span className="ledger__num">{row.axiom}</span>
                  <span className="ledger__num">{row.oracle}</span>
                  <span className="ledger__check">✓</span>
                </div>
              ))}
              <div className="ledger__sum">
                299,821 of 299,993 checks agree — 99.9%
              </div>
            </div>
            <div className="beat__caption">
              PolicyEngine · TAXSIM · EUROMOD · illustrative households
            </div>
          </Beat>

          <Beat
            n="05"
            title="The digital representation"
            machinery="web · API · agents"
            lede={
              <>
                The result: the legal code, clear and accurate, wherever it’s
                needed — and every answer cited back to the law. When the law
                changes, the rules change with it; we track every bill, hourly.
              </>
            }
          >
            <div className="surfaces">
              <div className="surface">
                <div className="surface__label">browse</div>
                <p className="surface__body surface__body--serif">
                  …reduced by <mark>30 per centum</mark> of the household’s
                  income…
                </p>
              </div>
              <div className="surface surface--dark">
                <div className="surface__label">API</div>
                <code className="surface__code">
                  {'"snap_allotment": 291,'}
                  <br />
                  {'"cites": "7 U.S.C. § 2017(a)"'}
                </code>
              </div>
              <div className="surface">
                <div className="surface__label">AI agents</div>
                <p className="surface__body">
                  “This household qualifies for <strong>$291/month</strong>.”
                </p>
                <span className="surface__cite">7 U.S.C. § 2017(a)</span>
              </div>
            </div>
          </Beat>
        </div>

        <p className="launch__scope">
          4 countries · 50 states + DC · 1.7M+ provisions · 3,000+ executable
          rules
        </p>

        <footer className="launch__footer">
          <span className="glyph-axiom">∀</span>
          <span>axiom-foundation.org</span>
        </footer>
      </div>
    </div>
  );
}
