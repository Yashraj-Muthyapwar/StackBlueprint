import { type LessonContent } from "@/lessons/types";
import constantsModuleExample from "@/images/python/basics/constants-module-example.png";
import inputTypeConversionFlow from "@/images/python/basics/input-type-conversion-flow.png";


export const BASIC_SYNTAX_LESSON: LessonContent = {
  slug: "basic-syntax",
  title: "Basic Syntax",
  subtitle: "Learn the building blocks that make Python code valid and readable.",
  sections: [
    { kind: "prose", heading: "Why this matters", body: ["Before a program can do useful work, Python needs to understand its structure. Comments, keywords, names, statements, and indentation are part of that structure.", "These rules are small, but they appear in almost every Python program."] },
    { kind: "animation", variant: "basic-syntax", caption: "How Python code is structured" },
    { kind: "prose", heading: "Comments", body: ["A comment is a note for people reading the code. Python ignores it when the program runs.", "Start a comment with `#`. Use comments to explain why a line exists when the reason is not obvious."] },
    { kind: "interactive-code", code: '# Calculate the final price after tax\nprice = 100\ntax = price * 0.08\nprint(price + tax)' },
    { kind: "prose", body: ["The first line is a comment. Python runs the remaining lines.", "A comment can also follow code on the same line, but use that form sparingly."] },
    { kind: "interactive-code", code: 'tax_rate = 0.08  # Current sales tax rate\nprint(tax_rate)' },
    { kind: "callout", tone: "warn", title: "Comments and triple-quoted strings", body: "`#` is Python's comment syntax. Triple-quoted text is a string. It is often used as a docstring directly inside a module, function, class, or method." },
    { kind: "prose", heading: "Docstrings", body: ["A docstring is a triple-quoted string placed first inside a function, class, or module. It records what that code is for.", "Python stores a function's docstring in its `__doc__` attribute."] },
    { kind: "interactive-code", code: 'def multiply(a, b):\n    """Return the product of a and b."""\n    return a * b\n\nprint(multiply.__doc__)' },
    { kind: "prose", heading: "Keywords", body: ["Keywords are words that Python reserves for its own grammar. `if`, `for`, `while`, `def`, `class`, and `return` are keywords.", "You cannot use a keyword as a variable, function, or class name."] },
    { kind: "interactive-code", code: 'import keyword\n\nprint(keyword.kwlist)' },
    { kind: "interactive-code", code: '# if = 10  # This would cause a SyntaxError\nuser_age = 10\nprint(user_age)' },
    { kind: "prose", heading: "Identifiers", body: ["An identifier is a name that you create in Python. Variables, functions, and classes all use identifiers.", "Identifiers can contain letters, digits, and underscores. They cannot start with a digit, contain spaces or hyphens, or be Python keywords."] },
    { kind: "table", caption: "Identifier rules", headers: ["Name", "Valid?", "Reason"], rows: [["customer_name", "Yes", "Letters and underscore"], ["order2", "Yes", "A digit is allowed after the first character"], ["2orders", "No", "Cannot start with a digit"], ["order-total", "No", "Hyphens are not allowed"], ["class", "No", "Python keyword"]] },
    { kind: "interactive-code", code: 'customer_name = "Ava"\nCustomer_name = "Noah"\n\nprint(customer_name)\nprint(Customer_name)' },
    { kind: "prose", body: ["Python is case-sensitive, so `customer_name` and `Customer_name` are different identifiers.", "For variables and functions, use `snake_case`, such as `total_price` and `calculate_salary`."] },
    { kind: "prose", heading: "Statements and expressions", body: ["A statement is an instruction Python executes. `total = price * quantity` is an assignment statement.", "An expression produces a value. In `total = price * quantity`, the part `price * quantity` is an expression."] },
    { kind: "interactive-code", code: 'price = 20\nquantity = 3\ntotal = price * quantity\n\nprint(total)' },
    { kind: "prose", body: ["Python usually runs statements from top to bottom. A condition, loop, or function can change that order."] },
    { kind: "prose", heading: "Writing long statements", body: ["A statement normally ends at a newline. Inside parentheses, brackets, and braces, Python lets you continue the statement on the next line."] },
    { kind: "interactive-code", code: 'total = (\n    10 + 20 +\n    30\n)\n\nprint(total)' },
    { kind: "prose", heading: "Indentation", body: ["Python uses indentation to mark a block of code. A block starts after a line ending in `:` and continues while the code stays indented.", "Use four spaces for each indentation level."] },
    { kind: "interactive-code", code: 'score = 75\n\nif score >= 50:\n    print("Passed")\n\nprint("Check complete")' },
    { kind: "callout", tone: "warn", title: "Common mistakes", body: "- **Missing indentation**: Code after `if`, `for`, `while`, `def`, and `class` must be indented.\n- **Using a keyword as a name**: `class = 1` is not valid Python.\n- **Mixing tabs and spaces**: Use four spaces consistently.\n- **Explaining obvious code**: Comments should add context, not repeat the line." },
    { kind: "takeaways", items: ["Comments are notes for people and begin with `#`.", "Keywords are reserved words in Python.", "Identifiers are the names you create.", "Statements are instructions. Expressions produce values.", "Indentation groups code into blocks."] },
    {
      kind: "quiz", questions: [
        { id: "basic-syntax-1", question: "What does Python do with a line that begins with `#`?", options: ["Ignores it as a comment", "Prints it", "Runs it twice", "Turns it into a variable"], correctIndex: 0, explanation: "A line beginning with `#` is a comment. Python ignores it during execution." },
        { id: "basic-syntax-2", question: "Which name is a valid Python identifier?", options: ["2_orders", "order-total", "class", "order_total"], correctIndex: 3, explanation: "`order_total` uses letters and an underscore, and it does not begin with a digit or use a keyword." },
        { id: "basic-syntax-3", question: "What is `price * quantity` in `total = price * quantity`?", options: ["A comment", "An expression", "A class", "A keyword"], correctIndex: 1, explanation: "It produces a value, so it is an expression. The full assignment line is a statement." },
        { id: "basic-syntax-4", question: "Why is indentation required after an `if` statement?", options: ["It marks the code that belongs to the if block", "It changes text color", "It adds a comment", "It creates a variable"], correctIndex: 0, explanation: "Indentation tells Python which statements are part of a block." },
        { id: "basic-syntax-5", question: "Write an `if` statement that prints `Ready` when `score` is at least 50.", interactiveCode: true, initialCode: "score = 75\n\n# Write your if statement below\n", testCode: "", expectedOutput: "Ready", explanation: "Use `if score >= 50:` followed by an indented `print(\"Ready\")`." },
      ]
    },
  ],
};


