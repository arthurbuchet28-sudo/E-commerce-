import { siteConfig } from "@/config/site";
import type { SequenceEmail } from "@/data/newsletter";
import { composeEmail, hello, signature } from "@/lib/email/compose";
import type { EmailMessage } from "@/lib/services/email";

/** Newsletter e-mails (pure, unit-tested). URLs are built by the caller. */

export function confirmationEmail(to: string, confirmUrl: string): EmailMessage {
  return composeEmail(to, "Confirmez votre inscription à la newsletter", [
    hello(null),
    `Vous avez demandé à recevoir la newsletter de ${siteConfig.name}. Pour confirmer votre inscription et recevoir la checklist, ouvrez ce lien (valable 7 jours) :`,
    confirmUrl,
    "Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail : vous ne recevrez rien d’autre.",
    signature,
  ]);
}

export type SequenceUrls = {
  siteUrl: string;
  /** One-click unsubscribe endpoint (GET for the link, POST for RFC 8058). */
  unsubscribeUrl: string;
  /** Lead magnet download (e-mail 1 only). */
  checklistUrl: string;
};

/** Footer of every newsletter e-mail: why you receive it, and one-click unsubscribe. */
function footer(unsubscribeUrl: string): string {
  return `Vous recevez cet e-mail car vous vous êtes inscrit à la newsletter de ${siteConfig.name}. Se désinscrire en un clic : ${unsubscribeUrl}`;
}

export function sequenceEmail(to: string, email: SequenceEmail, urls: SequenceUrls): EmailMessage {
  const links = email.links.map((l) => `${l.label} : ${urls.siteUrl}${l.path}`);
  return composeEmail(
    to,
    email.subject,
    [
      hello(null),
      ...email.paragraphs,
      ...(email.step === 1 ? [`Télécharger la checklist (PDF) : ${urls.checklistUrl}`] : []),
      ...(links.length ? [links.join("\n")] : []),
      signature,
      footer(urls.unsubscribeUrl),
    ],
    {
      "List-Unsubscribe": `<${urls.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  );
}
