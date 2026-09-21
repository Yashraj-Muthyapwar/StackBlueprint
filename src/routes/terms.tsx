import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [{ title: "Terms of Service — StackBlueprint" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-full max-w-4xl -translate-x-1/2 rounded-full bg-mint/5 blur-[120px]" />

      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-12 lg:py-28">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Last updated: August 12, 2026
          </p>
        </div>

        <div className="space-y-8 text-base leading-relaxed text-muted-foreground/90 lg:text-lg">
          <p className="text-xl font-medium text-foreground">
            StackBlueprint is a free educational resource for learning engineering concepts through
            lessons, visualizations, and practice tools.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Using StackBlueprint
            </h2>
            <p>
              By using StackBlueprint, you agree to these terms. If you do not agree, please do not
              use the site.
            </p>
            <p>
              You may use StackBlueprint for personal learning, study, and professional development.
              You do not need an account to access the site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Content and ownership
            </h2>
            <p>
              The lessons, visualizations, exercises, design, and other material on StackBlueprint
              are protected by applicable intellectual property laws. You may read, run, and learn
              from them. You may not copy, republish, sell, mirror, or systematically scrape
              substantial portions of the site without permission.
            </p>
            <p>
              Short excerpts may be shared for discussion, review, or reference when the source is
              identified as StackBlueprint and the use is lawful.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Practice tools and examples
            </h2>
            <p>
              Code examples, visualizations, and playground output are provided for learning. They
              may be simplified, incomplete, or unsuitable for a production environment. Review,
              test, and adapt anything you use before relying on it in a real system.
            </p>
            <p>StackBlueprint is not legal, security, financial, or professional advice.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Responsible use
            </h2>
            <p>
              Do not use StackBlueprint in a way that harms the site, its visitors, or other
              systems. This includes attempting to bypass access controls, disrupt the service,
              introduce malicious code, or use the site to facilitate unlawful activity.
            </p>
            <p>
              The web-scraping material is educational. You are responsible for complying with
              applicable laws, website terms, rate limits, robots directives, privacy obligations,
              and other rules when applying those techniques outside this site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Availability and changes
            </h2>
            <p>
              StackBlueprint may change, add, remove, or pause lessons and features at any time. We
              do not guarantee that the site, its content, or any particular feature will always be
              available or error-free.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Disclaimer</h2>
            <p>
              StackBlueprint is provided on an "as is" and "as available" basis. To the fullest
              extent allowed by law, we make no warranties about the accuracy, completeness,
              reliability, or fitness of the site or its content for a particular purpose.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Limitation of liability
            </h2>
            <p>
              To the fullest extent allowed by law, the operator of StackBlueprint will not be
              liable for indirect, incidental, special, consequential, or punitive damages arising
              from your use of, or inability to use, the site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Privacy</h2>
            <p>
              Your use of StackBlueprint is also governed by the{" "}
              <a href="/privacy" className="text-mint hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Updates to these terms
            </h2>
            <p>
              We may update these terms from time to time. Continued use of StackBlueprint after an
              update means you accept the revised terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
