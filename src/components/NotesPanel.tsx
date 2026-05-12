type Section = {
  kicker: string;
  title: string;
  blocks: Block[];
};

type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul"; items: string[] };

const SECTIONS: Section[] = [
  {
    kicker: "§ a",
    title: "What the architecture gets right",
    blocks: [
      {
        kind: "ul",
        items: [
          "Source-first JSONL contract — wipe Supabase, replay from JSONL, return to the same state. Reproducibility is a real durability property and worth keeping.",
          "Citation-path-as-id — deterministic, no central allocator. UUID5(path) means two pipelines hitting the same source produce the same row ids.",
          "One-way dependency arrows — apps never write to corpus; encoder never writes provisions; rules-* never read corpus tables. Cleanest part of the architecture.",
          "Tiered storage with clear truth boundaries — corpus.provisions is the only source of truth; navigation_nodes, provision_counts, provision_references are derived and rebuildable.",
        ],
      },
    ],
  },
  {
    kicker: "§ b",
    title: "What the architecture gets wrong",
    blocks: [
      {
        kind: "h",
        text: "1. has_rulespec is computed from the local filesystem",
      },
      {
        kind: "p",
        text: "navigation_nodes.has_rulespec=true depends on whether the operator running build-navigation-index had ~/rules-us checked out. Production database state is a function of a developer's laptop. In CI without those checkouts, the flag silently demotes. There is no source of truth for what is encoded. Fix: replace the filesystem walk with a database table populated by rules-* CI on push, or a GitHub Tree API call at rebuild time. The data must be the same regardless of who runs the rebuild.",
      },
      {
        kind: "h",
        text: "2. Three sources of truth for the same mapping",
      },
      {
        kind: "p",
        text: "The mapping jurisdiction → rules-* repo + path conventions exists in rulespec_paths.py, repo-map.ts, and repo-listing.ts, plus pieces inside every adapter. They mirror each other today; nothing enforces it. Next jurisdiction will introduce drift if a contributor edits only one. Fix: one source — a manifest in a config repo (or in axiom-rules) with generated bindings for each consumer.",
      },
      {
        kind: "h",
        text: "3. Citation paths are an unmanaged namespace",
      },
      {
        kind: "p",
        text: "Conventions vary subtly per jurisdiction — slashes vs dashes, parens stripping, decimal-preserving, @variant suffixes. Documented only inside adapter code. Paths are forever — once minted, renaming breaks every downstream system. That is an unstated architectural commitment. Fix: a citation-path SPEC document with a per-jurisdiction section and a round-trip test against canonical fixtures.",
      },
      {
        kind: "h",
        text: "4. axiom-rules and axiom-programs do not talk",
      },
      {
        kind: "p",
        text: "The execution engine exists in Rust. The validation framework exists in Python. The slot where they should connect (AxiomRulesRunner in axiom-programs) is raise NotImplementedError. So today: an executor with no validator and a validator with no executor. There is literally no automated signal that any RuleSpec encoding is correct. We are shipping encodings on faith. Fix: wire the runner.",
      },
      {
        kind: "h",
        text: "5. The encoder closes its loop implicitly",
      },
      {
        kind: "p",
        text: "axiom-encode writes YAML; the nav rebuild observes it on the next manual run. No event, no webhook, no encoding-landed signal. Production state drifts behind source of truth until someone notices. For a system whose top constraint is encoding throughput, this is the wrong default. Fix: rules-* Actions on push-to-main call build-navigation-index (or post to a queue).",
      },
      {
        kind: "h",
        text: "6. R2 has no consumer",
      },
      {
        kind: "p",
        text: "sync-r2 is operator discipline. Nothing in production reads from R2. If you stop syncing, nothing visibly breaks for a while; if you keep syncing, you pay for a tier nobody uses. Fix: commit (build a consumer — diff API, historical query, bulk download) or remove.",
      },
      {
        kind: "h",
        text: "7. Schema-as-shape is not enforced",
      },
      {
        kind: "p",
        text: "ProvisionRecord has 25+ mostly-optional fields. JSONL writer has no validator. A bug that writes level: \"1\" instead of 1 propagates to Supabase silently. Fix: pydantic v2 + validate_provisions_jsonl(path) as a step in extract commands. Fail at write time, not load time.",
      },
      {
        kind: "h",
        text: "8. The pipeline is operator-driven everywhere",
      },
      {
        kind: "p",
        text: "Extract, sync R2, load Supabase, build nav — every step is a person remembering to run a command. There is no orchestrator, no \"corpus is N hours stale\" signal, no retry. For a corpus that ingests living law, this is risky over time. Fix: a scheduled orchestrator that runs the canonical extract sequence per jurisdiction and posts a delta report. Operators intervene on failure; they do not drive the happy path.",
      },
      {
        kind: "h",
        text: "9. ProgramSpec is invisible outside axiom-rules",
      },
      {
        kind: "p",
        text: "The compiled IR is a real artifact and would be useful as data: which rules compiled, which failed, dependency graph, last-compiled timestamp. Today it exists only inside the Rust binary and is gone the moment execution finishes. Fix: write compiled ProgramSpec to corpus.compiled_rulespec or R2. Becomes the basis for encoding-health dashboards.",
      },
      {
        kind: "h",
        text: "10. Multiple places store \"what is a demo\"",
      },
      {
        kind: "p",
        text: "axiom-demo-shell hard-codes three URLs. The architecture viewer also lists three consumer apps. When a fourth lands, both have to update. demo-shell's README admits it is temporary but it has been there long enough to be load-bearing. Fix: pick. Retire demo-shell once axiom-foundation.org has the consolidated surface, or commit to it as the real product.",
      },
    ],
  },
  {
    kicker: "§ c",
    title: "Meaningful shifts worth considering",
    blocks: [
      {
        kind: "h",
        text: "A. Promote \"encoding state\" to a first-class service",
      },
      {
        kind: "p",
        text: "An Encoding Registry holding (jurisdiction, citation_path, rule_id, repo, sha, last_compiled, validation_status, oracle_deltas), populated by rules-* CI on push, by axiom-encode on encoding, by axiom-rules on compile, by axiom-programs on validation. Everyone reads from it. has_rulespec becomes a join. Encoded-only browse becomes a real query. Encoder workbench sorts by least-covered concept. Validation gets a target. The most natural fit for what the system actually needs.",
      },
      {
        kind: "h",
        text: "B. Decouple the engine from \"CLI tool\" framing",
      },
      {
        kind: "p",
        text: "axiom-rules is invoked subprocess-style. Fine for batch validation, wrong for real serving. Two directions: (B1) compile to WASM, run benefit calculations in the browser with zero PII roundtrip — cacheable, instant, regulator-friendly, a genuine differentiator versus PolicyEngine; (B2) long-lived engine service keeping ProgramSpecs warm. B1 is the more interesting bet — a different trust model for the product, not just faster.",
      },
      {
        kind: "h",
        text: "C. Insert a \"policy concept\" layer",
      },
      {
        kind: "p",
        text: "Stack today: source text → provisions → YAML → compiled. No node for \"SNAP\" or \"EITC\" — concepts are implicit in YAML filenames and case keys. A Concept Registry with many-to-many to provisions and rules would make coverage talk honest (\"SNAP is encoded in 7 jurisdictions\" is a query), enable upstream change detection (\"SNAP-related provision changed in 7 USC 2014\"), and give encoder prioritization a real surface. More speculative than A or B.",
      },
    ],
  },
  {
    kicker: "§ d",
    title: "Would not re-think",
    blocks: [
      {
        kind: "ul",
        items: [
          "Source-first JSONL contract — works, reproducible.",
          "Citation-path-as-id — right call; conventions need tightening but the choice is sound.",
          "Read-only Supabase for apps — boundary is correctly enforced.",
          "RuleSpec as YAML — human-readable, diffable, easy to review. Database-stored rule trees with a visual editor sounds nicer and is much worse for review velocity.",
          "One-way dependency arrows — cleanest part of the architecture. Preserve.",
        ],
      },
    ],
  },
  {
    kicker: "§ e",
    title: "On the fence",
    blocks: [
      {
        kind: "ul",
        items: [
          "Rules-* as N repos vs one monorepo — today N is fine; at 50 jurisdictions, cross-cutting schema changes will hurt. Worth deciding before there are too many to migrate cheaply.",
          "R2 as durable mirror — either commit (build a consumer) or drop. The current \"we sync there in case\" is not a position.",
          "Per-source time semantics — composing a single \"law as of T\" timeline across USC + eCFR + state codes is foundational for historical lookups and hard. Worth knowing whether that is a product surface before investing.",
        ],
      },
    ],
  },
  {
    kicker: "§ f",
    title: "If forced to pick one",
    blocks: [
      {
        kind: "p",
        text: "Encoding Registry (A). It resolves the most other tensions in the system — has_rulespec, validation coverage, encoded-discoverability, encoder prioritization — and unlocks the next year of product surface without locking in any one direction on engine delivery (B) or ontology (C).",
      },
    ],
  },
];

export function NotesPanel() {
  return (
    <article className="notes">
      <header className="notes__header">
        <div className="eyebrow">internal · architectural review</div>
        <h1 className="heading-section">Open questions</h1>
        <p>
          A frank read on the architecture itself — what holds, what is wrong,
          and what shifts are worth considering. Notes; not a plan.
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
