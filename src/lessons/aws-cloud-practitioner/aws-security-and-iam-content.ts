// Module 3: AWS Security and IAM. Lessons are placeholders (empty sections) until content is supplied.
import type { AwsLesson } from "./introduction-to-the-cloud-content";

const placeholder = (slug: string, title: string): AwsLesson => ({
  slug,
  title,
  subtitle: "Coming soon.",
  sections: [],
});

const sharedResponsibility: AwsLesson = {
  slug: "aws-shared-responsibility-model",
  title: "AWS Shared Responsibility Model",
  subtitle: "Understand which security responsibilities belong to AWS and which belong to the customer.",
  sections: [
    { kind: "prose", heading: "", body: ["The **AWS Shared Responsibility Model** divides security responsibilities between AWS and its customers."] },
    {
      kind: "list",
      heading: "",
      items: ["**AWS:** Security **of** the cloud.", "**Customer:** Security **in** the cloud."],
    },
    {
      kind: "callout",
      tone: "info",
      title: "It depends on the service",
      body: "The exact division depends on the AWS service being used.",
    },
    {
      kind: "prose",
      heading: "1. WHY: AWS cannot fix every customer mistake",
      body: [
        "AWS protects its physical infrastructure, but it cannot automatically protect applications from every mistake made by customers.",
        "For example, if a customer accidentally gives excessive permissions to an IAM user, AWS does not automatically correct that mistake.",
        "Both parties must fulfill their responsibilities.",
      ],
    },
    { kind: "prose", heading: "2. INTUITION: Renting an apartment", body: ["Think about **renting an apartment**."] },
    {
      kind: "list",
      heading: "",
      items: [
        "**Landlord (AWS):** Maintains the building, physical security, and shared infrastructure.",
        "**Tenant (Customer):** Controls who receives keys and protects personal belongings.",
      ],
    },
    { kind: "visual", id: "apartment-shared", caption: "A landlord and tenant compared with AWS and its customer" },
    {
      kind: "callout",
      tone: "info",
      title: "The key idea",
      body: "The landlord secures the building, but you must still manage access to your apartment.",
    },
    { kind: "prose", heading: "3. HOW: Who owns which layer", body: ["Responsibilities split along the layers of a workload."] },
    {
      kind: "table",
      caption: "AWS and customer responsibilities",
      headers: ["AWS responsibility", "Customer responsibility"],
      rows: [
        ["Physical data center security", "IAM users, roles, and policies"],
        ["Physical servers and networking", "Application security"],
        ["Underlying virtualization infrastructure", "Customer data protection"],
        ["Physical hardware maintenance", "Guest OS patching on EC2"],
        ["Infrastructure availability controls", "Configuring appropriate workload resilience"],
      ],
    },
    { kind: "visual", id: "sr-how", caption: "Security of the cloud and security in the cloud, layer by layer" },
    {
      kind: "callout",
      tone: "warn",
      title: "Important",
      body: "With managed services like **Amazon RDS**, AWS manages more underlying components than it does for an EC2-based database.",
    },
    {
      kind: "prose",
      heading: "",
      body: ["AWS also expects customers to configure IAM, enable MFA, manage credentials, and review permissions."],
    },
    { kind: "prose", heading: "4. EXAMPLE: Terraform and your identity", body: ["We begin with a read-only Terraform example that identifies the AWS account and identity Terraform is using. It is a safe starting point before we create IAM resources."] },
    {
      kind: "code",
      language: "hcl",
      caption: "main.tf",
      code: `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_caller_identity" "current" {}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "identity_arn" {
  value = data.aws_caller_identity.current.arn
}`,
    },
    {
      kind: "code",
      language: "bash",
      caption: "Run locally",
      code: `terraform init      # download the AWS provider
terraform plan      # preview, nothing is created
terraform apply     # show the account ID and identity ARN
terraform output    # print the outputs again
terraform destroy   # clean up (nothing to remove here)`,
    },
    {
      kind: "list",
      heading: "What this code does",
      items: [
        "`provider \"aws\"` configures Terraform to communicate with AWS using your existing credentials.",
        "`data \"aws_caller_identity\"` retrieves information about the authenticated AWS identity.",
        "`output` displays the account ID and identity ARN.",
      ],
    },
    { kind: "visual", id: "sr-terraform", caption: "Terraform asks AWS who is calling, then prints the answer" },
    {
      kind: "prose",
      heading: "",
      body: ["This example illustrates customer responsibility for identity and access management. Terraform can use AWS credentials, but it does not automatically secure them."],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Safety",
      body: "This configuration creates no AWS infrastructure and normally incurs no AWS resource charges. Use an authorized IAM role or IAM Identity Center session, not root credentials. Avoid storing access keys in Terraform code.",
    },
    { kind: "prose", heading: "5. TRADE-OFFS: What you gain and what you accept", body: [] },
    {
      kind: "table",
      caption: "Benefits and limitations of the model",
      headers: ["Benefit", "Limitation"],
      rows: [
        ["AWS handles physical security", "Customers must configure access securely"],
        ["Managed services reduce maintenance", "Responsibilities vary by service"],
        ["Terraform makes configuration repeatable", "Incorrect Terraform can deploy insecure resources"],
      ],
    },
    {
      kind: "takeaways",
      items: [
        "AWS is responsible for security **of** the cloud. Customers are responsible for security **in** the cloud.",
        "The exact division depends on the AWS service being used.",
        "AWS does not automatically correct customer mistakes, such as excessive IAM permissions.",
        "AWS covers physical data centers, servers, networking, and the virtualization layer. Customers cover IAM, applications, data, and guest OS patching on EC2.",
        "With managed services like Amazon RDS, AWS manages more underlying components than it does for an EC2-based database.",
        "Customers should configure IAM, enable MFA, manage credentials, and review permissions.",
        "Terraform can use AWS credentials but does not secure them. Use a role or IAM Identity Center, never root credentials.",
        "Interview takeaway: AWS secures the underlying cloud infrastructure, while customers secure their data, identities, applications, and configurations according to the services they use.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "aws-shared-responsibility-model-q1",
          question: "Which statement matches the AWS Shared Responsibility Model?",
          options: [
            "AWS is responsible for security in the cloud, and the customer for security of the cloud",
            "AWS is responsible for security of the cloud, and the customer for security in the cloud",
            "AWS is responsible for all security, including customer permissions",
            "The customer is responsible for all security, including data centers",
          ],
          correctIndex: 1,
          explanation: "AWS secures the cloud itself, such as data centers and hardware. Customers secure what they put in the cloud, such as identities, data, and applications.",
        },
        {
          id: "aws-shared-responsibility-model-q2",
          question: "A customer gives an IAM user excessive permissions by mistake. What does AWS do?",
          options: [
            "Automatically removes the extra permissions",
            "Blocks the user until the customer confirms",
            "Does not automatically correct the mistake, because IAM configuration is the customer's responsibility",
            "Disables the account",
          ],
          correctIndex: 2,
          explanation: "AWS protects its physical infrastructure, but it does not automatically correct customer configuration mistakes.",
        },
        {
          id: "aws-shared-responsibility-model-q3",
          question: "Which task belongs to the customer?",
          options: [
            "Physical data center security",
            "Physical hardware maintenance",
            "Guest OS patching on EC2",
            "Maintaining the underlying virtualization infrastructure",
          ],
          correctIndex: 2,
          explanation: "On EC2, patching the guest operating system is a customer responsibility. The other tasks belong to AWS.",
        },
        {
          id: "aws-shared-responsibility-model-q4",
          question: "How does the division change when you use a managed service like Amazon RDS instead of a database on EC2?",
          options: [
            "Nothing changes, the division is identical for every service",
            "The customer manages more of the underlying components",
            "AWS manages more of the underlying components",
            "AWS takes over IAM and data protection",
          ],
          correctIndex: 2,
          explanation: "With managed services, AWS manages more underlying components. Responsibilities vary by service, and customers still own their data and access.",
        },
      ],
    },
  ],
};

