import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <div className="pt-[120px] pb-20">
      <div className="max-w-site section-px">
        <h1 className="text-[48px] font-[800] leading-tight mb-12" style={{ fontFamily: "var(--font-display)" }}>
          Get in touch
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form Side */}
          <div>
            <ContactForm />
          </div>

          {/* Contact Details Side */}
          <div className="flex flex-col space-y-8 pl-0 lg:pl-12 border-t lg:border-t-0 lg:border-l pt-12 lg:pt-0" style={{ borderColor: "var(--color-border)" }}>
            <div>
              <h3 className="text-[18px] font-[600] mb-2" style={{ fontFamily: "var(--font-display)" }}>Email</h3>
              <p className="text-[15px]" style={{ color: "var(--color-muted)" }}>
                <a href="mailto:hello@sagacitynetwork.net" className="hover:text-[var(--color-ink)] transition-colors">
                  hello@sagacitynetwork.net
                </a>
              </p>
            </div>
            
            <div>
              <h3 className="text-[18px] font-[600] mb-2" style={{ fontFamily: "var(--font-display)" }}>Location</h3>
              <p className="text-[15px]" style={{ color: "var(--color-muted)" }}>
                London, United Kingdom
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
