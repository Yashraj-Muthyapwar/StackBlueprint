import { type LessonContent } from "@/lessons/types";

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
        [
          "Latency",
          "The time it takes for a request to travel from the client to the server and back (end-to-end delay). Think of latency as the response time",
          "ms, seconds",
        ],
        [
          "Throughput",
          "The number of requests a system can handle per unit time",
          "RPS, TPS, MB/s",
        ],
        [
          "Bandwidth",
          "The maximum rate at which data can be transferred over a network",
          "Mbps, Gbps",
        ],
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
      kind: "formula",
      caption: "Total latency",
      lines: [
        [
          { sub: ["L", "total"] },
          "=",
          { sub: ["L", "1"] },
          "+",
          { sub: ["L", "2"] },
          "+",
          "…",
          "+",
          { sub: ["L", "n"] },
        ],
      ],
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
      kind: "formula",
      caption: "Throughput",
      lines: [["Throughput", "=", { frac: ["Completed requests", "Elapsed time"] }]],
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
    { kind: "formula", caption: "Little's Law", lines: [["N", "=", "λ", "×", "W"]] },
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
      kind: "formula",
      caption: "Little's Law applied",
      lines: [["N", "=", "1,000", "×", "0.2", "=", "200"]],
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
  subtitle: "Handle growing workloads by adding the right resources.",
  sections: [
    {
      kind: "prose",
      body: [
        "**Scalability is the ability of a system to handle increasing workloads by adding resources while maintaining acceptable performance.**",
        "A workload can include:",
      ],
    },
    {
      kind: "list",
      items: [
        "Number of incoming requests.",
        "Number of concurrent users.",
        "Amount of stored data.",
        "Number of operations performed per second.",
      ],
    },
    {
      kind: "prose",
      body: [
        "A scalable system can support growth without unacceptable increases in latency, error rates, or cost.",
        "**For example**, suppose a shopping application handles **1,000 requests per second (RPS)**. As the business grows, demand increases to **10,000 RPS**.",
        "If the system can handle this growth by adding resources while meeting its performance targets, it demonstrates scalability.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Important",
      body: "Scalability does not mean a system has unlimited capacity. Every scaling approach has limits.",
    },
    {
      kind: "prose",
      eyebrow: "1 · Why",
      heading: "Why do systems need scalability?",
      body: [
        "Consider an online shopping application.",
        "Initially, only 100 users visit the application simultaneously. One server can handle the traffic.",
        "Later, the application becomes popular. Thousands of users begin searching, adding products to carts, and making payments.",
      ],
    },
    { kind: "demand-capacity-chart" },
    {
      kind: "prose",
      body: [
        "When incoming demand exceeds sustainable processing capacity, requests may queue, fail, or be rejected.",
        "Without sufficient capacity, the application may experience higher latency, timeouts, failed requests, or resource exhaustion.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "The goal",
      body: "Scalability helps systems support growth while maintaining defined performance and reliability targets.",
    },
    {
      kind: "prose",
      eyebrow: "2 · Intuition",
      heading: "Restaurant analogy",
      body: [
        "Imagine a restaurant with one kitchen.",
        "The kitchen can prepare 100 meals per hour. One day, customers begin ordering 300 meals per hour.",
        "The restaurant has two broad ways to increase capacity.",
        "**Vertical scaling: Upgrade one kitchen**",
        "Install a larger stove, faster ovens, and more powerful equipment.",
        "The restaurant has one kitchen with more processing power.",
        "In computing, this means adding more CPU, RAM, or other resources to an existing server.",
        "**Horizontal scaling: Add more kitchens**",
        "Create additional kitchens and distribute customer orders among them.",
        "In computing, this means adding more servers or instances that share the workload.",
        "Try both below. The orders stay at 300 meals per hour.",
      ],
    },
    { kind: "restaurant-scaling" },
    {
      kind: "callout",
      tone: "info",
      title: "Memory shortcut",
      body: "Vertical scaling = Make one machine bigger. Horizontal scaling = Add more machines.",
    },
    {
      kind: "callout",
      tone: "warn",
      title: "No guaranteed threefold gain",
      body: "Neither approach guarantees a threefold increase in output. The result depends on other bottlenecks, such as ingredients, staff, or payment processing.",
    },
    {
      kind: "prose",
      eyebrow: "3 · How",
      heading: "How scalability works",
      body: [""],
    },
    {
      kind: "prose",
      heading: "Vertical scaling (Scale Up)",
      body: [
        "Vertical scaling increases the resources available to one server.",
        "**How it works:**",
      ],
    },
    {
      kind: "list",
      items: [
        "Identify the resource limiting performance.",
        "Upgrade the server's CPU, RAM, or storage capacity as appropriate.",
        "Verify that the application can use the additional resources.",
        "Measure performance again.",
      ],
    },
    { kind: "scaling-walkthrough", mode: "vertical" },
    {
      kind: "prose",
      body: [
        "**Advantages:** include simple architecture and fewer machines to manage.",
        "**Limitations:** include hardware ceilings, increasing costs, possible downtime during upgrades, and a single point of failure if only one server exists.",
      ],
    },
    {
      kind: "prose",
      heading: "Horizontal scaling (Scale Out)",
      body: ["Horizontal scaling increases capacity by adding servers or application instances."],
    },
    { kind: "scaling-walkthrough", mode: "horizontal" },
    { kind: "prose", body: ["**How it works:**"] },
    {
      kind: "list",
      items: [
        "Deploy multiple application instances.",
        "Place a load balancer in front of them.",
        "Distribute incoming requests across healthy instances.",
        "Add or remove instances as demand changes.",
        "Monitor application and shared backend capacity.",
      ],
    },
    {
      kind: "prose",
      body: [
        "If one server sustainably handles 1,000 RPS, three equivalent servers might handle approximately 3,000 RPS when work distributes evenly and no other component becomes the bottleneck.",
        "**Stateless application servers**",
        "Horizontal scaling is often easier for stateless application servers.",
        "A stateless server does not rely on locally stored user-session data between requests. User sessions can be represented by tokens or stored in an external shared service when necessary.",
        "This allows different application servers to handle successive requests from the same user.",
        "**Load balancing**",
        "A load balancer distributes incoming traffic across servers.",
        "Common strategies include round-robin and least-connections routing.",
        "It can also check server health and stop directing traffic to unhealthy instances.",
        "However, adding a load balancer does not automatically increase capacity. You need sufficient healthy backend resources.",
        "**Scalability and elasticity**",
        "These concepts are related, but they are not identical.",
      ],
    },
    {
      kind: "table",
      caption: "Scalability and elasticity",
      headers: ["Scalability", "Elasticity"],
      rows: [
        [
          "Ability to handle workload growth by adding resources",
          "Ability to adjust allocated resources as demand changes",
        ],
        ["Can involve manual or automatic scaling", "Typically emphasizes dynamic adjustments"],
        [
          "Focuses on supporting a larger workload",
          "Focuses on matching capacity to changing demand",
        ],
      ],
    },
    {
      kind: "prose",
      body: [
        "For example, adding five servers permanently demonstrates scaling. Automatically adding servers during peak traffic and removing them when demand falls demonstrates elasticity.",
        "Switch between the two below and compare how many servers run through the same day.",
      ],
    },
    { kind: "elasticity-compare" },
    {
      kind: "prose",
      eyebrow: "4 · Example",
      heading: "Scaling an e-commerce API",
      body: [
        "An application currently handles 1,000 RPS using one server.",
        "A major sale is expected to generate 10,000 RPS.",
        "Assume that each equivalent application server can sustainably process 1,000 RPS, requests can be distributed evenly, and downstream services have sufficient capacity.",
        "Under these idealized assumptions:",
      ],
    },
    {
      kind: "formula",
      caption: "Server count",
      lines: [
        ["Server count", "=", { frac: ["Target RPS", "RPS per server"] }],
        ["=", { frac: ["10,000", "1,000"] }, "=", "10"],
      ],
    },
    {
      kind: "prose",
      body: [
        "The application needs a theoretical minimum of 10 servers.",
        "In production, engineers would normally plan spare capacity for failures, traffic spikes, maintenance, and latency targets. They would also load-test the complete system.",
        "For instance, 10 application servers cannot guarantee 10,000 RPS if the shared database becomes saturated at 4,000 RPS.",
        "Plan the sale yourself below. Start with the defaults, then move the database limit.",
      ],
    },
    { kind: "server-count-calculator" },
    {
      kind: "prose",
      eyebrow: "5 · Trade-offs",
      heading: "Vertical versus horizontal scaling",
      body: [],
    },
    {
      kind: "table",
      caption: "Vertical and horizontal scaling compared",
      headers: ["Factor", "Vertical scaling", "Horizontal scaling"],
      rows: [
        ["Basic method", "Increase machine resources", "Add more machines"],
        ["Implementation", "Often simpler", "More architectural complexity"],
        ["Hardware limits", "Restricted by machine size", "Can expand across more instances"],
        ["Availability", "Single-server risks remain", "Can provide redundancy"],
        ["Cost", "Larger machines can be expensive", "More infrastructure and operating costs"],
        ["Stateful workloads", "Often simpler", "Requires careful state management"],
      ],
    },
    { kind: "prose", body: ["**What can still limit you**"] },
    {
      kind: "list",
      items: [
        "**Database bottleneck:** Application servers scale, but all requests still depend on one overloaded database.",
        "**Load balancer bottleneck:** The traffic distribution layer itself becomes insufficient or unavailable.",
        "**Shared state:** Users experience inconsistent sessions if their data is stored only on one server.",
        "**Uneven traffic distribution:** Some instances become overloaded while others remain underused.",
        "**Resource contention:** Increasing concurrency can produce higher throughput initially, then longer queues and worse latency once resources saturate.",
      ],
    },
    {
      kind: "callout",
      tone: "success",
      title: "The key system design principle",
      body: "Scale the bottleneck, not simply the number of servers.",
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
          title: "Count the servers",
          prompt:
            "A flash sale is expected to bring 7,200 RPS. Each equivalent server sustainably handles 900 RPS, requests spread evenly, and the database has enough capacity. What is the theoretical minimum number of servers?",
          fields: [{ label: "Servers", answer: 8, tone: "accent" }],
          success:
            "Correct. 7,200 / 900 = 8. A real plan would add spare capacity for failures and spikes.",
          hint: "Divide the target traffic by what one server sustains.",
        },
        {
          type: "fields",
          label: "Practice B",
          title: "Find the ceiling",
          prompt:
            "Four application servers each sustain 1,500 RPS, but the shared database saturates at 4,000 RPS. What is the most RPS the whole system can sustain?",
          fields: [{ label: "RPS", answer: 4000, tone: "accent" }],
          success:
            "Correct. The servers could take 6,000 RPS, but the system sustains only the smallest capacity on the path, which is the database at 4,000 RPS.",
          hint: "Compare what the servers can take with what the database can take.",
        },
        {
          type: "choice",
          label: "Practice C",
          title: "Before scaling out",
          prompt:
            "A shop keeps each user's cart in the memory of its one application server. Adding a second server makes carts disappear at random. What should change first?",
          options: [
            "Move the cart to a shared store or a token, so any server can serve any request",
            "Buy a bigger load balancer",
            "Add a third server so the odds improve",
            "Ask users to refresh the page",
          ],
          answer: 0,
          success:
            "Right. While state lives on one server, requests must return to that server. Sharing the state makes the servers interchangeable.",
          hint: "Ask where the information lives, and whether another server could read it.",
        },
      ],
    },
    {
      kind: "prose",
      body: [
        "Now try one on the whiteboard. This is optional practice: the goals tick as you go, and a badge appears when you meet them all.",
      ],
    },
    { kind: "diagram-board", boardId: "scale-out-load-balancer" },
    {
      kind: "takeaways",
      items: [
        "Scalability is handling growing workload by adding resources while keeping performance acceptable. It never means unlimited capacity.",
        "Vertical scaling makes one machine bigger and is simpler, but it has a hardware ceiling and one point of failure. Horizontal scaling adds machines and brings redundancy and complexity.",
        "Stateless servers are easier to scale out, because any healthy instance can serve any request.",
        "A load balancer spreads requests across healthy instances, but it adds no capacity on its own.",
        "Scalability is about supporting a larger workload. Elasticity is about matching capacity to demand as it changes.",
        "Servers needed is roughly target RPS divided by RPS per server, but the system sustains only its smallest capacity. Scale the bottleneck, not just the number of servers.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "scalability-q1-vertical",
          question: "What is vertical scaling?",
          options: [
            "Add more servers to share the workload.",
            "Add resources such as CPU and RAM to an existing server.",
            "Reduce the number of incoming requests.",
          ],
          correctIndex: 1,
          explanation:
            "Vertical scaling makes one machine bigger. Adding servers is horizontal scaling, and cutting requests changes the demand, not the capacity.",
        },
        {
          id: "scalability-q2-load-balancer",
          question:
            "Which component commonly distributes incoming requests across horizontally scaled application servers?",
          options: ["Load balancer", "CPU cache", "Local disk"],
          correctIndex: 0,
          explanation:
            "A load balancer is the entry point that spreads requests across healthy instances. A CPU cache and a local disk are parts of a single machine.",
        },
        {
          id: "scalability-q3-stateless",
          question: "Why are stateless application servers generally easier to scale horizontally?",
          options: [
            "They never access a database.",
            "Any healthy instance can generally process a request without depending on locally stored session state.",
            "They require no network connections.",
          ],
          correctIndex: 1,
          explanation:
            "When no instance holds state the others lack, the load balancer can send any request to any instance. Stateless servers still use databases and networks.",
        },
        {
          id: "scalability-q4-elasticity",
          question:
            "A system adds servers automatically during a traffic spike and removes them when traffic falls. What capability does this demonstrate most specifically?",
          options: ["Latency", "Elasticity", "Bandwidth"],
          correctIndex: 1,
          explanation:
            "Elasticity is adjusting allocated resources as demand changes. Latency is a delay and bandwidth is a capacity of a connection.",
        },
        {
          id: "scalability-q5-bottleneck",
          question:
            "You increase application servers from 2 to 10, but overall throughput barely improves. What is a reasonable explanation?",
          options: [
            "Horizontal scaling never improves throughput.",
            "The application must use vertical scaling instead.",
            "Another resource, such as the database, may be the bottleneck.",
          ],
          correctIndex: 2,
          explanation:
            "The system sustains only its smallest capacity. If the shared database is saturated, more application servers cannot help, and horizontal scaling does improve throughput when the application tier is the limit.",
        },
      ],
    },
  ],
};

