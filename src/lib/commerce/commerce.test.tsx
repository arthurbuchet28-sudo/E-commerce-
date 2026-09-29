// @vitest-environment node
import { renderToBuffer } from "@react-pdf/renderer";
import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { waiverText } from "@/config/legal";
import { InvoiceDocument } from "@/lib/pdf/InvoiceDocument";

import { escapeHtml } from "@/lib/email/compose";

import { orderConfirmationEmail, withdrawalAckEmail } from "./emails";
import {
  addDays,
  formatDateParis,
  formatDateTimeParis,
  formatEuros,
  normalizeOrderReference,
} from "./format";
import { sellerSnapshot } from "./seller";
import { handleStripeWebhook, type WebhookDeps } from "./webhook";

const NBSP = " ";

describe("formatting", () => {
  it("formats amounts and Paris dates", () => {
    expect(formatEuros(4900).replace(/\s/g, " ")).toBe("49,00 €");
    expect(formatDateParis("2026-09-29T22:30:00Z")).toBe("30 septembre 2026");
    expect(formatDateTimeParis("2026-09-29T12:05:00Z")).toBe(
      `29 septembre 2026 à 14${NBSP}h${NBSP}05`,
    );
    expect(addDays("2026-09-29T12:00:00.000Z", 14)).toBe("2026-10-13T12:00:00.000Z");
  });

  it("normalizes order references typed by hand", () => {
    expect(normalizeOrderReference("pv-7k3m 9q2a")).toBe("PV-7K3M9Q2A");
    expect(normalizeOrderReference("7K3M9Q2A")).toBe("PV-7K3M9Q2A");
    expect(normalizeOrderReference("PV-7K3M9Q2")).toBeNull();
    expect(normalizeOrderReference("PV-OOOOOOOO")).toBeNull();
  });
});

describe("seller snapshot", () => {
  it("carries the VAT franchise mention while there is no VAT number", () => {
    const s = sellerSnapshot();
    expect(s.vatMention).toBe("TVA non applicable, art. 293 B du CGI");
    expect(s.nda).toBeNull();
  });
});

const confirmation = {
  email: "lea@example.test",
  customerName: "Léa <b>",
  reference: "PV-7K3M9Q2A",
  paidAt: "2026-09-29T12:00:00Z",
  amountCents: 4900,
  waiverAt: "2026-09-29T11:58:00Z",
  accessStartsAt: "2026-09-29T12:00:00Z",
  items: [{ title: "Trouver et valider son produit", slug: "trouver", accessMonths: 24 }],
  vatMention: "TVA non applicable, art. 293 B du CGI",
};

describe("e-mails", () => {
  it("escapes HTML", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;",
    );
  });

  it("confirms an immediate-access order with the waiver reminder", () => {
    const m = orderConfirmationEmail({ ...confirmation, immediateAccess: true }, "https://x.fr");
    expect(m.subject).toBe("Votre commande PV-7K3M9Q2A est confirmée");
    expect(m.text).toContain("Bonjour Léa <b>,");
    expect(m.html).toContain("Bonjour Léa &lt;b&gt;,");
    expect(m.html).not.toContain("<b>");
    expect(m.text).toContain(`«\u00a0${waiverText()}\u00a0»`);
    expect(m.text).toContain("https://x.fr/apprendre/trouver");
    expect(m.text).toContain("jusqu’au 13 octobre 2026");
    expect(m.text).toContain("TVA non applicable");
  });

  it("confirms a deferred order with the withdrawal link", () => {
    const m = orderConfirmationEmail(
      {
        ...confirmation,
        customerName: null,
        vatMention: null,
        immediateAccess: false,
        waiverAt: null,
        accessStartsAt: "2026-10-13T12:00:00Z",
      },
      "https://x.fr",
    );
    expect(m.text.startsWith("Bonjour,")).toBe(true);
    expect(m.text).toContain("Votre accès ouvrira le 13 octobre 2026");
    expect(m.text).toContain("https://x.fr/retractation");
    expect(m.text).not.toContain("renonce");
    expect(m.text).not.toContain("TVA");
  });

  it("acknowledges a withdrawal with the refund deadline", () => {
    const m = withdrawalAckEmail({
      email: "lea@example.test",
      consumerName: "Léa",
      reference: "PV-7K3M9Q2A",
      requestedAt: "2026-10-01T08:00:00Z",
      amountCents: 4900,
      titles: ["Trouver et valider son produit"],
    });
    expect(m.subject).toContain("PV-7K3M9Q2A");
    expect(m.text).toContain(`1 octobre 2026 à 10${NBSP}h${NBSP}00`);
    expect(m.text).toContain("au plus tard le 15 octobre 2026");
  });
});

