import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

// Use Vite's actual TSX transform without introducing a second test runtime.
const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
after(() => vite.close());
const snapshot = await vite.ssrLoadModule("/src/components/registry-snapshot.ts");
const { JourneyFilm } = await vite.ssrLoadModule("/src/components/JourneyFilm.tsx");
const { CoreCheckpoint } = await vite.ssrLoadModule("/src/components/CoreCheckpoint.tsx");

test("film caption and accessible description follow the actual package snapshot", () => {
  const render = () => renderToStaticMarkup(createElement(JourneyFilm, { paused: true }));
  const summary = snapshot.registrySummary();
  assert.equal(summary, "16 compiled programs, 3,826 package outputs");
  const markup = render();
  assert.ok(markup.includes(`registry snapshot — ${summary}</text>`));
  assert.match(markup, /aria-label="[^"]*16 compiled programs, 3,826 package outputs/);
  assert.ok(markup.includes(`${snapshot.SNAPSHOT_DATE} registry snapshot`));
  assert.ok(!markup.includes("3,323"));
  assert.ok(!markup.includes("certified rules"));
  assert.ok(markup.includes("Package outputs can include shared rules more than once"));

  // Refreshing one package must move BOTH reader-facing count surfaces.
  const cluster = snapshot.CLUSTERS[0];
  const previous = cluster.count;
  try {
    cluster.count += 107;
    const refreshed = render();
    assert.ok(refreshed.includes("registry snapshot — 16 compiled programs, 3,933 package outputs</text>"));
    assert.match(refreshed, /aria-label="[^"]*16 compiled programs, 3,933 package outputs/);
    assert.ok(!refreshed.includes(summary));
  } finally {
    cluster.count = previous;
  }
});

test("only package clusters determine totals, including shared output entries", () => {
  assert.equal(snapshot.registrySummary([{ count: 3 }, { count: 3 }]),
    "2 compiled programs, 6 package outputs");
  assert.equal(snapshot.registrySummary([]), "0 compiled programs, 0 package outputs");
});

test("core links describe development and point to the canonical docs and public repository", () => {
  const markup = renderToStaticMarkup(createElement(CoreCheckpoint));
  assert.ok(markup.includes("Axiom Core is a development checkpoint."));
  assert.ok(markup.includes('href="https://axiom.org/docs/#core-execution"'));
  assert.ok(markup.includes('href="https://github.com/TheAxiomFoundation/axiom-core"'));
});
