import { type LessonContent } from "@/lessons/types";

export const FUNCTION_BASICS_LESSON: LessonContent = {
  slug: "function-basics",
  title: "Function Basics",
  subtitle: "Write reusable functions, call them with values, and return useful results.",
  sections: [
    {
      kind: "prose",
      heading: "Why functions matter",
      body: ["A **function** is a named, reusable block of code that performs one focused task. It helps you avoid repeating the same instructions and keeps a growing program easier to read, test, and change.", "Python includes built-in functions such as `print()`, `len()`, and `type()`. You can also define functions for tasks in your own program."],
    },
    { kind: "prose", heading: "Built-in and user-defined functions", body: ["Python provides many useful functions. **User-defined functions** let you name and reuse work that is specific to your program."] },
    {
      kind: "table",
      headers: ["Type", "Who provides it?", "Examples"],
      rows: [
        ["Built-in function", "Python", "`print()`, `len()`, `type()`"],
        ["User-defined function", "You", "`greet()`, `calculate_total()`"],
      ],
    },
    {
      kind: "animation",
      variant: "function-basics",
      caption: "A function is stored when it is defined. Its body runs only after a call.",
    },
    {
      kind: "syntax",
      title: "Define a function",
      code: "def function_name():\n    statement",
      description: "The def keyword starts the definition. A function name is followed by parentheses and a colon. Its body must be indented.",
    },
    {
      kind: "interactive-code",
      caption: "Define greet(), then call it to run the function body.",
      code: 'def greet():\n    print("Hello, welcome to Python")\n\ngreet()',
    },
    {
      kind: "prose",
      heading: "Defining is not calling",
      body: ["Python stores a function definition when it reaches `def`, but does not run the function body yet. The body runs each time you use the function name followed by **parentheses**. A function can be called once or many times."],
    },
    {
      kind: "interactive-code",
      caption: "The same function body runs once for each call.",
      code: 'def say_hello():\n    print("Hello")\n\nprint("Before the calls")\nsay_hello()\nsay_hello()',
    },
    {
      kind: "syntax",
      title: "Accept a simple input",
      code: 'def greet(name):\n    print("Hello", name)\n\ngreet("Ava")',
      description: "A parameter is a name inside the function definition. An argument is the value supplied when the function is called. The next lesson explores arguments and parameters in depth.",
    },
    {
      kind: "interactive-code",
      caption: "Pass an argument into a function through its parameter.",
      code: 'def welcome(name):\n    print("Welcome,", name)\n\nwelcome("Noah")',
    },
    {
      kind: "prose",
      heading: "Use pass for an empty function",
      body: ["A function body cannot be empty. Use `pass` as a temporary placeholder when you know the function shape but will write its logic later. It performs no action."],
    },
    {
      kind: "interactive-code",
      caption: "pass keeps a planned function syntactically valid.",
      code: 'def save_draft():\n    pass\n\nsave_draft()\nprint("Program continues")',
    },
    {
      kind: "syntax",
      title: "Return a result",
      code: "def function_name():\n    return value",
      description: "return sends a value back to the place where the function was called. It also ends that function call immediately.",
    },
    {
      kind: "interactive-code",
      caption: "Store the value returned by add(), then print it.",
      code: "def add(a, b):\n    result = a + b\n    return result\n\nanswer = add(10, 20)\nprint(answer)",
    },
    {
      kind: "prose",
      heading: "Return versus print",
      body: ["`print()` displays information for a person to see. `return` gives a value back to the rest of the program so it can be stored, combined, or passed into another function. If a function reaches its end without `return`, it returns `None`."],
    },
    {
      kind: "interactive-code",
      caption: "A function without return produces None after it finishes.",
      code: 'def announce():\n    print("Ready")\n\nresult = announce()\nprint(result)',
    },
    {
      kind: "prose",
      heading: "Return more than one value",
      body: ["Separate values with commas after return. Python packages them as a `tuple`, which you can **unpack** into multiple variables."],
    },
    {
      kind: "interactive-code",
      caption: "Return a total and a difference, then unpack both values.",
      code: "def calculate(a, b):\n    return a + b, a - b\n\ntotal, difference = calculate(20, 10)\nprint(total)\nprint(difference)",
    },
    {
      kind: "prose",
      heading: "Docstrings",
      body: ["A `docstring` is a short description written inside a function. Put it as the first statement in the function body so that readers, editors, and Python itself can find it. A useful docstring states what the function does, not every implementation detail."],
    },
    {
      kind: "syntax",
      title: "Document a function",
      code: 'def function_name():\n    """Explain what the function does."""\n    statement',
      description: "A docstring is a triple-quoted string placed first in a function body. It explains the function for future readers and is available through the __doc__ attribute.",
    },
    {
      kind: "interactive-code",
      caption: "Read a function docstring with the __doc__ attribute.",
      code: 'def calculate_area(length, width):\n    """Return the area of a rectangle."""\n    return length * width\n\nprint(calculate_area(4, 3))\nprint(calculate_area.__doc__)',
    },
    {
      kind: "prose",
      heading: "Function Annotations",
      body: ["Function annotations add **type hints** to `parameters` and `return values`. They make a function's expected inputs and result easier to understand, and allow type-checking tools to flag likely mistakes before code runs."],
    },
    {
      kind: "syntax",
      title: "Add function annotations",
      code: "def function_name(parameter: type) -> return_type:\n    statement",
      description: "Annotations describe the expected types of parameters and a return value. They help readers, editors, and type-checking tools understand a function's interface.",
    },
    {
      kind: "interactive-code",
      caption: "Annotations are stored on the function and can be inspected through __annotations__.",
      code: 'def add(a: int, b: int) -> int:\n    """Return the sum of two integers."""\n    return a + b\n\nprint(add(10, 20))\nprint(add.__annotations__)',
    },
    {
      kind: "callout",
      tone: "info",
      title: "Type hints do not enforce types",
      body: "Python does not automatically reject a wrong type because an annotation is present. Annotations are metadata and guidance for people and tools. The function code still determines what happens at runtime.",
    },
    {
      kind: "callout",
      tone: "violet",
      title: "Where Pydantic fits",
      body: "**Pydantic** is a separate library that uses type annotations to validate incoming data, such as API requests or configuration. It can report invalid values or convert compatible values. You will learn libraries such as Pydantic in the seperate module.",
    },
    {
      kind: "prose",
      heading: "Name functions clearly",
      body: ["Function names follow the same identifier rules as variables. Use lowercase **snake_case** names that describe an action, such as `calculate_total()` or `send_email()`. Avoid Python keywords and vague names such as `x()` or `test()`."],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Common mistakes",
      body: "- **Forgetting the call**: A definition does not run by itself. Use the function name with parentheses.\n- **Missing the colon or indentation**: The function header ends with a colon and the body is indented.\n- **Using print when you need a value**: Use return when later code needs the result.\n- **Leaving a body empty**: Use pass until you are ready to add the function logic.",
    },
    {
      kind: "takeaways",
      items: [
        "Functions group a focused task into reusable code.",
        "def creates a function definition, while parentheses call it.",
        "Parameters receive values from function calls.",
        "return sends a value back and ends that function call.",
        "Multiple returned values are packaged as a tuple, while docstrings and annotations describe a function's purpose and interface.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "function-basics-1",
          question: "When does the body of a user-defined function run?",
          options: [
            "When the function is called",
            "As soon as Python reads def",
            "Only when the program ends",
            "When its docstring is written",
          ],
          correctIndex: 0,
          explanation: "def stores the function definition. The body executes when code calls the function.",
        },
        {
          id: "function-basics-2",
          question: "What does the -> int part of def add(a: int, b: int) -> int: communicate?",
          options: [
            "The expected return type",
            "The function must return exactly one value",
            "Python will convert every result to an integer",
            "The function has no parameters",
          ],
          correctIndex: 0,
          explanation: "The annotation after -> describes the expected return type. It is a hint, not automatic runtime conversion.",
        },
        {
          id: "function-basics-3",
          question: "What does Python return from a function that has no return statement?",
          options: [
            "None",
            "0",
            "An empty string",
            "The most recent printed value",
          ],
          correctIndex: 0,
          explanation: "Python automatically returns None when a function finishes without an explicit return.",
        },
        {
          id: "function-basics-4",
          question: "What is the result of returning two comma-separated values from a function?",
          options: [
            "A tuple containing both values",
            "Two separate function results",
            "A list containing both values",
            "A syntax error",
          ],
          correctIndex: 0,
          explanation: "Python packages comma-separated returned values into a tuple, which can then be unpacked.",
        },
        {
          id: "function-basics-5",
          question: "Create total_cost(price, quantity) that returns price multiplied by quantity. Store total_cost(12, 3) in total and print total.",
          interactiveCode: true,
          initialCode: "# Write your code below\n",
          testCode: "assert total_cost(12, 3) == 36\nassert total == 36",
          expectedOutput: "36",
          requiredCodePatterns: [
            "\\bdef\\s+total_cost\\s*\\(\\s*price\\s*,\\s*quantity\\s*\\)\\s*:",
            "\\breturn\\s+price\\s*\\*\\s*quantity\\b",
            "\\btotal\\s*=\\s*total_cost\\s*\\(\\s*12\\s*,\\s*3\\s*\\)",
            "\\bprint\\s*\\(\\s*total\\s*\\)",
          ],
          validationMessage: "Define total_cost, return the multiplication, store the call in total, and print total.",
          explanation: "A reusable function returns the product, and the caller stores and prints that returned value.",
        },
      ],
    },
  ],
};

