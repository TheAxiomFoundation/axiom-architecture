// Source-of-truth data model for the architecture viewer.
//
// One `NodeSpec` per component, one `EdgeSpec` per relationship.
// `repo` is load-bearing — every node lives somewhere. Adding a new
// component is a single entry here; UI / panels / layouts all derive
// from this file. Copy is deliberately terse: core facts only.

export type Layer =
  | "upstream"
  | "ingest"
  | "storage-cold"
  | "storage-hot"
  | "rules"
  | "consumer"
  | "platform";

export type Repo =
  | "axiom-corpus"
  | "axiom-encode"
  | "axiom-rules-engine"
  | "axiom-oracles"
  | "axiom-compose"
  | "axiom-api"
  | "axiom-mcp"
  | "axiom-foundation.org"
  | "axiom-demo-shell"
  | "axiom-scrapers"
  | "axiom-bills"
  | "axiom-microsim"
  | "rulespec-us"
  | "rulespec-non-us"
  | "demos"
  | "infrastructure"
  | "external";

export interface RepoSpec {
  id: Repo;
  label: string;
  description: string;
}

export const REPOS: RepoSpec[] = [
  { id: "axiom-corpus", label: "axiom-corpus", description: "Source ingestion, JSONL artifacts, Supabase loads." },
  { id: "axiom-encode", label: "axiom-encode", description: "Encoder pipeline: corpus in, validated RuleSpec out." },
  { id: "axiom-rules-engine", label: "axiom-rules-engine", description: "Rust runtime: compiles and executes RuleSpec." },
  { id: "axiom-oracles", label: "axiom-oracles", description: "Cross-engine validation + public coverage dashboard." },
  { id: "axiom-compose", label: "axiom-compose", description: "Deterministic program assembler." },
  { id: "axiom-api", label: "axiom-api", description: "Hosted HTTP API + SDKs." },
  { id: "axiom-mcp", label: "axiom-mcp", description: "MCP adapter over axiom-api (npm)." },
  { id: "axiom-foundation.org", label: "axiom-foundation.org", description: "Public web app; read-only corpus consumer." },
  { id: "axiom-demo-shell", label: "axiom-demo-shell", description: "Static demo landing page." },
  { id: "axiom-scrapers", label: "axiom-scrapers", description: "State statute scrapers (dormant since May 2026)." },
  { id: "axiom-bills", label: "axiom-bills", description: "Bill tracking + precomputed rule patches." },
  { id: "axiom-microsim", label: "axiom-microsim", description: "Population microsimulation on the engine." },
  { id: "rulespec-us", label: "rulespec-us", description: "US country monorepo: federal + states + programs/." },
  { id: "rulespec-non-us", label: "rulespec-*", description: "Country monorepos beyond the US — ~20 and growing." },
  { id: "demos", label: "demo apps", description: "Standalone demo repos deployed to Vercel." },
  { id: "infrastructure", label: "Managed infrastructure", description: "R2, Supabase, Modal, analytics — services, not source code." },
  { id: "external", label: "External publishers", description: "Official government sources. We snapshot; we never modify." },
];

export interface NodeSpec {
  id: string;
  label: string;
  layer: Layer;
  repo: Repo;
  summary: string;
  detail: string;
}

export interface EdgeSpec {
  from: string;
  to: string;
  label?: string;
  kind: "solid" | "derived" | "read";
}

