// Specs & contracts — the registry of durable formats that hold the
// ecosystem together. Canonical spec text lives with the repo that owns
// each format; this page is the index: what each contract is, where the
// authoritative definition lives, and the invariants every producer and
// consumer must hold.

type Section = {
  kicker: string;
  title: string;
  owner: string;
  canonical: string;
  blocks: Block[];
};

type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul"; items: string[] };

const SECTIONS: Section[] = [
  {
    kicker: "§ 1",
    title: "RuleSpec v1 — the authoring format",
    owner: "axiom-rules-engine",
    canonical: "axiom-rules-engine/docs/rulespec.md",
    blocks: [
      {
        kind: "p",
        text:
          "The YAML format in which all encoded law is written. Everything in the " +
          "rulespec-* repos is RuleSpec; the engine compiles and executes nothing else.",
      },
      {
        kind: "ul",
        items: [
          "Format discriminator is mandatory: every file begins format: rulespec/v1 (or a schema: axiom.rules.* declaration). A bare rules: key is rejected.",
          "Durable rule ids have the shape <jurisdiction>:<filepath>#<rule_name> (us:statutes/7/2017/a#snap_regular_month_allotment). Filepath-as-id eliminates drift between repo identity and engine identity.",
          "Rule kinds: parameter (named source scalar), derived (entity-scoped computed output), reiteration (coverage marker — a state provision restating federal law; no-op at execution).",
          "Every rule version is keyed by effective_from date; the engine picks the live version for the query period.",
          "Rules carry entity scope (Person, Household, TaxUnit, Family, …) and period scope (Month, TaxYear, BenefitWeek, …). Inputs and relations must overlap the query period.",
          "Formulas are the Axiom expression language — Python-like but not Python. Scalar functions min/max/floor/ceil; relation aggregators len/count_where/sum/sum_where.",
          "Imports use canonical jurisdiction-prefixed paths (us:statutes/26/21) and resolve cross-repo with cycle detection.",
        ],
      },
    ],
  },
  {
    kicker: "§ 2",
    title: "ProvisionRecord + JSONL artifacts — the ingest boundary",
    owner: "axiom-corpus",
    canonical: "axiom-corpus/src/axiom_corpus/corpus/artifacts.py",
    blocks: [
      {
        kind: "p",
        text:
          "The contract between source adapters and everything downstream. One JSON " +
          "object per provision per line; the same JSONL produces both the R2 mirror " +
          "and the Supabase rows.",
      },
      {
        kind: "ul",
        items: [
          "Required fields per line: jurisdiction, document_class, citation_path. Everything else optional, emitted only when non-null.",
          "Writes are deterministic: sort_keys=true everywhere, atomic tempfile+rename, every write returns the SHA256 of bytes written. Two runs on the same input produce byte-identical files.",
          "Row ids are UUID5(NAMESPACE_URL, 'axiom:{citation_path}') — same path, same id, forever. Re-loading the same JSONL is a no-op upsert.",
          "Four parallel artifact trees keyed identically: sources/ (raw bytes), inventory/ (expected citations), provisions/ (extracted rows), coverage/ (the diff between the two).",
        ],
      },
    ],
  },
  {
    kicker: "§ 3",
    title: "Citation-path namespace",
    owner: "axiom-corpus (conventions live in adapters)",
    canonical: "axiom-corpus/src/axiom_corpus/corpus/rulespec_paths.py + per-adapter code",
    blocks: [
      {
        kind: "p",
        text:
          "The shared namespace every layer keys on: {jurisdiction}/{doc_type}/" +
          "{segments…}, e.g. us/statute/26/21 or us-co/regulation/10-ccr-2506-1/4.207. " +
          "Paths are minted once and are forever — renames break every downstream " +
          "system simultaneously.",
      },
      {
        kind: "ul",
        items: [
          "First segment must equal the jurisdiction. Subsection parens are stripped ((a) → a).",
          "Per-jurisdiction quirks: US federal regulations drop the -cfr suffix; Colorado regulations allow @variant suffixes; Indiana uses dashes within segments (1-2-3).",
          "RuleSpec repo paths mirror citation paths with pluralised buckets: us/statute/26/21 ↔ statutes/26/21.yaml.",
          "There is no formal spec document yet — conventions are documented only in adapter code. That gap is tracked as Open questions § b.3; this index is the nearest thing to a registry until the spec exists.",
        ],
      },
    ],
  },
  {
    kicker: "§ 4",
    title: "Compose specs — programs as data",
    owner: "axiom-programs (consumed by axiom-compose)",
    canonical: "axiom-programs/README.md",
    blocks: [
      {
        kind: "p",
        text:
          "A program (us-co/snap for FY 2026, uk/universal-credit for 2026-27) is an " +
          "assembly of atomic rules — and the assembly is not law. One YAML per " +
          "(jurisdiction, program, period) declares how atomic rules combine.",
      },
      {
        kind: "ul",
        items: [
          "Spec shape: program identifier, period, declared outputs (the rules the engine must produce), scope arrays (federal + state atomic rule paths).",
          "Hard rule: no per-program code anywhere. Every synthesis decision is an atomic rule, a generic transformation pattern (applies to ≥2 program families), or a declarative spec parameter.",
          "Composition fails fast: dangling scope entries and orphaned eligibility outputs abort the compose rather than producing a silently-wrong program.",
          "artifacts/ holds precomposed RuleSpec / precompiled engine artifacts for deployments that do not run axiom-compose.",
        ],
      },
    ],
  },
  {
    kicker: "§ 5",
    title: "Proof atoms + source grounding — the encoder contract",
    owner: "axiom-encode",
    canonical: "axiom-encode/src/axiom_encode/harness/proof_validator.py",
    blocks: [
      {
        kind: "p",
        text:
          "Generated RuleSpec is treated as untrusted until every executable element " +
          "is tied to exact source text. Modules declare module.proof_validation." +
          "required: true and every rule carries typed proof atoms.",
      },
      {
        kind: "ul",
        items: [
          "Atom kinds: amount, condition, definition, default, effective_period, exception, formula, import, ordering, parameter, parameter_table, predicate, table_cell, unit.",
          "Each atom must cite a source excerpt, an accepted source claim, or an import (with target, output, and sha256 hash).",
          "module.source_verification.corpus_citation_path must match the corpus row the encoding was generated from — apply refuses on mismatch.",
          "CI rejects ungrounded numeric literals: every number in a formula or parameter must trace to source text or an import.",
        ],
      },
    ],
  },
  {
    kicker: "§ 6",
    title: "Applied-encoding manifest — signed apply provenance",
    owner: "axiom-encode",
    canonical: "schema axiom-encode/applied-rulespec/v1 (written to .axiom/encoding-manifests/ in each rulespec-* repo)",
    blocks: [
      {
        kind: "p",
        text:
          "Every encoder apply writes a cryptographically signed manifest next to the " +
          "installed files — the tamper-evident audit trail tying applied law back to " +
          "the exact tool state and model run that produced it.",
      },
      {
        kind: "ul",
        items: [
          "HMAC-SHA256 over the canonical JSON payload, key id axiom-encode-apply-v1, keyed by AXIOM_ENCODE_APPLY_SIGNING_KEY (mandatory — no key, no apply).",
          "Payload carries: axiom-encode version + git commit (the checkout must be clean — dirty/unversioned encoders are rejected), generation prompt SHA256, model/backend, trace + context-manifest hashes, and SHA256 of every applied file.",
          "Verification recomputes the HMAC over the unsigned payload; any byte drift in applied files or provenance fails the check.",
        ],
      },
    ],
  },
  {
    kicker: "§ 7",
    title: "Canonical concepts registry",
    owner: "axiom-encode",
    canonical: "axiom-encode/src/axiom_encode/concepts/data/*.yaml (format axiom-encode/concepts/v1)",
    blocks: [
      {
        kind: "p",
        text:
          "One approved variable name per legal concept, with blocked synonyms and a " +
          "producer anchor (the file that canonically produces it). 27 SNAP entries " +
          "today.",
      },
      {
        kind: "ul",
        items: [
          "Prompt-time: registry directives are injected into the encoder prompt so the model picks canonical names on first pass.",
          "Apply-time: the validator refuses to install RuleSpec using a blocked synonym or claiming a canonical name under the wrong producer anchor.",
          "Test files (.test.yaml) get mechanical auto-repair instead of rejection — model-invented test cases are not policy logic.",
          "concepts-audit walks the corpus for drift between producer rules and the registry.",
        ],
      },
    ],
  },
  {
    kicker: "§ 8",
    title: "Comparison report schema — oracle validation output",
    owner: "axiom-oracles",
    canonical: "schema axiom.comparison_report.v1 (axiom-oracles/axiom_oracles/comparison/)",
    blocks: [
      {
        kind: "p",
        text:
          "The versioned JSON shape every oracle comparison run emits, uploaded as a " +
          "CI artifact by the weekly matrix workflow.",
      },
      {
        kind: "ul",
        items: [
          "Cases are thin and concept-keyed (facts, entities, requested outputs) — no universal household ontology. Adapters project concepts into each engine's input language.",
          "concept_mappings.yaml maps canonical concept ids to per-engine targets (SNAP → policyengine: snap, accessnyc: S2R007, axiom: us:policies/usda/snap/…).",
          "The comparator aligns results by household_id and emits typed mismatches: amount_difference, eligibility_left_only, ….",
        ],
      },
    ],
  },
  {
    kicker: "§ 9",
    title: "Benchmark suite manifests + readiness gates",
    owner: "axiom-encode",
    canonical: "axiom-encode/benchmarks/*.yaml (run via axiom-encode eval-suite)",
    blocks: [
      {
        kind: "p",
        text:
          "Declarative eval suites that gate encoder/prompt/model changes: a manifest " +
          "lists runners (backend:model), cases (citations or corpus-backed sources), " +
          "and the thresholds a configuration must clear. 16 suites today.",
      },
      {
        kind: "ul",
        items: [
          "Gates: min_cases, min_success_rate, min_compile_pass_rate, min_ci_pass_rate, min_zero_ungrounded_rate, min_generalist_review_pass_rate, min_policyengine_pass_rate, max_mean_estimated_cost_usd. A suite passes only when every gate passes.",
          "Runs are resumable: suite-run.json tracks progress; suite-results.jsonl is the append-only per-case ledger.",
          "Per-case oracle selection (policyengine / taxsim / none) with jurisdiction hints; usage-limit detection halts a run cleanly instead of burning retries.",
        ],
      },
    ],
  },
];

export function SpecsPanel() {
  return (
    <article className="notes">
      <header className="notes__header">
        <div className="eyebrow">reference · formats &amp; contracts</div>
        <h1 className="heading-section">Specs &amp; contracts</h1>
        <p>
          The durable formats that hold the ecosystem together. Canonical spec
          text lives with the repo that owns each format — this page is the
          index: what each contract is, where the authoritative definition
          lives, and the invariants every producer and consumer must hold.
        </p>
      </header>

      <div className="notes__body">
        {SECTIONS.map((section) => (
          <section key={section.kicker} className="notes__section">
            <div className="notes__section-kicker">{section.kicker}</div>
            <h2 className="notes__section-title">{section.title}</h2>
            <div className="notes__section-body">
              <p className="notes__p">
                <strong>Owner:</strong> {section.owner}
                <br />
                <strong>Canonical:</strong> <code>{section.canonical}</code>
              </p>
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
                return (
                  <ul key={i} className="notes__ul">
                    {block.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
