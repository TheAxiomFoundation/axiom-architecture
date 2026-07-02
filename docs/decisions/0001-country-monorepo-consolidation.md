# 0001 — One country monorepo per sovereign legal system

**Status:** shipped (rulespec-us#395 merged 2026-06-12 08:34Z, merge commit
`7937b278`; rulespec-uk#43 merged 2026-06-12 19:39Z — both history-preserving
merge commits. The 18 standalone state repos were archived 2026-06-27.)

## Context

US encoded law is split across rulespec-us (federal) plus 18 standalone
state repos (rulespec-us-al … rulespec-us-tx); the UK across rulespec-uk
and rulespec-uk-kingston-upon-thames. Cross-jurisdiction changes — a
federal rename plus its state importers — require coordinated PRs across
repos, and CI for any one repo cannot validate the full import closure
without external content checkouts.

## Decision

Consolidate into one monorepo per sovereign legal system. rulespec-us
absorbs the state repos as `us-al/`…`us-tx/` directories plus US program
specs under `programs/`, with **full history** (1,112 commits) preserved
via `git subtree add` / `git filter-repo`. rulespec-uk absorbs Kingston
and UK program specs the same way. Durable rule ids stay byte-identical
(`us-ca:regulations/mpp/63-300/1#rule`), so nothing downstream re-keys.

## Consequences

- Cross-jurisdiction changes become one atomic commit; "the encoded law
  of the US" gets one SHA; the whole closure validates in one CI run.
- The consolidation PRs must merge with a **merge commit, never squash** —
  squashing flattens the absorbed history the PRs exist to preserve.
- Content debt surfaced at consolidation is ratcheted in
  `known-validation-gaps.yaml` (rulespec-us#394) — the list only shrinks.
- Tooling must work on both sides of the migration until it completes:
  axiom-compose already loads monorepo checkouts alongside legacy
  standalone repos (axiom-compose#16).

## Outcome (2026-07-02)

- rulespec-us today: federal `us/` (~606 modules), **32** `us-{state}/` dirs
  (the absorbed 18 plus new states encoded directly in the monorepo),
  `programs/` (18 compose specs), ~3,040 encoded modules total.
- rulespec-uk today: `uk/`, `uk-kingston-upon-thames/`, `programs/`,
  `validation_baselines/` — 159 modules.
- Stragglers outside the monorepo: rulespec-us-or (local-only Oregon
  scaffold, no GitHub repo) and rulespec-us-ut (bare `policies/` dir).

## References

- rulespec-us#395 (US consolidation, merged 2026-06-12)
- rulespec-uk#43 (UK consolidation, merged 2026-06-12)
- Viewer nodes: rulespec-us, rulespec-uk · rulespec-ca
