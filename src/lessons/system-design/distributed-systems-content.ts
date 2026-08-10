import { type LessonContent, type Section } from "@/lessons/types";

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
        "It is commonly expressed as a percentage of time the system is available:"
      ]
    },
    {
      kind: "code",
      language: "text",
      code: "Availability = Uptime / (Uptime + Downtime) × 100"
    },
    {
      kind: "prose",
      body: [
        "**Uptime** → Time during which the service is operational and serving requests.",
        "**Downtime** → Time during which the service cannot provide its intended service.",
        "Availability is usually expressed in nines. If a service is unavailable for approximately 1 hour in a year, its availability is about 99.99%."
      ]
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
        ["99.9999%", "31.6 seconds", "2.59 seconds"]
      ]
    },
    {
      kind: "callout",
      tone: "info",
      title: "Rule of thumb",
      body: "Each additional nine represents roughly a 10× reduction in allowable downtime."
    },
    {
      kind: "prose",
      heading: "What Improves Availability?",
      body: [
        "**1. Redundancy:** Run multiple instances so that one failure does not stop the service. (Server, Database, Network, and Geographic redundancy).",
        "**2. Load Balancing:** Distribute requests across healthy instances."
      ]
    },
    {
      kind: "diagram",
      ascii: `Users
  ↓
Load Balancer
 ├── Server A
 ├── Server B
 └── Server C`
    },
    {
      kind: "prose",
      body: [
        "If one server fails, traffic can be routed to the others.",
        "**3. Failover:** Automatically switch to a healthy component when the active component fails. (Active-passive or Active-active).",
        "**4. Replication:** Maintain multiple copies of important data. Synchronous replication improves consistency but increases latency; asynchronous replication reduces write latency but introduces replication lag.",
        "**5. Health Checks and Monitoring:** Detect unhealthy components and remove them from service. (Heartbeats, Metrics, Alerts, Automated recovery)."
      ]
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
        "- **Chaos testing:** Validate that failure-handling mechanisms actually work."
      ]
    },
    {
      kind: "prose",
      heading: "Availability in Sequence vs. Parallel",
      body: [
        "Availability math changes drastically depending on whether components depend on each other (sequence) or act as fallbacks for each other (parallel)."
      ]
    },
    {
      kind: "availability-diagram"
    },
    {
      kind: "callout",
      tone: "success",
      title: "Analogy",
      body: "One elevator is a single dependency. Two independent elevators mean one can fail while the other remains usable."
    },
    {
      kind: "table",
      caption: "Availability vs. Reliability",
      headers: ["", "Availability", "Reliability"],
      rows: [
        ["Main question", "Is the system available now?", "Does it continue performing correctly without failure?"],
        ["Focus", "Operational status", "Failure-free operation"],
        ["Common metrics", "Uptime, downtime", "MTBF, failure rate"],
        ["Time perspective", "Point/period availability", "Behavior over an operating period"]
      ]
    },
    {
      kind: "prose",
      body: [
        "A system can be available but unreliable—for example, it may remain reachable but frequently return errors."
      ]
    },
    {
      kind: "takeaways",
      items: [
        "Availability is the percentage of time a system is operational and serving requests.",
        "Each additional 'nine' of availability represents a 10x reduction in allowed downtime.",
        "Redundancy and load balancing in parallel increase availability, while adding sequential dependencies decreases it.",
        "A system can be highly available (reachable) but unreliable (returning errors)."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "avail-q1",
          question: "If a system is available 99.9% of the time, roughly how much downtime is allowed per year?",
          options: ["36.5 days", "8.77 hours", "52.6 minutes", "5.26 minutes"],
          correctIndex: 1,
          explanation: "99.9% availability allows for approximately 8.77 hours of downtime per year."
        },
        {
          id: "avail-q2",
          question: "Which pattern decreases overall system availability?",
          options: ["Deploying components in parallel", "Implementing a load balancer", "Adding a new sequential dependency", "Using active-passive failover"],
          correctIndex: 2,
          explanation: "Adding a sequential dependency means that if the new component fails, the entire system fails, lowering overall availability."
        },
        {
          id: "avail-q3",
          question: "What is the key difference between availability and reliability?",
          options: ["Availability measures uptime; reliability measures failure-free operation.", "They are exactly the same.", "Reliability is measured in nines; availability is measured in MTBF.", "Availability only applies to databases."],
          correctIndex: 0,
          explanation: "Availability focuses on whether the system is up and reachable, while reliability focuses on whether it performs correctly without errors over time."
        },
        {
          id: "avail-q4",
          question: "How do two 99% available components arranged in parallel affect total availability?",
          options: ["Total availability becomes 98%", "Total availability remains 99%", "Total availability drops to 90%", "Total availability increases to 99.99%"],
          correctIndex: 3,
          explanation: "In parallel, the system only fails if both fail (0.01 * 0.01 = 0.0001 probability of failure), yielding 99.99% availability."
        },
        {
          id: "avail-q5",
          question: "Which of the following is NOT a standard practice for designing highly available systems?",
          options: ["Assuming hardware will never fail", "Multi-AZ deployment", "Graceful degradation", "Circuit breakers"],
          correctIndex: 0,
          explanation: "You must always design for failure. Assuming hardware will never fail goes against the principles of high availability."
        }
      ]
    }
  ]
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
        "A reliable system doesn't merely stay online; it does the right thing."
      ]
    },
    {
      kind: "callout",
      tone: "success",
      title: "Analogy",
      body: "A car that starts every morning and performs as expected is reliable. A car that turns on but randomly stalls is available but not very reliable."
    },
    {
      kind: "prose",
      heading: "Why Reliability Matters",
      body: [
        "Poor reliability can cause failed requests, incorrect results, data corruption, repeated retries, cascading failures, loss of user trust, and increased operational cost.",
        "Reliability is therefore broader than simply keeping a server running."
      ]
    },
    {
      kind: "prose",
      heading: "Sources of Failure",
      body: [
        "A distributed system can fail because of hardware failure, software bugs, configuration errors, resource exhaustion, network failures, dependency failures, data corruption, traffic spikes, human error, or infrastructure failures.",
        "A useful principle is: **Assume components will fail; design the system so individual failures do not become system-wide failures.**"
      ]
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
        "**Graceful Degradation:** Return a reduced experience instead of failing the entire request."
      ]
    },
    {
      kind: "reliability-diagram"
    },
    {
      kind: "prose",
      heading: "Measuring Reliability",
      body: [
        "**MTBF (Mean Time Between Failures):** For repairable systems, this is the total operating time divided by the number of failures. Higher MTBF indicates fewer failures.",
        "**MTTR (Mean Time To Repair/Recover):** Total recovery time divided by the number of failures. Lower MTTR means the system recovers faster.",
        "**Failure Rate:** Total failed operations divided by total operations."
      ]
    },
    {
      kind: "prose",
      heading: "Reliability vs. Availability",
      body: [
        "The distinction is simple: Availability asks whether the service is usable. Reliability asks how consistently it performs its intended function without failure.",
        "A service can have high availability while still producing frequent errors."
      ]
    },
    {
      kind: "takeaways",
      items: [
        "Reliability focuses on failure-free, correct operation over a period of time.",
        "Key metrics include MTBF (Mean Time Between Failures) and MTTR (Mean Time To Repair).",
        "Techniques like timeouts, circuit breakers, and retries with backoff prevent localized failures from bringing down the whole system.",
        "A system must be designed under the assumption that its underlying components will eventually fail."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "rel-q1",
          question: "What does MTTR stand for?",
          options: ["Mean Time To Respond", "Mean Time To Repair", "Maximum Time To Recover", "Minimum Time To Restart"],
          correctIndex: 1,
          explanation: "MTTR stands for Mean Time To Repair (or Recover). A lower MTTR is better."
        },
        {
          id: "rel-q2",
          question: "Why should you use exponential backoff and jitter when retrying failed requests?",
          options: ["To ensure the request reaches a different server", "To prevent a thundering herd problem that overwhelms the recovering service", "To increase the availability of the client", "To guarantee the request succeeds eventually"],
          correctIndex: 1,
          explanation: "If many clients retry simultaneously (thundering herd), they can crash a recovering service. Jitter and backoff spread out the retry load."
        },
        {
          id: "rel-q3",
          question: "What is the primary purpose of a Circuit Breaker in a distributed system?",
          options: ["To permanently disconnect faulty servers", "To temporarily stop sending requests to a failing dependency to allow it to recover", "To encrypt traffic between services", "To route traffic to the fastest server"],
          correctIndex: 1,
          explanation: "Circuit breakers prevent cascading failures by tripping when a dependency is failing, failing fast instead of waiting for timeouts."
        },
        {
          id: "rel-q4",
          question: "Which of the following describes 'Graceful Degradation'?",
          options: ["Returning a 500 Internal Server Error when a dependency is down", "Shutting down the server gracefully to avoid data loss", "Returning cached or limited data instead of failing the entire user request", "Downgrading the user's subscription plan"],
          correctIndex: 2,
          explanation: "Graceful degradation means the system continues to function with reduced capability rather than failing completely."
        },
        {
          id: "rel-q5",
          question: "If a server stays online and responds to all pings, but returns HTTP 500 errors to 50% of API requests, it is:",
          options: ["Highly available but unreliable", "Highly reliable but unavailable", "Neither available nor reliable", "Both highly available and reliable"],
          correctIndex: 0,
          explanation: "It is available (online, responding) but highly unreliable (failing to perform its intended function correctly)."
        }
      ]
    }
  ]
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
        "It is not simply 'How quickly replicas synchronize.' That is closer to replication lag or convergence time."
      ]
    },
    {
      kind: "prose",
      heading: "Why Consistency Becomes Difficult",
      body: [
        "With one database, there is one copy of the state. With replication, a write must somehow become visible across those replicas:"
      ]
    },
    {
      kind: "diagram",
      ascii: `             ┌── Replica A
             │
Client → DB ─┼── Replica B
             │
             └── Replica C`
    },
    {
      kind: "prose",
      body: [
        "This creates questions: When does a write become visible? Can a read return an older value? Must operations appear in a particular order? These are answered by consistency models."
      ]
    },
    {
      kind: "prose",
      heading: "Consistency Trade-offs",
      body: [
        "There is a spectrum between Strong Consistency and Eventual Consistency."
      ]
    },
    {
      kind: "consistency-diagram"
    },
    {
      kind: "prose",
      body: [
        "**Linearizability:** A form of strong consistency. Requires operations to appear to take effect atomically at a single point in time while respecting real-time ordering. It makes a distributed system behave as though there were one current copy of the data."
      ]
    },
    {
      kind: "prose",
      heading: "Causal Consistency",
      body: [
        "Preserves cause-and-effect relationships. If a comment depends on a post, a causally consistent system ensures the comment is not observed before the post. It is weaker than linearizability but stronger than eventual consistency."
      ]
    },
    {
      kind: "prose",
      heading: "Session Guarantees",
      body: [
        "**Read-your-writes:** After updating, subsequent reads by that user see their own update.",
        "**Monotonic reads:** Once a client sees a version, later reads won't return older versions."
      ]
    },
    {
      kind: "prose",
      heading: "Consistency Spectrum",
      body: [
        "Stronger → Linearizable → Causal → Session guarantees → Eventual → Weaker"
      ]
    },
    {
      kind: "prose",
      heading: "Choosing a Consistency Model",
      body: [
        "Ask: What happens if a client temporarily sees an older value?",
        "- Harmless (Recommendations, likes): weaker consistency.",
        "- Critical (Payments, inventory): stronger consistency."
      ]
    },
    {
      kind: "takeaways",
      items: [
        "Consistency models define the rules for what state a client can observe when reading from replicated data.",
        "Linearizability (strong consistency) provides the illusion of a single, instant copy of the data.",
        "Eventual consistency guarantees that all replicas will eventually converge if no new writes occur.",
        "Session guarantees like 'read-your-writes' provide strong user experiences without the overhead of global strong consistency."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "consist-q1",
          question: "Which consistency model provides the illusion that there is only a single copy of the data updated instantly?",
          options: ["Eventual Consistency", "Causal Consistency", "Linearizability", "Read-your-writes"],
          correctIndex: 2,
          explanation: "Linearizability (a form of strong consistency) ensures operations appear atomic and respect real-time ordering."
        },
        {
          id: "consist-q2",
          question: "What does Eventual Consistency guarantee?",
          options: ["Reads will always return the latest write", "If updates stop, all replicas will eventually converge to the same value", "Operations will be applied in causal order", "Data is never lost"],
          correctIndex: 1,
          explanation: "Eventual consistency only guarantees convergence after some unspecified amount of time."
        },
        {
          id: "consist-q3",
          question: "A user updates their profile picture and immediately reloads the page, but sees their old picture. Which consistency guarantee was violated?",
          options: ["Monotonic Reads", "Read-your-writes", "Linearizability", "Causal Consistency"],
          correctIndex: 1,
          explanation: "Read-your-writes ensures a client always sees the effects of their own recent writes."
        },
        {
          id: "consist-q4",
          question: "Which scenario heavily requires Strong Consistency?",
          options: ["Social media follower counts", "Processing a financial transaction", "Updating a product's text description", "Video view counters"],
          correctIndex: 1,
          explanation: "Financial transactions require strict correctness and cannot tolerate stale reads or divergent states."
        },
        {
          id: "consist-q5",
          question: "How is Causal Consistency different from Eventual Consistency?",
          options: ["It is exactly the same thing.", "Causal consistency ensures that operations related by cause-and-effect are observed in that exact order.", "Causal consistency requires all nodes to pause during writes.", "Causal consistency is a stronger form of Linearizability."],
          correctIndex: 1,
          explanation: "Causal consistency respects cause-and-effect (like a reply to a post), whereas eventual consistency has no strict ordering guarantees before convergence."
        }
      ]
    }
  ]
};

