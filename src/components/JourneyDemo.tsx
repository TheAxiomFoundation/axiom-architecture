import { useCallback, useEffect, useRef, useState } from "react";
import { CorpusLibrary } from "./CorpusLibrary";
import { JourneyFilm } from "./JourneyFilm";

// The full demo cycle, tied together:
//
//   THE STACKS    the corpus as a law library: five bays of cloth
//                 spines under lamplight. The camera pushes into the
//                 titles shelf; TITLE 7 · AGRICULTURE pulls off the
//                 shelf, opens, riffles to chapter 51, and settles on
//                 the § 2017 page.
//   THE FILM      picks up at the statute page: segmentation, the
//                 encoding workbench, the four gates, the graph — and
//                 one long pull-back to the whole live registry, card
//                 upon card. The cycle ends on that wide shot, then
//                 the film fades out over the stacks starting again.
//
// Pause (or the arrow keys) drops into manual mode: step through the
// tableaux one at a time; play resumes the automation from wherever
// you are. ⛶ runs the whole thing full screen.

const CYCLE = 56;
const FILM_START = 0.207 * CYCLE; // the statute page, settled
const FILM_END = 0.862 * CYCLE; // the wide graph has settled, ledger stamped

type Step = { label: string; kind: "stacks" | "landed" | "film"; t?: number };
const STEPS: Step[] = [
  { label: "the stacks", kind: "stacks" },
  { label: "the book · § 2017", kind: "landed" },
  { label: "the wall", kind: "film", t: 0.09 },
  { label: "the encoding", kind: "film", t: 0.37 },
  { label: "the gates, passed", kind: "film", t: 0.44 },
  { label: "the graph", kind: "film", t: 0.56 },
  { label: "the graph, whole", kind: "film", t: 0.82 },
];
const AUTO_LABEL = {
  map: "the pull",
  film: "the film",
  outro: "the return",
} as const;

export function JourneyDemo() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  // outro = the film fading out over the next cycle's stacks
  const [phase, setPhase] = useState<"map" | "film" | "outro">("map");
  const [step, setStep] = useState(0);
  // exact film time to freeze/resume at (null → the step's canonical time)
  const [offset, setOffset] = useState<number | null>(null);
  const [cycle, setCycle] = useState(0);
  // keeps the film overlay mounted (and fading) while the stacks restart
  const filmKey = useRef(0);

  const toFilm = useCallback(() => {
    filmKey.current += 1;
    setOffset(null);
    setPhase("film");
  }, []);
  // the wide shot has settled: the next cycle's stacks start beneath the
  // film while it fades out
  const toOutro = useCallback(() => {
    setCycle((c) => c + 1);
    setPhase("outro");
    window.setTimeout(() => {
      setPhase((p) => (p === "outro" ? "map" : p));
    }, 1450);
  }, []);
  const toMap = useCallback(() => {
    setOffset(null);
    setPhase("map");
    setCycle((c) => c + 1); // remount everything fresh for the next pass
  }, []);

  const filmTime = useCallback(() => {
    const svg = rootRef.current?.querySelector("svg.lsk") as SVGSVGElement | null;
    return svg ? svg.getCurrentTime() % CYCLE : FILM_START;
  }, []);

  // which step matches what is on screen right now (for entering manual mode)
  const currentStep = useCallback(() => {
    if (mode === "manual") return step;
    if (phase === "map" || phase === "outro") return 0;
    const f = filmTime() / CYCLE;
    let best = 2;
    STEPS.forEach((st, i) => {
      if (st.kind === "film" && st.t! <= f + 0.01) best = i;
    });
    return best;
  }, [mode, phase, step, filmTime]);

  const pause = useCallback(() => {
    const i = currentStep();
    if (phase === "film" && mode === "auto") {
      setOffset(filmTime()); // freeze this exact frame
    } else {
      setOffset(null);
    }
    setStep(i);
    setMode("manual");
  }, [currentStep, phase, mode, filmTime]);

  const play = useCallback(() => {
    const s = STEPS[step];
    setMode("auto");
    if (s.kind === "film") {
      filmKey.current += 1;
      setPhase("film"); // resumes from `offset` (or the step's time)
      if (offset === null) setOffset(s.t! * CYCLE);
    } else {
      toMap(); // stacks / landed: restart the cycle from the top
    }
  }, [step, offset, toMap]);

  const jump = useCallback(
    (dir: 1 | -1) => {
      const i = Math.min(STEPS.length - 1, Math.max(0, currentStep() + dir));
      setOffset(null);
      setStep(i);
      setMode("manual");
    },
    [currentStep],
  );

  const fullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void rootRef.current?.requestFullscreen();
  }, []);

  // keyboard: ← → step · space pauses/plays · f full screen
  const keys = useRef({ pause, play, jump, fullscreen, mode });
  keys.current = { pause, play, jump, fullscreen, mode };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable) return;
      const k = keys.current;
      if (e.key === "ArrowRight") k.jump(1);
      else if (e.key === "ArrowLeft") k.jump(-1);
      else if (e.key === " ") (k.mode === "auto" ? k.pause : k.play)();
      else if (e.key === "f") k.fullscreen();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const manual = mode === "manual";
  const s = STEPS[step];

  return (
    <div className="jdemo" ref={rootRef}>
      {!manual && (
        <div className="jdemo__stage">
          <div key={`lib-${cycle}`} className="jdemo__layer">
            <CorpusLibrary autopilot onArrived={toFilm} />
          </div>
          {(phase === "film" || phase === "outro") && (
            <div
              key={`film-${filmKey.current}`}
              className={phase === "outro" ? "jdemo__over jdemo__over--out" : "jdemo__over"}
            >
              <JourneyFilm startOffset={offset ?? FILM_START} endAt={FILM_END} onCycleEnd={toOutro} />
            </div>
          )}
        </div>
      )}
      {manual && (
        <div key={`step-${step}`} className="jdemo__layer">
          {s.kind === "stacks" && <CorpusLibrary />}
          {s.kind === "landed" && <CorpusLibrary pose="landed" />}
          {s.kind === "film" && <JourneyFilm startOffset={offset ?? s.t! * CYCLE} paused />}
        </div>
      )}
      <div className="jdemo__ctrl">
        <button type="button" onClick={() => jump(-1)} aria-label="previous step">‹</button>
        <button
          type="button"
          onClick={manual ? play : pause}
          aria-label={manual ? "play" : "pause"}
        >
          {manual ? "▶" : "⏸"}
        </button>
        <button type="button" onClick={() => jump(1)} aria-label="next step">›</button>
        <span className="jdemo__ctrl-label">
          {manual ? `step · ${s.label}` : `auto · ${AUTO_LABEL[phase]}`}
        </span>
        <button type="button" className="jdemo__ctrl-fs" onClick={fullscreen} aria-label="full screen">
          ⛶
        </button>
      </div>
    </div>
  );
}
