// The illustrated launch story: not a row of vignettes but one continuously
// evolving film about a single document. A page slides out of the publisher's
// portico to center stage, is fingerprinted and filed, its text morphs into
// code under the lens, four gates rise and stamp their checks (one fails —
// the line is redrafted in place and re-checked), the page closes into a
// sealed book, and copies fly out to the browser, the terminal, and the
// AI agent. One SMIL clock drives everything; the loop is seamless.

const CYCLE = 26;

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CXC = 710; // stage center
const CYC = 245;

// phase windows (fractions of the cycle)
const P = {
  pub: [0.005, 0.13],
  cap: [0.13, 0.26],
  enc: [0.26, 0.44],
  gates: [0.44, 0.66],
  seal: [0.66, 0.78],
  every: [0.78, 0.95],
} as const;

const CAPTIONS = [
  { w: P.pub, name: "Laws are published", sub: "statutes · regulations · guidance — hundreds of official sites" },
  { w: P.cap, name: "Captured & filed", sub: "cross-referenced, fingerprinted, stored in the corpus · 1.7M+ provisions" },
  { w: P.enc, name: "Encoded", sub: "the text becomes an executable rule" },
  { w: P.gates, name: "The four gates", sub: "run · checks · compare · review — failures are redrafted" },
  { w: P.seal, name: "Sealed into the rulebook", sub: "3,000+ rules · signed & citable" },
  { w: P.every, name: "Everywhere", sub: "web · API · AI agents" },
];

// opacity window helper: fade in over [a, a+r], out over [b, b+r]
function Vis({ a, b, r = 0.012, max = 1 }: { a: number; b: number; r?: number; max?: number }) {
  return (
    <animate
      attributeName="opacity"
      dur={`${CYCLE}s`}
      repeatCount="indefinite"
      values={`0;0;${max};${max};0;0`}
      keyTimes={`0;${a};${Math.min(a + r, b)};${b};${Math.min(b + r, 0.999)};1`}
    />
  );
}

// ── stage props ───────────────────────────────────────────────────────

// three sources, three kinds of document: the legislature's portico,
// an agency office, the register
function Sources() {
  return (
    <g opacity="0">
      <Vis a={0.004} b={0.15} r={0.02} />
      {/* legislature */}
      <g transform="translate(80, 55)">
        <polygon className="ill-line" points="8,42 60,12 112,42" />
        <line className="ill-line" x1="14" y1="42" x2="106" y2="42" />
        {[30, 55, 80].map((x) => (
          <rect key={x} className="ill-line" x={x} y="48" width="11" height="60" />
        ))}
        <rect className="ill-line" x="10" y="108" width="100" height="9" />
        <text className="ill-caption" x="60" y="134" textAnchor="middle">legislature</text>
      </g>
      {/* agency */}
      <g transform="translate(96, 215)">
        <rect className="ill-line" x="8" y="10" width="76" height="70" rx="2" />
        <line className="ill-line" x1="2" y1="10" x2="90" y2="10" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <rect key={`${r}${c}`} className="ill-ink" x={20 + c * 22} y={20 + r * 17} width="10" height="9" strokeWidth="0" opacity="0.55" />
          ))
        )}
        <rect className="ill-line" x="38" y="66" width="16" height="14" />
        <text className="ill-caption" x="46" y="102" textAnchor="middle">agency</text>
      </g>
      {/* the register */}
      <g transform="translate(88, 358)">
        <rect className="ill-line" x="6" y="8" width="88" height="58" rx="2" />
        <line className="ill-line" x1="50" y1="8" x2="50" y2="66" />
        <line className="ill-ink" strokeWidth="2.6" x1="13" y1="19" x2="43" y2="19" />
        {[30, 39, 48, 57].map((y) => (
          <line key={y} className="ill-ink" x1="13" y1={y} x2="43" y2={y} strokeWidth="1.2" />
        ))}
        {[19, 30, 39, 48, 57].map((y) => (
          <line key={y} className="ill-ink" x1="57" y1={y} x2="87" y2={y} strokeWidth="1.2" />
        ))}
        <text className="ill-caption" x="50" y="90" textAnchor="middle">register</text>
      </g>
    </g>
  );
}

