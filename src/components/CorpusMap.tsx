import { useEffect, useRef } from "react";
import { geoOrthographic, geoEquirectangular, geoPath, geoGraticule10, geoCentroid, geoProjectionMutator, geoOrthographicRaw, geoEquirectangularRaw } from "d3-geo";
import { feature } from "topojson-client";
import worldTopo from "world-atlas/countries-110m.json";
import previewApp from "../assets/preview-app.png";
import previewFinbot from "../assets/preview-finbot.png";
import previewGraph from "../assets/preview-graph.png";
import previewOracles from "../assets/preview-oracles.png";

// the finale's tool row — real captures of live demo sessions
const PREVIEWS = [
  { src: previewApp, t: "axiom app", s: "every rule, executable" },
  { src: previewFinbot, t: "finbot", s: "$994/mo — computed, cited" },
  { src: previewGraph, t: "rule graph", s: "Colorado SNAP · 210 rules" },
  { src: previewOracles, t: "oracles", s: "99.43% of 7.7M checks" },
];

// THE MAP OF THE LAW — every provision, addressable, on the real Earth.
//
// Geography comes from Natural Earth (world-atlas, 110m): every country
// on the planet, real shapes, real places. The four charted jurisdictions
// (US, UK, Canada, Belgium) are rasterised into a pixel plate where the
// provision texture, title/chapter parcels, and the deep zoom live —
// grown with Eden growth INSIDE the real country shapes. Everyone else
// is parchment: not yet charted.
//
// Two projections of one world:
//   GLOBE  — vector orthographic (d3-geo): fast, crisp, spinnable.
//   CHART  — the equirect pixel plate: zoom through parcels down to the
//            text of 7 U.S.C. § 2017, the section the journey encodes.

// ── deterministic PRNG ───────────────────────────────────────────────
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W0 = 1868;
const H0 = 934; // 2:1 equirect plate
const N = W0 * H0;

const US_TITLES = [
  "T1 General", "T2 Congress", "T5 Gov. Organization", "T7 Agriculture",
  "T8 Aliens", "T10 Armed Forces", "T11 Bankruptcy", "T12 Banking",
  "T15 Commerce", "T16 Conservation", "T17 Copyrights", "T18 Crimes",
  "T19 Customs", "T20 Education", "T21 Food & Drugs", "T22 Foreign Rel.",
  "T23 Highways", "T25 Indians", "T26 Internal Revenue", "T28 Judiciary",
  "T29 Labor", "T30 Mineral Lands", "T31 Money & Finance", "T33 Navigation",
  "T35 Patents", "T38 Veterans", "T39 Postal", "T40 Public Buildings",
  "T42 Public Health", "T43 Public Lands", "T45 Railroads", "T46 Shipping",
  "T47 Telecom", "T49 Transportation", "T50 War & Defense", "T52 Elections",
];
const STATES = "AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC".split(" ");

const SNAP_SECTIONS = [
  "Congressional declaration of policy", "Definitions",
  "Establishment of program", "Eligible households",
  "Eligibility disqualifications", "Issuance and use of benefits",
  "Value of allotment", "Approval of retail food stores",
  "Redemption of program benefits", "Administration",
  "Civil penalties and forfeitures", "Disposition of claims",
  "Administrative and judicial review", "Violations and enforcement",
  "Administrative cost-sharing", "Research and demonstration projects",
  "Universal service", "Regulations", "Appropriations",
  "Puerto Rico block grant", "Workfare", "Food distribution programs",
  "Minnesota Family Investment Project", "Simplified application",
  "Assistance for community food projects", "Availability of records",
];

// the charted world: Natural Earth name → title/code structure
const CHARTED: Record<string, { display: string; kids: string[] }> = {
  "United States of America": {
    display: "UNITED STATES",
    kids: [...US_TITLES, ...STATES.map((s) => `${s} Code`)],
  },
  "United Kingdom": {
    display: "UNITED KINGDOM",
    kids: ["Acts 1970–99", "Acts 2000–09", "Acts 2010–19", "Acts 2020–26", "SIs A–L", "SIs M–Z", "Welfare", "Tax"],
  },
  Canada: {
    display: "CANADA",
    kids: ["RSC A–E", "RSC F–O", "RSC P–Z", "Regulations", "Annual"],
  },
  Belgium: {
    display: "BELGIUM",
    kids: ["Codes", "Lois/Wetten", "Arrêtés", "Décrets"],
  },
};

type Region = {
  label: string;
  jurIdx: number;
  jur: string;
  title: string;
  count: number;
  encoded: number;
  startSection: number;
  cx: number;
  cy: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  tone: number;
  real?: string[];
  cells?: Int32Array;
};

type Jur = {
  label: string;
  charted: boolean;
  count: number;
  cx: number; // plate coords of the geo centroid
  cy: number;
  lon: number; // radians
  lat: number;
};

// Eden growth (titles/chapters inside a country mask)
function grow(
  lab: Int32Array,
  allowedLab: Int32Array,
  allowedVal: number,
  seeds: number[],
  quotas: number[],
  base: number,
  rnd: () => number,
) {
  const K = seeds.length;
  const frontiers: number[][] = seeds.map(() => []);
  const grown = new Array(K).fill(0);
  for (let r = 0; r < K; r++) {
    const s = seeds[r];
    if (lab[s] === -1) {
      lab[s] = base + r;
      grown[r] = 1;
      frontiers[r].push(s);
    }
  }
  const expandOne = (r: number): boolean => {
    const fr = frontiers[r];
    while (fr.length) {
      const j = (rnd() * fr.length) | 0;
      const cell = fr[j];
      fr[j] = fr[fr.length - 1];
      fr.pop();
      const x = cell % W0;
      const y = (cell / W0) | 0;
      let claimed = false;
      const tryClaim = (c: number) => {
        if (!claimed && lab[c] === -1 && allowedLab[c] === allowedVal) {
          lab[c] = base + r;
          claimed = true;
          fr.push(c);
        }
      };
      tryClaim(x > 0 ? cell - 1 : cell + W0 - 1);
      if (!claimed) tryClaim(x < W0 - 1 ? cell + 1 : cell - W0 + 1);
      if (!claimed && y > 0) tryClaim(cell - W0);
      if (!claimed && y < H0 - 1) tryClaim(cell + W0);
      if (claimed) {
        if (
          lab[x > 0 ? cell - 1 : cell + W0 - 1] === -1 ||
          lab[x < W0 - 1 ? cell + 1 : cell - W0 + 1] === -1 ||
          (y > 0 && lab[cell - W0] === -1) ||
          (y < H0 - 1 && lab[cell + W0] === -1)
        )
          fr.push(cell);
        return true;
      }
    }
    return false;
  };
  let active = K;
  const alive = new Array(K).fill(true);
  while (active > 0) {
    active = 0;
    for (let r = 0; r < K; r++) {
      if (!alive[r]) continue;
      const step = Math.max(1, ((quotas[r] - grown[r]) / 200) | 0);
      let did = 0;
      for (let k = 0; k < step && grown[r] < quotas[r]; k++) {
        if (expandOne(r)) {
          grown[r]++;
          did++;
        } else break;
      }
      if (grown[r] >= quotas[r] || (did === 0 && frontiers[r].length === 0)) alive[r] = false;
      else active++;
    }
  }
  // sweep: every cell of the mask ends up owned
  let frontier: number[] = [];
  for (let i = 0; i < N; i++) {
    if (lab[i] < base || lab[i] >= base + K) continue;
    const x = i % W0;
    const y = (i / W0) | 0;
    const L = x > 0 ? i - 1 : i + W0 - 1;
    const R = x < W0 - 1 ? i + 1 : i - W0 + 1;
    if (
      (lab[L] === -1 && allowedLab[L] === allowedVal) ||
      (lab[R] === -1 && allowedLab[R] === allowedVal) ||
      (y > 0 && lab[i - W0] === -1 && allowedLab[i - W0] === allowedVal) ||
      (y < H0 - 1 && lab[i + W0] === -1 && allowedLab[i + W0] === allowedVal)
    )
      frontier.push(i);
  }
  while (frontier.length) {
    const next: number[] = [];
    for (const cell of frontier) {
      const v = lab[cell];
      const x = cell % W0;
      const y = (cell / W0) | 0;
      const go = (c: number) => {
        if (lab[c] === -1 && allowedLab[c] === allowedVal) {
          lab[c] = v;
          next.push(c);
        }
      };
      go(x > 0 ? cell - 1 : cell + W0 - 1);
      go(x < W0 - 1 ? cell + 1 : cell - W0 + 1);
      if (y > 0) go(cell - W0);
      if (y < H0 - 1) go(cell + W0);
    }
    frontier = next;
  }
}

