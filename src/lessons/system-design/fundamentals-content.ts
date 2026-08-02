import { type LessonContent, type Section } from "@/lessons/types";
import keyComponentsImg from "@/images/system-design/Foundations/key-components.png";
import deliveryFrameworkImg from "@/images/system-design/Foundations/delivery-framework.png";
import funcVsNonFuncImg from "@/images/system-design/Foundations/functionl-vs-non-functional.png";
import backOfTheEnvelopeImg from "@/images/system-design/Foundations/back-of-the-envelope.png";
import internetProtocolImg from "@/images/system-design/Foundations/internet-protocol.png";
import osiModelImg from "@/images/system-design/Foundations/OSI-Model.png";
import natImg from "@/images/system-design/Foundations/nat.png";
import portsImg from "@/images/system-design/Foundations/ports.png";

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
      kind: "takeaways",
      items: [
        "System Design is the process of translating product requirements into a scalable, actionable technical blueprint.",
        "High-Level Design (HLD) focuses on the macro architecture and components, acting as a guide for management.",
        "Low-Level Design (LLD) focuses on the micro implementation details, acting as a guide for engineers to write code."
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
      kind: "takeaways",
      items: [
        "Follow a structured framework during interviews to prevent rambling and ensure you cover all critical bases.",
        "Always start by clarifying ambiguous requirements and defining concrete constraints.",
        "Establish a simple, working High-Level Design before attempting to optimize or scale individual components.",
        "Dedicate time at the end to dive deep into bottlenecks, trade-offs, and failure scenarios."
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

const functionalVsNonFunctional: LessonContent = {
  slug: "functional-vs-non-functional-requirements",
  title: "Functional vs Non-Functional Requirements",
  subtitle: "Understanding the difference between what a system should do and how well it should do it.",
  sections: [
    {
      kind: "prose",
      heading: "What are Functional Requirements (FRs)?",
      body: [
        "Functional requirements describe **what** the system must do: specific features, operations, and behaviors.",
        "They define the interactions between the system and its users, or between different internal components.",
        "Common examples include: authentication, search functionality, data processing, payment gateways, and report generation.",
        "",
        "**Key questions to ask for FRs:**",
        "- What specific features do we need to design for this system?",
        "- What are the possible edge cases we need to consider in our design?"
      ]
    },
    {
      kind: "prose",
      heading: "What are Non-Functional Requirements (NFRs)?",
      body: [
        "Non-functional requirements describe **how** the system should behave. These are the qualities, constraints, and metrics rather than specific features.",
        "Key quality attributes include:",
        "- **Performance** (response time, throughput)",
        "- **Security** (encryption, authorization)",
        "- **Usability, Reliability, Scalability, Maintainability, Portability**",
        "",
        "**Key questions for NFRs:**",
        "- How fast should the system respond to user actions?",
        "- Should the system be highly available?",
        "- How secure should the system be against unauthorized access?"
      ]
    },
    {
      kind: "image",
      src: funcVsNonFuncImg,
      alt: "Diagram illustrating Functional vs Non-Functional Requirements",
      caption: "Distinguishing between Functional and Non-Functional requirements"
    },
    {
      kind: "table",
      caption: "Examples (Functional vs Non-Functional)",
      headers: ["System", "Functional Requirements", "Non-Functional Requirements"],
      rows: [
        [
          "Online Banking",
          "• User login via username/password\n• Check account balance\n• Notifications for transactions",
          "• System responds in < 2 seconds\n• All transactions encrypted & meet security rules\n• Handle 100 million users; minimal downtime"
        ],
        [
          "Food Delivery App",
          "• Browse menu, place orders\n• Make payments, track orders in real time",
          "• Load menu in under 1 second\n• Support up to 50,000 concurrent orders at peak\n• Easy to use for first-time users (intuitive UI)"
        ]
      ]
    },
    {
      kind: "table",
      caption: "Differences / Contrast",
      headers: ["Aspect", "Functional Requirements", "Non-Functional Requirements"],
      rows: [
        ["Definition", "What the system should do (features, behaviors)", "How the system should perform; system qualities and constraints"],
        ["Visibility", "Directly observable in the software / product features", "Not directly seen as features; experienced (e.g. speed, robustness)"],
        ["Measurement", "Easier to test with functional tests—are features working?", "Harder to test; requires benchmarks, SLAs, performance/scalability/security tests"],
        ["Scope / Impact", "Drives core functionality and user flows; maps to business needs.", "Influences architecture, system design, implementation constraints."],
        ["Documentation", "Captured via use cases, user stories, functional specs.", "Captured in technical specifications, SLAs, performance/security/quality attribute definitions."]
      ]
    },
    {
      kind: "prose",
      heading: "Importance of Balancing Both",
      body: [
        "A system with all functional requirements but poor non-functional qualities (e.g. slow, insecure, unreliable) can be unusable in real life.",
        "Non-functional requirements often get overlooked early, but failing to address them leads to high cost refactors, performance issues, and user dissatisfaction.",
        "Good non-functional requirements help in scaling, maintenance, and future enhancements."
      ]
    },
    {
      kind: "prose",
      heading: "Common Challenges in Defining Requirements",
      body: [
        "- **Ambiguity in Requirements:** Requirements are sometimes vague or incomplete, making it difficult to clearly define what the system must do (functional) and how it should perform (non-functional).",
        "- **Changing Requirements:** As projects evolve, requirements often shift due to changing business goals, market trends, or user expectations, making it harder to maintain stability in design.",
        "- **Difficulty in Prioritization:** Determining which requirements matter most can be tricky. Functional needs frequently take priority, while critical non-functional aspects like security or scalability may be overlooked.",
        "- **Measuring Non-Functional Requirements:** Functional requirements are easier to test, whereas non-functional attributes such as usability, scalability, or reliability are harder to define in measurable terms and validate effectively.",
        "- **Overlapping or Conflicting Requirements:** Requirements can sometimes conflict or influence each other. For example, strengthening security may reduce system performance, requiring careful trade-offs."
      ]
    },
    {
      kind: "table",
      caption: "How to Gather Requirements",
      headers: ["Requirement Type", "Methods & Techniques"],
      rows: [
        [
          "Functional Requirements",
          "**Interviews:** Talk to stakeholders or users to understand their needs.\n**Surveys:** Distribute questionnaires to gather input from a larger audience.\n**Workshops:** Host sessions to brainstorm features and gather feedback."
        ],
        [
          "Non-functional Requirements",
          "**Performance Benchmarks:** Consult with IT teams to set expectations for performance and load.\n**Security Standards:** Consult with security experts to define best practices for data protection.\n**Usability Testing:** Test the system to find areas where users might struggle and refine the interface."
        ]
      ]
    },
    {
      kind: "prose",
      heading: "Identifying Core Features (FRs)",
      body: [
        "When designing a system, functional requirements act as the foundational 'Users must be able to...' statements. During an interview or architectural discussion, these should be the first points of alignment.",
        "This process is usually highly interactive. You should treat the interviewer like a product manager or client, asking probing questions to define the boundaries of the system. For instance, 'Does the platform need to support X?' or 'What should the behavior be when Y occurs?'",
        "If you were architecting a social media platform like Twitter, core features might include:",
        "- Users can publish text-based posts.",
        "- Users can subscribe to (follow) other accounts.",
        "- Users can view a timeline of posts from their subscriptions.",
        "Alternatively, if designing a low-level component like a distributed cache, the features might look like:",
        "- The cache allows clients to store key-value pairs.",
        "- The cache allows clients to retrieve values by key.",
        "- The cache supports time-to-live (TTL) evictions.",
        "",
        "**Crucial tip:** Stay focused. While a real-world system might have hundreds of minor features, your goal is to extract and prioritize the top 3 to 5 core flows. A massive list of requirements will bog down your design phase; evaluating your ability to focus on the most impactful features is a key signal interviewers look for."
      ]
    },
    {
      kind: "prose",
      heading: "Defining System Constraints (NFRs)",
      body: [
        "Non-functional requirements dictate the operational qualities that matter most for a seamless user experience. They can often be formulated as 'The system must be...' statements.",
        "Revisiting the Twitter example, crucial NFRs might be:",
        "- The system must prioritize high availability over strict consistency.",
        "- The architecture must smoothly scale to handle upwards of 100 million Daily Active Users (DAU).",
        "- The feed generation should be highly responsive, with latencies kept under 200 milliseconds.",
        "",
        "A major pitfall is leaving NFRs too vague. Saying 'the system should be fast' offers no real architectural guidance. Instead, quantifying the goal—such as 'search queries must return results in under 500ms'—provides a concrete target that will directly influence your technology choices."
      ]
    },
    {
      kind: "prose",
      heading: "NFR Brainstorming Checklist",
      body: [
        "If you are struggling to identify the right non-functional requirements for a novel domain, use this checklist to guide your thinking. Aim to pick the 3-5 constraints that will most heavily influence your architecture:",
        "**CAP Theorem Constraints:** Does the system demand strict consistency (like banking), or is high availability (like a social feed) more critical?",
        "**Environment Limitations:** Where is the software running? Are there bandwidth limitations, constrained memory (embedded devices), or battery concerns (mobile)?",
        "**Scale and Traffic Patterns:** Beyond general scale, does the system experience massive, predictable traffic spikes (e.g., ticket sales, holidays)? Is the system highly read-heavy, or write-heavy?",
        "**Latency Targets:** Which specific user actions require near-instantaneous computation or response? Prioritize the flows that impact user experience the most.",
        "**Durability Guarantees:** How catastrophic is data loss? A financial ledger requires 100% durability, whereas a temporary analytics cache might tolerate partial data loss during a crash.",
        "**Security & Privacy:** Does the system handle PII (Personally Identifiable Information), require strict access controls, or mandate at-rest encryption?",
        "**Fault Tolerance Strategy:** What is the acceptable blast radius of a failure? How quickly must the system recover from node crashes or data center outages?",
        "**Regulatory Compliance:** Are there specific legal frameworks (HIPAA, GDPR, SOC2) that dictate data residency or auditing capabilities?"
      ]
    },
    {
      kind: "takeaways",
      items: [
        "Functional Requirements define what the system MUST do (e.g., 'users can post a tweet').",
        "Non-Functional Requirements (NFRs) define how the system MUST behave (e.g., latency, availability, durability).",
        "NFRs dictate your architectural choices—a system optimizing for high availability looks entirely different from one optimizing for strict consistency."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "fn-vs-nfn-1",
          question: "Which of the following is a clear example of a Functional Requirement?",
          options: [
            "The system must handle 50,000 concurrent users at peak.",
            "The application should respond to user inputs in under 2 seconds.",
            "Users must be able to securely log in using their username and password.",
            "All data must be encrypted at rest."
          ],
          correctIndex: 2,
          explanation: "Functional requirements describe WHAT the system must do (e.g. logging in). The other options describe HOW the system behaves (concurrency, latency, encryption), which are Non-Functional Requirements."
        },
        {
          id: "fn-vs-nfn-2",
          question: "Why is it important to quantify Non-Functional Requirements?",
          options: [
            "To give the QA team a larger checklist.",
            "Vague requirements like 'fast' provide no architectural guidance.",
            "It makes the system design interview look more professional.",
            "Functional requirements are impossible to measure."
          ],
          correctIndex: 1,
          explanation: "Saying 'the system should be fast' doesn't help you choose the right technology. Quantifying it (e.g., 'search must return in <500ms') sets a concrete target for your architecture."
        }
      ]
    }
  ]
};

const backOfTheEnvelope: LessonContent = {
  slug: "back-of-the-envelope-estimation",
  title: "Back-of-the-Envelope Estimation",
  subtitle: "Master the art of quick, rough calculations to estimate scale and resource capacity.",
  sections: [
    {
      kind: "prose",
      heading: "What is Back-of-the-Envelope Estimation?",
      body: [
        "A back-of-the-envelope calculation is a rough, quick approximation of system scale, capacity, and resource requirements.",
        "It acts as 'impulse math'—calculations you could scribble on a napkin during an interview to prove your architecture can handle the load.",
        "These calculations are **not intended to be precise**. The goal is order-of-magnitude correctness to ensure your design decisions are rooted in reality."
      ]
    },
    {
      kind: "image",
      src: backOfTheEnvelopeImg,
      alt: "Diagram illustrating back-of-the-envelope estimations",
      caption: "Using math to validate system design constraints"
    },
    {
      kind: "table",
      caption: "Core Estimation Techniques",
      headers: ["Technique", "Meaning & Purpose", "Example"],
      rows: [
        ["Rule of Thumb", "Using heuristics based on prior experience when detailed info is missing.", "Estimating that a user will generate 1MB of text data per day as a baseline for storage planning."],
        ["Approximation", "Simplifying math by rounding to easy numbers without losing much accuracy.", "Using 1,000 users instead of 1,024 when calculating block size limits."],
        ["Breakdown & Aggregation", "Splitting a large problem into smaller pieces, estimating each, then summing them up.", "Estimating multimedia content and metadata separately, then adding them for total storage."],
        ["Sanity Check", "Cross-checking whether the final estimate makes real-world sense to avoid grossly unrealistic results.", "Comparing your estimated messaging storage with WhatsApp's known public metrics."]
      ]
    },
    {
      kind: "prose",
      heading: "Types of Estimations",
      body: [
        "During an interview, you'll be expected to calculate several different metrics depending on the system's focus. Here is a breakdown of the most common estimation types.",
        "",
        "**1. Load Estimation**",
        "Predicting the expected number of requests per second (RPS), data volume, or user traffic."
      ]
    },
    {
      kind: "code",
      language: "text",
      caption: "Load Estimation Example",
      code: "System has 100M Daily Active Users (DAU).\nEach user makes 10 requests per day.\n\nTotal Requests = 100M * 10 = 1 Billion requests/day\n\nRequests Per Second (RPS) = 1 Billion / 86,400 seconds\nRPS ≈ 11,574 requests/second"
    },
    {
      kind: "prose",
      body: [
        "**2. Storage Estimation**",
        "Estimating the amount of persistent storage required to hold the data generated by users over time (typically calculated per day or per year)."
      ]
    },
    {
      kind: "code",
      language: "text",
      caption: "Storage Estimation Example",
      code: "Photo app with 500M users.\nAverage 2 photos uploaded per user per day.\nAverage photo size is 2MB.\n\nDaily Storage = 500M users * 2 photos * 2MB\nDaily Storage = 2,000,000,000 MB = 2,000 TB/day = 2 PB/day"
    },
    {
      kind: "prose",
      body: [
        "**3. Bandwidth Estimation**",
        "Determining the network bandwidth needed to support data transfer without bottlenecking."
      ]
    },
    {
      kind: "code",
      language: "text",
      caption: "Bandwidth Estimation Example",
      code: "Video streaming service with 10M concurrent users.\nEach user streams 1080p video at 4 Mbps.\n\nRequired Bandwidth = 10M users * 4 Mbps\nRequired Bandwidth = 40,000,000 Mbps = 40 Tbps"
    },
    {
      kind: "prose",
      body: [
        "**4. Latency Estimation**",
        "Predicting the response time of a system. Sequential operations add latency together, while parallel operations take the max latency."
      ]
    },
    {
      kind: "code",
      language: "text",
      caption: "Latency Estimation Example",
      code: "An API fetches from 3 sources: 50ms, 100ms, and 200ms.\n\nIf sequential:\nTotal Latency = 50ms + 100ms + 200ms = 350ms\n\nIf parallel:\nTotal Latency = max(50ms, 100ms, 200ms) = 200ms"
    },
    {
      kind: "prose",
      body: [
        "**5. Resource & Memory Estimation**",
        "Estimating the hardware required to serve the traffic, such as CPU cores for computation or RAM for caching."
      ]
    },
    {
      kind: "code",
      language: "text",
      caption: "Resource & Memory Example",
      code: "CPU: 10,000 RPS. Each request needs 10ms of CPU time.\nTotal CPU time/sec = 10,000 * 10ms = 100,000ms\nCores Needed = 100,000ms / 1,000ms per core = 100 cores\n\nRAM: Cache 1% of a 10TB dataset.\nCache Size = 10TB * 0.01 = 0.1TB = 100GB of RAM"
    },
    {
      kind: "table",
      caption: "Cheat Sheet: Common Multipliers & Data Sizes",
      headers: ["Prefix", "Symbol", "Power of 10", "Power of 2", "Common Systems Metric"],
      rows: [
        ["Kilo", "KB", "10^3", "2^10", "Small text records, basic JSON payloads"],
        ["Mega", "MB", "10^6", "2^20", "Images, audio clips, web page assets"],
        ["Giga", "GB", "10^9", "2^30", "RAM limits, HD video clips"],
        ["Tera", "TB", "10^12", "2^40", "Hard drive sizes, daily DB writes"],
        ["Peta", "PB", "10^15", "2^50", "Big data lakes, total enterprise storage"]
      ]
    },
    {
      kind: "takeaways",
      items: [
        "Back-of-the-envelope calculations are rough estimates used to validate if a design can handle expected loads.",
        "Focus on calculating Traffic (QPS), Storage Requirements, and Bandwidth.",
        "Round your numbers aggressively to simplify math (e.g., 1 day ≈ 100,000 seconds).",
        "Use these estimates to justify your architecture (e.g., 'We need 3 database shards because a single instance can't hold 5TB of active data')."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "bote-1",
          question: "What is the primary goal of a Back-of-the-Envelope Estimation?",
          options: [
            "To calculate the exact number of servers needed down to the exact decimal.",
            "To prove to the interviewer that you are good at mental math.",
            "To achieve order-of-magnitude correctness to ensure your design is realistic.",
            "To estimate the final cost of the project in dollars."
          ],
          correctIndex: 2,
          explanation: "These estimations are not meant to be perfectly precise. They are meant to validate that your proposed architecture can handle the rough order-of-magnitude scale required."
        },
        {
          id: "bote-2",
          question: "If a system has 10 million DAU and each user makes 10 requests per day, what is the approximate Requests Per Second (RPS)? (Assume 1 day ≈ 86,400 seconds)",
          options: [
            "~115 RPS",
            "~1,157 RPS",
            "~11,574 RPS",
            "~100,000 RPS"
          ],
          correctIndex: 1,
          explanation: "Total daily requests = 10 million * 10 = 100,000,000. RPS = 100,000,000 / 86,400 ≈ 1,157 requests per second."
        }
      ]
    }
  ]
};

