"use client";

import { useState } from "react";
import type { CreativeProject } from "./creative_project_data";
import { saveAssetBinding } from "./lorecue_asset_usage_store";
import type { LoreCueAssetRecord } from "./lorecue_asset_store";
import { useProjectAssetUsage } from "./use_project_asset_usage";
import { useProjectAssets } from "./use_project_assets";

type HandbookTab = "玩家手册总览" | "内容编辑" | "公开条件" | "玩家视角预览" | "剧透检查";
type ReleaseState = "开场公开" | "条件公开" | "已发放" | "主持人隐藏";

interface HandoutRecord {
  title: string;
  kind: string;
  state: ReleaseState;
  audience: string;
  condition: string;
  content: string;
  source: string;
  revision: string;
}

const handouts: HandoutRecord[] = [
  {
    title: "无剧透调查简介",
    kind: "团前简报",
    state: "开场公开",
    audience: "全部玩家",
    condition: "建立角色后立即可见。",
    content: "你们受萨菲港港务处委托，寻找一名即将下班的装卸工斯诺森，并确认他是否与近期失踪案有关。",
    source: "项目简介 + 第一场场景目标的公开版本",
    revision: "v1.2 · 已移除海曼姓名",
  },
  {
    title: "萨菲港游客地图",
    kind: "公开地图",
    state: "已发放",
    audience: "全部玩家",
    condition: "开场即可发放。",
    content: "包含港务处、东码头、旧城区和灯塔位置；不显示地下层、密道与主持人锚点。",
    source: "地图素材 · 萨菲港总览 · 玩家版",
    revision: "v2.0 · 第 1 次团已发放",
  },
  {
    title: "港务处值班表",
    kind: "调查附件",
    state: "条件公开",
    audience: "发现该线索的玩家",
    condition: "玩家进入档案室，或成功说服值班职员提供副本。",
    content: "显示斯诺森今日在东码头卸货，18:00 下班；第 7 页页码不连续。",
    source: "物件线索 · 缺页值班名册 · 表层信息",
    revision: "v1.1 · 保留页码异常，隐藏压痕内容",
  },
  {
    title: "真名契约完整规则",
    kind: "主持人资料",
    state: "主持人隐藏",
    audience: "不向玩家直接发放",
    condition: "只能拆分为调查结果，不能整体公开。",
    content: "完整描述登记姓名如何影响存在与记忆，以及三个仪式锚点。",
    source: "主持人真相 · 核心规则",
    revision: "内部版本",
  },
];

interface CreativePlayerHandbookWorkbenchProps {
  project: CreativeProject;
  onFeedback: (message: string) => void;
}

