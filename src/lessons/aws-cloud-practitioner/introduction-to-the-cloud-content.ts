import type { QuizQuestion } from "@/components/lesson/Quiz";

export type AwsSection =
  | { kind: "prose"; heading: string; body: string[] }
  | { kind: "callout"; tone: "warn" | "info"; title: string; body: string }
  | { kind: "table"; caption: string; headers: string[]; rows: string[][] }
  | { kind: "visual"; id: "power-plant" | "holiday-scaling" | "car-analogy" | "workflow-compare" | "black-friday" | "restaurant" | "six-advantages" | "europe-expansion" | "food-models" | "responsibility-stack" | "python-app-models" | "housing-models" | "deployment-models" | "bank-hybrid" | "aws-toolbox" | "aws-services" | "shopping-architecture" | "hotel-chain" | "region-deploy" | "mumbai-ireland" | "hospital-az" | "az-how" | "multi-az-example"; caption: string }
  | { kind: "list"; heading: string; lead?: string; items: string[] }
  | { kind: "takeaways"; items: string[] }
  | { kind: "assessment"; assessmentId: "module-1" }
  | { kind: "cheatsheet"; cheatsheetId: "module-1" }
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

const iaasPaasSaas: AwsLesson = {
  slug: "iaas-vs-paas-vs-saas",
  title: "IaaS vs PaaS vs SaaS",
  subtitle: "Understand the three cloud service models, what you manage in each model, and when to choose them.",
  sections: [
    {
      kind: "prose",
      heading: "",
      body: [
        "**Cloud service models** describe how much infrastructure the cloud provider manages and how much the customer manages.",
      ],
    },
    {
      kind: "table",
      caption: "The three cloud service models",
      headers: ["Model", "Full form", "What you get"],
      rows: [
        ["IaaS", "Infrastructure as a Service", "Virtual servers, storage, and networking"],
        ["PaaS", "Platform as a Service", "A managed platform to build and run applications"],
        ["SaaS", "Software as a Service", "Ready-to-use software"],
      ],
    },
    {
      kind: "prose",
      heading: "1. WHY: Choosing your level of control",
      body: [
        "Not every company wants to manage servers, operating systems, databases, and applications.",
        "These models let organizations choose their level of control and operational responsibility.",
      ],
    },
    {
      kind: "list",
      heading: "",
      items: [
        "**IaaS:** More control, more management.",
        "**PaaS:** Focus more on application development.",
        "**SaaS:** Use software without building or operating it.",
      ],
    },
    {
      kind: "prose",
      heading: "2. INTUITION: Getting food",
      body: ["Think about getting food."],
    },
    {
      kind: "list",
      heading: "",
      items: [
        "**IaaS, rent a kitchen:** You get the infrastructure but prepare the meal yourself.",
        "**PaaS, meal kit service:** Much of the preparation is handled, but you still create the meal.",
        "**SaaS, restaurant:** You receive a finished meal.",
      ],
    },
    { kind: "visual", id: "food-models", caption: "Rent a kitchen, order a meal kit, or eat at a restaurant" },
    {
      kind: "callout",
      tone: "info",
      title: "Remember",
      body: "Moving from IaaS to SaaS generally means less infrastructure management for the customer.",
    },
    { kind: "prose", heading: "3. HOW: Who manages what?", body: [] },
    { kind: "visual", id: "responsibility-stack", caption: "Customer-managed and provider-managed layers in each model" },
    {
      kind: "callout",
      tone: "warn",
      title: "A simplified model",
      body: "Exact responsibilities vary by service. Customers always retain some security and data responsibilities.",
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: Deploying a Python web application",
      body: ["Suppose you want to deploy a Python web application."],
    },
    {
      kind: "table",
      caption: "One goal, three service models",
      headers: ["Model", "Example", "Your responsibility"],
      rows: [
        ["IaaS", "Amazon EC2", "Configure the server, OS, and application"],
        ["PaaS", "AWS Elastic Beanstalk", "Provide application code and configure the environment"],
        ["SaaS", "Google Workspace", "Use and configure an existing application"],
      ],
    },
    { kind: "visual", id: "python-app-models", caption: "Amazon EC2, AWS Elastic Beanstalk, and Google Workspace compared" },
    {
      kind: "prose",
      heading: "",
      body: [
        "AWS Elastic Beanstalk is a PaaS-like service that helps deploy and manage web applications. SaaS is different: you use finished software rather than deploy your own code into it.",
      ],
    },
    { kind: "prose", heading: "5. TRADE-OFFS: Control versus convenience", body: [] },
    {
      kind: "table",
      caption: "Each model trades control for convenience",
      headers: ["Model", "Main advantage", "Main limitation"],
      rows: [
        ["IaaS", "Greater control", "More operational work"],
        ["PaaS", "Faster application development", "Less control over underlying infrastructure"],
        ["SaaS", "Minimal setup", "Limited customization"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Interview takeaway",
      body: "The main difference is the division of management responsibilities between the customer and provider.",
    },
    {
      kind: "takeaways",
      items: [
        "Cloud service models describe how much infrastructure the provider manages and how much the customer manages.",
        "IaaS gives virtual servers, storage, and networking. PaaS gives a managed platform to build and run applications. SaaS gives ready-to-use software.",
        "Rent a kitchen, meal kit, restaurant: moving from IaaS to SaaS generally means less infrastructure management for the customer.",
        "In IaaS the customer manages the application and runtime / OS. In PaaS the customer manages the application. In SaaS the provider manages all three layers.",
        "Amazon EC2 is IaaS, AWS Elastic Beanstalk is PaaS-like, and Google Workspace is SaaS.",
        "IaaS means greater control but more work, PaaS means faster development but less control, and SaaS means minimal setup but limited customization.",
        "Customers always retain some security and data responsibilities.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "iaas-vs-paas-vs-saas-q1",
          question:
            "A team wants to focus on application development and leave the runtime and OS to the provider. Which model fits best?",
          options: ["IaaS", "PaaS", "SaaS", "On-premises"],
          correctIndex: 1,
          explanation:
            "In PaaS the customer manages the application, while the provider manages the runtime / OS and the physical infrastructure.",
        },
        {
          id: "iaas-vs-paas-vs-saas-q2",
          question: "In the food analogy, which model is the restaurant?",
          options: ["IaaS", "PaaS", "SaaS", "None of them"],
          correctIndex: 2,
          explanation:
            "SaaS is like a restaurant: you receive a finished meal, just as you use finished software without building or operating it.",
        },
        {
          id: "iaas-vs-paas-vs-saas-q3",
          question: "Which service is an example of IaaS?",
          options: ["Google Workspace", "AWS Elastic Beanstalk", "Amazon EC2", "None of these"],
          correctIndex: 2,
          explanation:
            "With Amazon EC2 you configure the server, the OS, and the application, which is the IaaS level of control.",
        },
        {
          id: "iaas-vs-paas-vs-saas-q4",
          question: "What is the main limitation of SaaS?",
          options: [
            "More operational work",
            "Less control over underlying infrastructure",
            "Limited customization",
            "You must configure the OS",
          ],
          correctIndex: 2,
          explanation:
            "SaaS needs minimal setup, but customization is limited. More operational work is the limitation of IaaS.",
        },
      ],
    },
  ],
};

const publicPrivateHybrid: AwsLesson = {
  slug: "public-private-and-hybrid-cloud",
  title: "Public, Private, and Hybrid Cloud",
  subtitle: "Understand the three cloud deployment models, their differences, and when to use each.",
  sections: [
    {
      kind: "prose",
      heading: "",
      body: [
        "A **cloud deployment model** describes where cloud infrastructure operates and how it is made available to an organization.",
      ],
    },
    {
      kind: "table",
      caption: "The three cloud deployment models",
      headers: ["Model", "Definition"],
      rows: [
        ["Public Cloud", "Infrastructure operated by a cloud provider and offered to multiple customers"],
        ["Private Cloud", "Cloud infrastructure dedicated to one organization"],
        ["Hybrid Cloud", "A combination of private/on-premises infrastructure and public cloud services"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Important",
      body: "Deployment models are different from service models (IaaS, PaaS, SaaS).",
    },
    {
      kind: "prose",
      heading: "1. WHY: Different requirements",
      body: ["Organizations have different requirements for security, control, costs, and existing infrastructure."],
    },
    {
      kind: "list",
      heading: "",
      items: [
        "**Public:** Useful for fast provisioning and flexible capacity.",
        "**Private:** Useful when dedicated infrastructure and greater control are required.",
        "**Hybrid:** Useful when organizations need to combine existing systems with public cloud services.",
      ],
    },
    { kind: "prose", heading: "2. INTUITION: Housing", body: ["Think about housing."] },
    {
      kind: "list",
      heading: "",
      items: [
        "**Public Cloud:** An apartment building. Different tenants use separate spaces within shared infrastructure.",
        "**Private Cloud:** A private house dedicated to one household.",
        "**Hybrid Cloud:** A private house plus rented space used when additional capacity is needed.",
      ],
    },
    { kind: "visual", id: "housing-models", caption: "An apartment building, a private house, or a house plus rented space" },
    {
      kind: "callout",
      tone: "warn",
      title: "Where the analogy stops",
      body: "The apartment analogy does not mean public cloud customers can access one another's resources. Cloud providers use isolation controls.",
    },
    { kind: "prose", heading: "3. HOW: The three models", body: [] },
    { kind: "visual", id: "deployment-models", caption: "Public, private, and hybrid cloud, side by side" },
    {
      kind: "list",
      heading: "",
      items: [
        "**Public:** Provider infrastructure, multiple isolated customers.",
        "**Private:** Dedicated infrastructure, one organization.",
        "**Hybrid:** Connected private and public environments.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Private cloud is not a server room",
      body: "A private cloud is not simply any traditional server room. It uses cloud-like features such as resource pooling, automation, and self-service provisioning.",
    },
    {
      kind: "prose", heading: "4. EXAMPLE: A bank with a hybrid cloud", body: [
        "A bank operates a sensitive legacy application in its private data center but uses AWS for customer-facing web applications.",
        "It securely connects both environments through a VPN or a dedicated network connection.",
      ]
    },
    { kind: "visual", id: "bank-hybrid", caption: "A private data center connected to AWS" },
    {
      kind: "prose",
      heading: "",
      body: ["This is an example of a **hybrid cloud** architecture."],
    },
    { kind: "prose", heading: "5. TRADE-OFFS: Choosing a model", body: [] },
    {
      kind: "table",
      caption: "Each deployment model has a limitation",
      headers: ["Model", "Advantage", "Limitation"],
      rows: [
        ["Public", "Fast provisioning, flexible capacity", "Less physical infrastructure control"],
        ["Private", "Dedicated resources and greater control", "Higher management burden"],
        ["Hybrid", "Combines existing systems with cloud services", "More networking and operational complexity"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Interview takeaway",
      body: "Choose a deployment model based on workload requirements, not the assumption that one model is always cheaper or more secure.",
    },
    {
      kind: "takeaways",
      items: [
        "A cloud deployment model describes where cloud infrastructure operates and how it is made available to an organization.",
        "Public cloud is provider infrastructure offered to multiple isolated customers, private cloud is dedicated to one organization, and hybrid cloud combines private/on-premises infrastructure with public cloud services.",
        "Deployment models are different from service models (IaaS, PaaS, SaaS).",
        "Apartment, house, house plus rented space: customers of a public cloud cannot access one another's resources because providers use isolation controls.",
        "A private cloud is not just a server room. It uses resource pooling, automation, and self-service provisioning.",
        "A bank that keeps a legacy application in its private data center and uses AWS for web applications, connected by VPN or a dedicated connection, runs a hybrid cloud.",
        "Choose based on workload requirements, not the assumption that one model is always cheaper or more secure.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "public-private-and-hybrid-cloud-q1",
          question:
            "A bank keeps a sensitive legacy application in its own data center and runs customer-facing web apps on AWS, connected by VPN. Which deployment model is this?",
          options: ["Public cloud", "Private cloud", "Hybrid cloud", "SaaS"],
          correctIndex: 2,
          explanation:
            "Combining private/on-premises infrastructure with public cloud services is a hybrid cloud architecture.",
        },
        {
          id: "public-private-and-hybrid-cloud-q2",
          question: "Which statement about the apartment analogy for public cloud is correct?",
          options: [
            "Customers can access one another's resources",
            "Tenants use separate spaces within shared infrastructure, with isolation controls",
            "Every customer gets dedicated hardware",
            "The provider has no isolation controls",
          ],
          correctIndex: 1,
          explanation:
            "Public cloud customers share infrastructure, but providers use isolation controls so they cannot access one another's resources.",
        },
        {
          id: "public-private-and-hybrid-cloud-q3",
          question: "What is the main limitation of a private cloud?",
          options: [
            "Less physical infrastructure control",
            "Higher management burden",
            "More networking complexity than any other model",
            "It cannot use automation",
          ],
          correctIndex: 1,
          explanation:
            "Private cloud offers dedicated resources and greater control, but with a higher management burden.",
        },
        {
          id: "public-private-and-hybrid-cloud-q4",
          question: "Which is the best way to choose a deployment model?",
          options: [
            "Always pick public cloud because it is cheaper",
            "Always pick private cloud because it is more secure",
            "Base it on workload requirements",
            "Always pick hybrid cloud",
          ],
          correctIndex: 2,
          explanation:
            "No model is always cheaper or more secure. Choose based on workload requirements.",
        },
      ],
    },
  ],
};

const introToAws: AwsLesson = {
  slug: "introduction-to-amazon-web-services-aws",
  title: "Introduction to Amazon Web Services (AWS)",
  subtitle: "Understand what AWS is, how its services work together, and how organizations use AWS to build applications.",
  sections: [
    {
      kind: "prose",
      heading: "",
      body: [
        "**Amazon Web Services (AWS)** is a cloud computing platform that provides on-demand services for computing, storage, networking, databases, security, and more.",
        "Instead of purchasing physical infrastructure, organizations can provision AWS resources as needed.",
      ],
    },
    {
      kind: "prose",
      heading: "1. WHY: What AWS helps organizations do",
      body: ["AWS helps organizations:"],
    },
    {
      kind: "list",
      heading: "",
      items: [
        "Deploy applications without building their own data centers.",
        "Scale infrastructure based on demand.",
        "Access managed services for common technical needs.",
        "Build applications across different geographic locations.",
      ],
    },
    {
      kind: "prose",
      heading: "2. INTUITION: A toolbox",
      body: [
        "Think of AWS as a **toolbox** for building software applications.",
        "Each tool solves a different problem.",
        "For example, you would not use a storage service to perform the same job as a virtual server.",
      ],
    },
    { kind: "visual", id: "aws-toolbox", caption: "A toolbox of services, and choosing the right tool for the job" },
    {
      kind: "prose",
      heading: "3. HOW: Using AWS services",
      body: [
        "AWS provides services through the **AWS Management Console**, **Command Line Interface (CLI)**, **APIs**, and **infrastructure-as-code** tools.",
        "Some foundational services are Amazon EC2, Amazon S3, Amazon RDS, Amazon VPC, AWS IAM, and Amazon CloudWatch.",
      ],
    },
    { kind: "visual", id: "aws-services", caption: "Ways to use AWS, and the foundational services you choose from" },
    {
      kind: "prose",
      heading: "",
      body: ["You select and configure these services based on your application's requirements."],
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: An online shopping application",
      body: ["Suppose you are building an online shopping application."],
    },
    { kind: "visual", id: "shopping-architecture", caption: "Customers, Amazon EC2, Amazon RDS, and Amazon S3 working together" },
    {
      kind: "callout",
      tone: "info",
      title: "Simplified architecture",
      body: "A production application also needs networking, security, and other configurations.",
    },
    {
      kind: "prose",
      heading: "",
      body: ["These AWS services work together to support a single application."],
    },
    { kind: "prose", heading: "5. TRADE-OFFS: Choice and responsibility", body: [] },
    {
      kind: "table",
      caption: "Each advantage comes with a limitation",
      headers: ["Advantage", "Limitation"],
      rows: [
        ["Many managed services", "Choosing services can be complex"],
        ["Flexible infrastructure", "Poor configuration can increase costs"],
        ["Fast provisioning", "Security remains a shared responsibility"],
        ["Integrated AWS ecosystem", "Some designs create vendor lock-in"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Interview takeaway",
      body: "AWS is not a single service. It is a collection of cloud services used together to build and operate applications.",
    },
    {
      kind: "takeaways",
      items: [
        "AWS is a cloud computing platform that provides on-demand services for computing, storage, networking, databases, security, and more.",
        "It helps organizations deploy without their own data centers, scale with demand, use managed services, and build across geographic locations.",
        "AWS is like a toolbox: each service solves a different problem, so match the service to the job.",
        "You use AWS through the Management Console, CLI, APIs, and infrastructure-as-code tools.",
        "Foundational services: EC2 runs applications, S3 stores files, RDS runs managed relational databases, VPC creates isolated networks, IAM manages access, and CloudWatch monitors.",
        "An online shop might use EC2 for the application, RDS for orders and customer records, and S3 for product images.",
        "AWS is not a single service. It is a collection of services used together, and security remains a shared responsibility.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "introduction-to-amazon-web-services-aws-q1",
          question: "Which service would you use to store product images for a shopping application?",
          options: ["Amazon EC2", "Amazon S3", "Amazon RDS", "AWS IAM"],
          correctIndex: 1,
          explanation: "Amazon S3 stores files and objects, such as product images.",
        },
        {
          id: "introduction-to-amazon-web-services-aws-q2",
          question: "What is the primary purpose of Amazon RDS?",
          options: [
            "Run applications on virtual servers",
            "Monitor resources and applications",
            "Run managed relational databases",
            "Create logically isolated cloud networks",
          ],
          correctIndex: 2,
          explanation: "Amazon RDS runs managed relational databases, for example storing orders and customer records.",
        },
        {
          id: "introduction-to-amazon-web-services-aws-q3",
          question: "Which is NOT one of the ways AWS provides its services?",
          options: [
            "AWS Management Console",
            "Command Line Interface (CLI)",
            "Physical servers delivered to your office",
            "Infrastructure-as-code tools",
          ],
          correctIndex: 2,
          explanation: "AWS provides services through the Management Console, CLI, APIs, and infrastructure-as-code tools.",
        },
        {
          id: "introduction-to-amazon-web-services-aws-q4",
          question: "What best describes AWS?",
          options: [
            "A single service for running virtual servers",
            "A collection of cloud services used together to build and operate applications",
            "A tool that removes all security responsibility",
            "A storage service",
          ],
          correctIndex: 1,
          explanation: "AWS is not a single service. It is a collection of cloud services, and security remains a shared responsibility.",
        },
      ],
    },
  ],
};

const module1FinalQuiz: AwsLesson = {
  slug: "module-1-final-quiz",
  title: "Module 1 Final Quiz",
  subtitle: "Test your knowledge of cloud computing, service and deployment models, and the core AWS services.",
  sections: [{ kind: "assessment", assessmentId: "module-1" }],
};

const module1CheatSheet: AwsLesson = {
  slug: "module-1-cheat-sheet",
  title: "Module 1 Cheat Sheet",
  subtitle: "One page reference for cloud basics, the six AWS advantages, service and deployment models, and core services.",
  sections: [{ kind: "cheatsheet", cheatsheetId: "module-1" }],
};

const awsRegions: AwsLesson = {
  slug: "aws-regions",
  title: "AWS Regions",
  subtitle: "Understand what an AWS Region is, why it matters, and how to choose the right Region for an application.",
  sections: [
    {
      kind: "prose",
      heading: "",
      body: [
        "An **AWS Region** is a **separate geographic area** where AWS operates **cloud infrastructure**.",
        "Each Region contains multiple **isolated locations** called `Availability Zones (AZs)`.",
      ],
    },
    {
      kind: "table",
      caption: "Examples of AWS Regions",
      headers: ["AWS Region", "Region code"],
      rows: [
        ["US East (N. Virginia)", "us-east-1"],
        ["US East (Ohio)", "us-east-2"],
        ["Europe (Ireland)", "eu-west-1"],
        ["Asia Pacific (Mumbai)", "ap-south-1"],
      ],
    },
    {
      kind: "prose",
      heading: "1. WHY: Customers are in different places",
      body: [
        "Companies have customers in different locations.",
        "Deploying an application closer to its users can reduce network latency. Choosing the correct Region can also help meet legal requirements and control costs.",
      ],
    },
    {
      kind: "prose",
      heading: "2. INTUITION: A hotel chain",
      body: ["Think of AWS as a **hotel chain**."],
    },
    {
      kind: "list",
      heading: "",
      items: [
        "**AWS:** The hotel company.",
        "**Region:** A hotel location in a particular city.",
        "**Availability Zone:** A separate building within that location.",
      ],
    },
    { kind: "visual", id: "hotel-chain", caption: "AWS as the hotel company, a Region as a location, and Availability Zones as separate buildings" },
    {
      kind: "callout",
      tone: "info",
      title: "Regions are independent",
      body: "Different Regions operate independently, although AWS provides ways to connect them.",
    },
    { kind: "prose", heading: "3. HOW: Deploying into a Region", body: ["When deploying an application:"] },
    { kind: "visual", id: "region-deploy", caption: "Choosing a Region, creating resources, and deploying elsewhere separately" },
    {
      kind: "list",
      heading: "",
      items: [
        "**1.** Select an AWS Region.",
        "**2.** Create resources such as EC2 or RDS in that Region.",
        "**3.** AWS hosts those resources within its regional infrastructure.",
        "**4.** Deploy resources in other Regions separately when needed.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Important",
      body: "Most AWS resources are regional. Creating an EC2 instance in Virginia does not automatically create another in Ireland.",
    },
    {
      kind: "prose",
      heading: "",
      body: [
        "The illustration is conceptual: each Region has multiple Availability Zones, which contain one or more data centers. Region markers on the map show the approximate area of each Region.",
      ],
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: From Mumbai to Ireland",
      body: [
        "An e-commerce company serves customers primarily in India.",
        "It selects the Mumbai Region (`ap-south-1`) because it is geographically closer to many of its users.",
        "Later, it expands into Europe and considers deploying additional infrastructure in Ireland.",
      ],
    },
    { kind: "visual", id: "mumbai-ireland", caption: "Starting in Mumbai, then considering Ireland, with replication configured explicitly" },
    {
      kind: "prose",
      heading: "",
      body: ["The company must explicitly configure any necessary cross-Region data replication."],
    },
    { kind: "prose", heading: "5. TRADE-OFFS: Choosing a Region", body: ["The four main factors when selecting an AWS Region are:"] },
    {
      kind: "table",
      caption: "Factors for selecting a Region",
      headers: ["Factor", "Why it matters"],
      rows: [
        ["Latency", "Choose infrastructure close to users"],
        ["Cost", "Service prices can differ by Region"],
        ["Compliance", "Some data must remain within specified locations"],
        ["Service availability", "Not every AWS service or feature is available everywhere"],
      ],
    },
    {
      kind: "prose",
      heading: "",
      body: ["AWS recommends considering these factors when selecting a Region."],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Interview takeaway",
      body: "Choose an AWS Region based on latency, cost, compliance, and service availability, not simply geographical proximity.",
    },
    {
      kind: "takeaways",
      items: [
        "An AWS Region is a separate geographic area where AWS operates cloud infrastructure. Each Region contains multiple isolated Availability Zones.",
        "Region codes look like us-east-1, us-east-2, eu-west-1, and ap-south-1.",
        "Deploying closer to users can reduce latency, and the right Region helps meet legal requirements and control costs.",
        "Think of AWS as a hotel chain: a Region is a hotel location in a city, and an Availability Zone is a separate building there.",
        "Different Regions operate independently, although AWS provides ways to connect them.",
        "Most AWS resources are regional. An EC2 instance in Virginia does not automatically create another in Ireland.",
        "Cross-Region data replication must be configured explicitly.",
        "Choose a Region by latency, cost, compliance, and service availability, not simply proximity.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "aws-regions-q1",
          question: "In the hotel chain analogy, what is an Availability Zone?",
          options: [
            "The hotel company",
            "A hotel location in a particular city",
            "A separate building within that location",
            "A booking website",
          ],
          correctIndex: 2,
          explanation: "AWS is the hotel company, a Region is a hotel location in a city, and an Availability Zone is a separate building within that location.",
        },
        {
          id: "aws-regions-q2",
          question: "You create an EC2 instance in US East (N. Virginia). What happens in Europe (Ireland)?",
          options: [
            "AWS automatically creates a copy there",
            "Nothing. Most AWS resources are regional, so you deploy in Ireland separately",
            "The instance moves to Ireland when users arrive",
            "Ireland becomes the primary Region",
          ],
          correctIndex: 1,
          explanation: "Most AWS resources are regional. Creating an EC2 instance in Virginia does not automatically create another in Ireland.",
        },
        {
          id: "aws-regions-q3",
          question: "Which is the Region code for Asia Pacific (Mumbai)?",
          options: ["us-east-1", "eu-west-1", "ap-south-1", "us-east-2"],
          correctIndex: 2,
          explanation: "ap-south-1 is Asia Pacific (Mumbai). us-east-1 is N. Virginia, us-east-2 is Ohio, and eu-west-1 is Ireland.",
        },
        {
          id: "aws-regions-q4",
          question: "Which set lists the four main factors for selecting an AWS Region?",
          options: [
            "Latency, cost, compliance, and service availability",
            "Latency, color, size, and age",
            "Proximity only",
            "Cost, logo, language, and time zone",
          ],
          correctIndex: 0,
          explanation: "Choose based on latency, cost, compliance, and service availability, not simply geographical proximity.",
        },
      ],
    },
  ],
};

const availabilityZones: AwsLesson = {
  slug: "availability-zones",
  title: "Availability Zones",
  subtitle: "Understand what Availability Zones are, why they exist, and how they help applications survive infrastructure failures.",
  sections: [
    {
      kind: "prose",
      heading: "",
      body: [
        "An AWS **Availability Zone (AZ)** is one or more **physically separate data centers** within an AWS Region.",
        "Each AZ has **independent power, networking, and cooling** infrastructure.",
        "Example within `us-east-1`:",
      ],
    },
    { kind: "list", heading: "", items: ["`us-east-1a`", "`us-east-1b`", "`us-east-1c`"] },
    {
      kind: "prose",
      heading: "",
      body: ["These are example AZ names. The letter-to-physical-AZ mapping can differ between AWS accounts."],
    },
    {
      kind: "prose",
      heading: "1. WHY: One data center is a single point of failure",
      body: [
        "Imagine your entire application runs in one data center.",
        "If that data center experiences a major power failure, your application may become unavailable.",
        "AWS provides multiple isolated Availability Zones to help reduce this risk.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Main purpose",
      body: "Fault isolation and high availability.",
    },
    {
      kind: "prose",
      heading: "2. INTUITION: A hospital with multiple buildings",
      body: [
        "Think of a hospital with multiple independent buildings.",
        "If one building loses power, another building can continue providing essential services.",
      ],
    },
    { kind: "visual", id: "hospital-az", caption: "A hospital campus compared with the Availability Zones of one Region" },
    {
      kind: "callout",
      tone: "info",
      title: "Provided the application is designed correctly",
      body: "Applications deployed across multiple AZs can remain operational when one AZ fails, provided the application is designed correctly.",
    },
    { kind: "prose", heading: "3. HOW: Multiple AZs inside a Region", body: ["Walk through how a Region such as `us-east-1` is organized:"] },
    { kind: "visual", id: "az-how", caption: "Isolated Availability Zones, their connections, and spreading an application across them" },
    {
      kind: "list",
      heading: "",
      items: [
        "**AWS Region:** `us-east-1` has multiple isolated Availability Zones.",
        "`us-east-1a`, `us-east-1b`, `us-east-1c`: Each one has independent infrastructure.",
        "**Connections:** AWS connects AZs within a Region through highly redundant, low-latency, high-bandwidth networking.",
      ],
    },
    {
      kind: "prose",
      heading: "",
      body: [
        "An application can run instances across multiple AZs. When one AZ fails, healthy instances in another AZ can continue serving users.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Important",
      body: "AWS does not automatically distribute every application across AZs. You must configure the relevant architecture.",
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: An online shopping application",
      body: [
        "An online shopping application runs on two EC2 instances.",
        "Customer requests go to an **Application Load Balancer**, which routes requests to healthy instances. One instance runs in **AZ A** and the other in **AZ B**.",
      ],
    },
    { kind: "visual", id: "multi-az-example", caption: "A load balancer sending customer requests to healthy instances in two Availability Zones" },
    {
      kind: "prose",
      heading: "",
      body: [
        "If AZ A fails, the load balancer can direct requests to the healthy instance in AZ B.",
        "This is an example of **Multi-AZ deployment**.",
        "This is a simplified Multi-AZ design. It assumes a properly configured load balancer and independently available application dependencies.",
      ],
    },
    { kind: "prose", heading: "5. TRADE-OFFS: Single-AZ vs Multi-AZ", body: [] },
    {
      kind: "table",
      caption: "Single-AZ compared with Multi-AZ",
      headers: ["Single-AZ", "Multi-AZ"],
      rows: [
        ["Simpler architecture", "Better protection from AZ failures"],
        ["Often lower cost", "May incur additional resource and data-transfer costs"],
        ["AZ failure can cause downtime", "Can continue operating during an AZ failure"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Important",
      body: "Multi-AZ protects against certain AZ-level failures, but it does not automatically protect against an entire Region failure.",
    },
    {
      kind: "takeaways",
      items: [
        "An Availability Zone is one or more physically separate data centers within an AWS Region, with independent power, networking, and cooling.",
        "AZ names such as us-east-1a, us-east-1b, and us-east-1c are examples. The letter-to-physical-AZ mapping can differ between AWS accounts.",
        "The main purpose of AZs is fault isolation and high availability.",
        "Think of a hospital with multiple independent buildings: if one loses power, another keeps providing essential services.",
        "AWS connects the AZs in a Region through highly redundant, low-latency, high-bandwidth networking.",
        "AWS does not automatically distribute every application across AZs. You must configure the relevant architecture.",
        "In a Multi-AZ deployment, a load balancer can send requests to healthy instances when one AZ fails.",
        "Multi-AZ adds protection but may add cost, and it does not automatically protect against an entire Region failure.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "availability-zones-q1",
          question: "What is an AWS Availability Zone?",
          options: [
            "A single server inside a data center",
            "One or more physically separate data centers within a Region, with independent power, networking, and cooling",
            "A group of Regions in one country",
            "A pricing tier for EC2",
          ],
          correctIndex: 1,
          explanation: "An AZ is one or more physically separate data centers within an AWS Region, each AZ with independent power, networking, and cooling infrastructure.",
        },
        {
          id: "availability-zones-q2",
          question: "A shop runs one EC2 instance in AZ A and one in AZ B behind a load balancer. AZ A fails. What can happen?",
          options: [
            "The whole application goes down",
            "The load balancer can direct requests to the healthy instance in AZ B",
            "AWS moves the instance in AZ A to another Region",
            "Customers must wait for AZ A to recover",
          ],
          correctIndex: 1,
          explanation: "This is a Multi-AZ deployment. The load balancer can direct requests to the healthy instance in AZ B.",
        },
        {
          id: "availability-zones-q3",
          question: "Does AWS automatically spread every application across Availability Zones?",
          options: [
            "Yes, every application is spread across all AZs by default",
            "Yes, but only for databases",
            "No. You must configure the relevant architecture",
            "No. AZs cannot run applications",
          ],
          correctIndex: 2,
          explanation: "AWS does not automatically distribute every application across AZs. You must configure the relevant architecture.",
        },
        {
          id: "availability-zones-q4",
          question: "What does a Multi-AZ deployment NOT automatically protect against?",
          options: [
            "A failure of one AZ",
            "A power failure in one data center of one AZ",
            "An entire Region failure",
            "A single instance becoming unhealthy",
          ],
          correctIndex: 2,
          explanation: "Multi-AZ protects against certain AZ-level failures, but it does not automatically protect against an entire Region failure.",
        },
      ],
    },
  ],
};

const placeholder = (slug: string, title: string): AwsLesson => ({
  slug,
  title,
  subtitle: "Coming soon.",
  sections: [],
});

export const AWS_TOPICS: Record<string, { lessons: AwsLesson[] }> = {
  "introduction-to-the-cloud": {
    lessons: [
      whatIsCloudComputing,
      traditionalItVsCloud,
      benefitsOfCloudComputing,
      iaasPaasSaas,
      publicPrivateHybrid,
      introToAws,
      module1FinalQuiz,
      module1CheatSheet,
    ],
  },
  "global-infrastructure": {
    lessons: [
      awsRegions,
      availabilityZones,
      placeholder("edge-locations", "Edge Locations"),
      placeholder("high-availability-and-fault-tolerance", "High Availability and Fault Tolerance"),
      placeholder("module-2-final-quiz", "Module 2 Final Quiz"),
      placeholder("module-2-cheat-sheet", "Module 2 Cheat Sheet"),
    ],
  },
};
