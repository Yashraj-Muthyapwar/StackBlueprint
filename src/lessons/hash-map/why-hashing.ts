import type { LessonBuilder, QuizQuestion, Section } from "../types";

/**
 * Hidden grader for the "count known IDs" challenge. The known IDs arrive in a list that raises on
 * `in`, `index` and `count` and allows only one pass over its values, so a learner has to build a
 * set once and then look each query up in it. Reaches builtins directly so shadowing cannot fake it.
 */
const knownIdTests = String.raw`
import builtins as _sb_b

class _SbList(_sb_b.list):
    passes = 0
    def __iter__(self):
        _SbList.passes += 1
        if _SbList.passes > 1:
            raise _sb_b.RuntimeError("Do not scan the list for every query. Build a set once.")
        return _sb_b.list.__iter__(self)
    def __contains__(self, item):
        raise _sb_b.RuntimeError("Do not use 'in' on the list. Build a set once.")
    def index(self, *args):
        raise _sb_b.RuntimeError("Do not search the list for every query. Build a set once.")
    def count(self, *args):
        raise _sb_b.RuntimeError("Do not search the list for every query. Build a set once.")

def _sb_expected(known, queries):
    want = _sb_b.set(known)
    total = 0
    for q in queries:
        if q in want:
            total += 1
    return total

def _sb_grade():
    cases = [
        ([101, 205, 309, 412, 518], [412, 999, 101, 101]),
        ([], [1, 2, 3]),
        ([5], []),
        ([7, 7, 7], [7, 8, 7]),
        ([-3, 0, 3], [0, -3, 3, 4]),
    ]
    seed = 987654321
    for size in _sb_b.range(40):
        known = []
        queries = []
        for _k in _sb_b.range(size * 5):
            seed = (seed * 1103515245 + 12345) % 2147483648
            known.append((seed >> 8) % 400 - 100)
        for _k in _sb_b.range(size * 5 + 3):
            seed = (seed * 1103515245 + 12345) % 2147483648
            queries.append((seed >> 8) % 400 - 100)
        cases.append((known, queries))
    for known, queries in cases:
        want = _sb_expected(known, queries)
        _SbList.passes = 0
        inputs = _SbList(known)
        asked = _sb_b.list(queries)
        try:
            got = count_known_ids(inputs, asked)
        except _sb_b.RuntimeError as problem:
            return _sb_b.str(problem)
        if asked != queries or _sb_b.list.copy(inputs) != known:
            return "count_known_ids must not change its inputs."
        if got != want:
            return "Wrong answer: expected " + _sb_b.str(want) + " but got " + _sb_b.str(got) + " for " + _sb_b.str(known) + " and " + _sb_b.str(queries) + "."
    return "All hidden tests passed"

_sb_b.print(_sb_grade())`;

const challenge: QuizQuestion = {
  id: "count-known-ids",
  question:
    "Practical challenge: Count known IDs. Write a function `count_known_ids(known_ids, queries)` that returns how many values in `queries` appear in `known_ids`. A repeated query counts every time it appears. The list `known_ids` may be large and `queries` may be long, so build a hash set once and use it for the lookups. For `known_ids = [101, 205, 309, 412, 518]` and `queries = [412, 999, 101, 101]` the answer is `3`.",
  interactiveCode: true,
  initialCode: `def count_known_ids(known_ids, queries):
    # Write your code here.
    pass


known_ids = [101, 205, 309, 412, 518]
queries = [412, 999, 101, 101]
print(count_known_ids(known_ids, queries))
`,
  testCode: knownIdTests,
  expectedOutput: "All hidden tests passed",
  gradeLastLine: true,
  requiredCodePatterns: [
    String.raw`def\s+count_known_ids\s*\(`,
    String.raw`\bset\s*\(|\{[^}]*\bfor\b|=\s*\{`,
  ],
  validationMessage:
    "Define `count_known_ids(known_ids, queries)` and build a set from `known_ids` before looking up the queries.",
  forbiddenCodePatterns: [
    {
      pattern: String.raw`\bimport\b|__|\bexec\b|\beval\b|\bglobals\b|\bsetattr\b|\bcompile\b`,
      message: "This challenge does not need imports or Python internals. Use a set.",
    },
  ],
  explanation:
    "Build `known = set(known_ids)` once, then loop over `queries` and count the ones that satisfy `query in known`. The set costs O(n) to build and each lookup is O(1) on average, so the total is O(n + q) instead of O(n * q). The hidden tests make the list raise if you search it for every query.",
};

