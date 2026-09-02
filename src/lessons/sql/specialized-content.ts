import type { LessonContent, FoundationTopicMeta } from "../types";
import concatSubstringImg from "@/images/sql/string-functions/concat-substring-cycle-depot.png";

// =============================================================
// STRING FUNCTIONS
// =============================================================
const concatSubstring: LessonContent = {
  slug: "concat-substring",
  title: "CONCAT / SUBSTRING: Build and Extract Text",
  subtitle: "Join Cycle Depot text into useful labels, then pull out the exact characters you need.",
  sections: [
    {
      kind: "prose",
      heading: "Turn stored text into a useful result",
      body: [
        "Text columns often contain the pieces of a label rather than the label itself. A customer name and email can become one contact card; a long product name can become a short catalog prefix.",
        "`CONCAT` joins text values into one new string. `SUBSTRING` copies a consecutive portion of a string. Both shape the query result only; they do not edit the stored customer or product data.",
      ],
    },
    {
      kind: "image",
      src: concatSubstringImg,
      alt: "A Cycle Depot customer record visual showing two text values merging into a contact card and a highlighted slice being extracted from text.",
      caption: "CONCAT joins text pieces into one value. SUBSTRING copies a selected consecutive piece of text.",
    },
    {
      kind: "prose",
      heading: "Build one contact label with CONCAT",
      body: [
        "Pass the pieces to `CONCAT` in the order you want them displayed. Literal text such as a space, angle brackets, or a separator is also an argument. `AS contact_card` gives the computed result column a useful name.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Turn Cycle Depot customer fields into a contact card",
      code: `SELECT
  name,
  email,
  CONCAT(name, ' <', email, '>') AS contact_card
FROM customers
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "First four customers in the current Cycle Depot dataset",
      headers: ["name", "email", "contact_card"],
      rows: [
        ["Zane Novak", "zane.novak1@example.com", "Zane Novak <zane.novak1@example.com>"],
        ["Boris Alvarez", "boris.alvarez2@example.com", "Boris Alvarez <boris.alvarez2@example.com>"],
        ["Priya Doyle", "priya.doyle3@example.com", "Priya Doyle <priya.doyle3@example.com>"],
        ["Ugo Mensah", "ugo.mensah4@example.com", "Ugo Mensah <ugo.mensah4@example.com>"],
      ],
    },
    {
      kind: "animation",
      variant: "q-concat-substring",
      caption: "CONCAT joins full text values. SUBSTRING starts at position 1 and returns exactly the requested number of characters.",
    },
    {
      kind: "prose",
      heading: "Take a fixed slice with SUBSTRING",
      body: [
        "`SUBSTRING(text FROM start FOR length)` begins counting at 1, not 0. It returns `length` consecutive characters. Here, every product keeps its stored name, while `name_prefix` supplies the first five characters for a compact catalog label.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Extract the first five characters from each product name",
      code: `SELECT
  name,
  SUBSTRING(name FROM 1 FOR 5) AS name_prefix
FROM products
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "The same starting position and length are applied to every row",
      headers: ["name", "name_prefix"],
      rows: [
        ["Trailhead 29 Hardtail", "Trail"],
        ["Trailhead 29 Carbon", "Trail"],
        ["Boulder Full Suspension", "Bould"],
        ["Switchback Enduro", "Switc"],
      ],
    },
    {
      kind: "prose",
      heading: "Use the result of one function inside another",
      body: [
        "Functions can be nested. SQL evaluates the inner `SUBSTRING` first, then passes its short result into `CONCAT`. This creates a new value for each row without changing the original name or country.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Build a short customer label from an extracted initial",
      code: `SELECT
  name,
  country,
  CONCAT(SUBSTRING(name FROM 1 FOR 1), '. customer in ', country) AS short_label
FROM customers
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "The inner slice becomes one input to CONCAT",
      headers: ["name", "country", "short_label"],
      rows: [
        ["Zane Novak", "USA", "Z. customer in USA"],
        ["Boris Alvarez", "UK", "B. customer in UK"],
        ["Priya Doyle", "UK", "P. customer in UK"],
        ["Ugo Mensah", "USA", "U. customer in USA"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Know what a fixed slice means",
      body: "SUBSTRING(name FROM 1 FOR 5) always takes five characters. It does not know where a word ends. Use a delimiter-aware function in a later lesson when you need to split text at a separator.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Missing text needs a deliberate choice",
      body: "In PostgreSQL, CONCAT treats a NULL argument as an empty string, while the || operator returns NULL if either side is NULL. Decide whether a blank or a missing label better represents the report before you build it.",
    },
    {
      kind: "playground-practice",
      title: "Build compact product labels",
      prompt: "Return name, category, and compact_label from products. Use SUBSTRING(name FROM 1 FOR 5) to take the prefix, then use CONCAT to join it to category with ' - '. Name the result compact_label, order by id, and run the checked exercise.",
      tables: ["products"],
      successCheck: "30 rows with exactly name, category, and compact_label, ordered by id.",
      href: "/sql-playground?practice=cycledepot-compact-product-labels",
    },
    {
      kind: "takeaways",
      items: [
        "CONCAT joins values and literal separators into one text result.",
        "SUBSTRING uses 1-based positions and returns the number of characters requested.",
        "Nested functions are evaluated from the inside out, letting a substring become an input to CONCAT.",
        "These expressions change the query output, not the stored table data.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "concat-purpose",
          question: "What does CONCAT(name, ' <', email, '>') create for each customer row?",
          options: ["A new stored customer record", "One text value built from the name, email, and separators", "A filter that removes customers without an email", "A numeric count of email addresses"],
          correctIndex: 1,
          explanation: "CONCAT returns one text expression for the current row. It does not modify or filter the table.",
        },
        {
          id: "substring-start",
          question: "What is returned by SUBSTRING('Trailhead' FROM 1 FOR 5)?",
          options: ["railh", "Trail", "Trailhead", "head"],
          correctIndex: 1,
          explanation: "SUBSTRING positions start at 1, so it copies the first five characters: Trail.",
        },
        {
          id: "substring-fixed-length",
          question: "Why can SUBSTRING(name FROM 1 FOR 5) split a word partway through?",
          options: ["It always takes a fixed number of characters", "It only works with product names", "It removes spaces before reading", "It searches for the next word boundary"],
          correctIndex: 0,
          explanation: "A fixed substring counts characters. It does not interpret words or separators.",
        },
        {
          id: "nested-order",
          question: "In CONCAT(SUBSTRING(name FROM 1 FOR 1), '. customer'), which operation happens first?",
          options: ["CONCAT", "ORDER BY", "SUBSTRING", "AS"],
          correctIndex: 2,
          explanation: "SQL evaluates the nested SUBSTRING first, then passes that one-character result to CONCAT.",
        },
      ],
    },
  ],
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
