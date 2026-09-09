"use client";

import { useState } from "react";
import type { CreativeProject } from "./creative_project_data";

type OrganizationTab = "组织概览" | "内部结构" | "关系与立场" | "秘密行动";

interface OrganizationRecord {
  name: string;
  type: string;
  parent: string;
  publicStance: string;
  hiddenGoal: string;
  purpose: string;
  resources: string;
  territory: string;
  leader: string;
  visibility: "玩家可见" | "主持人可见" | "仅主持人可见";
}

const organizationTree = [
  { name: "萨菲港势力", level: "势力总览", depth: 0, tone: "neutral" },
  { name: "港务议会", level: "执政组织", depth: 1, tone: "order" },
  { name: "议事厅", level: "决策部门", depth: 2, tone: "order" },
  { name: "档案处", level: "职能部门", depth: 2, tone: "order" },
  { name: "港区执法队", level: "执行部门", depth: 2, tone: "order" },
  { name: "民间与旧港", level: "阵营集合", depth: 1, tone: "neutral" },
  { name: "守灯人", level: "秘密组织", depth: 2, tone: "secret" },
  { name: "灰潮互助会", level: "互助组织", depth: 2, tone: "free" },
];

const initialOrganization: OrganizationRecord = {
  name: "港务议会",
  type: "执政组织",
  parent: "萨菲港势力",
  publicStance: "维护港口贸易秩序，确保航运记录公开、准确且可追溯。",
  hiddenGoal: "掩盖二十年前对灰潮号船员名册的集体涂改，避免真名契约重新生效。",
  purpose: "管理港务、税收、船员登记与城市对外航路。",
  resources: "港务档案库、执法队、税收权、三座信号塔、商会支持",
  territory: "内港、码头区、港务处及主要仓储区",
  leader: "首席议员 · 阿德莱德",
  visibility: "主持人可见",
};

interface CreativeOrganizationWorkbenchProps {
  project: CreativeProject;
  onFeedback: (message: string) => void;
}

