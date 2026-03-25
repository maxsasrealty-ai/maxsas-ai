import React from "react";
import { COLORS } from "./colors";

export const StatCard: React.FC<{
  label: string;
  value: string | number;
}> = React.memo(({ label, value }) => (
  <div
    style={{
      background: `linear-gradient(145deg, ${COLORS.bgCard}, ${COLORS.bgSecondary})`,
      border: `1px solid rgba(201,168,76,0.3)`,
      borderRadius: 16,
      padding: 20,
      minWidth: 160,
      margin: 8,
      transition: "transform 0.15s, box-shadow 0.15s",
      cursor: "pointer"
    }}
    onMouseOver={e => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(201,168,76,0.15)";
    }}
    onMouseOut={e => {
      (e.currentTarget as HTMLElement).style.transform = "none";
      (e.currentTarget as HTMLElement).style.boxShadow = "none";
    }}
  >
    <div style={{ fontSize: 10, letterSpacing: 2, color: "rgba(201,168,76,0.7)", marginBottom: 8 }}>{label}</div>
    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, color: "#fff" }}>{value}</div>
  </div>
));

StatCard.displayName = "StatCard";
