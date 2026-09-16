"use client";

import { useEffect, useState } from "react";
import {
  LORECUE_ASSET_CATALOG_EVENT,
  readAssetsLinkedTo,
  type LoreCueAssetKind,
  type LoreCueAssetRecord,
} from "./lorecue_asset_store";

export function useProjectAssets(projectId: string, kinds?: LoreCueAssetKind[]) {
  const [assets, setAssets] = useState<LoreCueAssetRecord[]>([]);
  const kindKey = kinds?.join("|") ?? "*";

  useEffect(() => {
    const allowedKinds = kindKey === "*" ? null : new Set(kindKey.split("|") as LoreCueAssetKind[]);
    const refresh = () => {
      const linked = readAssetsLinkedTo("creative", projectId);
      setAssets(allowedKinds ? linked.filter((asset) => allowedKinds.has(asset.kind)) : linked);
    };
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener(LORECUE_ASSET_CATALOG_EVENT, refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(LORECUE_ASSET_CATALOG_EVENT, refresh);
    };
  }, [kindKey, projectId]);

  return assets;
}
