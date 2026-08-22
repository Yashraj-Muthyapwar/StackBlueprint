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
            code: "with open('poem.txt', 'r', encoding='utf-8') as file:\n    # Read everything into one giant string\n    content = file.read()\n    print(content)"
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
            code: "with open('poem.txt', 'r', encoding='utf-8') as file:\n    # Read one line, then stop\n    first_line = file.readline()\n    second_line = file.readline()\n    print(first_line, end='')"
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
            code: "with open('poem.txt', 'r', encoding='utf-8') as file:\n    # Read all lines into a list\n    lines = file.readlines()\n    \n    for line in lines:\n        print(line, end='')"
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
            code: "with open('poem.txt', 'r') as file:\n    for line in file:\n        print(line, end='')"
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
            code: "with open('log.txt', 'w', encoding='utf-8') as file:\n    file.write('Booting up...\\n')\n    file.write('System online.\\n')"
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
            code: "with open('log.txt', 'a', encoding='utf-8') as file:\n    file.write('User logged in.\\n')"
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
            code: "lines_to_add = ['Apple\\n', 'Orange\\n']\nwith open('fruits.txt', 'a', encoding='utf-8') as file:\n    file.writelines(lines_to_add)"
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
            code: "try:\n    with open('important.txt', 'x') as file:\n        file.write('First!')\nexcept FileExistsError:\n    print('File already exists!')"
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
            code: "with open('log.txt', 'r+') as file:\n    content = file.read() # We can read\n    file.write('\\nDone.') # AND we can write!"
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
            code: "with open('photo.jpg', 'rb') as file:\n    bytes = file.read(10)\n    print(bytes) # b'\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF'"
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
            code: "with open('source.png', 'rb') as src:\n    with open('copy.png', 'wb') as dest:\n        dest.write(src.read())"
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
              "When you read or write, Python moves a hidden cursor forward. If you read a file, and then try to read it again, you get nothing—because the cursor is already at the end. You need a way to control it."
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
            code: "with open('poem.txt', 'r') as file:\n    print(file.tell()) # 0\n    file.read(5)\n    print(file.tell()) # 5"
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
            code: "with open('poem.txt', 'r') as file:\n    content = file.read()\n    \n    file.seek(0) # Rewind to the very beginning!\n    \n    read_again = file.read()"
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
            code: "with open('huge_data.bin', 'rb') as file:\n    file.seek(1024) # Skip the first 1024 bytes (e.g. a header)\n    chunk = file.read(256) # Read the next 256 bytes\n    print(chunk)"
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
