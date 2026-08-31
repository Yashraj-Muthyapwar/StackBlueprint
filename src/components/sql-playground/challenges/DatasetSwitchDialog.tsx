import { AlertTriangle, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  targetDatasetName: string;
  currentDatasetName: string;
  targetEngineName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DatasetSwitchDialog({
  isOpen,
  targetDatasetName,
  currentDatasetName,
  targetEngineName,
  onConfirm,
  onCancel
}: Props) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000
      }}
      onClick={onCancel}
    >
      <div 
        style={{
          backgroundColor: "var(--bg, #fff)",
          color: "var(--text, #333)",
          padding: "24px",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: "1px solid var(--border, #e5e7eb)"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent, #6366f1)" }}>
             <AlertTriangle size={20} />
             <h3 style={{ margin: 0, fontSize: "16px" }}>This challenge uses {targetDatasetName}</h3>
          </div>
          <button 
             onClick={onCancel}
             style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary, #666)" }}
          >
            <X size={16} />
          </button>
        </div>
        
        <p style={{ margin: "0 0 24px 0", lineHeight: 1.5, fontSize: "14px" }}>
          You are currently exploring {currentDatasetName}. Challenges run against their own dataset so table names and expected answers stay consistent.
        </p>
        
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button 
             className="sqlx-btn" 
             onClick={onCancel}
             autoFocus
          >
            Stay in {currentDatasetName}
          </button>
          <button 
             className="sqlx-btn primary" 
             onClick={onConfirm}
          >
            Switch to {targetDatasetName}
          </button>
        </div>
      </div>
    </div>
  );
}
