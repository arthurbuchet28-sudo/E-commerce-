"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useParcoursProgress } from "@/lib/parcours/useParcoursProgress";

export function ResetProgress() {
  const { reset, overall } = useParcoursProgress();
  const [open, setOpen] = useState(false);
  if (overall.checked === 0) return null;
  return (
    <>
      <Button variant="quiet" onClick={() => setOpen(true)}>
        Effacer ma progression
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Effacer ma progression ?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Garder ma progression
            </Button>
            <Button
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Effacer ma progression
            </Button>
          </>
        }
      >
        <p>Toutes les cases cochées du parcours seront décochées dans ce navigateur.</p>
      </Modal>
    </>
  );
}
