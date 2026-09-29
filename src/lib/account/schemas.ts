import { z } from "zod";

/** Server-side validation of what members can store. Shared with the client for typing. */

export const PROGRESS_KEYS = ["parcours", "checklist-lancement"] as const;
export type ProgressKey = (typeof PROGRESS_KEYS)[number];

export const progressDataSchemas = {
  // { "<step slug>": [true, false, …] }
  parcours: z
    .record(z.string().max(60), z.array(z.boolean()).max(20))
    .refine((r) => Object.keys(r).length <= 20),
  // ["siret", "cgv", …]
  "checklist-lancement": z.array(z.string().max(60)).max(100),
} satisfies Record<ProgressKey, z.ZodType>;

export const progressBodySchema = z.object({
  data: z.unknown(),
  clientUpdatedAt: z.iso.datetime(),
});

export const TOOLS = [
  "calculateur-prix-marge",
  "simulateur-micro-entreprise",
  "seuil-de-rentabilite",
] as const;
export type SavedTool = (typeof TOOLS)[number];

export const simulationBodySchema = z.object({
  tool: z.enum(TOOLS),
  title: z
    .string()
    .trim()
    .min(1, "Donnez un nom à votre simulation.")
    .max(80, "80 caractères au maximum."),
  // Raw field values as typed by the user (strings), replayed in the tool's form.
  inputs: z
    .record(z.string().max(30), z.string().max(40))
    .refine((r) => Object.keys(r).length <= 20),
});

export type SimulationBody = z.infer<typeof simulationBodySchema>;
