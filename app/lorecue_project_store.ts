import type { CreativeProject } from "./creative_project_data";

export const LORECUE_PROJECT_STORE_FORMAT = "lorecue-project-store";
export const LORECUE_PROJECT_STORE_VERSION = 1;
export const LORECUE_PROJECT_CATALOG_FORMAT = "lorecue-project-catalog";
export const LORECUE_PROJECT_STORE_EVENT = "lorecue-project-store-change";

export interface LoreCueStoredWritingMetadata {
  status: "草稿" | "修订中" | "定稿";
  pov: string;
  location: string;
  timeline: string;
}

export interface LoreCueStoredDocument {
  id: string;
  group: string;
  title: string;
  body: string;
  updatedAt: string;
  note?: string;
  metadata?: LoreCueStoredWritingMetadata;
  archived?: boolean;
}

export interface LoreCueStoredSnapshot {
  id: string;
  label: string;
  createdAt: string;
  reason: string;
  documents: LoreCueStoredDocument[];
}

export interface LoreCueConsultationRecord {
  id: string;
  mode: "查设定" | "创作协作" | "冲突检查" | "GM 救场";
  speaker: string;
  question: string;
  answer?: string;
  sourceLabels: string[];
  includesLiveContext: boolean;
  liveContext?: string;
  campaignId?: string;
  campaignTitle?: string;
  sessionId?: string;
  sessionLabel?: string;
  includesPlayerDisclosures?: boolean;
  playerDisclosures?: Array<{
    deliveryId: string;
    title: string;
    status: "active" | "revoked";
  }>;
  createdAt: string;
  status: "pending" | "reviewed";
}

export interface LoreCueSessionConsultation extends LoreCueConsultationRecord {
  projectId: string;
}

export interface LoreCueRecoveryPoint {
  id: string;
  kind: "pre-import" | "manual";
  label: string;
  createdAt: string;
  documents: LoreCueStoredDocument[];
}

export interface LoreCueProjectEnvelope {
  format: typeof LORECUE_PROJECT_STORE_FORMAT;
  version: typeof LORECUE_PROJECT_STORE_VERSION;
  projectId: string;
  updatedAt: string;
  documents: LoreCueStoredDocument[];
  snapshots: LoreCueStoredSnapshot[];
  consultations: LoreCueConsultationRecord[];
  recoveryPoints: LoreCueRecoveryPoint[];
  migratedFromLegacyAt?: string;
}

interface EnsureProjectOptions {
  initialDocuments?: LoreCueStoredDocument[];
  initialSnapshots?: LoreCueStoredSnapshot[];
  legacyConsultationScope?: string;
}

export interface EnsureProjectResult {
  envelope: LoreCueProjectEnvelope;
  source: "existing" | "legacy" | "initial";
}

export interface LoreCueProjectCatalog {
  format: typeof LORECUE_PROJECT_CATALOG_FORMAT;
  version: typeof LORECUE_PROJECT_STORE_VERSION;
  updatedAt: string;
  projects: CreativeProject[];
}

function projectStorageKey(projectId: string) {
  return `lorecue-project:${projectId}`;
}

