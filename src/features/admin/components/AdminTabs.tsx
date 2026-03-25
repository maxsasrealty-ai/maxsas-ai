
const ADMIN_COLORS = {
  blue: "#4F8CFF",
  text: "#e8edf5",
  muted: "rgba(232,237,245,0.45)"
};

export default function AdminTabs({ tabs, active, onTab }: { tabs: string[], active: string, onTab: (tab: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {tabs.map(tab => (
        <div
          key={tab}
          onClick={() => onTab(tab)}
          style={{
            padding: "0 18px",
            height: 48,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 15,
            color: active === tab ? ADMIN_COLORS.text : ADMIN_COLORS.muted,
            borderBottom: active === tab ? `2px solid ${ADMIN_COLORS.blue}` : "2px solid transparent",
            background: active === tab ? "rgba(79,140,255,0.08)" : "transparent",
            transition: "all 0.2s",
            fontFamily: "Syne, sans-serif"
          }}
          onMouseOver={e => {
            if (active !== tab) (e.currentTarget as HTMLDivElement).style.color = ADMIN_COLORS.text;
          }}
          onMouseOut={e => {
            if (active !== tab) (e.currentTarget as HTMLDivElement).style.color = ADMIN_COLORS.muted;
          }}
        >
          {tab}
        </div>
      ))}
    </div>
  );
}
