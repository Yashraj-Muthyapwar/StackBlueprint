import { type LessonContent } from "@/lessons/types";
import operatorPrecedenceMnemonic from "@/images/python/control-flow/operator-precedence-mnemonic.png";

export const OPERATORS_LESSON: LessonContent = {
  slug: "operators",
  title: "Python Operators",
  subtitle: "Use symbols and keywords to calculate, compare, combine, and test values.",
  sections: [
    {
      kind: "prose",
      heading: "Why this matters",
      body: [
        "An operator tells Python what to do with one or more values. In `10 + 5`, `+` is the operator and `10` and `5` are operands.",
        "Operators help a program calculate totals, compare values, combine conditions, and decide what should happen next.",
      ],
    },
    { kind: "animation", variant: "python-operators", caption: "Operators transform values into new results" },
    {
      kind: "table",
      caption: "Operator families",
      headers: ["Family", "Examples", "What it does"],
      rows: [
        ["Arithmetic", "`+`, `-`, `*`, `/`, `//`, `%`, `**`", "Calculates with values"],
        ["Assignment", "`=`, `+=`, `-=`", "Stores or updates a value"],
        ["Comparison", "`==`, `!=`, `>`, `>=`", "Produces `True` or `False`"],
        ["Logical", "`and`, `or`, `not`", "Combines or reverses conditions"],
        ["Membership", "`in`, `not in`", "Checks whether a value is present"],
        ["Identity", "`is`, `is not`", "Checks whether two names refer to one object"],
        ["Bitwise", "`&`, `|`, `^`, `~`, `<<`, `>>`", "Works with integer bits"],
      ],
    },
    {
      kind: "prose",
      heading: "Arithmetic operators",
      body: [
        "Arithmetic operators calculate with numbers. `/` always performs true division and returns a `float`. `//` rounds down to the next whole number, `%` gives the remainder, and `**` raises a value to a power.",
        "`+` can also join strings, while `*` can repeat a string.",
      ],
    },
    {
      kind: "interactive-code",
      code: 'a = 10\nb = 3\n\nprint(a + b)\nprint(a - b)\nprint(a * b)\nprint(a / b)\nprint(a // b)\nprint(a % b)\nprint(a ** b)\nprint("Go! " * 3)',
    },
    {
      kind: "callout",
      tone: "info",
      title: "Floor division is not truncation",
      body: "`10 // 3` is `3`, but `-10 // 3` is `-4`. Floor division moves to the lower whole number on the number line.",
    },
    {
      kind: "prose",
      heading: "Assignment operators",
      body: [
        "`=` assigns the value on the right to the name on the left. It does not ask whether two values are equal.",
        "Compound assignment combines an operation with reassignment. `score += 5` is a shorter form of `score = score + 5`.",
      ],
    },
    {
      kind: "interactive-code",
      code: 'score = 10\nscore += 5\nscore *= 2\nscore -= 4\n\nprint(score)',
    },
    {
      kind: "table",
      caption: "Common compound assignments",
      headers: ["Operator", "Meaning"],
      rows: [
        ["`x += 5`", "`x = x + 5`"],
        ["`x -= 5`", "`x = x - 5`"],
        ["`x *= 5`", "`x = x * 5`"],
        ["`x /= 5`", "`x = x / 5`"],
        ["`x //= 5`", "`x = x // 5`"],
        ["`x %= 5`", "`x = x % 5`"],
        ["`x **= 5`", "`x = x ** 5`"],
      ],
    },
    {
      kind: "prose",
      heading: "Comparison operators",
      body: [
        "Comparisons ask a question and return a Boolean value: `True` or `False`. These results become the conditions used by `if` statements in the next lesson.",
        "Use `==` to compare values. `=` assigns a value, while `==` checks whether two values are equal.",
      ],
    },
    {
      kind: "interactive-code",
      code: 'age = 18\nminimum_age = 18\n\nprint(age == minimum_age)\nprint(age != minimum_age)\nprint(age > 16)\nprint(age < 21)\nprint(age >= 18)\nprint(age <= 17)',
    },
    {
      kind: "prose",
      heading: "Logical operators",
      body: [
        "`and` is true only when both conditions are true. `or` is true when at least one condition is true. `not` reverses a Boolean value.",
        "Parentheses make a combined condition easier to read and make its evaluation order clear.",
      ],
    },
    {
      kind: "interactive-code",
      code: 'has_ticket = True\nhas_id = False\n\nprint(has_ticket and has_id)\nprint(has_ticket or has_id)\nprint(not has_id)\nprint(has_ticket and (has_id or True))',
    },
    {
      kind: "prose",
      heading: "Membership and identity",
      body: [
        "`in` and `not in` check whether a value is present. They are case-sensitive when used with text.",
        "`==` asks whether values are equal. `is` asks whether two names refer to the exact same object. Use `is` most often for `None`, not for ordinary value comparisons.",
      ],
    },
    {
      kind: "interactive-code",
      code: 'message = "Python basics"\nfirst = [1, 2]\nsecond = [1, 2]\nthird = first\nvalue = None\n\nprint("Python" in message)\nprint("python" in message)\nprint("Java" not in message)\nprint(first == second)\nprint(first is second)\nprint(first is third)\nprint(value is None)',
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Use `==` for ordinary values",
      body: "Two separate lists can contain the same values, so `first == second` can be `True` while `first is second` is `False`. Use `==` for normal value comparison and reserve `is` for identity checks such as `value is None`.",
    },
    {
      kind: "prose",
      heading: "Bitwise operators",
      body: [
        "Bitwise operators work on the binary digits of integers. `&` is AND, `|` is OR, `^` is XOR, `~` is NOT, and `<<` and `>>` shift bits left or right.",
        "They matter in areas such as flags, permissions, networking, and algorithms. For now, recognize the category and focus on the operators you will use most often in control flow.",
      ],
    },
    {
      kind: "interactive-code",
      code: 'left = 5   # 0101\nright = 3  # 0011\n\nprint(left & right)\nprint(left | right)\nprint(left ^ right)\nprint(left << 1)\nprint(10 >> 1)',
    },
    {
      kind: "prose",
      heading: "Precedence and parentheses",
      body: [
        "When an expression contains several operators, Python follows precedence rules. Multiplication, division, floor division, and modulus happen before addition and subtraction.",
        "Use parentheses whenever they make the intended calculation clearer. Parentheses are evaluated first. Operators on the same row usually evaluate from left to right, except `**`, which evaluates from right to left.",
      ],
    },
    {
      kind: "table",
      caption: "Operator precedence, highest to lowest",
      headers: ["Priority", "Operators", "Meaning"],
      rows: [
        ["1", "()", "Grouping with parentheses"],
        ["2", "`**`", "Power"],
        ["3", "`+x`, `-x`, `~x`", "Unary plus, unary minus, and bitwise NOT"],
        ["4", "`*`, `/`, `//`, `%`", "Multiply, divide, floor divide, and modulus"],
        ["5", "`+`, `-`", "Add and subtract"],
        ["6", "`<<`, `>>`", "Bitwise shifts"],
        ["7", "`&`", "Bitwise AND"],
        ["8", "`^`", "Bitwise XOR"],
        ["9", "`|`", "Bitwise OR"],
        ["10", "`==`, `!=`, `<`, `<=`, `>`, `>=`, `in`, `not in`, `is`, `is not`", "Comparisons, membership, and identity"],
        ["11", "`not`", "Logical NOT"],
        ["12", "`and`", "Logical AND"],
        ["13", "`or`", "Logical OR"],
      ],
    },
    {
      kind: "image",
      src: operatorPrecedenceMnemonic,
      alt: "Operator precedence mnemonic mapping each word in Please Pay Undergrads Minimum Allowance, So Any Extra Offer Can Never Always Outperform to a Python operator group",
      caption: "Read the mnemonic from left to right, then match each word to the precedence row above.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Where is assignment?",
      body: "`=` and compound assignments such as `+=` are statements, not ordinary expression operators in this precedence list. Perform the calculation on the right first, then assign its result to the name on the left.",
    },
    {
      kind: "interactive-code",
      code: 'print(2 + 3 * 4)\nprint((2 + 3) * 4)\nprint(2 ** 3 ** 2)\nprint(True or False and False)\nprint((True or False) and False)\n\nprice = 20\nshipping = 5\nquantity = 3\nprint(price + shipping * quantity)\nprint((price + shipping) * quantity)',
    },
    {
      kind: "prose",
      heading: "Put the operators together",
      body: [
        "A checkout calculation uses arithmetic to produce a total, assignment to keep it, and comparison to produce a Boolean result. This is the kind of expression that will drive a later condition.",
      ],
    },
    {
      kind: "interactive-code",
      code: 'product_price = 24\nquantity = 3\ndiscount = 10\nfree_shipping_limit = 50\n\nsubtotal = product_price * quantity\nfinal_price = subtotal - discount\ngets_free_shipping = final_price >= free_shipping_limit\n\nprint(subtotal)\nprint(final_price)\nprint(gets_free_shipping)',
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Common mistakes",
      body: "- **Using `=` instead of `==`**: `=` assigns. `==` compares.\n- **Expecting `/` to return an integer**: `/` returns a float. Use `//` only when floor division is the goal.\n- **Confusing `is` with `==`**: Compare ordinary values with `==`.\n- **Relying on unclear precedence**: Add parentheses when a calculation could be read in more than one way.",
    },
    {
      kind: "takeaways",
      items: [
        "Arithmetic operators calculate values, including division, remainder, and powers.",
        "Assignment operators store or update a named value.",
        "Comparison and logical operators produce Boolean results for control flow.",
        "Membership checks presence. Identity checks whether two names refer to one object.",
        "Parentheses make evaluation order explicit.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "operators-1",
          question: "What does `17 % 5` produce?",
          options: ["3", "2", "3.4", "5"],
          correctIndex: 1,
          explanation: "17 divided by 5 leaves a remainder of 2.",
        },
        {
          id: "operators-2",
          question: "Which expression checks whether `age` is at least 18?",
          options: ["`age = 18`", "`age == 18`", "`age >= 18`", "`age => 18`"],
          correctIndex: 2,
          explanation: "`>=` means greater than or equal to.",
        },
        {
          id: "operators-3",
          question: "What does `True and False` evaluate to?",
          options: ["True", "False", "None", "0"],
          correctIndex: 1,
          explanation: "`and` requires both operands to be true.",
        },
        {
          id: "operators-4",
          question: "Which operator should you normally use to compare two values for equality?",
          options: ["`=`", "`==`", "`is`", "`in`"],
          correctIndex: 1,
          explanation: "`==` compares values. `=` assigns, while `is` compares identity.",
        },
        {
          id: "operators-5",
          question: "Create `price = 12` and `quantity = 4`, then print their product using the two variables.",
          interactiveCode: true,
          initialCode: "# Write your code below\n",
          testCode: "assert price == 12\nassert quantity == 4",
          expectedOutput: "48",
          requiredCodePatterns: [
            "\\bprice\\s*=\\s*12\\b",
            "\\bquantity\\s*=\\s*4\\b",
            "\\bprint\\s*\\(\\s*price\\s*\\*\\s*quantity\\s*\\)",
          ],
          validationMessage: "Create both variables, then print `price * quantity`.",
          explanation: "Assign the two values, then multiply and print `price * quantity`.",
        },
      ],
    },
  ],
};