const availability: LessonContent = {
  slug: "availability",
  title: "Availability",
  subtitle: "Keep the service working when parts of it fail.",
  sections: [
    {
      kind: "prose",
      body: [
        "**Availability** is the ability of a system to remain operational and accessible when users need it.",
        "A system is available when it can successfully provide its intended service.",
        "For example, an online banking application is available when users can log in, check balances, and perform supported transactions.",
        "A system that is running but cannot process requests correctly may still be considered unavailable.",
      ],
    },
    {
      kind: "formula",
      caption: "Availability formula",
      lines: [["Availability", "=", { frac: ["Uptime", "Total time"] }, "×", "100"]],
    },
    { kind: "prose", body: ["**Where:**"] },
    {
      kind: "list",
      items: [
        "**Uptime:** Time during which the service meets its availability requirements.",
        "**Downtime:** Time during which the service does not meet those requirements.",
        "**Total time:** The measurement period, including uptime and downtime.",
      ],
    },
    {
      kind: "prose",
      body: [
        "Availability is usually expressed as a percentage.",
        "The following table shows approximate maximum downtime over a 365-day year.",
      ],
    },
    {
      kind: "table",
      caption: "Downtime permitted per year",
      headers: ["Availability", "Common name", "Downtime per year"],
      rows: [
        ["99%", "Two nines", "3.65 days"],
        ["99.9%", "Three nines", "8 hr 45 min 36 sec"],
        ["99.99%", "Four nines", "52 min 34 sec"],
        ["99.999%", "Five nines", "5 min 15 sec"],
        ["99.9999999%", "Nine nines", "31.6 milliseconds"],
      ],
    },
    { kind: "downtime-bars" },
    {
      kind: "callout",
      tone: "info",
      title: "The cost of each nine",
      body: "A higher availability target permits less downtime. It usually requires more redundancy, automation, testing, and operational investment.",
    },
    {
      kind: "prose",
      eyebrow: "1 · Why",
      heading: "Why do we need availability?",
      body: [
        "Imagine that you are designing a banking application.",
        "Users expect to access their money at any time.",
        "However, servers can fail because of hardware faults, software bugs, network failures, power outages, maintenance, or overloaded dependencies.",
        "If the application has only one server and that server fails, users cannot access the service.",
        "Availability engineering aims to reduce the impact of failures and restore service quickly.",
        "The key idea is not to prevent every failure. It is to keep the service operating, or restore it quickly, when failures occur.",
        "An availability design must consider the complete request path.",
        "For example, two healthy application servers do not provide end-to-end availability if both depend on one database that has failed.",
      ],
    },
    {
      kind: "prose",
      eyebrow: "2 · Intuition",
      heading: "Hospital emergency department analogy",
      body: [
        "Imagine a hospital with one emergency doctor on duty.",
        "If that doctor becomes unavailable, emergency treatment may stop.",
        "The hospital can improve availability by arranging backup doctors, alternative treatment rooms, and a process for transferring patients.",
        "**Single point of failure**",
        "Only one doctor can provide emergency treatment.",
        "If that doctor is unavailable, treatment stops.",
        "**Redundancy**",
        "Multiple qualified doctors can provide treatment.",
        "If one becomes unavailable, others can continue.",
        "**Failover**",
        "When one treatment team cannot continue, another team takes responsibility through a planned transfer process.",
        "Try each arrangement below. Make Doctor 1 unavailable and watch the patients.",
      ],
    },
    { kind: "hospital-availability" },
    { kind: "prose", body: ["Remember these three ideas:"] },
    {
      kind: "list",
      items: [
        "**Redundancy:** Have backup resources.",
        "**Failover:** Switch to a healthy resource after failure.",
        "**Fault isolation:** Prevent one failure from bringing down unrelated resources.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "A backup has to work",
      body: "A backup that cannot take over when needed provides limited protection.",
    },
    {
      kind: "prose",
      eyebrow: "3 · How",
      heading: "How high availability works",
      body: [
        "**A. Single point of failure (SPOF)**",
        "A SPOF is a component whose failure can make the entire service unavailable.",
        "In this architecture, both the application server and database are possible single points of failure.",
        "To remove these risks, we can introduce redundancy.",
        "**B. Redundancy**",
        "Redundancy means having additional components that can provide the same essential function.",
        "Examples include multiple application servers, multiple network paths, backup power supplies, and replicated databases.",
        "But redundant resources should not all depend on the same failure-prone component.",
        "For example, two servers connected to one failed power supply may both become unavailable.",
        "This is called a common-mode failure.",
      ],
    },
    { kind: "availability-walkthrough", mode: "spof" },
    {
      kind: "prose",
      body: [
        "**C. Health checks and failover**",
        "A health check determines whether an application instance is capable of handling requests.",
        "A load balancer may periodically check an endpoint such as:",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "A health check request",
      code: "GET /health",
    },
    {
      kind: "prose",
      body: [
        "A useful readiness check indicates whether an instance can safely receive traffic, not merely whether its process is running.",
        "When an instance becomes unhealthy:",
      ],
    },
    {
      kind: "list",
      items: [
        "The monitoring or load-balancing system detects the failure.",
        "The failed instance is marked unhealthy.",
        "New requests are directed to healthy instances.",
        "Existing in-flight requests may fail and require retry.",
        "Recovery automation restores or replaces the failed instance.",
      ],
    },
    {
      kind: "prose",
      body: [
        "Failover is not always instantaneous. Detection, switching, reconnection, and recovery take time.",
      ],
    },
    { kind: "availability-walkthrough", mode: "failover" },
    {
      kind: "prose",
      body: [
        "**D. Active-active vs active-passive**",
        "These are two common availability architectures.",
      ],
    },
    {
      kind: "table",
      caption: "Active-active and active-passive",
      headers: ["Factor", "Active-active", "Active-passive"],
      rows: [
        ["Normal traffic", "Multiple active instances", "Primary handles traffic"],
        ["Resource usage", "Both serve work", "Standby capacity reserved"],
        ["Failure recovery", "Traffic shifts to survivors", "Standby must take over"],
        ["Main challenge", "Coordination and spare capacity", "Failover detection and switching"],
      ],
    },
    {
      kind: "prose",
      body: [
        "Both strategies can support high availability. Neither eliminates every failure risk.",
        "Switch between them and fail server A to compare.",
      ],
    },
    { kind: "active-modes" },
    {
      kind: "prose",
      body: [
        "**E. Database replication**",
        "Application availability also depends on data availability.",
        "A common database design uses a primary database and one or more replicas.",
        "The primary handles writes. Replicas maintain copies of data and may serve reads, depending on the design.",
        "If the primary fails, an eligible replica may be promoted.",
        "However, replication introduces important questions:",
      ],
    },
    {
      kind: "list",
      items: [
        "Is replication synchronous or asynchronous?",
        "Could recent writes be lost during failover?",
        "How does the system prevent two databases from both acting as primary?",
        "How does the application reconnect after failover?",
      ],
    },
    { kind: "prose", body: ["These are essential design considerations."] },
    { kind: "availability-walkthrough", mode: "database" },
    {
      kind: "prose",
      body: [
        "**F. Availability vs reliability vs fault tolerance**",
        "These terms are related but different.",
      ],
    },
    {
      kind: "table",
      caption: "Three related ideas",
      headers: ["Concept", "Meaning"],
      rows: [
        ["Availability", "Whether the service is operational when needed"],
        [
          "Reliability",
          "Whether the service performs correctly over a specified period or operation without failure",
        ],
        ["Fault tolerance", "Ability to continue operating despite certain component failures"],
      ],
    },
    {
      kind: "prose",
      body: [
        "A system may experience occasional failures but remain highly available because it recovers quickly.",
        "A fault-tolerant architecture can keep operating during particular failures without a noticeable service interruption, depending on its design.",
        "High availability often permits a short failover interruption, whereas stronger fault-tolerance requirements may demand uninterrupted operation.",
      ],
    },
    {
      kind: "prose",
      eyebrow: "4 · Example",
      heading: "Highly available e-commerce application",
      body: [
        "Consider an online shopping service.",
        "It needs to remain available when an application server fails.",
        "A simplified architecture is below. Break parts of it and watch whether the service stays up.",
      ],
    },
    { kind: "ha-architecture" },
    {
      kind: "prose",
      body: [
        "If application server A fails, the load balancer should stop routing new traffic to it and direct traffic to server B.",
        "If the primary database fails, a standby replica may take over after the system detects failure and completes a safe promotion.",
        "For stronger availability, engineers may distribute resources across separate availability zones to reduce the impact of a single-zone failure.",
        "However, multi-zone deployment does not guarantee high availability by itself. Shared dependencies, operational mistakes, and regional failures can still affect the system.",
      ],
    },
    {
      kind: "prose",
      eyebrow: "5 · Trade-offs",
      heading: "Availability engineering decisions",
      body: [
        "**A. Redundancy vs cost**",
        "Additional servers, replicas, network paths, and monitoring systems increase infrastructure and operational costs.",
        "Higher availability targets generally require more investment.",
        "**B. Availability vs consistency**",
        "In some distributed-system network partitions, an application must choose whether to reject certain operations to preserve consistency or continue serving operations that may not have the latest data.",
        "This is related to the CAP theorem.",
        "It does not mean every system must always choose between availability and consistency. The trade-off is specifically important when communication between distributed components fails.",
        "**C. Recovery time and recovery point**",
        "Two metrics are often used when designing failover and disaster recovery:",
        "**Recovery Time Objective (RTO):** The target maximum time to restore service after disruption.",
        "**Recovery Point Objective (RPO):** The target maximum acceptable amount of data loss, expressed as a time interval.",
        "For example, an RTO of five minutes means the recovery design aims to restore service within five minutes.",
        "An RPO of one minute means the design targets no more than approximately one minute of lost data changes in a qualifying failure.",
        "These are objectives, not automatic guarantees.",
      ],
    },
    { kind: "rto-rpo" },
    {
      kind: "prose",
      body: [
        "**D. Service-level objectives (SLOs)**",
        "An SLO defines a measurable service target.",
        "For example:",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Example SLO",
      body: "At least 99.9% of eligible API requests should succeed during each calendar month.",
    },
    {
      kind: "prose",
      body: [
        "This is a request-based availability SLO. A service can also use time-based availability measurements.",
        "An SLA is a contractual agreement and may specify consequences if service commitments are missed.",
        "An SLI is the metric used to measure service behavior.",
        "A useful way to remember these terms:",
      ],
    },
    {
      kind: "list",
      items: [
        "**Service Level Indicator (SLI):** What we measure. Example: actual availability is 99.95%.",
        "**Service Level Objective (SLO):** What target we aim to meet. Example: target availability is ≥99.9%.",
        "**Service Level Agreement (SLA):** What you promise/contract with customers, often with consequences if unmet.",
      ],
    },
    { kind: "prose", body: ["Set the downtime for a month below and watch which targets hold."] },
    { kind: "slo-budget" },
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
          title: "Downtime allowance",
          prompt:
            "A 30-day month has 43,200 minutes. A service promises 99% availability for the month. How many minutes of downtime does that permit?",
          fields: [{ label: "Minutes", answer: 432, tone: "accent" }],
          success:
            "Correct. 1% of 43,200 minutes is 432 minutes, which is 7.2 hours. Each extra nine would cut it by ten.",
          hint: "Find the share of the month that may be unavailable, then take that share of 43,200.",
        },
        {
          type: "choice",
          label: "Practice B",
          title: "Name the failure",
          prompt:
            "Two application servers sit in the same rack on one power supply. The power supply fails and both servers go down. What is this called?",
          options: ["A common-mode failure", "Failover", "Fault isolation", "Replication lag"],
          answer: 0,
          success:
            "Right. The two servers looked redundant, but they shared one failure-prone component, so one fault removed both.",
          hint: "Ask what the two servers have in common, and whether that one thing can fail.",
        },
        {
          type: "choice",
          label: "Practice C",
          title: "RTO or RPO",
          prompt:
            "After a failover, service returns in 2 minutes but the last 4 minutes of orders are missing. The targets were RTO 5 minutes and RPO 1 minute. What happened?",
          options: [
            "The RTO was met, but the RPO was missed",
            "Both were met",
            "Both were missed",
            "The RTO was missed, but the RPO was met",
          ],
          answer: 0,
          success:
            "Correct. Service came back within 5 minutes, but 4 minutes of data was lost, which is more than the 1 minute the RPO allowed.",
          hint: "One objective is about time to restore service, the other about how much data may be lost.",
        },
      ],
    },
    {
      kind: "prose",
      body: [
        "Now try one on the whiteboard. This is optional practice: the goals tick as you go, and a badge appears when you meet them all.",
      ],
    },
    { kind: "diagram-board", boardId: "high-availability-design" },
    {
      kind: "takeaways",
      items: [
        "Availability is the share of time a service meets its availability requirements. A service that is running but cannot process requests correctly counts as unavailable.",
        "Each extra nine cuts the allowed downtime by ten: 99.9% allows about 8 hr 45 min a year, while 99.999% allows about 5 min 15 sec.",
        "A single point of failure is a component whose failure takes down the whole service. Redundancy removes it, but only if the copies do not share a failure-prone dependency.",
        "Failover is detect, mark unhealthy, redirect, and recover. It takes time, and in-flight requests may need a retry.",
        "Active-active shares traffic and needs spare capacity. Active-passive keeps a standby that must detect failure and take over.",
        "RTO is how long recovery may take and RPO is how much data may be lost. An SLI is measured, an SLO is the target, and an SLA is the promise.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "availability-q1-meaning",
          question: "What does 99.9% availability mean?",
          options: [
            "The application processes 99.9% of all possible requests per second.",
            "The service meets its defined availability criteria for 99.9% of the measured period, under a time-based definition.",
            "Every request finishes within 99.9 milliseconds.",
          ],
          correctIndex: 1,
          explanation:
            "Availability is a share of the measurement period in which the service meets its requirements. It is not a request rate and not a latency.",
        },
        {
          id: "availability-q2-spof",
          question: "What is a single point of failure?",
          options: [
            "Any component with CPU utilization above 80%.",
            "A component whose failure can make the whole service unavailable.",
            "A server that processes only one request at a time.",
          ],
          correctIndex: 1,
          explanation:
            "A SPOF is defined by what its failure does, not by how busy it is or how many requests it handles.",
        },
        {
          id: "availability-q3-active-passive",
          question: "Which statement best describes active-passive architecture?",
          options: [
            "Both servers always process equal amounts of traffic.",
            "The standby server is used only to store logs and cannot take over.",
            "A primary serves traffic, while a standby is prepared to take over during failover.",
          ],
          correctIndex: 2,
          explanation:
            "In active-passive the primary handles traffic and the standby waits. Equal traffic on both describes active-active, and a standby that cannot take over is not a standby.",
        },
        {
          id: "availability-q4-failover",
          question:
            "A primary database fails. Its replica becomes the new primary after a failover process. What mechanism is demonstrated?",
          options: ["Database failover", "Vertical scaling", "Request batching"],
          correctIndex: 0,
          explanation:
            "Promoting a replica after the primary fails is database failover. Vertical scaling makes a machine bigger, and batching groups requests.",
        },
        {
          id: "availability-q5-redundancy",
          question: "Which statement is correct?",
          options: [
            "A system with redundant servers can never fail.",
            "High availability and fault tolerance always mean exactly the same thing.",
            "Redundancy can reduce failure impact, but shared dependencies can still cause outages.",
          ],
          correctIndex: 2,
          explanation:
            "Redundancy helps only when the copies are independent. A shared database, power supply or network can still bring everything down, and high availability usually allows a short interruption that fault tolerance may not.",
        },
      ],
    },
  ],
};

/** The module's lessons in order. Add a new lesson above and list it here. */
export const CORE_CONCEPTS_LESSONS: LessonContent[] = [
  latencyThroughputBandwidthLesson,
  scalabilityLesson,
  availability,
];
