"use client";

import { useMemo, useState } from "react";
import {
  prototypeScenarios,
  type ConsultationMode,
  type PrototypeScenario,
  type RecordKind,
} from "./prototype_scenarios";

type ReviewStatus = "待确认" | "客观事实" | "NPC 主张" | "仅本场" | "废弃";

type SessionRecord = {
  id: number;
  text: string;
  kind: RecordKind;
  scenario: string;
  status: ReviewStatus;
};

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
  const [selectedId, setSelectedId] = useState(prototypeScenarios[0].id);
  const [mode, setMode] = useState<ConsultationMode>("minimal");
  const [question, setQuestion] = useState(prototypeScenarios[0].question);
  const [showSources, setShowSources] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [bgmPlaying, setBgmPlaying] = useState(false);
  const [feedback, setFeedback] = useState("选择一个棘手情况，看看咨询台如何拆解。");
  const [records, setRecords] = useState<SessionRecord[]>([
    {
      id: 1,
      text: "伊芙琳撒谎时左手出现轻微震颤。",
      kind: "happened",
      scenario: "临场加了一个紧张动作",
      status: "待确认",
    },
  ]);

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
    setRecords((current) => [nextRecord, ...current]);
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
    setRecords((current) =>
      current.map((record) => (record.id === id ? { ...record, status } : record)),
    );
    setFeedback(`团后归档已更新为“${status}”。`);
  }

  const pendingCount = records.filter((record) => record.status === "待确认").length;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#consultation-result">跳到咨询结果</a>

      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">LC</span>
          <div><strong>LoreCue</strong><span>叙事线索台</span></div>
        </div>
        <div className="project-switcher" aria-label="当前项目">
          <span>当前项目</span>
          <strong>萨菲港旧案</strong>
          <small>第 3 次团 · 码头追踪</small>
        </div>
        <div className="session-state">
          <span className="live-dot" aria-hidden="true" />
          本场辅助模式
        </div>
      </header>

      <main className="workspace">
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
            <h2>{pendingCount} 条临场内容</h2>
            <p>已说出口或已经发生，不等于原剧本就是这样写的。</p>
            <button className="secondary-action" onClick={() => setShowReview((current) => !current)}>
              {showReview ? "关闭归档台" : "打开归档台"}
            </button>
          </section>
        </aside>
      </main>

      {showReview && (
        <section className="review-drawer" aria-label="团后归档台">
          <div className="review-intro">
            <span className="eyebrow">团后整理</span>
            <h2>把口胡变成可追踪的历史</h2>
            <p>先承认它在桌上发生过，再决定是否进入长期设定。</p>
          </div>
          <div className="record-list">
            {records.length === 0 ? (
              <p className="empty-note">还没有使用过任何建议。</p>
            ) : (
              records.map((record) => (
                <article className="record-item" key={record.id}>
                  <div>
                    <span className="record-kind">{record.kind === "spoken" ? "实际说出" : "实际发生"}</span>
                    <h3>{record.text}</h3>
                    <p>来自：{record.scenario}</p>
                  </div>
                  <label>
                    归档为
                    <select
                      value={record.status}
                      onChange={(event) => handleConfirmRecord(record.id, event.target.value as ReviewStatus)}
                    >
                      <option>待确认</option>
                      <option>客观事实</option>
                      <option>NPC 主张</option>
                      <option>仅本场</option>
                      <option>废弃</option>
                    </select>
                  </label>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
