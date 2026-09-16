"use client";

import { useMemo, useState } from "react";
import { CreativeProjectCreationDialog } from "./creative_project_creation_dialog";
import {
  initialCreativeProjects,
  projectBlueprints,
  type CreativeProject,
} from "./creative_project_data";
import { CreativeProjectStudio } from "./creative_project_studio";

interface CreativeWritingWorkspaceProps {
  hidden: boolean;
  onAskAi: (prompt: string, scope: string, projectId: string) => void;
  onProjectFocus: (project: CreativeProject | null) => void;
}

export function CreativeWritingWorkspace({
  hidden,
  onAskAi,
  onProjectFocus,
}: CreativeWritingWorkspaceProps) {
  const [projects, setProjects] = useState(initialCreativeProjects);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [creationOpen, setCreationOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState("项目状态只保存在当前浏览器演示中，尚未接入真实文件。");

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null;
  const visibleProjects = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    if (!normalized) return projects;
    return projects.filter((project) =>
      `${project.title} ${project.kind} ${project.summary}`.toLocaleLowerCase("zh-CN").includes(normalized),
    );
  }, [projects, query]);

  function handleCreateProject(project: CreativeProject) {
    setProjects((current) => [project, ...current]);
    setCreationOpen(false);
    setActiveProjectId(project.id);
    onProjectFocus(project);
    setFeedback(`已在当前演示中建立“${project.title}”。`);
  }

  if (activeProject) {
    return (
      <div id={hidden ? undefined : "main-content"} hidden={hidden}>
        <CreativeProjectStudio
          key={activeProject.id}
          project={activeProject}
          onBack={() => {
            setActiveProjectId(null);
            onProjectFocus(null);
          }}
          onAskAi={onAskAi}
        />
      </div>
    );
  }

  return (
    <main className="creative-home" id={hidden ? undefined : "main-content"} hidden={hidden}>
      <section className="creative-hero">
        <div>
          <span className="eyebrow">创作工作台</span>
          <h1>所有故事，先有一个安静的房间。</h1>
          <p>小说、影视剧本、跑团模组和世界观各自成册；正文、大纲、设定、时间线与版本记录在项目里互相引用，但不会擅自互相覆盖。</p>
        </div>
        <button className="create-project-button" onClick={() => setCreationOpen(true)}>
          <span aria-hidden="true">＋</span>新建创作项目
        </button>
      </section>

      <section className="creative-kind-strip" aria-label="支持的创作类型">
        {projectBlueprints.map((blueprint, index) => (
          <article key={blueprint.kind}>
            <span>0{index + 1}</span>
            <strong>{blueprint.kind}</strong>
            <small>{blueprint.kind === "跑团模组" ? "可进一步建立多个独立团项目" : blueprint.structureLabel}</small>
          </article>
        ))}
      </section>

      <div className="creative-home-layout">
        <section className="creative-projects">
          <div className="creative-section-title">
            <div><span className="eyebrow">最近创作</span><h2>继续写作</h2></div>
            <label className="compact-search">
              <span className="sr-only">搜索创作项目</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索标题或类型"
              />
            </label>
          </div>
          <div className="creative-project-grid">
            {visibleProjects.map((project) => (
              <article className="creative-project-card" key={project.id}>
                <div className="creative-card-index">{project.kind.slice(0, 1)}</div>
                <div className="creative-card-heading"><span>{project.kind}</span><small>{project.updatedAt}</small></div>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <div className="creative-card-meta">
                  <span>{project.progress}</span><span>{project.documentCount} 篇文档</span><span>{project.warningCount} 条提醒</span>
                </div>
                <button onClick={() => {
                  setActiveProjectId(project.id);
                  onProjectFocus(project);
                }}>打开项目</button>
              </article>
            ))}
            {visibleProjects.length === 0 && (
              <div className="creative-empty"><h3>没有找到对应项目</h3><p>换一个关键词，或建立新的创作项目。</p></div>
            )}
          </div>
        </section>

        <aside className="creative-insight-card">
          <span className="eyebrow">今日创作脉搏</span>
          <strong>1,284</strong><small>今日新增字数</small>
          <div><span>待处理矛盾</span><b>6</b></div>
          <div><span>可能重复段落</span><b>3</b></div>
          <div><span>手动版本快照</span><b>18</b></div>
          <p>检查只提出问题；AI 建议、设定卡和正文始终保留来源区别。</p>
        </aside>
      </div>

      <p className="campaign-feedback" aria-live="polite">{feedback}</p>
      <CreativeProjectCreationDialog
        open={creationOpen}
        onClose={() => setCreationOpen(false)}
        onCreate={handleCreateProject}
      />
    </main>
  );
}
