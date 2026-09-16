"use client";

import { useEffect, useMemo, useState } from "react";
import {
  prototypeScenarios,
  type ConsultationMode,
  type PrototypeScenario,
} from "./prototype_scenarios";
import { CampaignProjectDashboard } from "./campaign_project_dashboard";
import { CreativeWritingWorkspace } from "./creative_writing_workspace";
import { LoreCueAiAssistant } from "./lorecue_ai_assistant";
import { NarrativeAssetLibrary } from "./narrative_asset_library";
import { SessionArchivePanel } from "./session_archive_panel";
import { initialSessionRecords, type ReviewStatus, type SessionRecord } from "./session_archive_data";
import { ensureCampaignArchive, saveCampaignRecords } from "./lorecue_campaign_store";
import { useSessionConsultations } from "./use_session_consultations";

const CURRENT_CAMPAIGN_ID = "saffi-old-friends";
const CURRENT_CAMPAIGN_TITLE = "萨菲港旧案 · 老友组";
const CURRENT_PROJECT_ID = "saffi-module";
const CURRENT_SESSION_ID = "session-3";
const CURRENT_SESSION_LABEL = "第 3 次团 · 码头追踪";

const modeLabels: Record<ConsultationMode, string> = {
  strict: "严格依据",
  minimal: "最小补全",
  rescue: "救场优先",
};

function evidenceTone(scenario: PrototypeScenario) {
  if (scenario.evidenceLabel === "原文明确") return "confirmed";
  if (scenario.evidenceLabel === "合理推断") return "inferred";
  return "created";
}

