import React from "react";

const ADMIN_COLORS = {
  bg: "rgba(79,140,255,0.06)",
  border: "rgba(79,140,255,0.2)",
  focus: "#4F8CFF",
  text: "#e8edf5",
  muted: "rgba(232,237,245,0.45)"
};

export default function InputField({ label, value, onChange, placeholder, type = "text", style }: { label?: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string, style?: React.CSSProperties }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <div style={{ color: ADMIN_COLORS.muted, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{label}</div>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: 10,
          background: ADMIN_COLORS.bg,
          border: `1.5px solid ${ADMIN_COLORS.border}`,
          color: ADMIN_COLORS.text,
          fontSize: 15,
          fontWeight: 600,
          outline: "none",
          transition: "all 0.2s",
          ...style
        }}
        onFocus={e => (e.target.style.border = `1.5px solid ${ADMIN_COLORS.focus}`)}
        onBlur={e => (e.target.style.border = `1.5px solid ${ADMIN_COLORS.border}`)}
      />
    </div>
  );
}
