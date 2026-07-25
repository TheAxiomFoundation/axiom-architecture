import type { EdgeSpec, NodeSpec, Repo } from "../architecture";
import { REPOS } from "../architecture";

const REPO_INFO: Record<Repo, { label: string; description: string }> = Object.fromEntries(
  REPOS.map((r) => [r.id, { label: r.label, description: r.description }]),
) as Record<Repo, { label: string; description: string }>;

const EDGE_KIND_LABEL: Record<EdgeSpec["kind"], string> = {
  solid: "writes",
  derived: "derives",
  read: "reads",
};

export function DetailPanel({
  node,
  incoming,
  outgoing,
  onSelectNode,
  onClose,
}: {
  node: NodeSpec;
  incoming: { node: NodeSpec; edge: EdgeSpec }[];
  outgoing: { node: NodeSpec; edge: EdgeSpec }[];
  onSelectNode: (id: string) => void;
  onClose: () => void;
}) {
  const repo = REPO_INFO[node.repo];

  return (
    <aside className="detail-panel">
      <button className="detail-panel__close" onClick={onClose} aria-label="Close">
        ×
      </button>

      <div className="kicker">
        <span className="kicker-mark">§</span> {repo.label}
      </div>
      <h2 className="detail-panel__h">{node.label.replace(/\n/g, " ")}</h2>
      <p className="detail-panel__summary">{node.summary}</p>

      <Section label="About">
        <p className="detail-panel__body">{node.detail}</p>
      </Section>

      <Section label="Repository">
        <div className="detail-panel__repo">
          <div className="detail-panel__repo-name">{repo.label}</div>
          <div className="detail-panel__repo-desc">{repo.description}</div>
        </div>
      </Section>

      <Section label="Receives from">
        {incoming.length === 0 ? (
          <p className="detail-panel__empty-list">No upstream dependencies.</p>
        ) : (
          <ul className="detail-panel__edges">
            {incoming.map(({ node: src, edge }, i) => (
              <li key={i}>
                <button
                  className={`detail-panel__edge detail-panel__edge--${edge.kind}`}
                  onClick={() => onSelectNode(src.id)}
                >
                  <span className="detail-panel__edge-verb">
                    {EDGE_KIND_LABEL[edge.kind]}
                  </span>
                  <span className="detail-panel__edge-target">{src.label.replace(/\n/g, " ")}</span>
                  {edge.label && (
                    <span className="detail-panel__edge-label">— {edge.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section label="Sends to">
        {outgoing.length === 0 ? (
          <p className="detail-panel__empty-list">Terminal — nothing reads from it.</p>
        ) : (
          <ul className="detail-panel__edges">
            {outgoing.map(({ node: dst, edge }, i) => (
              <li key={i}>
                <button
                  className={`detail-panel__edge detail-panel__edge--${edge.kind}`}
                  onClick={() => onSelectNode(dst.id)}
                >
                  <span className="detail-panel__edge-verb">
                    {EDGE_KIND_LABEL[edge.kind]}
                  </span>
                  <span className="detail-panel__edge-target">{dst.label.replace(/\n/g, " ")}</span>
                  {edge.label && (
                    <span className="detail-panel__edge-label">— {edge.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </aside>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="detail-panel__section">
      <div className="detail-panel__section-label">{label}</div>
      {children}
    </section>
  );
}
