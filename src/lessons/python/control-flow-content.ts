import { type LessonContent } from "@/lessons/types";

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
        "Use parentheses whenever they make the intended calculation clearer. Parentheses are evaluated first.",
      ],
    },
    {
      kind: "interactive-code",
      code: 'print(2 + 3 * 4)\nprint((2 + 3) * 4)\n\nprice = 20\nshipping = 5\nquantity = 3\nprint(price + shipping * quantity)\nprint((price + shipping) * quantity)',
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

export const CONTROL_FLOW_TOPICS: Record<string, { title: string; slug: string; lessons: LessonContent[] }> = {
  "control-flow": {
    title: "Control Flow",
    slug: "control-flow",
    lessons: [OPERATORS_LESSON],
  },
};