export const ARGUMENTS_AND_PARAMETERS_LESSON: LessonContent = {
  slug: "arguments-parameters",
  title: "Arguments & Parameters",
  subtitle: "Pass data into functions with positional, keyword, default, and variable-length arguments.",
  sections: [
    {
      kind: "prose",
      heading: "Parameters and arguments",
      body: ["A **parameter** is a name written in a function definition. It receives a value when the function is called. An **argument** is the actual value supplied in that call.", "Parameters make one function useful with different data, without duplicating its body."],
    },
    {
      kind: "table",
      headers: ["Term", "Where it appears", "Role"],
      rows: [
        ["Parameter", "Function definition", "A name that receives a value"],
        ["Argument", "Function call", "The value supplied to a parameter"],
      ],
    },
    {
      kind: "animation",
      variant: "arguments-parameters",
      caption: "A call binds supplied arguments to the function parameters before the body runs.",
    },
    {
      kind: "syntax",
      title: "Define and call with a parameter",
      code: "def function_name(parameter):\n    statement\n\nfunction_name(argument)",
      description: "The parameter appears in the definition. The argument is supplied by the call.",
    },
    {
      kind: "interactive-code",
      caption: "The argument becomes the value of the parameter while greet runs.",
      code: 'def greet(name):\n    print("Hello", name)\n\ngreet("Aman")',
    },
    {
      kind: "prose",
      heading: "Positional Arguments",
      body: ["Positional arguments are matched to parameters by their order. The first argument goes to the first parameter, the second goes to the second parameter, and so on. Swapping the arguments changes which parameter receives each value."],
    },
    {
      kind: "syntax",
      title: "Pass positional arguments",
      code: "function_name(argument_1, argument_2)",
      description: "The position of each argument determines its destination.",
    },
    {
      kind: "interactive-code",
      caption: "Aman is matched with name, while 21 is matched with age.",
      code: 'def student_info(name, age):\n    print("Name:", name)\n    print("Age:", age)\n\nstudent_info("Aman", 21)',
    },
    {
      kind: "prose",
      heading: "Keyword Arguments",
      body: ["Keyword arguments label each supplied value with a parameter name. Because the names make the mapping explicit, their order can change. Positional arguments must still come before keyword arguments in the same call."],
    },
    {
      kind: "syntax",
      title: "Pass keyword arguments",
      code: "function_name(parameter_1=value_1, parameter_2=value_2)",
      description: "Use parameter_name=value to map an argument by name instead of position.",
    },
    {
      kind: "interactive-code",
      caption: "Keyword arguments can be written in a different order when their parameter names are included.",
      code: 'def student_info(name, age, course):\n    print("Name:", name)\n    print("Age:", age)\n    print("Course:", course)\n\nstudent_info(age=21, course="Python", name="Aman")',
    },
    {
      kind: "prose",
      heading: "Default Parameters",
      body: ["A default parameter supplies a value when its caller does not. A supplied argument replaces the default. Parameters without defaults must come before parameters with defaults."],
    },
    {
      kind: "syntax",
      title: "Set a default value",
      code: "def function_name(parameter=value):\n    statement",
      description: "The assignment in a function header provides the fallback value.",
    },
    {
      kind: "interactive-code",
      caption: "The first call replaces the default, while the second uses it.",
      code: 'def greet(name="Guest"):\n    print("Hello", name)\n\ngreet("Aman")\ngreet()',
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Avoid mutable default values",
      body: "Do not use a list or dictionary as a default parameter. That object is created once and reused by later calls. Use None as the default, then create a new list or dictionary inside the function.",
    },
    {
      kind: "interactive-code",
      caption: "Create a fresh list for each call instead of sharing a mutable default.",
      code: 'def add_item(item, items=None):\n    if items is None:\n        items = []\n    items.append(item)\n    return items\n\nprint(add_item("A"))\nprint(add_item("B"))',
    },
    {
      kind: "prose",
      heading: "*args",
      body: ["Use `*args` when a function can receive any number of extra positional arguments. Inside the function, the collected values are stored as a tuple. The name **args** is conventional, but the single star is what gives it this behavior."],
    },
    {
      kind: "syntax",
      title: "Collect extra positional arguments",
      code: "def function_name(*args):\n    statement",
      description: "All unmatched positional arguments are collected into one tuple.",
    },
    {
      kind: "interactive-code",
      caption: "numbers is a tuple containing every positional value after the function is called.",
      code: "def add_numbers(*numbers):\n    return sum(numbers)\n\nprint(add_numbers(10, 20, 30))\nprint(add_numbers(5, 15))",
    },
    {
      kind: "prose",
      heading: "**kwargs",
      body: ["Use `**kwargs` when a function can receive any number of extra keyword arguments. Inside the function, the collected names and values are stored as a dictionary. The name **kwargs** is conventional, but the double star is what gives it this behavior."],
    },
    {
      kind: "syntax",
      title: "Collect extra keyword arguments",
      code: "def function_name(**kwargs):\n    statement",
      description: "All unmatched keyword arguments are collected into one dictionary.",
    },
    {
      kind: "interactive-code",
      caption: "details is a dictionary of the named values supplied to show_profile.",
      code: 'def show_profile(**details):\n    for key, value in details.items():\n        print(key, value)\n\nshow_profile(name="Aman", age=21, course="Python")',
    },
    {
      kind: "prose",
      heading: "*args vs **kwargs",
      body: ["Use `*args` for extra values given by position and `**kwargs` for extra values given by name. They can appear together in the same function definition."],
    },
    {
      kind: "table",
      headers: ["Feature", "`*args`", "`**kwargs`"],
      rows: [
        ["Collects", "Positional arguments", "Keyword arguments"],
        ["Stored as", "Tuple", "Dictionary"],
        ["Call example", "show_data(10, 20)", 'show_data(name="Aman", age=21)'],
      ],
    },
    {
      kind: "interactive-code",
      caption: "Use both collection forms when a call accepts flexible positional and named information.",
      code: 'def show_data(*args, **kwargs):\n    print(args)\n    print(kwargs)\n\nshow_data(10, 20, name="Aman", age=21)',
    },
    {
      kind: "prose",
      heading: "Function Parameter Order",
      body: ["When a function combines parameter forms, their order is fixed: `required parameters`, `default parameters`, `*args`, then `**kwargs`. This order keeps the definition valid and makes calls predictable."],
    },
    {
      kind: "syntax",
      title: "Order parameter forms",
      code: "def function_name(required, default_value=value, *args, **kwargs):\n    statement",
      description: "Required parameters come first. Defaults follow them, then the variable-length positional and keyword collections.",
    },
    {
      kind: "interactive-code",
      caption: "This definition follows Python's parameter order and shows where each supplied value lands.",
      code: 'def student_report(name, age=18, *marks, **details):\n    print("Name:", name)\n    print("Age:", age)\n    print("Marks:", marks)\n    print("Details:", details)\n\nstudent_report("Aman", 21, 80, 90, 85, course="Python", city="Delhi")',
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Common mistakes",
      body: "- **Reversing positional values**: Positional calls use order, not intent.\n- **Putting a positional argument after a keyword argument**: Write positional values first.\n- **Putting a required parameter after a default parameter**: Required parameters must come first.\n- **Mistaking names for behavior**: args and kwargs are conventions. The stars determine how Python collects values.",
    },
    {
      kind: "takeaways",
      items: [
        "Parameters are names in a definition, while arguments are values in a call.",
        "Positional arguments match by order and keyword arguments match by parameter name.",
        "Default parameters make arguments optional, but mutable defaults should be avoided.",
        "`*args` collects extra positional values into a tuple and `**kwargs` collects keyword values into a dictionary.",
        "Parameter order is required, default, `*args`, then `**kwargs`.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "arguments-parameters-1",
          question: 'In def greet(name): followed by greet("Ava"), what is name?',
          options: ["A parameter", "An argument", "A return value", "A keyword argument"],
          correctIndex: 0,
          explanation: "name appears in the function definition, so it is a parameter. Ava is the argument supplied by the call.",
        },
        {
          id: "arguments-parameters-2",
          question: "Which call is valid for def student_info(name, age)?",
          options: ['student_info(age=21, name="Aman")', 'student_info(name="Aman", 21)', 'student_info(21, name="Aman")', 'student_info(name="Aman", age)'],
          correctIndex: 0,
          explanation: "Keyword arguments may be ordered differently, but positional arguments cannot follow a keyword argument.",
        },
        {
          id: "arguments-parameters-3",
          question: "How does Python store values collected by *args?",
          options: ["As a tuple", "As a dictionary", "As a list", "As a set"],
          correctIndex: 0,
          explanation: "*args collects extra positional arguments into a tuple.",
        },
        {
          id: "arguments-parameters-4",
          question: "Which default value is the safer choice for a function that will build a list?",
          options: ["None", "[]", "{}", "()"],
          correctIndex: 0,
          explanation: "Use None, then create a new list inside the function so calls do not share one mutable object.",
        },
        {
          id: "arguments-parameters-5",
          question: 'Create summarize(name, age=18, *scores, **details). Return name, age, scores, details. Store summarize("Ava", 20, 90, 85, city="Austin") in result and print result.',
          interactiveCode: true,
          initialCode: "# Write your code below\n",
          testCode: 'assert summarize("Ava", 20, 90, 85, city="Austin") == ("Ava", 20, (90, 85), {"city": "Austin"})\nassert result == ("Ava", 20, (90, 85), {"city": "Austin"})',
          expectedOutput: "('Ava', 20, (90, 85), {'city': 'Austin'})",
          requiredCodePatterns: [
            "\\bdef\\s+summarize\\s*\\(\\s*name\\s*,\\s*age\\s*=\\s*18\\s*,\\s*\\*scores\\s*,\\s*\\*\\*details\\s*\\)\\s*:",
            "\\breturn\\s+name\\s*,\\s*age\\s*,\\s*scores\\s*,\\s*details\\b",
            "\\bresult\\s*=\\s*summarize\\s*\\(\\s*['\\\"]Ava['\\\"]\\s*,\\s*20\\s*,\\s*90\\s*,\\s*85\\s*,\\s*city\\s*=\\s*['\\\"]Austin['\\\"]\\s*\\)",
            "\\bprint\\s*\\(\\s*result\\s*\\)",
          ],
          validationMessage: "Define summarize with the requested parameter order, return all four values, save the call in result, and print result.",
          explanation: "The call maps the required and default-style parameters first, collects extra positional values in scores, and collects city in details.",
        },
      ],
    },
  ],
};

