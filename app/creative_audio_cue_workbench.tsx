"use client";

import { useState } from "react";
import type { CreativeProject } from "./creative_project_data";

type AudioTab = "BGM 与音效总览" | "曲目档案" | "场景提示点" | "音效层" | "播放队列";
type AudioState = "就绪" | "待剪辑" | "缺少文件";

interface AudioCueRecord {
  title: string;
  publicTitle: string;
  kind: string;
  state: AudioState;
  scene: string;
  mood: string;
  loop: string;
  fade: string;
  cue: string;
  fallback: string;
}

const audioCues: AudioCueRecord[] = [
  {
    title: "码头 · 暗潮",
    publicTitle: "港区环境音乐",
    kind: "场景 BGM",
    state: "就绪",
    scene: "港务处 / 东码头",
    mood: "忙碌表象下的轻微不安；低沉弦乐与远处雾笛。",
    loop: "00:24 – 03:18",
    fade: "淡入 3 秒 · 淡出 5 秒",
    cue: "玩家离开港务处、第一次看到码头全景时由主持人手动触发。",
    fallback: "雨声与远处装卸环境音",
  },
  {
    title: "灯塔 · 空响",
    publicTitle: "旧建筑环境声",
    kind: "氛围循环",
    state: "待剪辑",
    scene: "旧灯塔 / 地下层",
    mood: "风声、金属摩擦和近似心跳的低频，不提前暗示海曼。",
    loop: "00:18 – 04:42",
    fade: "淡入 4 秒 · 场景切换交叉淡化 2 秒",
    cue: "进入灯塔后播放；打开地下铁门时叠加机械音效层。",
    fallback: "纯风声循环",
  },
  {
    title: "灰潮号 · 归来",
    publicTitle: "终幕音乐",
    kind: "事件 BGM",
    state: "就绪",
    scene: "灰潮号靠港 / 终幕",
    mood: "主题旋律的失真版本，从辨认不清逐渐变得完整。",
    loop: "不循环 · 04:28",
    fade: "淡入 1 秒 · 结局选择后淡出 8 秒",
    cue: "灰潮号真正出现在视野中时触发，而不是玩家第一次提到船名时。",
    fallback: "低频雾笛三次",
  },
  {
    title: "议会记录室 · 无声",
    publicTitle: "室内环境声",
    kind: "备用曲目",
    state: "缺少文件",
    scene: "议会档案室",
    mood: "纸张、壁炉和走廊脚步；不使用旋律。",
    loop: "待设置",
    fade: "淡入 2 秒",
    cue: "仅作为过渡场景备用，不自动加入播放队列。",
    fallback: "保持静音",
  },
];

const soundLayers = [
  { name: "远处雾笛", kind: "环境", trigger: "探索时钟推进到 3", volume: "35%", active: true },
  { name: "吊机警铃", kind: "事件", trigger: "码头发生公开冲突", volume: "55%", active: false },
  { name: "铁门机械回响", kind: "动作", trigger: "地下层入口被打开", volume: "60%", active: false },
  { name: "潮水上涨", kind: "环境", trigger: "遭遇区域 D 关闭", volume: "40%", active: false },
];

interface CreativeAudioCueWorkbenchProps {
  project: CreativeProject;
  onFeedback: (message: string) => void;
}

