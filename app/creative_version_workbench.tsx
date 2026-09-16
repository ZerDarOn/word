"use client";

import { useMemo, useState } from "react";
import type { LoreCueBackupDocument } from "./creative_backup_import";

export interface LoreCueWritingSnapshot {
  id: string;
  label: string;
  createdAt: string;
  reason: string;
  documents: LoreCueBackupDocument[];
}

interface CreativeVersionWorkbenchProps {
  documents: LoreCueBackupDocument[];
  snapshots: LoreCueWritingSnapshot[];
  onCreateSnapshot: () => void;
  onRestoreSnapshot: (snapshot: LoreCueWritingSnapshot) => void;
}

function documentCharacters(documents: LoreCueBackupDocument[]) {
  return documents.reduce((total, document) => total + document.body.replace(/\s/g, "").length, 0);
}

export function CreativeVersionWorkbench({ documents, snapshots, onCreateSnapshot, onRestoreSnapshot }: CreativeVersionWorkbenchProps) {
  const [selectedId, setSelectedId] = useState(snapshots[0]?.id ?? "");
  const [restoreCandidateId, setRestoreCandidateId] = useState<string | null>(null);
  const selected = snapshots.find((snapshot) => snapshot.id === selectedId) ?? snapshots[0];
  const comparison = useMemo(() => {
    if (!selected) return null;
    const selectedById = new Map(selected.documents.map((document) => [document.id, document]));
    const currentById = new Map(documents.map((document) => [document.id, document]));
    const changed = documents.filter((document) => {
      const previous = selectedById.get(document.id);
      return !previous || previous.title !== document.title || previous.body !== document.body || previous.group !== document.group || previous.archived !== document.archived;
    }).map((document) => document.title);
    const removed = selected.documents.filter((document) => !currentById.has(document.id)).map((document) => document.title);
    return {
      currentCharacters: documentCharacters(documents),
      snapshotCharacters: documentCharacters(selected.documents),
      changed,
      removed,
    };
  }, [documents, selected]);

  return <section className="studio-board version-workbench">
    <div className="studio-page-heading">
      <div><span className="eyebrow">版本与快照 · 真实浏览器记录</span><h2>每次大改，都留一条回去的路。</h2><p>快照保存整个项目文档集；不会自动覆盖当前正文，恢复前会再次保护当前状态。</p></div>
      <button className="primary-action" onClick={() => { setSelectedId(""); onCreateSnapshot(); }}>建立手动快照</button>
    </div>
    <div className="version-layout">
      <div className="version-list" aria-label="项目快照列表">
        {snapshots.map((snapshot, index) => <button className={selected?.id === snapshot.id ? "active" : ""} key={snapshot.id} onClick={() => { setSelectedId(snapshot.id); setRestoreCandidateId(null); }}>
          <span>v{snapshots.length - index}</span><strong>{snapshot.label}</strong><small>{snapshot.createdAt} · {snapshot.reason}</small>
        </button>)}
      </div>
      {selected && comparison ? <section className="version-compare">
        <span className="eyebrow">与当前项目比较</span>
        <h3>{selected.label}</h3>
        <div className="version-metrics"><div><strong>{selected.documents.length}</strong><span>快照文档</span></div><div><strong>{documents.length}</strong><span>当前文档</span></div><div><strong>{comparison.snapshotCharacters}</strong><span>快照字数</span></div><div><strong>{comparison.currentCharacters}</strong><span>当前字数</span></div></div>
        <section className="version-change-list">
          <div><strong>当前相对快照有变化</strong><span>{comparison.changed.length + comparison.removed.length} 篇</span></div>
          {comparison.changed.length === 0 && comparison.removed.length === 0 ? <p>当前内容与该快照一致。</p> : <ul>{comparison.changed.map((title) => <li key={`changed-${title}`}><span>已修改 / 新增</span>{title}</li>)}{comparison.removed.map((title) => <li key={`removed-${title}`}><span>当前已移除</span>{title}</li>)}</ul>}
        </section>
        {restoreCandidateId === selected.id ? <div className="restore-confirmation"><strong>恢复前最后确认</strong><p>系统会先建立“恢复前保护”快照，再用所选快照替换当前文档集。此操作不会删除已有快照。</p><div><button onClick={() => setRestoreCandidateId(null)}>取消</button><button className="primary-action" onClick={() => { onRestoreSnapshot(selected); setRestoreCandidateId(null); }}>确认恢复</button></div></div> : <button onClick={() => setRestoreCandidateId(selected.id)}>准备恢复此快照</button>}
      </section> : <section className="version-compare"><span className="eyebrow">暂无快照</span><h3>先建立第一个手动快照</h3><p>快照会保存当前项目的所有正文、元数据、备注与归档状态。</p></section>}
    </div>
  </section>;
}
