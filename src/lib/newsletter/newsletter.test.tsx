// @vitest-environment node
import { renderToBuffer } from "@react-pdf/renderer";
import { describe, expect, it, vi } from "vitest";

import { launchChecklist } from "@/data/checklist";
import {
  LEAD_MAGNET_COUNT,
  LEAD_MAGNET_TITLE,
  leadMagnetGroups,
  welcomeSequence,
} from "@/data/newsletter";
import { routes } from "@/config/routes";
import { paragraphToHtml } from "@/lib/email/compose";
import { ChecklistDocument } from "@/lib/pdf/ChecklistDocument";
import { brevoAudienceProvider, noAudienceProvider } from "@/lib/services/audience";

import { confirmationEmail, sequenceEmail } from "./emails";

const urls = {
  siteUrl: "https://x.fr",
  unsubscribeUrl: "https://x.fr/api/newsletter/desinscription?token=abc",
  checklistUrl: "https://x.fr/api/newsletter/checklist?token=abc",
};

describe("lead magnet", () => {
  it("has 25 points, all taken from the launch checklist", () => {
    const items = leadMagnetGroups().flatMap((g) => g.items);
    expect(items).toHaveLength(25);
    expect(LEAD_MAGNET_COUNT).toBe(25);
    const all = new Set(launchChecklist.flatMap((g) => g.items.map((i) => i.id)));
    for (const i of items) expect(all.has(i.id)).toBe(true);
    expect(LEAD_MAGNET_TITLE).toContain("25 points");
  });

  it("renders as a PDF", async () => {
    const buf = await renderToBuffer(
      <ChecklistDocument
        groups={leadMagnetGroups()}
        checked={new Set()}
        siteName="Première Vente"
        date="29 septembre 2026"
        title={LEAD_MAGNET_TITLE}
      />,
    );
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
  }, 30_000);
});

describe("welcome sequence", () => {
  it("has 5 e-mails in order; only the first is not a draft", () => {
    expect(welcomeSequence.map((e) => e.step)).toEqual([1, 2, 3, 4, 5]);
    expect(welcomeSequence[0].delayDays).toBe(0);
    expect(welcomeSequence.filter((e) => !e.draft).map((e) => e.step)).toEqual([1]);
  });

  it("links only to existing pages", () => {
    const known = new Set<string>(routes.map((r) => r.path));
    for (const e of welcomeSequence)
      for (const l of e.links) {
        const ok =
          known.has(l.path) ||
          /^\/(guides\/[a-z-]+\/[a-z0-9-]+|formations\/[a-z0-9-]+)$/.test(l.path);
        expect(ok, l.path).toBe(true);
      }
  });
});

describe("newsletter e-mails", () => {
  it("asks for confirmation without any marketing content", () => {
    const m = confirmationEmail("lea@example.test", "https://x.fr/newsletter/confirmer?token=t");
    expect(m.subject).toBe("Confirmez votre inscription à la newsletter");
    expect(m.html).toContain('<a href="https://x.fr/newsletter/confirmer?token=t">');
    expect(m.headers).toBeUndefined();
  });

  it("carries one-click unsubscribe headers and footer, and the checklist in e-mail 1", () => {
    const first = sequenceEmail("lea@example.test", welcomeSequence[0], urls);
    expect(first.headers).toEqual({
      "List-Unsubscribe": `<${urls.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    });
    expect(first.text).toContain(urls.checklistUrl);
    expect(first.text).toContain(`Se désinscrire en un clic\u00a0: ${urls.unsubscribeUrl}`);
    const second = sequenceEmail("lea@example.test", welcomeSequence[1], urls);
    expect(second.text).not.toContain(urls.checklistUrl);
    expect(second.text).toContain("https://x.fr/se-lancer");
  });

  it("makes links clickable without breaking punctuation", () => {
    expect(paragraphToHtml("Voir https://x.fr/a?b=1&c=2.")).toBe(
      '<p>Voir <a href="https://x.fr/a?b=1&amp;c=2">https://x.fr/a?b=1&amp;c=2</a>.</p>',
    );
  });
});

describe("audience providers", () => {
  it("no-op provider does nothing", async () => {
    await expect(noAudienceProvider.add("a@b.fr")).resolves.toBeUndefined();
    await expect(noAudienceProvider.remove("a@b.fr")).resolves.toBeUndefined();
  });

  it("Brevo provider adds to and removes from the list", async () => {
    const ok = vi.fn(async () => new Response("{}", { status: 201 }));
    const p = brevoAudienceProvider("key", 7, ok);
    await p.add("a@b.fr");
    await p.remove("a@b.fr");
    const calls = ok.mock.calls as unknown as Array<[string, RequestInit]>;
    expect(calls[0][0]).toBe("https://api.brevo.com/v3/contacts");
    expect(JSON.parse(String(calls[0][1].body))).toEqual({
      email: "a@b.fr",
      listIds: [7],
      updateEnabled: true,
    });
    expect(calls[1][0]).toBe("https://api.brevo.com/v3/contacts/lists/7/contacts/remove");
    const ko = vi.fn(async () => new Response("", { status: 400 }));
    await expect(brevoAudienceProvider("k", 7, ko).add("a@b.fr")).rejects.toThrow("400");
  });
});
