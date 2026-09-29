import { unsubscribeMember } from "@/app/newsletter/actions";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { Button } from "@/components/ui/Button";
import { formatDateParis } from "@/lib/commerce/format";
import { createAdminClient } from "@/lib/supabase/admin";

/** « Mes préférences e-mail »: newsletter status of the member's (verified) address. */
export async function NewsletterPreferences({ email }: { email: string }) {
  const admin = createAdminClient();
  const { data: sub } = admin
    ? await admin
        .from("newsletter_subscribers")
        .select("status, confirmed_at")
        .eq("email", email.toLowerCase())
        .maybeSingle()
    : { data: null };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted">
        Les e-mails liés à votre compte et à vos achats (confirmation, connexion, factures) sont
        toujours envoyés. La newsletter, elle, dépend de votre accord.
      </p>
      {sub?.status === "confirmed" ? (
        <form action={unsubscribeMember} className="flex flex-col gap-3">
          <p>
            Vous êtes inscrit à la newsletter
            {sub.confirmed_at && ` depuis le ${formatDateParis(sub.confirmed_at)}`}.
          </p>
          <div>
            <Button type="submit" variant="secondary">
              Me désinscrire de la newsletter
            </Button>
          </div>
        </form>
      ) : sub?.status === "pending" ? (
        <p>
          Inscription à la newsletter en attente : ouvrez l’e-mail de confirmation que nous vous
          avons envoyé.
        </p>
      ) : (
        <NewsletterForm
          source="compte"
          idPrefix="compte-newsletter"
          defaultEmail={email}
          submitLabel="M’inscrire à la newsletter"
        />
      )}
    </div>
  );
}
