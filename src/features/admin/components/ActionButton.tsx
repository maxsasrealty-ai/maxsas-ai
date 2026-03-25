import React from "react";

export default function ActionButton({ children, color = "#4F8CFF", outline = false, onClick, style }: { children: React.ReactNode, color?: string, outline?: boolean, onClick?: () => void, style?: React.CSSProperties }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: outline ? "transparent" : `linear-gradient(135deg, ${color}, #2563eb)`,
        color: outline ? color : "#fff",
        border: outline ? `2px solid ${color}` : "none",
        borderRadius: 10,
        padding: "11px 24px",
        fontSize: 15,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "Syne, sans-serif",
        boxShadow: outline ? undefined : `0 4px 24px ${color}33`,
        transition: "all 0.2s",
        ...style
      }}
      onMouseOver={e => {
        if (!outline) (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 32px ${color}55`;
      }}
      onMouseOut={e => {
        if (!outline) (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 24px ${color}33`;
      }}
    >
      {children}
    </button>
  );
}
