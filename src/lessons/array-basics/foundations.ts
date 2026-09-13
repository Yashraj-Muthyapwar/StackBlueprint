import type { LessonBuilder, Section, Step } from "../types";

type ArrayInputs = { arr: number[] };
type MatrixInputs = { matrix: number[][] };

const arrayVsListCode = `from array import array
import sys
import numpy as np

n = 1_000_000
typed = array("i", range(n))
python_list = list(range(n))

print(sys.getsizeof(typed))
print(sys.getsizeof(python_list))

vector = np.array([1, 2, 3, 4, 5])
print(vector / 2)                 # [0.5 1.  1.5 2.  2.5]
print([1, 2, 3, 4, 5] / 2)        # TypeError`;

const arrayVsListsSections: Section[] = [
  {
    kind: "prose",
    heading: "Why this matters",
    body: [
      "`Arrays` and `lists` both keep values in order, but they make different tradeoffs. The right choice affects memory use, the kinds of values you can store, and how naturally you can perform numeric work.",
      "In everyday Python, `list` is the flexible default. Typed `array.array` values and `NumPy` arrays become valuable when a large collection contains one numeric type and you want compact storage or fast vectorized operations.",
    ],
  },
  {
    kind: "prose",
    heading: "The core distinction",
    body: [
      "A typed `array.array` stores values with one declared representation, such as signed integers. A Python `list` stores references to Python objects, so it can combine an integer, string, or custom object in one collection.",
    ],
  },
  {
    kind: "table",
    caption: "Arrays and lists at a glance",
    headers: ["Question", "Typed `array.array` or `NumPy` array", "Python `list`"],
    rows: [
      ["Element types", "One numeric type", "Any Python objects"],
      ["Indexed read", "`O(1)`", "`O(1)`"],
      ["Search for a value", "`O(n)`", "`O(n)`"],
      [
        "Numeric operations",
        "Element-wise operations are natural with `NumPy`",
        "Use a loop or comprehension",
      ],
      ["Best fit", "Large homogeneous numeric data", "General-purpose Python collections"],
    ],
  },
  {
    kind: "prose",
    heading: "Common `array` type codes",
    body: [
      "The first argument to `array.array` selects the representation used for every item. These are the useful codes to recognize at this stage. You do not need to memorize the full list of codes.",
    ],
  },
  {
    kind: "table",
    caption: "A small practical type-code reference",
    headers: ["Code", "Stores", "Use it when"],
    rows: [
      [
        "`i`",
        "Signed integers",
        "You need ordinary whole-number values such as scores or indices.",
      ],
      [
        "`f`",
        "Single-precision floating-point values",
        "You need many decimal measurements and compact storage matters.",
      ],
      [
        "`d`",
        "Double-precision floating-point values",
        "You need decimal calculations with more precision.",
      ],
      ["`b`", "Signed bytes", "You are storing compact signed byte-sized values."],
      ["`B`", "Unsigned bytes", "You are storing byte data such as small non-negative values."],
    ],
  },
  {
    kind: "prose",
    heading: "Create both structures",
    body: [
      "Run this example. Notice that the typed `array.array` declares `i` for signed integers, while the Python `list` needs no type declaration.",
    ],
  },
  {
    kind: "interactive-code",
    caption: "A typed integer array and a Python list",
    code: `from array import array

typed = array("i", [4, 7, 1, 9])
python_list = [4, "seven", True, 9]

print(typed)
print(python_list)
print(typed[1])`,
  },
  {
    kind: "prose",
    heading: "Run the memory comparison",
    body: [
      "This lesson runs Python in a 32-bit `WebAssembly` environment in your browser. Running the same code in a local Python terminal, especially on a 64-bit laptop, can produce different memory numbers.",
    ],
  },
  {
    kind: "interactive-code",
    caption: "Run the memory comparison",
    code: `from array import array
import sys

n = 100_000
typed = array("i", range(n))
python_list = list(range(n))

print("typed array container:", sys.getsizeof(typed), "bytes")
print("list container:", sys.getsizeof(python_list), "bytes")
print("items:", len(typed))`,
  },
  {
    kind: "prose",
    heading: "Numeric work is where NumPy shines",
    body: [
      "`NumPy` arrays apply arithmetic to every value at once. A Python `list` has no meaning for division by a number, so Python raises a `TypeError` instead of silently guessing what you mean.",
    ],
  },
  {
    kind: "interactive-code",
    caption: "Element-wise arithmetic with NumPy",
    packages: ["numpy"],
    code: `import numpy as np

# You can perform arithmetic on entire arrays in NumPy:
vector = np.array([1, 2, 3, 4, 5])
print(vector / 2)

values = [1, 2, 3, 4, 5]
# values / 2  <-- Raises TypeError: unsupported operand type(s) for /: 'list' and 'int'

# A list needs a comprehension instead:
print([value / 2 for value in values])`,
  },
  {
    kind: "takeaways",
    items: [
      "Typed `array.array` values keep one value type in compact storage, while Python `list` values hold references to flexible Python objects.",
      "Both structures provide `O(1)` indexed access, but finding an unknown value is `O(n)`.",
      "Use `list` for flexible application data. Use `array.array` or `NumPy` for large, homogeneous numeric data and numeric operations.",
      "This lesson's memory output comes from 32-bit `WebAssembly`, so a 64-bit local Python installation can show different byte counts.",
    ],
  },
  {
    kind: "quiz",
    questions: [
      {
        id: "arrays-lists-1",
        question:
          "Which structure is the best default when a collection may contain an integer, a string, and a custom object?",
        options: [
          "A typed integer array",
          "A Python list",
          "A NumPy numeric array",
          "A fixed-size byte buffer",
        ],
        correctIndex: 1,
        explanation:
          "A Python list holds references to arbitrary Python objects, so mixed values are supported.",
      },
      {
        id: "arrays-lists-2",
        question:
          "What is the usual time complexity of reading `values[42]` from either an array or a list?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctIndex: 0,
        explanation:
          "The index directly identifies the requested position, so the read is constant time.",
      },
      {
        id: "arrays-lists-3",
        question: "Why can `np.array([1, 2, 3]) / 2` work while `[1, 2, 3] / 2` does not?",
        options: [
          "Lists cannot contain integers",
          "NumPy defines element-wise division",
          "Lists are always immutable",
          "NumPy uses one-based indexing",
        ],
        correctIndex: 1,
        explanation:
          "NumPy implements numeric operations element by element. A Python list does not define division by a scalar.",
      },
      {
        id: "arrays-lists-4",
        question:
          "Write code that creates a typed integer array named `scores` with 3, 6, and 9, then prints its second value.",
        interactiveCode: true,
        initialCode: "from array import array\n\n# Write your code here\n",
        testCode: "print(scores[1])",
        expectedOutput: "6",
        explanation:
          '`array("i", [3, 6, 9])` creates a typed integer array, and index 1 refers to the second value.',
      },
      {
        id: "arrays-lists-5",
        question:
          "Why can the byte counts in this lesson differ from the output on your own computer?",
        options: [
          "The lesson uses 32-bit WebAssembly in the browser",
          "Lists cannot store integers locally",
          "Only NumPy can call sys.getsizeof",
          "Python lists do not have a size",
        ],
        correctIndex: 0,
        explanation:
          "The lesson runs in a 32-bit WebAssembly environment. A 64-bit local Python installation can report different byte counts.",
      },
    ],
  },
];

