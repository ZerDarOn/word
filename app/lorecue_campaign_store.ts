import type { CampaignProject } from "./campaign_project_data";
import {
  initialBrief,
  initialSessionRecords,
  initialSessionSummaries,
  sessionObjectives,
  type SessionRecord,
  type SessionSummary,
} from "./session_archive_data";

export const LORECUE_CAMPAIGN_CATALOG_FORMAT = "lorecue-campaign-catalog";
export const LORECUE_CAMPAIGN_ARCHIVE_FORMAT = "lorecue-campaign-archive";
export const LORECUE_CAMPAIGN_STORE_VERSION = 1;

export interface LoreCueCampaignCatalog {
  format: typeof LORECUE_CAMPAIGN_CATALOG_FORMAT;
  version: typeof LORECUE_CAMPAIGN_STORE_VERSION;
  updatedAt: string;
  projects: CampaignProject[];
}

export type LoreCueHandoffKind = "长期事实" | "未决问题" | "保留状态";

export interface LoreCueHandoffItem {
  id: string;
  kind: LoreCueHandoffKind;
  text: string;
  sourceSessionId: string;
  sourceSessionLabel: string;
  sourceLabel: string;
  selected: boolean;
}

export interface LoreCueCampaignArchive {
  format: typeof LORECUE_CAMPAIGN_ARCHIVE_FORMAT;
  version: typeof LORECUE_CAMPAIGN_STORE_VERSION;
  campaignId: string;
  updatedAt: string;
  sessions: SessionSummary[];
  selectedSessionId: string;
  brief: string;
  completedObjectiveIds: string[];
  records: SessionRecord[];
  handoffItems: LoreCueHandoffItem[];
  draftHandoffItems: LoreCueHandoffItem[];
  draftPlayerKnownHandoffIds: string[];
  draftAudienceReviewed: boolean;
  draftTitle: string;
  draftPlan: string;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function catalogKey() {
  return LORECUE_CAMPAIGN_CATALOG_FORMAT;
}

function archiveKey(campaignId: string) {
  return `${LORECUE_CAMPAIGN_ARCHIVE_FORMAT}:${campaignId}`;
}

function isCampaignProject(value: unknown): value is CampaignProject {
  if (!value || typeof value !== "object") return false;
  const project = value as Partial<CampaignProject>;
  return typeof project.id === "string"
    && typeof project.name === "string"
    && typeof project.runName === "string"
    && typeof project.templateTitle === "string"
    && typeof project.system === "string"
    && typeof project.status === "string"
    && typeof project.summary === "string"
    && typeof project.playerCount === "number"
    && typeof project.sessionCount === "number"
    && typeof project.pendingReviews === "number";
}

function isSessionSummary(value: unknown): value is SessionSummary {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<SessionSummary>;
  return typeof session.id === "string"
    && typeof session.number === "string"
    && typeof session.title === "string"
    && typeof session.date === "string"
    && typeof session.time === "string"
    && (session.status === "已归档" || session.status === "进行中" || session.status === "草稿" || session.status === "待开团");
}

function isSessionRecord(value: unknown): value is SessionRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<SessionRecord>;
  return typeof record.id === "number"
    && typeof record.text === "string"
    && (record.kind === "spoken" || record.kind === "happened")
    && typeof record.scenario === "string"
    && ["待确认", "客观事实", "NPC 主张", "仅本场", "废弃"].includes(record.status ?? "");
}

function isHandoffItem(value: unknown): value is LoreCueHandoffItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<LoreCueHandoffItem>;
  return typeof item.id === "string"
    && ["长期事实", "未决问题", "保留状态"].includes(item.kind ?? "")
    && typeof item.text === "string"
    && typeof item.sourceSessionId === "string"
    && typeof item.sourceSessionLabel === "string"
    && typeof item.sourceLabel === "string"
    && typeof item.selected === "boolean";
}

