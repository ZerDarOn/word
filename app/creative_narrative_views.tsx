"use client";

import type {
  CreativeProject,
  CreativeStudioView,
} from "./creative_project_data";
import { CreativeCharacterDossier } from "./creative_character_dossier";
import { CreativeAudioCueWorkbench } from "./creative_audio_cue_workbench";
import { CreativeClueItemWorkbench } from "./creative_clue_item_workbench";
import { CreativeClueNetworkWorkbench } from "./creative_clue_network_workbench";
import { CreativeEndingBranchWorkbench } from "./creative_ending_branch_workbench";
import { CreativeForeshadowingWorkbench } from "./creative_foreshadowing_workbench";
import { CreativeGmTruthWorkbench } from "./creative_gm_truth_workbench";
import { CreativeMapHierarchy } from "./creative_map_hierarchy";
import { CreativeMapEncounterWorkbench } from "./creative_map_encounter_workbench";
import { CreativeNpcKnowledgeWorkbench } from "./creative_npc_knowledge_workbench";
import { CreativePlayerAttachmentWorkbench } from "./creative_player_attachment_workbench";
import { CreativeOrganizationWorkbench } from "./creative_organization_workbench";
import { CreativePlayerHandbookWorkbench } from "./creative_player_handbook_workbench";
import { CreativeSceneNodeWorkbench } from "./creative_scene_node_workbench";
import { CreativeWorldbuildingWorkbench } from "./creative_worldbuilding_workbench";

interface CreativeNarrativeViewProps {
  project: CreativeProject;
  view: CreativeStudioView;
  onFeedback: (message: string) => void;
}

const storyNodes = [
  { id: "N01", title: "来信抵达", type: "开端", state: "已完成", links: "进入港务处" },
  { id: "N02", title: "名册缺页", type: "调查", state: "写作中", links: "发现斯诺森" },
  { id: "N03", title: "灯塔证词", type: "反转", state: "待写", links: "改变嫌疑方向" },
  { id: "N04", title: "灰潮号靠港", type: "汇合", state: "待写", links: "触发双线高潮" },
];

