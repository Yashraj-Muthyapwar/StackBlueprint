import { type LessonContent, type Section } from "@/lessons/types";
import capImg from "@/images/system-design/distributed-systems/cap.png";
import pacelcImg from "@/images/system-design/distributed-systems/pacelc.png";
export type DistributedSystemsTopicMeta = {
  slug: string;
  title: string;
  category: string;
  blurb: string;
  iconKey: "network" | "layers" | "terminal";
  lessons: LessonContent[];
};

const availability: LessonContent = {
  slug: "availability",
  title: "Availability",
  subtitle: "Probability that a system is operational and able to serve requests.",
  sections: [
    {
      kind: "prose",
      heading: "What is Availability?",
      body: [
        "Availability is the probability that a system is operational and able to serve requests when users need it.",
        "It is commonly expressed as a percentage of time the system is available:",
      ],
    },
    {
      kind: "code",
      language: "text",
      code: "Availability = Uptime / (Uptime + Downtime) × 100",
    },
    {
      kind: "prose",
      body: [
        "**Uptime** → Time during which the service is operational and serving requests.",
        "**Downtime** → Time during which the service cannot provide its intended service.",
        "Availability is usually expressed in nines. If a service is unavailable for approximately 1 hour in a year, its availability is about 99.99%.",
      ],
    },
    {
      kind: "table",
      caption: "Availability Tiers",
      headers: ["Availability", "Approx. downtime / year", "Approx. downtime / month"],
      rows: [
        ["90%", "36.5 days", "72 hours"],
        ["99%", "3.65 days", "7.2 hours"],
        ["99.9%", "8.77 hours", "43.8 minutes"],
        ["99.99%", "52.6 minutes", "4.32 minutes"],
        ["99.999%", "5.26 minutes", "25.9 seconds"],
        ["99.9999%", "31.6 seconds", "2.59 seconds"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Rule of thumb",
      body: "Each additional nine represents roughly a 10× reduction in allowable downtime.",
    },
    {
      kind: "prose",
      heading: "What Improves Availability?",
      body: [
        "**1. Redundancy:** Run multiple instances so that one failure does not stop the service. (Server, Database, Network, and Geographic redundancy).",
        "**2. Load Balancing:** Distribute requests across healthy instances.",
      ],
    },
    {
      kind: "diagram",
      ascii: `Users
  ↓
Load Balancer
 ├── Server A
 ├── Server B
 └── Server C`,
    },
    {
      kind: "prose",
      body: [
        "If one server fails, traffic can be routed to the others.",
        "**3. Failover:** Automatically switch to a healthy component when the active component fails. (Active-passive or Active-active).",
        "**4. Replication:** Maintain multiple copies of important data. Synchronous replication improves consistency but increases latency; asynchronous replication reduces write latency but introduces replication lag.",
        "**5. Health Checks and Monitoring:** Detect unhealthy components and remove them from service. (Heartbeats, Metrics, Alerts, Automated recovery).",
      ],
    },
    {
      kind: "prose",
      heading: "Designing for High Availability",
      body: [
        "Common practices include:",
        "- **Design for failure:** Assume components will fail.",
        "- **Multi-AZ deployment:** Avoid depending on a single failure domain.",
        "- **Automatic failover:** Reduce recovery time.",
        "- **Capacity headroom:** Handle traffic spikes and component failures.",
        "- **Graceful degradation:** Keep essential functionality working when dependencies fail.",
        "- **Circuit breakers:** Prevent failures from cascading.",
        "- **Caching:** Reduce dependency on backend systems.",
        "- **Chaos testing:** Validate that failure-handling mechanisms actually work.",
      ],
    },
    {
      kind: "prose",
      heading: "Availability in Sequence vs. Parallel",
      body: [
        "Availability math changes drastically depending on whether components depend on each other (sequence) or act as fallbacks for each other (parallel).",
      ],
    },
    {
      kind: "availability-diagram",
    },
    {
      kind: "callout",
      tone: "success",
      title: "Analogy",
      body: "One elevator is a single dependency. Two independent elevators mean one can fail while the other remains usable.",
    },
    {
      kind: "table",
      caption: "Availability vs. Reliability",
      headers: ["", "Availability", "Reliability"],
      rows: [
        [
          "Main question",
          "Is the system available now?",
          "Does it continue performing correctly without failure?",
        ],
        ["Focus", "Operational status", "Failure-free operation"],
        ["Common metrics", "Uptime, downtime", "MTBF, failure rate"],
        ["Time perspective", "Point/period availability", "Behavior over an operating period"],
      ],
    },
    {
      kind: "prose",
      body: [
        "A system can be available but unreliable—for example, it may remain reachable but frequently return errors.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "Availability is the percentage of time a system is operational and serving requests.",
        "Each additional 'nine' of availability represents a 10x reduction in allowed downtime.",
        "Redundancy and load balancing in parallel increase availability, while adding sequential dependencies decreases it.",
        "A system can be highly available (reachable) but unreliable (returning errors).",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "avail-q1",
          question:
            "If a system is available 99.9% of the time, roughly how much downtime is allowed per year?",
          options: ["36.5 days", "8.77 hours", "52.6 minutes", "5.26 minutes"],
          correctIndex: 1,
          explanation:
            "99.9% availability allows for approximately 8.77 hours of downtime per year.",
        },
        {
          id: "avail-q2",
          question: "Which pattern decreases overall system availability?",
          options: [
            "Deploying components in parallel",
            "Implementing a load balancer",
            "Adding a new sequential dependency",
            "Using active-passive failover",
          ],
          correctIndex: 2,
          explanation:
            "Adding a sequential dependency means that if the new component fails, the entire system fails, lowering overall availability.",
        },
        {
          id: "avail-q3",
          question: "What is the key difference between availability and reliability?",
          options: [
            "Availability measures uptime; reliability measures failure-free operation.",
            "They are exactly the same.",
            "Reliability is measured in nines; availability is measured in MTBF.",
            "Availability only applies to databases.",
          ],
          correctIndex: 0,
          explanation:
            "Availability focuses on whether the system is up and reachable, while reliability focuses on whether it performs correctly without errors over time.",
        },
        {
          id: "avail-q4",
          question:
            "How do two 99% available components arranged in parallel affect total availability?",
          options: [
            "Total availability becomes 98%",
            "Total availability remains 99%",
            "Total availability drops to 90%",
            "Total availability increases to 99.99%",
          ],
          correctIndex: 3,
          explanation:
            "In parallel, the system only fails if both fail (0.01 * 0.01 = 0.0001 probability of failure), yielding 99.99% availability.",
        },
        {
          id: "avail-q5",
          question:
            "Which of the following is NOT a standard practice for designing highly available systems?",
          options: [
            "Assuming hardware will never fail",
            "Multi-AZ deployment",
            "Graceful degradation",
            "Circuit breakers",
          ],
          correctIndex: 0,
          explanation:
            "You must always design for failure. Assuming hardware will never fail goes against the principles of high availability.",
        },
      ],
    },
  ],
};

const reliability: LessonContent = {
  slug: "reliability",
  title: "Reliability",
  subtitle: "Ability of a system to perform its intended function correctly.",
  sections: [
    {
      kind: "prose",
      heading: "What is Reliability?",
      body: [
        "Reliability is the ability of a system to perform its intended function correctly and consistently for a specified period under specified conditions.",
        "A reliable system doesn't merely stay online; it does the right thing.",
      ],
    },
    {
      kind: "callout",
      tone: "success",
      title: "Analogy",
      body: "A car that starts every morning and performs as expected is reliable. A car that turns on but randomly stalls is available but not very reliable.",
    },
    {
      kind: "prose",
      heading: "Why Reliability Matters",
      body: [
        "Poor reliability can cause failed requests, incorrect results, data corruption, repeated retries, cascading failures, loss of user trust, and increased operational cost.",
        "Reliability is therefore broader than simply keeping a server running.",
      ],
    },
    {
      kind: "prose",
      heading: "Sources of Failure",
      body: [
        "A distributed system can fail because of hardware failure, software bugs, configuration errors, resource exhaustion, network failures, dependency failures, data corruption, traffic spikes, human error, or infrastructure failures.",
        "A useful principle is: **Assume components will fail; design the system so individual failures do not become system-wide failures.**",
      ],
    },
    {
      kind: "prose",
      heading: "Reliability Techniques",
      body: [
        "**Redundancy:** Use multiple independent components so one failure does not necessarily cause an outage.",
        "**Failover:** Move work to a healthy component after failure.",
        "**Health Checks:** Detect unhealthy instances before sending them more traffic.",
        "**Retries:** Retry transient failures, preferably with exponential backoff, jitter, and a maximum retry limit. Uncontrolled retries can amplify an outage.",
        "**Timeouts:** Never allow a request to wait indefinitely for a failed dependency.",
        "**Circuit Breakers:** Temporarily stop sending requests to a failing dependency, giving it time to recover and preventing cascading failure.",
        "**Graceful Degradation:** Return a reduced experience instead of failing the entire request.",
      ],
    },
    {
      kind: "reliability-diagram",
    },
    {
      kind: "prose",
      heading: "Measuring Reliability",
      body: [
        "**MTBF (Mean Time Between Failures):** For repairable systems, this is the total operating time divided by the number of failures. Higher MTBF indicates fewer failures.",
        "**MTTR (Mean Time To Repair/Recover):** Total recovery time divided by the number of failures. Lower MTTR means the system recovers faster.",
        "**Failure Rate:** Total failed operations divided by total operations.",
      ],
    },
    {
      kind: "prose",
      heading: "Reliability vs. Availability",
      body: [
        "The distinction is simple: Availability asks whether the service is usable. Reliability asks how consistently it performs its intended function without failure.",
        "A service can have high availability while still producing frequent errors.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "Reliability focuses on failure-free, correct operation over a period of time.",
        "Key metrics include MTBF (Mean Time Between Failures) and MTTR (Mean Time To Repair).",
        "Techniques like timeouts, circuit breakers, and retries with backoff prevent localized failures from bringing down the whole system.",
        "A system must be designed under the assumption that its underlying components will eventually fail.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "rel-q1",
          question: "What does MTTR stand for?",
          options: [
            "Mean Time To Respond",
            "Mean Time To Repair",
            "Maximum Time To Recover",
            "Minimum Time To Restart",
          ],
          correctIndex: 1,
          explanation: "MTTR stands for Mean Time To Repair (or Recover). A lower MTTR is better.",
        },
        {
          id: "rel-q2",
          question:
            "Why should you use exponential backoff and jitter when retrying failed requests?",
          options: [
            "To ensure the request reaches a different server",
            "To prevent a thundering herd problem that overwhelms the recovering service",
            "To increase the availability of the client",
            "To guarantee the request succeeds eventually",
          ],
          correctIndex: 1,
          explanation:
            "If many clients retry simultaneously (thundering herd), they can crash a recovering service. Jitter and backoff spread out the retry load.",
        },
        {
          id: "rel-q3",
          question: "What is the primary purpose of a Circuit Breaker in a distributed system?",
          options: [
            "To permanently disconnect faulty servers",
            "To temporarily stop sending requests to a failing dependency to allow it to recover",
            "To encrypt traffic between services",
            "To route traffic to the fastest server",
          ],
          correctIndex: 1,
          explanation:
            "Circuit breakers prevent cascading failures by tripping when a dependency is failing, failing fast instead of waiting for timeouts.",
        },
        {
          id: "rel-q4",
          question: "Which of the following describes 'Graceful Degradation'?",
          options: [
            "Returning a 500 Internal Server Error when a dependency is down",
            "Shutting down the server gracefully to avoid data loss",
            "Returning cached or limited data instead of failing the entire user request",
            "Downgrading the user's subscription plan",
          ],
          correctIndex: 2,
          explanation:
            "Graceful degradation means the system continues to function with reduced capability rather than failing completely.",
        },
        {
          id: "rel-q5",
          question:
            "If a server stays online and responds to all pings, but returns HTTP 500 errors to 50% of API requests, it is:",
          options: [
            "Highly available but unreliable",
            "Highly reliable but unavailable",
            "Neither available nor reliable",
            "Both highly available and reliable",
          ],
          correctIndex: 0,
          explanation:
            "It is available (online, responding) but highly unreliable (failing to perform its intended function correctly).",
        },
      ],
    },
  ],
};