export const SCOPE_AND_NAMESPACES_LESSON: LessonContent = {
  slug: "scope-namespaces",
  title: "Scope & Namespaces",
  subtitle: "Find names predictably with namespaces, the LEGB rule, and deliberate scope changes.",
  sections: [
    {
      kind: "prose",
      heading: "Why scope matters",
      body: [
        "A name such as `title` or `count` is only useful where Python can find it. **Scope** is the part of a program where a name can be used. A **namespace** is the mapping that connects names to their objects or values.",
        "When Python evaluates a name, it searches namespaces in a specific order. Learning that order makes local variables, nested functions, and scope errors much easier to reason about.",
      ],
    },
    {
      kind: "animation",
      variant: "scope-namespaces",
      caption: "Python resolves a name by searching Local, Enclosing, Global, then Built-in namespaces.",
    },
    {
      kind: "prose",
      heading: "Namespace Concept",
      body: [
        "A namespace maps names to objects. After `score = 10`, the current namespace maps the name `score` to the integer object `10`. Namespaces let Python use the same spelling in separate scopes without a conflict.",
      ],
    },
    {
      kind: "syntax",
      title: "Create a name in a namespace",
      code: "name = value",
      description: "Assignment creates or updates a mapping from a name to an object in the current namespace.",
    },
    {
      kind: "table",
      headers: ["Namespace", "Contains"],
      rows: [
        ["Local", "Names created inside the current function"],
        ["Enclosing", "Names created by an outer function"],
        ["Global", "Names created at file level"],
        ["Built-in", "Names Python provides automatically"],
      ],
    },
    {
      kind: "interactive-code",
      caption: "The name x exists in both the global and local namespaces, with different values.",
      code: 'x = 100\n\ndef show():\n    x = 50\n    print("local x:", x)\n\nshow()\nprint("global x:", x)',
    },
    {
      kind: "prose",
      heading: "Local Scope",
      body: [
        "A **local variable** is created inside a function. It is available only while that function is running and cannot be used directly outside the function. Each function call gets its own local namespace.",
      ],
    },
    {
      kind: "syntax",
      title: "Create a local variable",
      code: "def function_name():\n    local_name = value\n    print(local_name)",
      description: "A name assigned inside the indented function body belongs to that function's local scope.",
    },
    {
      kind: "interactive-code",
      caption: "name is created when show_name runs and is used only inside that function.",
      code: 'def show_name():\n    name = "Ava"\n    print(name)\n\nshow_name()',
    },
    {
      kind: "prose",
      heading: "Global Scope",
      body: [
        "A **global variable** is created outside all functions, at file level. Code at file level can use it, and functions can read it when no nearer name with the same spelling exists. Reading a global name does not require the `global` keyword.",
      ],
    },
    {
      kind: "syntax",
      title: "Create and read a global variable",
      code: "global_name = value\n\ndef function_name():\n    print(global_name)\n\nprint(global_name)",
      description: "The assignment is outside the function, so global_name can be read both at file level and inside the function.",
    },
    {
      kind: "interactive-code",
      caption: "course is global and is read once inside the function and once at file level.",
      code: 'course = "Python"\n\ndef show_course():\n    print("inside:", course)\n\nshow_course()\nprint("outside:", course)',
    },
    {
      kind: "table",
      headers: ["Point", "Local scope", "Global scope"],
      rows: [
        ["Created where?", "Inside a function", "Outside all functions"],
        ["Read where?", "Inside the function that creates it", "At file level and inside functions"],
        ["Typical lifetime", "During a function call", "For the running module or program"],
        ["Example", "`name = \"Ava\"` inside a function", "`course = \"Python\"` at file level"],
      ],
    },
    {
      kind: "prose",
      heading: "Enclosing Scope",
      body: [
        "An **enclosing scope** exists when one function is defined inside another. The inner function can read names from its nearest outer function if it cannot find the name locally.",
      ],
    },
    {
      kind: "syntax",
      title: "Read a name from an outer function",
      code: "def outer():\n    enclosing_name = value\n\n    def inner():\n        print(enclosing_name)\n\n    inner()",
      description: "enclosing_name belongs to outer. inner reads it through the enclosing scope.",
    },
    {
      kind: "interactive-code",
      caption: "inner has no greeting of its own, so it reads greeting from outer.",
      code: 'def outer():\n    greeting = "Hello"\n\n    def inner():\n        print(greeting)\n\n    inner()\n\nouter()',
    },
    {
      kind: "prose",
      heading: "Built-in Scope",
      body: [
        "**Built-in scope** contains names Python provides automatically, including `print`, `len`, `range`, `sum`, `max`, and `type`. Python searches this namespace last, after local, enclosing, and global scopes.",
      ],
    },
    {
      kind: "syntax",
      title: "Use a built-in name",
      code: "text = \"Python\"\nlength = len(text)\nprint(length)",
      description: "You can call len() without defining it yourself because Python supplies it in the built-in namespace.",
    },
    {
      kind: "interactive-code",
      caption: "len is found in the built-in namespace because this program never defines it.",
      code: 'word = "Python"\nletters = len(word)\nprint(letters)',
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Do not shadow built-in names",
      body: "Avoid names such as `list`, `dict`, `str`, `int`, `sum`, and `max` for your own variables. For example, after `list = [1, 2]`, calling `list()` in that scope no longer reaches Python's built-in list constructor.",
    },
    {
      kind: "prose",
      heading: "LEGB Rule",
      body: [
        "**LEGB** is Python's name-lookup order: **Local**, **Enclosing**, **Global**, then **Built-in**. Python stops at the first matching name. A name in a nearer scope therefore takes priority over the same name in an outer scope.",
      ],
    },
    {
      kind: "table",
      headers: ["Search order", "Scope", "Where the name comes from"],
      rows: [
        ["1", "Local", "Inside the current function"],
        ["2", "Enclosing", "Inside an outer function"],
        ["3", "Global", "At the file or program level"],
        ["4", "Built-in", "Names supplied by Python, such as `len`"],
      ],
    },
    {
      kind: "interactive-code",
      caption: "message is found locally in inner, so Python does not continue to enclosing or global scope.",
      code: 'message = "global"\n\ndef outer():\n    message = "enclosing"\n\n    def inner():\n        message = "local"\n        return message\n\n    return inner()\n\nprint(outer())',
    },
    {
      kind: "prose",
      heading: "Variable Shadowing",
      body: [
        "**Shadowing** happens when a nearer scope creates a name that has the same spelling as a name in an outer scope. The nearer name is used in that scope, while the outer name is unchanged. Shadowing is sometimes useful, but clear, different names are usually easier to maintain.",
      ],
    },
    {
      kind: "syntax",
      title: "Shadow an outer name",
      code: "name = outer_value\n\ndef function_name():\n    name = local_value\n    print(name)\n\nprint(name)",
      description: "The local assignment creates a separate name that temporarily hides the outer name during the function call.",
    },
    {
      kind: "interactive-code",
      caption: "The local name shadows the global name only while show_name runs.",
      code: 'name = "Global Ava"\n\ndef show_name():\n    name = "Local Ava"\n    print(name)\n\nshow_name()\nprint(name)',
    },
    {
      kind: "prose",
      heading: "global Keyword",
      body: [
        "Assignment inside a function normally creates a local name. Use `global` only when a function must rebind an existing global name. Reading a global name does not need it. In many designs, returning a new value is clearer than changing shared global state.",
      ],
    },
    {
      kind: "syntax",
      title: "Rebind a global name",
      code: "name = value\n\ndef function_name():\n    global name\n    name = new_value",
      description: "global tells Python that assignment should update the file-level name instead of making a new local name.",
    },
    {
      kind: "interactive-code",
      caption: "global lets increase_count update the count defined outside the function.",
      code: 'count = 0\n\ndef increase_count():\n    global count\n    count += 1\n\nincrease_count()\nprint(count)',
    },
    {
      kind: "prose",
      heading: "nonlocal Keyword",
      body: [
        "Use `nonlocal` inside a nested function to rebind a name from the nearest enclosing function. The enclosing name must already exist. Unlike `global`, `nonlocal` never targets a file-level name.",
      ],
    },
    {
      kind: "syntax",
      title: "Rebind an enclosing name",
      code: "def outer():\n    name = value\n\n    def inner():\n        nonlocal name\n        name = new_value",
      description: "nonlocal connects an assignment in inner to the name created in outer.",
    },
    {
      kind: "interactive-code",
      caption: "inner changes count in outer's enclosing namespace.",
      code: 'def outer():\n    count = 0\n\n    def increase():\n        nonlocal count\n        count += 1\n        return count\n\n    print(increase())\n    print(increase())\n\nouter()',
    },
    {
      kind: "table",
      headers: ["Keyword", "Used inside", "Changes"],
      rows: [
        ["`global`", "Any function", "A name in the global namespace"],
        ["`nonlocal`", "A nested function", "A name in the nearest enclosing namespace"],
      ],
    },
    {
      kind: "prose",
      heading: "Inspect Namespaces with locals() and globals()",
      body: [
        "`locals()` returns the current local namespace as a dictionary. `globals()` returns the module's global namespace as a dictionary. They are useful for learning and debugging, but program logic should not usually depend on changing these dictionaries.",
      ],
    },
    {
      kind: "syntax",
      title: "Inspect local and global mappings",
      code: "global_name = value\n\ndef function_name():\n    local_name = value\n    print(locals()[\"local_name\"])\n\nprint(globals()[\"global_name\"])",
      description: "Both functions return dictionaries. Index a known key when demonstrating a specific mapping instead of printing a large namespace dictionary.",
    },
    {
      kind: "interactive-code",
      caption: "Inspect specific entries instead of printing every global name.",
      code: 'course = "Python"\n\ndef inspect_names():\n    learner = "Ava"\n    print(locals()["learner"])\n    print(globals()["course"])\n\ninspect_names()',
    },
    {
      kind: "prose",
      heading: "NameError and UnboundLocalError",
      body: [
        "A `NameError` means Python cannot find the name in any LEGB scope. An `UnboundLocalError` is more specific: Python has identified a name as local because the function assigns to it, but the code tries to read that local name before it receives a value.",
      ],
    },
    {
      kind: "table",
      headers: ["Error", "Cause", "Typical fix"],
      rows: [
        ["`NameError`", "No matching name exists in any searched scope", "Define the name, correct its spelling, or pass it into the function"],
        ["`UnboundLocalError`", "A local name is read before its assignment", "Assign first, use global/nonlocal deliberately, or return a value"],
      ],
    },
    {
      kind: "interactive-code",
      caption: "NameError: age is not defined in any scope.",
      code: "def show_age():\n    print(age)\n\nshow_age()",
    },
    {
      kind: "interactive-code",
      caption: "UnboundLocalError: count is read before its local assignment.",
      code: "count = 0\n\ndef increase_count():\n    count += 1\n\nincrease_count()",
    },
    {
      kind: "callout",
      tone: "warn",
      title: "A common UnboundLocalError pattern",
      body: "With `count = 0` outside a function, writing `count += 1` inside that function makes `count` local unless you declare `global count`. Python then tries to read the new local `count` before its first assignment. Prefer returning `count + 1` when possible, or use `global` only when shared state is truly intended.",
    },
    {
      kind: "prose",
      heading: "Important Scope Summary",
      body: ["Use this table as a compact reference when deciding where a name is created, searched, or changed."],
    },
    {
      kind: "table",
      headers: ["Concept", "Meaning"],
      rows: [
        ["Local scope", "Names created inside the current function"],
        ["Enclosing scope", "Names created by an outer function"],
        ["Global scope", "Names created outside functions at file level"],
        ["Built-in scope", "Names Python provides automatically"],
        ["LEGB", "The Local, Enclosing, Global, Built-in search order"],
        ["Namespace", "A mapping from names to objects"],
        ["`global`", "Rebinds a global name from a function"],
        ["`nonlocal`", "Rebinds an enclosing name from a nested function"],
        ["`locals()` / `globals()`", "Inspect local or global namespace dictionaries"],
        ["Scope errors", "NameError cannot find a name; UnboundLocalError reads a local name too early"],
      ],
    },
    {
      kind: "takeaways",
      items: [
        "A namespace maps names to objects, while scope controls where Python can find those names.",
        "Python searches names in LEGB order: Local, Enclosing, Global, then Built-in.",
        "A nearer name shadows an outer name without changing the outer mapping.",
        "Use global and nonlocal only when a function intentionally needs to rebind an outer name.",
        "locals() and globals() help inspect namespaces; scope errors reveal a missing name or an early local read.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "scope-namespaces-1",
          question: "Which order does Python use to look up a name inside a nested function?",
          options: ["Local, Enclosing, Global, Built-in", "Global, Local, Enclosing, Built-in", "Built-in, Global, Enclosing, Local", "Local, Global, Enclosing, Built-in"],
          correctIndex: 0,
          explanation: "LEGB stands for Local, Enclosing, Global, and Built-in.",
        },
        {
          id: "scope-namespaces-2",
          question: "What happens when a function creates a local variable named city while a global variable named city already exists?",
          options: ["The local city shadows the global city inside that function", "The global city is overwritten immediately", "Python raises a NameError", "Both values are merged"],
          correctIndex: 0,
          explanation: "The local name is used within the function. The global name remains unchanged unless code deliberately rebinds it with global.",
        },
        {
          id: "scope-namespaces-3",
          question: "Which keyword lets an inner function rebind a variable created by its nearest outer function?",
          options: ["nonlocal", "global", "local", "outer"],
          correctIndex: 0,
          explanation: "nonlocal targets the nearest enclosing function scope.",
        },
        {
          id: "scope-namespaces-4",
          question: "Why can count += 1 inside a function raise UnboundLocalError when count exists globally?",
          options: ["The assignment makes count local, then Python tries to read that local name before it has a value", "Python cannot add integers", "Global variables cannot be read in functions", "count is always a built-in name"],
          correctIndex: 0,
          explanation: "An assignment makes count local unless global count is declared. The augmented assignment needs to read it before writing it.",
        },
        {
          id: "scope-namespaces-5",
          question: "Create global count = 0. Define increase() to use global count, add 1 to it, and return it. Call increase(), store the value in result, and print result.",
          interactiveCode: true,
          initialCode: "# Write your code below\n",
          testCode: "assert count == 1\nassert increase() == 2\nassert result == 1",
          expectedOutput: "1",
          requiredCodePatterns: [
            "\\bcount\\s*=\\s*0\\b",
            "\\bdef\\s+increase\\s*\\(\\s*\\)\\s*:",
            "\\bglobal\\s+count\\b",
            "\\bcount\\s*\\+=\\s*1\\b",
            "\\breturn\\s+count\\b",
            "\\bresult\\s*=\\s*increase\\s*\\(\\s*\\)",
            "\\bprint\\s*\\(\\s*result\\s*\\)",
          ],
          validationMessage: "Create count, declare it global inside increase, increment and return it, then store and print the first call.",
          explanation: "global makes the assignment update the file-level count. The first call returns and prints 1.",
        },
      ],
    },
  ],
};

