import { InteractivePythonBlock } from "@/components/lesson/InteractivePythonBlock";

import type { AnyPatternProblem } from "./pattern-canvas-types";
import { useSelectedProblem } from "./problem-store";

/** Runnable version of whichever problem is selected in the `PatternCanvas` of the same set. */
export function PatternExample({
  problems,
  problemSet,
}: {
  problems: AnyPatternProblem[];
  problemSet: string;
}) {
  const problemId = useSelectedProblem(problemSet, problems[0].id);
  const problem = problems.find((p) => p.id === problemId) ?? problems[0];
  const code = `${problem.python.join("\n")}\n\n\n${problem.example.call}`;

  return (
    <InteractivePythonBlock
      key={problem.id}
      initialCode={code}
      caption={`Try it · ${problem.file}`}
    />
  );
}
