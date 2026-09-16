"use client";

import { useRef, useState } from "react";
import type { LoreCueStoredDocument } from "./lorecue_project_store";

export type LoreCueBackupDocument = LoreCueStoredDocument;

interface BackupPreview {
  fileName: string;
  exportedAt: string;
  documents: LoreCueBackupDocument[];
}

interface CreativeBackupImportProps {
  projectId: string;
  onApply: (documents: LoreCueBackupDocument[]) => void;
  onFeedback: (message: string) => void;
}

function isValidDocument(value: unknown): value is LoreCueBackupDocument {
  if (!value || typeof value !== "object") return false;
  const document = value as Partial<LoreCueBackupDocument>;
  return [document.id, document.group, document.title, document.body, document.updatedAt].every((field) => typeof field === "string");
}

export function CreativeBackupImport({ projectId, onApply, onFeedback }: CreativeBackupImportProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [error, setError] = useState("");

  async function handleFile(file?: File) {
    setError("");
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("备份文件超过 5 MB，当前原型拒绝读取。");
      return;
    }
    try {
      const parsed = JSON.parse(await file.text()) as {
        format?: string;
        version?: number;
        project?: { id?: string };
        exportedAt?: string;
        documents?: unknown[];
      };
      if (parsed.format !== "lorecue-writing-backup" || parsed.version !== 1) throw new Error("format");
      if (parsed.project?.id !== projectId) throw new Error("project");
      if (!Array.isArray(parsed.documents) || parsed.documents.length === 0 || !parsed.documents.every(isValidDocument)) throw new Error("documents");
      setPreview({ fileName: file.name, exportedAt: parsed.exportedAt ?? "未记录", documents: parsed.documents });
      onFeedback("备份已通过格式校验，尚未改变当前项目。");
    } catch (reason) {
      const code = reason instanceof Error ? reason.message : "unknown";
      setError(code === "project" ? "这份备份属于另一个项目，为避免串稿已停止导入。" : "无法识别为有效的 LoreCue v1 写作备份。");
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function applyImport() {
    if (!preview) return;
    onApply(preview.documents);
    setPreview(null);
  }

  return <>
    <button onClick={() => fileInput.current?.click()}>导入</button>
    <input hidden ref={fileInput} type="file" accept="application/json,.json" onChange={(event) => void handleFile(event.target.files?.[0])} />
    {error && <p className="backup-import-error" role="alert">{error}</p>}
    {preview && <aside className="backup-import-preview" role="dialog" aria-modal="true" aria-label="备份导入预览">
      <header><div><span className="eyebrow">导入前确认</span><h3>{preview.fileName}</h3></div><button aria-label="关闭备份导入预览" onClick={() => setPreview(null)}>×</button></header>
      <p>预览阶段没有改动当前项目。确认后会先保留当前状态，再载入备份。</p>
      <dl>
        <div><dt>文档数量</dt><dd>{preview.documents.length}</dd></div>
        <div><dt>归档文档</dt><dd>{preview.documents.filter((document) => document.archived).length}</dd></div>
        <div><dt>导出时间</dt><dd>{preview.exportedAt}</dd></div>
        <div><dt>格式版本</dt><dd>LoreCue v1</dd></div>
      </dl>
      <footer><button onClick={() => setPreview(null)}>取消</button><button className="primary-action" onClick={applyImport}>确认导入并保留撤销点</button></footer>
    </aside>}
  </>;
}
