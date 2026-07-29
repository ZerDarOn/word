export type ConsultationMode = "strict" | "minimal" | "rescue";
export type RecordKind = "spoken" | "happened";
export type ImpactLevel = "无新增设定" | "装饰性补充" | "行动性影响" | "结构性影响";

export type SourceItem = {
  title: string;
  excerpt: string;
  location: string;
};

export type PrototypeScenario = {
  id: string;
  validationLabel: "明确答案" | "合理推断" | "临场新编" | "泄密风险" | "团后确认";
  title: string;
  situation: string;
  question: string;
  answer: string;
  evidenceLabel: "原文明确" | "合理推断" | "暂无依据";
  wordingLabel: "原文摘录" | "AI 拟词" | "AI 新编";
  impactLabel: ImpactLevel;
  disclosure: string;
  risk: string;
  assumptions: string[];
  sources: SourceItem[];
  alternatives: string[];
  requiresCreation: boolean;
  recordKind: RecordKind;
  recordSummary: string;
  quickGoals: string[];
};

export const prototypeScenarios: PrototypeScenario[] = [
  {
    id: "exact",
    validationLabel: "明确答案",
    title: "斯诺森现在在哪？",
    situation: "玩家追问嫌疑人的去向和下班时间。",
    question: "斯诺森现在在哪？几点下班？",
    answer: "他正在萨菲港三号码头卸货。照工头给出的轮班表，再过约二十分钟就会下班。",
    evidenceLabel: "原文明确",
    wordingLabel: "AI 拟词",
    impactLabel: "无新增设定",
    disclosure: "工头知道，也愿意直接告诉调查者。",
    risk: "低风险：地点与班次均有剧本依据，但这句话本身不是原文台词。",
    assumptions: [],
    sources: [
      {
        title: "第三幕：码头追踪",
        excerpt: "斯诺森在萨菲港三号码头做卸货工，调查者抵达时距换班尚有二十分钟。",
        location: "剧本正文 · 第 34 段",
      },
    ],
    alternatives: [
      "“三号码头。你们动作快些，换班铃一响，人就不好找了。”",
      "直接给出位置与二十分钟倒计时，不代入 NPC 口吻。",
    ],
    requiresCreation: false,
    recordKind: "spoken",
    recordSummary: "工头告知：斯诺森在三号码头，约二十分钟后下班。",
    quickGoals: ["简短回答", "强调时间", "只给事实"],
  },
  {
    id: "inference",
    validationLabel: "合理推断",
    title: "他会从哪个门离开？",
    situation: "玩家准备在斯诺森下班路线上伏击。",
    question: "他下班一般从哪里走？",
    answer: "比较可能走东侧工人门：卸货区离那里最近，轮班表也把更衣棚标在东侧。但剧本没有写死他的路线。",
    evidenceLabel: "合理推断",
    wordingLabel: "AI 拟词",
    impactLabel: "行动性影响",
    disclosure: "工头可根据工作经验作出判断，但不能保证。",
    risk: "会影响玩家的抓捕路线。若采用，建议记录为“本场成立的路线判断”。",
    assumptions: ["斯诺森按常规换衣离场", "当晚东侧工人门没有临时封闭"],
    sources: [
      {
        title: "萨菲港平面图",
        excerpt: "三号码头卸货区、工人更衣棚与东侧门相邻。",
        location: "地图注记 · 区域 C3—C5",
      },
      {
        title: "码头轮班制度",
        excerpt: "卸货工在换班前需将工牌交回更衣棚。",
        location: "背景资料 · 码头制度",
      },
    ],
    alternatives: [
      "让工头说“多数卸货工走东门”，保留斯诺森例外的可能。",
      "不给结论，只提示调查者可以观察更衣棚和两个出口。",
    ],
    requiresCreation: false,
    recordKind: "happened",
    recordSummary: "斯诺森按常规从东侧工人门离场。",
    quickGoals: ["不保证", "给调查法", "控制影响"],
  },
  {
    id: "creation",
    validationLabel: "临场新编",
    title: "随口问了一个没写的工友",
    situation: "玩家突然要找斯诺森最熟悉的工友。",
    question: "他在码头跟谁关系最好？",
    answer: "现有资料没有写这名工友。稳妥做法是让工头提供一位“同班工友”，先不命名、不赋予新线索；如果你需要，我可以新编一位并明确标记。",
    evidenceLabel: "暂无依据",
    wordingLabel: "AI 新编",
    impactLabel: "装饰性补充",
    disclosure: "不能从既有资料判断谁与斯诺森最亲近。",
    risk: "新角色一旦能提供关键证词，就会升级为行动性甚至结构性新增设定。",
    assumptions: [],
    sources: [],
    alternatives: [
      "新编：同班工友“托马斯”，寡言，只知道斯诺森近来常独自离开。",
      "改成群体询问：花十分钟走访工友，成功后获得一条既有线索。",
    ],
    requiresCreation: true,
    recordKind: "spoken",
    recordSummary: "新增同班工友托马斯；目前仅作为装饰性联系人。",
    quickGoals: ["不新增人物", "安全新编", "转为调查"],
  },
  {
    id: "secrecy",
    validationLabel: "泄密风险",
    title: "知情 NPC 被问到名册",
    situation: "玩家当面质问港务秘书伊芙琳。",
    question: "昨晚是不是你改了值班名册？",
    answer: "伊芙琳知道答案，但她会隐藏。她可以先确认手续问题，而不是回答事实：“这份名册已经盖章。你们凭什么认为它被改过？”",
    evidenceLabel: "原文明确",
    wordingLabel: "AI 拟词",
    impactLabel: "无新增设定",
    disclosure: "知道：是。披露意愿：极低。除非玩家拿出旧版名册，否则不会承认。",
    risk: "避免写“她下意识看向抽屉”等额外破绽；那会替玩家免费制造线索。",
    assumptions: [],
    sources: [
      {
        title: "伊芙琳 · 人物秘密",
        excerpt: "伊芙琳受命替换昨夜值班名册，并把旧版锁在办公室抽屉中。",
        location: "NPC 档案 · 仅主持人",
      },
      {
        title: "伊芙琳 · 应对原则",
        excerpt: "遭到试探时反问证据；见到旧版名册后才会动摇。",
        location: "NPC 档案 · 扮演提示",
      },
    ],
    alternatives: [
      "冷淡：“港务处不靠猜测办事。拿证据来。”",
      "拖延：“我可以替你们查归档记录，明早再来。”",
    ],
    requiresCreation: false,
    recordKind: "spoken",
    recordSummary: "伊芙琳否认改动名册，并要求调查者出示证据。",
    quickGoals: ["不泄密", "撒谎", "拖延"],
  },
  {
    id: "adoption",
    validationLabel: "团后确认",
    title: "临场加了一个紧张动作",
    situation: "主持人已经说出一个剧本没有写的表演细节。",
    question: "我刚说伊芙琳撒谎时左手发抖，这要算设定吗？",
    answer: "先记为“本场已发生”：伊芙琳撒谎时左手轻微发抖。团后再决定它是稳定习惯、只在本场成立，还是废弃。",
    evidenceLabel: "暂无依据",
    wordingLabel: "AI 新编",
    impactLabel: "行动性影响",
    disclosure: "这个动作可能被玩家视为识破谎言的证据。",
    risk: "若升格为稳定习惯，后续所有相关场景都要保持一致；不要悄悄混入原始人物卡。",
    assumptions: [],
    sources: [],
    alternatives: [
      "仅本场：解释为疲劳或寒冷，不形成稳定识别规则。",
      "升格设定：伊芙琳承受强压时左手会出现轻微震颤。",
    ],
    requiresCreation: true,
    recordKind: "happened",
    recordSummary: "伊芙琳撒谎时左手出现轻微震颤。",
    quickGoals: ["仅本场", "升格设定", "避免误导"],
  },
];
