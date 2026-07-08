import type { ReactNode } from "react";

// External process graphic: how ONE encoding is made, for readers who know
// nothing about the pipeline. Three columns, one viewport:
//
//   THE DOCUMENT   a law is published → we capture and fingerprint it
//   THE GAUNTLET   AI drafts a rule with every number pinned to source
//                  words → four gates; ANY failure loops back to redraft
//   THE ENCODING   accepted, signed, citable → and re-verified forever
//
// The visible failure loop is the point: confidence comes from what gets
// rejected, not just what passes.

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

function Card({ children }: { children: ReactNode }) {
  return <div className="lgc">{children}</div>;
}

const GATES = [
  { name: "compiles & runs", detail: "the rules engine accepts it" },
  { name: "50+ automated checks", detail: "no number without a source" },
  { name: "matches reference calculators", detail: "same answers, independently" },
  { name: "independent review", detail: "separate reviewers sign off" },
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
            How an Axiom encoding is made — every step between “a document
            exists” and “this rule is accurate,” shown once, plainly.
          </p>
        </header>

        <div className="ldiag">
          {/* ── column 1: the document ───────────────────────── */}
          <div className="ldiag__col">
            <div className="ldiag__colhead">the document</div>
            <Card>
              <CardHead n="01" title="A law is published" machinery="official publishers" />
              <p className="lgc__lede">
                A statute, regulation, or agency memo appears on one of
                hundreds of official sites — each in its own format.
              </p>
              <div className="frag-mini frag-mini--xml">
                <div className="frag-mini__tag">uscode.house.gov · XML</div>
                <code>
                  {'<subsection id="/us/usc/t7/'}
                  <br />
                  {'s2017/a">…30 per centum…'}
                </code>
              </div>
              <div className="frag-mini frag-mini--pdf">
                <div className="frag-mini__tag">state agency · PDF, p. 214</div>
                <p>…value of the allotment shall be equal to…</p>
              </div>
            </Card>
            <div className="ldiag__down" aria-hidden="true">
              ↓
            </div>
            <Card>
              <CardHead n="02" title="Captured & fingerprinted" machinery="ingestion" />
              <p className="lgc__lede">
                We download it, checksum it, and give every provision a
                permanent address. The exact text we read is preserved — if
                the publisher changes the page tomorrow, we can prove what it
                said today.
              </p>
              <div className="record-mini">
                <div className="record-mini__path">us/statute/7/2017/a</div>
                <div className="record-mini__meta">
                  sha256 ✓ · snapshot kept · 1 of 1.7M+ provisions
                </div>
              </div>
            </Card>
          </div>

          <div className="ldiag__arrow" aria-hidden="true">
            <span className="ldiag__arrow-glyph">→</span>
          </div>

          {/* ── column 2: the gauntlet ───────────────────────── */}
          <div className="ldiag__col">
            <div className="ldiag__colhead">the gauntlet</div>
            <Card>
              <CardHead n="03" title="A rule is drafted" machinery="the encoder" />
              <p className="lgc__lede">
                AI drafts an executable rule — but every number and condition
                must point at the exact words in the source.{" "}
                <strong>No citation, no rule.</strong>
              </p>
              <div className="rule-mini">
                <code>
                  snap_allotment =<br />
                  {"  thrifty_food_plan − 0.30 × net_income"}
                </code>
              </div>
              <div className="proof-mini">
                <span className="proof-mini__token">0.30</span>
                <span className="proof-mini__link">←</span>
                <span className="proof-mini__quote">“30 per centum”</span>
                <span className="proof-mini__cite">§ 2017(a)</span>
              </div>
            </Card>

            <div className="gloop" aria-hidden="true">
              <span className="gloop__down">↓ submitted</span>
              <span className="gloop__back">↺ any failure — redrafted</span>
            </div>

            <Card>
              <CardHead n="04" title="Four gates" machinery="validation" />
              <div className="gates">
                {GATES.map((gate, i) => (
                  <div className="gate" key={gate.name}>
                    <span className="gate__n">{i + 1}</span>
                    <span className="gate__name">{gate.name}</span>
                    <span className="gate__detail">{gate.detail}</span>
                    <span className="gate__ok">✓</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="ldiag__arrow" aria-hidden="true">
            <span className="ldiag__arrow-glyph">→</span>
            <span className="ldiag__arrow-caption">all four pass</span>
          </div>

          {/* ── column 3: the encoding ───────────────────────── */}
          <div className="ldiag__col">
            <div className="ldiag__colhead">the encoding</div>
            <Card>
              <CardHead n="05" title="Accepted & signed" machinery="RuleSpec" />
              <p className="lgc__lede">
                The rule lands in the open rulebook — signed, versioned, and
                citable back to the law it encodes. Anyone can read it, run
                it, or challenge it.
              </p>
              <div className="manifest-mini">
                <span className="manifest-mini__chip">signed ✓</span>
                <span className="manifest-mini__chip">versioned</span>
                <span className="manifest-mini__chip manifest-mini__chip--cite">
                  cites 7 U.S.C. § 2017(a)
                </span>
              </div>
            </Card>
            <div className="ldiag__down" aria-hidden="true">
              ↓
            </div>
            <Card>
              <CardHead n="06" title="Kept accurate" machinery="the oracles" />
              <p className="lgc__lede">
                Not one-and-done: every rule is re-tested weekly against
                independent calculators across hundreds of thousands of model
                households — and we watch every legislature, hourly, for
                changes to the law.
              </p>
              <div className="check-mini__sum">
                ✓ 99.9% agreement · PolicyEngine · TAXSIM · EUROMOD
              </div>
            </Card>
          </div>
        </div>

        <footer className="launch__footline">
          <span>
            4 countries · 50 states + DC · 1.7M+ provisions · 3,000+
            encoded rules
          </span>
          <span className="launch__footbrand">
            <span className="glyph-axiom">∀</span> axiom-foundation.org
          </span>
        </footer>
      </div>
    </div>
  );
}
