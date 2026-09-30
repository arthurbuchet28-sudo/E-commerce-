"use server";

import { existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { FormState } from "@/app/compte/actions";
import { requireAdmin } from "@/lib/admin/auth";
import {
  checkPdf,
  courseSchema,
  lessonSchema,
  moduleSchema,
  newCourseSchema,
  publishProblems,
  questionSchema,
  storageFileName,
} from "@/lib/admin/schemas";
import { CONTENT_DIR } from "@/lib/content/files";
import { paymentProvider } from "@/lib/services/payments";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Back-office mutations. Each action checks the admin role, validates its input with Zod,
 * then writes with the admin's own session (RLS: public.is_admin()).
 */

const SAVED: FormState = { status: "success", message: "Modifications enregistrées." };
const uuid = z.uuid();

function invalid(error: z.ZodError): FormState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
  return { status: "error", message: "Vérifiez les champs signalés.", fieldErrors };
}

function dbError(error: { code?: string; message: string }): FormState {
  if (error.code === "23505")
    return {
      status: "error",
      message: "Cette adresse (slug) ou cette position est déjà utilisée.",
    };
  if (error.code === "23503")
    return {
      status: "error",
      message: "Impossible : des élèves, des achats ou des attestations y sont rattachés.",
    };
  console.error(`[admin] ${error.code ?? ""} ${error.message}`);
  return { status: "error", message: "L’enregistrement a échoué. Réessayez." };
}

const fields = (fd: FormData, names: string[]) =>
  Object.fromEntries(names.map((n) => [n, fd.get(n) ?? undefined]));

async function revalidateCourse(courseId: string, slug?: string) {
  revalidatePath(`/admin/formations/${courseId}`);
  revalidatePath("/admin/formations");
  revalidatePath("/formations");
  if (slug) revalidatePath(`/formations/${slug}`);
}

// --- Courses ------------------------------------------------------------------

export async function createCourse(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const parsed = newCourseSchema.safeParse(fields(fd, ["title", "slug", "code"]));
  if (!parsed.success) return invalid(parsed.error);
  const { data, error } = await supabase
    .from("courses")
    .insert({
      ...parsed.data,
      summary: "[À COMPLÉTER]",
      audience: "[À COMPLÉTER]",
      level: "debutant",
      is_free: true,
      status: "draft",
    })
    .select("id")
    .single();
  if (error) return dbError(error);
  revalidatePath("/admin/formations");
  redirect(`/admin/formations/${data.id}` as Route);
}

export async function updateCourse(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = uuid.parse(fd.get("id"));
  const parsed = courseSchema.safeParse(
    fields(fd, [
      "title",
      "slug",
      "code",
      "summary",
      "audience",
      "objectives",
      "prerequisites",
      "level",
      "isFree",
      "price",
      "accessMonths",
      "position",
      "faq",
    ]),
  );
  if (!parsed.success) return invalid(parsed.error);
  const v = parsed.data;
  const { error } = await supabase
    .from("courses")
    .update({
      title: v.title,
      slug: v.slug,
      code: v.code,
      summary: v.summary,
      audience: v.audience,
      objectives: v.objectives,
      prerequisites: v.prerequisites,
      level: v.level,
      is_free: v.isFree,
      price_cents: v.priceCents,
      access_months: v.accessMonths,
      position: v.position,
      faq: v.faq,
    })
    .eq("id", id);
  if (error) return dbError(error);
  await revalidateCourse(id, v.slug);
  return SAVED;
}

function lessonFileExists(mdxPath: string): boolean {
  return existsSync(path.join(CONTENT_DIR, "formations", mdxPath));
}

