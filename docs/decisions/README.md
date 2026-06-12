# Architecture decision records

One short page per significant, cross-repo architectural decision:
context, the decision, current status, and links to the implementing
PRs. The `Status` line is the load-bearing field — it is the answer to
"is this shipped yet?", and exists because this site once presented an
unmerged design (the country-monorepo world) as current reality.

Statuses: **proposed** · **in-flight** (decided, implementation PRs open
or migration incomplete) · **shipped** · **superseded**.

| # | Decision | Status |
|---|---|---|
| [0001](0001-country-monorepo-consolidation.md) | One country monorepo per sovereign legal system | in-flight |
| [0002](0002-compose-replaces-checked-in-compositions.md) | axiom-compose replaces checked-in composition YAMLs | in-flight |
| [0003](0003-signed-apply-manifests.md) | Every encoder apply writes a signed manifest | shipped |
| [0004](0004-concepts-registry-as-apply-gate.md) | Canonical concepts registry gates encoder applies | shipped |
| [0005](0005-program-specs-home.md) | Program compose specs live in axiom-programs, then move into country monorepos | in-flight |

Adding a record: copy the section shape of an existing one, take the
next number, add a row here. When a decision ships or is superseded,
update its `Status` line and this table in the same PR.
