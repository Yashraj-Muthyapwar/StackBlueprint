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
  subtitle: "Understand the LEGB rule, variable shadowing, and the global/nonlocal keywords.",
  sections: [],
};

export const ADVANCED_FUNCTIONS_LESSON: LessonContent = {
  slug: "advanced-functions",
  title: "Advanced Functions",
  subtitle: "Explore lambdas, map/filter/reduce, closures, and higher-order functions.",
  sections: [],
};

export const MODULES_AND_PACKAGES_LESSON: LessonContent = {
  slug: "modules-packages",
  title: "Modules & Packages",
  subtitle: "Import standard tools, create your own modules, and build package structures.",
  sections: [],
};

export const PACKAGE_MANAGEMENT_LESSON: LessonContent = {
  slug: "package-management",
  title: "Package Management",
  subtitle: "Use pip, virtual environments, and requirements.txt to manage third-party code.",
  sections: [],
};

export const FUNCTIONS_FINAL_QUIZ_LESSON: LessonContent = {
  slug: "functions-final-quiz",
  title: "Functions & Modules Final Quiz",
  subtitle: "Review your understanding of functions, scope, advanced patterns, and package management.",
  sections: [],
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
