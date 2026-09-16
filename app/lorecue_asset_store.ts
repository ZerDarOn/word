export const LORECUE_ASSET_CATALOG_FORMAT = "lorecue-asset-catalog";
export const LORECUE_ASSET_CATALOG_VERSION = 1;
export const LORECUE_ASSET_DB_NAME = "lorecue-assets";
export const LORECUE_ASSET_DB_VERSION = 1;
export const LORECUE_ASSET_FILE_STORE = "files";

export type LoreCueAssetKind = "人物" | "地点" | "地图" | "立绘" | "BGM" | "规则" | "文档";
export type LoreCueAssetVisibility = "主持人私有" | "玩家可见" | "按场次解锁";
export type LoreCueAssetOwnerType = "公共资料" | "创作项目" | "团项目";
export type LoreCueAssetTargetType = "creative" | "campaign";

export interface LoreCueAssetLink {
  targetType: LoreCueAssetTargetType;
  targetId: string;
  targetLabel: string;
  linkedAt: string;
}

export interface LoreCueAssetRecord {
  id: string;
  kind: LoreCueAssetKind;
  title: string;
  description: string;
  ownerType: LoreCueAssetOwnerType;
  ownerId?: string;
  ownerLabel: string;
  visibility: LoreCueAssetVisibility;
  spoilerNote: string;
  provenance: string;
  importedAt: string;
  updatedAt: string;
  originalName?: string;
  mimeType?: string;
  sizeBytes?: number;
  hasBinary: boolean;
  links: LoreCueAssetLink[];
}

export interface LoreCueAssetCatalog {
  format: typeof LORECUE_ASSET_CATALOG_FORMAT;
  version: typeof LORECUE_ASSET_CATALOG_VERSION;
  updatedAt: string;
  assets: LoreCueAssetRecord[];
}

export interface LoreCueAssetTarget {
  targetType: LoreCueAssetTargetType;
  targetId: string;
  targetLabel: string;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function now() {
  return new Date().toISOString();
}

function isAssetLink(value: unknown): value is LoreCueAssetLink {
  if (!value || typeof value !== "object") return false;
  const link = value as Partial<LoreCueAssetLink>;
  return (link.targetType === "creative" || link.targetType === "campaign")
    && typeof link.targetId === "string"
    && typeof link.targetLabel === "string"
    && typeof link.linkedAt === "string";
}

function isAssetRecord(value: unknown): value is LoreCueAssetRecord {
  if (!value || typeof value !== "object") return false;
  const asset = value as Partial<LoreCueAssetRecord>;
  return typeof asset.id === "string"
    && ["人物", "地点", "地图", "立绘", "BGM", "规则", "文档"].includes(asset.kind ?? "")
    && typeof asset.title === "string"
    && typeof asset.description === "string"
    && ["公共资料", "创作项目", "团项目"].includes(asset.ownerType ?? "")
    && typeof asset.ownerLabel === "string"
    && ["主持人私有", "玩家可见", "按场次解锁"].includes(asset.visibility ?? "")
    && typeof asset.spoilerNote === "string"
    && typeof asset.provenance === "string"
    && typeof asset.importedAt === "string"
    && typeof asset.updatedAt === "string"
    && typeof asset.hasBinary === "boolean"
    && Array.isArray(asset.links)
    && asset.links.every(isAssetLink);
}

function readCatalog(): LoreCueAssetCatalog | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LORECUE_ASSET_CATALOG_FORMAT);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<LoreCueAssetCatalog>;
    if (value.format !== LORECUE_ASSET_CATALOG_FORMAT
      || value.version !== LORECUE_ASSET_CATALOG_VERSION
      || !Array.isArray(value.assets)
      || !value.assets.every(isAssetRecord)) return null;
    return {
      format: LORECUE_ASSET_CATALOG_FORMAT,
      version: LORECUE_ASSET_CATALOG_VERSION,
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : now(),
      assets: value.assets,
    };
  } catch {
    return null;
  }
}

