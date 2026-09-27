/** Fixed corner badge so the client can tell concepts apart. Every concept renders one. */
export function ConceptBadge({ number, name, corner = "bottom-left" }: { number: number; name: string; corner?: "bottom-left" | "bottom-right" | "top-right" }) {
  const pos: React.CSSProperties =
    corner === "bottom-right" ? { right: 10, bottom: 10 } : corner === "top-right" ? { right: 10, top: 10 } : { left: 10, bottom: 10 };
  return (
    <div
      aria-label={`Concept ${number}: ${name}`}
      style={{
        position: "fixed",
        zIndex: 9999,
        padding: "4px 10px",
        font: "600 11px/1.4 Inter, system-ui, sans-serif",
        letterSpacing: ".12em",
        textTransform: "uppercase",
        background: "#000",
        color: "#fff",
        border: "1px solid rgba(255,255,255,.35)",
        borderRadius: 4,
        pointerEvents: "none",
        ...pos,
      }}
    >
      Concept #{number} — {name}
    </div>
  );
}
