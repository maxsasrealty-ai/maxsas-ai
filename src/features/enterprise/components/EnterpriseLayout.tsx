import React from "react";
import { COLORS } from "./colors";

const layoutStyle: React.CSSProperties = {
  minHeight: "100vh",
  width: "100vw",
  background: `linear-gradient(135deg, ${COLORS.bgPrimary}, ${COLORS.bgSecondary})`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: 24,
  boxSizing: "border-box",
  overflowX: "hidden"
};

const containerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 1400,
  margin: "0 auto",
  flex: 1,
  display: "flex",
  flexDirection: "column"
};

export const EnterpriseLayout: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => (
  <div style={layoutStyle}>
    <div style={containerStyle}>{children}</div>
  </div>
));
