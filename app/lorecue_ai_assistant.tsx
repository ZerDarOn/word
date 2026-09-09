"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type AiMode = "查设定" | "创作协作" | "冲突检查" | "GM 救场";

interface LoreCueAiAssistantProps {
  open: boolean;
  initialPrompt: string;
  scope: string;
  onClose: () => void;
}

export function LoreCueAiAssistant({
  open,
  initialPrompt,
  scope,
  onClose,
}: LoreCueAiAssistantProps) {
  const [mode, setMode] = useState<AiMode>("查设定");
  const [question, setQuestion] = useState(initialPrompt);
  const [hasAnswer, setHasAnswer] = useState(Boolean(initialPrompt));
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
    return () => previousFocus?.focus();
  }, [open]);

  function handleAskAi() {
    if (!question.trim()) return;
    setHasAnswer(true);
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
          <span>当前检索范围</span>
          <strong>{scope}</strong>
          <small>不会读取其他创作项目或团历史</small>
        </section>
        <div className="ai-mode-switcher" aria-label="AI 协作模式">
          {(["查设定", "创作协作", "冲突检查", "GM 救场"] as AiMode[]).map((item) => (
            <button className={mode === item ? "active" : ""} key={item} onClick={() => setMode(item)}>{item}</button>
          ))}
        </div>
        <label className="ai-question">
          <span>{mode === "GM 救场" ? "把玩家的问题或你卡住的地方贴进来" : "你想确认或继续创作什么？"}</span>
          <textarea
            ref={inputRef}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="例如：伊芙琳是否知道斯诺森住在哪里？"
            rows={4}
          />
        </label>
        <button className="ai-submit" onClick={handleAskAi}>生成带依据的建议</button>

        {hasAnswer ? (
          <section className="ai-answer" aria-live="polite">
            <div className="ai-answer-heading">
              <span className="evidence-badge inferred">合理推断</span>
              <small>演示回答 · 未调用真实 AI</small>
            </div>
            <p>伊芙琳知道斯诺森在码头卸货，但现有资料没有写明他的住址。她可以提供外貌、工种和下班时间；具体住址需要调查，或由主持人临场补全。</p>
            <div className="ai-provenance-stack">
              <article><span className="source-tone source">原文依据</span><p>“斯诺森现在在萨菲港的码头卸货，现在快要下班了。”</p><small>场次档案 · 第 3 次团 · 17:00:06</small></article>
              <article><span className="source-tone inference">合理推断</span><p>伊芙琳能提供码头位置与外貌，因为这些信息已经由她在场景中交代。</p><small>基于上述原文，不新增事实</small></article>
              <article><span className="source-tone created">AI 新编</span><p>如果补充“他住在东区工棚”，这属于原资料没有的新事实。</p><small>不会自动写回设定或场次</small></article>
            </div>
            <div className="ai-answer-actions">
              <button>只复制</button>
              <button className="primary-action">采用为草稿</button>
            </div>
          </section>
        ) : (
          <section className="ai-empty">
            <strong>AI 不会自己猜当前进度</strong>
            <p>它只读取你选择的项目和主动贴入的现场信息；语音与群聊接入以后也应先由主持人确认。</p>
          </section>
        )}
      </aside>
    </div>
  );
}
