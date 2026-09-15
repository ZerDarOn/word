"use client";

import { useMemo, useRef, useState } from "react";

type EditorMode = "编辑" | "专注模式" | "阅读预览";
type PageWidth = "窄页" | "标准" | "宽页";

interface CreativeDocumentEditorProps {
  projectTitle: string;
  documentTitle: string;
  body: string;
  saveState: "已保存" | "保存中" | "尚未保存";
  onChangeTitle: (title: string) => void;
  onChangeBody: (body: string) => void;
  onSave: () => void;
  onAskAi: (prompt: string) => void;
  onFeedback: (message: string) => void;
}

const aiOriginal = "伊芙琳把那册发霉的值班记录推过桌面。";
const aiSuggestion = "伊芙琳没有立刻开口，只把那册发霉的值班记录推过桌面。";

export function CreativeDocumentEditor({
  projectTitle,
  documentTitle,
  body,
  saveState,
  onChangeTitle,
  onChangeBody,
  onSave,
  onAskAi,
  onFeedback,
}: CreativeDocumentEditorProps) {
  const [mode, setMode] = useState<EditorMode>("编辑");
  const [pageWidth, setPageWidth] = useState<PageWidth>("标准");
  const [showMaterials, setShowMaterials] = useState(false);
  const [showAiDiff, setShowAiDiff] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const wordCount = useMemo(() => body.replace(/\s/g, "").length, [body]);
  const paragraphs = useMemo(() => body.split(/\n{2,}/).filter(Boolean), [body]);

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

  function insertMaterial(material: string) {
    const reference = `\n\n[引用素材：${material}]`;
    onChangeBody(`${body}${reference}`);
    setShowMaterials(false);
    onFeedback(`已插入“${material}”的引用标记；没有复制或修改原始素材。`);
  }

  function acceptAiSuggestion() {
    const next = body.includes(aiOriginal) ? body.replace(aiOriginal, aiSuggestion) : `${body}\n\n${aiSuggestion}`;
    onChangeBody(next);
    setShowAiDiff(false);
    onFeedback("已接受这一处 AI 修改；变更仍会进入自动保存与版本记录。");
  }

  return (
    <section className={`writing-canvas enhanced-editor ${mode === "专注模式" ? "focus-mode" : ""}`}>
      <header className="editor-command-bar">
        <div><span className="eyebrow">当前文档 · Markdown</span><h2>{documentTitle}</h2></div>
        <div className="editor-status-cluster"><span className={`save-state state-${saveState}`}>{saveState}</span><span>{wordCount} 字</span><button className="primary-action" onClick={onSave}>立即保存</button></div>
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
        <span />
        <div className="material-insert-wrap"><button onClick={() => setShowMaterials((current) => !current)} aria-expanded={showMaterials}>插入素材</button>{showMaterials && <div className="material-insert-menu"><strong>当前项目已引用</strong>{["伊芙琳 · 立绘", "萨菲港 · 码头地图", "码头 · 暗潮 BGM"].map((material) => <button key={material} onClick={() => insertMaterial(material)}>{material}</button>)}<small>这里只插入引用，不复制原文件。</small></div>}</div>
        <button className="ai-review-button" onClick={() => setShowAiDiff(true)}>AI 修改预览</button>
      </div>}

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
