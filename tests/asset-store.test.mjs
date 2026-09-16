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

async function loadAssetStore(entries = {}) {
  const source = await readFile(new URL("../app/lorecue_asset_store.ts", import.meta.url), "utf8");
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
    Object,
    Promise,
    Set,
    String,
    console,
    exports: runtimeModule.exports,
    module: runtimeModule,
    window: { localStorage },
  });
  vm.runInContext(compiled, context, { filename: "lorecue_asset_store.js" });
  return { store: runtimeModule.exports, localStorage };
}

const defaultAsset = {
  id: "asset-map",
  kind: "地图",
  title: "萨菲港地图",
  description: "PNG · 2.4 MB",
  ownerType: "创作项目",
  ownerId: "saffi-module",
  ownerLabel: "萨菲港旧案",
  visibility: "主持人私有",
  spoilerNote: "包含密道",
  provenance: "作者自制",
  importedAt: "2026-07-20T12:00:00.000Z",
  updatedAt: "2026-07-20T12:00:00.000Z",
  hasBinary: false,
  links: [],
};

test("asset catalog preserves imported metadata across reloads without duplicating defaults", async () => {
  const { store, localStorage } = await loadAssetStore();
  const initial = store.ensureAssetCatalog([defaultAsset]);
  assert.equal(initial.length, 1);

  const imported = {
    ...defaultAsset,
    id: "asset-bgm",
    kind: "BGM",
    title: "码头暗潮",
    hasBinary: true,
    originalName: "undertow.ogg",
    mimeType: "audio/ogg",
    sizeBytes: 2048,
  };
  store.upsertAssetRecord(initial, imported);
  const restored = store.ensureAssetCatalog([defaultAsset]);
  assert.equal(restored.length, 2);
  assert.equal(restored[0].originalName, "undertow.ogg");

  const catalog = JSON.parse(localStorage.getItem("lorecue-asset-catalog"));
  assert.equal(catalog.format, "lorecue-asset-catalog");
  assert.equal(catalog.version, 1);
});

test("asset references are isolated by creative project and campaign target", async () => {
  const { store } = await loadAssetStore();
  let assets = store.ensureAssetCatalog([defaultAsset]);
  assets = store.setAssetTargetLink(assets, "asset-map", {
    targetType: "creative",
    targetId: "saffi-module",
    targetLabel: "萨菲港旧案",
  }, true);
  assets = store.setAssetTargetLink(assets, "asset-map", {
    targetType: "campaign",
    targetId: "saffi-old-friends",
    targetLabel: "萨菲港旧案 · 老友组",
  }, true);
  assert.equal(assets[0].links.length, 2);

  assets = store.setAssetTargetLink(assets, "asset-map", {
    targetType: "creative",
    targetId: "saffi-module",
    targetLabel: "萨菲港旧案",
  }, false);
  assert.equal(assets[0].links.length, 1);
  assert.equal(assets[0].links[0].targetType, "campaign");
});

test("unreadable asset catalogs are quarantined before defaults are written", async () => {
  const { store, localStorage } = await loadAssetStore({ "lorecue-asset-catalog": "{broken" });
  const assets = store.ensureAssetCatalog([defaultAsset]);
  assert.equal(assets.length, 1);
  assert.ok(localStorage.keys().some((key) => key.startsWith("lorecue-asset-catalog:quarantine:")));
});
