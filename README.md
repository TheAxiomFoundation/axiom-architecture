# axiom-architecture

Interactive viewer for the Axiom Foundation ecosystem architecture. A React
app that walks a reader through the system in five additive scenes —
upstream sources, ingest, storage, encoding + execution, consumer
apps — with a clickable detail panel on each node that flips between
**External** (concepts + relationships) and **Internal** (mechanics,
gotchas, file paths, commands) modes.

Designed for onboarding, design reviews, partner walkthroughs, and the
public-facing story.

## Run locally

```bash
npm install
npm run dev
```

Opens at <http://localhost:5179>.

## What it shows

Sequential, additive scenes. Each step keeps every component from the
previous one and adds a new column to the right:

| Step | Adds |
|---|---|
| § 01 · Sources | Upstream publishers (eCFR, USC, state codes, laws-lois, IRS bulk) |
| § 02 · Ingest | Fetchers, parsers, source-first adapters, the JSONL artifact tree |
| § 03 · Storage | R2 (cold) and Supabase (live) tables — provisions + derived |
| § 04 · Encoding | axiom-encode, rulespec-* repos, axiom-rules-engine (Rust runtime), axiom-programs + axiom-compose (program assembly), axiom-oracles (validation) |
| § 05 · Pipeline | axiom-foundation.org, finbot, dashboard-builder, axiom-demo-shell |

Three documentation tabs live below the scenes in the sidebar:

- **Encoding playbook** — how to take a state benefit program end-to-end.
- **Specs & contracts** — the durable formats that hold the ecosystem
  together (RuleSpec v1, ProvisionRecord JSONL, citation paths, compose
  specs, proof atoms, signed apply manifests, the concepts registry,
  comparison reports, benchmark gates) and where each canonical
  definition lives.
- **Open questions** — internal architectural review.

Deeper write-ups live in `docs/` (`encoder-pipeline.md`,
`corpus-encoding-mapping.md`), and `docs/decisions/` holds the
architecture decision records — one page per cross-repo decision with a
load-bearing `Status` line (proposed / in-flight / shipped / superseded)
so "is this shipped yet?" has a checkable answer.

Click any node and the canvas highlights its direct neighbours; the right
panel shows what the node does, which repository owns it, and what reads
from / writes to it. Verb tags on each relationship (`writes` / `derives`
/ `reads`) make the dependency kind unambiguous.

## Detail modes

The toggle in the left sidebar controls how much depth shows in the right
panel:

- **External** — summary, About, Why this design, Repository, and the
  relationship graph. Public-facing.
- **Internal** — everything External shows, plus How it works (technical
  mechanics), Worth knowing (gotchas), Source paths, and Related
  commands.

Same NodeSpec data; two presentations.

## Data model

Everything lives in `src/architecture.ts`:

- `NODES` — one `NodeSpec` per component (id, label, layer, **repo**,
  summary, detail, plus optional `mechanics`, `rationale`, `important`,
  `files`, `commands`).
- `EDGES` — one `EdgeSpec` per relationship, kind ∈ `solid` / `derived`
  / `read`.
- `POS` — canonical x/y coordinates for every node. Each scene picks a
  subset; same node lands at the same coordinate everywhere.
- `LAYOUTS` — per-scene visible-node and edge sets.
- `REPOS` — repository registry.

To add a component: append a `NodeSpec`, add `EdgeSpec` entries, give it
a coordinate in `POS`, and reference its id in whichever layouts should
show it. UI, panels, legends, and repo grouping all derive from this
data.

## Edge styles

- **Solid black** — source-of-truth data flow.
- **Dashed brown, animated** — derived (rebuildable from upstream).
- **Dashed gray** — read-only consumer.

## Stack

- Vite + React 18 + TypeScript
- [@xyflow/react](https://reactflow.dev/) (React Flow v12) for the canvas
- No backend — static build deploys anywhere

## Deployment

Configured for Vercel via `vercel.json`. Push to `main` and Vercel
auto-builds with `npm run build` → `dist/`.

## Build

```bash
npm run build
```

Outputs static files to `dist/`. No runtime dependencies on a backend
or on the Axiom production database — the architecture description is
fully self-contained in `src/architecture.ts`.
