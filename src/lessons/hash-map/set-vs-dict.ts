import type { LessonBuilder, QuizQuestion, Section } from "../types";

/**
 * Hidden grader for the "first repeated ID" challenge. The IDs arrive in a list that raises on
 * `in`, `index`, `count` and slicing, and counts every read, so a learner has to remember the IDs
 * seen so far in a set. Reads are budgeted on a 300-value input, which rejects nested scans.
 * Builtins are reached directly so shadowing cannot fake a pass.
 */
const firstRepeatTests = String.raw`
import builtins as _sb_b

class _SbList(_sb_b.list):
    reads = 0
    def __iter__(self):
        _SbList.reads += _sb_b.len(self)
        return _sb_b.list.__iter__(self)
    def __getitem__(self, key):
        if _sb_b.isinstance(key, _sb_b.slice):
            raise _sb_b.RuntimeError("Do not slice the list. Remember the IDs you have seen in a set.")
        _SbList.reads += 1
        return _sb_b.list.__getitem__(self, key)
    def __contains__(self, item):
        raise _sb_b.RuntimeError("Do not use 'in' on the list. Remember the IDs you have seen in a set.")
    def index(self, *args):
        raise _sb_b.RuntimeError("Do not search the list. Remember the IDs you have seen in a set.")
    def count(self, *args):
        raise _sb_b.RuntimeError("Do not search the list. Remember the IDs you have seen in a set.")

def _sb_expected(values):
    seen = _sb_b.set()
    for value in values:
        if value in seen:
            return value
        seen.add(value)
    return None

def _sb_grade():
    cases = [
        [3, 1, 4, 1, 5, 3],
        [1, 2, 3],
        [],
        [7],
        [5, 5],
        [2, 9, 2, 9],
        [0, -1, -1, 0],
        [8, 6, 7, 5, 3, 0, 9, 3, 8],
    ]
    seed = 424242
    for size in _sb_b.range(1, 60):
        values = []
        for _k in _sb_b.range(size):
            seed = (seed * 1103515245 + 12345) % 2147483648
            values.append((seed >> 8) % (size * 2 + 5))
        cases.append(values)
    big = _sb_b.list(_sb_b.range(300))
    cases.append(big)
    cases.append(big + [299])
    for values in cases:
        want = _sb_expected(values)
        _SbList.reads = 0
        inputs = _SbList(values)
        try:
            got = first_repeat(inputs)
        except _sb_b.RuntimeError as problem:
            return _sb_b.str(problem)
        if _sb_b.list.copy(inputs) != values:
            return "first_repeat must not change the list."
        if got != want:
            return "Wrong answer: expected " + _sb_b.str(want) + " but got " + _sb_b.str(got) + " for " + _sb_b.str(values) + "."
        if _SbList.reads > 2 * _sb_b.len(values) + 5:
            return "Too many reads: look at each ID once and use a set for the IDs you have seen."
    return "All hidden tests passed"

_sb_b.print(_sb_grade())`;

const challenge: QuizQuestion = {
  id: "first-repeat",
  question:
    "Practical challenge: First repeated ID. Write a function `first_repeat(user_ids)` that returns the first ID whose second appearance comes earliest while reading the list from left to right. Return `None` if no ID repeats. Use a set to remember the IDs you have already seen. For `[3, 1, 4, 1, 5, 3]` the answer is `1`, because the second `1` appears before the second `3`.",
  interactiveCode: true,
  initialCode: `def first_repeat(user_ids):
    # Write your code here.
    pass


print(first_repeat([3, 1, 4, 1, 5, 3]))
`,
  testCode: firstRepeatTests,
  expectedOutput: "All hidden tests passed",
  gradeLastLine: true,
  requiredCodePatterns: [String.raw`def\s+first_repeat\s*\(`, String.raw`\bset\s*\(|=\s*\{`],
  validationMessage:
    "Define `first_repeat(user_ids)` and create a set for the IDs you have already seen.",
  forbiddenCodePatterns: [
    {
      pattern: String.raw`\bimport\b|__|\bexec\b|\beval\b|\bglobals\b|\bsetattr\b|\bcompile\b`,
      message: "This challenge does not need imports or Python internals. Use a set.",
    },
  ],
  explanation:
    "Read the IDs once. If the ID is already in the `seen` set, return it. Otherwise add it to the set. A set answers 'have I seen this?' in O(1) on average, so the whole function is O(n). The hidden tests make the list raise if you search it or slice it for every ID.",
};

