import overviewImage from "@/images/mongodb/nosql-concepts/nosql-cycle-depot.png";
import type { QuizQuestion } from "@/components/lesson/Quiz";

export type MongoSection =
  | { kind: "image"; src: string; alt: string; caption: string }
  | { kind: "prose"; heading: string; body: string[] }
  | { kind: "catalog-walkthrough"; caption: string }
  | { kind: "table"; caption: string; headers: string[]; rows: string[][] }
  | { kind: "callout"; tone: "warn" | "info"; title: string; body: string }
  | { kind: "takeaways"; items: string[] }
  | { kind: "quiz"; questions: QuizQuestion[] };

export type MongoLesson = {
  slug: string;
  title: string;
  subtitle: string;
  sections: MongoSection[];
};

export const introductionToNoSQL: MongoLesson = {
  slug: "introduction-to-nosql",
  title: "Introduction to NoSQL",
  subtitle: "See how Cycle Depot rows become documents, then learn what a flexible schema allows.",
  sections: [
    {
      kind: "prose",
      heading: "What Does NoSQL Mean?",
      body: [
        "`NoSQL` is commonly read as `Not Only SQL`. It describes a family of databases that organize data using models beyond relational tables. MongoDB belongs to this family.",
        "A relational table gives its records a shared set of columns. MongoDB groups `documents` into a `collection`. A document holds named fields and values, and documents in the same collection can have different fields.",
      ],
    },
    {
      kind: "image",
      src: overviewImage,
      alt: "Cycle Depot product 7, Aero Sprint Pro, represented as a table row and a document with the same id, name, and price of 5400.",
      caption: "Same product, same values: columns in a row become named fields in a document.",
    },
    {
      kind: "prose",
      heading: "Follow One Product into a Document",
      body: [
        "Cycle Depot's `products` table contains Aero Sprint Pro: `id` 7, `price` 5400, and `in_stock` 99. In a document, field names sit beside their values inside braces. The data stays the same; its representation changes.",
        "Press Play to trace the `name` and `price` from the source row. Then see two product documents grouped into a `collection`. This is a proposed document view of selected CSV fields, not a database migration.",
      ],
    },
    {
      kind: "catalog-walkthrough",
      caption: "Trace Cycle Depot values from rows to documents, then into a collection.",
    },
    {
      kind: "table",
      caption: "Read the example",
      headers: ["Idea", "Cycle Depot example"],
      rows: [
        ["Document", "One product represented by named fields: id, name, price."],
        ["Collection", "The Aero Sprint Pro and Switchback Enduro documents grouped as products."],
        ["Flexible schema", "One proposed document includes in_stock; the other omits it."],
      ],
    },
    {
      kind: "prose",
      heading: "Flexible Does Not Mean Rule-Free",
      body: [
        "A `schema` describes the expected fields and types. In the final animation step, only Aero Sprint Pro includes `in_stock`. That variation is allowed in our proposed document model. Both products still keep a `name` and numeric `price`.",
        "MongoDB supports validation rules to enforce those requirements. Relational databases can also model a varied catalog, for example with separate detail tables. The useful question is which structure fits the way your application reads and updates its data.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Common mistake: assuming NoSQL is always faster",
      body: "Flexible records are a modeling choice, not a speed guarantee. Query design, indexes, and the workload affect performance in both relational and NoSQL databases.",
    },
    {
      kind: "takeaways",
      items: [
        "NoSQL is a family of database models, not one product or query language.",
        "MongoDB groups documents into collections; their fields can vary.",
        "A flexible schema can still enforce required fields and consistent types.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "mongo-nosql-intro-v2-meaning",
          question: "What does NoSQL describe?",
          options: [
            "A family of database models beyond relational tables.",
            "One query language used by every database.",
            "A guarantee that queries will run faster.",
          ],
          correctIndex: 0,
          explanation: "NoSQL covers several models. MongoDB is one product within that family.",
        },
        {
          id: "mongo-nosql-intro-v2-fields",
          question:
            "Two Cycle Depot products share a MongoDB collection. Must they have identical fields?",
          options: [
            "Yes, every field must appear in every document.",
            "No, each can keep its own details while sharing fields such as name and price.",
            "No, but they must be stored without any rules.",
          ],
          correctIndex: 1,
          explanation:
            "The collection can contain documents with different fields. Shared rules can still apply.",
        },
        {
          id: "mongo-nosql-intro-v2-rules",
          question: "What is a sensible rule for both products?",
          options: [
            "Every optional field must appear in every product.",
            "Prices may be numbers or descriptive words interchangeably.",
            "Every product must have a numeric price.",
          ],
          correctIndex: 2,
          explanation:
            "A consistent price type supports price comparisons, even when product-specific fields differ.",
        },
      ],
    },
  ],
};

// Teaching references: user-supplied NoSQL notes, rewritten and scoped to the introduction.
// https://www.mongodb.com/docs/manual/data-modeling/
// https://www.mongodb.com/docs/manual/core/schema-validation/
export const MONGODB_TOPICS: Record<string, { lessons: MongoLesson[] }> = {
  "nosql-concepts": { lessons: [introductionToNoSQL] },
};
