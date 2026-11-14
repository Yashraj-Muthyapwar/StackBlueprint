import type { QuizQuestion } from "@/components/lesson/Quiz";

export type AwsSection =
  | { kind: "prose"; heading: string; body: string[] }
  | { kind: "callout"; tone: "warn" | "info"; title: string; body: string }
  | { kind: "table"; caption: string; headers: string[]; rows: string[][] }
  | { kind: "visual"; id: "power-plant" | "holiday-scaling" | "car-analogy" | "workflow-compare" | "black-friday" | "restaurant" | "six-advantages" | "europe-expansion"; caption: string }
  | { kind: "list"; heading: string; lead?: string; items: string[] }
  | { kind: "takeaways"; items: string[] }
  | { kind: "quiz"; questions: QuizQuestion[] };

export type AwsLesson = {
  slug: string;
  title: string;
  subtitle: string;
  /** Empty means "Lesson Content Coming Soon" placeholder. */
  sections: AwsSection[];
};

const whatIsCloudComputing: AwsLesson = {
  slug: "what-is-cloud-computing",
  title: "What is Cloud Computing?",
  subtitle:
    "Understand what cloud computing is, why it exists, and how it differs from owning physical servers.",
  sections: [
    {
      kind: "prose",
      heading: "",
      body: [
        "**Cloud computing** means accessing **computing resources** such as **servers, storage, and databases** over the internet, **on demand**, instead of owning the **physical infrastructure**.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Not a place without servers",
      body: "The cloud is not a place without servers. It is a different way to access and manage computing resources.",
    },
    {
      kind: "prose",
      heading: "1. WHY: Owning servers is costly",
      body: [
        "Traditional infrastructure requires purchasing, maintaining, and upgrading servers.",
        "Cloud computing helps reduce upfront costs, provision resources quickly, and adjust capacity based on demand.",
      ],
    },
    {
      kind: "prose",
      heading: "2. INTUITION: Think of electricity",
      body: [
        "Think of electricity. You use electricity without owning a power plant.",
        "Similarly, AWS provides computing resources without requiring you to own a data center.",
      ],
    },
    {
      kind: "visual",
      id: "power-plant",
      caption: "Own the plant, or plug in and pay for what you use",
    },
    {
      kind: "prose",
      heading: "3. HOW: Request, provision, deploy, adjust",
      body: [
        "1. You request computing resources from AWS.",
        "2. AWS provisions them on its infrastructure.",
        "3. You deploy your application.",
        "4. You adjust or release resources when needed.",
      ],
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: A holiday sale",
      body: [
        "An online store normally needs two servers but requires ten during a holiday sale.",
        "With AWS, it can add capacity during the sale and remove the extra capacity afterward.",
      ],
    },
    {
      kind: "visual",
      id: "holiday-scaling",
      caption: "Capacity follows demand: two servers, ten servers, back to two",
    },
    {
      kind: "prose",
      heading: "5. TRADE-OFFS: What you gain and what you accept",
      body: [],
    },
    {
      kind: "table",
      caption: "Advantages and limitations",
      headers: ["Advantages", "Limitations"],
      rows: [
        ["Lower upfront costs", "Ongoing usage charges"],
        ["Flexible scaling", "Requires proper configuration"],
        ["Fast provisioning", "Cloud provider dependency"],
      ],
    },
    {
      kind: "takeaways",
      items: [
        "**Cloud computing** is on-demand access to servers, storage, and databases over the internet.",
        "The cloud still runs on physical servers. You just do not own or manage them.",
        "Like electricity, you use computing resources without owning the plant that produces them.",
        "You request, AWS provisions, you deploy, and you adjust or release resources when needed.",
        "Scaling up for a peak and back down afterward is a core benefit.",
        "The trade-offs are ongoing usage charges, proper configuration, and provider dependency.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "what-is-cloud-computing-q1",
          question: "Which statement best describes cloud computing?",
          options: [
            "Running applications without any servers existing anywhere",
            "Accessing computing resources over the internet, on demand, without owning the physical infrastructure",
            "Buying servers and housing them in your own data center",
            "Storing files on a single personal laptop",
          ],
          correctIndex: 1,
          explanation:
            "Cloud computing is on-demand access to resources over the internet. Servers still exist, but the provider owns and runs them.",
        },
        {
          id: "what-is-cloud-computing-q2",
          question:
            "An online store needs two servers normally and ten during a holiday sale. What does AWS let it do?",
          options: [
            "Buy eight permanent servers before the sale",
            "Add capacity during the sale and remove the extra capacity afterward",
            "Keep ten servers running all year to be safe",
            "Turn off the website during the sale",
          ],
          correctIndex: 1,
          explanation:
            "Capacity can be adjusted to match demand, so the store only holds extra resources while it needs them.",
        },
        {
          id: "what-is-cloud-computing-q3",
          question: "Which analogy is used to explain cloud computing?",
          options: [
            "Owning a car instead of taking a taxi",
            "Using electricity without owning a power plant",
            "Building a house from scratch",
            "Printing a book at home",
          ],
          correctIndex: 1,
          explanation:
            "You consume electricity as a service. Likewise, AWS provides computing resources without requiring you to own a data center.",
        },
        {
          id: "what-is-cloud-computing-q4",
          question: "Which of these is a limitation of cloud computing?",
          options: [
            "Lower upfront costs",
            "Fast provisioning",
            "Ongoing usage charges",
            "Flexible scaling",
          ],
          correctIndex: 2,
          explanation:
            "Lower upfront costs, fast provisioning, and flexible scaling are advantages. Ongoing usage charges are a trade-off, along with proper configuration and provider dependency.",
        },
      ],
    },
  ],
};

