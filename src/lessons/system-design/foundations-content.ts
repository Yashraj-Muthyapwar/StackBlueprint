import { type LessonContent, type Section } from "@/lessons/types";
import keyComponentsImg from "@/images/system-design/Foundations/key-components.png";
import deliveryFrameworkEvolutionImg from "@/images/system-design/Foundations/delivery-framework-evolution.png";
import deliveryFrameworkFlowImg from "@/images/system-design/Foundations/delivery-framework-flow.png";
import estimationCheatSheetMapImg from "@/images/system-design/Foundations/estimation-cheat-sheet-map.png";
import funcVsNonFuncImg from "@/images/system-design/Foundations/functionl-vs-non-functional.png";
import backOfTheEnvelopeImg from "@/images/system-design/Foundations/back-of-the-envelope.png";
import internetProtocolImg from "@/images/system-design/Foundations/internet-protocol.png";
import osiModelImg from "@/images/system-design/Foundations/OSI-Model.png";
import tcpVsUdpImg from "@/images/system-design/Foundations/tcp-vs-udp.png";
import natImg from "@/images/system-design/Foundations/nat.png";
import portsImg from "@/images/system-design/Foundations/ports.png";
import vpcCidrSubnetImg from "@/images/system-design/Foundations/vpc-cidr-subnet.png";
import httpVsHttpsImg from "@/images/system-design/Foundations/http-vs-https.png";
import dnsImg from "@/images/system-design/Foundations/dns.png";

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
    "Choose the simplest architecture that can meet the product's real constraints.",
  sections: [
    {
      kind: "prose",
      heading: "What You Are Designing",
      body: [
        "System design is deciding how software components, data, and requests work together so a system meets its requirements at the expected scale.",
        "The goal is not the most elaborate diagram. It is the **simplest architecture that satisfies the constraints**. A small internal tool and a global consumer product can offer the same feature while needing very different designs."
      ],
    },
    {
      kind: "callout",
      tone: "violet",
      title: "When system design matters",
      body: "Use it when the design depends on traffic or data growth, latency, throughput, reliability, consistency, availability, or operational cost.",
    },
    {
      kind: "prose",
      heading: "Why Correct Code Is Not Enough",
      body: [
        "A system can have correct code and still fail because its database, network, storage, or a dependency cannot handle the workload. System design makes those limits explicit before they become incidents.",
        "Start from a dependable baseline: `Client → Application → Database`. Keep it while it meets the need. More capability usually means more components and more coordination."
      ],
    },
    { kind: "system-design-evolution" },
    {
      kind: "callout",
      tone: "warn",
      title: "A common failure mode",
      body: "Choosing technologies first and then trying to fit the problem around them. Start with the workload and constraints, then justify every component."
    },
    {
      kind: "prose",
      heading: "Requirements and Constraints",
      body: [
        "Architecture starts with the problem, not the technology. Clarify requirements in this order:",
        "`Features → Scale → Data → Latency → Reliability → Consistency → Cost`.",
        "The same feature can require completely different architectures under different constraints. A timeline for 10,000 users is not the same design problem as one serving hundreds of millions of users with a strict latency target."
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Baseline when details are missing",
      body: "State your assumptions and keep the first design simple. Clarifying early reduces incorrect architectural decisions later.",
    },
    {
      kind: "prose",
      heading: "Scale and System Growth",
      body: [
        "Scale describes how much load the system must handle. Estimate read and write requests, stored data, bandwidth, peak traffic, and uneven access such as hot data.",
        "Small workloads often fit on one machine. As data volume or query rate grows, work may need to be distributed. Until then, stay single-node or scale vertically when the workload comfortably fits."
      ],
    },
    {
      kind: "table",
      caption: "What to measure before distributing work",
      headers: ["Signal", "Question it answers", "Risk if ignored"],
      rows: [
        ["Request rate", "Can one service or database sustain the reads and writes?", "Sizing only for average traffic."],
        ["Data volume", "Will storage, indexes, backups, and recovery still fit?", "A single node becomes a capacity limit."],
        ["Bandwidth", "Can the network carry requests, responses, and replication?", "Large payloads create hidden latency."],
        ["Peak and hot keys", "Where is load concentrated during spikes?", "One shard or cache key becomes the bottleneck."]
      ]
    },
    {
      kind: "prose",
      heading: "Building Blocks and Data Flow",
      body: [
        "Common components each solve a specific problem. The important part is not the boxes themselves, but **how requests and data move between them**.",
        "Add a component only when a requirement or bottleneck justifies it. Otherwise, keep that responsibility in the application or database."
      ],
    },
    {
      kind: "table",
      caption: "Common building blocks",
      headers: ["Component", "Responsibility"],
      rows: [
        ["API", "Entry point for client requests"],
        ["Load balancer", "Distribute traffic"],
        ["App server", "Business logic"],
        ["Database", "Durable data"],
        ["Cache", "Faster repeated reads"],
        ["Queue or log", "Decouple asynchronous work"],
        ["Worker", "Process background tasks"],
        ["Observability", "Logs, metrics, and traces"]
      ]
    },
    {
      kind: "image",
      src: keyComponentsImg,
      alt: "Diagram showing the core components of a scalable system and their relationships",
      caption: "Key components of a system: requests pass through application services to data stores and supporting infrastructure.",
    },
    {
      kind: "prose",
      heading: "Operational and Analytical Workloads",
      body: [
        "Data systems are shaped by access patterns. A system optimized for low-latency user requests is different from one optimized to scan billions of records for reporting.",
        "Use one datastore while both workloads remain small enough to coexist safely. Separate them when analytics threatens the latency-sensitive path, accepting the added work of synchronizing data."
      ],
    },
    {
      kind: "table",
      headers: ["", "Operational / OLTP", "Analytical / OLAP"],
      rows: [
        ["Reads", "Small point queries", "Scan and aggregate many records"],
        ["Writes", "Frequent insert, update, delete", "Bulk loads or event streams"],
        ["Queries", "Many small predefined queries", "Fewer complex queries"],
        ["Data", "Current state", "Historical data"],
        ["Typical use", "User-facing application", "Analysis and reporting"]
      ],
    },
    {
      kind: "prose",
      heading: "Bottlenecks and Failure Modes",
      body: [
        "After the normal request path works, test what happens under pressure or failure. Ask: What if the database is unavailable? Traffic is 10×? The cache is empty? A queue backlogs? A dependency slows down? Is stale data acceptable?",
        "The weakest dependency often determines the reliability of the whole request path. Extra resilience brings redundancy, recovery logic, and operational work. Accepting some failures can be a reasonable baseline when their business impact does not justify that cost."
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Watch for cascades",
      body: "A single dependency can become a single point of failure, or cause a cascading failure when waiting requests consume all available resources.",
    },
    {
      kind: "prose",
      heading: "Every Capability Has a Cost",
      body: [
        "Every useful architectural choice solves one problem while creating another. Prefer the simpler option unless a requirement justifies the added complexity.",
        "The design explanation is incomplete if it says why a component helps but not what it costs."
      ],
    },
    {
      kind: "table",
      headers: ["Choice", "Gain", "Cost"],
      rows: [
        ["Cache", "Lower read latency", "Invalidation and stale data"],
        ["Replication", "Availability and read scale", "Consistency lag"],
        ["Sharding", "More storage and write capacity", "Harder queries and operations"],
        ["Async processing", "Absorbs bursts", "Delayed results"]
      ],
    },
    {
      kind: "prose",
      heading: "A Repeatable Design Process",
      body: [
        "`Clarify → Estimate → Start Simple → Find Bottlenecks → Add What Is Needed → Explain Trade-offs`",
        "For any open-ended design problem, begin with `Client → API/Application → Database`, then evolve one constraint at a time. Starting simple keeps the reasoning clear, even when the system later needs to grow."
      ],
    },
    { kind: "system-design-clarification-practice" },
    {
      kind: "takeaways",
      items: [
        "System design connects requirements, scale, components, and data flow into the simplest architecture that meets the constraints.",
        "Begin with a small baseline and add load balancers, caches, queues, replicas, or partitions only when a measurable need justifies them.",
        "Name the gain and the cost of every major choice, then test the design against peak traffic and dependency failures."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "sysdesign-simple-first",
          question: "A new product has modest traffic and no strict availability target. Which is the best starting architecture?",
          options: [
            "Client → application → database, with assumptions documented",
            "Multi-region services with sharded databases and event sourcing",
            "A separate cache, queue, worker, and search cluster for every feature",
            "Choose a technology stack first, then define the requirements"
          ],
          correctIndex: 0,
          explanation: "The baseline is appropriate while it satisfies the actual constraints. Complexity should be earned by a requirement or observed bottleneck."
        },
        {
          id: "sysdesign-oltp-olap",
          question: "Why might a reporting workload be separated from a user-facing transactional database?",
          options: [
            "Reporting queries can scan large histories and harm latency-sensitive user requests",
            "Analytical systems cannot store historical data",
            "User-facing applications never need aggregates",
            "A separate system guarantees that data is always strongly consistent"
          ],
          correctIndex: 0,
          explanation: "OLTP and OLAP optimize for different access patterns. Separating them can protect the operational path, but introduces synchronization work."
        },
        {
          id: "sysdesign-tradeoff-cost",
          question: "What cost should be included when proposing a cache to reduce read latency?",
          options: [
            "Cache invalidation and the possibility of stale data",
            "The database no longer stores durable data",
            "The application can no longer process requests",
            "Caches only work for analytical workloads"
          ],
          correctIndex: 0,
          explanation: "A cache can make repeated reads faster, but it creates a new consistency problem: deciding when cached data is invalid or acceptable to serve stale."
        }
      ]
    }
  ]
};

