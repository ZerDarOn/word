"use client";

import { useEffect, useState } from "react";
import {
  LORECUE_ASSET_USAGE_EVENT,
  readAssetDeliveriesForSession,
  type LoreCueAssetDelivery,
} from "./lorecue_asset_usage_store";

export function useSessionAssetDeliveries(campaignId: string, sessionId: string) {
  const [deliveries, setDeliveries] = useState<LoreCueAssetDelivery[]>([]);

  useEffect(() => {
    const sync = () => setDeliveries(readAssetDeliveriesForSession(campaignId, sessionId));
    const timer = window.setTimeout(sync, 0);
    window.addEventListener(LORECUE_ASSET_USAGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(LORECUE_ASSET_USAGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [campaignId, sessionId]);

  return deliveries;
}
