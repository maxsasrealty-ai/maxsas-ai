import React from "react";

const ADMIN_COLORS = {
  card: "linear-gradient(135deg, rgba(12,26,46,0.85) 0%, rgba(79,140,255,0.18) 100%)",
  blue: "#4F8CFF",
  green: "#00D084",
  amber: "#F59E0B",
  red: "#EF4444",
  text: "#e8edf5",
  muted: "rgba(232,237,245,0.45)"
};

export default function StatCard({ label, value, tone, icon, children }: { label: string, value: string, tone: string, icon?: React.ReactNode, children?: React.ReactNode }) {
  return (
    <div style={{
      background: ADMIN_COLORS.card,
      border: "1px solid rgba(79,140,255,0.15)",
      borderRadius: 16,
      padding: 24,
      minWidth: 180,
      boxShadow: "0 8px 32px rgba(79,140,255,0.08)",
      transition: "all 0.2s",
      color: ADMIN_COLORS.text,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      alignItems: "flex-start"
    }}>
      <div style={{ fontSize: 13, color: ADMIN_COLORS.muted, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 34, color: tone, display: "flex", alignItems: "center", gap: 8 }}>{icon}{value}</div>
      {children}
    </div>
  );
}
