// Option A key-frame — "the document is the interface."
//
// One real provision of law, rubricated and annotated into its rulespec,
// the way a fine type specimen annotates a glyph. The law is set as a
// justified serif block with the operative phrases picked out in chancery
// amber; hairline leaders carry each phrase across the gutter to the token
// it becomes in the rule. Beneath the rule: the four gates as a spec-sheet
// verification row, and the ledger line that makes it citable.
//
// Static on purpose — this is the poster test. Motion comes later, and
// only as seasoning.

const INK = "var(--color-ink)";
const MUTED = "var(--color-ink-muted)";
const WAX = "var(--color-accent)";
const OK = "var(--color-success)";

const SERIF: React.CSSProperties = { fontFamily: "var(--f-serif)", fontSize: "17px", fill: INK };
const MONO = (size: number, fill: string = INK): React.CSSProperties => ({
  fontFamily: "var(--f-mono)",
  fontSize: `${size}px`,
  fill,
});

// the statute, 7 U.S.C. § 2017(a), broken for a 500px justified measure.
// Amber = the phrases that become tokens.
const LINES: Array<Array<{ t: string; rubric?: boolean }>> = [
  [{ t: "The value of the allotment which State agencies" }],
  [{ t: "shall be authorized to issue to any households" }],
  [{ t: "certified as eligible", rubric: true }, { t: " to participate in the" }],
  [{ t: "supplemental nutrition assistance program shall" }],
  [{ t: "be equal to the cost to such households of the" }],
  [{ t: "thrifty food plan", rubric: true }, { t: " reduced by an amount equal" }],
  [{ t: "to " }, { t: "30 per centum of the household’s income", rubric: true }, { t: "," }],
  [{ t: "rounded to the nearest lower whole-dollar" }],
  [{ t: "increment." }],
];
const L_X = 90;
const L_W = 500;
const L_TOP = 150;
const LEAD = 30;

// leaders: statute line → code token. Orthogonal, hairline, node at each end.
const LEADERS = [
  { d: "M 602 204 H 700 V 269 H 792", a: [602, 204], b: [792, 269] }, // eligible
  { d: "M 602 294 H 756 V 235 H 792", a: [602, 294], b: [792, 235] }, // tfp
  { d: "M 602 324 H 1160 V 256", a: [602, 324], b: [1160, 256] }, // 30% income
];

const CHECKS = [
  { name: "run", detail: "12,408 households" },
  { name: "checks", detail: "214 assertions" },
  { name: "compare", detail: "USDA tables · exact" },
  { name: "review", detail: "2 maintainers" },
];

export function PosterFrame() {
  return (
    <div className="ill__wrap">
      <svg
        className="ill"
        viewBox="0 0 1420 540"
        role="img"
        aria-label="One provision, encoded: the text of 7 U.S.C. § 2017(a) with its operative phrases highlighted, each connected by a hairline leader to the token it becomes in the snap.allotment rulespec — allotment = tfp_cost minus 0.30 times net income, applies if the household is eligible. Below the rule, the four verification gates report their checks, and a ledger line records the sealed, citable rule."
      >
        {/* kicker */}
        <text style={{ ...MONO(9.5, MUTED), letterSpacing: "0.28em" }} x="710" y="64" textAnchor="middle">
          ONE PROVISION, ENCODED
        </text>

        {/* ── the law ── */}
        <text style={MONO(11, MUTED)} x={L_X} y="108" letterSpacing="0.08em">
          {"7 U.S.C. § 2017(a) — VALUE OF ALLOTMENT"}
        </text>
        <line x1={L_X} y1="118" x2={L_X + L_W} y2="118" stroke={INK} strokeWidth="0.75" opacity="0.5" />

        {LINES.map((spans, i) => {
          const last = i === LINES.length - 1;
          return (
            <text
              key={i}
              style={SERIF}
              x={L_X}
              y={L_TOP + i * LEAD}
              textLength={last ? undefined : L_W}
              lengthAdjust="spacing"
            >
              {spans.map((s, k) => (
                <tspan key={k} fill={s.rubric ? WAX : INK}>
                  {s.t}
                </tspan>
              ))}
            </text>
          );
        })}

        <text style={MONO(10.5, MUTED)} x={L_X} y="448">
          {"as published · 124 Stat. 3359 · amended through 2026"}
        </text>

        {/* ── the leaders ── */}
        {LEADERS.map(({ d, a, b }) => (
          <g key={d}>
            <path d={d} fill="none" stroke={INK} strokeWidth="0.75" opacity="0.45" />
            <circle cx={a[0]} cy={a[1]} r="2.2" fill={INK} opacity="0.55" />
            <circle cx={b[0]} cy={b[1]} r="2.2" fill={WAX} />
          </g>
        ))}

        {/* ── the rule ── */}
        <text style={MONO(11, MUTED)} x="810" y="108" letterSpacing="0.08em">
          {"SNAP / ALLOTMENT.RULESPEC"}
        </text>
        <line x1="810" y1="118" x2="1330" y2="118" stroke={INK} strokeWidth="0.75" opacity="0.5" />

        <text style={MONO(13)} x="810" y="152">
          <tspan fill={MUTED}>{"rule      "}</tspan>
          <tspan fill={INK}>snap.allotment</tspan>
        </text>
        <text style={MONO(13)} x="810" y="182">
          <tspan fill={MUTED}>{"source    "}</tspan>
          <tspan fill={INK}>{"7 U.S.C. § 2017(a)"}</tspan>
        </text>

        <text style={MONO(16)} x="810" y="240">
          <tspan fill={INK}>{"allotment = "}</tspan>
          <tspan fill={WAX}>tfp_cost</tspan>
          <tspan fill={INK}>{" − "}</tspan>
          <tspan fill={WAX}>{"0.30 × net_income"}</tspan>
        </text>
        <text style={MONO(16)} x="810" y="274">
          <tspan fill={MUTED}>{"applies_if  "}</tspan>
          <tspan fill={WAX}>household.eligible</tspan>
        </text>

        {/* ── the gates, as a spec sheet ── */}
        <line x1="810" y1="340" x2="1330" y2="340" stroke={INK} strokeWidth="0.75" opacity="0.5" />
        {CHECKS.map(({ name, detail }, i) => {
          const x = 810 + i * 140;
          return (
            <g key={name}>
              <text style={MONO(11.5, OK)} x={x} y="368">
                ✓
              </text>
              <text style={MONO(11.5)} x={x + 14} y="368">
                {name}
              </text>
              <text style={MONO(9.5, MUTED)} x={x} y="386">
                {detail}
              </text>
            </g>
          );
        })}

        {/* ── the ledger line ── */}
        <line x1="810" y1="424" x2="1330" y2="424" stroke={INK} strokeWidth="0.75" opacity="0.5" />
        <text style={MONO(10.5, MUTED)} x="810" y="448">
          {"sealed · sha-256 9f2c…41ab"}
        </text>
        <text style={MONO(10.5, MUTED)} x="1330" y="448" textAnchor="end">
          {"rule 2,847 of 3,112 · citable anywhere"}
        </text>
      </svg>
    </div>
  );
}