const consistency: LessonContent = {
  slug: "consistency",
  title: "Consistency",
  subtitle: "What values and ordering a client can observe when data is replicated.",
  sections: [
    {
      kind: "prose",
      heading: "What is Consistency?",
      body: [
        "In distributed systems, consistency describes what values and ordering guarantees a client can observe when data is replicated or accessed concurrently.",
        "It is not simply 'How quickly replicas synchronize.' That is closer to replication lag or convergence time.",
      ],
    },
    {
      kind: "prose",
      heading: "Why Consistency Becomes Difficult",
      body: [
        "With one database, there is one copy of the state. With replication, a write must somehow become visible across those replicas:",
      ],
    },
    {
      kind: "diagram",
      ascii: `             ┌── Replica A
             │
Client → DB ─┼── Replica B
             │
             └── Replica C`,
    },
    {
      kind: "prose",
      body: [
        "This creates questions: When does a write become visible? Can a read return an older value? Must operations appear in a particular order? These are answered by consistency models.",
      ],
    },
    {
      kind: "prose",
      heading: "Consistency Trade-offs",
      body: ["There is a spectrum between Strong Consistency and Eventual Consistency."],
    },
    {
      kind: "consistency-diagram",
    },
    {
      kind: "prose",
      body: [
        "**Linearizability:** A form of strong consistency. Requires operations to appear to take effect atomically at a single point in time while respecting real-time ordering. It makes a distributed system behave as though there were one current copy of the data.",
      ],
    },
    {
      kind: "prose",
      heading: "Causal Consistency",
      body: [
        "Preserves cause-and-effect relationships. If a comment depends on a post, a causally consistent system ensures the comment is not observed before the post. It is weaker than linearizability but stronger than eventual consistency.",
      ],
    },
    {
      kind: "prose",
      heading: "Session Guarantees",
      body: [
        "**Read-your-writes:** After updating, subsequent reads by that user see their own update.",
        "**Monotonic reads:** Once a client sees a version, later reads won't return older versions.",
      ],
    },
    {
      kind: "prose",
      heading: "Consistency Spectrum",
      body: ["Stronger → Linearizable → Causal → Session guarantees → Eventual → Weaker"],
    },
    {
      kind: "prose",
      heading: "Choosing a Consistency Model",
      body: [
        "Ask: What happens if a client temporarily sees an older value?",
        "- Harmless (Recommendations, likes): weaker consistency.",
        "- Critical (Payments, inventory): stronger consistency.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "Consistency models define the rules for what state a client can observe when reading from replicated data.",
        "Linearizability (strong consistency) provides the illusion of a single, instant copy of the data.",
        "Eventual consistency guarantees that all replicas will eventually converge if no new writes occur.",
        "Session guarantees like 'read-your-writes' provide strong user experiences without the overhead of global strong consistency.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "consist-q1",
          question:
            "Which consistency model provides the illusion that there is only a single copy of the data updated instantly?",
          options: [
            "Eventual Consistency",
            "Causal Consistency",
            "Linearizability",
            "Read-your-writes",
          ],
          correctIndex: 2,
          explanation:
            "Linearizability (a form of strong consistency) ensures operations appear atomic and respect real-time ordering.",
        },
        {
          id: "consist-q2",
          question: "What does Eventual Consistency guarantee?",
          options: [
            "Reads will always return the latest write",
            "If updates stop, all replicas will eventually converge to the same value",
            "Operations will be applied in causal order",
            "Data is never lost",
          ],
          correctIndex: 1,
          explanation:
            "Eventual consistency only guarantees convergence after some unspecified amount of time.",
        },
        {
          id: "consist-q3",
          question:
            "A user updates their profile picture and immediately reloads the page, but sees their old picture. Which consistency guarantee was violated?",
          options: ["Monotonic Reads", "Read-your-writes", "Linearizability", "Causal Consistency"],
          correctIndex: 1,
          explanation:
            "Read-your-writes ensures a client always sees the effects of their own recent writes.",
        },
        {
          id: "consist-q4",
          question: "Which scenario heavily requires Strong Consistency?",
          options: [
            "Social media follower counts",
            "Processing a financial transaction",
            "Updating a product's text description",
            "Video view counters",
          ],
          correctIndex: 1,
          explanation:
            "Financial transactions require strict correctness and cannot tolerate stale reads or divergent states.",
        },
        {
          id: "consist-q5",
          question: "How is Causal Consistency different from Eventual Consistency?",
          options: [
            "It is exactly the same thing.",
            "Causal consistency ensures that operations related by cause-and-effect are observed in that exact order.",
            "Causal consistency requires all nodes to pause during writes.",
            "Causal consistency is a stronger form of Linearizability.",
          ],
          correctIndex: 1,
          explanation:
            "Causal consistency respects cause-and-effect (like a reply to a post), whereas eventual consistency has no strict ordering guarantees before convergence.",
        },
      ],
    },
  ],
};

