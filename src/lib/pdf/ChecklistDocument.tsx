import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { ChecklistGroup } from "@/data/checklist";

// Built-in Helvetica (WinAnsi): covers French accents, œ, ’ and « » without loading a font.
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#262A31" },
  title: { fontFamily: "Helvetica-Bold", fontSize: 18, color: "#1C2B4B", marginBottom: 4 },
  meta: { color: "#4A5363", marginBottom: 16 },
  group: { marginBottom: 12 },
  groupTitle: { fontFamily: "Helvetica-Bold", fontSize: 12, color: "#1C2B4B", marginBottom: 6 },
  item: { flexDirection: "row", marginBottom: 4 },
  box: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: "#4A5363",
    marginRight: 8,
    marginTop: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  check: { fontFamily: "Helvetica-Bold", fontSize: 8, color: "#3F6B55" },
  label: { flex: 1 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 8, color: "#4A5363" },
});

type Props = {
  groups: ChecklistGroup[];
  checked: ReadonlySet<string>;
  siteName: string;
  date: string;
};

export function ChecklistDocument({ groups, checked, siteName, date }: Props) {
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const done = groups.reduce((n, g) => n + g.items.filter((i) => checked.has(i.id)).length, 0);
  return (
    <Document title="Checklist de lancement" author={siteName} language="fr-FR">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Checklist de lancement de votre boutique</Text>
        <Text style={styles.meta}>
          {`${done} point${done > 1 ? "s" : ""} validé${done > 1 ? "s" : ""} sur ${total}, au ${date}.`}
        </Text>
        {groups.map((g) => (
          <View key={g.id} style={styles.group} wrap={false}>
            <Text style={styles.groupTitle}>{g.title}</Text>
            {g.items.map((item) => (
              <View key={item.id} style={styles.item}>
                <View style={styles.box}>
                  {checked.has(item.id) ? <Text style={styles.check}>X</Text> : null}
                </View>
                <Text style={styles.label}>{item.label}</Text>
              </View>
            ))}
          </View>
        ))}
        <Text style={styles.footer} fixed>
          {`${siteName} · Contenu informatif, il ne remplace pas l’avis d’un expert-comptable ou d’un avocat.`}
        </Text>
      </Page>
    </Document>
  );
}
