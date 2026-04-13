import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Sagacity Network",
  description:
    "How Sagacity Network Ltd handles your data. UK GDPR compliant. We never sell or share your data.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-[120px] pb-20">
      <div className="max-w-site section-px">
        <div className="max-w-[720px]">
          <h1
            className="text-[36px] md:text-[48px] font-[800] tracking-[-0.03em] leading-[1.1] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Privacy Policy
          </h1>
          <p
            className="text-[14px] font-[300] mb-12"
            style={{ color: "var(--color-muted)" }}
          >
            Last updated: 13 April 2026
          </p>

          <div className="prose-custom flex flex-col gap-10">
            <Section title="Who we are">
              <p>
                We are Sagacity Network Ltd, a UK-registered digital product
                studio. If you have any questions about this policy or your data,
                contact Denise at{" "}
                <a href="mailto:denise@sagacitynetwork.net">
                  denise@sagacitynetwork.net
                </a>
                .
              </p>
            </Section>

            <Section title="What data we collect">
              <h4>From the Digital Readiness Assessment</h4>
              <ul>
                <li>Your name, email address, and business name</li>
                <li>Your answers to the assessment questions</li>
                <li>Your score and band (calculated from your answers)</li>
                <li>How you found us (the link or source that brought you to the assessment)</li>
              </ul>

              <h4>From the contact form</h4>
              <ul>
                <li>Your name, email address, and organisation</li>
                <li>Your message</li>
              </ul>

              <h4>Standard analytics</h4>
              <p>
                We may collect basic, anonymised usage data such as page views
                and traffic sources to understand how people use the site.
              </p>
            </Section>

            <Section title="Why we collect it">
              <ul>
                <li>To send you your assessment score and personalised action plan</li>
                <li>
                  To send you a short follow-up email sequence with practical
                  advice based on your score (only with your consent)
                </li>
                <li>To respond if you contact us through the contact form</li>
                <li>To improve the assessment and our services</li>
              </ul>
              <p>That is it. We do not use your data for anything else.</p>
            </Section>

            <Section title="What we do NOT do">
              <ul>
                <li>
                  We <strong>never sell your data</strong> to anyone
                </li>
                <li>
                  We <strong>never share your data</strong> with third parties
                  for marketing purposes
                </li>
                <li>
                  We <strong>never send you unsolicited marketing</strong>{" "}
                  without your consent
                </li>
              </ul>
              <p>
                The only third parties who handle your data are the services we
                use to run the assessment and send emails:
              </p>
              <ul>
                <li>
                  <strong>Supabase</strong> — stores your data securely
                  (database hosting)
                </li>
                <li>
                  <strong>Resend</strong> — delivers the emails we send you
                </li>
              </ul>
              <p>Both are data processors acting on our instructions only.</p>
            </Section>

            <Section title="How long we keep it">
              <p>
                We keep your data for as long as you are an active contact. If
                you unsubscribe or ask us to delete your data, we will remove it
                within 30 days.
              </p>
            </Section>

            <Section title="Your rights under UK GDPR">
              <p>You have the right to:</p>
              <ul>
                <li>
                  <strong>Access</strong> — request a copy of the data we hold
                  about you
                </li>
                <li>
                  <strong>Rectification</strong> — ask us to correct anything
                  that is wrong
                </li>
                <li>
                  <strong>Erasure</strong> — ask us to delete your data entirely
                </li>
                <li>
                  <strong>Restrict processing</strong> — ask us to stop using
                  your data in certain ways
                </li>
                <li>
                  <strong>Data portability</strong> — receive your data in a
                  format you can take elsewhere
                </li>
                <li>
                  <strong>Object</strong> — object to how we process your data
                </li>
              </ul>
              <p>
                To exercise any of these rights, email{" "}
                <a href="mailto:denise@sagacitynetwork.net">
                  denise@sagacitynetwork.net
                </a>
                . We will respond within 30 days.
              </p>
            </Section>

            <Section title="How to unsubscribe">
              <p>
                Every email we send includes an unsubscribe link at the bottom.
                Click it and you will be removed from all future emails. You can
                also email{" "}
                <a href="mailto:denise@sagacitynetwork.net">
                  denise@sagacitynetwork.net
                </a>{" "}
                directly.
              </p>
            </Section>

            <Section title="Cookies">
              <p>
                We do not use tracking cookies on sagacitynetwork.net. If this
                changes in future, we will update this policy and let you know.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                If you have any questions or concerns about your data, get in
                touch:
              </p>
              <p>
                <strong>Denise</strong>
                <br />
                Sagacity Network Ltd
                <br />
                <a href="mailto:denise@sagacitynetwork.net">
                  denise@sagacitynetwork.net
                </a>
              </p>
            </Section>
          </div>

          <div className="mt-16 pt-8" style={{ borderTop: "1px solid var(--color-border)" }}>
            <Link
              href="/"
              className="text-[14px] font-[500] transition-opacity hover:opacity-70"
              style={{ color: "var(--color-accent)" }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2
        className="text-[20px] font-[700] mb-3"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <div
        className="text-[14px] font-[300] leading-[1.8] flex flex-col gap-3 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5 [&_li]:list-disc [&_a]:underline [&_h4]:font-[600] [&_h4]:text-[15px] [&_h4]:mt-2"
        style={{ color: "var(--color-muted)" }}
      >
        {children}
      </div>
    </div>
  );
}
