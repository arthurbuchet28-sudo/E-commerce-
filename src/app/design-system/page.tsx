import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CalcSheet } from "@/components/ui/CalcSheet";
import { Callout } from "@/components/ui/Callout";
import { CourseCard, GuideCard } from "@/components/ui/Cards";
import { Checkbox, RadioGroup, SelectField, TextField } from "@/components/ui/Field";
import { GlossaryTerm } from "@/components/ui/GlossaryTerm";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { Pagination } from "@/components/ui/Pagination";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";
import { RouteStepper, type RouteStep } from "@/components/ui/RouteStepper";
import { Tabs } from "@/components/ui/Tabs";
import { VideoPlayer } from "@/components/ui/VideoPlayer";

import { ModalDemo, ThemeSwitch, ToastDemo } from "./Demos";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const colors = [
  { token: "ink", name: "Encre", role: "Structure, titres, action principale, liens" },
  { token: "paper", name: "Papier", role: "Fond de page" },
  { token: "sheet", name: "Feuille", role: "Surfaces" },
  { token: "text", name: "Anthracite", role: "Texte courant" },
  { token: "muted", name: "Graphite", role: "Texte secondaire" },
  { token: "sage", name: "Sauge", role: "Progression, validation" },
  { token: "signal", name: "Signal", role: "Attention juridique (fond, bordure)" },
  { token: "line", name: "Filet", role: "Séparateurs décoratifs" },
  { token: "border", name: "Contour", role: "Bordures de champs (≥ 3:1)" },
  { token: "danger", name: "Alerte", role: "Erreurs" },
];

