"use client";

import { useMemo, useState } from "react";
import {
  documentTreeByKind,
  type CreativeProject,
  type CreativeStudioView,
} from "./creative_project_data";
import { CreativeProjectNavigation } from "./creative_project_navigation";
import { CreativeNarrativeView } from "./creative_narrative_views";

const outlineCards = [
  { index: "01", title: "无潮之夜", purpose: "建立城市规则与来信", status: "已完成" },
  { index: "02", title: "港务处", purpose: "名册缺页，嫌疑人浮出", status: "写作中" },
  { index: "03", title: "旧灯塔", purpose: "揭露海曼的第一次谎言", status: "待写" },
  { index: "04", title: "灰潮号", purpose: "两条时间线在船上汇合", status: "待写" },
];

const timelineEvents = [
  { time: "二十年前", title: "灰潮号失踪", layer: "故事时间", note: "海曼是最后登记在册的人。" },
  { time: "三日前", title: "缺页名册出现", layer: "故事时间", note: "由匿名包裹送到港务处。" },
  { time: "第一章", title: "读者首次看到斯诺森", layer: "叙述顺序", note: "此时不揭示他的工种。" },
  { time: "第二章", title: "伊芙琳交出名册", layer: "叙述顺序", note: "与真实发生顺序错位。" },
];

const versionItems = [
  { id: "v18", label: "自动快照 18", time: "今天 14:32", note: "正文增加 284 字", current: true },
  { id: "v17", label: "港务处对白调整", time: "今天 13:06", note: "手动保存 · 可恢复", current: false },
  { id: "v16", label: "一致性检查前", time: "昨天 22:18", note: "AI 未修改正文", current: false },
  { id: "v15", label: "第二章初稿", time: "7 月 27 日", note: "手动保存 · 可恢复", current: false },
];

interface CreativeProjectStudioProps {
  project: CreativeProject;
  onBack: () => void;
  onAskAi: (prompt: string, scope: string) => void;
}

