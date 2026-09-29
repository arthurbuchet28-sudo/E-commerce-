// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { brevoEmailProvider, consoleEmailProvider, mailpitEmailProvider } from "./email";
import { simulatedPaymentProvider, stripePaymentProvider } from "./payments";

const message = { to: "lea@example.test", subject: "Sujet", text: "Texte", html: "<p>Texte</p>" };

describe("e-mail providers", () => {
  it("console provider prints the message", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await consoleEmailProvider.send(message);
    expect(info).toHaveBeenCalledWith(expect.stringContaining("to=lea@example.test"));
    info.mockRestore();
  });

  it("mailpit and brevo providers post the message and surface failures", async () => {
    const ok = vi.fn(async () => new Response("{}", { status: 200 }));
    await mailpitEmailProvider("http://mail:1", "from@x.fr", ok).send(message);
    expect(String((ok.mock.calls[0] as unknown[])[0])).toBe("http://mail:1/api/v1/send");
    await brevoEmailProvider("key", "from@x.fr", ok).send(message);
    const [url, init] = ok.mock.calls[1] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect((init.headers as Record<string, string>)["api-key"]).toBe("key");
    expect(JSON.parse(String(init.body))).toMatchObject({ subject: "Sujet", textContent: "Texte" });

    const ko = vi.fn(async () => new Response("", { status: 500 }));
    await expect(mailpitEmailProvider("http://m", "f@x.fr", ko).send(message)).rejects.toThrow(
      "500",
    );
    await expect(brevoEmailProvider("k", "f@x.fr", ko).send(message)).rejects.toThrow("500");
  });
});

describe("payment providers", () => {
  it("simulation opens the local payment page and refunds", async () => {
    const p = simulatedPaymentProvider();
    const s = await p.createCheckout({
      orderId: "o",
      reference: "PV-X",
      email: "e@x.fr",
      lines: [{ title: "F", amountCents: 100 }],
      successUrl: "https://x/s",
      cancelUrl: "https://x/c",
    });
    expect(s.id).toMatch(/^cs_sim_[0-9a-f]{32}$/);
    expect(s.url).toBe(`/paiement-simule?session=${s.id}`);
    expect((await p.refund("pi", "k")).status).toBe("succeeded");
  });

  it("Stripe adapter creates an idempotent checkout session and refunds", async () => {
    const create = vi.fn(async () => ({ id: "cs_1", url: "https://checkout.stripe.com/x" }));
    const refundCreate = vi.fn(async () => ({ id: "re_1", status: "pending" }));
    const fake = { checkout: { sessions: { create } }, refunds: { create: refundCreate } };
    const p = stripePaymentProvider(fake as never);
    const s = await p.createCheckout({
      orderId: "o1",
      reference: "PV-X",
      email: "e@x.fr",
      lines: [{ title: "F", amountCents: 4900 }],
      successUrl: "https://x/s",
      cancelUrl: "https://x/c",
    });
    expect(s).toEqual({ id: "cs_1", url: "https://checkout.stripe.com/x" });
    const [params, options] = create.mock.calls[0] as unknown as [Record<string, unknown>, object];
    expect(params).toMatchObject({ mode: "payment", locale: "fr", client_reference_id: "o1" });
    expect(options).toEqual({ idempotencyKey: "checkout-o1" });
    expect(await p.refund("pi_1", "k")).toEqual({ id: "re_1", status: "pending" });

    refundCreate.mockResolvedValueOnce({ id: "re_2", status: "succeeded" });
    expect((await p.refund("pi", "k")).status).toBe("succeeded");
    refundCreate.mockResolvedValueOnce({ id: "re_3", status: "failed" });
    expect((await p.refund("pi", "k")).status).toBe("failed");

    create.mockResolvedValueOnce({ id: "cs_2", url: null as never });
    await expect(
      p.createCheckout({
        orderId: "o",
        reference: "r",
        email: "e",
        lines: [],
        successUrl: "",
        cancelUrl: "",
      }),
    ).rejects.toThrow("no checkout URL");
  });
});