export const VARIABLES_DATA_TYPES_LESSON: LessonContent = {
  slug: "variables-and-data-types",
  title: "Variables & Data Types",
  subtitle: "Store values, name them clearly, and identify the kind of data each value represents.",
  sections: [
    { kind: "prose", heading: "Why this matters", body: ["Programs need a way to remember information while they run. A variable gives a value a name, so you can use that value again later.", "The kind of value also matters. Python treats text, whole numbers, decimal numbers, and true or false values differently."] },
    { kind: "animation", variant: "variables-data-types", caption: "Names, values, and data types" },
    { kind: "prose", heading: "Variables", body: ["A variable is a name that refers to a value. Create one with `=`.", "Read `customer_name = \"Ava\"` as: store the text `\"Ava\"` under the name `customer_name`."] },
    { kind: "interactive-code", code: 'customer_name = "Ava"\nproduct_price = 100\nquantity = 3\n\nprint(customer_name)\nprint(product_price * quantity)' },
    { kind: "prose", body: ["A variable can be reassigned. After reassignment, the name refers to the newer value."] },
    { kind: "interactive-code", code: 'score = 10\nprint(score)\n\nscore = 20\nprint(score)' },
    { kind: "prose", heading: "Assigning more than one value", body: ["Python can assign several values in one line. The values match the variable names from left to right.", "You can also give the same value to several names, although distinct names are usually clearer when the values will change independently."] },
    { kind: "interactive-code", code: 'name, age, is_student = "Ava", 25, True\nprint(name)\nprint(age)\nprint(is_student)\n\nx = y = z = "same"\nprint(x, y, z)' },
    { kind: "prose", heading: "Use clear names", body: ["Choose names that describe the value. `total_price` is easier to understand than `tp`.", "Use `snake_case` for variables: lowercase words separated by underscores."] },
    { kind: "table", caption: "Naming examples", headers: ["Name", "Use it?", "Reason"], rows: [["total_price", "Yes", "Clear snake_case name"], ["customer2", "Yes", "A digit is allowed after the first character"], ["2customers", "No", "A name cannot start with a digit"], ["total-price", "No", "Hyphens are not allowed"]] },
    { kind: "prose", heading: "Constants are a convention", body: ["A constant is a name for a value that should not change during normal use. Python does not enforce constants for ordinary variables.", "By convention, constants use uppercase names. That signals to other programmers that the value should be left alone."] },
    { kind: "interactive-code", code: 'TAX_RATE = 0.08\nMAX_LOGIN_ATTEMPTS = 3\n\nprint(TAX_RATE)\nprint(MAX_LOGIN_ATTEMPTS)' },
    { kind: "prose", heading: "Constants in a module", body: ["For values shared across a larger program, it is common to put constants in their own module, such as `constants.py`, then import the names where they are needed.", "This example uses two files. It is shown as a reference image because the lesson's browser runner executes one code block at a time and cannot create or import a separate local module."] },
    { kind: "image", src: constantsModuleExample, alt: "constants.py defines PI and GRAVITY, while main.py imports and prints them", caption: "A two-file module example. It is a reference, not a browser-runnable block." },
    { kind: "callout", tone: "warn", title: "Python allows reassignment", body: "`TAX_RATE = 0.08` is a convention, not a lock. Python will allow a later assignment to `TAX_RATE`. Treat uppercase names as values that should not be changed casually." },
    { kind: "prose", heading: "Literals and data types", body: ["A literal is a value written directly in code. In `age = 25`, `age` is the variable name and `25` is an integer literal.", "A data type describes what kind of value Python is handling. It helps Python decide which operations make sense."] },
    { kind: "interactive-code", code: 'name = "Ava"\nage = 25\nprice = 19.99\nis_active = True\nmanager = None\n\nprint(name)\nprint(age)\nprint(price)\nprint(is_active)\nprint(manager)' },
    { kind: "table", caption: "Python's built-in data type groups", headers: ["Group", "Types"], rows: [["Text", "str"], ["Numeric", "int, float, complex"], ["Sequence", "list, tuple, range"], ["Mapping", "dict"], ["Set", "set, frozenset"], ["Boolean", "bool"], ["Binary", "bytes, bytearray, memoryview"], ["No value", "NoneType"]] },
    { kind: "prose", heading: "Numeric, text, Boolean, and None", body: ["`int` holds whole numbers, `float` holds decimal numbers, and `complex` holds a real and imaginary part. `str` stores text, `bool` is either `True` or `False`, and `None` represents no value currently assigned.", "Python integers can grow beyond the size of standard machine integers. Floating-point values are practical for most measurements, but some decimal values cannot be represented exactly in binary."] },
    { kind: "interactive-code", code: 'whole_number = 25\ndecimal_number = 19.99\ncomplex_number = 3 + 4j\nmessage = "Hello"\nis_ready = True\nnot_assigned = None\n\nfor value in [whole_number, decimal_number, complex_number, message, is_ready, not_assigned]:\n    print(type(value).__name__)' },
    { kind: "prose", heading: "Number literals and bases", body: ["Most numbers are written in decimal, or base 10. Python also lets you write integer literals in binary, octal, and hexadecimal by adding a prefix.", "`0b` starts a binary literal, `0o` starts an octal literal, and `0x` starts a hexadecimal literal. Python still stores each result as an `int`."] },
    { kind: "interactive-code", code: 'binary_value = 0b1101\noctal_value = 0o15\nhex_value = 0xD\n\nprint(binary_value)\nprint(octal_value)\nprint(hex_value)\nprint(type(hex_value).__name__)' },
    { kind: "prose", heading: "Check a type with type() and isinstance()", body: ["Use `type()` when you want to inspect a value's exact type. Use `isinstance()` when you want to ask whether a value belongs to a type or one of several related types.", "For example, both `int` and `float` are numeric types, so `isinstance(value, (int, float))` is often more flexible than comparing a type exactly."] },
    { kind: "interactive-code", code: 'whole_number = 25\ndecimal_number = 19.99\ncomplex_number = 3 + 4j\n\nprint(type(whole_number).__name__)\nprint(isinstance(decimal_number, float))\nprint(isinstance(complex_number, complex))\nprint(isinstance(whole_number, (int, float)))' },
    { kind: "callout", tone: "info", title: "Exact decimal work", body: "For values such as money that must preserve decimal precision exactly, Python provides the `decimal` module. You will meet modules and more specialised numeric types later. For everyday introductory examples, `float` is appropriate." },
    { kind: "prose", heading: "Strings are Unicode text", body: ["A string is an ordered sequence of Unicode characters. Create a string with single quotes or double quotes. Triple quotes are useful for text that spans several lines.", "Choose the quote style that keeps the text readable. For example, double quotes avoid escaping an apostrophe in `\"It's ready\"`."] },
    { kind: "interactive-code", code: 'single_quoted = \'Python\'\ndouble_quoted = "It\\\'s ready"\nmultiline = """First line\nSecond line"""\n\nprint(single_quoted)\nprint(double_quoted)\nprint(multiline)' },
    { kind: "prose", heading: "Concatenate and repeat strings", body: ["Use `+` to concatenate, or join, strings. Use `*` with a whole number to repeat a string.", "Both operations create a new string. They do not modify either original string."] },
    { kind: "interactive-code", code: 'first_name = "Ava"\nlast_name = "Stone"\nfull_name = first_name + " " + last_name\nseparator = "-" * 20\n\nprint(full_name)\nprint(separator)' },
    { kind: "prose", heading: "Indexing and slicing strings", body: ["Strings are ordered, so each character has an index. The first character is at index `0`. Negative indexes count from the end, so `-1` means the final character.", "A slice selects a range: `text[start:stop]`. The stop index is not included in the result."] },
    { kind: "interactive-code", code: 'language = "Python"\n\nprint(language[0])\nprint(language[-1])\nprint(language[1:4])\nprint(len(language))' },
    { kind: "prose", heading: "Loop through a string", body: ["A `for` loop visits one character at a time in an ordered value such as a string. The name after `for` refers to the current character for that pass through the loop.", "This is a preview of a common string operation. The Loops lesson will explain the `for` statement and indentation in detail."] },
    { kind: "interactive-code", code: 'word = "cat"\n\nfor character in word:\n    print(character)' },
    { kind: "prose", heading: "Strings cannot be changed in place", body: ["Strings are immutable. You cannot replace or delete one character inside an existing string. Instead, create a new string and assign it to a name.", "Methods such as `lower()`, `upper()`, `replace()`, and `strip()` return new strings. The original string remains unchanged unless you assign the result back."] },
    { kind: "interactive-code", code: 'title = "  Python Basics  "\n\nprint(title.strip())\nprint(title.upper())\nprint(title.replace("Basics", "Data Types"))\nprint(title)' },
    { kind: "prose", heading: "Common string operations", body: ["`split()` separates text into a list of pieces. `join()` combines an iterable of text pieces using a separator. `find()` returns the starting index of text, or `-1` when it is absent.", "Like other string methods, these operations return new values rather than changing the original string."] },
    { kind: "interactive-code", code: 'sentence = "learn Python together"\nwords = sentence.split()\n\nprint(words)\nprint("-".join(words))\nprint(sentence.find("Python"))\nprint(sentence.find("Java"))' },
    { kind: "prose", heading: "Escape sequences", body: ["An escape sequence starts with a backslash inside a string. Common sequences are `\\n` for a new line, `\\t` for a tab, `\\\'` for a single quote, `\\\"` for a double quote, and `\\\\` for a backslash.", "Use escapes when a character would otherwise end the string or when you need a control character in the text."] },
    { kind: "interactive-code", code: 'message = "First line\\nSecond line"\nquote = "She said, \\\"Python is readable.\\\""\npath_hint = "folder\\\\file.txt"\n\nprint(message)\nprint(quote)\nprint(path_hint)' },
    { kind: "prose", heading: "Boolean values and truthiness", body: ["A Boolean value is either `True` or `False`. Comparisons such as `10 > 9` produce Booleans.", "Python can also treat other values as true or false in a condition. Empty strings, zero, `None`, and empty collections are falsy. Non-empty strings, non-zero numbers, and non-empty collections are truthy."] },
    { kind: "interactive-code", code: 'print(10 > 9)\nprint(bool("Python"))\nprint(bool(""))\nprint(bool(0))\nprint(bool(15))\nprint(bool(None))' },
    { kind: "prose", heading: "Sequence types", body: ["A sequence keeps items in an order. A `list` can be changed, a `tuple` is an ordered fixed collection, and `range` represents a sequence of integers."] },
    { kind: "interactive-code", code: 'skills = ["Python", "SQL"]\ncoordinates = (10, 20)\nsteps = range(1, 4)\n\nprint(type(skills).__name__)\nprint(type(coordinates).__name__)\nprint(type(steps).__name__)\nprint(list(steps))' },
    { kind: "prose", heading: "Mappings and set types", body: ["A `dict` maps keys to values. A `set` stores unique values. A `frozenset` also stores unique values, but cannot be changed after it is created."] },
    { kind: "interactive-code", code: 'profile = {"name": "Ava", "age": 25}\ntags = {"python", "basics", "python"}\nfixed_tags = frozenset({"python", "basics"})\n\nprint(type(profile).__name__)\nprint(type(tags).__name__)\nprint(type(fixed_tags).__name__)\nprint(tags)' },
    { kind: "prose", heading: "Binary types", body: ["Binary types hold bytes rather than ordinary text. `bytes` is immutable, `bytearray` can be changed, and `memoryview` provides a view into existing binary data. You will use these more often when reading files, working with network data, or handling media."] },
    { kind: "interactive-code", code: 'raw = b"ABC"\neditable = bytearray(b"ABC")\nview = memoryview(raw)\n\nprint(type(raw).__name__)\nprint(type(editable).__name__)\nprint(type(view).__name__)\nprint(list(raw))' },
    { kind: "prose", heading: "Collections are values too", body: ["Lists, tuples, dictionaries, and sets hold several values. You will study each collection in depth later."] },
    { kind: "interactive-code", code: 'skills = ["Python", "SQL"]\ncoordinates = (10, 20)\nprofile = {"name": "Ava", "age": 25}\ntags = {"python", "basics"}\n\nprint(skills)\nprint(coordinates)\nprint(profile)\nprint(tags)' },
    { kind: "prose", heading: "Python determines types at runtime", body: ["Python usually determines a value's type when the program runs. A variable can later refer to a value of a different type, but avoid doing that without a good reason.", "The `__name__` part below keeps type output short and easy to read."] },
    { kind: "interactive-code", code: 'name = "Ava"\nage = 25\nprice = 19.99\nis_active = True\n\nprint(type(name).__name__)\nprint(type(age).__name__)\nprint(type(price).__name__)\nprint(type(is_active).__name__)' },
    { kind: "callout", tone: "warn", title: "Common mistakes", body: "- **Starting a name with a digit**: `2items` is not valid.\n- **Treating uppercase as enforced**: Python allows an uppercase name to be reassigned.\n- **Mixing text and numbers**: `\"25\"` is text, while `25` is an integer.\n- **Trying to edit one string character**: Strings are immutable. Build or assign a new string instead.\n- **Using vague names**: Prefer `order_total` to `x` when the value has a clear purpose." },
    { kind: "takeaways", items: ["Variables are names that refer to values.", "Use descriptive `snake_case` names for variables.", "Uppercase names mark constants by convention only.", "Python has numeric, text, Boolean, collection, binary, and None value types.", "Strings are Unicode text, ordered by index, immutable, and can be concatenated or processed with methods.", "Use `type()` to inspect an exact type and `isinstance()` to check whether a value belongs to a type."] },
    {
      kind: "quiz", questions: [
        { id: "variables-types-1", question: "What does the statement `score = 20` do?", options: ["Creates or updates the name score to refer to 20", "Prints 20", "Turns score into a constant", "Adds 20 to score"], correctIndex: 0, explanation: "The assignment operator stores a value under a name. It also replaces the value referred to by an existing name." },
        { id: "variables-types-2", question: "Which name follows the usual Python variable naming convention?", options: ["Order Total", "order-total", "order_total", "2_orders"], correctIndex: 2, explanation: "Variables are commonly written in lowercase snake_case, with underscores between words." },
        { id: "variables-types-3", question: "What does an uppercase name such as `MAX_USERS` mean in Python?", options: ["Python makes it impossible to change", "It is a convention for a value intended to stay unchanged", "It must store text", "It is a keyword"], correctIndex: 1, explanation: "Uppercase communicates intent to readers. Python does not prevent reassignment of an ordinary uppercase variable." },
        { id: "variables-types-4", question: "Which value is falsy when passed to `bool()`?", options: ["`\"Python\"`", "`15`", "`\"\"`", "`[1]`"], correctIndex: 2, explanation: "An empty string has no content, so `bool(\"\")` is False." },
        { id: "variables-types-5", question: "Write code that assigns `\"Chicago\"` to `city` and prints `city`.", interactiveCode: true, initialCode: "# Write your code here\n", testCode: "assert city == 'Chicago'", expectedOutput: "Chicago", requiredCodePatterns: ["\\bcity\\s*=\\s*(['\\\"])Chicago\\1", "\\bprint\\s*\\(\\s*city\\s*\\)"], validationMessage: "Assign `\"Chicago\"` to `city`, then print `city`.", explanation: "Assign the string with `city = \"Chicago\"`, then use `print(city)`." },
      ]
    },
  ],
};

