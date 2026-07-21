// Source-of-truth data model for the architecture viewer.
//
// One `NodeSpec` per component, one `EdgeSpec` per relationship.
// `repo` is load-bearing — every node lives somewhere, and the
// "By repository" scene partitions by it. Adding a new component is
// a single entry here; UI / panels / layouts all derive from this file.

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
  | "axiom-programs"
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
  {
    id: "axiom-corpus",
    label: "axiom-corpus",
    description: "Source-document ingestion, JSONL artifacts, Supabase loads. This repo.",
  },
  {
    id: "axiom-encode",
    label: "axiom-encode",
    description:
      "Encoder pipeline. Reads corpus, writes RuleSpec YAML. The axiom-encode-* " +
      "directories on disk are git worktrees of this one repo, not separate components.",
  },
  {
    id: "axiom-rules-engine",
    label: "axiom-rules-engine",
    description:
      "Rust runtime engine: compiles + executes RuleSpec YAML. CLI binary + Python bindings.",
  },
  {
    id: "axiom-oracles",
    label: "axiom-oracles",
    description:
      "Oracle comparison toolkit. Runs programs through Axiom + PolicyEngine + TAXSIM + " +
      "ACCESS NYC + EUROMOD/UKMOD for validation. 20-entry comparisons registry, weekly " +
      "unattended regeneration, and a public Next.js coverage dashboard on Vercel.",
  },
  {
    id: "axiom-compose",
    label: "axiom-compose",
    description:
      "Deterministic program assembler: spec + atomic rulespec corpus → runnable program, no per-program code anywhere. Consumes compose specs (axiom-programs / country-monorepo programs/); replaces checked-in composition YAMLs and precompiled artifacts in consumers.",
  },
  {
    id: "axiom-programs",
    label: "axiom-programs",
    description:
      "Declarative compose specs. One YAML per (jurisdiction, program, period), " +
      "plus precomposed artifacts under artifacts/ for deployments without " +
      "axiom-compose. Specs were copied into rulespec-us programs/ at the June 2026 " +
      "consolidation; this repo remains the staging home and the two copies can drift.",
  },
  {
    id: "axiom-api",
    label: "axiom-api",
    description:
      "Rule-native HTTP platform (Hono on Vercel): search, retrieve, explain, and " +
      "execute RuleSpecs behind API keys. Ships vendored TypeScript + Python SDKs; " +
      "heavy compute runs on a Modal-hosted build of axiom-rules-engine.",
  },
  {
    id: "axiom-mcp",
    label: "axiom-mcp",
    description:
      "MCP server adapter over axiom-api (npm @axiom-foundation/mcp, v0.1.2). Runs " +
      "on the client machine via stdio; every tool is a passthrough to the HTTP API.",
  },
  {
    id: "axiom-foundation.org",
    label: "axiom-foundation.org",
    description: "Public-facing web app. Read-only consumer of the corpus.",
  },
  {
    id: "axiom-demo-shell",
    label: "axiom-demo-shell",
    description:
      "Static landing page presenting ten demo surfaces in a guided Infrastructure → " +
      "Validation → Application pipeline. Pure HTML/CSS/JS.",
  },
  {
    id: "axiom-scrapers",
    label: "axiom-scrapers",
    description:
      "State statute scrapers (19 states); output feeds corpus ingest. Dormant since " +
      "May 2026 — recent state ingestion has gone through corpus-native scripts instead.",
  },
  {
    id: "axiom-bills",
    label: "axiom-bills",
    description:
      "Live bill tracker (Congress.gov hourly + 21 state legislatures every 6h) that " +
      "precomputes rule-patch variants for the encoding pipeline.",
  },
  {
    id: "axiom-microsim",
    label: "axiom-microsim",
    description:
      "PE-free population microsimulation over the Enhanced CPS, executing on " +
      "axiom-rules-engine. Three programs: CO SNAP, federal income tax, federal CTC.",
  },
  {
    id: "rulespec-us",
    label: "rulespec-us",
    description:
      "US country monorepo since 2026-06-12 (PR #395, merged with history): federal " +
      "us/, 32 us-{state}/ dirs, programs/ compose specs, tests/. ~3,040 encoded " +
      "modules. The 18 standalone state repos are archived tombstones.",
  },
  {
    id: "rulespec-non-us",
    label: "rulespec-uk · rulespec-ca",
    description:
      "Non-US country monorepos: rulespec-uk consolidated uk/ + " +
      "uk-kingston-upon-thames/ + programs/ on 2026-06-12 (PR #43); rulespec-ca " +
      "is mid-sprint on Canada 2026 provincial tax + benefits.",
  },
  {
    id: "demos",
    label: "finbot-snap-demo · dashboard-builder",
    description:
      "Standalone demo repos deployed to Vercel; embedded by axiom-demo-shell, " +
      "not by axiom-foundation.org.",
  },
  {
    id: "infrastructure",
    label: "Managed infrastructure",
    description:
      "Cloudflare R2, Supabase, Modal compute, and the GA4 → CRM analytics loop — " +
      "not source code.",
  },
  {
    id: "external",
    label: "External publishers",
    description: "Government sources outside our control. We snapshot; we don't change.",
  },
];

