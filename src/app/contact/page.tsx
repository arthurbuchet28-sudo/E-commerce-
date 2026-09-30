import Link from "next/link";

import { ContactForm } from "@/components/contact/ContactForm";
import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { Callout } from "@/components/ui/Callout";
import { getRoute } from "@/config/routes";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/contact");

export default function ContactPage() {
  const r = getRoute("/contact");
  return (
    <Container className="max-w-2xl">
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <div className="flex flex-col gap-8">
        <Callout type="info" title="Avant d’écrire">
          <ul className="flex list-disc flex-col gap-1 pl-5">
            <li>
              Pour vous rétracter d’un achat, utilisez directement la page{" "}
              <Link href="/retractation" className="link">
                Se rétracter
              </Link>
              .
            </li>
            <li>
              Nous ne donnons pas de conseil juridique ou comptable personnalisé : pour votre
              situation précise, adressez-vous à un expert-comptable ou à un avocat.
            </li>
          </ul>
        </Callout>
        <ContactForm />
      </div>
    </Container>
  );
}
