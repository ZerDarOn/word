"use client";

import { useState } from "react";
import type { CreativeProject } from "./creative_project_data";

type ClueTab = "物件档案" | "物件流转" | "证据链" | "公开与隐秘";

interface ClueRecord {
  name: string;
  category: string;
  authenticity: string;
  currentHolder: string;
  discoveryCondition: string;
  publicDescription: string;
  trueInformation: string;
  misleadingInterpretation: string;
  gmNotes: string;
}

const clueItems = [
  { name: "缺页值班名册", kind: "文书线索", state: "核心线索", mark: "册" },
  { name: "铜制灯塔钥匙", kind: "关键道具", state: "未被发现", mark: "钥" },
  { name: "伪造船票", kind: "误导线索", state: "真伪未知", mark: "票" },
  { name: "灰潮号船铃", kind: "仪式物件", state: "已封存", mark: "铃" },
  { name: "海曼的药瓶", kind: "人物线索", state: "待放置", mark: "瓶" },
];

const initialClue: ClueRecord = {
  name: "缺页值班名册",
  category: "文书线索 / 核心证据",
  authenticity: "原件，但被人为移除一页",
  currentHolder: "港务处 · 档案室",
  discoveryCondition: "成功查询二十年前的卸货记录，或夜间进入档案室并检查装订压痕。",
  publicDescription: "一本受潮严重的旧值班名册，中间有一页被整齐裁去。",
  trueInformation: "缺页记录了灰潮号最后一次卸货。纸页由海曼取走，港务议会事后重新装订。",
  misleadingInterpretation: "看起来像斯诺森为掩盖走私记录而毁掉了自己值班当日的页面。",
  gmNotes: "玩家即使检定失败也能发现缺页；检定成功额外发现装订时间晚于名册年份。",
};

interface CreativeClueItemWorkbenchProps {
  project: CreativeProject;
  onFeedback: (message: string) => void;
}

