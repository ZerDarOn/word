"use client";

import { useState } from "react";
import type { CreativeProject } from "./creative_project_data";

type DossierTab = "公开资料" | "背景与经历" | "秘密与知情" | "规则属性";

interface CharacterRecord {
  name: string;
  role: string;
  publicIntroduction: string;
  background: string;
  motivation: string;
  characterArc: string;
  speechStyle: string;
  secret: string;
  gmNotes: string;
  knows: string;
  willingToTell: string;
  falseBelief: string;
  classLevel: string;
  species: string;
  alignment: string;
  abilities: Record<"力量" | "敏捷" | "体质" | "智力" | "感知" | "魅力", number>;
  armorClass: number;
  currentHp: number;
  maxHp: number;
  speed: number;
  proficiency: number;
  passivePerception: number;
}

const characterNames = ["伊芙琳", "斯诺森", "海曼", "莉奥娜", "老杰克"];

const initialCharacter: CharacterRecord = {
  name: "伊芙琳·马尔",
  role: "主要 NPC · 港务议会调查官",
  publicIntroduction: "谨慎而克制的港务官，相信正式档案比人的记忆更可靠。",
  background: "出生于萨菲港旧城区，青年时期曾跟随海曼学习航海记录。灰潮号失踪后进入港务议会，负责维护船员与货运档案。",
  motivation: "保护港务处的信誉，同时查清导师海曼失踪的真相。",
  characterArc: "从依赖记录，到承认记录也可能被权力篡改。",
  speechStyle: "句子简短，很少使用猜测性表达；紧张时会重复确认时间。",
  secret: "她在二十年前的名册涂改页上留下过自己的签名，但并不记得签名时发生了什么。",
  gmNotes: "不要主动提及海曼。玩家展示旧钥匙或指出时间矛盾后，她会停止回避。",
  knows: "斯诺森的工种与值班时间；海曼修改过一次名册；旧灯塔地下层仍有人维护。",
  willingToTell: "外貌和工种可以直接说；海曼相关信息需要获得信任；签名只在证据确凿时承认。",
  falseBelief: "她认为斯诺森主动参与了名册涂改。",
  classLevel: "调查官 4 / 游荡者 2",
  species: "人类",
  alignment: "守序中立",
  abilities: { 力量: 9, 敏捷: 14, 体质: 12, 智力: 16, 感知: 15, 魅力: 13 },
  armorClass: 14,
  currentHp: 31,
  maxHp: 31,
  speed: 30,
  proficiency: 3,
  passivePerception: 15,
};

interface CreativeCharacterDossierProps {
  project: CreativeProject;
  onFeedback: (message: string) => void;
}

