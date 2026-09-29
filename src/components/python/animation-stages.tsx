import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { FileText, Database, Lock, Unlock, AlertCircle, Terminal, Monitor } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const r = (key: string | number, ...cells: (string | number | null)[]): Row => ({ key, cells });

const st = (
  activeLines: number[],
  rowState: ((row: Row, i: number) => RowState | undefined) | RowState,
  note: string,
  extra: Partial<StageStep> = {},
): StageStep => ({
  activeLines,
  note,
  rowState: typeof rowState === "function" ? rowState : () => rowState,
  ...extra,
});

const TONE_CLASSES: Record<Tone, string> = {
  mint: "border-mint/40 bg-mint/10 text-mint",
  rose: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  amber: "border-amber/40 bg-amber/10 text-amber",
  violet: "border-violet/40 bg-violet/10 text-violet",
  neutral: "border-hairline bg-surface-2/40 text-muted-foreground",
};

const sidePanel = (title: string, points: string[], tone: Tone = "violet", Icon?: LucideIcon) => (
  <div className={`rounded-lg border p-3 ${TONE_CLASSES[tone]}`}>
    <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]">
      {Icon ? <Icon className="size-3.5" /> : null}
      {title}
    </div>
    {points.map((p, i) => (
      <div key={i} className="mt-1 font-mono text-[12px] text-foreground/85">
        {p}
      </div>
    ))}
  </div>
);

const fileIo: Stage[] = [
  {
    name: "1. Open the file",
    blurb: "Requesting access from the Operating System",
    sql: [
      "f = open('data.txt', 'r')",
      "line1 = f.readline()",
      "line2 = f.readline()",
      "f.close()",
    ],
    table: {
      name: "File State",
      cols: ["property", "status"],
      rows: [
        r(1, "Status", "Opened (Locked)"),
        r(2, "Cursor", "Line 1"),
        r(3, "Memory", "Empty"),
      ],
    },
    steps: [
      st([0], (row) => row.key === 1 ? "kept" : row.key === 2 ? "added" : "dropped",
        "Calling open() tells the OS to find 'data.txt' and prepare it for reading. The OS returns a file object (pointer).",
        { side: sidePanel("OS Level", ["• Checks file permissions", "• Locks file for reading", "• Sets cursor to beginning"], "violet", FileText) }),
    ],
  },
  {
    name: "2. Read Line 1",
    blurb: "Fetching the first line",
    sql: [
      "f = open('data.txt', 'r')",
      "line1 = f.readline()",
      "line2 = f.readline()",
      "f.close()",
    ],
    table: {
      name: "File State",
      cols: ["property", "status"],
      rows: [
        r(1, "Status", "Opened"),
        r(2, "Cursor", "Line 2"),
        r(3, "Memory", "line1 = 'Hello'"),
      ],
    },
    steps: [
      st([1], "kept",
        "readline() reads characters until it hits a newline (\\n). The cursor automatically advances to the next line.",
        { noteTone: "mint", highlightCols: [2] }),
    ],
  },
  {
    name: "3. Read Line 2",
    blurb: "Fetching the second line",
    sql: [
      "f = open('data.txt', 'r')",
      "line1 = f.readline()",
      "line2 = f.readline()",
      "f.close()",
    ],
    table: {
      name: "File State",
      cols: ["property", "status"],
      rows: [
        r(1, "Status", "Opened"),
        r(2, "Cursor", "Line 3 (EOF)"),
        r(3, "Memory", "line1='Hello', line2='World'"),
      ],
    },
    steps: [
      st([2], "kept",
        "The next readline() picks up exactly where the last one left off.",
        { noteTone: "mint" }),
    ],
  },
  {
    name: "4. Close the file",
    blurb: "Releasing resources",
    sql: [
      "f = open('data.txt', 'r')",
      "line1 = f.readline()",
      "line2 = f.readline()",
      "f.close()",
    ],
    table: {
      name: "File State",
      cols: ["property", "status"],
      rows: [
        r(1, "Status", "Closed (Released)"),
        r(2, "Cursor", "Invalid"),
        r(3, "Memory", "Variables persist"),
      ],
    },
    steps: [
      st([3], "kept",
        "You MUST close the file. If you don't, the file remains locked, and you can leak memory or prevent other programs from reading it.",
        { noteTone: "rose", side: sidePanel("Warning", ["• Open files consume RAM", "• OS limits open files", "• Writes might not flush!"], "rose", AlertCircle) }),
    ],
  },
];

