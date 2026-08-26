import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, ArrowRight, RefreshCcw, Sparkles, Terminal, Loader2, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractivePythonBlock } from "./InteractivePythonBlock"; 

export type QuizQuestion = {
  id: string;
  question: string;
  options?: string[];
  correctIndex?: number;
  commandAnswer?: string | string[];
  explanation?: string;
  interactiveCode?: boolean;
  initialCode?: string;
  testCode?: string;
  expectedOutput?: string;
};


function parsePythonError(errorText: string): { coreIssue: string; hint: string } | null {
  if (!errorText) return null;
  
  if (errorText.includes("TypeError") && (errorText.includes("takes no arguments") || errorText.match(/takes \d+ positional arguments/))) {
    return {
      coreIssue: "Your class was initialized incorrectly because Python couldn't find a valid __init__ method with the right parameters.",
      hint: "Check your __init__ spelling (e.g. not __int__) and make sure it accepts 'self' along with any required parameters."
    };
  }
  
  if (errorText.includes("TypeError") && errorText.includes("missing") && errorText.includes("required positional argument")) {
    return {
      coreIssue: "Python expected an instance reference or parameter but didn't get one.",
      hint: "Did you forget to add 'self' as the first parameter in __init__(self, ...), or did you miss a required attribute?"
    };
  }
  
  if (errorText.includes("AttributeError")) {
    const attrMatch = errorText.match(/has no attribute '([^']+)'/);
    if (attrMatch) {
      const attrName = attrMatch[1];
      return {
        coreIssue: `The '${attrName}' attribute was never attached to the object instance.`,
        hint: `Make sure you are assigning the parameter using self.${attrName} = ${attrName} inside __init__.`
      };
    }
  }
  
  if (errorText.includes("SyntaxError")) {
    const execMatch = errorText.match(/File "<exec>", line (\d+)/);
    const lineStr = execMatch ? ` on line ${execMatch[1]}` : "";
    return {
      coreIssue: "We found a syntax error in your code.",
      hint: `Check your syntax${lineStr}. Make sure you aren't missing any colons (:) or parentheses.`
    };
  }
  
  if (errorText.includes("IndentationError")) {
    return {
      coreIssue: "Your code has inconsistent spacing.",
      hint: "Make sure everything inside your class and methods is indented correctly (usually 4 spaces)."
    };
  }
  
  return null;
}

export type QuizData = {
  questions: QuizQuestion[];
  isFinalQuiz?: boolean;
};

