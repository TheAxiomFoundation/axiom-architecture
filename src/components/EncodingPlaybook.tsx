type Section = {
  kicker: string;
  title: string;
  blocks: Block[];
};

type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "code"; lang?: string; text: string }
  | { kind: "callout"; tone: "blocker" | "note"; text: string };

const SECTIONS: Section[] = [
  {
    kicker: "§ 00",
    title: "What this is",
    blocks: [
      {
        kind: "p",
        text: "A working playbook for taking a state benefit program end-to-end through the Axiom stack. Worked example: CalFresh (California SNAP). Honest about what works today and what is blocked. Updated as we hit each stage in production.",
      },
      {
        kind: "callout",
        tone: "note",
        text: "End-to-end means: source text in corpus → encoded RuleSpec YAML → compiled ProgramSpec → executable runner → oracle validation. Five stages. CalFresh is currently blocked at stage 1.",
      },
    ],
  },
  {
    kicker: "§ 01",
    title: "Pipeline overview",
    blocks: [
      {
        kind: "p",
        text: "The pipeline is one direction. You cannot encode a rule whose source text is not in corpus — axiom-encode hard-stops if the citation does not resolve to a corpus.provisions row. So source ingest is always step one.",
      },
      {
        kind: "code",
        text: `source PDF/XML/HTML
   ↓  (axiom-scrapers, axiom-corpus-ingest extractor)
corpus.provisions  (Supabase + JSONL artifacts)
   ↓  (axiom-encode encode "CITATION")
candidate RuleSpec YAML  (in /tmp staging)
   ↓  (axiom-encode encode --apply)
rulespec-us-{state}/  (signed apply manifest under .axiom/encoding-manifests/)
   ↓  (axiom-rules-engine cargo run -- compile)
compiled ProgramSpec JSON
   ↓  (cargo run -- run-compiled < request.json)
benefit calculation result
   ↓  (axiom-encode snap-ecps-compare --jurisdiction us-{state})
PolicyEngine oracle delta report`,
      },
      {
        kind: "p",
        text: "Each arrow is a real command. Each artifact has a real on-disk location. Nothing about this is implicit — but several pieces require pieces that are not yet wired for California specifically.",
      },
    ],
  },
  {
    kicker: "§ 02",
    title: "Stage 1 — Source text in corpus",
    blocks: [
      {
        kind: "p",
        text: "California SNAP rules live across three primary surfaces:",
      },
      {
        kind: "ul",
        items: [
          "Federal: 7 USC 2011–2036 and 7 CFR 273 — already in corpus, inherited by every state.",
          "CA statutes: Welfare & Institutions Code §18900 et seq. (CalFresh enabling statute, vehicle exclusion in §18901.1, BBCE in §18901.10). Not in corpus.",
          "CA regulations: CDSS MPP §63 (the operational manual — eligibility, deductions, allotments, work rules) plus periodic ACL/ACIN guidance letters. Not in corpus for SNAP; we have four CalWORKs ACLs only.",
        ],
      },
      {
        kind: "callout",
        tone: "blocker",
        text: "Today axiom-corpus has zero CalFresh-specific source text. The four CA documents in manifests/us-ca-cdss-acl-guidance.yaml are all CalWORKs (TANF) topics: vehicle_value_limit, maximum_resource_limit, maximum_aid_payment, standard_medical_deduction. No MPP §63, no W&I Code §18900s.",
      },
      {
        kind: "h",
        text: "What ingestion would look like",
      },
      {
        kind: "p",
        text: "Two new manifests, run through axiom-corpus-ingest extract-official-documents, then load-supabase. Each produces source rows in corpus.provisions plus an R2 mirror.",
      },
      {
        kind: "code",
        lang: "yaml",
        text: `# manifests/us-ca-wic-snap-statutes.yaml
documents:
  - source_id: ca-wic-18901.1
    jurisdiction: us-ca
    document_class: statute
    citation_path: us-ca/statute/wic/18901-1
    title: CA Welfare & Institutions Code §18901.1 — Vehicle exclusion
    source_url: https://leginfo.legislature.ca.gov/...
    # …per-section entries for §18900–18906, §18901.10, etc.

# manifests/us-ca-cdss-mpp-calfresh.yaml
documents:
  - source_id: ca-mpp-63-501
    jurisdiction: us-ca
    document_class: regulation
    citation_path: us-ca/regulation/mpp/63-501
    title: CDSS MPP §63-501 — CalFresh Standards of Eligibility
    source_url: https://cdss.ca.gov/...`,
      },
      {
        kind: "p",
        text: "Run:",
      },
      {
        kind: "code",
        text: `uv run axiom-corpus-ingest extract-official-documents \\
  --base data/corpus \\
  --version fy-2026 \\
  --manifest manifests/us-ca-cdss-mpp-calfresh.yaml

uv run axiom-corpus-ingest sync-r2 \\
  --base data/corpus --jurisdiction us-ca \\
  --document-class regulation --version fy-2026 --apply

uv run axiom-corpus-ingest load-supabase \\
  --provisions data/corpus/provisions/us-ca/regulation-fy-2026.jsonl`,
      },
      {
        kind: "callout",
        tone: "note",
        text: "Cost of doing this properly: building a CDSS MPP scraper is real work — MPP is ~2,000 pages of mixed-format content. The lighter near-term path is W&I Code only (clean HTML on leginfo.legislature.ca.gov, comparable scraper to what already exists for other states).",
      },
    ],
  },
  {
    kicker: "§ 03",
    title: "Stage 2 — Encoding (it is AI-driven, not hand-written)",
    blocks: [
      {
        kind: "p",
        text: "Production encoding does not work by writing YAML by hand. axiom-encode resolves the citation, calls a model (Codex GPT-5.5 today), generates the RuleSpec, validates it, and writes a signed manifest. Hand-editing live RuleSpec is explicitly disallowed.",
      },
      {
        kind: "code",
        text: `axiom-encode encode "CA W&I Code 18901.1" \\
  --output /tmp/axiom-encode-encodings

# Inspect the candidate
ls /tmp/axiom-encode-encodings/codex-gpt-5.5/statutes/wic/18901-1.yaml
ls /tmp/axiom-encode-encodings/codex-gpt-5.5/statutes/wic/18901-1.test.yaml

# Apply (writes signed manifest under .axiom/encoding-manifests/)
export AXIOM_ENCODE_APPLY_SIGNING_KEY=...
axiom-encode encode "CA W&I Code 18901.1" --apply`,
      },
      {
        kind: "p",
        text: "Each apply writes a sidecar JSON manifest with: applied file paths, SHA256 hashes, axiom_encode_version, model name, run_id, and an HMAC signature. That manifest is what makes the encoding auditable.",
      },
      {
        kind: "h",
        text: "Why this matters for the design",
      },
      {
        kind: "p",
        text: "Earlier I assumed encoding was a developer activity. It is not — it is an orchestrated model call with cryptographically signed provenance. The encoder is the bottleneck because each apply requires source text, a working model, a valid signing key, and human review of the candidate before --apply. The leverage is in the model and the source coverage, not in adding more developers.",
      },
    ],
  },
  {
    kicker: "§ 04",
    title: "Stage 3 — Composition module (the state benefit calc)",
    blocks: [
      {
        kind: "p",
        text: "A state SNAP program is not a single rule. It is a composition module that imports federal rules and adds state-specific overrides. Compare the NY equivalent: policies/otda/snap/fy-2026-benefit-calculation.yaml imports ~17 federal rule modules and ~10 NY-specific regulation modules, then composes them into a snap_eligible / snap_allotment pair.",
      },
      {
        kind: "p",
        text: "The CA equivalent would live at:",
      },
      {
        kind: "code",
        text: "rulespec-us-ca/policies/cdss/calfresh/fy-2026-benefit-calculation.yaml",
      },
      {
        kind: "p",
        text: "Skeleton (this would be generated by axiom-encode, not hand-written, but here is the shape):",
      },
      {
        kind: "code",
        lang: "yaml",
        text: `format: rulespec/v1
module:
  kind: composition
  summary: |-
    California CalFresh FY 2026 benefit calculation. Imports federal SNAP
    rules from rulespec-us and overlays CA-specific divergences:
    BBCE at 200% FPL gross income, full vehicle exclusion, CA standard
    utility allowances, Heat & Eat.
  source_verification:
    corpus_citation_path: us-ca/regulation/mpp/63-501

imports:
  # Federal rules (inherited, not redefined)
  - us:policies/usda/snap/fy-2026-cola/maximum-allotments
  - us:policies/usda/snap/fy-2026-cola/deductions
  - us:policies/usda/snap/fy-2026-cola/income-eligibility-standards
  - us:regulations/7-cfr/273/3   # residency
  - us:regulations/7-cfr/273/4   # citizenship
  - us:regulations/7-cfr/273/8   # resources
  - us:regulations/7-cfr/273/10  # income computation
  - us:statutes/7/2014/e/2       # earned income deduction
  - us:statutes/7/2014/e/6/A     # net income
  - us:statutes/7/2017/a         # allotment

  # CA divergences (state-specific)
  - us-ca:statutes/wic/18901-1   # vehicle exclusion
  - us-ca:statutes/wic/18901-10  # BBCE at 200% FPL
  - us-ca:regulations/mpp/63-503 # standard utility allowances

rules:
  - name: snap_gross_income_eligible
    kind: derived
    entity: Household
    dtype: Judgment
    period: Month
    source: CA CalFresh — BBCE 200% FPL override
    versions:
      - effective_from: '2025-10-01'
        formula: |-
          snap_gross_monthly_income <= ca_bbce_gross_income_limit_200_fpl

  - name: snap_eligible
    kind: derived
    entity: Household
    dtype: Judgment
    period: Month
    source: CA CalFresh FY 2026 composition
    versions:
      - effective_from: '2025-10-01'
        formula: |-
          snap_gross_income_eligible
          and snap_resource_eligible
          and snap_residency_citizenship_eligible
          and snap_ssn_eligible
          and snap_work_requirement_eligible

  - name: snap_allotment
    kind: derived
    entity: Household
    dtype: Money
    period: Month
    unit: USD
    source: CA CalFresh FY 2026 composition
    versions:
      - effective_from: '2025-10-01'
        formula: |-
          if snap_eligible:
              snap_regular_month_allotment
          else: 0`,
      },
      {
        kind: "callout",
        tone: "note",
        text: "Important convention from the NY case: state-level composition modules do not redefine federal rules. They import them by repo:path identifier. The composition only adds rules that meaningfully diverge. This keeps state repos small and forces federal logic to live in exactly one place.",
      },
    ],
  },
  {
    kicker: "§ 05",
    title: "Stage 4 — Companion tests",
    blocks: [
      {
        kind: "p",
        text: "Every .yaml has a sibling .test.yaml. Tests are deterministic: a household input, an expected output, both keyed by durable legal IDs (us-ca:policies/cdss/calfresh/fy-2026-benefit-calculation#snap_allotment, etc.).",
      },
      {
        kind: "code",
        lang: "yaml",
        text: `- name: ca_household_size_1_with_min_income_eligible
  period: 2026-01
  input:
    us:policies/usda/snap/fy-2026-cola/maximum-allotments#input.household_size: 1
    us:regulations/7-cfr/273/10#input.snap_countable_earned_income: 800
    us:regulations/7-cfr/273/10#input.snap_countable_unearned_income: 0
    us:regulations/7-cfr/273/8#input.snap_countable_financial_resources: 0
    us:regulations/7-cfr/273/3#input.household_lives_in_application_state: true
    us-ca:statutes/wic/18901-1#input.household_vehicle_value: 15000
    us:statutes/7/2012/j#relation.member_of_household:
      - us:regulations/7-cfr/273/4#input.member_is_us_citizen: true
        us:regulations/7-cfr/273/7#input.member_age: 35
  output:
    us-ca:policies/cdss/calfresh/fy-2026-benefit-calculation#snap_eligible: holds
    us-ca:policies/cdss/calfresh/fy-2026-benefit-calculation#snap_allotment: 298`,
      },
      {
        kind: "p",
        text: "Tests run during axiom-encode --apply (validation gate) and again in repository CI. They also feed the explain runner for trace inspection.",
      },
    ],
  },
  {
    kicker: "§ 06",
    title: "Stage 5 — Compile and execute",
    blocks: [
      {
        kind: "p",
        text: "axiom-rules-engine (Rust) is the executor. Today it is a CLI invoked by subprocess.",
      },
      {
        kind: "code",
        text: `# Compile (resolves all imports across rulespec-us and rulespec-us-ca)
export AXIOM_RULESPEC_REPO_ROOTS=~/rulespec-us:~/rulespec-us-ca
cd ~/axiom-rules-engine
cargo run -- compile \\
  --program ~/rulespec-us-ca/policies/cdss/calfresh/fy-2026-benefit-calculation.yaml \\
  --output /tmp/calfresh.compiled.json

# Run
cargo run -- run-compiled --artifact /tmp/calfresh.compiled.json < request.json`,
      },
      {
        kind: "p",
        text: "Request JSON keys every input by durable legal ID. Outputs are returned in the same scheme, with explain traces if mode is explain.",
      },
      {
        kind: "code",
        lang: "json",
        text: `{
  "mode": "explain",
  "dataset": {
    "inputs": [
      {
        "name": "us:policies/usda/snap/fy-2026-cola/maximum-allotments#input.household_size",
        "entity": "Household",
        "entity_id": "household:1",
        "interval": { "start": "2026-01-01", "end": "2026-02-01" },
        "value": { "kind": "integer", "value": 1 }
      }
    ]
  },
  "queries": [{
    "entity_id": "household:1",
    "period": { "period_kind": "month", "start": "2026-01-01", "end": "2026-02-01" },
    "outputs": [
      "us-ca:policies/cdss/calfresh/fy-2026-benefit-calculation#snap_eligible",
      "us-ca:policies/cdss/calfresh/fy-2026-benefit-calculation#snap_allotment"
    ]
  }]
}`,
      },
    ],
  },
  {
    kicker: "§ 07",
    title: "Stage 6 — Oracle validation",
    blocks: [
      {
        kind: "p",
        text: "The validation hook I previously flagged as \"NotImplementedError\" is actually wired — in axiom-encode, not in axiom-programs/axiom-oracles. Specifically, axiom-encode snap-ecps-compare. NY's CI runs:",
      },
      {
        kind: "code",
        text: `axiom-encode snap-ecps-compare \\
  --jurisdiction us-ny \\
  --workspace-root "${'$'}{{ github.workspace }}" \\
  --utility-projection policyengine-type \\
  --positive-snap-only \\
  --sample-size 20 \\
  --max-differences 20 \\
  --fail-on-mismatch`,
      },
      {
        kind: "p",
        text: "It draws PolicyEngine eCPS records, runs both engines on each, compares SNAP allotments, fails the build on N+ mismatches. Smoke (20 households) on every PR, full run on weekly cron.",
      },
      {
        kind: "p",
        text: "For CA: identical workflow, swap --jurisdiction us-ca. Workflow file goes in rulespec-us-ca/.github/workflows/policyengine-oracle.yml — copy from rulespec-us-ny verbatim, replace jurisdiction code.",
      },
      {
        kind: "callout",
        tone: "note",
        text: "Correction to earlier architectural note: the runner does exist for SNAP. It lives in axiom-encode, not in the validation framework I expected. This means the existence of validation is conditional on axiom-encode building a per-program comparator. SNAP has one. Other programs (TANF, Medicaid, EITC) presumably do not yet.",
      },
    ],
  },
  {
    kicker: "§ 08",
    title: "Stage 7 — CI wiring",
    blocks: [
      {
        kind: "p",
        text: "Two workflows live in every rulespec-us-* repo:",
      },
      {
        kind: "ul",
        items: [
          ".github/workflows/repository-checks.yml — invokes a shared validate-rulespec workflow from TheAxiomFoundation/.github. Runs on every push/PR.",
          ".github/workflows/policyengine-oracle.yml — program-specific oracle comparison. NY has this for SNAP. CA does not have it yet (only the generic checks).",
        ],
      },
      {
        kind: "p",
        text: "After CA SNAP encoding lands, the missing addition is the policyengine-oracle.yml file. One file, copied from rulespec-us-ny with two find-replaces.",
      },
    ],
  },
  {
    kicker: "§ 09",
    title: "What blocks CalFresh today",
    blocks: [
      {
        kind: "ul",
        items: [
          "Source coverage in corpus is essentially zero for CalFresh. axiom-encode will hard-stop on every citation. This is the gating constraint — everything else is downstream.",
          "No CDSS MPP scraper in axiom-scrapers. Either build one or scope down to W&I Code (cleaner HTML on leginfo.legislature.ca.gov, smaller surface).",
          "rulespec-us-ca has no oracle workflow. Trivial copy from rulespec-us-ny once encoding lands.",
          "AXIOM_ENCODE_APPLY_SIGNING_KEY is required for any --apply. Operator infra question, not a code change.",
        ],
      },
    ],
  },
  {
    kicker: "§ 10",
    title: "Suggested order of operations",
    blocks: [
      {
        kind: "ul",
        items: [
          "1. Pick scope: W&I Code §18900–18906 + §18901.1 + §18901.10 (the statutes). Cheapest source ingest path; covers vehicle exclusion and BBCE — the two biggest CA divergences.",
          "2. Author a manifest us-ca-wic-calfresh.yaml in axiom-corpus. Run extract-official-documents → sync-r2 → load-supabase.",
          "3. Run axiom-encode encode \"CA W&I Code 18901.1\" --apply for each WIC section. Review and approve candidates.",
          "4. Run axiom-encode encode \"CA CalFresh FY 2026 benefit calculation composition\" --apply to produce the policies/cdss/calfresh/fy-2026-benefit-calculation.yaml composition module.",
          "5. Copy rulespec-us-ny/.github/workflows/policyengine-oracle.yml into rulespec-us-ca, change us-ny → us-ca.",
          "6. Watch the first oracle smoke run. Triage mismatches. Expect a 5–20% miss rate on first pass; iterate.",
          "7. Once smoke is green, expand to MPP §63 (the real CalFresh manual). This is the long tail — work requirements, deductions, special households, ABAWD waivers.",
        ],
      },
      {
        kind: "callout",
        tone: "note",
        text: "Realistic timeline: a competent operator with axiom-encode access and PolicyEngine familiarity could get CA SNAP statutes encoded and passing a 20-household smoke against PolicyEngine in roughly 1–2 weeks of focused work. Full MPP §63 coverage is months — comparable to the NY effort, which is still incomplete.",
      },
    ],
  },
  {
    kicker: "§ 11",
    title: "Learnings from the recon",
    blocks: [
      {
        kind: "ul",
        items: [
          "The encoder is hardened. Signed apply manifests, refusal to install without a signing key, hard-stop on missing source — production-grade. Not the casual model-call I assumed.",
          "Validation lives in axiom-encode, not in axiom-oracles. The split is per-program: SNAP has snap-ecps-compare. The architectural model in the viewer (\"axiom-oracles does validation\") is partially wrong. Other programs would need a per-program comparator before they get the same treatment.",
          "State repo size is small by design — composition modules import federal rules wholesale and only encode divergences. The NY SNAP module is ~30 imports and ~6 derived rules. CA should be similar.",
          "Repo naming is inconsistent: GitHub canonical names are rulespec-us-* but local checkouts and several docs use rules-us-* (and axiom-rules-engine vs axiom-rules). Worth reconciling before more state repos populate. (Same drift the architecture critique flagged — but now with concrete evidence.)",
          "Source-first is enforced. No corpus row → no encoding. This is the architectural commitment that makes coverage talk honest. Honor it.",
        ],
      },
    ],
  },
];

