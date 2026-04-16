import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import type { NextRequest } from "next/server";

vi.mock("@/lib/academy/feature-flag", () => ({ isAcademyEnabled: () => true }));
vi.mock("@/lib/academy/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.test/abc" }),
      },
    },
  }),
}));

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn(),
};

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => mockSupabase,
}));

function makeReq(body: unknown): NextRequest {
  return new Request("http://localhost/api/academy/checkout", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/academy/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReset();
  });

  it("returns 401 when not signed in", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeReq({ courseSlug: "x" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when courseSlug is missing", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1", email: "a@b" } } });
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it("returns 409 when already enrolled", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1", email: "a@b" } } });
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "courses")
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () =>
                  Promise.resolve({
                    data: { id: "c1", slug: "x", title: "T", price_cents: 4900, status: "published" },
                    error: null,
                  }),
              }),
            }),
          }),
        };
      if (table === "enrollments")
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: () => Promise.resolve({ data: { id: "e1" }, error: null }),
                }),
              }),
            }),
          }),
        };
      return {};
    });
    const res = await POST(makeReq({ courseSlug: "x" }));
    expect(res.status).toBe(409);
  });
});