function NormalQuiz({ data, onActiveChange }: { data: QuizData; onActiveChange?: (active: boolean) => void }) {
  const [isStarted, setIsStarted] = useState(data.isFinalQuiz ? true : false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [quizAttempt, setQuizAttempt] = useState(0);
  const [commandInput, setCommandInput] = useState("");
  const [isCommandCorrect, setIsCommandCorrect] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationOutput, setEvaluationOutput] = useState("");

  useEffect(() => {
    onActiveChange?.(isStarted && !isFinished);
  }, [isStarted, isFinished, onActiveChange]);

  const currentQuestion = data.questions[currentIndex];

  const shuffledOptions = React.useMemo(() => {
    if (!currentQuestion || !currentQuestion.options) return [];
    const options = currentQuestion.options.map((opt, idx) => ({
      text: opt,
      isCorrect: idx === currentQuestion.correctIndex,
      originalIndex: idx
    }));
    // Fisher-Yates shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  }, [currentQuestion, quizAttempt]);

  useEffect(() => {
    if (isFinished) {
      const percentage = Math.round((score / data.questions.length) * 100);
      if (percentage >= 80) {
        window.dispatchEvent(
          new CustomEvent("quiz-passed", { detail: { score: percentage } })
        );
      }
    }
  }, [isFinished, score, data.questions.length]);

  const handleStart = () => {
    setIsStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setSelectedOption(null);
    setCommandInput("");
    setIsCommandCorrect(false);
    setIsAnswered(false);
    setEvaluationOutput("");
    setQuizAttempt(prev => prev + 1);
    
    // Dispatch a custom event so other components (like animations) know the quiz started
    window.dispatchEvent(new CustomEvent("quiz-started"));
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (shuffledOptions[index].isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleCommandSubmit = async () => {
    if ((!currentQuestion.commandAnswer && !currentQuestion.interactiveCode) || isAnswered || isEvaluating) return;
    
    setIsEvaluating(true);
    let correct = false;
    let actualOutput = "";

    if (currentQuestion.interactiveCode) {
      try {
        const { getPyodide } = await import("@/lib/pyodide-loader");
        const pyodide = await getPyodide();
        let out = "";
        pyodide.setStdout({ batched: (str: string) => out += str + "\n" });
        pyodide.setStderr({ batched: (str: string) => out += str + "\n" });
        
        const fullCode = commandInput + "\n\n" + (currentQuestion.testCode || "");
        await pyodide.runPythonAsync(fullCode);
        
        actualOutput = out.trim();
        correct = actualOutput === (currentQuestion.expectedOutput || "").trim();
      } catch (e: any) {
        actualOutput = String(e);
        correct = false;
      }
      setEvaluationOutput(actualOutput);
    } else {
      const normalize = (str: string) => str.trim().replace(/\s+/g, " ");
      const answers = Array.isArray(currentQuestion.commandAnswer) 
        ? currentQuestion.commandAnswer 
        : [currentQuestion.commandAnswer];
      correct = answers.some(ans => normalize(commandInput) === normalize(ans!));
    }
    
    setIsCommandCorrect(correct);
    if (correct) {
      setScore((s) => s + 1);
    }
    
    setIsEvaluating(false);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < data.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setCommandInput("");
      setIsCommandCorrect(false);
      setIsAnswered(false);
      setEvaluationOutput("");
    } else {
      setIsFinished(true);
    }
  };

  if (!isStarted) {
    return (
      <div className="mt-8 rounded-xl border border-mint/30 bg-mint/5 p-6 text-center shadow-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-mint/20 text-mint mb-4">
          <Sparkles className="size-6" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Ready to test your knowledge?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Take a quick {data.questions.length}-question quiz to solidify what you just learned.
        </p>
        <button
          onClick={handleStart}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-mint px-6 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105 active:scale-95"
        >
          Start Quiz
          <ArrowRight className="size-4" />
        </button>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / data.questions.length) * 100);
    let feedback = "";
    if (percentage === 100) feedback = "Perfect! You nailed every concept.";
    else if (percentage >= 80) feedback = "Great job! You have a solid grasp of the material.";
    else if (percentage >= 60) feedback = "Good effort! A quick review might help you master the rest.";
    else feedback = "Keep learning! Review the lesson and try again when you're ready.";

    return (
      <div className="mt-8 rounded-xl border border-hairline bg-surface p-8 text-center shadow-md">
        <div className="text-5xl font-bold tracking-tight text-mint mb-2">
          {score} <span className="text-2xl text-muted-foreground">/ {data.questions.length}</span>
        </div>
        <h3 className="text-xl font-semibold text-foreground mt-4">{percentage}% Score</h3>
        <p className="mt-2 text-muted-foreground">{feedback}</p>
        
        <button
          onClick={handleStart}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-2 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-surface-3"
        >
          <RefreshCcw className="size-4" />
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className={data.isFinalQuiz 
      ? "mt-12 relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-surface to-surface-2 p-8 shadow-2xl md:p-12" 
      : "mt-8 rounded-xl border border-hairline bg-surface p-6 shadow-sm overflow-hidden"}>
      
      {data.isFinalQuiz && (
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-mint/5 blur-[100px]" />
      )}

      <div className="relative z-10 mb-6 flex items-center justify-between">
        <div className={cn("font-mono uppercase tracking-wider text-muted-foreground", data.isFinalQuiz ? "text-sm font-medium tracking-[0.2em]" : "text-xs")}>
          Question {currentIndex + 1} of {data.questions.length}
        </div>
        <div className={cn("font-medium text-mint", data.isFinalQuiz ? "text-sm" : "text-xs")}>
          Score: {score}
        </div>
      </div>

      <div className={cn("w-full rounded-full", data.isFinalQuiz ? "mb-10 h-1.5 bg-surface-3/50" : "mb-6 h-1 bg-surface-2")}>
        <motion.div
          className="h-full rounded-full bg-mint"
          initial={{ width: `${(currentIndex / data.questions.length) * 100}%` }}
          animate={{ width: `${((currentIndex + 1) / data.questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <h3 className={cn("relative z-10 leading-relaxed text-foreground", data.isFinalQuiz 
        ? "mb-10 text-2xl font-medium tracking-tight md:text-3xl" 
        : "mb-6 text-lg font-medium")}>
        {currentQuestion.question}
      </h3>

      {currentQuestion.interactiveCode ? (
        <InteractivePythonBlock
          initialCode={currentQuestion.initialCode || ""}
          onChange={(code) => setCommandInput(code)}
          hideRunButton={true}
          hideOutput={true}
          className="my-0 border-hairline/60"
          customFooterAction={
            !isAnswered && (
              <button
                onClick={handleCommandSubmit}
                disabled={!commandInput.trim() || isEvaluating}
                className="h-7 px-3 text-xs inline-flex items-center gap-1.5 rounded bg-mint hover:bg-mint/90 font-bold text-slate-900 shadow-[0_0_12px_rgba(110,231,183,0.3)] transition-all disabled:pointer-events-none disabled:opacity-50"
              >
                {isEvaluating ? <Loader2 className="size-3.5 animate-spin" /> : "Submit"}
                {!isEvaluating && <ArrowRight className="size-3.5" />}
              </button>
            )
          }
        />
      ) : currentQuestion.commandAnswer ? (
        <div className="flex flex-col gap-4">
          <div className="relative">
            {(() => {
              const ansStr = Array.isArray(currentQuestion.commandAnswer) ? currentQuestion.commandAnswer[0] : currentQuestion.commandAnswer;
              const isMultiline = ansStr && ansStr.includes("\n");
              
              if (isMultiline) {
                return (
                  <textarea
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    disabled={isAnswered}
                    placeholder="Type your code here (Ctrl+Enter to submit)..."
                    rows={6}
                    className="w-full rounded-lg border border-hairline bg-surface-2 py-3 px-4 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint disabled:opacity-50 resize-y"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isAnswered && commandInput.trim()) {
                        handleCommandSubmit();
                      }
                    }}
                  />
                );
              }
              
              return (
                <>
                  <Terminal className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    disabled={isAnswered}
                    placeholder="Type your command here..."
                    className="w-full rounded-lg border border-hairline bg-surface-2 py-3 pl-10 pr-4 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint disabled:opacity-50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isAnswered && commandInput.trim()) {
                        handleCommandSubmit();
                      }
                    }}
                  />
                </>
              );
            })()}
          </div>
          {!isAnswered && (
            <button
              onClick={handleCommandSubmit}
              disabled={!commandInput.trim()}
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-mint px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              Submit Command
              <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {shuffledOptions.map((opt, i) => {
            const isSelected = selectedOption === i;
            const isCorrect = opt.isCorrect;
            
            let btnClass = "border-hairline bg-surface-2 hover:border-mint/50 hover:bg-surface-3";
            
            if (data.isFinalQuiz && !isAnswered) {
              btnClass = "border-hairline/40 bg-surface/30 hover:border-mint/30 hover:bg-surface hover:shadow-md";
            }
            
            if (isAnswered) {
              if (isCorrect) {
                btnClass = data.isFinalQuiz ? "border-mint/50 bg-mint/10 text-mint shadow-sm" : "border-mint bg-mint/10 text-mint";
              } else if (isSelected) {
                btnClass = data.isFinalQuiz ? "border-rose-500/50 bg-rose-500/10 text-rose-500 shadow-sm" : "border-rose-500/50 bg-rose-500/10 text-rose-500";
              } else {
                btnClass = "border-hairline bg-surface/50 opacity-50";
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelectOption(i)}
                disabled={isAnswered}
                className={cn("relative z-10 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-300", btnClass, data.isFinalQuiz ? "md:px-6 md:py-5" : "text-sm")}
              >
                <div className="flex items-center gap-4">
                  {data.isFinalQuiz && (
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                      isAnswered && isCorrect ? "border-mint bg-mint text-white" :
                      isAnswered && isSelected && !isCorrect ? "border-rose-500 bg-rose-500 text-white" :
                      "border-hairline bg-surface text-muted-foreground"
                    )}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  )}
                  <span className={cn(isAnswered && isCorrect ? "font-medium" : "", data.isFinalQuiz ? "text-base md:text-lg" : "")}>{opt.text}</span>
                </div>
                {isAnswered && isCorrect && <CheckCircle2 className={cn("shrink-0 text-mint", data.isFinalQuiz ? "size-6" : "size-4")} />}
                {isAnswered && isSelected && !isCorrect && <XCircle className={cn("shrink-0 text-rose-500", data.isFinalQuiz ? "size-6" : "size-4")} />}
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className={`rounded-lg border p-4 ${
              ((currentQuestion.commandAnswer || currentQuestion.interactiveCode) ? isCommandCorrect : (selectedOption !== null && shuffledOptions[selectedOption].isCorrect))
                ? "border-mint/30 bg-mint/5 text-mint" 
                : currentQuestion.interactiveCode ? "border-amber-500/30 bg-amber-500/5 text-amber-500" : "border-rose-500/30 bg-rose-500/5 text-rose-500"
            }`}>
              <p className="text-sm font-medium mb-1">
                {((currentQuestion.commandAnswer || currentQuestion.interactiveCode) ? isCommandCorrect : (selectedOption !== null && shuffledOptions[selectedOption].isCorrect)) ? "Correct!" : currentQuestion.interactiveCode ? "Needs Revision" : "Incorrect."}
              </p>
              {currentQuestion.commandAnswer && !isCommandCorrect && (
                <p className="mb-2 text-sm font-mono text-rose-500">
                  Expected: {Array.isArray(currentQuestion.commandAnswer) ? currentQuestion.commandAnswer[0] : currentQuestion.commandAnswer}
                </p>
              )}
              {currentQuestion.interactiveCode && !isCommandCorrect ? (() => {
                const friendlyError = parsePythonError(evaluationOutput);
                return (
                  <div className="mt-2 space-y-4">
                    {friendlyError ? (
                      <>
                        <p className="text-sm text-rose-700 dark:text-rose-400 font-medium leading-relaxed">
                          {friendlyError.coreIssue}
                        </p>
                        <div className="flex items-start gap-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-amber-700 dark:text-amber-400">
                          <Lightbulb className="size-5 shrink-0 mt-0.5" />
                          <p className="text-sm leading-relaxed">{friendlyError.hint}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="mb-2 text-sm font-mono text-rose-500 whitespace-pre-wrap">
                          <span className="font-bold">Expected output:</span><br/>{currentQuestion.expectedOutput || "None"}
                        </p>
                        <p className="mb-2 text-sm font-mono text-rose-500 whitespace-pre-wrap">
                          <span className="font-bold">Your code produced:</span><br/>{evaluationOutput || "No output"}
                        </p>
                      </>
                    )}
                  </div>
                );
              })() : currentQuestion.explanation && (
                <p className="text-sm opacity-90 leading-relaxed mt-2">
                  {currentQuestion.explanation}
                </p>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-transform hover:scale-105 active:scale-95"
              >
                {currentIndex < data.questions.length - 1 ? "Next Question" : "See Results"}
                <ArrowRight className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FinalQuiz({ data, onActiveChange }: { data: QuizData; onActiveChange?: (active: boolean) => void }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [commandAnswers, setCommandAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationOutputs, setEvaluationOutputs] = useState<Record<number, string>>({});

  const [shuffledQuestions] = useState(() => {
    return data.questions.map((q) => {
      if (!q.options) return { ...q, shuffledOptions: [] };
      const options = q.options.map((text, idx) => ({
        text,
        isCorrect: idx === q.correctIndex,
        originalIndex: idx
      }));
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      return { ...q, shuffledOptions: options };
    });
  });

  useEffect(() => {
    onActiveChange?.(true);
  }, [onActiveChange]);

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleCommandChange = (questionIndex: number, value: string) => {
    if (isSubmitted) return;
    setCommandAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const isCommandCorrect = (q: any, val: string) => {
    if (!q.commandAnswer) return false;
    const normalize = (str: string) => str.trim().replace(/\s+/g, " ");
    const answers = Array.isArray(q.commandAnswer) ? q.commandAnswer : [q.commandAnswer];
    return answers.some((ans: string) => normalize(val || "") === normalize(ans));
  };

  const handleSubmit = async () => {
    setIsEvaluating(true);
    let calculatedScore = 0;
    const newOutputs: Record<number, string> = {};

    for (let idx = 0; idx < shuffledQuestions.length; idx++) {
      const q = shuffledQuestions[idx];
      if (q.interactiveCode) {
        try {
          const { getPyodide } = await import("@/lib/pyodide-loader");
          const pyodide = await getPyodide();
          let out = "";
          pyodide.setStdout({ batched: (str: string) => out += str + "\n" });
          pyodide.setStderr({ batched: (str: string) => out += str + "\n" });
          
          const fullCode = (commandAnswers[idx] || q.initialCode || "") + "\n\n" + (q.testCode || "");
          await pyodide.runPythonAsync(fullCode);
          
          const actualOutput = out.trim();
          newOutputs[idx] = actualOutput;
          if (actualOutput === (q.expectedOutput || "").trim()) {
            calculatedScore++;
          }
        } catch (e: any) {
          newOutputs[idx] = String(e);
        }
      } else if (q.commandAnswer) {
        if (isCommandCorrect(q, commandAnswers[idx])) calculatedScore++;
      } else {
        const selected = selectedAnswers[idx];
        if (selected !== undefined && q.shuffledOptions[selected]?.isCorrect) {
          calculatedScore++;
        }
      }
    }

    setEvaluationOutputs(newOutputs);
    setScore(calculatedScore);
    setIsEvaluating(false);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const percentage = Math.round((calculatedScore / data.questions.length) * 100);
    if (percentage >= 80) {
      window.dispatchEvent(
        new CustomEvent("quiz-passed", { detail: { score: percentage } })
      );
    }
  };

  const allAnswered = shuffledQuestions.every((q, i) => 
    (q.commandAnswer || q.interactiveCode) ? (commandAnswers[i] !== undefined || (q.interactiveCode && q.initialCode)) : selectedAnswers[i] !== undefined
  );

  return (
    <div className="mt-8 w-full max-w-3xl mx-auto">
      {isSubmitted && (
        <div className="mb-16 rounded-xl border border-hairline bg-surface p-8 text-center">
          <div className="text-5xl font-bold tracking-tight text-mint mb-2">
            {score} <span className="text-3xl text-muted-foreground">/ {data.questions.length}</span>
          </div>
          <h2 className="text-xl font-medium text-foreground mt-4">
            {Math.round((score / data.questions.length) * 100)}% Final Score
          </h2>
        </div>
      )}

      <div className="space-y-14">
        {shuffledQuestions.map((q, qIndex) => (
          <div key={qIndex} className="relative">
            <div className="flex items-start gap-4 md:gap-6">
              <span className="text-lg md:text-xl font-medium text-muted-foreground shrink-0 mt-0.5">
                {qIndex + 1}.
              </span>
              
              <div className="flex-1">
                <h3 className="mb-6 text-lg md:text-xl font-medium leading-relaxed text-foreground">
                  {q.question}
                </h3>

                {q.interactiveCode ? (
                  <InteractivePythonBlock
                    initialCode={q.initialCode || ""}
                    onChange={(code) => handleCommandChange(qIndex, code)}
                    hideRunButton={true}
                    hideOutput={true}
                    className="my-0 border-hairline/60"
                  />
                ) : q.commandAnswer ? (
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      {(() => {
                        const ansStr = Array.isArray(q.commandAnswer) ? q.commandAnswer[0] : q.commandAnswer;
                        const isMultiline = ansStr && ansStr.includes("\n");
                        
                        if (isMultiline) {
                          return (
                            <textarea 
                              value={commandAnswers[qIndex] || ""}
                              onChange={(e) => handleCommandChange(qIndex, e.target.value)}
                              disabled={isSubmitted}
                              placeholder="Type your code here..."
                              rows={6}
                              className="w-full rounded-lg border border-hairline bg-transparent py-3 px-4 text-base font-mono text-foreground placeholder:text-muted-foreground focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint disabled:opacity-50 resize-y"
                            />
                          );
                        }
                        
                        return (
                          <>
                            <Terminal className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                            <input 
                              type="text" 
                              value={commandAnswers[qIndex] || ""}
                              onChange={(e) => handleCommandChange(qIndex, e.target.value)}
                              disabled={isSubmitted}
                              placeholder="Type your command here..."
                              className="w-full rounded-lg border border-hairline bg-transparent py-3 pl-12 pr-6 text-base font-mono text-foreground placeholder:text-muted-foreground focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint disabled:opacity-50"
                            />
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 mt-4">
                    {q.shuffledOptions.map((opt: any, oIndex: number) => {
                      const isSelected = selectedAnswers[qIndex] === oIndex;
                      const isCorrect = opt.isCorrect;
                      
                      let rowClass = "border border-hairline bg-surface hover:border-mint/40 hover:bg-surface-2/50 text-foreground/90 shadow-sm";
                      let indicatorClass = "border-hairline bg-surface-2 text-muted-foreground";
                      
                      if (isSelected) {
                        rowClass = "border-mint bg-mint/5 text-foreground shadow-md ring-1 ring-mint/50";
                        indicatorClass = "border-mint bg-mint text-white";
                      }
                      
                      if (isSubmitted) {
                        if (isCorrect) {
                          rowClass = "border-mint bg-mint/10 text-foreground ring-1 ring-mint";
                          indicatorClass = "border-mint bg-mint text-white";
                        } else if (isSelected) {
                          rowClass = "border-rose-500 bg-rose-500/10 text-foreground ring-1 ring-rose-500";
                          indicatorClass = "border-rose-500 bg-rose-500 text-white";
                        } else {
                          rowClass = "border-hairline bg-surface/40 opacity-40";
                        }
                      }

                      return (
                        <button
                          key={oIndex}
                          onClick={() => handleSelectOption(qIndex, oIndex)}
                          disabled={isSubmitted}
                          className={cn("group flex w-full items-start gap-5 rounded-xl px-5 py-4 text-left transition-all duration-200", rowClass)}
                        >
                          <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold transition-colors shadow-sm", indicatorClass)}>
                            {String.fromCharCode(65 + oIndex)}
                          </div>
                          <span className="text-base leading-relaxed flex-1 mt-1">{opt.text}</span>
                          
                          {isSubmitted && isCorrect && <CheckCircle2 className="ml-auto size-6 shrink-0 text-mint" />}
                          {isSubmitted && isSelected && !isCorrect && <XCircle className="ml-auto size-6 shrink-0 text-rose-500" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                <AnimatePresence>
                  {isSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={cn("rounded-lg border p-5", 
                        (q.interactiveCode ? (evaluationOutputs[qIndex] === (q.expectedOutput || '').trim()) : q.commandAnswer ? isCommandCorrect(q, commandAnswers[qIndex] || '') : (selectedAnswers[qIndex] !== undefined && q.shuffledOptions[selectedAnswers[qIndex]].isCorrect))
                          ? "border-mint/20 bg-mint/5" 
                          : q.interactiveCode ? "border-amber-500/20 bg-amber-500/5" : "border-rose-500/20 bg-rose-500/5"
                      )}>
                        <p className={cn("text-base font-medium mb-2",
                          (q.interactiveCode ? (evaluationOutputs[qIndex] === (q.expectedOutput || '').trim()) : q.commandAnswer ? isCommandCorrect(q, commandAnswers[qIndex] || '') : (selectedAnswers[qIndex] !== undefined && q.shuffledOptions[selectedAnswers[qIndex]].isCorrect))
                            ? "text-mint"
                            : q.interactiveCode ? "text-amber-500" : "text-rose-500"
                        )}>
                          {(q.interactiveCode ? (evaluationOutputs[qIndex] === (q.expectedOutput || '').trim()) : q.commandAnswer ? isCommandCorrect(q, commandAnswers[qIndex] || '') : (selectedAnswers[qIndex] !== undefined && q.shuffledOptions[selectedAnswers[qIndex]].isCorrect)) ? "Correct" : q.interactiveCode ? "Needs Revision" : "Incorrect"}
                        </p>
                        {q.commandAnswer && !isCommandCorrect(q, commandAnswers[qIndex] || "") && (
                          <p className="mb-4 text-sm font-mono text-rose-500">
                            Expected: {Array.isArray(q.commandAnswer) ? q.commandAnswer[0] : q.commandAnswer}
                          </p>
                        )}
                        {q.interactiveCode && evaluationOutputs[qIndex] !== undefined && evaluationOutputs[qIndex] !== (q.expectedOutput || "").trim() ? (() => {
                          const friendlyError = parsePythonError(evaluationOutputs[qIndex]);
                          return (
                            <div className="mt-2 space-y-4">
                              {friendlyError ? (
                                <>
                                  <p className="text-sm text-rose-700 dark:text-rose-400 font-medium leading-relaxed">
                                    {friendlyError.coreIssue}
                                  </p>
                                  <div className="flex items-start gap-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-amber-700 dark:text-amber-400">
                                    <Lightbulb className="size-5 shrink-0 mt-0.5" />
                                    <p className="text-sm leading-relaxed">{friendlyError.hint}</p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <p className="mb-2 text-sm font-mono text-rose-500 whitespace-pre-wrap">
                                    <span className="font-bold">Expected output:</span><br/>{q.expectedOutput || "None"}
                                  </p>
                                  <p className="mb-2 text-sm font-mono text-rose-500 whitespace-pre-wrap">
                                    <span className="font-bold">Your code produced:</span><br/>{evaluationOutputs[qIndex] || "No output"}
                                  </p>
                                </>
                              )}
                            </div>
                          );
                        })() : q.explanation && (
                          <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isSubmitted && (
        <div className="mt-16 flex justify-center pt-8">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isEvaluating}
            className="inline-flex items-center gap-3 rounded-full bg-mint px-10 py-4 text-lg font-semibold text-primary-foreground shadow-lg shadow-mint/20 transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {isEvaluating ? "Evaluating..." : "Submit Exam"}
            <ArrowRight className="size-5" />
          </button>
        </div>
      )}
      
      {isSubmitted && (
        <div className="mt-20 flex justify-center border-t border-hairline pt-10">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface px-6 py-3 text-sm font-medium transition-colors hover:bg-surface-2"
          >
            <RefreshCcw className="size-4" />
            Retake Exam
          </button>
        </div>
      )}
    </div>
  );
}

export function Quiz({ data, onActiveChange }: { data: QuizData; onActiveChange?: (active: boolean) => void }) {
  if (data.isFinalQuiz) {
    return <FinalQuiz data={data} onActiveChange={onActiveChange} />;
  }
  return <NormalQuiz data={data} onActiveChange={onActiveChange} />;
}
