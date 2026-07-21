import { useCallback, useEffect, useRef, useState } from "react";
import { CorpusMap } from "./CorpusMap";
import { JourneyFilm } from "./JourneyFilm";

// The full demo cycle, tied together:
//
//   THE GLOBE     the real Earth turns; the camera dives through the
//                 unroll into the United States, T7 Agriculture, ch. 51,
//                 and lands on the § 2017 card — real geography, the
//                 map engine flying itself.
//   THE FILM      picks up at the statute page: segmentation, the
//                 encoding workbench, the four gates, the graph, the
//                 certified program, and every surface the answer
//                 reaches.
//   THE LIT WORLD the globe returns with every jurisdiction stippled
//                 green, feeding the tools row — then the cycle begins
//                 again.
//
// Pause (or the arrow keys) drops into manual mode: step through the
// tableaux one at a time; play resumes the automation from wherever
// you are. ⛶ runs the whole thing full screen.

const CYCLE = 56;
const FILM_START = 0.207 * CYCLE; // the statute page, settled
const FILM_END = 0.752 * CYCLE; // the program starts shrinking back into the world

type Step = { label: string; kind: "globe" | "landed" | "film" | "finale"; t?: number };
const STEPS: Step[] = [
  { label: "the globe", kind: "globe" },
  { label: "landed · § 2017", kind: "landed" },
  { label: "the wall", kind: "film", t: 0.09 },
  { label: "the encoding", kind: "film", t: 0.37 },
  { label: "the gates, passed", kind: "film", t: 0.44 },
  { label: "the graph", kind: "film", t: 0.56 },
  { label: "the program", kind: "film", t: 0.66 },
  { label: "the lit world", kind: "finale" },
];
const AUTO_LABEL = {
  map: "the dive",
  film: "the film",
  outro: "the pull-back",
  finale: "the lit world",
} as const;

export function JourneyDemo() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [phase, setPhase] = useState<"map" | "film" | "outro" | "finale">("map");
  const [step, setStep] = useState(0);
  // exact film time to freeze/resume at (null → the step's canonical time)
  const [offset, setOffset] = useState<number | null>(null);
  const [cycle, setCycle] = useState(0);

  const toFilm = useCallback(() => {
    setOffset(null);
    setPhase("film");
  }, []);
  // the sealed program shrinks into the rising world: film fades out over
  // the finale layer, then hands over entirely
  const toOutro = useCallback(() => {
    setPhase("outro");
    window.setTimeout(() => setPhase("finale"), 1500);
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
    if (phase === "map") return 0;
    if (phase === "finale" || phase === "outro") return STEPS.length - 1;
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
      setPhase("film"); // resumes from `offset` (or the step's time)
      if (offset === null) setOffset(s.t! * CYCLE);
    } else if (s.kind === "finale") {
      setPhase("finale");
    } else {
      toMap(); // globe / landed: restart the cycle from the top
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
        <div key={cycle} className="jdemo__stage">
          {(phase === "map" || phase === "film") && (
            <div className="jdemo__layer">
              <CorpusMap autopilot onArrived={toFilm} />
            </div>
          )}
          {(phase === "outro" || phase === "finale") && (
            <div className="jdemo__layer">
              <CorpusMap finale onArrived={toMap} />
            </div>
          )}
          {(phase === "film" || phase === "outro") && (
            <div className={phase === "outro" ? "jdemo__over jdemo__over--out" : "jdemo__over"}>
              <JourneyFilm startOffset={offset ?? FILM_START} endAt={FILM_END} onCycleEnd={toOutro} />
            </div>
          )}
        </div>
      )}
      {manual && (
        <div key={`step-${step}`} className="jdemo__layer">
          {s.kind === "globe" && <CorpusMap />}
          {s.kind === "landed" && <CorpusMap pose="landed" />}
          {s.kind === "film" && <JourneyFilm startOffset={offset ?? s.t! * CYCLE} paused />}
          {s.kind === "finale" && <CorpusMap finale />}
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
