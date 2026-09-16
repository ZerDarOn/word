"use client";

import { useMemo, useState } from "react";

type IssueKind = "设定冲突" | "疑似重复" | "待核实";
type IssueStatus = "未处理" | "已确认" | "已忽略" | "待核实";

interface ConsistencyIssue {
  id: string;
  kind: IssueKind;
  severity: "高" | "中" | "低";
  title: string;
  summary: string;
  detectedBy: "规则比对" | "文本相似度" | "AI 语义候选";
  left: { label: string; excerpt: string; source: string };
  right: { label: string; excerpt: string; source: string };
  suggestion: string;
}

interface CreativeConsistencyWorkbenchProps {
  projectTitle: string;
  onAskAi: (prompt: string) => void;
  onFeedback: (message: string) => void;
}

const issues: ConsistencyIssue[] = [
  {
    id: "port-hours",
    kind: "设定冲突",
    severity: "高",
    title: "港务处关闭时间相差一小时",
    summary: "结构化地点卡与第一章正文给出了不同的可进入时间。",
    detectedBy: "规则比对",
    left: { label: "结构化设定", excerpt: "港务处 18:00 停止对外开放。", source: "地点卡 · 萨菲港 / 港务处 · 开放时间" },
    right: { label: "正文陈述", excerpt: "十九点整，伊芙琳仍从正门把他们领进港务处。", source: "第一章 · 港务处 · 第 6 段" },
    suggestion: "先确认是地点卡过期、伊芙琳拥有例外权限，还是正文时间写错；不要直接任选一边覆盖。",
  },
  {
    id: "hayman-age",
    kind: "设定冲突",
    severity: "中",
    title: "海曼年龄出现 54 与 56 两种版本",
    summary: "角色档案和第三章人物介绍不一致。",
    detectedBy: "规则比对",
    left: { label: "角色档案", excerpt: "海曼，54 岁，失踪的灰潮号船长。", source: "角色档案 · 海曼 · 基础属性" },
    right: { label: "正文陈述", excerpt: "五十六岁的海曼不再相信海图。", source: "第三章 · 旧灯塔 · 第 2 段" },
    suggestion: "核对故事年份与生日是否跨年，再选择当前事实版本。",
  },
  {
    id: "never-arrived",
    kind: "疑似重复",
    severity: "中",
    title: "“从来没有来过”重复出现",
    summary: "两处关键句高度相似，可能是有意回声，也可能削弱第二次出现的力度。",
    detectedBy: "文本相似度",
    left: { label: "首次出现", excerpt: "除非那个人从来没有来过。", source: "序章 · 无潮之夜 · 末段" },
    right: { label: "再次出现", excerpt: "记录说，他从来没有来过这里。", source: "第二章 · 旧名册 · 第 4 段" },
    suggestion: "若是伏笔回声，标记其回收意图；若不是，再考虑改写第二处。",
  },
  {
    id: "snowson-job",
    kind: "待核实",
    severity: "低",
    title: "斯诺森的具体工种缺少原始依据",
    summary: "项目里只有“码头工人”，但一处草稿称其为吊机操作员。",
    detectedBy: "AI 语义候选",
    left: { label: "已确认事实", excerpt: "斯诺森目前在萨菲港码头卸货。", source: "人物卡 · 斯诺森 · 当前状态" },
    right: { label: "未确认表述", excerpt: "那位吊机操作员今天快下班了。", source: "场景草稿 · 抓捕斯诺森 · GM 备注" },
    suggestion: "AI 只能指出语义可能相关；在原始剧本没有写明前，应保持为待核实或临场新编。",
  },
];

