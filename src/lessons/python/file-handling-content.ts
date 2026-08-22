import { type LessonContent } from "@/lessons/types";

import howItWorksImg from "@/images/python/intermediate/file_handling/how-python-works-with-file.png";
import filePathsImg from "@/images/python/intermediate/file_handling/file-paths.png";

export const FILE_HANDLING_TOPICS: Record<string, { title: string; slug: string; lessons: LessonContent[] }> = {
  "file-handling": {
    title: "File Handling",
    slug: "file-handling",
    lessons: [
      {
        slug: "file-basics",
        title: "File Basics",
        subtitle: "Generate sample contacts with Faker and save them in a text file you can read tomorrow.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "Values in a running Python program live in memory. When the program ends, that memory is cleared. A file stores information on disk, so another run can use it later.",
              "Faker creates made-up but realistic-looking data. It gives you safe practice data without typing a dozen names yourself or using real contact details."
            ]
          },
          {
            kind: "animation",
            variant: "file-basics",
            caption: "Generating and saving data"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "`open()` connects Python to a file and returns a file object. The file object can read from or write to that file. Use `with` to make the connection temporary: Python closes the file when the indented block ends.",
              "Text is made of characters, so specify `encoding=\"utf-8\"`. UTF-8 handles ordinary English text and names with accents consistently across machines."
            ]
          },
          {
            kind: "image",
            src: howItWorksImg,
            alt: "How python works with files",
            caption: "How python works with files"
          },
          {
            kind: "prose",
            heading: "Step-by-step",
            body: [
              "### 1. Generate three practice contacts",
              "Create `save_contacts.py` and add:"
            ]
          },
          {
            kind: "code",
            code: "from faker import Faker\n\nfake = Faker()\ncontacts = [fake.name() for _ in range(3)]"
          },
          {
            kind: "prose",
            body: [
              "`Faker()` creates a generator object. The list comprehension calls `fake.name()` three times and keeps the generated names in `contacts`."
            ]
          },
          {
            kind: "prose",
            body: [
              "### 2. Write the names to a new text file",
              "Add this code below the list:"
            ]
          },
          {
            kind: "code",
            code: "with open(\"contacts.txt\", \"w\", encoding=\"utf-8\") as file:\n    for name in contacts:\n        file.write(name + \"\\n\")"
          },
          {
            kind: "prose",
            body: [
              "`\"w\"` means write mode. It creates `contacts.txt` if it is missing, and replaces its contents if it already exists. `write()` does not add a line break for you, so the `\"\\n\"` puts each name on its own line."
            ]
          },
          {
            kind: "prose",
            body: [
              "### 3. Read back what you saved",
              "Finish the script with:"
            ]
          },
          {
            kind: "code",
            code: "with open(\"contacts.txt\", \"r\", encoding=\"utf-8\") as file:\n    saved_contacts = file.read()\n\nprint(saved_contacts)"
          },
          {
            kind: "prose",
            body: [
              "`\"r\"` means read mode. `file.read()` returns the whole text as one string. Run `python save_contacts.py`, then open `contacts.txt` in your editor to see the same names."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "Here is the complete first version:"
            ]
          },
          {
            kind: "code",
            code: "from faker import Faker\n\nfake = Faker()\ncontacts = [fake.name() for _ in range(3)]\n\nwith open(\"contacts.txt\", \"w\", encoding=\"utf-8\") as file:\n    for name in contacts:\n        file.write(name + \"\\n\")\n\nwith open(\"contacts.txt\", \"r\", encoding=\"utf-8\") as file:\n    print(file.read())"
          },
          {
            kind: "prose",
            body: [
              "The first `with` block saves the list. The second starts a fresh read connection, which is useful because the writing connection is already closed."
            ]
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "**Opening with `\"w\"` by habit:** It clears an existing file. Use `\"a\"` later in this module when you mean to add to it.\n\n**Skipping `with`:** Calling `open()` without closing the file can leave data unwritten or keep a resource open. Put normal file work inside `with`.\n\n**Forgetting `\\n`:** `write()` joins text exactly as given. Add a newline when you want separate lines."
          },
          {
            kind: "takeaways",
            items: [
              "Files keep data after a Python process ends.",
              "`with open(..., encoding=\"utf-8\")` safely opens and closes a text file.",
              "Faker makes useful, fictional practice data from the first exercise."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "fb-1",
                question: "What remains after the script exits: the `contacts` list or `contacts.txt`?",
                options: [
                  "The contacts list",
                  "contacts.txt",
                  "Both remain",
                  "Neither remain"
                ],
                correctIndex: 1,
                explanation: "The contacts list in memory is cleared, but the file on disk remains."
              },
              {
                id: "fb-2",
                question: "What does `encoding=\"utf-8\"` describe?",
                options: [
                  "The encryption level of the file",
                  "How text characters are stored in the file",
                  "The file extension",
                  "The operating system format"
                ],
                correctIndex: 1,
                explanation: "UTF-8 describes the encoding used to store text characters on disk."
              },
              {
                id: "fb-3",
                question: "If you change the range to `5`, how many lines should the file contain?",
                options: [
                  "Three",
                  "Five",
                  "One",
                  "None"
                ],
                correctIndex: 1,
                explanation: "The loop will run 5 times, writing a name and a newline 5 times."
              }
            ]
          }
        ]
      },
      {
        slug: "working-with-paths",
        title: "Working with Paths",
        subtitle: "Build file locations cleanly and cross-platform without guessing the folder.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "`open(\"contacts.txt\")` works only when Python looks in the folder you expect. A path is the address that tells Python where a file or folder lives.",
              "Good paths make a script work on another computer and make its data folder easy to find. Hand-building addresses with slashes is fragile, so Python provides path tools."
            ]
          },
          {
            kind: "animation",
            variant: "working-with-paths",
            caption: "Absolute vs Relative Paths"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "A relative path starts from the current working directory, the folder where the command was run. `data/contacts.txt` is relative. An absolute path starts at the filesystem root, such as `/Users/sam/project/data/contacts.txt` on macOS or Linux.",
              "For new code, use `pathlib.Path`. Its `/` operator joins path parts using the correct separator for the operating system."
            ]
          },
          {
            kind: "image",
            src: filePathsImg,
            alt: "Absolute vs Relative Paths",
            caption: "Visual breakdown of path components."
          },
          {
            kind: "prose",
            heading: "Step-by-step",
            body: [
              "### 1. See where Python starts"
            ]
          },
          {
            kind: "code",
            code: "from pathlib import Path\n\nprint(Path.cwd())"
          },
          {
            kind: "prose",
            body: [
              "`Path.cwd()` returns the current working directory. If Python cannot find a relative file, print this value before changing the path.",
              "### 2. Build a path from parts"
            ]
          },
          {
            kind: "code",
            code: "from pathlib import Path\n\ndata_folder = Path(\"data\")\ncontacts_path = data_folder / \"contacts.txt\"\nprint(contacts_path)"
          },
          {
            kind: "prose",
            body: [
              "This creates a `Path` object for `data/contacts.txt`. It does not create a folder or file yet. The `/` here joins locations; it is not division.",
              "### 3. Create the parent folder before writing"
            ]
          },
          {
            kind: "code",
            code: "data_folder.mkdir(exist_ok=True)\n\nwith contacts_path.open(\"w\", encoding=\"utf-8\") as file:\n    file.write(\"Ada Reed\\n\")"
          },
          {
            kind: "prose",
            body: [
              "`mkdir()` creates the folder. `exist_ok=True` means the code does not fail if `data` is already there. `Path.open()` is the path-based form of `open()`."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "Move your previous `contacts.txt` into a `data` folder with this focused script:"
            ]
          },
          {
            kind: "code",
            code: "from pathlib import Path\n\nproject = Path.cwd()\ncontacts_path = project / \"data\" / \"contacts.txt\"\ncontacts_path.parent.mkdir(exist_ok=True)\n\nwith contacts_path.open(\"w\", encoding=\"utf-8\") as file:\n    file.write(\"Mika Patel\\nJordan Kim\\n\")\n\nprint(f\"Saved to: {contacts_path.resolve()}\")"
          },
          {
            kind: "prose",
            body: [
              "`parent` is the containing folder. `resolve()` prints an absolute version of the location, which is helpful when you need to inspect the result."
            ]
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "**Joining strings with `/`:** It can produce awkward or platform-specific paths. Join `Path` parts with `/` instead.\n\n**Assuming the script's folder is the working folder:** They can differ. Check `Path.cwd()` when a relative path fails.\n\n**Creating only the file path:** A file cannot be written inside a folder that does not exist. Create its parent first."
          },
          {
            kind: "takeaways",
            items: [
              "Paths are file addresses.",
              "Relative paths depend on the current working directory.",
              "`Path` joins and opens locations cleanly across operating systems."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "wp-1",
                question: "Is `data/contacts.txt` relative or absolute?",
                options: [
                  "Relative",
                  "Absolute"
                ],
                correctIndex: 0,
                explanation: "It doesn't start from the root directory, so it's a relative path starting from the current working directory."
              },
              {
                id: "wp-2",
                question: "Does `Path(\"data\") / \"contacts.txt\"` create a file?",
                options: [
                  "Yes, it creates a file named contacts.txt inside data",
                  "No, it only describes a location",
                  "Yes, if the data folder already exists",
                  "No, but it creates the data folder"
                ],
                correctIndex: 1,
                explanation: "Creating a Path object only builds a representation of the path, it doesn't touch the file system."
              },
              {
                id: "wp-3",
                question: "Which call reveals where relative paths begin?",
                options: [
                  "Path.start()",
                  "Path.root()",
                  "Path.home()",
                  "Path.cwd()"
                ],
                correctIndex: 3,
                explanation: "`Path.cwd()` returns the Current Working Directory, which is the starting point for relative paths."
              }
            ]
          }
        ]
      },
      {
        slug: "reading-files",
        title: "Reading Files",
        subtitle: "Read text without wasting memory.",
        sections: []
      },
      {
        slug: "writing-files",
        title: "Writing Files",
        subtitle: "Write and append text.",
        sections: []
      },
      {
        slug: "file-modes",
        title: "File Modes",
        subtitle: "Choose the right file mode.",
        sections: []
      },
      {
        slug: "file-methods",
        title: "File Methods",
        subtitle: "Control the file cursor.",
        sections: []
      },
      {
        slug: "pathlib-module",
        title: "Pathlib Module",
        subtitle: "Use modern Path objects.",
        sections: []
      },
      {
        slug: "os-module",
        title: "OS Module",
        subtitle: "Inspect folders with os.",
        sections: []
      },
      {
        slug: "working-with-csv",
        title: "Working with CSV",
        subtitle: "Exchange rows with CSV.",
        sections: []
      },
      {
        slug: "working-with-json",
        title: "Working with JSON",
        subtitle: "Save structured data as JSON.",
        sections: []
      },
      {
        slug: "pickle-module",
        title: "Pickle Module",
        subtitle: "Cache Python objects with pickle.",
        sections: []
      },
      {
        slug: "shutil-module",
        title: "Shutil Module",
        subtitle: "Copy, move, and archive files.",
        sections: []
      }
    ]
  }
};
