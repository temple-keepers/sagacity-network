import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccess() {
  return (
    <div className="pt-[120px] pb-20">
      <div className="max-w-site section-px">
        <div className="max-w-[520px] mx-auto text-center">
          <div
            className="w-16 h-16 flex items-center justify-center mx-auto mb-6"
            style={{
              background: "rgba(45, 142, 110, 0.1)",
              borderRadius: "50%",
              color: "#2D8E6E",
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h1
            className="text-[32px] md:text-[40px] font-[800] tracking-[-0.02em] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Payment successful!
          </h1>
          <p
            className="text-[16px] font-[300] leading-[1.7] mb-8"
            style={{ color: "var(--color-muted)" }}
          >
            Thank you for your purchase. We&apos;ll be in touch within 24 hours
            to kick off your project. Check your email for a receipt from Stripe.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="px-8 py-3.5 text-[14px] font-[500] transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "var(--gradient-purple)",
                color: "#FFFFFF",
                borderRadius: "var(--radius-sm)",
              }}
            >
              Back to home
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 text-[14px] font-[500] transition-colors"
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-muted)",
              }}
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