const collectionContent: Partial<Record<CreativeStudioView, {
  eyebrow: string;
  title: string;
  description: string;
  items: Array<{ title: string; detail: string; meta: string }>;
}>> = {
  伏笔回收: {
    eyebrow: "结构校验",
    title: "伏笔与回收",
    description: "记录埋设位置、预计回收位置与读者当前可知程度。",
    items: [
      { title: "被涂掉的姓氏", detail: "第一章埋设，第四章揭示涂改者。", meta: "已安排回收" },
      { title: "雾笛响了三次", detail: "序章出现，尚未绑定明确含义。", meta: "缺少回收" },
      { title: "伊芙琳的左手", detail: "与撒谎动作关联，第二幕再次出现。", meta: "人物伏笔" },
    ],
  },
  地点地图: {
    eyebrow: "设定资料",
    title: "地点与地图",
    description: "地点卡保存事实，地图保存空间关系；两者可以单独更新。",
    items: [
      { title: "萨菲港", detail: "主舞台 · 12 个子区域 · 3 张地图", meta: "28 次引用" },
      { title: "旧灯塔", detail: "封闭地点 · 地下层尚未公开", meta: "8 次引用" },
      { title: "灰潮号", detail: "移动地点 · 两套甲板状态", meta: "核心场景" },
    ],
  },
  组织阵营: {
    eyebrow: "设定资料",
    title: "组织与阵营",
    description: "组织目标、资源、公开立场与隐藏行动分别记录。",
    items: [
      { title: "港务议会", detail: "维持贸易秩序，但内部存在走私保护伞。", meta: "中立偏秩序" },
      { title: "守灯人", detail: "掌握旧航路与沉船记录。", meta: "秘密组织" },
      { title: "灰潮船员互助会", detail: "名义解散，成员仍保持联系。", meta: "5 名关联角色" },
    ],
  },
  物件线索: {
    eyebrow: "设定资料",
    title: "物件、道具与线索",
    description: "同一物件可以出现在多个节点，真伪与公开程度独立保存。",
    items: [
      { title: "缺页值班名册", detail: "真实线索 · 指向灰潮号最后一次卸货。", meta: "核心线索" },
      { title: "伪造船票", detail: "误导线索 · 来源尚未确认。", meta: "可被识破" },
      { title: "铜制灯塔钥匙", detail: "进入地下层的唯一常规方式。", meta: "关键道具" },
    ],
  },
  世界观: {
    eyebrow: "世界设定",
    title: "世界观与运行规则",
    description: "自然规则、社会常识与作品专有概念组成可检索的设定圣经。",
    items: [
      { title: "退潮历", detail: "城市以潮位而不是太阳划分工作日。", meta: "历法规则" },
      { title: "真名契约", detail: "在港务册登记的名字具有法律与仪式双重效力。", meta: "核心规则" },
      { title: "无潮城区", detail: "每月只出现三个小时的旧城市遗迹。", meta: "地理现象" },
    ],
  },
  地图素材: {
    eyebrow: "视觉与媒体",
    title: "地图素材",
    description: "世界图、区域图、楼层图与战斗图按空间层级组织。",
    items: [
      { title: "萨菲港总览", detail: "区域地图 · 12 个锚点", meta: "项目已引用" },
      { title: "港务处一层", detail: "楼层图 · 玩家可见版", meta: "两种版本" },
      { title: "灰潮号甲板", detail: "遭遇地图 · 带网格", meta: "待标注" },
    ],
  },
  角色立绘: {
    eyebrow: "视觉与媒体",
    title: "角色立绘",
    description: "立绘属于角色的视觉资源，不替代角色档案。",
    items: [
      { title: "伊芙琳", detail: "日常 / 紧张 / 受伤三种状态", meta: "3 张" },
      { title: "斯诺森", detail: "码头工作服与便装", meta: "2 张" },
      { title: "海曼", detail: "二十年前与现在", meta: "2 张" },
    ],
  },
  "BGM 音效": {
    eyebrow: "视觉与媒体",
    title: "BGM 与音效",
    description: "音乐只与场景和情绪建议关联，不会监听内容自动播放。",
    items: [
      { title: "码头 · 暗潮", detail: "低沉弦乐、远处雾笛", meta: "03:42" },
      { title: "灯塔 · 空响", detail: "风声、金属摩擦、低频脉冲", meta: "05:10" },
      { title: "灰潮号 · 归来", detail: "主题动机的失真版本", meta: "04:28" },
    ],
  },
  玩家附件: {
    eyebrow: "公开资料",
    title: "玩家可见附件",
    description: "每份附件标记公开条件，避免主持资料混入玩家版本。",
    items: [
      { title: "萨菲港游客地图", detail: "开场即可公开。", meta: "公开" },
      { title: "港务处值班表", detail: "调查港务处后公开。", meta: "条件公开" },
      { title: "灰潮号剪报", detail: "图书馆调查成功后公开。", meta: "条件公开" },
    ],
  },
  一致性检查: {
    eyebrow: "检查与管理",
    title: "一致性检查",
    description: "把冲突、重复、孤立节点与未回收伏笔集中处理。",
    items: [
      { title: "港务处关闭时间冲突", detail: "地点卡与第一章正文相差一小时。", meta: "高优先级" },
      { title: "海曼年龄不一致", detail: "角色卡 54 岁，第三章写作 56 岁。", meta: "待确认" },
      { title: "灯塔地下层孤立", detail: "尚未与任何可达节点连接。", meta: "结构提醒" },
    ],
  },
};