const capTheorem: LessonContent = {
  slug: "cap-theorem",
  title: "CAP Theorem",
  subtitle: "Understanding Consistency, Availability, and Partition Tolerance.",
  sections: [
    {
      kind: "prose",
      heading: "Why CAP Exists",
      body: [
        "Replicas need communication to coordinate. But the network can fail, causing a network partition. The nodes are still running, but cannot communicate reliably.",
        "Suppose Replica A has $150, but Replica B has $100. A request reaches B. B cannot determine if its value is current. It has to make a trade-off."
      ]
    },
    {
      kind: "prose",
      heading: "The CAP Theorem",
      body: [
        "Introduced by Eric Brewer, it states: **When a network partition occurs, a distributed system cannot simultaneously guarantee both strong consistency and availability.**",
        "- **Consistency (C):** Operations behave according to a strong consistency guarantee.",
        "- **Availability (A):** Every request to a non-failing node receives a response.",
        "- **Partition Tolerance (P):** The system operates despite communication failures."
      ]
    },
    {
      kind: "prose",
      heading: "The CAP Trade-off",
      body: [
        "It is misleading to think of CAP as simply 'pick any two'. The trade-off appears *when a partition occurs*."
      ]
    },
    {
      kind: "cap-theorem-diagram"
    },
    {
      kind: "prose",
      heading: "CP and AP",
      body: [
        "**CP (Consistency + Partition Tolerance):** Favors consistency. It may reject operations that cannot be safely coordinated (e.g., Inventory system preventing overselling). Better to reject an unsafe operation than accept an inconsistent one.",
        "**AP (Availability + Partition Tolerance):** Continues serving requests even if replicas disagree (e.g., Social counter). Better to keep serving than to stop the system. AP means accepting weaker consistency to remain available."
      ]
    },
    {
      kind: "prose",
      heading: "Why P Is Usually Assumed",
      body: [
        "Networks fail. Therefore, partition tolerance is assumed in real distributed systems. The question becomes: When a partition occurs, do we favor C or A?"
      ]
    },
    {
      kind: "callout",
      tone: "info",
      title: "CAP Analogy",
      body: "Two bank branches lose communication. A customer deposits at Branch A. Branch B receives a withdrawal request. Consistency-first (CP): 'I cannot verify the account state, so I won't process it.' Availability-first (AP): 'I'll process it using the info I currently have.'"
    },
    {
      kind: "prose",
      heading: "CAP Is Not a Database Classification",
      body: [
        "Don't just ask 'Is this database CP or AP?' A single application may use CP for payments and AP for analytics. CAP is a design constraint, not a permanent label."
      ]
    },
    {
      kind: "takeaways",
      items: [
        "The CAP theorem only forces a choice between Consistency and Availability during a Network Partition.",
        "CP systems choose to reject or block requests when safe coordination is impossible.",
        "AP systems choose to return potentially stale data rather than going offline.",
        "Partition tolerance (P) is a given in distributed systems; you must choose how to handle it."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "cap-q1",
          question: "When does the CAP theorem actually force a trade-off?",
          options: ["All the time", "Only during high traffic spikes", "Only when a network partition occurs", "Only when writing to a database"],
          correctIndex: 2,
          explanation: "The trade-off between Consistency and Availability only surfaces when nodes cannot communicate (a partition)."
        },
        {
          id: "cap-q2",
          question: "What does it mean if a system is 'CP'?",
          options: ["It is always 100% consistent and never goes down", "During a partition, it will prioritize consistency, even if it means refusing to serve some requests", "It uses Cassandra and PostgreSQL", "It prioritizes availability over consistency"],
          correctIndex: 1,
          explanation: "CP means prioritizing Consistency during a Partition, which inherently requires sacrificing Availability for affected operations."
        },
        {
          id: "cap-q3",
          question: "Why is 'CA' not a realistic classification for distributed systems over a wide area network?",
          options: ["Because consistency is impossible", "Because networks always fail eventually, so you cannot avoid Partitions", "Because availability is too expensive", "Because CA systems only support NoSQL"],
          correctIndex: 1,
          explanation: "You cannot guarantee both C and A because network failures (Partitions) are inevitable in distributed networks."
        },
        {
          id: "cap-q4",
          question: "If an e-commerce site allows users to add items to their cart even when backend inventory databases are partitioned, the cart system is leaning towards:",
          options: ["AP", "CP", "CA", "ACID"],
          correctIndex: 0,
          explanation: "It prioritizes Availability (allowing the user to proceed) over strict Consistency (knowing exactly if the item is still in stock)."
        },
        {
          id: "cap-q5",
          question: "Is a database permanently locked into being strictly CP or AP?",
          options: ["Yes, it is determined by the storage engine.", "No, real systems can configure different guarantees for different operations.", "Yes, SQL is always CP and NoSQL is always AP.", "No, but it requires rebooting the cluster to switch."],
          correctIndex: 1,
          explanation: "Many modern databases allow you to tune consistency levels per query or operation, making CAP a per-operation design constraint."
        }
      ]
    }
  ]
};

