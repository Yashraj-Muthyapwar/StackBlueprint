import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Server,
  Activity,
  Globe,
  Database,
  Layers,
  Share2,
  Cpu,
  Shield,
  Monitor,
  LockKeyhole,
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
  ShieldCheck,
  Gauge,
  Car,
  Clapperboard,
  Landmark,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";
import { FUNDAMENTALS_TOPICS } from "@/lessons/system-design/fundamentals-content";
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

/**
 * Choose how many module chips a card previews before collapsing to "+N more".
 *
 * A fixed count is the wrong unit: five long labels wrap to three rows and make
 * the card tall, while five short ones leave it looking empty. Budgeting by
 * total label length instead lands every card on roughly two rows of chips, so
 * a topic with 11 modules is no taller than one with 5.
 */
const CHIP_CHAR_BUDGET = 110;
const MIN_PREVIEW_MODULES = 3;
const MAX_PREVIEW_MODULES = 6;

function previewModules(modules: string[]) {
  const shown: string[] = [];
  let used = 0;
  for (const m of modules) {
    if (shown.length >= MAX_PREVIEW_MODULES) break;
    if (shown.length >= MIN_PREVIEW_MODULES && used + m.length > CHIP_CHAR_BUDGET) break;
    shown.push(m);
    used += m.length;
  }
  return { shown, hidden: modules.length - shown.length };
}