// the corpus: the cabinet the sibling documents are filed into
function Corpus() {
  return (
    <g opacity="0" transform="translate(280, 150)">
      <Vis a={0.125} b={0.27} r={0.02} />
      <rect className="ill-line" x="0" y="0" width="72" height="110" rx="3" />
      {[26, 50, 88].map((y) => (
        <line key={y} className="ill-line" x1="7" y1={y} x2="65" y2={y} />
      ))}
      {[13, 38, 99].map((y) => (
        <line key={y} className="ill-ink" x1="30" y1={y} x2="42" y2={y} />
      ))}
      {/* the open drawer the documents are filed into */}
      <rect className="ill-paper" x="-11" y="58" width="94" height="22" rx="2" />
      <line className="ill-ink" x1="28" y1="69" x2="44" y2="69" />
      <text className="ill-caption" x="36" y="130" textAnchor="middle">the corpus</text>
    </g>
  );
}

// sibling documents from the other sources: they fly in, cross-reference
// the hero document, then are filed into the corpus
const SIBLINGS = [
  {
    origin: [140, 262] as const, // agency
    flank: [548, 172] as const,
    leave: 0.208,
    filed: 0.246,
    appear: 0.028,
    arrive: 0.1,
  },
  {
    origin: [138, 396] as const, // register
    flank: [556, 322] as const,
    leave: 0.22,
    filed: 0.258,
    appear: 0.04,
    arrive: 0.112,
  },
];
const DRAWER: [number, number] = [316, 219]; // global center of the open drawer

function SiblingDoc({ s }: { s: (typeof SIBLINGS)[number] }) {
  const [ox, oy] = s.origin;
  const [fx, fy] = s.flank;
  return (
    <g opacity="0">
      <Vis a={s.appear} b={s.filed - 0.004} r={0.014} />
      <animateTransform
        attributeName="transform"
        type="translate"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        calcMode="linear"
        values={`${ox} ${oy};${ox} ${oy};${fx} ${fy};${fx} ${fy};${DRAWER[0]} ${DRAWER[1]};${DRAWER[0]} ${DRAWER[1]}`}
        keyTimes={`0;${s.appear};${s.arrive};${s.leave};${s.filed};1`}
      />
      <animateTransform
        attributeName="transform"
        type="scale"
        additive="sum"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        calcMode="linear"
        values="0.3;0.3;0.62;0.62;0.2;0.2"
        keyTimes={`0;${s.appear};${s.arrive};${s.leave};${s.filed};1`}
      />
      <rect className="ill-paper" x="-32" y="-42" width="64" height="84" rx="3" />
      <line className="ill-ink" strokeWidth="2.2" x1="-22" y1="-28" x2="8" y2="-28" />
      {[-12, 2, 16, 30].map((y) => (
        <line key={y} className="ill-ink" x1="-22" y1={y} x2={y === 30 ? 8 : 22} y2={y} strokeWidth="1.4" />
      ))}
    </g>
  );
}

// paper halo so labels stay legible over the dashed reference arrows
const HALO: React.CSSProperties = {
  paintOrder: "stroke",
  stroke: "var(--color-paper)",
  strokeWidth: 5,
  strokeLinejoin: "round",
};

// the interaction beat: the documents cite and amend one another
function CrossRefs() {
  const on = 0.145;
  const off = 0.205;
  return (
    <g opacity="0">
      <animate
        attributeName="opacity"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        values="0;0;1;1;0;0"
        keyTimes={`0;${on};${on + 0.014};${off};${off + 0.012};1`}
      />
      <path className="ill-loop" d="M 572 185 C 600 195, 608 200, 622 210" markerEnd="url(#ill-ref-arr)" />
      <path className="ill-loop" d="M 580 312 C 604 305, 610 300, 622 292" markerEnd="url(#ill-ref-arr)" />
      <text className="ill-caption ill-caption--loop" style={HALO} x="548" y="216" textAnchor="middle">cites § 42</text>
      <text className="ill-caption ill-caption--loop" style={HALO} x="556" y="286" textAnchor="middle">amends § 42</text>
    </g>
  );
}

// ── the document, center stage ────────────────────────────────────────

const SERIF_LINES: Array<[number, number, number]> = [
  // [y, x1, x2] in doc-local coords (doc is 170×210 centered on origin)
  [-60, -65, 65],
  [-38, -65, 52],
  [-16, -65, 65],
];
const MORPH_LINES: Array<[number, number, number, number]> = [
  // [y, x1, x2, morphAt] — these three become code as the scan passes
  [6, -65, 60, 0.36],
  [28, -65, 65, 0.385],
  [50, -65, 44, 0.41],
];
const CODE_AT = ["snap = tfp", "- 0.03 * inc", "if inc > cap: 0"];
const CODE_FIXED = "- 0.30 * inc";
const REDRAFT = { flag: 0.545, strike: 0.555, gone: 0.585, fixed: 0.592, pass: 0.615 };

