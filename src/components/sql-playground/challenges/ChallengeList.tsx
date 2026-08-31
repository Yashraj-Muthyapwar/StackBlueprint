import { CheckCircle2, Circle, Bookmark } from "lucide-react";
import { getChallenges } from "./definitions";
import { getProgress } from "./progress";
import type { ChallengeEngine, ChallengeDataset, ChallengeDefinition } from "./types";
import { useMemo, useState, useEffect } from "react";

interface Props {
  dataset: ChallengeDataset;
  engine: ChallengeEngine;
  activeChallengeId: string | null;
  onSelectChallenge: (challenge: ChallengeDefinition) => void;
}

export function ChallengeList({ dataset, engine, activeChallengeId, onSelectChallenge }: Props) {
  const challenges = useMemo(() => getChallenges(dataset, engine), [dataset, engine]);
  
  const [, setTick] = useState(0);
  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener("sqlx-progress-updated", handler);
    return () => window.removeEventListener("sqlx-progress-updated", handler);
  }, []);

  if (challenges.length === 0) {
    return null; // Don't render the section if there are no challenges
  }

  // Group challenges by category
  const groups = challenges.reduce((acc, challenge) => {
    if (!acc[challenge.group]) {
      acc[challenge.group] = [];
    }
    acc[challenge.group].push(challenge);
    return acc;
  }, {} as Record<string, ChallengeDefinition[]>);

  return (
    <section>
      <h2>Challenges</h2>
      <div className="sqlx-examples" style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
        {Object.entries(groups).map(([groupName, groupChallenges]) => (
          <div key={groupName}>
            <h3 style={{ 
              fontSize: "11px", 
              textTransform: "uppercase", 
              letterSpacing: "0.5px", 
              color: "var(--text-secondary, #666)",
              marginBottom: "8px",
              paddingLeft: "8px",
              fontWeight: 600
            }}>
              {groupName}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {groupChallenges.map((challenge) => {
                const progress = getProgress(challenge.id);
                const isComplete = progress && progress.completedAt > 0 && progress.version === challenge.version;
                const isActive = activeChallengeId === challenge.id;
                
                return (
                  <button
                    key={challenge.id}
                    className={`sqlx-ex ${isActive ? "active" : ""}`}
                    onClick={() => onSelectChallenge(challenge)}
                    aria-current={isActive ? "true" : "false"}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {progress?.needsReview ? (
                         <Bookmark size={14} className="text-orange-500" />
                      ) : isComplete ? (
                         <CheckCircle2 size={14} className="text-green-500" />
                      ) : (
                         <Circle size={14} className="text-gray-400" />
                      )}
                      <span className="t" style={{ fontWeight: isActive ? '600' : 'normal' }}>
                        {challenge.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px', paddingLeft: '22px' }}>
                      <span className="badge">{challenge.difficulty}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