const sections: Section[] = [
  {
    group: "System Design Fundamentals",
    groupBlurb:
      "The fundamental building blocks of how systems communicate over the internet and how we measure them.",
    topics: [
      {
        slug: "getting-started",
        title: "Getting Started",
        blurb: "Introduction to system design and the interview delivery framework.",
        icon: PlayCircle,
        modules: ["What is System Design?", "Delivery Framework"],
        unlocked: true,
        routeBase: "fundamentals",
      },
      {
        slug: "networking-protocols",
        title: "Networking & Protocols",
        blurb: "Understand how data travels across the web.",
        icon: Globe,
        modules: [
          "OSI Model",
          "TCP and UDP",
          "IP",
          "Domain Name System (DNS)",
          "DNS Caching",
          "Proxy",
        ],
        unlocked: true,
        routeBase: "fundamentals",
      },
      {
        slug: "core-metrics",
        title: "Core Concepts & Metrics",
        blurb: "Measuring the performance and reliability of a system.",
        icon: Activity,
        modules: [
          "Availability & Scalability",
          "Throughput and Latency",
          "Redundancy & Maintainability",
          "SLA, SLO, SLI",
        ],
        unlocked: false,
        routeBase: "fundamentals",
      },
    ],
  },
  {
    group: "Data & Storage",
    groupBlurb: "Techniques for storing, caching, and scaling data to handle millions of users.",
    topics: [
      {
        slug: "databases",
        title: "Databases & DBMS",
        blurb: "Choosing the right storage for your data.",
        icon: Database,
        modules: ["SQL vs NoSQL", "OLAP vs OLTP", "ACID vs BASE", "Transactions", "Indexes"],
        unlocked: false,
        routeBase: "data-storage",
      },
      {
        slug: "scaling-data",
        title: "Scaling Data",
        blurb: "Distributing data across multiple nodes.",
        icon: Share2,
        modules: [
          "Database Replication",
          "Data Partitioning",
          "Database Sharding",
          "Consistent Hashing",
          "Database Federation",
        ],
        unlocked: false,
        routeBase: "data-storage",
      },
      {
        slug: "caching",
        title: "Caching & Content Delivery",
        blurb: "Reducing latency and improving performance.",
        icon: Layers,
        modules: ["Caching Strategies", "Content Delivery Network (CDN)", "Redis Usecase"],
        unlocked: false,
        routeBase: "data-storage",
      },
      {
        slug: "data-structures",
        title: "Advanced Data Structures",
        blurb: "Specialized structures for distributed systems.",
        icon: FileCode,
        modules: ["Bloom Filter", "Quad Tree", "Geohashing"],
        unlocked: false,
        routeBase: "data-storage",
      },
    ],
  },
  {
    group: "Architecture & Communication",
    groupBlurb: "High-level architectural patterns, APIs, and real-time messaging.",
    topics: [
      {
        slug: "architectural-styles",
        title: "Architectural Styles",
        blurb: "Breaking down monoliths into manageable services.",
        icon: Layout,
        modules: [
          "Monoliths vs Microservices",
          "N-tier Architecture",
          "Event-Driven Architecture (EDA)",
          "Serverless Architecture",
        ],
        unlocked: false,
        routeBase: "architecture",
      },
      {
        slug: "apis-security",
        title: "APIs & Security",
        blurb: "How different services exchange data securely.",
        icon: Key,
        modules: [
          "REST Deep Dive",
          "GraphQL Deep Dive",
          "gRPC Deep Dive",
          "API Gateway",
          "Session vs Token Auth",
          "OAuth2 & JWT",
        ],
        unlocked: false,
        routeBase: "architecture",
      },
      {
        slug: "communication-patterns",
        title: "Communication Patterns",
        blurb: "Sync vs Async, queues, and real-time streams.",
        icon: MessageSquare,
        modules: [
          "WebSockets & Long Polling",
          "Message Queues",
          "Message Brokers",
          "Publish-Subscribe",
          "CDC & Event Sourcing",
        ],
        unlocked: false,
        routeBase: "architecture",
      },
    ],
  },
  {
    group: "Tradeoffs & System Resilience",
    groupBlurb: "Navigating engineering tradeoffs and operational resilience.",
    topics: [
      {
        slug: "system-tradeoffs",
        title: "System Tradeoffs",
        blurb: "The art of balancing competing constraints.",
        icon: Scale,
        modules: [
          "CAP & PACELC Theorems",
          "Strong vs Eventual Consistency",
          "Vertical vs Horizontal Scaling",
          "Push vs Pull Architecture",
        ],
        unlocked: false,
        routeBase: "resilience",
      },
      {
        slug: "resilience-security",
        title: "Resilience & Security",
        blurb: "Designing systems that survive failure.",
        icon: Shield,
        modules: [
          "Circuit Breaker",
          "Disaster Recovery",
          "Chaos Engineering",
          "SSL, TLS, mTLS",
          "Zero Trust Architecture",
        ],
        unlocked: false,
        routeBase: "resilience",
      },
    ],
  },
  {
    group: "Big Data & Data Engineering",
    groupBlurb:
      "From bytes on disk to governed, production data platforms. Storage internals, distributed compute, streaming, modeling, and the operational discipline that keeps it all trustworthy.",
    topics: [
      {
        slug: "storage-internals",
        title: "Data Storage Internals",
        blurb: "How analytical data is actually laid out on disk, and why it makes queries fast.",
        icon: Columns3,
        modules: [
          "Row vs Columnar Layouts",
          "Parquet Internals",
          "ORC & Avro",
          "Schema Evolution",
          "Compression & Encoding (Dictionary, RLE)",
          "Predicate Pushdown & Column Pruning",
          "Open Table Formats: Iceberg, Delta, Hudi",
          "ACID on Object Storage",
          "Partitioning, Clustering & Z-Ordering",
          "Small File Problem & Compaction",
        ],
        unlocked: false,
        routeBase: "data-engineering",
      },
      {
        slug: "batch-processing",
        title: "Batch Processing at Scale",
        blurb: "Processing large, bounded datasets across a cluster.",
        icon: HardDrive,
        modules: [
          "Hadoop & HDFS",
          "MapReduce Internals",
          "Shuffle & Sort",
          "YARN vs Kubernetes",
          "Resource Management",
          "Job Scheduling & Backfills",
        ],
        unlocked: false,
        routeBase: "data-engineering",
      },
      {
        slug: "spark-deep-dive",
        title: "Deep Dive: Apache Spark",
        blurb: "Inside the engine — from logical plan to physical execution and tuning.",
        icon: Flame,
        modules: [
          "Driver & Executors",
          "RDD vs DataFrame vs Dataset",
          "Lazy Evaluation & DAGs",
          "Catalyst Optimizer",
          "Tungsten & Whole-Stage Codegen",
          "Adaptive Query Execution (AQE)",
          "Joins: Broadcast, Sort-Merge, Bucketed",
          "Shuffle, Skew & Spill",
          "Caching & Persistence",
          "Performance Tuning & Cost Control",
        ],
        unlocked: false,
        routeBase: "data-engineering",
      },
      {
        slug: "stream-processing",
        title: "Stream Processing & Ingestion",
        blurb: "Unbounded data: Kafka, Flink, and event-driven system design.",
        icon: Zap,
        modules: [
          "Kafka Internals",
          "Consumer Groups & Rebalancing",
          "Exactly-Once Semantics",
          "Schema Registry & Contracts",
          "Kafka Connect & CDC (Debezium)",
          "Apache Flink Architecture",
          "Event Time vs Processing Time",
          "Windowing, Watermarks & Late Data",
          "Stateful Processing & Checkpointing",
          "Backpressure & Consumer Lag",
          "Lambda vs Kappa Architecture",
        ],
        unlocked: false,
        routeBase: "data-engineering",
      },
      {
        slug: "data-pipelines",
        title: "Pipelines & Orchestration",
        blurb: "Turning scripts into reliable, observable, re-runnable production workflows.",
        icon: Workflow,
        modules: [
          "Airflow & DAGs",
          "Dagster & Prefect",
          "ETL vs ELT",
          "dbt & Transformations",
          "Idempotency & Safe Reruns",
          "Incremental Processing & Watermarks",
          "Backfills & Late-Arriving Data",
          "Retries, SLAs & Alerting",
        ],
        unlocked: false,
        routeBase: "data-engineering",
      },
      {
        slug: "data-modeling",
        title: "Enterprise Data Modeling",
        blurb: "Designing schemas that survive a decade of changing business questions.",
        icon: Boxes,
        modules: [
          "Dimensional Modeling",
          "Facts, Dimensions & Grain",
          "Slowly Changing Dimensions",
          "Star vs Snowflake Schema",
          "Inmon vs Kimball",
          "Data Vault 2.0: Hubs, Links & Satellites",
          "Lakehouse & Medallion Architecture",
          "Wide Tables & One Big Table",
          "Semantic Layers & Metric Definitions",
        ],
        unlocked: false,
        routeBase: "data-engineering",
      },
      {
        slug: "data-storage-analytics",
        title: "Warehouses, Lakes & Lakehouses",
        blurb: "Centralized analytical platforms and the engines that query them.",
        icon: Warehouse,
        modules: [
          "Warehouse vs Lake vs Lakehouse",
          "MPP Architectures",
          "Storage & Compute Separation",
          "Query Engines: Trino & DuckDB",
          "Micro-partitions & Pruning",
          "Materialized Views & Result Caching",
          "Workload Isolation & Concurrency",
          "Cost Modeling & FinOps",
        ],
        unlocked: false,
        routeBase: "data-engineering",
      },
      {
        slug: "data-governance-quality",
        title: "Governance, Security & Quality",
        blurb: "The discipline that makes a data platform trustworthy enough to act on.",
        icon: ShieldCheck,
        modules: [
          "Data Contracts",
          "Data Quality Testing",
          "Observability & Freshness SLAs",
          "Catalogs & Metadata",
          "Column-Level Lineage & Impact Analysis",
          "PII Classification & Masking",
          "Row & Column-Level Security",
          "RBAC, ABAC & Access Policies",
          "GDPR, CCPA & Right to Erasure",
          "Audit Logging & Compliance",
        ],
        unlocked: false,
        routeBase: "data-engineering",
      },
      {
        slug: "realtime-serving",
        title: "Real-Time Analytics & Serving",
        blurb: "Sub-second queries and feature delivery for applications and models.",
        icon: Gauge,
        modules: [
          "OLAP Engines: Druid & Pinot",
          "Pre-aggregation & Rollups",
          "Offline vs Online Feature Stores",
          "Point-in-Time Correctness",
          "Vector Databases & Embeddings",
          "Reverse ETL & Operational Analytics",
          "Serving Latency & Freshness Tradeoffs",
        ],
        unlocked: false,
        routeBase: "data-engineering",
      },
    ],
  },
  {
    group: "Case Studies (Capstone)",
    groupBlurb: "Design real-world applications end-to-end.",
    topics: [
      {
        slug: "case-studies",
        title: "System Design Interviews",
        blurb: "Applying concepts to tackle real-world system designs.",
        icon: Monitor,
        modules: [
          "URL Shortener",
          "WhatsApp",
          "Twitter",
          "Netflix",
          "Uber",
          "YouTube",
          "Payment System",
        ],
        unlocked: false,
        routeBase: "case-studies",
      },
      {
        slug: "case-uber-realtime-matching",
        title: "Uber: Matching & Surge Pricing",
        blurb:
          "Millions of moving GPS points, matched in milliseconds, priced by live supply and demand.",
        icon: Car,
        modules: [
          "Requirements & Scale",
          "High-Volume Location Ingestion",
          "Geospatial Indexing (H3, S2)",
          "Proximity Search & Matching",
          "Real-Time Supply/Demand Aggregation",
          "Surge Pricing Engine",
          "Hot Partitions & Geographic Skew",
          "Exactly-Once Trip State Transitions",
          "Streaming vs Batch Reconciliation",
          "Failure Modes & Degraded Matching",
        ],
        unlocked: false,
        routeBase: "case-studies",
      },
      {
        slug: "case-netflix-feature-store",
        title: "Netflix: Feature Store Pipeline",
        blurb: "Clickstream to model input: the pipeline behind a personalized homepage.",
        icon: Clapperboard,
        modules: [
          "Requirements & Scale",
          "Clickstream Event Ingestion",
          "Feature Engineering Pipelines",
          "Offline vs Online Feature Store",
          "Point-in-Time Correctness",
          "Training/Serving Skew",
          "Backfills & Historical Reprocessing",
          "Model Serving & A/B Experimentation",
          "Cold Start & Sparse Users",
          "Data Quality Gates Before Training",
        ],
        unlocked: false,
        routeBase: "case-studies",
      },
      {
        slug: "case-banking-fraud-aml",
        title: "Banking: Fraud Detection & AML",
        blurb:
          "Sub-second scoring on every transaction, with an audit trail a regulator will accept.",
        icon: Landmark,
        modules: [
          "Requirements & Latency Budget",
          "Sub-Second Scoring Pipeline",
          "Streaming Feature Aggregation",
          "Rules Engine + ML Scoring",
          "Sanctions & Watchlist Screening",
          "Graph Analysis for Money Laundering Rings",
          "Late & Out-of-Order Event Handling",
          "Case Management & Alert Triage",
          "Immutable Audit Trail & Lineage",
          "Regulatory Reporting (SAR / CTR)",
          "Model Governance & Explainability",
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

                  const realTopic = FUNDAMENTALS_TOPICS[t.slug as keyof typeof FUNDAMENTALS_TOPICS];
                  const completedCount = realTopic
                    ? realTopic.lessons.filter((l) => isCompleted(l.slug)).length
                    : t.completedCount || 0;
                  const totalCount = realTopic ? realTopic.lessons.length : t.modules.length;

                  // Preview a few modules only. The full list belongs on the
                  // topic page; showing all 11 here is what made cards ragged.
                  const { shown, hidden } = previewModules(t.modules);

                  const card = (
                    <div
                      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border border-hairline transition-all duration-300 sm:flex-row ${
                        isLocked
                          ? "bg-card/20 opacity-80 grayscale"
                          : "bg-card hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-background/20"
                      }`}
                    >
                      <div className="flex shrink-0 items-center justify-center border-b border-hairline bg-background/50 p-6 sm:w-40 sm:border-b-0 sm:border-r">
                        <Icon
                          className={`size-10 ${isLocked ? "text-muted-foreground" : "text-mint"}`}
                          strokeWidth={1.5}
                        />
                      </div>

                      <div className="flex flex-1 flex-col p-6 sm:p-8">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-xl font-semibold tracking-tight text-foreground">
                            {t.title}
                          </h3>
                          {isLocked && (
                            <LockKeyhole className="size-5 shrink-0 text-muted-foreground" />
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {t.blurb}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2 pr-12">
                          {shown.map((m) => (
                            <span
                              key={m}
                              className="rounded-md bg-background px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-hairline"
                            >
                              {m}
                            </span>
                          ))}
                          {hidden > 0 && (
                            <span className="rounded-md px-1.5 py-1 text-xs font-semibold text-muted-foreground">
                              +{hidden} more
                            </span>
                          )}
                        </div>

                        <div className="mt-6 flex items-center gap-2">
                          {isLocked ? (
                            <span className="text-xs font-medium text-muted-foreground">
                              {totalCount} {totalCount === 1 ? "lesson" : "lessons"} · Coming soon
                            </span>
                          ) : (
                            <>
                              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-border">
                                <div
                                  className="h-full bg-mint transition-all duration-500 ease-out"
                                  style={{
                                    width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs font-medium text-muted-foreground">
                                {completedCount}/{totalCount} lessons complete
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {!isLocked && (
                        <div className="absolute bottom-6 right-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-sm:hidden">
                          <div className="grid size-8 place-items-center rounded-full bg-mint/10 text-mint">
                            <ArrowRight className="size-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  );

                  if (isLocked) {
                    return <div key={t.slug}>{card}</div>;
                  }

                  const toPath = t.to || `/system-design/${t.routeBase}/${t.slug}`;
                  return (
                    <Link key={t.slug} to={toPath} className="block w-full outline-none">
                      {card}
                    </Link>
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
