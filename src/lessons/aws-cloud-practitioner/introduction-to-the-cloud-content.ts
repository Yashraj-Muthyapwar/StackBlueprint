import type { QuizQuestion } from "@/components/lesson/Quiz";

export type AwsSection =
  | { kind: "prose"; heading: string; body: string[] }
  | { kind: "callout"; tone: "warn" | "info"; title: string; body: string }
  | { kind: "table"; caption: string; headers: string[]; rows: string[][] }
  | { kind: "visual"; id: "power-plant" | "holiday-scaling" | "car-analogy" | "workflow-compare" | "black-friday"; caption: string }
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
      placeholder("benefits-of-the-aws-cloud", "Benefits of the AWS Cloud", "Coming soon."),
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
