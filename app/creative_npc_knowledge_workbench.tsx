"use client";

import { useState } from "react";
import type { CreativeProject } from "./creative_project_data";

type KnowledgeTab = "NPC 知情总览" | "知情档案" | "披露条件" | "回答模拟" | "全知风险检查";
type KnowledgeState = "安全" | "注意" | "高风险";

interface NpcKnowledgeRecord {
  name: string;
  role: string;
  state: KnowledgeState;
  knows: string;
  believes: string;
  willReveal: string;
  revealCondition: string;
  neverKnows: string;
  voice: string;
}

const npcRecords: NpcKnowledgeRecord[] = [
  {
    name: "伊芙琳",
    role: "港务官 · 委托人",
    state: "注意",
    knows: "值班名册被替换；斯诺森当晚在码头；议会要求她保持沉默。",
    believes: "她误以为斯诺森参与了涂改，并相信封锁消息可以保护港口。",
    willReveal: "斯诺森的位置、外貌和工种；在取得信任后承认存在两份名册。",
    revealCondition: "玩家指出两份记录的时间矛盾，或以保护港口而非追责为承诺。",
    neverKnows: "海曼目前藏在灯塔地下层；真名契约的完整运作方式。",
    voice: "克制、正式，回答前会先确认问题会不会影响港务秩序。",
  },
  {
    name: "斯诺森",
    role: "码头装卸工 · 目击者",
    state: "安全",
    knows: "二十年前灰潮号卸下过没有登记姓名的乘客；海曼曾取走名册原页。",
    believes: "他相信议会一直在监视幸存者，但不知道监视者究竟是谁。",
    willReveal: "卸货经过、海曼离开方向；得到保护后才愿意指出议会联络人。",
    revealCondition: "确认没有港务处人员在场，或玩家先安排安全藏身处。",
    neverKnows: "伊芙琳当年的选择；灰潮号今晚确切靠港时间。",
    voice: "短句、回避姓名；受到追问时先谈路线和货物，不直接谈人。",
  },
  {
    name: "守灯人莫里",
    role: "旧灯塔看守 · 海曼盟友",
    state: "高风险",
    knows: "海曼仍然活着并藏在地下层；旧钥匙可以避开入口仪式。",
    believes: "任何代表港务处来的人都会把海曼再次从记录中抹去。",
    willReveal: "灯塔有地下空间；持有旧钥匙的人曾获得海曼信任。",
    revealCondition: "出示旧钥匙并说明来源，或完成修复雾灯的请求。",
    neverKnows: "议会内部谁主持契约；斯诺森当前住址。",
    voice: "以海况和灯火作比喻，拒绝回答超出亲眼所见的政治问题。",
  },
];

const disclosureEvents = [
  { label: "开场可说", detail: "斯诺森在码头工作，临近下班。", state: "玩家已触发" },
  { label: "矛盾被指出", detail: "承认存在两份版本不同的值班名册。", state: "等待触发" },
  { label: "建立信任", detail: "说明议会曾要求她停止追查海曼。", state: "锁定" },
  { label: "终幕后", detail: "承认自己曾主动签署档案清理命令。", state: "未到阶段" },
];

interface CreativeNpcKnowledgeWorkbenchProps {
  project: CreativeProject;
  onFeedback: (message: string) => void;
}

