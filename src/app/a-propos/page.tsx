import Link from "next/link";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { Callout } from "@/components/ui/Callout";
import { getRoute } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/a-propos");

/** About page and editorial method (the site's author is « La rédaction »). */
export default function AboutPage() {
  const r = getRoute("/a-propos");
  return (
    <Container className="max-w-3xl">
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <div className="prose-guide">
        <h2>Pourquoi ce site</h2>
        <p>
          {siteConfig.name} accompagne celles et ceux qui veulent vendre en ligne pour la première
          fois : salariés qui testent une idée le soir, commerçants qui ajoutent la vente en ligne,
          personnes en reconversion, étudiants. L’objectif : passer de l’idée à la première vente,
          étape par étape, en restant en règle avec le droit français.
        </p>
        <p>
          Le site est édité par {siteConfig.publisher.legalName} (voir les{" "}
          <Link href="/mentions-legales">mentions légales</Link>). Les contenus sont signés{" "}
          {`«\u00a0${siteConfig.defaultAuthor}\u00a0»`}. [À COMPLÉTER : quelques lignes sur
          l’éditeur et son parcours, si vous souhaitez vous présenter.]
        </p>

        <h2>Notre méthode éditoriale</h2>
        <ul>
          <li>
            <strong>Des sources officielles.</strong> Chaque règle et chaque chiffre renvoient à
            leur source (service-public.fr, urssaf.fr, impots.gouv.fr, legifrance.gouv.fr, cnil.fr,
            economie.gouv.fr…), avec la date à laquelle ils ont été vérifiés.
          </li>
          <li>
            <strong>Des chiffres centralisés et datés.</strong> Les seuils, taux et délais sont
            enregistrés à un seul endroit ; quand une règle change, tous les contenus qui la citent
            sont mis à jour en même temps. Un chiffre non vérifié depuis plus de 12&nbsp;mois est
            signalé pour révision.
          </li>
          <li>
            <strong>Des contenus datés.</strong> Chaque guide affiche sa date de mise à jour. La{" "}
            <Link href="/veille-reglementaire">veille réglementaire</Link> liste les changements et
            les guides concernés.
          </li>
          <li>
            <strong>Relus avant publication.</strong> Les textes sont préparés avec l’aide d’outils
            d’intelligence artificielle, puis relus, vérifiés et corrigés avant d’être publiés. [À
            VALIDER : formulation de la transparence sur l’usage de l’IA]
          </li>
        </ul>

        <h2>Nos engagements</h2>
        <ul>
          <li>Aucune promesse de revenus : les difficultés et les risques sont dits.</li>
          <li>Aucun faux témoignage, aucun faux avis, aucun compteur ni stock fictif.</li>
          <li>
            Pas de publicité ni de traceur publicitaire. [À VALIDER : politique sur les liens
            d’affiliation, s’il y en a un jour, et leur signalement]
          </li>
          <li>
            Les formations délivrent une attestation de suivi, qui n’est ni un diplôme ni une
            certification professionnelle.
          </li>
        </ul>

        <h2>Une erreur ? Un oubli ?</h2>
        <p>
          Les règles changent et une erreur peut nous échapper. Signalez-la depuis la page{" "}
          <Link href="/contact">Contact</Link>
          {"\u00a0: "}nous corrigeons et nous indiquons la date de mise à jour.
        </p>
      </div>
      <div className="mt-8">
        <Callout type="attention" title="Ce que le site n’est pas">
          <p>
            Les contenus sont informatifs. Ils ne remplacent pas l’avis d’un expert-comptable, d’un
            avocat ou de l’administration pour votre situation personnelle.
          </p>
        </Callout>
      </div>
    </Container>
  );
}
