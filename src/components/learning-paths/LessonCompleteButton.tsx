import { CheckCircle2 } from "lucide-react";

export interface LessonCompleteButtonProps {
  isCompleted: boolean;
  hasQuiz: boolean;
  onToggle: () => void;
  isDisabled?: boolean;
}

export function LessonCompleteButton({
  isCompleted,
  hasQuiz,
  onToggle,
  isDisabled,
}: LessonCompleteButtonProps) {
  const disabled = (hasQuiz && !isCompleted) || isDisabled;

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`group inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors ${
        disabled
          ? "border-hairline/50 bg-surface/10 text-muted-foreground/50 cursor-not-allowed"
          : isCompleted
            ? "border-mint/30 bg-mint/10 text-mint hover:bg-mint/20"
            : "border-hairline/70 bg-surface/30 text-muted-foreground hover:bg-surface/60 hover:text-foreground"
      }`}
    >
      <CheckCircle2 className={`size-4 ${isCompleted ? "" : "opacity-50"}`} />
      {isCompleted ? "Completed" : hasQuiz ? "Pass Quiz to Complete" : "Mark as Complete"}
    </button>
  );
}