export function CreativeCharacterDossier({ project, onFeedback }: CreativeCharacterDossierProps) {
  const [activeTab, setActiveTab] = useState<DossierTab>("公开资料");
  const [selectedCharacter, setSelectedCharacter] = useState(0);
  const [character, setCharacter] = useState(initialCharacter);

  function updateField<Key extends keyof CharacterRecord>(key: Key, value: CharacterRecord[Key]) {
    setCharacter((current) => ({ ...current, [key]: value }));
  }

  function handleSaveCharacter() {
    onFeedback(`已模拟保存“${character.name}”的角色档案；秘密与主持人笔记仍保持仅主持人可见。`);
  }

  return (
    <section className="character-workbench studio-board">
      <div className="studio-page-heading">
        <div>
          <span className="eyebrow">设定资料 · 角色档案</span>
          <h2>人物不仅是一段介绍</h2>
          <p>公开形象、人物经历、隐秘事实与规则数字各自保留清晰边界。</p>
        </div>
        <button onClick={() => onFeedback("已模拟新建一个空白角色档案。")}>＋ 新建角色</button>
      </div>

      <div className="character-layout character-layout-editable">
        <aside className="character-index" aria-label="角色列表">
          {characterNames.map((name, index) => (
            <button
              className={selectedCharacter === index ? "active" : ""}
              key={name}
              onClick={() => {
                setSelectedCharacter(index);
                onFeedback(`已切换到“${name}”的档案预览。`);
              }}
            >
              <span>{name.slice(0, 1)}</span>
              <strong>{name}</strong>
              <small>{index < 3 ? "主要角色" : "次要角色"}</small>
            </button>
          ))}
        </aside>

        <article className="character-dossier editable-dossier">
          <header>
            <div className="character-portrait" aria-label="角色立绘占位">{character.name.slice(0, 1)}</div>
            <div>
              <span>{character.role}</span>
              <h3>{character.name}</h3>
              <p>{project.rulesSystem ?? "系统无关"} · 最后编辑于刚刚</p>
            </div>
            <button className="dossier-save-button" onClick={handleSaveCharacter}>保存档案</button>
          </header>

          <nav className="dossier-tabs" aria-label="角色档案分区">
            {(["公开资料", "背景与经历", "秘密与知情", "规则属性"] as DossierTab[]).map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                aria-current={activeTab === tab ? "page" : undefined}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="dossier-form">
            {activeTab === "公开资料" && (
              <>
                <div className="visibility-heading">
                  <div><strong>玩家可见资料</strong><span>可进入玩家手册与公开检索</span></div>
                  <b className="visibility-badge player-visible">玩家可见</b>
                </div>
                <label>姓名<input value={character.name} onChange={(event) => updateField("name", event.target.value)} /></label>
                <label>身份与定位<input value={character.role} onChange={(event) => updateField("role", event.target.value)} /></label>
                <label className="full-field">公开介绍<textarea rows={4} value={character.publicIntroduction} onChange={(event) => updateField("publicIntroduction", event.target.value)} /></label>
                <label className="full-field">说话方式<textarea rows={3} value={character.speechStyle} onChange={(event) => updateField("speechStyle", event.target.value)} /></label>
              </>
            )}

            {activeTab === "背景与经历" && (
              <>
                <div className="visibility-heading">
                  <div><strong>作者工作资料</strong><span>默认不会自动公开给玩家</span></div>
                  <b className="visibility-badge author-visible">作者 / 主持人可见</b>
                </div>
                <label className="full-field">人物背景<textarea rows={6} value={character.background} onChange={(event) => updateField("background", event.target.value)} /></label>
                <label>当前动机<textarea rows={4} value={character.motivation} onChange={(event) => updateField("motivation", event.target.value)} /></label>
                <label>人物弧<textarea rows={4} value={character.characterArc} onChange={(event) => updateField("characterArc", event.target.value)} /></label>
              </>
            )}

            {activeTab === "秘密与知情" && (
              <>
                <div className="visibility-heading secret-heading">
                  <div><strong>隐秘资料区</strong><span>不会进入玩家视角 AI、玩家手册或公开导出</span></div>
                  <b className="visibility-badge gm-only">仅主持人可见</b>
                </div>
                <label className="full-field secret-field">角色秘密<textarea rows={4} value={character.secret} onChange={(event) => updateField("secret", event.target.value)} /></label>
                <label className="full-field secret-field">主持人笔记<textarea rows={4} value={character.gmNotes} onChange={(event) => updateField("gmNotes", event.target.value)} /></label>
                <label>他知道什么<textarea rows={4} value={character.knows} onChange={(event) => updateField("knows", event.target.value)} /></label>
                <label>愿意透露什么<textarea rows={4} value={character.willingToTell} onChange={(event) => updateField("willingToTell", event.target.value)} /></label>
                <label className="full-field">错误相信的事情<textarea rows={3} value={character.falseBelief} onChange={(event) => updateField("falseBelief", event.target.value)} /></label>
              </>
            )}

            {activeTab === "规则属性" && project.rulesSystem === "D&D 5e" && (
              <DndAttributes character={character} updateField={updateField} />
            )}

            {activeTab === "规则属性" && project.rulesSystem !== "D&D 5e" && (
              <div className="generic-attributes full-field">
                <span className="eyebrow">当前规则 · {project.rulesSystem ?? "系统无关"}</span>
                <h3>建立这个系统需要的属性组</h3>
                <p>这里将支持自定义数值、文本、勾选项与派生属性。切换到 D&D 5e 项目可查看完整属性页。</p>
                <button onClick={() => onFeedback("已模拟添加一个自定义属性。")}>＋ 添加自定义属性</button>
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function DndAttributes({
  character,
  updateField,
}: {
  character: CharacterRecord;
  updateField: <Key extends keyof CharacterRecord>(key: Key, value: CharacterRecord[Key]) => void;
}) {
  const abilityEntries = Object.entries(character.abilities) as Array<[keyof CharacterRecord["abilities"], number]>;
  const updateNumber = (key: keyof CharacterRecord, value: string) => {
    updateField(key, Number(value) as never);
  };

  return (
    <div className="dnd-sheet full-field">
      <div className="visibility-heading">
        <div><strong>D&D 5e 规则属性</strong><span>用于检定、遭遇与主持人咨询时的规则依据</span></div>
        <b className="visibility-badge author-visible">主持人可见</b>
      </div>
      <div className="dnd-identity-grid">
        <label>职业与等级<input value={character.classLevel} onChange={(event) => updateField("classLevel", event.target.value)} /></label>
        <label>种族<input value={character.species} onChange={(event) => updateField("species", event.target.value)} /></label>
        <label>阵营<input value={character.alignment} onChange={(event) => updateField("alignment", event.target.value)} /></label>
      </div>
      <div className="ability-grid">
        {abilityEntries.map(([ability, score]) => (
          <label key={ability}>
            <span>{ability}</span>
            <input
              type="number"
              value={score}
              onChange={(event) => updateField("abilities", { ...character.abilities, [ability]: Number(event.target.value) })}
            />
            <small>{Math.floor((score - 10) / 2) >= 0 ? "+" : ""}{Math.floor((score - 10) / 2)}</small>
          </label>
        ))}
      </div>
      <div className="combat-stat-grid">
        <label>护甲等级<input type="number" value={character.armorClass} onChange={(event) => updateNumber("armorClass", event.target.value)} /></label>
        <label>当前生命<input type="number" value={character.currentHp} onChange={(event) => updateNumber("currentHp", event.target.value)} /></label>
        <label>生命上限<input type="number" value={character.maxHp} onChange={(event) => updateNumber("maxHp", event.target.value)} /></label>
        <label>速度（尺）<input type="number" value={character.speed} onChange={(event) => updateNumber("speed", event.target.value)} /></label>
        <label>熟练加值<input type="number" value={character.proficiency} onChange={(event) => updateNumber("proficiency", event.target.value)} /></label>
        <label>被动察觉<input type="number" value={character.passivePerception} onChange={(event) => updateNumber("passivePerception", event.target.value)} /></label>
      </div>
    </div>
  );
}
