import { type LessonContent } from "@/lessons/types";

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
    ],
  },
};
