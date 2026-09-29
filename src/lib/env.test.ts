import { describe, expect, it } from "vitest";

import { parsePublicEnv, parseServerEnv } from "./env";

describe("parseServerEnv", () => {
  it("applies local defaults with mock providers", () => {
    const env = parseServerEnv({});
    expect(env.APP_ENV).toBe("local");
    expect(env.EMAIL_PROVIDER).toBe("console");
    expect(env.VIDEO_PROVIDER).toBe("mock");
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });

  it("treats empty strings as undefined", () => {
    const env = parseServerEnv({ STRIPE_SECRET_KEY: "", NEXT_PUBLIC_MATOMO_URL: "" });
    expect(env.STRIPE_SECRET_KEY).toBeUndefined();
    expect(env.NEXT_PUBLIC_MATOMO_URL).toBeUndefined();
  });

  it("requires the Brevo key when Brevo is selected", () => {
    expect(() => parseServerEnv({ EMAIL_PROVIDER: "brevo" })).toThrow(/BREVO_API_KEY/);
  });

  it("requires Bunny credentials when Bunny is selected", () => {
    expect(() => parseServerEnv({ VIDEO_PROVIDER: "bunny" })).toThrow(/BUNNY_STREAM_LIBRARY_ID/);
  });

  it("refuses mocks and missing secrets in production", () => {
    let message = "";
    try {
      parseServerEnv({ APP_ENV: "production" });
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message).toMatch(/SUPABASE_SERVICE_ROLE_KEY/);
    expect(message).toMatch(/STRIPE_WEBHOOK_SECRET/);
    expect(message).toMatch(/EMAIL_PROVIDER/);
    expect(message).toMatch(/VIDEO_PROVIDER/);
  });

  it("accepts a complete production configuration", () => {
    const env = parseServerEnv({
      APP_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://premiere-vente.fr",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      SUPABASE_SERVICE_ROLE_KEY: "service",
      STRIPE_SECRET_KEY: "sk_test_x",
      STRIPE_WEBHOOK_SECRET: "whsec_x",
      EMAIL_PROVIDER: "brevo",
      BREVO_API_KEY: "key",
      VIDEO_PROVIDER: "bunny",
      BUNNY_STREAM_LIBRARY_ID: "1",
      BUNNY_STREAM_TOKEN_KEY: "token",
      CRON_SECRET: "cron",
    });
    expect(env.APP_ENV).toBe("production");
  });
});

describe("parsePublicEnv", () => {
  it("rejects an invalid site URL", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_SITE_URL: "not a url" })).toThrow(
      /NEXT_PUBLIC_SITE_URL/,
    );
  });
});
