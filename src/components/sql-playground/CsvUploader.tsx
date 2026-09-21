import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload,
  X,
  FileType,
  Check,
  AlertTriangle,
  Database as DatabaseIcon,
  Loader2,
} from "lucide-react";
import SqliteWorker from "./sqlite.worker?worker";

export interface CsvUploaderProps {
  onUpload: (file: File, tableName: string, target: "workspace" | "current") => Promise<void>;
  onClose: () => void;
  currentDataset: string;
}

type UploadMode = "csv" | "sqlite";

export function CsvUploader({ onUpload, onClose, currentDataset }: CsvUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<UploadMode>("csv");

  // CSV specific state
  const [tableName, setTableName] = useState("");

  // SQLite specific state
  const [inspecting, setInspecting] = useState(false);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());

  const [target, setTarget] = useState<"workspace" | "current">("workspace");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressLabel, setProgressLabel] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const processDroppedFile = async (dropped: File) => {
    if (dropped.size > 50 * 1024 * 1024) {
      setError("File exceeds 50MB limit for browser stability.");
      return;
    }
    setError(null);
    setFile(dropped);

    const isSqlite = dropped.name.endsWith(".db") || dropped.name.endsWith(".sqlite");
    setMode(isSqlite ? "sqlite" : "csv");

    if (!isSqlite) {
      // Infer table name from filename
      let inferred = dropped.name
        .replace(/\.csv$/i, "")
        .replace(/[^a-zA-Z0-9_]/g, "_")
        .toLowerCase();
      if (/^[0-9]/.test(inferred)) inferred = "t_" + inferred;
      setTableName(inferred || "my_table");
    } else {
      // Inspect SQLite DB
      setInspecting(true);
      try {
        if (!workerRef.current) {
          workerRef.current = new SqliteWorker();
        }
        const worker = workerRef.current;
        const buffer = await dropped.arrayBuffer();

        const tables = await new Promise<string[]>((resolve, reject) => {
          const id = Date.now();
          const handler = (e: MessageEvent) => {
            if (e.data.id === id) {
              worker.removeEventListener("message", handler);
              if (e.data.status === "error") reject(new Error(e.data.error));
              else resolve(e.data.tables);
            }
          };
          worker.addEventListener("message", handler);
          worker.postMessage({ id, type: "inspect", payload: buffer }, [buffer]);
        });

        setAvailableTables(tables);
        setSelectedTables(new Set(tables)); // Default select all
      } catch (err: any) {
        setError("Could not parse SQLite database: " + (err.message || String(err)));
        setFile(null);
      } finally {
        setInspecting(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processDroppedFile(selected);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      const isOk =
        dropped.name.endsWith(".csv") ||
        dropped.name.endsWith(".db") ||
        dropped.name.endsWith(".sqlite");
      if (isOk) {
        processDroppedFile(dropped);
      } else {
        setError("Please drop a valid .csv or SQLite .db file");
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const toggleTable = (t: string) => {
    const next = new Set(selectedTables);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    setSelectedTables(next);
  };

  const submit = async () => {
    if (!file) return;
    if (mode === "csv" && !tableName.trim()) return;
    if (mode === "sqlite" && selectedTables.size === 0) return;

    setUploading(true);
    setError(null);

    try {
      if (mode === "csv") {
        setProgressLabel("Importing CSV...");
        await onUpload(file, tableName.trim(), target);
      } else {
        // SQLite
        if (!workerRef.current) throw new Error("Worker not initialized");
        const worker = workerRef.current;

        for (const table of Array.from(selectedTables)) {
          setProgressLabel(`Extracting ${table}...`);
          const csvString = await new Promise<string>((resolve, reject) => {
            const id = Date.now();
            const handler = (e: MessageEvent) => {
              if (e.data.id === id) {
                worker.removeEventListener("message", handler);
                if (e.data.status === "error") reject(new Error(e.data.error));
                else resolve(e.data.csv);
              }
            };
            worker.addEventListener("message", handler);
            worker.postMessage({ id, type: "extract", payload: table });
          });

          if (!csvString) continue;

          setProgressLabel(`Importing ${table}...`);
          const csvFile = new File([csvString], `${table}.csv`, { type: "text/csv" });

          // Use our existing CSV pipeline for each table
          await onUpload(csvFile, table, target);
        }
      }
      onClose();
    } catch (e: any) {
      setError(e.message || String(e));
      setUploading(false);
      setProgressLabel("");
    }
  };

  const canSubmit = !uploading && (mode === "csv" ? !!tableName.trim() : selectedTables.size > 0);

  return (
    <div className="sqlx-modal-overlay">
      <div className="sqlx-modal">
        <div className="sqlx-modal-header">
          <h2>Upload Data</h2>
          <button onClick={onClose} disabled={uploading} className="sqlx-icon-btn">
            <X size={18} />
          </button>
        </div>

        <div className="sqlx-modal-body">
          {!file ? (
            <div
              className="sqlx-dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={32} />
              <p>Drag and drop a CSV or SQLite (.db) file here</p>
              <span className="hint">Max size: 50MB</span>
              <input
                type="file"
                accept=".csv,.db,.sqlite"
                className="hidden"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          ) : inspecting ? (
            <div className="sqlx-dropzone" style={{ cursor: "default", borderStyle: "solid" }}>
              <Loader2 size={32} className="spin" />
              <p>Inspecting SQLite Database...</p>
              <span className="hint">Reading metadata safely in a worker...</span>
            </div>
          ) : (
            <div className="sqlx-upload-form">
              <div className="sqlx-file-info">
                {mode === "sqlite" ? <DatabaseIcon size={24} /> : <FileType size={24} />}
                <div className="info">
                  <strong>{file.name}</strong>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button
                  className="sqlx-icon-btn"
                  onClick={() => setFile(null)}
                  disabled={uploading}
                >
                  <X size={16} />
                </button>
              </div>

              {mode === "csv" ? (
                <div className="sqlx-field">
                  <label>Table Name</label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    disabled={uploading}
                  />
                </div>
              ) : (
                <div className="sqlx-field">
                  <label>
                    Select Tables ({selectedTables.size} / {availableTables.length})
                  </label>
                  <div className="sqlx-table-picker">
                    {availableTables.length === 0 ? (
                      <div className="empty">No tables found in this database.</div>
                    ) : (
                      availableTables.map((t) => (
                        <label key={t} className="sqlx-checkbox-row">
                          <input
                            type="checkbox"
                            checked={selectedTables.has(t)}
                            onChange={() => toggleTable(t)}
                            disabled={uploading}
                          />
                          <span>{t}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="sqlx-field">
                <label>Destination</label>
                <div className="sqlx-radio-group">
                  <label className={`sqlx-radio ${target === "workspace" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="target"
                      checked={target === "workspace"}
                      onChange={() => setTarget("workspace")}
                      disabled={uploading}
                    />
                    <div className="content">
                      <strong>My Workspace</strong>
                      <span>A blank canvas with only your uploaded tables. (Recommended)</span>
                    </div>
                  </label>
                  <label className={`sqlx-radio ${target === "current" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="target"
                      checked={target === "current"}
                      onChange={() => setTarget("current")}
                      disabled={uploading}
                    />
                    <div className="content">
                      <strong>Add to Current Lab</strong>
                      <span>
                        Imports into an <code>uploads</code> schema alongside the {currentDataset}{" "}
                        course dataset.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {target === "current" && (
                <div className="sqlx-alert">
                  <AlertTriangle size={16} />
                  <span>
                    Course tables are available only for this temporary session. Uploaded data
                    remains safely separated in the <code>uploads</code> schema.
                  </span>
                </div>
              )}
            </div>
          )}

          {error && <div className="sqlx-error-msg">{error}</div>}
        </div>

        {file && !inspecting && (
          <div className="sqlx-modal-footer">
            <button className="sqlx-btn" onClick={onClose} disabled={uploading}>
              Cancel
            </button>
            <button className="sqlx-btn primary" onClick={submit} disabled={!canSubmit}>
              {uploading ? progressLabel || "Importing..." : "Import Data"}
              {!uploading && <Check size={14} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
