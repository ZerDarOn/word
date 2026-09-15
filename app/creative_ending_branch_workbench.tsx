"use client";

import { useState } from "react";
import type { CreativeProject } from "./creative_project_data";

type EndingTab = "结局路径总览" | "结局档案" | "后果结算" | "下一场承接" | "可达性检查";
type Reachability = "可达" | "条件不足" | "死分支";

interface EndingRecord {
  title: string;
  type: string;
  reachability: Reachability;
  trigger: string;
  playerChoice: string;
  revealedTruth: string;
  characterOutcome: string;
  factionOutcome: string;
  unresolved: string;
  carryover: string;
}

const endings: EndingRecord[] = [
  {
    title: "公开名册",
    type: "真相结局",
    reachability: "可达",
    trigger: "取得至少两类名册证据，说服伊芙琳，并在灰潮号靠港前抵达议会大厅。",
    playerChoice: "玩家主动公开被删除的姓名，接受城市秩序短期崩解的代价。",
    revealedTruth: "海曼删除登记的行为、议会掩盖以及真名契约对记忆的影响。",
    characterOutcome: "伊芙琳公开作证；斯诺森获得保护；海曼必须面对幸存者。",
    factionOutcome: "港务议会失去档案控制权，守灯人转为公开见证组织。",
    unresolved: "灰潮号船员恢复身份后去了哪里；契约是否仍能再次启动。",
    carryover: "下一场从公开听证会开始，玩家持有完整名册副本。",
  },
  {
    title: "再次抹除",
    type: "妥协结局",
    reachability: "可达",
    trigger: "掌握契约方法，并选择维持当前城市与幸存者的稳定。",
    playerChoice: "玩家亲自决定哪些名字继续留在记录之外。",
    revealedTruth: "玩家知道完整代价，但公众只会得到一次普通海难说明。",
    characterOutcome: "海曼继续守约；伊芙琳保留职位；斯诺森可能离开港口。",
    factionOutcome: "议会暂时维持权力，但欠下玩家一项政治债务。",
    unresolved: "被抹除者是否仍在等待；玩家的选择何时反噬。",
    carryover: "记录每位玩家支持或反对的名字，作为人物关系长期裂痕。",
  },
  {
    title: "让船靠港",
    type: "异变结局",
    reachability: "条件不足",
    trigger: "放弃阻止仪式，并保持舵轮、名册和灯塔三处锚点同时有效。",
    playerChoice: "玩家允许所有被删除者重新进入现实。",
    revealedTruth: "真名契约的全部机制会通过事件本身公开。",
    characterOutcome: "海曼的使命结束；旧船员归来；伊芙琳恢复全部记忆。",
    factionOutcome: "港务体系瘫痪，灰潮船员互助会成为新的公共力量。",
    unresolved: "归来者是否仍是原来的人；城市如何容纳二十年前的身份。",
    carryover: "下一阶段转为城市异变调查，地图增加灰潮街区。",
  },
  {
    title: "无人记得的清晨",
    type: "隐藏结局",
    reachability: "死分支",
    trigger: "所有角色同时放弃自己的登记姓名，但当前没有任何场景能提供这一选择。",
    playerChoice: "理论上由全员共同决定，现有文本没有清晰提示。",
    revealedTruth: "无；玩家无法理解该选择存在的原因。",
    characterOutcome: "所有主要 NPC 忘记调查者。",
    factionOutcome: "各阵营回到故事开始前的状态。",
    unresolved: "几乎全部主线问题都未回应。",
    carryover: "当前没有可用承接，应补入口或移除该分支。",
  },
];

interface CreativeEndingBranchWorkbenchProps {
  project: CreativeProject;
  onFeedback: (message: string) => void;
}