const quizQuestions: QuizQuestion[] = [
  {
    id: "why-hashing-cost",
    question:
      "A list has n values and you run q membership checks with linear search. What is the worst-case time?",
    options: ["O(n * q)", "O(n + q)", "O(q)"],
    correctIndex: 0,
    explanation:
      "Each check can examine all n values, and there are q checks, so the work is n * q in the worst case.",
  },
  {
    id: "why-hashing-function",
    question: "What does a hash function do for a hash table?",
    options: [
      "It turns a key into a hash value that helps locate where the key is stored.",
      "It sorts the keys so binary search can be used.",
      "It guarantees that no two keys share a storage location.",
    ],
    correctIndex: 0,
    explanation:
      "The hash value helps the table select a location. It does not sort keys, and different keys can still land in the same place, which is called a collision.",
  },
  {
    id: "why-hashing-guarantee",
    question: "Which statement about hash table lookups is correct?",
    options: [
      "They are O(1) on average, but collisions can increase the work.",
      "They are always O(1), whatever the keys are.",
      "They are O(log n) because the table is kept sorted.",
    ],
    correctIndex: 0,
    explanation:
      "Hashing gives O(1) average-case lookup, insertion and deletion. Collisions mean some operations take more work, so it is not a guarantee for every operation.",
  },
  {
    id: "why-hashing-tradeoff",
    question: "Which task is a good reason to choose a list instead of a set?",
    options: [
      "You need to read element 0 and keep duplicate values.",
      "You only need to check whether a value exists.",
      "You need the fastest average membership check.",
    ],
    correctIndex: 0,
    explanation:
      "A list keeps positions and duplicates. A set has no index access and stores unique values, which is the cost of its fast average membership check.",
  },
  challenge,
];

