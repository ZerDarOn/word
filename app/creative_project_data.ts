export type CreativeKind = "小说" | "影视剧本" | "跑团模组" | "世界观";
export type CreativeRulesSystem = "系统无关" | "D&D 5e" | "CoC 7e" | "CoJ" | "无限" | "自定义";
export type CreativeStudioView =
  | "项目总览"
  | "正文"
  | "大纲"
  | "故事树"
  | "故事节点"
  | "二维图"
  | "时间线"
  | "伏笔回收"
  | "角色档案"
  | "人物关系图"
  | "地点地图"
  | "组织阵营"
  | "物件线索"
  | "世界观"
  | "地图素材"
  | "角色立绘"
  | "BGM 音效"
  | "玩家附件"
  | "一致性检查"
  | "版本"
  | "主持人真相"
  | "场景节点"
  | "线索网络"
  | "NPC 知情与披露"
  | "地图与遭遇"
  | "结局分支"
  | "玩家手册";

export interface CreativeNavigationGroup {
  id: string;
  label: string;
  moduleOnly?: boolean;
  items: Array<{
    view: CreativeStudioView;
    shortLabel: string;
    count?: number;
  }>;
}

export const creativeNavigationGroups: CreativeNavigationGroup[] = [
  {
    id: "project",
    label: "项目",
    items: [{ view: "项目总览", shortLabel: "总", count: 1 }],
  },
  {
    id: "writing",
    label: "内容创作",
    items: [
      { view: "正文", shortLabel: "文", count: 28 },
      { view: "大纲", shortLabel: "纲", count: 4 },
    ],
  },
  {
    id: "structure",
    label: "故事结构",
    items: [
      { view: "故事树", shortLabel: "树", count: 14 },
      { view: "故事节点", shortLabel: "点", count: 23 },
      { view: "二维图", shortLabel: "图", count: 2 },
      { view: "时间线", shortLabel: "时", count: 18 },
      { view: "伏笔回收", shortLabel: "伏", count: 7 },
    ],
  },
  {
    id: "lore",
    label: "设定资料",
    items: [
      { view: "角色档案", shortLabel: "角", count: 12 },
      { view: "人物关系图", shortLabel: "系", count: 3 },
      { view: "地点地图", shortLabel: "地", count: 9 },
      { view: "组织阵营", shortLabel: "组", count: 5 },
      { view: "物件线索", shortLabel: "物", count: 16 },
      { view: "世界观", shortLabel: "界", count: 21 },
    ],
  },
  {
    id: "media",
    label: "视觉与媒体",
    items: [
      { view: "地图素材", shortLabel: "图", count: 6 },
      { view: "角色立绘", shortLabel: "绘", count: 8 },
      { view: "BGM 音效", shortLabel: "声", count: 12 },
      { view: "玩家附件", shortLabel: "附", count: 4 },
    ],
  },
  {
    id: "module",
    label: "主持人模组",
    moduleOnly: true,
    items: [
      { view: "主持人真相", shortLabel: "真", count: 1 },
      { view: "场景节点", shortLabel: "景", count: 11 },
      { view: "线索网络", shortLabel: "索", count: 18 },
      { view: "NPC 知情与披露", shortLabel: "知", count: 9 },
      { view: "地图与遭遇", shortLabel: "战", count: 7 },
      { view: "结局分支", shortLabel: "结", count: 4 },
      { view: "玩家手册", shortLabel: "玩", count: 3 },
    ],
  },
  {
    id: "quality",
    label: "检查与管理",
    items: [
      { view: "一致性检查", shortLabel: "检", count: 6 },
      { view: "版本", shortLabel: "版", count: 18 },
    ],
  },
];

export interface CreativeProject {
  id: string;
  kind: CreativeKind;
  rulesSystem?: CreativeRulesSystem;
  title: string;
  summary: string;
  progress: string;
  updatedAt: string;
  documentCount: number;
  warningCount: number;
}