export const IO_TYPE_CONVERSIONS_LESSON: LessonContent = {
  slug: "io-and-conversions",
  title: "I/O & Type Conversions",
  subtitle: "Display results, understand user input, import modules, and convert values safely.",
  sections: [
    {
      kind: "prose",
      heading: "Why this matters",
      body: [
        "Programs are useful when they can show results and work with information that comes from outside the program. Python uses `print()` for output and `input()` for keyboard input.",
        "Values often arrive as text. Type conversion lets you turn text into a number when a calculation needs one.",
      ],
    },
    {
      kind: "animation",
      variant: "io-and-conversions",
      caption: "Output, input, conversion, and imports",
    },
    {
      kind: "prose",
      heading: "Output with print()",
      body: [
        "`print()` displays values in the output area. It can receive several values at once. By default, Python puts a space between them and moves to a new line after printing.",
        "Use `sep` to choose the separator between values and `end` to choose what prints after the last value.",
      ],
    },
    {
      kind: "prose",
      heading: "The print() signature",
      body: [
        "The syntax is `print(*objects, sep=' ', end='\\n', file=None, flush=False)`. You will usually only need `objects`, `sep`, and `end` at first.",
        "`file=None` means standard output, which is normally the screen. `flush=False` means Python does not force the output to appear immediately after every call.",
      ],
    },
    {
      kind: "table",
      caption: "What each print() parameter controls",
      headers: ["Parameter", "Purpose", "Default"],
      rows: [
        ["*objects", "The value or values to print", "Required values"],
        ["sep", "Text placed between multiple values", "A space"],
        ["end", "Text printed after the last value", "A new line"],
        ["file", "Where output is written", "Standard output, usually the screen"],
        ["flush", "Whether to force output to appear immediately", "False"],
      ],
    },
    {
      kind: "interactive-code",
      code: 'item = "Notebook"\nprice = 5\n\nprint("Item:", item)\nprint("Price:", price)\nprint("red", "green", "blue", sep=" | ")\nprint("Loading", end="...")\nprint("done")',
    },
    {
      kind: "prose",
      heading: "Input arrives as text",
      body: [
        "`input()` displays an optional prompt and waits for someone to type a response. Its result is always a string, even when the response looks like a number.",
        "The lesson's browser runner executes code without a keyboard prompt, so the interactive example below uses a string that represents a user's response.",
      ],
    },
    {
      kind: "image",
      src: inputTypeConversionFlow,
      alt: "A Python input value moves from the text string 19 through int conversion into the integer 19",
      caption: "input() returns text. Convert it before using it as a number.",
    },
    {
      kind: "interactive-code",
      code: '# This string represents a response from input()\nraw_age = "19"\nage = int(raw_age)\n\nprint(age + 1)\nprint(type(raw_age).__name__)\nprint(type(age).__name__)',
    },
    {
      kind: "callout",
      tone: "info",
      title: "Using input() in a normal Python program",
      body: 'In a local Python program, you could write `age = int(input("Age: "))`. The `input()` call returns text, and `int()` converts that text to a whole number.',
    },
    {
      kind: "prose",
      heading: "Explicit type conversion",
      body: [
        "Explicit conversion means you choose the new type. Common conversion functions include `int()`, `float()`, `str()`, and `bool()`.",
        "Conversion only works when the source value has a suitable format. For example, `int(\"19\")` works, but `int(\"nineteen\")` raises an error.",
      ],
    },
    {
      kind: "interactive-code",
      code: 'quantity_text = "456"\nquantity = int(quantity_text)\nprice = float("19.95")\nlabel = str(quantity)\n\nprint(quantity + 1)\nprint(price * 2)\nprint(label + " items")',
    },
    {
      kind: "prose",
      heading: "Implicit conversion",
      body: [
        "Python sometimes converts a value automatically when it can do so without losing the important numeric information. Adding an `int` and a `float` produces a `float`.",
        "Do not rely on automatic conversion for text. Python will not add a string and an integer until you convert one of them yourself.",
      ],
    },
    {
      kind: "interactive-code",
      code: 'whole_number = 123\ndecimal_number = 1.23\ntotal = whole_number + decimal_number\n\nprint(total)\nprint(type(total).__name__)',
    },
    {
      kind: "prose",
      heading: "Importing modules",
      body: [
        "A module is a Python file that contains code you can reuse. The standard library includes modules for many common tasks.",
        "Use `import math` when you want the whole `math` module. Use `from math import ceil` when you only need a particular name.",
      ],
    },
    {
      kind: "interactive-code",
      code: 'import math\nfrom math import ceil\n\nprint(math.pi)\nprint(math.sqrt(81))\nprint(ceil(4.2))',
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Common mistakes",
      body: '- **Expecting input to be a number**: `input()` returns a string. Convert it with `int()` or `float()` before calculating.\n- **Converting invalid text**: `int("3.5")` and `int("hello")` raise errors. Use `float("3.5")` for decimal text.\n- **Forgetting the module name**: After `import math`, write `math.pi`, not just `pi`.\n- **Changing a value before you need it**: Keep raw text when it is useful, then store the converted value in a clear second name.',
    },
    {
      kind: "takeaways",
      items: [
        "Use `print()` to display results.",
        "`input()` returns a string.",
        "Use `int()` and `float()` to convert numeric text before calculation.",
        "Python can automatically combine an integer and a float into a float.",
        "Use `import` to access code from a module.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "io-conversions-1",
          question: "What type does `input()` return?",
          options: ["str", "int", "float", "It depends on what is typed"],
          correctIndex: 0,
          explanation: "input() always returns a string. Convert it if the program needs another type.",
        },
        {
          id: "io-conversions-2",
          question: "Which expression converts the text `\"42\"` into an integer?",
          options: ["str(\"42\")", "int(\"42\")", "float(42)", "input(42)"],
          correctIndex: 1,
          explanation: "int() converts valid whole-number text into an integer.",
        },
        {
          id: "io-conversions-3",
          question: "What is printed by `print(\"A\", \"B\", sep=\"-\")`?",
          options: ["A B", "A-B", "AB", "A\\nB"],
          correctIndex: 1,
          explanation: "sep replaces the default space between the values passed to print().",
        },
        {
          id: "io-conversions-4",
          question: "After `import math`, how do you access pi?",
          options: ["pi", "math.import(pi)", "math.pi", "import.pi"],
          correctIndex: 2,
          explanation: "The module name qualifies names imported with `import math`.",
        },
        {
          id: "io-conversions-5",
          question: "Write code that converts the string `\"8\"` to an integer and prints its value plus 2.",
          interactiveCode: true,
          initialCode: 'text_number = "8"\n\n# Write your code below\n',
          testCode: "",
          expectedOutput: "10",
          explanation: "Assign `int(text_number)` to a name, then print that name plus 2.",
        },
      ],
    },
  ],
};

