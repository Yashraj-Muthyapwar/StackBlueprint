import type { LessonBuilder, QuizQuestion, Section } from "../types";

/**
 * Hidden grader for the duplicate-ID warm-up. The IDs arrive in a list that raises on `in`,
 * `index`, `count`, `sort` and slicing and counts every read, so a learner has to remember the IDs
 * in a hash-based set. Reads are budgeted on a 300-value input, which rejects nested scans.
 * Builtins are reached directly so shadowing cannot fake a pass.
 */
const duplicateTests = String.raw`
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
    def sort(self, *args, **kwargs):
        raise _sb_b.RuntimeError("Do not sort the input. Use a hash-based set.")

def _sb_grade():
    cases = [
        [101, 205, 309, 101],
        [101, 205, 309, 412],
        [],
        [7],
        [7, 7],
        [0, -1, 1, -1],
        [5, 4, 3, 2, 1, 5],
    ]
    seed = 8675309
    for size in _sb_b.range(1, 70):
        values = []
        for _k in _sb_b.range(size):
            seed = (seed * 1103515245 + 12345) % 2147483648
            values.append((seed >> 8) % (size * 3 + 5))
        cases.append(values)
    cases.append(_sb_b.list(_sb_b.range(300)))
    cases.append(_sb_b.list(_sb_b.range(300)) + [0])
    for values in cases:
        want = _sb_b.len(_sb_b.set(values)) != _sb_b.len(values)
        _SbList.reads = 0
        inputs = _SbList(values)
        try:
            got = contains_duplicate(inputs)
        except _sb_b.RuntimeError as problem:
            return _sb_b.str(problem)
        if _sb_b.list.copy(inputs) != values:
            return "contains_duplicate must not change the list."
        if got is not True and got is not False:
            return "contains_duplicate must return True or False."
        if got != want:
            return "Wrong answer: expected " + _sb_b.str(want) + " but got " + _sb_b.str(got) + " for " + _sb_b.str(values) + "."
        if _SbList.reads > 2 * _sb_b.len(values) + 5:
            return "Too many reads: look at each ID once and use a set for the IDs you have seen."
    return "All hidden tests passed"

_sb_b.print(_sb_grade())`;

const duplicateChallenge: QuizQuestion = {
  id: "contains-duplicate-warmup",
  question:
    "Warm-up challenge: Find duplicate student IDs. You receive a list of student IDs, and some IDs may appear more than once. Write `contains_duplicate(student_ids)` that returns `True` if any ID appears at least twice, and `False` otherwise. Keep the given function signature, use a hash-based data structure, and do not sort the input. Handle empty lists, one-element lists and repeated IDs. For `[101, 205, 309, 101]` the answer is `True`, for `[101, 205, 309, 412]` it is `False`, and for `[]` it is `False`.",
  interactiveCode: true,
  initialCode: `def contains_duplicate(student_ids: list[int]) -> bool:
    # Write your solution here
    pass


print(contains_duplicate([101, 205, 309, 101]))
print(contains_duplicate([101, 205, 309, 412]))
print(contains_duplicate([]))
`,
  testCode: duplicateTests,
  expectedOutput: "All hidden tests passed",
  gradeLastLine: true,
  requiredCodePatterns: [
    String.raw`def\s+contains_duplicate\s*\(`,
    String.raw`\bset\s*\(|=\s*\{|\bdict\b`,
  ],
  validationMessage:
    "Define `contains_duplicate(student_ids)` and use a hash-based set to remember the IDs you have seen.",
  forbiddenCodePatterns: [
    {
      pattern: String.raw`\bimport\b|__|\bexec\b|\beval\b|\bglobals\b|\bsetattr\b|\bcompile\b`,
      message: "This challenge does not need imports or Python internals. Use a set.",
    },
    {
      pattern: String.raw`\bsorted\s*\(|\.sort\s*\(`,
      message: "Do not sort the input. Use a hash-based set instead.",
    },
  ],
  explanation:
    "Read the IDs once and keep a set named `seen`. If the ID is already in `seen`, return `True`. Otherwise add it. When the loop ends, return `False`. Empty and one-element lists never find a repeat, so they return `False`. Time is O(n), because each set lookup and insertion is O(1) on average. Additional space is O(n), because in the worst case every ID is stored in the set. Sorting would avoid the set, but it costs O(n log n) time and changes the input.",
};

