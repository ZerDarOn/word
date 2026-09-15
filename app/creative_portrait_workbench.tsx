"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import type { CreativeProject } from "./creative_project_data";

type PortraitTab = "角色立绘总览" | "身份版本" | "表情与状态" | "登场预览" | "素材来源";
type PortraitState = "正式素材" | "待确认" | "缺少版本";

interface PortraitRecord {
  character: string;
  publicName: string;
  state: PortraitState;
  identity: string;
  outfit: string;
  expression: string;
  injury: string;
  reveal: string;
  source: string;
  license: string;
  palette: string;
}

const portraits: PortraitRecord[] = [
  { character: "伊芙琳", publicName: "港务官伊芙琳", state: "正式素材", identity: "港务官", outfit: "深蓝制服 · 银质领针", expression: "平静 / 警惕 / 动摇", injury: "无伤 / 左手绷带", reveal: "开场即可显示制服常态；绷带版仅在仓库冲突后显示。", source: "委托绘制 · 文件 evelyn-master.psd", license: "项目内及团务展示", palette: "#3d5964" },
  { character: "斯诺森", publicName: "码头工人", state: "待确认", identity: "码头装卸工", outfit: "工作服 / 下班便装", expression: "戒备 / 困惑 / 愤怒", injury: "右眉旧伤", reveal: "玩家确认姓名前只显示“码头工人”，不展示内部角色名。", source: "AI 候选图 · 提示词版本 04", license: "未确认，不可导出发布", palette: "#765240" },
  { character: "海曼", publicName: "照片中的陌生人", state: "正式素材", identity: "二十年前 / 现在", outfit: "船长礼服 / 潮湿旧外套", expression: "笃定 / 空洞", injury: "右肩贯穿伤痕", reveal: "当前身份属于终幕剧透；登场前仅可使用二十年前合影裁片。", source: "自绘 · heyman-v6.clip", license: "作者原创", palette: "#4f6358" },
  { character: "守灯人", publicName: "旧灯塔看守", state: "缺少版本", identity: "公开身份", outfit: "防雨斗篷", expression: "疲惫", injury: "无", reveal: "第二幕进入旧灯塔时显示。", source: "尚未建立素材", license: "待补充", palette: "#6a6255" },
];

interface CreativePortraitWorkbenchProps {
  project: CreativeProject;
  onFeedback: (message: string) => void;
}