export const NODES: NodeSpec[] = [
  // ── Upstream ──────────────────────────────────────────────────────
  {
    id: "ecfr",
    label: "eCFR",
    layer: "upstream",
    repo: "external",
    summary: "Federal regulations (CFR) in XML",
    detail:
      "ecfr.gov bulk XML, refreshed daily. Title-level downloads, walked " +
      "section by section into provision records.",
  },
  {
    id: "usc",
    label: "USC (USLM)",
    layer: "upstream",
    repo: "external",
    summary: "US Code in USLM XML",
    detail:
      "uscode.house.gov publishes USLM XML with stable hierarchical " +
      "identifiers (/us/usc/t26/s32) that map cleanly onto citation paths.",
  },
  {
    id: "state-sources",
    label: "State publishers",
    layer: "upstream",
    repo: "external",
    summary: "State legislature / agency sites",
    detail:
      "Every state publishes differently — HTML dumps, annual code releases, " +
      "PDF-only portals. One adapter per state.",
  },
  {
    id: "canada-source",
    label: "laws-lois.justice.gc.ca",
    layer: "upstream",
    repo: "external",
    summary: "Canadian federal acts (LIMS XML)",
    detail:
      "Justice Canada's consolidated acts as LIMS XML, bilingual upstream. " +
      "Ingested English-first.",
  },
  {
    id: "irs-bulk",
    label: "IRS bulk",
    layer: "upstream",
    repo: "external",
    summary: "Revenue procedures / rulings / notices",
    detail:
      "IRS guidance PDFs from irs.gov/pub/irs-drop, classified as guidance " +
      "vs rulemaking on ingest.",
  },

  // ── Ingest ────────────────────────────────────────────────────────
  {
    id: "fetchers",
    label: "Fetchers",
    layer: "ingest",
    repo: "axiom-corpus",
    summary: "Rate-limited HTTP download",
    detail:
      "Thin clients that fetch raw bytes from each publisher — no parsing, " +
      "no storage. Rate limits and retries live here so parsers stay " +
      "deterministic.",
  },
  {
    id: "parsers",
    label: "Parsers",
    layer: "ingest",
    repo: "axiom-corpus",
    summary: "Bytes → typed models",
    detail:
      "One parser per upstream format (USLM, LIMS, eCFR XML, state HTML, " +
      "CLML). Deterministic: same bytes, same models.",
  },
  {
    id: "adapters",
    label: "Source-first adapters",
    layer: "ingest",
    repo: "axiom-corpus",
    summary: "Typed models → ProvisionRecord + JSONL",
    detail:
      "One adapter per jurisdiction. Builds canonical citation paths, " +
      "derives deterministic UUID5 ids from them, writes the four artifact " +
      "trees (sources, inventory, provisions, coverage), and fails loudly " +
      "when coverage falls short of the inventory.",
  },
  {
    id: "artifacts",
    label: "data/corpus/",
    layer: "ingest",
    repo: "axiom-corpus",
    summary: "Local JSONL artifact tree",
    detail:
      "The contract between ingest and everything downstream. Byte-stable " +
      "writes; the same JSONL feeds both the R2 mirror and Supabase.",
  },
  {
    id: "scrapers",
    label: "axiom-scrapers",
    layer: "ingest",
    repo: "axiom-scrapers",
    summary: "State statute scrapers (dormant)",
    detail:
      "Per-state scrapers feeding corpus ingest. Dormant since May 2026 — " +
      "recent state ingestion goes through corpus-native scripts instead.",
  },
  {
    id: "bills",
    label: "axiom-bills",
    layer: "ingest",
    repo: "axiom-bills",
    summary: "Live bill tracker → rule patches",
    detail:
      "Tracks Congress.gov hourly and 21 state legislatures every six " +
      "hours, then precomputes diffs and drafts patched RuleSpec for " +
      "enacted text — the encoder receives ready-made patches, not just a " +
      "signal.",
  },

  // ── Cold storage ──────────────────────────────────────────────────
  {
    id: "r2",
    label: "R2 bucket",
    layer: "storage-cold",
    repo: "infrastructure",
    summary: "Durable provenance store",
    detail:
      "Cloudflare R2 mirror of the artifact tree: raw upstream bytes plus " +
      "every JSONL and coverage report. Supabase can be rebuilt from R2 " +
      "alone — no upstream re-fetch.",
  },

  // ── Hot storage (Supabase) ────────────────────────────────────────
  {
    id: "supabase",
    label: "Supabase",
    layer: "storage-hot",
    repo: "infrastructure",
    summary: "Postgres + PostgREST",
    detail:
      "Live serving database. Schemas: corpus, encodings, telemetry, app, " +
      "bills. RLS everywhere — public reads, no public writes.",
  },
  {
    id: "provisions",
    label: "corpus.provisions",
    layer: "storage-hot",
    repo: "infrastructure",
    summary: "Source of truth for legal text",
    detail:
      "One row per provision — ~1.75M and growing. Deterministic " +
      "UUID5(citation_path) ids make reloads idempotent. Everything else " +
      "in the corpus schema derives from this table.",
  },
  {
    id: "navigation",
    label: "corpus.navigation_nodes",
    layer: "storage-hot",
    repo: "infrastructure",
    summary: "Derived tree-navigation index",
    detail:
      "Precomputed parent/child rows for fast tree browsing, rebuilt " +
      "automatically on every load. Disposable by design.",
  },
  {
    id: "counts",
    label: "corpus.provision_counts",
    layer: "storage-hot",
    repo: "infrastructure",
    summary: "Materialized row counts",
    detail:
      "Per-(jurisdiction, doc type) counts, refreshed after every load. " +
      "Feeds the analytics dashboards.",
  },
  {
    id: "references",
    label: "corpus.provision_references",
    layer: "storage-hot",
    repo: "infrastructure",
    summary: "Cross-reference graph",
    detail:
      "Citing → cited provision links extracted from body text. Powers " +
      "cites / cited-by in the app.",
  },

  // ── Rules repos ───────────────────────────────────────────────────
  {
    id: "rulespec-us",
    label: "rulespec-us",
    layer: "rules",
    repo: "rulespec-us",
    summary: "US country monorepo",
    detail:
      "One YAML module per addressable section, mirroring citation paths; " +
      "durable ids like us:statutes/7/2017/a#rule. Federal law plus 30+ " +
      "state directories and the program compose specs, consolidated from " +
      "the old per-state repos in June 2026.",
  },
  {
    id: "rules-other",
    label: "rulespec-*",
    layer: "rules",
    repo: "rulespec-non-us",
    summary: "Country monorepos beyond the US",
    detail:
      "One monorepo per sovereign legal system — ~20 countries now (UK, " +
      "Canada, Belgium, Germany, Denmark, New Zealand, Nigeria, Tanzania, " +
      "Vietnam…). UK and Canada are the deepest; a July 2026 wave opened " +
      "the rest.",
  },
  {
    id: "axiom-compose",
    label: "axiom-compose",
    layer: "rules",
    repo: "axiom-compose",
    summary: "Deterministic program assembler",
    detail:
      "(spec, atomic rules) → runnable program, as a pure function. No " +
      "per-program code anywhere: generic transformation patterns plus " +
      "declarative YAML specs kept in each country repo's programs/ " +
      "directory.",
  },

  // ── Consumers ─────────────────────────────────────────────────────
  {
    id: "axiom-foundation",
    label: "axiom-foundation.org",
    layer: "consumer",
    repo: "axiom-foundation.org",
    summary: "Main web app + ops dashboard",
    detail:
      "Public corpus browser: URLs map to citation paths, tree navigation " +
      "reads navigation_nodes, /ops shows pipeline health. Read-only " +
      "against the corpus.",
  },
  {
    id: "finbot",
    label: "finbot",
    layer: "consumer",
    repo: "demos",
    summary: "Financial-advice demo",
    detail:
      "Chat demo that computes eligibility on the rules engine and cites " +
      "the exact provisions behind every number.",
  },
  {
    id: "dashboard-builder",
    label: "dashboard-builder",
    layer: "consumer",
    repo: "demos",
    summary: "Dashboard demo",
    detail:
      "Assembles policy dashboards on top of the corpus and the engine.",
  },
  {
    id: "axiom-encode",
    label: "axiom-encode",
    layer: "consumer",
    repo: "axiom-encode",
    summary: "Encoder pipeline",
    detail:
      "Reads the corpus, drafts RuleSpec with LLMs, and forces every draft " +
      "through the gauntlet: engine compile, 50+ deterministic checks, " +
      "oracle comparison, independent AI review. Applies are signed and " +
      "provenance-gated. Never writes to the corpus.",
  },
  {
    id: "axiom-rules-engine",
    label: "axiom-rules-engine",
    layer: "consumer",
    repo: "axiom-rules-engine",
    summary: "Rust engine — compiles + executes RuleSpec",
    detail:
      "Lowers RuleSpec YAML to an internal IR, compiles it, and executes " +
      "over entity-scoped time periods. Two modes: explain (per-rule " +
      "provenance traces) and fast (vectorized batches). CLI binary + " +
      "Python bindings.",
  },
  {
    id: "axiom-oracles",
    label: "axiom-oracles",
    layer: "consumer",
    repo: "axiom-oracles",
    summary: "Oracle comparison + coverage dashboard",
    detail:
      "Runs the same cases through Axiom and external calculators — " +
      "PolicyEngine, TAXSIM, ACCESS NYC, EUROMOD/UKMOD — and publishes " +
      "agreement rates to a weekly-regenerated public dashboard. A new " +
      "comparison is one YAML file.",
  },
  {
    id: "microsim",
    label: "axiom-microsim",
    layer: "consumer",
    repo: "axiom-microsim",
    summary: "Population microsimulation",
    detail:
      "PolicyEngine-free microsim over the Enhanced CPS, executing " +
      "compiled programs on the Rust engine. Weighted costs, deciles, " +
      "reform deltas; web UI with reform sliders.",
  },
  {
    id: "axiom-demo-shell",
    label: "axiom-demo-shell",
    layer: "consumer",
    repo: "axiom-demo-shell",
    summary: "Demo landing page",
    detail:
      "Static page presenting the demo surfaces as Infrastructure → " +
      "Validation → Application. No build step, no dependencies.",
  },

  // ── Platform ──────────────────────────────────────────────────────
  {
    id: "axiom-api",
    label: "axiom-api",
    layer: "platform",
    repo: "axiom-api",
    summary: "Rule-native HTTP API + SDKs",
    detail:
      "Search, retrieve, explain, and execute rules behind API keys (Hono " +
      "on Vercel, OpenAPI-first). Calculation runs on a Modal-hosted engine " +
      "build — 16 compiled runtime packages today. Ships TypeScript + " +
      "Python SDKs.",
  },
  {
    id: "axiom-mcp",
    label: "axiom-mcp",
    layer: "platform",
    repo: "axiom-mcp",
    summary: "MCP server for agents",
    detail:
      "npm @axiom-foundation/mcp — a thin stdio adapter over axiom-api. " +
      "14 tools, no server-side state; every call is a passthrough with " +
      "the caller's API key.",
  },
  {
    id: "analytics",
    label: "GA4 → Axiom CRM",
    layer: "platform",
    repo: "infrastructure",
    summary: "Product-analytics loop",
    detail:
      "Every public surface reports GA4 events to one shared property with " +
      "a per-tool dimension; the CRM reads it for per-tool usage.",
  },
];

