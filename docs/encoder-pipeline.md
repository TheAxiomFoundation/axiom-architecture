# The encoder pipeline (axiom-encode)

How a citation becomes signed, validated RuleSpec in a rulespec-* repo.
Companion to the architecture viewer's axiom-encode node and the
Specs & contracts tab; file references point into the axiom-encode repo
(as of June 2026).

The design stance throughout: **the model is untrusted**. Everything it
emits must be source-grounded (proof atoms, grounding checks),
mechanically verified (compile + CI + tests), externally corroborated
(PolicyEngine / TAXSIM oracles), and cryptographically attributable
(signed manifests) before it touches a canonical policy repo.

```
citation ─→ source text ─→ workspace + context ─→ prompt ─→ model
   ─→ YAML extraction + mechanical repair ─→ 4-tier validation
   ─→ gated, signed apply ─→ rulespec-* repo
            (everything logged to SQLite; synced to Supabase)
```

## 1. Entry and source resolution

`axiom-encode encode "26 USC 21"` lands in `cmd_encode` (`cli.py`). Key
flags: `--backend` (codex / openai / claude), `--model`, `--mode`
(`cold` vs default `repo-augmented`), `--apply`, `--source-id`,
`--allow-context`.

The citation parses to a citation path (`26 USC 21` → `us/statute/26/21`,
`statute.py`), then `resolve_corpus_source_unit` (`harness/evals.py`)
fetches the legal text — local axiom-corpus checkout first, Supabase
fallback. Fragment requests (`26 USC 21(a)(2)`) slice the subsection out
of section-level text by parenthetical markers. That text becomes the
**only source of legal truth** for the run.

## 2. Workspace and context assembly

`prepare_eval_workspace` builds an isolated directory: `source.txt`,
optional `source-metadata.json`, `context/`, and a
`context-manifest.json`. In repo-augmented mode it auto-selects
precedent from the policy repo: existing RuleSpec for the target,
child-fragment files, peer subsections, cross-referenced sections cited
in the source text, definition stubs, and canonical-concept registry
entries. Each context file records its canonical import path
(`us:statutes/26/21#symbol`) so the model imports rather than
re-encodes.

## 3. Prompt construction

Built by `_build_rulespec_eval_prompt` (evals.py) over the base
instruction corpus in `prompts/encoder.py`:

- **Hard requirements** — `format: rulespec/v1`,
  `module.source_verification.corpus_citation_path`,
  `module.proof_validation.required: true`, and typed **proof atoms** on
  every rule citing exact source text.
- **Source scope protocol** (~140 lines) — entity-scoping rules
  (Person vs TaxUnit vs Household …).
- ~900 lines of encoding directives: percentages as decimal ratios,
  interval-table band selectors, `max(0, …)` for money, filing-status
  enums, what *not* to encode, import composition over duplication.
- The full `source.txt`, context listings with import targets, a
  subparagraph coverage checklist, jurisdiction guidance (UK
  Payment-entity rules etc.), and the required output: a two-file bundle
  (`21.yaml` + `21.test.yaml`, 3–5+ test cases).

The assembled prompt is SHA256-hashed for the audit trail.

## 4. Model invocation

Backend dispatch (`evals.py`): Codex CLI (`codex exec --json`, read-only
sandbox, JSONL event stream, heartbeat/idle timeouts — 10 min default,
30 min for >40k-char sources), Claude CLI (`claude --print
--output-format json`), or OpenAI Responses API (context inlined,
backoff on 429/5xx). All paths return text + token usage (cache and
reasoning tokens included) + cost estimated from `pricing_rates.toml`.
An empty response gets one sharper retry; metrics from both attempts
merge.

## 5. Extraction and mechanical repair

YAML is pulled from `=== FILE: … ===` markers or fences, then
deterministic repairers run before validation: interval-row alignment,
open-ended bound sentinels, band scalar parameters, unsupported chained
conditionals, cross-reference summaries. Post-encode, 25 `repair-*`
subcommands turn recurring CI failure classes into local one-liners.

## 6. Four-tier validation (`harness/validator_pipeline.py`)

1. **Compile** — `axiom-rules-engine compile`; failure blocks everything.
2. **CI** — 50+ static checks: ungrounded numeric literals (every number
   must trace to source), proof-atom validation (each atom cites
   source / claim / import, sha256-hashed imports), subparagraph
   coverage, import shape, plus execution of the companion test cases.
3. **Oracles** — each test case's legal id resolves through a mapping
   registry to a PolicyEngine variable; a PE scenario runs in a
   subprocess and outputs compare within 2% tolerance (pass ≥ 0.8 match
   rate). ECPS/EFRS modules do population-scale comparisons. Oracle
   failures inform but don't hard-block apply.
4. **LLM reviewers** — four parallel reviewers (rulespec, formula,
   parameter, integration) with oracle results as context.

## 7. Apply gating and signing

With `--apply`: a generation gate first (failed generations record
`apply_blocked_generation`), then a bounded repair loop — 25+
domain-specific repairs, each re-validating in a **policy overlay** (temp
copy of the policy repo with the generated files, `require_policy_proofs`
on). Two hard gates before any copy:

- **Canonical concepts** — no blocked synonyms, no canonical names under
  wrong producer anchors. Producer-YAML violations block; `.test.yaml`
  violations auto-repair.
- **Collision detection** — never overwrite an existing RuleSpec carrying
  a different corpus citation.

Then files install and a **signed manifest**
(`axiom-encode/applied-rulespec/v1`) is written to
`.axiom/encoding-manifests/…`: HMAC-SHA256 (key id
`axiom-encode-apply-v1`, keyed by `AXIOM_ENCODE_APPLY_SIGNING_KEY`,
mandatory) over a payload carrying the encoder version + clean git
commit, prompt hash, model/backend, trace hashes, and SHA256s of every
applied file.

## 8. Logging, suites, telemetry

- **Local SQLite** (`harness/encoding_db.py`) logs the complete journey —
  every iteration with its errors and fixes, full session transcripts.
  "We learn from the JOURNEY, not from comparing predictions to actuals."
- **Benchmark suites** (`eval-suite`, 16 manifests under `benchmarks/`)
  declare runners, cases, and readiness gates (min success / compile /
  CI / zero-ungrounded / oracle rates, max mean cost); resumable via
  `suite-run.json` + an append-only `suite-results.jsonl` ledger.
- **Telemetry** — `supabase_sync.py` upserts runs/sessions/transcripts
  (requiring an explicit `data_source` tag so test data can't pollute
  dashboards); optional OTLP span export; reviewer-calibration snapshots
  detect drift over the last 1,000 runs.
