# 0005 — Program compose specs live in axiom-programs, then move into country monorepos

**Status:** in-flight (specs live in axiom-programs today; the move into
each country monorepo's `programs/` ships with the ADR 0001
consolidations)

## Context

Compose specs (one YAML per jurisdiction × program × period, ADR 0002)
needed a home. They are **not law**, so they don't belong in rulespec-*
corpora — that's the bucket-E violation being eliminated. They are
**not the composer**, so they don't belong inside axiom-compose, which
is a generic tool. And they need a release cadence independent of both.

## Decision

A standalone axiom-programs repo with country-agnostic layout
(`us/`, `us-co/`, `uk/`, …) holds the specs, plus `artifacts/` with
precomposed RuleSpec / precompiled engine artifacts for deployments that
don't run axiom-compose. Long-term, specs move into each country
monorepo's `programs/` directory so they version with the law they
compose — that move is part of rulespec-us#395 / rulespec-uk#43.

## Consequences

- A new fiscal-year spec or jurisdiction is one PR, not a coordinated
  release.
- Inventory as of June 2026: SNAP specs for 8 states (al, ca, co, ma,
  nc, ny, sc, tn), us-co/tanf (Colorado Works), us/payroll/
  oasdi-wage-tax, uk/universal-credit fy-2026-27 (housing schedules
  wired in).
- Two homes in sequence means consumers must follow the move when the
  consolidations merge; axiom-compose already resolves both layouts
  (axiom-compose#16).
- `artifacts/` is a deliberate escape hatch, and a drift risk if a
  precomposed artifact outlives its spec — regenerate on spec change.

## References

- axiom-programs README (layout, migration backlog)
- rulespec-us#395, rulespec-uk#43 (the move)
- Viewer: axiom-programs node; Specs & contracts § 4
