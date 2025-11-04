import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import Toast, { ToastData, ToastKind } from "../components/Toast";

type ToastAPI = {
  show: (message: string, kind?: ToastKind, duration?: number) => number;
  success: (message: string, duration?: number) => number;
  error: (message: string, duration?: number) => number;
  info: (message: string, duration?: number) => number;
  close: (id: number) => void;
};

const Ctx = createContext<ToastAPI>({
  show: () => 0, success: () => 0, error: () => 0, info: () => 0, close: () => {}
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastData[]>([]);
  const seq = useRef(1);

  const close = useCallback((id: number) => {
    setItems(curr => curr.filter(t => t.id !== id));
  }, []);

  const show = useCallback<ToastAPI["show"]>((message, kind = "info", duration = 5000) => {
    const id = seq.current++;
    setItems(curr => [...curr, { id, message, kind, duration }]);
    return id;
  }, []);

  const api = useMemo<ToastAPI>(() => ({
    show,
    success: (m, d) => show(m, "success", d),
    error: (m, d) => show(m, "error", d),
    info: (m, d) => show(m, "info", d),
    close,
  }), [show, close]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {/* Container no canto INFERIOR ESQUERDO (como nas imagens) */}
      <div style={{
        position: "fixed",
        left: 16,
        bottom: 16,
        display: "grid",
        gap: 10,
        zIndex: 9999,
        maxWidth: "min(92vw, 420px)"
      }}>
        {items.map(t => (
          <Toast key={t.id} {...t} onClose={close} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
