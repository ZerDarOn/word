"use client";

import { useState } from "react";
import type { CreativeProject } from "./creative_project_data";

type SceneTab = "场景运行总览" | "场景运行卡" | "检定与失败推进" | "NPC 与披露" | "出口与后果";
type SceneState = "未进入" | "进行中" | "已离开" | "已改变";

interface SceneRecord {
  title: string;
  kind: string;
  state: SceneState;
  goal: string;
  entrances: string;
  visible: string;
  hidden: string;
  atmosphere: string;
}

const scenes: SceneRecord[] = [
  {
    title: "港务处",
    kind: "开放调查场景",
    state: "进行中",
    goal: "让玩家确认斯诺森的位置，并注意到港务档案存在矛盾。",
    entrances: "接受伊芙琳委托；调查失踪者；追查灰潮号旧记录。",
    visible: "繁忙柜台、临近下班的职员、公开值班表、无法封锁的人流。",
    hidden: "档案室内有第二份名册；伊芙琳收到过停止调查的命令。",
    atmosphere: "表面井然有序，所有人都在避免谈论二十年前。",
  },
  {
    title: "码头下班口",
    kind: "动态接触场景",
    state: "未进入",
    goal: "让玩家接触或跟踪斯诺森，不因一次失败彻底失去目标。",
    entrances: "等待下班；从工头处获取轮班路线；在食堂出口拦截。",
    visible: "工人散场、货车进出、三处公共出口和一条工棚小路。",
    hidden: "斯诺森发现有人观察自己；议会眼线混在搬运工中。",
    atmosphere: "嘈杂、拥挤，任何明显抓捕都会迅速引发围观。",
  },
  {
    title: "旧灯塔地下层",
    kind: "门槛探索场景",
    state: "已改变",
    goal: "揭示海曼仍然活着，并让玩家理解真名契约的代价。",
    entrances: "旧钥匙；守灯人引路；破门后承受契约反噬。",
    visible: "停转的机械、盐迹、新鲜补给和通往地下的铁门。",
    hidden: "海曼就在下层；开启铁门会让灰潮号提前靠港。",
    atmosphere: "风声消失，只剩机械中像心跳一样的回响。",
  },
];

const checks = [
  { name: "查阅值班表", skill: "图书馆 / 调查", success: "辨认两份记录的墨水差异，并发现缺页压痕。", failure: "仍发现页码断裂；伊芙琳建议去档案室核对原件。" },
  { name: "说服伊芙琳", skill: "说服 / 洞悉", success: "她承认议会要求停止追查，并透露第二份名册。", failure: "她只提供斯诺森位置；态度转为谨慎，但场景继续。" },
  { name: "寻找监视者", skill: "侦查 / 察觉", success: "发现一名反复经过柜台的议会眼线。", failure: "眼线先一步离开，在码头场景留下可追踪的湿脚印。" },
];

const exits = [
  { title: "前往码头", condition: "获得斯诺森位置", consequence: "开启下班倒计时；斯诺森尚未警觉。", status: "已解锁" },
  { title: "深入档案室", condition: "指出名册矛盾或取得职员信任", consequence: "获得名册压痕；伊芙琳压力上升 1。", status: "可触发" },
  { title: "直接质问议会", condition: "掌握停止调查命令", consequence: "议会进入戒备；码头眼线提前行动。", status: "未解锁" },
];

interface CreativeSceneNodeWorkbenchProps {
  project: CreativeProject;
  onFeedback: (message: string) => void;
}