function buildArrayVsList(): Step[] {
  const arrayValues = [4, 7, 1, 9];
  const listValues = ["4", "seven", "True", "9"];

  return [
    {
      line: 5,
      array: arrayValues,
      secondary: { label: "Python list", array: listValues },
      narration:
        "Both structures hold an ordered sequence. Here we create one million integers in each form.",
    },
    {
      line: 6,
      array: arrayValues,
      secondary: { label: "Python list", array: listValues },
      status: "array('i') stores integer values",
      narration:
        "A typed array stores one declared type in a compact, contiguous buffer. Here, i means signed integers.",
    },
    {
      line: 7,
      array: arrayValues,
      secondary: { label: "Python list", array: listValues },
      status: "list stores references to Python objects",
      narration:
        "A Python list stores references to Python objects. It can mix types and resize easily, but each element has more overhead.",
    },
    {
      line: 9,
      array: arrayValues,
      pointers: [{ name: "index", index: 1, color: "mint" }],
      secondary: { label: "Python list", array: listValues },
      highlight: { kind: "match", indices: [1] },
      status: "Measure the object containers",
      narration:
        "This lesson runs in a 32-bit WebAssembly environment. Its output for 100,000 values is 408320 bytes for the typed array and 400028 bytes for the list.",
    },
    {
      line: 12,
      array: arrayValues,
      pointers: [{ name: "index", index: 1, color: "mint" }],
      secondary: { label: "Python list", array: listValues },
      highlight: { kind: "match", indices: [1] },
      status: "NumPy applies division to every value",
      narration:
        "NumPy arrays are optimized for numeric operations. Dividing by 2 applies the operation element by element.",
    },
    {
      line: 13,
      array: arrayValues,
      pointers: [{ name: "index", index: 1, color: "mint" }],
      secondary: { label: "Python list", array: listValues },
      highlight: { kind: "compare", indices: [1] },
      status: "TypeError: list does not support division",
      narration:
        "A plain list does not define vectorized division. Use a loop or a NumPy array when you want arithmetic across every numeric value.",
    },
  ];
}

