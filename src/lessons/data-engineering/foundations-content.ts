import { type LessonContent, type Section } from "@/lessons/types";
export type { Section };

import dataLifecycleImg from "@/images/data-engineering-fundamentals/foundations/data-engineering-lifecycle.png";
import evolutionImg from "@/images/data-engineering-fundamentals/foundations/evolution-of-data-engineering.png";
import scenarioImg from "@/images/data-engineering-fundamentals/foundations/scenario.png";

export const FOUNDATION_TOPICS: Record<string, { title: string; slug: string; lessons: LessonContent[] }> = {
  "data-engineering-described": {
    title: "1. Understanding the Data Engineering Discipline",
    slug: "data-engineering-described",
    lessons: [
      {
        slug: "what-data-engineering-means",
        title: "1.1 What Data Engineering Means",
        subtitle: "The process of building systems that collect, store, process, and deliver data so it can be used effectively.",
        sections: [
          {
            kind: "prose",
            heading: "What Is Data Engineering?",
            body: [
              "Data engineering is the process of building systems that collect, store, process, and deliver data so it can be used effectively.",
              "A simple way to think about it is:",
              "**Raw Data → Reliable Data → Useful Information**",
              "Data engineers make sure data gets from its source to the people and systems that need it, such as analysts, applications, and machine-learning systems."
            ]
          },
          {
            kind: "prose",
            heading: "The Data Engineering Lifecycle",
            body: [
              "The lifecycle describes the journey of data:",
              "**Generation → Ingestion → Transformation → Storage → Serving**"
            ]
          },
          {
            kind: "image",
            src: dataLifecycleImg,
            alt: "The Data Engineering Lifecycle",
            caption: "Generation → Ingestion → Transformation → Storage → Serving"
          },
          {
            kind: "list",
            items: [
              "**Generation:** Data is created by applications, databases, APIs, devices, logs, and users.",
              "**Ingestion:** Data is collected and brought into the data platform.",
              "**Transformation:** Data is cleaned, combined, and prepared for use.",
              "**Storage:** Data is stored so it can be processed and accessed reliably.",
              "**Serving:** Data is delivered to analytics, machine learning, applications, and other consumers."
            ]
          },
          {
            kind: "prose",
            body: [
              "The lifecycle is the journey; a data pipeline is the system that moves data through that journey."
            ]
          },
          {
            kind: "list",
            heading: "What Makes Data Engineering More Than Just Moving Data?",
            body: [
              "A data engineer must also consider the foundations that run across the entire lifecycle:"
            ],
            items: [
              "**Security:** Protecting data from unauthorized access.",
              "**Data Management:** Organizing and maintaining data quality.",
              "**DataOps:** Practices for improving the speed and quality of data analytics.",
              "**Data Architecture:** Designing the structure of data systems.",
              "**Orchestration:** Coordinating data workflows and processes.",
              "**Software Engineering:** Applying software development principles to data systems."
            ]
          },
          {
            kind: "prose",
            body: [
              "These help ensure that data systems are secure, reliable, scalable, maintainable, and easy to operate."
            ]
          },
          {
            kind: "prose",
            heading: "From Lifecycle to Real-World Systems",
            body: [
              "Understanding the lifecycle is only the beginning. A data engineer also needs to answer:",
              "*What does the business need, and how should we build the system to provide it?*"
            ]
          },
          {
            kind: "image",
            src: scenarioImg,
            alt: "Real-World Data Scenario",
            caption: "A real-world business scenario"
          },
          {
            kind: "prose",
            body: [
              "This leads to four important ideas:"
            ]
          },
          {
            kind: "prose",
            heading: "1. Understand the Requirement",
            body: [
              "First, understand who needs the data, what they need, and how they will use it."
            ]
          },
          {
            kind: "list",
            heading: "2. Design the Data Architecture",
            body: [
              "Create the blueprint for how data will flow, be stored, processed, and consumed.",
              "**Sources → Pipelines → Storage → Processing → Consumers**",
              "**Key Components:**"
            ],
            items: [
              "**Data Sources:** Where data comes from, such as APIs, databases, applications, and devices.",
              "**Data Pipelines:** Automated processes that move and transport data from one system to another.",
              {
                text: "**Storage:** Systems used to persist data reliably for processing and future use.",
                subitems: [
                  "**Data Warehouses:** Central repositories for storing and analyzing large amounts of structured data.",
                  "**Data Lakes:** Storage for large amounts of raw, structured, semi-structured, and unstructured data."
                ]
              },
              "**Data Processing:** The stage where data is cleaned, transformed, joined, enriched, and prepared for downstream use.",
              "**Consumers:** The people, applications, or systems that use the processed data, such as analysts, dashboards, applications, and machine-learning systems."
            ]
          },
          {
            kind: "prose",
            body: [
              "Data architecture connects these components into one system that moves data from its source to the people and systems that need it."
            ]
          },
          {
            kind: "list",
            heading: "3. Choose the Right Technology",
            body: [
              "The technology should follow the requirement—not the other way around.",
              "Examples include:"
            ],
            items: [
              "**Data Processing:** Spark, Flink",
              "**Data Warehousing:** BigQuery, Redshift",
              "**Data Integration:** NiFi, Talend"
            ]
          },
          {
            kind: "prose",
            heading: "4. Design for Scale",
            body: [
              "Create a plan for how the data system will be built, how data will flow through it, and how each component will work together.",
              "The design should also allow the system to continue working effectively as data volume, users, and workloads grow.",
              "**Good system design = Clear architecture + Efficient data flow + Scalability**"
            ]
          },
          {
            kind: "callout",
            tone: "info",
            title: "A Simple Data Engineering Mindset",
            body: "When designing a data system, think in this order:\n\n**Requirement → Architecture → Technology → Implementation → Scale**\n\nThis prevents the common mistake of choosing tools first and figuring out the problem later."
          },
          {
            kind: "prose",
            heading: "How Data Engineering Evolved",
            body: [
              "As data became larger, faster, and more varied, the technologies and architectures used to manage it evolved as well—from traditional databases and warehouses to distributed systems, cloud platforms, streaming systems, and modern AI-driven data platforms."
            ]
          },
          {
            kind: "image",
            src: evolutionImg,
            alt: "Evolution of Data Engineering",
            caption: "The evolution of data engineering over time"
          },
          {
            kind: "prose",
            body: [
              "The important takeaway is not to memorize every technology or date.",
              "Data engineering evolved because the way organizations generate and use data kept changing."
            ]
          },
          {
            kind: "takeaways",
            items: [
              "Data engineering is more than moving data from one place to another.",
              "It is about understanding the business requirement, designing the right data architecture, choosing appropriate technologies, and building a system that delivers trusted data at scale.",
              "**Lifecycle** = How data moves",
              "**Undercurrents** = What keeps the system reliable",
              "**Architecture** = How the system is designed",
              "**Technology** = How we implement it",
              "**Goal** = Deliver useful, trusted data"
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "de-fundamentals-1",
                question: "What is the primary goal of data engineering?",
                options: [
                  "To analyze data and create business dashboards.",
                  "To build systems that collect, store, process, and deliver data.",
                  "To train machine learning models for predictive analytics.",
                  "To manually move data from one place to another."
                ],
                correctIndex: 1,
                explanation: "Data engineering is the process of building systems that collect, store, process, and deliver data so it can be used effectively."
              },
              {
                id: "de-fundamentals-2",
                question: "According to the Data Engineering Mindset, what is the first step when designing a data system?",
                options: [
                  "Technology",
                  "Architecture",
                  "Requirement",
                  "Scale"
                ],
                correctIndex: 2,
                explanation: "You must first understand who needs the data, what they need, and how they will use it (the Requirement)."
              }
            ]
          }
        ]
      }
    ]
  }
};
