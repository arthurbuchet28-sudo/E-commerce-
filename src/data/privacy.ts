import { CONSENT_PROOF_MONTHS } from "@/lib/consent/consent";
import { CONTACT_RETENTION_MONTHS } from "@/lib/contact/topics";

import { NEWSLETTER_RETENTION } from "./newsletter";
import { formatRef, getRef } from "./reference";

/**
 * Personal data processing: single source for the privacy policy page and the processing
 * register (docs/registre-traitements.md, which lists the same ids — checked by a test).
 * Everything here is a draft to be validated by a legal professional; items that could not
 * be checked on the provider's own documents carry [À VÉRIFIER].
 */

export type Processor = {
  id: string;
  name: string;
  role: string;
  location: string;
  /** Legal framework for transfers outside the EU, when any. */
  transfer: string | null;
};

export const processors: Processor[] = [
  {
    id: "supabase",
    name: "Supabase Inc. [À VÉRIFIER — entité contractante]",
    role: "Base de données, authentification et stockage des fichiers",
    location: "Union européenne (Francfort, Allemagne)",
    transfer: "Société établie aux États-Unis [À VÉRIFIER — accord de traitement et garanties]",
  },
  {
    id: "vercel",
    name: "Vercel Inc.",
    role: "Hébergement du site",
    location: "Exécution à Paris (région cdg1), société établie aux États-Unis",
    transfer: "[À VÉRIFIER — Data Privacy Framework ou clauses contractuelles types]",
  },
  {
    id: "stripe",
    name: "Stripe [À VÉRIFIER — entité contractante en Europe]",
    role: "Paiement en ligne, remboursements",
    location: "[À VÉRIFIER]",
    transfer: "[À VÉRIFIER]",
  },
  {
    id: "brevo",
    name: "Brevo [À VÉRIFIER — entité contractante]",
    role: "Envoi des e-mails (compte, commandes, newsletter)",
    location: "Union européenne [À VÉRIFIER]",
    transfer: null,
  },
  {
    id: "bunny",
    name: "Bunny Stream (BunnyWay) [À VÉRIFIER — entité contractante]",
    role: "Hébergement et diffusion des vidéos des formations",
    location: "Union européenne [À VÉRIFIER]",
    transfer: null,
  },
  {
    id: "matomo",
    name: "Matomo Cloud (InnoCraft) [À VÉRIFIER — entité contractante]",
    role: "Mesure d’audience exemptée de consentement",
    location: "Union européenne [À VÉRIFIER — lieu d’hébergement choisi]",
    transfer: null,
  },
  {
    id: "sentry",
    name: "Sentry (Functional Software) [À VÉRIFIER — entité contractante]",
    role: "Surveillance des erreurs techniques du site",
    location: "Union européenne (région de données UE, Francfort) [À VÉRIFIER]",
    transfer: "Société établie aux États-Unis [À VÉRIFIER — accord de traitement et garanties]",
  },
];

export type Treatment = {
  id: string;
  purpose: string;
  legalBasis: string;
  data: string[];
  retention: string;
  processors: Processor["id"][];
};

const accountingYears = formatRef(getRef("rgpd.conservationPiecesComptables"));
const cookieChoice = formatRef(getRef("cnil.dureeChoixCookies"));

