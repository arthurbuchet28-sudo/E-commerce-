import { refundDays, waiverText, withdrawalDays } from "@/config/legal";
import { siteConfig } from "@/config/site";
import type { EmailMessage } from "@/lib/services/email";

import { addDays, formatDateParis, formatDateTimeParis, formatEuros } from "./format";

/**
 * Transactional e-mails of the purchase and withdrawal flows. Pure functions (unit-tested):
 * the plain-text version is the reference; the HTML version is the same text, escaped.
 */

export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toHtml(paragraphs: string[]): string {
  const body = paragraphs.map((p) => `<p>${escapeHtml(p).replaceAll("\n", "<br>")}</p>`).join("\n");
  return `<!doctype html><html lang="fr"><body style="font-family:sans-serif;line-height:1.5;max-width:40rem">${body}</body></html>`;
}

function message(to: string, subject: string, paragraphs: string[]): EmailMessage {
  return { to, subject, text: paragraphs.join("\n\n"), html: toHtml(paragraphs) };
}

function hello(name: string | null): string {
  return name ? `Bonjour ${name},` : "Bonjour,";
}

const signature = `À bientôt,\n${siteConfig.name}`;

export type OrderConfirmation = {
  email: string;
  customerName: string | null;
  reference: string;
  paidAt: string;
  amountCents: number;
  immediateAccess: boolean;
  waiverAt: string | null;
  accessStartsAt: string;
  items: Array<{ title: string; slug: string; accessMonths: number }>;
  vatMention: string | null;
};

export function orderConfirmationEmail(o: OrderConfirmation, siteUrl: string): EmailMessage {
  const days = withdrawalDays();
  const deadline = formatDateParis(addDays(o.paidAt, days));
  const withdrawalUrl = `${siteUrl}/retractation`;
  const first = o.items[0];
  const summary = [
    `Commande : ${o.reference}`,
    `Date : ${formatDateTimeParis(o.paidAt)}`,
    ...o.items.map((i) => `Formation : ${i.title}`),
    `Montant payé : ${formatEuros(o.amountCents)} TTC`,
    ...(o.vatMention ? [o.vatMention] : []),
  ].join("\n");

  const access = o.immediateAccess
    ? [
        `Votre accès est ouvert dès maintenant, pendant ${first.accessMonths} mois : ${siteUrl}/apprendre/${first.slug}`,
        `Accès immédiat et renonciation au droit de rétractation : le ${formatDateTimeParis(o.waiverAt ?? o.paidAt)}, vous avez coché la case suivante :\n« ${waiverText()} »`,
        `Tant que vous n’avez ouvert aucune leçon, vous pouvez encore vous rétracter jusqu’au ${deadline}, en ligne : ${withdrawalUrl}`,
      ]
    : [
        `Votre accès ouvrira le ${formatDateParis(o.accessStartsAt)}, à la fin du délai de rétractation de ${days} jours, pour ${first.accessMonths} mois.`,
        `Jusqu’au ${deadline}, vous pouvez vous rétracter en ligne, sans justification ni frais, avec votre numéro de commande et votre adresse e-mail : ${withdrawalUrl}`,
      ];

  return message(o.email, `Votre commande ${o.reference} est confirmée`, [
    hello(o.customerName),
    "Merci pour votre commande. Voici son récapitulatif.",
    summary,
    ...access,
    `Votre facture est disponible dans votre espace membre : ${siteUrl}/compte`,
    signature,
  ]);
}

export type WithdrawalAck = {
  email: string;
  consumerName: string;
  reference: string;
  requestedAt: string;
  amountCents: number;
  titles: string[];
};

export function withdrawalAckEmail(w: WithdrawalAck): EmailMessage {
  const days = refundDays();
  return message(w.email, `Accusé de réception de votre rétractation (commande ${w.reference})`, [
    hello(w.consumerName),
    `Nous avons bien reçu votre rétractation le ${formatDateTimeParis(w.requestedAt)}.`,
    [`Commande : ${w.reference}`, ...w.titles.map((t) => `Formation : ${t}`)].join("\n"),
    "Votre accès à la formation est fermé.",
    `Remboursement : ${formatEuros(w.amountCents)}, sur le moyen de paiement utilisé lors de l’achat, sans frais, au plus tard le ${formatDateParis(addDays(w.requestedAt, days))} (${days} jours après votre rétractation).`,
    "Conservez cet e-mail : il constitue l’accusé de réception de votre rétractation.",
    signature,
  ]);
}