function ProjectOverview({ project }: { project: CreativeProject }) {
  const domains = project.kind === "跑团模组" ? 7 : 6;
  return (
    <section className="narrative-overview studio-board">
      <div className="studio-page-heading">
        <div><span className="eyebrow">项目总览</span><h2>{project.title}</h2><p>{project.summary}</p></div>
        <button>编辑项目介绍</button>
      </div>
      <div className="overview-metrics">
        <article><strong>{domains}</strong><span>个内容领域</span></article>
        <article><strong>{project.documentCount}</strong><span>篇正文与条目</span></article>
        <article><strong>14</strong><span>个故事节点</span></article>
        <article><strong>{project.warningCount}</strong><span>条待处理提醒</span></article>
      </div>
      <div className="overview-grid">
        <section className="overview-introduction">
          <span className="eyebrow">项目介绍</span><h3>一次关于名字、记忆与归来的港口悬案</h3>
          <p>主题围绕“一个人是否能从公共记录中被彻底抹除”。叙事采用双时间线，当前重点是让二十年前的真相逐步侵入现在。</p>
          <dl><div><dt>题材</dt><dd>悬疑 / 奇幻</dd></div><div><dt>基调</dt><dd>克制、潮湿、缓慢紧张</dd></div><div><dt>目标规模</dt><dd>{project.kind === "跑团模组" ? "3–4 次团" : "约 12 万字"}</dd></div></dl>
        </section>
        <section className="overview-hierarchy">
          <span className="eyebrow">信息层级</span>
          {["内容创作", "故事结构", "设定资料", "视觉与媒体", ...(project.kind === "跑团模组" ? ["主持人模组"] : []), "检查与管理"].map((domain, index) => (
            <div key={domain}><span>0{index + 1}</span><strong>{domain}</strong><small>{index === 0 ? "正文与场次" : index === 1 ? "树、节点、二维图与时间线" : "结构化条目与视图"}</small></div>
          ))}
        </section>
      </div>
    </section>
  );
}