const pacelcTheorem: LessonContent = {
  slug: "pacelc-theorem",
  title: "PACELC Theorem",
  subtitle: "Trading off Latency vs Consistency during normal operations.",
  sections: [
    {
      kind: "prose",
      heading: "Why PACELC?",
      body: [
        "CAP describes the trade-off when a partition occurs. But most of the time, replicas can communicate normally. Even then, distributed systems face a trade-off.",
        "Waiting for cross-region replication improves coordination but increases latency. Acknowledging locally is faster, but replicas temporarily disagree.",
        "CAP doesn't describe this normal-operation latency trade-off. PACELC does."
      ]
    },
    {
      kind: "prose",
      heading: "What Does PACELC Mean?",
      body: [
        "If there is a Partition (P), choose between Availability (A) and Consistency (C); Else (E), choose between Latency (L) and Consistency (C)."
      ]
    },
    {
      kind: "pacelc-theorem-diagram"
    },
    {
      kind: "prose",
      heading: "The PACELC Trade-offs",
      body: [
        "**During a partition:** Consistency ↔ Availability (The CAP trade-off).",
        "**During normal operation:** Consistency ↔ Latency. Stronger consistency requires additional network round trips."
      ]
    },
    {
      kind: "prose",
      heading: "Multi-Region Example",
      body: [
        "**Stronger consistency:** Wait for remote coordination (Write → US → Europe → ACK). Result: Higher latency.",
        "**Lower latency:** Acknowledge locally (Write → US → ACK, then replicate to Europe). Result: Potential temporary divergence."
      ]
    },
    {
      kind: "prose",
      heading: "PACELC Classifications",
      body: [
        "- **PA/EL:** Prefer availability during partitions; low latency during normal operation.",
        "- **PA/EC:** Prefer availability during partitions; consistency during normal operation.",
        "- **PC/EL:** Prefer consistency during partitions; low latency during normal operation.",
        "- **PC/EC:** Prefer consistency always."
      ]
    },
    {
      kind: "table",
      caption: "CAP vs. PACELC",
      headers: ["", "CAP", "PACELC"],
      rows: [
        ["Partition", "✓", "✓"],
        ["Normal operation", "—", "✓"],
        ["Partition trade-off", "Consistency ↔ Availability", "Consistency ↔ Availability"],
        ["Normal-operation trade-off", "—", "Consistency ↔ Latency"],
        ["Main question", "What happens when replicas cannot communicate?", "What do we sacrifice during failure AND normal operation?"]
      ]
    },
    {
      kind: "diagram",
      ascii: `                  Distributed System
                         │
                 Multiple replicas
                         │
                         ▼
                 Network communication
                         │
              ┌──────────┴──────────┐
              │                     │
        Network partition       No partition
              │                     │
              ▼                     ▼
             CAP                  PACELC
              │                     │
           C ↔ A                  C ↔ L`
    },
    {
      kind: "prose",
      heading: "Final Takeaway",
      body: [
        "Availability is about serving requests.",
        "Reliability is about consistently performing the intended function.",
        "Consistency is about the guarantees clients receive when data is replicated.",
        "CAP explains the fundamental trade-off during a partition.",
        "PACELC extends that reasoning to the latency-vs-consistency trade-off during normal operation."
      ]
    },
    {
      kind: "takeaways",
      items: [
        "PACELC formally recognizes that even without network partitions, distributed systems must trade between Latency and Consistency.",
        "Synchronous multi-region replication favors Consistency (EC) but penalizes Latency.",
        "Asynchronous replication favors Latency (EL) but accepts temporary inconsistency.",
        "PACELC gives a more complete picture of system behavior than CAP alone."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "pacelc-q1",
          question: "What does the 'E' in PACELC stand for?",
          options: ["Eventual", "Else", "Error", "Encryption"],
          correctIndex: 1,
          explanation: "It stands for 'Else'—as in, if there is a partition, do X, ELSE do Y."
        },
        {
          id: "pacelc-q2",
          question: "In a PA/EL system, what does the system optimize for during normal operation (no partition)?",
          options: ["Consistency", "Latency", "Availability", "Throughput"],
          correctIndex: 1,
          explanation: "The 'EL' part means Else (during normal operation), choose Latency over strict Consistency."
        },
        {
          id: "pacelc-q3",
          question: "Why does strong consistency increase latency during normal operation?",
          options: ["Because strong consistency uses slower hard drives", "Because the system must wait for network round-trips to coordinate replicas before acknowledging the client", "Because consistency requires complex encryption algorithms", "Because it forces the system to reboot occasionally"],
          correctIndex: 1,
          explanation: "Ensuring all nodes agree requires synchronous communication, which is bound by the speed of light over network distances."
        },
        {
          id: "pacelc-q4",
          question: "If a database replicates data asynchronously to a secondary region, what PACELC characteristic is it exhibiting during normal operation?",
          options: ["EC", "EL", "PA", "PC"],
          correctIndex: 1,
          explanation: "Asynchronous replication means the client doesn't wait for the replica, prioritizing Latency (EL) over strict Consistency."
        },
        {
          id: "pacelc-q5",
          question: "How does PACELC differ from CAP?",
          options: ["PACELC is for SQL databases; CAP is for NoSQL", "PACELC proves CAP is wrong", "PACELC extends CAP by also modeling the trade-offs during healthy network conditions", "PACELC is an older, obsolete theory"],
          correctIndex: 2,
          explanation: "PACELC builds on CAP by adding the Latency vs. Consistency trade-off that occurs when the network is healthy."
        }
      ]
    }
  ]
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
