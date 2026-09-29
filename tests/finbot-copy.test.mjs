import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createServer } from "vite";

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
after(() => vite.close());
const { NODES } = await vite.ssrLoadModule("/src/architecture.ts");

// The chatbot is an OpenAI model with tool access to the rules engine, used
// for US benefit and tax estimates (finbot-snap-demo src/lib/model.ts,
// src/lib/tools.ts, artifacts.lock.json). 23 of its 34 headline outputs carry
// no legal id and 18 are flagged incomplete, so the node must not promise
// advice, accuracy, or a citation behind every number.
test("finbot node describes an estimate demo, not advice or certified answers", () => {
  const finbot = NODES.find((n) => n.id === "finbot");
  assert.ok(finbot, "finbot node exists");
  const copy = [finbot.summary, finbot.detail, ...(finbot.important ?? [])].join(" ");
  for (const banned of [
    /advice/i,
    /every (number|answer|value)/i,
    /\b(certified|verified|validated|accurate|official)\b/i,
    /ground truth/i,
  ]) {
    assert.doesNotMatch(copy, banned);
  }
  assert.match(finbot.detail, /OpenAI/);
  assert.match(finbot.detail, /tool access to the rules engine/);
  assert.match(finbot.detail, /for outputs that carry one/);
});
