import type { Layout, RepoSpec } from "../architecture";
import { AxiomGlyph } from "./AxiomGlyph";

export function SceneSwitcher({
  layouts,
  activeId,
  onChange,
  repos,
  launchTabId,
  open = false,
  onClose,
}: {
  layouts: Layout[];
  activeId: string;
  onChange: (id: string) => void;
  repos: RepoSpec[];
  launchTabId: string;
  open?: boolean;
  onClose?: () => void;
}) {
  const launchActive = activeId === launchTabId;
  // repos prop is kept for future re-introduction of a per-repo view; we no
  // longer surface the full list in the sidebar because each card already
  // carries its repo on the eyebrow.
  void repos;

  return (
    <nav className={`scene-switcher ${open ? "scene-switcher--open" : ""}`}>
      <div className="scene-switcher__wordmark">
        <AxiomGlyph className="glyph-axiom" />
        <span className="scene-switcher__wordmark-text">Architecture</span>
        <button
          type="button"
          className="scene-switcher__close"
          aria-label="Close menu"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <ul className="scene-switcher__scenes">
        {layouts.map((layout) => {
          const active = layout.id === activeId;
          return (
            <li key={layout.id}>
              <button
                className={`scene-switcher__btn ${
                  active ? "scene-switcher__btn--active" : ""
                }`}
                onClick={() => onChange(layout.id)}
              >
                <span className="scene-switcher__btn-eyebrow">{layout.eyebrow}</span>
                <span className="scene-switcher__btn-title">{layout.title}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="scene-switcher__footer">
        <ul className="scene-switcher__edges">
          <li>
            <span className="edge-swatch edge-swatch--solid" />
            <span>data flow</span>
          </li>
          <li>
            <span className="edge-swatch edge-swatch--derived" />
            <span>derived</span>
          </li>
          <li>
            <span className="edge-swatch edge-swatch--read" />
            <span>read</span>
          </li>
        </ul>

        <div className="scene-switcher__hidden-links">
          <button
            type="button"
            className={`scene-switcher__notes-link ${
              launchActive ? "scene-switcher__notes-link--active" : ""
            }`}
            onClick={() => onChange(launchTabId)}
            title="External one-pager — the five-stage story for the launch"
          >
            <AxiomGlyph className="scene-switcher__notes-glyph" />
            <span>Launch graphic</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