/**
 * Hidden grader for the collision-finder challenge. It compares the learner's dictionary with a
 * reference on fixed and generated inputs. Builtins are reached directly so shadowing cannot fake
 * a pass, and the inputs are checked for changes.
 */
const collisionTests = String.raw`
import builtins as _sb_b

def _sb_expected(keys, size):
    groups = {}
    for key in keys:
        groups.setdefault(key % size, []).append(key)
    return {slot: group for slot, group in groups.items() if _sb_b.len(group) > 1}

def _sb_grade():
    cases = [
        ([23, 15, 33, 42, 25], 10),
        ([412, 422], 10),
        ([], 10),
        ([5], 10),
        ([1, 2, 3, 4], 10),
        ([7, 14, 21, 28], 7),
        ([0, 10, 20, 5, 15], 5),
        ([3, 3, 13], 10),
    ]
    seed = 135792468
    for _ in _sb_b.range(80):
        seed = (seed * 1103515245 + 12345) % 2147483648
        size = 2 + (seed >> 8) % 11
        seed = (seed * 1103515245 + 12345) % 2147483648
        count = (seed >> 8) % 14
        keys = []
        for _k in _sb_b.range(count):
            seed = (seed * 1103515245 + 12345) % 2147483648
            keys.append((seed >> 8) % 200)
        cases.append((keys, size))
    for keys, size in cases:
        want = _sb_expected(keys, size)
        given = _sb_b.list(keys)
        got = find_collisions(given, size)
        if given != keys:
            return "find_collisions must not change the list of keys."
        if not _sb_b.isinstance(got, _sb_b.dict):
            return "find_collisions must return a dict."
        if got != want:
            return "Wrong answer for " + _sb_b.str(keys) + " with size " + _sb_b.str(size) + ": expected " + _sb_b.str(want) + " but got " + _sb_b.str(got) + "."
    return "All hidden tests passed"

_sb_b.print(_sb_grade())`;

const challenge: QuizQuestion = {
  id: "find-collisions",
  question:
    "Practical challenge: Find the collisions. Write a function `find_collisions(keys, size)` for the simplified model, where the index of a key is `key % size`. Return a dictionary that maps each index to the list of keys that selected it, but only for indices chosen by two or more keys. Keep the keys in the order they appear. For `keys = [23, 15, 33, 42, 25]` and `size = 10` the answer is `{3: [23, 33], 5: [15, 25]}`.",
  interactiveCode: true,
  initialCode: `def find_collisions(keys, size):
    # Write your code here.
    pass


print(find_collisions([23, 15, 33, 42, 25], 10))
`,
  testCode: collisionTests,
  expectedOutput: "All hidden tests passed",
  gradeLastLine: true,
  requiredCodePatterns: [String.raw`def\s+find_collisions\s*\(`, String.raw`%`],
  validationMessage:
    "Define `find_collisions(keys, size)` and calculate each index with `key % size`.",
  forbiddenCodePatterns: [
    {
      pattern: String.raw`\bimport\b|__|\bexec\b|\beval\b|\bglobals\b|\bsetattr\b|\bcompile\b`,
      message: "This challenge does not need imports or Python internals. Use a dictionary.",
    },
  ],
  explanation:
    "Group the keys by index. For each key, calculate `index = key % size` and append the key to the list stored under that index in a dictionary. After one pass, keep only the indices whose list has two or more keys. That is O(n), and it is the same idea a hash table uses to see which keys compete for a location.",
};

const quizQuestions: QuizQuestion[] = [
  {
    id: "collision-definition",
    question: "What is a hash collision?",
    options: [
      "Two different keys compete for the same storage location.",
      "A key is stored twice in the same set.",
      "A hash function returns a negative number.",
    ],
    correctIndex: 0,
    explanation:
      "A table has a limited number of locations, so different keys can select the same one. That situation is a collision. It does not mean the keys are equal.",
  },
  {
    id: "collision-equality",
    question: "412 and 422 both select location 2. What must the hash table do?",
    options: [
      "Check key equality, so it can tell the two keys apart and keep both.",
      "Treat them as the same key and keep only one.",
      "Refuse to store the second key.",
    ],
    correctIndex: 0,
    explanation:
      "A collision means the keys compete for a location, not that they are equal. The table compares the keys, finds that they differ, and stores both.",
  },
  {
    id: "collision-hashable",
    question: "Which value can be used as a dictionary key?",
    options: ["(1, 2), a tuple of integers", "[1, 2], a list", "{1, 2}, a set"],
    correctIndex: 0,
    explanation:
      "Keys must be hashable. A tuple of hashable values is hashable, while lists, dictionaries and sets can change and are not hashable.",
  },
  duplicateChallenge,
  challenge,
];

