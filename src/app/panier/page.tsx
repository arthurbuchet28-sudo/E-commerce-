import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MemberAreaUnavailable } from "@/components/account/Unavailable";
import { CheckoutForm } from "@/components/commerce/CheckoutForm";
import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { waiverText, withdrawalDays } from "@/config/legal";
import { getRoute } from "@/config/routes";
import { formatDateParis, formatEuros } from "@/lib/commerce/format";
import { sellerSnapshot } from "@/lib/commerce/seller";
import { getCourse } from "@/lib/lms/queries";
import { formatDuration } from "@/lib/lms/progress";
import { pageMetadata } from "@/lib/seo/metadata";
import { isSimulation } from "@/lib/services/payments";
import { getUser } from "@/lib/supabase/server";

export const metadata = pageMetadata("/panier");

export default async function CartPage({ searchParams }: PageProps<"/panier">) {
  const r = getRoute("/panier");
  const header = <PageHeader title={r.h1} crumbs={breadcrumbFor(r.path, r.label)} />;
  const slug = (await searchParams).formation;
  const course =
    typeof slug === "string" && /^[a-z0-9-]{3,80}$/.test(slug) ? await getCourse(slug) : null;

  if (!course) {
    return (
      <Container className="max-w-3xl">
        {header}
        <p className="mb-4">Votre panier est vide.</p>
        <ButtonLink href="/formations">Découvrir les formations</ButtonLink>
      </Container>
    );
  }
  if (course.isFree || !course.priceCents) redirect(`/formations/${course.slug}` as Route);

  const { supabase, user } = await getUser();
  if (!supabase) {
    return (
      <Container className="max-w-3xl">
        {header}
        <MemberAreaUnavailable />
      </Container>
    );
  }

  const { data: enrollment } = user
    ? await supabase
        .from("enrollments")
        .select("starts_at, expires_at, revoked_at")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .maybeSingle()
    : { data: null };
  const now = new Date().toISOString();
  const owned =
    enrollment && !enrollment.revoked_at && (!enrollment.expires_at || enrollment.expires_at > now);
  const vatMention = sellerSnapshot().vatMention;
  const cartPath = `/panier?formation=${course.slug}`;

  return (
    <Container className="max-w-3xl">
      {header}
      <div className="flex flex-col gap-8">
        <section
          aria-labelledby="recap-title"
          className="rounded-ui border border-line bg-sheet p-6"
        >
          <h2 id="recap-title" className="mb-4 text-h3">
            Récapitulatif
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            <dt className="text-muted">Formation</dt>
            <dd className="font-semibold">
              <Link href={`/formations/${course.slug}` as Route} className="link">
                {course.title}
              </Link>
            </dd>
            <dt className="text-muted">Contenu</dt>
            <dd>
              {course.modules.flatMap((m) => m.lessons).length} leçons ·{" "}
              {formatDuration(course.totalMinutes)}
            </dd>
            <dt className="text-muted">Accès</dt>
            <dd>{course.accessMonths}&nbsp;mois, en ligne</dd>
            <dt className="text-muted">Prix</dt>
            <dd>
              <span className="font-serif text-h3 font-semibold">
                {formatEuros(course.priceCents)} TTC
              </span>
              {vatMention && <span className="block text-small text-muted">{vatMention}</span>}
            </dd>
          </dl>
        </section>

        {owned ? (
          enrollment.starts_at > now ? (
            <Callout type="info" title="Formation déjà achetée">
              <p>
                Votre accès ouvrira le {formatDateParis(enrollment.starts_at)}, à la fin du délai de
                rétractation.
              </p>
            </Callout>
          ) : (
            <Callout type="astuce" title="Formation déjà achetée">
              <p className="mb-3">Vous avez déjà accès à cette formation.</p>
              <ButtonLink href={`/apprendre/${course.slug}` as Route}>
                Accéder à la formation
              </ButtonLink>
            </Callout>
          )
        ) : user ? (
          <section aria-labelledby="commande-title" className="flex flex-col gap-4">
            <h2 id="commande-title" className="text-h3">
              Valider la commande
            </h2>
            <CheckoutForm
              formation={course.slug}
              waiverText={waiverText()}
              withdrawalDays={withdrawalDays()}
              simulation={isSimulation()}
            />
          </section>
        ) : (
          <Callout type="info" title="Connectez-vous pour commander">
            <p className="mb-3">
              La formation est rattachée à votre compte : connectez-vous ou créez un compte gratuit,
              puis revenez à cette page.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={`/compte/connexion?next=${encodeURIComponent(cartPath)}` as Route}>
                Me connecter
              </ButtonLink>
              <ButtonLink
                href={`/compte/inscription?next=${encodeURIComponent(cartPath)}` as Route}
                variant="secondary"
              >
                Créer un compte
              </ButtonLink>
            </div>
          </Callout>
        )}

        <Callout type="legal" title="Votre droit de rétractation">
          <p>
            Vous disposez de {withdrawalDays()}&nbsp;jours après l’achat pour vous rétracter, en
            ligne et sans justification, depuis la page{" "}
            <Link href="/retractation" className="link">
              Se rétracter
            </Link>
            . Si vous demandez l’accès immédiat, ce droit prend fin dès que vous ouvrez une première
            leçon.
          </p>
        </Callout>
      </div>
    </Container>
  );
}
