import { z } from "zod";

// ─ Individual block schemas ──────────────────────────────────────

const HeadingBlock = z.object({
  id: z.string().min(1),
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3)]),
  text: z.string(),
});

const TextBlock = z.object({
  id: z.string().min(1),
  type: z.literal("text"),
  markdown: z.string(),
});

const ImageBlock = z.object({
  id: z.string().min(1),
  type: z.literal("image"),
  url: z.string().url(),
  alt: z.string(),
  caption: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const VideoBlock = z.object({
  id: z.string().min(1),
  type: z.literal("video"),
  provider: z.literal("vimeo"),
  vimeoId: z.string().min(1),
  title: z.string().optional(),
  durationSeconds: z.number().int().nonnegative().optional(),
});

const CalloutBlock = z.object({
  id: z.string().min(1),
  type: z.literal("callout"),
  variant: z.enum(["info", "warning", "success", "tip"]),
  title: z.string().optional(),
  markdown: z.string(),
});

const DownloadBlock = z.object({
  id: z.string().min(1),
  type: z.literal("download"),
  label: z.string(),
  url: z.string().url(),
  fileSize: z.string().optional(),
  fileType: z.string().optional(),
});

const CodeBlock = z.object({
  id: z.string().min(1),
  type: z.literal("code"),
  language: z.string(),
  code: z.string(),
  caption: z.string().optional(),
});

const QuizQuestion = z.object({
  id: z.string().min(1),
  type: z.enum(["single-choice", "multi-choice", "true-false"]),
  question: z.string(),
  options: z.array(z.object({ id: z.string().min(1), text: z.string() })).min(2),
  correctIds: z.array(z.string()).min(1),
  explanation: z.string().optional(),
});

const QuizBlock = z.object({
  id: z.string().min(1),
  type: z.literal("quiz"),
  prompt: z.string(),
  questions: z.array(QuizQuestion).min(1),
  passingScore: z.number().min(0).max(1).optional(),
  feedback: z
    .object({
      correct: z.string(),
      incorrect: z.string(),
    })
    .optional(),
});

const DividerBlock = z.object({
  id: z.string().min(1),
  type: z.literal("divider"),
});

const EmbedBlock = z.object({
  id: z.string().min(1),
  type: z.literal("embed"),
  provider: z.enum(["loom", "figma", "codesandbox", "generic-iframe"]),
  url: z.string().url(),
  height: z.number().int().positive().optional(),
});

// ─ Unified block + array ─────────────────────────────────────────

export const BlockSchema = z.discriminatedUnion("type", [
  HeadingBlock,
  TextBlock,
  ImageBlock,
  VideoBlock,
  CalloutBlock,
  DownloadBlock,
  CodeBlock,
  QuizBlock,
  DividerBlock,
  EmbedBlock,
]);

export const BlockArraySchema = z.array(BlockSchema);

export type Block = z.infer<typeof BlockSchema>;

// ─ Course seed schema (for seed script + AI generation contract) ─

const LessonSeed = z.object({
  slug: z.string().min(1),
  title: z.string(),
  summary: z.string(),
  duration_minutes: z.number().int().nonnegative(),
  is_free_preview: z.boolean(),
  position: z.number().int().nonnegative(),
  body: BlockArraySchema,
});

const ModuleSeed = z.object({
  title: z.string(),
  summary: z.string(),
  position: z.number().int().nonnegative(),
  lessons: z.array(LessonSeed),
});

export const CourseSeedSchema = z.object({
  course: z.object({
    slug: z.string().min(1),
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    hero_image_url: z.string().url().optional(),
    price_cents: z.number().int().nonnegative(),
    stripe_price_id: z.string().optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    instructor_name: z.string(),
    instructor_bio: z.string().optional(),
  }),
  modules: z.array(ModuleSeed).min(1),
});

export type CourseSeed = z.infer<typeof CourseSeedSchema>;
