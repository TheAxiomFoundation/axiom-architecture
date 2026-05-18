# Corpus ↔ Encoding Addressing

> How Axiom maps fine-grained RuleSpec encodings back to section-level corpus
> rows, and why the asymmetry is deliberate.

## The asymmetry

`axiom-corpus` stores **one row per statutory section**. The `body` column
holds the entire section's text with all its subsections, paragraphs, and
clauses concatenated in. Subsections do not get their own database rows.

`rulespec-us` (and the per-state encoding repos) encode **at any depth** —
files routinely sit at the subsection or even clause level:

```
rulespec-us/
├── statutes/26/213.yaml         # 26 USC §213 — whole-section encoding
├── statutes/26/3121/a/1.yaml    # 26 USC §3121(a)(1) — clause-level encoding
└── statutes/26/45A.yaml         # 26 USC §45A
```

This document explains how the two levels of granularity are reconciled,
why the design works, and what it means for downstream consumers
(particularly Pipeline B of the auto-update layer).

## Why corpus stops at section level

Confirmed by probing the Supabase `corpus.current_provisions` view: rows
exist for `us/statute/26/213`, `us/statute/26/63`, `us/statute/26/68`,
etc., but **not** for `us/statute/26/213/a`, `/63/b`, `/68/c`. Section is
the atomic unit.

Four reasons this is the right choice:

1. **The upstream source is section-shaped.** uscode.house.gov publishes
   per-title XML where each `<section>` is a self-contained element with
   nested subsections inside. `axiom-corpus/scripts/ingest_title26.py`
   reflects this: it iterates sections and stores one row per section,
   even though the in-memory section object carries `.subsections` for
   navigation.

2. **Sections are the legislatively atomic unit.** Bills always say
   "Section X of the Internal Revenue Code is amended by …" — they
   identify the section first, then the edit within. Sections rarely
   merge or rename; subsection numbering is the volatile layer (bills
   routinely redesignate `(b)` as `(c)`).

3. **No duplication, no sync risk.** Storing the body at every level
   would put the same prose in five places (section + each subsection +
   paragraph). An amendment would have to update all five or risk drift.

4. **Encoding granularity is decoupled and the encoder knows that.**
   See below — the encoder addresses subsection-level rules through
   YAML metadata, not through extra corpus rows.

## How encodings address subsections without extra corpus rows

Three coordinated mechanisms inside a RuleSpec YAML:

### 1. The file path encodes the citation hierarchy

```
statutes/26/3121/a/1.yaml   ↔   26 USC §3121(a)(1)
```

The path *is* the address. Downstream consumers (including
`axiom-bills`'s encoding index, and anyone walking the rulespec-*
repos) read the address straight out of the path.

### 2. `module.source_verification.corpus_citation_path` points at the parent corpus row

Every encoding declares which corpus row it's grounded in. Always at
**section level**, regardless of how deep the encoding itself sits:

```yaml
# statutes/26/3121/a/1.yaml
module:
  source_verification:
    corpus_citation_path: us/statute/26/3121   # the section row
```

This tells `axiom-encode proof-validate` where to look to verify the
quoted text below.

### 3. Each rule has its own subsection-level `source` plus a verbatim corpus quote

This is where the granular addressing actually lives:

```yaml
# from statutes/26/213.yaml
- name: medical_expense_agi_floor_rate
  source: 26 USC 213(a)                       # ← subsection-level address
  metadata:
    proof:
      atoms:
        - source:
            corpus_citation_path: us/statute/26/213
            text: "to the extent that such expenses exceed 7.5 percent of adjusted gross income"
  versions:
    - formula: 0.075

- name: medical_lodging_nightly_cap
  source: 26 USC 213(d)(2)                    # different subsection, same file
  metadata:
    proof:
      atoms:
        - source:
            corpus_citation_path: us/statute/26/213
            text: "The amount taken into account under the preceding sentence shall not exceed $50 for each night for each individual."
  versions:
    - formula: 50
```

- `rule.source` is the **granular citation** the rule encodes.
- `metadata.proof.atoms[].source.text` is the **verbatim corpus prose**
  that justifies the rule's value.
- `proof-validate` confirms that `text` actually appears in the parent
  section's body. If a future corpus update removes or changes that
  prose, the validator fails — a structural signal that the rule needs
  re-encoding.

So the granular mapping lives **in the encoding YAML**, not in corpus.
Corpus is the validator's source of truth at section level; encodings
fragment as finely as they need to.

## How the encoder splits a section into subsections

It doesn't split corpus storage. The split happens twice in process:

