// A baked snapshot of the live Axiom runtime registry, used by the
// journey film's constellation scene. Every number here is real:
// fetched from /v1/runtime/packages and /v1/rules/*/dependencies on the
// snapshot date. Refresh by re-running the same queries — the scene
// reads only this module.

export const SNAPSHOT_DATE = "2026-07";

// one cluster per compiled runtime package — count = output_count
export type Cluster = {
  id: string;
  count: number;
  x: number;
  y: number;
  r: number;
};

export const CLUSTERS: Cluster[] = [
  { id: "co-snap", count: 168, x: 710, y: 300, r: 36 },
  { id: "us-sc-snap", count: 1327, x: 1010, y: 205, r: 88 },
  { id: "us-nc-snap", count: 1095, x: 395, y: 400, r: 81 },
  { id: "us-tn-snap", count: 514, x: 930, y: 445, r: 58 },
  { id: "us-al-snap", count: 242, x: 480, y: 185, r: 42 },
  { id: "us-ca-snap", count: 164, x: 640, y: 470, r: 36 },
  { id: "us-ny-snap", count: 125, x: 845, y: 155, r: 33 },
  { id: "uk-universal-credit", count: 51, x: 255, y: 235, r: 24 },
  { id: "us-co-tanf", count: 39, x: 580, y: 275, r: 22 },
  { id: "us-ny-tanf", count: 34, x: 835, y: 300, r: 21 },
  { id: "us-ak-atap", count: 21, x: 285, y: 480, r: 18 },
  { id: "us-ks-tanf", count: 15, x: 1145, y: 355, r: 17 },
  { id: "us-az-snap", count: 11, x: 1195, y: 465, r: 15 },
  { id: "us-il-scretd", count: 8, x: 185, y: 350, r: 14 },
  { id: "us-tx-tanf", count: 6, x: 1250, y: 265, r: 13 },
  { id: "us-oasdi-wage-tax", count: 6, x: 1290, y: 150, r: 13 },
];

export const PROGRAM_COUNT = CLUSTERS.length;

// co-snap's interior, at document level. Each node is a real source
// document (label = its citation shorthand); count = how many of the
// package's 168 rules cite it. Kind drives the tint.
export type DocNode = {
  id: string;
  label: string;
  count: number;
  kind: "hub" | "state-reg" | "fed-reg" | "statute" | "policy";
  // position relative to the cluster centre
  dx: number;
  dy: number;
};

export const CO_SNAP_DOCS: DocNode[] = [
  { id: "cdhs", label: "cdhs/fy-2026", count: 10, kind: "hub", dx: 0, dy: 0 },
  // Colorado regulations — 10 CCR 2506-1
  { id: "4.207", label: "4.207", count: 9, kind: "state-reg", dx: 20, dy: -12 },
  { id: "4.401", label: "4.401", count: 5, kind: "state-reg", dx: 25, dy: 6 },
  { id: "4.403", label: "4.403", count: 25, kind: "state-reg", dx: 12, dy: 21 },
  { id: "4.404", label: "4.404", count: 9, kind: "state-reg", dx: -8, dy: 25 },
  { id: "4.407", label: "4.407", count: 18, kind: "state-reg", dx: -22, dy: 12 },
  { id: "4.408", label: "4.408", count: 14, kind: "state-reg", dx: -25, dy: -8 },
  { id: "4.410", label: "4.410", count: 19, kind: "state-reg", dx: -12, dy: -22 },
  // federal regulations — 7 CFR 273
  { id: "273/3", label: "273/3", count: 4, kind: "fed-reg", dx: 4, dy: -30 },
  { id: "273/4", label: "273/4", count: 7, kind: "fed-reg", dx: 31, dy: -22 },
  { id: "273/5", label: "273/5", count: 15, kind: "fed-reg", dx: 36, dy: 18 },
  { id: "273/7", label: "273/7", count: 4, kind: "fed-reg", dx: -34, dy: 22 },
  { id: "273/8", label: "273/8", count: 3, kind: "fed-reg", dx: -36, dy: 2 },
  { id: "273/24", label: "273/24", count: 8, kind: "fed-reg", dx: 24, dy: 30 },
  // statutes — 7 U.S.C.
  { id: "7/2017", label: "7 usc 2017", count: 5, kind: "statute", dx: -6, dy: -38 },
  { id: "7/2014", label: "7 usc 2014", count: 5, kind: "statute", dx: -28, dy: -32 },
  { id: "7/2012", label: "7 usc 2012", count: 1, kind: "statute", dx: -42, dy: -16 },
  // USDA policy tables
  { id: "cola", label: "usda fy-2026 cola", count: 8, kind: "policy", dx: 42, dy: -4 },
];

// real document-level dependency edges beyond the hub's own spokes
// (from /v1/rules/us-co.10_ccr_2506_1_4_207_2/dependencies)
export const CO_SNAP_XLINKS: Array<[string, string]> = [
  ["4.207", "7/2017"],
  ["4.207", "7/2014"],
  ["4.207", "cola"],
];
