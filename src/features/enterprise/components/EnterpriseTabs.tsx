import React from "react";
import { COLORS } from "./colors";

const tabs = [
  "Overview",
  "Campaigns",
  "Leads",
  "Wallet",
  "Transactions",
  "Inventory",
  "Profile"
];

export const EnterpriseTabs: React.FC<{
  active: string;
  onTab: (tab: string) => void;
}> = React.memo(({ active, onTab }) => (
  <div style={{
    display: "flex",
    borderBottom: `1px solid rgba(201,168,76,0.2)`,
    overflowX: "auto",
    background: COLORS.bgSecondary
  }}>
    {tabs.map(tab => (
      <div
        key={tab}
        onClick={() => onTab(tab)}
        style={{
          padding: "18px 32px 12px 32px",
          cursor: "pointer",
          fontWeight: 700,
          fontFamily: "Syne, sans-serif",
          color: active === tab ? "#fff" : "#9aa4b2",
          borderBottom: active === tab ? `2px solid ${COLORS.gold}` : "2px solid transparent",
          boxShadow: active === tab ? `0 2px 12px 0 ${COLORS.gold}33` : undefined,
          transition: "color 0.2s, border-bottom 0.2s, box-shadow 0.2s"
        }}
        onMouseOver={e => {
          if (active !== tab) (e.currentTarget as HTMLElement).style.color = "#fff";
        }}
        onMouseOut={e => {
          if (active !== tab) (e.currentTarget as HTMLElement).style.color = "#9aa4b2";
        }}
      >
        {tab}
      </div>
    ))}
  </div>
));

EnterpriseTabs.displayName = "EnterpriseTabs";
