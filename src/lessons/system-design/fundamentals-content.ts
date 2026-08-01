import { type LessonContent, type Section } from "@/lessons/types";
import keyComponentsImg from "@/images/system-design/Foundations/key-components.png";
import deliveryFrameworkImg from "@/images/system-design/Foundations/delivery-framework.png";

export type { Section };

export type FoundationTopicMeta = {
  slug: string;
  title: string;
  category: string;
  blurb: string;
  iconKey: "container" | "layers" | "terminal";
  lessons: LessonContent[];
};

const whatIsSystemDesign: LessonContent = {
  slug: "what-is-system-design",
  title: "What is System Design?",
  subtitle:
    "The process of designing the architecture, components, and interfaces of a system to meet specific requirements.",
  sections: [
    {
      kind: "prose",
      heading: "Understanding System Design",
      body: [
        "System design is the process of defining the architecture, modules, interfaces, and data for a system to satisfy specified requirements. It involves translating user requirements into a detailed blueprint that guides the implementation phase.",
        "The primary goal is to create a well-organized and efficient structure that meets the intended purpose while considering crucial factors like scalability, maintainability, and performance. It is the stage where the Software Requirements Specification (SRS) report is transformed into a component architecture that can be executed.",
        "System Design is one of the most critical steps in software development, affecting all significant stages from implementation to deployment."
      ],
    },
    {
      kind: "prose",
      heading: "Why is System Design so important?",
      body: [
        "**Scalability**: Systems must handle growth in users, traffic, and data without degrading. Poor design leads directly to bottlenecks.",
        "**Reliability & Fault Tolerance**: Designing so that hardware or network failures don't bring down the whole system. This includes redundancy, failover, and disaster recovery.",
        "**Performance Optimization**: Proper caching, efficient database queries, load balancing, and CDN usage drastically improve response times and throughput.",
        "**Cost Efficiency**: A better design means fewer wasted resources, lower operational costs, and less maintenance overhead.",
        "**Being Prepared for the Unexpected**: Sudden traffic spikes, changing requirements, and failure modes are all anticipated and handled gracefully through solid design.",
        "**Collaboration & Communication**: Good system design allows teams to coordinate better by establishing a common language for the architecture and clear responsibilities.",
        "**Future-Proofing**: It helps in adapting systems to new needs without requiring complete rewrites."
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "What Happens When System Design Is Poor?",
      body: "Famous examples include Twitter's early 'Fail Whale' days (caused by a monolithic architecture, database bottlenecks, and lack of caching) and the Healthcare.gov launch crash (due to insufficient testing, database overload, no caching, and brittle third-party integrations)."
    },
    {
      kind: "prose",
      heading: "The 10 Big Questions of System Design",
      body: [
        "1. **Scalability:** How will the system handle a large number of users or requests simultaneously?",
        "2. **Latency and Performance:** How can we reduce response time and ensure low-latency performance under load?",
        "3. **Communication:** How do different components of the system interact with each other?",
        "4. **Data Management:** How should we store, retrieve, and manage data efficiently?",
        "5. **Fault Tolerance and Reliability:** What happens if a part of the system crashes or becomes unreachable?",
        "6. **Security:** How do we protect the system against threats such as unauthorized access or DDoS attacks?",
        "7. **Maintainability and Extensibility:** How easy is it to maintain, monitor, debug, and evolve the system over time?",
        "8. **Cost Efficiency:** How can we balance performance with infrastructure cost?",
        "9. **Observability and Monitoring:** How do we monitor system health and diagnose issues in production?",
        "10. **Compliance and Privacy:** Are we complying with relevant laws and regulations (e.g., GDPR, HIPAA)?"
      ],
    },
    {
      kind: "prose",
      heading: "Key Components of a System",
      body: [
        "**Client (User Interface)**: The frontend where users interact (web app, mobile app, desktop app). It sends requests and displays responses.",
        "**Server (Application Layer)**: Processes client requests and implements business logic. Can be monolithic or microservices-based.",
        "**Database**: Stores persistent data. Can be Relational (SQL) for structured data and strong consistency, or Non-Relational (NoSQL) for flexible, scalable storage.",
        "**APIs (Communication Layer)**: Defines how different parts interact (REST, GraphQL, gRPC, WebSockets).",
        "**Load Balancer**: Distributes traffic across multiple servers to prevent overload and increase availability.",
        "**Cache**: Stores frequently used data in memory (like Redis or Memcached) for fast access.",
        "**Message Queue**: Handles asynchronous communication between services (Kafka, RabbitMQ).",
        "**Storage Systems**: Object storage for files and media (S3), and block storage for raw data.",
        "**Monitoring & Logging**: Tools for health checks, error tracking, and performance metrics (Prometheus, Grafana, ELK).",
        "**Security Layer**: Authentication, authorization, encryption, firewalls, and rate limiting.",
      ]
    },
    {
      kind: "image",
      src: keyComponentsImg,
      alt: "Diagram illustrating the key components of a system architecture",
      caption: "The core components that make up a large-scale system",
    },
    {
      kind: "prose",
      heading: "Objectives of System Design",
      body: [
        "**Practicality**: Making a system that suits the needs of target users in real-time scenarios.",
        "**Correctness**: Satisfying all functional and non-functional requirements.",
        "**Completeness**: Being complete in all terms, from components to functionality specified in the SRS.",
        "**Efficiency**: Being resource-effective, optimizing both cost and time to deliver the required output within the allotted response time.",
        "**Flexibility**: Being able to adapt to changing user needs and environments.",
        "**Optimization**: Optimizing time (latency) and space (memory) across all components.",
        "**Reliability & Fault Tolerance**: Ensuring failure-free operation for a specified period and the ability to continue operating even when components fail."
      ]
    },
    {
      kind: "table",
      caption: "System Design Strategies",
      headers: ["Strategy", "What it is / How it Works", "Pros", "Cons"],
      rows: [
        ["Structured Design", "Break system into hierarchy of functional modules; top-down decomposition.", "Clear structure; easier debugging; module reuse.", "Rigid; hard to adapt; complex interdependencies at scale."],
        ["Functional-Oriented Design", "Decompose system by functions/processes rather than objects.", "Strong functionality focus; independent testing.", "Can cause redundancy; integration is tricky; tight coupling risk."],
        ["Object-Oriented Design (OOD)", "Use objects (encapsulation, inheritance, polymorphism); bundle state + behavior.", "Modularity, reuse, extensibility; maintainable.", "Over-engineering risk; misuse of inheritance adds complexity."],
        ["Bottom-Up Approach", "Start with low-level components; build/test them first; integrate into bigger system.", "Reuse of components; well-tested low-level parts; hides details early.", "Hard to see big picture; risk of building parts that don't fit."],
        ["Top-Down Approach", "Start with high-level view; break down into subsystems progressively until detailed.", "Good for requirements understanding; aligns with goals.", "May miss low-level optimizations; less flexible if requirements shift."],
        ["Incremental Approach", "Build system in small, usable increments; each version adds features.", "Early delivery; user feedback loop; reduces risk.", "Integration challenges; requires strong planning."]
      ]
    },
    {
      kind: "prose",
      heading: "High-Level Design (HLD) vs Low-Level Design (LLD)",
      body: [
        "System architecture can be depicted at a macro level (HLD) or a micro level (LLD).",
        "**High-Level Design (HLD)** takes into consideration the main components that will be developed for the product. The designer focuses on a high-level overview, including principal components, databases, services, and the relationships between each module, along with a brief description of the system. HLD is created first and acts as the blueprint for management and program teams.",
        "**Low-Level Design (LLD)** considers the in-depth and detailed design of each component mentioned in the HLD. It exposes the logical relationship between different elements and includes much more technical information. This includes IP addresses, class and sequence diagrams, algorithms, pseudocode, hardware interfaces, and implementation constraints. LLD is created after HLD and is used by the coding team to implement the logic."
      ]
    },
    {
      kind: "table",
      headers: ["Parameter", "High-Level Design (HLD)", "Low-Level Design (LLD)"],
      rows: [
        ["Input", "Software Requirement Specification (SRS)", "Reviewed High-Level Design (HLD)"],
        ["Definition", "Describes the main components for the resulting product.", "Describes the design of each element mentioned in the HLD."],
        ["Content", "System architecture details, database design, services, module relationships.", "Classes, interfaces, algorithms, and actual logic of components."],
        ["Chronology", "Created first.", "Created after HLD is completed."],
        ["Technicality", "Less technical.", "More technical."],
        ["Audience", "Management and program team.", "Implementers and the coding team."]
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "sysdesign-hld-vs-lld",
          question: "Which of the following would you expect to find in a Low-Level Design (LLD) document but NOT in a High-Level Design (HLD) document?",
          options: [
            "The choice of database (e.g., PostgreSQL vs MongoDB)",
            "The relationship between the web server and the database",
            "Class diagrams and pseudocode for a specific matching algorithm",
            "A brief description of the system's core services"
          ],
          correctIndex: 2,
          explanation: "LLD focuses on the micro-level implementation details like class diagrams, algorithms, and pseudocode. HLD focuses on the macro-level architecture, major components, and database choices."
        },
        {
          id: "sysdesign-nfr",
          question: "Designing a system so that hardware or network failures don't bring down the whole application is primarily addressing which objective?",
          options: [
            "Cost Efficiency",
            "Fault Tolerance and Reliability",
            "Performance Optimization",
            "Maintainability"
          ],
          correctIndex: 1,
          explanation: "Fault tolerance is the ability of the system to continue operating even when one or more of its components fail, directly improving reliability."
        },
        {
          id: "sysdesign-tradeoff",
          question: "What is the primary drawback of using the Bottom-Up approach to system design?",
          options: [
            "You cannot reuse any low-level components.",
            "It is impossible to test the components until the end.",
            "You may lose sight of the big picture and build parts that don't fit together.",
            "It forces you to write monolithic applications."
          ],
          correctIndex: 2,
          explanation: "Because you start by building small, low-level pieces without a finalized high-level blueprint, you risk building components that ultimately don't integrate well together into the larger system."
        }
      ]
    }
  ]
};

