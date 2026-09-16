"use client";

import { useState } from "react";
import type { CreativeProject } from "./creative_project_data";
import { removeAssetBinding, saveAssetBinding } from "./lorecue_asset_usage_store";
import type { LoreCueAssetRecord } from "./lorecue_asset_store";
import { useProjectAssetUsage } from "./use_project_asset_usage";
import { useProjectAssets } from "./use_project_assets";

type EncounterTab = "遭遇运行总览" | "区域与环境" | "参与单位" | "规则与解法" | "遭遇后状态";
type EncounterState = "待运行" | "进行中" | "已变化";

interface EncounterRecord {
  title: string;
  map: string;
  state: EncounterState;
  objective: string;
  entryExit: string;
  pressure: string;
  aftermath: string;
}

const encounters: EncounterRecord[] = [
  {
    title: "码头区追逐",
    map: "萨菲港 → 东码头 → 卸货区",
    state: "进行中",
    objective: "在斯诺森离开码头前接触他，同时避免议会眼线抢先带走目标。",
    entryExit: "入口：港务处、工人食堂、海堤；出口：工棚、旧城区、巡逻艇。",
    pressure: "每推进一格，斯诺森更接近离场；造成骚乱会增加港务警戒。",
    aftermath: "记录斯诺森去向、眼线状态、损坏区域和玩家是否暴露身份。",
  },
  {
    title: "灰潮号甲板",
    map: "灰潮号 → 上层甲板 → 船艉",
    state: "待运行",
    objective: "在雾中抵达舵轮，同时决定阻止、延缓还是完成靠港仪式。",
    entryExit: "入口：舷梯、系泊索、货舱升降口；出口会随潮位改变。",
    pressure: "每轮雾区扩张；真名被呼唤的角色获得新的记忆与负担。",
    aftermath: "保存船体损坏、仪式进度和仍留在船上的人物。",
  },
  {
    title: "灯塔地下探索",
    map: "旧灯塔 → 地下层 → 契约室",
    state: "已变化",
    objective: "找到海曼并确认契约代价，不必强制进入战斗。",
    entryExit: "入口：旧钥匙、守灯人引路、强行破门；出口：原路或排水井。",
    pressure: "探索时钟达到 4 时，灰潮号提前出现；破门会直接推进 1 格。",
    aftermath: "铁门可能损坏，海曼可能转移，灯塔从安全点变成公开地点。",
  },
];

const zones = [
  { name: "卸货平台", terrain: "拥挤", effect: "穿越需要额外移动；推挤失败会分散队伍。", mark: "A" },
  { name: "吊机轨道", terrain: "危险", effect: "启动吊机可截断路线，也可能制造坠落危险。", mark: "B" },
  { name: "堆箱小道", terrain: "遮蔽", effect: "适合潜行与包抄；火器视线被阻断。", mark: "C" },
  { name: "潮水坡道", terrain: "动态", effect: "时钟推进后被淹没，离场路线随之关闭。", mark: "D" },
];

const units = [
  { name: "斯诺森", role: "移动目标", intent: "避开港务人员，尝试从工棚离场", status: "警觉 1/3" },
  { name: "议会眼线", role: "对立单位", intent: "抢先接触斯诺森，但避免公开冲突", status: "隐藏" },
  { name: "下班工人", role: "中立人群", intent: "尽快离开，也会保护熟悉的工友", status: "拥挤" },
];

const dndSystemLabel = "D&D 5e";

interface CreativeMapEncounterWorkbenchProps {
  project: CreativeProject;
  onFeedback: (message: string) => void;
}

