// Module 3: AWS Security and IAM. Lessons are placeholders (empty sections) until content is supplied.
import type { AwsLesson } from "./introduction-to-the-cloud-content";

const placeholder = (slug: string, title: string): AwsLesson => ({
  slug,
  title,
  subtitle: "Coming soon.",
  sections: [],
});

export const AWS_SECURITY_AND_IAM_LESSONS: AwsLesson[] = [
  placeholder("aws-shared-responsibility-model", "AWS Shared Responsibility Model"),
  placeholder("iam-users-and-groups", "IAM Users and Groups"),
  placeholder("iam-policies-and-least-privilege", "IAM Policies and Least Privilege"),
  placeholder("iam-roles-and-temporary-credentials", "IAM Roles and Temporary Credentials"),
  placeholder("root-account-password-policies-and-mfa", "Root Account, Password Policies, and MFA"),
  placeholder("aws-cli-sdk-and-credentials", "AWS CLI, SDK, and Credentials"),
  placeholder("encryption-and-aws-kms", "Encryption and AWS KMS"),
  placeholder("security-monitoring-and-auditing", "Security Monitoring and Auditing"),
  placeholder("aws-security-services", "AWS Security Services"),
  placeholder("iam-best-practices-and-permissions-boundaries", "IAM Best Practices and Permissions Boundaries"),
];
