export type GameSystem =
  | "D&D 5e"
  | "CoC 7e"
  | "CoJ"
  | "无限"
  | "系统无关"
  | "自定义";
export type CampaignStatus = "进行中" | "准备中" | "已归档";

export type CampaignProject = {
  id: string;
  name: string;
  runName: string;
  templateTitle: string;
  system: GameSystem;
  status: CampaignStatus;
  summary: string;
  playerCount: number;
  sessionCount: number;
  lastSession: string;
  nextSession: string;
  pendingReviews: number;
  currentStage: string;
};

export const initialCampaignProjects: CampaignProject[] = [
  {
    id: "saffi-old-friends",
    name: "萨菲港旧案 · 老友组",
    runName: "老友组",
    templateTitle: "萨菲港旧案",
    system: "D&D 5e",
    status: "进行中",
    summary: "五名调查者追查港口走私案，当前推进到第三幕的码头与值班名册。",
    playerCount: 5,
    sessionCount: 3,
    lastSession: "2026-07-29 · 码头追踪",
    nextSession: "待安排 · 灰潮号靠港",
    pendingReviews: 1,
    currentStage: "第三幕 · 港务处",
  },
  {
    id: "girls-school-weekend",
    name: "雾中女校 · 周末组",
    runName: "周末组",
    templateTitle: "雾中女校",
    system: "CoC 7e",
    status: "进行中",
    summary: "现代校园调查团，人物秘密较多，当前正在整理第二次团的目击证词。",
    playerCount: 4,
    sessionCount: 2,
    lastSession: "2026-07-26 · 封闭的旧校舍",
    nextSession: "2026-08-02 20:00",
    pendingReviews: 4,
    currentStage: "第二章 · 旧校舍",
  },
  {
    id: "broken-court-ravens",
    name: "断章法庭 · 灰鸦组",
    runName: "灰鸦组",
    templateTitle: "断章法庭",
    system: "CoJ",
    status: "准备中",
    summary: "以证言冲突和人物关系为核心的法庭短团，尚未正式开团。",
    playerCount: 3,
    sessionCount: 0,
    lastSession: "尚未开团",
    nextSession: "2026-08-08 19:30",
    pendingReviews: 0,
    currentStage: "团前准备 · 人物绑定",
  },
  {
    id: "saffi-beginners",
    name: "萨菲港旧案 · 新手组",
    runName: "新手组",
    templateTitle: "萨菲港旧案",
    system: "D&D 5e",
    status: "进行中",
    summary: "同一剧本模板的另一条独立跑团历史，目前仍停留在旅店调查阶段。",
    playerCount: 6,
    sessionCount: 1,
    lastSession: "2026-07-27 · 雨夜来客",
    nextSession: "2026-08-03 14:00",
    pendingReviews: 2,
    currentStage: "第一幕 · 旅店",
  },
  {
    id: "infinite-night-train",
    name: "永夜列车 · 试运行组",
    runName: "试运行组",
    templateTitle: "永夜列车",
    system: "无限",
    status: "准备中",
    summary: "跨世界任务型短团，每一站有独立场景规则与可回收的因果线索。",
    playerCount: 5,
    sessionCount: 0,
    lastSession: "尚未开团",
    nextSession: "待安排 · 零号车厢",
    pendingReviews: 0,
    currentStage: "团前准备 · 世界锚点",
  },
];

export const projectStructure = [
  { level: "规则系统", example: "D&D 5e", description: "规则、检定方式和角色卡格式" },
  { level: "剧本模板", example: "萨菲港旧案", description: "未经跑团改变的原始创作内容" },
  { level: "团项目", example: "萨菲港旧案 · 老友组", description: "某批玩家实际跑出的独立历史" },
  { level: "场次档案", example: "第 3 次团 · 码头追踪", description: "某一天实际说出和发生的事情" },
];
