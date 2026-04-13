import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const PACKAGES: Record<string, { name: string; price: number }> = {
  starter: { name: "Guyana Starter Package", price: 35000 },
  professional: { name: "Guyana Professional Package", price: 85000 },
};

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY is not set.");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }
    const stripe = new Stripe(stripeKey);

    const { packageId } = await req.json();

    const pkg = PACKAGES[packageId];
    if (!pkg) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "https://sagacitynetwork.net";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: pkg.name },
            unit_amount: pkg.price,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/guyana`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
