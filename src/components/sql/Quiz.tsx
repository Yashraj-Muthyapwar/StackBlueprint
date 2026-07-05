import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, ArrowRight, RefreshCcw, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils"; 

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type QuizData = {
  questions: QuizQuestion[];
};

export function Quiz({ data }: { data: QuizData }) {
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [quizAttempt, setQuizAttempt] = useState(0);

  const currentQuestion = data.questions[currentIndex];

  const shuffledOptions = React.useMemo(() => {
    if (!currentQuestion) return [];
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
    setIsAnswered(false);
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

  const handleNext = () => {
    if (currentIndex < data.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
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
    <div className="mt-8 rounded-xl border border-hairline bg-surface p-6 shadow-sm overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Question {currentIndex + 1} of {data.questions.length}
        </div>
        <div className="text-xs font-medium text-mint">
          Score: {score}
        </div>
      </div>

      <div className="mb-6 h-1 w-full rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full bg-mint"
          initial={{ width: `${(currentIndex / data.questions.length) * 100}%` }}
          animate={{ width: `${((currentIndex + 1) / data.questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <h3 className="mb-6 text-lg font-medium leading-relaxed text-foreground">
        {currentQuestion.question}
      </h3>

      <div className="space-y-3">
        {shuffledOptions.map((opt, i) => {
          const isSelected = selectedOption === i;
          const isCorrect = opt.isCorrect;
          
          let btnClass = "border-hairline bg-surface-2 hover:border-mint/50 hover:bg-surface-3";
          
          if (isAnswered) {
            if (isCorrect) {
              btnClass = "border-mint bg-mint/10 text-mint";
            } else if (isSelected) {
              btnClass = "border-rose-500/50 bg-rose-500/10 text-rose-500";
            } else {
              btnClass = "border-hairline bg-surface/50 opacity-50";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelectOption(i)}
              disabled={isAnswered}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-all duration-200 ${btnClass}`}
            >
              <span className={isAnswered && isCorrect ? "font-medium" : ""}>{opt.text}</span>
              {isAnswered && isCorrect && <CheckCircle2 className="size-4 text-mint" />}
              {isAnswered && isSelected && !isCorrect && <XCircle className="size-4 text-rose-500" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className={`rounded-lg border p-4 ${
              selectedOption !== null && shuffledOptions[selectedOption].isCorrect
                ? "border-mint/30 bg-mint/5 text-mint" 
                : "border-rose-500/30 bg-rose-500/5 text-rose-500"
            }`}>
              <p className="text-sm font-medium mb-1">
                {selectedOption !== null && shuffledOptions[selectedOption].isCorrect ? "Correct!" : "Incorrect."}
              </p>
              <p className="text-sm opacity-90 leading-relaxed">
                {currentQuestion.explanation}
              </p>
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
