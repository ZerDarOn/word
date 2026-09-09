"use client";

import { useState } from "react";
import type { CreativeProject } from "./creative_project_data";

type ForeshadowingTab = "伏笔档案" | "伏笔生命周期" | "知识边界" | "回收检查";
type ForeshadowingStatus = "未回收" | "已安排" | "已回收" | "暂时悬置";

interface ForeshadowingRecord {
  title: string;
  category: string;
  status: ForeshadowingStatus;
  importance: string;
  narrativePromise: string;
  surfaceInterpretation: string;
  trueMeaning: string;
  plannedPayoff: string;
  readerKnowledge: string;
  characterKnowledge: string;
  creatorNotes: string;
}

interface ForeshadowingOccurrence {
  id: string;
  stage: "埋设" | "强化" | "误导" | "揭示" | "回收";
  location: string;
  title: string;
  detail: string;
  state: "已完成" | "写作中" | "已安排";
}

const foreshadowingItems = [
  { title: "被涂掉的姓氏", status: "已安排" as const, occurrences: 4, mark: "姓" },
  { title: "雾笛响了三次", status: "未回收" as const, occurrences: 3, mark: "笛" },
  { title: "伊芙琳的左手", status: "已安排" as const, occurrences: 2, mark: "手" },
  { title: "不会生锈的钥匙", status: "暂时悬置" as const, occurrences: 1, mark: "钥" },
  { title: "退潮后的脚印", status: "已回收" as const, occurrences: 3, mark: "印" },
];

const initialForeshadowing: ForeshadowingRecord = {
  title: "被涂掉的姓氏",
  category: "身份谜题 / 核心伏笔",
  status: "已安排",
  importance: "主线",
  narrativePromise: "有人正在从公共记录中抹除一个真实存在过的人。",
  surfaceInterpretation: "读者会先认为这是一起普通的走私掩盖或档案篡改。",
  trueMeaning: "被删除的不是犯罪记录，而是名字本身；真名契约正在让所有人逐渐忘记海曼。",
  plannedPayoff: "灰潮号靠港时，被抹除的名字重新出现在所有名册上，伊芙琳恢复与海曼有关的记忆。",
  readerKnowledge: "已经知道名册被改、斯诺森与缺页有关，但尚不知道删除名字会改变记忆。",
  characterKnowledge: "伊芙琳知道档案被改却不记得原因；斯诺森记得卸货现场；海曼知道完整真相。",
  creatorNotes: "回收时必须同时回应“谁涂改”“为什么涂改”“涂改产生了什么后果”三个问题。",
};

const occurrences: ForeshadowingOccurrence[] = [
  {
    id: "occurrence-1",
    stage: "埋设",
    location: "序章 · 无潮之夜",
    title: "姓氏压痕第一次出现",
    detail: "不解释名字，只让读者注意到涂抹下仍有压痕。",
    state: "已完成",
  },
  {
    id: "occurrence-2",
    stage: "强化",
    location: "第一章 · 港务处",
    title: "两个版本的值班名册",
    detail: "让涂改变成人为行为，而不是纸张损坏。",
    state: "已完成",
  },
  {
    id: "occurrence-3",
    stage: "误导",
    location: "第二章 · 码头工棚",
    title: "斯诺森拒绝谈论缺页",
    detail: "暂时把动机引向走私与自保。",
    state: "写作中",
  },
  {
    id: "occurrence-4",
    stage: "揭示",
    location: "第三章 · 旧灯塔",
    title: "照片上没有对应姓名",
    detail: "第一次明确指出删除名字会影响他人的记忆。",
    state: "已安排",
  },
  {
    id: "occurrence-5",
    stage: "回收",
    location: "终幕 · 灰潮号靠港",
    title: "所有名字同时恢复",
    detail: "兑现身份谜题，并迫使伊芙琳重新选择立场。",
    state: "已安排",
  },
];

interface CreativeForeshadowingWorkbenchProps {
  project: CreativeProject;
  onFeedback: (message: string) => void;
}

