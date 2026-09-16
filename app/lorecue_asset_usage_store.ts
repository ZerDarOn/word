export const LORECUE_ASSET_USAGE_FORMAT = "lorecue-asset-usage";
export const LORECUE_ASSET_USAGE_VERSION = 1;
export const LORECUE_ASSET_USAGE_EVENT = "lorecue:asset-usage-changed";

export type LoreCueAssetUsageSurface = "map-node" | "encounter" | "player-attachment" | "player-handout";
export type LoreCueDeliveryStatus = "active" | "revoked";

export interface LoreCueAssetBinding {
  id: string;
  surface: LoreCueAssetUsageSurface;
  surfaceId: string;
  assetId: string;
  assetTitle: string;
  visibility: string;
  updatedAt: string;
}

export interface LoreCueAssetDelivery {
  id: string;
  surface: "player-attachment" | "player-handout";
  surfaceId: string;
  assetId?: string;
  assetTitle?: string;
  playerTitle: string;
  recipient: string;
  campaignId?: string;
  campaignTitle?: string;
  sessionId?: string;
  sessionLabel: string;
  version: string;
  deliveredAt: string;
  status: LoreCueDeliveryStatus;
  revokedAt?: string;
}

export interface LoreCueAssetUsageEnvelope {
  format: typeof LORECUE_ASSET_USAGE_FORMAT;
  version: typeof LORECUE_ASSET_USAGE_VERSION;
  projectId: string;
  updatedAt: string;
  bindings: LoreCueAssetBinding[];
  deliveries: LoreCueAssetDelivery[];
}