export function CreativeAudioCueWorkbench({ project, onFeedback }: CreativeAudioCueWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<AudioTab>("BGM 与音效总览");
  const [selectedTitle, setSelectedTitle] = useState(audioCues[0].title);
  const [draft, setDraft] = useState(audioCues[0]);
  const [playing, setPlaying] = useState<string | null>(null);
  const selected = audioCues.find((audio) => audio.title === selectedTitle) ?? audioCues[0];

  function selectAudio(audio: AudioCueRecord) {
    setSelectedTitle(audio.title);
    setDraft(audio);
    onFeedback(`已打开音频提示“${audio.title}”。`);
  }

  function updateDraft<Key extends keyof AudioCueRecord>(key: Key, value: AudioCueRecord[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function togglePlayback(title: string) {
    const next = playing === title ? null : title;
    setPlaying(next);
    onFeedback(next ? `已模拟手动播放“${title}”。` : `已模拟暂停“${title}”。`);
  }

  function handleSaveAudioCue() {
    onFeedback(`已模拟保存“${draft.title}”的提示点、循环区间与玩家端名称。`);
  }

  return (
    <section className="audio-cue-workbench studio-board">
      <div className="studio-page-heading">
        <div><span className="eyebrow">视觉与媒体 · BGM 音效</span><h2>音乐跟随主持人的判断，而不是偷听玩家</h2><p>系统提供容易触发的提示与队列，但所有播放、切换和叠加都由主持人主动确认。</p></div>
        <button onClick={() => onFeedback("已模拟导入一份音频文件。")}>＋ 导入音频</button>
      </div>

      <section className="audio-policy-banner"><strong>手动触发</strong><span>不会监听对话、语音或群聊，也不会因为识别到关键词自动播放。</span></section>
      <section className="audio-metrics" aria-label="BGM 与音效概况">
        <article><strong>12</strong><span>音频条目</span><small>BGM 5 · 环境 4 · 事件 3</small></article>
        <article><strong>9</strong><span>关联场景</span><small>允许一曲多场景复用</small></article>
        <article><strong>4</strong><span>音效层</span><small>可在 BGM 上独立开关</small></article>
        <article className="risk"><strong>2</strong><span>待处理</span><small>缺文件 1 · 循环爆音 1</small></article>
      </section>

      <div className="audio-layout">
        <aside className="audio-index">
          <header><strong>音频目录</strong><small>{audioCues.length} / 12</small></header>
          <nav aria-label="BGM 与音效列表">{audioCues.map((audio, index) => <button key={audio.title} className={selectedTitle === audio.title ? "active" : ""} onClick={() => selectAudio(audio)}><b>0{index + 1}</b><span><strong>{audio.title}</strong><small>{audio.kind} · {audio.scene}</small></span><em data-state={audio.state}>{audio.state}</em></button>)}</nav>
          <section className="now-playing"><span>{playing ? "正在模拟播放" : "当前静音"}</span><strong>{playing ?? "没有活动曲目"}</strong><div className={playing ? "playing-bars active" : "playing-bars"}><i /><i /><i /><i /></div><button disabled={!playing} onClick={() => playing && togglePlayback(playing)}>停止播放</button></section>
        </aside>

        <article className="audio-editor">
          <header><div><span>{selected.kind} · {selected.state}</span><h3>{selected.title}</h3><p>{selected.scene}</p></div><button onClick={handleSaveAudioCue}>保存音频提示</button></header>
          <nav className="entity-tabs" aria-label="BGM 与音效分区">{(["BGM 与音效总览", "曲目档案", "场景提示点", "音效层", "播放队列"] as AudioTab[]).map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>
          {activeTab === "BGM 与音效总览" && <AudioOverview audio={selected} playing={playing === selected.title} onToggle={() => togglePlayback(selected.title)} onFeedback={onFeedback} />}
          {activeTab === "曲目档案" && <AudioProfile audio={draft} onChange={updateDraft} />}
          {activeTab === "场景提示点" && <SceneAudioCues onFeedback={onFeedback} />}
          {activeTab === "音效层" && <SoundLayers onFeedback={onFeedback} />}
          {activeTab === "播放队列" && <PlaybackQueue playing={playing} onPlay={togglePlayback} onFeedback={onFeedback} />}
        </article>
      </div>
      <p className="workbench-context-note">当前项目：{project.title} · 音频提示可关联场景、遭遇时钟与情绪建议，但永远等待主持人手动触发。</p>
    </section>
  );
}

function AudioOverview({ audio, playing, onToggle, onFeedback }: { audio: AudioCueRecord; playing: boolean; onToggle: () => void; onFeedback: (message: string) => void }) {
  return <div className="audio-overview"><section className="audio-player-card"><div className={playing ? "record-disc spinning" : "record-disc"}><i /></div><div><span>{audio.kind}</span><h4>{audio.title}</h4><p>{audio.mood}</p><div className="audio-progress"><i /><b>01:18</b><b>03:42</b></div><div className="audio-controls"><button onClick={onToggle}>{playing ? "暂停" : "播放"}</button><button onClick={() => onFeedback("已模拟从循环起点重新播放。")}>循环起点</button><button onClick={() => onFeedback("已模拟淡出当前曲目。")}>淡出</button></div></div></section><section className="audio-cue-summary"><article><span>玩家端名称</span><strong>{audio.publicTitle}</strong><p>播放器不会暴露内部标题中的地点或事件。</p></article><article><span>循环区间</span><strong>{audio.loop}</strong><p>{audio.fade}</p></article><article><span>场景提示点</span><strong>{audio.scene}</strong><p>{audio.cue}</p></article><article><span>备用曲目</span><strong>{audio.fallback}</strong><p>主文件失效或临时需要更克制时使用。</p></article></section></div>;
}

function AudioProfile({ audio, onChange }: { audio: AudioCueRecord; onChange: <Key extends keyof AudioCueRecord>(key: Key, value: AudioCueRecord[Key]) => void }) {
  return <div className="entity-form audio-profile"><label>内部名称<input value={audio.title} onChange={(event) => onChange("title", event.target.value)} /></label><label>玩家端名称<input value={audio.publicTitle} onChange={(event) => onChange("publicTitle", event.target.value)} /></label><label>音频类型<input value={audio.kind} onChange={(event) => onChange("kind", event.target.value)} /></label><label>文件状态<select value={audio.state} onChange={(event) => onChange("state", event.target.value as AudioState)}><option>就绪</option><option>待剪辑</option><option>缺少文件</option></select></label><label className="full-field">情绪与使用边界<textarea rows={4} value={audio.mood} onChange={(event) => onChange("mood", event.target.value)} /></label><label>循环区间<input value={audio.loop} onChange={(event) => onChange("loop", event.target.value)} /></label><label>淡入淡出<input value={audio.fade} onChange={(event) => onChange("fade", event.target.value)} /></label><label className="full-field">备用曲目<input value={audio.fallback} onChange={(event) => onChange("fallback", event.target.value)} /></label></div>;
}

function SceneAudioCues({ onFeedback }: { onFeedback: (message: string) => void }) {
  return <div className="scene-audio-cues"><header><strong>场景提示点</strong><p>提示告诉主持人“何时可能适合”，不会直接替主持人播放。</p></header><section><article className="done"><b>进入场景</b><div><strong>玩家第一次看到东码头全景</strong><p>建议播放“码头 · 暗潮”，淡入 3 秒。</p></div><button onClick={() => onFeedback("已模拟手动触发码头 BGM。")}>手动触发</button></article><article><b>压力变化</b><div><strong>探索时钟达到 4/6</strong><p>叠加吊机警铃，不切断当前 BGM。</p></div><button onClick={() => onFeedback("已把吊机警铃加入待触发队列。")}>加入队列</button></article><article><b>角色判断</b><div><strong>玩家开始怀疑伊芙琳</strong><p>这只是主持人可选提示；系统不会监听对话来判断是否发生。</p></div><button onClick={() => onFeedback("已由主持人确认情绪变化，准备备用曲目。")}>确认发生</button></article></section></div>;
}

function SoundLayers({ onFeedback }: { onFeedback: (message: string) => void }) {
  return <div className="sound-layer-panel"><header><strong>音效层</strong><p>环境、事件和动作音效独立于 BGM，可单独开关和调整音量。</p></header><section>{soundLayers.map((layer) => <article key={layer.name}><button className={layer.active ? "layer-toggle active" : "layer-toggle"} aria-label={`切换${layer.name}`} onClick={() => onFeedback(`已模拟${layer.active ? "关闭" : "开启"}音效“${layer.name}”。`)}><i /></button><div><span>{layer.kind}</span><strong>{layer.name}</strong><p>{layer.trigger}</p></div><em>{layer.volume}</em><input aria-label={`${layer.name}音量`} type="range" min="0" max="100" defaultValue={Number.parseInt(layer.volume, 10)} /></article>)}</section></div>;
}

function PlaybackQueue({ playing, onPlay, onFeedback }: { playing: string | null; onPlay: (title: string) => void; onFeedback: (message: string) => void }) {
  return <div className="playback-queue-panel"><header><strong>播放队列</strong><p>队列只减少临场查找，不会按关键词或语音自动跳转。</p></header><section>{audioCues.slice(0, 3).map((audio, index) => <article key={audio.title}><b>0{index + 1}</b><div><span>{audio.scene}</span><strong>{audio.title}</strong><p>{index === 0 ? "当前场景" : index === 1 ? "下一候选" : "终幕备用"}</p></div><em>{playing === audio.title ? "播放中" : "等待"}</em><button onClick={() => onPlay(audio.title)}>{playing === audio.title ? "暂停" : "播放"}</button></article>)}</section><button onClick={() => onFeedback("已模拟根据当前场景重新排列播放队列。")}>按当前场景整理队列</button></div>;
}