const whyHashingSections: Section[] = [
  {
    kind: "prose",
    eyebrow: "1 · Why",
    heading: "The problem hashing solves",
    body: ["Suppose you have an array containing student IDs:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "Student IDs",
    code: "student_ids = [101, 205, 309, 412, 518]",
  },
  {
    kind: "prose",
    body: ["You need to check whether student ID 412 exists.", "You already know one solution:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "Linear search",
    code: 'for student_id in student_ids:\n    if student_id == 412:\n        print("Found")\n        break',
  },
  {
    kind: "prose",
    body: [
      "This works.",
      "But what happens if you have one million student IDs?",
      "In the worst case, Python must **examine all one million elements**.",
      "Now imagine a system that must search for thousands of different student IDs every second. **Repeated linear searches become expensive.**",
      "We need a way to **find an ID without searching through the entire array** every time.",
      "That is one of the main reasons **hashing exists**.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "2 · Intuition",
    heading: "Think of a library",
    body: ["Imagine a library with 10,000 books."],
  },
  {
    kind: "list",
    items: [
      {
        text: "**Linear search**",
        subitems: ["You inspect books one by one until you find the correct book."],
      },
      {
        text: "**Hashing**",
        subitems: ["A calculated location helps you find the correct storage area directly."],
      },
    ],
  },
  {
    kind: "prose",
    body: [
      "Hashing uses a **hash function** to turn a **key** into a **hash value**. The data structure uses that value to help locate where the key is stored.",
      "For example, think of this simplified model: a **hash table** with numbered storage locations. Choose an ID and compare the two approaches.",
    ],
  },
  { kind: "hashing-intuition" },
  {
    kind: "prose",
    body: ["In this example, we use:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "Simplified hash function",
    code: "hash_location = student_id % 10",
  },
  {
    kind: "prose",
    body: ["The `%` operator gives the **remainder** after division."],
  },
  {
    kind: "callout",
    tone: "warn",
    title: "A teaching example",
    body: "This is not Python's actual dictionary implementation. Real dictionaries use more sophisticated storage and lookup rules.",
  },
  {
    kind: "prose",
    eyebrow: "3 · How",
    heading: "What happens during hashing?",
    body: ["For now, learn these four steps. Step through them with the key 412."],
  },
  {
    kind: "hashing-flow",
    steps: [
      { title: "Receive a key", text: "**Receive a key.** Example: 412." },
      {
        title: "Calculate a hash",
        text: "**A hash function calculates a value** from the key.",
      },
      {
        title: "Find a location",
        text: "The hash table uses the hash value to **help select a location**.",
      },
      {
        title: "Store or find",
        text: "The table uses that location and **checks the stored key** as needed.",
      },
    ],
  },
  {
    kind: "callout",
    tone: "info",
    title: "One important rule",
    body: "**Hashing does not guarantee `O(1)` for every operation.** Hash tables generally provide `O(1)` **average-case** lookup, insertion and deletion, but **collisions** can increase the work. We will study collisions in a separate lesson. You do not need to master them now.",
  },
  {
    kind: "prose",
    eyebrow: "4 · Example",
    heading: "Python list vs set",
    body: [
      "Python gives us a built-in data structure called a set. A set supports **fast membership lookup on average**.",
    ],
  },
  {
    kind: "interactive-code",
    caption: "Membership in a set",
    code: "student_ids = {101, 205, 309, 412, 518}\nprint(412 in student_ids)",
  },
  { kind: "prose", body: ["Compare the two approaches:"] },
  {
    kind: "interactive-code",
    caption: "List and set side by side",
    code: "# List\nstudents_list = [101, 205, 309, 412, 518]\nprint(412 in students_list)\n\n# Set\nstudents_set = {101, 205, 309, 412, 518}\nprint(412 in students_set)",
  },
  {
    kind: "prose",
    body: ["Both produce the same result. But their typical lookup costs differ."],
  },
  {
    kind: "table",
    caption: "List and set compared",
    headers: ["Operation", "List", "Set"],
    rows: [
      ["Membership lookup", "`O(n)`", "`O(1)` average"],
      ["Add element", "`O(1)` amortized at end", "`O(1)` average"],
      ["Extra hash-table storage", "No", "Yes"],
      ["Duplicates", "Allowed", "Not allowed"],
    ],
  },
  { kind: "hashing-cost-chart" },
  {
    kind: "prose",
    body: [
      "For large collections with many membership checks, a set can provide a **significant performance advantage**.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "5 · Trade-offs",
    heading: "Why not always use hashing?",
    body: ["Hashing is useful, but it is not the correct choice for every problem."],
  },
  {
    kind: "table",
    caption: "What hashing costs",
    headers: ["Cost", "What it means"],
    rows: [
      ["**Extra memory**", "Hash tables need space for their internal structure."],
      ["**No index-based access**", "You cannot use `my_set[0]`."],
      ["**No duplicate elements**", "A set stores unique values."],
      ["**No sorted order**", "A set does not maintain elements in sorted order."],
      ["**Collisions**", "Multiple keys can compete for the same storage location."],
    ],
  },
  {
    kind: "callout",
    tone: "info",
    title: "Choosing between them",
    body: "Use a **list** when you need element positions or duplicates. Use a **set** when you mainly need to check membership or store unique values.",
  },
  {
    kind: "prose",
    eyebrow: "6 · Practice",
    heading: "Your turn",
    body: [
      "**Do not use a hash set yet.** First, show that you understand the problem hashing solves.",
      "Suppose you have a Python list containing 500,000 unique integers. You need to check whether 100 different values exist in that list. You use linear search for each lookup.",
    ],
  },
  {
    kind: "pattern-exercises",
    exercises: [
      {
        type: "fields",
        label: "Question 1",
        title: "Search cost",
        prompt: "What is the worst-case number of comparisons across all 100 searches?",
        fields: [{ label: "Comparisons", answer: 50000000, tone: "accent" }],
        success: "Correct. 100 searches times 500,000 comparisons each is 50,000,000.",
        hint: "One search can compare against every value. Multiply by the number of searches.",
      },
      {
        type: "choice",
        label: "Question 2",
        title: "Time complexity",
        prompt: "What is the time complexity in terms of n (list size) and q (number of searches)?",
        options: ["O(n * q)", "O(n + q)", "O(log n * q)"],
        answer: 0,
        success: "Right. Each of the q searches can scan all n values.",
        hint: "Count the work per search, then count how many searches there are.",
      },
      {
        type: "choice",
        label: "Question 3",
        title: "Why a set",
        prompt: "Why might a set be useful if you expect many repeated searches?",
        options: [
          "Building it once lets each later membership check take O(1) on average.",
          "It keeps the values sorted, so each search can stop early.",
          "It removes the need to look at any values at all.",
        ],
        answer: 0,
        success:
          "Correct. You pay once to build the set, then every search avoids scanning the whole collection.",
        hint: "Think about paying a cost once and saving work on every search after it.",
      },
    ],
  },
  {
    kind: "takeaways",
    items: [
      "Linear search can examine every element, so many repeated searches over a large list become expensive.",
      "Hashing turns a key into a hash value that helps locate where the key is stored.",
      "Hash tables generally give `O(1)` average-case lookup, insertion and deletion. Collisions can increase the work.",
      "A set gives fast average membership checks but has no index access, no duplicates and no sorted order.",
      "Use a list when you need positions or duplicates, and a set when you mainly check membership or need unique values.",
    ],
  },
  { kind: "quiz", questions: quizQuestions },
];

export const whyHashing: LessonBuilder<Record<string, never>> = {
  slug: "why-hashing",
  title: "Hashing Foundations: Why Hashing Exists",
  subtitle: "See the search cost that hashing removes and when a set beats a list.",
  problem: "Check whether a value exists in a large collection without scanning all of it.",
  spotIt: [
    "The problem asks whether a value exists, and it asks many times.",
    "Order and position do not matter, only membership.",
  ],
  avoidWhen: [
    "You need element positions, duplicates or sorted order.",
    "The collection is tiny, where a list scan is just as fast.",
  ],
  takeaways: [
    "Linear search costs O(n) per check.",
    "A set gives O(1) average membership after one build.",
    "Hashing costs memory and gives up order and indexes.",
  ],
  variant: "why-hashing",
  view: "array",
  code: "def count_known_ids(known_ids, queries):\n    known = set(known_ids)\n    return sum(1 for query in queries if query in known)",
  sections: whyHashingSections,
  defaultInputs: {},
  inputs: [],
  build: () => [
    {
      line: 1,
      array: [101, 205, 309, 412, 518],
      narration: "Use the concept lesson to compare a linear search with a hash lookup.",
    },
  ],
};