const arrayTraversalCode = `def visit_every_value(arr):
    for index in range(len(arr)):
        value = arr[index]
        print(index, value)`;

function buildArrayTraversal({ arr }: ArrayInputs): Step[] {
  if (arr.length === 0) {
    return [{ line: 1, array: arr, narration: "An empty array has no indices to visit." }];
  }

  const steps: Step[] = [
    {
      line: 1,
      array: arr,
      narration: `An array of ${arr.length} values has indices 0 through ${arr.length - 1}.`,
    },
  ];
  arr.forEach((value, index) => {
    steps.push({
      line: 3,
      array: arr,
      pointers: [{ name: "index", index, color: "mint" }],
      highlight: { kind: "match", indices: [index] },
      status: `arr[${index}] = ${value}`,
      narration: `Read index ${index}. Its value is ${value}.`,
    });
  });
  return steps;
}

const matrixTraversalCode = `def visit_matrix(matrix):
    for row in range(len(matrix)):
        for col in range(len(matrix[row])):
            value = matrix[row][col]
            print(row, col, value)`;

function buildMatrixTraversal({ matrix }: MatrixInputs): Step[] {
  if (!matrix.length || !matrix[0]?.length) {
    return [{ line: 1, matrix, narration: "An empty matrix has no cells to visit." }];
  }

  const steps: Step[] = [
    {
      line: 1,
      matrix,
      narration: `This matrix has ${matrix.length} rows. Visit one row at a time.`,
    },
  ];
  matrix.forEach((row, r) => {
    row.forEach((value, c) => {
      steps.push({
        line: 3,
        matrix,
        cellPointers: [{ name: "cell", r, c, color: "mint" }],
        cellHighlights: [{ r, c, tone: "match" }],
        status: `matrix[${r}][${c}] = ${value}`,
        narration: `Row ${r}, column ${c} contains ${value}.`,
      });
    });
  });
  return steps;
}

const arrayOperationsCode = `def update_first_even(arr):
    for index, value in enumerate(arr):
        if value % 2 == 0:
            arr[index] = value * 2
            return arr
    return arr`;