export function EncodingPlaybook() {
  return (
    <article className="notes">
      <header className="notes__header">
        <div className="eyebrow">internal · encoding playbook</div>
        <h1 className="heading-section">CalFresh end-to-end</h1>
        <p>
          A working playbook for taking a state benefit program through every
          stage of the Axiom pipeline, with California SNAP (CalFresh) as the
          worked example. Captures the real commands, the conventions to
          follow, and the places where the system is currently blocked.
        </p>
      </header>

      <div className="notes__body">
        {SECTIONS.map((section) => (
          <section key={section.kicker} className="notes__section">
            <div className="notes__section-kicker">{section.kicker}</div>
            <h2 className="notes__section-title">{section.title}</h2>
            <div className="notes__section-body">
              {section.blocks.map((block, i) => {
                if (block.kind === "h") {
                  return (
                    <h3 key={i} className="notes__h">
                      {block.text}
                    </h3>
                  );
                }
                if (block.kind === "p") {
                  return (
                    <p key={i} className="notes__p">
                      {block.text}
                    </p>
                  );
                }
                if (block.kind === "ul") {
                  return (
                    <ul key={i} className="notes__ul">
                      {block.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  );
                }
                if (block.kind === "code") {
                  return (
                    <pre key={i} className="notes__code">
                      <code>{block.text}</code>
                    </pre>
                  );
                }
                return (
                  <div
                    key={i}
                    className={`notes__callout notes__callout--${block.tone}`}
                  >
                    {block.text}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