export async function setCourseStatus(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = uuid.parse(fd.get("id"));
  const status = z.enum(["draft", "published"]).parse(fd.get("status"));
  const { data: course } = await supabase
    .from("courses")
    .select(
      "slug, is_free, price_cents, modules(id, title, position), lessons(module_id, title, mdx_path)",
    )
    .eq("id", id)
    .single();
  if (!course) return { status: "error", message: "Formation introuvable." };
  if (status === "published") {
    const problems = publishProblems(
      {
        isFree: course.is_free,
        priceCents: course.price_cents,
        modules: course.modules.map((m) => ({
          title: m.title,
          lessons: course.lessons
            .filter((l) => l.module_id === m.id)
            .map((l) => ({ title: l.title, mdxPath: l.mdx_path })),
        })),
      },
      lessonFileExists,
    );
    if (problems.length)
      return { status: "error", message: `Publication impossible. ${problems.join(" ")}` };
  }
  const { error } = await supabase.from("courses").update({ status }).eq("id", id);
  if (error) return dbError(error);
  await revalidateCourse(id, course.slug);
  return {
    status: "success",
    message: status === "published" ? "Formation publiée." : "Formation repassée en brouillon.",
  };
}

export async function deleteCourse(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = uuid.parse(fd.get("id"));
  if (fd.get("confirm") !== "on")
    return { status: "error", message: "Cochez la case de confirmation pour supprimer." };
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) return dbError(error);
  revalidatePath("/admin/formations");
  revalidatePath("/formations");
  redirect("/admin/formations" as Route);
}

// --- Modules, lessons, questions -------------------------------------------------

/** Next free position among the siblings (modules of a course, lessons of a module). */
async function nextPosition(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  kind: "module" | "lesson",
  parentId: string,
): Promise<number> {
  const { data } =
    kind === "module"
      ? await supabase.from("modules").select("position").eq("course_id", parentId)
      : await supabase.from("lessons").select("position").eq("module_id", parentId);
  return Math.max(0, ...(data ?? []).map((r) => r.position)) + 1;
}

export async function addModule(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const courseId = uuid.parse(fd.get("courseId"));
  const parsed = moduleSchema.safeParse(fields(fd, ["title", "passScore"]));
  if (!parsed.success) return invalid(parsed.error);
  const { error } = await supabase.from("modules").insert({
    course_id: courseId,
    title: parsed.data.title,
    pass_score: parsed.data.passScore,
    position: await nextPosition(supabase, "module", courseId),
  });
  if (error) return dbError(error);
  await revalidateCourse(courseId);
  return { status: "success", message: "Module ajouté." };
}

export async function updateModule(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = uuid.parse(fd.get("id"));
  const courseId = uuid.parse(fd.get("courseId"));
  const parsed = moduleSchema.safeParse(fields(fd, ["title", "passScore"]));
  if (!parsed.success) return invalid(parsed.error);
  const { error } = await supabase
    .from("modules")
    .update({ title: parsed.data.title, pass_score: parsed.data.passScore })
    .eq("id", id);
  if (error) return dbError(error);
  await revalidateCourse(courseId);
  return SAVED;
}

export async function addLesson(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const courseId = uuid.parse(fd.get("courseId"));
  const moduleId = uuid.parse(fd.get("moduleId"));
  const parsed = lessonSchema.safeParse(
    fields(fd, ["title", "slug", "durationMin", "mdxPath", "hasVideo", "videoId", "isPreview"]),
  );
  if (!parsed.success) return invalid(parsed.error);
  const v = parsed.data;
  const { error } = await supabase.from("lessons").insert({
    course_id: courseId,
    module_id: moduleId,
    position: await nextPosition(supabase, "lesson", moduleId),
    title: v.title,
    slug: v.slug,
    duration_min: v.durationMin,
    mdx_path: v.mdxPath,
    has_video: v.hasVideo,
    video_id: v.videoId,
    is_preview: v.isPreview,
  });
  if (error) return dbError(error);
  await revalidateCourse(courseId);
  return {
    status: "success",
    message: lessonFileExists(v.mdxPath)
      ? "Leçon ajoutée."
      : `Leçon ajoutée. Pensez à créer son texte : content/formations/${v.mdxPath}.`,
  };
}

