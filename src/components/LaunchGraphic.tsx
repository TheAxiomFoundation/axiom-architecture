import { JourneyDemo } from "./JourneyDemo";
import { AxiomGlyph } from "./AxiomGlyph";
import { CoreCheckpoint } from "./CoreCheckpoint";
import { registrySummary, SNAPSHOT_DATE } from "./registry-snapshot";

// The launch poster: the journey demo under the launch header. The
// earlier flat-strip and sankey-chart views of this page are retired —
// the journey (stacks → film → registry) is the launch graphic.

export function LaunchGraphic() {
  return (
    <div className="launch">
      <div className="launch__poster">
        <header className="launch__header">
          <div className="launch__eyebrow">The Axiom Foundation</div>
          <h1 className="launch__headline">
            From published law to a rule you can <em>trust.</em>
          </h1>
          <p className="launch__sub">
            The whole demo in one cycle: one volume comes off the shelf —
            7 U.S.C. § 2017 — the section is encoded and gated, and joins
            the graph. Then the camera backs out until the recorded
            registry is in frame — and the cycle begins again.
          </p>
          <CoreCheckpoint />
        </header>

        <JourneyDemo />

        <footer className="launch__footline">
          <span>
            {SNAPSHOT_DATE} registry snapshot · {registrySummary()}
          </span>
          <span className="launch__footbrand">
            <AxiomGlyph className="glyph-axiom" /> axiom.org
          </span>
        </footer>
      </div>
    </div>
  );
}
