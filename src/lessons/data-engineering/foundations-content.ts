import { type LessonContent, type Section } from "@/lessons/types";
export type { Section };

import dataLifecycleImg from "@/images/data-engineering-fundamentals/foundations/data-engineering-lifecycle.png";
import evolutionImg from "@/images/data-engineering-fundamentals/foundations/evolution-of-data-engineering.png";
import scenarioImg from "@/images/data-engineering-fundamentals/foundations/scenario.png";
import deResponsibilityImg from "@/images/data-engineering-fundamentals/foundations/data-engineer-responsibility.png";
import deSkillsImg from "@/images/data-engineering-fundamentals/foundations/data-engineer-skills.png";
import fitnessAppImg from "@/images/data-engineering-fundamentals/foundations/fitness-app.png";
import sixPartBalanceImg from "@/images/data-engineering-fundamentals/foundations/six-part-balance.png";
import skillsToBuildFirstImg from "@/images/data-engineering-fundamentals/foundations/skills-to-build-first.png";

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
      },
      {
        slug: "skills-and-responsibilities",
        title: "1.3 Data Engineering Skills and Responsibilities",
        subtitle: "Understand what data engineers do, which skills matter most, and how their work helps a company use data reliably.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "A data engineer builds the systems that move data from where it is created to where people can use it. Without that foundation, dashboards become unreliable, analysts lose time, and machine learning projects struggle to get useful data.",
              "A data engineer is not usually the person making the dashboard or training the model. They make sure the right data reaches those people safely, accurately, and on time."
            ]
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "Data engineering is part technical work and part problem solving for the business.",
              "The technical side is about collecting, storing, cleaning, and delivering data. The business side is about understanding what people need, choosing a sensible solution, and keeping costs under control."
            ]
          },
          {
            kind: "image",
            src: sixPartBalanceImg,
            alt: "The six-part balance",
            caption: "The six-part balance of a data engineer"
          },
          {
            kind: "prose",
            heading: "What a data engineer is responsible for",
            body: []
          },
          {
            kind: "image",
            src: deResponsibilityImg,
            alt: "Data engineer responsibilities",
            caption: "Core responsibilities of a data engineer"
          },
          {
            kind: "prose",
            body: [
              "### 1. Making data available",
              "Data begins in many places: product events, payment systems, spreadsheets, APIs, support tools, and databases.",
              "A data engineer creates pipelines that collect this data and move it into a central place, such as a data warehouse or data lake.",
              "For example, an online store may need daily data from orders, customers, inventory, and ad platforms in one place before anyone can answer, “Which campaign created the most repeat customers?”",
              "### 2. Making data trustworthy",
              "Raw data is often incomplete, duplicated, incorrectly formatted, or inconsistent.",
              "A data engineer transforms it into a version that others can safely use. This might include standardizing dates, removing duplicate orders, handling missing values, and documenting what each field means.",
              "The goal is simple: when someone sees `revenue` in a report, they should know exactly how it was calculated.",
              "### 3. Designing the data system",
              "Data engineers choose how data should move through a company.",
              "They decide which data should be stored, where it should live, how often it should update, and who should be allowed to access it. They also plan for change. A pipeline that works for 100 customers may fail when the company has 10 million events per day.",
              "This does not always mean building custom systems. Often, the best solution is a simple managed tool that solves the real problem well.",
              "### 4. Keeping pipelines reliable",
              "A pipeline is only useful if it runs when expected.",
              "Data engineers monitor failures, set up alerts, retry safe operations, and test changes before releasing them. They also schedule dependent jobs in the correct order.",
              "For example, a daily sales table should not update before the order data has arrived.",
              "This approach is often called DataOps. It applies software delivery habits, testing, monitoring, and teamwork to data systems.",
              "### 5. Protecting data",
              "Some data is sensitive. Think names, email addresses, payment details, health information, or employee records.",
              "Data engineers help protect it by controlling access, encrypting data where needed, tracking how it is used, and keeping only the data that has a clear purpose.",
              "Security is not a final checklist item. It is part of how the system is designed.",
              "### 6. Working with people across the company",
              "Data engineers work with analysts, data scientists, software engineers, product managers, and business teams.",
              "A request such as “We need customer churn data” is not yet a technical requirement. The engineer needs to ask follow-up questions:"
            ]
          },
          {
            kind: "list",
            items: [
              "What counts as a churned customer?",
              "How quickly does the data need to update?",
              "Who will use it?",
              "What decision will it support?"
            ]
          },
          {
            kind: "prose",
            body: [
              "Clear communication prevents teams from building the wrong thing efficiently."
            ]
          },
          {
            kind: "prose",
            heading: "Skills to build first",
            body: [
              "You do not need to learn every data tool before starting. Focus on these foundations:"
            ]
          },
          {
            kind: "image",
            src: skillsToBuildFirstImg,
            alt: "Skills to build first",
            caption: "Core skills for data engineers"
          },
          {
            kind: "prose",
            body: [
              "Start with SQL. It is the language you will use often, even when working with modern cloud tools."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "Imagine a fitness app where every time a user completes a workout, the app records an event.",
              "If the product team wants a weekly retention report, a data engineer would build a pipeline to reliably collect, clean, and deliver that data.",
              "Here is what that process might look like:"
            ]
          },
          {
            kind: "image",
            src: fitnessAppImg,
            alt: "Fitness app data pipeline",
            caption: "A simple fitness app data pipeline"
          },
          {
            kind: "prose",
            body: [
              "The analyst can now build the report without manually combining raw files every week."
            ]
          },
          {
            kind: "list",
            heading: "Common mistakes",
            items: [
              "**Learning tools before fundamentals:** Learn how data moves and changes before chasing every new platform.",
              "**Treating data quality as someone else’s problem:** Unclear or broken data reduces trust in every downstream report.",
              "**Building too much too early:** Use the simplest system that meets the current need and can grow with the company.",
              "**Ignoring the business question:** A technically impressive pipeline is still a failure if it does not support a useful decision."
            ]
          },
          {
            kind: "takeaways",
            items: [
              "Data engineers create reliable paths from raw data to useful data.",
              "Their responsibilities include data quality, system design, reliability, security, and collaboration.",
              "Strong fundamentals matter more than knowing every tool.",
              "Good data engineering balances business value with cost, simplicity, and scale."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "skills-quiz-1",
                question: "What is the main goal of a data pipeline?",
                options: [
                  "To build machine learning models.",
                  "To make useful data available reliably.",
                  "To design business dashboards.",
                  "To manually combine raw files every week."
                ],
                correctIndex: 1,
                explanation: "The main goal of a data pipeline is to reliably move data from its source to where it can be used."
              },
              {
                id: "skills-quiz-2",
                question: "Why does a data engineer need communication skills?",
                options: [
                  "To write Python scripts faster.",
                  "To manage their team's vacation schedule.",
                  "To turn business needs into clear data requirements.",
                  "To memorize every new data tool."
                ],
                correctIndex: 2,
                explanation: "A data engineer must ask the right questions to understand what the business actually needs before building a solution."
              },
              {
                id: "skills-quiz-3",
                question: "Which skill should most beginners prioritize first?",
                options: [
                  "SQL",
                  "Advanced orchestration",
                  "Machine learning",
                  "Kubernetes"
                ],
                correctIndex: 0,
                explanation: "Start with SQL. It is the core language used to query, combine, and transform data."
              }
            ]
          }
        ]
      }
    ]
  }
};
