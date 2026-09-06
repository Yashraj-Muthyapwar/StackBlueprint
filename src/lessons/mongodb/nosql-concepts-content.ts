import type { QuizQuestion } from "@/components/lesson/Quiz";

export type MongoSection =
  | { kind: "prose"; heading: string; body: string[] }
  | { kind: "table"; heading: string; headers: string[]; rows: string[][] }
  | { kind: "callout"; tone: "warn" | "info"; title: string; body: string }
  | { kind: "model-explorer"; heading: string }
  | { kind: "document-lab"; heading: string }
  | { kind: "document-practice"; heading: string }
  | { kind: "sources"; heading: string; links: { title: string; href: string }[] }
  | { kind: "takeaways"; heading: string; items: string[] }
  | { kind: "quiz"; heading: string; questions: QuizQuestion[] };

export type MongoLesson = {
  slug: string;
  title: string;
  subtitle: string;
  sections: MongoSection[];
};

export const introductionToNoSQL: MongoLesson = {
  slug: "introduction-to-nosql",
  title: "Introduction to NoSQL",
  subtitle:
    "Compare four data models, inspect a flexible product catalog, and choose a model around the questions your application asks.",
  sections: [
    {
      kind: "prose",
      heading: "One shop, different questions",
      body: [
        "A cycling shop needs to load a customer's cart, display a bike's specifications, record sensor readings from rental bikes, and suggest routes ridden by friends. These tasks involve different shapes of data and different ways of finding it.",
        "A database model determines how that information is organized and connected. Start with the question your application must answer, then consider a model that makes the necessary reads and writes practical.",
        "No database installation or query syntax is needed for this lesson. You will inspect small, synthetic examples and edit one product document directly in the page.",
      ],
    },
    {
      kind: "prose",
      heading: "What NoSQL means",
      body: [
        "**NoSQL**, commonly expanded as **Not Only SQL**, is an umbrella term for databases built around models such as key-value pairs, documents, wide-column records, and graphs. It is not a single database product or a shared query language.",
        "A relational database organizes data in tables with defined columns and relationships between records. NoSQL systems offer other primary ways to organize and retrieve data. They can store structured data too: a price remains a number and a product still has an identity.",
        "The category does not tell you whether a database is fast, consistent, or suitable for your application. Those answers depend on the product, its configuration, and your workload.",
      ],
    },
    { kind: "model-explorer", heading: "Four models, four access patterns" },
    {
      kind: "prose",
      heading: "Where MongoDB fits",
      body: [
        "MongoDB is a **document database**. A document represents one record as named fields and values. A **collection** groups documents. A field can hold a simple value, an array of values, or an embedded document with its own fields.",
        "In our catalog, each product is a document. A bike can carry a frame size while a light carries a brightness rating. They can share a collection without every product carrying every possible specification.",
        "MongoDB stores documents as **BSON**, a binary representation with types beyond ordinary JSON. The examples below use plain JSON with string identifiers so you can inspect the structure without learning shell constructors yet.",
      ],
    },
    { kind: "document-lab", heading: "Inspect a changing catalog" },
    {
      kind: "prose",
      heading: "Flexible schema still needs rules",
      body: [
        "A **schema** describes the expected structure and types of your data. MongoDB permits documents in a collection to have different fields by default, but applications still rely on agreed names and types. If one price is a number and another is the text 'cheap', a numeric price filter cannot treat them the same way.",
        "You can enforce selected rules with MongoDB's schema validation, such as requiring a numeric price. Flexibility means choosing which parts may vary, not abandoning validation. Introducing a new field can also require updates to readers, validation rules, or existing records.",
        "Embedding specifications can make a product page convenient to read. Copying the same supplier address into thousands of products has a different consequence: an address change may require updating many copies. Choose embedding or references based on what is read together and what changes independently.",
      ],
    },
    {
      kind: "table",
      heading: "Compare the decisions, not the labels",
      headers: ["Decision", "Relational starting point", "NoSQL considerations"],
      rows: [
        [
          "Data shape",
          "Tables with defined columns; some products also support JSON values.",
          "Choose a primary model: keys, documents, wide-column records, or graphs.",
        ],
        [
          "Relationships",
          "Keys and joins can combine related records.",
          "Embedding, references, or graph edges depend on the model. Some products also support join operations.",
        ],
        [
          "Data rules",
          "Types and constraints express requirements.",
          "Capabilities vary. MongoDB supports schema validation; flexible does not mean rule-free.",
        ],
        [
          "Transactions",
          "Often a natural fit for coordinated changes across related tables.",
          "Check the product and deployment. MongoDB supports multi-document transactions.",
        ],
        [
          "Growth",
          "Larger servers, replicas, or distributed designs may be options.",
          "Some systems distribute data across servers; partition design and operations still matter.",
        ],
        [
          "Performance and cost",
          "Measure representative queries, indexes, and writes.",
          "Use the same evidence. Dataset size or the NoSQL label alone does not predict a winner.",
        ],
      ],
    },
    {
      kind: "prose",
      heading: "Scaling is a design choice",
      body: [
        "**Scaling up** gives a server more resources, such as memory or CPU. **Scaling out** spreads work across servers. MongoDB supports sharding, which partitions a dataset across multiple machines. A suitable partitioning strategy matters because requests still need to find the right data.",
        "**Replication** keeps copies of data for availability and recovery. It is different from dividing a dataset into shards. More machines also bring coordination, monitoring, and operational work; adding nodes is not a substitute for a suitable data model.",
        "You do not need to choose a shard key or study consistency tradeoffs yet. Later lessons cover those details. For now, distinguish distributing different pieces of data from keeping copies of the same data.",
      ],
    },
    {
      kind: "prose",
      heading: "Choose from the workload",
      body: [
        "Write down the most frequent questions first. 'Load cart C42' starts from one known key. 'Find compatible lights below a price' needs fields inside product records. 'Follow two friendship links' puts connected relationships at the center of the task.",
        "Then list the changes that must succeed together, the data rules you must enforce, and the amount of data you expect. Compare candidate systems using those requirements, representative measurements, and the team's operating experience.",
        "For the shop, a document catalog is worth exploring because product attributes vary and the page reads specifications together. An order and payment workflow might favor a relational design with familiar constraints and transactions. One application can use both, but each additional database adds work to maintain and connect it.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Common mistakes",
      body: "Do not treat NoSQL as a promise of faster queries, assume it cannot support transactions, or confuse flexible documents with unstructured storage. A wide-column database is also not the same thing as a columnar analytics warehouse. Product capabilities and data models must be checked separately.",
    },
    { kind: "document-practice", heading: "Practice: add a product with a new shape" },
    {
      kind: "sources",
      heading: "References for further reading",
      links: [
        {
          title: "MongoDB: data modeling and document relationships",
          href: "https://www.mongodb.com/docs/manual/data-modeling/",
        },
        {
          title: "MongoDB: schema validation",
          href: "https://www.mongodb.com/docs/manual/core/schema-validation/",
        },
        {
          title: "MongoDB: transactions",
          href: "https://www.mongodb.com/docs/manual/core/transactions/",
        },
        { title: "MongoDB: sharding", href: "https://www.mongodb.com/docs/manual/sharding/" },
        {
          title: "Redis: keys and values",
          href: "https://redis.io/docs/latest/develop/using-commands/keyspace/",
        },
        {
          title: "Apache Cassandra: query-driven data modeling",
          href: "https://cassandra.apache.org/doc/stable/cassandra/developing/data-modeling/intro.html",
        },
        {
          title: "Neo4j: the graph database model",
          href: "https://neo4j.com/docs/getting-started/graph-database/",
        },
      ],
    },
    {
      kind: "takeaways",
      heading: "Key Takeaways",
      items: [
        "NoSQL groups several data models; it is not a single product or query language.",
        "Recognize key lookups, document reads, partition-based reads, and relationship traversals.",
        "MongoDB groups BSON documents into collections. Fields may vary, while validation can enforce chosen rules.",
        "Select a database from access patterns, required guarantees, and measured behavior rather than category-level claims.",
        "Sharding divides data; replication keeps copies. Neither removes the need for data modeling.",
      ],
    },
    {
      kind: "quiz",
      heading: "Check your understanding",
      questions: [
        {
          id: "mongo-nosql-intro-meaning",
          question: "What does the NoSQL label tell you?",
          options: [
            "The database uses a model such as documents, keys, wide-column records, or graphs.",
            "The database cannot accept structured data.",
            "The database is faster than a relational database.",
            "Every NoSQL product uses the same query language.",
          ],
          correctIndex: 0,
          explanation:
            "NoSQL groups several primary data models. Speed, accepted data types, and query languages depend on the product.",
        },
        {
          id: "mongo-nosql-intro-shape",
          question:
            "A bike has frame_size_cm; a light has lumens. What makes a document collection useful here?",
          options: [
            "Related products can share common fields while keeping different specifications.",
            "All validation must be disabled.",
            "Every document automatically receives both fields.",
            "Prices no longer need consistent types.",
          ],
          correctIndex: 0,
          explanation:
            "Documents can vary in shape while keeping shared conventions and validation rules for fields such as price.",
        },
        {
          id: "mongo-nosql-intro-graph",
          question:
            "The main request is to follow several friendship links to find connected riders. Which model most directly represents that request?",
          options: [
            "Graph: riders as nodes and friendships as relationships.",
            "Key-value: only a cart lookup by its identifier.",
            "Document: every rider must be copied into every product.",
            "Any model, because relationships never affect database design.",
          ],
          correctIndex: 0,
          explanation:
            "Graph traversal follows relationships between entities. The access pattern makes a graph a candidate, not an automatic performance winner.",
        },
        {
          id: "mongo-nosql-intro-sharding",
          question:
            "Products A through M are stored on one shard and N through Z on another. What does this illustrate?",
          options: [
            "Partitioning different parts of a dataset across servers.",
            "Replication of the full dataset on both servers.",
            "Removing all validation rules.",
            "Increasing the memory in one server.",
          ],
          correctIndex: 0,
          explanation:
            "This simplified example illustrates sharding. Replication would keep copies; actual shard design needs more than an alphabetical split.",
        },
        {
          id: "mongo-nosql-intro-choice",
          question:
            "A proposal says: 'Our dataset is large, so NoSQL will be faster.' What is the best next step?",
          options: [
            "List reads, writes, and required guarantees, then measure representative workloads.",
            "Accept the claim because dataset size determines the best model.",
            "Choose the product with the most servers.",
            "Remove transactions before testing.",
          ],
          correctIndex: 0,
          explanation:
            "A useful comparison includes the workload, indexes, data model, guarantees, and operating cost. The label alone cannot predict performance.",
        },
      ],
    },
  ],
};

export const MONGODB_TOPICS: Record<string, { lessons: MongoLesson[] }> = {
  "nosql-concepts": { lessons: [introductionToNoSQL] },
};