const capTheorem: LessonContent = {
  slug: "cap-theorem",
  title: "CAP Theorem",
  subtitle: "Understanding Consistency, Availability, and Partition Tolerance.",
  sections: [
    {
      kind: "prose",
      heading: "The big idea",
      body: [
        "**CAP = Consistency + Availability + Partition Tolerance**",
        "The CAP theorem says:",
        "> In a distributed system, when a **network partition** happens, you can guarantee **either Consistency or Availability**, but not both.",
        "**Important:** CAP is mainly about what happens **during a partition**.",
      ],
    },
    {
      kind: "prose",
      heading: "1. C = Consistency",
      body: [
        "Every read gets the **most recent successful write**.",
        "Even if data is replicated across multiple nodes, the system should not return stale data.",
      ],
    },
    {
      kind: "cap-consistency-diagram",
    },
    {
      kind: "prose",
      heading: "Simple example",
      body: [
        "A bank account has a `Balance = $1,000`.",
        "You withdraw $200.",
        "A subsequent read should not show `$1,000` when the successful write already changed it to `$800`.",
        "**Consistency = 'Give me the latest correct value.'**",
      ],
    },
    {
      kind: "prose",
      heading: "2. A = Availability",
      body: [
        "Every request receives a **response**, even if some nodes are unavailable.",
        "The response may potentially contain **stale data**, depending on the system's consistency model.",
        "**Availability = 'Don't make me wait for the system to be fully synchronized.'**",
      ],
    },
    {
      kind: "cap-availability-diagram",
    },
    {
      kind: "prose",
      heading: "3. P = Partition Tolerance",
      body: [
        "The system continues operating even when there is a **network communication failure between nodes**.",
      ],
    },
    {
      kind: "cap-partition-diagram",
    },
    {
      kind: "prose",
      body: [
        "Node A and Node B are both alive, but they **cannot communicate**.",
        "A distributed system cannot simply assume that partitions will never happen.",
        "So, in real distributed systems: **P is generally non-negotiable.**",
        "The real choice becomes:",
      ],
    },
    {
      kind: "diagram",
      ascii: `During partition:

       CAP
        │
    ┌───┴───┐
    │       │
   CP      AP`,
    },
    {
      kind: "prose",
      heading: "CP: Consistency + Partition Tolerance",
      body: [
        "During a partition:",
        "- Consistency ✅",
        "- Partition Tolerance ✅",
        "- Availability ❌",
        "The system may **reject, delay, or block requests** rather than return potentially incorrect or stale data.",
      ],
    },
    {
      kind: "prose",
      heading: "Example",
      body: [
        "Suppose two replicas cannot communicate: Node A has 100, Node B has 100.",
        "Client writes `200` to Node A. Node B cannot learn about the update.",
        'A CP system may say: *"I cannot safely answer this request right now."*',
        "Better to reject the operation than return conflicting data.",
      ],
    },
    {
      kind: "prose",
      heading: "Good for",
      body: [
        "- Financial transactions",
        "- Inventory",
        "- Strongly consistent metadata",
        "- Systems where incorrect data is worse than temporary unavailability",
      ],
    },
    {
      kind: "prose",
      heading: "AP: Availability + Partition Tolerance",
      body: [
        "During a partition:",
        "- Availability ✅",
        "- Partition Tolerance ✅",
        "- Consistency ❌",
        "The system continues responding even when replicas cannot communicate.",
        "This can temporarily produce **stale or conflicting data**.",
        "Both sides can continue accepting requests. Once communication is restored, the system needs to **reconcile the differences**.",
      ],
    },
    {
      kind: "prose",
      heading: "Good for",
      body: [
        "- Social media feeds",
        "- Product recommendations",
        "- Likes/views",
        "- Shopping carts in some architectures",
        "- Systems where temporary stale data is acceptable",
      ],
    },
    {
      kind: "prose",
      heading: "The most important CAP diagram",
      body: ["Real distributed systems usually choose CP or AP, as P is assumed."],
    },
    {
      kind: "image",
      src: capImg,
      alt: "CAP Theorem Triangle diagram showing Consistency, Availability, and Partition Tolerance",
      caption: "Real distributed systems usually choose CP or AP, as P is assumed.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Interview shortcut",
      body: '**Don\'t say:** "CAP means you can only choose two out of three." That\'s an oversimplification.\n\n**Better answer:** "CAP says that when a network partition occurs, a distributed system cannot simultaneously guarantee both strong consistency and availability. Since partitions are unavoidable in distributed systems, the practical choice is usually between CP and AP behavior."',
    },
    {
      kind: "prose",
      heading: "Real-world example: Distributed database",
      body: [
        "Normally, Node A (US-East) and Node B (US-West) are synchronized. Now a network partition occurs.",
      ],
    },
    {
      kind: "cap-theorem-diagram",
    },
    {
      kind: "prose",
      heading: "CAP vs Eventual Consistency",
      body: [
        "These are related, but **not the same thing**.",
        "If no new updates occur and communication is restored, eventually all replicas converge.",
        "An AP system often uses eventual consistency, but **CAP does not say that AP systems must use eventual consistency**.",
      ],
    },
    {
      kind: "prose",
      heading: "CAP vs ACID",
      body: ["Don't confuse them. They solve different problems."],
    },
    {
      kind: "table",
      caption: "CAP vs ACID",
      headers: ["CAP", "ACID"],
      rows: [
        ["Concerns: Distributed systems", "Concerns: Database transactions"],
        ["Network partitions", "Atomicity"],
        ["Consistency vs availability", "Consistency, Isolation, Durability"],
      ],
    },
    {
      kind: "prose",
      heading: "CAP in system design interviews",
      body: [
        "When designing a distributed system, ask:",
        "**1. Can the system tolerate stale data?** If yes → AP may be appropriate. If no → CP may be appropriate.",
        "**2. What happens during a network partition?** Explain explicitly: Partition occurs → Can requests continue? → YES (favor Availability) or NO (favor Consistency).",
        "**3. What is more dangerous?** Incorrect balance? Very dangerous → Favor consistency. Feed is a few seconds stale? Usually acceptable → Favor availability.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Common interview traps",
      body: '❌ **"CAP means pick any two."** Not exactly. The trade-off becomes important **when a partition occurs**.\n\n❌ **"Availability means the system never goes down."** No. CAP availability means that every request to a non-failing node receives a response.\n\n❌ **"Consistency means all replicas are always synchronized."** Not necessarily. CAP consistency means a read behaves as if there is a single, up-to-date copy of the data.\n\n❌ **"AP means the database is inconsistent forever."** No. AP systems can allow temporary inconsistency and later converge.',
    },
    {
      kind: "takeaways",
      items: [
        "CAP stands for Consistency, Availability, and Partition Tolerance.",
        "In a distributed system, when a network partition occurs, we cannot guarantee both strong consistency and availability at the same time.",
        "Since network partitions are unavoidable, the practical choice is usually CP or AP.",
        "CP systems prefer correct, strongly consistent data and may reject requests during a partition.",
        "AP systems continue serving requests and may temporarily return stale or conflicting data.",
        "Partition + Need correctness → CP",
        "Partition + Need availability → AP",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "cap-new-q1",
          question: "When does the CAP theorem actually force a trade-off?",
          options: [
            "All the time",
            "Only during high traffic spikes",
            "Only when a network partition occurs",
            "Only when writing to a database",
          ],
          correctIndex: 2,
          explanation:
            "The trade-off between Consistency and Availability only surfaces when nodes cannot communicate (a partition).",
        },
        {
          id: "cap-new-q2",
          question: "What is a common misconception about the CAP theorem?",
          options: [
            "It applies to distributed systems",
            "You can easily just 'pick any two' regardless of network conditions",
            "Partition tolerance is unavoidable",
            "Consistency refers to reading the most recent write",
          ],
          correctIndex: 1,
          explanation:
            "Saying 'pick any two' is an oversimplification. You must pick Partition Tolerance, and the choice between C and A only happens during a partition.",
        },
        {
          id: "cap-new-q3",
          question:
            "If an e-commerce site allows users to add items to their cart even when backend inventory databases are partitioned, the cart system is leaning towards:",
          options: [
            "AP (Availability + Partition Tolerance)",
            "CP (Consistency + Partition Tolerance)",
            "CA (Consistency + Availability)",
            "ACID properties",
          ],
          correctIndex: 0,
          explanation:
            "It prioritizes Availability (allowing the user to proceed) over strict Consistency (knowing exactly if the item is still in stock).",
        },
        {
          id: "cap-new-q4",
          question: "What is the key difference between CAP Consistency and ACID Consistency?",
          options: [
            "They are exactly the same concept",
            "CAP Consistency is about a read behaving as if there's one up-to-date copy of data; ACID Consistency is about database transactions leaving data in a valid state",
            "CAP is for SQL databases, ACID is for NoSQL",
            "ACID requires eventual consistency",
          ],
          correctIndex: 1,
          explanation:
            "CAP Consistency refers to linearizability or strong consistency in a distributed system, whereas ACID Consistency refers to transaction rules (e.g., unique constraints) in a database.",
        },
        {
          id: "cap-new-q5",
          question:
            "In an interview, if a system must handle financial transactions during a network split, which approach should you advocate for?",
          options: ["AP", "CP", "Eventual Consistency", "NoSQL"],
          correctIndex: 1,
          explanation:
            "Financial systems prioritize correctness. Incorrect balances are very dangerous, so favoring Consistency (CP) by rejecting/blocking unsafe operations is usually required.",
        },
      ],
    },
  ],
};

