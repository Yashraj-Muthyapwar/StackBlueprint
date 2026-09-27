import { type LessonContent } from "@/lessons/types";
import constantsModuleExample from "@/images/python/basics/constants-module-example.png";


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
    { kind: "quiz", questions: [
      { id: "basic-syntax-1", question: "What does Python do with a line that begins with `#`?", options: ["Ignores it as a comment", "Prints it", "Runs it twice", "Turns it into a variable"], correctIndex: 0, explanation: "A line beginning with `#` is a comment. Python ignores it during execution." },
      { id: "basic-syntax-2", question: "Which name is a valid Python identifier?", options: ["2_orders", "order-total", "class", "order_total"], correctIndex: 3, explanation: "`order_total` uses letters and an underscore, and it does not begin with a digit or use a keyword." },
      { id: "basic-syntax-3", question: "What is `price * quantity` in `total = price * quantity`?", options: ["A comment", "An expression", "A class", "A keyword"], correctIndex: 1, explanation: "It produces a value, so it is an expression. The full assignment line is a statement." },
      { id: "basic-syntax-4", question: "Why is indentation required after an `if` statement?", options: ["It marks the code that belongs to the if block", "It changes text color", "It adds a comment", "It creates a variable"], correctIndex: 0, explanation: "Indentation tells Python which statements are part of a block." },
      { id: "basic-syntax-5", question: "Write an `if` statement that prints `Ready` when `score` is at least 50.", interactiveCode: true, initialCode: "score = 75\n\n# Write your if statement below\n", testCode: "", expectedOutput: "Ready", explanation: "Use `if score >= 50:` followed by an indented `print(\"Ready\")`." },
    ] },
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
    { kind: "prose", heading: "Numeric, text, Boolean, and None", body: ["`int` holds whole numbers, `float` holds decimal numbers, and `complex` holds a real and imaginary part. `str` stores text, `bool` is either `True` or `False`, and `None` represents no value currently assigned."] },
    { kind: "interactive-code", code: 'whole_number = 25\ndecimal_number = 19.99\ncomplex_number = 3 + 4j\nmessage = "Hello"\nis_ready = True\nnot_assigned = None\n\nfor value in [whole_number, decimal_number, complex_number, message, is_ready, not_assigned]:\n    print(type(value).__name__)' },
    { kind: "prose", heading: "Sequence types", body: ["A sequence keeps items in an order. A `list` can be changed, a `tuple` is an ordered fixed collection, and `range` represents a sequence of integers."] },
    { kind: "interactive-code", code: 'skills = ["Python", "SQL"]\ncoordinates = (10, 20)\nsteps = range(1, 4)\n\nprint(type(skills).__name__)\nprint(type(coordinates).__name__)\nprint(type(steps).__name__)\nprint(list(steps))' },
    { kind: "prose", heading: "Mappings and set types", body: ["A `dict` maps keys to values. A `set` stores unique values. A `frozenset` also stores unique values, but cannot be changed after it is created."] },
    { kind: "interactive-code", code: 'profile = {"name": "Ava", "age": 25}\ntags = {"python", "basics", "python"}\nfixed_tags = frozenset({"python", "basics"})\n\nprint(type(profile).__name__)\nprint(type(tags).__name__)\nprint(type(fixed_tags).__name__)\nprint(tags)' },
    { kind: "prose", heading: "Binary types", body: ["Binary types hold bytes rather than ordinary text. `bytes` is immutable, `bytearray` can be changed, and `memoryview` provides a view into existing binary data. You will use these more often when reading files, working with network data, or handling media."] },
    { kind: "interactive-code", code: 'raw = b"ABC"\neditable = bytearray(b"ABC")\nview = memoryview(raw)\n\nprint(type(raw).__name__)\nprint(type(editable).__name__)\nprint(type(view).__name__)\nprint(list(raw))' },
    { kind: "prose", heading: "Collections are values too", body: ["Lists, tuples, dictionaries, and sets hold several values. You will study each collection in depth later."] },
    { kind: "interactive-code", code: 'skills = ["Python", "SQL"]\ncoordinates = (10, 20)\nprofile = {"name": "Ava", "age": 25}\ntags = {"python", "basics"}\n\nprint(skills)\nprint(coordinates)\nprint(profile)\nprint(tags)' },
    { kind: "prose", heading: "Checking a type with type()", body: ["Use `type()` to ask Python what type a value has. The `__name__` part below keeps the output short and easy to read.", "Python usually determines a value's type when the program runs. A variable can later refer to a value of a different type, but avoid doing that without a good reason."] },
    { kind: "interactive-code", code: 'name = "Ava"\nage = 25\nprice = 19.99\nis_active = True\n\nprint(type(name).__name__)\nprint(type(age).__name__)\nprint(type(price).__name__)\nprint(type(is_active).__name__)' },
    { kind: "callout", tone: "warn", title: "Common mistakes", body: "- **Starting a name with a digit**: `2items` is not valid.\n- **Treating uppercase as enforced**: Python allows an uppercase name to be reassigned.\n- **Mixing text and numbers**: `\"25\"` is text, while `25` is an integer.\n- **Using vague names**: Prefer `order_total` to `x` when the value has a clear purpose." },
    { kind: "takeaways", items: ["Variables are names that refer to values.", "Use descriptive `snake_case` names for variables.", "Uppercase names mark constants by convention only.", "Literals are values written directly in code.", "Use `type()` to inspect a value's data type."] },
    {
      kind: "quiz", questions: [
        { id: "variables-types-1", question: "What does the statement `score = 20` do?", options: ["Creates or updates the name score to refer to 20", "Prints 20", "Turns score into a constant", "Adds 20 to score"], correctIndex: 0, explanation: "The assignment operator stores a value under a name. It also replaces the value referred to by an existing name." },
        { id: "variables-types-2", question: "Which name follows the usual Python variable naming convention?", options: ["Order Total", "order-total", "order_total", "2_orders"], correctIndex: 2, explanation: "Variables are commonly written in lowercase snake_case, with underscores between words." },
        { id: "variables-types-3", question: "What does an uppercase name such as `MAX_USERS` mean in Python?", options: ["Python makes it impossible to change", "It is a convention for a value intended to stay unchanged", "It must store text", "It is a keyword"], correctIndex: 1, explanation: "Uppercase communicates intent to readers. Python does not prevent reassignment of an ordinary uppercase variable." },
        { id: "variables-types-4", question: "Which value has the `float` type?", options: ["`25`", "`\"25\"`", "`25.0`", "`True`"], correctIndex: 2, explanation: "A numeric literal with a decimal point is a float." },
        { id: "variables-types-5", question: "Write code that assigns `\"Chicago\"` to `city` and prints `city`.", interactiveCode: true, initialCode: "# Write your code here\n", testCode: "", expectedOutput: "Chicago", explanation: "Assign the string with `city = \"Chicago\"`, then use `print(city)`." },
      ]
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
    ],
  },
};

