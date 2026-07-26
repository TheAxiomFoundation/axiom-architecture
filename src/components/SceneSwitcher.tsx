import type { Layout, RepoSpec } from "../architecture";

export function SceneSwitcher({
  layouts,
  activeId,
  onChange,
  repos,
  open = false,
  onClose,
}: {
  layouts: Layout[];
  activeId: string;
  onChange: (id: string) => void;
  repos: RepoSpec[];
  open?: boolean;
  onClose?: () => void;
}) {
  // repos prop is kept for future re-introduction of a per-repo view; we no
  // longer surface the full list in the sidebar because each card already
  // carries its repo on the eyebrow.
  void repos;

  return (
    <nav className={`scene-switcher ${open ? "scene-switcher--open" : ""}`}>
      <div className="scene-switcher__brand">
        <div className="scene-switcher__brand-row">
          <a
            className="scene-switcher__logo-link"
            href="https://axiom-foundation.org"
            aria-label="Axiom Foundation"
          >
            <img
              className="scene-switcher__logo"
              src={`${import.meta.env.BASE_URL}axiom-foundation.svg`}
              alt="Axiom Foundation"
            />
          </a>
          <button
            type="button"
            className="scene-switcher__close"
            aria-label="Close menu"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <a className="scene-switcher__title-block" href={import.meta.env.BASE_URL}>
          <span className="scene-switcher__title-eyebrow">Interactive</span>
          <span className="scene-switcher__title-name">Architecture</span>
        </a>
        <a className="scene-switcher__all-demos" href="https://axiom.org/demos">
          All demos
        </a>
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

      </div>
    </nav>
  );
}
