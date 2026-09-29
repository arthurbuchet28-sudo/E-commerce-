/** Personas used in examples (section 1.3 of the specification). */
export const personas = {
  lea: {
    name: "Léa",
    age: 27,
    summary:
      "Salariée, elle lance une petite marque de bijoux en activité secondaire, le soir, avec un budget serré.",
  },
  karim: {
    name: "Karim",
    age: 41,
    summary:
      "Commerçant, il veut ajouter la vente en ligne et le click & collect à sa boutique physique.",
  },
  sophie: {
    name: "Sophie",
    age: 46,
    summary:
      "En reconversion, elle hésite entre dropshipping, print-on-demand et revente, et se méfie des « gourous ».",
  },
  tom: {
    name: "Tom",
    age: 20,
    summary: "Étudiant en alternance, il veut tester une idée avec presque 0 €.",
  },
} as const;

export type PersonaId = keyof typeof personas;
