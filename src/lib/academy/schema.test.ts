import { describe, it, expect } from "vitest";
import { BlockSchema, BlockArraySchema, CourseSeedSchema } from "./schema";

describe("BlockSchema — round-trip every block type", () => {
  it("parses a heading block", () => {
    const input = { id: "h1", type: "heading", level: 2, text: "Foundations" };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses a text block", () => {
    const input = { id: "t1", type: "text", markdown: "Hello **world**." };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses an image block with alt text", () => {
    const input = {
      id: "i1",
      type: "image",
      url: "https://example.com/a.png",
      alt: "Diagram",
      caption: "A diagram",
      width: 800,
      height: 600,
    };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses a video block with vimeo provider", () => {
    const input = { id: "v1", type: "video", provider: "vimeo", vimeoId: "123456789", durationSeconds: 540 };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses a callout block", () => {
    const input = { id: "c1", type: "callout", variant: "tip", title: "Try this", markdown: "Step 1..." };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses a download block", () => {
    const input = { id: "d1", type: "download", label: "Worksheet", url: "https://x.com/a.pdf", fileSize: "1.2 MB", fileType: "pdf" };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses a code block", () => {
    const input = { id: "co1", type: "code", language: "python", code: "print('hi')" };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses a quiz block with single-choice question", () => {
    const input = {
      id: "q1",
      type: "quiz",
      prompt: "Test your knowledge",
      passingScore: 0.7,
      questions: [
        {
          id: "qq1",
          type: "single-choice",
          question: "What is 2+2?",
          options: [
            { id: "a", text: "3" },
            { id: "b", text: "4" },
          ],
          correctIds: ["b"],
          explanation: "Basic arithmetic.",
        },
      ],
    };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses a divider block", () => {
    const input = { id: "dv1", type: "divider" };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses an embed block", () => {
    const input = { id: "e1", type: "embed", provider: "loom", url: "https://loom.com/share/abc", height: 480 };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("rejects an unknown block type", () => {
    expect(() => BlockSchema.parse({ id: "x", type: "unknown-type" })).toThrow();
  });

  it("rejects a heading with invalid level", () => {
    expect(() => BlockSchema.parse({ id: "h", type: "heading", level: 5, text: "Too deep" })).toThrow();
  });

  it("rejects a quiz block with empty questions", () => {
    expect(() =>
      BlockSchema.parse({ id: "q", type: "quiz", prompt: "Empty", questions: [] })
    ).toThrow();
  });

  it("rejects a block missing an id", () => {
    expect(() => BlockSchema.parse({ type: "text", markdown: "No id" })).toThrow();
  });
});

describe("BlockArraySchema", () => {
  it("accepts an array of mixed block types", () => {
    const blocks = [
      { id: "h1", type: "heading", level: 2, text: "Intro" },
      { id: "t1", type: "text", markdown: "Body." },
      { id: "d1", type: "divider" },
    ];
    expect(BlockArraySchema.parse(blocks)).toEqual(blocks);
  });

  it("accepts an empty array", () => {
    expect(BlockArraySchema.parse([])).toEqual([]);
  });

  it("rejects if any block is invalid", () => {
    expect(() =>
      BlockArraySchema.parse([
        { id: "h1", type: "heading", level: 2, text: "OK" },
        { id: "bad", type: "invalid" },
      ])
    ).toThrow();
  });
});

describe("CourseSeedSchema", () => {
  it("parses a minimal course seed", () => {
    const seed = {
      course: {
        slug: "test-course",
        title: "Test",
        subtitle: "A test",
        description: "Long description.",
        price_cents: 14900,
        level: "beginner",
        instructor_name: "Denise Isaac",
      },
      modules: [
        {
          title: "Module 1",
          summary: "First module",
          position: 0,
          lessons: [
            {
              slug: "welcome",
              title: "Welcome",
              summary: "First lesson",
              duration_minutes: 5,
              is_free_preview: true,
              position: 0,
              body: [{ id: "h1", type: "heading", level: 2, text: "Hi" }],
            },
          ],
        },
      ],
    };
    expect(CourseSeedSchema.parse(seed)).toEqual(seed);
  });

  it("rejects a course with no modules", () => {
    const seed = {
      course: { slug: "t", title: "T", subtitle: "s", description: "d", price_cents: 0, level: "beginner", instructor_name: "D" },
      modules: [],
    };
    expect(() => CourseSeedSchema.parse(seed)).toThrow();
  });

  it("rejects an invalid level", () => {
    const seed = {
      course: { slug: "t", title: "T", subtitle: "s", description: "d", price_cents: 0, level: "expert", instructor_name: "D" },
      modules: [{ title: "M", summary: "s", position: 0, lessons: [] }],
    };
    expect(() => CourseSeedSchema.parse(seed)).toThrow();
  });
});
