"use client";

import { useMemo, useState } from "react";

type InspectorTab = "检查" | "引用" | "备注";

interface CreativeWritingInspectorProps {
  documentTitle: string;
  body: string;
  note: string;
  onChangeNote: (note: string) => void;
  onAskAi: (prompt: string) => void;
  onFeedback: (message: string) => void;
}

const availableReferences = [
  { kind: "人物卡", title: "伊芙琳 · 港务官", detail: "动机、语气与知情范围" },
  { kind: "地点卡", title: "萨菲港 · 港务处", detail: "开放时间与空间规则" },
  { kind: "视觉素材", title: "萨菲港 · 码头地图", detail: "项目内已引用" },
];

export function CreativeWritingInspector({
  documentTitle,
  body,
  note,
  onChangeNote,
  onAskAi,
  onFeedback,
}: CreativeWritingInspectorProps) {
  const [activeTab, setActiveTab] = useState<InspectorTab>("检查");
  const outline = useMemo(() => body.split("\n").flatMap((line, index) => {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    return match ? [{ level: match[1].length, title: match[2], line: index + 1 }] : [];
  }), [body]);
  const usedReferences = useMemo(() => Array.from(body.matchAll(/\[引用素材：([^\]]+)\]/g), (match) => match[1]), [body]);
  const hasTimeAmbiguity = body.includes("雨停以后");
  const hasEchoPhrase = body.includes("从来没有来过");
  const issueCount = Number(hasTimeAmbiguity) + Number(hasEchoPhrase);

  return (
    <aside className="writing-inspector active-writing-inspector">
      <div className="inspector-tabs" aria-label="写作检查栏">
        {(["检查", "引用", "备注"] as InspectorTab[]).map((tab) => (
          <button className={activeTab === tab ? "active" : ""} aria-pressed={activeTab === tab} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>

      <section className="document-outline-panel">
        <div><span className="eyebrow">当前文档大纲</span><small>{outline.length} 个标题</small></div>
        <h2>{documentTitle}</h2>
        {outline.length > 0 ? (
          <ol>{outline.map((item) => <li className={`level-${item.level}`} key={`${item.line}-${item.title}`}><button onClick={() => onFeedback(`已定位到第 ${item.line} 行：${item.title}`)}>{item.title}<small>L{item.line}</small></button></li>)}</ol>
        ) : <p>正文尚未使用 Markdown 标题；文档标题作为当前根节点。</p>}
      </section>

      {activeTab === "检查" && (
        <div className="inspector-tab-content">
          <section className="inspector-summary compact">
            <span className="eyebrow">可解释检查</span>
            <h2>{issueCount ? `${issueCount} 个值得确认的地方` : "暂未发现明显冲突"}</h2>
            <p>规则检测只标出疑点；AI 结论必须展开依据后由作者确认。</p>
          </section>
          {hasTimeAmbiguity && <article className="continuity-issue high">
            <div className="issue-provenance"><span>规则检测</span><span>需人工确认</span></div>
            <h3>“雨停以后”的时间不明确</h3>
            <p>当前段落没有明确时刻，可能与港务处资料卡中的开放时间发生冲突。</p>
            <dl><div><dt>正文依据</dt><dd>当前文档 · 第 1 段</dd></div><div><dt>设定依据</dt><dd>地点卡 · 港务处</dd></div></dl>
            <button onClick={() => onAskAi(`只依据当前正文与“港务处”地点卡，解释可能的时间冲突；不要改写正文`)}>带依据询问 AI</button>
          </article>}
          {hasEchoPhrase && <article className="continuity-issue">
            <div className="issue-provenance"><span>文本比对</span><span>非事实判定</span></div>
            <h3>关键句可能形成重复回声</h3>
            <p>“从来没有来过”与项目序章摘要中的表达接近，可能是伏笔回声，也可能需要降重。</p>
            <button onClick={() => onFeedback("已标记为有意呼应；不会修改原文。")}>标为有意呼应</button>
          </article>}
          {!issueCount && <div className="inspector-empty-state"><strong>检查范围</strong><p>当前文档与它明确引用的资料。未引用的项目和其他团历史不会混入。</p></div>}
        </div>
      )}

      {activeTab === "引用" && (
        <div className="inspector-tab-content">
          <section className="reference-section">
            <span className="eyebrow">正文已使用</span>
            {usedReferences.length > 0 ? usedReferences.map((reference) => <button key={reference} onClick={() => onFeedback(`已定位引用：${reference}`)}><strong>{reference}</strong><small>正文引用标记</small></button>) : <p>当前正文还没有素材引用标记。</p>}
          </section>
          <section className="reference-section">
            <span className="eyebrow">项目可引用资料</span>
            {availableReferences.map((reference) => <button key={reference.title} onClick={() => onFeedback(`“${reference.title}”已准备好，可从编辑器的“插入素材”加入正文。`)}><small>{reference.kind}</small><strong>{reference.title}</strong><span>{reference.detail}</span></button>)}
          </section>
          <p className="inspector-boundary-note">这里只展示项目明确收录的资料；查看不等于写入正文。</p>
        </div>
      )}

      {activeTab === "备注" && (
        <div className="inspector-tab-content">
          <label className="document-note-field">
            <span className="eyebrow">仅作者可见</span>
            <textarea value={note} onChange={(event) => onChangeNote(event.target.value)} placeholder="记录本章意图、待核实问题、删改方向……" />
          </label>
          <div className="note-guidance"><strong>备注不进入正文</strong><p>它随当前文档保存在浏览器中；AI 只有在你明确咨询时才会引用。</p></div>
        </div>
      )}
    </aside>
  );
}