function legacyWritingKey(projectId: string) {
  return `lorecue-writing:${projectId}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isStoredDocument(value: unknown): value is LoreCueStoredDocument {
  if (!value || typeof value !== "object") return false;
  const document = value as Partial<LoreCueStoredDocument>;
  return [document.id, document.group, document.title, document.body, document.updatedAt]
    .every((field) => typeof field === "string");
}

function isStoredSnapshot(value: unknown): value is LoreCueStoredSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<LoreCueStoredSnapshot>;
  return typeof snapshot.id === "string"
    && typeof snapshot.label === "string"
    && typeof snapshot.createdAt === "string"
    && typeof snapshot.reason === "string"
    && Array.isArray(snapshot.documents)
    && snapshot.documents.every(isStoredDocument);
}

function normalizeConsultation(value: unknown): LoreCueConsultationRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<LoreCueConsultationRecord>;
  if (typeof record.id !== "string" || typeof record.question !== "string") return null;
  if (record.status !== "pending" && record.status !== "reviewed") return null;
  const allowedModes = ["查设定", "创作协作", "冲突检查", "GM 救场"];
  const playerDisclosures = Array.isArray(record.playerDisclosures)
    ? record.playerDisclosures.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const disclosure = item as { deliveryId?: unknown; title?: unknown; status?: unknown };
        if (typeof disclosure.deliveryId !== "string"
          || typeof disclosure.title !== "string"
          || (disclosure.status !== "active" && disclosure.status !== "revoked")) return [];
        return [{
          deliveryId: disclosure.deliveryId,
          title: disclosure.title,
          status: disclosure.status,
        }];
      })
    : [];
  return {
    id: record.id,
    mode: allowedModes.includes(record.mode ?? "") ? record.mode as LoreCueConsultationRecord["mode"] : "查设定",
    speaker: typeof record.speaker === "string" ? record.speaker : "不代入角色",
    question: record.question,
    answer: typeof record.answer === "string" ? record.answer : undefined,
    sourceLabels: Array.isArray(record.sourceLabels) ? record.sourceLabels.filter((item): item is string => typeof item === "string") : [],
    includesLiveContext: Boolean(record.includesLiveContext || record.liveContext),
    liveContext: typeof record.liveContext === "string" ? record.liveContext : undefined,
    campaignId: typeof record.campaignId === "string" ? record.campaignId : undefined,
    campaignTitle: typeof record.campaignTitle === "string" ? record.campaignTitle : undefined,
    sessionId: typeof record.sessionId === "string" ? record.sessionId : undefined,
    sessionLabel: typeof record.sessionLabel === "string" ? record.sessionLabel : undefined,
    includesPlayerDisclosures: Boolean(record.includesPlayerDisclosures || playerDisclosures.length > 0),
    playerDisclosures,
    createdAt: typeof record.createdAt === "string" ? record.createdAt : "未记录时间",
    status: record.status,
  };
}

function isRecoveryPoint(value: unknown): value is LoreCueRecoveryPoint {
  if (!value || typeof value !== "object") return false;
  const point = value as Partial<LoreCueRecoveryPoint>;
  return typeof point.id === "string"
    && (point.kind === "pre-import" || point.kind === "manual")
    && typeof point.label === "string"
    && typeof point.createdAt === "string"
    && Array.isArray(point.documents)
    && point.documents.every(isStoredDocument);
}

function parseArray<T>(raw: string | null, guard: (value: unknown) => value is T): T[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value) ? value.filter(guard) : [];
  } catch {
    return [];
  }
}

function createEmptyEnvelope(projectId: string): LoreCueProjectEnvelope {
  return {
    format: LORECUE_PROJECT_STORE_FORMAT,
    version: LORECUE_PROJECT_STORE_VERSION,
    projectId,
    updatedAt: new Date().toISOString(),
    documents: [],
    snapshots: [],
    consultations: [],
    recoveryPoints: [],
  };
}

export function readProjectEnvelope(projectId: string): LoreCueProjectEnvelope | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(projectStorageKey(projectId));
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<LoreCueProjectEnvelope>;
    if (value.format !== LORECUE_PROJECT_STORE_FORMAT
      || value.version !== LORECUE_PROJECT_STORE_VERSION
      || value.projectId !== projectId
      || !Array.isArray(value.documents)
      || !value.documents.every(isStoredDocument)
      || !Array.isArray(value.snapshots)
      || !value.snapshots.every(isStoredSnapshot)) return null;
    return {
      ...createEmptyEnvelope(projectId),
      ...value,
      documents: value.documents,
      snapshots: value.snapshots,
      consultations: Array.isArray(value.consultations)
        ? value.consultations.map(normalizeConsultation).filter((item): item is LoreCueConsultationRecord => Boolean(item))
        : [],
      recoveryPoints: Array.isArray(value.recoveryPoints) ? value.recoveryPoints.filter(isRecoveryPoint) : [],
    };
  } catch {
    return null;
  }
}

function writeProjectEnvelope(envelope: LoreCueProjectEnvelope) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(projectStorageKey(envelope.projectId), JSON.stringify({
    ...envelope,
    updatedAt: new Date().toISOString(),
  }));
  if (typeof window.dispatchEvent === "function" && typeof CustomEvent !== "undefined") {
    window.dispatchEvent(new CustomEvent(LORECUE_PROJECT_STORE_EVENT, {
      detail: { projectId: envelope.projectId },
    }));
  }
}

function preserveUnreadableStore(projectId: string) {
  if (typeof window === "undefined") return;
  const key = projectStorageKey(projectId);
  const raw = window.localStorage.getItem(key);
  if (!raw) return;
  try {
    window.localStorage.setItem(`lorecue-project-quarantine:${projectId}:${Date.now()}`, raw);
  } catch {
    // If storage quota is already exhausted, leave the original value untouched.
  }
}

export function ensureProjectEnvelope(projectId: string, options: EnsureProjectOptions = {}): EnsureProjectResult {
  if (typeof window === "undefined") {
    return {
      envelope: {
        ...createEmptyEnvelope(projectId),
        documents: clone(options.initialDocuments ?? []),
        snapshots: clone(options.initialSnapshots ?? []),
      },
      source: "initial",
    };
  }

  const existing = readProjectEnvelope(projectId);
  const legacyConsultations = options.legacyConsultationScope
    ? parseArray(
        window.localStorage.getItem(`lorecue-ai-consultations:${options.legacyConsultationScope}`),
        (value): value is LoreCueConsultationRecord => normalizeConsultation(value) !== null,
      ).map((value) => normalizeConsultation(value) as LoreCueConsultationRecord)
    : [];

  if (existing) {
    const merged: LoreCueProjectEnvelope = {
      ...existing,
      documents: existing.documents.length > 0 ? existing.documents : clone(options.initialDocuments ?? []),
      snapshots: existing.snapshots.length > 0 ? existing.snapshots : clone(options.initialSnapshots ?? []),
      consultations: existing.consultations.length > 0 ? existing.consultations : legacyConsultations,
    };
    writeProjectEnvelope(merged);
    return { envelope: merged, source: "existing" };
  }

  const rawUnified = window.localStorage.getItem(projectStorageKey(projectId));
  if (rawUnified) preserveUnreadableStore(projectId);
  const legacyDocuments = parseArray(window.localStorage.getItem(legacyWritingKey(projectId)), isStoredDocument);
  const legacySnapshots = parseArray(window.localStorage.getItem(`${legacyWritingKey(projectId)}:snapshots`), isStoredSnapshot);
  const legacyPreImport = parseArray(window.localStorage.getItem(`${legacyWritingKey(projectId)}:pre-import`), isStoredDocument);
  const hasLegacy = legacyDocuments.length > 0 || legacySnapshots.length > 0 || legacyConsultations.length > 0 || legacyPreImport.length > 0;
  const envelope: LoreCueProjectEnvelope = {
    ...createEmptyEnvelope(projectId),
    documents: legacyDocuments.length > 0 ? legacyDocuments : clone(options.initialDocuments ?? []),
    snapshots: legacySnapshots.length > 0 ? legacySnapshots : clone(options.initialSnapshots ?? []),
    consultations: legacyConsultations,
    recoveryPoints: legacyPreImport.length > 0 ? [{
      id: `${projectId}-legacy-pre-import`,
      kind: "pre-import",
      label: "旧版导入前状态",
      createdAt: "从旧版浏览器存储迁移",
      documents: legacyPreImport,
    }] : [],
    migratedFromLegacyAt: hasLegacy ? new Date().toISOString() : undefined,
  };
  writeProjectEnvelope(envelope);
  return { envelope, source: hasLegacy ? "legacy" : "initial" };
}

function updateProjectEnvelope(
  projectId: string,
  update: (current: LoreCueProjectEnvelope) => LoreCueProjectEnvelope,
) {
  const current = readProjectEnvelope(projectId) ?? createEmptyEnvelope(projectId);
  const next = update(current);
  writeProjectEnvelope(next);
  return next;
}

export function saveProjectDocuments(projectId: string, documents: LoreCueStoredDocument[]) {
  return updateProjectEnvelope(projectId, (current) => ({ ...current, documents: clone(documents) }));
}

export function saveProjectSnapshots(projectId: string, snapshots: LoreCueStoredSnapshot[]) {
  return updateProjectEnvelope(projectId, (current) => ({ ...current, snapshots: clone(snapshots) }));
}

export function saveProjectConsultations(projectId: string, consultations: LoreCueConsultationRecord[]) {
  return updateProjectEnvelope(projectId, (current) => ({ ...current, consultations: clone(consultations).slice(0, 50) }));
}

export function readProjectConsultationsForSession(campaignId: string, sessionId: string) {
  if (typeof window === "undefined") return [] as LoreCueSessionConsultation[];
  const prefix = "lorecue-project:";
  const consultations: LoreCueSessionConsultation[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(prefix)) continue;
    const projectId = key.slice(prefix.length);
    const envelope = readProjectEnvelope(projectId);
    if (!envelope) continue;
    consultations.push(...envelope.consultations
      .filter((consultation) => consultation.campaignId === campaignId && consultation.sessionId === sessionId)
      .map((consultation) => ({ ...consultation, projectId })));
  }
  return consultations.sort((left, right) => {
    const leftId = Number(left.id);
    const rightId = Number(right.id);
    if (Number.isFinite(leftId) && Number.isFinite(rightId)) return rightId - leftId;
    return right.createdAt.localeCompare(left.createdAt);
  });
}

export function updateProjectConsultationStatus(
  projectId: string,
  consultationId: string,
  status: LoreCueConsultationRecord["status"],
) {
  return updateProjectEnvelope(projectId, (current) => ({
    ...current,
    consultations: current.consultations.map((consultation) => consultation.id === consultationId
      ? { ...consultation, status }
      : consultation),
  }));
}

export function addProjectRecoveryPoint(projectId: string, recoveryPoint: LoreCueRecoveryPoint) {
  return updateProjectEnvelope(projectId, (current) => ({
    ...current,
    recoveryPoints: [clone(recoveryPoint), ...current.recoveryPoints].slice(0, 8),
  }));
}

function isCreativeProject(value: unknown): value is CreativeProject {
  if (!value || typeof value !== "object") return false;
  const project = value as Partial<CreativeProject>;
  return typeof project.id === "string"
    && typeof project.title === "string"
    && typeof project.summary === "string"
    && typeof project.progress === "string"
    && typeof project.updatedAt === "string"
    && typeof project.documentCount === "number"
    && typeof project.warningCount === "number"
    && ["小说", "影视剧本", "跑团模组", "世界观"].includes(project.kind ?? "");
}

function readProjectCatalog(): LoreCueProjectCatalog | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LORECUE_PROJECT_CATALOG_FORMAT);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<LoreCueProjectCatalog>;
    if (value.format !== LORECUE_PROJECT_CATALOG_FORMAT
      || value.version !== LORECUE_PROJECT_STORE_VERSION
      || !Array.isArray(value.projects)
      || !value.projects.every(isCreativeProject)) return null;
    return {
      format: LORECUE_PROJECT_CATALOG_FORMAT,
      version: LORECUE_PROJECT_STORE_VERSION,
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString(),
      projects: value.projects,
    };
  } catch {
    return null;
  }
}

export function saveProjectCatalog(projects: CreativeProject[]) {
  if (typeof window === "undefined") return;
  const catalog: LoreCueProjectCatalog = {
    format: LORECUE_PROJECT_CATALOG_FORMAT,
    version: LORECUE_PROJECT_STORE_VERSION,
    updatedAt: new Date().toISOString(),
    projects: clone(projects),
  };
  window.localStorage.setItem(LORECUE_PROJECT_CATALOG_FORMAT, JSON.stringify(catalog));
}

export function ensureProjectCatalog(initialProjects: CreativeProject[]) {
  if (typeof window === "undefined") return clone(initialProjects);
  const existing = readProjectCatalog();
  if (existing) {
    const knownIds = new Set(existing.projects.map((project) => project.id));
    const missingDefaults = initialProjects.filter((project) => !knownIds.has(project.id));
    const merged = [...existing.projects, ...missingDefaults];
    if (missingDefaults.length > 0) saveProjectCatalog(merged);
    return merged;
  }

  const raw = window.localStorage.getItem(LORECUE_PROJECT_CATALOG_FORMAT);
  if (raw) {
    try {
      window.localStorage.setItem(`lorecue-project-catalog-quarantine:${Date.now()}`, raw);
    } catch {
      // Keep the unreadable catalog in place when the browser cannot create a recovery copy.
    }
  }
  saveProjectCatalog(initialProjects);
  return clone(initialProjects);
}
