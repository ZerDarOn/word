"use client";

import { useState } from "react";
import type { CreativeProject } from "./creative_project_data";

type WorldbuildingTab = "条目正文" | "规则与例外" | "关联引用" | "影响检查";

interface WorldEntry {
  name: string;
  domain: string;
  topic: string;
  definition: string;
  coreRule: string;
  exception: string;
  cost: string;
  commonKnowledge: string;
  hiddenTruth: string;
  visibility: "常识公开" | "条件公开" | "仅创作者可见";
}

const worldTree = [
  { name: "世界设定", kind: "设定根目录", depth: 0 },
  { name: "地理与环境", kind: "领域", depth: 1 },
  { name: "潮汐地貌", kind: "主题", depth: 2 },
  { name: "无潮城区", kind: "条目", depth: 3 },
  { name: "社会与制度", kind: "领域", depth: 1 },
  { name: "身份与法律", kind: "主题", depth: 2 },
  { name: "真名契约", kind: "条目", depth: 3 },
  { name: "时间与历法", kind: "领域", depth: 1 },
  { name: "退潮历", kind: "条目", depth: 2 },
  { name: "历史与传说", kind: "领域", depth: 1 },
  { name: "灰潮号失踪", kind: "事件条目", depth: 2 },
];

const initialEntry: WorldEntry = {
  name: "真名契约",
  domain: "社会与制度",
  topic: "身份与法律",
  definition: "在萨菲港，姓名一旦被正式登记，就同时获得法律身份与仪式锚点。",
  coreRule: "登记姓名的人会被城市记忆；档案中的增删会逐步影响公共记忆与契约关系。",
  exception: "出生名、假名和主动放弃的名字不会自动生效；必须由本人或合法见证者完成登记。",
  cost: "修改已经生效的名字，会让执行者永久失去一段与该名字有关的记忆。",
  commonKnowledge: "登记姓名才能合法工作、持有房产和登船。居民把它视为普通行政手续。",
  hiddenTruth: "真名契约来自无潮城区地下的旧仪式，并非港务议会创造的制度。",
  visibility: "条件公开",
};

interface CreativeWorldbuildingWorkbenchProps {
  project: CreativeProject;
  onFeedback: (message: string) => void;
}