function buildArrayOperations({ arr }: ArrayInputs): Step[] {
  const next = [...arr];
  const steps: Step[] = [
    { line: 1, array: next, narration: "Scan each element until an even value is found." },
  ];
  const index = next.findIndex((value) => value % 2 === 0);

  if (index === -1) {
    steps.push({
      line: 6,
      array: next,
      narration: "No even value was found, so the array stays unchanged.",
    });
    return steps;
  }

  steps.push({
    line: 3,
    array: next,
    pointers: [{ name: "index", index, color: "mint" }],
    highlight: { kind: "compare", indices: [index] },
    narration: `${next[index]} is the first even value. Arrays provide constant-time access once its index is known.`,
  });
  next[index] *= 2;
  steps.push({
    line: 4,
    array: next,
    pointers: [{ name: "index", index, color: "mint" }],
    highlight: { kind: "swap", indices: [index] },
    status: `arr[${index}] is now ${next[index]}`,
    narration: `Write directly to index ${index}, then return the updated array.`,
  });
  return steps;
}

const whatIsAnArraySections: Section[] = [
  {
    kind: "prose",
    heading: "Why this matters",
    body: [
      "An `array` gives every stored value a position. Once you know that position, called an `index`, you can read or replace the value directly. This is the idea behind nearly every array pattern in this track.",
      "This indexing idea scales from a one-dimensional sequence to a two-dimensional matrix and a three-dimensional cube. Each extra dimension adds one coordinate.",
    ],
  },
  {
    kind: "prose",
    heading: "What is an array?",
    body: [
      "An array is an ordered collection of elements. In the classic array model, elements share one representation and occupy neighboring locations in memory. That structure lets the computer calculate an element's location from its index.",
      "Different languages present this model differently. Python `list` is a flexible sequence, while `array.array` and `NumPy` provide typed array-style storage. The indexing notation is still the same: `values[index]`.",
    ],
  },
  { kind: "array-dimensions-explorer" },
  {
    kind: "prose",
    heading: "One-dimensional arrays",
    body: [
      "A one-dimensional array is a single line of values. Indices begin at `0`, so the third item lives at index `2`. The explorer starts with `values[2] = 10`.",
    ],
  },
  {
    kind: "interactive-code",
    caption: "Read values from a one-dimensional typed array",
    code: `from array import array

values = array("i", [5, 4, 10, 11, 8])

print(values[2])  # 10
print(values[3])  # 11`,
  },
  {
    kind: "prose",
    heading: "Two-dimensional arrays are matrices",
    body: [
      "A matrix is a collection of rows. Use two indices: `matrix[row][column]`. The first index selects a row and the second selects a position within that row.",
      "For example, the value `20` below is in row `0`, column `4`, so its address is `matrix[0][4]`.",
    ],
  },
  {
    kind: "interactive-code",
    caption: "Read coordinates from a matrix",
    code: `matrix = [
    [1, 33, 55, 91, 20],
    [5, 4, 10, 11, 8],
    [24, 50, 37, 40, 48],
]

print(matrix[0][4])  # 20
print(matrix[2][1])  # 50`,
  },
  {
    kind: "prose",
    heading: "Three-dimensional arrays add depth",
    body: [
      "A three-dimensional array is a stack of matrices. Read an index as `cube[depth][row][column]`. Use the 3D tab in the explorer to rotate the layers and select a cell.",
      "The order matters. `cube[0][1][2]` and `cube[1][0][2]` can point to completely different values because each coordinate answers a different question.",
    ],
  },
  {
    kind: "interactive-code",
    caption: "Read values from a 3D array",
    code: `cube = [
    [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    [[10, 11, 12], [13, 14, 15], [16, 17, 18]],
    [[19, 20, 21], [22, 23, 24], [25, 26, 27]],
]

print(cube[0][0][1])  # 2
print(cube[2][0][2])  # 21`,
  },
  {
    kind: "prose",
    heading: "Typed arrays use one element representation",
    body: [
      "Python's `array` module provides an array type that is similar to `list`, but it stores values using one underlying type code. An integer array can hold integer values, while a `list` remains the flexible choice when a collection needs mixed Python objects.",
    ],
  },
  {
    kind: "interactive-code",
    caption: "Allowed and not allowed in an integer array",
    code: `from array import array

# Allowed: every value fits the integer type code "i"
scores = array("i", [0, 1, 2, 3, 4, 5])

# Not allowed: "blue" cannot be stored as an integer
# mixed = array("i", [0, 1, 2, "blue", 5])  # TypeError

# A list can hold mixed Python objects
flexible = [0, True, 2, "blue", 5]

print("typed array:", scores)
print("flexible list:", flexible)`,
  },
  {
    kind: "callout",
    tone: "warn",
    title: "Keep the index order straight",
    body: "For a matrix, use `[row][column]`. For a cube, use `[depth][row][column]`. Reading the right numbers in the wrong order is a common source of indexing bugs.",
  },
  {
    kind: "takeaways",
    items: [
      "An `index` identifies an element's position, so indexed reads and writes are usually `O(1)`.",
      "A one-dimensional array uses `[index]`; a matrix uses `[row][column]`; a 3D array uses `[depth][row][column]`.",
      "Classic arrays use contiguous, single-type storage. Python also offers flexible sequences such as `list`, which you will compare in the next lesson.",
    ],
  },
  {
    kind: "quiz",
    questions: [
      {
        id: "array-types-1",
        question:
          "Which expression reads the third item in a one-dimensional array named `values`?",
        options: ["values[3]", "values[2]", "values(2)", "values[0][2]"],
        correctIndex: 1,
        explanation: "Array indexing begins at 0, so index 2 names the third item.",
      },
      {
        id: "array-types-2",
        question: "What does the first index in `matrix[row][column]` choose?",
        options: ["The depth layer", "The value type", "The row", "The column"],
        correctIndex: 2,
        explanation:
          "The first coordinate selects a row. The second coordinate selects a column in that row.",
      },
      {
        id: "array-types-3",
        question: "How should you read `cube[1][2][0]`?",
        options: [
          "Column 1, row 2, depth 0",
          "Depth 1, row 2, column 0",
          "Row 1, column 2, depth 0",
          "Depth 0, row 2, column 1",
        ],
        correctIndex: 1,
        explanation: "This lesson uses `[depth][row][column]` for 3D coordinates.",
      },
      {
        id: "array-types-4",
        question: "Why can an array usually read a known index in `O(1)` time?",
        options: [
          "It sorts values before reading them",
          "It calculates the element location from the index",
          "It searches every previous value",
          "It uses one-based indexing",
        ],
        correctIndex: 1,
        explanation:
          "The index provides a direct route to the element location, rather than requiring a scan.",
      },
      {
        id: "array-types-5",
        question:
          "Create a matrix named `matrix` with rows `[1, 2]` and `[3, 4]`, then print the value `4` using its row and column indices.",
        interactiveCode: true,
        initialCode: "# Write your code here\n",
        testCode: "print(matrix[1][1])",
        expectedOutput: "4",
        explanation:
          "`matrix = [[1, 2], [3, 4]]` creates two rows, and `matrix[1][1]` selects the final cell.",
      },
    ],
  },
];