function StoryTreeView() {
  return (
    <section className="story-tree-view studio-board">
      <div className="studio-page-heading">
        <div><span className="eyebrow">故事结构 · 故事树</span><h2>从全局到单个场景</h2><p>树表示包含关系；节点图表示因果、条件与可达关系。</p></div>
        <button>＋ 添加分支</button>
      </div>
      <div className="story-tree">
        <article className="tree-root"><span>项目</span><strong>潮汐来信</strong><small>双时间线悬疑</small></article>
        <div className="tree-branches">
          {[
            { title: "第一幕 · 缺失的名字", children: ["无潮之夜", "港务处", "斯诺森"] },
            { title: "第二幕 · 旧航路", children: ["旧灯塔", "守灯人", "地下层"] },
            { title: "第三幕 · 灰潮归来", children: ["灰潮号", "两线汇合", "真名抉择"] },
          ].map((branch) => (
            <section key={branch.title}><article><span>幕</span><strong>{branch.title}</strong></article>
              <div>{branch.children.map((child, index) => <button key={child}><span>0{index + 1}</span>{child}</button>)}</div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoryNodeView() {
  return (
    <section className="story-node-view studio-board">
      <div className="studio-page-heading">
        <div><span className="eyebrow">故事结构 · 故事节点</span><h2>节点不是章节，而是一次叙事变化。</h2><p>一个节点可以被不同章节、场景或跑团路径引用。</p></div>
        <button>＋ 新建节点</button>
      </div>
      <div className="story-node-grid">
        {storyNodes.map((node) => <article key={node.id}><header><span>{node.id}</span><small>{node.state}</small></header><strong>{node.title}</strong><p>{node.type}</p><footer>作用：{node.links}</footer></article>)}
      </div>
      <aside className="node-definition"><strong>节点字段</strong><span>前置条件</span><span>参与角色</span><span>地点</span><span>发生变化</span><span>可获得信息</span><span>后续出口</span></aside>
    </section>
  );
}

function CanvasView() {
  return (
    <section className="narrative-canvas-view">
      <header className="canvas-toolbar"><div><span className="eyebrow">故事结构 · 二维图</span><h2>因果与分支画布</h2></div><div><button>−</button><span>80%</span><button>＋</button><button>适应画布</button></div></header>
      <div className="narrative-canvas" aria-label="故事节点二维图">
        <svg viewBox="0 0 900 520" role="img" aria-label="节点连接线">
          <path d="M140 250 C230 250 215 120 315 120" /><path d="M140 250 C230 250 220 380 315 380" />
          <path d="M440 120 C535 120 520 250 610 250" /><path d="M440 380 C535 380 520 250 610 250" />
          <path d="M735 250 C790 250 790 150 835 150" /><path d="M735 250 C790 250 790 365 835 365" />
        </svg>
        <article className="canvas-node node-start"><span>开端</span><strong>来信抵达</strong><small>无条件进入</small></article>
        <article className="canvas-node node-upper"><span>调查</span><strong>名册缺页</strong><small>获得：斯诺森</small></article>
        <article className="canvas-node node-lower"><span>人物</span><strong>伊芙琳说谎</strong><small>条件：压力增加</small></article>
        <article className="canvas-node node-merge"><span>汇合</span><strong>灯塔证词</strong><small>真相推进 +1</small></article>
        <article className="canvas-node node-end-one"><span>出口 A</span><strong>追查灰潮号</strong></article>
        <article className="canvas-node node-end-two"><span>出口 B</span><strong>质问港务议会</strong></article>
        <div className="canvas-minimap"><i /><i /><i /><i /></div>
      </div>
    </section>
  );
}

function RelationshipGraph() {
  return (
    <section className="relationship-workbench studio-board">
      <div className="studio-page-heading">
        <div><span className="eyebrow">设定资料 · 人物关系图</span><h2>关系不是一根线，而是双方各自的认知。</h2><p>情感、权力、知情与公开关系可以分别筛选。</p></div>
        <button>＋ 添加关系</button>
      </div>
      <div className="relationship-filters"><button className="active">综合</button><button>情感</button><button>权力</button><button>知情</button><button>公开关系</button></div>
      <div className="advanced-relationship-map">
        <svg viewBox="0 0 800 420" role="img" aria-label="人物关系连线">
          <path d="M160 210 L385 105" /><path d="M160 210 L385 315" /><path d="M385 105 L650 210" /><path d="M385 315 L650 210" /><path className="dashed" d="M160 210 L650 210" />
        </svg>
        <article className="graph-person person-one"><b>伊</b><strong>伊芙琳</strong><small>港务官</small></article>
        <article className="graph-person person-two"><b>斯</b><strong>斯诺森</strong><small>装卸工</small></article>
        <article className="graph-person person-three"><b>海</b><strong>海曼</strong><small>失踪船长</small></article>
        <article className="graph-person person-four"><b>莉</b><strong>莉奥娜</strong><small>记者</small></article>
        <span className="graph-label label-one">怀疑 / 隐瞒</span><span className="graph-label label-two">导师 / 愧疚</span><span className="graph-label label-three">调查对象</span>
      </div>
    </section>
  );
}

const moduleViewContent: Partial<Record<CreativeStudioView, {
  title: string;
  description: string;
  cards: Array<{ title: string; body: string; tag: string }>;
}>> = {
  主持人真相: {
    title: "主持人真相",
    description: "这是模组的事实底稿，不会出现在玩家简介或公开附件中。",
    cards: [
      { title: "二十年前发生了什么", body: "海曼主动删除了灰潮号最后一批船员的登记，以阻止真名契约生效。", tag: "核心真相" },
      { title: "当前危机", body: "灰潮号正在重新靠港，所有被删除的名字会在同一夜恢复。", tag: "时间压力" },
      { title: "斯诺森的真实身份", body: "他不是船员，而是当年负责卸货的唯一目击者。", tag: "反转" },
    ],
  },
  场景节点: {
    title: "场景节点",
    description: "场景负责可游玩内容，故事节点负责发生的变化；两者可以多对多关联。",
    cards: [
      { title: "港务处", body: "社交调查场景 · 3 条入口 · 4 条可获得线索。", tag: "开放场景" },
      { title: "码头下班口", body: "跟踪或接触斯诺森，失败也会推进到工棚。", tag: "动态场景" },
      { title: "旧灯塔地下层", body: "需要钥匙、破门或守灯人引路。", tag: "门槛场景" },
    ],
  },
  线索网络: {
    title: "线索网络",
    description: "每个关键结论至少由三条不同路径支持，避免一次失败让模组停摆。",
    cards: [
      { title: "结论：名册被人为修改", body: "压痕、墨水年份、守灯人口供。", tag: "3 条支持" },
      { title: "结论：灰潮号将再次靠港", body: "潮汐表、无线电残响、旧船票日期。", tag: "3 条支持" },
      { title: "结论：海曼仍然活着", body: "新鲜指纹、药物记录、灯塔补给。", tag: "隐藏结论" },
    ],
  },
  "NPC 知情与披露": {
    title: "NPC 知情与披露",
    description: "知道、相信、愿意说和在什么条件下说，是四个不同字段。",
    cards: [
      { title: "伊芙琳", body: "知道名册被改；误信斯诺森参与；获得信任后才提海曼。", tag: "条件披露" },
      { title: "斯诺森", body: "知道卸货真相；害怕议会；受到保护后愿意作证。", tag: "高风险" },
      { title: "守灯人", body: "知道海曼藏身处；只向持有旧钥匙的人说明。", tag: "门槛信息" },
    ],
  },
  地图与遭遇: {
    title: "地图与遭遇",
    description: "地图锚点、区域效果、检定与遭遇绑定，但地图文件仍是独立素材。",
    cards: [
      { title: "码头区追逐", body: "6 个区域 · 人群、吊机与潮水三种环境效果。", tag: "技能挑战" },
      { title: "灰潮号甲板", body: "三层甲板 · 2 个动态入口 · 雾中视野受限。", tag: "战斗地图" },
      { title: "灯塔地下层", body: "探索时钟推进会改变出口与敌对状态。", tag: "探索遭遇" },
    ],
  },
  结局分支: {
    title: "结局分支",
    description: "记录触发条件、公开真相、幸存角色与下一场承接。",
    cards: [
      { title: "公开名册", body: "需要获得三份证据并说服伊芙琳。", tag: "真相结局" },
      { title: "再次抹除", body: "玩家选择维持城市秩序，但灰潮号危机延后。", tag: "妥协结局" },
      { title: "让船靠港", body: "真名恢复，所有旧船员重新进入现实。", tag: "异变结局" },
    ],
  },
  玩家手册: {
    title: "玩家手册",
    description: "这里只收纳明确可公开的简介、规则摘要、地图和附件。",
    cards: [
      { title: "无剧透简介", body: "你们受港务处委托，寻找一名即将下班的装卸工。", tag: "开场公开" },
      { title: "萨菲港游客图", body: "不包含地下层、密道与隐藏锚点。", tag: "公开地图" },
      { title: "港区调查规则", body: "玩家可见的简化检定与追逐说明。", tag: "规则摘要" },
    ],
  },
};

function ModuleWorkbench({ view }: { view: CreativeStudioView }) {
  const content = moduleViewContent[view];
  if (!content) return null;
  return (
    <section className="module-workbench studio-board">
      <div className="studio-page-heading">
        <div><span className="eyebrow">主持人模组</span><h2>{content.title}</h2><p>{content.description}</p></div>
        <button>＋ 新建条目</button>
      </div>
      <div className="module-safety-banner"><strong>主持人可见</strong><span>这部分不会进入玩家手册，也不会在玩家视角 AI 中检索。</span></div>
      <div className="module-card-grid">{content.cards.map((card) => <article key={card.title}><span>{card.tag}</span><h3>{card.title}</h3><p>{card.body}</p><button>打开详情</button></article>)}</div>
    </section>
  );
}

function CollectionView({ view }: { view: CreativeStudioView }) {
  const content = collectionContent[view];
  if (!content) return null;
  return (
    <section className="collection-workbench studio-board">
      <div className="studio-page-heading">
        <div><span className="eyebrow">{content.eyebrow}</span><h2>{content.title}</h2><p>{content.description}</p></div>
        <button>＋ 新建条目</button>
      </div>
      <div className="collection-card-grid">{content.items.map((item) => <article key={item.title}><span>{item.meta}</span><h3>{item.title}</h3><p>{item.detail}</p><button>查看引用</button></article>)}</div>
    </section>
  );
}

export function CreativeNarrativeView({
  project,
  view,
  onFeedback,
}: CreativeNarrativeViewProps) {
  if (view === "项目总览") return <ProjectOverview project={project} />;
  if (view === "角色档案") return <CreativeCharacterDossier project={project} onFeedback={onFeedback} />;
  if (view === "地点地图" || view === "地图素材") {
    return <CreativeMapHierarchy project={project} onFeedback={onFeedback} />;
  }
  if (view === "组织阵营") {
    return <CreativeOrganizationWorkbench project={project} onFeedback={onFeedback} />;
  }
  if (view === "物件线索") {
    return <CreativeClueItemWorkbench project={project} onFeedback={onFeedback} />;
  }
  if (view === "线索网络") {
    return <CreativeClueNetworkWorkbench project={project} onFeedback={onFeedback} />;
  }
  if (view === "NPC 知情与披露") {
    return <CreativeNpcKnowledgeWorkbench project={project} onFeedback={onFeedback} />;
  }
  if (view === "场景节点") {
    return <CreativeSceneNodeWorkbench project={project} onFeedback={onFeedback} />;
  }
  if (view === "主持人真相") {
    return <CreativeGmTruthWorkbench project={project} onFeedback={onFeedback} />;
  }
  if (view === "地图与遭遇") {
    return <CreativeMapEncounterWorkbench project={project} onFeedback={onFeedback} />;
  }
  if (view === "结局分支") {
    return <CreativeEndingBranchWorkbench project={project} onFeedback={onFeedback} />;
  }
  if (view === "玩家手册") {
    return <CreativePlayerHandbookWorkbench project={project} onFeedback={onFeedback} />;
  }
  if (view === "BGM 音效") {
    return <CreativeAudioCueWorkbench project={project} onFeedback={onFeedback} />;
  }
  if (view === "玩家附件") {
    return <CreativePlayerAttachmentWorkbench project={project} onFeedback={onFeedback} />;
  }
  if (view === "世界观") {
    return <CreativeWorldbuildingWorkbench project={project} onFeedback={onFeedback} />;
  }
  if (view === "伏笔回收") {
    return <CreativeForeshadowingWorkbench project={project} onFeedback={onFeedback} />;
  }
  if (view === "故事树") return <StoryTreeView />;
  if (view === "故事节点") return <StoryNodeView />;
  if (view === "二维图") return <CanvasView />;
  if (view === "人物关系图") return <RelationshipGraph />;
  if (moduleViewContent[view]) return <ModuleWorkbench view={view} />;
  if (collectionContent[view]) return <CollectionView view={view} />;

  return (
    <section className="studio-board">
      <div className="studio-page-heading">
        <div><span className="eyebrow">项目内容</span><h2>{view}</h2><p>此领域沿用当前项目的实体引用与来源边界。</p></div>
        <button onClick={() => onFeedback(`已在“${view}”中模拟建立新条目。`)}>＋ 新建条目</button>
      </div>
    </section>
  );
}