const quizQuestions: QuizQuestion[] = [
  {
    id: "set-dict-choose",
    question: "You need to retrieve a student's name from their student ID. Which structure fits?",
    options: [
      "A dict, because each ID is connected to a value.",
      "A set, because IDs must be unique.",
      "A list, because it keeps the IDs in order.",
    ],
    correctIndex: 0,
    explanation:
      "A dictionary connects a key to a value, so the ID retrieves the name. A set only answers whether the ID exists.",
  },
  {
    id: "set-dict-in-keys",
    question: 'For `students = {101: "Alice"}`, what does `"Alice" in students` return?',
    options: [
      "False, because `in` on a dictionary checks keys, not values.",
      "True, because Alice is stored in the dictionary.",
      "It raises a KeyError.",
    ],
    correctIndex: 0,
    explanation:
      'The `in` operator checks keys. `101 in students` is True, while `"Alice" in students` is False because Alice is a value.',
  },
  {
    id: "set-dict-duplicates",
    question: "What does `len({10, 20, 10, 30})` return?",
    options: ["3", "4", "2"],
    correctIndex: 0,
    explanation:
      "A set stores each distinct element once, so the repeated 10 is kept only once and the set has three elements.",
  },
  challenge,
];

const setVsDictSections: Section[] = [
  {
    kind: "prose",
    body: [
      "In the previous lesson, you learned why hashing exists. You also learned that hash tables provide `O(1)` average-case lookup and that collisions can make operations slower.",
      "Now you will learn the two most important hashing data structures in Python:",
    ],
  },
  {
    kind: "list",
    items: ["`set`: stores unique elements.", "`dict`: stores key-value pairs."],
  },
  {
    kind: "prose",
    body: [
      "These data structures are fundamental to many coding interview patterns, including Two Sum, Contains Duplicate, Valid Anagram and Group Anagrams.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "1 · Why",
    heading: "Why do we need set and dict?",
    body: [
      "Imagine that you are developing a student management system. You have two requirements.",
      "**Requirement A:** check whether a student ID is registered.",
    ],
  },
  {
    kind: "code",
    language: "python",
    caption: "Requirement A",
    code: "student_ids = [101, 205, 309, 412]",
  },
  {
    kind: "prose",
    body: [
      "You only need to know whether an ID exists.",
      "**Requirement B:** find the name associated with a student ID.",
    ],
  },
  {
    kind: "code",
    language: "python",
    caption: "Requirement B",
    code: 'student_ids = [101, 205, 309, 412]\nstudent_names = ["Alice", "Bob", "Charlie", "David"]',
  },
  {
    kind: "prose",
    body: [
      "You now need to connect each student ID to a name.",
      "Both problems involve lookup, but they require **different information**.",
      "Python provides two different hash-based data structures to solve them.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "2 · Intuition",
    heading: "Think of a school",
    body: ["Choose a student ID and compare what each structure tells you."],
  },
  { kind: "set-dict-intuition" },
  {
    kind: "prose",
    body: ["Mental model:"],
  },
  {
    kind: "list",
    items: [
      "**Set:** does this item exist?",
      "**Dictionary:** what information belongs to this key?",
    ],
  },
  {
    kind: "prose",
    body: [
      "A dictionary can also check whether a key exists, but it stores associated values as well.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "3 · How",
    heading: "How do these structures work?",
    body: ["**A. Python set.** A set stores unique, **hashable** elements."],
  },
  {
    kind: "code",
    language: "python",
    caption: "Create a set",
    code: "student_ids = {101, 205, 309, 412}",
  },
  { kind: "prose", body: ["You can check membership:"] },
  { kind: "code", language: "python", caption: "Membership", code: "print(205 in student_ids)" },
  { kind: "code", language: "text", caption: "Output", code: "True" },
  { kind: "prose", body: ["You can add an element:"] },
  { kind: "code", language: "python", caption: "Add", code: "student_ids.add(518)" },
  { kind: "prose", body: ["You can remove an element:"] },
  { kind: "code", language: "python", caption: "Remove", code: "student_ids.remove(205)" },
  { kind: "prose", body: ["A set does not store duplicates."] },
  {
    kind: "code",
    language: "python",
    caption: "Duplicates",
    code: "numbers = {10, 20, 10, 30}\nprint(numbers)",
  },
  {
    kind: "prose",
    body: [
      "The set contains only three distinct elements: 10, 20 and 30. Its iteration order is **not guaranteed**.",
      "**B. Python dict.** A dictionary connects a unique key to a value.",
    ],
  },
  {
    kind: "code",
    language: "python",
    caption: "Create a dictionary",
    code: 'students = {\n    101: "Alice",\n    205: "Bob",\n    309: "Charlie"\n}',
  },
  { kind: "prose", body: ["Its conceptual structure looks like this:"] },
  {
    kind: "table",
    caption: "Keys and values",
    headers: ["Key", "Value"],
    rows: [
      [101, "Alice"],
      [205, "Bob"],
      [309, "Charlie"],
    ],
  },
  { kind: "prose", body: ["You can retrieve a value using its key:"] },
  { kind: "code", language: "python", caption: "Retrieve", code: "print(students[205])" },
  { kind: "code", language: "text", caption: "Output", code: "Bob" },
  { kind: "prose", body: ["You can add or update records:"] },
  {
    kind: "code",
    language: "python",
    caption: "Add or update",
    code: 'students[412] = "David"\nstudents[205] = "Robert"',
  },
  { kind: "prose", body: ["And check whether a key exists:"] },
  { kind: "code", language: "python", caption: "Key check", code: "print(309 in students)" },
  { kind: "code", language: "text", caption: "Output", code: "True" },
  {
    kind: "callout",
    tone: "warn",
    title: "Important",
    body: "The `in` operator on a dictionary checks **keys**, not values.",
  },
  {
    kind: "prose",
    eyebrow: "4 · Example",
    heading: "Trace both data structures",
    body: ["Consider the following code:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "Set and dictionary together",
    code: "numbers = [4, 7, 4, 9, 7]\nunique_numbers = set()\nfrequency = {}\n\nfor num in numbers:\n    unique_numbers.add(num)\n    if num in frequency:\n        frequency[num] += 1\n    else:\n        frequency[num] = 1",
  },
  {
    kind: "prose",
    body: [
      "The set stores unique numbers. The dictionary stores how many times each number appears. Step through the loop:",
    ],
  },
  { kind: "set-dict-walkthrough" },
  {
    kind: "prose",
    body: [
      "This demonstrates an important difference: a set records **which values exist**, while a dictionary can record **how often** each value occurs.",
      "We will study frequency counting as its own pattern later. For now, focus on the difference between the structures.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "5 · Trade-offs",
    heading: "Set vs Dictionary vs List",
    body: [],
  },
  {
    kind: "table",
    caption: "List, set and dictionary compared",
    headers: ["Feature", "List", "Set", "Dictionary"],
    rows: [
      ["**Main purpose**", "Ordered sequence", "Unique membership", "Key-value mapping"],
      ["**Duplicates**", "Yes", "No", "Keys unique"],
      ["**Membership lookup**", "`O(n)`", "`O(1)` average", "`O(1)` average for keys"],
      ["**Access by integer position**", "Yes", "No", "No"],
      ["**Additional structure memory**", "Usually lower", "Hash table", "Hash table"],
    ],
  },
  {
    kind: "callout",
    tone: "info",
    title: "Order and cost",
    body: "Python dictionaries preserve **insertion order**. Sets do **not** guarantee iteration order. For a single set or dictionary, the expected time for add, assignment and key lookup is `O(1)` in ordinary cases.",
  },
  {
    kind: "prose",
    body: ["One common interview mistake is to confuse a dictionary key with its value."],
  },
  {
    kind: "code",
    language: "python",
    caption: "Key or value?",
    code: 'students = {101: "Alice"}\nprint(101 in students)\nprint("Alice" in students)',
  },
  {
    kind: "prose",
    body: ["Think carefully about which expression returns `True`."],
  },
  {
    kind: "prose",
    eyebrow: "6 · Practice",
    heading: "Your exercise",
    body: ["**Do not run the code yet.** Predict the results first."],
  },
  {
    kind: "code",
    language: "python",
    caption: "Practice A",
    code: "numbers = {5, 10, 5, 20}\nnumbers.add(10)\nnumbers.add(30)\nprint(len(numbers))\nprint(20 in numbers)",
  },
  {
    kind: "code",
    language: "python",
    caption: "Practice B",
    code: 'scores = {\n    "Alice": 80,\n    "Bob": 90\n}\nscores["Alice"] = 95\nscores["Charlie"] = 85\nprint(len(scores))\nprint(scores["Alice"])',
  },
  {
    kind: "pattern-exercises",
    exercises: [
      {
        type: "fields",
        label: "Practice A",
        title: "Predict the output",
        prompt: "What will these two print statements display?",
        fields: [
          { label: "print(len(numbers))", answer: 4, tone: "accent" },
          { label: "print(20 in numbers)", answer: "True", tone: "accent" },
        ],
        success:
          "Correct. The set starts with 5, 10 and 20. Adding 10 changes nothing because it is already there, and adding 30 makes four elements. 20 is in the set, so the second line is True.",
        hint: "Count the distinct values after each add. A repeated value is stored only once.",
      },
      {
        type: "fields",
        label: "Practice B",
        title: "Dictionary update",
        prompt: "Predict both outputs.",
        fields: [
          { label: "print(len(scores))", answer: 3, tone: "accent" },
          { label: 'print(scores["Alice"])', answer: 95, tone: "accent" },
        ],
        success:
          "Correct. Assigning to the existing key Alice replaces her value, so the size stays at 2. Assigning to the new key Charlie adds a record, so the size becomes 3.",
        hint: "Ask for each assignment whether the key already exists.",
      },
      {
        type: "choice",
        label: "Practice C",
        title: "Choose the structure",
        prompt:
          "You need to store every transaction, including repeated transactions, in the order they occurred.",
        options: ["list", "set", "dict"],
        answer: 0,
        success:
          "A list. It keeps duplicates and the order of arrival. A set would drop repeats and a dictionary needs unique keys.",
        hint: "Which structure keeps duplicates and order?",
      },
      {
        type: "choice",
        label: "Practice D",
        title: "Choose the structure",
        prompt: "You need to detect whether a user ID has appeared before.",
        options: ["list", "set", "dict"],
        answer: 1,
        success:
          "A set. You only need membership, and a set answers it in O(1) on average without storing extra values.",
        hint: "You only care whether the ID exists, not what belongs to it.",
      },
      {
        type: "choice",
        label: "Practice E",
        title: "Choose the structure",
        prompt: "You need to retrieve a user's email address from their user ID.",
        options: ["list", "set", "dict"],
        answer: 2,
        success:
          "A dict. The user ID is the key and the email address is the value, so one lookup retrieves it.",
        hint: "Each ID must be connected to information that belongs to it.",
      },
    ],
  },
  {
    kind: "takeaways",
    items: [
      "A set stores unique, hashable elements and answers whether an item exists.",
      "A dict connects a unique key to a value, and `in` checks keys, not values.",
      "Sets and dictionaries give `O(1)` average lookup, but a set has no index access and no guaranteed order.",
      "Dictionaries preserve insertion order, and assigning to an existing key updates it instead of growing the dictionary.",
      "Pick a list for order and duplicates, a set for membership, and a dict for key-value lookup.",
    ],
  },
  { kind: "quiz", questions: quizQuestions },
];

export const setVsDict: LessonBuilder<Record<string, never>> = {
  slug: "set-vs-dict",
  title: "Hashing Foundations: Python Set vs Dict",
  subtitle:
    "Learn when to store unique values in a set and when to connect keys to values in a dict.",
  problem: "Choose between a set and a dict for a lookup problem.",
  spotIt: [
    "You only need to know whether a value has appeared before.",
    "Each key must be connected to information that you retrieve later.",
  ],
  avoidWhen: [
    "You need element positions, duplicates or sorted order.",
    "The values are not hashable, such as lists.",
  ],
  takeaways: [
    "Set: does this item exist?",
    "Dict: what information belongs to this key?",
    "Both give O(1) average lookup.",
  ],
  variant: "set-vs-dict",
  view: "array",
  code: "def first_repeat(user_ids):\n    seen = set()\n    for user_id in user_ids:\n        if user_id in seen:\n            return user_id\n        seen.add(user_id)\n    return None",
  sections: setVsDictSections,
  defaultInputs: {},
  inputs: [],
  build: () => [
    {
      line: 1,
      array: [4, 7, 4, 9, 7],
      narration: "Use the concept lesson to compare a set and a dictionary.",
    },
  ],
};
