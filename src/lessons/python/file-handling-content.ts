import { type LessonContent } from "@/lessons/types";

import howItWorksImg from "@/images/python/intermediate/file_handling/how-python-works-with-file.png";
import filePathsImg from "@/images/python/intermediate/file_handling/file-paths.png";
import fileReadImg from "@/images/python/intermediate/file_handling/file-read.png";
import fileWriteImg from "@/images/python/intermediate/file_handling/file-write.png";
import fileModesImg from "@/images/python/intermediate/file_handling/file-modes.png";
import fileMethodsImg from "@/images/python/intermediate/file_handling/file-methods.png";

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
            code: `from faker import Faker\n\nfake = Faker()\ncontacts = [fake.name() for _ in range(3)]`
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
            code: `with open(\"contacts.txt\", \"w\", encoding=\"utf-8\") as file:\n    for name in contacts:\n        file.write(name + \"\\n\")`
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
            code: `with open(\"contacts.txt\", \"r\", encoding=\"utf-8\") as file:\n    saved_contacts = file.read()\n\nprint(saved_contacts)`
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
            code: `from faker import Faker\n\nfake = Faker()\ncontacts = [fake.name() for _ in range(3)]\n\nwith open(\"contacts.txt\", \"w\", encoding=\"utf-8\") as file:\n    for name in contacts:\n        file.write(name + \"\\n\")\n\nwith open(\"contacts.txt\", \"r\", encoding=\"utf-8\") as file:\n    print(file.read())`
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
        subtitle: "Build, inspect, create, and find file locations without guessing which folder Python is using.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "`open(\"contacts.txt\")` works only when Python looks in the folder you expect. A path is the address that tells Python where a file or folder lives.",
              "Good paths make a script work on another computer and make its data folder easy to find. `pathlib` gives you one readable tool for building paths, checking them, and finding files."
            ]
          },
          {
            kind: "animation",
            variant: "working-with-paths",
            caption: "Pathlib Basics"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "A relative path starts from the current working directory, the folder where the command was run. `data/contacts.txt` is relative. An absolute path starts at the filesystem root, such as `/Users/sam/project/data/contacts.txt` on macOS or Linux.",
              "For new code, use `pathlib.Path`. Its `/` operator joins path parts using the correct separator for the operating system. A `Path` is only an address until you call a method that reads, writes, or creates something there."
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
              "### 1. See where Python starts and build a path"
            ]
          },
          {
            kind: "interactive-code",
            code: `from pathlib import Path\n\nprint(Path.cwd())`
          },
          {
            kind: "prose",
            body: [
              "`Path.cwd()` returns the current working directory. If Python cannot find a relative file, print this value before changing the path. Build an address from parts instead of joining strings yourself:"
            ]
          },
          {
            kind: "interactive-code",
            code: `from pathlib import Path\n\ndata_folder = Path(\"data\")\ncontacts_path = data_folder / \"contacts.txt\"\nprint(contacts_path)`
          },
          {
            kind: "prose",
            body: [
              "This creates a `Path` object for `data/contacts.txt`. It does not create a folder or file yet. The `/` here joins locations; it is not division.",
              "### 2. Create and inspect a workspace"
            ]
          },
          {
            kind: "interactive-code",
            code: `from pathlib import Path\n\nworkspace = Path(\"contact_workspace\")\nexports = workspace / \"exports\"\nexports.mkdir(parents=True, exist_ok=True)\n\nreport = exports / \"contacts-august.txt\"\nprint(report.name)\nprint(report.stem)\nprint(report.suffix)\nprint(report.exists())`
          },
          {
            kind: "prose",
            body: [
              "`parents=True` creates missing folders in the middle of a path. `exist_ok=True` lets you rerun the script without an error when the folders already exist. `name`, `stem`, `suffix`, and `parent` reveal useful parts of a path; `exists()` checks whether anything is already at that address.",
              "### 3. Create a file and find matching files"
            ]
          },
          {
            kind: "interactive-code",
            code: `from pathlib import Path\n\ndata_folder = Path(\"data\")\ncontacts_path = data_folder / \"contacts.txt\"\n\ndata_folder.mkdir(exist_ok=True)\n\nwith contacts_path.open(\"w\", encoding=\"utf-8\") as file:\n    file.write(\"Ada Reed\\n\")\n\nfor text_file in Path(\".\").rglob(\"*.txt\"):\n    print(text_file)`
          },
          {
            kind: "prose",
            body: [
              "`Path.open()` is the path-based form of `open()`. The `*.txt` pattern means any filename ending in `.txt`. `rglob()` searches the current folder and every nested folder. Use `glob(\"*.txt\")` when you only want the direct contents of one folder."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "Create three small exports, then list their names:"
            ]
          },
          {
            kind: "interactive-code",
            code: `from pathlib import Path\n\nexports = Path(\"contact_workspace/exports\")\nexports.mkdir(parents=True, exist_ok=True)\n\nfor month in [\"june\", \"july\", \"august\"]:\n    (exports / f\"contacts-{month}.txt\").write_text(\n        \"Practice contact export\\n\", encoding=\"utf-8\"\n    )\n\nfor file_path in sorted(exports.glob(\"contacts-*.txt\")):\n    print(file_path.name)\n    print(file_path.resolve())`
          },
          {
            kind: "prose",
            body: [
              "`write_text()` is a compact helper for a small text file. The final loop uses `glob()` to list only files beginning with `contacts-`. Print `file_path.resolve()` if you need to see the absolute location of a result."
            ]
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "**Joining strings with \"/\":** It can produce awkward or platform-specific paths. Join `Path` parts with `/` instead.\n\n**Assuming the script's folder is the working folder:** They can differ. Check `Path.cwd()` when a relative path fails.\n\n**Using `glob()` when files are nested:** `glob()` searches one folder level. Use `rglob()` when subfolders should be included.\n\n**Treating `Path` as file contents:** A `Path` is an address. Call `read_text()`, `open()`, or another method to access the file."
          },
          {
            kind: "takeaways",
            items: [
              "Paths are file addresses.",
              "Relative paths depend on the current working directory.",
              "`Path` joins, inspects, opens, and searches locations cleanly across operating systems."
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
              },
              {
                id: "wp-4",
                question: "Which method searches nested folders?",
                options: [
                  "glob()",
                  "rglob()",
                  "search()",
                  "find()"
                ],
                correctIndex: 1,
                explanation: "`rglob()` recursively searches the current directory and all subdirectories."
              }
            ]
          }
        ]
      },
      {
        slug: "reading-files",
        title: "Reading Files",
        subtitle: "Read text without wasting memory.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "Once a file is open in 'r' (read) mode, you need to pull its contents into Python's memory to actually use it.",
              "Files can be tiny, or they can be massive log files gigabytes in size. Python gives you different methods to read them so you don't crash your computer trying to load a massive file all at once."
            ]
          },
          {
            kind: "animation",
            variant: "reading-files",
            caption: "Reading strategies"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "Python reads files sequentially. As it reads, it moves a hidden cursor forward. You can read the whole thing at once, one line at a time, or grab all lines into a list."
            ]
          },
          {
            kind: "image",
            src: fileReadImg,
            alt: "Reading methods in Python",
            caption: "Reading files in Python moves the cursor"
          },
          {
            kind: "prose",
            heading: "Step-by-step",
            body: [
              "### 1. Read the entire file"
            ]
          },
          {
            kind: "code",
            code: `with open('poem.txt', 'r', encoding='utf-8') as file:\n    # Read everything into one giant string\n    content = file.read()\n    print(content)`
          },
          {
            kind: "prose",
            body: [
              "`read()` is the easiest, but it's dangerous for massive files. If `poem.txt` was 100GB, this would crash your computer.",
              "### 2. Read one line"
            ]
          },
          {
            kind: "code",
            code: `with open('poem.txt', 'r', encoding='utf-8') as file:\n    # Read one line, then stop\n    first_line = file.readline()\n    second_line = file.readline()\n    print(first_line, end='')`
          },
          {
            kind: "prose",
            body: [
              "`readline()` pulls just the next line and stops. Notice we used `end=''` in the `print()` function. `readline()` keeps the newline character (`\\n`) at the end of the string, and `print()` adds its own newline, resulting in double spacing if we don't suppress it.",
              "### 3. Read into a list"
            ]
          },
          {
            kind: "code",
            code: `with open('poem.txt', 'r', encoding='utf-8') as file:\n    # Read all lines into a list\n    lines = file.readlines()\n    \n    for line in lines:\n        print(line, end='')`
          },
          {
            kind: "prose",
            body: [
              "`readlines()` returns a list where each element is a line from the file. It's useful if you need to access a specific line quickly (e.g., `lines[5]`), but it still loads the whole file into memory."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "The absolute best, \"Pythonic\" way to read a file line-by-line is to loop over the file object directly. This is memory-efficient and very readable, as Python only loads one line into memory at a time."
            ]
          },
          {
            kind: "code",
            code: `with open('poem.txt', 'r') as file:\n    for line in file:\n        print(line, end='')`
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "**Using `read()` on massive files:** It will crash your program by exhausting your system's RAM. Loop over the file object instead.\n\n**Double spacing output:** Forgetting that each line from a file usually ends with `\\n`. Use `strip()` or `print(line, end='')` to prevent double newlines."
          },
          {
            kind: "takeaways",
            items: [
              "`read()` returns one massive string.",
              "`readline()` reads one line at a time.",
              "`readlines()` returns a list of strings.",
              "Looping directly over the file object is the most memory-efficient approach."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "rf-1",
                question: "Which method is the safest for reading a 10GB log file?",
                options: [
                  "file.read()",
                  "file.readlines()",
                  "for line in file:"
                ],
                correctIndex: 2,
                explanation: "Looping directly over the file object only loads one line into memory at a time, making it safe for massive files."
              },
              {
                id: "rf-2",
                question: "Why might `print(file.readline())` produce double-spaced output?",
                options: [
                  "Because readline() skips every other line",
                  "Because the string contains a '\\n' and print() adds another",
                  "Because print() automatically formats text blocks"
                ],
                correctIndex: 1,
                explanation: "readline() returns the string exactly as it is in the file, including the trailing newline character."
              }
            ]
          }
        ]
      },
      {
        slug: "writing-files",
        title: "Writing Files",
        subtitle: "Write and append text.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "When saving data, you must be careful not to accidentally destroy existing data. Python requires you to explicitly state your intentions: are you starting fresh, or adding to what's already there?"
            ]
          },
          {
            kind: "animation",
            variant: "writing-files",
            caption: "Writing vs Appending"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "To change a file, you open it in either write (`'w'`) or append (`'a'`) mode. In both modes, you use the `.write()` method to insert text."
            ]
          },
          {
            kind: "image",
            src: fileWriteImg,
            alt: "Writing vs Appending",
            caption: "Difference between Write ('w') and Append ('a') modes"
          },
          {
            kind: "prose",
            heading: "Step-by-step",
            body: [
              "### 1. Write mode ('w')"
            ]
          },
          {
            kind: "code",
            code: `with open('log.txt', 'w', encoding='utf-8') as file:\n    file.write('Booting up...\\n')\n    file.write('System online.\\n')`
          },
          {
            kind: "prose",
            body: [
              "**Write mode (`'w'`)** is destructive. If `log.txt` already exists, Python immediately wipes it completely blank before writing. If it doesn't exist, Python creates it.",
              "Notice the manual `\\n`. Unlike `print()`, `.write()` does not automatically start a new line. If you forget `\\n`, your text will squash together.",
              "### 2. Append mode ('a')"
            ]
          },
          {
            kind: "code",
            code: `with open('log.txt', 'a', encoding='utf-8') as file:\n    file.write('User logged in.\\n')`
          },
          {
            kind: "prose",
            body: [
              "**Append mode (`'a'`)** is safe. It opens the file, leaves the existing contents completely alone, and moves the hidden cursor to the very end of the file. Any new text is added after the old text."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "If you already have a list of strings, you can use `file.writelines(my_list)` instead of writing a loop to add them all at once."
            ]
          },
          {
            kind: "code",
            code: `lines_to_add = ['Apple\\n', 'Orange\\n']\nwith open('fruits.txt', 'a', encoding='utf-8') as file:\n    file.writelines(lines_to_add)`
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "**Accidentally wiping data:** Opening a file in `'w'` mode when you meant to add to it. Always double-check if you should use `'a'` instead.\n\n**Squashed text:** Forgetting that `.write()` and `.writelines()` do not add newlines automatically. You must manually include `\\n`."
          },
          {
            kind: "takeaways",
            items: [
              "`'w'` mode overwrites existing files completely.",
              "`'a'` mode adds data to the end of existing files.",
              "The `.write()` method does NOT add newlines automatically."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "wf-1",
                question: "What happens if you open an existing file in 'w' mode?",
                options: [
                  "The file is wiped clean",
                  "An error is thrown",
                  "Data is added to the end",
                  "The file is locked and cannot be changed"
                ],
                correctIndex: 0,
                explanation: "Write mode ('w') is destructive and immediately truncates (wipes) the file."
              },
              {
                id: "wf-2",
                question: "What will `file.write('A'); file.write('B')` output to the file?",
                options: [
                  "A on line 1, B on line 2",
                  "AB",
                  "A B"
                ],
                correctIndex: 1,
                explanation: ".write() does not automatically add spaces or newlines, so they are joined together."
              }
            ]
          }
        ]
      },
      {
        slug: "file-modes",
        title: "File Modes",
        subtitle: "Choose the right file mode.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "We've seen 'r', 'w', and 'a'. But Python supports even more modes for specific tasks, like safely creating new files or reading and writing at the same time."
            ]
          },
          {
            kind: "animation",
            variant: "file-modes",
            caption: "Common File Modes"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "Python provides specific modes to precisely control what you can do with a file. You can also combine modes using the `+` or `b` modifiers."
            ]
          },
          {
            kind: "image",
            src: fileModesImg,
            alt: "Summary of common file modes",
            caption: "A quick reference table of file modes"
          },
          {
            kind: "prose",
            heading: "Step-by-step",
            body: [
              "### 1. Exclusive Create ('x')"
            ]
          },
          {
            kind: "code",
            code: `try:\n    with open('important.txt', 'x') as file:\n        file.write('First!')\nexcept FileExistsError:\n    print('File already exists!')`
          },
          {
            kind: "prose",
            body: [
              "The `'x'` mode is exactly like `'w'`, except it is strictly safe. If the file already exists, it intentionally crashes instead of silently wiping your data.",
              "### 2. The Plus Modifier ('+') "
            ]
          },
          {
            kind: "code",
            code: `with open('log.txt', 'r+') as file:\n    content = file.read() # We can read\n    file.write('\\nDone.') # AND we can write!`
          },
          {
            kind: "prose",
            body: [
              "Adding `+` to any mode grants the missing capability. `'r+'` gives you Read + Write without truncating. `'w+'` gives you Write + Read, but it truncates the file first.",
              "### 3. Binary Mode ('b')"
            ]
          },
          {
            kind: "code",
            code: `with open('photo.jpg', 'rb') as file:\n    bytes = file.read(10)\n    print(bytes) # b'\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF'`
          },
          {
            kind: "prose",
            body: [
              "Text mode (`'t'`, the default) assumes the file is human-readable text. Binary mode (`'b'`) reads raw bytes. You must use `'b'` for images, PDFs, audio, and zip files."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "Copying an image file requires opening the source in `'rb'` and the destination in `'wb'`:"
            ]
          },
          {
            kind: "code",
            code: `with open('source.png', 'rb') as src:\n    with open('copy.png', 'wb') as dest:\n        dest.write(src.read())`
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "**Using 'w' instead of 'x':** If you want to create a new file but absolutely do not want to destroy existing data, always use `'x'`.\n\n**Reading non-text as text:** Opening a JPG without `'b'` will cause Python to crash with a `UnicodeDecodeError` because it tries to decode raw pixels into text."
          },
          {
            kind: "takeaways",
            items: [
              "`'x'` is a safer `'w'` that fails if the file exists.",
              "The `+` modifier allows both reading and writing.",
              "`'b'` is mandatory when working with non-text files like images."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "fm-1",
                question: "Which mode should you use to open a PDF file to read its contents?",
                options: [
                  "'r'",
                  "'rb'",
                  "'rt'",
                  "'r+'"
                ],
                correctIndex: 1,
                explanation: "PDFs are binary files, not plain text, so you must use 'rb' (Read Binary)."
              },
              {
                id: "fm-2",
                question: "What is the difference between 'w' and 'x'?",
                options: [
                  "'x' is for executable files",
                  "'w' creates a file, 'x' does not",
                  "'w' overwrites existing files, 'x' crashes if the file exists"
                ],
                correctIndex: 2,
                explanation: "Exclusive creation ('x') is a safe alternative to 'w' that prevents accidental data loss."
              }
            ]
          }
        ]
      },
      {
        slug: "file-methods",
        title: "File Methods",
        subtitle: "Control the file cursor.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "When you read or write, Python moves a hidden cursor forward. If you read a file, and then try to read it again, you get nothing because the cursor is already at the end. You need a way to control it."
            ]
          },
          {
            kind: "animation",
            variant: "file-methods",
            caption: "Controlling the Cursor"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "Every open file object has a cursor pointing to a specific byte index. Use `tell()` to find out where you are, and `seek()` to jump anywhere you want."
            ]
          },
          {
            kind: "image",
            src: fileMethodsImg,
            alt: "File cursor control with seek and tell",
            caption: "Using seek and tell to manipulate the cursor"
          },
          {
            kind: "prose",
            heading: "Step-by-step",
            body: [
              "### 1. Find your location with tell()"
            ]
          },
          {
            kind: "code",
            code: `with open('poem.txt', 'r') as file:\n    print(file.tell()) # 0\n    file.read(5)\n    print(file.tell()) # 5`
          },
          {
            kind: "prose",
            body: [
              "`tell()` returns an integer representing your current byte position from the beginning of the file.",
              "### 2. Move your location with seek()"
            ]
          },
          {
            kind: "code",
            code: `with open('poem.txt', 'r') as file:\n    content = file.read()\n    \n    file.seek(0) # Rewind to the very beginning!\n    \n    read_again = file.read()`
          },
          {
            kind: "prose",
            body: [
              "`seek(offset)` jumps the cursor to the byte at `offset`. `seek(0)` is incredibly common to \"rewind\" a file so you can process it a second time."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "If you want to read just a specific chunk from the middle of a massive file without loading the whole thing, you can use `seek()`:"
            ]
          },
          {
            kind: "code",
            code: `with open('huge_data.bin', 'rb') as file:\n    file.seek(1024) # Skip the first 1024 bytes (e.g. a header)\n    chunk = file.read(256) # Read the next 256 bytes\n    print(chunk)`
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "**Reading an empty string:** Wondering why `file.read()` returns nothing? You probably already read the file, and the cursor is stuck at the end. Use `seek(0)` to fix it."
          },
          {
            kind: "takeaways",
            items: [
              "`tell()` returns the current byte position of the cursor.",
              "`seek(offset)` moves the cursor to a specific byte index.",
              "`seek(0)` is used to \"rewind\" a file back to the start."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "fmet-1",
                question: "If you run `file.read(10)`, what will `file.tell()` return immediately after?",
                options: [
                  "0",
                  "10",
                  "An error"
                ],
                correctIndex: 1,
                explanation: "The read(10) method reads 10 bytes and advances the cursor exactly 10 bytes forward."
              },
              {
                id: "fmet-2",
                question: "How do you read a file a second time in the same 'with' block?",
                options: [
                  "Just call read() again",
                  "Close and reopen the file",
                  "Call file.seek(0) to rewind, then call read()"
                ],
                correctIndex: 2,
                explanation: "seek(0) jumps the cursor back to the beginning, allowing you to re-read the file without reopening it."
              }
            ]
          }
        ]
      },
            {
        slug: "os-module",
        title: "OS Module",
        subtitle: "Master Filesystem Workflows with os.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "Programs need to prepare folders, locate files, inspect what is already there, and remove temporary results. These tasks become harder when the same code runs on a laptop, in CI, or on a server with different paths and configuration.",
              "Python's \`os\` and \`os.path\` modules provide a portable, string-based interface to the operating system. \`shutil\` handles higher-level directory operations such as removing an entire controlled workspace."
            ]
          },
          {
            kind: "animation",
            variant: "os-module",
            caption: "Workspace Management"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "Treat a path as data until you intentionally act on it. Build a path with \`os.path.join()\`, inspect it with \`os.path\` or \`os.stat()\`, then perform a narrow operation with clear error handling.",
              "Use environment variables for deployment-specific configuration, such as a workspace location. Do not put passwords, API keys, or machine-specific absolute paths in source code."
            ]
          },
          {
            kind: "table",
            caption: "os and pathlib reference",
            headers: ["Task", "os / os.path", "pathlib.Path"],
            rows: [
              ["Current directory", "\`os.getcwd()\`", "\`Path.cwd()\`"],
              ["List immediate children", "\`os.listdir(path)\`", "\`Path(path).iterdir()\`"],
              ["Check whether a path exists", "\`os.path.exists(path)\`", "\`Path(path).exists()\`"],
              ["Join path parts", "\`os.path.join(folder, name)\`", "\`Path(folder) / name\`"],
              ["Get a file extension", "\`os.path.splitext(path)[1]\`", "\`Path(path).suffix\`"],
              ["Create a directory tree", "\`os.makedirs(path, exist_ok=True)\`", "\`Path(path).mkdir(parents=True, exist_ok=True)\`"],
              ["Get file size", "\`os.path.getsize(path)\`", "\`Path(path).stat().st_size\`"],
              ["Find recursive matches", "\`os.walk(path)\` plus filtering", "\`Path(path).rglob(\"*.csv\")\`"]
            ]
          },
          {
            kind: "prose",
            heading: "Step-by-step",
            body: [
              "### 1. Resolve configured paths and navigate carefully",
              "\`os.environ\` is a mapping of environment-variable names to strings. Use \`os.getenv()\` when a missing setting has a safe default. \`expandvars()\` expands \`$VARIABLE\` references, and \`expanduser()\` expands \`~\` to the current user's home directory."
            ]
          },
          {
            kind: "interactive-code",
            code: `import os

starting_directory = os.getcwd()
os.environ.setdefault("PROJECT_DIR", "os_lab_navigation")

workspace = os.path.abspath(os.path.expandvars("$PROJECT_DIR"))
home_directory = os.path.expanduser("~")
config_path = os.path.join(workspace, "config", "settings.json")

os.makedirs(workspace, exist_ok=True)

try:
    os.chdir(workspace)
    print(f"Working in: {os.getcwd()}")
    print(f"Home: {home_directory}")
    print(f"Config path: {config_path}")
finally:
    os.chdir(starting_directory)`
          },
          {
            kind: "prose",
            body: [
              "\`os.chdir()\` changes how every later relative path is interpreted. Save and restore the original directory with \`try\`/\`finally\` whenever a script must change it.",
              "### 2. Create, scan, traverse, and remove empty directories",
              "\`os.makedirs(path, exist_ok=True)\` creates missing parent directories. \`os.scandir()\` yields \`DirEntry\` objects; their \`is_file()\`, \`is_dir()\`, and \`stat()\` methods can use cached information, making them efficient when you need metadata while iterating."
            ]
          },
          {
            kind: "interactive-code",
            code: `import os

workspace = os.path.abspath("os_lab_directories")
reports = os.path.join(workspace, "reports", "daily")
empty_leaf = os.path.join(workspace, "temporary", "empty")
os.makedirs(reports, exist_ok=True)
os.makedirs(empty_leaf, exist_ok=True)

report_path = os.path.join(reports, "contact-report.txt")
with open(report_path, "w", encoding="utf-8") as file:
    file.write("Contacts processed: 2\\n")

with os.scandir(reports) as entries:
    for entry in entries:
        print(entry.name, entry.is_file(), entry.stat().st_size)

for folder, directories, filenames in os.walk(workspace):
    for filename in filenames:
        print(f"Walked: {os.path.join(folder, filename)}")

os.removedirs(empty_leaf)`
          },
          {
            kind: "prose",
            body: [
              "\`os.walk()\` yields a directory path, a list of subdirectory names, and a list of filenames. \`os.removedirs(path)\` removes an empty leaf directory, then tries to remove its empty parents.",
              "### 3. Decompose paths and inspect metadata"
            ]
          },
          {
            kind: "interactive-code",
            code: `import os

workspace = os.path.abspath("os_lab_inspection")
os.makedirs(workspace, exist_ok=True)
report_path = os.path.join(workspace, "contacts.csv")

with open(report_path, "w", encoding="utf-8") as file:
    file.write("name,email\\nAri Stone,ari@example.test\\n")

head, tail = os.path.split(report_path)
root, extension = os.path.splitext(tail)
metadata = os.stat(report_path)

print(f"Exists/file/directory: {os.path.exists(report_path)}, "
      f"{os.path.isfile(report_path)}, {os.path.isdir(workspace)}")
print(f"Split: {head}, {tail}, {root}, {extension}")
print(f"Name/parent: {os.path.basename(report_path)}, {os.path.dirname(report_path)}")
print(f"Size: {os.path.getsize(report_path)} bytes")
print(f"Stat mode/size/modified: {metadata.st_mode}, {metadata.st_size}, {metadata.st_mtime}")`
          },
          {
            kind: "prose",
            body: [
              "\`getsize()\`, \`getmtime()\`, and \`getctime()\` return a size in bytes and timestamps in seconds. \`os.stat()\` returns one \`stat_result\` with fields including \`st_mode\`, \`st_size\`, and \`st_mtime\`.",
              "### 4. Secure and update files predictably",
              "On POSIX systems, octal permission modes describe owner, group, and others (e.g., \`0o644\` for normal files, \`0o755\` for executables, \`0o600\` for private files)."
            ]
          },
          {
            kind: "interactive-code",
            code: `import os

workspace = os.path.abspath("os_lab_updates")
os.makedirs(workspace, exist_ok=True)

temporary_config = os.path.join(workspace, "settings.tmp")
config_path = os.path.join(workspace, "settings.json")
draft_log = os.path.join(workspace, "run.log")
archived_log = os.path.join(workspace, "run-archived.log")

with open(temporary_config, "w", encoding="utf-8") as file:
    file.write('{"version": 1}\\n')
os.replace(temporary_config, config_path)

with open(draft_log, "w", encoding="utf-8") as file:
    file.write("Contact export completed\\n")
os.rename(draft_log, archived_log)

os.chmod(config_path, 0o600)
permissions = os.stat(config_path).st_mode & 0o777
print(f"Private config mode: {oct(permissions)}")`
          },
          {
            kind: "prose",
            body: [
              "\`os.replace(source, destination)\` is the right choice when your code deliberately replaces an existing destination.",
              "### 5. Delete narrowly and deliberately"
            ]
          },
          {
            kind: "interactive-code",
            code: `import os
import shutil

workspace = os.path.abspath("os_lab_cleanup")
empty_directory = os.path.join(workspace, "empty")
temporary_file = os.path.join(workspace, "contacts.tmp")
os.makedirs(empty_directory, exist_ok=True)

with open(temporary_file, "w", encoding="utf-8") as file:
    file.write("temporary data\\n")

os.unlink(temporary_file)
os.rmdir(empty_directory)

with open(os.path.join(workspace, "final.tmp"), "w", encoding="utf-8") as file:
    file.write("more temporary data\\n")
os.remove(os.path.join(workspace, "final.tmp"))

shutil.rmtree(workspace)`
          },
          {
            kind: "prose",
            body: [
              "\`shutil.rmtree()\` recursively removes a directory tree, including its contents, so use it only with a precise, controlled path.",
              "Avoid broad paths, unvalidated user input, and current-directory shortcuts such as \`\".\"\` in cleanup code."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "This complete workflow expands a workspace from the environment, creates and scans files, inspects a config file, secures it, performs an atomic update, traverses the tree, and removes only the workspace it created."
            ]
          },
          {
            kind: "interactive-code",
            code: `import os
import shutil

starting_directory = os.getcwd()
os.environ["PROJECT_DIR"] = os.path.join(starting_directory, "stackblueprint_os_lab")
workspace = os.path.abspath(os.path.expandvars("$PROJECT_DIR"))
home_directory = os.path.expanduser("~")

if os.path.basename(workspace) != "stackblueprint_os_lab":
    raise RuntimeError("Refusing to use an unexpected workspace path.")

config_directory = os.path.join(workspace, "config")
logs_directory = os.path.join(workspace, "logs")
empty_leaf = os.path.join(workspace, "temporary", "empty")
os.makedirs(config_directory, exist_ok=True)
os.makedirs(logs_directory, exist_ok=True)
os.makedirs(empty_leaf, exist_ok=True)

try:
    os.chdir(workspace)
    config_path = os.path.join("config", "settings.json")
    temporary_config = os.path.join("config", "settings.tmp")
    log_path = os.path.join("logs", "run.log")
    archived_log = os.path.join("logs", "run-archived.log")

    with open(temporary_config, "w", encoding="utf-8") as file:
        file.write('{"version": 1, "export_folder": "data"}\\n')
    os.replace(temporary_config, config_path)

    with open(log_path, "w", encoding="utf-8") as file:
        file.write("Contact export completed\\n")
    os.rename(log_path, archived_log)

    os.chmod(config_path, 0o600)
    head, tail = os.path.split(config_path)
    root, extension = os.path.splitext(tail)
    metadata = os.stat(config_path)

    print(f"Path pieces: {head}, {root}, {extension}")
    print(f"Name/parent: {os.path.basename(config_path)}, {os.path.dirname(config_path)}")
    print(f"Exists/file/directory: {os.path.exists(config_path)}, {os.path.isfile(config_path)}")
    print(f"Stat: {metadata.st_size}, {metadata.st_mtime}, {oct(metadata.st_mode & 0o777)}")

    with os.scandir("config") as entries:
        for entry in entries:
            print(f"Scanned: {entry.name}, file={entry.is_file()}, size={entry.stat().st_size}")

    for folder, _, filenames in os.walk(workspace):
        for filename in filenames:
            print(f"Walked: {os.path.join(folder, filename)}")
finally:
    os.chdir(starting_directory)

os.unlink(os.path.join(workspace, archived_log))
os.unlink(os.path.join(workspace, config_path))
os.removedirs(empty_leaf)
shutil.rmtree(workspace)
print(f"Workspace removed: {not os.path.exists(workspace)}")`
          },
          {
            kind: "takeaways",
            items: [
              "Use environment expansion and \`os.path.join()\` instead of hard-coded machine paths.",
              "\`scandir()\`, \`os.path\`, and \`stat()\` provide different levels of filesystem inspection.",
              "Use \`os.replace()\` for deliberate file replacement and \`chmod()\` for POSIX permission bits.",
              "Keep cleanup narrow: unlink known files, remove known empty directories, and reserve \`shutil.rmtree()\` for controlled workspaces.",
              "Never change the working directory without saving and restoring it with a \`try\`/\`finally\` block."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "os-1",
                question: "What does os.scandir() yield?",
                options: ["Strings representing file names", "DirEntry objects that can report type information and metadata", "A list of files and folders"],
                correctIndex: 1,
                explanation: "os.scandir() is efficient because it yields DirEntry objects that often contain cached metadata like size and file type."
              },
              {
                id: "os-2",
                question: "Which mode limits a private file to its owner?",
                options: ["0o755", "0o644", "0o600"],
                correctIndex: 2,
                explanation: "0o600 gives the owner read/write permissions and prevents all access for the group and others."
              },
              {
                id: "os-3",
                question: "When should you prefer os.replace() to os.rename()?",
                options: ["When renaming directories", "When your code intentionally replaces an existing destination file", "When working on Windows only"],
                correctIndex: 1,
                explanation: "os.replace() safely overwrites the destination file atomically (if they are on the same filesystem), whereas os.rename() can throw an error if the destination exists on some platforms."
              }
            ]
          }
        ]
      },

            {
        slug: "working-with-csv",
        title: "Working with CSV",
        subtitle: "Exchange rows with CSV.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "CSV is a common handoff format for spreadsheets, databases, and vendor tools. It is simple enough to open in a text editor, but real values can contain commas, quotes, or line breaks. Let Python's \`csv\` module handle those details.",
              "Production CSV work also needs a clear file contract: expected columns, encoding, newline handling, and a useful failure when input is malformed."
            ]
          },
          {
            kind: "animation",
            variant: "working-with-csv",
            caption: "CSV Validation & Safe Exports"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "\`csv.DictWriter\` writes dictionaries using a declared column order. \`csv.DictReader\` reads a header row and returns each record as a dictionary. Always open a CSV file with \`newline=\"\"\` and a deliberate encoding such as UTF-8.",
              "CSV contains text. Validate and convert values after reading it. For example, an email column may be empty, and a numeric-looking value is still a string until your code turns it into a number."
            ]
          },
          {
            kind: "prose",
            heading: "Step-by-step",
            body: [
              "### 1. Create a complete CSV fixture"
            ]
          },
          {
            kind: "interactive-code",
            code: `import csv
from pathlib import Path

path = Path("data/contacts.csv")
path.parent.mkdir(parents=True, exist_ok=True)

fieldnames = ["name", "email", "note"]
contacts = [
    {"name": "Ari Stone", "email": "ari@example.test", "note": "Met at the library"},
    {"name": "Lee Park", "email": "lee@example.test", "note": "Calls, not email"},
]

with path.open("w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=fieldnames, extrasaction="raise")
    writer.writeheader()
    writer.writerows(contacts)

print(f"Created: {path.resolve()}")`
          },
          {
            kind: "prose",
            body: [
              "The code creates \`data\` before writing the file, so it can run from a new browser session. \`extrasaction=\"raise\"\` catches an unexpected dictionary key instead of quietly dropping it. The \`csv\` module quotes Lee's comma-containing note correctly.",
              "### 2. Read and validate the file contract"
            ]
          },
          {
            kind: "interactive-code",
            code: `import csv
from pathlib import Path

path = Path("data/contacts.csv")

required_fields = {"name", "email", "note"}
with path.open(newline="", encoding="utf-8") as file:
    reader = csv.DictReader(file)
    if reader.fieldnames is None or set(reader.fieldnames) != required_fields:
        raise ValueError("CSV must contain name, email, and note columns.")

    for line_number, contact in enumerate(reader, start=2):
        if not contact["email"]:
            raise ValueError(f"Missing email on CSV line {line_number}.")
        print(contact["name"], contact["email"])`
          },
          {
            kind: "prose",
            body: [
              "It checks the header and the one required value for this small contact export. In production, define the contract with the team or system that supplies the file, rather than guessing its columns.",
              "### 3. Read rows as a stream and report parse failures"
            ]
          },
          {
            kind: "interactive-code",
            code: `import csv
from pathlib import Path

path = Path("data/contacts.csv")

try:
    with path.open(newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file, strict=True)
        for contact in reader:
            print(contact["name"])
except csv.Error as error:
    raise ValueError(f"Could not parse {path}: {error}") from error`
          },
          {
            kind: "prose",
            body: [
              "\`DictReader\` yields one row at a time, so this pattern can handle a large export without loading every record into memory. \`strict=True\` asks the parser to report malformed CSV rather than accepting it quietly."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "Write a new export to a temporary file, then replace the final file only after the write finishes:"
            ]
          },
          {
            kind: "interactive-code",
            code: `import csv
from pathlib import Path

output_path = Path("data/contacts.csv")
output_path.parent.mkdir(parents=True, exist_ok=True)
temporary_path = output_path.with_suffix(".tmp")

contacts = [
    {"name": "Ari Stone", "email": "ari@example.test", "note": "Practice export"},
]

with temporary_path.open("w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=["name", "email", "note"])
    writer.writeheader()
    writer.writerows(contacts)

temporary_path.replace(output_path)

with output_path.open(newline="", encoding="utf-8") as file:
    print(list(csv.DictReader(file)))`
          },
          {
            kind: "prose",
            body: [
              "The temporary file is fully written before \`replace()\` puts it at the final path. This reduces the chance that a reader sees a half-written export."
            ]
          },
          {
            kind: "takeaways",
            items: [
              "Treat a CSV's headers and required values as a contract.",
              "Open CSV files with UTF-8 and \`newline=\"\"\`.",
              "Write a complete temporary export before replacing the final path."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "csv-1",
                question: "What creates a CSV header row?",
                options: ["writer.writeheader()", "csv.headers()", "DictWriter automatically writes them"],
                correctIndex: 0,
                explanation: "writer.writeheader() explicitly writes the column names from fieldnames to the file."
              },
              {
                id: "csv-2",
                question: "Why use newline=\"\" when opening a CSV file?",
                options: ["It removes all newlines from the file", "It lets the csv module handle CSV line endings correctly", "It makes the file read faster"],
                correctIndex: 1,
                explanation: "It lets the csv module handle CSV line endings correctly, preventing extra blank lines on Windows."
              },
              {
                id: "csv-3",
                question: "What does DictReader return for each row?",
                options: ["A string of comma-separated values", "A list of strings", "A dictionary keyed by the header names"],
                correctIndex: 2,
                explanation: "A dictionary keyed by the header names, allowing you to access columns by name."
              }
            ]
          }
        ]
      },

            {
        slug: "working-with-json",
        title: "Working with JSON",
        subtitle: "Safely load and validate configuration data.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "JSON is a readable format for settings, web responses, and nested application data. It is a good fit for non-secret configuration such as an export folder or selected columns.",
              "Treat a JSON file as input from outside your program, even when you created it. It can be missing, malformed, or have the wrong shape."
            ]
          },
          {
            kind: "animation",
            variant: "working-with-json",
            caption: "JSON Validation & Safe Configuration"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "\`json.dump()\` writes a Python value to an open file, and \`json.load()\` reads one back. The string-based counterparts are \`dumps()\` and \`loads()\`.",
              "JSON can represent objects, lists, strings, numbers, booleans, and null. It cannot safely hold secrets by itself. Keep API keys, passwords, and database URLs in environment variables or a managed secret store."
            ]
          },
          {
            kind: "prose",
            heading: "Step-by-step",
            body: [
              "### 1. Create a versioned settings file"
            ]
          },
          {
            kind: "interactive-code",
            code: `import json
from pathlib import Path

path = Path("data/settings.json")
path.parent.mkdir(parents=True, exist_ok=True)

settings = {
    "version": 1,
    "export_folder": "data/exports",
    "columns": ["name", "email"],
}

with path.open("w", encoding="utf-8") as file:
    json.dump(settings, file, indent=2, ensure_ascii=False, sort_keys=True)

print(path.read_text(encoding="utf-8"))`
          },
          {
            kind: "prose",
            body: [
              "The code creates \`data\` and writes the JSON before reading it back for display. \`indent=2\` makes the file reviewable; \`sort_keys=True\` makes its order stable in diffs.",
              "### 2. Load and validate the expected shape"
            ]
          },
          {
            kind: "interactive-code",
            code: `import json
from pathlib import Path

path = Path("data/settings.json")

try:
    with path.open(encoding="utf-8") as file:
        settings = json.load(file)
except json.JSONDecodeError as error:
    raise ValueError(f"Invalid JSON in {path}: {error.msg}") from error

if not isinstance(settings, dict):
    raise ValueError("Settings must be a JSON object.")
if settings.get("version") != 1:
    raise ValueError("Unsupported settings version.")
if not isinstance(settings.get("columns"), list):
    raise ValueError("Settings columns must be a list.")

print(settings["export_folder"])`
          },
          {
            kind: "prose",
            body: [
              "Loading only proves the text is valid JSON. Validation confirms it has the structure your program expects. Keep error messages useful, but do not include sensitive values.",
              "### 3. Replace a settings file after a complete write"
            ]
          },
          {
            kind: "interactive-code",
            code: `import json
from pathlib import Path

path = Path("data/settings.json")

with path.open(encoding="utf-8") as file:
    settings = json.load(file)

settings["columns"].append("email")
temporary_path = path.with_suffix(".tmp")

with temporary_path.open("w", encoding="utf-8") as file:
    json.dump(settings, file, indent=2, ensure_ascii=False, sort_keys=True)

temporary_path.replace(path)

with path.open(encoding="utf-8") as file:
    print(json.load(file))`
          },
          {
            kind: "prose",
            body: [
              "This example writes the update to a temporary path before replacing the final path. Keep the temporary file in the same folder so the replacement uses the same filesystem."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "This complete configuration workflow writes default settings, loads them, validates them, and then prints one approved value:"
            ]
          },
          {
            kind: "interactive-code",
            code: `import json
from pathlib import Path

path = Path("data/contact_settings.json")
path.parent.mkdir(parents=True, exist_ok=True)

defaults = {
    "version": 1,
    "export_folder": "data/exports",
    "include_notes": True,
}

with path.open("w", encoding="utf-8") as file:
    json.dump(defaults, file, indent=2, sort_keys=True)

with path.open(encoding="utf-8") as file:
    settings = json.load(file)

if settings.get("version") != 1 or not isinstance(settings.get("include_notes"), bool):
    raise ValueError("Settings file has an unsupported format.")

print(f"Exports will go to: {settings['export_folder']}")`
          },
          {
            kind: "prose",
            body: [
              "In an application, you might write defaults only on first run and preserve existing user settings."
            ]
          },
          {
            kind: "takeaways",
            items: [
              "JSON works well for readable, non-secret structured configuration.",
              "Loading and validating are separate steps.",
              "Use a temporary file before replacing an existing config."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "json-1",
                question: "Which function writes JSON to an open file?",
                options: ["json.dump()", "json.dumps()", "json.write()"],
                correctIndex: 0,
                explanation: "json.dump() writes to an open file, while json.dumps() returns a string."
              },
              {
                id: "json-2",
                question: "Which exception identifies malformed JSON?",
                options: ["ValueError", "json.JSONDecodeError", "SyntaxError"],
                correctIndex: 1,
                explanation: "json.JSONDecodeError is raised when json.load() fails to parse the string."
              },
              {
                id: "json-3",
                question: "Why is it important to validate JSON after loading it?",
                options: ["Because loading doesn't check if the JSON matches your expected schema/types.", "Because loading doesn't parse it into Python objects.", "Because load() returns a string."],
                correctIndex: 0,
                explanation: "load() only verifies it is valid JSON. It does not check if it has the right keys or value types (e.g., list vs dict) your program needs."
              }
            ]
          }
        ]
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