type CountryFeature = GeoJSON.Feature<GeoJSON.Geometry, { name: string }>;

function buildWorld() {
  const rnd = mulberry32(20260716);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const topo = worldTopo as any;
  const fc = feature(topo, topo.objects.countries) as unknown as GeoJSON.FeatureCollection<
    GeoJSON.Geometry,
    { name: string }
  >;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const features = fc.features as CountryFeature[];

  // rasterise real country shapes into the plate
  const proj = geoEquirectangular()
    .translate([W0 / 2, H0 / 2])
    .scale(W0 / (2 * Math.PI))
    .precision(0.2);
  const mcv = document.createElement("canvas");
  mcv.width = W0;
  mcv.height = H0;
  const mctx = mcv.getContext("2d", { willReadFrequently: true })!;
  const mpath = geoPath(proj, mctx);
  const jurLab = new Int32Array(N).fill(-1);
  const jurs: Jur[] = [];
  features.forEach((f, idx) => {
    const name = f.properties?.name ?? `#${idx}`;
    mctx.clearRect(0, 0, W0, H0);
    mctx.beginPath();
    mpath(f);
    mctx.fillStyle = "#fff";
    mctx.fill();
    const b = mpath.bounds(f);
    const bx0 = Math.max(0, Math.floor(b[0][0]));
    const by0 = Math.max(0, Math.floor(b[0][1]));
    const bx1 = Math.min(W0, Math.ceil(b[1][0]));
    const by1 = Math.min(H0, Math.ceil(b[1][1]));
    const [clon, clat] = geoCentroid(f);
    const pc = proj([clon, clat]) ?? [0, 0];
    const jur: Jur = {
      label: CHARTED[name]?.display ?? name.toUpperCase(),
      charted: name in CHARTED,
      count: 0,
      cx: pc[0],
      cy: pc[1],
      lon: (clon * Math.PI) / 180,
      lat: (clat * Math.PI) / 180,
    };
    if (bx1 > bx0 && by1 > by0) {
      const bw = bx1 - bx0;
      const im = mctx.getImageData(bx0, by0, bw, by1 - by0).data;
      for (let y = by0; y < by1; y++) {
        for (let x = bx0; x < bx1; x++) {
          if (im[((y - by0) * bw + (x - bx0)) * 4 + 3] > 127) {
            jurLab[y * W0 + x] = idx;
            jur.count++;
          }
        }
      }
    }
    jurs.push(jur);
  });

  // titles & chapters grow inside the charted country masks
  const titleLab = new Int32Array(N).fill(-1);
  const chLab = new Int32Array(N).fill(-1);
  const chapters: Region[] = [];
  const titleStats: Array<{ label: string; cx: number; cy: number; count: number }> = [];
  let titleBase = 0;
  let chBase = 0;
  let snapRegion: Region | undefined;

  features.forEach((f, ji) => {
    const name = f.properties?.name ?? "";
    const spec = CHARTED[name];
    if (!spec || jurs[ji].count === 0) return;
    const cells: number[] = [];
    for (let i = 0; i < N; i++) if (jurLab[i] === ji) cells.push(i);
    const K = spec.kids.length;
    const weights = spec.kids.map(() => 0.35 + Math.pow(rnd(), 1.8) * 3);
    const t7 = spec.kids.indexOf("T7 Agriculture");
    if (t7 >= 0) weights[t7] = 2.4;
    const wsum = weights.reduce((a, b) => a + b, 0);
    const quotas = weights.map((w) => Math.floor((w / wsum) * cells.length));
    const seeds = weights.map((_, k) => cells[Math.floor(((k + 0.5) / K) * cells.length)]);
    grow(titleLab, jurLab, ji, seeds, quotas, titleBase, rnd);

    spec.kids.forEach((label, k) => {
      titleStats.push({ label, cx: 0, cy: 0, count: 0 });
      const ti = titleBase + k;
      const tCells: number[] = [];
      for (const c of cells) if (titleLab[c] === ti) tCells.push(c);
      if (tCells.length === 0) return;
      const isT7 = k === t7;
      const nCh = Math.max(2, 4 + Math.floor(rnd() * 9));
      const chWeights = Array.from({ length: nCh }, () => 0.3 + Math.pow(rnd(), 2) * 2.5);
      const ch51 = isT7 ? Math.floor(nCh / 2) : -1;
      const cwsum = chWeights.reduce((a, b) => a + b, 0);
      const chQuotas = chWeights.map((w, c) =>
        isT7 && c === ch51 ? SNAP_SECTIONS.length : Math.floor((w / cwsum) * tCells.length),
      );
      const chSeeds = chWeights.map((_, c) => tCells[Math.floor(((c + 0.5) / nCh) * tCells.length)]);
      grow(chLab, titleLab, ti, chSeeds, chQuotas, chBase, rnd);
      const titleTone = 10 + ((ti * 7 + ji * 3) % 5) * 4;
      chWeights.forEach((_, c) => {
        const real = isT7 && c === ch51;
        const region: Region = {
          label: real ? "ch. 51 · SNAP" : `ch. ${c * 7 + 3 + Math.floor(rnd() * 4)}`,
          jurIdx: ji,
          jur: jurs[ji].label,
          title: label,
          count: 0,
          encoded: 0,
          startSection: real ? 2011 : 1 + Math.floor(rnd() * 900),
          cx: 0,
          cy: 0,
          x0: W0,
          y0: H0,
          x1: 0,
          y1: 0,
          tone: titleTone + (c % 2) * 6,
          real: real ? SNAP_SECTIONS : undefined,
        };
        if (real) snapRegion = region;
        chapters.push(region);
      });
      chBase += nCh;
    });
    titleBase += K;
  });

  for (let i = 0; i < N; i++) {
    const c = chLab[i];
    if (c < 0) continue;
    const ch = chapters[c];
    const x = i % W0;
    const y = (i / W0) | 0;
    ch.count++;
    ch.cx += x;
    ch.cy += y;
    if (x < ch.x0) ch.x0 = x;
    if (x > ch.x1) ch.x1 = x;
    if (y < ch.y0) ch.y0 = y;
    if (y > ch.y1) ch.y1 = y;
    const st = titleStats[titleLab[i]];
    st.count++;
    st.cx += x;
    st.cy += y;
  }
  chapters.forEach((ch) => {
    ch.cx /= Math.max(1, ch.count);
    ch.cy /= Math.max(1, ch.count);
  });
  titleStats.forEach((st) => {
    st.cx /= Math.max(1, st.count);
    st.cy /= Math.max(1, st.count);
  });

  // encoded: SNAP complete + scattered clusters ≈ 3,300
  const snap = snapRegion!;
  snap.encoded = snap.count;
  let budget = 3300;
  const rnd2 = mulberry32(77);
  let guard = 0;
  while (budget > 0 && guard++ < 6000) {
    const c = chapters[Math.floor(rnd2() * chapters.length)];
    if (!c || c.real || c.encoded > 0 || c.count < 30) continue;
    const take = Math.min(budget, Math.floor(c.count * (0.05 + rnd2() * 0.3)));
    if (take < 6) continue;
    c.encoded = take;
    budget -= take;
  }

  return { features, jurs, jurLab, titleLab, chLab, chapters, titleStats, snap };
}

const INKC = "28,25,23";
const ENC = "146,64,14"; // the axiom brown — encoded & verified
const AMBER = "146,64,14";
const PAPER = "#faf9f6";
const PAPER_EL = "#ffffff";