const contextManager: Stage[] = [
  {
    name: "1. The Context Manager",
    blurb: "Using the 'with' keyword",
    sql: [
      "with open('data.txt', 'r') as f:",
      "    data = f.read()",
      "    # Do something with data",
      "",
      "# File is already closed here"
    ],
    table: {
      name: "Resource Flow",
      cols: ["action", "status"],
      rows: [
        r(1, "Enter block", "Acquiring lock..."),
      ],
    },
    steps: [
      st([0], "kept",
        "The 'with' statement creates a context manager. It automatically calls a setup method (__enter__) to open the file.",
        { side: sidePanel("Context Manager", ["• Automatic setup", "• Guarantees teardown", "• Cleaner syntax"], "mint", Lock) }),
    ],
  },
  {
    name: "2. Working inside the block",
    blurb: "The file is open and usable",
    sql: [
      "with open('data.txt', 'r') as f:",
      "    data = f.read()",
      "    # Do something with data",
      "",
      "# File is already closed here"
    ],
    table: {
      name: "Resource Flow",
      cols: ["action", "status"],
      rows: [
        r(1, "Enter block", "File Opened (Locked)"),
        r(2, "Inside block", "Reading data"),
      ],
    },
    steps: [
      st([1, 2], "kept",
        "As long as you are indented inside the 'with' block, the file is open and available.",
        { noteTone: "mint" }),
    ],
  },
  {
    name: "3. Leaving the block",
    blurb: "Automatic teardown",
    sql: [
      "with open('data.txt', 'r') as f:",
      "    data = f.read()",
      "    # Do something with data",
      "",
      "# File is already closed here"
    ],
    table: {
      name: "Resource Flow",
      cols: ["action", "status"],
      rows: [
        r(1, "Enter block", "Setup (__enter__)"),
        r(2, "Inside block", "Success"),
        r(3, "Exit block", "File Closed (Released)"),
      ],
    },
    steps: [
      st([4], (row) => row.key === 3 ? "added" : "kept",
        "As soon as you unindent (exit the block), Python automatically calls a teardown method (__exit__) to close the file. Even if an error happens inside the block!",
        { noteTone: "violet", side: sidePanel("Guaranteed Safety", ["• No need for f.close()", "• Safe from exceptions", "• Prevents resource leaks"], "mint", Unlock) }),
    ],
  },
];

const fileBasics: Stage[] = [
  {
    name: "1. In-Memory Data",
    blurb: "Generate practice contacts using Faker",
    sql: [
      "from faker import Faker",
      "",
      "fake = Faker()",
      "contacts = [fake.name() for _ in range(3)]",
    ],
    table: {
      name: "Environment State",
      cols: ["location", "content"],
      rows: [
        r(1, "Memory", "contacts = ['Ada Reed', 'John Doe', ...]"),
        r(2, "Disk", "Empty"),
      ],
    },
    steps: [
      st([3], (row) => row.key === 1 ? "added" : "kept",
        "Variables live in memory. When the program ends, this 'contacts' list is cleared.",
        { noteTone: "violet" }),
    ],
  },
  {
    name: "2. Write to Disk",
    blurb: "Save the list to a text file",
    sql: [
      "with open('contacts.txt', 'w', encoding='utf-8') as file:",
      "    for name in contacts:",
      "        file.write(name + '\\n')",
    ],
    table: {
      name: "Environment State",
      cols: ["location", "content"],
      rows: [
        r(1, "Memory", "contacts list"),
        r(2, "Disk (contacts.txt)", "Ada Reed\\nJohn Doe\\n..."),
      ],
    },
    steps: [
      st([0, 1, 2], (row) => row.key === 2 ? "added" : "kept",
        "Opening in 'w' mode creates the file. The names are now safely stored on disk.",
        { noteTone: "mint", side: sidePanel("Write Mode", ["• Creates missing files", "• Overwrites existing data", "• Must add \\n manually"], "mint", FileText) }),
    ],
  },
  {
    name: "3. Read from Disk",
    blurb: "Load the saved text back into memory",
    sql: [
      "with open('contacts.txt', 'r', encoding='utf-8') as file:",
      "    saved_contacts = file.read()",
      "",
      "print(saved_contacts)",
    ],
    table: {
      name: "Environment State",
      cols: ["location", "content"],
      rows: [
        r(1, "Disk (contacts.txt)", "Ada Reed\\nJohn Doe\\n..."),
        r(2, "Terminal Output", "Waiting..."),
      ],
    },
    steps: [
      st([0, 1], "kept",
        "We open the same file in 'r' (read) mode. file.read() returns the entire text block."),
      st([3], (row) => row.key === 2 ? "added" : "kept",
        "The text is printed identically to how it was generated on the previous run.",
        { noteTone: "mint" }),
    ],
  },
];

