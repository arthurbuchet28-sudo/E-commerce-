"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getUser } from "@/lib/supabase/server";

const slugSchema = z.string().regex(/^[a-z0-9-]{3,80}$/);

/** « Commencer la formation »: free courses enroll the member; paid ones need a purchase. */
export async function startCourse(
  _: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const courseId = z.uuid().parse(formData.get("courseId"));
  const slug = slugSchema.parse(formData.get("slug"));
  const { supabase, user } = await getUser();
  if (!supabase) redirect(`/formations/${slug}` as Route);
  if (!user)
    redirect(`/compte/connexion?next=${encodeURIComponent(`/formations/${slug}`)}` as Route);
  const { data: course } = await supabase
    .from("courses")
    .select("is_free")
    .eq("id", courseId)
    .single();
  if (!course?.is_free) redirect(`/formations/${slug}` as Route);
  const { error } = await supabase.rpc("enroll_free", { p_course_id: courseId });
  if (error)
    return { error: "L’inscription à la formation a échoué. Réessayez dans quelques instants." };
  redirect(`/apprendre/${slug}` as Route);
}

/** Marks a lesson as completed, then continues to the next step of the course. */
export async function completeLesson(formData: FormData) {
  const lessonId = z.uuid().parse(formData.get("lessonId"));
  const slug = slugSchema.parse(formData.get("slug"));
  const next = z
    .string()
    .regex(/^[a-z0-9-]{3,80}$/)
    .nullable()
    .parse(formData.get("next") || null);
  const { supabase, user } = await getUser();
  if (!supabase || !user) redirect("/compte/connexion" as Route);
  // course_id is recomputed by a trigger; RLS refuses courses without access.
  const { error } = await supabase.from("lesson_progress").upsert({
    user_id: user.id,
    lesson_id: lessonId,
    course_id: "00000000-0000-0000-0000-000000000000",
    completed_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
  });
  if (error) redirect(`/formations/${slug}` as Route);
  revalidatePath("/compte");
  redirect((next ? `/apprendre/${slug}/${next}` : `/apprendre/${slug}`) as Route);
}

export type QuizResult = {
  status: "idle" | "graded" | "error";
  message?: string;
  score?: number;
  passed?: boolean;
  passScore?: number;
  questions?: Array<{
    questionId: string;
    chosen: number;
    correctIndex: number;
    correct: boolean;
    explanation: string;
  }>;
};

/** Sends the answers to the database, which grades them (answers are never sent to the browser). */
export async function submitQuiz(_: QuizResult, formData: FormData): Promise<QuizResult> {
  const moduleId = z.uuid().safeParse(formData.get("moduleId"));
  const count = z.coerce.number().int().min(1).max(50).safeParse(formData.get("count"));
  if (!moduleId.success || !count.success)
    return { status: "error", message: "Le quiz n’a pas pu être envoyé." };
  const answers: number[] = [];
  for (let i = 0; i < count.data; i++) {
    const v = formData.get(`q${i}`);
    if (v === null)
      return { status: "error", message: "Répondez à toutes les questions avant de valider." };
    answers.push(Number(v));
  }
  const { supabase, user } = await getUser();
  if (!supabase || !user)
    return { status: "error", message: "Votre session a expiré : reconnectez-vous." };
  const { data, error } = await supabase.rpc("submit_quiz", {
    p_module_id: moduleId.data,
    p_answers: answers,
  });
  if (error || !data)
    return { status: "error", message: "Le quiz n’a pas pu être corrigé. Réessayez." };
  revalidatePath("/compte");
  return { status: "graded", ...(data as Omit<QuizResult, "status">) };
}

/** Issues the « attestation de suivi » (once the course is completed) and opens the PDF. */
export async function requestCertificate(formData: FormData) {
  const courseId = z.uuid().parse(formData.get("courseId"));
  const slug = slugSchema.parse(formData.get("slug"));
  const { supabase, user } = await getUser();
  if (!supabase || !user) redirect("/compte/connexion" as Route);
  const { data, error } = await supabase.rpc("issue_certificate", { p_course_id: courseId });
  if (error || !data) redirect(`/apprendre/${slug}` as Route);
  revalidatePath("/compte");
  redirect(`/api/formations/attestation/${data}` as Route);
}