export function CreativeWorldbuildingWorkbench({
  project,
  onFeedback,
}: CreativeWorldbuildingWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<WorldbuildingTab>("条目正文");
  const [selectedName, setSelectedName] = useState(initialEntry.name);
  const [entry, setEntry] = useState(initialEntry);

  function updateEntry<Key extends keyof WorldEntry>(key: Key, value: WorldEntry[Key]) {
    setEntry((current) => ({ ...current, [key]: value }));
  }

  function handleSaveWorldEntry() {
    onFeedback(`已模拟保存世界观条目“${entry.name}”及其规则、例外和关联影响。`);
  }

  return (
    <section className="worldbuilding-workbench studio-board">
      <div className="studio-page-heading">
        <div><span className="eyebrow">设定资料 · 世界观</span><h2>从领域到一条可验证的规则</h2><p>世界观不只收集名词，还要说明规则如何生效、在哪里例外、会影响哪些内容。</p></div>
        <button onClick={() => onFeedback("已模拟在当前主题下建立一个空白条目。")}>＋ 新建条目</button>
      </div>

      <div className="world-level-guide">
        <span><b>01</b>领域<small>社会与制度</small></span><i>›</i>
        <span><b>02</b>主题<small>身份与法律</small></span><i>›</i>
        <span><b>03</b>条目<small>真名契约</small></span><i>›</i>
        <span><b>04</b>规则 / 例外<small>可被正文引用</small></span>
      </div>

      <div className="worldbuilding-layout">
        <aside className="world-tree-panel">
          <header><strong>世界设定目录</strong><small>4 个领域</small></header>
          <label><span>检索设定</span><input aria-label="检索设定" placeholder="名称或正文内容" /></label>
          <nav aria-label="世界观分级目录">
            {worldTree.map((item) => (
              <button
                key={item.name}
                className={selectedName === item.name ? "active" : ""}
                style={{ paddingInlineStart: `${9 + item.depth * 15}px` }}
                onClick={() => {
                  setSelectedName(item.name);
                  setEntry((current) => ({
                    ...current,
                    name: item.name,
                    topic: item.kind,
                  }));
                  onFeedback(`已切换到“${item.name}”的世界观预览。`);
                }}
              >
                <i>{item.depth < 2 ? "−" : "·"}</i><span><strong>{item.name}</strong><small>{item.kind}</small></span>
              </button>
            ))}
          </nav>
        </aside>

        <article className="world-entry-editor">
          <header>
            <div><span>{entry.domain} / {entry.topic}</span><h3>{entry.name}</h3><p>世界规则条目 · 被 12 处内容引用</p></div>
            <button onClick={handleSaveWorldEntry}>保存条目</button>
          </header>
          <nav className="entity-tabs" aria-label="世界观条目分区">
            {(["条目正文", "规则与例外", "关联引用", "影响检查"] as WorldbuildingTab[]).map((tab) => (
              <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </nav>

          {activeTab === "条目正文" && (
            <div className="entity-form">
              <div className="entity-visibility-row">
                <div><strong>知识边界</strong><span>常识、条件公开与创作者秘密分层保存</span></div>
                <select value={entry.visibility} onChange={(event) => updateEntry("visibility", event.target.value as WorldEntry["visibility"])}>
                  <option>常识公开</option><option>条件公开</option><option>仅创作者可见</option>
                </select>
              </div>
              <label>条目名称<input value={entry.name} onChange={(event) => updateEntry("name", event.target.value)} /></label>
              <label>所属领域<input value={entry.domain} onChange={(event) => updateEntry("domain", event.target.value)} /></label>
              <label className="full-field">所属主题<input value={entry.topic} onChange={(event) => updateEntry("topic", event.target.value)} /></label>
              <label className="full-field">定义<textarea rows={5} value={entry.definition} onChange={(event) => updateEntry("definition", event.target.value)} /></label>
              <label>世界内常识<textarea rows={5} value={entry.commonKnowledge} onChange={(event) => updateEntry("commonKnowledge", event.target.value)} /></label>
              <label className="world-secret-field">创作者秘密<textarea rows={5} value={entry.hiddenTruth} onChange={(event) => updateEntry("hiddenTruth", event.target.value)} /></label>
            </div>
          )}

          {activeTab === "规则与例外" && (
            <div className="world-rules-panel">
              <article><span>核心规则</span><label>何时生效<textarea rows={5} value={entry.coreRule} onChange={(event) => updateEntry("coreRule", event.target.value)} /></label></article>
              <article><span>例外情况</span><label>何时不生效<textarea rows={5} value={entry.exception} onChange={(event) => updateEntry("exception", event.target.value)} /></label></article>
              <article><span>代价与后果</span><label>使用这条规则的成本<textarea rows={5} value={entry.cost} onChange={(event) => updateEntry("cost", event.target.value)} /></label></article>
              <aside><strong>规则完整度</strong><div><span>触发条件</span><b>已定义</b></div><div><span>作用对象</span><b>已定义</b></div><div><span>例外</span><b>已定义</b></div><div><span>代价</span><b>已定义</b></div></aside>
            </div>
          )}

          {activeTab === "关联引用" && <WorldReferences />}
          {activeTab === "影响检查" && <WorldImpactCheck />}
        </article>
      </div>
      <p className="workbench-context-note">当前项目：{project.title} · 条目关系将在后续数据层中持久保存。</p>
    </section>
  );
}

function WorldReferences() {
  const references = [
    { type: "角色", title: "伊芙琳·马尔", relation: "负责维护登记制度" },
    { type: "组织", title: "港务议会", relation: "公开执行者 / 非真正创造者" },
    { type: "地点", title: "无潮城区", relation: "契约仪式的起源地" },
    { type: "物件", title: "缺页值班名册", relation: "规则失效的关键证据" },
    { type: "故事节点", title: "灰潮号靠港", relation: "大规模恢复名字" },
  ];
  return (
    <div className="world-reference-panel">
      <header><div><strong>关联引用</strong><span>反向引用能回答“修改这一条会影响哪里”</span></div><button>＋ 添加引用</button></header>
      <div>{references.map((reference) => <article key={reference.title}><b>{reference.type}</b><span><strong>{reference.title}</strong><small>{reference.relation}</small></span><button>打开</button></article>)}</div>
    </div>
  );
}

function WorldImpactCheck() {
  return (
    <div className="world-impact-panel">
      <header><span className="eyebrow">影响检查</span><h4>如果“删除名字会影响公共记忆”，哪些内容需要同步确认？</h4></header>
      <section><article><b>冲突</b><div><strong>斯诺森仍记得所有失踪船员</strong><p>角色档案未说明他为何不受规则影响。</p></div><button>打开角色</button></article><article><b>待补充</b><div><strong>名册复印件是否同样生效</strong><p>规则只写了正式登记，没有定义副本。</p></div><button>补充例外</button></article><article className="clear"><b>一致</b><div><strong>港务议会封存原始档案</strong><p>与组织隐藏目标和秘密行动一致。</p></div><button>查看引用</button></article></section>
    </div>
  );
}
