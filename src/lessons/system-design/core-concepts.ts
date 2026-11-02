import { type LessonContent } from "@/lessons/types";
import scalabilityLoopImg from "@/images/system-design/Foundations/scalability-loop.png";
import scalabilityArchitectureImg from "@/images/system-design/Foundations/scalability-architecture.png";

/*
 * The lessons of the "Core Concepts & Metrics" module, in the order learners take them.
 * Each system design module has one lesson file named after it, and foundations-content.ts only
 * lists the module and imports these lessons.
 */

const latencyThroughputBandwidthLesson: LessonContent = {
  slug: "latency-throughput-bandwidth",
  title: "Latency vs Throughput vs Bandwidth",
  subtitle: "Three metrics that describe different parts of performance.",
  sections: [
    {
      kind: "prose",
      body: ["Three metrics describe different aspects of system performance."],
    },
    {
      kind: "table",
      caption: "The three metrics at a glance",
      headers: ["Metric", "Definition", "Common unit"],
      rows: [
        ["Latency", "The time it takes for a request to travel from the client to the server and back (end-to-end delay). Think of latency as the response time", "ms, seconds"],
        ["Throughput", "The number of requests a system can handle per unit time", "RPS, TPS, MB/s"],
        ["Bandwidth", "The maximum rate at which data can be transferred over a network", "Mbps, Gbps"],
      ],
    },
    { kind: "prose", body: ["**Interview-ready definitions:**"] },
    {
      kind: "list",
      items: [
        "**Latency** answers: **How long does one request take?**",
        "**Throughput** answers: **How much work is actually completed per second?**",
        "**Bandwidth** answers: **How much data can a connection carry per second?**",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Not interchangeable",
      body: "These terms are related, but they are not interchangeable.",
    },
    {
      kind: "prose",
      eyebrow: "1 · Why",
      heading: "Why do we need these measurements?",
      body: [
        "Imagine an online ticket booking platform.",
        "During normal hours, the application works well. But when tickets for a popular movie become available, thousands of customers start booking at once.",
        "Three problems can occur:",
      ],
    },
    {
      kind: "list",
      items: [
        "Customers wait too long for results: a **latency** problem.",
        "The service cannot complete enough bookings per second: a **throughput** problem.",
        "The network cannot transfer the required data fast enough: a **bandwidth** problem.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Find the limit first",
      body: "A system architect must determine which resource or operation limits performance before selecting a solution.",
    },
    {
      kind: "prose",
      eyebrow: "2 · Intuition",
      heading: "The highway analogy",
      body: ["Imagine a highway between two cities."],
    },
    {
      kind: "table",
      caption: "The highway and the computer system",
      headers: ["Highway", "Computer system"],
      rows: [
        ["Travel time for one car", "Latency"],
        ["Cars that reach the destination per hour", "Throughput"],
        ["Road capacity, represented partly by available lanes", "Bandwidth"],
      ],
    },
    {
      kind: "prose",
      body: [
        "Suppose you increase the number of highway lanes.",
        "The road can potentially handle more cars. But an individual car does not necessarily reach its destination faster because the distance and speed limit remain unchanged.",
        "Similarly, increasing network bandwidth does not automatically reduce the latency of a small API request.",
      ],
    },
    { kind: "highway-metrics" },
    {
      kind: "callout",
      tone: "info",
      title: "Memory rule",
      body: "Latency is travel time. Throughput is completed traffic. Bandwidth is available carrying capacity.",
    },
    {
      kind: "prose",
      eyebrow: "3 · How",
      heading: "How the metrics work",
      body: [
        "**A. Latency**",
        "Latency measures elapsed time for an operation.",
        "For an API request, end-to-end response time can include network communication, waiting, processing, and database work.",
        "**Example: One API request**",
      ],
    },
    {
      kind: "table",
      caption: "One API request, stage by stage",
      headers: ["Stage", "Time"],
      rows: [
        ["Network transfer", "30 ms"],
        ["Server processing", "40 ms"],
        ["Database query", "80 ms"],
        ["Return response", "30 ms"],
        ["Total response time", "180 ms"],
      ],
    },
    {
      kind: "prose",
      body: [
        "This simplified example assumes that the stages are sequential and their times do not overlap.",
        "The formula is:",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "Total latency",
      code: "**L_total = L_1 + L_2 + ... + L_n**",
    },
    {
      kind: "prose",
      body: [
        "For sequential steps, we add their elapsed times. In real systems, some operations can overlap.",
        "An application request can also include DNS lookup, TCP and TLS connection setup, database queries, and other service calls.",
        "In system design interviews, understanding these sources is usually more important than memorizing every low-level networking formula.",
        "**B. Throughput**",
        "Throughput measures the number of completed operations per unit time.",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "Throughput",
      code: "**Throughput = Completed requests / Elapsed time**",
    },
    {
      kind: "prose",
      body: [
        "A server that completes 6,000 requests in 10 seconds has a throughput of 600 requests per second.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Important",
      body: "A request that takes 200 ms does not mean the entire server can complete only five requests per second. A server can handle many requests concurrently.",
    },
    {
      kind: "prose",
      body: [
        "Throughput can also be measured using transactions per second (TPS) or data per second.",
        "Try it: each request below takes 200 ms. Change how many are handled at once.",
      ],
    },
    { kind: "throughput-concurrency" },
    {
      kind: "prose",
      body: [
        "**C. Bandwidth**",
        "Bandwidth measures the capacity of a communication channel to transfer data.",
        "For example:",
      ],
    },
    {
      kind: "list",
      items: [
        "100 Mbps means 100 megabits per second.",
        "1 Gbps means 1 gigabit per second.",
        "10 Gbps means 10 gigabits per second.",
      ],
    },
    {
      kind: "prose",
      body: [
        "A 1 Gbps network link has a nominal data rate of 1 billion bits per second. The application's useful data transfer rate is normally lower because of protocol overhead and other constraints.",
        "Bandwidth and throughput differ: bandwidth is a capacity limit, while observed network throughput is the data rate actually achieved.",
        "**D. How they relate**",
        "Three relationships are especially useful in system design.",
        "**1. Latency and concurrency**",
        "When requests overlap, throughput can increase without reducing individual request latency.",
        "**2. Bandwidth and payload size**",
        "Larger responses consume more network capacity. If the network is the bottleneck, reducing payload size can increase requests per second.",
        "**3. Little's Law**",
        "For a stable system:",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "Little's Law",
      code: "**N = λ × W**",
    },
    { kind: "prose", body: ["**Where:**"] },
    {
      kind: "list",
      items: [
        "**N** = average number of requests in the system.",
        "**λ** = average completed requests per second.",
        "**W** = average time each request spends in the system, in seconds.",
      ],
    },
    {
      kind: "prose",
      body: ["This helps estimate the number of requests simultaneously in progress."],
    },
    {
      kind: "prose",
      eyebrow: "4 · Example",
      heading: "A production API",
      body: ["Consider a product-search API."],
    },
    {
      kind: "table",
      caption: "The product-search API",
      headers: ["Measure", "Value"],
      rows: [
        ["Average latency", "200 ms"],
        ["Throughput", "1,000 RPS"],
        ["Network bandwidth", "1 Gbps"],
        ["Response payload", "50 KB"],
      ],
    },
    {
      kind: "prose",
      body: [
        "At 1,000 requests per second, each producing a 50 KB response, the application sends approximately 50 MB of response payload per second, or 400 Mbps, using decimal units.",
        "That is below the nominal 1 Gbps link rate. However, this calculation does not include all overhead or other traffic.",
        "Now consider the average number of requests in progress:",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "Little's Law applied",
      code: "**N = 1000 × 0.2 = 200**",
    },
    {
      kind: "prose",
      body: [
        "An average of 200 requests are in the system at once, assuming the measurements describe a stable system.",
        "This does not mean the system has exactly 200 active requests at every instant. It is a long-run average.",
        "Now change the numbers yourself. Raise the throughput or the payload size and watch the network load, then raise the latency and watch the requests in progress.",
      ],
    },
    { kind: "api-load-calculator" },
    {
      kind: "prose",
      eyebrow: "5 · Trade-offs",
      heading: "What engineers must consider",
      body: ["Improving one metric does not guarantee that the others improve."],
    },
    {
      kind: "table",
      caption: "Common decisions and their limits",
      headers: ["Decision", "Potential benefit", "Limitation"],
      rows: [
        ["Add more application servers", "Higher throughput", "Database may become the bottleneck"],
        [
          "Increase network bandwidth",
          "More data transfer capacity",
          "Does not fix slow CPU or database queries",
        ],
        ["Add caching", "Lower latency and less backend work", "Cache invalidation and stale data"],
        [
          "Batch requests",
          "Less overhead, potentially higher throughput",
          "Requests may wait longer",
        ],
        [
          "Increase concurrency",
          "Higher throughput until a bottleneck",
          "More queues, contention, and possible latency spikes",
        ],
      ],
    },
    {
      kind: "prose",
      body: [
        "**p95 and p99 latency**",
        "Average latency alone can hide slow requests.",
        "Suppose an application has these latency measurements:",
      ],
    },
    { kind: "percentile-bars" },
    {
      kind: "list",
      items: [
        "**p50 = 100 ms:** Approximately 50% of requests complete in 100 ms or less.",
        "**p95 = 350 ms:** Approximately 95% of requests complete in 350 ms or less.",
        "**p99 = 800 ms:** Approximately 99% of requests complete in 800 ms or less.",
      ],
    },
    {
      kind: "prose",
      body: [
        "Tail latency describes unusually slow requests near the high end of the latency distribution.",
        "Why does this matter? A web page might need responses from 20 different services. If the page must wait for every service, one slow response can delay the entire page.",
        "Percentiles help engineers understand slow user experiences. During high load, queues can grow and cause p95 or p99 latency to increase, even if average response times appear acceptable.",
      ],
    },
    {
      kind: "callout",
      tone: "success",
      title: "Interview takeaway",
      body: 'When an interviewer says, "Our application is slow," do not assume that the problem is bandwidth. Ask what is slow, how it is measured, whether the problem occurs at high load, and which resource is saturated.',
    },
    {
      kind: "prose",
      eyebrow: "6 · Practice",
      heading: "Demonstrate your understanding",
      body: ["Work each one out by hand before you check it."],
    },
    {
      kind: "pattern-exercises",
      exercises: [
        {
          type: "fields",
          label: "Practice A",
          title: "Requests in progress",
          prompt:
            "A video-metadata API completes 400 requests per second, and each request spends 0.25 seconds in the system. On average, how many requests are in progress at once?",
          fields: [{ label: "Requests (N)", answer: 100, tone: "accent" }],
          success: "Correct. Little's Law gives N = 400 x 0.25 = 100 requests.",
          hint: "Multiply the completed requests per second by the time each request spends in the system, in seconds.",
        },
        {
          type: "fields",
          label: "Practice B",
          title: "Network load",
          prompt:
            "Each response is 200 KB and the service sends 500 responses per second. Using decimal units, how many megabits per second does that need?",
          fields: [{ label: "Load (Mbps)", answer: 800, tone: "accent" }],
          success:
            "Correct. 500 x 200 KB = 100,000 KB/s = 100 MB/s, and 100 MB/s x 8 bits per byte = 800 Mbps.",
          hint: "Find the data per second first, then convert bytes to bits.",
        },
        {
          type: "choice",
          label: "Practice C",
          title: "Which metric first?",
          prompt:
            "Most users get fast pages, but a few complain that the app freezes. The average response time looks fine. Which measurement should you look at first?",
          options: [
            "p95 and p99 latency",
            "The bandwidth of the data center link",
            "Average throughput over the whole day",
            "The number of application servers",
          ],
          answer: 0,
          success:
            "Right. A few slow requests barely move the average, but they show up in the tail percentiles.",
          hint: "Which measurement is built to expose the slowest requests?",
        },
      ],
    },
    {
      kind: "prose",
      body: [
        "Now try one on the whiteboard, with all three metrics together. This is optional practice: the goals tick as you go, and a badge appears when you meet them all.",
      ],
    },
    { kind: "diagram-board", boardId: "throughput-bandwidth-load" },
    {
      kind: "takeaways",
      items: [
        "Latency is the time one operation takes. Throughput is the work completed per unit of time. Bandwidth is the maximum data a connection can carry per second.",
        "Adding bandwidth raises capacity but does not make a small request faster. Latency depends on distance, processing, and queues.",
        "A 200 ms request does not limit a server to five requests per second. Concurrent requests raise throughput without lowering latency.",
        "Throughput is what the system achieves, while bandwidth is a ceiling. Real network throughput stays below nominal bandwidth because of protocol overhead.",
        "Little's Law, N = λ × W, estimates the requests in progress: 1,000 RPS at 200 ms means about 200 at once.",
        "Averages hide slow requests. p95 and p99 show the tail, which grows when queues build under load.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "ltb-q1-latency",
          question: "Which metric measures the time needed to complete one API request?",
          options: ["Bandwidth", "Latency", "Throughput"],
          correctIndex: 1,
          explanation:
            "Latency is the time one operation takes. Throughput counts completed work per second, and bandwidth is the capacity of a connection.",
        },
        {
          id: "ltb-q2-throughput",
          question: "A server completes 9,000 requests in 30 seconds. What is its throughput?",
          options: ["30 RPS", "300 RPS", "9,000 RPS"],
          correctIndex: 1,
          explanation:
            "Throughput is completed requests divided by elapsed time: 9,000 / 30 = 300 requests per second.",
        },
        {
          id: "ltb-q3-upgrade",
          question:
            "A network upgrade increases link speed from 1 Gbps to 10 Gbps. Which statement is correct?",
          options: [
            "Every API request becomes 10 times faster.",
            "Network capacity increases, but API latency may remain unchanged.",
            "The application throughput is guaranteed to increase 10 times.",
          ],
          correctIndex: 1,
          explanation:
            "More bandwidth raises capacity. A small request is limited by distance, server work, and database time, so its latency can stay the same, and throughput rises only if the network was the bottleneck.",
        },
        {
          id: "ltb-q4-concurrency",
          question:
            "A service has 100 ms average latency and completes 500 RPS. Can it have multiple concurrent requests?",
          options: ["Yes", "No"],
          correctIndex: 0,
          explanation:
            "Yes. By Little's Law, 500 x 0.1 = 50 requests are in progress on average, so many requests overlap.",
        },
        {
          id: "ltb-q5-p99",
          question: "What does p99 latency represent?",
          options: [
            "The average response time",
            "A response-time threshold at or below which approximately 99% of requests fall",
            "The time spent transferring exactly 99 requests",
          ],
          correctIndex: 1,
          explanation:
            "A percentile marks a point in the spread of response times. p99 of 800 ms means about 99% of requests finish within 800 ms, and the slowest 1% take longer.",
        },
      ],
    },
  ],
};

const scalabilityLesson: LessonContent = {
  slug: "scalability",
  title: "Scalability",
  subtitle:
    "Handle growing load by finding and relieving the limit that is actually under pressure.",
  sections: [
    {
      kind: "prose",
      heading: "What Scalability Means",
      body: [
        "A system is **scalable** when it can handle increased load by adding resources while keeping performance within its requirements.",
        "Load is not one number. It can mean more read traffic, write traffic, storage, bandwidth, concurrent users, background jobs, or a few hot keys. Scaling is not adding every component at once. It is finding the current bottleneck and increasing the capacity of that part of the system.",
        "A system is not scalable simply because it has multiple servers. It is scalable when it can continue to meet its latency, reliability, and throughput targets as load grows.",
      ],
    },
    {
      kind: "prose",
      heading: "How Systems Grow",
      body: [
        "Scaling pressure can come from more than request volume. A growing user base raises request and connection counts. New features can add dependencies, background jobs, or expensive queries. More content raises storage, indexing, backup, and recovery costs.",
        "A wider geographic reach adds latency, localization, and sometimes data-residency constraints. More modules and integrations also increase operational complexity. Name the type of growth first, because it determines what should scale.",
      ],
    },
    {
      kind: "table",
      caption: "Growth trigger and the pressure it creates",
      headers: ["Growth", "Typical pressure", "Likely first question"],
      rows: [
        [
          "User base",
          "More requests and concurrent connections",
          "Which tier reaches capacity first at peak?",
        ],
        ["Features", "New workflows and dependencies", "Which path adds latency or failure risk?"],
        [
          "Data volume",
          "Storage, indexes, backups, recovery",
          "Does one data store still fit and recover in time?",
        ],
        [
          "System complexity",
          "More service-to-service calls",
          "Where does coordination or fan-out amplify work?",
        ],
        [
          "Geographic reach",
          "Latency, compliance, availability",
          "Do users need content or data closer to them?",
        ],
      ],
    },
    {
      kind: "image",
      src: scalabilityLoopImg,
      alt: "Scalability infographic showing the loop from measuring load to finding a bottleneck, scaling a component, and verifying the result",
      caption:
        "The scaling loop: measure the load, find the limiting resource, make a targeted change, then verify the new limit.",
    },
    {
      kind: "table",
      caption: "Measure the load before choosing a scaling technique",
      headers: ["Load type", "Useful signal", "Question to answer"],
      rows: [
        [
          "Read traffic",
          "Read QPS, cache hit rate",
          "Can the database serve repeated reads fast enough?",
        ],
        [
          "Write traffic",
          "Write QPS, write latency",
          "Can the primary accept and persist the write rate?",
        ],
        ["Storage", "Data growth, index size", "Will data, backups, and recovery still fit?"],
        ["Bandwidth", "Bytes/sec in and out", "Are payloads or media exhausting the network path?"],
        [
          "Concurrency",
          "Open connections, queue depth",
          "Can the system serve users who are active at the same time?",
        ],
        [
          "Skew",
          "Top keys, busiest partitions",
          "Is a small set of users or keys dominating load?",
        ],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "The bottleneck loop",
      body: "Measure the load → find the bottleneck → scale the limiting component → verify the result. After every change, a different dependency may become the next limit.",
    },
    {
      kind: "prose",
      heading: "Scale Up or Scale Out",
      body: [
        "**Vertical scaling** means making one machine larger: more CPU, memory, disk, or network capacity. It is simple and has fewer moving parts, but it has a hardware ceiling and can leave one large failure domain.",
        "**Horizontal scaling** means adding more machines. It can increase capacity and availability, but it introduces load balancing, coordination, data distribution, and operational complexity.",
        "Start with vertical scaling or one well-sized node while it comfortably meets the requirement. Scale out when one machine is no longer enough, or when availability requires multiple instances.",
      ],
    },
    {
      kind: "table",
      caption: "Vertical and horizontal scaling",
      headers: ["Approach", "Best when", "Strength", "Trade-off"],
      rows: [
        [
          "Scale up",
          "The workload still fits one larger machine",
          "Simple operations and no distributed coordination",
          "A hard ceiling and a larger single failure domain",
        ],
        [
          "Scale out",
          "Capacity or availability exceeds one machine",
          "More aggregate capacity and fault tolerance",
          "Load balancing, coordination, and uneven distribution",
        ],
        [
          "Hybrid",
          "Different tiers have different limits",
          "Scale each tier in the way it needs",
          "More system-specific decisions",
        ],
      ],
    },
    {
      kind: "prose",
      heading: "Choose the Smallest Strategy That Meets the Need",
      body: [
        "For an early product, vertical scaling, a cache, and basic load balancing are often enough. Instrument CPU, memory, request latency, database read and write capacity, and queue depth so the next limit is visible before it becomes an outage.",
        "Use horizontal scaling, partitioning, or independently scalable services only when the measured workload requires them. Auto-scaling can reduce idle cost and absorb bursts, but use conservative thresholds and cooldowns so instances do not repeatedly scale out and in during a noisy traffic pattern.",
      ],
    },
    { kind: "system-design-scalability-loop" },
    {
      kind: "prose",
      heading: "Stateless Application Servers",
      body: [
        "Application servers are easiest to scale horizontally when they are **stateless**. Any server should be able to handle any request without depending on memory stored by a previous server.",
        "Move sessions to a shared store, persist files in object storage, and keep request-specific state out of local process memory. With stateless servers, a load balancer can add or remove instances without changing the client experience.",
        "A local session or uploaded file may be convenient at first, but it becomes a routing or data-loss problem as soon as requests can land on multiple instances.",
      ],
    },
    {
      kind: "image",
      src: scalabilityArchitectureImg,
      alt: "System design diagram showing client requests through a CDN, load balancer, application servers, cache, and database, with a queue and worker branch",
      caption:
        "A scale-out request path: keep the application tier stateless, cache repeated reads, and move slow work to a queue and worker.",
    },
    {
      kind: "prose",
      heading: "Linear Scaling Is a Goal, Not a Guarantee",
      body: [
        "If one server handles 100 requests per second, two servers rarely handle exactly 200. Shared databases, locks, network calls, cache misses, uneven traffic, and coordination all reduce the gain from extra servers.",
        "Use load tests and production metrics to compare added capacity with actual throughput and tail latency. If adding instances does not improve the metric, the bottleneck is probably downstream.",
      ],
    },
    {
      kind: "prose",
      heading: "Scale Reads Before the Primary Database Becomes the Limit",
      body: [
        "A **cache** serves repeated data from memory and reduces database work. It is useful when reads are frequent and stale data is acceptable for a bounded period. The cost is invalidation, cache misses, and the risk of stale results.",
        "**Read replicas** copy data from the primary and spread read traffic. They improve read capacity and can isolate analytical or reporting work, but replication lag means a read may not immediately see a completed write.",
        "Use both only when measurements show read pressure. A cache and replicas cannot solve a write-bound primary database.",
      ],
    },
    {
      kind: "table",
      caption: "Read scaling choices",
      headers: ["Technique", "Use when", "Trade-off", "Failure mode"],
      rows: [
        [
          "Cache",
          "The same data is read repeatedly",
          "Invalidation and stale data",
          "A cold cache overloads the database",
        ],
        [
          "Read replicas",
          "Reads dominate writes",
          "Replication lag and additional operations",
          "Read-after-write returns stale data",
        ],
        [
          "Precompute",
          "The same expensive result is read often",
          "More write work and derived state",
          "Materializing rarely used results",
        ],
      ],
    },
    {
      kind: "prose",
      heading: "Scale Writes and Data Deliberately",
      body: [
        "When one primary cannot sustain write volume or storage, **sharding** partitions data across multiple nodes. Choose a key that matches access patterns and distributes load evenly. Sharding adds capacity, but cross-shard queries, rebalancing, and hot partitions become operational concerns.",
        "Queues separate a fast request path from slower background work. A queue can absorb bursts and let workers scale independently, but it introduces backlog, retries, duplicates, ordering decisions, and delayed results.",
        "Use object storage for large binary data. It keeps the transactional database focused on metadata and gives media a storage path that can grow independently.",
      ],
    },
    {
      kind: "prose",
      heading: "Scale Delivery and Services Only When Their Load Differs",
      body: [
        "A **CDN** caches static or cacheable content close to users. It reduces origin bandwidth and latency for global audiences, but content freshness and invalidation still need a clear policy.",
        "Independent services can be scaled separately when their workloads, release cadence, or reliability needs genuinely differ. Splitting a system into microservices too early adds network calls, observability work, data ownership decisions, and more failure modes. Keep a modular monolith while it remains easier to operate.",
        "For global latency, availability, or legal requirements, deploy in more than one region. Multi-region systems improve reach and resilience but introduce replication, routing, and consistency trade-offs.",
      ],
    },
    {
      kind: "table",
      caption: "Match the pressure to the smallest useful change",
      headers: ["Pressure", "First direction", "What to verify next"],
      rows: [
        [
          "Application CPU",
          "Add stateless app instances behind a load balancer",
          "Per-instance utilization and downstream latency",
        ],
        [
          "Repeated database reads",
          "Cache or add read replicas",
          "Hit rate, primary CPU, and replication lag",
        ],
        [
          "Slow asynchronous work",
          "Queue the work and scale workers",
          "Queue depth, retries, and end-to-end delay",
        ],
        [
          "Write or storage limit",
          "Partition data or move media to object storage",
          "Partition balance, hot keys, and recovery time",
        ],
        [
          "Large public media delivery",
          "Use a CDN",
          "Origin egress, cache hit rate, and freshness",
        ],
      ],
    },
    {
      kind: "prose",
      heading: "Verify the Change and Name the Next Limit",
      body: [
        "A scaling change is complete only after it is verified against the requirement. Compare throughput, P95 or P99 latency, error rate, utilization, queue depth, cache hit rate, and cost before and after the change.",
        "Scaling is a sequence: `load grows → a limit appears → add capacity or reduce work → a new limit appears`. A strong design explains where the system breaks next and what change would address it.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "Scalability means preserving requirements as load grows, not simply adding servers.",
        "Measure first. Different load shapes create different bottlenecks and need different responses.",
        "Scale up for simplicity while it fits. Scale out when capacity or availability requires it.",
        "Keep application servers stateless so the load balancer can distribute requests freely.",
        "Caches, replicas, shards, queues, CDNs, and object storage are targeted tools. Each improves one pressure and adds its own trade-offs.",
        "Use autoscaling with stable thresholds and cooldowns. Use multi-region deployment only when geographic latency, availability, or compliance requires it.",
        "After every scaling change, verify the metric and identify the next bottleneck.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "scalability-db-bottleneck",
          question:
            "Application servers are mostly idle, but database CPU is saturated by repeated profile reads. What is the best first scaling direction?",
          options: [
            "Add more application servers",
            "Add a cache or read replicas",
            "Shard every table immediately",
            "Increase the request timeout",
          ],
          correctIndex: 1,
          explanation:
            "The database read path is the measured bottleneck. A cache can remove repeated work; replicas can distribute remaining reads. More app servers would only send more work to the saturated database.",
        },
        {
          id: "scalability-stateless",
          question: "Why do stateless application servers scale more easily horizontally?",
          options: [
            "They never use a database",
            "A load balancer can send any request to any instance",
            "They require sticky sessions",
            "They store every upload on local disk",
          ],
          correctIndex: 1,
          explanation:
            "Stateless instances keep sessions and durable data in shared stores, so no client depends on a particular server.",
        },
        {
          id: "scalability-replica-tradeoff",
          question: "What trade-off does a read replica commonly introduce?",
          options: [
            "Replication lag can return stale data",
            "It eliminates the need for backups",
            "It increases primary write capacity without limits",
            "It guarantees linear scaling",
          ],
          correctIndex: 0,
          explanation:
            "Replicas copy data asynchronously in many systems. That improves read capacity but can make a just-completed write temporarily invisible on a replica.",
        },
        {
          id: "scalability-queue",
          question: "Which signal best shows whether a queue-based scaling change is keeping up?",
          options: [
            "The number of colors in the architecture diagram",
            "Queue depth and end-to-end processing delay",
            "The size of the load balancer icon",
            "Only average application CPU",
          ],
          correctIndex: 1,
          explanation:
            "A queue is healthy when workers drain work at least as fast as it arrives and the delay stays within the product requirement.",
        },
      ],
    },
  ],
};

/** The module's lessons in order. Add a new lesson above and list it here. */
export const CORE_CONCEPTS_LESSONS: LessonContent[] = [
  latencyThroughputBandwidthLesson,
  scalabilityLesson,
];
