import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { SellerSnapshot } from "@/lib/commerce/seller";

// Built-in Helvetica (WinAnsi): no U+202F, so French narrow spaces are replaced.
const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", fontSize: 10, color: "#262A31", lineHeight: 1.4 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  brand: { fontFamily: "Helvetica-Bold", fontSize: 14, color: "#1C2B4B" },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    lineHeight: 1.2,
    color: "#1C2B4B",
    textAlign: "right",
    marginBottom: 6,
  },
  parties: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  party: { width: "46%" },
  label: { fontFamily: "Helvetica-Bold", marginBottom: 4 },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#D5D9E0",
    paddingVertical: 6,
  },
  head: { fontFamily: "Helvetica-Bold", borderBottomColor: "#1C2B4B" },
  cDesc: { width: "55%" },
  cQty: { width: "10%", textAlign: "right" },
  cUnit: { width: "17.5%", textAlign: "right" },
  cTotal: { width: "17.5%", textAlign: "right" },
  total: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  totalText: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  notes: { marginTop: 28, gap: 4 },
  small: { fontSize: 8, color: "#4A5363" },
});

export type InvoiceSnapshot = {
  seller: SellerSnapshot;
  buyer: { name: string | null; email: string };
  orderReference: string;
  paidAt: string | null;
  currency: string;
  totalCents: number;
  relatedInvoice: string | null;
  lines: Array<{ title: string; quantity: number; unitPriceCents: number }>;
};

export type InvoiceData = {
  number: string;
  kind: "invoice" | "credit_note";
  issuedAt: string;
  data: InvoiceSnapshot;
};

const pdfSafe = (s: string) => s.replaceAll(" ", " ");

function euros(cents: number, sign = 1): string {
  return pdfSafe(
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
      (sign * cents) / 100,
    ),
  );
}

function date(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" }).format(
    new Date(iso),
  );
}

/** Invoice or credit note, rendered from the snapshot frozen when it was issued. */
export function InvoiceDocument({ number, kind, issuedAt, data }: InvoiceData) {
  const credit = kind === "credit_note";
  const sign = credit ? -1 : 1;
  const s = data.seller;
  const title = credit ? "Avoir" : "Facture";
  return (
    <Document title={`${title} ${number}`} author={s.name} language="fr-FR">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>{s.name}</Text>
          <View>
            <Text style={styles.title}>
              {title} n° {number}
            </Text>
            <Text style={{ textAlign: "right" }}>Date : {date(issuedAt)}</Text>
          </View>
        </View>

        <View style={styles.parties}>
          <View style={styles.party}>
            <Text style={styles.label}>Vendeur</Text>
            <Text>{s.legalName}</Text>
            <Text>{s.legalForm}</Text>
            <Text>{s.address}</Text>
            <Text>SIRET : {s.siret}</Text>
            {s.vatNumber && <Text>N° de TVA : {s.vatNumber}</Text>}
            {s.nda && <Text>Déclaration d’activité n° {s.nda}</Text>}
            <Text>{s.email}</Text>
          </View>
          <View style={styles.party}>
            <Text style={styles.label}>Client</Text>
            {data.buyer.name && <Text>{data.buyer.name}</Text>}
            <Text>{data.buyer.email}</Text>
            <Text style={{ marginTop: 8 }}>Commande : {data.orderReference}</Text>
            {credit && data.relatedInvoice && (
              <Text>Facture d’origine : {data.relatedInvoice}</Text>
            )}
          </View>
        </View>

        <View style={[styles.row, styles.head]}>
          <Text style={styles.cDesc}>Désignation</Text>
          <Text style={styles.cQty}>Qté</Text>
          <Text style={styles.cUnit}>Prix unitaire</Text>
          <Text style={styles.cTotal}>Total</Text>
        </View>
        {data.lines.map((l) => (
          <View key={l.title} style={styles.row}>
            <Text style={styles.cDesc}>Formation en ligne : {l.title}</Text>
            <Text style={styles.cQty}>{l.quantity}</Text>
            <Text style={styles.cUnit}>{euros(l.unitPriceCents, sign)}</Text>
            <Text style={styles.cTotal}>{euros(l.unitPriceCents * l.quantity, sign)}</Text>
          </View>
        ))}
        <View style={styles.total}>
          <Text style={styles.totalText}>
            {credit ? "Total remboursé" : "Total payé"} : {euros(data.totalCents, sign)}
          </Text>
        </View>

        <View style={styles.notes}>
          {s.vatMention && <Text>{s.vatMention}</Text>}
          {credit ? (
            <Text>
              Avoir émis à la suite de la rétractation ou du remboursement de la commande.
            </Text>
          ) : (
            data.paidAt && <Text>Payée le {date(data.paidAt)} par carte bancaire.</Text>
          )}
          <Text style={styles.small}>
            Formation en ligne, contenu numérique fourni sans support matériel.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