export function CreativeProjectStudio({
  project,
  onBack,
  onAskAi,
}: CreativeProjectStudioProps) {
  const documentTree = documentTreeByKind[project.kind];
  const [activeView, setActiveView] = useState<CreativeStudioView>("项目总览");
  const [activeDocument, setActiveDocument] = useState(documentTree[0].items[0]);
  const [draft, setDraft] = useState(
    "雨停以后，萨菲港的雾反而更重了。\n\n伊芙琳把那册发霉的值班记录推过桌面。名册上有一行被墨水反复涂抹，但纸张背面的压痕仍然留下了一个姓氏：斯诺森。\n\n“港务处从不删除名字，”她说，“除非那个人从来没有来过。”",
  );
  const [feedback, setFeedback] = useState("当前为前端演示，修改只保留在本页状态中。");
  const [showMaterials, setShowMaterials] = useState(false);
  const [snapshotCount, setSnapshotCount] = useState(18);
  const wordCount = useMemo(() => draft.replace(/\s/g, "").length, [draft]);

  function handleSaveDraft() {
    setFeedback(`已模拟保存“${activeDocument}” · ${wordCount} 字。`);
  }

  function handleCreateSnapshot() {
    setSnapshotCount((count) => count + 1);
    setFeedback(`已建立手动快照 ${snapshotCount + 1}，不会覆盖旧版本。`);
  }

  function handleInsertMaterial(material: string) {
    setDraft((current) => `${current}\n\n[引用素材：${material}]`);
    setShowMaterials(false);
    setFeedback(`已把“${material}”作为引用标记插入正文；原始素材仍保留在资料库。`);
  }

  function renderStudioContent() {
    if (activeView === "大纲") {
      return (
        <section className="studio-board">
          <div className="studio-page-heading">
            <div><span className="eyebrow">结构视图</span><h2>故事大纲</h2><p>拖动将在真实版本中改变叙述顺序，不改变故事内时间。</p></div>
            <button onClick={() => setFeedback("已模拟添加一个空白章节卡。")}>＋ 新建章节</button>
          </div>
          <div className="outline-board">
            {outlineCards.map((card) => (
              <article key={card.index}>
                <div><span>{card.index}</span><small>{card.status}</small></div>
                <h3>{card.title}</h3>
                <p>{card.purpose}</p>
                <footer><span>伊芙琳</span><span>名册</span><button aria-label={`打开${card.title}`}>···</button></footer>
              </article>
            ))}
          </div>
          <section className="story-thread-panel">
            <span className="eyebrow">线索与人物弧</span>
            <div><strong>名册真相</strong><span className="thread-line"><i /><i /><i /><i /></span><small>4 个触点</small></div>
            <div><strong>伊芙琳的信任</strong><span className="thread-line secondary"><i /><i /><i /></span><small>3 个触点</small></div>
          </section>
        </section>
      );
    }

    if (activeView === "时间线") {
      return (
        <section className="studio-board">
          <div className="studio-page-heading">
            <div><span className="eyebrow">双层时间线</span><h2>发生顺序与讲述顺序</h2><p>避免倒叙、多线叙事与跑团真相时间互相打架。</p></div>
            <button onClick={() => setFeedback("已模拟添加时间节点。")}>＋ 添加事件</button>
          </div>
          <div className="story-timeline">
            {timelineEvents.map((event, index) => (
              <article key={`${event.time}-${event.title}`}>
                <time>{event.time}</time><span className={`timeline-marker layer-${index > 1 ? "telling" : "story"}`} />
                <div><small>{event.layer}</small><h3>{event.title}</h3><p>{event.note}</p></div>
              </article>
            ))}
          </div>
          <div className="timeline-legend"><span><i className="story" />故事时间</span><span><i className="telling" />叙述顺序</span></div>
        </section>
      );
    }

    if (activeView === "版本") {
      return (
        <section className="studio-board">
          <div className="studio-page-heading">
            <div><span className="eyebrow">版本与快照</span><h2>每次大改，都留一条回去的路。</h2><p>AI 建议、人工编辑和正式定稿分别记录，不会自动覆盖当前正文。</p></div>
            <button className="primary-action" onClick={handleCreateSnapshot}>建立手动快照</button>
          </div>
          <div className="version-layout">
            <div className="version-list">
              {versionItems.map((version, index) => (
                <button className={index === 0 ? "active" : ""} key={version.id}>
                  <span>{index === 0 ? `v${snapshotCount}` : version.id}</span>
                  <strong>{version.label}</strong><small>{version.time} · {version.note}</small>
                </button>
              ))}
            </div>
            <section className="version-compare">
              <span className="eyebrow">版本比较</span>
              <h3>当前版本与“港务处对白调整”</h3>
              <div className="diff-block"><del>港务处从来不会删掉名字。</del><ins>港务处从不删除名字，除非那个人从来没有来过。</ins></div>
              <p>恢复旧版本会先自动建立当前快照；这个按钮目前只演示流程。</p>
              <button onClick={() => setFeedback("已模拟恢复前保护：先建立当前快照，再进入确认步骤。")}>准备恢复此版本</button>
            </section>
          </div>
        </section>
      );
    }

    if (activeView !== "正文") {
      return (
        <CreativeNarrativeView
          project={project}
          view={activeView}
          onFeedback={setFeedback}
        />
      );
    }

    return (
      <section className="writing-canvas">
        <header>
          <div><span className="eyebrow">当前文档</span><h2>{activeDocument}</h2></div>
          <div className="writing-actions">
            <span>{wordCount} 字</span>
            <div className="material-insert-wrap">
              <button onClick={() => setShowMaterials((current) => !current)} aria-expanded={showMaterials}>插入素材</button>
              {showMaterials && (
                <div className="material-insert-menu">
                  <strong>当前项目已引用</strong>
                  {["伊芙琳 · 立绘", "萨菲港 · 码头地图", "码头 · 暗潮 BGM"].map((material) => (
                    <button key={material} onClick={() => handleInsertMaterial(material)}>{material}</button>
                  ))}
                  <small>这里只插入引用，不复制原文件。</small>
                </div>
              )}
            </div>
            <button onClick={() => onAskAi(`帮我检查“${activeDocument}”的连续性`, project.title)}>询问 AI</button>
            <button className="primary-action" onClick={handleSaveDraft}>保存草稿</button>
          </div>
        </header>
        <label className="editor-title">
          <span className="sr-only">文档标题</span>
          <input value={activeDocument} onChange={(event) => setActiveDocument(event.target.value)} />
        </label>
        <label className="editor-body">
          <span className="sr-only">正文内容</span>
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} />
        </label>
      </section>
    );
  }

  return (
    <main className="creative-studio">
      <aside className="document-rail">
        <button className="text-back-button" onClick={onBack}>← 返回创作项目</button>
        <span className="eyebrow">{project.kind}</span>
        <h1>{project.title}</h1>
        <CreativeProjectNavigation
          activeView={activeView}
          projectKind={project.kind}
          onViewChange={setActiveView}
        />
        <div className="document-tree" hidden={activeView !== "正文"}>
          {documentTree.map((group) => (
            <section key={group.group}>
              <div><strong>{group.group}</strong><button aria-label={`在${group.group}中新建`}>＋</button></div>
              {group.items.map((item) => (
                <button
                  className={activeDocument === item ? "active" : ""}
                  key={item}
                  onClick={() => {
                    setActiveDocument(item);
                    setActiveView("正文");
                  }}
                >
                  {item}
                </button>
              ))}
            </section>
          ))}
        </div>
      </aside>

      <div className="studio-main">
        <header className="studio-context-bar">
          <div><span>{project.kind}</span><strong>{activeView}</strong></div>
          <small>{project.progress} · {project.warningCount} 条待处理提醒</small>
        </header>
        {renderStudioContent()}
        <p className="writing-feedback" aria-live="polite">{feedback}</p>
      </div>

      <aside className="writing-inspector">
        <div className="inspector-tabs"><button className="active">检查</button><button>引用</button><button>备注</button></div>
        <section className="inspector-summary">
          <span className="eyebrow">本项目提醒</span>
          <h2>2 个值得确认的地方</h2>
          <p>只做提示，不会把 AI 判断当成设定。</p>
        </section>
        <article className="continuity-issue high">
          <span>时间冲突</span><h3>港务处的关门时间</h3>
          <p>正文写作“雨停以后”，但地点卡注明值班记录只能在 18:00 前查阅。</p>
          <button onClick={() => onAskAi("比较港务处营业时间的两处设定", project.title)}>展开依据</button>
        </article>
        <article className="continuity-issue">
          <span>疑似重复</span><h3>“从来没有来过”</h3>
          <p>与序章结尾的关键句结构相似，可能是回声，也可能是不必要的重复。</p>
          <button onClick={() => setFeedback("已将疑似重复标为有意呼应。")}>标为有意呼应</button>
        </article>
        <section className="conversion-note">
          <span className="eyebrow">内容去向</span><strong>{project.kind === "跑团模组" ? "模组不是团历史" : "创作项目彼此独立"}</strong>
          <p>{project.kind === "跑团模组" ? "完成模组后可建立多个团项目；口胡只进入对应团与场次。" : "跨项目资料必须明确引用，AI 不会自行混入其他故事。"}</p>
        </section>
      </aside>
    </main>
  );
}