function TheDocument() {
  return (
    <g opacity="0">
      {/* slides from the portico, grows to center stage, shrinks into the book */}
      <animateTransform
        attributeName="transform"
        type="translate"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        calcMode="linear"
        values={`142 118;142 118;${CXC} ${CYC};${CXC} ${CYC}`}
        keyTimes="0;0.015;0.115;1"
      />
      <animateTransform
        attributeName="transform"
        type="scale"
        additive="sum"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        calcMode="linear"
        values="0.18;0.18;1;1;0.3;0.3"
        keyTimes="0;0.015;0.115;0.66;0.705;1"
      />
      <Vis a={0.006} b={0.7} r={0.015} />

      <rect className="ill-paper" x="-85" y="-105" width="170" height="210" rx="4" />
      {/* title */}
      <line className="ill-ink" strokeWidth="2.6" x1="-65" y1="-86" x2="5" y2="-86" />
      <text className="ill-code" style={{ fontSize: "11px" }} x="48" y="-82">{"§ 42"}</text>

      {SERIF_LINES.map(([y, x1, x2]) => (
        <line key={y} className="ill-ink" x1={x1} y1={y} x2={x2} y2={y} />
      ))}

      {/* the three operative lines: serif → code as the scan passes */}
      {MORPH_LINES.map(([y, x1, x2, at], i) => (
        <g key={y}>
          <line className="ill-ink" x1={x1} y1={y} x2={x2} y2={y} opacity="1">
            <animate
              attributeName="opacity"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              values="1;1;0;0;1"
              keyTimes={`0;${at};${at + 0.012};0.995;1`}
            />
          </line>
          {i === 1 ? (
            <>
              {/* the flawed draft: caught at the compare gate, redrafted */}
              <text className="ill-code" style={{ fontSize: "12.5px" }} x={x1} y={y + 4} opacity="0">
                {CODE_AT[1]}
                <animate
                  attributeName="opacity"
                  dur={`${CYCLE}s`}
                  repeatCount="indefinite"
                  values="0;0;1;1;0;0"
                  keyTimes={`0;${at + 0.008};${at + 0.02};${REDRAFT.gone};${REDRAFT.gone + 0.006};1`}
                />
              </text>
              <line className="ill-accent-line" strokeWidth="2.5" x1={x1 - 3} y1={y} x2={x1 + 78} y2={y} opacity="0">
                <animate
                  attributeName="opacity"
                  dur={`${CYCLE}s`}
                  repeatCount="indefinite"
                  values="0;0;1;1;0;0"
                  keyTimes={`0;${REDRAFT.strike};${REDRAFT.strike + 0.008};${REDRAFT.gone};${REDRAFT.gone + 0.006};1`}
                />
              </line>
              <text className="ill-code" style={{ fontSize: "12.5px" }} x={x1} y={y + 4} opacity="0">
                {CODE_FIXED}
                <animate
                  attributeName="opacity"
                  dur={`${CYCLE}s`}
                  repeatCount="indefinite"
                  values="0;0;1;1;0;0"
                  keyTimes={`0;${REDRAFT.fixed};${REDRAFT.fixed + 0.012};0.99;0.995;1`}
                />
              </text>
            </>
          ) : (
            <text className="ill-code" style={{ fontSize: "12.5px" }} x={x1} y={y + 4} opacity="0">
              {CODE_AT[i]}
              <animate
                attributeName="opacity"
                dur={`${CYCLE}s`}
                repeatCount="indefinite"
                values="0;0;1;1;0;0"
                keyTimes={`0;${at + 0.008};${at + 0.02};0.99;0.995;1`}
              />
            </text>
          )}
        </g>
      ))}

      {/* fingerprint stamped at capture */}
      <g opacity="0">
        <Vis a={0.145} b={0.7} r={0.015} />
        {[4, 8, 12].map((r) => (
          <circle key={r} className="ill-accent-line" cx="56" cy="80" r={r} fill="none" />
        ))}
      </g>

      {/* the encoding scan: amber line + magnifier sweeping down the page */}
      <g opacity="0">
        <Vis a={0.268} b={0.418} r={0.01} max={0.95} />
        <animateTransform
          attributeName="transform"
          type="translate"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          calcMode="linear"
          values="0 -72;0 -72;0 58;0 58"
          keyTimes="0;0.27;0.42;1"
        />
        <line className="ill-accent-line" strokeWidth="2" x1="-78" y1="0" x2="78" y2="0" />
        <circle className="ill-line" cx="92" cy="0" r="17" fill="rgba(146,64,14,0.05)" />
        <line className="ill-line" x1="104" y1="12" x2="116" y2="25" strokeWidth="4" />
      </g>
    </g>
  );
}

