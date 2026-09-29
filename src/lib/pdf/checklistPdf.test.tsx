// @vitest-environment node
import { renderToBuffer } from "@react-pdf/renderer";
import { describe, expect, it } from "vitest";

import { launchChecklist } from "@/data/checklist";

import { ChecklistDocument } from "./ChecklistDocument";

describe("checklist PDF", () => {
  it("renders a valid PDF with French characters", async () => {
    const buffer = await renderToBuffer(
      <ChecklistDocument
        groups={launchChecklist}
        checked={new Set(["siret"])}
        siteName="Première Vente"
        date="29 septembre 2026"
      />,
    );
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
    expect(buffer.length).toBeGreaterThan(2000);
  }, 30_000);
});