const ipLesson: LessonContent = {
  slug: "ip",
  title: "IP (Internet Protocol)",
  subtitle: "Understanding IP addresses, versions, and types.",
  sections: [
    {
      kind: "prose",
      heading: "What It Is?",
      body: [
        "An Internet Protocol (IP) address is a unique numerical label assigned to every device on a network, providing both identity and location information to route data accurately across the internet."
      ]
    },
    {
      kind: "image",
      src: internetProtocolImg,
      alt: "Internet Protocol Diagram",
      caption: "An overview of how IP connects devices on a network."
    },
    {
      kind: "callout",
      tone: "info",
      title: "Essential for Communication",
      body: "IP addresses are essential for communication on the internet (computers, routers, websites, IoT devices)."
    },
    {
      kind: "prose",
      heading: "Versions of IP",
      body: [
        "**1. IPv4**",
        "• 32-bit numeric, dot-decimal format.",
        "• Capacity: ~4.3 billion addresses.",
        "• Example: `102.22.192.181`.",
        "• **Limitations**: exhausted due to global internet growth.",
        "",
        "**2. IPv6**",
        "• 128-bit alphanumeric, hexadecimal format.",
        "• Capacity: ~3.4 × 10^38 addresses (virtually unlimited).",
        "• Example: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`.",
        "• Introduced in 1998, still being adopted."
      ]
    },
    {
      kind: "table",
      caption: "IPv4 Address Classes",
      headers: ["Class", "Leading Bits", "Range", "Default Subnet Mask", "Use Case"],
      rows: [
        ["A", "0", "0.0.0.0 - 127.255.255.255", "255.0.0.0", "Large organizations (16M hosts/network)"],
        ["B", "10", "128.0.0.0 - 191.255.255.255", "255.255.0.0", "Medium-sized organizations (65K hosts/network)"],
        ["C", "110", "192.0.0.0 - 223.255.255.255", "255.255.255.0", "Small organizations (254 hosts/network)"],
        ["D", "1110", "224.0.0.0 - 239.255.255.255", "N/A", "Multicast groups"],
        ["E", "1111", "240.0.0.0 - 255.255.255.255", "N/A", "Experimental / Reserved"]
      ]
    },
    {
      kind: "prose",
      heading: "CIDR Notation (Modern Routing)",
      body: [
        "While Classful addressing (Classes A, B, C) is historically important, it is largely obsolete in modern networking.",
        "Today, networks use **CIDR (Classless Inter-Domain Routing)**. CIDR allows for more flexible allocation of IP addresses by specifying the exact number of bits used for the network portion.",
        "• Format: `IP Address / Subnet Mask Bits`",
        "• Example: `192.168.1.0/24` means the first 24 bits define the network, leaving 8 bits (256 addresses) for the host.",
        "**Real-World Example (AWS VPC)**: When you create a virtual network in the cloud, you must define its size using CIDR. You might create a large VPC at `10.0.0.0/16` (65,536 addresses). You then chop that large network into smaller subnets, like a public subnet at `10.0.1.0/24` (256 addresses) for your web servers, and a private subnet at `10.0.2.0/24` for your databases. CIDR is the standard language for defining these network boundaries."
      ]
    },
    {
      kind: "prose",
      heading: "Syntax of IP Addresses",
      body: [
        "**IPv4 Syntax**",
        "An IPv4 address consists of four decimal numbers (octets), ranging from 0 to 255, separated by dots.",
        "• Format: `x.x.x.x`",
        "• Example: `192.168.1.1`",
        "• Binary representation: Each octet is 8 bits. Example: `11000000.10101000.00000001.00000001` (32 bits total).",
        "",
        "**IPv6 Syntax**",
        "An IPv6 address is represented as eight groups of four hexadecimal digits, separated by colons.",
        "• Format: `x:x:x:x:x:x:x:x`",
        "• Example: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`",
        "• **Shorthand notation**: Leading zeros within a group can be omitted (`0db8` -> `db8`). Consecutive groups of zeros can be replaced by a double colon `::` (only once per address).",
        "• Shortened Example: `2001:db8:85a3::8a2e:370:7334`"
      ]
    },
    {
      kind: "table",
      caption: "Types of IP Addresses",
      headers: ["Type", "Characteristics", "Example / Use Case"],
      rows: [
        [
          "**Public IP**",
          "• Assigned by ISP to your network/router.\n• Shared across all devices in that network.",
          "IP address provided to your router by the ISP."
        ],
        [
          "**Private IP**",
          "• Assigned internally by router to each device (computers, phones, smart TVs).",
          "`192.168.1.2`, `10.0.0.5`\nIP addresses generated by your home router for your devices."
        ],
        [
          "**Static IP**",
          "• Manually configured, **does not change**.\n• More reliable but expensive.",
          "• Server hosting\n• Remote access\n• Geo-location services"
        ],
        [
          "**Dynamic IP**",
          "• Assigned by DHCP server, **changes over time**.\n• Cheaper, more common for personal/consumer use.\n• Allows IP reuse within networks.",
          "More commonly used for consumer equipment and personal use."
        ]
      ]
    },
    {
      kind: "prose",
      heading: "Network Address Translation (NAT)",
      body: [
        "If millions of households use the exact same private IP address block (like `192.168.1.0/24`), how does the internet know where to send data without mixing everyone up?",
        "The answer is **NAT (Network Address Translation)**. NAT is a process running on your router that translates private, non-routable IP addresses on your internal network into a single, valid public IP address before sending data out to the internet.",
        "Without NAT, the IPv4 address space (only 4.3 billion addresses) would have run out in the early 2000s. NAT single-handedly saved IPv4 by allowing thousands of devices to share a single public IP.",
        "",
        "**🏢 The Corporate Mailroom Analogy**",
        "Imagine a massive office building. To the outside world, the entire building has just **one public address**: *123 Business Rd*. This is your **Public IP**.",
        "Inside the building, there are hundreds of employees, each with an internal desk number (Desk 10, Desk 25). These are **Private IPs**.",
        "When Employee Alice (Desk 10) sends a letter to a client, she drops it off at the Mailroom (the **Router**). The Mailroom puts the letter in a new envelope, writing the sender as *123 Business Rd* (so the client knows how to reply), but it writes down in a secret ledger: *\"I just sent a letter for Alice at Desk 10\"* (**NAT Table**).",
        "When the client replies to *123 Business Rd*, the Mailroom receives it, checks its ledger, sees the reply is meant for the letter Alice sent, and forwards it internally to Desk 10."
      ]
    },
    {
      kind: "image",
      src: natImg,
      alt: "Network Address Translation (NAT) Diagram",
      caption: "NAT allows multiple private IP devices to share a single public IP address."
    },
    {
      kind: "prose",
      body: [
        "**🌍 Real-World Example**",
        "1. Your smartphone (Private IP: `192.168.1.15`) wants to load `google.com`.",
        "2. The request is sent to your Home Wi-Fi Router.",
        "3. The router intercepts the packet, strips away your private IP, and replaces it with the router's Public IP assigned by your ISP (e.g., `203.0.113.5`). It records this swap in its NAT Table.",
        "4. Google sees a request from `203.0.113.5` and sends the website data back.",
        "5. Your router receives the data, checks its NAT Table, and knows it needs to route those packets specifically back to `192.168.1.15` (your phone)."
      ]
    },
    {
      kind: "ipv4-diagram",
    },
    {
      kind: "animation",
      variant: "ip-client-server",
      caption: "Real-world Example: Sending an HTTP Request"
    },
    {
      kind: "takeaways",
      items: [
        "IP (Internet Protocol) is the fundamental set of rules routing data across the internet.",
        "IPv4 uses 32-bit addresses (exhausted), while IPv6 uses 128-bit addresses to provide a virtually infinite supply.",
        "Public IPs route across the global internet; Private IPs are restricted to local networks.",
        "NAT (Network Address Translation) maps multiple private IPs to a single public IP to conserve the IPv4 address space."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "ip-1",
          question: "Which of the following is true about IPv6?",
          options: [
            "It uses a 32-bit numeric format.",
            "It is being phased out in favor of IPv4.",
            "It has a capacity of approximately 4.3 billion addresses.",
            "It uses a 128-bit alphanumeric format."
          ],
          correctIndex: 3,
          explanation: "IPv6 was introduced to solve the address exhaustion problem of IPv4. It uses a 128-bit alphanumeric format, providing a virtually unlimited number of addresses."
        },
        {
          id: "ip-2",
          question: "What is the primary difference between a Public IP and a Private IP?",
          options: [
            "A Public IP is used within a local network, while a Private IP is assigned by an ISP.",
            "A Public IP is shared across devices in a network and assigned by an ISP, while a Private IP is assigned internally by a router.",
            "Public IPs are only used for servers, while Private IPs are used for consumer devices.",
            "Public IPs change constantly, while Private IPs remain static."
          ],
          correctIndex: 1,
          explanation: "An ISP assigns a Public IP to a router, which is shared across the internet. The router then assigns Private IPs internally to each device (like laptops or phones) so they can communicate locally."
        }
      ]
    }
  ]
};

