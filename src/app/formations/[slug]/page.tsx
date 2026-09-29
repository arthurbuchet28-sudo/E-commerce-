import { Clock, FileText, ListChecks, PlayCircle } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { StartCourseButton } from "@/components/lms/StartCourseButton";
import { Accordion } from "@/components/ui/Accordion";
import { Button, ButtonLink } from "@/components/ui/Button";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { getCatalogue, getCourse } from "@/lib/lms/queries";
import { formatDuration, formatPrice } from "@/lib/lms/progress";
import { absoluteUrl, breadcrumbJsonLd, faqJsonLd, JsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getCatalogue()).map((c) => ({ slug: c.slug }));
}

type Props = PageProps<"/formations/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourse((await params).slug);
  if (!course) return {};
  return buildMetadata({
    title: `Formation ${course.title}`,
    description: course.summary.length > 155 ? `${course.summary.slice(0, 152)}…` : course.summary,
    path: `/formations/${course.slug}`,
  });
}

export default async function CoursePage({ params }: Props) {
  const course = await getCourse((await params).slug);
  if (!course) notFound();
  const lessons = course.modules.flatMap((m) => m.lessons);
  const preview = lessons.find((l) => l.isPreview);
  const price = formatPrice(course.priceCents);
  const path = `/formations/${course.slug}`;
  const crumbs = breadcrumbFor(path, course.title);

  return (
    <Container>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.title,
          description: course.summary,
          url: absoluteUrl(path),
          inLanguage: "fr-FR",
          educationalLevel: course.level === "debutant" ? "Débutant" : "Intermédiaire",
          provider: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
          offers: {
            "@type": "Offer",
            category: course.isFree ? "Free" : "Paid",
            price: course.isFree ? 0 : (course.priceCents ?? 0) / 100,
            priceCurrency: "EUR",
          },
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "online",
            courseWorkload: `PT${course.totalMinutes}M`,
          },
        }}
      />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {course.faq.length > 0 && <JsonLd data={faqJsonLd(course.faq)} />}

      <div data-pagefind-body data-pagefind-filter="type:Formation">
        <PageHeader title={course.title} lead={course.summary} crumbs={crumbs} />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex min-w-0 flex-col gap-10">
            <section aria-labelledby="objectifs-title">
              <h2 id="objectifs-title" className="mb-3 text-h2">
                Ce que vous saurez faire
              </h2>
              <ul className="flex list-disc flex-col gap-1.5 pl-5 font-serif text-body">
                {course.objectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="public-title" className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 id="public-title" className="mb-2 text-h3">
                  Pour qui
                </h2>
                <p>{course.audience}</p>
              </div>
              <div>
                <h2 className="mb-2 text-h3">Prérequis</h2>
                <ul className="flex list-disc flex-col gap-1 pl-5">
                  {course.prerequisites.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section aria-labelledby="programme-title" className="flex flex-col gap-4">
              <h2 id="programme-title" className="text-h2">
                Programme
              </h2>
              <ol className="flex flex-col gap-4">
                {course.modules.map((m) => (
                  <li key={m.id} className="rounded-ui border border-line bg-sheet p-5">
                    <h3 className="mb-3 text-h3">
                      Module {m.position} · {m.title}
                    </h3>
                    <ol className="flex flex-col divide-y divide-line">
                      {m.lessons.map((l) => (
                        <li
                          key={l.id}
                          className="flex flex-wrap items-center justify-between gap-2 py-2"
                        >
                          <span className="flex items-center gap-2">
                            {l.hasVideo ? (
                              <PlayCircle aria-hidden className="size-4 text-muted" />
                            ) : (
                              <FileText aria-hidden className="size-4 text-muted" />
                            )}
                            {l.title}
                            {l.isPreview && (
                              <span className="rounded-full border border-sage px-2 text-small text-sage">
                                Aperçu gratuit
                              </span>
                            )}
                          </span>
                          <span className="text-small text-muted">
                            {l.hasVideo ? "Vidéo et texte" : "Texte"} ·{" "}
                            {formatDuration(l.durationMin)}
                          </span>
                        </li>
                      ))}
                      {m.hasQuiz && (
                        <li className="flex items-center gap-2 py-2">
                          <ListChecks aria-hidden className="size-4 text-muted" />
                          Quiz de fin de module ({m.passScore}
                          {" "}% pour valider)
                        </li>
                      )}
                    </ol>
                  </li>
                ))}
              </ol>
            </section>

            {course.faq.length > 0 && (
              <section aria-labelledby="faq-title" className="flex flex-col gap-4">
                <h2 id="faq-title" className="text-h2">
                  Questions fréquentes
                </h2>
                <Accordion
                  items={course.faq.map((f) => ({ title: f.question, content: <p>{f.answer}</p> }))}
                />
              </section>
            )}
          </div>

          <aside
            className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start"
            data-pagefind-ignore
          >
            <div className="flex flex-col gap-4 rounded-ui border border-line bg-sheet p-6">
              <p className="font-serif text-h2 font-semibold text-ink">{price ?? "Gratuite"}</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-small">
                <dt className="text-muted">Durée</dt>
                <dd className="flex items-center gap-1.5">
                  <Clock aria-hidden className="size-4" />
                  {formatDuration(course.totalMinutes)}
                </dd>
                <dt className="text-muted">Format</dt>
                <dd>{lessons.length} leçons en vidéo et texte, quiz, ressources</dd>
                <dt className="text-muted">Niveau</dt>
                <dd>
                  <LevelBadge level={course.level} />
                </dd>
                <dt className="text-muted">Accès</dt>
                <dd>
                  {course.isFree
                    ? "Illimité, avec un compte gratuit"
                    : `${course.accessMonths} mois à compter de l’achat`}
                </dd>
              </dl>
              {course.isFree ? (
                <StartCourseButton courseId={course.id} slug={course.slug} />
              ) : (
                <>
                  <Button size="lg" disabled className="w-full">
                    Acheter la formation
                  </Button>
                  <p className="text-small text-muted">
                    Le paiement en ligne sera bientôt disponible.
                  </p>
                </>
              )}
              {preview && (
                <ButtonLink
                  href={`/apprendre/${course.slug}/${preview.slug}` as Route}
                  variant="secondary"
                  className="w-full"
                >
                  Voir la leçon gratuite
                </ButtonLink>
              )}
              <p className="text-small text-muted">
                Une attestation de suivi est délivrée à la fin de la formation. Ce n’est ni un
                diplôme ni une certification.
              </p>
            </div>
            <p className="text-small">
              <Link href={"/formations" as Route} className="link">
                Toutes les formations
              </Link>
            </p>
          </aside>
        </div>
      </div>
    </Container>
  );
}
