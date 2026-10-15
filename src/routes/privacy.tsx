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
            Last updated: October 11, 2026
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
            <p>
              If you choose to use the optional Rivet AI tutor, StackBlueprint does not store your
              questions, Rivet's answers, your quiz results, or your API keys. Requests to Gemini,
              Groq, and OpenRouter go straight from your browser to that provider. Requests to
              NVIDIA pass through StackBlueprint's server on their way to NVIDIA, as explained in
              the Rivet section below.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Interactive tools and browser storage
            </h2>
            <p>
              The lessons and playground are designed to run in your browser. Inputs you make while
              using an interactive exercise are not submitted to StackBlueprint for storage or
              analysis. The optional Rivet AI tutor is the one feature that sends your input
              elsewhere, to an AI provider you choose, and it is described in its own section below.
            </p>
            <p>
              The site may save simple, non-identifying preferences, such as a display setting, in
              your browser so the interface works as expected. If you use Rivet, your Rivet
              settings, API keys, and conversations are also saved in your browser, as described
              below. You can remove those preferences at any time by clearing the site data in your
              browser.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Rivet, the optional AI tutor
            </h2>
            <p>
              Rivet is an optional AI tutor on lesson pages. It does nothing until you connect your
              own API key from one of these providers: Google Gemini, Groq, NVIDIA, or OpenRouter.
              StackBlueprint does not provide, pay for, or hold any AI keys.
            </p>
            <p>
              <span className="font-medium text-foreground">What is sent.</span> When you send a
              message, your browser sends the provider you chose: your message, the recent messages
              from that conversation (about the last ten), and the text of the lesson you are
              reading, without its quiz questions. After you submit a quiz, it also sends your quiz
              results: each question, your answer, and the correct answer. This goes directly from
              your browser to the provider.
            </p>
            <p>
              <span className="font-medium text-foreground">NVIDIA relay.</span> NVIDIA does not
              accept requests directly from browsers, so requests to NVIDIA pass through a relay on
              StackBlueprint's server. The relay forwards the request to NVIDIA and does not store
              or log your key, messages, or replies. To limit abuse, it keeps a short-lived count of
              requests per IP address in memory only. Like any host, Vercel may keep standard
              technical request logs, as described under Hosting.
            </p>
            <p>
              <span className="font-medium text-foreground">The provider's rules apply.</span> Once
              your data reaches a provider, that provider's own terms and privacy policy govern it,
              not ours. Some free tiers may use prompts to improve their models. Read the provider's
              policy, and do not put personal, confidential, or sensitive information in your
              messages.
            </p>
            <p>
              <span className="font-medium text-foreground">Stored on your device.</span> Your API
              keys, Rivet settings, and conversations stay in your browser. By default a key is kept
              only in the open tab's memory and is gone when you reload or close it; it is saved in
              the browser's local storage only if you turn on "Remember my API keys on this device".
              A browser extension you allow on this site can read a key either way. Conversations
              are saved per lesson (the latest 40 messages, for up to 30 lessons) unless you turn
              off "Remember conversations on this device". Conversations unused for 30 days are
              deleted the next time you use Rivet. "Clear all Rivet data" in the Rivet settings
              removes saved keys and conversations and turns history saving off. Small local
              preference and deletion records remain to prevent another open tab from restoring
              cleared conversations. They contain no messages or API keys. Browsers without safe
              cross-tab locking keep new conversations in memory. If the browser blocks removal,
              Rivet shows a warning and asks you to clear this site's data in your browser settings.
              StackBlueprint cannot see or recover this data.
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
              or share personal information with advertisers or data brokers. When you use Rivet,
              the content described above is sent to the AI provider you chose, at your direction,
              and for no other purpose.
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
              or changes what Rivet sends or where, this policy will be updated before that change
              is used.
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
