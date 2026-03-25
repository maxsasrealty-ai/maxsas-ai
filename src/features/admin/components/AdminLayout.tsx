import React from "react";

const ADMIN_COLORS = {
  bg: "#050d1a",
  header: "#040c18",
  card: "linear-gradient(135deg, rgba(12,26,46,0.85) 0%, rgba(10,21,37,0.85) 100%)",
  cardGlass: "linear-gradient(135deg, rgba(12,26,46,0.55) 0%, rgba(79,140,255,0.18) 100%)",
  blue: "#4F8CFF",
  green: "#00D084",
  amber: "#F59E0B",
  red: "#EF4444",
  purple: "#7C3AED",
  text: "#e8edf5",
  muted: "rgba(232,237,245,0.45)"
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: ADMIN_COLORS.bg,
      minHeight: "100vh",
      padding: 24,
      boxSizing: "border-box"
    }}>
      {children}
    </div>
  );
}