const steps: RouteStep[] = [
  { title: "Trouver son idée et son modèle", status: "done" },
  { title: "Valider le marché", status: "done" },
  { title: "Choisir son statut et créer son entreprise", status: "current" },
  { title: "Se mettre en conformité", status: "todo" },
  { title: "Choisir sa plateforme et créer sa boutique", status: "todo" },
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-6 border-t border-line py-10"
    >
      <h2 id={`${id}-title`} className="mb-6 text-h2">
        {title}
      </h2>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

function Components() {
  return (
    <>
      <Section id="boutons" title="Boutons et liens">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Enregistrer ma simulation</Button>
          <Button variant="secondary">Télécharger la checklist</Button>
          <Button variant="quiet">Voir le détail du calcul</Button>
          <Button disabled>Action indisponible</Button>
          <ButtonLink href="/design-system" size="lg">
            Commencer le parcours gratuit
          </ButtonLink>
        </div>
        <p>
          Un lien dans le texte :{" "}
          <a href="#boutons" className="link">
            lire le guide sur les mentions légales
          </a>
          .
        </p>
      </Section>

      <Section id="champs" title="Champs de formulaire">
        <form className="grid max-w-xl gap-5" action="#">
          <TextField
            id="ds-email"
            label="Adresse e-mail"
            type="email"
            autoComplete="email"
            required
            hint="Nous l’utilisons uniquement pour vous envoyer la checklist."
          />
          <TextField
            id="ds-ca"
            label="Chiffre d’affaires mensuel (€)"
            inputMode="decimal"
            defaultValue="abc"
            error="Saisissez un montant en euros, par exemple 1 500."
          />
          <SelectField id="ds-activite" label="Type d’activité" defaultValue="vente">
            <option value="vente">Vente de marchandises</option>
            <option value="services">Prestations de services</option>
          </SelectField>
          <RadioGroup
            name="ds-tva"
            legend="Êtes-vous en franchise en base de TVA ?"
            defaultValue="oui"
            options={[
              { value: "oui", label: "Oui" },
              { value: "non", label: "Non" },
              { value: "nsp", label: "Je ne sais pas" },
            ]}
          />
          <Checkbox
            id="ds-consent"
            label="J’accepte de recevoir la newsletter (un e-mail par semaine au plus, désinscription en un clic)."
          />
        </form>
      </Section>

      <Section id="encadres" title="Encadrés">
        <div className="prose-guide flex flex-col gap-4">
          <Callout type="info">
            <p>
              La franchise en base de TVA dispense de facturer la TVA tant que vous restez sous les
              seuils.
            </p>
          </Callout>
          <Callout type="attention">
            <p>Vérifiez les seuils chaque année : leur dépassement change vos obligations.</p>
          </Callout>
          <Callout type="legal">
            <p>
              En dropshipping, vous êtes responsable vis-à-vis du client de la bonne exécution de la
              commande.
            </p>
          </Callout>
          <Callout type="astuce">
            <p>Testez votre produit en pré-vente avant de commander du stock.</p>
          </Callout>
        </div>
      </Section>

      <Section id="cartes" title="Cartes">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <GuideCard
            href="/design-system#cartes"
            category="Statut et création"
            title="Micro-entreprise, EI, EURL, SASU : quel statut pour vendre en ligne"
            description="Comparer les statuts selon votre situation, votre budget et vos projets."
            readingMinutes={12}
            level="debutant"
          />
          <GuideCard
            href="/design-system#cartes"
            category="Marketing et acquisition"
            title="GEO : être recommandé par les assistants IA"
            description="Rendre vos pages compréhensibles et citables par les moteurs de réponse."
            readingMinutes={10}
            level="intermediaire"
          />
          <CourseCard
            href="/design-system#cartes"
            title="Les bases du e-commerce"
            summary="Panorama, modèles, étapes, budget réaliste et plan d’action sur 30 jours."
            lessons={6}
            duration="1 h 30"
            price={null}
            progress={50}
          />
        </div>
        <div className="flex gap-3">
          <LevelBadge level="debutant" />
          <LevelBadge level="intermediaire" />
        </div>
      </Section>

      <Section id="progression" title="Progression et ligne d’itinéraire">
        <div className="grid gap-8 md:grid-cols-2">
          <RouteStepper steps={steps} label="Parcours « Se lancer »" />
          <div className="flex flex-col gap-6">
            <ProgressBar value={2} max={8} label="Parcours « Se lancer »" />
            <ProgressBar value={3} max={6} label="Les bases du e-commerce" />
          </div>
        </div>
      </Section>

      <Section id="fiche" title="Fiche de calcul">
        <div className="max-w-xl">
          <CalcSheet
            title="Coût de revient d’un produit"
            rows={[
              { label: "Coût d’achat", value: "12,00 €" },
              { label: "Emballage", value: "1,20 €" },
              {
                label: "Frais de port réels",
                value: "4,90 €",
                hint: "Tarif de votre transporteur",
              },
              { label: "Coût de revient", value: "18,10 €", kind: "total" },
            ]}
            note="Valeurs d’exemple pour illustrer la présentation."
          />
        </div>
      </Section>

      <Section id="accordeon" title="Accordéon et onglets">
        <Accordion
          items={[
            {
              title: "Faut-il créer une entreprise avant de vendre ?",
              content: (
                <p>Oui, dès que l’activité est habituelle. Le guide détaille les démarches.</p>
              ),
            },
            {
              title: "Puis-je tester sans stock ?",
              content: (
                <p>Oui : pré-vente, print-on-demand ou dropshipping, chacun avec ses risques.</p>
              ),
            },
          ]}
        />
        <Tabs
          label="Choix de la plateforme"
          tabs={[
            {
              id: "shopify",
              label: "Parcours Shopify",
              content: <p>Leçons consacrées à Shopify.</p>,
            },
            {
              id: "woo",
              label: "Parcours WooCommerce",
              content: <p>Leçons consacrées à WooCommerce.</p>,
            },
          ]}
        />
      </Section>

      <Section id="infobulle" title="Infobulle de glossaire">
        <p className="prose-guide">
          Le{" "}
          <GlossaryTerm
            href="/design-system#infobulle"
            definition="Modèle de vente où le vendeur ne stocke pas les produits : le fournisseur les expédie directement au client."
          >
            dropshipping
          </GlossaryTerm>{" "}
          permet de démarrer sans stock, mais pas sans responsabilité.
        </p>
      </Section>

      <Section id="modale" title="Modale et notifications">
        <div className="flex flex-wrap gap-3">
          <ModalDemo />
        </div>
        <ToastDemo />
      </Section>

      <Section id="navigation" title="Fil d’Ariane et pagination">
        <Breadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Guides", href: "/design-system#navigation" },
            { label: "Mentions légales" },
          ]}
        />
        <Pagination current={2} total={4} hrefFor={() => "/design-system#navigation"} />
      </Section>

      <Section id="tableau" title="Tableau responsive">
        <ResponsiveTable
          caption="Exemple de comparaison (données fictives de démonstration)"
          rowHeader="plateforme"
          columns={[
            { key: "plateforme", header: "Plateforme" },
            { key: "difficulte", header: "Difficulté" },
            { key: "hebergement", header: "Hébergement" },
            { key: "profil", header: "Adapté à" },
          ]}
          rows={[
            {
              plateforme: "Plateforme A",
              difficulte: "Faible",
              hebergement: "Inclus",
              profil: "Débuter vite",
            },
            {
              plateforme: "Plateforme B",
              difficulte: "Moyenne",
              hebergement: "À prévoir",
              profil: "Personnaliser",
            },
          ]}
        />
      </Section>

      <Section id="video" title="Lecteur vidéo">
        <div className="max-w-2xl">
          <VideoPlayer
            title="Leçon d’exemple"
            src={null}
            transcript={<p>Transcription intégrale de la leçon.</p>}
          />
        </div>
      </Section>
    </>
  );
}

