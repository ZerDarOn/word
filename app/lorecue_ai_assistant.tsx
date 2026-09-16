"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

type AiMode = "查设定" | "创作协作" | "冲突检查" | "GM 救场";
type SourceKind = "source" | "session" | "private" | "live";

interface LoreCueAiAssistantProps {
  open: boolean;
  initialPrompt: string;
  scope: string;
  onClose: () => void;
}

interface ContextSource {
  id: string;
  label: string;
  detail: string;
  kind: SourceKind;
  defaultSelected: boolean;
}

const contextSources: ContextSource[] = [
  { id: "current", label: "当前条目", detail: "正在查看的场景与段落", kind: "source", defaultSelected: true },
  { id: "character", label: "角色档案", detail: "公开信息与主持人秘密分开读取", kind: "private", defaultSelected: true },
  { id: "session", label: "当前场次", detail: "已确认记录与临场内容", kind: "session", defaultSelected: true },
  { id: "project", label: "项目设定库", detail: "世界观、地点、组织与线索", kind: "source", defaultSelected: false },
];

const kindLabels: Record<SourceKind, string> = {
  source: "原文",
  session: "场次",
  private: "含秘密",
  live: "现场输入",
};

const speakers = ["主持人视角", "伊芙琳", "斯诺森", "不代入角色"];

