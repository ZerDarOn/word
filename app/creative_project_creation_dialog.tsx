"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  projectBlueprints,
  type CreativeKind,
  type CreativeProject,
  type CreativeRulesSystem,
} from "./creative_project_data";

const rulesSystems: CreativeRulesSystem[] = ["系统无关", "D&D 5e", "CoC 7e", "CoJ", "无限", "自定义"];

interface CreativeProjectCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (project: CreativeProject) => void;
}

export function CreativeProjectCreationDialog({
  open,
  onClose,
  onCreate,
}: CreativeProjectCreationDialogProps) {
  const [kind, setKind] = useState<CreativeKind>("小说");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [rulesSystem, setRulesSystem] = useState<CreativeRulesSystem>("系统无关");
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    if (open) window.setTimeout(() => titleRef.current?.focus(), 0);
    return () => previousFocus?.focus();
  }, [open]);

  if (!open) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError("请先给这个创作项目一个名字。");
      return;
    }
    onCreate({
      id: `creative-${Date.now()}`,
      kind,
      rulesSystem: kind === "跑团模组" ? rulesSystem : undefined,
      title: title.trim(),
      summary: summary.trim() || "刚刚建立的创作项目，等待写下第一段内容。",
      progress: "从空白开始",
      updatedAt: "刚刚",
      documentCount: 1,
      warningCount: 0,
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
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

  return (
    <div className="creation-dialog-layer" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <form
        className="creation-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="creation-dialog-title"
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
      >
        <header>
          <div><span className="eyebrow">新建创作项目</span><h2 id="creation-dialog-title">选择创作类型</h2></div>
          <button type="button" className="close-icon-button" onClick={onClose} aria-label="关闭新建项目">×</button>
        </header>
        <div className="creation-kind-grid" role="radiogroup" aria-label="创作类型">
          {projectBlueprints.map((blueprint) => (
            <button
              type="button"
              role="radio"
              aria-checked={kind === blueprint.kind}
              className={kind === blueprint.kind ? "active" : ""}
              key={blueprint.kind}
              onClick={() => setKind(blueprint.kind)}
            >
              <strong>{blueprint.kind}</strong>
              <span>{blueprint.structureLabel}</span>
              <small>{blueprint.description}</small>
            </button>
          ))}
        </div>
        <div className="creation-fields">
          <label htmlFor="creative-title">项目名称</label>
          <input
            id="creative-title"
            ref={titleRef}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setError("");
            }}
            placeholder="例如：雾港来信"
            aria-describedby={error ? "creative-title-error" : undefined}
          />
          <label htmlFor="creative-summary">一句话简介</label>
          <textarea
            id="creative-summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="可以稍后再写"
            rows={3}
          />
          {kind === "跑团模组" && (
            <>
              <label htmlFor="creative-rules-system">规则系统</label>
              <select
                id="creative-rules-system"
                value={rulesSystem}
                onChange={(event) => setRulesSystem(event.target.value as CreativeRulesSystem)}
              >
                {rulesSystems.map((system) => <option key={system}>{system}</option>)}
              </select>
            </>
          )}
          {error && <p id="creative-title-error" className="creation-error" role="alert">{error}</p>}
        </div>
        <footer>
          <span>从空白开始 · 结构可随时调整</span>
          <div><button type="button" onClick={onClose}>取消</button><button className="primary-action" type="submit">创建项目</button></div>
        </footer>
      </form>
    </div>
  );
}
