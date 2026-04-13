import RevealWrapper from "@/components/ui/RevealWrapper";

const FOUNDERS = [
  {
    role: "Founder & Digital Product Director",
    name: "Denise",
    colour: "#9F7AEA",
    border: "rgba(159,122,234,0.2)",
    bio: "Over 11 years managing capital programmes exceeding \u00A3200M across 700+ projects in the engineering division of a global consumer goods company \u2014 and building the Power BI and reporting systems that made those programmes controllable.",
    bio2: "She holds certifications as an Integrative Nutrition Health Coach, Nutritional Therapist, Advanced Fertility Nutritional Advisor, and Clinical Weight Loss Practitioner \u2014 and has designed five live digital platforms serving Christian, Guyanese, and Caribbean communities worldwide.",
    badge: "\u00A3200M+ \u00B7 700+ Projects \u00B7 11 Years",
  },
  {
    role: "Co-Founder & Cybersecurity Director",
    name: "Cybersecurity Lead",
    colour: "#D4AF37",
    border: "rgba(212,175,55,0.2)",
    bio: "A certified cybersecurity specialist with deep expertise in vulnerability assessment, penetration testing, security architecture, and staff awareness training.",
    bio2: "Every Sagacity client benefits from cybersecurity thinking built in from day one \u2014 not bolted on afterwards. For organisations requiring dedicated security services, our practice delivers enterprise-grade protection at genuinely accessible prices.",
    badge: "Certified Cybersecurity Specialist",
  },
];

export default function Founders() {
  return (
    <section
      id="about"
      className="section-padding"
      style={{ background: "var(--bg-secondary)" }}
    >
      <div className="max-container">
        {/* Header */}
        <RevealWrapper>
          <div className="mb-12">
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold mb-5">
              Founders
            </div>
            <h2>
              Who
              <em className="text-gold italic"> Builds.</em>
            </h2>
          </div>
        </RevealWrapper>

        {/* Two cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {FOUNDERS.map((founder, i) => (
            <RevealWrapper key={founder.name} delay={i * 100}>
              <div
                className="relative overflow-hidden rounded-[2px] h-full card flex flex-col p-6 md:p-8 lg:p-10"
                style={{
                  border: `1px solid ${founder.border}`,
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: founder.colour }}
                />

                {/* Role */}
                <div
                  className="text-[10px] tracking-[0.16em] uppercase mb-3 font-bold"
                  style={{ color: founder.colour }}
                >
                  {founder.role}
                </div>

                {/* Name */}
                <div className="font-display text-[28px] md:text-[34px] lg:text-[38px] font-light text-text-primary leading-none mb-6">
                  {founder.name}
                </div>

                {/* Bio — flex-grow to equalise card heights */}
                <div className="flex-grow">
                  <p className="text-[14px] text-text-secondary font-light leading-[1.8] mb-3.5">
                    {founder.bio}
                  </p>
                  <p className="text-[14px] text-text-secondary font-light leading-[1.8] mb-7">
                    {founder.bio2}
                  </p>
                </div>

                {/* Credential badge */}
                <div
                  className="inline-block px-4 py-2.5 rounded-[2px]"
                  style={{
                    background: `${founder.colour}10`,
                    border: `1px solid ${founder.colour}25`,
                  }}
                >
                  <span
                    className="text-[12px] tracking-[0.06em] font-semibold"
                    style={{ color: founder.colour }}
                  >
                    {founder.badge}
                  </span>
                </div>
              </div>
            </RevealWrapper>
          ))}
        </div>

        {/* Mission blockquote */}
        <RevealWrapper delay={150}>
          <div
            className="relative rounded-[2px] text-center py-14 px-12 lg:px-20"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="absolute top-0 left-[20%] right-[20%] h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--gold), transparent)",
              }}
            />
            <blockquote className="font-display text-[clamp(20px,2.6vw,34px)] font-light italic text-text-primary leading-[1.55] max-w-[760px] mx-auto">
              &ldquo;Sagacity Network is where enterprise discipline meets human
              scale &mdash; building the digital infrastructure that growing
              businesses and communities deserve.&rdquo;
            </blockquote>
          </div>
        </RevealWrapper>
      </div>
    </section>
  );
}