export function CreativeMapEncounterWorkbench({ project, onFeedback }: CreativeMapEncounterWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<EncounterTab>("遭遇运行总览");
  const [selectedTitle, setSelectedTitle] = useState(encounters[0].title);
  const [draft, setDraft] = useState(encounters[0]);
  const [clock, setClock] = useState(2);
  const linkedMaps = useProjectAssets(project.id, ["地图"]);
  const [usage, setUsage] = useProjectAssetUsage(project.id);
  const selected = encounters.find((encounter) => encounter.title === selectedTitle) ?? encounters[0];
  const currentBinding = usage?.bindings.find((binding) => binding.surface === "encounter" && binding.surfaceId === selected.title);
  const boundMap = currentBinding ? linkedMaps.find((asset) => asset.id === currentBinding.assetId) : undefined;
  const bindingIsStale = Boolean(currentBinding && !boundMap);

  function selectEncounter(encounter: EncounterRecord) {
    setSelectedTitle(encounter.title);
    setDraft(encounter);
    setClock(encounter.title === "灯塔地下探索" ? 3 : 2);
    onFeedback(`已切换到遭遇“${encounter.title}”。`);
  }

  function updateDraft<Key extends keyof EncounterRecord>(key: Key, value: EncounterRecord[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSaveEncounter() {
    onFeedback(`已模拟保存“${draft.title}”的地图区域、规则和遭遇后状态；底图引用为 ${currentBinding?.assetId ?? "未绑定"}。`);
  }

  function bindEncounterMap(asset: LoreCueAssetRecord) {
    const next = saveAssetBinding(project.id, {
      surface: "encounter",
      surfaceId: selected.title,
      assetId: asset.id,
      assetTitle: asset.title,
      visibility: asset.visibility,
    });
    setUsage(next);
    onFeedback(`已把“${asset.title}”设为遭遇“${selected.title}”的底图来源；遭遇区域规则不会改写原图。`);
  }

  function clearEncounterMap() {
    const next = removeAssetBinding(project.id, "encounter", selected.title);
    setUsage(next);
    onFeedback(`已解除遭遇“${selected.title}”的底图绑定；遭遇规则和历史记录仍保留。`);
  }

  return (
    <section className="map-encounter-workbench studio-board">
      <div className="studio-page-heading">
        <div><span className="eyebrow">主持人模组 · 地图与遭遇</span><h2>地图负责空间，遭遇负责变化</h2><p>同一张地图可以承载追逐、战斗、潜入或探索；规则和结果作为独立运行层保存。</p></div>
        <button onClick={() => onFeedback("已模拟从现有地图建立新遭遇。")}>＋ 从地图建遭遇</button>
      </div>

      <section className={`workbench-asset-strip ${bindingIsStale ? "has-stale-binding" : ""}`} aria-label="遭遇可用地图素材">
        <div><strong>遭遇底图来源</strong><span>{linkedMaps.length} 条项目地图 · 当前：{bindingIsStale ? `失效引用 · ${currentBinding?.assetTitle}` : currentBinding?.assetTitle ?? "尚未绑定"}</span>{currentBinding && <button className="asset-clear-binding" onClick={clearEncounterMap}>解除绑定</button>}</div>
        <div>{linkedMaps.length > 0 ? linkedMaps.map((asset) => <button key={asset.id} className={currentBinding?.assetId === asset.id ? "active" : ""} onClick={() => bindEncounterMap(asset)}>{asset.title}<small>{asset.visibility} · {asset.id}</small></button>) : <p>当前项目没有明确引用的地图，遭遇暂时使用结构化示意图。</p>}</div>
      </section>

      <section className="encounter-metrics" aria-label="地图与遭遇概况">
        <article><strong>7</strong><span>遭遇</span><small>追逐 2 · 探索 3 · 冲突 2</small></article>
        <article><strong>{linkedMaps.length}</strong><span>项目地图</span><small>只统计明确引用</small></article>
        <article><strong>19</strong><span>地图区域</span><small>12 个包含环境效果</small></article>
        <article className="risk"><strong>2</strong><span>运行提醒</span><small>出口锁死 1 · 规则未适配 1</small></article>
      </section>

      <div className="encounter-layout">
        <aside className="encounter-index">
          <header><strong>遭遇目录</strong><small>{encounters.length} / 7</small></header>
          <nav aria-label="地图遭遇列表">
            {encounters.map((encounter, index) => <button key={encounter.title} className={selectedTitle === encounter.title ? "active" : ""} onClick={() => selectEncounter(encounter)}><b>0{index + 1}</b><span><strong>{encounter.title}</strong><small>{encounter.map}</small></span><em data-state={encounter.state}>{encounter.state}</em></button>)}
          </nav>
          <section className="encounter-map-source"><span>引用地图</span><strong>{currentBinding?.assetTitle ?? selected.map}</strong><p>{bindingIsStale ? `稳定素材 ID：${currentBinding?.assetId} · 当前项目已取消引用` : currentBinding ? `稳定素材 ID：${currentBinding.assetId}` : "尚未绑定资料仓底图；编辑遭遇不会修改地图素材本身。"}</p><button onClick={() => onFeedback(bindingIsStale ? "该底图引用已失效，请重新绑定或解除。" : currentBinding ? `已定位资料仓地图“${currentBinding.assetTitle}”。` : "请从上方选择一张项目地图。")}>打开地图</button></section>
        </aside>

        <article className="encounter-editor">
          <header><div><span>{selected.state} · {selected.map}</span><h3>{selected.title}</h3><p>{selected.objective}</p></div><button onClick={handleSaveEncounter}>保存遭遇</button></header>
          <nav className="entity-tabs" aria-label="地图遭遇分区">
            {(["遭遇运行总览", "区域与环境", "参与单位", "规则与解法", "遭遇后状态"] as EncounterTab[]).map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}
          </nav>
          {activeTab === "遭遇运行总览" && <EncounterOverview encounter={selected} clock={clock} onClockChange={setClock} onFeedback={onFeedback} />}
          {activeTab === "区域与环境" && <EncounterZones onFeedback={onFeedback} />}
          {activeTab === "参与单位" && <EncounterUnits onFeedback={onFeedback} />}
          {activeTab === "规则与解法" && <EncounterRules encounter={draft} onChange={updateDraft} />}
          {activeTab === "遭遇后状态" && <EncounterAftermath encounter={draft} onChange={updateDraft} onFeedback={onFeedback} />}
        </article>
      </div>
      <p className="workbench-context-note">当前项目：{project.title} · 遭遇可引用场景节点、分级地图、NPC 知情、线索、BGM 与规则系统。</p>
    </section>
  );
}

function EncounterOverview({ encounter, clock, onClockChange, onFeedback }: { encounter: EncounterRecord; clock: number; onClockChange: (clock: number) => void; onFeedback: (message: string) => void }) {
  return <div className="encounter-overview"><section className="encounter-map-preview" aria-label="遭遇地图区域"><header><span>地图区域</span><strong>{encounter.title}</strong><button onClick={() => onFeedback("已模拟切换玩家可见地图。")}>玩家版预览</button></header><div>{zones.map((zone) => <article key={zone.name}><b>{zone.mark}</b><strong>{zone.name}</strong><small>{zone.terrain}</small></article>)}<i className="route-one" /><i className="route-two" /></div></section><section className="encounter-run-strip"><article><span>入口与出口</span><p>{encounter.entryExit}</p></article><article><span>当前压力</span><p>{encounter.pressure}</p></article></section><section className="exploration-clock"><div><span>探索时钟</span><strong>{clock} / 6</strong><p>达到 4：眼线介入　达到 6：目标离场</p></div><div className="clock-pips">{[1,2,3,4,5,6].map((step) => <i key={step} className={step <= clock ? "filled" : ""} />)}</div><button onClick={() => { const next = Math.min(6, clock + 1); onClockChange(next); onFeedback(`探索时钟已推进到 ${next}/6。`); }}>推进时钟</button></section></div>;
}

function EncounterZones({ onFeedback }: { onFeedback: (message: string) => void }) {
  return <div className="encounter-zone-panel"><header><strong>地图区域与环境效果</strong><p>区域效果是遭遇规则，不会写进原始地图图片。</p></header><section>{zones.map((zone) => <article key={zone.name}><b>{zone.mark}</b><div><span>{zone.terrain}</span><strong>{zone.name}</strong><p>{zone.effect}</p></div><button onClick={() => onFeedback(`已模拟编辑区域“${zone.name}”。`)}>编辑区域</button></article>)}</section></div>;
}

function EncounterUnits({ onFeedback }: { onFeedback: (message: string) => void }) {
  return <div className="encounter-unit-panel"><header><strong>参与单位</strong><p>记录意图和状态，而不只是一张怪物数值表。</p></header><section>{units.map((unit) => <article key={unit.name}><b>{unit.name.slice(0, 1)}</b><div><span>{unit.role}</span><strong>{unit.name}</strong><p>{unit.intent}</p></div><em>{unit.status}</em><button onClick={() => onFeedback(`已打开“${unit.name}”的关联档案。`)}>打开档案</button></article>)}</section></div>;
}

function EncounterRules({ encounter, onChange }: { encounter: EncounterRecord; onChange: <Key extends keyof EncounterRecord>(key: Key, value: EncounterRecord[Key]) => void }) {
  return <div className="encounter-rules-panel"><section className="system-rule-cards"><article><span>{dndSystemLabel}</span><strong>技能挑战 / 6 次成功前 3 次失败</strong><p>使用运动、杂技、察觉或合适法术；失败推进时钟并产生位置代价。</p></article><article><span>CoC 7e</span><strong>追逐轮 / 移动行动与障碍检定</strong><p>失败不会丢失目标，而是缩短距离、失去捷径或增加后续风险。</p></article></section><section className="noncombat-solutions"><span>非战斗解法</span><div><article><strong>公开身份交涉</strong><p>让工头协助疏散人群，但会暴露调查者。</p></article><article><strong>制造卸货延误</strong><p>关闭吊机迫使斯诺森改走堆箱小道。</p></article><article><strong>先处理议会眼线</strong><p>通过误导或交易让对方暂时退出追逐。</p></article></div></section><div className="entity-form encounter-rule-form"><label className="full-field">压力与失败代价<textarea rows={4} value={encounter.pressure} onChange={(event) => onChange("pressure", event.target.value)} /></label></div></div>;
}

function EncounterAftermath({ encounter, onChange, onFeedback }: { encounter: EncounterRecord; onChange: <Key extends keyof EncounterRecord>(key: Key, value: EncounterRecord[Key]) => void; onFeedback: (message: string) => void }) {
  return <div className="encounter-aftermath"><header><strong>遭遇后状态</strong><p>结算只写入本团运行状态；确认后再决定是否影响长期世界。</p></header><label>状态变化<textarea rows={6} value={encounter.aftermath} onChange={(event) => onChange("aftermath", event.target.value)} /></label><section><article><span>地图状态</span><strong>吊机停机 · 潮水坡道关闭</strong><p>下次进入时继续生效，除非经过一段恢复时间。</p></article><article><span>人物状态</span><strong>斯诺森警觉 · 眼线身份暴露</strong><p>同步给场景节点与 NPC 知情档案。</p></article><article><span>获得线索</span><strong>湿脚印 · 工棚方向</strong><p>进入线索网络，来源标记为本场行动。</p></article></section><button onClick={() => onFeedback("已把遭遇结算送入本场临时状态，等待团后确认。")}>保存到本场状态</button></div>;
}