export function CreativeForeshadowingWorkbench({
  project,
  onFeedback,
}: CreativeForeshadowingWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<ForeshadowingTab>("伏笔生命周期");
  const [selectedTitle, setSelectedTitle] = useState(initialForeshadowing.title);
  const [statusFilter, setStatusFilter] = useState<"全部" | ForeshadowingStatus>("全部");
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState(occurrences[2].id);
  const [foreshadowing, setForeshadowing] = useState(initialForeshadowing);

  const visibleItems = foreshadowingItems.filter(
    (item) => statusFilter === "全部" || item.status === statusFilter,
  );

  function updateForeshadowing<Key extends keyof ForeshadowingRecord>(
    key: Key,
    value: ForeshadowingRecord[Key],
  ) {
    setForeshadowing((current) => ({ ...current, [key]: value }));
  }

  function handleSelectForeshadowing(item: (typeof foreshadowingItems)[number]) {
    setSelectedTitle(item.title);
    setForeshadowing((current) => ({
      ...current,
      title: item.title,
      status: item.status,
      category: item.title === "伊芙琳的左手" ? "人物动作 / 行为伏笔" : current.category,
    }));
    onFeedback(`已切换到伏笔“${item.title}”的结构预览。`);
  }

  function handleSaveForeshadowing() {
    onFeedback(`已模拟保存“${foreshadowing.title}”的生命周期、知识边界与回收计划。`);
  }

  return (
    <section className="foreshadowing-workbench studio-board">
      <div className="studio-page-heading">
        <div>
          <span className="eyebrow">故事结构 · 伏笔与回收</span>
          <h2>每一个暗示，都该有去处</h2>
          <p>管理叙事承诺、出现频率、认知变化和最终兑现，而不是只记一句“以后要回收”。</p>
        </div>
        <button onClick={() => onFeedback("已模拟建立一条空白伏笔。")}>＋ 新建伏笔</button>
      </div>

      <section className="foreshadowing-metrics" aria-label="伏笔概况">
        <article><strong>7</strong><span>进行中的伏笔</span><small>其中 2 条风险较高</small></article>
        <article><strong>5</strong><span>已安排回收</span><small>覆盖未来 4 个节点</small></article>
        <article><strong>3</strong><span>已经回收</span><small>均保留反向引用</small></article>
        <article className="risk"><strong>2</strong><span>需要处理</span><small>遗忘 1 · 重复过度 1</small></article>
      </section>

      <div className="foreshadowing-layout">
        <aside className="foreshadowing-index">
          <header><strong>伏笔目录</strong><small>{foreshadowingItems.length} 条</small></header>
          <div className="foreshadowing-filters" aria-label="按回收状态筛选">
            {(["全部", "未回收", "已安排", "已回收", "暂时悬置"] as const).map((filter) => (
              <button
                key={filter}
                className={statusFilter === filter ? "active" : ""}
                onClick={() => setStatusFilter(filter)}
                aria-pressed={statusFilter === filter}
              >
                {filter}
              </button>
            ))}
          </div>
          <nav aria-label="伏笔列表">
            {visibleItems.map((item) => (
              <button
                key={item.title}
                className={selectedTitle === item.title ? "active" : ""}
                onClick={() => handleSelectForeshadowing(item)}
              >
                <b>{item.mark}</b>
                <span><strong>{item.title}</strong><small>{item.occurrences} 个出现节点</small></span>
                <em data-status={item.status}>{item.status}</em>
              </button>
            ))}
          </nav>
        </aside>

        <article className="foreshadowing-editor">
          <header>
            <div>
              <span>{foreshadowing.category}</span>
              <h3>{foreshadowing.title}</h3>
              <p>{foreshadowing.importance}伏笔 · 当前状态：{foreshadowing.status}</p>
            </div>
            <button onClick={handleSaveForeshadowing}>保存伏笔</button>
          </header>

          <nav className="entity-tabs" aria-label="伏笔档案分区">
            {(["伏笔档案", "伏笔生命周期", "知识边界", "回收检查"] as ForeshadowingTab[]).map((tab) => (
              <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </nav>

          {activeTab === "伏笔档案" && (
            <ForeshadowingProfile
              foreshadowing={foreshadowing}
              onChange={updateForeshadowing}
            />
          )}
          {activeTab === "伏笔生命周期" && (
            <ForeshadowingLifecycle
              selectedOccurrenceId={selectedOccurrenceId}
              onOccurrenceSelect={setSelectedOccurrenceId}
              onFeedback={onFeedback}
            />
          )}
          {activeTab === "知识边界" && (
            <KnowledgeBoundary
              foreshadowing={foreshadowing}
              onChange={updateForeshadowing}
            />
          )}
          {activeTab === "回收检查" && <PayoffCheck onFeedback={onFeedback} />}
        </article>
      </div>

      <p className="workbench-context-note">当前项目：{project.title} · 伏笔节点可关联正文、故事节点、角色、物件和世界规则。</p>
    </section>
  );
}

function ForeshadowingProfile({
  foreshadowing,
  onChange,
}: {
  foreshadowing: ForeshadowingRecord;
  onChange: <Key extends keyof ForeshadowingRecord>(key: Key, value: ForeshadowingRecord[Key]) => void;
}) {
  return (
    <div className="entity-form foreshadowing-profile">
      <label>伏笔名称<input value={foreshadowing.title} onChange={(event) => onChange("title", event.target.value)} /></label>
      <label>分类<input value={foreshadowing.category} onChange={(event) => onChange("category", event.target.value)} /></label>
      <label>重要程度
        <select value={foreshadowing.importance} onChange={(event) => onChange("importance", event.target.value)}>
          <option>主线</option><option>人物弧</option><option>支线</option><option>氛围暗示</option>
        </select>
      </label>
      <label>回收状态
        <select value={foreshadowing.status} onChange={(event) => onChange("status", event.target.value as ForeshadowingStatus)}>
          <option>未回收</option><option>已安排</option><option>已回收</option><option>暂时悬置</option>
        </select>
      </label>
      <label className="full-field">叙事承诺<textarea rows={4} value={foreshadowing.narrativePromise} onChange={(event) => onChange("narrativePromise", event.target.value)} /></label>
      <label>表层解释<textarea rows={5} value={foreshadowing.surfaceInterpretation} onChange={(event) => onChange("surfaceInterpretation", event.target.value)} /></label>
      <label className="foreshadowing-truth-field">真实含义<textarea rows={5} value={foreshadowing.trueMeaning} onChange={(event) => onChange("trueMeaning", event.target.value)} /></label>
      <label className="full-field">计划如何回收<textarea rows={4} value={foreshadowing.plannedPayoff} onChange={(event) => onChange("plannedPayoff", event.target.value)} /></label>
    </div>
  );
}

function ForeshadowingLifecycle({
  selectedOccurrenceId,
  onOccurrenceSelect,
  onFeedback,
}: {
  selectedOccurrenceId: string;
  onOccurrenceSelect: (id: string) => void;
  onFeedback: (message: string) => void;
}) {
  const selectedOccurrence = occurrences.find((item) => item.id === selectedOccurrenceId) ?? occurrences[0];

  return (
    <div className="foreshadowing-lifecycle-panel">
      <header>
        <div><strong>伏笔生命周期</strong><span>出现不是重复：每一次都应该改变读者的理解</span></div>
        <button onClick={() => onFeedback("已模拟添加一个伏笔出现节点。")}>＋ 添加出现节点</button>
      </header>
      <div className="lifecycle-stage-guide">
        {(["埋设", "强化", "误导", "揭示", "回收"] as const).map((stage, index) => (
          <span key={stage}><b>0{index + 1}</b>{stage}{index < 4 && <i>›</i>}</span>
        ))}
      </div>
      <div className="occurrence-track">
        {occurrences.map((occurrence, index) => (
          <button
            key={occurrence.id}
            className={selectedOccurrenceId === occurrence.id ? "active" : ""}
            onClick={() => onOccurrenceSelect(occurrence.id)}
          >
            <span>{occurrence.stage}</span>
            <strong>{occurrence.title}</strong>
            <small>{occurrence.location}</small>
            <em data-state={occurrence.state}>{occurrence.state}</em>
            {index < occurrences.length - 1 && <i aria-hidden="true" />}
          </button>
        ))}
      </div>
      <section className="occurrence-detail">
        <div><span className="eyebrow">当前节点 · {selectedOccurrence.stage}</span><h4>{selectedOccurrence.title}</h4><p>{selectedOccurrence.detail}</p></div>
        <dl>
          <div><dt>出现位置</dt><dd>{selectedOccurrence.location}</dd></div>
          <div><dt>节点状态</dt><dd>{selectedOccurrence.state}</dd></div>
          <div><dt>本次变化</dt><dd>{selectedOccurrence.stage === "误导" ? "改变嫌疑方向" : selectedOccurrence.stage === "回收" ? "兑现叙事承诺" : "增加新的解释可能"}</dd></div>
        </dl>
        <button onClick={() => onFeedback(`已模拟打开“${selectedOccurrence.location}”。`)}>打开关联内容</button>
      </section>
      <div className="foreshadowing-references">
        <strong>关联引用</strong>
        <span>物件 · 缺页值班名册</span>
        <span>世界规则 · 真名契约</span>
        <span>人物弧 · 伊芙琳恢复记忆</span>
      </div>
    </div>
  );
}

function KnowledgeBoundary({
  foreshadowing,
  onChange,
}: {
  foreshadowing: ForeshadowingRecord;
  onChange: <Key extends keyof ForeshadowingRecord>(key: Key, value: ForeshadowingRecord[Key]) => void;
}) {
  return (
    <div className="knowledge-boundary-panel">
      <header><strong>同一时刻，不同人知道的并不相同</strong><p>避免作者知道真相以后，让所有角色和读者也表现得像已经知道。</p></header>
      <div>
        <label className="reader-knowledge"><span>读者知道</span><textarea rows={6} value={foreshadowing.readerKnowledge} onChange={(event) => onChange("readerKnowledge", event.target.value)} /></label>
        <label className="character-knowledge"><span>角色知道</span><textarea rows={6} value={foreshadowing.characterKnowledge} onChange={(event) => onChange("characterKnowledge", event.target.value)} /></label>
        <label className="creator-knowledge"><span>创作者真相</span><textarea rows={6} value={foreshadowing.creatorNotes} onChange={(event) => onChange("creatorNotes", event.target.value)} /></label>
      </div>
      <section>
        <strong>认知变化预览</strong>
        <article><span>埋设后</span><p>读者只注意到异常，不知道异常由谁造成。</p></article>
        <article><span>误导后</span><p>读者倾向怀疑斯诺森，但角色证词仍不一致。</p></article>
        <article><span>揭示后</span><p>读者知道记忆受到影响，伊芙琳仍未恢复全部记忆。</p></article>
      </section>
    </div>
  );
}

function PayoffCheck({ onFeedback }: { onFeedback: (message: string) => void }) {
  return (
    <div className="payoff-check-panel">
      <header><span className="eyebrow">回收检查</span><h4>这条伏笔是否在正确的时间兑现了正确的问题？</h4></header>
      <section className="payoff-question-grid">
        <article className="complete"><b>已覆盖</b><strong>谁修改了名册？</strong><p>旧灯塔节点将揭示海曼曾取走原页。</p></article>
        <article className="complete"><b>已覆盖</b><strong>为什么修改？</strong><p>为了阻止真名契约让整船人重新出现。</p></article>
        <article className="warning"><b>待加强</b><strong>伊芙琳为何参与？</strong><p>目前只有签名证据，缺少她当年的主动选择。</p></article>
      </section>
      <section className="foreshadowing-risk-list">
        <article><b>间隔过长</b><div><strong>强化与揭示之间相隔 7 个场景</strong><p>读者可能忘记名册压痕，可在第五章加入一次轻量回声。</p></div><button onClick={() => onFeedback("已模拟建立一个轻量强化节点。")}>安排强化</button></article>
        <article><b>重复风险</b><div><strong>连续三次使用“被涂掉”视觉</strong><p>第三次可以改用人物记忆缺口，避免形式重复。</p></div><button onClick={() => onFeedback("已将重复风险标记为待改写。")}>标记待改</button></article>
        <article className="clear"><b>时机合适</b><div><strong>回收发生在立场选择之前</strong><p>真相会改变选择含义，而不是结局后补解释。</p></div><button onClick={() => onFeedback("已打开终幕故事节点。")}>打开节点</button></article>
      </section>
    </div>
  );
}
