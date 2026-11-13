import type { QuizQuestion } from "@/components/lesson/Quiz";

export type AwsSection =
  | { kind: "prose"; heading: string; body: string[] }
  | { kind: "callout"; tone: "warn" | "info"; title: string; body: string }
  | { kind: "table"; caption: string; headers: string[]; rows: string[][] }
  | { kind: "visual"; id: "power-plant" | "holiday-scaling"; caption: string }
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
