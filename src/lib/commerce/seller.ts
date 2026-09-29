import { siteConfig } from "@/config/site";
import { getRef } from "@/data/reference";

/** Seller block frozen into each invoice (see public.issue_invoice). */
export type SellerSnapshot = {
  name: string;
  legalName: string;
  legalForm: string;
  siret: string;
  address: string;
  email: string;
  vatNumber: string | null;
  /** « TVA non applicable, art. 293 B du CGI » while under the VAT franchise. */
  vatMention: string | null;
  /** Training declaration number, only when enabled in site.ts. */
  nda: string | null;
};

export function sellerSnapshot(): SellerSnapshot {
  const p = siteConfig.publisher;
  return {
    name: siteConfig.name,
    legalName: p.legalName,
    legalForm: p.legalForm,
    siret: p.siret,
    address: p.address,
    email: p.email,
    vatNumber: p.vatNumber,
    vatMention: p.vatNumber ? null : String(getRef("tva.mentionFranchise").value),
    nda: siteConfig.training.showNda ? siteConfig.training.ndaNumber : null,
  };
}