export const ADVANCED_FUNCTIONS_LESSON: LessonContent = {
  slug: "advanced-functions",
  title: "Advanced Functions",
  subtitle: "Use functions as values, transform collections, and build reusable behavior with closures and decorators.",
  sections: [
    {
      kind: "prose",
      heading: "Why advanced functions matter",
      body: [
        "In Python, functions are **objects**. You can store one in a variable, pass one into another function, return one from a function, or define one inside another function. These capabilities make programs more flexible without repeating logic.",
        "This lesson builds from simple function calls into lambdas, `map()`, `filter()`, `reduce()`, `zip()`, recursion, nested functions, closures, decorators, and higher-order functions.",
      ],
    },
    {
      kind: "animation",
      variant: "advanced-functions",
      caption: "Follow a function as it becomes a value, transforms data, filters results, and combines them into one result.",
    },
    {
      kind: "prose",
      heading: "Functions as First-Class Objects",
      body: [
        "A function is a first-class object: its name can be assigned to another variable without parentheses. That new variable refers to the same function and can call it later. Parentheses would call the function immediately instead of storing it.",
      ],
    },
    {
      kind: "syntax",
      title: "Store a function reference",
      code: "def function_name():\n    statement\n\nalias = function_name\nalias()",
      description: "Assign the function name without parentheses. Call the stored reference later with parentheses.",
    },
    {
      kind: "interactive-code",
      caption: "message and greet refer to the same function object.",
      code: 'def greet():\n    print("Hello, Python")\n\nmessage = greet\nmessage()',
    },
    {
      kind: "prose",
      heading: "Lambda Functions",
      body: [
        "A **lambda** is a small anonymous function. It can accept arguments but contains exactly one expression. The expression's value is returned automatically, so a lambda is useful for short transformations and sorting keys, not multi-step business logic.",
      ],
    },
    {
      kind: "syntax",
      title: "Create a lambda",
      code: "lambda arguments: expression",
      description: "A lambda evaluates one expression and returns its value automatically. Use def when the logic needs multiple statements or a descriptive name.",
    },
    {
      kind: "interactive-code",
      caption: "square is a lambda that receives a number and returns its square.",
      code: "square = lambda number: number * number\nadd = lambda a, b: a + b\n\nprint(square(5))\nprint(add(10, 20))",
    },
    {
      kind: "prose",
      heading: "map()",
      body: [
        "`map()` applies a function to every item in an iterable. In Python 3, it returns a lazy map iterator, so use `list()` when you want to view all transformed values at once. `map()` is most useful when every input item should produce one output item.",
      ],
    },
    {
      kind: "syntax",
      title: "Transform every item",
      code: "result = map(function, iterable)\nprint(list(result))",
      description: "The function receives one item at a time. list() consumes the map iterator and displays the transformed values.",
    },
    {
      kind: "interactive-code",
      caption: "map applies the lambda to each number, producing one square per input item.",
      code: "numbers = [1, 2, 3, 4]\nsquares = map(lambda number: number * number, numbers)\n\nprint(list(squares))",
    },
    {
      kind: "interactive-code",
      caption: "A built-in method can also be the function passed to map.",
      code: 'names = ["aman", "riya", "kabir"]\nupper_names = map(str.upper, names)\n\nprint(list(upper_names))',
    },
    {
      kind: "prose",
      heading: "filter()",
      body: [
        "`filter()` selects items from an iterable. Its function must return a truthy or falsy value: truthy results keep the item, while falsy results discard it. Like `map()`, `filter()` returns a lazy iterator in Python 3.",
      ],
    },
    {
      kind: "syntax",
      title: "Keep matching items",
      code: "result = filter(condition_function, iterable)\nprint(list(result))",
      description: "condition_function is called for each item. Items whose result is truthy are kept.",
    },
    {
      kind: "interactive-code",
      caption: "Only numbers whose condition is True remain in the filtered result.",
      code: "numbers = [1, 2, 3, 4, 5, 6]\neven_numbers = filter(lambda number: number % 2 == 0, numbers)\n\nprint(list(even_numbers))",
    },
    {
      kind: "table",
      headers: ["Feature", "`map()`", "`filter()`"],
      rows: [
        ["Purpose", "Transforms every item", "Keeps matching items"],
        ["Function result", "A new value", "A truthy or falsy value"],
        ["Output length", "Same as the input", "Can be shorter than the input"],
        ["Python 3 result", "Map iterator", "Filter iterator"],
      ],
    },
    {
      kind: "prose",
      heading: "reduce()",
      body: [
        "`reduce()` combines iterable items step by step into one final value. It lives in the `functools` module, so you must import it. For straightforward addition, `sum()` is usually clearer, but `reduce()` is useful when a custom pairwise combination communicates the task well.",
      ],
    },
    {
      kind: "syntax",
      title: "Combine items into one value",
      code: "from functools import reduce\n\nresult = reduce(function, iterable)",
      description: "The function receives an accumulated value and the next item, then returns the next accumulated value.",
    },
    {
      kind: "interactive-code",
      caption: "reduce combines the running total with one number at a time.",
      code: "from functools import reduce\n\nnumbers = [1, 2, 3, 4]\ntotal = reduce(lambda current, number: current + number, numbers)\n\nprint(total)",
    },
    {
      kind: "table",
      headers: ["Function", "Purpose", "Final result"],
      rows: [
        ["`map()`", "Transform items", "Iterator of transformed items"],
        ["`filter()`", "Select items", "Iterator of selected items"],
        ["`reduce()`", "Combine items", "One accumulated value"],
      ],
    },
    {
      kind: "prose",
      heading: "zip()",
      body: [
        "`zip()` pairs items from two or more iterables by matching their positions. It returns an iterator of tuples. Iteration stops when the shortest iterable runs out of items, so an extra item in a longer iterable is not included.",
      ],
    },
    {
      kind: "syntax",
      title: "Pair matching positions",
      code: "pairs = zip(iterable_one, iterable_two)\n\nfor first, second in pairs:\n    # use the paired values",
      description: "Each tuple contains items with the same index from every iterable passed to zip().",
    },
    {
      kind: "interactive-code",
      caption: "zip pairs each learner with the score at the same position.",
      code: 'names = ["Ava", "Noah", "Mina"]\nscores = [92, 87, 95]\n\nfor name, score in zip(names, scores):\n    print(f"{name}: {score}")',
    },
    {
      kind: "callout",
      tone: "note",
      title: "zip() uses the shortest iterable",
      body: "If one iterable has fewer items, zip() stops there. Use `itertools.zip_longest()` when you need to retain unmatched items too.",
    },
    {
      kind: "prose",
      heading: "Recursion",
      body: [
        "**Recursion** is when a function calls itself to solve a smaller version of the same problem. Every recursive function needs a **base case** that stops the calls. Without one, Python keeps adding calls until it raises `RecursionError`.",
      ],
    },
    {
      kind: "syntax",
      title: "Write a recursive function",
      code: "def function_name(value):\n    if base_case:\n        return base_value\n\n    return function_name(smaller_value)",
      description: "The base case returns without another call. The recursive case moves the input toward that base case.",
    },
    {
      kind: "interactive-code",
      caption: "factorial stops at 1; every earlier call waits for the next smaller factorial.",
      code: "def factorial(number):\n    if number == 1:\n        return 1\n\n    return number * factorial(number - 1)\n\nprint(factorial(5))",
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Always provide a base case",
      body: "A recursive call must progress toward a stopping condition. For many Python tasks, an ordinary loop is clearer and avoids Python's recursion-depth limit.",
    },
    {
      kind: "prose",
      heading: "Nested Functions",
      body: [
        "A **nested function** is defined inside another function. The inner function is created when the outer function runs, and its name is normally available only inside that outer function. Nested functions can organize helper logic and access enclosing names.",
      ],
    },
    {
      kind: "syntax",
      title: "Define and call a nested function",
      code: "def outer_function():\n    def inner_function():\n        statement\n\n    inner_function()\n\nouter_function()",
      description: "inner_function can be called inside outer_function after it has been defined.",
    },
    {
      kind: "interactive-code",
      caption: "inner runs inside outer and is not a direct name at file level.",
      code: 'def outer():\n    print("Outer function started")\n\n    def inner():\n        print("Inner function executed")\n\n    inner()\n\nouter()',
    },
    {
      kind: "prose",
      heading: "Closures",
      body: [
        "A **closure** is created when an inner function uses a value from its enclosing function and the outer function returns that inner function. The returned function keeps access to the remembered enclosing value even after the outer call has finished.",
      ],
    },
    {
      kind: "syntax",
      title: "Return a function that remembers a value",
      code: "def outer(value):\n    def inner(argument):\n        return argument * value\n\n    return inner\n\nstored_function = outer(value)\nprint(stored_function(argument))",
      description: "outer returns the inner function itself, not inner(). The returned function closes over value.",
    },
    {
      kind: "interactive-code",
      caption: "double remembers multiplier = 2 after multiplier has returned.",
      code: "def multiplier(number):\n    def multiply(value):\n        return value * number\n\n    return multiply\n\ndouble = multiplier(2)\nprint(double(5))",
    },
    {
      kind: "prose",
      heading: "Higher-Order Functions",
      body: [
        "A **higher-order function** accepts another function as an argument, returns a function, or both. `map()`, `filter()`, `reduce()`, closures, and decorators all rely on this idea. Passing a function name without parentheses passes the function itself; parentheses call it.",
      ],
    },
    {
      kind: "syntax",
      title: "Accept a function as an argument",
      code: "def process(function, value):\n    return function(value)\n\nresult = process(function_name, value)",
      description: "function_name is passed without parentheses, then called by process with the supplied value.",
    },
    {
      kind: "interactive-code",
      caption: "process_text is higher-order because it receives shout as a value and calls it.",
      code: 'def shout(text):\n    return text.upper()\n\ndef process_text(function, text):\n    return function(text)\n\nresult = process_text(shout, "hello")\nprint(result)',
    },
    {
      kind: "prose",
      heading: "Decorators",
      body: [
        "A **decorator** is a higher-order function that receives a function, creates a wrapper around it, and returns the wrapper. The `@decorator_name` syntax applies that wrapper to a function definition. Decorators are often used to add behavior such as logging, timing, access checks, or retries without editing a function's core logic.",
      ],
    },
    {
      kind: "syntax",
      title: "Wrap a function with a decorator",
      code: "def decorator(function):\n    def wrapper():\n        statement\n        return function()\n\n    return wrapper\n\n@decorator\ndef function_name():\n    statement",
      description: "The decorator receives function_name and replaces it with wrapper. wrapper can run code before or after the original function.",
    },
    {
      kind: "interactive-code",
      caption: "announce runs before greet because @announce wraps greet with its wrapper.",
      code: 'def announce(function):\n    def wrapper():\n        print("Starting")\n        return function()\n\n    return wrapper\n\n@announce\ndef greet():\n    print("Hello")\n\ngreet()',
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Choose clarity over compactness",
      body: "Use a lambda only for a small, readable expression. Prefer a named def function for multi-step work. Convert map() and filter() to a list only when you need the values now, and avoid reduce() when a direct built-in such as sum() communicates the calculation more clearly.",
    },
    {
      kind: "takeaways",
      items: [
        "Functions are first-class objects, so they can be stored, passed, returned, and nested.",
        "Lambdas are single-expression functions for small, readable transformations.",
        "map transforms every item, filter keeps matching items, reduce combines items into one value, and zip pairs matching positions.",
        "Recursion needs a base case; nested functions and closures use enclosing scope deliberately.",
        "Higher-order functions and decorators add reusable behavior by working with functions as values.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "advanced-functions-1",
          question: "What does assigning alias = greet do when greet is a function?",
          options: ["Stores a reference to greet without calling it", "Calls greet and stores its return value", "Creates a copy of greet's code", "Makes greet global"],
          correctIndex: 0,
          explanation: "Without parentheses, Python stores the function object. alias() can call the same function later.",
        },
        {
          id: "advanced-functions-2",
          question: "Which statement about a lambda function is correct?",
          options: ["It contains one expression and returns that expression's value", "It can contain any number of statements", "It always needs a name", "It cannot take arguments"],
          correctIndex: 0,
          explanation: "A lambda can receive arguments, but its body is one expression whose value is returned automatically.",
        },
        {
          id: "advanced-functions-3",
          question: "What is the key difference between map() and filter()?",
          options: ["map transforms every item; filter keeps items whose condition is truthy", "map returns one value; filter always returns a list", "map only works with strings; filter only works with numbers", "filter transforms every item; map removes items"],
          correctIndex: 0,
          explanation: "map produces one transformed output per input; filter selects only the items whose function result is truthy.",
        },
        {
          id: "advanced-functions-4",
          question: "Why does a recursive function need a base case?",
          options: ["To stop recursive calls", "To make the function global", "To create a lambda", "To convert a result to a list"],
          correctIndex: 0,
          explanation: "The base case returns a result without another recursive call, ending the chain.",
        },
        {
          id: "advanced-functions-5",
          question: "Create a lambda named double that returns twice its input. Use map(double, numbers) with numbers = [2, 4, 6], store the list result in doubled, and print doubled.",
          interactiveCode: true,
          initialCode: "numbers = [2, 4, 6]\n\n# Write your code below\n",
          testCode: "assert double(3) == 6\nassert doubled == [4, 8, 12]",
          expectedOutput: "[4, 8, 12]",
          requiredCodePatterns: [
            "\\bdouble\\s*=\\s*lambda\\s+\\w+\\s*:\\s*\\w+\\s*\\*\\s*2\\b",
            "\\bdoubled\\s*=\\s*list\\s*\\(\\s*map\\s*\\(\\s*double\\s*,\\s*numbers\\s*\\)\\s*\\)",
            "\\bprint\\s*\\(\\s*doubled\\s*\\)",
          ],
          validationMessage: "Create double as a lambda, pass it to map with numbers, convert the result to a list named doubled, and print it.",
          explanation: "double transforms one number, map applies it to every item, and list makes the lazy map result visible.",
        },
      ],
    },
  ],
};

