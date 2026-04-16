import { describe, it, expectTypeOf } from "vitest";
import type { EnrolledCourse } from "./enrollment-queries";

describe("enrollment-queries types", () => {
  it("EnrolledCourse has the required fields", () => {
    expectTypeOf<EnrolledCourse>().toHaveProperty("id").toEqualTypeOf<string>();
    expectTypeOf<EnrolledCourse>().toHaveProperty("completed_lessons").toEqualTypeOf<number>();
    expectTypeOf<EnrolledCourse>().toHaveProperty("next_lesson_slug").toEqualTypeOf<string | null>();
  });
});
