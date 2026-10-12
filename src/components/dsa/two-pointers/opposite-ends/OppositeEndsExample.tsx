import { InteractivePythonBlock } from "@/components/lesson/InteractivePythonBlock";

import { useOppositeEndsProblem } from "./problem-store";
import { PROBLEMS } from "./trace";

/** Runnable version of whichever problem is selected in the visualizer above. */
export function OppositeEndsExample() {
  const problemId = useOppositeEndsProblem();
  const problem = PROBLEMS.find((p) => p.id === problemId)!;
  const code = `${problem.python.join("\n")}\n\n\n${problem.example.call}`;

  return (
    <InteractivePythonBlock
      key={problem.id}
      initialCode={code}
      caption={`Try it · ${problem.file}`}
    />
  );
}
