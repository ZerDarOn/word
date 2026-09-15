"use client";

import { useState } from "react";
import type { CreativeProject } from "./creative_project_data";

type TruthTab = "真相总览" | "事实档案" | "知识边界" | "公开时机" | "冲突与版本";
type Provenance = "原文明确" | "合理推断" | "临场新编" | "尚未确认";

interface TruthRecord {
  title: string;
  provenance: Provenance;
  importance: string;
  statement: string;
  source: string;
  gmNotes: string;
  publicVersion: string;
}

const truths: TruthRecord[] = [
  {
    title: "海曼主动删除船员登记",
    provenance: "原文明确",
    importance: "核心真相",
    statement: "二十年前，海曼取走灰潮号最后一批船员的登记，以阻止真名契约继续生效。",
    source: "剧本正文 · 第三幕《灰潮归来》· 真相段落 02",
    gmNotes: "删除登记是主动选择，但他的动机不是掩盖走私，而是延缓契约。",
    publicVersion: "港务记录在事故当晚遗失，官方没有说明责任人。",
  },
  {
    title: "灰潮号会在午夜靠港",
    provenance: "合理推断",
    importance: "时间压力",
    statement: "结合潮汐表、无线电残响和旧船票日期，灰潮号最可能在本场午夜重新靠港。",
    source: "线索网络 · 结论 C02，由三条独立证据归纳",
    gmNotes: "午夜是当前最稳妥的运行时间，可因场景时钟提前，但不能无提示改变。",
    publicVersion: "近期海面出现异常雾带，港务处建议夜间不要出航。",
  },
  {
    title: "码头工棚有一条旧排水道",
    provenance: "临场新编",
    importance: "本场事实",
    statement: "玩家跟踪失败后，主持人临时加入了一条通往旧城区的排水道作为替代路线。",
    source: "第 2 次团 · 17:42 · 主持人实际陈述",
    gmNotes: "已经被玩家使用并影响后续路线，团后需决定是否进入长期设定。",
    publicVersion: "玩家已亲自通过排水道，该事实对本团公开。",
  },
  {
    title: "议长本人主持过契约",
    provenance: "尚未确认",
    importance: "待定假设",
    statement: "目前只有伊芙琳的旧信件暗示议长在场，不能视为已经确定的剧本事实。",
    source: "物件线索 · 未寄出的信；来源单一且可能带有偏见",
    gmNotes: "需要第二来源，或明确把它设计为错误指向。",
    publicVersion: "暂无可公开版本。",
  },
];

const knowledgeRows = [
  { audience: "主持人", knows: "完整事实、来源和冲突版本", boundary: "全部可见" },
  { audience: "伊芙琳", knows: "知道海曼取走名册，不知道他当前藏身处", boundary: "条件披露" },
  { audience: "斯诺森", knows: "亲眼见过取走原页，只能证明行为", boundary: "不知动机" },
  { audience: "玩家", knows: "目前仅发现名册异常和斯诺森身份", boundary: "阶段 1" },
];

interface CreativeGmTruthWorkbenchProps {
  project: CreativeProject;
  onFeedback: (message: string) => void;
}

