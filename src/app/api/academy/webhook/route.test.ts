import { describe, it, expect, vi } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/academy/stripe", () => {
  const constructEvent = vi.fn();
  return {
    getStripe: () => ({
      webhooks: { constructEvent },
      checkout: { sessions: { list: vi.fn() } },
    }),
    getWebhookSecret: () => "whsec_test",
    __constructEvent: constructEvent,
  };
});

const mockDb = {
  from: vi.fn(() => ({
    select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }),
    insert: () => Promise.resolve({ error: null }),
    delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    upsert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: { id: "e1" }, error: null }),
      }),
    }),
    update: () => ({ eq: () => Promise.resolve({ error: null }) }),
  })),
  auth: {
    admin: {
      getUserById: vi
        .fn()
        .mockResolvedValue({ data: { user: { email: "a@b", user_metadata: {} } } }),
    },
  },
};

vi.mock("@supabase/supabase-js", () => ({ createClient: () => mockDb }));
vi.mock("@/lib/emails/academy-enrolment", () => ({ sendEnrolmentEmail: vi.fn() }));

process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service";

function makeReq(body = "{}", sig: string | null = "t=1,v1=abc"): NextRequest {
  const headers = new Headers({ "content-type": "application/json" });
  if (sig !== null) headers.set("stripe-signature", sig);
  return new Request("http://localhost/api/academy/webhook", {
    method: "POST",
    headers,
    body,
  }) as unknown as NextRequest;
}

describe("POST /api/academy/webhook", () => {
  it("rejects missing signature", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeReq("{}", null));
    expect(res.status).toBe(400);
  });

  it("rejects invalid signature", async () => {
    const stripe = await import("@/lib/academy/stripe");
    // @ts-expect-error test hook
    stripe.__constructEvent.mockImplementation(() => {
      throw new Error("bad sig");
    });
    const { POST } = await import("./route");
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(400);
  });
});
