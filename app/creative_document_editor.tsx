"use client";

import { useMemo, useRef, useState } from "react";
import type { LoreCueAssetRecord } from "./lorecue_asset_store";
import { useProjectAssets } from "./use_project_assets";

type EditorMode = "编辑" | "专注模式" | "阅读预览";
type PageWidth = "窄页" | "标准" | "宽页";

export interface WritingMetadata {
  status: "草稿" | "修订中" | "定稿";
  pov: string;
  location: string;
  timeline: string;
}

interface CreativeDocumentEditorProps {
  projectId: string;
  projectTitle: string;
  documentTitle: string;
  body: string;
  metadata: WritingMetadata;
  saveState: "已保存" | "保存中" | "尚未保存";
  onChangeTitle: (title: string) => void;
  onChangeBody: (body: string) => void;
  onChangeMetadata: (metadata: WritingMetadata) => void;
  onSave: () => void;
  onAskAi: (prompt: string) => void;
  onFeedback: (message: string) => void;
}

const aiOriginal = "伊芙琳把那册发霉的值班记录推过桌面。";
const aiSuggestion = "伊芙琳没有立刻开口，只把那册发霉的值班记录推过桌面。";

export function CreativeDocumentEditor({
  projectId,
  projectTitle,
  documentTitle,
  body,
  metadata,
  saveState,
  onChangeTitle,
  onChangeBody,
  onChangeMetadata,
  onSave,
  onAskAi,
  onFeedback,
}: CreativeDocumentEditorProps) {
  const [mode, setMode] = useState<EditorMode>("编辑");
  const [pageWidth, setPageWidth] = useState<PageWidth>("标准");
  const [showMaterials, setShowMaterials] = useState(false);
  const [showAiDiff, setShowAiDiff] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findTerm, setFindTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const projectAssets = useProjectAssets(projectId);
  const wordCount = useMemo(() => body.replace(/\s/g, "").length, [body]);
  const paragraphs = useMemo(() => body.split(/\n{2,}/).filter(Boolean), [body]);
  const matchCount = useMemo(() => findTerm ? body.split(findTerm).length - 1 : 0, [body, findTerm]);

  function insertMarkup(prefix: string, suffix = "", placeholder = "文字") {
    const textarea = editorRef.current;
    if (!textarea) {
      onChangeBody(`${body}${prefix}${placeholder}${suffix}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = body.slice(start, end) || placeholder;
    const next = `${body.slice(0, start)}${prefix}${selection}${suffix}${body.slice(end)}`;
    onChangeBody(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selection.length);
    });
  }

  function insertMaterial(material: LoreCueAssetRecord) {
    const reference = `\n\n[引用素材：${material.title}](lorecue-asset://${material.id})`;
    onChangeBody(`${body}${reference}`);
    setShowMaterials(false);
    onFeedback(`已插入“${material.title}”的稳定引用 ${material.id}；没有复制或修改原始素材。`);
  }

  function acceptAiSuggestion() {
    const next = body.includes(aiOriginal) ? body.replace(aiOriginal, aiSuggestion) : `${body}\n\n${aiSuggestion}`;
    onChangeBody(next);
    setShowAiDiff(false);
    onFeedback("已接受这一处 AI 修改；变更仍会进入自动保存与版本记录。");
  }

  function replaceAllMatches() {
    if (!findTerm) {
      onFeedback("请先输入要查找的文字。");
      return;
    }
    if (!matchCount) {
      onFeedback(`当前文档没有找到“${findTerm}”。`);
      return;
    }
    onChangeBody(body.split(findTerm).join(replaceTerm));
    onFeedback(`已替换 ${matchCount} 处；修改仍可在保存前继续检查。`);
  }

  function exportMarkdown() {
    const safeName = documentTitle.replace(/[\\/:*?"<>|]/g, "-") || "未命名文档";
    const file = new Blob([`# ${documentTitle}\n\n${body}`], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeName}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    onFeedback(`已导出“${safeName}.md”；浏览器草稿保持不变。`);
  }

  return (
    <section className={`writing-canvas enhanced-editor ${mode === "专注模式" ? "focus-mode" : ""}`}>
      <header className="editor-command-bar">
        <div><span className="eyebrow">当前文档 · Markdown</span><h2>{documentTitle}</h2></div>
        <div className="editor-status-cluster"><span className={`save-state state-${saveState}`}>{saveState}</span><span>{wordCount} 字</span><button onClick={exportMarkdown}>导出 .md</button><button className="primary-action" onClick={onSave}>立即保存</button></div>
      </header>

      <div className="editor-mode-row">
        <nav aria-label="编辑模式">{(["编辑", "专注模式", "阅读预览"] as EditorMode[]).map((item) => <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>{item}</button>)}</nav>
        <label>页面宽度<select value={pageWidth} onChange={(event) => setPageWidth(event.target.value as PageWidth)}><option>窄页</option><option>标准</option><option>宽页</option></select></label>
      </div>

      {mode !== "阅读预览" && <div className="markdown-toolbar" aria-label="Markdown 格式工具">
        <button onClick={() => insertMarkup("## ", "", "小标题")}>H2</button>
        <button onClick={() => insertMarkup("**", "**", "强调内容")}><b>B</b></button>
        <button onClick={() => insertMarkup("*", "*", "强调内容")}><i>I</i></button>
        <button onClick={() => insertMarkup("> ", "", "引用内容")}>引用</button>
        <button onClick={() => insertMarkup("— “", "”", "对白")}>对白</button>
        <button className={showFindReplace ? "active" : ""} onClick={() => setShowFindReplace((current) => !current)}>查找替换</button>
        <span />
        <div className="material-insert-wrap"><button onClick={() => setShowMaterials((current) => !current)} aria-expanded={showMaterials}>插入素材 {projectAssets.length}</button>{showMaterials && <div className="material-insert-menu"><strong>当前项目已明确引用</strong>{projectAssets.map((material) => <button key={material.id} onClick={() => insertMaterial(material)}><span>{material.kind} · {material.visibility}</span><b>{material.title}</b><small>{material.hasBinary ? "本地源文件可用" : "演示元数据"}</small></button>)}{projectAssets.length === 0 && <p>当前项目还没有明确引用的资料。请先到资料库建立引用。</p>}<small>这里只写入稳定素材 ID，不复制原文件；取消项目引用后，旧文档标记仍保留用于溯源。</small></div>}</div>
        <button className="ai-review-button" onClick={() => setShowAiDiff(true)}>AI 修改预览</button>
      </div>}

      {mode !== "阅读预览" && showFindReplace && <section className="find-replace-panel" aria-label="文内查找替换">
        <label>查找<input value={findTerm} onChange={(event) => setFindTerm(event.target.value)} placeholder="输入原文" /></label>
        <span>{findTerm ? `${matchCount} 处匹配` : "等待输入"}</span>
        <label>替换为<input value={replaceTerm} onChange={(event) => setReplaceTerm(event.target.value)} placeholder="输入新文字" /></label>
        <button onClick={replaceAllMatches} disabled={!findTerm || matchCount === 0}>全部替换</button>
      </section>}

      <section className="writing-metadata-bar" aria-label="场景元数据">
        <label>状态<select value={metadata.status} onChange={(event) => onChangeMetadata({ ...metadata, status: event.target.value as WritingMetadata["status"] })}><option>草稿</option><option>修订中</option><option>定稿</option></select></label>
        <label>视角<input value={metadata.pov} onChange={(event) => onChangeMetadata({ ...metadata, pov: event.target.value })} placeholder="人物 / 叙述视角" /></label>
        <label>地点<input value={metadata.location} onChange={(event) => onChangeMetadata({ ...metadata, location: event.target.value })} placeholder="场景地点" /></label>
        <label>故事时间<input value={metadata.timeline} onChange={(event) => onChangeMetadata({ ...metadata, timeline: event.target.value })} placeholder="日期 / 阶段" /></label>
      </section>

      <label className={`editor-title page-${pageWidth}`}>
        <span className="sr-only">文档标题</span>
        <input value={documentTitle} onChange={(event) => onChangeTitle(event.target.value)} />
      </label>

      {mode === "阅读预览" ? <article className={`markdown-preview page-${pageWidth}`}><header><span>{projectTitle}</span><h1>{documentTitle}</h1></header>{paragraphs.map((paragraph, index) => paragraph.startsWith("## ") ? <h2 key={`${paragraph}-${index}`}>{paragraph.slice(3)}</h2> : paragraph.startsWith("> ") ? <blockquote key={`${paragraph}-${index}`}>{paragraph.slice(2)}</blockquote> : <p key={`${paragraph}-${index}`}>{paragraph.replace(/\*\*/g, "")}</p>)}</article> : <label className={`editor-body page-${pageWidth}`}><span className="sr-only">正文内容</span><textarea ref={editorRef} value={body} onChange={(event) => onChangeBody(event.target.value)} spellCheck /></label>}

      {showAiDiff && <aside className="ai-edit-review" aria-label="AI 修改预览">
        <header><div><span className="eyebrow">AI 修改预览</span><h3>让动作先于说明，增强人物克制感</h3></div><button aria-label="关闭 AI 修改预览" onClick={() => setShowAiDiff(false)}>×</button></header>
        <p>AI 只能提出候选修改，不会直接覆盖正文。接受前可以逐字比较。</p>
        <div className="ai-edit-diff"><article><span>原文</span><del>{aiOriginal}</del></article><article><span>建议</span><ins>{aiSuggestion}</ins></article></div>
        <footer><button onClick={() => { setShowAiDiff(false); onFeedback("已保留原文，没有写入 AI 建议。"); }}>保留原文</button><button onClick={() => onAskAi(`为“${documentTitle}”提供另一种克制的改写，只返回差异建议`)}>询问另一版</button><button className="primary-action" onClick={acceptAiSuggestion}>接受修改</button></footer>
      </aside>}
    </section>
  );
}