const workingWithPaths: Stage[] = [
  {
    name: "1. Absolute vs Relative Paths",
    blurb: "Paths tell Python where a file lives",
    sql: [
      "Absolute: /Users/sam/project/data/contacts.txt",
      "Relative: data/contacts.txt",
    ],
    table: {
      name: "Path Types",
      cols: ["type", "description"],
      rows: [
        r(1, "Absolute", "Starts at the root of the filesystem"),
        r(2, "Relative", "Starts from Current Working Directory"),
      ],
    },
    steps: [
      st([0, 1], "kept", "Absolute paths are rigid. Relative paths are flexible and work on any computer if the project structure is the same.", { noteTone: "violet" }),
    ],
  },
  {
    name: "2. The Current Working Directory",
    blurb: "Where does a relative path start?",
    sql: [
      "from pathlib import Path",
      "",
      "print(Path.cwd())",
    ],
    table: {
      name: "Environment",
      cols: ["location", "path"],
      rows: [
        r(1, "CWD", "/Users/sam/project"),
      ],
    },
    steps: [
      st([2], "kept", "Path.cwd() reveals the folder from where you ran the Python script. If relative paths fail, this is the first thing to check.", { noteTone: "mint" }),
    ],
  },
  {
    name: "3. Building Paths with Pathlib",
    blurb: "Joining path parts safely",
    sql: [
      "from pathlib import Path",
      "",
      "data_folder = Path('data')",
      "contacts_path = data_folder / 'contacts.txt'",
      "print(contacts_path)",
    ],
    table: {
      name: "Path Objects",
      cols: ["object", "value"],
      rows: [
        r(1, "data_folder", "data"),
        r(2, "contacts_path", "data/contacts.txt"),
      ],
    },
    steps: [
      st([2], "kept", "Path('data') creates a Path object representing the folder location."),
      st([3], (row) => row.key === 2 ? "added" : "kept", "The '/' operator joins Path parts using the correct separator for the OS (like '\\' on Windows and '/' on Mac/Linux).", { noteTone: "mint" }),
    ],
  },
  {
    name: "4. Creating Folders",
    blurb: "Make sure the folder exists before writing",
    sql: [
      "contacts_path = Path.cwd() / 'data' / 'contacts.txt'",
      "contacts_path.parent.mkdir(exist_ok=True)",
      "",
      "with contacts_path.open('w') as file:",
      "    file.write('Ada Reed\\n')",
    ],
    table: {
      name: "File System",
      cols: ["action", "result"],
      rows: [
        r(1, "mkdir()", "Creates 'data' folder"),
        r(2, "open('w')", "Creates 'contacts.txt'"),
      ],
    },
    steps: [
      st([1], "kept", "contacts_path.parent gets the 'data' folder part. mkdir(exist_ok=True) creates it if it doesn't exist.", { noteTone: "violet" }),
      st([3, 4], (row) => row.key === 2 ? "added" : "kept", "Now we can safely open the file for writing because its parent folder definitely exists.", { noteTone: "mint" }),
    ],
  }
];

const pythonInstructions: Stage[] = [
  {
    name: "1. Write an instruction",
    blurb: "Code is a precise request",
    sql: [
      'message = "Hello!"',
      "print(message)",
    ],
    table: {
      name: "Python's workspace",
      cols: ["name", "value"],
      rows: [r(1, "message", "\"Hello!\"")],
    },
    steps: [
      st([0], "kept", "The first line stores text in a name called message. This is an instruction written in Python's syntax.", { noteTone: "violet", side: sidePanel("Your code", ["• Uses precise syntax", "• Describes a task", "• Can be run again"], "violet", Terminal) }),
    ],
  },
  {
    name: "2. Python runs it",
    blurb: "Follow the next instruction",
    sql: [
      'message = "Hello!"',
      "print(message)",
    ],
    table: {
      name: "Python's workspace",
      cols: ["name", "value"],
      rows: [r(1, "message", "\"Hello!\""), r(2, "print(message)", "Ready to display")],
    },
    steps: [
      st([1], (row) => row.key === 2 ? "added" : "kept", "Python reads print(message), looks up the value stored in message, and prepares that value for output.", { noteTone: "mint" }),
    ],
  },
  {
    name: "3. See a result",
    blurb: "The computer shows the output",
    sql: [
      'message = "Hello!"',
      "print(message)",
    ],
    table: {
      name: "Output",
      cols: ["screen", "result"],
      rows: [r(1, "Terminal", "Hello!")],
    },
    steps: [
      st([1], "kept", "The result appears in the output. This loop—write code, run it, check the result—is the foundation of programming.", { noteTone: "mint", side: sidePanel("Computer output", ["Hello!", "", "One instruction completed"], "mint", Monitor) }),
    ],
  },
];

export const STAGES_REGISTRY = {
  "file-io": fileIo,
  "context-manager": contextManager,
  "file-basics": fileBasics,
  "working-with-paths": workingWithPaths,
  "python-instructions": pythonInstructions,
} as const;

export type AnyVariant = keyof typeof STAGES_REGISTRY;
