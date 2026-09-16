"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ensureAssetCatalog,
  importAssetFile,
  readAssetBinary,
  setAssetTargetLink,
  type LoreCueAssetKind,
  type LoreCueAssetOwnerType,
  type LoreCueAssetRecord,
  type LoreCueAssetTarget,
  type LoreCueAssetVisibility,
} from "./lorecue_asset_store";
import type { LoreCueAssetUsageSurface } from "./lorecue_asset_usage_store";
import { useProjectAssetUsage } from "./use_project_asset_usage";

const usageSurfaceLabels: Record<LoreCueAssetUsageSurface, string> = {
  "map-node": "地图节点",
  encounter: "地图遭遇",
  "player-attachment": "玩家附件",
  "player-handout": "玩家手册",
};

const initialAssets: LoreCueAssetRecord[] = [
  {
    id: "portrait-evelyn",
    kind: "立绘",
    title: "伊芙琳 · 港务官",
    description: "半身立绘 · 2400 × 3200",
    ownerType: "创作项目",
    ownerId: "saffi-module",
    ownerLabel: "萨菲港旧案",
    visibility: "按场次解锁",
    spoilerNote: "暴露港务官身份，但不展示守灯人纹章版本。",
    provenance: "委托绘制 · 原始文件已登记",
    importedAt: "2026-07-20T12:00:00.000Z",
    updatedAt: "2026-07-20T12:00:00.000Z",
    hasBinary: false,
    links: [
      { targetType: "creative", targetId: "saffi-module", targetLabel: "萨菲港旧案", linkedAt: "2026-07-20T12:00:00.000Z" },
      { targetType: "campaign", targetId: "saffi-old-friends", targetLabel: "萨菲港旧案 · 老友组", linkedAt: "2026-07-29T12:00:00.000Z" },
    ],
  },
  {
    id: "map-port",
    kind: "地图",
    title: "萨菲港 · 码头区",
    description: "区域地图 · 12 个标记点",
    ownerType: "创作项目",
    ownerId: "saffi-module",
    ownerLabel: "萨菲港旧案",
    visibility: "主持人私有",
    spoilerNote: "包含地下仓库入口与灰潮号靠泊位置。",
    provenance: "作者自制 · v2",
    importedAt: "2026-07-24T12:00:00.000Z",
    updatedAt: "2026-07-24T12:00:00.000Z",
    hasBinary: false,
    links: [
      { targetType: "creative", targetId: "saffi-module", targetLabel: "萨菲港旧案", linkedAt: "2026-07-24T12:00:00.000Z" },
      { targetType: "campaign", targetId: "saffi-old-friends", targetLabel: "萨菲港旧案 · 老友组", linkedAt: "2026-07-29T12:00:00.000Z" },
    ],
  },
  {
    id: "bgm-undertow",
    kind: "BGM",
    title: "码头 · 暗潮",
    description: "03:42 · 低沉弦乐 / 雾笛",
    ownerType: "公共资料",
    ownerLabel: "公共资料",
    visibility: "玩家可见",
    spoilerNote: "播放器对玩家只显示“港口氛围”。",
    provenance: "已登记授权来源 · 演示条目",
    importedAt: "2026-07-18T12:00:00.000Z",
    updatedAt: "2026-07-18T12:00:00.000Z",
    hasBinary: false,
    links: [
      { targetType: "creative", targetId: "tide-letter", targetLabel: "潮汐来信", linkedAt: "2026-07-21T12:00:00.000Z" },
      { targetType: "campaign", targetId: "saffi-old-friends", targetLabel: "萨菲港旧案 · 老友组", linkedAt: "2026-07-29T12:00:00.000Z" },
    ],
  },
  {
    id: "person-snowson",
    kind: "人物",
    title: "斯诺森",
    description: "装卸工 · 5 条关系 · 3 条秘密",
    ownerType: "创作项目",
    ownerId: "saffi-module",
    ownerLabel: "萨菲港旧案",
    visibility: "主持人私有",
    spoilerNote: "人物真实雇主不可对玩家公开。",
    provenance: "原始人物档案",
    importedAt: "2026-07-10T12:00:00.000Z",
    updatedAt: "2026-07-10T12:00:00.000Z",
    hasBinary: false,
    links: [{ targetType: "campaign", targetId: "saffi-old-friends", targetLabel: "萨菲港旧案 · 老友组", linkedAt: "2026-07-29T12:00:00.000Z" }],
  },
  {
    id: "place-lighthouse",
    kind: "地点",
    title: "旧灯塔",
    description: "地点卡 · 4 个场景入口",
    ownerType: "创作项目",
    ownerId: "north-world",
    ownerLabel: "北境纪事",
    visibility: "主持人私有",
    spoilerNote: "尚未向其他作品开放。",
    provenance: "世界观原始条目",
    importedAt: "2026-07-11T12:00:00.000Z",
    updatedAt: "2026-07-11T12:00:00.000Z",
    hasBinary: false,
    links: [],
  },
  {
    id: "rule-chase",
    kind: "规则",
    title: "港区追逐检定",
    description: "自定义规则 · 第 2 版",
    ownerType: "公共资料",
    ownerLabel: "公共资料",
    visibility: "玩家可见",
    spoilerNote: "不含主持人侧难度表。",
    provenance: "作者自制规则",
    importedAt: "2026-07-15T12:00:00.000Z",
    updatedAt: "2026-07-15T12:00:00.000Z",
    hasBinary: false,
    links: [],
  },
  {
    id: "doc-manifest",
    kind: "文档",
    title: "灰潮号船员名册",
    description: "PDF 摘录 · 8 页",
    ownerType: "创作项目",
    ownerId: "saffi-module",
    ownerLabel: "萨菲港旧案",
    visibility: "按场次解锁",
    spoilerNote: "第 3 次团前只可展示缺页版本。",
    provenance: "剧本附件 · v0.8",
    importedAt: "2026-07-26T12:00:00.000Z",
    updatedAt: "2026-07-26T12:00:00.000Z",
    hasBinary: false,
    links: [{ targetType: "campaign", targetId: "saffi-old-friends", targetLabel: "萨菲港旧案 · 老友组", linkedAt: "2026-07-29T12:00:00.000Z" }],
  },
];

