import { type LessonContent } from "@/lessons/types";

export const FUNCTION_BASICS_LESSON: LessonContent = {
  slug: "function-basics",
  title: "Function Basics",
  subtitle: "Define functions, pass data in, and return results.",
  sections: [],
};

export const ARGUMENTS_AND_PARAMETERS_LESSON: LessonContent = {
  slug: "arguments-parameters",
  title: "Arguments & Parameters",
  subtitle: "Master positional, keyword, default, and variable-length arguments.",
  sections: [],
};

export const SCOPE_AND_NAMESPACES_LESSON: LessonContent = {
  slug: "scope-namespaces",
  title: "Scope & Namespaces",
  subtitle: "Understand the LEGB rule, variable shadowing, and the global/nonlocal keywords.",
  sections: [],
};

export const ADVANCED_FUNCTIONS_LESSON: LessonContent = {
  slug: "advanced-functions",
  title: "Advanced Functions",
  subtitle: "Explore lambdas, map/filter/reduce, closures, and higher-order functions.",
  sections: [],
};

export const MODULES_AND_PACKAGES_LESSON: LessonContent = {
  slug: "modules-packages",
  title: "Modules & Packages",
  subtitle: "Import standard tools, create your own modules, and build package structures.",
  sections: [],
};

export const PACKAGE_MANAGEMENT_LESSON: LessonContent = {
  slug: "package-management",
  title: "Package Management",
  subtitle: "Use pip, virtual environments, and requirements.txt to manage third-party code.",
  sections: [],
};

export const FUNCTIONS_FINAL_QUIZ_LESSON: LessonContent = {
  slug: "functions-final-quiz",
  title: "Functions & Modules Final Quiz",
  subtitle: "Review your understanding of functions, scope, advanced patterns, and package management.",
  sections: [],
};

export const FUNCTIONS_TOPICS: Record<string, { title: string; slug: string; lessons: LessonContent[] }> = {
  "functions": {
    title: "Functions & Modules",
    slug: "functions",
    lessons: [
      FUNCTION_BASICS_LESSON,
      ARGUMENTS_AND_PARAMETERS_LESSON,
      SCOPE_AND_NAMESPACES_LESSON,
      ADVANCED_FUNCTIONS_LESSON,
      MODULES_AND_PACKAGES_LESSON,
      PACKAGE_MANAGEMENT_LESSON,
      FUNCTIONS_FINAL_QUIZ_LESSON
    ],
  },
};
