"use client";

import { useEffect, useState } from "react";
import {
  ensureAssetUsageEnvelope,
  type LoreCueAssetUsageEnvelope,
} from "./lorecue_asset_usage_store";

export function useProjectAssetUsage(projectId: string) {
  const [usage, setUsage] = useState<LoreCueAssetUsageEnvelope | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setUsage(ensureAssetUsageEnvelope(projectId)), 0);
    return () => window.clearTimeout(timer);
  }, [projectId]);

  return [usage, setUsage] as const;
}