export function GmConsultationPrototype() {
  const [activeView, setActiveView] = useState<
    "creative" | "projects" | "consultation" | "archive" | "library"
  >("creative");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiScope, setAiScope] = useState("潮汐来信 · 当前创作项目");
  const [aiProjectId, setAiProjectId] = useState("tide-letter");
  const [libraryProjectId, setLibraryProjectId] = useState("tide-letter");
  const [libraryProjectTitle, setLibraryProjectTitle] = useState("潮汐来信");
  const [selectedId, setSelectedId] = useState(prototypeScenarios[0].id);
  const [mode, setMode] = useState<ConsultationMode>("minimal");
  const [question, setQuestion] = useState(prototypeScenarios[0].question);
  const [showSources, setShowSources] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [bgmPlaying, setBgmPlaying] = useState(false);
  const [feedback, setFeedback] = useState("选择一个棘手情况，看看咨询台如何拆解。");
  const [records, setRecords] = useState<SessionRecord[]>(initialSessionRecords);
  const sessionConsultations = useSessionConsultations(CURRENT_CAMPAIGN_ID, CURRENT_SESSION_ID);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRecords(ensureCampaignArchive(CURRENT_CAMPAIGN_ID).records);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const scenario = useMemo(
    () => prototypeScenarios.find((item) => item.id === selectedId) ?? prototypeScenarios[0],
    [selectedId],
  );
  const strictBlocked = mode === "strict" && scenario.requiresCreation;

  function selectScenario(nextScenario: PrototypeScenario) {
    setSelectedId(nextScenario.id);
    setQuestion(nextScenario.question);
    setShowSources(false);
    setShowAlternatives(false);
    setFeedback(`已切换到“${nextScenario.validationLabel}”验证。`);
  }

  function handleUseAndRecord() {
    const nextRecord: SessionRecord = {
      id: Date.now(),
      text: scenario.recordSummary,
      kind: scenario.recordKind,
      scenario: scenario.title,
      status: "待确认",
    };
    setRecords((current) => {
      const nextRecords = [nextRecord, ...current];
      saveCampaignRecords(CURRENT_CAMPAIGN_ID, nextRecords);
      return nextRecords;
    });
    setFeedback(
      scenario.recordKind === "spoken"
        ? "已记为主持人实际说出的内容，团后待确认。"
        : "已记为本场实际发生的内容，团后待确认。",
    );
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(scenario.answer);
      setFeedback("建议已复制；复制不代表已采用，也不会写入记录。");
    } catch {
      setFeedback("当前环境无法自动复制，请手动选择建议文字。");
    }
  }

  function handleConfirmRecord(id: number, status: ReviewStatus) {
    setRecords((current) => {
      const nextRecords = current.map((record) => (record.id === id ? { ...record, status } : record));
      saveCampaignRecords(CURRENT_CAMPAIGN_ID, nextRecords);
      return nextRecords;
    });
    setFeedback(`团后归档已更新为“${status}”。`);
  }

  const pendingRecordCount = records.filter((record) => record.status === "待确认").length;
  const pendingConsultationCount = sessionConsultations.filter((consultation) => consultation.status === "pending").length;
  const pendingCount = pendingRecordCount + pendingConsultationCount;

  function openAi(prompt = "", scope = "潮汐来信 · 当前创作项目", projectId = "tide-letter") {
    setAiPrompt(prompt);
    setAiScope(scope);
    setAiProjectId(projectId);
    setAiOpen(true);
  }

  function focusCurrentCampaign() {
    setActiveView("consultation");
    setAiProjectId(CURRENT_PROJECT_ID);
    setAiScope(`${CURRENT_CAMPAIGN_TITLE} · ${CURRENT_SESSION_LABEL}`);
    setLibraryProjectId(CURRENT_PROJECT_ID);
    setLibraryProjectTitle("萨菲港旧案");
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">跳到主要内容</a>

      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">LC</span>
          <div><strong>LoreCue</strong><span>叙事线索台</span></div>
        </div>
        <nav className="primary-navigation" aria-label="主要功能">
          <button
            className={activeView === "creative" ? "active" : ""}
            onClick={() => setActiveView("creative")}
            aria-current={activeView === "creative" ? "page" : undefined}
          >
            创作
          </button>
          <button
            className={activeView === "projects" ? "active" : ""}
            onClick={() => setActiveView("projects")}
            aria-current={activeView === "projects" ? "page" : undefined}
          >
            我的团
          </button>
          <button
            className={activeView === "consultation" ? "active" : ""}
            onClick={focusCurrentCampaign}
            aria-current={activeView === "consultation" ? "page" : undefined}
          >
            主持人咨询台
          </button>
          <button
            className={activeView === "archive" ? "active" : ""}
            onClick={() => setActiveView("archive")}
            aria-current={activeView === "archive" ? "page" : undefined}
          >
            场次档案
          </button>
          <button
            className={activeView === "library" ? "active" : ""}
            onClick={() => setActiveView("library")}
            aria-current={activeView === "library" ? "page" : undefined}
          >
            资料库
          </button>
        </nav>
        <div className="topbar-actions">
          <div className="session-state">
            <span className="live-dot" aria-hidden="true" />
            {activeView === "creative"
              ? "潮汐来信 · 创作空间"
              : activeView === "projects"
                ? "5 个团项目 · 4 种规则"
                : activeView === "consultation"
                  ? "萨菲港旧案 · 老友组 · 本场辅助"
                  : activeView === "archive"
                    ? "萨菲港旧案 · 老友组 · 第 3 次团"
                    : "全部资料 · 跨项目可见"}
          </div>
          <button className="global-ai-button" onClick={() => openAi("", aiScope, aiProjectId)}>
            <span aria-hidden="true">AI</span>助手
          </button>
        </div>
      </header>

      <CreativeWritingWorkspace
        hidden={activeView !== "creative"}
        onAskAi={(prompt, scope, projectId) => openAi(prompt, `${scope} · 当前创作项目`, projectId)}
        onProjectFocus={(project) => {
          if (!project) return;
          setAiProjectId(project.id);
          setAiScope(`${project.title} · 当前创作项目`);
          setLibraryProjectId(project.id);
          setLibraryProjectTitle(project.title);
        }}
      />

      <CampaignProjectDashboard
        hidden={activeView !== "projects"}
        currentPendingReviews={pendingCount}
        onOpenCurrentProject={focusCurrentCampaign}
      />

      <NarrativeAssetLibrary
        hidden={activeView !== "library"}
        currentProjectId={libraryProjectId}
        currentProjectTitle={libraryProjectTitle}
        currentCampaignId={CURRENT_CAMPAIGN_ID}
        currentCampaignTitle="萨菲港旧案 · 老友组"
      />

      {activeView === "consultation" ? (
        <main className="workspace" id="main-content">
        <aside className="scenario-rail" aria-label="验证场景">
          <div className="section-heading">
            <span className="eyebrow">原型试用</span>
            <h2>五种棘手情况</h2>
            <p>它不会偷听跑团。卡住时，点一个相近情况主动咨询。</p>
          </div>
          <div className="scenario-list" role="tablist" aria-label="选择验证场景">
            {prototypeScenarios.map((item, index) => (
              <button
                className={`scenario-tab ${item.id === selectedId ? "active" : ""}`}
                key={item.id}
                onClick={() => selectScenario(item)}
                role="tab"
                aria-selected={item.id === selectedId}
                aria-controls="consultation-result"
              >
                <span className="scenario-number">{String(index + 1).padStart(2, "0")}</span>
                <span><small>{item.validationLabel}</small><strong>{item.title}</strong></span>
              </button>
            ))}
          </div>
          <div className="rail-note">
            <strong>原型边界</strong>
            <p>当前不接语音、不自动读取群聊，也不会替主持人直接发言。</p>
          </div>
        </aside>

        <section className="consultation-column">
          <div className="consultation-header">
            <div>
              <span className="eyebrow">主持人咨询台</span>
              <h1>现在卡在哪里？</h1>
            </div>
            <div className="mode-control" aria-label="咨询模式">
              {(Object.keys(modeLabels) as ConsultationMode[]).map((item) => (
                <button
                  key={item}
                  className={mode === item ? "selected" : ""}
                  onClick={() => {
                    setMode(item);
                    setFeedback(`已切换为“${modeLabels[item]}”模式。`);
                  }}
                  aria-pressed={mode === item}
                >
                  {modeLabels[item]}
                </button>
              ))}
            </div>
          </div>

          <label className="question-box">
            <span>把玩家的问题或你卡住的地方贴进来</span>
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={3} />
            <small>不会自动发送给玩家。原型中的建议来自预设场景，不会真正调用 AI。</small>
          </label>

          <div className="goal-row" aria-label="快速意图">
            <span>我想要：</span>
            {scenario.quickGoals.map((goal) => (
              <button key={goal} onClick={() => setFeedback(`已把“${goal}”作为本次回答侧重点。`)}>
                {goal}
              </button>
            ))}
          </div>

          <article className="result-card" id="consultation-result" role="tabpanel">
            <div className="result-topline">
              <div>
                <span className="eyebrow">{scenario.validationLabel}</span>
                <h2>{scenario.title}</h2>
                <p>{scenario.situation}</p>
              </div>
              <span className={`evidence-badge ${evidenceTone(scenario)}`}>{scenario.evidenceLabel}</span>
            </div>

            {strictBlocked ? (
              <div className="blocked-answer">
                <strong>严格依据模式已拦截</strong>
                <p>现有资料不足以回答。你可以改用“最小补全”，或只给玩家一个继续调查的方法。</p>
              </div>
            ) : (
              <>
                <div className="answer-block">
                  <div className="answer-label">
                    <span>建议回答</span>
                    <span className={`wording-badge ${scenario.wordingLabel === "AI 新编" ? "created" : ""}`}>
                      {scenario.wordingLabel}
                    </span>
                  </div>
                  <p>{scenario.answer}</p>
                </div>

                <div className="guardrail-grid">
                  <div><span>知情与披露</span><p>{scenario.disclosure}</p></div>
                  <div className="risk-panel">
                    <span>采用前注意 · {scenario.impactLabel}</span>
                    <p>{scenario.risk}</p>
                  </div>
                </div>

                {scenario.assumptions.length > 0 && (
                  <div className="assumption-row">
                    <strong>这条推断依赖：</strong>
                    {scenario.assumptions.map((assumption) => <span key={assumption}>{assumption}</span>)}
                  </div>
                )}
              </>
            )}

            <div className="result-actions">
              <button className="primary-action" onClick={handleUseAndRecord} disabled={strictBlocked}>
                使用并记录
              </button>
              <button onClick={handleCopy} disabled={strictBlocked}>只复制</button>
              <button onClick={() => setShowAlternatives((current) => !current)} aria-expanded={showAlternatives}>
                {showAlternatives ? "收起备选" : "换一种说法"}
              </button>
              <button onClick={() => setShowSources((current) => !current)} aria-expanded={showSources}>
                {showSources ? "收起依据" : `查看依据 ${scenario.sources.length}`}
              </button>
            </div>

            {showAlternatives && (
              <div className="expand-panel">
                <h3>备选处理</h3>
                {scenario.alternatives.map((alternative, index) => (
                  <div className="alternative" key={alternative}>
                    <span>{index + 1}</span><p>{alternative}</p>
                  </div>
                ))}
              </div>
            )}

            {showSources && (
              <div className="expand-panel sources">
                <h3>原文依据</h3>
                {scenario.sources.length === 0 ? (
                  <p className="empty-note">没有可引用的原文。任何具体内容都应标记为 AI 新编。</p>
                ) : (
                  scenario.sources.map((source) => (
                    <blockquote key={source.location}>
                      <p>“{source.excerpt}”</p>
                      <footer>{source.title} · {source.location}</footer>
                    </blockquote>
                  ))
                )}
              </div>
            )}
          </article>
          <p className="status-message" aria-live="polite">{feedback}</p>
        </section>

        <aside className="session-sidebar" aria-label="本场控制">
          <section className="side-card">
            <div className="side-card-heading">
              <div><span className="eyebrow">本场状态</span><h2>主持人备忘</h2></div>
              <span className="count-pill">{pendingCount}</span>
            </div>
            <dl className="session-metrics">
              <div><dt>未回答问题</dt><dd>2</dd></div>
              <div><dt>候选行动</dt><dd>3</dd></div>
              <div><dt>连续性提醒</dt><dd>1</dd></div>
            </dl>
          </section>

          <section className="side-card provenance-legend">
            <span className="eyebrow">来源标记</span>
            <div><strong>原文摘录</strong><p>剧本中可逐字定位</p></div>
            <div><strong>AI 拟词</strong><p>事实有依据，措辞是新写的</p></div>
            <div><strong>AI 新编</strong><p>剧本没有，采用前需确认</p></div>
          </section>

          <section className="side-card bgm-card">
            <span className="eyebrow">氛围建议</span>
            <h2>码头 · 暗潮</h2>
            <p>低沉弦乐、远处雾笛。只做手动建议，不会监听对话自动切歌。</p>
            <button
              className="bgm-control"
              onClick={() => {
                setBgmPlaying((current) => !current);
                setFeedback(bgmPlaying ? "BGM 试听已停止。" : "正在模拟试听 BGM 建议。");
              }}
              aria-pressed={bgmPlaying}
            >
              <span aria-hidden="true">{bgmPlaying ? "■" : "▶"}</span>
              {bgmPlaying ? "停止模拟试听" : "模拟试听"}
            </button>
          </section>

          <section className="side-card review-summary">
            <span className="eyebrow">团后待确认</span>
            <h2>{pendingCount} 条待复盘事项</h2>
            <p>{pendingRecordCount} 条临场内容 · {pendingConsultationCount} 条 AI 咨询；两者都不会自动成为正式设定。</p>
            <button className="secondary-action" onClick={() => setActiveView("archive")}>
              打开场次档案
            </button>
          </section>
        </aside>
        </main>
      ) : activeView === "archive" ? (
        <SessionArchivePanel
          campaignId={CURRENT_CAMPAIGN_ID}
          records={records}
          onConfirmRecord={handleConfirmRecord}
          onReturnToConsultation={focusCurrentCampaign}
        />
      ) : null}

      <LoreCueAiAssistant
        key={`${aiOpen}-${aiProjectId}-${aiScope}-${aiPrompt}`}
        open={aiOpen}
        initialPrompt={aiPrompt}
        projectId={aiProjectId}
        scope={aiScope}
        campaignContext={activeView === "consultation" ? {
          campaignId: CURRENT_CAMPAIGN_ID,
          campaignTitle: CURRENT_CAMPAIGN_TITLE,
          sessionId: CURRENT_SESSION_ID,
          sessionLabel: CURRENT_SESSION_LABEL,
        } : undefined}
        onClose={() => setAiOpen(false)}
      />
    </div>
  );
}
