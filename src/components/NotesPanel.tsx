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
        text: "navigation_nodes.has_rulespec=true depends on whether the operator running build-navigation-index had ~/rulespec-us checked out. Production database state is a function of a developer's laptop. In CI without those checkouts, the flag silently demotes. There is no source of truth for what is encoded. Fix: replace the filesystem walk with a database table populated by rules-* CI on push, or a GitHub Tree API call at rebuild time. The data must be the same regardless of who runs the rebuild.",
      },
      {
        kind: "h",
        text: "2. Three sources of truth for the same mapping",
      },
      {
        kind: "p",
        text: "The mapping jurisdiction → rules-* repo + path conventions exists in rulespec_paths.py, repo-map.ts, and repo-listing.ts, plus pieces inside every adapter. They mirror each other today; nothing enforces it. Next jurisdiction will introduce drift if a contributor edits only one. Fix: one source — a manifest in a config repo (or in axiom-rules-engine) with generated bindings for each consumer.",
      },
      {
        kind: "h",
        text: "3. Citation paths are an unmanaged namespace",
      },
      {
        kind: "p",
        text: "Conventions vary subtly per jurisdiction — slashes vs dashes, parens stripping, decimal-preserving, @variant suffixes. Documented only inside adapter code. Paths are forever — once minted, renaming breaks every downstream system. That is an unstated architectural commitment. Concrete failure observed during the CA MPP adapter build: a chapter container at us-ca/regulation/mpp/63-300 collided with the section §63-300 because no spec said which level owns the bare \"63-300\" path; the duplicate only surfaced because compare_provision_coverage happens to check for duplicate citation paths. The same path conventions for different containers within the same regulation are decided ad-hoc by whoever writes the adapter. Fix: a citation-path SPEC document with a per-jurisdiction section and a round-trip test against canonical fixtures.",
      },
      {
        kind: "h",
        text: "4. Validation is per-program and lives in the wrong layer",
      },
      {
        kind: "p",
        text: "Corrected from the original draft of this critique: I previously claimed AxiomRulesRunner in axiom-programs/axiom-oracles is raise NotImplementedError and that nothing validates encodings. That specific claim is wrong. Validation IS wired — but it lives inside axiom-encode (axiom-encode snap-ecps-compare), not in the validation framework I expected. NY's CI runs it on every PR; CA will once the rulespec-us-ca oracle workflow lands. The remaining architectural concern is real and worth keeping: validation is a per-program comparator that someone has to build, one program at a time. SNAP has snap-ecps-compare; federal tax now has tax-ecps-compare (sections 32, 151, 172, 199A, 213, 6012 mapped to PolicyEngine since 2026-05-14, growing section-by-section). TANF, Medicaid, EITC, state-specific benefits still have no comparator. There is no general \"axiom-rules-engine engine output vs. oracle output\" framework — there are two program-shaped comparators (SNAP and tax) that happen to exist plus per-section mappings. Fix: extract a generic Oracle interface in axiom-oracles that snap-ecps-compare and tax-ecps-compare both implement so the next program inherits the scaffolding rather than rebuilding it.",
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
        text: "sync-r2 is operator discipline. Nothing in production reads from R2. Newly confirmed by the CA SNAP end-to-end pass: extract → Supabase load → encoder-ready works without ever touching R2; the encoder resolves citations against local JSONL → Supabase, not R2. If you stop syncing, nothing visibly breaks for a while; if you keep syncing, you pay for a tier nobody uses. Fix: commit (build a consumer — diff API, historical query, bulk download) or remove.",
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
        text: "Extract, sync R2, load Supabase, build nav — every step is a person remembering to run a command. Concrete walked sequence from the CA MPP session: extract-california-mpp-calfresh → load-supabase (× 2, statutes and regulations) → manual vercel --prod for the docs viewer → would need manual axiom-encode encode --apply next. Five commands, four credentials (Supabase service-role key, R2 credentials file — missing, encoder signing key — missing, Vercel auth). No orchestrator, no \"corpus is N hours stale\" signal, no retry. For a corpus that ingests living law, this is risky over time. Fix: a scheduled orchestrator that runs the canonical extract sequence per jurisdiction and posts a delta report. Operators intervene on failure; they do not drive the happy path.",
      },
      {
        kind: "h",
        text: "9. ProgramSpec is invisible outside axiom-rules-engine",
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
        text: "axiom-demo-shell hard-codes three URLs. The architecture viewer also lists three consumer apps. When a fourth lands, both have to update. demo-shell's README admits it is temporary but it has been there long enough to be load-bearing. Fix: pick. Retire demo-shell once axiom-foundation.org has the consolidated surface, or commit to it as the real product. Status: lowest-stakes item on this list — nothing has actually been bitten by this in practice. Tracking only; will auto-resolve when demo-shell retires.",
      },
      {
        kind: "h",
        text: "11. Operator-surface gaps as a meta-pattern",
      },
      {
        kind: "p",
        text: "Each of the items above is small individually. Together they form a real shape: across five different surfaces, the same gap appears.",
      },
      {
        kind: "ul",
        items: [
          "has_rulespec (corpus → app coverage flag): mechanism is a filesystem walk that works; operator surface is undocumented and depends on which machine ran it.",
          "Supabase credentials: SUPABASE_SERVICE_ROLE_KEY env var works once set; the canonical store ~/.config/axiom-foundation/supabase.env is empty on operator workstations, no setup doc.",
          "R2 mirror: sync-r2 works; ~/.config/axiom-foundation/r2-credentials.json does not exist on operator workstations, no setup doc, no key-distribution path.",
          "Encoder apply signing key: HMAC mechanism is well-engineered with signed manifests and verifiable via CI; AXIOM_ENCODE_APPLY_SIGNING_KEY is set as a GitHub org secret but is not retrievable for operator workstations (secrets are write-only after set), no documented setup or rotation procedure.",
          "Vercel auto-deploy for docs viewer: works once configured; GitHub app permission was never granted on the TheAxiomFoundation org, so every merge to main requires a manual vercel --prod run from a workstation.",
        ],
      },
      {
        kind: "p",
        text: "Pattern: infrastructure mechanisms are well-built; the operator surface (\"how do I turn this on for a new operator?\") is consistently missing. Onboarding a new contributor — or even getting back up to speed after a laptop refresh — currently requires re-deriving each setup step from code. Fix: a single operator-setup runbook in axiom-corpus/docs/ that walks through every credential, every config file, every GitHub app permission, with rotation procedures where applicable. Followed by treating new infrastructure mechanisms as incomplete until they have a documented operator surface.",
      },
      {
        kind: "h",
        text: "12. The visibility gate is a separate manual step disconnected from data load",
      },
      {
        kind: "p",
        text: "Loading data and making it visible are separate operator actions, connected only by someone remembering to edit manifests/releases/current.json and run sync-release-scopes. This produced the UK regression (4,705 provisions invisible) and the verify-release-coverage CLI immediately uncovered four more silently invisible jurisdictions on the day it shipped: us-ar (34,668), us-mo (702), us-ms (25,480), us-nh (584). All four had been loaded without ever being added to the manifest. Two of them (us-ar and us-ms) have production_status: supabase_only_legacy in the operator queue file, meaning the queue says they SHOULD be visible — they just never were. This is exactly the operator-surface meta-pattern from § b11, but with the worst blast radius: ~61k production provisions sitting invisible to users, with no signal that anything was wrong until someone wrote a check that asked.",
      },
      {
        kind: "h",
        text: "13. sync-release-scopes is destructive-replace",
      },
      {
        kind: "p",
        text: "The current sync function does deactivate-all-current-scopes then re-insert from the local manifest. That is silently wrong when the manifest is on a feature branch that doesn't include scopes that exist on other branches. Concrete example from 2026-05-12: a manifest update on the UK release-scopes branch (based on main) ran sync-release-scopes and accidentally deactivated us-wa/regulation, because that scope had been added in a different feature branch (codex/washington-wac-regulations) that wasn't merged to main yet. 54,708 Washington regulation provisions silently went invisible. Recovered by direct UPDATE. The bug class: any sync from any branch whose manifest is stale or partial can unpromote unrelated work. Fix: make the default behavior upsert-incremental; add an --exclusive flag for cases that genuinely want full replacement.",
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
        text: "An Encoding Registry holding (jurisdiction, citation_path, rule_id, repo, sha, last_compiled, validation_status, oracle_deltas), populated by rules-* CI on push, by axiom-encode on encoding, by axiom-rules-engine on compile, by axiom-programs on validation. Everyone reads from it. has_rulespec becomes a join. Encoded-only browse becomes a real query. Encoder workbench sorts by least-covered concept. Validation gets a target. The most natural fit for what the system actually needs.",
      },
      {
        kind: "h",
        text: "B. Decouple the engine from \"CLI tool\" framing",
      },
      {
        kind: "p",
        text: "axiom-rules-engine is invoked subprocess-style. Fine for batch validation, wrong for real serving. Two directions: (B1) compile to WASM, run benefit calculations in the browser with zero PII roundtrip — cacheable, instant, regulator-friendly, a genuine differentiator versus PolicyEngine; (B2) long-lived engine service keeping ProgramSpecs warm. B1 is the more interesting bet — a different trust model for the product, not just faster.",
      },
      {
        kind: "h",
        text: "C. Insert a \"policy concept\" layer",
      },
      {
        kind: "p",
        text: "Stack today: source text → provisions → YAML → compiled. No node for \"SNAP\" or \"EITC\" — concepts are implicit in YAML filenames and case keys. A Concept Registry with many-to-many to provisions and rules would make coverage talk honest (\"SNAP is encoded in 7 jurisdictions\" is a query), enable upstream change detection (\"SNAP-related provision changed in 7 USC 2014\"), and give encoder prioritization a real surface. More speculative than A or B.",
      },
      {
        kind: "h",
        text: "D. Auto-register on load + explicit publish — eliminate the manifest gate",
      },
      {
        kind: "p",
        text: "Today the release manifest (manifests/releases/current.json) is the source-of-truth for what corpus content is visible to the app. It is operator-edited. Every failure of class § b12 / § b13 traces back to this design: the visibility decision is a separate manual step disconnected from data load, propagated by a destructive sync.",
      },
      {
        kind: "p",
        text: "Proposed shift, in two PRs:",
      },
      {
        kind: "ul",
        items: [
          "PR A — make sync-release-scopes upsert-incremental by default; add --exclusive flag for cases that want full replacement. This alone removes the entire class of \"my sync from a stale branch unpromoted someone else's work.\" Half a day of effort, opt-in flag preserves backward compatibility.",
          "PR B — load-supabase auto-inserts a release_scopes row when it sees a new (jurisdiction, document_class), but with active=false. New CLI: axiom-corpus-ingest publish --jurisdiction X --doc-type Y flips active=true. Idempotent, non-destructive, observable. The manifest file becomes either auto-generated documentation or is deprecated entirely. Adds ~3 days of effort but eliminates the UK / us-ar / us-mo / us-ms / us-nh / us-wa class of bugs from ever recurring.",
        ],
      },
      {
        kind: "p",
        text: "Why this is a meaningful shift, not just a bug fix: it changes the architectural primitive from \"data + separate manual config\" to \"data with a self-describing publish state.\" Loaded but unpublished becomes a queryable state, not an absence in a JSON file. Skipping the publish step is detectable (one query for \"what's loaded but unpublished?\"), not silent. The verify-release-coverage check from PR #47 becomes redundant in this world because the gap simply cannot form.",
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
        text: "Encoding Registry (A) remains the highest-leverage architectural shift — it resolves the most other tensions in the system (has_rulespec, validation coverage, encoded-discoverability, encoder prioritization) and unlocks the next year of product surface without locking in any one direction on engine delivery (B) or ontology (C).",
      },
      {
        kind: "p",
        text: "But after the 2026-05-12 session: D (auto-register + publish) is the highest-leverage operational fix. It eliminates a real, recurring bug class with confirmed production blast radius — UK 4,705 + Canada 22,275 + the four state statutes (~61k) + us-wa/regulation 54,708. ~135k production provisions affected today, with no plausible cap on how many more would have accumulated. The verify-release-coverage check from PR #47 is a detector; D is a preventer.",
      },
      {
        kind: "p",
        text: "Order: D first (high-confidence ROI, well-scoped two-PR sequence), then A (the architectural ambition).",
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
