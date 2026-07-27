import { JourneyDemo } from "./JourneyDemo";
import { AxiomGlyph } from "./AxiomGlyph";

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
            the graph. Then the camera backs out until the whole live
            registry is in frame — and the cycle begins again.
          </p>
        </header>

        <JourneyDemo />

        <footer className="launch__footline">
          <span>
            4 countries · 50 states + DC · 1.7M+ provisions · 3,000+ encoded
            rules
          </span>
          <span className="launch__footbrand">
            <AxiomGlyph className="glyph-axiom" /> axiom-foundation.org
          </span>
        </footer>
      </div>
    </div>
  );
}
