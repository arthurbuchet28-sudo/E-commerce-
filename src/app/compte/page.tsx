import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { signOut } from "@/app/compte/actions";
import { DeleteAccountForm, ProfileForm } from "@/components/account/AuthForms";
import { CertificatesPanel, CoursesPanel, loadLearning } from "@/components/account/LearningPanels";
import { ParcoursSummary } from "@/components/account/ParcoursSummary";
import { loadPurchases, PurchasesPanel } from "@/components/account/PurchasesPanel";
import { SimulationList, type SimulationRow } from "@/components/account/SimulationList";
import { MemberAreaUnavailable } from "@/components/account/Unavailable";
import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { findRoute, getRoute } from "@/config/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import { getUser } from "@/lib/supabase/server";

export const metadata = pageMetadata("/compte");

function Panel({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-4 rounded-ui border border-line bg-sheet p-6"
    >
      <h2 id={id} className="text-h3">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function AccountPage({ searchParams }: PageProps<"/compte">) {
  const r = getRoute("/compte");
  const params = await searchParams;
  const { supabase, user } = await getUser();
  if (!supabase) {
    return (
      <Container className="max-w-3xl">
        <PageHeader title={r.h1} crumbs={breadcrumbFor(r.path, r.label)} />
        <MemberAreaUnavailable />
      </Container>
    );
  }
  if (!user) redirect("/compte/connexion?next=/compte");

  const [{ data: profile }, { data: simulations }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    supabase
      .from("saved_simulations")
      .select("id, tool, title, inputs, created_at")
      .order("created_at", { ascending: false }),
  ]);
  const [learning, purchases] = await Promise.all([
    loadLearning(supabase, user.id),
    loadPurchases(supabase),
  ]);
  const rows: SimulationRow[] = (simulations ?? []).map((s) => {
    const route = findRoute(`/outils/${s.tool}`);
    return {
      id: s.id,
      tool: s.tool,
      toolLabel: route?.label ?? s.tool,
      toolPath: route?.path ?? "/outils",
      title: s.title,
      createdAt: s.created_at,
      inputs: (s.inputs ?? {}) as Record<string, string>,
    };
  });
  const name = profile?.display_name;

  return (
    <Container>
      <PageHeader
        title={name ? `Bonjour ${name}` : r.h1}
        lead="Votre progression, vos formations et vos données, au même endroit."
        crumbs={breadcrumbFor(r.path, r.label)}
      />
      {params["mot-de-passe"] === "modifie" && (
        <div className="mb-8">
          <Callout type="astuce" title="Mot de passe modifié">
            <p>Votre nouveau mot de passe est enregistré.</p>
          </Callout>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel id="parcours-title" title="Mon parcours « Se lancer »">
          <ParcoursSummary />
        </Panel>
        <Panel id="formations-title" title="Mes formations">
          <CoursesPanel learning={learning} />
        </Panel>
        <Panel id="achats-title" title="Mes achats et factures">
          <PurchasesPanel purchases={purchases} />
        </Panel>
        <Panel id="attestations-title" title="Mes attestations de suivi">
          <CertificatesPanel learning={learning} />
        </Panel>
        <div className="lg:col-span-2">
          <Panel id="simulations-title" title="Mes simulations enregistrées">
            <SimulationList rows={rows} />
          </Panel>
        </div>
        <Panel id="emails-title" title="Mes préférences e-mail">
          <p className="text-muted">
            Vous recevez uniquement les e-mails liés à votre compte (confirmation, connexion, mot de
            passe). Aucune newsletter sans votre accord.
          </p>
        </Panel>
        <Panel id="profil-title" title="Mon profil">
          <p className="text-small text-muted">
            Adresse e-mail{" "}: {user.email}
          </p>
          <ProfileForm displayName={name ?? ""} />
        </Panel>
        <div className="lg:col-span-2">
          <Panel id="donnees-title" title="Mes données personnelles">
            <p>
              Téléchargez toutes les données que nous conservons sur vous, au format JSON.{" "}
              <a href="/api/compte/export" className="link font-semibold" download>
                Exporter mes données
              </a>
            </p>
            <details className="rounded-ui border border-line p-4">
              <summary className="cursor-pointer font-semibold">Supprimer mon compte</summary>
              <div className="mt-4 flex flex-col gap-4">
                <p>
                  Votre compte, votre progression et vos simulations seront effacés définitivement.
                  Cette action est irréversible.
                </p>
                <DeleteAccountForm />
              </div>
            </details>
          </Panel>
        </div>
      </div>
      <form action={signOut} className="mt-8">
        <Button type="submit" variant="secondary">
          Me déconnecter
        </Button>
      </form>
    </Container>
  );
}
