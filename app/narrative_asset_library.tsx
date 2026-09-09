"use client";

import { useMemo, useState } from "react";

type AssetKind = "人物" | "地点" | "地图" | "立绘" | "BGM" | "规则" | "文档";

const assets: Array<{
  id: string;
  kind: AssetKind;
  title: string;
  detail: string;
  scope: string;
  referenced: boolean;
}> = [
  { id: "portrait-evelyn", kind: "立绘", title: "伊芙琳 · 港务官", detail: "半身立绘 · 2400 × 3200", scope: "萨菲港旧案", referenced: true },
  { id: "map-port", kind: "地图", title: "萨菲港 · 码头区", detail: "区域地图 · 12 个标记点", scope: "萨菲港旧案", referenced: true },
  { id: "bgm-undertow", kind: "BGM", title: "码头 · 暗潮", detail: "03:42 · 低沉弦乐 / 雾笛", scope: "公共资料", referenced: true },
  { id: "person-snowson", kind: "人物", title: "斯诺森", detail: "装卸工 · 5 条关系 · 3 条秘密", scope: "萨菲港旧案", referenced: true },
  { id: "place-lighthouse", kind: "地点", title: "旧灯塔", detail: "地点卡 · 4 个场景入口", scope: "北境纪事", referenced: false },
  { id: "rule-chase", kind: "规则", title: "港区追逐检定", detail: "自定义规则 · 第 2 版", scope: "公共资料", referenced: false },
  { id: "doc-manifest", kind: "文档", title: "灰潮号船员名册", detail: "PDF 摘录 · 8 页", scope: "萨菲港旧案", referenced: true },
];

export function NarrativeAssetLibrary({ hidden }: { hidden: boolean }) {
  const [filter, setFilter] = useState<"全部" | AssetKind>("全部");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(assets[0].id);
  const [feedback, setFeedback] = useState("公共资料只有被项目明确引用后才会进入 AI 检索范围。");

  const visibleAssets = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    return assets.filter((asset) =>
      (filter === "全部" || asset.kind === filter)
      && (!normalized || `${asset.title} ${asset.detail} ${asset.scope}`.toLocaleLowerCase("zh-CN").includes(normalized)),
    );
  }, [filter, query]);
  const selected = assets.find((asset) => asset.id === selectedId) ?? assets[0];

  return (
    <main className="asset-library" id={hidden ? undefined : "main-content"} hidden={hidden}>
      <section className="library-masthead">
        <div>
          <span className="eyebrow">叙事资料库</span>
          <h1>把素材放好，故事才找得到它。</h1>
          <p>文字设定、人物立绘、地图与 BGM 使用同一套项目归属；可复用不等于自动共享。</p>
        </div>
        <button className="create-project-button" onClick={() => setFeedback("导入面板将在下一阶段接入真实文件。")}>
          <span aria-hidden="true">＋</span>导入资料
        </button>
      </section>
      <section className="library-toolbar">
        <div className="library-filters">
          {(["全部", "人物", "地点", "地图", "立绘", "BGM", "规则", "文档"] as const).map((kind) => (
            <button
              className={filter === kind ? "active" : ""}
              key={kind}
              onClick={() => setFilter(kind)}
              aria-pressed={filter === kind}
            >
              {kind}
            </button>
          ))}
        </div>
        <label className="campaign-search">
          <span className="sr-only">搜索资料</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索名称、描述或所属项目" />
        </label>
      </section>
      <div className="library-layout">
        <section className="asset-grid" aria-label="资料列表">
          {visibleAssets.map((asset) => (
            <button
              className={`asset-card ${selected.id === asset.id ? "active" : ""}`}
              key={asset.id}
              onClick={() => setSelectedId(asset.id)}
            >
              <span className="asset-kind-mark">{asset.kind.slice(0, 1)}</span>
              <span className="asset-card-copy"><small>{asset.kind} · {asset.scope}</small><strong>{asset.title}</strong><em>{asset.detail}</em></span>
              <span className={`reference-state ${asset.referenced ? "linked" : ""}`}>{asset.referenced ? "已引用" : "未引用"}</span>
            </button>
          ))}
        </section>
        <aside className="asset-detail">
          <div className="asset-preview" data-kind={selected.kind}><span>{selected.kind}</span></div>
          <span className="eyebrow">资料详情</span>
          <h2>{selected.title}</h2>
          <p>{selected.detail}</p>
          <dl>
            <div><dt>所属范围</dt><dd>{selected.scope}</dd></div>
            <div><dt>AI 检索</dt><dd>{selected.referenced ? "当前项目可用" : "当前项目不可用"}</dd></div>
            <div><dt>溯源状态</dt><dd>原始资料</dd></div>
          </dl>
          <button
            className={selected.referenced ? "secondary-action" : "primary-action"}
            onClick={() => setFeedback(selected.referenced ? "已打开引用关系清单。" : "这是演示资料；已模拟建立项目引用。")}
          >
            {selected.referenced ? "查看引用位置" : "引用到当前项目"}
          </button>
          <p className="scope-principle">明确引用后才会进入 AI 检索范围；删除引用不会删除原始资料。</p>
        </aside>
      </div>
      <p className="campaign-feedback" aria-live="polite">{feedback}</p>
    </main>
  );
}
