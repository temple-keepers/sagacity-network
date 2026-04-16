import { describe, it, expect } from "vitest";
import type { CourseSummary, CourseDetail, LessonPreview } from "./queries";

describe("query return shapes (type-level contract)", () => {
  it("CourseSummary exposes catalog-card fields", () => {
    const c: CourseSummary = {
      id: "x",
      slug: "x",
      title: "x",
      subtitle: "x",
      hero_image_url: null,
      price_cents: 0,
      level: "beginner",
      duration_minutes: 0,
      module_count: 0,
      lesson_count: 0,
    };
    expect(c.slug).toBe("x");
  });

  it("CourseDetail includes modules + lesson summaries (no bodies)", () => {
    const c: CourseDetail = {
      id: "x",
      slug: "x",
      title: "x",
      subtitle: "x",
      description: "x",
      hero_image_url: null,
      price_cents: 0,
      level: "beginner",
      duration_minutes: 0,
      instructor_name: "x",
      instructor_bio: null,
      modules: [
        {
          id: "m",
          title: "m",
          summary: "m",
          position: 0,
          lessons: [
            {
              id: "l",
              slug: "l",
              title: "l",
              summary: "l",
              duration_minutes: 0,
              is_free_preview: true,
              position: 0,
            },
          ],
        },
      ],
    };
    expect(c.modules[0].lessons[0].is_free_preview).toBe(true);
  });

  it("LessonPreview exposes the full body + course/module context", () => {
    const l: LessonPreview = {
      id: "l",
      slug: "l",
      title: "l",
      summary: "l",
      body: [],
      duration_minutes: 0,
      course: { slug: "c", title: "c" },
      module: { title: "m", position: 0 },
    };
    expect(l.body).toEqual([]);
  });
});
