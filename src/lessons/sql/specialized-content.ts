import type { LessonContent, FoundationTopicMeta } from "../types";

// =============================================================
// STRING FUNCTIONS
// =============================================================
const concatSubstring: LessonContent = {
  slug: "concat-substring",
  title: "CONCAT / SUBSTRING",
  subtitle: "Placeholder for CONCAT / SUBSTRING",
  sections: [],
};

const leftRightLength: LessonContent = {
  slug: "left-right-length",
  title: "LEFT / RIGHT / LENGTH",
  subtitle: "Placeholder for LEFT / RIGHT / LENGTH",
  sections: [],
};

const upperLower: LessonContent = {
  slug: "upper-lower",
  title: "UPPER / LOWER",
  subtitle: "Placeholder for UPPER / LOWER",
  sections: [],
};

const trimReplace: LessonContent = {
  slug: "trim-replace",
  title: "TRIM / REPLACE",
  subtitle: "Placeholder for TRIM / REPLACE",
  sections: [],
};

const positionSplitPart: LessonContent = {
  slug: "position-split-part",
  title: "POSITION / SPLIT_PART",
  subtitle: "Placeholder for POSITION / SPLIT_PART",
  sections: [],
};

const castToChar: LessonContent = {
  slug: "cast-to-char",
  title: "CAST / TO_CHAR (Type Casting)",
  subtitle: "Placeholder for CAST / TO_CHAR (Type Casting)",
  sections: [],
};

const regex: LessonContent = {
  slug: "regex",
  title: "Regular Expressions (Regex)",
  subtitle: "Placeholder for Regular Expressions (Regex)",
  sections: [],
};

// =============================================================
// TOPIC INDEX
// =============================================================

export const SPECIALIZED_TOPICS: Record<string, FoundationTopicMeta> = {
  "string-functions": {
    slug: "string-functions",
    title: "String Functions",
    category: "Specialized Data Handling",
    iconKey: "terminal",
    blurb:
      "CONCAT, SUBSTRING, TRIM, REPLACE, CHARINDEX/POSITION, and regex patterns for text wrangling.",
    lessons: [
      concatSubstring,
      leftRightLength,
      upperLower,
      trimReplace,
      positionSplitPart,
      castToChar,
      regex,
    ],
  },
  "numeric-functions": {
    slug: "numeric-functions",
    title: "Numeric Functions",
    category: "Specialized Data Handling",
    iconKey: "terminal",
    blurb: "ROUND, CEIL/FLOOR, ABS, MOD/%, POWER/SQRT — the math layer of SQL.",
    lessons: [],
  },
  "datetime-functions": {
    slug: "datetime-functions",
    title: "Date & Time",
    category: "Specialized Data Handling",
    iconKey: "terminal",
    blurb: "Time zones, date arithmetic, DATEDIFF / DATE_TRUNC, and interval handling.",
    lessons: [],
  },
  "conversions": {
    slug: "conversions",
    title: "Conversions",
    category: "Specialized Data Handling",
    iconKey: "terminal",
    blurb: "CAST and CONVERT — for schema evolution and cross-type operations.",
    lessons: [],
  },
  "error-handling": {
    slug: "error-handling",
    title: "Error Handling",
    category: "Specialized Data Handling",
    iconKey: "terminal",
    blurb: "TRY...CATCH (and equivalents) inside SQL scripts to prevent total failure during batch operations.",
    lessons: [],
  },
};