export function CreativePlayerHandbookWorkbench({ project, onFeedback }: CreativePlayerHandbookWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<HandbookTab>("玩家手册总览");
  const [selectedTitle, setSelectedTitle] = useState(handouts[0].title);
  const [draft, setDraft] = useState(handouts[0]);
  const [previewAudience, setPreviewAudience] = useState("全部玩家");
  const linkedAssets = useProjectAssets(project.id, ["地图", "文档", "立绘"]);
  const playerSafeAssets = linkedAssets.filter((asset) => asset.visibility !== "主持人私有");
  const [usage, setUsage] = useProjectAssetUsage(project.id);
  const selected = handouts.find((handout) => handout.title === selectedTitle) ?? handouts[0];
  const currentBinding = usage?.bindings.find((binding) => binding.surface === "player-handout" && binding.surfaceId === selected.title);

  function selectHandout(handout: HandoutRecord) {
    setSelectedTitle(handout.title);
    setDraft(handout);
    onFeedback(`已打开玩家资料“${handout.title}”。`);
  }

  function updateDraft<Key extends keyof HandoutRecord>(key: Key, value: HandoutRecord[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSaveHandout() {
    onFeedback(`已模拟保存“${draft.title}”的公开内容、条件与版本；来源素材为 ${currentBinding?.assetId ?? "未绑定"}。`);
  }

  function bindHandoutSource(asset: LoreCueAssetRecord) {
    const next = saveAssetBinding(project.id, {
      surface: "player-handout",
      surfaceId: selected.title,
      assetId: asset.id,
      assetTitle: asset.title,
      visibility: asset.visibility,
    });
    setUsage(next);
    onFeedback(`已把“${asset.title}”绑定为“${selected.title}”的公开来源；主持人私有素材不会出现在候选中。`);
  }

  return (
    <section className="player-handbook-workbench studio-board">
      <div className="studio-page-heading">
        <div><span className="eyebrow">主持人模组 · 玩家手册</span><h2>先看玩家会看到什么，再按下发放</h2><p>玩家资料引用设定的公开切片，不复制主持人全文；来源变化时可以检查和修订。</p></div>
        <button onClick={() => onFeedback("已模拟建立一份空白玩家附件。")}>＋ 新建玩家资料</button>
      </div>

      <section className="workbench-asset-strip" aria-label="玩家手册可用素材">
        <div><strong>公开来源素材</strong><span>{playerSafeAssets.length} 条可用于玩家版本 · 当前：{currentBinding?.assetTitle ?? "未绑定"}</span></div>
        <div>{playerSafeAssets.length > 0 ? playerSafeAssets.map((asset) => <button key={asset.id} className={currentBinding?.assetId === asset.id ? "active" : ""} onClick={() => bindHandoutSource(asset)}>{asset.title}<small>{asset.visibility} · {asset.kind}</small></button>) : <p>当前项目没有玩家可见或按场次解锁的地图、文档或立绘。</p>}</div>
      </section>

      <section className="handbook-metrics" aria-label="玩家手册概况">
        <article><strong>{playerSafeAssets.length}</strong><span>可用来源素材</span><small>已排除主持人私有资料</small></article>
        <article><strong>3</strong><span>开场公开</span><small>无需行动即可查看</small></article>
        <article><strong>4</strong><span>条件公开</span><small>绑定场景、线索或玩家</small></article>
        <article className="risk"><strong>2</strong><span>剧透提醒</span><small>隐藏名称 1 · 地图锚点 1</small></article>
      </section>

      <div className="handbook-layout">
        <aside className="handbook-index">
          <header><strong>资料目录</strong><small>{handouts.length} / 8</small></header>
          <nav aria-label="玩家手册资料列表">{handouts.map((handout, index) => <button key={handout.title} className={selectedTitle === handout.title ? "active" : ""} onClick={() => selectHandout(handout)}><b>0{index + 1}</b><span><strong>{handout.title}</strong><small>{handout.kind}</small></span><em data-state={handout.state}>{handout.state}</em></button>)}</nav>
          <section className="handbook-export-card"><span>本场导出包</span><strong>4 份可用资料</strong><p>只包含已公开或本场可解锁版本。</p><button onClick={() => onFeedback("已模拟生成本场玩家资料导出包。")}>生成导出包</button></section>
        </aside>

        <article className="handbook-editor">
          <header><div><span>{selected.kind} · {selected.state}</span><h3>{selected.title}</h3><p>{selected.revision}</p></div><button onClick={handleSaveHandout}>保存资料</button></header>
          <nav className="entity-tabs" aria-label="玩家手册分区">{(["玩家手册总览", "内容编辑", "公开条件", "玩家视角预览", "剧透检查"] as HandbookTab[]).map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>
          {activeTab === "玩家手册总览" && <HandbookOverview handout={selected} onFeedback={onFeedback} />}
          {activeTab === "内容编辑" && <HandoutEditor handout={draft} onChange={updateDraft} />}
          {activeTab === "公开条件" && <ReleaseConditions handout={draft} onChange={updateDraft} onFeedback={onFeedback} />}
          {activeTab === "玩家视角预览" && <PlayerPreview handout={selected} audience={previewAudience} onAudienceChange={setPreviewAudience} />}
          {activeTab === "剧透检查" && <SpoilerCheck onFeedback={onFeedback} />}
        </article>
      </div>
      <p className="workbench-context-note">当前项目：{project.title} · 玩家手册只引用公开切片，不会检索主持人真相、NPC 隐藏知识或未确认事实。</p>
    </section>
  );
}

function HandbookOverview({ handout, onFeedback }: { handout: HandoutRecord; onFeedback: (message: string) => void }) {
  return <div className="handbook-overview"><section className="handout-summary"><span>{handout.state}</span><h4>{handout.title}</h4><p>{handout.content}</p><dl><div><dt>受众</dt><dd>{handout.audience}</dd></div><div><dt>来源</dt><dd>{handout.source}</dd></div><div><dt>公开条件</dt><dd>{handout.condition}</dd></div></dl></section><section className="handout-flow"><article><b>01</b><strong>引用公开切片</strong><p>不会复制主持人隐藏原文。</p></article><i>›</i><article><b>02</b><strong>剧透检查</strong><p>检查名称、地图层和元数据。</p></article><i>›</i><article><b>03</b><strong>发放并留档</strong><p>记录玩家收到的具体版本。</p></article></section><div className="handout-actions"><button onClick={() => onFeedback("已切换到玩家视角预览。")}>玩家视角预览</button><button onClick={() => onFeedback("已模拟将当前版本发放给目标玩家。")}>发放当前版本</button></div></div>;
}

function HandoutEditor({ handout, onChange }: { handout: HandoutRecord; onChange: <Key extends keyof HandoutRecord>(key: Key, value: HandoutRecord[Key]) => void }) {
  return <div className="entity-form handout-form"><label>资料名称<input value={handout.title} onChange={(event) => onChange("title", event.target.value)} /></label><label>资料类型<input value={handout.kind} onChange={(event) => onChange("kind", event.target.value)} /></label><label>发布状态<select value={handout.state} onChange={(event) => onChange("state", event.target.value as ReleaseState)}><option>开场公开</option><option>条件公开</option><option>已发放</option><option>主持人隐藏</option></select></label><label>目标受众<input value={handout.audience} onChange={(event) => onChange("audience", event.target.value)} /></label><label className="full-field">玩家可见正文<textarea rows={7} value={handout.content} onChange={(event) => onChange("content", event.target.value)} /></label><label className="full-field">引用来源<input value={handout.source} onChange={(event) => onChange("source", event.target.value)} /></label></div>;
}

function ReleaseConditions({ handout, onChange, onFeedback }: { handout: HandoutRecord; onChange: <Key extends keyof HandoutRecord>(key: Key, value: HandoutRecord[Key]) => void; onFeedback: (message: string) => void }) {
  return <div className="release-condition-panel"><header><strong>公开条件</strong><p>系统不会自动监听玩家；由主持人确认条件已经发生。</p></header><label>条件说明<textarea rows={4} value={handout.condition} onChange={(event) => onChange("condition", event.target.value)} /></label><section><article className="done"><b>场景条件</b><div><strong>进入港务处档案室</strong><p>当前场次已经满足。</p></div><span>已触发</span></article><article><b>行动条件</b><div><strong>说服职员提供副本</strong><p>可作为替代获得方式。</p></div><span>等待确认</span></article><article><b>受众条件</b><div><strong>只发给发现者</strong><p>其他玩家需要由角色转述。</p></div><span>按玩家分发</span></article></section><button onClick={() => onFeedback("已由主持人确认公开条件，资料进入待发放状态。")}>确认条件已发生</button></div>;
}

function PlayerPreview({ handout, audience, onAudienceChange }: { handout: HandoutRecord; audience: string; onAudienceChange: (audience: string) => void }) {
  const hidden = handout.state === "主持人隐藏";
  return <div className="player-preview-panel"><header><div><strong>玩家视角预览</strong><p>当前预览不会显示后台来源、隐藏标记与主持备注。</p></div><label>预览身份<select value={audience} onChange={(event) => onAudienceChange(event.target.value)}><option>全部玩家</option><option>爱莉</option><option>梵·高</option><option>摸鱼教教主</option></select></label></header><article className={hidden ? "blocked" : ""}>{hidden ? <><span>不可见</span><h4>这份内容属于主持人隐藏资料</h4><p>玩家不会知道资料标题、存在状态或解锁条件。</p></> : <><span>{handout.kind}</span><h4>{handout.title}</h4><p>{handout.content}</p><footer>发放给：{audience}</footer></>}</article></div>;
}

function SpoilerCheck({ onFeedback }: { onFeedback: (message: string) => void }) {
  return <div className="spoiler-check-panel"><header><strong>剧透检查</strong><p>检查正文之外的标题、文件名、地图图层和引用元数据。</p></header><section><article className="danger"><b>隐藏名称</b><div><strong>导出文件名包含“海曼藏身处”</strong><p>正文已经遮蔽，但文件名仍会直接泄露人物状态。</p></div><button onClick={() => onFeedback("已模拟把导出文件重命名为“旧灯塔附图”。")}>安全重命名</button></article><article className="warning"><b>地图图层</b><div><strong>游客地图仍包含地下入口锚点</strong><p>玩家版应隐藏锚点，而不是只把文字颜色变浅。</p></div><button onClick={() => onFeedback("已从玩家版移除隐藏地图图层。")}>移除图层</button></article><article className="clear"><b>边界安全</b><div><strong>港务处值班表只含表层信息</strong><p>压痕内容、真实年份和主持人备注均未进入玩家版本。</p></div><button onClick={() => onFeedback("已打开玩家版与主持人版差异。")}>查看差异</button></article></section><aside><span>撤回与修订</span><strong>已发放内容无法让玩家“忘记”</strong><p>修订会生成新版本并保留旧版发放记录；误发时应明确记录玩家实际已经看到什么。</p></aside></div>;
}