export const EDGES: EdgeSpec[] = [
  { from: "ecfr", to: "fetchers", kind: "solid" },
  { from: "usc", to: "fetchers", kind: "solid" },
  { from: "state-sources", to: "fetchers", kind: "solid" },
  { from: "canada-source", to: "fetchers", kind: "solid" },
  { from: "irs-bulk", to: "fetchers", kind: "solid" },

  { from: "fetchers", to: "parsers", kind: "solid", label: "bytes" },
  { from: "parsers", to: "adapters", kind: "solid", label: "typed models" },
  { from: "adapters", to: "artifacts", kind: "solid", label: "JSONL" },

  { from: "artifacts", to: "r2", kind: "solid", label: "sync-r2" },
  { from: "artifacts", to: "provisions", kind: "solid", label: "load-supabase" },

  { from: "provisions", to: "navigation", kind: "derived", label: "build-nav-index" },
  { from: "provisions", to: "counts", kind: "derived", label: "RPC refresh" },
  { from: "provisions", to: "references", kind: "derived", label: "extract-references" },

  // Both rules edges into navigation share the has_rulespec verb;
  // label only one to keep the canvas readable.
  { from: "rulespec-us", to: "navigation", kind: "derived", label: "has_rulespec" },
  { from: "rules-other", to: "navigation", kind: "derived" },

  { from: "provisions", to: "axiom-encode", kind: "read" },
  { from: "axiom-encode", to: "rulespec-us", kind: "solid", label: "writes YAML" },
  { from: "axiom-encode", to: "rules-other", kind: "solid" },

  // Cross-column reads (storage → apps).
  { from: "navigation", to: "axiom-foundation", kind: "read" },
  { from: "provisions", to: "axiom-foundation", kind: "read" },
  { from: "provisions", to: "finbot", kind: "read" },
  { from: "provisions", to: "dashboard-builder", kind: "read" },
  { from: "r2", to: "axiom-foundation", kind: "read", label: "ops analytics" },

  // Program assembly: the country repos carry both rules and compose
  // specs; the composer emits runnable programs for the engine.
  { from: "rulespec-us", to: "axiom-compose", kind: "read", label: "rules + specs" },
  { from: "rules-other", to: "axiom-compose", kind: "read" },
  { from: "axiom-compose", to: "axiom-rules-engine", kind: "derived", label: "runnable program" },

  // axiom-rules-engine compiles + executes the RuleSpec YAML.
  { from: "rulespec-us", to: "axiom-rules-engine", kind: "read", label: "compiles" },
  { from: "rules-other", to: "axiom-rules-engine", kind: "read" },
  { from: "axiom-rules-engine", to: "finbot", kind: "solid", label: "executes" },
  { from: "axiom-rules-engine", to: "dashboard-builder", kind: "solid" },
  { from: "axiom-rules-engine", to: "microsim", kind: "solid" },
  { from: "axiom-compose", to: "microsim", kind: "derived", label: "compiled programs" },

  // axiom-oracles validates against external oracles.
  { from: "rulespec-us", to: "axiom-oracles", kind: "read", label: "compares" },
  { from: "axiom-compose", to: "axiom-oracles", kind: "derived" },
  { from: "axiom-rules-engine", to: "axiom-oracles", kind: "read" },

  // axiom-demo-shell links out to the demo surfaces.
  { from: "axiom-foundation", to: "axiom-demo-shell", kind: "read", label: "links" },
  { from: "finbot", to: "axiom-demo-shell", kind: "read" },
  { from: "dashboard-builder", to: "axiom-demo-shell", kind: "read" },
  { from: "microsim", to: "axiom-demo-shell", kind: "read" },

  // Parallel ingest.
  { from: "state-sources", to: "scrapers", kind: "solid", label: "scrapes" },
  { from: "scrapers", to: "adapters", kind: "solid", label: "section files" },
  { from: "bills", to: "supabase", kind: "solid", label: "sync-supabase" },
  { from: "bills", to: "axiom-encode", kind: "read", label: "rule patches" },

  // Platform surface.
  { from: "rulespec-us", to: "axiom-api", kind: "read", label: "GitHub index" },
  { from: "axiom-rules-engine", to: "axiom-api", kind: "solid", label: "Modal runtime" },
  { from: "axiom-api", to: "axiom-mcp", kind: "solid", label: "HTTP · API key" },

  // Product-analytics loop.
  { from: "axiom-foundation", to: "analytics", kind: "read", label: "GA4 events" },
  { from: "microsim", to: "analytics", kind: "read" },
  { from: "axiom-demo-shell", to: "analytics", kind: "read" },
];

