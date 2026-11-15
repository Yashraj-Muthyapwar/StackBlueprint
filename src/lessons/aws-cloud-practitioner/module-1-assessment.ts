// Final assessment for Module 1: Introduction to the Cloud (100 points, pass at 70).
// Every part is auto-graded. Section A: mini-quiz. Section B: classification tables plus a
// multiple choice explanation for each. Section C: practical architecture challenge.
// Section D: interview multiple choice.

export type ChoiceQuestion = {
  id: string;
  points?: number;
  prompt: string;
  code?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type MatchRow = { id: string; prompt: string; options: string[]; correct: string };

export const POINTS = {
  choice: 4,
  matchValue: 2,
  designValue: 5,
  passScore: 70,
  total: 100,
} as const;

// ---------------------------------------------------------------- Section A

export const SECTION_A: ChoiceQuestion[] = [
  {
    id: "a1",
    prompt: "Which statement best describes cloud computing?",
    options: [
      "Running applications with no servers existing anywhere",
      "Accessing computing resources over the internet, on demand, without owning the physical infrastructure",
      "Buying servers and housing them in your own data center",
      "Storing every file on a single personal laptop",
    ],
    correctIndex: 1,
    explanation:
      "Cloud computing is on-demand access to resources over the internet. Servers still exist, but the provider owns and runs them.",
  },
  {
    id: "a2",
    prompt:
      "An e-commerce company needs extra servers for Black Friday. Which approach matches how AWS works?",
    options: [
      "Order physical servers weeks before the sale and keep them afterward",
      "Provision additional EC2 instances during peak demand and terminate the extra instances afterward",
      "Keep the peak capacity running all year",
      "Turn the website off during the sale",
    ],
    correctIndex: 1,
    explanation: "AWS lets the company add EC2 instances for the peak and terminate them afterward.",
  },
  {
    id: "a3",
    prompt:
      "A team provisions resources in minutes instead of waiting for physical hardware to be purchased and delivered. Which AWS advantage is this?",
    options: [
      "Benefit from economies of scale",
      "Increase speed and agility",
      "Go global in minutes",
      "Trade fixed expenses for variable expenses",
    ],
    correctIndex: 1,
    explanation:
      "Increase speed and agility means provisioning resources in minutes instead of waiting for physical hardware procurement.",
  },
  {
    id: "a4",
    prompt: "Which statement about cost is correct?",
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
  {
    id: "a5",
    prompt: "In a public cloud, which statement about customers is correct?",
    options: [
      "Customers can access one another's resources",
      "Each customer gets its own physical data center",
      "Multiple customers use provider infrastructure, and the provider uses isolation controls between them",
      "Public cloud is only for software, never for servers",
    ],
    correctIndex: 2,
    explanation:
      "Public cloud infrastructure is offered to multiple customers. The apartment analogy does not mean they can access one another's resources, because providers use isolation controls.",
  },
];

// ---------------------------------------------------------------- Section B

export const B1_ROWS: MatchRow[] = [
  {
    id: "b1a",
    prompt: "Amazon EC2: you configure the server, the OS, and the application",
    options: ["IaaS", "PaaS", "SaaS"],
    correct: "IaaS",
  },
  {
    id: "b1b",
    prompt: "AWS Elastic Beanstalk: you provide application code and configure the environment",
    options: ["IaaS", "PaaS", "SaaS"],
    correct: "PaaS",
  },
  {
    id: "b1c",
    prompt: "Google Workspace: you use and configure an existing application",
    options: ["IaaS", "PaaS", "SaaS"],
    correct: "SaaS",
  },
];

export const B1_EXPLAIN: ChoiceQuestion = {
  id: "b1x",
  prompt: "What changes as you move from IaaS to PaaS to SaaS?",
  options: [
    "The customer manages more of the infrastructure each time",
    "The customer generally manages less of the infrastructure each time",
    "The provider stops managing the physical infrastructure",
    "Nothing changes. The three models divide responsibility the same way",
  ],
  correctIndex: 1,
  explanation:
    "Moving from IaaS to SaaS generally means less infrastructure management for the customer. In every model the provider manages the physical infrastructure, and customers always keep some security and data responsibilities.",
};

export const B2_ROWS: MatchRow[] = [
  {
    id: "b2a",
    prompt: "Infrastructure operated by a cloud provider and offered to multiple customers",
    options: ["Public cloud", "Private cloud", "Hybrid cloud"],
    correct: "Public cloud",
  },
  {
    id: "b2b",
    prompt: "Cloud infrastructure dedicated to one organization",
    options: ["Public cloud", "Private cloud", "Hybrid cloud"],
    correct: "Private cloud",
  },
  {
    id: "b2c",
    prompt: "A bank connects its own data center to AWS through a VPN",
    options: ["Public cloud", "Private cloud", "Hybrid cloud"],
    correct: "Hybrid cloud",
  },
];

export const B2_EXPLAIN: ChoiceQuestion = {
  id: "b2x",
  prompt: "How do deployment models relate to service models?",
  options: [
    "They are the same thing with different names",
    "Deployment models are different from service models: one says where infrastructure operates, the other says who manages what",
    "Public cloud is a service model and SaaS is a deployment model",
    "Hybrid cloud is a type of SaaS",
  ],
  correctIndex: 1,
  explanation:
    "Deployment models (public, private, hybrid) describe where cloud infrastructure operates and how it is made available. Service models (IaaS, PaaS, SaaS) describe how much the provider and customer each manage.",
};

// ---------------------------------------------------------------- Section C

export const C_SCENARIO =
  "A start-up sells handmade furniture online. It runs in the United States, wants to open in Europe, and has no data center. It expects traffic spikes during sales and will not buy hardware for them. Make the eight decisions below.";

const ADVANTAGES = [
  "Trade fixed expenses for variable expenses",
  "Benefit from economies of scale",
  "Stop guessing capacity",
  "Increase speed and agility",
  "Stop spending money running and maintaining data centers",
  "Go global in minutes",
];
const SERVICES = ["Amazon EC2", "Amazon S3", "Amazon RDS", "Amazon VPC", "AWS IAM", "Amazon CloudWatch"];

export const C_ROWS: MatchRow[] = [
  { id: "c-global", prompt: "Which AWS advantage lets the shop deploy close to European customers?", options: ADVANTAGES, correct: "Go global in minutes" },
  { id: "c-capacity", prompt: "Which advantage handles sale-day traffic spikes without buying hardware for uncertain demand?", options: ADVANTAGES, correct: "Stop guessing capacity" },
  { id: "ec2", prompt: "Which service runs the shop application on virtual servers?", options: SERVICES, correct: "Amazon EC2" },
  { id: "rds", prompt: "Which service stores orders and customer records in a managed relational database?", options: SERVICES, correct: "Amazon RDS" },
  { id: "s3", prompt: "Which service stores the product images?", options: SERVICES, correct: "Amazon S3" },
  { id: "cw", prompt: "Which service monitors resources and the application?", options: SERVICES, correct: "Amazon CloudWatch" },
  { id: "saas", prompt: "The team subscribes to ready-to-use accounting software. Which service model is this?", options: ["IaaS", "PaaS", "SaaS"], correct: "SaaS" },
  { id: "hybrid", prompt: "The shop keeps a legacy inventory system on a server in its own warehouse and uses AWS for the web shop, connected securely. Which deployment model is this?", options: ["Public cloud", "Private cloud", "Hybrid cloud"], correct: "Hybrid cloud" },
];

// ---------------------------------------------------------------- Section D

export const SECTION_D: ChoiceQuestion[] = [
  {
    id: "d1",
    points: 5,
    prompt: "Interviewer: What is the main difference between IaaS, PaaS, and SaaS?",
    options: [
      "Where the provider's data centers are located",
      "The division of management responsibilities between the customer and the provider",
      "Whether the service runs on AWS or another provider",
      "How many customers share the infrastructure",
    ],
    correctIndex: 1,
    explanation: "The main difference is the division of management responsibilities between the customer and provider.",
  },
  {
    id: "d2",
    points: 5,
    prompt: "Interviewer: Is moving to the cloud always cheaper?",
    options: [
      "Yes, because you never pay for hardware",
      "No. Costs can increase without monitoring, and stable predictable workloads can cost less on owned infrastructure",
      "Yes, because usage-based pricing is always lower",
      "No, because the cloud has no pricing model",
    ],
    correctIndex: 1,
    explanation:
      "Usage-based pricing is flexible, but costs can increase without monitoring. Stable, predictable workloads can sometimes cost less on owned infrastructure.",
  },
  {
    id: "d3",
    points: 5,
    prompt: "Interviewer: How do you choose between public, private, and hybrid cloud?",
    options: [
      "Always choose public cloud because it is cheapest",
      "Always choose private cloud because it is most secure",
      "Choose based on workload requirements, not the assumption that one model is always cheaper or more secure",
      "Always choose hybrid cloud",
    ],
    correctIndex: 2,
    explanation: "Choose a deployment model based on workload requirements, not the assumption that one model is always cheaper or more secure.",
  },
  {
    id: "d4",
    points: 5,
    prompt: "Interviewer: How would you describe AWS?",
    options: [
      "A single service for running virtual servers",
      "A storage product",
      "A collection of cloud services used together to build and operate applications",
      "A tool that removes all security responsibility",
    ],
    correctIndex: 2,
    explanation: "AWS is not a single service. It is a collection of cloud services used together, and security remains a shared responsibility.",
  },
];
