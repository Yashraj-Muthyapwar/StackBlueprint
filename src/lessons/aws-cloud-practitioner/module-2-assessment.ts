// Final assessment for Module 2: Global Infrastructure (100 points, pass at 70).
// Same shape as module-1-assessment.ts. Section A: mini-quiz. Section B: classification
// tables plus a multiple choice explanation for each. Section C: practical architecture
// challenge. Section D: interview multiple choice.

import type { ChoiceQuestion, MatchRow } from "./module-1-assessment";

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
    prompt: "Which statement best describes an AWS Region?",
    options: [
      "A single data center building",
      "A separate geographic area that contains multiple Availability Zones",
      "A cache site used to deliver content",
      "A virtual server running in one location",
    ],
    correctIndex: 1,
    explanation: "A Region is a separate geographic area. Each Region contains multiple Availability Zones.",
  },
  {
    id: "a2",
    prompt: "What is an Availability Zone?",
    options: [
      "A group of Regions in the same country",
      "One or more discrete data centers with redundant power, networking, and connectivity inside a Region",
      "A site that caches content for CloudFront",
      "A backup copy of a Region in another country",
    ],
    correctIndex: 1,
    explanation: "An Availability Zone is one or more discrete data centers inside a Region, each with redundant power, networking, and connectivity.",
  },
  {
    id: "a3",
    prompt: "What is the main job of an Edge Location?",
    options: [
      "Host your whole application as a second Region",
      "Provide fault tolerance for EC2 instances",
      "Help deliver content closer to users, for example by caching it for CloudFront",
      "Store your databases in a new country",
    ],
    correctIndex: 2,
    explanation: "Edge Locations bring content closer to users. They do not replace a Region or a Multi-AZ architecture.",
  },
  {
    id: "a4",
    prompt: "A company must keep customer data in one country. Which Region selection factor matters most?",
    options: ["Pricing", "Compliance and data residency", "The number of Edge Locations", "The age of the Region"],
    correctIndex: 1,
    explanation: "Compliance and data residency requirements can decide which Regions you are allowed to use. Latency, service availability, and pricing are weighed after that.",
  },
  {
    id: "a5",
    prompt: "An application runs in two Availability Zones in one Region. What does that design not protect against by itself?",
    options: [
      "The failure of one data center",
      "The failure of one EC2 instance",
      "A complete Region failure",
      "A single unhealthy instance",
    ],
    correctIndex: 2,
    explanation: "A Multi-AZ architecture does not automatically protect against a complete Region failure.",
  },
];

// ---------------------------------------------------------------- Section B

export const B1_ROWS: MatchRow[] = [
  {
    id: "b1a",
    prompt: "US East (N. Virginia), also called us-east-1",
    options: ["Region", "Availability Zone", "Edge Location"],
    correct: "Region",
  },
  {
    id: "b1b",
    prompt: "us-east-1a, one isolated location inside a Region",
    options: ["Region", "Availability Zone", "Edge Location"],
    correct: "Availability Zone",
  },
  {
    id: "b1c",
    prompt: "A site near Indian users that keeps cached copies of product images for CloudFront",
    options: ["Region", "Availability Zone", "Edge Location"],
    correct: "Edge Location",
  },
];

export const B1_EXPLAIN: ChoiceQuestion = {
  id: "b1x",
  prompt: "How do Regions, Availability Zones, and Edge Locations relate?",
  options: [
    "They are three names for the same thing",
    "A Region contains multiple Availability Zones, while Edge Locations are separate sites that help deliver content closer to users",
    "Edge Locations contain Regions, and Regions contain Availability Zones",
    "Availability Zones contain Regions",
  ],
  correctIndex: 1,
  explanation:
    "A Region hosts services and contains multiple Availability Zones. An Availability Zone gives fault tolerance inside a Region. An Edge Location brings content closer to users.",
};

export const B2_ROWS: MatchRow[] = [
  {
    id: "b2a",
    prompt: "One EC2 instance in one Availability Zone serves all traffic",
    options: ["Single point of failure", "Active-active", "Active-passive"],
    correct: "Single point of failure",
  },
  {
    id: "b2b",
    prompt: "Two instances in different Availability Zones both serve traffic behind a load balancer",
    options: ["Single point of failure", "Active-active", "Active-passive"],
    correct: "Active-active",
  },
  {
    id: "b2c",
    prompt: "A standby instance waits idle and takes over only if the primary instance fails",
    options: ["Single point of failure", "Active-active", "Active-passive"],
    correct: "Active-passive",
  },
];

