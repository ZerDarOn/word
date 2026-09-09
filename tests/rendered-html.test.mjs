import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the LoreCue campaign home", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>LoreCue · 叙事创作与带团工作台<\/title>/i);
  assert.match(html, /我的团/);
  assert.match(html, /团项目/);
  assert.match(html, /D&amp;D 5e/);
  assert.match(html, /CoC 7e/);
  assert.match(html, /CoJ/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("ships five interactive validation scenarios without starter remnants", async () => {
  const [page, prototype, scenarios, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/gm_consultation_prototype.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/prototype_scenarios.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<GmConsultationPrototype \/>/);
  assert.match(prototype, /"use client"/);
  assert.match(prototype, /handleUseAndRecord/);
  assert.match(prototype, /handleConfirmRecord/);
  assert.match(prototype, /aria-live="polite"/);
  assert.match(prototype, /使用并记录/);
  assert.match(prototype, /原文摘录/);
  assert.match(prototype, /AI 拟词/);
  assert.match(prototype, /AI 新编/);
  assert.match(scenarios, /明确答案/);
  assert.match(scenarios, /合理推断/);
  assert.match(scenarios, /临场新编/);
  assert.match(scenarios, /泄密风险/);
  assert.match(scenarios, /团后确认/);
  assert.match(layout, /lang="zh-CN"/);
  assert.doesNotMatch(page, /codex-preview|SkeletonPreview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await access(new URL("../.openai/hosting.json", import.meta.url));
});

test("includes the session archive experience and a Python launcher", async () => {
  const [prototype, archivePanel, archiveData, launcher] = await Promise.all([
    readFile(new URL("../app/gm_consultation_prototype.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/session_archive_panel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/session_archive_data.ts", import.meta.url), "utf8"),
    readFile(new URL("../start_lorecue.py", import.meta.url), "utf8"),
  ]);

  assert.match(prototype, /activeView/);
  assert.match(prototype, /场次档案/);
  assert.match(prototype, /<SessionArchivePanel/);
  assert.match(archivePanel, /团前简报/);
  assert.match(archivePanel, /本场时间线/);
  assert.match(archivePanel, /团后复盘/);
  assert.match(archivePanel, /handleSaveBrief/);
  assert.match(archivePanel, /handleCreateSession/);
  assert.match(archivePanel, /aria-live="polite"/);
  assert.match(archiveData, /第 3 次团/);
  assert.match(archiveData, /2026-07-29/);
  assert.match(archiveData, /临场新编/);
  assert.match(launcher, /localhost:3000/);
  assert.match(launcher, /webbrowser\.open/);
  assert.match(launcher, /vinext/);
});

test("separates rules, scenario templates, campaign runs, and sessions", async () => {
  const [prototype, dashboard, projectData] = await Promise.all([
    readFile(new URL("../app/gm_consultation_prototype.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/campaign_project_dashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/campaign_project_data.ts", import.meta.url), "utf8"),
  ]);

  assert.match(prototype, /"projects"/);
  assert.match(prototype, /<CampaignProjectDashboard/);
  assert.match(dashboard, /我的团/);
  assert.match(dashboard, /handleCreateProject/);
  assert.match(dashboard, /剧本模板/);
  assert.match(dashboard, /团项目/);
  assert.match(dashboard, /aria-live="polite"/);
  assert.match(projectData, /D&D 5e/);
  assert.match(projectData, /CoC 7e/);
  assert.match(projectData, /CoJ/);
  assert.match(projectData, /萨菲港旧案 · 老友组/);
  assert.match(projectData, /萨菲港旧案 · 新手组/);
});

test("includes creation, library, and provenance-aware AI workspaces", async () => {
  const [prototype, creativeWorkspace, creativeStudio, library, aiAssistant, projectData] = await Promise.all([
    readFile(new URL("../app/gm_consultation_prototype.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_writing_workspace.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_project_studio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/narrative_asset_library.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lorecue_ai_assistant.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/campaign_project_data.ts", import.meta.url), "utf8"),
  ]);

  assert.match(prototype, /"creative"/);
  assert.match(prototype, /创作/);
  assert.match(prototype, /资料库/);
  assert.match(prototype, /<LoreCueAiAssistant/);
  assert.match(creativeWorkspace, /创作工作台/);
  assert.match(creativeWorkspace, /小说/);
  assert.match(creativeWorkspace, /影视剧本/);
  assert.match(creativeWorkspace, /跑团模组/);
  assert.match(creativeWorkspace, /世界观/);
  assert.match(creativeStudio, /handleSaveDraft/);
  assert.match(creativeStudio, /本项目提醒/);
  assert.match(library, /地图/);
  assert.match(library, /立绘/);
  assert.match(library, /BGM/);
  assert.match(library, /明确引用后才会进入 AI 检索范围/);
  assert.match(aiAssistant, /当前检索范围/);
  assert.match(aiAssistant, /原文依据/);
  assert.match(aiAssistant, /合理推断/);
  assert.match(aiAssistant, /AI 新编/);
  assert.match(aiAssistant, /handleAskAi/);
  assert.match(projectData, /无限/);
  assert.match(projectData, /系统无关/);
  assert.match(projectData, /自定义/);
});

test("connects the full creative workflow from project creation to version review", async () => {
  const [workspace, projectData, creationDialog, projectStudio, narrativeViews] = await Promise.all([
    readFile(new URL("../app/creative_writing_workspace.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_project_data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_project_creation_dialog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_project_studio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_narrative_views.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(workspace, /handleCreateProject/);
  assert.match(workspace, /<CreativeProjectCreationDialog/);
  assert.match(workspace, /<CreativeProjectStudio/);
  assert.match(projectData, /小说/);
  assert.match(projectData, /影视剧本/);
  assert.match(projectData, /跑团模组/);
  assert.match(projectData, /世界观/);
  assert.match(projectData, /projectBlueprints/);
  assert.match(creationDialog, /选择创作类型/);
  assert.match(creationDialog, /从空白开始/);
  assert.match(creationDialog, /创建项目/);
  assert.match(projectStudio, /正文/);
  assert.match(projectStudio, /大纲/);
  assert.match(projectStudio, /设定/);
  assert.match(projectStudio, /时间线/);
  assert.match(projectStudio, /版本/);
  assert.match(projectStudio, /handleCreateSnapshot/);
  assert.match(projectStudio, /插入素材/);
  assert.match(narrativeViews, /人物关系/);
  assert.match(projectStudio, /不会自动覆盖当前正文/);
});

test("provides hierarchical narrative architecture and tabletop-specific layers", async () => {
  const [projectData, navigation, narrativeViews, projectStudio] = await Promise.all([
    readFile(new URL("../app/creative_project_data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_project_navigation.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_narrative_views.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_project_studio.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(projectData, /creativeNavigationGroups/);
  assert.match(projectData, /项目总览/);
  assert.match(projectData, /故事结构/);
  assert.match(projectData, /设定资料/);
  assert.match(projectData, /视觉与媒体/);
  assert.match(projectData, /主持人模组/);
  assert.match(navigation, /项目内搜索/);
  assert.match(navigation, /收藏与最近使用/);
  assert.match(navigation, /aria-expanded/);
  assert.match(narrativeViews, /角色档案/);
  assert.match(narrativeViews, /故事树/);
  assert.match(narrativeViews, /故事节点/);
  assert.match(narrativeViews, /二维图/);
  assert.match(narrativeViews, /人物关系图/);
  assert.match(narrativeViews, /主持人真相/);
  assert.match(narrativeViews, /线索网络/);
  assert.match(narrativeViews, /NPC 知情与披露/);
  assert.match(narrativeViews, /地图与遭遇/);
  assert.match(projectStudio, /<CreativeProjectNavigation/);
  assert.match(projectStudio, /<CreativeNarrativeView/);
});

test("uses opaque theme surfaces so dark mode text stays readable", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.doesNotMatch(styles, /background:\s*rgba\(237,\s*231,\s*218/i);
  assert.doesNotMatch(styles, /background:\s*rgba\(255,\s*253,\s*248/i);
  assert.match(
    styles,
    /\.document-rail,\s*\.writing-inspector\s*\{[^}]*background:\s*var\(--paper-deep\)/s,
  );
  assert.match(styles, /\.topbar\s*\{[^}]*background:\s*var\(--panel\)/s);
});

test("supports editable character secrets, D&D attributes, and hierarchical maps", async () => {
  const [projectData, creationDialog, dossier, maps, narrativeViews] = await Promise.all([
    readFile(new URL("../app/creative_project_data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_project_creation_dialog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_character_dossier.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_map_hierarchy.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_narrative_views.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(projectData, /CreativeRulesSystem/);
  assert.match(projectData, /rulesSystem/);
  assert.match(creationDialog, /规则系统/);
  assert.match(creationDialog, /D&D 5e/);
  assert.match(dossier, /背景与经历/);
  assert.match(dossier, /秘密与知情/);
  assert.match(dossier, /仅主持人可见/);
  assert.match(dossier, /力量/);
  assert.match(dossier, /护甲等级/);
  assert.match(dossier, /被动察觉/);
  assert.match(dossier, /handleSaveCharacter/);
  assert.match(maps, /世界/);
  assert.match(maps, /区域/);
  assert.match(maps, /城市/);
  assert.match(maps, /街区/);
  assert.match(maps, /建筑/);
  assert.match(maps, /楼层/);
  assert.match(maps, /房间/);
  assert.match(maps, /玩家可见/);
  assert.match(maps, /仅主持人可见/);
  assert.match(narrativeViews, /<CreativeCharacterDossier/);
  assert.match(narrativeViews, /<CreativeMapHierarchy/);
});

test("provides structured organization, clue-item, and worldbuilding workbenches", async () => {
  const [organizations, clues, worldbuilding, narrativeViews] = await Promise.all([
    readFile(new URL("../app/creative_organization_workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_clue_item_workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_worldbuilding_workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_narrative_views.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(organizations, /组织层级/);
  assert.match(organizations, /内部结构/);
  assert.match(organizations, /关系与立场/);
  assert.match(organizations, /秘密行动/);
  assert.match(organizations, /公开立场/);
  assert.match(organizations, /隐藏目标/);
  assert.match(organizations, /handleSaveOrganization/);

  assert.match(clues, /物件流转/);
  assert.match(clues, /发现条件/);
  assert.match(clues, /证据链/);
  assert.match(clues, /误导解释/);
  assert.match(clues, /真实信息/);
  assert.match(clues, /仅主持人可见/);
  assert.match(clues, /handleSaveClue/);

  assert.match(worldbuilding, /领域/);
  assert.match(worldbuilding, /主题/);
  assert.match(worldbuilding, /条目/);
  assert.match(worldbuilding, /规则与例外/);
  assert.match(worldbuilding, /关联引用/);
  assert.match(worldbuilding, /影响检查/);
  assert.match(worldbuilding, /handleSaveWorldEntry/);

  assert.match(narrativeViews, /<CreativeOrganizationWorkbench/);
  assert.match(narrativeViews, /<CreativeClueItemWorkbench/);
  assert.match(narrativeViews, /<CreativeWorldbuildingWorkbench/);
});

test("tracks foreshadowing from planting through payoff with knowledge boundaries", async () => {
  const [foreshadowing, narrativeViews] = await Promise.all([
    readFile(new URL("../app/creative_foreshadowing_workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_narrative_views.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(foreshadowing, /伏笔生命周期/);
  assert.match(foreshadowing, /埋设/);
  assert.match(foreshadowing, /强化/);
  assert.match(foreshadowing, /误导/);
  assert.match(foreshadowing, /揭示/);
  assert.match(foreshadowing, /回收/);
  assert.match(foreshadowing, /表层解释/);
  assert.match(foreshadowing, /真实含义/);
  assert.match(foreshadowing, /读者知道/);
  assert.match(foreshadowing, /角色知道/);
  assert.match(foreshadowing, /回收检查/);
  assert.match(foreshadowing, /关联引用/);
  assert.match(foreshadowing, /handleSaveForeshadowing/);
  assert.match(narrativeViews, /<CreativeForeshadowingWorkbench/);
});

test("maps conclusions to evidence and alternate acquisition paths", async () => {
  const [clueNetwork, narrativeViews] = await Promise.all([
    readFile(new URL("../app/creative_clue_network_workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_narrative_views.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(clueNetwork, /线索网络总览/);
  assert.match(clueNetwork, /关键结论/);
  assert.match(clueNetwork, /支持证据/);
  assert.match(clueNetwork, /替代路径/);
  assert.match(clueNetwork, /三线索原则/);
  assert.match(clueNetwork, /获得方式/);
  assert.match(clueNetwork, /失败推进/);
  assert.match(clueNetwork, /支持度/);
  assert.match(clueNetwork, /关联场景/);
  assert.match(clueNetwork, /关联 NPC/);
  assert.match(clueNetwork, /网络健康检查/);
  assert.match(clueNetwork, /handleSaveConclusion/);
  assert.match(narrativeViews, /<CreativeClueNetworkWorkbench/);
});

test("provides Windows and Python launchers that stop the full dev-server tree", async () => {
  const [windowsLauncher, pythonLauncher, readme] = await Promise.all([
    readFile(new URL("../start_lorecue.cmd", import.meta.url), "utf8"),
    readFile(new URL("../start_lorecue.py", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
  ]);

  assert.match(windowsLauncher, /exec vinext dev/);
  assert.match(windowsLauncher, /localhost:3000/);
  assert.match(pythonLauncher, /def terminate_process_tree/);
  assert.match(pythonLauncher, /taskkill/);
  assert.match(readme, /start_lorecue\.cmd/);
  assert.match(readme, /start_lorecue\.py/);
});
