"use client";

import { useEffect, useMemo, useState } from "react";
import {
  initialCampaignProjects,
  projectStructure,
  type CampaignProject,
  type GameSystem,
} from "./campaign_project_data";
import { ensureCampaignCatalog, saveCampaignCatalog } from "./lorecue_campaign_store";

interface CampaignProjectDashboardProps {
  hidden: boolean;
  currentPendingReviews: number;
  onOpenCurrentProject: () => void;
}

type ProjectFilter = "全部" | GameSystem;

const projectFilters: ProjectFilter[] = [
  "全部",
  "D&D 5e",
  "CoC 7e",
  "CoJ",
  "无限",
  "系统无关",
  "自定义",
];

function systemClass(system: GameSystem) {
  if (system === "D&D 5e") return "dnd";
  if (system === "CoC 7e") return "coc";
  if (system === "CoJ") return "coj";
  if (system === "无限") return "infinite";
  return "other";
}

export function CampaignProjectDashboard({
  hidden,
  currentPendingReviews,
  onOpenCurrentProject,
}: CampaignProjectDashboardProps) {
  const [projects, setProjects] = useState(initialCampaignProjects);
  const [filter, setFilter] = useState<ProjectFilter>("全部");
  const [query, setQuery] = useState("");
  const [previewProjectId, setPreviewProjectId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [draftSystem, setDraftSystem] = useState<GameSystem>("D&D 5e");
  const [draftTemplate, setDraftTemplate] = useState("");
  const [draftRunName, setDraftRunName] = useState("");
  const [feedback, setFeedback] = useState(
    "正在读取团项目目录……",
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const restored = ensureCampaignCatalog(initialCampaignProjects);
      setProjects(restored);
      setFeedback(`团项目目录 v1 已就绪 · ${restored.length} 个独立团项目。`);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const displayProjects = useMemo(() => projects.map((project) => project.id === "saffi-old-friends"
    ? { ...project, pendingReviews: currentPendingReviews }
    : project), [currentPendingReviews, projects]);

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
    return displayProjects.filter((project) => {
      const matchesFilter = filter === "全部" || project.system === filter;
      const searchable = `${project.name} ${project.templateTitle} ${project.system}`.toLocaleLowerCase(
        "zh-CN",
      );
      return matchesFilter && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [displayProjects, filter, query]);

  const previewProject = displayProjects.find((project) => project.id === previewProjectId) ?? null;
  const pendingReviewCount = displayProjects.reduce(
    (total, project) => total + project.pendingReviews,
    0,
  );
  const systemCount = new Set(displayProjects.map((project) => project.system)).size;

  function handleCreateProject() {
    const templateTitle = draftTemplate.trim();
    const runName = draftRunName.trim();
    if (!templateTitle || !runName) {
      setFeedback("请先填写剧本模板名称和这次团的区分名称。");
      return;
    }

    const newProject: CampaignProject = {
      id: `draft-${Date.now()}`,
      name: `${templateTitle} · ${runName}`,
      runName,
      templateTitle,
      system: draftSystem,
      status: "准备中",
      summary: "新建的团项目草稿，角色、资料和场次都将拥有独立空间。",
      playerCount: 0,
      sessionCount: 0,
      lastSession: "尚未开团",
      nextSession: "待安排",
      pendingReviews: 0,
      currentStage: "团前准备 · 尚未填写",
    };
    setProjects((current) => {
      const nextProjects = [newProject, ...current];
      saveCampaignCatalog(nextProjects);
      return nextProjects;
    });
    setPreviewProjectId(newProject.id);
    setShowCreateForm(false);
    setDraftTemplate("");
    setDraftRunName("");
    setFeedback(`已新建“${newProject.name}”并写入团项目目录 v1。`);
  }

  function handlePreviewProject(project: CampaignProject) {
    setPreviewProjectId(project.id);
    setFeedback(`正在查看“${project.name}”的独立项目概况。`);
  }

  return (
    <main className="campaign-dashboard" id={hidden ? undefined : "main-content"} hidden={hidden}>
      <section className="campaign-hero">
        <div>
          <span className="eyebrow">LoreCue 工作台</span>
          <h1>我的团</h1>
          <p>先选择哪一条跑团历史，再进入咨询、资料和场次。相同剧本也不会互相串线。</p>
        </div>
        <button className="create-project-button" onClick={() => setShowCreateForm(true)}>
          <span aria-hidden="true">＋</span>
          新建团项目
        </button>
      </section>

      <section className="campaign-summary" aria-label="团项目概况">
            <div><strong>{displayProjects.length}</strong><span>个团项目</span></div>
        <div><strong>{systemCount}</strong><span>种规则系统</span></div>
        <div><strong>{pendingReviewCount}</strong><span>条口胡待复盘</span></div>
        <div><strong>2</strong><span>个近期安排</span></div>
      </section>

      {showCreateForm && (
        <section className="project-create-panel" aria-label="新建团项目">
          <div>
            <span className="eyebrow">建立独立历史</span>
            <h2>新建团项目</h2>
            <p>“剧本模板”可以重复使用，“团项目名称”用于区分不同玩家和不同跑法。</p>
          </div>
          <label>
            规则系统
            <select
              value={draftSystem}
              onChange={(event) => setDraftSystem(event.target.value as GameSystem)}
            >
              <option>D&amp;D 5e</option>
              <option>CoC 7e</option>
              <option>CoJ</option>
              <option>无限</option>
              <option>系统无关</option>
              <option>自定义</option>
            </select>
          </label>
          <label>
            剧本模板
            <input
              value={draftTemplate}
              onChange={(event) => setDraftTemplate(event.target.value)}
              placeholder="例如：萨菲港旧案"
            />
          </label>
          <label>
            团项目区分名称
            <input
              value={draftRunName}
              onChange={(event) => setDraftRunName(event.target.value)}
              placeholder="例如：周末新手组"
            />
          </label>
          <div className="project-create-actions">
            <button onClick={() => setShowCreateForm(false)}>取消</button>
            <button className="primary-action" onClick={handleCreateProject}>建立项目草稿</button>
          </div>
        </section>
      )}

      <section className="campaign-toolbar">
        <div className="project-filters" aria-label="按规则系统筛选">
          {projectFilters.map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
            >
              {item}
              <span>
                {item === "全部"
                  ? displayProjects.length
                  : displayProjects.filter((project) => project.system === item).length}
              </span>
            </button>
          ))}
        </div>
        <label className="campaign-search">
          <span className="sr-only">搜索团项目</span>
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索剧本、团名或规则"
          />
        </label>
      </section>

      <div className="campaign-layout">
        <section className="campaign-project-grid" aria-label="团项目列表">
          {visibleProjects.length === 0 ? (
            <div className="campaign-empty">
              <h2>没有找到对应的团</h2>
              <p>换一个规则筛选，或者清空搜索内容。</p>
            </div>
          ) : (
            visibleProjects.map((project) => (
              <article
                className={`campaign-project-card system-${systemClass(project.system)}`}
                key={project.id}
              >
                <div className="project-card-topline">
                  <span className="system-label">{project.system}</span>
                  <span className="project-status" data-status={project.status}>{project.status}</span>
                </div>
                <div className="project-card-title">
                  <small>团项目</small>
                  <h2>{project.name}</h2>
                  <p>{project.summary}</p>
                </div>
                <dl className="project-card-identity">
                  <div><dt>剧本模板</dt><dd>{project.templateTitle}</dd></div>
                  <div><dt>本次跑团</dt><dd>{project.runName}</dd></div>
                </dl>
                <div className="project-card-stats">
                  <span>{project.playerCount} 位玩家</span>
                  <span>{project.sessionCount} 次团</span>
                  <span>{project.pendingReviews} 条待复盘</span>
                </div>
                <div className="project-card-progress">
                  <span>当前进度</span>
                  <strong>{project.currentStage}</strong>
                  <small>最近：{project.lastSession}</small>
                </div>
                <div className="project-card-actions">
                  <button onClick={() => handlePreviewProject(project)}>查看概况</button>
                  {project.id === "saffi-old-friends" && (
                    <button className="primary-action" onClick={onOpenCurrentProject}>
                      进入当前团
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </section>

        <aside className="campaign-side-column">
          <section className="project-structure-card">
            <span className="eyebrow">信息层级</span>
            <h2>不会串团的四层结构</h2>
            <div>
              {projectStructure.map((item, index) => (
                <article key={item.level}>
                  <span>0{index + 1}</span>
                  <div>
                    <strong>{item.level}</strong>
                    <small>{item.example}</small>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="campaign-library-card">
            <span className="eyebrow">公共资料层</span>
            <h2>可复用，但不会自动混入</h2>
            <dl>
              <div><dt>规则资料</dt><dd>3 套</dd></div>
              <div><dt>剧本模板</dt><dd>3 份</dd></div>
              <div><dt>通用 BGM</dt><dd>12 组</dd></div>
            </dl>
            <p>公共资料必须被团项目明确引用后，AI 才能在该团中检索。</p>
          </section>
        </aside>
      </div>

      {previewProject && (
        <section className="project-preview-panel" aria-label="团项目概况">
          <div className={`preview-project-mark system-${systemClass(previewProject.system)}`}>
            <span>{previewProject.system}</span>
          </div>
          <div>
            <span className="eyebrow">独立项目概况</span>
            <h2>{previewProject.name}</h2>
            <p>{previewProject.summary}</p>
          </div>
          <dl>
            <div><dt>剧本模板</dt><dd>{previewProject.templateTitle}</dd></div>
            <div><dt>下一次</dt><dd>{previewProject.nextSession}</dd></div>
            <div><dt>检索边界</dt><dd>仅本团项目</dd></div>
          </dl>
          <button onClick={() => setPreviewProjectId(null)}>关闭概况</button>
        </section>
      )}

      <p className="campaign-feedback" aria-live="polite">{feedback}</p>
    </main>
  );
}
