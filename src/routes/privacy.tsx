import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: "Privacy Policy — StackBlueprint" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-full max-w-4xl -translate-x-1/2 rounded-full bg-mint/5 blur-[120px]" />

      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-12 lg:py-28">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Last updated: August 12, 2026
          </p>
        </div>

        <div className="space-y-8 text-base leading-relaxed text-muted-foreground/90 lg:text-lg">
          <p className="text-xl font-medium text-foreground">
            StackBlueprint is built to be useful without asking you to hand over personal
            information.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              The short version
            </h2>
            <p>
              StackBlueprint does not require an account, sign-up, payment, or profile. We do not
              ask for your name, email address, phone number, or other personal details.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Information we collect
            </h2>
            <p>
              We do not collect personal information through StackBlueprint. We do not operate user
              accounts, maintain a user database, or use the site to build personal profiles.
            </p>
            <p>
              StackBlueprint does not use advertising trackers, marketing pixels, or third-party
              analytics cookies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Interactive tools and browser storage
            </h2>
            <p>
              The lessons and playground are designed to run in your browser. Inputs you make while
              using an interactive exercise are not submitted to StackBlueprint for storage or
              analysis.
            </p>
            <p>
              The site may save simple, non-identifying preferences, such as a display setting, in
              your browser so the interface works as expected. You can remove those preferences at
              any time by clearing the site data in your browser.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Hosting</h2>
            <p>
              StackBlueprint is hosted on Vercel. Like any web host, Vercel may process limited
              technical request data, such as an IP address, browser and device information, request
              timestamps, and security or error logs, to deliver and protect the site.
              StackBlueprint does not use that data to identify visitors, advertise to them, or
              create profiles.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Sharing</h2>
            <p>
              Because we do not collect personal information through the site, we do not sell, rent,
              or share personal information with advertisers or data brokers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Children</h2>
            <p>
              StackBlueprint is an educational site and is not directed at children under 13. We do
              not knowingly collect personal information from children.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Changes to this policy
            </h2>
            <p>
              If this policy changes, the updated version will be posted here with a new effective
              date. If StackBlueprint later adds an account, contact form, payments, or analytics,
              this policy will be updated before that feature is used.
            </p>
            <p>
              In practical terms, you can explore the lessons and playground without creating an
              account or giving StackBlueprint personal information.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
