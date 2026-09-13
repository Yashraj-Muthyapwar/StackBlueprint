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
