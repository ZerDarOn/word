"use client";

import { useEffect, useState } from "react";
import {
  LORECUE_PROJECT_STORE_EVENT,
  readProjectConsultationsForSession,
  type LoreCueSessionConsultation,
} from "./lorecue_project_store";

export function useSessionConsultations(campaignId: string, sessionId: string) {
  const [consultations, setConsultations] = useState<LoreCueSessionConsultation[]>([]);

  useEffect(() => {
    if (!campaignId || !sessionId) {
      const clearTimer = window.setTimeout(() => setConsultations([]), 0);
      return () => window.clearTimeout(clearTimer);
    }
    const sync = () => setConsultations(readProjectConsultationsForSession(campaignId, sessionId));
    const timer = window.setTimeout(sync, 0);
    window.addEventListener(LORECUE_PROJECT_STORE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(LORECUE_PROJECT_STORE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [campaignId, sessionId]);

  return consultations;
}