const iamUsersAndGroups: AwsLesson = {
  slug: "iam-users-and-groups",
  title: "IAM Users and Groups",
  subtitle: "Understand how AWS organizes identities using IAM users and groups, and create both using Terraform.",
  sections: [
    {
      kind: "prose",
      heading: "",
      body: ["**AWS Identity and Access Management (IAM)** controls who can access AWS resources and what actions they can perform."],
    },
    {
      kind: "list",
      heading: "",
      items: [
        "**IAM User:** An identity within an AWS account, with its own permissions and potentially its own credentials.",
        "**IAM Group:** A collection of IAM users used to manage permissions together.",
      ],
    },
    { kind: "callout", tone: "info", title: "Global service", body: "IAM is a global service within an AWS account." },
    {
      kind: "prose",
      heading: "1. WHY: Managing permissions at scale",
      body: [
        "Imagine a company with 100 developers.",
        "Assigning permissions to every user separately is difficult to maintain.",
        "Instead, administrators can create a **Developers** group, attach the required permissions, and add developers to that group.",
      ],
    },
    { kind: "callout", tone: "info", title: "The benefit", body: "This makes permission management more consistent." },
    { kind: "prose", heading: "2. INTUITION: A company office", body: ["Think of a **company office**:"] },
    {
      kind: "list",
      heading: "",
      items: [
        "**IAM User:** An individual employee.",
        "**IAM Group:** A department, such as Developers.",
        "**IAM Policy:** Rules defining what the department can access.",
      ],
    },
    { kind: "visual", id: "office-iam", caption: "A company office compared with IAM users, groups, and policies" },
    {
      kind: "callout",
      tone: "info",
      title: "Many departments",
      body: "An employee can belong to multiple departments, just as an IAM user can belong to multiple groups.",
    },
    { kind: "prose", heading: "3. HOW: A group with users", body: ["A **Developers** group holds IAM users such as Alice and Bob. Permissions can be attached to the group."] },
    { kind: "visual", id: "group-how", caption: "A group holds users, and its permissions reach every member" },
    {
      kind: "list",
      heading: "Important rules",
      ordered: true,
      items: [
        "Groups contain IAM users, not other groups.",
        "A user can belong to multiple groups or none.",
        "Group permissions are available to its members.",
        "Creating a user or group alone does not grant application permissions.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Modern AWS practice",
      body: "For workforce access, AWS recommends **IAM Identity Center** with temporary credentials rather than creating long-lived IAM users for everyone.",
    },
    { kind: "prose", heading: "4. EXAMPLE: Terraform", body: ["We create one IAM user, one group, and add the user to that group."] },
    {
      kind: "code",
      language: "hcl",
      caption: "main.tf",
      code: `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_iam_user" "alice" {
  name = "aws-learning-alice"
}

resource "aws_iam_group" "developers" {
  name = "aws-learning-developers"
}

resource "aws_iam_user_group_membership" "alice" {
  user = aws_iam_user.alice.name

  groups = [
    aws_iam_group.developers.name
  ]
}`,
    },
    {
      kind: "code",
      language: "bash",
      caption: "Run locally",
      code: `terraform init      # download the AWS provider
terraform plan      # preview the three resources
terraform apply     # create them
terraform destroy   # Review it first to see what Terraform intends to delete, helping prevent accidental removal of important resources before running terraform destroy.`,
    },
    { kind: "visual", id: "iam-terraform", caption: "Terraform creates the user, the group, and the membership" },
    {
      kind: "callout",
      tone: "warn",
      title: "What is not created",
      body: "The code creates no access keys, console passwords, or IAM policies. Alice cannot sign in with a console password from this configuration.",
    },
    { kind: "prose", heading: "5. TRADE-OFFS: What you gain and what you accept", body: [] },
    {
      kind: "table",
      caption: "Advantages and limitations of IAM groups",
      headers: ["Advantage", "Limitation"],
      rows: [
        ["Centralized permission management", "Groups contain only IAM users"],
        ["Easier onboarding", "Membership must be maintained"],
        ["Consistent group permissions", "Users can accumulate excessive permissions across groups"],
      ],
    },
    {
      kind: "takeaways",
      items: [
        "IAM controls who can access AWS resources and what actions they can perform. It is a global service within an AWS account.",
        "An IAM user is an identity within an AWS account. An IAM group is a collection of IAM users used to manage permissions together.",
        "Attach permissions to a group and add users to it, instead of managing every user separately.",
        "Groups contain users, not other groups. A user can belong to multiple groups or none.",
        "Creating a user or group alone does not grant application permissions.",
        "In Terraform, `aws_iam_user`, `aws_iam_group`, and `aws_iam_user_group_membership` create the user, the group, and the link between them.",
        "For workforce access, AWS recommends IAM Identity Center with temporary credentials rather than long-lived IAM users for everyone.",
        "Interview takeaway: IAM users represent identities, while IAM groups simplify permission management for multiple users.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "iam-users-and-groups-q1",
          question: "What is an IAM group?",
          options: [
            "A single identity with its own credentials",
            "A collection of IAM users used to manage permissions together",
            "A collection of AWS accounts",
            "A set of Regions",
          ],
          correctIndex: 1,
          explanation: "An IAM group is a collection of IAM users that lets administrators manage permissions together.",
        },
        {
          id: "iam-users-and-groups-q2",
          question: "A company has 100 developers who need the same permissions. What is the better approach?",
          options: [
            "Attach permissions to each of the 100 users separately",
            "Create a Developers group, attach the permissions, and add the developers to it",
            "Share one IAM user between all developers",
            "Create 100 groups with one user each",
          ],
          correctIndex: 1,
          explanation: "Attaching permissions to a group and adding users to it is easier to maintain and more consistent.",
        },
        {
          id: "iam-users-and-groups-q3",
          question: "Which statement about IAM groups is correct?",
          options: [
            "Groups can contain other groups",
            "A user can belong to only one group",
            "Groups contain IAM users, and a user can belong to multiple groups or none",
            "A group is required for every IAM user",
          ],
          correctIndex: 2,
          explanation: "Groups contain IAM users, not other groups. A user can belong to multiple groups or none.",
        },
        {
          id: "iam-users-and-groups-q4",
          question: "After applying the Terraform configuration, what can Alice do?",
          options: [
            "Sign in with a console password",
            "Use access keys to call AWS",
            "Nothing yet, because no password, access keys, or policies were created",
            "Administer the whole account",
          ],
          correctIndex: 2,
          explanation: "The configuration creates no access keys, console passwords, or IAM policies, so Alice has no way to sign in and no permissions.",
        },
      ],
    },
  ],
};

export const AWS_SECURITY_AND_IAM_LESSONS: AwsLesson[] = [
  sharedResponsibility,
  iamUsersAndGroups,
  placeholder("iam-policies-and-least-privilege", "IAM Policies and Least Privilege"),
  placeholder("iam-roles-and-temporary-credentials", "IAM Roles and Temporary Credentials"),
  placeholder("root-account-password-policies-and-mfa", "Root Account, Password Policies, and MFA"),
  placeholder("aws-cli-sdk-and-credentials", "AWS CLI, SDK, and Credentials"),
  placeholder("encryption-and-aws-kms", "Encryption and AWS KMS"),
  placeholder("security-monitoring-and-auditing", "Security Monitoring and Auditing"),
  placeholder("aws-security-services", "AWS Security Services"),
  placeholder("iam-best-practices-and-permissions-boundaries", "IAM Best Practices and Permissions Boundaries"),
];
