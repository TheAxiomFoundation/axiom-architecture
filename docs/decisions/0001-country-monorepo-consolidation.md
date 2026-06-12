# 0001 — One country monorepo per sovereign legal system

**Status:** in-flight (rulespec-us#395 and rulespec-uk#43 both open as of 2026-06-11)

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

## References

- rulespec-us#395 (US consolidation, open)
- rulespec-uk#43 (UK consolidation, open)
- Viewer nodes: rulespec-us, rulespec-us-{state}, rulespec-uk · rulespec-ca