export async function updateLesson(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = uuid.parse(fd.get("id"));
  const courseId = uuid.parse(fd.get("courseId"));
  const parsed = lessonSchema.safeParse(
    fields(fd, ["title", "slug", "durationMin", "mdxPath", "hasVideo", "videoId", "isPreview"]),
  );
  if (!parsed.success) return invalid(parsed.error);
  const v = parsed.data;
  const { error } = await supabase
    .from("lessons")
    .update({
      title: v.title,
      slug: v.slug,
      duration_min: v.durationMin,
      mdx_path: v.mdxPath,
      has_video: v.hasVideo,
      video_id: v.videoId,
      is_preview: v.isPreview,
    })
    .eq("id", id);
  if (error) return dbError(error);
  await revalidateCourse(courseId);
  return lessonFileExists(v.mdxPath)
    ? SAVED
    : {
        status: "success",
        message: `Enregistré. Texte introuvable : content/formations/${v.mdxPath}.`,
      };
}

const deletable = { module: "modules", lesson: "lessons", question: "quiz_questions" } as const;

/** Deletes a module (with its lessons and quiz), a lesson or a question, after confirmation. */
export async function deleteItem(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const kind = z.enum(["module", "lesson", "question"]).parse(fd.get("kind"));
  const id = uuid.parse(fd.get("id"));
  const courseId = uuid.parse(fd.get("courseId"));
  if (fd.get("confirm") !== "on")
    return { status: "error", message: "Cochez la case de confirmation pour supprimer." };
  const { error } = await supabase.from(deletable[kind]).delete().eq("id", id);
  if (error) return dbError(error);
  await revalidateCourse(courseId);
  revalidatePath(`/admin/formations/${courseId}/quiz`, "layout");
  return { status: "success", message: "Supprimé." };
}

export async function moveItem(fd: FormData) {
  const { supabase } = await requireAdmin();
  const kind = z.enum(["module", "lesson", "question"]).parse(fd.get("kind"));
  const id = uuid.parse(fd.get("id"));
  const courseId = uuid.parse(fd.get("courseId"));
  const direction = z.coerce
    .number()
    .pipe(z.union([z.literal(-1), z.literal(1)]))
    .parse(fd.get("direction"));
  await supabase.rpc("admin_move", { p_kind: kind, p_id: id, p_direction: direction });
  await revalidateCourse(courseId);
  revalidatePath(`/admin/formations/${courseId}/quiz`, "layout");
}

export async function saveQuestion(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const moduleId = uuid.parse(fd.get("moduleId"));
  const courseId = uuid.parse(fd.get("courseId"));
  const id = fd.get("id") ? uuid.parse(fd.get("id")) : null;
  const parsed = questionSchema.safeParse(
    fields(fd, ["prompt", "choices", "correct", "explanation"]),
  );
  if (!parsed.success) return invalid(parsed.error);
  const row = {
    prompt: parsed.data.prompt,
    choices: parsed.data.choices,
    correct_index: parsed.data.correctIndex,
    explanation: parsed.data.explanation,
  };
  let error;
  if (id) {
    ({ error } = await supabase.from("quiz_questions").update(row).eq("id", id));
  } else {
    const { data: last } = await supabase.rpc("admin_quiz_questions", { p_module_id: moduleId });
    const position = Math.max(0, ...(last ?? []).map((q) => q.position)) + 1;
    ({ error } = await supabase
      .from("quiz_questions")
      .insert({ ...row, module_id: moduleId, position }));
  }
  if (error) return dbError(error);
  revalidatePath(`/admin/formations/${courseId}/quiz/${moduleId}`);
  await revalidateCourse(courseId);
  return id ? SAVED : { status: "success", message: "Question ajoutée." };
}

// --- Resources (private Storage bucket) --------------------------------------------

