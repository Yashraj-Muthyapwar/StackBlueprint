import { type LessonContent } from "@/lessons/types";

import howItWorksImg from "@/images/python/intermediate/file_handling/how-python-works-with-file.png";
import filePathsImg from "@/images/python/intermediate/file_handling/file-paths.png";
import fileReadImg from "@/images/python/intermediate/file_handling/file-read.png";
import fileWriteImg from "@/images/python/intermediate/file_handling/file-write.png";
import fileModesImg from "@/images/python/intermediate/file_handling/file-modes.png";
import fileMethodsImg from "@/images/python/intermediate/file_handling/file-methods.png";
import pickleOrAnotherFormatImg from "@/images/python/intermediate/file_handling/pickle-or-another-format.png";
import pickleProductionConsiderationsImg from "@/images/python/intermediate/file_handling/pickle-production-considerations.png";

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
              "This small file-processing workflow puts the main OS concepts together: it creates a workspace, builds paths, creates and inspects files, recursively explores the directory tree, reads an environment variable, moves a processed file, and cleans up the workspace."
            ]
          },
          {
            kind: "callout",
            tone: "info",
            title: "Memorize this workflow, not every function.",
            body: "**CREATE → WRITE → INSPECT → WALK → MOVE → CONFIG → CLEAN UP**\n\nThese are the OS/file-system patterns you'll repeatedly encounter when Python works with real files and directories."
          },
          {
            kind: "interactive-code",
            code: `import os
import shutil

# A small file-processing workspace
workspace = "stackblueprint_os_lab"
input_dir = os.path.join(workspace, "input")
output_dir = os.path.join(workspace, "output")

# CREATE — make the folders we need
os.makedirs(input_dir, exist_ok=True)
os.makedirs(output_dir, exist_ok=True)

# WRITE — create a few sample files
for filename in ["customers.csv", "orders.csv", "products.csv"]:
    path = os.path.join(input_dir, filename)

    with open(path, "w", encoding="utf-8") as file:
        file.write("sample data\\n")

# INSPECT — work with paths and file information
for entry in os.scandir(input_dir):
    print(
        entry.name,
        "| file:", entry.is_file(),
        "| size:", entry.stat().st_size, "bytes"
    )

# WALK — recursively find every file in the workspace
print("\\nAll files:")
for root, _, files in os.walk(workspace):
    for filename in files:
        print(os.path.join(root, filename))

# MOVE — simulate processing a file
source = os.path.join(input_dir, "customers.csv")
destination = os.path.join(output_dir, "customers.csv")

os.replace(source, destination)

# ENVIRONMENT — read configuration supplied by the system
environment = os.getenv("APP_ENV", "development")
print("\\nEnvironment:", environment)

# CLEAN UP — remove the workspace created by this example
shutil.rmtree(workspace)
print("Workspace removed:", not os.path.exists(workspace))`
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
        slug: "working-with-json",
        title: "Working with JSON",
        subtitle: "Safely load, validate, update, and stream JSON data.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "JSON is the common language of web APIs, configuration files, data exports, and messages between services. A Python program might load application settings from JSON in the morning, receive an API response at noon, and write a JSON export in the afternoon.",
              "JSON is readable and language-neutral, but a JSON file is still external input. It can be missing, malformed, truncated after a failed write, or syntactically valid while having the wrong structure. Reliable code distinguishes those cases, validates data at the boundary, and writes important updates safely.",
              "Use JSON for non-secret structured data such as settings, report metadata, and API payloads. Do not store passwords, API keys, database URLs, or access tokens in committed JSON files. Keep secrets in environment variables or a managed secret store."
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
              "Python's standard-library `json` module translates between JSON text and ordinary Python values."
            ]
          },
          {
            kind: "table",
            headers: ["JSON", "Python after decoding", "Notes"],
            rows: [
              ["object", "`dict`", "JSON object keys are always strings."],
              ["array", "`list`", "A JSON array always becomes a list, not a tuple."],
              ["string", "`str`", "Unicode text is supported."],
              ["number without a decimal point", "`int`", "Python integers have arbitrary precision."],
              ["number with a decimal point or exponent", "`float`", "Use `Decimal` when exact money values matter."],
              ["`true` / `false`", "`True` / `False`", "JSON uses lowercase; Python uses capitalized names."],
              ["`null`", "`None`", "Represents an intentional missing value."]
            ]
          },
          {
            kind: "prose",
            body: [
              "The four core functions differ only by where text comes from or goes to:"
            ]
          },
          {
            kind: "table",
            headers: ["You have / need", "Parse JSON into Python", "Encode Python as JSON"],
            rows: [
              ["A string", "`json.loads(text)`", "`json.dumps(data)` returns a string"],
              ["An open text file", "`json.load(file)`", "`json.dump(data, file)` writes to the file"]
            ]
          },
          {
            kind: "prose",
            body: [
              "`loads` means “load string,” and `dumps` means “dump string.”",
              "### 1. Start with JSON text",
              "Use `json.loads()` when JSON already lives in a string, such as an HTTP response body. Once parsed, work with normal Python dictionaries and lists."
            ]
          },
          {
            kind: "interactive-code",
            code: `import json

# Imagine this came from an API response.
json_text = '{"name": "Ari Stone", "age": 28, "active": true}'

# Convert JSON text to a Python object.
data = json.loads(json_text)

print(data)
print(data["name"])
print(type(data))`
          },
          {
            kind: "prose",
            body: [
              "JSON is stricter than Python syntax: object keys and strings use double quotes, booleans are `true` and `false`, and the null value is `null`. Do not use `eval()` to parse JSON; `json.loads()` is designed for this format and reports useful parse errors.",
              "Use `json.dumps()` when you need JSON text in memory:"
            ]
          },
          {
            kind: "interactive-code",
            code: `import json

data = {
    "name": "Ari Stone",
    "age": 28,
    "active": True,
}

# Convert a Python object to JSON text.
json_text = json.dumps(data, indent=2)

print(json_text)
print(type(json_text))`
          },
          {
            kind: "prose",
            body: [
              "### 2. Read and write a JSON file",
              "Use `json.dump()` and `json.load()` with an open text file. Specify `encoding=\"utf-8\"` so names and other non-ASCII text are handled consistently across operating systems."
            ]
          },
          {
            kind: "interactive-code",
            code: `import json
from pathlib import Path

path = Path("json_lab/settings.json")
path.parent.mkdir(parents=True, exist_ok=True)

settings = {
    "version": 1,
    "export_folder": "data/exports",
    "columns": ["name", "email"],
}

with path.open("w", encoding="utf-8") as file:
    json.dump(settings, file, indent=2, ensure_ascii=False, sort_keys=True)

with path.open(encoding="utf-8") as file:
    loaded_settings = json.load(file)

print(loaded_settings["export_folder"])`
          },
          {
            kind: "prose",
            body: [
              "A regular JSON file contains one complete value: one object, one array, one string, and so on. `json.load()` reads and parses that entire value in memory, so it is a great fit for settings and small to medium documents. Use JSON Lines later in this lesson when records are too large to load all at once.",
              "### 3. Choose readable or compact output",
              "Formatting is a choice based on the reader. Use indented output for configuration that people review. Use compact output for a network payload or a space-sensitive field."
            ]
          },
          {
            kind: "interactive-code",
            code: `import json

customer = {
    "name": "Ana García",
    "status": "active",
    "contact_count": 12,
}

pretty = json.dumps(customer, indent=2, sort_keys=True, ensure_ascii=False)
compact = json.dumps(customer, separators=(",", ":"), sort_keys=True, ensure_ascii=False)

print(pretty)
print(compact)`
          },
          {
            kind: "prose",
            body: [
              "`indent=2` adds whitespace for people. `sort_keys=True` produces a stable key order, which makes diffs and tests easier to read. `separators=(\",\", \":\")` removes optional spaces. `ensure_ascii=False` keeps UTF-8 characters readable instead of escaping them.",
              "Python can encode `NaN`, `Infinity`, and `-Infinity` by default even though strict JSON consumers may reject them. Use `allow_nan=False` when you need standards-compliant JSON:"
            ]
          },
          {
            kind: "interactive-code",
            code: `import json

json_text = json.dumps({"score": 9.5}, allow_nan=False)
print(json_text)`
          },
          {
            kind: "prose",
            body: [
              "### 4. Handle missing files, bad JSON, and wrong shapes",
              "A JSON configuration can fail in three different ways:",
              "- **Missing file** → the application may need to create defaults.",
              "- **Bad JSON** → the file exists, but its syntax is invalid.",
              "- **Wrong shape** → the JSON is valid, but its structure or values are not what the application expects."
            ]
          },
          {
            kind: "interactive-code",
            code: `import json
from pathlib import Path


def validate_settings(settings):
    """Check that valid JSON also has the shape our app expects."""
    if not isinstance(settings, dict):
        raise ValueError("Settings must be a JSON object.")

    if type(settings.get("version")) is not int or settings["version"] != 1:
        raise ValueError("Settings must use version 1.")

    if not isinstance(settings.get("export_folder"), str):
        raise ValueError("export_folder must be a string.")

    columns = settings.get("columns")

    if not isinstance(columns, list):
        raise ValueError("columns must be a list.")

    if not all(isinstance(column, str) for column in columns):
        raise ValueError("columns must contain strings.")

    return settings


def load_settings(path):
    try:
        # File → Python object
        with path.open(encoding="utf-8") as file:
            settings = json.load(file)

        # Valid JSON still needs application validation.
        return validate_settings(settings)

    except FileNotFoundError:
        # The file does not exist, so use known defaults.
        return {
            "version": 1,
            "export_folder": "data/exports",
            "columns": ["name", "email"],
        }

    except json.JSONDecodeError as error:
        # The file exists, but its JSON syntax is broken.
        raise ValueError(
            f"Invalid JSON at line {error.lineno}, "
            f"column {error.colno}: {error.msg}"
        ) from error


settings = load_settings(Path("settings.json"))
print(settings)`
          },
          {
            kind: "prose",
            body: [
              "`json.load()` can fail because the file is missing or because its JSON syntax is invalid. Even when parsing succeeds, the resulting Python data can still have the wrong structure, so validate it before using it.",
              "Why `type(...) is int`? Python treats `True` and `False` as instances of `int`. Using `type(value) is int` ensures the version must be an actual integer, not a boolean."
            ]
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Warning",
            body: "Do not silently replace malformed JSON with defaults. A missing file can reasonably trigger defaults, but malformed JSON may contain recoverable information and should usually be surfaced as an error."
          },
          {
            kind: "prose",
            body: [
              "### 5. Write complete updates, then replace the old file",
              "When updating an important JSON file, avoid writing directly to the final file. If the program stops halfway through the write, the file could be left incomplete."
            ]
          },
          {
            kind: "interactive-code",
            code: `import json
from pathlib import Path


def write_json_safely(path, data):
    """Write the complete JSON before replacing the real file."""
    path.parent.mkdir(parents=True, exist_ok=True)

    # Create the temporary file beside the real file.
    temp_path = path.with_name(f".{path.name}.tmp")

    try:
        # Python object → temporary JSON file
        with temp_path.open("w", encoding="utf-8") as file:
            json.dump(
                data,
                file,
                indent=2,
                ensure_ascii=False,
                sort_keys=True,
                allow_nan=False,
            )

        # The new file is complete, so replace the old one.
        temp_path.replace(path)

    except Exception:
        # Remove the temporary file if something went wrong.
        temp_path.unlink(missing_ok=True)
        raise


settings = {
    "version": 1,
    "export_folder": "data/exports",
    "columns": ["name", "email", "phone"],
}

settings_path = Path("json_lab/settings.json")

# Write the configuration safely.
write_json_safely(settings_path, settings)

# Read it back so we can verify the result.
with settings_path.open(encoding="utf-8") as file:
    saved_settings = json.load(file)

print("File written:", settings_path)
print("Saved settings:")
print(json.dumps(saved_settings, indent=2))`
          },
          {
            kind: "prose",
            body: [
              "The important pattern is write first, replace second. The temporary file is kept in the same directory so the replacement happens on the same filesystem. `Path.replace()` overwrites the destination, so use it only when the destination is a precise path your program controls."
            ]
          },
          {
            kind: "callout",
            tone: "info",
            title: "Important",
            body: "Atomic replacement helps prevent readers from seeing a partially written file. It does not provide file locking, multi-process coordination, or guaranteed durability after a power failure."
          },
          {
            kind: "prose",
            body: [
              "### 6. Convert Python-only values deliberately",
              "JSON has a small set of built-in types, while Python has many more. When you need to serialize values such as `datetime` or `Decimal`, you must choose a JSON representation for them.",
              "For example, an application might represent a timestamp as an ISO 8601 string and an exact monetary value as a string."
            ]
          },
          {
            kind: "interactive-code",
            code: `import json
from datetime import datetime
from decimal import Decimal


def serialize(value):
    """Convert Python-only values into JSON-friendly values."""
    if isinstance(value, datetime):
        return value.isoformat()

    if isinstance(value, Decimal):
        return str(value)

    raise TypeError(
        f"Cannot encode {type(value).__name__} as JSON"
    )


report = {
    "created_at": datetime(2026, 8, 24, 9, 30),
    "total": Decimal("89.97"),
}

# default= is called when the JSON encoder
# encounters a value it does not understand.
json_text = json.dumps(
    report,
    default=serialize,
    indent=2,
)

print(json_text)`
          },
          {
            kind: "prose",
            body: [
              "The conversion is a data contract. If a `Decimal` becomes a string when written, the reader needs to know that this field represents an exact decimal amount.",
              "`default=` is called only for values the JSON encoder does not already understand. The function must return another JSON-compatible value or raise `TypeError`.",
              "For `Decimal`, converting to a string preserves the exact value; converting to a floating-point number can introduce rounding."
            ]
          },
          {
            kind: "prose",
            body: [
              "### 7. Customize JSON decoding",
              "Sometimes you want JSON values to become more specific Python types when they are decoded. For example, `parse_float=Decimal` preserves decimal values, while `object_hook` can transform a known JSON object into richer Python values."
            ]
          },
          {
            kind: "interactive-code",
            code: `import json
from datetime import datetime
from decimal import Decimal


def parse_event(value):
    """Convert our known event format into Python objects."""
    if value.get("_type") == "export_event":
        value["created_at"] = datetime.fromisoformat(
            value["created_at"]
        )

    return value


json_text = """
{
    "_type": "export_event",
    "created_at": "2026-08-24T09:30:00",
    "total": 89.97
}
"""

event = json.loads(
    json_text,
    object_hook=parse_event,
    parse_float=Decimal,
)

print(event)
print("created_at:", type(event["created_at"]).__name__)
print("total:", type(event["total"]).__name__)`
          },
          {
            kind: "prose",
            body: [
              "`parse_float` customizes how JSON numbers are decoded, while `object_hook` can transform decoded objects. Use these techniques when you control the JSON format and have a clear data contract."
            ]
          },
          {
            kind: "prose",
            body: [
              "### 8. Stream records with JSON Lines",
              "Regular JSON represents one complete document, while JSON Lines (JSONL / NDJSON) stores one independent JSON value per line. This makes JSONL useful for logs, events, and large exports that can be processed one record at a time."
            ]
          },
          {
            kind: "interactive-code",
            code: `import json
from pathlib import Path

path = Path("json_lab/contact-events.jsonl")
path.parent.mkdir(parents=True, exist_ok=True)

events = [
    {"event": "export_started", "count": 0},
    {"event": "contact_processed", "count": 1},
    {"event": "export_finished", "count": 3},
]

# WRITE: store one independent JSON record per line.
with path.open("w", encoding="utf-8") as file:
    for event in events:
        file.write(json.dumps(event, separators=(",", ":")) + "\\n")

# READ: process one record at a time instead of loading
# the entire collection into memory.
with path.open(encoding="utf-8") as file:
    for line in file:
        if not line.strip():
            continue

        event = json.loads(line)

        # Imagine doing some real processing here.
        print("Processed:", event["event"])

# Show what was actually written to the JSONL file.
print("\\nJSONL file:")
print(path.read_text(encoding="utf-8"))`
          },
          {
            kind: "prose",
            body: [
              "Each line is a complete JSON value, so records can be written and processed independently. This makes JSONL a useful format for logs, events, append-only data, and large collections where loading everything into memory at once is undesirable."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "This complete workflow creates a clean browser-safe workspace, writes default settings, loads and validates them, makes a safe update, and records an audit event as JSON Lines."
            ]
          },
          {
            kind: "interactive-code",
            code: `import json
from datetime import datetime
from pathlib import Path


def validate_settings(settings):
    """
    JSON syntax can be valid while the application's data is wrong.
    Check that the configuration has the structure we expect.
    """
    if not isinstance(settings, dict):
        raise ValueError("Settings must be a JSON object.")

    if settings.get("version") != 1:
        raise ValueError("Unsupported settings version.")

    if not isinstance(settings.get("export_folder"), str):
        raise ValueError("export_folder must be a string.")

    if not isinstance(settings.get("columns"), list):
        raise ValueError("columns must be a list.")

    if not all(isinstance(column, str) for column in settings["columns"]):
        raise ValueError("columns must contain strings.")

    return settings


def save_json(path, data):
    """
    Write the complete JSON to a temporary file first,
    then replace the real file.
    """
    temp_path = path.with_name(f".{path.name}.tmp")

    with temp_path.open("w", encoding="utf-8") as file:
        json.dump(
            data,
            file,
            indent=2,
            sort_keys=True,
            ensure_ascii=False,
            allow_nan=False,
        )

    temp_path.replace(path)


# 1. Set up
# Create the workspace used by our small application.
workspace = Path("json_lab")
settings_path = workspace / "contact_settings.json"
events_path = workspace / "events.jsonl"

workspace.mkdir(exist_ok=True)

# Pyodide can keep files between runs, so start clean.
for path in (settings_path, events_path):
    path.unlink(missing_ok=True)


# 2. Create default settings
# This is a normal Python dictionary.
settings = {
    "version": 1,
    "export_folder": "data/exports",
    "columns": ["name", "email"],
}

# Python object -> JSON file
save_json(settings_path, settings)


# 3. Load and validate
# JSON file -> Python dictionary

try:
    with settings_path.open(encoding="utf-8") as file:
        settings = validate_settings(json.load(file))
except json.JSONDecodeError as error:
    raise ValueError(f"Invalid JSON: {error.msg}") from error


# 4. Update and save
# After json.load(), this is just a normal Python dictionary.
if "phone" not in settings["columns"]:
    settings["columns"].append("phone")

    # Save the updated configuration safely.
    save_json(settings_path, settings)


# 5. Record what happened
# JSONL is useful for independent events that can be appended.
event = {
    "event": "settings_updated",
    "created_at": datetime.now().isoformat(timespec="seconds"),
    "column_count": len(settings["columns"]),
}

# Python dictionary -> JSON text -> one JSONL record
with events_path.open("a", encoding="utf-8") as file:
    file.write(json.dumps(event, separators=(",", ":")) + "\\n")


# 6. Use the approved configuration
print("Export folder:", settings["export_folder"])
print("Columns:", settings["columns"])
print("Event:", event)`
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "**Confusing `load()` with `loads()`:** `load()` reads an open file; `loads()` parses a string. The `dump` functions follow the same file-versus-string pattern.\n\n**Using Python syntax inside JSON:** JSON needs double-quoted keys and strings, lowercase `true`/`false`, and `null` instead of `None`.\n\n**Treating valid JSON as valid configuration:** Parse errors and schema errors are different. Check required keys, types, versions, and nested values after loading.\n\n**Silently overwriting malformed JSON with defaults:** Surface the error so the source file can be fixed or recovered.\n\n**Writing an important final file directly:** Write a complete temporary file, then replace the controlled destination.\n\n**Encoding Python-only objects by accident:** Convert `datetime`, `Decimal`, `Path`, and `set` to an explicit JSON representation.\n\n**Loading a huge record collection as one array:** Use JSON Lines or a streaming parser when you need bounded memory.\n\n**Storing secrets in JSON:** Use environment variables or a secret manager for credentials."
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "json-v3-1",
                question: "Which function parses JSON from a string?",
                options: ["json.load()", "json.loads()", "json.parse()"],
                correctIndex: 1,
                explanation: "json.loads() parses JSON from a string (the 's' stands for string)."
              },
              {
                id: "json-v3-2",
                question: "Which function writes JSON to an open file?",
                options: ["json.dump()", "json.dumps()", "json.write()"],
                correctIndex: 0,
                explanation: "json.dump() serializes a Python object directly into an open file."
              },
              {
                id: "json-v3-3",
                question: "What Python type does a JSON array become?",
                options: ["tuple", "list", "set", "array"],
                correctIndex: 1,
                explanation: "JSON arrays are always decoded into Python lists."
              },
              {
                id: "json-v3-4",
                question: "Which exception identifies malformed JSON?",
                options: ["json.JSONDecodeError", "ValueError", "SyntaxError"],
                correctIndex: 0,
                explanation: "json.JSONDecodeError includes details about the exact line and column where parsing failed."
              },
              {
                id: "json-v3-5",
                question: "Why validate after parsing?",
                options: ["Parsing doesn't create Python objects", "Valid JSON can still have missing keys or incorrect value types", "Parsing only reads strings"],
                correctIndex: 1,
                explanation: "Syntax validation is not schema validation. You still need to ensure the structure meets your program's needs."
              },
              {
                id: "json-v3-6",
                question: "Which option makes JSON readable for a human reviewer?",
                options: ["indent=2", "readable=True", "separators=(',', ':')"],
                correctIndex: 0,
                explanation: "indent=2 formats the JSON string with 2-space indentation and newlines."
              },
              {
                id: "json-v3-7",
                question: "Which option preserves readable Unicode characters?",
                options: ["encoding='utf-8'", "ensure_ascii=False", "unicode=True"],
                correctIndex: 1,
                explanation: "ensure_ascii=False prevents json.dumps() from escaping characters into \\uXXXX sequences."
              },
              {
                id: "json-v3-8",
                question: "When is JSON Lines a better fit than a regular JSON array?",
                options: ["For large or append-only independent records", "When formatting for human review", "When creating small configuration files"],
                correctIndex: 0,
                explanation: "JSON Lines keeps memory usage low by allowing you to process one record at a time, making it ideal for large datasets or logs."
              }
            ]
          },
          {
            kind: "takeaways",
            items: [
              "JSON is a portable text format for structured, non-secret data.",
              "`load`/`dump` work with files; `loads`/`dumps` work with strings.",
              "Use UTF-8 and choose pretty or compact output deliberately.",
              "Parsing, validation, and safe writing are separate responsibilities.",
              "Convert Python-only values into a documented JSON shape.",
              "Use JSON Lines for large independent records; use a regular JSON document for small configuration trees."
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
              "CSV is the handoff format used by spreadsheets, accounting systems, supplier catalogs, database exports, and reporting tools. It looks simple, but real CSV contains commas, quotes, embedded line breaks, missing values, different encodings, and columns that change over time.",
              "Production CSV code needs more than \"read rows and write rows.\" It needs a contract: expected headers, encoding, delimiter, quoting behavior, required values, numeric conversion, and a clear policy for bad input. These are the same concerns that appear in data-import systems, ETL jobs, and interview questions about scalable data processing."
            ]
          },
          {
            kind: "animation",
            variant: "working-with-csv",
            caption: "Robust CSV Parsing & Pipelines"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "Never parse CSV with `line.split(\",\")`. A comma, quote, or newline can be part of a field. Python's built-in `csv` module implements the CSV rules for you."
            ]
          },
          {
            kind: "interactive-code",
            code: `import csv
import io

raw = '"Anker, Wireless Mouse",29.99,"She said ""great mouse"""'

print(raw.split(","))

reader = csv.reader(io.StringIO(raw))
print(next(reader))`
          },
          {
            kind: "prose",
            body: [
              "The manual split returns the wrong number of pieces. `csv.reader` returns three complete fields and unescapes the inner quotation marks.",
              "Use the `csv` interface that matches your data:"
            ]
          },
          {
            kind: "table",
            headers: ["Task", "Best tool", "Result"],
            rows: [
              ["Read positional rows", "`csv.reader`", "Each row is a `list[str]`."],
              ["Write positional rows", "`csv.writer`", "Write lists or tuples with `writerow()` / `writerows()`."],
              ["Read header-based records", "`csv.DictReader`", "Each row is a dictionary keyed by the header."],
              ["Write declared columns", "`csv.DictWriter`", "Write dictionaries in a chosen column order."]
            ]
          },
          {
            kind: "prose",
            body: [
              "CSV has no native types: every field arrives as text. Convert and validate values after reading. Always open CSV files with `newline=\"\"` and an explicit encoding. `newline=\"\"` lets the `csv` module manage row endings correctly and avoids extra blank rows on Windows.",
              "### 1. Read rows and convert types deliberately",
              "`csv.reader` is a good fit when a file has a fixed positional layout. It streams one row at a time, which keeps memory use low even for large files."
            ]
          },
          {
            kind: "interactive-code",
            code: `import csv
from decimal import Decimal
from pathlib import Path

path = Path("csv_lab/products.csv")
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(
    'product_id,name,price,stock\\n'
    'P001,"Wireless Mouse",29.99,42\\n'
    'P002,"USB-C Hub, Pro",24.50,7\\n',
    encoding="utf-8",
)

with path.open(newline="", encoding="utf-8") as file:
    reader = csv.reader(file)
    header = next(reader)
    print("Columns:", header)

    inventory_value = Decimal("0")
    for line_number, row in enumerate(reader, start=2):
        if len(row) != 4:
            raise ValueError(f"Line {line_number} must have 4 columns.")

        product_id, name, price_text, stock_text = row
        try:
            price = Decimal(price_text)
            stock = int(stock_text)
        except (ValueError, ArithmeticError) as error:
            raise ValueError(f"Invalid price or stock on line {line_number}.") from error

        inventory_value += price * stock
        print(product_id, name, price, stock)

print(f"Inventory value: \${inventory_value:.2f}")`
          },
          {
            kind: "prose",
            body: [
              "Every CSV field is text when it is read. Convert IDs, counts, dates, booleans, and prices explicitly. `Decimal` avoids the rounding surprises of binary floating-point values when the data represents money.",
              "Do not call `list(reader)` for an import that might be large. Iterate over `reader` directly so memory stays proportional to one row plus the state your transformation needs.",
              "### 2. Read named columns with a strict contract",
              "`csv.DictReader` maps each row to the field names in the header. This is safer and more readable than `row[2]`, especially when a supplier changes column order."
            ]
          },
          {
            kind: "interactive-code",
            code: `import csv
from pathlib import Path

path = Path("csv_lab/contacts.csv")
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(
    "name,email,note\\n"
    'Ari Stone,ari@example.test,"Met at the library"\\n',
    encoding="utf-8",
)

expected_fields = ["name", "email", "note"]
missing_value = object()

with path.open(newline="", encoding="utf-8") as file:
    reader = csv.DictReader(
        file,
        restkey="_extra_fields",
        restval=missing_value,
        strict=True,
    )

    if reader.fieldnames != expected_fields:
        raise ValueError(f"Expected header {expected_fields}, got {reader.fieldnames}.")

    for line_number, contact in enumerate(reader, start=2):
        if contact.get("_extra_fields"):
            raise ValueError(f"Line {line_number} has extra fields.")
        if any(contact[field] is missing_value for field in expected_fields):
            raise ValueError(f"Line {line_number} has too few fields.")
        if not contact["name"].strip() or not contact["email"].strip():
            raise ValueError(f"Line {line_number} needs a name and email.")

        print(contact["name"], contact["email"])`
          },
          {
            kind: "prose",
            body: [
              "`restkey` captures surplus columns instead of silently dropping them. `restval` marks missing columns. For an exact import contract, compare `reader.fieldnames` to the ordered expected list; if your contract allows extra columns or any order, validate that policy explicitly instead.",
              "`strict=True` asks the parser to raise `csv.Error` for malformed quoting. It does not replace schema validation, because a perfectly valid CSV row can still be missing a required business value.",
              "### 3. Write a spreadsheet-ready export",
              "`csv.DictWriter` writes dictionaries using a declared field order. `writeheader()` creates the header row; `extrasaction=\"raise\"` catches unexpected keys instead of silently omitting data."
            ]
          },
          {
            kind: "interactive-code",
            code: `import csv
from pathlib import Path

path = Path("csv_lab/contact_export.csv")
path.parent.mkdir(parents=True, exist_ok=True)

fieldnames = ["name", "email", "note"]
contacts = [
    {"name": "Ari Stone", "email": "ari@example.test", "note": "Practice export"},
    {"name": "Lee Park", "email": "lee@example.test", "note": "Calls, not email"},
]

with path.open("w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(
        file,
        fieldnames=fieldnames,
        extrasaction="raise",
        lineterminator="\\n",
    )
    writer.writeheader()
    writer.writerows(contacts)

print(path.read_text(encoding="utf-8"))`
          },
          {
            kind: "prose",
            body: [
              "The writer quotes comma-containing text and escapes embedded quotes automatically. `fieldnames` controls output order, not the order in which each dictionary was built. For a user-facing report, format values before writing: for example, use `f\"{total:.2f}\"` for a two-decimal currency value.",
              "For a CSV that people will open directly in older Windows Excel, use `encoding=\"utf-8-sig\"` on write. It adds a UTF-8 byte-order mark that helps Excel recognize non-ASCII characters. For most APIs, databases, and new files, plain `utf-8` is the best default.",
              "### 4. Adapt to delimiters, dialects, and unknown files",
              "CSV is a family of formats. A supplier may send a semicolon-separated file because commas are used as decimal marks, or a tab-separated file from a legacy system. Pin the format for known partners."
            ]
          },
          {
            kind: "interactive-code",
            code: `import csv
from decimal import Decimal
from pathlib import Path

path = Path("csv_lab/eu_products.csv")
path.parent.mkdir(parents=True, exist_ok=True)

with path.open("w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file, delimiter=";", quotechar='"')
    writer.writerow(["product_id", "name", "price"])
    writer.writerow(["P001", "Wireless Mouse", "19,99"])

with path.open(newline="", encoding="utf-8") as file:
    reader = csv.DictReader(file, delimiter=";")
    for row in reader:
        price = Decimal(row["price"].replace(",", "."))
        print(row["name"], price)`
          },
          {
            kind: "prose",
            body: [
              "`csv.Sniffer` can guess a delimiter and whether a header is present, but it is a heuristic. Use it for one-off, user-uploaded files after giving the user a chance to confirm the result; do not use it as the source of truth for a known production feed."
            ]
          },
          {
            kind: "interactive-code",
            code: `import csv

sample = "product_id;name;price\\nP001;Mouse;19,99\\nP002;Hub;24,50\\n"
sniffer = csv.Sniffer()
dialect = sniffer.sniff(sample, delimiters=",;\\t|")

print(repr(dialect.delimiter))
print(sniffer.has_header(sample))  # A hint, not a guarantee.`
          },
          {
            kind: "prose",
            body: [
              "For a reusable partner format, register a dialect once with `csv.register_dialect()`. Most pipelines should keep the default `QUOTE_MINIMAL`; it quotes only fields that need it. Avoid `QUOTE_NONNUMERIC` for business data because it converts every unquoted number to `float`, including integer-looking values.",
              "### 5. Protect spreadsheet users and report bad rows",
              "CSV is plain text, but spreadsheet software may treat a cell beginning with `=`, `+`, `-`, or `@` as a formula. If untrusted text will be exported for people to open in Excel or similar tools, neutralize those values before writing."
            ]
          },
          {
            kind: "interactive-code",
            code: `def spreadsheet_safe(value: object) -> str:
    text = str(value)
    if text.startswith(("=", "+", "-", "@")):
        return "'" + text
    return text

print(spreadsheet_safe("=HYPERLINK(\\"https://example.test\\")"))
print(spreadsheet_safe("Normal note"))`
          },
          {
            kind: "prose",
            body: [
              "Apply this at the spreadsheet-export boundary, not when importing or storing the original value. Preserve the source data internally and make the output policy explicit.",
              "For imports, keep a line number, record a reason for rejection, and decide whether the job should stop on the first invalid row or continue while collecting rejected rows. Critical financial or identity imports often fail closed; exploratory uploads may produce a reject report for the user.",
              "### 6. Write complete exports, then replace the old file",
              "An export should not appear at its final name until it is complete. Write it to a temporary file in the same folder and replace the destination after the writer closes successfully."
            ]
          },
          {
            kind: "interactive-code",
            code: `import csv
from pathlib import Path


def write_csv_atomically(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = path.with_name(f".{path.name}.tmp")

    try:
        with temporary_path.open("w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames, extrasaction="raise", lineterminator="\\n")
            writer.writeheader()
            writer.writerows(rows)
            file.flush()
        temporary_path.replace(path)
    except Exception:
        temporary_path.unlink(missing_ok=True)
        raise

write_csv_atomically(
    Path("csv_lab/contacts.csv"),
    ["name", "email"],
    [{"name": "Ari Stone", "email": "ari@example.test"}],
)
print("Safely replaced contacts.csv!")`
          },
          {
            kind: "prose",
            body: [
              "The temporary file must live beside the final file so replacement happens on the same filesystem. This prevents readers from seeing a partially written final export, but it does not provide multi-process locking or guaranteed durability after a power loss."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "This example creates a product catalog and review feed, validates their headers and values, aggregates ratings, and atomically writes a product summary."
            ]
          },
          {
            kind: "interactive-code",
            code: `import csv
from collections import defaultdict
from decimal import Decimal
from pathlib import Path


PRODUCT_FIELDS = ["product_id", "name", "price"]
REVIEW_FIELDS = ["product_id", "rating"]
SUMMARY_FIELDS = [
    "product_id",
    "name",
    "price",
    "review_count",
    "average_rating",
]


def validate_header(reader, expected_fields, path):
    if reader.fieldnames != expected_fields:
        raise ValueError(
            f"{path} must have columns {expected_fields}"
        )


def write_csv(path, fieldnames, rows):
    """Write a complete CSV before replacing the final file."""
    temp_path = path.with_name(f".{path.name}.tmp")

    with temp_path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames,
            extrasaction="raise",
            lineterminator="\\n",
        )
        writer.writeheader()
        writer.writerows(rows)

    temp_path.replace(path)


# 1. CREATE INPUT FILES
workspace = Path("csv_lab")
workspace.mkdir(exist_ok=True)

products_path = workspace / "products.csv"
reviews_path = workspace / "reviews.csv"
summary_path = workspace / "product_summary.csv"

products = [
    {"product_id": "P001", "name": "Wireless Mouse", "price": "29.99"},
    {"product_id": "P002", "name": "Mechanical Keyboard", "price": "89.99"},
    {"product_id": "P003", "name": "USB-C Hub, Pro", "price": "24.50"},
]

reviews = [
    {"product_id": "P001", "rating": "5"},
    {"product_id": "P001", "rating": "4"},
    {"product_id": "P002", "rating": "5"},
]

write_csv(products_path, PRODUCT_FIELDS, products)
write_csv(reviews_path, REVIEW_FIELDS, reviews)


# 2. READ REVIEWS AS A STREAM
ratings = defaultdict(lambda: [0, 0])

with reviews_path.open(newline="", encoding="utf-8") as file:
    reader = csv.DictReader(file, strict=True)
    validate_header(reader, REVIEW_FIELDS, reviews_path)

    for row in reader:
        rating = int(row["rating"])

        if not 1 <= rating <= 5:
            raise ValueError("Rating must be between 1 and 5.")

        ratings[row["product_id"]][0] += rating
        ratings[row["product_id"]][1] += 1


# 3. READ PRODUCTS + JOIN THE DATA
summary = []

with products_path.open(newline="", encoding="utf-8") as file:
    reader = csv.DictReader(file, strict=True)
    validate_header(reader, PRODUCT_FIELDS, products_path)

    for row in reader:
        price = Decimal(row["price"])
        total, count = ratings.get(row["product_id"], [0, 0])

        average = Decimal(total) / count if count else Decimal("0")

        summary.append({
            "product_id": row["product_id"],
            "name": row["name"],
            "price": f"{price:.2f}",
            "review_count": count,
            "average_rating": f"{average:.2f}",
        })


# 4. WRITE THE FINAL EXPORT SAFELY
write_csv(summary_path, SUMMARY_FIELDS, summary)

print(summary_path.read_text(encoding="utf-8"))`
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "**Splitting lines with `split(\",\")`:** Quoted commas, quotes, and embedded newlines make this unreliable. Use `csv.reader` or `csv.DictReader`.\n\n**Skipping `newline=\"\"`:** The `csv` module needs direct control over line endings; skipping it can create blank rows on Windows.\n\n**Assuming CSV has types:** Every field starts as text. Convert and validate it deliberately.\n\n**Trusting the header without checking it:** A reordered, missing, duplicate, or extra column can corrupt an import silently.\n\n**Using floats for currency:** Use `Decimal` when exact arithmetic or stable two-decimal output matters.\n\n**Letting `Sniffer` define a known feed:** It can guess incorrectly. Pin delimiter, quoting, encoding, and headers in the contract.\n\n**Writing directly to a final export:** A crash can leave a partial CSV. Write a complete sibling temp file first, then replace it.\n\n**Ignoring formula injection:** Text beginning with `=`, `+`, `-`, or `@` can behave as a formula in spreadsheet software."
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "csv-v3-1",
                question: "Why should CSV not be parsed with split(',')?",
                options: ["It uses too much memory", "Fields can contain quoted commas, quotation marks, and newlines", "It cannot parse UTF-8 characters"],
                correctIndex: 1,
                explanation: "Manual splitting fails when the comma is inside quotes, or when a field contains a newline."
              },
              {
                id: "csv-v3-2",
                question: "Why use newline='' when opening a CSV file?",
                options: ["It removes extra whitespace", "It lets the csv module handle CSV record endings correctly", "It increases read performance"],
                correctIndex: 1,
                explanation: "The csv module needs direct control over newlines, otherwise Windows writes extra blank rows."
              },
              {
                id: "csv-v3-3",
                question: "What type does DictReader give each row?",
                options: ["A list of strings", "A dictionary keyed by header names", "A Pandas DataFrame"],
                correctIndex: 1,
                explanation: "DictReader maps the first row (the header) to dictionary keys for all subsequent rows."
              },
              {
                id: "csv-v3-4",
                question: "What type does every CSV field have before conversion?",
                options: ["float or int", "str", "bytes"],
                correctIndex: 1,
                explanation: "CSV is a purely text format. Everything arrives as strings."
              },
              {
                id: "csv-v3-5",
                question: "What is the time complexity of a hash-map CSV join?",
                options: ["O(n * m)", "O(n + m)", "O(1)"],
                correctIndex: 1,
                explanation: "Building the map takes O(n), and scanning the second file takes O(m), making the average time O(n + m)."
              }
            ]
          },
          {
            kind: "takeaways",
            items: [
              "Use Python's `csv` module, never manual string splitting.",
              "Treat headers, encoding, delimiter, and row values as a declared data contract.",
              "Open CSV files with UTF-8 and `newline=\"\"`.",
              "Stream rows, convert types at the boundary, and report bad rows with useful context.",
              "Write important exports to a temporary sibling file and replace the final file only when complete.",
              "Use `DictReader` and `DictWriter` for readable header-driven pipelines, and choose joining strategies based on data size."
            ]
          }
        ]
      },

      {
        slug: "pickle-module",
        title: "Pickle Module",
        subtitle: "Cache Trusted Python Objects with Pickle",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "Programs often compute data that is expensive to rebuild: a parsed local dataset, a search index, a feature-engineering result, or the state needed to reproduce a bug. A cache lets a later run reuse that work.",
              "Pickle is Python's built-in binary serializer. It can preserve many Python types that JSON cannot represent directly, including tuples, sets, datetime values, Decimal values, and many custom-class instances. That convenience comes with a strict security rule: unpickling data can execute arbitrary code.",
              "Use pickle only for Python-only data from a source you fully control, such as a cache your program wrote into its own private workspace. Do not load a pickle from a user upload, email attachment, download, public model registry, HTTP request, or shared location that an attacker could modify."
            ]
          },
          {
            kind: "animation",
            variant: "pickle-module",
            caption: "Pickling and Unpickling"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "Pickling turns a Python object graph into binary bytes. Unpickling rebuilds an equivalent Python object graph.",
              "The `s` in `dumps` and `loads` means the result or input is an in-memory byte string. File-based functions require binary mode: `wb` for writing and `rb` for reading.",
              "Pickle is not a portable or human-readable file format. It is Python-specific binary data, so it is a poor choice for public APIs, configuration files, spreadsheets, or long-lived cross-language contracts."
            ]
          },
          {
            kind: "table",
            headers: ["You have / need", "In memory", "On disk"],
            rows: [
              ["Convert a Python object to pickle data", "`pickle.dumps(object)` returns bytes", "`pickle.dump(object, binary_file)` writes bytes"],
              ["Rebuild a Python object", "`pickle.loads(blob)`", "`pickle.load(binary_file)`"]
            ]
          },
          {
            kind: "prose",
            heading: "The security boundary",
            body: [
              "**Only unpickle data you trust.** Pickle `load` and `loads` are not safe parsers for untrusted input; a crafted pickle can run code while it is being loaded.",
              "This is not a “validate it after loading” problem, because the harmful action can happen during loading. A custom `Unpickler` allowlist may reduce risk in a narrow situation, but it is not a general security boundary. The safe default is to reject untrusted pickle data and use JSON, CSV, Protocol Buffers, or another data-only format instead.",
              "Signing a pickle with HMAC can detect tampering when the signing key is protected, but it does not make an unknown producer trustworthy. Use it only in addition to a controlled trust model."
            ]
          },

          {
            kind: "prose",
            heading: "Step-by-step",
            body: [
              "### 1. Round-trip a Python object in memory",
              "Use `dumps` when a trusted Python-only mechanism already transports bytes. `loads` reconstructs the original object from those bytes."
            ]
          },
          {
            kind: "interactive-code",
            code: `import pickle\nfrom datetime import datetime\nfrom decimal import Decimal\n\norder = {\n    "order_id": 5001,\n    "placed_at": datetime(2026, 8, 24, 9, 30),\n    "total": Decimal("89.97"),\n    "labels": {"priority", "reviewed"},\n    "coordinates": (41.8781, -87.6298),\n}\n\nblob = pickle.dumps(order)\nrestored = pickle.loads(blob)\n\nprint(type(blob).__name__)\nprint(f"Stored bytes: {len(blob)}")\nprint(type(restored["placed_at"]).__name__)\nprint(type(restored["total"]).__name__)\nprint(type(restored["labels"]).__name__)\nprint(type(restored["coordinates"]).__name__)`
          },
          {
            kind: "prose",
            body: [
              "Pickle preserves these Python types without custom conversion. JSON needs explicit conversions for `datetime`, `Decimal`, and `set`, and JSON arrays return as lists rather than tuples.",
              "### 2. Write and read a controlled pickle file",
              "Use `dump` and `load` with binary files. This block creates the exact cache it later loads, so the source is controlled."
            ]
          },
          {
            kind: "interactive-code",
            code: `import pickle\nfrom pathlib import Path\n\nworkspace = Path("pickle_lab")\ncache_path = workspace / "contact_cache.pkl"\nworkspace.mkdir(exist_ok=True)\ncache_path.unlink(missing_ok=True)\n\ncache = {\n    "names": ["Ari Stone", "Lee Park"],\n    "processed": True,\n    "source": "contacts.csv",\n}\n\nwith cache_path.open("wb") as file:\n    pickle.dump(cache, file)\n\nwith cache_path.open("rb") as file:\n    restored_cache = pickle.load(file)  # Safe here: this script just wrote the file.\n\nprint(restored_cache)\nprint(f"Cache size: {cache_path.stat().st_size} bytes")`
          },
          {
            kind: "prose",
            body: [
              "Binary files are not meant to be opened and edited as text. If people need to inspect, hand-edit, or exchange the data, choose JSON or CSV instead.",
              "### 3. Know what pickle can and cannot preserve",
              "Pickle handles built-in values, nested containers, shared references, cyclic structures, and many custom-class instances. Functions and classes are stored by their fully qualified module name, not by copying their code."
            ]
          },
          {
            kind: "interactive-code",
            code: `import pickle\n\ndata = {\n    "tags": {"python", "cache"},\n    "point": (10, 20),\n}\n\nrestored = pickle.loads(pickle.dumps(data))\n\nprint(type(restored["tags"]).__name__)\nprint(type(restored["point"]).__name__)`
          },
          {
            kind: "prose",
            body: [
              "An object tied to the current process is usually not picklable: open files, sockets, database connections, locks, generators, coroutines, lambdas, nested functions, and locally defined classes are common examples."
            ]
          },
          {
            kind: "interactive-code",
            code: `import pickle\n\ntry:\n    pickle.dumps(lambda number: number + 1)\nexcept (AttributeError, pickle.PicklingError, TypeError) as error:\n    print(f"Lambda cannot be pickled: {type(error).__name__}")`
          },
          {
            kind: "prose",
            body: [
              "If an object owns a live connection, pickle the connection settings or other durable state, not the connection itself. Define worker functions at the top level of a module when using \`multiprocessing\`, because worker processes need to import them by name.",
              "### 4. Control the saved state of a custom object",
              "\`__getstate__\` lets a class choose what it saves. \`__setstate__\` rebuilds derived or live state after loading. Use these hooks when an instance contains something that should not be serialized."
            ]
          },
          {
            kind: "interactive-code",
            code: `import pickle\n\n\nclass CachedClient:\n    def __init__(self, endpoint):\n        self.endpoint = endpoint\n        self.connection = self._connect()\n\n    def _connect(self):\n        return f"connected to {self.endpoint}"\n\n    def __getstate__(self):\n        # Save durable configuration, not the current live connection.\n        return {"endpoint": self.endpoint}\n\n    def __setstate__(self, state):\n        self.endpoint = state["endpoint"]\n        self.connection = self._connect()\n\n\nclient = CachedClient("https://api.example.test")\nrestored_client = pickle.loads(pickle.dumps(client))\n\nprint(client.connection)\nprint(restored_client.connection)`
          },
          {
            kind: "prose",
            body: [
              "On unpickling, \`__init__\` is usually not called. A class that depends on invariants or resources should restore them in \`__setstate__\` or another deliberate initialization path. For long-lived pickled instances, include a state version and migrate old state explicitly.",
              "### 5. Choose a protocol when compatibility matters",
              "Protocols describe the binary format of a pickle. Higher protocols can be more efficient but may require newer Python versions to read them. \`HIGHEST_PROTOCOL\` selects the newest protocol supported by the running interpreter."
            ]
          },
          {
            kind: "interactive-code",
            code: `import pickle\n\ndata = {"name": "wireless mouse", "stock": 25, "tags": ("usb", "compact")}\n\nfor protocol in range(pickle.HIGHEST_PROTOCOL + 1):\n    blob = pickle.dumps(data, protocol=protocol)\n    print(f"Protocol {protocol}: {len(blob)} bytes")`
          },
          {
            kind: "prose",
            body: [
              "For a short-lived local cache, the default or highest protocol is usually appropriate. Pin a protocol only when you know the oldest Python version that must read the file. Protocol 5 is the default in Python 3.14; older runtimes cannot read a pickle written with an unsupported newer protocol.",
              "### 6. Build a trusted cache with versioning and atomic replacement",
              "Writing directly to a final cache path can leave a corrupt partial file if the process stops mid-write. Write a complete sibling temporary file, then replace the final file. A version marker lets the program ignore a cache created by an older data shape or algorithm."
            ]
          },

          {
            kind: "interactive-code",
            code: `import pickle\nfrom pathlib import Path\n\n\ndef write_trusted_cache(path, payload):\n    path.parent.mkdir(parents=True, exist_ok=True)\n    temporary_path = path.with_name(f".{path.name}.tmp")\n\n    try:\n        with temporary_path.open("wb") as file:\n            pickle.dump(payload, file, protocol=pickle.HIGHEST_PROTOCOL)\n            file.flush()\n        temporary_path.replace(path)\n    except Exception:\n        temporary_path.unlink(missing_ok=True)\n        raise\n\n\ndef read_trusted_cache(path, expected_version):\n    if not path.exists():\n        return None\n\n    # Only load a cache at this program-controlled path.\n    try:\n        with path.open("rb") as file:\n            payload = pickle.load(file)\n    except (pickle.UnpicklingError, EOFError, AttributeError, ImportError, IndexError):\n        return None\n\n    if not isinstance(payload, dict) or payload.get("cache_version") != expected_version:\n        return None\n    return payload\n\n\ncache_path = Path("pickle_lab/versioned_cache.pkl")\ncache_path.unlink(missing_ok=True)\n\nwrite_trusted_cache(cache_path, {"cache_version": 1, "names": ["Ari", "Lee"]})\nprint(read_trusted_cache(cache_path, expected_version=1))\nprint(read_trusted_cache(cache_path, expected_version=2))`
          },
          {
            kind: "prose",
            body: [
              "Atomic replacement protects readers from seeing a half-written file. It does not coordinate two writers racing to update the same cache, and it does not make an untrusted file safe to load. Add locking or a shared cache service when multiple processes write the same key."
            ]
          },
          {
            kind: "prose",
            heading: "Production considerations",
            body: []
          },
          {
            kind: "image",
            src: pickleProductionConsiderationsImg,
            alt: "Production considerations",
            caption: "Production considerations"
          },
          {
            kind: "prose",
            heading: "Pickle or another format?",
            body: []
          },
          {
            kind: "image",
            src: pickleOrAnotherFormatImg,
            alt: "Pickle or another format?",
            caption: "Pickle or another format?"
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "This final example caches a product catalog. It creates useful lookup structures once, saves them as a trusted Python-only cache, then reuses that cache for the next request.",
              "It intentionally uses only the Python standard library, so it runs in Pyodide without installing packages. The code starts with a clean browser workspace so each run visibly demonstrates both a cache miss and a cache hit."
            ]
          },
          {
            kind: "interactive-code",
            code: `import pickle\nfrom pathlib import Path\n\n\nCACHE_VERSION = 1\n\n\ndef build_product_catalog():\n    \"\"\"Build lookup structures from trusted application data.\"\"\"\n    print("Building product catalog...")\n\n    products = [\n        {"id": 101, "name": "Wireless Mouse", "category": "electronics"},\n        {"id": 102, "name": "Mechanical Keyboard", "category": "electronics"},\n        {"id": 103, "name": "Office Chair", "category": "furniture"},\n    ]\n\n    # Precompute structures the application can reuse.\n    return {\n        "cache_version": CACHE_VERSION,\n        "products_by_id": {\n            product["id"]: product\n            for product in products\n        },\n        "categories": {\n            product["category"]\n            for product in products\n        },\n    }\n\n\ndef write_trusted_cache(path, data):\n    \"\"\"Write the cache completely before replacing the old file.\"\"\"\n    temporary_path = path.with_name(f".{path.name}.tmp")\n\n    try:\n        with temporary_path.open("wb") as file:\n            pickle.dump(\n                data,\n                file,\n                protocol=pickle.HIGHEST_PROTOCOL,\n            )\n\n        temporary_path.replace(path)\n\n    except Exception:\n        temporary_path.unlink(missing_ok=True)\n        raise\n\n\ndef get_product_catalog(path):\n    \"\"\"Load a valid cache or rebuild it when necessary.\"\"\"\n    if path.exists():\n        # This path belongs to this program's private lesson workspace.\n        try:\n            with path.open("rb") as file:\n                cached = pickle.load(file)\n\n            if (\n                isinstance(cached, dict)\n                and cached.get("cache_version") == CACHE_VERSION\n            ):\n                print("Catalog cache hit.")\n                return cached\n\n        except (pickle.UnpicklingError, EOFError):\n            print("Cache is invalid. Rebuilding...")\n\n    catalog = build_product_catalog()\n    write_trusted_cache(path, catalog)\n    print("Catalog cache saved.")\n    return catalog\n\n\n# 1. CREATE A CONTROLLED WORKSPACE\nworkspace = Path("pickle_lab")\nworkspace.mkdir(exist_ok=True)\n\ncache_path = workspace / "product_catalog.pkl"\n\n# Reset only for this interactive lesson so every run\n# demonstrates both a cache miss and a cache hit.\ncache_path.unlink(missing_ok=True)\n\n# 2. FIRST REQUEST: BUILD + SAVE\nfirst_catalog = get_product_catalog(cache_path)\n\n# 3. SECOND REQUEST: LOAD FROM CACHE\nsecond_catalog = get_product_catalog(cache_path)\n\n# 4. USE THE RESTORED DATA\nproduct = second_catalog["products_by_id"][102]\n\nprint("Product:", product["name"])\nprint("Categories:", sorted(second_catalog["categories"]))\nprint(\n    "Category type:",\n    type(second_catalog["categories"]).__name__,\n)`
          },
          {
            kind: "prose",
            body: [
              "The catalog contains a dictionary keyed by integers and a set, which Pickle restores without custom encoders. The example is safe because the same script creates and controls the exact cache path before it calls \`pickle.load\`. In a real application, never accept a cache file uploaded by a user or downloaded from an unknown source; rebuild or load it only from a protected, trusted location."
            ]
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: `**Loading an unknown .pkl file:** Treat it as unsafe code, not passive data. Do not load it.

**Opening pickle files in text mode:** Use \`wb\` to write and \`rb\` to read.

**Using pickle for shared data:** JSON, CSV, Protocol Buffers, or Parquet are usually better when another language, person, or system needs the data.

**Assuming pickle stores class code:** It stores references to importable classes and functions plus instance state. Renaming or moving code can break old pickles.

**Caching without a version:** A changed schema or algorithm can make an old cache incorrect even when it loads successfully.

**Writing directly to the final cache:** A crash can leave a partial pickle. Write a complete sibling temporary file and replace it.

**Treating a restricted unpickler as a complete defense:** It is not a substitute for keeping untrusted pickle data out of the system.`
          },
          {
            kind: "takeaways",
            items: [
              "Pickle preserves rich Python-only object graphs as binary data.",
              "The \`dump\` and \`load\` pair works with binary files; \`dumps\` and \`loads\` works with in-memory bytes.",
              "Only load pickles from sources you fully control and trust.",
              "Use cache versions, controlled paths, and atomic replacement for reliable local caches.",
              "Pickle is convenient, not portable or safe for untrusted interchange.",
              "Think in tradeoffs: trust, type fidelity, compatibility, memory, concurrency, and consumer needs."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "pickle-1",
                question: "What does \`pickle.dumps\` return?",
                options: [
                  "A string",
                  "A file object",
                  "A bytes object",
                  "A dictionary"
                ],
                correctIndex: 2,
                explanation: "The 's' in dumps stands for string, but in Python 3 it returns a bytes object containing the serialized data."
              },
              {
                id: "pickle-2",
                question: "Which file modes are appropriate for pickle \`dump\` and \`load\`?",
                options: [
                  "'w' and 'r'",
                  "'wb' and 'rb'",
                  "'a' and 'r+'",
                  "'x' and 'w'"
                ],
                correctIndex: 1,
                explanation: "Pickle files are binary data, so you must use 'wb' to write and 'rb' to read."
              },
              {
                id: "pickle-3",
                question: "Why is \`pickle.load\` unsafe for user uploads?",
                options: [
                  "It might contain viruses",
                  "It can take up too much memory",
                  "A crafted pickle can execute arbitrary code during loading",
                  "It can only be read by Python"
                ],
                correctIndex: 2,
                explanation: "Unpickling allows execution of code (like calling functions). Malicious data can exploit this."
              },
              {
                id: "pickle-4",
                question: "What does a cache version protect against?",
                options: [
                  "Unauthorized access to the cache",
                  "Reusing data produced by an incompatible schema or algorithm",
                  "Disk corruption",
                  "Network latency"
                ],
                correctIndex: 1,
                explanation: "A cache version ensures that if your program's data requirements change, it will safely ignore the old, incompatible cache."
              },
              {
                id: "pickle-5",
                question: "Why write to a temporary sibling file before replacing the final cache?",
                options: [
                  "It compresses the data faster",
                  "It uses less memory",
                  "Readers never see a partially written final cache if the write is interrupted",
                  "It bypasses file permissions"
                ],
                correctIndex: 2,
                explanation: "Atomic replacement ensures that any reader opening the cache file will either see the complete old file or the complete new file, but never a corrupted half-written file."
              }
            ]
          }
        ]
      },
      {
        slug: "shutil-module",
        title: "Shutil Module",
        subtitle: "Copy, move, and archive files.",
        sections: [
          {
            "kind": "prose",
            "heading": "Why this matters",
            "body": [
              "Programs create exports, reports, generated images, and backups. A real workflow may need to copy a completed report without changing it, move a processed upload out of an inbox, or package a folder for a teammate.",
              "`shutil` is Python's high-level filesystem toolbox. Use `pathlib.Path` to describe and inspect locations; use `shutil` for whole-file, whole-folder, and archive actions.",
              "Every runnable example works in a named `shutil_lab` workspace so it is easy to inspect and reset."
            ]
          } as const,
          {
            "kind": "animation",
            "variant": "shutil-module"
          } as const,
          {
            "kind": "prose",
            "heading": "The core idea",
            "body": []
          } as const,
          {
            "kind": "table",
            "headers": [
              "You need to...",
              "Prefer",
              "Why"
            ],
            "rows": [
              [
                "Build a location or test whether it exists",
                "`pathlib.Path`",
                "Clear joins and readable inspection methods."
              ],
              [
                "Copy a file or folder tree",
                "`shutil`",
                "Performs the complete copy operation."
              ],
              [
                "Move a file between folders",
                "`shutil.move()`",
                "Can fall back to copy-then-delete across filesystems."
              ],
              [
                "Make or unpack a ZIP",
                "`shutil.make_archive()` / `shutil.unpack_archive()`",
                "High-level archive support."
              ],
              [
                "Delete one known file",
                "`Path.unlink()`",
                "A smaller, targeted operation."
              ]
            ]
          } as const,
          {
            "kind": "prose",
            "body": [
              "A useful rule: `Path` answers **where?**; `shutil` performs **the large filesystem action**."
            ]
          } as const,
          {
            "kind": "prose",
            "heading": "Copying one file",
            "body": []
          } as const,
          {
            "kind": "table",
            "headers": [
              "Function",
              "Destination can be a folder?",
              "Metadata",
              "Good use"
            ],
            "rows": [
              [
                "`shutil.copyfile()`",
                "No",
                "File bytes only",
                "An exact output filename."
              ],
              [
                "`shutil.copy()`",
                "Yes",
                "File mode, not all metadata",
                "A normal working copy."
              ],
              [
                "`shutil.copy2()`",
                "Yes",
                "As much as the platform supports",
                "A backup where timestamps matter."
              ]
            ]
          } as const,
          {
            "kind": "prose",
            "body": [
              "`copy2()` is a strong default for a small backup. It leaves the original in place and returns the final destination."
            ]
          } as const,
          {
            "kind": "prose",
            "heading": "Step-by-step",
            "body": [
              "### 1. Back up a finished support report",
              "Before another process changes a CSV export, make a copy."
            ]
          } as const,
          {
            "kind": "interactive-code",
            "code": "import shutil\nfrom pathlib import Path\n\nworkspace = Path(\"shutil_lab\")\nsource = workspace / \"exports\" / \"daily-support-report.csv\"\nbackups = workspace / \"backups\"\n\nsource.parent.mkdir(parents=True, exist_ok=True)\nbackups.mkdir(parents=True, exist_ok=True)\nsource.write_text(\n    \"ticket_id,status\\n1001,closed\\n1002,open\\n\",\n    encoding=\"utf-8\",\n)\n\n# Passing a folder keeps the original filename.\nsaved_to = Path(shutil.copy2(source, backups))\n\nprint(\"Original exists:\", source.exists())\nprint(\"Backup path:\", saved_to)\nprint(\"Same contents:\", source.read_text() == saved_to.read_text())"
          } as const,
          {
            "kind": "prose",
            "body": [
              "A copy is not a move: the source still exists. If the destination is a folder, the copy becomes `backups/daily-support-report.csv`.",
              "### 2. Stage a whole folder and ignore temporary files",
              "`copytree()` recursively copies a directory. `ignore_patterns()` keeps temporary or editor files out of a release."
            ]
          } as const,
          {
            "kind": "interactive-code",
            "code": "import shutil\nfrom pathlib import Path\n\nworkspace = Path(\"shutil_lab\")\nsource = workspace / \"release_source\"\nstaging = workspace / \"release_staging\"\n\n# Reset only this exact practice workspace for a repeatable run.\nif workspace.exists():\n    shutil.rmtree(workspace)\n\n(source / \"reports\").mkdir(parents=True)\n(source / \"reports\" / \"summary.txt\").write_text(\"Tickets closed: 42\\n\")\n(source / \"reports\" / \"draft.tmp\").write_text(\"Do not publish\")\n(source / \".DS_Store\").write_text(\"Editor metadata\")\n\nshutil.copytree(\n    source,\n    staging,\n    ignore=shutil.ignore_patterns(\"*.tmp\", \".DS_Store\"),\n)\n\nfor path in sorted(staging.rglob(\"*\")):\n    print(path.relative_to(staging))"
          } as const,
          {
            "kind": "prose",
            "body": [
              "By default, `copytree()` expects its destination not to exist. Use `dirs_exist_ok=True` only when you deliberately want to merge into an existing folder; matching files can be overwritten.",
              "### 3. Move an incoming file after it is processed",
              "`move()` changes a file's location. On one filesystem it may be a fast rename; across filesystems it can copy the data and delete the source."
            ]
          } as const,
          {
            "kind": "interactive-code",
            "code": "import shutil\nfrom pathlib import Path\n\nworkspace = Path(\"shutil_lab\")\nincoming = workspace / \"incoming\" / \"ticket-batch.csv\"\nprocessed = workspace / \"processed\"\n\nincoming.parent.mkdir(parents=True, exist_ok=True)\nprocessed.mkdir(parents=True, exist_ok=True)\nincoming.write_text(\"ticket_id,priority\\n1003,high\\n\", encoding=\"utf-8\")\n\nmoved_to = Path(shutil.move(incoming, processed))\n\nprint(\"Moved to:\", moved_to)\nprint(\"Source still exists:\", incoming.exists())\nprint(\"Destination exists:\", moved_to.exists())"
          } as const,
          {
            "kind": "prose",
            "body": [
              "Do not use `move()` when you need a backup. After it succeeds, the file is no longer at its old path.",
              "### 4. Package reports into a ZIP and verify the result",
              "An archive packages many files into one shareable file. Pass the archive name without `.zip`; `make_archive()` adds the extension."
            ]
          } as const,
          {
            "kind": "interactive-code",
            "code": "import shutil\nfrom pathlib import Path\n\nworkspace = Path(\"shutil_lab\")\nreports = workspace / \"reports\"\narchives = workspace / \"archives\"\nrestored = workspace / \"restored\"\n\nreports.mkdir(parents=True, exist_ok=True)\narchives.mkdir(parents=True, exist_ok=True)\n(reports / \"daily.csv\").write_text(\"ticket_id,status\\n1001,closed\\n\")\n(reports / \"notes.txt\").write_text(\"Prepared for weekly handoff.\\n\")\n\narchive = shutil.make_archive(\n    base_name=str(archives / \"support-reports\"),\n    format=\"zip\",\n    root_dir=reports,\n)\n\nshutil.unpack_archive(archive, restored)\n\nprint(\"Archive:\", archive)\nprint(\"Restored files:\", [path.name for path in sorted(restored.iterdir())])"
          } as const,
          {
            "kind": "prose",
            "body": [
              "Only extract archives from a trusted source. A downloaded archive is input, not a harmless folder: it may contain unexpected paths or huge data.",
              "### 5. Copy from an already-open stream",
              "`copyfileobj()` copies between open file-like objects. It is useful when another library gives you a stream instead of a source path."
            ]
          } as const,
          {
            "kind": "interactive-code",
            "code": "import shutil\nfrom io import BytesIO\nfrom pathlib import Path\n\nworkspace = Path(\"shutil_lab\")\ndestination = workspace / \"downloads\" / \"message.txt\"\ndestination.parent.mkdir(parents=True, exist_ok=True)\n\ndownload_stream = BytesIO(b\"Your support export is ready.\\n\")\n\nwith destination.open(\"wb\") as file:\n    shutil.copyfileobj(download_stream, file)\n\nprint(destination.read_text(encoding=\"utf-8\"))"
          } as const,
          {
            "kind": "prose",
            "heading": "Deleting a folder tree is different",
            "body": [
              "`shutil.rmtree(path)` permanently removes a directory and everything inside it. There is no recycle-bin step.",
              "Use it only with a precise, application-controlled path. Never pass a user-supplied path, a broad workspace root, or an unresolved value to `rmtree()`."
            ]
          } as const,
          {
            "kind": "interactive-code",
            "code": "import shutil\nfrom pathlib import Path\n\nworkspace = Path(\"shutil_lab\")\ngenerated_preview = workspace / \"generated_preview\"\ngenerated_preview.mkdir(parents=True, exist_ok=True)\n(generated_preview / \"preview.txt\").write_text(\"Temporary preview\")\n\n# This exact, application-created practice folder is the deletion boundary.\nshutil.rmtree(generated_preview)\n\nprint(\"Preview folder exists:\", generated_preview.exists())"
          } as const,
          {
            "kind": "prose",
            "body": [
              "In production, log the exact target, verify it belongs to a controlled parent folder, and prefer retention policies for important backups."
            ]
          } as const,
          {
            "kind": "prose",
            "heading": "A simple example: create a shareable support-report backup",
            "body": [
              "This realistic daily handoff stages only publishable files, creates a ZIP, restores it into a separate check folder, and prints the result. It uses only the Python standard library."
            ]
          } as const,
          {
            "kind": "interactive-code",
            "code": "import shutil\nfrom pathlib import Path\n\n# 1. CREATE SAMPLE APPLICATION OUTPUT\nworkspace = Path(\"shutil_lab\")\nsource = workspace / \"support_exports\"\nstaging = workspace / \"staging\"\nbackups = workspace / \"backups\"\nrestored = workspace / \"restore_check\"\n\n# Reset only this named lesson workspace for a repeatable run.\nif workspace.exists():\n    shutil.rmtree(workspace)\n\n(source / \"daily\").mkdir(parents=True)\n(source / \"daily\" / \"tickets.csv\").write_text(\n    \"ticket_id,status\\n1001,closed\\n1002,open\\n\",\n    encoding=\"utf-8\",\n)\n(source / \"daily\" / \"summary.txt\").write_text(\n    \"Open tickets: 1\\n\",\n    encoding=\"utf-8\",\n)\n(source / \"daily\" / \"draft.tmp\").write_text(\"Not ready for backup\")\nbackups.mkdir(parents=True)\n\n# 2. STAGE A CLEAN COPY\n# Temporary files do not enter the backup.\nshutil.copytree(\n    source,\n    staging,\n    ignore=shutil.ignore_patterns(\"*.tmp\"),\n)\n\n# 3. CREATE ONE SHAREABLE ZIP FILE\narchive = shutil.make_archive(\n    base_name=str(backups / \"support-export\"),\n    format=\"zip\",\n    root_dir=staging,\n)\n\n# 4. RESTORE INTO A SEPARATE CHECK FOLDER\nshutil.unpack_archive(archive, restored)\n\nrestored_files = [\n    path.relative_to(restored).as_posix()\n    for path in sorted(restored.rglob(\"*\"))\n    if path.is_file()\n]\n\nprint(\"Backup created:\", archive)\nprint(\"Restored files:\", restored_files)\nprint(\n    \"Temporary file included:\",\n    any(name.endswith(\".tmp\") for name in restored_files),\n)"
          } as const,
          {
            "kind": "prose",
            "body": [
              "Expected result: the ZIP contains `daily/tickets.csv` and `daily/summary.txt`, but not `daily/draft.tmp`. The source remains untouched because `copytree()` made a copy instead of a move.",
              "## Production considerations"
            ]
          } as const,
          {
            "kind": "table",
            "headers": [
              "Concern",
              "Good default"
            ],
            "rows": [
              [
                "Metadata",
                "Use `copy2()` when original timestamps matter; platforms differ in which metadata they can preserve."
              ],
              [
                "Existing destinations",
                "Let `copytree()` create a new staging folder. Use `dirs_exist_ok=True` only for an intentional merge."
              ],
              [
                "Large folders",
                "Copying and archiving take time proportional to the data size and file count. Log progress for long jobs."
              ],
              [
                "Disk space",
                "Check free space before a large copy or archive."
              ],
              [
                "Archive trust",
                "Only unpack archives from trusted sources. Establish a security policy for downloaded archives."
              ],
              [
                "Deletion",
                "Keep `rmtree()` targets narrow, known, and logged. There is no undo."
              ]
            ]
          } as const,
          {
            "kind": "callout",
            "tone": "warn",
            "title": "Common mistakes",
            "body": "- **Using `move()` when you meant `copy2()`:** A move removes the original from its old path.\\n- **Passing a folder to `copyfile()`:** It needs a destination filename. `copy()` and `copy2()` accept a destination folder.\\n- **Creating the `copytree()` destination first:** It fails by default. Let `copytree()` create it, or deliberately use `dirs_exist_ok=True`.\\n- **Archiving the wrong root:** `root_dir` controls the top-level layout inside the archive. Restore a test copy to inspect it.\\n- **Extracting unknown archives:** Treat them as untrusted input.\\n- **Calling `rmtree()` on a broad path:** Restrict deletion to a precise, application-created folder."
          } as const,
          {
            "kind": "takeaways",
            "items": [
              "Use `Path` for locations and `shutil` for high-level copy, move, archive, and controlled deletion operations.",
              "`copy2()` keeps the original; `move()` relocates it.",
              "`copytree()` creates a whole-folder staging copy and can ignore unwanted files.",
              "`make_archive()` creates a shareable archive; verify what you package.",
              "The same code patterns work in local scripts and server jobs, but production needs stronger space, logging, trust, and deletion safeguards."
            ]
          } as const,
          {
            "kind": "quiz",
            "questions": [
              {
                "id": "shutil-1",
                "question": "Which function is a good default for a backup that should preserve timestamps where possible?",
                "options": [
                  "shutil.copyfile()",
                  "shutil.copy()",
                  "shutil.copy2()",
                  "shutil.move()"
                ],
                "correctIndex": 2,
                "explanation": "shutil.copy2() preserves as much metadata (including timestamps) as the platform supports."
              },
              {
                "id": "shutil-2",
                "question": "What happens to the source after `shutil.move()` succeeds?",
                "options": [
                  "It remains exactly as it was",
                  "Its metadata is updated",
                  "It is compressed",
                  "It is no longer at the old path"
                ],
                "correctIndex": 3,
                "explanation": "A move effectively relocates the file; whether via rename or a copy-then-delete, the source file is removed from its original path."
              },
              {
                "id": "shutil-3",
                "question": "Why is `rmtree()` treated differently from normal cleanup operations like `Path.unlink()`?",
                "options": [
                  "It moves files to the recycle bin",
                  "It recursively and permanently removes everything below its target",
                  "It only deletes empty folders",
                  "It takes a long time to run"
                ],
                "correctIndex": 1,
                "explanation": "shutil.rmtree() permanently deletes a directory and its entire contents without any recycle bin step, making it highly destructive if misused."
              }
            ]
          } as const,
        ]
      }
    ]
  }
};
