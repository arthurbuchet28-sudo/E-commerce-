import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";

import { launchChecklist } from "@/data/checklist";

import { ChecklistDocument } from "./ChecklistDocument";

/** Loaded on demand (dynamic import) so the PDF library never weighs on page load. */
export async function checklistPdfBlob(
  checked: ReadonlySet<string>,
  siteName: string,
): Promise<Blob> {
  const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date());
  // ChecklistDocument renders a <Document>, which is what pdf() expects.
  const doc = createElement(ChecklistDocument, {
    groups: launchChecklist,
    checked,
    siteName,
    date,
  }) as unknown as ReactElement<DocumentProps>;
  return pdf(doc).toBlob();
}
