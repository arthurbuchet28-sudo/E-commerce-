import { z } from "zod";

/** Body of POST /api/erreurs, sent by the error pages (browser). */
export const clientErrorSchema = z.object({
  name: z.string().max(100).default("Error"),
  message: z.string().max(2000),
  path: z.string().max(2000),
});

export type ClientError = z.infer<typeof clientErrorSchema>;

/** Largest accepted body, in bytes. */
export const CLIENT_ERROR_MAX_BYTES = 4096;