function quarantine(key: string, raw: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${key}:quarantine:${Date.now()}`, raw);
  } catch {
    // Leave the unreadable value untouched if the browser cannot create a copy.
  }
}

function readCampaignCatalog(): LoreCueCampaignCatalog | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(catalogKey());
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<LoreCueCampaignCatalog>;
    if (value.format !== LORECUE_CAMPAIGN_CATALOG_FORMAT
      || value.version !== LORECUE_CAMPAIGN_STORE_VERSION
      || !Array.isArray(value.projects)
      || !value.projects.every(isCampaignProject)) return null;
    return {
      format: LORECUE_CAMPAIGN_CATALOG_FORMAT,
      version: LORECUE_CAMPAIGN_STORE_VERSION,
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString(),
      projects: value.projects,
    };
  } catch {
    return null;
  }
}

export function saveCampaignCatalog(projects: CampaignProject[]) {
  if (typeof window === "undefined") return;
  const catalog: LoreCueCampaignCatalog = {
    format: LORECUE_CAMPAIGN_CATALOG_FORMAT,
    version: LORECUE_CAMPAIGN_STORE_VERSION,
    updatedAt: new Date().toISOString(),
    projects: clone(projects),
  };
  window.localStorage.setItem(catalogKey(), JSON.stringify(catalog));
}

export function ensureCampaignCatalog(initialProjects: CampaignProject[]) {
  if (typeof window === "undefined") return clone(initialProjects);
  const existing = readCampaignCatalog();
  if (existing) {
    const ids = new Set(existing.projects.map((project) => project.id));
    const missingDefaults = initialProjects.filter((project) => !ids.has(project.id));
    const merged = [...existing.projects, ...missingDefaults];
    if (missingDefaults.length > 0) saveCampaignCatalog(merged);
    return merged;
  }
  const raw = window.localStorage.getItem(catalogKey());
  if (raw) quarantine(catalogKey(), raw);
  saveCampaignCatalog(initialProjects);
  return clone(initialProjects);
}

function createInitialArchive(campaignId: string): LoreCueCampaignArchive {
  return {
    format: LORECUE_CAMPAIGN_ARCHIVE_FORMAT,
    version: LORECUE_CAMPAIGN_STORE_VERSION,
    campaignId,
    updatedAt: new Date().toISOString(),
    sessions: clone(initialSessionSummaries),
    selectedSessionId: "session-3",
    brief: initialBrief,
    completedObjectiveIds: sessionObjectives.filter((item) => item.complete).map((item) => item.id),
    records: clone(initialSessionRecords),
    handoffItems: [],
    draftHandoffItems: [],
    draftPlayerKnownHandoffIds: [],
    draftAudienceReviewed: false,
    draftTitle: "未命名场次",
    draftPlan: "承接灰潮号靠港线索，等待团后复盘完成后补充。",
  };
}

export function readCampaignArchive(campaignId: string): LoreCueCampaignArchive | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(archiveKey(campaignId));
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<LoreCueCampaignArchive>;
    if (value.format !== LORECUE_CAMPAIGN_ARCHIVE_FORMAT
      || value.version !== LORECUE_CAMPAIGN_STORE_VERSION
      || value.campaignId !== campaignId
      || !Array.isArray(value.sessions)
      || !value.sessions.every(isSessionSummary)
      || !Array.isArray(value.records)
      || !value.records.every(isSessionRecord)) return null;
    return {
      ...createInitialArchive(campaignId),
      sessions: value.sessions,
      selectedSessionId: typeof value.selectedSessionId === "string" ? value.selectedSessionId : "session-3",
      brief: typeof value.brief === "string" ? value.brief : initialBrief,
      completedObjectiveIds: Array.isArray(value.completedObjectiveIds)
        ? value.completedObjectiveIds.filter((id): id is string => typeof id === "string")
        : [],
      records: value.records,
      handoffItems: Array.isArray(value.handoffItems) ? value.handoffItems.filter(isHandoffItem) : [],
      draftHandoffItems: Array.isArray(value.draftHandoffItems) ? value.draftHandoffItems.filter(isHandoffItem) : [],
      draftPlayerKnownHandoffIds: Array.isArray(value.draftPlayerKnownHandoffIds)
        ? value.draftPlayerKnownHandoffIds.filter((id): id is string => typeof id === "string")
        : [],
      draftAudienceReviewed: typeof value.draftAudienceReviewed === "boolean" ? value.draftAudienceReviewed : false,
      draftTitle: typeof value.draftTitle === "string" ? value.draftTitle : "未命名场次",
      draftPlan: typeof value.draftPlan === "string" ? value.draftPlan : "",
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function writeCampaignArchive(archive: LoreCueCampaignArchive) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(archiveKey(archive.campaignId), JSON.stringify({
    ...archive,
    updatedAt: new Date().toISOString(),
  }));
}

export function ensureCampaignArchive(campaignId: string) {
  if (typeof window === "undefined") return createInitialArchive(campaignId);
  const existing = readCampaignArchive(campaignId);
  if (existing) return existing;
  const raw = window.localStorage.getItem(archiveKey(campaignId));
  if (raw) quarantine(archiveKey(campaignId), raw);
  const initial = createInitialArchive(campaignId);
  writeCampaignArchive(initial);
  return initial;
}

function updateCampaignArchive(
  campaignId: string,
  update: (current: LoreCueCampaignArchive) => LoreCueCampaignArchive,
) {
  const next = update(readCampaignArchive(campaignId) ?? createInitialArchive(campaignId));
  writeCampaignArchive(next);
  return next;
}

function syncPendingReviewCount(campaignId: string, records: SessionRecord[]) {
  const catalog = readCampaignCatalog();
  if (!catalog) return;
  const pendingReviews = records.filter((record) => record.status === "待确认").length;
  saveCampaignCatalog(catalog.projects.map((project) => project.id === campaignId
    ? { ...project, pendingReviews }
    : project));
}

export function saveCampaignRecords(campaignId: string, records: SessionRecord[]) {
  const next = updateCampaignArchive(campaignId, (current) => ({ ...current, records: clone(records) }));
  syncPendingReviewCount(campaignId, records);
  return next;
}

export function saveCampaignSessions(campaignId: string, sessions: SessionSummary[], selectedSessionId: string) {
  return updateCampaignArchive(campaignId, (current) => ({
    ...current,
    sessions: clone(sessions),
    selectedSessionId,
  }));
}

export function saveCampaignBrief(campaignId: string, brief: string) {
  return updateCampaignArchive(campaignId, (current) => ({ ...current, brief }));
}

export function saveCampaignObjectives(campaignId: string, completedObjectiveIds: string[]) {
  return updateCampaignArchive(campaignId, (current) => ({ ...current, completedObjectiveIds: [...completedObjectiveIds] }));
}

export function saveCampaignHandoff(campaignId: string, handoffItems: LoreCueHandoffItem[]) {
  return updateCampaignArchive(campaignId, (current) => ({ ...current, handoffItems: clone(handoffItems) }));
}

export function saveCampaignDraft(
  campaignId: string,
  draftTitle: string,
  draftPlan: string,
  sessions: SessionSummary[],
  selectedSessionId: string,
  draftHandoffItems?: LoreCueHandoffItem[],
  draftPlayerKnownHandoffIds?: string[],
  draftAudienceReviewed?: boolean,
) {
  return updateCampaignArchive(campaignId, (current) => ({
    ...current,
    draftTitle,
    draftPlan,
    sessions: clone(sessions),
    selectedSessionId,
    draftHandoffItems: draftHandoffItems ? clone(draftHandoffItems) : current.draftHandoffItems,
    draftPlayerKnownHandoffIds: draftPlayerKnownHandoffIds
      ? [...draftPlayerKnownHandoffIds]
      : current.draftPlayerKnownHandoffIds,
    draftAudienceReviewed: typeof draftAudienceReviewed === "boolean"
      ? draftAudienceReviewed
      : current.draftAudienceReviewed,
  }));
}
