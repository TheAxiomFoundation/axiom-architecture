# 0003 — Every encoder apply writes a signed manifest

**Status:** shipped

## Context

`axiom-encode encode --apply` installs model-generated RuleSpec into
canonical law repos. During the CalFresh production ship, silent drift
(naming, output paths, source verification) cost real encodes — and
once a file is in a rulespec-* repo there was no way to prove which
encoder version, model, prompt, or trace produced it, or whether it had
been hand-edited afterwards.

## Decision

Apply is fail-closed and attributable. Every apply writes a manifest
(schema `axiom-encode/applied-rulespec/v1`) to
`.axiom/encoding-manifests/<path>.json` in the target repo, signed with
HMAC-SHA256 (key id `axiom-encode-apply-v1`, keyed by
`AXIOM_ENCODE_APPLY_SIGNING_KEY` — no key, no apply). The payload
carries the axiom-encode version and git commit (the checkout must be
clean and versioned), the generation prompt SHA256, model/backend,
trace and context-manifest hashes, and the SHA256 of every applied file.

## Consequences

- Any byte drift in applied files or provenance fails verification —
  tamper-evident, not just logged.
- Dirty or unversioned encoder checkouts are rejected, so every applied
  manifest is reproducible. (Operationally: applying from a development
  checkout requires a version bump first.)
- The signing key is a deployment dependency; batch encoding pipelines
  block without it.

## References

- axiom-encode `cli.py` (`_apply_generated_encoding_result`,
  `_sign_applied_encoding_manifest`)
- Viewer: axiom-encode node; Specs & contracts § 6