export const CONDITIONAL_BRANCHING_LESSON: LessonContent = {
  slug: "if-else",
  title: "Conditional Branching: If/Else",
  subtitle: "Choose which code runs by testing conditions that are true or false.",
  sections: [
    { kind: "prose", heading: "Why this matters", body: ["Programs do not always follow one straight path. A condition lets a program choose an action based on the current data.", "Python evaluates a condition to `True` or `False`, then runs the matching indented block. This is called conditional branching."] },
    { kind: "animation", variant: "conditional-branching", caption: "A condition chooses one path through a program" },
    { kind: "prose", heading: "IF Statement", body: ["The comparison and logical operators from the previous lesson produce Boolean values. A colon ends the condition line, and the indented lines below it form the body of the `if` statement.", "When the condition is false, Python skips that body and continues with the next statement after the block."] },
    { kind: "syntax", title: "IF statement", code: "if condition:\n    statement", description: "The colon starts the branch body. Indent every statement that belongs to the `if` block." },
    { kind: "interactive-code", caption: "IF STATEMENT · SYNTAX AND EXAMPLE", code: 'temperature = 24\n\nprint(temperature > 20)\n\nif temperature > 20:\n    print("Warm day")\n\nprint("Forecast checked")' },
    { kind: "prose", heading: "is vs ==", body: ["Use `==` when a condition should compare values. Two separate lists can contain the same items, so they can be equal even when they are not the same object.", "Use `is` when you need to check identity. Its clearest everyday use is `value is None`, which checks for the single `None` object. Do not use `is` as a substitute for `==` when comparing ordinary strings, numbers, or lists."] },
    { kind: "syntax", title: "Value comparison and identity check", code: "left == right\nvalue is None", description: "Use `==` for equal values. Reserve `is` for identity checks, most commonly `is None`." },
    { kind: "interactive-code", caption: "IS VS == · COMPARISON EXAMPLE", code: 'first = ["Python", "SQL"]\nsecond = ["Python", "SQL"]\nresult = None\n\nprint(first == second)\nprint(first is second)\nprint(result is None)' },
    { kind: "prose", heading: "IF/ELSE", body: ["Use `if/else` when exactly one of two blocks must run. The `if` block runs for `True`; the `else` block runs for `False`.", "Keep `else` aligned with its `if`. Both bodies must be indented by the same amount."] },
    { kind: "syntax", title: "IF/ELSE statement", code: "if condition:\n    if_body\nelse:\n    else_body", description: "`else` is aligned with `if`. Exactly one of these two indented bodies runs." },
    { kind: "interactive-code", caption: "IF/ELSE · SYNTAX AND EXAMPLE", code: 'age = 16\n\nif age >= 18:\n    print("Eligible to vote")\nelse:\n    print("Not eligible to vote")' },
    { kind: "prose", heading: "ELIF and IF ELSE Ladder", body: ["Start with `if`, add zero or more `elif` clauses, and finish with an optional `else`. This ordered structure is commonly called an if/else ladder.", "`elif` means else if. Python tests conditions from top to bottom and runs only the first matching branch. It skips every remaining `elif` or `else` branch after a match."] },
    { kind: "syntax", title: "IF/ELIF/ELSE ladder", code: "if first_condition:\n    first_body\nelif next_condition:\n    next_body\nelse:\n    fallback_body", description: "Python checks from top to bottom and runs the first matching body. An `else` fallback is optional." },
    { kind: "interactive-code", caption: "IF/ELIF/ELSE LADDER · SYNTAX AND EXAMPLE", code: 'score = 75\n\nif score >= 90:\n    grade = "A"\nelif score >= 75:\n    grade = "B"\nelif score >= 40:\n    grade = "C"\nelse:\n    grade = "Needs improvement"\n\nprint(grade)' },
    { kind: "callout", tone: "info", title: "Order conditions from most specific to most general", body: "In an `if/elif` sequence, the first true condition wins. Put a narrower condition first. For example, test `score >= 90` before `score >= 75`, or a score of 95 would never reach the A branch." },
    { kind: "prose", heading: "Nested conditions", body: ["A nested condition appears inside another conditional block. Python checks the inner condition only after the outer condition allows it.", "Nesting is useful when the second question depends on the answer to the first. Keep nesting shallow when possible so the code remains easy to read."] },
    { kind: "interactive-code", caption: "NESTED CONDITION · EXAMPLE", code: 'age = 20\nhas_id = True\n\nif age >= 18:\n    if has_id:\n        print("Entry allowed")\n    else:\n        print("ID required")\nelse:\n    print("Entry not allowed")' },
    { kind: "prose", heading: "Ternary Operator", body: ["The ternary operator is a compact way to choose between two values.", "Use it for a short value choice. Prefer a regular `if/else` block when each branch needs several lines of work."] },
    { kind: "syntax", title: "Ternary operator", code: "result = value_if_true if condition else value_if_false", description: "Read this as: use the first value when the condition is true, otherwise use the second value." },
    { kind: "interactive-code", caption: "TERNARY OPERATOR · SYNTAX AND EXAMPLE", code: 'age = 20\nstatus = "Adult" if age >= 18 else "Minor"\n\nprint(status)' },
    { kind: "prose", heading: "Use pass for an intentionally empty block", body: ["Python requires every `if` body to contain a statement. Use `pass` as a temporary placeholder when you have decided the condition but have not written that branch yet.", "`pass` does nothing. Replace it with real work when the branch is ready."] },
    { kind: "interactive-code", caption: "PASS · PLACEHOLDER EXAMPLE", code: 'is_preview = True\n\nif is_preview:\n    pass\n\nprint("Program continues")' },
    { kind: "callout", tone: "warn", title: "Common mistakes", body: "- **Using `=` in a condition**: Use `==` to compare values.\n- **Forgetting the colon**: Each `if`, `elif`, and `else` header ends with `:`.\n- **Missing indentation**: The branch body must be indented consistently.\n- **Putting a broad condition first**: In an `elif` sequence, the first true branch wins.\n- **Writing `else if`**: Python uses the single keyword `elif`." },
    { kind: "takeaways", items: ["An `if` block runs only when its condition is true.", "An `if/else` statement runs exactly one of two branches.", "An `if/elif/else` ladder runs the first matching branch.", "Use `==` to compare values and `is` for identity checks such as `is None`.", "A ternary operator is useful for a simple two-value choice."] },
    { kind: "quiz", questions: [
      { id: "conditional-branching-1", question: "What happens when the condition in an `if` statement is `False` and there is no `else` block?", options: ["The indented if block is skipped", "Python runs the if block anyway", "Python stops with an error", "Python changes the condition to True"], correctIndex: 0, explanation: "Python skips the indented if block, then continues with the next statement after it." },
      { id: "conditional-branching-2", question: "Which condition is the clearest way to check whether `result` has no value yet?", options: ["`result == None`", "`result is None`", "`result = None`", "`None is result ==`"], correctIndex: 1, explanation: "`None` is a singleton object, so `result is None` is the standard identity check." },
      { id: "conditional-branching-3", question: "Why should `score >= 90` appear before `score >= 75` in a grade check?", options: ["Python requires numbers in descending order", "The first true branch runs, so the more specific condition must be checked first", "It makes the code execute faster", "The conditions would otherwise both be false"], correctIndex: 1, explanation: "A score of 95 meets both conditions. Testing 90 first lets it receive the intended result." },
      { id: "conditional-branching-4", question: "Which line is a valid conditional expression?", options: ["`status = if age >= 18 then Adult else Minor`", "`status = Adult if age >= 18 else Minor`", "`if status = Adult if age >= 18`", "`status if age >= 18 = Adult else Minor`"], correctIndex: 1, explanation: "A conditional expression puts the true value first, then `if condition else` and the false value." },
      { id: "conditional-branching-5", question: "Create `age = 19`. Print `Adult` when age is at least 18; otherwise print `Minor`.", interactiveCode: true, initialCode: "# Write your code below\n", testCode: "assert age == 19", expectedOutput: "Adult", requiredCodePatterns: ["\\bage\\s*=\\s*19\\b", "\\bif\\s+age\\s*>=\\s*18\\s*:", "\\belse\\s*:", "\\bprint\\s*\\(\\s*(['\\\"])Adult\\1\\s*\\)", "\\bprint\\s*\\(\\s*(['\\\"])Minor\\1\\s*\\)"], validationMessage: "Create `age = 19`, then use an `if/else` statement that prints `Adult` or `Minor`.", explanation: "Use an `if age >= 18:` branch for `Adult` and an `else:` branch for `Minor`." },
    ] },
  ],
};

export const CONTROL_FLOW_TOPICS: Record<string, { title: string; slug: string; lessons: LessonContent[] }> = {
  "control-flow": {
    title: "Control Flow",
    slug: "control-flow",
    lessons: [OPERATORS_LESSON, CONDITIONAL_BRANCHING_LESSON],
  },
};
