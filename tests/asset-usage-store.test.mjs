import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

class MemoryStorage {
  constructor(entries = {}) {
    this.values = new Map(Object.entries(entries));
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  keys() {
    return [...this.values.keys()];
  }
}

async function loadUsageStore(entries = {}) {
  const source = await readFile(new URL("../app/lorecue_asset_usage_store.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const localStorage = new MemoryStorage(entries);
  const runtimeModule = { exports: {} };
  const context = vm.createContext({
    Date,
    Error,
    JSON,
    Map,
    Math,
    Object,
    String,
    console,
    exports: runtimeModule.exports,
    module: runtimeModule,
    window: { localStorage },
  });
  vm.runInContext(compiled, context, { filename: "lorecue_asset_usage_store.js" });
  return { store: runtimeModule.exports, localStorage };
}

test("asset bindings stay isolated by project, surface, and record", async () => {
  const { store } = await loadUsageStore();
  store.saveAssetBinding("project-a", {
    surface: "map-node",
    surfaceId: "harbor",
    assetId: "asset-map-a",
    assetTitle: "萨菲港总览",
    visibility: "全体可见",
  });
  store.saveAssetBinding("project-a", {
    surface: "encounter",
    surfaceId: "warehouse",
    assetId: "asset-map-b",
    assetTitle: "走私仓库",
    visibility: "主持人私有",
  });

  const projectA = store.readAssetUsageEnvelope("project-a");
  assert.equal(projectA.bindings.length, 2);
  assert.equal(projectA.bindings.find((binding) => binding.surface === "map-node").assetId, "asset-map-a");
  assert.equal(store.readAssetUsageEnvelope("project-b"), null);
});

test("revoking a delivery retains its source and disclosure history", async () => {
  const { store } = await loadUsageStore();
  const delivered = store.addAssetDelivery("project-a", {
    surface: "player-attachment",
    surfaceId: "duty-roster",
    assetId: "asset-roster",
    assetTitle: "值班名册原件",
    playerTitle: "值班名册残页",
    recipient: "全体玩家",
    sessionLabel: "第 02 次团",
    version: "玩家版本 v1",
  });
  const deliveryId = delivered.deliveries[0].id;
  const revoked = store.revokeAssetDelivery("project-a", deliveryId);

  assert.equal(revoked.deliveries.length, 1);
  assert.equal(revoked.deliveries[0].status, "revoked");
  assert.equal(revoked.deliveries[0].assetId, "asset-roster");
  assert.equal(revoked.deliveries[0].recipient, "全体玩家");
  assert.ok(revoked.deliveries[0].revokedAt);
});

test("unreadable usage data is quarantined before a clean envelope is written", async () => {
  const key = "lorecue-asset-usage:project-a";
  const { store, localStorage } = await loadUsageStore({ [key]: "{broken" });
  const usage = store.ensureAssetUsageEnvelope("project-a");

  assert.equal(usage.bindings.length, 0);
  assert.equal(usage.deliveries.length, 0);
  assert.ok(localStorage.keys().some((candidate) => candidate.startsWith(`${key}:quarantine:`)));
});