export function CreativePortraitWorkbench({ project, onFeedback }: CreativePortraitWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<PortraitTab>("角色立绘总览");
  const [selectedName, setSelectedName] = useState(portraits[0].character);
  const [draft, setDraft] = useState(portraits[0]);
  const [previewState, setPreviewState] = useState("平静");
  const selected = portraits.find((portrait) => portrait.character === selectedName) ?? portraits[0];

  function selectPortrait(portrait: PortraitRecord) {
    setSelectedName(portrait.character);
    setDraft(portrait);
    setPreviewState(portrait.expression.split(" / ")[0]);
    onFeedback(`已打开“${portrait.character}”的立绘组。`);
  }

  function updateDraft<Key extends keyof PortraitRecord>(key: Key, value: PortraitRecord[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSavePortrait() {
    onFeedback(`已模拟保存“${draft.character}”的身份版本、公开名称与登场条件。`);
  }

  return (
    <section className="portrait-workbench studio-board">
      <div className="studio-page-heading">
        <div><span className="eyebrow">视觉与媒体 · 角色立绘</span><h2>立绘服务于角色状态，但不替角色泄露身份</h2><p>同一角色可以拥有身份、年代、服装与伤势版本；主持人决定本次登场真正显示哪一张。</p></div>
        <button onClick={() => onFeedback("已模拟导入一组角色立绘。")}>＋ 导入立绘组</button>
      </div>
      <section className="portrait-policy-banner"><strong>素材候选 ≠ 正式设定</strong><span>AI 候选图必须由创作者确认后才可设为正式素材，也不会自动替换角色当前立绘。</span></section>
      <section className="portrait-metrics" aria-label="角色立绘概况">
        <article><strong>8</strong><span>角色立绘组</span><small>共 26 个视觉版本</small></article>
        <article><strong>12</strong><span>表情与状态</span><small>可按场景快速切换</small></article>
        <article><strong>5</strong><span>身份版本</span><small>包含年代与伪装</small></article>
        <article className="risk"><strong>3</strong><span>待处理</span><small>缺图 1 · 授权待确认 2</small></article>
      </section>

      <div className="portrait-layout">
        <aside className="portrait-index">
          <header><strong>角色目录</strong><small>{portraits.length} / 8</small></header>
          <nav aria-label="角色立绘列表">{portraits.map((portrait, index) => <button key={portrait.character} className={selectedName === portrait.character ? "active" : ""} onClick={() => selectPortrait(portrait)}><i style={{ background: portrait.palette }}>{portrait.character.slice(0, 1)}</i><span><strong>{portrait.character}</strong><small>{portrait.identity} · {portrait.outfit}</small></span><em data-state={portrait.state}>{portrait.state}</em><b>0{index + 1}</b></button>)}</nav>
          <section className="portrait-stage-card"><span>当前投屏</span><strong>{selected.publicName}</strong><p>{previewState} · 半身构图 · 玩家可见</p><button onClick={() => onFeedback("已模拟隐藏当前投屏立绘。")}>暂时隐藏</button></section>
        </aside>

        <article className="portrait-editor">
          <header><div><span>{selected.state} · {selected.identity}</span><h3>{selected.character}</h3><p>玩家可见名称：{selected.publicName}</p></div><button onClick={handleSavePortrait}>保存立绘设置</button></header>
          <nav className="entity-tabs" aria-label="角色立绘分区">{(["角色立绘总览", "身份版本", "表情与状态", "登场预览", "素材来源"] as PortraitTab[]).map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>
          {activeTab === "角色立绘总览" && <PortraitOverview portrait={selected} previewState={previewState} onPreviewState={setPreviewState} onFeedback={onFeedback} />}
          {activeTab === "身份版本" && <PortraitIdentity portrait={draft} onChange={updateDraft} />}
          {activeTab === "表情与状态" && <PortraitStates portrait={selected} onPreviewState={setPreviewState} onFeedback={onFeedback} />}
          {activeTab === "登场预览" && <PortraitStagePreview portrait={selected} previewState={previewState} onFeedback={onFeedback} />}
          {activeTab === "素材来源" && <PortraitProvenance portrait={selected} onFeedback={onFeedback} />}
        </article>
      </div>
      <p className="workbench-context-note">当前项目：{project.title} · 角色事实仍以角色档案为准；这里仅管理视觉版本和显示规则。</p>
    </section>
  );
}

function PortraitFigure({ portrait, state, compact = false }: { portrait: PortraitRecord; state: string; compact?: boolean }) {
  return <div className={compact ? "portrait-figure compact" : "portrait-figure"} style={{ "--portrait-tone": portrait.palette } as CSSProperties}><div className="portrait-head"><i /><span /></div><div className="portrait-body"><i /><i /></div><em>{state}</em></div>;
}

function PortraitOverview({ portrait, previewState, onPreviewState, onFeedback }: { portrait: PortraitRecord; previewState: string; onPreviewState: (state: string) => void; onFeedback: (message: string) => void }) {
  const states = portrait.expression.split(" / ");
  return <div className="portrait-overview"><section className="portrait-hero-card"><PortraitFigure portrait={portrait} state={previewState} /><div><span>当前正式版本</span><h4>{portrait.publicName}</h4><p>{portrait.identity} · {portrait.outfit}</p><dl><div><dt>服装与伤势</dt><dd>{portrait.injury}</dd></div><div><dt>显示条件</dt><dd>{portrait.reveal}</dd></div><div><dt>裁切安全区</dt><dd>头像 / 半身 / 竖版均已检查</dd></div></dl><div className="portrait-quick-states">{states.map((state) => <button key={state} className={previewState === state ? "active" : ""} onClick={() => onPreviewState(state)}>{state}</button>)}</div><button className="portrait-present-button" onClick={() => onFeedback(`已模拟向玩家显示“${portrait.publicName} · ${previewState}”。`)}>显示给玩家</button></div></section><section className="portrait-version-strip"><article><span>身份版本</span><strong>{portrait.identity}</strong><p>内部身份与玩家名称分别保存。</p></article><article><span>表情与状态</span><strong>{portrait.expression}</strong><p>只切换视觉，不改变 NPC 当前事实。</p></article><article><span>素材来源</span><strong>{portrait.source}</strong><p>{portrait.license}</p></article></section></div>;
}

function PortraitIdentity({ portrait, onChange }: { portrait: PortraitRecord; onChange: <Key extends keyof PortraitRecord>(key: Key, value: PortraitRecord[Key]) => void }) {
  return <div className="entity-form portrait-identity-form"><label>内部角色名<input value={portrait.character} onChange={(event) => onChange("character", event.target.value)} /></label><label>玩家可见名称<input value={portrait.publicName} onChange={(event) => onChange("publicName", event.target.value)} /></label><label>身份版本<input value={portrait.identity} onChange={(event) => onChange("identity", event.target.value)} /></label><label>素材状态<select value={portrait.state} onChange={(event) => onChange("state", event.target.value as PortraitState)}><option>正式素材</option><option>待确认</option><option>缺少版本</option></select></label><label>服装<input value={portrait.outfit} onChange={(event) => onChange("outfit", event.target.value)} /></label><label>服装与伤势<input value={portrait.injury} onChange={(event) => onChange("injury", event.target.value)} /></label><label className="full-field">显示与身份公开条件<textarea rows={5} value={portrait.reveal} onChange={(event) => onChange("reveal", event.target.value)} /></label><div className="portrait-identity-warning"><strong>身份泄露检查</strong><p>玩家可见名称、文件名、画面文字和装饰徽记都需要独立检查。</p><button type="button">运行检查</button></div></div>;
}

function PortraitStates({ portrait, onPreviewState, onFeedback }: { portrait: PortraitRecord; onPreviewState: (state: string) => void; onFeedback: (message: string) => void }) {
  const states = portrait.expression.split(" / ");
  return <div className="portrait-state-panel"><header><strong>表情与状态</strong><p>视觉状态可以绑定场景提示，但仍由主持人手动确认切换。</p></header><section>{states.map((state, index) => <article key={state}><PortraitFigure portrait={portrait} state={state} compact /><div><span>状态 0{index + 1}</span><strong>{state}</strong><p>{index === 0 ? "默认登场状态" : index === 1 ? "遭到追问或进入压力场景" : "身份线索被玩家准确指出后"}</p></div><button onClick={() => { onPreviewState(state); onFeedback(`已把“${state}”设为预览状态。`); }}>预览</button></article>)}</section><button onClick={() => onFeedback("已模拟新增一张状态差分。")}>＋ 添加状态差分</button></div>;
}

function PortraitStagePreview({ portrait, previewState, onFeedback }: { portrait: PortraitRecord; previewState: string; onFeedback: (message: string) => void }) {
  return <div className="portrait-stage-preview"><header><strong>登场预览</strong><p>同时检查主持人控制区、玩家投屏与头像裁切安全区。</p></header><section><article className="stage-player-card"><span>玩家端</span><PortraitFigure portrait={portrait} state={previewState} /><h4>{portrait.publicName}</h4><p>不会显示内部身份、素材文件名或公开条件。</p></article><article className="stage-crop-card"><span>头像裁切</span><div><PortraitFigure portrait={portrait} state={previewState} compact /></div><strong>裁切安全区通过</strong><p>面部、头饰与身份必要特征没有超出范围。</p></article></section><aside><strong>本次显示不会写入设定</strong><p>登场记录只说明玩家看到了哪个视觉版本，不代表该角色事实发生了变化。</p><button onClick={() => onFeedback("已模拟将当前版本加入本场显示队列。")}>加入本场显示队列</button></aside></div>;
}

function PortraitProvenance({ portrait, onFeedback }: { portrait: PortraitRecord; onFeedback: (message: string) => void }) {
  const isAi = portrait.source.includes("AI 候选图");
  return <div className="portrait-provenance"><header><strong>素材来源</strong><p>来源、授权和编辑链独立记录，避免候选素材被误认成正式资产。</p></header><section><article><span>来源类型</span><strong>{portrait.source}</strong><p>{isAi ? "AI 候选图：仅用于方向预览，尚未获得正式素材身份。" : "已记录原始工程文件与作者信息。"}</p></article><article><span>使用授权</span><strong>{portrait.license}</strong><p>导出玩家附件或公开发布前再次检查。</p></article><article><span>版本链</span><strong>原件 → 裁切版 → 状态差分</strong><p>每个派生版本都能回到来源文件。</p></article></section>{isAi ? <aside className="candidate"><strong>AI 候选图不会自动替换</strong><p>需要创作者明确“设为正式素材”，并重新确认身份外观、授权与剧透边界。</p><button onClick={() => onFeedback("已模拟提交 AI 候选图确认；尚未替换正式立绘。")}>提交人工确认</button></aside> : <aside><strong>正式素材</strong><p>当前来源与授权信息完整，可以用于项目内展示。</p><button onClick={() => onFeedback("已打开素材版本历史。")}>查看版本历史</button></aside>}</div>;
}