const hashFunctionSections: Section[] = [
  {
    kind: "prose",
    body: [
      "You already understand two important facts:",
      "1. A Python `set` stores unique elements.",
      "2. A Python `dict` stores key-value pairs.",
      "You also know that both provide `O(1)` average-case lookup.",
      "But one important question remains: ",
      "**how can Python find an element quickly without checking every element?**",
      "To answer this, we must understand **hash functions** and **collisions**.",
      "We will use a simplified hash table first. Then we will connect it to Python's real implementation.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "1 · Why",
    heading: "How does Python know where to look?",
    body: ["Consider a collection of student IDs:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "Student IDs",
    code: "student_ids = {101, 205, 309, 412, 518}",
  },
  {
    kind: "prose",
    body: [
      "Suppose we want to check whether `412` exists.",
      "With a `list`, Python might need to inspect multiple elements. With a `set`, Python can usually locate the element much faster.",
      "But how does Python know where to look? It needs a way to transform the student ID into information that helps find its storage location. A **hash function** performs this transformation.",
      "However, a problem exists. A **hash table** has a limited number of storage locations, so different keys can compete for the same location. That problem is called a **hash collision**.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "2 · Intuition",
    heading: "Think of school lockers",
    body: [
      "Imagine a school with 10 lockers, numbered from 0 to 9. Every student has a unique ID. The school uses this simplified rule:",
    ],
  },
  {
    kind: "code",
    language: "python",
    caption: "The locker rule",
    code: "locker_number = student_id % 10",
  },
  {
    kind: "prose",
    body: ["Here, `%` means the remainder after division. For example:"],
  },
  {
    kind: "list",
    items: [
      "Student `101` → locker `1`",
      "Student `205` → locker `5`",
      "Student `309` → locker `9`",
      "Student `412` → locker `2`",
    ],
  },
  {
    kind: "prose",
    body: ["Change the student ID and observe how different IDs can select the same locker."],
  },
  { kind: "locker-demo" },
  {
    kind: "prose",
    body: ["This example teaches two things:"],
  },
  {
    kind: "list",
    items: [
      "A calculation can help select a storage location.",
      "Different IDs can select the same location. This situation creates a **collision**.",
    ],
  },
  {
    kind: "callout",
    tone: "warn",
    title: "A teaching model",
    body: "The `% 10` rule is a simplified teaching model. Python's actual hash tables do not use this exact rule for every key.",
  },
  {
    kind: "prose",
    eyebrow: "3 · How",
    heading: "What happens when a key is stored or found?",
    body: ["We separate the process into four steps. The first step is to compute a hash value."],
  },
  {
    kind: "prose",
    body: ["**Step 1. Compute the hash value.** Python has a built-in function called `hash()`."],
  },
  {
    kind: "interactive-code",
    caption: "hash() on integers and strings",
    code: 'print(hash(42))\nprint(hash("apple"))',
  },
  {
    kind: "prose",
    body: [
      "For a standard Python integer such as 42, the result is `42`. For strings, the result is a hash value derived from the string. The exact value can differ between Python processes because Python **randomizes string hashing**.",
      "A **hash value** is not necessarily the final position in memory. The **hash table** uses the **hash value** and its internal table size to identify an **initial storage location**.",
      "**Step 2. Find the storage location.** In our simplified example:",
    ],
  },
  {
    kind: "interactive-code",
    caption: "The simplified index",
    code: "student_id = 412\nindex = student_id % 10\nprint(index)",
  },
  {
    kind: "prose",
    body: [
      "**Step 3. Store or find the key.** If the selected location is available, the **hash table** can use it to store the key. If the key already exists, the table can identify it and avoid adding a duplicate to a `set`. For a `dictionary`, an existing key can have its value updated.",
      "**Step 4. Handle a collision.** Suppose two student IDs are 412 and 422. In our simplified model:",
    ],
  },
  {
    kind: "interactive-code",
    caption: "Two keys, one location",
    code: "print(412 % 10)\nprint(422 % 10)",
  },
  {
    kind: "prose",
    body: [
      "Both select location 2. Two different keys compete for the same location. How can a **hash table** resolve this? Two well-known techniques are:",
    ],
  },
  {
    kind: "table",
    caption: "Two ways to resolve a collision",
    headers: ["Technique", "Idea"],
    rows: [
      [
        "**Separate chaining**",
        "Store multiple entries in a structure associated with one location.",
      ],
      ["**Open addressing**", "Search for another available location inside the table."],
    ],
  },
  {
    kind: "prose",
    body: [
      "Python's built-in `dictionaries` and `sets` use forms of **open addressing**. When a collision happens, Python can probe other locations according to its internal rules. You do not need to memorize Python's exact probing formula for normal coding interviews.",
      "You do need to understand that collisions can cause **extra comparisons** and additional lookup work.",
    ],
  },
  {
    kind: "callout",
    tone: "info",
    title: "Collision does not mean equal",
    body: "A hash collision does not mean the two keys are equal. For instance, 412 and 422 remain different keys even when they compete for the same location. The hash table must still **check key equality**.",
  },
  {
    kind: "prose",
    eyebrow: "4 · Example",
    heading: "Colliding keys can coexist",
    body: ["Python handles collisions automatically. Consider a set that receives 412 and 422:"],
  },
  {
    kind: "interactive-code",
    caption: "Both values stay in the set",
    code: "numbers = set()\nnumbers.add(412)\nnumbers.add(422)\nprint(412 in numbers)\nprint(422 in numbers)\nprint(len(numbers))",
  },
  {
    kind: "prose",
    body: [
      "Both values remain in the set, even though they collide under our simplified `% 10` rule. However, this example does not demonstrate an actual collision inside Python's set, because Python uses its own hash and table-location calculations.",
      "The expected output is `True`, `True` and `2`. This teaches an important rule:",
    ],
  },
  {
    kind: "callout",
    tone: "success",
    title: "The rule",
    body: "Different keys can coexist in a hash table even when their hash values or storage locations collide.",
  },
  {
    kind: "prose",
    body: ["Now consider dictionary keys:"],
  },
  {
    kind: "interactive-code",
    caption: "The right value for each key",
    code: 'students = {\n    412: "Alice",\n    422: "Bob"\n}\nprint(students[412])\nprint(students[422])',
  },
  {
    kind: "prose",
    body: ["The dictionary retrieves the correct associated value for each key."],
  },
  {
    kind: "prose",
    eyebrow: "5 · Trade-offs",
    heading: "Why can hashing still be slow?",
    body: [
      "A well-designed hash table aims to distribute keys across its storage locations. When locations are distributed well and the table has enough capacity, most lookups require only a small amount of work. If collisions become excessive, lookups can require more comparisons.",
    ],
  },
  {
    kind: "table",
    caption: "Average case and worst case",
    headers: ["Operation", "Average / expected", "Pathological worst case"],
    rows: [
      ["Set membership lookup", "`O(1)`", "`O(n)`"],
      ["Dictionary key lookup", "`O(1)`", "`O(n)`"],
      [
        "Set insertion",
        "`O(1)`",
        "Can require `O(n)` or more work during resizing or collision-heavy operations",
      ],
      [
        "Dictionary insertion",
        "`O(1)`",
        "Can require `O(n)` or more work during resizing or collision-heavy operations",
      ],
    ],
  },
  {
    kind: "prose",
    body: [
      "A hash table also needs **extra memory** for empty locations and internal metadata. This helps keep its average operations efficient. Python automatically grows its tables when necessary.",
      "There is one more rule you need to know. Python requires set elements and dictionary keys to be **hashable**. For the common built-in types:",
    ],
  },
  {
    kind: "table",
    caption: "Hashable types",
    headers: ["Type", "Can be a set element or dictionary key?"],
    rows: [
      ["`int`", "Yes"],
      ["`str`", "Yes"],
      ["`tuple` of hashable values", "Yes"],
      ["`list`", "No"],
      ["`dict`", "No"],
      ["`set`", "No"],
    ],
  },
  {
    kind: "prose",
    body: [
      "We will examine the hashability rule more deeply when we practise Python hashing operations.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "6 · Practice",
    heading: "Your exercise",
    body: [
      "This exercise uses the simplified `% 10` hash model, not Python's real internal table.",
    ],
  },
  {
    kind: "code",
    language: "python",
    caption: "Practice",
    code: "keys = [23, 15, 33, 42, 25]\nindex = key % 10",
  },
  {
    kind: "prose",
    body: [
      "Suppose the table has **10 storage locations**, numbered 0 to 9. Each key selects one of them. Then identify which keys collide.",
    ],
  },
  {
    kind: "pattern-exercises",
    exercises: [
      {
        type: "cells",
        label: "Practice A",
        title: "Find the storage location for each key",
        prompt:
          "Calculate `key % 10` for each key and enter the location it selects, from 0 to 9. Each box belongs to the key written above it.",
        cellLabels: ["key 23", "key 15", "key 33", "key 42", "key 25"],
        brackets: false,
        answers: [3, 5, 3, 2, 5],
        success: "Correct. The locations are 3, 5, 3, 2 and 5.",
        hint: "The location is the last digit of each key, because the table has 10 locations.",
      },
      {
        type: "choice",
        label: "Practice B",
        title: "Which keys collide?",
        prompt: "Which keys collide?",
        options: [
          "23 and 33 collide, and 15 and 25 collide.",
          "23 and 42 collide.",
          "No keys collide.",
        ],
        answer: 0,
        success: "Right. 23 and 33 both select index 3, and 15 and 25 both select index 5.",
        hint: "Look for indices that appear twice.",
      },
      {
        type: "choice",
        label: "Practice C",
        title: "Why lookup needs extra work",
        prompt:
          "Three different keys compete for the same storage location. Why can lookup require additional work?",
        options: [
          "The table may have to compare the searched key with several entries before it finds the right one.",
          "The three keys must be equal, so the table has to merge them.",
          "The table must sort all its keys first.",
        ],
        answer: 0,
        success:
          "Right. Competing keys share a location, so the table checks key equality, and may probe other locations, until it finds the matching key.",
        hint: "What must the table do to tell competing keys apart?",
      },
      {
        type: "choice",
        label: "Practice D",
        title: "Are the keys equal?",
        prompt: "Does that mean all three keys must be equal?",
        options: [
          "No. Different keys can collide and still remain different keys.",
          "Yes. Keys in the same location are equal.",
        ],
        answer: 0,
        success:
          "Correct. A collision means the keys compete for a location, not that they are equal.",
        hint: "Remember 412 and 422.",
      },
      {
        type: "choice",
        label: "Practice E",
        title: "Is the statement correct?",
        prompt:
          '"Python dictionary lookups are always O(1) because dictionaries use hashing." Is this statement completely correct?',
        options: [
          "No. Lookup is O(1) on average. Collisions can force extra comparisons, and a pathological case can reach O(n).",
          "Yes. Hashing guarantees O(1) for every lookup.",
          "No. Dictionary lookups are always O(log n).",
        ],
        answer: 0,
        success:
          "Right. Hashing gives average-case O(1). Collisions add comparisons, so a lookup can take longer, and in a pathological case it can take O(n).",
        hint: "Think about average case versus the cost when many keys collide.",
      },
    ],
  },
  {
    kind: "takeaways",
    items: [
      "A hash function turns a key into a hash value that helps select a storage location.",
      "A hash table has limited locations, so different keys can collide on the same one.",
      "A collision does not mean the keys are equal. The table still checks key equality and keeps both keys.",
      "Python uses forms of open addressing: it probes other locations when a collision happens.",
      "Lookup is `O(1)` on average, but excessive collisions can make it `O(n)`. Set elements and dictionary keys must be hashable.",
    ],
  },
  { kind: "quiz", questions: quizQuestions },
];

export const hashFunctionsCollisions: LessonBuilder<Record<string, never>> = {
  slug: "hash-functions-collisions",
  title: "Hashing Foundations: Hash Functions and Collisions",
  subtitle:
    "See how a key finds its location, why keys collide, and why lookup is O(1) on average.",
  problem: "Explain how a hash table finds a key and what a collision costs.",
  spotIt: [
    "A question claims hash lookups are always O(1).",
    "You must reason about duplicate keys, keys that compete for a location, or hashability.",
  ],
  avoidWhen: ["You need sorted order or range queries, which a hash table cannot give."],
  takeaways: [
    "Hash function: key to location.",
    "Collisions are normal and handled automatically.",
    "O(1) is the average, not a guarantee.",
  ],
  variant: "hash-functions-collisions",
  view: "array",
  code: "def find_collisions(keys, size):\n    groups = {}\n    for key in keys:\n        groups.setdefault(key % size, []).append(key)\n    return {slot: group for slot, group in groups.items() if len(group) > 1}",
  sections: hashFunctionSections,
  defaultInputs: {},
  inputs: [],
  build: () => [
    {
      line: 1,
      array: [23, 15, 33, 42, 25],
      narration: "Use the concept lesson to see which keys select the same location.",
    },
  ],
};
