# 0004 — Canonical concepts registry gates encoder applies

**Status:** shipped

## Context

LLM encoders invent plausible synonyms: the same legal concept (the
SNAP allotment, the member-of-household relation) lands under different
variable names across encodes, and downstream composition / oracle
mapping breaks on the drift. Review caught this late, after the wasted
iteration.

## Decision

One registry (`axiom-encode/src/axiom_encode/concepts/data/*.yaml`,
format `axiom-encode/concepts/v1`) maps each legal concept to exactly
one canonical variable name, a producer anchor (the file that
canonically produces it), and a list of blocked synonyms. It is
enforced at both ends of the pipeline:

- **Prompt-time** — registry directives are injected into the encoder
  prompt (scoped by text match) so the model picks approved names on
  the first pass.
- **Apply-time** — the validator refuses to install generated RuleSpec
  that uses a blocked synonym or claims a canonical name under the
  wrong producer anchor.

## Consequences

- Producer-YAML violations hard-block apply; `.test.yaml` violations are
  mechanically auto-repaired instead (model-invented test cases are not
  policy logic).
- `concepts-audit` walks the corpus for drift between producer rules and
  the registry, catching anything that predates enforcement.
- The registry is a curation surface that must grow with coverage
  (27 SNAP entries as of June 2026); an unregistered concept gets no
  protection.

## References

- axiom-encode `concepts/` (registry.py, validator.py, auto_repair.py)
- Viewer: axiom-encode node; Specs & contracts § 7