export const whatIsAnArrayAndTypes: LessonBuilder<Record<string, never>> = {
  slug: "what-is-an-array-and-types",
  title: "What Is an Array? Types of Arrays",
  subtitle: "Explore 1D arrays, 2D matrices, and 3D cubes through their index positions.",
  problem: "Understand how array dimensions turn positions into one, two, or three indices.",
  spotIt: [
    "You need to access a value by position.",
    "The input is a sequence, grid, image, or stack of grids.",
  ],
  avoidWhen: [
    "The data is connected by relationships rather than fixed coordinates.",
    "You need key-based lookup instead of position-based access.",
  ],
  takeaways: [
    "One, two, and three dimensions use one, two, and three index coordinates respectively.",
    "The coordinate order is part of the data structure and must stay consistent.",
  ],
  variant: "array-types",
  view: "array",
  code: "# This concept lesson uses the interactive index explorer.",
  sections: whatIsAnArraySections,
  defaultInputs: {},
  inputs: [],
  build: () => [
    {
      line: 1,
      array: [5, 4, 10, 11, 8],
      narration: "Use the concept lesson to explore array dimensions and index positions.",
    },
  ],
};

const oneDimensionalOperationsSections: Section[] = [
  {
    kind: "prose",
    heading: "Why this matters",
    body: [
      "One-dimensional array work is built from a small set of operations: create, insert, traverse, access, search, and delete. Knowing which operations shift values and which jump directly to an index makes complexity analysis much easier.",
    ],
  },
  { kind: "array-operations-lab" },
  {
    kind: "prose",
    heading: "Creating an array",
    body: [
      "Creating from existing values takes `O(n)` time and `O(n)` space because each value must be stored. Creating an empty structure is `O(1)` time and space before values are added.",
    ],
  },
  {
    kind: "interactive-code",
    caption: "Create arrays with array and NumPy",
    packages: ["numpy"],
    code: `from array import array
import numpy as np

typed = array("i", [4, 8, 15, 16, 23])
numeric = np.array([4, 8, 15, 16, 23])

# Display contents and object types for clear comparison
print("--- Standard Library Array ---")
print("Value:", typed)
print("Type: ", type(typed))

print()

print("--- NumPy Array ---")
print("Value:", numeric)
print("Type: ", type(numeric))`,
  },
  {
    kind: "prose",
    heading: "Insertion and deletion",
    body: [
      "Inserting or deleting in the middle usually costs `O(n)` time because later values must shift. The `array` module changes the existing object with `insert` or `del`; NumPy returns a new array with `np.insert` or `np.delete`, so it also needs `O(n)` extra space for that result.",
    ],
  },
  {
    kind: "interactive-code",
    caption: "Insert and delete",
    packages: ["numpy"],
    code: `from array import array
import numpy as np

typed = array("i", [4, 8, 15, 16])
typed.insert(2, 99)
del typed[1]
print("--- Standard Library Array ---")
print("Result: ", typed)
print("Type:   ", type(typed))
print()

numeric = np.array([4, 8, 15, 16])
numeric = np.insert(numeric, 2, 99)
numeric = np.delete(numeric, 1)
print("--- NumPy Array ---")
print("Result: ", numeric)
print("Type:   ", type(numeric))`,
  },
  {
    kind: "prose",
    heading: "Traversal, access, and search",
    body: [
      "Traversal visits every value, so it is `O(n)` time and `O(1)` auxiliary space. Accessing a known index is `O(1)`. A linear search is `O(n)` in the worst case and uses `O(1)` auxiliary space.",
    ],
  },
  {
    kind: "interactive-code",
    caption: "Traverse, access, and search",
    packages: ["numpy"],
    code: `from array import array
import numpy as np

# Initialize arrays
typed = array("i", [4, 8, 15, 16, 23])
numeric = np.array([4, 8, 15, 16, 23])

# --- Standard Library Array (Python Built-in) ---
print("--- Standard Library Array Operations ---")

print("Traversal: ", end="")
for item in typed:
    print(item, end=" ")
print()
print("Access at index 2:", typed[2])
print("Search index of 16:", typed.index(16))

print()

# --- NumPy Array (Vectorized & Sequential Operations) ---
print("--- NumPy Array Operations ---")
print("Traversal: ", end="")
for item in numeric:
    print(item, end=" ")
print()
print("Access at index 2:", numeric[2])

# Search by value: element-wise comparison returning matching index array
matching_indices = np.where(numeric == 16)[0]
print("Search index of 16:", matching_indices[0])`,
  },
  {
    kind: "table",
    caption: "One-dimensional array operation costs",
    headers: ["Operation", "Time", "Extra space", "Why"],
    rows: [
      ["Create from n values", "`O(n)`", "`O(n)`", "Values must be stored."],
      [
        "Insert at an index",
        "`O(n)`",
        "`O(1)` array module; `O(n)` NumPy",
        "Values after the index shift; NumPy returns a new array.",
      ],
      ["Traverse", "`O(n)`", "`O(1)`", "Visit each value once."],
      ["Access by index", "`O(1)`", "`O(1)`", "Index locates the value directly."],
      ["Linear search", "`O(n)`", "`O(1)`", "Check values until a match appears."],
      [
        "Delete at an index",
        "`O(n)`",
        "`O(1)` array module; `O(n)` NumPy",
        "Later values shift; NumPy returns a new array.",
      ],
    ],
  },
  {
    kind: "takeaways",
    items: [
      "Use `array.array` for typed, mutable sequences and NumPy for numerical arrays and vectorized work.",
      "Access is `O(1)`, while traversal and an unknown-value search are `O(n)`.",
      "Middle insertion and deletion are `O(n)` because positions after the change must move.",
      "NumPy `insert` and `delete` produce new arrays, so their extra-space cost is `O(n)`.",
    ],
  },
  {
    kind: "quiz",
    questions: [
      {
        id: "one-d-ops-1",
        question: "What is the usual time complexity of accessing `values[7]`?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctIndex: 0,
        explanation: "A known index identifies its value directly.",
      },
      {
        id: "one-d-ops-2",
        question: "Why is insertion in the middle of an array usually O(n)?",
        options: [
          "The array must sort first",
          "Later values must shift",
          "The index is unknown",
          "Arrays cannot grow",
        ],
        correctIndex: 1,
        explanation: "Values after the insertion point need new positions.",
      },
      {
        id: "one-d-ops-3",
        question: "What does `np.delete` return?",
        options: [
          "The removed scalar only",
          "A new array without the selected element",
          "The original array changed in place",
          "A Python list",
        ],
        correctIndex: 1,
        explanation: "NumPy deletion constructs and returns a new array.",
      },
      {
        id: "one-d-ops-4",
        question: "Which operation is O(n) in the worst case when the target is unknown?",
        options: ["Access", "Linear search", "Read first value", "Overwrite a known index"],
        correctIndex: 1,
        explanation: "A linear search may inspect every value.",
      },
      {
        id: "one-d-ops-5",
        question:
          "Create an integer array named `values` containing 3, 6, and 9. Insert 5 at index 1, then print the array.",
        interactiveCode: true,
        initialCode: "from array import array\n\n# Write your code here\n",
        testCode: "print(values)",
        expectedOutput: "array('i', [3, 5, 6, 9])",
        explanation: 'Use `array("i", [3, 6, 9])`, then call `values.insert(1, 5)`.',
      },
    ],
  },
];

