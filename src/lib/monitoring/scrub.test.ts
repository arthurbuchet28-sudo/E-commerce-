import { describe, expect, it } from "vitest";

import { scrubEvent, scrubPath, scrubText } from "./scrub";

describe("error report scrubbing", () => {
  it("keeps only the path of a URL", () => {
    expect(scrubPath("/newsletter/confirmer?token=abc#x")).toBe("/newsletter/confirmer");
    expect(scrubPath("https://premiere-vente.fr/compte?next=/admin")).toBe(
      "https://premiere-vente.fr/compte",
    );
    expect(scrubPath("?only=query")).toBe("/");
  });

  it("masks e-mail addresses and tokens and truncates long messages", () => {
    const token = "a".repeat(48);
    expect(scrubText(`Utilisateur lea@example.fr, jeton ${token}`)).toBe(
      "Utilisateur [e-mail], jeton [jeton]",
    );
    expect(scrubText("x ".repeat(400))).toHaveLength(500);
    expect(scrubText("Cannot read properties of undefined")).toBe(
      "Cannot read properties of undefined",
    );
  });

  it("drops user, request details and breadcrumbs from a Sentry event", () => {
    const event = scrubEvent({
      message: "échec pour lea@example.fr",
      user: { ip_address: "1.2.3.4" },
      server_name: "host",
      breadcrumbs: [{ message: "form input" }],
      request: {
        url: "https://site.fr/api/x?token=secret",
        cookies: { sb: "session" },
        headers: { cookie: "sb=session" },
        query_string: "token=secret",
        data: { email: "lea@example.fr" },
      },
      exception: { values: [{ value: "bad token " + "b".repeat(40) }, {}] },
    });
    expect(event).toEqual({
      message: "échec pour [e-mail]",
      request: { url: "https://site.fr/api/x" },
      exception: { values: [{ value: "bad token [jeton]" }, {}] },
    });
    expect(scrubEvent({ request: { headers: {} } }).request).toEqual({});
    expect(scrubEvent({})).toEqual({});
  });
});
