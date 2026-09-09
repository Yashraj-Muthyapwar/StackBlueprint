import { createFileRoute } from "@tanstack/react-router";
import {
  Server,
  Activity,
  Globe,
  Database,
  Layers,
  Share2,
  Cpu,
  Shield,
  Monitor,
  Scale,
  Zap,
  MessageSquare,
  Key,
  HardDrive,
  Layout,
  PlayCircle,
  FileCode,
  Columns3,
  Flame,
  Workflow,
  Boxes,
  Warehouse,
  Gauge,
  Landmark,
  Network,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";
import { TrackCard } from "@/components/learning-paths/TrackCard";
import { FUNDAMENTALS_TOPICS } from "@/lessons/system-design/fundamentals-content";
import { DISTRIBUTED_SYSTEMS_TOPICS } from "@/lessons/system-design/distributed-systems-content";
import systemDesignLogo from "@/images/logos/system-design-logo.png";

export const Route = createFileRoute("/system-design/")({
  head: () => ({
    meta: [
      { title: "System Design — StackBlueprint" },
      {
        name: "description",
        content:
          "The complete system design roadmap: Networking, Databases, Architecture, and Case Studies.",
      },
      { property: "og:title", content: "System Design — StackBlueprint" },
      {
        property: "og:description",
        content:
          "Master system design from foundations to distributed systems and real-world case studies.",
      },
    ],
  }),
  component: SystemDesignIndex,
});

type Topic = {
  slug: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  modules: string[];
  unlocked?: boolean;
  routeBase?: string;
  to?: string;
  completedCount?: number;
};

type Section = {
  group: string;
  groupBlurb: string;
  topics: Topic[];
};

const sections: Section[] = [
  {
    group: "Phase 1 · Foundations",
    groupBlurb:
      "How an internet application fits together before the distributed-system complexity. Requirements, estimation, the core metrics, networking, APIs and caching.",
    topics: [
      {
        slug: "getting-started",
        title: "Getting Started",
        blurb: "What system design is and the framework for answering an interview question.",
        icon: PlayCircle,
        modules: [
          "What is System Design?",
          "Answering Framework",
          "Clarifying Requirements",
          "Back-of-the-Envelope Estimation",
        ],
        unlocked: true,
        routeBase: "fundamentals",
      },
      {
        slug: "core-metrics",
        title: "Core Concepts & Metrics",
        blurb: "Measuring performance and reliability, and why p50 and p99 tell different stories.",
        icon: Gauge,
        modules: [
          "Scalability",
          "Availability & Reliability",
          "Latency vs Throughput vs Bandwidth",
          "Fault Tolerance",
          "Percentiles (p50 / p99)",
        ],
        unlocked: false,
        routeBase: "fundamentals",
      },
      {
        slug: "networking-protocols",
        title: "Networking & Protocols",
        blurb: "How data travels across the web, from addressing up to application protocols.",
        icon: Globe,
        modules: [
          "IP Addressing",
          "Ports",
          "Subnets & CIDR",
          "OSI Model",
          "TCP & UDP",
          "HTTP & HTTPS",
          "DNS",
        ],
        unlocked: true,
        routeBase: "fundamentals",
      },
      {
        slug: "routing-load-balancing",
        title: "Routing & Load Balancing",
        blurb: "Getting a request from the browser to the right application server.",
        icon: Share2,
        modules: [
          "DNS Resolution",
          "Proxy vs Reverse Proxy",
          "Load Balancers",
          "Load Balancing Algorithms",
          "API Gateways",
        ],
        unlocked: false,
        routeBase: "fundamentals",
      },
      {
        slug: "apis-rate-limiting",
        title: "APIs & Rate Limiting",
        blurb: "Designing the contract between services, and protecting it from abuse.",
        icon: Key,
        modules: [
          "What is an API?",
          "REST API Design",
          "GraphQL",
          "gRPC",
          "Idempotency",
          "Rate Limiting: Token Bucket vs Fixed Window",
        ],
        unlocked: false,
        routeBase: "fundamentals",
      },
      {
        slug: "caching-cdn",
        title: "Caching & Content Delivery",
        blurb: "Reducing latency without serving stale or inconsistent data.",
        icon: Layers,
        modules: [
          "What is Caching?",
          "Cache-Aside Pattern",
          "Caching Strategies",
          "Cache Eviction Policies",
          "Cache Invalidation",
          "Distributed Caching",
          "Cache Stampede",
          "Content Delivery Networks (CDN)",
        ],
        unlocked: false,
        routeBase: "fundamentals",
      },
    ],
  },
  {
    group: "Phase 2 · Data, Scaling & Architecture",
    groupBlurb:
      "From web architecture to scalable data architecture. Storage internals, replication and sharding, consistency, security, messaging, and the architectural styles that tie services together.",
    topics: [
      {
        slug: "database-foundations",
        title: "Database Foundations",
        blurb: "Choosing the right data model for the workload.",
        icon: Database,
        modules: [
          "Database Types",
          "SQL vs NoSQL",
          "Relational Databases",
          "Document Databases",
          "Key-Value Stores",
        ],
        unlocked: false,
        routeBase: "data-storage",
      },
      {
        slug: "database-internals",
        title: "Database Internals",
        blurb: "How databases store, index and guarantee durability for your data.",
        icon: HardDrive,
        modules: [
          "Indexing",
          "B-Trees & B+ Trees",
          "LSM Trees",
          "Durability & Write-Ahead Logs",
          "ACID Transactions",
          "Isolation Levels & MVCC",
          "Connection Pooling",
          "Denormalization",
          "Materialized Views",
        ],
        unlocked: false,
        routeBase: "data-storage",
      },
      {
        slug: "replication-sharding",
        title: "Replication & Sharding",
        blurb: "Distributing data across nodes, and the consistency cost of doing so.",
        icon: Columns3,
        modules: [
          "Read Replicas",
          "Replication Lag",
          "Multi-Leader vs Leaderless",
          "Sharding",
          "Sharding vs Partitioning",
          "Consistent Hashing",
          "Secondary Indexes Across Shards",
        ],
        unlocked: false,
        routeBase: "data-storage",
      },
      {
        slug: "consistency-models",
        title: "Consistency Models",
        blurb: "What a system promises a client will see after a write.",
        icon: Scale,
        modules: [
          "Strong vs Eventual Consistency",
          "Read-Your-Writes & Monotonic Reads",
          "Quorums (R + W > N)",
          "Tunable Consistency",
          "Conflict Resolution",
        ],
        unlocked: false,
        routeBase: "data-storage",
      },
      {
        slug: "storage-systems",
        title: "Storage Systems",
        blurb: "Block, file and object storage, and how large uploads actually work.",
        icon: Boxes,
        modules: [
          "Block vs File vs Object Storage",
          "Object Storage",
          "Resumable & Large File Uploads",
        ],
        unlocked: false,
        routeBase: "data-storage",
      },
      {
        slug: "security-auth",
        title: "Security & Auth",
        blurb:
          "Who the caller is, what they can do, and keeping data private in transit and at rest.",
        icon: Shield,
        modules: [
          "Session vs Token Authentication",
          "OAuth2 & OpenID Connect",
          "JWT",
          "API Keys & HMAC Signing",
          "TLS, mTLS & Certificates",
          "Encryption at Rest",
          "Secrets Management",
        ],
        unlocked: false,
        routeBase: "architecture",
      },
      {
        slug: "communication-messaging",
        title: "Communication & Messaging",
        blurb: "Synchronous vs asynchronous, queues, streams and real-time transport.",
        icon: MessageSquare,
        modules: [
          "Sync vs Async Communication",
          "Message Queues",
          "Publish / Subscribe",
          "Delivery Semantics",
          "Dead Letter Queues",
          "Change Data Capture (CDC)",
          "Long Polling",
          "WebSockets",
          "Server-Sent Events (SSE)",
          "Webhooks",
        ],
        unlocked: false,
        routeBase: "architecture",
      },
      {
        slug: "architectural-styles",
        title: "Architectural Styles",
        blurb: "Monoliths, microservices, events, and patterns that contain failure.",
        icon: Layout,
        modules: [
          "Stateful vs Stateless",
          "Monolith vs Microservices",
          "Event-Driven Architecture",
          "CQRS",
          "Event Sourcing",
          "Circuit Breaker",
          "Bulkhead",
        ],
        unlocked: false,
        routeBase: "architecture",
      },
    ],
  },
  {
    group: "Phase 3 · Distributed & Data Systems",
    groupBlurb:
      "The hard phase. Network failures, clocks, consensus, distributed transactions, then batch and stream processing, data-engineering patterns and observability.",
    topics: [
      {
        slug: "distributed-systems",
        title: "Distributed Systems Fundamentals",
        blurb: "The failure modes that are impossible on a single machine.",
        icon: Network,
        modules: [
          "Challenges of Distribution",
          "Network Partitions",
          "CAP & PACELC",
          "Linearizability",
          "Split Brain & Heartbeats",
          "Handling Distributed Failures",
          "Retry Storms",
        ],
        unlocked: true,
        routeBase: "distributed-systems",
      },
      {
        slug: "time-consensus",
        title: "Time, Clocks & Consensus",
        blurb: "Ordering events and reaching agreement when nodes can't trust each other.",
        icon: Cpu,
        modules: [
          "Clock Synchronization",
          "Logical Clocks",
          "Lamport & Vector Clocks",
          "Consensus Algorithms",
          "Raft",
          "Leader Election",
          "Distributed Locks",
          "Gossip Protocol",
          "CRDTs",
        ],
        unlocked: false,
        routeBase: "distributed-systems",
      },
      {
        slug: "distributed-transactions",
        title: "Distributed Transactions",
        blurb: "Keeping data consistent across services without a single database.",
        icon: Workflow,
        modules: [
          "Distributed Transaction Problems",
          "Two-Phase Commit",
          "Saga Pattern",
          "Outbox Pattern",
        ],
        unlocked: false,
        routeBase: "distributed-systems",
      },
      {
        slug: "batch-streaming",
        title: "Batch, Streaming & Analytics",
        blurb: "Bounded vs unbounded data, and the platforms that process each.",
        icon: Zap,
        modules: [
          "Batch vs Stream Processing",
          "ETL Pipelines",
          "Data Lakes",
          "Data Warehousing",
          "Lakehouse Architecture",
          "Streaming Engines",
        ],
        unlocked: false,
        routeBase: "data-engineering",
      },
      {
        slug: "data-engineering-patterns",
        title: "Data Engineering Patterns",
        blurb: "Production patterns for ingestion, correctness and pipeline reliability.",
        icon: Warehouse,
        modules: [
          "Incremental Loader",
          "CDC Ingestion",
          "Dead Letter & Deduplication",
          "Late-Arriving Data",
          "Keyed Idempotency",
          "Transactional Writer",
          "Fan-in / Fan-out",
          "Orchestration",
          "Schema Compatibility",
          "Data Quality Gates",
          "Lineage",
        ],
        unlocked: false,
        routeBase: "data-engineering",
      },
      {
        slug: "observability",
        title: "Observability",
        blurb: "Knowing a system failed, and why, before your users tell you.",
        icon: Monitor,
        modules: [
          "Three Pillars of Observability",
          "Logging",
          "Metrics & Instrumentation",
          "Alerting",
          "Distributed Tracing",
        ],
        unlocked: false,
        routeBase: "data-engineering",
      },
    ],
  },
  {
    group: "Phase 4 · Interview Fluency",
    groupBlurb:
      "Converting knowledge into design judgment. Specialized structures, a small deep-dive technology set, recurring interview patterns, and the case-study gauntlet.",
    topics: [
      {
        slug: "probabilistic-spatial",
        title: "Probabilistic & Spatial Structures",
        blurb: "Approximate answers and geo queries at a fraction of the cost.",
        icon: FileCode,
        modules: [
          "Geohash",
          "Quad Trees",
          "Bloom Filters",
          "HyperLogLog",
          "Count-Min Sketch",
          "Unique ID Generation",
        ],
        unlocked: false,
        routeBase: "case-studies",
      },
      {
        slug: "deployment-delivery",
        title: "Deployment & Delivery",
        blurb: "Shipping risky changes without downtime.",
        icon: Activity,
        modules: [
          "Deployment Strategies",
          "Blue-Green Deployments",
          "Canary Releases",
          "CI/CD Pipelines",
          "Feature Flags",
          "Schema Migrations",
        ],
        unlocked: false,
        routeBase: "case-studies",
      },
      {
        slug: "technology-deep-dives",
        title: "Technology Deep Dives",
        blurb: "One relational DB, one cache, one log, one blob store, one search engine.",
        icon: Server,
        modules: ["PostgreSQL", "Redis", "Kafka", "Amazon S3", "Nginx", "Elasticsearch"],
        unlocked: false,
        routeBase: "case-studies",
      },
      {
        slug: "interview-patterns",
        title: "Recurring Interview Patterns",
        blurb: "The trade-offs that show up in almost every design question.",
        icon: Flame,
        modules: [
          "High Read Traffic",
          "High Write Traffic",
          "Handling Hot Keys",
          "Realtime Updates",
          "Fanout Pattern",
          "Traffic Spikes",
          "Handling Large Files",
          "Multi-Region Architecture",
          "Deduplicating Data",
        ],
        unlocked: false,
        routeBase: "case-studies",
      },
      {
        slug: "case-studies",
        title: "System Design Interviews",
        blurb:
          "End-to-end designs under interview conditions: 45-minute blind attempt, then compare.",
        icon: Landmark,
        modules: [
          "URL Shortener",
          "Rate Limiter",
          "WhatsApp",
          "Instagram",
          "YouTube",
          "Uber",
          "Search Autocomplete",
          "Distributed Cache",
          "Key-Value Store",
          "Notification Service",
          "Payment System",
          "Amazon",
          "Job Scheduler",
          "Monitoring & Alerting",
        ],
        unlocked: false,
        routeBase: "case-studies",
      },
    ],
  },
];

function SystemDesignIndex() {
  const { isCompleted } = useProgress();

  return (
    <div className="flex w-full flex-col font-sans">
      <div className="border-b border-hairline bg-card/30 px-6 py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <img
              src={systemDesignLogo}
              alt="System Design Logo"
              className="size-16 object-contain drop-shadow-sm lg:size-20"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            System Design
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Design systems that survive scale, failure, and traffic spikes. From foundational
            networking to distributed systems and real-world case studies.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:px-12 lg:py-20">
        <div className="flex flex-col gap-24">
          {sections.map((sec, i) => (
            <div key={sec.group} className="flex flex-col lg:flex-row lg:items-start lg:gap-16">
              <div className="mb-8 w-full shrink-0 lg:sticky lg:top-24 lg:mb-0 lg:w-64 xl:w-72">
                <div className="flex items-center gap-3">
                  <div className="grid size-6 place-items-center rounded-full bg-border text-xs font-bold text-foreground">
                    {i + 1}
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">{sec.group}</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {sec.groupBlurb}
                </p>
              </div>

              {/* Cards size to their content, matching the SQL roadmap. The
                  module preview cap below is what keeps them from diverging. */}
              <div className="flex w-full flex-col gap-4">
                {sec.topics.map((t) => {
                  const Icon = t.icon;
                  const isLocked = !t.unlocked;

                  const realTopic =
                    FUNDAMENTALS_TOPICS[t.slug as keyof typeof FUNDAMENTALS_TOPICS] ||
                    DISTRIBUTED_SYSTEMS_TOPICS[t.slug as keyof typeof DISTRIBUTED_SYSTEMS_TOPICS];
                  const completedCount = realTopic
                    ? realTopic.lessons.filter((l) => isCompleted(l.slug)).length
                    : t.completedCount || 0;
                  const totalCount = realTopic ? realTopic.lessons.length : t.modules.length;

                  return (
                    <TrackCard
                      key={t.slug}
                      title={t.title}
                      blurb={t.blurb}
                      icon={Icon}
                      isLocked={isLocked}
                      lessons={t.modules.map((m) => ({ slug: m, title: m }))}
                      completedCount={completedCount}
                      totalCount={totalCount}
                      href={t.to || `/system-design/${t.routeBase}/${t.slug}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