// ── the four gates, rising above the document ─────────────────────────

const GATE_LABELS = ["run", "checks", "compare", "review"];
const GATE_OK = [0.485, 0.515, REDRAFT.pass, 0.645];

function Gates() {
  return (
    <g opacity="0">
      <Vis a={0.44} b={0.66} r={0.018} />
      <animateTransform
        attributeName="transform"
        type="translate"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        calcMode="linear"
        values={`${CXC - 105} 72;${CXC - 105} 72;${CXC - 105} 52;${CXC - 105} 52`}
        keyTimes="0;0.44;0.47;1"
      />
      {GATE_LABELS.map((label, i) => {
        const x = i * 56;
        const ok = GATE_OK[i];
        return (
          <g key={label}>
            <path className="ill-line" d={`M ${x} 62 V 26 A 17 17 0 0 1 ${x + 34} 26 V 62`} fill="none" />
            <text className="ill-caption" x={x + 17} y="76" textAnchor="middle">
              {label}
            </text>
            {i === 2 && (
              // the failure: compare catches the flawed coefficient
              <text className="ill-check" style={{ fontSize: "15px", fill: "var(--color-accent)" }} x={x + 17} y="50" textAnchor="middle" opacity="0">
                ✗
                <animate
                  attributeName="opacity"
                  dur={`${CYCLE}s`}
                  repeatCount="indefinite"
                  values="0;0;1;1;0;0"
                  keyTimes={`0;${REDRAFT.flag};${REDRAFT.flag + 0.008};${REDRAFT.gone};${REDRAFT.gone + 0.006};1`}
                />
              </text>
            )}
            <text className="ill-check" style={{ fontSize: "15px" }} x={x + 17} y="50" textAnchor="middle" opacity="0">
              ✓
              <animate
                attributeName="opacity"
                dur={`${CYCLE}s`}
                repeatCount="indefinite"
                values="0;0;1;1;0;0"
                keyTimes={`0;${ok};${ok + 0.008};0.658;0.672;1`}
              />
            </text>
          </g>
        );
      })}
    </g>
  );
}

// ── the sealed book ───────────────────────────────────────────────────

function SealedBook() {
  return (
    <g opacity="0" transform={`translate(${CXC}, ${CYC})`}>
      <Vis a={0.69} b={0.955} r={0.015} />
      <rect className="ill-paper" x="-52" y="-66" width="104" height="132" rx="4" />
      <line className="ill-line" x1="-40" y1="-66" x2="-40" y2="66" />
      <line className="ill-ink" x1="-18" y1="-38" x2="30" y2="-38" strokeWidth="2.4" />
      <text className="ill-code" style={{ fontSize: "12px" }} x="-18" y="-12">{"§ ✓"}</text>
      {[48, 51].map((x) => (
        <line key={x} className="ill-ink" x1={x} y1="-60" x2={x} y2="60" strokeWidth="1" opacity="0.5" />
      ))}
      {/* the wax seal pops on */}
      <g opacity="0">
        <animate
          attributeName="opacity"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          values="0;0;1;1;0;0"
          keyTimes="0;0.728;0.74;0.952;0.965;1"
        />
        <animateTransform
          attributeName="transform"
          type="scale"
          additive="sum"
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
          calcMode="linear"
          values="0.6;0.6;1.25;1;1"
          keyTimes="0;0.728;0.738;0.746;1"
        />
        <polygon className="ill-accent-fill" points="18,34 27,58 22,54 18,60 14,54 9,58" />
        <circle className="ill-accent-fill" cx="18" cy="34" r="12" />
        <circle className="ill-paper" cx="18" cy="34" r="4.5" strokeWidth="0" />
      </g>
    </g>
  );
}

