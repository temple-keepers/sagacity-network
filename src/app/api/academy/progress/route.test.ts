import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import type { NextRequest } from "next/server";

vi.mock("@/lib/academy/feature-flag", () => ({ isAcademyEnabled: () => true }));

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn(),
};
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => mockSupabase,
}));

function makeReq(body: unknown): NextRequest {
  return new Request("http://localhost/api/academy/progress", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/academy/progress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReset();
  });

  it("401s when anonymous", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeReq({ lessonId: "l1" }));
    expect(res.status).toBe(401);
  });

  it("400s when lessonId missing", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it("403s when lesson row is not visible (RLS blocked)", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockSupabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }),
      }),
    }));
    const res = await POST(makeReq({ lessonId: "l1" }));
    expect(res.status).toBe(403);
  });
});