const deliveryFramework: LessonContent = {
  slug: "delivery-framework",
  title: "Delivery Framework",
  subtitle:
    "A structured, step-by-step approach to ace your system design interviews.",
  sections: [
    {
      kind: "prose",
      heading: "The Interview Framework",
      body: [
        "System design interviews are open-ended by design. Leveraging a consistent framework ensures you hit all the critical evaluating criteria while staying on schedule.",
        "A typical 45-minute session is best divided into these sequential phases:"
      ]
    },
    {
      kind: "image",
      src: deliveryFrameworkImg,
      alt: "A timeline showing the sequential delivery framework for system design interviews",
      caption: "The 45-minute interview delivery framework",
    },
    {
      kind: "prose",
      heading: "1. Requirements (~5 minutes)",
      body: [
        "Begin by pinpointing the exact problem you're solving. Don't jump to conclusions—ask clarifying questions.",
        "**Functional Requirements:** Outline the 2-3 most critical actions the system must support (e.g., 'Users can upload media', 'Users can view a feed').",
        "**Non-functional Requirements:** Establish constraints regarding scale, performance, availability, and consistency expectations.",
        "**Capacity Estimation:** Perform these calculations only if they'll influence your design (e.g., determining storage needs or peak QPS to justify architectural choices)."
      ]
    },
    {
      kind: "prose",
      heading: "2. Core Entities (~2 minutes)",
      body: [
        "Identify the primary data models in your system. For a ride-sharing app, this might be `Rider`, `Driver`, and `Trip`.",
        "Establishing these nouns early helps structure your database schema and solidifies your understanding of how data relates."
      ]
    },
    {
      kind: "prose",
      heading: "3. API or System Interface (~5 minutes)",
      body: [
        "Specify how clients will interact with your system. Outline the core endpoints that fulfill your functional requirements, along with their parameters.",
        "Write out clear signatures, such as `POST /v1/trip/request(rider_id, location)`.",
        "This ensures everyone agrees on the system's boundary and usage before you sketch any architecture."
      ]
    },
    {
      kind: "prose",
      heading: "4. Data Flow (~5 minutes)",
      body: [
        "Especially useful for backend pipelines and async systems, this step outlines the chronological sequence of events. Detail step-by-step how data moves through the system to produce an output.",
        "For instance, a web crawler or search engine indexer might look like:",
        "- Retrieve a list of seed URLs to process.",
        "- Download the raw HTML content.",
        "- Extract links and parse the text from the HTML.",
        "- Save the structured data for querying.",
        "- Queue new links for future processing.",
        "You'll use this flow to inform your components in the next step."
      ]
    },
    {
      kind: "prose",
      heading: "5. High-Level Design (~10-15 minutes)",
      body: [
        "Translate your APIs and Data Flow into a block diagram. Keep it straightforward initially.",
        "Sketch out the path from the client through the load balancer, into the application servers, and down to the database.",
        "Focus on creating an end-to-end working model before introducing complex scaling techniques."
      ]
    },
    {
      kind: "prose",
      heading: "6. Deep Dives (~10 minutes)",
      body: [
        "Now, elevate your design by identifying and resolving bottlenecks. This is where you demonstrate seniority.",
        "Address how to scale the database (sharding/replication), how to cut down latency (CDNs/caches), and how to ensure resilience (handling node failures).",
        "Take the lead in critiquing your own architecture and discussing the trade-offs of your proposed solutions."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "sysdesign-framework-api",
          question: "Why is it recommended to define the API or System Interface before drawing the High Level Design?",
          options: [
            "Because APIs strictly dictate which database technology you must use.",
            "To establish a clear contract on the inputs and outputs, ensuring alignment before designing components.",
            "Because interviewers usually grade the exact syntax of your API.",
            "You shouldn't; the High Level Design should always be the very first step."
          ],
          correctIndex: 1,
          explanation: "Defining the API establishes a clear contract. It proves you understand the functional requirements and guides what components you'll need to build in your High Level Design."
        },
        {
          id: "sysdesign-framework-data-flow",
          question: "When is the 'Data Flow' step particularly useful during an interview?",
          options: [
            "For simple CRUD web applications with no background processing.",
            "When designing backend data-processing systems or asynchronous pipelines.",
            "When you need to calculate the exact storage capacity required.",
            "Only when the interviewer explicitly asks for a flowchart."
          ],
          correctIndex: 1,
          explanation: "Data Flow is highly beneficial for systems with a sequence of actions or background processing (like web crawlers or video transcoders) to trace the data lifecycle before drawing the architecture."
        }
      ]
    }
  ]
};

export const FUNDAMENTALS_TOPICS: Record<string, FoundationTopicMeta> = {
  "getting-started": {
    slug: "getting-started",
    title: "Getting Started",
    category: "Fundamentals",
    iconKey: "layers",
    blurb:
      "Introduction to system design, core terminology, and the step-by-step interview delivery framework.",
    lessons: [whatIsSystemDesign, deliveryFramework],
  }
};
