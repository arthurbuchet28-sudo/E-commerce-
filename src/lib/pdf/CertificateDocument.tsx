import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// Built-in Helvetica (WinAnsi): French accents, œ, ’ and « » without loading a font.
const styles = StyleSheet.create({
  page: { padding: 56, fontFamily: "Helvetica", fontSize: 12, color: "#262A31" },
  frame: {
    flexGrow: 1,
    borderWidth: 2,
    borderColor: "#1C2B4B",
    padding: 40,
    justifyContent: "space-between",
  },
  brand: { fontFamily: "Helvetica-Bold", fontSize: 14, color: "#1C2B4B" },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 26,
    color: "#1C2B4B",
    marginTop: 32,
    marginBottom: 24,
  },
  line: { marginBottom: 10, lineHeight: 1.5 },
  strong: { fontFamily: "Helvetica-Bold" },
  small: { fontSize: 9, color: "#4A5363", lineHeight: 1.4 },
});

export type CertificateData = {
  holderName: string;
  courseTitle: string;
  totalMinutes: number;
  issuedAt: string;
  serial: string;
  siteName: string;
  publisher: string;
  /** Training organisation declaration number, only when enabled in site config. */
  nda: string | null;
};

function duration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h === 0
    ? `${m} minutes`
    : m === 0
      ? `${h} heure${h > 1 ? "s" : ""}`
      : `${h} h ${String(m).padStart(2, "0")}`;
}

/** « Attestation de suivi »: never presented as a diploma or a certification. */
export function CertificateDocument(d: CertificateData) {
  const date = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeZone: "Europe/Paris",
  }).format(new Date(d.issuedAt));
  return (
    <Document
      title={`Attestation de suivi · ${d.courseTitle}`}
      author={d.siteName}
      language="fr-FR"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.frame}>
          <View>
            <Text style={styles.brand}>{d.siteName}</Text>
            <Text style={styles.title}>Attestation de suivi</Text>
            <Text style={styles.line}>
              Nous attestons que <Text style={styles.strong}>{d.holderName}</Text> a suivi
              l’intégralité de la formation en ligne
            </Text>
            <Text style={[styles.line, styles.strong]}>« {d.courseTitle} »</Text>
            <Text style={styles.line}>
              d’une durée estimée de {duration(d.totalMinutes)}, en validant les quiz de fin de
              module. Attestation délivrée le {date}.
            </Text>
          </View>
          <View>
            <Text style={styles.small}>
              Cette attestation certifie le suivi de la formation. Ce n’est ni un diplôme ni une
              certification professionnelle.
            </Text>
            <Text style={styles.small}>
              Éditeur : {d.publisher}
              {d.nda ? ` · Déclaration d’activité n° ${d.nda}` : ""} · Numéro d’attestation :{" "}
              {d.serial}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