// ── the surfaces, and the copies that fly to them ─────────────────────

const DEVICES: Array<{ tx: number; ty: number; anchor: [number, number]; fly: number }> = [
  { tx: 1000, ty: 85, anchor: [1046, 118], fly: 0.795 }, // browser
  { tx: 1090, ty: 232, anchor: [1136, 258], fly: 0.815 }, // terminal
  { tx: 995, ty: 360, anchor: [1030, 388], fly: 0.835 }, // agent
];

function Devices() {
  return (
    <g>
      {/* browser */}
      <g opacity="0" transform={`translate(${DEVICES[0].tx}, ${DEVICES[0].ty})`}>
        <Vis a={0.775} b={0.95} r={0.015} />
        <rect className="ill-paper ill-line" x="0" y="0" width="92" height="62" rx="4" />
        <line className="ill-line" x1="0" y1="15" x2="92" y2="15" />
        <circle className="ill-ink" cx="9" cy="8" r="1.8" />
        <circle className="ill-ink" cx="16" cy="8" r="1.8" />
        {[30, 42].map((y) => (
          <line key={y} className="ill-ink" x1="10" y1={y} x2="66" y2={y} />
        ))}
      </g>
      {/* API terminal */}
      <g opacity="0" transform={`translate(${DEVICES[1].tx}, ${DEVICES[1].ty})`}>
        <Vis a={0.795} b={0.95} r={0.015} />
        <rect className="ill-dark" x="0" y="0" width="92" height="52" rx="4" />
        <text className="ill-code ill-code--onDark" style={{ fontSize: "11px" }} x="10" y="30">{"> $291 ▌"}</text>
      </g>
      {/* AI agent */}
      <g opacity="0" transform={`translate(${DEVICES[2].tx}, ${DEVICES[2].ty})`}>
        <Vis a={0.815} b={0.95} r={0.015} />
        <path
          className="ill-paper ill-line"
          d="M 6 14 h 52 a6 6 0 0 1 6 6 v 22 a6 6 0 0 1 -6 6 h -26 l -11 11 v -11 h -15 a6 6 0 0 1 -6 -6 v -22 a6 6 0 0 1 6 -6 Z"
        />
        <text className="ill-code" style={{ fontSize: "10px" }} x="13" y="33">{"§ cited"}</text>
        <line className="ill-line" x1="32" y1="14" x2="32" y2="6" />
        <circle className="ill-accent-fill" cx="32" cy="4" r="3" />
      </g>

      {/* three copies of the sealed rule fly out */}
      {DEVICES.map(({ anchor: [ax, ay], fly }, i) => {
        const t1 = fly + 0.06;
        const mx = (CXC + ax) / 2;
        return (
          <g key={i} opacity="0">
            <animateMotion
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              path={`M ${CXC + 40} ${CYC - 20} C ${mx} ${CYC - 90}, ${mx} ${ay - 40}, ${ax} ${ay}`}
              calcMode="linear"
              keyPoints="0;0;1;1"
              keyTimes={`0;${fly};${t1};1`}
            />
            <animate
              attributeName="opacity"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              values="0;0;1;1;0;0"
              keyTimes={`0;${fly};${fly + 0.008};${t1 - 0.004};${t1 + 0.008};1`}
            />
            <rect className="ill-paper" x="-9" y="-12" width="18" height="24" rx="2" strokeWidth="1.5" />
            <line className="ill-ink" x1="-5" y1="-5" x2="5" y2="-5" strokeWidth="1.2" />
            <line className="ill-ink" x1="-5" y1="1" x2="3" y2="1" strokeWidth="1.2" />
          </g>
        );
      })}

      {/* green arrival marks */}
      {DEVICES.map(({ anchor: [ax, ay], fly }, i) => (
        <circle key={i} cx={ax} cy={ay} r="3.4" fill="var(--color-success)" opacity="0">
          <animate
            attributeName="opacity"
            dur={`${CYCLE}s`}
            repeatCount="indefinite"
            values="0;0;1;1;0;0"
            keyTimes={`0;${fly + 0.058};${fly + 0.066};0.945;0.958;1`}
          />
        </circle>
      ))}
    </g>
  );
}

// ── captions & progress ───────────────────────────────────────────────

