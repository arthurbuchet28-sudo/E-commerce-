"use client";

import { Download } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { checklistItemCount, launchChecklist } from "@/data/checklist";
import { useLocalString } from "@/lib/storage/useLocalJson";

const KEY = "checklist-lancement:v1";

function parse(raw: string | null): Set<string> {
  try {
    const ids = JSON.parse(raw ?? "[]") as unknown;
    return new Set(Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

/** Tool 6 — interactive launch checklist, saved in the browser, exportable as PDF. */
export function LaunchChecklist({ siteName }: { siteName: string }) {
  const [raw, write] = useLocalString(KEY);
  const checked = useMemo(() => parse(raw), [raw]);
  const [exporting, setExporting] = useState<"idle" | "busy" | "error">("idle");

  function toggle(id: string) {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    write(JSON.stringify([...next]));
  }

  async function exportPdf() {
    setExporting("busy");
    try {
      const { checklistPdfBlob } = await import("@/lib/pdf/checklistPdf");
      const url = URL.createObjectURL(await checklistPdfBlob(checked, siteName));
      const a = document.createElement("a");
      a.href = url;
      a.download = "checklist-lancement.pdf";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExporting("idle");
    } catch {
      setExporting("error");
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col gap-8">
        {launchChecklist.map((group) => {
          const done = group.items.filter((i) => checked.has(i.id)).length;
          return (
            <fieldset key={group.id} className="rounded-ui border border-line bg-sheet p-5">
              <legend className="px-1 font-serif text-h3 font-semibold text-ink">
                {group.title}
              </legend>
              <p className="mb-3 text-small text-muted">
                {done} sur {group.items.length}
              </p>
              <ul className="flex flex-col gap-3">
                {group.items.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <input
                      id={`cl-${item.id}`}
                      type="checkbox"
                      checked={checked.has(item.id)}
                      onChange={() => toggle(item.id)}
                      className="mt-0.5 size-5 shrink-0 accent-sage"
                    />
                    <label htmlFor={`cl-${item.id}`}>{item.label}</label>
                  </li>
                ))}
              </ul>
            </fieldset>
          );
        })}
      </div>
      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-ui border border-line bg-sheet p-5">
          <ProgressBar
            value={checked.size}
            max={checklistItemCount}
            label={`${checked.size} points validés sur ${checklistItemCount}`}
          />
        </div>
        <Button onClick={exportPdf} disabled={exporting === "busy"} variant="secondary">
          <Download aria-hidden className="size-5" />
          {exporting === "busy" ? "Préparation du PDF…" : "Télécharger ma checklist en PDF"}
        </Button>
        <p aria-live="polite" className="text-small text-danger">
          {exporting === "error" && "Le PDF n’a pas pu être créé. Réessayez, ou imprimez la page."}
        </p>
        <p className="text-small text-muted">
          Votre progression est enregistrée dans ce navigateur, sans compte ni cookie.
        </p>
        {checked.size > 0 && (
          <Button variant="quiet" onClick={() => write(null)}>
            Tout décocher
          </Button>
        )}
      </aside>
    </div>
  );
}
