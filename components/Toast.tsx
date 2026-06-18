"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle, Info, AlertTriangle, Close } from "@/components/icons";

type ToastKind = "success" | "error" | "info";

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Fire a transient toast from anywhere under <ToastProvider>. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  // Render-safe no-op fallback if used outside the provider.
  return ctx ?? { toast: () => {} };
}

const ICON = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
} as const;

const ACCENT = {
  success: "var(--color-green)",
  error: "var(--color-danger)",
  info: "var(--color-gold)",
} as const;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);
  const idRef = useRef(0);

  useEffect(() => setMounted(true), []);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, kind, message }]);
      window.setTimeout(() => remove(id), 4500);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6">
            {toasts.map((t) => {
              const Icon = ICON[t.kind];
              return (
                <div
                  key={t.id}
                  role="status"
                  className="toast-in panel pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl px-4 py-3"
                >
                  <Icon
                    className="mt-0.5 h-[18px] w-[18px] shrink-0"
                    style={{ color: ACCENT[t.kind] }}
                  />
                  <p className="flex-1 text-[13.5px] leading-snug text-tprimary">
                    {t.message}
                  </p>
                  <button
                    onClick={() => remove(t.id)}
                    aria-label="Dismiss"
                    className="-mr-1 -mt-0.5 rounded-md p-1 text-tfaint transition-colors hover:text-tprimary"
                  >
                    <Close className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