function preserveUnreadableCatalog() {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(LORECUE_ASSET_CATALOG_FORMAT);
  if (!raw) return;
  try {
    window.localStorage.setItem(`${LORECUE_ASSET_CATALOG_FORMAT}:quarantine:${Date.now()}`, raw);
  } catch {
    // When quota is exhausted the unreadable source stays untouched.
  }
}

export function saveAssetCatalog(assets: LoreCueAssetRecord[]) {
  if (typeof window === "undefined") return;
  const catalog: LoreCueAssetCatalog = {
    format: LORECUE_ASSET_CATALOG_FORMAT,
    version: LORECUE_ASSET_CATALOG_VERSION,
    updatedAt: now(),
    assets: clone(assets),
  };
  window.localStorage.setItem(LORECUE_ASSET_CATALOG_FORMAT, JSON.stringify(catalog));
}

export function ensureAssetCatalog(initialAssets: LoreCueAssetRecord[]) {
  if (typeof window === "undefined") return clone(initialAssets);
  const existing = readCatalog();
  if (existing) {
    const knownIds = new Set(existing.assets.map((asset) => asset.id));
    const missingDefaults = initialAssets.filter((asset) => !knownIds.has(asset.id));
    const merged = [...existing.assets, ...clone(missingDefaults)];
    if (missingDefaults.length > 0) saveAssetCatalog(merged);
    return merged;
  }
  if (window.localStorage.getItem(LORECUE_ASSET_CATALOG_FORMAT)) preserveUnreadableCatalog();
  saveAssetCatalog(initialAssets);
  return clone(initialAssets);
}

export function upsertAssetRecord(currentAssets: LoreCueAssetRecord[], asset: LoreCueAssetRecord) {
  const nextAssets = [asset, ...currentAssets.filter((item) => item.id !== asset.id)];
  saveAssetCatalog(nextAssets);
  return nextAssets;
}

export function setAssetTargetLink(
  currentAssets: LoreCueAssetRecord[],
  assetId: string,
  target: LoreCueAssetTarget,
  linked: boolean,
) {
  const nextAssets = currentAssets.map((asset) => {
    if (asset.id !== assetId) return asset;
    const withoutTarget = asset.links.filter((link) => !(
      link.targetType === target.targetType && link.targetId === target.targetId
    ));
    return {
      ...asset,
      updatedAt: now(),
      links: linked ? [{ ...target, linkedAt: now() }, ...withoutTarget] : withoutTarget,
    };
  });
  saveAssetCatalog(nextAssets);
  return nextAssets;
}

function openAssetDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("当前浏览器不支持 IndexedDB。"));
      return;
    }
    const request = indexedDB.open(LORECUE_ASSET_DB_NAME, LORECUE_ASSET_DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(LORECUE_ASSET_FILE_STORE)) {
        request.result.createObjectStore(LORECUE_ASSET_FILE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("无法打开素材文件仓。"));
  });
}

function runFileRequest<T>(
  mode: IDBTransactionMode,
  requestFactory: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openAssetDatabase().then((database) => new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(LORECUE_ASSET_FILE_STORE, mode);
    const request = requestFactory(transaction.objectStore(LORECUE_ASSET_FILE_STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("素材文件仓操作失败。"));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("素材文件仓事务失败。"));
    };
  }));
}

export function saveAssetBinary(assetId: string, file: Blob) {
  return runFileRequest("readwrite", (store) => store.put(file, assetId));
}

export function readAssetBinary(assetId: string) {
  return runFileRequest<Blob | undefined>("readonly", (store) => store.get(assetId));
}

export function deleteAssetBinary(assetId: string) {
  return runFileRequest("readwrite", (store) => store.delete(assetId));
}

export async function importAssetFile(
  currentAssets: LoreCueAssetRecord[],
  asset: LoreCueAssetRecord,
  file: File,
) {
  await saveAssetBinary(asset.id, file);
  try {
    return upsertAssetRecord(currentAssets, { ...asset, hasBinary: true });
  } catch (error) {
    await deleteAssetBinary(asset.id).catch(() => undefined);
    throw error;
  }
}