export const MODULES_AND_PACKAGES_LESSON: LessonContent = {
  slug: "modules-packages",
  title: "Modules & Packages",
  subtitle: "Import standard tools, create your own modules, and build package structures.",
  sections: [
    {
      kind: "prose",
      heading: "Why modules and packages matter",
      body: [
        "A **module** is a Python file containing reusable code. A **package** organizes related modules under one importable name. Together, they let a program grow into focused files instead of one difficult-to-maintain script.",
        "You will learn how Python imports standard-library tools, how to design your own module and package layout, and how import paths affect the names available in your program.",
      ],
    },
    {
      kind: "animation",
      variant: "modules-packages",
      caption: "Follow an import from a module file, through a package, to the name your program can use.",
    },
    {
      kind: "table",
      headers: ["Term", "Meaning", "Example"],
      rows: [
        ["Module", "One Python file containing code", "calculator.py"],
        ["Package", "A namespace that groups related modules", "shop/ containing prices.py"],
        ["Standard library", "Modules shipped with Python", "math, json, pathlib"],
      ],
    },
    {
      kind: "prose",
      heading: "Import a Module",
      body: [
        "An import statement makes a module name available in the current file. With a normal import, Python keeps the module as a namespace, so you access its members with dot notation. This makes the origin of a name clear.",
      ],
    },
    {
      kind: "syntax",
      title: "Import a module namespace",
      code: "import module_name\n\nmodule_name.member_name",
      description: "The module name is added to the current namespace. Use a dot to reach a function, class, or value inside it.",
    },
    {
      kind: "interactive-code",
      caption: "math is a standard-library module. sqrt is one of its members.",
      code: "import math\n\nprint(math.sqrt(25))\nprint(math.pi)",
    },
    {
      kind: "prose",
      heading: "Import Styles",
      body: [
        "Python offers several import forms. Choose the one that makes a name's origin clear without adding unnecessary repetition. Aliases are useful for conventional or genuinely long names. Importing everything with `*` makes it hard to see where names come from and can cause collisions.",
      ],
    },
    {
      kind: "table",
      headers: ["Style", "Pattern", "Use the imported name as"],
      rows: [
        ["Normal import", "**import** `math`", "`math.sqrt(25)`"],
        ["Alias", "**import** `math` **as** `m`", "`m.sqrt(25)`"],
        ["Specific member", "**from** `math` **import** `sqrt`", "`sqrt(25)`"],
        ["Several members", "**from** `math` **import** `ceil`, `floor`", "`ceil(2.1)`"],
        ["Import all", "**from** `math` **import** `*`", "Avoid in application code"],
      ],
    },
    {
      kind: "interactive-code",
      caption: "An alias changes the local name for a module; a specific import brings only that member into scope.",
      code: "import math as m\nfrom math import ceil\n\nprint(m.floor(4.8))\nprint(ceil(4.2))",
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Avoid wildcard imports",
      body: "from module import * can overwrite a name you already use and hides where imported names came from. Prefer an explicit module name or an explicit list of members.",
    },
    {
      kind: "prose",
      heading: "Standard Library Modules",
      body: [
        "The **standard library** ships with Python, so you can import its modules without installing another package. It includes tools for **mathematics**, **JSON**, **dates**, **paths**, **collections**, **iterators**, **operating-system tasks**, and much more.",
      ],
    },
    {
      kind: "table",
      headers: ["Module", "Useful for", "Example member"],
      rows: [
        ["math", "Mathematics", "`math.sqrt(25)`"],
        ["json", "JSON text and Python data", "`json.dumps(data)`"],
        ["pathlib", "File-system paths", "`Path('notes.txt')`"],
        ["collections", "Specialized containers", "`Counter(items)`"],
        ["itertools", "Iterator building blocks", "`itertools.count()`"],
        ["statistics", "Summary statistics", "`statistics.mean(data)`"],
      ],
    },
    {
      kind: "interactive-code",
      caption: "json.dumps converts Python data into JSON text.",
      code: 'import json\n\nprofile = {"name": "Ava", "level": 3}\nprint(json.dumps(profile, sort_keys=True))',
    },
    {
      kind: "prose",
      heading: "Create Your Own Module",
      body: [
        "Any `.py` file can be a module. Keep the importing file and its simple sibling module in the same project directory, then import the sibling by its filename without the `.py` extension.",
      ],
    },
    {
      kind: "diagram",
      ascii: "project/\n├── calculator.py\n└── main.py",
      caption: "A small project can keep reusable calculations in calculator.py and the program entry point in main.py.",
    },
    {
      kind: "syntax",
      title: "Import from a sibling module",
      code: "# calculator.py\ndef add(left, right):\n    return left + right\n\n# main.py\nimport calculator\nprint(calculator.add(10, 20))",
      description: "The calculator name refers to the module. The function remains namespaced as calculator.add().",
    },
    {
      kind: "syntax",
      title: "Import one named member",
      code: "# main.py\nfrom calculator import add\n\nprint(add(10, 20))",
      description: "This form imports add directly into main.py. It is concise, but a module prefix can be clearer when names may collide.",
    },
    {
      kind: "prose",
      heading: "Module Search Path and dir()",
      body: [
        "When Python resolves an import, it searches locations listed in `sys.path`, including the script or current working location, configured paths, the standard library, and installed packages. `dir(module)` is a quick way to inspect names that a module exposes.",
      ],
    },
    {
      kind: "syntax",
      title: "Inspect an import",
      code: "import math\nimport sys\n\nprint(sys.path)\nprint(dir(math))",
      description: "sys.path is environment-specific, so its exact paths vary. dir() lists names, including special attributes that begin and end with underscores.",
    },
    {
      kind: "interactive-code",
      caption: "Check whether sqrt is available from the imported math module.",
      code: 'import math\n\nprint("sqrt" in dir(math))\nprint(math.__name__)',
    },
    {
      kind: "prose",
      heading: "Run Directly or Import Safely",
      body: [
        "Every module has a `__name__` value. It is `__main__` when Python runs that file directly; when another file imports it, it is normally the module's qualified name. The main guard keeps demonstration or command-line code from running during import.",
      ],
    },
    {
      kind: "syntax",
      title: "Use the main guard",
      code: 'def main():\n    print("Run the program")\n\nif __name__ == "__main__":\n    main()',
      description: "Code inside this conditional runs only when this file is the program entry point, not when another module imports it.",
    },
    {
      kind: "interactive-code",
      caption: "This editor runs code as the main program, so the guard is true here.",
      code: 'if __name__ == "__main__":\n    print("Running directly")\nelse:\n    print("Imported as a module")',
    },
    {
      kind: "prose",
      heading: "Package Structure",
      body: [
        "A **package** gives related modules a shared import namespace. A regular package commonly contains `__init__.py`, which can run package initialization code and define what the package exports. Since Python 3.3, a namespace package can exist without that file, but `__init__.py` remains common in application packages.",
      ],
    },
    {
      kind: "diagram",
      ascii: "project/\n├── main.py\n└── shop/\n    ├── __init__.py\n    ├── prices.py\n    └── receipts.py",
      caption: "shop is a regular package; prices.py and receipts.py are modules inside it.",
    },
    {
      kind: "syntax",
      title: "Import a module from a package",
      code: "# main.py\nfrom shop.prices import total\n\nprint(total([12, 8]))",
      description: "The dotted path starts with the package name, then names the module and the member to import.",
    },
    {
      kind: "syntax",
      title: "Expose a package member",
      code: "# shop/__init__.py\nfrom .prices import total\n\n# main.py\nfrom shop import total",
      description: "The leading dot is a relative import inside the package. Re-exporting a small public API can make imports simpler for package users.",
    },
    {
      kind: "prose",
      heading: "Absolute and Relative Imports",
      body: [
        "**Absolute imports** start at the package root, such as from `shop.prices import total`. **Relative imports** use **dots** from a module's position inside a package: **one dot** means the **current package**, **two dots** mean the **parent package**. Relative imports belong in package modules, not standalone scripts run directly.",
      ],
    },
    {
      kind: "table",
      headers: ["Import form", "Meaning", "Typical location"],
      rows: [
        ["**from** `shop.prices` **import** `total`", "Absolute path from package root", "Any module that can import shop"],
        ["**from** `.prices` **import** `total`", "Sibling module in current package", "Inside shop/receipts.py"],
        ["**from** `..shared` **import** `tax_rate`", "Module in parent package", "Inside a nested subpackage"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Common mistakes",
      body: "- **Writing import calculator.py**: Import the module name without `.py`.\n- **Calling a normal import without its prefix**: import math needs `math.sqrt(25)`.\n- **Running a relative-import file directly**: Run the package with `python -m package.module` instead.\n- **Expecting __init__.py to be required everywhere**: It defines a regular package, but namespace packages can omit it in modern Python.\n- **Using wildcard imports**: They obscure origins and invite name collisions.",
    },
    {
      kind: "takeaways",
      items: [
        "A module is one Python file; a package groups related modules under one namespace.",
        "Normal imports keep a useful module prefix, while aliases and named imports change which local names you use.",
        "The standard library ships with Python and is imported like your own modules.",
        "sys.path guides import resolution, dir() inspects names, and the main guard separates direct execution from importing.",
        "Use absolute imports for clear package paths and relative imports only from within a package.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "modules-packages-1",
          question: "After import math, which expression calls the square-root function?",
          options: ["math.sqrt(25)", "sqrt.math(25)", "sqrt(25)", "import.sqrt(25)"],
          correctIndex: 0,
          explanation: "A normal import adds the module name, so members are accessed with math.member.",
        },
        {
          id: "modules-packages-2",
          question: "Why is from module import * usually discouraged?",
          options: ["It can hide name origins and create collisions", "It cannot import functions", "It always runs more slowly", "It works only for standard modules"],
          correctIndex: 0,
          explanation: "Wildcard imports add many names to the current namespace, making collisions and unclear origins more likely.",
        },
        {
          id: "modules-packages-3",
          question: "What is true when a file is run directly by Python?",
          options: ['Its __name__ is "__main__"', "Its __name__ is always its filename", "Its imports are skipped", "Its functions cannot be called"],
          correctIndex: 0,
          explanation: "Python assigns __main__ to the file used as the program entry point.",
        },
        {
          id: "modules-packages-4",
          question: "Inside shop/receipts.py, which import refers to the sibling module shop/prices.py?",
          options: ["from .prices import total", "from prices.shop import total", "import .prices", "from ..prices import total"],
          correctIndex: 0,
          explanation: "One leading dot refers to the current package, so .prices refers to the sibling prices module.",
        },
        {
          id: "modules-packages-5",
          question: "Import sqrt from math and print the square root of 81.",
          interactiveCode: true,
          initialCode: "# Write your code below\n",
          testCode: "assert sqrt(81) == 9",
          expectedOutput: "9.0",
          requiredCodePatterns: [
            "from\\s+math\\s+import\\s+sqrt",
            "print\\s*\\(\\s*sqrt\\s*\\(\\s*81\\s*\\)\\s*\\)",
          ],
          validationMessage: "Import sqrt specifically from math, then print sqrt(81).",
          explanation: "A named import brings sqrt into the current namespace, so it can be called without the math prefix.",
        },
      ],
    },
  ],
};

export const PACKAGE_MANAGEMENT_LESSON: LessonContent = {
  slug: "package-management",
  title: "Package Management",
  subtitle: "Install third-party packages safely, isolate each project, and reproduce its dependencies.",
  sections: [
    {
      kind: "prose",
      heading: "Why package management matters",
      body: [
        "Python's **standard library** arrives with Python. A **third-party package** is created separately and is usually downloaded from **PyPI**, the Python Package Index. Package management is the practice of choosing, installing, updating, and recording those dependencies.",
        "A project should be able to tell another developer exactly which packages it needs. It should also avoid changing packages used by a different project or by the system Python.",
      ],
    },
    {
      kind: "table",
      caption: "Two kinds of reusable Python code",
      headers: ["Kind", "Where it comes from", "Examples"],
      rows: [
        ["Standard library", "Installed with Python", "`json`, `pathlib`, `venv`"],
        ["Third-party package", "Installed separately, commonly from PyPI", "`requests`, `numpy`, `pandas`"],
      ],
    },
    {
      kind: "animation",
      variant: "package-management",
      caption: "Follow one dependency from project setup to a reproducible run.",
    },
    {
      kind: "prose",
      heading: "pip and the interpreter",
      body: [
        "**pip** installs and inspects packages. Prefer `python -m pip` instead of plain `pip`: it makes the Python interpreter and the package installer a matched pair. On Windows, `py -m pip` is often the matching form.",
      ],
    },
    {
      kind: "syntax",
      title: "Common pip commands",
      code: "python -m pip --version\npython -m pip install requests\npython -m pip install \"requests==2.32.3\"\npython -m pip install --upgrade requests\npython -m pip uninstall requests\npython -m pip list\npython -m pip show requests",
      description: "Check which pip belongs to your Python first. Then install, pin, upgrade, remove, list, or inspect a package as needed.",
    },
    {
      kind: "prose",
      heading: "Example: install into one project",
      body: [
        "Imagine a project named `weather-app`. First create and activate its environment. Only then install `requests`. The `(.venv)` prompt below is a cue that this terminal is using the project's isolated interpreter.",
      ],
    },
    {
      kind: "syntax",
      title: "A complete pip setup",
      code: "$ mkdir weather-app\n$ cd weather-app\n$ python -m venv .venv\n$ source .venv/bin/activate\n\n(.venv) $ python -m pip install requests\nSuccessfully installed requests-...\n\n(.venv) $ python -m pip show requests\nName: requests\nVersion: ...",
      description: "The activation command shown is for macOS or Linux. Use the PowerShell or Command Prompt activation command shown below on Windows. Exact installed versions and output vary.",
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Install into the right Python",
      body: "A successful install can still be useless if it went into a different interpreter. Check `python --version` and `python -m pip --version` in the same terminal, especially when you have multiple Python installations.",
    },
    {
      kind: "prose",
      heading: "Virtual environments",
      body: [
        "A **virtual environment** is an isolated Python installation for one project. It keeps that project's packages separate from your system Python and from other projects that may need different versions.",
      ],
    },
    {
      kind: "syntax",
      title: "Create and activate a project environment",
      code: "# Create it once\npython -m venv .venv\n\n# macOS or Linux\nsource .venv/bin/activate\n\n# Windows PowerShell\n.venv\\Scripts\\Activate.ps1\n\n# Windows Command Prompt\n.venv\\Scripts\\activate.bat\n\n# Leave the environment\ndeactivate",
      description: "`.venv` is a common project-local folder name. Activation puts that environment's Python first in the current terminal session.",
    },
    {
      kind: "interactive-code",
      caption: "Run this to see which Python is running. In an active virtual environment, the executable normally points inside `.venv`.",
      code: "import sys\n\nprint(sys.executable)\nprint(sys.prefix != sys.base_prefix)",
    },
    {
      kind: "prose",
      heading: "Record dependencies with requirements.txt",
      body: [
        "A `requirements.txt` file is a portable list of packages. A version range records what your project accepts; exact versions make an environment more repeatable. `pip freeze` writes the packages currently installed in one environment, including its transitive dependencies, so review its output before treating it as your project's intended dependency list.",
      ],
    },
    {
      kind: "syntax",
      title: "Save and install requirements",
      code: "# requirements.txt\nrequests==2.32.3\n\n# Save packages from the active environment\npython -m pip freeze > requirements.txt\n\n# Re-create them later\npython -m pip install -r requirements.txt",
      description: "Use `-r` to read package requirements from a file. Commit the dependency file, not the `.venv` folder.",
    },
    {
      kind: "prose",
      heading: "Example: hand the project to a teammate",
      body: [
        "The original developer records the active environment once. A teammate clones the project, creates a fresh `.venv`, and installs from the committed file. Neither person copies a virtual-environment folder between computers.",
      ],
    },
    {
      kind: "syntax",
      title: "Re-create a pip environment",
      code: "# Developer, after testing the environment\n(.venv) $ python -m pip freeze > requirements.txt\n\n# Teammate, in a new clone\n$ python -m venv .venv\n$ source .venv/bin/activate\n(.venv) $ python -m pip install -r requirements.txt\nSuccessfully installed ...",
      description: "`freeze` describes the currently installed environment. For larger projects, teams often maintain a reviewed source list and generate a locked file from it.",
    },
    {
      kind: "diagram",
      caption: "A small repeatable project layout",
      ascii: "weather-app/\n├── .venv/              # local environment, do not commit\n├── main.py\n├── requirements.txt     # package list to share\n└── .gitignore           # includes .venv/",
    },
    {
      kind: "prose",
      heading: "Modern project workflow with uv",
      body: [
        "**uv** is a modern Python project and package manager. In its project workflow, `pyproject.toml` declares the dependencies your project wants and `uv.lock` records the resolved dependency set. `uv` manages a local `.venv` when a project command needs one.",
      ],
    },
    {
      kind: "syntax",
      title: "Start a uv-managed project",
      code: "uv init weather-app\ncd weather-app\nuv add requests\nuv sync\nuv run main.py\nuv remove requests",
      description: "`uv add` records a direct dependency in `pyproject.toml`. `uv sync` builds the environment from the lockfile. `uv run` also checks that the project state is current before it runs a command. Use `uv remove` to stop declaring a dependency.",
    },
    {
      kind: "prose",
      heading: "Example: one uv project from start to run",
      body: [
        "With uv, the workflow is declaration first. `uv add requests` changes the project files, then `uv sync` creates or updates `.venv` from the resolved lockfile. Your script runs through `uv run`, so it sees the project's dependencies without a separate activation step.",
      ],
    },
    {
      kind: "syntax",
      title: "The uv project lifecycle",
      code: "$ uv init weather-app\n$ cd weather-app\n$ uv add requests\n\n# uv creates or updates these project artifacts\nweather-app/\n├── pyproject.toml    # direct dependencies\n├── uv.lock           # exact resolved graph\n├── .venv/            # local environment\n└── main.py\n\n$ uv run main.py\nForecast ready",
      description: "Commit `pyproject.toml` and `uv.lock`. Keep `.venv` local and ignored. `uv run` ensures the project environment is ready before executing the script.",
    },
    {
      kind: "table",
      caption: "Dependency files have different jobs",
      headers: ["File", "Purpose", "Typical owner"],
      rows: [
        ["`requirements.txt`", "Installable package list, often pinned", "pip-based project or deployment"],
        ["`pyproject.toml`", "Project metadata and declared direct dependencies", "Modern Python project"],
        ["`uv.lock`", "Resolved dependency graph for a uv project", "Generated and committed with the project"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Choose one source of truth",
      body: "Do not casually edit both a lockfile and an exported requirements file as if they are independent. Keep one workflow authoritative, then generate or export another format only when a deployment or tool requires it.",
    },
    {
      kind: "prose",
      heading: "More uv project tools",
      body: [
        "uv can also manage Python versions for a project. `uv python list` shows versions it can use, `uv python install 3.12` installs a managed version, and `uv python pin 3.12` records the project's requested version in `.python-version`. Use this only when the project needs a deliberate Python version, not as a replacement for declaring package dependencies.",
        "For a one-off command-line tool, `uvx ruff check .` runs Ruff in an isolated temporary environment instead of adding it to your project. When a tool belongs in the development workflow, add it as a development dependency, for example `uv add --dev pytest ruff`; production deployments can then omit development groups with `uv sync --no-dev`.",
      ],
    },
    {
      kind: "syntax",
      title: "Manage versions and development tools with uv",
      code: "uv python list\nuv python install 3.12\nuv python pin 3.12\n\nuvx ruff check .\nuv add --dev pytest ruff\nuv sync --no-dev",
      description: "Pin a Python version only when the project needs it. Keep temporary tools out of the project, and keep test or lint tools separate from production dependencies.",
    },
    {
      kind: "prose",
      heading: "Useful third-party packages",
      body: ["Packages solve focused problems. Install only what your project needs, read its documentation, and keep versions compatible with your Python version."],
    },
    {
      kind: "table",
      headers: ["Package", "Common use"],
      rows: [
        ["`requests`", "HTTP requests"],
        ["`numpy`", "Numerical arrays and computing"],
        ["`pandas`", "Tabular data analysis"],
        ["`pytest`", "Testing"],
        ["`flask` or `django`", "Web applications"],
      ],
    },
    {
      kind: "table",
      caption: "Tooling choices at a glance",
      headers: ["Tool", "Use it when", "What it manages"],
      rows: [
        ["`pip` + `venv`", "You want Python's familiar built-in workflow", "Packages and an isolated environment"],
        ["uv", "You want a project workflow with locking and syncing", "Dependencies, lockfile, environment, and Python versions"],
        ["Poetry", "Your team already uses its project workflow", "Project metadata, dependencies, and locking"],
        ["Conda", "You need Python plus non-Python scientific dependencies", "Environments and packages across languages"],
        ["pipx", "You want a Python CLI installed in its own environment", "Isolated command-line applications"],
      ],
    },
    {
      kind: "takeaways",
      items: [
        "Third-party packages are installed separately; the standard library ships with Python.",
        "Use `python -m pip` so pip targets the Python interpreter you intend to use.",
        "Create one `.venv` per project and do not commit that environment folder.",
        "Record dependencies so another machine can reproduce the project environment.",
        "For uv projects, declare dependencies in `pyproject.toml` and commit the generated `uv.lock` file.",
        "Use `uv sync` to re-create a uv environment and `uv run` to execute inside it.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "package-management-1",
          question: "Why is `python -m pip install requests` usually safer than `pip install requests`?",
          options: ["It targets pip through the Python interpreter you named", "It installs only built-in modules", "It never needs a virtual environment", "It avoids downloading dependencies"],
          correctIndex: 0,
          explanation: "Using `python -m pip` ties the installer to that specific Python interpreter.",
        },
        {
          id: "package-management-2",
          question: "What is the main purpose of a project-local `.venv` folder?",
          options: ["Keep that project's packages isolated", "Store Python source code", "Replace requirements.txt", "Publish packages to PyPI"],
          correctIndex: 0,
          explanation: "A virtual environment isolates packages for one project from other projects and the system Python.",
        },
        {
          id: "package-management-3",
          question: "Which command installs the dependencies listed in requirements.txt?",
          options: ["python -m pip install -r requirements.txt", "python -m pip freeze requirements.txt", "python requirements.txt", "pip package requirements.txt"],
          correctIndex: 0,
          explanation: "The `-r` option tells pip to read requirements from a file.",
        },
        {
          id: "package-management-4",
          question: "In a uv project, which file records the resolved dependency graph?",
          options: ["uv.lock", "main.py", ".venv", "__init__.py"],
          correctIndex: 0,
          explanation: "`uv.lock` is the resolved lockfile, while `pyproject.toml` declares project dependencies.",
        },
        {
          id: "package-management-5",
          question: "Write `uses_virtual_environment()` so it returns True when the two paths are different, then print the example result.",
          interactiveCode: true,
          initialCode: "def uses_virtual_environment(prefix, base_prefix):\n    # Write your code here\n    pass\n\nprint(uses_virtual_environment(\".venv\", \"/usr/bin/python\"))\n",
          testCode: "assert uses_virtual_environment('.venv', '/usr/bin/python') is True\nassert uses_virtual_environment('/usr', '/usr') is False",
          expectedOutput: "True",
          requiredCodePatterns: ["def\\s+uses_virtual_environment", "return\\s+prefix\\s*!=\\s*base_prefix"],
          validationMessage: "Return whether `prefix` and `base_prefix` are different.",
          explanation: "Python reports a virtual environment when its environment prefix differs from the base interpreter prefix.",
        },
      ],
    },
  ],
};

export const FUNCTIONS_FINAL_QUIZ_LESSON: LessonContent = {
  slug: "functions-final-quiz",
  title: "Functions & Modules Final Quiz",
  subtitle: "Check your understanding of functions, scope, advanced patterns, modules, and package management with fifteen questions.",
  sections: [
    {
      kind: "quiz",
      isFinalQuiz: true,
      questions: [
        {
          id: "functions-final-1",
          question: "What happens when Python reaches a function definition?",
          options: ["It creates the function but does not run its body yet", "It immediately runs the body once", "It returns None and removes the function", "It calls every function in the file"],
          correctIndex: 0,
          explanation: "`def` creates a function object. Its indented body runs only when the function is called.",
        },
        {
          id: "functions-final-2",
          question: "Which statement about `return` is correct?",
          options: ["It sends a value back to the caller and ends that function call", "It only prints a value", "It can be used only in recursive functions", "It continues to the next statement in the function"],
          correctIndex: 0,
          explanation: "A return value becomes the value of the call expression, and `return` ends the current call.",
        },
        {
          id: "functions-final-3",
          question: "Define `welcome(name)` so it returns `Hello, Ava!` for the argument `\"Ava\"`, then print the returned value.",
          interactiveCode: true,
          initialCode: "# Write your code below\n",
          testCode: "assert welcome('Ava') == 'Hello, Ava!'",
          expectedOutput: "Hello, Ava!",
          requiredCodePatterns: ["def\\s+welcome\\s*\\(\\s*name\\s*\\)\\s*:", "return\\s+f?(['\\\"])Hello,\\s*\\{?name\\}?\\!\\1", "print\\s*\\(\\s*welcome\\s*\\(\\s*(['\\\"])Ava\\1\\s*\\)\\s*\\)"],
          validationMessage: "Define welcome(name), return the greeting using name, then print welcome('Ava').",
          explanation: "The argument `\"Ava\"` is bound to the parameter `name`, and the return value is printed by the caller.",
        },
        {
          id: "functions-final-4",
          question: "In `greet(\"Ava\")` for `def greet(name):`, which term describes `\"Ava\"`?",
          options: ["Argument", "Parameter", "Namespace", "Default value"],
          correctIndex: 0,
          explanation: "`name` is the parameter in the definition. `\"Ava\"` is the argument supplied by the call.",
        },
        {
          id: "functions-final-5",
          question: "Which call correctly mixes one positional argument with keyword arguments for `student(name, age, course)`?",
          options: ["student(\"Ava\", age=21, course=\"Python\")", "student(name=\"Ava\", 21, \"Python\")", "student(age=21, \"Ava\", course=\"Python\")", "student(\"Ava\", age: 21, course: \"Python\")"],
          correctIndex: 0,
          explanation: "Positional arguments must come before keyword arguments. Keyword arguments use `=`.",
        },
        {
          id: "functions-final-6",
          question: "What does `*values` collect inside a function definition?",
          options: ["Extra positional arguments in a tuple", "Extra keyword arguments in a dictionary", "Only a single list argument", "All global variables"],
          correctIndex: 0,
          explanation: "A starred parameter collects remaining positional arguments into a tuple.",
        },
        {
          id: "functions-final-7",
          question: "Define `total(*numbers)` to return the sum of every supplied number, then print `total(4, 5, 6)`.",
          interactiveCode: true,
          initialCode: "# Write your code below\n",
          testCode: "assert total(4, 5, 6) == 15\nassert total() == 0",
          expectedOutput: "15",
          requiredCodePatterns: ["def\\s+total\\s*\\(\\s*\\*numbers\\s*\\)\\s*:", "return\\s+sum\\s*\\(\\s*numbers\\s*\\)", "print\\s*\\(\\s*total\\s*\\(\\s*4\\s*,\\s*5\\s*,\\s*6\\s*\\)\\s*\\)"],
          validationMessage: "Use a `*numbers` parameter, return `sum(numbers)`, then print total(4, 5, 6).",
          explanation: "`numbers` is a tuple containing the supplied positional values, and `sum()` combines them.",
        },
        {
          id: "functions-final-8",
          question: "What does `**details` collect inside a function definition?",
          options: ["Extra keyword arguments in a dictionary", "Extra positional arguments in a tuple", "Only default values", "Names from the built-in scope"],
          correctIndex: 0,
          explanation: "A double-starred parameter collects remaining keyword arguments in a dictionary.",
        },
        {
          id: "functions-final-9",
          question: "Python looks for an unqualified name using which order?",
          options: ["Local, Enclosing, Global, Built-in", "Global, Local, Built-in, Enclosing", "Built-in, Global, Enclosing, Local", "Parameter, Argument, Return, Built-in"],
          correctIndex: 0,
          explanation: "The LEGB rule searches Local, Enclosing, Global, then Built-in scopes.",
        },
        {
          id: "functions-final-10",
          question: "Why can assigning to `count` inside a function cause `UnboundLocalError` when the function reads `count` first?",
          options: ["An assignment makes count local throughout that function unless declared global or nonlocal", "Python cannot add integers", "The global scope is searched before the local scope", "count must always be a parameter"],
          correctIndex: 0,
          explanation: "Python treats a name assigned anywhere in a function as local, so a prior read has no local value yet.",
        },
        {
          id: "functions-final-11",
          question: "Create `make_multiplier(factor)` that returns an inner function multiplying a value by `factor`. Make `triple` and print `triple(4)`.",
          interactiveCode: true,
          initialCode: "# Write your code below\n",
          testCode: "assert triple(4) == 12\nassert make_multiplier(2)(5) == 10",
          expectedOutput: "12",
          requiredCodePatterns: ["def\\s+make_multiplier\\s*\\(\\s*factor\\s*\\)\\s*:", "def\\s+multiply\\s*\\(\\s*value\\s*\\)\\s*:", "return\\s+value\\s*\\*\\s*factor", "return\\s+multiply", "triple\\s*=\\s*make_multiplier\\s*\\(\\s*3\\s*\\)", "print\\s*\\(\\s*triple\\s*\\(\\s*4\\s*\\)\\s*\\)"],
          validationMessage: "Return an inner multiply(value) function that uses factor, then create and print triple(4).",
          explanation: "The returned inner function closes over `factor`, so it still remembers the value after the outer function returns.",
        },
        {
          id: "functions-final-12",
          question: "Which statement is true about a lambda function?",
          options: ["It contains one expression and returns that expression's result", "It can contain any number of statements", "It must be named lambda", "It cannot accept arguments"],
          correctIndex: 0,
          explanation: "A lambda is a compact anonymous function with a single expression whose value is returned.",
        },
        {
          id: "functions-final-13",
          question: "Which built-in transforms every item in an iterable by applying a function?",
          options: ["map()", "filter()", "reduce()", "zip()"],
          correctIndex: 0,
          explanation: "`map()` applies a function to each item. `filter()` keeps items whose condition is true.",
        },
        {
          id: "functions-final-14",
          question: "What is the purpose of `if __name__ == \"__main__\":` in a module?",
          options: ["Run selected code only when the file is executed directly", "Create a package automatically", "Import every module in the folder", "Install third-party packages"],
          correctIndex: 0,
          explanation: "The main guard keeps demonstration or entry-point code from running automatically when the module is imported.",
        },
        {
          id: "functions-final-15",
          question: "Which uv command creates or updates the project environment from the resolved lockfile?",
          options: ["uv sync", "uv init", "uv python pin", "uvx ruff check ."],
          correctIndex: 0,
          explanation: "`uv sync` makes the project environment match the resolved dependency state recorded in the lockfile.",
        },
      ],
    },
  ],
};

export const FUNCTIONS_TOPICS: Record<string, { title: string; slug: string; lessons: LessonContent[] }> = {
  "functions": {
    title: "Functions & Modules",
    slug: "functions",
    lessons: [
      FUNCTION_BASICS_LESSON,
      ARGUMENTS_AND_PARAMETERS_LESSON,
      SCOPE_AND_NAMESPACES_LESSON,
      ADVANCED_FUNCTIONS_LESSON,
      MODULES_AND_PACKAGES_LESSON,
      PACKAGE_MANAGEMENT_LESSON,
      FUNCTIONS_FINAL_QUIZ_LESSON
    ],
  },
};