export const oneDimensionalArrayOperations: LessonBuilder<Record<string, never>> = {
  slug: "one-dimensional-array-operations",
  title: "One-Dimensional Array Operations",
  subtitle: "Create, insert, traverse, access, search, and delete with array and NumPy.",
  problem: "Understand the core operations that turn a sequence of values into a usable array.",
  spotIt: [
    "You are working with a linear sequence of values.",
    "You need to predict the cost of changing or finding an element.",
  ],
  avoidWhen: [
    "Data is organized by keys rather than positions.",
    "You need graph or tree traversal.",
  ],
  variant: "array-operations-lab",
  view: "array",
  code: "# Explore the runnable operations in the concept lesson.",
  sections: oneDimensionalOperationsSections,
  defaultInputs: {},
  inputs: [],
  build: () => [
    {
      line: 1,
      array: [4, 8, 15, 16, 23],
      narration: "Use the operations lab to explore one-dimensional arrays.",
    },
  ],
};

export const arrayIndexing: LessonBuilder<ArrayInputs> = {
  slug: "array-indexing-and-traversal",
  title: "Array Indexing and Traversal",
  subtitle: "Read values by index and visit an array from left to right.",
  problem: "Given an array, visit every value once while keeping track of its index.",
  spotIt: [
    "You need to inspect every element in order.",
    "The prompt asks for a position, value, or a single pass over a list.",
  ],
  avoidWhen: [
    "The data is not stored contiguously, such as a linked list.",
    "You need a specific non-linear traversal, such as BFS or DFS.",
  ],
  variant: "array-basics",
  view: "array",
  code: arrayTraversalCode,
  defaultInputs: { arr: [8, 3, 12, 5, 9] },
  inputs: [{ key: "arr", label: "Array", kind: "intArray", help: "comma-separated" }],
  build: buildArrayTraversal,
};