export function CreativeClueItemWorkbench({ project, onFeedback }: CreativeClueItemWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<ClueTab>("物件档案");
  const [selectedName, setSelectedName] = useState(initialClue.name);
  const [clue, setClue] = useState(initialClue);

  function updateClue<Key extends keyof ClueRecord>(key: Key, value: ClueRecord[Key]) {
    setClue((current) => ({ ...current, [key]: value }));
  }

  function handleSaveClue() {
    onFeedback(`已模拟保存“${clue.name}”的物件档案、流转节点与证据边界。`);
  }

  return (
    <section className="clue-item-workbench studio-board">
      <div className="studio-page-heading">
        <div><span className="eyebrow">设定资料 · 物件线索</span><h2>一个物件，也有自己的时间线</h2><p>记录它是什么、在哪里、如何被发现、支持什么结论，以及玩家实际看见什么。</p></div>
        <button onClick={() => onFeedback("已模拟建立一个空白物件。")}>＋ 新建物件</button>
      </div>

      <div className="clue-workbench-layout">
        <aside className="clue-item-index">
          <header><strong>物件目录</strong><small>5 件</small></header>
          <label><span>筛选物件</span><input aria-label="筛选物件" placeholder="名称、类别或状态" /></label>
          <nav aria-label="物件目录">
            {clueItems.map((item) => (
              <button
                key={item.name}
                className={selectedName === item.name ? "active" : ""}
                onClick={() => {
                  setSelectedName(item.name);
                  setClue((current) => ({
                    ...current,
                    name: item.name,
                    category: `${item.kind} / ${item.state}`,
                  }));
                  onFeedback(`已切换到“${item.name}”的物件预览。`);
                }}
              >
                <b>{item.mark}</b><span><strong>{item.name}</strong><small>{item.kind}</small></span><em>{item.state}</em>
              </button>
            ))}
          </nav>
        </aside>

        <article className="clue-editor">
          <header>
            <div className="clue-object-preview">册<small>物件图像</small></div>
            <div><span>{clue.category}</span><h3>{clue.name}</h3><p>{clue.authenticity}</p></div>
            <button onClick={handleSaveClue}>保存物件</button>
          </header>
          <nav className="entity-tabs" aria-label="物件档案分区">
            {(["物件档案", "物件流转", "证据链", "公开与隐秘"] as ClueTab[]).map((tab) => (
              <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </nav>

          {activeTab === "物件档案" && (
            <div className="entity-form">
              <label>物件名称<input value={clue.name} onChange={(event) => updateClue("name", event.target.value)} /></label>
              <label>类别<input value={clue.category} onChange={(event) => updateClue("category", event.target.value)} /></label>
              <label>真伪状态<input value={clue.authenticity} onChange={(event) => updateClue("authenticity", event.target.value)} /></label>
              <label>当前持有 / 所在<input value={clue.currentHolder} onChange={(event) => updateClue("currentHolder", event.target.value)} /></label>
              <label className="full-field">发现条件<textarea rows={4} value={clue.discoveryCondition} onChange={(event) => updateClue("discoveryCondition", event.target.value)} /></label>
              <div className="clue-tags full-field"><span>核心线索</span><span>可携带</span><span>文书</span><button>＋ 添加标签</button></div>
            </div>
          )}

          {activeTab === "物件流转" && <ClueFlow />}
          {activeTab === "证据链" && <EvidenceChain />}
          {activeTab === "公开与隐秘" && (
            <div className="entity-form clue-visibility-form">
              <div className="player-information full-field"><strong>玩家可见</strong><span>可以出现在描述、附件或玩家视角咨询中</span></div>
              <label className="full-field">公开描述<textarea rows={4} value={clue.publicDescription} onChange={(event) => updateClue("publicDescription", event.target.value)} /></label>
              <div className="secret-boundary full-field"><strong>仅主持人可见</strong><span>以下字段不会混入玩家可见答案。</span></div>
              <label className="full-field">真实信息<textarea rows={4} value={clue.trueInformation} onChange={(event) => updateClue("trueInformation", event.target.value)} /></label>
              <label>误导解释<textarea rows={4} value={clue.misleadingInterpretation} onChange={(event) => updateClue("misleadingInterpretation", event.target.value)} /></label>
              <label>主持人笔记<textarea rows={4} value={clue.gmNotes} onChange={(event) => updateClue("gmNotes", event.target.value)} /></label>
            </div>
          )}
        </article>
      </div>
      <p className="workbench-context-note">当前项目：{project.title} · 物件修改只保留在本次前端演示状态。</p>
    </section>
  );
}

function ClueFlow() {
  const stages = [
    { label: "来源", title: "二十年前的港务记录", detail: "海曼取走缺页" },
    { label: "当前", title: "港务处档案室", detail: "重新装订后封存" },
    { label: "发现", title: "港务处调查场景", detail: "查询或潜入均可获得" },
    { label: "后续", title: "交给伊芙琳 / 自行保管", detail: "影响她的披露态度" },
  ];
  return (
    <div className="clue-flow-panel">
      <header><strong>物件流转</strong><span>位置、持有者和状态变化彼此独立</span></header>
      <div className="clue-flow-track">
        {stages.map((stage, index) => (
          <article key={stage.label}><b>0{index + 1}</b><span>{stage.label}</span><strong>{stage.title}</strong><p>{stage.detail}</p>{index < stages.length - 1 && <i>›</i>}</article>
        ))}
      </div>
      <section className="clue-state-events"><strong>状态事件</strong><div><time>20 年前</time><span>完整名册</span><small>海曼移除一页</small></div><div><time>当前</time><span>缺页原件</span><small>可通过压痕还原部分内容</small></div></section>
    </div>
  );
}

function EvidenceChain() {
  return (
    <div className="evidence-chain-panel">
      <header><div><strong>证据链</strong><span>物件支持结论，但不等同于自动证明结论</span></div><button>＋ 关联结论</button></header>
      <div className="evidence-chain">
        <section><span>物件事实</span><article><strong>缺失页码</strong><p>装订压痕证明页面曾存在。</p></article><article><strong>墨水年份</strong><p>重新编号发生在失踪案之后。</p></article></section>
        <b>共同支持</b>
        <section><span>调查结论</span><article className="conclusion"><strong>名册被人为修改</strong><p>当前支持度 2 / 3，仍需要口供或被移除的原页。</p><meter min="0" max="3" value="2">2 / 3</meter></article></section>
      </div>
      <div className="evidence-alternatives"><strong>替代获得路径</strong><span>守灯人口供</span><span>海曼的私藏原页</span><span>档案处采购记录</span></div>
    </div>
  );
}