export function CreativeGmTruthWorkbench({ project, onFeedback }: CreativeGmTruthWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<TruthTab>("真相总览");
  const [filter, setFilter] = useState<"全部" | Provenance>("全部");
  const [selectedTitle, setSelectedTitle] = useState(truths[0].title);
  const [draft, setDraft] = useState(truths[0]);
  const selected = truths.find((truth) => truth.title === selectedTitle) ?? truths[0];
  const visibleTruths = truths.filter((truth) => filter === "全部" || truth.provenance === filter);

  function selectTruth(truth: TruthRecord) {
    setSelectedTitle(truth.title);
    setDraft(truth);
    onFeedback(`已定位事实“${truth.title}”及其来源。`);
  }

  function updateDraft<Key extends keyof TruthRecord>(key: Key, value: TruthRecord[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSaveTruth() {
    onFeedback(`已模拟保存“${draft.title}”及其事实来源和公开边界。`);
  }

  return (
    <section className="gm-truth-workbench studio-board">
      <div className="studio-page-heading">
        <div><span className="eyebrow">主持人模组 · 事实底稿</span><h2>先分清什么是真的，再让 AI 帮忙</h2><p>每条事实保留来源与可信层级；推断和临场新编不会伪装成原剧本内容。</p></div>
        <button onClick={() => onFeedback("已模拟建立一条尚未确认的事实。")}>＋ 新建事实</button>
      </div>

      <section className="truth-metrics" aria-label="主持人真相概况">
        <article><strong>18</strong><span>原文明确</span><small>可作为稳定事实底稿</small></article>
        <article><strong>7</strong><span>合理推断</span><small>保留推理链与置信度</small></article>
        <article><strong>4</strong><span>临场新编</span><small>等待团后归档决策</small></article>
        <article className="risk"><strong>3</strong><span>尚未确认</span><small>不能直接提供给 AI 作答</small></article>
      </section>

      <div className="truth-layout">
        <aside className="truth-index">
          <header><strong>事实目录</strong><small>{truths.length} / 32</small></header>
          <div className="truth-filters" aria-label="按事实来源筛选">
            {(["全部", "原文明确", "合理推断", "临场新编", "尚未确认"] as const).map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
          <nav aria-label="主持人事实列表">
            {visibleTruths.map((truth, index) => <button key={truth.title} className={selectedTitle === truth.title ? "active" : ""} onClick={() => selectTruth(truth)}><b>0{index + 1}</b><span><strong>{truth.title}</strong><small>{truth.importance}</small></span><em data-source={truth.provenance}>{truth.provenance}</em></button>)}
          </nav>
          <section className="truth-ai-policy"><span>AI 使用规则</span><strong>来源标签不可省略</strong><p>新编内容必须显式标注；尚未确认内容只能作为问题或方案，不能作为回答依据。</p></section>
        </aside>

        <article className="truth-editor">
          <header><div><span>{selected.provenance} · {selected.importance}</span><h3>{selected.title}</h3><p>{selected.source}</p></div><button onClick={handleSaveTruth}>保存事实</button></header>
          <nav className="entity-tabs" aria-label="主持人真相分区">
            {(["真相总览", "事实档案", "知识边界", "公开时机", "冲突与版本"] as TruthTab[]).map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}
          </nav>
          {activeTab === "真相总览" && <TruthOverview truth={selected} onFeedback={onFeedback} />}
          {activeTab === "事实档案" && <TruthProfile truth={draft} onChange={updateDraft} />}
          {activeTab === "知识边界" && <TruthKnowledgeBoundary />}
          {activeTab === "公开时机" && <TruthDisclosureTiming onFeedback={onFeedback} />}
          {activeTab === "冲突与版本" && <TruthConflicts onFeedback={onFeedback} />}
        </article>
      </div>
      <p className="workbench-context-note">当前项目：{project.title} · 正式事实可被线索网络、NPC 知情、场景节点和主持人咨询引用。</p>
    </section>
  );
}

function TruthOverview({ truth, onFeedback }: { truth: TruthRecord; onFeedback: (message: string) => void }) {
  return <div className="truth-overview"><section className="truth-statement"><span>{truth.provenance}</span><h4>{truth.statement}</h4><div><b>事实来源</b><p>{truth.source}</p></div></section><section className="truth-two-versions"><article><span>主持人完整版本</span><p>{truth.gmNotes}</p></article><article><span>当前公开版本</span><p>{truth.publicVersion}</p></article></section>{truth.provenance === "临场新编" && <aside><div><strong>团后待处理</strong><p>这条内容已经在桌上发生，但尚未成为所有团共用的正式设定。</p></div><button onClick={() => onFeedback("已模拟将该临场新编设为正式设定，并保留原始场次来源。")}>设为正式设定</button><button onClick={() => onFeedback("已将该内容保留为仅本团事实。")}>仅本团有效</button></aside>}</div>;
}

function TruthProfile({ truth, onChange }: { truth: TruthRecord; onChange: <Key extends keyof TruthRecord>(key: Key, value: TruthRecord[Key]) => void }) {
  return <div className="entity-form truth-form"><label>事实标题<input value={truth.title} onChange={(event) => onChange("title", event.target.value)} /></label><label>来源类型<select value={truth.provenance} onChange={(event) => onChange("provenance", event.target.value as Provenance)}><option>原文明确</option><option>合理推断</option><option>临场新编</option><option>尚未确认</option></select></label><label className="full-field">事实陈述<textarea rows={4} value={truth.statement} onChange={(event) => onChange("statement", event.target.value)} /></label><label className="full-field">事实来源<textarea rows={3} value={truth.source} onChange={(event) => onChange("source", event.target.value)} /></label><label>主持人说明<textarea rows={5} value={truth.gmNotes} onChange={(event) => onChange("gmNotes", event.target.value)} /></label><label>当前公开版本<textarea rows={5} value={truth.publicVersion} onChange={(event) => onChange("publicVersion", event.target.value)} /></label></div>;
}

function TruthKnowledgeBoundary() {
  return <div className="truth-knowledge-panel"><header><strong>知识边界</strong><p>知道事件、知道动机和知道完整原理是不同层级。</p></header><section>{knowledgeRows.map((row) => <article key={row.audience}><b>{row.audience}</b><p>{row.knows}</p><span>{row.boundary}</span></article>)}</section></div>;
}

function TruthDisclosureTiming({ onFeedback }: { onFeedback: (message: string) => void }) {
  return <div className="truth-timing-panel"><header><strong>公开时机</strong><p>事实可以存在，但必须等到玩家通过行动抵达。</p></header><section><article className="done"><b>阶段 1</b><div><strong>名册存在异常</strong><p>港务处调查后公开，玩家已经触发。</p></div><span>已公开</span></article><article><b>阶段 2</b><div><strong>海曼取走原页</strong><p>需要守灯人口供或照片证据。</p></div><span>未解锁</span></article><article><b>终幕</b><div><strong>删除名字会改变记忆</strong><p>灰潮号靠港或玩家完成契约研究后公开。</p></div><span>锁定</span></article></section><button onClick={() => onFeedback("已模拟记录一次事实公开事件。")}>记录公开事件</button></div>;
}

function TruthConflicts({ onFeedback }: { onFeedback: (message: string) => void }) {
  return <div className="truth-conflict-panel"><header><strong>冲突与版本</strong><p>同一件事出现多个说法时，不要静默覆盖。</p></header><section><article className="danger"><b>时间冲突</b><div><strong>靠港时间：午夜 / 凌晨一点</strong><p>正文写午夜，第二次团中主持人说成凌晨一点。</p></div><button onClick={() => onFeedback("已选择保留正文的午夜版本，并标记第二次团为口误。")}>选择正式版本</button></article><article className="warning"><b>动机差异</b><div><strong>海曼是救人还是自保</strong><p>两种解释可以并存为人物争议，不必强制合并。</p></div><button onClick={() => onFeedback("已标记为有意保留的叙事歧义。")}>保留歧义</button></article><article className="clear"><b>版本一致</b><div><strong>斯诺森不是灰潮号船员</strong><p>角色档案、正文、线索网络与两次场次记录一致。</p></div><button onClick={() => onFeedback("已打开该事实的全部引用。")}>查看引用</button></article></section></div>;
}
