import type { Layout, RepoSpec } from "../architecture";
import type { DetailMode } from "../App";

export function SceneSwitcher({
  layouts,
  activeId,
  onChange,
  repos,
  detailMode,
  onDetailModeChange,
  notesTabId,
  playbookTabId,
  specsTabId,
  open = false,
  onClose,
}: {
  layouts: Layout[];
  activeId: string;
  onChange: (id: string) => void;
  repos: RepoSpec[];
  detailMode: DetailMode;
  onDetailModeChange: (mode: DetailMode) => void;
  notesTabId: string;
  playbookTabId: string;
  specsTabId: string;
  open?: boolean;
  onClose?: () => void;
}) {
  const notesActive = activeId === notesTabId;
  const playbookActive = activeId === playbookTabId;
  const specsActive = activeId === specsTabId;
  // repos prop is kept for future re-introduction of a per-repo view; we no
  // longer surface the full list in the sidebar because each card already
  // carries its repo on the eyebrow.
  void repos;

  return (
    <nav className={`scene-switcher ${open ? "scene-switcher--open" : ""}`}>
      <div className="scene-switcher__wordmark">
        <span className="glyph-axiom">∀</span>
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
        <div className="scene-switcher__row">
          <span className="scene-switcher__row-label">Detail</span>
          <div
            className="scene-switcher__pill"
            role="group"
            aria-label="Detail level"
          >
            <button
              type="button"
              className={`scene-switcher__pill-btn ${
                detailMode === "external" ? "scene-switcher__pill-btn--active" : ""
              }`}
              onClick={() => onDetailModeChange("external")}
              title="Public-facing summary — concepts and relationships"
            >
              External
            </button>
            <button
              type="button"
              className={`scene-switcher__pill-btn ${
                detailMode === "internal" ? "scene-switcher__pill-btn--active" : ""
              }`}
              onClick={() => onDetailModeChange("internal")}
              title="Operator depth — mechanics, gotchas, file paths, commands"
            >
              Internal
            </button>
          </div>
        </div>

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
              playbookActive ? "scene-switcher__notes-link--active" : ""
            }`}
            onClick={() => onChange(playbookTabId)}
            title="Operator playbook — how to take a state benefit program end-to-end"
          >
            <span className="scene-switcher__notes-glyph">§</span>
            <span>Encoding playbook</span>
          </button>
          <button
            type="button"
            className={`scene-switcher__notes-link ${
              specsActive ? "scene-switcher__notes-link--active" : ""
            }`}
            onClick={() => onChange(specsTabId)}
            title="Specs & contracts — the durable formats and where their canonical definitions live"
          >
            <span className="scene-switcher__notes-glyph">§</span>
            <span>Specs &amp; contracts</span>
          </button>
          <button
            type="button"
            className={`scene-switcher__notes-link ${
              notesActive ? "scene-switcher__notes-link--active" : ""
            }`}
            onClick={() => onChange(notesTabId)}
            title="Internal architectural review — not part of the main story"
          >
            <span className="scene-switcher__notes-glyph">§</span>
            <span>Open questions</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
