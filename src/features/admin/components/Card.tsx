import React from "react";

const ADMIN_COLORS = {
  card: "linear-gradient(135deg, rgba(12,26,46,0.55) 0%, rgba(79,140,255,0.18) 100%)",
  border: "rgba(79,140,255,0.15)",
  borderHover: "rgba(79,140,255,0.35)",
  text: "#e8edf5"
};

export default function Card({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      style={{
        background: ADMIN_COLORS.card,
        border: `1.5px solid ${hover ? ADMIN_COLORS.borderHover : ADMIN_COLORS.border}`,
        borderRadius: 16,
        padding: 24,
        boxShadow: hover ? "0 12px 32px rgba(79,140,255,0.1)" : "0 4px 16px rgba(79,140,255,0.06)",
        transition: "all 0.2s",
        color: ADMIN_COLORS.text,
        ...style
      }}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      {children}
    </div>
  );
}
