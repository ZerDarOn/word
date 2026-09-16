"use client";

import { useEffect, useMemo, useState } from "react";
import {
  historicalSessionSnapshots,
  initialBrief,
  initialSessionSummaries,
  sessionObjectives,
  sessionSources,
  sessionTimeline,
  type ReviewStatus,
  type SessionPhase,
  type SessionRecord,
  type SessionSummary,
  type TimelineKind,
} from "./session_archive_data";
import {
  ensureCampaignArchive,
  saveCampaignBrief,
  saveCampaignDraft,
  saveCampaignObjectives,
  saveCampaignSessions,
} from "./lorecue_campaign_store";
import { updateProjectConsultationStatus } from "./lorecue_project_store";
import { useSessionAssetDeliveries } from "./use_session_asset_deliveries";
import { useSessionConsultations } from "./use_session_consultations";

interface SessionArchivePanelProps {
  campaignId: string;
  records: SessionRecord[];
  onConfirmRecord: (id: number, status: ReviewStatus) => void;
  onReturnToConsultation: () => void;
}

const sessionPhases: SessionPhase[] = ["团前简报", "本场时间线", "团后复盘"];
const timelineFilters: Array<"全部" | TimelineKind> = [
  "全部",
  "剧本事实",
  "玩家行动",
  "主持人陈述",
  "临场新编",
];

function sessionStatusClass(status: SessionSummary["status"]) {
  if (status === "进行中") return "live";
  if (status === "草稿") return "draft";
  return "archived";
}