export const PYTHON_BASICS_FINAL_QUIZ_LESSON: LessonContent = {
  slug: "python-basics-final-quiz",
  title: "Python Basics Final Quiz",
  subtitle: "Review the first four lessons with ten questions and coding challenges.",
  sections: [
    {
      kind: "quiz",
      isFinalQuiz: true,
      questions: [
        {
          id: "python-basics-final-1",
          question: "What is Python primarily used for?",
          options: [
            "Writing instructions that a computer can run",
            "Replacing a computer operating system",
            "Storing only spreadsheet data",
            "Designing computer hardware",
          ],
          correctIndex: 0,
          explanation: "Python is a programming language used to write instructions for many kinds of programs.",
        },
        {
          id: "python-basics-final-2",
          question: "Which character starts a single-line comment in Python?",
          options: ["#", "//", "<!--", "*"],
          correctIndex: 0,
          explanation: "Python ignores text after # on the same line.",
        },
        {
          id: "python-basics-final-3",
          question: "Create a variable named `message` with the text `Python is ready`, then print it.",
          interactiveCode: true,
          initialCode: "# Write your code below\n",
          testCode: "assert message == 'Python is ready'",
          expectedOutput: "Python is ready",
          requiredCodePatterns: [
            "\\bmessage\\s*=\\s*(['\\\"])Python is ready\\1",
            "\\bprint\\s*\\(\\s*message\\s*\\)",
          ],
          validationMessage: "Create `message` with the required text, then print `message`.",
          explanation: "Assign the text to `message`, then use `print(message)`.",
        },
        {
          id: "python-basics-final-4",
          question: "What does this code print? `status = \"draft\"; status = \"published\"; print(status)`",
          options: ["draft", "published", "draft published", "It raises an error"],
          correctIndex: 1,
          explanation: "The second assignment replaces the value referred to by status.",
        },
        {
          id: "python-basics-final-5",
          question: "What data type is the value `\"25\"`?",
          options: ["str", "int", "float", "bool"],
          correctIndex: 0,
          explanation: "Quotation marks make 25 text, so its type is str.",
        },
        {
          id: "python-basics-final-6",
          question: "Create `price = 20` and `quantity = 3`, then print their product.",
          interactiveCode: true,
          initialCode: "# Write your code below\n",
          testCode: "assert price == 20\nassert quantity == 3",
          expectedOutput: "60",
          requiredCodePatterns: [
            "\\bprice\\s*=\\s*20\\b",
            "\\bquantity\\s*=\\s*3\\b",
            "\\bprint\\s*\\(\\s*price\\s*\\*\\s*quantity\\s*\\)",
          ],
          validationMessage: "Create both variables, then print `price * quantity`.",
          explanation: "Assign the two variables, then use `print(price * quantity)`.",
        },
        {
          id: "python-basics-final-7",
          question: "What type does `input()` return, even if someone types digits?",
          options: ["str", "int", "float", "The type of the typed value"],
          correctIndex: 0,
          explanation: "input() returns text. Convert the result before doing numeric calculations.",
        },
        {
          id: "python-basics-final-8",
          question: "Which expression converts the text `\"3.5\"` into a decimal number?",
          options: ["int(\"3.5\")", "float(\"3.5\")", "str(3.5)", "bool(\"3.5\")"],
          correctIndex: 1,
          explanation: "float() converts valid decimal text into a floating-point number.",
        },
        {
          id: "python-basics-final-9",
          question: "After `import math`, which expression accesses the value of pi?",
          options: ["pi", "math.pi", "math.import(pi)", "import.math.pi"],
          correctIndex: 1,
          explanation: "Use the module name followed by a dot to access names imported with `import math`.",
        },
        {
          id: "python-basics-final-10",
          question: "Convert `raw_score` to an integer and print the score plus 8.",
          interactiveCode: true,
          initialCode: 'raw_score = "42"\n\n# Write your code below\n',
          testCode: "assert raw_score == '42'\nassert isinstance(score, int)\nassert score == 42",
          expectedOutput: "50",
          requiredCodePatterns: [
            "\\bscore\\s*=\\s*int\\s*\\(\\s*raw_score\\s*\\)",
            "\\bprint\\s*\\(\\s*score\\s*\\+\\s*8\\s*\\)",
          ],
          validationMessage: "Convert `raw_score` with `int()` into `score`, then print `score + 8`.",
          explanation: "Use `score = int(raw_score)`, then print `score + 8`.",
        },
      ],
    },
  ],
};