export function CreativeNpcKnowledgeWorkbench({
  project,
  onFeedback,
}: CreativeNpcKnowledgeWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<KnowledgeTab>("NPC 知情总览");
  const [selectedName, setSelectedName] = useState(npcRecords[0].name);
  const [draft, setDraft] = useState(npcRecords[0]);
  const selected = npcRecords.find((record) => record.name === selectedName) ?? npcRecords[0];

  function selectNpc(record: NpcKnowledgeRecord) {
    setSelectedName(record.name);
    setDraft(record);
    onFeedback(`已切换到“${record.name}”的知情边界。`);
  }

  function updateDraft<Key extends keyof NpcKnowledgeRecord>(key: Key, value: NpcKnowledgeRecord[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSaveKnowledge() {
    onFeedback(`已模拟保存“${draft.name}”的知识、误解、披露条件与 AI 边界。`);
  }

  return (
    <section className="npc-knowledge-workbench studio-board">
      <div className="studio-page-heading">
        <div>
          <span className="eyebrow">主持人模组 · NPC 知情与披露</span>
          <h2>角色只能回答自己知道的世界</h2>
          <p>把事实、误解、意愿与触发条件分开，避免 AI 因为读过完整剧本而让每个人都像全知者。</p>
        </div>
        <button onClick={() => onFeedback("已模拟建立一个空白 NPC 知情档案。")}>＋ 新建知情档案</button>
      </div>

      <section className="npc-knowledge-metrics" aria-label="NPC 知情概况">
        <article><strong>9</strong><span>NPC 知情档案</span><small>与角色档案分开维护</small></article>
        <article><strong>24</strong><span>可披露事实</span><small>其中 11 条有条件</small></article>
        <article><strong>7</strong><span>主动误解</span><small>可用于自然的不可靠叙述</small></article>
        <article className="risk"><strong>2</strong><span>全知风险</span><small>越过地点或身份边界</small></article>
      </section>

      <div className="npc-knowledge-layout">
        <aside className="npc-knowledge-index">
          <header><strong>人物目录</strong><small>{npcRecords.length} / 9</small></header>
          <nav aria-label="NPC 知情档案列表">
            {npcRecords.map((record, index) => (
              <button key={record.name} className={selectedName === record.name ? "active" : ""} onClick={() => selectNpc(record)}>
                <b>0{index + 1}</b>
                <span><strong>{record.name}</strong><small>{record.role}</small></span>
                <em data-state={record.state}>{record.state}</em>
              </button>
            ))}
          </nav>
          <section className="npc-ai-boundary-note">
            <span>AI 可用边界</span>
            <strong>当前角色 + 当前阶段</strong>
            <p>回答时只检索该 NPC 已知、相信及已解锁内容；“绝不知情”是硬性禁止区。</p>
          </section>
        </aside>

        <article className="npc-knowledge-editor">
          <header>
            <div><span>{selected.role}</span><h3>{selected.name}</h3><p>边界状态：{selected.state} · 当前以第 2 幕开始前为准</p></div>
            <button onClick={handleSaveKnowledge}>保存知情档案</button>
          </header>
          <nav className="entity-tabs" aria-label="NPC 知情分区">
            {(["NPC 知情总览", "知情档案", "披露条件", "回答模拟", "全知风险检查"] as KnowledgeTab[]).map((tab) => (
              <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </nav>

          {activeTab === "NPC 知情总览" && <KnowledgeOverview record={selected} />}
          {activeTab === "知情档案" && <KnowledgeProfile record={draft} onChange={updateDraft} />}
          {activeTab === "披露条件" && <DisclosureConditions onFeedback={onFeedback} />}
          {activeTab === "回答模拟" && <ResponseSimulator record={selected} onFeedback={onFeedback} />}
          {activeTab === "全知风险检查" && <OmniscienceCheck onFeedback={onFeedback} />}
        </article>
      </div>
      <p className="workbench-context-note">当前项目：{project.title} · 知情边界可关联场次阶段、玩家已获线索、NPC 关系与临场口胡记录。</p>
    </section>
  );
}

function KnowledgeOverview({ record }: { record: NpcKnowledgeRecord }) {
  const cards = [
    { label: "确定知道", body: record.knows, tone: "known" },
    { label: "误以为", body: record.believes, tone: "belief" },
    { label: "愿意透露", body: record.willReveal, tone: "reveal" },
    { label: "披露条件", body: record.revealCondition, tone: "condition" },
    { label: "绝不知情", body: record.neverKnows, tone: "forbidden" },
  ];
  return (
    <div className="knowledge-overview-panel">
      <section className="knowledge-boundary-cards">
        {cards.map((card) => <article key={card.label} className={card.tone}><span>{card.label}</span><p>{card.body}</p></article>)}
      </section>
      <aside><span>扮演提示</span><strong>{record.voice}</strong><p>这部分控制表达方式，不会扩大角色的信息权限。</p></aside>
    </div>
  );
}

function KnowledgeProfile({ record, onChange }: { record: NpcKnowledgeRecord; onChange: <Key extends keyof NpcKnowledgeRecord>(key: Key, value: NpcKnowledgeRecord[Key]) => void }) {
  return (
    <div className="entity-form npc-knowledge-form">
      <label>NPC 名称<input value={record.name} onChange={(event) => onChange("name", event.target.value)} /></label>
      <label>身份与场景<input value={record.role} onChange={(event) => onChange("role", event.target.value)} /></label>
      <label className="full-field known-field">确定知道<textarea rows={4} value={record.knows} onChange={(event) => onChange("knows", event.target.value)} /></label>
      <label>误以为<textarea rows={5} value={record.believes} onChange={(event) => onChange("believes", event.target.value)} /></label>
      <label>愿意透露<textarea rows={5} value={record.willReveal} onChange={(event) => onChange("willReveal", event.target.value)} /></label>
      <label>披露条件<textarea rows={5} value={record.revealCondition} onChange={(event) => onChange("revealCondition", event.target.value)} /></label>
      <label className="forbidden-field">绝不知情<textarea rows={5} value={record.neverKnows} onChange={(event) => onChange("neverKnows", event.target.value)} /></label>
      <label className="full-field">说话与回避方式<textarea rows={3} value={record.voice} onChange={(event) => onChange("voice", event.target.value)} /></label>
    </div>
  );
}

function DisclosureConditions({ onFeedback }: { onFeedback: (message: string) => void }) {
  return (
    <div className="disclosure-condition-panel">
      <header><div><strong>披露时间轴</strong><span>锁定内容不会因为玩家问得直接就自动解锁</span></div><button onClick={() => onFeedback("已模拟添加一个披露条件。")}>＋ 添加条件</button></header>
      <div className="disclosure-event-list">
        {disclosureEvents.map((event, index) => (
          <article key={event.label}><b>0{index + 1}</b><div><span>{event.label}</span><strong>{event.detail}</strong></div><em data-state={event.state}>{event.state}</em><button onClick={() => onFeedback(`已模拟切换“${event.label}”的触发状态。`)}>变更状态</button></article>
        ))}
      </div>
      <section className="trigger-context"><strong>本场上下文</strong><span>玩家已触发：询问斯诺森位置、外貌、工种</span><span>尚未触发：名册矛盾、旧钥匙、海曼姓名</span></section>
    </div>
  );
}

function ResponseSimulator({ record, onFeedback }: { record: NpcKnowledgeRecord; onFeedback: (message: string) => void }) {
  return (
    <div className="npc-response-simulator">
      <header><span className="eyebrow">回答模拟</span><h4>“斯诺森是不是灰潮号上的人？”</h4><p>模拟只使用当前 NPC 边界与本场已触发信息。</p></header>
      <section className="simulated-response"><span>{record.name}可以这样回答</span><blockquote>“我只能确认他在码头做装卸。至于二十年前那条船……现存名册上没有他的名字。”</blockquote><small>保留角色措辞：克制 · 回避动机 · 不替玩家下结论</small></section>
      <section className="response-source-split"><article><b>依据</b><p>知道斯诺森的职业，知道现存名册没有他的名字。</p></article><article><b>刻意保留</b><p>尚未满足披露两份名册的条件，不提海曼与契约。</p></article></section>
      <button onClick={() => onFeedback("已模拟生成另一种仍符合知情边界的说法。")}>换一种说法</button>
    </div>
  );
}

function OmniscienceCheck({ onFeedback }: { onFeedback: (message: string) => void }) {
  return (
    <div className="omniscience-check-panel">
      <header><span className="eyebrow">全知风险检查</span><h4>哪些回答会让 NPC 知道不该知道的事？</h4></header>
      <section>
        <article className="danger"><b>越过身份边界</b><div><strong>伊芙琳不能说“海曼正在灯塔地下”</strong><p>该事实只属于守灯人与海曼；建议改为“有人持续向灯塔运送补给”。</p></div><button onClick={() => onFeedback("已将越界事实加入 AI 硬性禁止区。")}>加入禁止区</button></article>
        <article className="warning"><b>把误解说成事实</b><div><strong>“斯诺森参与涂改”目前只是伊芙琳的判断</strong><p>回答必须带有怀疑、推测或个人立场，不能作为剧本事实陈述。</p></div><button onClick={() => onFeedback("已把该内容标记为 NPC 主张。")}>标为主张</button></article>
        <article className="clear"><b>边界安全</b><div><strong>斯诺森可以描述卸货路线</strong><p>这是亲历信息，不暴露他不知道的契约原理或议会名单。</p></div><button onClick={() => onFeedback("已打开斯诺森的回答模拟。")}>模拟回答</button></article>
      </section>
    </div>
  );
}
