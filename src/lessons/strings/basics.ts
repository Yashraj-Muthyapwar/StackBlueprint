import stringIndexingImg from "@/images/dsa/strings/strings-and-characters-indexing.png";
import stringOperationsImg from "@/images/dsa/strings/string-operations-pipeline.png";
import type { LessonBuilder, Section, Step } from "../types";

type StringInputs = { text: string };

const charactersSections: Section[] = [
  {
    kind: "prose",
    heading: "Why strings deserve their own toolkit",
    body: [
      "A string is an ordered sequence of characters. That order lets you read a character by index, compare two positions, or scan from left to right. Those actions become the building blocks for substring, palindrome, and window problems.",
      "Think of a string as a fixed snapshot of text. Python strings are immutable, so an expression such as `text.upper()` gives you a new string instead of changing the existing one. That detail determines how you solve every transformation problem that follows.",
    ],
  },
  {
    kind: "image",
    src: stringIndexingImg,
    alt: "The characters in STACK labeled with indices 0 through 4, followed by a separate BTACK string to show that changing a character creates a new string.",
    caption:
      "A string has stable zero-based positions. Replacing a character produces a separate string.",
  },
  { kind: "string-character-explorer" },
  {
    kind: "interactive-code",
    caption: "Read characters from either end",
    code: `text = "stack"

print("first:", text[0])
print("middle:", text[2])
print("last:", text[-1])
print("length:", len(text))`,
  },
  {
    kind: "prose",
    heading: "Indexing rules",
    body: [
      "Index `0` selects the first character. Negative indices count backward, so `text[-1]` selects the final character. Reading a known valid index is `O(1)`, but an index outside the range raises `IndexError`.",
      "The same character has two valid addresses: a positive index from the start and a negative index from the end. For `text = 'stack'`, `text[2]` and `text[-3]` both select `'a'`.",
    ],
  },
  {
    kind: "callout",
    tone: "warn",
    title: "Do not read past the string",
    body: "`text[len(text)]` is outside the valid range because the final valid positive index is `len(text) - 1`. Check bounds before indexing when the position comes from input or a loop with changing pointers.",
  },
  {
    kind: "interactive-code",
    caption: "Build a changed string",
    code: `word = "cat"

# Strings cannot assign directly to a character position.
# word[0] = "b"  # TypeError

changed = "b" + word[1:]
print(changed)
print(word)`,
  },
  {
    kind: "table",
    caption: "Core character operations",
    headers: ["Operation", "Example", "Cost"],
    rows: [
      ["Read a character", "`text[index]`", "`O(1)`"],
      ["Read the final character", "`text[-1]`", "`O(1)`"],
      ["Get length", "`len(text)`", "`O(1)`"],
      ["Build a replacement", "`text[:i] + value + text[i + 1:]`", "`O(n)`"],
    ],
  },
  {
    kind: "takeaways",
    items: [
      "A string is an ordered, zero-indexed character sequence with both positive and negative indices.",
      "Known character reads and `len(text)` are `O(1)`, while an unknown-character scan is `O(n)`.",
      "Python strings are immutable, so transformations construct new strings instead of editing old ones.",
    ],
  },
  {
    kind: "quiz",
    questions: [
      {
        id: "string-characters-1",
        question: "What does `" + "`word[-1]`" + " select?",
        options: [
          "The first character",
          "The final character",
          "The string length",
          "An invalid index",
        ],
        correctIndex: 1,
        explanation: "Negative index -1 refers to the final character.",
      },
      {
        id: "string-characters-2",
        question: "Why does `word[0] = 'B'` fail for a Python string?",
        options: [
          "Strings use one-based indexing",
          "Strings are immutable",
          "Characters cannot be compared",
          "Only lists support indexing",
        ],
        correctIndex: 1,
        explanation: "A string cannot be changed in place. Build a new string instead.",
      },
      {
        id: "string-characters-3",
        question: "What is the usual time cost of reading a valid `text[7]`?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctIndex: 0,
        explanation: "A known index directly identifies its character.",
      },
      {
        id: "string-characters-4",
        question: "Which expression returns the length of `text`?",
        options: ["`text.length()`", "`size(text)`", "`len(text)`", "`text[-1]`"],
        correctIndex: 2,
        explanation: "Python uses the built-in `len` function for sequence length.",
      },
      {
        id: "string-characters-5",
        question: "Create `word = 'code'` and print its third character.",
        interactiveCode: true,
        initialCode: "# Write your code here\n",
        testCode: "print(word[2])",
        expectedOutput: "d",
        explanation: "Index 2 is the third position because string indices start at 0.",
      },
    ],
  },
];

