import { createFileRoute } from "@tanstack/react-router";
import {
  Code2,
  Database,
  FunctionSquare,
  Box,
  Zap,
  FileText,
} from "lucide-react";
import pythonLogo from "@/images/logos/python-logo.png";
import { TrackIndexLayout } from "@/components/learning-paths/TrackIndexLayout";

export const Route = createFileRoute("/python/")({
  head: () => ({
    meta: [
      { title: "Python — StackBlueprint" },
      {
        name: "description",
        content: "Master Python from basic syntax to advanced asynchronous programming.",
      },
      { property: "og:title", content: "Python — StackBlueprint" },
      {
        property: "og:description",
        content: "Master Python from basic syntax to advanced asynchronous programming.",
      },
    ],
  }),
  component: PythonIndex,
});

export const PYTHON_SECTIONS = [
  {
    title: "1. Foundations",
    blurb: "The core syntax and built-in data structures of Python.",
    patterns: [
      {
        slug: "basics",
        title: "Python Basics",
        blurb: "Variables, data types, and control flow.",
        locked: true,
        lessons: [
          { slug: "variables", title: "Variables", icon: Code2 },
          { slug: "data-types", title: "Data Types", icon: Code2 },
          { slug: "if-else", title: "If/Else", icon: Code2 },
          { slug: "loops", title: "Loops", icon: Code2 },
        ],
      },
      {
        slug: "data-structures",
        title: "Data Structures",
        blurb: "Lists, dictionaries, sets, and tuples.",
        locked: true,
        lessons: [
          { slug: "lists", title: "Lists", icon: Database },
          { slug: "dictionaries", title: "Dictionaries", icon: Database },
          { slug: "sets", title: "Sets", icon: Database },
          { slug: "tuples", title: "Tuples", icon: Database },
        ],
      },
    ],
  },
  {
    title: "2. Intermediate Concepts",
    blurb: "Structuring your code with functions, modules, and classes.",
    patterns: [
      {
        slug: "functions",
        title: "Functions & Modules",
        blurb: "Defining functions, scope, and importing modules.",
        locked: true,
        lessons: [
          { slug: "functions", title: "Functions", icon: FunctionSquare },
          { slug: "scope", title: "Scope", icon: FunctionSquare },
          { slug: "modules", title: "Modules", icon: FunctionSquare },
          { slug: "packages", title: "Packages", icon: FunctionSquare },
        ],
      },
      {
        slug: "oop",
        title: "Object-Oriented Programming",
        blurb: "Classes, inheritance, and polymorphism.",
        locked: true,
        lessons: [
          { slug: "classes", title: "Classes", icon: Box },
          { slug: "objects", title: "Objects", icon: Box },
          { slug: "inheritance", title: "Inheritance", icon: Box },
          { slug: "polymorphism", title: "Polymorphism", icon: Box },
        ],
      },
      {
        slug: "file-handling",
        title: "File Handling",
        blurb: "Read and write text, CSV, and JSON files in Python.",
        locked: false,
        path: "/python/file-handling",
        lessons: [
          { slug: "file-basics", title: "File Basics", icon: FileText, path: "/python/file-handling/file-basics" },
          { slug: "working-with-paths", title: "Working with Paths", icon: FileText, path: "/python/file-handling/working-with-paths" },
          { slug: "reading-files", title: "Reading Files", icon: FileText, path: "/python/file-handling/reading-files" },
          { slug: "writing-files", title: "Writing Files", icon: FileText, path: "/python/file-handling/writing-files" },
          { slug: "file-modes", title: "File Modes", icon: FileText, path: "/python/file-handling/file-modes" },
          { slug: "file-methods", title: "File Methods", icon: FileText, path: "/python/file-handling/file-methods" },
          { slug: "pathlib-module", title: "Pathlib Module", icon: FileText, path: "/python/file-handling/pathlib-module" },
          { slug: "os-module", title: "OS Module", icon: FileText, path: "/python/file-handling/os-module" },
          { slug: "working-with-csv", title: "Working with CSV", icon: FileText, path: "/python/file-handling/working-with-csv" },
          { slug: "working-with-json", title: "Working with JSON", icon: FileText, path: "/python/file-handling/working-with-json" },
          { slug: "pickle-module", title: "Pickle Module", icon: FileText, path: "/python/file-handling/pickle-module" },
          { slug: "shutil-module", title: "Shutil Module", icon: FileText, path: "/python/file-handling/shutil-module" },
        ],
      },
    ],
  },
  {
    title: "3. Advanced Python",
    blurb: "Advanced techniques for high-performance and asynchronous code.",
    patterns: [
      {
        slug: "advanced",
        title: "Advanced Python",
        blurb: "Decorators, generators, and context managers.",
        locked: true,
        lessons: [
          { slug: "decorators", title: "Decorators", icon: Zap },
          { slug: "generators", title: "Generators", icon: Zap },
          { slug: "context-managers-advanced", title: "Context Managers", icon: Zap },
          { slug: "async-io", title: "Async IO", icon: Zap },
        ],
      },
    ],
  },
];

function PythonIndex() {
  return (
    <TrackIndexLayout
      title="Python"
      blurb="Master Python from basic syntax to advanced asynchronous programming. This track is currently in development."
      logoSrc={pythonLogo}
      logoAlt="Python Logo"
      sections={PYTHON_SECTIONS}
      basePath="/python"
    />
  );
}
