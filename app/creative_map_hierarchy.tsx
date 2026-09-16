"use client";

import { useMemo, useState } from "react";
import type { CreativeProject } from "./creative_project_data";
import { removeAssetBinding, saveAssetBinding } from "./lorecue_asset_usage_store";
import type { LoreCueAssetRecord } from "./lorecue_asset_store";
import { useProjectAssetUsage } from "./use_project_asset_usage";
import { useProjectAssets } from "./use_project_assets";

type MapLevel = "世界" | "区域" | "城市" | "街区" | "建筑" | "楼层" | "房间";
type MapVisibility = "玩家可见" | "主持人可见" | "仅主持人可见";

interface MapNode {
  id: string;
  name: string;
  level: MapLevel;
  visibility: MapVisibility;
  description: string;
  pins: number;
  linkedScenes: string[];
  children?: MapNode[];
}

const mapTree: MapNode[] = [
  {
    id: "world",
    name: "潮汐世界",
    level: "世界",
    visibility: "玩家可见",
    description: "由潮汐与真名契约影响的沿海世界总图。",
    pins: 8,
    linkedScenes: ["世界观总览"],
    children: [{
      id: "north-coast",
      name: "北境海岸",
      level: "区域",
      visibility: "玩家可见",
      description: "寒流、港城与旧航线密集交汇的北方区域。",
      pins: 12,
      linkedScenes: ["北境航路"],
      children: [{
        id: "saffi",
        name: "萨菲港",
        level: "城市",
        visibility: "玩家可见",
        description: "围绕内港生长的旧城，也是模组调查的主要舞台。",
        pins: 16,
        linkedScenes: ["抵达萨菲港", "港区调查"],
        children: [
          {
            id: "dock-district",
            name: "码头区",
            level: "街区",
            visibility: "玩家可见",
            description: "装卸栈桥、仓库与港务机构组成的拥挤街区。",
            pins: 9,
            linkedScenes: ["斯诺森下班", "码头追逐"],
            children: [
              {
                id: "harbor-office",
                name: "港务处",
                level: "建筑",
                visibility: "玩家可见",
                description: "议会直属办公楼，保存近四十年的船舶档案。",
                pins: 5,
                linkedScenes: ["拜访伊芙琳"],
                children: [
                  {
                    id: "office-first",
                    name: "一层办公区",
                    level: "楼层",
                    visibility: "玩家可见",
                    description: "接待、值班与普通档案查询区域。",
                    pins: 4,
                    linkedScenes: ["初次问询"],
                    children: [{
                      id: "archive-room",
                      name: "档案室",
                      level: "房间",
                      visibility: "仅主持人可见",
                      description: "调查与潜入使用的房间 / 遭遇图，北墙藏有被替换的名册页。",
                      pins: 6,
                      linkedScenes: ["夜探档案室", "守卫遭遇"],
                    }],
                  },
                  {
                    id: "office-basement",
                    name: "地下封存层",
                    level: "楼层",
                    visibility: "仅主持人可见",
                    description: "未登记在玩家版建筑图中的封存层。",
                    pins: 3,
                    linkedScenes: ["发现旧印章"],
                  },
                ],
              },
              {
                id: "old-lighthouse",
                name: "旧灯塔",
                level: "建筑",
                visibility: "主持人可见",
                description: "退役灯塔，地下仍连接旧时代的引潮设施。",
                pins: 7,
                linkedScenes: ["守灯人引路", "地下层探索"],
              },
            ],
          },
          {
            id: "east-sheds",
            name: "东区工棚",
            level: "街区",
            visibility: "主持人可见",
            description: "码头工人的宿舍、食堂与临时货棚。",
            pins: 6,
            linkedScenes: ["跟踪斯诺森"],
          },
        ],
      }],
    }],
  },
];

interface FlatMapNode extends MapNode {
  depth: number;
  path: string[];
}

function flattenMaps(nodes: MapNode[], depth = 0, path: string[] = []): FlatMapNode[] {
  return nodes.flatMap((node) => {
    const currentPath = [...path, node.name];
    return [
      { ...node, depth, path: currentPath },
      ...flattenMaps(node.children ?? [], depth + 1, currentPath),
    ];
  });
}