export interface NodeSpec {
  id: string;
  label: string;
  layer: Layer;
  repo: Repo;
  summary: string;
  detail: string;
  // Optional deep-detail fields. Render only when present so trivial
  // nodes (e.g. external publishers) stay terse and important nodes
  // (ingest, storage, encoding) carry the depth a reader needs.
  mechanics?: string;
  rationale?: string;
  important?: string[];
  files?: string[];
  commands?: string[];
  source?: string;
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
      "ecfr.gov, run by the National Archives, is the live electronic Code of Federal " +
      "Regulations. Bulk XML downloads, refreshed daily as agencies file rule changes.",
    mechanics:
      "extract-ecfr fetches title-level XML bundles (workers configurable, 600s timeout " +
      "per request), then walks them part-by-part to emit one ProvisionRecord per " +
      "section/paragraph. The XML preserves hierarchy (title → chapter → part → subpart → " +
      "section) and the adapter keeps that hierarchy intact in citation_path.",
    important: [
      "Title 7 (USDA / SNAP regs) is the most-encoded slice today — ~10 of the 24 rulespec-us " +
        "encodings live there.",
      "Federal regulation paths drop the publication suffix: rulespec-us stores " +
        "regulations/7-cfr/273/7.yaml but the corpus row is us/regulation/7/273/7. The " +
        "adapter normalises this via _normalize_tail.",
      "Section-by-section iteration via lxml's root.iter() can be slow on Title 26 " +
        "(thousands of sections); no indexed XPath shortcut.",
    ],
    commands: ["inventory-ecfr", "extract-ecfr"],
  },
  {
    id: "usc",
    label: "USC (USLM)",
    layer: "upstream",
    repo: "external",
    summary: "US Code in USLM XML",
    detail:
      "uscode.house.gov publishes the US Code as USLM (United States Legislative Markup) " +
      "XML. Title-by-title bulk downloads with a stable, self-describing structure — every " +
      "element has a hierarchical identifier (/us/usc/t26/s32) and the XML carries its own " +
      "schema metadata.",
    mechanics:
      "extract-usc consumes one USLM XML file at a time, walking <title> → <chapter> → " +
      "<section> → <subsection>. The parser detects USLM namespace dynamically (USLM " +
      "appears from both GPO and House sources with slightly different URIs) via " +
      "root.tag inspection. Section iteration uses namespace-aware XPath: " +
      "root.iter(f\"{{{ns_uri}}}section\"). Identifier extraction parses '/s' splits.",
    important: [
      "Title 26 (Internal Revenue Code) is the most policy-relevant title — most tax " +
        "RuleSpec encoding pulls from here.",
      "USLM ids round-trip cleanly: /us/usc/t26/s32 becomes us/statute/26/32.",
      "Namespace detection by URL inspection is fragile — multiple possible namespaces " +
        "mean unfamiliar variants won't parse without hardcoding.",
    ],
    commands: ["inventory-usc", "extract-usc", "extract-usc-dir"],
  },
  {
    id: "state-sources",
    label: "State publishers",
    layer: "upstream",
    repo: "external",
    summary: "State legislature / agency sites",
    detail:
      "Each state publishes its statutes (and sometimes regulations and policy) " +
      "differently. Texas ships ZIPs of HTML; Indiana publishes annual code dumps; " +
      "Colorado serves agency rules through the Secretary of State's CCR portal; " +
      "smaller states publish PDFs only.",
    mechanics:
      "Per-state adapter modules under src/axiom_corpus/corpus/state_adapters/ each know " +
      "their state's quirks: download method, HTML structure, hierarchy markers. They all " +
      "produce ProvisionRecord with the same canonical citation_path shape " +
      "(us-{state}/{doc_type}/...). Common runtime helpers — BeautifulSoup + lxml, " +
      "ProvisionCoverageReport — live alongside.",
    important: [
      "Most state corpora are SHALLOW: section-level rows with no chapter or title " +
        "containers. That's an upstream-publisher artifact, not a navigation bug.",
      "50 states + DC are represented; coverage varies — statute-only for many, statute + " +
        "regulations + policy for a few.",
      "Each state adapter is 300-1500 lines depending on the upstream complexity. They " +
        "share the CorpusArtifactStore + ProvisionRecord contract, not parsing logic.",
    ],
    files: ["src/axiom_corpus/corpus/state_adapters/"],
    commands: [
      "extract-state-statutes",
      "extract-indiana-code",
      "extract-montana-code",
      "extract-nevada-nrs",
      "extract-oregon-ors",
      "extract-texas-tcas",
      "extract-{state}-…",
    ],
  },
  {
    id: "canada-source",
    label: "laws-lois.justice.gc.ca",
    layer: "upstream",
    repo: "external",
    summary: "Canadian federal acts (LIMS XML)",
    detail:
      "Canada's Department of Justice publishes consolidated federal Acts as LIMS XML " +
      "(Legal Information Management System, http://justice.gc.ca/lims namespace). ~956 " +
      "acts total. Bilingual (English + French) but split across per-language URLs.",
    mechanics:
      "CanadaLegislationFetcher.list_all_acts() scrapes alphabetical index pages " +
      "(/eng/acts/{A-Z}.html) for hrefs matching r'([A-Z][A-Za-z0-9.-]*)/index\\.html'. " +
      "download_act streams /eng/XML/{cn}.xml via requests (64 KB chunks). " +
      "CanadaStatuteParser walks <Section> → <Subsection> → <Paragraph> → <Subparagraph> → " +
      "<Clause> recursively, extracting LIMS namespace attributes (inforce-start-date, " +
      "lastAmendedDate, lims:id). extract-canada-acts inserts an act-level container row " +
      "(canada/statute/{cn}) so each act has a navigable root.",
    rationale:
      "Bringing Canada into the source-first pipeline was the May 2026 structural fix — " +
      "before that, citation_path was null on every Canada row.",
    important: [
      "Until May 2026 the legacy ingest left citation_path=null on every Canada row. " +
        "Fixed by switching to the source-first adapter and re-extracting in place via " +
        "load-supabase --replace-scope.",
      "The fetcher uses requests, not httpx, for the streaming download — httpx hung " +
        "reliably on _ssl__SSLSocket_read for files >10 MB (e.g., I-3.3 at ~13 MB) on " +
        "darwin. Caught in May 2026; fix is one line in download_act.",
      "Currently 161 of ~956 acts ingested. The rest exist as XML upstream but haven't " +
        "been pulled yet.",
      "English only for now; French content is in separate XMLs we haven't wired up.",
      "LIMS XML is non-standard and undocumented — the parser is empirically derived from " +
        "live specimens. Watch for upstream schema drift.",
    ],
    files: [
      "src/axiom_corpus/corpus/canada.py",
      "src/axiom_corpus/fetchers/legislation_canada.py",
      "src/axiom_corpus/parsers/canada/statutes.py",
      "src/axiom_corpus/models_canada.py",
    ],
    commands: ["extract-canada-acts"],
  },
  {
    id: "irs-bulk",
    label: "IRS bulk",
    layer: "upstream",
    repo: "external",
    summary: "Revenue procedures / rulings / notices",
    detail:
      "Internal Revenue Service publishes guidance documents (Revenue Procedures, " +
      "Revenue Rulings, Notices, Announcements) as PDFs at irs.gov/pub/irs-drop/.",
    mechanics:
      "IRSBulkFetcher combines HTML scraping (BeautifulSoup over paginated drop-folder " +
      "listings) with regex pattern matching (GUIDANCE_PATTERN = r'(rp|rr|n|a)-(\\d{2})-" +
      "(\\d+)\\.pdf') to enumerate documents. The pipeline composes download → " +
      "PDFTextExtractor → IRSDocumentParser → IRSParameterExtractor, optionally driven by " +
      "a storage callback for incremental loading.",
    important: [
      "Document classification matters — 'guidance' vs 'rulemaking' is meaningful in the " +
        "corpus and affects how the app renders them.",
      "Yearly filter + type filter applied at the listing stage to bound work.",
      "Listing pagination relies on string-matching ?page= in HTML; fragile if IRS " +
        "changes their template.",
    ],
    files: ["src/axiom_corpus/fetchers/irs_bulk.py"],
  },

  // ── Ingest ────────────────────────────────────────────────────────
  {
    id: "fetchers",
    label: "Fetchers",
    layer: "ingest",
    repo: "axiom-corpus",
    summary: "HTTP download, rate-limited",
    detail:
      "Thin HTTP clients that fetch raw bytes from upstream publishers. One module per " +
      "source family. Returns bytes only — no parsing, no storage. Isolates HTTP " +
      "concerns from everything downstream.",
    mechanics:
      "Each fetcher exposes a small surface: typically list_*() to enumerate available " +
      "documents and download_*() to retrieve one. Rate limits, retries, and " +
      "authentication concerns live here. CanadaLegislationFetcher uses a lazy " +
      "httpx.Client (line 69 of legislation_canada.py) with a configurable rate_limit " +
      "(default 0.5s between requests). Downloads stream in 64 KB chunks. IRSBulkFetcher " +
      "uses a coordinated fetch+extract pipeline with optional progress and storage " +
      "callbacks so the pipeline composes cleanly with later stages.",
    rationale:
      "Separating HTTP from parsing lets parsers stay deterministic and trivially " +
      "testable — a flaky upstream doesn't propagate into parser tests, and a parser " +
      "bug doesn't poison the fetcher cache. Fetchers are injectable; adapters accept a " +
      "fetcher param so tests pass fakes.",
    important: [
      "The Canada fetcher uses requests (not httpx) for downloads — the httpx client " +
        "reliably hung in _ssl__SSLSocket_read on darwin when streaming >10 MB acts. " +
        "Switch lives at one line in CanadaLegislationFetcher.download_act.",
      "Rate limits are baked in (typically 0.5s between requests). Don't bypass — most " +
        "upstreams will rate-limit or block.",
      "Manual time.sleep() rate limiting is thread-unsafe. Concurrent fetchers using " +
        "the same instance bypass the limit.",
      "User-Agent strings identify us as 'Axiom/1.0 (legislation archiver; " +
        "contact@axiom-foundation.org)' — keep that intact for upstream operators.",
      "No checkpointing today. If a bulk run fails halfway, you restart from scratch " +
        "unless the artifact store has the prior session's downloads.",
    ],
    files: [
      "src/axiom_corpus/fetchers/legislation_canada.py",
      "src/axiom_corpus/fetchers/ecfr.py",
      "src/axiom_corpus/fetchers/irs_bulk.py",
      "src/axiom_corpus/fetchers/irs_parser.py",
      "src/axiom_corpus/fetchers/legislation_uk.py",
      "src/axiom_corpus/fetchers/pdf_extractor.py",
    ],
    source: "src/axiom_corpus/fetchers/",
  },
  {
    id: "parsers",
    label: "Parsers",
    layer: "ingest",
    repo: "axiom-corpus",
    summary: "Bytes → typed domain models",
    detail:
      "Each parser knows exactly one upstream format. USLM (US Code), LIMS (Canada), " +
      "eCFR XML, state-specific HTML, CLML (UK). Output is typed Pydantic / dataclass " +
      "models — CanadaSection, IndianaCodeProvision, RegulationSubsection — never " +
      "strings or untyped dicts.",
    mechanics:
      "Heavy use of lxml for XML and BeautifulSoup for HTML. CanadaStatuteParser " +
      "lazily loads the XML tree (line 49 of parsers/canada/statutes.py) and yields " +
      "CanadaSection via iter_sections(). Each section carries marginal note, full body " +
      "text, parsed-via-_parse_subsections subsection chain, LIMS temporal attributes " +
      "(inforce-start-date, lastAmendedDate), historical notes, and cross-references " +
      "extracted from <XRefExternal> and <XRefInternal>. Subsection labels are stored " +
      "with parentheses ('(1)', '(a)', '(i)'); the adapter strips them when building " +
      "paths.",
    rationale:
      "Format complexity lives here so adapters don't have to think about XML " +
      "namespaces or HTML quirks. When a format upstream changes, only one parser breaks.",
    important: [
      "Parsers must be deterministic on the same input bytes. No timestamps, no random " +
        "IDs. Re-running the parser on the same bytes always yields the same model " +
        "objects.",
      "Lazy tree loading via @property means a 13 MB LIMS XML doesn't sit in memory " +
        "until queried.",
      "USLM namespace detection is dynamic because GPO and House.gov ship slightly " +
        "different URIs — root.tag inspection picks the right one at runtime.",
      "Subsection labels stored with parens ('(1)') but stripped when building citation " +
        "paths ('1'). Consumers must normalise if they want to display labels.",
      "Parsing failures are logged and skipped — bad sections don't kill the run, but " +
        "they silently drop from output.",
    ],
    files: [
      "src/axiom_corpus/parsers/canada/statutes.py",
      "src/axiom_corpus/parsers/us/statutes.py",
      "src/axiom_corpus/parsers/cfr.py",
      "src/axiom_corpus/parsers/clml.py",
      "src/axiom_corpus/models_canada.py",
      "src/axiom_corpus/models_regulation.py",
    ],
    source: "src/axiom_corpus/parsers/",
  },
  {
    id: "adapters",
    label: "Source-first adapters",
    layer: "ingest",
    repo: "axiom-corpus",
    summary: "Typed models → ProvisionRecord + JSONL",
    detail:
      "The heart of the source-first pipeline. One adapter per jurisdiction, each " +
      "responsible for projecting parser output into the canonical ProvisionRecord shape " +
      "and writing four parallel artifact trees: sources/, inventory/, provisions/, " +
      "coverage/.",
    mechanics:
      "Adapter loops over parser output, builds canonical citation_paths " +
      "({jurisdiction}/{doc_type}/{segments…}), computes deterministic UUID5 ids " +
      "(uuid5(NAMESPACE_URL, f'axiom:{citation_path}')), and calls " +
      "CorpusArtifactStore.write_*() to emit artifacts. extract_canada_acts (canada.py) " +
      "is a representative example: per-act, it downloads bytes, sha256-tracks them into " +
      "sources/, parses with CanadaStatuteParser, emits an act-level container row " +
      "(canada/statute/{cn}), then per-section ProvisionRecord (with parent_citation_path " +
      "back to the act), then recursively emits subsections via _emit_subsections. " +
      "Path segments strip parens via _label_segment ((a) → a). Each adapter ends by " +
      "running compare_provision_coverage and writing the diff report.",
    rationale:
      "The 'source-first' contract: JSONL on disk is the boundary between adapters and " +
      "everything downstream. Adapters can change internals freely; consumers stay " +
      "stable. Same JSONL produces both R2 mirror and Supabase rows. Source-first means " +
      "the inventory is the assertion ('we expected these citations'), provisions is " +
      "the result ('we extracted these'), and coverage is the audit trail.",
    important: [
      "Citation path is the canonical id. Format: {jurisdiction}/{doc_type}/{segments}. " +
        "First segment must equal jurisdiction. Path becomes input to UUID5 → row id.",
      "Deterministic UUID5 means re-runs are upserts in place. Two pipelines processing " +
        "the same source produce the same ids — no drift, no duplicates.",
      "Coverage report compares expected citations to actual rows. Adapter exits " +
        "non-zero unless --allow-incomplete is passed.",
      "Path conventions vary subtly by jurisdiction: us-co/regulation/ optionally has " +
        "@variant suffixes; US federal regulation drops -cfr from titles; Indiana uses " +
        "dashes within segments (1-2-3) rather than slashes.",
      "June 2026 widened the funnel: Belgium came in via ELI ingestion (corpus #151-153, " +
        "the first EU jurisdiction), and legacy Word (.doc/.docx) official documents " +
        "became ingestible (#156). A large Medicaid/CHIP/Medicare + multi-state " +
        "TANF/SSP source push landed the same month (#133-163).",
      "Each adapter is ~300-1500 lines depending on upstream complexity. They share " +
        "the CorpusArtifactStore + ProvisionRecord contract, not parsing logic.",
      "Inventory + provisions are both kept on disk so coverage can be diffed. " +
        "Mismatch counts surface in the coverage JSON and the extract command exit code.",
    ],
    files: [
      "src/axiom_corpus/corpus/canada.py",
      "src/axiom_corpus/corpus/colorado.py",
      "src/axiom_corpus/corpus/ecfr.py",
      "src/axiom_corpus/corpus/usc.py",
      "src/axiom_corpus/corpus/state_adapters/",
      "src/axiom_corpus/corpus/coverage.py",
    ],
    commands: [
      "extract-ecfr",
      "extract-usc",
      "extract-canada-acts",
      "extract-state-statutes",
      "extract-colorado-ccr",
      "coverage",
    ],
    source: "src/axiom_corpus/corpus/",
  },
  {
    id: "artifacts",
    label: "data/corpus/",
    layer: "ingest",
    repo: "axiom-corpus",
    summary: "Local JSONL artifact tree",
    detail:
      "Filesystem layout holding the intermediate state of every extract. Four " +
      "parallel trees — sources, inventory, provisions, coverage — keyed identically. " +
      "Same key structure mirrors to R2. CorpusArtifactStore (artifacts.py) is the " +
      "single class that builds paths and writes files.",
    mechanics:
      "Path scheme (per artifacts.py):\n" +
      "  sources/{jur}/{doc}/{run_id}/{name}        raw upstream bytes\n" +
      "  inventory/{jur}/{doc}/{run_id}.json        expected citations (JSON)\n" +
      "  provisions/{jur}/{doc}/{run_id}.jsonl      ProvisionRecord per line\n" +
      "  coverage/{jur}/{doc}/{run_id}.json         inventory ↔ provisions diff\n" +
      "  exports/{format}/{jur}/{doc}/{ver}/        external format conversions\n\n" +
      "All path components run through safe_segment() to reject empty, '.', '..', or " +
      "slash-containing values. write_bytes uses tempfile + atomic rename. write_json " +
      "uses sort_keys=True + 2-space indent for stable diffs. write_provisions writes " +
      "one JSON object per line (sort_keys=True), final newline if non-empty. Every " +
      "write returns the SHA256 of bytes written.",
    rationale:
      "JSONL is the contract between adapter and loader. Append-friendly, line-streamable, " +
      "grep-friendly, diff-friendly in git. Same line-oriented file produces both R2 " +
      "mirror (sync-r2) and Supabase rows (load-supabase). Atomic writes via tempfile " +
      "prevent partial state if the process crashes mid-write.",
    important: [
      "Each JSONL line is one ProvisionRecord.to_mapping() encoded with sort_keys=True. " +
        "Two runs on the same input produce byte-identical files — critical for " +
        "deterministic diffs and content-addressed storage.",
      "Required JSONL fields per line: jurisdiction, document_class, citation_path. " +
        "Everything else is optional and emitted only when non-null.",
      "Reader is NOT streaming today — load_provisions reads the whole file then " +
        "splits. Fine for current sizes (<300 MB) but would OOM on multi-GB inputs.",
      "UTF-8 throughout. Tolerates French ligatures, em-dashes, fancy quotes.",
      "iter_provision_files walks the tree and returns paths matching a filter — used " +
        "by bulk operations like artifact-report.",
    ],
    files: [
      "src/axiom_corpus/corpus/artifacts.py",
      "src/axiom_corpus/corpus/io.py",
      "src/axiom_corpus/corpus/coverage.py",
    ],
  },

  // ── Cold storage ──────────────────────────────────────────────────
  {
    id: "r2",
    label: "R2 bucket",
    layer: "storage-cold",
    repo: "infrastructure",
    summary: "Durable provenance store",
    detail:
      "Cloudflare R2 bucket 'axiom-corpus'. Mirror of the local data/corpus/ tree, " +
      "same key layout. Holds raw upstream bytes plus all JSONL artifacts and coverage " +
      "reports.",
    mechanics:
      "load_r2_config (r2.py) bootstraps credentials from env vars (R2_ACCESS_KEY_ID + " +
      "R2_SECRET_ACCESS_KEY), AWS_* legacy names, or a JSON file at " +
      "~/.config/axiom-foundation/r2-credentials.json with multiple naming conventions. " +
      "Falls back to a default account id if no endpoint is supplied. sync_artifacts_" +
      "to_r2 walks the local tree via iter_local_artifacts, lists remote via boto3 " +
      "list_objects_v2 paginator, diffs by (key present + size match). Upload candidates " +
      "are sent in parallel via ThreadPoolExecutor with configurable worker count, each " +
      "writing SHA256 into the R2 object metadata. Scope filtering via " +
      "_artifact_matches_scope() parses the key into (artifact_type, jurisdiction, " +
      "document_class, version) and filters before upload.",
    rationale:
      "Provenance / forensics. Lets you replay any historical ingest, prove what was " +
      "ingested when, and serve large assets without hitting Supabase. The full " +
      "pipeline can rebuild Supabase from R2 alone — no upstream re-fetch needed.",
    important: [
      "Diff is size-based, not hash-based. Changed content with identical byte count " +
        "won't retrigger upload unless --force.",
      "R2 gained its first production reader in June 2026: the axiom-foundation.org " +
        "/ops dashboard reads analytics/*-current.json (state-statute completion, " +
        "regulation completion, artifact report, validate-release) straight from the " +
        "bucket. Provision serving still never touches R2.",
      "Credentials at ~/.config/axiom-foundation/r2-credentials.json. Missing creds → " +
        "RuntimeError mentioning both env-var and file paths.",
      "build_artifact_report_with_r2 produces a three-way health check: local files vs " +
        "R2 inventory vs Supabase provision counts.",
      "Bucket size sub-GB today, well within R2's free tier.",
    ],
    files: ["src/axiom_corpus/corpus/r2.py"],
    commands: [
      "sync-r2",
      "artifact-report",
      "release-artifact-manifest",
      "validate-release",
    ],
  },

  // ── Hot storage (Supabase) ────────────────────────────────────────
  {
    id: "supabase",
    label: "Supabase",
    layer: "storage-hot",
    repo: "infrastructure",
    summary: "Postgres + PostgREST",
    detail:
      "Managed Postgres + PostgREST hosted by Supabase. Live serving database for the " +
      "whole ecosystem. Five schemas in active use: corpus (legal text + navigation), " +
      "encodings (encoder run history), telemetry (observability), app (frontend " +
      "state), and bills (tracked legislation + precomputed rule patches).",
    mechanics:
      "Apps read via REST endpoints with `Accept-Profile: corpus` header to scope to " +
      "the corpus schema. Writes go through `Content-Profile: corpus` POST/DELETE with " +
      "`Prefer: resolution=merge-duplicates,return=minimal` for idempotent upserts. " +
      "PostgREST routing is controlled at the role level: " +
      "`ALTER ROLE authenticator SET pgrst.db_schemas = " +
      "'public,graphql_public,corpus,encodings,telemetry,app'` (corpus_schema.sql).",
    important: [
      "Project ref: swocpijqqahhuwtuahwc. URL: swocpijqqahhuwtuahwc.supabase.co.",
      "Service-role key needed for writes; anon key suffices for reads.",
      "RLS is enabled on every corpus table. Public SELECT, no public writes.",
      "Service key resolution: SUPABASE_SERVICE_ROLE_KEY env var first, then " +
        "SUPABASE_ACCESS_TOKEN as fallback (loader fetches the service-role key via " +
        "the Management API at api.supabase.com/v1/projects/{ref}/api-keys).",
      "Every corpus table sets `SET search_path = corpus, public` on its functions so " +
        "SECURITY DEFINER RPCs don't accidentally hit the public schema.",
    ],
  },
  {
    id: "provisions",
    label: "corpus.provisions",
    layer: "storage-hot",
    repo: "infrastructure",
    summary: "Source of truth for legal text",
    detail:
      "The primary table in the corpus schema. One row per provision. Millions of rows " +
      "(~1.75M at the May 2026 snapshot; growing with the Medicaid/TANF/Belgium " +
      "ingestion waves). Holds body text plus 20+ metadata columns.",
    mechanics:
      "Loaded by load_provisions_to_supabase (supabase.py). The loader chunks records " +
      "(default 500/chunk), projects each through provision_to_supabase_row (which sets " +
      "deterministic UUID5 id from citation_path and derives parent_id from " +
      "parent_citation_path), and POSTs to /rest/v1/provisions?on_conflict=id with " +
      "merge-duplicates resolution. With --preserve-existing-ids, fetch_existing_" +
      "provision_ids batch-queries by citation_path to keep historical ids stable. " +
      "With --replace-scope, delete_supabase_provisions_scope cursor-paginates all rows " +
      "in (jurisdiction, doc_type) and deletes them in chunks first, ordered by " +
      "(-level, id) to delete deepest children first.",
    rationale:
      "Single source of truth for legal text. Every other corpus.* surface " +
      "(navigation_nodes, provision_counts, references) is derived from this table and " +
      "rebuildable in minutes. UUID5(citation_path) means same path → same id, forever — " +
      "no row drift across re-runs.",
    important: [
      "IDs are deterministic UUID5(NAMESPACE_URL, f'axiom:{citation_path}'). Stable " +
        "across re-runs. Re-loading the same JSONL is a no-op.",
      "Loader projects parent_id from parent_citation_path automatically — adapters " +
        "set the path, the loader sets the id.",
      "Schema is intentionally wide: id, jurisdiction, doc_type, parent_id, level, " +
        "ordinal, heading, body, source_url, source_path, citation_path, rulespec_path, " +
        "has_rulespec, source_document_id, source_as_of, expression_date, language, " +
        "legal_identifier, identifiers (jsonb), plus FTS column.",
      "Key indexes: idx_provisions_orphan_citation_prefix_ordinal " +
        "(citation_path text_pattern_ops, ordinal) WHERE parent_id IS NULL — the " +
        "text_pattern_ops opclass enables LIKE 'prefix%' lookups under C-locale; " +
        "without it those queries do a sequential scan.",
      "idx_provisions_jurisdiction_doc_type_id covers scope-replace queries. " +
        "INCLUDE (level) lets the planner avoid a heap fetch for ordering.",
      "Parent FK uses ON DELETE SET NULL — partial tree deletes orphan children rather " +
        "than cascading, which is safer for scope-based replace operations.",
      "citation_path is nullable today — a holdover from the original Canada ingestion. " +
        "Once Canada is fully re-extracted we should ALTER TABLE … SET NOT NULL.",
    ],
    commands: ["load-supabase", "export-supabase", "snapshot-provision-counts"],
  },
  {
    id: "navigation",
    label: "corpus.navigation_nodes",
    layer: "storage-hot",
    repo: "infrastructure",
    summary: "Derived tree-navigation index",
    detail:
      "Precomputed parent/child rows for fast tree navigation. ~1.75M rows. Each row " +
      "carries path, parent_path, segment, label, sort_key, depth, child_count, " +
      "has_children, has_rulespec, encoded_descendant_count, status, plus timestamps.",
    mechanics:
      "build_navigation_nodes (navigation.py) runs five stages: (1) filter & dedupe " +
      "records by citation_path; (2) resolve parent_path per record — explicit " +
      "parent_citation_path wins if it exists in scope, otherwise walk path-prefix " +
      "segments upward until an ancestor is found, otherwise root; (3) _break_parent_" +
      "cycles scans for cycles (A→B→A or longer) and promotes one member to root using " +
      "lexicographic min so the result is deterministic; (4) _resolve_depths walks the " +
      "parent chain with memoised recursion and a cycle-guard stack; (5) build " +
      "NavigationNode per record with deterministic id (uuid5 of 'axiom-navigation:' + " +
      "path), sort_key (8-digit ordinal + lowercased segment with 12-digit zero-padded " +
      "numeric runs so 2 < 10), has_rulespec OR-merged with encoded_paths, and bottom-up " +
      "encoded_descendant_count accumulation. Final sort by (parent_path, sort_key, path). " +
      "write_navigation_nodes_to_supabase materializes, groups by scope, deletes stale " +
      "rows scope-by-scope (existing-paths minus new-paths), upserts in chunks of 500.",
    rationale:
      "The app's tree navigation used to scan corpus.provisions with prefix-LIKE; it " +
      "kept timing out on big scopes. navigation_nodes turns that into a single indexed " +
      "parent_path query. Disposable by design — rebuild any time. Builder is " +
      "deterministic: same input always produces byte-identical output.",
    important: [
      "Auto-rebuilt as a post-step of load-supabase for every loaded scope (since " +
        "PR #23).",
      "Five indexes: unique(path), (parent_path, sort_key), (jurisdiction, doc_type, " +
        "parent_path, sort_key), partial (parent_path, sort_key) WHERE " +
        "encoded_descendant_count > 0 OR has_rulespec — the encoded-only browser query, " +
        "and partial (provision_id) WHERE provision_id IS NOT NULL.",
      "has_rulespec is set at rebuild time by walking local rules-* checkouts. " +
        "encoded_descendant_count rolls up bottom-up.",
      "Status field is editorial metadata (e.g. 'deprecated', 'in-review'). Preserved " +
        "across rebuilds via fetch_navigation_statuses + _apply_navigation_status_" +
        "overrides — fresh overrides only win when non-empty, so None doesn't clobber " +
        "curated state.",
      "Cycle handling: _break_parent_cycles is deterministic — picks the lexicographic " +
        "min of the cycle as the new root every time, so two runs with the same input " +
        "produce the same broken-edge.",
      "Sharp edge: if you run load-supabase in CI without local rules-* checkouts, the " +
        "rebuild silently demotes has_rulespec=false for paths whose encoding the " +
        "checkout-less worker can't see. Mitigate via --rulespec-repo flag or by " +
        "running outside CI.",
      "Sort_key encodes natural order: ordinal slot first (or 'zzzzzzzz' if no " +
        "ordinal), then '|', then segment lowercased with 12-digit zero-padded " +
        "numeric runs. 'Section 10A' becomes 'section 000000000010a' under the hood.",
    ],
    files: [
      "src/axiom_corpus/corpus/navigation.py",
      "src/axiom_corpus/corpus/navigation_supabase.py",
      "src/axiom_corpus/corpus/rulespec_paths.py",
      "supabase/migrations/20260505120000_corpus_navigation_nodes.sql",
    ],
    commands: ["build-navigation-index"],
  },
  {
    id: "counts",
    label: "corpus.provision_counts",
    layer: "storage-hot",
    repo: "infrastructure",
    summary: "Materialized view",
    detail:
      "Per-(jurisdiction, doc_type) row counts. Refreshed via SQL RPC at the end of " +
      "every load-supabase run. Plus a sibling corpus.current_provision_counts that " +
      "filters to the active release.",
    mechanics:
      "MV computes provision_count, body_count, top_level_count (parent_id IS NULL), " +
      "rulespec_count (has_rulespec IS TRUE), and refreshed_at(now()) per scope. " +
      "Refreshed by the refresh_corpus_analytics() RPC (statement_timeout=0). Called " +
      "by load_provisions_to_supabase at the end of every run unless --skip-refresh. " +
      "Failures are caught; with --allow-refresh-failure the upsert succeeds " +
      "regardless.",
    rationale:
      "Counting 1.75M rows live across all jurisdictions is slow. Materialized view " +
      "gives the analytics dashboard a cheap snapshot to read from. Refresh on every " +
      "load keeps the dashboard in sync without manual intervention.",
    important: [
      "Can drift if the refresh times out and --allow-refresh-failure was passed. " +
        "Re-running load-supabase (or the refresh_corpus_analytics RPC directly) fixes it.",
      "Read by the analytics dashboard, artifact-report, and state-statute-completion.",
      "corpus.current_provision_counts (sibling MV, filtered by corpus.release_scopes) " +
        "is what the public app shows; corpus.provision_counts includes legacy rows.",
    ],
    commands: ["snapshot-provision-counts", "analytics"],
  },
  {
    id: "references",
    label: "corpus.provision_references",
    layer: "storage-hot",
    repo: "infrastructure",
    summary: "Cross-reference graph",
    detail:
      "Graph of inter-provision citations. Each row links a citing provision to a " +
      "cited one. Built by extract-references walking provision body text.",
    rationale:
      "Powers the app's 'cited by' / 'cites' UI. Without this, finding cross-references " +
      "would require scanning every body text on every request.",
    commands: ["extract-references"],
  },

  // ── Rules repos (country monorepos since 2026-06-12) ─────────────
  {
    id: "rulespec-us",
    label: "rulespec-us",
    layer: "rules",
    repo: "rulespec-us",
    summary: "US country monorepo — federal + 32 states + programs/",
    detail:
      "The US RuleSpec country monorepo. Since PR #395 merged (2026-06-12, " +
      "history-preserving merge commit) it holds federal law under us/ (~606 " +
      "modules), 32 us-{state}/ dirs, programs/ compose specs (18 files), and " +
      "tests/ — ~3,040 encoded modules total. Deepest states: NC (497), CA (378), " +
      "SC (367), CO (364), MA (224), TN (176). One YAML per addressable " +
      "section/subsection.",
    mechanics:
      "Layout mirrors citation paths: us/statutes/26/3101/a.yaml ↔ us/statute/26/3101/a; " +
      "state law lives at us-{state}/… with durable ids carrying the jurisdiction " +
      "prefix (us-ca:regulations/mpp/63-300/1#rule). Each YAML begins with format: " +
      "rulespec/v1 plus a module block (summary, source citations, source " +
      "verification). Rules have a kind (parameter / derived / reiteration), dtype " +
      "(Money, Rate, Judgment), entity scope, period scope, and versions keyed by " +
      "effective_from. Formulas are Python-like expressions parsed by the " +
      "axiom-rules-engine Rust engine at compile time. State files import federal " +
      "rules via canonical paths (us:statutes/7/2017/a) — now an intra-repo import, " +
      "one atomic commit for cross-jurisdiction changes.",
    rationale:
      "Encoding lives apart from the corpus so encoding cadence and corpus cadence " +
      "stay independent. One monorepo per sovereign legal system (ADR 0001) replaced " +
      "the 18 standalone state repos — those are archived tombstones on GitHub since " +
      "2026-06-27. Durable rule ids stayed byte-identical through the consolidation.",
    important: [
      "Coupling to corpus is by citation_path only — no foreign keys, no row references.",
      "The June–July 2026 encoding wave is multi-state TANF / state cash assistance " +
        "(TX, MT, AL, AR, CT, MA TAFDC, AK ATAP, WA SSP…) plus Medicaid MAGI " +
        "eligibility groups and community-engagement requirements — 91 commits in the " +
        "last week of June alone.",
      "programs/ holds compose specs (programs/us-{state}/{program}/fy-2026.yaml) " +
        "copied in from axiom-programs at consolidation — the two homes can drift; " +
        "axiom-oracles vendors its own copies as a third.",
      "Content debt surfaced at consolidation is ratcheted in " +
        "known-validation-gaps.yaml and known-dangling.yaml — the lists only shrink.",
      "Reiteration-kind rules are coverage markers (state provisions restating " +
        "federal rules); no-ops at execution time.",
      "Tests reference rules by durable id ('us:statutes/7/2017/a#snap_regular_" +
        "month_allotment') and run against the compiled module, not individual rules.",
      "Path mapping mirrored in axiom-corpus rulespec_paths.py and " +
        "axiom-foundation.org repo-listing.ts. Keep them in sync.",
      "Stragglers outside the monorepo: rulespec-us-or (local-only Oregon SNAP " +
        "scaffold, no GitHub repo, no us-or/ dir) and rulespec-us-ut (bare policies/ " +
        "dir, not even a git repo). The rulespec-us-medicaid-* dirs on disk are " +
        "feature-branch clones of this repo, not separate repos.",
    ],
    files: [
      "rulespec-us/us/",
      "rulespec-us/us-{state}/",
      "rulespec-us/programs/",
      "rulespec-us/tests/",
      "rulespec-us/known-validation-gaps.yaml",
    ],
  },
  {
    id: "rules-other",
    label: "rulespec-uk · rulespec-ca",
    layer: "rules",
    repo: "rulespec-non-us",
    summary: "Non-US country monorepos",
    detail:
      "rulespec-uk consolidated on 2026-06-12 (PR #43, mirroring the US): uk/ national " +
      "law, uk-kingston-upon-thames/ council law, programs/, data/, tests/, " +
      "validation_baselines/ — 159 modules, Universal Credit the deepest slice, VAT " +
      "landing July 2026. rulespec-ca (97 modules) is mid-sprint on the Canada 2026 " +
      "tax year: T2203 provincial Part 3 credits for every province/territory, CWB, " +
      "EI repayment, HBP/LLP under policies/{cra,esdc,revenu-quebec}.",
    important: [
      "rulespec-ca uses a ROOT layout (policies/ at repo root), unlike the " +
        "bucket-per-jurisdiction monorepo layout — axiom-foundation.org needed " +
        "explicit support (#95) before Canada encodings surfaced.",
      "rulespec-ca maps from canada/* corpus paths. The canada jurisdiction slug is " +
        "non-obvious — JURISDICTION_REPO_MAP['canada'] = 'rulespec-ca', not 'rulespec-canada'.",
      "Local-checkout trap: ~/rulespec-uk is a stale empty placeholder with zero " +
        "commits; the real UK monorepo clone is ~/rulespec-uk-official.",
    ],
  },

  // ── Consumers ─────────────────────────────────────────────────────
  {
    id: "axiom-foundation",
    label: "axiom-foundation.org",
    layer: "consumer",
    repo: "axiom-foundation.org",
    summary: "Main web app + ops dashboard",
    detail:
      "Public-facing browser of the corpus at axiom-foundation.org. Next.js app " +
      "deployed to Vercel. URL pattern /axiom/* maps directly to citation_path. " +
      "June 2026 added a live ops dashboard (/ops), a unified ranked search " +
      "(/axiom/search) with a search-first landing page, and a documentation map " +
      "(/docs) + system overview (/stack).",
    mechanics:
      "Four Supabase clients in src/lib/supabase.ts, one per schema (corpus, encodings, " +
      "telemetry, plus the public auth client). Tree navigation queries " +
      "corpus.navigation_nodes by parent_path (the indexed btree query). Body text " +
      "comes from corpus.current_provisions — the release-filtered view of " +
      "corpus.provisions. When an encoded rule exists in a rulespec repo but " +
      "encoding_runs hasn't been backfilled, the app falls back to GitHub raw fetch " +
      "with a 1-hour cache. The /ops dashboard (src/lib/corpus-status.ts, " +
      "force-dynamic, 300s revalidate) merges four sources: R2 analytics JSON " +
      "(coverage + release validation + artifact sync), the corpus.get_corpus_stats " +
      "RPC, encodings.encoding_runs telemetry (7-day lookback with explicit " +
      "degraded/unavailable states), and GitHub repo activity. Live JSON at " +
      "/api/ops/encoding (no-store).",
    rationale:
      "Read-only consumer of the corpus. It also hosts its own public read API " +
      "(app.axiom-foundation.org/api/axiom/*, schema 2026-04-25) backed directly by " +
      "Supabase — deliberately separate from the standalone axiom-api platform, " +
      "which it does not consume. Multi-schema client isolation prevents heavy " +
      "telemetry queries from competing with corpus reads.",
    important: [
      "Does NOT consume axiom-api. /api/axiom/* here is foundation.org's own " +
        "Supabase-backed read API; axiom-api-eta.vercel.app is a different service.",
      "Search logs queries + clicks to Supabase and uses a data-driven lexicon; " +
        "encoded-rule search hits a Supabase index with GitHub fallback (#89, #93).",
      "Canada encodings needed root-layout rulespec repo support (#95) — rulespec-ca " +
        "has policies/ at the repo root, unlike the monorepo bucket layout (#86).",
      "src/lib/axiom/repo-map.ts is authoritative for jurisdiction → rulespec repo " +
        "mapping. axiom-corpus mirrors it in rulespec_paths.py; keep in sync.",
      "Ops coverage table distinguishes counts_mode 'live' vs 'report' so the " +
        "encoded column stays honest when a source is stale.",
      "Deep links use ?mark=term URL param to highlight search terms in the rendered " +
        "body.",
      "Never writes to Supabase corpus tables; search logging is the one write path.",
    ],
    files: [
      "axiom-foundation.org/src/lib/supabase.ts",
      "axiom-foundation.org/src/lib/corpus-status.ts",
      "axiom-foundation.org/src/app/ops/page.tsx",
      "axiom-foundation.org/src/lib/axiom/repo-map.ts",
      "axiom-foundation.org/src/lib/axiom/rulespec/repo-listing.ts",
      "axiom-foundation.org/src/app/axiom/[[...segments]]/page.tsx",
    ],
  },
  {
    id: "finbot",
    label: "finbot",
    layer: "consumer",
    repo: "demos",
    summary: "Financial advice demo",
    detail:
      "Demo that combines corpus citations with RuleSpec computation to answer " +
      "benefit / tax questions in natural language. Standalone repo " +
      "(finbot-snap-demo, deployed at finbot-snap-demo.vercel.app) — one of the ten " +
      "surfaces in axiom-demo-shell's Application tier.",
    mechanics:
      "Calls Supabase REST + a RuleSpec runtime to compute eligibility / benefit " +
      "amounts, then surfaces the actual source provisions that drove the answer. " +
      "Cites corpus paths inline so the user can trace any number back to a real law.",
  },
  {
    id: "dashboard-builder",
    label: "dashboard-builder",
    layer: "consumer",
    repo: "demos",
    summary: "Dashboard demo",
    detail:
      "Demo for assembling policy dashboards on top of the corpus. Standalone repo " +
      "deployed at dashboard-builder-flax.vercel.app. rulespec-graph-viewer — the " +
      "interactive RuleSpec computation-DAG viewer — was extracted from this repo " +
      "and now ships as its own demo surface.",
  },
  {
    id: "axiom-encode",
    label: "axiom-encode",
    layer: "consumer",
    repo: "axiom-encode",
    summary: "Encoder pipeline",
    detail:
      "Drives the creation of RuleSpec YAML for provisions in the corpus. Combines " +
      "LLM workflows with structured validation, signed apply manifests, and a " +
      "growing set of deterministic post-encode repair commands.",
    mechanics:
      "Reads corpus.provisions to know what provisions exist. For a target provision, " +
      "builds an isolated workspace (source.txt + auto-selected precedent context: " +
      "child fragments, peer subsections, cross-references, definition stubs), then " +
      "drafts a candidate RuleSpec via prompt orchestration (Codex CLI by default, " +
      "OpenAI Responses API and Claude CLI also wired). The prompt mandates proof " +
      "atoms on every rule — typed citations (amount, condition, formula, table_cell, " +
      "import …) tying each executable element to exact source text — and injects " +
      "directives from the canonical-concept registry so the model picks approved " +
      "variable names on first pass. Generated YAML then runs a four-tier validator " +
      "pipeline: engine compile → 50+ CI checks (ungrounded-literal detection, proof " +
      "validation, subparagraph coverage, test execution) → oracle comparison " +
      "(PolicyEngine within 2% tolerance) → four parallel LLM reviewers. " +
      "`--apply` re-validates in a temp policy-repo overlay with deterministic " +
      "repairs between attempts, signs an HMAC-sha256 manifest with versioned " +
      "encoder provenance, enforces the concept registry (refusing blocked synonyms " +
      "or drifting producer anchors), and refuses to overwrite a target whose " +
      "declared corpus_citation_path differs from the incoming file. Run history " +
      "(scores, iterations, agent transcripts) lands in encodings.encoding_runs.",
    rationale:
      "Encoding is the bottleneck for downstream usefulness. Any tool that compounds " +
      "encoder throughput — concept registry, repair commands, oracle comparators — " +
      "is high-leverage. Hardening the apply surface matters because silent drift " +
      "(naming, output paths, source verification) cost real production encodes " +
      "during the CalFresh ship and is much more expensive to recover than to prevent.",
    important: [
      "One-way dependency on corpus. The encoder NEVER writes to corpus.provisions.",
      "Closes the feedback loop indirectly — the next navigation rebuild observes " +
        "newly-authored YAML and sets has_rulespec=true.",
      "Canonical-concept registry (src/axiom_encode/concepts/data/snap.yaml) locks " +
        "each legal concept to one approved variable name; 27 SNAP entries today, " +
        "loaded data-driven via concepts/registry.py. Apply-time validator refuses " +
        "drift; prompt-time injection prevents drift.",
      "Output paths split dotted leaves (CDSS-style `63-503.132` → " +
        "`regulations/mpp/63-503/132.yaml`) and derive from the requested citation, " +
        "not the resolver-returned path. Apply-time collision guard prevents silent " +
        "overwrites of sibling encodes.",
      "41 `repair-*` subcommands handle deterministic post-encode fixups so most " +
        "former CI failures become local one-liners — new families cover Medicaid " +
        "(community-engagement dates, category composition), state-specific SNAP " +
        "surfaces, nonnegative floors, and oracle parameter tests.",
      "Lower-authority source gate (#909/#931): modules grounded below " +
        "statute/regulation authority need module.source_verification." +
        "upstream_source_check; `check-source-staleness` exits 1 on source_sha256 " +
        "mismatch.",
      "`eval-suite` runs benchmark manifests (16 suites under benchmarks/) with " +
        "readiness gates — min success / compile / CI / zero-ungrounded / oracle " +
        "pass rates, max mean cost — resumable via a suite-results.jsonl ledger.",
      "Per-program oracle comparators live in axiom-encode, called by axiom-oracles " +
        "comparison runners: `snap-ecps-compare`, `tax-ecps-compare` (section-by-" +
        "section PolicyEngine mappings, growing), `efrs-uk` for UK Universal Credit / " +
        "Pension Credit, plus the June–July wave: TANF/SSP comparators (NY, WA, MA " +
        "TAFDC, AK ATAP, MN MFIP, CT/AL/IL SSP…), Medicaid MAGI + Populace parity, " +
        "direct-variable Populace comparators for SNAP and federal tax, AOTC parity, " +
        "and UK VAT. `concepts-audit` walks the corpus for name-drift against the " +
        "canonical-concept registry, which gates `encode --apply`.",
      "Apply provenance gate changed shape: instead of a numeric version floor, " +
        "`--apply` now refuses to run unless a committed encoder version bump is in " +
        "the diff (_require_axiom_encode_version_provenance) and " +
        "AXIOM_ENCODE_APPLY_SIGNING_KEY is set. Current version: 0.2.1053.",
      "Telemetry lands in encodings.encoding_runs (run id, iterations, scores, " +
        "agent_model, session_id, file_path) plus a linked SDK-style session " +
        "(session_id=encode-<run_id>). Missing Supabase creds → runs are silently " +
        "NOT synced (stderr warning); `sync-applied-runs` backfills idempotently " +
        "from signed apply manifests, which are the durable record " +
        "(.axiom/encoding-manifests/ in each rulespec repo).",
    ],
  },
  {
    id: "axiom-rules-engine",
    label: "axiom-rules-engine",
    layer: "consumer",
    repo: "axiom-rules-engine",
    summary: "Rust engine — compiles + executes RuleSpec",
    detail:
      "The core Rust runtime that turns RuleSpec YAML into computation. Parses + " +
      "lowers RuleSpec to ProgramSpec (an internal IR), compiles it into optimized " +
      "artifacts, and executes rules over entity-scoped temporal periods. Two execution " +
      "modes: explain (trace-based, per-rule provenance) and fast (dense vectorized " +
      "evaluation via native extension). Distributed as a Rust CLI binary + Python " +
      "bindings.",
    mechanics:
      "Three pipeline stages. (1) RuleSpec lowering (src/rulespec.rs): reads YAML with " +
      "explicit discriminators (format: rulespec/v1 or schema: axiom.rules.*), resolves " +
      "cross-repo imports using jurisdiction prefixes (us:, us-co:, …), recursively " +
      "merges imported files with cycle detection. Every rule gets a durable id of the " +
      "form <jurisdiction>:<filepath>#<rule_name>. (2) Compilation (src/compile.rs): " +
      "topologically sorts derived-rule dependencies, validates acyclicity, generates " +
      "fast-path metadata (blockers: judgment outputs, complex relations, variable-" +
      "length lookups). Artifact serialises to JSON. (3) Execution (src/engine.rs, " +
      "src/dense.rs): reference engine traces dependencies and produces explain output; " +
      "the dense engine (native Rust ext) vectorises across batches of entities for " +
      "orders-of-magnitude speedups when the rule set is dense-compatible.",
    rationale:
      "RuleSpec is the sole authoring surface; production rules live in jurisdiction " +
      "repos (rulespec-us, rulespec-us-co…). Engine stays focused on runtime + schema. " +
      "Filepath-as-id eliminates drift between repo and engine identity. Compiled " +
      "artifacts are JSON-serialisable so callers can run on ephemeral compute (Workers, " +
      "Lambda) without re-parsing the source YAML.",
    important: [
      "RuleSpec discriminator is mandatory — a top-level rules: key with no format:/" +
        "schema: declaration is rejected so the format stays unambiguous.",
      "Durable rule ids are required for cross-file references. Local rule names (just " +
        "the symbol) only work as formula references inside the same module.",
      "Fast path is opt-in by the rule set, not the caller. Falls back to explain mode " +
        "(reference engine) with a fallback_reason in response metadata.",
      "Judgment outputs (yes/no decisions) cannot be vectorised — fast mode blocks on " +
        "them. Only scalar outputs (integer, decimal, text, date) vectorise.",
      "Parameters are versioned by effective_from date. The engine picks the live " +
        "version for a given query period; lookups are linear scans in reverse-chrono " +
        "order.",
      "Temporal queries specify Period (Month, BenefitWeek, TaxYear, Custom). Inputs " +
        "and relations must overlap the query period.",
      "Python client wraps the Rust binary as a subprocess for stdin/stdout JSON; " +
        "dense-extension binding is direct (numpy in, numpy out). Python bindings " +
        "require exactly Python 3.14 (requires-python == 3.14.*), the " +
        "ecosystem-wide toolchain pin.",
      "Derived relations over FILTERED entities landed in PR #41 (2026-05-20) — " +
        "filtered-entity scope metadata plus dense-path execution. PR #43 " +
        "(imported relation aliases in filtered aggregations) is still an unmerged " +
        "branch; main has not moved since 2026-05-23.",
      "The Modal-hosted build behind axiom-api pins the engine at a specific SHA " +
        "in modal_runtime.py — bumping the engine requires a Modal redeploy.",
    ],
    files: [
      "axiom-rules-engine/src/main.rs",
      "axiom-rules-engine/src/rulespec.rs",
      "axiom-rules-engine/src/spec.rs",
      "axiom-rules-engine/src/engine.rs",
      "axiom-rules-engine/src/dense.rs",
      "axiom-rules-engine/src/compile.rs",
      "axiom-rules-engine/python/axiom_rules/client.py",
      "axiom-rules-engine/docs/rulespec.md",
      "axiom-rules-engine/DECISIONS.md",
    ],
  },
  {
    id: "axiom-oracles",
    label: "axiom-oracles",
    layer: "consumer",
    repo: "axiom-oracles",
    summary: "Oracle-comparison toolkit + coverage dashboard",
    detail:
      "Validation toolkit that pits Axiom's RuleSpec implementations against external " +
      "'oracles' (reference implementations): PolicyEngine, TAXSIM, Atlanta Fed PRD, " +
      "ACCESS NYC, and EUROMOD/UKMOD. Each comparison is declared as one YAML file in " +
      "comparisons/; a weekly unattended regeneration script reruns everything and " +
      "redeploys a public Next.js coverage dashboard on Vercel. Adding a new program " +
      "comparison is a single YAML PR.",
    mechanics:
      "Five layers. (1) Comparisons registry (comparisons/*.yaml): declarative spec " +
      "per comparison — name, runner type, scope, parameters, schedule. 20 entries " +
      "today: SNAP ECPS comparisons for 12 states (al, az, ca, co, fl, ma, nc, ny, " +
      "or, sc, tn, ut), co-state-income-tax-ecps, fiit-ecps (99.94% agreement — " +
      "299,821/299,993 matched, remaining mismatches are EITC amounts), " +
      "medicaid-magi-co-ecps, ssi-ecps, ny-tanf-ecps, wa-tanf-ecps, and two UK EFRS " +
      "comparisons — plus parameter-oracles.yaml for config-driven parameter suites " +
      "(SSA, GA health, Pell, Lifeline). " +
      "(2) Orchestrator (scripts/run_comparison.py): dispatches by runner type, " +
      "produces a JSON report. (3) Thin case schema (core/case.py): Case has facts, " +
      "entities (concept-keyed), and requested outputs — no universal household " +
      "ontology. (4) Engine adapters (adapters/): accessnyc, axiom, euromod, " +
      "policyengine, prd, taxsim — each implementing EngineAdapter with run_cases() / " +
      "run_households(). EuromodPlatformRunner drives the .NET EM_Executable.dll; " +
      "UKMOD (UK) is live and EUROMOD Belgium is wired. AxiomRulesRunner executes " +
      "composed programs via axiom-compose against rsync'd rulespec roots. " +
      "(5) Mappings + Comparator (comparison/): concept_mappings.yaml maps canonical " +
      "Axiom concept ids to per-engine targets. The comparator aligns results by " +
      "household_id and emits typed mismatches (amount_difference, " +
      "eligibility_left_only, …). Weekly cron runs dashboard/scripts/regenerate_all.sh: " +
      "sync roots → run all suites → sync coverage → pytest → commit + push + " +
      "`vercel --prod` if dashboard data changed.",
    rationale:
      "Validation is hard without ground truth. Comparing Axiom's output against " +
      "established calculators across many synthetic + real households gives a coverage " +
      "signal: where we disagree with the oracle, dig in. Concept-keyed cases let one " +
      "test data set drive every engine without rewriting inputs per oracle. The " +
      "registry makes the validation work reusable: any program that fits an existing " +
      "runner type becomes a one-line PR, not a code change.",
    important: [
      "Cases are intentionally thin and concept-keyed, not a universal household " +
        "ontology. Adapters project concepts into their own input languages.",
      "Adapter-specific inputs go in case.metadata: TAXSIM cases need metadata[" +
        "'taxsim_input']; PRD cases need metadata['prd_household']. Not canonical.",
      "ACCESS NYC Drools execution is stubbed locally because the public repo lacks " +
        "compiled classes. Python replatform is the working local path; REST API is " +
        "available too.",
      "AxiomRulesRunner works end-to-end: federal tax via live-compile of rulespec-us " +
        "surfaces, state SNAP via precompiled artifacts, and UK Universal Credit " +
        "through an axiom-compose composed program — the compose path is the " +
        "convergence target (axiom-oracles#19).",
      "Compose roots are COPIES: scripts/sync_rulespec_roots.sh git-pulls and rsyncs " +
        "rulespec-us slices into ~/.axiom-oracles/roots/. Run it before any suite or " +
        "you compare against stale law — local checkouts drift hundreds of commits " +
        "behind origin/main.",
      "The dashboard (dashboard/, Next.js 16 static export, Vercel project " +
        "axiom-oracles) is a living regression monitor: 'verified' = engines agree " +
        "on 90%+ of checks; programs.json tracks 21 programs with encoding_status " +
        "live/present/missing. Data is committed JSON — stale data ships unless " +
        "regenerate_all.sh runs.",
      "EUROMOD adapter needs a separate EUROMOD_PYTHON execution env (x86_64 venv " +
        "on Linux/CI; special handling on Apple Silicon).",
      "Populace oracle carries no county/place geography yet — geographic programs " +
        "see no coverage until imputation lands upstream.",
      "Report schema is versioned: COMPARISON_REPORT_SCHEMA_VERSION = " +
        "'axiom.comparison_report.v1'.",
      "Locale/scope filters in mappings handle geographic restrictions (ACCESS NYC is " +
        "NYC-only; PolicyEngine and Axiom are US-wide).",
      "Does NOT integrate with axiom-corpus (no imports, no direct data flow); reads " +
        "rulespec-* repos only as engine inputs, and vendors program compose specs " +
        "under programs/ (a third copy beside axiom-programs and the monorepo).",
    ],
    files: [
      "axiom-oracles/comparisons/fiit-ecps.yaml",
      "axiom-oracles/comparisons/co-snap-ecps.yaml",
      "axiom-oracles/comparisons/README.md",
      "axiom-oracles/scripts/run_comparison.py",
      "axiom-oracles/.github/workflows/comparisons.yml",
      "axiom-oracles/axiom_oracles/core/case.py",
      "axiom-oracles/axiom_oracles/adapters/policyengine/runner.py",
      "axiom-oracles/axiom_oracles/adapters/accessnyc/",
      "axiom-oracles/axiom_oracles/adapters/taxsim/runner.py",
      "axiom-oracles/axiom_oracles/adapters/euromod/",
      "axiom-oracles/axiom_oracles/comparison/comparator.py",
      "axiom-oracles/axiom_oracles/config/concept_mappings.yaml",
      "axiom-oracles/dashboard/",
      "axiom-oracles/dashboard/scripts/regenerate_all.sh",
      "axiom-oracles/scripts/sync_rulespec_roots.sh",
    ],
    commands: [
      "scripts/run_comparison.py --list",
      "scripts/run_comparison.py <name> --summary",
      "scripts/sync_rulespec_roots.sh",
      "dashboard/scripts/regenerate_all.sh",
    ],
  },
  {
    id: "axiom-compose",
    label: "axiom-compose",
    layer: "rules",
    repo: "axiom-compose",
    summary: "Deterministic program assembler",
    detail:
      "Pure-function utility: (spec, atomic rulespec corpus) → runnable program. " +
      "The single, standard entry point Axiom tools use to assemble programs " +
      "(SNAP, FIIT, Universal Credit, …) for execution. Live: CI composes the real " +
      "CA SNAP program across repos on every push, and axiom-oracles runs UK " +
      "Universal Credit through a composed program.",
    mechanics:
      "Hard architectural rule: no program-specific code anywhere. Every synthesis " +
      "decision reduces to (a) an atomic encoded rule in rulespec-*, (b) a generic " +
      "transformation pattern that applies to ≥2 program families, or (c) a " +
      "declarative parameter in the spec. The composer's core does dependency " +
      "closure from declared outputs, applies the generic transformation registry — " +
      "nine patterns today: all_of, any_of, any_related, conditional_value, " +
      "data_relation, derived_formula, derived_relation, sum_terms, " +
      "table_lookup_with_extension — AND-gates eligibility via auto_gate_outputs " +
      "(program-token match + minimal cover), and emits a program for the engine " +
      "to compile. Each program is a tiny YAML spec (program, outputs, period, " +
      "scope anchors) — data, not code. Compose is a pure function: no env, clock, " +
      "network, or filesystem reads; same inputs → byte-identical output.",
    rationale:
      "Checked-in composition files (e.g. rulespec-us-co/policies/cdhs/snap/fy-2026-" +
      "benefit-calculation.yaml) mix encoded law with software glue and drift " +
      "silently across consumers. Centralising assembly into one deterministic " +
      "utility removes the duplication, lets rulespec-* return to atomic-only, and " +
      "makes drift loudly detectable.",
    important: [
      "Safety rails: composition fails fast on dangling scope entries (#15) and " +
        "refuses to compose when declared eligibility outputs would leave rules " +
        "orphaned (#9) — broken specs die loudly, not silently.",
      "Loads country-monorepo checkouts alongside legacy standalone jurisdiction " +
        "repos (#16) — needed through the June 2026 consolidation, still useful for " +
        "straggler repos (rulespec-us-or).",
      "Consumes compose specs from axiom-programs AND from the country monorepo's " +
        "programs/ dir (copies of each other since the consolidation; watch for " +
        "drift). CI (pytest, Python 3.14 via uv) checks out rulespec-us + " +
        "axiom-rules-engine and composes real programs on every push.",
      "Convergence point for axiom-oracles: UK UC already runs via a composed " +
        "program (axiom-oracles#61); collapsing the remaining precompiled-artifact " +
        "runners is tracked at axiom-oracles#19. Downstream consumers: " +
        "axiom-microsim (compiled programs), axiom-oracles, and the compiled " +
        "packages served by axiom-api.",
    ],
    files: [
      "axiom-compose/src/axiom_compose/core.py",
      "axiom-compose/src/axiom_compose/spec.py",
      "axiom-programs/<jurisdiction>/<program>/<period>.yaml (compose inputs)",
    ],
    commands: ["axiom-compose <spec.yaml>"],
  },
  {
    id: "axiom-programs",
    label: "axiom-programs",
    layer: "rules",
    repo: "axiom-programs",
    summary: "Declarative compose specs (one YAML per program × jurisdiction × period)",
    detail:
      "Home for the program compose specs that axiom-compose consumes. A program — " +
      "us-co/snap for FY 2026, us-ca/snap, us/ssi — is an assembly of atomic rules " +
      "drawn from one or more rulespec-* corpora. The assembly itself is NOT law: the " +
      "law is the source statute/regulation encoded into atomic RuleSpec files. This " +
      "repo holds the declarative spec describing how those atomic rules combine for " +
      "a given (jurisdiction, program, period).",
    mechanics:
      "Layout: <jurisdiction>/<program>/<period>.yaml — e.g. us-ca/snap/fy-2026.yaml. " +
      "Spec shape: program identifier, period, declared outputs (the rules the engine " +
      "must produce), and scope arrays (federal + state) listing the atomic rule " +
      "paths to import. axiom-compose resolves the scope against the relevant " +
      "rulespec-* repos, links the imports via declared outputs, and emits a runnable " +
      "program for the engine. No per-program code anywhere. artifacts/ holds " +
      "precomposed RuleSpec / precompiled engine artifacts for deployments that " +
      "don't run axiom-compose.",
    rationale:
      "Specs are not law (so they don't belong in rulespec-* corpora as encoded " +
      "modules). Specs are not the composer (so they don't belong inside " +
      "axiom-compose, which is the tool). The June 2026 consolidation copied the US " +
      "specs into rulespec-us programs/ so they version with the law they compose; " +
      "this repo remains the staging home — the two homes are copies and can drift.",
    important: [
      "Current inventory (15 specs): SNAP for 8 states (al, ca, co, ma, nc, ny, sc, " +
        "tn), TANF for us-co, us-ny, us-wa, federal us/payroll/oasdi-wage-tax, " +
        "us/medicaid-magi, us/ssi, and uk/universal-credit fy-2026-27 (housing " +
        "schedules wired in). The monorepo programs/ copy holds 18.",
      "artifacts/ currently holds only UK Universal Credit precomposed output " +
        "(.compiled.json + .manifest.json + .rulespec.yaml) for deployments that " +
        "don't run axiom-compose.",
      "Migration backlog reversed direction: the README now pulls composition INTO " +
        "this repo — the legacy rulespec-us-co bucket-E composition YAML and " +
        "axiom-microsim's per-program Python adapters should become declarative " +
        "specs here.",
      "Naming trap: axiom-programs.legacy on disk is an UNRELATED older project " +
        "(the oracle-comparison tool that preceded axiom-oracles) which used to own " +
        "the repo name.",
      "Not US-specific. Layout accommodates uk/, ca/, etc.; no -us suffix on the " +
        "repo name. No CI on this repo.",
    ],
    files: [
      "axiom-programs/us-ca/snap/fy-2026.yaml",
      "axiom-programs/uk/universal-credit/fy-2026-27.yaml",
      "axiom-programs/artifacts/uk/universal-credit/",
      "rulespec-us/programs/ (the monorepo copy)",
    ],
    commands: ["(declarative YAML — consumed by axiom-compose)"],
  },
  {
    id: "axiom-demo-shell",
    label: "axiom-demo-shell",
    layer: "consumer",
    repo: "axiom-demo-shell",
    summary: "Landing page for ten demo surfaces",
    detail:
      "Lightweight static landing page that presents the ecosystem's demo surfaces — " +
      "ten of them now — in a guided three-tier pipeline: Infrastructure " +
      "(architecture viewer, law app, rulespec-graph-viewer), Validation (oracles " +
      "dashboard, guidance-impact-visualizer, bills tracker), Application (finbot, " +
      "dashboard-builder, CO SNAP demo, microsim).",
    mechanics:
      "Static index.html + app.js + styles.css + analytics.js. app.js holds a " +
      "hardcoded `destinations` map of the ten demo URLs; `?local` switches every " +
      "destination to 127.0.0.1 dev ports. No dependencies, no build step. " +
      "`npm start` serves via Python's http.server; production deploys to Vercel. " +
      "analytics.js reports GA4 events (scroll_depth, time_on_tool, outbound_click) " +
      "to property G-2YHG89FY0N with tool_name=axiom-demo-shell.",
    rationale:
      "Pure static + zero deps is maximally auditable. The shell frames the ecosystem " +
      "while shared APIs and product boundaries firm up. It orchestrates without " +
      "merging code, so each demo retains autonomy.",
    important: [
      "The three-tier restructure (June 2026) replaced the old three-iframe layout; " +
        "opening a demo is now the primary GA4-tracked action (outbound_click).",
      "URLs are hardcoded in app.js — if a demo moves, update the destinations map. " +
        "No env-var system.",
      "No shared auth — each linked demo has its own session.",
      "Non-goals are real constraints (per README): no duplicate law, no second " +
        "interpretation layer, no hidden provenance.",
    ],
    files: [
      "axiom-demo-shell/index.html",
      "axiom-demo-shell/app.js",
      "axiom-demo-shell/styles.css",
      "axiom-demo-shell/README.md",
    ],
  },

  // ── Parallel ingest + simulation (added with the monorepo update) ──
  {
    id: "scrapers",
    label: "axiom-scrapers",
    layer: "ingest",
    repo: "axiom-scrapers",
    summary: "State statute scrapers (dormant)",
    detail:
      "Per-state scrapers (19 states) producing paired section text + metadata " +
      "files (axiom-source-section/v1) that corpus ingest consumes. Offline-first " +
      "tests against saved HTML fixtures; soft-fail per section. Dormant since May " +
      "2026 — the June state-ingestion wave went through corpus-native " +
      "scripts/ingest_*.py instead, bypassing this repo.",
    important: [
      "Output is local scratch — the corpus artifact store is the source of " +
        "truth, not scraper output.",
      "No scheduled runs; upstream site drift is discovered manually.",
      "Live on GitHub (not archived), but last substantive commit was 2026-05-23. " +
        "Decide whether to fold its adapters into corpus or revive scheduled runs.",
    ],
    files: ["axiom-scrapers/src/axiom_scrapers/"],
  },
  {
    id: "bills",
    label: "axiom-bills",
    layer: "ingest",
    repo: "axiom-bills",
    summary: "Live bill tracker → rule patches",
    detail:
      "Tracks bills across Congress.gov and 21 state legislatures with append-only " +
      "status actions and normalized vocabularies, then goes further than tracking: " +
      "for enacted text it precomputes diffs and drafts patched RuleSpec YAML " +
      "('rule variants') so the encoding pipeline receives ready-made patches, not " +
      "just a signal.",
    mechanics:
      "Pipeline: RateLimitedClient → Congress.gov / state JSON → typed Bill / " +
      "BillAction / BillVersion models → SQLite locally, Supabase bills schema in " +
      "prod (upserts, append-only actions by fingerprint, monotonic STATUS_ORDER " +
      "roll-up) → index-encodings (checks out rulespec-us) → fetch-texts / " +
      "precompute-diffs → precompute-variants (ops × encodings) → " +
      "propose-llm-variants (Claude) → sync-supabase → export-variants. The " +
      "bills.current_rule_patches view (latest patched YAML per bill/file with " +
      "status) is the downstream contract axiom-encode consumes. A Vite/React " +
      "frontend reads Supabase directly.",
    important: [
      "Own scrapers per legislature (deliberately not OpenStates/LegiScan).",
      "Refresh cadence: federal HOURLY (cron 7 * * * *, running the whole encode " +
        "chain), states every 6 hours. Congress.gov's 5,000 req/hour budget is " +
        "enforced (#83).",
      "Variant idempotency: source_ops_fingerprint + source_text_sha256 — unchanged " +
        "re-runs are no-ops and LLM proposals survive; changed engrossed/enrolled " +
        "text recomputes ops, clears the stale proposal with a note, and re-drafts.",
      "Citations are canonicalized at the ingestion choke point (#87/#88) so '20 " +
        "U.S.C. 1070a' ≡ '20 USC 1070a'; new forms warn.",
      "June–July hardening: patient retries + targeted backfill (#82), PDF texts + " +
        "statutory effective dates + needs-new-encoding signal (#84), monorepo " +
        "layout adaptation that fails loudly on a zero-index (#85), companion-test " +
        "execution against patched YAML (#86).",
      "Local-dir trap: ~/axion-legislative-tracker (note the typo) wraps a clone of " +
        "this same repo.",
    ],
    files: [
      "axiom-bills/packages/scrapers/src/axiom_bills/jurisdictions/",
      "axiom-bills/packages/web/",
    ],
  },
  {
    id: "microsim",
    label: "axiom-microsim",
    layer: "consumer",
    repo: "axiom-microsim",
    summary: "Population microsimulation",
    detail:
      "PolicyEngine-free microsimulation over the Enhanced CPS: loads microdata " +
      "via h5py, projects households into RuleSpec inputs, executes compiled " +
      "programs on axiom-rules-engine, and aggregates weighted costs, decile " +
      "distributions, and reform deltas. Three programs: CO SNAP, federal income " +
      "tax, federal CTC. FastAPI on Modal + a Next.js web UI on Vercel with reform " +
      "sliders and decile / winners-losers charts.",
    important: [
      "Federal income tax agrees with PolicyEngine at 99.8% on a 1,000-unit " +
        "Enhanced CPS sample — independence proven, not claimed. /compare is the " +
        "only path that imports policyengine_us.",
      "Per-program projections are hand-coded Python (project/{co_snap," +
        "federal_income_tax,federal_ctc}.py); reforms patch parameter YAML in " +
        "memory and recompile (~70 ms). Converting these to declarative compose " +
        "specs is on axiom-programs' backlog.",
      "CLI trap: the CLI still hard-rejects anything but --program co-snap; the " +
        "multi-program surface lives in server.py / Modal / web only.",
      "ECPS microdata (enhanced_cps_2024.h5) comes from HuggingFace " +
        "policyengine/policyengine-us-data into a Modal Volume.",
    ],
    files: [
      "axiom-microsim/axiom_microsim/project/",
      "axiom-microsim/axiom_microsim/server.py",
      "axiom-microsim/web/",
    ],
  },

  // ── Platform (API + agents + analytics) ──────────────────────────
  {
    id: "axiom-api",
    label: "axiom-api",
    layer: "platform",
    repo: "axiom-api",
    summary: "Rule-native HTTP API + SDKs",
    detail:
      "The canonical HTTP contract layer between the RuleSpec repos + Rust engine " +
      "and downstream consumers: search, retrieve, explain, and execute RuleSpecs " +
      "over a typed { status, data, meta } envelope. Hono app on Vercel " +
      "(axiom-api-eta.vercel.app), OpenAPI 3.1 contract-first, API-key auth with " +
      "scoped keys and rate limits. Vendors hand-written TypeScript " +
      "(@axiom-foundation/sdk) and Python (axiom-api) SDK clients with " +
      "tag-triggered npm/PyPI release workflows.",
    mechanics:
      "Endpoints: /v1/{search, rules/{id}[/sources|/dependencies], programs, " +
      "capabilities, runtime/packages, parity/*, calculate, calculate/batch, " +
      "jobs/calculate} plus /docs and /docs/mcp (public). Rule index comes from " +
      "AXIOM_RULE_INDEX_SOURCE: 'static' in production (checked-in " +
      "data/rulespec-index.current.json regenerated by a scheduled " +
      "refresh-rulespec-index workflow) or 'github' (live GitHub trees/contents " +
      "reads of rulespec-*). Calculation with AXIOM_RUNTIME_SOURCE=compiled " +
      "forwards to a Modal-hosted FastAPI service (modal_runtime.py) that " +
      "cargo-builds axiom-rules-engine at a pinned SHA; 9 compiled packages " +
      "admitted today (co-snap, uk/universal-credit, SNAP for 7 more states). " +
      "Optional Upstash-style Redis REST backs cross-instance rate limits, " +
      "revocations, and analytics.",
    rationale:
      "One platform surface for agents, SDKs, and partners — instead of every " +
      "consumer re-implementing Supabase queries and engine invocation. " +
      "Contract-first with drift detectors: OpenAPI, MCP docs, and the compiled " +
      "registry are regenerated and checked in CI.",
    important: [
      "Fixture-by-default: a fresh deploy without AXIOM_RUNTIME_SOURCE=compiled + " +
        "a runtime URL returns canned calculation results, not engine output.",
      "Without Redis, rate limits / revocations / analytics are per-Vercel-instance " +
        "and reset on deploy; ?scope=global needs the shared store.",
      "Supabase is declared in env examples and the architecture doc but NOT wired " +
        "— the corpus adapter is a planned edge. Rule data comes from GitHub / the " +
        "static index.",
      "Engine SHA is pinned in modal_runtime.py; bumping axiom-rules-engine " +
        "requires a Modal redeploy.",
      "as_of is a reserved parameter (temporal retrieval design exists, not yet " +
        "functional). co-snap is a legacy program_id kept for demo compatibility.",
      "Production is smoke-tested by a scheduled GitHub Action every 15 minutes, " +
        "not an always-on probe. Auth is fail-closed in staging/production.",
      "Prototype-pollution hardening in the runtime adapter: null-prototype maps, " +
        "__proto__/constructor/prototype deny-list, 1,000-entity request cap.",
    ],
    files: [
      "axiom-api/src/app.ts",
      "axiom-api/src/runtime-compiled.ts",
      "axiom-api/src/rulespec-index.ts",
      "axiom-api/modal_runtime.py",
      "axiom-api/data/rulespec-index.current.json",
      "axiom-api/clients/typescript/",
      "axiom-api/clients/python/",
    ],
    commands: [
      "npm run dev",
      "npm run check",
      "npm run index:generate",
      "npm run compiled:generate",
      "modal deploy modal_runtime.py",
    ],
  },
  {
    id: "axiom-mcp",
    label: "axiom-mcp",
    layer: "platform",
    repo: "axiom-mcp",
    summary: "MCP server for agents (npm, v0.1.2)",
    detail:
      "Thin Model Context Protocol adapter over axiom-api — the surface Claude and " +
      "other MCP clients use to search law, read rules and sources, discover " +
      "runtime packages, run parity cases, and calculate households. Published to " +
      "npm as @axiom-foundation/mcp (v0.1.2, MIT); runs on the client's machine " +
      "via stdio (npx -y @axiom-foundation/mcp), never deployed server-side.",
    mechanics:
      "14 tools mapping 1:1 onto API endpoints (get_capabilities, list_programs, " +
      "search_rules, get_rule[_sources|_dependencies], list/get_runtime_packages, " +
      "list/run_parity_cases, calculate_household, calculate_batch, " +
      "submit_calculation_job, get_calculation_job), four axiom:// resources, and " +
      "three prompts (explain_rule_for_caseworker, trace_household_result, " +
      "find_missing_household_inputs). Forwards AXIOM_API_KEY as a Bearer token; " +
      "auto-retries a 429 once when retry-after ≤ 10s, otherwise surfaces a " +
      "structured tool error with http_status and the API error body.",
    rationale:
      "Zero server-side state, no shell, no arbitrary fetch — the MCP server can " +
      "only reach the one configured base URL with the one key. All rule/data " +
      "logic stays in the API.",
    important: [
      "Endpoint paths are hardcoded in axiom-client.ts, so tool coverage must move " +
        "in lockstep with the API — axiom-api runs an API-coverage drift detector " +
        "for exactly this.",
      "Published via npm Trusted Publishing (OIDC provenance); a live-smoke " +
        "workflow exercises the 0.1.2 surface against production.",
      "Default base URL is production (axiom-api-eta.vercel.app); local dev " +
        "requires overriding AXIOM_API_BASE_URL.",
    ],
    files: [
      "axiom-mcp/src/server.ts",
      "axiom-mcp/src/tool-handlers.ts",
      "axiom-mcp/src/axiom-client.ts",
      "axiom-mcp/docs/quickstart.md",
    ],
    commands: ["npx -y @axiom-foundation/mcp", "npm run smoke:live"],
  },
  {
    id: "analytics",
    label: "GA4 → Axiom CRM",
    layer: "platform",
    repo: "infrastructure",
    summary: "Product-analytics loop",
    detail:
      "Shared product-analytics loop across the public surfaces: " +
      "axiom-foundation.org, axiom-demo-shell, axiom-microsim's web UI, the oracles " +
      "dashboard, and this architecture viewer all emit GA4 events to property " +
      "G-2YHG89FY0N with a tool_name dimension. The PolicyEngine CRM (Teamverse) " +
      "reads that property via the GA4 Data API and renders per-tool page views, " +
      "engagement, and a tools leaderboard for ops.",
    mechanics:
      "Each tool ships a small analytics.js (or layout hook) reporting scroll_depth, " +
      "time_on_tool, and outbound_click with tool_name. The CRM's " +
      "google-analytics.service.ts calls runReport against per-org configured " +
      "property ids; the tools leaderboard groups by tool_name.",
    important: [
      "G-2YHG89FY0N superseded G-5PB7KEWV38 (June 2026) — it's the property the " +
        "CRM already reads. Both ids appear in commit history; only the former is " +
        "current.",
      "The CRM is an internal ops consumer only — it never reads the corpus, " +
        "rulespec repos, or axiom-api.",
    ],
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

  // Cross-column reads (storage → apps) — drop the "REST" label so it
  // doesn't land inside intermediate nodes at the geometric midpoint of
  // the long edge. Edge style already signals the relationship.
  { from: "navigation", to: "axiom-foundation", kind: "read" },
  { from: "provisions", to: "axiom-foundation", kind: "read" },
  { from: "provisions", to: "finbot", kind: "read" },
  { from: "provisions", to: "dashboard-builder", kind: "read" },
  // The /ops dashboard reads analytics JSON straight from the bucket —
  // R2's first production reader.
  { from: "r2", to: "axiom-foundation", kind: "read", label: "ops analytics" },

  // Program assembly: rulespec corpora feed compose specs (axiom-programs)
  // and the composer; the composer emits runnable programs for the engine.
  { from: "rulespec-us", to: "axiom-programs", kind: "read", label: "atomic only" },
  { from: "rulespec-us", to: "axiom-compose", kind: "read" },
  { from: "rules-other", to: "axiom-compose", kind: "read" },
  { from: "axiom-programs", to: "axiom-compose", kind: "read", label: "specs" },
  { from: "axiom-compose", to: "axiom-rules-engine", kind: "derived", label: "runnable program" },

  // axiom-rules-engine compiles + executes the RuleSpec YAML. Single labeled
  // edge (rulespec-us) carries the verb; the other is visually identical.
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

  // axiom-demo-shell links out to the demo surfaces (one label is enough).
  { from: "axiom-foundation", to: "axiom-demo-shell", kind: "read", label: "links" },
  { from: "finbot", to: "axiom-demo-shell", kind: "read" },
  { from: "dashboard-builder", to: "axiom-demo-shell", kind: "read" },
  { from: "microsim", to: "axiom-demo-shell", kind: "read" },

  // Parallel ingest.
  { from: "state-sources", to: "scrapers", kind: "solid", label: "scrapes" },
  { from: "scrapers", to: "adapters", kind: "solid", label: "section files" },
  { from: "bills", to: "supabase", kind: "solid", label: "sync-supabase" },
  { from: "bills", to: "axiom-encode", kind: "read", label: "rule patches" },

  // Platform surface: the API indexes the rulespec corpora, executes on a
  // Modal-hosted engine build, and fronts the MCP server for agents.
  { from: "rulespec-us", to: "axiom-api", kind: "read", label: "GitHub index" },
  { from: "axiom-rules-engine", to: "axiom-api", kind: "solid", label: "Modal runtime" },
  { from: "axiom-api", to: "axiom-mcp", kind: "solid", label: "HTTP · API key" },

  // Product-analytics loop (GA4 property G-2YHG89FY0N → CRM).
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
// previous one and adds a new column to the right. Column x-positions are
// consistent across scenes so the architecture visibly grows rightward as
// the reader progresses — the same node lands at the same coordinate
// whether you're in §01 or §06.
//
// Column layout (left → right), pitch 420, card max-width 230 — no
// half-pitch columns (a 210px offset physically overlaps neighbouring
// cards; that was the §04 collision bug):
//   x=40    Col 1 — Upstream publishers
//   x=460   Col 2 — Ingest layer (fetchers, parsers, adapters, scrapers)
//   x=880   Col 3 — Local JSONL artifact tree + bill tracker
//   x=1300  Col 4 — Storage tier (R2 + Supabase tables)
//   x=1720  Col 5 — Encoder + country monorepos
//   x=2140  Col 6 — Program assembly (specs + composer) + API platform
//   x=2560  Col 7 — Execution engine + oracle validation + MCP
//   x=2980  Col 8 — Consumer apps
//   x=3400  Col 9 — Demo shell + analytics loop
//
// Vertical spacing: cards run ~100-130px tall, so same-column pitches stay
// ≥160. Long cross-column edges are chosen to travel through inter-column
// gaps (midpoint verticals at ~2045/2465/2885) or under cards — never
// through a card at its own row.

// Canonical positions, used by every scene below.
const POS: Record<string, [number, number]> = {
  // Col 1
  ecfr: [40, 80],
  usc: [40, 240],
  "state-sources": [40, 400],
  "canada-source": [40, 560],
  "irs-bulk": [40, 720],
  // Col 2
  fetchers: [460, 200],
  parsers: [460, 420],
  adapters: [460, 640],
  scrapers: [460, 860],
  // Col 3
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
  "axiom-programs": [2140, 160],
  "axiom-compose": [2140, 420],
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

// bills joins with the storage tier — its first visible edge writes the
// bills schema in Supabase (introducing it earlier left an orphan card).
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
  "axiom-programs",
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
  // ═══════════════════════════════════════════════════════════════
  // § 01 — start: just the upstream publishers.
  // ═══════════════════════════════════════════════════════════════
  {
    id: "sources",
    title: "Where the corpus begins",
    eyebrow: "Sources",
    description:
      "Five categories of official publishers. We snapshot — never modify the source.",
    nodes: placeAll(SOURCES_VISIBLE),
    edges: edgesAmong(new Set(SOURCES_VISIBLE)),
  },

  // ═══════════════════════════════════════════════════════════════
  // § 02 — add: ingest pipeline. Bytes flow into a local JSONL tree.
  // ═══════════════════════════════════════════════════════════════
  {
    id: "ingest",
    title: "Add the ingest layer",
    eyebrow: "Ingest",
    description:
      "Bytes from each publisher flow through a fetcher → parser → " +
      "source-first adapter, ending in a local JSONL artifact tree that becomes " +
      "the contract every downstream stage reads from.",
    nodes: placeAll(INGEST_VISIBLE),
    edges: edgesAmong(new Set(INGEST_VISIBLE)),
  },

  // ═══════════════════════════════════════════════════════════════
  // § 03 — add: storage tier. R2 (cold) + Supabase (live) + bills.
  // ═══════════════════════════════════════════════════════════════
  {
    id: "storage",
    title: "Add the storage tier",
    eyebrow: "Storage",
    description:
      "The same JSONL produces a durable R2 mirror and a live Supabase snapshot. " +
      "corpus.provisions is the source of truth for legal text; navigation_nodes, " +
      "provision_counts, and provision_references are derived from it and " +
      "rebuildable in minutes. axiom-bills tracks live legislation into its own " +
      "Supabase schema — federal hourly, states every six hours.",
    nodes: placeAll(STORAGE_VISIBLE),
    edges: edgesAmong(new Set(STORAGE_VISIBLE)),
  },

  // ═══════════════════════════════════════════════════════════════
  // § 04 — add: encoder + country monorepos + execution + validation.
  // ═══════════════════════════════════════════════════════════════
  {
    id: "encoding",
    title: "Add encoding + execution",
    eyebrow: "Encoding",
    description:
      "axiom-encode reads the corpus and writes RuleSpec YAML into the country " +
      "monorepos — rulespec-us (federal + 32 states + programs/, ~3,040 modules " +
      "since the June 2026 consolidation), rulespec-uk, rulespec-ca. axiom-compose " +
      "assembles runnable programs from atomic encoded law + declarative specs; " +
      "axiom-rules-engine (Rust) compiles + executes them. axiom-oracles validates " +
      "outputs against PolicyEngine, TAXSIM, ACCESS NYC, and EUROMOD/UKMOD via a " +
      "20-entry comparisons registry with a weekly-regenerated public dashboard.",
    nodes: placeAll(ENCODING_VISIBLE),
    edges: edgesAmong(new Set(ENCODING_VISIBLE)),
  },

  // ═══════════════════════════════════════════════════════════════
  // § 05 — add: consumer apps + demo shell.
  // ═══════════════════════════════════════════════════════════════
  {
    id: "end-to-end",
    title: "Add the consumers",
    eyebrow: "Pipeline",
    description:
      "axiom-foundation.org (corpus browser, search, and the /ops dashboard), " +
      "finbot, dashboard-builder, and axiom-microsim read from Supabase and call " +
      "into axiom-rules-engine for execution. axiom-demo-shell presents ten demo " +
      "surfaces in a guided Infrastructure → Validation → Application pipeline. " +
      "Every block carries its repo on the eyebrow so you can see who owns what " +
      "at a glance.",
    nodes: placeAll(PIPELINE_VISIBLE),
    edges: edgesAmong(new Set(PIPELINE_VISIBLE)),
  },

  // ═══════════════════════════════════════════════════════════════
  // § 06 — add: the platform surface. API, SDKs, agents, analytics.
  // ═══════════════════════════════════════════════════════════════
  {
    id: "platform",
    title: "Add the platform surface",
    eyebrow: "Platform",
    description:
      "axiom-api is the rule-native HTTP contract layer: search, retrieval, and " +
      "household calculation over API keys, with vendored TypeScript + Python SDKs " +
      "and heavy compute on a Modal-hosted engine build. axiom-mcp (npm, v0.1.2) " +
      "exposes that surface to Claude and other agents over MCP. A shared GA4 " +
      "property feeds product analytics from every public tool into the Axiom CRM.",
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
