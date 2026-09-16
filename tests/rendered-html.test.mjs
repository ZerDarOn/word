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
  assert.match(aiAssistant, /这次允许 AI 看什么/);
  assert.match(aiAssistant, /知识边界检查/);
  assert.match(aiAssistant, /手动现场输入/);
  assert.match(aiAssistant, /handleConfirmDraft/);
  assert.match(aiAssistant, /尚未成为正式设定/);
  assert.match(projectData, /无限/);
  assert.match(projectData, /系统无关/);
  assert.match(projectData, /自定义/);
});

test("connects the full creative workflow from project creation to version review", async () => {
  const [workspace, projectData, creationDialog, projectStudio, narrativeViews, documentEditor, versionWorkbench] = await Promise.all([
    readFile(new URL("../app/creative_writing_workspace.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_project_data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_project_creation_dialog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_project_studio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_narrative_views.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_document_editor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_version_workbench.tsx", import.meta.url), "utf8"),
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
  assert.match(documentEditor, /插入素材/);
  assert.match(narrativeViews, /人物关系/);
  assert.match(versionWorkbench, /不会自动覆盖当前正文/);
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

test("keeps NPC knowledge, belief, disclosure, and AI boundaries separate", async () => {
  const [npcKnowledge, narrativeViews] = await Promise.all([
    readFile(new URL("../app/creative_npc_knowledge_workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_narrative_views.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(npcKnowledge, /NPC 知情总览/);
  assert.match(npcKnowledge, /确定知道/);
  assert.match(npcKnowledge, /误以为/);
  assert.match(npcKnowledge, /愿意透露/);
  assert.match(npcKnowledge, /披露条件/);
  assert.match(npcKnowledge, /绝不知情/);
  assert.match(npcKnowledge, /玩家已触发/);
  assert.match(npcKnowledge, /AI 可用边界/);
  assert.match(npcKnowledge, /回答模拟/);
  assert.match(npcKnowledge, /全知风险检查/);
  assert.match(npcKnowledge, /handleSaveKnowledge/);
  assert.match(narrativeViews, /<CreativeNpcKnowledgeWorkbench/);
});

test("turns tabletop scenes into runnable nodes with failure-safe exits", async () => {
  const [sceneWorkbench, narrativeViews] = await Promise.all([
    readFile(new URL("../app/creative_scene_node_workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_narrative_views.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(sceneWorkbench, /场景运行总览/);
  assert.match(sceneWorkbench, /进入方式/);
  assert.match(sceneWorkbench, /场景目标/);
  assert.match(sceneWorkbench, /玩家可见/);
  assert.match(sceneWorkbench, /主持人隐藏/);
  assert.match(sceneWorkbench, /检定与失败推进/);
  assert.match(sceneWorkbench, /NPC 与披露/);
  assert.match(sceneWorkbench, /出口与后果/);
  assert.match(sceneWorkbench, /场景状态/);
  assert.match(sceneWorkbench, /临场记录/);
  assert.match(sceneWorkbench, /handleSaveScene/);
  assert.match(narrativeViews, /<CreativeSceneNodeWorkbench/);
});

test("maintains a provenance-aware GM truth ledger", async () => {
  const [truthWorkbench, narrativeViews] = await Promise.all([
    readFile(new URL("../app/creative_gm_truth_workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_narrative_views.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(truthWorkbench, /真相总览/);
  assert.match(truthWorkbench, /原文明确/);
  assert.match(truthWorkbench, /合理推断/);
  assert.match(truthWorkbench, /临场新编/);
  assert.match(truthWorkbench, /尚未确认/);
  assert.match(truthWorkbench, /事实来源/);
  assert.match(truthWorkbench, /知识边界/);
  assert.match(truthWorkbench, /公开时机/);
  assert.match(truthWorkbench, /冲突与版本/);
  assert.match(truthWorkbench, /设为正式设定/);
  assert.match(truthWorkbench, /handleSaveTruth/);
  assert.match(narrativeViews, /<CreativeGmTruthWorkbench/);
});

test("connects hierarchical maps to runnable tabletop encounters", async () => {
  const [encounterWorkbench, narrativeViews] = await Promise.all([
    readFile(new URL("../app/creative_map_encounter_workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_narrative_views.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(encounterWorkbench, /遭遇运行总览/);
  assert.match(encounterWorkbench, /地图区域/);
  assert.match(encounterWorkbench, /环境效果/);
  assert.match(encounterWorkbench, /入口与出口/);
  assert.match(encounterWorkbench, /参与单位/);
  assert.match(encounterWorkbench, /非战斗解法/);
  assert.match(encounterWorkbench, /探索时钟/);
  assert.match(encounterWorkbench, /D&D 5e/);
  assert.match(encounterWorkbench, /CoC 7e/);
  assert.match(encounterWorkbench, /遭遇后状态/);
  assert.match(encounterWorkbench, /handleSaveEncounter/);
  assert.match(narrativeViews, /<CreativeMapEncounterWorkbench/);
});

test("tracks reachable endings, consequences, and future campaign carryover", async () => {
  const [endingWorkbench, narrativeViews] = await Promise.all([
    readFile(new URL("../app/creative_ending_branch_workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_narrative_views.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(endingWorkbench, /结局路径总览/);
  assert.match(endingWorkbench, /触发条件/);
  assert.match(endingWorkbench, /玩家选择/);
  assert.match(endingWorkbench, /公开真相/);
  assert.match(endingWorkbench, /人物后果/);
  assert.match(endingWorkbench, /阵营后果/);
  assert.match(endingWorkbench, /未解决事项/);
  assert.match(endingWorkbench, /下一场承接/);
  assert.match(endingWorkbench, /可达性检查/);
  assert.match(endingWorkbench, /死分支/);
  assert.match(endingWorkbench, /handleSaveEnding/);
  assert.match(narrativeViews, /<CreativeEndingBranchWorkbench/);
});

test("builds spoiler-safe player handbooks with conditional releases", async () => {
  const [handbookWorkbench, narrativeViews] = await Promise.all([
    readFile(new URL("../app/creative_player_handbook_workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_narrative_views.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(handbookWorkbench, /玩家手册总览/);
  assert.match(handbookWorkbench, /开场公开/);
  assert.match(handbookWorkbench, /条件公开/);
  assert.match(handbookWorkbench, /玩家视角预览/);
  assert.match(handbookWorkbench, /公开条件/);
  assert.match(handbookWorkbench, /剧透检查/);
  assert.match(handbookWorkbench, /主持人隐藏/);
  assert.match(handbookWorkbench, /按玩家分发/);
  assert.match(handbookWorkbench, /撤回与修订/);
  assert.match(handbookWorkbench, /导出包/);
  assert.match(handbookWorkbench, /handleSaveHandout/);
  assert.match(narrativeViews, /<CreativePlayerHandbookWorkbench/);
});

test("provides manually triggered scene audio cues without conversation monitoring", async () => {
  const [audioWorkbench, narrativeViews] = await Promise.all([
    readFile(new URL("../app/creative_audio_cue_workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_narrative_views.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(audioWorkbench, /BGM 与音效总览/);
  assert.match(audioWorkbench, /手动触发/);
  assert.match(audioWorkbench, /不会监听对话/);
  assert.match(audioWorkbench, /场景提示点/);
  assert.match(audioWorkbench, /循环区间/);
  assert.match(audioWorkbench, /淡入淡出/);
  assert.match(audioWorkbench, /音效层/);
  assert.match(audioWorkbench, /备用曲目/);
  assert.match(audioWorkbench, /玩家端名称/);
  assert.match(audioWorkbench, /播放队列/);
  assert.match(audioWorkbench, /handleSaveAudioCue/);
  assert.match(narrativeViews, /<CreativeAudioCueWorkbench/);
});

test("manages player attachments as spoiler-safe session handouts", async () => {
  const [attachmentWorkbench, narrativeViews] = await Promise.all([
    readFile(new URL("../app/creative_player_attachment_workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_narrative_views.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(attachmentWorkbench, /玩家附件总览/);
  assert.match(attachmentWorkbench, /主持人原件/);
  assert.match(attachmentWorkbench, /玩家版本/);
  assert.match(attachmentWorkbench, /公开条件/);
  assert.match(attachmentWorkbench, /剧透遮罩/);
  assert.match(attachmentWorkbench, /发放记录/);
  assert.match(attachmentWorkbench, /按玩家发放/);
  assert.match(attachmentWorkbench, /撤回不会抹除/);
  assert.match(attachmentWorkbench, /来源引用/);
  assert.match(attachmentWorkbench, /预览玩家所见/);
  assert.match(attachmentWorkbench, /handleSaveAttachment/);
  assert.match(narrativeViews, /<CreativePlayerAttachmentWorkbench/);
});

test("organizes character portraits by identity, state, and asset provenance", async () => {
  const [portraitWorkbench, narrativeViews] = await Promise.all([
    readFile(new URL("../app/creative_portrait_workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_narrative_views.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(portraitWorkbench, /角色立绘总览/);
  assert.match(portraitWorkbench, /身份版本/);
  assert.match(portraitWorkbench, /表情与状态/);
  assert.match(portraitWorkbench, /服装与伤势/);
  assert.match(portraitWorkbench, /玩家可见名称/);
  assert.match(portraitWorkbench, /登场预览/);
  assert.match(portraitWorkbench, /裁切安全区/);
  assert.match(portraitWorkbench, /素材来源/);
  assert.match(portraitWorkbench, /AI 候选图/);
  assert.match(portraitWorkbench, /不会自动替换/);
  assert.match(portraitWorkbench, /handleSavePortrait/);
  assert.match(narrativeViews, /<CreativePortraitWorkbench/);
});

test("provides a persistent long-form writing editor with reviewable AI changes", async () => {
  const [projectStudio, documentEditor] = await Promise.all([
    readFile(new URL("../app/creative_project_studio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_document_editor.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(projectStudio, /localStorage/);
  assert.match(projectStudio, /lorecue-writing/);
  assert.match(projectStudio, /全文搜索/);
  assert.match(projectStudio, /项目目录与设定/);
  assert.match(projectStudio, /handleCreateDocument/);
  assert.match(projectStudio, /自动保存/);
  assert.match(projectStudio, /<CreativeDocumentEditor/);
  assert.match(documentEditor, /Markdown/);
  assert.match(documentEditor, /专注模式/);
  assert.match(documentEditor, /阅读预览/);
  assert.match(documentEditor, /AI 修改预览/);
  assert.match(documentEditor, /接受修改/);
  assert.match(documentEditor, /保留原文/);
  assert.match(documentEditor, /不会直接覆盖正文/);
  assert.match(documentEditor, /insertMarkup/);
  assert.match(documentEditor, /查找替换/);
  assert.match(documentEditor, /全部替换/);
  assert.match(documentEditor, /场景元数据/);
  assert.match(documentEditor, /故事时间/);
  assert.match(documentEditor, /导出 \.md/);
  assert.match(documentEditor, /createObjectURL/);
});

test("turns the writing inspector into outline, source, and private-note tools", async () => {
  const inspector = await readFile(new URL("../app/creative_writing_inspector.tsx", import.meta.url), "utf8");
  const studio = await readFile(new URL("../app/creative_project_studio.tsx", import.meta.url), "utf8");

  assert.match(inspector, /当前文档大纲/);
  assert.match(inspector, /Markdown 标题/);
  assert.match(inspector, /规则检测/);
  assert.match(inspector, /正文依据/);
  assert.match(inspector, /设定依据/);
  assert.match(inspector, /项目可引用资料/);
  assert.match(inspector, /查看不等于写入正文/);
  assert.match(inspector, /仅作者可见/);
  assert.match(inspector, /备注不进入正文/);
  assert.match(studio, /activeDocument\.note/);
  assert.match(studio, /<CreativeWritingInspector/);
});

test("manages large document sets with recoverable archiving and project backups", async () => {
  const studio = await readFile(new URL("../app/creative_project_studio.tsx", import.meta.url), "utf8");

  assert.match(studio, /handleDuplicateDocument/);
  assert.match(studio, /handleMoveDocument/);
  assert.match(studio, /handleArchiveDocument/);
  assert.match(studio, /handleUndoArchive/);
  assert.match(studio, /查看归档/);
  assert.match(studio, /lorecue-writing-backup/);
  assert.match(studio, /LoreCue备份\.json/);
  assert.match(studio, /原文档没有变化/);
});

test("validates backup identity and previews imports before recoverable replacement", async () => {
  const [backupImport, studio] = await Promise.all([
    readFile(new URL("../app/creative_backup_import.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_project_studio.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(backupImport, /5 \* 1024 \* 1024/);
  assert.match(backupImport, /lorecue-writing-backup/);
  assert.match(backupImport, /parsed\.project\?\.id !== projectId/);
  assert.match(backupImport, /预览阶段没有改动当前项目/);
  assert.match(backupImport, /确认导入并保留撤销点/);
  assert.match(studio, /:pre-import/);
  assert.match(studio, /handleUndoImport/);
  assert.match(studio, /撤销最近一次导入/);
});

test("provides an evidence-first project consistency resolution workbench", async () => {
  const [workbench, studio] = await Promise.all([
    readFile(new URL("../app/creative_consistency_workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_project_studio.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(workbench, /设定冲突/);
  assert.match(workbench, /疑似重复/);
  assert.match(workbench, /AI 语义候选/);
  assert.match(workbench, /AI 候选，不是事实判定/);
  assert.match(workbench, /查看双侧依据/);
  assert.match(workbench, /确认处理结论/);
  assert.match(workbench, /不会自动修改正文、设定卡或团历史/);
  assert.match(studio, /<CreativeConsistencyWorkbench/);
});

test("persists whole-project snapshots with comparison and protected restore", async () => {
  const [versionWorkbench, studio] = await Promise.all([
    readFile(new URL("../app/creative_version_workbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative_project_studio.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(versionWorkbench, /与当前项目比较/);
  assert.match(versionWorkbench, /快照字数/);
  assert.match(versionWorkbench, /当前相对快照有变化/);
  assert.match(versionWorkbench, /恢复前最后确认/);
  assert.match(versionWorkbench, /确认恢复/);
  assert.match(studio, /snapshotStorageKey/);
  assert.match(studio, /恢复前保护/);
  assert.match(studio, /<CreativeVersionWorkbench/);
});
