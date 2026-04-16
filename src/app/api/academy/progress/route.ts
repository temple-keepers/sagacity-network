import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";

export async function POST(req: NextRequest) {
  if (!isAcademyEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { lessonId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const lessonId = body.lessonId;
  if (!lessonId || typeof lessonId !== "string") {
    return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  // RLS on lessons will refuse the read unless the learner is enrolled
  // (or it's a free preview — but we don't mark previews complete).
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, module_id, is_free_preview, modules!inner(course_id)")
    .eq("id", lessonId)
    .maybeSingle();

  if (lessonError) {
    console.error("lesson lookup failed:", lessonError);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
  if (!lesson) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  if (lesson.is_free_preview) {
    // Free previews aren't part of the progress model; pretend success.
    return NextResponse.json({ ok: true, skipped: "preview" });
  }

  // Upsert — duplicates silently ignored.
  const { error: upsertError } = await supabase
    .from("lesson_progress")
    .upsert(
      { user_id: user.id, lesson_id: lessonId, completed_at: new Date().toISOString() },
      { onConflict: "user_id,lesson_id" }
    );

  if (upsertError) {
    console.error("progress upsert failed:", upsertError);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }

  // Return updated completion count for the course so the client can update the bar.
  const modulesRef = lesson.modules as { course_id: string } | { course_id: string }[] | null;
  const courseId = Array.isArray(modulesRef) ? modulesRef[0]?.course_id : modulesRef?.course_id;
  if (!courseId) {
    return NextResponse.json({ ok: true, completedInCourse: 1 });
  }
  const { count } = await supabase
    .from("lesson_progress")
    .select("lesson_id, lessons!inner(module_id, modules!inner(course_id))", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .eq("lessons.modules.course_id", courseId);

  return NextResponse.json({ ok: true, completedInCourse: count ?? 0 });
}