export function CreativeConsistencyWorkbench({ projectTitle, onAskAi, onFeedback }: CreativeConsistencyWorkbenchProps) {
  const [filter, setFilter] = useState<"全部" | IssueKind>("全部");
  const [selectedId, setSelectedId] = useState(issues[0].id);
  const [statuses, setStatuses] = useState<Record<string, IssueStatus>>({});
  const visibleIssues = useMemo(() => issues.filter((issue) => filter === "全部" || issue.kind === filter), [filter]);
  const selected = issues.find((issue) => issue.id === selectedId) ?? visibleIssues[0] ?? issues[0];
  const unresolvedCount = issues.filter((issue) => !statuses[issue.id] || statuses[issue.id] === "未处理").length;

  function decide(status: IssueStatus) {
    setStatuses((current) => ({ ...current, [selected.id]: status }));
    onFeedback(`“${selected.title}”已标记为${status}；正文与设定均未被修改。`);
  }

  return <section className="consistency-workbench studio-board">
    <div className="studio-page-heading">
      <div><span className="eyebrow">检查与管理 · 项目级</span><h2>一致性检查</h2><p>先比较证据，再决定如何处理；检测结果不是项目事实。</p></div>
      <button onClick={() => onFeedback("已重新扫描当前项目；演示数据没有新增提醒。")}>重新扫描</button>
    </div>

    <div className="consistency-metrics">
      <article><strong>{unresolvedCount}</strong><span>未处理</span></article>
      <article><strong>{issues.filter((issue) => issue.kind === "设定冲突").length}</strong><span>设定冲突</span></article>
      <article><strong>{issues.filter((issue) => issue.kind === "疑似重复").length}</strong><span>疑似重复</span></article>
      <article><strong>{issues.filter((issue) => issue.detectedBy === "AI 语义候选").length}</strong><span>AI 候选</span></article>
    </div>

    <nav className="consistency-filters" aria-label="一致性问题分类">{(["全部", "设定冲突", "疑似重复", "待核实"] as const).map((item) => <button className={filter === item ? "active" : ""} key={item} onClick={() => { setFilter(item); const first = issues.find((issue) => item === "全部" || issue.kind === item); if (first) setSelectedId(first.id); }}>{item}</button>)}</nav>

    <div className="consistency-layout">
      <div className="consistency-issue-list">{visibleIssues.map((issue) => <button className={selected.id === issue.id ? "active" : ""} key={issue.id} onClick={() => setSelectedId(issue.id)}>
        <div><span className={`severity severity-${issue.severity}`}>{issue.severity}</span><span>{issue.kind}</span><small>{statuses[issue.id] ?? "未处理"}</small></div>
        <strong>{issue.title}</strong><p>{issue.summary}</p><footer><span>{issue.detectedBy}</span><span>查看双侧依据 →</span></footer>
      </button>)}</div>

      <article className="consistency-detail">
        <header><div><span className="eyebrow">{selected.kind} · {selected.severity}优先级</span><h3>{selected.title}</h3></div><span className="detection-badge">{selected.detectedBy}</span></header>
        {selected.detectedBy === "AI 语义候选" && <p className="ai-candidate-warning"><strong>AI 候选，不是事实判定</strong>它只提示两段文字可能有关，必须由作者核实。</p>}
        <div className="evidence-compare">
          {[selected.left, selected.right].map((evidence) => <section key={evidence.label}><span>{evidence.label}</span><blockquote>{evidence.excerpt}</blockquote><small>{evidence.source}</small><button onClick={() => onFeedback(`已定位来源：${evidence.source}`)}>定位原文</button></section>)}
        </div>
        <section className="consistency-suggestion"><span className="eyebrow">处理建议 · 不写回</span><p>{selected.suggestion}</p><button onClick={() => onAskAi(`项目“${projectTitle}”中有一致性问题：“${selected.title}”。只比较以下两项依据并给出候选处理方案，不要改写正文：${selected.left.source}；${selected.right.source}`)}>让 AI 基于这两项依据分析</button></section>
        <footer className="consistency-decisions"><button onClick={() => decide("已忽略")}>忽略提醒</button><button onClick={() => decide("待核实")}>加入待核实</button><button className="primary-action" onClick={() => decide("已确认")}>确认处理结论</button></footer>
        <p className="consistency-boundary">当前状态：{statuses[selected.id] ?? "未处理"}。任何按钮都不会自动修改正文、设定卡或团历史。</p>
      </article>
    </div>
  </section>;
}
