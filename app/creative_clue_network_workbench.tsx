"use client";

import { useState } from "react";
import type { CreativeProject } from "./creative_project_data";

type NetworkTab = "线索网络总览" | "关键结论" | "获得路径" | "网络健康检查";
type ConclusionHealth = "稳固" | "风险" | "薄弱";

interface ConclusionRecord {
  title: string;
  category: string;
  importance: string;
  visibility: string;
  health: ConclusionHealth;
  support: number;
  summary: string;
  consequence: string;
}

interface EvidencePath {
  id: string;
  title: string;
  kind: string;
  strength: string;
  acquisition: string;
  scene: string;
  npc: string;
  failedProgress: string;
}

const conclusions: ConclusionRecord[] = [
  {
    title: "名册被人为修改",
    category: "档案谜题 / 核心结论",
    importance: "主线",
    visibility: "主持人可见",
    health: "稳固",
    support: 3,
    summary: "值班名册上的缺页并非自然损坏，有人刻意删除了与灰潮号有关的姓名。",
    consequence: "玩家会把调查从“寻找失踪工人”推进到“谁在修改公共记录”。",
  },
  {
    title: "灰潮号将再次靠港",
    category: "时间压力 / 核心结论",
    importance: "主线",
    visibility: "主持人可见",
    health: "稳固",
    support: 3,
    summary: "异常潮汐、无线电残响和旧船票日期共同指向今晚。",
    consequence: "调查获得明确倒计时，玩家需要在午夜前决定如何处理真名契约。",
  },
  {
    title: "海曼仍然活着",
    category: "人物真相 / 隐藏结论",
    importance: "主线",
    visibility: "隐藏",
    health: "风险",
    support: 2,
    summary: "海曼并未随船失踪，而是在灯塔地下层维持契约。",
    consequence: "斯诺森的嫌疑会下降，冲突中心转向港务议会。",
  },
  {
    title: "议会知道真名契约",
    category: "阵营秘密 / 可选结论",
    importance: "支线",
    visibility: "隐藏",
    health: "薄弱",
    support: 1,
    summary: "至少一名议员参与了二十年前的档案清理，但现有来源过于单一。",
    consequence: "解锁对议会的质询与政治交涉路线。",
  },
];

const evidencePaths: EvidencePath[] = [
  {
    id: "indentation",
    title: "名册压痕",
    kind: "实物证据",
    strength: "直接支持",
    acquisition: "检查值班名册；侦查成功可辨认被涂去的姓氏。",
    scene: "港务处 · 档案室",
    npc: "伊芙琳",
    failedProgress: "即使检定失败，仍发现纸张被替换；完整姓氏可由守灯人的旧抄本补足。",
  },
  {
    id: "ink",
    title: "墨水年份",
    kind: "鉴定证据",
    strength: "间接支持",
    acquisition: "向文具商求证，或使用历史 / 工艺类能力分析墨水。",
    scene: "旧城区 · 布莱克文具店",
    npc: "布莱克先生",
    failedProgress: "无法判断准确年份，但能确认涂改晚于原始记录；店主会给出港务处采购方向。",
  },
  {
    id: "testimony",
    title: "守灯人口供",
    kind: "人物证词",
    strength: "交叉印证",
    acquisition: "取得信任、出示旧钥匙，或先帮助修复灯塔设备。",
    scene: "旧灯塔 · 值守室",
    npc: "守灯人莫里",
    failedProgress: "对方拒绝说出姓名，但会警告“别相信现在那本名册”，把玩家引回档案矛盾。",
  },
];

interface CreativeClueNetworkWorkbenchProps {
  project: CreativeProject;
  onFeedback: (message: string) => void;
}