const portsLesson: LessonContent = {
  slug: "ports",
  title: "Ports",
  subtitle: "Understanding how data reaches the right application.",
  sections: [
    {
      kind: "prose",
      heading: "What Is a Port?",
      body: [
        "Ports are **numerical identifiers** used in networking to direct traffic to the correct application or service on a device.",
        "They work with **IP addresses** to identify **both the device and the specific service/application** on that device.",
        "This allows multiple services to run on the same machine while still being reachable (e.g., a web server and a database running on the same server).",
        "",
        "👉 Think of **IP = street address**, and **Port = apartment number**."
      ]
    },
    {
      kind: "image",
      src: portsImg,
      alt: "Diagram illustrating how IP addresses and ports route traffic",
      caption: "An IP address routes to the device, while a port routes to the specific application."
    },
    {
      kind: "prose",
      heading: "How Ports Work",
      body: [
        "Each port is represented by a **16-bit number** (0–65535). They are assigned by **IANA** (Internet Assigned Numbers Authority) and are used by **Transport Layer protocols** like TCP and UDP.",
        "",
        "**When you visit a website:**",
        "1. Your browser connects to the server's **IP address** on **port 443** (for HTTPS).",
        "2. The server listens on that port and responds with the webpage.",
        "3. Your device might use a **random high-numbered port** (like 52345) to initiate the request.",
        "",
        "When a packet arrives:",
        "• **IP Address** → finds the right machine.",
        "• **Port Number** → directs to the correct application/service.",
        "",
        "This combo `IP:Port` forms a **socket**, which uniquely identifies a connection. The operating system uses the port number to route incoming packets to the correct application."
      ]
    },
    {
      kind: "ports-diagram"
    },
    {
      kind: "prose",
      heading: "Port Number Ranges",
      body: []
    },
    {
      kind: "table",
      headers: ["Range", "Type", "Purpose", "Examples"],
      rows: [
        ["**0–1023**", "Well-known ports", "Reserved for standard services", "HTTP (80), HTTPS (443), FTP (20/21), SSH (22), SMTP (25), DNS (53)"],
        ["**1024–49151**", "Registered ports", "Assigned to user-defined services", "MySQL (3306), Postgres (5432), Redis (6379), MongoDB (27017)"],
        ["**49152–65535**", "Dynamic / Private ports", "Used for ephemeral client connections", "Browser → Server traffic"]
      ]
    },
    {
      kind: "prose",
      heading: "Types of Ports (Based on Protocol)",
      body: [
        "• **TCP Ports** → reliable, connection-oriented communication (**Web (HTTP/HTTPS)**, **Email (SMTP/IMAP)**, **File Transfer (FTP)**).",
        "• **UDP Ports** → fast, connectionless communication (**Streaming (video/audio)**, **DNS**, **Online Gaming**)."
      ]
    },
    {
      kind: "takeaways",
      items: [
        "**Multiplexing:** Ports allow many services to run on one single device simultaneously.",
        "**Standardization:** Known services always use fixed port numbers (e.g. 80/443 for web).",
        "**Security:** Open ports can be attack entry points. Always close unused ports and use firewalls."
      ]
    },
    {
      kind: "takeaways",
      items: [
        "While an IP address directs traffic to a specific machine, a Port directs traffic to a specific application on that machine.",
        "Ports are 16-bit numbers ranging from 0 to 65535.",
        "Well-known ports (0-1023) are reserved for standard protocols (e.g., 80 for HTTP, 443 for HTTPS, 22 for SSH).",
        "A network Socket is the combination of an IP address and a Port (e.g., 192.168.1.5:80)."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "ports-https",
          question: "Which port is traditionally reserved for the HTTPS (secure web) protocol?",
          options: [
            "80",
            "443",
            "22",
            "5432"
          ],
          correctIndex: 1,
          explanation: "Port 443 is the standard for secure web traffic (HTTPS), while Port 80 is used for unencrypted HTTP traffic."
        },
        {
          id: "ports-ephemeral",
          question: "What is the purpose of ephemeral source ports in client-server communication?",
          options: [
            "To permanently assign a port to a device.",
            "To encrypt the packet payload during a TCP handshake.",
            "To uniquely identify the outgoing connection on the client side, allowing multiple connections from the same IP.",
            "To act as a firewall rule blocking unauthorized access."
          ],
          correctIndex: 2,
          explanation: "The operating system automatically assigns a random, high-numbered ephemeral port (like 52345) to each outgoing request so it can track which application should receive the incoming response."
        },
        {
          id: "ports-firewall",
          question: "What does a firewall typically do when it actively blocks a TCP connection request?",
          options: [
            "It returns a SYN-ACK packet.",
            "It establishes the connection but encrypts all the data.",
            "It drops the packet silently or returns a TCP RST (Reset) packet.",
            "It redirects the request to Port 443."
          ],
          correctIndex: 2,
          explanation: "When a firewall actively refuses a connection, it sends back a TCP RST (Reset) packet, which immediately terminates the handshake attempt."
        }
      ]
    }
  ]
};