export const treatments: Treatment[] = [
  {
    id: "comptes",
    purpose: "Créer et gérer votre compte et votre espace membre",
    legalBasis: "Exécution du contrat (conditions générales d’utilisation)",
    data: [
      "adresse e-mail",
      "nom affiché (facultatif)",
      "mot de passe (conservé sous forme chiffrée par le prestataire d’authentification)",
      "progression dans le parcours et la checklist, simulations enregistrées",
      "date et version des CGU acceptées",
    ],
    retention:
      "Jusqu’à la suppression du compte [À VALIDER : suppression après une durée d’inactivité]",
    processors: ["supabase", "vercel", "brevo"],
  },
  {
    id: "formations",
    purpose: "Donner accès aux formations et suivre votre progression",
    legalBasis: "Exécution du contrat",
    data: [
      "formations suivies",
      "leçons terminées",
      "réponses et scores aux quiz",
      "attestations de suivi",
    ],
    retention: "Jusqu’à la suppression du compte",
    processors: ["supabase", "vercel", "bunny"],
  },
  {
    id: "commandes",
    purpose: "Traiter vos commandes, les paiements et la facturation",
    legalBasis: "Exécution du contrat et obligation légale (comptabilité)",
    data: [
      "nom, adresse e-mail",
      "formations achetées, montant, dates",
      "acceptation des CGV et, le cas échéant, renonciation au droit de rétractation (date et version du texte)",
      "numéro de commande et factures (les données de carte bancaire sont traitées par le prestataire de paiement, jamais par le site)",
    ],
    retention: `${accountingYears} pour les factures et les pièces comptables, y compris après la suppression du compte`,
    processors: ["supabase", "vercel", "stripe", "brevo"],
  },
  {
    id: "retractation",
    purpose: "Permettre l’exercice du droit de rétractation et rembourser",
    legalBasis: "Obligation légale",
    data: [
      "nom, adresse e-mail",
      "numéro de commande",
      "date de la rétractation",
      "état du remboursement",
    ],
    retention: `Avec la commande concernée (${accountingYears}) [À VALIDER]`,
    processors: ["supabase", "vercel", "stripe", "brevo"],
  },
  {
    id: "newsletter",
    purpose: "Vous envoyer la newsletter et la checklist offerte",
    legalBasis: "Consentement",
    data: [
      "adresse e-mail",
      "origine de l’inscription",
      "dates de demande, de confirmation et de désinscription",
      "version du texte de consentement",
    ],
    retention: `${NEWSLETTER_RETENTION.pendingDays} jours sans confirmation ; après une désinscription, ${Math.round(NEWSLETTER_RETENTION.unsubscribedDays / 365)} ans pour prouver le consentement passé [À VALIDER]`,
    processors: ["supabase", "vercel", "brevo"],
  },
  {
    id: "contact",
    purpose: "Répondre à vos messages envoyés par le formulaire de contact",
    legalBasis: "Intérêt légitime (répondre aux demandes)",
    data: ["nom", "adresse e-mail", "sujet et contenu du message"],
    retention: `${CONTACT_RETENTION_MONTHS / 12}\u00a0ans au plus [À VALIDER]`,
    processors: ["supabase", "vercel", "brevo"],
  },
  {
    id: "audience",
    purpose: "Mesurer l’audience du site pour l’améliorer (statistiques anonymes, sans cookie)",
    legalBasis: "Intérêt légitime (mesure d’audience exemptée de consentement)",
    data: ["pages consultées, date et heure", "navigateur, type d’appareil, adresse IP tronquée"],
    retention: "[À VÉRIFIER — durée maximale recommandée par la CNIL pour l’exemption]",
    processors: ["matomo"],
  },
  {
    id: "securite",
    purpose: "Protéger le site contre les abus (limitation des tentatives, prévention du spam)",
    legalBasis: "Intérêt légitime (sécurité)",
    data: ["empreinte non réversible de l’adresse IP et de l’adresse e-mail saisie"],
    retention: "24 heures ; journaux techniques de l’hébergeur : [À VÉRIFIER]",
    processors: ["supabase", "vercel"],
  },
  {
    id: "erreurs",
    purpose: "Détecter et corriger les erreurs techniques du site",
    legalBasis: "Intérêt légitime (bon fonctionnement du service)",
    data: [
      "adresse de la page sans ses paramètres",
      "message d’erreur, adresses e-mail et jetons masqués",
      "date et environnement technique",
    ],
    retention: "[À VÉRIFIER — durée de conservation paramétrée dans Sentry]",
    processors: ["sentry", "vercel"],
  },
  {
    id: "traceurs",
    purpose: "Enregistrer vos choix sur les traceurs soumis à consentement, et les prouver",
    legalBasis: "Obligation légale (preuve du consentement)",
    data: [
      "identifiant aléatoire",
      "choix par finalité",
      "version de la liste des finalités",
      "date",
    ],
    retention: `Choix redemandé après ${cookieChoice} ; preuves conservées ${CONSENT_PROOF_MONTHS}\u00a0mois [À VALIDER]`,
    processors: ["supabase", "vercel"],
  },
];

/** Cookies and local storage used by the site, all strictly necessary (no consent needed). */
export const essentialStorage = [
  {
    name: "sb-…-auth-token",
    kind: "Cookie",
    purpose:
      "Maintenir votre connexion à l’espace membre (posé uniquement quand vous vous connectez)",
    duration: "Durée de la session [À VÉRIFIER — configuration Supabase]",
  },
  {
    name: "parcours:v1, checklist-lancement:v1, checklist:…",
    kind: "Stockage local du navigateur",
    purpose: "Mémoriser votre progression dans le parcours et la checklist, sur cet appareil",
    duration: "Jusqu’à ce que vous effaciez les données du site",
  },
  {
    name: "pv-consentement",
    kind: "Stockage local du navigateur",
    purpose: "Mémoriser vos choix sur les traceurs et sur la mesure d’audience",
    duration: cookieChoice,
  },
] as const;