export function CreativeClueNetworkWorkbench({
  project,
  onFeedback,
}: CreativeClueNetworkWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<NetworkTab>("线索网络总览");
  const [healthFilter, setHealthFilter] = useState<"全部" | ConclusionHealth>("全部");
  const [selectedTitle, setSelectedTitle] = useState(conclusions[0].title);
  const [draft, setDraft] = useState(conclusions[0]);
  const selectedConclusion = conclusions.find((item) => item.title === selectedTitle) ?? conclusions[0];
  const visibleConclusions = conclusions.filter(
    (item) => healthFilter === "全部" || item.health === healthFilter,
  );

  function selectConclusion(conclusion: ConclusionRecord) {
    setSelectedTitle(conclusion.title);
    setDraft(conclusion);
    onFeedback(`已定位结论“${conclusion.title}”及其支持路径。`);
  }

  function updateDraft<Key extends keyof ConclusionRecord>(
    key: Key,
    value: ConclusionRecord[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSaveConclusion() {
    onFeedback(`已模拟保存“${draft.title}”的关键结论、支持度与失败推进方案。`);
  }

  return (
    <section className="clue-network-workbench studio-board">
      <div className="studio-page-heading">
        <div>
          <span className="eyebrow">主持人模组 · 线索网络</span>
          <h2>让真相有不止一条抵达路径</h2>
          <p>从关键结论反查支持证据、获得方式与失败推进，提前发现一次检定就能堵死的单点门槛。</p>
        </div>
        <button onClick={() => onFeedback("已模拟建立一条空白关键结论。")}>＋ 新建结论</button>
      </div>

      <section className="clue-network-metrics" aria-label="线索网络概况">
        <article><strong>4</strong><span>关键结论</span><small>主线 3 · 支线 1</small></article>
        <article><strong>9</strong><span>支持证据</span><small>实物、证词与环境信息</small></article>
        <article><strong>2</strong><span>网络稳固</span><small>满足三线索原则</small></article>
        <article className="risk"><strong>2</strong><span>存在风险</span><small>少于 3 条独立路径</small></article>
      </section>

      <div className="clue-network-layout">
        <aside className="conclusion-index">
          <header><strong>结论目录</strong><small>{conclusions.length} 条</small></header>
          <div className="conclusion-filters" aria-label="按网络健康状态筛选">
            {(["全部", "稳固", "风险", "薄弱"] as const).map((filter) => (
              <button
                key={filter}
                className={healthFilter === filter ? "active" : ""}
                aria-pressed={healthFilter === filter}
                onClick={() => setHealthFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <nav aria-label="关键结论列表">
            {visibleConclusions.map((conclusion, index) => (
              <button
                key={conclusion.title}
                className={selectedTitle === conclusion.title ? "active" : ""}
                onClick={() => selectConclusion(conclusion)}
              >
                <b>0{index + 1}</b>
                <span><strong>{conclusion.title}</strong><small>{conclusion.category}</small></span>
                <em data-health={conclusion.health}>{conclusion.support}/3</em>
              </button>
            ))}
          </nav>
          <section className="three-clue-principle">
            <span>设计基线</span>
            <strong>三线索原则</strong>
            <p>每个必须得出的结论，至少准备三条互相独立的抵达路径。</p>
          </section>
        </aside>

        <article className="clue-network-editor">
          <header>
            <div>
              <span>{selectedConclusion.category}</span>
              <h3>{selectedConclusion.title}</h3>
              <p>支持度 {selectedConclusion.support}/3 · 网络状态：{selectedConclusion.health}</p>
            </div>
            <button onClick={handleSaveConclusion}>保存结论</button>
          </header>

          <nav className="entity-tabs" aria-label="线索网络分区">
            {(["线索网络总览", "关键结论", "获得路径", "网络健康检查"] as NetworkTab[]).map((tab) => (
              <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </nav>

          {activeTab === "线索网络总览" && (
            <NetworkOverview
              conclusion={selectedConclusion}
              onFeedback={onFeedback}
            />
          )}
          {activeTab === "关键结论" && (
            <ConclusionProfile conclusion={draft} onChange={updateDraft} />
          )}
          {activeTab === "获得路径" && (
            <AcquisitionPaths onFeedback={onFeedback} />
          )}
          {activeTab === "网络健康检查" && (
            <NetworkHealthCheck onFeedback={onFeedback} />
          )}
        </article>
      </div>

      <p className="workbench-context-note">当前项目：{project.title} · 结论可反向关联物件线索、NPC 知情、场景节点与团后口胡归档。</p>
    </section>
  );
}

function NetworkOverview({
  conclusion,
  onFeedback,
}: {
  conclusion: ConclusionRecord;
  onFeedback: (message: string) => void;
}) {
  return (
    <div className="network-overview-panel">
      <header>
        <div><strong>结论—证据网络</strong><span>线条表达“支持”，不是发生顺序</span></div>
        <div className="network-legend"><span><i className="direct" />直接</span><span><i />间接</span><span><i className="fallback" />替代路径</span></div>
      </header>
      <div className="clue-network-canvas" aria-label={`${conclusion.title}的支持证据网络`}>
        <svg viewBox="0 0 760 360" role="img" aria-label="支持证据与关键结论连线">
          <path className="direct" d="M205 82 C300 82 290 180 380 180" />
          <path d="M205 278 C300 278 290 180 380 180" />
          <path d="M555 82 C470 82 475 180 380 180" />
          <path className="fallback" d="M555 278 C470 278 475 180 380 180" />
        </svg>
        <button className="network-node evidence-one" onClick={() => onFeedback("已打开物件线索“名册压痕”。")}>
          <span>实物证据</span><strong>名册压痕</strong><small>港务处 · 检查</small>
        </button>
        <button className="network-node evidence-two" onClick={() => onFeedback("已打开鉴定证据“墨水年份”。")}>
          <span>鉴定证据</span><strong>墨水年份</strong><small>文具店 · 求证</small>
        </button>
        <article className="network-conclusion-node">
          <span>关键结论</span><strong>{conclusion.title}</strong><small>支持度 {conclusion.support}/3</small>
        </article>
        <button className="network-node evidence-three" onClick={() => onFeedback("已打开 NPC“守灯人莫里”的知情档案。")}>
          <span>人物证词</span><strong>守灯人口供</strong><small>旧灯塔 · 取信</small>
        </button>
        <button className="network-node evidence-four" onClick={() => onFeedback("已模拟建立一条替代线索。")}>
          <span>替代路径</span><strong>旧抄本残页</strong><small>检定失败后可用</small>
        </button>
      </div>
      <section className="network-outcome-note">
        <div><span>得出结论后</span><strong>{conclusion.consequence}</strong></div>
        <button onClick={() => onFeedback("已打开该结论影响的故事节点。")}>查看后续影响</button>
      </section>
    </div>
  );
}

function ConclusionProfile({
  conclusion,
  onChange,
}: {
  conclusion: ConclusionRecord;
  onChange: <Key extends keyof ConclusionRecord>(key: Key, value: ConclusionRecord[Key]) => void;
}) {
  return (
    <div className="entity-form conclusion-profile">
      <label>结论名称<input value={conclusion.title} onChange={(event) => onChange("title", event.target.value)} /></label>
      <label>分类<input value={conclusion.category} onChange={(event) => onChange("category", event.target.value)} /></label>
      <label>重要程度
        <select value={conclusion.importance} onChange={(event) => onChange("importance", event.target.value)}>
          <option>主线</option><option>支线</option><option>可选发现</option><option>气氛补充</option>
        </select>
      </label>
      <label>可见范围
        <select value={conclusion.visibility} onChange={(event) => onChange("visibility", event.target.value)}>
          <option>主持人可见</option><option>隐藏</option><option>玩家已知</option>
        </select>
      </label>
      <label className="full-field">结论内容<textarea rows={5} value={conclusion.summary} onChange={(event) => onChange("summary", event.target.value)} /></label>
      <label className="full-field">得出后会改变什么<textarea rows={4} value={conclusion.consequence} onChange={(event) => onChange("consequence", event.target.value)} /></label>
    </div>
  );
}

function AcquisitionPaths({ onFeedback }: { onFeedback: (message: string) => void }) {
  return (
    <div className="acquisition-paths-panel">
      <header>
        <div><strong>支持证据与获得方式</strong><span>成功给更多细节，失败仍然推进调查</span></div>
        <button onClick={() => onFeedback("已模拟添加一条支持证据。")}>＋ 添加证据</button>
      </header>
      <div className="evidence-path-grid">
        {evidencePaths.map((evidence, index) => (
          <article key={evidence.id}>
            <header><b>0{index + 1}</b><div><span>{evidence.kind}</span><strong>{evidence.title}</strong></div><em>{evidence.strength}</em></header>
            <dl>
              <div><dt>获得方式</dt><dd>{evidence.acquisition}</dd></div>
              <div><dt>关联场景</dt><dd>{evidence.scene}</dd></div>
              <div><dt>关联 NPC</dt><dd>{evidence.npc}</dd></div>
              <div className="failed-progress"><dt>失败推进</dt><dd>{evidence.failedProgress}</dd></div>
            </dl>
            <footer>
              <button onClick={() => onFeedback(`已模拟打开“${evidence.scene}”。`)}>打开场景</button>
              <button onClick={() => onFeedback(`已模拟编辑“${evidence.title}”的获得条件。`)}>编辑路径</button>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}

function NetworkHealthCheck({ onFeedback }: { onFeedback: (message: string) => void }) {
  return (
    <div className="network-health-panel">
      <header>
        <span className="eyebrow">网络健康检查</span>
        <h4>玩家错过一条线索，故事还能继续吗？</h4>
        <p>检查支持度、来源独立性、单点门槛与失败后的替代路径。</p>
      </header>
      <section className="health-rule-summary">
        <article><span>三线索原则</span><strong>2 / 4</strong><p>两个关键结论已有至少三条独立支持。</p></article>
        <article><span>来源独立性</span><strong>7 / 9</strong><p>两条证据仍依赖同一名 NPC 主动开口。</p></article>
        <article><span>失败推进</span><strong>8 / 9</strong><p>一条检定失败后没有保底信息或替代入口。</p></article>
      </section>
      <section className="network-risk-list">
        <article className="warning">
          <b>支持度 2/3</b>
          <div><strong>“海曼仍然活着”缺少独立物证</strong><p>当前两条路径都来自灯塔区域，一次绕行就可能完全错过。</p></div>
          <button onClick={() => onFeedback("已模拟为“海曼仍然活着”添加城内药物记录。")}>补替代线索</button>
        </article>
        <article className="danger">
          <b>支持度 1/3</b>
          <div><strong>“议会知道真名契约”存在单点门槛</strong><p>只有伊芙琳的隐藏信件能证明，且需要一次成功检定。</p></div>
          <button onClick={() => onFeedback("已模拟拆分议会秘密的单点门槛。")}>拆分门槛</button>
        </article>
        <article className="clear">
          <b>结构稳固</b>
          <div><strong>“名册被人为修改”拥有三种证据类型</strong><p>实物、鉴定与证词互不依赖，并各自保留失败推进。</p></div>
          <button onClick={() => onFeedback("已返回该结论的网络总览。")}>查看网络</button>
        </article>
      </section>
    </div>
  );
}