export const BASICS_TOPICS: Record<string, { title: string; slug: string; lessons: LessonContent[] }> = {
  basics: {
    title: "Python Basics",
    slug: "basics",
    lessons: [
      {
        slug: "what-is-python",
        title: "What is Python?",
        subtitle: "Learn how Python code tells a computer what to do.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "Computers follow instructions. A **programming language** is how we write those instructions.",
              "**Python is a programming language.** You write code in Python, then run it to tell the computer what to do.",
            ],
          },
          {
            kind: "animation",
            variant: "python-instructions",
            caption: "From Python code to a result",
          },
          {
            kind: "prose",
            heading: "Your first Python instruction",
            body: [
              "Use `print()` to display text. Run the example, then change the text and run it again.",
            ],
          },
          {
            kind: "interactive-code",
            code: 'print("Hello!")',
          },
          {
            kind: "prose",
            body: [
              "`\"Hello, World!\"` is a **string**, which is text. `print()` displays it in the output area.",
            ],
          },
          {
            kind: "prose",
            heading: "Why people choose Python",
            body: [
              "Python was created by Guido van Rossum and first released in 1991. Its syntax is compact and readable.",
              "This example stores an age, then checks whether it is at least 18.",
            ],
          },
          {
            kind: "interactive-code",
            code: 'age = 25\n\nif age >= 18:\n    print("You are an adult")',
          },
          {
            kind: "callout",
            tone: "info",
            title: "How to think about it",
            body: "Python is the language between you and the computer. You write an instruction. Python runs it.",
          },
          {
            kind: "prose",
            heading: "What can Python do?",
            body: [
              "Python is **general-purpose**, meaning it can be used for many kinds of work: websites, automation, data analysis, APIs, scientific computing, and machine learning.",
            ],
          },
          {
            kind: "table",
            caption: "A few places Python appears",
            headers: ["Area", "Example task"],
            rows: [
              ["Automation", "Rename files or send a weekly report"],
              ["Data analysis", "Calculate trends from a sales dataset"],
              ["Web development", "Build the logic behind a web application"],
              ["AI and machine learning", "Prepare data and train a model"],
              ["Scientific computing", "Explore measurements or simulations"],
            ],
          },
          {
            kind: "prose",
            heading: "A tiny data example",
            body: [
              "Python can combine text with a calculation. Run this code and check the output.",
            ],
          },
          {
            kind: "interactive-code",
            code: "sales = [100, 200, 300, 400]\n\naverage_sales = sum(sales) / len(sales)\n\nprint(average_sales)",
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "- **Expecting Python to read plain English**: Python needs valid Python syntax, even when code looks readable.\n- **Forgetting quotation marks around text**: `print(Hello)` looks for a name called `Hello`; use `print(\"Hello\")` for text.\n- **Treating Python as only a data language**: Data work is a major use, but Python is also used for automation, web apps, APIs, testing, and more.",
          },
          {
            kind: "takeaways",
            items: [
              "Python is a programming language for expressing instructions a computer can execute.",
              "`print()` displays a value in the output.",
              "Python is known for readable, concise syntax.",
              "Python is general-purpose: it supports automation, web development, data, AI, science, and more.",
            ],
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "what-is-python-1",
                question: "What is Python?",
                options: [
                  "A programming language for giving computers instructions",
                  "A type of computer hardware",
                  "A web browser",
                  "A spreadsheet format",
                ],
                correctIndex: 0,
                explanation: "Python is a programming language: a structured way to tell a computer what to do.",
              },
              {
                id: "what-is-python-2",
                question: "What does `print(\"Hello!\")` do?",
                options: [
                  "Displays Hello! in the output",
                  "Saves a file named Hello!",
                  "Creates a new Python program",
                  "Asks the user to type Hello!",
                ],
                correctIndex: 0,
                explanation: "`print()` displays the value passed to it. Quotation marks make `Hello!` text.",
              },
              {
                id: "what-is-python-3",
                question: "What does general-purpose mean when describing Python?",
                options: [
                  "It can be used for many categories of tasks",
                  "It only works for web pages",
                  "It can only print text",
                  "It only runs on one operating system",
                ],
                correctIndex: 0,
                explanation: "Python can be used across many areas, including automation, web development, data analysis, and AI.",
              },
              {
                id: "what-is-python-4",
                question: "Why is Python often approachable for beginners?",
                options: [
                  "Its syntax is designed to be readable and concise",
                  "It has no rules for writing code",
                  "It replaces every computer program",
                  "It only uses English sentences",
                ],
                correctIndex: 0,
                explanation: "Python still has exact rules, but its syntax is intentionally readable compared with many languages.",
              },
              {
                id: "what-is-python-5",
                question: "Write code that prints the message `Python is ready!`.",
                interactiveCode: true,
                initialCode: "# Write your code below\n",
                testCode: "",
                expectedOutput: "Python is ready!",
                explanation: "Use `print()` and put the message inside quotation marks: `print(\"Python is ready!\")`.",
              },
            ],
          },
        ],
      },
      BASIC_SYNTAX_LESSON,
      VARIABLES_DATA_TYPES_LESSON,
      IO_TYPE_CONVERSIONS_LESSON,
      PYTHON_BASICS_FINAL_QUIZ_LESSON,
    ],
  },
};
