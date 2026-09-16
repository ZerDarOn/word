"use client";

import { useState } from "react";
import type { CreativeProject } from "./creative_project_data";
import {
  addAssetDelivery,
  removeAssetBinding,
  revokeAssetDelivery,
  saveAssetBinding,
  type LoreCueAssetDelivery,
} from "./lorecue_asset_usage_store";
import type { LoreCueAssetRecord } from "./lorecue_asset_store";
import { useProjectAssetUsage } from "./use_project_asset_usage";
import { useProjectAssets } from "./use_project_assets";
import { useCampaignDeliveryTarget } from "./use_campaign_delivery_target";

type AttachmentTab = "玩家附件总览" | "主持人原件" | "玩家版本" | "公开条件" | "发放记录";
type AttachmentState = "未公开" | "可发放" | "已发放" | "已撤回";

interface AttachmentRecord {
  title: string;
  publicTitle: string;
  kind: string;
  state: AttachmentState;
  source: string;
  scene: string;
  recipient: string;
  release: string;
  hidden: string;
  visible: string;
}

const attachments: AttachmentRecord[] = [
  {
    title: "值班名册 · 完整扫描件",
    publicTitle: "港务处值班名册（残页）",
    kind: "文档",
    state: "已发放",
    source: "物件线索 / 值班名册 / 原始条目 v3",
    scene: "开场 · 港务处",
    recipient: "全体玩家",
    release: "调查员成功取得档案管理员许可后",
    hidden: "海曼的姓名与 4 月 17 日夜班签字；页脚的议会封存编号。",
    visible: "保留日期、值班人员与货区编号；被撕去的一角用破损纹理表示。",
  },
  {
    title: "萨菲港总览 · 主持人标注版",
    publicTitle: "萨菲港访客地图",
    kind: "地图",
    state: "可发放",
    source: "地图素材 / 萨菲港 / 城区层级",
    scene: "开场准备",
    recipient: "全体玩家",
    release: "开场介绍结束即可发放",
    hidden: "灰潮号暗泊点、走私仓库入口、旧灯塔地下通道。",
    visible: "码头、港务处、旅店、议会大厅和公共道路。",
  },
  {
    title: "灰潮号船员合影 · 修复版",
    publicTitle: "褪色的船员合影",
    kind: "照片",
    state: "未公开",
    source: "物件线索 / 旧船票 / 关联证物 02",
    scene: "第二幕 · 旧灯塔",
    recipient: "持有船票的玩家",
    release: "用旧船票向守灯人证明来意",
    hidden: "海曼站在后排；相纸背面写有真正的返港日期。",
    visible: "船名被盐渍遮挡，只能辨认七名船员的轮廓。",
  },
  {
    title: "伊芙琳私人信件 · 原稿",
    publicTitle: "未署名的短信",
    kind: "信件",
    state: "已撤回",
    source: "角色档案 / 伊芙琳 / 隐秘经历",
    scene: "第三幕 · 议会档案室",
    recipient: "茗",
    release: "玩家发现档案室夹层",
    hidden: "落款、收件人和能够直接证明伊芙琳身份的家族印记。",
    visible: "正文前三段与日期；保留足以继续调查但不直接揭底的语句。",
  },
];

interface CreativePlayerAttachmentWorkbenchProps {
  project: CreativeProject;
  onFeedback: (message: string) => void;
}