export type Layout = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  nodes: Array<{ id: string; x: number; y: number }>;
  edges: EdgeSpec[];
};

const N = (id: string, x: number, y: number) => ({ id, x, y });

const edgesAmong = (ids: Set<string>) =>
  EDGES.filter((e) => ids.has(e.from) && ids.has(e.to));

// Sequential, ADDITIVE story arc. Each scene keeps every node from the
// previous one and adds a new column to the right. Column x-positions
// are consistent across scenes so the same node lands at the same
// coordinate in every scene.

// Canonical positions, used by every scene below.
const POS: Record<string, [number, number]> = {
  // Col 1 — upstream publishers
  ecfr: [40, 80],
  usc: [40, 240],
  "state-sources": [40, 400],
  "canada-source": [40, 560],
  "irs-bulk": [40, 720],
  // Col 2 — ingest
  fetchers: [460, 200],
  parsers: [460, 420],
  adapters: [460, 640],
  scrapers: [460, 860],
  // Col 3 — artifacts + bills
  artifacts: [880, 420],
  bills: [880, 800],
  // Col 4 — storage tier
  r2: [1300, 40],
  provisions: [1300, 240],
  navigation: [1300, 420],
  counts: [1300, 600],
  references: [1300, 760],
  supabase: [1300, 920],
  // Col 5 — encoder + country monorepos
  "axiom-encode": [1720, 80],
  "rulespec-us": [1720, 320],
  "rules-other": [1720, 560],
  // Col 6 — program assembly + API platform
  "axiom-compose": [2140, 320],
  "axiom-api": [2140, 880],
  // Col 7 — execution + validation + MCP
  "axiom-rules-engine": [2560, 320],
  "axiom-oracles": [2560, 640],
  "axiom-mcp": [2560, 940],
  // Col 8 — consumer apps
  "axiom-foundation": [2980, 80],
  finbot: [2980, 280],
  "dashboard-builder": [2980, 460],
  microsim: [2980, 640],
  // Col 9 — demo shell + analytics
  "axiom-demo-shell": [3400, 380],
  analytics: [3400, 700],
};