export const B2_EXPLAIN: ChoiceQuestion = {
  id: "b2x",
  prompt: "What is the difference between high availability and fault tolerance?",
  options: [
    "They mean exactly the same thing",
    "High availability focuses on keeping downtime low, while fault tolerance focuses on continuing service despite failures, potentially without interruption",
    "High availability needs one instance and fault tolerance needs many",
    "Fault tolerance allows downtime and high availability does not",
  ],
  correctIndex: 1,
  explanation:
    "High availability keeps downtime low. Fault tolerance continues service despite failures, potentially without interruption.",
};

// ---------------------------------------------------------------- Section C

export const C_SCENARIO =
  "A start-up runs an online ticket shop for customers in Europe. Its legal team requires that customer data stays in Europe. The shop must keep working if one data center fails, and product images must load quickly for visitors in other continents. Make the eight decisions below.";

const REGIONS = ["Europe (Frankfurt)", "US East (N. Virginia)", "Asia Pacific (Mumbai)"];
const FACTORS = ["Compliance and data residency", "Latency", "Service availability", "Pricing"];
const PLACEMENT = [
  "Two instances in the same Availability Zone",
  "Two instances in different Availability Zones",
  "One large instance in one Availability Zone",
];
const SERVICES = ["Elastic Load Balancing", "Amazon CloudFront", "Amazon EC2 Auto Scaling", "Amazon S3"];

export const C_ROWS: MatchRow[] = [
  { id: "c-region", prompt: "Which Region should host the shop?", options: REGIONS, correct: "Europe (Frankfurt)" },
  { id: "c-factor", prompt: "Which Region selection factor decides this choice?", options: FACTORS, correct: "Compliance and data residency" },
  { id: "c-az", prompt: "How should the two web servers be placed so one data center failure does not stop the shop?", options: PLACEMENT, correct: "Two instances in different Availability Zones" },
  { id: "c-elb", prompt: "Which service spreads traffic across the healthy instances?", options: SERVICES, correct: "Elastic Load Balancing" },
  { id: "c-asg", prompt: "Which service launches a replacement when an instance fails?", options: SERVICES, correct: "Amazon EC2 Auto Scaling" },
  { id: "c-cf", prompt: "Which service caches product images at Edge Locations close to visitors?", options: SERVICES, correct: "Amazon CloudFront" },
  { id: "c-s3", prompt: "Which service stores the original product images that CloudFront reads from?", options: SERVICES, correct: "Amazon S3" },
  {
    id: "c-region-fail",
    prompt: "An entire Region becomes unavailable. Is a Multi-AZ design in that one Region enough on its own?",
    options: [
      "Yes, Multi-AZ also protects against a Region failure",
      "No, Multi-AZ does not automatically protect against a complete Region failure",
      "Yes, Edge Locations take over the whole application",
    ],
    correct: "No, Multi-AZ does not automatically protect against a complete Region failure",
  },
];

// ---------------------------------------------------------------- Section D

export const SECTION_D: ChoiceQuestion[] = [
  {
    id: "d1",
    points: 5,
    prompt: "Interviewer: What is the difference between a Region and an Availability Zone?",
    options: [
      "They are the same thing",
      "A Region is a geographic area, and an Availability Zone is one or more discrete data centers inside it",
      "An Availability Zone is larger than a Region",
      "A Region is a single data center",
    ],
    correctIndex: 1,
    explanation: "A Region is a geographic area that contains multiple Availability Zones. Each Availability Zone is one or more discrete data centers.",
  },
  {
    id: "d2",
    points: 5,
    prompt: "Interviewer: How do you choose a Region for a workload?",
    options: [
      "Always pick the cheapest Region",
      "Always pick the Region closest to the office",
      "Weigh compliance and data residency, latency to users, service availability, and pricing",
      "Pick any Region, because they are all identical",
    ],
    correctIndex: 2,
    explanation: "Region choice weighs compliance and data residency, latency, service availability, and pricing.",
  },
  {
    id: "d3",
    points: 5,
    prompt: "Interviewer: Is adding a second EC2 instance enough to make an application highly available?",
    options: [
      "Yes, redundancy alone is always sufficient",
      "No. The instances should be in different Availability Zones, with a load balancer, health checks, and enough healthy capacity",
      "Yes, as long as both are in the same Availability Zone",
      "No, only a second Region can ever help",
    ],
    correctIndex: 1,
    explanation: "Redundancy alone is not sufficient. High availability also needs separate Availability Zones, traffic distribution, health checks, and sufficient healthy capacity.",
  },
  {
    id: "d4",
    points: 5,
    prompt: "Interviewer: What do Edge Locations do, and what do they not do?",
    options: [
      "They run your whole application like a second Region",
      "They replace Multi-AZ architecture",
      "They help deliver content closer to users and reduce latency, but do not replace Multi-AZ architecture",
      "They store every database backup",
    ],
    correctIndex: 2,
    explanation: "Edge Locations do not automatically replicate your entire application or replace Multi-AZ architecture. They help deliver content closer to users.",
  },
];
