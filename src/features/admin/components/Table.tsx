import React from "react";

const ADMIN_COLORS = {
  header: "#0a1525",
  rowHover: "rgba(79,140,255,0.05)",
  border: "rgba(79,140,255,0.15)",
  text: "#e8edf5",
  muted: "rgba(232,237,245,0.45)"
};

export default function Table({ columns, data, renderRow }: { columns: string[], data: any[], renderRow: (row: any, idx: number) => React.ReactNode }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${ADMIN_COLORS.border}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead>
          <tr style={{ background: ADMIN_COLORS.header }}>
            {columns.map(col => (
              <th key={col} style={{ textAlign: "left", padding: "14px 20px", fontSize: 13, color: ADMIN_COLORS.muted, fontWeight: 700 }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} style={{ transition: "background 0.2s", cursor: "pointer" }}
              onMouseOver={e => (e.currentTarget.style.background = ADMIN_COLORS.rowHover)}
              onMouseOut={e => (e.currentTarget.style.background = "")}
            >
              {renderRow(row, idx)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