const traditionalItVsCloud: AwsLesson = {
  slug: "traditional-it-vs-cloud-computing",
  title: "Traditional IT vs Cloud Computing",
  subtitle:
    "Understand how traditional IT differs from cloud computing in cost, scalability, and infrastructure management.",
  sections: [
    {
      kind: "prose",
      heading: "",
      body: [
        "**Traditional IT (On-Premises):** An organization owns or directly manages physical servers, networking equipment, and storage in its own facilities or data center.",
        "**Cloud Computing:** An organization accesses computing resources from a cloud provider, such as AWS, on demand.",
      ],
    },
    { kind: "prose", heading: "1. WHY: Traditional IT has challenges", body: ["Traditional IT has several challenges:"] },
    {
      kind: "list",
      heading: "",
      items: [
        "**High upfront cost:** Purchasing servers and networking equipment.",
        "**Slow provisioning:** New hardware may take days or weeks to acquire.",
        "**Limited scalability:** Increasing capacity often requires additional hardware.",
        "**Maintenance:** The organization manages physical hardware failures and replacements.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "The cloud answer",
      body: "Cloud computing reduces these challenges by providing resources on demand.",
    },
    {
      kind: "prose",
      heading: "2. INTUITION: Buying a car vs renting a car",
      body: ["Think about transportation."],
    },
    {
      kind: "list",
      heading: "",
      items: [
        "**Traditional IT:** Buying a car. You purchase and maintain it even when you are not using it.",
        "**Cloud Computing:** Renting a car. You use it when needed and pay according to the rental agreement.",
      ],
    },
    { kind: "visual", id: "car-analogy", caption: "Own the car, or rent it only when you need it" },
    {
      kind: "callout",
      tone: "info",
      title: "The key difference",
      body: "The cloud provides flexibility without requiring you to own the underlying infrastructure.",
    },
    { kind: "prose", heading: "3. HOW: Two different workflows", body: [] },
    { kind: "visual", id: "workflow-compare", caption: "Traditional IT and Cloud Computing, step by step" },
    {
      kind: "prose",
      heading: "4. EXAMPLE: Black Friday",
      body: [
        "An e-commerce company needs additional servers during Black Friday.",
        "**Traditional IT:** The company purchases more physical servers before the sale. Afterward, those servers may remain underused.",
        "**AWS:** The company provisions additional EC2 instances during peak demand and terminates the extra instances afterward.",
      ],
    },
    { kind: "visual", id: "black-friday", caption: "Servers bought for the peak versus instances added and removed" },
    {
      kind: "prose",
      heading: "",
      body: ["This flexibility is a major reason organizations use cloud computing."],
    },
    { kind: "prose", heading: "5. TRADE-OFFS: Cost, scaling, and control", body: [] },
    {
      kind: "table",
      caption: "Traditional IT compared with the cloud",
      headers: ["Factor", "Traditional IT", "Cloud"],
      rows: [
        ["Upfront cost", "Usually high", "Usually low"],
        ["Scaling", "Hardware acquisition", "On-demand provisioning"],
        ["Hardware maintenance", "Customer", "Cloud provider"],
        ["Physical control", "Greater", "Limited"],
        ["Billing", "Hardware and operating costs", "Service-dependent usage charges"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Important",
      body: "Cloud is not always cheaper. For stable, predictable workloads, owned infrastructure can sometimes have a lower long-term cost.",
    },
    {
      kind: "takeaways",
      items: [
        "**Traditional IT** means owning or directly managing physical servers, networking equipment, and storage.",
        "**Cloud computing** means accessing resources from a provider such as AWS on demand.",
        "Traditional IT brings high upfront cost, slow provisioning, limited scalability, and hardware maintenance.",
        "Buying a car is like traditional IT. Renting a car is like the cloud.",
        "On Black Friday, AWS lets a company add EC2 instances for the peak and terminate them afterward.",
        "Cloud is not always cheaper. Stable, predictable workloads can cost less on owned infrastructure.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "traditional-it-vs-cloud-computing-q1",
          question: "Which statement describes traditional IT (on-premises)?",
          options: [
            "An organization accesses resources from a cloud provider on demand",
            "An organization owns or directly manages physical servers, networking equipment, and storage in its own facilities",
            "An organization rents virtual servers by the hour",
            "An organization has no servers at all",
          ],
          correctIndex: 1,
          explanation:
            "On-premises IT means the organization owns or directly manages the physical equipment in its own facilities or data center.",
        },
        {
          id: "traditional-it-vs-cloud-computing-q2",
          question:
            "An e-commerce company needs extra capacity for Black Friday. What can it do with AWS?",
          options: [
            "Order more physical servers weeks before the sale",
            "Provision additional EC2 instances during peak demand and terminate them afterward",
            "Keep the extra capacity running all year",
            "Move its servers to a bigger building",
          ],
          correctIndex: 1,
          explanation:
            "AWS lets the company provision additional EC2 instances for the peak and terminate the extra instances afterward.",
        },
        {
          id: "traditional-it-vs-cloud-computing-q3",
          question: "In the transportation analogy, which pair is correct?",
          options: [
            "Traditional IT is renting a car, cloud is buying a car",
            "Traditional IT is buying a car, cloud is renting a car",
            "Both are buying a car",
            "Both are renting a car",
          ],
          correctIndex: 1,
          explanation:
            "Buying means you purchase and maintain the car even when you are not using it. Renting means you use it when needed and pay according to the agreement.",
        },
        {
          id: "traditional-it-vs-cloud-computing-q4",
          question: "Which statement about cost is correct?",
          options: [
            "Cloud is always cheaper than owned infrastructure",
            "Owned infrastructure is always cheaper than the cloud",
            "Cloud is not always cheaper, and stable predictable workloads can cost less on owned infrastructure",
            "Cost does not depend on the workload",
          ],
          correctIndex: 2,
          explanation:
            "For stable, predictable workloads, owned infrastructure can sometimes have a lower long-term cost.",
        },
      ],
    },
  ],
};

const benefitsOfCloudComputing: AwsLesson = {
  slug: "benefits-of-cloud-computing",
  title: "Benefits of Cloud Computing",
  subtitle:
    "Understand the six main benefits of AWS cloud computing and explain when each benefit matters.",
  sections: [
    {
      kind: "prose",
      heading: "",
      body: [
        "**Cloud computing benefits** are the advantages organizations gain by using on-demand cloud resources instead of managing all their own physical infrastructure.",
        "AWS identifies **six main advantages** of cloud computing.",
      ],
    },
    {
      kind: "prose",
      heading: "1. WHY: Problems with traditional infrastructure",
      body: [
        "Traditional infrastructure can create problems with upfront costs, capacity planning, deployment speed, and global expansion.",
        "Cloud computing helps organizations address these problems with flexible, on-demand services.",
      ],
    },
    {
      kind: "prose",
      heading: "2. INTUITION: Opening a restaurant",
      body: [
        "Imagine opening a restaurant.",
        "With traditional IT, you build a large kitchen before knowing how many customers will arrive.",
        "With cloud computing, you can rent kitchen capacity based on demand and increase it when your restaurant becomes popular.",
      ],
    },
    { kind: "visual", id: "restaurant", caption: "Build the whole kitchen first, or rent capacity as customers arrive" },
    {
      kind: "callout",
      tone: "info",
      title: "The main idea",
      body: "The main idea is flexibility without owning all the infrastructure.",
    },
    { kind: "prose", heading: "3. HOW: Six advantages of AWS", body: [] },
    { kind: "visual", id: "six-advantages", caption: "The six advantages of cloud computing, one at a time" },
    {
      kind: "list",
      heading: "",
      items: [
        "**1. Trade fixed expenses for variable expenses:** Instead of purchasing expensive servers upfront, pay according to the cloud service's pricing model.",
        "**2. Benefit from economies of scale:** AWS operates infrastructure at a massive scale, helping it offer competitive resource pricing.",
        "**3. Stop guessing capacity:** Provision resources based on demand instead of purchasing hardware for uncertain future traffic.",
        "**4. Increase speed and agility:** Provision resources in minutes instead of waiting for physical hardware procurement.",
        "**5. Stop spending money running and maintaining data centers:** AWS operates the physical infrastructure so teams can focus more on applications and business needs.",
        "**6. Go global in minutes:** Deploy applications in AWS Regions closer to users around the world.",
      ],
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: Expanding to Europe",
      body: [
        "An e-commerce startup operates in the United States and wants to expand to Europe.",
        "With AWS, the company can:",
      ],
    },
    {
      kind: "list",
      heading: "",
      items: [
        "Deploy application infrastructure in a European AWS Region.",
        "Add computing capacity during major sales.",
        "Reduce unnecessary capacity afterward.",
        "Provision infrastructure without building a European data center.",
      ],
    },
    { kind: "visual", id: "europe-expansion", caption: "From one United States Region to a European Region that grows and shrinks" },
    {
      kind: "prose",
      heading: "",
      body: ["This demonstrates **global reach**, **elasticity**, **agility**, and **reduced infrastructure management**."],
    },
    { kind: "prose", heading: "5. TRADE-OFFS: Benefits and their limits", body: [] },
    {
      kind: "table",
      caption: "Each benefit has an important limitation",
      headers: ["Benefit", "Important limitation"],
      rows: [
        ["Usage-based pricing", "Costs can increase without monitoring"],
        ["Flexible capacity", "Scaling must be configured correctly"],
        ["Faster deployment", "Fast deployment does not guarantee correctness"],
        ["Global expansion", "More Regions can increase cost and operational complexity"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Interview takeaway",
      body: "AWS gives organizations greater flexibility, but cost optimization, security, and architecture remain important responsibilities.",
    },
    {
      kind: "takeaways",
      items: [
        "Cloud computing benefits are the advantages of using on-demand cloud resources instead of managing all your own physical infrastructure.",
        "AWS identifies six advantages: variable expense, economies of scale, no capacity guessing, speed and agility, no data center upkeep, and going global in minutes.",
        "Like renting kitchen capacity, the cloud lets you grow when demand grows instead of building everything first.",
        "An e-commerce startup can deploy in a European Region, add capacity for major sales, and reduce it afterward.",
        "Each benefit has a limit: monitor costs, configure scaling correctly, verify what you deploy, and weigh the cost of more Regions.",
        "Cost optimization, security, and architecture remain your responsibility.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "benefits-of-cloud-computing-q1",
          question:
            "A team provisions resources based on demand instead of buying hardware for uncertain future traffic. Which advantage is this?",
          options: [
            "Benefit from economies of scale",
            "Stop guessing capacity",
            "Go global in minutes",
            "Stop spending money running and maintaining data centers",
          ],
          correctIndex: 1,
          explanation:
            "Stop guessing capacity means provisioning resources based on demand rather than purchasing hardware for uncertain traffic.",
        },
        {
          id: "benefits-of-cloud-computing-q2",
          question:
            "A startup wants to serve European users by deploying applications in AWS Regions closer to them. Which advantage applies?",
          options: [
            "Trade fixed expenses for variable expenses",
            "Increase speed and agility",
            "Go global in minutes",
            "Benefit from economies of scale",
          ],
          correctIndex: 2,
          explanation:
            "Going global in minutes means deploying applications in AWS Regions closer to users around the world.",
        },
        {
          id: "benefits-of-cloud-computing-q3",
          question: "What is an important limitation of usage-based pricing?",
          options: [
            "It requires buying servers upfront",
            "Costs can increase without monitoring",
            "It prevents scaling",
            "It needs a European data center",
          ],
          correctIndex: 1,
          explanation:
            "Usage-based pricing is flexible, but costs can increase without monitoring.",
        },
        {
          id: "benefits-of-cloud-computing-q4",
          question: "Which statement about faster deployment is correct?",
          options: [
            "Fast deployment guarantees the application is correct",
            "Fast deployment removes the need for architecture and security work",
            "Fast deployment does not guarantee correctness",
            "Fast deployment is only possible with owned hardware",
          ],
          correctIndex: 2,
          explanation:
            "Provisioning quickly does not mean the result is correct. Cost optimization, security, and architecture remain important responsibilities.",
        },
      ],
    },
  ],
};

const placeholder = (slug: string, title: string, subtitle: string): AwsLesson => ({
  slug,
  title,
  subtitle,
  sections: [],
});

export const AWS_TOPICS: Record<string, { lessons: AwsLesson[] }> = {
  "introduction-to-the-cloud": {
    lessons: [
      whatIsCloudComputing,
      traditionalItVsCloud,
      benefitsOfCloudComputing,
      placeholder(
        "introduction-to-aws-global-infrastructure",
        "Introduction to AWS Global Infrastructure",
        "Coming soon.",
      ),
      placeholder(
        "the-aws-shared-responsibility-model",
        "The AWS Shared Responsibility Model",
        "Coming soon.",
      ),
      placeholder(
        "applying-cloud-concepts-to-real-life-use-cases",
        "Applying Cloud Concepts to Real Life Use Cases",
        "Coming soon.",
      ),
      placeholder(
        "module-1-mini-quiz-and-practical-challenge",
        "Module 1 Mini-Quiz and Practical Challenge",
        "Coming soon.",
      ),
      placeholder("module-1-cheat-sheet", "Module 1 Cheat Sheet", "Coming soon."),
    ],
  },
};