export function LoreCueAiAssistant({
  open,
  initialPrompt,
  scope,
  onClose,
}: LoreCueAiAssistantProps) {
  const [mode, setMode] = useState<AiMode>("查设定");
  const [question, setQuestion] = useState(initialPrompt);
  const [liveContext, setLiveContext] = useState("");
  const [speaker, setSpeaker] = useState(speakers[0]);
  const [selectedSources, setSelectedSources] = useState(() =>
    contextSources.filter((source) => source.defaultSelected).map((source) => source.id),
  );
  const [hasAnswer, setHasAnswer] = useState(Boolean(initialPrompt));
  const [showAdoptionReview, setShowAdoptionReview] = useState(false);
  const [adoptionStatus, setAdoptionStatus] = useState<"idle" | "pending">("idle");
  const [feedback, setFeedback] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeSources = useMemo(
    () => contextSources.filter((source) => selectedSources.includes(source.id)),
    [selectedSources],
  );

  const knowledgeBoundary = speaker === "伊芙琳"
    ? {
        allowed: "知道斯诺森在码头卸货、接近下班，也能描述其外貌。",
        blocked: "现有资料没有证明她知道住址、上下班路线或幕后身份。",
      }
    : speaker === "斯诺森"
      ? {
          allowed: "可以按角色本人经历回答工作与当日行动。",
          blocked: "不能自动知道调查者掌握的线索或主持人秘密。",
        }
      : {
          allowed: "可综合所选资料，但回答仍需逐项标注依据层级。",
          blocked: "未选择的项目、其他团历史和未贴入的对话不会被视为上下文。",
        };

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
    return () => previousFocus?.focus();
  }, [open]);

  function toggleSource(sourceId: string) {
    setSelectedSources((current) => current.includes(sourceId)
      ? current.filter((id) => id !== sourceId)
      : [...current, sourceId]);
    setHasAnswer(false);
    setShowAdoptionReview(false);
    setFeedback("");
  }

  function handleAskAi() {
    if (!question.trim()) return;
    setHasAnswer(true);
    setShowAdoptionReview(false);
    setAdoptionStatus("idle");
    setFeedback(`已按 ${activeSources.length} 份已选资料${liveContext.trim() ? "和手动现场输入" : ""}生成演示建议。`);
  }

  async function handleCopy() {
    const answer = "伊芙琳知道斯诺森在码头卸货，但现有资料没有写明他的住址。她可以提供外貌、工种和下班时间；具体住址需要调查，或由主持人临场补全。";
    try {
      await navigator.clipboard.writeText(answer);
      setFeedback("建议已复制；来源标签不会因此写入项目。 ");
    } catch {
      setFeedback("浏览器未允许复制，请手动选中建议文本。 ");
    }
  }

  function handleConfirmDraft() {
    setAdoptionStatus("pending");
    setShowAdoptionReview(false);
    setFeedback(mode === "GM 救场"
      ? "已加入本场待确认记录；团后仍需决定是否升级为正式设定。"
      : "已加入待确认草稿；没有覆盖原文或角色档案。");
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      onClose();
      return;
    }
    if (event.key !== "Tab") return;

    const controls = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        "button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])",
      ),
    );
    const first = controls[0];
    const last = controls.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!open) return null;

  return (
    <div className="ai-layer" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <aside
        className="ai-assistant"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-assistant-title"
        onKeyDown={handleDialogKeyDown}
      >
        <header>
          <div><span className="eyebrow">LoreCue AI</span><h2 id="ai-assistant-title">只在你指定的故事里思考</h2></div>
          <button className="close-icon-button" onClick={onClose} aria-label="关闭 AI 助手">×</button>
        </header>

        <section className="ai-scope">
          <span>当前检索范围 · 项目硬边界</span>
          <strong>{scope}</strong>
          <small>不会读取其他创作项目或团历史；下方还可继续缩小范围</small>
        </section>

        <div className="ai-mode-switcher" aria-label="AI 协作模式">
          {(["查设定", "创作协作", "冲突检查", "GM 救场"] as AiMode[]).map((item) => (
            <button className={mode === item ? "active" : ""} key={item} onClick={() => {
              setMode(item);
              setHasAnswer(false);
              setShowAdoptionReview(false);
            }}>{item}</button>
          ))}
        </div>

        <section className="ai-context-builder" aria-labelledby="ai-context-title">
          <div className="ai-section-heading">
            <div><span className="eyebrow">01 · 上下文清单</span><h3 id="ai-context-title">这次允许 AI 看什么</h3></div>
            <span>{activeSources.length}/{contextSources.length} 已选</span>
          </div>
          <div className="ai-source-grid">
            {contextSources.map((source) => (
              <label className={selectedSources.includes(source.id) ? "selected" : ""} key={source.id}>
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source.id)}
                  onChange={() => toggleSource(source.id)}
                />
                <span><strong>{source.label}</strong><small>{source.detail}</small></span>
                <em className={`context-kind ${source.kind}`}>{kindLabels[source.kind]}</em>
              </label>
            ))}
          </div>
          <label className="ai-live-context">
            <span>手动现场输入 <small>不会假装是剧本原文</small></span>
            <textarea
              value={liveContext}
              onChange={(event) => {
                setLiveContext(event.target.value);
                setHasAnswer(false);
              }}
              placeholder="可粘贴玩家原话、刚发生的行动或临时状态……"
              rows={3}
            />
          </label>
        </section>

        <section className="ai-boundary-builder" aria-labelledby="ai-boundary-title">
          <div className="ai-section-heading">
            <div><span className="eyebrow">02 · 视角约束</span><h3 id="ai-boundary-title">谁要说这句话</h3></div>
          </div>
          <label className="ai-speaker-select">
            <span>回答视角</span>
            <select value={speaker} onChange={(event) => {
              setSpeaker(event.target.value);
              setHasAnswer(false);
            }}>
              {speakers.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <div className="knowledge-boundary-preview">
            <div><span>允许知道</span><p>{knowledgeBoundary.allowed}</p></div>
            <div className="blocked"><span>禁止越界</span><p>{knowledgeBoundary.blocked}</p></div>
          </div>
        </section>

        <label className="ai-question">
          <span>03 · {mode === "GM 救场" ? "把玩家的问题或你卡住的地方贴进来" : "你想确认或继续创作什么？"}</span>
          <textarea
            ref={inputRef}
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              setHasAnswer(false);
            }}
            placeholder="例如：伊芙琳是否知道斯诺森住在哪里？"
            rows={4}
          />
        </label>

        <div className="ai-request-manifest">
          <span>本次将使用</span>
          <strong>{activeSources.length} 份项目资料 · {speaker}{liveContext.trim() ? " · 1 份现场输入" : ""}</strong>
          {activeSources.length === 0 && !liveContext.trim() && <small>未选择资料：结果只能作为无依据的新编。</small>}
        </div>
        <button className="ai-submit" onClick={handleAskAi} disabled={!question.trim()}>生成带依据的建议</button>

        {hasAnswer ? (
          <section className="ai-answer" aria-live="polite">
            <div className="ai-answer-heading">
              <span className="evidence-badge inferred">合理推断</span>
              <small>交互演示 · 未调用真实 AI</small>
            </div>
            <p>伊芙琳知道斯诺森在码头卸货，但现有资料没有写明他的住址。她可以提供外貌、工种和下班时间；具体住址需要调查，或由主持人临场补全。</p>

            <div className="ai-used-context">
              <strong>实际采用的上下文</strong>
              <div>{activeSources.map((source) => <span key={source.id}>{source.label}</span>)}</div>
              {liveContext.trim() && <p><em>现场输入</em>{liveContext}</p>}
            </div>

            <div className="ai-provenance-stack">
              <article><span className="source-tone source">原文依据</span><p>“斯诺森现在在萨菲港的码头卸货，现在快要下班了。”</p><small>场次档案 · 第 3 次团 · 17:00:06</small></article>
              <article><span className="source-tone inference">合理推断</span><p>伊芙琳能提供码头位置与外貌，因为这些信息已经由她在场景中交代。</p><small>基于上述原文，不新增事实</small></article>
              <article><span className="source-tone created">AI 新编 · 未采用</span><p>如果补充“他住在东区工棚”，这属于原资料没有的新事实。</p><small>不会自动写回设定或场次</small></article>
            </div>

            <div className="ai-boundary-result">
              <strong>知识边界检查</strong>
              <p><span>{speaker}</span> 不应把斯诺森的住址说成已知事实；建议改为提供可调查的方向。</p>
            </div>

            <div className="ai-answer-actions">
              <button onClick={handleCopy}>只复制建议</button>
              <button className="primary-action" onClick={() => setShowAdoptionReview(true)}>采用为草稿</button>
            </div>

            {showAdoptionReview && (
              <div className="ai-adoption-review">
                <div><span className="eyebrow">写入前确认</span><strong>{mode === "GM 救场" ? "加入本场待确认记录" : "加入待确认草稿"}</strong></div>
                <p>只保存建议和来源标记，不覆盖原文；其中“AI 新编”会保持醒目标识。</p>
                <div>
                  <button onClick={() => setShowAdoptionReview(false)}>取消</button>
                  <button className="primary-action" onClick={handleConfirmDraft}>确认加入</button>
                </div>
              </div>
            )}
            {adoptionStatus === "pending" && <p className="ai-pending-note">已进入待确认区 · 尚未成为正式设定</p>}
          </section>
        ) : (
          <section className="ai-empty">
            <strong>AI 不会自己猜当前进度</strong>
            <p>它只读取你勾选的资料和主动贴入的现场信息；语音与群聊接入以后也应先由主持人确认。</p>
          </section>
        )}
        <p className="ai-feedback" aria-live="polite">{feedback}</p>
      </aside>
    </div>
  );
}
