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

const sessionData = {
  initialBrief: "默认团前简报",
  initialSessionRecords: [{
    id: 1,
    text: "默认临场记录",
    kind: "happened",
    scenario: "默认场景",
    status: "待确认",
  }],
  initialSessionSummaries: [{
    id: "session-3",
    number: "第 3 次团",
    title: "码头追踪",
    date: "2026-07-29",
    time: "20:00—23:30",
    status: "进行中",
  }],
  sessionObjectives: [
    { id: "objective-a", text: "目标 A", complete: true },
    { id: "objective-b", text: "目标 B", complete: false },
  ],
};

async function loadCampaignStore(entries = {}) {
  const source = await readFile(new URL("../app/lorecue_campaign_store.ts", import.meta.url), "utf8");
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
    JSON,
    Map,
    Object,
    Set,
    String,
    console,
    exports: runtimeModule.exports,
    module: runtimeModule,
    require(specifier) {
      if (specifier === "./session_archive_data") return sessionData;
      throw new Error(`Unexpected module: ${specifier}`);
    },
    window: { localStorage },
  });
  vm.runInContext(compiled, context, { filename: "lorecue_campaign_store.js" });
  return { store: runtimeModule.exports, localStorage };
}

const campaign = {
  id: "campaign-a",
  name: "萨菲港旧案 · 测试组",
  runName: "测试组",
  templateTitle: "萨菲港旧案",
  system: "D&D 5e",
  status: "进行中",
  summary: "独立跑团历史",
  playerCount: 4,
  sessionCount: 3,
  lastSession: "第 3 次团",
  nextSession: "待安排",
  pendingReviews: 0,
  currentStage: "第三幕",
};

test("campaign review records survive reload and synchronize the catalog pending count", async () => {
  const { store, localStorage } = await loadCampaignStore();
  store.ensureCampaignCatalog([campaign]);
  const records = [
    { ...sessionData.initialSessionRecords[0], id: 10, status: "待确认" },
    { ...sessionData.initialSessionRecords[0], id: 11, status: "客观事实" },
  ];
  store.saveCampaignRecords("campaign-a", records);

  const archive = store.readCampaignArchive("campaign-a");
  assert.equal(archive.records.length, 2);
  assert.equal(archive.records[1].status, "客观事实");
  const catalog = JSON.parse(localStorage.getItem("lorecue-campaign-catalog"));
  assert.equal(catalog.projects[0].pendingReviews, 1);
});

test("brief, objectives, session list, and next-session draft update independently", async () => {
  const { store } = await loadCampaignStore();
  store.ensureCampaignArchive("campaign-a");
  store.saveCampaignBrief("campaign-a", "新的团前简报");
  store.saveCampaignObjectives("campaign-a", ["objective-b"]);
  store.saveCampaignHandoff("campaign-a", [{
    id: "handoff-fact-1",
    kind: "长期事实",
    text: "灰潮号将在两天后靠港",
    sourceSessionId: "session-3",
    sourceSessionLabel: "第 3 次团 · 码头追踪",
    sourceLabel: "船期表 · 已确认",
    selected: true,
  }]);
  const sessions = [
    ...sessionData.initialSessionSummaries,
    { id: "session-4", number: "第 4 次团", title: "未命名场次", date: "待安排", time: "时间未定", status: "草稿" },
  ];
  store.saveCampaignSessions("campaign-a", sessions, "session-4");
  store.saveCampaignDraft(
    "campaign-a",
    "灰潮号靠港",
    "从船期异常继续推进",
    sessions,
    "session-4",
    store.readCampaignArchive("campaign-a").handoffItems,
    ["handoff-fact-1"],
  );

  const archive = store.readCampaignArchive("campaign-a");
  assert.equal(archive.brief, "新的团前简报");
  assert.equal(archive.completedObjectiveIds.join(","), "objective-b");
  assert.equal(archive.handoffItems.length, 1);
  assert.equal(archive.handoffItems[0].kind, "长期事实");
  assert.equal(archive.handoffItems[0].selected, true);
  assert.equal(archive.handoffItems[0].sourceSessionId, "session-3");
  assert.equal(archive.draftHandoffItems.length, 1);
  assert.equal(archive.draftHandoffItems[0].sourceLabel, "船期表 · 已确认");
  assert.deepEqual(archive.draftPlayerKnownHandoffIds, ["handoff-fact-1"]);
  assert.equal(archive.sessions.length, 2);
  assert.equal(archive.selectedSessionId, "session-4");
  assert.equal(archive.draftTitle, "灰潮号靠港");
  assert.equal(archive.records.length, 1);
});

test("unreadable campaign archives are quarantined before defaults are created", async () => {
  const key = "lorecue-campaign-archive:campaign-a";
  const { store, localStorage } = await loadCampaignStore({ [key]: "{broken" });
  const archive = store.ensureCampaignArchive("campaign-a");
  assert.equal(archive.campaignId, "campaign-a");
  assert.ok(localStorage.keys().some((item) => item.startsWith(`${key}:quarantine:`)));
});
