"use client";

import { useEffect, useState } from "react";
import {
  ensureAssetUsageEnvelope,
  LORECUE_ASSET_USAGE_EVENT,
  type LoreCueAssetUsageEnvelope,
} from "./lorecue_asset_usage_store";

export function useProjectAssetUsage(projectId: string) {
  const [usage, setUsage] = useState<LoreCueAssetUsageEnvelope | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setUsage(ensureAssetUsageEnvelope(projectId)), 0);
    const syncUsage = (event: Event) => {
      const changedProjectId = event instanceof CustomEvent ? event.detail?.projectId : undefined;
      if (!changedProjectId || changedProjectId === projectId) setUsage(ensureAssetUsageEnvelope(projectId));
    };
    window.addEventListener(LORECUE_ASSET_USAGE_EVENT, syncUsage);
    window.addEventListener("storage", syncUsage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(LORECUE_ASSET_USAGE_EVENT, syncUsage);
      window.removeEventListener("storage", syncUsage);
    };
  }, [projectId]);

  return [usage, setUsage] as const;
}
