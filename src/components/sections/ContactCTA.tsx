"use client";

import RevealWrapper from "@/components/ui/RevealWrapper";

const SERVICE_OPTIONS = [
  "Web or App Development",
  "Data & Programme Intelligence",
  "Business Automation & AI",
  "Cybersecurity Services",
  "Training or Workshop",
  "Guyana Digital Package",
  "Multiple services",
];

export default function ContactCTA() {
  return (
    <section
      id="contact"
      className="section-padding relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Centred purple glow */}
      <div
        className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(109,40,217,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="max-container relative z-10 max-w-[720px] mx-auto text-center">
        <RevealWrapper>
          <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold mb-5">
            Start the Conversation
          </div>

          <h2 className="mb-6">
            Ready to Build
            <br />
            <em className="text-gold italic">Something Exceptional?</em>
          </h2>

          <p className="text-[16px] text-text-secondary font-light leading-[1.8] max-w-[480px] mx-auto mb-14">
            Tell us what you&apos;re building — or what&apos;s slowing you down.
            We&apos;ll come back within 24 hours with an honest assessment and a
            clear path forward.
          </p>
        </RevealWrapper>

        <RevealWrapper delay={80}>
          <form
            className="flex flex-col gap-2.5 text-left"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Name + org */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="contact-name" className="sr-only">
                  Your name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  placeholder="Your name"
                  required
                  aria-required="true"
                  className="contact-input"
                />
              </div>
              <div>
                <label htmlFor="contact-org" className="sr-only">
                  Your organisation
                </label>
                <input
                  id="contact-org"
                  type="text"
                  name="organisation"
                  placeholder="Your organisation"
                  className="contact-input"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="contact-email" className="sr-only">
                Email address
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                placeholder="Email address"
                required
                aria-required="true"
                className="contact-input"
              />
            </div>

            {/* Service selector */}
            <div>
              <label htmlFor="contact-service" className="sr-only">
                What do you need?
              </label>
              <select
                id="contact-service"
                name="service"
                className="contact-input"
                defaultValue=""
                aria-label="Select service type"
              >
                <option value="" disabled>
                  What do you need?
                </option>
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="contact-message" className="sr-only">
                Your message
              </label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Tell us about your project or challenge..."
                rows={5}
                className="contact-input resize-y"
                aria-label="Project description"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-4 text-[12px] font-bold tracking-[0.13em] uppercase rounded-[2px] cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(212,175,55,0.25)]"
              style={{
                background: "var(--gold)",
                color: "var(--bg-primary)",
                border: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Send Message — We Respond Within 24 Hours
            </button>
          </form>
        </RevealWrapper>
      </div>
    </section>
  );
}
