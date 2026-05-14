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
        text: "End-to-end means: source text in corpus → encoded RuleSpec YAML → compiled ProgramSpec → executable runner → oracle validation. Five stages. As of 2026-05-12 the CalFresh source text is now in corpus locally (stage 1 done in dev — see § 12). Stages 2–5 still pending production credentials.",
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
          "CA statutes: Welfare & Institutions Code §18900 et seq. (CalFresh enabling statute and most state-level divergences). Adapter already exists in axiom-corpus (california-codes-bulk) — extraction just had not been run for SNAP-relevant slices.",
          "CA regulations: CDSS MPP §63 (the operational manual — eligibility, deductions, allotments, work rules) plus periodic ACL/ACIN guidance letters. Still not in corpus for SNAP; would require a new MPP adapter.",
        ],
      },
      {
        kind: "callout",
        tone: "note",
        text: "Update 2026-05-12: ran california-codes-bulk against the leginfo bulk ZIP. WIC code extracted in full — 7,948 provisions (848 containers + 7,100 leaf sections), zero errors. All CalFresh-relevant §189xx sections present with real body text. See § 12 for the full transcript.",
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
      {
        kind: "h",
        text: "When do we need a new adapter?",
      },
      {
        kind: "p",
        text: "Decision tree, in order. Stop at the first match — most often you don't need new code.",
      },
      {
        kind: "ul",
        items: [
          "1. A manifest already covers this source? Use it. (CA W&I Code → california-codes-bulk existed; the work was just running it.)",
          "2. An existing adapter covers the same format from a different jurisdiction? Extend its manifest. (Justia state code patterns work across many states with config-only changes.)",
          "3. The source shares a format with one we handle but the URL or structure differs? New manifest entry, no new code. (Most state statutes that publish USLM-style XML fall here.)",
          "4. The format itself is genuinely new — different publisher, different schema, custom PDF layout, agency manual in a one-off DOCX template, an overlay model where ACL/ACIN letters supersede portions of a base manual → New adapter required.",
        ],
      },
      {
        kind: "callout",
        tone: "note",
        text: "Concrete signal: when authoring a new manifest, look at the adapter: field. If you can put an existing adapter name there, you don't need new code. If you can't, you do.",
      },
      {
        kind: "h",
        text: "Adapter precedents — model new work on these",
      },
      {
        kind: "p",
        text: "Before writing a new adapter, find the closest existing one. axiom-corpus already has 35+ adapters covering most US states. The repo's loose convention is:",
      },
      {
        kind: "ul",
        items: [
          "State statute adapters live in src/axiom_corpus/corpus/state_adapters/<state>.py (one file per state).",
          "State regulation adapters live flat in src/axiom_corpus/corpus/<state>.py or <regulation-system>.py (one file per system).",
          "Format-specific parsing logic lives in src/axiom_corpus/parsers/us_<st>/{statutes,regulations}.py.",
          "Each adapter is registered in cli.py via an alias map (e.g., \"california-codes-bulk\") and gets its own extract-<name> CLI subcommand.",
        ],
      },
      {
        kind: "h",
        text: "Direct precedents for an MPP §63 adapter",
      },
      {
        kind: "ul",
        items: [
          "src/axiom_corpus/corpus/nycrr.py — NY Codes, Rules and Regulations. Handles 18 NYCRR 387 (NY SNAP). Same structural role as MPP §63: state operational rules implementing federal SNAP. NY already runs this through to an encoded RuleSpec + PolicyEngine oracle. Highest-fidelity precedent.",
          "src/axiom_corpus/corpus/colorado.py — Colorado regulations including 10 CCR 2506-1 (CO SNAP). Mature, end-to-end-encoded jurisdiction (see rulespec-us-co/policies/cdhs/snap/). Second-closest precedent.",
          "manifests/us-tx-texas-works-manual.yaml — Texas Works Manual. Direct structural twin of MPP: state agency operational manual covering SNAP/TANF administration. Closest precedent in *manifest* form. Worth reading before authoring us-ca-cdss-mpp-calfresh.yaml.",
          "manifests/us-dc-child-care-subsidy-manual.yaml — DC operational manual. Different program but same source pattern (PDF-published state agency manual).",
        ],
      },
      {
        kind: "callout",
        tone: "note",
        text: "Practical recommendation: read nycrr.py end-to-end before designing california_mpp.py. NY's SNAP encoding is the existing case where the full corpus → RuleSpec → PolicyEngine oracle loop closes — and the corpus side of that loop is nycrr.py. Mirror its conventions for citation_path layout, parent/child hierarchy, version handling, and inventory emission. Less invention, more imitation.",
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
  - us-ca:statutes/wic/18901-9   # vehicle resource value alignment
  - us-ca:statutes/wic/18901-09  # CalFresh income exclusions
  - us-ca:statutes/wic/18901-2   # SUA via energy assistance
  - us-ca:statutes/wic/18901-10  # face-to-face interview exemption
  - us-ca:statutes/wic/18901-12  # student exemption (refs 7 CFR 273.5)

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
          "Source coverage in corpus is local-only — the WIC JSONL is on disk but data/ is gitignored. To make it live: sync-r2 (needs R2 credentials) and load-supabase (needs Supabase write credentials).",
          "No CDSS MPP scraper exists. WIC statutes alone don't cover everything operators apply (deduction tables, ABAWD waiver geographies, county-level options). MPP §63 ingestion is a real-work item.",
          "rulespec-us-ca has no oracle workflow. Trivial copy from rulespec-us-ny once encoding lands.",
          "AXIOM_ENCODE_APPLY_SIGNING_KEY is required for any --apply. Operator infra question, not a code change.",
          "Dependency lockfile is wedged on Python 3.14 + macOS. uv.lock pins pyroaring 1.0.3 (no 3.14 wheels and source build fails on Apple clang 17). Working installs use Python 3.14 + pip install --prefer-binary, which floats pyroaring to 1.1.0 (3.14 wheels exist). Worth fixing the lockfile.",
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
    title: "How do we know an adapter works?",
    blocks: [
      {
        kind: "p",
        text: "An adapter that runs without raising is not the same as an adapter that produced correct data. Four levels of confidence — each one stronger than the last. Don't skip levels.",
      },
      {
        kind: "h",
        text: "Level 1 — Self-reported success",
      },
      {
        kind: "p",
        text: "The adapter emits a StateStatuteExtractReport (or equivalent for regulations). Acceptance gates:",
      },
      {
        kind: "ul",
        items: [
          "error_count == 0 and errors is empty",
          "coverage_complete: true",
          "missing_count == 0 (every source section it expected to find was found)",
          "extra_count == 0 (no orphan rows emitted)",
          "matched_count > 0 and matches the inventory length",
          "provision_count == matched_count + container_count",
        ],
      },
      {
        kind: "p",
        text: "Example from the CA WIC run on 2026-05-12: error_count 0, missing 0, extra 0, matched 7,948, sections 7,100, containers 848. Necessary but not sufficient — an adapter can hit all these counters and still emit garbage bodies.",
      },
      {
        kind: "h",
        text: "Level 2 — Schema and shape checks",
      },
      {
        kind: "ul",
        items: [
          "Every row has a non-null citation_path matching the expected jurisdiction pattern (us-ca/statute/wic/... here).",
          "Every \"section\" kind row has a non-empty body (no silent text loss).",
          "Containers (\"code\", \"division\", \"part\", \"chapter\", \"article\") have heading but null body — by design.",
          "Heading and identifiers serialize as valid JSON, no encoding artifacts (e.g., literal \\u escapes leaking through).",
          "Kind distribution looks like the source's actual structure (CA WIC: 14,200 sections, 448 articles, 328 chapters, 21 divisions — matches the expected legal hierarchy).",
        ],
      },
      {
        kind: "h",
        text: "Level 3 — Byte-level spot check against the canonical source",
      },
      {
        kind: "p",
        text: "Pick 3–5 known sections, fetch the canonical text from the source-of-truth website (leginfo for CA, NY Open Legislation for NYS, Justia/eCFR for federal, etc.), and diff. Body text should match byte-for-byte after normalizing whitespace.",
      },
      {
        kind: "code",
        text: `# CA WIC §18901.9 (vehicle exclusion) on 2026-05-12
adapter body  → "(a) For the purpose of eligibility under this chapter,
                 the rules governing the resource value of motor vehicles
                 shall be aligned with an alternative program allowed
                 under federal food stamp law…"

leginfo body  → "(a) For the purpose of eligibility under this chapter,
                 the rules governing the resource value of motor vehicles
                 shall be aligned with an alter…" (truncated in render)

Result: identical. Section number prefix correctly split into heading,
operative text correctly placed in body.`,
      },
      {
        kind: "p",
        text: "Pick sections at different depths in the hierarchy: one top-level container, one mid-level chapter, one deeply nested subsection. Pick at least one section with weird characters (quotes, em-dashes, footnote markers). Pick at least one recently amended section to confirm the version handling is right.",
      },
      {
        kind: "callout",
        tone: "blocker",
        text: "Worked example — CA MPP §63, 2026-05-12. First-pass spot check on 5 subsections returned 1/5 byte matches. Four of the five extracted bodies were 5–50× longer than canonical text. Root cause was a regex that required title-cased subsection headers (\".21 Screening\") but missed sentence-form subsections (\".31 The CWD shall not deny eligibility...\"), folding those into the parent body. Without the spot check, we would have published 175 corrupted rows into corpus.provisions. Levels 1 and 2 both passed cleanly during the same run: coverage_complete: true, zero duplicates, zero missing, zero extras. matched_count is a citation-path set check. It says nothing about whether the body text in those rows is correct.",
      },
      {
        kind: "p",
        text: "After the regex fix, the spot check returned 5/5 and the provision count went from 175 to 559 — the deep .NN and .NNN subsections that had been silently absorbed into their parents now surfaced as their own rows. Be ready to explain large deltas after a parser change; they're usually the right thing.",
      },
      {
        kind: "h",
        text: "Level 3.5 — Cross-version stability",
      },
      {
        kind: "p",
        text: "Re-run the adapter against a newer source release. Two invariants must hold:",
      },
      {
        kind: "ul",
        items: [
          "Sections that were NOT amended produce identical row content — same id (deterministic UUID5 from citation_path), same body, same sha256 of the body. Idempotency under non-change.",
          "Sections that WERE amended produce predictable diffs — same citation_path, new version_date, new body content, new sha256. The row history should let consumers detect what changed.",
        ],
      },
      {
        kind: "p",
        text: "Why it matters: if non-amended sections drift between runs (whitespace normalization, header reformatting, character encoding choices vary), the parser is sensitive to upstream cosmetic changes. Future amendments will then produce false diffs — every release will look like everything changed — and you lose the ability to detect real legal changes. This is silently catastrophic for change-detection consumers.",
      },
      {
        kind: "p",
        text: "Cheap test: extract the same source twice (same input, same version), confirm byte-equal JSONL outputs. Then extract a slightly older release (e.g., previous year's leginfo bulk) and confirm only amended sections diff.",
      },
      {
        kind: "h",
        text: "Level 4 — Downstream consumer accepts the output",
      },
      {
        kind: "p",
        text: "The final proof: axiom-encode can resolve a citation, axiom-encode --apply produces RuleSpec, axiom-rules-engine compiles, axiom-encode snap-ecps-compare matches PolicyEngine on a real household. If all four stages downstream of corpus accept the adapter's rows without error, the adapter is functionally correct for the purpose it serves.",
      },
      {
        kind: "p",
        text: "Anything short of Level 4 leaves room for surprise. NY's SNAP encoding has closed this loop — that's the strongest existence proof we have for any state. CA is at Level 3 for WIC statutes as of 2026-05-12.",
      },
      {
        kind: "h",
        text: "Anti-patterns",
      },
      {
        kind: "ul",
        items: [
          "Trusting matched_count alone — an adapter can match 100% of expected sections and still corrupt every body.",
          "Skipping the byte diff for \"obviously simple\" sources — the CA leginfo bulk has 14,200 amendment-versioned sections and silent parser bugs are easy to ship.",
          "Treating one spot-check as sufficient — pick multiple sections at different depths and amendment states.",
          "Promoting to production (sync-r2 + load-supabase) before Level 3. Once a citation_path is published, it is forever; getting the body text wrong in the first publish means every encoding that references it carries the error.",
        ],
      },
      {
        kind: "callout",
        tone: "blocker",
        text: "If a corpus row was published with bad body text and an encoding references it, fixing the source requires republishing under either a new citation_path (breaks every downstream reference) or with the same path (silent body change with no consumer notification). Neither is good. Verify before publishing.",
      },
    ],
  },
  {
    kicker: "§ 12",
    title: "What actually happened on the first run (2026-05-12)",
    blocks: [
      {
        kind: "p",
        text: "First real attempt to take CalFresh through stage 1. Honest log of what worked, what was wrong, and where the friction is.",
      },
      {
        kind: "h",
        text: "Setup friction (1–2 hours)",
      },
      {
        kind: "ul",
        items: [
          "uv sync failed: pyroaring 1.0.3 (pinned in uv.lock) has no Python 3.14 wheels and source build fails on Apple clang 17 (atomic implementation + missing C++ stdlib include).",
          "Workaround that worked: uv venv .venv-py314 --python 3.14 then .venv-py314/bin/python -m pip install --prefer-binary -e . — this floats pyroaring to 1.1.0 which has 3.14 wheels.",
          "Lockfile drift is the real fix. Refresh uv.lock to pyroaring 1.1.0 so uv sync works out of the box.",
        ],
      },
      {
        kind: "h",
        text: "Source verification before running anything",
      },
      {
        kind: "p",
        text: "Downloaded the 912 MB leginfo bulk ZIP directly. Confirmed schema before running the extractor:",
      },
      {
        kind: "code",
        text: `# WIC code is in CODES_TBL.dat
$ unzip -p pubinfo_2025.zip CODES_TBL.dat | grep WIC
\`WIC\`	\`Welfare and Institutions Code - WIC\`

# §18900–18906 sections present in LAW_SECTION_TBL.dat
$ unzip -p pubinfo_2025.zip LAW_SECTION_TBL.dat \\
    | awk -F'\\t' '$2=="\`WIC\`" && $3 ~ /^\`1890[0-6][.\`]/' | wc -l
52`,
      },
      {
        kind: "h",
        text: "The actual extraction",
      },
      {
        kind: "code",
        text: `.venv-py314/bin/axiom-corpus-ingest extract-california-codes \\
  --base data/corpus \\
  --version "2026-05-12" \\
  --source-zip /tmp/ca-leginfo/pubinfo_2025.zip \\
  --only-title WIC \\
  --source-as-of "2026-05-12" \\
  --expression-date "2026-05-12"`,
      },
      {
        kind: "p",
        text: "Result:",
      },
      {
        kind: "code",
        text: `{
  "adapter": "california-codes-bulk",
  "container_count": 848,
  "matched_count": 7948,
  "missing_count": 0,
  "provision_count": 7948,
  "provisions_path": "data/corpus/provisions/us-ca/statute/2026-05-12-us-ca-title-WIC.jsonl",
  "section_count": 7100,
  "errors": []
}`,
      },
      {
        kind: "p",
        text: "7,948 provisions, zero errors. 14,200 section rows in the JSONL counting all amendment-versions across history. Runtime: under a minute after the ZIP was downloaded.",
      },
      {
        kind: "h",
        text: "Mapping that came out of the extracted data",
      },
      {
        kind: "p",
        text: "My v1 of this playbook guessed which §18901.x sections covered which CalFresh divergences. Now that the bodies are actually parsed, here's the corrected map:",
      },
      {
        kind: "ul",
        items: [
          "§18900.2 — Renames Food Stamps → CalFresh in CA law",
          "§18901.09 — Income exclusions for CalFresh eligibility",
          "§18901.2 — Standard Utility Allowance via energy assistance benefits",
          "§18901.6 — Transitional CalFresh from CalWORKs exits",
          "§18901.9 — Vehicle resource value alignment (this is CA's \"exclude vehicles\" provision — not §18901.1 as I had said)",
          "§18901.10 — Face-to-face interview exemption rules",
          "§18901.11 — E&T program component eligibility",
          "§18901.12 — Student exemption (explicit cross-reference to 7 CFR 273.5(b)(11)(iv))",
          "§18901.35 — Expedited eligibility processing",
          "§18904.25 — Homeless expedited services",
          "§18910–18917 — General CalFresh administration, multilingual outreach, disaster CalFresh",
        ],
      },
      {
        kind: "callout",
        tone: "note",
        text: "Lesson: do not write encoding docs from memory. Run the extract first. The first version of this playbook had §18901.1 as vehicle exclusion and §18901.10 as BBCE — both wrong. The real provisions are different and the divergence landscape is wider than I had in mind. Source-first is also documentation-first.",
      },
      {
        kind: "h",
        text: "What is still needed to make this live",
      },
      {
        kind: "ul",
        items: [
          "sync-r2: push data/corpus/{sources,inventory,provisions,coverage}/us-ca/... to the axiom-corpus R2 bucket. Needs ~/.config/axiom-foundation/r2-credentials.json.",
          "load-supabase: push the 7,948 provision rows into corpus.provisions. Needs Supabase write credentials.",
          "Then: axiom-encode encode \"CA W&I Code 18901.9\" will succeed because corpus has the row.",
        ],
      },
      {
        kind: "h",
        text: "Honest scope of what \"stage 1 done\" means",
      },
      {
        kind: "p",
        text: "What's done: WIC statute text is in corpus locally. CalFresh-relevant §18900s, plus all the rest of WIC, with real bodies. Adapter validated against real production data on a real machine.",
      },
      {
        kind: "p",
        text: "What's not done: the MPP §63 manual (the operational rules CDSS counties actually use day-to-day) is not in corpus and requires a new adapter. Statutes alone won't give an encoder enough to produce a working CalFresh implementation — the SUA tables, deduction values, ABAWD waiver geographies, and county-option lists all live in MPP. Stage 1 is partial, not complete.",
      },
    ],
  },
  {
    kicker: "§ 13",
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
          "Coverage gap was \"adapter exists, never run for this scope.\" The california-codes-bulk adapter has been in axiom-corpus the whole time — I just hadn't run it. Worth surveying which jurisdiction × document_class slots have adapters-but-not-runs and triaging the cheapest ones first.",
          "Don't write the encoding playbook from memory. Run the extract, then read the bodies. v1 of this doc had wrong section numbers for the two flagship CA divergences (§18901.1, §18901.10). § 12 is the corrected map. Source-first applies to documentation too.",
          "Dev environment for axiom-corpus is fragile on Python 3.14 + macOS. uv.lock pins a pyroaring version with no 3.14 wheels and a source build that fails on Apple clang 17. Worth refreshing the lock.",
        ],
      },
    ],
  },
  {
    kicker: "§ 14",
    title: "What \"all the CA SNAP rules\" actually requires",
    blocks: [
      {
        kind: "p",
        text: "Encoding a complete CalFresh calculator means having every authoritative source it depends on in corpus. Statutes alone are not enough — they grant authority but don't set the operational numbers. Honest inventory of what CalFresh draws on, and where we stand today:",
      },
      {
        kind: "h",
        text: "Federal layer",
      },
      {
        kind: "ul",
        items: [
          "7 USC 2011–2036 (Food and Nutrition Act, statute) — eligibility framework, allotment formula authority. Status: in corpus, encoded in rulespec-us.",
          "7 CFR 273 (regulation) — federal operational rules. Income, resources, deductions, work rules. Status: in corpus, encoded.",
          "USDA FNS COLA guidance (sub-regulatory) — per-fiscal-year max allotments, FPL income limits, standard deductions. Status: in corpus via us-snap-guidance manifest, encoded as policies/usda/snap/fy-2026-cola/.",
        ],
      },
      {
        kind: "h",
        text: "California layer",
      },
      {
        kind: "ul",
        items: [
          "CA W&I §18900–18929 (state statute, CalFresh chapter) — state divergences from federal: vehicle exclusion authority, SUA via energy assistance, interview exemptions, E&T, student rules, transitional CalFresh. Status: in corpus locally as of 2026-05-12 (7,948 WIC provisions). Not yet sync-r2'd or loaded to Supabase. Not encoded.",
          "CDSS MPP §63 (state regulation) — the operational manual counties use day-to-day. Carries the actual numbers: SUA tier values for FY 2026, ABAWD waiver geographies, county-option lists, deduction tables, allotment computation workflow. Status: no adapter, not in corpus. This is the gap.",
          "CDSS ACL / ACIN letters (sub-regulatory) — overlay updates to MPP between formal manual revisions. Periodic FY recalibrations and policy clarifications. Status: 4 CalWORKs letters in corpus via us-ca-cdss-acl-guidance manifest. Zero CalFresh letters.",
        ],
      },
      {
        kind: "h",
        text: "What this means concretely",
      },
      {
        kind: "p",
        text: "Without MPP §63, an encoder cannot answer questions like \"what is the FY 2026 SUA for a CA household with heating costs?\" The W&I Code says CDSS shall set utility allowances per energy-assistance receipt — it doesn't say what the values are. The values live in MPP §63-503 and are refreshed annually via ACL.",
      },
      {
        kind: "p",
        text: "Comparison with NY (which has a working end-to-end CalFresh-equivalent encoding): NY's corpus carries 7 USC + 7 CFR + 18 NYCRR 387 + NY-OTDA guidance. All four layers. CA has the first two plus a partial fourth and is missing the third — the most important one for operational fidelity.",
      },
      {
        kind: "callout",
        tone: "blocker",
        text: "Bottom line: a complete CA SNAP encoding requires a CDSS MPP §63 adapter. Statute-only ingestion (what we have today) gets you the authority story — \"CA implements CalFresh, aligns vehicle treatment with federal alt program\" — but cannot produce a benefit-calculation engine because the operational tables live in MPP. This is the next real work item.",
      },
      {
        kind: "h",
        text: "Realistic scope for an MPP adapter",
      },
      {
        kind: "p",
        text: "Full MPP §63 is ~2,000 pages and not all of it is encoding-relevant. Minimum viable subset for a working CalFresh encoding:",
      },
      {
        kind: "ul",
        items: [
          "§63-301 Standards of eligibility (~30 pages)",
          "§63-402 Deductions and SUA tables (~50 pages)",
          "§63-407 Resource determination including vehicles (~20 pages)",
          "§63-501 Eligibility determination workflow (~25 pages)",
          "§63-503 Allotment computation tables (~20 pages)",
        ],
      },
      {
        kind: "p",
        text: "~150 pages, one cohesive workstream, modeled on src/axiom_corpus/corpus/nycrr.py. Estimated effort: 2–3 weeks of focused engineer time to land Level 3 verification for this subset. Full §63 coverage is 2–3 months. ACL overlay handling is another ~1 week on top.",
      },
    ],
  },
  {
    kicker: "§ 15",
    title: "What actually happened in production (2026-05-13 → 2026-05-14)",
    blocks: [
      {
        kind: "p",
        text: "We ran the CalFresh encoding end-to-end against the production stack. This section logs what actually shipped, what broke, and the exact CI validator stages each fix had to clear. Source-of-truth for what's now live in rulespec-us-ca main.",
      },
      {
        kind: "h",
        text: "What shipped",
      },
      {
        kind: "ul",
        items: [
          "358 CalFresh MPP §63 subsections encoded as signed RuleSpec YAML in rulespec-us-ca main (PR #4 merged).",
          "823 individual rules (661 derived + 162 parameter) with proof atoms tying every value back to a corpus excerpt.",
          "Each encoding has a per-subsection .axiom/encoding-manifests/ HMAC-signed manifest.",
          "Oracle registry in axiom-encode extended with 823 not_comparable entries (PR #40) + 2 follow-ups (PR #42) for renamed sibling rules.",
          "axiom-corpus PR #52 (CalFresh adapter body-null fix) merged — see § 16.",
        ],
      },
      {
        kind: "h",
        text: "Production-run metrics",
      },
      {
        kind: "ul",
        items: [
          "541 candidate citations (all CalFresh MPP §63 corpus rows with body content)",
          "358 APPLIED (66% pass rate)",
          "206 apply_blocked_validation (procedural-language provisions — \"the CWD shall…\" — not encodable as computational rules)",
          "13 apply_blocked_manifest (transient axiom-encode dirty-checkout drift; resolved with defensive uv.lock reset before each call)",
          "Wall time: ~14 hours sequential including overnight rate-shaping by Codex/ChatGPT",
          "LLM cost: $0 — Codex CLI uses bundled ChatGPT subscription, no per-call billing",
          "Pace observed: 50s/call early → 100s/call mid-run → 180s/call late (ChatGPT rate-shaping with sustained volume)",
        ],
      },
    ],
  },
  {
    kicker: "§ 16",
    title: "Operator setup that was actually required",
    blocks: [
      {
        kind: "p",
        text: "The playbook said \"AXIOM_ENCODE_APPLY_SIGNING_KEY is set as an org secret but not retrievable for operator workstations.\" In practice you need it locally to use `--apply`. Procedure that worked:",
      },
      {
        kind: "ul",
        items: [
          "Receive the signing key value (out-of-band).",
          "Write it to ~/.config/axiom-foundation/axiom-encode.env as `export AXIOM_ENCODE_APPLY_SIGNING_KEY=<hex>`, mode 600.",
          "`source` that file before any `axiom-encode encode --apply` call.",
          "Never paste the value into chats, commits, logs, or other repos.",
        ],
      },
      {
        kind: "h",
        text: "Other prereqs the playbook understated",
      },
      {
        kind: "ul",
        items: [
          "Codex CLI must be ChatGPT-logged-in. `codex login status` should report \"Logged in using ChatGPT.\" No OPENAI_API_KEY needed when backend=codex.",
          "axiom-rules-engine must be a sibling checkout AND have a compiled binary: `cargo build --release` in ~/axiom-rules-engine before --apply. Without the binary the encoder fails compile validation with \"binary not found.\"",
          "axiom-encode's own git checkout must be clean. The encoder verifies via `git status --porcelain` and refuses to apply if anything is modified. uv.lock drifts during repeated runs — defensive `git checkout -- uv.lock` before each call solves this. Without that fix, ~24% of would-be APPLIED runs silently become apply_blocked_manifest.",
          "axiom-corpus needs to be a sibling checkout for the resolver to read corpus.provisions body text locally.",
        ],
      },
    ],
  },
  {
    kicker: "§ 17",
    title: "The corpus body-null shape bug (axiom-corpus#52)",
    blocks: [
      {
        kind: "p",
        text: "First and worst surprise: 319 of 559 (57%) of CalFresh MPP records had `body: null` in the loaded corpus. The CDSS MPP DOCX parser captured each subsection's lead paragraph as `title` and only filled `body` from follow-on paragraphs. For single-paragraph subsections — most of MPP §63 — the entire rule text lived in `title` and `body` was empty.",
      },
      {
        kind: "p",
        text: "Downstream consumers — notably axiom-encode's `_fetch_local_corpus_source_text_from_repo` — read the `body` field to ground citation excerpts. With body null, those 319 provisions were invisible to the encoder; `encode us-ca/regulation/mpp/63-503.132` failed with `ValueError: No corpus.provisions source text found`.",
      },
      {
        kind: "callout",
        tone: "blocker",
        text: "Lesson: when adding a new corpus adapter, write a property-level test that asserts body is populated for every leaf record. The original PR #39 was correct end-to-end for ingestion + display but the body/heading split was invisible to reviewers until downstream consumers broke.",
      },
      {
        kind: "p",
        text: "Fix: in axiom_corpus.corpus.california_mpp._subsection_provision, fall back to title when body is empty. After re-extract, 541 of 559 records carry body (the remaining 18 are legitimate container nodes). Shipped in PR #52.",
      },
    ],
  },
  {
    kicker: "§ 18",
    title: "The encoder's overwrite-on-apply (section vs subsection)",
    blocks: [
      {
        kind: "p",
        text: "The encoder writes one file per SECTION (regulations/mpp/63-300.yaml), but we encoded one citation per SUBSECTION (63-300.1, .2, …, .623). Each subsequent --apply OVERWROTE the previous section file. Out of 358 successful applies, only 16 surfaced in the repo (the last subsection per section).",
      },
      {
        kind: "callout",
        tone: "blocker",
        text: "We lost ~342 encodings to silent overwrite. They were only recovered because each per-citation workspace at ~/.axiom/encode-traces/sandbox/_eval_workspaces/codex-gpt-5.5/{citation}/workspace/.codex-last-message.txt preserves the actual codex output. We extracted those, wrote per-subsection paths regulations/mpp/{section}/{subsection}.yaml, and re-signed manifests retroactively (a script using the same HMAC scheme).",
      },
      {
        kind: "h",
        text: "Implications",
      },
      {
        kind: "ul",
        items: [
          "For batch encoding, do NOT loop encode --apply across siblings of the same section without a path-strategy fix in axiom-encode. You will silently overwrite.",
          "If you encode anyway: persist the sandbox to a non-tmp location BEFORE starting, because /tmp is cleared on reboot and the recovery files are in there.",
          "Long-term fix: axiom-encode should support a per-subsection output path strategy, or merge-on-apply when the target file already exists for a sibling subsection.",
        ],
      },
    ],
  },
  {
    kicker: "§ 19",
    title: "The CI validator cascade (every failure mode we hit)",
    blocks: [
      {
        kind: "p",
        text: "Each push to rulespec-us-ca#4 surfaced a different validator stage. Listed in the order they fired, with the fix for each:",
      },
      {
        kind: "ul",
        items: [
          "(a) Missing signed manifests — every encoding file requires a corresponding .axiom/encoding-manifests/.../X.json signed with AXIOM_ENCODE_APPLY_SIGNING_KEY. Fix: write a script that computes sha256 + HMAC-sha256 over canonical JSON (sort_keys, separators \",\" and \":\") per axiom-encode's `_sign_applied_encoding_manifest`.",
          "(b) Tests reference stale legal_ids — recovered tests referenced us-ca:regulations/mpp/63-300# (section-level) but yamls moved to 63-300/1 (per-subsection). Fix: rewrite test files to use per-subsection prefixes.",
          "(c) Sibling rule-name collisions — two pairs of sibling subsections (63-405/522 vs 63-405/532; 63-503/311 vs 63-503/312) emitted the same rule name. Fix: append __per_{subsection} suffix to one of each pair.",
          "(d) Internal formula references missed after rename — rule renamed in (c) was also referenced by another rule's formula in the same file. Bare-name reference no longer resolved → became implicit input → test missing assignment. Fix: rename in formula bodies too.",
          "(e) `period: Day` and `period: Week` rejected — engine only accepts month / benefit_week / tax_year / custom. Fix: normalize all 189 Day/Week rules to Month (pragmatic; long-term these need `period: custom`).",
          "(f) Day-precision test periods rejected — after (e), tests with `period: 2026-05-13` failed deserialization. Fix: truncate to `period: 2026-05`.",
          "(g) Oracle coverage unmapped outputs — every new rule legal_id needs an entry in axiom-encode/oracles/policyengine/mappings/us.yaml. Fix: auto-generate 823 not_comparable entries (PR #40), plus 2 follow-up entries (PR #42) for the renamed legal_ids from (c).",
        ],
      },
      {
        kind: "callout",
        tone: "note",
        text: "Each validator stage gates the next. CI runs them sequentially and short-circuits on first failure, so each iteration of the PR exposed exactly one new failure mode. Total: 8 pushes to PR #4 (1 initial + 7 fixes) and 3 PRs to axiom-encode.",
      },
    ],
  },
  {
    kicker: "§ 20",
    title: "Oracle runs are no-ops today (and why)",
    blocks: [
      {
        kind: "p",
        text: "PR #4 ships 823 rules. Oracle coverage classification reports `known_not_comparable: 821, comparable: 0` for us-ca. The `snap-ecps-compare` command would run but find nothing to compare. Three stacked reasons:",
      },
      {
        kind: "ul",
        items: [
          "Mapping type. All 823 are flagged not_comparable. The encoder generated free-form rule names like cwd_receives_mailed_income_reports_and_requested_documents — these don't correspond to PolicyEngine's smaller, opinionated SNAP variable set (snap_eligible, snap_max_allotment, snap_normal_allotment, snap_earned_income, ...). I marked them all not_comparable because the registry has nothing to compare against.",
          "PolicyEngine doesn't model CalFresh's distinct logic. PolicyEngine's SNAP module is federal-first. State variations it does model are mostly value differences (BBCE thresholds, SUA amounts) — not the operational rules in MPP §63 (application process, interview rules, FSET, CFAP, CDSS administrative procedures).",
          "We never built the composition. NY's snap-ecps-compare works because of policies/otda/snap/fy-2026-benefit-calculation.yaml — a composition that imports federal SNAP + state extensions and exposes a top-level snap_eligible rule mapped to PolicyEngine's snap_eligible. We have 823 granular CA rules but no top-level calfresh_eligible / calfresh_allotment with clean PolicyEngine mappings.",
        ],
      },
      {
        kind: "h",
        text: "What unlocks oracle runs",
      },
      {
        kind: "ul",
        items: [
          "Write policies/cdss/calfresh/fy-2026-benefit-calculation.yaml (mirror NY's pattern).",
          "Compose top-level outputs calfresh_eligible / calfresh_allotment from the federal SNAP rules + the granular MPP §63 building blocks already encoded.",
          "Add direct_variable mappings for those two top-level outputs in axiom-encode/oracles/policyengine/mappings/us.yaml (calfresh_eligible → snap_eligible; calfresh_allotment → snap_normal_allotment).",
          "Wire up `axiom-encode snap-ecps-compare --jurisdiction us-ca` (the CI workflow already exists for NY; copy + adjust).",
        ],
      },
      {
        kind: "p",
        text: "The 823 granular rules stay not_comparable — that's correct. The composition is the testable surface.",
      },
    ],
  },
  {
    kicker: "§ 21",
    title: "Day-granular rules deferred",
    blocks: [
      {
        kind: "p",
        text: "I collapsed 187 `period: Day` rules and 2 `period: Week` rules into `period: Month` to satisfy the engine's enum. Functionally fine for SNAP eligibility (monthly determination), but CalFresh has genuine day-scoped rules that lost precision:",
      },
      {
        kind: "ul",
        items: [
          "Initial-month proration day count (§63-503.131 formula)",
          "Expedited service 7-day window (§63-301.5)",
          "Application processing time limits (30 calendar days, 7 calendar days for expedited)",
          "Notice timing rules (10-day adequate notice)",
        ],
      },
      {
        kind: "p",
        text: "Long-term: re-encode these with `period: custom` and explicit day-granular semantics in the formula. For now, the monthly approximation is in production.",
      },
    ],
  },
  {
    kicker: "§ 22",
    title: "Encoding playbook — concrete checklist for the next jurisdiction",
    blocks: [
      {
        kind: "p",
        text: "Synthesized from the CalFresh run. Use this for the next state.",
      },
      {
        kind: "h",
        text: "Before you start the encoder",
      },
      {
        kind: "ul",
        items: [
          "Source text in corpus, with body populated for every leaf record (verify by SQL: COUNT(*) WHERE body IS NULL grouped by jurisdiction/doc_type; should be ~0 for leaves).",
          "axiom-encode env set: AXIOM_ENCODE_APPLY_SIGNING_KEY sourced from ~/.config/axiom-foundation/axiom-encode.env.",
          "axiom-rules-engine: `cargo build --release` once.",
          "Sibling checkouts: axiom-corpus, axiom-encode, axiom-rules-engine, rulespec-us, rulespec-us-{state}. All clean (`git status --porcelain` empty).",
          "Codex CLI logged in: `codex login status` reports \"Logged in using ChatGPT.\"",
        ],
      },
      {
        kind: "h",
        text: "Run shape",
      },
      {
        kind: "ul",
        items: [
          "Persist sandbox to ~/.axiom/encode-traces/ (NOT /tmp) — recovery depends on it.",
          "Wrap the batch script in caffeinate so the laptop doesn't sleep mid-run.",
          "Add `git checkout -- uv.lock` defensive reset before each encode call. Without this, ~24% of applies silently fail manifest check.",
          "Add APPLIED-log skip logic so resume after interruption doesn't re-do prior work.",
          "Resume frequently; ChatGPT rate-shapes after sustained volume (50s/call → 180s/call over ~hours).",
        ],
      },
      {
        kind: "h",
        text: "After the batch",
      },
      {
        kind: "ul",
        items: [
          "Check: does the encoder write per-section or per-subsection files? If section: extract per-citation .codex-last-message.txt from sandbox; do NOT trust just the repo state.",
          "Generate signed manifests for every applied yaml + test pair (script that mirrors axiom-encode's HMAC-sha256 scheme).",
          "Auto-generate not_comparable oracle mappings for every new rule legal_id (one PR per state, appended before the `prefixes:` section of us.yaml).",
          "Expect 7+ CI iterations on the rules PR. Each surfaces one validator stage at a time.",
        ],
      },
      {
        kind: "h",
        text: "Definition of done",
      },
      {
        kind: "ul",
        items: [
          "Rules PR merged with all CI green (yaml validate, tests execute, proofs validate, oracle coverage).",
          "axiom-encode mappings PR(s) merged.",
          "Composition file (policies/.../fy-XXXX-benefit-calculation.yaml) written + direct_variable mappings for top-level outputs.",
          "PolicyEngine ECPS oracle comparison wired in CI for the state.",
        ],
      },
      {
        kind: "callout",
        tone: "note",
        text: "Anti-pattern: relying on \"the encoder will validate it\" without a local validator dry-run. After every change to the recovered files, run axiom-encode's `_load_applied_encoding_manifest_entries` locally — it surfaces signature/sha256 drift in ~1 second instead of waiting 25 minutes for CI to fail.",
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
