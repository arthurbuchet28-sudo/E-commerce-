"use client";

import { CircleAlert, CircleCheck, X } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import { cn } from "./cn";

type Toast = { id: number; message: string; tone: "success" | "error" };
type ToastApi = { notify: (message: string, tone?: Toast["tone"]) => void };

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/**
 * Toasts are announced through a polite live region that is always in the DOM.
 * They stay until dismissed (no timeout: users need time to read, WCAG 2.2.1).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, tone: Toast["tone"] = "success") => {
    setToasts((t) => [...t, { id: Date.now() + Math.random(), message, tone }]);
  }, []);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="fixed right-4 bottom-4 left-4 z-50 flex flex-col items-end gap-2 sm:left-auto"
      >
        {toasts.map((t) => {
          const Icon = t.tone === "success" ? CircleCheck : CircleAlert;
          return (
            <div
              key={t.id}
              className={cn(
                "flex w-full max-w-sm items-start gap-3 rounded-ui border border-l-[6px] bg-sheet p-4 text-text",
                t.tone === "success" ? "border-sage" : "border-danger",
              )}
            >
              <Icon
                aria-hidden
                className={cn(
                  "mt-0.5 size-5 shrink-0",
                  t.tone === "success" ? "text-sage" : "text-danger",
                )}
              />
              <p className="flex-1">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="-m-2 flex size-11 shrink-0 items-center justify-center rounded-ui hover:bg-ink-soft"
              >
                <X aria-hidden className="size-4" />
                <span className="sr-only">Fermer la notification</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
