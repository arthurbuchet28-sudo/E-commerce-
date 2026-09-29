import { z } from "zod";

/**
 * Environment variables, validated with Zod.
 *
 * - `publicEnvSchema`: variables exposed to the browser (NEXT_PUBLIC_*).
 * - `serverEnvSchema`: secrets, only readable on the server.
 *
 * Third-party services have mock adapters (EMAIL_PROVIDER=console, VIDEO_PROVIDER=mock)
 * so the app runs locally without any account. In production, mocks are refused.
 */

const optionalString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .pipe(z.url().optional())
  .optional();

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString,
  NEXT_PUBLIC_MATOMO_URL: optionalUrl,
  NEXT_PUBLIC_MATOMO_SITE_ID: optionalString,
});

export const serverEnvSchema = publicEnvSchema
  .extend({
    APP_ENV: z.enum(["local", "preview", "production"]).default("local"),
    SUPABASE_SERVICE_ROLE_KEY: optionalString,
    STRIPE_SECRET_KEY: optionalString,
    STRIPE_WEBHOOK_SECRET: optionalString,
    EMAIL_PROVIDER: z.enum(["console", "brevo"]).default("console"),
    BREVO_API_KEY: optionalString,
    BREVO_NEWSLETTER_LIST_ID: optionalString,
    EMAIL_FROM: z.email().default("bonjour@premiere-vente.fr"),
    VIDEO_PROVIDER: z.enum(["mock", "bunny"]).default("mock"),
    BUNNY_STREAM_LIBRARY_ID: optionalString,
    BUNNY_STREAM_TOKEN_KEY: optionalString,
    SENTRY_DSN: optionalUrl,
  })
  .superRefine((env, ctx) => {
    const require = (key: keyof typeof env, reason: string) => {
      if (!env[key]) ctx.addIssue({ code: "custom", path: [key], message: `Required ${reason}` });
    };

    if (env.EMAIL_PROVIDER === "brevo") require("BREVO_API_KEY", "when EMAIL_PROVIDER=brevo");
    if (env.VIDEO_PROVIDER === "bunny") {
      require("BUNNY_STREAM_LIBRARY_ID", "when VIDEO_PROVIDER=bunny");
      require("BUNNY_STREAM_TOKEN_KEY", "when VIDEO_PROVIDER=bunny");
    }

    if (env.APP_ENV === "production") {
      const reason = "in production";
      require("NEXT_PUBLIC_SUPABASE_URL", reason);
      require("NEXT_PUBLIC_SUPABASE_ANON_KEY", reason);
      require("SUPABASE_SERVICE_ROLE_KEY", reason);
      require("STRIPE_SECRET_KEY", reason);
      require("STRIPE_WEBHOOK_SECRET", reason);
      if (env.EMAIL_PROVIDER !== "brevo") {
        ctx.addIssue({
          code: "custom",
          path: ["EMAIL_PROVIDER"],
          message: "Mock e-mail provider is not allowed in production",
        });
      }
      if (env.VIDEO_PROVIDER !== "bunny") {
        ctx.addIssue({
          code: "custom",
          path: ["VIDEO_PROVIDER"],
          message: "Mock video provider is not allowed in production",
        });
      }
    }
  });

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function formatIssues(error: z.ZodError): string {
  return error.issues.map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
}

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${formatIssues(result.error)}`);
  }
  return result.data;
}

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const result = publicEnvSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid public environment variables:\n${formatIssues(result.error)}`);
  }
  return result.data;
}

/**
 * NEXT_PUBLIC_* variables must be referenced literally so Next.js can inline them
 * in client bundles.
 */
export const publicEnv: PublicEnv = parsePublicEnv({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_MATOMO_URL: process.env.NEXT_PUBLIC_MATOMO_URL,
  NEXT_PUBLIC_MATOMO_SITE_ID: process.env.NEXT_PUBLIC_MATOMO_SITE_ID,
});
