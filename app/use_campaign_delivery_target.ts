"use client";

import { useEffect, useState } from "react";
import { initialCampaignProjects, type CampaignProject } from "./campaign_project_data";
import { ensureCampaignCatalog, readCampaignArchive } from "./lorecue_campaign_store";
import { initialSessionSummaries, type SessionSummary } from "./session_archive_data";

function sessionsFor(campaignId: string) {
  return readCampaignArchive(campaignId)?.sessions ?? initialSessionSummaries;
}

export function useCampaignDeliveryTarget(templateTitle: string) {
  const [campaigns, setCampaigns] = useState<CampaignProject[]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCampaigns(ensureCampaignCatalog(initialCampaignProjects).filter((campaign) => campaign.templateTitle === templateTitle));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [templateTitle]);

  function selectCampaign(nextCampaignId: string) {
    setCampaignId(nextCampaignId);
    setSessions(nextCampaignId ? sessionsFor(nextCampaignId) : []);
    setSessionId("");
  }

  return {
    campaigns,
    campaignId,
    sessions,
    sessionId,
    selectedCampaign: campaigns.find((campaign) => campaign.id === campaignId),
    selectedSession: sessions.find((session) => session.id === sessionId),
    selectCampaign,
    selectSession: setSessionId,
  };
}
