import { Download } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { completeLesson, requestCertificate } from "@/app/apprendre/actions";
import { Container } from "@/components/layout/PageHeader";
import { QuizForm } from "@/components/lms/QuizForm";
import { CourseOutline } from "@/components/lms/CourseOutline";
import { StartCourseButton } from "@/components/lms/StartCourseButton";
import { mdxComponents } from "@/components/mdx/components";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { renderMdx } from "@/lib/content/mdx";
import { loadLessonContent } from "@/lib/lms/lesson-content";
import { courseSequence, formatDuration, parseQuizSlug } from "@/lib/lms/progress";
import { getCourse, getLearnerState } from "@/lib/lms/queries";
import { videoProvider } from "@/lib/services/video";
import { getUser } from "@/lib/supabase/server";

type Props = PageProps<"/apprendre/[formation]/[lecon]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { formation, lecon } = await params;
  const course = await getCourse(formation);
  const lesson = course?.modules.flatMap((m) => m.lessons).find((l) => l.slug === lecon);
  const quiz = parseQuizSlug(lecon);
  const title = lesson?.title ?? (quiz ? `Quiz du module ${quiz}` : "Leçon");
  return {
    title: course ? `${title} · ${course.title}` : title,
    robots: { index: false, follow: false },
  };
}

