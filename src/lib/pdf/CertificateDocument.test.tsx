// @vitest-environment node
import { renderToBuffer } from "@react-pdf/renderer";
import { describe, expect, it } from "vitest";

import { CertificateDocument } from "./CertificateDocument";

describe("certificate PDF", () => {
  it("renders a valid PDF", async () => {
    const buf = await renderToBuffer(
      <CertificateDocument
        holderName="Léa"
        courseTitle="Les bases du e-commerce"
        totalMinutes={90}
        issuedAt="2026-09-29T10:00:00Z"
        serial="PV-2026-ABC"
        siteName="Première Vente"
        publisher="Éditeur"
        nda={null}
      />,
    );
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
  }, 30_000);
});
