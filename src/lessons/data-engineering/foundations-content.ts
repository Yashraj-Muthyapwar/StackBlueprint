import { type LessonContent, type Section } from "@/lessons/types";
export type { Section };

import dataLifecycleImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/data-engineering-lifecycle.png";
import evolutionImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/evolution-of-data-engineering.png";
import scenarioImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/scenario.png";
import deResponsibilityImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/data-engineer-responsibility.png";
import deSkillsImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/data-engineer-skills.png";
import fitnessAppImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/fitness-app.png";
import sixPartBalanceImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/six-part-balance.png";
import skillsToBuildFirstImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/skills-to-build-first.png";
import dataEngineerBridgeImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/data-engineer-the-bridge.png";
import internalExternalFacingImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/internal-external-facing.png";
import upstreamDownstreamImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/upstream-downstream.png";
import foodDeliveryExampleImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/food-delivery-example.png";
import vagueRequestsImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/vague_requests.png";
import peopleDEWorksWithImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/people-a-data-engineer-works-with.png";
import requestsIntoRequirementsImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/requests-into-requirements.png";
import marketingTeamExampleImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/marketing-team-example.png";
import deOnCloudImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/DE-on-cloud.png";
import cloudVsOnPremisesImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/cloud-vs-on-premises.png";
import retailCompanyExampleImg from "@/images/data-engineering-fundamentals/foundations/Understanding_the_Data_Engineering_Discipline/retail-company-example.png";

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
              "A ^^data engineer^^ builds the systems that move data from where it is created to where people can use it. Without that foundation, dashboards become unreliable, analysts lose time, and machine learning projects struggle to get useful data.",
              "A **data engineer** is not usually the person making the dashboard or training the model. They make sure the right data reaches those people safely, accurately, and on time."
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
      },
      {
        slug: "within-organization",
        title: "1.4 Data Engineers Within an Organization",
        subtitle: "Learn where data engineers fit in a company and who their work supports.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "Data engineers do not work alone. They sit between the systems that produce data and the people or products that need it.",
              "Understanding this position helps you design better pipelines, ask better questions, and avoid building data systems nobody can use."
            ]
          },
          {
            kind: "image",
            src: dataEngineerBridgeImg,
            alt: "Data Engineer at the core of Data Infrastructure",
            caption: "The Data Engineer sits at the center of the data ecosystem, connecting data sources to data consumers."
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: ["A data engineer connects two sides of an organization:",
              "**Upstream:** Systems and teams that create raw data.",
              "**Downstream:** People and systems that use prepared data.",
            ]
          },
          {
            kind: "image",
            src: upstreamDownstreamImg,
            alt: "Upstream vs Downstream",
            caption: "Connecting data producers to data consumers"
          },
          {
            kind: "prose",
            body: [
              "For example, a checkout service produces order events. A data engineer collects and prepares those events. An analyst then uses the prepared data to understand weekly sales."
            ]
          },
          {
            kind: "prose",
            heading: "Internal-facing and external-facing work",
            body: []
          },
          {
            kind: "image",
            src: internalExternalFacingImg,
            alt: "Internal vs External",
            caption: "Internal dashboard with daily refresh versus customer app with near real-time updates."
          },
          {
            kind: "prose",
            body: [
              "### 1. Internal-facing data engineering",
              "Internal-facing data engineers build systems for people inside the company.",
              "Their work often supports:"
            ]
          },
          {
            kind: "list",
            items: [
              "Dashboards and reports",
              "Business operations",
              "Analyst queries",
              "Data science projects",
              "Machine learning models"
            ]
          },
          {
            kind: "prose",
            body: [
              "For example, an internal sales dashboard may show revenue, refunds, and conversion rate. The data engineer makes sure its underlying data is accurate and updated at the right time."
            ]
          },

          {
            kind: "prose",
            body: [
              "### 2. External-facing data engineering",
              "External-facing data engineers build systems that directly support customer-facing products.",
              "Examples include:"
            ]
          },
          {
            kind: "list",
            items: [
              "Product recommendations",
              "Live delivery tracking",
              "Customer activity feeds",
              "Connected device data",
              "In-app analytics"
            ]
          },
          {
            kind: "prose",
            body: [
              "This work often has stricter requirements. A customer-facing system may need to serve many users at once, respond quickly, and carefully separate one customer’s data from another’s."
            ]
          },
          {
            kind: "prose",
            body: [
              "### 3. Most roles are a blend",
              "A company may use the same clean order data for an internal finance report and a customer-facing order tracking feature.",
              "The needs differ. Internal teams may accept a daily refresh. A customer checking their delivery status expects a much faster answer.",
              "The data engineer must understand who uses the data and what “good enough” means for that use case."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "A food delivery company wants to improve delivery-time estimates.",
              "The app creates order, driver location, and delivery events. A data engineer prepares this information in two ways:",
              "A fast data stream powers the delivery estimate shown to customers.",
              "A daily dataset helps operations teams find slow delivery areas.",
              "The raw data is similar, but the consumers and requirements are different."
            ]
          },
          {
            kind: "image",
            src: foodDeliveryExampleImg,
            alt: "Food delivery example",
            caption: "Food delivery data pipeline for different requirements"
          },
          {
            kind: "takeaways",
            items: [
              "Data engineers connect data producers with data consumers.",
              "Internal-facing work supports teams inside the company.",
              "External-facing work supports customer-facing products.",
              "The same raw data can serve different users with different requirements."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "org-quiz-1",
                question: "What is an upstream stakeholder?",
                options: [
                  "A person or system that creates or provides source data.",
                  "A person or system that uses prepared data.",
                  "An analyst building dashboards.",
                  "A customer viewing their activity feed."
                ],
                correctIndex: 0,
                explanation: "Upstream stakeholders (producers) are the source of the data."
              },
              {
                id: "org-quiz-2",
                question: "What is a downstream stakeholder?",
                options: [
                  "A person or system that creates or provides source data.",
                  "A person or system that uses prepared data.",
                  "A database server generating logs.",
                  "A third-party API."
                ],
                correctIndex: 1,
                explanation: "Downstream stakeholders (consumers) use the data that has been prepared."
              },
              {
                id: "org-quiz-3",
                question: "Why might internal and external data systems need different designs?",
                options: [
                  "Because internal teams don't care about data quality.",
                  "They can have different needs for speed, scale, security, and reliability.",
                  "External data systems always use SQL, while internal systems use Python.",
                  "Internal systems never need to be updated."
                ],
                correctIndex: 1,
                explanation: "Customer-facing (external) systems often have stricter requirements for speed, uptime, and security compared to an internal daily report."
              }
            ]
          }
        ]
      },
      {
        slug: "working-with-stakeholders",
        title: "1.5 Working With Stakeholders and Data Requirements",
        subtitle: "Learn how data engineers collaborate with other teams and turn vague requests into useful data systems.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "A data request often begins with a broad statement such as, “We need customer data” or “Can we track campaign performance?”",
              "Those statements are not enough to build a pipeline. A data engineer must discover the real goal, define the needed data, and agree on how the result should work."
            ]
          },
          {
            kind: "image",
            src: vagueRequestsImg,
            alt: "Vague requests vs useful systems",
            caption: "Turning vague requests into actionable pipelines"
          },
          {
            kind: "prose",
            heading: "The people a data engineer works with",
            body: [
              "**Upstream stakeholders: the data producers**",
              "Upstream stakeholders own or influence the systems that generate data.",
              "**Downstream stakeholders: the data consumers**",
              "Downstream stakeholders use prepared data to make decisions, build models, or power products."
            ]
          },
          {
            kind: "image",
            src: peopleDEWorksWithImg,
            alt: "People a data engineer works with",
            caption: "Upstream producers and downstream consumers"
          },
          {
            kind: "prose",
            body: [
              "The goal is not to give every team all available data. The goal is to provide the right data in a form they can understand and trust."
            ]
          },
          {
            kind: "prose",
            heading: "Turn requests into requirements",
            body: [
              "### 1. Start with the Decision",
              "Ask what decision the report will actually support. Uncover who needs it, which metrics matter, and why before writing a single line of code.",
              "### 2. Define Freshness",
              "Balance business needs against cost and effort. Real-time streaming adds massive complexity, so choose the slowest update frequency (monthly, daily, or hourly) that still serves the goal.",
              "### 3. Agree on Definitions",
              "Document exact business logic for shared terms like \"daily sales\" (orders placed vs. payments completed vs. net revenue). One shared definition keeps dashboards from contradicting each other.",
              "### 4. Include Non-Functional Requirements",
              "A good data solution needs to be more than just correct. Plan upfront for security, budget limits, query speed, uptime, maintainability, and legal compliance."
            ]
          },
          {
            kind: "image",
            src: requestsIntoRequirementsImg,
            alt: "Requests into requirements",
            caption: "The process of defining requirements"
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "Here is how asking the right questions turns a vague stakeholder request into a clear technical execution plan, saving engineering time and cloud costs.",
            ]
          },
          {
            kind: "list",
            items: [
              "The team checks the report every two hours.",
              "They need paid orders, not all orders.",
              "Refunds can wait until the next day.",
              "The report should show campaign, region, and revenue.",
              "Only the marketing team should access customer-level details."
            ]
          },
          {
            kind: "prose",
            body: [
              "The original request becomes a clear plan: refresh an aggregate sales table every hour, define paid revenue, restrict access to customer details, and publish the table to the reporting tool."
            ]
          },
          {
            kind: "image",
            src: marketingTeamExampleImg,
            alt: "Marketing team example",
            caption: "Turning a marketing request into a data pipeline plan"
          },
          {
            kind: "list",
            heading: "Common mistakes",
            items: [
              "**Taking requests literally:** Ask what decision the stakeholder is trying to make.",
              "**Skipping data definitions:** Agree on important terms before building.",
              "**Assuming real time is required:** Match refresh speed to the actual business need.",
              "**Ignoring upstream changes:** Stay in contact with source-system owners so pipeline changes do not surprise you.",
              "**Building without feedback:** Show early versions and adjust before investing heavily."
            ]
          },
          {
            kind: "takeaways",
            items: [
              "Data engineers work with both data producers and data consumers.",
              "Clear requirements begin with a business decision, not a tool choice.",
              "Freshness, definitions, security, cost, and access all shape a data system.",
              "Frequent feedback makes the final system more useful and reliable."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "req-quiz-1",
                question: "What is the first question to ask about a data request?",
                options: [
                  "What database should we use?",
                  "What decision or outcome will this data support?",
                  "How fast can we build this pipeline?",
                  "Which dashboard tool does the stakeholder prefer?"
                ],
                correctIndex: 1,
                explanation: "Always understand the business goal and decision before designing a solution."
              },
              {
                id: "req-quiz-2",
                question: "What does data freshness mean?",
                options: [
                  "How recently the data was updated.",
                  "How clean the data is.",
                  "How secure the data is.",
                  "How long the data has been stored."
                ],
                correctIndex: 0,
                explanation: "Data freshness refers to the frequency at which data is updated (e.g., hourly, daily, real-time)."
              },
              {
                id: "req-quiz-3",
                question: "Why are shared definitions important?",
                options: [
                  "They make SQL queries run faster.",
                  "They reduce the cost of cloud storage.",
                  "They keep teams from measuring the same metric in different ways.",
                  "They eliminate the need for data security."
                ],
                correctIndex: 2,
                explanation: "Shared definitions (like 'daily sales') ensure everyone in the company is looking at the same reality and dashboards do not contradict each other."
              }
            ]
          }
        ]
      },
      {
        slug: "data-engineering-on-the-cloud",
        title: "1.6 Data Engineering on the Cloud",
        subtitle: "Learn how cloud platforms support the data engineering lifecycle and how AWS, Google Cloud, and Azure map to the same core jobs.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "Cloud platforms let data teams store, process, and serve data without owning physical servers. Instead of starting by managing infrastructure, a team can focus on building reliable data products.",
              "The tools have different names across AWS, Google Cloud, and Azure. The underlying data engineering work stays the same."
            ]
          },
          {
            kind: "image",
            src: deOnCloudImg,
            alt: "DE on cloud",
            caption: "The underlying data engineering work stays the same across clouds."
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "Every cloud data platform follows a similar flow:"
            ]
          },
          {
            kind: "pipeline-flow",
            steps: [
              { title: "Generate", description: "An app, database, device, API, or SaaS tool creates data." },
              { title: "Ingest", description: "The data enters the platform." },
              { title: "Store", description: "The platform keeps raw and prepared data." },
              { title: "Transform", description: "Raw data is cleaned, joined, and modeled." },
              { title: "Serve", description: "People, applications, and models use the prepared data." }
            ]
          },
          {
            kind: "prose",
            body: [
              "Security, access control, cost management, testing, and monitoring apply at every stage."
            ]
          },
          {
            kind: "prose",
            heading: "The lifecycle across cloud providers",
            body: [
              "### 1. Generate and ingest data",
              "Data can come from product databases, web events, payment providers, CSV files, APIs, and connected devices.",
              "There are two common ingestion patterns:",
              "Batch ingestion: Data arrives on a schedule, such as every hour or every night.",
              "Streaming ingestion: Events arrive continuously or with very low delay.",
              "A daily finance report may work well with batch ingestion. A fraud detection system may need streaming data."
            ]
          },
          {
            kind: "cloud-provider-grid",
            items: [
              { provider: "AWS", content: "**Amazon Kinesis** or **Amazon Data Firehose** can receive and deliver streaming data." },
              { provider: "Google Cloud", content: "**Pub/Sub** receives messages, while **Dataflow** can process batch and streaming pipelines." },
              { provider: "Azure", content: "**Event Hubs** handles event streams, while **Data Factory** is commonly used for scheduled data movement." }
            ]
          },
          {
            kind: "prose",
            body: [
              "### 2. Store data",
              "Cloud data is commonly stored in one of two places.",
              "**Data lake**",
              "A data lake stores raw, semi-structured, and unstructured data. Files such as JSON, CSV, logs, images, and Parquet files can live there."
            ]
          },
          {
            kind: "cloud-provider-grid",
            items: [
              { provider: "AWS", content: "**Amazon S3**" },
              { provider: "Google Cloud", content: "**Cloud Storage**" },
              { provider: "Azure", content: "**Azure Data Lake Storage Gen2**" }
            ]
          },
          {
            kind: "prose",
            body: [
              "**Data warehouse**",
              "A data warehouse stores curated data for reporting and analytics. It is usually organized into tables that analysts can query with SQL."
            ]
          },
          {
            kind: "cloud-provider-grid",
            items: [
              { provider: "AWS", content: "**Amazon Redshift**" },
              { provider: "Google Cloud", content: "**BigQuery**" },
              { provider: "Azure", content: "**Azure Synapse Analytics**" }
            ]
          },
          {
            kind: "prose",
            body: [
              "A practical design often uses both. Store raw data in a lake, then create cleaned analytics tables in a warehouse or lakehouse.",
              "### 3. Transform data",
              "Transformation turns raw data into reliable data.",
              "A transformation might **remove duplicate events, convert timestamps to a shared time zone, standardize country codes, join orders with customer data, calculate daily revenue**, and **create a table ready for a dashboard**.",
              "This work may happen before loading into a warehouse, called ETL, or after loading, called ELT. Cloud warehouses often make ELT practical because they can process large SQL workloads."
            ]
          },
          {
            kind: "cloud-provider-grid",
            items: [
              { provider: "AWS", content: "**AWS Glue** can prepare and integrate data. **Amazon EMR** is another option for managed big-data frameworks." },
              { provider: "Google Cloud", content: "**Dataflow** runs **Apache Beam** pipelines for batch and streaming transformations." },
              { provider: "Azure", content: "**Azure Databricks** and **Azure Synapse** can clean, transform, and process data." }
            ]
          },
          {
            kind: "prose",
            body: [
              "### 4. Serve data",
              "Serving makes prepared data useful.",
              "The destination may be **a business dashboard**, **a SQL query used by an analyst**, **a recommendation service in an application**, **a machine learning training dataset**, or **an operational report**."
            ]
          },
          {
            kind: "prose",
            body: [
              "The right serving pattern depends on the need. A weekly executive report can refresh daily. A delivery-tracking screen may need updates within seconds."
            ]
          },
          {
            kind: "cloud-provider-grid",
            items: [
              { provider: "AWS", content: "**Athena** can query data in S3 with SQL. **QuickSight** can create dashboards." },
              { provider: "Google Cloud", content: "**BigQuery** can serve analytics queries, with **Looker** for reporting and exploration." },
              { provider: "Azure", content: "**Synapse Analytics** can serve SQL workloads, with **Power BI** for dashboards." }
            ]
          },
          {
            kind: "image",
            src: cloudVsOnPremisesImg,
            alt: "Cloud vs on-premises",
            caption: "On-Premises Infrastructure vs. Cloud Data Platform"
          },
          {
            kind: "prose",
            heading: "A simple migration path",
            body: [
              "Moving to the cloud is not just copying data to a new location. Treat it as a staged project.",
              "### 1. Assess",
              "List the current data sources, pipelines, users, dependencies, security needs, and costs.",
              "Ask which workloads should move first. A low-risk reporting pipeline is often a better first migration than the most critical production system.",
              "### 2. Design the foundation",
              "Set up identity and access rules, networking, encryption, monitoring, tagging, and cost controls before moving sensitive workloads.",
              "### 3. Migrate a small workload",
              "Move one pipeline, validate the results against the old system, and fix gaps. This creates a repeatable pattern for later migrations.",
              "### 4. Optimize after moving",
              "Review query cost, storage layout, pipeline speed, access policies, and reliability. Migration is not finished when the data arrives in the cloud.",
              "AWS describes a similar progression as assess, mobilize, and migrate. The important principle applies across all cloud providers: understand the current state before moving at scale."
            ]
          },
          {
            kind: "prose",
            heading: "A Simple Example",
            body: [
              "Here is how a single pipeline transforms raw website and mobile app events into clean, trusted data to power BI dashboards, analytics, and personalization models across major cloud platforms."
            ]
          },
          {
            kind: "image",
            src: retailCompanyExampleImg,
            alt: "Retail company example",
            caption: "A cross-cloud example of a retail data pipeline."
          },
          {
            kind: "list",
            heading: "Common mistakes",
            items: [
              "**Choosing tools before defining the need:** Start with data volume, freshness, users, security, and budget.",
              "**Assuming streaming is always better:** It adds complexity and cost. Use it when low latency creates real value.",
              "**Skipping governance:** Access controls, data definitions, and lineage matter from the first pipeline.",
              "**Treating migration as a one-time copy:** Validate, monitor, and optimize after every move.",
              "**Trying to learn every cloud at once:** Learn the lifecycle first, then go deep on one platform."
            ]
          },
          {
            kind: "takeaways",
            items: [
              "AWS, Google Cloud, and Azure use different names for similar data engineering jobs.",
              "The lifecycle is more important than any single service.",
              "Data lakes store broad and often raw data. Warehouses organize curated data for analytics.",
              "Cloud simplifies infrastructure management, but it does not remove responsibility for security, quality, or cost."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "cloud-quiz-1",
                question: "What is the difference between batch and streaming ingestion?",
                options: [
                  "Batch is for small data; streaming is for large data.",
                  "Batch moves data on a schedule. Streaming processes events continuously or with low delay.",
                  "Batch is used only by AWS; streaming is used by Google Cloud.",
                  "Batch requires SQL; streaming requires Python."
                ],
                correctIndex: 1,
                explanation: "Batch ingestion runs at set intervals (e.g., daily), while streaming ingestion handles data as it arrives."
              },
              {
                id: "cloud-quiz-2",
                question: "When would you use a data lake?",
                options: [
                  "When you need to store raw or varied data types, including files and semi-structured data.",
                  "When analysts only need to run fast SQL queries on highly structured data.",
                  "When you want to replace your product database.",
                  "When you need to build business dashboards directly."
                ],
                correctIndex: 0,
                explanation: "Data lakes are flexible storage repositories that can hold all types of data (structured, semi-structured, unstructured)."
              },
              {
                id: "cloud-quiz-3",
                question: "Why is a cloud migration not finished after moving data?",
                options: [
                  "Because cloud providers require monthly data re-uploads.",
                  "The system still needs validation, security controls, monitoring, and cost optimization.",
                  "Because on-premises servers must be kept running as backups forever.",
                  "Data instantly becomes corrupted in the cloud and must be cleaned manually."
                ],
                correctIndex: 1,
                explanation: "Moving data is only one step; ensuring the system is secure, performant, and cost-effective is an ongoing process."
              }
            ]
          }
        ]
      }
    ]
  }
};
