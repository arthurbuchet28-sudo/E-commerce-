import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteItem, saveQuestion } from "@/app/admin/actions";
import { ActionForm, AdminTextArea, AdminTextField } from "@/components/admin/ActionForm";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { MoveButtons } from "@/components/admin/MoveButtons";
import { breadcrumbFor, PageHeader } from "@/components/layout/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Modifier un quiz", robots: { index: false } };

type Question = {
  id: string;
  position: number;
  prompt: string;
  choices: string[];
  correct_index: number;
  explanation: string;
};

function QuestionFields({ prefix, q }: { prefix: string; q?: Question }) {
  return (
    <>
      <AdminTextArea
        id={`${prefix}-enonce`}
        name="prompt"
        label="Question"
        defaultValue={q?.prompt}
        rows={2}
        required
      />
      <AdminTextArea
        id={`${prefix}-choix`}
        name="choices"
        label="Réponses proposées"
        hint="Une réponse par ligne, de 2 à 6."
        defaultValue={q?.choices.join("\n")}
        rows={4}
        required
      />
      <AdminTextField
        id={`${prefix}-bonne`}
        name="correct"
        type="number"
        min={1}
        max={6}
        label="Numéro de la bonne réponse"
        hint="1 pour la première ligne, 2 pour la deuxième…"
        defaultValue={q ? q.correct_index + 1 : undefined}
        required
      />
      <AdminTextArea
        id={`${prefix}-explication`}
        name="explanation"
        label="Explication affichée après la correction"
        defaultValue={q?.explanation}
        rows={3}
        required
      />
    </>
  );
}

export default async function AdminQuizPage({
  params,
}: PageProps<"/admin/formations/[id]/quiz/[moduleId]">) {
  const { id, moduleId } = await params;
  const { supabase } = await requireAdmin(`/admin/formations/${id}/quiz/${moduleId}`);
  if (!/^[0-9a-f-]{36}$/.test(id) || !/^[0-9a-f-]{36}$/.test(moduleId)) notFound();
  const { data: mod } = await supabase
    .from("modules")
    .select("id, title, pass_score, course_id, courses(title)")
    .eq("id", moduleId)
    .eq("course_id", id)
    .maybeSingle();
  if (!mod) notFound();
  const { data } = await supabase.rpc("admin_quiz_questions", { p_module_id: moduleId });
  const questions = (data ?? []) as Question[];
  const courseTitle = (mod.courses as { title: string } | null)?.title ?? "Formation";

  return (
    <>
      <PageHeader
        title={`Quiz : ${mod.title}`}
        lead={`Seuil de réussite : ${mod.pass_score} %. Les bonnes réponses ne sont jamais envoyées aux élèves : la correction se fait sur le serveur.`}
        crumbs={breadcrumbFor("/admin/formations/x", `Quiz : ${mod.title}`, [
          { label: courseTitle, href: `/admin/formations/${id}` as Route },
        ])}
      />
      <div className="flex flex-col gap-8">
        <p>
          <Link href={`/admin/formations/${id}` as Route} className="link">
            Retour à la formation
          </Link>
        </p>
        {questions.length === 0 && <p>Aucune question : le module n’a pas de quiz.</p>}
        <ol className="flex flex-col gap-6">
          {questions.map((q, i) => (
            <li
              key={q.id}
              className="flex flex-col gap-4 rounded-ui border border-line bg-sheet p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-h3">Question {i + 1}</h2>
                <MoveButtons
                  kind="question"
                  id={q.id}
                  courseId={id}
                  label={`question ${i + 1}`}
                  first={i === 0}
                  last={i === questions.length - 1}
                />
              </div>
              <ActionForm action={saveQuestion} submitLabel="Enregistrer la question">
                <input type="hidden" name="id" value={q.id} />
                <input type="hidden" name="moduleId" value={moduleId} />
                <input type="hidden" name="courseId" value={id} />
                <QuestionFields prefix={`q-${q.id}`} q={q} />
              </ActionForm>
              <DeleteForm
                action={deleteItem}
                hidden={{ kind: "question", id: q.id, courseId: id }}
                label="Supprimer la question"
                warning="Je confirme la suppression de cette question."
              />
            </li>
          ))}
        </ol>
        <section
          aria-labelledby="nouvelle-question"
          className="flex max-w-2xl flex-col gap-4 rounded-ui border border-dashed border-line p-5"
        >
          <h2 id="nouvelle-question" className="text-h3">
            Ajouter une question
          </h2>
          <ActionForm action={saveQuestion} submitLabel="Ajouter la question" variant="secondary">
            <input type="hidden" name="moduleId" value={moduleId} />
            <input type="hidden" name="courseId" value={id} />
            <QuestionFields prefix="nq" />
          </ActionForm>
        </section>
      </div>
    </>
  );
}
