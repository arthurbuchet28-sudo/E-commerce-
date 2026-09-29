import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addLesson,
  addModule,
  deleteCourse,
  deleteItem,
  deleteResource,
  setCourseStatus,
  updateCourse,
  updateLesson,
  updateModule,
  uploadResource,
} from "@/app/admin/actions";
import {
  ActionForm,
  AdminCheckbox,
  AdminSelect,
  AdminTextArea,
  AdminTextField,
} from "@/components/admin/ActionForm";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { MoveButtons } from "@/components/admin/MoveButtons";
import { breadcrumbFor, PageHeader } from "@/components/layout/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { formatEurosInput, formatFaq } from "@/lib/admin/schemas";

export const metadata: Metadata = { title: "Modifier une formation", robots: { index: false } };

type Lesson = {
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
  lesson_resources: Array<{ id: string; label: string; storage_path: string }>;
};

function LessonFields({
  prefix,
  lesson,
  courseSlug,
}: {
  prefix: string;
  lesson?: Lesson;
  courseSlug: string;
}) {
  return (
    <>
      <AdminTextField
        id={`${prefix}-titre`}
        name="title"
        label="Titre"
        defaultValue={lesson?.title}
        required
      />
      <div className="grid gap-4 md:grid-cols-2">
        <AdminTextField
          id={`${prefix}-slug`}
          name="slug"
          label="Adresse (slug)"
          defaultValue={lesson?.slug}
          required
        />
        <AdminTextField
          id={`${prefix}-duree`}
          name="durationMin"
          type="number"
          min={1}
          label="Durée (minutes)"
          defaultValue={lesson?.duration_min ?? 10}
          required
        />
      </div>
      <AdminTextField
        id={`${prefix}-mdx`}
        name="mdxPath"
        label="Fichier du texte"
        hint={`Dans content/formations/, par exemple : ${courseSlug}/ma-lecon.mdx`}
        defaultValue={lesson?.mdx_path ?? `${courseSlug}/`}
        required
      />
      <AdminCheckbox
        id={`${prefix}-video`}
        name="hasVideo"
        label="Leçon en vidéo"
        defaultChecked={lesson?.has_video}
      />
      <AdminTextField
        id={`${prefix}-video-id`}
        name="videoId"
        label="Identifiant de la vidéo (Bunny Stream)"
        hint="Téléversez la vidéo dans la bibliothèque Bunny Stream, puis collez ici son identifiant (Video ID)."
        defaultValue={lesson?.video_id ?? ""}
      />
      <AdminCheckbox
        id={`${prefix}-apercu`}
        name="isPreview"
        label="Aperçu gratuit (leçon ouverte à tous)"
        defaultChecked={lesson?.is_preview}
      />
    </>
  );
}