const pos = (id: string) => N(id, POS[id][0], POS[id][1]);
const placeAll = (ids: string[]) => ids.map(pos);

// Each scene's "visible nodes" is cumulative: scene N = scene N-1 + new ones.
const SOURCES_IDS = ["ecfr", "usc", "state-sources", "canada-source", "irs-bulk"];

const INGEST_NEW_IDS = ["fetchers", "parsers", "adapters", "artifacts", "scrapers"];

const STORAGE_NEW_IDS = [
  "r2",
  "provisions",
  "navigation",
  "counts",
  "references",
  "supabase",
  "bills",
];

const ENCODING_NEW_IDS = [
  "axiom-encode",
  "rulespec-us",
  "rules-other",
  "axiom-rules-engine",
  "axiom-compose",
  "axiom-oracles",
];

const CONSUMER_NEW_IDS = [
  "axiom-foundation",
  "finbot",
  "dashboard-builder",
  "microsim",
  "axiom-demo-shell",
];

const PLATFORM_NEW_IDS = ["axiom-api", "axiom-mcp", "analytics"];

const SOURCES_VISIBLE = SOURCES_IDS;
const INGEST_VISIBLE = [...SOURCES_VISIBLE, ...INGEST_NEW_IDS];
const STORAGE_VISIBLE = [...INGEST_VISIBLE, ...STORAGE_NEW_IDS];
const ENCODING_VISIBLE = [...STORAGE_VISIBLE, ...ENCODING_NEW_IDS];
const PIPELINE_VISIBLE = [...ENCODING_VISIBLE, ...CONSUMER_NEW_IDS];
const PLATFORM_VISIBLE = [...PIPELINE_VISIBLE, ...PLATFORM_NEW_IDS];

