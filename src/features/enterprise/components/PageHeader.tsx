import React from "react";
import { COLORS } from "./colors";

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  client?: string;
}> = React.memo(({ title, subtitle, client }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
    <div style={{
      borderLeft: `3px solid ${COLORS.gold}`,
      paddingLeft: 12
    }}>
      <div style={{
        fontFamily: "Syne, sans-serif",
        fontWeight: 800,
        fontSize: 28,
        color: "#fff"
      }}>{title}</div>
      {subtitle && <div style={{ fontFamily: "DM Sans, sans-serif", color: "#9aa4b2", fontSize: 16 }}>{subtitle}</div>}
    </div>
    {client && (
      <span style={{
        marginLeft: 24,
        fontFamily: "monospace",
        background: COLORS.bgSecondary,
        border: `1px solid ${COLORS.gold}`,
        padding: "4px 10px",
        borderRadius: 999,
        color: COLORS.gold,
        fontSize: 14
      }}>{client}</span>
    )}
  </div>
));

PageHeader.displayName = "PageHeader";