function storageKey(projectId: string) {
  return `${LORECUE_ASSET_USAGE_FORMAT}:${projectId}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function now() {
  return new Date().toISOString();
}

function createEnvelope(projectId: string): LoreCueAssetUsageEnvelope {
  return {
    format: LORECUE_ASSET_USAGE_FORMAT,
    version: LORECUE_ASSET_USAGE_VERSION,
    projectId,
    updatedAt: now(),
    bindings: [],
    deliveries: [],
  };
}

function isBinding(value: unknown): value is LoreCueAssetBinding {
  if (!value || typeof value !== "object") return false;
  const binding = value as Partial<LoreCueAssetBinding>;
  return typeof binding.id === "string"
    && ["map-node", "encounter", "player-attachment", "player-handout"].includes(binding.surface ?? "")
    && typeof binding.surfaceId === "string"
    && typeof binding.assetId === "string"
    && typeof binding.assetTitle === "string"
    && typeof binding.visibility === "string"
    && typeof binding.updatedAt === "string";
}

function isDelivery(value: unknown): value is LoreCueAssetDelivery {
  if (!value || typeof value !== "object") return false;
  const delivery = value as Partial<LoreCueAssetDelivery>;
  return typeof delivery.id === "string"
    && (delivery.surface === "player-attachment" || delivery.surface === "player-handout")
    && typeof delivery.surfaceId === "string"
    && typeof delivery.playerTitle === "string"
    && typeof delivery.recipient === "string"
    && (delivery.campaignId === undefined || typeof delivery.campaignId === "string")
    && (delivery.campaignTitle === undefined || typeof delivery.campaignTitle === "string")
    && (delivery.sessionId === undefined || typeof delivery.sessionId === "string")
    && typeof delivery.sessionLabel === "string"
    && typeof delivery.version === "string"
    && typeof delivery.deliveredAt === "string"
    && (delivery.status === "active" || delivery.status === "revoked");
}

export function readAssetUsageEnvelope(projectId: string): LoreCueAssetUsageEnvelope | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(projectId));
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<LoreCueAssetUsageEnvelope>;
    if (value.format !== LORECUE_ASSET_USAGE_FORMAT
      || value.version !== LORECUE_ASSET_USAGE_VERSION
      || value.projectId !== projectId
      || !Array.isArray(value.bindings)
      || !value.bindings.every(isBinding)
      || !Array.isArray(value.deliveries)
      || !value.deliveries.every(isDelivery)) return null;
    return {
      ...createEnvelope(projectId),
      ...value,
      bindings: value.bindings,
      deliveries: value.deliveries,
    };
  } catch {
    return null;
  }
}

function preserveUnreadableEnvelope(projectId: string) {
  if (typeof window === "undefined") return;
  const key = storageKey(projectId);
  const raw = window.localStorage.getItem(key);
  if (!raw) return;
  try {
    window.localStorage.setItem(`${key}:quarantine:${Date.now()}`, raw);
  } catch {
    // Leave the original untouched when the recovery copy cannot be written.
  }
}

function writeEnvelope(envelope: LoreCueAssetUsageEnvelope) {
  if (typeof window === "undefined") return envelope;
  const next = { ...envelope, updatedAt: now() };
  window.localStorage.setItem(storageKey(envelope.projectId), JSON.stringify(next));
  window.dispatchEvent?.(new CustomEvent(LORECUE_ASSET_USAGE_EVENT, { detail: { projectId: envelope.projectId } }));
  return next;
}

export function ensureAssetUsageEnvelope(projectId: string) {
  const existing = readAssetUsageEnvelope(projectId);
  if (existing) return existing;
  if (typeof window !== "undefined" && window.localStorage.getItem(storageKey(projectId))) {
    preserveUnreadableEnvelope(projectId);
  }
  return writeEnvelope(createEnvelope(projectId));
}

export function saveAssetBinding(projectId: string, binding: Omit<LoreCueAssetBinding, "id" | "updatedAt">) {
  const current = ensureAssetUsageEnvelope(projectId);
  const id = `${binding.surface}:${binding.surfaceId}`;
  const nextBinding: LoreCueAssetBinding = { ...binding, id, updatedAt: now() };
  const bindings = [nextBinding, ...current.bindings.filter((item) => item.id !== id)];
  return writeEnvelope({ ...current, bindings });
}

export function removeAssetBinding(projectId: string, surface: LoreCueAssetUsageSurface, surfaceId: string) {
  const current = ensureAssetUsageEnvelope(projectId);
  const id = `${surface}:${surfaceId}`;
  return writeEnvelope({ ...current, bindings: current.bindings.filter((binding) => binding.id !== id) });
}

export function addAssetDelivery(projectId: string, delivery: Omit<LoreCueAssetDelivery, "id" | "deliveredAt" | "status">) {
  const current = ensureAssetUsageEnvelope(projectId);
  const nextDelivery: LoreCueAssetDelivery = {
    ...clone(delivery),
    id: `delivery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    deliveredAt: now(),
    status: "active",
  };
  return writeEnvelope({ ...current, deliveries: [nextDelivery, ...current.deliveries].slice(0, 100) });
}

export function revokeAssetDelivery(projectId: string, deliveryId: string) {
  const current = ensureAssetUsageEnvelope(projectId);
  const deliveries = current.deliveries.map((delivery) => delivery.id === deliveryId
    ? { ...delivery, status: "revoked" as const, revokedAt: now() }
    : delivery);
  return writeEnvelope({ ...current, deliveries });
}

export function readAssetDeliveriesForSession(campaignId: string, sessionId: string) {
  if (typeof window === "undefined") return [] as LoreCueAssetDelivery[];
  const prefix = `${LORECUE_ASSET_USAGE_FORMAT}:`;
  const deliveries: LoreCueAssetDelivery[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(prefix) || key.includes(":quarantine:")) continue;
    const projectId = key.slice(prefix.length);
    const envelope = readAssetUsageEnvelope(projectId);
    if (!envelope) continue;
    deliveries.push(...envelope.deliveries.filter((delivery) => delivery.campaignId === campaignId && delivery.sessionId === sessionId));
  }
  return deliveries.sort((left, right) => right.deliveredAt.localeCompare(left.deliveredAt));
}