const osiModelLesson: LessonContent = {
  slug: "osi-model",
  title: "OSI Model",
  subtitle: "Understanding the 7-layer framework for network communication.",
  sections: [
    {
      kind: "prose",
      heading: "What It Is",
      body: [
        "The **OSI (Open Systems Interconnection) Model** is a **7-layer framework** for understanding how data moves across networks.",
        "Each layer has a **specific role** and communicates only with adjacent layers.",
        "**Purpose:** standardize communication, ensure interoperability, and break down networking into manageable parts."
      ]
    },
    {
      kind: "callout",
      tone: "info",
      title: "Why Learn It?",
      body: "While this model is not directly implemented in the TCP/IP networks that are most common today, it helps make troubleshooting easier, encourages hardware interoperability, develops a security-first mindset, and separates a complex function into simpler components."
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Mnemonic to Remember",
      body: "### ==purple:A==ll ==blue:P==eople ==teal:S==eems ==green:T==o ==yellow:N==eed ==orange:D==ata ==red:P==rocessing \n(==purple:A==pplication, ==blue:P==resentation, ==teal:S==ession, ==green:T==ransport, ==yellow:N==etwork, ==orange:D==ata Link, ==red:P==hysical)"
    },
    {
      kind: "image",
      src: osiModelImg,
      alt: "OSI Model Diagram",
      caption: "The 7 Layers of the OSI Model"
    },
    {
      kind: "osi-model-diagram"
    },
    {
      kind: "prose",
      heading: "7 Layers of OSI Model (Bottom → Top)",
      body: [
        "**1. Physical Layer**",
        "• Concerned with **hardware transmission of raw bits (0s and 1s)**.",
        "• **Defines** cables, switches, voltages, frequencies, connectors.",
        "• Converts data into **bit streams** for transmission.",
        "• Both sender & receiver must agree on **signal convention**.",
        "",
        "**2. Data Link Layer**",
        "• Handles **node-to-node communication** within the same network.",
        "• Takes packets from the Network layer → converts to **frames**.",
        "• Provides **MAC addressing** and **error detection (CRC)**.",
        "• **Devices:** Switches, Bridges.",
        "• **Sub-layers:** LLC (Logical Link Control), MAC (Media Access Control).",
        "",
        "**3. Network Layer**",
        "• Responsible for **routing** and **logical addressing (IP) between networks**.",
        "• Breaks segments from the transport layer into smaller units, called **packets** and reassembles these packets on the receiving device.",
        "• Finds the **best path** to the destination.",
        "• Not needed if devices are on the **same network**.",
        "• **Devices:** Routers.",
        "• **Protocols:** IPv4, IPv6, ICMP.",
        "",
        "**4. Transport Layer**",
        "• Ensures **end-to-end communication**, reliability, flow control.",
        "• Provides **segmentation, acknowledgment, error recovery**.",
        "• **Protocols:** TCP (reliable), UDP (fast, no guarantee).",
        "• **Unit:** Segments (TCP) / Datagrams (UDP).",
        "",
        "**5. Session Layer**",
        "• Manages **sessions** (open, maintain, close) between applications.",
        "• The time between when the communication is opened and closed is known as the **session**.",
        "• Handles authentication, authorization, synchronization.",
        "• **Examples:** NetBIOS, RPC, SQL sessions.",
        "• **Unit:** Data.",
        "",
        "**6. Presentation Layer**",
        "• The presentation layer is also called the **Translation layer**.",
        "• Translates data into **application-readable format**.",
        "• Handles **encryption, compression, encoding**.",
        "• **Examples:** SSL/TLS, JPEG, GIF, MPEG.",
        "• **Unit:** Data.",
        "",
        "**7. Application Layer**",
        "• Closest to the **end-user**; provides network services.",
        "• **Examples:** HTTP, HTTPS, FTP, SMTP, DNS.",
        "• **Unit:** Data."
      ]
    },
    {
      kind: "takeaways",
      items: [
        "The OSI Model is a 7-layer conceptual framework that standardizes how different network components communicate.",
        "Data flows DOWN the stack (Encapsulation) when sending, and UP the stack (Decapsulation) when receiving.",
        "Each layer only communicates with the layer immediately above or below it.",
        "While modern networks use the TCP/IP model, the OSI model is essential for troubleshooting and understanding separation of concerns."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "osi-model-layer-3",
          question: "Which layer of the OSI model is primarily responsible for logical addressing (IP) and routing data across different networks?",
          options: [
            "Layer 2 (Data Link)",
            "Layer 3 (Network)",
            "Layer 4 (Transport)",
            "Layer 7 (Application)"
          ],
          correctIndex: 1,
          explanation: "Layer 3 (the Network layer) handles IP addressing and routing packets across multiple networks to reach their final destination."
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
    lessons: [whatIsSystemDesign, deliveryFramework, functionalVsNonFunctional, backOfTheEnvelope],
  },
  "networking-protocols": {
    slug: "networking-protocols",
    title: "Networking & Protocols",
    category: "Fundamentals",
    iconKey: "layers",
    blurb: "Understand how data travels across the web.",
    lessons: [osiModelLesson, ipLesson, portsLesson],
  }
};