export const arrayVsLists: LessonBuilder<Record<string, never>> = {
  slug: "arrays-vs-lists",
  title: "Arrays vs Lists",
  subtitle:
    "Choose compact typed storage for numeric data or flexible lists for general Python objects.",
  problem:
    "Choose a structure for a large sequence of values when memory use, numeric work, and flexibility all matter.",
  spotIt: [
    "The data has one numeric type and you plan to process many values.",
    "The prompt asks you to balance memory efficiency against a flexible collection.",
  ],
  avoidWhen: [
    "Values have different types or need to carry rich Python objects.",
    "You need frequent inserts and deletes in the middle of the sequence.",
  ],
  takeaways: [
    "Arrays use a uniform element type and contiguous storage, making them compact for numeric data.",
    "Python lists hold references to objects, so they can mix types and grow dynamically.",
    "Both arrays and lists support indexed reads in O(1), while finding a value still requires O(n) scanning in the general case.",
    "Use a list for everyday Python collections. Use array.array or NumPy arrays when homogeneous numeric storage and vectorized work matter.",
    "The memory example is measured in the lesson's 32-bit WebAssembly runtime, so a 64-bit local Python installation can show different byte counts.",
  ],
  variant: "arrays-vs-lists",
  view: "array",
  code: arrayVsListCode,
  sections: arrayVsListsSections,
  defaultInputs: {},
  inputs: [],
  build: buildArrayVsList,
};

