import React from "react";

const ADMIN_COLORS = {
  header: "#040c18",
  blue: "#4F8CFF",
  text: "#e8edf5",
  muted: "rgba(232,237,245,0.45)"
};

export default function AdminTopBar({ left, center, right, infoBanner }: { left: React.ReactNode, center: React.ReactNode, right: React.ReactNode, infoBanner?: React.ReactNode }) {
  return (
    <div style={{ background: ADMIN_COLORS.header, borderBottom: "1px solid rgba(79,140,255,0.1)", position: "sticky", top: 0, zIndex: 100 }}>
      {infoBanner && (
        <div style={{ background: "rgba(79,140,255,0.08)", borderLeft: "3px solid #4F8CFF", display: "flex", alignItems: "center", padding: "7px 18px", fontSize: 13, color: ADMIN_COLORS.blue }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ marginRight: 8 }}><circle cx="12" cy="12" r="10" stroke="#4F8CFF" strokeWidth="2"/><path d="M12 8v4m0 4h.01" stroke="#4F8CFF" strokeWidth="2" strokeLinecap="round"/></svg>
          <span>{infoBanner}</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", height: 64, padding: "0 32px" }}>
        <div style={{ flex: 1 }}>{left}</div>
        <div style={{ flex: 2, display: "flex", justifyContent: "center" }}>{center}</div>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>{right}</div>
      </div>
    </div>
  );
}