function Captions() {
  return (
    <g>
      {CAPTIONS.map(({ w, name, sub }) => (
        <g key={name} opacity="0">
          <Vis a={w[0]} b={w[1]} r={0.014} />
          <text className="ill-name" style={{ fontSize: "21px" }} x={CXC} y="468" textAnchor="middle">
            {name}
          </text>
          <text className="ill-caption" x={CXC} y="490" textAnchor="middle">
            {sub}
          </text>
        </g>
      ))}
      {/* six-beat progress row */}
      {CAPTIONS.map(({ w }, i) => {
        const x = CXC - 60 + i * 24;
        return (
          <g key={i}>
            <circle className="ill-line" strokeWidth="1.2" cx={x} cy="514" r="3.2" fill="none" opacity="0.55" />
            <circle cx={x} cy="514" r="3.2" fill="var(--color-accent)" opacity="0">
              <Vis a={w[0]} b={w[1]} r={0.01} />
            </circle>
          </g>
        );
      })}
    </g>
  );
}

// ── reduced-motion fallback: the story as one composed still ──────────

function StaticStory() {
  return (
    <svg className="ill" viewBox="0 0 1420 540" role="img" aria-label="The life of a rule: a published law is captured and fingerprinted, encoded into executable code, checked at four gates, sealed into the rulebook, and delivered to the web, the API, and AI agents.">
      <g transform={`translate(${CXC}, ${CYC})`}>
        <rect className="ill-paper" x="-85" y="-105" width="170" height="210" rx="4" />
        <line className="ill-ink" strokeWidth="2.6" x1="-65" y1="-86" x2="5" y2="-86" />
        <text className="ill-code" style={{ fontSize: "11px" }} x="48" y="-82">{"§ 42"}</text>
        {SERIF_LINES.map(([y, x1, x2]) => (
          <line key={y} className="ill-ink" x1={x1} y1={y} x2={x2} y2={y} />
        ))}
        <text className="ill-code" style={{ fontSize: "12.5px" }} x="-65" y="10">{CODE_AT[0]}</text>
        <text className="ill-code" style={{ fontSize: "12.5px" }} x="-65" y="32">{CODE_FIXED}</text>
        <text className="ill-code" style={{ fontSize: "12.5px" }} x="-65" y="54">{CODE_AT[2]}</text>
        {[4, 8, 12].map((r) => (
          <circle key={r} className="ill-accent-line" cx="56" cy="80" r={r} fill="none" />
        ))}
      </g>
      <g transform={`translate(${CXC - 105}, 52)`}>
        {GATE_LABELS.map((label, i) => {
          const x = i * 56;
          return (
            <g key={label}>
              <path className="ill-line" d={`M ${x} 62 V 26 A 17 17 0 0 1 ${x + 34} 26 V 62`} fill="none" />
              <text className="ill-check" style={{ fontSize: "15px" }} x={x + 17} y="50" textAnchor="middle">✓</text>
              <text className="ill-caption" x={x + 17} y="76" textAnchor="middle">{label}</text>
            </g>
          );
        })}
      </g>
      <text className="ill-name" style={{ fontSize: "21px" }} x={CXC} y="468" textAnchor="middle">
        From published law to a rule you can trust
      </text>
      <text className="ill-caption" x={CXC} y="490" textAnchor="middle">
        publish · capture · encode · check · seal · deliver — web · API · AI agents
      </text>
    </svg>
  );
}

export function IllustratedFlow() {
  if (REDUCED_MOTION) {
    return (
      <div className="ill__wrap">
        <StaticStory />
      </div>
    );
  }
  return (
    <div className="ill__wrap">
      <svg
        className="ill"
        viewBox="0 0 1420 540"
        role="img"
        aria-label="The life of a rule, as a looping film: a page slides out of the publisher's portico, is fingerprinted and filed, its text morphs into executable code, four gates stamp their checks — one failure is redrafted in place — the page is sealed into the rulebook, and copies fly out to the web, the API, and AI agents."
      >
        <defs>
          <marker id="ill-ref-arr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5.5" markerHeight="5.5" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="rgba(146,64,14,0.6)" />
          </marker>
        </defs>
        <Sources />
        <Corpus />
        {SIBLINGS.map((s, i) => (
          <SiblingDoc key={i} s={s} />
        ))}
        <CrossRefs />
        <TheDocument />
        <Gates />
        <SealedBook />
        <Devices />
        <Captions />
      </svg>
    </div>
  );
}