export function CreativeEndingBranchWorkbench({ project, onFeedback }: CreativeEndingBranchWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<EndingTab>("结局路径总览");
  const [selectedTitle, setSelectedTitle] = useState(endings[0].title);
  const [draft, setDraft] = useState(endings[0]);
  const selected = endings.find((ending) => ending.title === selectedTitle) ?? endings[0];

  function selectEnding(ending: EndingRecord) {
    setSelectedTitle(ending.title);
    setDraft(ending);
    onFeedback(`已定位结局“${ending.title}”的进入路径与后果。`);
  }

  function updateDraft<Key extends keyof EndingRecord>(key: Key, value: EndingRecord[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSaveEnding() {
    onFeedback(`已模拟保存“${draft.title}”的触发条件、结算与后续承接。`);
  }

  return (
    <section className="ending-workbench studio-board">
      <div className="studio-page-heading">
        <div><span className="eyebrow">主持人模组 · 结局分支</span><h2>结局不是答案页，而是选择留下的世界</h2><p>同时检查玩家如何抵达、真相公开多少、谁受到影响，以及故事结束后哪些问题仍会继续。</p></div>
        <button onClick={() => onFeedback("已模拟建立一个空白结局分支。")}>＋ 新建结局</button>
      </div>

      <section className="ending-metrics" aria-label="结局分支概况">
        <article><strong>4</strong><span>结局分支</span><small>主结局 3 · 隐藏 1</small></article>
        <article><strong>2</strong><span>当前可达</span><small>均保留玩家主动选择</small></article>
        <article><strong>11</strong><span>后果引用</span><small>人物 6 · 阵营 3 · 地点 2</small></article>
        <article className="risk"><strong>2</strong><span>结构风险</span><small>条件不足 1 · 死分支 1</small></article>
      </section>

      <div className="ending-layout">
        <aside className="ending-index">
          <header><strong>结局目录</strong><small>{endings.length} 条</small></header>
          <nav aria-label="结局分支列表">{endings.map((ending, index) => <button key={ending.title} className={selectedTitle === ending.title ? "active" : ""} onClick={() => selectEnding(ending)}><b>0{index + 1}</b><span><strong>{ending.title}</strong><small>{ending.type}</small></span><em data-reachability={ending.reachability}>{ending.reachability}</em></button>)}</nav>
          <section className="ending-principle"><span>结局设计原则</span><strong>选择产生后果</strong><p>不要只用隐藏积分替玩家做决定；关键结局必须留有能被理解的主动选择。</p></section>
        </aside>

        <article className="ending-editor">
          <header><div><span>{selected.type} · {selected.reachability}</span><h3>{selected.title}</h3><p>{selected.playerChoice}</p></div><button onClick={handleSaveEnding}>保存结局</button></header>
          <nav className="entity-tabs" aria-label="结局分支分区">{(["结局路径总览", "结局档案", "后果结算", "下一场承接", "可达性检查"] as EndingTab[]).map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>
          {activeTab === "结局路径总览" && <EndingOverview ending={selected} onFeedback={onFeedback} />}
          {activeTab === "结局档案" && <EndingProfile ending={draft} onChange={updateDraft} />}
          {activeTab === "后果结算" && <EndingConsequences ending={selected} />}
          {activeTab === "下一场承接" && <EndingCarryover ending={draft} onChange={updateDraft} onFeedback={onFeedback} />}
          {activeTab === "可达性检查" && <ReachabilityCheck onFeedback={onFeedback} />}
        </article>
      </div>
      <p className="workbench-context-note">当前项目：{project.title} · 结局分支引用主持人真相、玩家选择、场景出口、人物状态与阵营变化。</p>
    </section>
  );
}

function EndingOverview({ ending, onFeedback }: { ending: EndingRecord; onFeedback: (message: string) => void }) {
  return <div className="ending-overview"><section className="ending-path-map"><article className="ending-origin"><span>终幕场景</span><strong>灰潮号靠港</strong><small>玩家掌握的真相决定可见选项</small></article><div className="ending-paths">{endings.slice(0, 3).map((item) => <button key={item.title} className={item.title === ending.title ? "active" : ""} onClick={() => onFeedback(`已预览结局路径“${item.title}”。`)}><span>{item.reachability}</span><strong>{item.title}</strong><small>{item.type}</small></button>)}</div></section><section className="ending-trigger"><span>触发条件</span><strong>{ending.trigger}</strong><p><b>玩家选择</b>{ending.playerChoice}</p></section><section className="ending-reveal"><article><span>公开真相</span><p>{ending.revealedTruth}</p></article><article><span>未解决事项</span><p>{ending.unresolved}</p></article></section></div>;
}

function EndingProfile({ ending, onChange }: { ending: EndingRecord; onChange: <Key extends keyof EndingRecord>(key: Key, value: EndingRecord[Key]) => void }) {
  return <div className="entity-form ending-form"><label>结局名称<input value={ending.title} onChange={(event) => onChange("title", event.target.value)} /></label><label>结局类型<input value={ending.type} onChange={(event) => onChange("type", event.target.value)} /></label><label>可达状态<select value={ending.reachability} onChange={(event) => onChange("reachability", event.target.value as Reachability)}><option>可达</option><option>条件不足</option><option>死分支</option></select></label><label className="full-field">触发条件<textarea rows={4} value={ending.trigger} onChange={(event) => onChange("trigger", event.target.value)} /></label><label className="full-field">玩家选择<textarea rows={3} value={ending.playerChoice} onChange={(event) => onChange("playerChoice", event.target.value)} /></label><label className="full-field">公开真相<textarea rows={3} value={ending.revealedTruth} onChange={(event) => onChange("revealedTruth", event.target.value)} /></label></div>;
}

function EndingConsequences({ ending }: { ending: EndingRecord }) {
  return <div className="ending-consequence-panel"><header><strong>后果结算</strong><p>结局不会覆盖原始人物和阵营档案，只生成一次待确认的状态变化。</p></header><section><article><span>人物后果</span><strong>伊芙琳 · 斯诺森 · 海曼</strong><p>{ending.characterOutcome}</p></article><article><span>阵营后果</span><strong>港务议会 · 守灯人</strong><p>{ending.factionOutcome}</p></article><article><span>世界与地点</span><strong>萨菲港公开记录</strong><p>地图、公众认知和可用场景将依据该结局生成新状态。</p></article></section></div>;
}

function EndingCarryover({ ending, onChange, onFeedback }: { ending: EndingRecord; onChange: <Key extends keyof EndingRecord>(key: Key, value: EndingRecord[Key]) => void; onFeedback: (message: string) => void }) {
  return <div className="ending-carryover"><header><strong>下一场承接</strong><p>把结局转换为下一场需要知道的起点，而不是复制整份复盘。</p></header><label>承接摘要<textarea rows={5} value={ending.carryover} onChange={(event) => onChange("carryover", event.target.value)} /></label><section><article><span>带入事实</span><p>玩家公开过哪些真相、哪些 NPC 仍然信任他们。</p></article><article><span>继续追踪</span><p>{ending.unresolved}</p></article><article><span>建议开场</span><p>用一个直接体现上次选择后果的公共事件开场。</p></article></section><button onClick={() => onFeedback("已模拟从该结局生成下一场团前简报。")}>生成团前简报</button></div>;
}

function ReachabilityCheck({ onFeedback }: { onFeedback: (message: string) => void }) {
  return <div className="ending-reachability"><header><strong>可达性检查</strong><p>从现有场景、线索和玩家可理解的选择反向检查每个结局。</p></header><section><article className="clear"><b>路径完整</b><div><strong>“公开名册”拥有两条进入路径</strong><p>说服伊芙琳或取得原始命令都能解锁公开选择。</p></div><button onClick={() => onFeedback("已打开公开名册的路径图。")}>查看路径</button></article><article className="warning"><b>条件不足</b><div><strong>“让船靠港”缺少舵轮锚点提示</strong><p>玩家可能不知道三个锚点需要同时有效，建议在甲板场景补一次环境反馈。</p></div><button onClick={() => onFeedback("已模拟添加舵轮锚点提示。")}>补充提示</button></article><article className="danger"><b>死分支</b><div><strong>“无人记得的清晨”没有任何可达入口</strong><p>没有场景提出放弃登记姓名的可能，也没有 NPC 能解释这项选择。</p></div><button onClick={() => onFeedback("已标记该死分支等待补入口或删除。")}>标记待处理</button></article></section></div>;
}
