import { useEffect } from "react";

export type ToastKind = "success" | "error" | "info";

export type ToastData = {
  id: number;
  message: string;
  kind?: ToastKind;
  duration?: number;
};

export default function Toast({
  id,
  message,
  kind = "info",
  duration = 5000,
  onClose,
}: ToastData & { onClose: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(t);
  }, [id, duration, onClose]);

  const bg =
    kind === "success" ? "#1f8f3a" :
    kind === "error"   ? "#b91c1c" :
                         "#374151";

  const icon = kind === "success"
    ? "✓"
    : kind === "error"
    ? "⚠"
    : "ℹ";

  return (
    <div className="toast-item" style={{
      background: bg,
      color: "#fff",
      borderRadius: 6,
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 12px",
      minWidth: 280,
      boxShadow: "0 10px 25px rgba(0,0,0,.25)",
      animation: "toast-in .25s ease-out",
    }}>
      <span style={{
        display: "inline-grid",
        placeItems: "center",
        width: 22, height: 22,
        borderRadius: "50%",
        background: "rgba(255,255,255,.15)",
        fontWeight: 700
      }}>
        {icon}
      </span>
      <div style={{flex: 1, fontWeight: 600}}>{message}</div>
      <button
        aria-label="Fechar"
        onClick={() => onClose(id)}
        style={{
          background: "transparent",
          border: 0,
          color: "rgba(255,255,255,.9)",
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        ×
      </button>
      <style>
        {`@keyframes toast-in { from {opacity:0; transform: translateX(-10px)} to {opacity:1; transform: translateX(0)} }`}
      </style>
    </div>
  );
}
