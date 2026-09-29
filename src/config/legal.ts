import { getRef } from "@/data/reference";

/** Version of the CGU accepted at sign-up, stored with the acceptance date (consent log). */
export const CGU_VERSION = "2026-09-trame";

/** Version of the CGV accepted at checkout (stored on the order and in the consent log). */
export const CGV_VERSION = "2026-09-trame";

/**
 * Express consent to immediate access + express waiver of the withdrawal right, for digital
 * content supplied without a physical medium. The exact text is versioned: change the
 * version whenever the wording changes. [À VÉRIFIER — art. L221-28 13° C. conso]
 */
export const WAIVER_TEXT_VERSION = "2026-09-v1";

export function withdrawalDays(): number {
  return getRef("conso.delaiRetractation").value as number;
}

export function refundDays(): number {
  return getRef("conso.delaiRemboursement").value as number;
}

export function waiverText(): string {
  return `Je demande à accéder immédiatement à la formation, avant la fin du délai de rétractation de ${withdrawalDays()} jours, et je renonce expressément à mon droit de rétractation dès que j’aurai commencé à la suivre (ouverture d’une première leçon).`;
}