export function CreativeSceneNodeWorkbench({ project, onFeedback }: CreativeSceneNodeWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<SceneTab>("场景运行总览");
  const [selectedTitle, setSelectedTitle] = useState(scenes[0].title);
  const [draft, setDraft] = useState(scenes[0]);
  const selected = scenes.find((scene) => scene.title === selectedTitle) ?? scenes[0];

  function selectScene(scene: SceneRecord) {
    setSelectedTitle(scene.title);
    setDraft(scene);
    onFeedback(`已切换到场景“${scene.title}”。`);
  }

  function updateDraft<Key extends keyof SceneRecord>(key: Key, value: SceneRecord[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSaveScene() {
    onFeedback(`已模拟保存“${draft.title}”的运行内容、检定与出口。`);
  }

  return (
    <section className="scene-node-workbench studio-board">
      <div className="studio-page-heading">
        <div>
          <span className="eyebrow">主持人模组 · 场景节点</span>
          <h2>打开一张卡，就能把场景跑下去</h2>
          <p>把描述、行动空间、知情 NPC、线索和失败后的推进放在同一个运行视图中。</p>
        </div>
        <button onClick={() => onFeedback("已模拟建立一个空白场景节点。")}>＋ 新建场景</button>
      </div>

      <section className="scene-node-metrics" aria-label="场景节点概况">
        <article><strong>11</strong><span>场景节点</span><small>开放 5 · 门槛 3 · 动态 3</small></article>
        <article><strong>27</strong><span>进入方式</span><small>2 个场景仅有单一入口</small></article>
        <article><strong>34</strong><span>可获得信息</span><small>全部关联线索网络</small></article>
        <article className="risk"><strong>2</strong><span>运行风险</span><small>单点入口 1 · 死路出口 1</small></article>
      </section>

      <div className="scene-node-layout">
        <aside className="scene-node-index">
          <header><strong>场景目录</strong><small>{scenes.length} / 11</small></header>
          <nav aria-label="场景节点列表">
            {scenes.map((scene, index) => (
              <button key={scene.title} className={selectedTitle === scene.title ? "active" : ""} onClick={() => selectScene(scene)}>
                <b>0{index + 1}</b><span><strong>{scene.title}</strong><small>{scene.kind}</small></span><em data-state={scene.state}>{scene.state}</em>
              </button>
            ))}
          </nav>
          <section className="scene-live-state">
            <span>场景状态</span><strong>{selected.state}</strong>
            <p>状态变化只记录本次运行，不会自动覆盖剧本原始设定。</p>
            <button onClick={() => onFeedback("已模拟记录本场场景状态。")}>记录当前状态</button>
          </section>
        </aside>

        <article className="scene-node-editor">
          <header><div><span>{selected.kind}</span><h3>{selected.title}</h3><p>{selected.goal}</p></div><button onClick={handleSaveScene}>保存场景</button></header>
          <nav className="entity-tabs" aria-label="场景节点分区">
            {(["场景运行总览", "场景运行卡", "检定与失败推进", "NPC 与披露", "出口与后果"] as SceneTab[]).map((tab) => (
              <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </nav>
          {activeTab === "场景运行总览" && <SceneOverview scene={selected} onFeedback={onFeedback} />}
          {activeTab === "场景运行卡" && <SceneRunCard scene={draft} onChange={updateDraft} />}
          {activeTab === "检定与失败推进" && <SceneChecks onFeedback={onFeedback} />}
          {activeTab === "NPC 与披露" && <SceneNpcDisclosure onFeedback={onFeedback} />}
          {activeTab === "出口与后果" && <SceneExits onFeedback={onFeedback} />}
        </article>
      </div>
      <p className="workbench-context-note">当前项目：{project.title} · 场景节点可引用地点地图、NPC 知情、线索网络、BGM 与场次临时状态。</p>
    </section>
  );
}

function SceneOverview({ scene, onFeedback }: { scene: SceneRecord; onFeedback: (message: string) => void }) {
  return (
    <div className="scene-overview-panel">
      <section className="scene-briefing-card">
        <header><span>场景目标</span><strong>{scene.goal}</strong></header>
        <div><article><span>玩家可见</span><p>{scene.visible}</p></article><article className="hidden"><span>主持人隐藏</span><p>{scene.hidden}</p></article></div>
        <footer><span>气氛提示</span><p>{scene.atmosphere}</p><button onClick={() => onFeedback("已模拟打开关联 BGM 建议。")}>查看 BGM</button></footer>
      </section>
      <section className="scene-runtime-grid">
        <article><span>进入方式</span><strong>3 条</strong><p>{scene.entrances}</p></article>
        <article><span>在场 NPC</span><strong>伊芙琳 · 两名职员</strong><p>披露条件随玩家行动变化。</p></article>
        <article><span>关键线索</span><strong>4 条</strong><p>斯诺森位置、值班表、名册压痕、议会眼线。</p></article>
        <article><span>出口</span><strong>3 条</strong><p>码头、档案室、议会；至少一条无检定门槛。</p></article>
      </section>
      <section className="scene-quick-actions"><strong>临场记录</strong><button onClick={() => onFeedback("已记录：玩家正在怀疑伊芙琳隐瞒信息。")}>记录玩家判断</button><button onClick={() => onFeedback("已建立一条标记为 AI 新编的场景事实。")}>记录临场新编</button><button onClick={() => onFeedback("已模拟推进场景时钟。")}>推进场景时钟</button></section>
    </div>
  );
}

function SceneRunCard({ scene, onChange }: { scene: SceneRecord; onChange: <Key extends keyof SceneRecord>(key: Key, value: SceneRecord[Key]) => void }) {
  return (
    <div className="entity-form scene-run-form">
      <label>场景名称<input value={scene.title} onChange={(event) => onChange("title", event.target.value)} /></label>
      <label>场景类型<input value={scene.kind} onChange={(event) => onChange("kind", event.target.value)} /></label>
      <label>场景状态<select value={scene.state} onChange={(event) => onChange("state", event.target.value as SceneState)}><option>未进入</option><option>进行中</option><option>已离开</option><option>已改变</option></select></label>
      <label className="full-field">场景目标<textarea rows={3} value={scene.goal} onChange={(event) => onChange("goal", event.target.value)} /></label>
      <label className="full-field">进入方式<textarea rows={3} value={scene.entrances} onChange={(event) => onChange("entrances", event.target.value)} /></label>
      <label>玩家可见<textarea rows={5} value={scene.visible} onChange={(event) => onChange("visible", event.target.value)} /></label>
      <label className="scene-hidden-field">主持人隐藏<textarea rows={5} value={scene.hidden} onChange={(event) => onChange("hidden", event.target.value)} /></label>
      <label className="full-field">感官与气氛<textarea rows={3} value={scene.atmosphere} onChange={(event) => onChange("atmosphere", event.target.value)} /></label>
    </div>
  );
}

function SceneChecks({ onFeedback }: { onFeedback: (message: string) => void }) {
  return <div className="scene-check-panel"><header><div><strong>检定与失败推进</strong><span>检定决定代价与信息质量，不决定故事能不能继续</span></div><button onClick={() => onFeedback("已模拟添加一个场景检定。")}>＋ 添加检定</button></header><section>{checks.map((check, index) => <article key={check.name}><header><b>0{index + 1}</b><div><span>{check.skill}</span><strong>{check.name}</strong></div></header><div><section><span>成功</span><p>{check.success}</p></section><section className="failure"><span>失败推进</span><p>{check.failure}</p></section></div><button onClick={() => onFeedback(`已模拟编辑“${check.name}”。`)}>编辑检定</button></article>)}</section></div>;
}

function SceneNpcDisclosure({ onFeedback }: { onFeedback: (message: string) => void }) {
  return <div className="scene-npc-panel"><header><strong>NPC 与披露</strong><p>这里只显示本场可用切片；完整内容仍由 NPC 知情档案维护。</p></header><section><article><b>伊芙琳</b><div><span>当前可以说</span><p>斯诺森的位置、外貌、工种；码头无法完全封锁。</p><span>尚未解锁</span><p>两份名册、议会命令、海曼姓名。</p></div><button onClick={() => onFeedback("已打开伊芙琳的完整知情档案。")}>打开知情档案</button></article><article><b>值班职员</b><div><span>当前可以说</span><p>今天的轮班、斯诺森常走的出口。</p><span>绝不知情</span><p>真名契约、灰潮号当前状态。</p></div><button onClick={() => onFeedback("已模拟建立值班职员的知情档案。")}>补充档案</button></article></section></div>;
}

function SceneExits({ onFeedback }: { onFeedback: (message: string) => void }) {
  return <div className="scene-exit-panel"><header><strong>出口与后果</strong><p>玩家离开场景时，记录他们去了哪里以及世界发生了什么变化。</p></header><section>{exits.map((exit, index) => <article key={exit.title}><b>0{index + 1}</b><div><span>{exit.condition}</span><strong>{exit.title}</strong><p>{exit.consequence}</p></div><em data-status={exit.status}>{exit.status}</em><button onClick={() => onFeedback(`已模拟从“港务处”前往“${exit.title}”。`)}>选择出口</button></article>)}</section><aside><span>死路保护</span><strong>即使所有检定失败，“前往码头”仍保持开放。</strong><p>玩家可以失去优势、增加风险或晚一步，但不会因为没有掷出成功就无事可做。</p></aside></div>;
}