export const matrixCoordinates: LessonBuilder<MatrixInputs> = {
  slug: "matrix-coordinates-and-traversal",
  title: "Matrix Coordinates and Traversal",
  subtitle: "Use row and column coordinates to visit every cell in a grid.",
  problem: "Given a matrix, visit each cell in row-major order.",
  spotIt: [
    "Input is a grid, board, image, or 2D array.",
    "You need to inspect each row and each column.",
  ],
  avoidWhen: [
    "You must follow graph edges rather than adjacent grid cells.",
    "The matrix is sparse and scanning empty cells would be wasteful.",
  ],
  variant: "matrix-basics",
  view: "matrix",
  code: matrixTraversalCode,
  defaultInputs: {
    matrix: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ],
  },
  inputs: [{ key: "matrix", label: "Matrix", kind: "intMatrix" }],
  build: buildMatrixTraversal,
};

export const arrayOperations: LessonBuilder<ArrayInputs> = {
  slug: "array-reads-writes-and-complexity",
  title: "Array Reads, Writes, and Complexity",
  subtitle: "Separate constant-time indexed access from the linear scan needed to find an element.",
  problem: "Find the first even value in an array, double it in place, and return the array.",
  spotIt: [
    "You must find an element, then update it by index.",
    "The prompt asks for an in-place array update.",
  ],
  avoidWhen: [
    "You need frequent inserts or deletes in the middle of a sequence.",
    "The lookup should be keyed by value rather than position.",
  ],
  variant: "array-operations",
  view: "array",
  code: arrayOperationsCode,
  defaultInputs: { arr: [5, 7, 4, 9, 6] },
  inputs: [{ key: "arr", label: "Array", kind: "intArray", help: "comma-separated" }],
  build: buildArrayOperations,
};
