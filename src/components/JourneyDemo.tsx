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
// ⏸ freezes the demo exactly where it is — every svg clock pauses in
// place — and ▶ resumes from that same frame. The arrow keys drop into
// manual mode instead: step through the tableaux one at a time; play
// from there rejoins the automation at that step. ⛶ runs the whole
// thing full screen.

const CYCLE = 56;
const FILM_START = 0.207 * CYCLE; // the statute page, settled
// the wide graph has settled, ledger stamped — end just before the
// constellation's own fade-out ramp (~0.852) begins
const FILM_END = 0.848 * CYCLE;

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
  // frozen = auto mode with every svg clock paused in place (⏸)
  const [frozen, setFrozen] = useState(false);
  const frozenRef = useRef(false);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  // keeps the film overlay mounted (and fading) while the stacks restart
  const filmKey = useRef(0);

  const setClocksPaused = useCallback((p: boolean) => {
    rootRef.current?.querySelectorAll("svg").forEach((s) => {
      if (p) s.pauseAnimations();
      else s.unpauseAnimations();
    });
  }, []);

  const toFilm = useCallback(() => {
    filmKey.current += 1;
    setOffset(null);
    setPhase("film");
  }, []);
  // the library only hands off to the film when the film isn't already
  // running — after ▶ resumes at a film step, the restarted pull beneath
  // must not yank the playing film back to its start
  const arrived = useCallback(() => {
    if (phaseRef.current === "map") toFilm();
  }, [toFilm]);
  // the wide shot has settled: the next cycle's stacks start beneath the
  // film while it fades out
  const endOutro = useCallback(() => {
    window.setTimeout(() => {
      if (frozenRef.current) return; // ▶ re-arms this on resume
      setPhase((p) => (p === "outro" ? "map" : p));
    }, 1450);
  }, []);
  const toOutro = useCallback(() => {
    setCycle((c) => c + 1);
    setPhase("outro");
    endOutro();
  }, [endOutro]);
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

  // ⏸ freezes the running demo exactly where it is: every svg clock
  // pauses in place, nothing remounts. (The library's arrival poll and
  // the film's end-watcher both read those clocks, so no handoff can
  // fire while frozen.)
  const pause = useCallback(() => {
    frozenRef.current = true;
    setFrozen(true);
    setClocksPaused(true);
  }, [setClocksPaused]);

  const play = useCallback(() => {
    if (mode === "auto") {
      // ▶ after ⏸: resume the same frame
      frozenRef.current = false;
      setFrozen(false);
      setClocksPaused(false);
      if (phaseRef.current === "outro") endOutro(); // finish the deferred fade
      return;
    }
    // ▶ after stepping with the arrows: rejoin the automation here
    const s = STEPS[step];
    setMode("auto");
    if (s.kind === "film") {
      filmKey.current += 1;
      setPhase("film"); // resumes from `offset` (or the step's time)
      if (offset === null) setOffset(s.t! * CYCLE);
    } else {
      toMap(); // stacks / landed: restart the cycle from the top
    }
  }, [mode, step, offset, toMap, setClocksPaused, endOutro]);

  const jump = useCallback(
    (dir: 1 | -1) => {
      const i = Math.min(STEPS.length - 1, Math.max(0, currentStep() + dir));
      frozenRef.current = false;
      setFrozen(false); // manual mode unmounts the frozen layers
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

  const paused = frozen || mode === "manual";

  // keyboard: ← → step · space pauses/plays · f full screen
  const keys = useRef({ pause, play, jump, fullscreen, paused });
  keys.current = { pause, play, jump, fullscreen, paused };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable) return;
      const k = keys.current;
      if (e.key === "ArrowRight") k.jump(1);
      else if (e.key === "ArrowLeft") k.jump(-1);
      else if (e.key === " ") (k.paused ? k.play : k.pause)();
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
    <div className={`jdemo${frozen ? " jdemo--frozen" : ""}`} ref={rootRef}>
      {!manual && (
        <div className="jdemo__stage">
          <div key={`lib-${cycle}`} className="jdemo__layer">
            <CorpusLibrary autopilot onArrived={arrived} />
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
          onClick={paused ? play : pause}
          aria-label={paused ? "play" : "pause"}
        >
          {paused ? "▶" : "⏸"}
        </button>
        <button type="button" onClick={() => jump(1)} aria-label="next step">›</button>
        <span className="jdemo__ctrl-label">
          {manual
            ? `step · ${s.label}`
            : frozen
              ? `paused · ${AUTO_LABEL[phase]}`
              : `auto · ${AUTO_LABEL[phase]}`}
        </span>
        <button type="button" className="jdemo__ctrl-fs" onClick={fullscreen} aria-label="full screen">
          ⛶
        </button>
      </div>
    </div>
  );
}