export function SessionArchivePanel({
  campaignId,
  records,
  onConfirmRecord,
  onReturnToConsultation,
}: SessionArchivePanelProps) {
  const [activePhase, setActivePhase] = useState<SessionPhase>("团前简报");
  const [sessions, setSessions] = useState(initialSessionSummaries);
  const [selectedSessionId, setSelectedSessionId] = useState("session-3");
  const [brief, setBrief] = useState(initialBrief);
  const [completedObjectives, setCompletedObjectives] = useState(
    () => new Set(sessionObjectives.filter((item) => item.complete).map((item) => item.id)),
  );
  const [timelineFilter, setTimelineFilter] = useState<"全部" | TimelineKind>("全部");
  const [draftTitle, setDraftTitle] = useState("未命名场次");
  const [draftPlan, setDraftPlan] = useState("承接灰潮号靠港线索，等待团后复盘完成后补充。");
  const [feedback, setFeedback] = useState("正在读取本团的场次档案……");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const archive = ensureCampaignArchive(campaignId);
      setSessions(archive.sessions);
      setSelectedSessionId(archive.selectedSessionId);
      setBrief(archive.brief);
      setCompletedObjectives(new Set(archive.completedObjectiveIds));
      setDraftTitle(archive.draftTitle);
      setDraftPlan(archive.draftPlan);
      setFeedback(`场次数据仓 v1 已就绪 · ${archive.sessions.length} 次团 · ${archive.records.length} 条临场记录。`);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [campaignId]);

  const selectedSession =
    sessions.find((session) => session.id === selectedSessionId) ?? sessions[2];
  const sessionDeliveries = useSessionAssetDeliveries(campaignId, selectedSession.id);
  const sessionConsultations = useSessionConsultations(campaignId, selectedSession.id);
  const filteredTimeline = useMemo(
    () =>
      timelineFilter === "全部"
        ? sessionTimeline
        : sessionTimeline.filter((entry) => entry.kind === timelineFilter),
    [timelineFilter],
  );
  const pendingRecordCount = records.filter((record) => record.status === "待确认").length;
  const pendingConsultationCount = sessionConsultations.filter((consultation) => consultation.status === "pending").length;
  const pendingReviewCount = pendingRecordCount + pendingConsultationCount;
  const historicalSnapshot = historicalSessionSnapshots[selectedSessionId];
  const showCurrentSession = selectedSessionId === "session-3";

  function handleSaveBrief() {
    saveCampaignBrief(campaignId, brief);
    setFeedback("团前简报已保存到本团场次数据仓，并保留所属场次边界。");
  }

  function handleCreateSession() {
    const existingDraft = sessions.find((session) => session.status === "草稿");
    if (existingDraft) {
      setSelectedSessionId(existingDraft.id);
      saveCampaignSessions(campaignId, sessions, existingDraft.id);
      setFeedback("已切换到尚未填写的第 4 次团草稿。");
      return;
    }

    const draft: SessionSummary = {
      id: "session-4",
      number: "第 4 次团",
      title: "未命名场次",
      date: "待安排",
      time: "时间未定",
      status: "草稿",
    };
    setSessions((current) => {
      const nextSessions = [...current, draft];
      saveCampaignSessions(campaignId, nextSessions, draft.id);
      return nextSessions;
    });
    setSelectedSessionId(draft.id);
    setDraftTitle("未命名场次");
    setDraftPlan("承接灰潮号靠港线索，等待团后复盘完成后补充。");
    setFeedback("已新建第 4 次团草稿并保存到本团场次数据仓。");
  }

  function handleToggleObjective(id: string) {
    setCompletedObjectives((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveCampaignObjectives(campaignId, [...next]);
      return next;
    });
  }

  function handleReviewConsultation(projectId: string, consultationId: string) {
    updateProjectConsultationStatus(projectId, consultationId, "reviewed");
    setFeedback("该条 AI 咨询已标为已复盘；建议与来源快照仍未升级成正式设定。");
  }

  function handleSaveDraft() {
    const nextSessions = sessions.map((session) => session.id === selectedSessionId
      ? { ...session, title: draftTitle.trim() || "未命名场次" }
      : session);
    setSessions(nextSessions);
    saveCampaignDraft(campaignId, draftTitle.trim() || "未命名场次", draftPlan, nextSessions, selectedSessionId);
    setFeedback("下一次团草稿已保存；不会改动已归档的历史场次。");
  }

  function handlePhaseChange(phase: SessionPhase) {
    setActivePhase(phase);
    setFeedback(`已切换到“${phase}”。`);
  }

  return (
    <main className="archive-workspace" id="main-content">
      <aside className="archive-session-rail" aria-label="场次列表">
        <div className="section-heading">
          <span className="eyebrow">萨菲港旧案</span>
          <h2>场次档案</h2>
          <p>每次开团都是一个独立证据容器，记录当时依据、实际发生与团后决定。</p>
        </div>

        <div className="session-history">
          {sessions.map((session) => (
            <button
              key={session.id}
              className={`history-card ${selectedSessionId === session.id ? "active" : ""}`}
              onClick={() => {
                setSelectedSessionId(session.id);
                saveCampaignSessions(campaignId, sessions, session.id);
                setFeedback(`已查看${session.number}“${session.title}”。`);
              }}
              aria-pressed={selectedSessionId === session.id}
            >
              <span className={`history-status ${sessionStatusClass(session.status)}`}>
                {session.status}
              </span>
              <strong>{session.number} · {session.title}</strong>
              <small>{session.date} · {session.time}</small>
            </button>
          ))}
        </div>

        <button className="new-session-button" onClick={handleCreateSession}>
          <span aria-hidden="true">＋</span>
          新建下一次团
        </button>

        <div className="archive-principle">
          <strong>归档原则</strong>
          <p>“桌上发生过”与“以后持续成立”分开保存，任何升格都有日期和场次可查。</p>
        </div>
      </aside>

      <section className="archive-main">
        <header className="archive-masthead">
          <div>
            <button className="text-link" onClick={onReturnToConsultation}>返回主持人咨询台</button>
            <span className="eyebrow">{selectedSession.number}</span>
            <h1>{selectedSession.title}</h1>
            <p>从团前准备到团后归档，保留这一次桌面叙事的完整上下文。</p>
          </div>
          <div className="session-stamp">
            <span className={`history-status ${sessionStatusClass(selectedSession.status)}`}>
              {selectedSession.status}
            </span>
            <strong>{selectedSession.date}</strong>
            <small>{selectedSession.time}</small>
          </div>
        </header>

        <dl className="archive-metadata">
          <div><dt>系统</dt><dd>D&amp;D 5e</dd></div>
          <div><dt>主持人</dt><dd>入住疯人院</dd></div>
          <div><dt>参与</dt><dd>5 名玩家 · 5 名角色</dd></div>
          <div><dt>承接</dt><dd>第 2 次团“失踪的账本”</dd></div>
        </dl>

        <section className="archive-card session-delivery-summary" aria-label="本场玩家资料发放">
          <div className="archive-card-heading">
            <div><span className="eyebrow">玩家实际已知</span><h2>本场发放资料</h2></div>
            <span className="count-pill">{sessionDeliveries.length}</span>
          </div>
          {sessionDeliveries.length > 0 ? <div className="session-delivery-list">{sessionDeliveries.map((delivery) => <article className={delivery.status === "revoked" ? "revoked" : ""} key={delivery.id}>
            <span>{delivery.surface === "player-handout" ? "玩家手册" : "玩家附件"}</span>
            <div><strong>{delivery.playerTitle}</strong><p>{delivery.recipient} · {delivery.version} · 素材 {delivery.assetId ?? "无绑定"}</p><small>{delivery.sessionLabel} · {new Date(delivery.deliveredAt).toLocaleString("zh-CN")}</small></div>
            <em>{delivery.status === "revoked" ? "已撤回但曾披露" : "仍可查看"}</em>
          </article>)}</div> : <div className="session-delivery-empty"><strong>本场尚无玩家资料发放记录</strong><p>只有明确归属到“{selectedSession.number} · {selectedSession.title}”的真实发放才会出现在这里。</p></div>}
          <p className="session-delivery-note">撤回不会让玩家忘记内容；团后复盘和 AI 知识边界仍会把历史披露视为玩家已知。</p>
        </section>

        <section className="archive-card session-consultation-summary" aria-label="本场 AI 咨询留痕">
          <div className="archive-card-heading">
            <div><span className="eyebrow">当时为何这样回答</span><h2>本场 AI 咨询留痕</h2></div>
            <span className="count-pill">{sessionConsultations.length}</span>
          </div>
          {sessionConsultations.length > 0 ? <div className="session-consultation-list">{sessionConsultations.map((consultation) => {
            const disclosureCount = consultation.playerDisclosures?.length ?? 0;
            const includesRevokedDisclosure = consultation.playerDisclosures?.some((item) => item.status === "revoked");
            return <article className={consultation.status} key={`${consultation.projectId}:${consultation.id}`}>
              <header><span>{consultation.mode} · {consultation.speaker}</span><em>{consultation.status === "pending" ? "待复盘" : "已复盘"}</em></header>
              <strong>{consultation.question}</strong>
              {consultation.answer && <p className="consultation-answer">{consultation.answer}</p>}
              {consultation.liveContext && <p><b>现场输入</b>{consultation.liveContext}</p>}
              <small>{consultation.sourceLabels.length} 份依据 · {consultation.includesPlayerDisclosures ? `纳入 ${disclosureCount} 份玩家已知资料` : "未纳入玩家已知资料"} · {consultation.createdAt}</small>
              {includesRevokedDisclosure && <b className="revoked-disclosure">含已撤回但曾披露资料</b>}
              {consultation.status === "pending" && <button onClick={() => handleReviewConsultation(consultation.projectId, consultation.id)}>标为已复盘</button>}
            </article>;
          })}</div> : <div className="session-consultation-empty"><strong>本场尚无 AI 咨询留痕</strong><p>只有明确采用为草稿、并绑定到“{selectedSession.number} · {selectedSession.title}”的咨询才会进入档案。</p></div>}
          <p className="session-consultation-note">复盘只确认“这次咨询处理过了”，不会把 AI 建议或临场补全自动升级成正式设定。</p>
        </section>

        {showCurrentSession && (
          <nav className="archive-phase-tabs" aria-label="场次档案阶段">
            {sessionPhases.map((phase, index) => (
              <button
                key={phase}
                className={activePhase === phase ? "active" : ""}
                onClick={() => handlePhaseChange(phase)}
                aria-current={activePhase === phase ? "page" : undefined}
              >
                <span>0{index + 1}</span>
                {phase}
                {phase === "团后复盘" && pendingReviewCount > 0 && <b>{pendingReviewCount}</b>}
              </button>
            ))}
          </nav>
        )}

        {historicalSnapshot && (
          <div className="historical-overview">
            <section className="archive-card historical-recap">
              <div className="archive-card-heading">
                <div><span className="eyebrow">已归档快照</span><h2>本次回顾</h2></div>
                <span className="source-chip">不可覆盖历史</span>
              </div>
              <p>{historicalSnapshot.recap}</p>
              <div className="historical-columns">
                <div>
                  <h3>本场结果</h3>
                  <ul>{historicalSnapshot.outcomes.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div>
                  <h3>升格为长期事实</h3>
                  <ul>{historicalSnapshot.promotedFacts.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              </div>
            </section>
            <section className="archive-card historical-handoff">
              <span className="eyebrow">当时留下的接口</span>
              <h2>交给下一次团</h2>
              <p>{historicalSnapshot.handoff}</p>
            </section>
          </div>
        )}

        {selectedSession.status === "草稿" && (
          <section className="archive-card draft-session-card">
            <div>
              <span className="eyebrow">下一次团 · 草稿</span>
              <h2>先留一张空白场次卡</h2>
              <p>日期、参与者和承接内容都可以等确认后再补，不会污染已经归档的第 3 次团。</p>
            </div>
            <label>暂定标题<input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} /></label>
            <label>准备推进到哪里<textarea rows={4} value={draftPlan} onChange={(event) => setDraftPlan(event.target.value)} /></label>
            <button onClick={handleSaveDraft}>保存草稿</button>
          </section>
        )}

        {showCurrentSession && activePhase === "团前简报" && (
          <div className="archive-content-grid">
            <div className="archive-primary-column">
              <section className="archive-card brief-card">
                <div className="archive-card-heading">
                  <div><span className="eyebrow">开团上下文</span><h2>本次简介</h2></div>
                  <span className="source-chip">场次快照</span>
                </div>
                <label>
                  <span className="sr-only">本次团简介</span>
                  <textarea value={brief} onChange={(event) => setBrief(event.target.value)} rows={6} />
                </label>
                <div className="card-footer">
                  <p>AI 在本场咨询时优先参考这份快照，不会默认读取整个项目。</p>
                  <button className="primary-action" onClick={handleSaveBrief}>保存本次简报</button>
                </div>
              </section>

              <section className="archive-card">
                <div className="archive-card-heading">
                  <div><span className="eyebrow">范围控制</span><h2>本场目标</h2></div>
                  <span className="progress-label">
                    {completedObjectives.size}/{sessionObjectives.length} 已推进
                  </span>
                </div>
                <div className="objective-list">
                  {sessionObjectives.map((objective) => {
                    const complete = completedObjectives.has(objective.id);
                    return (
                      <label className={complete ? "complete" : ""} key={objective.id}>
                        <input
                          type="checkbox"
                          checked={complete}
                          onChange={() => handleToggleObjective(objective.id)}
                        />
                        <span>{objective.text}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside className="archive-secondary-column">
              <section className="archive-card">
                <div className="archive-card-heading">
                  <div><span className="eyebrow">溯源基线</span><h2>本次使用的资料</h2></div>
                  <span className="count-pill">{sessionSources.length}</span>
                </div>
                <div className="source-list">
                  {sessionSources.map((source) => (
                    <article key={source.id}>
                      <span>{source.kind}</span>
                      <h3>{source.title}</h3>
                      <p>{source.detail}</p>
                      <small>{source.version}</small>
                    </article>
                  ))}
                </div>
              </section>

              <section className="archive-card continuity-card">
                <span className="eyebrow">开场状态</span>
                <h2>玩家已经知道</h2>
                <ul>
                  <li>账本提到“三号码头”和月末船期</li>
                  <li>斯诺森可能参与货物转运</li>
                  <li>港务处内部有人修改记录</li>
                </ul>
                <p>隐藏：伊芙琳修改名册的直接证据仍未公开。</p>
              </section>
            </aside>
          </div>
        )}

        {showCurrentSession && activePhase === "本场时间线" && (
          <section className="archive-card timeline-card">
            <div className="timeline-toolbar">
              <div>
                <span className="eyebrow">2026-07-29</span>
                <h2>本场时间线</h2>
                <p>它不是逐字聊天记录，而是能影响后续叙事的关键节点。</p>
              </div>
              <div className="timeline-filters" aria-label="筛选时间线">
                {timelineFilters.map((filter) => (
                  <button
                    key={filter}
                    className={timelineFilter === filter ? "active" : ""}
                    onClick={() => setTimelineFilter(filter)}
                    aria-pressed={timelineFilter === filter}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="timeline-list">
              {filteredTimeline.map((entry) => (
                <article key={entry.id} className="timeline-entry">
                  <time>{entry.time}</time>
                  <span className="timeline-dot" data-kind={entry.kind} aria-hidden="true" />
                  <div>
                    <span className="timeline-kind">{entry.kind}</span>
                    <h3>{entry.title}</h3>
                    <p>{entry.detail}</p>
                    <small>来源：{entry.source}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {showCurrentSession && activePhase === "团后复盘" && (
          <div className="archive-content-grid review-layout">
            <section className="archive-card archive-review-card">
              <div className="archive-card-heading">
                <div><span className="eyebrow">统一复盘队列</span><h2>事实归档与 AI 咨询分开处理</h2></div>
                <span className="count-pill">{pendingReviewCount}</span>
              </div>
              <p className="review-explainer">
                实际说出或发生的内容需要决定是否成为长期事实；AI 咨询只确认是否已复盘，不会因此写入设定。
              </p>
              <div className="review-queue-heading"><div><strong>临场事实判断</strong><small>口胡、主持人陈述与桌上实际发生</small></div><span>{pendingRecordCount} 待确认</span></div>
              <div className="record-list">
                {records.map((record) => (
                  <article className="record-item" key={record.id}>
                    <div>
                      <span className="record-kind">
                        {record.kind === "spoken" ? "实际说出" : "实际发生"}
                      </span>
                      <h3>{record.text}</h3>
                      <p>来源：第 3 次团 · {record.scenario}</p>
                    </div>
                    <label>
                      归档为
                      <select
                        value={record.status}
                        onChange={(event) =>
                          onConfirmRecord(record.id, event.target.value as ReviewStatus)
                        }
                      >
                        <option>待确认</option>
                        <option>客观事实</option>
                        <option>NPC 主张</option>
                        <option>仅本场</option>
                        <option>废弃</option>
                      </select>
                    </label>
                  </article>
                ))}
              </div>
              <div className="review-queue-heading"><div><strong>AI 咨询处理</strong><small>核对当时问题、现场输入与知识边界</small></div><span>{pendingConsultationCount} 待复盘</span></div>
              <div className="review-consultation-queue">
                {sessionConsultations.length > 0 ? sessionConsultations.map((consultation) => <article className={consultation.status} key={`review:${consultation.projectId}:${consultation.id}`}>
                  <div><span>{consultation.mode} · {consultation.speaker}</span><strong>{consultation.question}</strong><small>{consultation.sourceLabels.length} 份依据 · {consultation.includesPlayerDisclosures ? `${consultation.playerDisclosures?.length ?? 0} 份玩家已知资料` : "未纳入玩家已知资料"}</small></div>
                  {consultation.status === "pending"
                    ? <button onClick={() => handleReviewConsultation(consultation.projectId, consultation.id)}>标为已复盘</button>
                    : <em>已复盘 · 未写入设定</em>}
                </article>) : <p>本场没有采用为草稿的 AI 咨询。</p>}
              </div>
            </section>

            <aside className="archive-secondary-column">
              <section className="archive-card decision-summary">
                <span className="eyebrow">本次归档</span>
                <dl>
                  <div><dt>待处理总数</dt><dd>{pendingReviewCount}</dd></div>
                  <div><dt>临场待确认</dt><dd>{pendingRecordCount}</dd></div>
                  <div><dt>AI 待复盘</dt><dd>{pendingConsultationCount}</dd></div>
                  <div><dt>长期事实</dt><dd>{records.filter((item) => item.status === "客观事实").length}</dd></div>
                  <div><dt>仅本场</dt><dd>{records.filter((item) => item.status === "仅本场").length}</dd></div>
                </dl>
              </section>
              <section className="archive-card next-session-card">
                <span className="eyebrow">留给下一次</span>
                <h2>第 4 次团接口</h2>
                <ul>
                  <li>斯诺森是否发现自己被跟踪？</li>
                  <li>“灰潮号”将在两天后靠港</li>
                  <li>伊芙琳的立场仍可被说服</li>
                </ul>
                <button onClick={handleCreateSession}>建立下一次团草稿</button>
              </section>
            </aside>
          </div>
        )}

        <p className="archive-feedback" aria-live="polite">{feedback}</p>
      </section>
    </main>
  );
}