export function CreativeOrganizationWorkbench({
  project,
  onFeedback,
}: CreativeOrganizationWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<OrganizationTab>("组织概览");
  const [selectedName, setSelectedName] = useState("港务议会");
  const [organization, setOrganization] = useState(initialOrganization);

  function updateOrganization<Key extends keyof OrganizationRecord>(
    key: Key,
    value: OrganizationRecord[Key],
  ) {
    setOrganization((current) => ({ ...current, [key]: value }));
  }

  function handleSaveOrganization() {
    onFeedback(`已模拟保存“${organization.name}”的组织结构、立场与秘密边界。`);
  }

  return (
    <section className="organization-workbench studio-board">
      <div className="studio-page-heading">
        <div>
          <span className="eyebrow">设定资料 · 组织阵营</span>
          <h2>组织不是一个标签，而是一套权力结构</h2>
          <p>上下级、内部部门、公开立场、隐藏目标与外部关系分别记录。</p>
        </div>
        <button onClick={() => onFeedback("已模拟建立一个空白组织。")}>＋ 新建组织</button>
      </div>

      <div className="organization-layout">
        <aside className="organization-tree">
          <header><strong>组织层级</strong><small>8 个节点</small></header>
          <nav aria-label="组织层级">
            {organizationTree.map((item) => (
              <button
                key={item.name}
                className={selectedName === item.name ? "active" : ""}
                style={{ paddingInlineStart: `${10 + item.depth * 16}px` }}
                onClick={() => {
                  setSelectedName(item.name);
                  setOrganization((current) => ({
                    ...current,
                    name: item.name,
                    type: item.level,
                    parent: item.depth === 0 ? "无上级组织" : "萨菲港势力",
                  }));
                  onFeedback(`已切换到“${item.name}”的结构预览。`);
                }}
              >
                <i className={`organization-tone ${item.tone}`} />
                <span><strong>{item.name}</strong><small>{item.level}</small></span>
                <b>{item.depth < 2 ? "›" : "·"}</b>
              </button>
            ))}
          </nav>
          <div className="organization-legend">
            <span><i className="organization-tone order" />秩序阵营</span>
            <span><i className="organization-tone free" />自治阵营</span>
            <span><i className="organization-tone secret" />隐秘势力</span>
          </div>
        </aside>

        <article className="organization-editor">
          <header>
            <div className="organization-seal">港</div>
            <div><span>{organization.type} · 隶属 {organization.parent}</span><h3>{organization.name}</h3><p>{project.title}中的核心权力组织</p></div>
            <button onClick={handleSaveOrganization}>保存组织</button>
          </header>

          <nav className="entity-tabs" aria-label="组织档案分区">
            {(["组织概览", "内部结构", "关系与立场", "秘密行动"] as OrganizationTab[]).map((tab) => (
              <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </nav>

          {activeTab === "组织概览" && (
            <div className="entity-form organization-overview-form">
              <div className="entity-visibility-row">
                <div><strong>组织基础资料</strong><span>独立控制哪些内容可进入玩家侧资料</span></div>
                <select value={organization.visibility} onChange={(event) => updateOrganization("visibility", event.target.value as OrganizationRecord["visibility"])}>
                  <option>玩家可见</option><option>主持人可见</option><option>仅主持人可见</option>
                </select>
              </div>
              <label>组织名称<input value={organization.name} onChange={(event) => updateOrganization("name", event.target.value)} /></label>
              <label>组织类型<input value={organization.type} onChange={(event) => updateOrganization("type", event.target.value)} /></label>
              <label>上级组织<input value={organization.parent} onChange={(event) => updateOrganization("parent", event.target.value)} /></label>
              <label>领导者<input value={organization.leader} onChange={(event) => updateOrganization("leader", event.target.value)} /></label>
              <label className="full-field">组织职责<textarea rows={3} value={organization.purpose} onChange={(event) => updateOrganization("purpose", event.target.value)} /></label>
              <label>掌握资源<textarea rows={4} value={organization.resources} onChange={(event) => updateOrganization("resources", event.target.value)} /></label>
              <label>控制区域<textarea rows={4} value={organization.territory} onChange={(event) => updateOrganization("territory", event.target.value)} /></label>
            </div>
          )}

          {activeTab === "内部结构" && <OrganizationStructure />}
          {activeTab === "关系与立场" && (
            <OrganizationRelations publicStance={organization.publicStance} onPublicStanceChange={(value) => updateOrganization("publicStance", value)} />
          )}
          {activeTab === "秘密行动" && (
            <div className="entity-form">
              <div className="secret-boundary full-field"><strong>仅主持人可见</strong><span>隐藏目标和秘密行动不会进入玩家视角检索。</span></div>
              <label className="full-field">隐藏目标<textarea rows={5} value={organization.hiddenGoal} onChange={(event) => updateOrganization("hiddenGoal", event.target.value)} /></label>
              <div className="operation-list full-field">
                <article><span>进行中</span><strong>回收旧航路记录</strong><p>档案处正在从私人藏家处秘密购回灰潮号相关文件。</p></article>
                <article><span>风险上升</span><strong>监视斯诺森</strong><p>执法队已记录他的上下班路线，但尚未直接接触。</p></article>
                <button onClick={() => onFeedback("已模拟添加一项秘密行动。")}>＋ 添加秘密行动</button>
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

function OrganizationStructure() {
  const departments = [
    { name: "议事厅", role: "方向与决策", leader: "7 名议员", members: "7" },
    { name: "档案处", role: "登记与历史记录", leader: "伊芙琳", members: "18" },
    { name: "港区执法队", role: "巡查与扣押", leader: "罗素队长", members: "42" },
  ];
  return (
    <div className="organization-structure-panel">
      <div className="structure-chain"><span>萨菲港势力</span><b>›</b><strong>港务议会</strong><b>›</b><span>三个直属部门</span></div>
      <div className="department-grid">
        {departments.map((department) => (
          <article key={department.name}><span>{department.role}</span><h4>{department.name}</h4><dl><div><dt>负责人</dt><dd>{department.leader}</dd></div><div><dt>成员</dt><dd>{department.members} 人</dd></div></dl><button>打开部门</button></article>
        ))}
      </div>
      <section className="rank-ladder"><strong>职位阶梯</strong><div><span>首席议员</span><i /><span>部门主管</span><i /><span>正式职员</span><i /><span>外聘人员</span></div></section>
    </div>
  );
}

function OrganizationRelations({
  publicStance,
  onPublicStanceChange,
}: {
  publicStance: string;
  onPublicStanceChange: (value: string) => void;
}) {
  return (
    <div className="organization-relations-panel">
      <label>公开立场<textarea rows={4} value={publicStance} onChange={(event) => onPublicStanceChange(event.target.value)} /></label>
      <div className="stance-summary">
        <article className="allied"><span>合作</span><strong>北境商会</strong><p>税收与航路信息互换</p></article>
        <article className="tense"><span>紧张</span><strong>灰潮互助会</strong><p>对旧船员名册意见相反</p></article>
        <article className="hidden"><span>秘密接触</span><strong>守灯人</strong><p>交换旧航路与灯塔维护权</p></article>
      </div>
      <section className="relationship-definition"><strong>关系需要双向记录</strong><p>港务议会认为互助会在煽动混乱；互助会认为议会故意抹除遇难者。双方认知不会自动视为同一事实。</p></section>
    </div>
  );
}
