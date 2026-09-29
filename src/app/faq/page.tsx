import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { Accordion } from "@/components/ui/Accordion";
import { getRoute } from "@/config/routes";
import { getFaq } from "@/lib/content/faq";
import { faqJsonLd, JsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/faq");

export default function FaqPage() {
  const r = getRoute("/faq");
  const faq = getFaq();
  return (
    <Container>
      <JsonLd data={faqJsonLd(faq.themes.flatMap((t) => t.items))} />
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <div
        data-pagefind-body
        data-pagefind-filter="type:FAQ"
        className="flex max-w-3xl flex-col gap-10"
      >
        {faq.themes.map((theme) => (
          <section key={theme.title} aria-label={theme.title} className="flex flex-col gap-4">
            <h2 className="text-h2">{theme.title}</h2>
            <Accordion
              items={theme.items.map((i) => ({ title: i.question, content: <p>{i.answer}</p> }))}
            />
          </section>
        ))}
      </div>
    </Container>
  );
}