1. **At encoding time.** `axiom-encode encode` reads the section body
   from corpus, parses it by level markers (`(a)`, `(b)`, `(1)`, `(A)`,
   `(i)`, `(I)`) into a hierarchical tree, and presents that tree to
   the model. The model writes rules with `source: 26 USC X(y)`
   annotations and quotes the relevant subsection's prose into the
   proof atom.

2. **At validation time.** `axiom-encode proof-validate` walks each
   rule's `proof.atoms[].source.text` and substring-matches against
   the corpus body. No subsection slicing required — the verbatim
   quote is its own anchor.

The level-marker parser is the only shared dependency between encoder
and any downstream tool that wants to reason about subsection boundaries.

## Implications for Pipeline B (the auto-update layer)

Pipeline B fires when a bill becomes law. Two questions it has to
answer:

1. **Which encodings does this bill affect?**
2. **What is the diff between current and proposed text for each
   affected section?**

The mapping above gives a clean answer to (1) without ever asking
corpus to store subsection-level rows:

### Affected-encoding detection

For each citation extracted from the bill (e.g. `26 USC 213(a)`):

1. Look at every RuleSpec file in the citation's hierarchy:
   `statutes/26/213.yaml`, `statutes/26/213/a*.yaml`, etc.
2. For each rule in those files, check whether the bill's amendment
   instructions intersect either:
   - The rule's `source` field (e.g. `26 USC 213(a)`), or
   - Any string in `metadata.proof.atoms[].source.text` (the actual
     prose the rule is grounded in).
3. Hits are the precise rules whose justification has changed. Those
   are the rules that need re-encoding, not the whole section.

This is much stronger than a section-level "text changed somewhere"
signal — it pinpoints the exact rules.

### Subsection-level diff display

For UI consumption: slice the cited subsection out of the parent
section's body using the same level-marker parser, apply the bill's
ops to that slice, stitch back. Reuses the encoder's heuristic without
needing extra corpus storage.

## Worked example: `axiom-bills` consuming S.253

S.253 (Abortion Is Not Health Care Act of 2025) adds a new subsection
`(f)` to 26 USC §213.

1. Bill citation extracted: `26 USC 213` (or `26 USC 213(a)` depending
   on parser).
2. Encoding lookup: `statutes/26/213.yaml` exists. Its
   `source_verification.corpus_citation_path` is `us/statute/26/213`.
3. Affected-rule detection: walk every rule in `213.yaml`. The bill
   adds new prose at the end; existing `proof.atoms.source.text` quotes
   for `medical_expense_agi_floor_rate` and `medical_lodging_nightly_cap`
   still appear in the post-amendment body, so those rules are
   **not** affected. The bill creates a new abortion-related rule that
   would need a fresh encoding.
4. Diff display: pull `us/statute/26/213` body, run normalize +
   pretty-print, apply the add-end op, render line-level diff against
   the original.

## Constraints and edge cases

- **Stale `has_rulespec` flag.** Corpus's own
  `current_provisions.has_rulespec` lags real YAML state on the
  rulespec-* repos by hours-to-days. Consumers should walk the
  rulespec-* repo locally (or via GitHub API) to get an authoritative
  answer.
- **Redesignations.** When a bill redesignates `(c)` as `(d)`, the
  section-level corpus body changes, but rule `source` fields still
  reference the old subsection name. Affected-rule detection via
  proof-atom text overlap handles this naturally (the prose moves, but
  the quote should still appear); detection via `rule.source` string
  matching would miss it. Prefer proof-atom matching for this reason.
- **Multi-section bills.** Each citation is independent — Pipeline B
  walks each one and unions the affected rules.

## Files of interest

| File | Purpose |
|---|---|
| `axiom-corpus/scripts/ingest_title26.py` | Section-level XML → one row per section |
| `axiom-corpus/supabase/migrations/20260416200000_corpus_provisions_search_rpc.sql` | `corpus.search_provisions` RPC; expects section-level rows |
| `axiom-encode/src/.../proof_validate.py` | Substring-matches `proof.atoms.text` against corpus body |
| `axiom-bills/packages/scrapers/src/axiom_bills/_common/corpus_client.py` | Path-based corpus fetch with parent fallback |
| `axiom-bills/packages/scrapers/src/axiom_bills/_common/amendments.py` | Level-marker parser, the same heuristic the encoder uses |
| Any `rulespec-us/statutes/<title>/<section>[/sub/...].yaml` | Example of file-path + `rule.source` + proof-atom addressing |

---

*Captured 2026-05-18 while building the `axiom-bills` bill-tracker
prototype's diff and Pipeline-B-trigger views. Update when the corpus
storage model changes (e.g. if subsection rows ever land).*