export default async function LessonPage({ params }: Props) {
  const { formation, lecon } = await params;
  const course = await getCourse(formation);
  if (!course) notFound();
  const lessons = course.modules.flatMap((m) => m.lessons);
  const lesson = lessons.find((l) => l.slug === lecon);
  const quizPosition = parseQuizSlug(lecon);
  const quizModule = quizPosition
    ? course.modules.find((m) => m.position === quizPosition && m.hasQuiz)
    : undefined;
  if (!lesson && !quizModule) notFound();

  const { supabase, user } = await getUser();
  const nextParam = encodeURIComponent(`/apprendre/${formation}/${lecon}`);
  const isPreview = lesson?.isPreview ?? false;
  if (!isPreview && (!supabase || !user)) redirect(`/compte/connexion?next=${nextParam}` as Route);

  const state = supabase && user ? await getLearnerState(supabase, course, user.id) : null;
  const canLearn = state?.hasAccess ?? false;
  if (!canLearn && !isPreview) redirect(`/formations/${formation}` as Route);

  // Remember where the member is, for « Reprendre » (course_id is recomputed by a trigger).
  if (supabase && user && canLearn && lesson) {
    await supabase.from("lesson_progress").upsert({
      user_id: user.id,
      lesson_id: lesson.id,
      course_id: course.id,
      last_seen_at: new Date().toISOString(),
    });
  }

  const sequence = courseSequence(course.modules, lessons);
  const index = sequence.findIndex((s) => s.slug === lecon);
  const prev = sequence[index - 1];
  const next = sequence[index + 1];
  const courseHref = `/formations/${course.slug}` as Route;
  const completed = state?.completed ?? new Set<string>();
  const passed = state?.passed ?? new Set<string>();

  return (
    <Container className="pt-6">
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "Formations", href: "/formations" },
            { label: course.title, href: courseHref },
            { label: lesson?.title ?? `Quiz du module ${quizPosition}` },
          ]}
        />
        {state && canLearn && (
          <ProgressBar
            value={state.progress.percent}
            max={100}
            label={`Progression dans la formation`}
          />
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="order-2 lg:order-1">
          <details className="rounded-ui border border-line bg-sheet p-4 lg:hidden">
            <summary className="cursor-pointer font-semibold">Sommaire de la formation</summary>
            <div className="mt-4">
              <CourseOutline
                course={course}
                current={lecon}
                completed={completed}
                passed={passed}
                canLearn={canLearn}
              />
            </div>
          </details>
          <div className="hidden lg:sticky lg:top-6 lg:block">
            <CourseOutline
              course={course}
              current={lecon}
              completed={completed}
              passed={passed}
              canLearn={canLearn}
            />
          </div>
        </aside>

        <article className="order-1 flex min-w-0 flex-col gap-8 lg:order-2">
          {lesson ? (
            <LessonBody
              courseSlug={course.slug}
              courseId={course.id}
              lesson={lesson}
              position={lessons.indexOf(lesson) + 1}
              total={lessons.length}
              canLearn={canLearn}
              signedIn={!!user}
              isFree={course.isFree}
              done={completed.has(lesson.id)}
              nextSlug={next?.slug ?? null}
            />
          ) : (
            <QuizSection
              supabase={supabase!}
              moduleId={quizModule!.id}
              title={quizModule!.title}
              position={quizModule!.position}
              passScore={quizModule!.passScore}
              best={state?.bestScore.get(quizModule!.id)}
              nextHref={
                (next
                  ? `/apprendre/${course.slug}/${next.slug}`
                  : `/apprendre/${course.slug}/${sequence[index].slug}`) as Route
              }
              nextLabel={next ? `Continuer : ${next.title}` : "Voir mon attestation"}
            />
          )}

          {state?.progress.complete && (
            <Callout type="astuce" title="Formation terminée">
              {state.certificate ? (
                <p>
                  Votre attestation de suivi est disponible.{" "}
                  <a
                    href={`/api/formations/attestation/${state.certificate.id}`}
                    className="link font-semibold"
                  >
                    Télécharger mon attestation (PDF)
                  </a>
                </p>
              ) : (
                <form action={requestCertificate} className="flex flex-col gap-3">
                  <p>Vous avez suivi toutes les leçons et validé tous les quiz.</p>
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="slug" value={course.slug} />
                  <div>
                    <Button type="submit">Obtenir mon attestation de suivi</Button>
                  </div>
                </form>
              )}
            </Callout>
          )}

          <nav
            aria-label="Leçon précédente et suivante"
            className="flex flex-wrap justify-between gap-4 border-t border-line pt-6"
          >
            {prev && (canLearn || lessons.find((l) => l.slug === prev.slug)?.isPreview) ? (
              <Link href={`/apprendre/${course.slug}/${prev.slug}` as Route} className="link">
                Précédent : {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next && canLearn && (
              <Link
                href={`/apprendre/${course.slug}/${next.slug}` as Route}
                className="link font-semibold"
              >
                Suivant : {next.title}
              </Link>
            )}
          </nav>
        </article>
      </div>
    </Container>
  );
}

async function LessonBody(props: {
  courseSlug: string;
  courseId: string;
  lesson: NonNullable<Awaited<ReturnType<typeof getCourse>>>["modules"][number]["lessons"][number];
  position: number;
  total: number;
  canLearn: boolean;
  signedIn: boolean;
  isFree: boolean;
  done: boolean;
  nextSlug: string | null;
}) {
  const { lesson } = props;
  const content = loadLessonContent(lesson.mdxPath);
  const body = await renderMdx(content.body, mdxComponents(content.data.sources));
  const playback = lesson.hasVideo ? videoProvider().playback(lesson.videoId) : null;
  const resources = props.canLearn ? await getResources(lesson.id) : [];

  return (
    <>
      <header className="flex flex-col gap-2">
        <p className="text-small text-muted">
          Leçon {props.position} sur {props.total} · {formatDuration(lesson.durationMin)}
          {lesson.isPreview && !props.canLearn && " · Aperçu gratuit"}
        </p>
        <h1 className="text-h1">{lesson.title}</h1>
      </header>
      {lesson.hasVideo && (
        <VideoPlayer
          title={`Vidéo : ${lesson.title}`}
          src={null}
          embedSrc={playback?.src ?? null}
          transcript={<p>{content.data.transcript}</p>}
        />
      )}
      <div className="prose-guide">{body}</div>
      {resources.length > 0 && (
        <section
          aria-labelledby="ressources-title"
          className="rounded-ui border border-line bg-sheet p-5"
        >
          <h2 id="ressources-title" className="mb-3 text-h3">
            Ressources
          </h2>
          <ul className="flex flex-col gap-2">
            {resources.map((r) => (
              <li key={r.id}>
                <a
                  href={`/api/formations/ressources/${r.id}`}
                  className="link inline-flex items-center gap-2"
                >
                  <Download aria-hidden className="size-4" />
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      {props.canLearn ? (
        <form action={completeLesson} className="flex flex-wrap items-center gap-4">
          <input type="hidden" name="lessonId" value={lesson.id} />
          <input type="hidden" name="slug" value={props.courseSlug} />
          <input type="hidden" name="next" value={props.nextSlug ?? ""} />
          <Button type="submit" size="lg" variant={props.done ? "secondary" : "primary"}>
            {props.done ? "Continuer" : "Marquer comme terminée et continuer"}
          </Button>
          {props.done && <span className="text-small font-semibold text-sage">Leçon terminée</span>}
        </form>
      ) : (
        <Callout type="info" title="Vous regardez une leçon gratuite">
          <p className="mb-3">
            Pour suivre toute la formation et enregistrer votre progression
            {props.isFree ? ", créez un compte gratuit." : ", achetez-la depuis sa page."}
          </p>
          {props.isFree ? (
            props.signedIn ? (
              <StartCourseButton courseId={props.courseId} slug={props.courseSlug} />
            ) : (
              <ButtonLink href={`/compte/inscription` as Route}>Créer un compte gratuit</ButtonLink>
            )
          ) : (
            <ButtonLink href={`/formations/${props.courseSlug}` as Route}>
              Voir la formation
            </ButtonLink>
          )}
        </Callout>
      )}
    </>
  );
}

async function getResources(lessonId: string) {
  const { supabase } = await getUser();
  if (!supabase) return [];
  const { data } = await supabase
    .from("lesson_resources")
    .select("id, label")
    .eq("lesson_id", lessonId)
    .order("position");
  return data ?? [];
}

async function QuizSection(props: {
  supabase: NonNullable<Awaited<ReturnType<typeof getUser>>["supabase"]>;
  moduleId: string;
  title: string;
  position: number;
  passScore: number;
  best: number | undefined;
  nextHref: Route;
  nextLabel: string;
}) {
  const { data: questions } = await props.supabase
    .from("quiz_questions")
    .select("id, prompt, choices")
    .eq("module_id", props.moduleId)
    .order("position");
  return (
    <>
      <header className="flex flex-col gap-2">
        <p className="text-small text-muted">Fin du module {props.position}</p>
        <h1 className="text-h1">Quiz · {props.title}</h1>
        {props.best !== undefined && (
          <p className="text-small">
            Votre meilleur score{" "}:{" "}
            <strong>
              {props.best}
              {" "}%
            </strong>
            {props.best >= props.passScore ? " · module validé" : ""}
          </p>
        )}
      </header>
      <QuizForm
        moduleId={props.moduleId}
        questions={questions ?? []}
        passScore={props.passScore}
        nextHref={props.nextHref}
        nextLabel={props.nextLabel}
      />
    </>
  );
}