const deliveryFramework: LessonContent = {
  slug: "delivery-framework",
  title: "Delivery Framework",
  subtitle: "Move from an ambiguous prompt to a justified architecture, one decision at a time.",
  sections: [
    {
      kind: "prose",
      heading: "The Interview Framework",
      body: [
        "A system design interview is easier to navigate when each phase produces the input for the next. Start with the problem, quantify the pressure, then add complexity only when it earns its place."
      ],
    },
    {
      kind: "image",
      src: deliveryFrameworkFlowImg,
      alt: "Seven-step system design interview delivery flow: requirements, estimation, API, high-level design, data design, deep dive, and wrap-up",
      caption: "A delivery flow keeps the conversation ordered: each phase produces evidence for the next architectural decision.",
    },
    { kind: "system-design-delivery-framework" },
    {
      kind: "prose",
      heading: "1. Requirements",
      body: [
        "Define what the system must do and the quality bar it must satisfy. Functional requirements cover core features, users, primary use cases, and what is out of scope. Non-functional requirements cover scale, latency, availability, reliability, consistency, retention, and maintainability.",
        "Always start here. The same feature can need a completely different design when traffic, correctness, latency, or availability changes. If information is missing, state a reasonable assumption and continue."
      ],
    },
    {
      kind: "table",
      caption: "Clarify the problem before choosing technology",
      headers: ["Requirement type", "Questions to settle", "Why it matters"],
      rows: [
        ["Functional", "Who uses it? What are the 2-3 critical actions? What is out of scope?", "Defines the request flows you must support."],
        ["Non-functional", "How fast, how large, how available, and how correct must it be?", "Defines the architecture's quality bar."],
      ],
    },
    { kind: "callout", tone: "warn", title: "Failure mode", body: "Solving the wrong problem because scope was never established. Clarify enough to guide the design, but do not spend the whole interview gathering requirements." },
    {
      kind: "prose",
      heading: "2. Estimation",
      body: [
        "Estimation turns vague scale into design pressure. Estimate only what could change the architecture: read and write QPS, peak QPS, storage growth, bandwidth, and workload skew.",
        "Use rough order-of-magnitude math. Average load is not enough: a few thousand writes per second can spike much higher, and a small set of users or keys can receive a disproportionate share of traffic. Connect every estimate to a decision."
      ],
    },
    {
      kind: "table",
      caption: "Connect estimates to design choices",
      headers: ["Pressure", "Possible direction"],
      rows: [
        ["High read QPS", "Cache, precompute, or read replicas"],
        ["High write QPS", "Partition, batch, or process asynchronously"],
        ["Large storage", "Distributed or object storage"],
        ["Traffic spikes", "Queue and buffer work"],
        ["Hot users or keys", "Special handling for skewed load"],
      ],
    },
    {
      kind: "prose",
      heading: "3. API Design",
      body: [
        "Turn the main features into concrete client operations. Keep each API minimal: method, endpoint, key input, and key output. APIs expose which data must enter, leave, be read, or be written.",
        "Define only operations that map directly to core requirements. Detailed payload documentation rarely changes the architecture and can distract from the system design discussion."
      ],
    },
    { kind: "code", language: "text", caption: "Core operations for a social product", code: "POST /posts\nGET /feed?cursor=...\nPOST /users/{id}/follow" },
    {
      kind: "prose",
      heading: "4. High-Level Design",
      body: [
        "Start with the smallest architecture that satisfies the happy path: `Client → Application → Database`. Then evolve only when a measured pressure appears.",
        "Availability may justify a load balancer and multiple servers. High read traffic can justify a cache. Slow asynchronous work can justify a queue and workers. Large media can justify object storage and a CDN. Large datasets can justify partitioning. Every component should answer two questions: what problem does it solve, and what happens if we remove it?"
      ],
    },
    {
      kind: "image",
      src: deliveryFrameworkEvolutionImg,
      alt: "System design evolution diagram showing a client, application, and database baseline branching to load balancing, cache, queue workers, object storage CDN, and partitioning when pressure appears",
      caption: "Start with the baseline, then introduce a capability only when a measurable pressure requires it.",
    },
    {
      kind: "prose",
      heading: "5. Data Design: Access Patterns First",
      body: [
        "Design data around access patterns, not a preferred database. Identify what is written and read, how frequently, by which key, and in what order. Then label each store as a source of truth, cache, derived view, search index, or object store.",
        "A clean schema can still be wrong if common queries are expensive. For a home feed, finding followed accounts, fetching each account's posts, merging, sorting, and returning the latest items may require hundreds of underlying lookups for one read."
      ],
    },
    {
      kind: "table",
      caption: "Representations serve different jobs",
      headers: ["Representation", "Purpose", "Cost"],
      rows: [
        ["Source of truth", "Durable authoritative state", "Often not optimal for every read"],
        ["Cache", "Fast repeated reads", "Invalidation and stale data"],
        ["Derived or materialized view", "Prepared result for an important query", "Extra writes and storage"],
        ["Search index", "Flexible retrieval", "Synchronization lag and operations"],
      ],
    },
    {
      kind: "prose",
      heading: "Materialization and Fan-Out",
      body: [
        "When reads are frequent and repeated computation is expensive, move work from the read path to the write path. Instead of assembling every feed at read time, a new post can update prepared follower timelines. The prepared timeline is derived data, also called a ==mint:materialized view==.",
        "One logical event can create many physical operations. One post for 200 followers can mean 200 timeline updates. This ==amber:fan-out== can make the write path more expensive than the read path it optimizes. ==violet:Workload skew== matters: normal accounts may push into follower feeds, while high-follower accounts are stored once and merged during reads."
      ],
    },
    { kind: "system-design-feed-strategy" },
    {
      kind: "prose",
      heading: "6. Deep Dive",
      body: [
        "Choose the hardest decision tied to the main bottleneck and reason through it as:",
        " `Problem → Approaches → Mechanics → Trade-offs → Decision`.",
        " Good deep dives include caching, feed generation, partitioning, consistency, queue processing, or failure recovery.",
        "The high-level design shows structure. The deep dive demonstrates judgment. Compare two or three realistic approaches, describe the mechanics that make the chosen approach work, and explain what it costs."
      ],
    },
    {
      kind: "table",
      caption: "Every component adds a new responsibility",
      headers: ["Component", "New problem introduced"],
      rows: [
        ["Cache", "Invalidation and stale data"],
        ["Queue", "Backlog, retries, and duplicate work"],
        ["Sharding", "Hot partitions and rebalancing"],
      ],
    },
    {
      kind: "prose",
      heading: "7. Wrap-Up",
      body: [
        "Close with what you built, where it breaks, and what changes next. Recap the architecture, name the main bottlenecks and failure modes, then connect the next improvement to the original requirements.",
        "A concise wrap-up proves you understand the limits of the current design. Do not introduce unrelated systems in the final minutes."
      ],
    },
    { kind: "system-design-whatsapp-requirements" },
    {
      kind: "takeaways",
      items: [
        "Use Requirements → Estimation → API → High-Level Design → Data Design → Deep Dive → Wrap-Up to keep the architecture tied to the problem.",
        "Estimates are valuable only when they create a design decision about caching, storage, partitioning, queues, replication, or skew handling.",
        "Design data around access patterns. Materialize or fan out only when the read savings justify write amplification and storage cost.",
        "End by naming the design's limits, trade-offs, and next bottleneck."
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "sysdesign-framework-estimation",
          question: "Which estimate is most useful during a system design interview?",
          options: [
            "An estimate that changes a design decision, such as whether burst traffic requires buffering",
            "Every number that can be calculated from the prompt",
            "Only the average QPS, because peaks are rare",
            "Exact hardware sizing for every server"
          ],
          correctIndex: 0,
          explanation: "Estimate to expose design pressure. Numbers that do not affect a decision consume time without improving the architecture."
        },
        {
          id: "sysdesign-framework-materialization",
          question: "When is a materialized feed timeline most appropriate?",
          options: [
            "When frequent reads repeatedly perform expensive assembly work",
            "When no users read the resulting feed",
            "When writes must have no extra work",
            "When the system has no source of truth"
          ],
          correctIndex: 0,
          explanation: "Materialization trades write work and storage for cheaper repeated reads. It should be justified by a valuable read path."
        },
        {
          id: "sysdesign-framework-skew",
          question: "Why might a high-follower account use pull-on-read instead of fan-out-on-write?",
          options: [
            "Fan-out could create an excessive number of follower timeline writes",
            "High-follower accounts never publish posts",
            "Pull-on-read removes the need to store posts",
            "It guarantees every feed is strongly consistent"
          ],
          correctIndex: 0,
          explanation: "A small number of hot accounts can dominate write amplification. A hybrid strategy handles normal and extreme users differently."
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

const estimationCheatSheet: LessonContent = {
  slug: "estimation-cheat-sheet",
  title: "Estimation Cheat Sheet",
  subtitle: "Turn product scale into the design pressure that should change an architecture.",
  sections: [
    {
      kind: "prose",
      heading: "Estimation Framework",
      body: [
        "Turn product scale into **design pressure**: `Users → Actions/User → QPS → Data/Request → Resources`.",
        "The goal is order-of-magnitude sizing, not an exact capacity plan. Use estimation when scale may affect caching, partitioning, storage, bandwidth, server count, or queues and asynchronous processing.",
        "Numbers matter only when they change the architecture. Start with QPS, storage, and bandwidth. Add concurrency, cache sizing, or server sizing only when they are relevant to the system being designed."
      ]
    },
    {
      kind: "image",
      src: estimationCheatSheetMapImg,
      alt: "Estimation cheat sheet infographic showing users, actions, QPS, data size, architecture, peak load, read and write load, and storage",
      caption: "Start with users and actions, quantify QPS and data, then use peak, read/write, and storage pressure to choose the architecture."
    },
    {
      kind: "callout",
      tone: "info",
      title: "Baseline and trade-off",
      body: "State your assumptions, round aggressively, and stop once the estimates guide a design decision. More estimation improves capacity reasoning, but it consumes interview time. Doing math without connecting it to a decision is the failure mode."
    },
    {
      kind: "prose",
      heading: "QPS",
      body: [
        "QPS measures request load for request-driven systems. It tells you whether one server, database, or cache can handle the workload.",
        "`Average QPS = DAU × Actions/User/Day ÷ 86,400`. For quick mental math, use `DAU × Actions/User/Day ÷ 100,000`. Plan for `Peak QPS = Average QPS × Peak Multiplier` because peaks, not averages, break systems.",
        "If there is no better input, use **3× average** as a rough consumer-app peak assumption. Higher peak assumptions provide more safety, but they increase provisioned capacity."
      ]
    },
    { kind: "code", language: "text", caption: "QPS formulas", code: "Average QPS = DAU × Actions/User/Day ÷ 86,400\nQuick QPS   ≈ DAU × Actions/User/Day ÷ 100,000\nPeak QPS    = Average QPS × Peak Multiplier" },
    {
      kind: "prose",
      heading: "Read vs Write Load",
      body: [
        "Always separate reads from writes: `Total QPS → Read QPS + Write QPS`. Reads and writes usually scale differently, so total QPS alone can hide the actual bottleneck.",
        "High reads suggest **cache, replicas, or precomputation**. High writes suggest **partitioning, batching, logs, or asynchronous ingestion**. If the ratio is unknown, estimate it from user actions.",
        "Optimizing reads often introduces derived state or replication. Optimizing writes often increases partitioning complexity."
      ]
    },
    {
      kind: "prose",
      heading: "Storage and Media",
      body: [
        "Estimate retained data, not only daily writes: `Storage = Records × Size per Record × Retention × Overhead`. Raw data is only part of the final footprint. Indexes, replicas, backups, and fragmentation commonly make provisioned storage **3–5× raw data**.",
        "Media usually dominates storage. Keep metadata in the database and store large media separately. Object storage scales better for binary content, but it introduces a separate storage and delivery path. Avoid storing large media directly in the primary transactional database."
      ]
    },
    {
      kind: "table",
      caption: "Typical media order of magnitude",
      headers: ["Data", "Rough size", "Design consequence"],
      rows: [
        ["Text record", "KB", "Usually fits comfortably in a primary datastore."],
        ["Photo", "100 KB to MB", "Object storage and a CDN often matter before database capacity."],
        ["Short video", "MB to tens of MB", "Bandwidth and delivery paths become first-class concerns."],
        ["Long video", "Hundreds of MB to GB", "Use object storage, CDN delivery, and lifecycle tiers."]
      ]
    },
    {
      kind: "prose",
      heading: "Bandwidth and Internal Traffic Amplification",
      body: [
        "`Bandwidth = QPS × Data Size per Request`. Calculate ingress and egress separately because response traffic often dominates. Use this for media-heavy systems, large API responses, downloads, streaming, and cross-region traffic.",
        "One client request may trigger cache lookups, database reads, service calls, media lookups, and logging. In a service-oriented or fan-out-heavy design, `10K external QPS × 100 backend operations ≈ 1M internal ops/sec`. Estimate the largest amplification path instead of every internal call."
      ]
    },
    { kind: "callout", tone: "warn", title: "Network-bound does not mean high QPS", body: "A system can have manageable request volume but still be network-bound when each request transfers a large payload. CDNs and compression reduce origin traffic, but add caching behavior and infrastructure." },
    {
      kind: "prose",
      heading: "Server Capacity, Cache Sizing, and Concurrent Users",
      body: [
        "Estimate horizontal capacity with `Servers = Peak QPS ÷ (Throughput per Server × Target Utilization)`. Use usable, not maximum, capacity. A target around **60–70% utilization** leaves room for bursts, failures, and queue buildup. Do not assume perfectly linear scaling.",
        "Cache the **hot working set**, not necessarily the entire dataset: `Cache Size = Hot Items × Item Size × Overhead`. A useful heuristic is `20% of data → ~80% of requests`. More cache reduces database pressure, but increases memory cost and invalidation complexity.",
        "For chat, gaming, streaming, live events, and long-lived connections, estimate simultaneous users: `Concurrent Users = DAU × (Sessions/Day × Session Duration) ÷ Peak Window`. Registered users are not active load."
      ]
    },
    {
      kind: "prose",
      heading: "Latency and Tail Behavior",
      body: [
        "Use percentiles, not averages: **P50** means 50% of requests are faster, **P95** means 95% are faster, and **P99** means 99% are faster. `P95 < 200 ms` says more than `average = 200 ms` because averages hide slow tail requests.",
        "Use P95 as the baseline when no stricter tail requirement is specified. Improving tail latency often requires more capacity and resilience, but it protects the portion of users averages conceal."
      ]
    },
    {
      kind: "table",
      caption: "Numbers to remember",
      headers: ["Reference", "Approximation"],
      rows: [
        ["One day", "`~10⁵ sec`"],
        ["One month", "`~2.5M sec`"],
        ["One year", "`~3 × 10⁷ sec`"],
        ["Data units", "KB = 10³, MB = 10⁶, GB = 10⁹, TB = 10¹², PB = 10¹⁵ bytes"],
        ["Peak traffic", "~3–5× average"],
        ["Storage provisioned", "~3–5× raw data"],
        ["Server utilization", "~60–70%"],
        ["Hot cache set", "~20% data → 80% requests"]
      ]
    },
    {
      kind: "table",
      caption: "Architecture mapping",
      headers: ["Estimate shows", "Design direction"],
      rows: [
        ["High read QPS", "Cache, replicas, or precompute"],
        ["High write QPS", "Partition, batch, or queue"],
        ["Huge storage", "Distributed or object storage"],
        ["Media-heavy traffic", "CDN"],
        ["Burst traffic", "Queue or buffering"],
        ["Hot working set", "Cache"],
        ["Large concurrent users", "Horizontal connection handling"],
        ["High tail latency", "Add headroom or remove slow dependencies"]
      ]
    },
    {
      kind: "prose",
      heading: "Common Mistakes and the Estimation Flow",
      body: [
        "Avoid sizing for average instead of peak, using registered users instead of active or concurrent users, using total QPS without a read/write split, ignoring storage overhead or internal amplification, assuming linear scaling, confusing throughput with latency, and calculating numbers that do not change the design.",
        "Follow this path: `Users → Actions per User → Average QPS → Peak QPS → Read vs Write → Data Size → Storage / Bandwidth / Compute → Architecture Decision`. State assumptions, round aggressively, sanity-check the result, and stop once the numbers are sufficient to guide the design."
      ]
    },
    { kind: "system-design-estimation-walkthrough" },
    {
      kind: "takeaways",
      items: [
        "Estimation turns product scale into design pressure. Its job is architectural direction, not exact capacity planning.",
        "Use average QPS, peak QPS, read/write split, storage, and bandwidth as the first pass. Add deeper estimates only when relevant.",
        "Provision for peaks, retained data, and overhead. Average traffic and raw storage are not safe capacity targets.",
        "Cache the hot working set, keep media out of the primary transactional database, and model concurrency for long-lived connections.",
        "The estimate is complete when it tells you what pressure the architecture must handle."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "estimation-cheat-qps",
          question: "A product receives 864 million requests per day. What is its average QPS?",
          options: ["100 QPS", "1,000 QPS", "10,000 QPS", "100,000 QPS"],
          correctIndex: 2,
          explanation: "864,000,000 ÷ 86,400 = 10,000 requests per second."
        },
        {
          id: "estimation-cheat-peak",
          question: "Which estimate should use a 3–5× multiplier for a consumer product when no better peak data exists?",
          options: [
            "Raw storage",
            "Peak QPS",
            "Cache item size",
            "P95 latency"
          ],
          correctIndex: 1,
          explanation: "Peak QPS represents concentrated activity during busy periods. State the multiplier as an assumption instead of silently using it."
        },
        {
          id: "estimation-cheat-ratio",
          question: "A system stores 2 TB of raw retained data. Which first-pass provisioned-storage estimate is most appropriate?",
          options: [
            "2 TB, because raw data is the full footprint",
            "About 2.6 TB, adding cache overhead only",
            "About 6–10 TB, allowing for indexes, replicas, backups, and fragmentation",
            "20 TB, because all storage must be copied ten times"
          ],
          correctIndex: 2,
          explanation: "Provisioned storage is commonly 3–5× raw storage after indexes, replicas, backups, and fragmentation."
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


const subnetsCidrLesson: LessonContent = {
  slug: "subnets-and-cidr",
  title: "Subnets & CIDR",
  subtitle:
    "From binary masks to a production VPC: how to slice an address space so your cloud network actually scales.",
  sections: [
    // ────────────────────────────────────────────────────────────────────
    // 1. WHY
    // ────────────────────────────────────────────────────────────────────
    {
      kind: "prose",
      heading: "Why Subnets Exist",
      body: [
        "In the last lesson you learned that an IP address identifies a device and CIDR notation describes a range. This lesson is about the decision that sits on top of that: **how do you split one big range into many smaller ones, and why would you bother?**",
        "Picture a flat network. Every server, laptop, printer, and guest phone lives in one address space with nothing between them. Three problems show up immediately:",
        "**Performance.** Broadcast traffic (ARP requests, discovery protocols) goes to every device in the range. One flat network with 4,000 devices means every device processes every broadcast. That is wasted CPU and wasted bandwidth on a link nobody asked for.",
        "**Security.** If the guest Wi-Fi tablet can reach the payroll database at the IP layer, your only defence is host-level firewalls. One misconfiguration and the blast radius is the entire company. Segmentation gives you a place to put the wall.",
        "**Management.** A flat network cannot be documented, cannot be reasoned about, and cannot be automated. When an incident starts, `10.4.19.7` tells you nothing. In a segmented network it tells you the region, the tier, and the availability zone.",
        "Subnetting is the answer to all three. You take one address block and cut it into smaller blocks along bit boundaries, then put routing and policy between them.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "The Cloud Framing",
      body: "In a data centre, subnets solve broadcast storms. In the cloud, broadcast does not even exist (AWS, GCP, and Azure all drop broadcast and multicast by default). Yet subnets matter more than ever, because in the cloud a subnet is the unit of routing, the unit of availability zone placement, and the unit of network policy. Getting the layout wrong is one of the few cloud mistakes you cannot fix without a migration.",
    },

    // ────────────────────────────────────────────────────────────────────
    // 2. THE MASK
    // ────────────────────────────────────────────────────────────────────
    {
      kind: "prose",
      heading: "The Subnet Mask: A Filter Made of Bits",
      body: [
        "An IPv4 address is 32 bits. Those bits are split into two parts: a **network portion** (which network am I on?) and a **host portion** (which device am I within that network?).",
        "The subnet mask is what draws the line. It is also 32 bits, but with a strict rule: all the 1s come first, then all the 0s. No mixing.",
        "• A `1` in the mask means *this bit belongs to the network*.",
        "• A `0` in the mask means *this bit belongs to the host*.",
        "A mask of `255.255.255.0` is `11111111.11111111.11111111.00000000` in binary. The first 24 bits are network, the last 8 are host. That is exactly what the shorthand `/24` means: count the leading 1s.",
        "When a router receives a packet, it performs a **bitwise AND** between the destination IP and the mask. The result is the network ID, and that is what it looks up in its routing table. This is the single operation that all of IP routing rests on.",
      ],
    },
    { kind: "subnet-math-steps" },
    {
      kind: "prose",
      heading: "Reading a CIDR Block",
      body: [
        "CIDR (Classless Inter-Domain Routing) replaced the old rigid Class A/B/C system in 1993. Instead of being locked into three fixed sizes, you specify the prefix length yourself and get any power-of-two block size you want.",
        "`10.0.64.0/20` decodes as:",
        "• **Prefix length 20** → the first 20 bits are fixed (the network).",
        "• **Host bits = 32 − 20 = 12** → 2^12 = **4,096 total addresses**.",
        "• **Range** → `10.0.64.0` through `10.0.79.255`.",
        "Two numbers do almost all the work in practice. **Total addresses = 2^(32 − prefix)**, and **block size in the interesting octet = 256 − mask value for that octet**. For a /20, the mask is `255.255.240.0`, so the block size in the third octet is 256 − 240 = 16. That is why /20 subnets step in increments of 16: `10.0.0.0`, `10.0.16.0`, `10.0.32.0`, `10.0.48.0`.",
        "Move the slider below and watch the network/host boundary move with it. Every subnetting question you will ever be asked is a question about where that line sits.",
      ],
    },
    { kind: "cidr-explorer" },
    {
      kind: "callout",
      tone: "warn",
      title: "Smaller Prefix = Bigger Network",
      body: "This trips up almost everyone at first. A /16 is LARGER than a /24. The number counts how many bits are locked to the network, so a bigger number leaves fewer bits for hosts. Say it out loud a few times: a /8 is enormous, a /30 is four addresses.",
    },
    {
      kind: "table",
      caption: "CIDR Cheat Sheet (memorise the /24 row, derive the rest)",
      headers: [
        "Prefix",
        "Subnet Mask",
        "Total Addresses",
        "Usable (on-prem, −2)",
        "Usable (AWS/Azure, −5)",
        "Typical Use",
      ],
      rows: [
        ["/16", "255.255.0.0", "65,536", "65,534", "65,531", "A whole VPC / VNet"],
        ["/18", "255.255.192.0", "16,384", "16,382", "16,379", "A reserved tier inside a VPC"],
        ["/20", "255.255.240.0", "4,096", "4,094", "4,091", "App subnet per AZ (K8s friendly)"],
        ["/22", "255.255.252.0", "1,024", "1,022", "1,019", "Data subnet per AZ"],
        ["/24", "255.255.255.0", "256", "254", "251", "Public subnet, small workloads"],
        ["/26", "255.255.255.192", "64", "62", "59", "Load balancer subnet"],
        ["/27", "255.255.255.224", "32", "30", "27", "AWS ALB minimum (needs 8 free IPs)"],
        ["/28", "255.255.255.240", "16", "14", "11", "Smallest AWS subnet allowed"],
        ["/30", "255.255.255.252", "4", "2", "n/a", "Point-to-point WAN link"],
        ["/31", "255.255.255.254", "2", "2 (RFC 3021)", "n/a", "Modern point-to-point link"],
        ["/32", "255.255.255.255", "1", "1", "n/a", "Single host, loopback, route target"],
      ],
    },

    // ────────────────────────────────────────────────────────────────────
    // 3. THE MINUS TWO / MINUS FIVE
    // ────────────────────────────────────────────────────────────────────
    {
      kind: "prose",
      heading: "The Addresses You Do Not Get to Use",
      body: [
        "Every subnet loses addresses off the top. On a traditional network you lose two:",
        "• **Network ID** (all host bits 0, e.g. `10.0.1.0`): the name of the subnet itself, not assignable.",
        "• **Broadcast address** (all host bits 1, e.g. `10.0.1.255`): reserved for send-to-everyone traffic.",
        "That is the classic `2^h − 2` formula. A /30 has 4 addresses and 2 usable, which is why it was the standard for router-to-router links.",
        "**In the cloud the tax is higher.** AWS and Azure reserve **five** addresses in every subnet, GCP reserves **four**. This is not a footnote. On a /28 you plan for 16 addresses and get 11. Teams discover this during an incident, when an auto-scaling group cannot launch instances because the subnet is out of IPs.",
      ],
    },
    { kind: "reserved-ips-diagram" },
    {
      kind: "table",
      caption: "Reserved Addresses by Provider (example subnet 10.0.1.0/24)",
      headers: ["Address", "AWS", "Azure", "GCP"],
      rows: [
        ["10.0.1.0", "Network address", "Network address", "Network address"],
        ["10.0.1.1", "VPC router", "Default gateway", "Default gateway"],
        ["10.0.1.2", "DNS resolver (base + 2)", "Azure DNS mapping", "Usable"],
        ["10.0.1.3", "Reserved for future use", "Reserved for future use", "Usable"],
        ["10.0.1.254", "Usable", "Usable", "Reserved for future use"],
        ["10.0.1.255", "Broadcast (reserved, unsupported)", "Broadcast", "Broadcast"],
        ["**Total lost**", "**5**", "**5**", "**4**"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Do Not Design Tight",
      body: "A /28 for a 12-person team's workload leaves zero room for a sidecar container, a new replica, or a printer. The deck's advice holds in the cloud too: size for the requirement, then go one prefix bigger. Address space inside an RFC 1918 range is free. Re-architecting a VPC because you ran out is not.",
    },

    // ────────────────────────────────────────────────────────────────────
    // 4. VLSM
    // ────────────────────────────────────────────────────────────────────
    {
      kind: "prose",
      heading: "FLSM vs VLSM: Stop Wasting Half Your Space",
      body: [
        "**Fixed Length Subnet Masking (FLSM)** cuts a block into equal pieces. Simple, and catastrophically wasteful. If you split `192.168.10.0/24` into four equal /26 blocks (64 addresses each), the point-to-point WAN link that needs exactly 2 addresses consumes a full 64-address block. You just burned 62 addresses on a link between two routers.",
        "**Variable Length Subnet Masking (VLSM)** lets subnets of different sizes coexist in the same parent block. This is how every modern network is built, and it is what CIDR was designed to enable.",
        "",
        "**The Golden Rule: allocate from largest host requirement to smallest.**",
        "If you allocate the small blocks first, you fragment the space and the large block no longer has a contiguous home. Sort your requirements descending, then walk down the address space in order.",
      ],
    },
    {
      kind: "table",
      caption:
        "Worked VLSM example: carving 192.168.10.0/24 (the classic on-prem drill)",
      headers: ["Segment", "Hosts Needed", "Round up to 2^n", "Prefix", "Assigned Range", "Wasted"],
      rows: [
        ["HQ LAN", "50", "64", "/26", "192.168.10.0 – .63", "12"],
        ["Branch 1", "30", "32", "/27", "192.168.10.64 – .95", "0"],
        ["Branch 2", "12", "16", "/28", "192.168.10.96 – .111", "2"],
        ["WAN link", "2", "4", "/30", "192.168.10.112 – .115", "0"],
        ["**Remaining**", "—", "—", "—", "**192.168.10.116 – .255 (140 free)**", "—"],
      ],
    },
    {
      kind: "prose",
      body: [
        "Notice the arithmetic that makes this work. Each subnet starts exactly where the previous one ended, and each start address is a multiple of its own block size. `192.168.10.64` is a legal /27 boundary because 64 is divisible by 32. `192.168.10.70` would not be.",
        "**This is the rule that matters:** a subnet's network ID must be divisible by its block size. Break it and your router will either reject the configuration or silently route traffic to the wrong place.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "The Cardinal Sin: Overlapping Subnets",
      body: "Never assign two ranges that contain each other, like 192.168.1.0/24 and 192.168.1.0/25 on the same network. In the cloud this bites you at the org level: two VPCs that both use 10.0.0.0/16 can never be peered, and a VPN back to a corporate network using the same range will fail. Overlap is the number one reason a cloud network has to be rebuilt.",
    },

    // ────────────────────────────────────────────────────────────────────
    // 5. RFC 1918
    // ────────────────────────────────────────────────────────────────────
    {
      kind: "table",
      caption: "RFC 1918 Private Ranges (the only ranges you should build on)",
      headers: ["Range", "CIDR", "Total Addresses", "Practical Cloud Use"],
      rows: [
        [
          "10.0.0.0 – 10.255.255.255",
          "10.0.0.0/8",
          "16,777,216",
          "The default for cloud. Big enough to give every VPC, region, and account a non-overlapping slice.",
        ],
        [
          "172.16.0.0 – 172.31.255.255",
          "172.16.0.0/12",
          "1,048,576",
          "Docker's default bridge lives at 172.17.0.0/16. Avoid this range on hosts running containers.",
        ],
        [
          "192.168.0.0 – 192.168.255.255",
          "192.168.0.0/16",
          "65,536",
          "Home routers. Almost guaranteed to collide with an employee's home network over VPN. Do not use it in cloud.",
        ],
        [
          "100.64.0.0 – 100.127.255.255",
          "100.64.0.0/10 (RFC 6598)",
          "4,194,304",
          "Carrier-grade NAT space. Commonly borrowed as a secondary VPC CIDR for Kubernetes pod IPs.",
        ],
      ],
    },

    // ────────────────────────────────────────────────────────────────────
    // 6. INTO THE CLOUD
    // ────────────────────────────────────────────────────────────────────
    {
      kind: "prose",
      heading: "Part 2: Everything Above, Applied to a VPC",
      body: [
        "A **VPC** (Virtual Private Cloud) is a logically isolated network you define inside a provider's data centres. You give it a CIDR block, and every resource you launch draws an IP from it. GCP calls it a VPC too, Azure calls it a VNet, and the mental model is identical.",
        "Four things are true in the cloud that are not true on-prem, and they change how you design:",
        "**1. A subnet is pinned to one Availability Zone (AWS/Azure).** Not a rack, not a switch, an entire failure domain. If you want a workload in three AZs you need three subnets. This is the reason cloud subnet counts multiply so fast.",
        "**2. There is no such thing as a 'public subnet' setting.** A subnet is public purely because its route table has a `0.0.0.0/0` route pointing at an Internet Gateway. Change the route and the same subnet becomes private. Public and private are properties of routing, not of the subnet object.",
        "**3. The primary VPC CIDR is immutable.** On AWS you can add secondary CIDR blocks later, but you can never change or shrink the first one. On GCP you can expand a subnet's range but never shrink it. Your first `terraform apply` is a long-term commitment.",
        "**4. Every subnet is already routed to every other subnet in the VPC.** The `local` route is created automatically and cannot be deleted. Isolation between subnets comes from security groups and NACLs, not from the absence of a route.",
      ],
    },
    {
      kind: "table",
      caption: "Provider Differences That Actually Change Your Design",
      headers: ["Concept", "AWS", "GCP", "Azure"],
      rows: [
        [
          "Top-level CIDR",
          "VPC has a primary CIDR, /16 to /28. Up to 5 secondary blocks by default (50 max).",
          "VPC has no CIDR of its own. Each subnet carries its own range.",
          "VNet has an address space that can hold multiple prefixes.",
        ],
        [
          "Subnet scope",
          "Single Availability Zone.",
          "**Regional.** One subnet spans all zones in the region.",
          "Regional (spans zones).",
        ],
        [
          "Reserved IPs per subnet",
          "5",
          "4",
          "5",
        ],
        [
          "Can you resize?",
          "No. Add a secondary CIDR and new subnets instead.",
          "Yes, primary range can be expanded in place.",
          "Can add prefixes; subnet resize only if empty.",
        ],
        [
          "Public vs private",
          "Determined by route to Internet Gateway.",
          "Determined by whether the VM has an external IP.",
          "Determined by public IP association and route table.",
        ],
        [
          "Outbound from private",
          "NAT Gateway (per AZ, metered per GB).",
          "Cloud NAT (regional, no per-AZ instance).",
          "NAT Gateway (zonal or zone-redundant).",
        ],
      ],
    },

    // ────────────────────────────────────────────────────────────────────
    // 7. THE CARVE
    // ────────────────────────────────────────────────────────────────────
    {
      kind: "prose",
      heading: "Designing a Real VPC, Step by Step",
      body: [
        "Here is the method. It is the VLSM golden rule with a cloud-shaped wrapper.",
        "**Step 1: Pick the VPC block.** Default to a `/16` from `10.0.0.0/8`. 65,536 addresses sounds absurd for a small app, and it is exactly the right amount, because the block costs nothing and running out costs a migration. Reserve a different /16 for every VPC in your organisation so peering is always possible: `10.0.0.0/16` for prod-us-east-1, `10.1.0.0/16` for prod-eu-west-1, `10.10.0.0/16` for staging, and so on.",
        "**Step 2: Cut the VPC into tiers before you cut it into AZs.** This is the step people skip, and it is why so many VPCs end up unreadable. Split the /16 into four /18 blocks, one per tier, and hold the fourth back for growth.",
        "**Step 3: Cut each tier into per-AZ subnets, and always leave one slot spare.** Three AZs today, a fourth AZ opens next year. If you allocate exactly three, you have to break the pattern to add a fourth.",
        "**Step 4: Size each subnet by what runs in it, not by symmetry.** Public subnets hold NAT gateways and load balancer ENIs, so a /24 is generous. App subnets hold pods and tasks, so they need room. Data subnets hold a handful of RDS and ElastiCache ENIs.",
        "Watch the carve happen below, then read the resulting plan.",
      ],
    },

    { kind: "vpc-carve-diagram" },
    {
      kind: "image",
      src: vpcCidrSubnetImg,
      alt: "VPC and Subnets Visualization",
      caption: "Slicing a /16 VPC into multiple /24 Subnets"
    },
    {
      kind: "table",
      caption: "The resulting allocation plan for 10.0.0.0/16 (us-east-1, 3 AZs)",
      headers: ["Tier", "Reserved Block", "AZ-a", "AZ-b", "AZ-c", "Spare"],
      rows: [
        [
          "**Public** (ALB, NAT GW, bastion)",
          "10.0.0.0/18",
          "10.0.0.0/24",
          "10.0.1.0/24",
          "10.0.2.0/24",
          "10.0.3.0/24 → 10.0.63.255",
        ],
        [
          "**Private App** (EKS pods, ECS tasks, EC2)",
          "10.0.64.0/18",
          "10.0.64.0/20",
          "10.0.80.0/20",
          "10.0.96.0/20",
          "10.0.112.0/20",
        ],
        [
          "**Private Data** (RDS, ElastiCache, MSK)",
          "10.0.128.0/18",
          "10.0.128.0/22",
          "10.0.132.0/22",
          "10.0.136.0/22",
          "10.0.140.0/22 → 10.0.191.255",
        ],
        [
          "**Growth** (4th AZ, K8s pods, future tier)",
          "10.0.192.0/18",
          "—",
          "—",
          "—",
          "16,384 addresses held in reserve",
        ],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Why the App Tier Gets /20 and the Data Tier Gets /22",
      body: "A /22 gives 1,019 usable addresses, which is far more than enough for the ENIs of a few managed databases. A /20 gives 4,091, which sounds excessive until you run EKS with the AWS VPC CNI, where every single pod consumes a real VPC IP address. At 30 pods per node and 50 nodes you are already at 1,500 addresses in one AZ. Size the tier that consumes IPs per-workload, not per-instance.",
    },

    // ────────────────────────────────────────────────────────────────────
    // 8. ROUTING
    // ────────────────────────────────────────────────────────────────────
    {
      kind: "prose",
      heading: "Route Tables and Longest Prefix Match",
      body: [
        "You have subnets. Now they need to know where to send traffic. Every subnet is associated with exactly one **route table**, and a route table is a list of `destination CIDR → target` rules.",
        "When a packet leaves an instance, the VPC router compares the destination IP against every route and picks the **most specific match**, meaning the one with the longest prefix. `10.0.0.0/16` beats `0.0.0.0/0`. `10.0.5.0/24` beats `10.0.0.0/16`. The default route `0.0.0.0/0` matches everything and therefore always loses to any other match, which is why it works as a catch-all.",
        "This one rule explains the entire public/private split:",
        "• A **public** subnet's route table has `0.0.0.0/0 → igw-xxxx` (Internet Gateway). Instances with a public IP get two-way internet.",
        "• A **private** subnet's route table has `0.0.0.0/0 → nat-xxxx` (NAT Gateway). Instances get outbound internet for package downloads and API calls, but nothing on the internet can initiate a connection inward.",
        "Trace a packet through the table below. Change the destination and watch which route wins.",
      ],
    },
    { kind: "vpc-architecture-diagram" },
    { kind: "animation", variant: "vpc-packet-flow", caption: "Longest prefix match in a live VPC route table" },
    {
      kind: "table",
      caption: "A private subnet route table, annotated",
      headers: ["Destination", "Target", "What it does", "Who created it"],
      rows: [
        ["10.0.0.0/16", "local", "Reaches every other subnet in this VPC. Cannot be deleted or overridden.", "AWS, automatically"],
        ["0.0.0.0/0", "nat-0a1b2c3d", "Catch-all outbound. Sends internet-bound traffic to the NAT Gateway in the public subnet of the same AZ.", "You"],
        ["10.1.0.0/16", "pcx-9f8e7d6c", "Traffic for the peered analytics VPC goes over the peering connection, not the internet.", "You"],
        ["172.20.0.0/16", "vgw-4d3c2b1a", "Traffic for the on-prem data centre goes over the VPN / Direct Connect virtual gateway.", "You"],
        ["pl-63a5400a (S3 prefix list)", "vpce-1122334455", "S3 traffic uses a Gateway Endpoint, staying on the AWS backbone and skipping NAT data charges entirely.", "You"],
      ],
    },
    {
      kind: "callout",
      tone: "violet",
      title: "The NAT Gateway Bill",
      body: "NAT Gateways charge both an hourly rate and a per-GB processing fee on everything that passes through. A data pipeline pulling terabytes from S3 through a NAT Gateway is one of the most common surprise cloud bills there is. Add an S3 Gateway Endpoint (it is free) and that route disappears from the NAT entirely. Deploy one NAT Gateway per AZ, not one shared across AZs, or a single-AZ failure takes out egress for everything and you pay cross-AZ data transfer on top.",
    },

    // ────────────────────────────────────────────────────────────────────
    // 9. TERRAFORM
    // ────────────────────────────────────────────────────────────────────
    {
      kind: "prose",
      heading: "Expressing the Plan as Code",
      body: [
        "Hand-typing CIDR blocks into Terraform is how off-by-one overlaps get shipped. Terraform's `cidrsubnet(prefix, newbits, netnum)` function does the bit arithmetic for you: it adds `newbits` to the prefix length and returns block number `netnum`.",
        "`cidrsubnet(\"10.0.0.0/16\", 4, 0)` → `10.0.0.0/20`  (16 + 4 = /20, first block)",
        "`cidrsubnet(\"10.0.0.0/16\", 4, 1)` → `10.0.16.0/20` (second block)",
        "`cidrsubnet(\"10.0.0.0/16\", 8, 0)` → `10.0.0.0/24`  (16 + 8 = /24, first block)",
      ],
    },
    {
      kind: "code",
      language: "hcl",
      caption: "A three-AZ VPC that matches the plan above",
      code: `locals {
  vpc_cidr = "10.0.0.0/16"
  azs      = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

resource "aws_vpc" "main" {
  cidr_block           = local.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "prod-us-east-1" }
}

# Public tier: /24 per AZ, carved from the 10.0.0.0/18 reservation.
# newbits = 8 -> /24. netnum 0,1,2 -> 10.0.0.0, 10.0.1.0, 10.0.2.0
resource "aws_subnet" "public" {
  count                   = length(local.azs)
  vpc_id                  = aws_vpc.main.id
  availability_zone       = local.azs[count.index]
  cidr_block              = cidrsubnet(local.vpc_cidr, 8, count.index)
  map_public_ip_on_launch = true
  tags = {
    Name                     = "public-\${local.azs[count.index]}"
    "kubernetes.io/role/elb" = "1"
  }
}

# Private app tier: /20 per AZ inside the 10.0.64.0/18 reservation.
# newbits = 4 -> /20. netnum 4,5,6 -> 10.0.64.0, 10.0.80.0, 10.0.96.0
resource "aws_subnet" "private_app" {
  count             = length(local.azs)
  vpc_id            = aws_vpc.main.id
  availability_zone = local.azs[count.index]
  cidr_block        = cidrsubnet(local.vpc_cidr, 4, 4 + count.index)
  tags = {
    Name                              = "private-app-\${local.azs[count.index]}"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# Private data tier: /22 per AZ inside the 10.0.128.0/18 reservation.
# newbits = 6 -> /22. netnum 32,33,34 -> 10.0.128.0, 10.0.132.0, 10.0.136.0
resource "aws_subnet" "private_data" {
  count             = length(local.azs)
  vpc_id            = aws_vpc.main.id
  availability_zone = local.azs[count.index]
  cidr_block        = cidrsubnet(local.vpc_cidr, 6, 32 + count.index)
  tags = { Name = "private-data-\${local.azs[count.index]}" }
}

# One NAT Gateway per AZ. Costs more, survives an AZ failure.
resource "aws_nat_gateway" "this" {
  count         = length(local.azs)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
}

resource "aws_route_table" "private" {
  count  = length(local.azs)
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.this[count.index].id
  }
}`,
    },
    {
      kind: "code",
      language: "bash",
      caption: "Verifying the carve before you apply it",
      code: `# Confirm two blocks do not overlap (Python has this built in)
python3 -c "
import ipaddress
a = ipaddress.ip_network('10.0.64.0/20')
b = ipaddress.ip_network('10.0.80.0/20')
print('overlap:', a.overlaps(b))
print('a range:', a[0], '->', a[-1], '| usable on AWS:', a.num_addresses - 5)
"

# List every /20 inside a /16 reservation
python3 -c "
import ipaddress
for net in ipaddress.ip_network('10.0.64.0/18').subnets(new_prefix=20):
    print(net, net[0], '->', net[-1])
"

# Check live IP consumption in a subnet before scaling
aws ec2 describe-subnets --subnet-ids subnet-0a1b2c3d \\
  --query 'Subnets[0].[CidrBlock,AvailableIpAddressCount]' --output text`,
    },

    // ────────────────────────────────────────────────────────────────────
    // 10. THE KUBERNETES TRAP
    // ────────────────────────────────────────────────────────────────────
    {
      kind: "prose",
      heading: "The Kubernetes IP Exhaustion Trap",
      body: [
        "This deserves its own section because it is the most common way a well-designed VPC runs out of addresses.",
        "With the **AWS VPC CNI** (the default on EKS), every pod gets a real, routable VPC IP address from the subnet its node lives in. Not a virtual overlay address, a genuine subnet IP. A single `m5.large` node can host 29 pods, and each one takes an address.",
        "Do the arithmetic on a /24 app subnet: 251 usable addresses. Eight nodes at 29 pods each and you are full. `kubectl get pods` shows `Pending`, the events say `failed to assign an IP address to container`, and nothing scales until you fix the network layout.",
        "Three ways out, in order of preference:",
        "**1. Size the app tier correctly from day one.** A /20 per AZ gives 4,091 addresses. This is why the plan above uses /20 for app subnets.",
        "**2. Add a secondary CIDR for pods.** Attach `100.64.0.0/16` (RFC 6598 CGNAT space) as a secondary VPC CIDR, create pod-only subnets in it, and enable CNI custom networking. Pods get addresses from the secondary range while nodes and load balancers stay in the primary range.",
        "**3. Turn on prefix delegation.** The CNI assigns each node a /28 prefix instead of individual IPs, which raises pod density per node dramatically and reduces API pressure.",
        "**On GKE it is structured differently.** GKE uses alias IP ranges: your subnet has a primary range for nodes plus named secondary ranges for pods and services. A typical layout is a /20 primary for nodes, a /14 secondary for pods, and a /20 secondary for services. The pod range is chosen at cluster creation and cannot be changed afterwards, so the same planning discipline applies.",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "Pod IP demand: work this out before you pick a prefix",
      code: `Cluster target:  50 nodes per AZ, 30 pods per node
Pod IPs needed:  50 x 30           = 1,500
Node IPs:        50                =    50
Internal LB ENIs, headroom:        =   200
                                     -------
Total per AZ:                        1,750

/22 = 1,019 usable  ->  NOT ENOUGH
/21 = 2,043 usable  ->  fits, but only 14% headroom
/20 = 4,091 usable  ->  comfortable, allows the cluster to double

Decision: /20 per AZ for the app tier.`,
    },

    // ────────────────────────────────────────────────────────────────────
    // 11. ORG SCALE
    // ────────────────────────────────────────────────────────────────────
    {
      kind: "prose",
      heading: "Thinking Beyond One VPC",
      body: [
        "The moment you have two VPCs, subnet design becomes an organisational problem. Two VPCs that both use `10.0.0.0/16` can never peer, can never share a Transit Gateway route table, and can never both reach the same on-prem network.",
        "Adopt a **top-down allocation scheme** and write it down before you build the second VPC:",
        "• `10.0.0.0/8` is the corporate space, split by purpose.",
        "• `10.0.0.0/12` → production (each region and account gets a /16 inside it).",
        "• `10.16.0.0/12` → staging.",
        "• `10.32.0.0/12` → development and sandboxes.",
        "• `10.48.0.0/12` → shared services (transit, inspection, shared tooling).",
        "• `100.64.0.0/10` → Kubernetes pod ranges, deliberately outside RFC 1918 so it never collides with on-prem.",
        "Then within production: `10.0.0.0/16` prod-us-east-1, `10.1.0.0/16` prod-us-west-2, `10.2.0.0/16` prod-eu-west-1, and so on. Any engineer reading `10.2.64.19` can decode it as production, Ireland, app tier without opening a console.",
        "Both AWS and Azure ship an **IPAM** service that enforces this hierarchy and blocks allocations that would overlap. If your organisation is past three VPCs, it is worth the setup.",
      ],
    },
    {
      kind: "prose",
      heading: "A Word on IPv6",
      body: [
        "Everything above is IPv4 arithmetic driven by scarcity. IPv6 removes the scarcity entirely, and with it most of the planning.",
        "In AWS a VPC gets a `/56` and every subnet gets a fixed `/64`. You do not size IPv6 subnets by host count, because a single /64 holds 18 quintillion addresses. At ten million allocations per second with no reuse, exhausting one /64 takes roughly 58,000 years.",
        "The mental shift: **stop sizing by host count, start planning by network segment.** The /64 boundary is fixed by the standard (SLAAC depends on it), so your only design decision is how many /64s each segment gets.",
        "IPv6 also removes NAT from the picture. Every address is globally routable, so an **Egress-Only Internet Gateway** replaces the NAT Gateway when you want outbound-only traffic. Same routing concept, no address translation, no per-GB processing fee. Most cloud networks today run **dual stack**, carrying both protocols, because the wider internet is still mid-transition.",
      ],
    },

    // ────────────────────────────────────────────────────────────────────
    // 12. TROUBLESHOOTING
    // ────────────────────────────────────────────────────────────────────
    {
      kind: "table",
      caption: "Debugging Checklist: 'my instance cannot reach X'",
      headers: ["Symptom", "Most likely cause", "Where to look"],
      rows: [
        [
          "Cannot reach the internet from a private subnet",
          "Route table has no 0.0.0.0/0 entry, or it points at an IGW instead of a NAT Gateway.",
          "Route table associated with that subnet.",
        ],
        [
          "Public instance unreachable from outside",
          "No public IP assigned, or the subnet's route table lacks the IGW route.",
          "`map_public_ip_on_launch` and the route table.",
        ],
        [
          "Auto-scaling fails with `InsufficientFreeAddressesInSubnet`",
          "Subnet exhausted. Remember the 5 reserved addresses.",
          "`AvailableIpAddressCount` on the subnet.",
        ],
        [
          "Peering connection created but traffic does not flow",
          "Peering only builds the pipe. You must add routes on **both** sides.",
          "Route tables in both VPCs.",
        ],
        [
          "VPN to on-prem drops some destinations",
          "Overlapping CIDR between VPC and the on-prem network.",
          "Compare both ranges for overlap.",
        ],
        [
          "Traffic reaches the subnet but the app never responds",
          "Routing is fine. This is a security group or NACL problem.",
          "Security group inbound rules, then NACLs (which are stateless and need both directions).",
        ],
      ],
    },

    // ────────────────────────────────────────────────────────────────────
    // 13. WRAP
    // ────────────────────────────────────────────────────────────────────
    {
      kind: "takeaways",
      items: [
        "A subnet mask is a filter of contiguous 1s then 0s. The router ANDs the destination IP with the mask to get the network ID, and that single operation drives all IP routing.",
        "Total addresses = 2^(32 − prefix). A smaller prefix number means a bigger network. A subnet's network ID must be divisible by its own block size.",
        "VLSM's golden rule: allocate from the largest host requirement down to the smallest, or you fragment the space.",
        "On-prem you lose 2 addresses per subnet. AWS and Azure take 5, GCP takes 4. Size accordingly, then go one prefix bigger.",
        "In the cloud a subnet is pinned to one Availability Zone, and 'public' means nothing more than having a 0.0.0.0/0 route to an Internet Gateway.",
        "The primary VPC CIDR is permanent. Reserve tiers first (/18 blocks), then carve AZ subnets inside them, and always leave a spare slot.",
        "Route tables resolve by longest prefix match, which is why 0.0.0.0/0 works as a catch-all and why the local route can never be overridden.",
        "Kubernetes pods consume real VPC IPs. Size the app tier for pod count, not node count, or use a secondary CIDR from 100.64.0.0/10.",
        "Never let two VPCs share a CIDR. Plan an org-wide allocation scheme before you build the second one.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "cidr-block-size",
          question:
            "You have the block 10.0.0.0/16 and need to carve subnets of /20. What is the network ID of the third /20 subnet?",
          options: ["10.0.20.0/20", "10.0.32.0/20", "10.0.3.0/20", "10.0.48.0/20"],
          correctIndex: 1,
          explanation:
            "A /20 has a mask of 255.255.240.0, so the block size in the third octet is 256 − 240 = 16. The subnets step 10.0.0.0, 10.0.16.0, 10.0.32.0, 10.0.48.0. The third one is 10.0.32.0/20.",
        },
        {
          id: "cidr-aws-usable",
          question:
            "You create a 10.0.5.0/28 subnet in an AWS VPC. How many addresses can you actually assign to instances?",
          options: ["16", "14", "11", "13"],
          correctIndex: 2,
          explanation:
            "A /28 has 2^4 = 16 total addresses. AWS reserves five in every subnet: the network address, the VPC router, the DNS resolver, one held for future use, and the broadcast address. That leaves 11.",
        },
        {
          id: "cidr-public-private",
          question: "What actually makes a subnet 'public' in AWS?",
          options: [
            "A checkbox labelled 'public' on the subnet resource.",
            "Its route table contains a 0.0.0.0/0 route pointing at an Internet Gateway.",
            "It uses an address range outside RFC 1918.",
            "It sits in the first Availability Zone of the region.",
          ],
          correctIndex: 1,
          explanation:
            "There is no public flag. A subnet is public purely because of routing. Point 0.0.0.0/0 at an Internet Gateway and it is public; point it at a NAT Gateway and the same subnet becomes private.",
        },
        {
          id: "cidr-longest-prefix",
          question:
            "A packet is destined for 10.1.4.20. The route table contains 10.0.0.0/16 → local, 0.0.0.0/0 → nat-abc, and 10.1.0.0/16 → pcx-xyz. Which route wins?",
          options: [
            "0.0.0.0/0 → nat-abc, because default routes take priority.",
            "10.0.0.0/16 → local, because local routes always win.",
            "10.1.0.0/16 → pcx-xyz, because it is the most specific match.",
            "The packet is dropped because two routes match.",
          ],
          correctIndex: 2,
          explanation:
            "Routers use longest prefix match. 10.1.4.20 does not fall inside 10.0.0.0/16 at all. Between 10.1.0.0/16 and 0.0.0.0/0, the /16 is more specific, so the packet goes over the peering connection.",
        },
        {
          id: "cidr-vlsm-order",
          question:
            "Why does VLSM require you to allocate the largest subnet first?",
          options: [
            "Because routers process larger subnets faster.",
            "Because small subnets allocated first fragment the space and leave no contiguous room for a large block.",
            "Because the largest subnet must always start at the .0 address.",
            "It is a convention only and has no technical effect.",
          ],
          correctIndex: 1,
          explanation:
            "Every subnet must start on a boundary divisible by its own block size. Placing small blocks first leaves gaps that no longer align to the boundary a large block needs, so the large block cannot fit even when the raw address count would allow it.",
        },
        {
          id: "cidr-k8s",
          question:
            "An EKS cluster in a /24 app subnet stops scheduling pods with 'failed to assign an IP address to container'. What is happening?",
          options: [
            "The security group is blocking the CNI plugin.",
            "The AWS VPC CNI gives every pod a real VPC IP, and the 251 usable addresses in the /24 are exhausted.",
            "The NAT Gateway has hit its connection limit.",
            "The cluster needs a larger instance type.",
          ],
          correctIndex: 1,
          explanation:
            "With the AWS VPC CNI, pods consume actual subnet addresses rather than overlay addresses. A /24 gives 251 usable IPs, which roughly eight nodes at 29 pods each will exhaust. Fix it with a larger subnet, a secondary CIDR from 100.64.0.0/10, or prefix delegation.",
        },
        {
          id: "cidr-ipv6-sizing",
          question: "Why do you not size IPv6 subnets by host count?",
          options: [
            "Because IPv6 does not use subnets.",
            "Because the /64 boundary is fixed by the standard and holds 18 quintillion addresses, so host count is never the constraint.",
            "Because IPv6 addresses are assigned by the ISP and cannot be subdivided.",
            "Because NAT handles the address sharing instead.",
          ],
          correctIndex: 1,
          explanation:
            "IPv6 subnets are standardised at /64 because SLAAC depends on that boundary. A single /64 would take roughly 58,000 years to exhaust at ten million allocations per second, so you plan by network segment rather than by host count.",
        },
      ],
    },
  ],
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


export const tcpUdpLesson: LessonContent = {
  slug: "tcp-udp",
  title: "TCP vs UDP",
  subtitle: "Understanding Transport Layer Protocols",
  sections: [
    {
      kind: "prose",
      heading: "The TCP/IP Model (Real World vs Theory)",
      body: [
        "While the 7-layer OSI Model is a fantastic theoretical framework for understanding networks, the internet as we know it actually runs on the **TCP/IP Model**.",
        "The TCP/IP model simplifies the 7 OSI layers into just **4 layers**. It groups the layers that handle software applications into one layer, and groups the hardware-level data link and physical layers into another."
      ]
    },
    {
      kind: "osi-tcp-mapping-diagram"
    },
    {
      kind: "prose",
      heading: "The Two Types of Delivery",
      body: [
        "Once your data has an IP address and knows which port it needs to reach, it needs a delivery service to transport it across the network.",
        "The Transport Layer gives you two main options for this delivery: TCP (Transmission Control Protocol) and UDP (User Datagram Protocol).",
        "TCP is focused on reliability and order. UDP is focused entirely on speed."
      ]
    },
    {
      kind: "callout",
      tone: "info",
      title: "TCP (Transmission Control Protocol)",
      body: "TCP is connection-oriented. It requires a formal connection before any data transfer begins. It ensures ordered delivery of data with built-in error checking and retransmission of lost packets. Because of this high reliability, it has higher overhead which uses more bandwidth and is slightly slower. It is best suited for transferring files, web pages, images, and emails."
    },
    {
      kind: "callout",
      tone: "violet",
      title: "UDP (User Datagram Protocol)",
      body: "UDP is connectionless. It sends data without any prior handshake. It is entirely unreliable because there is no guarantee of delivery, no retransmission, and no strict ordering. However, it is incredibly fast and lightweight with minimal overhead. It is best suited for real-time communications where speed matters more than perfect reliability."
    },
    {
      kind: "tcp-udp-diagram"
    },
    {
      kind: "image",
      src: tcpVsUdpImg,
      alt: "TCP vs UDP visual comparison",
      caption: "A high-level view of how TCP's handshake compares to UDP's direct broadcast."
    },
    {
      kind: "table",
      caption: "TCP vs UDP Key Differences",
      headers: ["Feature", "TCP", "UDP"],
      rows: [
        ["Connection", "Requires established connection", "Connectionless (no setup)"],
        ["Delivery", "Guarantees delivery and order", "No guarantee of delivery or order"],
        ["Error Handling", "Retransmits lost packets", "No retransmission"],
        ["Speed", "Slower (higher overhead)", "Faster (lightweight, low overhead)"],
        ["Broadcasting", "Not supported", "Supported (broadcast and multicast)"],
        ["Use Cases", "Web, email, file transfer, remote login", "Streaming, DNS, VoIP, online gaming"]
      ]
    },
    {
      kind: "takeaways",
      items: [
        "TCP guarantees your data arrives exactly as sent, but the constant checking makes it slower.",
        "UDP blasts data as fast as possible without checking if it arrived, making it perfect for live streams.",
        "Use TCP when losing data breaks the application (like a file download or a web page).",
        "Use UDP when speed is critical and a few missing pieces won't ruin the experience (like a video call)."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "tcp-udp-use-case",
          question: "Which of the following scenarios is the BEST use case for UDP?",
          options: [
            "Downloading a large PDF document",
            "Streaming a live sports match",
            "Loading a banking website",
            "Sending an important email"
          ],
          correctIndex: 1,
          explanation: "Live sports streaming prioritizes speed and real-time delivery. If a few frames are lost, it is better to skip them and keep the stream live rather than pausing to re-transmit the missing data."
        },
        {
          id: "tcp-guarantee",
          question: "How does TCP guarantee that data is delivered successfully?",
          options: [
            "By sending the data twice just in case.",
            "By requiring the receiver to send back an Acknowledgment (ACK) for every packet.",
            "By blasting data as fast as possible to overwhelm the network.",
            "By using a direct physical cable between the client and server."
          ],
          correctIndex: 1,
          explanation: "TCP uses Acknowledgments (ACKs). The receiver must reply with an ACK to confirm receipt. If the sender doesn't get an ACK, it retransmits the missing packet."
        },
        {
          id: "tcp-udp-overhead",
          question: "Why is UDP generally faster than TCP?",
          options: [
            "UDP has lower overhead because it doesn't establish a connection or check for dropped packets.",
            "UDP uses a premium internet lane.",
            "UDP compresses the data more efficiently.",
            "TCP is an outdated protocol from the 1980s."
          ],
          correctIndex: 0,
          explanation: "UDP simply fires the data at the destination without handshakes, strict ordering, or error recovery, resulting in minimal overhead and much faster transmission."
        },
        {
          id: "tcp-handshake",
          question: "What is the 3-way handshake in TCP?",
          options: [
            "A security protocol to encrypt data.",
            "The process of closing a connection (FIN, FIN-ACK, ACK).",
            "The initial connection setup process (SYN, SYN-ACK, ACK) before data is sent.",
            "A method to group 3 packets together for faster delivery."
          ],
          correctIndex: 2,
          explanation: "Before any data is transferred, TCP establishes a reliable connection using a 3-way handshake: SYN (synchronize), SYN-ACK (synchronize-acknowledge), and ACK (acknowledge)."
        }
      ]
    }
  ]
};



export const httpHttpsLesson: LessonContent = {
  slug: "http-https",
  title: "HTTP & HTTPS",
  subtitle: "The protocol that powers the web. Learn how requests and responses work, and why HTTPS is the production standard.",
  sections: [
    {
      kind: "prose",
      heading: "What HTTP Is",
      body: [
        "Almost everything a modern system does over the network uses HTTP somewhere. It is the request and response protocol behind websites, public APIs, mobile backends, and a lot of internal service to service calls.",
        "HTTP defines the meaning of common parts of a request and a response:",
        "• Methods such as GET, POST, PUT, and DELETE",
        "• Status codes such as 200, 404, 429, and 503",
        "• Headers such as Content-Type, Authorization, and Cache-Control",
        "• Message bodies such as HTML, JSON, or images",
        "HTTP is not tied to one network transport forever. HTTP/1.1 and HTTP/2 commonly run over TCP. HTTP/3 runs over QUIC, which runs over UDP. The core meaning still stays the same: request method, path, headers, status, and body."
      ]
    },
    {
      kind: "http-req-res-viewer"
    },
    {
      kind: "prose",
      heading: "How HTTP Works",
      body: [
        "At a high level, an HTTP request follows a simple path. The client resolves the hostname through DNS, opens a transport connection, performs a TLS handshake for HTTPS, and sends an HTTP request. The server routes the request to application code and sends an HTTP response.",
        "This simple flow often hides many production components like CDNs, API gateways, load balancers, and application servers. These components can read or change HTTP headers only after the traffic has been decrypted.",
        "HTTP is stateless at the protocol level. Each request carries enough information for the server to understand it, and the protocol itself does not assume the server remembers a hidden session from the previous request.",
        "That does not mean web systems are stateless. Real systems keep state in cookies, session stores, tokens, caches, and databases. The important design question is simple: where does the state live, and what happens if a request is retried?"
      ]
    },
    {
      kind: "table",
      caption: "HTTP Methods (Safe vs Idempotent)",
      headers: ["Method", "Common Use", "Safe", "Idempotent"],
      rows: [
        ["GET", "Read a resource", "Yes", "Yes"],
        ["HEAD", "Read response headers only", "Yes", "Yes"],
        ["POST", "Create a resource or start a command", "No", "No by default"],
        ["PUT", "Replace or create a resource at a known URL", "No", "Yes"],
        ["PATCH", "Partially update a resource", "No", "Not guaranteed"],
        ["DELETE", "Delete a resource", "No", "Yes"],
      ]
    },
    {
      kind: "prose",
      heading: "Idempotency",
      body: [
        "Safe means the client is asking to read, not change, server state. Idempotent means repeating the same request should have the same intended effect as sending it once.",
        "Idempotency is not trivia. It decides whether clients can safely retry after timeouts, connection resets, and load balancer failures. POST requests for payments should usually require an idempotency key to prevent double charging."
      ]
    },
    {
      kind: "table",
      caption: "HTTP Status Codes",
      headers: ["Range", "Meaning", "Examples"],
      rows: [
        ["1xx", "Informational", "100 Continue, 103 Early Hints"],
        ["2xx", "Success", "200 OK, 201 Created, 204 No Content"],
        ["3xx", "Redirect or alternate location", "301 Moved Permanently, 304 Not Modified"],
        ["4xx", "Client-side problem", "400 Bad Request, 401 Unauthorized, 404 Not Found, 429 Too Many Requests"],
        ["5xx", "Server-side or internal dependency problem", "500 Internal Server Error, 502 Bad Gateway, 504 Gateway Timeout"],
      ]
    },
    {
      kind: "prose",
      heading: "Caching and Conditional Requests",
      body: [
        "HTTP has mature caching rules. Used well, caching makes systems faster, reduces load on origin servers, lowers cloud cost, and can keep users working during partial failures.",
        "Important headers include Cache-Control (who may cache and for how long) and ETag (a version identifier for a cached response). A client can ask whether an ETag is still current using If-None-Match. If it is, the server replies with a 304 Not Modified, saving bandwidth."
      ]
    },
    { kind: "http-cache-diagram" },
    {
      kind: "prose",
      heading: "What HTTPS Adds",
      body: [
        "HTTPS is HTTP over TLS. TLS is the modern security protocol. SSL is old terminology and should not be used for new systems. HTTPS provides three main protections:",
        "1. Confidentiality: People or systems in the middle cannot read the protected HTTP data.",
        "2. Integrity: People or systems in the middle cannot change protected traffic without being detected.",
        "3. Server authentication: The client can check that the server is allowed to use the hostname.",
        "HTTPS is the baseline expectation today. Production APIs should assume HTTPS from the very first design review."
      ]
    },
    {
      kind: "image",
      src: httpVsHttpsImg,
      alt: "Comparison of HTTP vs HTTPS"
    },
    {
      kind: "tls-handshake-diagram"
    },
    {
      kind: "prose",
      heading: "HTTP Versions",
      body: [
        "HTTP has evolved without changing its core request and response model.",
        "**HTTP/1.1** made reusable connections the default. It is simple and widely supported, but its weakness is concurrency. A single connection handles responses in order, so one slow response can hold up later responses on that connection.",
        "**HTTP/2** keeps the same HTTP meaning but uses binary frames instead of text messages. It allows multiple streams over one TCP connection. This reduces head of line blocking at the HTTP layer, but not at the TCP layer. If one TCP segment is lost, all streams on that TCP connection may wait until the missing bytes are recovered.",
        "**HTTP/3** runs over QUIC instead of TCP. QUIC runs over UDP. This finally reduces TCP level head of line blocking between streams and allows faster connection setups."
      ]
    },
    {
      kind: "http-versions-diagram"
    },
    {
      kind: "prose",
      heading: "HTTP in Distributed Systems",
      body: [
        "HTTP is easy to start with and easy to misuse. Every HTTP client should set timeouts for each stage of a request: DNS lookup, connection setup, the TLS handshake, writing the request, and waiting for response headers.",
        "The defaults in many libraries are unsafe for production. A missing timeout can turn one slow dependency into exhausted threads, stuck connection pools, or a larger outage.",
        "Retries should respect HTTP method behavior and application idempotency. Retrying a GET is usually safe. Retrying a POST can create duplicates unless the API supports idempotency keys."
      ]
    },
    {
      kind: "takeaways",
      items: [
        "HTTP is the request and response language of the web. It uses methods, headers, status codes, and bodies.",
        "HTTPS is HTTP protected by TLS, which adds encryption, tamper detection, and server identity checks.",
        "Idempotency matters. Safe methods like GET only read data, while idempotent methods like PUT mean repeating the request is safe.",
        "HTTP/2 solves HTTP head of line blocking but suffers from TCP head of line blocking. HTTP/3 solves this by moving to UDP.",
        "Set strict timeouts and retries on all HTTP clients to prevent cascading failures in distributed systems."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "http-idempotency",
          question: "Which of the following HTTP methods is NOT idempotent by default?",
          options: ["GET", "PUT", "DELETE", "POST"],
          correctIndex: 3,
          explanation: "POST is not idempotent by default. Repeating a POST request can create multiple resources or trigger multiple actions unless the API implements an idempotency key."
        },
        {
          id: "http-status-codes",
          question: "A client sends too many requests in a short time. Which status code should the server return?",
          options: ["400 Bad Request", "401 Unauthorized", "429 Too Many Requests", "503 Service Unavailable"],
          correctIndex: 2,
          explanation: "429 Too Many Requests is the standard status code for rate limiting."
        },
        {
          id: "http-head-of-line",
          question: "How does HTTP/3 solve the TCP head of line blocking problem that affects HTTP/2?",
          options: [
            "It uses binary frames instead of text.",
            "It opens multiple parallel TCP connections.",
            "It runs over QUIC and UDP, making streams completely independent.",
            "It forces the server to push responses asynchronously."
          ],
          correctIndex: 2,
          explanation: "HTTP/3 runs over QUIC (which uses UDP). Since UDP has no strict ordering or blocking, a lost packet in one stream does not pause other active streams."
        },
        {
          id: "https-benefits",
          question: "Which of the following is NOT a protection provided by HTTPS?",
          options: [
            "Confidentiality (encryption)",
            "Server Authentication",
            "Integrity (tamper detection)",
            "Automatic User Authentication"
          ],
          correctIndex: 3,
          explanation: "HTTPS verifies the server's identity via certificates, but it does not automatically authenticate the end user. You still need OAuth, JWTs, or session cookies for that."
        },
        {
          id: "http-caching",
          question: "Which header does a client use to ask the server if a cached resource is still valid based on its ETag?",
          options: ["Cache-Control", "If-None-Match", "Last-Modified", "Content-Type"],
          correctIndex: 1,
          explanation: "The client sends the 'If-None-Match' header containing the cached ETag. If the resource hasn't changed, the server returns a 304 Not Modified."
        }
      ]
    }
  ]
};

export const dnsLesson: LessonContent = {
  slug: "dns",
  title: "Domain Name System (DNS)",
  subtitle:
    "How a name like `blog.example.com` turns into an IP address, who answers along the way, and why caching is what actually keeps it standing up.",
  sections: [
    {
      kind: "prose",
      heading: "The problem DNS solves",
      body: [
        "Computers do not talk to names. They talk to addresses. Before your browser can send a single byte to `example.com`, it needs a number like `93.184.216.34` — because that is what a router knows how to forward a packet toward.",
        "So one of two things has to be true. Either every person memorises the IP address of every service they use, or something translates names into addresses on demand. **DNS is that something.**",
        "It is usually described as the phonebook of the internet, and that captures the lookup part. But a phonebook is one book, printed once, in one place. DNS is a **hierarchical, decentralised, globally distributed database** that answers trillions of queries a day, has no single owner, and has never been fully offline. That is the part worth understanding.",
        "One thing to be clear about from the start: **DNS does not fetch anything.** It resolves a name to an address and stops. Everything you actually wanted — the HTML, the API response, the video — happens afterwards, over a separate connection to the address DNS handed back."
      ]
    },
    {
      kind: "analogy",
      title: "Asking for directions, not being driven there",
      text:
        "You want to visit a company you only know by name. You ask a **concierge** (the resolver). The concierge does not know either, so they ask the **city registry** (root), which says \"that's a commercial firm, ask the commercial registry.\" The **commercial registry** (TLD) says \"that company keeps its own records office — here's where it is.\" The **records office** (authoritative nameserver) finally gives the street address. The concierge writes it in a notepad (cache) and hands it to you. Then — and only then — **you** make the journey yourself. The concierge never went anywhere on your behalf."
    },
    {
      kind: "prose",
      heading: "The four kinds of server involved",
      body: [
        "Almost every DNS explanation gets confusing because people say \"the DNS server\" as if there is one. There are four distinct roles, and each one has a genuinely different job.",
        "**1. Recursive resolver.** The only one your device ever talks to. It accepts one question and takes on the responsibility of returning a finished answer. It is run by your ISP, or by a public provider like `1.1.1.1` (Cloudflare) or `8.8.8.8` (Google), and it is where nearly all of the caching happens.",
        "**2. Root server.** The top of the tree, denoted by a single dot. It does not know any website addresses. It knows which servers run each top-level domain. There are **13 root server identities** (`a` through `m`, overseen by ICANN), but hundreds of physical machines share those addresses using **anycast routing**, so \"the root server\" you reach is whichever one is closest to you on the network.",
        "**3. TLD server.** Holds every domain registered under one top-level domain — `.com`, `.org`, `.net`, `.uk`, `.jp`. The `.com` zone is operated by Verisign under IANA/ICANN delegation. It stores one delegation per domain: which nameservers are authoritative for it. It does not store your website's IP address either.",
        "**4. Authoritative nameserver.** The source of truth for a specific domain. It holds the zone file with every record you configured, and it is the only server entitled to say a name does not exist (**NXDOMAIN**).",
        "Notice the pattern: **the first two servers you ask never answer your question.** They tell you who to ask next. That refusal to centralise is the single design decision that lets DNS scale to the whole internet."
      ]
    },
    {
      kind: "dns-resolution-walkthrough"
    },
    {
      kind: "prose",
      heading: "The lookup, in words",
      body: [
        "1. You type `blog.example.com`. The browser checks its own cache, then the OS stub resolver's cache. If either has a valid entry, the lookup ends here — and most of the time, it does.",
        "2. On a miss, the client sends **one recursive query** to its configured resolver, with the RD (recursion desired) flag set.",
        "3. The resolver checks its cache. On a miss, it queries a **root server**.",
        "4. The root replies with a **referral**: the nameservers for `.com`.",
        "5. The resolver queries the **`.com` TLD server**.",
        "6. The TLD replies with another referral: the **authoritative nameservers** for `example.com`.",
        "7. The resolver queries the **authoritative nameserver**.",
        "8. The authoritative server returns the **A record** — the IP address — with the AA (authoritative answer) bit set and a TTL.",
        "9. The resolver caches everything it learned and returns the address to the client.",
        "10. The browser opens a TCP connection to that IP, performs the TLS handshake, and sends the HTTP request. **This is where DNS ends and the actual page load begins.**"
      ]
    },
    {
      kind: "image",
      src: dnsImg,
      alt: "Overview of the Domain Name System: the step-by-step lookup from browser to authoritative nameserver, common record types, and how caching speeds up later requests",
      caption: "The whole system on one page — lookup, records, and caching",
    },
    {
      kind: "callout",
      tone: "info",
      title: "DNS runs on UDP port 53 — and that choice has consequences",
      body:
        "A query and its answer usually fit in a single UDP datagram, so there is no handshake and no connection state: one packet out, one packet back. That is why lookups are fast. It is also why DNS is a favourite tool for amplification attacks (a small spoofed query producing a large reply aimed at a victim), and why responses larger than the limit fall back to TCP. Modern deployments increasingly wrap the whole thing in TLS or HTTPS — **DoT** on port 853, **DoH** on port 443 — so that your ISP cannot read or rewrite your lookups."
    },
    {
      kind: "prose",
      heading: "The namespace is a tree",
      body: [
        "Every domain name is a path from a leaf up to the root, written right to left. `blog.example.com.` is really four labels: `blog`, then `example`, then `com`, then the empty root label — that trailing dot you almost never type but which is always implied.",
        "Each level is delegated to a different party, and that delegation is the reason no single organisation has to be trusted with everything. ICANN oversees the root. Verisign runs `.com`. Nominet runs `.uk`. You run `example.com` once you register it. Below that, **subdomains cost you nothing and need no registrar** — they are just extra lines in a file you already control."
      ]
    },
    {
      kind: "dns-hierarchy-diagram"
    },
    {
      kind: "prose",
      heading: "Subdomains, and why they matter architecturally",
      body: [
        "A subdomain is a prefix on a domain you already own: `subdomain.primarydomain.TLD`. `blog.example.com`, `support.example.com`, `api.example.com`.",
        "The useful part is not the naming. It is that **each subdomain can point at completely different infrastructure** while sharing one registered domain: `blog` at a static host, `api` at a load balancer in your VPC, `support` at a third-party SaaS vendor, `status` at a status-page provider. One domain, four vendors, zero coordination between them.",
        "A **DNS zone** is the portion of the namespace that one entity administers. By default your whole domain is one zone, but you can delegate a subtree — say, hand `internal.example.com` to a different team with its own nameservers — and it becomes its own zone. That is how large organisations give teams autonomy over their own names without handing over the keys to the whole domain."
      ]
    },
    {
      kind: "prose",
      heading: "Three query types",
      body: [
        "The words *recursive* and *iterative* describe **what the asker expects back**, not different protocols. A single lookup normally contains both.",
        "**Recursive** — \"go and find the real answer.\" The server must return the finished result or an error. Your device only ever does this.",
        "**Iterative** — \"tell me the best you have.\" Usually a referral to a server closer to the answer. The asker keeps the work. Root and TLD servers deliberately answer only iteratively; if they did recursive work for everyone, a handful of machines would have to serve the entire internet.",
        "**Non-recursive** — the server already knows, from cache or because it is authoritative for that zone. No other server is contacted. This is by far the most common case in production."
      ]
    },
    {
      kind: "dns-query-types-diagram"
    },
    {
      kind: "prose",
      heading: "Records: what a domain is actually made of",
      body: [
        "A **DNS record** is one instruction stored on an authoritative nameserver. Together they form the **zone file** — a plain-text description of everything a domain does. Every managed DNS console you have ever used (Route 53, Cloudflare, Azure DNS) is a form that edits these lines.",
        "Every record carries a **TTL**: how long anyone else is allowed to cache it. Pick the type by what you are pointing at — an address, another name, a mail server, a service, or a piece of text."
      ]
    },
    {
      kind: "dns-record-explorer"
    },
    {
      kind: "table",
      caption: "Common record types",
      headers: ["Record", "Purpose", "Typical use"],
      rows: [
        ["**A**", "Maps a name to an IPv4 address", "`example.com → 93.184.216.34`"],
        ["**AAAA**", "Maps a name to an IPv6 address", "Dual-stack hosts; queried in parallel with A"],
        ["**CNAME**", "Points one name at another name", "`blog → hosting.netlify.app` — cannot sit on the bare domain"],
        ["**MX**", "Names the mail servers for the domain", "Lowest preference number wins; must point at a hostname"],
        ["**TXT**", "Arbitrary text on a name", "SPF, DKIM, DMARC, domain-ownership proofs"],
        ["**NS**", "Declares the authoritative servers for a zone", "The record that performs delegation"],
        ["**SOA**", "Zone admin data, serial, and timers", "One per zone; last field is the negative-caching TTL"],
        ["**SRV**", "Locates a service, including its port", "SIP, XMPP, LDAP, Kubernetes service discovery"],
        ["**PTR**", "Maps an IP back to a name (reverse DNS)", "Lives in `in-addr.arpa`; checked by mail servers"],
        ["**CERT**", "Publishes a certificate in DNS", "Rare; TLSA and CAA are the relatives you will meet"]
      ]
    },
    {
      kind: "callout",
      tone: "warn",
      title: "The CNAME trap that catches nearly everyone once",
      body:
        "A CNAME cannot coexist with any other record on the same name. Your bare domain (`example.com`) must already have SOA and NS records — so it **cannot** have a CNAME. This is why pointing a naked domain at a CDN or SaaS host fails, and why providers invented non-standard `ALIAS` / `ANAME` records that behave like a CNAME at the apex but resolve server-side and return an A record."
    },
    {
      kind: "prose",
      heading: "Reverse DNS",
      body: [
        "A reverse lookup goes the other way: IP address to name. It uses **PTR** records published in a special zone — `93.184.216.34` becomes a query for `34.216.184.93.in-addr.arpa` (the octets reversed, because names are read most-specific-first).",
        "It is not needed to browse the web. It matters in exactly two places. **Mail servers** check that a sending IP has a PTR record and that the name it returns resolves back to the same IP; a mismatch is a strong spam signal. And **logs and traceroutes** use it to turn raw addresses into readable hostnames.",
        "One practical note: only the owner of the IP block can set a PTR record. That is your hosting or cloud provider, not your DNS provider — so this is one record you usually cannot fix yourself."
      ]
    },
    {
      kind: "prose",
      heading: "Caching: the part that makes DNS work at all",
      body: [
        "A full recursive walk costs three round trips to servers scattered around the world. If every page load did that, the web would feel broken and the root servers would have melted decades ago.",
        "They have not, because **a DNS answer is cached at four independent layers** before it reaches your application: the browser, the operating system stub resolver, the local router, and the recursive resolver. A query only travels as far as the first layer that still holds a valid copy.",
        "Each layer honours the **TTL** that came with the record — the number of seconds it is allowed to keep the answer. When the TTL expires, the entry is purged and the next request re-queries."
      ]
    },
    {
      kind: "dns-cache-journey"
    },
    {
      kind: "prose",
      heading: "What TTL actually buys and costs",
      body: [
        "TTL is the only control you have over caches you do not own, and it is a genuine tradeoff.",
        "**A short TTL** (30–60s) means changes take effect almost immediately, which is what you want during a migration or a failover. It also means far more traffic to your authoritative nameservers, and it makes you more fragile: if your nameservers become unreachable, cached copies expire quickly and users start failing.",
        "**A long TTL** (hours to a day) means fewer queries, lower cost, and real resilience — clients keep working from cache even while your nameservers are down. The price is that a mistake, or a needed failover, can take a full TTL to reach everybody.",
        "The standard playbook before a planned migration: **drop the TTL to 60 seconds about a day in advance**, wait for the old long-TTL entries to age out, cut over, confirm, then raise the TTL back up.",
        "This is also the honest explanation of \"DNS propagation.\" Nothing propagates. There is no push, no broadcast, no sync. You are simply waiting for other people's caches to expire on their own schedule."
      ]
    },
    {
      kind: "callout",
      tone: "success",
      title: "Flushing your own caches",
      body:
        "When a change looks like it has not taken effect, clear the layers you control before blaming anyone. Chrome keeps its own cache at `chrome://net-internals/#dns` → *Clear host cache*. On Windows: `ipconfig /flushdns`. On macOS: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`. On Linux with systemd: `resolvectl flush-caches`. Then verify against the authority directly with `dig @ns1.yourprovider.net example.com` — that bypasses every cache in between and tells you what is actually configured."
    },
    {
      kind: "prose",
      heading: "Where DNS bites you in production",
      body: [
        "**It is a single point of failure with excellent uptime, which is the dangerous combination.** DNS works so reliably that teams forget it is in the request path. The 2016 Dyn outage took down Twitter, Spotify, GitHub and Reddit — none of which had failed. Their DNS provider had. Use two independent DNS providers for anything critical.",
        "**Cache poisoning.** If an attacker can get a forged answer accepted, they redirect your users to their server. **DNSSEC** cryptographically signs records so a resolver can verify the answer really came from the zone's owner. It does not encrypt anything — that is what DoT and DoH are for.",
        "**Amplification attacks.** A small spoofed query can produce a large reply aimed at a victim. Response rate limiting and refusing to run open resolvers are the defences.",
        "**Round-robin DNS is not load balancing.** Multiple A records on one name spread traffic, but DNS has no health checking: a dead server keeps being handed out until the record is removed and every cached copy expires. Real load balancing happens behind a single address.",
        "**Protect the account, not just the zone.** Whoever controls your registrar account controls where every user of your domain is sent. Enforce MFA, use registrar lock, and restrict who can edit records.",
        "**Do not forget the lookup in your timeouts.** DNS resolution is a distinct stage of an HTTP request with its own failure mode. A client with no DNS timeout can hang indefinitely on a resolver that has stopped answering."
      ]
    },
    {
      kind: "table",
      caption: "Managed DNS providers you will meet",
      headers: ["Provider", "Why teams pick it"],
      rows: [
        ["**Route 53** (AWS)", "Deep AWS integration, health checks, latency and geolocation routing policies"],
        ["**Cloudflare DNS**", "Very fast anycast network, DDoS protection, free DNSSEC"],
        ["**Google Cloud DNS**", "Simple, scalable, priced per query and zone"],
        ["**Azure DNS**", "Native integration with Azure identity and resources"],
        ["**NS1**", "Programmable traffic steering and data-driven routing"]
      ]
    },
    {
      kind: "takeaways",
      items: [
        "DNS translates names to IP addresses and then gets out of the way — it never fetches your content.",
        "Four roles, not one server: the **resolver** does the walking, the **root** and **TLD** servers only hand out referrals, and the **authoritative nameserver** is the single source of truth for a domain.",
        "The namespace is a tree read right to left, and each level is delegated to a different party. That delegation is why DNS scales without a central database.",
        "**Recursive** means \"find me the answer,\" **iterative** means \"tell me who to ask next,\" and **non-recursive** means \"I already know.\" One lookup normally uses all three.",
        "Records live in a zone file on the authoritative server. A points at IPv4, AAAA at IPv6, CNAME at another name, MX at mail servers, NS at nameservers, PTR back at a name.",
        "Caching at four layers — browser, OS, router, resolver — is what keeps DNS fast, and **TTL is your only lever over caches you do not own**.",
        "\"Propagation\" is not a push; it is waiting for other people's TTLs to expire. Lower the TTL a day before a planned migration.",
        "Treat DNS as production infrastructure: redundant providers, DNSSEC, MFA on the registrar account, and an explicit resolution timeout in every client."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "dns-root-role",
          question: "A recursive resolver queries a root server for `blog.example.com`. What does the root server return?",
          options: [
            "The IP address of blog.example.com",
            "The addresses of the authoritative nameservers for example.com",
            "A referral to the nameservers for the .com TLD",
            "NXDOMAIN, because root servers only handle bare domains"
          ],
          correctIndex: 2,
          explanation:
            "Root servers store no website addresses. They know which servers run each top-level domain, so they answer with a referral to the .com TLD nameservers. The resolver then has to ask again, one level deeper."
        },
        {
          id: "dns-who-walks",
          question: "In a normal lookup from a laptop, which machine actually contacts the root, TLD, and authoritative servers?",
          options: [
            "The laptop's operating system, one server at a time",
            "The recursive resolver, on the client's behalf",
            "The authoritative nameserver, which forwards upward",
            "The browser, using parallel HTTPS requests"
          ],
          correctIndex: 1,
          explanation:
            "The client is a stub resolver: it sends exactly one recursive query and waits. The recursive resolver does all the iterative walking and returns a single finished answer."
        },
        {
          id: "dns-cname-apex",
          question: "Why can't you put a CNAME record on a bare domain like `example.com`?",
          options: [
            "CNAMEs are only valid for subdomains by registrar policy",
            "A CNAME cannot coexist with other records, and the apex already needs SOA and NS records",
            "Bare domains must always resolve to an IPv4 address",
            "CNAMEs would break the TTL inherited from the TLD server"
          ],
          correctIndex: 1,
          explanation:
            "A CNAME must be the only record on its name. The zone apex is required to carry SOA and NS records, so a CNAME there is illegal. Providers work around this with non-standard ALIAS/ANAME records that resolve server-side."
        },
        {
          id: "dns-ttl-tradeoff",
          question: "You are migrating a service to a new IP tomorrow. What should you do to the record's TTL?",
          options: [
            "Raise it to 24 hours so caches stay stable during the cutover",
            "Lower it to about 60 seconds a day before the migration",
            "Leave it alone; TTL only affects the authoritative server",
            "Set it to 0 during the migration to disable caching entirely"
          ],
          correctIndex: 1,
          explanation:
            "Lower it well ahead of time so the old long-TTL entries age out of everyone's caches before you cut over. Then the change itself is visible within about a minute, and you can raise the TTL again once you have confirmed the migration."
        },
        {
          id: "dns-propagation",
          question: "Which statement about \"DNS propagation\" is accurate?",
          options: [
            "Authoritative servers push updates to all resolvers worldwide",
            "Root servers broadcast the change down through the TLD servers",
            "Nothing is pushed; you are waiting for existing cached entries to hit their TTL and expire",
            "Registrars replicate changes to resolvers on a fixed 48-hour schedule"
          ],
          correctIndex: 2,
          explanation:
            "There is no push mechanism in DNS. Your authoritative servers are updated instantly; everyone else keeps serving their cached copy until its TTL runs out and they re-query."
        },
        {
          id: "dns-ptr",
          question: "A mail server rejects your outgoing mail as likely spam, citing reverse DNS. Which record is missing or wrong?",
          options: ["MX", "TXT (SPF)", "PTR", "NS"],
          correctIndex: 2,
          explanation:
            "Reverse DNS uses PTR records in the in-addr.arpa zone to map an IP back to a name. Receiving mail servers check that the sending IP has a PTR record that resolves back to the same IP. Note that only the owner of the IP block — your hosting provider — can set it."
        },
        {
          id: "dns-nxdomain",
          question: "Which server is entitled to authoritatively state that a name does not exist (NXDOMAIN)?",
          options: [
            "Any recursive resolver that fails to find it",
            "The root server for that TLD's branch",
            "The authoritative nameserver for the zone",
            "The registrar that sold the domain"
          ],
          correctIndex: 2,
          explanation:
            "Only the authoritative nameserver holds the complete zone, so only it can say with authority that a name is absent. How long resolvers remember that negative answer is controlled by the last field of the SOA record."
        },
        {
          id: "dns-udp",
          question: "DNS queries normally travel over UDP port 53. What is the main consequence of that choice?",
          options: [
            "Lookups are fast with no handshake, but responses can be spoofed and abused for amplification",
            "Every lookup is encrypted end to end by default",
            "Answers are guaranteed to arrive in order, like TCP",
            "Only one query can be in flight per client at a time"
          ],
          correctIndex: 0,
          explanation:
            "One packet out, one packet back, no connection setup — that is why DNS is fast. It also means an attacker can forge replies or use small spoofed queries to generate large ones aimed at a victim. DNSSEC addresses forgery; DoT and DoH add encryption."
        }
      ]
    }
  ]
};

export const FOUNDATIONS_TOPICS: Record<string, FoundationTopicMeta> = {
  "getting-started": {
    slug: "getting-started",
    title: "Getting Started",
    category: "Fundamentals",
    iconKey: "layers",
    blurb:
      "Introduction to system design, core terminology, and the step-by-step interview delivery framework.",
    lessons: [whatIsSystemDesign, deliveryFramework, functionalVsNonFunctional, backOfTheEnvelope, estimationCheatSheet],
  },
  "networking-protocols": {
    slug: "networking-protocols",
    title: "Networking & Protocols",
    category: "Fundamentals",
    iconKey: "layers",
    blurb: "Understand how data travels across the web.",
    lessons: [ipLesson, portsLesson, subnetsCidrLesson, osiModelLesson, tcpUdpLesson, httpHttpsLesson, dnsLesson],
  }
};
