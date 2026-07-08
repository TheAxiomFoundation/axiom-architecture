// External process graphic in tech-stack form: five full-width layers,
// read bottom-up like any platform stack diagram. The base is the official
// law itself; each layer above adds assurance; the top layer is the
// product — signed, executable rules. The draft ⇄ verify failure loop is a
// side annotation between layers 03 and 04. Numbers carry the sequence.

const LAYERS = [
  {
    n: "05",
    name: "The rulebook",
    machinery: "RuleSpec",
    tint: "product" as const,
    desc: "3,000+ executable rules — signed, versioned, each citing the law it encodes. Open: anyone can read, run, or challenge them.",
    items: [
      { text: "snap_allotment = thrifty_food_plan − 0.30 × net_income", mono: true },
      { text: "cites 7 U.S.C. § 2017(a)", cite: true },
    ],
  },
  {
    n: "04",
    name: "Verification",
    machinery: "four gates · the oracles",
    tint: "green" as const,
    desc: "Nothing ships unverified — and nothing stays unverified. Every rule is re-tested weekly.",
    items: [
      { text: "compiles & runs" },
      { text: "50+ automated checks" },
      { text: "matches independent calculators — PolicyEngine · TAXSIM · EUROMOD · 99.9%" },
      { text: "independent review" },
    ],
    loop: true,
  },
  {
    n: "03",
    name: "Encoding",
    machinery: "the encoder",
    tint: "plain" as const,
    desc: "AI drafts an executable rule. Every number and condition must point at the exact source words — no citation, no rule.",
    items: [{ text: "0.30 ← “30 per centum of the household’s income”", proof: true }],
  },
  {
    n: "02",
    name: "The corpus",
    machinery: "ingestion",
    tint: "plain" as const,
    desc: "Every provision captured, fingerprinted, and given a permanent address. We can prove what a page said, forever.",
    items: [
      { text: "us/statute/7/2017/a", mono: true },
      { text: "sha256 ✓" },
      { text: "1.7M+ provisions" },
    ],
  },
  {
    n: "01",
    name: "Source law",
    machinery: "official publishers",
    tint: "ink" as const,
    desc: "The official text, from the official publishers. This is the bedrock — nothing above exists without it.",
    items: [
      { text: "eCFR" },
      { text: "US Code" },
      { text: "50 state codes" },
      { text: "UK" },
      { text: "Canada" },
    ],
  },
];

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
            The Axiom stack, read from the bottom up — every layer between “a
            document exists” and “this rule is accurate.”
          </p>
        </header>

        <div className="stack">
          {LAYERS.map((layer, i) => (
            <div className="stack__tier" key={layer.n}>
              {i > 0 && (
                <div className="stack__gap" aria-hidden="true">
                  <span className="stack__up">↑</span>
                  {LAYERS[i - 1].loop && (
                    <span className="stack__loop">
                      ↺ any failure — redrafted
                    </span>
                  )}
                </div>
              )}
              <div className={`layer layer--${layer.tint}`}>
                <div className="layer__id">
                  <span className="layer__n">{layer.n}</span>
                </div>
                <div className="layer__name">
                  <div className="layer__title">{layer.name}</div>
                  <div className="layer__machinery">{layer.machinery}</div>
                </div>
                <p className="layer__desc">{layer.desc}</p>
                <div className="layer__items">
                  {layer.items.map((item) => (
                    <span
                      key={item.text}
                      className={[
                        "layer__item",
                        "mono" in item && item.mono ? "layer__item--mono" : "",
                        "cite" in item && item.cite ? "layer__item--cite" : "",
                        "proof" in item && item.proof ? "layer__item--proof" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {item.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
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