const pacelcTheorem: LessonContent = {
  slug: "pacelc-theorem",
  title: "PACELC Theorem",
  subtitle: "Trading off Latency vs Consistency during normal operations.",
  sections: [
    {
      kind: "prose",
      heading: "The big idea",
      body: [
        "**PACELC = Partition + Availability + Consistency + Else + Latency + Consistency**",
        "PACELC extends the CAP theorem. The key idea is:",
      ],
    },
    {
      kind: "callout",
      tone: "violet",
      title: "Core Rule",
      body: "If there is a network Partition, a distributed system chooses between Availability and Consistency. Else, when the system is operating normally, it chooses between Latency and Consistency.",
    },
    {
      kind: "prose",
      heading: "Easy memory",
      body: [
        "**CAP:** What happens during a partition?",
        "**PACELC:** What happens during a partition, and what trade-off exists when there isn't one?",
      ],
    },
    {
      kind: "prose",
      heading: "1. Why PACELC?",
      body: [
        "CAP explains an important failure scenario: during a network partition, you must choose between Consistency and Availability.",
        "But distributed systems have a trade-off even when the network is perfectly healthy.",
        "For example:",
      ],
    },
    {
      kind: "diagram",
      ascii: `Local replica → Low latency → May be slightly stale`,
    },
    {
      kind: "prose",
      body: ["versus:"],
    },
    {
      kind: "diagram",
      ascii: `Cross-region coordination → Higher latency → Stronger consistency`,
    },
    {
      kind: "prose",
      body: [
        "CAP doesn't really describe this **normal-operation latency vs consistency trade-off**. PACELC does.",
      ],
    },
    {
      kind: "prose",
      heading: "2. P = Partition",
      body: ["The **P** represents a network partition (like we saw in the CAP lesson)."],
    },
    {
      kind: "diagram",
      ascii: `Region A          Region B
Node A    X       Node B
          ↑
    Network failure`,
    },
    {
      kind: "prose",
      body: [
        "The nodes are alive but cannot communicate. PACELC asks: **What should the system prioritize during this partition?**",
      ],
    },
    {
      kind: "prose",
      heading: "3. A = Availability vs C = Consistency",
      body: [
        "During a partition, the system can prioritize:",
        "• **Availability (PA):** Keep serving requests (allowing stale reads, local writes, temporary divergence).",
        "• **Consistency (PC):** Don't return unsafe/stale data (rejecting or delaying requests until the partition heals).",
      ],
    },
    {
      kind: "prose",
      heading: '4. The "ELC" Part',
      body: [
        "This is what makes PACELC different from CAP.",
        "**ELC = Else, Latency vs Consistency**",
        "If there is **no partition** (normal operation), you must choose between:",
      ],
    },
    {
      kind: "diagram",
      ascii: `          No Partition
               ↓
        Normal operation
               ↓
       ┌───────┴───────┐
       ↓               ↓
    Lower latency   Stronger
                    consistency
       ↓               ↓
    Less           More
 coordination     coordination`,
    },
    {
      kind: "prose",
      heading: "5. Why Does Consistency Increase Latency?",
      body: ["Imagine a database replicated across two regions."],
    },
    {
      kind: "prose",
      heading: "Option 1: Local write",
      body: [
        "Write locally and respond immediately. Very fast. But Region B may not have the latest value yet. (Lower latency + Potentially weaker consistency).",
      ],
    },
    {
      kind: "prose",
      heading: "Option 2: Synchronous replication",
      body: [
        "Write to Region A, send to Region B, confirm replication, then respond. The system has to wait for coordination. (Higher latency + Stronger consistency).",
        "That's the **ELC trade-off**.",
      ],
    },
    {
      kind: "image",
      src: pacelcImg,
      alt: "PACELC diagram showing the flow chart of decisions",
      caption: "PACELC in one diagram: P -> A vs C, E -> L vs C",
    },
    {
      kind: "prose",
      heading: "6. The formula to remember",
      body: ["**P → A vs C**", "**E → L vs C**"],
    },
    {
      kind: "prose",
      heading: "7. Real-World Example",
      body: ["Imagine a globally replicated user database:"],
    },
    {
      kind: "diagram",
      ascii: `                 Users
                   │
          ┌────────┴────────┐
          ↓                 ↓
      US Region         Europe Region
       Node A              Node B
          │                  │
          └──── Replication ─┘`,
    },
    {
      kind: "prose",
      body: [
        "**Normal operation (Healthy Network):**",
        "• **Low-latency approach (EL):** Write locally to the US Node and respond immediately. Europe gets the update slightly later. (Latency > Consistency)",
        "• **Strong-consistency approach (EC):** Wait for replication. US Node waits for Europe Node to confirm. The client waits longer. (Consistency > Latency)",
      ],
    },
    {
      kind: "prose",
      heading: "8. What If a Partition Happens?",
      body: [
        "The network breaks: `US Node    X    Europe Node`.",
        "The PACELC decision changes.",
        "• **AP-style behavior (PA):** Keep accepting requests. Potentially stale data is reconciled later. (Availability > Consistency)",
        "• **CP-style behavior (PC):** Stop unsafe operations. Reject or delay. (Consistency > Availability)",
      ],
    },
    {
      kind: "pacelc-theorem-diagram",
    },
    {
      kind: "prose",
      heading: "9. PACELC vs CAP",
      body: ["This is the most important comparison."],
    },
    {
      kind: "table",
      caption: "PACELC vs CAP Summary",
      headers: ["", "CAP", "PACELC"],
      rows: [
        ["Focus", "Focuses on partitions", "Focuses on partitions + normal operation"],
        ["Formula", "P → A vs C", "P → A vs C, Else → L vs C"],
        [
          "Normal latency trade-off",
          "Doesn't emphasize normal latency trade-off",
          "More complete distributed-system model",
        ],
      ],
    },
    {
      kind: "prose",
      heading: "10. Examples",
      body: [],
    },
    {
      kind: "prose",
      heading: "Strongly consistent system (EC)",
      body: [
        "More coordination → Higher latency → Stronger consistency. Useful when correctness is critical (Financial transactions, Inventory, Permission state).",
      ],
    },
    {
      kind: "prose",
      heading: "Low-latency system (EL)",
      body: [
        "Less coordination → Lower latency → Potentially weaker consistency. Useful when small amounts of staleness are acceptable (Social feeds, Recommendations, Analytics).",
      ],
    },
    {
      kind: "prose",
      heading: "11. Important Interview Point",
      body: [
        'PACELC does **not** mean: *"Consistency always makes the system slow."*',
        "The more accurate idea is:",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Nuance",
      body: "Stronger distributed consistency often requires additional coordination, which can increase latency.",
    },
    {
      kind: "prose",
      body: [
        "The actual trade-off depends on number of replicas, network distance, quorum requirements, replication strategy, etc.",
      ],
    },
    {
      kind: "prose",
      heading: "12. Common Interview Traps",
      body: [],
    },
    {
      kind: "prose",
      heading: '❌ "PACELC replaces CAP."',
      body: [
        "No. PACELC **extends the CAP discussion**. CAP focuses on P → A vs C. PACELC adds Else → L vs C.",
      ],
    },
    {
      kind: "prose",
      heading: '❌ "ELC means eventual consistency."',
      body: ["No. E means **Else**, L means **Latency**."],
    },
    {
      kind: "prose",
      heading: '❌ "Latency is only important during a partition."',
      body: [
        "No. PACELC specifically highlights the latency/consistency trade-off during **normal operation**.",
      ],
    },
    {
      kind: "prose",
      heading: '❌ "More consistency always means more latency."',
      body: [
        "Not necessarily in every implementation. The point is that *stronger distributed guarantees often require more coordination*, and coordination can increase latency.",
      ],
    },
    {
      kind: "prose",
      heading: "13. System Design Interview Approach",
      body: [
        "When designing a distributed system, ask two questions:",
        "**Question 1: What happens during a partition?**",
        "Need Availability? → AP-style behavior. Need strong Consistency? → CP-style behavior.",
        "**Question 2: What happens when the network is healthy?**",
        "Need lower Latency? → Reduce coordination. Need stronger Consistency? → Increase coordination.",
      ],
    },
    {
      kind: "prose",
      heading: "14. CAP + PACELC Together",
      body: ["Think of them as two layers:"],
    },
    {
      kind: "diagram",
      ascii: `              Distributed System
                      │
             ┌────────┴────────┐
             │                 │
        Partition?          No Partition
             │                 │
             ▼                 ▼
          CAP side          PACELC side
             │                 │
          A vs C             L vs C`,
    },
    {
      kind: "prose",
      heading: "CAP asks:",
      body: ['**"What happens when things break?"**'],
    },
    {
      kind: "prose",
      heading: "PACELC asks:",
      body: [
        '**"What happens when things break, and what trade-off do we make when things are working?"**',
      ],
    },
    {
      kind: "takeaways",
      items: [
        "PACELC in 30 Seconds: PACELC extends CAP by adding the trade-off that exists during normal operation.",
        "If there's a network partition, we choose between Availability and Consistency (P → A vs C).",
        "Else, when the system is healthy, we choose between Latency and Consistency (E → L vs C) because stronger consistency requires additional coordination.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "pacelc-q1",
          question: "What does the 'E' in PACELC stand for?",
          options: ["Eventual", "Else", "Error", "Encryption"],
          correctIndex: 1,
          explanation: "It stands for 'Else'—as in, if there is a partition, do X, ELSE do Y.",
        },
        {
          id: "pacelc-q2",
          question:
            "In a PA/EL system, what does the system optimize for during normal operation (no partition)?",
          options: ["Consistency", "Latency", "Availability", "Throughput"],
          correctIndex: 1,
          explanation:
            "The 'EL' part means Else (during normal operation), choose Latency over strict Consistency.",
        },
        {
          id: "pacelc-q3",
          question: "Why does strong consistency increase latency during normal operation?",
          options: [
            "Because strong consistency uses slower hard drives",
            "Because the system must wait for network round-trips to coordinate replicas before acknowledging the client",
            "Because consistency requires complex encryption algorithms",
            "Because it forces the system to reboot occasionally",
          ],
          correctIndex: 1,
          explanation:
            "Ensuring all nodes agree requires synchronous communication, which is bound by the speed of light over network distances.",
        },
        {
          id: "pacelc-q4",
          question:
            "If a database replicates data asynchronously to a secondary region, what PACELC characteristic is it exhibiting during normal operation?",
          options: ["EC", "EL", "PA", "PC"],
          correctIndex: 1,
          explanation:
            "Asynchronous replication means the client doesn't wait for the replica, prioritizing Latency (EL) over strict Consistency.",
        },
        {
          id: "pacelc-q5",
          question: "How does PACELC differ from CAP?",
          options: [
            "PACELC is for SQL databases; CAP is for NoSQL",
            "PACELC proves CAP is wrong",
            "PACELC extends CAP by also modeling the trade-offs during healthy network conditions",
            "PACELC is an older, obsolete theory",
          ],
          correctIndex: 2,
          explanation:
            "PACELC builds on CAP by adding the Latency vs. Consistency trade-off that occurs when the network is healthy.",
        },
      ],
    },
  ],
};

export const DISTRIBUTED_SYSTEMS_TOPICS: Record<string, DistributedSystemsTopicMeta> = {
  "distributed-systems": {
    slug: "distributed-systems",
    title: "Distributed Systems",
    category: "System Design",
    blurb: "Trading off consistency, availability, and latency.",
    iconKey: "network",
    lessons: [availability, reliability, consistency, capTheorem, pacelcTheorem],
  },
};