export interface CreativeProjectBlueprint {
  kind: CreativeKind;
  description: string;
  structureLabel: string;
  sections: string[];
}

export const projectBlueprints: CreativeProjectBlueprint[] = [
  {
    kind: "小说",
    description: "适合长篇、短篇与连载，围绕卷、章、场景和人物弧组织。",
    structureLabel: "卷 → 章 → 场景",
    sections: ["正文", "人物", "地点", "伏笔"],
  },
  {
    kind: "影视剧本",
    description: "按幕与场组织，保留内外景、时间、出场人物和对白节奏。",
    structureLabel: "幕 → 场 → 节拍",
    sections: ["场次", "人物", "场景", "道具"],
  },
  {
    kind: "跑团模组",
    description: "分开主持人真相、玩家可见线索、NPC 知情范围与场景节点。",
    structureLabel: "幕 → 场景 → 线索",
    sections: ["场景", "NPC", "线索", "规则"],
  },
  {
    kind: "世界观",
    description: "适合跨作品复用的地理、历史、组织、物种与规则设定。",
    structureLabel: "领域 → 条目 → 关系",
    sections: ["地点", "历史", "组织", "规则"],
  },
];

export const initialCreativeProjects: CreativeProject[] = [
  {
    id: "tide-letter",
    kind: "小说",
    title: "潮汐来信",
    summary: "一座退潮后才会出现的城市，与一封迟到二十年的信。",
    progress: "第二卷 · 第六章",
    updatedAt: "今天 14:32",
    documentCount: 28,
    warningCount: 2,
  },
  {
    id: "saffi-module",
    kind: "跑团模组",
    rulesSystem: "D&D 5e",
    title: "萨菲港旧案",
    summary: "港口走私案背后，是一条被抹去的船员名册。",
    progress: "第三幕 · 待打磨",
    updatedAt: "昨天 22:18",
    documentCount: 19,
    warningCount: 4,
  },
  {
    id: "glass-stage",
    kind: "影视剧本",
    title: "玻璃舞台",
    summary: "限定空间悬疑短片，六个人对同一场事故有六种版本。",
    progress: "第 17 场",
    updatedAt: "7 月 27 日",
    documentCount: 17,
    warningCount: 1,
  },
  {
    id: "north-world",
    kind: "世界观",
    title: "北境纪事",
    summary: "跨作品复用的地理、历法、宗教与组织设定集。",
    progress: "城市条目 · 43%",
    updatedAt: "7 月 25 日",
    documentCount: 64,
    warningCount: 7,
  },
];

export const documentTreeByKind: Record<
  CreativeKind,
  Array<{ group: string; items: string[] }>
> = {
  小说: [
    { group: "正文", items: ["序章 · 无潮之夜", "第一章 · 港务处", "第二章 · 旧名册"] },
    { group: "人物", items: ["伊芙琳 · 港务官", "斯诺森 · 装卸工", "海曼 · 失踪船长"] },
    { group: "地点", items: ["萨菲港", "灰潮号", "旧灯塔"] },
  ],
  影视剧本: [
    { group: "场次", items: ["01 · 空舞台 · 夜", "02 · 后台 · 连续", "03 · 观众席 · 晨"] },
    { group: "人物", items: ["林遥 · 主演", "周信 · 导演", "余弦 · 场务"] },
    { group: "道具", items: ["碎裂的奖杯", "缺页场记"] },
  ],
  跑团模组: [
    { group: "场景", items: ["开场 · 港务处", "节点 · 码头", "高潮 · 灰潮号"] },
    { group: "NPC", items: ["伊芙琳", "斯诺森", "海曼"] },
    { group: "线索", items: ["值班名册", "卸货记录", "旧船票"] },
  ],
  世界观: [
    { group: "地点", items: ["萨菲港", "北境", "无潮城"] },
    { group: "组织", items: ["港务议会", "灰鸦法庭", "守灯人"] },
    { group: "规则", items: ["退潮历", "真名契约", "航路禁忌"] },
  ],
};
