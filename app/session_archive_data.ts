import type { RecordKind } from "./prototype_scenarios";

export type ReviewStatus = "待确认" | "客观事实" | "NPC 主张" | "仅本场" | "废弃";
export type SessionPhase = "团前简报" | "本场时间线" | "团后复盘";
export type TimelineKind = "剧本事实" | "玩家行动" | "主持人陈述" | "临场新编";

export type SessionRecord = {
  id: number;
  text: string;
  kind: RecordKind;
  scenario: string;
  status: ReviewStatus;
};

export const initialSessionRecords: SessionRecord[] = [
  {
    id: 1,
    text: "伊芙琳撒谎时左手出现轻微震颤。",
    kind: "happened",
    scenario: "临场加了一个紧张动作",
    status: "待确认",
  },
];

export type SessionSummary = {
  id: string;
  number: string;
  title: string;
  date: string;
  time: string;
  status: "已归档" | "进行中" | "草稿" | "待开团";
  active?: boolean;
};

export type TimelineEntry = {
  id: string;
  time: string;
  title: string;
  detail: string;
  kind: TimelineKind;
  source: string;
};

export type SessionSource = {
  id: string;
  title: string;
  detail: string;
  version: string;
  kind: "剧本" | "地图" | "角色" | "规则";
};

export type HistoricalSessionSnapshot = {
  recap: string;
  outcomes: string[];
  promotedFacts: string[];
  handoff: string;
};

export const initialSessionSummaries: SessionSummary[] = [
  {
    id: "session-1",
    number: "第 1 次团",
    title: "雨夜来客",
    date: "2026-07-12",
    time: "20:05—23:18",
    status: "已归档",
  },
  {
    id: "session-2",
    number: "第 2 次团",
    title: "失踪的账本",
    date: "2026-07-19",
    time: "19:58—23:42",
    status: "已归档",
  },
  {
    id: "session-3",
    number: "第 3 次团",
    title: "码头追踪",
    date: "2026-07-29",
    time: "20:00—23:30",
    status: "进行中",
    active: true,
  },
];

export const sessionTimeline: TimelineEntry[] = [
  {
    id: "timeline-1",
    time: "20:03",
    title: "调查者抵达萨菲港",
    detail: "众人在港务处与工头见面，确认斯诺森仍在三号码头当班。",
    kind: "剧本事实",
    source: "第三幕 · 第 34 段",
  },
  {
    id: "timeline-2",
    time: "20:17",
    title: "玩家决定等待换班",
    detail: "调查者放弃直接封锁码头，分别观察东侧工人门与临海栈桥。",
    kind: "玩家行动",
    source: "本场实际发生",
  },
  {
    id: "timeline-3",
    time: "20:26",
    title: "工头给出离场路线判断",
    detail: "工头认为卸货工通常会经过东侧更衣棚，但不能保证斯诺森也如此。",
    kind: "主持人陈述",
    source: "地图与轮班制度的合理推断",
  },
  {
    id: "timeline-4",
    time: "21:43",
    title: "伊芙琳左手轻微发抖",
    detail: "玩家质问值班名册时，主持人临场加入了一个紧张动作。",
    kind: "临场新编",
    source: "待团后确认",
  },
  {
    id: "timeline-5",
    time: "22:08",
    title: "旧版名册被发现",
    detail: "调查者在办公室抽屉中找到昨夜的旧版值班名册，伊芙琳的披露条件发生变化。",
    kind: "玩家行动",
    source: "本场实际发生",
  },
];

export const sessionSources: SessionSource[] = [
  {
    id: "source-script",
    title: "《萨菲港旧案》主持人稿",
    detail: "第三幕“码头追踪”及伊芙琳人物秘密",
    version: "v0.8 · 07-26",
    kind: "剧本",
  },
  {
    id: "source-map",
    title: "萨菲港分区图",
    detail: "三号码头、工人更衣棚与东侧门",
    version: "v2 · 已标注",
    kind: "地图",
  },
  {
    id: "source-characters",
    title: "调查者状态快照",
    detail: "5 名角色的伤势、资源和已知线索",
    version: "第 2 次团后",
    kind: "角色",
  },
  {
    id: "source-rules",
    title: "D&D 5e 团规",
    detail: "调查检定、协助与追逐场景补充规则",
    version: "2026-06 修订",
    kind: "规则",
  },
];

export const initialBrief =
  "承接上次找回的半页账本，调查者确认走私货物经萨菲港转运。本次从港务处问询开始，预计推进到追踪斯诺森、核对值班名册，并让玩家第一次接触“灰潮号”的船期异常。";

export const sessionObjectives = [
  { id: "objective-location", text: "确认斯诺森的位置和下班路线", complete: true },
  { id: "objective-roster", text: "发现值班名册存在两个版本", complete: true },
  { id: "objective-ship", text: "把线索自然指向“灰潮号”", complete: false },
  { id: "objective-choice", text: "保留抓捕、跟踪或放线三种选择", complete: false },
];

export const historicalSessionSnapshots: Record<string, HistoricalSessionSnapshot> = {
  "session-1": {
    recap:
      "调查者在暴雨夜接受委托，检查一名失踪报关员留下的房间，并从被撕毁的信封上辨认出萨菲港的旧印章。",
    outcomes: [
      "确认失踪者并非自行离开旅店",
      "取得一把寄存柜钥匙",
      "与港务秘书伊芙琳第一次见面",
    ],
    promotedFacts: [
      "萨菲港旧印章属于已经撤销的夜间货运组",
      "旅店老板确实见过一名穿灰色雨衣的访客",
    ],
    handoff: "寄存柜内缺失了一本账本，只留下带有三号码头编号的半页纸。",
  },
  "session-2": {
    recap:
      "调查者追查寄存柜和旧印章，在仓库区找回半页账本，并确认斯诺森曾替陌生船员搬运未登记货箱。",
    outcomes: [
      "找回账本的半页副本",
      "锁定码头工人斯诺森",
      "发现月末船期被人手写改动",
    ],
    promotedFacts: [
      "斯诺森在三号码头做固定班卸货工",
      "账本上的“灰潮”指向一艘尚未靠港的货船",
    ],
    handoff: "第 3 次团从港务处问询开始，目标是找到斯诺森并核对值班名册。",
  },
};