export default async function AdminCoursePage({ params }: PageProps<"/admin/formations/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin(`/admin/formations/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data: course } = await supabase
    .from("courses")
    .select(
      "*, modules(id, position, title, pass_score, question_count), lessons(id, module_id, position, slug, title, duration_min, has_video, video_id, mdx_path, is_preview, lesson_resources(id, label, storage_path))",
    )
    .eq("id", id)
    .maybeSingle();
  if (!course) notFound();

  const modules = [...course.modules].sort((a, b) => a.position - b.position);
  const lessons = (course.lessons as Lesson[]).sort((a, b) => a.position - b.position);
  const faq = (course.faq ?? []) as Array<{ question: string; answer: string }>;
  const published = course.status === "published";

  return (
    <>
      <PageHeader
        title={course.title}
        lead={
          published ? "Publiée : visible dans le catalogue." : "Brouillon : invisible du public."
        }
        crumbs={breadcrumbFor("/admin/formations/x", course.title)}
      />
      <div className="flex flex-col gap-10">
        <section
          aria-labelledby="publication-title"
          className="flex flex-col gap-3 rounded-ui border border-line bg-sheet p-6"
        >
          <h2 id="publication-title" className="text-h3">
            Publication
          </h2>
          {published && (
            <p>
              <Link href={`/formations/${course.slug}` as Route} className="link">
                Voir la page publique
              </Link>
            </p>
          )}
          <ActionForm
            action={setCourseStatus}
            submitLabel={published ? "Repasser en brouillon" : "Publier la formation"}
            variant={published ? "secondary" : "primary"}
          >
            <input type="hidden" name="id" value={course.id} />
            <input type="hidden" name="status" value={published ? "draft" : "published"} />
          </ActionForm>
        </section>

        <section aria-labelledby="infos-title" className="flex flex-col gap-4">
          <h2 id="infos-title" className="text-h2">
            Présentation et prix
          </h2>
          <ActionForm action={updateCourse} submitLabel="Enregistrer la présentation">
            <input type="hidden" name="id" value={course.id} />
            <AdminTextField
              id="f-titre"
              name="title"
              label="Titre"
              defaultValue={course.title}
              required
            />
            <div className="grid gap-4 md:grid-cols-3">
              <AdminTextField
                id="f-slug"
                name="slug"
                label="Adresse (slug)"
                defaultValue={course.slug}
                required
              />
              <AdminTextField
                id="f-code"
                name="code"
                label="Code"
                defaultValue={course.code}
                required
              />
              <AdminTextField
                id="f-position"
                name="position"
                type="number"
                min={0}
                label="Ordre dans le catalogue"
                defaultValue={course.position}
                required
              />
            </div>
            <AdminTextArea
              id="f-resume"
              name="summary"
              label="Résumé"
              defaultValue={course.summary}
              required
            />
            <AdminTextArea
              id="f-public"
              name="audience"
              label="Pour qui"
              defaultValue={course.audience}
              required
            />
            <AdminTextArea
              id="f-objectifs"
              name="objectives"
              label="Objectifs"
              hint="Un objectif par ligne."
              defaultValue={course.objectives.join("\n")}
            />
            <AdminTextArea
              id="f-prerequis"
              name="prerequisites"
              label="Prérequis"
              hint="Un prérequis par ligne."
              defaultValue={course.prerequisites.join("\n")}
            />
            <div className="grid gap-4 md:grid-cols-3">
              <AdminSelect id="f-niveau" name="level" label="Niveau" defaultValue={course.level}>
                <option value="debutant">Débutant</option>
                <option value="intermediaire">Intermédiaire</option>
              </AdminSelect>
              <AdminTextField
                id="f-prix"
                name="price"
                label="Prix TTC (€)"
                inputMode="decimal"
                hint="Ignoré si la formation est gratuite."
                defaultValue={formatEurosInput(course.price_cents)}
              />
              <AdminTextField
                id="f-acces"
                name="accessMonths"
                type="number"
                min={1}
                label="Durée d’accès (mois)"
                defaultValue={course.access_months}
                required
              />
            </div>
            <AdminCheckbox
              id="f-gratuite"
              name="isFree"
              label="Formation gratuite (avec un compte)"
              defaultChecked={course.is_free}
            />
            <AdminTextArea
              id="f-faq"
              name="faq"
              label="Questions fréquentes"
              hint="Une question par bloc : la question sur la première ligne, la réponse dessous, une ligne vide entre deux questions."
              rows={8}
              defaultValue={formatFaq(faq)}
            />
          </ActionForm>
        </section>

        <section aria-labelledby="programme-title" className="flex flex-col gap-6">
          <h2 id="programme-title" className="text-h2">
            Programme
          </h2>
          {modules.length === 0 && <p>Aucun module pour l’instant.</p>}
          {modules.map((m, mi) => {
            const moduleLessons = lessons.filter((l) => l.module_id === m.id);
            return (
              <section
                key={m.id}
                aria-labelledby={`module-${m.id}`}
                className="flex flex-col gap-4 rounded-ui border border-line bg-sheet p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 id={`module-${m.id}`} className="text-h3">
                    Module {mi + 1} · {m.title}
                  </h3>
                  <MoveButtons
                    kind="module"
                    id={m.id}
                    courseId={course.id}
                    label={m.title}
                    first={mi === 0}
                    last={mi === modules.length - 1}
                  />
                </div>
                <p className="text-small">
                  <Link
                    href={`/admin/formations/${course.id}/quiz/${m.id}` as Route}
                    className="link"
                  >
                    Quiz du module : {m.question_count} question(s), seuil {m.pass_score}&nbsp;%
                  </Link>
                </p>

                <ol className="flex flex-col divide-y divide-line">
                  {moduleLessons.map((l, li) => (
                    <li key={l.id} className="flex flex-col gap-2 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-semibold">
                          {li + 1}. {l.title}
                          <span className="font-normal text-muted">
                            {" "}
                            · {l.duration_min}&nbsp;min{l.has_video ? " · vidéo" : ""}
                            {l.is_preview ? " · aperçu gratuit" : ""}
                          </span>
                        </span>
                        <MoveButtons
                          kind="lesson"
                          id={l.id}
                          courseId={course.id}
                          label={l.title}
                          first={li === 0}
                          last={li === moduleLessons.length - 1}
                        />
                      </div>
                      <details className="rounded-ui border border-line p-3">
                        <summary className="cursor-pointer font-semibold">
                          Modifier la leçon<span className="sr-only"> {l.title}</span>
                        </summary>
                        <div className="mt-3 flex flex-col gap-6">
                          <ActionForm action={updateLesson} submitLabel="Enregistrer la leçon">
                            <input type="hidden" name="id" value={l.id} />
                            <input type="hidden" name="courseId" value={course.id} />
                            <LessonFields
                              prefix={`l-${l.id}`}
                              lesson={l}
                              courseSlug={course.slug}
                            />
                          </ActionForm>

                          <div className="flex flex-col gap-3">
                            <h4 className="font-semibold">Ressources (PDF)</h4>
                            {l.lesson_resources.length === 0 && (
                              <p className="text-small text-muted">Aucune ressource.</p>
                            )}
                            {l.lesson_resources.map((res) => (
                              <div
                                key={res.id}
                                role="group"
                                aria-label={res.label}
                                className="flex flex-col gap-2 rounded-ui border border-line p-3"
                              >
                                <p>
                                  <span className="font-semibold">{res.label}</span>{" "}
                                  <span className="text-small text-muted">
                                    ({res.storage_path})
                                  </span>
                                </p>
                                <DeleteForm
                                  action={deleteResource}
                                  hidden={{ id: res.id, courseId: course.id }}
                                  label="Supprimer la ressource"
                                  warning={`Je confirme la suppression de « ${res.label} ».`}
                                />
                              </div>
                            ))}
                            <ActionForm
                              action={uploadResource}
                              submitLabel="Ajouter la ressource"
                              variant="secondary"
                              encType="multipart/form-data"
                            >
                              <input type="hidden" name="lessonId" value={l.id} />
                              <input type="hidden" name="courseId" value={course.id} />
                              <AdminTextField
                                id={`r-${l.id}-label`}
                                name="label"
                                label="Intitulé"
                                required
                              />
                              <AdminTextField
                                id={`r-${l.id}-file`}
                                name="file"
                                type="file"
                                accept="application/pdf,.pdf"
                                label="Fichier PDF (4 Mo maximum)"
                                required
                              />
                            </ActionForm>
                          </div>

                          <DeleteForm
                            action={deleteItem}
                            hidden={{ kind: "lesson", id: l.id, courseId: course.id }}
                            label="Supprimer la leçon"
                            warning="Je confirme : la leçon et la progression des élèves sur cette leçon seront supprimées."
                          />
                        </div>
                      </details>
                    </li>
                  ))}
                </ol>

                <details className="rounded-ui border border-line p-3">
                  <summary className="cursor-pointer font-semibold">
                    Ajouter une leçon<span className="sr-only"> au module {m.title}</span>
                  </summary>
                  <div className="mt-3">
                    <ActionForm action={addLesson} submitLabel="Ajouter la leçon">
                      <input type="hidden" name="courseId" value={course.id} />
                      <input type="hidden" name="moduleId" value={m.id} />
                      <LessonFields prefix={`n-${m.id}`} courseSlug={course.slug} />
                    </ActionForm>
                  </div>
                </details>

                <details className="rounded-ui border border-line p-3">
                  <summary className="cursor-pointer font-semibold">
                    Modifier ou supprimer le module<span className="sr-only"> {m.title}</span>
                  </summary>
                  <div className="mt-3 flex flex-col gap-6">
                    <ActionForm action={updateModule} submitLabel="Enregistrer le module">
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="courseId" value={course.id} />
                      <AdminTextField
                        id={`m-${m.id}-titre`}
                        name="title"
                        label="Titre"
                        defaultValue={m.title}
                        required
                      />
                      <AdminTextField
                        id={`m-${m.id}-seuil`}
                        name="passScore"
                        type="number"
                        min={0}
                        max={100}
                        label="Seuil de réussite du quiz (%)"
                        defaultValue={m.pass_score}
                        required
                      />
                    </ActionForm>
                    <DeleteForm
                      action={deleteItem}
                      hidden={{ kind: "module", id: m.id, courseId: course.id }}
                      label="Supprimer le module"
                      warning="Je confirme : le module, ses leçons, son quiz et la progression des élèves seront supprimés."
                    />
                  </div>
                </details>
              </section>
            );
          })}

          <section
            aria-labelledby="ajout-module-title"
            className="flex max-w-2xl flex-col gap-4 rounded-ui border border-dashed border-line p-5"
          >
            <h3 id="ajout-module-title" className="text-h3">
              Ajouter un module
            </h3>
            <ActionForm action={addModule} submitLabel="Ajouter le module" variant="secondary">
              <input type="hidden" name="courseId" value={course.id} />
              <AdminTextField id="nm-titre" name="title" label="Titre" required />
              <AdminTextField
                id="nm-seuil"
                name="passScore"
                type="number"
                min={0}
                max={100}
                label="Seuil de réussite du quiz (%)"
                defaultValue={80}
                required
              />
            </ActionForm>
          </section>
        </section>

        <section aria-labelledby="suppression-title" className="flex max-w-2xl flex-col gap-3">
          <h2 id="suppression-title" className="text-h3">
            Supprimer la formation
          </h2>
          <p className="text-small text-muted">
            Impossible si des élèves y sont inscrits ou l’ont achetée : repassez-la plutôt en
            brouillon.
          </p>
          <DeleteForm
            action={deleteCourse}
            hidden={{ id: course.id }}
            label="Supprimer la formation"
            warning={`Je confirme la suppression définitive de « ${course.title} ».`}
          />
        </section>
      </div>
    </>
  );
}
