import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import type { createClient } from "@/lib/supabase/server";

import { courseProgress, type LessonRef, type ModuleRef } from "./progress";

export type Faq = Array<{ question: string; answer: string }>;

export type CourseDetail = {
  id: string;
  slug: string;
  code: string;
  title: string;
  summary: string;
  objectives: string[];
  audience: string;
  prerequisites: string[];
  level: "debutant" | "intermediaire";
  isFree: boolean;
  priceCents: number | null;
  accessMonths: number;
  faq: Faq;
  totalMinutes: number;
  modules: Array<
    ModuleRef & {
      passScore: number;
      lessons: Array<
        LessonRef & {
          position: number;
          durationMin: number;
          hasVideo: boolean;
          videoId: string | null;
          mdxPath: string;
          isPreview: boolean;
        }
      >;
    }
  >;
};

const COURSE_SELECT =
  "id, slug, code, title, summary, objectives, audience, prerequisites, level, is_free, price_cents, access_months, faq, position, modules(id, position, title, pass_score, question_count), lessons(id, module_id, position, slug, title, duration_min, has_video, video_id, mdx_path, is_preview)";

type Row = {
  id: string;
  slug: string;
  code: string;
  title: string;
  summary: string;
  objectives: string[];
  audience: string;
  prerequisites: string[];
  level: string;
  is_free: boolean;
  price_cents: number | null;
  access_months: number;
  faq: unknown;
  modules: Array<{
    id: string;
    position: number;
    title: string;
    pass_score: number;
    question_count: number;
  }>;
  lessons: Array<{
    id: string;
    module_id: string;
    position: number;
    slug: string;
    title: string;
    duration_min: number;
    has_video: boolean;
    video_id: string | null;
    mdx_path: string;
    is_preview: boolean;
  }>;
};

function toCourse(row: Row, quizModuleIds: ReadonlySet<string>): CourseDetail {
  const modules = [...row.modules]
    .sort((a, b) => a.position - b.position)
    .map((m) => ({
      id: m.id,
      position: m.position,
      title: m.title,
      passScore: m.pass_score,
      hasQuiz: quizModuleIds.has(m.id),
      lessons: row.lessons
        .filter((l) => l.module_id === m.id)
        .sort((a, b) => a.position - b.position)
        .map((l) => ({
          id: l.id,
          slug: l.slug,
          moduleId: l.module_id,
          title: l.title,
          position: l.position,
          durationMin: l.duration_min,
          hasVideo: l.has_video,
          videoId: l.video_id,
          mdxPath: l.mdx_path,
          isPreview: l.is_preview,
        })),
    }));
  return {
    id: row.id,
    slug: row.slug,
    code: row.code,
    title: row.title,
    summary: row.summary,
    objectives: row.objectives,
    audience: row.audience,
    prerequisites: row.prerequisites,
    level: row.level === "intermediaire" ? "intermediaire" : "debutant",
    isFree: row.is_free,
    priceCents: row.price_cents,
    accessMonths: row.access_months,
    faq: Array.isArray(row.faq) ? (row.faq as Faq) : [],
    totalMinutes: row.lessons.reduce((n, l) => n + l.duration_min, 0),
    modules,
  };
}

/** Modules having a quiz (question_count is public, the questions are not). */
function quizModules(row: Row): Set<string> {
  return new Set(row.modules.filter((m) => m.question_count > 0).map((m) => m.id));
}

export async function getCatalogue(): Promise<CourseDetail[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("courses").select(COURSE_SELECT).order("position");
  if (error || !data) return [];
  return (data as unknown as Row[]).map((row) => toCourse(row, quizModules(row)));
}

export async function getCourse(slug: string): Promise<CourseDetail | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as unknown as Row;
  return toCourse(row, quizModules(row));
}

type ServerClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;

/** Everything about a member's journey in a course (RLS: only their own rows). */
export async function getLearnerState(
  supabase: ServerClient,
  course: CourseDetail,
  userId: string,
) {
  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const moduleIds = course.modules.map((m) => m.id);
  const [enrollment, progress, attempts, certificate] = await Promise.all([
    supabase
      .from("enrollments")
      .select("source, created_at, starts_at, expires_at, revoked_at")
      .eq("user_id", userId)
      .eq("course_id", course.id)
      .maybeSingle(),
    supabase
      .from("lesson_progress")
      .select("lesson_id, completed_at, last_seen_at")
      .eq("user_id", userId)
      .in("lesson_id", lessonIds),
    supabase
      .from("quiz_attempts")
      .select("module_id, score, passed, created_at")
      .eq("user_id", userId)
      .in("module_id", moduleIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("certificates")
      .select("id, serial, issued_at")
      .eq("user_id", userId)
      .eq("course_id", course.id)
      .maybeSingle(),
  ]);
  // Mirrors public.has_access(): purchases may open later (no waiver) or be revoked.
  const now = new Date();
  const e = enrollment.data;
  const hasAccess =
    !!e &&
    !e.revoked_at &&
    new Date(e.starts_at) <= now &&
    (!e.expires_at || new Date(e.expires_at) > now);
  const completed = new Set(
    (progress.data ?? []).filter((p) => p.completed_at).map((p) => p.lesson_id),
  );
  const passed = new Set((attempts.data ?? []).filter((a) => a.passed).map((a) => a.module_id));
  const lastSeen = [...(progress.data ?? [])].sort((a, b) =>
    b.last_seen_at.localeCompare(a.last_seen_at),
  )[0]?.lesson_id;
  const bestScore = new Map<string, number>();
  for (const a of attempts.data ?? [])
    bestScore.set(a.module_id, Math.max(bestScore.get(a.module_id) ?? 0, a.score));
  const lessons = course.modules.flatMap((m) => m.lessons);
  return {
    enrollment: enrollment.data,
    hasAccess,
    completed,
    passed,
    bestScore,
    certificate: certificate.data,
    progress: courseProgress(course.modules, lessons, completed, passed, lastSeen),
  };
}
