import type { Route } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDateParis } from "@/lib/commerce/format";
import { getCourse, getLearnerState } from "@/lib/lms/queries";
import type { createClient } from "@/lib/supabase/server";

type Client = NonNullable<Awaited<ReturnType<typeof createClient>>>;

export async function loadLearning(supabase: Client, userId: string) {
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("starts_at, expires_at, courses(slug)")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });
  const courses = await Promise.all(
    (enrollments ?? []).map(async (e) => {
      const slug = (e.courses as { slug: string } | null)?.slug;
      const course = slug ? await getCourse(slug) : null;
      if (!course) return null;
      const state = await getLearnerState(supabase, course, userId);
      return { course, state, startsAt: e.starts_at, expiresAt: e.expires_at };
    }),
  );
  return courses.filter((c) => c !== null);
}

type Learning = Awaited<ReturnType<typeof loadLearning>>;

export function CoursesPanel({ learning }: { learning: Learning }) {
  if (learning.length === 0) {
    return (
      <>
        <p className="text-muted">Vous n’avez pas encore commencé de formation.</p>
        <p>
          <Link href="/formations" className="link">
            Découvrir les formations
          </Link>
        </p>
      </>
    );
  }
  return (
    <ul className="flex flex-col gap-5">
      {learning.map(({ course, state, startsAt, expiresAt }) =>
        !state.hasAccess && new Date(startsAt) > new Date() ? (
          <li key={course.id} className="flex flex-col gap-1">
            <p className="font-semibold">{course.title}</p>
            <p className="text-small text-muted">
              Accès à partir du {formatDateParis(startsAt)}, à la fin du délai de rétractation.
            </p>
          </li>
        ) : (
          <li key={course.id} className="flex flex-col gap-2">
            <p className="font-semibold">{course.title}</p>
            <ProgressBar
              value={state.progress.percent}
              max={100}
              label={state.progress.complete ? "Formation terminée" : "Progression"}
            />
            <div className="flex flex-wrap items-center gap-4">
              <ButtonLink href={`/apprendre/${course.slug}` as Route} variant="secondary">
                {state.progress.percent === 0
                  ? "Commencer"
                  : state.progress.complete
                    ? "Revoir la formation"
                    : "Reprendre"}
                <span className="sr-only"> · {course.title}</span>
              </ButtonLink>
              {expiresAt && (
                <span className="text-small text-muted">
                  Accès jusqu’au{" "}
                  {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
                    new Date(expiresAt),
                  )}
                </span>
              )}
            </div>
          </li>
        ),
      )}
    </ul>
  );
}

export function CertificatesPanel({ learning }: { learning: Learning }) {
  const certificates = learning.filter((l) => l.state.certificate);
  if (certificates.length === 0) {
    return (
      <p className="text-muted">Terminez une formation pour obtenir votre attestation de suivi.</p>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {certificates.map(({ course, state }) => (
        <li key={course.id}>
          <a href={`/api/formations/attestation/${state.certificate!.id}`} className="link">
            Attestation de suivi · {course.title}
          </a>
          <span className="text-small text-muted"> (n° {state.certificate!.serial})</span>
        </li>
      ))}
    </ul>
  );
}