type Cam = { x: number; y: number; s: number };

export function CorpusMap({
  autopilot = false,
  finale = false,
  pose = "globe",
  onArrived,
}: {
  autopilot?: boolean;
  finale?: boolean;
  pose?: "globe" | "landed";
  onArrived?: () => void;
} = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hudRef = useRef<HTMLDivElement | null>(null);
  const flyBtn = useRef<HTMLButtonElement | null>(null);
  const resetBtn = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const hud = hudRef.current!;
    const ctx = canvas.getContext("2d")!;
    const { features, jurs, jurLab, titleLab, chLab, chapters, titleStats, snap } = buildWorld();
    const snapIdx = chapters.indexOf(snap);

    // all chapter cell lists, built once — no lazy scans mid-zoom
    {
      const fills = chapters.map((ch) => new Int32Array(ch.count));
      const idxs = new Int32Array(chapters.length);
      for (let i = 0; i < N; i++) {
        const c = chLab[i];
        if (c < 0) continue;
        fills[c][idxs[c]++] = i;
      }
      chapters.forEach((ch, c) => (ch.cells = fills[c]));
    }
    const cellsOf = (ch: Region, _idx: number): Int32Array => ch.cells!;

    // ── the pixel plate (chart mode) ──
    const base = document.createElement("canvas");
    base.width = W0;
    base.height = H0;
    const bctx = base.getContext("2d")!;
    const img = bctx.createImageData(W0, H0);
    const px = img.data;
    const rnd = mulberry32(4242);
    const greenDots: number[] = []; // sampled encoded pixels, for the globe
    for (let i = 0; i < N; i++) {
      const o = i * 4;
      const ch = chapters[chLab[i]];
      if (!ch) {
        if (jurLab[i] === -1) {
          // calm flat sea — engraved waves belong to the globe, where the
          // pattern stays screen-scale instead of blurring under zoom
          px[o] = 92; px[o + 1] = 114; px[o + 2] = 120;
          px[o + 3] = 26;
        } else {
          px[o] = 28; px[o + 1] = 25; px[o + 2] = 23;
          px[o + 3] = rnd() < 0.03 ? 26 : 8;
        }
        continue;
      }
      const y = (i / W0) | 0;
      const encFrac = ch.encoded / Math.max(1, ch.count);
      const wash = encFrac > 0.55;
      const local = 1 - (y - ch.y0) / Math.max(1, ch.y1 - ch.y0);
      const enc = wash || rnd() < encFrac * (0.55 + 0.9 * local);
      if (enc) {
        px[o] = 146; px[o + 1] = 64; px[o + 2] = 14;
        px[o + 3] = wash ? 165 + ((rnd() * 40) | 0) : 150 + ((rnd() * 60) | 0);
        if (rnd() < 0.05) greenDots.push(i);
      } else {
        px[o] = 28; px[o + 1] = 25; px[o + 2] = 23;
        px[o + 3] = ch.tone + ((rnd() * 14) | 0);
      }
    }
    bctx.putImageData(img, 0, 0);

    // boundary plate
    const bounds = document.createElement("canvas");
    bounds.width = W0;
    bounds.height = H0;
    const bdx = bounds.getContext("2d")!;
    const bimg = bdx.createImageData(W0, H0);
    const bpx = bimg.data;
    for (let i = 0; i < N; i++) {
      const x = i % W0;
      const y = (i / W0) | 0;
      let a = 0;
      const right = x < W0 - 1 ? i + 1 : i - W0 + 1;
      const down = y < H0 - 1 ? i + W0 : i;
      if (titleLab[i] !== titleLab[right] || titleLab[i] !== titleLab[down]) a = 120;
      else if (chLab[i] !== chLab[right] || chLab[i] !== chLab[down]) a = 48;
      if (a) {
        const o = i * 4;
        bpx[o] = 28; bpx[o + 1] = 25; bpx[o + 2] = 23; bpx[o + 3] = a;
      }
    }
    bdx.putImageData(bimg, 0, 0);

    // green dots in lon/lat, for the globe's encoded stipple
    const dotLL = greenDots.map((i) => {
      const x = i % W0;
      const y = (i / W0) | 0;
      return [(x / W0) * 360 - 180, 90 - (y / H0) * 180] as [number, number];
    });

    const previewImgs = PREVIEWS.map((t) => {
      const im = new Image();
      im.src = t.src;
      return im;
    });

    // the finale stipple — every charted cell lit, uncharted land glimmering;
    // trig precomputed so the spinning globe can project them without d3
    type FinDot = { lo: number; sinLa: number; cosLa: number; charted: boolean };
    const finDots: FinDot[] = [];
    if (finale) {
      const rndF = mulberry32(777);
      for (let i = 0; i < N; i++) {
        if (jurLab[i] === -1) continue;
        const charted = !!chapters[chLab[i]];
        if (rndF() > (charted ? 0.055 : 0.016)) continue;
        const lo = ((i % W0) / W0) * Math.PI * 2 - Math.PI;
        const la = (0.5 - ((i / W0) | 0) / H0) * Math.PI;
        finDots.push({ lo, sinLa: Math.sin(la), cosLa: Math.cos(la), charted });
      }
    }

    // ── canvas ──
    let W = 0;
    let H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    };
    resize();

    // ═══ ONE ZOOM AXIS ═══════════════════════════════════════════════
    // L = log(projection scale). The wheel only ever moves L. The globe,
    // the unroll, and the chart are just RANGES of L — so the morph is
    // scrubbed by the zoom itself: continuous, reversible, no timers, no
    // dropped input, no seams.
    const mm = () => Math.min(W, H);
    const PA = () => mm() * 0.4 * 2.9; // globe ends / unroll begins
    const PB = () => PA() * 1.7; // unroll ends / chart begins
    const PMIN = () => mm() * 0.4 * 0.75;
    const PMAX = () => (900 * W0) / (2 * Math.PI);
    let lon0 = -0.9;
    let lat0 = 0.62;
    let L = Math.log(mm() * (finale ? 0.3 : 0.4));
    let LT = L;
    const P = () => Math.exp(L);
    const reg = () => (P() < PA() ? 0 : P() < PB() ? 1 : 2); // globe | unroll | chart
    let anchor: { mx: number; my: number } | null = null;
    let spin = true;
    // the unroll's rotation glide: from (globe side) → to (chart side)
    const band = { f: [lon0, lat0] as [number, number], t: [lon0, lat0] as [number, number] };
    let cam: Cam = { x: 0, y: 0, s: 1 };

    const normLon = (l: number) => {
      while (l > Math.PI) l -= Math.PI * 2;
      while (l < -Math.PI) l += Math.PI * 2;
      return l;
    };
    const plateXY = (lon: number, lat: number) => [
      ((normLon(lon) + Math.PI) / (2 * Math.PI)) * W0,
      (0.5 - lat / Math.PI) * H0,
    ];
    const camCenter = (): [number, number] => {
      const ccx = cam.x + W / cam.s / 2;
      const ccy = cam.y + H / cam.s / 2;
      return [normLon((ccx / W0) * Math.PI * 2 - Math.PI), Math.max(-1.25, Math.min(1.25, (0.5 - ccy / H0) * Math.PI))];
    };
    // inverse orthographic at a screen point (globe regime)
    const pointAt = (mx: number, my: number, R: number): [number, number] => {
      let nx = (mx - W / 2) / R;
      let ny = (my - H / 2) / R;
      const d = Math.hypot(nx, ny);
      if (d > 0.95) {
        nx *= 0.95 / d;
        ny *= 0.95 / d;
      }
      const z = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      const yv = -ny;
      const cosL = Math.cos(lat0);
      const sinL = Math.sin(lat0);
      const lat = Math.asin(Math.max(-1, Math.min(1, yv * cosL + z * sinL)));
      const lon = normLon(Math.atan2(nx, -yv * sinL + z * cosL) + lon0);
      return [lon, Math.max(-1.25, Math.min(1.25, lat))];
    };

    // regime boundary crossings keep every representation continuous
    const crossings = (Lold: number, Lnew: number) => {
      const a = Math.log(PA());
      const b = Math.log(PB());
      if (Lold < a && Lnew >= a) {
        // globe → unroll: glide toward the aimed-at point
        band.f = [lon0, lat0];
        band.t = anchor ? pointAt(anchor.mx, anchor.my, PA()) : [lon0, lat0];
      }
      if (Lold < b && Lnew >= b) {
        // unroll → chart: land centred on the glide target
        lon0 = band.t[0];
        lat0 = band.t[1];
        const sN = (Math.exp(Lnew) * 2 * Math.PI) / W0;
        const [cxw, cyw] = plateXY(lon0, lat0);
        cam = { s: sN, x: cxw - W / sN / 2, y: cyw - H / sN / 2 };
        anchor = null;
      }
      if (Lold >= b && Lnew < b) {
        // chart → unroll: roll up around the chart's centre
        const c = camCenter();
        band.f = c;
        band.t = c;
        lon0 = c[0];
        lat0 = c[1];
      }
    };

    // per-frame zoom bookkeeping for the active regime
    const applyZoomStep = (Lold: number, Lnew: number) => {
      const r = reg();
      if (r === 0 && anchor) {
        const R0 = Math.exp(Lold);
        const R1 = Math.exp(Lnew);
        const dx = anchor.mx - W / 2;
        const dy = anchor.my - H / 2;
        const dR = 1 / R0 - 1 / R1;
        lon0 += (dx * dR) / Math.max(0.35, Math.cos(lat0));
        lat0 = Math.max(-1.25, Math.min(1.25, lat0 - dy * dR));
      } else if (r === 2) {
        const sOld = cam.s;
        const sNew = (Math.exp(Lnew) * 2 * Math.PI) / W0;
        const ax = anchor ? anchor.mx : W / 2;
        const ay = anchor ? anchor.my : H / 2;
        const wx = cam.x + ax / sOld;
        const wy = cam.y + ay / sOld;
        cam.s = sNew;
        cam.x = wx - ax / sNew;
        cam.y = wy - ay / sNew;
      }
    };

    // ── shared drawing kit ──
    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };
    const anyCtx = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
    const halo = (t: string, x: number, y: number, font: string, fill: string, spacing = "0px", center = false) => {
      anyCtx.letterSpacing = spacing;
      ctx.font = font;
      ctx.textAlign = center ? "center" : "left";
      ctx.strokeStyle = "rgba(250,249,246,0.92)";
      ctx.lineWidth = 3.5;
      ctx.strokeText(t, x, y);
      ctx.fillStyle = fill;
      ctx.fillText(t, x, y);
      ctx.textAlign = "left";
      anyCtx.letterSpacing = "0px";
    };
    const drawFurniture = () => {
      ctx.strokeStyle = `rgba(${INKC},0.7)`;
      ctx.lineWidth = 1.4;
      ctx.strokeRect(6, 6, W - 12, H - 12);
      ctx.strokeStyle = `rgba(${INKC},0.4)`;
      ctx.lineWidth = 0.6;
      ctx.strokeRect(11, 11, W - 22, H - 22);
      const sub = "REAL BORDERS · CHARTED: 1,742,391 PROVISIONS";
      anyCtx.letterSpacing = "0.6px";
      ctx.font = "8.5px ui-monospace, monospace";
      const cart = { x: 22, y: H - 92, w: Math.max(248, ctx.measureText(sub).width + 28), h: 70 };
      anyCtx.letterSpacing = "0px";
      ctx.save();
      ctx.shadowColor = "rgba(28,25,23,0.18)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = PAPER_EL;
      roundRect(cart.x, cart.y, cart.w, cart.h, 4);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = `rgba(${INKC},0.5)`;
      ctx.lineWidth = 0.8;
      roundRect(cart.x, cart.y, cart.w, cart.h, 4);
      ctx.stroke();
      ctx.fillStyle = `rgba(${INKC},0.95)`;
      ctx.font = "15px Georgia, serif";
      ctx.fillText("The Map of the Law", cart.x + 14, cart.y + 24);
      anyCtx.letterSpacing = "0.6px";
      ctx.font = "8.5px ui-monospace, monospace";
      ctx.fillStyle = `rgba(${INKC},0.55)`;
      ctx.fillText(sub, cart.x + 14, cart.y + 40);
      anyCtx.letterSpacing = "0px";
      ctx.fillStyle = `rgba(${ENC},0.75)`;
      ctx.fillRect(cart.x + 14, cart.y + 50, 8, 8);
      ctx.fillStyle = `rgba(${INKC},0.18)`;
      ctx.fillRect(cart.x + 82, cart.y + 50, 8, 8);
      ctx.strokeStyle = `rgba(${INKC},0.3)`;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(cart.x + 158, cart.y + 50, 8, 8);
      ctx.font = "8.5px ui-monospace, monospace";
      ctx.fillStyle = `rgba(${INKC},0.6)`;
      ctx.fillText("encoded", cart.x + 27, cart.y + 57.5);
      ctx.fillText("published", cart.x + 95, cart.y + 57.5);
      ctx.fillText("uncharted", cart.x + 171, cart.y + 57.5);
    };

    const seaTile = document.createElement("canvas");
    seaTile.width = 10;
    seaTile.height = 7;
    const stx = seaTile.getContext("2d")!;
    stx.fillStyle = "rgba(92,114,120,0.10)";
    stx.fillRect(0, 0, 10, 7);
    stx.strokeStyle = "rgba(92,114,120,0.28)";
    stx.lineWidth = 0.7;
    stx.beginPath();
    stx.moveTo(0, 3.5);
    stx.lineTo(6.5, 3.5);
    stx.stroke();
    const seaPattern = ctx.createPattern(seaTile, "repeat")!;
    const bigUncharted = jurs
      .map((j, i) => ({ j, i }))
      .filter(({ j }) => !j.charted && j.count > 900)
      .sort((a, b) => b.j.count - a.j.count)
      .slice(0, 34);

    // ── GLOBE ──
    const drawGlobe = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, W, H);
      const R = P();
      const cx = W / 2;
      const cy = finale ? H * 0.36 : H / 2;
      const proj = geoOrthographic()
        .translate([cx, cy])
        .scale(R)
        .rotate([(-lon0 * 180) / Math.PI, (-lat0 * 180) / Math.PI])
        .clipAngle(90)
        .precision(0.5);
      const path = geoPath(proj, ctx);
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = seaPattern;
      ctx.fill();
      ctx.beginPath();
      path(geoGraticule10());
      ctx.strokeStyle = `rgba(${INKC},0.12)`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
      features.forEach((f, i) => {
        const j = jurs[i];
        ctx.beginPath();
        path(f);
        ctx.fillStyle = j.charted ? "rgba(28,25,23,0.13)" : "rgba(28,25,23,0.055)";
        ctx.fill();
        ctx.strokeStyle = `rgba(${INKC},${j.charted ? 0.66 : 0.34})`;
        ctx.lineWidth = j.charted ? 0.9 : 0.5;
        ctx.stroke();
      });
      const cLon = lon0;
      const cLat = lat0;
      // a dot in the axiom card language: paper body, green rule across the top
      const dotCard = (x: number, y: number, r: number, a: number) => {
        if (r < 2.1) {
          ctx.fillStyle = `rgba(${ENC},${a.toFixed(3)})`;
          ctx.fillRect(x - r / 2, y - r / 2, r, r);
          return;
        }
        const h = r * 1.2;
        ctx.fillStyle = `rgba(250,249,246,${(0.92 * a).toFixed(3)})`;
        ctx.fillRect(x - r / 2, y - h / 2, r, h);
        ctx.fillStyle = `rgba(${ENC},${a.toFixed(3)})`;
        ctx.fillRect(x - r / 2, y - h / 2, r, Math.max(0.9, h * 0.32));
      };
      if (finale) {
        const sinCL = Math.sin(cLat);
        const cosCL = Math.cos(cLat);
        const rC = Math.max(2.4, R * 0.0115);
        const rU = Math.max(1.6, R * 0.007);
        for (const d of finDots) {
          const cosDL = Math.cos(d.lo - cLon);
          const cosD = sinCL * d.sinLa + cosCL * d.cosLa * cosDL;
          if (cosD < 0.03) continue;
          const x = cx + R * d.cosLa * Math.sin(d.lo - cLon);
          const y = cy - R * (cosCL * d.sinLa - sinCL * d.cosLa * cosDL);
          const edge = Math.min(1, 0.3 + cosD * 1.4);
          if (d.charted) dotCard(x, y, rC, 0.95 * edge);
          else dotCard(x, y, rU, 0.4 * edge);
        }
      } else {
        for (const [dlon, dlat] of dotLL) {
          const lo = (dlon * Math.PI) / 180;
          const la = (dlat * Math.PI) / 180;
          const cosD = Math.sin(cLat) * Math.sin(la) + Math.cos(cLat) * Math.cos(la) * Math.cos(lo - cLon);
          if (cosD < 0.05) continue;
          const pp = proj([dlon, dlat]);
          if (!pp) continue;
          dotCard(pp[0], pp[1], Math.max(2.3, R * 0.009), 0.85);
        }
      }
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${INKC},0.75)`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      const glow = ctx.createRadialGradient(cx, cy, R, cx, cy, R * 1.08);
      glow.addColorStop(0, "rgba(146,64,14,0.13)");
      glow.addColorStop(1, "rgba(146,64,14,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.08, 0, Math.PI * 2);
      ctx.arc(cx, cy, R, 0, Math.PI * 2, true);
      ctx.fill();
      const front = (lon: number, lat: number) =>
        Math.sin(cLat) * Math.sin(lat) + Math.cos(cLat) * Math.cos(lat) * Math.cos(lon - cLon);
      jurs.forEach((j) => {
        if (!j.charted) return;
        if (front(j.lon, j.lat) < 0.22) return;
        const pp = proj([(j.lon * 180) / Math.PI, (j.lat * 180) / Math.PI]);
        if (!pp) return;
        halo(j.label, pp[0], pp[1], "600 11px ui-monospace, monospace", `rgba(${INKC},0.92)`, "2px", true);
      });
      if (!finale && P() > mm() * 0.38) {
        for (const { j } of bigUncharted) {
          if (front(j.lon, j.lat) < 0.4) continue;
          const pp = proj([(j.lon * 180) / Math.PI, (j.lat * 180) / Math.PI]);
          if (!pp) continue;
          halo(j.label, pp[0], pp[1], "7.5px ui-monospace, monospace", `rgba(${INKC},0.42)`, "1.5px", true);
        }
      }
      if (finale) {
        // the lit world feeding every surface — real captures of the demos
        const n = PREVIEWS.length;
        const cw = Math.min(216, W * 0.21);
        const chh = 142;
        const gap = Math.min(28, W * 0.024);
        const ty = H - chh - 8;
        ctx.font = "9.5px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = `rgba(${INKC},0.55)`;
        ctx.fillText("T H E   E N C O D E D   C O R P U S   ·   P O W E R I N G   E V E R Y   S U R F A C E", W / 2, ty - 16);
        ctx.textAlign = "left";
        const dashOff = -((performance.now() / 45) % 14);
        PREVIEWS.forEach((tool, k) => {
          const x = W / 2 + (k - (n - 1) / 2) * (cw + gap) - cw / 2;
          const ccx = x + cw / 2;
          const th = (k - (n - 1) / 2) * 0.32;
          const bx = cx + R * Math.sin(th);
          const by = cy + R * Math.cos(th) + 3;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.quadraticCurveTo(bx, (by + ty) / 2 + 24, ccx, ty - 24);
          ctx.setLineDash([2, 5]);
          ctx.lineDashOffset = dashOff;
          ctx.strokeStyle = `rgba(${ENC},0.55)`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = PAPER_EL;
          roundRect(x, ty, cw, chh, 6);
          ctx.shadowColor = "rgba(28,25,23,0.12)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetY = 3;
          ctx.fill();
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
          ctx.strokeStyle = `rgba(${INKC},0.3)`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.fillStyle = `rgba(${ENC},0.9)`;
          ctx.fillRect(x, ty, cw, 3);
          ctx.fillStyle = `rgba(${AMBER},0.9)`;
          ctx.font = "600 10.5px ui-monospace, monospace";
          ctx.fillText("¶", x + 10, ty + 19);
          ctx.fillStyle = `rgba(${INKC},0.92)`;
          ctx.fillText(tool.t, x + 22, ty + 19);
          // the live capture, cover-fit
          const im = previewImgs[k];
          const ix = x + 8;
          const iy = ty + 27;
          const iw = cw - 16;
          const ih = chh - 27 - 24;
          if (im.complete && im.naturalWidth > 0) {
            // contain-fit: the capture stays whole and readable
            const fit = Math.min(iw / im.naturalWidth, ih / im.naturalHeight);
            const dw = im.naturalWidth * fit;
            const dh = im.naturalHeight * fit;
            ctx.save();
            roundRect(ix, iy, iw, ih, 3);
            ctx.clip();
            ctx.fillStyle = "rgba(28,25,23,0.04)";
            ctx.fillRect(ix, iy, iw, ih);
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(im, ix + (iw - dw) / 2, iy + (ih - dh) / 2, dw, dh);
            ctx.restore();
            ctx.strokeStyle = `rgba(${INKC},0.2)`;
            ctx.lineWidth = 0.7;
            roundRect(ix, iy, iw, ih, 3);
            ctx.stroke();
          } else {
            ctx.fillStyle = `rgba(${INKC},0.05)`;
            roundRect(ix, iy, iw, ih, 3);
            ctx.fill();
          }
          ctx.fillStyle = `rgba(${INKC},0.6)`;
          ctx.font = "italic 10.5px Georgia, serif";
          ctx.fillText(tool.s, x + 10, ty + chh - 9);
        });
            } else {
        drawFurniture();
        hud.textContent = "the corpus as a world — drag to spin · scroll to zoom · keep zooming to land";
      }
    };

    // ── THE UNROLL (projection morph, scrubbed by the zoom) ──
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const morphMut = geoProjectionMutator((t: number) => {
      const r: any = (l: number, ph: number) => {
        const a = (geoOrthographicRaw as any)(l, ph);
        const b = (geoEquirectangularRaw as any)(l, ph);
        return [(1 - t) * a[0] + t * b[0], (1 - t) * a[1] + t * b[1]];
      };
      return r;
    }) as unknown as (t: number) => ReturnType<typeof geoOrthographic>;
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const drawMorph = (t: number, scale: number) => {
      const cx = W / 2;
      const cy = H / 2;
      const proj = morphMut(t)
        .rotate([(-lon0 * 180) / Math.PI, ((-lat0 * 180) / Math.PI) * (1 - t), 0])
        .scale(scale)
        .translate([cx, cy + t * scale * lat0])
        .clipAngle(90 + 89.9 * t)
        .precision(0.5);
      const path = geoPath(proj, ctx);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, W, H);
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = seaPattern;
      ctx.fill();
      ctx.strokeStyle = `rgba(${INKC},${0.75 - 0.5 * t})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      path(geoGraticule10());
      ctx.strokeStyle = `rgba(${INKC},0.12)`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
      features.forEach((f, i) => {
        const j = jurs[i];
        ctx.beginPath();
        path(f);
        ctx.fillStyle = j.charted ? "rgba(28,25,23,0.13)" : "rgba(28,25,23,0.055)";
        ctx.fill();
        ctx.strokeStyle = `rgba(${INKC},${j.charted ? 0.66 : 0.34})`;
        ctx.lineWidth = j.charted ? 0.9 : 0.5;
        ctx.stroke();
      });
      // near the chart, its texture settles in — no pop at the boundary
      if (t > 0.82) {
        const a = (t - 0.82) / 0.18;
        const sN = (scale * 2 * Math.PI) / W0;
        const [cxw, cyw] = plateXY(lon0, lat0);
        const camx = cxw - W / sN / 2;
        const camy = cyw - H / sN / 2;
        const sx0 = Math.max(0, camx);
        const sy0 = Math.max(0, camy);
        const sx1 = Math.min(W0, camx + W / sN);
        const sy1 = Math.min(H0, camy + H / sN);
        if (sx1 > sx0 && sy1 > sy0) {
          ctx.globalAlpha = a * 0.9;
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(
            base, sx0, sy0, sx1 - sx0, sy1 - sy0,
            (sx0 - camx) * sN, (sy0 - camy) * sN,
            (sx1 - sx0) * sN, (sy1 - sy0) * sN,
          );
          ctx.globalAlpha = 1;
        }
      }
      drawFurniture();
      hud.textContent = "landing —";
    };

    // ── CHART ──
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, W, H);
      const vx0 = Math.max(0, Math.floor(cam.x));
      const vy0 = Math.max(0, Math.floor(cam.y));
      const vx1 = Math.min(W0, Math.ceil(cam.x + W / cam.s));
      const vy1 = Math.min(H0, Math.ceil(cam.y + H / cam.s));
      const blit = (img: HTMLCanvasElement) => {
        const sx0 = Math.max(0, cam.x);
        const sy0 = Math.max(0, cam.y);
        const sx1 = Math.min(W0, cam.x + W / cam.s);
        const sy1 = Math.min(H0, cam.y + H / cam.s);
        if (sx1 <= sx0 || sy1 <= sy0) return;
        ctx.drawImage(
          img, sx0, sy0, sx1 - sx0, sy1 - sy0,
          (sx0 - cam.x) * cam.s, (sy0 - cam.y) * cam.s,
          (sx1 - sx0) * cam.s, (sy1 - sy0) * cam.s,
        );
      };
      const tCard = Math.max(0, Math.min(1, (cam.s - 8) / 4));
      if (tCard < 1) {
        // nearest-neighbour above cell scale: crisp parcels, no blur
        ctx.imageSmoothingEnabled = cam.s < 3;
        blit(base);
        const parcelAlpha = Math.max(0, Math.min(1, (cam.s - 3.5) / 6));
        if (parcelAlpha > 0) {
          ctx.globalAlpha = parcelAlpha;
          blit(bounds);
          ctx.globalAlpha = 1;
        }
        const pf = geoEquirectangular()
          .scale((W0 / (2 * Math.PI)) * cam.s)
          .translate([(W0 / 2 - cam.x) * cam.s, (H0 / 2 - cam.y) * cam.s])
          .precision(0.3);
        const pathF = geoPath(pf, ctx);
        const wgt = Math.min(1, 0.35 + cam.s * 0.09);
        features.forEach((f, i) => {
          const j = jurs[i];
          ctx.beginPath();
          pathF(f);
          ctx.strokeStyle = `rgba(${INKC},${(j.charted ? 0.66 : 0.3) * wgt})`;
          ctx.lineWidth = (j.charted ? 0.9 : 0.5) * wgt;
          ctx.stroke();
        });
      }
      if (tCard > 0) {
        ctx.globalAlpha = tCard;
        const paintCard = (
          sx: number,
          sy: number,
          ch: NonNullable<(typeof chapters)[number]>,
          secIdx: number,
          enc: boolean,
          shadow = 0,
        ) => {
          const m = cam.s * 0.07;
          if (cam.s < 14) {
            // tiny cards: two fillRects, no path work — the dive stays smooth
            ctx.fillStyle = PAPER_EL;
            ctx.fillRect(sx + m, sy + m, cam.s - 2 * m, cam.s - 2 * m);
            ctx.fillStyle = enc ? `rgba(${ENC},0.85)` : `rgba(${INKC},0.25)`;
            ctx.fillRect(sx + m, sy + m, cam.s - 2 * m, Math.max(1, cam.s * 0.035));
            return;
          }
          ctx.fillStyle = PAPER_EL;
          roundRect(sx + m, sy + m, cam.s - 2 * m, cam.s - 2 * m, Math.min(4, cam.s * 0.04));
          if (shadow > 0) {
            ctx.shadowColor = `rgba(28,25,23,${(0.3 * shadow).toFixed(3)})`;
            ctx.shadowBlur = 24 * shadow;
            ctx.shadowOffsetY = 10 * shadow;
          }
          ctx.fill();
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
          ctx.strokeStyle = `rgba(${INKC},0.28)`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
          ctx.fillStyle = enc ? `rgba(${ENC},0.85)` : `rgba(${INKC},0.25)`;
          ctx.fillRect(sx + m, sy + m, cam.s - 2 * m, Math.max(1.5, cam.s * 0.035));
          if (cam.s > 48) {
            ctx.globalAlpha = tCard * Math.min(1, (cam.s - 48) / 10);
            ctx.fillStyle = `rgba(${AMBER},0.95)`;
            ctx.font = `600 ${Math.min(12, cam.s * 0.11)}px ui-monospace, monospace`;
            ctx.fillText(`§ ${ch.startSection + secIdx}`, sx + m + cam.s * 0.06, sy + m + cam.s * 0.17);
            if (enc) {
              ctx.fillStyle = `rgba(${ENC},0.9)`;
              ctx.font = `${Math.min(11, cam.s * 0.09)}px ui-monospace, monospace`;
              ctx.fillText("✓", sx + cam.s - m - cam.s * 0.1, sy + m + cam.s * 0.17);
            }
            ctx.globalAlpha = tCard;
          }
          if (ch.real && cam.s > 130) {
            ctx.globalAlpha = tCard * Math.min(1, (cam.s - 130) / 20);
            ctx.fillStyle = `rgba(${INKC},0.92)`;
            const fs = Math.min(15, cam.s * 0.085);
            ctx.font = `${fs}px Georgia, serif`;
            const words = ch.real[secIdx].split(" ");
            let line = "";
            let ly = sy + m + cam.s * 0.32;
            for (const wd of words) {
              if ((line + wd).length * fs * 0.5 > cam.s * 0.78) {
                ctx.fillText(line, sx + m + cam.s * 0.06, ly);
                ly += fs * 1.25;
                line = wd + " ";
              } else line += wd + " ";
            }
            ctx.fillText(line, sx + m + cam.s * 0.06, ly);
            ctx.globalAlpha = tCard;
            if (cam.s > 220) {
              ctx.strokeStyle = `rgba(${INKC},0.22)`;
              ctx.lineWidth = 1;
              for (let b = 0; b < 4; b++) {
                const by = ly + fs * 0.9 + b * fs * 0.75;
                if (by > sy + cam.s - m - 8) break;
                ctx.beginPath();
                ctx.moveTo(sx + m + cam.s * 0.06, by);
                ctx.lineTo(sx + m + cam.s * (b === 3 ? 0.52 : 0.86), by);
                ctx.stroke();
              }
            }
          }
        };
        let liftDraw: {
          sx: number;
          sy: number;
          ch: NonNullable<(typeof chapters)[number]>;
          secIdx: number;
          enc: boolean;
        } | null = null;
        for (let y = vy0; y < vy1; y++) {
          for (let x = vx0; x < vx1; x++) {
            const i = y * W0 + x;
            const ch = chapters[chLab[i]];
            const sx = (x - cam.x) * cam.s;
            const sy = (y - cam.y) * cam.s;
            if (!ch) {
              ctx.fillStyle = jurLab[i] === -1 ? "rgba(92,114,120,0.14)" : "rgba(28,25,23,0.04)";
              ctx.fillRect(sx, sy, cam.s + 0.5, cam.s + 0.5);
              continue;
            }
            ctx.fillStyle =
              ch.encoded / Math.max(1, ch.count) > 0.55
                ? "rgba(228,208,190,0.7)"
                : `rgba(${INKC},${((ch.tone / 255) * 0.6).toFixed(3)})`;
            ctx.fillRect(sx, sy, cam.s + 0.5, cam.s + 0.5);
            const right = x < W0 - 1 ? chLab[i + 1] : -2;
            const down2 = y < H0 - 1 ? chLab[i + W0] : -2;
            if (right !== chLab[i]) {
              const heavy = jurLab[i] !== (x < W0 - 1 ? jurLab[i + 1] : -2);
              ctx.fillStyle = `rgba(${INKC},${heavy ? 0.8 : 0.28})`;
              ctx.fillRect(sx + cam.s - (heavy ? 1.5 : 0.8), sy, heavy ? 1.5 : 0.8, cam.s + 0.5);
            }
            if (down2 !== chLab[i]) {
              const heavy = jurLab[i] !== (y < H0 - 1 ? jurLab[i + W0] : -2);
              ctx.fillStyle = `rgba(${INKC},${heavy ? 0.8 : 0.28})`;
              ctx.fillRect(sx, sy + cam.s - (heavy ? 1.5 : 0.8), cam.s + 0.5, heavy ? 1.5 : 0.8);
            }
            const chIdx = chLab[i];
            const cells = cellsOf(ch, chIdx);
            let secIdx = -1;
            let lo = 0;
            let hi = cells.length - 1;
            while (lo <= hi) {
              const mid = (lo + hi) >> 1;
              if (cells[mid] === i) {
                secIdx = mid;
                break;
              }
              if (cells[mid] < i) lo = mid + 1;
              else hi = mid - 1;
            }
            if (secIdx < 0) continue;
            const enc = ch.real ? true : mulberry32(i * 31 + 7)() < ch.encoded / Math.max(1, ch.count);
            if (i === liftCell && lift > 0.001) {
              liftDraw = { sx, sy, ch, secIdx, enc };
              continue;
            }
            paintCard(sx, sy, ch, secIdx, enc);
          }
        }
        // the floating card — drawn last, lifted out of its grid slot
        if (liftDraw) {
          const cx = liftDraw.sx + cam.s / 2;
          const cy = liftDraw.sy + cam.s / 2;
          const k = 1 + 0.055 * lift;
          ctx.save();
          ctx.translate(cx, cy - cam.s * 0.05 * lift);
          ctx.scale(k, k);
          ctx.translate(-cx, -cy);
          paintCard(liftDraw.sx, liftDraw.sy, liftDraw.ch, liftDraw.secIdx, liftDraw.enc, lift);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      }
      for (const j of jurs) {
        if (cam.s > 14 || j.count === 0) continue;
        const sx = (j.cx - cam.x) * cam.s;
        const sy = (j.cy - cam.y) * cam.s;
        if (sx < -100 || sx > W + 100 || sy < -40 || sy > H + 40) continue;
        if (!j.charted) {
          if (j.count * cam.s * cam.s > 2600)
            halo(j.label, sx, sy, "7.5px ui-monospace, monospace", `rgba(${INKC},0.42)`, "1.5px", true);
          continue;
        }
        halo(j.label, sx, sy, "600 11px ui-monospace, monospace", `rgba(${INKC},0.92)`, "2px", true);
      }
      if (cam.s > 2 && cam.s < 70) {
        for (const st of titleStats) {
          const v = st.count * cam.s * cam.s;
          if (v < 5200) continue;
          const a = Math.min(1, (v - 5200) / 5200);
          const sx = (st.cx - cam.x) * cam.s;
          const sy = (st.cy - cam.y) * cam.s;
          if (sx < -80 || sx > W + 80 || sy < -30 || sy > H + 30) continue;
          ctx.globalAlpha = a;
          halo(st.label, sx, sy, "italic 11px Georgia, serif", `rgba(${INKC},0.7)`, "0px", true);
          ctx.globalAlpha = 1;
        }
      }
      if (cam.s > 10 && cam.s < 140) {
        for (const ch of chapters) {
          const v = ch.count * cam.s * cam.s;
          if (v < 24000) continue;
          const a = Math.min(1, (v - 24000) / 24000);
          const sx = (ch.cx - cam.x) * cam.s;
          const sy = (ch.cy - cam.y) * cam.s;
          if (sx < -60 || sx > W + 60 || sy < -20 || sy > H + 20) continue;
          ctx.globalAlpha = a;
          halo(ch.label, sx, sy, "600 9px ui-monospace, monospace", `rgba(${AMBER},0.9)`, "1px", true);
          ctx.globalAlpha = 1;
        }
      }
      drawFurniture();
      const ccx = Math.floor(cam.x + W / cam.s / 2);
      const ccy = Math.floor(cam.y + H / cam.s / 2);
      const ci = ccx >= 0 && ccx < W0 && ccy >= 0 && ccy < H0 ? ccy * W0 + ccx : -1;
      const here = ci >= 0 ? chapters[chLab[ci]] : undefined;
      const land = ci >= 0 && jurLab[ci] >= 0 ? jurs[jurLab[ci]] : undefined;
      hud.textContent =
        here && cam.s > 3
          ? `${here.jur}  ·  ${here.title}  ·  ${here.label}  ·  ${here.count.toLocaleString()} provisions${here.encoded ? ` · ${here.encoded.toLocaleString()} encoded` : ""}`
          : land && !land.charted && cam.s > 1.2
            ? `${land.label} — not yet charted`
            : `pan & zoom — every provision is here`;
    };

    const smooth = (t: number) => t * t * (3 - 2 * t);
    const bandT = () => (L - Math.log(PA())) / (Math.log(PB()) - Math.log(PA()));

    const renderNow = () => {
      const r = reg();
      if (r === 0) {
        drawGlobe();
      } else if (r === 1) {
        const t = bandT();
        const e = smooth(t);
        let dLon = band.t[0] - band.f[0];
        while (dLon > Math.PI) dLon -= Math.PI * 2;
        while (dLon < -Math.PI) dLon += Math.PI * 2;
        lon0 = band.f[0] + dLon * e;
        lat0 = band.f[1] + (band.t[1] - band.f[1]) * e;
        drawMorph(t, P());
      } else {
        cam.s = (P() * 2 * Math.PI) / W0;
        draw();
      }
      if (toggleBtn) {
        const want = r === 2 ? "🌐 globe" : "🗺 flat chart";
        if (toggleBtn.textContent !== want) toggleBtn.textContent = want;
      }
    };

    // ── the single loop: damp L, keep everything continuous ──
    let raf = 0;
    let flightRaf = 0;
    let flightOn = false;
    const loop = () => {
      if (!flightOn) {
        const dL = LT - L;
        if (Math.abs(dL) > 0.0006) {
          const Lold = L;
          L += dL * 0.16;
          crossings(Lold, L);
          applyZoomStep(Lold, L);
          renderNow();
        } else if (reg() === 0 && spin && !drag) {
          lon0 += 0.0011;
          renderNow();
        }
      }
      raf = requestAnimationFrame(loop);
    };

    // ── input ──
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      if (flightOn) stopFlight();
      spin = false;
      anchor = { mx: e.offsetX, my: e.offsetY };
      LT = Math.max(Math.log(PMIN()), Math.min(Math.log(PMAX()), LT - e.deltaY * 0.0016));
    };
    let drag: { mx: number; my: number; cx: number; cy: number; lon: number; lat: number } | null = null;
    const down = (e: PointerEvent) => {
      if (flightOn) stopFlight();
      spin = false;
      drag = { mx: e.offsetX, my: e.offsetY, cx: cam.x, cy: cam.y, lon: lon0, lat: lat0 };
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const r = reg();
      if (r === 0) {
        const R = P();
        lon0 = drag.lon - (e.offsetX - drag.mx) / R;
        lat0 = Math.max(-1.25, Math.min(1.25, drag.lat + (e.offsetY - drag.my) / R));
      } else if (r === 1) {
        const R = P();
        const dl = -(e.offsetX - drag.mx) / R;
        const dp = (e.offsetY - drag.my) / R;
        band.f = [drag.lon + dl, Math.max(-1.25, Math.min(1.25, drag.lat + dp))];
        band.t = band.f;
      } else {
        cam.x = drag.cx - (e.offsetX - drag.mx) / cam.s;
        cam.y = drag.cy - (e.offsetY - drag.my) / cam.s;
      }
      renderNow();
    };
    const up = () => (drag = null);

    // ── flights: timelines that drive the SAME state ──
    const stopFlight = () => {
      cancelAnimationFrame(flightRaf);
      flightOn = false;
      LT = L;
    };
    const animateState = (
      to: { lon?: number; lat?: number; L?: number },
      ms: number,
      done?: () => void,
    ) => {
      cancelAnimationFrame(flightRaf);
      flightOn = true;
      spin = false;
      anchor = null;
      const f = { lon: lon0, lat: lat0, L };
      let dLon = 0;
      if (to.lon !== undefined) {
        dLon = to.lon - f.lon;
        while (dLon > Math.PI) dLon -= Math.PI * 2;
        while (dLon < -Math.PI) dLon += Math.PI * 2;
      }
      const t0 = performance.now();
      const step = (now: number) => {
        const u = Math.min(1, (now - t0) / ms);
        const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
        if (to.lon !== undefined) {
          lon0 = f.lon + dLon * e;
          band.f = [lon0, lat0];
          band.t = band.f;
        }
        if (to.lat !== undefined) {
          lat0 = f.lat + (to.lat - f.lat) * e;
          band.f = [lon0, lat0];
          band.t = band.f;
        }
        if (to.L !== undefined) {
          const Lold = L;
          L = f.L + (to.L - f.L) * e;
          LT = L;
          crossings(Lold, L);
        }
        renderNow();
        if (u < 1) flightRaf = requestAnimationFrame(step);
        else {
          flightOn = false;
          done?.();
        }
      };
      flightRaf = requestAnimationFrame(step);
    };
    const flyCam = (t: Cam, ms: number, done?: () => void) => {
      cancelAnimationFrame(flightRaf);
      flightOn = true;
      const from = { ...cam };
      const t0 = performance.now();
      const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const step = (now: number) => {
        const tt = Math.min(1, (now - t0) / ms);
        const p = ease(tt);
        const ls = Math.exp(Math.log(from.s) + (Math.log(t.s) - Math.log(from.s)) * p);
        const fcx = from.x + W / from.s / 2;
        const fcy = from.y + H / from.s / 2;
        const tcx = t.x + W / t.s / 2;
        const tcy = t.y + H / t.s / 2;
        cam = { s: ls, x: fcx + (tcx - fcx) * p - W / ls / 2, y: fcy + (tcy - fcy) * p - H / ls / 2 };
        L = LT = Math.log((cam.s * W0) / (2 * Math.PI));
        draw();
        if (tt < 1) flightRaf = requestAnimationFrame(step);
        else {
          flightOn = false;
          done?.();
        }
      };
      flightRaf = requestAnimationFrame(step);
    };
    // the landed card floating up out of the grid before the film takes over
    let lift = 0;
    let liftCell = -1;
    let liftRaf = 0;
    const animateLift = (to: number, ms: number, done?: () => void) => {
      cancelAnimationFrame(liftRaf);
      const from = lift;
      const t0 = performance.now();
      const step = (now: number) => {
        const u = Math.min(1, (now - t0) / ms);
        const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
        lift = from + (to - from) * e;
        renderNow();
        if (u < 1) liftRaf = requestAnimationFrame(step);
        else done?.();
      };
      liftRaf = requestAnimationFrame(step);
    };
    const flySnapFlat = (done?: () => void) => {
      const cells = cellsOf(snap, snapIdx);
      const i = Math.min(6, cells.length - 1); // § 2017 — Value of allotment
      const gx = (cells[i] % W0) + 0.5;
      const gy = ((cells[i] / W0) | 0) + 0.5;
      if (autopilot) {
        liftCell = cells[i];
        // land where the film's statute page stands: centre at ~(28%, 36%)
        // of the canvas, card scaled to the page's height
        const sT = Math.min((PMAX() * 2 * Math.PI) / W0, mm() * 0.41);
        flyCam({ s: sT, x: gx - (W * 0.2714) / sT, y: gy - (H * 0.3947) / sT }, 4200, done);
        return;
      }
      const sT = Math.min((PMAX() * 2 * Math.PI) / W0, mm() * 0.62);
      flyCam({ s: sT, x: gx - W / sT / 2, y: gy - H / sT / 2 }, 4000, done);
    };
    const flySnap = (done?: () => void) => {
      if (flightOn) return;
      const cells = cellsOf(snap, snapIdx);
      const c = cells[Math.min(6, cells.length - 1)];
      const lon = ((c % W0) / W0) * Math.PI * 2 - Math.PI;
      const lat = (0.5 - ((c / W0) | 0) / H0) * Math.PI;
      if (reg() === 0) {
        animateState({ lon, lat, L: Math.log(PA() * 0.92) }, 2400, () =>
          animateState({ L: Math.log(PB() * 1.06) }, 1400, () => flySnapFlat(done)),
        );
        return;
      }
      flySnapFlat(done);
    };
    const flyToggle = () => {
      if (flightOn) return;
      if (reg() === 2) animateState({ L: Math.log(PA() * 0.8) }, 1800);
      else animateState({ L: Math.log(PB() * 1.15) }, 1600);
    };

    const toggleBtn = resetBtn.current;
    if (toggleBtn) toggleBtn.textContent = "🗺 flat chart";

    if (pose === "landed") {
      // start already landed on the § 2017 card — for stepping through
      spin = false;
      const cells = cellsOf(snap, snapIdx);
      const i2 = Math.min(6, cells.length - 1);
      const gx = (cells[i2] % W0) + 0.5;
      const gy = ((cells[i2] / W0) | 0) + 0.5;
      const sT = Math.min((PMAX() * 2 * Math.PI) / W0, mm() * 0.62);
      cam = { s: sT, x: gx - W / sT / 2, y: gy - H / sT / 2 };
      L = LT = Math.log((sT * W0) / (2 * Math.PI));
    }
    let demoTimer = 0;
    if (finale) {
      L = LT = Math.log(mm() * 0.2);
      animateState({ L: Math.log(mm() * 0.3) }, 1700, () => {
        spin = true;
      });
      demoTimer = window.setTimeout(() => onArrived?.(), 9000);
    } else if (!autopilot) {
      canvas.addEventListener("wheel", wheel, { passive: false });
      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up);
    } else {
      // the demo: a moment of the turning world, then the dive; on landing
      // the card floats up out of the grid, the film fades in at the peak,
      // and the card settles back down into the encoder slide
      demoTimer = window.setTimeout(() => {
        flySnap(() => {
          window.setTimeout(() => {
            animateLift(1, 550, () => {
              onArrived?.();
              window.setTimeout(() => animateLift(0, 900), 250);
            });
          }, 450);
        });
      }, 1900);
    }
    const ro = new ResizeObserver(() => {
      resize();
      renderNow();
    });
    ro.observe(canvas);
    flyBtn.current?.addEventListener("click", () => flySnap());
    resetBtn.current?.addEventListener("click", flyToggle);
    renderNow();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(flightRaf);
      cancelAnimationFrame(liftRaf);
      window.clearTimeout(demoTimer);
      canvas.removeEventListener("wheel", wheel);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="cmap">
      <div className="cmap__bar" style={autopilot || finale ? { display: "none" } : undefined}>
        <span className="cmap__hud" ref={hudRef} />
        <span className="cmap__actions">
          <button type="button" className="cmap__btn" ref={flyBtn}>✈ fly to § 2017</button>
          <button type="button" className="cmap__btn" ref={resetBtn}>🗺 flat chart</button>
        </span>
      </div>
      <canvas
        className="cmap__canvas"
        ref={canvasRef}
        role="img"
        aria-label="The world of the law: a spinning globe with every country on Earth in its real shape and place, from Natural Earth data. The charted jurisdictions — United States, United Kingdom, Canada, Belgium — carry the corpus, with encoded provisions glowing green; the rest of the world is parchment, not yet charted. Zoom in and the globe lands, flattening into a chart where the charted countries hold title and chapter parcels, all the way down to the text of 7 U.S.C. § 2017, Value of allotment."
      />
    </div>
  );
}