export const LAYOUTS: Layout[] = [
  {
    id: "sources",
    title: "Where the corpus begins",
    eyebrow: "Sources",
    description: "Official publishers. We snapshot — never modify the source.",
    nodes: placeAll(SOURCES_VISIBLE),
    edges: edgesAmong(new Set(SOURCES_VISIBLE)),
  },
  {
    id: "ingest",
    title: "Add the ingest layer",
    eyebrow: "Ingest",
    description:
      "Fetch → parse → adapt. Everything lands in a JSONL artifact tree — " +
      "the contract every downstream stage reads.",
    nodes: placeAll(INGEST_VISIBLE),
    edges: edgesAmong(new Set(INGEST_VISIBLE)),
  },
  {
    id: "storage",
    title: "Add the storage tier",
    eyebrow: "Storage",
    description:
      "The same JSONL fills a durable R2 mirror and a live Supabase. " +
      "corpus.provisions is the source of truth; the rest derives from it.",
    nodes: placeAll(STORAGE_VISIBLE),
    edges: edgesAmong(new Set(STORAGE_VISIBLE)),
  },
  {
    id: "encoding",
    title: "Add encoding + execution",
    eyebrow: "Encoding",
    description:
      "The encoder writes validated RuleSpec into the country monorepos; " +
      "compose assembles programs; the Rust engine executes them; oracles " +
      "cross-check the results.",
    nodes: placeAll(ENCODING_VISIBLE),
    edges: edgesAmong(new Set(ENCODING_VISIBLE)),
  },
  {
    id: "end-to-end",
    title: "Add the consumers",
    eyebrow: "Pipeline",
    description:
      "The web app, demos, and microsim read the corpus and execute on the " +
      "engine.",
    nodes: placeAll(PIPELINE_VISIBLE),
    edges: edgesAmong(new Set(PIPELINE_VISIBLE)),
  },
  {
    id: "platform",
    title: "Add the platform surface",
    eyebrow: "Platform",
    description:
      "One API for partners and agents, an MCP surface for Claude and " +
      "friends, and the shared analytics loop.",
    nodes: placeAll(PLATFORM_VISIBLE),
    edges: edgesAmong(new Set(PLATFORM_VISIBLE)),
  },
];

export function neighborsOf(
  nodeId: string,
  edges: EdgeSpec[],
): {
  incoming: { node: NodeSpec; edge: EdgeSpec }[];
  outgoing: { node: NodeSpec; edge: EdgeSpec }[];
} {
  const byId = new Map(NODES.map((n) => [n.id, n]));
  const incoming: { node: NodeSpec; edge: EdgeSpec }[] = [];
  const outgoing: { node: NodeSpec; edge: EdgeSpec }[] = [];
  for (const edge of edges) {
    if (edge.to === nodeId) {
      const node = byId.get(edge.from);
      if (node) incoming.push({ node, edge });
    } else if (edge.from === nodeId) {
      const node = byId.get(edge.to);
      if (node) outgoing.push({ node, edge });
    }
  }
  return { incoming, outgoing };
}
