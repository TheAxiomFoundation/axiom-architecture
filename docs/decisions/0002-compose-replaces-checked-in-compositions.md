# 0002 — axiom-compose replaces checked-in composition YAMLs

**Status:** in-flight (composer shipped and in CI; migration of legacy
compositions and precompiled-artifact consumers incomplete)

## Context

Runnable programs used to exist as two ad-hoc patterns: checked-in
composition YAMLs inside rulespec-* repos (e.g.
`rulespec-us-co/policies/cdhs/snap/fy-2026-benefit-calculation.yaml`,
the "bucket-E" violation — software glue living in a law corpus) and
precompiled artifacts vendored into consumers. Multiple apps referenced
CO SNAP independently; each copy could drift stale silently.

## Decision

A single deterministic assembler: `(spec, atomic rulespec corpus) →
runnable program`, with a hard rule of **no program-specific code
anywhere**. Every synthesis decision must be (a) an atomic encoded rule
in rulespec-*, (b) a generic transformation pattern applying to ≥2
program families, or (c) a declarative parameter in the spec.

## Consequences

- rulespec-* repos return to atomic-only law; assembly lives in data
  (specs, ADR 0005) plus one tool.
- Generic transformation registry as of June 2026: conditional value,
  any_of, formula + data-relation rewrites, derived_relation,
  concept-registry aliasing, auto_gate_outputs (eligibility AND-gating).
- Broken specs die loudly: composition fails fast on dangling scope
  entries (axiom-compose#15) and on eligibility outputs that would leave
  rules orphaned (axiom-compose#9).
- Migration backlog: the CO SNAP bucket-E composition and
  axiom-microsim's per-program Python projections still need to become
  declarative specs; axiom-oracles' remaining precompiled-artifact
  runners collapse onto the compose path (axiom-oracles#19 — UK
  Universal Credit already runs composed, axiom-oracles#61).

## References

- axiom-compose#1 (draft design), #9, #12, #14, #15, #16
- axiom-oracles#19, #61
- Viewer nodes: axiom-compose, axiom-programs