const operationsSections: Section[] = [
  {
    kind: "prose",
    heading: "The operations used before an algorithm starts",
    body: [
      "Most string problems begin with a small preparation step: take a slice, normalize case, remove surrounding whitespace, split words, or join a result. Use the operation that states your intent clearly before reaching for a manual loop.",
    ],
  },
  {
    kind: "image",
    src: stringOperationsImg,
    alt: "Two independent Python string examples: one trims and lowercases Data Structures before taking prefix and suffix slices; the other splits scan strings carefully and joins the words with hyphens.",
    caption:
      "These two diagrams match the lesson code: normalize and slice `raw` on the left, then split and join `sentence` on the right.",
  },
  {
    kind: "interactive-code",
    caption: "Slice and normalize text",
    code: `raw = "  Data Structures  "

clean = raw.strip().lower()
prefix = clean[:4]
suffix = clean[-10:]

print(clean)
print(prefix)
print(suffix)`,
  },
  {
    kind: "prose",
    heading: "Slices use a half-open range",
    body: [
      "`text[start:stop]` includes `start` and excludes `stop`. This matches `range(start, stop)` and makes slice length easy to reason about: `stop - start`. A slice of `k` characters takes `O(k)` time and space because Python creates a new string.",
    ],
  },
  {
    kind: "interactive-code",
    caption: "Split words and join a result",
    code: `sentence = "scan strings carefully"
words = sentence.split()

tag = "-".join(words)
reversed_words = " ".join(reversed(words))

print(words)
print(tag)
print(reversed_words)`,
  },
  {
    kind: "callout",
    tone: "warn",
    title: "Avoid repeated concatenation in a loop",
    body: "Building a long string with repeated `result += piece` can repeatedly copy prior content. Collect pieces in a list and use `''.join(pieces)` once when the result can grow large.",
  },
  {
    kind: "table",
    caption: "Useful string operations",
    headers: ["Goal", "Operation", "Typical cost"],
    rows: [
      ["Take part of a string", "`text[start:stop]`", "`O(k)` for k copied characters"],
      ["Normalize case", "`text.lower()` or `text.upper()`", "`O(n)`"],
      ["Trim ends", "`text.strip()`", "`O(n)`"],
      ["Break into words", "`text.split()`", "`O(n)`"],
      ["Combine pieces", "`separator.join(parts)`", "`O(total output length)`"],
    ],
  },
  {
    kind: "takeaways",
    items: [
      "Slices are half-open: the start is included and the stop is excluded.",
      "String methods return new strings because strings are immutable.",
      "Use `join` when combining many pieces into one final result.",
    ],
  },
  {
    kind: "quiz",
    questions: [
      {
        id: "string-operations-1",
        question: "What is returned by `" + "`'python'[1:4]`" + "?",
        options: ["`pyt`", "`yth`", "`tho`", "`ython`"],
        correctIndex: 1,
        explanation: "The slice includes index 1 and excludes index 4.",
      },
      {
        id: "string-operations-2",
        question: "Which method is the best way to combine a list of many string pieces?",
        options: ["`append`", "`join`", "`strip`", "`split`"],
        correctIndex: 1,
        explanation: "`join` builds the final string from a collection of pieces.",
      },
      {
        id: "string-operations-3",
        question: "Why does a slice of k characters require O(k) work?",
        options: [
          "It sorts the string",
          "It copies those characters into a new string",
          "It scans a hash map",
          "It changes the original string",
        ],
        correctIndex: 1,
        explanation: "Python creates a new string containing the slice.",
      },
      {
        id: "string-operations-4",
        question: "What does `" + "`'  Hi  '.strip()`" + " return?",
        options: ["`'  Hi  '`", "`'Hi'`", "`'hi'`", "`['Hi']`"],
        correctIndex: 1,
        explanation: "`strip` removes whitespace at the beginning and end.",
      },
      {
        id: "string-operations-5",
        question: "Split `" + "`'red blue'`" + " into words and print them joined with a colon.",
        interactiveCode: true,
        initialCode: "# Write your code here\n",
        testCode: "print(result)",
        expectedOutput: "red:blue",
        explanation: "Use `words = 'red blue'.split()` and `result = ':'.join(words)`.",
      },
    ],
  },
];