export async function uploadResource(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const lessonId = uuid.parse(fd.get("lessonId"));
  const courseId = uuid.parse(fd.get("courseId"));
  const label = z.string().trim().min(1).max(160).safeParse(fd.get("label"));
  if (!label.success)
    return {
      status: "error",
      message: "Vérifiez les champs signalés.",
      fieldErrors: { label: "Indiquez un intitulé." },
    };
  const file = fd.get("file");
  if (!(file instanceof File))
    return {
      status: "error",
      message: "Vérifiez les champs signalés.",
      fieldErrors: { file: "Choisissez un fichier PDF." },
    };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const problem = checkPdf(file.name, file.size, bytes);
  if (problem)
    return {
      status: "error",
      message: "Vérifiez les champs signalés.",
      fieldErrors: { file: problem },
    };

  const storage = createAdminClient();
  if (!storage) return { status: "error", message: "Stockage indisponible." };
  const storagePath = `${lessonId}/${randomUUID().slice(0, 8)}-${storageFileName(file.name)}`;
  const { error: upload } = await storage.storage
    .from("ressources")
    .upload(storagePath, bytes, { contentType: "application/pdf", upsert: false });
  if (upload) {
    console.error(`[admin] upload failed: ${upload.message}`);
    return { status: "error", message: "L’envoi du fichier a échoué." };
  }
  const { error } = await supabase
    .from("lesson_resources")
    .insert({ lesson_id: lessonId, label: label.data, storage_path: storagePath });
  if (error) {
    await storage.storage.from("ressources").remove([storagePath]);
    return dbError(error);
  }
  await revalidateCourse(courseId);
  return { status: "success", message: "Ressource ajoutée." };
}

export async function deleteResource(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = uuid.parse(fd.get("id"));
  const courseId = uuid.parse(fd.get("courseId"));
  const { data, error } = await supabase
    .from("lesson_resources")
    .delete()
    .eq("id", id)
    .select("storage_path")
    .single();
  if (error) return dbError(error);
  await createAdminClient()?.storage.from("ressources").remove([data.storage_path]);
  await revalidateCourse(courseId);
  return { status: "success", message: "Ressource supprimée." };
}

// --- Refunds -------------------------------------------------------------------------

/** Retries the refund of a withdrawal whose automatic refund failed. */
export async function retryRefund(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = uuid.parse(fd.get("withdrawalId"));
  const service = createAdminClient();
  if (!service) return { status: "error", message: "Service indisponible." };
  const { data: w } = await service
    .from("withdrawals")
    .select("id, refund_status, orders(stripe_payment_intent)")
    .eq("id", id)
    .single();
  const intent = (w?.orders as { stripe_payment_intent: string | null } | null)
    ?.stripe_payment_intent;
  if (!w || w.refund_status === "succeeded" || !intent)
    return { status: "error", message: "Aucun remboursement à relancer." };
  try {
    const refund = await paymentProvider().refund(intent, `withdrawal-${id}`);
    await service
      .from("withdrawals")
      .update({
        stripe_refund_id: refund.id,
        refund_status:
          refund.status === "failed"
            ? "failed"
            : refund.status === "succeeded"
              ? "succeeded"
              : "pending",
        refunded_at: refund.status === "succeeded" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    revalidatePath("/admin/achats");
    return refund.status === "failed"
      ? {
          status: "error",
          message: "Stripe a refusé le remboursement : voir le tableau de bord Stripe.",
        }
      : { status: "success", message: "Remboursement relancé." };
  } catch (e) {
    console.error(`[admin] refund retry failed: ${(e as Error).message}`);
    return {
      status: "error",
      message: "Le remboursement a échoué : voir le tableau de bord Stripe.",
    };
  }
}

// --- Contact messages ------------------------------------------------------------------

export async function markMessageHandled(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = uuid.parse(fd.get("id"));
  const handled = fd.get("handled") === "on";
  await supabase
    .from("contact_messages")
    .update({ handled_at: handled ? new Date().toISOString() : null })
    .eq("id", id);
  revalidatePath("/admin/messages");
}
