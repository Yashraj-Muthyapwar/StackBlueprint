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
      body: [
        "Horizontal scaling increases capacity by adding servers or application instances.",
      ],
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
      kind: "code",
      language: "text",
      caption: "Server count",
      code: "**Server count = Target RPS / RPS per server**\n**= 10,000 / 1,000 = 10**",
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

/** The module's lessons in order. Add a new lesson above and list it here. */
export const CORE_CONCEPTS_LESSONS: LessonContent[] = [
  latencyThroughputBandwidthLesson,
  scalabilityLesson,
];