const scansSections: Section[] = [
  {
    kind: "prose",
    heading: "Scan once, keep only the state you need",
    body: [
      "A left-to-right scan is the foundation of many string algorithms. Visit each character once, update a small amount of state, and decide whether the current character changes the answer. This pattern appears again in sliding windows and frequency-based problems.",
    ],
  },
  {
    kind: "interactive-code",
    caption: "Traverse characters with their indices",
    code: `text = "level"

for index, character in enumerate(text):
    print(index, character)`,
  },
  {
    kind: "prose",
    heading: "Count characters with a dictionary",
    body: [
      "A dictionary maps each character to its current count. The scan is `O(n)` time for a string of length n. The extra space is `O(u)`, where u is the number of distinct characters encountered.",
    ],
  },
  {
    kind: "interactive-code",
    caption: "Build a character-frequency map",
    code: `text = "banana"
counts = {}

for character in text:
    counts[character] = counts.get(character, 0) + 1

print(counts)
print("a occurs", counts["a"], "times")`,
  },
  {
    kind: "table",
    caption: "Scan costs",
    headers: ["Task", "Time", "Extra space"],
    rows: [
      ["Visit every character", "`O(n)`", "`O(1)`"],
      ["Find one known index", "`O(1)`", "`O(1)`"],
      ["Find an unknown character", "`O(n)`", "`O(1)`"],
      ["Build frequency counts", "`O(n)`", "`O(u)`"],
    ],
  },
  {
    kind: "takeaways",
    items: [
      "`enumerate` gives a character and its index during a single scan.",
      "An unknown character search can require looking at every position.",
      "Frequency maps trade `O(u)` space for fast count updates and lookups.",
    ],
  },
  {
    kind: "quiz",
    questions: [
      {
        id: "string-scans-1",
        question: "What does `enumerate(text)` provide inside a loop?",
        options: ["Only characters", "Only indices", "An index and a character", "A sorted string"],
        correctIndex: 2,
        explanation: "Each iteration produces the current index and its character.",
      },
      {
        id: "string-scans-2",
        question: "What is the worst-case cost of finding an unknown character in a string?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctIndex: 2,
        explanation: "The target may be at the final position or absent, requiring a full scan.",
      },
      {
        id: "string-scans-3",
        question: "What does `counts.get(character, 0) + 1` accomplish?",
        options: [
          "It sorts characters",
          "It increments a count, starting at zero when absent",
          "It removes a character",
          "It reverses the string",
        ],
        correctIndex: 1,
        explanation: "`get` supplies zero for a character that has not appeared yet.",
      },
      {
        id: "string-scans-4",
        question: "What does u represent in O(u) extra space for a frequency map?",
        options: [
          "The string's Unicode version",
          "The number of unique characters",
          "The number of updates",
          "The number of uppercase characters",
        ],
        correctIndex: 1,
        explanation: "The dictionary holds one entry for each distinct character encountered.",
      },
      {
        id: "string-scans-5",
        question: "Count the characters in `" + "`'aba'`" + " and print the count for `a`.",
        interactiveCode: true,
        initialCode: "# Write your code here\n",
        testCode: "print(counts['a'])",
        expectedOutput: "2",
        explanation: "Scan the text, update `counts` with `get`, then read `counts['a']`.",
      },
    ],
  },
];

function buildCharacters({ text }: StringInputs): Step[] {
  const chars = text.split("");
  return chars.map((character, index) => ({
    line: 1,
    array: chars,
    pointers: [{ name: "index", index, color: "mint" }],
    highlight: { kind: "match", indices: [index] },
    status: `text[${index}] = '${character}'`,
    narration: `Read character ${index}: '${character}'.`,
  }));
}

export const stringCharacters: LessonBuilder<StringInputs> = {
  slug: "strings-and-characters",
  title: "Strings and Characters",
  subtitle: "Read characters by index and understand why Python strings are immutable.",
  problem: "Build the indexing and immutability foundation needed for string algorithms.",
  spotIt: [
    "You need a character at a known position.",
    "The problem asks you to modify or compare text.",
  ],
  avoidWhen: [
    "You need numeric matrix operations.",
    "The input is organized by arbitrary keys rather than character positions.",
  ],
  variant: "string-basics",
  view: "array",
  code: "# Explore the concept lesson for runnable string examples.",
  sections: charactersSections,
  defaultInputs: { text: "stack" },
  inputs: [{ key: "text", label: "Text", kind: "string" }],
  validate: ({ text }) =>
    text.length > 16 ? ["Trim to 16 characters for a readable walkthrough."] : [],
  build: buildCharacters,
};

export const stringOperations: LessonBuilder<StringInputs> = {
  slug: "string-operations",
  title: "String Operations",
  subtitle: "Slice, normalize, split, and join text without losing track of the cost.",
  problem: "Prepare and transform text using Python's core string operations.",
  spotIt: [
    "The prompt asks you to clean, split, combine, or take part of text.",
    "You need a substring or normalized comparison.",
  ],
  avoidWhen: [
    "You need to mutate individual characters in place.",
    "You need numerical vector operations.",
  ],
  variant: "string-basics",
  view: "array",
  code: "# Explore the concept lesson for runnable string operations.",
  sections: operationsSections,
  defaultInputs: { text: "strings" },
  inputs: [{ key: "text", label: "Text", kind: "string" }],
  validate: ({ text }) =>
    text.length > 16 ? ["Trim to 16 characters for a readable walkthrough."] : [],
  build: buildCharacters,
};

export const stringScans: LessonBuilder<StringInputs> = {
  slug: "string-scans-and-counts",
  title: "String Scans and Counts",
  subtitle: "Traverse characters once and keep counts that unlock common string techniques.",
  problem:
    "Scan a string efficiently and track the information needed to answer a character question.",
  spotIt: [
    "You need to inspect characters in order.",
    "The result depends on how often characters appear.",
  ],
  avoidWhen: [
    "The problem needs a fixed-width numeric calculation.",
    "You already have a direct index for the only character you need.",
  ],
  variant: "string-basics",
  view: "array",
  code: "# Explore the concept lesson for runnable string scans.",
  sections: scansSections,
  defaultInputs: { text: "banana" },
  inputs: [{ key: "text", label: "Text", kind: "string" }],
  validate: ({ text }) =>
    text.length > 16 ? ["Trim to 16 characters for a readable walkthrough."] : [],
  build: buildCharacters,
};
