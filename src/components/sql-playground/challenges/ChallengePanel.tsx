import { useState, useEffect, useRef } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Play, Loader2, XCircle, RotateCcw, X, Lightbulb, Eye, Bookmark } from "lucide-react";
import type { ChallengeDefinition, CheckOutcome, ChallengeEngine } from "./types";
import { getCheckFeedback, getErrorCopy } from "./error-copy";
import { getProgress, saveProgress, deleteProgress } from "./progress";

interface Props {
  challenge: ChallengeDefinition;
  engine: ChallengeEngine;
  onRun: () => void;
  onReset: () => void;
  onExit: () => void;
  onUseStarter: (sql: string) => void;
  feedback: CheckOutcome | null;
  running: boolean;
  isDatasetActive: boolean;
  onNextChallenge?: () => void;
}

export function ChallengePanel({ 
  challenge, 
  engine, 
  onRun, 
  onReset, 
  onExit, 
  onUseStarter, 
  feedback, 
  running,
  isDatasetActive,
  onNextChallenge
}: Props) {
  const [hintIndex, setHintIndex] = useState(-1);
  const [showSolution, setShowSolution] = useState(false);
  const [showRequirements, setShowRequirements] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick(t => t + 1);
    window.addEventListener("sqlx-progress-updated", handler);
    return () => window.removeEventListener("sqlx-progress-updated", handler);
  }, []);

  const progress = getProgress(challenge.id);

  const handleToggleReview = () => {
    const p = progress || {
      version: challenge.version,
      completedAt: 0,
      attempts: 0,
      revealedHintCount: 0,
      revealedSolution: false,
    };
    saveProgress(challenge.id, { ...p, needsReview: !p.needsReview });
  };
  
  // Reset local state when challenge changes
  useEffect(() => {
    setHintIndex(-1);
    setShowSolution(false);
    setShowRequirements(true);
  }, [challenge.id]);

  // Reveal next hint automatically if there's an error, up to a point
  useEffect(() => {
    if (feedback && feedback.state !== "passed" && hintIndex < challenge.hints.length - 1) {
       // Optional: auto-reveal next hint. For now we just let them click it.
       // Actually, requirements say "The second hint becomes available after one unsuccessful submission".
       // We can just make all hints unlockable sequentially.
    }
  }, [feedback, challenge.hints.length, hintIndex]);

  const revealHint = () => {
    if (hintIndex < challenge.hints.length - 1) {
      setHintIndex(prev => prev + 1);
    }
  };

  const starterSql = challenge.starterSql || `SELECT * FROM ${challenge.requiredTables[0] || 'table_name'} LIMIT 10;`;
  const hasHints = challenge.hints.length > 0;
  const allHintsRevealed = hintIndex >= challenge.hints.length - 1;
  const isPassed = feedback?.state === "passed";

  return (
    <section className="sqlx-editor-card" style={{ flex: "none", border: "1px solid var(--sqlx-line)" }}>
      <div className="sqlx-toolbar" style={{ padding: "8px 12px", borderBottom: "1px solid var(--sqlx-line)", backgroundColor: "var(--sqlx-panel-2)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ 
            backgroundColor: "var(--sqlx-accent)", 
            color: "var(--sqlx-accent-ink)", 
            padding: "2px 8px", 
            borderRadius: "12px", 
            fontSize: "11px", 
            fontWeight: 700, 
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            Challenge
          </span>
          <span style={{ color: "var(--sqlx-ink)", fontSize: "13px", fontWeight: 600 }}>
            {challenge.group}
          </span>
        </span>
        <div style={{ flex: 1 }} />
        
        {progress?.completedAt ? (
          <button 
            className="sqlx-btn"
            onClick={() => saveProgress(challenge.id, { ...progress, completedAt: 0 })}
            title="Mark as uncompleted"
            style={{ padding: "4px 8px", fontSize: "12px", marginRight: "4px" }}
          >
            <RotateCcw size={13} /> Uncomplete
          </button>
        ) : null}

        <button 
          className="sqlx-btn"
          onClick={handleToggleReview} 
          title={progress?.needsReview ? "Remove review flag" : "Flag for review"}
          style={{ padding: "4px 8px", fontSize: "12px", marginRight: "4px" }}
        >
          <Bookmark size={13} fill={progress?.needsReview ? "currentColor" : "none"} /> 
          {progress?.needsReview ? "Reviewing" : "Review later"}
        </button>

        <button 
          className="sqlx-btn"
          onClick={onExit} 
          title="Exit challenge"
          style={{ padding: "4px 8px", fontSize: "12px" }}
        >
          <X size={13} /> Exit
        </button>
      </div>
      
      <div style={{ padding: "12px 16px" }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "15px" }}>{challenge.title}</h3>
        <p style={{ margin: "0 0 12px 0", lineHeight: 1.5, color: "var(--text-secondary, #666)" }}>
          {challenge.prompt}
        </p>

        <div style={{ marginBottom: "16px" }}>
          <button 
            onClick={() => setShowRequirements(!showRequirements)}
            style={{ 
              background: "none", border: "none", padding: 0, 
              display: "flex", alignItems: "center", gap: "4px",
              cursor: "pointer", color: "var(--text, #333)",
              fontWeight: 500, fontSize: "13px"
            }}
          >
            {showRequirements ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Requirements
          </button>
          
          {showRequirements && (
            <ul style={{ margin: "8px 0 0 0", paddingLeft: "24px", color: "var(--text-secondary, #666)", fontSize: "13px" }}>
              {challenge.requirements.map((req, i) => <li key={i} style={{ marginBottom: "4px" }}>{req}</li>)}
            </ul>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
           <button
              className="sqlx-btn primary"
              onClick={onRun}
              disabled={running || !isDatasetActive}
            >
              {running ? <Loader2 size={13} className="spin" /> : <Play size={13} />}
              Run and check
            </button>
            <button className="sqlx-btn" onClick={() => onUseStarter(starterSql)}>
              Use starter
            </button>
            <button className="sqlx-btn" onClick={onReset}>
              <RotateCcw size={13} /> Reset query
            </button>
            
            {hasHints && (
              <button 
                className="sqlx-btn" 
                onClick={revealHint} 
                disabled={allHintsRevealed}
              >
                <Lightbulb size={13} /> 
                {hintIndex === -1 ? "Hint" : allHintsRevealed ? "No more hints" : "Next hint"}
              </button>
            )}
            
            <button 
              className="sqlx-btn" 
              onClick={() => setShowSolution(!showSolution)}
            >
              <Eye size={13} /> {showSolution ? "Hide solution" : "Reveal solution"}
            </button>
        </div>

        {/* Hints Display */}
        {hintIndex >= 0 && (
          <div style={{ 
            backgroundColor: "var(--bg-inset, #f5f5f5)", 
            padding: "12px", 
            borderRadius: "6px", 
            marginBottom: "16px",
            fontSize: "13px"
          }}>
            <strong style={{ display: "block", marginBottom: "8px" }}>Hints:</strong>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {challenge.hints.slice(0, hintIndex + 1).map((hint, i) => (
                <li key={i} style={{ marginBottom: i < hintIndex ? "4px" : 0 }}>{hint}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Solution Display */}
        {showSolution && (
          <div style={{ 
            backgroundColor: "var(--bg-inset, #f5f5f5)", 
            padding: "12px", 
            borderRadius: "6px", 
            marginBottom: "16px",
            fontSize: "13px"
          }}>
            <strong style={{ display: "block", marginBottom: "8px" }}>Reference Solution:</strong>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
              {challenge.solutionSql[engine] || challenge.solutionSql.postgres || "Not available"}
            </pre>
          </div>
        )}

        {/* Feedback Region */}
        {feedback && (
          <div style={{
            padding: "12px",
            borderRadius: "6px",
            display: "flex",
            gap: "12px",
            backgroundColor: isPassed ? "rgba(34, 197, 94, 0.1)" : 
                             feedback.state === "incorrect" ? "rgba(245, 158, 11, 0.1)" : 
                             "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${isPassed ? "rgba(34, 197, 94, 0.2)" : 
                                  feedback.state === "incorrect" ? "rgba(245, 158, 11, 0.2)" : 
                                  "rgba(239, 68, 68, 0.2)"}`
          }}>
            <div style={{ flexShrink: 0, marginTop: "2px" }}>
              {isPassed ? (
                <CheckCircle2 size={18} color="#22c55e" />
              ) : feedback.state === "incorrect" ? (
                <AlertTriangleIcon size={18} color="#f59e0b" />
              ) : (
                <XCircle size={18} color="#ef4444" />
              )}
            </div>
            <div style={{ fontSize: "13px" }}>
              {isPassed && (
                <>
                  <strong style={{ display: "block", color: "#15803d", marginBottom: "4px" }}>
                    {challenge.success.title}
                  </strong>
                  <div style={{ color: "#166534" }}>{challenge.success.body}</div>
                  {challenge.success.nextConcept && onNextChallenge && (
                     <div style={{ marginTop: "8px" }}>
                       Next: {challenge.success.nextConcept}.
                     </div>
                  )}
                </>
              )}

              {feedback.state === "incorrect" && (
                <>
                   <strong style={{ display: "block", color: "#b45309", marginBottom: "4px" }}>
                     Not quite
                   </strong>
                   <div style={{ color: "#92400e" }}>
                     {getCheckFeedback(feedback.reason, feedback.detail).body}
                   </div>
                </>
              )}

              {feedback.state === "query-error" && (
                <>
                   <strong style={{ display: "block", color: "#b91c1c", marginBottom: "4px" }}>
                     {getErrorCopy(feedback.category, feedback.detail, challenge).title}
                   </strong>
                   <div style={{ color: "#991b1b" }}>
                     {getErrorCopy(feedback.category, feedback.detail, challenge).body}
                   </div>
                </>
              )}
              
              {feedback.state === "unavailable" && (
                 <>
                   <strong style={{ display: "block", color: "#b91c1c", marginBottom: "4px" }}>
                     Challenge unavailable
                   </strong>
                   <div style={{ color: "#991b1b" }}>
                     {feedback.message}
                   </div>
                 </>
              )}
            </div>
          </div>
        )}
        
        {!feedback && (
          <div style={{
            padding: "12px",
            borderRadius: "6px",
            backgroundColor: "var(--bg-inset, #f5f5f5)",
            fontSize: "13px",
            color: "var(--text-secondary, #666)"
          }}>
            Write your query, then choose <strong>Run and check</strong>. We check the result, not the exact SQL you used.
          </div>
        )}
      </div>
    </section>
  );
}

function AlertTriangleIcon({ size, color }: { size: number, color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
      <path d="M12 9v4"></path>
      <path d="M12 17h.01"></path>
    </svg>
  );
}
