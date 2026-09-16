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

  removeItem(key) {
    this.values.delete(key);
  }

  get length() {
    return this.values.size;
  }

  key(index) {
    return this.keys()[index] ?? null;
  }

  keys() {
    return [...this.values.keys()];
  }
}

async function loadProjectStore(entries = {}) {
  const source = await readFile(new URL("../app/lorecue_project_store.ts", import.meta.url), "utf8");
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
    window: { localStorage },
  });
  vm.runInContext(compiled, context, { filename: "lorecue_project_store.js" });
  return { store: runtimeModule.exports, localStorage };
}

const defaultProject = {
  id: "default-project",
  kind: "小说",
  title: "默认项目",
  summary: "默认项目简介",
  progress: "第一章",
  updatedAt: "刚刚",
  documentCount: 1,
  warningCount: 0,
};

test("project catalog keeps created projects across reload without duplicating defaults", async () => {
  const { store, localStorage } = await loadProjectStore();
  const initial = store.ensureProjectCatalog([defaultProject]);
  assert.equal(initial.length, 1);

  const createdProject = { ...defaultProject, id: "created-project", title: "刷新后仍存在" };
  store.saveProjectCatalog([createdProject, ...initial]);

  const reloaded = store.ensureProjectCatalog([defaultProject]);
  assert.equal(reloaded.map((project) => project.id).join(","), "created-project,default-project");
  assert.equal(reloaded.filter((project) => project.id === "default-project").length, 1);
  assert.ok(localStorage.getItem("lorecue-project-catalog"));
});

test("legacy writing and AI data migrate into one project envelope without deleting old keys", async () => {
  const document = { id: "doc-1", group: "正文", title: "旧草稿", body: "保留下来", updatedAt: "昨天" };
  const consultation = {
    id: "consult-1",
    mode: "查设定",
    speaker: "主持人视角",
    question: "旧咨询还在吗？",
    sourceLabels: ["当前条目"],
    includesLiveContext: false,
    createdAt: "昨天",
    status: "pending",
  };
  const legacyWriting = "lorecue-writing:project-a";
  const legacyConsultation = "lorecue-ai-consultations:项目 A · 当前创作项目";
  const { store, localStorage } = await loadProjectStore({
    [legacyWriting]: JSON.stringify([document]),
    [legacyConsultation]: JSON.stringify([consultation]),
  });

  const result = store.ensureProjectEnvelope("project-a", {
    initialDocuments: [],
    legacyConsultationScope: "项目 A · 当前创作项目",
  });
  assert.equal(result.source, "legacy");
  assert.equal(result.envelope.documents[0].body, "保留下来");
  assert.equal(result.envelope.consultations[0].question, "旧咨询还在吗？");
  assert.ok(localStorage.getItem(legacyWriting));
  assert.ok(localStorage.getItem(legacyConsultation));

  store.saveProjectDocuments("project-a", [{ ...document, body: "修改后的正文" }]);
  const reloaded = store.readProjectEnvelope("project-a");
  assert.equal(reloaded.documents[0].body, "修改后的正文");
  assert.equal(reloaded.consultations[0].id, "consult-1");
});

test("session-scoped AI consultations retain their player-knowledge provenance", async () => {
  const { store } = await loadProjectStore();
  store.saveProjectConsultations("saffi-module", [{
    id: "consult-session-3",
    mode: "GM 救场",
    speaker: "伊芙琳",
    question: "玩家已经知道值班名册了吗？",
    answer: "只知道发放版本中公开的部分。",
    sourceLabels: ["当前场次", "玩家已知资料"],
    includesLiveContext: true,
    liveContext: "玩家刚刚追问旧版名册。",
    campaignId: "saffi-old-friends",
    campaignTitle: "萨菲港旧案 · 老友组",
    sessionId: "session-3",
    sessionLabel: "第 3 次团 · 码头追踪",
    includesPlayerDisclosures: true,
    playerDisclosures: [{
      deliveryId: "delivery-roster-v2",
      title: "港务处值班名册（残页）",
      status: "revoked",
    }],
    createdAt: "07-29 21:05",
    status: "pending",
  }]);

  const reloaded = store.readProjectEnvelope("saffi-module");
  const consultation = reloaded.consultations[0];
  assert.equal(consultation.campaignId, "saffi-old-friends");
  assert.equal(consultation.sessionId, "session-3");
  assert.equal(consultation.includesPlayerDisclosures, true);
  assert.equal(consultation.playerDisclosures[0].status, "revoked");
  assert.equal(consultation.playerDisclosures[0].title, "港务处值班名册（残页）");

  store.saveProjectConsultations("project-b", [{
    ...consultation,
    id: "consult-second-project",
    question: "另一个创作项目中的本场咨询",
  }]);
  store.saveProjectConsultations("project-c", [{
    ...consultation,
    id: "consult-other-campaign",
    campaignId: "saffi-beginners",
    campaignTitle: "萨菲港旧案 · 新手组",
  }]);

  const sessionConsultations = store.readProjectConsultationsForSession("saffi-old-friends", "session-3");
  assert.equal(sessionConsultations.length, 2);
  assert.deepEqual(
    new Set(sessionConsultations.map((item) => item.projectId)),
    new Set(["saffi-module", "project-b"]),
  );
  assert.equal(store.readProjectConsultationsForSession("saffi-beginners", "session-3").length, 1);
  assert.equal(store.readProjectConsultationsForSession("saffi-old-friends", "session-2").length, 0);

  store.updateProjectConsultationStatus("saffi-module", "consult-session-3", "reviewed");
  const reviewed = store.readProjectConsultationsForSession("saffi-old-friends", "session-3");
  assert.equal(reviewed.find((item) => item.id === "consult-session-3").status, "reviewed");
  assert.equal(reviewed.find((item) => item.id === "consult-second-project").status, "pending");
});

test("unreadable unified project data is quarantined before a fresh envelope is created", async () => {
  const { store, localStorage } = await loadProjectStore({
    "lorecue-project:broken-project": "{not-json",
  });
  const result = store.ensureProjectEnvelope("broken-project", { initialDocuments: [] });
  assert.equal(result.source, "initial");
  assert.equal(result.envelope.projectId, "broken-project");
  assert.ok(localStorage.keys().some((key) => key.startsWith("lorecue-project-quarantine:broken-project:")));
});
