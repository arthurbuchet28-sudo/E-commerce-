"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ToastProvider, useToast } from "@/components/ui/Toast";

export function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Ouvrir la fenêtre d’exemple
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Supprimer ma simulation ?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Conserver ma simulation
            </Button>
            <Button onClick={() => setOpen(false)}>Supprimer ma simulation</Button>
          </>
        }
      >
        <p>Cette simulation sera définitivement supprimée de votre compte.</p>
      </Modal>
    </>
  );
}

function ToastButtons() {
  const { notify } = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => notify("Votre simulation est enregistrée.")}>
        Afficher une confirmation
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          notify("L’enregistrement a échoué. Vérifiez votre connexion puis réessayez.", "error")
        }
      >
        Afficher une erreur
      </Button>
    </div>
  );
}

export function ToastDemo() {
  return (
    <ToastProvider>
      <ToastButtons />
    </ToastProvider>
  );
}

/** Review helper: forces the whole page theme (not persisted). */
export function ThemeSwitch() {
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);
  return (
    <fieldset className="flex flex-wrap items-center gap-4 text-small">
      <legend className="sr-only">Thème d’affichage de la page</legend>
      {(["system", "light", "dark"] as const).map((t) => (
        <label key={t} className="flex items-center gap-2">
          <input
            type="radio"
            name="theme"
            checked={theme === t}
            onChange={() => setTheme(t)}
            className="size-4 accent-ink"
          />
          {t === "system" ? "Thème du système" : t === "light" ? "Clair" : "Sombre"}
        </label>
      ))}
    </fieldset>
  );
}