interface CreativeMapHierarchyProps {
  project: CreativeProject;
  onFeedback: (message: string) => void;
}

export function CreativeMapHierarchy({ project, onFeedback }: CreativeMapHierarchyProps) {
  const flatMaps = useMemo(() => flattenMaps(mapTree), []);
  const [selectedId, setSelectedId] = useState("saffi");
  const [visibility, setVisibility] = useState<MapVisibility>("玩家可见");
  const linkedMaps = useProjectAssets(project.id, ["地图"]);
  const [usage, setUsage] = useProjectAssetUsage(project.id);
  const selected = flatMaps.find((node) => node.id === selectedId) ?? flatMaps[0];
  const currentBinding = usage?.bindings.find((binding) => binding.surface === "map-node" && binding.surfaceId === selected.id);
  const boundMap = currentBinding ? linkedMaps.find((asset) => asset.id === currentBinding.assetId) : undefined;
  const bindingIsStale = Boolean(currentBinding && !boundMap);

  function selectMap(node: FlatMapNode) {
    setSelectedId(node.id);
    setVisibility(node.visibility);
  }

  function bindMapAsset(asset: LoreCueAssetRecord) {
    const next = saveAssetBinding(project.id, {
      surface: "map-node",
      surfaceId: selected.id,
      assetId: asset.id,
      assetTitle: asset.title,
      visibility: asset.visibility,
    });
    setUsage(next);
    onFeedback(`已把资料仓地图“${asset.title}”绑定到“${selected.name}”；底图文件仍保持独立。`);
  }

  function clearMapAsset() {
    const next = removeAssetBinding(project.id, "map-node", selected.id);
    setUsage(next);
    onFeedback(`已解除“${selected.name}”的底图绑定；资料仓原文件和历史发放不受影响。`);
  }

  return (
    <section className="map-hierarchy-workbench studio-board">
      <div className="studio-page-heading">
        <div>
          <span className="eyebrow">设定资料 · 分级地图</span>
          <h2>从世界一直走进一个房间</h2>
          <p>地图不是散落的图片；每张图都有父级、可见范围、锚点与关联场景。</p>
        </div>
        <button onClick={() => onFeedback("已模拟在当前层级下建立一张子地图。")}>＋ 新建子地图</button>
      </div>

      <div className="map-level-guide" aria-label="地图层级说明">
        {(["世界", "区域", "城市", "街区", "建筑", "楼层", "房间"] as MapLevel[]).map((level, index) => (
          <span key={level}><b>{index + 1}</b>{level}{level === "房间" && <small> / 遭遇图</small>}</span>
        ))}
      </div>

      <section className={`workbench-asset-strip ${bindingIsStale ? "has-stale-binding" : ""}`} aria-label="当前项目已引用地图">
        <div><strong>资料仓地图</strong><span>{linkedMaps.length} 条明确引用 · 当前节点：{bindingIsStale ? `失效引用 · ${currentBinding?.assetTitle}` : currentBinding?.assetTitle ?? "尚未绑定底图"}</span>{currentBinding && <button className="asset-clear-binding" onClick={clearMapAsset}>解除绑定</button>}</div>
        <div>{linkedMaps.length > 0 ? linkedMaps.map((asset) => <button key={asset.id} className={currentBinding?.assetId === asset.id ? "active" : ""} onClick={() => bindMapAsset(asset)}>{asset.title}<small>{asset.visibility} · {asset.hasBinary ? "本地源文件" : "演示元数据"}</small></button>) : <p>当前项目尚未引用地图；请先到资料库建立引用。</p>}</div>
      </section>

      <div className="map-hierarchy-layout">
        <aside className="map-tree-panel">
          <header><strong>地图目录</strong><small>{flatMaps.length} 张</small></header>
          <nav aria-label="分级地图目录">
            {flatMaps.map((node) => (
              <button
                key={node.id}
                className={selected.id === node.id ? "active" : ""}
                style={{ paddingInlineStart: `${10 + node.depth * 15}px` }}
                onClick={() => selectMap(node)}
              >
                <i>{node.children?.length ? "−" : "·"}</i>
                <span><strong>{node.name}</strong><small>{node.level}</small></span>
                <b className={`map-visibility-dot ${node.visibility === "玩家可见" ? "public" : node.visibility === "仅主持人可见" ? "secret" : "gm"}`} aria-label={node.visibility} />
              </button>
            ))}
          </nav>
        </aside>

        <article className="map-preview-panel">
          <header>
            <div><span>{selected.level}</span><h3>{selected.name}</h3></div>
            <button onClick={() => onFeedback(linkedMaps.length > 0 ? "请从上方资料仓地图中选择底图；选择后会保存稳定素材 ID。" : "当前项目没有可用地图，请先到资料库建立引用。")}>替换底图</button>
          </header>
          <div className="map-breadcrumb">{selected.path.map((name, index) => <span key={name}>{index > 0 && " / "}{name}</span>)}</div>
          <div className="illustrated-map" role="img" aria-label={`${selected.name}地图预览`}>
            <svg viewBox="0 0 640 390" aria-hidden="true">
              <path className="coast" d="M0 58 C95 20 115 88 196 68 C283 47 297 128 386 102 C488 71 526 120 640 77 L640 0 L0 0 Z" />
              <path className="road" d="M32 315 C156 274 171 180 303 197 S480 309 610 216" />
              <path className="road secondary" d="M115 355 C187 267 303 292 381 170 S520 102 608 133" />
              <rect x="75" y="132" width="115" height="76" rx="8" />
              <rect x="248" y="238" width="132" height="84" rx="8" />
              <rect x="434" y="142" width="122" height="92" rx="8" />
            </svg>
            <button className="map-pin pin-one" aria-label="港务处锚点"><span>01</span><b>港务处</b></button>
            <button className="map-pin pin-two" aria-label="旧灯塔锚点"><span>02</span><b>旧灯塔</b></button>
            <button className="map-pin pin-three" aria-label="码头锚点"><span>03</span><b>卸货码头</b></button>
            <div className="map-scale">200 尺</div>
          </div>
          <footer><span>{selected.pins} 个锚点</span><span>{selected.children?.length ?? 0} 张子地图</span><span>{selected.linkedScenes.length} 个关联场景</span></footer>
        </article>

        <aside className="map-detail-panel">
          <section>
            <span className="eyebrow">地图信息</span>
            <label>地图名称<input value={selected.name} readOnly /></label>
            <label>地图层级<input value={selected.level} readOnly /></label>
            <label>可见范围
              <select value={visibility} onChange={(event) => setVisibility(event.target.value as MapVisibility)}>
                <option>玩家可见</option>
                <option>主持人可见</option>
                <option>仅主持人可见</option>
              </select>
            </label>
            <p className={`map-visibility-note ${visibility === "仅主持人可见" ? "secret" : ""}`}>
              <strong>{visibility}</strong>
              {visibility === "玩家可见" ? "可用于玩家手册与公开地图。" : "不会自动进入玩家视角检索。"}
            </p>
          </section>
          <section>
            <span className="eyebrow">说明</span>
            <p>{selected.description}</p>
          </section>
          <section>
            <span className="eyebrow">底图来源</span>
            <p>{bindingIsStale ? `${currentBinding?.assetTitle} · ${currentBinding?.assetId} · 当前项目已取消引用，请重新绑定或解除。` : currentBinding ? `${currentBinding.assetTitle} · ${currentBinding.assetId} · ${currentBinding.visibility}` : "尚未绑定资料仓地图；当前显示结构化示意图。"}</p>
          </section>
          <section>
            <span className="eyebrow">关联场景 / 遭遇</span>
            <div className="linked-scene-list">{selected.linkedScenes.map((scene) => <button key={scene}>{scene}<span>打开</span></button>)}</div>
          </section>
          <button className="map-save-button" onClick={() => onFeedback(`已模拟保存“${selected.name}”的地图信息与可见范围。`)}>保存地图设置</button>
          <small className="map-system-note">当前项目：{project.title} · {project.rulesSystem ?? project.kind}</small>
        </aside>
      </div>
    </section>
  );
}