export function CreativePlayerAttachmentWorkbench({ project, onFeedback }: CreativePlayerAttachmentWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<AttachmentTab>("玩家附件总览");
  const [selectedTitle, setSelectedTitle] = useState(attachments[0].title);
  const [draft, setDraft] = useState(attachments[0]);
  const [previewPublic, setPreviewPublic] = useState(true);
  const sourceAssets = useProjectAssets(project.id, ["地图", "文档", "立绘"]);
  const [usage, setUsage] = useProjectAssetUsage(project.id);
  const deliveryTarget = useCampaignDeliveryTarget(project.title);
  const selected = attachments.find((attachment) => attachment.title === selectedTitle) ?? attachments[0];
  const currentBinding = usage?.bindings.find((binding) => binding.surface === "player-attachment" && binding.surfaceId === selected.title);
  const boundSource = currentBinding ? sourceAssets.find((asset) => asset.id === currentBinding.assetId) : undefined;
  const bindingIsStale = Boolean(currentBinding && !boundSource);
  const deliveries = usage?.deliveries.filter((delivery) => delivery.surface === "player-attachment") ?? [];

  function selectAttachment(attachment: AttachmentRecord) {
    setSelectedTitle(attachment.title);
    setDraft(attachment);
    onFeedback(`已打开玩家附件“${attachment.publicTitle}”。`);
  }

  function updateDraft<Key extends keyof AttachmentRecord>(key: Key, value: AttachmentRecord[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSaveAttachment() {
    onFeedback(`已模拟保存“${draft.publicTitle}”的玩家版本、遮罩和公开条件；主持人原件为 ${currentBinding?.assetId ?? "未绑定"}。`);
  }

  function bindAttachmentSource(asset: LoreCueAssetRecord) {
    const next = saveAssetBinding(project.id, {
      surface: "player-attachment",
      surfaceId: selected.title,
      assetId: asset.id,
      assetTitle: asset.title,
      visibility: asset.visibility,
    });
    setUsage(next);
    onFeedback(`已把“${asset.title}”绑定为“${selected.publicTitle}”的主持人原件；玩家版本仍需单独遮罩与预览。`);
  }

  function clearAttachmentSource() {
    const next = removeAssetBinding(project.id, "player-attachment", selected.title);
    setUsage(next);
    onFeedback(`已解除“${selected.publicTitle}”的主持人原件绑定；玩家版本和既有发放历史仍保留。`);
  }

  function handleDeliverAttachment(attachment: AttachmentRecord) {
    if (!currentBinding || bindingIsStale) {
      onFeedback(bindingIsStale ? "主持人原件引用已经失效，请重新绑定后再发放。" : "请先绑定一份资料仓原件，再确认发放；演示文本不能冒充真实附件来源。");
      return;
    }
    if (!deliveryTarget.selectedCampaign || !deliveryTarget.selectedSession) {
      onFeedback("请先选择实际团项目和场次，再记录玩家附件发放。");
      return;
    }
    const next = addAssetDelivery(project.id, {
      surface: "player-attachment",
      surfaceId: attachment.title,
      assetId: currentBinding.assetId,
      assetTitle: currentBinding.assetTitle,
      playerTitle: attachment.publicTitle,
      recipient: attachment.recipient,
      campaignId: deliveryTarget.selectedCampaign.id,
      campaignTitle: deliveryTarget.selectedCampaign.name,
      sessionId: deliveryTarget.selectedSession.id,
      sessionLabel: `${deliveryTarget.selectedSession.number} · ${deliveryTarget.selectedSession.title}`,
      version: "玩家版本 v1",
    });
    setUsage(next);
    onFeedback(`已记录“${deliveryTarget.selectedCampaign.name} / ${deliveryTarget.selectedSession.number}”向“${attachment.recipient}”发放“${attachment.publicTitle}”。`);
  }

  function handleRevokeDelivery(delivery: LoreCueAssetDelivery) {
    const next = revokeAssetDelivery(project.id, delivery.id);
    setUsage(next);
    onFeedback(`已撤回“${delivery.playerTitle}”的后续访问；玩家曾经看过的事实仍保留。`);
  }

  return (
    <section className="attachment-workbench studio-board">
      <div className="studio-page-heading">
        <div><span className="eyebrow">视觉与媒体 · 玩家附件</span><h2>交给玩家的每一页，都有自己的边界与履历</h2><p>主持人原件不会直接流向玩家；系统先生成独立玩家版本，再记录何时、向谁发放。</p></div>
        <button onClick={() => onFeedback("已模拟建立一份空白玩家附件。")}>＋ 新建附件</button>
      </div>

      <section className="attachment-safety-banner"><strong>双版本隔离</strong><span>玩家版本隐藏内部文件名、主持人批注与剧透区域；撤回不会抹除玩家已经看过的信息。</span></section>
      <section className={`workbench-asset-strip ${bindingIsStale ? "has-stale-binding" : ""}`} aria-label="玩家附件原件素材">
        <div><strong>主持人原件来源</strong><span>{sourceAssets.length} 条项目素材 · 当前：{bindingIsStale ? `失效引用 · ${currentBinding?.assetTitle}` : currentBinding?.assetTitle ?? "未绑定"}</span>{currentBinding && <button className="asset-clear-binding" onClick={clearAttachmentSource}>解除绑定</button>}</div>
        <div>{sourceAssets.length > 0 ? sourceAssets.map((asset) => <button key={asset.id} className={currentBinding?.assetId === asset.id ? "active" : ""} onClick={() => bindAttachmentSource(asset)}>{asset.title}<small>{asset.kind} · {asset.visibility}</small></button>) : <p>当前项目没有可用地图、文档或立绘；请先到资料库建立引用。</p>}</div>
      </section>
      <section className="delivery-target-strip" aria-label="玩家附件实际发放归属">
        <div><strong>实际发放归属</strong><span>同一模组的不同团项目互不共享披露历史</span></div>
        <label>团项目<select value={deliveryTarget.campaignId} onChange={(event) => deliveryTarget.selectCampaign(event.target.value)}><option value="">请选择</option>{deliveryTarget.campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select></label>
        <label>场次<select value={deliveryTarget.sessionId} disabled={!deliveryTarget.campaignId} onChange={(event) => deliveryTarget.selectSession(event.target.value)}><option value="">请选择</option>{deliveryTarget.sessions.map((session) => <option key={session.id} value={session.id}>{session.number} · {session.title}</option>)}</select></label>
      </section>
      <section className="attachment-metrics" aria-label="玩家附件概况">
        <article><strong>{sourceAssets.length}</strong><span>项目原件</span><small>只统计明确引用素材</small></article>
        <article><strong>11</strong><span>玩家版本</span><small>均保留来源引用</small></article>
        <article><strong>{deliveries.filter((delivery) => delivery.status === "active").length}</strong><span>本地已发放</span><small>按素材 ID 与版本留痕</small></article>
        <article className="risk"><strong>2</strong><span>待复核</span><small>剧透遮罩可能不完整</small></article>
      </section>

      <div className="attachment-layout">
        <aside className="attachment-index">
          <header><strong>附件目录</strong><small>{attachments.length} / 18</small></header>
          <nav aria-label="玩家附件列表">{attachments.map((attachment, index) => <button key={attachment.title} className={selectedTitle === attachment.title ? "active" : ""} onClick={() => selectAttachment(attachment)}><b>0{index + 1}</b><span><strong>{attachment.publicTitle}</strong><small>{attachment.kind} · {attachment.recipient}</small></span><em data-state={attachment.state}>{attachment.state}</em></button>)}</nav>
          <section className="attachment-rule-card"><span>发放原则</span><strong>先预览，再交付</strong><p>每次发放都固定当时版本，后来修改不会悄悄改变玩家证据。</p></section>
        </aside>

        <article className="attachment-editor">
          <header><div><span>{selected.kind} · {selected.state}</span><h3>{selected.publicTitle}</h3><p>{selected.scene} · {selected.recipient}</p></div><button onClick={handleSaveAttachment}>保存附件</button></header>
          <nav className="entity-tabs" aria-label="玩家附件分区">{(["玩家附件总览", "主持人原件", "玩家版本", "公开条件", "发放记录"] as AttachmentTab[]).map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>
          {activeTab === "玩家附件总览" && <AttachmentOverview attachment={selected} previewPublic={previewPublic} onPreviewChange={setPreviewPublic} onFeedback={onFeedback} />}
          {activeTab === "主持人原件" && <OriginalAttachment attachment={selected} />}
          {activeTab === "玩家版本" && <PlayerAttachmentVersion attachment={draft} onChange={updateDraft} />}
          {activeTab === "公开条件" && <AttachmentRelease attachment={draft} onChange={updateDraft} onFeedback={onFeedback} onDeliver={handleDeliverAttachment} />}
          {activeTab === "发放记录" && <AttachmentDeliveryLog deliveries={deliveries} onRevoke={handleRevokeDelivery} onFeedback={onFeedback} />}
        </article>
      </div>
      <p className="workbench-context-note">当前项目：{project.title} · 附件记录属于具体模组；实际发放历史还会归入对应团与场次。</p>
    </section>
  );
}

function AttachmentOverview({ attachment, previewPublic, onPreviewChange, onFeedback }: { attachment: AttachmentRecord; previewPublic: boolean; onPreviewChange: (next: boolean) => void; onFeedback: (message: string) => void }) {
  return <div className="attachment-overview"><header><div><strong>预览玩家所见</strong><p>切换视角只影响预览，不会改动文件。</p></div><div className="attachment-view-toggle"><button className={!previewPublic ? "active" : ""} onClick={() => onPreviewChange(false)}>主持人原件</button><button className={previewPublic ? "active" : ""} onClick={() => onPreviewChange(true)}>玩家版本</button></div></header><section className={previewPublic ? "attachment-paper public" : "attachment-paper gm"}><span>{previewPublic ? "玩家可见副本" : "仅主持人可见原件"}</span><h4>{previewPublic ? attachment.publicTitle : attachment.title}</h4><p>{previewPublic ? attachment.visible : `${attachment.visible} ${attachment.hidden}`}</p>{previewPublic ? <div className="redaction-block"><b>剧透遮罩</b><i /><i /></div> : <aside><strong>隐藏内容</strong><p>{attachment.hidden}</p></aside>}<footer>来源引用：{attachment.source}</footer></section><div className="attachment-overview-actions"><button onClick={() => onFeedback("已模拟导出当前玩家版本。")}>导出玩家版本</button><button onClick={() => onFeedback(`已准备按玩家发放“${attachment.publicTitle}”。`)}>按玩家发放</button></div></div>;
}

function OriginalAttachment({ attachment }: { attachment: AttachmentRecord }) {
  return <div className="original-attachment"><header><strong>主持人原件</strong><p>原件只用于制作玩家副本，不能直接从这里发送。</p></header><section><article><span>内部名称</span><strong>{attachment.title}</strong><p>{attachment.kind} · {attachment.scene}</p></article><article><span>来源引用</span><strong>{attachment.source}</strong><p>引用源条目更新时提醒复核，不自动覆盖本附件。</p></article><article className="danger"><span>隐藏内容</span><strong>禁止进入玩家版本</strong><p>{attachment.hidden}</p></article></section><aside><b>原件锁</b><p>发送按钮在主持人原件视角中不可用，必须先建立并预览玩家版本。</p></aside></div>;
}

function PlayerAttachmentVersion({ attachment, onChange }: { attachment: AttachmentRecord; onChange: <Key extends keyof AttachmentRecord>(key: Key, value: AttachmentRecord[Key]) => void }) {
  return <div className="entity-form attachment-version-form"><label>内部名称<input value={attachment.title} onChange={(event) => onChange("title", event.target.value)} /></label><label>玩家端名称<input value={attachment.publicTitle} onChange={(event) => onChange("publicTitle", event.target.value)} /></label><label>附件类型<input value={attachment.kind} onChange={(event) => onChange("kind", event.target.value)} /></label><label>状态<select value={attachment.state} onChange={(event) => onChange("state", event.target.value as AttachmentState)}><option>未公开</option><option>可发放</option><option>已发放</option><option>已撤回</option></select></label><label className="full-field">玩家可见内容<textarea rows={5} value={attachment.visible} onChange={(event) => onChange("visible", event.target.value)} /></label><label className="full-field">剧透遮罩与隐藏内容<textarea rows={4} value={attachment.hidden} onChange={(event) => onChange("hidden", event.target.value)} /></label><div className="attachment-mask-check"><strong>剧透遮罩检查</strong><span>内部人物真名</span><span>未公开地点</span><span>主持人批注</span><button type="button">重新扫描</button></div></div>;
}

function AttachmentRelease({ attachment, onChange, onFeedback, onDeliver }: { attachment: AttachmentRecord; onChange: <Key extends keyof AttachmentRecord>(key: Key, value: AttachmentRecord[Key]) => void; onFeedback: (message: string) => void; onDeliver: (attachment: AttachmentRecord) => void }) {
  return <div className="attachment-release"><header><strong>公开条件</strong><p>条件需要主持人确认；系统不会监听玩家对话后自行发放。</p></header><label>触发条件<textarea rows={4} value={attachment.release} onChange={(event) => onChange("release", event.target.value)} /></label><label>默认接收者<input value={attachment.recipient} onChange={(event) => onChange("recipient", event.target.value)} /></label><section><article className="done"><b>已满足</b><div><strong>获得档案管理员许可</strong><p>由主持人在第 02 次团手动确认。</p></div><button onClick={() => onFeedback("已查看条件依据。")}>查看依据</button></article><article><b>待选择</b><div><strong>发给全体还是单独调查员</strong><p>单独发放会记录接收者，其他玩家不会获得副本。</p></div><button onClick={() => onFeedback("已打开接收者选择。")}>选择玩家</button></article></section><button onClick={() => onDeliver(attachment)}>确认发放并留痕</button></div>;
}

function AttachmentDeliveryLog({ deliveries, onRevoke, onFeedback }: { deliveries: LoreCueAssetDelivery[]; onRevoke: (delivery: LoreCueAssetDelivery) => void; onFeedback: (message: string) => void }) {
  return <div className="attachment-delivery-log"><header><strong>发放记录</strong><p>记录玩家当时真正看到的版本；撤回不会抹除已经发生的事实。</p></header>{deliveries.length > 0 && <><h4 className="delivery-local-title">当前浏览器新增记录</h4><section>{deliveries.map((delivery) => <article className={delivery.status === "revoked" ? "revoked" : ""} key={delivery.id}><time>{delivery.campaignTitle ?? "旧记录 · 未指定团"}<small>{delivery.sessionLabel}</small></time><div><strong>{delivery.playerTitle}</strong><p>{delivery.recipient} · {delivery.version} · 素材 {delivery.assetId ?? "无绑定"}</p></div><em>{delivery.status === "revoked" ? "已撤回" : "仍可查看"}</em><button onClick={() => delivery.status === "active" ? onRevoke(delivery) : onFeedback("该发放记录已经撤回；历史仍然保留。")}>{delivery.status === "active" ? "撤回访问" : "查看记录"}</button></article>)}</section></>}<h4 className="delivery-local-title">演示场次历史</h4><section><article><time>第 02 次团 · 21:14</time><div><strong>港务处值班名册（残页）</strong><p>发给全体玩家 · 玩家版本 v2 · 主持人手动发放</p></div><em>仍可查看</em><button onClick={() => onFeedback("已打开第 02 次团的附件快照。")}>打开快照</button></article><article className="revoked"><time>第 03 次团 · 20:47</time><div><strong>未署名的短信</strong><p>仅发给茗 · 玩家版本 v1 · 21:03 撤回</p></div><em>已撤回</em><button onClick={() => onFeedback("已打开撤回原因与原始发放记录。")}>查看记录</button></article></section><aside><strong>撤回不会抹除</strong><p>系统只停止后续访问，并明确记录玩家曾经看过什么；AI 在复盘时仍会把它视为已披露信息。</p></aside></div>;
}