export default function DesignSystemPage() {
  return (
    <main id="contenu" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 pb-8">
        <h1 className="text-h1">Design system</h1>
        <p className="max-w-prose text-lead text-muted">
          Piste « Carnet de route » avec la fiche de calcul. Page interne, non indexée.
        </p>
        <ThemeSwitch />
      </div>

      <Section id="couleurs" title="Couleurs">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {colors.map((c) => (
            <li key={c.token} className="overflow-hidden rounded-ui border border-line bg-sheet">
              <div
                className="h-16 border-b border-line"
                style={{ background: `var(--${c.token})` }}
              />
              <div className="p-3 text-small">
                <p className="font-semibold">{c.name}</p>
                <p className="text-muted">
                  <code>--{c.token}</code>
                </p>
                <p className="text-muted">{c.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="typographie" title="Typographie">
        <div className="flex flex-col gap-4">
          <p className="font-serif text-display font-semibold text-ink">Display · Literata 44</p>
          <p className="font-serif text-h1 font-semibold text-ink">Titre 1 · Literata 36</p>
          <p className="font-serif text-h2 font-semibold text-ink">Titre 2 · Literata 28</p>
          <p className="font-serif text-h3 font-semibold text-ink">Titre 3 · Literata 22</p>
          <p className="font-serif text-lead">
            Chapô · Literata 20 — la réponse directe à la question du titre.
          </p>
          <p className="prose-guide">
            Corps de lecture · Literata 18, interligne 1,65, 68 caractères maximum. Les guides se
            lisent comme un carnet : des phrases courtes, des sources datées, et « ce que vous
            pouvez faire aujourd’hui » à la fin de chaque article.
          </p>
          <p className="text-ui">
            Interface · Atkinson Hyperlegible Next 16 — boutons, formulaires, outils.
          </p>
          <p className="text-small text-muted">
            Petit · 14 — métadonnées, sources, dates de vérification.
          </p>
          <p className="tabular-nums">Chiffres tabulaires : 1 234,56 € · 89,00 € · 12,50 €</p>
        </div>
      </Section>

      <Components />

      <section
        aria-labelledby="sombre-title"
        data-theme="dark"
        className="mt-10 rounded-ui bg-paper px-4 py-10 text-text sm:px-8"
      >
        <h2 id="sombre-title" className="mb-6 text-h2">
          Aperçu du mode sombre
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <RouteStepper steps={steps.slice(0, 3)} label="Parcours (aperçu sombre)" />
          <div className="flex flex-col gap-4">
            <Callout type="legal">
              <p>Encadré juridique en mode sombre.</p>
            </Callout>
            <div className="flex flex-wrap gap-3">
              <Button>Enregistrer ma simulation</Button>
              <Button variant="secondary">Annuler</Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