type ImportDraft = {
  title: string;
  kind: LoreCueAssetKind;
  owner: "public" | "creative" | "campaign";
  visibility: LoreCueAssetVisibility;
  spoilerNote: string;
  provenance: string;
  linkToActive: boolean;
};

const assetKinds: LoreCueAssetKind[] = ["人物", "地点", "地图", "立绘", "BGM", "规则", "文档"];

function formatBytes(value = 0) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function inferKind(file: File): LoreCueAssetKind {
  if (file.type.startsWith("audio/")) return "BGM";
  if (file.type.startsWith("image/")) return /map|地图|区域|平面/i.test(file.name) ? "地图" : "立绘";
  return "文档";
}

function targetMatches(asset: LoreCueAssetRecord, target: LoreCueAssetTarget) {
  return asset.links.some((link) => link.targetType === target.targetType && link.targetId === target.targetId);
}

interface NarrativeAssetLibraryProps {
  hidden: boolean;
  currentProjectId: string;
  currentProjectTitle: string;
  currentCampaignId: string;
  currentCampaignTitle: string;
}

export function NarrativeAssetLibrary({
  hidden,
  currentProjectId,
  currentProjectTitle,
  currentCampaignId,
  currentCampaignTitle,
}: NarrativeAssetLibraryProps) {
  const [assets, setAssets] = useState(initialAssets);
  const [filter, setFilter] = useState<"全部" | LoreCueAssetKind>("全部");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialAssets[0].id);
  const [targetType, setTargetType] = useState<"creative" | "campaign">("creative");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [assetPreview, setAssetPreview] = useState<{
    assetId: string;
    url: string;
    state: "ready" | "missing";
  }>({ assetId: "", url: "", state: "missing" });
  const [feedback, setFeedback] = useState("正在读取浏览器中的资料目录……");
  const [pendingUnlinkAssetId, setPendingUnlinkAssetId] = useState<string | null>(null);
  const [assetUsage] = useProjectAssetUsage(currentProjectId);
  const [draft, setDraft] = useState<ImportDraft>({
    title: "",
    kind: "文档",
    owner: "creative",
    visibility: "主持人私有",
    spoilerNote: "",
    provenance: "本机导入",
    linkToActive: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTarget = useMemo<LoreCueAssetTarget>(() => targetType === "creative"
    ? { targetType: "creative", targetId: currentProjectId, targetLabel: currentProjectTitle }
    : { targetType: "campaign", targetId: currentCampaignId, targetLabel: currentCampaignTitle }, [
    currentCampaignId,
    currentCampaignTitle,
    currentProjectId,
    currentProjectTitle,
    targetType,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const restored = ensureAssetCatalog(initialAssets);
      setAssets(restored);
      setFeedback(`资料目录 v1 已就绪 · ${restored.length} 条资料；真实文件保存在当前浏览器。`);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const visibleAssets = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    return assets.filter((asset) => (filter === "全部" || asset.kind === filter)
      && (!normalized || `${asset.title} ${asset.description} ${asset.ownerLabel} ${asset.provenance}`
        .toLocaleLowerCase("zh-CN").includes(normalized)));
  }, [assets, filter, query]);
  const selected = assets.find((asset) => asset.id === selectedId) ?? assets[0];
  const selectedLinked = selected ? targetMatches(selected, activeTarget) : false;
  const linkedCount = assets.filter((asset) => targetMatches(asset, activeTarget)).length;
  const selectedBindings = targetType === "creative" && selected
    ? assetUsage?.bindings.filter((binding) => binding.assetId === selected.id) ?? []
    : [];
  const selectedDeliveries = targetType === "creative" && selected
    ? assetUsage?.deliveries.filter((delivery) => delivery.assetId === selected.id) ?? []
    : [];

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    if (!selected?.hasBinary) {
      return () => undefined;
    }
    readAssetBinary(selected.id).then((blob) => {
      if (!active) return;
      if (!blob) {
        setAssetPreview({ assetId: selected.id, url: "", state: "missing" });
        return;
      }
      objectUrl = URL.createObjectURL(blob);
      setAssetPreview({ assetId: selected.id, url: objectUrl, state: "ready" });
    }).catch(() => {
      if (active) setAssetPreview({ assetId: selected.id, url: "", state: "missing" });
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selected?.hasBinary, selected?.id]);

  const previewUrl = assetPreview.assetId === selected?.id ? assetPreview.url : "";
  const binaryState = !selected?.hasBinary
    ? "none"
    : assetPreview.assetId !== selected.id
      ? "loading"
      : assetPreview.state;

  function handleChooseFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      setFeedback("单个文件暂限 100 MB；请先压缩音频或图片后再导入。");
      return;
    }
    setPendingFile(file);
    setDraft({
      title: file.name.replace(/\.[^.]+$/, ""),
      kind: inferKind(file),
      owner: targetType,
      visibility: targetType === "campaign" ? "按场次解锁" : "主持人私有",
      spoilerNote: "",
      provenance: `本机导入 · ${file.name}`,
      linkToActive: true,
    });
    setFeedback("文件尚未写入；请先确认归属、可见范围与来源。");
  }

  function closeImport() {
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleImport() {
    if (!pendingFile || !draft.title.trim()) {
      setFeedback("请先选择文件并填写资料名称。");
      return;
    }
    const ownerTarget = draft.owner === "creative"
      ? { ownerType: "创作项目" as LoreCueAssetOwnerType, ownerId: currentProjectId, ownerLabel: currentProjectTitle }
      : draft.owner === "campaign"
        ? { ownerType: "团项目" as LoreCueAssetOwnerType, ownerId: currentCampaignId, ownerLabel: currentCampaignTitle }
        : { ownerType: "公共资料" as LoreCueAssetOwnerType, ownerId: undefined, ownerLabel: "公共资料" };
    const timestamp = new Date().toISOString();
    const asset: LoreCueAssetRecord = {
      id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind: draft.kind,
      title: draft.title.trim(),
      description: `${formatBytes(pendingFile.size)} · ${pendingFile.type || "未知格式"}`,
      ...ownerTarget,
      visibility: draft.visibility,
      spoilerNote: draft.spoilerNote.trim() || "未填写剧透说明。",
      provenance: draft.provenance.trim() || `本机导入 · ${pendingFile.name}`,
      importedAt: timestamp,
      updatedAt: timestamp,
      originalName: pendingFile.name,
      mimeType: pendingFile.type,
      sizeBytes: pendingFile.size,
      hasBinary: true,
      links: draft.linkToActive ? [{ ...activeTarget, linkedAt: timestamp }] : [],
    };
    setFeedback("正在把文件写入浏览器本地素材仓……");
    try {
      const nextAssets = await importAssetFile(assets, asset, pendingFile);
      setAssets(nextAssets);
      setSelectedId(asset.id);
      closeImport();
      setFeedback(`已导入“${asset.title}”；文件未上传网络，${draft.linkToActive ? `并已引用到“${activeTarget.targetLabel}”` : "尚未引用到任何项目"}。`);
    } catch {
      setFeedback("导入失败：浏览器可能禁用了本地文件仓，或可用空间不足。");
    }
  }

  function applyCurrentReference(nextLinked: boolean) {
    if (!selected) return;
    const nextAssets = setAssetTargetLink(assets, selected.id, activeTarget, nextLinked);
    setAssets(nextAssets);
    setPendingUnlinkAssetId(null);
    setFeedback(!nextLinked
      ? `已取消“${activeTarget.targetLabel}”的引用；原始资料和其他项目引用不受影响。`
      : `已把“${selected.title}”引用到“${activeTarget.targetLabel}”；它现在可以进入该范围的 AI 检索。`);
  }

  function toggleCurrentReference() {
    if (!selected) return;
    if (selectedLinked && targetType === "creative" && (selectedBindings.length > 0 || selectedDeliveries.length > 0)) {
      setPendingUnlinkAssetId(selected.id);
      setFeedback(`“${selected.title}”仍有 ${selectedBindings.length} 个工作台绑定和 ${selectedDeliveries.length} 条发放历史；请确认如何处理断链。`);
      return;
    }
    applyCurrentReference(!selectedLinked);
  }

  return (
    <main className="asset-library" id={hidden ? undefined : "main-content"} hidden={hidden}>
      <section className="library-masthead">
        <div>
          <span className="eyebrow">叙事资料库 · 本地素材仓</span>
          <h1>把素材放好，故事才找得到它。</h1>
          <p>地图、立绘、BGM 和文档保留原文件、项目归属、剧透边界与引用路径；可复用不等于自动共享。</p>
        </div>
        <button className="create-project-button" onClick={() => fileInputRef.current?.click()}>
          <span aria-hidden="true">＋</span>导入本机文件
        </button>
        <input
          ref={fileInputRef}
          className="sr-only"
          type="file"
          accept="image/*,audio/*,.pdf,.txt,.md,.doc,.docx"
          onChange={(event) => handleChooseFile(event.target.files?.[0])}
        />
      </section>

      <section className="asset-storage-notice">
        <strong>文件只保存在当前浏览器</strong>
        <span>元数据进入资料目录 v1；二进制文件进入 IndexedDB，不会上传网络，也不会塞进正文草稿。</span>
      </section>

      <section className="library-scope-bar" aria-label="当前引用范围">
        <div><span>检查引用范围</span><strong>{activeTarget.targetLabel}</strong><small>{linkedCount} 条资料已明确引用</small></div>
        <label>范围
          <select value={targetType} onChange={(event) => { setTargetType(event.target.value as "creative" | "campaign"); setPendingUnlinkAssetId(null); }}>
            <option value="creative">创作项目 · {currentProjectTitle}</option>
            <option value="campaign">团项目 · {currentCampaignTitle}</option>
          </select>
        </label>
      </section>

      <section className="library-metrics" aria-label="资料仓概况">
        <article><strong>{assets.length}</strong><span>资料条目</span></article>
        <article><strong>{assets.filter((asset) => asset.hasBinary).length}</strong><span>真实文件</span></article>
        <article><strong>{linkedCount}</strong><span>当前范围已引用</span></article>
        <article><strong>{assets.filter((asset) => asset.visibility === "主持人私有").length}</strong><span>主持人私有</span></article>
      </section>

      <section className="library-toolbar">
        <div className="library-filters">
          {(["全部", ...assetKinds] as const).map((kind) => (
            <button className={filter === kind ? "active" : ""} key={kind} onClick={() => setFilter(kind)} aria-pressed={filter === kind}>{kind}</button>
          ))}
        </div>
        <label className="campaign-search">
          <span className="sr-only">搜索资料</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索名称、来源或所属项目" />
        </label>
      </section>

      <div className="library-layout">
        <section className="asset-grid" aria-label="资料列表">
          {visibleAssets.map((asset) => {
            const linked = targetMatches(asset, activeTarget);
            return (
              <button className={`asset-card ${selected?.id === asset.id ? "active" : ""}`} key={asset.id} onClick={() => { setSelectedId(asset.id); setPendingUnlinkAssetId(null); }}>
                <span className="asset-kind-mark">{asset.kind.slice(0, 1)}</span>
                <span className="asset-card-copy"><small>{asset.kind} · {asset.ownerLabel}</small><strong>{asset.title}</strong><em>{asset.description}</em></span>
                <span className={`reference-state ${linked ? "linked" : ""}`}>{linked ? "已引用" : "未引用"}</span>
              </button>
            );
          })}
          {visibleAssets.length === 0 && <div className="creative-empty"><h3>没有找到资料</h3><p>换一个筛选条件，或导入新的本机文件。</p></div>}
        </section>

        {selected && <aside className="asset-detail">
          <div className={`asset-preview ${previewUrl ? "has-file" : ""}`} data-kind={selected.kind}>
            {previewUrl && selected.mimeType?.startsWith("image/")
              ? <div className="asset-image-preview" role="img" aria-label={`${selected.title}预览`} style={{ backgroundImage: `url(${previewUrl})` }} />
              : previewUrl && selected.mimeType?.startsWith("audio/")
                ? <audio controls preload="metadata" src={previewUrl}>当前浏览器无法播放该音频。</audio>
                : previewUrl
                  ? <a href={previewUrl} download={selected.originalName ?? selected.title}>打开或下载源文件</a>
                  : <span>{binaryState === "loading" ? "读取中" : binaryState === "missing" ? "源文件缺失" : `${selected.kind} · 演示条目`}</span>}
          </div>
          <div className="asset-detail-heading"><span className="eyebrow">资料详情</span><span data-visibility={selected.visibility}>{selected.visibility}</span></div>
          <h2>{selected.title}</h2>
          <p>{selected.description}</p>
          <dl>
            <div><dt>所属范围</dt><dd>{selected.ownerType} · {selected.ownerLabel}</dd></div>
            <div><dt>当前引用</dt><dd>{selectedLinked ? "已明确引用" : "尚未引用"}</dd></div>
            <div><dt>AI 检索</dt><dd>{selectedLinked ? "当前范围可用" : "当前范围不可用"}</dd></div>
            <div><dt>源文件</dt><dd>{selected.hasBinary ? (binaryState === "missing" ? "索引存在 / 文件缺失" : formatBytes(selected.sizeBytes)) : "仅演示元数据"}</dd></div>
          </dl>
          <section className="asset-boundary-card"><strong>剧透与披露</strong><p>{selected.spoilerNote}</p></section>
          <section className="asset-provenance-card"><strong>素材来源</strong><p>{selected.provenance}</p></section>
          <section className="asset-usage-card">
            <header><strong>使用位置</strong><span>{targetType === "creative" ? `${selectedBindings.length} 个当前绑定` : "团项目范围"}</span></header>
            {targetType === "creative" ? <>
              {selectedBindings.length > 0 ? <ul>{selectedBindings.map((binding) => <li key={binding.id}><b>{usageSurfaceLabels[binding.surface]}</b><span>{binding.surfaceId}</span></li>)}</ul> : <p>尚未被地图、遭遇或玩家资料绑定。</p>}
              {selectedDeliveries.length > 0 && <small>{selectedDeliveries.length} 条发放历史将永久保留，其中 {selectedDeliveries.filter((delivery) => delivery.status === "active").length} 条仍可查看。</small>}
            </> : <p>团项目引用的实际使用与披露记录将在场次档案中汇总。</p>}
          </section>
          {pendingUnlinkAssetId === selected.id && <section className="asset-unlink-warning" role="alert">
            <strong>取消引用会留下失效绑定</strong>
            <p>使用记录和历史发放不会被删除。对应工作台会标出断链，等待重新绑定或手动解除。</p>
            <div><button onClick={() => setPendingUnlinkAssetId(null)}>返回检查</button><button onClick={() => applyCurrentReference(false)}>保留记录并取消引用</button></div>
          </section>}
          <button className={selectedLinked ? "secondary-action" : "primary-action"} onClick={toggleCurrentReference}>
            {selectedLinked ? "取消当前范围引用" : "引用到当前范围"}
          </button>
          <p className="scope-principle">明确引用后才会进入 AI 检索范围；取消引用不会删除原始文件，也不会影响其他项目。</p>
        </aside>}
      </div>

      {pendingFile && <section className="asset-import-panel" aria-label="导入资料设置">
        <header><div><span className="eyebrow">导入本机文件</span><h2>先标清归属，再放进资料仓</h2></div><button onClick={closeImport} aria-label="关闭导入面板">×</button></header>
        <div className="asset-file-summary"><strong>{pendingFile.name}</strong><span>{formatBytes(pendingFile.size)} · {pendingFile.type || "未知格式"}</span><small>尚未写入浏览器素材仓</small></div>
        <div className="asset-import-form">
          <label>资料名称<input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>资料类型<select value={draft.kind} onChange={(event) => setDraft((current) => ({ ...current, kind: event.target.value as LoreCueAssetKind }))}>{assetKinds.map((kind) => <option key={kind}>{kind}</option>)}</select></label>
          <label>原始归属<select value={draft.owner} onChange={(event) => setDraft((current) => ({ ...current, owner: event.target.value as ImportDraft["owner"] }))}><option value="creative">创作项目 · {currentProjectTitle}</option><option value="campaign">团项目 · {currentCampaignTitle}</option><option value="public">公共资料</option></select></label>
          <label>可见范围<select value={draft.visibility} onChange={(event) => setDraft((current) => ({ ...current, visibility: event.target.value as LoreCueAssetVisibility }))}><option>主持人私有</option><option>玩家可见</option><option>按场次解锁</option></select></label>
          <label className="full-field">剧透与披露说明<textarea rows={3} value={draft.spoilerNote} onChange={(event) => setDraft((current) => ({ ...current, spoilerNote: event.target.value }))} placeholder="例如：第 3 次团后才可公开带标记版本" /></label>
          <label className="full-field">素材来源<input value={draft.provenance} onChange={(event) => setDraft((current) => ({ ...current, provenance: event.target.value }))} placeholder="作者、委托、授权网址或自制说明" /></label>
          <label className="asset-import-check"><input type="checkbox" checked={draft.linkToActive} onChange={(event) => setDraft((current) => ({ ...current, linkToActive: event.target.checked }))} />同时引用到当前范围“{activeTarget.targetLabel}”</label>
        </div>
        <footer><button onClick={closeImport}>取消</button><button className="primary-action" onClick={handleImport}>确认导入到本地素材仓</button></footer>
      </section>}

      <p className="campaign-feedback" aria-live="polite">{feedback}</p>
    </main>
  );
}