describe("invoice PDF", () => {
  it("renders invoices and credit notes", async () => {
    for (const kind of ["invoice", "credit_note"] as const) {
      const buf = await renderToBuffer(
        <InvoiceDocument
          number={kind === "invoice" ? "F2026-00001" : "AV2026-00001"}
          kind={kind}
          issuedAt="2026-09-29T12:00:00Z"
          data={{
            seller: sellerSnapshot(),
            buyer: { name: "Léa", email: "lea@example.test" },
            orderReference: "PV-7K3M9Q2A",
            paidAt: "2026-09-29T12:00:00Z",
            currency: "eur",
            totalCents: 124900,
            relatedInvoice: kind === "credit_note" ? "F2026-00001" : null,
            lines: [{ title: "Formation", quantity: 1, unitPriceCents: 124900 }],
          }}
        />,
      );
      expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
    }
  }, 30_000);
});

describe("Stripe webhook", () => {
  const secret = "whsec_test";
  const stripe = new Stripe("sk_test_unused");

  function signed(event: object) {
    const payload = JSON.stringify(event);
    return { payload, signature: stripe.webhooks.generateTestHeaderString({ payload, secret }) };
  }

  function deps(result: unknown, overrides: Partial<WebhookDeps> = {}) {
    const rpc = vi.fn(async () => ({ data: result, error: null }));
    const sendEmail = vi.fn(async () => {});
    const d: WebhookDeps = {
      constructEvent: (p, s, k) => stripe.webhooks.constructEvent(p, s, k),
      secret,
      rpc,
      sendEmail,
      seller: sellerSnapshot(),
      siteUrl: "https://x.fr",
      log: vi.fn(),
      ...overrides,
    };
    return { d, rpc, sendEmail };
  }

  const completed = (paymentStatus = "paid") => ({
    id: "evt_1",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_1",
        payment_status: paymentStatus,
        amount_total: 4900,
        currency: "eur",
        payment_intent: { id: "pi_1" },
      },
    },
  });

  it("refuses missing and invalid signatures", async () => {
    const { d, rpc } = deps({});
    expect((await handleStripeWebhook("{}", null, d)).status).toBe(400);
    expect((await handleStripeWebhook("{}", "t=1,v1=x", d)).body.error).toBe("invalid_signature");
    expect((await handleStripeWebhook("{}", "t=1,v1=x", { ...d, secret: null })).status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("fulfills a paid session and sends the confirmation", async () => {
    const { d, rpc, sendEmail } = deps({
      status: "fulfilled",
      ...confirmation,
      immediateAccess: true,
    });
    const { payload, signature } = signed(completed());
    const res = await handleStripeWebhook(payload, signature, d);
    expect(res).toEqual({ status: 200, body: { received: true, result: "fulfilled" } });
    expect(rpc).toHaveBeenCalledWith(
      "fulfill_order",
      expect.objectContaining({
        p_event_id: "evt_1",
        p_session_id: "cs_1",
        p_payment_intent: "pi_1",
        p_amount_cents: 4900,
        p_withdrawal_days: 14,
      }),
    );
    expect(sendEmail).toHaveBeenCalledOnce();
  });

  it("keeps a 200 when the e-mail fails (access already granted)", async () => {
    const { d } = deps(
      { status: "fulfilled", ...confirmation, immediateAccess: true },
      { sendEmail: vi.fn(async () => Promise.reject(new Error("smtp"))) },
    );
    const { payload, signature } = signed(completed());
    expect((await handleStripeWebhook(payload, signature, d)).status).toBe(200);
    expect(d.log).toHaveBeenCalledWith(expect.stringContaining("smtp"));
  });

  it("ignores unpaid sessions, logs mismatches and asks Stripe to retry on errors", async () => {
    const unpaid = deps({});
    const s1 = signed(completed("unpaid"));
    expect((await handleStripeWebhook(s1.payload, s1.signature, unpaid.d)).body.result).toBe(
      "unpaid",
    );
    expect(unpaid.rpc).not.toHaveBeenCalled();

    const mismatch = deps({ status: "amount_mismatch" });
    const s2 = signed(completed());
    expect((await handleStripeWebhook(s2.payload, s2.signature, mismatch.d)).body.result).toBe(
      "amount_mismatch",
    );
    expect(mismatch.d.log).toHaveBeenCalled();
    expect(mismatch.sendEmail).not.toHaveBeenCalled();

    const failing = deps(null, {
      rpc: vi.fn(async () => ({ data: null, error: { message: "db down" } })),
    });
    expect((await handleStripeWebhook(s2.payload, s2.signature, failing.d)).status).toBe(500);
  });

  it("expires sessions and records refunds", async () => {
    const exp = deps({ status: "expired" });
    const s1 = signed({
      id: "evt_2",
      type: "checkout.session.expired",
      data: { object: { id: "cs_1" } },
    });
    expect((await handleStripeWebhook(s1.payload, s1.signature, exp.d)).body.result).toBe(
      "expired",
    );
    expect(exp.rpc).toHaveBeenCalledWith("expire_order", {
      p_event_id: "evt_2",
      p_session_id: "cs_1",
    });

    const ref = deps({ status: "refunded" });
    const s2 = signed({
      id: "evt_3",
      type: "charge.refunded",
      data: {
        object: {
          payment_intent: "pi_1",
          amount_refunded: 4900,
          refunds: { data: [{ id: "re_1" }] },
        },
      },
    });
    expect((await handleStripeWebhook(s2.payload, s2.signature, ref.d)).body.result).toBe(
      "refunded",
    );
    expect(ref.rpc).toHaveBeenCalledWith(
      "record_refund",
      expect.objectContaining({
        p_payment_intent: "pi_1",
        p_amount_refunded: 4900,
        p_refund_id: "re_1",
      }),
    );

    const noIntent = deps({});
    const s3 = signed({
      id: "evt_4",
      type: "charge.refunded",
      data: { object: { payment_intent: null, amount_refunded: 1 } },
    });
    expect((await handleStripeWebhook(s3.payload, s3.signature, noIntent.d)).body.result).toBe(
      "ignored",
    );
  });

  it("returns 500 on database errors for expiry and refunds, ignores other events", async () => {
    const failing = deps(null, {
      rpc: vi.fn(async () => ({ data: null, error: { message: "x" } })),
    });
    const s1 = signed({
      id: "e",
      type: "checkout.session.expired",
      data: { object: { id: "cs" } },
    });
    expect((await handleStripeWebhook(s1.payload, s1.signature, failing.d)).status).toBe(500);
    const s2 = signed({
      id: "e",
      type: "charge.refunded",
      data: { object: { payment_intent: "pi", amount_refunded: 1 } },
    });
    expect((await handleStripeWebhook(s2.payload, s2.signature, failing.d)).status).toBe(500);
    const s3 = signed({ id: "e", type: "customer.created", data: { object: {} } });
    expect((await handleStripeWebhook(s3.payload, s3.signature, failing.d)).body.result).toBe(
      "ignored",
    );
  });
});
